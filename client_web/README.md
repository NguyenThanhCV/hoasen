# Nova Shop Frontend

Frontend storefront React kết nối với `shop-backend-access-refresh-variant-fixed`.

## Công nghệ

- React 18 + Create React App
- React Router DOM
- Axios
- Access Token + Refresh Token
- API backend Node.js/Express/MongoDB

## Chạy local

```bash
npm install --legacy-peer-deps
cp .env.example .env
npm start
```

Mặc định frontend gọi backend test tại `http://localhost:5000/api`.
Có thể đổi bằng biến môi trường:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Backend cần chạy trước và MongoDB phải hoạt động.

## Các luồng đã tích hợp

- Đăng ký, đăng nhập, đăng xuất
- Tự động refresh access token khi API trả về 401
- Trang chủ và sản phẩm nổi bật
- Danh sách sản phẩm với tìm kiếm, lọc danh mục/thương hiệu
- Chi tiết sản phẩm, biến thể, tồn kho, đánh giá
- Giỏ hàng: thêm, tăng/giảm số lượng, xóa sản phẩm
- Checkout: chọn/tạo địa chỉ, COD hoặc chuyển khoản
- Tạo đơn hàng và xem danh sách/chi tiết đơn hàng
- Cập nhật thông tin tài khoản

## API được sử dụng

`/auth`, `/products`, `/variants`, `/categories`, `/brands`, `/reviews`, `/cart`, `/addresses`, `/orders`.

## Build production

```bash
npm run build
```

Build đã được kiểm tra thành công. Một số cảnh báo autoprefixer/browserslist đến từ dependency cũ của Create React App, không làm thất bại build.
