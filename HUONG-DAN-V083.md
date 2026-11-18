# Học cùng lon ton v0.8.3 — vá lỗi tạo tiếp bộ đề

## Tại sao có thể hiện “Có lỗi xảy ra” khi đề đạt 6/60 câu?

Bản trước truyền toàn bộ các câu đã tạo vào URL để khóa tránh ghi đè, nên URL tăng theo số câu. Các câu rất dài dễ làm URL quá giới hạn máy chủ. Đồng thời Supabase trả lỗi dạng object nhưng API cũ hiển thị lỗi chung chung.

Đây là **nguyên nhân nghi ngờ từ mã nguồn**, chưa thể xác nhận chắc chắn nếu chưa có log Vercel của request lỗi.

## Cập nhật: làm đúng thứ tự

1. Supabase → SQL Editor → New query: mở `supabase/migrations/20261118_atomic_quiz_append.sql`, dán nội dung, Run. Migration chỉ tạo hàm mới, KHÔNG xóa/chỉnh các bộ đề đang lưu.
2. GitHub: thay đúng 2 file `app/api/generate-quiz/route.ts` và `lib/api.ts` từ ZIP này, commit.
3. Kiểm tra Vercel đã Deploy **Ready** rồi quay lại web, chọn **Tiếp tục tạo** đối với bộ Bài 4 đang 6/60 câu. **Không tạo bộ mới** vì bộ cũ đã lưu 6 câu.
4. Nếu còn lỗi, chụp thông báo mới và vào Vercel → Logs, lọc request `/api/generate-quiz`, cung cấp phần error (che thông tin bí mật).

Không cần thay API Key. Không mất các câu đã có. Mỗi lần tạo tiếp vẫn có thể tiêu tốn OpenAI API, nên chỉ bấm một lần và theo dõi tiến độ.
