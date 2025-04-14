/**
 * Controllers für PadCard-Manager
 * 
 * Diese Datei enthält die Controller-Logik, die Benutzerinteraktionen verarbeitet
 * und die Modelle mit den Views verbindet.
 */

const Controllers = {
    /**
     * Controller initialisieren
     */
    init: function() {
        this.initEventHandlers();
    },
    
    /**
     * Event-Handler initialisieren
     */
    initEventHandlers: function() {
        // Sidebar und Navigation
        $('#newFolderBtn').on('click', () => this.createFolder());
        $('#createNewBtn').on('click', () => this.createBoard());
        
        // Ordner-Aktionen
        $('#saveFolderBtn').on('click', () => this.saveFolder());
        $('#cancelFolderBtn, #closeFolderModal').on('click', () => $('#folderModal').hide());
        $('#editFolderBtn').on('click', () => this.editCurrentFolder());
        
        // Board-Aktionen
        $('#newBoardInFolderBtn').on('click', () => this.createBoard());
        $('#saveBoardBtn').on('click', () => this.saveBoard());
        $('#cancelBoardBtn, #closeBoardModal').on('click', () => $('#boardModal').hide());
        $('#editBoardTitleBtn').on('click', () => this.editCurrentBoard());
        
        // Karten-Aktionen
        $('#newCardBtn, #addCardBtnGrid').on('click', () => this.createCard());
        $('#saveCardBtn').on('click', () => this.saveCard());
        $('#cancelCardBtn, #closeCardModal').on('click', () => $('#cardModal').hide());
        
        // Kartentyp-Auswahl
        $('.card-type-option').on('click', function() {
            const type = $(this).data('type');
            $('.card-type-option').removeClass('active');
            $(this).addClass('active');
            
            // Alle typenspezifischen Felder ausblenden
            $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
            
            // Ausgewählte Typenfelder anzeigen
            $(`.${type}-fields`).show();
        });
        
        // Farbpalette-Auswahl
        $('.color-palette').on('click', function() {
            const palette = $(this).data('palette');
            $('.color-palette').removeClass('active');
            $(this).addClass('active');
            
            // Alle Farbauswähler ausblenden
            $('.material-colors, .pastel-colors, .custom-colors').hide();
            
            // Ausgewählte Palette anzeigen
            $(`.${palette}-colors`).show();
        });
        
        // Benutzerdefinierte Farbe anwenden
        $('#applyCustomColorBtn').on('click', () => {
            const customColor = $('#customColorPicker').val();
            $('.color-option').removeClass('active');
            $('#customColorPreview').css('backgroundColor', customColor);
        });
        
        // Kartengrößen-Auswahl
        $('.width-btn').on('click', function() {
            $('.width-btn').removeClass('active');
            $(this).addClass('active');
        });
        
        $('.height-btn').on('click', function() {
            $('.height-btn').removeClass('active');
            $(this).addClass('active');
        });
        
        // Ansichtsauswahl
        $('.view-btn').on('click', function() {
            const view = $(this).data('view');
            Views.changeCardView(view);
        });
        
        // Layout-Auswahl
        $('.layout-btn').on('click', function() {
            const columns = parseInt($(this).data('columns'));
            Views.updateBoardLayout(columns);
        });
        
        // Suche
        $('#searchInput').on('input', this.filterCards);
        
        // Kategorie-Aktionen
        $('#addCategoryBtn').on('click', () => this.createCategory());
        $('#categoriesBtn').on('click', () => this.openCategoryModal());
        $('#addCategoryFormBtn').on('click', () => this.saveCategory());
        $('#closeCategoryModal, #closeCategoryBtn').on('click', () => $('#categoryModal').hide());
        
        // Hintergrund-Aktionen
        $('#backgroundBtn').on('click', () => this.openBackgroundModal());
        $('#closeBackgroundModal, #cancelBackgroundBtn').on('click', () => $('#backgroundModal').hide());
        $('#saveBackgroundBtn').on('click', () => this.saveBackground());
        $('#removeBackgroundBtn').on('click', () => this.removeBackground());
        
        // Hintergrundstil-Optionen
        $('.background-style-option').on('click', function() {
            $('.background-style-option').removeClass('active');
            $(this).addClass('active');
        });
        
        // Hintergrund-Deckkraft
        $('#backgroundOpacity').on('input', function() {
            const value = $(this).val();
            $('#opacityValue').text(`${value}%`);
        });
        
        // Hintergrund-Datei-Upload
        $('#backgroundUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                $('#backgroundFileName').text(file.name);
                // Vorschau des Bildes
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('.bg-preview').css('backgroundImage', `url(${e.target.result})`);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Bild-Upload für Karten
        $('#imageUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#imagePreview').show().html(`<img src="${e.target.result}" alt="Vorschau">`);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Audio-Upload für Karten
        $('#audioUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#audioPreview').show().html(`
                        <audio controls>
                            <source src="${e.target.result}" type="audio/mpeg">
                            Dein Browser unterstützt kein Audio-Element.
                        </audio>
                    `);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Platzhalter für Bildkarten
        $('#placeholderBtn').on('click', () => {
            $('#imageUrl').val('https://placehold.co/600x400/e3f2fd/2196F3?text=Bildinhalt');
            $('#imagePreview').show().html(`<img src="https://placehold.co/600x400/e3f2fd/2196F3?text=Bildinhalt" alt="Vorschau">`);
        });
        
        // Schülermodus-Toggle
        $('#studentModeToggle').on('change', () => this.toggleStudentMode());
        
        // Teilen-Button
        $('#shareBtn').on('click', () => this.openShareModal());
        $('#closeShareModal').on('click', () => $('#shareModal').hide());
        $('#copyLinkBtn').on('click', () => this.copyShareLink());
        
        // Import/Export
        $('#exportBtn').on('click', () => StorageService.exportData());
        $('#importFile').on('change', (e) => this.importData(e));
        
        // Sortieroptionen
        $('.sort-option').on('click', function() {
            $('.sort-option').removeClass('active');
            $(this).addClass('active');
            
            // Boards neu sortieren
            if (AppData.view === 'home') {
                Views.renderLatestActivitiesView();
            } else if (AppData.view === 'folder' && AppData.currentFolder) {
                Views.renderBoardsInFolder(AppData.currentFolder.id);
            }
        });
        
        // Bestätigungsmodal schließen
        $('#closeConfirmModal, #cancelConfirmBtn').on('click', () => $('#confirmModal').hide());
        
        // Dropdowns schließen, wenn außerhalb geklickt wird
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.folder-menu, .board-menu, .card-menu, .dropdown, .padlet-menu').length) {
                $('.folder-menu-dropdown, .board-menu-dropdown, .card-menu-dropdown, .dropdown-menu, .padlet-menu-dropdown').removeClass('show');
            }
        });
        
        // Dropdown-Toggle
        $('.dropdown-toggle').on('click', function() {
            $(this).siblings('.dropdown-menu').toggleClass('show');
        });
    },
    
    /**
     * Einen Ordner öffnen
     * @param {string} folderId - Ordner-ID
     */
    openFolder: function(folderId) {
        Views.renderFolderView(folderId);
    },
    
    /**
     * Ein Board öffnen
     * @param {string} boardId - Board-ID
     */
    openBoard: function(boardId) {
        Views.renderBoardView(boardId);
    },
    
    /**
     * Einen neuen Ordner erstellen
     */
    createFolder: function() {
        // Formular zurücksetzen
        $('#folderModalTitle').text('Neuer Ordner');
        $('#folderTitle').val('');
        
        // Farbauswahl zurücksetzen
        $('#folderColorPicker .color-option').removeClass('active');
        $('#folderColorPicker .color-option').first().addClass('active');
        
        // Modal anzeigen
        $('#folderModal').show();
    },
    
    /**
     * Einen Ordner bearbeiten
     * @param {string} folderId - Ordner-ID
     */
    editFolder: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) return;
        
        // Formularwerte festlegen
        $('#folderModalTitle').text('Ordner bearbeiten');
        $('#folderTitle').val(folder.name);
        
        // Farbe festlegen
        $('#folderColorPicker .color-option').removeClass('active');
        const colorOption = $(`#folderColorPicker .color-option[data-color="${folder.color}"]`);
        if (colorOption.length) {
            colorOption.addClass('active');
        } else {
            $('#folderColorPicker .color-option').first().addClass('active');
        }
        
        // Ordner-ID im Formular speichern
        $('#folderModal').data('id', folder.id);
        
        // Modal anzeigen
        $('#folderModal').show();
    },
    
    /**
     * Den aktuellen Ordner bearbeiten
     */
    editCurrentFolder: function() {
        if (AppData.currentFolder) {
            this.editFolder(AppData.currentFolder.id);
        }
    },
    
    /**
     * Einen Ordner speichern (erstellen oder aktualisieren)
     */
    saveFolder: function() {
        const title = $('#folderTitle').val().trim();
        if (!title) {
            alert('Bitte gib einen Titel ein.');
            return;
        }
        
        const color = $('#folderColorPicker .color-option.active').data('color') || '#2196F3';
        const folderId = $('#folderModal').data('id');
        
        if (folderId) {
            // Vorhandenen Ordner aktualisieren
            FolderDAO.update(folderId, { name: title, color: color });
            
            // Ansicht aktualisieren
            if (AppData.view === 'folder' && AppData.currentFolder && AppData.currentFolder.id === folderId) {
                Views.renderFolderView(folderId);
            } else {
                Views.renderFolderList();
            }
        } else {
            // Neuen Ordner erstellen
            FolderDAO.create(title, color);
            Views.renderFolderList();
        }
        
        // Modal ausblenden
        $('#folderModal').hide();
        $('#folderModal').removeData('id');
    },
    
    /**
     * Einen Ordner löschen
     * @param {string} folderId - Ordner-ID
     */
    deleteFolder: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) return;
        
        Views.showConfirmModal(
            'Ordner löschen',
            `Möchte der Ordner "${folder.name}" wirklich gelöscht werden? Die Padlets bleiben erhalten.`,
            () => {
                FolderDAO.delete(folderId);
                
                if (AppData.view === 'folder' && AppData.currentFolder && AppData.currentFolder.id === folderId) {
                    Views.renderLatestActivitiesView();
                } else {
                    Views.renderFolderList();
                }
            }
        );
    },
    
    /**
     * Ein neues Board erstellen
     */
    createBoard: function() {
        // Formular zurücksetzen
        $('#boardModalTitle').text('Neues Padlet');
        $('#boardTitleInput').val('');
        
        // Farbauswahl zurücksetzen
        $('#boardColorPicker .color-option').removeClass('active');
        $('#boardColorPicker .color-option').first().addClass('active');
        
        // Ordner-Auswahlmenü aktualisieren
        Views.updateFolderSelect();
        
        // Aktuellen Ordner festlegen, falls in Ordner-Ansicht
        if (AppData.view === 'folder' && AppData.currentFolder) {
            $('#boardFolderSelect').val(AppData.currentFolder.id);
        } else {
            $('#boardFolderSelect').val('');
        }
        
        // Modal anzeigen
        $('#boardModal').show();
    },
    
    /**
     * Ein neues Board in einem bestimmten Ordner erstellen
     * @param {string} folderId - Ordner-ID
     */
    createBoardInFolder: function(folderId) {
        this.createBoard();
        $('#boardFolderSelect').val(folderId);
    },
    
    /**
     * Ein Board bearbeiten
     * @param {string} boardId - Board-ID
     */
    editBoard: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        
        // Formularwerte festlegen
        $('#boardModalTitle').text('Padlet bearbeiten');
        $('#boardTitleInput').val(board.name);
        
        // Farbe festlegen
        $('#boardColorPicker .color-option').removeClass('active');
        const colorOption = $(`#boardColorPicker .color-option[data-color="${board.color}"]`);
        if (colorOption.length) {
            colorOption.addClass('active');
        } else {
            $('#boardColorPicker .color-option').first().addClass('active');
        }
        
        // Ordner-Auswahlmenü aktualisieren
        Views.updateFolderSelect();
        $('#boardFolderSelect').val(board.folderId || '');
        
        // Board-ID im Formular speichern
        $('#boardModal').data('id', board.id);
        
        // Modal anzeigen
        $('#boardModal').show();
    },
    
    /**
     * Das aktuelle Board bearbeiten
     */
    editCurrentBoard: function() {
        if (AppData.currentBoard) {
            this.editBoard(AppData.currentBoard.id);
        }
    },
    
    /**
     * Ein Board speichern (erstellen oder aktualisieren)
     */
    saveBoard: function() {
        const title = $('#boardTitleInput').val().trim();
        if (!title) {
            alert('Bitte gib einen Titel ein.');
            return;
        }
        
        const color = $('#boardColorPicker .color-option.active').data('color') || '#4CAF50';
        const folderId = $('#boardFolderSelect').val();
        const boardId = $('#boardModal').data('id');
        
        if (boardId) {
            // Vorhandenes Board aktualisieren
            BoardDAO.update(boardId, { 
                name: title, 
                color: color,
                folderId: folderId || null
            });
            
            if (AppData.view === 'board' && AppData.currentBoard && AppData.currentBoard.id === boardId) {
                $('#boardTitle').text(title);
                $('#pageTitle').text(title);
            } else if (AppData.view === 'folder' && AppData.currentFolder) {
                Views.renderBoardsInFolder(AppData.currentFolder.id);
            } else {
                Views.renderLatestActivitiesView();
            }
        } else {
            // Neues Board erstellen
            BoardDAO.create(title, color, folderId || null);
            
            if (AppData.view === 'folder' && AppData.currentFolder) {
                Views.renderBoardsInFolder(AppData.currentFolder.id);
            } else {
                Views.renderLatestActivitiesView();
            }
        }
        
        // Modal ausblenden
        $('#boardModal').hide();
        $('#boardModal').removeData('id');
    },
    
    /**
     * Ein Board löschen
     * @param {string} boardId - Board-ID
     */
    deleteBoard: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        
        Views.showConfirmModal(
            'Padlet löschen',
            `Möchte das Padlet "${board.name}" wirklich gelöscht werden? Alle Karten werden ebenfalls gelöscht.`,
            () => {
                BoardDAO.delete(boardId);
                
                if (AppData.view === 'board' && AppData.currentBoard && AppData.currentBoard.id === boardId) {
                    if (AppData.currentBoard.folderId) {
                        Views.renderFolderView(AppData.currentBoard.folderId);
                    } else {
                        Views.renderLatestActivitiesView();
                    }
                } else if (AppData.view === 'folder' && AppData.currentFolder) {
                    Views.renderBoardsInFolder(AppData.currentFolder.id);
                } else {
                    Views.renderLatestActivitiesView();
                }
            }
        );
    },
    
    /**
     * Eine neue Karte erstellen
     */
    createCard: function() {
        if (!AppData.currentBoard) return;
        
        // Formular zurücksetzen
        $('#cardModalTitle').text('Neue Karte');
        $('#cardTitle').val('');
        $('#cardContent').val('');
        $('#youtubeUrl').val('');
        $('#imageUrl').val('');
        $('#linkUrl').val('');
        $('#learningappUrl').val('');
        
        $('.card-type-option').removeClass('active');
        $('.card-type-option[data-type="text"]').addClass('active');
        $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
        
        $('.color-palette').removeClass('active');
        $('.color-palette[data-palette="material"]').addClass('active');
        $('.material-colors').show();
        $('.pastel-colors, .custom-colors').hide();
        $('.color-option').removeClass('active');
        $('.material-colors .color-option[data-color="blue"]').addClass('active');
        
        $('.width-btn, .height-btn').removeClass('active');
        $('.width-btn[data-width="1"], .height-btn[data-height="1"]').addClass('active');
        
        $('#cardCategory').val('');
        $('#imagePreview, #audioPreview').hide().empty();
        $('#cardModal').removeData('id');
        $('#cardModal').show();
    },
    
    /**
     * Eine Karte bearbeiten
     * @param {string} boardId - Board-ID
     * @param {string} cardId - Karten-ID
     */
    editCard: function(boardId, cardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        
        const card = board.cards.find(c => c.id === cardId);
        if (!card) return;
        
        $('#cardModalTitle').text('Karte bearbeiten');
        $('#cardTitle').val(card.title);
        $('#cardContent').val(card.content);
        
        // Kartentyp auswählen
        $('.card-type-option').removeClass('active');
        $(`.card-type-option[data-type="${card.type}"]`).addClass('active');
        $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
        $(`.${card.type}-fields`).show();
        
        // Farbe setzen
        $('.color-palette').removeClass('active');
        $('.color-palette[data-palette="material"]').addClass('active');
        $('.material-colors').show();
        $('.pastel-colors, .custom-colors').hide();
        $('.color-option').removeClass('active');
        $(`.material-colors .color-option[data-color="${card.color}"]`).addClass('active');
        
        // Größenauswahl setzen
        $('.width-btn, .height-btn').removeClass('active');
        $(`.width-btn[data-width="${card.width}"]`).addClass('active');
        $(`.height-btn[data-height="${card.height}"]`).addClass('active');
        
        // Kategorie setzen
        $('#cardCategory').val(card.category);
        
        // Bild- und Audio-Daten setzen, falls vorhanden
        if (card.type === 'image' && card.imageUrl) {
            $('#imagePreview').show().html(`<img src="${card.imageUrl}" alt="Vorschau">`);
        }
        if (card.type === 'audio' && card.audioUrl) {
            $('#audioPreview').show().html(`
                <audio controls>
                    <source src="${card.audioUrl}" type="audio/mpeg">
                    Dein Browser unterstützt kein Audio-Element.
                </audio>
            `);
        }
        
        $('#cardModal').data('id', card.id);
        $('#cardModal').show();
    },
    
    /**
     * Eine Karte speichern (erstellen oder aktualisieren)
     */
    saveCard: function() {
        const title = $('#cardTitle').val().trim();
        if (!title) {
            alert('Bitte gib einen Kartentitel ein.');
            return;
        }
        
        const cardData = {
            title: title,
            content: $('#cardContent').val().trim(),
            type: $('.card-type-option.active').data('type') || 'text',
            color: $('.material-colors .color-option.active').data('color') || 'blue',
            width: parseInt($('.width-btn.active').data('width')) || 1,
            height: parseInt($('.height-btn.active').data('height')) || 1,
            category: $('#cardCategory').val(),
            textAlignment: 'left',
            fontSize: 'normal',
            textColors: {}
        };
        
        const board = AppData.boards.find(b => b.id === AppData.currentBoard.id);
        if (!board) return;
        
        const cardId = $('#cardModal').data('id');
        
        if (cardId) {
            // Vorhandene Karte aktualisieren
            const cardIndex = board.cards.findIndex(c => c.id === cardId);
            if (cardIndex > -1) {
                board.cards[cardIndex] = Object.assign(board.cards[cardIndex], cardData, { updated: new Date().toISOString() });
            }
        } else {
            // Neue Karte erstellen
            cardData.created = new Date().toISOString();
            cardData.updated = cardData.created;
            board.cards.push(cardData);
        }
        
        StorageService.saveAppData();
        $('#cardModal').hide();
    },
    
    /**
     * Schülermodus umschalten
     */
    toggleStudentMode: function() {
        AppData.studentMode = $('#studentModeToggle').is(':checked');
        StorageService.saveAppData();
        Views.renderLatestActivitiesView();
    },
    
    /**
     * Hilfsfunktion: Zeigt ein Bestätigungsmodal
     * @param {string} title - Titel des Modals
     * @param {string} message - Nachricht
     * @param {function} onConfirm - Callback bei Bestätigung
     */
    showConfirmModal: function(title, message, onConfirm) {
        $('#confirmModalTitle').text(title);
        $('#confirmModalText').text(message);
        $('#confirmModal').show();
        $('#confirmBtn').off('click').on('click', function() {
            $('#confirmModal').hide();
            onConfirm();
        });
    },
    
    /**
     * URL-Parameter prüfen (für Freigabe-Links)
     */
    checkUrlParams: function() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('share')) {
            // Logik für Freigabe-Link
            const boardId = params.get('share');
            Controllers.openBoard(boardId);
        }
    },
    
    /**
     * Import Daten verarbeiten
     */
    importData: function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (StorageService.importData(data)) {
                        alert('Import erfolgreich!');
                        Views.renderLatestActivitiesView();
                    } else {
                        alert('Ungültiges Datenformat.');
                    }
                } catch (error) {
                    alert('Fehler beim Importieren der Daten.');
                }
            };
            reader.readAsText(file);
        }
    },
    
    /**
     * Link kopieren
     */
    copyShareLink: function() {
        const linkInput = document.getElementById('shareLink');
        linkInput.select();
        document.execCommand('copy');
        alert('Link wurde kopiert.');
    },
    
    /**
     * Share-Modal öffnen
     */
    openShareModal: function() {
        const shareLink = window.location.href;
        $('#shareLink').val(shareLink);
        $('#shareModal').show();
    }
};
