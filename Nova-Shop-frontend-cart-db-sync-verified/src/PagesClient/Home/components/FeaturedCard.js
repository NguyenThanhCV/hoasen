import React from "react";
import { Link } from "react-router-dom";

const money = (value) => Number(value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
const imageOf = (product) => product?.thumbnail || product?.images?.[0] || "";

export default function FeaturedCard({ product }) {
  const image = imageOf(product);
  return (
    <article className="home-product-card">
      <Link className="home-product-image" to={`/products/${product._id}`}>
        {image ? <img src={image} alt={product.name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span>{String(product.name || "Sản phẩm").slice(0, 2).toUpperCase()}</span>}
        {product.isNew && <b className="home-product-badge">Mới</b>}
        {product.isBestSeller && <b className="home-product-badge bestseller">Bán chạy</b>}
      </Link>
      <div className="home-product-copy">
        <small>{product.brand?.name || product.category?.name || "Vật tư nhà kính Hoa Sen"}</small>
        <Link to={`/products/${product._id}`}><h3>{product.name}</h3></Link>
        <div className="home-product-meta"><span>★ {Number(product.ratingAverage || 0).toFixed(1)}</span><span>{Number(product.ratingCount || 0)} đánh giá</span></div>
        <div className="home-product-price">
          {product.minPrice != null ? <strong>{product.minPrice === product.maxPrice ? money(product.minPrice) : `${money(product.minPrice)} – ${money(product.maxPrice)}`}</strong> : <strong>Chưa có giá</strong>}
          <Link to={`/products/${product._id}`} aria-label={`Xem ${product.name}`}>Xem →</Link>
        </div>
      </div>
    </article>
  );
}
