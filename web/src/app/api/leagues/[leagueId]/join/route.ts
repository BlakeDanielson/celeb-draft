import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
	const body = await _req.json();
	const displayName = String(body?.displayName ?? "").trim();
	if (!displayName) {
		return NextResponse.json({ error: "displayName required" }, { status: 400 });
	}

	const { leagueId } = await context.params;
	// treat leagueId path as invite token for MVP
	const league = await prisma.league.findUnique({ where: { joinToken: leagueId } });
	if (!league || league.status !== "setup") {
		return NextResponse.json({ error: "invalid or unavailable invite" }, { status: 400 });
	}
	const teamCount = await prisma.team.count({ where: { leagueId: league.id } });
	if (teamCount >= league.maxTeams) {
		return NextResponse.json({ error: "league full" }, { status: 400 });
	}

    const team = await prisma.team.create({ data: { leagueId: league.id, displayName } });
    return NextResponse.json({ team, league, message: "joined" });
}


