import React from "react";
import { useTranslation } from "react-i18next";
import { localized } from "../../../utils/localized";
import { Link } from "react-router-dom";
import Media from "../../../Components/Media";

const money = (value) => Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
const imageOf = (product) => product?.thumbnail || product?.images?.[0] || product?.video || "";

export default function FeaturedCard({ product }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const image = imageOf(product);
  const productName = localized(product, "name", lang);
  const brandName = localized(product.brand, "name", lang) || localized(product.category, "name", lang);
  return (
    <article className="home-product-card">
      <Link className="home-product-image" to={`/products/${product._id}`}>
        {image ? <Media src={image} alt={productName} imageClassName="home-product-media" controls={false} muted loop autoPlay /> : <span>{String(productName || t("Products")).slice(0, 2).toUpperCase()}</span>}
        {product.isNew && <b className="home-product-badge">{t("New")}</b>}
        {product.isBestSeller && <b className="home-product-badge bestseller">{t("BestSelling")}</b>}
      </Link>
      <div className="home-product-copy">
        <small>{brandName || t("BrandMark")}</small>
        <Link to={`/products/${product._id}`}><h3>{productName}</h3></Link>
        <div className="home-product-meta"><span>★ {Number(product.ratingAverage || 0).toFixed(1)}</span><span>{Number(product.ratingCount || 0)} {t("Reviews")}</span></div>
        <div className="home-product-price">
          {product.minPrice != null ? <strong>{product.minPrice === product.maxPrice ? money(product.minPrice) : `${money(product.minPrice)} – ${money(product.maxPrice)}`}</strong> : <strong>{t("PriceUnavailable")}</strong>}
          <Link to={`/products/${product._id}`} aria-label={`${t("View")} ${productName}`}>{t("View")} →</Link>
        </div>
      </div>
    </article>
  );
}
