import React, { useEffect, useMemo, useState } from "react";

import {
  ArrowLeftOutlined,
  CarOutlined,
  CheckCircleOutlined,
  HeartFilled,
  HeartOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  StarFilled,
} from "@ant-design/icons";

import {
  Button,
  Empty,
  Image,
  InputNumber,
  Skeleton,
  Space,
  Tag,
  message,
} from "antd";

import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";

import { useNavigate, useParams } from "react-router-dom";

import {
  clearProductDetailAction,
  getProductDetailRequestAction,
  getProductVariantsRequestAction,
  setSelectedVariantAction,
} from "./stores/actions";

import {
  selectProductDetail,
  selectProductDetailLoading,
  selectProductVariantLoading,
  selectProductVariants,
  selectSelectedVariant,
} from "./stores/selectors";

import "./style.css";
import { addCartItem } from "../../api/shop";
import { getReviews, createReview, getWishlist, addWishlist, removeWishlist } from "../../api/shop";
import ProductReviews from "./components/ProductReviews";
import { useSeo } from "../../Components/SEO";

const sanitizeDescription = (html) => {
  if (typeof DOMParser === "undefined") return String(html || "").replace(/<[^>]*>/g, " ");
  const document = new DOMParser().parseFromString(String(html || ""), "text/html");
  const allowed = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "UL", "OL", "LI", "H2", "H3", "H4", "BLOCKQUOTE", "A"]);
  document.body.querySelectorAll("*").forEach((node) => {
    if (!allowed.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }
    [...node.attributes].forEach((attribute) => {
      if (node.tagName !== "A" || attribute.name !== "href") node.removeAttribute(attribute.name);
    });
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      if (!/^(https?:|mailto:|\/|#)/i.test(href)) node.removeAttribute("href");
      node.setAttribute("rel", "noopener noreferrer");
    }
  });
  return document.body.innerHTML;
};

const formatPrice = (price) => {
  if (price === undefined || price === null) {
    return "Liên hệ";
  }

  return `${Number(price).toLocaleString("vi-VN")}đ`;
};

const getAvailableStock = (variant) => {
  if (!variant) {
    return 0;
  }

  if (variant.availableStock !== undefined && variant.availableStock !== null) {
    return Math.max(Number(variant.availableStock) || 0, 0);
  }

  const stock = Number(variant.stock) || 0;
  const reservedStock = Number(variant.reservedStock) || 0;

  return Math.max(stock - reservedStock, 0);
};

const normalizeAttributes = (attributes) => {
  if (!attributes) {
    return {};
  }

  if (typeof attributes === "object" && !Array.isArray(attributes)) {
    return attributes;
  }

  return {};
};

const getAttributeEntries = (variant) => {
  const attributes = normalizeAttributes(variant?.attributes);

  return Object.entries(attributes);
};

