import React, { useEffect, useState } from "react";

import {
  Row,
  Input,
  Select,
  Empty,
  Spin,
  Button,
  Pagination,
  Checkbox,
  message,
} from "antd";

import {
  SearchOutlined,
} from "@ant-design/icons";

import { connect } from "react-redux";

import { createStructuredSelector } from "reselect";

import { useNavigate, useSearchParams } from "react-router-dom";

import {
  selectProductLoading,
  selectProducts,
  selectProductPagination,
} from "./stores/selectors";

import { getProductsRequestAction } from "./stores/actions";
import { getVariantsService } from "../../api/apiVariant";
import { getCategoriesService } from "../../api/apiCategory";
import { getBrandsService } from "../../api/apiBrand";
import { getWishlist, addWishlist, removeWishlist } from "../../api/shop";
import ProductCard from "./components/ProductCard";

import "./style.css";

const Products = ({ isLoading, products, pagination, getProducts }) => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  /*
  =====================================================
  FILTER STATE
  =====================================================
  */

  const [searchText, setSearchText] = useState(
    searchParams.get("search") || "",
  );

  const [featured, setFeatured] = useState(
    searchParams.get("featured") === "true",
  );

  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const [stockByProduct, setStockByProduct] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistBusy, setWishlistBusy] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page") || 1),
  );

  const limit = 20;

  /*
  =====================================================
  LOAD PRODUCTS
  =====================================================
  */

  useEffect(() => {
    const search = searchParams.get("search") || "";

    const category = searchParams.get("category") || undefined;

    const brand = searchParams.get("brand") || undefined;

    const featuredParam = searchParams.get("featured");
    const sortParam = searchParams.get("sort") || "newest";

    const featuredValue =
      featuredParam === null ? undefined : featuredParam === "true";

    const page = Number(searchParams.get("page") || 1);

    setCurrentPage(page);

    getProducts({
      page,
      limit,
      search,
      category,
      brand,
      status: "active",
      featured: featuredValue,
      sort: sortParam,
    });
    setSort(sortParam);
  }, [searchParams, getProducts]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getCategoriesService({ page: 1, limit: 100, status: "active" }),
      getBrandsService({ page: 1, limit: 100, status: "active" }),
      localStorage.getItem("token") ? getWishlist() : Promise.resolve(null),
    ]).then(([categoriesResult, brandsResult, wishlistResult]) => {
      if (!active) return;
      const rows = (result) => result?.status === "fulfilled" && Array.isArray(result.value?.data?.data) ? result.value.data.data : [];
      setCategoryOptions(rows(categoriesResult));
      setBrandOptions(rows(brandsResult));
      const wishlist = wishlistResult?.status === "fulfilled" ? wishlistResult.value?.data?.products : [];
      setWishlistIds(Array.isArray(wishlist) ? wishlist.map((item) => String(item?._id || item)) : []);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;

    const loadVariantStock = async () => {
      if (!products?.length) {
        setStockByProduct({});
        return;
      }

      setStockLoading(true);
      const entries = await Promise.all(
        products.map(async (product) => {
          try {
            const response = await getVariantsService({ product: product._id, limit: 100 });
            const variants = response?.data?.data || response?.data || [];
            const activeVariants = variants.filter((variant) => variant?.active !== false);
            const prices = activeVariants.map((variant) => Number(variant.price)).filter(Number.isFinite);
            const originalPrices = activeVariants.map((variant) => Number(variant.compareAtPrice)).filter(Number.isFinite);
            const availableStock = activeVariants
              .reduce(
                (total, variant) =>
                  total + Math.max(
                    Number(variant.stock || 0) - Number(variant.reservedStock || 0),
                    0,
                  ),
                0,
              );
            return [product._id, { stock: availableStock, minPrice: prices.length ? Math.min(...prices) : null, maxPrice: prices.length ? Math.max(...prices) : null, minOriginalPrice: originalPrices.length ? Math.min(...originalPrices) : null }];
          } catch (_) {
            return [product._id, { stock: null, minPrice: null, maxPrice: null, minOriginalPrice: null }];
          }
        }),
      );

      if (active) {
        setStockByProduct(Object.fromEntries(entries));
        setStockLoading(false);
      }
    };

    loadVariantStock();
    return () => {
      active = false;
    };
  }, [products]);

  /*
  =====================================================
  SEARCH
  =====================================================
  */

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);

    const keyword = searchText.trim();

    if (keyword) {
      params.set("search", keyword);
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    setSearchParams(params);
  };

  /*
  =====================================================
  ENTER SEARCH
  =====================================================
  */

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /*
  =====================================================
  PAGE
  =====================================================
  */

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", page);

    setSearchParams(params);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
  =====================================================
  FEATURED
  =====================================================
  */

  const handleFeatured = (event) => {
    const checked = event.target.checked;

    setFeatured(checked);

    const params = new URLSearchParams(searchParams);

    params.set("page", "1");

    if (checked) {
      params.set("featured", "true");
    } else {
      params.delete("featured");
    }

    setSearchParams(params);
  };

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleWishlist = async (product) => {
    if (!localStorage.getItem("token")) {
      message.info("Đăng nhập để lưu sản phẩm yêu thích.");
      navigate("/login?next=/wishlist");
      return;
    }
    const id = String(product._id);
    setWishlistBusy(id);
    try {
      if (wishlistIds.includes(id)) {
        await removeWishlist(id);
        setWishlistIds((current) => current.filter((item) => item !== id));
        message.success("Đã bỏ khỏi danh sách yêu thích.");
      } else {
        await addWishlist(id);
        setWishlistIds((current) => [...current, id]);
        message.success("Đã lưu vào danh sách yêu thích.");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể cập nhật danh sách yêu thích.");
    } finally {
      setWishlistBusy("");
    }
  };

  const changeSort = (value) => {
    setSort(value);
    setFilter("sort", value === "newest" ? "" : value);
  };

  /*
  =====================================================
  PRICE
  =====================================================
  */

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return "Liên hệ";
    }

    if (Number(price) === 0) {
      return "Liên hệ";
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",

      currency: "VND",
    }).format(Number(price));
  };

  /*
  =====================================================
  PRODUCT IMAGE
  =====================================================
  */

  const getProductImage = (product) => {
    if (product.thumbnail) {
      return product.thumbnail;
    }

    if (product.images && product.images.length) {
      return product.images[0];
    }

    return "https://placehold.co/600x600?text=Product";
  };

  /*
  =====================================================
  DISCOUNT
  =====================================================
  */

  const getAvailableStock = (product) => {
    const frontendStock = stockByProduct[product?._id]?.stock;
    if (frontendStock !== undefined && frontendStock !== null) {
      return Math.max(Number(frontendStock) || 0, 0);
    }
    if (product?.availableStock !== undefined && product?.availableStock !== null) {
      return Math.max(Number(product.availableStock) || 0, 0);
    }
    return Math.max(Number(product?.stock) || 0, 0);
  };

  const getPriceInfo = (product) => {
    const stats = stockByProduct[product?._id] || {};
    const price = stats.minPrice;
    const maxPrice = stats.maxPrice;
    const originalPrice = stats.minOriginalPrice;
    const discount = originalPrice > price && price > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
    return { price, maxPrice, originalPrice, discount };
  };

  const getDiscount = (product) => {
    const { discount } = getPriceInfo(product);
    if (!discount) {
      return 0;
    }
    return discount;
  };

  /*
  =====================================================
  PRODUCT DETAIL
  =====================================================
  */

  const handleProductClick = (product) => {
    if (!product?._id) {
      return;
    }

    navigate(`/products/${product._id}`);
  };

  /*
  =====================================================
  ADD CART
  =====================================================
  */

  const handleAddCart = (product) => {
    /*
      Sau này nối Cart API.

      Hiện tại chuyển sang
      Product Detail để chọn
      variant / số lượng.
      */

    if (!product?._id) {
      return;
    }

    navigate(`/products/${product._id}`);
  };

  /*
  =====================================================
  PRODUCT COUNT
  =====================================================
  */

  const total = pagination?.total || 0;

  /*
  =====================================================
  RENDER
  =====================================================
  */

  return (
    <div className="products-page">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="products-header">
        <div className="products-title">
          <h1>Sản phẩm</h1>

          <p>Khám phá sản phẩm dành cho bạn</p>
        </div>

        <div className="products-search">
          <Input
            size="large"
            allowClear
            value={searchText}
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined />}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
            onKeyDown={handleSearchKeyDown}
          />

          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>
      </div>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="products-toolbar">
        <div className="products-result">
          {searchParams.get("search") ? (
            <>
              Kết quả tìm kiếm cho{" "}
              <strong>"{searchParams.get("search")}"</strong>
            </>
          ) : (
            <>Tất cả sản phẩm</>
          )}

          {total > 0 && <span> · {total} sản phẩm</span>}
        </div>

      <div className="products-filter">
          <Select
            allowClear
            placeholder="Danh mục"
            value={searchParams.get("category") || undefined}
            onChange={(value) => setFilter("category", value)}
            options={categoryOptions.map((category) => ({ value: category._id, label: category.name }))}
            style={{ width: 175 }}
          />
          <Select
            allowClear
            placeholder="Thương hiệu"
            value={searchParams.get("brand") || undefined}
            onChange={(value) => setFilter("brand", value)}
            options={brandOptions.map((brand) => ({ value: brand._id, label: brand.name }))}
            style={{ width: 175 }}
          />
          <Checkbox checked={featured} onChange={handleFeatured}>
            Sản phẩm nổi bật
          </Checkbox>

          <Select
            value={sort}
            style={{
              width: 180,
            }}
            onChange={changeSort}
            options={[
              {
                value: "newest",

                label: "Mới nhất",
              },

              {
                value: "popular",

                label: "Bán chạy",
              },

              {
                value: "rating",

                label: "Đánh giá cao",
              },
            ]}
          />
        </div>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {isLoading ? (
        <div className="products-loading">
          <Spin size="large" />

          <p>Đang tải sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <Empty
            description={
              searchParams.get("search")
                ? "Không tìm thấy sản phẩm phù hợp"
                : "Chưa có sản phẩm"
            }
          />
        </div>
      ) : (
        <Row gutter={[20, 24]}>
          {products.map((product) => {
            const discount = getDiscount(product);
            const availableStock = getAvailableStock(product);
            const priceInfo = getPriceInfo(product);
            const priceText = priceInfo.price == null
              ? "Chưa có giá"
              : priceInfo.price === priceInfo.maxPrice
                ? formatPrice(priceInfo.price)
                : `${formatPrice(priceInfo.price)} – ${formatPrice(priceInfo.maxPrice)}`;

            return <ProductCard
              key={product._id}
              product={product}
              priceInfo={priceInfo}
              priceText={priceText}
              discount={discount}
              availableStock={availableStock}
              stockLoading={stockLoading}
              stockLoaded={stockByProduct[product._id] !== undefined}
              wishlist={wishlistIds.includes(String(product._id))}
              wishlistBusy={wishlistBusy === String(product._id)}
              formatPrice={formatPrice}
              image={getProductImage(product)}
              onOpen={handleProductClick}
              onAdd={handleAddCart}
              onWishlist={handleWishlist}
            />;
          })}
        </Row>
      )}

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!isLoading && products.length > 0 && (
        <div className="products-pagination">
          <Pagination
            current={pagination?.page || currentPage}
            pageSize={pagination?.limit || limit}
            total={pagination?.total || 0}
            showSizeChanger={false}
            showQuickJumper
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

/*
=======================================================
REDUX STATE
=======================================================
*/

const mapStateToProps = createStructuredSelector({
  isLoading: selectProductLoading,

  products: selectProducts,

  pagination: selectProductPagination,
});

/*
=======================================================
REDUX DISPATCH
=======================================================
*/

const mapDispatchToProps = (dispatch) => ({
  getProducts: (payload) => {
    dispatch(getProductsRequestAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Products);
