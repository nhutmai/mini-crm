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
