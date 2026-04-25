import { logError } from '../core/utils.js';
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.1';

env.allowLocalModels = false;

class FunFactService {
    constructor() {
        this.generator = null;
        this.isModelLoaded = false;
        this.isGenerating = false;
        this.config = null;
        this.currentBackend = null;
    }

    // TODO [Basic] Implementasikan metode untuk memuat model Transformers.js
    // TODO [Advance] Gunakan strategi Backend Adaptive seperti yang telah dipelajari sebelumnya
    async loadModel() {
        try {
            this.generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M');
            this.isModelLoaded = true;
        } catch (error) {
            logError('Error loading Transformers.js model', error);
            throw new Error(`Failed to load FunFact model: ${error.message}`);
        }
    }

    // TODO [Basic] Implementasikan metode untuk menghasilkan fun fact tentang sayuran
    // TODO [Basic] Tambahkan validasi untuk maksimum panjang input dan pembersihan input terhadap karakter khusus untuk mengatasi prompt injection
    // TODO [Advanced] Gunakan parameter `tone` untuk variasi personalitas
    async generateFunFact(vegetable, tone = 'normal') {
        if (!this.isReady()) {
            throw new Error('Model belum siap atau sedang menghasilkan fakta');
        }

        if (!vegetable || typeof vegetable !== 'string') {
            throw new Error('Nama sayuran yang valid diperlukan');
        }

        try {
            this.isGenerating = true;

            const safeVegetable = vegetable.replace(/[^a-zA-Z\s]/g, '').substring(0, 30);
            const prompt = `write one short and interesting fun fact about ${safeVegetable}.`;

            const result = await this.generator(prompt, {
                max_new_tokens: 50,
                temperature: 0.7,
                do_sample: true
            });

            return result[0].generated_text;

        } catch (error) {
            logError('Error generating fun fact', error);
            throw new Error(`Failed to generate fun fact: ${error.message}`);
        } finally {
            this.isGenerating = false;
        }
    }

    // TODO [Basic] Periksa apakah model siap dan tidak sedang menghasilkan fakta
    isReady() {
        return this.isModelLoaded && !this.isGenerating;
    }
}

export default FunFactService;