const ProductDetail = ({
  productDetail,
  variants,
  selectedVariant,
  isLoading,
  isVariantLoading,

  getProductDetail,
  getProductVariants,

  setSelectedVariant,
  clearProductDetail,
}) => {
  const { productId } = useParams();

  const navigate = useNavigate();

  const [selectedAttributes, setSelectedAttributes] = useState({});

  const [quantity, setQuantity] = useState(1);

  const [favorite, setFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", content: "" });
  const [reviewSaving, setReviewSaving] = useState(false);

  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!productId) {
      return;
    }

    getProductDetail(productId);
    getProductVariants(productId);

    return () => {
      clearProductDetail();
    };
  }, [productId, getProductDetail, getProductVariants, clearProductDetail]);

  useEffect(() => {
    let active = true;
    setReviewsLoading(true);
    getReviews(productId, { page: 1, limit: 10 })
      .then((response) => {
        if (!active) return;
        setReviews(Array.isArray(response?.data) ? response.data : []);
        setReviewTotal(Number(response?.pagination?.total || response?.data?.length || 0));
        setReviewError("");
      })
      .catch((error) => {
        if (active) setReviewError(error.response?.data?.message || "Không thể tải đánh giá.");
      })
      .finally(() => { if (active) setReviewsLoading(false); });
    return () => { active = false; };
  }, [productId]);

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem("token")) {
      setFavorite(false);
      return () => { active = false; };
    }
    getWishlist().then((response) => {
      if (active) setFavorite((response?.data?.products || []).some((product) => String(product?._id || product) === String(productId)));
    }).catch(() => {});
    return () => { active = false; };
  }, [productId]);

  /*
   * Xác định sản phẩm có variant hay không.
   */
  const hasVariants = useMemo(() => {
    if (variants?.length > 0) {
      return true;
    }

    if (productDetail?.hasVariants) {
      return true;
    }

    return false;
  }, [variants, productDetail]);

  /*
   * Tạo danh sách option động từ attributes.
   *
   * Ví dụ:
   *
   * color: [Đen, Trắng]
   * size: [S, M, L]
   */
  const attributeGroups = useMemo(() => {
    const groups = {};

    variants.forEach((variant) => {
      const attributes = normalizeAttributes(variant?.attributes);

      Object.entries(attributes).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        if (!groups[key]) {
          groups[key] = [];
        }

        const stringValue = String(value);

        if (!groups[key].includes(stringValue)) {
          groups[key].push(stringValue);
        }
      });
    });

    return groups;
  }, [variants]);

  /*
   * Kiểm tra một option có thể chọn được không.
   *
   * Ví dụ:
   * Đen + XL không tồn tại
   * => XL sẽ disabled khi đang chọn Đen.
   */
  const isAttributeValueAvailable = (attributeName, value) => {
    if (!variants.length) {
      return false;
    }

    return variants.some((variant) => {
      if (!variant?.active) {
        return false;
      }

      if (getAvailableStock(variant) <= 0) {
        return false;
      }

      const attributes = normalizeAttributes(variant.attributes);

      if (String(attributes[attributeName]) !== String(value)) {
        return false;
      }

      return Object.entries(selectedAttributes).every(
        ([key, selectedValue]) => {
          if (key === attributeName) {
            return true;
          }

          return String(attributes[key]) === String(selectedValue);
        },
      );
    });
  };

  /*
   * Tìm variant phù hợp với các option
   * đang được chọn.
   */
  useEffect(() => {
    if (!variants.length) {
      return;
    }

    const selectedKeys = Object.keys(selectedAttributes);

    if (!selectedKeys.length) {
      return;
    }

    const matchedVariant = variants.find((variant) => {
      if (!variant?.active) {
        return false;
      }

      const attributes = normalizeAttributes(variant.attributes);

      return selectedKeys.every(
        (key) => String(attributes[key]) === String(selectedAttributes[key]),
      );
    });

    /*
     * Chỉ tự chọn khi khớp đầy đủ toàn bộ
     * attributes của variant.
     */
    if (matchedVariant) {
      const matchedAttributes = normalizeAttributes(matchedVariant.attributes);

      const allKeys = Object.keys(attributeGroups);

      const isComplete = allKeys.every(
        (key) =>
          selectedAttributes[key] !== undefined &&
          selectedAttributes[key] !== null &&
          selectedAttributes[key] !== "",
      );

      if (isComplete) {
        setSelectedVariant(matchedVariant);
      }
    }
  }, [selectedAttributes, variants, attributeGroups, setSelectedVariant]);

  /*
   * Nếu sản phẩm chỉ có một variant,
   * tự chọn.
   */
  useEffect(() => {
    if (variants.length === 1 && variants[0]) {
      const variant = variants[0];

      setSelectedVariant(variant);

      const attributes = normalizeAttributes(variant.attributes);

      setSelectedAttributes(attributes);
    }
  }, [variants, setSelectedVariant]);

  /*
   * Variant đang dùng để hiển thị.
   */
  const currentVariant = hasVariants ? selectedVariant : null;

  /*
   * Giá hiện tại.
   */
  const currentPrice = currentVariant?.price ?? productDetail?.price ?? 0;

  /*
   * Giá gốc.
   */
  const currentOriginalPrice =
    currentVariant?.compareAtPrice ?? productDetail?.originalPrice ?? null;

  /*
   * Tồn kho hiện tại.
   */
  const currentStock = hasVariants
    ? getAvailableStock(currentVariant)
    : Math.max(Number(productDetail?.stock) || 0, 0);

  /*
   * SKU.
   */
  const currentSku = currentVariant?.sku || productDetail?.sku || "";
  const safeDescription = useMemo(() => sanitizeDescription(productDetail?.description), [productDetail?.description]);

  /*
   * Ảnh sản phẩm.
   */
  const images = useMemo(() => {
    const source = currentVariant || productDetail;

    const list = [];

    if (source?.thumbnail) {
      list.push(source.thumbnail);
    }

    if (Array.isArray(source?.images)) {
      source.images.forEach((image) => {
        if (image && !list.includes(image)) {
          list.push(image);
        }
      });
    }

    if (!list.length && productDetail) {
      if (productDetail.thumbnail) {
        list.push(productDetail.thumbnail);
      }

      if (Array.isArray(productDetail.images)) {
        productDetail.images.forEach((image) => {
          if (image && !list.includes(image)) {
            list.push(image);
          }
        });
      }
    }

    return list;
  }, [currentVariant, productDetail]);

  useEffect(() => {
    setActiveImage(0);
  }, [currentVariant]);

  /*
   * Discount.
   */
  const discountPercent = useMemo(() => {
    if (
      !currentOriginalPrice ||
      !currentPrice ||
      Number(currentOriginalPrice) <= Number(currentPrice)
    ) {
      return 0;
    }

    return Math.round(
      ((Number(currentOriginalPrice) - Number(currentPrice)) /
        Number(currentOriginalPrice)) *
        100,
    );
  }, [currentOriginalPrice, currentPrice]);

  /*
   * Chọn attribute.
   */
  const handleSelectAttribute = (attributeName, value) => {
    setSelectedAttributes((previous) => ({
      ...previous,
      [attributeName]: value,
    }));

    /*
     * Nếu đổi option, reset quantity.
     */
    setQuantity(1);

    /*
     * Nếu chưa chọn đủ option,
     * bỏ selected variant hiện tại.
     */
    const nextAttributes = {
      ...selectedAttributes,
      [attributeName]: value,
    };

    const attributeKeys = Object.keys(attributeGroups);

    const isComplete = attributeKeys.every(
      (key) =>
        nextAttributes[key] !== undefined &&
        nextAttributes[key] !== null &&
        nextAttributes[key] !== "",
    );

    if (!isComplete) {
      setSelectedVariant(null);
    }
  };

  /*
   * Tăng số lượng.
   */
  const increaseQuantity = () => {
    setQuantity((value) => {
      const next = Number(value) + 1;

      if (next > currentStock) {
        return currentStock;
      }

      return next;
    });
  };

  /*
   * Giảm số lượng.
   */
  const decreaseQuantity = () => {
    setQuantity((value) => Math.max(Number(value) - 1, 1));
  };

  /*
   * Add cart.
   */
  const addCurrentItem = async (redirect = false) => {
    if (!productDetail) return;
    if (!localStorage.getItem("token")) {
      message.warning("Vui lòng đăng nhập để mua hàng.");
      navigate("/login");
      return;
    }
    if (hasVariants && !currentVariant) {
      message.warning("Vui lòng chọn đầy đủ phiên bản sản phẩm.");
      return;
    }
    if (!currentVariant && !productDetail._id) return;
    if (currentStock <= 0) {
      message.warning("Sản phẩm hiện đã hết hàng.");
      return;
    }
    try {
      await addCartItem({
        product: productDetail._id,
        variant: currentVariant?._id,
        quantity: Number(quantity),
      });
      window.dispatchEvent(new Event("cart-change"));
      message.success("Đã thêm sản phẩm vào giỏ hàng.");
      if (redirect) navigate("/cart");
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

  const handleAddToCart = () => addCurrentItem(false);

  const handleBuyNow = () => addCurrentItem(true);

  const handleFavorite = async () => {
    if (!localStorage.getItem("token")) {
      message.info("Đăng nhập để lưu sản phẩm yêu thích.");
      navigate(`/login?next=/products/${productId}`);
      return;
    }
    setFavoriteBusy(true);
    try {
      if (favorite) {
        await removeWishlist(productId);
        setFavorite(false);
        message.success("Đã bỏ khỏi danh sách yêu thích.");
      } else {
        await addWishlist(productId);
        setFavorite(true);
        message.success("Đã lưu vào danh sách yêu thích.");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể cập nhật danh sách yêu thích.");
    } finally {
      setFavoriteBusy(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!localStorage.getItem("token")) {
      message.info("Đăng nhập để gửi đánh giá.");
      navigate(`/login?next=/products/${productId}`);
      return;
    }
    setReviewSaving(true);
    setReviewError("");
    try {
      await createReview({ product: productId, ...reviewForm });
      setReviewForm({ rating: 5, title: "", content: "" });
      message.success("Đánh giá đã được gửi và sẽ hiển thị sau khi duyệt.");
    } catch (error) {
      setReviewError(error.response?.data?.message || "Không thể gửi đánh giá.");
    } finally {
      setReviewSaving(false);
    }
  };

  const productDescription = String(productDetail?.shortDescription || productDetail?.description || "")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const productSchema = productDetail?.name ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productDetail.name,
    description: productDescription || `Sản phẩm ${productDetail.name} tại Vật tư nhà kính Hoa Sen.`,
    image: images,
    sku: currentSku || productDetail.sku || undefined,
    category: productDetail.category?.name || undefined,
    brand: productDetail.brand?.name ? { "@type": "Brand", name: productDetail.brand.name } : undefined,
    ...(Number(productDetail.ratingCount) > 0 && Number(productDetail.ratingAverage) > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(productDetail.ratingAverage),
        reviewCount: Number(productDetail.ratingCount),
      },
    } : {}),
    ...(Number(currentPrice) > 0 ? {
      offers: {
        "@type": "Offer",
        priceCurrency: "VND",
        price: Number(currentPrice),
        availability: currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    } : {}),
  } : undefined;
  useSeo({
    title: productDetail?.name ? `${productDetail.name} | Vật tư nhà kính Hoa Sen` : undefined,
    description: productDescription || undefined,
    image: images[0],
    type: "product",
    schema: productSchema,
  });

  if (isLoading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <Skeleton
            active
            paragraph={{
              rows: 12,
            }}
          />
        </div>
      </div>
    );
  }

  if (!productDetail) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <Empty description="Không tìm thấy sản phẩm" />

          <div className="product-empty-action">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/products")}>
              Quay lại sản phẩm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = currentStock <= 0;

  const needChooseVariant = hasVariants && !currentVariant;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* BACK */}
        <button
          type="button"
          className="product-back-button"
          onClick={() => navigate(-1)}>
          <ArrowLeftOutlined />
          <span>Quay lại</span>
        </button>

        {/* MAIN */}
        <div className="product-detail-main">
          {/* GALLERY */}
          <div className="product-gallery">
            <div className="product-gallery-main">
              {images.length > 0 ? (
                <Image
                  src={images[activeImage]}
                  alt={productDetail.name}
                  preview
                />
              ) : (
                <div className="product-no-image">Không có hình ảnh</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="product-gallery-thumbnails">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    className={`product-gallery-thumbnail ${
                      activeImage === index ? "active" : ""
                    }`}
                    onClick={() => setActiveImage(index)}>
                    <img src={image} alt={`${productDetail.name}-${index}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="product-detail-info">
            {/* BADGES */}
            <div className="product-detail-badges">
              {productDetail.isNew && <Tag color="green">Mới</Tag>}

              {productDetail.isBestSeller && <Tag color="orange">Bán chạy</Tag>}

              {productDetail.featured && <Tag color="blue">Nổi bật</Tag>}

              {discountPercent > 0 && (
                <Tag color="red">-{discountPercent}%</Tag>
              )}
            </div>

            {/* NAME */}
            <h1 className="product-detail-title">{productDetail.name}</h1>

            <div className="product-detail-taxonomy">
              {productDetail.brand?.name && <button type="button" onClick={() => navigate(`/products?brand=${productDetail.brand._id}`)}>{productDetail.brand.name}</button>}
              {productDetail.category?.name && <button type="button" onClick={() => navigate(`/products?category=${productDetail.category._id}`)}>{productDetail.category.name}</button>}
            </div>
            {productDetail.shortDescription && <p className="product-detail-short-description">{productDetail.shortDescription}</p>}

            {/* RATING */}
            <div className="product-detail-rating">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((item) => (
                  <StarFilled
                    key={item}
                    className={
                      item <=
                      Math.round(Number(productDetail.ratingAverage || 0))
                        ? "star-active"
                        : "star-inactive"
                    }
                  />
                ))}
              </div>

              <span>{Number(productDetail.ratingAverage || 0).toFixed(1)}</span>

              <span>
                ({reviewTotal}
                đánh giá)
              </span>

              <span>Đã bán {Number(productDetail.soldCount || 0)}</span>
            </div>

            {/* PRICE */}
            <div className="product-detail-price-box">
              <div className="product-detail-price">
                {formatPrice(currentPrice)}
              </div>

              {currentOriginalPrice &&
                Number(currentOriginalPrice) > Number(currentPrice) && (
                  <div className="product-detail-original-price">
                    {formatPrice(currentOriginalPrice)}
                  </div>
                )}
            </div>

            {/* VARIANT LOADING */}
            {isVariantLoading && (
              <div className="variant-loading">
                <Skeleton
                  active
                  paragraph={{
                    rows: 3,
                  }}
                />
              </div>
            )}

            {/* VARIANTS */}
            {!isVariantLoading &&
              hasVariants &&
              Object.keys(attributeGroups).length > 0 && (
                <div className="product-variants">
                  {Object.entries(attributeGroups).map(
                    ([attributeName, values]) => (
                      <div className="variant-group" key={attributeName}>
                        <div className="variant-group-title">
                          <span>{attributeName}</span>

                          {selectedAttributes[attributeName] && (
                            <strong>
                              {" "}
                              : {selectedAttributes[attributeName]}
                            </strong>
                          )}
                        </div>

                        <div className="variant-options">
                          {values.map((value) => {
                            const isSelected =
                              String(selectedAttributes[attributeName]) ===
                              String(value);

                            const available = isAttributeValueAvailable(
                              attributeName,
                              value,
                            );

                            return (
                              <button
                                type="button"
                                key={`${attributeName}-${value}`}
                                disabled={!available}
                                className={`variant-option ${
                                  isSelected ? "selected" : ""
                                } ${!available ? "disabled" : ""}`}
                                onClick={() =>
                                  handleSelectAttribute(attributeName, value)
                                }>
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

            {/* CHOOSE VARIANT MESSAGE */}
            {needChooseVariant && (
              <div className="variant-required-message">
                <span>Vui lòng chọn đầy đủ các thuộc tính sản phẩm.</span>
              </div>
            )}

            {/* SKU */}
            {currentSku && (
              <div className="product-detail-sku">
                SKU: <strong>{currentSku}</strong>
              </div>
            )}

            {/* STOCK */}
            <div className="product-detail-stock">
              <span>Tồn kho:</span>

              {isOutOfStock ? (
                <strong className="stock-out">Hết hàng</strong>
              ) : (
                <strong className="stock-in">{currentStock} sản phẩm</strong>
              )}
            </div>

            {/* QUANTITY */}
            <div className="product-detail-quantity">
              <span className="quantity-label">Số lượng:</span>

              <div className="quantity-control">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || isOutOfStock}>
                  <MinusOutlined />
                </button>

                <InputNumber
                  min={1}
                  max={currentStock || 1}
                  value={isOutOfStock ? 1 : quantity}
                  disabled={isOutOfStock || needChooseVariant}
                  onChange={(value) =>
                    setQuantity(
                      Math.min(
                        Math.max(Number(value) || 1, 1),
                        currentStock || 1,
                      ),
                    )
                  }
                />

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={isOutOfStock || quantity >= currentStock}>
                  <PlusOutlined />
                </button>
              </div>
            </div>

            {/* ACTION */}
            <div className="product-detail-actions">
              <Button
                size="large"
                icon={favorite ? <HeartFilled /> : <HeartOutlined />}
                className={`product-favorite-button ${
                  favorite ? "active" : ""
                }`}
                loading={favoriteBusy}
                aria-label={favorite ? "Bỏ yêu thích" : "Thêm yêu thích"}
                onClick={handleFavorite}
              />

              <Button
                size="large"
                icon={<ShoppingCartOutlined />}
                className="product-add-cart-button"
                disabled={isOutOfStock || needChooseVariant}
                onClick={handleAddToCart}>
                Thêm vào giỏ
              </Button>

              <Button
                type="primary"
                size="large"
                className="product-buy-button"
                disabled={isOutOfStock || needChooseVariant}
                onClick={handleBuyNow}>
                Mua ngay
              </Button>
            </div>

            {/* BENEFITS */}
            <div className="product-benefits">
              <div className="product-benefit">
                <CheckCircleOutlined />

                <div>
                  <strong>Sản phẩm chính hãng</strong>

                  <span>Thông tin sản phẩm được quản lý rõ ràng</span>
                </div>
              </div>

              <div className="product-benefit">
                <SafetyCertificateOutlined />

                <div>
                  <strong>Thanh toán an toàn</strong>

                  <span>Bảo mật thông tin khách hàng</span>
                </div>
              </div>

              <div className="product-benefit">
                <ReloadOutlined />

                <div>
                  <strong>Hỗ trợ mua hàng</strong>

                  <span>Hỗ trợ trong quá trình đặt mua</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="product-detail-section">
          <h2>Mô tả sản phẩm</h2>

          <div className="product-description">
            {productDetail.description ? (
              <div
                dangerouslySetInnerHTML={{
                __html: safeDescription,
                }}
              />
            ) : (
              <span>Chưa có mô tả sản phẩm.</span>
            )}
          </div>
        </div>

        <ProductReviews reviews={reviews} total={reviewTotal} loading={reviewsLoading} error={reviewError} form={reviewForm} saving={reviewSaving} onSubmit={submitReview} onChange={setReviewForm} />

        {/* ATTRIBUTES */}
        {productDetail.attributes &&
          Object.keys(productDetail.attributes).length > 0 && (
            <div className="product-detail-section">
              <h2>Thông tin sản phẩm</h2>

              <div className="product-attributes">
                {Object.entries(productDetail.attributes).map(
                  ([key, value]) => (
                    <div className="product-attribute-row" key={key}>
                      <span>{key}</span>

                      <strong>{String(value)}</strong>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

        {/* EXTRA INFO */}
        <div className="product-detail-section">
          <h2>Thông tin khác</h2>

          <div className="product-extra-grid">
            {productDetail.weight && (
              <div>
                <span>Khối lượng</span>

                <strong>
                  {productDetail.weight} {productDetail.weightUnit || "g"}
                </strong>
              </div>
            )}

            {productDetail.dimensions && Object.values(productDetail.dimensions).some(Boolean) && (
              <div><span>Kích thước</span><strong>{[productDetail.dimensions.length, productDetail.dimensions.width, productDetail.dimensions.height].filter(Boolean).join(" × ")} cm</strong></div>
            )}

            {currentVariant?.barcode && <div><span>Mã vạch</span><strong>{currentVariant.barcode}</strong></div>}

            {productDetail.viewCount !== undefined && (
              <div>
                <span>Lượt xem</span>

                <strong>{productDetail.viewCount}</strong>
              </div>
            )}

            {productDetail.createdAt && (
              <div>
                <span>Ngày tạo</span>

                <strong>
                  {new Date(productDetail.createdAt).toLocaleDateString(
                    "vi-VN",
                  )}
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = createStructuredSelector({
  productDetail: selectProductDetail,

  variants: selectProductVariants,

  selectedVariant: selectSelectedVariant,

  isLoading: selectProductDetailLoading,

  isVariantLoading: selectProductVariantLoading,
});

const mapDispatchToProps = (dispatch) => ({
  getProductDetail: (productId) =>
    dispatch(getProductDetailRequestAction(productId)),

  getProductVariants: (productId) =>
    dispatch(getProductVariantsRequestAction(productId)),

  setSelectedVariant: (variant) => dispatch(setSelectedVariantAction(variant)),

  clearProductDetail: () => dispatch(clearProductDetailAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetail);
