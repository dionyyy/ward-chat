import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  const body = await request.json();

  try {
    const { editMessage } = await import("@/server/actions/message");
    const result = await editMessage(messageId, body);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to edit message";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;

  try {
    const { deleteMessage } = await import("@/server/actions/message");
    const result = await deleteMessage(messageId);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete message";
    return Response.json({ error: message }, { status: 400 });
  }
}
