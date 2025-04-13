// Journal Image Upload Functionality
document.addEventListener('DOMContentLoaded', () => {
    const addImageBtn = document.getElementById('journal-add-image');
    const imageInput = document.getElementById('journal-image-input');
    const imageContainer = document.getElementById('journal-image-container');
    const imagePreview = document.getElementById('journal-image-preview');
    const removeImageBtn = document.getElementById('remove-journal-image');
    
    // Image positioning and sizing elements
    const positionBtns = document.querySelectorAll('.position-btn');
    const sizeSlider = document.getElementById('image-size-slider');
    const sizeValueDisplay = document.getElementById('size-value');
    
    // Variables to store image settings
    let imagePosition = 'below'; // Default position
    let imageSize = 50; // Default size (%)
    
    // Make sure all elements exist before adding event listeners
    if (addImageBtn && imageInput && imageContainer && imagePreview && removeImageBtn) {
        // Click the hidden file input when the add image button is clicked
        addImageBtn.addEventListener('click', () => {
            imageInput.click();
        });
        
        // Check localStorage space before adding image
        function checkStorageSpace() {
            try {
                // Get current usage
                let totalSize = 0;
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        totalSize += localStorage[key].length * 2; // Approximate byte size (2 bytes per character)
                    }
                }
                
                // Convert to MB
                const totalSizeMB = totalSize / (1024 * 1024);
                console.log(`Current localStorage usage: ~${totalSizeMB.toFixed(2)}MB`);
                
                // If over 4MB (leaving some space), warn the user and offer to clean up
                if (totalSizeMB > 4) {
                    if (confirm(`Your journal storage is nearly full (${totalSizeMB.toFixed(2)}MB used). Would you like to clean up old entries to make space?`)) {
                        cleanupOldEntries();
                        return true;
                    }
                    showFeedback('Storage space is limited. Consider exporting and clearing some entries.', 'warning');
                    return false;
                }
                return true;
            } catch (e) {
                console.error("Error checking storage space:", e);
                return false;
            }
        }
        
        // Cleanup old entries if needed
        function cleanupOldEntries() {
            try {
                // Get current journal entries
                const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                
                if (entries.length <= 5) {
                    showFeedback('Not enough entries to clean up. Try deleting some manually.', 'error');
                    return;
                }
                
                // Keep the 10 most recent entries, delete the rest
                const recentEntries = entries.slice(0, 10);
                localStorage.setItem('journalEntries', JSON.stringify(recentEntries));
                
                showFeedback(`Cleaned up ${entries.length - 10} old journal entries to free up space.`, 'success');
                
                // Re-render entries if that function exists
                if (typeof renderJournalEntries === 'function') {
                    renderJournalEntries();
                }
            } catch (e) {
                console.error("Error cleaning up entries:", e);
                showFeedback('Error cleaning up entries. Try clearing some manually.', 'error');
            }
        }
        
        // Compress image before storing
        function compressImage(imgDataUrl, quality = 0.7, maxWidth = 1200) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = function() {
                    // Calculate new dimensions maintaining aspect ratio
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                    
                    // Create canvas and draw resized image
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Get compressed data URL
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedDataUrl);
                };
                
                img.onerror = function() {
                    reject(new Error('Failed to load image for compression'));
                };
                
                img.src = imgDataUrl;
            });
        }
        
        // Handle file selection
        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                
                // Check file size (limit to 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showFeedback('Image is too large. Maximum size is 5MB.', 'error');
                    imageInput.value = null;
                    return;
                }
                
                // Check file type
                const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!validImageTypes.includes(file.type)) {
                    showFeedback('Please select a valid image file (JPEG, PNG, GIF, WebP).', 'error');
                    imageInput.value = null;
                    return;
                }
                
                // Check if we have enough storage space
                if (!checkStorageSpace()) {
                    showFeedback('Not enough storage space for images. Try clearing some old entries.', 'error');
                    imageInput.value = null;
                    return;
                }
                
                const reader = new FileReader();
                
                reader.onload = function(event) {
                    // Show loading indicator
                    imagePreview.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48c3R5bGU+QGtleWZyYW1lcyBzcGluIHtmcm9tIHt0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTt9IHRvIHt0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO319IGNpcmNsZSB7YW5pbWF0aW9uOiBzcGluIDFzIGxpbmVhciBpbmZpbml0ZTsgdHJhbnNmb3JtLW9yaWdpbjogMTJweCAxMnB4O308L3N0eWxlPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIgLz48L3N2Zz4=';
                    imageContainer.style.display = 'block';
                    
                    // Compress the image
                    compressImage(event.target.result, 0.7)
                        .then(compressedDataUrl => {
                            // Update preview with compressed image
                            imagePreview.src = compressedDataUrl;
                            
                            // Store the compressed image and its settings in the metadata
                            if (typeof journalMetadata !== 'undefined') {
                                journalMetadata.image = {
                                    src: compressedDataUrl,
                                    position: imagePosition,
                                    size: imageSize
                                };
                            }
                            
                            console.log(`Original size: ~${Math.round(event.target.result.length/1024)}KB, Compressed: ~${Math.round(compressedDataUrl.length/1024)}KB`);
                            showFeedback('Image added to journal entry');
                        })
                        .catch(err => {
                            console.error('Image compression failed:', err);
                            // Fallback to original image if compression fails
                            imagePreview.src = event.target.result;
                            
                            if (typeof journalMetadata !== 'undefined') {
                                journalMetadata.image = {
                                    src: event.target.result,
                                    position: imagePosition,
                                    size: imageSize
                                };
                            }
                            
                            showFeedback('Image added but could not be compressed', 'warning');
                        });
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Remove the image
        removeImageBtn.addEventListener('click', () => {
            imageContainer.style.display = 'none';
            imagePreview.src = '';
            
            // Remove the image from metadata if the variable exists
            if (typeof journalMetadata !== 'undefined') {
                journalMetadata.image = '';
            }
            
            imageInput.value = null;
            showFeedback('Image removed from journal entry');
        });
        
        // Handle image position selection
        if (positionBtns.length > 0) {
            positionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all position buttons
                    positionBtns.forEach(b => b.classList.remove('active'));
                    
                    // Add active class to clicked button
                    btn.classList.add('active');
                    
                    // Update image position
                    imagePosition = btn.dataset.position;
                    
                    // Update metadata if the variable exists
                    if (typeof journalMetadata !== 'undefined' && journalMetadata.image) {
                        if (typeof journalMetadata.image === 'object') {
                            journalMetadata.image.position = imagePosition;
                        } else if (typeof journalMetadata.image === 'string') {
                            // Convert string to object with settings
                            const src = journalMetadata.image;
                            journalMetadata.image = {
                                src: src,
                                position: imagePosition,
                                size: imageSize
                            };
                        }
                    }
                    
                    showFeedback(`Image position set to: ${imagePosition}`);
                });
            });
        }
        
        // Handle image size slider
        if (sizeSlider && sizeValueDisplay) {
            // Set initial value
            sizeValueDisplay.textContent = `${sizeSlider.value}%`;
            
            sizeSlider.addEventListener('input', () => {
                // Update size value display
                sizeValueDisplay.textContent = `${sizeSlider.value}%`;
                
                // Update image size variable
                imageSize = parseInt(sizeSlider.value);
                
                // Update preview image size
                imagePreview.style.width = `${imageSize}%`;
                
                // Update metadata if the variable exists
                if (typeof journalMetadata !== 'undefined' && journalMetadata.image) {
                    if (typeof journalMetadata.image === 'object') {
                        journalMetadata.image.size = imageSize;
                    } else if (typeof journalMetadata.image === 'string') {
                        // Convert string to object with settings
                        const src = journalMetadata.image;
                        journalMetadata.image = {
                            src: src,
                            position: imagePosition,
                            size: imageSize
                        };
                    }
                }
            });
            
            // Set initial preview size
            imagePreview.style.width = `${imageSize}%`;
        }
    }
    
    // Utility function to show feedback if not already defined
    if (typeof showFeedback !== 'function') {
        window.showFeedback = function(message, type = 'success') {
            console.log(`${type}: ${message}`);
            alert(message);
        };
    }
});

