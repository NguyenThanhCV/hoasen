import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, ShoppingOutlined, SafetyCertificateOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import "./style.css";

const STORE = {
  name: "Vật tư nhà kính Hoa Sen",
  phone: process.env.REACT_APP_STORE_PHONE || "098 357 1112",
  email: process.env.REACT_APP_STORE_EMAIL || "vattunhakinhhoasen@gmail.com",
  mapUrl: process.env.REACT_APP_MAP_URL || "",
};

function ContactPage() {
  const { t } = useTranslation();
  return <InfoShell variant="info-feature-page" eyebrow={t("ContactEyebrow")} title={t("ContactTitle")} intro={t("ContactIntro")}>
    <div className="info-contact-grid">
      <a href={`tel:${STORE.phone.replaceAll(" ", "")}`}><PhoneOutlined /><span><small>{t("Hotline")}</small><b>{STORE.phone}</b><em>{t("CallForHelp")}</em></span></a>
      <a href={`mailto:${STORE.email}`}><MailOutlined /><span><small>{t("Email")}</small><b>{STORE.email}</b><em>{t("SendQuestion")}</em></span></a>
      <a href={STORE.mapUrl} target="_blank" rel="noreferrer"><EnvironmentOutlined /><span><small>{t("CompanyAddress")}</small><b>{t("ViewGoogleMaps")}</b><em>{STORE.name}</em></span></a>
    </div>
    <div className="info-note"><b>{t("LookingForProduct")}</b><p>{t("ContactCategoryHelp")}</p><Link to="/categories">{t("ExploreCategories")} →</Link></div>
  </InfoShell>;
}

function FaqPage() {
  const { t, i18n: translation } = useTranslation();
  const questions = [
    [t("FaqPriceQuestion"), t("FaqPriceAnswer")], [t("FaqOrderQuestion"), t("FaqOrderAnswer")],
    [t("FaqTrackQuestion"), t("FaqTrackAnswer")], [t("FaqCancelQuestion"), t("FaqCancelAnswer")],
    [t("FaqCouponQuestion"), t("FaqCouponAnswer")], [t("FaqShippingQuestion"), t("FaqShippingAnswer")],
    [t("FaqReviewQuestion"), t("FaqReviewAnswer")],
  ];
  return <InfoShell eyebrow={t("ShoppingSupport")} title={t("FAQ")} intro={t("FaqIntro")}>
    <div className="info-faq-list" key={translation.resolvedLanguage || translation.language}>{questions.map(([question, answer]) => <details key={question}><summary><QuestionCircleOutlined />{question}<span>+</span></summary><p>{answer}</p></details>)}</div>
    <div className="info-note"><b>{t("NeedMoreAdvice")}</b><p>{t("CallUs")} {STORE.phone} {t("OrEmail")} {STORE.email}.</p><Link to="/contact">{t("ContactPageLink")} →</Link></div>
  </InfoShell>;
}

function PrivacyPage() {
  const { t } = useTranslation();
  return <InfoShell eyebrow={t("PrivacyEyebrow")} title={t("PrivacyTitle")} intro={t("PrivacyIntro")}>
    <div className="info-article"><section><h2>{t("PrivacyDataTitle")}</h2><p>{t("PrivacyDataBody")}</p></section><section><h2>{t("PrivacyUseTitle")}</h2><p>{t("PrivacyUseBody")}</p></section><section><h2>{t("AccountSecurityTitle")}</h2><p>{t("AccountSecurityBody")}</p></section><section><h2>{t("SupportRequestsTitle")}</h2><p>{t("SupportRequestsBody")} <a href={`mailto:${STORE.email}`}>{STORE.email}</a> {t("OrCall")} {STORE.phone}.</p></section></div>
  </InfoShell>;
}

function TermsPage() {
  const { t } = useTranslation();
  return <InfoShell eyebrow={t("TermsEyebrow")} title={t("TermsTitle")} intro={t("TermsIntro")}>
    <div className="info-article"><section><h2>{t("TermsProductsTitle")}</h2><p>{t("TermsProductsBody")}</p></section><section><h2>{t("TermsOrdersTitle")}</h2><p>{t("TermsOrdersBody")}</p></section><section><h2>{t("TermsPaymentTitle")}</h2><p>{t("TermsPaymentBody")}</p></section><section><h2>{t("TermsCancellationTitle")}</h2><p>{t("TermsCancellationBody")}</p></section><section><h2>{t("Contact")}</h2><p>{t("TermsContactBody")} {STORE.phone} {t("OrEmail")} <a href={`mailto:${STORE.email}`}>{STORE.email}</a>.</p></section></div>
  </InfoShell>;
}

function InfoShell({ eyebrow, title, intro, children, variant = "" }) {
  const { t } = useTranslation();
  return <main className={`info-page ${variant}`}><div className="info-hero"><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p><div className="info-hero-icon"><ShoppingOutlined /></div></div><div className="info-body">{children}<div className="info-safe-note"><SafetyCertificateOutlined /><span>{variant === "info-feature-page" ? t("InfoSafeFeature") : t("InfoSafeAccount")}</span></div></div></main>;
}

export default function InfoPages() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  if (pathname === "/contact") return <ContactPage />;
  if (pathname === "/faq") return <FaqPage />;
  if (pathname === "/privacy") return <PrivacyPage />;
  if (pathname === "/terms") return <TermsPage />;
  return <InfoShell eyebrow={t("AboutEyebrow")} title={t("AboutTitle")} intro={t("AboutIntro")} variant="info-feature-page"><div className="info-about-grid"><article><span>01</span><h2>{t("GreenhouseSupplies")}</h2><p>{t("AboutGreenhouse")}</p></article><article><span>02</span><h2>{t("IrrigationEquipment")}</h2><p>{t("AboutIrrigation")}</p></article><article><span>03</span><h2>{t("GrowingSupplies")}</h2><p>{t("AboutGrowing")}</p></article></div><div className="info-note"><b>{STORE.name}</b><p>{t("AboutCallout")}</p><Link to="/contact">{t("ContactUs")} →</Link></div></InfoShell>;
}
