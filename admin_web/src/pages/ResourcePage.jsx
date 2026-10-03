import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { banners, brands, categories, newsArticles, newsCategories, products } from "../api";
import { Btn, Danger, Modal, Page, Table } from "../components/UI";
import Media from "../components/Media";
import { fmtDate, idOf } from "../utils/helpers";

const field = (key, label, type = "text", help = "") => ({ key, label, type, help });
const resources = {
  products: { label: "Sản phẩm", api: products, media: (row) => row.thumbnail || row.video || row.images?.[0], mediaKey: "thumbnail", title: (row) => row.name, info: "Nội dung sản phẩm hiển thị trên cửa hàng: tên, mô tả, ảnh/video và trạng thái hiển thị. Giá, tồn kho và phiên bản được quản lý trong mục Sản phẩm.", fields: [field("name", "Tên sản phẩm", "required"), field("nameEn", "Tên tiếng Anh"), field("slug", "Đường dẫn (slug)", "required"), field("category", "ID danh mục", "required"), field("brand", "ID thương hiệu"), field("description", "Mô tả", "textarea"), field("descriptionEn", "Mô tả tiếng Anh", "textarea"), field("shortDescription", "Mô tả ngắn", "textarea"), field("shortDescriptionEn", "Mô tả ngắn tiếng Anh", "textarea"), field("thumbnail", "URL ảnh đại diện"), field("images", "URL ảnh/video khác (JSON)", "json-array", "Nhập mảng JSON, ví dụ: [\"https://.../anh.jpg\"]"), field("video", "URL video"), field("status", "Trạng thái", "select", "draft, active, inactive, archived, out_of_stock"), field("featured", "Sản phẩm nổi bật", "boolean"), field("isNew", "Sản phẩm mới", "boolean"), field("isBestSeller", "Bán chạy", "boolean"), field("isOnSale", "Đang giảm giá", "boolean")] },
  categories: { label: "Danh mục", api: categories, media: (row) => row.image || row.homeImage, mediaKey: "image", title: (row) => row.name, info: "Tên, mô tả và ảnh danh mục được dùng trên các trang danh mục và khu vực khám phá sản phẩm.", fields: [field("name", "Tên", "required"), field("nameEn", "Tên tiếng Anh"), field("slug", "Slug", "required"), field("description", "Mô tả", "textarea"), field("descriptionEn", "Mô tả tiếng Anh", "textarea"), field("image", "URL ảnh/video danh mục"), field("homeImage", "URL ảnh/video trang chủ"), field("parent", "ID danh mục cha"), field("level", "Cấp", "number"), field("sortOrder", "Thứ tự", "number"), field("status", "Trạng thái", "select", "active, inactive")] },
  brands: { label: "Thương hiệu", api: brands, media: (row) => row.logo, mediaKey: "logo", title: (row) => row.name, info: "Hồ sơ thương hiệu hiển thị trong danh sách thương hiệu và bộ lọc sản phẩm. Logo dùng URL media lưu trong database.", fields: [field("name", "Tên", "required"), field("nameEn", "Tên tiếng Anh"), field("slug", "Slug", "required"), field("logo", "URL logo"), field("description", "Mô tả", "textarea"), field("descriptionEn", "Mô tả tiếng Anh", "textarea"), field("website", "Website"), field("sortOrder", "Thứ tự", "number"), field("status", "Trạng thái", "select", "active, inactive")] },
  banners: { label: "Banner", api: banners, media: (row) => row.imageUrl || row.mobileImageUrl, mediaKey: "imageUrl", title: (row) => row.title || row.name, info: "Ảnh/video banner và nội dung trên trang chủ hoặc các trang cửa hàng. URL media lưu trong database.", fields: [field("name", "Tên quản trị", "required"), field("nameEn", "Tên tiếng Anh"), field("pageKey", "Trang hiển thị", "required"), field("imageUrl", "URL ảnh/video", "required"), field("mobileImageUrl", "URL media mobile"), field("altText", "Mô tả ảnh"), field("altTextEn", "Mô tả ảnh tiếng Anh"), field("eyebrow", "Nhãn nhỏ"), field("eyebrowEn", "Nhãn nhỏ tiếng Anh"), field("title", "Tiêu đề"), field("titleEn", "Tiêu đề tiếng Anh"), field("description", "Mô tả", "textarea"), field("descriptionEn", "Mô tả tiếng Anh", "textarea"), field("buttonText", "Nhãn nút"), field("buttonTextEn", "Nhãn nút tiếng Anh"), field("buttonLink", "Đường dẫn nút"), field("status", "Trạng thái", "select", "active, inactive"), field("sortOrder", "Thứ tự", "number"), field("startsAt", "Bắt đầu", "datetime-local"), field("endsAt", "Kết thúc", "datetime-local"), field("textPosition", "Vị trí nội dung", "select", "left, center, right"), field("overlayOpacity", "Độ tối lớp phủ (0–0.9)", "number")] },
  "news-categories": { label: "Danh mục tin tức", api: newsCategories, media: (row) => row.coverImage, mediaKey: "coverImage", title: (row) => row.name, info: "Tên, mô tả và ảnh đại diện danh mục dùng trên trang tin tức.", fields: [field("name", "Tên", "required"), field("nameEn", "Tên tiếng Anh"), field("slug", "Slug", "required"), field("description", "Mô tả", "textarea"), field("descriptionEn", "Mô tả tiếng Anh", "textarea"), field("coverImage", "URL ảnh/video"), field("sortOrder", "Thứ tự", "number"), field("status", "Trạng thái", "select", "active, inactive")] },
  news: { label: "Bài viết", api: newsArticles, media: (row) => row.coverImage, mediaKey: "coverImage", title: (row) => row.title, info: "Tiêu đề, nội dung, ảnh đại diện và trạng thái xuất bản của bài viết hiển thị trên trang tin tức.", fields: [field("title", "Tiêu đề", "required"), field("titleEn", "Tiêu đề tiếng Anh"), field("slug", "Slug", "required"), field("excerpt", "Tóm tắt", "required"), field("excerptEn", "Tóm tắt tiếng Anh"), field("content", "Nội dung", "textarea-required"), field("contentEn", "Nội dung tiếng Anh", "textarea"), field("coverImage", "URL ảnh/video"), field("category", "ID danh mục tin tức", "required"), field("author", "ID tác giả"), field("tags", "Thẻ (JSON)", "json-array"), field("tagsEn", "Thẻ tiếng Anh (JSON)", "json-array"), field("status", "Trạng thái", "select", "draft, published, archived"), field("publishedAt", "Ngày xuất bản", "datetime-local"), field("readingMinutes", "Số phút đọc", "number")] },
};

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const rowId = (row) => row?._id || row?.id;
const frontendPath = (resource, row) => {
  const id = rowId(row);
  switch (resource) {
    case "products": return id ? `/products/${id}` : "";
    case "categories": return row.slug ? `/categories?category=${encodeURIComponent(row.slug)}` : "/categories";
    case "brands": return row.slug ? `/brands?brand=${encodeURIComponent(row.slug)}` : "/brands";
    case "banners": return row.pageKey === "home" ? "/" : row.pageKey ? `/${String(row.pageKey).replace(/^\/+/, "")}` : "/";
    case "news": return row.slug ? `/news/${row.slug}` : "/news";
    case "news-categories": return row.slug ? `/news?category=${encodeURIComponent(row.slug)}` : "/news";
    default: return "";
  }
};
const localDate = (value) => value ? new Date(value).toISOString().slice(0, 16) : "";
const isObjectId = (value) => value && typeof value === "object" && (value._id || value.id);
const toFormValue = (value, type) => {
  if (type === "datetime-local") return localDate(value);
  if (type.startsWith("json-")) return value == null ? (type === "json-array" ? "[]" : "{}") : JSON.stringify(value, null, 2);
  if (isObjectId(value)) return String(value._id || value.id);
  return value == null ? "" : String(value);
};

