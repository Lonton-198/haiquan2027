# v0.8.2 — Sửa cún bị cắt đầu

Chỉ thay `app/globals.css` trên GitHub bằng file trong gói này. Không cần SQL, không thay ảnh mascot hoặc code tạo đề.

Nguyên nhân: mascot có tỷ lệ ảnh dọc nhưng CSS v0.8.1 giới hạn theo chiều rộng làm chiều cao vượt khỏi banner. CSS v0.8.2 giới hạn chiều cao, căn đáy và giữ toàn thân trong vùng banner.

Kiểm tra màn hình desktop + mobile sau khi Vercel triển khai. Nếu ảnh cũ còn trong cache, refresh cứng trình duyệt.
