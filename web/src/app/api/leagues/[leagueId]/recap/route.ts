import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { leagueId: string } }) {
	const leagueId = params.leagueId;
	const [league, picks, teams] = await Promise.all([
		prisma.league.findUnique({ where: { id: leagueId } }),
		prisma.draftPick.findMany({ where: { leagueId }, orderBy: { overall: "asc" } }),
		prisma.team.findMany({ where: { leagueId } }),
	]);
	if (!league) {
		return NextResponse.json({ error: "not found" }, { status: 404 });
	}
	return NextResponse.json({ league, picks, teams });
}


