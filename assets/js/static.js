(function initStaticPage(globalScope) {
  if (
    globalScope &&
    globalScope.AtelierSite &&
    typeof globalScope.AtelierSite.initSiteChrome === 'function'
  ) {
    globalScope.AtelierSite.initSiteChrome();
  }
})(typeof window !== 'undefined' ? window : this);
