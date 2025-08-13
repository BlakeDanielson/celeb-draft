// Simple in-process async mutex per key (league-level lock)
// Note: This is suitable for single-process deployments or local dev.
// In multi-instance environments, use a distributed lock.

const lockChains = new Map<string, Promise<void>>();

export async function withLeagueLock<T>(leagueId: string, fn: () => Promise<T>): Promise<T> {
	const prior = lockChains.get(leagueId) ?? Promise.resolve();
	let release: () => void;
	const next = new Promise<void>((resolve) => {
		release = resolve;
	});
	lockChains.set(leagueId, prior.then(() => next));
	await prior;
	try {
		return await fn();
	} finally {
		release!();
		// Clean up if no new waiters chained
		if (lockChains.get(leagueId) === next) {
			lockChains.delete(leagueId);
		}
	}
}


