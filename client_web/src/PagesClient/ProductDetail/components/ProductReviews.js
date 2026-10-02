import React from "react";
import { useTranslation } from "react-i18next";
import Media from "../../../Components/Media";

export default function ProductReviews({
  reviews, total, loading, error, form, saving, onSubmit, onChange,
}) {
  const { t, i18n } = useTranslation();
  const dateLocale = String(i18n.resolvedLanguage || i18n.language).startsWith("en") ? "en-US" : "vi-VN";
  return (
    <section className="product-detail-section product-review-section">
      <div className="product-review-heading"><div><span className="product-section-kicker">{t("ReviewsKicker")}</span><h2>{t("ProductReviews")}</h2></div><span>{total} {t("Reviews")}</span></div>
      <form className="product-review-form" onSubmit={onSubmit}>
        <label>{t("WriteReview")}</label>
        <div className="product-review-stars" role="radiogroup" aria-label={t("StarRating")}>
          {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} ${t("Reviews")}`} aria-pressed={form.rating === rating} className={rating <= form.rating ? "active" : ""} onClick={() => onChange({ ...form, rating })}>★</button>)}
        </div>
        <input maxLength={120} value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} placeholder={t("ReviewTitlePlaceholder")} />
        <textarea required minLength={5} maxLength={2000} value={form.content} onChange={(event) => onChange({ ...form, content: event.target.value })} placeholder={t("ReviewContentPlaceholder")} />
        {error && <p className="product-review-error">{error}</p>}
        <button type="submit" disabled={saving}>{saving ? t("Loading") : t("SubmitReview")}</button>
      </form>
      <div className="product-review-list">
        {loading ? <p>{t("LoadingReviews")}</p> : reviews.length ? reviews.map((review) => <article className="product-review-card" key={review._id}><div className="product-review-card-head"><strong>{review.user?.name || t("Customer")}</strong><span>{"★".repeat(Number(review.rating || 0))}{"☆".repeat(5 - Number(review.rating || 0))}</span><time>{review.createdAt ? new Date(review.createdAt).toLocaleDateString(dateLocale) : ""}</time></div>{review.title && <h3>{review.title}</h3>}<p>{review.content}</p>{(review.images?.length || review.videos?.length) > 0 && <div className="product-review-media">{[...(review.images || []), ...(review.videos || [])].map((src, index) => <Media key={`${src}-${index}`} src={src} alt={`${t("ReviewMediaAlt")} ${index + 1}`} controls />)}</div>}{review.verifiedPurchase && <small>{t("VerifiedPurchase")}</small>}</article>) : <div className="product-review-empty">{error || t("NoReviewsYet")}</div>}
      </div>
    </section>
  );
}
