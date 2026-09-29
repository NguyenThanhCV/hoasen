const router = require("express").Router();
const controller = require("../controllers/bannerController");

router.get("/", controller.list);

module.exports = router;
