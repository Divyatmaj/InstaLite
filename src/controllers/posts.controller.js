const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../services/posts.service");
const { parsePagination } = require("../utils/pagination");

const POST_SORT_FIELDS = ["createdAt", "updatedAt", "likes"];

// P2003: foreign key constraint failed, P2025: record not found
async function create(req, res) {
  const { imageUrl, authorId, caption, location } = req.body || {};

  if (!imageUrl || authorId === undefined || authorId === null) {
    return res
      .status(400)
      .json({ error: "imageUrl and authorId are required" });
  }

  if (!Number.isInteger(authorId)) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const post = await createPost({ imageUrl, authorId, caption, location });
    res.status(201).json(post);
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function list(req, res) {
  const {
    sortBy = "createdAt",
    order = "desc",
    location,
    search,
    from,
    to,
  } = req.query;

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  if (!POST_SORT_FIELDS.includes(sortBy)) {
    return res.status(400).json({
      error: `sortBy must be one of: ${POST_SORT_FIELDS.join(", ")}`,
    });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const fromDate = from === undefined ? undefined : new Date(from);
  const toDate = to === undefined ? undefined : new Date(to);

  if (
    (fromDate && Number.isNaN(fromDate.getTime())) ||
    (toDate && Number.isNaN(toDate.getTime()))
  ) {
    return res.status(400).json({ error: "from and to must be valid dates" });
  }

  try {
    const result = await listPosts({
      page: pagination.page,
      limit: pagination.limit,
      sortBy,
      order,
      location,
      search,
      from: fromDate,
      to: toDate,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function getOne(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await getPostById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function update(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { caption, location } = req.body || {};

  try {
    const post = await updatePost(id, { caption, location });
    res.status(200).json(post);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    await deletePost(id);
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { create, list, getOne, update, remove };
