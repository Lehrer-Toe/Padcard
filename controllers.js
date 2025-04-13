// Application data store
const AppData = {
    folders: [],         // Array of folder objects
    boards: [],          // Array of board objects
    currentBoard: null,  // Current active board
    currentFolder: null, // Current active folder
    view: 'home',        // Current view (home, folder, board)
    studentMode: false   // Student mode flag
};

// Default color palette
const DefaultColors = {
    folder: [
        { name: 'Lila', color: '#9c27b0' },
        { name: 'Blau', color: '#2196F3' },
        { name: 'Türkis', color: '#00bcd4' },
        { name: 'Grün', color: '#4CAF50' },
        { name: 'Gelb', color: '#FFEB3B' },
        { name: 'Orange', color: '#FF9800' },
        { name: 'Rot', color: '#f44336' },
        { name: 'Grau', color: '#9E9E9E' }
    ],
    board: [
        { name: 'Lila', color: '#9c27b0' },
        { name: 'Blau', color: '#2196F3' },
        { name: 'Türkis', color: '#00bcd4' },
        { name: 'Grün', color: '#4CAF50' },
        { name: 'Gelb', color: '#FFEB3B' },
        { name: 'Orange', color: '#FF9800' },
        { name: 'Rot', color: '#f44336' },
        { name: 'Grau', color: '#9E9E9E' }
    ]
};

// Data Models
class Folder {
    constructor(id, name, color, parentId) {
        this.id = id || `folder-${Date.now()}`;
        this.name = name || 'Neuer Ordner';
        this.color = color || '#2196F3';
        this.parentId = parentId || null; // Übergeordneter Ordner
        this.created = new Date().toISOString();
        this.updated = this.created;
    }
}

class Board {
    constructor(id, name, color, folderId) {
        this.id = id || `board-${Date.now()}`;
        this.name = name || 'Neuer Snap';
        this.color = color || '#4CAF50';
        this.folderId = folderId || null;
        this.cards = [];
        this.categories = [];
        this.layout = 3;
        this.view = 'grid';
        this.background = null;
        this.previewImage = null; // Für Vorschaubild
        this.created = new Date().toISOString();
        this.updated = this.created;
    }
}

class Card {
    constructor(options = {}) {
        this.id = options.id || `card-${Date.now()}`;
        this.title = options.title || 'Neue Karte';
        this.content = options.content || '';
        this.textAlignment = options.textAlignment || 'left'; // 'left', 'center', 'right'
        this.fontSize = options.fontSize || 'normal'; // 'small', 'normal', 'large'
        this.textColors = options.textColors || {}; // { textPart: color }
        this.type = options.type || 'text';
        this.color = options.color || 'blue';
        this.customColor = options.customColor || '';
        this.width = options.width || 1;
        this.height = options.height || 1;
        this.category = options.category || '';
        this.position = options.position || null;
        this.size = options.size || null;
        this.created = new Date().toISOString();
        this.updated = this.created;
        
        // Type-specific properties
        if (this.type === 'youtube') {
            this.youtubeId = options.youtubeId || '';
        } else if (this.type === 'image') {
            this.imageUrl = options.imageUrl || '';
            this.imageData = options.imageData || null; // Base64 data for uploaded images
        } else if (this.type === 'link') {
            this.linkUrl = options.linkUrl || '';
        } else if (this.type === 'learningapp') {
            this.learningappId = options.learningappId || '';
        } else if (this.type === 'audio') {
            this.audioUrl = options.audioUrl || '';
            this.audioData = options.audioData || null; // Base64 data for uploaded audio
        }
    }
}

class Category {
    constructor(id, name) {
        this.id = id || `category-${Date.now()}`;
        this.name = name || 'Neue Kategorie';
        this.created = new Date().toISOString();
    }
}

class Background {
    constructor(options = {}) {
        this.url = options.url || '';
        this.data = options.data || null; // Base64 data for uploaded images
        this.style = options.style || 'cover'; // cover, contain, repeat
        this.opacity = options.opacity || 100; // 0-100
    }
}

/**
 * Storage Service for persisting data
 */
