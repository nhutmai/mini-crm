# Route Design - CRM mini quản lý lead

## Mục tiêu

Tài liệu này mô tả hợp đồng route/controller cho hệ thống CRM mini. Dự án dùng PHP Laravel, khai báo route trong `routes/web.php` và dùng ReactJS trực tiếp trong source Laravel. Vì vậy các route dưới đây nên hiểu là web routes dùng session, middleware `auth`, CSRF và controller Laravel, không phải API tách riêng trong `routes/api.php`.

## Quy ước chung

- Route khai báo trong `routes/web.php`.
- Các request từ React có thể nhận JSON response để cập nhật UI không cần reload trang.
- Các route quản trị cần đăng nhập, trừ public form.
- Laravel controller/middleware/policy phải kiểm tra quyền theo role ở mọi endpoint cần bảo vệ.
- Các request `POST`, `PATCH`, `PUT`, `DELETE` cần gửi CSRF token.
- Danh sách dữ liệu nên hỗ trợ phân trang qua `page` và `limit`.
- Các lỗi nên có format thống nhất.

Response lỗi gợi ý:

```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email không hợp lệ"]
  }
}
```

## Auth routes

### POST /login

Đăng nhập cho admin, marketer và sales.

Request:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Response:

```json
{
  "user": {
    "id": "1",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Ghi chú: nếu dùng Laravel session auth thì server sẽ lưu session bằng cookie, không cần trả JWT token.

### GET /me

Lấy thông tin người dùng hiện tại.

## Campaign routes

### GET /campaigns

Lấy danh sách campaign.

Query gợi ý:

- `page`
- `limit`
- `status`
- `source`
- `owner_id`

Quyền:

- Admin xem tất cả campaign.
- Marketer xem campaign của mình.
- Sales có thể chỉ xem campaign liên quan tới lead được giao nếu cần.

### POST /campaigns

Tạo campaign mới.

Request:

```json
{
  "name": "Facebook Ads tháng 6",
  "source": "facebook_ads",
  "description": "Chiến dịch thu lead từ Facebook",
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "status": "active"
}
```

### GET /campaigns/{id}

Lấy chi tiết campaign và số liệu cơ bản.

### PATCH /campaigns/{id}

Cập nhật campaign.

### DELETE /campaigns/{id}

Xóa campaign hoặc chuyển sang trạng thái không hoạt động. Khi đã có lead, nên cân nhắc soft delete thay vì xóa cứng.

## Lead routes

### GET /leads

Lấy danh sách lead theo quyền người dùng hiện tại.

Query gợi ý:

- `page`
- `limit`
- `campaign_id`
- `assigned_to`
- `status`
- `source`
- `keyword`
- `from_date`
- `to_date`

Quyền:

- Admin xem tất cả lead.
- Marketer xem lead thuộc campaign của mình.
- Sales xem lead được giao cho mình.

### POST /leads

Tạo lead thủ công trong trang quản trị.

Request:

```json
{
  "campaign_id": "10",
  "full_name": "Nguyen Van A",
  "phone": "0900000000",
  "email": "a@example.com",
  "need": "Muốn được tư vấn dịch vụ",
  "source": "manual"
}
```

### POST /public/leads

Tạo lead từ form public. Endpoint này không yêu cầu đăng nhập nhưng cần validate kỹ dữ liệu đầu vào.

Request:

```json
{
  "campaign_id": "10",
  "full_name": "Nguyen Van A",
  "phone": "0900000000",
  "email": "a@example.com",
  "need": "Tôi muốn nhận tư vấn",
  "source": "landing_page"
}
```

### GET /leads/{id}

Lấy chi tiết lead, bao gồm thông tin campaign, sales phụ trách và lịch sử hoạt động.

### PATCH /leads/{id}

Cập nhật thông tin lead.

### PATCH /leads/{id}/assign

Giao lead cho sales.

Request:

```json
{
  "sales_id": "5"
}
```

### PATCH /leads/{id}/status

Sales cập nhật trạng thái xử lý lead.

Request:

```json
{
  "status": "qualified",
  "note": "Khách quan tâm, hẹn gọi lại vào ngày mai"
}
```

## Lead Activity routes

### GET /leads/{id}/activities

Lấy lịch sử xử lý của một lead.

### POST /leads/{id}/activities

Thêm ghi chú hoặc hoạt động chăm sóc lead.

Request:

```json
{
  "type": "note",
  "content": "Đã gọi lần 1 nhưng khách chưa nghe máy"
}
```

## Report routes

### GET /reports/overview

Lấy số liệu tổng quan cho dashboard.

Response gợi ý:

```json
{
  "total_leads": 120,
  "new_leads": 25,
  "converted_leads": 18,
  "conversion_rate": 15,
  "by_status": [
    { "status": "new", "count": 25 },
    { "status": "contacted", "count": 40 },
    { "status": "converted", "count": 18 }
  ]
}
```

### GET /reports/campaigns

Lấy hiệu quả theo campaign.

### GET /reports/sales

Lấy hiệu quả xử lý theo sales.

## User routes

### GET /users

Admin lấy danh sách người dùng. Có thể dùng để chọn sales khi assign lead.

### GET /users/sales

Lấy danh sách sales đang active để giao lead.

## Route group gợi ý trong Laravel

```php
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/public/leads', [PublicLeadController::class, 'store'])->name('public.leads.store');

Route::middleware(['auth'])->group(function () {
    Route::get('/me', [AuthController::class, 'me'])->name('me');

    Route::resource('campaigns', CampaignController::class);
    Route::resource('leads', LeadController::class);

    Route::patch('/leads/{lead}/assign', [LeadAssignmentController::class, 'update'])->name('leads.assign');
    Route::patch('/leads/{lead}/status', [LeadStatusController::class, 'update'])->name('leads.status');
    Route::get('/leads/{lead}/activities', [LeadActivityController::class, 'index'])->name('leads.activities.index');
    Route::post('/leads/{lead}/activities', [LeadActivityController::class, 'store'])->name('leads.activities.store');

    Route::get('/reports/overview', [ReportController::class, 'overview'])->name('reports.overview');
    Route::get('/reports/campaigns', [ReportController::class, 'campaigns'])->name('reports.campaigns');
    Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/sales', [UserController::class, 'sales'])->name('users.sales');
});
```
