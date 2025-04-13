/**
 * Data Models and Storage für Taskcard-Manager
 *
 * Dieses File enthält die Datenstrukturen und die Speicherlogik der Anwendung.
 */

// Anwendungsspezifische Daten
const AppData = {
    folders: [],         // Array aus Folder-Objekten
    boards: [],          // Array aus Board-Objekten
    currentBoard: null,  // Aktive Pinnwand
    currentFolder: null, // Aktiver Ordner
    view: 'home',        // Aktuelle Ansicht (home, folder, board)
    studentMode: false   // Schülermodus
};

// Standard-Farbpaletten
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

// Modelle
class Folder {
    constructor(id, name, color, parentId) {
        this.id = id || `folder-${Date.now()}`;
        this.name = name || 'Neuer Ordner';
        this.color = color || '#2196F3';
        this.parentId = parentId || null;
        this.thumbnail = null; 
        this.created = new Date().toISOString();
        this.updated = this.created;
    }
}

class Board {
    constructor(id, name, color, folderId) {
        this.id = id || `board-${Date.now()}`;
        this.name = name || 'Neue Pinnwand';
        this.color = color || '#4CAF50';
        this.folderId = folderId || null;
        this.cards = [];
        this.categories = [];
        this.layout = 3;
        this.view = 'grid';
        this.background = null;
        this.thumbnail = null;
        this.created = new Date().toISOString();
        this.updated = this.created;
    }
}

class Card {
    constructor(options = {}) {
        this.id = options.id || `card-${Date.now()}`;
        this.title = options.title || 'Neue Karte';
        this.content = options.content || '';
        this.type = options.type || 'text';
        this.color = options.color || 'blue';
        this.customColor = options.customColor || '';
        this.width = options.width || 1;
        this.height = options.height || 1;
        this.category = options.category || '';
        this.position = options.position || null; 
        this.size = options.size || null; 
        this.thumbnail = options.thumbnail || null;
        this.created = new Date().toISOString();
        this.updated = this.created;
        
        // Typabhängige Felder
        if (this.type === 'youtube') {
            this.youtubeId = options.youtubeId || '';
        } else if (this.type === 'image') {
            this.imageUrl = options.imageUrl || '';
            this.imageData = options.imageData || null;
        } else if (this.type === 'link') {
            this.linkUrl = options.linkUrl || '';
        } else if (this.type === 'learningapp') {
            this.learningappId = options.learningappId || '';
        } else if (this.type === 'audio') {
            this.audioUrl = options.audioUrl || '';
            this.audioData = options.audioData || null;
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
        this.data = options.data || null;
        this.style = options.style || 'cover'; 
        this.opacity = options.opacity || 100; 
    }
}

/**
 * Speicher-Service zum Laden und Sichern der Anwendungsdaten
 */
const StorageService = {
    /**
     * Speichert die Anwendungsdaten in localStorage
     */
    saveAppData: function() {
        localStorage.setItem('taskcard-manager-data', JSON.stringify({
            folders: AppData.folders,
            boards: AppData.boards,
            studentMode: AppData.studentMode
        }));
    },
    
    /**
     * Lädt die Anwendungsdaten aus localStorage
     */
    loadAppData: function() {
        const savedData = localStorage.getItem('taskcard-manager-data');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                
                AppData.folders = parsedData.folders || [];
                AppData.boards = parsedData.boards || [];
                AppData.studentMode = parsedData.studentMode || false;
                
                return true;
            } catch (error) {
                console.error('Fehler beim Parsen der gespeicherten Daten:', error);
                return false;
            }
        }
        return false;
    },
    
    /**
     * Erstellt Beispieldaten, falls noch keine existieren
     */
    initDefaultData: function() {
        // Beispielordner
        AppData.folders = [
            new Folder('folder-1', 'Fächer', '#9c27b0'),
            new Folder('folder-2', 'Projekte', '#2196F3')
        ];
        
        // Unterordner
        AppData.folders.push(new Folder('folder-3', 'Deutsch', '#f44336', 'folder-1'));
        AppData.folders.push(new Folder('folder-4', 'Mathematik', '#4CAF50', 'folder-1'));
        
        // Weitere Unterordner
        AppData.folders.push(new Folder('folder-5', 'Klasse 9', '#00bcd4', 'folder-3'));
        AppData.folders.push(new Folder('folder-6', 'Klasse 10', '#FFEB3B', 'folder-3'));
        
        // Noch tieferes Unterordner-Beispiel
        AppData.folders.push(new Folder('folder-7', 'Thema Argumentation', '#FF9800', 'folder-5'));
        
        // Beispiel-Pinnwände
        AppData.boards = [
            new Board('board-1', 'Grammatik', '#f44336', 'folder-3'),
            new Board('board-2', 'Literatur', '#4CAF50', 'folder-3'),
            new Board('board-3', 'Projektplanung', '#FF9800', 'folder-2'),
            new Board('board-4', 'Notizen', '#2196F3')
        ];
        
        // Speichern
        this.saveAppData();
    },
    
    /**
     * Exportiert alle Daten als JSON
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
        a.download = `taskcard-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    },
    
    /**
     * Importiert Daten aus einer JSON-Struktur
     */
    importData: function(data) {
        if (!data || !Array.isArray(data.folders) || !Array.isArray(data.boards)) {
            return false;
        }
        AppData.folders = data.folders;
        AppData.boards = data.boards;
        this.saveAppData();
        return true;
    }
};

