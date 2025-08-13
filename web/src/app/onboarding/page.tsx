"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession, loadSession } from "@/lib/session";

export default function OnboardingPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [maxTeams, setMaxTeams] = useState(8);
	const [invite, setInvite] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// read invite token from URL (we treat as joinToken)
	const token = useMemo((): string | null => {
		if (typeof window === "undefined") return null;
		const u = new URL(window.location.href);
		return u.searchParams.get("token");
	}, []);

	const [displayName, setDisplayName] = useState("");
	const [joinMsg, setJoinMsg] = useState<string | null>(null);

    async function startDraft() {
        if (!invite) return;
		try {
			const u = new URL(invite);
			const tokenFromInvite = u.searchParams.get("token");
			if (!tokenFromInvite) return;
			setLoading(true);
			setError(null);
            const session = loadSession();
            if (!session?.teamId) {
                throw new Error("Join as commissioner first");
            }
            const res = await fetch(`/api/leagues/${encodeURIComponent(tokenFromInvite)}/start-draft`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId: session.teamId }),
            });
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || `HTTP ${res.status}`);
			}
            const data = await res.json();
            setJoinMsg("Draft started.");
            if (Array.isArray(data?.order)) {
                // brief inline preview of order
                const preview = data.order.map((t: any) => `${t.draftPosition}. ${t.displayName}`).join(", ");
                setJoinMsg(`Draft started. Order: ${preview}`);
            }
			// Navigate to the draft page once the draft has started
			router.push("/draft");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to start draft";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}

	async function createLeague(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/leagues", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, maxTeams }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || `HTTP ${res.status}`);
			}
			const league = await res.json();
			const url = `${location.origin}/onboarding?token=${encodeURIComponent(league.joinToken)}`;
			setInvite(url);
			} catch (err) {
				const msg = err instanceof Error ? err.message : "Failed to create league";
				setError(msg);
		} finally {
			setLoading(false);
		}
	}

	async function joinLeague(e: React.FormEvent) {
		e.preventDefault();
		if (!token) return;
		setLoading(true);
		setError(null);
		setJoinMsg(null);
		try {
			const res = await fetch(`/api/leagues/${encodeURIComponent(token)}/join`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ displayName }),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body?.error || `HTTP ${res.status}`);
			}
			const { team, league } = await res.json();
			saveSession({
				leagueId: league.id,
				joinToken: league.joinToken,
				teamId: team.id,
				displayName: team.displayName,
			});
			setJoinMsg("Joined! You can share the same invite link with others.");
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Failed to join";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Onboarding</h1>
			<p className="text-sm text-gray-600">Create league, share invite, or join by link.</p>

			<form className="space-y-3" onSubmit={createLeague}>
				<div className="flex gap-2 items-end">
					<label className="flex flex-col">
						<span className="text-sm">League name</span>
						<input className="border px-2 py-1 rounded" value={name} onChange={(e) => setName(e.target.value)} required />
					</label>
					<label className="flex flex-col">
						<span className="text-sm">Max teams (2-20)</span>
						<input
							type="number"
							min={2}
							max={20}
							className="border px-2 py-1 rounded w-24"
							value={maxTeams}
							onChange={(e) => setMaxTeams(Number(e.target.value))}
						/>
					</label>
					<button type="submit" disabled={loading} className="bg-black text-white px-3 py-2 rounded">
						{loading ? "Creating..." : "Create League"}
					</button>
				</div>
				{error && <p className="text-red-600 text-sm">{error}</p>}
			</form>

			{invite && (
				<div className="border rounded p-3 space-y-3">
					<p className="text-sm">Invite link</p>
					<code className="block break-all bg-gray-100 p-2 rounded">{invite}</code>
                    <button type="button" onClick={startDraft} disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">
						{loading ? "Starting..." : "Start Draft"}
					</button>

					{/* Allow creator to join as the first team (commissioner) */}
					<form className="space-y-2" onSubmit={(e) => {
						e.preventDefault();
						// Temporarily reuse joinLeague with token from invite
						const u = new URL(invite);
						const t = u.searchParams.get("token");
						if (!t) return;
						// shim: call join endpoint directly here
						(void (async () => {
							setLoading(true);
							setError(null);
							setJoinMsg(null);
							try {
								const res = await fetch(`/api/leagues/${encodeURIComponent(t)}/join`, {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({ displayName }),
								});
								if (!res.ok) {
									const body = await res.json().catch(() => ({}));
									throw new Error(body?.error || `HTTP ${res.status}`);
								}
								const { team, league } = await res.json();
								saveSession({ leagueId: league.id, joinToken: league.joinToken, teamId: team.id, displayName: team.displayName });
								setJoinMsg("Joined as commissioner.");
							} catch (err) {
								const msg = err instanceof Error ? err.message : "Failed to join";
								setError(msg);
							} finally {
								setLoading(false);
							}
						})());
					}}>
						<label className="flex flex-col">
							<span className="text-sm">Join this league (display name)</span>
							<input className="border px-2 py-1 rounded" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
						</label>
						<div className="flex gap-2 items-center">
							<button type="submit" disabled={loading} className="bg-black text-white px-3 py-2 rounded">Join</button>
							{joinMsg && <span className="text-green-700 text-sm">{joinMsg}</span>}
						</div>
					</form>
				</div>
			)}

			{token && (
				<form className="space-y-3" onSubmit={joinLeague}>
					<h2 className="text-lg font-medium">Join League</h2>
					<div className="flex gap-2 items-end">
						<label className="flex flex-col">
							<span className="text-sm">Display name</span>
							<input className="border px-2 py-1 rounded" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
						</label>
						<button type="submit" disabled={loading} className="bg-black text-white px-3 py-2 rounded">
							{loading ? "Joining..." : "Join"}
						</button>
					</div>
					{joinMsg && <p className="text-green-700 text-sm">{joinMsg}</p>}
				</form>
			)}

		</main>
	);
}


