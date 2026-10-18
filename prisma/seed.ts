import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Hash password using the same algorithm as Better Auth
// Better Auth uses: N=16384, r=16, p=1, dkLen=64, format: "{salt_hex}:{key_hex}"
import { scryptSync, randomBytes } from "crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const N = 16384;
  const r = 16;
  const p = 1;
  const dkLen = 64;
  const normalizedPassword = password.normalize("NFKC");
  const key = scryptSync(normalizedPassword, salt, dkLen, {
    N,
    r,
    p,
    maxmem: 128 * N * r * 2,
  });
  return `${salt}:${key.toString("hex")}`;
}

async function main() {
  console.log("🌱 Seeding Ward-Chat database...\n");

  // ─── Clean existing data ────────────────────────────────
  console.log("  Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.friend.deleteMany();
  await prisma.directMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.thread.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.category.deleteMany();
  await prisma.member.deleteMany();
  await prisma.server.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Users with Accounts (loginable) ─────────────
  console.log("  Creating users with login credentials...\n");

  const DEFAULT_PASSWORD = "Password123!";
  const hashedPassword = hashPassword(DEFAULT_PASSWORD);

  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: "admin@ward.chat",
      name: "Admin User",
      username: "admin",
      emailVerified: true,
      status: "ONLINE",
      bio: "Platform administrator. Keeping Ward-Chat running smoothly.",
      role: "ADMIN",
    },
  });

  await prisma.account.create({
    data: {
      userId: admin.id,
      accountId: admin.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  console.log("  ✓ Admin:     admin@ward.chat / Password123!");

  // Moderator User
  const moderator = await prisma.user.create({
    data: {
      email: "moderator@ward.chat",
      name: "Mod Martinez",
      username: "moderator",
      emailVerified: true,
      status: "ONLINE",
      bio: "Community moderator. Here to help and keep things civil.",
      role: "MODERATOR",
    },
  });

  await prisma.account.create({
    data: {
      userId: moderator.id,
      accountId: moderator.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  console.log("  ✓ Moderator: moderator@ward.chat / Password123!");

  // Regular Member
  const member = await prisma.user.create({
    data: {
      email: "user@ward.chat",
      name: "Regular User",
      username: "user",
      emailVerified: true,
      status: "OFFLINE",
      bio: "Just a regular user exploring Ward-Chat.",
      role: "MEMBER",
    },
  });

  await prisma.account.create({
    data: {
      userId: member.id,
      accountId: member.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  console.log("  ✓ Member:    user@ward.chat / Password123!");

  // Additional users for a realistic feel
  const alice = await prisma.user.create({
    data: {
      email: "alice@ward.chat",
      name: "Alice Johnson",
      username: "alice",
      emailVerified: true,
      status: "ONLINE",
      bio: "Full-stack developer. Coffee enthusiast.",
      role: "MEMBER",
    },
  });

  await prisma.account.create({
    data: {
      userId: alice.id,
      accountId: alice.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@ward.chat",
      name: "Bob Smith",
      username: "bob",
      emailVerified: true,
      status: "IDLE",
      bio: "Backend engineer. Rust advocate.",
      role: "MEMBER",
    },
  });

  await prisma.account.create({
    data: {
      userId: bob.id,
      accountId: bob.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  console.log("  ✓ Alice:     alice@ward.chat / Password123!");
  console.log("  ✓ Bob:       bob@ward.chat / Password123!");

  // ─── Create Server ──────────────────────────────────────
  console.log("\n  Creating server...");

  const server = await prisma.server.create({
    data: {
      name: "Ward-Chat HQ",
      description: "The official Ward-Chat community server. Welcome!",
      inviteCode: "ward-hq",
    },
  });

  // ─── Create Members ─────────────────────────────────────
  const adminMember = await prisma.member.create({
    data: { userId: admin.id, serverId: server.id, role: "ADMIN" },
  });

  const modMember = await prisma.member.create({
    data: { userId: moderator.id, serverId: server.id, role: "MODERATOR" },
  });

  const memberMember = await prisma.member.create({
    data: { userId: member.id, serverId: server.id, role: "MEMBER" },
  });

  const aliceMember = await prisma.member.create({
    data: { userId: alice.id, serverId: server.id, role: "MEMBER" },
  });

  const bobMember = await prisma.member.create({
    data: { userId: bob.id, serverId: server.id, role: "MEMBER" },
  });

  console.log("  ✓ Server: Ward-Chat HQ (invite code: ward-hq)");
  console.log("  ✓ Members: admin(ADMIN), moderator(MOD), user, alice, bob");

  // ─── Create Categories & Channels ──────────────────────
  console.log("\n  Creating channels...");

  const generalCategory = await prisma.category.create({
    data: { name: "General", position: 0, serverId: server.id },
  });

  const devCategory = await prisma.category.create({
    data: { name: "Development", position: 1, serverId: server.id },
  });

  const socialCategory = await prisma.category.create({
    data: { name: "Social", position: 2, serverId: server.id },
  });

  const generalChannel = await prisma.channel.create({
    data: {
      name: "general",
      type: "TEXT",
      position: 0,
      topic: "General chat for all things Ward-Chat",
      serverId: server.id,
      categoryId: generalCategory.id,
    },
  });

  const announcementsChannel = await prisma.channel.create({
    data: {
      name: "announcements",
      type: "TEXT",
      position: 1,
      topic: "Official updates and announcements",
      serverId: server.id,
      categoryId: generalCategory.id,
    },
  });

  const rulesChannel = await prisma.channel.create({
    data: {
      name: "rules",
      type: "TEXT",
      position: 2,
      topic: "Community guidelines",
      serverId: server.id,
      categoryId: generalCategory.id,
    },
  });

  const frontendChannel = await prisma.channel.create({
    data: {
      name: "frontend",
      type: "TEXT",
      position: 0,
      topic: "React, Next.js, CSS, and UI discussions",
      serverId: server.id,
      categoryId: devCategory.id,
    },
  });

  const backendChannel = await prisma.channel.create({
    data: {
      name: "backend",
      type: "TEXT",
      position: 1,
      topic: "APIs, databases, and server architecture",
      serverId: server.id,
      categoryId: devCategory.id,
    },
  });

  const helpChannel = await prisma.channel.create({
    data: {
      name: "help",
      type: "TEXT",
      position: 2,
      topic: "Ask questions and get help",
      serverId: server.id,
      categoryId: devCategory.id,
    },
  });

  const offTopicChannel = await prisma.channel.create({
    data: {
      name: "off-topic",
      type: "TEXT",
      position: 0,
      topic: "Anything goes (within reason)",
      serverId: server.id,
      categoryId: socialCategory.id,
    },
  });

  console.log("  ✓ Categories: General, Development, Social");
  console.log("  ✓ Channels: general, announcements, rules, frontend, backend, help, off-topic");

  // ─── Create Messages ────────────────────────────────────
  console.log("\n  Creating messages...");

  const messageData = [
    {
      content: "Welcome to Ward-Chat HQ! 🎉 This is our official community server.",
      userId: admin.id,
      memberId: adminMember.id,
      channelId: generalChannel.id,
    },
    {
      content: "Hey everyone! Glad to be here. The UI looks amazing!",
      userId: alice.id,
      memberId: aliceMember.id,
      channelId: generalChannel.id,
    },
    {
      content: "Thanks Alice! We put a lot of work into the design system. Tailwind v4 + Radix UI is a great combo.",
      userId: moderator.id,
      memberId: modMember.id,
      channelId: generalChannel.id,
    },
    {
      content: "Quick question — is there a way to customize the theme?",
      userId: bob.id,
      memberId: bobMember.id,
      channelId: generalChannel.id,
    },
    {
      content: "Yes! Check the bottom-left corner. There's a theme toggle for dark/light/system modes.",
      userId: admin.id,
      memberId: adminMember.id,
      channelId: generalChannel.id,
    },
    {
      content: "The real-time messaging is super smooth. No noticeable latency at all.",
      userId: member.id,
      memberId: memberMember.id,
      channelId: generalChannel.id,
    },
    {
      content: "That's the Socket.IO + Redis Pub/Sub architecture doing its thing. Messages go: Server Action → Redis → Socket.IO → clients.",
      userId: admin.id,
      memberId: adminMember.id,
      channelId: generalChannel.id,
    },
    {
      content: "Here's a quick code example of how our message flow works:\n\n```typescript\n// Server Action publishes to Redis\nawait publishNewMessage({\n  id: message.id,\n  content: message.content,\n  channelId: message.channelId,\n  userId: session.user.id,\n});\n\n// Socket.IO service picks it up and broadcasts\nredisSub.on('message', (channel, data) => {\n  io.to(`channel:${data.channelId}`).emit('message:new', data);\n});\n```",
      userId: alice.id,
      memberId: aliceMember.id,
      channelId: frontendChannel.id,
    },
    {
      content: "Nice! The architecture is clean. Separating the Socket.IO service from Next.js was a smart call.",
      userId: bob.id,
      memberId: bobMember.id,
      channelId: frontendChannel.id,
    },
    {
      content: "Anyone working on the file upload feature? I saw MinIO is already set up in Docker.",
      userId: member.id,
      memberId: memberMember.id,
      channelId: backendChannel.id,
    },
    {
      content: "Yes, it's next on the roadmap! We'll use presigned URLs for secure uploads directly to MinIO, with the architecture ready to swap to AWS S3 in production.",
      userId: admin.id,
      memberId: adminMember.id,
      channelId: backendChannel.id,
    },
    {
      content: "📢 **Server Rules:**\n\n1. Be respectful to everyone\n2. No spam or self-promotion\n3. Keep discussions on-topic in each channel\n4. No NSFW content\n5. Have fun and collaborate!\n\nViolations may result in warnings, mutes, or bans.",
      userId: admin.id,
      memberId: adminMember.id,
      channelId: rulesChannel.id,
    },
  ];

  for (const msg of messageData) {
    await prisma.message.create({ data: msg });
    await new Promise((r) => setTimeout(r, 50)); // Stagger timestamps
  }

  console.log(`  ✓ Messages: ${messageData.length} messages across channels`);

  // ─── Create Friend Relationships ───────────────────────
  console.log("\n  Creating social connections...");

  await prisma.friend.create({
    data: { senderId: admin.id, receiverId: moderator.id, status: "ACCEPTED" },
  });
  await prisma.friend.create({
    data: { senderId: admin.id, receiverId: alice.id, status: "ACCEPTED" },
  });
  await prisma.friend.create({
    data: { senderId: alice.id, receiverId: bob.id, status: "ACCEPTED" },
  });
  await prisma.friend.create({
    data: { senderId: bob.id, receiverId: member.id, status: "PENDING" },
  });

  console.log("  ✓ Friends: admin↔moderator, admin↔alice, alice↔bob, bob→user(pending)");

  // ─── Create DM Conversations ───────────────────────────
  const dmConversation = await prisma.conversation.create({
    data: { initiatorId: admin.id, receiverId: moderator.id },
  });

  await prisma.directMessage.create({
    data: {
      content: "Hey! Can you take a look at the reported messages in #general?",
      userId: admin.id,
      conversationId: dmConversation.id,
    },
  });
  await prisma.directMessage.create({
    data: {
      content: "Sure, I'll check it out now. Thanks for the heads up!",
      userId: moderator.id,
      conversationId: dmConversation.id,
    },
  });

  console.log("  ✓ DM conversation: admin ↔ moderator");

  // ─── Create Notifications ──────────────────────────────
  await prisma.notification.create({
    data: {
      type: "FRIEND_REQUEST",
      title: "Friend Request",
      body: "Bob sent you a friend request",
      userId: member.id,
      metadata: { senderId: bob.id, senderName: "Bob Smith" },
    },
  });

  await prisma.notification.create({
    data: {
      type: "MENTION",
      title: "You were mentioned",
      body: "Admin mentioned you in #general",
      userId: alice.id,
      metadata: { channelId: generalChannel.id, serverId: server.id },
    },
  });

  console.log("  ✓ Notifications created");

  // ─── Create Audit Logs ─────────────────────────────────
  await prisma.auditLog.create({
    data: {
      action: "SERVER_CREATE",
      details: { serverName: server.name },
      userId: admin.id,
      serverId: server.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "MEMBER_JOIN",
      details: { userName: "Alice Johnson" },
      userId: alice.id,
      serverId: server.id,
    },
  });

  console.log("  ✓ Audit logs created");

  // ─── Summary ───────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("  🌱 Seed complete!");
  console.log("═".repeat(50));
  console.log("\n  📊 Summary:");
  console.log("  ───────────────────────────────");
  console.log("  Users:          5");
  console.log("  Servers:        1 (Ward-Chat HQ)");
  console.log("  Categories:     3");
  console.log("  Channels:       7");
  console.log(`  Messages:       ${messageData.length}`);
  console.log("  DM Convos:      1");
  console.log("  Friends:        4");
  console.log("");
  console.log("  🔑 Login Credentials (all use same password):");
  console.log("  ───────────────────────────────");
  console.log("  Admin:     admin@ward.chat     / Password123!");
  console.log("  Moderator: moderator@ward.chat / Password123!");
  console.log("  Member:    user@ward.chat      / Password123!");
  console.log("  Alice:     alice@ward.chat     / Password123!");
  console.log("  Bob:       bob@ward.chat       / Password123!");
  console.log("");
  console.log("  🔗 Invite Code: ward-hq");
  console.log("");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
