const prisma = require("../db");
const { userSummary } = require("./users.service");

async function postExists(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  return post !== null;
}

// Users who liked the post, or null when the post doesn't exist
async function listLikers(postId) {
  const [post, users] = await prisma.$transaction([
    prisma.post.findUnique({ where: { id: postId }, select: { id: true } }),
    prisma.user.findMany({
      where: { likes: { some: { postId } } },
      ...userSummary,
      orderBy: { username: "asc" },
    }),
  ]);

  if (!post) return null;

  return users;
}

async function createLike(userId, postId) {
  return prisma.like.create({ data: { userId, postId } });
}

async function deleteLike(userId, postId) {
  return prisma.like.delete({
    where: { userId_postId: { userId, postId } },
  });
}

module.exports = { postExists, listLikers, createLike, deleteLike };
