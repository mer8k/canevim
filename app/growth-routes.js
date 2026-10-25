// Origins identify the visitor's starting point, never a branch of Can Evim.
// Route kilometres and minutes must come from live navigation, not static estimates.
export const ROUTE_DESTINATION = "41.1104673,29.4258912";
export const ROUTE_ADDRESS = "Üvezli, Alemdağ Şile Yolu No: 193, Şile / İstanbul";

export function directionsUrl(origin = "") {
  const params = new URLSearchParams({ api: "1", destination: ROUTE_DESTINATION, travelmode: "driving" });
  if (origin) params.set("origin", origin);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

const origins = [
  ["sile-merkez", "Şile Merkez", "Şile içinden", "Şile Merkez, Şile, İstanbul", "Merkezdeki gününüze Üvezli'de bir kahvaltı molası eklemek için başlangıcı Şile Merkez seçin. Can Evim, merkezdeki sahil ve liman hattında değil, Alemdağ Şile Yolu üzerindedir."],
  ["kumbaba", "Kumbaba", "Şile içinden", "Kumbaba Mahallesi, Şile, İstanbul", "Kumbaba'dan yola çıkarken haritadaki başlangıç noktasını kaldığınız adrese taşıyın. Sahil gezisiyle Üvezli'deki kahvaltıyı birleştiriyorsanız iki etap için ayrı rota açın."],
  ["agva", "Ağva", "Şile içinden", "Ağva Merkez Mahallesi, Şile, İstanbul", "Ağva–Şile arası kahvaltı arayanlar için hedefimiz Üvezli'dir. Can Evim Ağva'da veya Göksu Deresi kıyısında değildir; dönüş gününüzdeki sapmayı canlı rotadan karşılaştırın."],
  ["cavus", "Çavuş", "Şile içinden", "Çavuş Mahallesi, Şile, İstanbul", "Çavuş Mahallesi'nden başlayan rota, Şile merkezdeki hareket noktanızı Üvezli adresine bağlar. Kahvaltı öncesi sahile uğrayacaksanız navigasyona ara durak ekleyin."],
  ["balibey", "Balibey", "Şile içinden", "Balibey Mahallesi, Şile, İstanbul", "Balibey'den Üvezli'ye gelirken konakladığınız veya gezdiğiniz noktayı başlangıç olarak düzeltin. Fener ve Ağlayankaya çevresindeki gezinizin ardından mola saatini güncel trafiğe göre seçin."],
  ["sofular", "Sofular", "Şile içinden", "Sofular Mahallesi, Şile, İstanbul", "Sofular'daki sahil planından Üvezli'ye geçerken kıyı bağlantısı ile ana yol seçeneklerini Haritalar'da karşılaştırın. Buradaki yol tarifi doğrudan Can Evim'in bahçesine yönelir."],
  ["ahmetli", "Ahmetli", "Şile içinden", "Ahmetli Mahallesi, Şile, İstanbul", "Ahmetli başlangıcı, köy içindeki buluşma noktanızdan Can Evim'e sürüş planlamak içindir. Rota mesafesi mahallenin hangi sokağından çıktığınıza göre değişir."],
  ["dogancili", "Doğancılı", "Şile içinden", "Doğancılı Mahallesi, Şile, İstanbul", "Doğancılı gezisine kahvaltı veya gözleme molası eklerken hedef olarak Üvezli'yi seçin. Kıyıdaki yürüyüşünüz ile restoran ziyareti arasındaki süreyi canlı navigasyonda görün."],
  ["sahilkoy", "Sahilköy", "Şile içinden", "Sahilköy Mahallesi, Şile, İstanbul", "Sahilköy'den hareket edenler için rota ayrı bir sahil başlangıcı içerir. Deniz kenarındaki planınızın ardından bahçede oturmak isterseniz yola çıkmadan masa uygunluğunu sorun."],
  ["imrenli", "İmrenli", "Şile içinden", "İmrenli Mahallesi, Şile, İstanbul", "İmrenli'den gelirken doğu kıyısından Üvezli'ye yapılacak sürüşü günün planına dahil edin. Can Evim'i İmrenli içinde bir işletme gibi aramak yerine bu sabit hedefi kullanın."],
  ["akcakese", "Akçakese", "Şile içinden", "Akçakese Mahallesi, Şile, İstanbul", "Akçakese sahilinden dönüşte Üvezli'de gözleme veya yemek molası için bu rotayı açın. Gezi ve yemek saatlerini birleştirirken navigasyondaki güncel varış saatine bakın."],
  ["ovacik", "Ovacık", "Şile içinden", "Ovacık Mahallesi, Şile, İstanbul", "Ovacık ile Üvezli ayrı mahallelerdir. Başlangıcı konakladığınız adrese yaklaştırarak kahvaltı için ne zaman yola çıkmanız gerektiğini Haritalar üzerinden hesaplayın."],
  ["sakligol", "Saklıgöl çevresi", "Şile içinden", "Saklıgöl, Karamandere, Şile, İstanbul", "Saklıgöl çevresindeki gezinizden Can Evim'e ayrı bir sürüş rotası açabilirsiniz. İşletmemiz göl kıyısında değildir; kahvaltı adresi Üvezli, Alemdağ Şile Yolu No: 193'tür."],
  ["sile-feneri", "Şile Feneri çevresi", "Şile içinden", "Şile Feneri, Balibey, Şile, İstanbul", "Şile Feneri gezisi ile kahvaltıyı aynı güne koyanlar için başlangıç noktası fenerdir. Üvezli'deki masanıza geçmeden önce merkezden çıkış trafiğini haritada kontrol edin."],
  ["uvezli", "Üvezli", "Şile içinden", "Üvezli Mahallesi, Şile, İstanbul", "Aynı mahalledeyseniz başlangıcı evinizin veya bulunduğunuz sokağın üzerine alın. Can Evim'in girişi için Alemdağ Şile Yolu No: 193 adresini ve hedef iğnesini birlikte kontrol edin."],
  ["avcikoru", "Avcıkoru", "Şile içinden", "Avcıkoru Mahallesi, Şile, İstanbul", "Avcıkoru'dan Üvezli'ye kahvaltı ya da sıcak gözleme için hareket ediyorsanız bu bağlantı başlangıcı mahallenize kurar. Yol üzerindeki son giriş yönünü navigasyondan takip edin."],
  ["karamandere", "Karamandere", "Şile içinden", "Karamandere Mahallesi, Şile, İstanbul", "Karamandere'den köy yollarını kullanarak gelecek misafirler, başlangıcı kendi sokağına taşıyabilir. Hedefin göl tesisleri değil Can Evim Üvezli olduğuna harita ekranında bakın."],
  ["yenikoy", "Yeniköy", "Şile içinden", "Yeniköy Mahallesi, Şile, İstanbul", "Şile Yeniköy başlangıcı, İstanbul'daki aynı isimli diğer mahallelerle karışmayı önler. Üvezli'deki gözleme molanız için açılan rotada başlangıç ilçesinin Şile olduğunu kontrol edin."],
  ["kabakoz", "Kabakoz", "Şile içinden", "Kabakoz Mahallesi, Şile, İstanbul", "Kabakoz'dan dönüş planınıza Üvezli'de bir masa eklerken kahvaltı ve sıcak yemek saatlerini telefonla sorun. Rota, Kabakoz'u başlangıç ve Can Evim'i varış olarak açar."],
  ["ulupelit", "Ulupelit", "Şile içinden", "Ulupelit Mahallesi, Şile, İstanbul", "Ulupelit çevresindeki gününüz için ana yol ve mahalle bağlantılarını canlı haritadan karşılaştırın. Birden fazla araçla geliyorsanız herkese aynı Üvezli hedef bağlantısını iletin."],
  ["hacilli", "Hacıllı", "Şile içinden", "Hacıllı Mahallesi, Şile, İstanbul", "Hacıllı'daki doğa gezisinden Üvezli'ye geçiş ayrı bir etaptır. Molayı planlarken açık hava etkinliğinin bitiş saatini ve navigasyondaki varış zamanını birlikte değerlendirin."],
  ["teke", "Teke", "Şile içinden", "Teke Mahallesi, Şile, İstanbul", "Teke'den gelen misafirler başlangıcı köy içindeki buluşma noktasına taşıyarak rota açabilir. Hafta sonu toplu gelişlerde kişi sayısını yola çıkmadan WhatsApp üzerinden paylaşın."],
  ["cekmekoy", "Çekmeköy", "İstanbul çıkışları", "Çekmeköy, İstanbul", "Çekmeköy'den Şile yolu üzeri kahvaltı için Üvezli hedefini kullanın. Şile Otoyolu ile yerel bağlantılar arasındaki seçimi, gerçek çıkış adresiniz ve güncel trafik üzerinden yapın."],
  ["umraniye", "Ümraniye", "İstanbul çıkışları", "Ümraniye, İstanbul", "Ümraniye'den gelirken haritadaki başlangıcı kendi mahallenize taşıyın. Şile yönündeki bağlantılarda yoğunluk değişebildiği için sabit dakika yerine canlı varış saatini esas alın."],
  ["sancaktepe", "Sancaktepe", "İstanbul çıkışları", "Sancaktepe, İstanbul", "Sancaktepe çıkışında Şile yönündeki otoyol ve yerel yol alternatiflerini aynı ekranda karşılaştırın. Ücretli yol tercihlerinizi Haritalar'da düzenleyerek Üvezli'ye uygun rotayı seçin."],
  ["beykoz", "Beykoz", "İstanbul çıkışları", "Beykoz, İstanbul", "Beykoz geniş bir ilçe olduğu için sahil ve iç mahallelerden çıkış süreleri farklıdır. Başlangıcı tam adrese alıp orman bağlantıları ile ana yol seçeneklerini canlı haritada kontrol edin."],
  ["atasehir", "Ataşehir", "İstanbul çıkışları", "Ataşehir, İstanbul", "Ataşehir'den ailece kahvaltı planlarken çıkış mahallenizi ve varsa otoyol tercihlerinizi rotaya ekleyin. Hedefimiz Şile merkez değil, Üvezli'deki Alemdağ Şile Yolu adresidir."],
  ["kadikoy", "Kadıköy", "İstanbul çıkışları", "Kadıköy, İstanbul", "Kadıköy'den hareket edenler için kıyı ve iç hat çıkışlarının trafiği değişebilir. Tam başlangıç adresinizi seçip Can Evim'e tahmini varış saatini menü ve masa planınızla eşleştirin."],
  ["pendik", "Pendik", "İstanbul çıkışları", "Pendik, İstanbul", "Pendik'ten gelişte Kuzey Marmara Otoyolu dahil alternatifleri navigasyonun önerisine göre karşılaştırın. Ücretli yol ayarı ve çıkış mahallesi, görünen mesafe ile süreyi değiştirir."],
  ["kartal", "Kartal", "İstanbul çıkışları", "Kartal, İstanbul", "Kartal'dan Şile yönüne geçerken başlangıcınızı sahil ya da üst mahallelerdeki gerçek noktaya taşıyın. Kuzey Marmara ve diğer bağlantılar için canlı trafik ile ücret tercihlerini kontrol edin."],
  ["uskudar", "Üsküdar", "İstanbul çıkışları", "Üsküdar, İstanbul", "Üsküdar'daki buluşma noktanızdan Üvezli'ye rota açıp kişi sayısını masanıza göre planlayın. Kıyıdan veya iç mahallelerden çıkışın etkisini haritada güncel olarak görün."],
  ["maltepe", "Maltepe", "İstanbul çıkışları", "Maltepe, İstanbul", "Maltepe'den kahvaltıya gelirken başlangıç olarak ilçe adını değil bulunduğunuz adresi seçmeniz daha doğru sonuç verir. Üvezli varışını açıp gün içindeki dönüş rotanızı ayrıca planlayın."],
  ["tuzla", "Tuzla", "İstanbul çıkışları", "Tuzla, İstanbul", "Tuzla başlangıcında kuzey bağlantıları ve ücretli yol tercihi sürüş planını etkileyebilir. Harita güncel alternatifleri gösterirken siz de masa saatinizi varış zamanına göre belirleyin."],
  ["sultanbeyli", "Sultanbeyli", "İstanbul çıkışları", "Sultanbeyli, İstanbul", "Sultanbeyli'den gelen misafirler için çıkış sokağını doğru seçmek otoyol bağlantısını netleştirir. Kahvaltıdan önce navigasyondaki son yol durumunu ve masa uygunluğunu kontrol edin."],
  ["alemdag", "Alemdağ", "İstanbul çıkışları", "Alemdağ Mahallesi, Çekmeköy, İstanbul", "Alemdağ'dan Şile yolu üzerinde bir gözleme molası arıyorsanız varış iğnesini Üvezli'de tutun. İşletme adresindeki Alemdağ Şile Yolu ifadesi başlangıç mahallenizle karıştırılmamalıdır."],
  ["tasdelen", "Taşdelen", "İstanbul çıkışları", "Taşdelen Mahallesi, Çekmeköy, İstanbul", "Taşdelen'den çıkış için mahalle başlangıcını kendi adresinize taşıyın. Kahvaltı ile bahçe molasını birleştirmek isterseniz sipariş ve masa bilgilerini yola çıkmadan paylaşabilirsiniz."],
  ["omerli", "Ömerli", "İstanbul çıkışları", "Ömerli Mahallesi, Çekmeköy, İstanbul", "Ömerli başlangıcı özellikle Çekmeköy ilçesiyle tanımlanır. Aynı isimli başka noktaların seçilmesini önlemek için rota ekranında başlangıç ve Üvezli varışını birlikte doğrulayın."],
  ["resadiye", "Reşadiye", "İstanbul çıkışları", "Reşadiye Mahallesi, Çekmeköy, İstanbul", "Reşadiye'deki gezinizden Üvezli'ye geçmek için bu rota ayrı bir başlangıç sunar. Köy bağlantılarını ve ana yol seçeneklerini yolculuk anındaki harita önerisine göre seçin."],
  ["nisantepe", "Nişantepe", "İstanbul çıkışları", "Nişantepe Mahallesi, Çekmeköy, İstanbul", "Nişantepe'den kahvaltı için yola çıkanlar, mahalle içinde bulunduğu noktayı seçerek sürüşü netleştirebilir. Üvezli adresi sabit kalırken başlangıç ve trafik koşulları süreyi belirler."],
  ["sultanciftligi", "Sultançiftliği", "İstanbul çıkışları", "Sultançiftliği Mahallesi, Çekmeköy, İstanbul", "Çekmeköy Sultançiftliği'nden hareket ediyorsanız ilçe bilgisini rota ekranında kontrol edin. Ailenizle ya da grubunuzla aynı varış bağlantısını paylaşarak Üvezli'de buluşabilirsiniz."],
  ["kavacik", "Kavacık", "İstanbul çıkışları", "Kavacık Mahallesi, Beykoz, İstanbul", "Kavacık buluşmasından sonra Şile yönündeki bağlantıları güncel trafikle karşılaştırın. Grup araçları farklı yerlerden çıkıyorsa ortak hedef olarak Can Evim'in konumunu kullanın."],
  ["riva", "Riva", "İstanbul çıkışları", "Riva Mahallesi, Beykoz, İstanbul", "Riva'dan Üvezli'ye geçiş için kıyı gezisini ve kahvaltı molasını ayrı etaplar olarak kaydedin. Haritanın yolculuk anında önerdiği bağlantılar üzerinden sürüş planınızı oluşturun."],
  ["pasabahce", "Paşabahçe", "İstanbul çıkışları", "Paşabahçe Mahallesi, Beykoz, İstanbul", "Paşabahçe'den başlangıç seçildiğinde sahilden iç bağlantılara geçişi harita hesaplar. Bahçe masası talebinizi ve kişi sayısını paylaşarak varış öncesi hazırlığınızı tamamlayın."],
  ["umraniye-dudullu", "Dudullu", "İstanbul çıkışları", "Yukarı Dudullu Mahallesi, Ümraniye, İstanbul", "Dudullu çıkışında Yukarı ve Aşağı Dudullu arasındaki başlangıç farkını kendi adresinizi seçerek düzeltin. Üvezli'ye sürüşteki güncel trafik, kahvaltı buluşma saatinizi belirlesin."],
  ["umraniye-madenler", "Madenler", "İstanbul çıkışları", "Madenler Mahallesi, Ümraniye, İstanbul", "Madenler'den Üvezli'ye yol tarifi, başlangıcı mahallenin harita merkezinde açar. Daha doğru varış saati için bulunduğunuz sokağı seçip Şile bağlantısının güncel durumunu görün."],
  ["sancaktepe-samandira", "Samandıra", "İstanbul çıkışları", "Samandıra, Sancaktepe, İstanbul", "Samandıra'dan kahvaltı ya da öğle yemeğine gelirken güzergâh seçeneklerini otoyol ayarlarınızla değerlendirin. Can Evim'in Üvezli konumuna göre gününüzdeki diğer durakları sıralayın."],
  ["kadikoy-bostanci", "Bostancı", "İstanbul çıkışları", "Bostancı Mahallesi, Kadıköy, İstanbul", "Bostancı'da buluşup aynı araçla yola çıkıyorsanız başlangıcı buluşma adresine alın. Üvezli varışını açarak kahvaltı öncesi sürüşü ve dönüş saatini ayrı ayrı kontrol edin."],
  ["atasehir-icerenkoy", "İçerenköy", "İstanbul çıkışları", "İçerenköy Mahallesi, Ataşehir, İstanbul", "İçerenköy'den Şile yönüne çıkarken kavşaklardaki yoğunluk varış saatini etkileyebilir. Menünüzü incelerken haritada canlı süreyi de açın ve buluşma planını buna göre yapın."],
];

export const routeOrigins = origins.map(([id, name, group, origin, context]) => ({
  id, name, group, origin, context,
  directions: directionsUrl(origin),
  distanceLabel: "Mesafe Google Haritalar'da canlı hesaplanır",
  durationLabel: "Süre güncel trafikle hesaplanır",
}));

export const routeGroups = ["Şile içinden", "İstanbul çıkışları"];
