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
        localStorage.setItem(AppConfig.localStorageKey, JSON.stringify({
            folders: AppData.folders,
            boards: AppData.boards,
            studentMode: AppData.studentMode
        }));
    },
    
    /**
     * Load application data from localStorage
     */
    loadAppData: function() {
        const savedData = localStorage.getItem(AppConfig.localStorageKey) || 
                          localStorage.getItem(AppConfig.legacyStorageKey);
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
    },

    /**
     * Exportiert eine Offline-Version eines Boards
     * @param {string} boardId - Board-ID
     * @returns {boolean} Erfolg
     */
    exportOfflineVersion: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return null;
        
        // Erstelle ein eigenständiges JSON-Objekt mit allen notwendigen Daten
        const exportData = {
            board: board,
            studentMode: true,
            exportDate: new Date().toISOString(),
            version: AppConfig.version
        };
        
        // JSON in String umwandeln
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // HTML-Template für Offline-Version erstellen
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${board.name} - snapWall Offline</title>
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        /* Basis-Styles */
        body, html {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            background-color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .logo {
            font-weight: bold;
            color: #2196F3;
            font-size: 24px;
        }
        
        .board-title {
            font-size: 28px;
            margin-bottom: 20px;
        }
        
        .cards-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .card {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            border: 1px solid #e0e0e0;
        }
        
        .card-content {
            padding: 15px;
        }
        
        .card-title {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .card-text {
            line-height: 1.5;
        }
        
        /* Kartentypen */
        .card-image img {
            max-width: 100%;
            display: block;
        }
        
        .card-youtube iframe {
            width: 100%;
            height: 200px;
            border: none;
        }
        
        /* Farbklassen für Karten */
        .card-red { background-color: #ffebee; border-color: #f44336; border-width: 2px; }
        .card-blue { background-color: #e3f2fd; border-color: #2196F3; border-width: 2px; }
        .card-green { background-color: #e8f5e9; border-color: #4CAF50; border-width: 2px; }
        .card-yellow { background-color: #fffde7; border-color: #FFEB3B; border-width: 2px; }
        .card-orange { background-color: #fff3e0; border-color: #FF9800; border-width: 2px; }
        .card-purple { background-color: #f3e5f5; border-color: #9C27B0; border-width: 2px; }
        .card-pink { background-color: #FCE4EC; border-color: #E91E63; border-width: 2px; }
        
        /* Offline-Hinweis */
        .offline-notice {
            background-color: #e0f7fa;
            padding: 10px 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">snapWall Offline</div>
        <div>Schülermodus</div>
    </div>
    
    <div class="container">
        <div class="offline-notice">
            <i class="fas fa-info-circle"></i>
            <span>Dies ist eine Offline-Version des Boards "${board.name}". Einige Funktionen sind möglicherweise eingeschränkt.</span>
        </div>
        
        <h1 class="board-title">${board.name}</h1>
        
        <div class="cards-container" id="cardsContainer">
            <!-- Karten werden per JavaScript eingefügt -->
        </div>
    </div>

    <script>
        // Board-Daten aus JSON laden
        const boardData = ${jsonData};
        
        // Dokument laden
        document.addEventListener('DOMContentLoaded', function() {
            renderCards();
        });
        
        // Karten rendern
        function renderCards() {
            const container = document.getElementById('cardsContainer');
            const cards = boardData.board.cards || [];
            
            cards.forEach(card => {
                // Kartenklassen bestimmen
                let cardClasses = 'card';
                if (card.color) {
                    cardClasses += ' card-' + card.color;
                }
                
                // Karten-HTML erstellen
                let cardHTML = \`
                    <div class="\${cardClasses}">
                        <div class="card-content">
                            <div class="card-title">\${card.title}</div>
                            <div class="card-text">\${card.content || ''}</div>
                \`;
                
                // Kartentyp-spezifischen Inhalt hinzufügen
                if (card.type === 'image' && (card.imageUrl || card.imageData)) {
                    const imgSrc = card.imageData || card.imageUrl;
                    cardHTML += \`
                        <div class="card-image">
                            <img src="\${imgSrc}" alt="\${card.title}">
                        </div>
                    \`;
                } else if (card.type === 'youtube' && card.youtubeId) {
                    cardHTML += \`
                        <div class="card-youtube">
                            <iframe src="https://www.youtube.com/embed/\${card.youtubeId}" 
                                    allowfullscreen="true"
                                    frameborder="0">
                            </iframe>
                        </div>
                    \`;
                }
                
                // Karte abschließen
                cardHTML += \`
                        </div>
                    </div>
                \`;
                
                // Zur Container hinzufügen
                container.innerHTML += cardHTML;
            });
        }
    </script>
</body>
</html>`;

        // Blob erstellen und als Datei herunterladen
        const blob = new Blob([htmlTemplate], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${board.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_offline.html`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
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
        const deletedFolder = AppData.folders[index];
        AppData.folders.splice(index, 1);
        
        // Update boards that were in this folder (set folderId to null)
        AppData.boards.forEach(board => {
            if (board.folderId === id) {
                board.folderId = null;
            }
        });
        
        // Update child folders (set parentId to null or parent's parent)
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

/**
 * Data Access Object for Boards
 */
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