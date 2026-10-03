import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Menu,
  Button,
  Badge,
  Avatar,
  Dropdown,
  Drawer,
  Input,
  notification,
} from "antd";

import {
  MenuOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  DownOutlined,
  LogoutOutlined,
  ProfileOutlined,
  HeartOutlined,
  LoginOutlined,
  UserAddOutlined,
  BellOutlined,
  EnvironmentOutlined,
  TagOutlined,
  HomeOutlined,
  AppstoreOutlined,
  FolderOutlined,
  ShopOutlined,
  InfoCircleOutlined,
  ReadOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";

import { asyncLogoutAction } from "../../PagesClient/Logout/stores/actions";

import "./index.css";
import { getCart } from "../../api/shop";

const HeaderPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const location = useLocation();

  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState(null);

  const [searchText, setSearchText] = useState("");

  const [cartCount, setCartCount] = useState(0);

  // =====================================================
  // LOAD USER
  // =====================================================

  const loadUser = () => {
    try {
      const token = localStorage.getItem("token");

      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setUser(null);

        return;
      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("HEADER LOAD USER ERROR:", error);

      setUser(null);
    }
  };

  // =====================================================
  // AUTH CHANGE
  // =====================================================

  const loadCartCount = async () => {
    if (!localStorage.getItem("token")) {
      setCartCount(0);
      return;
    }
    try {
      const response = await getCart();
      const cart = response?.data || response;
      setCartCount((cart?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    } catch (_) {
      setCartCount(0);
    }
  };

  useEffect(() => {
    loadUser();
    loadCartCount();
    window.addEventListener("auth-change", loadUser);
    window.addEventListener("auth-change", loadCartCount);
    window.addEventListener("cart-change", loadCartCount);
    return () => {
      window.removeEventListener("auth-change", loadUser);
      window.removeEventListener("auth-change", loadCartCount);
      window.removeEventListener("cart-change", loadCartCount);
    };
  }, []);

  // =====================================================
  // CHECK USER KHI ĐỔI TRANG
  // =====================================================

  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    const keyword = searchText.trim();

    if (!keyword) {
      navigate("/search");

      setMobileMenuOpen(false);

      return;
    }

    navigate(`/search?q=${encodeURIComponent(keyword)}`);

    setMobileMenuOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // =====================================================
  // USER NAME
  // =====================================================

  const getUserName = () => {
    if (!user) {
      return t("Account");
    }

    return user.name || user.email || t("Account");
  };

  // =====================================================
  // USER ROLE
  // =====================================================

  const getUserRole = () => {
    if (!user) {
      return "";
    }

    if (user.role === "admin") {
      return t("Admin");
    }

    return t("Customer");
  };

  // =====================================================
  // AVATAR TEXT
  // =====================================================

  const getAvatarText = () => {
    const name = getUserName();

    if (!name || name === t("Account")) {
      return "";
    }

    return name.charAt(0).toUpperCase();
  };

  // =====================================================
  // CLEAR LOGIN DATA
  // =====================================================

  const clearLoginData = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("refreshToken");

    localStorage.removeItem("user");

    // Xóa cookie nếu có
    document.cookie = "accessToken=; Max-Age=0; path=/;";

    document.cookie = "refreshToken=; Max-Age=0; path=/;";

    setUser(null);

    // Báo cho các component khác
    window.dispatchEvent(new Event("auth-change"));

    setMobileMenuOpen(false);

    notification.success({
      message: t("LogoutSuccess"),
      description: t("LogoutDescription"),
    });

    navigate("/");
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refreshToken");

    // Không có refresh token
    if (!refreshToken) {
      clearLoginData();

      return;
    }

    try {
      const result = dispatch(
        asyncLogoutAction({
          refreshToken,
        }),
      );

      // Redux Thunk trả Promise
      if (result && typeof result.then === "function") {
        result
          .then((response) => {
            console.log("LOGOUT RESULT:", response);

            clearLoginData();
          })
          .catch((error) => {
            console.error("LOGOUT ERROR:", error);

            clearLoginData();
          });
      } else {
        // Trường hợp không trả Promise
        clearLoginData();
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);

      clearLoginData();
    }
  };

  // =====================================================
  // USER MENU CLICK
  // =====================================================

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/account");

        break;

      case "orders":
        navigate("/orders");

        break;

      case "wishlist":
        navigate("/wishlist");

        break;

      case "notifications":
        navigate("/notifications");

        break;

      case "addresses":
        navigate("/addresses");

        break;

      case "login":
        navigate("/login");

        break;

      case "register":
        navigate("/register");

        break;

      case "logout":
        handleLogout();

        break;

      default:
        break;
    }
  };

  // =====================================================
  // USER MENU - ANT DESIGN 4
  // =====================================================

  const userMenu = user ? (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key="profile" icon={<ProfileOutlined />}>
        {t("Profile")}
      </Menu.Item>

      <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
        {t("MyOrders")}
      </Menu.Item>

      <Menu.Item key="wishlist" icon={<HeartOutlined />}>
        {t("Favorites")}
      </Menu.Item>

      <Menu.Item key="notifications" icon={<BellOutlined />}>
        {t("Notifications")}
      </Menu.Item>
      <Menu.Item key="addresses" icon={<EnvironmentOutlined />}>
        {t("DeliveryAddress")}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  ) : (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key="login" icon={<LoginOutlined />}>
        {t("Login")}
      </Menu.Item>

      <Menu.Item key="register" icon={<UserAddOutlined />}>
        {t("Register")}
      </Menu.Item>
    </Menu>
  );

  // =====================================================
  // MAIN MENU
  // =====================================================

  const mainMenuItems = [
    {
      key: "home",
      label: <Link to="/">{t("Home")}</Link>,
      icon: <HomeOutlined />,
    },

    {
      key: "products",
      label: t("Products"),
      icon: <AppstoreOutlined />,

      children: [
        {
          key: "all-products",
          label: <Link to="/products">{t("AllProducts")}</Link>,
          icon: <AppstoreOutlined />,
        },

        {
          key: "categories",
          label: <Link to="/categories">{t("Categories")}</Link>,
          icon: <FolderOutlined />,
        },

        {
          key: "brands",
          label: <Link to="/brands">{t("Brands")}</Link>,
          icon: <ShopOutlined />,
        },
      ],
    },

    {
      key: "coupons",
      label: <Link to="/coupons">{t("Promotions")}</Link>,
      icon: <TagOutlined />,
    },

    {
      key: "about",
      label: <Link to="/about">{t("About")}</Link>,
      icon: <InfoCircleOutlined />,
    },

    {
      key: "news",
      label: <Link to="/news">{t("News")}</Link>,
      icon: <ReadOutlined />,
    },

    {
      key: "contact",
      label: <Link to="/contact">{t("Contact")}</Link>,
      icon: <CustomerServiceOutlined />,
    },
  ];

  // =====================================================
  // SELECTED MENU
  // =====================================================

  let selectedKeys = [];

  if (location.pathname === "/") {
    selectedKeys = ["home"];
  } else if (location.pathname.startsWith("/products")) {
    selectedKeys = ["products"];
  } else if (location.pathname.startsWith("/coupons")) {
    selectedKeys = ["coupons"];
  } else if (location.pathname.startsWith("/about")) {
    selectedKeys = ["about"];
  } else if (location.pathname.startsWith("/news")) {
    selectedKeys = ["news"];
  } else if (location.pathname.startsWith("/contact")) {
    selectedKeys = ["contact"];
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="shop-header">
        {/* =================================================
            LOGO
        ================================================= */}

        <div className="header-logo">
          <Link to="/" className="logo-link">
            <img className="company-logo" src="/hoa-sen-logo.jpg" alt="Logo Vật tư nhà kính Hoa Sen" />

            <div className="logo-text">
              <div className="logo-title">Vật tư nhà kính Hoa Sen</div>

              <div className="logo-subtitle">{t("BrandSlogan")}</div>
            </div>
          </Link>
        </div>

        <div className="header-search-row">
          <div className="header-search">
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={t("SearchAllInfo")}
                suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: "pointer" }} />}
              />
          </div>
        </div>

        {/* =================================================
            HEADER RIGHT
        ================================================= */}

        <div className="header-right">
          {/* =================================================
              CART
          ================================================= */}

          <Link to="/cart" className="dropdown-trigger header-cart-link" aria-label={t("Cart")}>
            <Badge count={cartCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                className="header-icon-button header-cart-button"
                icon={<ShoppingCartOutlined />}
              />
            </Badge>
          </Link>

          {/* =================================================
              USER DROPDOWN
          ================================================= */}

          <Dropdown
            overlay={userMenu}
            placement="bottomRight"
            trigger={["click"]}>
            {/* QUAN TRỌNG:
                Dropdown phải có đúng 1 child
            */}

            <span className="dropdown-trigger">
              <div className="header-user">
                <Avatar
                  size={38}
                  src={user?.avatar || undefined}
                  icon={
                    !user?.avatar && !getAvatarText() ? (
                      <UserOutlined />
                    ) : undefined
                  }>
                  {!user?.avatar && getAvatarText()}
                </Avatar>

                <div className="header-user-info">
                  <span className="user-small">
                    {user ? getUserRole() : t("Account")}
                  </span>

                  <span className="user-name">{getUserName()}</span>
                </div>

                <DownOutlined className="user-arrow" />
              </div>
            </span>
          </Dropdown>

          {/* =================================================
              MOBILE BUTTON
          ================================================= */}

          <Button
            type="text"
            className="mobile-menu-button"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>

        <div className="header-navigation">
          <Menu
            className="main-menu"
            mode="horizontal"
            selectedKeys={selectedKeys}
            items={mainMenuItems}
          />
        </div>
      </header>

      {/* =================================================
          MOBILE DRAWER
      ================================================= */}

      <Drawer
        title="Menu"
        placement="left"
        visible={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={300}>
        {/* =================================================
            MOBILE SEARCH
        ================================================= */}

        <div className="mobile-search">
          <Input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={t("SearchAllInfo")}
            suffix={
              <SearchOutlined
                onClick={handleSearch}
                style={{
                  cursor: "pointer",
                }}
              />
            }
          />
        </div>

        {/* =================================================
            MOBILE ACCOUNT
        ================================================= */}

        <div className="mobile-account">
          <Avatar
            size={45}
            src={user?.avatar || undefined}
            icon={
              !user?.avatar && !getAvatarText() ? <UserOutlined /> : undefined
            }>
            {!user?.avatar && getAvatarText()}
          </Avatar>

          <div className="mobile-account-info">
            <span>{user ? getUserRole() : t("Account")}</span>

            <strong>{getUserName()}</strong>
          </div>
        </div>

        {/* =================================================
            MOBILE NAVIGATION
        ================================================= */}

        <div className="mobile-navigation">
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={mainMenuItems}
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>

        {/* =================================================
            MOBILE USER
        ================================================= */}

        <div
          style={{
            padding: "15px",
          }}>
          {user ? (
            <>
              <Button
                block
                icon={<ProfileOutlined />}
                style={{
                  marginBottom: 10,
                }}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/account");
                }}>
        {t("Profile")}
              </Button>

              <Button
                block
                icon={<ShoppingCartOutlined />}
                style={{
                  marginBottom: 10,
                }}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/orders");
                }}>
                {t("MyOrders")}
              </Button>

              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}>
                {t("Logout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                block
                icon={<LoginOutlined />}
                style={{
                  marginBottom: 10,
                }}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/login");
                }}>
                {t("Login")}
              </Button>

              <Button
                block
                icon={<UserAddOutlined />}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/register");
                }}>
                {t("Register")}
              </Button>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default HeaderPage;