const StorageService = {
    /**
     * Save all application data to localStorage
     */
    saveAppData: function() {
        localStorage.setItem('snapwall-data', JSON.stringify({
            folders: AppData.folders,
            boards: AppData.boards,
            studentMode: AppData.studentMode
        }));
    },
    
    /**
     * Load application data from localStorage
     */
    loadAppData: function() {
        const savedData = localStorage.getItem('snapwall-data') || localStorage.getItem('taskcard-manager-data');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                
                // Ensure all required properties exist
                AppData.folders = parsedData.folders || [];
                AppData.boards = parsedData.boards || [];
                AppData.studentMode = parsedData.studentMode || false;
                
                // Upgrade folder model with parentId if not exists
                AppData.folders.forEach(folder => {
                    if (folder.parentId === undefined) {
                        folder.parentId = null;
                    }
                });
                
                // Upgrade card model with text formatting if not exists
                AppData.boards.forEach(board => {
                    if (board.cards) {
                        board.cards.forEach(card => {
                            if (card.textAlignment === undefined) card.textAlignment = 'left';
                            if (card.fontSize === undefined) card.fontSize = 'normal';
                            if (card.textColors === undefined) card.textColors = {};
                        });
                    }
                });
                
                return true;
            } catch (error) {
                console.error('Failed to parse saved data:', error);
                return false;
            }
        }
        return false;
    },
    
    /**
     * Initialize default data if no saved data exists
     */
    initDefaultData: function() {
        // Create default folders
        AppData.folders = [
            new Folder('folder-1', 'Fächer', '#9c27b0'),
            new Folder('folder-2', 'Projekte', '#2196F3'),
            new Folder('folder-3', 'Unterordner', '#4CAF50', 'folder-2')
        ];
        
        // Create default boards
        AppData.boards = [
            new Board('board-1', 'Deutsch', '#f44336', 'folder-1'),
            new Board('board-2', 'Mathematik', '#4CAF50', 'folder-1'),
            new Board('board-3', 'Projektplanung', '#FF9800', 'folder-2'),
            new Board('board-4', 'Notizen', '#2196F3')
        ];
        
        // Save the default data
        this.saveAppData();
    },
    
    /**
     * Export all data as JSON file
     */
    exportData: function() {
        const dataStr = JSON.stringify({
            folders: AppData.folders,
            boards: AppData.boards
        }, null, 2);
        
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapwall-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },
    
    /**
     * Import data from JSON file
     * @param {Object} data - The imported data object
     * @returns {boolean} Success status
     */
    importData: function(data) {
        if (!data || !Array.isArray(data.folders) || !Array.isArray(data.boards)) {
            return false;
        }
        
        AppData.folders = data.folders;
        AppData.boards = data.boards;
        
        // Upgrade folder model with parentId if not exists
        AppData.folders.forEach(folder => {
            if (folder.parentId === undefined) {
                folder.parentId = null;
            }
        });
        
        // Upgrade card model with text formatting if not exists
        AppData.boards.forEach(board => {
            if (board.cards) {
                board.cards.forEach(card => {
                    if (card.textAlignment === undefined) card.textAlignment = 'left';
                    if (card.fontSize === undefined) card.fontSize = 'normal';
                    if (card.textColors === undefined) card.textColors = {};
                });
            }
        });
        
        this.saveAppData();
        return true;
    }
};

/**
 * Data Access Objects for CRUD operations
 */
