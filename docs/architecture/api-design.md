# Route Design - CRM mini quản lý lead

## Mục tiêu

Tài liệu này mô tả hợp đồng route/controller cho hệ thống CRM mini. Dự án dùng PHP Laravel, khai báo route trong `routes/web.php` và dùng ReactJS qua Inertia.js trực tiếp trong source Laravel. Vì vậy các route dưới đây nên hiểu là web routes dùng session, middleware `auth`, CSRF, Inertia responses và controller Laravel, không phải API tách riêng trong `routes/api.php`.

## Quy ước chung

- Route khai báo trong `routes/web.php`.
- Page routes trả về `Inertia::render(...)` với props cho React page.
- Page-level form actions dùng redirect back hoặc named redirect để Inertia refresh props.
- Chỉ giữ JSON response cho data-only endpoint, ví dụ autocomplete, live search, upload progress hoặc user probe.
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

### GET /teams

Trang danh sách team nội bộ. Route trả về Inertia page `TeamList`.

Query gợi ý:

- `page`
- `limit`
- `keyword`

Quyền:

- Admin xem toàn bộ team.
- Lead xem team mình đang phụ trách.
- Member thường có thể xem team mình thuộc nếu cần hiển thị thông tin nội bộ.

### POST /teams

Admin tạo team mới. Lead là optional nhưng không gán ngay nếu chưa có member trong team.

Request:

```json
{
    "name": "Sales North",
    "description": "Team phụ trách lead khu vực phía Bắc"
}
```

Quyền:

- Chỉ Admin được tạo team.

### GET /teams/{team}

Trang chi tiết team. Route trả về Inertia page `TeamDetail`, gồm thông tin Lead hiện tại, members và options phục vụ form.

Quyền:

- Admin xem mọi team.
- Lead xem team mình phụ trách.
- Member thường xem team mình thuộc nếu cần.

### DELETE /teams/{team}

Admin xóa team. Khi xóa team, các user thuộc team này phải được set `team_id = null`.

Quyền:

- Chỉ Admin.

### PATCH /teams/{team}/lead

Admin gán hoặc gỡ Lead của team.

Request gán Lead:

```json
{
    "lead_id": "5"
}
```

Request gỡ Lead:

```json
{
    "lead_id": null
}
```

Validation bắt buộc:

- Chỉ Admin được gọi route này.
- Nếu `lead_id` không null, user được chọn phải đang thuộc chính team này.
- Lead không được tự gán hoặc đổi Lead khác.

### POST /teams/{team}/members

Admin hoặc Lead của team thêm member vào team.

Request:

```json
{
    "member_id": "8"
}
```

Rule:

- Admin có thể thêm bất kỳ active user nào.
- Lead chỉ thêm member vào team mình phụ trách.
- Mỗi member chỉ thuộc 0 hoặc 1 team. Khi thêm vào team mới, backend cập nhật `users.team_id` sang team mới.
- Nếu member đang là Lead của team cũ, team cũ phải set `lead_id = null`.

### DELETE /teams/{team}/members/{user}

Admin hoặc Lead của team gỡ member khỏi team.

Rule:

- User bị gỡ phải đang thuộc team hiện tại.
- Nếu user bị gỡ là Lead hiện tại của team, set `teams.lead_id = null`.

### POST /teams/{team}/invites

Admin hoặc Lead của team mời member tham gia team.

Request:

```json
{
    "email": "member@example.com"
}
```

Ghi chú MVP:

- Nếu chưa có hệ thống email/invite token, controller có thể validate và trả flash message để UI sẵn sàng, chưa gửi email thật.

### GET /teams/members

Tab quản lý members trong khu vực Teams. Route trả về Inertia page hoặc cùng page `TeamList` với tab `members`.

Query gợi ý:

- `page`
- `limit`
- `role`
- `status`
- `team_id`
- `keyword`

Quyền:

- Admin xem toàn bộ members.
- Lead xem members thuộc team mình phụ trách.
- Member thường không có quyền quản lý.

Ghi chú điều hướng: sidebar chỉ có menu `Teams`. Trong trang Teams có tabs `Teams` và `Members`; không dùng menu sidebar riêng tên `Members`.

### GET /users

Admin lấy danh sách người dùng. Có thể dùng để chọn sales khi assign lead hoặc chọn member khi thêm vào team. Với UI mới, route này nên được xem là data/support route, không phải page chính trong sidebar.

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

    Route::get('/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
    Route::get('/teams/{team}', [TeamController::class, 'show'])->name('teams.show');
    Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
    Route::patch('/teams/{team}/lead', [TeamController::class, 'updateLead'])->name('teams.lead.update');
    Route::post('/teams/{team}/members', [TeamController::class, 'addMember'])->name('teams.members.store');
    Route::delete('/teams/{team}/members/{user}', [TeamController::class, 'removeMember'])->name('teams.members.destroy');
    Route::post('/teams/{team}/invites', [TeamController::class, 'invite'])->name('teams.invites.store');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/sales', [UserController::class, 'sales'])->name('users.sales');
});
```
