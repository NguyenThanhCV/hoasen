import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { AppstoreOutlined, ArrowRightOutlined, FolderOpenOutlined, ReadOutlined, SearchOutlined, ShopOutlined } from "@ant-design/icons";
import { Input, Empty, Spin } from "antd";
import { getProducts } from "../../api/shop";
import { getCategoriesService } from "../../api/apiCategory";
import { getBrandsService } from "../../api/apiBrand";
import request from "../../utils/request";
import { localized } from "../../utils/localized";
import Media from "../../Components/Media";
import "./style.css";

const rowsOf = (result) => {
  const value = result?.data?.data ?? result?.data ?? result;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};
const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLocaleLowerCase();
const matches = (record, fields, query) => fields.some((field) => {
  const value = record?.[field];
  return (Array.isArray(value) ? value : [value]).some((item) => normalize(item).includes(query));
});

function SearchSection({ title, count, icon, items, renderItem, to, emptyLabel }) {
  if (!items.length) return null;
  return <section className="global-search-section">
    <div className="global-search-section-heading"><h2>{icon}{title}</h2><span>{count}</span></div>
    <div className="global-search-results">{items.slice(0, 8).map(renderItem)}</div>
    {to && <Link className="global-search-view-all" to={to}>{emptyLabel}<ArrowRightOutlined /></Link>}
  </section>;
}

export default function SearchResultsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const [params, setParams] = useSearchParams();
  const query = params.get("q")?.trim() || "";
  const normalizedQuery = normalize(query);
  const [input, setInput] = useState(query);
  const [catalog, setCatalog] = useState({ products: [], categories: [], brands: [], articles: [] });
  const [loading, setLoading] = useState(Boolean(query));
  const [error, setError] = useState(false);

  useEffect(() => setInput(query), [query]);
  useEffect(() => {
    if (!query) {
      setLoading(false);
      setError(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    setError(false);
    Promise.allSettled([
      getProducts({ page: 1, limit: 100, status: "active" }),
      getCategoriesService({ page: 1, limit: 100, status: "active" }),
      getBrandsService({ page: 1, limit: 100, status: "active" }),
      request.get("/news?page=1&limit=50"),
    ]).then((results) => {
      if (!active) return;
      const [products, categories, brands, articles] = results;
      const fulfilled = results.filter((result) => result.status === "fulfilled").length;
      setError(fulfilled === 0);
      setCatalog({
        products: products.status === "fulfilled" ? rowsOf(products.value) : [],
        categories: categories.status === "fulfilled" ? rowsOf(categories.value) : [],
        brands: brands.status === "fulfilled" ? rowsOf(brands.value) : [],
        articles: articles.status === "fulfilled" ? rowsOf(articles.value) : [],
      });
      setLoading(false);
    });
    return () => { active = false; };
  }, [query]);

  const results = useMemo(() => ({
    products: catalog.products.filter((item) => matches(item, ["name", "nameEn", "shortDescription", "shortDescriptionEn", "description", "descriptionEn", "slug", "sku"], normalizedQuery)
      || Object.entries(item.attributes || {}).some(([key, values]) => matches({ key, values: Array.isArray(values) ? values : [values] }, ["key", "values"], normalizedQuery))
      || (item.attributeTranslations || []).some((attribute) => matches(attribute, ["name", "nameEn"], normalizedQuery) || (attribute.values || []).some((value) => matches(value, ["value", "valueEn"], normalizedQuery)))),
    categories: catalog.categories.filter((item) => matches(item, ["name", "nameEn", "description", "descriptionEn"], normalizedQuery)),
    brands: catalog.brands.filter((item) => matches(item, ["name", "nameEn", "description", "descriptionEn"], normalizedQuery)),
    articles: catalog.articles.filter((item) => matches(item, ["title", "titleEn", "excerpt", "excerptEn", "content", "contentEn", "tags", "tagsEn"], normalizedQuery)),
  }), [catalog, normalizedQuery]);

  const submit = (event) => {
    event.preventDefault();
    const next = input.trim();
    setParams(next ? { q: next } : {});
  };

  const total = results.products.length + results.categories.length + results.brands.length + results.articles.length;
  return <main className="global-search-page">
    <header className="global-search-hero">
      <span className="global-search-eyebrow">{t("SearchEverywhere")}</span>
      <h1>{t("SearchPageTitle")}</h1>
      <p>{t("SearchPageDescription")}</p>
      <form className="global-search-form" onSubmit={submit}>
        <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder={t("SearchAllInfo")} allowClear prefix={<SearchOutlined />} aria-label={t("SearchAllInfo")} />
        <button type="submit"><SearchOutlined /><span>{t("SearchAction")}</span></button>
      </form>
    </header>

    {!query ? <div className="global-search-state"><SearchOutlined /><p>{t("SearchStartTyping")}</p></div>
      : loading ? <div className="global-search-state"><Spin size="large" /><p>{t("Searching")}</p></div>
        : error ? <div className="global-search-state"><Empty description={t("SearchLoadError")} /></div>
          : <>
            <div className="global-search-summary">{t("SearchResultSummary", { count: total, query })}</div>
            {!total ? <div className="global-search-state"><Empty description={t("NoGlobalSearchResults", { query })} /></div> : <div className="global-search-sections">
              <SearchSection title={t("Products")} count={results.products.length} icon={<ShopOutlined />} items={results.products} to={`/products?search=${encodeURIComponent(query)}`} emptyLabel={t("ViewAllResults")} renderItem={(item) => <Link className="global-search-result" to={`/products/${item._id}`} key={item._id}><span className="global-search-result-media"><Media src={item.thumbnail || item.images?.[0] || item.video} alt={localized(item, "name", lang)} autoPlay muted loop controls={false} /></span><span className="global-search-result-copy"><b>{localized(item, "name", lang)}</b><small>{localized(item.category, "name", lang) || t("Products")}</small><span>{localized(item, "shortDescription", lang) || localized(item, "description", lang)}</span></span></Link>} />
              <SearchSection title={t("Categories")} count={results.categories.length} icon={<AppstoreOutlined />} items={results.categories} to="/categories" emptyLabel={t("ViewAllResults")} renderItem={(item) => <Link className="global-search-result global-search-text-result" to={`/products?category=${item._id}`} key={item._id}><FolderOpenOutlined /><span className="global-search-result-copy"><b>{localized(item, "name", lang)}</b><span>{localized(item, "description", lang)}</span></span><ArrowRightOutlined /></Link>} />
              <SearchSection title={t("Brands")} count={results.brands.length} icon={<FolderOpenOutlined />} items={results.brands} to="/brands" emptyLabel={t("ViewAllResults")} renderItem={(item) => <Link className="global-search-result global-search-text-result" to={`/products?brand=${item._id}`} key={item._id}><ShopOutlined /><span className="global-search-result-copy"><b>{localized(item, "name", lang)}</b><span>{localized(item, "description", lang)}</span></span><ArrowRightOutlined /></Link>} />
              <SearchSection title={t("News")} count={results.articles.length} icon={<ReadOutlined />} items={results.articles} to={`/news?search=${encodeURIComponent(query)}`} emptyLabel={t("ViewAllResults")} renderItem={(item) => <Link className="global-search-result global-search-text-result" to={`/news/${item.slug}`} key={item._id}><ReadOutlined /><span className="global-search-result-copy"><b>{localized(item, "title", lang)}</b><span>{localized(item, "excerpt", lang)}</span></span><ArrowRightOutlined /></Link>} />
            </div>}
          </>}
  </main>;
}
