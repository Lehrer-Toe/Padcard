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
            const folder = FolderDAO.create(title, color);
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
            `Möchtest du den Ordner "${folder.name}" wirklich löschen? Die Padlets bleiben erhalten.`,
            () => {
                FolderDAO.delete(folderId);
                
                // Wenn wir im gelöschten Ordner sind, zurück zur Startseite
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
        
        // Aktuellen Ordner festlegen, wenn in Ordner-Ansicht
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
            
            // Ansicht aktualisieren
            if (AppData.view === 'board' && AppData.currentBoard && AppData.currentBoard.id === boardId) {
                // Board-Titel aktualisieren
                $('#boardTitle').text(title);
                $('#pageTitle').text(title);
            } else if (AppData.view === 'folder' && AppData.currentFolder) {
                // Ordner-Ansicht aktualisieren
                Views.renderBoardsInFolder(AppData.currentFolder.id);
            } else {
                // Startansicht aktualisieren
                Views.renderLatestActivitiesView();
            }
        } else {
            // Neues Board erstellen
            const board = BoardDAO.create(title, color, folderId || null);
            
            // Ansicht aktualisieren
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
            `Möchtest du das Padlet "${board.name}" wirklich löschen? Alle Karten werden ebenfalls gelöscht.`,
            () => {
                BoardDAO.delete(boardId);
                
                // Wenn wir im gelöschten Board sind, zurück zur vorherigen Ansicht
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
        
        // Kartentyp zurücksetzen
        $('.card-type-option').removeClass('active');
        $('.card-type-option[data-type="text"]').addClass('active');
        $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
        
        // Farbauswahl zurücksetzen
        $('.color-palette').removeClass('active');
        $('.color-palette[data-palette="material"]').addClass('active');
        $('.material-colors').show();
        $('.pastel-colors, .custom-colors').hide();
        $('.color-option').removeClass('active');
        $('.material-colors .color-option[data-color="blue"]').addClass('active');
        
        // Größenauswahl zurücksetzen
        $('.width-btn, .height-btn').removeClass('active');
        $('.width-btn[data-width="1"], .height-btn[data-height="1"]').addClass('active');
        
        // Kategorieauswahl zurücksetzen
        $('#cardCategory').val('');
        
        // Bild- und Audio-Vorschau zurücksetzen
        $('#imagePreview, #audioPreview').hide().empty();
        
        // Karten-ID löschen
        $('#cardModal').removeData('id');
        
        // Modal anzeigen
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
        
        // Formularwerte festlegen
        $('#cardModalTitle').text('Karte bearbeiten');
        $('#cardTitle').val(card.title || '');
        $('#cardContent').val(card.content || '');
        
        // Kartentyp festlegen
        $('.card-type-option').removeClass('active');
        $(`.card-type-option[data-type="${card.type || 'text'}"]`).addClass('active');
        
        // Alle typenspezifischen Felder ausblenden
        $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
        
        // Typenspezifische Felder anzeigen und füllen
        if (card.type === 'youtube') {
            $('.youtube-fields').show();
            $('#youtubeUrl').val(card.youtubeId ? `https://www.youtube.com/watch?v=${card.youtubeId}` : '');
        } else if (card.type === 'image') {
            $('.image-fields').show();
            $('#imageUrl').val(card.imageUrl || '');
            
            // Bildvorschau anzeigen
            if (card.imageUrl || card.imageData) {
                const imageUrl = card.imageData || card.imageUrl;
                $('#imagePreview').show().html(`<img src="${imageUrl}" alt="Vorschau">`);
            } else {
                $('#imagePreview').hide().empty();
            }
        } else if (card.type === 'link') {
            $('.link-fields').show();
            $('#linkUrl').val(card.linkUrl || '');
        } else if (card.type === 'learningapp') {
            $('.learningapp-fields').show();
            $('#learningappUrl').val(card.learningappId || '');
        } else if (card.type === 'audio') {
            $('.audio-fields').show();
            $('#audioUrl').val(card.audioUrl || '');
            
            // Audio-Vorschau anzeigen
            if (card.audioUrl || card.audioData) {
                const audioUrl = card.audioData || card.audioUrl;
                $('#audioPreview').show().html(`
                    <audio controls>
                        <source src="${audioUrl}" type="audio/mpeg">
                        Dein Browser unterstützt kein Audio-Element.
                    </audio>
                `);
            } else {
                $('#audioPreview').hide().empty();
            }
        }
        
        // Farbe festlegen
        let colorPalette = 'material';
        $('.color-option').removeClass('active');
        
        if (card.color === 'custom' && card.customColor) {
            colorPalette = 'custom';
            $('#customColorPicker').val(card.customColor);
            $('#customColorPreview').css('backgroundColor', card.customColor);
        } else {
            // Die richtige Palette für diese Farbe finden
            if (['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 
                 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 
                 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey'].includes(card.color)) {
                colorPalette = 'material';
                $(`.material-colors .color-option[data-color="${card.color}"]`).addClass('active');
            } else {
                // Versuchen, in Pastell- oder benutzerdefinierten Paletten zu finden
                const pastelOption = $(`.pastel-colors .color-option[data-custom-color="${card.customColor}"]`);
                const customOption = $(`.custom-colors .color-option[data-custom-color="${card.customColor}"]`);
                
                if (pastelOption.length) {
                    colorPalette = 'pastel';
                    pastelOption.addClass('active');
                } else if (customOption.length) {
                    colorPalette = 'custom';
                    customOption.addClass('active');
                } else {
                    // Standardmäßig Blau, wenn keine Übereinstimmung
                    colorPalette = 'material';
                    $('.material-colors .color-option[data-color="blue"]').addClass('active');
                }
            }
        }
        
        // Farbpalette festlegen
        $('.color-palette').removeClass('active');
        $(`.color-palette[data-palette="${colorPalette}"]`).addClass('active');
        $('.material-colors, .pastel-colors, .custom-colors').hide();
        $(`.${colorPalette}-colors`).show();
        
        // Größe festlegen
        $('.width-btn').removeClass('active');
        $(`.width-btn[data-width="${card.width || 1}"]`).addClass('active');
        
        $('.height-btn').removeClass('active');
        $(`.height-btn[data-height="${card.height || 1}"]`).addClass('active');
        
        // Kategorie festlegen
        $('#cardCategory').val(card.category || '');
        
        // Karten- und Board-ID im Formular speichern
        $('#cardModal').data('id', card.id);
        $('#cardModal').data('boardId', boardId);
        
        // Modal anzeigen
        $('#cardModal').show();
    },
    
    /**
     * Eine Karte speichern (erstellen oder aktualisieren)
     */
    async saveCard() {
        if (!AppData.currentBoard) return;
        
        const boardId = AppData.currentBoard.id;
        const cardId = $('#cardModal').data('id');
        const cardTitle = $('#cardTitle').val().trim();
        
        if (!cardTitle) {
            alert('Bitte gib einen Titel ein.');
            return;
        }
        
        // Ausgewählten Kartentyp abrufen
        const cardType = $('.card-type-option.active').data('type') || 'text';
        
        // Ausgewählte Farbe abrufen
        let cardColor = 'blue';
        let customColor = '';
        
        if ($('.color-option.active').length) {
            cardColor = $('.color-option.active').data('color');
            if (cardColor === 'custom') {
                customColor = $('.color-option.active').data('custom-color') || $('#customColorPicker').val();
            }
        }
        
        // Ausgewählte Größe abrufen
        const cardWidth = parseInt($('.width-btn.active').data('width') || 1);
        const cardHeight = parseInt($('.height-btn.active').data('height') || 1);
        
        // Ausgewählte Kategorie abrufen
        const cardCategory = $('#cardCategory').val();
        
        // Kartendaten vorbereiten
        const cardData = {
            title: cardTitle,
            content: $('#cardContent').val().trim(),
            type: cardType,
            color: cardColor,
            customColor: customColor,
            width: cardWidth,
            height: cardHeight,
            category: cardCategory
        };
        
        // Typenspezifische Daten hinzufügen
        if (cardType === 'youtube') {
            const youtubeId = Utils.getYoutubeId($('#youtubeUrl').val().trim());
            if (!youtubeId) {
                alert('Bitte gib eine gültige YouTube-URL ein.');
                return;
            }
            cardData.youtubeId = youtubeId;
        } else if (cardType === 'image') {
            // Zuerst auf hochgeladenes Bild prüfen
            const imageFile = $('#imageUpload')[0].files[0];
            if (imageFile) {
                try {
                    const imageData = await Utils.fileToBase64(imageFile);
                    cardData.imageData = imageData;
                } catch (error) {
                    console.error('Fehler beim Konvertieren des Bildes zu base64:', error);
                }
            } else {
                // Bild-URL verwenden
                const imageUrl = $('#imageUrl').val().trim();
                if (!imageUrl) {
                    alert('Bitte gib eine Bild-URL ein oder lade ein Bild hoch.');
                    return;
                }
                cardData.imageUrl = imageUrl;
            }
        } else if (cardType === 'link') {
            const linkUrl = $('#linkUrl').val().trim();
            if (!linkUrl) {
                alert('Bitte gib eine Link-URL ein.');
                return;
            }
            
            // https:// hinzufügen, falls es fehlt
            if (!/^https?:\/\//i.test(linkUrl)) {
                cardData.linkUrl = 'https://' + linkUrl;
            } else {
                cardData.linkUrl = linkUrl;
            }
        } else if (cardType === 'learningapp') {
            const learningappId = Utils.getLearningappId($('#learningappUrl').val().trim());
            if (!learningappId) {
                alert('Bitte gib eine gültige LearningApp-URL oder ID ein.');
                return;
            }
            cardData.learningappId = learningappId;
        } else if (cardType === 'audio') {
            // Zuerst auf hochgeladenes Audio prüfen
            const audioFile = $('#audioUpload')[0].files[0];
            if (audioFile) {
                try {
                    const audioData = await Utils.fileToBase64(audioFile);
                    cardData.audioData = audioData;
                } catch (error) {
                    console.error('Fehler beim Konvertieren des Audios zu base64:', error);
                }
            } else {
                // Audio-URL verwenden
                const audioUrl = $('#audioUrl').val().trim();
                if (!audioUrl) {
                    alert('Bitte gib eine Audio-URL ein oder lade eine Audio-Datei hoch.');
                    return;
                }
                cardData.audioUrl = audioUrl;
            }
        }
        
        // Karte speichern
        if (cardId) {
            // Vorhandene Karte aktualisieren
            BoardDAO.updateCard(boardId, cardId, cardData);
        } else {
            // Neue Karte erstellen
            BoardDAO.addCard(boardId, cardData);
        }
        
        // Ansicht aktualisieren
        this.refreshBoardView();
        
        // Modal ausblenden
        $('#cardModal').hide();
        $('#cardModal').removeData('id');
    },
    
    /**
     * Eine Karte duplizieren
     * @param {string} boardId - Board-ID
     * @param {string} cardId - Karten-ID
     */
    duplicateCard: function(boardId, cardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        
        const card = board.cards.find(c => c.id === cardId);
        if (!card) return;
        
        // Eine Kopie der Karte erstellen
        const newCardData = { ...card };
        delete newCardData.id; // ID entfernen, damit eine neue generiert wird
        
        // "(Kopie)" zum Titel hinzufügen
        newCardData.title = `${newCardData.title} (Kopie)`;
        
        // In der freien Ansicht die Position leicht versetzen
        if (AppData.currentBoard.view === 'free' && newCardData.position) {
            newCardData.position = {
                left: newCardData.position.left + 20,
                top: newCardData.position.top + 20
            };
        }
        
        // Die neue Karte hinzufügen
        BoardDAO.addCard(boardId, newCardData);
        
        // Ansicht aktualisieren
        this.refreshBoardView();
    },
    
    /**
     * Eine Karte löschen
     * @param {string} boardId - Board-ID
     * @param {string} cardId - Karten-ID
     */
    deleteCard: function(boardId, cardId) {
        Views.showConfirmModal(
            'Karte löschen',
            'Möchtest du diese Karte wirklich löschen?',
            () => {
                BoardDAO.deleteCard(boardId, cardId);
                this.refreshBoardView();
            }
        );
    },
    
    /**
     * Karten basierend auf Sucheingabe filtern
     */
    filterCards: function() {
        const searchTerm = $('#searchInput').val().toLowerCase();
        
        if (AppData.currentBoard.view === 'grid' || AppData.currentBoard.view === 'free') {
            $('.card:not(.add-card)').each(function() {
                const title = $(this).find('.card-title').text().toLowerCase();
                const content = $(this).find('.card-text').text().toLowerCase();
                
                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else if (AppData.currentBoard.view === 'categories') {
            // Zuerst Karten ein-/ausblenden
            $('.card:not(.add-card)').each(function() {
                const title = $(this).find('.card-title').text().toLowerCase();
                const content = $(this).find('.card-text').text().toLowerCase();
                
                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
            
            // Dann Kategorien ohne sichtbare Karten ausblenden
            $('.category').each(function() {
                const visibleCards = $(this).find('.card:visible').length;
                const hasPlaceholder = $(this).find('.category-placeholder').length > 0;
                
                if (visibleCards === 0 && (searchTerm || hasPlaceholder)) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        }
    },
    
    /**
     * Die aktuelle Board-Ansicht aktualisieren
     */
    refreshBoardView: function() {
        if (!AppData.currentBoard) return;
        
        const board = AppData.currentBoard;
        
        if (board.view === 'grid') {
            Views.renderCardsGrid(board);
        } else if (board.view === 'free') {
            Views.renderCardsFree(board);
        } else if (board.view === 'categories') {
            Views.renderCardsCategories(board);
        }
    },
    
    /**
     * Das Kategorie-Modal öffnen
     */
    openCategoryModal: function() {
        if (!AppData.currentBoard) return;
        
        // Kategorieliste rendern
        Views.renderCategoriesList(AppData.currentBoard);
        
        // Neue Kategorie-Eingabe zurücksetzen
        $('#newCategoryInput').val('');
        
        // Modal anzeigen
        $('#categoryModal').show();
    },
    
    /**
     * Eine neue Kategorie erstellen
     */
    createCategory: function() {
        if (!AppData.currentBoard) return;
        
        // Das Modal mit Aufforderung öffnen
        $('#categoryModal').show();
        $('#newCategoryInput').focus();
    },
    
    /**
     * Eine neue Kategorie speichern
     */
    saveCategory: function() {
        if (!AppData.currentBoard) return;
        
        const categoryName = $('#newCategoryInput').val().trim();
        if (!categoryName) {
            alert('Bitte gib einen Namen für die Kategorie ein.');
            return;
        }
        
        // Die Kategorie hinzufügen
        BoardDAO.addCategory(AppData.currentBoard.id, categoryName);
        
        // Ansichten aktualisieren
        Views.renderCategoriesList(AppData.currentBoard);
        Views.updateCategoryDropdown(AppData.currentBoard);
        
        if (AppData.currentBoard.view === 'categories') {
            Views.renderCardsCategories(AppData.currentBoard);
        }
        
        // Eingabe zurücksetzen
        $('#newCategoryInput').val('');
    },
    
    /**
     * Eine Kategorie bearbeiten
     * @param {string} categoryId - Kategorie-ID
     */
    editCategory: function(categoryId) {
        if (!AppData.currentBoard) return;
        
        const category = AppData.currentBoard.categories.find(cat => cat.id === categoryId);
        if (!category) return;
        
        const newName = prompt('Kategorie umbenennen:', category.name);
        if (newName && newName.trim()) {
            // Die Kategorie aktualisieren
            BoardDAO.updateCategory(AppData.currentBoard.id, categoryId, newName.trim());
            
            // Ansichten aktualisieren
            Views.renderCategoriesList(AppData.currentBoard);
            Views.updateCategoryDropdown(AppData.currentBoard);
            
            if (AppData.currentBoard.view === 'categories') {
                Views.renderCardsCategories(AppData.currentBoard);
            }
        }
    },
    
    /**
     * Eine Kategorie löschen
     * @param {string} categoryId - Kategorie-ID
     */
    deleteCategory: function(categoryId) {
        if (!AppData.currentBoard) return;
        
        const category = AppData.currentBoard.categories.find(cat => cat.id === categoryId);
        if (!category) return;
        
        Views.showConfirmModal(
            'Kategorie löschen',
            `Möchtest du die Kategorie "${category.name}" wirklich löschen? Die Karten werden nicht gelöscht, sondern nur aus der Kategorie entfernt.`,
            () => {
                // Die Kategorie löschen
                BoardDAO.deleteCategory(AppData.currentBoard.id, categoryId);
                
                // Ansichten aktualisieren
                Views.renderCategoriesList(AppData.currentBoard);
                Views.updateCategoryDropdown(AppData.currentBoard);
                
                if (AppData.currentBoard.view === 'categories') {
                    Views.renderCardsCategories(AppData.currentBoard);
                }
            }
        );
    },
    
    /**
     * Das Hintergrund-Modal öffnen
     */
    openBackgroundModal: function() {
        if (!AppData.currentBoard) return;
        
        // Formular zurücksetzen
        $('#backgroundUrl').val('');
        $('#backgroundUpload').val('');
        $('#backgroundFileName').text('Keine Datei ausgewählt');
        
        // Vorschaubilder zurücksetzen
        $('.bg-preview').css('backgroundImage', '');
        
        // Standardwerte aus aktuellem Hintergrund setzen, falls vorhanden
        if (AppData.currentBoard.background) {
            const bg = AppData.currentBoard.background;
            
            if (bg.url) {
                $('#backgroundUrl').val(bg.url);
            }
            
            // Stil festlegen
            $('.background-style-option').removeClass('active');
            $(`.background-style-option[data-style="${bg.style || 'cover'}"]`).addClass('active');
            
            // Deckkraft festlegen
            $('#backgroundOpacity').val(bg.opacity !== undefined ? bg.opacity : 100);
            $('#opacityValue').text(`${bg.opacity !== undefined ? bg.opacity : 100}%`);
            
            // Vorschau festlegen
            if (bg.data || bg.url) {
                $('.bg-preview').css('backgroundImage', `url(${bg.data || bg.url})`);
            }
        }
        
        // Modal anzeigen
        $('#backgroundModal').show();
    },
    
    /**
     * Hintergrundeinstellungen speichern
     */
    async saveBackground() {
        if (!AppData.currentBoard) return;
        
        // Hintergrunddaten vorbereiten
        const backgroundData = {
            url: $('#backgroundUrl').val().trim(),
            style: $('.background-style-option.active').data('style') || 'cover',
            opacity: parseInt($('#backgroundOpacity').val()) || 100
        };
        
        // Auf hochgeladene Datei prüfen
        const backgroundFile = $('#backgroundUpload')[0].files[0];
        if (backgroundFile) {
            try {
                const backgroundImage = await Utils.fileToBase64(backgroundFile);
                backgroundData.data = backgroundImage;
                backgroundData.url = ''; // URL löschen, wenn wir eine Daten-URI haben
            } catch (error) {
                console.error('Fehler beim Konvertieren des Hintergrunds zu base64:', error);
            }
        }
        
        // Überprüfen, ob wir entweder URL oder Daten haben
        if (!backgroundData.url && !backgroundData.data) {
            alert('Bitte gib eine URL ein oder lade ein Bild hoch.');
            return;
        }
        
        // Hintergrund speichern
        BoardDAO.setBackground(AppData.currentBoard.id, backgroundData);
        
        // Hintergrund anwenden
        Views.applyBoardBackground(AppData.currentBoard);
        
        // Modal ausblenden
        $('#backgroundModal').hide();
    },
    
    /**
     * Hintergrund vom Board entfernen
     */
    removeBackground: function() {
        if (!AppData.currentBoard) return;
        
        BoardDAO.removeBackground(AppData.currentBoard.id);
        
        // Ansicht aktualisieren
        Views.applyBoardBackground(AppData.currentBoard);
        
        // Modal ausblenden
        $('#backgroundModal').hide();
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
        
        // In Kategorieansicht aktualisieren, um leere Kategorien auszublenden
        if (AppData.currentBoard && AppData.currentBoard.view === 'categories') {
            Views.renderCardsCategories(AppData.currentBoard);
        }
        
        // In localStorage speichern
        StorageService.saveAppData();
        
        // Freigabe-Link aktualisieren
        this.updateShareLink();
    },
    
    /**
     * Share-Modal öffnen
     */
    openShareModal: function() {
        this.updateShareLink();
        $('#shareModal').show();
    },
    
    /**
     * Freigabe-Link aktualisieren
     */
    updateShareLink: function() {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', 'student');
        $('#shareLink').val(url.toString());
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
    },
    
    /**
     * Daten aus Datei importieren
     * @param {Event} event - Change-Event vom Dateieingabefeld
     */
    importData: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Importierte Daten validieren
                if (importedData && Array.isArray(importedData.folders) && Array.isArray(importedData.boards)) {
                    Views.showConfirmModal(
                        'Daten importieren',
                        'Möchtest du die aktuellen Daten mit den importierten ersetzen? Alle vorhandenen Daten werden überschrieben.',
                        () => {
                            if (StorageService.importData(importedData)) {
                                // Ansicht aktualisieren
                                Views.renderLatestActivitiesView();
                                alert('Daten erfolgreich importiert.');
                            } else {
                                alert('Fehler beim Importieren der Daten.');
                            }
                        }
                    );
                } else {
                    alert('Die importierte Datei enthält keine gültigen Daten.');
                }
            } catch (error) {
                console.error('Import-Fehler:', error);
                alert('Fehler beim Importieren: Ungültiges Dateiformat.');
            }
        };
        reader.readAsText(file);
        
        // Eingabewert zurücksetzen, um die gleiche Datei erneut importieren zu können
        event.target.value = '';
    },
    
    /**
     * URL-Parameter beim Laden überprüfen
     */
    checkUrlParams: function() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Auf Schülermodus prüfen
        if (urlParams.get('mode') === 'student') {
            $('#studentModeToggle').prop('checked', true);
            this.toggleStudentMode();
        }
        
        // Auf spezifisches Board oder Ordner prüfen
        const boardId = urlParams.get('board');
        const folderId = urlParams.get('folder');
        
        if (boardId) {
            this.openBoard(boardId);
        } else if (folderId) {
            this.openFolder(folderId);
        }
    }
};
6. app.js
javascript/**
 * Hauptinitialisierung für snapWall
 */

// Anwendung initialisieren, wenn das Dokument bereit ist
$(document).ready(function() {
    console.log("snapWall wird initialisiert...");
    
    // Daten aus localStorage laden oder Standarddaten initialisieren
    if (!StorageService.loadAppData()) {
        StorageService.initDefaultData();
    }
    
    // Fallback für fehlendes Logo erstellen
    $('.logo').on('error', function() {
        this.onerror = null;
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzIxOTZGMyIgcng9IjEwIiByeT0iMTAiLz48dGV4dCB4PSI1MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlM8L3RleHQ+PC9zdmc+';
    });
    
    // Views initialisieren
    Views.init();
    
    // Controller initialisieren
    Controllers.init();
    
    // Startansicht rendern
    Views.renderLatestActivitiesView();
    
    // URL-Parameter prüfen (für Freigabe-Links)
    Controllers.checkUrlParams();
    
    // Dropdown-Menüs einrichten
    $('.dropdown-toggle').on('click', function() {
        $(this).siblings('.dropdown-menu').toggleClass('show');
    });
    
    // Dropdown-Menüs schließen, wenn außerhalb geklickt wird
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown').length) {
            $('.dropdown-menu').removeClass('show');
        }
    });
    
    // Event-Handler für Navigation
    $('#menuLatestActivity').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        Views.renderLatestActivitiesView();
    });
    
    $('#menuMySnaps').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        Views.renderMyPadcardsView();
    });
    
    $('#menuFavorites').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        $('#pageTitle').text('Favoriten');
    });
    
    $('#menuTrash').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        $('#pageTitle').text('Papierkorb');
    });
    
    // Toggle für Schülermodus
    $('#studentModeToggle').on('change', function() {
        Controllers.toggleStudentMode();
    });
    
    // "Snap erstellen"-Karten
    $('.create-padlet-card, #createNewBtn').on('click', function() {
        Controllers.createBoard();
    });
    
    console.log("snapWall wurde erfolgreich initialisiert!");
});
7. CSS-Ergänzungen für styles.css
css/* Card Type Selector */
.card-type-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;
}

