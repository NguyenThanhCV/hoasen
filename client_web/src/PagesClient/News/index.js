import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import request from "../../utils/request";
import { useSeo } from "../../Components/SEO";
import Media, { isVideoUrl } from "../../Components/Media";
import { localized } from "../../utils/localized";
import { articleTagEnglish } from "../../utils/articleTranslations";
import "./style.css";

document.documentElement.style.setProperty(
  "--news-hero-image",
  `url("${process.env.REACT_APP_NEWS_HERO_IMAGE_URL || ""}")`,
);

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const dateLabel = (date, lang) => date ? new Date(date).toLocaleDateString(String(lang || "").startsWith("en") ? "en-US" : "vi-VN", { day: "2-digit", month: "long", year: "numeric" }) : "";
const imageOf = (article) => article.coverImage || process.env.REACT_APP_NEWS_PLACEHOLDER_URL || "";

function NewsCard({ article, featured = false }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const title = localized(article, "title", lang);
  const excerpt = localized(article, "excerpt", lang);
  return <article className={`news-card${featured ? " news-card-featured" : ""}`}>
    <Link to={`/news/${article.slug}`} className="news-card-image"><Media src={imageOf(article)} alt={title} imageClassName="news-card-media" controls={false} muted loop autoPlay loading="lazy" /><span>{localized(article.category, "name", lang) || t("GardenCorner")}</span></Link>
    <div className="news-card-body"><p className="news-meta">{dateLabel(article.publishedAt, lang)} <i>·</i> {article.readingMinutes || 3} {t("MinutesRead")}</p><h2><Link to={`/news/${article.slug}`}>{title}</Link></h2><p>{excerpt}</p><Link className="news-read-link" to={`/news/${article.slug}`}>{t("ReadArticle")} <span>→</span></Link></div>
  </article>;
}

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const [search, setSearch] = useState(params.get("search") || "");
  const [state, setState] = useState({ articles: [], categories: [], loading: true, error: "" });
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const query = new URLSearchParams({ limit: "24" });
      if (category) query.set("category", category);
      if (params.get("search")) query.set("search", params.get("search"));
      const [articleResponse, categoryResponse] = await Promise.all([request.get(`/news?${query}`), request.get("/news/categories")]);
      setState({ articles: unwrap(articleResponse) || [], categories: unwrap(categoryResponse) || [], loading: false, error: "" });
    } catch (error) { setState((current) => ({ ...current, loading: false, error: error.response?.data?.message || t("NewsLoadError") })); }
  }, [category, params, t]);
  useEffect(() => { load(); }, [load]);
  const submit = (event) => { event.preventDefault(); const next = new URLSearchParams(params); search.trim() ? next.set("search", search.trim()) : next.delete("search"); setParams(next); };
  const featured = !category && !params.get("search") ? state.articles[0] : null;
  return <main className="news-page">
    <header className="news-hero"><div className="news-hero-copy"><span className="news-eyebrow">{t("NewsKicker")}</span><h1>{t("NewsHeadline")}</h1><p>{t("NewsDescription")}</p><a href="#news-list" className="news-hero-cta">{t("ExploreArticles")} <span>↓</span></a></div><div className="news-hero-art"><Media src={process.env.REACT_APP_NEWS_HERO_IMAGE_URL || ""} alt="" className="news-hero-media" autoPlay muted loop controls={false} /><span className="news-art-note">{t("GrowKnowledgeArt")}</span></div></header>
    <section id="news-list" className="news-content"><div className="news-heading"><div><span className="news-eyebrow">{t("LatestUpdates")}</span><h2>{t("NewsPageTitle")}</h2><p>{t("HelpfulGardenInformation")}</p></div><form className="news-search" onSubmit={submit}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("SearchArticles")} aria-label={t("SearchArticles")} /><button type="submit" aria-label={t("SearchAction")}>⌕</button></form></div>
      <nav className="news-categories" aria-label={t("NewsCategories")}><Link className={!category ? "active" : ""} to="/news">{t("All")}</Link>{state.categories.map((item) => <Link key={item._id} className={category === item.slug ? "active" : ""} to={`/news?category=${encodeURIComponent(item.slug)}`}>{localized(item, "name", lang)}</Link>)}</nav>
      {state.error ? <div className="news-state"><h3>{t("CouldNotLoadContent")}</h3><p>{state.error}</p><button onClick={load}>{t("TryAgain")}</button></div> : state.loading ? <div className="news-state">{t("LoadingArticle")}</div> : !state.articles.length ? <div className="news-state"><h3>{t("NoMatchingArticles")}</h3><p>{t("ChooseAnotherCategory")}</p><Link to="/news">{t("ViewAllArticles")}</Link></div> : <>{featured && <NewsCard article={featured} featured />}<div className="news-grid">{state.articles.filter((article) => article._id !== featured?._id).map((article) => <NewsCard key={article._id} article={article} />)}</div></>}
    </section>
    <section className="news-bottom-cta"><div><span className="news-eyebrow">{t("NeedMoreAdvice")}</span><h2>{t("NewsCalloutTitle")}</h2><p>{t("NewsCalloutDescription")}</p></div><Link to="/contact">{t("ContactForAdviceAction")} <span>→</span></Link></section>
  </main>;
}

