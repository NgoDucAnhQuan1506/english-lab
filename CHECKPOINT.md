# Checkpoint English Lab

## Trạng thái
**Hoàn thành vòng studio1 local 26/10/2026:** BIG-UPDATE-PLAN và BIG-UPDATE-REPORT ghi phạm vi/kết quả. Đã triển khai scenarios.js (14 tình huống/56 bước), review-coach.js, engine/API studio, lưu nháp/nhật ký riêng và UI. Syntax/content audit PASS, 36/36 tests và 42 nhóm E2E PASS, 0 exception. Đã xem ảnh mới đủ 360/390/768/1280/1440 + tổng kết. Giữ mọi diff method1 trước đó; không commit/push/deploy, không dùng dữ liệu thật để test.

**Lịch sử vòng method1:** Foundation v2 đủ 42 bộ hướng dẫn/sửa lỗi/nhiệm vụ, nhóm đổi tình huống và mốc nhớ lại sau nghỉ. Khảo sát đầu vòng tại HEAD `dac267f`, Git sạch; baseline 19 tests/26 nhóm E2E của vòng trước. Vòng method1 kết thúc 29 tests/33 nhóm E2E, hiện đã mở rộng như trên.

Xem COURSE-QUALITY-PLAN.md, COURSE-METHOD-REPORT.md, ACCEPTANCE-REPORT.md. Phần mềm và biên tập nội bộ đã hoàn thành phạm vi vòng này; chưa có giáo viên độc lập hoặc theo dõi người học thật sau nhiều ngày. TEACHER-PILOT.md có bộ hướng dẫn/phiếu ghi để thực hiện, không phải báo cáo pilot đã chạy.

## Cách tiếp tục sau ngắt
1. Đọc checkpoint/worklog/plan, `git status --short`, kiểm tra diff thực tế trước khi sửa.
2. Không ghi đè thay đổi đang có; không reset/clean, không xóa data/.
3. Chạy `npm.cmd run check`, `npm.cmd test`, `npm.cmd run test:browser` (Chrome/Edge headless có sẵn).
4. Phạm vi local đã xong; nếu có yêu cầu mới, bắt đầu từ diff/bằng chứng hiện có. Không lặp lại khảo sát hoặc viết lại phần đã đạt chỉ vì phiên bị ngắt.

## Chạy ứng dụng
Node >=22.13; `npm.cmd start`, http://localhost:3000. Test dùng database riêng trong thư mục tạm. Không dùng data thật để test.

## Bằng chứng và tệp đang dùng
- UI mới: public/foundation-ui.js; index không tải course-ui.js cũ. Nội dung gốc public/foundation.js, bổ sung public/course-method.js (browser CourseMethod và server require), catalog public/scenarios.js, chọn ôn public/review-coach.js; engine dùng chung browser/server.
- `npm.cmd run check`, `npm.cmd run audit:content`, `npm.cmd test`, `npm.cmd run test:browser`, `npm.cmd run check:secrets` đều đã chạy đạt; `npm.cmd ls --depth=0` chỉ pg@8.23.1.
- artifacts/browser-results.json: 42 nhóm PASS, 0 exception. artifacts/screenshots có ảnh thực đủ 5 độ rộng, màn method/studio và tổng kết đã xem. browser-failure.json giữ lần lỗi khảo sát test cũ, đã có resolvedByRun. artifacts/unit-results.tap là log 36 tests mới.
- CONTENT-AUDIT.md và COURSE-METHOD-REPORT.md: rà từng bài và cần giáo viên; CONTENT-MAP.md: kiểm tra gốc; METHOD-CONTENT-MAP.md: mọi ID method1; OPERATIONS.md: chạy/sao lưu/Render/rollback. Không có migration phá hủy.
- 305 câu luyện/kiểm tra Foundation cũ giữ nguyên ID/ý nghĩa, thêm 280 câu vận dụng đăng ký và 252 câu mốc nhớ lại. Bài 1–4 một nhóm đủ chữ, bài 5–42 ba nhóm hai câu. ID mới f2-method1-*; không chuyển điểm cũ. Nhóm lựa chọn lưu trong drafts theo run để F5/xuất nhập giữ đúng nhóm.
- Câu vừa sai hoặc mở hỗ trợ cần cách 24 giờ mới tính độc lập cùng câu; có thể thử nhóm khác ngay. Ba mốc sớm nhất +1/+3/+7 và cách nhau ≥24 giờ. Tests dùng timestamp giả, không coi là hiệu quả học tập thật. Chỉ self-reflection rubric method1 tính vào tiêu chí mới; bản cũ giữ riêng.
- Studio: ID studio1-s1a..s7b, bước t1..t4. Event type studio chỉ lưu mã bước/run/checked-retry/assisted, server bỏ lời đáp và claimed grade. Không làm tăng bài đạt/câu đúng hoặc method evidence. Lời đáp/checklist/queue ôn nằm trong drafts riêng từng danh tính, export/import giữ; runs key foundation-v2:studio:studio1-sNa. Nhật ký hiển thị 10 lượt gần nhất, dữ liệu toàn bộ vẫn trong backup.
- Ôn chọn biến thể cùng refs không vượt ngày bài của câu gốc, tránh trùng/vừa gặp, trở lại gốc sau hai câu ôn liên quan đúng độc lập. Đúng biến thể không xóa lỗi gốc. Hàng/index/mode/run và draft giữ qua F5, câu đã trả lời không gửi lại; Tạo buổi ôn mới để lấy hàng mới.
- Giữ `data/` thật; test dùng database/profile tạm riêng. Các thay đổi chưa commit/push.

## Chưa xác minh ngoài môi trường local
- PostgreSQL/migration thật: thiếu DATABASE_URL test độc lập; blocker được ghi rõ. Render chưa deploy theo yêu cầu.
- Chưa có giáo viên độc lập, thử nhớ sau nhiều ngày, Safari/iOS/Android thật, giọng đọc nghe được/microphone vật lý, mô phỏng quota localStorage đầy.
- Speech adapter mô phỏng; MediaRecorder và playback dùng stream tổng hợp thật. Không gọi đó là kiểm tra phát âm hoặc mic vật lý.
- CACHE hiện englishlab-public-foundation-v2-studio1; tăng khi phát hành thay đổi tiếp. COURSE_EDITION=legacy-v1 quay về khóa cũ trên build mới, vẫn hiểu mọi ID/event mới. Không rollback sang server chưa hiểu method1/studio rồi cho ghi lại tiến độ mới.
