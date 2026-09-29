const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const outputDirectory = path.resolve(__dirname, "../build");
const configuredSiteUrl = process.env.REACT_APP_SITE_URL;
const staticRoutes = [
  { path: "/", priority: "1.0" },
  { path: "/products", priority: "0.9" },
  { path: "/categories", priority: "0.8" },
  { path: "/brands", priority: "0.7" },
  { path: "/news", priority: "0.8" },
  { path: "/about", priority: "0.5" },
  { path: "/contact", priority: "0.5" },
  { path: "/faq", priority: "0.4" },
];

if (!fs.existsSync(outputDirectory)) {
  console.error("Build output was not found; sitemap generation skipped.");
  process.exitCode = 1;
} else {
  const robots = ["User-agent: *", "Allow: /"];
  let siteOrigin = "";
  try {
    const parsed = new URL(configuredSiteUrl || "");
    if (parsed.protocol === "https:" && !/localhost|127\.0\.0\.1|\.local$/i.test(parsed.hostname)) {
      siteOrigin = parsed.origin;
    }
  } catch (_) {
    // The public production domain is optional for local development builds.
  }

  if (siteOrigin) {
    const entries = staticRoutes.map(({ path: route, priority }) => {
      const loc = new URL(route, `${siteOrigin}/`).href;
      return `  <url><loc>${loc}</loc><changefreq>${route === "/" ? "daily" : "weekly"}</changefreq><priority>${priority}</priority></url>`;
    });
    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<urlset xmlns="${process.env.REACT_APP_SITEMAP_SCHEMA_URL}">`,
      ...entries,
      "</urlset>",
      "",
    ].join("\n");
    fs.writeFileSync(path.join(outputDirectory, "sitemap.xml"), sitemap);
    robots.push(`Sitemap: ${siteOrigin}/sitemap.xml`);
    const indexPath = path.join(outputDirectory, "index.html");
    if (fs.existsSync(indexPath)) {
      const canonical = `${siteOrigin}/`;
      const logo = `${siteOrigin}/hoa-sen-logo.jpg`;
      const organization = {
        "@context": process.env.REACT_APP_SCHEMA_CONTEXT,
        "@type": "Organization",
        name: "Vật tư nhà kính Hoa Sen",
        url: siteOrigin,
        logo,
        email: process.env.REACT_APP_STORE_EMAIL || "vattunhakinhhoasen@gmail.com",
        telephone: `+84${(process.env.REACT_APP_STORE_PHONE || "098 357 1112").replace(/\D/g, "").replace(/^0/, "")}`,
        sameAs: [process.env.REACT_APP_FACEBOOK_URL, process.env.REACT_APP_TIKTOK_URL].filter(Boolean),
      };
      let html = fs.readFileSync(indexPath, "utf8");
      html = html
        .replace(/\s*<link rel="canonical"[^>]*\/>/g, "")
        .replace(/\s*<meta property="og:url"[^>]*\/>/g, "")
        .replace(/\s*<meta property="og:image"[^>]*\/>/g, "")
        .replace(/\s*<meta name="twitter:image"[^>]*\/>/g, "")
        .replace(/\s*<script type="application\/ld\+json">.*?<\/script>/g, "");
      html = html.replace("</head>", `  <link rel="canonical" href="${canonical}" />\n  <meta property="og:url" content="${canonical}" />\n  <meta property="og:image" content="${logo}" />\n  <meta name="twitter:image" content="${logo}" />\n  <script type="application/ld+json">${JSON.stringify(organization)}</script>\n</head>`);
      fs.writeFileSync(indexPath, html);
    }
    console.log(`Sitemap generated for ${siteOrigin}.`);
  } else {
    fs.rmSync(path.join(outputDirectory, "sitemap.xml"), { force: true });
    const indexPath = path.join(outputDirectory, "index.html");
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, "utf8");
      html = html.replace(/\s*<meta (?:property="og:image"|name="twitter:image")[^>]*\/>/g, "");
      fs.writeFileSync(indexPath, html);
    }
    console.log("Set REACT_APP_SITE_URL to the public website origin to generate an absolute sitemap.");
  }

  fs.writeFileSync(path.join(outputDirectory, "robots.txt"), `${robots.join("\n")}\n`);
}
