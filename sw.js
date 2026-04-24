importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
    console.log("Workbox berhasil dimuat!");

   
    workbox.precaching.precacheAndRoute([
        { url: './', revision: '3' },
        { url: './index.html', revision: '3' },
        { url: './manifest.json', revision: '3' },
        { url: './assets/css/styles.css', revision: '3' }, 
        { url: './assets/js/core/app.js', revision: '3' },
        { url: './assets/js/core/config.js', revision: '3' },
        { url: './assets/js/core/utils.js', revision: '3' },
        { url: './assets/js/services/camera.service.js', revision: '3' },
        { url: './assets/js/services/detection.service.js', revision: '3' },
        { url: './assets/js/services/facts.service.js', revision: '3' },
        { url: './assets/js/ui/ui.handler.js', revision: '3' }
    ]);

  
    workbox.routing.registerRoute(
        ({request}) => request.destination === 'style' || 
                       request.destination === 'image' ||
                       request.destination === 'font',
        new workbox.strategies.CacheFirst({
            cacheName: 'aset-statis-cache',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 30 * 24 * 60 * 60,
                }),
            ],
        })
    );


    workbox.routing.registerRoute(
        ({request}) => request.destination === 'script',
        new workbox.strategies.StaleWhileRevalidate({
            cacheName: 'js-cache',
        })
    );

 
    workbox.routing.registerRoute(
        ({url}) => url.pathname.includes('/model/') || 
                   url.href.includes('model.json') || 
                   url.href.includes('.bin') || 
                   url.origin === 'https://huggingface.co' || 
                   url.href.includes('.onnx'),
        new workbox.strategies.CacheFirst({
            cacheName: 'ai-models-cache',
            plugins: [
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200],
                }),
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 365 * 24 * 60 * 60, // Simpan 1 Tahun
                }),
            ],
        })
    );

} else {
    console.log("Gagal memuat Workbox!");
}