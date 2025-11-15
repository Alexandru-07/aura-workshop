(function initCartPage(globalScope) {
  if (!globalScope) return;

  const products =
    globalScope.AtelierData && Array.isArray(globalScope.AtelierData.products)
      ? globalScope.AtelierData.products
      : [];
  const storage = globalScope.AtelierStorage;
  const site = globalScope.AtelierSite;

  if (site && typeof site.initSiteChrome === "function") {
    site.initSiteChrome();
  }

  const cartList = document.querySelector("[data-cart-list]");
  if (!cartList || !storage) {
    return;
  }

  const emptyState = document.querySelector("[data-empty-state]");
  const summaryItems = document.querySelector("[data-summary-items]");
  const summarySubtotal = document.querySelector("[data-summary-subtotal]");
  const summaryShipping = document.querySelector("[data-summary-shipping]");
  const summaryTotal = document.querySelector("[data-summary-total]");
  const checkoutBtn = document.querySelector("[data-checkout-btn]");
  const clearBtn = document.querySelector("[data-clear-btn]");

  const productMap = {};
  for (let i = 0; i < products.length; i += 1) {
    productMap[products[i].id] = products[i];
  }

  const SHIPPING_FLAT = 9;

  const formatMoney = (value) => `$${value.toFixed(2)}`;

  const hydrateCart = () => {
    const currentCart =
      typeof storage.getCart === "function" ? storage.getCart() : [];
    const detailed = [];

    for (let i = 0; i < currentCart.length; i += 1) {
      const entry = currentCart[i];
      const product = productMap[entry.productId];
      if (product) {
        detailed.push({ ...entry, product });
      }
    }

    return detailed;
  };

  const renderCart = () => {
    const detailedCart = hydrateCart();
    cartList.innerHTML = "";

    if (!detailedCart.length) {
      if (emptyState) {
        emptyState.removeAttribute("hidden");
      }
      if (summaryItems) summaryItems.textContent = "0";
      if (summarySubtotal) summarySubtotal.textContent = formatMoney(0);
      if (summaryShipping) summaryShipping.textContent = formatMoney(0);
      if (summaryTotal) summaryTotal.textContent = formatMoney(0);
      if (site && typeof site.updateCartCount === "function") {
        site.updateCartCount([]);
      }
      return;
    }

    if (emptyState) {
      emptyState.setAttribute("hidden", "hidden");
    }

    for (let i = 0; i < detailedCart.length; i += 1) {
      const entry = detailedCart[i];
      const item = document.createElement("article");
      item.className = "cart-item";
      item.innerHTML = [
        `<img src="${entry.product.image}" alt="${entry.product.title}" loading="lazy" />`,
        '<div class="cart-info">',
        `<h3>${entry.product.title}</h3>`,
        `<p>${entry.product.category}</p>`,
        `<strong>${formatMoney(entry.product.price)}</strong>`,
        "</div>",
        '<div class="cart-controls">',
        `<button class="qty-btn" data-action="decrement" data-product-id="${entry.product.id}">−</button>`,
        `<input class="qty-input" type="number" min="1" value="${entry.quantity}" data-quantity-input data-product-id="${entry.product.id}" />`,
        `<button class="qty-btn" data-action="increment" data-product-id="${entry.product.id}">+</button>`,
        `<button class="btn btn-ghost" data-action="remove" data-product-id="${entry.product.id}">Remove</button>`,
        "</div>",
      ].join("");
      cartList.appendChild(item);
    }

    const subtotal = detailedCart.reduce(
      (sum, entry) => sum + entry.product.price * entry.quantity,
      0
    );
    const shipping = subtotal > 0 ? SHIPPING_FLAT : 0;
    const totalItems = detailedCart.reduce(
      (sum, entry) => sum + entry.quantity,
      0
    );

    if (summaryItems) summaryItems.textContent = `${totalItems}`;
    if (summarySubtotal) summarySubtotal.textContent = formatMoney(subtotal);
    if (summaryShipping) summaryShipping.textContent = formatMoney(shipping);
    if (summaryTotal)
      summaryTotal.textContent = formatMoney(subtotal + shipping);

    /* ---- */

    if (site && typeof site.updateCartCount === "function") {
      const simplifiedCart = detailedCart.map((entry) => ({
        productId: entry.product.id,
        quantity: entry.quantity,
      }));
      site.updateCartCount(simplifiedCart);
    }
  };

  cartList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.getAttribute("data-action");
    const productId = button.getAttribute("data-product-id");

    if (!productId) return;

    const currentEntry = storage
      .getCart()
      .find((item) => item.productId === productId);
    const currentQty = currentEntry ? currentEntry.quantity : 0;

    if (action === "increment") {
      storage.updateQuantity(productId, currentQty + 1);
    } else if (action === "decrement") {
      storage.updateQuantity(productId, currentQty - 1);
    } else if (action === "remove") {
      storage.removeFromCart(productId);
    }

    renderCart();
  });

  cartList.addEventListener("change", (event) => {
    const input = event.target.closest("[data-quantity-input]");
    if (!input) return;
    const productId = input.getAttribute("data-product-id");
    const quantity = Math.max(1, parseInt(input.value, 10) || 1);
    storage.updateQuantity(productId, quantity);
    renderCart();
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      alert("Checkout is a placeholder for now, but your cart is ready!");
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      storage.clearCart();
      renderCart();
    });
  }

  renderCart();
})(typeof window !== "undefined" ? window : this);
