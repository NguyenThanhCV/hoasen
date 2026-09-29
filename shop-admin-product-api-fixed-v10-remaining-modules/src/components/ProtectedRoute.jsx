import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("adminToken");
  const expiresAt = Number(localStorage.getItem("adminSessionExpiresAt") || 0);
  const valid = token && (!expiresAt || Date.now() < expiresAt);
  if (!valid) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("adminSessionExpiresAt");
  }
  return valid ? <Outlet /> : <Navigate to="/login" replace />;
}
