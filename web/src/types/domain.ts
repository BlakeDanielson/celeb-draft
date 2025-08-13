export type LeagueStatus = "setup" | "drafting" | "complete";

export interface LeagueDTO {
	id: string;
	name: string;
	joinToken: string;
	status: LeagueStatus;
	maxTeams: number;
	picksPerTeam: number;
	createdAt: string;
}

export interface TeamDTO {
	id: string;
	leagueId: string;
	displayName: string;
	draftPosition: number | null;
	joinedAt: string;
}

export interface CelebrityDTO {
	id: string;
	leagueId: string;
	name: string;
	addedByTeamId: string;
	addedAt: string;
}

export interface DraftPickDTO {
	id: string;
	leagueId: string;
	round: number;
	overall: number;
	teamId: string;
	celebrityId: string;
	pickedAt: string;
}

export interface DraftStateDTO {
	league: LeagueDTO;
	teams: TeamDTO[];
	picks: DraftPickDTO[];
	currentPickOverall: number;
	lastUpdated: string;
}


