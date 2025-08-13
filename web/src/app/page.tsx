import Image from "next/image";
import Link from "next/link";

function GradientBG() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,#2dd4bf20,transparent),radial-gradient(800px_400px_at_80%_20%,#f59e0b20,transparent),radial-gradient(800px_400px_at_20%_30%,#ef444420,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_0%,#00000006_50%,transparent_100%)]" />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] bg-[url('/globe.svg')] opacity-[0.02] bg-[length:600px_600px] bg-center" />
    </div>
  );
}

function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-black/10">
      <div className="animate-[scroll_20s_linear_infinite] whitespace-nowrap py-2 text-sm opacity-80">
        <span className="mx-6">Draft Celebrities</span>
        <span className="mx-6">Trash Talk with the Boys</span>
        <span className="mx-6">Score off Headlines</span>
        <span className="mx-6">Live Draft Room</span>
        <span className="mx-6">Weekly Recaps</span>
        <span className="mx-6">Mobile Friendly</span>
        <span className="mx-6">Invite-Only Leagues</span>
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <GradientBG />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-emerald-400 to-yellow-500 p-[2px]">
            <div className="h-full w-full rounded-[6px] bg-black/80 grid place-items-center text-xs font-bold">CD</div>
          </div>
          <span className="text-lg font-semibold tracking-tight">Celebrity Death Draft</span>
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          <a href="#features" className="opacity-80 hover:opacity-100">Features</a>
          <a href="#how" className="opacity-80 hover:opacity-100">How it works</a>
          <a href="#trailer" className="opacity-80 hover:opacity-100">Watch trailer</a>
          <Link href="/onboarding" className="opacity-80 hover:opacity-100">Onboarding</Link>
        </nav>
        <Link href="/onboarding" className="rounded-full bg-white text-black px-4 py-2 text-sm font-medium shadow-[_0_0_0_1px_rgba(255,255,255,.2)] hover:shadow-[0_0_0_2px_#fff]">
          Get Early Access
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live draft room • Auto‑scoring • Invite‑only leagues
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
              Draft the Undraftable.
              <span className="block bg-gradient-to-r from-emerald-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">Turn headlines into points.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-base/7 opacity-80 sm:text-lg/8">
              The sports‑bar fantasy league for celebrity headlines. Spin up a league, invite the squad, draft your roster, and let the chaos score itself.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/onboarding" className="group relative inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-black">
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-500 to-orange-500 blur-md opacity-70 transition-opacity group-hover:opacity-100" />
                <span className="relative rounded-full bg-white px-6 py-3">Start a League</span>
              </Link>
              <a href="#trailer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm opacity-90 hover:opacity-100">
                Watch trailer
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-80"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>

          {/* Hero art */}
          <div className="pointer-events-none mx-auto mt-12 grid max-w-5xl grid-cols-3 gap-4 sm:grid-cols-6">
            {["/globe.svg","/window.svg","/file.svg","/next.svg","/vercel.svg","/globe.svg"].map((src, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
                <Image className="mx-auto opacity-80" src={src} alt="" width={48} height={48} />
                <div className="mt-3 h-2 w-full rounded bg-white/10" />
                <div className="mt-2 h-2 w-2/3 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </section>

        {/* Trailer */}
        <section id="trailer" className="py-6 sm:py-10">
          <div className="mx-auto max-w-4xl">
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-0 backdrop-blur-sm">
              <div className="aspect-video w-full bg-[radial-gradient(600px_300px_at_50%_0%,#22c55e20,transparent),linear-gradient(180deg,#00000066,#000000)] grid place-items-center">
                <button type="button" className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-white/15">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white"><path d="M8 5v14l11-7L8 5Z"/></svg>
                  Watch the trailer
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-xs opacity-70">Trailer coming soon. For now, jump in and start a league.</p>
          </div>
        </section>

        <Marquee />

        {/* Features */}
        <section id="features" className="py-16 sm:py-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "Live Draft Room",
                body: "Snake‑style picks, live updates, zero spreadsheets.",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6"><path d="M4 6h16M4 12h10M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ),
              },
              {
                title: "Auto Scoring",
                body: "You talk smack, we track the points.",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Zm9-5v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
                ),
              },
              {
                title: "Invite‑Only Leagues",
                body: "Commissioner controls; keep it within the group chat.",
                icon: (
                  <svg viewBox="0 0 24 24" className="h-6 w-6"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5.33 0-8 2.667-8 6v1h16v-1c0-3.333-2.67-6-8-6Z" fill="currentColor"/></svg>
                ),
              },
            ].map((f, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-[radial-gradient(400px_200px_at_0%_0%,#22c55e20,transparent)]" />
                <div className="relative flex items-start gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-emerald-400">{f.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm opacity-80">{f.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CDD is for ... */}
        <section className="py-4 sm:py-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">CDD is for...</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[
                { title: "Trash Talkers", lines: ["Bring the energy to the group chat","Weekly recaps to keep receipts","Leaderboard bragging rights"] },
                { title: "Fantasy Degens", lines: ["Snake‑style drafts you already know","Live pick updates","Waivers and trades coming soon"] },
                { title: "Game Day Guys", lines: ["Sundays are for score checks","Auto‑scoring from headlines","Notifications that hit like a big play"] },
                { title: "Fraternity Squads", lines: ["Commissioner controls","Invite‑only leagues","Zero spreadsheets, maximum vibes"] },
                { title: "Sports Media Fans", lines: ["Built for Barstool energy","Clippable moments","Shareable league links"] },
                { title: "You", lines: ["Draft the undraftable","Own the narrative","Have fun and don’t be a jerk"] },
              ].map((b, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-6">
                  <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-400/10 to-yellow-500/10 blur-2xl" />
                  <h3 className="relative text-lg font-semibold">{b.title}</h3>
                  <ul className="relative mt-2 space-y-2 text-sm opacity-80">
                    {b.lines.map((l) => (
                      <li key={l} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{l}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="pb-20">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-10 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { step: "1", title: "Create a league", body: "Name it, set team max, you’re the commissioner." },
                { step: "2", title: "Invite the squad", body: "Share your one‑click link to bring the boys in." },
                { step: "3", title: "Draft & score", body: "Snake draft your roster; headlines do the rest." },
              ].map((s) => (
                <div key={s.step} className="relative rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="absolute right-4 top-4 text-5xl font-black text-white/10">{s.step}</div>
                  <h4 className="text-lg font-semibold">{s.title}</h4>
                  <p className="mt-1 text-sm opacity-80">{s.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/onboarding" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 via-yellow-500 to-orange-500 px-6 py-3 font-semibold text-black">
                Launch Onboarding
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm opacity-80 sm:flex-row">
          <p>© {new Date().getFullYear()} Celebrity Death Draft • Beta • We don’t sell your data.</p>
          <div className="flex items-center gap-4">
            <a href="/onboarding" className="hover:opacity-100 opacity-80">Start</a>
            <a href="#features" className="hover:opacity-100 opacity-80">Features</a>
            <a href="#how" className="hover:opacity-100 opacity-80">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
