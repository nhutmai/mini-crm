# Implementation Plan - CRM mini Laravel + React

## Mục tiêu

File này dùng để chia việc giữa người viết dự án và Codex trong quá trình triển khai CRM mini. Dự án dùng PHP Laravel, route chính trong `routes/web.php`, ReactJS đặt trực tiếp trong source Laravel, render qua Inertia.js và build bằng Vite.

Nguyên tắc làm việc:

- Codex sẽ viết boilerplate, cấu trúc thư mục, migration/model/controller/resource route cơ bản và UI khung.
- Người viết dự án sẽ viết core nghiệp vụ, điều chỉnh logic theo yêu cầu thật và hoàn thiện các rule chi tiết.
- Mỗi bước nên chạy được trước khi chuyển sang bước tiếp theo.
- Ưu tiên code đơn giản, dễ đọc, đúng scope mini CRM.

## Phân chia trách nhiệm

| Hạng mục                | Codex làm                                       | Người viết dự án làm                                 |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| Cài đặt Laravel + React | Tạo/sửa boilerplate, cấu hình Vite, mount React | Kiểm tra chạy local                                  |
| Database                | Tạo migration, model, relationship cơ bản       | Chỉnh field theo yêu cầu thật                        |
| Auth                    | Tạo route/controller/middleware khung           | Chốt rule đăng nhập, role, seed user                 |
| Campaign                | CRUD boilerplate                                | Viết rule campaign, validate chi tiết                |
| Lead                    | CRUD boilerplate, filter cơ bản                 | Viết core xử lý lead, trạng thái, rule trùng dữ liệu |
| Assign lead             | Tạo route/controller/action khung               | Chốt ai được assign, khi nào đổi trạng thái          |
| Activity/note           | Tạo model, migration, route cơ bản              | Chốt loại activity và nội dung lưu                   |
| Dashboard/report        | Tạo query/report cơ bản                         | Chỉnh công thức, số liệu cần hiển thị                |
| React UI                | Tạo layout, page, form, table cơ bản            | Chỉnh flow, text, style và trải nghiệm dùng thật     |
| Test                    | Tạo test mẫu nếu cần                            | Bổ sung case nghiệp vụ quan trọng                    |

## [x] Phase 1 - Chuẩn bị project

### Codex sẽ làm

- [x] Kiểm tra project Laravel hiện tại đã có chưa.
- [x] Nếu chưa có, tạo skeleton Laravel phù hợp.
- [x] Cấu hình ReactJS trong Laravel bằng Vite.
- [x] Tạo entry Blade tối thiểu để mount React.
- [x] Tạo cấu trúc thư mục React gợi ý:
    - [x] `resources/js/App.jsx`
    - [x] `resources/js/pages`
    - [x] `resources/js/components`
    - [x] `resources/js/lib`
    - [x] `resources/js/layouts`
- [x] Cấu hình route fallback hoặc route web để render React app.

### Người viết dự án sẽ làm

- [x] Chạy thử:

```bash
composer install
npm install
php artisan migrate
php artisan serve
npm run dev
```

- [x] Xác nhận app mở được trên local.
- [x] Chỉnh tên app, database `.env` và thông tin môi trường local.

## [x] Phase 2 - Database và model

### Codex sẽ làm

- [x] Tạo migration cơ bản cho:
    - [x] `users`
    - [x] `campaigns`
    - [x] `leads`
    - [x] `lead_activities`
    - [x] Không tạo `lead_assignments` trong MVP; dùng `lead_activities` để lưu lịch sử assign
- [x] Tạo Eloquent model và relationship:
    - [x] `User hasMany Campaign`
    - [x] `Campaign belongsTo User`
    - [x] `Campaign hasMany Lead`
    - [x] `Lead belongsTo Campaign`
    - [x] `Lead belongsTo User as assignedSales`
    - [x] `Lead hasMany LeadActivity`
- [x] Tạo seeder tài khoản mẫu:
    - [x] admin
    - [x] marketer
    - [x] sales

