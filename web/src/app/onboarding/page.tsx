"use client";

import { useState } from "react";

export default function OnboardingPage() {
	const [name, setName] = useState("");
	const [maxTeams, setMaxTeams] = useState(8);
	const [invite, setInvite] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
			const url = `${location.origin}/onboarding?token=${league.joinToken}`;
			setInvite(url);
		} catch (err: any) {
			setError(err.message || "Failed to create league");
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
				<div className="border rounded p-3">
					<p className="text-sm">Invite link</p>
					<code className="block break-all bg-gray-100 p-2 rounded">{invite}</code>
				</div>
			)}
		</main>
	);
}


