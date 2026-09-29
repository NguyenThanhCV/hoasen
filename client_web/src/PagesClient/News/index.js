import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import request from "../../utils/request";
import { useSeo } from "../../Components/SEO";
import "./style.css";

document.documentElement.style.setProperty(
  "--news-hero-image",
  `url("${process.env.REACT_APP_NEWS_HERO_IMAGE_URL || ""}")`,
);

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const dateLabel = (date) => date ? new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) : "Tin mới";
const imageOf = (article) => article.coverImage || process.env.REACT_APP_NEWS_PLACEHOLDER_URL || "";

function NewsCard({ article, featured = false }) {
  return <article className={`news-card${featured ? " news-card-featured" : ""}`}>
    <Link to={`/news/${article.slug}`} className="news-card-image"><img src={imageOf(article)} alt={article.title} loading="lazy" /><span>{article.category?.name || "Nhà vườn"}</span></Link>
    <div className="news-card-body"><p className="news-meta">{dateLabel(article.publishedAt)} <i>·</i> {article.readingMinutes || 3} phút đọc</p><h2><Link to={`/news/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><Link className="news-read-link" to={`/news/${article.slug}`}>Đọc bài viết <span>→</span></Link></div>
  </article>;
}

export default function NewsPage() {
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
    } catch (error) { setState((current) => ({ ...current, loading: false, error: error.response?.data?.message || "Chưa thể tải tin tức. Vui lòng thử lại sau." })); }
  }, [category, params]);
  useEffect(() => { load(); }, [load]);
  const submit = (event) => { event.preventDefault(); const next = new URLSearchParams(params); search.trim() ? next.set("search", search.trim()) : next.delete("search"); setParams(next); };
  const featured = !category && !params.get("search") ? state.articles[0] : null;
  return <main className="news-page">
    <header className="news-hero"><div className="news-hero-copy"><span className="news-eyebrow">GÓC NHÀ VƯỜN HOA SEN</span><h1>Kiến thức tốt,<br /><em>mùa vụ bền lâu.</em></h1><p>Kinh nghiệm chọn vật tư, chăm sóc cây trồng và giải pháp canh tác được chia sẻ gần gũi, dễ áp dụng.</p><a href="#news-list" className="news-hero-cta">Khám phá bài viết <span>↓</span></a></div><div className="news-hero-art"><div className="news-hero-image" /><span className="news-art-note">Gieo kiến thức<br />Gặt mùa xanh</span></div></header>
    <section id="news-list" className="news-content"><div className="news-heading"><div><span className="news-eyebrow">CẬP NHẬT & CHIA SẺ</span><h2>Tin tức nhà vườn</h2><p>Thông tin hữu ích cho mỗi quyết định tại vườn.</p></div><form className="news-search" onSubmit={submit}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bài viết..." aria-label="Tìm bài viết" /><button type="submit" aria-label="Tìm kiếm">⌕</button></form></div>
      <nav className="news-categories" aria-label="Danh mục tin tức"><Link className={!category ? "active" : ""} to="/news">Tất cả</Link>{state.categories.map((item) => <Link key={item._id} className={category === item.slug ? "active" : ""} to={`/news?category=${encodeURIComponent(item.slug)}`}>{item.name}</Link>)}</nav>
      {state.error ? <div className="news-state"><h3>Chưa tải được nội dung</h3><p>{state.error}</p><button onClick={load}>Thử lại</button></div> : state.loading ? <div className="news-state">Đang tải bài viết…</div> : !state.articles.length ? <div className="news-state"><h3>Chưa có bài viết phù hợp</h3><p>Hãy chọn danh mục khác hoặc thử từ khóa ngắn hơn.</p><Link to="/news">Xem tất cả bài viết</Link></div> : <>{featured && <NewsCard article={featured} featured />}<div className="news-grid">{state.articles.filter((article) => article._id !== featured?._id).map((article) => <NewsCard key={article._id} article={article} />)}</div></>}
    </section>
    <section className="news-bottom-cta"><div><span className="news-eyebrow">CẦN TƯ VẤN THÊM?</span><h2>Chọn đúng vật tư,<br />bắt đầu từ nhu cầu thực tế.</h2><p>Đội ngũ Hoa Sen sẵn sàng cùng bạn tìm giải pháp phù hợp cho khu vườn.</p></div><Link to="/contact">Liên hệ tư vấn <span>→</span></Link></section>
  </main>;
}

export function NewsDetailPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ article: null, loading: true, error: "" });
  useEffect(() => { let active = true; request.get(`/news/${slug}`).then((response) => { if (active) setState({ article: unwrap(response), loading: false, error: "" }); }).catch((error) => { if (active) setState({ article: null, loading: false, error: error.response?.data?.message || "Không tìm thấy bài viết." }); }); return () => { active = false; }; }, [slug]);
  const article = state.article;
  const articleSchema = article?.title ? {
    "@context": process.env.REACT_APP_SCHEMA_CONTEXT,
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || article.title,
    image: [imageOf(article)],
    datePublished: article.publishedAt || undefined,
    dateModified: article.updatedAt || article.publishedAt || undefined,
    author: { "@type": "Organization", name: article.author?.name || "Vật tư nhà kính Hoa Sen" },
    publisher: { "@type": "Organization", name: "Vật tư nhà kính Hoa Sen" },
  } : undefined;
  useSeo({
    title: article?.title ? `${article.title} | Tin tức Hoa Sen` : undefined,
    description: article?.excerpt || undefined,
    image: article ? imageOf(article) : undefined,
    type: "article",
    schema: articleSchema,
  });
  if (state.loading) return <main className="news-detail-state">Đang tải bài viết…</main>;
  if (state.error || !state.article) return <main className="news-detail-state"><h1>Không tìm thấy bài viết</h1><p>{state.error}</p><Link to="/news">← Quay lại tin tức</Link></main>;
  return <main className="news-article-page"><div className="news-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span><Link to="/news">Tin tức</Link><span>/</span><span>{article.category?.name}</span></div><header className="news-article-header"><span className="news-eyebrow">{article.category?.name || "GÓC NHÀ VƯỜN"}</span><h1>{article.title}</h1><p>{article.excerpt}</p><div className="news-meta">{dateLabel(article.publishedAt)} <i>·</i> {article.author?.name || "Hoa Sen"} <i>·</i> {article.readingMinutes || 3} phút đọc</div></header><img className="news-article-cover" src={imageOf(article)} alt={article.title} /><article className="news-article-content">{String(article.content || "").split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}{article.tags?.length > 0 && <div className="news-tags">{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}</article><div className="news-back-link"><Link to="/news">← Xem thêm tin tức</Link><Link to="/contact">Cần tư vấn? Liên hệ Hoa Sen →</Link></div></main>;
}
