/**
 * Data Models and Storage for snapWall
 */

// Data Models
class Folder {
    constructor(id, name, color, parentId) {
        this.id = id || `folder-${Date.now()}`;
        this.name = name || 'Neuer Ordner';
        this.color = color || '#2196F3';
        this.parentId = (typeof parentId !== 'undefined') ? parentId : null;
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
        this.textAlignment = options.textAlignment || 'left';
        this.fontSize = options.fontSize || 'normal';
        this.textColors = options.textColors || {};
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
        
        // Type-spezifische Eigenschaften
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
 * Storage Service for persisting data
 */
const StorageService = {
    saveAppData: function() {
        localStorage.setItem('snapwall-data', JSON.stringify({
            folders: AppData.folders,
            boards: AppData.boards,
            studentMode: AppData.studentMode
        }));
    },
    
    loadAppData: function() {
        const savedData = localStorage.getItem('snapwall-data') || localStorage.getItem('taskcard-manager-data');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                AppData.folders = parsedData.folders || [];
                AppData.boards = parsedData.boards || [];
                AppData.studentMode = parsedData.studentMode || false;
                
                AppData.folders.forEach(folder => {
                    if (typeof folder.parentId === 'undefined') {
                        folder.parentId = null;
                    }
                });
                
                AppData.boards.forEach(board => {
                    if (board.cards) {
                        board.cards.forEach(card => {
                            if (typeof card.textAlignment === 'undefined') card.textAlignment = 'left';
                            if (typeof card.fontSize === 'undefined') card.fontSize = 'normal';
                            if (typeof card.textColors === 'undefined') card.textColors = {};
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
    
    initDefaultData: function() {
        AppData.folders = [
            new Folder('folder-1', 'Fächer', '#9c27b0'),
            new Folder('folder-2', 'Projekte', '#2196F3'),
            new Folder('folder-3', 'Unterordner', '#4CAF50', 'folder-2')
        ];
        
        AppData.boards = [
            new Board('board-1', 'Deutsch', '#f44336', 'folder-1'),
            new Board('board-2', 'Mathematik', '#4CAF50', 'folder-1'),
            new Board('board-3', 'Projektplanung', '#FF9800', 'folder-2'),
            new Board('board-4', 'Notizen', '#2196F3')
        ];
        
        this.saveAppData();
    },
    
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
    
    importData: function(data) {
        if (!data || !Array.isArray(data.folders) || !Array.isArray(data.boards)) {
            return false;
        }
        AppData.folders = data.folders;
        AppData.boards = data.boards;
        AppData.folders.forEach(folder => {
            if (typeof folder.parentId === 'undefined') {
                folder.parentId = null;
            }
        });
        AppData.boards.forEach(board => {
            if (board.cards) {
                board.cards.forEach(card => {
                    if (typeof card.textAlignment === 'undefined') card.textAlignment = 'left';
                    if (typeof card.fontSize === 'undefined') card.fontSize = 'normal';
                    if (typeof card.textColors === 'undefined') card.textColors = {};
                });
            }
        });
        this.saveAppData();
        return true;
    }
};

const FolderDAO = {
    getAll: function() {
        return AppData.folders;
    },
    getRootFolders: function() {
        return AppData.folders.filter(folder => !folder.parentId);
    },
    getById: function(folderId) {
        return AppData.folders.find(folder => folder.id === folderId);
    },
    create: function(name, color) {
        const folder = new Folder(null, name, color);
        AppData.folders.push(folder);
        StorageService.saveAppData();
        return folder;
    },
    update: function(folderId, data) {
        let folder = this.getById(folderId);
        if (folder) {
            folder.name = data.name;
            folder.color = data.color;
            folder.updated = new Date().toISOString();
            StorageService.saveAppData();
        }
    },
    delete: function(folderId) {
        AppData.folders = AppData.folders.filter(folder => folder.id !== folderId);
        StorageService.saveAppData();
    }
};

const BoardDAO = {
    getAll: function() {
        return AppData.boards;
    },
    getById: function(boardId) {
        return AppData.boards.find(board => board.id === boardId);
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
    update: function(boardId, data) {
        let board = this.getById(boardId);
        if (board) {
            board.name = data.name;
            board.color = data.color;
            board.folderId = data.folderId;
            board.updated = new Date().toISOString();
            StorageService.saveAppData();
        }
    },
    delete: function(boardId) {
        AppData.boards = AppData.boards.filter(board => board.id !== boardId);
        StorageService.saveAppData();
    }
};
