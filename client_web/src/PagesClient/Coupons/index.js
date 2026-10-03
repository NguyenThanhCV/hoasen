import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Empty, Spin, Tag, Tabs, message } from "antd";
import { CopyOutlined, TagOutlined, ClockCircleOutlined, FireOutlined, ShoppingOutlined, ReloadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getCoupons, getProducts } from "../../api/shop";
import { getVariantsService } from "../../api/apiVariant";
import "./style.css";
import Media from "../../Components/Media";
import { localized } from "../../utils/localized";

const dateLabel = (value, lang = "vi") => {
  const english = lang.startsWith("en");
  if (!value) return english ? "No time limit" : "Không giới hạn thời gian";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? (english ? "No time limit" : "Không giới hạn thời gian") : date.toLocaleDateString(english ? "en-US" : "vi-VN");
};

const money = (value) => new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + "₫";

function discountLabel(coupon, t) {
  if (coupon.type === "percentage") {
    return `${t("DiscountByPercent", { percent: coupon.value })}${coupon.maxDiscount ? ` · ${t("MaximumDiscount", { amount: money(coupon.maxDiscount) })}` : ""}`;
  }
  return t("DiscountByAmount", { amount: money(coupon.value) });
}

function isAvailable(coupon, now) {
  return coupon.status === "active"
    && (!coupon.startDate || new Date(coupon.startDate) <= now)
    && (!coupon.endDate || new Date(coupon.endDate) >= now)
    && (coupon.usageLimit == null || Number(coupon.usedCount || 0) < Number(coupon.usageLimit));
}