// Helper function to display journal entries with images
function displayJournalEntryImage(entry) {
    if (entry.metadata && entry.metadata.image) {
        // Handle both string and object image data
        let imageSrc;
        let positionClass = 'journal-entry-image-below'; // Default position
        let sizeStyle = ''; // Don't set default width here - only use user's setting
        
        if (typeof entry.metadata.image === 'object') {
            // New format with positioning and size
            imageSrc = entry.metadata.image.src;
            
            // Set position class
            if (entry.metadata.image.position) {
                positionClass = `journal-entry-image-${entry.metadata.image.position}`;
                console.log(`Using position from metadata: ${entry.metadata.image.position}`);
            } else {
                console.log('No position in metadata, using default');
            }
            
            // Set size style - ONLY if user specified a size
            if (entry.metadata.image.size) {
                sizeStyle = `width: ${entry.metadata.image.size}%;`;
                console.log(`Using size from metadata: ${entry.metadata.image.size}%`);
            } else {
                console.log('No size in metadata');
            }
        } else {
            // Legacy format (just string URL)
            imageSrc = entry.metadata.image;
            console.log('Using legacy image format (string only)');
        }
        
        // Debug log the final settings
        console.log(`Rendering image with: position=${positionClass}, size=${sizeStyle || 'natural'}, isSrcObject=${typeof imageSrc === 'object'}`);
        console.log(`Full metadata:`, JSON.stringify(entry.metadata.image));
        
        return `<img src="${imageSrc}" class="journal-entry-image ${positionClass}" style="${sizeStyle}" alt="Journal entry image" onclick="expandImage(this.src)">`;
    }
    return '';
}

