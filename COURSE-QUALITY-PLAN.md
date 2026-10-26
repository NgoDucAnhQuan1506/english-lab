# Nâng cấp chất lượng khóa học — method v1

Yêu cầu mới: biến Foundation hiện có thành khóa học có hướng dẫn, thực hành chuyển tình huống và kiểm tra nhớ lại qua nhiều buổi. HEAD khảo sát `dac267f`, Git sạch; baseline syntax và 19 tests đạt. Không đổi nghĩa ID hoặc xóa điểm Foundation v2/khóa 30 bài.

## Các đầu ra
1. Biên soạn bổ sung cho cả 42 bài: cách học từng buổi, bài tập nhớ lại, ví dụ sửa lỗi, nhiệm vụ cá nhân có mẫu/rubric, câu kiểm tra chuyển tình huống và ba mốc nhớ lại. Dùng ID method1 mới, có nguồn dạy.
2. Tách “đạt kiểm tra mẫu”, “dùng được trong tình huống khác”, “nhớ lại sau 1/3/7 ngày”, “tự đối chiếu nói/viết”. Không tự chuyển kết quả cũ thành bằng chứng mới.
3. Tích hợp vào màn học/Hôm nay/lộ trình/tiến độ; lưu nháp, lượt, bước như hiện tại. Giữ khối lượng buổi và không chấm phát âm giả. Bảng chữ luyện phủ đủ chữ đã dạy; hội thoại có ngữ cảnh và lượt trao đổi tự nhiên hơn.
4. Kiểm thử engine/API/nội dung/E2E, xem ảnh mobile/desktop; báo cáo giáo viên/pilot và hướng dẫn cụ thể cho người học thử.

## Nghiệm thu
- Đủ 42 bộ bổ sung được rà thủ công, không chỉ có bài mẫu.
- Mọi câu mới có ID riêng và tham chiếu phần đã dạy; không dùng từ/cấu trúc vượt bài để chấm.
- Đổi đáp án ở tình huống mới, mở gợi ý, làm trước hạn hoặc tự tích checklist không tự tạo bằng chứng nhớ sau nhiều ngày.
- Nhiều buổi/F5/tài khoản/offline giữ dữ liệu; regression hiện có tiếp tục đạt.
- Không gọi phần mềm hoàn thành là đã được giáo viên/nhóm người học chứng minh hiệu quả. Thử nghiệm 1–3–7 ngày ngoài đời cần thời gian và người tham gia, có bộ hướng dẫn/bảng ghi kết quả sẵn.

## Checkpoint cuối vòng local — 26/10/2026

| Đầu ra | Trạng thái và bằng chứng |
|---|---|
| 42 bộ biên soạn | Hoàn thành nội bộ trong course-method.js; METHOD-CONTENT-MAP ghi từng mục tiêu/lỗi/nhiệm vụ/đáp án/nguồn |
| Bằng chứng tách biệt | Hoàn thành; kiểm tra mẫu / đổi dữ kiện / ba buổi nhớ lại / tự đối chiếu riêng; không chuyển điểm cũ |
| Tích hợp học | Hoàn thành; Hôm nay tiếp tục phần dở/đến hạn; giữ nhóm/draft; hội thoại có ngữ cảnh, bảy nhiệm vụ chặng |
| Nghiệm thu phần mềm | Syntax/content audit PASS; 29 tests, 33 nhóm E2E PASS; ảnh desktop/mobile đã xem |
| Tài liệu và thử học | COURSE-METHOD-REPORT, TEACHER-PILOT, README, OPERATIONS và checkpoint cập nhật |
| Thẩm định bên ngoài | Chưa thực hiện: giáo viên, người học sau nhiều ngày, giọng/microphone thiết bị thật; không gắn nhãn đã chứng minh hiệu quả |

Không push/deploy hoặc sửa dữ liệu thật. Xem CHECKPOINT để tiếp tục đúng trạng thái Git và ACCEPTANCE-REPORT để phân biệt phần đã chạy với giới hạn.
