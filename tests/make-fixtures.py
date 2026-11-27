# Writes small SRT files in legacy encodings for tests/encoding.test.cjs
import os
D = os.path.join(os.path.dirname(__file__), 'fixtures')
S = {
 'ko.euc-kr':      ('euc-kr', ['안녕하세요, 오늘 날씨가 정말 좋네요.', '어디 가는 거야? 같이 가자.', '그 사람은 아직 모르는 것 같아.']),
 'ja.shift_jis':   ('shift_jis', ['こんにちは、元気ですか？', 'ちょっと待って、すぐ行くから。', '本当にありがとうございました。']),
 'zh-hans.gb18030':('gb18030', ['你好，我们今天去哪里？', '我不知道他在说什么。', '这是我的朋友，他叫小明。']),
 'zh-hant.big5':   ('big5', ['你好，我們今天去哪裡？', '我不知道他在說什麼。', '這是我的朋友，他叫小明。']),
 'ru.windows-1251':('cp1251', ['Привет, как дела?', 'Я не знаю, что ты хочешь сказать.', 'Он уже ушёл домой, но обещал вернуться.']),
 'ru.koi8-r':      ('koi8_r', ['Привет, как дела?', 'Я не знаю, что ты хочешь сказать.', 'Он уже ушёл домой, но обещал вернуться.']),
 'uk.windows-1251':('cp1251', ['Привіт, як справи?', 'Я не знаю, що ти хочеш сказати.', 'Вона вже пішла додому.']),
 'el.windows-1253':('cp1253', ['Γεια σου, τι κάνεις;', 'Δεν ξέρω τι θέλεις να πεις.', 'Έφυγε ήδη για το σπίτι.']),
 'he.windows-1255':('cp1255', ['שלום, מה שלומך?', 'אני לא יודע מה אתה רוצה להגיד.', 'הוא כבר הלך הביתה.']),
 'ar.windows-1256':('cp1256', ['مرحبا، كيف حالك؟', 'لا أعرف ماذا تريد أن تقول.', 'لقد ذهب إلى البيت بالفعل.']),
 'tr.windows-1254':('cp1254', ['Merhaba, nasılsın?', 'Ne söylemek istediğini bilmiyorum.', 'Çoktan eve gitti, ama geri döneceğini söyledi.']),
 'pl.windows-1250':('cp1250', ['Cześć, jak się masz?', 'Nie wiem, co chcesz powiedzieć.', 'Już poszedł do domu, ale obiecał wrócić.']),
 'cs.windows-1250':('cp1250', ['Ahoj, jak se máš?', 'Nevím, co chceš říct.', 'Už odešel domů, ale slíbil, že se vrátí.']),
 'ro.windows-1250':('cp1250', ['Bună ziua, ce mai faci?', 'Nu ştiu ce vrei să spui.', 'A plecat deja acasă, dar a promis că se întoarce.']),
 'hu.windows-1250':('cp1250', ['Szia, hogy vagy?', 'Nem tudom, mit akarsz mondani.', 'Már hazament, de megígérte, hogy visszajön.']),
 'fr.windows-1252':('cp1252', ['Salut, ça va ?', 'Je ne sais pas ce que tu veux dire.', 'Il est déjà rentré à la maison, mais il a promis de revenir.']),
 'de.windows-1252':('cp1252', ['Hallo, wie geht’s dir?', 'Ich weiß nicht, was du sagen willst.', 'Er ist schon nach Hause gegangen, aber er hat versprochen, zurückzukommen.']),
 'es.windows-1252':('cp1252', ['¿Hola, cómo estás?', 'No sé qué quieres decir.', '¡Ya se fue a casa, pero prometió volver!']),
 'pt.windows-1252':('cp1252', ['Olá, tudo bem?', 'Não sei o que você quer dizer.', 'Ele já foi para casa, mas prometeu voltar.']),
 'lt.windows-1257':('cp1257', ['Labas, kaip sekasi?', 'Nežinau, ką nori pasakyti.', 'Jis jau išėjo namo, bet pažadėjo grįžti.']),
 'vi.windows-1258':('cp1258', ['Xin chào, bạn có khỏe không?', 'Tôi không biết bạn muốn nói gì.', 'Anh ấy đã về nhà rồi.']),
 'ko.utf-16le':    ('utf-16-le', ['안녕하세요, 오늘 날씨가 정말 좋네요.', '어디 가는 거야?']),
}
import unicodedata
for name, (codec, lines) in S.items():
    srt = ''
    for i, l in enumerate(lines * 2):
        srt += f'{i+1}\r\n00:00:{i*3:02d},000 --> 00:00:{i*3+2:02d},500\r\n{l}\r\n\r\n'
    if codec == 'cp1258':  # Vietnamese 1258: base letters precomposed, tone marks combining
        out = ''
        for c in unicodedata.normalize('NFC', srt):
            try: c.encode('cp1258'); out += c; continue
            except UnicodeEncodeError: pass
            d = unicodedata.normalize('NFD', c)
            for k in range(len(d), 0, -1):
                head = unicodedata.normalize('NFC', d[:k])
                try: head.encode('cp1258'); out += head + d[k:]; break
                except UnicodeEncodeError: pass
        srt = out
    data = srt.encode(codec)
    open(os.path.join(D, name + '.srt'), 'wb').write(data)
print('ok', len(S))
