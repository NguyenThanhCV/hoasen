import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Page, Table, Btn, Modal } from "../components/UI";
import { reviews } from "../api";
import { fmtDate } from "../utils/helpers";

const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export default function ReviewsPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await reviews.list({ page: 1, limit: 100 });
      const data = response.data?.data ?? response.data;
      setRows(Array.isArray(data) ? data : data?.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      rows.filter((review) => {
        const matchesStatus = !status || review.status === status;
        const searchText = [review.title, review.content, review.user?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesStatus && (!query || searchText.includes(query.toLowerCase()));
      }),
    [rows, query, status],
  );

  const moderate = async (id, nextStatus) => {
    try {
      await reviews.moderate(id, { status: nextStatus });
      await load();
      setSelected(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message);
    }
  };

  const columns = [
    {
      key: "rating",
      label: "Đánh giá",
      render: (review) => (
        <b className="rating">
          {"★".repeat(Number(review.rating || 0))}
          {"☆".repeat(5 - Number(review.rating || 0))}
        </b>
      ),
    },
    { key: "product", label: "Sản phẩm", render: (review) => review.product?.name || "—" },
    { key: "user", label: "Khách", render: (review) => review.user?.name || "—" },
    {
      key: "title",
      label: "Tiêu đề",
      render: (review) => (
        <div>
          <b>{review.title || "Không tiêu đề"}</b>
          <small>{String(review.content || "").slice(0, 90)}</small>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (review) => (
        <span className={`status-pill ${review.status}`}>
          {statusLabels[review.status] || review.status}
        </span>
      ),
    },
    { key: "createdAt", label: "Ngày", render: (review) => fmtDate(review.createdAt) },
    {
      key: "actions",
      label: "Thao tác",
      render: (review) => <Btn onClick={() => setSelected(review)}>Xem / duyệt</Btn>,
    },
  ];

  return (
    <Page title="Đánh giá" actions={<Btn onClick={load}>↻ Làm mới</Btn>}>
      <div className="toolbar">
        <input
          placeholder="Tìm nội dung, khách hàng…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tất cả</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="error">{error}</div>}
      <Table rows={filtered} columns={columns} />
      {selected && (
        <Modal title="Chi tiết đánh giá" onClose={() => setSelected(null)}>
          <div className="review-detail">
            <div className="review-stars">
              {"★".repeat(Number(selected.rating || 0))}
              {"☆".repeat(5 - Number(selected.rating || 0))}
            </div>
            <h2>{selected.title || "Không tiêu đề"}</h2>
            <p>{selected.content || "Không có nội dung."}</p>
            <div className="panel">
              <b>Sản phẩm:</b> {selected.product?.name || "—"}
              <br />
              <b>Khách:</b> {selected.user?.name || "—"}
              <br />
              <b>Ngày:</b> {fmtDate(selected.createdAt)}
            </div>
            <div className="detail-actions">
              <Btn onClick={() => moderate(selected._id, "approved")}>✓ Duyệt</Btn>
              <Btn onClick={() => moderate(selected._id, "rejected")}>Từ chối</Btn>
            </div>
          </div>
        </Modal>
      )}
    </Page>
  );
}
