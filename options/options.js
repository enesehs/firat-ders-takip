const gunAdlari = ['Pazar', 'Pazartesi', 'Sali', 'Carsamba', 'Persembe', 'Cuma', 'Cumartesi'];

const varsayilanProgram = [
  { gun: 1, gunAdi: "Pazartesi", dersler: [
    { dersAdi: "Sunucu Isletim Sistemi", ogretimGorevlisi: "Ogr.Gor. Z.OBUZ", baslangic: "15:15", bitis: "16:45", link: "" },
    { dersAdi: "Bilgi Guvenligi Ve Siber Guvenlik", ogretimGorevlisi: "Doc. Dr. D.AVCI", baslangic: "19:15", bitis: "20:45", link: "" }
  ]},
  { gun: 2, gunAdi: "Sali", dersler: [
    { dersAdi: "Sistem Analiz ve Tasarimi", ogretimGorevlisi: "Ogr.Gor. Dr. M.P.BAYDOGAN", baslangic: "16:15", bitis: "17:45", link: "" },
    { dersAdi: "Mobil Programlama", ogretimGorevlisi: "Ogr.Gor. H.EKINCI", baslangic: "19:15", bitis: "20:45", link: "" }
  ]},
  { gun: 3, gunAdi: "Carsamba", dersler: [
    { dersAdi: "Mesleki Yabanci Dil-II", ogretimGorevlisi: "Doc. Dr. D.AVCI", baslangic: "17:15", bitis: "18:45", link: "" }
  ]},
  { gun: 4, gunAdi: "Persembe", dersler: [
    { dersAdi: "Acik Kaynak Isletim Sistemi", ogretimGorevlisi: "Dr. Ogr. Uyesi K.FIRILDAK", baslangic: "16:15", bitis: "17:45", link: "" },
    { dersAdi: "Nesne Tabanli Programlama-II", ogretimGorevlisi: "Ogr.Gor. A.C.CAKIL", baslangic: "19:15", bitis: "20:45", link: "" }
  ]},
  { gun: 5, gunAdi: "Cuma", dersler: [] },
  { gun: 6, gunAdi: "Cumartesi", dersler: [] },
  { gun: 0, gunAdi: "Pazar", dersler: [] }
];

document.addEventListener('DOMContentLoaded', () => {
  ayarlariYukle();
  programiYukle();
  olayDinleyicileriniKur();
});

function olayDinleyicileriniKur() {
  document.getElementById('saveBtn').addEventListener('click', ayarlariKaydet);
  document.getElementById('exportBtn').addEventListener('click', verileriDisaAktar);
  document.getElementById('addRow').addEventListener('click', programSatiriEkle);
  document.getElementById('fetchScheduleBtn').addEventListener('click', internettenProgramCek);
}

const DERS_PROGRAMI_URL = 'https://raw.githubusercontent.com/enesehs/firat-ders-takip/main/dersprogrami.json';

async function internettenProgramCek() {
  const buton = document.getElementById('fetchScheduleBtn');
  const orijinalIcerik = buton.innerHTML;
  buton.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Yükleniyor...';
  buton.disabled = true;

  try {
    const response = await fetch(DERS_PROGRAMI_URL);
    if (!response.ok) throw new Error('Fetch failed');
    
    const data = await response.json();
    const program = data.schedule || varsayilanProgram;
    
    chrome.storage.local.set({ schedule: program, scheduleLastUpdate: Date.now() }, () => {
      programiGoruntule(program);
      durumGoster('Ders programı internetten başarıyla çekildi!', '#44ff44');
    });
  } catch (error) {
    console.error('Ders programı çekilemedi:', error);
    durumGoster('Hata: Ders programı internetten çekilemedi!', '#ff4444');
  } finally {
    buton.innerHTML = orijinalIcerik;
    buton.disabled = false;
  }
}

function ayarlariYukle() {
  chrome.storage.local.get(['credentials', 'settings'], (sonuc) => {
    if (sonuc.credentials) {
      document.getElementById('studentId').value = sonuc.credentials.studentId || '';
      document.getElementById('password').value = sonuc.credentials.password || '';
    }
    if (sonuc.settings) {
      document.getElementById('reminderMinutes').value = sonuc.settings.hatirlatmaDakika || 10;
    }
  });
}

function programiYukle() {
  chrome.storage.local.get(['schedule'], (sonuc) => {
    const program = sonuc.schedule || varsayilanProgram;
    programiGoruntule(program);
  });
}

