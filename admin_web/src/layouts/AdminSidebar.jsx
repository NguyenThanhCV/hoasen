import React from "react";
import { NavLink } from "react-router-dom";
import { adminNavigation } from "./adminNavigation";

function AdminBrand() {
  return (
    <div className="logo admin-logo">
      <img src="/hoa-sen-logo.jpg" alt="Logo Vật tư nhà kính Hoa Sen" />
      <span>
        <strong>HOA SEN</strong>
        <small>QUẢN TRỊ CỬA HÀNG</small>
      </span>
    </div>
  );
}

export default function AdminSidebar() {
  return (
    <aside>
      <AdminBrand />
      {adminNavigation.map(({ title, links }) => (
        <nav className="navgroup" key={title} aria-label={title}>
          <small>{title}</small>
          {links.map(([label, path]) => (
            <NavLink
              end={path === "/admin"}
              className={({ isActive }) => (isActive ? "active" : "")}
              to={path}
              key={path}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      ))}
    </aside>
  );
}
