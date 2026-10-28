const express = require("express");
const {
  create,
  list,
  getOne,
  update,
  remove,
} = require("../controllers/posts.controller");
const likes = require("../controllers/likes.controller");

const router = express.Router();

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);
router.get("/:id/likes", likes.list);
router.post("/:id/likes", likes.create);
router.delete("/:id/likes/:userId", likes.remove);

module.exports = router;
