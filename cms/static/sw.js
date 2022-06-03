<link rel="stylesheet" class="aplayer-secondary-style-marker" href="/cms/assets/css/APlayer.min.css"><script src="/cms/assets/js/APlayer.min.js" class="aplayer-secondary-script-marker"></script>importScripts('https://g.alicdn.com/kg/workbox/3.3.0/workbox-sw.js');
 
if (workbox) {
    workbox.setConfig({ modulePathPrefix: 'https://g.alicdn.com/kg/workbox/3.3.0/' });
 
    workbox.precaching.precache(['/', '/index.html']);
 
    workbox.routing.registerRoute(new RegExp('^https?://no5972.moe/cms/?$'), workbox.strategies.networkFirst());
 
    workbox.routing.registerRoute(new RegExp('.*.html'), workbox.strategies.networkFirst());
 
    workbox.routing.registerRoute(new RegExp('.*.(?:js|css|jpg|png|gif)'), workbox.strategies.staleWhileRevalidate());
}<link rel="stylesheet" href="/cms/css/spoiler.css" type="text/css"><script src="/cms/js/spoiler.js" type="text/javascript" async></script>