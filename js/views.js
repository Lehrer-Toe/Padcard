/**
 * Views für snapWall
 * 
 * Diese Datei enthält die gesamte Rendering-Logik für die Anwendung.
 */

const Views = {
    /**
     * Initialisiert alle Views
     */
    init: function() {
        this.initColorPickers();
        this.initSidebar();
    },
    
    /**
     * Initialisiert die Sidebar-Funktionalität
     */
    initSidebar: function() {
        // Sidebar-Menü-Items Klick-Handler
        $('#menuLatestActivity').on('click', () => this.renderLatestActivitiesView());
        $('#menuMySnaps').on('click', () => this.renderMyPadcardsView());
        $('#menuFavorites').on('click', () => this.renderFavoritesView());
        $('#menuTrash').on('click', () => this.renderTrashView());
        
        // Sidebar-Toggle
        $('#sidebarToggle').on('click', () => {
            $('#sidebar').toggleClass('collapsed');
        });
        
        // Folder-List initiieren
        this.renderFolderList();
    },
    
    /**
     * Initialisiert die Farbauswahl
     */
    initColorPickers: function() {
        // Ordner-Farbauswahl
        const folderColorPicker = $('#folderColorPicker');
        folderColorPicker.empty();
        
        DefaultColors.folder.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.color};" data-color="${color.color}"></div>`);
            folderColorPicker.append(colorOption);
            
            colorOption.on('click', function() {
                folderColorPicker.find('.color-option').removeClass('active');
                $(this).addClass('active');
            });
        });
        
        // Erste Farbe standardmäßig auswählen
        folderColorPicker.find('.color-option').first().addClass('active');
        
        // Board-Farbauswahl als Reihe
        const boardColorPickerRow = $('#boardColorPickerRow');
        boardColorPickerRow.empty();
        
        DefaultColors.board.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.color};" data-color="${color.color}"></div>`);
            boardColorPickerRow.append(colorOption);
            
            colorOption.on('click', function() {
                boardColorPickerRow.find('.color-option').removeClass('active');
                $(this).addClass('active');
            });
        });
        
        // Erste Farbe standardmäßig auswählen
        boardColorPickerRow.find('.color-option').first().addClass('active');
        
        // Karten-Farbauswahl
        this.initCardColorPickers();
    },
    
    /**
     * Initialisiert die Karten-Farbauswahl
     */
    initCardColorPickers: function() {
        // Karten-Farbauswahl als Reihe
        const cardColorPickerRow = $('#cardColorPickerRow');
        cardColorPickerRow.empty();
        
        DefaultColors.card.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.color};" data-color="${color.name}"></div>`);
            cardColorPickerRow.append(colorOption);
        });
        
        // Farbenauswahl Event-Handler
        cardColorPickerRow.on('click', '.color-option', function() {
            cardColorPickerRow.find('.color-option').removeClass('active');
            $(this).addClass('active');
            
            // Vorschau aktualisieren
            const color = $(this).css('backgroundColor');
            $('#cardColorPreview').css('backgroundColor', color);
        });
        
        // Standardfarbe auswählen
        cardColorPickerRow.find('.color-option[data-color="blue"]').addClass('active');
        
        // RGB-Farbe und Vorschau
        $('#cardRgbColor').on('change', function() {
            $('#cardColorPreview').css('backgroundColor', $(this).val());
            // Deaktiviere alle anderen Farben
            cardColorPickerRow.find('.color-option').removeClass('active');
        });
        
        // Vorschau mit Standardwert initialisieren
        $('#cardColorPreview').css('backgroundColor', '#2196F3');
    },
    
    /**
     * Rendert die Seitenleisten-Ordnerliste
     */
    renderFolderList: function() {
        const folderList = $('#folderList');
        folderList.empty();
        
        // Rekursive Funktion zum Rendern von Ordnern und Unterordnern
        const renderFolders = (parentId, level) => {
            // Alle direkten Kinder dieses Elternordners holen
            const folders = parentId ? 
                FolderDAO.getChildFolders(parentId) : 
                FolderDAO.getRootFolders();
            
            // Alphabetisch sortieren
            folders.sort((a, b) => a.name.localeCompare(b.name));
            
            // Ordnerelemente erstellen
            folders.forEach(folder => {
                const hasChildren = FolderDAO.getChildFolders(folder.id).length > 0;
                const className = level > 0 ? 'subfolder-item' : '';
                
                const folderElement = $(`
                    <div class="folder-item ${className}" data-id="${folder.id}" style="padding-left: ${20 + level * 20}px;">
                        <div class="folder-icon" style="color: ${folder.color};">
                            <i class="fas fa-folder"></i>
                        </div>
                        <div class="folder-name">${folder.name}</div>
                        <div class="folder-actions">
                            <i class="fas fa-edit" data-action="edit"></i>
                            <i class="fas fa-trash" data-action="delete"></i>
                        </div>
                    </div>
                `);
                
                // Ordner öffnen bei Klick
                folderElement.on('click', function(e) {
                    if (!$(e.target).closest('.folder-actions').length) {
                        const folderId = $(this).data('id');
                        Controllers.openFolder(folderId);
                        
                        // Aktiv-Klasse setzen
                        $('.folder-item').removeClass('active');
                        $(this).addClass('active');
                        
                        // Menü-Items deaktivieren
                        $('.sidebar-item').removeClass('active');
                    }
                });
                
                // Ordner-Aktionen
                folderElement.find('.folder-actions i').on('click', function(e) {
                    e.stopPropagation();
                    const action = $(this).data('action');
                    const folderId = $(this).closest('.folder-item').data('id');
                    
                    if (action === 'edit') {
                        Controllers.editFolder(folderId);
                    } else if (action === 'delete') {
                        Controllers.deleteFolder(folderId);
                    }
                });
                
                folderList.append(folderElement);
                
                // Rekursiver Aufruf für Unterordner
                if (hasChildren) {
                    renderFolders(folder.id, level + 1);
                }
            });
        };
        
        // Beginne mit Root-Ordnern (ohne Parent)
        renderFolders(null, 0);
    },
    
    /**
     * Rendert die "Neueste Aktivitäten"-Ansicht (Startseite)
     */
    renderLatestActivitiesView: function() {
        // Andere Ansichten ausblenden und Home-Ansicht anzeigen
        $('#folder-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#latest-activities-view').removeClass('hidden');
        
        // Seitentitel aktualisieren
        $('#pageTitle').text('Neueste Aktivitäten');
        
        // Sidebar-Menü aktualisieren
        $('.sidebar-item').removeClass('active');
        $('#menuLatestActivity').addClass('active');
        $('.folder-item').removeClass('active');
        
        // Aktivitäten-Container leeren
        const activityContainer = $('#activityContainer');
        activityContainer.empty();
        
        // "Neu erstellen"-Karte hinzufügen
        if (!AppData.studentMode) {
            const createCard = $(`
                <div class="create-padlet-card">
                    <div class="create-padlet-icon">
                        <i class="fas fa-plus-circle"></i>
                    </div>
                    <div class="create-padlet-text">Einen Snap erstellen</div>
                </div>
            `);
            
            createCard.on('click', function() {
                Controllers.createBoard();
            });
            
            activityContainer.append(createCard);
        }
        
        // Alle Boards abrufen
        const boards = BoardDAO.getAll();
        
        // Wenn keine Boards vorhanden sind
        if (boards.length === 0) {
            if (AppData.studentMode) {
                activityContainer.append(`
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-clipboard"></i>
                        </div>
                        <div class="empty-state-text">Keine Snaps vorhanden</div>
                    </div>
                `);
            }
            return;
        }
        
        // Nach Datum sortieren (neueste zuerst)
        boards.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        
        // Boards als Karten rendern
        boards.forEach(board => {
            // Board-Karte erstellen
            const boardCard = this.createSnapCard(board);
            
            // Klick-Handler hinzufügen
            boardCard.on('click', function(e) {
                if (!$(e.target).closest('.padlet-menu').length) {
                    Controllers.openBoard(board.id);
                }
            });
            
            activityContainer.append(boardCard);
        });
        
        AppData.view = 'home';
        AppData.currentFolder = null;
        AppData.currentBoard = null;
        
        // Event-Handler für Erstellen-Button
        $('#createNewBtn').on('click', function() {
            Controllers.createBoard();
        });
    },
    
    /**
     * Rendert die "Von mir erstellt"-Ansicht
     */
    renderMyPadcardsView: function() {
        // Andere Ansichten ausblenden und Home-Ansicht anzeigen
        $('#folder-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#latest-activities-view').removeClass('hidden');
        
        // Seitentitel aktualisieren
        $('#pageTitle').text('Von mir erstellt');
        
        // Sidebar-Menü aktualisieren
        $('.sidebar-item').removeClass('active');
        $('#menuMySnaps').addClass('active');
        $('.folder-item').removeClass('active');
        
        // Aktivitäten-Container leeren
        const activityContainer = $('#activityContainer');
        activityContainer.empty();
        
        // "Neu erstellen"-Karte hinzufügen
        if (!AppData.studentMode) {
            const createCard = $(`
                <div class="create-padlet-card">
                    <div class="create-padlet-icon">
                        <i class="fas fa-plus-circle"></i>
                    </div>
                    <div class="create-padlet-text">Einen Snap erstellen</div>
                </div>
            `);
            
            createCard.on('click', function() {
                Controllers.createBoard();
            });
            
            activityContainer.append(createCard);
        }
        
        // Alle Boards abrufen, die nicht in einem Ordner sind
        const boards = BoardDAO.getByFolderId(null);
        
        // Wenn keine Boards vorhanden sind
        if (boards.length === 0) {
            if (AppData.studentMode) {
                activityContainer.append(`
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-clipboard"></i>
                        </div>
                        <div class="empty-state-text">Keine Snaps vorhanden</div>
                    </div>
                `);
            }
            return;
        }
        
        // Sortieren
        const sortOrder = $('.sort-option.active').data('sort') || 'name';
        this.sortBoards(boards, sortOrder);
        
        // Boards als Karten rendern
        boards.forEach(board => {
            // Board-Karte erstellen
            const boardCard = this.createSnapCard(board);
            
            // Klick-Handler hinzufügen
            boardCard.on('click', function(e) {
                if (!$(e.target).closest('.padlet-menu').length) {
                    Controllers.openBoard(board.id);
                }
            });
            
            activityContainer.append(boardCard);
        });
        
        AppData.view = 'home';
        AppData.currentFolder = null;
        AppData.currentBoard = null;
        
        // Event-Handler für Erstellen-Button
        $('#createNewBtn').on('click', function() {
            Controllers.createBoard();
        });
    },
    
    /**
     * Rendert die "Favoriten"-Ansicht (Dummy-Implementierung)
     */
    renderFavoritesView: function() {
        // Andere Ansichten ausblenden und Home-Ansicht anzeigen
        $('#folder-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#latest-activities-view').removeClass('hidden');
        
        // Seitentitel aktualisieren
        $('#pageTitle').text('Favoriten');
        
        // Sidebar-Menü aktualisieren
        $('.sidebar-item').removeClass('active');
        $('#menuFavorites').addClass('active');
        $('.folder-item').removeClass('active');
        
        // Aktivitäten-Container leeren
        const activityContainer = $('#activityContainer');
        activityContainer.empty();
        
        // Hinweis anzeigen
        activityContainer.append(`
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="empty-state-text">Diese Funktion ist noch nicht implementiert.</div>
            </div>
        `);
        
        AppData.view = 'home';
        AppData.currentFolder = null;
        AppData.currentBoard = null;
    },
    
    /**
     * Rendert die "Papierkorb"-Ansicht (Dummy-Implementierung)
     */
    renderTrashView: function() {
        // Andere Ansichten ausblenden und Home-Ansicht anzeigen
        $('#folder-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#latest-activities-view').removeClass('hidden');
        
        // Seitentitel aktualisieren
        $('#pageTitle').text('Papierkorb');
        
        // Sidebar-Menü aktualisieren
        $('.sidebar-item').removeClass('active');
        $('#menuTrash').addClass('active');
        $('.folder-item').removeClass('active');
        
        // Aktivitäten-Container leeren
        const activityContainer = $('#activityContainer');
        activityContainer.empty();
        
        // Hinweis anzeigen
        activityContainer.append(`
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-trash"></i>
                </div>
                <div class="empty-state-text">Diese Funktion ist noch nicht implementiert.</div>
            </div>
        `);
        
        AppData.view = 'home';
        AppData.currentFolder = null;
        AppData.currentBoard = null;
    },
    
    /**
     * Erstellt eine Snap-Karte (ehemals Padlet-Karte)
     * @param {Object} board - Board-Objekt
     * @returns {jQuery} Die erstellte Snap-Karte
     */
    createSnapCard: function(board) {
        // Kartenanzahl
        const cardCount = board.cards ? board.cards.length : 0;
        
        // Datum formatieren
        const updatedDate = Utils.formatDate(board.updated);
        
        // Bestimmen, ob Board in einem Ordner ist
        const folder = board.folderId ? FolderDAO.getById(board.folderId) : null;
        
        const padletCard = $(`
            <div class="padlet-card" data-id="${board.id}">
                <div class="padlet-preview" style="background-color: ${board.color}">
                    <div class="padlet-preview-bg"></div>
                </div>
                <div class="padlet-content">
                    <div class="padlet-header">
                        <div class="padlet-title">${board.name}</div>
                        <div class="padlet-menu">
                            <div class="padlet-menu-trigger">
                                <i class="fas fa-ellipsis-v"></i>
                            </div>
                            <div class="padlet-menu-dropdown">
                                <div class="padlet-menu-item" data-action="edit">
                                    <i class="fas fa-edit"></i> Bearbeiten
                                </div>
                                <div class="padlet-menu-item" data-action="move">
                                    <i class="fas fa-folder"></i> In Ordner verschieben
                                </div>
                                <div class="padlet-menu-item" data-action="share">
                                    <i class="fas fa-share-alt"></i> Teilen
                                </div>
                                <div class="padlet-menu-item" data-action="delete">
                                    <i class="fas fa-trash"></i>