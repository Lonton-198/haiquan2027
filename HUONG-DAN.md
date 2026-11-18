# v0.8.4 — sửa tải lại dữ liệu trong lúc tạo đề

1. KHÔNG chạy lại SQL. Giữ nguyên dữ liệu 44/60 câu.
2. Trên GitHub sửa đúng file `app/dashboard/page.tsx` bằng file trong gói này. Không đụng các file API đã cập nhật v0.8.3, `app/globals.css` hay ảnh mascot.
3. Commit; đợi Vercel Ready. Tải lại trang và bấm **Tiếp tục tạo** bên cạnh bộ Bài 4 đang 44/60 câu.
4. Từ 44/60, hệ thống gọi tối đa 8 lượt (2 câu/lượt), lưu từng lượt và làm mới danh sách cuối lần bấm.
5. Nếu vẫn lỗi, chụp nguyên thông báo mới và Vercel > Logs cho API `/api/generate-quiz` tại thời điểm đó (che khóa bí mật). Lỗi hiện tại chưa đủ chứng cứ để khẳng định nguyên nhân.

**Thay đổi:** chỉ giảm tải dữ liệu lặp lại và thêm thông báo theo từng đợt, không thay thuật toán AI, SQL, hoặc dữ liệu cũ.
