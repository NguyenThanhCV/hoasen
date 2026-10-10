export const adminNavigation = [
  { title: "TỔNG QUAN", links: [["Dashboard", "/admin"]] },
  {
    title: "BÁN HÀNG",
    links: [
      ["Sản phẩm", "/admin/products"],
      ["Danh mục", "/admin/categories"],
      ["Khuyến mãi", "/admin/promotions"],
      ["Thương hiệu", "/admin/brands"],
      ["Đơn hàng", "/admin/orders"],
      ["Chi tiết đơn", "/admin/order-items"],
      ["Thanh toán", "/admin/payments"],
      ["Đánh giá", "/admin/reviews"],
      ["Mã giảm giá", "/admin/coupons"],
    ],
  },
  {
    title: "NỘI DUNG",
    links: [
      ["Banner", "/admin/banners"],
      ["Tin tức", "/admin/news"],
    ],
  },
  {
    title: "KHÁCH HÀNG",
    links: [
      ["Người dùng", "/admin/users"],
      ["Địa chỉ giao hàng", "/admin/addresses"],
    ],
  },
  {
    title: "DỮ LIỆU",
    links: [
      ["Giỏ hàng khách", "/admin/carts"],
      ["Sản phẩm yêu thích", "/admin/wishlists"],
      ["Thông báo hệ thống", "/admin/notifications"],
      ["Nội dung & hình ảnh frontend", "/admin/data/products"],
    ],
  },
];
