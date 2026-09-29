const router = require("express").Router();
const controller = require("../controllers/newsController");
const { protect } = require("../middlewares/authMiddleware");
const permission = require("../middlewares/permissionMiddleware");
const P = require("../constants/permissions");

router.get("/categories", controller.categories);
router.get("/", controller.list);
router.get("/:slug", controller.get);
router.post("/", protect, permission(P.NEWSARTICLE_CREATE), controller.createArticle);
router.patch("/:id", protect, permission(P.NEWSARTICLE_UPDATE), controller.updateArticle);
router.delete("/:id", protect, permission(P.NEWSARTICLE_DELETE), controller.deleteArticle);

module.exports = router;
