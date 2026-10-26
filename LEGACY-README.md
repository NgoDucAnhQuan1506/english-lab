# English Lab — 30 ngày nền tảng

> Tài liệu lưu trữ baseline 25/10/2026, trước Foundation v2. Các số lượng và kết quả dưới đây mô tả phiên bản cũ. Xem README.md, OPERATIONS.md và ACCEPTANCE-REPORT.md cho sản phẩm hiện tại.

Ứng dụng cho người Việt bắt đầu từ số 0, học chính khoảng 15–20 phút mỗi ngày. Mục tiêu là xây nền tảng và thói quen; không hứa thành thạo sau 30 ngày hoặc cấp chứng chỉ CEFR.

## Chạy trên máy

Cần Node.js 22.13+ (khuyến nghị 24).

```powershell
npm.cmd install
npm.cmd start
```

Mở `http://localhost:3000`. Trên macOS/Linux dùng `npm install`, `npm start`. Không có bước build: Node phục vụ HTML/CSS/JavaScript thuần. Khi phát triển, SQLite tự tạo ở `data/english-lab.sqlite`; thư mục này không nằm trong Git. `.env.example` là tài liệu mẫu, không tự được nạp bởi `npm start`.

## Nội dung đã có

Đủ **30 ngày, 240 câu luyện và 90 câu kiểm tra**. Xem [bảng nội dung từng ngày](CONTENT-REPORT.md).

Mỗi ngày có mục tiêu, ôn buổi trước (trừ ngày 1), bài giảng tiếng Việt, ví dụ Anh–Việt, 5–6 mục từ/cụm có IPA và câu mẫu, nghe–nói kèm văn bản, 8 câu luyện, 3 câu kiểm tra, lời giải, tổng kết và nhiệm vụ ôn. Từ cũ được tái sử dụng; ngày 7/14/21/30 ưu tiên ôn tập, ngày 28 sửa lỗi.

Lộ trình: ngày 1–5 tên chữ/âm/đánh vần; 6–10 số/lịch/chào hỏi; 11–15 đại từ/be/câu đơn; 16–20 hiện tại đơn/thói quen; 21–25 nghe/đọc/hội thoại; 26–30 vận dụng và ôn.

## Cách học và tính điểm

- **Hôm nay:** bài đề xuất, tiếp tục đúng phần đang học, số nội dung đến hạn, chuỗi ngày và hoạt động thực tế.
- **Lộ trình:** cả 30 bài đều mở. Bài có gợi ý học ngày trước; kiểm tra cuối buổi chỉ mở sau khi đã trả lời đủ 8 câu luyện của cùng lượt.
- **Bài học:** sáu phần: bài giảng, từ vựng, nghe–nói, luyện, kiểm tra, tổng kết. Câu luyện hiển thị từng câu; đã trả lời thì không đổi điểm bằng cách bấm lại. Lượt mới có mã riêng.
- **Đạt bài:** cùng một lượt làm đủ 8 câu luyện + 3 câu kiểm tra, đúng ít nhất 6/8 và 2/3. Mở bài hoặc bấm tiếp theo không tính đạt.
- **Chấm đáp án:** mặc định không phân biệt hoa/thường, bỏ qua dấu câu và khoảng trắng thừa; chỉ nhận từ/cụm đã định nghĩa, không đoán từ gần giống. Câu yêu cầu viết chữ thường có quy tắc phân biệt hoa/thường riêng và nhãn nhắc.
- **Ôn tập:** câu sai tự được lưu; đáp đúng/tự chọn “Đã nhớ” tăng lịch 1–3–7–14 ngày. “Chưa nhớ” về 1 ngày, “Khó” giữ mức. Mỗi mục có trạng thái nhớ tách khỏi lịch sử lượt trả lời.
- **Sổ tay:** tìm theo từ/nghĩa, lọc bài hoặc từ yêu thích, nghe lại, tự nhớ và đánh giá. Yêu thích trong bài học liên kết thật với sổ tay; từ yêu thích từ công cụ bảng chữ cũ cũng hiện ở đây.
- **Tiến độ:** số bài đạt, đúng/tổng theo kỹ năng và ngày, từ tự ôn/mức nhớ, thời gian có hoạt động và nhóm yếu. Đây là thống kê câu đã làm, không phải đo năng lực tổng quát.
- **Bảng chữ cái luyện thêm:** giữ công cụ cũ, sửa bài luyện theo chữ đang chọn. Chuyển chữ chỉ ghi đã xem; trả lời đúng hai lần mới đạt. Đã xem/đang luyện/đã đạt có nhãn. Tiến độ cũ được giữ nguyên, không tự xóa dữ liệu.