function programiGoruntule(program) {
  const tablo = document.getElementById('scheduleBody');
  tablo.innerHTML = '';

  program.forEach(gun => {
    gun.dersler.forEach(ders => {
      const satir = document.createElement('tr');
      satir.innerHTML = `
        <td>${gun.gunAdi}</td>
        <td><input type="text" value="${ders.baslangic}" style="width:60px"></td>
        <td><input type="text" value="${ders.dersAdi}"></td>
        <td><input type="text" value="${ders.ogretimGorevlisi}"></td>
        <td><input type="text" value="${ders.link || ''}" placeholder="Link"></td>
      `;
      tablo.appendChild(satir);
    });
  });
}

function programSatiriEkle() {
  const tablo = document.getElementById('scheduleBody');
  const satir = document.createElement('tr');
  satir.innerHTML = `
    <td>
      <select style="padding:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;border-radius:4px">
        ${gunAdlari.map((g, i) => `<option value="${i}">${g}</option>`).join('')}
      </select>
    </td>
    <td><input type="text" placeholder="09:00" style="width:60px"></td>
    <td><input type="text" placeholder="Ders Adi"></td>
    <td><input type="text" placeholder="Hoca"></td>
    <td><input type="text" placeholder="Link"></td>
  `;
  tablo.appendChild(satir);
}

function ayarlariKaydet() {
  const kimlikBilgileri = {
    studentId: document.getElementById('studentId').value,
    password: document.getElementById('password').value
  };

  const ayarlar = {
    hatirlatmaDakika: parseInt(document.getElementById('reminderMinutes').value) || 10,
    otomatikGiris: true,
    dersSizBildirim: true
  };

  const program = tablodanProgramTopla();

  chrome.storage.local.set({ credentials: kimlikBilgileri, settings: ayarlar, schedule: program }, () => {
    durumGoster('Tum ayarlar ve ders programi kaydedildi!');
  });
}

function tablodanProgramTopla() {
  const tablo = document.getElementById('scheduleBody');
  const satirlar = tablo.querySelectorAll('tr');
  
  const programHaritasi = {};
  gunAdlari.forEach((gunAdi, indeks) => {
    programHaritasi[indeks] = { gun: indeks, gunAdi: gunAdi, dersler: [] };
  });

  satirlar.forEach(satir => {
    const hucreler = satir.querySelectorAll('td');
    if (hucreler.length < 5) return;

    let gunIndeks;
    const secim = hucreler[0].querySelector('select');
    if (secim) {
      gunIndeks = parseInt(secim.value);
    } else {
      const gunMetni = hucreler[0].textContent.trim();
      gunIndeks = gunAdlari.indexOf(gunMetni);
      if (gunIndeks === -1) gunIndeks = 1;
    }

    const baslangic = hucreler[1].querySelector('input')?.value || '';
    const dersAdi = hucreler[2].querySelector('input')?.value || '';
    const ogretimGorevlisi = hucreler[3].querySelector('input')?.value || '';
    const link = hucreler[4].querySelector('input')?.value || '';

    if (dersAdi.trim()) {
      programHaritasi[gunIndeks].dersler.push({
        id: `ders_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dersAdi,
        ogretimGorevlisi,
        baslangic,
        bitis: bitisSaatiHesapla(baslangic),
        link
      });
    }
  });

  return Object.values(programHaritasi);
}

function bitisSaatiHesapla(baslangic) {
  if (!baslangic) return '';
  const [s, d] = baslangic.split(':').map(Number);
  const bitisSaat = s + 1;
  const bitisDakika = d + 30;
  if (bitisDakika >= 60) {
    return `${String(bitisSaat + 1).padStart(2, '0')}:${String(bitisDakika - 60).padStart(2, '0')}`;
  }
  return `${String(bitisSaat).padStart(2, '0')}:${String(bitisDakika).padStart(2, '0')}`;
}

function verileriDisaAktar() {
  chrome.storage.local.get(null, (veri) => {
    const blob = new Blob([JSON.stringify(veri, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'firat-ders-takip-yedek.json';
    link.click();
    URL.revokeObjectURL(url);
    durumGoster('Veriler disa aktarildi!');
  });
}

function durumGoster(mesaj, renk = '#ffffff') {
  const durumAlani = document.getElementById('status');
  durumAlani.textContent = mesaj;
  durumAlani.style.color = renk;
  setTimeout(() => {
    durumAlani.textContent = '';
    durumAlani.style.color = '';
  }, 3000);
}
