const prisma = require("../db");
const { paginationMeta } = require("../utils/pagination");

// The only user fields shown when a user is nested inside another object
const userSummary = { select: { id: true, username: true, fullname: true } };

async function createUser(data) {
  return prisma.user.create({ data });
}

async function listUsers({
  page,
  limit,
  sortBy,
  order,
  isPrivate,
  search,
  hasPosts,
}) {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (hasPosts !== undefined) {
    where.posts = hasPosts ? { some: {} } : { none: {} };
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, meta: paginationMeta(page, limit, total) };
}

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { posts: true, likes: true } } },
  });
}

async function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}

async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

module.exports = {
  userSummary,
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
