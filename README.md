# Học cùng lon ton — v0.7 UI/UX

Bản nâng cấp giao diện sáng theo phong cách Premium Academy kết hợp Gamified.

## Có gì mới
- Mascot cún vàng áo phao đen/tai nghe xuất hiện tại trang đăng nhập, logo và trang chủ.
- Tùy chọn 6 màu có sẵn hoặc tự chọn màu bất kỳ; lưu bằng `localStorage` **trên từng trình duyệt**, chưa đồng bộ lựa chọn màu giữa các thiết bị.
- Trang chủ có thẻ thống kê dựa trên lượt làm đề thực tế và nút tiếp tục học.
- Thẻ bài học, thanh điều hướng câu hỏi trong lúc thi, đánh dấu câu phân vân (chỉ lưu trong phiên làm bài).
- Không có Dark Mode; không thêm kiểm tra độ phủ; không đụng vào schema Supabase.

## Cách cập nhật
1. Sao lưu repository đang chạy (Code > Download ZIP).
2. Giải nén `hoc-cung-lon-ton-v07-cap-nhat.zip`. Vào **thư mục gốc repository** trên GitHub > Add file > Upload files. Kéo **các thư mục `app`, `components`, `public`** vào trang upload. Giữ chính xác cấu trúc đường dẫn. Nếu GitHub báo xung đột file tồn tại, không xóa dữ liệu; dùng github.dev (nhấn dấu `.` ở repository) hoặc GitHub Desktop.
3. Commit lên `main`, Vercel tự triển khai. Không phải chạy SQL hay đổi env.
4. Kiểm tra: đăng nhập > Trang chủ > chọn màu > Ôn thi Hải quan 2027 > Làm bài > đánh dấu câu > nộp > Ôn tập.

## Hạn chế
- Không có kết nối trực tiếp Vercel/Supabase trong môi trường đóng gói để chạy thử production.
- Thanh đánh dấu câu trong lần thi **chưa được lưu** nếu refresh.
- Tên mascot và màu cá nhân không làm thay đổi quyền truy cập dữ liệu.
- Đừng tải `.env.local`, mật khẩu, token lên GitHub.
