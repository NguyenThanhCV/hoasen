import React from "react";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import "./index.css";

const PreHeader = () => {
  return (
    <div className="pre-header">
      <div className="pre-header-container">
        {/* =========================================
            LEFT - CONTACT
        ========================================= */}

        <div className="pre-header-left">
          {/* PHONE */}

          <a href="tel:0983571112" className="pre-header-contact phone">
            <span className="pre-header-icon">
              <PhoneOutlined />
            </span>

            <span className="pre-header-text">
              <span className="contact-label">Hotline</span>

              <strong>098 357 1112</strong>
            </span>
          </a>

          {/* DIVIDER */}

          <span className="pre-header-divider" />

          {/* EMAIL */}

          <a
            href="mailto:vattunhakinhhoasen@gmail.com"
            className="pre-header-contact email">
            <span className="pre-header-icon">
              <MailOutlined />
            </span>

            <span className="pre-header-text">
              <span className="contact-label">Email</span>

              <strong>vattunhakinhhoasen@gmail.com</strong>
            </span>
          </a>

          {/* DIVIDER */}

          <span className="pre-header-divider" />

          {/* LOCATION */}

          <a className="pre-header-contact location" href="https://maps.app.goo.gl/WqDQ3Z28RvLjf49d8" target="_blank" rel="noreferrer">
            <span className="pre-header-icon">
              <EnvironmentOutlined />
            </span>

            <span className="pre-header-text">
              <span className="contact-label">Địa chỉ công ty</span>

              <strong>Xem trên Google Maps ↗</strong>
            </span>
          </a>
        </div>

        {/* =========================================
            RIGHT
        ========================================= */}

        <div className="pre-header-right">
          {/* MESSAGE */}

          <div className="pre-header-message">
            <ClockCircleOutlined />

            <span>Vật tư nhà kính Hoa Sen đồng hành cùng nông dân Việt</span>
          </div>

          {/* DIVIDER */}

          <span className="pre-header-divider right-divider" />

          {/* SOCIAL */}

          <div className="pre-header-social">
            <a href="https://www.facebook.com/vattunongnghiephoasen" target="_blank" rel="noreferrer" aria-label="Facebook Vật tư nông nghiệp Hoa Sen" title="Facebook Hoa Sen">
              <FacebookOutlined />
            </a>

            <a href="https://www.tiktok.com/@nhakinhlamdongh?_r=1&_t=ZS-9A6FuPVVRUA" target="_blank" rel="noreferrer" aria-label="TikTok Nhà kính Lâm Đồng" title="TikTok Hoa Sen" className="pre-header-tiktok">
              ♪
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreHeader;
