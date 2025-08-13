export type UserSession = {
  leagueId: string;
  joinToken: string;
  teamId: string;
  displayName: string;
};

const KEY = "dd.session";

export function saveSession(session: UserSession) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {}
}

export function loadSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}


