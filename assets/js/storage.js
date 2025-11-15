const CART_KEY = 'accessoriesShopCart';

const getCart = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.warn('Unable to parse cart from storage', error);
    return [];
  }
};

const saveCart = (cartItems) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
};

const addToCart = (productId) => {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  saveCart(cart);
  return cart;
};

const updateQuantity = (productId, quantity) => {
  let cart = getCart();

  cart = cart
    .map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(quantity, 0) } : item,
    )
    .filter((item) => item.quantity > 0);

  saveCart(cart);
  return cart;
};

const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.productId !== productId);
  saveCart(cart);
  return cart;
};

const clearCart = () => {
  saveCart([]);
};

const storageApi = {
  CART_KEY,
  getCart,
  saveCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};

(function attachStorage(globalScope) {
  if (!globalScope) return;
  globalScope.AtelierStorage = storageApi;
})(typeof window !== 'undefined' ? window : globalThis);
