import React from "react";
import { useTranslation } from "react-i18next";
import { localized } from "../../../utils/localized";
import { Button, Card, Col, Tag } from "antd";
import { EyeOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import Media from "../../../Components/Media";

export default function ProductCard({
  product, priceInfo, priceText, discount, availableStock, stockLoading,
  stockLoaded, wishlist, wishlistBusy, formatPrice, image, onOpen, onAdd, onWishlist,
}) {
  const { t, i18n } = useTranslation();
  const name = localized(product, "name", i18n.resolvedLanguage || i18n.language);
  return (
    <Col xs={12} sm={12} md={8} lg={6} xl={6}>
      <Card className="product-card" hoverable bodyStyle={{ padding: "14px" }} cover={
        <div className="product-image-wrapper" onClick={() => onOpen(product)}>
          <Media src={image} alt={name} imageClassName="product-image" controls={false} muted loop autoPlay />
          {product.isNew && <Tag color="green" className="product-tag product-new">{t("TagNew")}</Tag>}
          {product.isBestSeller && <Tag color="gold" className="product-tag product-best">{t("TagBestSeller")}</Tag>}
          {product.isOnSale && discount > 0 && <Tag color="red" className="product-discount">-{discount}%</Tag>}
        </div>
      }>
        <div className="product-name" onClick={() => onOpen(product)}>{name}</div>
        <div className="product-price"><span>{priceText}</span>{priceInfo.originalPrice && priceInfo.originalPrice > priceInfo.price && <del>{formatPrice(priceInfo.originalPrice)}</del>}</div>
        <div className="product-stock">{stockLoading && !stockLoaded ? <span className="stock-checking">{t("CheckingInventory")}</span> : availableStock > 0 ? <span className="stock-available">{t("ItemsAvailable", { count: availableStock })}</span> : <span className="stock-out">{t("OutOfStock")}</span>}</div>
        <div className="product-meta"><span>⭐ {Number(product.ratingAverage || 0).toFixed(1)}</span><span>({product.ratingCount || 0})</span><span>Đã bán {product.soldCount || 0}</span></div>
        <div className="product-actions">
          <Button icon={<EyeOutlined />} onClick={() => onOpen(product)} className="product-view-button">{t("View")}</Button>
          <Button type="primary" icon={<ShoppingCartOutlined />} disabled={!availableStock} onClick={() => onAdd(product)}>{t("AddToCart")}</Button>
          <Button type="text" icon={wishlist ? <HeartFilled /> : <HeartOutlined />} className="product-wishlist-button" loading={wishlistBusy} aria-label={wishlist ? t("RemoveFavorite") : t("AddFavorite")} onClick={() => onWishlist(product)} />
        </div>
      </Card>
    </Col>
  );
}
