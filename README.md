# Hải Quan 2027 Online — v0.3

## Tính năng
- Upload DOCX / PDF có chữ vào Supabase Storage (theo tài khoản).
- **Bài học = đọc lại tài liệu:** PDF mở trực tiếp trong iframe từ signed URL 10 phút. DOCX hiển thị toàn bộ văn bản đã trích xuất và có liên kết tải bản gốc; các bảng, ảnh, định dạng Word chỉ được đảm bảo khi mở file gốc. Không dùng AI cho tính năng đọc.
- **Đề vận dụng rất cao:** chọn 10/20/30/40/60/100 câu. AI tạo theo các nhóm tối đa 6 câu, lưu dần vào **cùng một quiz** trong Supabase. Hiển thị tiến độ, có nút **Tiếp tục tạo** nếu bị gián đoạn. Không thể làm bài trước khi tạo xong.
- Đề đã hoàn thành được lưu để làm lại không gọi AI; mỗi lần nộp được lưu vào `attempts`.
- Lời giải 4 đáp án và trích dẫn nguyên văn được đối chiếu với văn bản nguồn ở mức kiểm tra chuỗi. Chưa bảo đảm suy luận pháp lý đúng; cần rà soát thủ công.

## Nâng cấp từ v0.2
Giữ nguyên Supabase, khóa API, biến môi trường, GitHub, Vercel. **Không chạy lại `schema.sql` và không xóa bảng**.

Dùng file `haiquan2027-v03-changed-files.zip` để cập nhật đúng **các đường dẫn gốc** trong GitHub (không tạo thư mục lồng). Khi commit vào `main`, Vercel tự build lại.

### Các file thay đổi
- `app/dashboard/page.tsx`: xem tài liệu; chọn đề 60/100; tiến độ/tạo tiếp.
- `app/api/document/route.ts`: lấy signed URL file nguyên gốc và phần chữ theo quyền đăng nhập.
- `app/api/generate-quiz/route.ts`: tạo đề theo nhóm, xác minh trích dẫn, lưu đề dở và hoàn thành.
- `app/api/submit/route.ts`: chỉ cho nộp đề hoàn tất.
- `app/globals.css`: giao diện đọc tài liệu và thanh tiến độ.
- `lib/ai.ts`: cho phép output dài hơn.
- `lib/supabase.ts`, `lib/supabase-browser.ts`: sửa phân tách server/client và quyền người dùng theo tài khoản.
- `app/login/page.tsx`: sửa hướng dẫn đăng nhập.

### Cấu hình môi trường trên Vercel
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`.
`OWNER_EMAIL` có thể giữ lại để tham khảo nhưng phiên bản này **không hạn chế đăng nhập theo email đó**: đăng nhập được quản lý bởi Supabase Auth và dữ liệu được phân quyền bằng RLS. Nếu muốn cho người dùng đăng ký trực tiếp, cần bổ sung giao diện đăng ký và cấu hình email confirmation trong Supabase (chưa có ở bản này).

### Hạn chế
- PDF scan không có chữ chưa được OCR.
- DOCX xem phần chữ; mở bản Word gốc để giữ bảng/ảnh/định dạng.
- Sinh 60–100 câu mất nhiều yêu cầu API, có thể tốn phí và thời gian. Nếu có lỗi AI hoặc vượt giới hạn, nút 'Tiếp tục tạo' sẽ thử sinh phần còn lại, không xóa câu đã lưu.
- Các câu được kiểm tra trích dẫn dạng chuỗi, **không được kiểm chứng tự động đầy đủ về hiệu lực, logic pháp luật và độ khó thực tế**.
- Không được làm bài thi dở tự lưu.
- Chưa kiểm thử build production thực tế trong môi trường này vì không cài đủ dependency từ npm.

## Chạy local
`npm install` rồi `npm run dev`; kiểm tra sản phẩm trên Vercel với các biến như trên.
