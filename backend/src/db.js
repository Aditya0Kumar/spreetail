const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function autoSeed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log("Database already has data. Skipping auto-seeding.");
      return;
    }

    console.log("Database is empty. Auto-seeding default flatmates...");

    // Create base users
    const usersData = [
      { username: "Aisha", email: "aisha@flat.com" },
      { username: "Rohan", email: "rohan@flat.com" },
      { username: "Priya", email: "priya@flat.com" },
      { username: "Meera", email: "meera@flat.com" },
      { username: "Sam", email: "sam@flat.com" },
      { username: "Dev", email: "dev@visitor.com" },
    ];

    const users = {};
    for (const u of usersData) {
      const created = await prisma.user.create({ data: u });
      users[u.username] = created;
    }

    // Create default group
    const group = await prisma.group.create({ data: { name: "Shared Flat" } });

    // Create memberships
    const feb1 = new Date("2026-02-01T00:00:00Z");
    const mar31 = new Date("2026-03-31T23:59:59Z");
    const apr15 = new Date("2026-04-15T00:00:00Z");

    await prisma.groupMembership.create({
      data: { groupId: group.id, userId: users["Aisha"].id, joinedAt: feb1 },
    });
    await prisma.groupMembership.create({
      data: { groupId: group.id, userId: users["Rohan"].id, joinedAt: feb1 },
    });
    await prisma.groupMembership.create({
      data: { groupId: group.id, userId: users["Priya"].id, joinedAt: feb1 },
    });
    await prisma.groupMembership.create({
      data: { groupId: group.id, userId: users["Dev"].id, joinedAt: feb1 },
    });
    await prisma.groupMembership.create({
      data: {
        groupId: group.id,
        userId: users["Meera"].id,
        joinedAt: feb1,
        leftAt: mar31,
      },
    });
    await prisma.groupMembership.create({
      data: { groupId: group.id, userId: users["Sam"].id, joinedAt: apr15 },
    });

    console.log("Auto-seeding completed successfully!");
  } catch (error) {
    console.error("Auto-seeding failed:", error);
  }
}

module.exports = {
  prisma,
  autoSeed,
};
