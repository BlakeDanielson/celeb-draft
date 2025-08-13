import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TeamRow = { joinedAt: string | Date };
type PickRow = { pickedAt: string | Date };

export async function GET(_req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
	const { leagueId } = await context.params;
	const [league, teams, picks] = await Promise.all([
		prisma.league.findUnique({ where: { id: leagueId } }),
		prisma.team.findMany({ where: { leagueId }, orderBy: { draftPosition: "asc" } }),
		prisma.draftPick.findMany({ where: { leagueId }, orderBy: { overall: "asc" } }),
	]);
	if (!league) {
		return NextResponse.json({ error: "not found" }, { status: 404 });
	}
	const currentPickOverall = picks.length + 1;
	const teamTimes = (teams as TeamRow[]).map((team) => new Date(team.joinedAt).getTime());
	const pickTimes = (picks as PickRow[]).map((pick) => new Date(pick.pickedAt).getTime());
	const lastUpdated = new Date(
		Math.max(new Date(league.createdAt).getTime(), ...teamTimes, ...pickTimes)
	).toISOString();
	return NextResponse.json({ league, teams, picks, currentPickOverall, lastUpdated });
}


