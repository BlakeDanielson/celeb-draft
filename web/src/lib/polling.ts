export type Poller = {
	start: () => void;
	stop: () => void;
	isRunning: () => boolean;
};

export function createSimplePoller(options: {
	intervalMs: number;
	request: () => Promise<void>;
}): Poller {
	let timer: ReturnType<typeof setInterval> | null = null;

	function start() {
 		if (timer) return;
 		timer = setInterval(() => {
 			void options.request();
 		}, options.intervalMs);
 	}

	function stop() {
 		if (timer) {
 			clearInterval(timer);
 			timer = null;
 		}
 	}

	function isRunning() {
 		return Boolean(timer);
 	}

	return { start, stop, isRunning };
}

export async function fetchWithIfModifiedSince<T>(
	url: string,
	lastModified?: string
): Promise<{ status: number; data?: T; lastModified?: string }> {
	const headers: Record<string, string> = {};
	if (lastModified) headers["If-Modified-Since"] = lastModified;
	const res = await fetch(url, { headers });
	if (res.status === 304) {
		return { status: 304, lastModified };
	}
	if (!res.ok) {
		const body = await res.json().catch(() => ({} as any));
		throw new Error(body?.error || `HTTP ${res.status}`);
	}
	const data = (await res.json()) as T;
	const lm = res.headers.get("last-modified") || undefined;
	return { status: res.status, data, lastModified: lm };
}

export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
	const res = await fetch(input, init);
	if (!res.ok) {
		throw new Error(`Request failed: ${res.status}`);
	}
	return (await res.json()) as T;
}


