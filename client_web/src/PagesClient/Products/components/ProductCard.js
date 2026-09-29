import React from "react";
import { Button, Card, Col, Tag } from "antd";
import { EyeOutlined, HeartFilled, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";

export default function ProductCard({
  product, priceInfo, priceText, discount, availableStock, stockLoading,
  stockLoaded, wishlist, wishlistBusy, formatPrice, image, onOpen, onAdd, onWishlist,
}) {
  return (
    <Col xs={12} sm={12} md={8} lg={6} xl={6}>
      <Card className="product-card" hoverable bodyStyle={{ padding: "14px" }} cover={
        <div className="product-image-wrapper" onClick={() => onOpen(product)}>
          <img src={image} alt={product.name} className="product-image" />
          {product.isNew && <Tag color="green" className="product-tag product-new">MỚI</Tag>}
          {product.isBestSeller && <Tag color="gold" className="product-tag product-best">BÁN CHẠY</Tag>}
          {product.isOnSale && discount > 0 && <Tag color="red" className="product-discount">-{discount}%</Tag>}
        </div>
      }>
        <div className="product-name" onClick={() => onOpen(product)}>{product.name}</div>
        <div className="product-price"><span>{priceText}</span>{priceInfo.originalPrice && priceInfo.originalPrice > priceInfo.price && <del>{formatPrice(priceInfo.originalPrice)}</del>}</div>
        <div className="product-stock">{stockLoading && !stockLoaded ? <span className="stock-checking">Đang kiểm tra tồn kho...</span> : availableStock > 0 ? <span className="stock-available">Còn {availableStock} sản phẩm</span> : <span className="stock-out">Hết hàng</span>}</div>
        <div className="product-meta"><span>⭐ {Number(product.ratingAverage || 0).toFixed(1)}</span><span>({product.ratingCount || 0})</span><span>Đã bán {product.soldCount || 0}</span></div>
        <div className="product-actions">
          <Button icon={<EyeOutlined />} onClick={() => onOpen(product)} className="product-view-button">Xem</Button>
          <Button type="primary" icon={<ShoppingCartOutlined />} disabled={!availableStock} onClick={() => onAdd(product)}>Thêm giỏ</Button>
          <Button type="text" icon={wishlist ? <HeartFilled /> : <HeartOutlined />} className="product-wishlist-button" loading={wishlistBusy} aria-label={wishlist ? "Bỏ yêu thích" : "Thêm yêu thích"} onClick={() => onWishlist(product)} />
        </div>
      </Card>
    </Col>
  );
}
