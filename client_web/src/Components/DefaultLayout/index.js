import React from "react";
import { Layout } from "antd";

import PreHeader from "../Pre-Header";
import HeaderPage from "../HeaderPage";
import FooterPage from "../FooterPage";
import BannerSlider from "../BannerSlider";

import "./index.css";

const { Content } = Layout;

const DefaultLayout = ({ children }) => {
  return (
    <div className="storefront-layout">
      <PreHeader />

      <Layout>
        <HeaderPage />

        <BannerSlider />

        <Content className="shop-content">{children}</Content>
      </Layout>

      <FooterPage />
    </div>
  );
};

export default DefaultLayout;
