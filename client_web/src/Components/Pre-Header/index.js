import React from "react";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

import "./index.css";

const storePhone = process.env.REACT_APP_STORE_PHONE || "098 357 1112";
const storeEmail = process.env.REACT_APP_STORE_EMAIL || "vattunhakinhhoasen@gmail.com";

const PreHeader = () => {
  return (
    <div className="pre-header">
      <div className="pre-header-container">
        {/* =========================================
            LEFT - CONTACT
        ========================================= */}

        <div className="pre-header-left">
          {/* PHONE */}

          <a href={`tel:${storePhone.replaceAll(" ", "")}`} className="pre-header-contact phone">
            <span className="pre-header-icon">
              <PhoneOutlined />
            </span>

            <span className="pre-header-text">
              <span className="contact-label">Hotline</span>

              <strong>{storePhone}</strong>
            </span>
          </a>

          {/* DIVIDER */}

          <span className="pre-header-divider" />

          {/* EMAIL */}

          <a
            href={`mailto:${storeEmail}`}
            className="pre-header-contact email">
            <span className="pre-header-icon">
              <MailOutlined />
            </span>

            <span className="pre-header-text">
              <span className="contact-label">Email</span>

              <strong>{storeEmail}</strong>
            </span>
          </a>

          {/* DIVIDER */}

          <span className="pre-header-divider" />

          {/* LOCATION */}

          <a className="pre-header-contact location" href={process.env.REACT_APP_MAP_URL || "#"} target="_blank" rel="noreferrer">
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
            <a href={process.env.REACT_APP_FACEBOOK_URL || "#"} target="_blank" rel="noreferrer" aria-label="Facebook Vật tư nông nghiệp Hoa Sen" title="Facebook Hoa Sen">
              <FacebookOutlined />
            </a>

            <a href={process.env.REACT_APP_TIKTOK_URL || "#"} target="_blank" rel="noreferrer" aria-label="TikTok Nhà kính Lâm Đồng" title="TikTok Hoa Sen" className="pre-header-tiktok">
              ♪
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreHeader;
