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

## 26/10/2026 — yêu cầu nâng thành khóa học thực sự, method1

- Khảo sát HEAD dac267f, Git sạch đầu vòng; đọc tài liệu/mã thực tế, baseline cú pháp và 19 tests đạt. Tiếp tục Foundation v2 có sẵn. COURSE-QUALITY-PLAN ghi phạm vi mới, không dựng lại framework.
- Biên soạn đủ 42 bộ mục tiêu/trọng tâm/lỗi–cách sửa–lý do/nhiệm vụ/mẫu/tiêu chí và nhịp học qua nhiều buổi. Khởi động tự nhớ, có audio khi câu yêu cầu nghe. Thêm bảy nhiệm vụ chặng. Đọc/rà từng bộ, đối chiếu câu chấm với phần đã dạy; METHOD-CONTENT-MAP sinh toàn bộ ID/nguồn.
- Bổ sung course-method.js theo lớp riêng; giữ nguyên 305 câu Foundation và khóa 30 bài. Đăng ký 280 câu vận dụng (có nhóm thay thế) và 252 câu mốc nhớ lại. Không dùng số câu để đánh giá chất lượng. Bài 1–4 phủ đủ chữ; bài 5–42 ba nhóm hai câu.
- Sửa hội thoại làm quen/gọi món có ngữ cảnh và lượt đáp; câu mẫu cấu trúc/phát âm không gắn vai A/B giả. Phần cá nhân có mẫu mở sau khi thử, draft/tiêu chí mới riêng, giữ bản nháp cũ nhưng không chuyển checkbox cũ sang tiêu chí mới.
- Engine/API tách checkups và điểm mẫu, ghi ngày đạt mẫu, không tự nâng điểm cũ. Một nhóm vận dụng đúng độc lập mới mở mốc +1/+3/+7; ba mốc phải cách nhau ít nhất 24 giờ. Thực tế muộn hiển thị số ngày thật. Reviews/reflection không thay chứng cứ kiểm tra.
- Phát hiện điểm yếu tự thử lại đúng câu vừa xem lời giải: bổ sung đổi nhóm dữ kiện, lưu nhóm theo run để F5/backup giữ; cùng câu vừa sai/hỗ trợ không tính độc lập trong 24 giờ. Hôm nay ưu tiên tiếp tục nhóm đang dở, kể cả bài đã đạt mẫu. Bổ sung kiểm thử các ca này.
- Rà chấm: giờ 08:30 và 8:30 tương đương, 83:0/830 sai; dạng gọn bị ràng buộc nếu đề yêu cầu; bài 29 chấp nhận I don’t/I do not understand vì đã dạy cả hai. Giao diện giải thích giới hạn mẫu nhỏ và tự đối chiếu bằng tiếng Việt.
- 29/29 tests PASS, gồm đi hết mọi nhóm vận dụng và mốc giả lập cho toàn bộ 42 bài; API tự chấm câu mới. Syntax/content audit PASS; không phát hiện refs/tokens đáp án chưa dạy theo heuristic.
- Browser cuối PASS 33 nhóm, 0 exception. Đã kiểm tra lại luồng cũ, 42 nhiệm vụ/bảy chặng, đổi nhóm sau hỗ trợ/F5, Today tiếp tục draft method, khóa mốc sớm, self-check và fixture ngày lịch sử. Lượt khảo sát test ban đầu mở tổng kết trước kịch bản người mới nên nút chính đúng là tiếp tục; chuyển khảo sát sau kịch bản người mới, không đổi hành vi ứng dụng để hợp thức hóa test.
- Xem ảnh method-coaching-390, method-evidence-390, method-progress-1280 và mốc chưa đến hạn; browser chạy lại đủ 360/390/768/1280/1440, không overflow trong ca đo. Không coi timestamp giả là pilot người học thật.
- Secrets heuristic không có phát hiện (62 tệp tracked, 8 commit + frontend), dependency chỉ pg@8.23.1. Hoàn thiện COURSE-METHOD-REPORT, TEACHER-PILOT, README, CONTENT-AUDIT, ACCEPTANCE, OPERATIONS và checkpoint. Chưa có teacher/pilot/thiết bị mic/giọng thật hoặc PostgreSQL/Render riêng. Không push/deploy/commit hoặc dùng dữ liệu thật.
- Rà cuối phát hiện có thể xem lời giải cùng ID ở mục ôn rồi quay sang tự thử: engine lưu thời điểm sửa/hỗ trợ cho mọi ngữ cảnh câu method1, nên khoảng cách 24 giờ cũng áp dụng sau mục ôn. Bổ sung assertion hồi quy; chạy lại syntax, đủ 29 tests và 33 nhóm E2E đều PASS. Kiểm tra link tài liệu local không có đích thiếu; git diff --check PASS sau bỏ dòng trống thừa cuối UI.

