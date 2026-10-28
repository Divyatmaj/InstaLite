const {
  postExists,
  listLikers,
  createLike,
  deleteLike,
} = require("../services/likes.service");

// P2002: unique constraint failed, P2003: foreign key constraint failed,
// P2025: record not found
async function list(req, res) {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId)) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const users = await listLikers(postId);
    if (!users) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function create(req, res) {
  const { userId } = req.body || {};

  if (userId === undefined || userId === null) {
    return res.status(400).json({ error: "userId is required" });
  }

  const postId = Number(req.params.id);

  try {
    if (!Number.isInteger(postId) || !(await postExists(postId))) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!Number.isInteger(userId)) {
      return res.status(404).json({ error: "User not found" });
    }

    const like = await createLike(userId, postId);
    res.status(201).json(like);
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(404).json({ error: "User not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

async function remove(req, res) {
  const postId = Number(req.params.id);
  const userId = Number(req.params.userId);

  if (!Number.isInteger(postId) || !Number.isInteger(userId)) {
    return res.status(404).json({ error: "Like not found" });
  }

  try {
    await deleteLike(userId, postId);
    res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

module.exports = { list, create, remove };
