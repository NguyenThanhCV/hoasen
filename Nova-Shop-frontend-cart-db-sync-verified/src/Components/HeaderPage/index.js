import React, { useEffect, useState } from "react";

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
  GlobalOutlined,
  DownOutlined,
  LogoutOutlined,
  ProfileOutlined,
  HeartOutlined,
  LoginOutlined,
  UserAddOutlined,
  BellOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";

import { asyncLogoutAction } from "../../PagesClient/Logout/stores/actions";

import "./index.css";
import { getCart } from "../../api/shop";

const HeaderPage = () => {
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
      navigate("/products");

      setMobileMenuOpen(false);

      return;
    }

    navigate(`/products?search=${encodeURIComponent(keyword)}`);

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
      return "Tài khoản";
    }

    return user.name || user.email || "Tài khoản";
  };

  // =====================================================
  // USER ROLE
  // =====================================================

  const getUserRole = () => {
    if (!user) {
      return "";
    }

    if (user.role === "admin") {
      return "Quản trị viên";
    }

    return "Khách hàng";
  };

  // =====================================================
  // AVATAR TEXT
  // =====================================================

  const getAvatarText = () => {
    const name = getUserName();

    if (!name || name === "Tài khoản") {
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
      message: "Đăng xuất thành công",

      description: "Bạn đã đăng xuất khỏi tài khoản.",
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
        Thông tin tài khoản
      </Menu.Item>

      <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
        Đơn hàng của tôi
      </Menu.Item>

      <Menu.Item key="wishlist" icon={<HeartOutlined />}>
        Sản phẩm yêu thích
      </Menu.Item>

      <Menu.Item key="notifications" icon={<BellOutlined />}>
        Thông báo
      </Menu.Item>
      <Menu.Item key="addresses" icon={<EnvironmentOutlined />}>
        Địa chỉ nhận hàng
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Đăng xuất
      </Menu.Item>
    </Menu>
  ) : (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key="login" icon={<LoginOutlined />}>
        Đăng nhập
      </Menu.Item>

      <Menu.Item key="register" icon={<UserAddOutlined />}>
        Đăng ký
      </Menu.Item>
    </Menu>
  );

  // =====================================================
  // LANGUAGE MENU
  // =====================================================

  const languageMenu = (
    <Menu>
      <Menu.Item key="vi">Tiếng Việt</Menu.Item>

      <Menu.Item key="en">English</Menu.Item>
    </Menu>
  );

  // =====================================================
  // PRODUCT MENU
  // =====================================================

  const productMenu = (
    <Menu>
      <Menu.Item key="all-products">
        <Link to="/products">Tất cả sản phẩm</Link>
      </Menu.Item>

      <Menu.Item key="categories">
        <Link to="/categories">Danh mục</Link>
      </Menu.Item>

      <Menu.Item key="brands">
        <Link to="/brands">Thương hiệu</Link>
      </Menu.Item>
    </Menu>
  );

  // =====================================================
  // MAIN MENU
  // =====================================================

  const mainMenuItems = [
    {
      key: "home",

      label: <Link to="/">Trang chủ</Link>,
    },

    {
      key: "products",

      label: "Sản phẩm",

      children: [
        {
          key: "all-products",

          label: <Link to="/products">Tất cả sản phẩm</Link>,
        },

        {
          key: "categories",

          label: <Link to="/categories">Danh mục</Link>,
        },

        {
          key: "brands",

          label: <Link to="/brands">Thương hiệu</Link>,
        },
      ],
    },

    {
      key: "about",

      label: <Link to="/about">Giới thiệu</Link>,
    },

    {
      key: "news",

      label: <Link to="/news">Tin tức</Link>,
    },

    {
      key: "contact",

      label: <Link to="/contact">Liên hệ</Link>,
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

              <div className="logo-subtitle">
                GIẢI PHÁP NÔNG NGHIỆP HIỆN ĐẠI
              </div>
            </div>
          </Link>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="header-navigation">
          <Menu
            className="main-menu"
            mode="horizontal"
            selectedKeys={selectedKeys}
            items={mainMenuItems}
          />
        </div>

        {/* =================================================
            HEADER RIGHT
        ================================================= */}

        <div className="header-right">
          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="header-search">
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm kiếm sản phẩm..."
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
              LANGUAGE
          ================================================= */}

          <Dropdown
            overlay={languageMenu}
            placement="bottomRight"
            trigger={["click"]}>
            <span className="dropdown-trigger">
              <Button
                type="text"
                className="header-icon-button language-button"
                icon={<GlobalOutlined />}
              />
            </span>
          </Dropdown>

          {/* =================================================
              CART
          ================================================= */}

          <Link to="/cart" className="dropdown-trigger">
            <Badge count={cartCount} size="small" offset={[-2, 2]}>
              <Button
                type="text"
                className="header-icon-button"
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
                    {user ? getUserRole() : "Tài khoản"}
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
            placeholder="Tìm kiếm sản phẩm..."
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
            <span>{user ? getUserRole() : "Tài khoản"}</span>

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
                Thông tin tài khoản
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
                Đơn hàng của tôi
              </Button>

              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}>
                Đăng xuất
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
                Đăng nhập
              </Button>

              <Button
                block
                icon={<UserAddOutlined />}
                onClick={() => {
                  setMobileMenuOpen(false);

                  navigate("/register");
                }}>
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default HeaderPage;
