const groups = [
  "user",
  "address",
  "brand",
  "category",
  "product",
  "variant",
  "cart",
  "coupon",
  "notification",
  "order",
  "orderItem",
  "payment",
  "review",
  "wishlist",
  "newsArticle",
  "newsCategory",
  "banner",
];
const P = {};
for (const g of groups)
  for (const a of ["read", "create", "update", "delete"])
    P[`${g.toUpperCase()}_${a.toUpperCase()}`] = `${g}.${a}`;
Object.assign(P, {
  USER_ROLE: "user.role",
  USER_PERMISSIONS: "user.permissions",
  USER_STATUS: "user.status",
  ORDER_CANCEL: "order.cancel",
  ORDER_COMPLETE: "order.complete",
  ORDER_REFUND: "order.refund",
  REVIEW_MODERATE: "review.moderate",
  INVENTORY_READ: "inventory.read",
  INVENTORY_ADJUST: "inventory.adjust",
  REPORT_READ: "report.read",
});
module.exports = P;
