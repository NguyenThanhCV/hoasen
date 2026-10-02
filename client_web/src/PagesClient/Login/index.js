import React, { useState } from "react";

import { Button, Checkbox, Form, Input, Modal, notification } from "antd";

import {
  GlobalOutlined,
  LockOutlined,
  MailOutlined,
  LoginOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  CloseOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";

import { withTranslation, useTranslation } from "react-i18next";

import { asyncLoginRequestAction } from "./stores/action";

import "./index.css";

const LoginComponent = (props) => {
  const { loginRequestDispatch } = props;

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  /*
   * =========================================================
   * CHANGE LANGUAGE
   * =========================================================
   */

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);

    setIsLanguageOpen(false);
  };

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  const onFinish = async (values) => {
    try {
      setLoading(true);

      /*
       * values:
       *
       * {
       *   email: "...",
       *   password: "...",
       *   remember: true
       * }
       */

      const result = await loginRequestDispatch(values);


      /*
       * =====================================================
       * LOGIN FAILED
       * =====================================================
       */

      if (!result || result.success === false) {
        notification.error({
          message: (
            <div className="login-notification-title">{t("LoginFailed")}</div>
          ),

          description: (
            <div className="login-notification-description">
              {result?.message ||
                t("InvalidCredentials")}
            </div>
          ),

          icon: (
            <div className="login-notification-icon login-notification-error">
              <ExclamationCircleFilled />
            </div>
          ),

          placement: "topRight",

          duration: 4,

          className: "login-notification",
        });

        return;
      }

      /*
       * =====================================================
       * GET USER
       * =====================================================
       */

      const user = result?.data?.user;

      /*
       * =====================================================
       * LOGIN SUCCESS
       * =====================================================
       */

      notification.success({
        message: (
          <div className="login-notification-title">{t("LoginSuccessful")}</div>
        ),

        description: (
          <div className="login-notification-description">
            {t("WelcomeBackUser", { name: user?.name || user?.email || t("Customer") })}
          </div>
        ),

        icon: (
          <div className="login-notification-icon login-notification-success">
            <CheckCircleFilled />
          </div>
        ),

        placement: "topRight",

        duration: 3,

        className: "login-notification",
      });

      /*
       * =====================================================
       * REDIRECT
       * =====================================================
       */

      if (user?.role === "admin") {
        navigate("/administrator/users");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      /*
       * =====================================================
       * API / SERVER ERROR
       * =====================================================
       */

      notification.error({
        message: (
          <div className="login-notification-title">{t("LoginUnavailable")}</div>
        ),

        description: (
          <div className="login-notification-description">
            {error?.response?.data?.message ||
              t("LoginTryAgain")}
          </div>
        ),

        icon: (
          <div className="login-notification-icon login-notification-error">
            <CloseOutlined />
          </div>
        ),

        placement: "topRight",

        duration: 4,

        className: "login-notification",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
   * =========================================================
   * LANGUAGE NAME
   * =========================================================
   */

  const currentLanguage = i18n.language === "vi" ? t("Vietnamese") : t("English");

  return (
    <div className="login-page">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="login-backdrop-shape" aria-hidden="true"></div>

      {/* =====================================================
          LANGUAGE
      ===================================================== */}

      <div className="login-language">
        <Button
          type="text"
          icon={<GlobalOutlined />}
          onClick={() => setIsLanguageOpen(true)}>
          {currentLanguage}
        </Button>
      </div>

      {/* =====================================================
          LOGIN WRAPPER
      ===================================================== */}

      <div className="login-wrapper">
        <section className="login-showcase" aria-label={t("LoginShowcaseLabel")}>
          <div className="showcase-brand">
            <img className="brand-logo" src="/hoa-sen-logo.jpg" alt={t("LoginShowcaseLabel")} />
          </div>

          <div className="showcase-copy">
            <span className="showcase-kicker"><i /> {t("LoginShowcaseLabel")}</span>
            <h1>{t("CareForYourGarden")}<br /><em>{t("GrowForGreenSeasons")}</em></h1>
            <p>{t("LoginShowcaseDescription")}</p>
            <div className="showcase-tags"><span>{t("GreenhouseTag")}</span><span>{t("IrrigationTag")}</span><span>{t("FarmingTag")}</span></div>
          </div>

          <div className="greenhouse-art" aria-hidden="true">
            <div className="sun-glow" />
            <div className="greenhouse-frame"><i /><i /><i /><i /><i /></div>
            <div className="plant plant-one"><i /><i /><i /></div>
            <div className="plant plant-two"><i /><i /><i /></div>
            <div className="plant plant-three"><i /><i /><i /></div>
            <div className="ground-line" />
          </div>
          <span className="showcase-footer">HOASEN.VN <b>·</b> {t("BackingFarmers")}</span>
        </section>

        <section className="login-side">
          <div className="login-mobile-brand">
            <img className="brand-logo" src="/hoa-sen-logo.jpg" alt={t("LoginShowcaseLabel")} />
          </div>
          <div className="login-card">
          {/* LOGIN HEADER */}

          <div className="login-card-header">
            <div className="login-icon">
              <LoginOutlined />
            </div>

            <h2>{t("WelcomeBack")}</h2>

            <p>{t("SignInToShop")}</p>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <Form
            name="login"
            layout="vertical"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            className="login-form">
            {/* EMAIL */}

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: t("EmailRequired"),
                },

                {
                  type: "email",
                  message: t("EmailInvalid"),
                },
              ]}>
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder={t("EmailPlaceholder")}
                autoComplete="email"
              />
            </Form.Item>

            {/* PASSWORD */}

            <Form.Item
              label={t("PasswordLabel")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t("PasswordRequired"),
                },

                {
                  min: 6,
                  message: t("PasswordMinLength"),
                },
              ]}>
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder={t("PasswordPlaceholder")}
                autoComplete="current-password"
              />
            </Form.Item>

            {/* OPTIONS */}

            <div className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{t("RememberLogin")}</Checkbox>
              </Form.Item>

              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  notification.info({
                    message: t("ForgotPasswordTitle"),

                    description:
                      t("ForgotPasswordComingSoon"),
                  });
                }}>
                {t("ForgotPassword")}
              </button>
            </div>

            {/* LOGIN BUTTON */}

            <Form.Item className="login-submit">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                icon={<LoginOutlined />}>
                {loading ? t("SigningIn") : t("SignIn")}
              </Button>
            </Form.Item>
          </Form>

          {/* REGISTER */}

          <div className="register-area">
            <span>{t("NoAccount")}</span>

            <button
              type="button"
              onClick={() => {
                navigate("/register");
              }}>
              {t("SignUpNow")}
            </button>
          </div>

          {/* FOOTER */}

          <div className="login-footer">
            <span>© 2026 Hoa Sen</span>

            <span>•</span>

            <span>{t("BrandMark")}</span>
          </div>
          </div>
          <div className="login-side-footer"><span>© 2026 Hoa Sen</span><span>{t("SecureSignIn")}</span></div>
        </section>
      </div>

      {/* =====================================================
          LANGUAGE MODAL
      ===================================================== */}

      <Modal
        open={isLanguageOpen}
        footer={null}
        closable={false}
        onCancel={() => {
          setIsLanguageOpen(false);
        }}
        width={280}
        centered
        className="language-modal">
        <div className="language-modal-content">
          <div className="language-title">
            <GlobalOutlined />

            <span>{t("ChooseLanguage")}</span>
          </div>

          <Button
            block
            onClick={() => {
              changeLanguage("vi");
            }}
            className={i18n.language === "vi" ? "language-active" : ""}>
            🇻🇳 {t("Vietnamese")}
          </Button>

          <Button
            block
            onClick={() => {
              changeLanguage("en");
            }}
            className={i18n.language === "en" ? "language-active" : ""}>
            🇬🇧 {t("English")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

/*
 * ===========================================================
 * REDUX
 * ===========================================================
 */

const mapStateToProps = createStructuredSelector({});

const mapDispatchToProps = (dispatch) => ({
  loginRequestDispatch: (payload) => asyncLoginRequestAction(dispatch)(payload),
});

const Login = withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(LoginComponent),
);

export default Login;