Chuỗi học chỉ tính ngày có trả lời câu hỏi. Mặc định múi giờ `Asia/Ho_Chi_Minh`, đổi tại Tài khoản; số liệu ngày được tính lại từ thời điểm sự kiện. Thời gian chỉ cộng khi ở trang bài học, tab có focus và có tương tác trong 60 giây gần đây, tối đa 60 giây mỗi phút kể cả nhiều tab. Không cộng chỉ vì để tab nền. Không có điểm phát âm tự tạo.

## Lưu tiến độ khách và tài khoản

Khách dùng `localStorage`: F5/đóng mở trình duyệt vẫn còn dữ liệu. Xóa dữ liệu trình duyệt hoặc dùng thiết bị khác sẽ không có dữ liệu khách này. Không lưu mật khẩu/session token/khóa admin trong localStorage.

Tài khoản lưu lịch sử hoạt động ở database. Mỗi hoạt động có UUID để thử gửi lại/hợp nhất mà không cộng trùng. Kết quả câu hỏi được máy chủ tự chấm, không tin trường `correct` từ client. Tài khoản chỉ đọc/sửa lịch sử của chính mình.

Khi đăng nhập, dữ liệu khách không tự ghi đè dữ liệu tài khoản: Hôm nay có nút **Hợp nhất vào tài khoản**. Hợp nhất theo mã hoạt động; giữ cả hai lịch sử; sự kiện đã có ở máy chủ được ưu tiên nếu mã trùng. Hai lượt làm độc lập vẫn được giữ như hai lượt. Xóa bản khách sau khi toàn bộ hoạt động chờ đã được máy chủ xác nhận. Có thể bỏ qua để giữ khách riêng.

Mất mạng: giữ bản chờ trong bộ nhớ trình duyệt và báo lưu thất bại; bấm **Thử lưu lại** hoặc kết nối lại. Đăng nhập lại cùng tài khoản để gửi tiếp nếu session hết hạn. Bộ nhớ trình duyệt đầy/bị chặn sẽ báo rõ; đừng đóng trang trước khi lưu thành công. Đồng bộ nhiều thiết bị khi đăng nhập/lưu; chưa có cập nhật realtime tự đẩy giữa các tab.

## Âm thanh

Tất cả 30 bài có văn bản phát theo yêu cầu bằng Web Speech API, nút nghe thường/chậm/dừng, báo trạng thái hoặc lỗi, và văn bản đối chiếu. Giọng tiếng Anh phụ thuộc trình duyệt/hệ điều hành, có thể cần cài hoặc tải giọng; thiết bị không có giọng sẽ báo rõ. Không có MP3 thu sẵn hay dịch vụ trả phí bắt buộc. Không phát trực tiếp chuỗi IPA như thể là bản thu âm vị.

Có hướng dẫn khẩu hình cơ bản trong những bài đầu. Bài nghe có văn bản hỗ trợ nên không phải phép đo nghe độc lập nếu mở văn bản. Chưa có thu âm micro, nhận dạng hoặc chấm phát âm. Tham khảo cơ chế [giọng sẵn có của Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices).

## Lưu bền vững trên Render và đồng bộ local

**Khuyến nghị PostgreSQL**: đặt cùng `DATABASE_URL` trên Render và local nếu muốn cùng tài khoản/tiến độ. Không đưa URL chứa mật khẩu vào Git hoặc frontend. Dùng URL/TLS do nhà cung cấp hướng dẫn, không tắt xác minh chứng chỉ trong code. Driver `pg` dùng truy vấn có tham số và transaction.

Local PowerShell:

```powershell
$env:DATABASE_URL = 'chuoi-ket-noi-rieng-cua-ban'
npm.cmd start
```

