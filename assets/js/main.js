(function initCatalog(globalScope) {
  if (!globalScope) return;

  const products =
    globalScope.AtelierData && Array.isArray(globalScope.AtelierData.products)
      ? globalScope.AtelierData.products
      : [];
  const storage = globalScope.AtelierStorage;
  const site = globalScope.AtelierSite;

  if (site && typeof site.initSiteChrome === 'function') {
    site.initSiteChrome();
  }

  const productGrid = document.querySelector('[data-product-grid]');
  if (!productGrid || !products.length) {
    return;
  }

  const filterGroup = document.querySelector('[data-filter-group]');
  const searchInput = document.querySelector('[data-search-input]');
  const toast = document.querySelector('[data-toast]');

  const state = {
    activeCategory: 'All',
    searchTerm: '',
  };

  const uniqueCategories = ['All'];
  for (let i = 0; i < products.length; i += 1) {
    const product = products[i];
    if (uniqueCategories.indexOf(product.category) === -1) {
      uniqueCategories.push(product.category);
    }
  }

  const createProductCard = (product) => {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.innerHTML = [
      `<img src="${product.image}" alt="${product.title}" loading="lazy" />`,
      `<div class="product-meta"><span>${product.category}</span><span>$${product.price.toFixed(
        2,
      )}</span></div>`,
      `<h3>${product.title}</h3>`,
      `<p>${product.description}</p>`,
      '<div class="card-actions">',
      `<button class="btn btn-primary" data-add-to-cart="${product.id}">Add to cart</button>`,
      `<span class="price-tag">$${product.price.toFixed(2)}</span>`,
      '</div>',
    ].join('');
    return article;
  };

  const renderProducts = (list) => {
    productGrid.innerHTML = '';

    if (!list.length) {
      const emptyCard = document.createElement('article');
      emptyCard.className = 'card';
      emptyCard.innerHTML =
        '<h3>No matches yet</h3><p>Try a different keyword or category to find more handmade goods.</p>';
      productGrid.appendChild(emptyCard);
      return;
    }

    for (let i = 0; i < list.length; i += 1) {
      productGrid.appendChild(createProductCard(list[i]));
    }
  };

  const filterProducts = () => {
    const term = state.searchTerm.toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory =
        state.activeCategory === 'All' || product.category === state.activeCategory;
      const matchesSearch =
        !term ||
        product.title.toLowerCase().indexOf(term) !== -1 ||
        product.description.toLowerCase().indexOf(term) !== -1;
      return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
  };

  const renderFilters = () => {
    if (!filterGroup) return;
    filterGroup.innerHTML = '';
    for (let i = 0; i < uniqueCategories.length; i += 1) {
      const category = uniqueCategories[i];
      const button = document.createElement('button');
      button.className = `pill ${category === state.activeCategory ? 'is-active' : ''}`;
      button.type = 'button';
      button.textContent = category;
      button.setAttribute('data-filter', category);
      filterGroup.appendChild(button);
    }
  };

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 1600);
  };

  const handleAddToCart = (productId) => {
    if (!storage || typeof storage.addToCart !== 'function') {
      return;
    }
    storage.addToCart(productId);
    if (site && typeof site.updateCartCount === 'function') {
      site.updateCartCount();
    }
    const product = products.find((item) => item.id === productId);
    const productName = product ? product.title : 'Product';
    showToast(`${productName} added to MyCart`);
  };

  if (filterGroup) {
    filterGroup.addEventListener('click', (event) => {
      const target = event.target.closest('[data-filter]');
      if (!target) return;
      state.activeCategory = target.getAttribute('data-filter');
      renderFilters();
      filterProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.searchTerm = event.target.value.trim();
      filterProducts();
    });
  }

  productGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-to-cart]');
    if (!button) return;
    const productId = button.getAttribute('data-add-to-cart');
    handleAddToCart(productId);
  });

  renderFilters();
  renderProducts(products);
  if (site && typeof site.updateCartCount === 'function') {
    site.updateCartCount(storage && typeof storage.getCart === 'function' ? storage.getCart() : []);
  }
})(typeof window !== 'undefined' ? window : this);
