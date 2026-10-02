import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Media from "../../../Components/Media";
import { localized } from "../../../utils/localized";
import { ApiOutlined, AppstoreOutlined, BulbOutlined, CustomerServiceOutlined, EnvironmentOutlined, ExperimentOutlined, SafetyCertificateOutlined, ShoppingOutlined, TagsOutlined, ToolOutlined } from "@ant-design/icons";
import request from "../../../utils/request";
import FeaturedCard from "./FeaturedCard";

export function HomeHero() {
  const { t } = useTranslation();
  return <section className="home-intro">
    <div className="home-intro-copy">
      <span className="home-kicker">{t("HeroKicker")}</span>
      <h1>{t("HeroTitle")}</h1>
      <p>{t("HeroDescription")}</p>
      <div className="home-hero-actions">
        <Link className="home-primary-link" to="/products">{t("ViewProducts")} <span>→</span></Link>
        <Link className="home-secondary-link" to="/categories">{t("ViewCategories")}</Link>
      </div>
      <div className="home-intro-tags"><span><SafetyCertificateOutlined /> {t("SpecificationSelection")}</span><span><TagsOutlined /> {t("VariantPricing")}</span></div>
    </div>
    <aside className="home-contact-panel">
      <div className="home-contact-icon"><CustomerServiceOutlined /></div>
      <span className="home-contact-eyebrow">{t("NeedAdvice")}</span>
      <h2>{t("TalkToHoaSen")}</h2>
      <p>{t("AdviceDescription")}</p>
      <a className="home-contact-phone" href={`tel:${(process.env.REACT_APP_STORE_PHONE || "098 357 1112").replaceAll(" ", "")}`}><CustomerServiceOutlined /> <span className="home-contact-phone-number">{process.env.REACT_APP_STORE_PHONE || "098 357 1112"}</span> <span>→</span></a>
      <a className="home-contact-map" href={process.env.REACT_APP_MAP_URL || "#"} target="_blank" rel="noreferrer"><EnvironmentOutlined /> {t("StoreLocation")}</a>
      <small>{t("ShippingConfirmation")}</small>
    </aside>
  </section>;
}

export function HomeBenefits() {
  const { t } = useTranslation();
  return <section className="home-benefits" aria-label={t("ShoppingInfo")}>
    <article><span><TagsOutlined /></span><div><b>{t("ClearPricing")}</b><small>{t("PriceByVariant")}</small></div></article>
    <article><span><ShoppingOutlined /></span><div><b>{t("EasySelection")}</b><small>{t("ProductDetails")}</small></div></article>
    <article><span><SafetyCertificateOutlined /></span><div><b>{t("TrackOrders")}</b><small>{t("SavedProductsAndOrders")}</small></div></article>
  </section>;
}

export function CategorySection({ categories, loading }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  return <section className="home-section home-categories-section"><div className="home-section-heading"><div><span className="home-kicker">{t("RightSupplies")}</span><h2>{t("ExploreCategories")}</h2><p>{t("ChooseCategoryDescription")}</p></div><Link to="/categories">{t("BrowseAllCategories")} <span>→</span></Link></div>
    {categories.length ? <div className="home-category-grid">{categories.slice(0, 6).map((category, index) => { const image = category.homeImage || category.image; const name = localized(category, "name", lang); return <Link className={`home-category-tile category-tone-${index % 6}`} key={category._id} to={`/products?category=${category._id}`}><span className="home-category-icon">{image ? <Media src={image} alt={name} imageClassName="home-category-media" loading="lazy" controls={false} muted loop autoPlay /> : <CategoryIcon name={name} />}</span><span className="home-category-content"><b>{name}</b><small>{localized(category, "description", lang) || t("CategoryFallback")}</small><span className="home-category-action">{t("ViewProduct")} <span>↗</span></span></span></Link>; })}</div> : <div className="home-inline-state">{loading ? t("Loading") : t("CategoryFallback")}</div>}
  </section>;
}

function CategoryIcon({ name }) {
  const label = String(name || "").toLocaleLowerCase("vi");
  if (/tưới|ống|béc|phun|nước/.test(label)) return <ApiOutlined />;
  if (/dinh dưỡng|phân|thuốc|hạt|giống|giá thể/.test(label)) return <ExperimentOutlined />;
  if (/đèn|chiếu sáng|nhiệt/.test(label)) return <BulbOutlined />;
  if (/dụng cụ|thiết bị|máy|phụ kiện/.test(label)) return <ToolOutlined />;
  return <AppstoreOutlined />;
}

