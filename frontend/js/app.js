/**
 * Factory Evidence Pro - Main Application
 * Timezone: Asia/Manila (UTC+8)
 */

import { CONFIG } from '../config/config.js';
import { validateForm, showErrors } from './validation.js';
import { MediaManager } from './media.js';
import { CameraManager } from './camera.js';

class EvidenceApp {
    constructor() {
        this.mediaManager = new MediaManager();
        this.cameraManager = new CameraManager();
        this.form = document.getElementById('evidenceForm');
        this.statusEl = document.getElementById('statusMessage');
        this.submitBtn = document.getElementById('submitBtn');

        this.init();
    }

    init() {
        // Set default dates to Philippines time
        const phTime = this.getPhilippinesTime();
        const today = phTime.toISOString().split('T')[0];
        document.getElementById('fclDate').value = today;
        document.getElementById('chinaDate').value = today;

        // Display PH time
        this.updatePHTimeDisplay();

        // Bind events
        this.bindEvents();

        // Initialize media gallery
        this.mediaManager.renderGallery();
        this.updateCounter();
    }

    getPhilippinesTime() {
        const now = new Date();
        const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
        return phTime;
    }

    updatePHTimeDisplay() {
        const phTime = this.getPhilippinesTime();
        const options = {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const formatted = phTime.toLocaleString('en-US', options);

        // Update status or header with PH time
        const timeDisplay = document.getElementById('phTimeDisplay');
        if (timeDisplay) {
            timeDisplay.textContent = `🇵🇭 ${formatted}`;
        }
    }

    bindEvents() {
        // Submit form
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // Camera
        document.getElementById('cameraBtn').addEventListener('click', () => {
            this.cameraManager.toggleCamera();
        });

        document.getElementById('capturePhotoBtn').addEventListener('click', () => {
            this.cameraManager.capturePhoto((file) => {
                this.mediaManager.addItem(file, 'image');
                this.updateCounter();
            });
        });

        document.getElementById('stopCameraBtn').addEventListener('click', () => {
            this.cameraManager.stopCamera();
        });

        // Recording
        document.getElementById('recordBtn').addEventListener('click', () => {
            this.cameraManager.toggleRecording();
        });

        document.getElementById('startRecordBtn').addEventListener('click', () => {
            this.cameraManager.startRecording();
        });

        document.getElementById('stopRecordBtn').addEventListener('click', () => {
            this.cameraManager.stopRecording((file) => {
                this.mediaManager.addItem(file, 'video');
                this.updateCounter();
            });
        });

        // Upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            const files = e.target.files;
            for (let file of files) {
                const type = file.type.startsWith('image/') ? 'image' :
                           (file.type.startsWith('video/') ? 'video' : null);
                if (type) {
                    this.mediaManager.addItem(file, type);
                }
            }
            this.updateCounter();
            e.target.value = ''; // Reset
        });

        // Clear media
        document.getElementById('clearMediaBtn').addEventListener('click', () => {
            this.mediaManager.clearAll();
            this.updateCounter();
            this.showStatus('All media cleared', 'info');
        });

        // Update PH time every minute
        setInterval(() => {
            this.updatePHTimeDisplay();
        }, 60000);
    }

    updateCounter() {
        const count = this.mediaManager.getCount();
        document.getElementById('mediaCounter').textContent = `${count} items`;
    }

    showStatus(message, type = 'info') {
        this.statusEl.textContent = message;
        this.statusEl.className = `status-message ${type}`;
        this.statusEl.style.display = 'block';

        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                this.statusEl.style.display = 'none';
            }, 5000);
        }
    }

    async submitForm() {
        // Validate
        const validation = validateForm();
        if (!validation.isValid) {
            showErrors(validation.errors);
            this.showStatus('Please fill in all required fields', 'error');
            return;
        }

        // Check media
        if (this.mediaManager.getCount() === 0) {
            this.showStatus('Please add at least one image or video', 'error');
            return;
        }

        // Prepare data with PH timezone
        const phTime = this.getPhilippinesTime();
        const formData = new FormData();
        const data = {
            sku: document.getElementById('sku').value.trim(),
            boxCode: document.getElementById('boxCode').value.trim(),
            quantity: parseInt(document.getElementById('quantity').value),
            fclDate: document.getElementById('fclDate').value,
            chinaDate: document.getElementById('chinaDate').value,
            remarks: document.getElementById('remarks').value.trim(),
            timestamp: phTime.toISOString()
        };

        formData.append('data', JSON.stringify(data));

        // Append media files
        const mediaItems = this.mediaManager.getAllItems();
        mediaItems.forEach((item, index) => {
            const ext = item.file.type.split('/')[1] || 'jpg';
            const name = item.type === 'image'
                ? `SKU_${data.sku}_${String(index + 1).padStart(2, '0')}.${ext}`
                : `SKU_${data.sku}_video.mp4`;
            formData.append('media', item.file, name);
        });

        // Submit
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = '⏳ Submitting...';
        this.showStatus(`Uploading evidence... (PH Time: ${phTime.toLocaleTimeString()})`, 'info');

        try {
            const response = await fetch(CONFIG.GAS_URL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });

            this.showStatus('✅ Evidence submitted successfully! (PH Time)', 'success');
            this.resetForm();

        } catch (error) {
            this.showStatus(`❌ Error: ${error.message}`, 'error');
            console.error('Submission error:', error);
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = '📤 Submit Evidence';
        }
    }

    resetForm() {
        // Clear form
        document.getElementById('sku').value = '';
        document.getElementById('boxCode').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('remarks').value = '';

        // Reset dates to PH time
        const phTime = this.getPhilippinesTime();
        const today = phTime.toISOString().split('T')[0];
        document.getElementById('fclDate').value = today;
        document.getElementById('chinaDate').value = today;

        // Clear media
        this.mediaManager.clearAll();
        this.updateCounter();

        // Stop camera
        this.cameraManager.stopCamera();

        // Update PH time display
        this.updatePHTimeDisplay();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new EvidenceApp();
    window.app = app; // For debugging
});