/**
 * Media Manager - Handles media items and gallery
 */

export class MediaManager {
    constructor() {
        this.items = [];
        this.galleryEl = document.getElementById('mediaGallery');
        this.maxVideoSize = 100 * 1024 * 1024; // 100MB
        this.maxVideos = 1;
    }

    addItem(file, type) {
        // Validate video limit
        if (type === 'video') {
            const existingVideo = this.items.find(item => item.type === 'video');
            if (existingVideo) {
                alert('Only one video allowed per submission. Remove existing video first.');
                return false;
            }
            if (file.size > this.maxVideoSize) {
                alert('Video too large (max 100MB)');
                return false;
            }
        }

        const url = URL.createObjectURL(file);
        this.items.push({ type, file, url });
        this.renderGallery();
        return true;
    }

    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            const item = this.items[index];
            URL.revokeObjectURL(item.url);
            this.items.splice(index, 1);
            this.renderGallery();
            return true;
        }
        return false;
    }

    clearAll() {
        this.items.forEach(item => URL.revokeObjectURL(item.url));
        this.items = [];
        this.renderGallery();
    }

    getCount() {
        return this.items.length;
    }

    getAllItems() {
        return this.items;
    }

    renderGallery() {
        this.galleryEl.innerHTML = '';

        this.items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'media-item';

            if (item.type === 'image') {
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = `Image ${index + 1}`;
                div.appendChild(img);
            } else {
                const video = document.createElement('video');
                video.src = item.url;
                video.muted = true;
                video.playsInline = true;
                video.addEventListener('click', () => {
                    if (video.paused) video.play();
                    else video.pause();
                });
                div.appendChild(video);
            }

            // Type badge
            const badge = document.createElement('span');
            badge.className = 'type-badge';
            badge.textContent = item.type.toUpperCase();
            div.appendChild(badge);

            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeItem(index);
                // Trigger counter update via custom event
                document.dispatchEvent(new CustomEvent('mediaUpdated'));
            });
            div.appendChild(removeBtn);

            this.galleryEl.appendChild(div);
        });

        // Dispatch event for counter update
        document.dispatchEvent(new CustomEvent('mediaUpdated'));
    }
}