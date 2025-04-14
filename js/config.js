/**
 * Konfiguration und globale Variablen für snapWall
 */

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

// Application data store
const AppData = {
    folders: [],         // Array of folder objects
    boards: [],          // Array of board objects
    currentBoard: null,  // Aktuelles, aktives Board
    currentFolder: null, // Aktueller, aktiver Ordner
    view: 'home',        // Aktuelle Ansicht (home, folder, board)
    studentMode: false   // Schülermodus-Flag
};