export function NewsDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const { slug } = useParams();
  const [state, setState] = useState({ article: null, loading: true, error: "" });
  useEffect(() => { let active = true; request.get(`/news/${slug}`).then((response) => { if (active) setState({ article: unwrap(response), loading: false, error: "" }); }).catch((error) => { if (active) setState({ article: null, loading: false, error: error.response?.data?.message || t("ArticleNotFound") }); }); return () => { active = false; }; }, [slug, t]);
  const article = state.article;
  const articleSchema = article?.title ? {
    "@context": process.env.REACT_APP_SCHEMA_CONTEXT,
    "@type": "NewsArticle",
    headline: localized(article, "title", lang),
    description: localized(article, "excerpt", lang) || localized(article, "title", lang),
    image: isVideoUrl(imageOf(article)) ? undefined : [imageOf(article)],
    datePublished: article.publishedAt || undefined,
    dateModified: article.updatedAt || article.publishedAt || undefined,
    author: { "@type": "Organization", name: article.author?.name || "Vật tư nhà kính Hoa Sen" },
    publisher: { "@type": "Organization", name: "Vật tư nhà kính Hoa Sen" },
  } : undefined;
  const articleTitle = localized(article, "title", lang);
  const articleExcerpt = localized(article, "excerpt", lang);
  const articleContent = localized(article, "content", lang);
  const articleCategory = localized(article?.category, "name", lang);
  const english = String(lang || "").toLowerCase().startsWith("en");
  const articleTags = ((english ? article?.tagsEn : article?.tags)?.length
    ? (english ? article.tagsEn : article.tags)
    : (english ? article?.tags : article?.tagsEn) || []).map((tag) => localized({ tag, tagEn: articleTagEnglish[tag] }, "tag", lang));
  useSeo({
    title: articleTitle ? `${articleTitle} | Hoa Sen News` : undefined,
    description: articleExcerpt || undefined,
    image: article && !isVideoUrl(imageOf(article)) ? imageOf(article) : undefined,
    type: "article",
    schema: articleSchema,
  });
  if (state.loading) return <main className="news-detail-state">{t("LoadingArticle")}</main>;
  if (state.error || !state.article) return <main className="news-detail-state"><h1>{t("ArticleNotFound")}</h1><p>{state.error}</p><Link to="/news">{t("BackToNews")}</Link></main>;
  return <main className="news-article-page"><div className="news-breadcrumb"><Link to="/">{t("Home")}</Link><span>/</span><Link to="/news">{t("News")}</Link><span>/</span><span>{articleCategory}</span></div><header className="news-article-header"><span className="news-eyebrow">{articleCategory || t("GardenCorner")}</span><h1>{articleTitle}</h1><p>{articleExcerpt}</p><div className="news-meta">{dateLabel(article.publishedAt, lang)} <i>·</i> {article.author?.name || "Hoa Sen"} <i>·</i> {article.readingMinutes || 3} {t("MinutesRead")}</div></header><Media className="news-article-cover-frame" imageClassName="news-article-cover" src={imageOf(article)} alt={articleTitle} /><article className="news-article-content">{String(articleContent || "").split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}{articleTags.length > 0 && <div className="news-tags">{articleTags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}</article><div className="news-back-link"><Link to="/news">{t("MoreNews")}</Link><Link to="/contact">{t("NeedAdviceContact")}</Link></div></main>;
}


