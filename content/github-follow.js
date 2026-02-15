
const PROFIL_URL = 'github.com/enesehs';
const REPO_URL = 'github.com/enesehs/firat-ders-takip';

let alertGosterildi = false;
let dinleyiciEklendi = false;
let starDinleyiciEklendi = false;
let toastGosterildi = false;
let baslangicTakipDurumu = false;
let baslangicStarDurumu = false;

function toastGoster(mesaj) {
  if (document.getElementById('dts-toast')) return;

  const toast = document.createElement('div');
  toast.id = 'dts-toast';
  toast.textContent = mesaj;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: #1a1a2e;
    color: #e0e0e0;
    padding: 18px 28px;
    border-radius: 10px;
    font-size: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-weight: 500;
    box-shadow: 0 6px 32px rgba(0,0,0,0.5);
    border-left: 4px solid #238636;
    z-index: 99999;
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function gorunurBul(selector) {
  const hepsi = document.querySelectorAll(selector);
  for (const el of hepsi) {
    if (el.offsetParent !== null) return el;
  }
  return null;
}

function butonVurgula(buton) {
  if (buton.classList.contains('dts-parlayan-buton')) return;

  if (!document.getElementById('dts-parlama-stil')) {
    const stil = document.createElement('style');
    stil.id = 'dts-parlama-stil';
    stil.textContent = `
      @keyframes dtsParlama {
        0%, 100% {
          box-shadow: 0 0 5px #238636, 0 0 10px #238636, 0 0 20px #238636;
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 15px #238636, 0 0 30px #238636, 0 0 60px #238636;
          transform: scale(1.01);
        }
      }
      .dts-parlayan-buton {
        animation: dtsParlama 1s ease-in-out infinite !important;
        border: 2px solid #238636 !important;
        position: relative !important;
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(stil);
  }
  buton.classList.add('dts-parlayan-buton');
}


function takipKontrol() {
  const loginButonu = gorunurBul('a.btn.btn-block[href*="login"]');
  const unfollowButonu = gorunurBul('input.btn.btn-block[value="Unfollow"]');
  const followButonu = gorunurBul('input.btn.btn-block[value="Follow"]');

  if (loginButonu) {
    chrome.storage.local.set({ githubTakipEdildi: false });
    butonVurgula(loginButonu);
    if (!alertGosterildi) {
      alertGosterildi = true;
      alert('GitHub hesabina giris yapip beni takip etmelisin!');
    }
    return;
  }

  if (unfollowButonu) {
    chrome.storage.local.set({ githubTakipEdildi: true });
    if (!baslangicTakipDurumu && !toastGosterildi) {
      toastGosterildi = true;
      toastGoster('takip için teşekkürler, son bir adım kaldı');
      baslangicTakipDurumu = true;
      setTimeout(() => {
        window.location.href = 'https://' + REPO_URL;
      }, 2000);
    }
    return;
  }

  if (followButonu) {
    if (baslangicTakipDurumu) {
        baslangicTakipDurumu = false;
    }
    chrome.storage.local.set({ githubTakipEdildi: false });
    butonVurgula(followButonu);

    if (!dinleyiciEklendi) {
      dinleyiciEklendi = true;
      followButonu.addEventListener('click', function () {
        const bekleyici = setInterval(() => {
          const yeniUnfollow = gorunurBul('input.btn.btn-block[value="Unfollow"]');
          if (yeniUnfollow) {
            clearInterval(bekleyici);
            chrome.storage.local.set({ githubTakipEdildi: true });
            toastGoster('takip için teşekkürler, son bir adım kaldı');
            baslangicTakipDurumu = true;
            setTimeout(() => {
              window.location.href = 'https://' + REPO_URL;
            }, 2000);
          }
        }, 300);
        setTimeout(() => clearInterval(bekleyici), 15000);
      }, { once: true });
    }
    return;
  }
}

function starKontrol() {
  const starButonlari = Array.from(document.querySelectorAll('.starred button, .unstarred button, button.js-social-reaction-trigger-button, button.js-toggler-target'));
  
  let starButonu = null;
  let unstarButonu = null;

  const tumButonlar = document.querySelectorAll('button');
  for (const btn of tumButonlar) {
    const text = btn.textContent.trim().toLowerCase();
    const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
    
    if ((text === 'star' || aria.includes('star this repository')) && !text.includes('unstar')) {
      if (btn.offsetParent !== null) starButonu = btn;
    }
    
    if (text === 'unstar' || aria.includes('unstar this repository')) {
        if (btn.offsetParent !== null) unstarButonu = btn;
    }
  }

  if (unstarButonu) {
    chrome.storage.local.set({ githubStarEdildi: true });
    if (!baslangicStarDurumu && !toastGosterildi) {
        toastGosterildi = true;
        toastGoster('yıldızladığın için teşekkürler, kullanmaya başlayabilirsin...');
        baslangicStarDurumu = true;
    }
    return;
  }

  if (starButonu) {
      if (baslangicStarDurumu) baslangicStarDurumu = false;
      chrome.storage.local.set({ githubStarEdildi: false });
      butonVurgula(starButonu);

      if (!starDinleyiciEklendi) {
          starDinleyiciEklendi = true;
          starButonu.addEventListener('click', function() {
              const bekleyici = setInterval(() => {
                  let yeniUnstar = false;
                  const btns = document.querySelectorAll('button');
                  for(const b of btns) {
                      const t = b.textContent.trim().toLowerCase();
                      const a = (b.getAttribute('aria-label') || '').toLowerCase();
                      if ((t === 'unstar' || a.includes('unstar this repository')) && b.offsetParent !== null) {
                          yeniUnstar = true;
                          break;
                      }
                  }

                  if (yeniUnstar) {
                      clearInterval(bekleyici);
                      chrome.storage.local.set({ githubStarEdildi: true });
                      toastGoster('yıldızladığın için teşekkürler, kralsın');
                      baslangicStarDurumu = true;
                  }
              }, 300);
              setTimeout(() => clearInterval(bekleyici), 15000);
          }, { once: true });
      }
  }
}



async function baslat() {
  const url = window.location.href;
  
  const data = await chrome.storage.local.get(['githubTakipEdildi', 'githubStarEdildi']);
  baslangicTakipDurumu = data.githubTakipEdildi === true;
  baslangicStarDurumu = data.githubStarEdildi === true;

  if (url.includes(REPO_URL)) {
    starKontrol();
    const gozlemci = new MutationObserver(() => starKontrol());
    gozlemci.observe(document.body, { childList: true, subtree: true });
  } else if (url.includes(PROFIL_URL)) {
    takipKontrol();
    const gozlemci = new MutationObserver(() => takipKontrol());
    gozlemci.observe(document.body, { childList: true, subtree: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', baslat);
} else {
  baslat();
}
