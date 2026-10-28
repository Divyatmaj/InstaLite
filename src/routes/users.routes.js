const express = require("express");
const {
  create,
  list,
  getOne,
  update,
  remove,
  posts,
  likedPosts,
} = require("../controllers/users.controller");

const router = express.Router();

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);
router.get("/:id/posts", posts);
router.get("/:id/liked-posts", likedPosts);

module.exports = router;
