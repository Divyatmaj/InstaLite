const {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../services/users.service");

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
  try {
    const users = await listUsers();
    res.status(200).json(users);
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

module.exports = { create, list, getOne, update, remove };
