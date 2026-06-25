/**
 * Camera Manager - Handles camera and recording
 */

export class CameraManager {
    constructor() {
        this.stream = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.isCameraActive = false;

        this.preview = document.getElementById('cameraPreview');
        this.cameraActions = document.getElementById('cameraActions');
        this.recordingActions = document.getElementById('recordingActions');
        this.cameraBtn = document.getElementById('cameraBtn');

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('mediaUpdated', () => {
            // Update UI if needed
        });
    }

    async toggleCamera() {
        if (this.isCameraActive) {
            this.stopCamera();
        } else {
            await this.startCamera();
        }
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });

            this.preview.srcObject = this.stream;
            this.preview.style.display = 'block';
            this.isCameraActive = true;
            this.cameraActions.style.display = 'flex';
            this.cameraBtn.textContent = '📷 Stop';

            return true;
        } catch (error) {
            alert('Camera access denied. Please use upload instead.');
            console.error('Camera error:', error);
            return false;
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.isRecording) {
            this.stopRecording();
        }

        this.preview.srcObject = null;
        this.preview.style.display = 'none';
        this.isCameraActive = false;
        this.cameraActions.style.display = 'none';
        this.recordingActions.style.display = 'none';
        this.cameraBtn.textContent = '📷 Camera';
    }

    capturePhoto(callback) {
        if (!this.isCameraActive || !this.stream) {
            alert('Camera not active. Start camera first.');
            return;
        }

        const track = this.stream.getVideoTracks()[0];
        if (!track) return;

        const imageCapture = new ImageCapture(track);
        imageCapture.takePhoto()
            .then(blob => {
                const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                if (callback) callback(file);
            })
            .catch(() => {
                // Fallback: use canvas
                const canvas = document.createElement('canvas');
                canvas.width = this.preview.videoWidth || 640;
                canvas.height = this.preview.videoHeight || 480;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(this.preview, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                        if (callback) callback(file);
                    }
                }, 'image/jpeg');
            });
    }

    async toggleRecording() {
        if (!this.isCameraActive) {
            await this.startCamera();
            setTimeout(() => this.startRecording(), 500);
        } else if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    async startRecording() {
        if (!this.isCameraActive || !this.stream) {
            alert('Start camera first.');
            return;
        }

        if (this.isRecording) return;

        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const combinedStream = new MediaStream([
                ...this.stream.getVideoTracks(),
                ...audioStream.getAudioTracks()
            ]);

            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/mp4'
            });

            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/mp4' });
                if (blob.size > 0) {
                    const file = new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
                    if (this.recordingCallback) {
                        this.recordingCallback(file);
                        this.recordingCallback = null;
                    }
                }
                this.recordedChunks = [];
                combinedStream.getTracks().forEach(t => t.stop());
            };

            this.mediaRecorder.start(1000);
            this.isRecording = true;
            this.recordingActions.style.display = 'flex';
            this.recordingCallback = null;

        } catch (error) {
            alert('Could not access audio. Recording without audio...');
            // Try without audio
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'video/mp4'
            });
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/mp4' });
                if (blob.size > 0) {
                    const file = new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
                    if (this.recordingCallback) {
                        this.recordingCallback(file);
                        this.recordingCallback = null;
                    }
                }
                this.recordedChunks = [];
            };

            this.mediaRecorder.start(1000);
            this.isRecording = true;
            this.recordingActions.style.display = 'flex';
            this.recordingCallback = null;
        }
    }

    stopRecording(callback) {
        if (this.mediaRecorder && this.isRecording) {
            this.recordingCallback = callback || null;
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.recordingActions.style.display = 'none';
        }
    }
}