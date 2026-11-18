# Học cùng lon ton v1.0 — Cấu trúc bài học và đề JSON

## Bước quan trọng trước khi cập nhật

- **Không cập nhật giữa lúc website đang tạo đề**. Hãy chờ bộ đề hiện tại hoàn tất hoặc tạm dừng an toàn.
- Xuất bản sao lưu dữ liệu Supabase (ít nhất `documents`, `quizzes`, `attempts`, `review_progress`) trước khi chạy SQL.
- Bản này bổ sung chức năng; không tự xóa bộ đề cũ hay lịch sử. Tuy vậy, thay đổi database production vẫn có rủi ro, nên khuyến nghị chạy thử trên bản sao trước.

## Bước 1 — Supabase

SQL Editor → New query → mở file `supabase/migrations/20261118_study_units_json_quizzes.sql` → copy toàn bộ → Run.

Các hành động trong migration:
- Tạo `study_units` và RLS mỗi tài khoản.
- Bổ sung các cột `study_unit_id`, `quiz_type`, `import_key` vào bảng cũ.
- Cho phép `quizzes.document_id` trống đối với đề tổng hợp.
- Mỗi tài liệu đang có trở thành một bài ban đầu; các đề AI cũ đi theo đúng bài của mình.
- Có thể **chuyển** một tài liệu sang bài khác mà không xóa hay tải lại.
- Tài liệu mới được tạo một bài tự động; nếu tải từ màn hình Bài học, website sẽ chuyển vào bài đã chọn.

Không chạy lại `schema.sql`, không xóa bảng, không chỉnh sửa các dòng cũ thủ công.

## Bước 2 — GitHub

Giải nén ZIP và cập nhật **đúng cấu trúc đường dẫn** bằng github.dev (nhấn dấu `.` trên trang repo) hoặc theo cách GitHub đang hỗ trợ. Nên tạo branch `feature/study-units-v10`, dùng Vercel Preview trước khi ghép vào main.

Các file mới/sửa:
- `app/dashboard/page.tsx` — kết nối thư viện bài, kho đề tổng hợp, ôn tập.
- `components/StudyLibrary.tsx` — giao diện thư viện và nhập JSON.
- `app/api/import-quiz/route.ts` — xác thực tài khoản, kiểm tra file, lưu đề.
- `lib/quiz-import.ts` — quy tắc file JSON.
- `app/globals.css` — CSS mới, giữ tông giao diện v0.8.
- `supabase/migrations/20261118_study_units_json_quizzes.sql` — migration một lần.

Gói **đầy đủ** đã tích hợp các bản vá v0.8.2/v0.8.3/v0.8.4 để tránh vô tình ghi đè về code cũ. Nếu mã nguồn production có thay đổi riêng sau v0.8.4, cần so sánh trước khi thay thế.

## Cách sử dụng

1. Menu **Thư viện bài học** → chọn bài cũ hoặc bấm **Tạo bài mới**.
2. Trong bài: có Lý thuyết (PDF, DOCX), Bài tập & bộ đề, Ôn tập. Tải file PDF/DOCX vào đúng bài, hoặc chuyển tài liệu từ bài khác vào.
3. Bấm **Chọn file đề .json** → website kiểm tra trên trình duyệt → xem trước tên/số câu → **Xác nhận nhập đề**.
4. Menu **Đề tổng hợp** → chỉ nhận JSON có `kind: "comprehensive"`.
5. Mọi đề đều dùng giao diện thi, chấm điểm và lời giải hiện tại. Ôn tập theo bài lấy tất cả câu trong các bộ đề gắn với bài; đề tổng hợp có lịch ôn riêng trong menu Ôn tập thông minh.
6. Chức năng AI cũ vẫn ở mục **Tạo đề AI (cũ)** để test, chưa bị xóa.

## Quy tắc file

Xem `examples/de-theo-bai-mau.json` hoặc `examples/de-tong-hop-mau.json`.

- JSON UTF-8 thuần (`.json`), **không tải ZIP trực tiếp**; giới hạn 2MB, tối đa 200 câu.
- Mỗi câu phải có `stem`, bốn `choices`, `answer` (0–3 hoặc A–D), `explanation`. `difficulty` là `khó` hoặc `rất khó`.
- `choice_explanations` bốn phần tử và `source_quote` nên có để lời giải đầy đủ.
- Không chèn `study_unit_id` thủ công; website gắn bài mà mày chọn lúc nhập.
- Import lại file *giống hệt* vào cùng một bài sẽ được nhận diện là trùng.
- JSON sai được báo vị trí câu/trường; không lưu nửa bộ đề.
- Những file mẫu chỉ kiểm tra chức năng, **không phải đề Hải quan có giá trị học**.

## Giới hạn đã xác định

- Phân loại theo nhóm được lưu trong `study_units`. **Mỗi câu vẫn được theo dõi ôn qua `quiz_id` + `question_index`** đúng như cơ chế trước, không bị xóa. Vì vậy, một câu được copy vào hai JSON khác nhau hiện vẫn có hai lịch ôn riêng. Cần bước chuẩn hóa ID câu hỏi toàn cục nếu sau này bật *đề trộn tự động* dùng lại chính câu đó giữa nhiều đề.
- Đề tổng hợp hiện được upload từ file **đã soạn sẵn**; chưa có thuật toán rút câu ngẫu nhiên từ kho.
- Chưa có giao diện xóa vĩnh viễn một bài / bộ đề nhập vì sẽ gây rủi ro lịch sử thi.
- Chưa chạy `npm run build` được trong môi trường này vì npm install bị timeout. Có kiểm tra cú pháp TS/TSX, chưa kiểm thử trực tiếp với Supabase production và Vercel.
