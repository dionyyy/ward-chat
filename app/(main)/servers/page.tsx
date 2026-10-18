import { MessageSquare } from "lucide-react";

export default function ServersPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-900/50 p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
        <MessageSquare className="h-10 w-10 text-slate-500" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-200">
          Welcome to Ward-Chat
        </h2>
        <p className="mt-1 max-w-sm text-sm text-slate-400">
          Select a server from the sidebar or create a new one to get started.
        </p>
      </div>
    </div>
  );
}