const FolderDAO = {
    /**
     * Get all folders
     * @returns {Array} Array of folder objects
     */
    getAll: function() {
        return AppData.folders;
    },
    
    /**
     * Get all root folders (without parent)
     * @returns {Array} Array of root folder objects
     */
    getRootFolders: function() {
        return AppData.folders.filter(folder => !folder.parentId);
    },
    
    /**
     * Get child folders by parent ID
     * @param {string} parentId - Parent folder ID
     * @returns {Array} Array of child folder objects
     */
    getChildFolders: function(parentId) {
        return AppData.folders.filter(folder => folder.parentId === parentId);
    },
    
    /**
     * Get folder by ID
     * @param {string} id - Folder ID
     * @returns {Object|null} Folder object or null if not found
     */
    getById: function(id) {
        return AppData.folders.find(folder => folder.id === id) || null;
    },
    
    /**
     * Create new folder
     * @param {string} name - Folder name
     * @param {string} color - Folder color
     * @param {string|null} parentId - Parent folder ID or null
     * @returns {Object} Created folder object
     */
    create: function(name, color, parentId) {
        const folder = new Folder(null, name, color, parentId);
        AppData.folders.push(folder);
        StorageService.saveAppData();
        return folder;
    },
    
    /**
     * Update folder
     * @param {string} id - Folder ID
     * @param {Object} updates - Object with properties to update
     * @returns {Object|null} Updated folder or null if not found
     */
    update: function(id, updates) {
        const folder = this.getById(id);
        if (!folder) return null;
        
        Object.assign(folder, updates);
        folder.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return folder;
    },
    
    /**
     * Delete folder
     * @param {string} id - Folder ID
     * @returns {boolean} Success status
     */
    delete: function(id) {
        const index = AppData.folders.findIndex(folder => folder.id === id);
        if (index === -1) return false;
        
        // Get folder children
        const childFolders = this.getChildFolders(id);
        
        // Remove folder
        AppData.folders.splice(index, 1);
        
        // Update boards that were in this folder (set folderId to null)
        AppData.boards.forEach(board => {
            if (board.folderId === id) {
                board.folderId = null;
            }
        });
        
        // Update child folders (set parentId to null or parent's parent)
        const deletedFolder = AppData.folders[index];
        childFolders.forEach(child => {
            this.update(child.id, { parentId: deletedFolder ? deletedFolder.parentId : null });
        });
        
        StorageService.saveAppData();
        return true;
    },
    
    /**
     * Prüft, ob ein Ordner ein Vorfahre eines anderen Ordners ist
     * @param {string} folderId - Zu prüfender Ordner
     * @param {string} potentialAncestorId - Potenzieller Vorfahre
     * @returns {boolean} True wenn potentialAncestorId ein Vorfahre von folderId ist
     */
    isAncestor: function(folderId, potentialAncestorId) {
        if (!folderId || !potentialAncestorId) return false;
        if (folderId === potentialAncestorId) return true;
        
        const folder = this.getById(folderId);
        if (!folder || !folder.parentId) return false;
        
        return this.isAncestor(folder.parentId, potentialAncestorId);
    }
};

