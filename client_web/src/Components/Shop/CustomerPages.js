import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircleFilled, DeleteOutlined, EnvironmentOutlined, EditOutlined, HeartFilled, HomeOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import * as api from "../../api/shop";
import { imageOf, money, unwrapList } from "../../utils/shop";

const errorText = (e) => e?.response?.data?.message || "Không thể thực hiện thao tác";
const emptyAddress = { fullName: "", phone: "", address: "", province: "", district: "", ward: "", note: "", isDefault: false };

export function WishlistPage() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { try { setItems(unwrapList(await api.getWishlist())); } catch (e) { setError(errorText(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const remove = async (id) => { setError(""); try { await api.removeWishlist(id); await load(); } catch (e) { setError(errorText(e)); } };
  if (loading) return <div className="state">Đang tải sản phẩm yêu thích...</div>;
  return <section className="wishlist-page">
    <header className="wishlist-heading"><div><p className="eyebrow">DANH SÁCH ĐÃ LƯU</p><h1>Sản phẩm yêu thích</h1><p>Lưu lại sản phẩm bạn quan tâm để dễ tìm và xem lại sau.</p></div><span className="wishlist-count"><HeartFilled /> {items.length} sản phẩm</span></header>
    {error && <div className="form-error" role="alert">{error}</div>}
    {items.length ? <div className="wishlist-grid">{items.map((product) => <article className="wishlist-card" key={product._id}>
      <Link className="wishlist-card-image" to={`/products/${product._id}`}><img src={imageOf(product)} alt={product.name} loading="lazy" /><span className="wishlist-heart"><HeartFilled /></span></Link>
      <button className="wishlist-remove" type="button" onClick={() => remove(product._id)} aria-label={`Bỏ yêu thích ${product.name}`} title="Bỏ yêu thích"><DeleteOutlined /></button>
      <div className="wishlist-card-body"><small>{product.brand?.name || product.category?.name || "Vật tư nhà kính Hoa Sen"}</small><Link className="wishlist-product-name" to={`/products/${product._id}`}><h2>{product.name}</h2></Link><strong>{product.price || product.displayPrice ? money(product.price || product.displayPrice) : "Chọn quy cách để xem giá"}</strong><Link className="wishlist-view-product" to={`/products/${product._id}`}>Xem sản phẩm <span>→</span></Link></div>
    </article>)}</div> : <div className="wishlist-empty"><span><HeartFilled /></span><h2>Danh sách yêu thích đang trống</h2><p>Nhấn biểu tượng trái tim ở sản phẩm để lưu lại và xem tại đây.</p><Link to="/products">Khám phá sản phẩm <span>→</span></Link></div>}
  </section>;
}

export function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = async () => {
    setError("");
    try {
      setItems(unwrapList(await api.getNotifications({ page: 1, limit: 50 })));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    setBusy("all");
    setError("");
    try {
      await api.readAllNotifications();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  };

  const mark = async (item) => {
    if (item.isRead) return;
    setBusy(item._id);
    setError("");
    try {
      await api.readNotification(item._id);
      setItems((current) => current.map((row) => row._id === item._id ? { ...row, isRead: true } : row));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  };

  if (loading) return <div className="state">Đang tải thông báo...</div>;
  const unreadCount = items.filter((item) => !item.isRead).length;
  return (
    <section className="account">
      <div className="section-heading">
        <div><p className="eyebrow">YOUR UPDATES</p><h1>Thông báo</h1><p>{unreadCount ? `Bạn có ${unreadCount} thông báo chưa đọc` : "Bạn đã đọc tất cả thông báo"}</p></div>
        <button className="secondary-button" onClick={markAll} disabled={!unreadCount || busy === "all"}>{busy === "all" ? "Đang cập nhật..." : "Đánh dấu tất cả đã đọc"}</button>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="notification-list">
        {items.length ? items.map((item) => <button className={item.isRead ? "notification read" : "notification"} key={item._id} onClick={() => mark(item)} disabled={busy === item._id} aria-label={`${item.isRead ? "Đã đọc" : "Đánh dấu đã đọc"}: ${item.title || "Thông báo"}`}>
          <span className="notification-dot" />
          <span><b>{item.title || "Thông báo mới"}</b><small>{item.message || item.content}</small><time>{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : ""}</time></span>
        </button>) : <div className="empty"><h3>Chưa có thông báo</h3><p>Thông tin cập nhật về đơn hàng sẽ xuất hiện tại đây.</p></div>}
      </div>
    </section>
  );
}

export function AddressesPage() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(emptyAddress); const [editing, setEditing] = useState(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const load = async () => { try { setItems(unwrapList(await api.getAddresses())); } catch (e) { setError(errorText(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const submit = async (e) => { e.preventDefault(); setSaving(true); setError(""); try { const currentDefault = items.find((item) => item._id === editing)?.isDefault; const payload = { ...form, isDefault: form.isDefault || !items.length || (currentDefault && !items.some((item) => item._id !== editing && item.isDefault)) }; if (editing) await api.updateAddress(editing, payload); else await api.createAddress(payload); setForm(emptyAddress); setEditing(null); await load(); } catch (e) { setError(errorText(e)); } finally { setSaving(false); } };
  const edit = (item) => { setEditing(item._id); setForm({ ...emptyAddress, ...item }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (address) => {
    if (!window.confirm("Xóa địa chỉ này?")) return;
    setError("");
    try {
      await api.deleteAddress(address._id);
      const remaining = items.filter((item) => item._id !== address._id);
      if (address.isDefault && remaining[0]) {
        await api.updateAddress(remaining[0]._id, { ...remaining[0], isDefault: true });
      }
      await load();
    } catch (e) { setError(errorText(e)); }
  };
  const setDefault = async (address) => {
    setError("");
    try {
      await api.updateAddress(address._id, { ...address, isDefault: true });
      await load();
    } catch (e) { setError(errorText(e)); }
  };
  if (loading) return <div className="state">Đang tải địa chỉ...</div>;
  return <section className="account addresses-page">
    <header className="addresses-header">
      <div><p className="eyebrow">GIAO HÀNG</p><h1>Địa chỉ nhận hàng</h1><p>Lưu địa chỉ để chọn nhanh khi đặt hàng.</p></div>
      <span className="addresses-total"><HomeOutlined /> {items.length} địa chỉ</span>
    </header>
    {error && <div className="form-error">{error}</div>}
    <div className="address-manager">
      <form className="profile-form address-form" onSubmit={submit}>
        <div className="address-form-heading"><span className="address-form-icon"><PlusOutlined /></span><div><h2>{editing ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h2><p>Nhập thông tin người nhận và nơi giao hàng.</p></div></div>
        <div className="address-fields">
          {[["fullName","Họ và tên người nhận"],["phone","Số điện thoại"],["address","Số nhà, tên đường"],["province","Tỉnh / Thành phố"],["district","Quận / Huyện"],["ward","Phường / Xã"]].map(([key, label]) => <label key={key}>{label}<input required autoComplete={key === "fullName" ? "name" : key === "phone" ? "tel" : "off"} value={form[key] || ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={label} /></label>)}
          <label className="address-note-field">Ghi chú giao hàng <textarea rows="3" value={form.note || ""} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Ví dụ: gọi trước khi giao, giao giờ hành chính..." /></label>
        </div>
        <label className="check-row address-default-toggle"><input type="checkbox" checked={!!form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /> Đặt làm địa chỉ mặc định</label>
        <div className="address-form-actions"><button className="primary-button" disabled={saving}>{saving ? "Đang lưu..." : editing ? "Cập nhật địa chỉ" : "Lưu địa chỉ"}</button>{editing && <button type="button" className="secondary-button" onClick={() => { setEditing(null); setForm(emptyAddress); }}>Hủy chỉnh sửa</button>}</div>
      </form>
      <div className="saved-addresses">
        <div className="saved-addresses-heading"><div><h2>Địa chỉ đã lưu</h2><p>Chọn một địa chỉ làm mặc định để đặt hàng nhanh hơn.</p></div></div>
        {items.length ? items.map((item) => <article className={`address-card${item.isDefault ? " is-default" : ""}`} key={item._id}>
          <div className="address-card-heading"><span className="address-card-icon"><EnvironmentOutlined /></span><div><b>{item.fullName}</b>{item.isDefault && <span className="address-default-badge"><CheckCircleFilled /> Mặc định</span>}</div></div>
          <div className="address-card-info"><p><PhoneOutlined /> {item.phone}</p><p><EnvironmentOutlined /> {item.address}, {item.ward}, {item.district}, {item.province}</p>{item.note && <p><HomeOutlined /> {item.note}</p>}</div>
          <div className="address-actions">{!item.isDefault && <button className="address-action-default" onClick={() => setDefault(item)}>Đặt mặc định</button>}<button onClick={() => edit(item)}><EditOutlined /> Sửa</button><button className="danger" onClick={() => remove(item)}><DeleteOutlined /> Xóa</button></div>
        </article>) : <div className="addresses-empty"><span><EnvironmentOutlined /></span><h3>Bạn chưa lưu địa chỉ nào</h3><p>Thêm địa chỉ ở biểu mẫu bên cạnh để dùng khi thanh toán.</p></div>}
      </div>
    </div>
  </section>;
}
