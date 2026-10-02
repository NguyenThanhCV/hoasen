import React from "react";

const VIDEO_URL = /\.(mp4|webm|ogg|ogv|m4v|mov)(?:$|[?#])/i;

function videoUrl(value = "") {
  const url = String(value || "").trim();
  return VIDEO_URL.test(url) || /(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)/i.test(url) || /[?&](?:format|type|mime)=(?:video%2F|video\/|mp4|webm)/i.test(url);
}

function embedUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}`;
    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      const id = url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch (_) { return ""; }
  return "";
}

export default function Media({ src, alt = "", className = "", ...props }) {
  if (!src) return null;
  const embed = videoUrl(src) && embedUrl(src);
  if (embed) return <div className={`media-frame ${className}`}><iframe title={alt || "Xem trước video"} src={embed} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>;
  if (videoUrl(src)) return <video className={className} src={src} controls playsInline preload="metadata" aria-label={alt || "Xem trước video"} />;
  return <img className={className} src={src} alt={alt} {...props} />;
}
