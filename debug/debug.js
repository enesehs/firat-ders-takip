document.addEventListener('DOMContentLoaded', () => {
  sekmeleriKur();
  aktiviteKayitlariniYukle();
  depolamayiYukle();
  sistemBilgileriniYukle();
  olayDinleyicileriniKur();
});

function tarayiciBilgisiAl() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Bilinmiyor';
}

function sekmeleriKur() {
  const sekmeler = document.querySelectorAll('#tabActivity, #tabErrors, #tabStorage, #tabSystem');
  const paneller = ['activity', 'errors', 'storage', 'system'];
  
  sekmeler.forEach((sekme, indeks) => {
    sekme.addEventListener('click', () => {
      paneller.forEach(panel => {
        document.getElementById(panel).style.display = 'none';
      });
      document.getElementById(paneller[indeks]).style.display = 'block';
    });
  });
}

function olayDinleyicileriniKur() {
  document.getElementById('refreshLogs').addEventListener('click', aktiviteKayitlariniYukle);
  document.getElementById('clearLogs').addEventListener('click', kayitlariTemizle);
  document.getElementById('refreshStorage').addEventListener('click', depolamayiYukle);
  document.getElementById('testNotification').addEventListener('click', testBildirimiGonder);
}

function testBildirimiGonder() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/DTS_128.png',
    title: 'Test Bildirimi',
    message: 'Bildirim sistemi calisiyor!',
    priority: 2
  }, (bildirimId) => {
    if (chrome.runtime.lastError) {
      alert('Hata: ' + chrome.runtime.lastError.message);
    } else {
      alert('Bildirim gonderildi! ID: ' + bildirimId);
    }
  });
}

function aktiviteKayitlariniYukle() {
  chrome.storage.local.get(['logs'], (sonuc) => {
    const kayitlar = sonuc.logs || [];
    const kapsayici = document.getElementById('activityLogs');
    const hataKapsayici = document.getElementById('errorLogs');

    if (kayitlar.length === 0) {
      kapsayici.innerHTML = 'Henuz kayit yok';
      hataKapsayici.innerHTML = 'Hata yok';
      return;
    }

    kapsayici.innerHTML = kayitlar.map(kayit => `
      <div>
        <span>${zamanFormatla(kayit.timestamp)}</span> - 
        <span>[${kayit.type}]</span> 
        <span>${kayit.message}</span>
      </div>
    `).join('');

    const hatalar = kayitlar.filter(k => k.type === 'error');
    hataKapsayici.innerHTML = hatalar.length > 0
      ? hatalar.map(kayit => `
          <div>
            <span>${zamanFormatla(kayit.timestamp)}</span> - 
            <span>[ERROR]</span> 
            <span>${kayit.message}</span>
          </div>
        `).join('')
      : 'Hata yok';
  });
}

function kayitlariTemizle() {
  chrome.storage.local.set({ logs: [] }, () => {
    aktiviteKayitlariniYukle();
  });
}

function depolamayiYukle() {
  chrome.storage.local.get(null, (veri) => {
    const guvenliVeri = { ...veri };
    if (guvenliVeri.credentials) {
      guvenliVeri.credentials = {
        ...guvenliVeri.credentials,
        password: '********'
      };
    }
    document.getElementById('storageContent').textContent = JSON.stringify(guvenliVeri, null, 2);
  });
}

function sistemBilgileriniYukle() {
  const manifest = chrome.runtime.getManifest();
  document.getElementById('extVersion').textContent = manifest.version;
  document.getElementById('manifestVersion').textContent = 'v' + manifest.manifest_version;

  chrome.storage.local.get(['credentials', 'schedule', 'githubTakipEdildi'], (sonuc) => {
    const kimlikDurum = document.getElementById('credStatus');
    if (sonuc.credentials && sonuc.credentials.studentId) {
      kimlikDurum.textContent = 'Ayarli';
    } else {
      kimlikDurum.textContent = 'Eksik';
    }

    const programDurum = document.getElementById('scheduleStatus');
    programDurum.textContent = 'Yuklu';

    const githubDurum = document.getElementById('githubTakipStatus');
    githubDurum.textContent = sonuc.githubTakipEdildi ? 'Evet' : 'Hayir';
  });

  document.getElementById('browserInfo').textContent = tarayiciBilgisiAl();
  document.getElementById('platformInfo').textContent = navigator.platform || 'Bilinmiyor';
  document.getElementById('langInfo').textContent = navigator.language || 'Bilinmiyor';
  document.getElementById('screenInfo').textContent = `${screen.width}x${screen.height} (${screen.colorDepth}bit)`;
  document.getElementById('userAgentInfo').textContent = navigator.userAgent;
  document.getElementById('onlineInfo').textContent = navigator.onLine ? 'Evet' : 'Hayir';
  document.getElementById('timezoneInfo').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;

  document.getElementById('toggleGithubTakip').addEventListener('click', (e) => {
    if (!e.shiftKey) {
      alert('iyi deneme ama işe yaramadı... takip etsen iyi olurdu :(');
      return;
    }
    
    chrome.storage.local.get(['githubTakipEdildi'], (sonuc) => {
      const yeniDeger = !sonuc.githubTakipEdildi;
      chrome.storage.local.set({ githubTakipEdildi: yeniDeger }, () => {
        document.getElementById('githubTakipStatus').textContent = yeniDeger ? 'Evet' : 'Hayir';
      });
    });
  });
}

function zamanFormatla(zamanDamgasi) {
  const tarih = new Date(zamanDamgasi);
  return tarih.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