.card-type-option {
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    width: 80px;
    transition: all 0.2s;
}

.card-type-option:hover {
    background-color: var(--hover-bg);
}

.card-type-option.active {
    background-color: var(--active-bg);
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.card-type-option i {
    font-size: 20px;
}

/* Color Palette Selector */
.color-palette-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
}

.color-palette {
    padding: 5px 10px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
}

.color-palette:hover {
    background-color: var(--hover-bg);
}

.color-palette.active {
    background-color: var(--active-bg);
    border-color: var(--primary-color);
    color: var(--primary-color);
}

/* Size Selectors */
.width-container, .height-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.width-btn, .height-btn {
    padding: 5px 10px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
}

.width-btn:hover, .height-btn:hover {
    background-color: var(--hover-bg);
}

.width-btn.active, .height-btn.active {
    background-color: var(--active-bg);
    border-color: var(--primary-color);
    color: var(--primary-color);
}

/* Background Style Selector */
.background-style-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.background-style-option {
    padding: 5px 10px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.2s;
}

.background-style-option:hover {
    background-color: var(--hover-bg);
}

.background-style-option.active {
    background-color: var(--active-bg);
    border-color: var(--primary-color);
    color: var(--primary-color);
}

/* Background Preview */
.bg-preview {
    height: 150px;
    background-color: #f0f0f0;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    margin-bottom: 15px;
    background-size: cover;
    background-position: center;
}