export function FeaturedSection({ products, loading, error }) {
  const { t } = useTranslation();
  return <section className="home-section home-featured-section"><div className="home-section-heading"><div><span className="home-kicker">{t("FeaturedSelection")}</span><h2>{t("ProductForYou")}</h2><p>{t("PricesByVariant")}</p></div><Link to="/products">{t("ViewAllProducts")} <span>→</span></Link></div>
    {error && <div className="home-inline-state home-error">{error}</div>}
    {loading ? <div className="home-product-grid">{Array.from({ length: 4 }).map((_, index) => <div className="home-product-skeleton" key={index}><div /><span /><span /></div>)}</div> : products.length ? <div className="home-product-grid">{products.slice(0, 4).map((product) => <FeaturedCard key={product._id} product={product} />)}</div> : !error && <div className="home-inline-state">{t("ReturnLaterProducts")}</div>}
  </section>;
}

export function BrandSection({ brands }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  return <section className="home-brand-section"><div><span className="home-kicker">{t("HoaSenPartners")}</span><h2>{t("ExploreSuppliers")}</h2><p>{t("BrandsInStore")}</p></div>{brands.length ? <div className="home-brand-list">{brands.slice(0, 6).map((brand) => { const name = localized(brand, "name", lang); return <Link to={`/products?brand=${brand._id}`} key={brand._id}>{brand.logo ? <Media src={brand.logo} alt="" imageClassName="home-brand-media" controls={false} muted loop autoPlay /> : <span className="home-brand-initial">{String(name || "N").slice(0, 1).toUpperCase()}</span>}<b>{name}</b></Link>; })}</div> : <Link className="home-brand-empty" to="/brands">{t("BrandList")}</Link>}</section>;
}

export function AccountCallout() {
  const { t } = useTranslation();
  return <section className="home-bottom-cta"><div><span className="home-kicker">{t("GardenJournal")}</span><h2>{t("SeasonalSolutions")}</h2><p>{t("GardenNewsDescription")}</p></div><Link to="/news">{t("ReadGardenNews")} <span>→</span></Link></section>;
}

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const formatNewsDate = (value, language) => value ? new Date(value).toLocaleDateString(String(language || "").startsWith("en") ? "en-US" : "vi-VN") : "";

export function HomeNews() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const [state, setState] = React.useState({ articles: [], loading: true });
  React.useEffect(() => {
    let active = true;
    request.get("/news?limit=3").then((response) => {
      if (active) setState({ articles: (unwrap(response) || []).slice(0, 3), loading: false });
    }).catch(() => { if (active) setState({ articles: [], loading: false }); });
    return () => { active = false; };
  }, []);
  if (!state.loading && !state.articles.length) return null;
  return <section className="home-section home-news-section">
    <div className="home-section-heading"><div><span className="home-kicker">{t("GardenKnowledge")}</span><h2>{t("LatestFromHoaSen")}</h2><p>{t("SeasonalInformation")}</p></div><Link to="/news">{t("AllNews")} <span>→</span></Link></div>
    {state.loading ? <div className="home-news-grid" aria-label={t("Loading")}><div /><div /><div /></div> : <div className="home-news-grid">{state.articles.map((article) => <article className="home-news-card" key={article._id}><Link className="home-news-image" to={`/news/${article.slug}`}>{article.coverImage ? <Media src={article.coverImage} alt="" imageClassName="home-news-media" loading="lazy" controls={false} muted loop autoPlay /> : <span><EnvironmentOutlined /></span>}</Link><div className="home-news-copy"><small>{localized(article.category, "name", lang) || t("GardenCorner")} · {formatNewsDate(article.publishedAt, lang)}</small><h3><Link to={`/news/${article.slug}`}>{localized(article, "title", lang)}</Link></h3><p>{localized(article, "excerpt", lang)}</p><Link className="home-news-link" to={`/news/${article.slug}`}>{t("ReadArticle")} <span>→</span></Link></div></article>)}</div>}
  </section>;
}
