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

  const { i18n } = useTranslation();

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
            <div className="login-notification-title">Đăng nhập thất bại</div>
          ),

          description: (
            <div className="login-notification-description">
              {result?.message ||
                "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."}
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

      const accessToken = result?.data?.accessToken;

      const refreshToken = result?.data?.refreshToken;

      /*
       * =====================================================
       * LOGIN SUCCESS
       * =====================================================
       */

      notification.success({
        message: (
          <div className="login-notification-title">Đăng nhập thành công</div>
        ),

        description: (
          <div className="login-notification-description">
            Xin chào <strong>{user?.name || user?.email || "bạn"}</strong>! Chào
            mừng bạn quay trở lại.
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
          <div className="login-notification-title">Không thể đăng nhập</div>
        ),

        description: (
          <div className="login-notification-description">
            {error?.response?.data?.message ||
              "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau."}
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

  const currentLanguage = i18n.language === "vi" ? "Tiếng Việt" : "English";

  return (
    <div className="login-page">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="login-bg-circle login-bg-circle-1"></div>

      <div className="login-bg-circle login-bg-circle-2"></div>

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
        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="login-introduction">
          {/* BRAND */}

          <div className="brand">
            <img className="brand-logo" src="/hoa-sen-logo.jpg" alt="Logo Vật tư nhà kính Hoa Sen" />

            <div className="brand-info">
              <div className="brand-name">HOA SEN</div>

              <div className="brand-subtitle">VẬT TƯ NHÀ KÍNH</div>
            </div>
          </div>

          {/* INTRO */}

          <div className="intro-content">
            <div className="intro-badge">
              <span></span>
              HỆ THỐNG BÁN HÀNG
            </div>

            <h1>
              Giải pháp vật tư
              <br />
              <strong>nhà kính chuyên nghiệp</strong>
            </h1>

            <p>
              Cung cấp các sản phẩm và vật tư nhà kính chất lượng, giúp bạn xây
              dựng và phát triển hệ thống trồng trọt hiệu quả.
            </p>

            {/* FEATURES */}

            <div className="intro-features">
              <div className="intro-feature">
                <div className="feature-icon">✓</div>

                <span>Sản phẩm chất lượng</span>
              </div>

              <div className="intro-feature">
                <div className="feature-icon">✓</div>

                <span>Giá cả cạnh tranh</span>
              </div>

              <div className="intro-feature">
                <div className="feature-icon">✓</div>

                <span>Hỗ trợ khách hàng</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            RIGHT LOGIN
        =================================================== */}

        <div className="login-card">
          {/* LOGIN HEADER */}

          <div className="login-card-header">
            <div className="login-icon">
              <LoginOutlined />
            </div>

            <h2>Chào mừng trở lại!</h2>

            <p>Đăng nhập để tiếp tục mua sắm</p>
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
                  message: "Vui lòng nhập email!",
                },

                {
                  type: "email",
                  message: "Email không hợp lệ!",
                },
              ]}>
              <Input
                size="large"
                prefix={<MailOutlined />}
                placeholder="Nhập địa chỉ email"
                autoComplete="email"
              />
            </Form.Item>

            {/* PASSWORD */}

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },

                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
              ]}>
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </Form.Item>

            {/* OPTIONS */}

            <div className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>

              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  notification.info({
                    message: "Quên mật khẩu",

                    description:
                      "Chức năng khôi phục mật khẩu sẽ được cập nhật.",
                  });
                }}>
                Quên mật khẩu?
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
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </Form.Item>
          </Form>

          {/* REGISTER */}

          <div className="register-area">
            <span>Bạn chưa có tài khoản?</span>

            <button
              type="button"
              onClick={() => {
                navigate("/register");
              }}>
              Đăng ký ngay
            </button>
          </div>

          {/* FOOTER */}

          <div className="login-footer">
            <span>© 2026 Hoa Sen</span>

            <span>•</span>

            <span>Vật tư nhà kính</span>
          </div>
        </div>
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

            <span>Chọn ngôn ngữ</span>
          </div>

          <Button
            block
            onClick={() => {
              changeLanguage("vi");
            }}
            className={i18n.language === "vi" ? "language-active" : ""}>
            🇻🇳 Tiếng Việt
          </Button>

          <Button
            block
            onClick={() => {
              changeLanguage("en");
            }}
            className={i18n.language === "en" ? "language-active" : ""}>
            🇬🇧 English
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
