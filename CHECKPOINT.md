# Checkpoint English Lab

## Trạng thái
Giai đoạn 1–6 hoàn tất trong môi trường local. Foundation v2 đủ 42 bài, ID riêng; khóa 30 bài vẫn nguyên. 19/19 tests và 26 nhóm E2E đạt. Chưa push/deploy. Xem ACCEPTANCE-REPORT.md cho bằng chứng và phần chưa xác minh.

## Cách tiếp tục sau ngắt
1. Đọc checkpoint/worklog/plan, `git status --short`, kiểm tra diff thực tế trước khi sửa.
2. Không ghi đè thay đổi đang có; không reset/clean, không xóa data/.
3. Chạy `npm.cmd run check`, `npm.cmd test`, `npm.cmd run test:browser` (Chrome/Edge headless có sẵn).
4. Phạm vi local đã xong; nếu có yêu cầu mới, bắt đầu từ diff/bằng chứng hiện có. Không lặp lại khảo sát hoặc viết lại phần đã đạt chỉ vì phiên bị ngắt.

## Chạy ứng dụng
Node >=22.13; `npm.cmd start`, http://localhost:3000. Test dùng database riêng trong thư mục tạm. Không dùng data thật để test.

## Bằng chứng và tệp đang dùng
- UI mới: public/foundation-ui.js; index không tải course-ui.js cũ. Nội dung public/foundation.js; engine dùng chung browser/server.
- `npm.cmd run check`, `npm.cmd run audit:content`, `npm.cmd test`, `npm.cmd run test:browser`, `npm.cmd run check:secrets` đều đã chạy đạt; `npm.cmd ls --depth=0` chỉ pg@8.23.1.
- artifacts/browser-results.json: 26 nhóm PASS, 0 exception. artifacts/screenshots có ảnh thực đủ 5 độ rộng và màn quan trọng. browser-failure.json là lần lỗi cũ đã có resolvedByRun.
- CONTENT-AUDIT.md: rà từng bài và cần giáo viên; CONTENT-MAP.md: nguồn dạy cho 133 câu kiểm tra; OPERATIONS.md: chạy/sao lưu/Render/rollback. Không có migration phá hủy.
- Giữ `data/` thật; test dùng database/profile tạm riêng. Các thay đổi chưa commit/push.

## Chưa xác minh ngoài môi trường local
- PostgreSQL/migration thật: thiếu DATABASE_URL test độc lập; blocker được ghi rõ. Render chưa deploy theo yêu cầu.
- Chưa có giáo viên độc lập, thử nhớ sau nhiều ngày, Safari/iOS/Android thật, giọng đọc nghe được/microphone vật lý, mô phỏng quota localStorage đầy.
- Speech adapter mô phỏng; MediaRecorder và playback dùng stream tổng hợp thật. Không gọi đó là kiểm tra phát âm hoặc mic vật lý.
- Nếu phát hành, tăng CACHE trong public/sw.js cho release thay đổi. COURSE_EDITION=legacy-v1 là chế độ quay về khóa cũ đã test, không xóa dữ liệu Foundation.
