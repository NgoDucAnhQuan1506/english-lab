# English Lab — kế hoạch nâng cấp Foundation v2

**Vòng tiếp theo 26/10/2026:** nâng chất lượng giảng dạy theo yêu cầu mới, giữ nền tảng đã hoàn thành bên dưới. [COURSE-QUALITY-PLAN.md](COURSE-QUALITY-PLAN.md) ghi phạm vi và kết quả method1: 42 bộ bổ sung, vận dụng/nhớ lại riêng, 29 tests và 33 nhóm E2E đạt local. [CHECKPOINT.md](CHECKPOINT.md) là trạng thái hiện tại; các mốc baseline/19 tests/26 nhóm ở phần dưới là lịch sử vòng trước.

**Vòng studio1 sau yêu cầu “tiếp tục big update”:** [BIG-UPDATE-PLAN.md](BIG-UPDATE-PLAN.md) và [BIG-UPDATE-REPORT.md](BIG-UPDATE-REPORT.md): xưởng 14 tình huống/56 bước, nháp/nhật ký tự đối chiếu, ôn biến thể theo dữ liệu thật. Hiện 36 tests và 42 nhóm E2E đạt; không chấm câu mở/phát âm giả, không push/deploy. Checkpoint giữ bằng chứng mới nhất.

## Hiện trạng đã xác minh
- Git đầu phiên: sạch, HEAD `c768424`. Không có AGENTS.md ở workspace/các thư mục cha đã kiểm tra.
- Node thuần + SQLite/PostgreSQL, frontend JavaScript thuần. Khóa hiện tại 30 bài, chưa có Foundation v2.
- Baseline 25/10/2026: syntax PASS; 8/8 tests PASS; Chrome smoke PASS. Không đọc/xóa dữ liệu người dùng thật.

## Phạm vi và các giai đoạn
1. Khảo sát, baseline và checkpoint: hoàn thành. Giữ kiến trúc hiện tại.
2. Nội dung: khóa Foundation v2, 42 bài/7 chặng đúng thứ tự; mục tiêu, tiên quyết, ôn, giải thích, làm mẫu, luyện có/giảm gợi ý, vận dụng, kiểm tra, lời giải và lịch ôn. ID mới; giữ nguyên khóa 30 bài và lịch sử.
3. Engine và lưu: phân phiên bản, hỗ trợ không tính lượt độc lập, phiên 10/20/30 phút có khối lượng khác nhau, đề xuất theo dữ liệu, hàng ôn hữu hạn, bản nháp, xuất/nhập, hợp nhất và cô lập tài khoản.
4. Trải nghiệm học: bảng chữ, cấu trúc câu, hội thoại, ghi âm cục bộ, audio chung, sổ tay và tiến độ có bằng chứng.
5. Giao diện: tokens, sáng/xanh bình tĩnh, focus/reduced motion, responsive; xem ảnh ở 360/390/768/1280/1440.
6. Nghiệm thu: engine/API/content/migration/E2E, luồng khách/tài khoản/offline/audio/microphone; sửa lỗi; tài liệu chạy, Render và rollback.

## Tiêu chí nghiệm thu
- Đủ 42 bài có nội dung biên soạn và truy nguyên nội dung từng câu kiểm tra; không đổi ý nghĩa ID cũ.
- Bài 1 và một bài mẫu câu đi từ mở bài tới tổng kết; bước/câu nhập dở tồn tại sau F5 và mở lại.
- Đã xem/đang học/hoàn thành lượt/đạt/cần ôn/tự đánh giá được tách biệt; hỗ trợ không tính như làm độc lập.
- Khách/tài khoản/hợp nhất/đổi tài khoản/offline/hết phiên không mất hoặc lộ dữ liệu. Máy chủ tự chấm, UUID chống trùng; thời gian nhiều tab có giới hạn.
- Âm thanh không chồng, dừng khi rời bài, thiếu giọng có hướng dẫn; ghi âm theo yêu cầu, nghe/xóa và đóng microphone, không upload/chấm phát âm giả.
- Ma trận nghiệm thu có kết quả thật và blocker cụ thể; desktop/mobile có ảnh đã xem; README và báo cáo khớp sản phẩm.

## Ranh giới
Không push/deploy, dịch vụ trả phí, xóa dữ liệu thật. PostgreSQL/Render chỉ xác minh nếu có môi trường riêng được cung cấp; không dùng production để test. Không gọi kiểm tra cấu trúc là thẩm định giáo viên; ghi rõ phần cần người chuyên môn xác nhận.

## Checkpoint nghiệm thu local — 26/10/2026

| Giai đoạn | Đầu ra / trạng thái |
|---|---|
| 1. Khảo sát | Baseline, kiến trúc, Git/AGENTS và kế hoạch — xong |
| 2. Biên tập | 42 bài; CONTENT-AUDIT.md và CONTENT-MAP.md — xong nội bộ; giáo viên độc lập chưa thẩm định |
| 3. Engine/lưu | Phân phiên bản, chấm thật, draft, phiên có khối lượng, ôn hữu hạn, hợp nhất/xuất nhập — xong, có tests |
| 4. Trải nghiệm/audio | Thẻ chữ, từ, xếp câu, hội thoại, audio chung, recorder cục bộ — xong; giọng/mic vật lý chưa thử |
| 5. Giao diện | Tokens sáng/xanh và tối, học tập trung mobile, focus/reduced motion, ảnh 5 viewport — xong |
| 6. Nghiệm thu/bàn giao | 19 tests + 26 nhóm E2E đạt; ACCEPTANCE-REPORT.md, README, OPERATIONS, ảnh/checkpoint — xong local |

Blocker ngoài local: PostgreSQL/migration thật thiếu database test; Render không deploy theo yêu cầu; thiếu thiết bị thật/giáo viên. Chi tiết và cách kiểm tra tiếp nằm trong ACCEPTANCE-REPORT.md. Không dùng những giới hạn đó để diễn giải kết quả local thành bảo đảm production.
