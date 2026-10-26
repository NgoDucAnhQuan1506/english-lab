# Vòng nâng cấp tiếp — xưởng vận dụng và ôn đúng chỗ

Khởi đầu 26/10/2026 tại HEAD dac267f, giữ nguyên diff chưa commit của vòng method1. Baseline syntax và 29 tests PASS. Không reset/clean, push/deploy, dịch vụ trả phí hoặc sửa dữ liệu thật.

## Phạm vi và đầu ra

1. Xưởng vận dụng: bảy chặng, mỗi chặng hai tình huống biên soạn trong phạm vi đã dạy. Người học đọc/nghe yêu cầu, tự nói/viết, mở mẫu sau khi thử, đối chiếu tiêu chí và ghi điều cần sửa. Mỗi bước có draft; tiếp tục sau F5/đổi màn; phiên 10/20/30 có giới hạn thực. Có lịch sử lượt tự đối chiếu, không gộp vào điểm kiểm tra hoặc kết luận thành thạo.
2. Ôn có biến thể: chọn câu sai/đến hạn, tìm biến thể cùng kiến thức đã học và tránh dùng lại nguyên câu khi có lựa chọn phù hợp. Hiện rõ lý do chọn và phần đã được dạy; không xóa lỗi gốc chỉ vì một biến thể đúng. Buổi hữu hạn, không đưa câu bài chưa học; giữ cách ôn khóa cũ.
3. Kiểm thử catalog/engine/API/lưu và E2E; xem ảnh ở 360/390/768/1280/1440; cập nhật audit, báo cáo, cách chạy và checkpoint.

## Nghiệm thu

- Đủ 14 tình huống hoàn chỉnh, mọi bước có nhiệm vụ, mẫu, tiêu chí và tham chiếu kiến thức đã dạy.
- Mẫu ẩn ban đầu; thiếu câu/ghi chú hoặc chưa đối chiếu tiêu chí không thể xác nhận đã tự đối chiếu. Không có chấm phát âm/câu mở giả.
- Bản nháp lời đáp ở thiết bị, export/import giữ được; máy chủ chỉ lưu mã tình huống/bước/trạng thái tự đối chiếu, không tự gửi bản ghi hoặc lời đáp cá nhân.
- Hỗ trợ, đổi tài khoản, offline, F5 và hai khóa không làm mất hoặc lộ dữ liệu; server kiểm tra ID/khóa/ngữ cảnh.
- Ôn chọn được biến thể liên quan, không lặp trùng cùng nội dung trong buổi khi có cách khác; không biến lượt ôn thành bằng chứng đạt bài/vận dụng/nhớ lâu.
- Tests bắt buộc PASS hoặc ghi blocker cụ thể; kiểm tra ảnh và tài liệu khớp sản phẩm. Giáo viên/người học thật/thiết bị mic/giọng và PostgreSQL/Render bên ngoài vẫn phải ghi chưa xác minh.

## Checkpoint

- Khảo sát và baseline: hoàn thành.
- Catalog/engine/API/UI: hoàn thành; 14 tình huống/56 bước, nhật ký/draft riêng, ngân sách buổi thực và ôn biến thể.
- Nghiệm thu local: syntax/content audit PASS, 36 tests và 42 nhóm E2E PASS; ảnh năm độ rộng đã xem, sửa bố cục giảm phần mô tả phụ trước nhiệm vụ.
- Tài liệu: BIG-UPDATE-REPORT, STUDIO-CONTENT-MAP, README, audit/acceptance/operations/pilot/worklog/checkpoint cập nhật.
- Phần ngoài môi trường local chưa thực hiện giữ đúng giới hạn đã ghi; không push/deploy hoặc thay dữ liệu thật.
