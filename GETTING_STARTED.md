# 🚀 Hızlı Başlangıç Kılavuzu

Bu kılavuz, Fırat Ders Takip uygulamasını kullanmaya başlamanız için adım adım talimatlar içerir.

## 📋 Ön Hazırlık

### 1. Gerekli Bilgileri Toplayın

Başlamadan önce şunlara ihtiyacınız var:
- ✅ Öğrenci numaranız (CAS login için)
- ✅ Öğrenci şifreniz
- ✅ Online ders URL'leriniz
- ✅ Haftalık ders programınız

### 2. Node.js Kurulumu

Node.js kurulu değilse:
- Windows: https://nodejs.org/en/download/ adresinden indirin
- Linux: `sudo apt install nodejs npm`
- macOS: `brew install node`

Kontrol edin:
```bash
node --version  # v14 veya üzeri olmalı
npm --version
```

## 📥 Kurulum

### Adım 1: Depoyu İndirin

```bash
git clone https://github.com/enesehs/firat-ders-takip.git
cd firat-ders-takip
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

Bu işlem birkaç dakika sürebilir. Aşağıdaki paketler yüklenecek:
- `puppeteer` - Tarayıcı otomasyonu
- `node-notifier` - Masaüstü bildirimleri
- `chalk` - Renkli konsol çıktısı
- `crypto-js` - Şifreleme

## ⚙️ İlk Yapılandırma

### Adım 3: Uygulamayı İlk Kez Çalıştırın

```bash
npm start
```

### Adım 4: Ders Programınızı Girin

Uygulama size günlük bazda ders bilgilerini soracak:

```
📅 Weekly Schedule Setup
Enter your class schedule (leave blank when done)

Monday:
  Enter class time (HH:MM, or press Enter to skip): 09:00
  Enter class URL: https://online.firat.edu.tr/class/matematik
  Enter class name: Matematik I
  
  Enter class time (HH:MM, or press Enter to skip): 13:00
  Enter class URL: https://online.firat.edu.tr/class/fizik
  Enter class name: Fizik I
  
  Enter class time (HH:MM, or press Enter to skip): [Enter tuşuna basın]
```

**İpuçları:**
- Saat formatı: 24 saat formatında (örn: 09:00, 14:30)
- URL: Tam URL'yi girin (https:// ile başlayan)
- İsim: Kısa ve anlamlı isimler verin
- Ders yoksa: Enter tuşuna basarak geçin

### Adım 5: Bildirim Süresini Ayarlayın

```
⏰ Minutes before class for notification (default: 5): 10
```

Kaç dakika önce bildirim almak istediğinizi girin (örn: 5, 10, 15).

### Adım 6: Kimlik Bilgilerinizi Girin

```
🔐 Secure Credential Storage Setup
Username (student ID): 123456789
Password: ********
Create master password for encryption: ********
```

**Önemli:**
- Master şifrenizi unutmayın! Bu şifre olmadan kimlik bilgilerinize erişemezsiniz
- Master şifre, öğrenci şifrenizden farklı ve güçlü bir şifre olmalı
- Kimlik bilgileri şifreli olarak saklanır

## ▶️ Normal Kullanım

### Her Gün Çalıştırma

```bash
npm start
```

Master şifrenizi girin:
```
🔐 Enter master password to decrypt credentials: ********
```

Artık uygulama çalışıyor! Ne yapacak:
- ⏰ Her dakika ders programınızı kontrol eder
- 📢 Ders başlamadan önce bildirim gönderir
- 🚀 Ders saatinde otomatik olarak CAS'a giriş yapar
- 📚 Derse otomatik olarak katılır
- 📊 Tüm işlemleri loglar

### Ekran Çıktısı

```
⏰ Next class: Matematik I in 2h 45m 30s at 09:00
```

Ders yoksa:
```
╔══════════════════════════════════════╗
║   🎉 NO CLASSES TODAY 🎉             ║
╚══════════════════════════════════════╝
```

## 🔧 Yapılandırma Güncelleme

### Ders Ekleme/Çıkarma

`config.json` dosyasını düzenleyin:

```json
{
  "schedule": [
    {
      "day": "Monday",
      "time": "09:00",
      "url": "https://online.firat.edu.tr/class/123",
      "name": "Yeni Ders"
    }
  ],
  "notificationMinutes": 5
}
```

### Kimlik Bilgilerini Sıfırlama

```bash
rm .credentials.enc
npm start
```

Kimlik bilgilerinizi yeniden girmeniz istenecek.

## 📱 Bildirimler

### Masaüstü Bildirimleri

Bildirimler otomatik olarak görünmelidir. Görünmüyorsa:

**Windows:**
- Ayarlar > Sistem > Bildirimler > Uygulamaya izin ver

**macOS:**
- Sistem Tercihleri > Bildirimler > Terminal/Node'a izin ver

**Linux:**
- `libnotify-bin` paketinin kurulu olduğundan emin olun

## 🐛 Yaygın Sorunlar

### "Cannot find module" Hatası

```bash
rm -rf node_modules
npm install
```

### Master Şifreyi Unuttum

```bash
rm .credentials.enc
npm start
```

Kimlik bilgilerinizi yeniden girmeniz gerekecek.

### Tarayıcı Açılmıyor

Puppeteer için gerekli bağımlılıklar:

**Linux:**
```bash
sudo apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libdrm2 \
  libxkbcommon0 \
  libgbm1
```

### CAS Login Başarısız

1. Kimlik bilgilerinizi kontrol edin
2. `debug-login.png` dosyasına bakın
3. Internet bağlantınızı kontrol edin
4. CAS sitesinin erişilebilir olduğundan emin olun

## 📝 Günlük Kontrol Listesi

- [ ] Uygulamayı başlat: `npm start`
- [ ] Master şifreyi gir
- [ ] Terminali açık tut
- [ ] Bildirimlere dikkat et
- [ ] Dersten sonra logları kontrol et: `app.log`

## 💡 İpuçları

1. **Arka Planda Çalıştırma (Linux/Mac):**
   ```bash
   nohup npm start &
   ```

2. **Logları Takip Etme:**
   ```bash
   tail -f app.log
   ```

3. **Hızlı Test:**
   Önümüzdeki 2 dakikaya bir test dersi ekleyin

4. **Çoklu Ders:**
   Aynı gün birden fazla ders ekleyebilirsiniz

## 🆘 Yardım

Sorun yaşıyorsanız:
1. `app.log` dosyasını kontrol edin
2. `debug-*.png` screenshot'larına bakın
3. GitHub'da issue açın
4. Detaylı hata mesajını paylaşın

## ⚡ Hızlı Komutlar

```bash
# Çalıştır
npm start

# Yapılandırmayı sıfırla
rm config.json .credentials.enc

# Logları temizle
rm app.log debug-*.png

# Yeniden başlat
rm -rf node_modules
npm install
npm start
```

---

Başarılar! 🎓✨