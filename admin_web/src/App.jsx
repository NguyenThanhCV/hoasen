import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import ProductDetail from "./pages/ProductDetail";
import ResourcePage from "./pages/ResourcePage";
import CategoryPage from "./pages/CategoryPage";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import BrandsPage from "./pages/BrandsPage";
import PromotionsPage from "./pages/PromotionsPage";
import CouponsPage from "./pages/CouponsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailAdmin from "./pages/OrderDetailAdmin";
import PaymentsPage from "./pages/PaymentsPage";
import ReviewsPage from "./pages/ReviewsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AddressesPage from "./pages/AddressesPage";
import CartsPage from "./pages/CartsPage";
import WishlistsPage from "./pages/WishlistsPage";
import OrderItemsPage from "./pages/OrderItemsPage";
import NewsManagement from "./pages/NewsManagement";
import BannerManagement from "./pages/BannerManagement";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailAdmin />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="carts" element={<CartsPage />} />
          <Route path="wishlists" element={<WishlistsPage />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="news" element={<NewsManagement />} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="order-items" element={<OrderItemsPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="data/:resource" element={<ResourcePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
