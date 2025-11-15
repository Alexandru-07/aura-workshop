const getStorage = () =>
  typeof window !== 'undefined' && window.AtelierStorage ? window.AtelierStorage : null;

const getCartSnapshot = () => {
  const storage = getStorage();
  if (storage && typeof storage.getCart === 'function') {
    return storage.getCart();
  }
  return [];
};

const updateCartCount = (cartData) => {
  const cart = Array.isArray(cartData) ? cartData : getCartSnapshot();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const targets = document.querySelectorAll('[data-cart-count]');

  for (let i = 0; i < targets.length; i += 1) {
    const node = targets[i];
    node.textContent = total;
    if (total > 0) {
      node.setAttribute('data-has-items', 'true');
    } else {
      node.removeAttribute('data-has-items');
    }
  }

  return total;
};

const initYearStamp = () => {
  const nodes = document.querySelectorAll('[data-year]');
  const year = new Date().getFullYear();
  for (let i = 0; i < nodes.length; i += 1) {
    nodes[i].textContent = year;
  }
};

const initScrollLinks = () => {
  const triggers = document.querySelectorAll('[data-scroll-target]');
  for (let i = 0; i < triggers.length; i += 1) {
    const trigger = triggers[i];
    const selector = trigger.getAttribute('data-scroll-target');
    if (!selector) continue;

    trigger.addEventListener('click', () => {
      const target = document.querySelector(selector);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
};

const initSiteChrome = () => {
  initYearStamp();
  initScrollLinks();
  updateCartCount();
};

(function attachSite(globalScope) {
  if (!globalScope) return;
  globalScope.AtelierSite = {
    initSiteChrome,
    updateCartCount,
  };
})(typeof window !== 'undefined' ? window : globalThis);
