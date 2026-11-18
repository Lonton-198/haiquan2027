# Học cùng lon ton v0.7.2 — Tên hiển thị và đổi mật khẩu

Chỉ cập nhật 2 file: `app/dashboard/page.tsx` và `app/globals.css`.

1. Giữ nguyên bản v0.7.1 (đã có chức năng xóa tài liệu) và những file API/SQL khác.
2. Tại GitHub, cập nhật đúng 2 file nêu trên, commit vào nhánh main.
3. Kiểm tra Vercel → Deployments → Ready.
4. Mở website, đăng nhập; ở góc trên bên phải nhấn tên hoặc email → Cài đặt tài khoản.
5. Nhập tên hiển thị và Lưu; hoặc nhập mật khẩu mới hai lần và Đổi mật khẩu.

Tên được lưu trong `auth.users.user_metadata.display_name` qua Supabase Auth. Mật khẩu được quản lý bởi Supabase Auth; ứng dụng không lưu mật khẩu trong bảng riêng. Không cần thêm SQL hoặc API key.

**Lưu ý:** Nếu Supabase bật chế độ Secure password change, Auth có thể yêu cầu xác minh lại. Nếu bị lỗi, cần làm theo luồng xác minh của Supabase trước khi cập nhật mật khẩu.

Chưa chạy kiểm thử end-to-end với Supabase hay Vercel; nên kiểm tra trên website sau deployment.
