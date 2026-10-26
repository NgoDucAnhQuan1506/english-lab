# Nghiệm thu English Lab Foundation v2 + method1 + studio1

Ngày 26/10/2026, Windows, Node 24.21.0, npm 11.19.0, Chrome headless có sẵn. Kiểm thử dùng SQLite/profile/tài khoản giả riêng, không thao tác dữ liệu thật. Không push, deploy hoặc gọi dịch vụ trả phí.

## Kết quả chạy thực

| Lệnh | Kết quả |
|---|---|
| `npm.cmd run check` | PASS cú pháp frontend/backend/engine/audio/recorder/service worker |
| `npm.cmd run audit:content` | PASS 42 bài; mọi refs hợp lệ; heuristic token đáp án không tìm ra từ chưa dạy |
| `npm.cmd test` | PASS **36/36**, 0 fail, 0 skipped |
| `npm.cmd run test:browser` | PASS **42 nhóm E2E**, không có exception JavaScript không xử lý |
| `npm.cmd run check:secrets` | Heuristic không có phát hiện trong frontend, 62 tệp tracked và 8 commit Git; không phải security audit toàn diện |
| `npm.cmd ls --depth=0` | PASS; chỉ `pg@8.23.1`, không thêm dependency |
| `git diff --check` | PASS; chỉ cảnh báo chính sách đổi LF/CRLF của Git trên Windows |

Bằng chứng máy đọc: [artifacts/unit-results.tap](artifacts/unit-results.tap), [artifacts/browser-results.json](artifacts/browser-results.json), [artifacts/secret-scan.json](artifacts/secret-scan.json). Các lần thử thất bại cũ trong browser-failure.json đã có `resolvedByRun`; kết quả cuối nằm ở browser-results.json. Ghi thời điểm JSON theo UTC; ngày báo cáo dùng Asia/Bangkok.

## Ma trận luồng bắt buộc

