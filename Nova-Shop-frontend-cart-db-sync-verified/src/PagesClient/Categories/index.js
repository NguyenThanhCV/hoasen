import React, { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { createStructuredSelector } from "reselect";

import {
  getCategoriesRequestAction,
  clearCategoriesAction,
} from "./stores/actions";

import {
  selectCategories,
  selectCategoryLoading,
  selectCategoryPagination,
} from "./stores/selectors";

import "./style.css";

const getQueryParams = (search) => {
  const params = new URLSearchParams(search);

  return {
    page: Number(params.get("page")) || 1,
    limit: Number(params.get("limit")) || 8,
  };
};

const Categories = ({
  categories,
  isLoading,
  pagination,
  getCategories,
  clearCategories,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = useMemo(
    () => getQueryParams(location.search),
    [location.search],
  );

  const currentPage = pagination?.page || query.page || 1;
  const currentLimit = pagination?.limit || query.limit || 8;
  const total = pagination?.total || 0;
  const totalPages = pagination?.pages || 1;

  useEffect(() => {
    getCategories({
      page: query.page,
      limit: query.limit,
      status: "active",
    });

    return () => {
      clearCategories();
    };
  }, [query.page, query.limit]);

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    navigate(`/categories?page=${page}&limit=${currentLimit}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleChangeLimit = (event) => {
    const limit = Number(event.target.value);

    navigate(`/categories?page=1&limit=${limit}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (category) => {
    if (!category?._id) {
      return;
    }

    navigate(`/products?category=${category._id}`);
  };

  const renderPageNumbers = () => {
    if (totalPages <= 1) {
      return (
        <button type="button" className="category-page-btn active" disabled>
          1
        </button>
      );
    }

    const pages = [];

    const addPage = (page) => {
      if (!pages.includes(page)) {
        pages.push(page);
      }
    };

    addPage(1);

    if (currentPage > 3) {
      pages.push("left-dots");
    }

    for (
      let page = Math.max(2, currentPage - 1);
      page <= Math.min(totalPages - 1, currentPage + 1);
      page += 1
    ) {
      addPage(page);
    }

    if (currentPage < totalPages - 2) {
      pages.push("right-dots");
    }

    addPage(totalPages);

    return pages.map((page, index) => {
      if (page === "left-dots" || page === "right-dots") {
        return (
          <span key={`${page}-${index}`} className="category-page-dots">
            ...
          </span>
        );
      }

      return (
        <button
          type="button"
          key={page}
          className={`category-page-btn ${
            page === currentPage ? "active" : ""
          }`}
          onClick={() => handleChangePage(page)}>
          {page}
        </button>
      );
    });
  };

  const getCategoryImage = (category) => {
    if (category?.image) {
      return category.image;
    }

    return "https://via.placeholder.com/800x600?text=Category";
  };

  const getProductCount = (category) => {
    const count = Number(category?.productCount || 0);

    return `${count.toLocaleString("vi-VN")} sản phẩm`;
  };

  return (
    <div className="categories-page">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="categories-hero">
        <div className="categories-hero-overlay" />

        <div className="categories-hero-content">
          <div className="categories-hero-badge">
            <span className="hero-badge-dot" />
            KHÁM PHÁ SẢN PHẨM
          </div>

          <h1>Danh mục sản phẩm</h1>

          <p>
            Tìm nhanh nhóm vật tư cho nhà kính, hệ thống tưới và chăm sóc cây trồng.
          </p>

          <div className="categories-hero-stats">
            <div className="hero-stat">
              <strong>{total}</strong>
              <span>Danh mục</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <main className="categories-container">
        {/* HEADER */}
        <div className="categories-heading">
          <div>
            <span className="section-eyebrow">SHOP BY CATEGORY</span>

            <h2>Tất cả danh mục</h2>

            <p>Chọn một danh mục để xem các sản phẩm đang được bán.</p>
          </div>

          <div className="category-result-count">
            <span>{total}</span>
            <small>Danh mục</small>
          </div>
        </div>

        {/* ===================================================
            LOADING
        =================================================== */}
        {isLoading && (
          <div className="categories-grid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="category-skeleton" key={index}>
                <div className="skeleton-image" />

                <div className="skeleton-content">
                  <div className="skeleton-line skeleton-title" />

                  <div className="skeleton-line skeleton-text" />

                  <div className="skeleton-line skeleton-small" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================
            EMPTY
        =================================================== */}
        {!isLoading && categories.length === 0 && (
          <div className="categories-empty">
            <div className="empty-icon">⌂</div>

            <h3>Chưa có danh mục</h3>

            <p>Hiện tại chưa có danh mục sản phẩm nào đang hoạt động.</p>

            <button
              type="button"
              onClick={() =>
                getCategories({
                  page: currentPage,
                  limit: currentLimit,
                  status: "active",
                })
              }>
              Thử lại
            </button>
          </div>
        )}

        {/* ===================================================
            CATEGORY LIST
        =================================================== */}
        {!isLoading && categories.length > 0 && (
          <div className="categories-grid">
            {categories.map((category, index) => {
              const number = (currentPage - 1) * currentLimit + index + 1;

              return (
                <article
                  className="category-card"
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}>
                  {/* IMAGE */}
                  <div className="category-image-wrapper">
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="category-image"
                    />

                    <div className="category-image-overlay" />

                    <span className="category-number">
                      {String(number).padStart(2, "0")}
                    </span>

                    {category.status === "active" && (
                      <span className="category-status">Đang bán</span>
                    )}

                    <div className="category-arrow">→</div>
                  </div>

                  {/* CONTENT */}
                  <div className="category-card-content">
                    <div className="category-card-top">
                      <h3>{category.name}</h3>

                      <span className="category-level">
                        {category.level === 0
                          ? "Danh mục chính"
                          : `Cấp ${category.level}`}
                      </span>
                    </div>

                    <p className="category-description">
                      {category.description ||
                        "Khám phá các sản phẩm thuộc danh mục này."}
                    </p>

                    <div className="category-card-footer">
                      <span className="category-product-count">
                        <span className="count-icon">▦</span>

                        {getProductCount(category)}
                      </span>

                      <span className="category-explore">
                        Xem sản phẩm
                        <span>↗</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ===================================================
            PAGINATION
        =================================================== */}
        <section className="category-pagination-area">
          <div className="category-pagination-top">
            <div className="category-pagination-info">
              <strong>
                {total === 0 ? 0 : (currentPage - 1) * currentLimit + 1}
              </strong>

              {" - "}

              <strong>{Math.min(currentPage * currentLimit, total)}</strong>

              <span>
                {" "}
                trong tổng số <strong>{total}</strong> danh mục
              </span>
            </div>

            <div className="category-limit">
              <span>Hiển thị</span>

              <select value={currentLimit} onChange={handleChangeLimit}>
                <option value="4">4 / trang</option>

                <option value="8">8 / trang</option>

                <option value="12">12 / trang</option>

                <option value="20">20 / trang</option>

                <option value="40">40 / trang</option>
              </select>
            </div>
          </div>

          <div className="category-pagination-box">
            {/* PREVIOUS */}
            <button
              type="button"
              className="category-page-btn category-page-arrow"
              disabled={currentPage <= 1}
              onClick={() => handleChangePage(currentPage - 1)}>
              ←
            </button>

            {/* PAGE NUMBERS */}
            <div className="category-pagination">{renderPageNumbers()}</div>

            {/* NEXT */}
            <button
              type="button"
              className="category-page-btn category-page-arrow"
              disabled={currentPage >= totalPages}
              onClick={() => handleChangePage(currentPage + 1)}>
              →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

/* =========================================================
   REDUX
   ========================================================= */

const mapStateToProps = createStructuredSelector({
  categories: selectCategories,
  isLoading: selectCategoryLoading,
  pagination: selectCategoryPagination,
});

const mapDispatchToProps = (dispatch) => ({
  getCategories: (payload) => dispatch(getCategoriesRequestAction(payload)),

  clearCategories: () => dispatch(clearCategoriesAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
