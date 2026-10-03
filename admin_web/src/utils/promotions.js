export const PROMOTION_PRIORITY = { product: 3, category: 2, brand: 1 };
export function activePromotions(rows = [], now = Date.now()) {
  return rows.filter(x =>
    x.status !== "inactive" &&
    (!x.startDate || new Date(x.startDate).getTime() <= now) &&
    (!x.endDate || new Date(x.endDate).getTime() >= now)
  );
}

const refId = value => String(value?._id || value?.id || value || "");
const ids = value => (value || []).map(refId);

export function promotionMatchesProduct(promo, product) {
  const pid = refId(product);
  const cid = refId(product?.category);
  const bid = refId(product?.brand);
  if (promo.scope === "product") return ids(promo.productIds).includes(pid);
  if (promo.scope === "category") return ids(promo.categoryIds).includes(cid);
  if (promo.scope === "brand") return ids(promo.brandIds).includes(bid);
  return false;
}

// Một sản phẩm chỉ nhận 1 chương trình. Ưu tiên: sản phẩm > danh mục > thương hiệu.
// Nếu cùng cấp có nhiều chương trình phù hợp, chương trình cập nhật sau được chọn.
export function discountForProduct(product, promotions = [], now = Date.now()) {
  const active = activePromotions(promotions, now);
  const candidates = active
    .filter(promo => promotionMatchesProduct(promo, product))
    .sort((a, b) => {
      const priority = (PROMOTION_PRIORITY[b.scope] || 0) - (PROMOTION_PRIORITY[a.scope] || 0);
      if (priority) return priority;
      return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
    });
  return candidates[0] || null;
}

export function calcDiscount(price, promo) {
  const p = Number(price) || 0;
  if (!promo || p <= 0) return { price: p, discount: 0, percent: 0 };
  let d = promo.type === "percent" ? p * (Number(promo.value) || 0) / 100 : Number(promo.value) || 0;
  d = Math.max(0, Math.min(d, p));
  const discount = Math.round(d);
  return { price: p - discount, discount, percent: p ? Math.round(discount / p * 100) : 0 };
}
