/**
 * Hilfsfunktionen für snapWall
 */
const Utils = {
    /**
     * Format date to locale string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },
    
    /**
     * Extract YouTube ID from URL
     * @param {string} url - YouTube URL
     * @returns {string|null} YouTube ID or null if invalid
     */
    getYoutubeId: function(url) {
        if (!url) return null;
        
        // If it's just the ID (11 characters)
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }
        
        // Try to extract ID from URL
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    },
    
    /**
     * Extract LearningApp ID from URL
     * @param {string} url - LearningApp URL
     * @returns {string|null} LearningApp ID or null if invalid
     */
    getLearningappId: function(url) {
        if (!url) return null;
        
        // If it's just the ID
        if (/^\d+$/.test(url)) {
            return url;
        }
        
        // Try to extract ID from different URL formats
        const patterns = [
            /learningapps\.org\/(\d+)/, // Simple URL format
            /learningapps\.org\/watch\?v=(\d+)/, // Watch format
            /learningapps\.org\/view(\d+)/, // View format
            /learningapps\.org\/display\?v=(\d+)/ // Display format
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        return null;
    },
    
    /**
     * Convert file to Base64
     * @param {File} file - File object
     * @returns {Promise<string>} Base64 string
     */
    fileToBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Lighten a color (for card backgrounds)
     * @param {string} color - CSS color
     * @param {number} factor - Lightening factor (0-1)
     * @returns {string} Lightened color
     */
    lightenColor: function(color, factor) {
        // Convert hex to RGB
        let r, g, b;
        if (color.startsWith('#')) {
            const hex = color.substring(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (color.startsWith('rgb')) {
            const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (rgbMatch) {
                r = parseInt(rgbMatch[1]);
                g = parseInt(rgbMatch[2]);
                b = parseInt(rgbMatch[3]);
            } else {
                return color;
            }
        } else {
            return color;
        }
        
        // Lighten
        r = Math.round(r + (255 - r) * factor);
        g = Math.round(g + (255 - g) * factor);
        b = Math.round(b + (255 - b) * factor);
        
        // Convert back to hex
        return `rgb(${r}, ${g}, ${b})`;
    },
    
    /**
     * Holt alle Vorfahren eines Ordners
     * @param {string} folderId - Ordner-ID 
     * @returns {Array} Array aller Vorfahren, beginnend mit dem unmittelbaren Elternteil
     */
    getFolderAncestors: function(folderId) {
        const ancestors = [];
        let folder = FolderDAO.getById(folderId);
        
        while (folder && folder.parentId) {
            const parent = FolderDAO.getById(folder.parentId);
            if (parent) {
                ancestors.push(parent);
                folder = parent;
            } else {
                break;
            }
        }
        
        return ancestors;
    },
    
    /**
     * Formatiert Text mit den angegebenen Formatierungen
     * @param {string} text - Der zu formatierende Text
     * @param {string} align - Textausrichtung ('left', 'center', 'right')
     * @param {string} size - Textgröße ('small', 'normal', 'large')
     * @param {Object} colors - Objekt mit Textteilen und Farben
     * @returns {string} Formatierter HTML-Text
     */
    formatText: function(text, align, size, colors) {
        if (!text) return '';
        
        let formattedText = text;
        
        // Textteil-Farben anwenden
        if (colors && Object.keys(colors).length > 0) {
            for (const [textPart, color] of Object.entries(colors)) {
                const regex = new RegExp(textPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                formattedText = formattedText.replace(regex, `<span style="color:${color}">${textPart}</span>`);
            }
        }
        
        // Größen-Klassen definieren
        const sizeClass = 
            size === 'small' ? 'text-small' : 
            size === 'large' ? 'text-large' : '';
        
        // HTML generieren
        return `<div class="${sizeClass}" style="text-align:${align}">${formattedText}</div>`;
    }
};