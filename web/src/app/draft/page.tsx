"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CelebrityDTO, DraftPickDTO, DraftStateDTO, TeamDTO } from "@/types/domain";
import { createSimplePoller, fetchWithIfModifiedSince } from "@/lib/polling";

export default function DraftPage() {
	const router = useRouter();
	const [leagueId, setLeagueId] = useState<string | null>(null);
	const [teamId, setTeamId] = useState<string | null>(null);
	const [state, setState] = useState<DraftStateDTO | null>(null);
	const [celebrities, setCelebrities] = useState<CelebrityDTO[]>([]);
	const [newCelebrityName, setNewCelebrityName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [isPicking, setIsPicking] = useState(false);
    const pollingRef = useRef<ReturnType<typeof createSimplePoller> | null>(null);
    const lastModifiedRef = useRef<string | undefined>(undefined);
    const BASE_POLL_MS = 2500;
    const MAX_POLL_MS = 20000;
    const currentIntervalRef = useRef<number>(BASE_POLL_MS);
    const consecutiveFailuresRef = useRef<number>(0);
    const [isOffline, setIsOffline] = useState(false);

    function setPollingInterval(newInterval: number, activeLeagueId?: string | null) {
        const interval = Math.max(1000, Math.min(newInterval, MAX_POLL_MS));
        if (interval === currentIntervalRef.current && pollingRef.current) return;
        currentIntervalRef.current = interval;
        if (pollingRef.current) pollingRef.current.stop();
        pollingRef.current = createSimplePoller({
            intervalMs: currentIntervalRef.current,
            request: async () => {
                if (!activeLeagueId) return;
                await fetchDraftState(activeLeagueId);
            },
        });
        pollingRef.current.start();
    }

	useEffect(() => {
		const session = loadSession();
		if (!session) {
			router.push("/onboarding");
			return;
		}
		setLeagueId(session.leagueId);
		setTeamId(session.teamId);
	}, [router]);

    async function fetchDraftState(activeLeagueId: string) {
		try {
            const { status, data, lastModified } = await fetchWithIfModifiedSince<DraftStateDTO>(
                `/api/leagues/${encodeURIComponent(activeLeagueId)}/draft-state`,
                lastModifiedRef.current
            );
            if (status !== 304 && data) {
                setState(data);
                setError(null);
                if (lastModified) lastModifiedRef.current = lastModified;
            }
            // success path: reset backoff
            consecutiveFailuresRef.current = 0;
            if (isOffline) setIsOffline(false);
            if (currentIntervalRef.current !== BASE_POLL_MS) {
                setPollingInterval(BASE_POLL_MS, activeLeagueId);
            }
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to load draft state";
			setError(msg);
            consecutiveFailuresRef.current += 1;
            setIsOffline(true);
            // Backoff: on 2nd failure go to 5s, then double up to MAX
            let nextInterval = currentIntervalRef.current;
            if (consecutiveFailuresRef.current === 2) {
                nextInterval = 5000;
            } else if (consecutiveFailuresRef.current > 2) {
                nextInterval = Math.min(currentIntervalRef.current * 2, MAX_POLL_MS);
            }
            if (nextInterval !== currentIntervalRef.current) {
                setPollingInterval(nextInterval, activeLeagueId);
            }
		}
	}

	async function fetchCelebrities(activeLeagueId: string) {
		try {
			const res = await fetch(`/api/leagues/${encodeURIComponent(activeLeagueId)}/celebrities`);
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || `HTTP ${res.status}`);
			}
			const data = await res.json();
			setCelebrities(data.celebrities as CelebrityDTO[]);
			setError(null);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to load celebrities";
			setError(msg);
		}
	}

    useEffect(() => {
        if (!leagueId) return;
        void fetchDraftState(leagueId);
        void fetchCelebrities(leagueId);
        if (pollingRef.current) pollingRef.current.stop();
        currentIntervalRef.current = BASE_POLL_MS;
        pollingRef.current = createSimplePoller({
            intervalMs: currentIntervalRef.current,
            request: async () => {
                if (!leagueId) return;
                await fetchDraftState(leagueId);
            },
        });
        pollingRef.current.start();
        return () => {
            if (pollingRef.current) pollingRef.current.stop();
        };
    }, [leagueId]);

	const pickedCelebrityIds = useMemo(() => {
		const set = new Set<string>();
		(state?.picks || []).forEach((p: DraftPickDTO) => set.add(p.celebrityId));
		return set;
	}, [state]);

	const whoseTurnTeamId = useMemo(() => {
		if (!state) return null;
		if (state.upNextTeamId) return state.upNextTeamId;
		if (!state.teams.length) return null;
		const idx = (state.currentPickOverall - 1) % state.teams.length;
		return state.teams[idx]?.id ?? null;
	}, [state]);

	async function addCelebrity(e: React.FormEvent) {
		e.preventDefault();
		if (!leagueId || !teamId) return;
		const name = newCelebrityName.trim();
		if (!name) return;
        try {
			setMessage(null);
			setError(null);
            if (pollingRef.current) pollingRef.current.stop();
			const res = await fetch(`/api/leagues/${encodeURIComponent(leagueId)}/celebrities`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, addedByTeamId: teamId }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || `HTTP ${res.status}`);
			}
			setNewCelebrityName("");
            await fetchCelebrities(leagueId);
			setMessage("Celebrity added");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to add celebrity";
			setError(msg);
		}
        finally {
            if (pollingRef.current && !pollingRef.current.isRunning()) pollingRef.current.start();
        }
	}

	async function makePick(celebrityId: string) {
		if (!leagueId || !teamId) return;
        try {
			setIsPicking(true);
			setMessage(null);
			setError(null);
            if (pollingRef.current) pollingRef.current.stop();
			const res = await fetch(`/api/leagues/${encodeURIComponent(leagueId)}/picks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ teamId, celebrityId }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || `HTTP ${res.status}`);
			}
            await fetchDraftState(leagueId);
			setMessage("Pick made");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to make pick";
			setError(msg);
		} finally {
			setIsPicking(false);
            if (pollingRef.current && !pollingRef.current.isRunning()) pollingRef.current.start();
		}
	}

	const teamsById = useMemo(() => {
		const map = new Map<string, TeamDTO>();
		(state?.teams || []).forEach((t) => map.set(t.id, t));
		return map;
	}, [state]);

	const celebsById = useMemo(() => {
		const map = new Map<string, CelebrityDTO>();
		(celebrities || []).forEach((c) => map.set(c.id, c));
		return map;
	}, [celebrities]);

	return (
		<main className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Draft</h1>
			{error && <p className="text-red-600 text-sm">{error}</p>}
			{message && <p className="text-green-700 text-sm">{message}</p>}
            {isOffline && (
                <p className="text-xs text-gray-600">Offline; retrying with backoff…</p>
            )}

			{state ? (
				<div className="space-y-4">
					<div className="border rounded p-3">
						<p className="text-sm">League: <span className="font-medium">{state.league.name}</span></p>
						{whoseTurnTeamId && (
							<p className="text-sm">Up next: <span className="font-medium">{(state.teams.find(t => t.id === whoseTurnTeamId)?.displayName) || ""}</span></p>
						)}
						<p className="text-sm">Teams ({state.teams.length})</p>
						<ol className="list-decimal list-inside text-sm">
							{state.teams.map((t) => {
								const isMe = t.id === teamId;
								const isTurn = t.id === whoseTurnTeamId;
								return (
									<li key={t.id} className={`${isMe ? "font-medium" : ""} ${isTurn ? "text-blue-700" : ""}`}>
										{t.draftPosition ? `${t.draftPosition}. ` : ""}{t.displayName} {isTurn ? "• your turn" : ""}
									</li>
								);
							})}
						</ol>
					</div>

					<div className="border rounded p-3">
						<p className="text-sm">Picks ({state.picks.length}) • Current overall: {state.currentPickOverall}</p>
						<ol className="list-decimal list-inside text-sm">
							{state.picks.map((p) => (
								<li key={p.id}>
									#{p.overall} – {teamsById.get(p.teamId)?.displayName || p.teamId} picked {celebsById.get(p.celebrityId)?.name || p.celebrityId}
								</li>
							))}
						</ol>
					</div>

					<div className="border rounded p-3 space-y-3">
						<p className="text-sm">Add celebrity</p>
						<form className="flex gap-2" onSubmit={addCelebrity}>
							<input className="border px-2 py-1 rounded flex-1" value={newCelebrityName} onChange={(e) => setNewCelebrityName(e.target.value)} />
							<button type="submit" className="bg-black text-white px-3 py-2 rounded">Add</button>
						</form>

						<p className="text-sm">Celebrities ({celebrities.length})</p>
						<ul className="space-y-2 text-sm">
							{celebrities.map((c) => {
								const alreadyPicked = pickedCelebrityIds.has(c.id);
								const notMyTurn = whoseTurnTeamId && teamId ? whoseTurnTeamId !== teamId : false;
								return (
									<li key={c.id} className="flex items-center justify-between">
										<span>{c.name}</span>
										<button
											type="button"
											disabled={alreadyPicked || isPicking || notMyTurn}
											className={`px-2 py-1 rounded ${alreadyPicked ? "bg-gray-300 text-gray-600" : notMyTurn ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"}`}
											onClick={() => makePick(c.id)}
										>
											{alreadyPicked ? "Picked" : notMyTurn ? "Wait" : isPicking ? "Picking..." : "Pick"}
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			) : (
				<p className="text-sm text-gray-600">Loading draft...</p>
			)}
		</main>
	);
}

