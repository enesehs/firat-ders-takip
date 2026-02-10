const VARSAYILAN_HATIRLATMA_DAKIKA = 10;
const MAKSIMUM_KAYIT = 20;

chrome.runtime.onInstalled.addListener(() => {
  kayitEkle('info', 'Eklenti yuklendi');

  chrome.storage.local.get(['settings', 'schedule'], (sonuc) => {
    const guncellemeler = {};

    if (!sonuc.settings) {
      guncellemeler.settings = {
        hatirlatmaDakika: VARSAYILAN_HATIRLATMA_DAKIKA,
        otomatikGiris: true,
        dersSizBildirim: true
      };
    }

    if (!sonuc.schedule) {
      guncellemeler.schedule = varsayilanDersProgramiGetir();
    }

    if (Object.keys(guncellemeler).length > 0) {
      chrome.storage.local.set(guncellemeler);
    }

    dersAlarmlariniPlanla();
  });

  chrome.alarms.create('dersKontrol', { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(() => {
  kayitEkle('info', 'Tarayici basladi');
  dersAlarmlariniPlanla();
});

function dersAlarmlariniPlanla() {
  chrome.storage.local.get(['schedule', 'settings'], (sonuc) => {
    const dersProgram = sonuc.schedule || [];
    const ayarlar = sonuc.settings || {};
    const hatirlatmaDakika = ayarlar.hatirlatmaDakika || VARSAYILAN_HATIRLATMA_DAKIKA;

    const simdi = new Date();
    const bugun = simdi.getDay();
    const mevcutDakika = simdi.getHours() * 60 + simdi.getMinutes();

    const bugunProgram = dersProgram.find(d => d.gun === bugun);
    if (!bugunProgram?.dersler?.length) return;

    chrome.alarms.getAll((mevcutAlarmlar) => {
      const aktifAlarmlar = new Set(mevcutAlarmlar.map(a => a.name));

      bugunProgram.dersler.forEach(ders => {
        const [saat, dakika] = ders.baslangic.split(':').map(Number);
        const dersDakika = saat * 60 + dakika;
        const alarmDakika = dersDakika - hatirlatmaDakika;
        const alarmAdi = `ders_${ders.id}`;

        if (alarmDakika > mevcutDakika && !aktifAlarmlar.has(alarmAdi)) {
          const gecikmeMs = (alarmDakika - mevcutDakika) * 60 * 1000;
          chrome.alarms.create(alarmAdi, { when: Date.now() + gecikmeMs });
          kayitEkle('info', `Alarm kuruldu: ${ders.dersAdi}`);
        }
      });
    });
  });
}

function varsayilanDersProgramiGetir() {
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

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dersKontrol') {
    dersAlarmlariniPlanla();
    return;
  }

  if (alarm.name.startsWith('ders_')) {
    chrome.storage.local.get(['schedule'], (sonuc) => {
      const program = sonuc.schedule || [];
      const bugun = new Date().getDay();
      const bugunProgram = program.find(d => d.gun === bugun);
      const dersId = alarm.name.replace('ders_', '');
      const ders = bugunProgram?.dersler?.find(d => d.id === dersId);
      const dersAdi = ders ? ders.dersAdi : dersId;
      bildirimGoster('Ders Hatirlatmasi', `${dersAdi} dersi baslamak uzere!`);
    });
  }
});

function bildirimGoster(baslik, mesaj) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/DTS_128.png',
    title: baslik,
    message: mesaj,
    priority: 2
  }, (id) => {
    if (chrome.runtime.lastError) {
      kayitEkle('error', 'Bildirim gonderilemedi: ' + chrome.runtime.lastError.message);
      return;
    }
    kayitEkle('info', 'Bildirim gonderildi: ' + mesaj);
  });
}

function kayitEkle(tur, mesaj, veri = {}) {
  const kayitGirisi = {
    timestamp: new Date().toISOString(),
    type: tur,
    message: mesaj,
    data: veri
  };

  chrome.storage.local.get(['logs'], (sonuc) => {
    const kayitlar = sonuc.logs || [];
    kayitlar.unshift(kayitGirisi);

    if (kayitlar.length > MAKSIMUM_KAYIT) {
      kayitlar.length = MAKSIMUM_KAYIT;
    }

    chrome.storage.local.set({ logs: kayitlar });
  });
}
