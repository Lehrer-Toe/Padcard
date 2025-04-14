/**
 * Hilfsfunktionen für snapWall
 */
const Utils = {
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },
    
    getYoutubeId: function(url) {
        if (!url) return null;
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    },
    
    getLearningappId: function(url) {
        if (!url) return null;
        if (/^\d+$/.test(url)) {
            return url;
        }
        const patterns = [
            /learningapps\.org\/(\d+)/,
            /learningapps\.org\/watch\?v=(\d+)/,
            /learningapps\.org\/view(\d+)/,
            /learningapps\.org\/display\?v=(\d+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    },
    
    fileToBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    },
    
    lightenColor: function(color, factor) {
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
        r = Math.round(r + (255 - r) * factor);
        g = Math.round(g + (255 - g) * factor);
        b = Math.round(b + (255 - b) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    },
    
    getFolderAncestors: function(folderId) {
        const ancestors = [];
        let folder = FolderDAO.getById(folderId);
        while (folder && folder.parentId) {
            const parent = FolderDAO.getById(folder.parentId);
            if (parent) {
                ancestors.push(parent);
            }
            folder = parent;
        }
        return ancestors;
    }
};
