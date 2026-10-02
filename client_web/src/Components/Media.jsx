import React from "react";

const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|ogv|m4v|mov)(?:$|[?#])/i;

export function isVideoUrl(value = "") {
  const url = String(value || "").trim();
  return VIDEO_EXTENSIONS.test(url) || /(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)/i.test(url) || /[?&](?:format|type|mime)=(?:video%2F|video\/|mp4|webm)/i.test(url);
}

function getEmbedUrl(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube-nocookie.com/embed/${url.pathname.slice(1)}?autoplay=0&rel=0`;
    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      const id = url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/)?.[1];
      return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0` : "";
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname.match(/\/(?:video\/)?(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }
  } catch (_) {
    return "";
  }
  return "";
}

export default function Media({ src, alt = "", className = "", imageClassName = "", controls = true, autoPlay = false, muted = false, loop = false, playsInline = true, ...props }) {
  const url = String(src || "").trim();
  if (!url) return null;

  if (isVideoUrl(url)) {
    const embedUrl = getEmbedUrl(url);
    if (embedUrl) {
      return <div className={`media-frame ${className} ${imageClassName}`.trim()}><iframe className="media-embed" src={embedUrl} title={alt || "Video sản phẩm"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>;
    }
    return <video className={`media-video ${imageClassName || className}`.trim()} src={url} aria-label={alt || "Video"} controls={controls} autoPlay={autoPlay} muted={muted} loop={loop} playsInline={playsInline} preload="metadata" />;
  }

  return <img className={imageClassName || className} src={url} alt={alt} {...props} />;
}
