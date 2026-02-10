const GUN_ADLARI = ['Pazar', 'Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi'];
const DEBSIS_GIRIS_URL = 'https://jasig.firat.edu.tr/cas/login?service=https%3A%2F%2Fdebsis.firat.edu.tr%2Flogin%2Findex.php%3FauthCAS%3DCAS&dts_auto=true';
const GITHUB_PROFIL_URL = 'https://github.com/enesehs';
const ILERLEME_HALKASI_YARICAP = 50;
const GERI_SAYIM_MAX_DAKIKA = 30;
const KATIL_BUTON_ESIK_DAKIKA = 15;
const KAYIT_DURUMU_TEMIZLE_MS = 2000;

let dersProgram = [];
let siradakiDers = null;
let geriSayimInterval = null;
let hatirlatmaDakika = 10;

function varsayilanProgramGetir() {
  return [
    { gun: 1, gunAdi: "Pazartesi", dersler: [
      { id: "p1", dersAdi: "Sunucu Isletim Sistemi", ogretimGorevlisi: "Ogr.Gor. Z.OBUZ", baslangic: "15:15", bitis: "16:45", link: "" },
      { id: "p2", dersAdi: "Bilgi Guvenligi Ve Siber Guvenlik", ogretimGorevlisi: "Doc. Dr. D.AVCI", baslangic: "19:15", bitis: "20:45", link: "" }
    ]},
    { gun: 2, gunAdi: "Sali", dersler: [
      { id: "s1", dersAdi: "Sistem Analiz ve Tasarimi", ogretimGorevlisi: "Ogr.Gor. Dr. M.P.BAYDOGAN", baslangic: "16:15", bitis: "17:45", link: "" },
      { id: "s2", dersAdi: "Mobil Programlama", ogretimGorevlisi: "Ogr.Gor. H.EKINCI", baslangic: "19:15", bitis: "20:45", link: "" }
    ]},
    { gun: 3, gunAdi: "Carsamba", dersler: [
      { id: "c1", dersAdi: "Mesleki Yabanci Dil-II", ogretimGorevlisi: "Doc. Dr. D.AVCI", baslangic: "17:15", bitis: "18:45", link: "" }
    ]},
    { gun: 4, gunAdi: "Persembe", dersler: [
      { id: "pe1", dersAdi: "Acik Kaynak Isletim Sistemi", ogretimGorevlisi: "Dr. Ogr. Uyesi K.FIRILDAK", baslangic: "16:15", bitis: "17:45", link: "" },
      { id: "pe2", dersAdi: "Nesne Tabanli Programlama-II", ogretimGorevlisi: "Ogr.Gor. A.C.CAKIL", baslangic: "19:15", bitis: "20:45", link: "" }
    ]},
    { gun: 5, gunAdi: "Cuma", dersler: [] },
    { gun: 6, gunAdi: "Cumartesi", dersler: [] },
    { gun: 0, gunAdi: "Pazar", dersler: [] }
  ];
}

const el = {
  geriSayim: document.getElementById('countdown'),
  geriSayimEtiketi: document.getElementById('countdownLabel'),
  ilerlemeHalkasi: document.getElementById('progressRing'),
  dersDurumu: document.getElementById('classStatus'),
  dersAdi: document.getElementById('className'),
  hocaAdi: document.getElementById('instructorName'),
  dersSaati: document.getElementById('classTime'),
  gunAdi: document.getElementById('dayName'),
  programListesi: document.getElementById('scheduleList'),
  katilButonu: document.getElementById('joinBtn'),
  girisToggle: document.getElementById('loginToggle'),
  girisFormu: document.getElementById('loginForm'),
  girisOku: document.getElementById('loginArrow'),
  kimlikRozeti: document.getElementById('credentialsSavedBadge'),
  ogrenciNo: document.getElementById('studentId'),
  sifre: document.getElementById('password'),
  kimlikKaydet: document.getElementById('saveCredentials'),
  kayitDurumu: document.getElementById('saveStatus'),
  ayarlarBtn: document.getElementById('settingsBtn'),
  debugBtn: document.getElementById('debugBtn'),
  debsisBtn: document.getElementById('debsisLoginBtn'),
  sifreToggle: document.getElementById('togglePassword')
};


function zamanParcala(zamanStr) {
  const [saat, dakika] = zamanStr.split(':').map(Number);
  return { saat, dakika, dakikaTopla: saat * 60 + dakika, saniyeTopla: saat * 3600 + dakika * 60 };
}

function bugunDersleriGetir() {
  const bugun = new Date().getDay();
  const gunProgrami = dersProgram.find(d => d.gun === bugun);
  return gunProgrami?.dersler || [];
}

