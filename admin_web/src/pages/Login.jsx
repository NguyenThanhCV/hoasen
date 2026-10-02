import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function LeafMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="login-leaf-mark">
      <path d="M39.8 8.2C23.3 8.7 12.2 12.1 9 22.4c-2.4 7.8 3.1 14.1 10.1 12.1 10.6-3 18.7-14.2 20.7-26.3Z" fill="currentColor" />
      <path d="M9.5 39.5c6.1-11.1 14.7-18.4 25-25.2" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (auth.token) navigate("/admin", { replace: true });
  }, [auth.token, navigate]);

  const submit = (event) => {
    event.preventDefault();
    dispatch({ type: "LOGIN_REQ", payload: { email: email.trim(), password } });
  };

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Giới thiệu Hoa Sen">
        <div className="login-story-inner">
          <a className="login-brand" href="/login" aria-label="Hoa Sen Admin">
            <span className="login-brand-mark"><LeafMark /></span>
            <span className="login-brand-copy"><strong>HOA SEN</strong><small>VẬT TƯ NHÀ KÍNH</small></span>
          </a>

          <div className="login-story-copy">
            <span className="login-eyebrow"><i /> HỆ THỐNG QUẢN TRỊ</span>
            <h1>Vận hành cửa hàng<br /><em>một cách tinh gọn.</em></h1>
            <p>Nền tảng quản lý dành cho đội ngũ Hoa Sen. Theo dõi đơn hàng, sản phẩm và hoạt động kinh doanh trong cùng một nơi.</p>
            <div className="login-story-note">
              <span className="login-note-icon"><LeafMark /></span>
              <span><strong>Đồng hành cùng nhà nông</strong><small>Giải pháp vật tư nhà kính đáng tin cậy</small></span>
            </div>
          </div>

          <span className="login-story-footer">HOASEN.VN <b>·</b> QUẢN TRỊ NỘI BỘ</span>
        </div>
        <div className="login-decoration login-decoration-one" />
        <div className="login-decoration login-decoration-two" />
      </section>

      <section className="login-panel">
        <div className="login-mobile-brand">
          <span className="login-brand-mark"><LeafMark /></span>
          <span className="login-brand-copy"><strong>HOA SEN</strong><small>VẬT TƯ NHÀ KÍNH</small></span>
        </div>
        <form className="login-form" onSubmit={submit}>
          <div className="login-form-heading">
            <span className="login-eyebrow login-form-eyebrow">CỔNG QUẢN TRỊ HOA SEN</span>
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập bằng tài khoản quản trị của bạn.</p>
          </div>

          <label className="login-field">
            <span>Email</span>
            <span className="login-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>
              <input type="email" name="email" autoComplete="username" placeholder="ten@hoasen.vn" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </span>
          </label>

          <label className="login-field">
            <span>Mật khẩu</span>
            <span className="login-input-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10" width="15" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg>
              <input type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" placeholder="Nhập mật khẩu của bạn" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button className="login-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </span>
          </label>

          {auth.error && <div className="login-error" role="alert"><span aria-hidden="true">!</span>{auth.error}</div>}

          <button className="login-submit" type="submit" disabled={auth.loading}>
            <span>{auth.loading ? "Đang đăng nhập…" : "Đăng nhập"}</span>
            {!auth.loading && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>}
          </button>

          <div className="login-secure-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.7-2.9 8-7 10-4.1-2-7-5.3-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>Thông tin của bạn được bảo vệ an toàn</div>
        </form>
        <footer className="login-panel-footer"><span>© {new Date().getFullYear()} Hoa Sen</span><span>Chỉ dành cho nhân sự được cấp quyền</span></footer>
      </section>
    </main>
  );
}
