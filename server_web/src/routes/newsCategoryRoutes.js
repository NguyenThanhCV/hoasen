const router = require("express").Router();
const controller = require("../controllers/newsController");
const { protect } = require("../middlewares/authMiddleware");
const permission = require("../middlewares/permissionMiddleware");
const P = require("../constants/permissions");

router.get("/", controller.categories);
router.post("/", protect, permission(P.NEWSCATEGORY_CREATE), controller.createCategory);
router.patch("/:id", protect, permission(P.NEWSCATEGORY_UPDATE), controller.updateCategory);
router.delete("/:id", protect, permission(P.NEWSCATEGORY_DELETE), controller.deleteCategory);

module.exports = router;