function heroGuncelle(durum, dersAdi, hoca, saat, aktifMi, linkVar, butonGoster = false) {
  el.dersDurumu.textContent = durum;
  el.dersDurumu.classList.toggle('active', aktifMi);
  el.dersAdi.textContent = dersAdi;
  el.hocaAdi.textContent = hoca;
  el.dersSaati.textContent = saat;
  el.katilButonu.disabled = !linkVar;
  el.katilButonu.style.display = butonGoster ? '' : 'none';
}


async function programYukle() {
  const sonuc = await chrome.storage.local.get(['schedule', 'settings']);
  dersProgram = sonuc.schedule || varsayilanProgramGetir();
  hatirlatmaDakika = sonuc.settings?.hatirlatmaDakika ?? 10;
  programGuncelle();
  geriSayimBaslat();
}

function programGuncelle() {
  const bugunDersler = bugunDersleriGetir();
  el.gunAdi.textContent = GUN_ADLARI[new Date().getDay()];

  if (bugunDersler.length === 0) {
    el.programListesi.innerHTML = '<div class="no-class">Bugun ders yok</div>';
    heroGuncelle('Tatil', 'Ders Yok', '-', 'Iyi tatiller!', false, false);
    return;
  }

  const mevcutZaman = new Date();
  const mevcutDakika = mevcutZaman.getHours() * 60 + mevcutZaman.getMinutes();

  el.programListesi.innerHTML = bugunDersler.map(ders => {
    const baslangic = zamanParcala(ders.baslangic);
    const bitis = zamanParcala(ders.bitis);

    let durum = '';
    if (mevcutDakika >= bitis.dakikaTopla) durum = 'completed';
    else if (mevcutDakika >= baslangic.dakikaTopla) durum = 'active';
    else if (baslangic.dakikaTopla - mevcutDakika <= hatirlatmaDakika) durum = 'upcoming';

    return `
      <div class="schedule-item ${durum}">
        <div class="schedule-dot"></div>
        <div class="schedule-time">${ders.baslangic}</div>
        <div class="schedule-info">
          <div class="schedule-name">${ders.dersAdi}</div>
          <div class="schedule-instructor">${ders.ogretimGorevlisi}</div>
        </div>
      </div>
    `;
  }).join('');

  siradakiDersBul(bugunDersler, mevcutDakika);
}

function siradakiDersBul(dersler, mevcutDakika) {
  for (const ders of dersler) {
    const baslangic = zamanParcala(ders.baslangic);
    const bitis = zamanParcala(ders.bitis);

    if (mevcutDakika < baslangic.dakikaTopla) {
      siradakiDers = ders;
      const kalanDakika = baslangic.dakikaTopla - mevcutDakika;
      const butonGoster = kalanDakika <= KATIL_BUTON_ESIK_DAKIKA;
      heroGuncelle('Siradaki', ders.dersAdi, ders.ogretimGorevlisi, `${ders.baslangic} - ${ders.bitis}`, false, ders.link, butonGoster);
      return;
    }

    if (mevcutDakika >= baslangic.dakikaTopla && mevcutDakika < bitis.dakikaTopla) {
      siradakiDers = ders;
      heroGuncelle('Su an', ders.dersAdi, ders.ogretimGorevlisi, `${ders.bitis}'e kadar`, true, ders.link, true);
      return;
    }
  }

  siradakiDers = null;
  heroGuncelle('Bitti', 'Bugun icin bitti', '-', 'Yarini bekleyin', false, false, false);
}


function geriSayimBaslat() {
  geriSayimGuncelle();
  geriSayimInterval = setInterval(() => {
    programGuncelle();
    geriSayimGuncelle();
  }, 1000);
}

function geriSayimGuncelle() {
  const bugunDersler = bugunDersleriGetir();
  if (bugunDersler.length === 0) {
    el.geriSayim.textContent = '--:--';
    ilerlemeAyarla(0);
    return;
  }

  const simdi = new Date();
  const mevcutSaniye = simdi.getHours() * 3600 + simdi.getMinutes() * 60 + simdi.getSeconds();

  for (const ders of bugunDersler) {
    const baslangic = zamanParcala(ders.baslangic);
    const bitis = zamanParcala(ders.bitis);

    if (mevcutSaniye < baslangic.saniyeTopla) {
      const fark = baslangic.saniyeTopla - mevcutSaniye;
      const saat = Math.floor(fark / 3600);
      const dakika = Math.floor((fark % 3600) / 60);
      const saniye = fark % 60;

      if (fark <= hatirlatmaDakika * 60) {
        el.geriSayim.textContent = `${dakika}:${saniye.toString().padStart(2, '0')}`;
      } else {
        el.geriSayim.textContent = saat > 0 ? `${saat}sa ${dakika}dk` : `${dakika}dk`;
      }

      el.geriSayimEtiketi.textContent = 'kaldi';
      const maxSaniye = GERI_SAYIM_MAX_DAKIKA * 60;
      ilerlemeAyarla(Math.max(0, 1 - (fark / maxSaniye)));
      return;
    }

    if (mevcutSaniye < bitis.saniyeTopla) {
      const kalan = bitis.saniyeTopla - mevcutSaniye;
      const toplam = bitis.saniyeTopla - baslangic.saniyeTopla;
      const dakika = Math.floor(kalan / 60);
      const saniye = kalan % 60;

      el.geriSayim.textContent = `${dakika}:${saniye.toString().padStart(2, '0')}`;
      el.geriSayimEtiketi.textContent = 'bitmesine';
      ilerlemeAyarla((toplam - kalan) / toplam);
      return;
    }
  }

  el.geriSayim.textContent = '--:--';
  ilerlemeAyarla(0);
}

