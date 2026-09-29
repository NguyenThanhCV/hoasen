import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  RightOutlined,
  FacebookOutlined,
} from "@ant-design/icons";
import "./index.css";

const STORE = {
  name: "Vật tư nhà kính Hoa Sen",
  phone: process.env.REACT_APP_STORE_PHONE || "098 357 1112",
  phoneLink: `tel:${(process.env.REACT_APP_STORE_PHONE || "098 357 1112").replaceAll(" ", "")}`,
  email: process.env.REACT_APP_STORE_EMAIL || "vattunhakinhhoasen@gmail.com",
  mapUrl: process.env.REACT_APP_MAP_URL || "",
  facebookUrl: process.env.REACT_APP_FACEBOOK_URL || "",
  tiktokUrl: process.env.REACT_APP_TIKTOK_URL || "",
};

const FooterLink = ({ to, children }) => (
  <li><Link to={to}><RightOutlined />{children}</Link></li>
);

export default function FooterPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setShowBackToTop(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="footer-page">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-grid">
            <section className="footer-column footer-company" aria-label="Thông tin cửa hàng">
              <Link to="/" className="footer-logo" aria-label="Hoa Sen - Trang chủ">
                <img className="footer-logo-image" src="/hoa-sen-logo.jpg" alt="Logo Vật tư nhà kính Hoa Sen" />
                <span className="footer-logo-text"><strong>HOA SEN</strong><span>VẬT TƯ NHÀ KÍNH</span></span>
              </Link>
              <p className="footer-description">Cung cấp vật tư nhà kính, thiết bị tưới và sản phẩm phục vụ sản xuất nông nghiệp hiện đại.</p>
              <address className="footer-contact-list">
                <a href={STORE.phoneLink}><span className="footer-contact-icon"><PhoneOutlined /></span><span><small>Hotline tư vấn</small><strong>{STORE.phone}</strong></span></a>
                <a href={`mailto:${STORE.email}`}><span className="footer-contact-icon"><MailOutlined /></span><span><small>Email</small><strong>{STORE.email}</strong></span></a>
                <a href={STORE.mapUrl} target="_blank" rel="noreferrer" className="footer-contact-item"><span className="footer-contact-icon"><EnvironmentOutlined /></span><span><small>Địa chỉ công ty · Google Maps</small><strong>Xem vị trí cửa hàng ↗</strong></span></a>
              </address>
            </section>

            <nav className="footer-column" aria-label="Khám phá cửa hàng">
              <h2>Khám phá cửa hàng</h2>
              <ul>
                <FooterLink to="/products">Tất cả sản phẩm</FooterLink>
                <FooterLink to="/products?featured=true">Sản phẩm nổi bật</FooterLink>
                <FooterLink to="/categories">Danh mục sản phẩm</FooterLink>
                <FooterLink to="/brands">Thương hiệu</FooterLink>
                <FooterLink to="/news">Tin tức nhà vườn</FooterLink>
                <FooterLink to="/about">Về Hoa Sen</FooterLink>
              </ul>
            </nav>

            <nav className="footer-column" aria-label="Hỗ trợ khách hàng">
              <h2>Hỗ trợ khách hàng</h2>
              <ul>
                <FooterLink to="/faq">Câu hỏi thường gặp</FooterLink>
                <FooterLink to="/contact">Liên hệ tư vấn</FooterLink>
                <FooterLink to="/login">Đăng nhập / Tạo tài khoản</FooterLink>
                <FooterLink to="/account">Tài khoản của tôi</FooterLink>
                <FooterLink to="/orders">Theo dõi đơn hàng</FooterLink>
              </ul>
            </nav>

            <section className="footer-column footer-advice">
              <h2>Cần tư vấn trước khi mua?</h2>
              <p>Gửi tên hoặc mã sản phẩm cùng quy cách bạn cần. Hoa Sen sẽ hỗ trợ kiểm tra lựa chọn và thông tin giao hàng.</p>
              <a className="footer-advice-phone" href={STORE.phoneLink}><PhoneOutlined /> Gọi {STORE.phone}</a>
              <a className="footer-advice-email" href={`mailto:${STORE.email}`}>{STORE.email}</a>
              <div className="footer-follow"><span>Theo dõi Hoa Sen</span><div className="footer-social"><a href={STORE.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook Vật tư nông nghiệp Hoa Sen"><FacebookOutlined /></a><a className="footer-tiktok" href={STORE.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok Nhà kính Lâm Đồng">♪</a></div></div>
              <small>Phí giao hàng được xác nhận theo địa chỉ và chưa tính tự động trên website.</small>
            </section>
          </div>
        </div>
      </div>

      <div className="footer-service">
        <div className="footer-container footer-service-grid">
          <div className="footer-service-item"><span className="footer-service-number">01</span><div><strong>Tư vấn đúng nhu cầu</strong><span>Hỗ trợ chọn sản phẩm và quy cách</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">02</span><div><strong>Giá theo phiên bản</strong><span>Xem giá sau khi chọn thuộc tính</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">03</span><div><strong>Kiểm tra tồn kho</strong><span>Hệ thống xác nhận khi đặt hàng</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">04</span><div><strong>Hỗ trợ giao hàng</strong><span>Liên hệ để xác nhận phí vận chuyển</span></div></div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <p>© {new Date().getFullYear()} <strong>{STORE.name}</strong>. Đã đăng ký bản quyền.</p>
          <nav className="footer-bottom-links" aria-label="Chính sách"><Link to="/privacy">Quyền riêng tư</Link><span aria-hidden="true">·</span><Link to="/terms">Điều khoản sử dụng</Link><span aria-hidden="true">·</span><Link to="/contact">Liên hệ</Link></nav>
        </div>
      </div>

      {showBackToTop && <button type="button" className="footer-back-top" onClick={scrollToTop} aria-label="Lên đầu trang"><ArrowUpOutlined /></button>}
    </footer>
  );
}
