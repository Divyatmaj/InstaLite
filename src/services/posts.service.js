const prisma = require("../db");
const { userSummary } = require("./users.service");
const { paginationMeta } = require("../utils/pagination");

const postInclude = {
  author: userSummary,
  _count: { select: { likes: true } },
};

async function createPost(data) {
  return prisma.post.create({ data });
}

async function listPosts({
  page,
  limit,
  sortBy,
  order,
  location,
  search,
  from,
  to,
}) {
  const where = {};

  if (location) {
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search) {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lt = to;
  }

  // Posts with the same number of likes: newest first, whatever the order
  const orderBy =
    sortBy === "likes"
      ? [{ likes: { _count: order } }, { createdAt: "desc" }]
      : { [sortBy]: order };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return { data: posts, meta: paginationMeta(page, limit, total) };
}

// Returns null when the user doesn't exist
async function listPostsByAuthor(authorId, { page, limit }) {
  const where = { authorId };

  const [author, posts, total] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: authorId }, select: { id: true } }),
    prisma.post.findMany({
      where,
      include: { _count: { select: { likes: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  if (!author) return null;

  return { data: posts, meta: paginationMeta(page, limit, total) };
}

// Returns null when the user doesn't exist
async function listPostsLikedBy(userId, { page, limit }) {
  const where = { likes: { some: { userId } } };

  const [user, posts, total] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  if (!user) return null;

  return { data: posts, meta: paginationMeta(page, limit, total) };
}

async function getPostById(id) {
  return prisma.post.findUnique({ where: { id }, include: postInclude });
}

async function updatePost(id, data) {
  return prisma.post.update({ where: { id }, data });
}

async function deletePost(id) {
  return prisma.post.delete({ where: { id } });
}

module.exports = {
  createPost,
  listPosts,
  listPostsByAuthor,
  listPostsLikedBy,
  getPostById,
  updatePost,
  deletePost,
};
