# Học cùng lon ton V2 — 3 chủ đề (Biển, Rừng, Đô thị)

## Các thay đổi
- Nút bảng màu trên header: chọn 3 chủ đề; mỗi chủ đề đổi cả nền toàn trang, banner, sidebar, màu accent giao diện.
- Chuyển nền bằng crossfade 550ms; tự lưu trên trình duyệt bằng localStorage; không reload.
- Vẫn giữ khả năng chọn màu nhấn riêng; không dùng SQL mới.
- Mascot, nhập JSON, Supabase Auth và lịch ôn giữ nguyên.

## Các file cập nhật (chỉ 7 file)
1. `app/layout.tsx`
2. `app/globals.css`
3. `app/dashboard/page.tsx`
4. `components/HomeV2.tsx`
5. `components/ThemeBackdrop.tsx` (mới)
6. `public/theme-forest.jpg` (mới)
7. `public/theme-city.svg` (mới)

**BẮT BUỘC:** Giữ cả `public/ocean-coast-art.jpg` đang chạy tốt, không cần thay ảnh biển.

## Cách cập nhật an toàn
1. Đang ở nhánh V2 thử nghiệm (ví dụ `V2-mới`), KHÔNG làm trên `main`.
2. Đưa 7 file ở trên đúng vị trí. Đối chiếu tên file và commit; `Add file → Upload files` đôi khi không tải đầy đủ cả thư mục khi kéo thả.
3. Mở Vercel Preview, đăng nhập, bấm nút palette ở góc trên bên phải.
4. Chọn lần lượt Biển / Rừng / Đô thị; thử tab Thư viện, Đề tổng hợp, Ôn tập và Thống kê; thử tải lại trang để chắc chắn chủ đề được nhớ.
5. Khi Preview không có lỗi, mới gộp nhánh vào `main`.

## Cách gộp vào main bằng GitHub
1. GitHub → repo `haiquan2027` → nhánh V2 thử nghiệm.
2. Bấm **Compare & pull request** (hoặc **Contribute → Open pull request**).
3. Base phải là `main`, compare là nhánh V2 thử nghiệm. Đọc tab **Files changed**, đảm bảo không có `.env`, SQL xóa dữ liệu hay file ngoài dự kiến.
4. Bấm **Create pull request**, chờ check của Vercel/CI nếu có; mở lại Preview kiểm tra.
5. Bấm **Merge pull request → Confirm merge**. Vercel thường tự triển khai Production từ main.
6. Vercel → Deployments kiểm tra Production **Ready**, mở website chính test đăng nhập, thư viện, chọn theme.

## Cảnh báo về dữ liệu
- Nếu Preview dùng chung biến môi trường Supabase Production, mọi thao tác ghi/xóa/tạo đề trên Preview vẫn dùng database thật. Chỉ thử các thao tác đọc và chọn theme khi kiểm tra.
- Dữ liệu lựa chọn theme lưu theo trình duyệt, không đồng bộ giữa các thiết bị; hệ thống đề và lịch sử vẫn đồng bộ như cũ.
- File CSV sao lưu nên giữ riêng, không upload vào repo.
