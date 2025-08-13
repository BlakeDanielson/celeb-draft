import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { leagueId: string } }) {
	const leagueId = params.leagueId;
	const [league, teams, picks] = await Promise.all([
		prisma.league.findUnique({ where: { id: leagueId } }),
		prisma.team.findMany({ where: { leagueId }, orderBy: { draftPosition: "asc" } }),
		prisma.draftPick.findMany({ where: { leagueId }, orderBy: { overall: "asc" } }),
	]);
	if (!league) {
		return NextResponse.json({ error: "not found" }, { status: 404 });
	}
	const currentPickOverall = picks.length + 1;
	const lastUpdated = new Date(
		Math.max(
			new Date(league.createdAt).getTime(),
			...teams.map((t) => new Date(t.joinedAt).getTime()),
			...picks.map((p) => new Date(p.pickedAt).getTime()),
		)
	).toISOString();
	return NextResponse.json({ league, teams, picks, currentPickOverall, lastUpdated });
}


