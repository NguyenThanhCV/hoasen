import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CheckCircleFilled, DeleteOutlined, EnvironmentOutlined, EditOutlined, HeartFilled, HomeOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import * as api from "../../api/shop";
import { imageOf, money, unwrapList } from "../../utils/shop";
import { localized } from "../../utils/localized";
import Media from "../Media";

const errorText = (e, t) => e?.response?.data?.message || t("ActionFailed");
const emptyAddress = { fullName: "", phone: "", address: "", province: "", district: "", ward: "", note: "", isDefault: false };

export function WishlistPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setItems(unwrapList(await api.getWishlist())); } catch (e) { setError(errorText(e, t)); } finally { setLoading(false); } }, [t]);
  useEffect(() => { load(); }, [load]);
  const remove = async (id) => { setError(""); try { await api.removeWishlist(id); await load(); } catch (e) { setError(errorText(e, t)); } };
  if (loading) return <div className="state">{t("WishlistLoading")}</div>;
  return <section className="wishlist-page">
    <header className="wishlist-heading"><div><p className="eyebrow">{t("SavedList")}</p><h1>{t("FavoriteProducts")}</h1><p>{t("WishlistIntro")}</p></div><span className="wishlist-count"><HeartFilled /> {items.length} {t("SavedProductsCount")}</span></header>
    {error && <div className="form-error" role="alert">{error}</div>}
    {items.length ? <div className="wishlist-grid">{items.map((product) => <article className="wishlist-card" key={product._id}>
      <Link className="wishlist-card-image" to={`/products/${product._id}`}><Media src={imageOf(product)} alt={localized(product, "name", lang)} className="wishlist-product-media" loading="lazy" autoPlay muted loop controls={false} /><span className="wishlist-heart"><HeartFilled /></span></Link>
      <button className="wishlist-remove" type="button" onClick={() => remove(product._id)} aria-label={`${t("RemoveFavorite")} ${localized(product, "name", lang)}`} title={t("RemoveFavorite")}><DeleteOutlined /></button>
      <div className="wishlist-card-body"><small>{localized(product.brand, "name", lang) || localized(product.category, "name", lang) || "Vật tư nhà kính Hoa Sen"}</small><Link className="wishlist-product-name" to={`/products/${product._id}`}><h2>{localized(product, "name", lang)}</h2></Link><strong>{product.price || product.displayPrice ? money(product.price || product.displayPrice) : t("ChooseSpecForPrice")}</strong><Link className="wishlist-view-product" to={`/products/${product._id}`}>{t("ViewProduct")} <span>→</span></Link></div>
    </article>)}</div> : <div className="wishlist-empty"><span><HeartFilled /></span><h2>{t("EmptyWishlist")}</h2><p>{t("EmptyWishlistHint")}</p><Link to="/products">{t("ExploreProductsAction")} <span>→</span></Link></div>}
  </section>;
}

