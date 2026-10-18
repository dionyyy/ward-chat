"use client";

interface TypingIndicatorProps {
  typingUsers: { userId: string; userName: string }[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  let text: string;
  if (typingUsers.length === 1) {
    text = `${typingUsers[0].userName} is typing`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`;
  } else {
    text = "Several people are typing";
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-slate-400">
      <div className="flex gap-0.5">
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
      </div>
      <span>{text}</span>
    </div>
  );
}
