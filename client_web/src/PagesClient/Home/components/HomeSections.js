import React from "react";
import { Link } from "react-router-dom";
import { ApiOutlined, AppstoreOutlined, BulbOutlined, CustomerServiceOutlined, EnvironmentOutlined, ExperimentOutlined, SafetyCertificateOutlined, ShoppingOutlined, TagsOutlined, ToolOutlined } from "@ant-design/icons";
import request from "../../../utils/request";
import FeaturedCard from "./FeaturedCard";

export function HomeHero() {
  return <section className="home-intro">
    <div className="home-intro-copy">
      <span className="home-kicker">VẬT TƯ NHÀ KÍNH HOA SEN</span>
      <h1>Vững mùa vụ,<br /><em>bắt đầu từ giải pháp phù hợp.</em></h1>
      <p>Tìm vật tư nhà kính, thiết bị tưới và phụ kiện nông nghiệp theo nhu cầu thực tế của khu vườn.</p>
      <div className="home-hero-actions">
        <Link className="home-primary-link" to="/products">Khám phá sản phẩm <span>→</span></Link>
        <Link className="home-secondary-link" to="/categories">Xem danh mục</Link>
      </div>
      <div className="home-intro-tags"><span><SafetyCertificateOutlined /> Chọn theo quy cách</span><span><TagsOutlined /> Xem giá từng phiên bản</span></div>
    </div>
    <aside className="home-contact-panel">
      <div className="home-contact-icon"><CustomerServiceOutlined /></div>
      <span className="home-contact-eyebrow">CẦN TƯ VẤN CHỌN VẬT TƯ?</span>
      <h2>Chia sẻ nhu cầu khu vườn với Hoa Sen</h2>
      <p>Đội ngũ cửa hàng hỗ trợ trao đổi về sản phẩm, kích thước và quy cách phù hợp.</p>
      <a className="home-contact-phone" href={`tel:${(process.env.REACT_APP_STORE_PHONE || "098 357 1112").replaceAll(" ", "")}`}><CustomerServiceOutlined /> <span className="home-contact-phone-number">{process.env.REACT_APP_STORE_PHONE || "098 357 1112"}</span> <span>→</span></a>
      <a className="home-contact-map" href={process.env.REACT_APP_MAP_URL || "#"} target="_blank" rel="noreferrer"><EnvironmentOutlined /> Xem vị trí cửa hàng</a>
      <small>Phí giao hàng được xác nhận theo địa chỉ nhận hàng.</small>
    </aside>
  </section>;
}

export function HomeBenefits() {
  return <section className="home-benefits" aria-label="Thông tin mua sắm">
    <article><span><TagsOutlined /></span><div><b>Giá rõ ràng</b><small>Xem giá theo từng loại sản phẩm</small></div></article>
    <article><span><ShoppingOutlined /></span><div><b>Dễ chọn sản phẩm</b><small>Xem mô tả và thông tin hàng hóa</small></div></article>
    <article><span><SafetyCertificateOutlined /></span><div><b>Dễ theo dõi đơn hàng</b><small>Lưu sản phẩm thích và xem lại đơn đã mua</small></div></article>
  </section>;
}

export function CategorySection({ categories, loading }) {
  return <section className="home-section home-categories-section"><div className="home-section-heading"><div><span className="home-kicker">TÌM ĐÚNG THỨ BẠN CẦN</span><h2>Khám phá danh mục</h2><p>Chọn nhanh nhóm vật tư phù hợp với khu vườn và mùa vụ của bạn.</p></div><Link to="/categories">Xem tất cả danh mục <span>→</span></Link></div>
    {categories.length ? <div className="home-category-grid">{categories.slice(0, 6).map((category, index) => { const image = category.homeImage || category.image; return <Link className={`home-category-tile category-tone-${index % 6}`} key={category._id} to={`/products?category=${category._id}`}><span className="home-category-icon">{image ? <img src={image} alt={`Hình minh họa ${category.name}`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <CategoryIcon name={category.name} />}</span><span className="home-category-content"><b>{category.name}</b><small>{category.description || "Khám phá sản phẩm và quy cách đang có tại cửa hàng."}</small><span className="home-category-action">Xem sản phẩm <span>↗</span></span></span></Link>; })}</div> : <div className="home-inline-state">{loading ? "Đang tải danh mục…" : "Danh mục sẽ xuất hiện tại đây khi cửa hàng được cập nhật."}</div>}
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
  return <section className="home-section home-featured-section"><div className="home-section-heading"><div><span className="home-kicker">ĐƯỢC TUYỂN CHỌN</span><h2>Sản phẩm dành cho bạn</h2><p>Giá hiển thị theo các phiên bản đang bán.</p></div><Link to="/products">Xem toàn bộ sản phẩm <span>→</span></Link></div>
    {error && <div className="home-inline-state home-error">{error}</div>}
    {loading ? <div className="home-product-grid">{Array.from({ length: 4 }).map((_, index) => <div className="home-product-skeleton" key={index}><div /><span /><span /></div>)}</div> : products.length ? <div className="home-product-grid">{products.slice(0, 4).map((product) => <FeaturedCard key={product._id} product={product} />)}</div> : !error && <div className="home-inline-state">Chưa có sản phẩm nổi bật. Hãy quay lại sau nhé.</div>}
  </section>;
}

export function BrandSection({ brands }) {
  return <section className="home-brand-section"><div><span className="home-kicker">ĐỐI TÁC CỦA HOA SEN</span><h2>Khám phá nhà cung cấp</h2><p>Các thương hiệu đang có sản phẩm tại cửa hàng.</p></div>{brands.length ? <div className="home-brand-list">{brands.slice(0, 6).map((brand) => <Link to={`/products?brand=${brand._id}`} key={brand._id}>{brand.logo ? <img src={brand.logo} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="home-brand-initial">{String(brand.name || "N").slice(0, 1).toUpperCase()}</span>}<b>{brand.name}</b></Link>)}</div> : <Link className="home-brand-empty" to="/brands">Xem danh sách thương hiệu →</Link>}</section>;
}

export function AccountCallout() {
  return <section className="home-bottom-cta"><div><span className="home-kicker">GÓC NHÀ VƯỜN HOA SEN</span><h2>Cập nhật kinh nghiệm và giải pháp cho mùa vụ.</h2><p>Đọc tin tức về vật tư, thiết bị tưới và kinh nghiệm chăm sóc vườn.</p></div><Link to="/news">Xem tin nhà vườn <span>→</span></Link></section>;
}

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const formatNewsDate = (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "Tin mới";

export function HomeNews() {
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
    <div className="home-section-heading"><div><span className="home-kicker">KIẾN THỨC NHÀ VƯỜN</span><h2>Tin mới từ Hoa Sen</h2><p>Thông tin hữu ích để chuẩn bị và chăm sóc mùa vụ.</p></div><Link to="/news">Tất cả tin tức <span>→</span></Link></div>
    {state.loading ? <div className="home-news-grid" aria-label="Đang tải tin tức"><div /><div /><div /></div> : <div className="home-news-grid">{state.articles.map((article) => <article className="home-news-card" key={article._id}><Link className="home-news-image" to={`/news/${article.slug}`}>{article.coverImage ? <img src={article.coverImage} alt="" loading="lazy" /> : <span><EnvironmentOutlined /></span>}</Link><div className="home-news-copy"><small>{article.category?.name || "Góc nhà vườn"} · {formatNewsDate(article.publishedAt)}</small><h3><Link to={`/news/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p><Link className="home-news-link" to={`/news/${article.slug}`}>Đọc bài viết <span>→</span></Link></div></article>)}</div>}
  </section>;
}
