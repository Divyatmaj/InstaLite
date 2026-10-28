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

async function list(req, res) {
  try {
    const posts = await listPosts();
    res.status(200).json(posts);
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
