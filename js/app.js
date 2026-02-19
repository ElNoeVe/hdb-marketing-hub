// ===================================
// app.js — Shared functionality
// ===================================

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      // Animate hamburger
      toggle.classList.toggle('active');
    });
  }
});

// Copy to clipboard
function copyText(btn) {
  const block = btn.closest('.copy-block');
  const pre = block.querySelector('pre');
  const text = pre.textContent;
  
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✅ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 Copiar';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    btn.textContent = '✅ Copiado';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 Copiar';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format number with commas
function formatNumber(num) {
  return new Intl.NumberFormat('es-MX').format(num);
}

// Tab switching utility
function setupTabs(tabContainerSelector, callback) {
  const container = document.querySelector(tabContainerSelector);
  if (!container) return;
  
  const tabs = container.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (callback) callback(tab.dataset.filter || tab.dataset.type);
    });
  });
}
