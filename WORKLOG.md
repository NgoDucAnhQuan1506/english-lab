# Nhật ký nâng cấp

## 25/10/2026 — giai đoạn 1
- Đọc README, CONTENT-REPORT, package.json, frontend, engine, API, database, test và browser runner; kiểm tra Git/các AGENTS.md.
- Xác nhận chưa có Foundation v2; chọn bổ sung phiên bản, giữ nguyên nội dung và ID khóa 30 bài.
- `npm.cmd run check`: PASS.
- `npm.cmd test`: PASS 8/8.
- `npm.cmd run test:browser`: Chrome PASS; runner tạo database/profile tạm. Ảnh baseline ở thư mục tạm `english-course-browser-vg2Ojx`.
- Điểm cần sửa: 30 bài chưa đúng lộ trình yêu cầu; view không giữ câu nhập; mở văn bản nghe chưa ghi hỗ trợ; ôn luôn lấy mục đầu; audio cũ và mới chưa dùng chung; chưa có ghi âm/xuất nhập; mặc định tối; ID sự kiện chưa có phiên bản khóa.

## 26/10/2026 — giai đoạn 2–4
- Biên soạn Foundation v2 đủ 42 bài/7 chặng, mã f2-lN-pN/tN/vN; giữ nguyên curriculum.js khóa 30 bài.
- Mỗi bài có mục tiêu hành động, tiên quyết, ôn, concept giải thích tiếng Việt, làm mẫu từng bước, luyện/kiểm tra, nhiệm vụ tự đối chiếu, lời giải và kế hoạch ôn. Mọi câu có refs truy nguyên nơi dạy.
- Engine lọc lịch sử theo khóa; tự chấm lại đáp án; tách hỗ trợ, hoàn thành lượt và đạt; phiên 10/20/30 có ngân sách 3/6/9 câu, 3/6/10 mục ôn, 3/5/8 thẻ. Ôn hàng hữu hạn, xáo vị trí đáp án.
- UI mới lưu cursor, run, draft và hỗ trợ vào bộ nhớ từng danh tính. Khách hợp nhất có chủ ý; UUID chống trùng. Export/import JSON. Khóa cũ có nút xem và lịch sử riêng.
- Audio chung cho cả công cụ cũ/mới, nhãn The letter A, không đọc IPA, dừng/chậm/phát lại; optional registry bản thu phải có quyền. Microphone mở theo nút, MediaRecorder và object URL cục bộ; nghe lại/xóa/tải, tắt tracks, không upload/điểm giả.
- Không thêm dependency/framework.
- `npm.cmd test`: PASS 16/16, gồm 8 regression cũ + 8 nhóm Foundation.
- Browser đầu tiên dừng ở stub speech không phải SpeechSynthesisVoice thật. Sửa test adapter bằng SpeechSynthesisUtterance giả cho phép quan sát chuỗi đọc; không gọi đó là kiểm tra chất lượng nghe thật.
- Browser lần tiếp: PASS 19 nhóm, gồm 42 bài mở được, học hết bài 1/20, F5 nhập dở, hỗ trợ, 10 phút thực giảm câu, mic từ chối/ghi bằng stream tổng hợp, export/import, khóa cũ, guest merge, offline retry, hết phiên/đổi tài khoản, 5 kích thước, theme, admin/editor. Không có exception không xử lý.

## 26/10/2026 — giai đoạn 5, đang sửa sau xem ảnh
- Đã xem ảnh today-1280, today-360, alphabet-390. Thẻ rõ, không cuộn ngang; thấy status âm thanh còn cũ và sticky che nội dung.
- Sửa stop(quiet) xóa status; status toàn cục không sticky; từng cụm audio có feedback gần nút. Ẩn hai nút điều hướng trùng ở thanh tài khoản để màn hình nhỏ gọn hơn.
- Rà nội dung lần hai: bỏ phương án ninety chưa dạy ở bài 14; dạy students ngay bài 21 trước kiểm tra; giải thích I do not understand cùng mẫu don’t ngay bài 29.
- Tra tài liệu Render chính thức (deploys/rollbacks) cho bàn giao. Cambridge trả 403 khi mở từng trang phát âm; không giả vờ đã nghe hoặc đối chiếu toàn bộ nguồn. Ghi giới hạn trong audit.

## 26/10/2026 — giai đoạn 5–6 hoàn tất local
- Sửa cách cộng thời gian từ giới hạn 60 giây/phút thành hợp các khoảng thật. Ví dụ ba khoảng 30 giây kết thúc cách nhau 1 giây là 32 giây, hai khoảng trùng hoàn toàn là 30 giây. Sửa assertion baseline cũ (60) để phản ánh lỗi đã khắc phục, thêm case qua ranh giới phút; không nới test để chấp nhận sai.
- Lượt ôn mang context riêng, không thay kiểm tra cuối bài. Tách số lượt khỏi số câu khác nhau trong kỹ năng; lưu từ đặt lịch ôn ban đầu. Thêm biến thể viết gọn chỉ sau phần đã dạy; giữ ràng buộc chữ thường/viết gọn riêng.
- Bổ sung bảo vệ bản localStorage lỗi không ghi đè, xuất raw phục hồi; hợp nhất không xóa khách nếu tab khác còn dữ liệu mới. API editor khóa nghĩa ID cũ, giữ sửa biên tập không đổi nghĩa.
- Cache public shell và nội dung published khóa cũ để F5 offline; không cache API tài khoản. Cache release r2. Thêm COURSE_EDITION=legacy-v1 để quay về UI khóa cũ với engine vẫn hiểu Foundation.
- Vòng browser mở rộng phát hiện: download giữ tên tệp cũ từ lần trước, cross-tab cần đợi lan truyền storage, AudioContext test chưa resume nên Blob chưa phát được, nút loa công cụ cũ rộng <44px. Sửa fixture download theo run, đồng bộ chờ có điều kiện, resume nguồn âm tổng hợp và sửa kích thước nút thật.
- Đã kiểm tra play bản ghi thật trong browser bằng stream tổng hợp; khi nghe mẫu dừng playback và khi playback dừng TTS. Có báo lỗi bản ghi không phát được. Không nói là đã kiểm tra microphone vật lý.
- Đã xem ảnh ở 360/390/768/1280/1440 cùng ảnh feedback/xếp câu/hội thoại/tiến độ/tối. Sửa font tiêu đề Việt, chỉ rõ đáp án vừa chọn và tô viền, giữ audio phát lại sau trả lời, gom điều hướng khi học trên mobile.
- Cuối vòng: syntax PASS; content audit PASS 42 bài, refs đầy đủ, không có token đáp án chưa dạy theo heuristic; 19/19 tests PASS; 26 nhóm E2E PASS, 0 browser exceptions. Secrets heuristic PASS frontend/21 tracked files/7 commit, không có credential phát hiện. `npm ls` chỉ pg@8.23.1.
- Bàn giao README mới, bản README cũ lưu riêng; CONTENT-AUDIT, CONTENT-MAP, ACCEPTANCE-REPORT, OPERATIONS. PostgreSQL/Render/thiết bị thật/giáo viên được ghi đúng là chưa xác minh.
- Không thêm dependency, không push/deploy, không xóa dữ liệu thật. Mọi tài khoản/DB dùng trong tests là fixture riêng.
