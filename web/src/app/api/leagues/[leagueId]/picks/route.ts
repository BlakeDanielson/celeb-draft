import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
	const body = await req.json();
	const teamId = String(body?.teamId ?? "");
	const celebrityId = String(body?.celebrityId ?? "");
	if (!teamId || !celebrityId) {
		return NextResponse.json({ error: "teamId and celebrityId required" }, { status: 400 });
	}
	const { leagueId } = await context.params;
	const league = await prisma.league.findUnique({ where: { id: leagueId } });
	if (!league || league.status !== "drafting") {
		return NextResponse.json({ error: "league not drafting" }, { status: 400 });
	}
	const team = await prisma.team.findUnique({ where: { id: teamId } });
	const celeb = await prisma.celebrity.findUnique({ where: { id: celebrityId } });
	if (!team || !celeb || team.leagueId !== league.id || celeb.leagueId !== league.id) {
		return NextResponse.json({ error: "invalid team or celebrity" }, { status: 400 });
	}
	const existingPick = await prisma.draftPick.findFirst({ where: { leagueId: league.id, celebrityId } });
	if (existingPick) {
		return NextResponse.json({ error: "celebrity already picked" }, { status: 409 });
	}
	// compute next overall and simple snake-turn validation
	const [pickCount, teams] = await Promise.all([
		prisma.draftPick.count({ where: { leagueId: league.id } }),
		prisma.team.findMany({ where: { leagueId: league.id }, orderBy: { draftPosition: "asc" } }),
	]);
	const teamCount = teams.length;
	if (teamCount === 0) {
		return NextResponse.json({ error: "no teams" }, { status: 400 });
	}
	const overall = pickCount + 1;
	const round = Math.ceil(overall / teamCount);
	const indexInRound = (overall - 1) % teamCount;
	const expectedIndex = round % 2 === 1 ? indexInRound : (teamCount - 1 - indexInRound);
	const expectedTeam = teams[expectedIndex];
	if (expectedTeam?.id !== teamId) {
		return NextResponse.json({ error: "not your turn" }, { status: 409 });
	}
	const pick = await prisma.draftPick.create({ data: { leagueId: league.id, round, overall, teamId, celebrityId } });
	return NextResponse.json(pick);
}


