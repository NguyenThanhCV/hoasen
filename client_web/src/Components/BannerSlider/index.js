import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Carousel } from "antd";
import { Link, useLocation } from "react-router-dom";
import { ArrowRightOutlined, ShoppingOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import * as api from "../../api/shop";
import Media from "../Media";
import { localized } from "../../utils/localized";
import "./index.css";

function pageKeyFor(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  if (/^\/products\/[^/]+/.test(path)) return "product-detail";
  if (path === "/products") return "products";
  if (path === "/categories") return "categories";
  if (path === "/brands") return "brands";
  if (/^\/news\/[^/]+/.test(path)) return "news-detail";
  if (path === "/news") return "news";
  if (/^\/orders\/[^/]+/.test(path)) return "order-detail";
  const routes = { "/about":"about", "/contact":"contact", "/faq":"faq", "/privacy":"privacy", "/terms":"terms", "/cart":"cart", "/checkout":"checkout", "/orders":"orders", "/wishlist":"wishlist", "/notifications":"notifications", "/addresses":"addresses", "/account":"account" };
  return routes[path] || "general";
}

function BannerAction({ banner }) {
  if (!banner.buttonText || !banner.buttonLink) return null;
  const label = <><span className="banner-button-label">{banner.buttonText}</span><ArrowRightOutlined aria-hidden="true" /></>;
  if (/^https?:\/\//i.test(banner.buttonLink)) return <a className="banner-button" href={banner.buttonLink} target="_blank" rel="noreferrer">{label}</a>;
  return <Link className="banner-button" to={banner.buttonLink.startsWith("/") ? banner.buttonLink : `/${banner.buttonLink}`}>{label}</Link>;
}

const BannerSlider = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const { pathname } = useLocation();
  const pageKey = useMemo(() => pageKeyFor(pathname), [pathname]);
  const carouselRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [loadedPage, setLoadedPage] = useState("");

  useEffect(() => {
    let active = true;
    setLoadedPage("");
    api.getBanners({ page: pageKey }).then((response) => {
      const data = response?.data?.data ?? response?.data ?? response;
      if (active) { setBanners(Array.isArray(data) ? data : []); setLoadedPage(pageKey); }
    }).catch(() => { if (active) { setBanners([]); setLoadedPage(pageKey); } });
    return () => { active = false; };
  }, [pageKey]);

  if (loadedPage !== pageKey || !banners.length) return null;
  const handlePrev = () => carouselRef.current?.prev();
  const handleNext = () => carouselRef.current?.next();
  const textPosition = (position) => ({
    "--banner-text-align": position === "center" ? "center" : position === "right" ? "right" : "left",
    "--banner-content-left": position === "center" ? "50%" : position === "right" ? "auto" : "9%",
    "--banner-content-right": position === "right" ? "9%" : "auto",
    "--banner-content-transform": position === "center" ? "translate(-50%, -50%)" : "translateY(-50%)",
  });
  return <section className="banner-slider" aria-label={t("PageBanner")}>
    <div className="banner-frame">
    <Carousel ref={carouselRef} autoplay={banners.length > 1} autoplaySpeed={5000} dots={banners.length > 1} arrows={false} effect="fade">
      {banners.map((banner) => {
        const translatedBanner = { ...banner, name: localized(banner, "name", lang), buttonText: localized(banner, "buttonText", lang), title: localized(banner, "title", lang), description: localized(banner, "description", lang), eyebrow: localized(banner, "eyebrow", lang) };
        return <div className="banner-slide" key={banner._id} style={{ "--banner-overlay-opacity": banner.overlayOpacity ?? 0.45, ...textPosition(banner.textPosition) }}>
        <div className={`banner-media${banner.mobileImageUrl ? " has-mobile-media" : ""}`}>
          <Media src={banner.imageUrl} alt={localized(banner, "altText", lang) || translatedBanner.title || localized(banner, "name", lang) || banner.name} className="banner-media-desktop" autoPlay muted loop controls={false} />
          {banner.mobileImageUrl && <Media src={banner.mobileImageUrl} alt={localized(banner, "altText", lang) || translatedBanner.title || localized(banner, "name", lang) || banner.name} className="banner-media-mobile" autoPlay muted loop controls={false} />}
        </div>
        <div className="banner-overlay" />
        <div className="banner-content">
          {(translatedBanner.eyebrow || pageKey === "home") && <div className="banner-label"><ShoppingOutlined /><span>{translatedBanner.eyebrow || t("HeroKicker")}</span></div>}
          {translatedBanner.title && <h1>{translatedBanner.title}</h1>}
          {translatedBanner.description && <p>{translatedBanner.description}</p>}
          <BannerAction banner={translatedBanner} />
        </div>
      </div>; })}
    </Carousel>
    {banners.length > 1 && <>
      <button type="button" className="banner-manual-arrow banner-manual-prev" onClick={handlePrev} aria-label={t("BannerPrevious")}><LeftOutlined /></button>
      <button type="button" className="banner-manual-arrow banner-manual-next" onClick={handleNext} aria-label={t("BannerNext")}><RightOutlined /></button>
    </>}
    </div>
  </section>;
};

export default BannerSlider;
