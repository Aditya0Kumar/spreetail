const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean database in order of dependencies
  await prisma.expenseSplit.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.groupMembership.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.user.deleteMany({});

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
    console.log(`Created user: ${u.username}`);
  }

  // Create default group
  const group = await prisma.group.create({ data: { name: "Shared Flat" } });
  console.log(`Created group: ${group.name}`);

  // Create memberships
  const feb1 = new Date("2026-02-01T00:00:00Z");
  const mar31 = new Date("2026-03-31T23:59:59Z");
  const apr15 = new Date("2026-04-15T00:00:00Z");

  // Aisha, Rohan, Priya joined on Feb 1, 2026 (no left date)
  await prisma.groupMembership.create({
    data: { groupId: group.id, userId: users["Aisha"].id, joinedAt: feb1 },
  });
  await prisma.groupMembership.create({
    data: { groupId: group.id, userId: users["Rohan"].id, joinedAt: feb1 },
  });
  await prisma.groupMembership.create({
    data: { groupId: group.id, userId: users["Priya"].id, joinedAt: feb1 },
  });

  // Dev joined on Feb 1, 2026 (active for Goa trip and general visits)
  await prisma.groupMembership.create({
    data: { groupId: group.id, userId: users["Dev"].id, joinedAt: feb1 },
  });

  // Meera joined on Feb 1, 2026 and left on March 31, 2026
  await prisma.groupMembership.create({
    data: {
      groupId: group.id,
      userId: users["Meera"].id,
      joinedAt: feb1,
      leftAt: mar31,
    },
  });

  // Sam joined on April 15, 2026
  await prisma.groupMembership.create({
    data: { groupId: group.id, userId: users["Sam"].id, joinedAt: apr15 },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
