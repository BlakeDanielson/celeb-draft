import { prisma } from "@/lib/prisma";

export async function listPicksByLeague(leagueId: string) {
	return prisma.draftPick.findMany({ where: { leagueId }, orderBy: { overall: "asc" } });
}

export async function countPicksByLeague(leagueId: string) {
	return prisma.draftPick.count({ where: { leagueId } });
}

export async function findPickByCelebrity(leagueId: string, celebrityId: string) {
	return prisma.draftPick.findFirst({ where: { leagueId, celebrityId } });
}

export async function createPick(params: { leagueId: string; round: number; overall: number; teamId: string; celebrityId: string }) {
	const { leagueId, round, overall, teamId, celebrityId } = params;
	return prisma.draftPick.create({ data: { leagueId, round, overall, teamId, celebrityId } });
}


