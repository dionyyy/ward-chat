import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Redis from "ioredis";
import { authMiddleware, type AuthenticatedSocket } from "./middleware/auth";
import { setupRedisSubscriber } from "./redis";
import { registerHandlers } from "./handlers/index";

const PORT = Number(process.env.PORT) || 3001;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6380";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Create HTTP server
const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: Date.now() }));
    return;
  }
  res.writeHead(404);
  res.end();
});

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN.split(","),
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 20000,
});

// Apply auth middleware
io.use(authMiddleware);

// Set up Redis subscriber to bridge events from Next.js → clients
setupRedisSubscriber(io, REDIS_URL);

// Handle Socket.IO connections
io.on("connection", (socket: Socket) => {
  const authSocket = socket as AuthenticatedSocket;
  console.log(
    `Client connected: ${authSocket.id} (user: ${authSocket.data.userId})`
  );

  // Register all event handlers
  registerHandlers(io, authSocket);

  // Handle disconnect
  authSocket.on("disconnect", (reason) => {
    console.log(
      `Client disconnected: ${authSocket.id} (user: ${authSocket.data.userId}, reason: ${reason})`
    );
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`  CORS origin: ${CORS_ORIGIN}`);
  console.log(`  Redis URL: ${REDIS_URL}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  io.close();
  httpServer.close(() => {
    process.exit(0);
  });
});
