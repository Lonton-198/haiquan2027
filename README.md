# Hải Quan 2027 – Website ôn thi cá nhân (online)

Bản mã nguồn v0.2: Next.js + Supabase (Auth, Postgres, Storage) + OpenAI API.

## Đã có
- Đăng nhập bằng email/mật khẩu (không có nút đăng ký công khai).
- Tải PDF có text / DOCX tối đa 10 MB, trích xuất và lưu lên Supabase Storage riêng tư.
- Tạo bài học AI theo chủ đề từ tài liệu, lưu trong Postgres.
- Tạo đề khó/rất khó (5–20 câu/bộ), 4 lựa chọn; loại câu không có trích dẫn khớp chính xác nội dung tài liệu.
- Làm bài, chấm điểm **trên máy chủ**, giải thích từng phương án, lưu lịch sử thi, đồng bộ thiết bị.
- Giao diện responsive để dùng trên Windows, MacBook, tablet, điện thoại qua trình duyệt.

## Cài đặt (Windows / Mac)
1. Cài Node.js LTS (Node 20+), mở Terminal trong thư mục.
2. `npm install`
3. Tạo tài khoản miễn phí tại https://supabase.com rồi tạo Project.
4. Mở SQL Editor của Project, chạy nội dung `supabase/schema.sql`.
5. Vào Authentication > Users, tạo **duy nhất tài khoản của bạn** (Add user), chọn email đã xác nhận nếu phù hợp. Tắt signups công khai tại Authentication > Providers > Email (hoặc cấu hình tương đương trong bảng điều khiển phiên bản hiện tại).
6. Copy `.env.example` thành `.env.local`, điền `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` từ Supabase; điền `OPENAI_API_KEY` từ https://platform.openai.com/api-keys; điền `OWNER_EMAIL` trùng email đăng nhập.
7. `npm run dev` rồi mở http://localhost:3000. Đăng nhập và thử tải file Word/PDF.
8. Kiểm tra `npm run lint` và `npm run build`.

## Đưa website lên mạng để đồng bộ Mac / Windows
1. Đưa thư mục này lên **GitHub repo private**. TUYỆT ĐỐI không commit `.env.local`.
2. Tại https://vercel.com, chọn New Project > Import repo GitHub.
3. Trong Project Settings > Environment Variables, thêm 5 biến theo `.env.example` (không thêm file .env.local).
4. Deploy; Vercel tạo URL dạng `https://ten-du-an.vercel.app`.
5. Trên cả Mac và Windows, mở URL này rồi đăng nhập **cùng email**. Tài liệu, bài học, đề và kết quả nằm trong Supabase nên được đồng bộ.
6. Ở Supabase Auth > URL Configuration, đặt Site URL bằng URL của website đã deploy. Nếu bật email xác nhận/khôi phục mật khẩu, cấu hình các Redirect URLs tương ứng.

## Lưu ý thực tế
- Chưa hỗ trợ file `.doc` cũ, PDF scan ảnh, OCR, trích xuất sơ đồ/bảng phức tạp.
- Tài liệu dài: AI hiện chỉ lấy **30.000 ký tự đầu** cho bài học và **45.000 ký tự đầu** cho đề; cần nâng cấp tìm kiếm theo phần/chunk trước khi dùng tài liệu rất dài.
- Sinh tối đa 20 câu/lượt để giảm nguy cơ timeout và lỗi nội dung; có thể tạo nhiều bộ 20 câu.
- Trích dẫn `source_quote` được kiểm tra khớp nguyên văn (sau chuẩn hóa khoảng trắng), nhưng **không đủ để đảm bảo kết luận pháp lý đúng**. Phải đối chiếu hiệu lực văn bản và kiểm tra lại những câu quan trọng.
- Đây là MVP; chưa kiểm thử tích hợp đầy đủ với Supabase, OpenAI, Vercel thực tế; chưa có kiểm tra cập nhật/hiệu lực pháp luật, OCR, versioning tài liệu hoặc dashboard phân loại kiến thức yếu.
- Nếu AI gặp lỗi trích xuất, file upload có thể bị chặn; hãy dùng file DOCX/PDF dạng chữ có thể copy.
- Giới hạn tốc độ, chi phí AI, độ dài tài liệu, phân trang và công cụ quản trị chưa được harden cho nhiều người. Bản này thiết kế cho 1 người dùng.
- Không đưa API key vào mã frontend, repo GitHub hoặc chat công khai. Key OpenAI chỉ được sử dụng trong các API route phía server.
- Gói ChatGPT Plus không bao gồm chi phí OpenAI API; Supabase/Vercel cũng có giới hạn gói miễn phí.

## Cấu trúc
- `app/dashboard/page.tsx`: giao diện và tương tác.
- `app/login/page.tsx`: đăng nhập.
- `app/api/upload`: upload + trích xuất tài liệu.
- `app/api/generate-lesson`, `generate-quiz`: tạo bài và đề AI.
- `app/api/submit`: chấm điểm server và lưu lịch sử.
- `lib/ai.ts`: định dạng dữ liệu AI, kiểm tra trích dẫn.
- `lib/supabase.ts`: Supabase client, kiểm tra người dùng.
- `supabase/schema.sql`: bảng dữ liệu + Row Level Security + bucket riêng tư.

## Những cải tiến ưu tiên
1. Tách văn bản theo điều/khoản/mục; lưu chunk và retrieval theo nội dung liên quan; trích dẫn định vị đến trang/điều.
2. Chấm chất lượng câu hỏi và kiểm chứng căn cứ pháp lý thứ hai độc lập.
3. Thi thử 60 câu bằng cách ghép 3 bộ đã kiểm tra, đảo câu/đáp án.
4. Phát hiện câu sai thường gặp, spaced repetition, tạo đề nhắm điểm yếu.
5. Thanh toán/giới hạn usage nếu tương lai có nhiều người dùng (hiện không cần).
