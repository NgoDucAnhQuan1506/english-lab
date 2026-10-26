# English Lab — Foundation v2

Khóa tiếng Anh cho người Việt trưởng thành bắt đầu từ bảng chữ cái: **42 bài, 7 chặng**, có hướng dẫn tiếng Việt, mẫu từng bước, luyện tập, nghe/nói, vận dụng và lịch ôn. Một bài có thể học qua nhiều buổi. Kết quả kiểm tra trong ứng dụng không phải chứng nhận CEFR hoặc điểm phát âm.

## Chạy trên máy

Node.js **22.13+**, đã kiểm tra bằng Node 24.21.0. Không có bước build hoặc API key bắt buộc.

```powershell
npm.cmd ci
npm.cmd start
```

Mở **http://localhost:3000**. macOS/Linux dùng `npm ci`, `npm start`. SQLite tự tạo trong `data/` (không nằm trong Git). `npm start` không tự nạp `.env`; cấu hình bằng biến môi trường PowerShell hoặc Render. Không cần dependency mới so với phiên bản cũ.

## Cách học

1. **Hôm nay** đề xuất bắt đầu A–F, tiếp tục bài đang dở, học bài tiếp theo hoặc ôn ngắn có lý do từ kết quả thật.
2. Chọn **10/20/30 phút**: khối lượng tương ứng tối đa 3/6/9 câu trong một phần thực hành, 3/6/10 mục ôn, 3/5/8 thẻ mỗi nhóm. Đây là gợi ý khối lượng, không bộ đếm bắt buộc. Có thể tiếp tục buổi nữa.
3. Mỗi bài có phần hiểu bài, thẻ chữ/từ, nghe/nói, tự luyện, kiểm tra và tổng kết. Bảng chữ có chữ hoa–thường, nghe tên, ghép, nghe/chọn/nhập và công cụ đánh vần tên. Mẫu câu có mảnh từ bấm được hoặc nhập bằng bàn phím. Hội thoại nghe từng lượt, ẩn/hiện dịch và luyện hai vai; thay thông tin qua nhiệm vụ tự đối chiếu.
4. Mở gợi ý/văn bản nghe ghi **có hỗ trợ**, không tính như câu đúng độc lập. Câu cá nhân/phần nói dùng checklist, không tự chấm cứng.
5. **Đạt bài**: cùng lượt làm đủ luyện + kiểm tra; đúng độc lập ít nhất `ceil(75% câu luyện)` và `ceil(2/3 câu kiểm tra)`. Hoàn thành lượt khác đạt bài. Mở bài chỉ là đã xem. Lượt ôn không thay kiểm tra cuối bài.
6. Ôn ưu tiên đến hạn/câu sai; hàng hữu hạn, xáo lựa chọn. Lịch nhớ tốt 1–3–7–14 ngày, chưa nhớ về 1 ngày. Sổ tay tìm từ/nghĩa, lưu từ và tự nhớ trong câu. Tự đánh giá tách khỏi điểm; tiến độ hiện số lượt và số câu khác nhau, không kết luận mạnh từ ít mẫu.

## Dữ liệu và khóa cũ

- Khách lưu tại trình duyệt. **F5 và đóng/mở tab giữ bước, câu nhập dở và hỗ trợ đã mở**. Xóa dữ liệu trình duyệt có thể mất khách nếu chưa sao lưu.
- Tài khoản lưu sự kiện vào SQLite/PostgreSQL. Máy chủ tự chấm từ đáp án, UUID chống cộng trùng. Bản nháp câu nhập/checklist lưu riêng trên thiết bị; xuất bản sao để chuyển bản nháp sang máy khác.
- Đăng nhập không ghi đè khách; Hôm nay có **Hợp nhất vào tài khoản**. Chỉ bỏ bản khách khi đã xác nhận lưu thành công và không có thay đổi khách mới chưa hợp nhất. Mất mạng/hết phiên giữ hàng chờ, không báo đã đồng bộ. Đổi tài khoản dùng bộ nhớ riêng.
- **Tài khoản → Bản sao tiến độ** xuất/nhập JSON cho cả hai khóa và bản nháp; nhập hợp nhất theo mã, không xóa lịch sử hiện có. Chỉ nhập bản sao tin cậy. Công cụ bảng chữ cũ có bộ tiến độ riêng, chưa nằm trong định dạng xuất sự kiện khóa học này.
- **Tài khoản → Xem khóa cũ và lịch sử** giữ khóa 30 bài/ID `dN-*`. Khóa mới dùng `foundation-v2`, ID `f2-lN-*`; không tái diễn giải điểm cũ thành điểm khóa mới.
- Thời gian học là hợp các khoảng đang hoạt động: hai tab cùng 30 giây chỉ cộng 30 giây. Chỉ ghi ở bài học có focus và tương tác gần đây; không phải đồng hồ đo mọi phút học ngoài ứng dụng.
- Service worker chỉ cache nội dung công khai, không cache API/tài khoản/ghi âm. Sau lần tải online hoàn chỉnh có thể F5 offline để học bản đã tải. Tài khoản cần kết nối để xác nhận danh tính; bản chờ vẫn được giữ riêng để đăng nhập lại.

