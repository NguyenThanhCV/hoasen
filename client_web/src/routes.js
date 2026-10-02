import React from "react";
import ErroPage from "./PagesClient/Erropage/ErroPage";
import Login from "./PagesClient/Login";
import Users from "./PagesClient";
import Products from "./PagesClient/Products";
import Categories from "./PagesClient/Categories";
import Brands from "./PagesClient/Brands";
import ProductDetail from "./PagesClient/ProductDetail";
import InfoPages from "./PagesClient/InfoPages";
import NewsPage, { NewsDetailPage } from "./PagesClient/News";
import CouponsPage from "./PagesClient/Coupons";
const routes = [
  {
    path: "/*",
    component: () => <ErroPage />,
  },
  {
    path: "/login",
    component: () => <Login />,
  },
  {
    path: "/",
    component: () => <Users />,
  },
  {
    path: "/products",
    component: () => <Products />,
  },
  {
    path: "/coupons",
    component: () => <CouponsPage />,
  },
  {
    path: "/categories",
    component: () => <Categories />,
  },
  {
    path: "/brands",
    component: () => <Brands />,
  },
  { path: "/about", component: () => <InfoPages /> },
  { path: "/contact", component: () => <InfoPages /> },
  { path: "/faq", component: () => <InfoPages /> },
  { path: "/privacy", component: () => <InfoPages /> },
  { path: "/terms", component: () => <InfoPages /> },
  { path: "/news", component: () => <NewsPage /> },
  { path: "/news/:slug", component: () => <NewsDetailPage /> },
  {
    path: "/products/:productId",
    component: () => <ProductDetail />,
  },
];
export default routes;
