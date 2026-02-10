
const PROFIL_URL = 'github.com/enesehs';
const REPO_URL = 'github.com/enesehs/firat-ders-takip';

let alertGosterildi = false;
let dinleyiciEklendi = false;
let toastGosterildi = false;

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
    if (!toastGosterildi) {
      toastGosterildi = true;
      toastGoster('takip için teşekkürler, şimdi kullanabilirsin');
    }
    return;
  }

  if (followButonu) {
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
            toastGoster('takip için teşekkürler, şimdi kullanabilirsin');
          }
        }, 300);
        setTimeout(() => clearInterval(bekleyici), 15000);
      }, { once: true });
    }
    return;
  }
}



function baslat() {
  const url = window.location.href;

  if (url.includes(REPO_URL)) {
    chrome.storage.local.set({ githubStarEdildi: false });
    starKontrol();
    const gozlemci = new MutationObserver(() => starKontrol());
    gozlemci.observe(document.body, { childList: true, subtree: true });
  } else if (url.includes(PROFIL_URL)) {
    chrome.storage.local.set({ githubTakipEdildi: false });
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
