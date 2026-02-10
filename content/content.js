if (window.dtsHasRun) {
} else {
  window.dtsHasRun = true;

  const FORM_ARAMA_LIMITI = 10;
  const FORM_ARAMA_ARALIK_MS = 1000;
  const HATA_GOSTERIM_MS = 5000;
  const YONLENDIRME_BEKLEME_MS = 1500;
  const FORM_GONDERIM_BEKLEME_MS = 500;

  const HATA_KELIMELERI = ['hatali', 'yanlis', 'failed', 'incorrect', 'şifreniz geçerli değil'];

  let girisDenemesiAktif = false;
  let girisIntervalId = null;

  const durumKutusu = document.createElement('div');
  durumKutusu.id = 'dts-status-box';
  durumKutusu.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #e0e0e0;
    border: 1px solid rgba(101, 20, 31, 0.6);
    border-left: 3px solid #65141f;
    z-index: 999999;
    padding: 14px 18px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: 0.2px;
    line-height: 1.5;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04);
    backdrop-filter: blur(8px);
    pointer-events: none;
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;

  function durumGuncelle(mesaj, renk = 'white') {
    if (!document.getElementById('dts-status-box')) {
      document.documentElement.appendChild(durumKutusu);
      requestAnimationFrame(() => {
        durumKutusu.style.opacity = '1';
        durumKutusu.style.transform = 'translateY(0)';
      });
    }
    durumKutusu.innerHTML = `Fırat Ders Takip Sistemi<br>${mesaj}`;
    durumKutusu.style.color = renk;
  }

  function durumKutusuKaldir(gecikmeMs) {
    setTimeout(() => {
      if (durumKutusu && document.body.contains(durumKutusu)) {
        durumKutusu.remove();
      }
    }, gecikmeMs);
  }

  function oncekiDenemeBasarisizMi() {
    const sonDeneme = sessionStorage.getItem('dts_login_attempt');
    if (!sonDeneme) return false;

    const gecenSure = Date.now() - parseInt(sonDeneme);
    if (gecenSure < 60000) {
      sessionStorage.removeItem('dts_login_attempt');
      return true;
    }
    return false;
  }

  function sayfadaHataVarMi() {
    const sayfaMetni = document.body.innerText.toLowerCase();
    return HATA_KELIMELERI.some(kelime => sayfaMetni.includes(kelime));
  }

  function formDoldurVeGonder(ogrenciNo, sifre, kullaniciAdiInput, sifreInput, gonderButonu) {
    durumGuncelle('Giris yapiliyor...', '#339af0');

    try {
      kullaniciAdiInput.value = ogrenciNo;
      sifreInput.value = sifre;

      ['input', 'change'].forEach(olay => {
        kullaniciAdiInput.dispatchEvent(new Event(olay, { bubbles: true }));
        sifreInput.dispatchEvent(new Event(olay, { bubbles: true }));
      });

      kullaniciAdiInput.style.border = '3px solid #51cf66';
      sifreInput.style.border = '3px solid #51cf66';

      sessionStorage.setItem('dts_login_attempt', Date.now().toString());

      setTimeout(() => {
        gonderButonu.click();
        durumGuncelle('Giris butonuna tiklandi!', '#51cf66');
        girisDenemesiAktif = true;

        const yonlendirmeUrl = new URLSearchParams(window.location.search).get('dts_redirect');
        if (yonlendirmeUrl) {
          chrome.storage.local.remove('dtsYonlendirme');
          setTimeout(() => {
            window.location.href = decodeURIComponent(yonlendirmeUrl);
          }, YONLENDIRME_BEKLEME_MS);
        }
      }, FORM_GONDERIM_BEKLEME_MS);
    } catch (hata) {
      durumGuncelle('Hata: ' + hata.message, '#ff6b6b');
      girisDenemesiAktif = false;
    }
  }

  function formAra(ogrenciNo, sifre) {
    let denemeSayaci = 0;

    if (girisIntervalId) clearInterval(girisIntervalId);

    girisIntervalId = setInterval(() => {
      denemeSayaci++;

      const kullaniciAdiInput = document.getElementById('username');
      const sifreInput = document.getElementById('password');
      const gonderButonu = document.querySelector('input[name="submit"][value="LOGIN"]');

      if (kullaniciAdiInput && sifreInput && gonderButonu) {
        clearInterval(girisIntervalId);
        girisIntervalId = null;
        formDoldurVeGonder(ogrenciNo, sifre, kullaniciAdiInput, sifreInput, gonderButonu);
        return;
      }

      if (denemeSayaci >= FORM_ARAMA_LIMITI) {
        clearInterval(girisIntervalId);
        girisIntervalId = null;
        durumGuncelle('Form bulunamadi (Zaman asimi)', '#ff6b6b');
        girisDenemesiAktif = false;
        durumKutusuKaldir(2000);
      }
    }, FORM_ARAMA_ARALIK_MS);
  }

  function girisYap() {
    if (girisDenemesiAktif) return;

    if (oncekiDenemeBasarisizMi()) {
      durumGuncelle('Hatali ogrenci numarasi veya sifre!', '#ff4444');
      durumKutusuKaldir(HATA_GOSTERIM_MS);
      return;
    }

    girisDenemesiAktif = true;

    chrome.storage.local.get(['credentials'], (sonuc) => {
      const kimlik = sonuc.credentials;

      if (!kimlik?.studentId || !kimlik?.password) {
        durumGuncelle('Kimlik bilgisi bulunamadi! Lutfen eklentiden kaydedin.', '#ff6b6b');
        girisDenemesiAktif = false;
        return;
      }

      if (sayfadaHataVarMi()) {
        durumGuncelle('Hatali ogrenci numarasi veya sifre!', '#ff4444');
        girisDenemesiAktif = false;
        return;
      }

      durumGuncelle(`Bilgiler alindi: ${kimlik.studentId} - Form araniyor...`, '#51cf66');
      formAra(kimlik.studentId, kimlik.password);
    });
  }

  function butonEkle() {
    const kullaniciAdiInput = document.getElementById('username');
    if (!kullaniciAdiInput || document.getElementById('dts-auto-login-btn')) return;

    const buton = document.createElement('div');
    buton.id = 'dts-auto-login-btn';
    buton.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px; cursor:pointer; background:#65141f; color:white; padding:6px 12px; border-radius:4px; font-size:13px; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        Otomatik Giris Yap
      </div>
    `;
    buton.style.cssText = 'position:absolute; right:0; top:-35px; z-index:100;';

    const parent = kullaniciAdiInput.parentElement;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    buton.addEventListener('click', () => {
      sessionStorage.removeItem('dts_login_attempt');
      durumGuncelle('Otomatik giris baslatiliyor...', '#339af0');
      girisYap();
    });

    parent.appendChild(buton);
  }

  function debsisYonlendirmeKontrol() {
    if (!window.location.hostname.includes('debsis.firat.edu.tr')) return false;

    chrome.storage.local.get(['dtsYonlendirme'], (sonuc) => {
      if (sonuc.dtsYonlendirme) {
        const hedef = sonuc.dtsYonlendirme;
        chrome.storage.local.remove('dtsYonlendirme');
        durumGuncelle('Oturum aktif, derse yonlendiriliyor...', '#51cf66');
        setTimeout(() => { window.location.href = hedef; }, YONLENDIRME_BEKLEME_MS);
      }
    });
    return true;
  }

  function baslat() {
    if (debsisYonlendirmeKontrol()) return;

    if (window.location.href.includes('dts_auto=true')) {
      girisYap();
    } else {
      butonEkle();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', baslat);
  } else {
    baslat();
  }
}
