# Học cùng lon ton v0.7.1 — Xóa tài liệu an toàn

**Mục tiêu:** xóa tệp Word/PDF và nội dung đã trích xuất nhưng **không xóa câu hỏi, bộ đề, lượt làm, lịch ôn**.

## Bước 1: chạy SQL (chỉ 1 lần)
Supabase > SQL Editor > New query > dán toàn bộ `supabase/migrations/20261118_safe_document_delete.sql` > Run.
SQL chỉ **thêm cột `deleted_at`** và chỉ mục. Không xóa dữ liệu.

## Bước 2: cập nhật các file code lên GitHub
Dùng gói `hoc-cung-lon-ton-v071-cap-nhat.zip`. Giải nén và upload đúng cây thư mục từ gốc repo.
Không upload file `.env.local` hay API keys.
Kiểm tra Vercel > Deployments: Ready.

## Bước 3: thử xóa
Trên web > Ôn thi Hải quan 2027 > Bài học > cạnh một tài liệu > **Xóa tài liệu** > xác nhận.
- File nguồn và chữ trích xuất sẽ được xóa sau khi cập nhật trạng thái.
- Giữ lại một bản ghi ID/tên bị ẩn để những bộ đề liên quan vẫn chạy; không hiển thị trong kho tài liệu.
- Đề cũ có thể **Làm bài**, xem kết quả; mục **Ôn tập thông minh** vẫn hiển thị bài đã xóa file nếu còn đề liên quan.
- Không tạo được câu hỏi mới hoặc hoàn tất đề đang tạo từ một file đã xóa.
- Xóa không hoàn tác được. Để đọc lại tài liệu phải tải lại file.
- Không cần thêm phí OpenAI API cho thao tác xóa.

## Lưu ý kỹ thuật
Không gọi `DELETE FROM public.documents` vì khóa ngoại `quizzes.document_id` có `ON DELETE CASCADE`. Thay vào đó dùng `deleted_at`, rồi xóa file khỏi Supabase Storage và xóa extracted_text.
Nếu thao tác xóa báo lỗi, đừng chạy SQL xóa bảng hoặc tùy tiện sửa khóa ngoại. Chụp thông báo gửi lại.

## Giới hạn kiểm thử
Cú pháp TS/TSX được kiểm tra tĩnh; cần thử build production trên Vercel và test xác nhận không mất quiz.
