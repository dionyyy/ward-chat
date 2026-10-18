import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { inviteCode } = body;

  if (!inviteCode) {
    return Response.json({ error: "Invite code is required" }, { status: 400 });
  }

  try {
    const { joinServerByInvite } = await import("@/server/actions/server");
    const result = await joinServerByInvite(inviteCode);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to join server";
    return Response.json({ error: message }, { status: 400 });
  }
}
