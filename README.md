# Fırat Üniversitesi Ders Takip Sistemi

<div align="center">
  <img src="icons/DTS_128.png" alt="Logo" width="100" height="100">
  <br>
  <h3>Fırat Üniversitesi Ders Takip Sistemi</h3>
  <p>Ders programınızı takip edin, otomatik giriş yapın ve derslerinizi kaçırmayın.</p>

  <p>
    <a href="https://github.com/enesehs/firat-ders-takip/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/enesehs/firat-ders-takip?style=flat-square&color=4338ca&label=Lisans" alt="License">
    </a>
    <a href="https://github.com/enesehs/firat-ders-takip/releases">
      <img src="https://img.shields.io/github/v/release/enesehs/firat-ders-takip?style=flat-square&color=059669&label=Sürüm" alt="Version">
    </a>
    <a href="https://chromewebstore.google.com/detail/ilmohokncfeadohaafjhehgbpejjnoam">
      <img src="https://img.shields.io/badge/Platform-Chrome_Web_Store-db2777?style=flat-square&logo=google-chrome&logoColor=white" alt="Chrome Web Store">
    </a>
    <img src="https://img.shields.io/badge/Dil-JavaScript-d97706?style=flat-square&logo=javascript&logoColor=white" alt="JavaScript">
  </p>
</div>

---
>Fırat Üniversitesi'nin resmi bir ürünü veya hizmeti değildir.

## ⚡ Özellikler

Bu eklenti, üniversite hayatınızı kolaylaştırmak için tasarlanmış bir dizi güçlü özellik sunar:

*   **📅 Akıllı Ders Programı**: Günlük ders programınızı otomatik olarak görüntüler ve yönetir.
*   **⏳ Canlı Geri Sayım**: Bir sonraki derse kalan süreyi saniye saniye takip edin.
*   **🔗 Otomatik Giriş**: DEBSİS sistemine tek tıkla veya otomatik olarak giriş yapın.
*   **🚀 Hızlı Katılım**: Ders saati geldiğinde doğrudan derse katılma bağlantısı sunar.
*   **🌙 Modern Arayüz**: Göz yormayan, şık ve modern karanlık tema.

## 🖼️ Ekran Görüntüleri
<div align="center">
  <img src="https://github.com/user-attachments/assets/fc15c009-63b5-4240-8b7d-7fd8edbde1b1" alt="Eklenti Görünümü" width="300" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
  <br>
  <em>Modern ve kullanıcı dostu arayüz.</em>
</div>

## 📥 Kurulum

En kolay kurulum yöntemi Chrome Web Mağazası'nı kullanmaktır:

<a href="https://chromewebstore.google.com/detail/ilmohokncfeadohaafjhehgbpejjnoam?utm_source=item-share-cb">
  <img src="https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png" alt="Chrome Web Mağazası'nda Mevcut" width="200">
</a>

Alternatif olarak, geliştirici modunda yüklemek için:

1.  Releases kısmından en son sürümü indirin.
2.  Tarayıcınızda uzantılar sayfasını açın:
    *   **Chrome**: `chrome://extensions`
    *   **Edge**: `edge://extensions`
3.  Sağ üst köşedeki **Geliştirici Modu**'nu aktif hale getirin.
4.  **Paketlenmemiş öğe yükle** butonuna tıklayın ve indirdiğiniz dosyayı seçin.

## ❓ Nasıl Kullanılır?

1.  Tarayıcı araç çubuğundaki eklenti simgesine tıklayın.
2.  **Kimlik Bilgileri** panelini açarak öğrenci numaranızı ve şifrenizi kaydedin (veriler sadece tarayıcınızda saklanır).
3.  Ders programınızı ekranda göreceksiniz.
4.  Ders saati geldiğinde **"Derse Katıl"** butonu aktif olacaktır.

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak isterseniz, lütfen aşağıdaki adımları izleyin:

1.  Projeyi forklayın.
2.  Yeni bir özellik dalı (branch) oluşturun (`git checkout -b ozellik/YeniOzellik`).
3.  Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`).
4.  Dalınızı (branch) push edin (`git push origin ozellik/YeniOzellik`).
5.  Bir Pull Request (PR) oluşturun.

Lütfen katkıda bulunurken anlaşılabilir kod yapısı kullanmaya özen gösterin.

## 🛠️ Geliştirici Notları

Proje açık kaynak kodludur ve geliştirmeye açıktır.

*   `manifest.json`: Eklenti yapılandırması ve izinler.
*   `popup/`: Ana arayüz dosyaları.
*   `content/`: Sayfa içi scriptler (Otomatik giriş ve yönlendirme).
*   `background/`: Arka plan işlemleri ve alarmlar.

---

<div align="center">
  <p>Enes Hacısağır tarafından geliştirilmiştir.</p>
  <p>
    <a href="https://github.com/enesehs">
        <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
    </a>
    &nbsp;&nbsp;
    <a href="https://enesehs.dev">
        <img src="https://img.shields.io/badge/Website-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Website">
    </a>
    &nbsp;&nbsp;
    <a href="https://www.linkedin.com/in/enesehs">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
    </a>
  </p>
</div>
<sub> Fırat Üniversitesi Ders Takip Sistemi", Fırat Üniversitesi'nin resmi bir ürünü veya hizmeti değildir. Eklenti, mevcut öğrenci bilgi sistemlerinin (DEBSİS vb.) kullanımını optimize eden bir "browser wrapper" görevi görür. Kullanıcı, giriş bilgilerini kendi rızasıyla eklentiye kaydeder. Geliştirici, yazılımın hatasız çalışacağına dair garanti vermez ve yazılımın kullanımından kaynaklanan hiçbir doğrudan veya dolaylı zarardan sorumlu tutulamaz.</sub>
