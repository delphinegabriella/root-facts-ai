importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
    console.log("Workbox berhasil dimuat!");

    workbox.precaching.precacheAndRoute([
        { url: './', revision: '1' },
        { url: './index.html', revision: '1' },
        { url: './manifest.json', revision: '1' },
        { url: './assets/js/core/app.js', revision: '1' },
        { url: './assets/js/core/config.js', revision: '1' },
        { url: './assets/js/core/utils.js', revision: '1' },
        { url: './assets/js/services/camera.service.js', revision: '1' },
        { url: './assets/js/services/detection.service.js', revision: '1' },
        { url: './assets/js/services/facts.service.js', revision: '1' },
        { url: './assets/js/ui/ui.handler.js', revision: '1' }
    ]);

    workbox.routing.registerRoute(
        ({request}) => request.destination === 'script' || 
                       request.destination === 'style' || 
                       request.destination === 'image',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'aset-statis-cache',
        })
    );
} else {
    console.log("Gagal memuat Workbox!");
}