/* Authored, bounded open tasks. Models are for self-comparison, never auto grades. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.CourseScenarios=factory();})(globalThis,function(){
  'use strict';
  const edition='studio1',scenes=[];
  const turn=(prompt,model,why,refs,checks,audio=null,transcript='')=>({prompt,model,why,refs:refs.split(','),checks,audio,transcript});
  function add(stage,variant,title,brief,turns){const id=`studio1-s${stage}${variant}`;scenes.push({id,stage,day:stage*6,title,brief,turns:turns.map((t,i)=>({...t,id:`${id}-t${i+1}`}))});}
  const letter=text=>({kind:'letter',text}),word=text=>({kind:'word',text}),phrase=text=>({kind:'phrase',text});
  add(1,'a','Ghi đúng tên Mai','Bạn ghi tên trên một thẻ học. Phân biệt nhìn chữ, nghe tên chữ và đánh vần. Có thể nói trước rồi ghi ngắn điều đã làm.',[
    turn('Viết dạng thường của M và A.','m, a','Hoa và thường là hai hình của cùng chữ.','1:letter,3:letter',['Tôi viết đúng dạng thường.']),
    turn('Nghe tên một chữ, chưa mở văn bản. Viết chữ nghe được.','I','I có tên /aɪ/, khác E /iː/.','2:names,5:pairs',['Tôi thử nghe trước khi mở chữ.'],letter('I'),'I'),
    turn('Tên trên thẻ là MAI. Không nhìn mẫu, đánh vần rồi ghi thứ tự chữ.','M–A–I','Đánh vần giữ đúng thứ tự; không đọc như một từ tiếng Anh.','6:spell',['Tôi giữ đúng thứ tự M, A, I.']),
    turn('Che thẻ, tự viết hoa và thường của chữ bạn vừa nghe. Chọn một chữ còn nhầm để ôn.','I–i. Tôi còn nhầm E/I.','Ghi rõ chữ khó giúp buổi sau ôn đúng chỗ. Bạn có thể chọn chữ khác.','2:letter,5:pairs',['Tôi tự viết trước khi đối chiếu.','Tôi ghi một mục cần luyện.'])
  ]);
  add(1,'b','Kiểm tra thẻ tên An','Lần này đổi tên và các chữ dễ nhầm; không dùng vị trí đáp án để nhớ.',[
    turn('Viết dạng thường của A và N.','a, n','Giữ cùng tên khi đổi hình viết.','1:letter,3:letter',['Tôi phân biệt hoa với thường.']),
    turn('Nghe tên chữ rồi viết lại. Nếu khó, mở văn bản và ghi cần ôn.','G','G /dʒiː/ khác J /dʒeɪ/.','2:names,5:pairs',['Tôi nghe cả phần cuối tên chữ.'],letter('G'),'G'),
    turn('Đánh vần AN, ghi đúng hai chữ theo thứ tự.','A–N','Hai chữ, không thêm M của tên MAI.','6:spell',['Tôi không thêm hoặc đảo chữ.']),
    turn('Viết thường của D và B, rồi ghi dấu hiệu bạn dùng để phân biệt.','d, b. d có nét cao bên phải; b bên trái.','Dạng chữ khác nhau; cần nhận ra hình, không chỉ gọi tên.','5:forms',['Tôi kiểm tra hướng nét cao.','Tôi ghi chữ còn khó.'])
  ]);
  add(2,'a','Phân loại việc nghe và đọc','Bạn luyện một nhóm từ ngắn. Tự ghi âm nếu muốn; ứng dụng không chấm chất lượng giọng.',[
    turn('Nghe cả từ rồi viết; ghi nghĩa tiếng Việt nếu nhớ.','cat — con mèo','Đang đọc cả từ /kæt/, không phải tên C–A–T.','7:whole,7:word:cat',['Tôi thử nghe trước khi mở chữ.'],word('cat'),'cat'),
    turn('Với cat: nói cả từ, sau đó đánh vần. Ghi hai việc khác nhau ra sao.','cat; C–A–T','Đánh vần nói cách viết, đọc từ dùng âm trong từ.','7:name-sound,7:whole',['Tôi tách tên chữ với đọc cả từ.']),
    turn('Nghe rồi ghi từ và nghĩa. Có thể nghe chậm để so với ship.','sheep — con cừu','sheep khác ship cả chất âm; kéo dài ship không tự thành sheep.','9:contrast,9:context',['Tôi so chất âm, không chỉ độ dài.'],word('sheep'),'sheep'),
    turn('Nói cup rồi dừng ở âm cuối; ghi điều bạn kiểm tra khi nghe bản thu hoặc tự nói.','cup: môi khép ở /p/, không thêm nguyên âm.','Vị trí cuối có thể giữ nhẹ; không cần bật thật mạnh. Chưa chắc thì nhờ người hướng dẫn nghe.','11:final,11:stop',['Tôi chú ý âm cuối.','Tôi ghi điều chưa chắc thay vì tự cho điểm chuẩn.'])
  ]);
  add(2,'b','Nghe trong thứ tự mới','Đổi từ và thứ tự; không dựa vào bài đếm hoặc danh sách thuộc lòng.',[
    turn('Nghe rồi viết từ và nghĩa.','pen — bút mực','pen có /ɛ/ và âm cuối /n/.','8:word:pen,11:final',['Tôi thử trước khi mở chữ.'],word('pen'),'pen'),
    turn('Nghe rồi viết từ; phân biệt với sheep.','ship — tàu thủy','Giữ âm đầu/cuối, so âm giữa của ship và sheep.','9:contrast,9:context',['Tôi kiểm tra chất âm giữa.'],word('ship'),'ship'),
    turn('Nghe từ rồi ghi vị trí môi/răng khi đọc âm đầu.','van: răng trên chạm nhẹ môi dưới.','van dùng răng–môi, khác bag khép hai môi.','10:teeth,10:lips',['Tôi không thay âm đầu bằng tên chữ.'],word('van'),'van'),
    turn('Tự nói bag và cat. Ghi hai âm cuối và một điều cần luyện thêm.','bag /ɡ/; cat /t/.','Giữ phần cuối, tránh thêm một âm sau từ. Câu ghi chú có thể khác mẫu.','11:final,11:stop',['Tôi nghe lại hoặc tự kiểm tra phần cuối.','Tôi ghi điều cần người hướng dẫn nghe giúp nếu chưa chắc.'])
  ]);
  add(3,'a','Chuẩn bị góc học','Bạn sắp xếp bàn cho một buổi học. Đồ vật và người thân có thể tưởng tượng, không cần chia sẻ gia đình thật.',[
    turn('Nghe số, viết chữ số rồi viết tên số nếu nhớ.','8 — eight','Nhớ trực tiếp từng số, không cần đếm từ one.','13:numbers',['Tôi không mở danh sách trước khi thử.'],word('eight'),'eight'),
    turn('Nhân vật 16 tuổi. Nói tuổi bằng câu đầy đủ.','I’m sixteen years old.','Dùng mẫu tuổi đã học, không buộc tuổi thật nằm trong 11–20.','14:age,14:numbers',['Tôi có years old trong mẫu đầy đủ.']),
    turn('Giới thiệu chiếc bút xanh dương của bạn bằng This is...','This is my blue pen.','my + màu + vật; không ghép a my.','16:phrase,18:this,18:a',['Tôi đặt màu trước vật.','Tôi không thêm a trước my.']),
    turn('Giới thiệu mẹ hoặc bố tưởng tượng bằng This is my...','This is my mother.','Có thể chọn father; ở đây tự đối chiếu quan hệ đúng ý mình muốn nói.','17:family,17:my,18:this',['Người nghe biết tôi giới thiệu ai.'])
  ]);
  add(3,'b','Bàn học của nhân vật mới','Đổi số, vật và màu. Hãy dùng lại cấu trúc thay vì chép nguyên ví dụ.',[
    turn('Nghe số và ghi chữ số.','3 — three','Nghe số riêng trong thứ tự mới.','13:numbers',['Tôi nghe trước khi xem.'],word('three'),'three'),
    turn('Nhân vật 12 tuổi. Nói câu tuổi đầy đủ.','I’m twelve years old.','twelve không có teen.','14:age,14:numbers',['Tôi chọn đúng twelve.']),
    turn('Giới thiệu quyển sách đỏ của bạn.','This is my red book.','Giữ This is my, đổi màu và đồ vật.','16:phrase,18:this',['Tôi đổi thông tin và giữ mẫu.']),
    turn('Nói cụm “chị hoặc em gái tôi”, ghi rõ từ đó có nói tuổi lớn/nhỏ không.','my sister; sister không nói rõ lớn/nhỏ tuổi.','Tiếng Anh không phân biệt chị/em trong từ sister riêng.','17:family,17:my',['Tôi không suy ra tuổi chỉ từ sister.'])
  ]);
  add(4,'a','Giới thiệu mình và bố','Bạn tạo vài câu để người nghe biết ai có nghề gì. Chưa cần dùng mẫu hỏi tên của chặng sau.',[
    turn('Tự giới thiệu nhân vật Mai bằng I am hoặc I’m.','I’m Mai.','I am nối người nói với tên; tránh I’m am.','20:am,20:short',['Tôi có am hoặc dạng gọn.']),
    turn('Nói Mai là học viên; sau đó phủ định Mai là giáo viên.','I’m a student. I’m not a teacher.','a trước nghề; not sau am.','20:job,22:not',['Tôi có a trước nghề.','Tôi đặt not đúng chỗ.']),
    turn('Giới thiệu bố là giáo viên bằng hai câu liên kết.','This is my father. He is a teacher.','He nhắc lại người bố trong tình huống.','24:intro,24:follow',['Tôi dùng he theo người vừa giới thiệu.']),
    turn('Nghe câu hỏi. Trả lời có, với vai Mai là học viên.','Yes, I am.','Người hỏi gọi bạn là you; bạn đáp về mình bằng I. Không kết thúc Yes, I’m.','23:question,23:reply,23:no-short',['Tôi trả lời về đúng người.'],phrase('Are you a student?'),'Are you a student?')
  ]);
  add(4,'b','Người thân và trạng thái','Đổi người, nghề và trạng thái; giữ thông tin nhất quán.',[
    turn('Nhân vật An mệt. Viết câu về mình.','I am tired.','Trạng thái tired không có a phía trước.','20:am,20:job',['Tôi không thêm a trước tired.']),
    turn('Giới thiệu mẹ tưởng tượng là giáo viên bằng hai câu.','This is my mother. She is a teacher.','She nhắc mother trong ngữ cảnh đã nêu.','24:intro,24:follow',['Tôi có is và a khi nói nghề.']),
    turn('Hỏi mẹ có vui không, dùng she thay cho mẹ.','Is she happy?','Đưa is ra trước she.','23:question',['Tôi đảo be ra trước người.']),
    turn('Nghe câu hỏi và trả lời không; nhân vật An không phải giáo viên.','No, I’m not.','Câu đáp đổi you thành I; phủ định có not.','23:reply,22:not',['Tôi trả lời đúng ý phủ định.'],phrase('Are you a teacher?'),'Are you a teacher?')
  ]);
  add(5,'a','Làm quen với đồng nghiệp','Bạn đóng vai Mai, quê Hà Nội, sống Huế, là giáo viên. Có thể dùng thông tin tưởng tượng như hồ sơ này.',[
    turn('Nghe và đáp câu hỏi tên.','My name is Mai.','Câu hỏi cần tên, không hỏi trạng thái.','26:name',['Tôi đáp đúng mục đích câu hỏi.'],phrase('What’s your name?'),'What’s your name?'),
    turn('Nghe yêu cầu và đánh vần tên của nhân vật.','M–A–I','Nói từng tên chữ theo thứ tự.','26:spell,6:spell',['Tôi đánh vần, không chỉ nói lại cả tên.'],phrase('Can you spell that, please?'),'Can you spell that, please?'),
    turn('Nghe và đáp về nơi đang sống.','I live in Hue.','live hỏi hiện sống ở đâu; quê của nhân vật là Hà Nội.','27:live,27:from',['Tôi không nhầm nơi sống với xuất thân.'],phrase('Where do you live?'),'Where do you live?'),
    turn('Nghe câu hỏi nghề. Đáp rồi xin nói chậm ở lượt tiếp theo.','I’m a teacher. Please speak slowly.','Cần nói chậm thì nêu nhu cầu; không cố đoán mọi từ.','28:ask,28:job,29:repair',['Tôi nói nghề có a.','Tôi biết xin hỗ trợ.'],phrase('What do you do?'),'What do you do?')
  ]);
  add(5,'b','Đổi thứ tự câu hỏi','Bạn đóng vai An, quê Việt Nam, sống Hà Nội, là học viên. Lần này câu hỏi đến theo thứ tự khác.',[
    turn('Nghe và đáp nơi xuất thân.','I’m from Vietnam.','from chỉ xuất thân, không nhất thiết là nơi đang sống.','27:from',['Tôi chọn đúng thông tin quê quán.'],phrase('Where are you from?'),'Where are you from?'),
    turn('Nghe và trả lời nghề/việc học của nhân vật.','I’m a student.','Trong buổi làm quen, câu này hỏi nghề hoặc việc học.','28:ask,28:job',['Tôi không trả lời bằng địa điểm.'],phrase('What do you do?'),'What do you do?'),
    turn('Bạn chưa nghe rõ câu tiếp theo. Xin người kia nhắc lại lịch sự.','Can you say that again, please?','Dùng nhu cầu cụ thể thay vì đoán; nhắc lại khác nói chậm.','29:repair',['Tôi có câu xin nhắc lại.']),
    turn('Nghe câu hỏi tên, đáp rồi cảm ơn sau khi được giúp.','My name is An. Thank you.','Đổi lại đúng tên nhân vật; cảm ơn phù hợp sau hỗ trợ.','26:name,29:polite',['Tôi giữ thông tin nhân vật nhất quán.'],phrase('What’s your name?'),'What’s your name?')
  ]);
  add(6,'a','Một ngày của hai người','Bạn nói lịch của mình và người anh/em trai. Chọn thời gian đã học, không cần viết lịch thật.',[
    turn('Nói bạn học tiếng Anh vào ban đêm.','I study English at night.','Hành động sau I dùng study, không thêm am.','31:verbs,32:simple,32:time',['Tôi không thêm be trước study.']),
    turn('Đổi câu trên sang nói về anh/em trai bằng He.','He studies English at night.','study đổi thành studies khi khẳng định về he.','33:s,33:changes',['Tôi đổi study thành studies.']),
    turn('Nói anh/em trai không làm việc vào ban đêm.','He doesn’t work at night.','Sau doesn’t dùng work cơ bản.','34:does',['Tôi không thêm s sau doesn’t.']),
    turn('Nghe câu hỏi và trả lời có theo vai của bạn.','Yes, I do.','Hỏi bằng Do thì dùng do trong câu đáp ngắn.','35:ask,35:reply',['Tôi không đáp bằng Yes, I am cho câu hành động.'],phrase('Do you study English?'),'Do you study English?')
  ]);
  add(6,'b','Kể lịch của cô ấy','Thay chủ thể và hoạt động. Kiểm tra từng câu trước khi đọc cả đoạn.',[
    turn('Nói cô ấy ăn sáng.','She has breakfast.','have đổi thành has trong câu khẳng định she.','31:chunks,33:changes',['Tôi dùng has, không haves.']),
    turn('Nói cô ấy không học vào ban đêm.','She doesn’t study at night.','doesn’t đi cùng dạng cơ bản study.','34:does,32:time',['Tôi không giữ studies sau doesn’t.']),
    turn('Đặt câu hỏi xem cô ấy có làm việc ở Huế không.','Does she work in Hue?','Does đứng trước she; work không thêm s.','35:ask,27:place',['Tôi có Does và dạng cơ bản work.']),
    turn('Nghe rồi trả lời không; cô ấy không làm việc ở Huế trong tình huống này.','No, she doesn’t.','Dùng she và doesn’t theo câu hỏi.','35:reply',['Tôi giữ đúng người được nhắc.'],phrase('Does she work in Hue?'),'Does she work in Hue?')
  ]);
  add(7,'a','Hẹn học ở quán','Bạn dùng tiếng Anh để gọi đồ uống, hẹn giờ và tìm đồ vật. Chỉ cần truyền được thông tin trong phạm vi đã học.',[
    turn('Gọi một tách trà lịch sự bằng mẫu đầy đủ.','I’d like a cup of tea, please.','Dùng mẫu gọi món đã học; dạng I would like cũng hợp lệ.','39:order,39:menu',['Tôi có món và please.']),
    turn('Nghe câu hỏi và đáp không cần thêm món.','No, thank you.','Anything else? hỏi có muốn thêm gì, không phải một lời cảm ơn.','39:reply',['Tôi trả lời đúng ý hỏi thêm.'],phrase('Anything else?'),'Anything else?'),
    turn('Bút ở trong túi. Nói vị trí bằng The pen...','The pen is in the bag.','in là ở trong; câu hoàn chỉnh có is.','40:position,40:examples',['Tôi có is và vị trí đúng.']),
    turn('Viết lời nhắn cho Mai: hẹn ngày mai lúc 8 giờ, nhờ mang bút của tôi, ký An. Nếu cần rõ sáng/tối, hãy tự thêm a.m./p.m.','Hi, Mai. Let’s meet tomorrow at eight. Please bring my pen. Thank you. An.','Mẫu chưa chỉ sáng/tối. Chỉ thêm theo ý bạn muốn hẹn, không suy diễn giờ từ đề.','41:message,41:chunks,41:check,37:time',['Có người nhận, việc và giờ.','Có yêu cầu mang vật và tên người gửi.'])
  ]);
  add(7,'b','Buổi học thay đổi','Đổi món, vị trí và giờ. Cuối cùng nói một sở thích để tiếp tục trò chuyện.',[
    turn('Gọi một cà phê bằng mẫu ngắn lịch sự.','A coffee, please.','Trong ngữ cảnh gọi món, a coffee là một suất/cốc cà phê.','39:order,39:menu',['Tôi nói rõ món và lịch sự.']),
    turn('Nghe câu hỏi rồi đáp không thích trà.','No, I don’t. I like coffee.','like là hành động; câu đáp dùng don’t, không dùng am not.','38:forms,38:drinks,35:reply',['Tôi đáp đúng ý thích/không thích.'],phrase('Do you like tea?'),'Do you like tea?'),
    turn('Túi ở dưới bàn. Nói vị trí rồi hỏi bút của tôi ở đâu.','The bag is under the desk. Where is my pen?','under là dưới; Where is hỏi một vật.','40:where,40:position',['Tôi phân biệt câu tả và câu hỏi.']),
    turn('Viết lời nhắn cho An hẹn 7 giờ rưỡi, nhờ mang sách; ký Mai. Ghi thêm sáng/tối theo ý mình nếu cần.','Hi, An. Let’s meet at half past seven. Please bring my book. Thank you. Mai.','half past seven là 7:30; kiểm tra người nhận/vật/tên ký khác tình huống trước.','37:time,41:message,41:chunks',['Tôi đổi đúng giờ và vật.','Người đọc biết ai nhắn cho ai.'])
  ]);
  function validate(lessons){const errors=[],ids=new Set();for(const scene of scenes){if(ids.has(scene.id)||scene.turns.length!==4)errors.push(scene.id);ids.add(scene.id);for(const t of scene.turns){if(ids.has(t.id)||!t.model||!t.prompt||!t.why||!t.checks.length)errors.push(t.id);ids.add(t.id);for(const ref of t.refs){const m=/^(\d+):(.*)$/.exec(ref);if(!m||+m[1]>scene.day||!lessons[+m[1]-1]?.concepts.some(c=>c.id===m[2]))errors.push(`${t.id}: ${ref}`);}}}return errors;}
  return {edition,scenes,validate};
});
