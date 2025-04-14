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
    ],
    card: [
        { name: 'red', color: '#f44336' },
        { name: 'pink', color: '#E91E63' },
        { name: 'purple', color: '#9C27B0' },
        { name: 'deep-purple', color: '#673AB7' },
        { name: 'indigo', color: '#3F51B5' },
        { name: 'blue', color: '#2196F3' },
        { name: 'light-blue', color: '#03A9F4' },
        { name: 'cyan', color: '#00BCD4' },
        { name: 'teal', color: '#009688' },
        { name: 'green', color: '#4CAF50' },
        { name: 'light-green', color: '#8BC34A' },
        { name: 'lime', color: '#CDDC39' },
        { name: 'yellow', color: '#FFEB3B' },
        { name: 'amber', color: '#FFC107' },
        { name: 'orange', color: '#FF9800' },
        { name: 'deep-orange', color: '#FF5722' },
        { name: 'brown', color: '#795548' },
        { name: 'grey', color: '#9E9E9E' },
        { name: 'blue-grey', color: '#607D8B' }
    ]
};

// Application data store
const AppData = {
    folders: [],         // Array of folder objects
    boards: [],          // Array of board objects
    currentBoard: null,  // Current active board
    currentFolder: null, // Current active folder
    view: 'home',        // Current view (home, folder, board)
    studentMode: false   // Student mode flag
};

// Anwendungskonfiguration
const AppConfig = {
    appName: 'snapWall',
    version: '1.0.0',
    localStorageKey: 'snapwall-data',
    legacyStorageKey: 'taskcard-manager-data',
    maxUploadsSize: 5 * 1024 * 1024, // 5MB max upload size
    supportedFileTypes: {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
        audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'],
        document: ['application/pdf', 'text/plain']
    }
};

// Fehlermeldungen und Texte
const AppMessages = {
    errors: {
        folderTitleRequired: 'Bitte gib einen Titel für den Ordner ein.',
        boardTitleRequired: 'Bitte gib einen Titel für den Snap ein.',
        cardTitleRequired: 'Bitte gib einen Titel für die Karte ein.',
        invalidYoutubeUrl: 'Bitte gib eine gültige YouTube-URL ein.',
        invalidLearningappUrl: 'Bitte gib eine gültige LearningApp-URL oder ID ein.',
        imageRequired: 'Bitte gib eine Bild-URL ein oder lade ein Bild hoch.',
        linkRequired: 'Bitte gib eine Link-URL ein.',
        audioRequired: 'Bitte gib eine Audio-URL ein oder lade eine Audio-Datei hoch.',
        backgroundRequired: 'Bitte gib eine URL ein oder lade ein Bild hoch.',
        cyclicReference: 'Der ausgewählte übergeordnete Ordner kann nicht ein Unterordner des aktuellen Ordners sein.',
        importInvalid: 'Die importierte Datei enthält keine gültigen Daten.',
        importError: 'Fehler beim Importieren: Ungültiges Dateiformat.'
    },
    confirmations: {
        deleteFolder: 'Möchtest du den Ordner "{0}" wirklich löschen? Die Snaps bleiben erhalten.',
        deleteBoard: 'Möchtest du den Snap "{0}" wirklich löschen? Alle Karten werden ebenfalls gelöscht.',
        deleteCard: 'Möchtest du diese Karte wirklich löschen?',
        deleteCategory: 'Möchtest du die Kategorie "{0}" wirklich löschen? Die Karten werden nicht gelöscht, sondern nur aus der Kategorie entfernt.',
        importData: 'Möchtest du die aktuellen Daten mit den importierten ersetzen? Alle vorhandenen Daten werden überschrieben.'
    },
    success: {
        importSuccess: 'Daten erfolgreich importiert.',
        shareLinkCopied: 'Link in die Zwischenablage kopiert!'
    }
};