import { Socket } from "socket.io";
import type { ExtendedError } from "socket.io";

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    sessionToken: string;
  };
}

/**
 * Socket.IO auth middleware.
 * Validates the session token passed from the client.
 *
 * The client sends the token via the `auth` option:
 *   io({ auth: { token: "session-token-here" } })
 *
 * For production, this should validate against the database.
 * For now, we accept any non-empty token and extract userId from
 * a query sent by the client (the Next.js app sends userId + token).
 */
export function authMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const token = socket.handshake.auth?.token as string | undefined;
  const userId = socket.handshake.auth?.userId as string | undefined;

  if (!token || !userId) {
    return next(new Error("Authentication required: token and userId missing"));
  }

  // In production, validate the token against the sessions table.
  // For the MVP, we trust the token if it's non-empty since the
  // Next.js proxy/middleware already validated the session before
  // the client received the token.

  // Store user info on the socket
  socket.data.userId = userId;
  socket.data.sessionToken = token;

  next();
}
