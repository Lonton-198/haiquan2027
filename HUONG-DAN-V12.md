# Học cùng lon ton v1.2 — Ocean Workspace Motion

## Những gì thay đổi

- Phong cảnh biển/hải đăng dạng hình SVG riêng ở nền **tất cả các trang**, được làm nhạt để nội dung dễ đọc.
- Banner Ocean Workspace có hình nền cảng biển riêng; cún gốc vẫn là ảnh mascot trong suốt, không vẽ lại khuôn mặt.
- Sidebar, header, form, thẻ bài, nhập JSON, tạo đề AI, ôn tập, bài thi, kết quả, tài khoản và đăng nhập cùng dùng ngôn ngữ giao diện kính mờ.
- Hiệu ứng chuyển trang/tab, hover, nhấn nút, chọn đáp án, mở bài học và biểu đồ; tự động giảm hiệu ứng nếu thiết bị bật Reduced Motion.
- **Không thay đổi API, dữ liệu Supabase, schema hay lịch ôn**.

## Cập nhật

Từ thư mục gốc repository, thay **đúng đường dẫn**:

1. `app/globals.css` — bảng thiết kế chung.
2. `app/dashboard/page.tsx` — hiệu ứng chuyển các màn lớn.
3. `components/StudyLibrary.tsx` — hiệu ứng mở bài ở thư viện.
4. `public/ocean-atmosphere.svg` — **file mới**, nền chìm toàn bộ website.
5. `public/ocean-hero.svg` — **file mới**, nền banner.

Nên dùng `github.dev` (nhấn dấu `.` khi mở repository trên GitHub) để thay đúng các file, hoặc tải từng file bằng Upload files vào đúng thư mục. **Không upload nguyên ZIP**. Không cần chạy SQL.

## Kiểm tra sau deploy

1. Vercel báo Ready.
2. Mở Trang chủ: thấy phong cảnh biển nhạt phía sau thẻ, cảnh cảng sau banner, mascot trọn khuôn mặt.
3. Kiểm tra lần lượt: Tổng quan, Thư viện (đổi giữa hai bài), Đề tổng hợp, Tạo đề AI, Ôn tập thông minh, Thống kê, Tài khoản, trang Đăng nhập.
4. Thử chọn đáp án một bộ đề cũ, chấm và kiểm tra lịch sử (không phải tạo đề AI mới để thử giao diện).
5. Nếu không thấy đổi: refresh cứng trình duyệt hoặc mở cửa sổ riêng tư, kiểm tra đã có cả 2 file SVG trong `public`.

## Kiểm thử đã thực hiện

- Kiểm tra cú pháp TSX bằng trình phân tích TypeScript.
- Kiểm tra cú pháp CSS bằng `tinycss2` và XML SVG bằng ElementTree.
- Kiểm tra nội dung gói ZIP.
- **Chưa chạy Next.js production build đầy đủ** vì cài dependencies qua npm bị timeout trong môi trường hiện tại. Hãy dùng Vercel Build Logs để xác minh trước khi coi đây là bản ổn định.