export default function ResourcePage() {
  const { resource = "products" } = useParams();
  const navigate = useNavigate();
  const config = resources[resource];
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!config) return;
    setLoading(true); setError("");
    try {
      const response = await config.api.list({ page, limit: 100, ...(query.trim() ? { search: query.trim() } : {}) });
      const body = response?.data || response;
      const data = body?.data ?? body;
      setRows(Array.isArray(data) ? data : data?.items || []);
      setTotalPages(Math.max(1, Number(body?.pagination?.pages || 1)));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Không tải được dữ liệu.");
    } finally { setLoading(false); }
  }, [config, page, query]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!config) navigate("/admin/data/products", { replace: true }); }, [config, navigate]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("vi");
    if (!term) return rows;
    return rows.filter((row) => JSON.stringify(row).toLocaleLowerCase("vi").includes(term));
  }, [rows, query]);

  if (!config) return <Page title="Nội dung & hình ảnh"><div className="panel">Đang mở nhóm nội dung…</div></Page>;

  const startCreate = () => {
    setEditingId(null);
    setForm(Object.fromEntries(config.fields.map(({ key, type }) => [key, type === "json-array" ? "[]" : type === "json-object" ? "{}" : type === "boolean" ? "false" : ""])));
    setError(""); setNotice(""); setIsOpen(true);
  };
  const startEdit = async (row) => {
    const id = rowId(row); setEditingId(id); setError(""); setNotice(""); setIsOpen(true);
    try {
      const data = unwrap(await config.api.get(id));
      setForm(Object.fromEntries(config.fields.map(({ key, type }) => [key, toFormValue(data?.[key] ?? row[key], type)])));
    } catch (requestError) {
      setIsOpen(false); setError(requestError.response?.data?.message || requestError.message || "Không tải được bản ghi.");
    }
  };
  const makePayload = () => {
    const payload = {};
    for (const item of config.fields) {
      const value = form[item.key];
      if (item.type.startsWith("json-")) payload[item.key] = JSON.parse(value || (item.type === "json-array" ? "[]" : "{}"));
      else if (item.type === "boolean") payload[item.key] = value === true || value === "true";
      else if (item.type === "number") payload[item.key] = value === "" ? undefined : Number(value);
      else if (item.type === "datetime-local") payload[item.key] = value ? new Date(value).toISOString() : null;
      else payload[item.key] = value;
    }
    return payload;
  };
  const save = async (event) => {
    event.preventDefault(); setError(""); setSaving(true);
    try {
      const payload = makePayload();
      if (editingId) await config.api.update(editingId, payload); else await config.api.create(payload);
      setIsOpen(false); setNotice("Đã lưu nội dung vào cơ sở dữ liệu."); await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Không thể lưu. Hãy kiểm tra trường bắt buộc và định dạng JSON.");
    } finally { setSaving(false); }
  };
  const remove = async (row) => {
    const id = rowId(row);
    if (!window.confirm(`Xóa nội dung “${config.title(row) || id}”? Thao tác này không thể hoàn tác.`)) return;
    setError("");
    try { await config.api.remove(id); setNotice("Đã xóa nội dung."); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.message || "Không thể xóa nội dung."); }
  };
  const renderField = (item) => {
    const required = item.type === "required" || item.type === "textarea-required";
    const type = item.type === "required" ? "text" : item.type === "textarea-required" ? "textarea" : item.type;
    const value = form[item.key] ?? "";
    let editor;
    if (type === "boolean") editor = <select value={String(value)} onChange={(event) => setForm((current) => ({ ...current, [item.key]: event.target.value }))}><option value="false">Không</option><option value="true">Có</option></select>;
    else if (type === "textarea" || type.startsWith("json-")) editor = <textarea required={required} rows={type.startsWith("json-") ? 4 : 3} value={value} onChange={(event) => setForm((current) => ({ ...current, [item.key]: event.target.value }))} />;
    else if (type === "select") {
      const options = item.help.split(",").map((option) => option.trim()).filter(Boolean);
      editor = <select required={required} value={value || options[0]} onChange={(event) => setForm((current) => ({ ...current, [item.key]: event.target.value }))}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
    } else {
      const htmlType = ["number", "datetime-local", "email", "url"].includes(type) ? type : "text";
      editor = <input required={required} type={htmlType} step={htmlType === "number" ? "any" : undefined} value={value} onChange={(event) => setForm((current) => ({ ...current, [item.key]: event.target.value }))} />;
    }
    return <label key={item.key}>{item.label}{required ? " *" : ""}{editor}{item.help && <small className="muted">{item.help}</small>}</label>;
  };

  const columns = [
    { key: "preview", label: "Ảnh / video", render: (row) => config.media(row) ? <Media className="resource-media-preview" src={config.media(row)} alt={config.title(row) || "Xem trước"} /> : <span className="muted">Chưa có media</span> },
    { key: "content", label: "Nội dung", render: (row) => <div><b>{config.title(row) || "Chưa có tiêu đề"}</b><div className="muted">{row.slug || row.pageKey || row.status || "—"}</div></div> },
    { key: "frontendPath", label: "Đường dẫn frontend", render: (row) => {
      const path = frontendPath(resource, row);
      const baseUrl = import.meta.env.VITE_STOREFRONT_URL || "http://localhost:3000";
      return path ? <a className="resource-frontend-link" href={`${baseUrl.replace(/\/$/, "")}${path}`} target="_blank" rel="noreferrer" title={`${baseUrl}${path}`}>{path}</a> : <span className="muted">Chưa có đường dẫn</span>;
    } },
    { key: "description", label: "Thông tin", render: (row) => {
      const value = row.shortDescription || row.excerpt || row.description || row.altText || row.buttonLink || row.nameEn || row.titleEn;
      return <span>{String(value || "—").slice(0, 120)}</span>;
    } },
    { key: "updatedAt", label: "Cập nhật", render: (row) => row.updatedAt ? fmtDate(row.updatedAt) : "—" },
    { key: "actions", label: "Thao tác", render: (row) => <span className="actions"><Btn onClick={() => startEdit(row)}>Sửa</Btn><Danger onClick={() => remove(row)}>Xóa</Danger></span> },
  ];

  return <Page title={`Nội dung ${config.label.toLocaleLowerCase("vi")}`} actions={<><Btn onClick={load}>↻ Làm mới</Btn><Btn className="primary" onClick={startCreate}>+ Thêm nội dung</Btn></>}>
    <div className="toolbar"><label className="resource-picker">Loại nội dung<select value={resource} onChange={(event) => navigate(`/admin/data/${event.target.value}`)}>{Object.entries(resources).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label><input aria-label="Tìm nội dung" placeholder="Tìm nội dung frontend…" value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} /><span className="muted">Trang {page}/{totalPages} · {filteredRows.length} nội dung</span></div>
    <div className="info-banner"><b>Quản lý nội dung cửa hàng:</b> {config.info} Ảnh/video dùng URL lưu trong database. Các trường có dấu * là bắt buộc.</div>
    {notice && <div className="success">{notice}</div>}{error && <div className="error">{error}</div>}
    {loading ? <div className="panel">Đang tải nội dung…</div> : <><Table rows={filteredRows} columns={columns} /><div className="toolbar"><Btn disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Trang trước</Btn><Btn disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Trang sau →</Btn></div></>}
    {isOpen && <Modal title={`${editingId ? "Sửa" : "Thêm"} ${config.label.toLocaleLowerCase("vi")}`} onClose={() => !saving && setIsOpen(false)}><form className="formgrid" onSubmit={save}>{error && <div className="full error">{error}</div>}{config.fields.map(renderField)}{config.mediaKey && form[config.mediaKey] && <div className="full"><Media className="resource-media-preview" src={form[config.mediaKey]} alt="Xem trước media" /></div>}<div className="full"><Btn type="button" onClick={() => setIsOpen(false)}>Hủy</Btn><Btn className="primary" type="submit" disabled={saving}>{saving ? "Đang lưu…" : "Lưu nội dung"}</Btn></div></form></Modal>}
  </Page>;
}
