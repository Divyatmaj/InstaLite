const prisma = require("../db");

async function createUser(data) {
  return prisma.user.create({ data });
}

async function listUsers({ page, limit, sortBy, order, isPrivate, search }) {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
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

  return {
    data: users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data });
}

async function deleteUser(id) {
  return prisma.user.delete({ where: { id } });
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
