import { prisma } from "@/lib/prisma";
import type { LeagueStatus } from "@prisma/client";

export async function getLeagueById(id: string) {
	return prisma.league.findUnique({ where: { id } });
}

export async function getLeagueByJoinToken(joinToken: string) {
	return prisma.league.findUnique({ where: { joinToken } });
}

export async function getLeagueByJoinOrId(value: string) {
	return prisma.league.findFirst({ where: { OR: [{ joinToken: value }, { id: value }] } });
}

export async function createLeague(params: { name: string; maxTeams: number; picksPerTeam: number; joinToken: string }) {
	const { name, maxTeams, picksPerTeam, joinToken } = params;
	return prisma.league.create({
		data: { name, joinToken, status: "setup", maxTeams, picksPerTeam },
	});
}

export async function setLeagueStatus(leagueId: string, status: LeagueStatus) {
	return prisma.league.update({ where: { id: leagueId }, data: { status } });
}


