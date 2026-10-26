# Xưởng vận dụng và ôn đúng chỗ — studio1

26/10/2026. Tiếp nối method1 trên workspace hiện có, không reset diff của vòng trước. Không push/deploy/commit, thay framework, thêm dependency hoặc dùng dữ liệu người học thật để test.

## Người học làm được gì thêm

Nhiệm vụ chặng trước đây là đoạn hướng dẫn. Nay có **Vận dụng** trong điều hướng, liên kết từ Hôm nay và tổng kết bài cuối chặng. Mỗi chặng có hai tình huống, mỗi tình huống bốn bước với thông tin khác nhau. Người học nghe yêu cầu khi có audio, tự nói/viết, ghi câu hoặc điều còn khó rồi mới mở mẫu, đối chiếu tiêu chí và lưu “đã đối chiếu” hoặc “còn cần luyện”. Có thể quay lại từng bước, tạo lượt mới giữ lịch sử hoặc đổi tình huống.

Ví dụ: sau chặng làm quen, người học đóng vai Mai quê Hà Nội/sống Huế và đáp câu hỏi tên, đánh vần, nơi sống, nghề rồi xin nói chậm. Tình huống kia đổi sang An, thông tin và thứ tự câu hỏi khác. Trả lời theo ý câu hỏi có ích hơn chép một hội thoại theo thứ tự cố định. Mẫu để tự đối chiếu không phải đáp án duy nhất; ứng dụng không tự chấm câu mở hoặc phát âm.

| Chặng | Hai tình huống và trọng tâm |
|---|---|
| 1 | Ghi tên Mai / thẻ tên An: hoa–thường, nghe tên chữ, thứ tự đánh vần, chữ dễ nhầm |
| 2 | Phân loại nghe–đọc / thứ tự từ mới: đọc cả từ khác đánh vần, chất âm, vị trí môi/răng và âm cuối |
| 3 | Chuẩn bị góc học / bàn học mới: số, tuổi nhân vật, màu + vật, người thân |
| 4 | Giới thiệu mình và bố / người thân và trạng thái: be, nghề, phủ định, hỏi–đáp và đổi người |
| 5 | Đồng nghiệp / đổi thứ tự: hỏi tên–đánh vần, nghề, xuất thân/nơi sống, xin hỗ trợ |
| 6 | Một ngày hai người / lịch cô ấy: cụm hành động, s/studies/has, doesn’t và Do/Does |
| 7 | Hẹn học ở quán / đổi lịch: gọi món, sở thích, vị trí và tin nhắn đủ việc/giờ/người nhận |

STUDIO-CONTENT-MAP ghi toàn bộ 56 bước, mẫu, tiêu chí và phần đã dạy trước đó. Đã đọc/rà từng tình huống khi biên soạn; validator kiểm tra refs và tính đầy đủ. Mẫu tiếng Anh trong phạm vi từ/cấu trúc đã dạy; giải thích tiếng Việt/IPA không bị gửi vào TTS. Audio chỉ dùng các trường tên chữ/cả từ/câu đã chỉ định. Chưa có giáo viên độc lập nghe và thẩm định.

## Ôn theo lỗi và biến thể

Buổi ôn lấy câu sai/đến hạn trước, tìm câu cùng nguồn kiến thức trong phần đã học tới bài của câu gốc, tránh câu vừa xuất hiện và hạn chế trùng nội dung trong cùng buổi. Chọn biến thể dựa vào số lượt và thời điểm thực trong lịch sử, không dùng điểm dự đoán AI. Hiện rõ lý do chọn, không tự xóa lỗi ở câu gốc khi biến thể đúng. Sau hai câu ôn liên quan đúng không hỗ trợ kể từ lần thử câu gốc gần nhất, quay lại câu gốc để người học thực sự sửa nó. Đây là quy tắc luyện, không kết luận đã hiểu cả một khái niệm.

Nếu không có biến thể phù hợp, dùng câu gốc. Khóa cũ vẫn hoạt động với cách này; từ đã lưu giữ ôn thẻ. Hàng ôn, câu đang nhập, vị trí và kết quả đã gửi giữ sau F5; câu đã trả lời không hiện form để gửi lại. Có nút tạo buổi mới sau khi hết hàng. Ngân sách 10/20/30 phút tiếp tục giới hạn khối lượng thật; xưởng cũng dùng 3/6/9 bước/câu trong buổi.

Phản hồi câu sai có chỉ dẫn riêng cho các lỗi nhận ra chắc bằng quy tắc: sai dạng hoa/thường, a my, I’m am, giữ s/has sau does/doesn’t, thêm be trước hành động hoặc định dạng giờ. Trường hợp khác hiển thị lời giải gốc; không tự suy diễn người học mắc một loại lỗi ngoài khả năng quy tắc. Câu đúng theo biến thể hợp lệ không bị chẩn đoán lỗi.

## Dữ liệu và quyền riêng tư

- Không thay nghĩa ID cũ. Tình huống dùng studio1-s[1–7][a/b], bước có t[1–4]; engine/API xác minh scene, turn, run, course và giá trị checked/retry, tự lấy ngày bài từ catalog.
- Event studio chỉ có trạng thái tự đối chiếu và cờ mở hỗ trợ; server bỏ trường lời đáp/điểm do client cố gửi. Lời đáp/ghi chú nháp ở bộ nhớ từng khách/tài khoản trên thiết bị, nằm trong JSON người học chủ động xuất, không tự gửi cùng đồng bộ.
- Không tăng số câu đúng/đã trả lời, bài đạt hoặc bằng chứng nhớ lâu bằng event studio. Bản ghi dùng công cụ cục bộ hiện có, chỉ xin mic khi bấm, không upload; rời bước xóa bản tạm và đóng mic.
- Lượt có UUID riêng; nhập hợp nhất giữ lịch sử, không cộng trùng. Đổi tài khoản không hiện nháp người trước; offline giữ trạng thái chờ và chỉ báo đồng bộ khi server xác nhận.
- Có snapshot/bản sao trước phát hành; không cần migration schema. Server cũ chưa hiểu studio1 không phù hợp để nhận ghi tiến độ mới; xem OPERATIONS.

## Bằng chứng và giới hạn

Kết quả thực cuối xem ACCEPTANCE-REPORT và artifacts/browser-results.json; unit/API log ở artifacts/unit-results.tap. Engine kiểm tra catalog, canonical event, cách ly khóa, không tăng điểm, chọn/xoay biến thể, quay về câu gốc và phản hồi lỗi. Browser thực hiện cả tình huống, thử trống/thiếu tiêu chí, F5, giới hạn buổi, đổi dữ kiện, xuất/nhập, offline/đồng bộ và cách ly nháp hai tài khoản. Ảnh studio ở 360/390/768/1280/1440 được xem; không overflow trong ca đo.

Không phải pilot người học thật. Mẫu nhập trong E2E dùng dữ liệu fixture để kiểm tra phần mềm. Giáo viên, hiệu quả sau nhiều ngày, giọng/microphone vật lý, Safari/iOS/Android, quota bộ nhớ đầy và PostgreSQL/Render bên ngoài vẫn chưa được xác minh. Không gọi trạng thái tự đối chiếu là năng lực nói/viết đã được đánh giá.
