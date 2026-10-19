(function (root, factory) {
  const value = factory();
  if (typeof module === 'object' && module.exports) module.exports = value;
  else root.Curriculum = value;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const choice = (prompt, options, answer, explanation, skill = 'grammar') => ({ type: 'choice', prompt, options, answers: [answer], explanation, skill });
  const text = (prompt, answer, explanation, skill = 'writing', variants = []) => ({ type: 'text', prompt, answers: [answer, ...variants], explanation, skill });
  const order = (prompt, answer, explanation) => ({ type: 'order', prompt, words: answer.replace(/[.!?]/g, '').split(' '), answers: [answer], explanation, skill: 'writing' });
  const read = (passage, prompt, options, answer, explanation) => ({ ...choice(prompt, options, answer, explanation, 'reading'), passage });
  const lessons = [];
  function add(day, title, goal, review, teaching, vocabulary, dialogue, speaking, questions, test, summary, homework) {
    const vocab = vocabulary.trim().split('\n').map((row, index) => {
      const [term, ipa, meaning, example, translation] = row.split('|');
      return { id: `d${day}-v${index + 1}`, term, ipa, meaning, example, translation };
    });
    const auto = [
      choice(`Ghép nghĩa: “${vocab[0].term}” là gì?`, vocab.slice(0, 4).map(v => v.meaning), vocab[0].meaning, `${vocab[0].term}: ${vocab[0].meaning}. ${vocab[0].example} — ${vocab[0].translation}`, 'vocabulary'),
      choice(`Chọn từ cho nghĩa “${vocab[1].meaning}”.`, vocab.slice(0, 4).map(v => v.term), vocab[1].term, `${vocab[1].term} ${vocab[1].ipa} nghĩa là ${vocab[1].meaning}.`, 'vocabulary'),
      { ...text('Nghe rồi nhập từ/cụm từ. Có thể nghe chậm hoặc mở văn bản hỗ trợ.', vocab[2].term, `${vocab[2].term} ${vocab[2].ipa}: ${vocab[2].meaning}.`, 'listening'), audio: vocab[2].term },
      choice(`Ghép “${vocab[3].term}” với nghĩa đúng.`, vocab.slice(1, 5).map(v => v.meaning), vocab[3].meaning, `${vocab[3].example} — ${vocab[3].translation}`, 'vocabulary')
    ];
    const lesson = { day, title, goal, review, teaching, vocab, dialogue, speaking, summary, homework, minutes: [7, 14, 21, 30].includes(day) ? 18 : 17, consolidation: [7, 14, 21, 30].includes(day) };
    lesson.practice = [...auto, ...questions].map((q, i) => ({ ...q, ...(i < 4 ? { word: vocab[i].id } : {}), id: `d${day}-p${i + 1}` }));
    lesson.test = test.map((q, i) => ({ ...q, id: `d${day}-t${i + 1}` }));
    lessons.push(lesson);
  }
  add(1, 'Tên chữ A–F và cách học âm', 'Nhận ra và đọc tên A–F; phân biệt tên chữ và âm trong từ.', '',
    ['Chữ cái là ký hiệu viết. Tên chữ dùng khi đánh vần: A /eɪ/, B /biː/, C /siː/, D /diː/, E /iː/, F /ɛf/. Chữ hoa A và chữ thường a là cùng một chữ.', 'IPA là bảng ký hiệu âm quốc tế; phần giữa hai dấu / / biểu diễn âm, không phải cách đọc tiếng Việt. A có tên /eɪ/ nhưng âm đầu trong apple là /æ/. Không đọc tên từng chữ để đoán phát âm cả từ.', 'Đọc trọn cụm “A is for apple.” — A đại diện cho từ apple. Hôm nay học cụm “is for” như nhãn minh họa, chưa cần phân tích ngữ pháp. “Say apple.” nghĩa là “Hãy đọc apple”. Với /æ/, mở miệng rộng, lưỡi thấp phía trước; không thay bằng tên chữ /eɪ/.'],
    `apple|/ˈæpəl/|quả táo|A is for apple.|A đại diện cho từ quả táo.
bag|/bæɡ/|cái túi|B is for bag.|B đại diện cho từ cái túi.
cat|/kæt/|con mèo|C is for cat.|C đại diện cho từ con mèo.
dog|/dɔɡ/|con chó|D is for dog.|D đại diện cho từ con chó.
egg|/ɛɡ/|quả trứng|E is for egg.|E đại diện cho từ quả trứng.`,
    [['A, B, C, D, E, F.', 'Tên sáu chữ đầu.'], ['A is for apple. B is for bag.', 'A đại diện apple, B đại diện bag.']], 'Nghe tên chữ một lần; đọc theo hai lần. Sau đó nghe apple và bag, chú ý âm /æ/. Chưa cần đọc IPA thật nhanh.',
    [choice('Tên chữ A là gì?', ['/eɪ/', '/æ/', '/biː/'], '/eɪ/', '/eɪ/ là tên chữ A; /æ/ là âm đầu của apple.', 'sounds'), choice('Chữ thường của B?', ['b', 'd', 'p'], 'b', 'B và b là hai dạng viết của cùng một chữ.', 'letters'), text('Điền chữ tiếp theo: A, B, __.', 'C', 'Thứ tự là A, B, C.', 'letters'), choice('Âm đầu trong apple?', ['/æ/', '/eɪ/', '/iː/'], '/æ/', 'Tên chữ và âm trong từ có thể khác nhau.', 'sounds')],
    [choice('Tên chữ B?', ['/biː/', '/diː/', '/ɛf/'], '/biː/', 'B có tên /biː/.', 'letters'), text('Viết chữ thường của D.', 'd', 'D viết thường là d.', 'letters'), choice('A và a có phải cùng chữ?', ['Có', 'Không'], 'Có', 'Đây là dạng hoa và thường của A.', 'letters')],
    'Tên chữ dùng để đánh vần; âm dùng khi đọc từ. A /eɪ/ khác âm /æ/ trong apple.', 'Che tên chữ, gọi lại A–F. Nghe và đọc apple, bag, cat mỗi từ hai lần.');
  add(2, 'Tên chữ G–M và âm ngắn', 'Đọc tên G–M và nhận ra âm /ɛ/ trong egg, /ɪ/ trong fish.', 'Gọi tên A, B, C; nhắc lại vì sao A trong apple không đọc /eɪ/.',
    ['Ôn A–F trước, rồi thêm G /dʒiː/, H /eɪtʃ/, I /aɪ/, J /dʒeɪ/, K /keɪ/, L /ɛl/, M /ɛm/. Không đọc chữ J thành tên chữ G.', '/ɛ/ trong egg: miệng mở vừa, lưỡi ở phía trước. /ɪ/ trong fish: âm ngắn, môi thả lỏng. Tên chữ E /iː/ không phải âm /ɛ/ trong egg.', 'Tiếp tục dùng mẫu “F is for fish.” — F đại diện fish; fish là con cá. Âm /f/: răng trên chạm nhẹ môi dưới và thổi hơi, không thêm nguyên âm phía sau.'],
    `fish|/fɪʃ/|con cá|F is for fish.|F đại diện cho từ con cá.
hat|/hæt/|cái mũ|H is for hat.|H đại diện cho từ cái mũ.
ink|/ɪŋk/|mực viết|I is for ink.|I đại diện cho từ mực viết.
jam|/dʒæm/|mứt|J is for jam.|J đại diện cho từ mứt.
milk|/mɪlk/|sữa|M is for milk.|M đại diện cho từ sữa.`,
    [['G, H, I, J, K, L, M.', 'Tên chữ G–M.'], ['F is for fish. M is for milk.', 'F đại diện fish, M đại diện milk.']], 'Nghe fish, milk rồi đọc chậm; giữ âm /ɪ/ ngắn. So sánh egg và fish, không dùng tên chữ E/I để đọc hai từ.',
    [choice('Tên chữ H?', ['/eɪtʃ/', '/dʒiː/', '/ɛm/'], '/eɪtʃ/', 'H có tên /eɪtʃ/.', 'letters'), text('Điền: H, I, __, K.', 'J', 'J nằm giữa I và K.', 'letters'), choice('Âm trong fish?', ['/ɪ/', '/aɪ/', '/iː/'], '/ɪ/', 'fish /fɪʃ/ có /ɪ/ ngắn.', 'sounds'), choice('Âm đầu trong egg?', ['/ɛ/', '/iː/', '/eɪ/'], '/ɛ/', 'egg có /ɛ/; E có tên /iː/.', 'sounds')],
    [choice('Tên chữ I?', ['/aɪ/', '/ɪ/', '/ɛl/'], '/aɪ/', 'Đây là tên chữ, không phải âm trong ink.', 'letters'), text('Điền chữ trước M: __, M.', 'L', 'L đứng ngay trước M.', 'letters'), choice('fish nghĩa là gì?', ['con cá', 'sữa', 'mực viết'], 'con cá', 'fish là con cá.', 'vocabulary')],
    'Đã biết tên A–M. Phân biệt /ɛ/, /ɪ/ với tên E, I.', 'Đánh vần tên chữ A–M một lượt. Che nghĩa của fish, hat, ink, jam, milk rồi tự nhớ lại.');
  add(3, 'Tên chữ N–T và âm cuối', 'Đọc N–T, giữ âm cuối /t/, /p/ khi đọc từ ngắn.', 'Nhắc lại G–M; nghe lại milk và fish, nhận ra /ɪ/.',
    ['Tên chữ mới: N /ɛn/, O /oʊ/, P /piː/, Q /kjuː/, R /ɑr/, S /ɛs/, T /tiː/ theo giọng Mỹ. R có thể khác trong giọng Anh; khóa học chọn quy ước Mỹ.', 'Âm cuối là âm ở cuối từ. cat /kæt/ kết thúc bằng /t/, cup /kʌp/ kết thúc bằng /p/. Đặt lưỡi hoặc môi đúng vị trí; không thêm “ơ” sau từ. Không cần bật hơi thật mạnh.', 'Âm /s/ trong sun: để luồng hơi đi qua khe hẹp phía trước, không rung cổ. Mẫu “S is for sun.” vẫn chỉ là nhãn từ vựng.'],
    `sun|/sʌn/|mặt trời|S is for sun.|S đại diện cho từ mặt trời.
pen|/pɛn/|bút mực|P is for pen.|P đại diện cho từ bút mực.
cup|/kʌp/|cái cốc|C is for cup.|C đại diện cho từ cái cốc.
red|/rɛd/|màu đỏ|R is for red.|R đại diện cho từ màu đỏ.
ten|/tɛn/|số mười|T is for ten.|T đại diện cho từ số mười.`,
    [['N, O, P, Q, R, S, T.', 'Tên chữ N–T.'], ['Say cat. Say cup. Say pen.', 'Hãy đọc cat, cup, pen.']], 'Đọc cat và cup hai lượt; đặt tay trước miệng để nhận ra hơi nhẹ cuối từ. Nghe sun rồi đọc theo, không thêm tiếng sau n.',
    [choice('Tên chữ Q?', ['/kjuː/', '/piː/', '/tiː/'], '/kjuː/', 'Q có tên /kjuː/.', 'letters'), text('Điền: Q, R, __, T.', 'S', 'S đứng giữa R và T.', 'letters'), choice('Âm cuối của cup?', ['/p/', '/k/', '/t/'], '/p/', 'cup /kʌp/ có /p/ cuối.', 'sounds'), choice('Đọc cat cần thêm nguyên âm sau /t/ không?', ['Không', 'Có'], 'Không', 'Giữ âm cuối, không thêm âm tiết mới.', 'sounds')],
    [text('Chữ sau N?', 'O', 'N, O, P.', 'letters'), choice('pen nghĩa là gì?', ['bút mực', 'cốc', 'mặt trời'], 'bút mực', 'pen /pɛn/ là bút mực.', 'vocabulary'), choice('Âm cuối của cat?', ['/t/', '/p/', '/s/'], '/t/', 'cat kết thúc bằng /t/.', 'sounds')],
    'Đã biết tên A–T. Âm cuối thuộc từ, không phải tên chữ cuối.', 'Đọc cat, cup, pen chậm; nhớ lại N–T không nhìn văn bản.');
  add(4, 'Hoàn thành A–Z và đánh vần', 'Đọc đủ bảng chữ cái và đánh vần tên ngắn.', 'Gọi tên N–T; đọc cup với âm /p/ cuối.',
    ['Nhóm cuối: U /juː/, V /viː/, W /ˈdʌbəl juː/, X /ɛks/, Y /waɪ/, Z /ziː/ (Mỹ). /zɛd/ cũng là tên Z trong giọng Anh, nhưng bài tên chữ ở đây dùng Mỹ.', 'Đánh vần nghĩa là đọc tên từng chữ: cat → C–A–T. Phát âm cả từ cat là /kæt/, không đọc C–A–T thay cho từ trong câu.', '“Spell cat.” — Hãy đánh vần cat. “My name is An.” — Tên tôi là An: học như một cụm giới thiệu cố định; my = của tôi, name = tên. Với /v/, răng trên chạm môi dưới như /f/ nhưng cổ có rung.'],
    `van|/væn/|xe tải nhỏ|V is for van.|V đại diện cho xe tải nhỏ.
box|/bɑks/|cái hộp|X is in box.|X nằm trong từ box.
yes|/jɛs/|vâng; có|Say yes.|Hãy nói vâng.
zoo|/zuː/|sở thú|Z is for zoo.|Z đại diện cho sở thú.
name|/neɪm/|tên|My name is An.|Tên tôi là An.`,
    [['My name is An. A, N.', 'Tên tôi là An. Đánh vần A, N.'], ['Spell cat. C, A, T.', 'Đánh vần cat: C, A, T.']], 'Nói tên bạn, rồi đọc tên từng chữ trong tên không dấu. Nghe van để cảm nhận /v/ rung cổ; không dùng /viː/ thay âm đầu từ.',
    [choice('Tên chữ W?', ['/ˈdʌbəl juː/', '/viː/', '/waɪ/'], '/ˈdʌbəl juː/', 'W có tên gồm nhiều âm tiết.', 'letters'), text('Đánh vần dog bằng chữ, cách nhau bằng dấu cách.', 'D O G', 'Đọc tên D–O–G khi đánh vần.', 'letters'), choice('Tên Z theo quy ước Mỹ?', ['/ziː/', '/zɛd/', '/ɛks/'], '/ziː/', 'Khóa dùng giọng Mỹ; /zɛd/ là biến thể Anh hợp lệ ngoài bài này.', 'letters'), choice('Đọc cả từ cat?', ['/kæt/', 'C–A–T'], '/kæt/', 'C–A–T là đánh vần; /kæt/ là phát âm từ.', 'sounds')],
    [text('Điền: X, Y, __.', 'Z', 'Z là chữ cuối bảng.', 'letters'), text('Đánh vần An, cách nhau bằng dấu cách.', 'A N', 'Tên không dấu An gồm A và N.', 'letters'), choice('My name is An. nghĩa là gì?', ['Tên tôi là An.', 'Tôi có cái hộp.'], 'Tên tôi là An.', 'Học cả cụm giới thiệu tên.', 'reading')],
    'Đã có tên A–Z. Đánh vần và phát âm từ là hai việc khác nhau.', 'Đánh vần tên của bạn và ba từ cat, dog, pen.');
  add(5, 'Ghép âm vào từ và nhận diện đồ vật', 'Phân biệt /æ/, /ɛ/, /ɪ/ và nói mẫu “It is a …”.', 'Đánh vần cat rồi phát âm cả từ; nhắc tên chữ A.',
    ['Ba âm đã gặp: cat /kæt/, pen /pɛn/, fish /fɪʃ/. Đọc chậm âm đầu, âm giữa, âm cuối rồi nối thành từ. Cách viết không quyết định duy nhất phát âm; luôn nghe và xem IPA.', '“It is a pen.” — Đó là một cây bút. It chỉ đồ vật đang nói đến; is đi cùng it; a nghĩa là một, đặt trước danh từ số ít bắt đầu bằng âm phụ âm. Danh từ là từ gọi tên người/vật.', '“It is an egg.” — Đó là một quả trứng. Dùng an trước âm nguyên âm như /ɛ/ trong egg, /æ/ trong apple. Chọn theo âm đầu, không chỉ nhìn chữ viết. Chưa học dạng số nhiều trong buổi này.'],
    `map|/mæp/|bản đồ|It is a map.|Đó là một bản đồ.
bed|/bɛd/|cái giường|It is a bed.|Đó là một cái giường.
book|/bʊk/|quyển sách|It is a book.|Đó là một quyển sách.
desk|/dɛsk/|bàn học; bàn làm việc|It is a desk.|Đó là một chiếc bàn học.
sit|/sɪt/|ngồi|Say sit.|Hãy đọc từ “sit” (ngồi).`,
    [['It is a pen. It is an egg.', 'Đó là một cây bút. Đó là một quả trứng.'], ['It is a cat. It is an apple.', 'Đó là một con mèo. Đó là một quả táo.']], 'Nghe một câu, dừng rồi nói theo. Thay pen bằng cat; thay egg bằng apple và giữ an. Đọc trọn câu, không đọc tên từng chữ.',
    [text('Điền a hoặc an: It is __ egg.', 'an', 'egg bắt đầu bằng âm nguyên âm /ɛ/.'), text('Điền a hoặc an: It is __ pen.', 'a', 'pen bắt đầu bằng phụ âm /p/.'), order('Sắp xếp: pen / a / is / It', 'It is a pen.', 'Mẫu It + is + a + vật.'), choice('Từ có âm /æ/?', ['cat', 'pen', 'fish'], 'cat', 'cat /kæt/ có âm /æ/.', 'sounds')],
    [text('Điền: It __ a cat.', 'is', 'It dùng is.'), choice('Câu đúng?', ['It is an apple.', 'It is a apple.'], 'It is an apple.', 'apple bắt đầu bằng /æ/.'), text('Tên chữ A có giống âm đầu apple không? Nhập có hoặc không.', 'không', 'Tên /eɪ/ khác âm /æ/.', 'sounds')],
    'Đọc từ theo âm, dùng It is a/an để gọi tên một vật.', 'Chỉ vào hai đồ vật đã học, nói It is a…; nghe lại ba âm ngắn.');
  add(6, 'Số 0–10 và số điện thoại', 'Đọc số 0–10 và một dãy số từng chữ số.', 'Nói It is a pen; chọn a/an trước egg.',
    ['Số đếm: zero 0, one 1, two 2, three 3, four 4, five 5, six 6, seven 7, eight 8, nine 9, ten 10. Nhóm 6–10 là phần luyện thêm sau khi chắc 0–5.', 'Số điện thoại đọc từng chữ số: 203 → two, zero, three. Không ghép thành “two hundred…” trong bài này. zero đọc rõ để tránh nhầm với chữ O.', 'Mẫu “My number is two, zero, three.” — Số của tôi là 203. number nghĩa là số. /θ/ trong three: đưa đầu lưỡi nhẹ giữa hai hàm răng, thổi hơi, không rung cổ.'],
    `zero|/ˈzɪroʊ/|số không|My number is zero, two.|Số của tôi là 02.
one|/wʌn/|số một|My number is one, two.|Số của tôi là 12.
two|/tuː/|số hai|My number is two, one.|Số của tôi là 21.
three|/θriː/|số ba|My number is three, two.|Số của tôi là 32.
four|/fɔr/|số bốn|My number is four, one.|Số của tôi là 41.
five|/faɪv/|số năm|My number is five, zero.|Số của tôi là 50.`,
    [['My number is two, zero, three.', 'Số của tôi là 203.'], ['One, two, three, four, five.', 'Một, hai, ba, bốn, năm.']], 'Nghe dãy 203 và ghi lại. Đọc 501 hai lần theo từng chữ số. Đặt lưỡi đúng khi đọc three; không cần nói nhanh.',
    [choice('203 đọc từng chữ số là?', ['two, zero, three', 'three, zero, two'], 'two, zero, three', 'Đọc lần lượt từ trái sang phải.', 'numbers'), text('Viết bằng số: five, zero, one.', '501', 'five = 5, zero = 0, one = 1.', 'numbers'), choice('Số 4 là?', ['four', 'five', 'three'], 'four', 'four là 4.', 'numbers'), choice('Trong three, /θ/ cần rung cổ không?', ['Không', 'Có'], 'Không', '/θ/ là âm không rung cổ.', 'sounds')],
    [text('Viết số của từ two.', '2', 'two là 2.', 'numbers'), choice('zero nghĩa là?', ['0', '1', '10'], '0', 'zero là 0.', 'numbers'), text('Viết dãy số: three, one, four.', '314', 'Đọc từng chữ số 3–1–4.', 'numbers')],
    'Đọc số điện thoại từng chữ số; phân biệt zero và tên chữ O.', 'Đọc số giả 203 và 501; không đăng số điện thoại thật lên bài học.');
  add(7, 'Ôn tuần 1: chữ, âm và số', 'Vận dụng tên chữ, âm trong từ và số 0–5 mà không thêm cấu trúc mới.', 'Ôn bài 6: đọc 203. Sau đó gọi tên A và đọc apple.',
    ['Hôm nay ưu tiên nhớ lại: thử trả lời trước rồi mới mở bài cũ. Nếu nhầm tên A với âm apple, nghe lại hai mục riêng.', 'Đánh vần cat bằng tên chữ C–A–T; đọc cat bằng /kæt/. Dùng It is a/an… cho một vật; an đứng trước âm nguyên âm.', 'Không học thêm ngữ pháp mới. Luyện ba việc: nhận tên chữ, nghe từ, đọc dãy số. Chưa cần đếm nhanh hoặc đọc câu dài.'],
    `apple|/ˈæpəl/|quả táo|It is an apple.|Đó là một quả táo.
cat|/kæt/|con mèo|It is a cat.|Đó là một con mèo.
pen|/pɛn/|bút mực|It is a pen.|Đó là một cây bút.
two|/tuː/|số hai|My number is two, one.|Số của tôi là 21.
name|/neɪm/|tên|My name is An.|Tên tôi là An.`,
    [['My name is An. A, N.', 'Tên tôi là An. A, N.'], ['It is a cat. My number is two, one.', 'Đó là một con mèo. Số của tôi là 21.']], 'Tự nói tên và đánh vần; nghe lại cat, pen, apple. Che văn bản lần hai rồi đối chiếu.',
    [choice('A trong apple có âm đầu nào?', ['/æ/', '/eɪ/', '/iː/'], '/æ/', 'Tên chữ A /eɪ/ khác âm đầu apple.', 'sounds'), text('Đánh vần pen, dùng dấu cách.', 'P E N', 'Dùng tên từng chữ P–E–N.', 'letters'), text('Điền: It is __ apple.', 'an', 'apple bắt đầu bằng /æ/.'), text('Viết dãy số two, zero, one.', '201', 'two = 2, zero = 0, one = 1.', 'numbers')],
    [choice('Tên chữ C?', ['/siː/', '/k/', '/æ/'], '/siː/', 'Tên C /siː/ khác âm /k/ trong cat.', 'letters'), order('Sắp xếp: cat / a / is / It', 'It is a cat.', 'Mẫu gọi tên vật đã học.'), text('Viết số five.', '5', 'five = 5.', 'numbers')],
    'Tuần 1 xây nền tên chữ, vài âm và cách đọc số. Cần ôn lỗi trước khi học thêm.', 'Chọn hai câu sai trong tuần, đọc lời giải rồi tự làm lại ngày mai.');
  add(8, 'Chào hỏi và lời lịch sự', 'Chào, cảm ơn, xin lỗi và đáp lời đơn giản.', 'Đọc tên mình và dãy số 201; dùng It is a cat.',
    ['Hello và hi đều là lời chào; hi thân mật hơn. Good morning dùng buổi sáng. Goodbye dùng khi tạm biệt.', '“Thank you.” — Cảm ơn. “You are welcome.” — Không có gì: học như lời đáp cố định. “Sorry.” — Xin lỗi. “Please.” làm lời yêu cầu lịch sự hơn.', '“How are you?” — Bạn khỏe không? “I am fine.” — Tôi khỏe. I = tôi; am đi với I. Hôm nay tập dùng cả cụm, các bài 11–12 sẽ giải thích chi tiết đại từ và be.'],
    `hello|/həˈloʊ/|xin chào|Hello, An.|Xin chào An.
goodbye|/ɡʊdˈbaɪ/|tạm biệt|Goodbye, An.|Tạm biệt An.
thank you|/ˈθæŋk juː/|cảm ơn|Thank you, An.|Cảm ơn An.
sorry|/ˈsɑri/|xin lỗi|Sorry, An.|Xin lỗi An.
please|/pliːz/|làm ơn|Say hello, please.|Làm ơn nói xin chào.
fine|/faɪn/|khỏe; ổn|I am fine.|Tôi khỏe.`,
    [['Hello. How are you?', 'Xin chào. Bạn khỏe không?'], ['I am fine. Thank you.', 'Tôi khỏe. Cảm ơn.']], 'Đổi vai: một người chào và hỏi thăm, người kia trả lời theo mẫu. Tự đọc nếu học một mình; không cần ghi âm hoặc điểm phát âm.',
    [choice('Rời buổi học, nói gì?', ['Goodbye.', 'Hello.', 'Sorry.'], 'Goodbye.', 'Goodbye dùng khi tạm biệt.', 'conversation'), choice('Đáp lại Thank you bằng câu nào?', ['You are welcome.', 'Good morning.'], 'You are welcome.', 'Lời đáp nghĩa là không có gì.', 'conversation'), order('Sắp xếp: fine / am / I', 'I am fine.', 'I đi với am trong cụm đã học.'), text('Điền: Thank __.', 'you', 'Thank you là cảm ơn.', 'conversation')],
    [choice('Lời xin lỗi?', ['Sorry.', 'Goodbye.', 'Hi.'], 'Sorry.', 'Sorry dùng để xin lỗi.', 'conversation'), text('Điền: I __ fine.', 'am', 'I am fine = tôi khỏe.'), choice('Good morning dùng khi nào?', ['Buổi sáng', 'Lúc tạm biệt'], 'Buổi sáng', 'morning là buổi sáng.', 'conversation')],
    'Dùng đúng lời chào, cảm ơn, xin lỗi và hỏi thăm ngắn.', 'Nói hội thoại chào hỏi hai lượt; ôn lời đáp You are welcome.');
  add(9, 'Ngày trong tuần và lịch học', 'Nói hôm nay là thứ mấy và xác định ngày học.', 'Đáp How are you bằng I am fine. Nói lời cảm ơn.',
    ['Các ngày: Monday thứ Hai, Tuesday thứ Ba, Wednesday thứ Tư, Thursday thứ Năm, Friday thứ Sáu, Saturday thứ Bảy, Sunday Chủ nhật. Tên ngày viết hoa.', '“Today is Monday.” — Hôm nay là thứ Hai. Today nghĩa là hôm nay. “My class is on Monday.” — Lớp của tôi vào thứ Hai. class = lớp học; dùng on trước ngày trong tuần.', 'Học chính năm ngày Monday–Friday; Saturday và Sunday để nhận diện cuối tuần. Không cần nhớ toàn bộ chính tả ngay; có thể nhìn bảng khi nói.'],
    `Monday|/ˈmʌndeɪ/|thứ Hai|Today is Monday.|Hôm nay là thứ Hai.
Tuesday|/ˈtuːzdeɪ/|thứ Ba|Today is Tuesday.|Hôm nay là thứ Ba.
Wednesday|/ˈwɛnzdeɪ/|thứ Tư|Today is Wednesday.|Hôm nay là thứ Tư.
Thursday|/ˈθɝzdeɪ/|thứ Năm|Today is Thursday.|Hôm nay là thứ Năm.
Friday|/ˈfraɪdeɪ/|thứ Sáu|Today is Friday.|Hôm nay là thứ Sáu.`,
    [['Today is Monday. My class is on Tuesday.', 'Hôm nay là thứ Hai. Lớp của tôi vào thứ Ba.'], ['Today is Friday.', 'Hôm nay là thứ Sáu.']], 'Đọc ba ngày học của bạn theo mẫu My class is on…; dùng bảng tên ngày làm trợ giúp.',
    [text('Điền: My class is __ Monday.', 'on', 'Dùng on trước ngày trong tuần.'), choice('Ngày sau Monday?', ['Tuesday', 'Friday', 'Sunday'], 'Tuesday', 'Thứ Ba sau thứ Hai.', 'vocabulary'), order('Sắp xếp: Monday / is / Today', 'Today is Monday.', 'Today + is + tên ngày.'), read('Today is Tuesday. My class is on Wednesday.', 'Lớp học vào ngày nào?', ['Wednesday', 'Tuesday'], 'Wednesday', 'Câu thứ hai cho biết lịch học.')],
    [choice('Wednesday là?', ['thứ Tư', 'thứ Năm', 'thứ Sáu'], 'thứ Tư', 'Wednesday là thứ Tư.', 'vocabulary'), text('Điền: Today __ Friday.', 'is', 'Today is Friday = hôm nay là thứ Sáu.'), text('Viết tên thứ Hai bằng tiếng Anh.', 'Monday', 'Tên ngày viết hoa; phần chấm không bắt buộc hoa/thường.', 'vocabulary')],
    'Dùng Today is… và on trước ngày học; nhận diện bảy ngày trong tuần.', 'Tự nói lịch học hai ngày, ôn chính tả Wednesday.');
  add(10, 'Tháng, ngày tháng và số tuổi', 'Nhận diện cách viết ngày tháng và nói tuổi theo mẫu.', 'Nói Today is…; ôn on Monday và số 1–5.',
    ['Năm tháng đầu: January tháng 1, February tháng 2, March tháng 3, April tháng 4, May tháng 5. Tên tháng viết hoa. Khóa chưa yêu cầu nhớ 12 tháng trong một buổi.', 'Tuổi: “I am ten.” — Tôi mười tuổi. eleven 11, twelve 12, thirteen 13, fourteen 14, fifteen 15, sixteen 16, seventeen 17, eighteen 18, nineteen 19, twenty 20: đọc thêm theo nhịp, phần kiểm tra chính chỉ dùng ten và twenty.', 'Ngày tháng: “May 1” là ngày 1 tháng 5, khi đọc nói “May first”. first /fɝst/ là thứ nhất; đây là số thứ tự, khác one là số đếm. “My birthday is in May.” — Sinh nhật tôi vào tháng 5; birthday = sinh nhật, in dùng với tháng.'],
    `January|/ˈdʒænjuɛri/|tháng Một|My birthday is in January.|Sinh nhật tôi vào tháng Một.
February|/ˈfɛbjuɛri/|tháng Hai|My birthday is in February.|Sinh nhật tôi vào tháng Hai.
March|/mɑrtʃ/|tháng Ba|My birthday is in March.|Sinh nhật tôi vào tháng Ba.
April|/ˈeɪprəl/|tháng Tư|My birthday is in April.|Sinh nhật tôi vào tháng Tư.
May|/meɪ/|tháng Năm|My birthday is in May.|Sinh nhật tôi vào tháng Năm.
twenty|/ˈtwɛnti/|số hai mươi|I am twenty.|Tôi hai mươi tuổi.`,
    [['My birthday is in May. May first.', 'Sinh nhật tôi vào tháng Năm. Ngày 1 tháng 5.'], ['I am twenty.', 'Tôi hai mươi tuổi.']], 'Đọc May first theo mẫu; nói tuổi mẫu twenty (không cần tiết lộ tuổi thật) và tháng sinh theo bảng.',
    [text('Điền: My birthday is __ May.', 'in', 'Dùng in trước tháng.'), choice('May 1 trong bài này là ngày nào?', ['Ngày 1 tháng 5', 'Ngày 5 tháng 1'], 'Ngày 1 tháng 5', 'Tên tháng May đứng trước số ngày.', 'numbers'), order('Sắp xếp: twenty / am / I', 'I am twenty.', 'Dùng I am + tuổi.'), choice('Khi đọc ngày 1 dùng từ nào?', ['first', 'one', 'ten'], 'first', 'Số thứ tự first dùng để đọc ngày 1.', 'numbers')],
    [choice('March là tháng mấy?', ['3', '4', '5'], '3', 'March là tháng Ba.', 'vocabulary'), text('Điền: I __ ten.', 'am', 'Nói tuổi với I am.'), choice('twenty là số nào?', ['20', '12', '2'], '20', 'twenty = 20.', 'numbers')],
    'in + tháng; on + ngày trong tuần; I am + tuổi. May first là ngày 1 tháng 5.', 'Nhìn lịch, chỉ May 1 và đọc May first; ôn March và April.');
  add(11, 'Đại từ: ai đang được nói đến?', 'Chọn I, you, he, she, it và dùng am/is đúng mẫu.', 'Nói tên, tuổi mẫu và tháng sinh bằng ba câu đã học.',
    ['Đại từ là từ thay cho tên người/vật để tránh lặp: I tôi, you bạn, he anh ấy, she cô ấy, it nó (đồ vật/con vật khi không nói giới tính).', 'Động từ là từ biểu đạt hành động hoặc trạng thái. Be là dạng gốc của am/is/are. Hiện tại: I am; he/she/it is. Hôm nay chỉ luyện hai dạng am và is, are sẽ học ngày 12.', '“I am An.” — Tôi là An. “She is Mai.” — Cô ấy là Mai. “He is a student.” — Anh ấy là học sinh. student nghĩa là học sinh/sinh viên; a dùng trước một người thuộc nhóm nghề/vai trò.'],
    `I|/aɪ/|tôi|I am An.|Tôi là An.
you|/juː/|bạn|Thank you.|Cảm ơn bạn.
he|/hiː/|anh ấy|He is a student.|Anh ấy là học sinh.
she|/ʃiː/|cô ấy|She is Mai.|Cô ấy là Mai.
it|/ɪt/|nó; đồ vật đó|It is a pen.|Đó là một cây bút.
student|/ˈstuːdənt/|học sinh; sinh viên|I am a student.|Tôi là học sinh.`,
    [['I am An. I am a student.', 'Tôi là An. Tôi là học sinh.'], ['She is Mai. He is a student.', 'Cô ấy là Mai. Anh ấy là học sinh.']], 'Giới thiệu mình bằng I am… rồi giới thiệu người trong ví dụ bằng He/She is…; phân biệt /hiː/ và /ʃiː/.',
    [text('Điền: She __ Mai.', 'is', 'She đi với is.'), text('Điền: I __ a student.', 'am', 'I đi với am.'), choice('Thay “Mai” khi nói về một phụ nữ bằng từ nào?', ['she', 'he', 'it'], 'she', 'She dùng để nói về cô ấy.', 'vocabulary'), order('Sắp xếp: a / is / He / student', 'He is a student.', 'He + is + a + vai trò.')],
    [text('Điền: It __ a cat.', 'is', 'It đi với is.'), choice('I nghĩa là?', ['tôi', 'anh ấy', 'cô ấy'], 'tôi', 'I luôn được viết hoa khi dùng trong câu.', 'vocabulary'), text('Điền: He is __ student.', 'a', 'student số ít dùng a trong mẫu này.')],
    'I am; he/she/it is. Đại từ thay cho tên người hoặc vật.', 'Viết I am… và She is…; đọc cả câu hai lượt.');
  add(12, 'Be: am, is, are', 'Dùng be cho một người và một nhóm người.', 'Hoàn thành I __ An và She __ Mai trước khi mở bài.',
    ['Thêm we chúng tôi/chúng ta, they họ/chúng. You có thể chỉ một hoặc nhiều người. Dùng are với you/we/they; I am; he/she/it is.', '“We are students.” — Chúng tôi là học sinh. students là dạng nhiều của student, thêm s. “They are teachers.” — Họ là giáo viên. teacher = giáo viên.', '“You are happy.” — Bạn vui. happy, tired là tính từ: từ miêu tả trạng thái/đặc điểm, không dùng a trước tính từ đứng riêng. Viết tắt I am → I’m, you are → you’re; hôm nay có thể dùng dạng đầy đủ.'],
    `we|/wiː/|chúng tôi; chúng ta|We are students.|Chúng tôi là học sinh.
they|/ðeɪ/|họ; chúng|They are teachers.|Họ là giáo viên.
teacher|/ˈtiːtʃər/|giáo viên|She is a teacher.|Cô ấy là giáo viên.
happy|/ˈhæpi/|vui|You are happy.|Bạn vui.
tired|/ˈtaɪərd/|mệt|I am tired.|Tôi mệt.`,
    [['We are students. They are teachers.', 'Chúng tôi là học sinh. Họ là giáo viên.'], ['I am tired. You are happy.', 'Tôi mệt. Bạn vui.']], 'Đọc I am, she is, we are theo ba nhịp. Sau đó thay tên người bằng đại từ thích hợp.',
    [text('Điền: We __ students.', 'are', 'We đi với are.'), choice('Câu đúng?', ['She is happy.', 'She are happy.', 'She am happy.'], 'She is happy.', 'She đi với is; happy không dùng a.'), order('Sắp xếp: teachers / are / They', 'They are teachers.', 'They + are + vai trò số nhiều.'), text('Điền: You __ tired.', 'are', 'You luôn đi với are trong hiện tại.')],
    [text('Điền: They __ happy.', 'are', 'They dùng are.'), text('Điền: I __ tired.', 'am', 'I dùng am.'), choice('Chọn nhóm dùng is.', ['he, she, it', 'we, they, you'], 'he, she, it', 'He/she/it is; you/we/they are.')],
    'I am; he/she/it is; you/we/they are. Danh từ nhiều thường thêm s; tính từ không thêm a.', 'Tự tạo ba câu: một với I, một với she, một với we.');
  add(13, 'Phủ định và câu hỏi với be', 'Nói điều không đúng và hỏi Yes/No bằng be.', 'Nhắc bảng I am; he/she/it is; you/we/they are.',
    ['Phủ định là câu nói không: đặt not sau be. “I am not tired.” — Tôi không mệt. “She is not a teacher.” — Cô ấy không phải giáo viên.', 'Câu hỏi Yes/No là câu có thể trả lời có/không. Đưa be lên trước người: “Are you a student?” — Bạn là học sinh phải không? “Is she happy?” — Cô ấy vui phải không?', 'Đáp ngắn: Yes, I am. / No, I am not. Yes, she is. / No, she is not. Không trả lời “Yes, I” vì thiếu be. Viết tắt is not → isn’t, are not → aren’t; I am not không dùng amn’t trong bài.'],
    `not|/nɑt/|không|I am not tired.|Tôi không mệt.
ready|/ˈrɛdi/|sẵn sàng|I am ready.|Tôi sẵn sàng.
busy|/ˈbɪzi/|bận|She is busy.|Cô ấy bận.
okay|/oʊˈkeɪ/|ổn|I am okay.|Tôi ổn.
no|/noʊ/|không (lời đáp)|No, I am not.|Không, tôi không phải.`,
    [['Are you ready? Yes, I am.', 'Bạn sẵn sàng chưa? Rồi, tôi sẵn sàng.'], ['Is she busy? No, she is not.', 'Cô ấy bận à? Không, cô ấy không bận.']], 'Đổi giọng giữa hỏi và đáp, đọc rõ not. Đổi ready thành tired rồi trả lời bằng trạng thái mẫu.',
    [text('Điền: I am __ busy. (Tôi không bận.)', 'not', 'Not đứng sau am.'), order('Sắp xếp câu hỏi: you / ready / Are', 'Are you ready?', 'Be đứng trước you khi hỏi.'), text('Điền: Yes, she __.', 'is', 'Lời đáp giữ lại is.'), choice('Hỏi “Cô ấy mệt không?”', ['Is she tired?', 'She is tired?', 'Are she tired?'], 'Is she tired?', 'Trong mẫu chuẩn, đảo is lên trước she.')],
    [text('Điền: __ you busy?', 'Are', 'You đi với are, đưa are lên đầu.'), text('Điền: No, I am __.', 'not', 'Câu trả lời phủ định cần not.'), order('Sắp xếp: not / is / She / tired', 'She is not tired.', 'She + is + not + trạng thái.')],
    'Thêm not sau be; câu hỏi chuyển be lên đầu; đáp ngắn phải giữ be.', 'Tự hỏi Are you ready? và trả lời cả hai cách có/không.');
  add(14, 'Ôn tuần 2: giới thiệu và be', 'Kết hợp chào hỏi, tên, tuổi, vai trò và trạng thái.', 'Ôn ngày 13: nói một câu phủ định và một câu hỏi với be.',
    ['Không thêm ngữ pháp mới: ghép các mẫu đã có thành đoạn giới thiệu ngắn. “Hello. My name is An. I am twenty. I am a student.”', 'Kiểm tra người trong câu trước khi chọn be: I → am; she → is; we → are. Đừng chọn theo từ đứng sau be.', 'Ôn lịch: on Monday cho thứ; in May cho tháng. Khi giao tiếp, có thể nhìn từ khóa rồi giảm trợ giúp ở lần nói thứ hai.'],
    `name|/neɪm/|tên|My name is An.|Tên tôi là An.
student|/ˈstuːdənt/|học sinh; sinh viên|I am a student.|Tôi là học sinh.
ready|/ˈrɛdi/|sẵn sàng|We are ready.|Chúng tôi sẵn sàng.
Monday|/ˈmʌndeɪ/|thứ Hai|My class is on Monday.|Lớp tôi vào thứ Hai.
May|/meɪ/|tháng Năm|My birthday is in May.|Sinh nhật tôi vào tháng Năm.`,
    [['Hello. My name is An. I am twenty. I am a student.', 'Xin chào. Tên tôi là An. Tôi hai mươi tuổi. Tôi là học sinh.'], ['Are you ready? Yes, I am.', 'Bạn sẵn sàng chưa? Rồi.']], 'Nói đoạn giới thiệu 20–30 giây theo thông tin mẫu. Không phải cung cấp dữ liệu cá nhân thật.',
    [read('My name is Mai. I am twenty. I am a student. I am not tired.', 'Mai có mệt không?', ['Không', 'Có'], 'Không', 'I am not tired nghĩa là tôi không mệt.'), text('Điền: They __ ready.', 'are', 'They dùng are.'), text('Điền: My birthday is __ May.', 'in', 'Tháng dùng in.'), order('Sắp xếp: a / you / student / Are', 'Are you a student?', 'Câu hỏi be: Are + you + a student?')],
    [text('Điền: She __ not busy.', 'is', 'She dùng is.'), text('Điền: My class is __ Monday.', 'on', 'Ngày trong tuần dùng on.'), read('I am An. I am a student. My birthday is in May.', 'An là ai?', ['học sinh', 'giáo viên'], 'học sinh', 'I am a student cho biết vai trò.')],
    'Đã nối được lời chào, thông tin cá nhân và câu hỏi be. Lỗi be cần ôn trước ngày 15.', 'Xem câu sai trong kiểm tra, tự sửa và đọc lại đoạn giới thiệu.');
  add(15, 'Gia đình và câu giới thiệu ngắn', 'Giới thiệu hai người trong gia đình bằng my và be.', 'Đọc lại đoạn giới thiệu tuần 2; hỏi Is she a student?',
    ['My = của tôi: my mother mẹ tôi, my father bố tôi. Không thêm a trước my: my mother, không phải a my mother.', '“This is my mother.” — Đây là mẹ tôi. This dùng cho người/vật ở gần. “She is a teacher.” — Mẹ là giáo viên. Câu thứ hai dùng she để không lặp my mother.', 'Câu đơn là câu có một ý chính: người/vật + động từ + thông tin. “My brother is ten.” — Em/anh trai tôi mười tuổi. He thay cho brother; she thay cho sister.'],
    `mother|/ˈmʌðər/|mẹ|This is my mother.|Đây là mẹ tôi.
father|/ˈfɑðər/|bố|This is my father.|Đây là bố tôi.
brother|/ˈbrʌðər/|anh; em trai|My brother is ten.|Anh/em trai tôi mười tuổi.
sister|/ˈsɪstər/|chị; em gái|My sister is a student.|Chị/em gái tôi là học sinh.
family|/ˈfæməli/|gia đình|This is my family.|Đây là gia đình tôi.`,
    [['This is my mother. She is a teacher.', 'Đây là mẹ tôi. Mẹ là giáo viên.'], ['This is my brother. He is ten.', 'Đây là em trai tôi. Em mười tuổi.']], 'Dùng một gia đình tưởng tượng, giới thiệu hai người. Dừng giữa hai câu thay vì cố nói một câu dài.',
    [text('Điền: This is __ mother. (mẹ tôi)', 'my', 'My đặt trước danh từ để chỉ của tôi.'), choice('Thay my father bằng đại từ nào?', ['he', 'she', 'they'], 'he', 'Father là bố, dùng he.'), order('Sắp xếp: my / is / This / sister', 'This is my sister.', 'This is + my + người thân.'), read('This is my brother. He is a student. He is twenty.', 'Người anh/em trai bao nhiêu tuổi?', ['20', '10'], '20', 'He is twenty nghĩa là anh/em ấy hai mươi tuổi.')],
    [text('Điền: My mother __ a teacher.', 'is', 'My mother là một người, dùng is.'), choice('Cụm đúng?', ['my father', 'a my father'], 'my father', 'Không dùng a trước my.'), text('Điền: My sister is a student. __ is happy.', 'She', 'She thay cho my sister.')],
    'This is my… để giới thiệu; he/she giúp tránh lặp tên người.', 'Viết bốn câu giới thiệu gia đình mẫu, dùng my, he, she.');
  add(16, 'Hiện tại đơn với I, you, we, they', 'Nói thói quen đơn giản với động từ hành động.', 'Giới thiệu This is my mother. She is a teacher.',
    ['Hiện tại đơn là cách nói điều thường xảy ra hoặc thói quen. Với I/you/we/they, dùng dạng gốc của động từ: “I study English.” — Tôi học tiếng Anh.', 'Khác với be: “I am a student.” nói vai trò; “I study.” nói hoạt động. Không thêm am trước study: không viết I am study trong mẫu hiện tại đơn.', '“I work every day.” — Tôi làm việc mỗi ngày. every day = mỗi ngày. “We live in Hanoi.” — Chúng tôi sống ở Hà Nội. in dùng trước thành phố trong mẫu này.'],
    `study|/ˈstʌdi/|học|I study English.|Tôi học tiếng Anh.
work|/wɝk/|làm việc|I work every day.|Tôi làm việc mỗi ngày.
live|/lɪv/|sống|We live in Hanoi.|Chúng tôi sống ở Hà Nội.
English|/ˈɪŋɡlɪʃ/|tiếng Anh|They study English.|Họ học tiếng Anh.
every day|/ˈɛvri deɪ/|mỗi ngày|We study every day.|Chúng tôi học mỗi ngày.`,
    [['I study English. I work every day.', 'Tôi học tiếng Anh. Tôi làm việc mỗi ngày.'], ['We live in Hanoi. We study English.', 'Chúng tôi sống ở Hà Nội. Chúng tôi học tiếng Anh.']], 'Nói hai thói quen mẫu dùng I. So sánh I am a student và I study English, không thêm am trước study.',
    [choice('Câu nói “Tôi học tiếng Anh” đúng?', ['I study English.', 'I am study English.'], 'I study English.', 'Study là động từ hành động, không thêm am.'), text('Điền: We __ in Hanoi. (sống)', 'live', 'We dùng động từ gốc live.'), order('Sắp xếp: every / work / I / day', 'I work every day.', 'I + work + every day.'), read('I live in Hanoi. I study English every day.', 'Người nói học gì mỗi ngày?', ['English', 'milk'], 'English', 'Câu thứ hai nói học tiếng Anh.')],
    [text('Điền: They __ English. (học)', 'study', 'They dùng study dạng gốc.'), choice('Câu nêu vai trò?', ['I am a student.', 'I study English.'], 'I am a student.', 'Am a student nêu vai trò, study nêu hoạt động.'), text('Điền: I live __ Hanoi.', 'in', 'Dùng in trước thành phố trong mẫu này.')],
    'I/you/we/they + động từ gốc. Không dùng am/is/are trước động từ hành động trong mẫu này.', 'Viết hai câu I study… và I live… rồi đọc lại.');
  add(17, 'He/she và động từ thêm s', 'Nói thói quen của người khác với works, studies, goes.', 'Đọc I work và They study; giải thích vì sao không thêm am.',
    ['Trong hiện tại đơn, he/she/it dùng động từ thêm s hoặc es: I work → she works. Đây là cách đánh dấu người/vật số ít, không phải danh từ số nhiều.', 'Study đổi y sau phụ âm thành ies: study → studies. Go thêm es: goes. Học hai dạng cụ thể này trước, chưa cần nhớ mọi quy tắc.', '“He goes to school.” — Anh ấy đi học. to school là đến trường; “She drinks water.” — Cô ấy uống nước. Âm cuối s/es có thể là /s/, /z/, /ɪz/ tùy từ; works /wɝks/, studies /ˈstʌdiz/.'],
    `go|/ɡoʊ/|đi|He goes to school.|Anh ấy đi học.
school|/skuːl/|trường học|She goes to school.|Cô ấy đi học.
drink|/drɪŋk/|uống|She drinks water.|Cô ấy uống nước.
water|/ˈwɔtər/|nước|I drink water.|Tôi uống nước.
read|/riːd/|đọc|He reads every day.|Anh ấy đọc mỗi ngày.`,
    [['I study English. She studies English.', 'Tôi học tiếng Anh. Cô ấy học tiếng Anh.'], ['He goes to school. She drinks water.', 'Anh ấy đi học. Cô ấy uống nước.']], 'Đổi I thành she trong hai câu, đọc rõ phần cuối studies và drinks. Không thêm âm tiết tùy ý vào works.',
    [text('Điền: She __ English. (study)', 'studies', 'Study đổi y thành ies sau phụ âm.'), text('Điền: He __ to school. (go)', 'goes', 'Go với he thành goes.'), choice('Câu đúng?', ['She works every day.', 'She work every day.'], 'She works every day.', 'She dùng động từ thêm s.'), order('Sắp xếp: water / drinks / She', 'She drinks water.', 'She + drinks + water.')],
    [text('Điền: He __ every day. (read)', 'reads', 'Read thêm s với he.'), choice('Với I, chọn dạng nào?', ['study', 'studies'], 'study', 'I dùng dạng gốc.'), text('Điền: She __ water. (drink)', 'drinks', 'Drink thêm s với she.')],
    'He/she/it thêm s/es; studies và goes là hai dạng cần nhớ.', 'Viết cặp I study / She studies và I go / He goes.');
  add(18, 'Phủ định: do not và does not', 'Nói thói quen không làm, giữ động từ gốc sau trợ động từ.', 'Đổi I study thành She studies và I go thành He goes.',
    ['Với động từ hành động, phủ định dùng I/you/we/they do not + dạng gốc; he/she/it does not + dạng gốc. Do/does ở đây là trợ động từ: từ giúp tạo câu.', '“I do not drink coffee.” — Tôi không uống cà phê. “She does not like tea.” — Cô ấy không thích trà. Sau does not dùng like, không dùng likes.', 'Viết tắt do not = don’t, does not = doesn’t. Phân biệt be: I am not tired (trạng thái), I do not work (hoạt động). Không viết I do not am.'],
    `like|/laɪk/|thích|I like tea.|Tôi thích trà.
tea|/tiː/|trà|She likes tea.|Cô ấy thích trà.
coffee|/ˈkɔfi/|cà phê|I do not drink coffee.|Tôi không uống cà phê.
rice|/raɪs/|cơm; gạo|I like rice.|Tôi thích cơm.
eat|/iːt/|ăn|We eat rice.|Chúng tôi ăn cơm.`,
    [['I do not drink coffee. I drink water.', 'Tôi không uống cà phê. Tôi uống nước.'], ['She does not like tea.', 'Cô ấy không thích trà.']], 'Đọc dạng đầy đủ trước, rồi thử don’t/doesn’t. Khi nói does not, giữ like không có s.',
    [text('Điền: I __ not drink coffee.', 'do', 'I dùng do not.'), text('Điền: She __ not eat rice.', 'does', 'She dùng does not.'), choice('Câu đúng?', ['He does not work.', 'He does not works.'], 'He does not work.', 'Sau does not dùng động từ gốc.'), order('Sắp xếp: tea / not / like / do / I', 'I do not like tea.', 'I + do not + like + tea.')],
    [text('Điền: They __ not study.', 'do', 'They dùng do not.'), text('Điền: She does not __ coffee. (drink)', 'drink', 'Động từ sau does not không thêm s.'), choice('Phủ định I am tired?', ['I am not tired.', 'I do not am tired.'], 'I am not tired.', 'Be tự thêm not, không dùng do.')],
    'Do not/does not + động từ gốc. Be dùng not trực tiếp.', 'Viết một điều bạn thích và một điều không thích theo mẫu.');
  add(19, 'Câu hỏi: Do you…? Does she…?', 'Hỏi và đáp về thói quen với do/does.', 'Nói I do not drink coffee và She does not like tea.',
    ['Câu hỏi hành động: Do + I/you/we/they + động từ gốc? Does + he/she/it + động từ gốc? “Do you like tea?” — Bạn thích trà không?', 'Đáp: Yes, I do. / No, I do not. Với she: Yes, she does. / No, she does not. Không dùng am để đáp câu hỏi Do you like…?', '“Does she speak English?” — Cô ấy nói tiếng Anh không? speak = nói; listen = nghe; listen to music = nghe nhạc. Sau does giữ speak, không thêm s.'],
    `speak|/spiːk/|nói (ngôn ngữ)|I speak English.|Tôi nói tiếng Anh.
listen|/ˈlɪsən/|lắng nghe|I listen to music.|Tôi nghe nhạc.
music|/ˈmjuːzɪk/|âm nhạc|She likes music.|Cô ấy thích âm nhạc.
do|/duː/|trợ động từ với I/you/we/they|Do you like tea?|Bạn thích trà không?
does|/dʌz/|trợ động từ với he/she/it|Does she work?|Cô ấy có làm việc không?`,
    [['Do you like tea? Yes, I do.', 'Bạn thích trà không? Có.'], ['Does she speak English? No, she does not.', 'Cô ấy nói tiếng Anh không? Không.']], 'Tự đóng hai vai hỏi và đáp; giữ do/does trong lời đáp ngắn. Đọc listen, chú ý t không phát âm trong từ này.',
    [text('Điền: __ you like music?', 'Do', 'You dùng Do khi hỏi hành động.'), text('Điền: __ she work?', 'Does', 'She dùng Does.'), order('Sắp xếp: English / she / speak / Does', 'Does she speak English?', 'Does + she + speak dạng gốc.'), choice('Đáp Do you like tea? bằng câu nào?', ['Yes, I do.', 'Yes, I am.'], 'Yes, I do.', 'Câu hỏi do đáp bằng do.')],
    [text('Điền: Yes, she __. (Does she work?)', 'does', 'Đáp ngắn lặp does.'), text('Điền: Does he __ English? (speak)', 'speak', 'Sau Does dùng speak dạng gốc.'), choice('Hỏi trạng thái mệt dùng câu nào?', ['Are you tired?', 'Do you tired?'], 'Are you tired?', 'Tired là tính từ, dùng be.')],
    'Do/does đứng đầu câu hỏi hành động; đáp ngắn giữ trợ động từ.', 'Hỏi hai câu Do you…? và một câu Does she…? theo từ đã học.');
  add(20, 'Một ngày của tôi và giờ đúng', 'Kể ba hoạt động trong ngày và nói giờ đúng.', 'Hỏi Do you study English? và đáp Yes, I do.',
    ['Cụm động từ gồm nhiều từ nhưng diễn đạt một hoạt động: get up thức dậy, go to bed đi ngủ. “I get up at six.” — Tôi dậy lúc sáu giờ. at dùng với giờ.', 'Sáu đến mười: six /sɪks/, seven /ˈsɛvən/, eight /eɪt/, nine /naɪn/, ten /tɛn/. “It is seven o’clock.” — Bảy giờ đúng. o’clock chỉ dùng cho giờ đúng trong bài này.', '“I have breakfast at seven.” — Tôi ăn sáng lúc bảy giờ. “I go to bed at ten.” — Tôi đi ngủ lúc mười giờ. Chưa dùng giờ hơn/kém; chỉ tập giờ đúng.'],
    `get up|/ɡɛt ʌp/|thức dậy|I get up at six.|Tôi thức dậy lúc sáu giờ.
have breakfast|/hæv ˈbrɛkfəst/|ăn sáng|I have breakfast at seven.|Tôi ăn sáng lúc bảy giờ.
go to bed|/ɡoʊ tə bɛd/|đi ngủ|I go to bed at ten.|Tôi đi ngủ lúc mười giờ.
morning|/ˈmɔrnɪŋ/|buổi sáng|I work in the morning.|Tôi làm việc vào buổi sáng.
o'clock|/əˈklɑk/|giờ đúng|It is seven o'clock.|Bảy giờ đúng.`,
    [['I get up at six. I have breakfast at seven.', 'Tôi dậy lúc sáu giờ. Tôi ăn sáng lúc bảy giờ.'], ['I go to bed at ten.', 'Tôi đi ngủ lúc mười giờ.']], 'Nói ba hoạt động theo thứ tự trong ngày. Có thể chọn giờ giả trong phạm vi six–ten đã giới thiệu.',
    [text('Điền: I get up __ six.', 'at', 'At dùng trước giờ.'), order('Sắp xếp: at / get / six / up / I', 'I get up at six.', 'Get up là một cụm, giữ get trước up.'), read('I get up at six. I have breakfast at seven. I go to bed at ten.', 'Người nói ăn sáng lúc mấy giờ?', ['7', '6', '10'], '7', 'Have breakfast at seven = ăn sáng lúc bảy giờ.'), choice('Bảy giờ đúng?', ["seven o'clock", "seven Monday"], "seven o'clock", 'O’clock dùng cho giờ đúng.', 'numbers')],
    [text('Điền: I go to __ at ten. (đi ngủ)', 'bed', 'Go to bed là đi ngủ.'), text('Viết bằng số: eight.', '8', 'Eight là 8.', 'numbers'), choice('Dùng giới từ nào với giờ?', ['at', 'in', 'on'], 'at', 'At six; in May; on Monday.')],
    'Kể thói quen theo giờ: I + hoạt động + at + giờ.', 'Nói lịch mẫu buổi sáng trong 20 giây; ôn do/does nếu còn nhầm.');
  add(21, 'Ôn tuần 3: nghe lịch sinh hoạt', 'Đọc/nghe một lịch đơn giản và phân biệt be với do/does.', 'Ôn ba hoạt động ngày 20; đổi I study thành She studies.',
    ['Buổi ôn không thêm cấu trúc mới. Khi nghe, tìm tên người, hoạt động và giờ; không cố dịch mọi từ ngay lập tức.', 'So sánh “She is a student.” và “She studies English.” Câu vai trò dùng is; câu hành động dùng studies. Phủ định hành động: She does not study; câu hỏi: Does she study?', 'Nghe hai lần: lần đầu lấy ý chính; lần hai tìm thông tin cần trả lời. Sau đó mới mở văn bản và kiểm tra âm hoặc từ đã bỏ lỡ.'],
    `study|/ˈstʌdi/|học|She studies English.|Cô ấy học tiếng Anh.
work|/wɝk/|làm việc|He works every day.|Anh ấy làm việc mỗi ngày.
tea|/tiː/|trà|I do not like tea.|Tôi không thích trà.
get up|/ɡɛt ʌp/|thức dậy|I get up at six.|Tôi dậy lúc sáu giờ.
water|/ˈwɔtər/|nước|She drinks water.|Cô ấy uống nước.`,
    [['She is a student. She gets up at six. She studies English.', 'Cô ấy là học sinh. Cô ấy dậy lúc sáu giờ. Cô ấy học tiếng Anh.'], ['Does she like tea? No, she does not.', 'Cô ấy thích trà không? Không.']], 'Nghe và nhắc lại ba câu về cô ấy; gets up là get up thêm s với she, theo quy tắc ngày 17.',
    [read('An is a student. He gets up at six. He studies English every day. He does not drink coffee.', 'An có uống cà phê không?', ['Không', 'Có'], 'Không', 'He does not drink coffee là câu phủ định.'), text('Điền: She __ English every day. (study)', 'studies', 'She dùng studies.'), text('Điền: __ he get up at six?', 'Does', 'He dùng Does và get dạng gốc.'), choice('Câu đúng?', ['I am tired.', 'I do tired.'], 'I am tired.', 'Tired là tính từ, dùng am.')],
    [text('Điền: She does not __ tea. (like)', 'like', 'Does not đi với like dạng gốc.'), order('Sắp xếp: you / Do / English / study', 'Do you study English?', 'Do + you + study English?'), read('I get up at six. I drink water.', 'Người nói uống gì?', ['water', 'coffee'], 'water', 'Câu thứ hai nói uống nước.')],
    'Kết hợp vai trò, thói quen, phủ định và câu hỏi; dùng văn bản để đối chiếu sau khi nghe.', 'Ôn riêng nhóm be hoặc do/does có nhiều câu sai hơn trong trang Tiến độ.');
  add(22, 'Ở quán: gọi món lịch sự', 'Gọi một đồ uống bằng cụm yêu cầu đã được hướng dẫn.', 'Hỏi Do you like tea? và nói I drink water.',
    ['Mẫu gọi món mới: “I would like tea, please.” — Tôi muốn gọi trà, làm ơn. Would like là cụm diễn đạt mong muốn lịch sự; không cần học toàn bộ cách dùng would hôm nay.', 'Viết tắt I would → I’d; bài cho phép dùng đầy đủ. “Here you are.” — Của bạn đây. “Thank you.” — Cảm ơn. Đây là các lượt lời cố định.', 'Menu = thực đơn; a cup of tea = một tách trà. Muốn một tách thì nói I would like a cup of tea, please. Không dùng a tea trong bài cơ bản này.'],
    `menu|/ˈmɛnjuː/|thực đơn|It is a menu.|Đó là thực đơn.
would like|/wʊd laɪk/|muốn (lịch sự)|I would like tea, please.|Tôi muốn gọi trà, làm ơn.
a cup of tea|/ə kʌp əv tiː/|một tách trà|I would like a cup of tea.|Tôi muốn một tách trà.
here you are|/hɪr ju ɑr/|của bạn đây|Here you are.|Của bạn đây.
coffee|/ˈkɔfi/|cà phê|I would like coffee, please.|Tôi muốn gọi cà phê, làm ơn.
a glass of water|/ə ɡlæs əv ˈwɔtər/|một ly nước|I would like a glass of water.|Tôi muốn một ly nước.`,
    [['I would like a cup of tea, please.', 'Tôi muốn một tách trà, làm ơn.'], ['Here you are. Thank you.', 'Của bạn đây. Cảm ơn.']], 'Đọc vai khách rồi vai phục vụ. Thay tea bằng coffee; không cần bắt chước tốc độ của người bản ngữ.',
    [text('Điền: I would __ tea, please.', 'like', 'Would like là cụm muốn lịch sự.'), order('Sắp xếp: tea / would / I / like', 'I would like tea.', 'I + would like + món.'), choice('Nhận đồ uống, nói gì?', ['Thank you.', 'Goodbye.'], 'Thank you.', 'Cảm ơn khi nhận món.', 'conversation'), read('I would like water, please. Here you are.', 'Khách gọi gì?', ['water', 'tea', 'coffee'], 'water', 'Câu đầu gọi nước.')],
    [text('Điền: a cup __ tea.', 'of', 'A cup of tea là một tách trà.'), choice('Cụm đưa món cho khách?', ['Here you are.', 'My name is An.'], 'Here you are.', 'Here you are dùng khi đưa vật.', 'conversation'), text('Điền từ lịch sự: I would like tea, __.', 'please', 'Please làm yêu cầu lịch sự.', 'conversation')],
    'Dùng I would like… please khi gọi món; đáp Thank you khi nhận.', 'Nói hội thoại gọi một món trong ba lượt, đổi món ở lượt hai.');
  add(23, 'Hỏi đường: Where is…?', 'Hỏi vị trí một địa điểm và hiểu near, left, right.', 'Gọi một đồ uống bằng I would like… please.',
    ['Where nghĩa là ở đâu. “Where is the school?” — Trường học ở đâu? The chỉ địa điểm cụ thể hai người đang nói đến; khác a là một địa điểm chưa xác định.', '“It is near the bank.” — Nó ở gần ngân hàng. Near = gần; left trái; right phải. “Turn left.” — Rẽ trái. Turn right = rẽ phải: câu hướng dẫn bắt đầu bằng động từ, không cần you.', '“Excuse me.” — Xin phép làm phiền, dùng trước khi hỏi người lạ; khác Sorry thường dùng khi xin lỗi. Bài chỉ dùng chỉ dẫn một bước, chưa học mô tả bản đồ phức tạp.'],
    `where|/wɛr/|ở đâu|Where is the school?|Trường học ở đâu?
near|/nɪr/|gần|It is near the school.|Nó ở gần trường.
bank|/bæŋk/|ngân hàng|It is a bank.|Đó là một ngân hàng.
left|/lɛft/|bên trái|Turn left.|Rẽ trái.
right|/raɪt/|bên phải|Turn right.|Rẽ phải.
excuse me|/ɪkˈskjuːz miː/|xin phép làm phiền|Excuse me. Where is the school?|Xin phép hỏi. Trường học ở đâu?`,
    [['Excuse me. Where is the school?', 'Xin phép hỏi. Trường học ở đâu?'], ['It is near the bank. Turn left.', 'Nó gần ngân hàng. Rẽ trái.']], 'Đổi vai hỏi đường. Khi nói left/right, chỉ tay theo hướng tương ứng để nhớ nghĩa.',
    [text('Điền: __ is the bank? (ở đâu)', 'Where', 'Where hỏi vị trí.'), order('Sắp xếp: school / the / is / Where', 'Where is the school?', 'Where + is + địa điểm?'), choice('Turn right nghĩa là?', ['Rẽ phải', 'Rẽ trái', 'Đi ngủ'], 'Rẽ phải', 'Right là phải.', 'conversation'), read('The school is near the bank. Turn left.', 'Trường gần đâu?', ['the bank', 'the menu'], 'the bank', 'Near the bank nghĩa là gần ngân hàng.')],
    [text('Điền: Turn __. (Rẽ trái.)', 'left', 'Left là trái.', 'vocabulary'), choice('Trước khi hỏi người lạ, nói gì?', ['Excuse me.', 'I am ten.'], 'Excuse me.', 'Excuse me mở lời lịch sự.', 'conversation'), text('Điền: It is __ the bank. (gần)', 'near', 'Near nghĩa là gần.')],
    'Where is the…? hỏi vị trí; near, left, right giúp hiểu chỉ dẫn ngắn.', 'Tự dựng đường đến trường giả: hỏi Where is… và đáp một câu có near.');
  add(24, 'Đọc thông báo và tìm thông tin', 'Tìm ngày, giờ và địa điểm trong thông báo ngắn.', 'Hỏi Where is the school? và đáp It is near the bank.',
    ['Thông báo thường có nhãn ngắn, không phải câu đầy đủ: “English class. Monday. At seven. Room two.” — Lớp tiếng Anh, thứ Hai, lúc bảy giờ, phòng hai.', 'Đọc câu hỏi trước, tìm đúng chi tiết thay vì dịch hết. When = khi nào; “When is the class?” — Lớp vào khi nào? “It is on Monday.” — Vào thứ Hai.', '“The class starts at seven.” — Lớp bắt đầu lúc bảy giờ. Starts thêm s vì the class là một lớp, giống it. At + giờ, on + thứ, in + phòng/tháng theo ngữ cảnh.'],
    `class|/klæs/|lớp học|The class is on Monday.|Lớp học vào thứ Hai.
room|/ruːm/|phòng|The class is in room two.|Lớp ở phòng hai.
start|/stɑrt/|bắt đầu|The class starts at seven.|Lớp bắt đầu lúc bảy giờ.
when|/wɛn/|khi nào|When is the class?|Lớp học vào khi nào?
open|/ˈoʊpən/|mở cửa|The bank is open.|Ngân hàng đang mở cửa.
closed|/kloʊzd/|đóng cửa|The bank is closed.|Ngân hàng đang đóng cửa.`,
    [['English class. Monday. At seven. Room two.', 'Lớp tiếng Anh. Thứ Hai. Lúc bảy giờ. Phòng hai.'], ['When is the class? It is on Monday.', 'Lớp vào khi nào? Vào thứ Hai.']], 'Nghe thông báo, ghi ba mục: ngày, giờ, phòng. Đọc lại thông báo thành từng cụm có khoảng dừng.',
    [read('English class. Tuesday. At eight. Room three.', 'Lớp vào ngày nào?', ['Tuesday', 'Monday', 'Friday'], 'Tuesday', 'Nhãn ngày là Tuesday.'), read('English class. Tuesday. At eight. Room three.', 'Lớp ở phòng nào?', ['three', 'eight', 'two'], 'three', 'Room three = phòng ba.'), text('Điền: The class starts __ seven.', 'at', 'Giờ dùng at.'), order('Sắp xếp: is / class / the / When', 'When is the class?', 'When hỏi thời gian, is đứng trước the class.')],
    [read('English class. Friday. At nine. Room two.', 'Lớp bắt đầu lúc mấy giờ?', ['9', '2', '5'], '9', 'At nine là lúc chín giờ.'), text('Điền: The class is __ Monday.', 'on', 'Thứ dùng on.'), choice('Where hỏi thông tin gì?', ['Địa điểm', 'Thời gian'], 'Địa điểm', 'Where hỏi ở đâu; when hỏi khi nào.')],
    'Tìm chi tiết theo câu hỏi: when thời gian, where địa điểm; không nhầm số phòng và số giờ.', 'Viết thông báo lớp mẫu ba dòng, tự hỏi when và where.');
  add(25, 'Nhờ giúp đỡ khi chưa hiểu', 'Xin lặp lại, nói chậm và hỏi nghĩa từ bằng câu mẫu.', 'Đọc thông báo ngày 24 và nêu đúng giờ, phòng.',
    ['“Can you help me, please?” — Bạn giúp tôi được không? Can + you + động từ gốc là mẫu nhờ giúp; can không thêm s. Hôm nay học như câu chức năng.', '“Please say it again.” — Làm ơn nói lại. “Please speak slowly.” — Làm ơn nói chậm. Slowly là chậm rãi; again là lại một lần nữa.', '“I do not understand.” — Tôi không hiểu. “What does ‘bank’ mean?” — Bank nghĩa là gì? Đây là mẫu hỏi nghĩa: What does + từ + mean? Mean giữ dạng gốc sau does. Không cần hiểu hết mới được yêu cầu người khác nói chậm.'],
    `help|/hɛlp/|giúp đỡ|Can you help me, please?|Bạn giúp tôi được không?
again|/əˈɡɛn/|lại một lần nữa|Please say it again.|Làm ơn nói lại.
slowly|/ˈsloʊli/|chậm rãi|Please speak slowly.|Làm ơn nói chậm.
understand|/ˌʌndərˈstænd/|hiểu|I do not understand.|Tôi không hiểu.
mean|/miːn/|có nghĩa là|What does bank mean?|Bank nghĩa là gì?`,
    [['I do not understand. Please say it again.', 'Tôi không hiểu. Làm ơn nói lại.'], ['Can you help me, please? Please speak slowly.', 'Bạn giúp tôi được không? Làm ơn nói chậm.']], 'Nói hai câu xin trợ giúp rõ ràng, không cần nói nhanh. Đóng vai người hỏi nghĩa bank; đáp bằng nghĩa tiếng Việt.',
    [text('Điền: Please speak __. (chậm rãi)', 'slowly', 'Slowly miêu tả cách nói.', 'vocabulary'), order('Sắp xếp: not / understand / I / do', 'I do not understand.', 'Do not + động từ gốc.'), choice('Muốn người khác nói lại, dùng câu nào?', ['Please say it again.', 'Here you are.'], 'Please say it again.', 'Again là lại lần nữa.', 'conversation'), text('Điền: What does bank __?', 'mean', 'Mẫu hỏi nghĩa dùng mean dạng gốc.')],
    [text('Điền: Can you __ me, please?', 'help', 'Can + động từ gốc help.'), choice('Không hiểu có nên giả vờ hiểu?', ['Không; xin nói lại.', 'Có; luôn nói yes.'], 'Không; xin nói lại.', 'Yêu cầu nói chậm giúp giao tiếp chính xác.', 'conversation'), text('Điền: Please say it __.', 'again', 'Again nghĩa là lại một lần nữa.', 'vocabulary')],
    'Có thể giữ cuộc hội thoại bằng yêu cầu nói lại, nói chậm và hỏi nghĩa.', 'Che văn bản, nói ba câu cứu trợ: I do not understand; Please say it again; Please speak slowly.');
  add(26, 'Hồ sơ cá nhân ngắn', 'Đọc và viết một hồ sơ gồm tên, tuổi, nơi sống và vai trò.', 'Nói một câu nhờ giúp, rồi ôn I live in Hanoi.',
    ['Hồ sơ là các thông tin ngắn theo nhãn: Name tên, Age tuổi, City thành phố, Job nghề nghiệp. Viết một đoạn giới thiệu bằng câu đã học, không cần cấu trúc mới.', '“I am a teacher. I live in Hanoi. I study English every day.” Kết nối bằng and = và: “I work and study.” — Tôi làm việc và học. And nối hai ý cùng vai trò.', 'Hỏi nghề bằng mẫu “What do you do?” — Bạn làm nghề gì? Đáp “I am a teacher.” Mặc dù câu hỏi có do, câu trả lời đầy đủ có thể dùng be để nêu nghề. Không dùng thông tin nhạy cảm thật trong bài công khai.'],
    `age|/eɪdʒ/|tuổi|My age is twenty.|Tuổi của tôi là hai mươi.
city|/ˈsɪti/|thành phố|Hanoi is a city.|Hà Nội là một thành phố.
job|/dʒɑb/|nghề nghiệp|I like my job.|Tôi thích công việc của mình.
and|/ænd/|và|I work and study.|Tôi làm việc và học.
profile|/ˈproʊfaɪl/|hồ sơ|This is my profile.|Đây là hồ sơ của tôi.`,
    [['My name is Mai. I am twenty. I live in Hanoi.', 'Tên tôi là Mai. Tôi hai mươi tuổi. Tôi sống ở Hà Nội.'], ['What do you do? I am a teacher.', 'Bạn làm nghề gì? Tôi là giáo viên.']], 'Nói hồ sơ mẫu trong bốn câu. Nếu chưa đi làm, dùng I am a student; không cần tự nghĩ từ nghề mới.',
    [read('Name: Mai. Age: 20. City: Hanoi. Job: teacher.', 'Mai làm nghề gì?', ['teacher', 'student'], 'teacher', 'Nhãn Job ghi teacher.'), text('Điền: I work __ study.', 'and', 'And nối hai hoạt động.'), order('Sắp xếp: in / live / Hanoi / I', 'I live in Hanoi.', 'I + live + in + thành phố.'), choice('Đáp What do you do? bằng câu nào?', ['I am a teacher.', 'I am twenty.'], 'I am a teacher.', 'Câu hỏi này hỏi nghề, không hỏi tuổi.', 'conversation')],
    [text('Điền: I am __ student.', 'a', 'Student số ít có a.'), read('I am An. I live in Hanoi. I study English.', 'An sống ở đâu?', ['Hanoi', 'Monday'], 'Hanoi', 'Live in cho biết nơi sống.'), text('Điền: They __ and study. (làm việc)', 'work', 'They dùng động từ gốc work.')],
    'Hồ sơ ngắn dùng lại be, live, study; and nối ý. What do you do? hỏi nghề.', 'Viết hồ sơ giả bốn câu rồi tự kiểm tra be và động từ hành động.');
  add(27, 'Đọc và kể lại một ngày', 'Tìm thông tin và kể lại thói quen của một người bằng he/she.', 'Đọc hồ sơ mẫu và chuyển I live thành She lives.',
    ['Bài đọc hôm nay tái dùng giờ, hành động và he/she. Thêm first = đầu tiên, then = sau đó, finally = cuối cùng để chỉ thứ tự, không phải thì mới.', '“First, I get up at six. Then, I have breakfast. Finally, I go to school.” — Đầu tiên tôi dậy lúc sáu giờ. Sau đó tôi ăn sáng. Cuối cùng tôi đi học. Before = trước, after = sau; before breakfast = trước bữa sáng, after breakfast = sau bữa sáng.', 'Have đổi thành has với he/she/it: “She has breakfast at seven.” Đây là dạng bất quy tắc cần nhớ. Go → goes, study → studies giữ như ngày 17. Không thay mọi động từ bằng thêm s máy móc.'],
    `first|/fɝst/|đầu tiên|First, I get up.|Đầu tiên tôi thức dậy.
then|/ðɛn/|sau đó|Then, I have breakfast.|Sau đó tôi ăn sáng.
finally|/ˈfaɪnəli/|cuối cùng|Finally, I go to school.|Cuối cùng tôi đi học.
has|/hæz/|dạng của have với he/she/it|She has breakfast at seven.|Cô ấy ăn sáng lúc bảy giờ.
after|/ˈæftər/|sau|I study after breakfast.|Tôi học sau bữa sáng.
before|/bɪˈfɔr/|trước|I drink water before breakfast.|Tôi uống nước trước bữa sáng.`,
    [['First, Mai gets up at six. Then, she has breakfast at seven.', 'Đầu tiên Mai dậy lúc sáu giờ. Sau đó cô ấy ăn sáng lúc bảy giờ.'], ['Finally, she goes to school.', 'Cuối cùng cô ấy đi học.']], 'Nghe rồi kể lại theo ba từ khóa first, then, finally. Khi đổi I thành she, nhớ has và goes.',
    [text('Điền: She __ breakfast at seven. (have)', 'has', 'Have đổi thành has với she.'), read('Mai gets up at six. She has breakfast at seven. She goes to school at eight.', 'Mai đi học lúc mấy giờ?', ['8', '6', '7'], '8', 'Goes to school at eight cho biết giờ đi học.'), order('Sắp xếp: school / goes / to / She', 'She goes to school.', 'She dùng goes; go to school là đi học.'), choice('Then diễn tả gì?', ['Sau đó', 'Ở đâu', 'Không'], 'Sau đó', 'Then chỉ thứ tự tiếp theo.', 'vocabulary')],
    [text('Điền: He __ breakfast. (have)', 'has', 'He cũng dùng has.'), choice('Từ mở đầu chuỗi hoạt động?', ['First', 'Finally', 'Where'], 'First', 'First = đầu tiên.', 'vocabulary'), read('First, I study. Then, I drink water.', 'Việc nào xảy ra sau?', ['drink water', 'study'], 'drink water', 'Then đánh dấu hoạt động sau.')],
    'Kể theo thứ tự first–then–finally; have thành has với he/she.', 'Kể ba câu về Mai theo văn bản, không nhìn lần thứ hai.');
  add(28, 'Ôn lỗi thường gặp', 'Tự sửa lỗi be, s/es và giới từ đã học.', 'Nói She has breakfast; nhắc thứ tự first–then–finally.',
    ['Hôm nay không mở rộng ngữ pháp. Trước tiên vào Ôn tập, xem các câu từng làm sai; sau đó dùng buổi này để đối chiếu bốn nhóm lỗi.', 'Nhóm 1: I am a student / I study English. Nhóm 2: She studies / Does she study? / She does not study. Nhóm 3: at seven / on Monday / in May. Nhóm 4: a pen / an apple.', 'Tự sửa theo thứ tự: xác định người/vật, xác định be hay hành động, kiểm tra trợ động từ, cuối cùng kiểm tra giới từ. Sai một câu là thông tin để ôn, không phải bằng chứng bạn không học được.'],
    `student|/ˈstuːdənt/|học sinh; sinh viên|I am a student.|Tôi là học sinh.
study|/ˈstʌdi/|học|She studies English.|Cô ấy học tiếng Anh.
Monday|/ˈmʌndeɪ/|thứ Hai|My class is on Monday.|Lớp tôi vào thứ Hai.
May|/meɪ/|tháng Năm|My birthday is in May.|Sinh nhật tôi vào tháng Năm.
apple|/ˈæpəl/|quả táo|It is an apple.|Đó là một quả táo.`,
    [['She studies English. Does she study English?', 'Cô ấy học tiếng Anh. Cô ấy có học tiếng Anh không?'], ['I get up at seven. My class is on Monday.', 'Tôi dậy lúc bảy giờ. Lớp tôi vào thứ Hai.']], 'Đọc cặp khẳng định–câu hỏi; nghe sự khác nhau giữa studies và study. Chọn thêm hai câu sai của chính bạn để nói lại.',
    [choice('Sửa “I am study English.”', ['I study English.', 'I studies English.'], 'I study English.', 'Không dùng am trước study ở hiện tại đơn.'), text('Sửa bằng cách điền: Does she __ English? (study)', 'study', 'Sau Does dùng động từ gốc.'), text('Điền: I get up __ seven.', 'at', 'Giờ dùng at.'), choice('Sửa “It is a apple.”', ['It is an apple.', 'It are an apple.'], 'It is an apple.', 'Apple bắt đầu bằng âm nguyên âm; it dùng is.')],
    [text('Điền: We __ students.', 'are', 'We dùng are.'), text('Điền: She __ not work.', 'does', 'She dùng does not.'), text('Điền: My class is __ Monday.', 'on', 'Ngày trong tuần dùng on.')],
    'Có quy trình tự kiểm tra lỗi. Luyện lại nhóm có tỷ lệ đúng thấp thay vì học dồn.', 'Chọn một nhóm yếu trong Tiến độ; làm lại ba câu của nhóm đó ngày mai.');
  add(29, 'Hội thoại kết hợp', 'Giới thiệu, gọi món và xin nói lại trong một chuỗi giao tiếp.', 'Ôn một lỗi ở ngày 28 rồi đọc lời giải mà không nhìn đáp án.',
    ['Ghép từng lượt ngắn: lời chào → thông tin cá nhân → yêu cầu → cảm ơn. Dừng ở dấu chấm giúp người nghe hiểu. Học năm cụm lịch sự như một khối, chưa cần phân tích thêm ngữ pháp: Nice to meet you = rất vui được gặp bạn; See you = hẹn gặp lại; Have a good day = chúc một ngày tốt lành; No problem = không vấn đề gì; That is okay = không sao.', 'Nếu nghe chưa rõ: I do not understand. Please say it again. Không đoán đồ uống hoặc hướng đi khi chưa chắc. No problem có thể đáp lời nhờ giúp hoặc cảm ơn; That is okay có thể đáp lời xin lỗi nhỏ.', 'Tình huống mẫu: bạn gặp một người ở lớp, giới thiệu tên, sau đó gọi trà tại quán. Các cấu trúc chính đều đã học; hãy thay tên hoặc đồ uống, đừng cố dịch một câu tiếng Việt dài chưa biết cấu trúc.'],
    `nice to meet you|/naɪs tə miːt juː/|rất vui được gặp bạn|Nice to meet you, Mai.|Rất vui được gặp bạn, Mai.
see you|/siː juː/|hẹn gặp lại|See you, An.|Hẹn gặp lại An.
have a good day|/hæv ə ɡʊd deɪ/|chúc một ngày tốt lành|Have a good day, Mai.|Chúc Mai một ngày tốt lành.
no problem|/noʊ ˈprɑbləm/|không vấn đề gì|No problem, An.|Không vấn đề gì, An.
that is okay|/ðæt ɪz oʊˈkeɪ/|không sao|That is okay.|Không sao.`,
    [['Hello. My name is An. Nice to meet you.', 'Xin chào. Tên tôi là An. Rất vui được gặp bạn.'], ['I would like tea, please. Here you are. Thank you.', 'Tôi muốn trà, làm ơn. Của bạn đây. Cảm ơn.'], ['Please say it again. No problem. Have a good day.', 'Làm ơn nói lại. Không vấn đề gì. Chúc một ngày tốt lành.']], 'Đọc hai vai theo ba đoạn. Lần hai che văn bản nhưng giữ từ khóa hello, name, tea, thank you. Tự đánh giá mức nhớ, không có điểm phát âm tự động.',
    [order('Sắp xếp: name / An / is / My', 'My name is An.', 'My name is + tên.'), choice('Chưa nghe rõ thì nói gì?', ['Please say it again.', 'Yes, I do.'], 'Please say it again.', 'Xin nhắc lại thay vì giả vờ hiểu.', 'conversation'), read('My name is Mai. I am a teacher. I would like water, please.', 'Mai gọi đồ uống nào?', ['water', 'tea', 'coffee'], 'water', 'Yêu cầu ở câu cuối là water.'), text('Điền: I would like tea, __.', 'please', 'Please tăng tính lịch sự.', 'conversation')],
    [text('Điền: I __ English every day. (study)', 'study', 'I dùng động từ gốc.'), choice('Kết thúc cuộc gặp, dùng gì?', ['Goodbye.', 'Where?'], 'Goodbye.', 'Goodbye dùng khi tạm biệt.', 'conversation'), order('Sắp xếp: you / help / Can / me', 'Can you help me?', 'Can + you + help + me?')],
    'Đã vận dụng nhiều mẫu ngắn trong tình huống; còn thiếu từ thì xin trợ giúp.', 'Chuẩn bị kiểm tra ngày 30: chọn hai bài yếu, ôn ít nhưng chủ động nhớ lại.');
  add(30, 'Tổng kết nền tảng và kế hoạch tiếp tục', 'Tự kiểm tra các nền tảng đã học và chọn bước ôn tiếp theo.', 'Nói hội thoại ngày 29 không nhìn toàn bộ văn bản.',
    ['Buổi cuối là ôn tập và vận dụng, không thêm kiến thức mới. Kết quả chỉ phản ánh những câu trong khóa này, không xác nhận chứng chỉ hay mức CEFR.', 'Nhớ bốn trục: tên chữ khác âm trong từ; be khác động từ hành động; he/she có s trong khẳng định nhưng động từ gốc sau does; câu giao tiếp ngắn cần đúng ý và lịch sự.', 'Sau 30 ngày, mục tiêu là nền tảng và thói quen, không phải thành thạo tiếng Anh. Chọn hai kỹ năng cần ôn theo kết quả thật; tiếp tục 15 phút mỗi ngày với nghe, nói theo, đọc ngắn và nhớ từ theo lịch.'],
    `name|/neɪm/|tên|My name is An.|Tên tôi là An.
study|/ˈstʌdi/|học|I study English every day.|Tôi học tiếng Anh mỗi ngày.
water|/ˈwɔtər/|nước|I would like water, please.|Tôi muốn gọi nước, làm ơn.
ready|/ˈrɛdi/|sẵn sàng|I am ready.|Tôi sẵn sàng.
again|/əˈɡɛn/|lại một lần nữa|Please say it again.|Làm ơn nói lại.`,
    [['My name is An. I am a student. I live in Hanoi. I study English every day.', 'Tên tôi là An. Tôi là học sinh. Tôi sống ở Hà Nội. Tôi học tiếng Anh mỗi ngày.'], ['I would like water, please. Please say it again. Thank you.', 'Tôi muốn nước, làm ơn. Làm ơn nói lại. Cảm ơn.']], 'Nói đoạn giới thiệu trong 30–45 giây rồi thực hiện yêu cầu gọi nước. Có thể nhìn từ khóa; không có đánh giá phát âm tự động.',
    [choice('Tên A khác âm đầu apple như thế nào?', ['Tên /eɪ/, âm /æ/', 'Cả hai /eɪ/'], 'Tên /eɪ/, âm /æ/', 'Tên chữ và âm trong từ không đồng nhất.', 'sounds'), text('Điền: She __ English every day. (study)', 'studies', 'She dùng studies trong khẳng định.'), order('Sắp xếp: you / tea / like / Do', 'Do you like tea?', 'Do + you + động từ gốc.'), read('Mai is a teacher. She gets up at six. Her class is on Monday. She drinks water. Her nghĩa là “của cô ấy”, chỉ dùng để hiểu đoạn này.', 'Mai uống gì?', ['water', 'coffee', 'tea'], 'water', 'She drinks water cho biết đồ uống; her đã được chú giải trong đoạn.')],
    [text('Điền: Does she __ English? (study)', 'study', 'Does đi với dạng gốc.'), read('I am An. I am a student. I live in Hanoi. I get up at seven.', 'An dậy lúc mấy giờ?', ['7', '10', '2'], '7', 'At seven nghĩa là lúc bảy giờ.'), order('Sắp xếp: water / would / I / like', 'I would like water.', 'I would like + đồ uống; thêm please khi giao tiếp.')],
    'Bạn đã đi qua đủ 30 ngày nền tảng. Hãy dùng kết quả thực tế để chọn bài ôn, không so với lời hứa thành thạo nhanh.', 'Tuần tiếp theo: mỗi ngày ôn câu đến hạn, nghe một đoạn ngắn, nói 3–5 câu và học tối đa năm từ phù hợp.');

  // Dictation uses only sentences explicitly taught in the corresponding lesson.
  for (const day of [8, 14, 22, 29, 30]) {
    const q = lessons[day - 1].practice.find(item => item.type === 'order');
    q.type = 'text'; q.audio = q.answers[0]; q.skill = 'listening';
    q.prompt = 'Nghe rồi nhập lại câu ngắn. Chỉ bỏ qua hoa/thường, dấu câu và khoảng trắng; không tự đổi từ.';
  }
  for (const lesson of lessons) for (const q of [...lesson.practice, ...lesson.test]) if (q.prompt.includes('chữ thường')) q.caseSensitive = true;
  function validate(lesson) {
    const errors = [];
    const string = value => typeof value === 'string' && value.trim().length > 0 && value.length < 5000;
    if (!Number.isInteger(lesson?.day) || lesson.day < 1 || lesson.day > 30) errors.push('Ngày phải từ 1–30.');
    for (const key of ['title', 'goal', 'speaking', 'summary', 'homework']) if (!string(lesson?.[key])) errors.push(`Thiếu ${key}.`);
    if (lesson?.day > 1 && !string(lesson?.review)) errors.push('Thiếu ôn ngày trước.');
    if (!Array.isArray(lesson?.teaching) || lesson.teaching.length < 2 || lesson.teaching.some(v => !string(v))) errors.push('Bài giảng cần ít nhất hai đoạn.');
    if (!Array.isArray(lesson?.vocab) || lesson.vocab.length < 5 || lesson.vocab.length > 8) errors.push('Cần 5–8 từ/cụm từ.');
    const vocabIds = new Set();
    for (const v of lesson?.vocab || []) {
      for (const key of ['id', 'term', 'ipa', 'meaning', 'example', 'translation']) if (!string(v[key])) errors.push(`Từ thiếu ${key}.`);
      if (!new RegExp(`^d${lesson.day}-v[1-9][0-9]*$`).test(v.id) || vocabIds.has(v.id)) errors.push('Mã từ phải duy nhất và đúng ngày.'); vocabIds.add(v.id);
      if (!/^\/[^/]+\/$/.test(v.ipa || '')) errors.push(`IPA ${v.term} cần nằm trong / /.`);
    }
    if (!Array.isArray(lesson?.dialogue) || !lesson.dialogue.length || lesson.dialogue.some(pair => !Array.isArray(pair) || pair.length !== 2 || pair.some(v => !string(v)))) errors.push('Thiếu hội thoại Anh–Việt.');
    const ids = new Set();
    for (const [section, min, max] of [['practice', 8, 12], ['test', 3, 5]]) {
      const items = lesson?.[section];
      if (!Array.isArray(items) || items.length < min || items.length > max) { errors.push(`Số câu ${section} không hợp lệ.`); continue; }
      items.forEach(q => {
        if (!new RegExp(`^d${lesson.day}-${section === 'practice' ? 'p' : 't'}[1-9][0-9]*$`).test(q.id) || ids.has(q.id)) errors.push('Mã câu trùng hoặc không đúng ngày/phần.'); ids.add(q.id);
        if (!['choice', 'text', 'order'].includes(q.type) || !string(q.prompt) || !string(q.explanation) || !['grammar', 'vocabulary', 'listening', 'writing', 'reading', 'letters', 'sounds', 'numbers', 'conversation'].includes(q.skill)) errors.push(`Câu ${q.id} thiếu loại, đề, kỹ năng hợp lệ hoặc lời giải.`);
        if (!Array.isArray(q.answers) || !q.answers.length || q.answers.some(a => !string(a))) errors.push(`Câu ${q.id} thiếu đáp án.`);
        if (q.type === 'choice' && (!Array.isArray(q.options) || q.options.length < 2 || new Set(q.options).size !== q.options.length || q.options.some(o => !string(o)) || q.answers.some(a => !q.options.includes(a)))) errors.push(`Lựa chọn/đáp án ${q.id} không hợp lệ.`);
        if (q.type === 'order' && (!Array.isArray(q.words) || !q.words.length || q.words.some(w => !string(w)))) errors.push(`Câu ${q.id} thiếu từ sắp xếp.`);
        if (q.word && !vocabIds.has(q.word)) errors.push(`Câu ${q.id} liên kết tới từ không tồn tại.`);
      });
    }
    if (!Number.isFinite(lesson?.minutes) || lesson.minutes < 15 || lesson.minutes > 20) errors.push('Thời lượng chính phải 15–20 phút.');
    return errors;
  }
  return { lessons, validate };
});
