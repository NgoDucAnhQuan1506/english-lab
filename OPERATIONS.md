# Chạy, bảo toàn dữ liệu và cập nhật English Lab

Tài liệu ngày 26/10/2026. Không push/deploy hoặc thay dữ liệu production trong phiên nâng cấp. Những bước Render dưới đây để chủ ứng dụng thực hiện khi sẵn sàng; không cấp thêm dịch vụ trả phí.

## Local và cấu hình

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd run audit:content
npm.cmd test
npm.cmd run test:browser
npm.cmd start
```

Địa chỉ mặc định http://localhost:3000. Không có build. Test API/browser tạo SQLite riêng trong thư mục tạm và không đọc data thật. Test trình duyệt ghi ảnh vào artifacts/screenshots, download thử vào artifacts/downloads (được gitignore).

| Biến | Giá trị / ý nghĩa |
|---|---|
| PORT | Mặc định 3000, Render cung cấp khi chạy |
| NODE_ENV | production bật cookie Secure và kiểm tra cấu hình lưu bền vững |
| DATABASE_URL | PostgreSQL, ưu tiên hơn SQLite; không ghi URL chứa mật khẩu vào Git/frontend |
| DATA_DIR | Thư mục SQLite, local mặc định data; production phải trỏ vào disk bền vững thật |
| COURSE_EDITION | Không đặt hoặc foundation-v2: khóa 42 bài. legacy-v1: chế độ tương thích khóa cũ, vẫn giữ engine/dữ liệu mới |
| ADMIN_EMAIL + ADMIN_SETUP_KEY | Cấp admin qua màn hình tài khoản; cần cả email và khóa riêng ít nhất 32 ký tự |
| BROWSER_PATH | Chrome/Edge cho E2E khi không tự tìm được |

Ví dụ PowerShell: `$env:PORT = '3000'`, `$env:DATA_DIR = 'C:\duong-dan-disk-rieng\english-lab'`. `.env.example` là tài liệu mẫu; `npm start` không tự đọc .env. Không đặt password/khóa thật vào file công khai. Giữ xác minh TLS theo hướng dẫn PostgreSQL của nhà cung cấp.

Production thiếu cả DATABASE_URL lẫn DATA_DIR: nội dung/khách vẫn hoạt động; API tài khoản báo chưa cấu hình lưu bền vững. DATA_DIR tự nó không làm filesystem tạm thành disk. Render mặc định dùng filesystem tạm; dữ liệu phải ở datastore hoặc disk bền vững đã được cấu hình. [Tài liệu deploy và filesystem Render](https://render.com/docs/deploys).

## Sao lưu trước nâng cấp

SQLite dùng VACUUM INTO để lấy bản nhất quán gồm dữ liệu WAL; script không ghi đè đích đã có:

```powershell
node backup-sqlite.js data/english-lab.sqlite backups/before-foundation-v2.sqlite
```

Với DATA_DIR khác, thay nguồn đúng vị trí. Lưu bản sao ngoài disk của dịch vụ. PostgreSQL dùng cơ chế sao lưu nhà cung cấp hoặc pg_dump; giữ kết nối và quyền truy cập riêng tư. Trình duyệt: Tài khoản → Xuất bản sao tiến độ cho sự kiện hai khóa và bản nháp. Tiến độ công cụ bảng chữ cũ nằm riêng trong users.progress / englishlab.alphabet.guest, vẫn được giữ trong database/trình duyệt.

Không có migration phá hủy trong nâng cấp này. Các cột/bảng cũ giữ nguyên; sự kiện mới thêm trường course/assisted/context. Sự kiện cũ không có course được hiểu là legacy-v1. Khóa mới không dùng lại ID dN-*.

## Nếu chuyển SQLite sang PostgreSQL

Chỉ chạy trên database đích đã chuẩn bị riêng; chưa kiểm tra PostgreSQL thật ở môi trường này:

```powershell
$env:DATABASE_URL = 'chuoi-ket-noi-rieng-do-nha-cung-cap-cap'
node migrate-to-postgres.js backups/before-foundation-v2.sqlite
```

Script hiện có nhập tài khoản, password hash/salt, vai trò, tiến độ cũ, study chứa cả hai khóa và lesson draft/published. Bỏ qua ID/email trùng; không ghi đè tài khoản đích hoặc xóa nguồn. Không chuyển session; đăng nhập lại. Tài khoản cùng email nhưng dữ liệu khác cần đối chiếu thủ công, không tự gộp. Không chạy migration thử vào production.

## Cập nhật Render

1. Giữ bản sao database và ghi lại commit/deploy đang chạy, cấu hình môi trường cần thiết. Chọn thời điểm phù hợp; dịch vụ gắn disk không có zero-downtime deploy. [Render deploys](https://render.com/docs/deploys).
2. Sau khi chủ ứng dụng xem diff và quyết định đưa code lên Git, dùng Web Service Node hiện có. Phiên làm việc này chưa push.
3. Node 24; Build Command `npm ci`; Start Command `npm start`. Giữ DATABASE_URL hoặc DATA_DIR hiện có, không thay bằng database trống. Không cần API key học tiếng Anh/AI.
4. Mặc định không đặt COURSE_EDITION, hoặc đặt foundation-v2. Giữ NODE_ENV=production. Tránh đưa ADMIN_SETUP_KEY vào frontend; có thể bỏ khóa khỏi môi trường sau khi đã cấp admin.
5. Deploy latest commit theo cấu hình auto/manual của dịch vụ. Sau khi chạy: mở trang, đăng nhập tài khoản kiểm tra riêng, xác nhận khóa cũ còn lịch sử, bài 1 mới mở được, một hoạt động lưu đúng và F5 giữ bước. Không dùng script test để sửa dữ liệu thật.
6. Service worker cache nguyên một bản public assets. **Mỗi lần phát hành thay đổi JS/CSS/nội dung phải đổi tên CACHE trong public/sw.js**, chạy lại browser E2E. Sau deploy, tải lại trang và xác nhận Foundation v2; API/tài khoản không nằm trong cache.

## Quay lại an toàn

**Ưu tiên chế độ tương thích:** trên cùng bản mã mới đặt `COURSE_EDITION=legacy-v1` và triển khai lại cấu hình. Người học thấy khóa 30 bài; sự kiện/draft Foundation v2 vẫn giữ và máy chủ vẫn hiểu cả hai phiên bản. API settings được đọc mới qua mạng, không nằm trong cache. Khi ổn định, bỏ biến/đặt foundation-v2 và triển khai lại; trong Tài khoản chọn lại Foundation v2. Không xóa database hoặc localStorage.

**Nếu cần Render Rollback:** Deploys → chọn một deploy thành công có artifact còn giữ → Rollback → Rollback to this deploy. Chọn bản đã hỗ trợ schema sự kiện mới nếu có. Render rollback qua Dashboard tự tắt auto-deploy; kiểm tra lại cấu hình môi trường và bật lại sau khi sửa. Rollback không quay ngược dữ liệu disk/database. [Hướng dẫn chính thức về rollback](https://render.com/docs/rollbacks).

Không quay thẳng về build 30 bài chưa có lớp tương thích rồi cho phép ghi tiến độ mới: frontend/engine cũ có thể bỏ qua hoặc hiểu sai view/câu hỏi Foundation. Nếu chưa có artifact tương thích trước đó, dùng COURSE_EDITION trên bản mới thay vì rollback build cũ. Giữ nguyên mọi sự kiện mới để có thể mở lại sau sửa.

Nếu database thật gặp lỗi, tạo bản phục hồi ở thư mục/database **mới**, xác minh tài khoản và lịch sử trước khi đổi cấu hình trỏ tới đó. Giữ nguồn và bản sao, đối chiếu cả hoạt động phát sinh sau snapshot; không thay hoặc xóa dữ liệu đang chạy bằng lệnh tự động. Việc khôi phục production cần người vận hành quyết định theo bản sao thực tế.

## Thay nội dung và thêm audio

Foundation có revision 1 và prefix f2. Chỉnh lỗi trình bày/lời giải không đổi nghĩa được giữ ID; thay ý nghĩa đề/đáp án cần ID/phiên bản mới và registry giữ nội dung cũ để chấm lịch sử. Không tăng prefix rồi xóa module cũ. Khóa 30 bài được giữ; API editor chặn thay nghĩa câu/đáp án/ID, cho sửa tiêu đề/lời giải/bài giảng/IPA mà không đổi nghĩa từ.

Để thêm bản thu, đăng ký `AudioLab.register('letter:A', {src:'/audio/letter-a.mp3', license:'nguon-va-quyen-su-dung'})` hoặc `word:...` / `phrase:...`. File phải tồn tại, cùng origin và có quyền rõ ràng. UI không cần đổi; nếu chưa có registry dùng giọng thiết bị. Không tải MP3 từ từ điển khi chưa được phép. Khóa cốt lõi không phụ thuộc dịch vụ trả phí.

## Phạm vi chưa xác minh

SQLite/API và Chrome đã có tests; PostgreSQL thật, migration lên PostgreSQL thật và Render production chưa được chạy vì thiếu môi trường test độc lập. Không dùng điều này làm lý do bỏ qua tests local; xem kết quả thực ở ACCEPTANCE-REPORT.md. Âm thanh phần mềm được test trạng thái/chuỗi đọc, không thay thử nghe thực trên iOS/Android/Windows hoặc giáo viên thẩm định.