export default function CouponsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const [coupons, setCoupons] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotionLoading, setPromotionLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getCoupons({ page: 1, limit: 100, sort: "newest" }).then((response) => {
      if (active) setCoupons(Array.isArray(response?.data) ? response.data : []);
    }).catch((requestError) => {
      if (active) setError(requestError?.response?.data?.message || t("CouponLoadError"));
    }).finally(() => { if (active) setLoading(false); });

    getProducts({ page: 1, limit: 100, status: "active", sort: "newest" }).then(async (response) => {
      const products = Array.isArray(response?.data) ? response.data : [];
      const candidates = products.filter((product) => product.isOnSale);
      const items = await Promise.all(candidates.map(async (product) => {
        try {
          const variantResponse = await getVariantsService({ product: product._id, limit: 100 });
          const variants = variantResponse?.data?.data || [];
          const discounted = variants.filter((variant) => variant.active !== false && Number(variant.compareAtPrice) > Number(variant.price));
          if (!discounted.length) return null;
          const lowest = discounted.reduce((best, variant) => Number(variant.price) < Number(best.price) ? variant : best);
          const original = Number(lowest.compareAtPrice);
          return { ...product, salePrice: Number(lowest.price), originalPrice: original, discountPercent: Math.round((1 - Number(lowest.price) / original) * 100) };
        } catch (_) { return null; }
      }));
      if (active) setPromotions(items.filter(Boolean));
    }).catch(() => {
      if (active) setPromotions([]);
    }).finally(() => { if (active) setPromotionLoading(false); });

    return () => { active = false; };
  }, [t]);

  const now = new Date();
  const available = coupons.filter((coupon) => isAvailable(coupon, now));

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      message.success(t("CopiedCode", { code }));
    } catch (_) {
      message.error(t("CopyFailed"));
    }
  };

  const retryCoupons = () => {
    setLoading(true);
    setError("");
    getCoupons({ page: 1, limit: 100, sort: "newest" })
      .then((response) => setCoupons(Array.isArray(response?.data) ? response.data : []))
      .catch((requestError) => setError(requestError?.response?.data?.message || t("CouponLoadError")))
      .finally(() => setLoading(false));
  };

  return (
    <main className="coupon-page">
      <section className="coupon-hero">
        <div className="coupon-hero-copy">
          <span className="coupon-eyebrow"><TagOutlined /> {t("CouponsEyebrow")}</span>
          <h1>{t("CouponHeroTitle")}</h1>
          <p>{t("CouponHeroDescription")}</p>
        </div>
        <div className="coupon-hero-art" aria-hidden="true"><span>%</span><i /><b /><b /><b /></div>
      </section>

      <section className="coupon-list-section">
        <Tabs className="coupon-tabs" defaultActiveKey="promotions">
          <Tabs.TabPane tab={<span><FireOutlined /> {t("ProductPromotions")}</span>} key="promotions">
              <div className="coupon-section-heading"><div><span className="coupon-eyebrow">{t("CurrentDeals")}</span><h2>{t("DiscountedProducts")}</h2></div><span className="coupon-count">{promotions.length} {t("ProductCount")}</span></div>
              {promotionLoading ? <div className="coupon-state"><Spin size="large" /><span>{t("LoadingPromotions")}</span></div>
                : promotions.length === 0 ? <div className="coupon-empty"><Empty description={t("NoPromotionalProducts")} /><p>{t("PromotionsUpdatedHere")}</p></div>
                  : <div className="promotion-grid">{promotions.map((product) => (
                    <Link className="promotion-product-card" to={`/products/${product._id}`} key={product._id}>
                      <div className="promotion-product-image">{product.thumbnail || product.video ? <Media src={product.thumbnail || product.video} alt={localized(product, "name", lang)} imageClassName="promotion-media" controls={false} muted loop autoPlay loading="lazy" /> : <ShoppingOutlined />}
                        <span>-{product.discountPercent}%</span></div>
                      <div className="promotion-product-info"><small><FireOutlined /> {t("Offer")}</small><h3>{localized(product, "name", lang)}</h3>
                        <strong>{money(product.salePrice)}</strong><del>{money(product.originalPrice)}</del></div>
                    </Link>
                  ))}</div>}
          </Tabs.TabPane>
          <Tabs.TabPane tab={<span><TagOutlined /> {t("DiscountCodes")}</span>} key="coupons">
              <div className="coupon-section-heading"><div><span className="coupon-eyebrow">{t("ForYou")}</span><h2>{t("AvailableCoupons")}</h2></div>{!loading && <span className="coupon-count">{available.length} {t("PromotionsPlural")}</span>}</div>
              {loading ? <div className="coupon-state"><Spin size="large" /><span>{t("LoadingCoupons")}</span></div>
                : error ? <div className="coupon-state coupon-error"><p>{error}</p><button type="button" className="coupon-retry" onClick={retryCoupons}><ReloadOutlined /> {t("TryAgain")}</button></div>
                  : available.length === 0 ? <div className="coupon-empty"><Empty description={t("NoUsableCoupons")} /><p>{t("ComeBackForOffers")}</p></div>
                    : <div className="coupon-grid">{available.map((coupon) => (
                <article className="coupon-card" key={coupon._id}>
                  <div className="coupon-card-accent"><span>%</span></div>
                  <div className="coupon-card-content">
                    <div className="coupon-card-top"><Tag color="green">{t("ActiveNow")}</Tag><span className="coupon-type">{coupon.type === "percentage" ? t("PercentOffer") : t("OrderOffer")}</span></div>
                    <h3>{localized(coupon, "name", lang) || coupon.name}</h3>
                    <strong className="coupon-discount">{discountLabel(coupon, t)}</strong>
                    <div className="coupon-requirement">{t("MinimumOrder")} {money(coupon.minOrderValue)}</div>
                    <div className="coupon-card-bottom">
                      <span><ClockCircleOutlined /> {t("Expires")} {dateLabel(coupon.endDate, lang)}</span>
                      <button type="button" onClick={() => copyCode(coupon.code)} aria-label={`${t("CopyCode")} ${coupon.code}`}><code>{coupon.code}</code><CopyOutlined /></button>
                    </div>
                  </div>
                </article>
              ))}</div>}
              <div className="coupon-help">{t("CouponHelp")}<Link to="/products"> {t("ViewProducts")} →</Link></div>
          </Tabs.TabPane>
        </Tabs>
      </section>
    </main>
  );
}