/**
 * Datenzugriffsmethoden (DAO) für Ordner
 */
const FolderDAO = {
    getAll: function() {
        return AppData.folders;
    },
    getById: function(id) {
        return AppData.folders.find(folder => folder.id === id) || null;
    },
    getByParentId: function(parentId) {
        return AppData.folders.filter(folder => folder.parentId === parentId);
    },
    getParent: function(id) {
        const folder = this.getById(id);
        if (!folder || !folder.parentId) return null;
        return this.getById(folder.parentId);
    },
    getPath: function(id) {
        const path = [];
        let currentFolder = this.getById(id);
        while (currentFolder) {
            path.unshift(currentFolder);
            currentFolder = this.getParent(currentFolder.id);
        }
        return path;
    },
    create: function(name, color, parentId) {
        const folder = new Folder(null, name, color, parentId);
        AppData.folders.push(folder);
        StorageService.saveAppData();
        return folder;
    },
    update: function(id, updates) {
        const folder = this.getById(id);
        if (!folder) return null;
        Object.assign(folder, updates);
        folder.updated = new Date().toISOString();
        StorageService.saveAppData();
        return folder;
    },
    delete: function(id) {
        const index = AppData.folders.findIndex(folder => folder.id === id);
        if (index === -1) return false;
        
        // Alle Unterordner ermitteln
        const allSubfolderIds = this.getAllSubfolderIds(id);
        
        // Entfernen des Ordners und aller Unterordner
        AppData.folders = AppData.folders.filter(folder => 
            folder.id !== id && !allSubfolderIds.includes(folder.id)
        );
        
        // Pinnwände, die in diesen Ordnern waren, auf root setzen
        AppData.boards.forEach(board => {
            if (board.folderId === id || allSubfolderIds.includes(board.folderId)) {
                board.folderId = null;
            }
        });
        
        StorageService.saveAppData();
        return true;
    },
    getAllSubfolderIds: function(folderId) {
        let subfolders = this.getByParentId(folderId);
        let allIds = [];
        subfolders.forEach(subfolder => {
            allIds.push(subfolder.id);
            allIds = allIds.concat(this.getAllSubfolderIds(subfolder.id));
        });
        return allIds;
    },
    setThumbnail: function(folderId, thumbnailData) {
        const folder = this.getById(folderId);
        if (!folder) return;
        folder.thumbnail = thumbnailData;
        folder.updated = new Date().toISOString();
        StorageService.saveAppData();
    }
};

/**
 * DAO für Pinnwände
 */
const BoardDAO = {
    getAll: function() {
        return AppData.boards;
    },
    getById: function(id) {
        return AppData.boards.find(board => board.id === id) || null;
    },
    getByFolderId: function(folderId) {
        return AppData.boards.filter(board => board.folderId === folderId);
    },
    create: function(name, color, folderId) {
        const board = new Board(null, name, color, folderId);
        AppData.boards.push(board);
        StorageService.saveAppData();
        return board;
    },
    update: function(id, updates) {
        const board = this.getById(id);
        if (!board) return null;
        Object.assign(board, updates);
        board.updated = new Date().toISOString();
        StorageService.saveAppData();
        return board;
    },
    delete: function(id) {
        const index = AppData.boards.findIndex(board => board.id === id);
        if (index === -1) return false;
        AppData.boards.splice(index, 1);
        StorageService.saveAppData();
        return true;
    },
    setThumbnail: function(boardId, thumbnailData) {
        const board = this.getById(boardId);
        if (!board) return;
        board.thumbnail = thumbnailData;
        board.updated = new Date().toISOString();
        StorageService.saveAppData();
    }
};

/**
 * DAO für Karten
 */
const CardDAO = {
    create: function(boardId, cardOptions) {
        const board = BoardDAO.getById(boardId);
        if (!board) return null;
        const card = new Card(cardOptions);
        board.cards.push(card);
        board.updated = new Date().toISOString();
        StorageService.saveAppData();
        return card;
    },
    update: function(boardId, cardId, updates) {
        const board = BoardDAO.getById(boardId);
        if (!board) return null;
        const card = board.cards.find(c => c.id === cardId);
        if (!card) return null;
        Object.assign(card, updates);
        card.updated = new Date().toISOString();
        board.updated = card.updated;
        StorageService.saveAppData();
        return card;
    },
    delete: function(boardId, cardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return false;
        const index = board.cards.findIndex(c => c.id === cardId);
        if (index === -1) return false;
        board.cards.splice(index, 1);
        board.updated = new Date().toISOString();
        StorageService.saveAppData();
        return true;
    }
};

/**
 * DAO für Kategorien
 */
const CategoryDAO = {
    create: function(boardId, name) {
        const board = BoardDAO.getById(boardId);
        if (!board) return null;
        const category = new Category(null, name);
        board.categories.push(category);
        board.updated = new Date().toISOString();
        StorageService.saveAppData();
        return category;
    },
    update: function(boardId, categoryId, newName) {
        const board = BoardDAO.getById(boardId);
        if (!board) return null;
        const category = board.categories.find(cat => cat.id === categoryId);
        if (!category) return null;
        category.name = newName;
        board.updated = new Date().toISOString();
        StorageService.saveAppData();
        return category;
    },
    delete: function(boardId, categoryId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return false;
        const index = board.categories.findIndex(cat => cat.id === categoryId);
        if (index === -1) return false;
        board.categories.splice(index, 1);
        board.updated = new Date().toISOString();
        StorageService.saveAppData();
        return true;
    }
};
