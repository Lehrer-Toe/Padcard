/**
 * Data Models and Storage for snapWall
 */

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
     * Alle Boards abrufen
     * @returns {Array} Array von Board-Objekten
     */
    getAll: function() {
        return AppData.boards;
    },
    
    /**
     * Board anhand seiner ID abrufen
     * @param {string} id - Board-ID
     * @returns {Object|null} Board-Objekt oder null, wenn nicht gefunden
     */
    getById: function(id) {
        return AppData.boards.find(board => board.id === id) || null;
    },
    
    /**
     * Boards nach Ordner-ID abrufen
     * @param {string|null} folderId - Ordner-ID oder null für Boards ohne Ordner
     * @returns {Array} Array von Board-Objekten
     */
    getByFolderId: function(folderId) {
        return AppData.boards.filter(board => board.folderId === folderId);
    },
    
    /**
     * Neues Board erstellen
     * @param {string} name - Board-Name
     * @param {string} color - Board-Farbe
     * @param {string|null} folderId - Ordner-ID oder null
     * @returns {Object} Erstelltes Board-Objekt
     */
    create: function(name, color, folderId) {
        const board = new Board(null, name, color, folderId);
        AppData.boards.push(board);
        StorageService.saveAppData();
        return board;
    },
    
    /**
     * Board aktualisieren
     * @param {string} id - Board-ID
     * @param {Object} updates - Objekt mit zu aktualisierenden Eigenschaften
     * @returns {Object|null} Aktualisiertes Board oder null, wenn nicht gefunden
     */
    update: function(id, updates) {
        const board = this.getById(id);
        if (!board) return null;
        
        Object.assign(board, updates);
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return board;
    },
    
    /**
     * Board löschen
     * @param {string} id - Board-ID
     * @returns {boolean} Erfolgsstatus
     */
    delete: function(id) {
        const index = AppData.boards.findIndex(board => board.id === id);
        if (index === -1) return false;
        
        AppData.boards.splice(index, 1);
        StorageService.saveAppData();
        return true;
    },
    
    /**
     * Karte zu Board hinzufügen
     * @param {string} boardId - Board-ID
     * @param {Object} cardData - Kartendaten
     * @returns {Object|null} Erstellte Karte oder null, wenn Board nicht gefunden
     */
    addCard: function(boardId, cardData) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        const card = new Card(cardData);
        if (!board.cards) board.cards = [];
        board.cards.push(card);
        
        // Board-Zeitstempel aktualisieren
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return card;
    },
    
    /**
     * Karte im Board aktualisieren
     * @param {string} boardId - Board-ID
     * @param {string} cardId - Karten-ID
     * @param {Object} updates - Objekt mit zu aktualisierenden Eigenschaften
     * @returns {Object|null} Aktualisierte Karte oder null, wenn nicht gefunden
     */
    updateCard: function(boardId, cardId, updates) {
        const board = this.getById(boardId);
        if (!board || !board.cards) return null;
        
        const cardIndex = board.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return null;
        
        Object.assign(board.cards[cardIndex], updates);
        board.cards[cardIndex].updated = new Date().toISOString();
        
        // Board-Zeitstempel aktualisieren
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return board.cards[cardIndex];
    },
    
    /**
     * Karte aus Board löschen
     * @param {string} boardId - Board-ID
     * @param {string} cardId - Karten-ID
     * @returns {boolean} Erfolgsstatus
     */
    deleteCard: function(boardId, cardId) {
        const board = this.getById(boardId);
        if (!board || !board.cards) return false;
        
        const cardIndex = board.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return false;
        
        board.cards.splice(cardIndex, 1);
        
        // Board-Zeitstempel aktualisieren
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return true;
    },
    
    /**
     * Kategorie zu Board hinzufügen
     * @param {string} boardId - Board-ID
     * @param {string} categoryName - Kategoriename
     * @returns {Object|null} Erstellte Kategorie oder null, wenn Board nicht gefunden
     */
    addCategory: function(boardId, categoryName) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        const category = new Category(null, categoryName);
        if (!board.categories) board.categories = [];
        board.categories.push(category);
        
        // Board-Zeitstempel aktualisieren
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return category;
    },
    
    /**
     * Kategorie im Board aktualisieren
     * @param {string} boardId - Board-ID
     * @param {string} categoryId - Kategorie-ID
     * @param {string} newName - Neuer Kategoriename
     * @returns {Object|null} Aktualisierte Kategorie oder null, wenn nicht gefunden
     */
    updateCategory: function(boardId, categoryId, newName) {
        const board = this.getById(boardId);
        if (!board || !board.categories) return null;
        
        const categoryIndex = board.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex === -1) return null;
        
        board.categories[categoryIndex].name = newName;
        
        // Board-Zeitstempel aktualisieren
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return board.categories[categoryIndex];
    },
    
    /**
     * Kategorie aus Board löschen
     * @param {string} boardId - Board-ID
     * @param {string} categoryId - Kategorie-ID
     * @returns {boolean} Erfolgsstatus
     */
    deleteCategory: function(boardId, categoryId) {
        const board = this.getById(boardId);
        if (!board || !board.categories) return false;
        
        const categoryIndex = board.categories.findIndex(cat => cat.id === categoryId);
        if (categoryIndex === -1) return false;
        
        board.categories.splice(categoryIndex, 1);
        
        // Kategorie von allen Karten entfernen
        if (board.cards) {
            board.cards.forEach(card => {
                if (card.category === categoryId) {
                    card.category = '';
                }
            });
        }
        
        // Board-Zeitstempel aktualisieren
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return true;
    },
    
    /**
     * Board-Hintergrund festlegen
     * @param {string} boardId - Board-ID
     * @param {Object} backgroundData - Hintergrunddaten
     * @returns {Object|null} Aktualisiertes Board oder null, wenn nicht gefunden
     */
    setBackground: function(boardId, backgroundData) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        board.background = new Background(backgroundData);
        
        // Board-Zeitstempel aktualisieren
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return board;
    },
    
    /**
     * Board-Hintergrund entfernen
     * @param {string} boardId - Board-ID
     * @returns {Object|null} Aktualisiertes Board oder null, wenn nicht gefunden
     */
    removeBackground: function(boardId) {
        const board = this.getById(boardId);
        if (!board) return null;
        
        board.background = null;
        
        // Board-Zeitstempel aktualisieren
        board.updated = new Date().toISOString();
        
        StorageService.saveAppData();
        return board;
    }
};