Ghi chú Phase 2: chưa tạo bảng `lead_assignments` riêng vì MVP đang lưu sales hiện tại ở `leads.assigned_to` và lịch sử giao lead trong `lead_activities` với type `assignment`. Nếu về sau cần báo cáo assignment chuyên sâu, có thể tách bảng riêng ở phase nâng cấp.

### Người viết dự án sẽ làm

- [ ] Chốt field nào bắt buộc, field nào nullable.
- [ ] Chỉnh enum/status theo cách muốn dùng thật.
- [ ] Quyết định có dùng soft delete không.
- [ ] Quyết định có cần chống trùng lead theo phone/email không.

## [ ] Phase 3 - Auth và phân quyền

### Codex sẽ làm

- [ ] Tạo route trong `routes/web.php` cho login, logout, lấy user hiện tại.
- [ ] Tạo controller auth cơ bản.
- [ ] Tạo middleware hoặc helper kiểm tra role.
- [ ] Tạo policy/gate mẫu nếu cần.
- [ ] Tạo React page login cơ bản.

### Người viết dự án sẽ làm

- [ ] Chốt rule:
    - [ ] Admin được làm gì.
    - [ ] Marketer được làm gì.
    - [ ] Sales được làm gì.
- [ ] Chỉnh redirect sau login.
- [ ] Chỉnh thông báo lỗi đăng nhập.

## [ ] Phase 4 - Campaign module

### Codex sẽ làm

- [ ] Tạo `CampaignController`.
- [ ] Tạo route resource trong `web.php`.
- [ ] Tạo request validation cơ bản nếu cần.
- [ ] Tạo React page:
    - [ ] danh sách campaign
    - [ ] tạo campaign
    - [ ] sửa campaign
    - [ ] xem chi tiết campaign

### Người viết dự án sẽ làm

- [ ] Viết rule campaign thật:
    - [ ] marketer chỉ thấy campaign của mình.
    - [ ] admin thấy tất cả.
    - [ ] trạng thái campaign được chuyển như thế nào.
- [ ] Chỉnh form field đúng yêu cầu.

## [ ] Phase 5 - Lead module

### Codex sẽ làm

- [ ] Tạo `LeadController`.
- [ ] Tạo route trong `web.php`.
- [ ] Tạo danh sách lead có phân trang và filter cơ bản.
- [ ] Tạo form tạo/sửa lead.
- [ ] Tạo public form gửi lead.
- [ ] Tạo React page:
    - [ ] danh sách lead
    - [ ] chi tiết lead
    - [ ] form public lead

### Người viết dự án sẽ làm

- [ ] Viết core xử lý lead:
    - [ ] validate phone/email.
    - [ ] chống trùng lead nếu cần.
    - [ ] tự gắn campaign/source.
    - [ ] trạng thái ban đầu của lead.
    - [ ] rule marketer/sales xem lead.

## [ ] Phase 6 - Assign lead và cập nhật trạng thái

### Codex sẽ làm

- [ ] Tạo route:
    - [ ] `PATCH /leads/{lead}/assign`
    - [ ] `PATCH /leads/{lead}/status`
- [ ] Tạo controller/action khung.
- [ ] Tạo UI chọn sales để assign lead.
- [ ] Tạo UI sales cập nhật trạng thái lead và ghi chú.

### Người viết dự án sẽ làm

- [ ] Chốt core rule:
    - [ ] ai được assign lead.
    - [ ] lead đã converted/lost có được assign lại không.
    - [ ] assign có tự đổi status sang `assigned` không.
    - [ ] sales được đổi sang những trạng thái nào.

## [ ] Phase 7 - Lead activity và lịch sử xử lý

### Codex sẽ làm

- [ ] Tạo route lấy và thêm activity.
- [ ] Tạo UI timeline/notes cơ bản trong trang chi tiết lead.
- [ ] Khi assign hoặc đổi status, tạo activity mẫu.

### Người viết dự án sẽ làm