## Nghe và ghi âm

Giọng tiếng Anh dùng Web Speech API của thiết bị, ưu tiên en-US; thiếu giọng có thông báo và văn bản hỗ trợ. Tên chữ dùng nhãn “The letter A.” để tránh A bị đọc như mạo từ. Không phát trực tiếp IPA. Có nghe/chậm/phát lại/dừng, không phát chồng với bản ghi, dừng khi rời phần học. Có registry để thêm bản thu có quyền sử dụng; hiện chưa có MP3 bên ngoài.

Microphone chỉ xin quyền khi bấm ghi; có nghe lại, ghi lại, xóa và tải xuống. Bản ghi tạm trong tab, tối đa 60 giây, không upload. Rời phần học sẽ tắt microphone/xóa bản tạm. Chưa có chấm phát âm. Chất lượng thực tế của từng giọng/thiết bị cần kiểm tra thêm.

## Kiểm tra và bằng chứng

```powershell
npm.cmd run check
npm.cmd run audit:content
npm.cmd test
npm.cmd run test:browser
```

Browser test dùng Chrome/Edge headless, database/profile riêng; có thể đặt `BROWSER_PATH`. Không dùng dữ liệu thật. Kết quả thực và giới hạn nằm ở [ACCEPTANCE-REPORT.md](ACCEPTANCE-REPORT.md), JSON tại `artifacts/browser-results.json`, ảnh ở `artifacts/screenshots/`.

Đọc [CONTENT-AUDIT.md](CONTENT-AUDIT.md) để xem rà soát từng bài/phần cần giáo viên; [CONTENT-MAP.md](CONTENT-MAP.md) để truy nguyên tất cả câu kiểm tra. [CONTENT-REPORT.md](CONTENT-REPORT.md) và [LEGACY-README.md](LEGACY-README.md) là tài liệu lưu trữ khóa cũ.

## Tệp chính và vận hành

| Tệp | Trách nhiệm |
|---|---|
| `public/foundation.js` | 42 bài, mẫu, concept, đáp án hợp lệ và validator |
| `public/study-engine.js` | Chấm, phiên bản, tiến độ, lịch ôn, khối lượng buổi và thời gian |
| `public/foundation-ui.js` | Học, lưu khách/tài khoản, bản nháp, sổ tay, xuất/nhập |
| `public/audio.js`, `public/recorder.js` | Audio chung và ghi âm cục bộ |
| `public/index.html`, `public/course.css`, `public/sw.js` | Giao diện, tokens, cache công khai |
| `public/app.js`, `public/curriculum.js` | Tài khoản/admin/công cụ cũ và khóa 30 bài |
| `server.js`, `database.js` | API, phân quyền, session, SQLite/PostgreSQL |
| `foundation.test.js`, `study.test.js`, `server.test.js`, `browser-foundation.cjs` | Engine/nội dung/API/migration/E2E |

[OPERATIONS.md](OPERATIONS.md) có biến môi trường, sao lưu, migration, cập nhật Render và quay lại an toàn. `COURSE_EDITION=legacy-v1` mở chế độ tương thích khóa cũ mà vẫn giữ engine hiểu dữ liệu mới. Mặc định không cần biến này. Không tự push hoặc deploy trong phiên nâng cấp.

Các giới hạn còn lại: PostgreSQL thật/Render chưa có môi trường kiểm tra độc lập; chưa kiểm tra Safari/iOS, giọng nghe được/microphone thật; chưa có giáo viên độc lập; chưa có quên mật khẩu/xác minh email hay chấm phát âm. Khóa cốt lõi không phụ thuộc dịch vụ AI hoặc trả phí.
