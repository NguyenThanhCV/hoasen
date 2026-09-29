# API backend dùng cho frontend

Base URL mặc định: `http://localhost:5000/api` (đổi bằng `REACT_APP_API_URL`). Axios client tự gắn `Authorization: Bearer <accessToken>` và tự refresh khi nhận `401`.

## Public API

| Nhóm | Method | Endpoint | Mục đích |
|---|---:|---|---|
| Auth | POST | `/auth/register` | Đăng ký |
| Auth | POST | `/auth/login` | Đăng nhập |
| Auth | POST | `/auth/refresh` | Cấp access token mới |
| Catalog | GET | `/products` | Danh sách, tìm kiếm, lọc, phân trang |
| Catalog | GET | `/products/:id` | Chi tiết sản phẩm |
| Catalog | GET | `/variants?product=:id&active=true` | Biến thể và tồn kho |
| Catalog | GET | `/categories` | Danh mục |
| Catalog | GET | `/categories/:id` | Chi tiết danh mục |
| Catalog | GET | `/brands` | Thương hiệu |
| Catalog | GET | `/brands/:id` | Chi tiết thương hiệu |
| Review | GET | `/reviews/product/:productId` | Đánh giá công khai |

## API yêu cầu đăng nhập

| Nhóm | Method | Endpoint | Payload chính |
|---|---:|---|---|
| Auth | GET/PATCH | `/auth/me` | Hồ sơ người dùng |
| Auth | PATCH | `/auth/change-password` | `currentPassword, newPassword` |
| Cart | GET | `/cart` | Lấy giỏ hàng |
| Cart | POST | `/cart/items` | `{ product, variant, quantity }` |
| Cart | PATCH | `/cart/items/:itemId` | `{ quantity }` |
| Cart | DELETE | `/cart/items/:itemId` | Xóa một dòng |
| Cart | DELETE | `/cart/clear` | Xóa toàn bộ giỏ |
| Address | GET/POST | `/addresses` | Địa chỉ giao hàng |
| Address | PATCH/DELETE | `/addresses/:id` | Sửa/xóa địa chỉ |
| Order | GET | `/orders?page=1&limit=20` | Danh sách đơn |
| Order | POST | `/orders` | `{ addressId, paymentMethod, note, couponCode }` |
| Order | GET | `/orders/:id` | Chi tiết đơn + items |
| Order | PATCH | `/orders/:id/cancel` | Hủy đơn pending/confirmed |
| Wishlist | GET | `/wishlist` | Lấy sản phẩm yêu thích |
| Wishlist | POST | `/wishlist/products` | `{ product }` |
| Wishlist | DELETE | `/wishlist/products/:productId` | Bỏ yêu thích |
| Notification | GET | `/notifications` | Danh sách thông báo |
| Notification | PATCH | `/notifications/:id/read` | Đánh dấu đã đọc |
| Notification | POST | `/notifications/read-all` | Đọc tất cả |
| Review | POST/PATCH/DELETE | `/reviews` hoặc `/reviews/:id` | Tạo/sửa/xóa đánh giá |
| Payment | POST | `/payments` | `{ order, amount, provider, currency }` |

## Luồng mua hàng chuẩn

1. Người dùng đăng nhập.
2. Lấy biến thể từ `GET /variants?product=<id>&active=true`.
3. Thêm hàng bằng `POST /cart/items`.
4. Hiển thị và cập nhật giỏ bằng `GET/PATCH/DELETE /cart`.
5. Tạo hoặc chọn địa chỉ bằng `/addresses`.
6. Đặt hàng bằng `POST /orders`; backend tự kiểm tra tồn kho, coupon, tính tổng tiền và xóa giỏ.
7. Hiển thị đơn bằng `GET /orders` và `GET /orders/:id`.
8. Hủy đơn bằng `PATCH /orders/:id/cancel` khi trạng thái còn `pending` hoặc `confirmed`.

> Các endpoint quản trị (`/admin`, CRUD user/product/order/payment...) yêu cầu permission tương ứng và không nên gọi từ storefront thông thường.
