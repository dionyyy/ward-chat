export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-400">
          <span className="text-2xl font-bold text-white">W</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-50">
          Ward-Chat
        </h1>
        <p className="max-w-md text-lg text-slate-400">
          A modern collaboration platform. Real-time messaging, servers, and
          channels — built for teams.
        </p>
        <div className="flex gap-3">
          <a
            href="/login"
            className="rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-600"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-lg border border-slate-700 bg-slate-800/50 px-6 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