export function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setItems(unwrapList(await api.getNotifications({ page: 1, limit: 50 })));
    } catch (e) {
      setError(errorText(e, t));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const markAll = async () => {
    setBusy("all");
    setError("");
    try {
      await api.readAllNotifications();
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (e) {
      setError(errorText(e, t));
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
      setError(errorText(e, t));
    } finally {
      setBusy("");
    }
  };

  if (loading) return <div className="state">{t("NotificationsLoading")}</div>;
  const unreadCount = items.filter((item) => !item.isRead).length;
  return (
    <section className="account">
      <div className="section-heading">
        <div><p className="eyebrow">{t("YourUpdates")}</p><h1>{t("NotificationsTitle")}</h1><p>{unreadCount ? t("UnreadNotifications", { count: unreadCount }) : t("AllNotificationsRead")}</p></div>
        <button className="secondary-button" onClick={markAll} disabled={!unreadCount || busy === "all"}>{busy === "all" ? t("MarkingRead") : t("MarkAllRead")}</button>
      </div>
      {error && <div className="form-error">{error}</div>}
      <div className="notification-list">
        {items.length ? items.map((item) => <button className={item.isRead ? "notification read" : "notification"} key={item._id} onClick={() => mark(item)} disabled={busy === item._id} aria-label={`${item.isRead ? t("IsRead") : t("MarkAsRead")}: ${item.title || t("NotificationsTitle")}`}>
          <span className="notification-dot" />
          <span><b>{localized(item, "title", i18n.resolvedLanguage || i18n.language) || t("NewNotification")}</b><small>{localized(item, "message", i18n.resolvedLanguage || i18n.language) || item.content}</small><time>{item.createdAt ? new Date(item.createdAt).toLocaleString(String(i18n.resolvedLanguage || i18n.language).startsWith("en") ? "en-US" : "vi-VN") : ""}</time></span>
        </button>) : <div className="empty"><h3>{t("NoNotifications")}</h3><p>{t("NotificationsDescription")}</p></div>}
      </div>
    </section>
  );
}

export function AddressesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]); const [form, setForm] = useState(emptyAddress); const [editing, setEditing] = useState(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setItems(unwrapList(await api.getAddresses())); } catch (e) { setError(errorText(e, t)); } finally { setLoading(false); } }, [t]);
  useEffect(() => { load(); }, [load]);
  const submit = async (e) => { e.preventDefault(); setSaving(true); setError(""); try { const currentDefault = items.find((item) => item._id === editing)?.isDefault; const payload = { ...form, isDefault: form.isDefault || !items.length || (currentDefault && !items.some((item) => item._id !== editing && item.isDefault)) }; if (editing) await api.updateAddress(editing, payload); else await api.createAddress(payload); setForm(emptyAddress); setEditing(null); await load(); } catch (e) { setError(errorText(e, t)); } finally { setSaving(false); } };
  const edit = (item) => { setEditing(item._id); setForm({ ...emptyAddress, ...item }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (address) => {
    if (!window.confirm(t("ConfirmDeleteAddress"))) return;
    setError("");
    try {
      await api.deleteAddress(address._id);
      const remaining = items.filter((item) => item._id !== address._id);
      if (address.isDefault && remaining[0]) {
        await api.updateAddress(remaining[0]._id, { ...remaining[0], isDefault: true });
      }
      await load();
    } catch (e) { setError(errorText(e, t)); }
  };
  const setDefault = async (address) => {
    setError("");
    try {
      await api.updateAddress(address._id, { ...address, isDefault: true });
      await load();
    } catch (e) { setError(errorText(e, t)); }
  };
  if (loading) return <div className="state">{t("AddressesLoading")}</div>;
  return <section className="account addresses-page">
    <header className="addresses-header">
      <div><p className="eyebrow">{t("Delivery")}</p><h1>{t("AddressesTitle")}</h1><p>{t("SaveAddressPrompt")}</p></div>
      <span className="addresses-total"><HomeOutlined /> {items.length} {t("SavedAddressesCount")}</span>
    </header>
    {error && <div className="form-error">{error}</div>}
    <div className="address-manager">
      <form className="profile-form address-form" onSubmit={submit}>
        <div className="address-form-heading"><span className="address-form-icon"><PlusOutlined /></span><div><h2>{editing ? t("EditAddress") : t("AddNewAddress")}</h2><p>{t("RecipientAndDeliveryInfo")}</p></div></div>
        <div className="address-fields">
          {[["fullName",t("FullName")],["phone",t("Phone")],["address",t("StreetAndNumber")],["province",t("Province")],["district",t("District")],["ward",t("Ward")]].map(([key, label]) => <label key={key}>{label}<input required autoComplete={key === "fullName" ? "name" : key === "phone" ? "tel" : "off"} value={form[key] || ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={label} /></label>)}
          <label className="address-note-field">{t("DeliveryNote")} <textarea rows="3" value={form.note || ""} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder={t("DeliveryNoteHint")} /></label>
        </div>
        <label className="check-row address-default-toggle"><input type="checkbox" checked={!!form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} /> {t("SetDefaultAddress")}</label>
        <div className="address-form-actions"><button className="primary-button" disabled={saving}>{saving ? t("Saving") : editing ? t("UpdateAddress") : t("SaveAddress")}</button>{editing && <button type="button" className="secondary-button" onClick={() => { setEditing(null); setForm(emptyAddress); }}>{t("CancelEdit")}</button>}</div>
      </form>
      <div className="saved-addresses">
        <div className="saved-addresses-heading"><div><h2>{t("SavedAddresses")}</h2><p>{t("DefaultAddressHint")}</p></div></div>
        {items.length ? items.map((item) => <article className={`address-card${item.isDefault ? " is-default" : ""}`} key={item._id}>
          <div className="address-card-heading"><span className="address-card-icon"><EnvironmentOutlined /></span><div><b>{item.fullName}</b>{item.isDefault && <span className="address-default-badge"><CheckCircleFilled /> {t("Default")}</span>}</div></div>
          <div className="address-card-info"><p><PhoneOutlined /> {item.phone}</p><p><EnvironmentOutlined /> {item.address}, {item.ward}, {item.district}, {item.province}</p>{item.note && <p><HomeOutlined /> {item.note}</p>}</div>
          <div className="address-actions">{!item.isDefault && <button className="address-action-default" onClick={() => setDefault(item)}>{t("SetAsDefault")}</button>}<button onClick={() => edit(item)}><EditOutlined /> {t("Edit")}</button><button className="danger" onClick={() => remove(item)}><DeleteOutlined /> {t("Delete")}</button></div>
        </article>) : <div className="addresses-empty"><span><EnvironmentOutlined /></span><h3>{t("NoAddresses")}</h3><p>{t("AddAddressToCheckout")}</p></div>}
      </div>
    </div>
  </section>;
}

