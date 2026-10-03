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

- Cửa hàng: http://localhost:3100
- Quản trị: http://localhost:3101
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
