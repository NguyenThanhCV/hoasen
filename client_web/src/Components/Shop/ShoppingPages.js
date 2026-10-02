import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import * as api from "../../api/shop";
import { attributesOf, cartTotal, imageOf, money, unwrapList } from "../../utils/shop";
import { localized, localizedAttribute } from "../../utils/localized";
import Media from "../Media";

const errorText = (e, t) => e?.response?.data?.message || t("ActionFailed");
const blankAddress = { fullName: "", phone: "", address: "", province: "", district: "", ward: "", note: "" };
const statusLabel = { pending: "PendingConfirmation", confirmed: "Confirmed", processing: "Processing", completed: "Completed", cancelled: "Cancelled", refunded: "Refunded" };
const attributeText = (attributes, product, language) => attributesOf(attributes)
  .map(([key, value]) => {
    const translated = localizedAttribute(product, key, value, language);
    return `${translated.name}: ${translated.value}`;
  })
  .join(" · ");

export function CartPage() {
  const { t, i18n } = useTranslation();
  const [cart, setCart] = useState(null); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(""); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setCart(await api.getCart()); } catch (e) { setError(errorText(e, t)); } finally { setLoading(false); } }, [t]);
  useEffect(() => { load(); }, [load]);
  const update = async (id, quantity) => { if (quantity < 1) return; setBusy(id); try { await api.updateCartItem(id, quantity); await load(); window.dispatchEvent(new Event("cart-change")); } catch (e) { setError(errorText(e, t)); } finally { setBusy(""); } };
  const remove = async (id) => { setBusy(id); try { await api.removeCartItem(id); await load(); window.dispatchEvent(new Event("cart-change")); } catch (e) { setError(errorText(e, t)); } finally { setBusy(""); } };
  const clear = async () => { if (!window.confirm(t("ClearCartConfirm"))) return; try { await api.clearCart(); await load(); window.dispatchEvent(new Event("cart-change")); } catch (e) { setError(errorText(e, t)); } };
  if (loading) return <div className="state">{t("Loading")}</div>;
  const items = cart?.items || [];
  if (!items.length) return <div className="empty large"><h1>{t("EmptyCart")}</h1><p>{t("EmptyCartHint")}</p><Link className="primary-button" to="/products">{t("ContinueShopping")}</Link></div>;
   return <section><div className="section-heading"><div><p className="eyebrow">{t("ShoppingBag")}</p><h1>{t("CartTitle")}</h1></div><button className="link-button danger" onClick={clear}>{t("ClearCart")}</button></div>{error && <div className="form-error">{error}</div>}<div className="cart-layout"><div className="cart-items">{items.map((item) => { const language = i18n.resolvedLanguage || i18n.language; const name = localized(item.product, "name", language) || t("Products"); return <article className="cart-item" key={item._id}><Media src={imageOf(item)} alt={name} className="shop-line-media" autoPlay muted loop controls={false} /><div className="cart-item-copy"><Link to={`/products/${item.product?._id}`}><h3>{name}</h3></Link><p>{attributeText(item.attributes || item.variant?.attributes, item.product, language)}</p><b>{money(item.price)}</b></div><div className="quantity"><button disabled={!!busy} onClick={() => update(item._id, item.quantity - 1)}>−</button><span>{busy === item._id ? "…" : item.quantity}</span><button disabled={!!busy} onClick={() => update(item._id, item.quantity + 1)}>+</button></div><button className="remove-button" disabled={!!busy} onClick={() => remove(item._id)}>×</button></article>; })}</div><aside className="summary"><h2>{t("OrderSummary")}</h2><div><span>{t("Subtotal")}</span><b>{money(cartTotal(cart))}</b></div><div><span>{t("ShippingFee")}</span><span>{t("NotCalculated")}</span></div><p className="muted">{t("ContactShipping")}</p><hr /><div className="summary-total"><span>{t("Subtotal")}</span><b>{money(cartTotal(cart))}</b></div><Link className="primary-button full" to="/checkout">{t("ProceedCheckout")}</Link></aside></div></section>;
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const [cart, setCart] = useState(null); const [addresses, setAddresses] = useState([]); const [addressId, setAddressId] = useState(""); const [form, setForm] = useState(blankAddress); const [paymentMethod, setPaymentMethod] = useState("cod"); const [couponCode, setCouponCode] = useState(""); const [note, setNote] = useState(""); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const navigate = useNavigate();
  useEffect(() => { let active = true; Promise.all([api.getCart(), api.getAddresses()]).then(([nextCart, nextAddresses]) => { if (!active) return; setCart(nextCart); const list = unwrapList(nextAddresses); setAddresses(list); const defaultAddress = list.find((x) => x.isDefault) || list[0]; if (defaultAddress) setAddressId(defaultAddress._id); }).catch((e) => { if (active) setError(errorText(e, t)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [t]);
  const submit = async (e) => { e.preventDefault(); setSaving(true); setError(""); try { let chosen = addressId; if (!chosen) { const address = await api.createAddress(form); chosen = address?._id; } if (!chosen) throw new Error(t("MissingShippingAddress")); await api.createOrder({ addressId: chosen, paymentMethod, couponCode: couponCode.trim() || undefined, note: note.trim() || undefined }); window.dispatchEvent(new Event("cart-change")); navigate("/orders"); } catch (e) { setError(e?.response?.data?.message || e?.message || errorText(e, t)); } finally { setSaving(false); } };
  if (loading) return <div className="state">{t("LoadingCheckout")}</div>;
  if (!cart?.items?.length) return <Navigate to="/cart" replace />;
  return <section><div className="section-heading"><div><p className="eyebrow">{t("Checkout")}</p><h1>{t("Checkout")}</h1></div><Link to="/cart">{t("BackToCart")}</Link></div><form className="checkout-layout" onSubmit={submit}><div className="checkout-card"><h2>{t("ShippingAddress")}</h2>{addresses.length > 0 && <select value={addressId} onChange={(e) => setAddressId(e.target.value)}><option value="">{t("NewAddress")}</option>{addresses.map((a) => <option key={a._id} value={a._id}>{a.fullName} · {a.phone} · {a.address}</option>)}</select>}{!addressId && <div className="address-fields">{[["fullName",t("FullName")],["phone",t("Phone")],["address",t("SpecificAddress")],["province",t("Province")],["district",t("District")],["ward",t("Ward")]].map(([key, label]) => <input key={key} required placeholder={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}</div>}<label className="field-label">{t("OrderNote")}<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("NotePlaceholder")} /></label><h2>{t("PaymentMethod")}</h2>{[["cod",t("CashOnDelivery")],["bank_transfer",t("BankTransfer")],["vnpay",t("Vnpay")]].map(([value, label]) => <label className="payment-option" key={value}><input type="radio" checked={paymentMethod === value} onChange={() => setPaymentMethod(value)} /> {label}</label>)}<label className="field-label">{t("CouponCode")}<input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder={t("CouponPlaceholder")} /></label>{error && <div className="form-error">{error}</div>}</div><aside className="summary"><h2>{t("Order")}</h2>{cart.items.map((item) => <div key={item._id}><span>{localized(item.product, "name", i18n.resolvedLanguage || i18n.language) || t("Products")} × {item.quantity}</span><b>{money(item.price * item.quantity)}</b></div>)}<p className="muted">{t("ShippingNotIncluded")} <Link to="/contact">{t("Contact")}</Link>.</p><hr /><div className="summary-total"><span>{t("Subtotal")}</span><b>{money(cartTotal(cart))}</b></div><button className="primary-button full" disabled={saving}>{saving ? t("CreatingOrder") : t("PlaceOrder")}</button></aside></form></section>;
}

export function OrdersPage() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { try { setOrders(unwrapList(await api.getOrders({ page: 1, limit: 50 }))); } catch (e) { setError(errorText(e, t)); } finally { setLoading(false); } }, [t]);
  useEffect(() => { load(); }, [load]);
  const cancel = async (id) => { if (!window.confirm(t("CancelOrderConfirm"))) return; try { await api.cancelOrder(id); await load(); } catch (e) { setError(errorText(e, t)); } };
  if (loading) return <div className="state">{t("Loading")}</div>;
  return <section><p className="eyebrow">{t("MyAccount")}</p><h1>{t("MyOrdersTitle")}</h1>{error && <div className="form-error">{error}</div>}{orders.length ? <div className="orders-list">{orders.map((order) => <div className="order-card" key={order._id}><Link to={`/orders/${order._id}`}><b>{order.orderNumber}</b><p>{new Date(order.createdAt).toLocaleDateString(String(i18n.resolvedLanguage || i18n.language).startsWith("en") ? "en-US" : "vi-VN")} · {order.paymentMethod}</p></Link><div><strong>{money(order.total)}</strong><span className="status">{t(statusLabel[order.orderStatus]) || order.orderStatus}</span>{["pending","confirmed"].includes(order.orderStatus) && <button className="link-button danger" onClick={() => cancel(order._id)}>{t("CancelOrder")}</button>}</div></div>)}</div> : <div className="empty"><h3>{t("NoOrders")}</h3><Link to="/products">{t("StartShopping")}</Link></div>}</section>;
}

export function OrderDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams(); const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => { api.getOrder(id).then((data) => setState({ loading: false, data, error: "" })).catch((e) => setState({ loading: false, data: null, error: errorText(e, t) })); }, [id, t]);
  if (state.loading) return <div className="state">{t("OrderDetailLoading")}</div>; if (state.error) return <div className="state error">{state.error}</div>; const { order, items } = state.data;
  const lang = i18n.resolvedLanguage || i18n.language;
  return <section><Link to="/orders">{t("BackToOrders")}</Link><div className="detail-order"><p className="eyebrow">{order.orderNumber}</p><h1>{t("OrderDetails")}</h1><p>{t("OrderStatus")} <span className="status">{t(statusLabel[order.orderStatus]) || order.orderStatus}</span></p><div className="order-address"><b>{t("DeliveredTo")}</b><p>{order.customer?.fullName} · {order.customer?.phone}</p><p>{order.address?.address}, {order.address?.ward}, {order.address?.district}, {order.address?.province}</p></div>{items.map((item) => { const productName = localized(item.product, "name", lang) || item.productName; const variant = attributeText(item.attributes, item.product, lang) || item.variantName; return <div className="order-line" key={item._id}><Media src={imageOf(item)} alt={productName} className="shop-line-media" autoPlay muted loop controls={false} /><span>{productName}<small>{variant} · {t("QuantityShort")} {item.quantity}</small></span><b>{money(item.total)}</b></div>; })}<div className="summary-total"><span>{t("Total")}</span><b>{money(order.total)}</b></div></div></section>;
}

