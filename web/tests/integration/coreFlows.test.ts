import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { setupTestDatabase, cleanupTestDatabase } from "../helpers/testDb";

// Import route handlers directly
import * as leaguesRoute from "@/app/api/leagues/route";
import * as joinRoute from "@/app/api/leagues/[leagueId]/join/route";
import * as celebritiesRoute from "@/app/api/leagues/[leagueId]/celebrities/route";
import * as startDraftRoute from "@/app/api/leagues/[leagueId]/start-draft/route";
import * as picksRoute from "@/app/api/leagues/[leagueId]/picks/route";
import * as draftStateRoute from "@/app/api/leagues/[leagueId]/draft-state/route";
import * as recapRoute from "@/app/api/leagues/[leagueId]/recap/route";

function nextJsonRequest(method: string, body?: unknown): NextRequest {
	const url = "http://localhost/test";
	return new NextRequest(url, {
		method,
		body: body ? JSON.stringify(body) : undefined,
		headers: { "Content-Type": "application/json" },
	});
}

describe("Core backend flows", () => {
	beforeAll(() => {
		setupTestDatabase();
	});

	afterAll(() => {
		cleanupTestDatabase();
	});

	it("create league -> join twice -> add/list celebrity -> start draft -> pick -> draft-state -> recap", async () => {
		// create league
		const createRes = await leaguesRoute.POST(nextJsonRequest("POST", { name: "Test League", maxTeams: 2 }));
		expect(createRes.ok).toBe(true);
		const league = await createRes.json() as any;
		expect(league?.id).toBeTruthy();
		expect(league?.joinToken).toBeTruthy();

		// join as commissioner using join token
		const joinRes1 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "Commish" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
		expect(joinRes1.ok).toBe(true);
		const { team: team1 } = await joinRes1.json() as any;
		expect(team1?.id).toBeTruthy();

		// join second team
		const joinRes2 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "Challenger" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
		expect(joinRes2.ok).toBe(true);
		const { team: team2 } = await joinRes2.json() as any;
		expect(team2?.id).toBeTruthy();

		// add celebrity
		const celebAddRes = await celebritiesRoute.POST(nextJsonRequest("POST", { name: "Tom Cruise", addedByTeamId: team1.id }), { params: Promise.resolve({ leagueId: league.id }) });
		expect(celebAddRes.ok).toBe(true);
		const celeb = await celebAddRes.json() as any;
		expect(celeb?.id).toBeTruthy();

		// list celebrities
		const celebListRes = await celebritiesRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
		expect(celebListRes.ok).toBe(true);
		const list = await celebListRes.json() as any;
		expect(Array.isArray(list?.celebrities)).toBe(true);
		expect(list.celebrities.length).toBe(1);

		// start draft (commissioner team id)
		const startRes = await startDraftRoute.POST(nextJsonRequest("POST", { teamId: team1.id }), { params: Promise.resolve({ leagueId: league.joinToken }) });
		expect(startRes.ok).toBe(true);
		const startData = await startRes.json() as any;
		expect(startData?.status).toBe("drafting");
		expect(startData?.order?.length).toBe(2);

		// draft-state after start
		const stateRes1 = await draftStateRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
		expect(stateRes1.ok).toBe(true);
		const state1 = await stateRes1.json() as any;
		expect(state1?.currentPickOverall).toBe(1);

		// first pick by the team up next
		const upNextTeamId: string = state1.upNextTeamId ?? team1.id;
		const pickRes = await picksRoute.POST(nextJsonRequest("POST", { teamId: upNextTeamId, celebrityId: celeb.id }), { params: Promise.resolve({ leagueId: league.id }) });
		expect(pickRes.ok).toBe(true);
		const pick = await pickRes.json() as any;
		expect(pick?.overall).toBe(1);

		// draft-state reflects the pick
		const stateRes2 = await draftStateRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
		expect(stateRes2.ok).toBe(true);
		const state2 = await stateRes2.json() as any;
		expect(state2?.currentPickOverall).toBe(2);

		// recap returns league, picks, teams
		const recapRes = await recapRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
		expect(recapRes.ok).toBe(true);
		const recap = await recapRes.json() as any;
		expect(Array.isArray(recap?.picks)).toBe(true);
		expect(recap.picks.length).toBe(1);
	});
});