function ilerlemeAyarla(ilerleme) {
  const cevre = 2 * Math.PI * ILERLEME_HALKASI_YARICAP;
  el.ilerlemeHalkasi.style.strokeDashoffset = cevre * (1 - ilerleme);
}


function derseKatil() {
  chrome.storage.local.get(['githubTakipEdildi'], (sonuc) => {
    if (sonuc.githubTakipEdildi !== true) {
      takipOverlayGoster();
      return;
    }

    if (!siradakiDers?.link) return;

    const hedefUrl = siradakiDers.link;
    chrome.storage.local.set({ dtsYonlendirme: hedefUrl }, () => {
      const yonlendirmeUrl = encodeURIComponent(hedefUrl);
      const girisUrl = `${DEBSIS_GIRIS_URL}&dts_redirect=${yonlendirmeUrl}`;
      chrome.tabs.create({ url: girisUrl });
    });
  });
}

function takipOverlayGoster() {
  if (document.getElementById('takip-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'takip-overlay';
  overlay.innerHTML = `
    <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.95); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center;">
      <div style="font-size:50px; margin-bottom:15px;">🤓</div>
      <h2 style="color:white; margin:0 0 10px; font-size:18px;">Beni Takip Et</h2>
      <p style="color:#aaa; font-size:13px; margin:0 0 20px; max-width:280px;">Bu eklentiyi kullanmaya devam etmek icin lutfen GitHub'da beni takip edin.</p>
      <button id="takipBtn" style="background:#238636; color:white; border:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        GitHub'da Takip Et
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('takipBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: GITHUB_PROFIL_URL });
  });
}


function kimlikBilgileriniKaydet() {
  const ogrenciNo = el.ogrenciNo.value.trim();
  const sifre = el.sifre.value;

  if (!ogrenciNo || !sifre) {
    el.kayitDurumu.textContent = 'Eksik bilgi';
    el.kayitDurumu.style.color = '#ef4444';
    return;
  }

  chrome.storage.local.set({
    credentials: { studentId: ogrenciNo, password: sifre }
  }, () => {
    el.kayitDurumu.textContent = 'Kaydedildi';
    el.kayitDurumu.style.color = '#3fb950';
    el.kimlikRozeti.style.display = 'inline-flex';
    setTimeout(() => el.kayitDurumu.textContent = '', KAYIT_DURUMU_TEMIZLE_MS);
  });
}

function kimlikBilgileriniYukle() {
  chrome.storage.local.get(['credentials'], (sonuc) => {
    const kimlik = sonuc.credentials;
    if (kimlik?.studentId) {
      el.ogrenciNo.value = kimlik.studentId;
      el.sifre.value = kimlik.password || '';
      el.kimlikRozeti.style.display = 'inline-flex';
    } else {
      el.kimlikRozeti.style.display = 'none';
    }
  });
}


function olayDinleyicileriniKur() {
  el.girisToggle.addEventListener('click', () => {
    el.girisFormu.classList.toggle('open');
    el.girisOku.classList.toggle('open');
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  });

  el.kimlikKaydet.addEventListener('click', kimlikBilgileriniKaydet);
  el.katilButonu.addEventListener('click', derseKatil);
  el.ayarlarBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  el.debugBtn.addEventListener('click', () => chrome.tabs.create({ url: '../debug/debug.html' }));

  if (el.debsisBtn) {
    el.debsisBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: DEBSIS_GIRIS_URL });
    });
  }

  if (el.sifreToggle && el.sifre) {
    el.sifreToggle.addEventListener('click', () => {
      const gizliMi = el.sifre.type === 'password';
      el.sifre.type = gizliMi ? 'text' : 'password';

      el.sifreToggle.querySelector('.eye-off').style.display = gizliMi ? 'none' : 'block';
      el.sifreToggle.querySelector('.eye-on').style.display = gizliMi ? 'block' : 'none';
    });
  }
}


document.addEventListener('DOMContentLoaded', () => {
  programYukle();
  kimlikBilgileriniYukle();
  olayDinleyicileriniKur();
});
