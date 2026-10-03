import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { connect } from "react-redux";

import { useNavigate, useLocation } from "react-router-dom";

import { createStructuredSelector } from "reselect";
import Media from "../../Components/Media";
import { localized } from "../../utils/localized";

import { getBrandsRequestAction, clearBrandsAction } from "./stores/actions";

import {
  selectBrands,
  selectBrandLoading,
  selectBrandPagination,
} from "./stores/selectors";

import "./style.css";

const getQueryParams = (search) => {
  const params = new URLSearchParams(search);

  return {
    page: Number(params.get("page")) || 1,

    limit: Number(params.get("limit")) || 8,
  };
};

const Brands = ({ brands, isLoading, pagination, getBrands, clearBrands }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
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
    getBrands({
      page: query.page,
      limit: query.limit,
      status: "active",
    });

    return () => {
      clearBrands();
    };
  }, [query.page, query.limit, getBrands, clearBrands]);

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    navigate(`/brands?page=${page}&limit=${currentLimit}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleChangeLimit = (event) => {
    const limit = Number(event.target.value);

    navigate(`/brands?page=1&limit=${limit}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleBrandClick = (brand) => {
    if (!brand?._id) {
      return;
    }

    navigate(`/products?brand=${brand._id}`);
  };

  const handleWebsiteClick = (event, website) => {
    event.stopPropagation();

    if (!website) {
      return;
    }

    let url = website.trim();

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getBrandLogo = (brand) => {
    if (brand?.logo) {
      return brand.logo;
    }

    return "";
  };

  const renderPageNumbers = () => {
    if (totalPages <= 1) {
      return (
        <button type="button" className="brand-page-btn active" disabled>
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
          <span key={`${page}-${index}`} className="brand-page-dots">
            ...
          </span>
        );
      }

      return (
        <button
          type="button"
          key={page}
          className={`brand-page-btn ${page === currentPage ? "active" : ""}`}
          onClick={() => handleChangePage(page)}>
          {page}
        </button>
      );
    });
  };

  return (
    <div className="brands-page">
      {/* ==================================================
          HERO
      ================================================== */}

      <section className="brands-hero">
        <div className="brands-hero-overlay" />

        <div className="brands-hero-content">
          <div className="brands-hero-badge">
            <span className="brands-badge-dot" />
            {t("ShopByBrand")}
          </div>

          <h1>{t("Brands")}</h1>

          <p>
            {t("ChooseBrandDescription")}
          </p>

          <div className="brands-hero-stats">
            <div className="brand-hero-stat">
              <strong>{total}</strong>

              <span>{t("BrandLabel")}</span>
            </div>

          </div>
        </div>
      </section>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <main className="brands-container">
        <div className="brands-heading">
          <div>
            <span className="brands-eyebrow">{t("ShopByBrand")}</span>

            <h2>{t("AllBrands")}</h2>

            <p>{t("ChooseBrandDescription")}</p>
          </div>

          <div className="brand-result-count">
            <span>{total}</span>

            <small>{t("BrandLabel")}</small>
          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {isLoading && (
          <div className="brands-grid">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div className="brand-skeleton" key={index}>
                <div className="brand-skeleton-logo" />

                <div className="brand-skeleton-content">
                  <div className="brand-skeleton-line brand-skeleton-title" />

                  <div className="brand-skeleton-line brand-skeleton-text" />

                  <div className="brand-skeleton-line brand-skeleton-small" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!isLoading && brands.length === 0 && (
          <div className="brands-empty">
            <div className="brands-empty-icon">B</div>

            <h3>{t("NoBrands")}</h3>

            <p>{t("NoBrandsDescription")}</p>

            <button
              type="button"
              onClick={() =>
                getBrands({
                  page: currentPage,
                  limit: currentLimit,
                  status: "active",
                })
              }>
              {t("TryAgain")}
            </button>
          </div>
        )}

        {/* ==================================================
            BRAND LIST
        ================================================== */}

        {!isLoading && brands.length > 0 && (
          <div className="brands-grid">
            {brands.map((brand, index) => {
              const number = (currentPage - 1) * currentLimit + index + 1;

              return (
                <article
                  className="brand-card"
                  key={brand._id}
                  onClick={() => handleBrandClick(brand)}>
                  {/* LOGO */}

                  <div className="brand-logo-wrapper">
                    <Media
                      src={getBrandLogo(brand)}
                      alt={localized(brand, "name", lang)}
                      imageClassName="brand-logo"
                      controls={false}
                      muted
                      loop
                      autoPlay
                    />

                    <span className="brand-number">
                      {String(number).padStart(2, "0")}
                    </span>

                    {brand.status === "active" && (
                      <span className="brand-status">{t("SellingNow")}</span>
                    )}

                    <div className="brand-logo-overlay" />

                    <div className="brand-arrow">→</div>
                  </div>

                  {/* CONTENT */}

                  <div className="brand-card-content">
                    <div className="brand-card-top">
                      <h3>{localized(brand, "name", lang)}</h3>
                    </div>

                    <p className="brand-description">
                      {localized(brand, "description", lang) || t("BrandDescriptionFallback")}
                    </p>

                    <div className="brand-card-footer">
                      {brand.website ? (
                        <button
                          type="button"
                          className="brand-website"
                          onClick={(event) =>
                            handleWebsiteClick(event, brand.website)
                          }>
                          Website
                          <span>↗</span>
                        </button>
                      ) : (
                        <span className="brand-website disabled">
                          {t("BrandLabel")}
                        </span>
                      )}

                      <span className="brand-explore">
                        {t("ViewProductsAction")}
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ==================================================
            PAGINATION
        ================================================== */}

        <section className="brand-pagination-area">
          <div className="brand-pagination-top">
            <div className="brand-pagination-info">
              <strong>
                {total === 0 ? 0 : (currentPage - 1) * currentLimit + 1}
              </strong>

              {" - "}

              <strong>{Math.min(currentPage * currentLimit, total)}</strong>

              <span>
                {" "}
                {t("ResultsRange", { start: total === 0 ? 0 : (currentPage - 1) * currentLimit + 1, end: Math.min(currentPage * currentLimit, total), total })}
              </span>
            </div>

            <div className="brand-limit">
              <span>{t("Display")}</span>

              <select value={currentLimit} onChange={handleChangeLimit}>
                <option value="4">4 {t("PerPage")}</option>

                <option value="8">8 {t("PerPage")}</option>

                <option value="12">12 {t("PerPage")}</option>

                <option value="20">20 {t("PerPage")}</option>

                <option value="40">40 {t("PerPage")}</option>
              </select>
            </div>
          </div>

          <div className="brand-pagination-box">
            <button
              type="button"
              className="brand-page-btn brand-page-arrow"
              disabled={currentPage <= 1}
              onClick={() => handleChangePage(currentPage - 1)}>
              ←
            </button>

            <div className="brand-pagination">{renderPageNumbers()}</div>

            <button
              type="button"
              className="brand-page-btn brand-page-arrow"
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
  brands: selectBrands,

  isLoading: selectBrandLoading,

  pagination: selectBrandPagination,
});

const mapDispatchToProps = {
  getBrands: getBrandsRequestAction,
  clearBrands: clearBrandsAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Brands);
