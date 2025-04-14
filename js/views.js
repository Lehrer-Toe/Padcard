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
                                    <i class="fas fa-trash"></i> Löschen
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="padlet-meta">
                        <div class="padlet-meta-item">
                            <i class="fas fa-calendar-alt"></i> ${updatedDate}
                        </div>
                        <div class="padlet-meta-item">
                            <i class="fas fa-sticky-note"></i> ${cardCount} Karten
                        </div>
                        ${folder ? `<div class="padlet-meta-item">
                            <i class="fas fa-folder"></i> ${folder.name}
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `);
        
        // Vorschaubild setzen, falls vorhanden
        if (board.previewImage) {
            padletCard.find('.padlet-preview-bg').css('backgroundImage', `url(${board.previewImage})`);
        } else if (board.background && (board.background.data || board.background.url)) {
            padletCard.find('.padlet-preview-bg').css('backgroundImage', `url(${board.background.data || board.background.url})`);
        } else {
            // Fallback: Farbmuster mit Karten-Icons
            padletCard.find('.padlet-preview-bg').html(`
                <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
                    <i class="fas fa-sticky-note" style="font-size: 48px; color: rgba(255,255,255,0.3);"></i>
                </div>
            `);
        }
        
        // Menü-Ereignisbehandler hinzufügen
        padletCard.find('.padlet-menu-trigger').on('click', function(e) {
            e.stopPropagation();
            $(this).siblings('.padlet-menu-dropdown').toggleClass('show');
        });
        
        // Menü-Aktionen
        padletCard.find('.padlet-menu-item').on('click', function(e) {
            e.stopPropagation();
            const action = $(this).data('action');
            const boardId = $(this).closest('.padlet-card').data('id');
            
            // Dropdown schließen
            $(this).closest('.padlet-menu-dropdown').removeClass('show');
            
            if (action === 'edit') {
                Controllers.editBoard(boardId);
            } else if (action === 'delete') {
                // Bestätigungsdialog anzeigen
                const board = BoardDAO.getById(boardId);
                Views.showConfirmModal(
                    'Snap löschen',
                    `Möchtest du den Snap "${board.name}" wirklich löschen? Alle Karten werden ebenfalls gelöscht.`,
                    () => Controllers.deleteBoard(boardId)
                );
            } else if (action === 'share') {
                // Erst das Board öffnen, dann teilen
                AppData.currentBoard = BoardDAO.getById(boardId);
                Controllers.openShareModal();
            } else if (action === 'move') {
                // TODO: In Ordner verschieben
                alert('Diese Funktion ist noch nicht implementiert.');
            }
        });
        
        return padletCard;
    },
    
    /**
     * Rendert die Ordneransicht
     * @param {string} folderId - Ordner-ID
     */
    renderFolderView: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) {
            this.renderLatestActivitiesView();
            return;
        }
        
        // Andere Ansichten ausblenden und Ordner-Ansicht anzeigen
        $('#latest-activities-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#folder-view').removeClass('hidden');
        
        // Seitentitel aktualisieren
        $('#pageTitle').text(folder.name);
        
        // Sidebar-Menü aktualisieren
        $('.sidebar-item').removeClass('active');
        $(`.folder-item[data-id="${folderId}"]`).addClass('active');
        
        // Boards im Ordner rendern
        this.renderBoardsInFolder(folderId);
        
        // Ordner-Objekt speichern
        AppData.currentFolder = folder;
        AppData.currentBoard = null;
        AppData.view = 'folder';
    },
    
    /**
     * Rendert die Boards innerhalb eines Ordners
     * @param {string} folderId - Ordner-ID
     */
    renderBoardsInFolder: function(folderId) {
        const folderPadletsContainer = $('#folderPadletsContainer');
        folderPadletsContainer.empty();
        
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
                Controllers.createBoardInFolder(folderId);
            });
            
            folderPadletsContainer.append(createCard);
        }
        
        // Boards im Ordner abrufen
        const boards = BoardDAO.getByFolderId(folderId);
        
        // Wenn keine Boards vorhanden sind
        if (boards.length === 0) {
            if (AppData.studentMode) {
                folderPadletsContainer.append(`
                    <div class="empty-folder">
                        <div class="empty-folder-icon">
                            <i class="fas fa-folder-open"></i>
                        </div>
                        <div class="empty-folder-text">Keine Snaps in diesem Ordner</div>
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
            
            folderPadletsContainer.append(boardCard);
        });
    },
    
    /**
     * Sortiert Boards nach dem angegebenen Kriterium
     * @param {Array} boards - Array von Board-Objekten
     * @param {string} sortBy - Sortierkriterium ('name' oder 'date')
     */
    sortBoards: function(boards, sortBy) {
        if (sortBy === 'name') {
            boards.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'date') {
            boards.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        }
    },
    
    /**
     * Aktualisiert die Ordner-Dropdown-Liste für das Board-Modal
     */
    updateFolderSelect: function() {
        const folderSelect = $('#boardFolderSelect');
        folderSelect.empty();
        
        // "Kein Ordner"-Option hinzufügen
        folderSelect.append('<option value="">Kein Ordner</option>');
        
        // Rekursiv Ordnerstruktur bauen
        const buildFolderTree = (parentId, level) => {
            const folders = FolderDAO.getChildFolders(parentId);
            
            folders.forEach(folder => {
                const indent = '&nbsp;'.repeat(level * 4);
                folderSelect.append(`<option value="${folder.id}">${indent}${folder.name}</option>`);
                buildFolderTree(folder.id, level + 1);
            });
        };
        
        // Mit Root-Ordnern beginnen
        buildFolderTree(null, 0);
    },
    
    /**
     * Rendert die Board-Ansicht
     * @param {string} boardId - Board-ID
     */
    renderBoardView: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) {
            this.renderLatestActivitiesView();
            return;
        }
        
        // Andere Ansichten ausblenden und Board-Ansicht anzeigen
        $('#latest-activities-view').addClass('hidden');
        $('#folder-view').addClass('hidden');
        $('#board-view').removeClass('hidden');
        
        // Board-Titel festlegen
        $('#boardTitle').text(board.name);
        $('#pageTitle').text(board.name);
        
        // Kategorien-Auswahl aktualisieren
        this.updateCategoryDropdown(board);
        
        // Board-Objekt speichern
        AppData.currentBoard = board;
        AppData.currentFolder = null;
        AppData.view = 'board';
        
        // Hintergrund anwenden
        this.applyBoardBackground(board);
        
        // Aktive Ansicht aktualisieren
        $('.view-btn').removeClass('active');
        $(`.view-btn[data-view="${board.view || 'grid'}"]`).addClass('active');
        
        // Layout aktualisieren
        $('.layout-btn').removeClass('active');
        $(`.layout-btn[data-columns="${board.layout || 3}"]`).addClass('active');
        
        // Die richtige Ansicht rendern
        this.changeCardView(board.view || 'grid');
        
        // Bearbeitungsmodus-Steuerelemente aktualisieren
        $('.editor-only').toggle(!AppData.studentMode);
    },
    
    /**
     * Die Kartenansicht wechseln
     * @param {string} view - Die gewünschte Ansicht ('grid', 'free' oder 'categories')
     */
    changeCardView: function(view) {
        if (!AppData.currentBoard) return;
        
        // Ansicht im Board speichern
        if (AppData.currentBoard.view !== view) {
            BoardDAO.update(AppData.currentBoard.id, { view: view });
        }
        
        // Ansichten umschalten
        $('#boardGrid, #boardFree, #boardCategories').addClass('hidden');
        
        // Die gewählte Ansicht anzeigen und rendern
        if (view === 'grid') {
            $('#boardGrid').removeClass('hidden');
            this.renderCardsGrid(AppData.currentBoard);
        } else if (view === 'free') {
            $('#boardFree').removeClass('hidden');
            // Im Schülermodus den grau-transparenten Hintergrund entfernen
            if (AppData.studentMode) {
                $('#boardFree').css({
                    'background-color': 'transparent',
                    'border': 'none'
                });
            } else {
                // Im Bearbeitungsmodus den Standardstil wiederherstellen
                $('#boardFree').css({
                    'background-color': 'rgba(255, 255, 255, 0.5)',
                    'border': '2px dashed #ddd'
                });
            }
            this.renderCardsFree(AppData.currentBoard);
        } else if (view === 'categories') {
            $('#boardCategories').removeClass('hidden');
            this.renderCardsCategories(AppData.currentBoard);
        }
        
        // Button-Status aktualisieren
        $('.view-btn').removeClass('active');
        $(`.view-btn[data-view="${view}"]`).addClass('active');
    },
    
    /**
     * Das Board-Layout aktualisieren
     * @param {number} columns - Anzahl der Spalten
     */
    updateBoardLayout: function(columns) {
        if (!AppData.currentBoard) return;
        
        // Layout im Board speichern
        if (AppData.currentBoard.layout !== columns) {
            BoardDAO.update(AppData.currentBoard.id, { layout: columns });
        }
        
        // Button-Status aktualisieren
        $('.layout-btn').removeClass('active');
        $(`.layout-btn[data-columns="${columns}"]`).addClass('active');
        
        // Grid-Layout anpassen
        const boardGrid = $('#boardGrid');
        boardGrid.css('grid-template-columns', `repeat(${columns}, 1fr)`);
        
        // Falls in Grid-Ansicht, Karten neu rendern
        if (AppData.currentBoard.view === 'grid') {
            this.renderCardsGrid(AppData.currentBoard);
        }
    },
    
    /**
     * Den Board-Hintergrund anwenden
     * @param {Object} board - Das Board-Objekt
     */
    applyBoardBackground: function(board) {
        // Hintergrund zurücksetzen
        $('#board-view').css({
            'background-image': 'none',
            'background-color': '',
            'background-size': '',
            'background-repeat': '',
            'background-position': ''
        });
        
        // Wenn kein Hintergrund, Standardfarbe verwenden
        if (!board.background) {
            $('#board-view').css('background-color', '#f5f5f5');
            return;
        }
        
        // Hintergrundbild oder -farbe anwenden
        if (board.background.data || board.background.url) {
            const imageUrl = board.background.data || board.background.url;
            const opacity = board.background.opacity !== undefined ? board.background.opacity / 100 : 1;
            const rgba = `rgba(245, 245, 245, ${1 - opacity})`;
            
            // Hintergrundbild mit Stil und Deckkraft
            $('#board-view').css({
                'background-image': `linear-gradient(${rgba}, ${rgba}), url('${imageUrl}')`,
                'background-size': board.background.style === 'cover' ? 'cover' : 
                                  board.background.style === 'contain' ? 'contain' : 'auto',
                'background-repeat': board.background.style === 'repeat' ? 'repeat' : 'no-repeat',
                'background-position': 'center',
                'background-attachment': 'fixed'
            });
        } else {
            // Nur Farbe
            $('#board-view').css('background-color', '#f5f5f5');
        }
    },
    
    /**
     * Rendert die Karten im Raster-Layout
     * @param {Object} board - Das Board-Objekt
     */
    renderCardsGrid: function(board) {
        const boardGrid = $('#boardGrid');
        boardGrid.empty();
        
        // Zuerst alle vorhandenen Karten hinzufügen und dann erst den "Neue Karte"-Button
        // Wenn keine Karten vorhanden sind
        if (board.cards && board.cards.length > 0) {
            // Karten in Raster anordnen
            board.cards.forEach(card => {
                const cardElement = this.createCardElement(board.id, card);
                boardGrid.append(cardElement);
            });
        }
        
        // "Karte hinzufügen"-Button erstellen und RECHTS anhängen
        if (!AppData.studentMode) {
            const addCard = $(`
                <div class="add-card" id="addCardBtnGrid">
                    <i class="fas fa-plus"></i>
                    <div class="add-card-text">Neue Karte hinzufügen</div>
                </div>
            `);
            
            addCard.on('click', function() {
                Controllers.createCard();
            });
            
            boardGrid.append(addCard);
        }
    },
    
    /**
     * Karten im freien Layout rendern
     * @param {Object} board - Das Board-Objekt
     */
    renderCardsFree: function(board) {
        const boardFree = $('#boardFree');
        boardFree.empty();
        
        // Grauer Hintergrund immer entfernen, unabhängig vom Modus
        boardFree.css({
            'background-color': 'transparent',
            'border': 'none'
        });
        
        // "Karte hinzufügen"-Button erstellen und RECHTS positionieren
        if (!AppData.studentMode) {
            const addCard = $(`
                <div class="add-card" id="addCardBtnFree" style="position: absolute; top: 10px; right: 10px; width: 200px;">
                    <i class="fas fa-plus"></i>
                    <div class="add-card-text">Neue Karte hinzufügen</div>
                </div>
            `);
            
            addCard.on('click', function() {
                Controllers.createCard();
            });
            
            boardFree.append(addCard);
        }
        
        // Wenn keine Karten vorhanden sind
        if (!board.cards || board.cards.length === 0) {
            return;
        }
        
        // Karten mit absoluter Position anordnen
        board.cards.forEach(card => {
            const cardElement = this.createCardElement(board.id, card);
            
            // Position und Größe setzen
            if (card.position) {
                cardElement.css({
                    'left': card.position.left + 'px',
                    'top': card.position.top + 'px'
                });
            } else {
                // Standardposition für neue Karten
                const left = Math.floor(Math.random() * 500);
                const top = Math.floor(Math.random() * 300);
                
                cardElement.css({
                    'left': left + 'px',
                    'top': top + 'px'
                });
                
                // Position speichern
                BoardDAO.updateCard(board.id, card.id, {
                    position: { left, top }
                });
            }
            
            // Karte größenveränderbar machen
            if (!AppData.studentMode) {
                const resizeHandle = $('<div class="resize-handle"><i class="fas fa-arrows-alt"></i></div>');
                cardElement.append(resizeHandle);
                
                // Drag-Funktionalität aktivieren
                cardElement.draggable({
                    handle: '.card-header',
                    containment: 'parent',
                    stop: (event, ui) => {
                        // Position speichern
                        BoardDAO.updateCard(board.id, card.id, {
                            position: { 
                                left: ui.position.left,
                                top: ui.position.top 
                            }
                        });
                    }
                });
                
                // Resize-Funktionalität aktivieren
                cardElement.resizable({
                    minWidth: 200,
                    minHeight: 100,
                    handles: 'se',
                    stop: (event, ui) => {
                        // Größe speichern
                        BoardDAO.updateCard(board.id, card.id, {
                            size: { 
                                width: ui.size.width,
                                height: ui.size.height 
                            }
                        });
                    }
                });
                
                // Benutzerdefinierte Größe anwenden, falls vorhanden
                if (card.size) {
                    cardElement.css({
                        'width': card.size.width + 'px',
                        'height': card.size.height + 'px'
                    });
                }
            }
            
            boardFree.append(cardElement);
        });
    },
    
    /**
     * Karten in Kategorien rendern
     * @param {Object} board - Das Board-Objekt
     */
    renderCardsCategories: function(board) {
        const boardCategories = $('#boardCategories');
        boardCategories.empty();
        
        // "Kategorie hinzufügen"-Button erstellen
        if (!AppData.studentMode) {
            const addCategory = $(`
                <div class="add-category" id="addCategoryBtn">
                    <i class="fas fa-plus"></i>
                    <div class="add-category-text">Neue Kategorie hinzufügen</div>
                </div>
            `);
            
            addCategory.on('click', function() {
                Controllers.createCategory();
            });
            
            boardCategories.append(addCategory);
        }
        
        // Keine Kategorien definiert
        if (!board.categories || board.categories.length === 0) {
            const noCategories = $(`
                <div class="empty-folder">
                    <div class="empty-folder-icon">
                        <i class="fas fa-folder-open"></i>
                    </div>
                    <div class="empty-folder-text">Keine Kategorien definiert</div>
                    ${!AppData.studentMode ? '<button class="btn btn-primary" id="createCategoryBtn">Kategorie erstellen</button>' : ''}
                </div>
            `);
            
            if (!AppData.studentMode) {
                noCategories.find('#createCategoryBtn').on('click', function() {
                    Controllers.createCategory();
                });
            }
            
            boardCategories.append(noCategories);
            return;
        }
        
        // "Ohne Kategorie"-Bereich erstellen
        let uncategorizedCards = board.cards ? board.cards.filter(card => !card.category) : [];
        
        if (uncategorizedCards.length > 0 || !AppData.studentMode) {
            const uncategorizedCategory = $(`
                <div class="category">
                    <div class="category-header">
                        <div class="category-title">Ohne Kategorie</div>
                    </div>
                    <div class="category-cards" data-category="">
                        ${uncategorizedCards.length === 0 && !AppData.studentMode ? 
                            '<div class="category-placeholder">Karten hierher ziehen</div>' : ''}
                    </div>
                </div>
            `);
            
            // Karten ohne Kategorie hinzufügen
            uncategorizedCards.forEach(card => {
                const cardElement = this.createCardElement(board.id, card);
                uncategorizedCategory.find('.category-cards').append(cardElement);
            });
            
            // "Neue Karte"-Button hinzufügen
            if (!AppData.studentMode) {
                const addCard = $(`
                    <div class="add-card" style="height: 150px;">
                        <i class="fas fa-plus"></i>
                        <div class="add-card-text">Neue Karte</div>
                    </div>
                `);
                
                addCard.on('click', function() {
                    Controllers.createCard();
                });
                
                uncategorizedCategory.find('.category-cards').append(addCard);
            }
            
            boardCategories.append(uncategorizedCategory);
        }
        
        // Kategorien rendern
        board.categories.forEach(category => {
            // Karten in dieser Kategorie finden
            const categoryCards = board.cards ? board.cards.filter(card => card.category === category.id) : [];
            
            // Kategorie überspringen, wenn im Schülermodus und keine Karten
            if (AppData.studentMode && categoryCards.length === 0) {
                return;
            }
            
            const categoryElement = $(`
                <div class="category">
                    <div class="category-header">
                        <div class="category-title">${category.name}</div>
                        ${!AppData.studentMode ? `
                        <div class="category-actions">
                            <button class="btn" data-action="edit" title="Kategorie bearbeiten">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn" data-action="delete" title="Kategorie löschen">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>` : ''}
                    </div>
                    <div class="category-cards" data-category="${category.id}">
                        ${categoryCards.length === 0 && !AppData.studentMode ? 
                            '<div class="category-placeholder">Karten hierher ziehen</div>' : ''}
                    </div>
                </div>
            `);
            
            // Kategorie-Aktionen
            if (!AppData.studentMode) {
                categoryElement.find('.category-actions button').on('click', function() {
                    const action = $(this).data('action');
                    
                    if (action === 'edit') {
                        Controllers.editCategory(category.id);
                    } else if (action === 'delete') {
                        Controllers.deleteCategory(category.id);
                    }
                });
            }
            
            // Karten in dieser Kategorie hinzufügen
            categoryCards.forEach(card => {
                const cardElement = this.createCardElement(board.id, card);
                categoryElement.find('.category-cards').append(cardElement);
            });
            
            // "Neue Karte"-Button hinzufügen
            if (!AppData.studentMode) {
                const addCard = $(`
                    <div class="add-card" style="height: 150px;">
                        <i class="fas fa-plus"></i>
                        <div class="add-card-text">Neue Karte</div>
                    </div>
                `);
                
                addCard.on('click', function() {
                    // Kategorie vorauswählen
                    $('#cardCategory').val(category.id);
                    Controllers.createCard();
                });
                
                categoryElement.find('.category-cards').append(addCard);
            }
            
            boardCategories.append(categoryElement);
        });
        
        // Drag-and-Drop für Karten zwischen Kategorien aktivieren
        if (!AppData.studentMode) {
            $('.category-cards').sortable({
                connectWith: '.category-cards',
                placeholder: 'card-placeholder',
                items: '.card',
                stop: (event, ui) => {
                    const cardId = ui.item.data('id');
                    const newCategory = ui.item.closest('.category-cards').data('category') || '';
                    
                    // Kategorie aktualisieren
                    BoardDAO.updateCard(board.id, cardId, {
                        category: newCategory
                    });
                }
            });
        }
    },
    
    /**
     * Erstellt ein Karten-Element
     * @param {string} boardId - Board-ID
     * @param {Object} card - Karten-Objekt
     * @returns {jQuery} Das erstellte Karten-Element
     */
    createCardElement: function(boardId, card) {
        // Basis-Kartenklassen
        let cardClasses = 'card';
        
        // Farbklasse hinzufügen
        if (card.color === 'custom' && card.customColor) {
            cardClasses += ' card-custom';
        } else if (card.color) {
            cardClasses += ` card-${card.color}`;
        } else {
            cardClasses += ' card-blue'; // Standard
        }
        
        // Größenklassen
        const widthClass = card.width > 1 ? `grid-column: span ${card.width};` : '';
        const heightClass = card.height > 1 ? `grid-row: span ${card.height};` : '';
        
        // Basis-Karte erstellen
        const cardElement = $(`
            <div class="${cardClasses}" data-id="${card.id}" style="${widthClass}${heightClass}">
                <div class="card-content">
                    <div class="card-header">
                        <div class="card-title">${card.title}</div>
                        ${!AppData.studentMode ? `
                        <div class="card-menu">
                            <i class="fas fa-ellipsis-v"></i>
                            <div class="card-menu-dropdown">
                                <div class="card-menu-item" data-action="edit">
                                    <i class="fas fa-edit"></i> Bearbeiten
                                </div>
                                <div class="card-menu-item" data-action="duplicate">
                                    <i class="fas fa-copy"></i> Duplizieren
                                </div>
                                <div class="card-menu-item" data-action="delete">
                                    <i class="fas fa-trash"></i> Löschen
                                </div>
                            </div>
                        </div>` : ''}
                    </div>
                    <div class="card-text"></div>
                </div>
            </div>
        `);
        
        // Benutzerdefinierte Farbe anwenden
        if (card.color === 'custom' && card.customColor) {
            cardElement.css({
                'background-color': Utils.lightenColor(card.customColor, 0.85),
                'border-color': card.customColor
            });
        }
        
        // Textinhalt hinzufügen
        if (card.type === 'text') {
            // Formatierungen anwenden
            const formattedText = Utils.formatText(
                card.content, 
                card.textAlignment || 'left', 
                card.fontSize || 'normal', 
                card.textColors
            );
            cardElement.find('.card-text').html(formattedText);
        }
        
        // Kartentyp-spezifischen Inhalt hinzufügen
        if (card.type === 'youtube') {
            // YouTube-Vorschau erstellen
            cardElement.find('.card-text').after(`
                <div class="card-youtube">
                    <img src="https://img.youtube.com/vi/${card.youtubeId}/hqdefault.jpg" alt="YouTube Video">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
            `);
            
            // Beim Klick auf Play-Button das Video laden
            cardElement.find('.play-button').on('click', function(e) {
                e.stopPropagation();
                const youtubeContainer = $(this).parent();
                youtubeContainer.html(`
                    <iframe src="https://www.youtube.com/embed/${card.youtubeId}?autoplay=1" 
                            allowfullscreen="true"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                    </iframe>
                `);
            });
        } else if (card.type === 'image') {
            // Bild hinzufügen
            const imageUrl = card.imageData || card.imageUrl;
            if (imageUrl) {
                cardElement.find('.card-text').after(`
                    <div class="card-image">
                        <img src="${imageUrl}" alt="${card.title}">
                    </div>
                `);
            }
        } else if (card.type === 'link') {
            // Link hinzufügen
            if (card.linkUrl) {
                cardElement.find('.card-text').after(`
                    <div class="card-link">
                        <a href="${card.linkUrl}" target="_blank">
                            <i class="fas fa-external-link-alt"></i> Link öffnen
                        </a>
                    </div>
                `);
            }
        } else if (card.type === 'learningapp') {
            // LearningApp-Iframe hinzufügen
            if (card.learningappId) {
                cardElement.find('.card-text').after(`
                    <div class="card-learningapp">
                        <iframe src="https://learningapps.org/watch?app=${card.learningappId}" 
                                style="border:0;width:100%;height:100%"
                                allowfullscreen="true"
                                webkitallowfullscreen="true"
                                mozallowfullscreen="true">
                        </iframe>
                    </div>
                `);
            }
        } else if (card.type === 'audio') {
            // Audio-Player hinzufügen
            const audioUrl = card.audioData || card.audioUrl;
            if (audioUrl) {
                cardElement.find('.card-text').after(`
                    <div class="card-audio">
                        <audio controls>
                            <source src="${audioUrl}" type="audio/mpeg">
                            Dein Browser unterstützt kein Audio-Element.
                        </audio>
                    </div>
                `);
            }
        }
        
        // Menü-Funktionalität hinzufügen
        if (!AppData.studentMode) {
            cardElement.find('.card-menu i').on('click', function(e) {
                e.stopPropagation();
                $(this).siblings('.card-menu-dropdown').toggleClass('show');
            });
            
            // Menü-Aktionen
            cardElement.find('.card-menu-item').on('click', function(e) {
                e.stopPropagation();
                const action = $(this).data('action');
                const cardId = $(this).closest('.card').data('id');
                
                // Dropdown schließen
                $(this).closest('.card-menu-dropdown').removeClass('show');
                
                if (action === 'edit') {
                    Controllers.editCard(boardId, cardId);
                } else if (action === 'duplicate') {
                    Controllers.duplicateCard(boardId, cardId);
                } else if (action === 'delete') {
                    Controllers.deleteCard(boardId, cardId);
                }
            });
        }
        
        return cardElement;
    },
    
    /**
     * Aktualisiert die Kategorien-Dropdown-Liste im Karten-Modal
     * @param {Object} board - Board-Objekt
     */
    updateCategoryDropdown: function(board) {
        const categorySelect = $('#cardCategory');
        categorySelect.empty();
        
        // "Keine Kategorie"-Option hinzufügen
        categorySelect.append('<option value="">Keine Kategorie</option>');
        
        // Kategorien hinzufügen
        if (board.categories && board.categories.length > 0) {
            board.categories.forEach(category => {
                categorySelect.append(`<option value="${category.id}">${category.name}</option>`);
            });
        }
    },
    
    /**
     * Rendert die Kategorieliste im Kategorien-Modal
     * @param {Object} board - Board-Objekt
     */
    renderCategoriesList: function(board) {
        const categoryList = $('#categoryList');
        categoryList.empty();
        
        // Kategorien anzeigen
        if (board.categories && board.categories.length > 0) {
            board.categories.forEach(category => {
                // Anzahl der Karten in dieser Kategorie
                const cardCount = board.cards ? 
                    board.cards.filter(card => card.category === category.id).length : 0;
                
                const categoryItem = $(`
                    <div class="category-item">
                        <div class="category-item-title">${category.name}</div>
                        <div class="category-item-meta">${cardCount} Karten</div>
                        <div class="category-item-actions">
                            <button data-action="edit" title="Bearbeiten">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button data-action="delete" title="Löschen">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `);
                
                // Aktionen hinzufügen
                categoryItem.find('button[data-action="edit"]').on('click', function() {
                    Controllers.editCategory(category.id);
                });
                
                categoryItem.find('button[data-action="delete"]').on('click', function() {
                    Controllers.deleteCategory(category.id);
                });
                
                categoryList.append(categoryItem);
            });
        } else {
            categoryList.append(`
                <div class="category-item text-center">
                    <em>Keine Kategorien vorhanden</em>
                </div>
            `);
        }
    },
    
    /**
     * Schülermodus umschalten
     */
    toggleStudentMode: function() {
        AppData.studentMode = $('#studentModeToggle').prop('checked');
        
        // URL mit Modusparameter aktualisieren
        const url = new URL(window.location.href);
        if (AppData.studentMode) {
            url.searchParams.set('mode', 'student');
        } else {
            url.searchParams.delete('mode');
        }
        window.history.replaceState({}, '', url);
        
        // Sichtbarkeit der Editor-Elemente aktualisieren
        $('.editor-only').toggle(!AppData.studentMode);
        
        // Sichtbarkeit der Hinzufügen-Buttons aktualisieren
        if (AppData.studentMode) {
            $('#addCardBtnGrid, #addCategoryBtn').hide();
        } else {
            $('#addCardBtnGrid, #addCategoryBtn').show();
        }
        
        // Ansicht aktualisieren, je nach aktuellem View
        if (AppData.currentBoard) {
            if (AppData.currentBoard.view === 'categories') {
                Views.renderCardsCategories(AppData.currentBoard);
            } else if (AppData.currentBoard.view === 'free') {
                // Im Schülermodus den grau-transparenten Hintergrund entfernen
                if (AppData.studentMode) {
                    $('#boardFree').css({
                        'background-color': 'transparent',
                        'border': 'none'
                    });
                } else {
                    // Im Bearbeitungsmodus den Standardstil wiederherstellen
                    $('#boardFree').css({
                        'background-color': 'rgba(255, 255, 255, 0.5)',
                        'border': '2px dashed #ddd'
                    });
                }
            }
        }
        
        // In localStorage speichern
        StorageService.saveAppData();
        
        // Freigabe-Link aktualisieren
        this.updateShareLink();
    },
    
    /**
     * Freigabe-Link aktualisieren (Offline-Version für Tests)
     */
    updateShareLink: function() {
        // Aktuelles Board-ID holen
        const boardId = AppData.currentBoard ? AppData.currentBoard.id : '';
        
        // Eine lokale Datei-URL generieren (für Offline-Tests)
        const offlineUrl = 'file:///snapwall-offline/' + boardId + '.html';
        
        // Alternativ könnte man auch eine data-URL erstellen
        // const jsonData = JSON.stringify(AppData.currentBoard);
        // const encodedData = encodeURIComponent(jsonData);
        // const dataUrl = `data:application/json;charset=utf-8,${encodedData}`;
        
        // URL im Textfeld anzeigen
        $('#shareLink').val(offlineUrl);
    },
    
    /**
     * Freigabe-Link in die Zwischenablage kopieren
     */
    copyShareLink: function() {
        const shareLink = $('#shareLink')[0];
        shareLink.select();
        document.execCommand('copy');
        
        // Visuelle Rückmeldung
        const copyBtn = $('#copyLinkBtn');
        const originalHtml = copyBtn.html();
        copyBtn.html('<i class="fas fa-check"></i>');
        
        setTimeout(() => {
            copyBtn.html(originalHtml);
        }, 2000);
        
        // Offline-Version erstellen (für Tests)
        if (AppData.currentBoard) {
            Controllers.exportOfflineVersion();
        }
    },
    
    /**
     * Zeigt ein Bestätigungsmodal an
     * @param {string} title - Modaltitel
     * @param {string} message - Bestätigungsnachricht
     * @param {Function} onConfirm - Callback-Funktion bei Bestätigung
     */
    showConfirmModal: function(title, message, onConfirm) {
        // Modal-Inhalte setzen
        $('#confirmTitle').text(title);
        $('#confirmMessage').text(message);
        
        // Confirm-Button-Handler
        $('#confirmBtn').off('click').on('click', function() {
            $('#confirmModal').hide();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });
        
        // Modal anzeigen
        $('#confirmModal').show();
    }
};