/* Board Header */
.board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
}

.board-title {
    font-size: 1.8rem;
    font-weight: 600;
    margin-right: 15px;
}

.board-controls {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
}

.view-selector, .layout-selector {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* Board Views */
#boardGrid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

#boardFree {
    position: relative;
    min-height: 600px;
}

#boardCategories {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

/* Card Styles */
.card {
    background-color: white;
    border-radius: var(--card-border-radius);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    border-top: 4px solid var(--primary-color);
    transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.card-content {
    padding: 15px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
}

.card-title {
    font-weight: 600;
    font-size: 1.1rem;
    margin-right: 10px;
}

.card-menu {
    position: relative;
    cursor: pointer;
    color: var(--text-secondary);
}

.card-menu:hover {
    color: var(--text-color);
}

.card-menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    display: none;
    min-width: 160px;
    padding: 5px 0;
    margin: 2px 0 0;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-menu-dropdown.show {
    display: block;
}

.card-menu-item {
    padding: 8px 15px;
    cursor: pointer;
}

.card-menu-item:hover {
    background-color: var(--hover-bg);
}

.card-text {
    margin-top: 5px;
    color: var(--text-secondary);
    line-height: 1.5;
    overflow-wrap: break-word;
    flex-grow: 1;
}

/* Card Types */
.card-youtube, .card-image, .card-link, .card-learningapp, .card-audio {
    margin-top: 10px;
}

.card-youtube {
    position: relative;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    height: 0;
    overflow: hidden;
}

.card-youtube img, .card-youtube iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 2;
}

