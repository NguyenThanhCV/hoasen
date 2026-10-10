import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="shell">
      <AdminSidebar />
      <main>
        <AdminHeader />
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
