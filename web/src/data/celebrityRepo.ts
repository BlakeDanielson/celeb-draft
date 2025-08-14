import { prisma } from "@/lib/prisma";

export async function getCelebrityById(id: string) {
	return prisma.celebrity.findUnique({ where: { id } });
}

export async function listCelebritiesByLeague(leagueId: string) {
	return prisma.celebrity.findMany({ where: { leagueId }, orderBy: { addedAt: "asc" } });
}

export async function createCelebrity(params: { leagueId: string; name: string; normalizedName: string; addedByTeamId: string }) {
	const { leagueId, name, normalizedName, addedByTeamId } = params;
	return prisma.celebrity.create({ data: { leagueId, name, normalizedName, addedByTeamId } });
}


