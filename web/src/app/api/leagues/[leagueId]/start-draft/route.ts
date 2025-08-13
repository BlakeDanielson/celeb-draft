import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function POST(_req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
    const { leagueId } = await context.params;
    // Accept either invite token or actual league id
    const league = await prisma.league.findFirst({ where: { OR: [{ joinToken: leagueId }, { id: leagueId }] } });
    if (!league) {
        return NextResponse.json({ error: "league not found" }, { status: 404 });
    }
    if (league.status !== "setup") {
        return NextResponse.json({ error: "league not in setup" }, { status: 409 });
    }
	const teams = await prisma.team.findMany({ where: { leagueId: league.id }, orderBy: { joinedAt: "asc" } });
    if (teams.length < 2) {
        return NextResponse.json({ error: "need at least 2 teams" }, { status: 409 });
    }
	// randomize positions
	const shuffled = [...teams].sort(() => Math.random() - 0.5);
	await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		for (let i = 0; i < shuffled.length; i++) {
			await tx.team.update({ where: { id: shuffled[i].id }, data: { draftPosition: i + 1 } });
		}
		await tx.league.update({ where: { id: league.id }, data: { status: "drafting" } });
	});
	return NextResponse.json({ ok: true });
}


