import { NextRequest, NextResponse } from "next/server";
import { leagueRepo, draftPickRepo, teamRepo } from "@/data";

export async function GET(_req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
    const { leagueId } = await context.params;
    const [league, picks, teams] = await Promise.all([
		leagueRepo.getLeagueById(leagueId),
		draftPickRepo.listPicksByLeague(leagueId),
		teamRepo.listTeamsByLeague(leagueId, "joinedAt"),
	]);
	if (!league) {
		return NextResponse.json({ error: "not found" }, { status: 404 });
	}
	return NextResponse.json({ league, picks, teams });
}


