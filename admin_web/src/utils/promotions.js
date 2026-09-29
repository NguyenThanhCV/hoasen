const KEY = "shop_admin_promotions_v2";
export const PROMO_KEY = KEY;

export const PROMOTION_SCOPES = {
  product: "Sản phẩm",
  category: "Danh mục",
  brand: "Thương hiệu",
};

export const PROMOTION_PRIORITY = { product: 3, category: 2, brand: 1 };

export const promoId = () => `promo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export function loadPromotions() {
  try {
    const current = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(current)) return current;
    const legacy = JSON.parse(localStorage.getItem("shop_admin_promotions_v1") || "[]");
    return Array.isArray(legacy) ? legacy : [];
  } catch { return []; }
}

export function savePromotions(rows) {
  localStorage.setItem(KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("promotions-changed"));
}

export function activePromotions(rows = loadPromotions(), now = Date.now()) {
  return rows.filter(x =>
    x.status !== "inactive" &&
    (!x.startDate || new Date(x.startDate).getTime() <= now) &&
    (!x.endDate || new Date(x.endDate).getTime() >= now)
  );
}

const ids = value => (value || []).map(String);
const refId = value => String(value?._id || value?.id || value || "");

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
export function discountForProduct(product, promotions = loadPromotions(), now = Date.now()) {
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
