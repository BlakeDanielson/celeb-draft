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

  it("rejects duplicate celebrity name within league (case-insensitive, trimmed)", async () => {
    const createRes = await leaguesRoute.POST(nextJsonRequest("POST", { name: "Dup League", maxTeams: 2 }));
    const league = await createRes.json() as any;
    const joinRes1 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "A" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    const { team: t1 } = await joinRes1.json() as any;
    const joinRes2 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "B" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    await joinRes2.json();

    const ok = await celebritiesRoute.POST(nextJsonRequest("POST", { name: "  Tom  Cruise ", addedByTeamId: t1.id }), { params: Promise.resolve({ leagueId: league.id }) });
    expect(ok.ok).toBe(true);

    const dup = await celebritiesRoute.POST(nextJsonRequest("POST", { name: "tom cruise", addedByTeamId: t1.id }), { params: Promise.resolve({ leagueId: league.id }) });
    expect(dup.status).toBe(409);
  });

  it("blocks pick when not your turn and when celebrity already picked", async () => {
    const createRes = await leaguesRoute.POST(nextJsonRequest("POST", { name: "Turn League", maxTeams: 2 }));
    const league = await createRes.json() as any;
    // join two teams
    const j1 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "A" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    const { team: a } = await j1.json() as any;
    const j2 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "B" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    const { team: b } = await j2.json() as any;
    // add two celebs
    const c1 = await celebritiesRoute.POST(nextJsonRequest("POST", { name: "Alpha", addedByTeamId: a.id }), { params: Promise.resolve({ leagueId: league.id }) });
    const celeb1 = await c1.json() as any;
    const c2 = await celebritiesRoute.POST(nextJsonRequest("POST", { name: "Beta", addedByTeamId: a.id }), { params: Promise.resolve({ leagueId: league.id }) });
    const celeb2 = await c2.json() as any;
    // start draft by commissioner (first joiner)
    await startDraftRoute.POST(nextJsonRequest("POST", { teamId: a.id }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    // get state to know up next
    const s1 = await draftStateRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
    const state1 = await s1.json() as any;
    const upNextTeamId: string = state1.upNextTeamId;
    const notUpNext = upNextTeamId === a.id ? b.id : a.id;
    // wrong team tries to pick
    const wrongPick = await picksRoute.POST(nextJsonRequest("POST", { teamId: notUpNext, celebrityId: celeb1.id }), { params: Promise.resolve({ leagueId: league.id }) });
    expect(wrongPick.status).toBe(409);
    // correct team picks celeb1
    const okPick = await picksRoute.POST(nextJsonRequest("POST", { teamId: upNextTeamId, celebrityId: celeb1.id }), { params: Promise.resolve({ leagueId: league.id }) });
    expect(okPick.ok).toBe(true);
    // attempt to pick same celeb again
    const dupPick = await picksRoute.POST(nextJsonRequest("POST", { teamId: notUpNext, celebrityId: celeb1.id }), { params: Promise.resolve({ leagueId: league.id }) });
    expect(dupPick.status).toBe(409);
    // pick second celeb with the correct next team
    const s2 = await draftStateRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
    const state2 = await s2.json() as any;
    const upNext2: string = state2.upNextTeamId;
    const okPick2 = await picksRoute.POST(nextJsonRequest("POST", { teamId: upNext2, celebrityId: celeb2.id }), { params: Promise.resolve({ leagueId: league.id }) });
    expect(okPick2.ok).toBe(true);
  });

  it("supports ETag 304 behavior on draft-state", async () => {
    const createRes = await leaguesRoute.POST(nextJsonRequest("POST", { name: "Etag League", maxTeams: 2 }));
    const league = await createRes.json() as any;
    const j1 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "A" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    const { team: a } = await j1.json() as any;
    const j2 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "B" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    await j2.json();
    await startDraftRoute.POST(nextJsonRequest("POST", { teamId: a.id }), { params: Promise.resolve({ leagueId: league.joinToken }) });

    // initial state
    const res1 = await draftStateRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
    const etag = res1.headers.get("etag") || undefined;
    const last = res1.headers.get("last-modified") || undefined;
    expect(etag).toBeTruthy();
    expect(last).toBeTruthy();

    // subsequent conditional request
    const req = new NextRequest("http://localhost/test", { method: "GET", headers: { "If-None-Match": etag!, "If-Modified-Since": last! } });
    const res304 = await draftStateRoute.GET(req, { params: Promise.resolve({ leagueId: league.id }) });
    expect(res304.status).toBe(304);
  });

  it("completes the full draft and sets league to complete", async () => {
    const createRes = await leaguesRoute.POST(nextJsonRequest("POST", { name: "Complete League", maxTeams: 2 }));
    const league = await createRes.json() as any;
    const j1 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "A" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    const { team: a } = await j1.json() as any;
    const j2 = await joinRoute.POST(nextJsonRequest("POST", { displayName: "B" }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    const { team: b } = await j2.json() as any;
    // add celebs
    const names = ["A1","A2","A3","A4","A5","B1","B2","B3","B4","B5"];
    for (const n of names) {
      const res = await celebritiesRoute.POST(nextJsonRequest("POST", { name: n, addedByTeamId: a.id }), { params: Promise.resolve({ leagueId: league.id }) });
      expect(res.ok).toBe(true);
    }
    await startDraftRoute.POST(nextJsonRequest("POST", { teamId: a.id }), { params: Promise.resolve({ leagueId: league.joinToken }) });
    // make 10 picks in snake order
    for (let overall = 1; overall <= 10; overall++) {
      const stateRes = await draftStateRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
      const state = await stateRes.json() as any;
      const upNext: string = state.upNextTeamId;
      const nextCelebName = names[overall - 1];
      // find celeb id via list API
      const listRes = await celebritiesRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
      const list = await listRes.json() as any;
      const celeb = list.celebrities.find((c: any) => c.name === nextCelebName);
      const pickRes = await picksRoute.POST(nextJsonRequest("POST", { teamId: upNext, celebrityId: celeb.id }), { params: Promise.resolve({ leagueId: league.id }) });
      expect(pickRes.ok).toBe(true);
    }
    // final state shows complete
    const recapRes = await recapRoute.GET(nextJsonRequest("GET"), { params: Promise.resolve({ leagueId: league.id }) });
    const recap = await recapRes.json() as any;
    expect(recap.league.status).toBe("complete");
  });
});