## 26/10/2026 — big update studio1, khảo sát và triển khai

- Đọc lại Git/checkpoint/mã chạy thực tế, giữ toàn bộ diff method1 chưa commit; baseline syntax/29 tests PASS. Không reset hoặc ghi đè thay đổi vòng trước. BIG-UPDATE-PLAN xác định phạm vi theo mục tiêu sử dụng kiến thức, không chỉ tăng màn/câu hỏi.
- Biên soạn scenarios.js: 14 tình huống/56 bước cho bảy chặng, nhiệm vụ/mẫu/lý do/tiêu chí/refs và audio chỉ định. Đọc/rà từng tình huống, giới hạn vào kiến thức đã dạy trước bài cuối chặng; S.validate và audit refs PASS. STUDIO-CONTENT-MAP sinh từng bước để giáo viên xem. Không dùng lời giải Việt/IPA làm TTS.
- Xưởng mới liên kết điều hướng/Hôm nay/tổng kết cuối chặng: tự thử rồi mở mẫu, checks hoặc đánh dấu cần luyện, draft từng bước, tiếp tục F5, đổi tình huống, tạo lượt mới và nhật ký 10 lượt gần nhất có ghi chú địa phương. Một buổi 10/20/30 giới hạn 3/6/9 bước/câu; đếm theo run+step/câu, không theo số lần xác nhận cùng bước.
- Engine/API nhận studio, xác minh catalog và khóa, bỏ lời đáp/điểm client cố gửi. Lưu trạng thái self-check riêng; không cộng câu đúng/bài đạt hoặc method evidence. Bản nháp/checklist trong storage từng danh tính, export/import giữ; chỉ trạng thái đồng bộ. Không thêm schema/dependency.
- Review-coach chọn biến thể cùng refs, không vượt bài nguồn, tránh nội dung trùng/vừa gặp dựa lịch sử. Giữ lỗi câu gốc; sau hai câu ôn liên quan đúng độc lập trở lại gốc. Khóa cũ fallback nguyên câu nếu thiếu refs/biến thể; từ lưu vẫn ôn thẻ. Hàng/index/mode/run/draft review giữ qua F5, câu đã gửi hiện kết quả thay form gửi lại.
- Thêm phản hồi gần câu sai cho các mẫu lỗi có thể nhận diện chắc; trường hợp khác dùng lời giải gốc, không đoán nguyên nhân. Không thêm mô hình AI hoặc dịch vụ trả phí.

## 26/10/2026 — studio1, nghiệm thu local và bàn giao

- Syntax PASS; audit PASS 42 bài, refs method/studio hợp lệ, heuristic đáp án không tìm token chưa dạy. Node tests **36/36 PASS**, gồm catalog, privacy canonicalization, ID/khóa/run sai, không tăng điểm, review biến thể/xoay/quay về gốc và phản hồi lỗi. API integration thực với SQLite fixture PASS.
- Browser cuối **42 nhóm PASS**, 0 exception: giữ toàn bộ regression trước; mở đủ 14 scenes mẫu ẩn, thiếu notes/criteria không xác nhận, F5 giữ draft/mẫu, hoàn thành bốn bước qua giới hạn ba bước, alternate dữ kiện, backup idempotent, lượt mới giữ nhật ký, review queue/F5, offline studio pending/online retry, server không lưu private text và nháp hai tài khoản cách ly.
- Chạy giao diện ở 360/390/768/1280/1440, xem ảnh từng cỡ và tổng kết. Thu phần lưu/quyền riêng tư vào details, giảm đoạn thông báo lặp trước nhiệm vụ, giữ nút đủ chạm và nhãn cho từng tình huống; chạy lại E2E sau sửa, PASS. Ảnh artifacts/screenshots/studio-*.png.
- Secrets heuristic PASS (62 tracked files, 8 commit + frontend), dependency vẫn chỉ pg@8.23.1; git diff --check PASS. Kiểm thử dùng profile/DB/tài khoản giả riêng, không dùng dữ liệu thật. Không commit/push/deploy.
- README, BIG-UPDATE-REPORT/PLAN, STUDIO-CONTENT-MAP, CONTENT-AUDIT, ACCEPTANCE-REPORT, OPERATIONS, TEACHER-PILOT, UPGRADE-PLAN và CHECKPOINT cập nhật. CACHE studio1. Không rollback về server chưa hiểu studio event rồi cho ghi tiến độ mới.
- Giới hạn giữ rõ: chưa teacher/pilot nhiều ngày, thiết bị mic/giọng vật lý/Safari/iOS/Android/quota-full hoặc PostgreSQL/Render thật. Các cảnh tự đối chiếu không được gọi là đánh giá nói/viết/phát âm tin cậy.
