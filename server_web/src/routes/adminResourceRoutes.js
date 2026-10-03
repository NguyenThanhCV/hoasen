const r = require("express").Router(),
  { protect } = require("../middlewares/authMiddleware"),
  perm = require("../middlewares/permissionMiddleware"),
  P = require("../constants/permissions"),
  crud = require("../controllers/crudController"),
  cs = require("../services/crudService");
const models = [
  [
    "addresses",
    require("../models/Address"),
    P.ADDRESS_READ,
    P.ADDRESS_CREATE,
    P.ADDRESS_UPDATE,
    P.ADDRESS_DELETE,
    ["user"],
  ],
  [
    "carts",
    require("../models/Cart"),
    P.CART_READ,
    P.CART_CREATE,
    P.CART_UPDATE,
    P.CART_DELETE,
    ["user", "items.product", "items.variant"],
  ],
  [
    "notifications",
    require("../models/Notification"),
    P.NOTIFICATION_READ,
    P.NOTIFICATION_CREATE,
    P.NOTIFICATION_UPDATE,
    P.NOTIFICATION_DELETE,
    ["user"],
  ],
  [
    "couponRedemptions",
    require("../models/CouponRedemption"),
    P.COUPON_READ,
    P.COUPON_CREATE,
    P.COUPON_UPDATE,
    P.COUPON_DELETE,
    ["coupon", "user"],
  ],
  [
    "promotions",
    require("../models/Promotion"),
    P.PROMOTION_READ,
    P.PROMOTION_CREATE,
    P.PROMOTION_UPDATE,
    P.PROMOTION_DELETE,
    ["productIds", "categoryIds", "brandIds"],
  ],
  [
    "wishlists",
    require("../models/Wishlist"),
    P.WISHLIST_READ,
    P.WISHLIST_CREATE,
    P.WISHLIST_UPDATE,
    P.WISHLIST_DELETE,
    ["user", "products"],
  ],
  [
    "orders",
    require("../models/Order"),
    P.ORDER_READ,
    P.ORDER_CREATE,
    P.ORDER_UPDATE,
    P.ORDER_DELETE,
    ["user", "coupon"],
  ],
  [
    "payments",
    require("../models/Payment"),
    P.PAYMENT_READ,
    P.PAYMENT_CREATE,
    P.PAYMENT_UPDATE,
    P.PAYMENT_DELETE,
    ["order", "user"],
  ],
  [
    "reviews",
    require("../models/Review"),
    P.REVIEW_READ,
    P.REVIEW_CREATE,
    P.REVIEW_UPDATE,
    P.REVIEW_DELETE,
    ["product", "user", "order"],
  ],
  ["newsArticles", require("../models/NewsArticle"), P.NEWSARTICLE_READ, P.NEWSARTICLE_CREATE, P.NEWSARTICLE_UPDATE, P.NEWSARTICLE_DELETE, ["category", "author"]],
  ["newsCategories", require("../models/NewsCategory"), P.NEWSCATEGORY_READ, P.NEWSCATEGORY_CREATE, P.NEWSCATEGORY_UPDATE, P.NEWSCATEGORY_DELETE, []],
  ["banners", require("../models/Banner"), P.BANNER_READ, P.BANNER_CREATE, P.BANNER_UPDATE, P.BANNER_DELETE, []],
];
r.use(protect);
for (const [path, M, pr, pc, pu, pd, pop] of models) {
  const c = crud.make(cs.make(M, { populate: pop })),
    x = require("express").Router();
  x.get("/", perm(pr), c.list);
  x.get("/:id", perm(pr), c.get);
  x.post("/", perm(pc), c.create);
  x.patch("/:id", perm(pu), c.update);
  x.delete("/:id", perm(pd), c.remove);
  r.use(`/${path}`, x);
}
module.exports = r;
