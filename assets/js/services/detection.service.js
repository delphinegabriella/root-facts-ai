import { logError } from '../core/utils.js';

class DetectionService {
    constructor() {
        this.model = null;
        this.labels = [];
        this.config = null;
    }

    // TODO [Basic] Implementasikan metode untuk memuat model TensorFlow.js
    async loadModel() {
        try {
          
            this.model = await tf.loadLayersModel('./model/model.json');

            const response = await fetch('./model/metadata.json');
            const metadata = await response.json();
            
            this.labels = metadata.labels; 

        } catch (error) {
            logError('Failed to load model', error);
            throw new Error(`Failed to load model: ${error.message}`);
        }
    }

    // TODO [Basic] Implementasikan metode untuk melakukan prediksi pada elemen gambar
    async predict(imageElement) {
        let tensor;
        let resized;
        let normalized;
        let batched;
        let predictions;

        try {
            tensor = tf.browser.fromPixels(imageElement);
            
            resized = tf.image.resizeBilinear(tensor, [224, 224]);
            
            normalized = resized.div(255.0);
            
            batched = normalized.expandDims(0);

            predictions = this.model.predict(batched);

            const data = await predictions.data();

            const maxConfidence = Math.max(...Array.from(data));
            const maxIndex = Array.from(data).indexOf(maxConfidence);

            return {
                className: this.labels[maxIndex],
                confidence: Math.round(maxConfidence * 100)
            };

        } catch (error) {
            logError('Prediction error', error);
            throw new Error(`Prediksi gagal: ${error.message}`);
        } finally {
            // TODO [Basic] Dispose tensor dan predictions untuk menghindari memory leak
            if (tensor) tensor.dispose();
            if (resized) resized.dispose();
            if (normalized) normalized.dispose();
            if (batched) batched.dispose();
            if (predictions) predictions.dispose();
        }
    }

    // TODO [Basic] Periksa apakah model sudah dimuat
    isLoaded() {
        return this.model !== null;
    }
}

export default DetectionService;
