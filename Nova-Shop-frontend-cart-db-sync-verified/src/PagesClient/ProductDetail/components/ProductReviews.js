import React from "react";

export default function ProductReviews({
  reviews, total, loading, error, form, saving, onSubmit, onChange,
}) {
  return (
    <section className="product-detail-section product-review-section">
      <div className="product-review-heading"><div><span className="product-section-kicker">CHIA SẺ TRẢI NGHIỆM</span><h2>Đánh giá sản phẩm</h2></div><span>{total} đánh giá</span></div>
      <form className="product-review-form" onSubmit={onSubmit}>
        <label>Đánh giá của bạn</label>
        <div className="product-review-stars" role="radiogroup" aria-label="Số sao">
          {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`${rating} sao`} aria-pressed={form.rating === rating} className={rating <= form.rating ? "active" : ""} onClick={() => onChange({ ...form, rating })}>★</button>)}
        </div>
        <input maxLength={120} value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} placeholder="Tiêu đề ngắn (không bắt buộc)" />
        <textarea required minLength={5} maxLength={2000} value={form.content} onChange={(event) => onChange({ ...form, content: event.target.value })} placeholder="Điều bạn thích hoặc muốn chia sẻ về sản phẩm…" />
        {error && <p className="product-review-error">{error}</p>}
        <button type="submit" disabled={saving}>{saving ? "Đang gửi…" : "Gửi đánh giá"}</button>
      </form>
      <div className="product-review-list">
        {loading ? <p>Đang tải đánh giá…</p> : reviews.length ? reviews.map((review) => <article className="product-review-card" key={review._id}><div className="product-review-card-head"><strong>{review.user?.name || "Khách hàng"}</strong><span>{"★".repeat(Number(review.rating || 0))}{"☆".repeat(5 - Number(review.rating || 0))}</span><time>{review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}</time></div>{review.title && <h3>{review.title}</h3>}<p>{review.content}</p>{review.verifiedPurchase && <small>✓ Đã mua sản phẩm</small>}</article>) : <div className="product-review-empty">{error || "Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm."}</div>}
      </div>
    </section>
  );
}
