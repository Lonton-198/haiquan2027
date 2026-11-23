# Học cùng lon ton — V2 Ocean Workspace (bản dựng lại)

## Quan trọng
Đây là bộ mã nguồn đầy đủ, đã gộp CSS vào `app/globals.css` để tránh lỗi mất CSS khi upload thiếu file. KHÔNG đưa bản preview chưa kiểm tra lên main.

## Cách triển khai
1. Giữ `main` hiện tại nguyên vẹn.
2. Trên GitHub tạo một nhánh preview mới từ `main`, ví dụ `v2-rebuild`. Không cần xóa `v2-preview` cũ.
3. Giải nén ZIP này, tải nội dung mã nguồn lên nhánh mới. Giữ đúng thư mục `app`, `components`, `lib`, `public`, `supabase` và các file cấu hình.
4. Kiểm tra Vercel Preview báo Ready. Mở preview và thử đăng nhập, trang chủ, thư viện, đề tổng hợp, ôn tập, chấm bài.
5. **Không chạy SQL mới**. Không xóa dữ liệu Supabase, không import các CSV backup.
6. Chỉ merge sang main khi mọi chức năng và giao diện thực tế đã qua kiểm tra.

## Lưu ý
- Bản này dùng nguyên logic chức năng / API từ mã nguồn V2 đã có; làm lại hệ giao diện và tích hợp ảnh nền cảng biển.
- File `app/v2.css` đã bị loại bỏ có chủ đích; các style được gộp vào `app/globals.css`.
- Không đưa thư mục chứa ZIP bọc ngoài vào repository; các file phải nằm trực tiếp dưới root của dự án.
- Preview vẫn có thể kết nối chung Supabase Production; tránh thử xóa / thêm dữ liệu thật.
- Nếu GitHub Upload không ghi đè đúng file, hãy dùng github.dev để thay nội dung chính xác.