| Luồng | Cách đã thực hiện / kết quả |
|---|---|
| Người mới học hết bài 1 | Mở bài, bị chặn kiểm tra khi chưa luyện, đi qua lựa chọn/nhập/kiểm tra/tổng kết; làm lượt mới độc lập đạt bài — PASS |
| Tiếp tục bài dở | Nhập dở `f`, F5 giữ đúng câu/bước; đóng hẳn target/tab rồi mở tab mới cùng profile vẫn giữ — PASS |
| Trả lời sai và sửa | Chọn sai, thấy đáp án/lý do ngay cạnh câu; không ghi thêm khi bấm trùng; có lượt thử lại — PASS |
| Mở hỗ trợ và tính điểm | Mở văn bản nghe trước trả lời, ghi assisted; hoàn thành lượt có hỗ trợ/sai chưa đạt; lượt độc lập đạt — PASS |
| Bài mẫu câu | Học hết bài 20, bấm các mảnh từ theo thứ tự, nhập/kiểm tra và tổng kết — PASS |
| Bàn phím | Nhập bằng Input.insertText, Enter gửi; Tab có focus nhìn thấy — PASS |
| Sổ tay | Lưu apple ở bài 7, tìm trong mục đã lưu, thấy nghĩa/câu; lưu từ có lịch nhớ lại — PASS |
| Hội thoại | Bật/tắt dịch, chọn vai A/B, tự nói trước khi mở câu mẫu — PASS |
| Đăng nhập/hợp nhất | Tài khoản mới trống trước hợp nhất; chuyển cả sự kiện khóa mới/cũ, UUID không cộng trùng — PASS |
| Đổi tài khoản | Tài khoản thứ hai không nhận dữ liệu tài khoản thứ nhất; quay lại đúng tài khoản gửi hàng chờ — PASS |
| Mất mạng/kết nối lại | Thay đổi lưu trong pending, báo thất bại; retry sau online chỉ báo lưu khi API xác nhận — PASS |
| F5 khi offline | Service worker mở lại khóa công khai và draft khách; cache không chứa API tài khoản — PASS |
| Hết phiên | Cho session hết hạn trong DB test, hoạt động mới vẫn nằm trong pending; đăng nhập lại đồng bộ — PASS |
| Nhiều tab | Hai tab thật ghi hoạt động và nhận thay đổi storage; engine hợp hai khoảng 30 giây trùng thành 30 giây — PASS |
| Thiếu giọng | getVoices rỗng có hướng dẫn; chuỗi tên A là “The letter A.”, rời bài dừng — PASS phần mềm, chưa nghe giọng thật |
| Từ chối microphone | getUserMedia trả NotAllowedError, bài vẫn dùng được — PASS |
| Ghi/đọc lại/xóa | MediaRecorder thật với AudioContext stream tổng hợp, play được Blob, tracks ended sau stop, mẫu đọc dừng playback, xóa URL — PASS; không thử microphone vật lý |
| Xuất/nhập | JSON được download trong thư mục test riêng, dùng DOM file picker nhập lại không cộng trùng; sai định dạng bị từ chối — PASS |
| Khóa cũ | Mở 30 bài/lịch sử riêng, không tính sang khóa mới; bản published công khai cuối cùng còn khi offline — PASS |
| Máy chủ tự chấm | Gửi correct=true với đáp án sai vẫn trả false; tái sử dụng event ID giữ bản server; sai course/day bị từ chối — PASS |
| Migration/sao lưu SQLite | Tạo schema trước role/study, khởi động nâng cấp giữ tiến độ, backup VACUUM INTO và đọc lại — PASS |
| Admin/editor | Cấp quyền bằng email+secret, list/khóa/mở/cô lập API, draft/preview/publish khóa cũ; chặn đổi nghĩa ID câu — PASS |
| Quay lại an toàn | COURSE_EDITION=legacy-v1 hiển thị khóa cũ, dữ liệu Foundation còn; bỏ chế độ và chọn lại khóa mới — PASS local |
| Đủ 42 bộ bổ sung | Mở mục tiêu bài, nhiệm vụ cá nhân của từng bài và bảy nhiệm vụ tổng hợp; khởi động nghe có nút phát — PASS |
| Vận dụng sau hỗ trợ | Nhóm có hỗ trợ chưa đạt; lượt mới đổi ID/dữ kiện; F5 giữ nhóm; nhóm khác đúng độc lập đạt — PASS |
| Lặp đáp án vừa được sửa | Engine không tính cùng câu trong 24 giờ sau sai/hỗ trợ, chấp nhận nhóm khác hoặc cùng câu sau nghỉ — PASS |
| Phần dở mới | Nhập dở ở phần 7 giữ sau F5; Hôm nay đưa về đúng câu dù bài đã đạt kiểm tra mẫu — PASS |
| Mốc nhớ lại | Cùng ngày bị khóa; ba nhóm làm một buổi không đủ ba mốc; giả lập 1/3/7 ngày đúng thứ tự mới đạt — PASS quy tắc phần mềm |
| Trở lại muộn | Import fixture ngày lịch sử, Hôm nay chọn mốc đến hạn; hoàn thành hiển thị sau 8 ngày thực trong fixture — PASS, không phải thử người học thật |
| Tự đối chiếu mới | Thiếu bài viết/tiêu chí không xác nhận; xác nhận đủ vẫn không thành bằng chứng nhớ lại — PASS |
| Catalog xưởng | Đủ 14 tình huống/56 bước; refs trước bài cuối chặng; browser mở từng tình huống với mẫu ẩn — PASS |
| Đi hết một tình huống | Ghi câu, mở mẫu, đối chiếu bốn bước; 10 phút dừng sau ba bước, tiếp tục buổi nữa; không tăng bài đạt — PASS |
| Draft và lượt studio | F5 giữ lời đáp, mẫu ẩn/hiện và bước; export/import giữ notes và UUID; đổi tình huống thay dữ kiện — PASS |
| Nhật ký studio | Tạo lượt mới giữ lượt cũ và ghi chú riêng, nhật ký có trạng thái từng bước — PASS |
| Ôn biến thể | Engine chọn cùng refs, không vượt bài của câu gốc, tránh trùng nội dung trong buổi; sau hai câu ôn liên quan đúng độc lập quay lại câu gốc — PASS |
| Ôn qua F5 | Giữ chính xác hàng/câu dở và mode ôn; câu đã trả lời hiển thị kết quả, không gửi lại — PASS |
| Studio offline | Đánh dấu cần luyện khi offline giữ pending; online retry chỉ gửi trạng thái, server không lưu trường lời đáp/điểm — PASS |
| Nháp hai tài khoản | Nháp tài khoản một trống ở tài khoản hai; trở lại tài khoản một giữ đúng ghi chú — PASS |
| API studio | Từ chối scene/turn/course/run/value sai; tự xác định ngày bài; bỏ response text và claimed grade — PASS |

