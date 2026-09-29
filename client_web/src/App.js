/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as api from "./api/shop";
import { attributesOf, cartTotal, imageOf, money, unwrapList } from "./utils/shop";
import DefaultLayout from "./Components/DefaultLayout";
import DefaultComponentToPage from "./Components/DefaultComponentToPage";
import LegacyLogin from "./PagesClient/Login";
import { WishlistPage, NotificationsPage, AddressesPage } from "./Components/Shop/CustomerPages";
import { CartPage, CheckoutPage, OrdersPage, OrderDetailPage } from "./Components/Shop/ShoppingPages";
import StorefrontSEO from "./Components/SEO";
import "./storefront-polish.css";

const StoreContext = createContext(null);
const useStore = () => useContext(StoreContext);

function useRequest(fn, initial) {
  const [state, setState] = useState({ data: initial, loading: true, error: "" });
  useEffect(() => { let active = true; setState((s) => ({ ...s, loading: true, error: "" })); fn().then((data) => active && setState({ data, loading: false, error: "" })).catch((error) => active && setState({ data: initial, loading: false, error: error.response?.data?.message || "Không thể tải dữ liệu" })); return () => { active = false; }; }, [fn]);
  return state;
}

function StoreProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [cart, setCart] = useState(null); const [categories, setCategories] = useState([]); const [brands, setBrands] = useState([]);
  const syncUser = async () => { if (!localStorage.getItem("token")) { setUser(null); return; } try { const result = await api.getMe(); const next = result.data || result; setUser(next); localStorage.setItem("user", JSON.stringify(next)); } catch (_) { setUser(null); } };
  const refreshCart = async () => { if (!localStorage.getItem("token")) { setCart(null); return null; } try { const next = await api.getCart(); setCart(next); return next; } catch (_) { return null; } };
  useEffect(() => { syncUser(); Promise.allSettled([api.getCategories(), api.getBrands()]).then(([cats, brandsResult]) => { if (cats.status === "fulfilled") setCategories(unwrapList(cats.value)); if (brandsResult.status === "fulfilled") setBrands(unwrapList(brandsResult.value)); }); const onAuth = () => syncUser(); window.addEventListener("auth-change", onAuth); return () => window.removeEventListener("auth-change", onAuth); }, []);
  useEffect(() => { refreshCart(); }, [user]);
  const addToCart = async (payload) => { const next = await api.addCartItem(payload); setCart(next); window.dispatchEvent(new Event("cart-change")); return next; };
  const value = useMemo(() => ({ user, setUser, cart, setCart, refreshCart, addToCart, categories, brands }), [user, cart, categories, brands]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function Header() {
  const { user, cart, categories } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const count = (cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const submit = (event) => { event.preventDefault(); navigate(`/products?search=${encodeURIComponent(query)}`); };
  const doLogout = async () => { await api.logout(); navigate("/"); };
  const displayName = user?.name || user?.email || "Tài khoản";
  const initials = displayName.trim().charAt(0).toUpperCase();

  return <>
    <div className="announcement">Miễn phí giao hàng cho đơn từ 500.000đ · Hỗ trợ mỗi ngày</div>
    <header className="site-header">
      <Link to="/" className="brand-mark"><span>◈</span> NOVA SHOP</Link>
      <form className="search" onSubmit={submit}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm kiếm sản phẩm..." />
        <button>⌕</button>
      </form>
      <nav className="header-actions">
        {user ? <>
          <Link to="/orders">Đơn hàng</Link>
          <Link to="/account" className="header-account" aria-label={`Tài khoản ${displayName}`}>
            <span className="header-avatar">
              <span className="header-avatar-fallback">{initials}</span>
              {user.avatar && <img src={user.avatar} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
            </span>
            <span>{displayName}</span>
          </Link>
          <button className="link-button" onClick={doLogout}>Đăng xuất</button>
        </> : <Link to="/login">Đăng nhập</Link>}
        <Link className="cart-link" to="/cart">Giỏ hàng <b>{count}</b></Link>
      </nav>
    </header>
    <nav className="category-nav">
      <Link to="/products">Tất cả sản phẩm</Link>
      {categories.slice(0, 6).map((category) => <Link key={category._id} to={`/products?category=${category._id}`}>{category.name}</Link>)}
    </nav>
  </>;
}
function Layout({ children }) { return <DefaultLayout><div className="page-shell">{children}</div></DefaultLayout>; }
function Loading() { return <div className="state">Đang tải dữ liệu...</div>; }
function ErrorState({ message }) { return <div className="state error">{message || "Đã xảy ra lỗi"}</div>; }
function ProductCard({ product, onAdd }) { const [adding, setAdding] = useState(false); const add = async () => { setAdding(true); try { await onAdd(product); } finally { setAdding(false); } }; return <article className="product-card"><Link to={`/products/${product._id}`} className="product-image"><img src={imageOf(product)} alt={product.name} />{product.featured && <span className="badge">Nổi bật</span>}</Link><div className="product-info"><small>{product.brand?.name || product.category?.name || "Sản phẩm"}</small><Link to={`/products/${product._id}`}><h3>{product.name}</h3></Link><div className="rating">★ {Number(product.ratingAverage || 0).toFixed(1)} <span>({product.ratingCount || 0})</span></div><div className="product-bottom"><b>{product.displayPrice ? money(product.displayPrice) : "Xem giá"}</b><button onClick={add} disabled={adding}>{adding ? "..." : "+ Thêm"}</button></div></div></article>; }
async function addFirstVariant(product, addToCart) { if (!localStorage.getItem("token")) { alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ."); return; } const variants = unwrapList(await api.getVariants({ product: product._id, active: true })); if (variants[0]) await addToCart({ product: product._id, variant: variants[0]._id, quantity: 1 }); else alert("Sản phẩm chưa có biến thể để bán."); }
function Home() { const { categories, brands, addToCart } = useStore(); const fetchHome = React.useCallback(() => api.getProducts({ status: "active", limit: 8, featured: true }), []); const { data, loading, error } = useRequest(fetchHome, { data: [] }); const products = unwrapList(data); return <><section className="hero"><div><p className="eyebrow">BỘ SƯU TẬP MỚI</p><h1>Mua sắm thông minh,<br /><em>sống trọn từng ngày.</em></h1><p>Khám phá những sản phẩm được tuyển chọn kỹ lưỡng, giá tốt và giao hàng nhanh.</p><Link className="primary-button" to="/products">Khám phá ngay →</Link></div><div className="hero-art"><div className="hero-circle">✦</div><span>NEW<br />SEASON</span></div></section><section className="section"><div className="section-heading"><div><p className="eyebrow">ĐƯỢC YÊU THÍCH</p><h2>Sản phẩm nổi bật</h2></div><Link to="/products">Xem tất cả →</Link></div>{loading ? <Loading /> : error ? <ErrorState message={error} /> : <div className="product-grid">{products.map((p) => <ProductCard key={p._id} product={p} onAdd={(p) => addFirstVariant(p, addToCart)} />)}</div>}</section><section className="section"><div className="section-heading"><div><p className="eyebrow">KHÁM PHÁ</p><h2>Mua theo danh mục</h2></div></div><div className="category-grid">{categories.slice(0, 6).map((cat, index) => <Link className={`category-tile tile-${index % 4}`} key={cat._id} to={`/products?category=${cat._id}`}><span>{String(index + 1).padStart(2, "0")}</span><h3>{cat.name}</h3><small>Xem sản phẩm →</small></Link>)}</div></section>{brands.length > 0 && <section className="brand-strip"><p className="eyebrow">THƯƠNG HIỆU ĐỒNG HÀNH</p><div>{brands.slice(0, 6).map((brand) => <span key={brand._id}>{brand.name}</span>)}</div></section>}</>; }
function Products() { const { categories, brands, addToCart } = useStore(); const [params, setParams] = useSearchParams(); const search = params.get("search") || ""; const category = params.get("category") || ""; const brand = params.get("brand") || ""; const [keyword, setKeyword] = useState(search); const fetchProducts = React.useCallback(() => api.getProducts({ page: 1, limit: 24, status: "active", search, category, brand }), [search, category, brand]); const { data, loading, error } = useRequest(fetchProducts, { data: [] }); const products = unwrapList(data); const setFilter = (key, value) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next); }; return <section><div className="listing-head"><div><p className="eyebrow">NOVA COLLECTION</p><h1>Tất cả sản phẩm</h1><p>{data?.pagination?.total || products.length} sản phẩm được tìm thấy</p></div><form className="inline-search" onSubmit={(e) => { e.preventDefault(); setFilter("search", keyword); }}><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên sản phẩm" /><button>Tìm</button></form></div><div className="filters"><select value={category} onChange={(e) => setFilter("category", e.target.value)}><option value="">Tất cả danh mục</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select><select value={brand} onChange={(e) => setFilter("brand", e.target.value)}><option value="">Tất cả thương hiệu</option>{brands.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></div>{loading ? <Loading /> : error ? <ErrorState message={error} /> : products.length ? <div className="product-grid">{products.map((p) => <ProductCard key={p._id} product={p} onAdd={(p) => addFirstVariant(p, addToCart)} />)}</div> : <div className="empty"><h3>Chưa tìm thấy sản phẩm</h3><p>Thử thay đổi từ khóa hoặc bộ lọc.</p></div>}</section>; }
function ProductDetail() { const { id } = useParams(); const { addToCart } = useStore(); const navigate = useNavigate(); const [selected, setSelected] = useState(null); const [qty, setQty] = useState(1); const [message, setMessage] = useState(""); const fetchDetail = React.useCallback(async () => { const [product, variants, reviews] = await Promise.all([api.getProduct(id), api.getVariants({ product: id, active: true }), api.getReviews(id).catch(() => ({ data: [] }))]); return { product: product.data || product, variants: unwrapList(variants), reviews: unwrapList(reviews) }; }, [id]); const { data, loading, error } = useRequest(fetchDetail, { product: null, variants: [], reviews: [] }); useEffect(() => { if (data.variants?.length && !selected) setSelected(data.variants[0]); }, [data.variants, selected]); if (loading) return <Loading />; if (error) return <ErrorState message={error} />; const { product, variants, reviews } = data; const add = async () => { if (!localStorage.getItem("token")) return navigate(`/login?next=/products/${id}`); if (!selected) return; await addToCart({ product: product._id, variant: selected._id, quantity: qty }); setMessage("Đã thêm sản phẩm vào giỏ hàng"); }; return <section className="detail"><div className="detail-image"><img src={imageOf(selected || product)} alt={product.name} /></div><div className="detail-copy"><p className="eyebrow">{product.brand?.name || product.category?.name || "NOVA SHOP"}</p><h1>{product.name}</h1><div className="rating">★ {Number(product.ratingAverage || 0).toFixed(1)} · {product.ratingCount || 0} đánh giá</div><p className="detail-description">{product.description || product.shortDescription || "Sản phẩm chất lượng được tuyển chọn cho bạn."}</p>{variants.length > 0 && <><label className="field-label">Lựa chọn sản phẩm</label><div className="variant-list">{variants.map((variant) => <button className={selected?._id === variant._id ? "variant selected" : "variant"} key={variant._id} onClick={() => setSelected(variant)}><b>{money(variant.price)}</b><span>{attributesOf(variant.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ") || variant.sku}</span><small>Còn {Math.max((variant.stock || 0) - (variant.reservedStock || 0), 0)}</small></button>)}</div></>}{selected && <div className="buy-row"><div className="quantity"><button onClick={() => setQty(Math.max(1, qty - 1))}>−</button><span>{qty}</span><button onClick={() => setQty(qty + 1)}>+</button></div><button className="primary-button" onClick={add}>Thêm vào giỏ · {money(selected.price * qty)}</button></div>}{message && <p className="success-text">✓ {message} · <Link to="/cart">Xem giỏ hàng</Link></p>}<div className="trust-list"><span>✓ Kiểm tra hàng khi nhận</span><span>✓ Đổi trả trong 7 ngày</span><span>✓ Giao hàng toàn quốc</span></div></div><div className="reviews"><h2>Đánh giá sản phẩm</h2>{reviews.length ? reviews.map((review) => <div className="review" key={review._id}><b>{review.user?.name || "Khách hàng"}</b><span>★ {review.rating}</span><p>{review.comment}</p></div>) : <p>Chưa có đánh giá nào.</p>}</div></section>; }
function Login({ register = false }) { const { setUser } = useStore(); const navigate = useNavigate(); const [form, setForm] = useState(register ? { name: "", email: "", password: "", phone: "" } : { email: "", password: "" }); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const submit = async (e) => { e.preventDefault(); setLoading(true); setError(""); try { const result = register ? await api.register(form) : await api.login(form); const next = result.data?.user; if (next) setUser(next); navigate("/"); } catch (err) { setError(err.response?.data?.message || "Thông tin đăng nhập không hợp lệ"); } finally { setLoading(false); } }; return <div className="auth-page"><div className="auth-card"><Link to="/" className="brand-mark">◈ NOVA SHOP</Link><p className="eyebrow">{register ? "TẠO TÀI KHOẢN" : "CHÀO MỪNG TRỞ LẠI"}</p><h1>{register ? "Bắt đầu mua sắm" : "Đăng nhập"}</h1><p className="muted">{register ? "Tạo tài khoản để theo dõi đơn hàng và mua sắm nhanh hơn." : "Đăng nhập để tiếp tục trải nghiệm mua sắm."}</p><form onSubmit={submit}>{register && <input required placeholder="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}{register && <input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}<input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required type="password" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{error && <div className="form-error">{error}</div>}<button className="primary-button full" disabled={loading}>{loading ? "Đang xử lý..." : register ? "Tạo tài khoản" : "Đăng nhập"}</button></form><p className="auth-switch">{register ? "Đã có tài khoản?" : "Chưa có tài khoản?"} <Link to={register ? "/login" : "/register"}>{register ? "Đăng nhập" : "Đăng ký ngay"}</Link></p></div></div>; }
function RequireAuth({ children }) { return localStorage.getItem("token") ? children : <Navigate to="/login" replace />; }
function Cart() { const { cart, refreshCart } = useStore(); const navigate = useNavigate(); const [busy, setBusy] = useState(false); const items = cart?.items || []; const update = async (id, quantity) => { if (quantity < 1) return; setBusy(true); try { await api.updateCartItem(id, quantity); await refreshCart(); } finally { setBusy(false); } }; const remove = async (id) => { setBusy(true); try { await api.removeCartItem(id); await refreshCart(); } finally { setBusy(false); } }; if (!cart || !items.length) return <div className="empty large"><h1>Giỏ hàng đang trống</h1><p>Hãy chọn thêm vài sản phẩm bạn yêu thích.</p><Link className="primary-button" to="/products">Tiếp tục mua sắm</Link></div>; return <section><div className="section-heading"><div><p className="eyebrow">SHOPPING BAG</p><h1>Giỏ hàng của bạn</h1></div><span>{items.length} sản phẩm</span></div><div className="cart-layout"><div className="cart-items">{items.map((item) => <div className="cart-item" key={item._id}><img src={imageOf(item)} alt={item.product?.name} /><div className="cart-item-copy"><Link to={`/products/${item.product?._id}`}><h3>{item.product?.name || "Sản phẩm"}</h3></Link><p>{attributesOf(item.attributes || item.variant?.attributes).map(([k, v]) => `${k}: ${v}`).join(" · ")}</p><b>{money(item.price)}</b></div><div className="quantity"><button disabled={busy} onClick={() => update(item._id, item.quantity - 1)}>−</button><span>{item.quantity}</span><button disabled={busy} onClick={() => update(item._id, item.quantity + 1)}>+</button></div><button className="remove-button" onClick={() => remove(item._id)}>×</button></div>)}</div><aside className="summary"><h2>Tóm tắt đơn hàng</h2><div><span>Tạm tính</span><b>{money(cartTotal(cart))}</b></div><div><span>Phí vận chuyển</span><span>Tính ở bước sau</span></div><hr /><div className="summary-total"><span>Tổng cộng</span><b>{money(cartTotal(cart))}</b></div><button className="primary-button full" onClick={() => navigate("/checkout")}>Tiến hành thanh toán</button></aside></div></section>; }
function Checkout() { const { cart, refreshCart } = useStore(); const navigate = useNavigate(); const [addresses, setAddresses] = useState([]); const [addressId, setAddressId] = useState(""); const [form, setForm] = useState({ fullName: "", phone: "", address: "", province: "", district: "", ward: "" }); const [paymentMethod, setPaymentMethod] = useState("cod"); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); useEffect(() => { api.getAddresses().then((r) => { const list = unwrapList(r); setAddresses(list); if (list[0]) setAddressId(list[0]._id); }).catch(() => {}); }, []); const submit = async (e) => { e.preventDefault(); setSaving(true); setError(""); try { let chosen = addressId; if (!chosen) { const result = await api.createAddress(form); chosen = (result.data || result)._id; } await api.createOrder({ addressId: chosen, paymentMethod }); await refreshCart(); navigate("/orders"); } catch (e) { setError(e.response?.data?.message || "Không thể tạo đơn hàng"); } finally { setSaving(false); } }; if (!cart?.items?.length) return <Navigate to="/cart" replace />; return <section><div className="section-heading"><div><p className="eyebrow">CHECKOUT</p><h1>Thanh toán</h1></div></div><form className="checkout-layout" onSubmit={submit}><div className="checkout-card"><h2>Địa chỉ nhận hàng</h2>{addresses.length > 0 && <select value={addressId} onChange={(e) => setAddressId(e.target.value)}><option value="">+ Nhập địa chỉ mới</option>{addresses.map((a) => <option key={a._id} value={a._id}>{a.fullName} · {a.phone} · {a.address}</option>)}</select>}{!addressId && <div className="address-fields"><input required placeholder="Họ và tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /><input required placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /><input required placeholder="Địa chỉ cụ thể" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /><input required placeholder="Tỉnh / Thành phố" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /><input required placeholder="Quận / Huyện" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /><input required placeholder="Phường / Xã" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} /></div>}<h2>Phương thức thanh toán</h2><label className="payment-option"><input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> Thanh toán khi nhận hàng (COD)</label><label className="payment-option"><input type="radio" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} /> Chuyển khoản ngân hàng</label>{error && <div className="form-error">{error}</div>}</div><aside className="summary"><h2>Đơn hàng</h2>{cart.items.map((item) => <div key={item._id}><span>{item.product?.name} × {item.quantity}</span><b>{money(item.price * item.quantity)}</b></div>)}<hr /><div className="summary-total"><span>Tổng cộng</span><b>{money(cartTotal(cart))}</b></div><button className="primary-button full" disabled={saving}>{saving ? "Đang tạo đơn..." : "Đặt hàng"}</button></aside></form></section>; }
function Orders() { const fetchOrders = React.useCallback(() => api.getOrders({ page: 1, limit: 50 }), []); const { data, loading, error } = useRequest(fetchOrders, { data: [] }); const orders = unwrapList(data); if (loading) return <Loading />; return <section><p className="eyebrow">MY ACCOUNT</p><h1>Đơn hàng của tôi</h1>{error ? <ErrorState message={error} /> : orders.length ? <div className="orders-list">{orders.map((order) => <Link className="order-card" to={`/orders/${order._id}`} key={order._id}><div><b>{order.orderNumber}</b><p>{new Date(order.createdAt).toLocaleDateString("vi-VN")} · {order.paymentMethod}</p></div><div><strong>{money(order.total)}</strong><span className="status">{order.orderStatus}</span></div></Link>)}</div> : <div className="empty"><h3>Bạn chưa có đơn hàng</h3><Link to="/products">Bắt đầu mua sắm →</Link></div>}</section>; }
function OrderDetail() { const { id } = useParams(); const [state, setState] = useState({ loading: true, error: "", data: null }); useEffect(() => { api.getOrder(id).then((r) => setState({ loading: false, error: "", data: r.data || r })).catch((e) => setState({ loading: false, error: e.response?.data?.message || "Không tìm thấy đơn hàng", data: null })); }, [id]); if (state.loading) return <Loading />; if (state.error) return <ErrorState message={state.error} />; const { order, items } = state.data; return <section><Link to="/orders">← Quay lại đơn hàng</Link><div className="detail-order"><p className="eyebrow">{order.orderNumber}</p><h1>Chi tiết đơn hàng</h1><p>Trạng thái: <span className="status">{order.orderStatus}</span></p>{items.map((item) => <div className="order-line" key={item._id}><img src={imageOf(item)} alt={item.productName} /><span>{item.productName}<small>{item.variantName} · SL: {item.quantity}</small></span><b>{money(item.total)}</b></div>)}<div className="summary-total"><span>Tổng cộng</span><b>{money(order.total)}</b></div></div></section>; }
function Account() {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [confirmAction, setConfirmAction] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    setForm({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" });
  }, [user]);

  const submitProfile = (event) => {
    event.preventDefault();
    setNotice({ type: "", text: "" });
    if (!form.name.trim()) return setNotice({ type: "error", text: "Vui lòng nhập họ và tên." });
    setConfirmAction("profile");
  };

  const submitPassword = (event) => {
    event.preventDefault();
    setNotice({ type: "", text: "" });
    if (password.newPassword.length < 8) return setNotice({ type: "error", text: "Mật khẩu mới cần có ít nhất 8 ký tự." });
    if (password.newPassword !== password.confirmPassword) return setNotice({ type: "error", text: "Mật khẩu xác nhận chưa khớp." });
    setConfirmAction("password");
  };

  const confirmSave = async () => {
    setSaving(true);
    setNotice({ type: "", text: "" });
    try {
      if (confirmAction === "profile") {
        const result = await api.updateMe({ name: form.name.trim(), phone: form.phone.trim(), avatar: form.avatar.trim() });
        const next = result?.data || result;
        setUser(next);
        localStorage.setItem("user", JSON.stringify(next));
        window.dispatchEvent(new Event("auth-change"));
        setNotice({ type: "success", text: "Đã cập nhật thông tin cá nhân." });
      } else if (confirmAction === "password") {
        await api.changePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword });
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
        window.dispatchEvent(new Event("auth-change"));
        window.alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.");
        navigate("/login");
      }
    } catch (error) {
      setNotice({ type: "error", text: error.response?.data?.message || "Không thể lưu thay đổi. Vui lòng thử lại." });
    } finally {
      setSaving(false);
      setConfirmAction("");
    }
  };

  return <section className="account account-page">
    <p className="eyebrow">TÀI KHOẢN CỦA BẠN</p>
    <h1>Thông tin cá nhân</h1>
    <p className="account-intro">Cập nhật thông tin liên hệ, ảnh đại diện và mật khẩu của bạn.</p>
    {notice.text && <div className={`account-notice ${notice.type}`} role="status">{notice.text}</div>}

    <form className="profile-form account-profile-form" onSubmit={submitProfile}>
      <div className="account-form-heading"><div><h2>Thông tin tài khoản</h2><p>Email đăng nhập không thể thay đổi tại đây.</p></div>{form.avatar && <img className="account-avatar-preview" src={form.avatar} alt="Ảnh đại diện xem trước" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />}</div>
      <label>Email<input type="email" disabled value={user?.email || ""} /></label>
      <label>Họ và tên *<input required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
      <label>Số điện thoại<input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Ví dụ: 098 123 4567" /></label>
      <label>Đường dẫn ảnh đại diện<input type="url" value={form.avatar} onChange={(event) => setForm({ ...form, avatar: event.target.value })} placeholder="https://..." /></label>
      <button className="primary-button" type="submit">Lưu thông tin</button>
    </form>

    <div className="account-address-link"><div><b>Địa chỉ nhận hàng</b><span>Thêm hoặc sửa địa chỉ giao hàng của bạn.</span></div><Link to="/addresses">Quản lý địa chỉ <span>→</span></Link></div>

    <form className="profile-form account-password-form" onSubmit={submitPassword}>
      <div className="account-form-heading"><div><h2>Đổi mật khẩu</h2><p>Dùng mật khẩu hiện tại để tạo mật khẩu mới.</p></div></div>
      <label>Mật khẩu hiện tại<input required type="password" autoComplete="current-password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} /></label>
      <label>Mật khẩu mới<input required minLength={8} type="password" autoComplete="new-password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} /></label>
      <label>Nhập lại mật khẩu mới<input required minLength={8} type="password" autoComplete="new-password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} /></label>
      <small className="account-security-note">Sau khi đổi mật khẩu, bạn cần đăng nhập lại trên các thiết bị.</small>
      <button className="primary-button" type="submit">Đổi mật khẩu</button>
    </form>

    {confirmAction && <div className="account-confirm-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setConfirmAction(""); }}>
      <section className="account-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="account-confirm-title">
        <span className="account-confirm-icon">?</span>
        <h2 id="account-confirm-title">Xác nhận thay đổi</h2>
        <p>{confirmAction === "profile" ? "Bạn có muốn lưu các thông tin cá nhân vừa chỉnh sửa không?" : "Bạn có muốn đổi mật khẩu ngay bây giờ không? Sau khi đổi, bạn sẽ cần đăng nhập lại."}</p>
        {confirmAction === "profile" && <div className="account-confirm-summary"><span>Họ và tên</span><b>{form.name || "Chưa nhập"}</b><span>Số điện thoại</span><b>{form.phone || "Chưa cập nhật"}</b></div>}
        <div className="account-confirm-actions"><button type="button" className="account-cancel-button" disabled={saving} onClick={() => setConfirmAction("")}>Kiểm tra lại</button><button type="button" className="primary-button" disabled={saving} onClick={confirmSave}>{saving ? "Đang lưu..." : "Xác nhận"}</button></div>
      </section>
    </div>}
  </section>;
}
export default function App() { return <BrowserRouter><StoreProvider><StorefrontSEO /><Routes><Route path="/login" element={<LegacyLogin />} /><Route path="/register" element={<Login register />} /><Route path="/cart" element={<RequireAuth><Layout><CartPage /></Layout></RequireAuth>} /><Route path="/checkout" element={<RequireAuth><Layout><CheckoutPage /></Layout></RequireAuth>} /><Route path="/orders" element={<RequireAuth><Layout><OrdersPage /></Layout></RequireAuth>} /><Route path="/orders/:id" element={<RequireAuth><Layout><OrderDetailPage /></Layout></RequireAuth>} /><Route path="/wishlist" element={<RequireAuth><Layout><WishlistPage /></Layout></RequireAuth>} /><Route path="/notifications" element={<RequireAuth><Layout><NotificationsPage /></Layout></RequireAuth>} /><Route path="/addresses" element={<RequireAuth><Layout><AddressesPage /></Layout></RequireAuth>} /><Route path="/account" element={<RequireAuth><Layout><Account /></Layout></RequireAuth>} /><Route path="/*" element={<DefaultComponentToPage />} /></Routes></StoreProvider></BrowserRouter>; }
