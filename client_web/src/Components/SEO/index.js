import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Vật tư nhà kính Hoa Sen | Thiết bị tưới & nông nghiệp";
const DEFAULT_DESCRIPTION = "Vật tư nhà kính Hoa Sen cung cấp vật tư nhà kính, thiết bị tưới và giải pháp nông nghiệp. Khám phá sản phẩm, quy cách và đặt hàng trực tuyến.";
const STORE_EMAIL = process.env.REACT_APP_STORE_EMAIL || "vattunhakinhhoasen@gmail.com";
const STORE_PHONE = process.env.REACT_APP_STORE_PHONE || "098 357 1112";
const PRIVATE_PATH = /^\/(login|register|cart|checkout|account|orders|wishlist|notifications|addresses)(\/|$)/;

const PAGE_META = [
  [/^\/$/, { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION }],
  [/^\/products$/, { title: "Sản phẩm vật tư nhà kính & thiết bị tưới | Hoa Sen", description: "Tìm vật tư nhà kính, màng phủ, lưới, ống và thiết bị tưới phù hợp. Lọc theo danh mục, thương hiệu và xem giá theo từng quy cách." }],
  [/^\/categories$/, { title: "Danh mục vật tư nông nghiệp | Hoa Sen", description: "Khám phá các danh mục vật tư nhà kính, thiết bị tưới và sản phẩm nông nghiệp tại cửa hàng Hoa Sen." }],
  [/^\/brands$/, { title: "Thương hiệu vật tư nhà kính | Hoa Sen", description: "Tìm hiểu các thương hiệu vật tư nhà kính và thiết bị tưới đang được phân phối tại Hoa Sen." }],
  [/^\/news$/, { title: "Tin tức nhà vườn & kiến thức nông nghiệp | Hoa Sen", description: "Kinh nghiệm chọn vật tư, chăm sóc cây trồng và giải pháp canh tác thiết thực dành cho nhà vườn." }],
  [/^\/about$/, { title: "Về Vật tư nhà kính Hoa Sen", description: "Hoa Sen đồng hành cùng nhà vườn với vật tư nhà kính, thiết bị tưới và giải pháp phục vụ sản xuất nông nghiệp hiện đại." }],
  [/^\/contact$/, { title: "Liên hệ tư vấn vật tư nhà kính | Hoa Sen", description: "Liên hệ Vật tư nhà kính Hoa Sen để được tư vấn sản phẩm, quy cách và thông tin giao hàng." }],
  [/^\/faq$/, { title: "Câu hỏi thường gặp | Hoa Sen", description: "Thông tin về cách chọn sản phẩm, giá theo phiên bản, đặt hàng, giao hàng và quản lý tài khoản Hoa Sen." }],
  [/^\/privacy$/, { title: "Chính sách quyền riêng tư | Hoa Sen", description: "Tìm hiểu cách website Hoa Sen sử dụng và bảo vệ thông tin tài khoản, địa chỉ giao hàng và đơn hàng." }],
  [/^\/terms$/, { title: "Điều khoản sử dụng | Hoa Sen", description: "Thông tin về sản phẩm, giá, đặt hàng, thanh toán và giao hàng trên website Vật tư nhà kính Hoa Sen." }],
];

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!content) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", String(content));
}

function publicBaseUrl() {
  const configured = process.env.REACT_APP_SITE_URL;
  if (configured) {
    try { return new URL(configured).origin; } catch (_) { return ""; }
  }
  const { hostname, origin } = window.location;
  const localHost = hostname === "localhost" || hostname.endsWith(".local") || hostname === "::1" ||
    /^127\./.test(hostname) || /^10\./.test(hostname) || /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  return localHost ? "" : origin;
}

export function useSeo({ title, description, image, type = "website", noindex = false, schema, schemaSlot = type === "website" ? "organization" : "page" } = {}) {
  useEffect(() => {
    const pageTitle = title || DEFAULT_TITLE;
    const pageDescription = description || DEFAULT_DESCRIPTION;
    const baseUrl = publicBaseUrl();
    const canonical = baseUrl ? new URL(window.location.pathname, `${baseUrl}/`).href : "";
    const imageUrl = image ? new URL(image, baseUrl || window.location.origin).href : "";

    document.title = pageTitle;
    upsertMeta("name", "description", pageDescription);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:locale", "vi_VN");
    upsertMeta("property", "og:site_name", "Vật tư nhà kính Hoa Sen");
    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", pageDescription);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:image:alt", image ? pageTitle : "");
    upsertMeta("name", "twitter:card", imageUrl ? "summary_large_image" : "summary");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", pageDescription);
    upsertMeta("name", "twitter:image", imageUrl);

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonical);
    } else {
      canonicalLink?.remove();
    }

    const schemaId = schemaSlot === "organization" ? "storefront-organization-jsonld" : "storefront-page-jsonld";
    let schemaScript = document.getElementById(schemaId);
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement("script");
        schemaScript.id = schemaId;
        schemaScript.type = "application/ld+json";
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else {
      schemaScript?.remove();
    }
    return () => {
      if (schemaSlot === "page") document.getElementById("storefront-page-jsonld")?.remove();
    };
  }, [title, description, image, type, noindex, schema, schemaSlot]);
}

export default function StorefrontSEO() {
  const { pathname, search } = useLocation();
  const route = pathname.replace(/\/+$/, "") || "/";
  const page = PAGE_META.find(([pattern]) => pattern.test(route))?.[1];
  const isProduct = /^\/products\/[^/]+/.test(route);
  const isArticle = /^\/news\/[^/]+/.test(route);
  const privatePage = PRIVATE_PATH.test(route);
  const query = new URLSearchParams(search);
  const hasProductFilters = route === "/products" && [...query.keys()].length > 0;
  const siteUrl = publicBaseUrl();
  const organization = {
    "@context": process.env.REACT_APP_SCHEMA_CONTEXT,
    "@type": "Organization",
    name: "Vật tư nhà kính Hoa Sen",
    email: STORE_EMAIL,
    telephone: `+84${STORE_PHONE.replace(/\D/g, "").replace(/^0/, "")}`,
    logo: siteUrl ? new URL("/hoa-sen-logo.jpg", siteUrl).href : undefined,
    url: siteUrl || undefined,
    sameAs: [process.env.REACT_APP_FACEBOOK_URL, process.env.REACT_APP_TIKTOK_URL].filter(Boolean),
  };
  useSeo({
    title: page?.title || (isProduct ? "Chi tiết sản phẩm | Vật tư nhà kính Hoa Sen" : isArticle ? "Bài viết nhà vườn | Hoa Sen" : privatePage ? "Tài khoản mua sắm | Hoa Sen" : DEFAULT_TITLE),
    description: page?.description || (isProduct ? "Thông tin, quy cách, giá và tình trạng sản phẩm vật tư nông nghiệp tại Vật tư nhà kính Hoa Sen." : isArticle ? "Kiến thức và kinh nghiệm hữu ích dành cho nhà vườn từ Vật tư nhà kính Hoa Sen." : DEFAULT_DESCRIPTION),
    noindex: privatePage || hasProductFilters,
    schema: organization,
    schemaSlot: "organization",
  });
  return null;
}
