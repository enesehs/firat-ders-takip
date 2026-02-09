# 🎓 Fırat Ders Takip (Academic Schedule Manager)

Fırat Üniversitesi online derslerine otomatik katılım sağlayan akıllı ders takip sistemi.

## ✨ Özellikler

- 📅 **Haftalık Ders Programı**: Haftalık ders programınızı kolayca girin
- ⏰ **Özelleştirilebilir Bildirimler**: Ders başlamadan X dakika önce uyarı alın
- 🔐 **Otomatik CAS Girişi**: https://jasig.firat.edu.tr/cas/login otomatik girişi
- 🚀 **Doğrudan Ders Erişimi**: Ders saatinde otomatik olarak derse katılın
- ⏱️ **Canlı Geri Sayım**: Bir sonraki derse kalan süreyi anlık takip edin
- 🎉 **"Bugün Ders Yok" Göstergesi**: Ders olmayan günlerde bilgilendirme
- 📝 **Kapsamlı Debug Loglama**: Tüm işlemler detaylı şekilde loglanır
- 🔒 **Güvenli Kimlik Bilgisi Depolama**: Şifreli ve güvenli credential saklama

## 🚀 Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn

### Adım 1: Depoyu Klonlayın

```bash
git clone https://github.com/enesehs/firat-ders-takip.git
cd firat-ders-takip
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

## 📖 Kullanım

### İlk Çalıştırma

Uygulamayı ilk kez çalıştırdığınızda, size şunları soracaktır:

1. **Haftalık Ders Programı**: Her gün için ders saatleri, URL'ler ve ders adları
2. **Bildirim Süresi**: Ders başlamadan kaç dakika önce bildirim istediğiniz
3. **Kimlik Bilgileri**: Öğrenci numaranız ve şifreniz (şifreli olarak saklanır)
4. **Master Şifre**: Kimlik bilgilerinizi şifrelemek için bir master şifre

```bash
npm start
```

### Örnek Ders Programı Girişi

```
📅 Weekly Schedule Setup
Enter your class schedule (leave blank when done)

Monday:
  Enter class time (HH:MM, or press Enter to skip): 09:00
  Enter class URL: https://online.firat.edu.tr/class/123
  Enter class name: Matematik I
  
  Enter class time (HH:MM, or press Enter to skip): 14:00
  Enter class URL: https://online.firat.edu.tr/class/456
  Enter class name: Fizik I
  
  Enter class time (HH:MM, or press Enter to skip): [Enter]

Tuesday:
  ...
```

### Normal Çalıştırma

Yapılandırma tamamlandıktan sonra, uygulamayı her çalıştırmanızda:

1. Master şifrenizi girmeniz istenecek
2. Uygulama otomatik olarak ders programınızı takip edecek
3. Ders vakti geldiğinde otomatik olarak CAS'a giriş yapacak ve derse katılacak
4. Ders başlamadan önce bildirim alacaksınız

```bash
npm start
```

## 🎯 Özellik Detayları

### 1. Otomatik CAS Girişi

Uygulama, Fırat Üniversitesi CAS (Central Authentication Service) sistemi üzerinden otomatik giriş yapar:

- Kimlik bilgilerinizi güvenli şekilde saklar (AES şifreleme)
- Ders saatinde otomatik olarak giriş yapar
- Başarılı/başarısız giriş durumlarını bildirir

### 2. Canlı Geri Sayım

Terminal ekranında sürekli olarak:
- Bir sonraki dersinize kalan süre
- Ders adı ve saati
- Gerçek zamanlı güncelleme

### 3. Bildirimler

Ders başlamadan belirlediğiniz süre önce (varsayılan 5 dakika):
- Masaüstü bildirimi gönderilir
- Ders adı ve kalan süre gösterilir
- Ses ile uyarı (sistem bildirim sesiyle)

### 4. Debug Loglama

Tüm işlemler `app.log` dosyasına kaydedilir:
- Timestamp ile birlikte
- Farklı log seviyeleri (info, success, warning, error, debug)
- Debug screenshot'lar (login ve class sayfaları)

### 5. "Bugün Ders Yok" Göstergesi

Programınızda o gün ders yoksa:
```
╔══════════════════════════════════════╗
║   🎉 NO CLASSES TODAY 🎉             ║
╚══════════════════════════════════════╝
```

## 📁 Dosya Yapısı

```
firat-ders-takip/
├── index.js              # Ana uygulama dosyası
├── package.json          # Proje bağımlılıkları
├── config.json          # Ders programı (ilk çalıştırmada oluşturulur)
├── .credentials.enc     # Şifreli kimlik bilgileri (ilk çalıştırmada oluşturulur)
├── app.log              # Uygulama logları
├── debug-login.png      # Login sayfası screenshot (debug)
├── debug-class.png      # Ders sayfası screenshot (debug)
└── README.md            # Bu dosya
```

## 🔒 Güvenlik

- **Şifreleme**: Tüm kimlik bilgileri AES-256 ile şifrelenir
- **Master Şifre**: Kimlik bilgilerinize sadece master şifre ile erişilebilir
- **Lokal Depolama**: Hiçbir veri dış sunuculara gönderilmez
- **.gitignore**: Hassas dosyalar Git'e eklenmez

## 🛠️ Yapılandırma

### config.json

```json
{
  "schedule": [
    {
      "day": "Monday",
      "time": "09:00",
      "url": "https://online.firat.edu.tr/class/123",
      "name": "Matematik I"
    }
  ],
  "notificationMinutes": 5
}
```

### Manuel Düzenleme

config.json dosyasını manuel olarak düzenleyebilirsiniz:
- Yeni ders ekleyin
- Ders saatlerini değiştirin
- Bildirim süresini ayarlayın

## 🐛 Sorun Giderme

### Uygulama başlamıyor

```bash
# Bağımlılıkları yeniden yükleyin
rm -rf node_modules
npm install
```

### Kimlik bilgileri hatası

```bash
# .credentials.enc dosyasını silin ve yeniden oluşturun
rm .credentials.enc
npm start
```

### Debug modu

Uygulama varsayılan olarak debug modunda çalışır ve:
- Detaylı loglar üretir
- Screenshot'lar alır
- Tüm adımları gösterir

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje GPL-3.0 lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## ⚠️ Disclaimer

Bu uygulama eğitim amaçlıdır. Kullanımdan doğacak sorumluluk kullanıcıya aittir. Üniversite politikalarına uygun kullanımdan kullanıcı sorumludur.

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

Made with ❤️ for Fırat University students
