# Học cùng lon ton — v0.6

Nền tảng học tập nhiều không gian, mở đầu với **Ôn thi Hải quan 2027**.
Giao diện **sáng**, không Dark Mode. Mỗi file PDF/DOCX là một bài riêng; kho đề cũ, cơ chế tạo đề v0.5, chấm bài và lịch sử vẫn được giữ.

## Điểm mới

- Thay thương hiệu trên màn hình, trang đăng nhập và metadata thành **Học cùng lon ton**.
- Trang chủ nhiều không gian học; hiện có không gian **Ôn thi Hải quan 2027**.
- Menu theo bài: Tổng quan / Bài học / Luyện đề / Ôn tập thông minh / Thống kê.
- Từ một bài, đi thẳng tới đọc tài liệu, luyện đề hoặc ôn lại.
- **Ôn lặp lại từ đề hoàn chỉnh đã lưu**: ưu tiên câu đến hạn, rồi tới câu chưa từng ôn. Không gọi AI, không mất phí token OpenAI.
- Lưu lịch ôn **theo từng tài khoản + từng câu thuộc đề + ngày đến hạn**, đồng bộ trên các máy.
- Tự đánh giá từng câu là “nhớ chắc” hay “còn phân vân”; sai: 1 ngày, đúng mà còn phân vân: tối đa 2 ngày, đúng chắc: 1→3→7→14→30→60 ngày.
- Người dùng có thể chọn bài và số câu cho mỗi phiên. Chỉ những đề đã tạo đủ mới được đem ra ôn.
- Tài khoản có thể đăng ký từ màn hình login nếu Supabase bật đăng ký. Việc xác nhận email phụ thuộc cấu hình Supabase.

Không có kiểm tra độ phủ kiến thức. Chưa có thông báo đẩy, tự lưu bài đang làm dở, hoặc chế độ tối. Tính năng “Thêm không gian học” chỉ là chỗ dành cho nâng cấp về sau, chưa tạo không gian mới.

## Cập nhật từ website cũ — phải thực hiện theo đúng thứ tự

**1. Sao lưu mã nguồn đang chạy.** GitHub → repository `haiquan2027` → Code → Download ZIP; hoặc dùng GitHub Desktop clone repository. Chưa xóa dự án hay dữ liệu Supabase.

**2. Tạo bảng lịch ôn:** Supabase → đúng project → SQL Editor → New query → dán *nguyên nội dung* `supabase/migrations/20261118_review_progress.sql` → Run. Script `create table if not exists`, không xóa tài liệu, đề hay lịch sử cũ. Nếu gặp lỗi thì dừng và kiểm tra trước khi deploy.

**3. Cập nhật mã nguồn:** Dùng **GitHub Desktop** (khuyên dùng để thay nhiều file an toàn): Clone repository lên máy → chép nội dung ZIP v0.6 vào thư mục clone, chọn Replace existing files → kiểm tra danh sách thay đổi → Commit to main → Push origin. Không kéo thư mục v0.6 nằm bọc ngoài, không tải file `.env.local` hay `node_modules` lên GitHub. Bản `v06-cap-nhat.zip` chỉ chứa file cần đổi và SQL; bản full có toàn bộ mã nguồn làm cơ sở từ v0.3 + bản vá v0.4/v0.5.

**4. Vercel:** Project → Deployments → xem commit mới → kiểm tra Ready. Không cần đổi URL `haiquan2027.vercel.app` hoặc biến môi trường API.

**5. Thử nghiệm**: đăng nhập → Trang chủ → Ôn thi Hải quan 2027 → Bài học → đọc tài liệu cũ → Luyện đề → mở bộ đề cũ → Ôn tập thông minh → chọn đúng bài có đề hoàn chỉnh → cập nhật lịch → làm bài và chấm. Sau khi nộp, tải lại trang và đăng nhập trên máy khác để kiểm tra lịch được lưu.

## Chú ý bảo mật và vận hành

- `review_progress` bật Row Level Security, quyền cấp cho `authenticated`, chỉ xem/sửa lịch của chính tài khoản và đề của chính tài khoản.
- Các câu trong ôn tập lấy từ cơ sở dữ liệu đã tạo, **không gọi `/api/generate-quiz` hay OpenAI**. Vẫn có thể phát sinh chi phí hosting/database nếu vượt hạn mức nhà cung cấp.
- Cơ chế ôn theo **câu hỏi đã lưu** (không thay nội dung câu hỏi cũ). Khi tạo nhiều bộ đề kiểm tra cùng một kiến thức, mỗi câu có lịch riêng.
- Giữ API key **chỉ** trong Environment Variables của Vercel. Không commit `.env.local`.
- Độ chính xác pháp lý của câu hỏi AI vẫn phải được người học kiểm tra.

## Kiểm thử & giới hạn

Đã kiểm tra cú pháp TS/TSX, cấu trúc file và tính toàn vẹn ZIP. **Chưa chạy thành công lệnh `next build` đầy đủ trong môi trường tạo bản này do không cài được dependencies; chưa kiểm thử end-to-end với Vercel, Supabase hoặc API thật.** Khi deploy nếu Vercel báo lỗi, đọc Build Logs để sửa dựa trên thông báo mới. Không nên ghi đè các chỉnh sửa khác được thực hiện trên GitHub sau bản v0.5 mà chưa so sánh diff.
