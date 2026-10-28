const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

// "https://picsum.photos/seed/insta01/600/600" -> "insta01"
function postKey(imageUrl) {
  return imageUrl.split("/")[4];
}

async function main() {
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createManyAndReturn({ data: users });
  const userIds = new Map(createdUsers.map((user) => [user.username, user.id]));

  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map(({ author, ...post }) => ({
      ...post,
      authorId: userIds.get(author),
    })),
  });
  const postIds = new Map(
    createdPosts.map((post) => [postKey(post.imageUrl), post.id])
  );

  const createdLikes = await prisma.like.createMany({
    data: likes.map(({ user, post }) => ({
      userId: userIds.get(user),
      postId: postIds.get(post),
    })),
  });

  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`
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