- [ ] Chốt loại activity:
    - [ ] note
    - [ ] call
    - [ ] status_change
    - [ ] assignment
    - [ ] meeting
- [ ] Chốt nội dung nào cần lưu để truy vết.

## [ ] Phase 8 - Dashboard/report

### Codex sẽ làm

- [ ] Tạo `ReportController`.
- [ ] Tạo query tổng quan:
    - [ ] tổng lead
    - [ ] lead mới
    - [ ] lead đã chuyển đổi
    - [ ] lead theo status
    - [ ] lead theo campaign
- [ ] Tạo React dashboard cơ bản.

### Người viết dự án sẽ làm

- [ ] Chỉnh công thức report.
- [ ] Chốt số liệu quan trọng nhất cho admin/marketer/sales.
- [ ] Chỉnh UI dashboard theo nhu cầu trình bày.

## [ ] Phase 9 - Hoàn thiện UI và trải nghiệm

### Codex sẽ làm

- [ ] Tạo layout chung:
    - [ ] sidebar/nav
    - [ ] header
    - [ ] loading state
    - [ ] empty state
    - [ ] error state
- [ ] Tạo component dùng lại:
    - [ ] table
    - [ ] form input
    - [ ] status badge
    - [ ] modal confirm
    - [ ] pagination

### Người viết dự án sẽ làm

- [ ] Chỉnh text tiếng Việt cho đúng ngữ cảnh.
- [ ] Chỉnh màu sắc, spacing, flow thao tác.
- [ ] Kiểm tra từng role dùng có hợp lý không.

## [ ] Phase 10 - Kiểm thử và bàn giao

### Codex sẽ làm

- [ ] Chạy lệnh kiểm tra có sẵn trong project.
- [ ] Tạo test mẫu cho route/model nếu project cần.
- [ ] Sửa lỗi boilerplate phát sinh.
- [ ] Ghi lại hướng dẫn chạy project.

### Người viết dự án sẽ làm

- [ ] Test luồng nghiệp vụ chính:
    - [ ] Admin đăng nhập.
    - [ ] Marketer tạo campaign.
    - [ ] Lead được gửi từ public form.
    - [ ] Admin hoặc marketer assign lead cho sales.
    - [ ] Sales cập nhật trạng thái và ghi chú.
    - [ ] Admin xem dashboard.
- [ ] Chỉnh logic cuối cùng theo yêu cầu thật.

## Checklist MVP

- [ ] Laravel chạy được local.
- [ ] React mount được trong Laravel.
- [ ] Có login/logout.
- [ ] Có role admin, marketer, sales.
- [ ] Có seed user mẫu.
- [ ] Có CRUD campaign.
- [ ] Có tạo lead thủ công.
- [ ] Có public form tạo lead.
- [ ] Có danh sách lead theo role.
- [ ] Có assign lead cho sales.
- [ ] Có sales cập nhật trạng thái lead.
- [ ] Có ghi chú/lịch sử xử lý lead.
- [ ] Có dashboard cơ bản.
- [ ] Có hướng dẫn chạy project.

## Thứ tự yêu cầu Codex làm boilerplate

Khi bắt đầu triển khai, nên yêu cầu Codex theo thứ tự:

1. Dựng Laravel + React boilerplate trong source Laravel.
2. Tạo migration/model/seeder cho CRM mini.
3. Tạo auth + role middleware cơ bản.
4. Tạo campaign module boilerplate.
5. Tạo lead module boilerplate.
6. Tạo assign/status/activity boilerplate.
7. Tạo dashboard/report boilerplate.
8. Tạo UI layout và component dùng chung.

## Ghi chú quan trọng

- Không dùng frontend tách riêng bên ngoài project Laravel.
- Không ưu tiên `routes/api.php` trong giai đoạn này.
- Không cần JWT nếu dùng session auth của Laravel.
- Route xử lý chính đặt trong `routes/web.php`.
- React chỉ là phần giao diện trong Laravel, không phải app độc lập.
- Core nghiệp vụ do người viết dự án hoàn thiện sau khi có boilerplate.
