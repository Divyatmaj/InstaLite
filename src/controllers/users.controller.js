const {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../services/users.service");
const {
  listPostsByAuthor,
  listPostsLikedBy,
} = require("../services/posts.service");
const { parsePagination } = require("../utils/pagination");

const USER_SORT_FIELDS = ["createdAt", "username", "fullname"];

// P2002: unique constraint failed, P2025: record not found
async function create(req, res) {
  const { username, email, fullname, bio } = req.body || {};

  if (!username || !email || !fullname) {
    return res
      .status(400)
      .json({ error: "username, email and fullname are required" });
  }

  try {
    const user = await createUser({ username, email, fullname, bio });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "username or email already taken" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function list(req, res) {
  const {
    sortBy = "createdAt",
    order = "desc",
    isPrivate,
    search,
    hasPosts,
  } = req.query;

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  if (!USER_SORT_FIELDS.includes(sortBy)) {
    return res.status(400).json({
      error: `sortBy must be one of: ${USER_SORT_FIELDS.join(", ")}`,
    });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  if (isPrivate !== undefined && isPrivate !== "true" && isPrivate !== "false") {
    return res.status(400).json({ error: "isPrivate must be true or false" });
  }

  if (hasPosts !== undefined && hasPosts !== "true" && hasPosts !== "false") {
    return res.status(400).json({ error: "hasPosts must be true or false" });
  }

  try {
    const result = await listUsers({
      page: pagination.page,
      limit: pagination.limit,
      sortBy,
      order,
      isPrivate: isPrivate === undefined ? undefined : isPrivate === "true",
      search,
      hasPosts: hasPosts === undefined ? undefined : hasPosts === "true",
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function getOne(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function update(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const { fullname, bio, isPrivate } = req.body || {};

  try {
    const user = await updateUser(id, {
      fullname,
      bio,
      isPrivate,
    });
    res.status(200).json(user);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    await deleteUser(id);
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function posts(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await listPostsByAuthor(id, pagination);
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function likedPosts(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  try {
    const result = await listPostsLikedBy(id, pagination);
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { create, list, getOne, update, remove, posts, likedPosts };
