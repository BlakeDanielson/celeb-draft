import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type TeamRow = { joinedAt: string | Date };
type PickRow = { pickedAt: string | Date };

export async function GET(req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
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
  // compute snake draft expected team index and id for client hints
  const teamCount = teams.length;
  let upNextTeamId: string | null = null;
  if (teamCount > 0) {
    const round = Math.ceil(currentPickOverall / teamCount);
    const indexInRound = (currentPickOverall - 1) % teamCount;
    const expectedIndex = round % 2 === 1 ? indexInRound : (teamCount - 1 - indexInRound);
    upNextTeamId = teams[expectedIndex]?.id ?? null;
  }
	const teamTimes = (teams as TeamRow[]).map((team) => new Date(team.joinedAt).getTime());
	const pickTimes = (picks as PickRow[]).map((pick) => new Date(pick.pickedAt).getTime());
	const lastUpdated = new Date(
		Math.max(new Date(league.createdAt).getTime(), ...teamTimes, ...pickTimes)
	).toISOString();
    // Conditional GET support via If-Modified-Since / Last-Modified
    const ifModifiedSince = req.headers.get("if-modified-since");
    if (ifModifiedSince) {
        const imsTime = Date.parse(ifModifiedSince);
        const lastUpdatedTime = Date.parse(lastUpdated);
        if (!Number.isNaN(imsTime) && !Number.isNaN(lastUpdatedTime) && imsTime >= lastUpdatedTime) {
            return new NextResponse(null, {
                status: 304,
                headers: {
                    "Last-Modified": lastUpdated,
                    "Cache-Control": "no-cache",
                },
            });
        }
    }

    const res = NextResponse.json(
        { league, teams, picks, currentPickOverall, lastUpdated, upNextTeamId },
        {
            headers: {
                "Last-Modified": lastUpdated,
                "Cache-Control": "no-cache",
            },
        }
    );
    return res;
}