## Nội dung và kiểm tra thủ công

- Đọc/biên tập từng bài, ví dụ, nghĩa, quy tắc và phương án nhiễu; chi tiết quyết định từng bài tại [CONTENT-AUDIT.md](CONTENT-AUDIT.md). Không coi việc sinh thêm câu là bằng chứng dạy tốt.
- Khóa có 42 bài, 172 câu luyện, 133 câu kiểm tra, 153 thẻ theo ngữ cảnh. Đây là mô tả phạm vi, không chỉ số hiệu quả học tập.
- Chạy một lượt độc lập qua tất cả 305 câu trong engine đạt đủ 42 bài; kiểm tra mảnh từ không tạo câu bất khả thi, ID không trùng khóa cũ.
- Bản đồ toàn bộ kiểm tra ở [CONTENT-MAP.md](CONTENT-MAP.md); biến thể I am/I’m, phủ định be, do not/don’t, I would like/I’d like được kiểm tra theo phần đã dạy. Câu mở không bị chấm bằng một câu mẫu cứng.
- Bài kiểm tra chỉ lấy mẫu nội dung. Không khẳng định người học đã nghe đúng mọi chữ/từ chỉ vì đạt một bài. Thống kê kỹ năng có số câu khác nhau, tránh lấy lặp một câu làm nhiều bằng chứng.
- Method1 bổ sung hướng dẫn, lỗi/cách sửa, nhiệm vụ/mẫu/tiêu chí cho cả 42 bài; 280 câu vận dụng đăng ký và 252 câu nhớ lại, gồm biến thể và nội dung dùng lại có chủ đích. Không dùng số câu làm chỉ số hiệu quả. [COURSE-METHOD-REPORT.md](COURSE-METHOD-REPORT.md) ghi các quyết định biên tập, [METHOD-CONTENT-MAP.md](METHOD-CONTENT-MAP.md) có ID/nguồn từng câu mới.
- Kiểm thử engine đi hết mọi nhóm vận dụng của mọi bài và ba mốc bằng timestamp giả lập. Điểm cũ không tự chuyển thành bằng chứng mới; câu giờ giữ dấu hai chấm có ý nghĩa, chấp nhận 08:30 nhưng từ chối 83:0. Các kiểm thử này không chứng minh nhớ sau nhiều ngày ngoài đời.
- Studio1 có 14 tình huống/56 bước tự nói–viết, được rà và truy nguồn ở [STUDIO-CONTENT-MAP.md](STUDIO-CONTENT-MAP.md). [BIG-UPDATE-REPORT.md](BIG-UPDATE-REPORT.md) ghi trước/sau, cách chọn biến thể, lưu dữ liệu và giới hạn. Trạng thái checked/retry chỉ là tự đối chiếu; không có điểm câu mở/phát âm.

## Giao diện đã xem và sửa

Chrome kiểm tra **360, 390, 768, 1280, 1440px**, gồm Hôm nay/lộ trình/sổ tay/ôn/tiến độ/tài khoản/công cụ bảng chữ, thẻ chữ và phần nghe. Không có cuộn ngang ở các ca đã chạy. Tất cả button hiển thị ở bảy màn hình đã kiểm tra có vùng ít nhất xấp xỉ 44×44px. Kiểm tra reduced motion và keyboard focus đạt.

Đã xem ảnh thực tại cả năm độ rộng cho Hôm nay và bảng chữ; xem thêm phản hồi sai, xếp câu, hội thoại, tiến độ desktop/mobile và chế độ tối. Sau xem ảnh đã sửa status audio nổi che chữ, trạng thái audio cũ, nút loa cũ quá hẹp, khoảng trống mobile, font tiêu đề tiếng Việt, màu phản hồi/chỉ rõ câu đã chọn. Màn học mobile gom điều hướng và có nút về lộ trình; nội dung học cỡ 17px.

