# English Lab

English Lab là ứng dụng web hỗ trợ người mới bắt đầu học tiếng Anh thông qua các bài học ngắn, trực quan và có tính tương tác. Phiên bản đầu tiên tập trung vào bảng chữ cái tiếng Anh, phát âm cơ bản và từ vựng minh họa.

## Tính năng

- Học đầy đủ 26 chữ cái từ A đến Z.
- Hiển thị chữ hoa, chữ thường và phiên âm cơ bản.
- Nghe phát âm chữ cái và từ ví dụ bằng Web Speech API.
- Học từ vựng minh họa kèm nghĩa tiếng Việt.
- Theo dõi tiến độ học theo từng chữ cái.
- Đánh dấu nội dung yêu thích.
- Đăng ký, đăng nhập và đăng xuất tài khoản bằng email, mật khẩu.
- Trang cá nhân hiển thị tiến độ, độ chính xác, lượt trả lời, ngày học và chữ yêu thích.
- Tự động khôi phục bài học gần nhất khi đăng nhập lại; dữ liệu riêng theo tài khoản.
- Làm bài luyện tập chọn chữ cái đúng.
- Giao diện responsive, hoạt động trên máy tính và thiết bị di động.
- Kiến trúc sẵn sàng mở rộng cho các bài học tiếp theo như âm cơ bản, số đếm, màu sắc và hội thoại.

## Công nghệ sử dụng

- **Node.js**: Chạy máy chủ HTTP và phục vụ ứng dụng.
- **HTML5**: Xây dựng cấu trúc giao diện.
- **CSS3**: Thiết kế giao diện responsive.
- **JavaScript thuần**: Xử lý bài học, quiz, tiến độ và phát âm.
- **Web Speech API**: Đọc chữ cái và từ vựng bằng giọng nói trên trình duyệt.

## Cấu trúc dự án

```text
english-lab/
├── public/
│   ├── app.js       # Logic bài học và bài luyện tập
│   ├── index.html   # Giao diện chính
│   └── style.css    # Kiểu dáng và responsive layout
├── package.json     # Cấu hình dự án và lệnh chạy
├── server.js        # HTTP server của Node.js
└── README.md        # Tài liệu dự án
```

## Yêu cầu hệ thống

- Node.js phiên bản 22.13 trở lên (khuyến nghị Node.js 24), sử dụng SQLite tích hợp.
- Trình duyệt hiện đại như Chrome, Edge, Firefox hoặc Safari.
- Kết nối Internet nếu muốn tải font chữ từ Google Fonts.

## Cài đặt và chạy trên máy

1. Clone repository:

   ```bash
   git clone https://github.com/<tai-khoan-cua-ban>/<ten-repository>.git
   cd <ten-repository>
   ```

2. Cài đặt dependencies:

   ```bash
   npm install
   ```

3. Khởi động ứng dụng:

   ```bash
   npm start
   ```

4. Mở trình duyệt tại:

   ```text
   http://localhost:3000
   ```

## Tài khoản và dữ liệu

Chọn **Đăng nhập / Đăng ký** để tạo tài khoản. Sau khi đăng nhập, **Trang cá nhân** hiển thị tiến độ; chọn **Tiếp tục học** để trở lại chữ đang học. Chọn **Tiếp theo** để ghi nhận một chữ đã học. Trả lời đúng bài luyện tập cũng đánh dấu chữ tương ứng đã học. Bấm trái tim để lưu chữ yêu thích.

Chế độ học thử không lưu tiến độ vào tài khoản. Khi đăng nhập, ứng dụng tải dữ liệu của tài khoản đó. Ngày học và chuỗi ngày học tính theo múi giờ Asia/Bangkok.

Máy chủ lưu dữ liệu tại `data/english-lab.sqlite`, ngoài thư mục public và được bỏ qua trong Git. Có thể đặt biến `DATA_DIR` để đổi thư mục dữ liệu. Mật khẩu được băm bằng scrypt với salt riêng; phiên đăng nhập dùng cookie HttpOnly, SameSite=Lax, hết hạn sau 7 ngày. Đặt `NODE_ENV=production` khi chạy qua HTTPS để bật cookie Secure.

Chạy kiểm tra API bằng `npm test`. Chưa có xác minh email hoặc đặt lại mật khẩu.

## Trang quản trị (Admin)

1. Khởi động web và đăng ký một tài khoản bằng email của bạn.
2. Từ thư mục dự án trên máy chủ, cấp quyền cho email đã đăng ký:

   ```powershell
   node manage-admin.js ban@example.com
   ```

3. Đăng nhập lại rồi chọn **Quản trị** trên thanh điều hướng.

Admin có thể tìm tài khoản theo tên/email, lọc theo trạng thái, xem danh sách phân trang và xem tiến độ chi tiết: chữ đã học, chữ yêu thích, số câu trả lời đúng, số ngày học và 14 ngày hoạt động gần đây nhất. Các số tổng quan tính trên toàn bộ tài khoản, kể cả admin.

Chọn **Khóa** hoặc **Mở khóa** để quản lý người học. Khóa tài khoản thu hồi các phiên đăng nhập ngay lập tức; mở khóa yêu cầu người học đăng nhập lại và giữ nguyên tiến độ. Admin không thể khóa chính mình hoặc tài khoản admin khác.

Không có tài khoản/mật khẩu admin mặc định. Đăng ký công khai luôn tạo người học; chỉ người có quyền chạy lệnh trên máy chủ mới cấp được quyền admin. Nếu dùng `DATA_DIR`, chạy lệnh cấp quyền với cùng giá trị `DATA_DIR` của máy chủ. Lệnh cấp quyền thu hồi phiên cũ để yêu cầu đăng nhập lại. Các tài khoản cũ tự động được chuyển sang vai trò người học khi cập nhật ứng dụng, không mất tiến độ.

## Triển khai lên Render

English Lab sử dụng Node.js server nên có thể triển khai nhanh trên Render:

1. Đẩy mã nguồn lên GitHub.
2. Tạo **Web Service** mới trên [Render](https://render.com).
3. Kết nối repository GitHub của dự án.
4. Thiết lập các lệnh:

   ```text
   Build Command: npm install
   Start Command: npm start
   ```

5. Nhấn **Deploy** để tạo đường dẫn truy cập trực tuyến.

Ứng dụng cần ổ đĩa lưu trữ bền vững cho SQLite: đặt `DATA_DIR` tới thư mục được gắn ổ đĩa và sao lưu dữ liệu định kỳ. Thư mục tạm của dịch vụ không bảo đảm giữ tài khoản khi triển khai lại. Chạy một phiên bản máy chủ dùng tệp SQLite này.

## Định hướng phát triển

- Bổ sung bài học luyện âm và khẩu hình.
- Mở rộng bộ từ vựng theo chủ đề.
- Thêm bài học số đếm, màu sắc và con vật.
- Bổ sung điểm số và huy hiệu.
- Xây dựng bài luyện nghe và hội thoại cơ bản.

## Giấy phép

Dự án được phát triển cho mục đích học tập và thực hành xây dựng ứng dụng web bằng Node.js.
## Tác Giả: NGÔ ĐỨC ANH QUÂN
