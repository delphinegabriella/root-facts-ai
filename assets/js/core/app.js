import UIHandler from '../ui/ui.handler.js';
import CameraService from '../services/camera.service.js'; 
import DetectionService from '../services/detection.service.js';
import FunFactService from '../services/facts.service.js';
import { APP_CONFIG } from './config.js';
import { logError } from './utils.js';

class RootFactsApp {
    constructor() {
      this.camera = new CameraService();
      this.detector = new DetectionService();
        this.funFactGenerator = new FunFactService();
        this.ui = new UIHandler();

        this.isRunning = false;
        this.currentLoopId = null;
        this.config = APP_CONFIG;
        this.currentFunFact = '';
        this.lastPrediction = null;

        this.ui.disableButton();
        this.bindEvents();
        this.init();
    }

    // TODO [Basic] Bind toggle camera event dengan nama onToggleCamera
    bindEvents() {
        this.ui.bindEvents({
            onToggleCamera: () => this.toggleCamera()
        });
    }
    
    // TODO [Basic] Lengkapi inisialisasi kemampuan aplikasi
    async init() {
        try { 
              this.ui.updateHeaderStatus('Memuat model AI...', true);

              await this.detector.loadModel();
              await this.funFactGenerator.loadModel();
              await this.camera.init();
              this.ui.enableButton();
              this.ui.updateHeaderStatus('Siap', false);

            
        } catch (error) {
            logError('Gagal menginisialisasi aplikasi', error);
            this.ui.updateHeaderStatus('Error', false);
            this.ui.showError(`Gagal menginisialisasi: ${error.message}`);
            this.ui.disableButton();
        }
    }

    // TODO [Basic] Implementasikan metode untuk mengaktifkan atau menonaktifkan kamera
    toggleCamera() {
        if (!this.isRunning) {
            this.startCamera();
        } else {
            this.stopCamera();
            if (this.lastPrediction) {
                this.generateAndShowResults(this.lastPrediction);
            }
        }
    }

    // TODO [Basic] Implementasikan metode untuk memulai kamera
    async startCamera() {
        try {
            this.isRunning = true;
            this.ui.updateCameraUI(true); 
            
            await this.camera.startCamera(); 
            this.startDetection();
            
        } catch (error) {
            this.isRunning = false;
            this.ui.updateCameraUI(false);
            logError("Gagal menyalakan kamera", error);
            this.ui.showError("Gagal mengakses kamera. Pastikan izin diberikan.");
        }
    }

    // TODO [Basic] Implementasikan metode untuk menghentikan kamera
    stopCamera() {
        this.stopDetection();
        this.isRunning = false;
        this.ui.updateCameraUI(false); 
        this.camera.stopCamera();
    }

    startDetection() {
        if (this.detector.isLoaded()) {
            this.detectLoop();
        }
    }
    stopDetection() {
        if (this.currentLoopId) {
            cancelAnimationFrame(this.currentLoopId);
            this.currentLoopId = null;
        }
    }
    
    async detectLoop() {
        if (!this.isRunning) return;

        if (this.camera.isActive() && this.camera.isReady()) {
            try {
                const prediction = await this.detector.predict(this.camera.video);
                this.lastPrediction = prediction;
                
                this.ui.showResults(prediction, { funFact: "Klik Tombol STOP (merah) untuk menghasilkan fakta unik!"});
                
            } catch (error) {
                console.error("Deteksi gagal:", error);
            }
        }

        if (this.isRunning) {
            this.currentLoopId = requestAnimationFrame(() => this.detectLoop());
        }
    }


    async generateAndShowResults(detectionResult) {
        try {
            this.ui.showResults(detectionResult, null);
            const factText = await this.funFactGenerator.generateFunFact(detectionResult.className);
            this.ui.showResults(detectionResult, {funFact: factText});
        } catch (error) {
            logError('Gagal menampilkan hasil', error);
            this.ui.updateFunFactState('error');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new RootFactsApp();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

export default RootFactsApp;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker sukses didaftarkan!', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker gagal didaftarkan!', error);
            });
    });
}