// Function to expand image when clicked
function expandImage(src) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="image-modal-content">
            <span class="close-modal">&times;</span>
            <img src="${src}" alt="Expanded image">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close when clicking the X
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Close when clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Modified wrapper function for journal entry content with correct layout for images
function createJournalEntryContent(entry) {
    let content = '';
    
    if (!entry || !entry.metadata) {
        return `<div class="journal-content">${entry.text || ''}</div>`;
    }
    
    const hasImage = entry.metadata.image;
    let imageHTML = '';
    let imagePosition = 'below';
    
    // Get image HTML and position
    if (hasImage) {
        if (typeof entry.metadata.image === 'object' && entry.metadata.image.position) {
            imagePosition = entry.metadata.image.position;
            console.log(`Using position for layout: ${imagePosition}`);
        } else {
            console.log('No position information for layout, using default: below');
        }
        
        imageHTML = displayJournalEntryImage(entry);
    }
    
    // Handle different image positions
    if (!hasImage) {
        // No image, just text
        content = `<div class="journal-content">${entry.text}</div>`;
    } else if (imagePosition === 'above') {
        // Image above text
        content = `
            ${imageHTML}
            <div class="journal-content">${entry.text}</div>
        `;
    } else if (imagePosition === 'below') {
        // Image below text (default)
        content = `
            <div class="journal-content">${entry.text}</div>
            ${imageHTML}
        `;
    } else if (imagePosition === 'left') {
        // Image to the left of text with proper floating
        content = `
            <div class="journal-content-wrapper image-left">
                ${imageHTML}
                <div class="journal-content">${entry.text}</div>
            </div>
        `;
    } else if (imagePosition === 'right') {
        // Image to the right of text with proper floating
        content = `
            <div class="journal-content-wrapper image-right">
                ${imageHTML}
                <div class="journal-content">${entry.text}</div>
            </div>
        `;
    } else if (imagePosition === 'inline') {
        // Image inline with text (centered)
        // Split text in half and place image in the middle
        const textLength = entry.text.length;
        const midpoint = Math.floor(textLength / 2);
        let breakpoint = entry.text.indexOf('\n', midpoint);
        
        if (breakpoint === -1 || breakpoint > midpoint + 100) {
            // If no newline found near midpoint, find a space
            breakpoint = entry.text.indexOf(' ', midpoint);
        }
        
        if (breakpoint === -1) {
            // If still no good breakpoint, just use midpoint
            breakpoint = midpoint;
        }
        
        const firstHalf = entry.text.substring(0, breakpoint);
        const secondHalf = entry.text.substring(breakpoint);
        
        content = `
            <div class="journal-content">${firstHalf}</div>
            ${imageHTML}
            <div class="journal-content">${secondHalf}</div>
        `;
    }
    
    return content;
}

// Add CSS for the modal and image positioning
const style = document.createElement('style');
style.textContent = `
    .image-modal {
        display: flex;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        align-items: center;
        justify-content: center;
    }
    
    .image-modal-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }
    
    .image-modal-content img {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 4px;
    }
    
    .close-modal {
        position: absolute;
        top: -30px;
        right: 0;
        color: white;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
    }
    
    /* Journal entry image positioning classes */
    .journal-content-wrapper {
        display: flex;
        margin-bottom: 10px;
        width: 100%;
    }
    
    .journal-content-wrapper.image-left {
        flex-direction: row;
    }
    
    .journal-content-wrapper.image-right {
        flex-direction: row-reverse;
    }
    
    .journal-content-wrapper .journal-entry-image {
        max-width: 50%;
        object-fit: contain;
        margin: 0 10px;
    }
    
    .journal-content-wrapper .journal-content {
        flex: 1;
    }
    
    .journal-entry-image-left {
        float: left;
        margin-right: 15px;
        margin-bottom: 10px;
    }
    
    .journal-entry-image-right {
        float: right;
        margin-left: 15px;
        margin-bottom: 10px;
    }
    
    .journal-entry-image-above,
    .journal-entry-image-below,
    .journal-entry-image-inline {
        display: block;
        margin: 10px auto;
    }
`;
document.head.appendChild(style);