.card-image img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
}

.card-link {
    padding: 10px 0;
}

.card-learningapp {
    position: relative;
    padding-bottom: 100%; /* 1:1 Aspect Ratio */
    height: 0;
    overflow: hidden;
}

.card-learningapp iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.card-audio {
    padding: 10px 0;
}

.card-audio audio {
    width: 100%;
}

/* Add Card Button */
.add-card {
    border: 2px dashed var(--border-color);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    min-height: 150px;
    padding: 20px;
    transition: all 0.2s;
}

.add-card:hover {
    border-color: var(--primary-color);
    background-color: var(--hover-bg);
}

.add-card-icon {
    font-size: 24px;
    color: var(--primary-color);
    margin-bottom: 10px;
}

/* Categories */
.category {
    background-color: white;
    border-radius: var(--card-border-radius);
    box-shadow: var(--card-shadow);
    padding: 20px;
}

.category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.category-title {
    font-size: 1.2rem;
    font-weight: 600;
}

.category-actions {
    display: flex;
    gap: 5px;
}

.category-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    min-height: 50px;
}

.category-placeholder {
    grid-column: 1 / -1;
    text-align: center;
    padding: 15px;
    color: var(--text-secondary);
    font-style: italic;
}

.add-category {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    border: 2px dashed var(--border-color);
    border-radius: var(--card-border-radius);
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.add-category:hover {
    border-color: var(--primary-color);
    background-color: var(--hover-bg);
}

.add-category-icon {
    font-size: 24px;
    color: var(--primary-color);
    margin-bottom: 10px;
}

/* Category List in Modal */
.category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid var(--border-color);
}

