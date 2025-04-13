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
        
        const colors = [
            { name: 'blue', color: '#2196F3' },
            { name: 'red', color: '#f44336' },
            { name: 'pink', color: '#E91E63' },
            { name: 'purple', color: '#9C27B0' },
            { name: 'deep-purple', color: '#673AB7' },
            { name: 'indigo', color: '#3F51B5' },
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
        ];
        
        colors.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.color};" data-color="${color.name}"></div>`);
            cardColorPickerRow.append(colorOption);
        });
        
        // Standardfarbe auswählen
        cardColorPickerRow.find('.color-option[data-color="blue"]').addClass('active');
        
        // RGB-Farbe und Vorschau
        $('#cardRgbColor').on('change', function() {
            $('#cardColorPreview').css('backgroundColor', $(this).val());
        });
        
        // Vorschau mit Standardwert initialisieren
        $('#cardColorPreview').css('backgroundColor', $('#cardRgbColor').val());
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
                            <i class="fas fa-sticky-note"></i> ${cardCount} Karten
                        </div>
                        <div class="padlet-meta-item">
                            <i class="fas fa-clock"></i> Aktualisiert am ${updatedDate}
                        </div>
                        ${folder ? `
                        <div class="padlet-meta-item">
                            <i class="fas fa-folder"></i> In Ordner: ${folder.name}
                        </div>
                        ` : ''}
                    </div>
                    <div class="padlet-author">
                        <div class="padlet-author-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="padlet-author-name">
                            Du
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Wenn Board ein Vorschaubild hat, verwenden
        if (board.previewImage) {
            padletCard.find('.padlet-preview-bg').css('backgroundImage', `url(${board.previewImage})`);
        }
        // Sonst, wenn Board einen Hintergrund hat, in der Vorschau anzeigen
        else if (board.background && (board.background.url || board.background.data)) {
            const bgUrl = board.background.data || board.background.url;
            padletCard.find('.padlet-preview-bg').css('backgroundImage', `url(${bgUrl})`);
        }
        
        // Menü-Trigger Klick-Handler
        padletCard.find('.padlet-menu-trigger').on('click', function(e) {
            e.stopPropagation();
            const dropdown = $(this).siblings('.padlet-menu-dropdown');
            $('.padlet-menu-dropdown').not(dropdown).removeClass('show');
            dropdown.toggleClass('show');
        });
        
        // Menü-Aktionen
        padletCard.find('.padlet-menu-item').on('click', function(e) {
            e.stopPropagation();
            const action = $(this).data('action');
            const boardId = $(this).closest('.padlet-card').data('id');
            
            if (action === 'edit') {
                Controllers.editBoard(boardId);
            } else if (action === 'move') {
                // TODO: Board in einen Ordner verschieben
                Controllers.editBoard(boardId); // Vorerst Bearbeiten-Dialog öffnen
            } else if (action === 'share') {
                Controllers.openShareModal();
            } else if (action === 'delete') {
                Controllers.deleteBoard(boardId);
            }
        });
        
        return padletCard;
    },
    
    /**
     * Rendert die Ordner-Ansicht
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
        
        // Pfadanzeige erstellen
        const ancestors = Utils.getFolderAncestors(folderId);
        let pathHtml = '';
        
        if (ancestors.length > 0) {
            pathHtml = ancestors.reverse().map(ancestor => 
                `<span class="folder-path-item" data-id="${ancestor.id}">${ancestor.name}</span> / `
            ).join('');
        }
        
        // Seitentitel aktualisieren
        $('#pageTitle').html(`${pathHtml}${folder.name}`);
        
        // Event-Handler für Pfad-Elemente hinzufügen
        $('.folder-path-item').on('click', function() {
            const ancestorId = $(this).data('id');
            Controllers.openFolder(ancestorId);
        });
        
        // Sidebar-Menü aktualisieren
        $('.sidebar-item').removeClass('active');
        $(`.folder-item[data-id="${folderId}"]`).addClass('active');
        
        // Boards in diesem Ordner rendern
        this.renderBoardsInFolder(folderId);
        
        AppData.view = 'folder';
        AppData.currentFolder = folder;
        AppData.currentBoard = null;
    },
    
    /**
     * Rendert die Boards in einem Ordner
     * @param {string} folderId - Ordner-ID
     */
    renderBoardsInFolder: function(folderId) {
        const folderPadletsContainer = $('#folderPadletsContainer');
        folderPadletsContainer.empty();
        
        // Unterordner anzeigen
        const subfolders = FolderDAO.getChildFolders(folderId);
        if (subfolders.length > 0) {
            const subfoldersSection = $('<div class="subfolders-section"></div>');
            const subfoldersGrid = $('<div class="subfolders-grid"></div>');
            
            subfoldersSection.append('<h3>Unterordner</h3>');
            subfoldersSection.append(subfoldersGrid);
            
            subfolders.forEach(subfolder => {
                const subfolderItem = $(`
                    <div class="subfolder-preview" data-id="${subfolder.id}">
                        <div class="subfolder-icon" style="color:${subfolder.color}">
                            <i class="fas fa-folder fa-2x"></i>
                        </div>
                        <div class="subfolder-name">${subfolder.name}</div>
                    </div>
                `);
                
                subfolderItem.on('click', function() {
                    const subfolderId = $(this).data('id');
                    Controllers.openFolder(subfolderId);
                });
                
                subfoldersGrid.append(subfolderItem);
            });
            
            folderPadletsContainer.append(subfoldersSection);
        }
        
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
        
        // Boards in diesem Ordner abrufen
        const boards = BoardDAO.getByFolderId(folderId);
        
        // Wenn keine Boards vorhanden sind
        if (boards.length === 0 && subfolders.length === 0) {
            folderPadletsContainer.append(`
                <div class="empty-folder">
                    <div class="empty-folder-icon">
                        <i class="fas fa-folder-open"></i>
                    </div>
                    <div class="empty-folder-text">
                        Dieser Ordner ist leer.
                    </div>
                </div>
            `);
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
        
        // Pfadanzeige erstellen, wenn in einem Ordner
        let pathHtml = '';
        if (board.folderId) {
            const folder = FolderDAO.getById(board.folderId);
            if (folder) {
                // Ordner-Vorfahren holen
                const ancestors = Utils.getFolderAncestors(folder.id);
                
                if (ancestors.length > 0) {
                    pathHtml = ancestors.reverse().map(ancestor => 
                        `<span class="folder-path-item" data-id="${ancestor.id}">${ancestor.name}</span> / `
                    ).join('');
                }
                
                pathHtml += `<span class="folder-path-item" data-id="${folder.id}">${folder.name}</span> / `;
            }
        }
        
        // Seitentitel aktualisieren
        $('#pageTitle').html(`${pathHtml}${board.name}`);
        
        // Board-Titel aktualisieren
        $('#boardTitle').text(board.name);
        
        // Sidebar-Menü aktualisieren
        $('.sidebar-item').removeClass('active');
        if (board.folderId) {
            $(`.folder-item[data-id="${board.folderId}"]`).addClass('active');
        }
        
        // Board-Hintergrund anwenden, falls vorhanden
        this.applyBoardBackground(board);
        
        // Zur richtigen Ansicht wechseln
        this.changeCardView(board.view || 'grid');
        
        // Layout aktualisieren
        this.updateBoardLayout(board.layout || 3);
        
        // Karten basierend auf der Ansicht rendern
        if (board.view === 'grid') {
            this.renderCardsGrid(board);
        } else if (board.view === 'free') {
            this.renderCardsFree(board);
        } else if (board.view === 'categories') {
            this.renderCardsCategories(board);
        }
        
        // Kategorien-Dropdown aktualisieren
        this.updateCategoryDropdown(board);
        
        // Event-Handler für Pfad-Elemente hinzufügen
        $('.folder-path-item').on('click', function() {
            const folderId = $(this).data('id');
            Controllers.openFolder(folderId);
        });
        
        AppData.view = 'board';
        AppData.currentBoard = board;
    },
    
    /**
     * Board-Hintergrund anwenden
     * @param {Object} board - Board-Objekt
     */
    applyBoardBackground: function(board) {
        // Zuerst vorhandenen Hintergrund entfernen
        $('#board-view').css({
            backgroundImage: '',
            backgroundSize: '',
            backgroundPosition: '',
            backgroundRepeat: ''
        });
        
        if (board.background) {
            const bg = board.background;
            const url = bg.data || bg.url;
            
            if (url) {
                $('#board-view').css({
                    backgroundImage: `url(${url})`,
                    backgroundSize: bg.style === 'cover' ? 'cover' : (bg.style === 'contain' ? 'contain' : 'auto'),
                    backgroundPosition: 'center',
                    backgroundRepeat: bg.style === 'repeat' ? 'repeat' : 'no-repeat',
                    backgroundColor: 'rgba(245, 245, 245, 0.8)', // Hellen Hintergrund hinzufügen
                });
                
                // Deckkraft anwenden
                const opacity = bg.opacity !== undefined ? bg.opacity / 100 : 1;
                $('#board-view').css({
                    boxShadow: `inset 0 0 0 2000px rgba(255, 255, 255, ${1 - opacity})`
                });
            }
        }
    },
    
    /**
     * Kartenansicht ändern (Raster, Frei, Kategorien)
     * @param {string} view - Ansichtsname
     */
    changeCardView: function(view) {
        // Ansichtsbuttons aktualisieren
        $('.view-btn').removeClass('active');
        $(`.view-btn[data-view="${view}"]`).addClass('active');
        
        // Alle Ansichten ausblenden
        $('#boardGrid').addClass('hidden');
        $('#boardFree').addClass('hidden');
        $('#boardCategories').addClass('hidden');
        
        // Ausgewählte Ansicht anzeigen
        if (view === 'grid') {
            $('#boardGrid').removeClass('hidden');
            $('.grid-controls').show();
        } else if (view === 'free') {
            $('#boardFree').removeClass('hidden');
            $('.grid-controls').hide();
        } else if (view === 'categories') {
            $('#boardCategories').removeClass('hidden');
            $('.grid-controls').hide();
        }
        
        // Board-Daten aktualisieren, wenn dies eine Änderung ist
        if (AppData.currentBoard && AppData.currentBoard.view !== view) {
            BoardDAO.update(AppData.currentBoard.id, { view });
        }
    },
    
    /**
     * Board-Layout aktualisieren (Rasterspalten)
     * @param {number} columns - Anzahl der Spalten
     */
    updateBoardLayout: function(columns) {
        // Layout-Buttons aktualisieren
        $('.layout-btn').removeClass('active');
        $(`.layout-btn[data-columns="${columns}"]`).addClass('active');
        
        // Rasterstil aktualisieren
        $('#boardGrid').css('gridTemplateColumns', `repeat(${columns}, 1fr)`);
        
        // Board-Daten aktualisieren, wenn dies eine Änderung ist
        if (AppData.currentBoard && AppData.currentBoard.layout !== columns) {
            BoardDAO.update(AppData.currentBoard.id, { layout: columns });
        }
    },
    
    /**
     * Boards sortieren
     * @param {Array} boards - Array mit Board-Objekten
     * @param {string} order - Sortierreihenfolge (name oder date)
     */
    sortBoards: function(boards, order) {
        if (order === 'name') {
            boards.sort((a, b) => a.name.localeCompare(b.name));
        } else if (order === 'date') {
            boards.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        }
    },
    
    /**
     * Karten im Rasteransicht rendern
     * @param {Object} board - Board-Objekt
     */
    renderCardsGrid: function(board) {
        const boardGrid = $('#boardGrid');
        
        // Alle Karten außer dem Hinzufügen-Button entfernen
        boardGrid.find('.card:not(.add-card)').remove();
        
        if (!board.cards || board.cards.length === 0) {
            return;
        }
        
        // Kartenelemente erstellen
        board.cards.forEach(card => {
            // Karten, die zu einer Kategorie gehören, in der Rasteransicht überspringen
            if (card.category) return;
            
            const cardElement = this.createCardElement(card, board.id);
            cardElement.insertBefore($('#addCardBtnGrid'));
        });
    },
    
    /**
     * Karten in freier Positionsansicht rendern
     * @param {Object} board - Board-Objekt
     */
    renderCardsFree: function(board) {
        const boardFree = $('#boardFree');
        boardFree.empty();
        
        if (!board.cards || board.cards.length === 0) {
            return;
        }
        
        // Kartenelemente mit absoluter Positionierung erstellen
        board.cards.forEach(card => {
            const cardElement = this.createCardElement(card, board.id);
            
            // Absolute Positionierung anwenden
            cardElement.css({
                position: 'absolute',
                width: card.width === 3 ? '600px' : (card.width === 2 ? '450px' : '300px'),
                height: card.height === 3 ? '600px' : (card.height === 2 ? '400px' : '200px')
            });
            
            // Gespeicherte Position anwenden, falls vorhanden
            if (card.position) {
                cardElement.css({
                    left: card.position.left,
                    top: card.position.top
                });
            } else {
                // Standardmäßig zufällige Position, wenn keine gespeichert ist
                const randomLeft = Math.floor(Math.random() * 300);
                const randomTop = Math.floor(Math.random() * 300);
                cardElement.css({
                    left: randomLeft,
                    top: randomTop
                });
            }
            
            // Größenänderungshandle hinzufügen
            cardElement.append(`
                <div class="resize-handle">
                    <i class="fas fa-grip-lines-diagonal"></i>
                </div>
            `);
            
            boardFree.append(cardElement);
        });
        
        // Karten ziehbar und größenänderbar machen
        this.initDraggableCards();
    },
    
    /**
     * Initialisiert ziehbare und größenänderbare Karten
     */
    initDraggableCards: function() {
        // Karten ziehbar machen
        $('#boardFree .card').draggable({
            containment: 'parent',
            handle: '.card-header',
            stack: '.card',
            stop: function(event, ui) {
                const cardId = $(this).data('id');
                const boardId = AppData.currentBoard.id;
                
                // Kartenposition in der Datenbank aktualisieren
                BoardDAO.updateCard(boardId, cardId, {
                    position: {
                        left: ui.position.left,
                        top: ui.position.top
                    }
                });
            }
        });
        
        // Karten größenänderbar machen
        $('#boardFree .card').resizable({
            handles: {
                se: '.resize-handle'
            },
            minWidth: 200,
            minHeight: 100,
            maxWidth: 800,
            maxHeight: 800,
            stop: function(event, ui) {
                const cardId = $(this).data('id');
                const boardId = AppData.currentBoard.id;
                
                // Kartengröße in der Datenbank aktualisieren
                BoardDAO.updateCard(boardId, cardId, {
                    size: {
                        width: ui.size.width,
                        height: ui.size.height
                    }
                });
            }
        });
    },
    
    /**
     * Karten in Kategorienansicht rendern
     * @param {Object} board - Board-Objekt
     */
    renderCardsCategories: function(board) {
        const boardCategories = $('#boardCategories');
        
        // Alle Kategorien außer dem Hinzufügen-Button entfernen
        boardCategories.find('.category').remove();
        
        // "Nicht kategorisiert"-Bereich erstellen
        const uncategorizedCards = board.cards ? board.cards.filter(card => !card.category) : [];
        if (uncategorizedCards.length > 0 || !AppData.studentMode) {
            const uncategorizedElement = $(`
                <div class="category" data-id="">
                    <div class="category-header">
                        <div class="category-title">Nicht kategorisiert</div>
                    </div>
                    <div class="category-cards"></div>
                </div>
            `);
            
            const categoryCards = uncategorizedElement.find('.category-cards');
            
            uncategorizedCards.forEach(card => {
                const cardElement = this.createCardElement(card, board.id);
                categoryCards.append(cardElement);
            });
            
            // Platzhalter hinzufügen, wenn leer
            if (uncategorizedCards.length === 0) {
                categoryCards.append(`
                    <div class="category-placeholder">Keine Karten in dieser Kategorie</div>
                `);
            }
            
            uncategorizedElement.insertBefore($('#addCategoryBtn'));
        }
        
        // Definierte Kategorien hinzufügen
        if (board.categories && board.categories.length > 0) {
            board.categories.forEach(category => {
                const categoryCards = board.cards ? board.cards.filter(card => card.category === category.id) : [];
                
                // Leere Kategorien im Schülermodus überspringen
                if (categoryCards.length === 0 && AppData.studentMode) return;
                
                const categoryElement = $(`
                    <div class="category" data-id="${category.id}">
                        <div class="category-header">
                            <div class="category-title">${category.name}</div>
                            <div class="category-actions editor-only">
                                <button class="btn" data-action="edit"><i class="fas fa-edit"></i></button>
                                <button class="btn" data-action="delete"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                        <div class="category-cards"></div>
                    </div>
                `);
                
                const categoryCardsContainer = categoryElement.find('.category-cards');
                
                categoryCards.forEach(card => {
                    const cardElement = this.createCardElement(card, board.id);
                    categoryCardsContainer.append(cardElement);
                });
                
                // Platzhalter hinzufügen, wenn leer
                if (categoryCards.length === 0) {
                    categoryCardsContainer.append(`
                        <div class="category-placeholder">Keine Karten in dieser Kategorie</div>
                    `);
                }
                
                // Kategorie-Aktionen
                categoryElement.find('.category-actions button').on('click', function() {
                    const action = $(this).data('action');
                    const categoryId = $(this).closest('.category').data('id');
                    
                    if (action === 'edit') {
                        Controllers.editCategory(categoryId);
                    } else if (action === 'delete') {
                        Controllers.deleteCategory(categoryId);
                    }
                });
                
                categoryElement.insertBefore($('#addCategoryBtn'));
            });
        }
        
        // Sortierbar für Kategorie-Karten initialisieren
        this.initSortableCategories();
    },
    
    /**
     * Initialisiert Sortierbarkeit für Kategorie-Karten
     */
    initSortableCategories: function() {
        if (AppData.studentMode) return;
        
        $('.category-cards').sortable({
            connectWith: '.category-cards',
            placeholder: 'card',
            cursor: 'move',
            tolerance: 'pointer',
            handle: '.card-header',
            stop: function(event, ui) {
                const cardId = ui.item.data('id');
                const categoryId = ui.item.closest('.category').data('id') || '';
                const boardId = AppData.currentBoard.id;
                
                // Kartenkategorie in der Datenbank aktualisieren
                BoardDAO.updateCard(boardId, cardId, {
                    category: categoryId
                });
            }
        }).disableSelection();
    },
    
    /**
     * Kartenelement erstellen mit verbesserten Styles und Textformatierung
     * @param {Object} card - Kartendaten
     * @param {string} boardId - Board-ID
     * @returns {jQuery} Kartenelement
     */
    createCardElement: function(card, boardId) {
        // Basis-Kartenelement erstellen
        const cardElement = $(`
            <div class="card card-${card.color}" data-id="${card.id}">
                <div class="card-content">
                    <div class="card-header">
                        <div class="card-title">${card.title}</div>
                        <div class="card-menu editor-only">
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
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        const cardContent = cardElement.find('.card-content');
        
        // Benutzerdefinierte Farbe anwenden, falls gesetzt
        if (card.color === 'custom' && card.customColor) {
            const bgColor = Utils.lightenColor(card.customColor, 0.9);
            cardElement.removeClass().addClass('card card-custom');
            cardElement.css({
                'background-color': bgColor,
                'border-color': card.customColor
            });
        }
        
        // Breite in Rasteransicht anwenden
        if (AppData.view !== 'free' && card.width > 1) {
            cardElement.css('grid-column', `span ${card.width}`);
        }
        
        // Höhe anwenden
        if (card.height > 1) {
            cardContent.css('min-height', card.height === 3 ? '400px' : '300px');
        }
        
        // Benutzerdefinierte Größe anwenden, falls vorhanden (in freier Ansicht)
        if (AppData.view === 'free' && card.size) {
            cardElement.css({
                width: card.size.width,
                height: card.size.height
            });
        }
        
        // Kartentext-Inhalt mit Formatierung hinzufügen
        if (card.content) {
            // Formatierungen anwenden
            const formattedText = Utils.formatText(
                card.content, 
                card.textAlignment || 'left', 
                card.fontSize || 'normal',
                card.textColors || {}
            );
            
            cardContent.append(`<div class="card-text">${formattedText}</div>`);
        }
        
        // Typenspezifischen Inhalt hinzufügen
        if (card.type === 'youtube' && card.youtubeId) {
            cardContent.append(`
                <div class="card-youtube" data-youtube-id="${card.youtubeId}">
                    <img src="https://img.youtube.com/vi/${card.youtubeId}/maxresdefault.jpg" alt="YouTube Thumbnail">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
            `);
            
            // Klick-Handler für Wiedergabe-Button hinzufügen
            cardElement.find('.play-button').on('click', function() {
                const youtubeId = $(this).parent().data('youtube-id');
                const youtubeContainer = $(this).parent();
                
                // Thumbnail durch iframe ersetzen
                youtubeContainer.html(`
                    <iframe width="100%" height="100%" 
                        src="https://www.youtube.com/embed/${youtubeId}?autoplay=1" 
                        frameborder="0" allowfullscreen>
                    </iframe>
                `);
            });
        } else if (card.type === 'image' && (card.imageUrl || card.imageData)) {
            const imageUrl = card.imageData || card.imageUrl;
            cardContent.append(`
                <div class="card-image">
                    <img src="${imageUrl}" alt="Bild">
                </div>
            `);
        } else if (card.type === 'link' && card.linkUrl) {
            cardContent.append(`
                <div class="card-link">
                    <a href="${card.linkUrl}" target="_blank" class="btn">
                        <i class="fas fa-external-link-alt"></i> Link öffnen
                    </a>
                </div>
            `);
        } else if (card.type === 'learningapp' && card.learningappId) {
            cardContent.append(`
                <div class="card-learningapp">
                    <iframe src="https://learningapps.org/watch?app=${card.learningappId}" 
                        style="border:0px;width:100%;height:100%" allowfullscreen="true" 
                        webkitallowfullscreen="true" mozallowfullscreen="true">
                    </iframe>
                </div>
            `);
        } else if (card.type === 'audio' && (card.audioUrl || card.audioData)) {
            const audioUrl = card.audioData || card.audioUrl;
            cardContent.append(`
                <div class="card-audio">
                    <audio controls>
                        <source src="${audioUrl}" type="audio/mpeg">
                        Dein Browser unterstützt kein Audio-Element.
                    </audio>
                </div>
            `);
        }
        
        // Karten-Menü-Toggle
        cardElement.find('.card-menu i').on('click', function(e) {
            e.stopPropagation();
            const dropdown = $(this).siblings('.card-menu-dropdown');
            
            // Alle anderen Dropdowns schließen
            $('.card-menu-dropdown.show').not(dropdown).removeClass('show');
            
            dropdown.toggleClass('show');
        });
        
        // Karten-Menü-Aktionen
        cardElement.find('.card-menu-item').on('click', function(e) {
            e.stopPropagation();
            const action = $(this).data('action');
            const cardId = $(this).closest('.card').data('id');
            
            if (action === 'edit') {
                Controllers.editCard(boardId, cardId);
            } else if (action === 'duplicate') {
                Controllers.duplicateCard(boardId, cardId);
            } else if (action === 'delete') {
                Controllers.deleteCard(boardId, cardId);
            }
        });
        
        return cardElement;
    },
    
    /**
     * Kategorie-Dropdown in Karten-Modal aktualisieren
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
     * Ordner-Auswahlmenü im Board-Modal aktualisieren
     */
    updateFolderSelect: function() {
        const folderSelect = $('#boardFolderSelect');
        folderSelect.empty();
        
        // "Kein Ordner"-Option hinzufügen
        folderSelect.append('<option value="">Kein Ordner</option>');
        
        // Rekursive Funktion zum Aufbau des Auswahlmenüs
        const buildFolderOptions = (parentId, level) => {
            const folders = parentId ? 
                FolderDAO.getChildFolders(parentId) : 
                FolderDAO.getRootFolders();
            
            // Alphabetisch sortieren
            folders.sort((a, b) => a.name.localeCompare(b.name));
            
            folders.forEach(folder => {
                const indent = '\u00A0'.repeat(level * 4);
                folderSelect.append(`<option value="${folder.id}">${indent}${folder.name}</option>`);
                
                // Rekursiv Unterordner hinzufügen
                buildFolderOptions(folder.id, level + 1);
            });
        };
        
        // Mit Root-Ordnern beginnen
        buildFolderOptions(null, 0);
    },
    
    /**
     * Kategorieliste im Kategorie-Modal rendern
     * @param {Object} board - Board-Objekt
     */
    renderCategoriesList: function(board) {
        const categoryList = $('#categoryList');
        categoryList.empty();
        
        if (!board.categories || board.categories.length === 0) {
            categoryList.append('<div class="text-center p-3">Keine Kategorien vorhanden.</div>');
            return;
        }
        
        board.categories.forEach(category => {
            const categoryItem = $(`
                <div class="category-item" data-id="${category.id}">
                    <div class="category-item-title">${category.name}</div>
                    <div class="category-item-actions">
                        <button data-action="edit"><i class="fas fa-edit"></i></button>
                        <button data-action="delete"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `);
            
            // Bearbeiten-Event
            categoryItem.find('button[data-action="edit"]').on('click', function() {
                Controllers.editCategory(category.id);
            });
            
            // Löschen-Event
            categoryItem.find('button[data-action="delete"]').on('click', function() {
                Controllers.deleteCategory(category.id);
            });
            
            categoryList.append(categoryItem);
        });
    },
    
    /**
     * Bestätigungsmodal anzeigen
     * @param {string} title - Modal-Titel
     * @param {string} message - Bestätigungsnachricht
     * @param {Function} callback - Funktion, die bei Bestätigung aufgerufen wird
     */
    showConfirmModal: function(title, message, callback) {
        // Titel und Nachricht setzen
        $('#confirmTitle').text(title);
        $('#confirmMessage').text(message);
        
        // Bestätigungsbutton-Aktion setzen
        $('#confirmBtn').off('click').on('click', function() {
            $('#confirmModal').hide();
            if (typeof callback === 'function') {
                callback();
            }
        });
        
        // Modal anzeigen
        $('#confirmModal').show();
    }
};