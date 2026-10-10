import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AdminHeader() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = JSON.parse(localStorage.getItem("adminUser") || "{}");
  const identity = admin?.name || admin?.email || "Admin";

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <header>
      <div>
        <b>Quản trị cửa hàng</b>
        <span className="muted"> / {identity}</span>
      </div>
      <button className="ghost" onClick={handleLogout}>
        Đăng xuất
      </button>
    </header>
  );
}
