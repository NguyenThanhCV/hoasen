/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import * as api from "./api/shop";
import { unwrapList } from "./utils/shop";
import DefaultLayout from "./Components/DefaultLayout";
import DefaultComponentToPage from "./Components/DefaultComponentToPage";
import LegacyLogin from "./PagesClient/Login";
import { WishlistPage, NotificationsPage, AddressesPage } from "./Components/Shop/CustomerPages";
import { CartPage, CheckoutPage, OrdersPage, OrderDetailPage } from "./Components/Shop/ShoppingPages";
import StorefrontSEO from "./Components/SEO";
import "./storefront-polish.css";

const StoreContext = createContext(null);
const useStore = () => useContext(StoreContext);

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

function Layout({ children }) { return <DefaultLayout><div className="page-shell">{children}</div></DefaultLayout>; }
function Login({ register = false }) { const { setUser } = useStore(); const navigate = useNavigate(); const [form, setForm] = useState(register ? { name: "", email: "", password: "", phone: "" } : { email: "", password: "" }); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const submit = async (e) => { e.preventDefault(); setLoading(true); setError(""); try { const result = register ? await api.register(form) : await api.login(form); const next = result.data?.user; if (next) setUser(next); navigate("/"); } catch (err) { setError(err.response?.data?.message || "Thông tin đăng nhập không hợp lệ"); } finally { setLoading(false); } }; return <div className="auth-page"><div className="auth-card"><Link to="/" className="brand-mark">◈ NOVA SHOP</Link><p className="eyebrow">{register ? "TẠO TÀI KHOẢN" : "CHÀO MỪNG TRỞ LẠI"}</p><h1>{register ? "Bắt đầu mua sắm" : "Đăng nhập"}</h1><p className="muted">{register ? "Tạo tài khoản để theo dõi đơn hàng và mua sắm nhanh hơn." : "Đăng nhập để tiếp tục trải nghiệm mua sắm."}</p><form onSubmit={submit}>{register && <input required placeholder="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}{register && <input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}<input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input required type="password" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />{error && <div className="form-error">{error}</div>}<button className="primary-button full" disabled={loading}>{loading ? "Đang xử lý..." : register ? "Tạo tài khoản" : "Đăng nhập"}</button></form><p className="auth-switch">{register ? "Đã có tài khoản?" : "Chưa có tài khoản?"} <Link to={register ? "/login" : "/register"}>{register ? "Đăng nhập" : "Đăng ký ngay"}</Link></p></div></div>; }
function RequireAuth({ children }) { return localStorage.getItem("token") ? children : <Navigate to="/login" replace />; }
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
