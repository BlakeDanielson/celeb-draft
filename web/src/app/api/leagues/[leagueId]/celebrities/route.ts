import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/normalization";

export async function GET(_req: NextRequest, { params }: { params: { leagueId: string } }) {
	const celebrities = await prisma.celebrity.findMany({ where: { leagueId: params.leagueId }, orderBy: { addedAt: "asc" } });
	return NextResponse.json({ celebrities });
}

export async function POST(req: NextRequest, { params }: { params: { leagueId: string } }) {
	const body = await req.json();
	const name = String(body?.name ?? "").trim();
	const addedByTeamId = String(body?.addedByTeamId ?? "").trim();
	if (!name || !addedByTeamId) {
		return NextResponse.json({ error: "name and addedByTeamId required" }, { status: 400 });
	}
	const normalizedName = normalizeName(name);
	try {
		const celeb = await prisma.celebrity.create({ data: { leagueId: params.leagueId, name, normalizedName, addedByTeamId } });
		return NextResponse.json(celeb);
	} catch (e) {
		return NextResponse.json({ error: "duplicate or invalid" }, { status: 409 });
	}
}