.category-item:last-child {
    border-bottom: none;
}

.category-item-actions {
    display: flex;
    gap: 5px;
}

.category-item-actions button {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 5px;
}

.category-item-actions button:hover {
    color: var(--text-color);
}

/* Color preview */
.color-preview {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-block;
    margin: 0 10px;
    border: 2px solid #ddd;
}

/* Resize handle for free positioning */
.resize-handle {
    position: absolute;
    bottom: 5px;
    right: 5px;
    cursor: se-resize;
    color: var(--text-secondary);
    font-size: 12px;
}

/* Padlet Card (Board Preview) */
.padlet-card {
    background-color: white;
    border-radius: var(--card-border-radius);
    box-shadow: var(--card-shadow);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
}

.padlet-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.padlet-preview {
    height: 120px;
    position: relative;
    overflow: hidden;
}

.padlet-preview-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    opacity: 0.7;
}

.padlet-content {
    padding: 15px;
}

.padlet-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
}

.padlet-title {
    font-weight: 600;
    font-size: 1.1rem;
    margin-right: 10px;
}

.padlet-menu {
    position: relative;
}

.padlet-menu-trigger {
    cursor: pointer;
    color: var(--text-secondary);
    padding: 5px;
}

.padlet-menu-trigger:hover {
    color: var(--text-color);
}

.padlet-menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    display: none;
    min-width: 180px;
    padding: 5px 0;
    margin: 2px 0 0;
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.padlet-menu-dropdown.show {
    display: block;
}

.padlet-menu-item {
    padding: 8px 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
}

.padlet-menu-item:hover {
    background-color: var(--hover-bg);
}

.padlet-meta {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 15px;
}

.padlet-meta-item {
    margin-bottom: 5px;
}

.padlet-author {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
}

.padlet-author-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
}

/* Input groups and utility classes */
.input-group {
    display: flex;
}

.input-group .form-control {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    flex: 1;
}

.input-group .btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.mt-1 {
    margin-top: 0.25rem;
}

.mt-2 {
    margin-top: 0.5rem;
}

.mt-3 {
    margin-top: 1rem;
}

.text-secondary {
    color: var(--text-secondary);
}

.text-muted {
    color: var(--text-secondary);
    font-size: 0.875rem;
}

.text-center {
    text-align: center;
}

.p-3 {
    padding: 1rem;
}WiederholenClaude kann Fehler machen. Bitte überprüfen Sie die Antworten. 3.7 Sonnet