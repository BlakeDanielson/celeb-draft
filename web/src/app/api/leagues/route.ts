import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateJoinToken(): string {
	return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const name = String(body?.name ?? "").trim();
	const maxTeams = Number(body?.maxTeams ?? 8);
	const picksPerTeam = 5;

	if (!name) {
		return NextResponse.json({ error: "name required" }, { status: 400 });
	}
	if (Number.isNaN(maxTeams) || maxTeams < 2 || maxTeams > 20) {
		return NextResponse.json({ error: "maxTeams must be 2-20" }, { status: 400 });
	}

	const league = await prisma.league.create({
		data: {
			name,
			joinToken: generateJoinToken(),
			status: "setup",
			maxTeams,
			picksPerTeam,
		},
	});

	return NextResponse.json(league);
}


