# Học cùng lon ton v0.8 — Ocean Academy

## Cập nhật (ưu tiên qua github.dev)

1. Vào repo GitHub của bạn, nhấn dấu chấm `.` để mở trình sửa mã trên trình duyệt.
2. Copy ba file từ ZIP vào đúng đường dẫn: `app/dashboard/page.tsx`, `app/globals.css`, `components/HomeV08.tsx`.
3. Tải **chính ảnh cún đã chốt** lên `public/lon-ton-mascot.png` (ghi đè file cũ).
4. Commit trên nhánh chính, kiểm tra Vercel Deployments có trạng thái Ready.

Không cần chạy SQL mới. Không sửa API tạo đề, cơ sở dữ liệu hay chế độ ôn.

**Các điểm thực tế:** Dashboard tính số liệu từ bảng Supabase của tài khoản đang đăng nhập. Huy hiệu chỉ mở khi đủ tiêu chí, không dùng số giả. Biểu đồ 7 ngày đếm lượt nộp đề; lịch 7 ngày dựa trên các lịch ôn đã có trong `review_progress`. Trang có bộ đề đã lưu nhưng không làm đề nào sẽ hiển thị biểu đồ 0.

**Lưu ý:** Đây là thay giao diện, chưa chạy thử trực tiếp với Supabase sản xuất. Giữ bản v0.7.2 để quay lại khi cần.
