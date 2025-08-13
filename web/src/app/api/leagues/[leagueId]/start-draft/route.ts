import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { leagueId: string } }) {
	const league = await prisma.league.findUnique({ where: { id: params.leagueId } });
	if (!league || league.status !== "setup") {
		return NextResponse.json({ error: "league not in setup" }, { status: 400 });
	}
	const teams = await prisma.team.findMany({ where: { leagueId: league.id }, orderBy: { joinedAt: "asc" } });
	if (teams.length < 2) {
		return NextResponse.json({ error: "need at least 2 teams" }, { status: 400 });
	}
	// randomize positions
	const shuffled = [...teams].sort(() => Math.random() - 0.5);
	await prisma.$transaction(async (tx) => {
		for (let i = 0; i < shuffled.length; i++) {
			await tx.team.update({ where: { id: shuffled[i].id }, data: { draftPosition: i + 1 } });
		}
		await tx.league.update({ where: { id: league.id }, data: { status: "drafting" } });
	});
	return NextResponse.json({ ok: true });
}


