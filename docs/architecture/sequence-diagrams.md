# Sequence Diagrams - CRM mini quản lý lead

## Mục tiêu

Tài liệu này mô tả các luồng xử lý chính theo thứ tự thời gian: người dùng thao tác trên React, request đi vào Laravel route trong `routes/web.php`, controller xử lý ra sao và dữ liệu được lưu ở đâu. Các diagram bên dưới là bản nháp để chỉnh lại theo tên controller, route và database thực tế.

## Luồng tạo campaign

```mermaid
sequenceDiagram
    actor Marketer
    participant Web as React trong Laravel
    participant API as Laravel Controller
    participant DB as Database

    Marketer->>Web: Nhập thông tin campaign
    Web->>API: POST /campaigns
    API->>API: Kiểm tra đăng nhập và role marketer/admin
    API->>API: Validate dữ liệu campaign
    API->>DB: Insert campaign
    DB-->>API: Campaign đã tạo
    API-->>Web: Trả về campaign
    Web-->>Marketer: Hiển thị tạo thành công
```

![alt text](../images/create-campaign.png)

## Luồng khách hàng gửi lead từ public form

```mermaid
sequenceDiagram
    actor Visitor as Khách hàng
    participant Form as Public Form
    participant API as Laravel Controller
    participant DB as Database

    Visitor->>Form: Nhập họ tên, liên hệ, nhu cầu
    Form->>API: POST /public/leads
    API->>API: Validate dữ liệu bắt buộc
    API->>DB: Kiểm tra campaign tồn tại
    DB-->>API: Campaign hợp lệ
    API->>DB: Insert lead với status new
    DB-->>API: Lead đã tạo
    API-->>Form: Trả về kết quả thành công
    Form-->>Visitor: Hiển thị thông báo đã gửi
```

## Luồng admin hoặc marketer assign lead cho sales

```mermaid
sequenceDiagram
    actor Manager as Admin / Marketer
    participant Web as React trong Laravel
    participant API as Laravel Controller
    participant DB as Database

    Manager->>Web: Chọn sales để giao lead
    Web->>API: PATCH /leads/{id}/assign
    API->>API: Kiểm tra quyền truy cập lead
    API->>DB: Kiểm tra lead và sales tồn tại
    DB-->>API: Dữ liệu hợp lệ
    API->>DB: Update lead.assigned_to và status
    API->>DB: Insert lead activity type assignment
    DB-->>API: Cập nhật thành công
    API-->>Web: Trả về lead đã cập nhật
    Web-->>Manager: Hiển thị assign thành công
```

## Luồng admin tạo team và gán Team Lead

```mermaid
sequenceDiagram
    actor Admin
    participant Web as React trong Laravel
    participant API as TeamController
    participant Policy as TeamPolicy / FormRequest
    participant DB as Database

    Admin->>Web: Tạo team mới
    Web->>API: POST /teams
    API->>Policy: Kiểm tra user là Admin
    API->>API: Validate name, description
    API->>DB: Insert teams với lead_id null
    DB-->>API: Team đã tạo
    API-->>Web: Redirect back với flash success
    Web-->>Admin: Hiển thị team mới

    Admin->>Web: Thêm member vào team
    Web->>API: POST /teams/{team}/members
    API->>Policy: Kiểm tra Admin có quyền addMember
    API->>DB: Nếu member là Lead team cũ, set team cũ lead_id null
    API->>DB: Update users.team_id sang team mới
    DB-->>API: Member đã thuộc team
    API-->>Web: Redirect back với flash success

    Admin->>Web: Chọn member làm Team Lead
    Web->>API: PATCH /teams/{team}/lead
    API->>Policy: Kiểm tra user là Admin
    API->>API: Validate lead_id thuộc member của team
    API->>DB: Update teams.lead_id
    DB-->>API: Lead đã được gán
    API-->>Web: Redirect back với flash success
```

## Luồng Team Lead quản lý member trong team

```mermaid
sequenceDiagram
    actor Lead as Team Lead
    participant Web as Teams / Members tab
    participant API as TeamController
    participant Policy as TeamPolicy / FormRequest
    participant DB as Database

    Lead->>Web: Mở chi tiết team mình phụ trách
    Web->>API: GET /teams/{team}
    API->>Policy: Kiểm tra Lead phụ trách team này
    API->>DB: Lấy team, lead, members
    DB-->>API: Team detail
    API-->>Web: Inertia props

    Lead->>Web: Thêm member vào team
    Web->>API: POST /teams/{team}/members
    API->>Policy: Kiểm tra addMember trong team mình lead
    API->>DB: Nếu member là Lead team cũ, clear team cũ lead_id
    API->>DB: Update users.team_id sang team hiện tại
    DB-->>API: Member đã chuyển team
    API-->>Web: Redirect back với flash success

    Lead->>Web: Gỡ member khỏi team
    Web->>API: DELETE /teams/{team}/members/{user}
    API->>Policy: Kiểm tra removeMember trong team mình lead
    API->>DB: Nếu user là Lead team hiện tại, set lead_id null
    API->>DB: Update users.team_id null
    DB-->>API: Member đã rời team
    API-->>Web: Redirect back với flash success
```

## Luồng sales cập nhật trạng thái lead

```mermaid
sequenceDiagram
    actor Sales
    participant Web as Sales Workspace
    participant API as Laravel Controller
    participant DB as Database

    Sales->>Web: Mở lead được giao
    Web->>API: GET /leads/{id}
    API->>API: Kiểm tra lead có assigned_to là sales hiện tại
    API->>DB: Lấy chi tiết lead
    DB-->>API: Lead detail
    API-->>Web: Trả về dữ liệu lead
    Sales->>Web: Cập nhật trạng thái và ghi chú
    Web->>API: PATCH /leads/{id}/status
    API->>API: Validate trạng thái mới
    API->>DB: Update lead status
    API->>DB: Insert lead activity type status_change/note
    DB-->>API: Cập nhật thành công
    API-->>Web: Trả về lead mới nhất
    Web-->>Sales: Hiển thị trạng thái đã cập nhật
```

## Luồng xem dashboard

```mermaid
sequenceDiagram
    actor User as Admin / Marketer
    participant Web as React trong Laravel
    participant API as Laravel Controller
    participant DB as Database

    User->>Web: Mở dashboard
    Web->>API: GET /reports/overview
    API->>API: Xác định role và phạm vi dữ liệu
    API->>DB: Query số lead theo campaign/status/sales
    DB-->>API: Dữ liệu tổng hợp
    API-->>Web: Trả về report
    Web-->>User: Hiển thị biểu đồ và số liệu
```
