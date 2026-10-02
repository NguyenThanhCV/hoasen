import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
            <section className="footer-column footer-company" aria-label={t("StoreInformation")}>
              <Link to="/" className="footer-logo" aria-label={`${STORE.name} - ${t("Home")}`}>
                <img className="footer-logo-image" src="/hoa-sen-logo.jpg" alt="Logo Vật tư nhà kính Hoa Sen" />
                <span className="footer-logo-text"><strong>HOA SEN</strong><span>VẬT TƯ NHÀ KÍNH</span></span>
              </Link>
              <p className="footer-description">{t("FooterDescription")}</p>
              <address className="footer-contact-list">
                <a href={STORE.phoneLink}><span className="footer-contact-icon"><PhoneOutlined /></span><span><small>{t("ConsultationHotline")}</small><strong>{STORE.phone}</strong></span></a>
                <a href={`mailto:${STORE.email}`}><span className="footer-contact-icon"><MailOutlined /></span><span><small>Email</small><strong>{STORE.email}</strong></span></a>
                <a href={STORE.mapUrl} target="_blank" rel="noreferrer" className="footer-contact-item"><span className="footer-contact-icon"><EnvironmentOutlined /></span><span><small>{t("CompanyMaps")}</small><strong>{t("StoreLocation")} ↗</strong></span></a>
              </address>
            </section>

            <nav className="footer-column" aria-label={t("ExploreStore")}>
              <h2>{t("ExploreStore")}</h2>
              <ul>
                <FooterLink to="/products">{t("AllProducts")}</FooterLink>
                <FooterLink to="/products?featured=true">{t("FeaturedProducts")}</FooterLink>
                <FooterLink to="/categories">{t("ProductCategories")}</FooterLink>
                <FooterLink to="/brands">{t("Brands")}</FooterLink>
                <FooterLink to="/news">{t("GardenNews")}</FooterLink>
                <FooterLink to="/about">{t("AboutHoaSen")}</FooterLink>
              </ul>
            </nav>

            <nav className="footer-column" aria-label={t("CustomerSupport")}>
              <h2>{t("CustomerSupport")}</h2>
              <ul>
                <FooterLink to="/faq">{t("FAQ")}</FooterLink>
                <FooterLink to="/contact">{t("ContactForAdvice")}</FooterLink>
                <FooterLink to="/login">{t("LoginCreateAccount")}</FooterLink>
                <FooterLink to="/account">{t("MyAccount")}</FooterLink>
                <FooterLink to="/orders">{t("TrackMyOrders")}</FooterLink>
              </ul>
            </nav>

            <section className="footer-column footer-advice">
              <h2>{t("NeedAdviceBeforeBuying")}</h2>
              <p>{t("FooterAdviceDescription")}</p>
              <a className="footer-advice-phone" href={STORE.phoneLink}><PhoneOutlined /> {t("CallUs")} {STORE.phone}</a>
              <a className="footer-advice-email" href={`mailto:${STORE.email}`}>{STORE.email}</a>
              <div className="footer-follow"><span>{t("FollowHoaSen")}</span><div className="footer-social"><a href={STORE.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook Vật tư nông nghiệp Hoa Sen"><FacebookOutlined /></a><a className="footer-tiktok" href={STORE.tiktokUrl} target="_blank" rel="noreferrer" aria-label="TikTok Nhà kính Lâm Đồng">♪</a></div></div>
              <small>{t("ShippingFeeNotice")}</small>
            </section>
          </div>
        </div>
      </div>

      <div className="footer-service">
        <div className="footer-container footer-service-grid">
          <div className="footer-service-item"><span className="footer-service-number">01</span><div><strong>{t("AdviceForYourNeeds")}</strong><span>{t("HelpChooseProducts")}</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">02</span><div><strong>{t("VariantPricing")}</strong><span>{t("SeePriceAfterSelection")}</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">03</span><div><strong>{t("CheckInventory")}</strong><span>{t("StockConfirmedAtCheckout")}</span></div></div>
          <div className="footer-service-item"><span className="footer-service-number">04</span><div><strong>{t("DeliverySupport")}</strong><span>{t("ConfirmShippingFee")}</span></div></div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <p>© {new Date().getFullYear()} <strong>{STORE.name}</strong>. {t("CopyrightNotice")}</p>
          <nav className="footer-bottom-links" aria-label={t("Policies")}><Link to="/privacy">{t("Privacy")}</Link><span aria-hidden="true">·</span><Link to="/terms">{t("Terms")}</Link><span aria-hidden="true">·</span><Link to="/contact">{t("Contact")}</Link></nav>
        </div>
      </div>

      {showBackToTop && <button type="button" className="footer-back-top" onClick={scrollToTop} aria-label={t("BackToTop")}><ArrowUpOutlined /></button>}
    </footer>
  );
}
