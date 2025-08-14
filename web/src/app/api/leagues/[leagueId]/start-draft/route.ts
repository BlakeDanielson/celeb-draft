import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leagueRepo, teamRepo } from "@/data";
import type { Prisma } from "@prisma/client";

export async function POST(_req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
    const { leagueId } = await context.params;
    const body = await _req.json().catch(() => ({}));
    const requesterTeamId = String(body?.teamId || "").trim();
    // Accept either invite token or actual league id
    const league = await leagueRepo.getLeagueByJoinOrId(leagueId);
    if (!league) {
        return NextResponse.json({ error: "league not found" }, { status: 404 });
    }
    if (league.status !== "setup") {
        return NextResponse.json({ error: "league not in setup" }, { status: 409 });
    }
    const teams = await teamRepo.listTeamsByLeague(league.id, "joinedAt");
    if (teams.length < 2) {
        return NextResponse.json({ error: "need at least 2 teams" }, { status: 409 });
    }
    // Commissioner verification: first team to join the league (earliest joinedAt)
    if (!requesterTeamId) {
        return NextResponse.json({ error: "teamId required" }, { status: 400 });
    }
    const isTeamInLeague = teams.some((t: { id: string }) => t.id === requesterTeamId);
    if (!isTeamInLeague) {
        return NextResponse.json({ error: "team not in league" }, { status: 403 });
    }
    const commissionerTeamId = teams[0].id;
    if (commissionerTeamId !== requesterTeamId) {
        return NextResponse.json({ error: "only commissioner can start draft" }, { status: 403 });
    }
	// randomize positions
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		for (let i = 0; i < shuffled.length; i++) {
			await tx.team.update({ where: { id: shuffled[i].id }, data: { draftPosition: i + 1 } });
		}
		await tx.league.update({ where: { id: league.id }, data: { status: "drafting" } });
	});
    const order = shuffled.map((t: { id: string; displayName: string }, idx: number) => {
        return { id: t.id, displayName: t.displayName, draftPosition: idx + 1 };
    });
    return NextResponse.json({
        leagueId: league.id,
        status: "drafting",
        order,
        currentPickOverall: 1,
    });
}


