# Infrastructure - CRM mini quản lý lead

## Mục tiêu

Tài liệu này mô tả cách hệ thống CRM mini được chạy ở môi trường local, staging và production. Nội dung dưới đây là bản nháp để chỉnh lại theo stack thực tế của dự án.

## Thành phần triển khai

Hệ thống có thể gồm các thành phần sau:

- Laravel web app: ứng dụng chính, route khai báo trong `routes/web.php`.
- ReactJS trong source Laravel: giao diện cho admin, marketer, sales và public form, đặt trong `resources/js` và build bằng Vite.
- Controller/service Laravel: xử lý đăng nhập, phân quyền, campaign, lead, assignment và báo cáo.
- Database: lưu user, campaign, lead, lịch sử xử lý lead.
- Real time xử lý thay đổi trạng thái của lead nếu dự án có nhu cầu.

## Môi trường local

Môi trường local dùng cho developer chạy và kiểm thử tính năng.

Thông tin cần bổ sung theo dự án:

- Runtime: PHP-Laravel.
- Frontend runtime: ReactJS build trong Laravel bằng Vite.
- Database local: MySQL local.
- Lệnh cài đặt dependency: composer install.
- Lệnh cài đặt dependency frontend: npm install.
- Lệnh chạy migration: php artisan migrate.
- Lệnh chạy app: php artisan serve.
- Lệnh build/chạy React asset: npm run dev.
- Tài khoản seed mặc định cho admin, marketer và sales:
  - admin: admin@admin 123123
  - marketer: marketer@marketer 123123
  - sales: sales@sales 123123

## Môi trường staging -> chưa cần bây giờ

Staging dùng để kiểm thử gần giống production trước khi release.

Gợi ý cấu hình:

- Dùng database riêng, không dùng chung database production.
- Bật logging đầy đủ hơn production để debug.
- Có dữ liệu mẫu hoặc dữ liệu đã ẩn thông tin nhạy cảm.
- Chỉ cho team nội bộ truy cập.
- Dùng biến môi trường riêng cho staging.

## Môi trường production - chưa cần bây giờ

Production là môi trường chạy thật cho team marketing và sales.

Gợi ý cấu hình:

- HTTPS bắt buộc.
- Database có backup định kỳ.
- Secret và credential lưu trong biến môi trường hoặc secret manager.
- Không bật debug mode.
- Có monitoring cho lỗi backend, tình trạng database và thời gian phản hồi API.
- Có cơ chế rollback khi deploy lỗi.

## Biến môi trường

Các biến môi trường cần có thể gồm:

| Biến                        | Mô tả                                           |
| --------------------------- | ----------------------------------------------- |
| APP_ENV                     | Môi trường chạy app: local, staging, production |
| APP_URL                     | URL Laravel app                                 |
| DATABASE_URL                | Chuỗi kết nối database                          |
| APP_KEY                     | Laravel app key dùng cho session/encryption     |
| SESSION_DRIVER              | Driver lưu session                              |
| VITE_*                      | Biến môi trường frontend dùng bởi Vite nếu có   |
| STORAGE\_\*                 | Cấu hình lưu file nếu có                        |
| MAIL\_\*                    | Cấu hình gửi email nếu có                       |

## CI/CD gợi ý - github actions

Pipeline triển khai nên có các bước:

1. Checkout source code.
2. Cài dependencies.
3. Chạy lint hoặc format check.
4. Chạy test nếu có.
5. Build React asset bằng Vite nếu deploy production.
6. Chạy migration database nếu release cần thay đổi schema.
7. Deploy lên môi trường tương ứng.
8. Kiểm tra health check sau deploy.

## Backup và khôi phục- chưa

- Database cần được backup định kỳ, tối thiểu mỗi ngày nếu có dữ liệu thật.
- Cần lưu lại ít nhất một vài bản backup gần nhất để phục hồi khi thao tác nhầm.
- Nên kiểm thử quy trình restore trước khi dùng production thật.

## Health check

Laravel app nên có endpoint health check, ví dụ khai báo trong `routes/web.php`:

```http
GET /health
```

Response gợi ý:

```json
{
  "status": "ok",
  "database": "ok"
}
```
