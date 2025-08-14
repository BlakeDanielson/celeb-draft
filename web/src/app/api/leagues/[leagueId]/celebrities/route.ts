import { NextRequest, NextResponse } from "next/server";
import { celebrityRepo } from "@/data";
import { normalizeName } from "@/lib/normalization";

export async function GET(_req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
    const { leagueId } = await context.params;
    const celebrities = await celebrityRepo.listCelebritiesByLeague(leagueId);
    return NextResponse.json({ celebrities });
}

export async function POST(req: NextRequest, context: { params: Promise<{ leagueId: string }> }) {
	const body = await req.json();
	const name = String(body?.name ?? "").trim();
	const addedByTeamId = String(body?.addedByTeamId ?? "").trim();
	if (!name || !addedByTeamId) {
		return NextResponse.json({ error: "name and addedByTeamId required" }, { status: 400 });
	}
	const normalizedName = normalizeName(name);
    try {
        const { leagueId } = await context.params;
        const celeb = await celebrityRepo.createCelebrity({ leagueId, name, normalizedName, addedByTeamId });
        return NextResponse.json(celeb);
    } catch {
		return NextResponse.json({ error: "duplicate or invalid" }, { status: 409 });
	}
}


