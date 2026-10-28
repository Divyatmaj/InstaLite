const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../services/posts.service");

// P2025: record not found
async function create(req, res) {
  const { imageUrl, caption, location } = req.body || {};

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const post = await createPost({ imageUrl, caption, location });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

const POST_SORT_FIELDS = ["createdAt", "updatedAt"];
const POSITIVE_INT = /^[1-9]\d*$/;

async function list(req, res) {
  const {
    page = "1",
    limit = "10",
    sortBy = "createdAt",
    order = "desc",
    location,
    search,
    from,
    to,
  } = req.query;

  if (!POSITIVE_INT.test(page) || !POSITIVE_INT.test(limit)) {
    return res
      .status(400)
      .json({ error: "page and limit must be positive integers" });
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
      page: Number(page),
      limit: Math.min(Number(limit), 50),
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
