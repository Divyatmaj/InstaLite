const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createMany({ data: users });
  const createdPosts = await prisma.post.createMany({ data: posts });

  console.log(
    `🌱 Seeded ${createdUsers.count} users and ${createdPosts.count} posts`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
