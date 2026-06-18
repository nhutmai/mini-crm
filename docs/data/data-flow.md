# Data Flow - CRM mini quản lý lead

## Mục tiêu

Tài liệu này mô tả dữ liệu của hệ thống CRM mini đi từ đâu, được xử lý như thế nào, được lưu ở đâu và từng nhóm người dùng có quyền truy cập dữ liệu nào. Hệ thống phục vụ bài toán gom lead từ nhiều chiến dịch marketing về một nơi để marketer, sales và admin cùng theo dõi trạng thái xử lý lead.

## Nguồn phát sinh dữ liệu

Lead có thể được tạo từ các nguồn sau:

- Marketer hoặc admin nhập thủ công lead vào hệ thống.
- Khách hàng điền form public trên landing page hoặc form tư vấn.
- Lead được tổng hợp từ các chiến dịch như Facebook Ads, Google Ads, sự kiện offline, referral hoặc các kênh marketing khác.
- Dữ liệu có thể được nhập lại từ Google Sheet, Excel, email hoặc inbox nếu dự án có hỗ trợ import.

Campaign được tạo bởi marketer hoặc admin để gom các lead cùng một chiến dịch. Mỗi lead nên gắn với một campaign để sau này đo hiệu quả chiến dịch.

## Luồng dữ liệu chính

1. Marketer tạo campaign với tên chiến dịch, mô tả, nguồn, thời gian chạy và trạng thái chiến dịch.
2. Lead được tạo từ form public hoặc được nhập thủ công trong trang quản trị.
3. Laravel controller kiểm tra dữ liệu bắt buộc như họ tên, số điện thoại, email, nguồn lead và campaign.
4. Lead được lưu vào database với trạng thái ban đầu, ví dụ `new`.
5. Admin hoặc marketer assign lead cho sales phụ trách.
6. Sales xem danh sách lead được giao và cập nhật trạng thái xử lý như đã gọi, đang tư vấn, tiềm năng, đã chuyển đổi hoặc không phù hợp.
7. Admin xem toàn bộ dữ liệu lead, campaign và hiệu quả xử lý.
8. Marketer xem lead thuộc campaign của mình để đánh giá chất lượng chiến dịch.

## Dữ liệu được lưu trữ

Nhóm dữ liệu chính của hệ thống gồm:

- User: thông tin tài khoản và vai trò như admin, marketer, sales.
- Campaign: thông tin chiến dịch marketing.
- Lead: thông tin khách hàng tiềm năng và trạng thái xử lý.
- Assignment: thông tin lead được giao cho sales nào, ai giao và thời điểm giao.
- Activity hoặc Lead Note: lịch sử chăm sóc, ghi chú, cuộc gọi, thay đổi trạng thái.

## Phân quyền truy cập dữ liệu

- Admin: xem và thao tác toàn bộ user, campaign, lead, assignment và báo cáo.
- Marketer: tạo và quản lý campaign của mình, xem lead thuộc campaign do mình phụ trách.
- Sales: xem lead được giao cho mình, cập nhật trạng thái xử lý và ghi chú chăm sóc.
- Public user: chỉ gửi thông tin qua form public, không được xem dữ liệu trong hệ thống.

## Dữ liệu nhạy cảm

Lead có thể chứa dữ liệu cá nhân như họ tên, số điện thoại, email, nhu cầu tư vấn và ghi chú trao đổi. Khi triển khai thực tế, hệ thống cần:

- Chỉ hiển thị dữ liệu theo đúng vai trò.
- Không trả về dữ liệu lead không thuộc phạm vi người dùng hiện tại.
- Không ghi log thông tin nhạy cảm như số điện thoại đầy đủ hoặc nội dung tư vấn chi tiết nếu không cần thiết.
- Có cơ chế cập nhật hoặc xóa lead khi cần theo yêu cầu vận hành.

## Data flow tổng quát

```mermaid
flowchart LR
    A["Facebook Ads / Google Ads / Offline Event / Referral"] --> B["Campaign"]
    C["Public Form"] --> D["Lead Intake"]
    E["Manual Import"] --> D
    D --> F["Validate Lead Data"]
    F --> G["Database: Leads"]
    B --> G
    G --> H["Assign Lead"]
    H --> I["Sales Workspace"]
    I --> J["Update Status / Add Notes"]
    J --> G
    G --> K["Admin Dashboard"]
    G --> L["Marketer Campaign Report"]
```
