# Chạy toàn bộ dự án bằng Docker

Docker Compose khởi chạy MongoDB, API, website cửa hàng và trang quản trị.

## Chuẩn bị

1. Cài Docker Desktop và mở Docker Desktop.
2. Tại thư mục gốc `hoasen`, sao chép `.env.docker.example` thành `.env`.
3. Đổi `JWT_SECRET` và `ADMIN_SETUP_KEY` thành giá trị riêng trước khi chạy.

```powershell
Copy-Item .env.docker.example .env
```

## Khởi chạy

```powershell
docker compose --env-file .env up --build -d
```

- Cửa hàng: http://localhost:13200
- Quản trị: http://localhost:13201
- API: http://localhost:5000/api

Xem trạng thái và log:

```powershell
docker compose --env-file .env ps
docker compose --env-file .env logs -f api
```

Dừng các container nhưng giữ dữ liệu MongoDB:

```powershell
docker compose --env-file .env down
```

Muốn xóa cả dữ liệu MongoDB đã lưu:

```powershell
docker compose --env-file .env down -v
```

Các cổng có thể đổi trong `.env` bằng `CLIENT_PORT`, `ADMIN_PORT` và `API_PORT`. Nếu đổi cổng frontend, cập nhật thêm `CLIENT_ORIGIN`, `ADMIN_ORIGIN` và `PUBLIC_SITE_URL` tương ứng. Hai frontend dùng proxy `/api` trong Nginx để gọi API nội bộ trong mạng Docker.

## Gắn domain và bật HTTPS

Trong trang quản lý DNS của nhà cung cấp domain, tạo các bản ghi A trỏ về IP public của máy chủ:

| Host | Loại | Giá trị |
| --- | --- | --- |
| `@` | A | IP public của máy chủ |
| `www` | A | IP public của máy chủ |
| `admin` | A | IP public của máy chủ |

Trong router/firewall, chuyển tiếp TCP port `80` và `443` tới máy chạy Docker. Caddy dùng các cổng này để nhận HTTPS và tự xin/gia hạn chứng chỉ. Caddy được bật bằng profile `domain`, sau khi DNS đã trỏ tới máy chủ.

Đặt các giá trị tương ứng trong file `.env` ở thư mục gốc:

```env
DOMAIN=minserver.click
CLIENT_ORIGIN=https://minserver.click
ADMIN_ORIGIN=https://admin.minserver.click
PUBLIC_SITE_URL=https://minserver.click
EXTRA_CORS_ORIGINS=https://www.minserver.click,http://localhost:13200,http://localhost:13201
```

Sau đó chạy lại stack với profile HTTPS:

```powershell
docker compose --env-file .env --profile domain up --build -d
```

Website sẽ ở `https://minserver.click` và `https://www.minserver.click`, trang quản trị ở `https://admin.minserver.click`; API tiếp tục được gọi qua `/api`.