Các bảng cần thiết được tạo và bổ sung cột còn thiếu khi khởi động. Cần quyền tạo/sửa bảng lần đầu. Không xóa bảng hay đặt lại tiến độ. Không chuyển dữ liệu cũ tự động khi đổi database; xem migration bên dưới. Cơ chế driver: [node-postgres](https://node-postgres.com/features/queries).

Trên Render:

1. Đưa code mới lên GitHub và deploy Web Service Node hiện có.
2. Build Command: `npm ci`; Start Command: `npm start`; Node.js 24.
3. Environment: `NODE_ENV=production`, `DATABASE_URL` tới PostgreSQL bền vững.
4. Nếu Auto-Deploy tắt, dùng Manual Deploy → Deploy latest commit.
5. Nếu chọn SQLite thay PostgreSQL: gắn **persistent disk** thực sự rồi đặt `DATA_DIR` vào thư mục trên disk. Không đặt vào filesystem tạm. `DATA_DIR` chỉ là đường dẫn, tự nó không tạo ổ đĩa bền vững.

Khi production thiếu cả DATABASE_URL lẫn DATA_DIR, đăng ký/đăng nhập API trả thông báo cấu hình thay vì lưu tài khoản vào tệp mặc định tạm; nội dung và chế độ khách vẫn dùng được. Cần tự bảo đảm DATA_DIR trỏ vào disk bền vững. Không tự push hoặc deploy production trong lần nâng cấp này.

Biến môi trường:

| Biến | Mục đích |
|---|---|
| `PORT` | Cổng HTTP, mặc định 3000; Render cung cấp khi chạy |
| `NODE_ENV` | `production` bật cookie Secure và yêu cầu cấu hình lưu trữ |
| `DATABASE_URL` | Kết nối PostgreSQL; ưu tiên hơn SQLite |
| `DATA_DIR` | SQLite local hoặc thư mục disk bền vững |
| `ADMIN_EMAIL` | Email tài khoản được phép dùng mã cấp quyền |
| `ADMIN_SETUP_KEY` | Bí mật từ 32 ký tự, cần cùng ADMIN_EMAIL để cấp quyền từ web |
| `BROWSER_PATH` | Đường dẫn Chrome/Edge cho kiểm thử trình duyệt tùy chọn |

## Cấp admin không cần Shell

1. Đăng ký tài khoản trên web bằng email của bạn.
2. Trong Render Environment, đặt `ADMIN_EMAIL` bằng email đó và `ADMIN_SETUP_KEY` bằng chuỗi ngẫu nhiên bí mật ít nhất 32 ký tự. Có thể sinh khóa trên máy:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

3. Lưu cấu hình và deploy/restart để máy chủ nhận biến mới.
4. Đăng nhập đúng tài khoản → **Tài khoản → Thiết lập quản trị viên** → nhập mã và xác nhận. Chỉ email không đủ cấp quyền vì hiện chưa xác minh chủ sở hữu email.
5. Sau khi cấp thành công, bỏ `ADMIN_SETUP_KEY` trên Render nếu không cần dùng nữa. Quyền đã cấp nằm trong database và được giữ lại.

Không có admin/mật khẩu mặc định. Mã chỉ gửi đến máy chủ, không lưu trên trình duyệt. Cách terminal vẫn có: `node manage-admin.js email-da-dang-ky@example.com`, chạy với cùng DATABASE_URL/DATA_DIR; lệnh thu hồi phiên cũ, cần đăng nhập lại.

## Quản trị

Admin xem/tìm/lọc người học, xem thống kê khóa 30 ngày, khóa/mở tài khoản. Khóa thu hồi phiên ngay; mở khóa giữ tiến độ và yêu cầu đăng nhập lại. Không khóa chính mình hoặc admin khác.

Biên tập: vào **Tài khoản → Biên tập nội dung bài học**, chọn ngày và tải bài, sửa JSON, kiểm tra/xem trước, lưu nháp hoặc xuất bản. JSON gồm bài giảng, từ, hội thoại, câu hỏi, đáp án và lời giải. Mã phải giữ dạng `d1-v1`, `d1-p1`, `d1-t1` tương ứng ngày/phần; nên giữ mã của câu cũ khi chỉ sửa câu chữ. Kiểm tra dữ liệu phía client và server: trường bắt buộc, số câu, mã, lựa chọn/đáp án, IPA, thời lượng. Có version chống ghi đè thay đổi của người biên tập khác. Nháp không hiện cho người học; xuất bản mới có hiệu lực qua `/api/course`. Kiểm tra cấu trúc không thay cho giáo viên duyệt tính tự nhiên và đúng đắn của nội dung.

## Sao lưu và migration an toàn

Trước khi nâng cấp database, sao lưu SQLite nhất quán (gồm WAL), không ghi đè tệp đích:

```powershell
node backup-sqlite.js data/english-lab.sqlite backups/truoc-nang-cap.sqlite
```

Chuyển sang PostgreSQL đã tạo:

```powershell
$env:DATABASE_URL = 'chuoi-ket-noi-rieng-cua-ban'
node migrate-to-postgres.js backups/truoc-nang-cap.sqlite
```

Script nhập tài khoản, mật khẩu băm/salt, vai trò, dữ liệu học cũ/mới và bản nháp/xuất bản. Bỏ qua ID/email đã có, không ghi đè tài khoản đám mây, không xóa nguồn; không tự hợp nhất hai tài khoản cùng email có dữ liệu khác nhau. Không chuyển phiên đăng nhập: đăng nhập lại. Giữ bản sao lưu đến khi kiểm tra đủ tài khoản/tiến độ. PostgreSQL cần cơ chế sao lưu của nhà cung cấp hoặc pg_dump riêng.

## Kiểm tra

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run test:browser
```

- `check`: cú pháp JavaScript; dự án không dùng TypeScript hoặc bundler nên không có bước typecheck/build riêng.
- `test`: kiểm tra nội dung 30 ngày, chấm điểm, chống cộng trùng, lịch ôn, hợp nhất, múi giờ, migration schema SQLite, tài khoản/session, phân quyền, cô lập dữ liệu, khóa/mở, cấp admin và lưu nháp/xuất bản.
- `test:browser`: Chrome/Edge headless với profile/database riêng; kiểm tra mở bài 1/30, F5 giữ khách, đúng/sai, chống bấm trùng, yêu thích/sổ tay, câu sai/ôn, hợp nhất tài khoản, mất mạng/thử lại, sáng tối, 7 màn hình mobile, đăng xuất. Có thể đặt BROWSER_PATH nếu không tìm thấy trình duyệt. Không dùng tài khoản thật.

Đã chạy đạt kiểm tra cú pháp, 8 bài kiểm thử tự động (gồm luồng API tích hợp) và Chrome smoke test. Chưa kiểm thử trên PostgreSQL thật hoặc migration SQLite→PostgreSQL vì không có DATABASE_URL; chưa xác nhận triển khai Render. Chưa kiểm tra Safari/iOS, mọi giọng TTS hoặc âm thanh nghe được trên máy thật. Nội dung đã rà soát khi biên soạn và kiểm tra cấu trúc; chưa có thẩm định độc lập bởi giáo viên.

## Các tệp chính

- `public/curriculum.js`: toàn bộ 30 bài, câu hỏi và validator.
- `public/study-engine.js`: chấm, hợp nhất, lịch ôn và tính tiến độ; dùng chung browser/server.
- `public/course-ui.js`, `public/course.css`: giao diện khóa học, lưu khách, đồng bộ, nghe và biên tập.
- `public/app.js`, `public/index.html`, `public/style.css`: tài khoản, admin và công cụ bảng chữ được giữ/nâng cấp.
- `server.js`, `database.js`: API, session, phân quyền, lưu SQLite/PostgreSQL.
- `CONTENT-REPORT.md`: báo cáo đủ nội dung và trạng thái âm thanh.

Chưa triển khai: quên mật khẩu/xác minh email, thu âm/chấm phát âm, thông báo đẩy lịch ôn, xử lý hợp nhất hai tài khoản trùng email trong migration, đồng bộ realtime. Các mục này không hiển thị như đã hoạt động.
