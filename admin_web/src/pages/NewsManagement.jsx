import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Page, Btn, Danger, Modal, Table } from "../components/UI";
import { newsArticles, newsCategories } from "../api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const slugify = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const idOf = (value) =>
  typeof value === "string" ? value : value?._id || value?.id || "";
const localDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";
const dateInput = (value) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
const emptyArticle = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "",
  tags: "",
  status: "draft",
  publishedAt: "",
  readingMinutes: 3,
};
const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  coverImage: "",
  sortOrder: 0,
  status: "active",
};
const storefrontUrl =
  import.meta.env.VITE_STOREFRONT_URL;

export default function NewsManagement() {
  const [tab, setTab] = useState("articles");
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyArticle);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [articleResponse, categoryResponse] = await Promise.all([
        newsArticles.list({ page: 1, limit: 100, sort: "newest" }),
        newsCategories.list({ page: 1, limit: 100, sort: "nameAsc" }),
      ]);
      const articleData = unwrap(articleResponse);
      const categoryData = unwrap(categoryResponse);
      setArticles(
        Array.isArray(articleData) ? articleData : articleData?.data || [],
      );
      setCategories(
        Array.isArray(categoryData) ? categoryData : categoryData?.data || [],
      );
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Không tải được dữ liệu tin tức. Kiểm tra quyền và kết nối backend.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredArticles = useMemo(
    () =>
      articles.filter((item) => {
        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;
        const text =
          `${item.title || ""} ${item.slug || ""} ${(item.tags || []).join(" ")}`.toLocaleLowerCase(
            "vi",
          );
        return (
          matchesStatus && text.includes(query.trim().toLocaleLowerCase("vi"))
        );
      }),
    [articles, query, statusFilter],
  );

  const startCreateArticle = () => {
    setEditingId("");
    setForm({ ...emptyArticle, category: categories[0]?._id || "" });
    setError("");
    setNotice("");
    setModal("article");
  };

  const startEditArticle = async (item) => {
    setEditingId(item._id);
    setError("");
    setNotice("");
    setModal("article");
    setSaving(true);
    try {
      const response = await newsArticles.get(item._id);
      const value = unwrap(response);
      setForm({
        ...emptyArticle,
        ...value,
        category: idOf(value.category),
        tags: (value.tags || []).join(", "),
        publishedAt: dateInput(value.publishedAt),
      });
    } catch (e) {
      setForm({
        ...emptyArticle,
        ...item,
        category: idOf(item.category),
        tags: (item.tags || []).join(", "),
        publishedAt: dateInput(item.publishedAt),
      });
      setError(e?.response?.data?.message || "Không tải được bài viết.");
    } finally {
      setSaving(false);
    }
  };

  const startCreateCategory = () => {
    setEditingId("");
    setForm(emptyCategory);
    setError("");
    setNotice("");
    setModal("category");
  };
  const startEditCategory = async (item) => {
    setEditingId(item._id);
    setError("");
    setNotice("");
    setModal("category");
    setSaving(true);
    try {
      setForm({
        ...emptyCategory,
        ...unwrap(await newsCategories.get(item._id)),
      });
    } catch (e) {
      setForm({ ...emptyCategory, ...item });
      setError(e?.response?.data?.message || "Không tải được danh mục.");
    } finally {
      setSaving(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      if (modal === "article") {
        const data = {
          title: form.title,
          slug: slugify(form.slug || form.title),
          excerpt: form.excerpt,
          content: form.content,
          coverImage: form.coverImage || "",
          category: form.category,
          tags: String(form.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          status: form.status || "draft",
          readingMinutes: Math.max(1, Number(form.readingMinutes) || 1),
          publishedAt:
            form.status === "published"
              ? form.publishedAt || new Date().toISOString()
              : form.publishedAt || null,
        };
        if (editingId) await newsArticles.update(editingId, data);
        else await newsArticles.create(data);
      } else {
        const data = {
          name: form.name,
          slug: slugify(form.slug || form.name),
          description: form.description || "",
          coverImage: form.coverImage || "",
          sortOrder: Number(form.sortOrder) || 0,
          status: form.status || "active",
        };
        if (editingId) await newsCategories.update(editingId, data);
        else await newsCategories.create(data);
      }
      setModal("");
      setNotice(modal === "article" ? "Đã lưu bài viết." : "Đã lưu danh mục.");
      await load();
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Không thể lưu. Hãy kiểm tra dữ liệu và thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeArticle = async (item) => {
    if (!window.confirm(`Xóa bài viết “${item.title}”?`)) return;
    setError("");
    try {
      await newsArticles.remove(item._id);
      setNotice("Đã xóa bài viết.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Không xóa được bài viết.");
    }
  };
  const removeCategory = async (item) => {
    if (
      !window.confirm(
        `Xóa danh mục “${item.name}”? Danh mục đang có bài viết sẽ không thể xóa.`,
      )
    )
      return;
    setError("");
    try {
      await newsCategories.remove(item._id);
      setNotice("Đã xóa danh mục.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Không xóa được danh mục.");
    }
  };

  const articleColumns = [
    {
      key: "title",
      label: "Bài viết",
      render: (row) => (
        <div className="news-admin-title">
          {row.coverImage && <img src={row.coverImage} alt="" />}
          <div>
            <b>{row.title}</b>
            <small>/{row.slug}</small>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Danh mục",
      render: (row) =>
        row.category?.name ||
        categories.find((item) => item._id === idOf(row.category))?.name ||
        "—",
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => (
        <span className={`news-admin-status ${row.status}`}>
          {row.status === "published"
            ? "Đã xuất bản"
            : row.status === "archived"
              ? "Lưu trữ"
              : "Bản nháp"}
        </span>
      ),
    },
    {
      key: "publishedAt",
      label: "Ngày đăng",
      render: (row) => localDate(row.publishedAt),
    },
    {
      key: "views",
      label: "Lượt xem",
      render: (row) => Number(row.views || 0).toLocaleString("vi-VN"),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (row) => (
        <span className="actions">
          {row.status === "published" && (
            <Btn
              onClick={() =>
                window.open(
                  `${storefrontUrl}/news/${row.slug}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }>
              Xem
            </Btn>
          )}
          <Btn onClick={() => startEditArticle(row)}>Sửa</Btn>
          <Danger onClick={() => removeArticle(row)}>Xóa</Danger>
        </span>
      ),
    },
  ];
  const categoryColumns = [
    {
      key: "name",
      label: "Danh mục",
      render: (row) => (
        <div>
          <b>{row.name}</b>
          <small className="muted">/{row.slug}</small>
        </div>
      ),
    },
    { key: "description", label: "Mô tả" },
    { key: "sortOrder", label: "Thứ tự" },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => (
        <span className={`news-admin-status ${row.status}`}>
          {row.status === "active" ? "Hiển thị" : "Đã ẩn"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (row) => (
        <span className="actions">
          <Btn onClick={() => startEditCategory(row)}>Sửa</Btn>
          <Danger onClick={() => removeCategory(row)}>Xóa</Danger>
        </span>
      ),
    },
  ];

  return (
    <Page
      title="Quản lý tin tức"
      actions={
        <Btn
          onClick={
            tab === "articles" ? startCreateArticle : startCreateCategory
          }>
          + {tab === "articles" ? "Tạo bài viết" : "Tạo danh mục"}
        </Btn>
      }>
      <div className="news-admin-stats">
        <div>
          <span>Tổng bài viết</span>
          <b>{articles.length}</b>
        </div>
        <div>
          <span>Đã xuất bản</span>
          <b>{articles.filter((item) => item.status === "published").length}</b>
        </div>
        <div>
          <span>Bản nháp</span>
          <b>{articles.filter((item) => item.status === "draft").length}</b>
        </div>
        <div>
          <span>Danh mục</span>
          <b>{categories.length}</b>
        </div>
      </div>
      <div className="news-admin-tabs">
        <button
          className={tab === "articles" ? "active" : ""}
          onClick={() => setTab("articles")}>
          Bài viết <span>{articles.length}</span>
        </button>
        <button
          className={tab === "categories" ? "active" : ""}
          onClick={() => setTab("categories")}>
          Danh mục <span>{categories.length}</span>
        </button>
        <Btn onClick={load}>Làm mới</Btn>
      </div>
      {notice && <div className="success news-admin-alert">{notice}</div>}
      {error && !modal && (
        <div className="errorbox news-admin-alert">
          <span>{error}</span>
          <Btn onClick={load}>Thử lại</Btn>
        </div>
      )}
      {tab === "articles" && (
        <div className="news-admin-toolbar">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tiêu đề, slug, tag…"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
            <option value="archived">Lưu trữ</option>
          </select>
        </div>
      )}
      {loading ? (
        <div className="panel">Đang tải dữ liệu tin tức…</div>
      ) : tab === "articles" ? (
        <Table rows={filteredArticles} columns={articleColumns} />
      ) : (
        <Table rows={categories} columns={categoryColumns} />
      )}
      {modal && (
        <Modal
          title={`${editingId ? "Cập nhật" : "Tạo"} ${modal === "article" ? "bài viết" : "danh mục tin tức"}`}
          onClose={() => !saving && setModal("")}>
          <form className="formgrid news-admin-form" onSubmit={save}>
            {error && <div className="errorbox full">{error}</div>}
            {modal === "article" ? (
              <>
                <label className="full">
                  Tiêu đề *
                  <input
                    required
                    maxLength={180}
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                        slug: editingId ? form.slug : slugify(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Đường dẫn (slug) *
                  <input
                    required
                    value={form.slug || ""}
                    onChange={(e) =>
                      setForm({ ...form, slug: slugify(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Danh mục *
                  <select
                    required
                    value={form.category || ""}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }>
                    <option value="">Chọn danh mục</option>
                    {categories.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}
                        {item.status === "inactive" ? " (đang ẩn)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="full">
                  Mô tả ngắn *
                  <textarea
                    required
                    maxLength={360}
                    rows={3}
                    value={form.excerpt || ""}
                    onChange={(e) =>
                      setForm({ ...form, excerpt: e.target.value })
                    }
                  />
                </label>
                <label className="full">
                  Nội dung bài viết *
                  <textarea
                    required
                    rows={12}
                    value={form.content || ""}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    placeholder="Mỗi đoạn cách nhau một dòng trống."
                  />
                </label>
                <label className="full">
                  Ảnh bìa (URL)
                  <input
                    type="url"
                    value={form.coverImage || ""}
                    onChange={(e) =>
                      setForm({ ...form, coverImage: e.target.value })
                    }
                    placeholder="https://…"
                  />
                </label>
                {form.coverImage && (
                  <img
                    className="news-admin-preview full"
                    src={form.coverImage}
                    alt="Xem trước ảnh bìa"
                  />
                )}
                <label>
                  Tags (phân cách bằng dấu phẩy)
                  <input
                    value={form.tags || ""}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="nhà kính, tưới nhỏ giọt"
                  />
                </label>
                <label>
                  Thời gian đọc (phút)
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={form.readingMinutes || 3}
                    onChange={(e) =>
                      setForm({ ...form, readingMinutes: e.target.value })
                    }
                  />
                </label>
                <label>
                  Trạng thái
                  <select
                    value={form.status || "draft"}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }>
                    <option value="draft">Bản nháp</option>
                    <option value="published">Xuất bản</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </label>
                <label>
                  Ngày xuất bản
                  <input
                    type="datetime-local"
                    value={form.publishedAt || ""}
                    onChange={(e) =>
                      setForm({ ...form, publishedAt: e.target.value })
                    }
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Tên danh mục *
                  <input
                    required
                    maxLength={80}
                    value={form.name || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: editingId ? form.slug : slugify(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Slug *
                  <input
                    required
                    value={form.slug || ""}
                    onChange={(e) =>
                      setForm({ ...form, slug: slugify(e.target.value) })
                    }
                  />
                </label>
                <label className="full">
                  Mô tả
                  <textarea
                    rows={3}
                    maxLength={240}
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>
                <label className="full">
                  Ảnh đại diện (URL)
                  <input
                    type="url"
                    value={form.coverImage || ""}
                    onChange={(e) =>
                      setForm({ ...form, coverImage: e.target.value })
                    }
                  />
                </label>
                <label>
                  Thứ tự hiển thị
                  <input
                    type="number"
                    value={form.sortOrder ?? 0}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: e.target.value })
                    }
                  />
                </label>
                <label>
                  Trạng thái
                  <select
                    value={form.status || "active"}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }>
                    <option value="active">Đang hiển thị</option>
                    <option value="inactive">Đang ẩn</option>
                  </select>
                </label>
              </>
            )}
            <div className="full news-admin-form-actions">
              <Btn type="button" onClick={() => setModal("")}>
                Đóng
              </Btn>
              <Btn className="primary" type="submit" disabled={saving}>
                {saving ? "Đang lưu…" : "Lưu thay đổi"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}
