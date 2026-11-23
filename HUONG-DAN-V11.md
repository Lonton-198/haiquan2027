# Học cùng lon ton v1.1 — Ocean Workspace (thử nghiệm)

## Nội dung
- Trang chủ đổi sang kiểu không gian làm việc ba vùng: thanh menu chung (giữ nguyên), thư viện bài học bên trái trong trang, bảng nội dung/học tập ở giữa, lịch ôn bên phải.
- Lấy bài học từ `study_units`, lấy số liệu từ `documents`, `quizzes`, `attempts`, `review_progress` đang có; không tạo số liệu giả, không thêm SQL.
- Danh sách bài học có tìm nhanh. Nhấn bài học để mở đúng bài trong Thư viện; thư viện có thêm cột chọn bài cùng phần lý thuyết, bộ đề và ôn tập.
- Tab Lịch ôn có chuyển dạng dòng thời gian / 7 ngày; chưa bổ sung hệ thống đặt nhắc việc thủ công.
- Mascot dùng tệp ảnh cũ `/public/lon-ton-mascot.png`; không thay mascot.
- Giữ nguyên chức năng tạo đề AI cũ, nhập JSON, xóa tài liệu, tài khoản, ôn tập, SQL và API.

## Các file cần cập nhật (4 file)
1. `app/dashboard/page.tsx`
2. `app/globals.css`
3. `components/StudyLibrary.tsx`
4. `components/HomeWorkspaceV11.tsx` (file mới)

Không cần chạy migration SQL, không cần thay môi trường Vercel. Không cần tải lại ảnh mascot.

## Triển khai an toàn
1. Nên tạo một branch `preview-v11` trên GitHub và chạy bản xem thử trên Vercel Preview trước.
2. Đưa đúng 4 file ở trên vào đường dẫn tương ứng, giữ nguyên tất cả file khác.
3. Commit; xem Build Logs. Kiểm tra Vercel báo Ready trước khi mở thử.
4. Thử: Trang chủ → chọn bài bất kỳ → Đọc tài liệu → Làm đề JSON → Ôn tập; kiểm tra số liệu hiển thị đúng.
5. Nếu bản preview lỗi, không merge vào main. Bản chính vẫn chạy mã cũ.

## Đánh giá kiểm thử
- Đã kiểm tra cú pháp 3 file TSX được chỉnh/tạo bằng trình biên dịch TypeScript (transpile diagnostics không báo lỗi).
- Chưa chạy được `next build` hoặc `tsc --noEmit` đầy đủ, do môi trường hiện tại không cài được dependency từ npm.
- Chưa chạy website trực tiếp với cơ sở dữ liệu thật.

## Giới hạn
- Mục tiêu là giao diện bố cục mới cho *không gian Hải quan hiện tại*; chức năng tạo nhiều không gian học tập khác nhau vẫn thuộc lộ trình tiếp theo.
- Không tự động tạo nhắc việc cá nhân; lịch ôn chỉ hiển thị dữ liệu ôn tập đã có.