const BoardDAO = {
    /**
     * Get all boards
     * @returns {Array} Array of board objects
     */
    getAll: function() {
        return AppData.boards;
    },
    
    /**
     * Get boards by folder ID
     * @param {string} folderId - Folder ID
     * @returns {Array} Array of board objects in the folder
     */
    getByFolderId: function(folderId) {
        if (!folderId) {
            return AppData.boards.filter(board => !board.folderId);
        }
        return AppData.boards.filter(board => board.folderId === folderId);
    },
    
    /**
     * Get board by ID
     * @param {string} id - Board ID
     * @returns {Object|null} Board object or null if not found
     */
    getById: function(id) {
        return AppData.boards.find(board => board.id === id) || null;
    },
    
    /**
     * Create new board
     * @param {string} name - Board name
     * @param {string} color - Board color
     * @param {string|null} folderId - Folder ID or null
     * @param {Object} options - Additional options like background and previewImage
     * @returns {Object} Created board object
     */
    create: function(name, color, folderId, options = {}) {
        const board = new Board(null, name, color, folderId);
        
        if (options.background) {
            board.background = options.background;
        }
        
        if (options.previewImage) {
            board.previewImage = options.previewImage;
        }
        
        AppData.boards.push(board);
        StorageService.saveAppData();
        return board;
    },
    
    /**
     * Update board
     * @param {string} id - Board ID
     * @param {Object} updates - Object with properties to update
     * @returns {Object|null} Updated board or null if not found
     */
    update: function(id, updates) {
        const board = this.getById(id);
        if (!board) return null;
        
        // Handle nested properties carefully
        if (updates.cards !== undefined) {
            board.cards = updates.cards;
            delete updates.cards;
        }
        
        if (updates.categories !== undefined) {
            board.categories = updates.categories;
            delete updates.categories;
        }
        
        if (updates.background !== undefined) {
            board.background = updates.background;
            delete updates.background;
        }
        
        if (updates.previewImage !== undefined) {
            board.previewImage = updates.previewImage;
            delete updates.previewImage;
        }
        
        Object.assign(board, updates);
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return board;
    },
    
    /**
     * Delete board
     * @param {string} id - Board ID
     * @returns {boolean} Success status
     */
    delete: function(id) {
        const index = AppData.boards.findIndex(board => board.id === id);
        if (index === -1) return false;
        
        AppData.boards.splice(index, 1);
        StorageService.saveAppData();
        return true;
    },
    
    /**
     * Add card to board
     * @param {string} boardId - Board ID
     * @param {Object} cardData - Card data
     * @returns {Object|null} Created card or null if board not found
     */
    addCard: function(boardId, cardData) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        const card = new Card(cardData);
        board.cards.push(card);
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return card;
    },
    
    /**
     * Update card in board
     * @param {string} boardId - Board ID
     * @param {string} cardId - Card ID
     * @param {Object} updates - Object with properties to update
     * @returns {Object|null} Updated card or null if not found
     */
    updateCard: function(boardId, cardId, updates) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        const cardIndex = board.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return null;
        
        Object.assign(board.cards[cardIndex], updates);
        board.cards[cardIndex].updated = new Date().toISOString();
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return board.cards[cardIndex];
    },
    
    /**
     * Delete card from board
     * @param {string} boardId - Board ID
     * @param {string} cardId - Card ID
     * @returns {boolean} Success status
     */
    deleteCard: function(boardId, cardId) {
        const board = this.getById(boardId);
        if (!board) return false;
        
        const cardIndex = board.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return false;
        
        board.cards.splice(cardIndex, 1);
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return true;
    },
    
    /**
     * Add category to board
     * @param {string} boardId - Board ID
     * @param {string} name - Category name
     * @returns {Object|null} Created category or null if board not found
     */
    addCategory: function(boardId, name) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        const category = new Category(null, name);
        board.categories.push(category);
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return category;
    },
    
    /**
     * Update category in board
     * @param {string} boardId - Board ID
     * @param {string} categoryId - Category ID
     * @param {string} name - New category name
     * @returns {Object|null} Updated category or null if not found
     */
    updateCategory: function(boardId, categoryId, name) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        const category = board.categories.find(cat => cat.id === categoryId);
        if (!category) return null;
        
        category.name = name;
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return category;
    },
    
    /**
     * Delete category from board
     * @param {string} boardId - Board ID
     * @param {string} categoryId - Category ID
     * @returns {boolean} Success status
     */
    deleteCategory: function(boardId, categoryId) {
        const board = this.getById(boardId);
        if (!board) return false;
        
        const categoryIndex = board.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex === -1) return false;
        
        // Remove category
        board.categories.splice(categoryIndex, 1);
        
        // Update cards that were in this category (set category to empty string)
        board.cards.forEach(card => {
            if (card.category === categoryId) {
                card.category = '';
            }
        });
        
        board.updated = new Date().toISOString();
        StorageService.saveAppData();
        return true;
    },
    
    /**
     * Set background for board
     * @param {string} boardId - Board ID
     * @param {Object} backgroundData - Background data
     * @returns {Object|null} Background object or null if board not found
     */
    setBackground: function(boardId, backgroundData) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        board.background = new Background(backgroundData);
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return board.background;
    },
    
    /**
     * Remove background from board
     * @param {string} boardId - Board ID
     * @returns {boolean} Success status
     */
    removeBackground: function(boardId) {
        const board = this.getById(boardId);
        if (!board) return false;
        
        board.background = null;
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return true;
    },
    
    /**
     * Set preview image for board
     * @param {string} boardId - Board ID
     * @param {string} imageData - Base64 image data
     * @returns {boolean} Success status
     */
    setPreviewImage: function(boardId, imageData) {
        const board = this.getById(boardId);
        if (!board) return false;
        
        board.previewImage = imageData;
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return true;
    }
};

/**
 * Utility functions
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