Ảnh tiêu biểu:

- [Hôm nay desktop](artifacts/screenshots/today-1440.png), [Hôm nay 390px](artifacts/screenshots/today-390.png).
- [Bảng chữ 360px](artifacts/screenshots/alphabet-360.png), [bảng chữ 768px](artifacts/screenshots/alphabet-768.png).
- [Phản hồi câu sai](artifacts/screenshots/wrong-answer-desktop.png), [xếp câu 390px](artifacts/screenshots/sentence-practice-390.png).
- [Hội thoại 390px](artifacts/screenshots/dialogue-390.png), [tiến độ desktop](artifacts/screenshots/progress-1440.png), [chế độ tối](artifacts/screenshots/today-dark.png).
- Đã xem phần bổ sung: [hướng dẫn bài 1 ở 390px](artifacts/screenshots/method-coaching-390.png), [bằng chứng và nhiệm vụ bài 20](artifacts/screenshots/method-evidence-390.png), [tiến độ có mốc sau nghỉ](artifacts/screenshots/method-progress-1280.png), [mốc chưa đến hạn](artifacts/screenshots/method-return-locked.png). Dữ liệu ngày trong ảnh là fixture kiểm thử.
- Xưởng đã chạy kiểm tra overflow ở năm độ rộng và xem ảnh: [360px](artifacts/screenshots/studio-360.png), [390px](artifacts/screenshots/studio-390.png), [768px](artifacts/screenshots/studio-768.png), [1280px](artifacts/screenshots/studio-1280.png), [1440px](artifacts/screenshots/studio-1440.png), [tổng kết](artifacts/screenshots/studio-summary-1280.png). Sau xem ảnh đã thu phần lưu/quyền riêng tư vào mục mở rộng, giữ nhiệm vụ chính gần đầu trang và giảm đoạn thông báo lặp.

## Blocker và phần chưa xác minh

| Phần | Tình trạng cụ thể / cách kiểm tra tiếp |
|---|---|
| PostgreSQL thật, migration SQLite→PostgreSQL thật | **BLOCKED môi trường**: không có DATABASE_URL test độc lập; không dùng production thay thế. Cần database test riêng, chạy migration từ snapshot, đối chiếu tài khoản/study/lesson và retry đồng thời. SQLite regression đã đạt. |
| Render production | **Chưa triển khai theo yêu cầu**. Hướng dẫn cập nhật và rollback ở OPERATIONS.md, gồm chế độ tương thích đã thử local. Không khẳng định deploy thành công. |
| Âm thanh/thiết bị thật | Speech adapter được mô phỏng để kiểm tra chuỗi/trạng thái. MediaRecorder dùng stream thật tổng hợp. Cần nghe tên chữ và từ trên thiết bị đích, thử mic vật lý; chưa xác nhận chất lượng từng giọng. |
| Safari/iOS/Android thật | Chưa có thiết bị/trình duyệt đó trong môi trường. 5 viewport ở Chrome không thay kiểm tra trên thiết bị thật. |
| Giáo viên và người học sau nhiều ngày | Chưa có thẩm định độc lập hoặc nghiên cứu ghi nhớ. Nội dung/mẫu đã rà soát nội bộ, lịch ôn là quy tắc minh bạch. Danh sách cần giáo viên nằm trong CONTENT-AUDIT.md. |
| Bộ nhớ trình duyệt đầy/chặn hoàn toàn | Có thông báo và giữ bản raw lỗi để xuất phục hồi, nhưng chưa mô phỏng quota/full-storage trong browser suite. Không coi đây là kiểm thử đã thực hiện. |

Phạm vi triển khai/kiểm tra local đã hoàn tất; các giới hạn trên vẫn phải được xác minh trước khi công bố bảo đảm vận hành trên những môi trường đó. Không có điểm phát âm giả, chatbot/API AI bắt buộc, leaderboard, shop hoặc màn hình hứa tính năng chưa có.
