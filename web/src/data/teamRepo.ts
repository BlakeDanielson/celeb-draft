import { prisma } from "@/lib/prisma";

export async function getTeamById(id: string) {
	return prisma.team.findUnique({ where: { id } });
}

export async function listTeamsByLeague(leagueId: string, orderBy: "joinedAt" | "draftPosition" = "joinedAt") {
	if (orderBy === "draftPosition") {
		return prisma.team.findMany({ where: { leagueId }, orderBy: { draftPosition: "asc" } });
	}
	return prisma.team.findMany({ where: { leagueId }, orderBy: { joinedAt: "asc" } });
}

export async function countTeamsByLeague(leagueId: string) {
	return prisma.team.count({ where: { leagueId } });
}

export async function createTeam(params: { leagueId: string; displayName: string }) {
	const { leagueId, displayName } = params;
	return prisma.team.create({ data: { leagueId, displayName } });
}

export async function updateDraftPosition(id: string, draftPosition: number) {
	return prisma.team.update({ where: { id }, data: { draftPosition } });
}


