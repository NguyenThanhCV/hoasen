import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import './Login.css';

export default function Login() {
  const d = useDispatch(), nav = useNavigate(), s = useSelector(x => x.auth);
  const [e, setE] = useState(""), [p, setP] = useState("");
  useEffect(() => { if (s.token) nav("/admin", { replace: true }); }, [s.token, nav]);
  const submit = x => { x.preventDefault(); d({ type: "LOGIN_REQ", payload: { email: e, password: p } }); };
  return <div className="login"><form onSubmit={submit}><img className="admin-login-logo" src="/hoa-sen-logo.jpg" alt="Logo Vật tư nhà kính Hoa Sen"/><h1>Hoa Sen</h1><p>Đăng nhập quản trị cửa hàng</p>
    <label>Email<input value={e} onChange={x => setE(x.target.value)} /></label>
    <label>Mật khẩu<input type="password" value={p} onChange={x => setP(x.target.value)} /></label>
    {s.error && <div className="error">{s.error}</div>}
    <button className="primary" disabled={s.loading}>{s.loading ? "Đang đăng nhập…" : "Đăng nhập"}</button>
  </form></div>;
}
