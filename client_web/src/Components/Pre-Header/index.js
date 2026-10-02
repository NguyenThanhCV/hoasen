import React from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Menu } from "antd";

import "./index.css";

const storePhone = process.env.REACT_APP_STORE_PHONE || "098 357 1112";
const storeEmail = process.env.REACT_APP_STORE_EMAIL || "vattunhakinhhoasen@gmail.com";

const PreHeader = () => {
  const { t } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage || i18n.language || "vi";
  const languageCode = activeLanguage.toLowerCase().startsWith("en") ? "en" : "vi";
  const languageMenu = (
    <Menu selectedKeys={[languageCode]} onClick={({ key }) => i18n.changeLanguage(key)}>
      <Menu.Item key="vi">🇻🇳 {t("Vietnamese")}</Menu.Item>
      <Menu.Item key="en">🇬🇧 {t("English")}</Menu.Item>
    </Menu>
  );

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
              <span className="contact-label">{t("Hotline")}</span>

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
              <span className="contact-label">{t("Email")}</span>

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
              <span className="contact-label">{t("CompanyAddress")}</span>

              <strong>{t("ViewGoogleMaps")}</strong>
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

            <span>{t("StoreTagline")}</span>
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

            <Dropdown overlay={languageMenu} placement="bottomRight" trigger={["click"]}>
              <Button className="pre-header-language" type="text" icon={<GlobalOutlined />} aria-label={t("ChooseLanguage")}>
                {languageCode.toUpperCase()}
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreHeader;
