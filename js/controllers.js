/**
 * Controllers für snapWall
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
        
        // Board-Datei-Upload (Hintergrund & Vorschau)
        $('#boardBackgroundUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                $('#boardBackgroundFileName').text(file.name);
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#boardBackgroundPreview').show().html(`<img src="${e.target.result}" alt="Vorschau">`);
                };
                reader.readAsDataURL(file);
            }
        });
        
        $('#boardPreviewUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                $('#boardPreviewFileName').text(file.name);
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#boardPreviewImagePreview').show().html(`<img src="${e.target.result}" alt="Vorschau">`);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Karten-Aktionen
        $('#newCardBtn, #addCardBtnGrid').on('click', () => this.createCard());
        $('#saveCardBtn').on('click', () => this.saveCard());
        $('#cancelCardBtn, #closeCardModal').on('click', () => $('#cardModal').hide());
        
        // Text-Formatierungen
        $('.format-btn[data-align]').on('click', function() {
            $('.format-btn[data-align]').removeClass('active');
            $(this).addClass('active');
        });
        
        $('.format-btn[data-size]').on('click', function() {
            $('.format-btn[data-size]').removeClass('active');
            $(this).addClass('active');
        });
        
        $('#applyTextColor').on('click', function() {
            const color = $('#textColorPicker').val();
            const textarea = $('#cardContent')[0];
            
            if (textarea.selectionStart !== undefined && textarea.selectionStart !== textarea.selectionEnd) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = textarea.value.substring(start, end);
                
                // Merken für spätere Speicherung
                $(textarea).data('textColors', $(textarea).data('textColors') || {});
                $(textarea).data('textColors')[selectedText] = color;
                
                // Visuelles Feedback
                const beforeText = textarea.value.substring(0, start);
                const afterText = textarea.value.substring(end);
                textarea.value = beforeText + '[' + selectedText + ']' + afterText;
            }
        });
        
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
        
        // Farbauswahl für Karten
        $(document).on('click', '.color-option', function() {
            const container = $(this).closest('.color-picker-row');
            container.find('.color-option').removeClass('active');
            $(this).addClass('active');
            
            // Vorschau aktualisieren
            const color = $(this).data('color') || $(this).css('backgroundColor');
            $('#cardColorPreview').css('backgroundColor', color);
        });
        
        // RGB-Farbauswahl
        $('#cardRgbColor').on('change', function() {
            const color = $(this).val();
            $('#cardColorPreview').css('backgroundColor', color);
        });
        
        // RGB-Farbauswahl für Board
        $('#customRgbColor').on('change', function() {
            const color = $(this).val();
            // Markierung von der farbpalette entfernen
            $('#boardColorPickerRow .color-option').removeClass('active');
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
        
        // Elternordner-Dropdown aktualisieren
        this.updateParentFolderSelect();
        
        // Farbauswahl zurücksetzen
        $('#folderColorPicker .color-option').removeClass('active');
        $('#folderColorPicker .color-option').first().addClass('active');
        
        // Modal anzeigen
        $('#folderModal').show();
    },
    
    /**
     * Elternordner-Dropdown aktualisieren
     * @param {string} [excludeFolderId] - ID des Ordners, der ausgeschlossen werden soll (bei Bearbeitung)
     */
    updateParentFolderSelect: function(excludeFolderId) {
        const parentSelect = $('#parentFolderSelect');
        parentSelect.empty();
        
        // "Kein Elternordner"-Option hinzufügen
        parentSelect.append('<option value="">Kein übergeordneter Ordner</option>');
        
        // Rekursiv Ordnerstruktur bauen
        const buildFolderTree = (parentId, level) => {
            const folders = FolderDAO.getChildFolders(parentId).filter(folder => folder.id !== excludeFolderId);
            
            folders.forEach(folder => {
                // Nicht den Ordner selbst oder dessen Unterordner als Parent erlauben
                if (folder.id !== excludeFolderId) {
                    const indent = '&nbsp;'.repeat(level * 4);
                    parentSelect.append(`<option value="${folder.id}">${indent}${folder.name}</option>`);
                    buildFolderTree(folder.id, level + 1);
                }
            });
        };
        
        // Mit Root-Ordnern beginnen
        buildFolderTree(null, 0);
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
        
        // Elternordner auswählen, aber nicht sich selbst oder Unterordner erlauben
        this.updateParentFolderSelect(folderId);
        $('#parentFolderSelect').val(folder.parentId || '');
        
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
        const parentId = $('#parentFolderSelect').val();
        const folderId = $('#folderModal').data('id');
        
        // Prüfen, ob der ausgewählte Elternordner kein Kind des zu bearbeitenden Ordners ist
        if (folderId && parentId && FolderDAO.isAncestor(parentId, folderId)) {
            alert('Der ausgewählte übergeordnete Ordner kann nicht ein Unterordner des aktuellen Ordners sein.');
            return;
        }
        
        if (folderId) {
            // Vorhandenen Ordner aktualisieren
            FolderDAO.update(folderId, { 
                name: title, 
                color: color,
                parentId: parentId || null 
            });
            
            // Ansicht aktualisieren
            if (AppData.view === 'folder' && AppData.currentFolder && AppData.currentFolder.id === folderId) {
                Views.renderFolderView(folderId);
            } else {
                Views.renderFolderList();
            }
        } else {
            // Neuen Ordner erstellen
            const folder = FolderDAO.create(title, color, parentId);
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
            `Möchtest du den Ordner "${folder.name}" wirklich löschen? Die Snaps bleiben erhalten.`,
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
        $('#boardModalTitle').text('Neuer Snap');
        $('#boardTitleInput').val('');
        
        // Farbauswahl zurücksetzen
        $('#boardColorPickerRow .color-option').removeClass('active');
        $('#boardColorPickerRow .color-option').first().addClass('active');
        $('#customRgbColor').val('#2196F3');
        
        // Ordner-Auswahlmenü aktualisieren
        Views.updateFolderSelect();
        
        // Aktuellen Ordner festlegen, wenn in Ordner-Ansicht
        if (AppData.view === 'folder' && AppData.currentFolder) {
            $('#boardFolderSelect').val(AppData.currentFolder.id);
        } else {
            $('#boardFolderSelect').val('');
        }
        
        // Bild-Vorschauen zurücksetzen
        $('#boardBackgroundFileName').text('Keine Datei ausgewählt');
        $('#boardPreviewFileName').text('Keine Datei ausgewählt');
        $('#boardBackgroundPreview, #boardPreviewImagePreview').empty().hide();
        
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
        $('#boardModalTitle').text('Snap bearbeiten');
        $('#boardTitleInput').val(board.name);
        
        // Farbe festlegen
        $('#boardColorPickerRow .color-option').removeClass('active');
        const colorOption = $(`#boardColorPickerRow .color-option[data-color="${board.color}"]`);
        if (colorOption.length) {
            colorOption.addClass('active');
        } else {
            // Wenn es keine vordefinierte Farbe ist, RGB-Wert verwenden
            $('#customRgbColor').val(board.color);
        }
        
        // Ordner-Auswahlmenü aktualisieren
        Views.updateFolderSelect();
        $('#boardFolderSelect').val(board.folderId || '');
        
        // Bild-Vorschauen zurücksetzen und bestehende laden
        $('#boardBackgroundFileName').text('Keine Datei ausgewählt');
        $('#boardPreviewFileName').text('Keine Datei ausgewählt');
        $('#boardBackgroundPreview, #boardPreviewImagePreview').empty().hide();
        
        // Bestehende Bilder anzeigen, falls vorhanden
        if (board.background && (board.background.data || board.background.url)) {
            const bgUrl = board.background.data || board.background.url;
            $('#boardBackgroundPreview').show().html(`<img src="${bgUrl}" alt="Hintergrund">`);
        }
        
        if (board.previewImage) {
            $('#boardPreviewImagePreview').show().html(`<img src="${board.previewImage}" alt="Vorschaubild">`);
        }
        
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
    async saveBoard() {
        const title = $('#boardTitleInput').val().trim();
        if (!title) {
            alert('Bitte gib einen Titel ein.');
            return;
        }
        
        // Farbe aus Auswahl oder RGB-Picker
        let color;
        const activeColor = $('#boardColorPickerRow .color-option.active');
        if (activeColor.length) {
            color = activeColor.data('color') || activeColor.css('backgroundColor');
        } else {
            color = $('#customRgbColor').val();
        }
        
        const folderId = $('#boardFolderSelect').val();
        const boardId = $('#boardModal').data('id');
        
        // Hintergrundbild und Vorschaubild erfassen
        let backgroundData = null;
        let previewImageData = null;
        
        const bgFile = $('#boardBackgroundUpload')[0].files[0];
        if (bgFile) {
            try {
                backgroundData = await Utils.fileToBase64(bgFile);
            } catch (error) {
                console.error('Fehler beim Laden des Hintergrundbildes:', error);
            }
        }
        
        const previewFile = $('#boardPreviewUpload')[0].files[0];
        if (previewFile) {
            try {
                previewImageData = await Utils.fileToBase64(previewFile);
            } catch (error) {
                console.error('Fehler beim Laden des Vorschaubildes:', error);
            }
        }
        
        if (boardId) {
            // Vorhandenes Board aktualisieren
            const updateData = { 
                name: title, 
                color: color,
                folderId: folderId || null
            };
            
            const board = BoardDAO.getById(boardId);
            
            // Hintergrundbild aktualisieren, wenn ein neues hochgeladen wurde
            if (backgroundData) {
                updateData.background = new Background({
                    data: backgroundData,
                    style: 'cover',
                    opacity: 100
                });
            }
            
            // Vorschaubild aktualisieren, wenn ein neues hochgeladen wurde
            if (previewImageData) {
                updateData.previewImage = previewImageData;
            }
            
            BoardDAO.update(boardId, updateData);
            
            // Ansicht aktualisieren
            if (AppData.view === 'board' && AppData.currentBoard && AppData.currentBoard.id === boardId) {
                // Board-Titel aktualisieren
                $('#boardTitle').text(title);
                $('#pageTitle').text(title);
                
                // Hintergrund aktualisieren, wenn ein neuer hochgeladen wurde
                if (backgroundData) {
                    Views.applyBoardBackground(BoardDAO.getById(boardId));
                }
            } else if (AppData.view === 'folder' && AppData.currentFolder) {
                // Ordner-Ansicht aktualisieren
                Views.renderBoardsInFolder(AppData.currentFolder.id);
            } else {
                // Startansicht aktualisieren
                Views.renderLatestActivitiesView();
            }
        } else {
            // Optionen für das neue Board zusammenstellen
            const options = {};
            
            if (backgroundData) {
                options.background = new Background({
                    data: backgroundData,
                    style: 'cover',
                    opacity: 100
                });
            }
            
            if (previewImageData) {
                options.previewImage = previewImageData;
            }
            
            // Neues Board erstellen
            const board = BoardDAO.create(title, color, folderId || null, options);
            
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
            'Snap löschen',
            `Möchtest du den Snap "${board.name}" wirklich löschen? Alle Karten werden ebenfalls gelöscht.`,
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
        
        // Textformatierungen zurücksetzen
        $('.format-btn[data-align]').removeClass('active');
        $('.format-btn[data-align="left"]').addClass('active');
        
        $('.format-btn[data-size]').removeClass('active');
        $('.format-btn[data-size="normal"]').addClass('active');
        
        $('#textColorPicker').val('#000000');
        $('#cardContent').data('textColors', {});
        
        // Kartentyp zurücksetzen
        $('.card-type-option').removeClass('active');
        $('.card-type-option[data-type="text"]').addClass('active');
        $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
        
        // Farbauswahl zurücksetzen
        $('#cardColorPickerRow .color-option').removeClass('active');
        $('#cardColorPickerRow .color-option[data-color="blue"]').addClass('active');
        $('#cardRgbColor').val('#2196F3');
        $('#cardColorPreview').css('backgroundColor', '#2196F3');
        
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
        
        // Textformatierungen festlegen
        $('.format-btn[data-align]').removeClass('active');
        $(`.format-btn[data-align="${card.textAlignment || 'left'}"]`).addClass('active');
        
        $('.format-btn[data-size]').removeClass('active');
        $(`.format-btn[data-size="${card.fontSize || 'normal'}"]`).addClass('active');
        
        // Textfarben setzen
        $('#cardContent').data('textColors', card.textColors || {});
        
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
        $('#cardColorPickerRow .color-option').removeClass('active');
        
        if (card.color === 'custom' && card.customColor) {
            $('#cardRgbColor').val(card.customColor);
            $('#cardColorPreview').css('backgroundColor', card.customColor);
        } else {
            // Die richtige Option in der Farbpalette suchen
            const colorOption = $(`#cardColorPickerRow .color-option[data-color="${card.color}"]`);
            if (colorOption.length) {
                colorOption.addClass('active');
                $('#cardColorPreview').css('backgroundColor', colorOption.css('backgroundColor'));
            } else {
                // Standardmäßig Blau, wenn keine Übereinstimmung
                $(`#cardColorPickerRow .color-option[data-color="blue"]`).addClass('active');
                $('#cardColorPreview').css('backgroundColor', '#2196F3');
            }
        }
        
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
        
        // Textformatierungen abrufen
        const textAlignment = $('.format-btn[data-align].active').data('align') || 'left';
        const fontSize = $('.format-btn[data-size].active').data('size') || 'normal';
        const textColors = $('#cardContent').data('textColors') || {};
        
        // Ausgewählte Farbe abrufen
        let cardColor = 'blue';
        let customColor = '';
        
        const activeColor = $('#cardColorPickerRow .color-option.active');
        if (activeColor.length) {
            cardColor = activeColor.data('color') || 'blue';
        } else {
            cardColor = 'custom';
            customColor = $('#cardRgbColor').val();
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
            textAlignment: textAlignment,
            fontSize: fontSize,
            textColors: textColors,
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
        
        // Offline-Version erstellen (für Tests)
        if (AppData.currentBoard) {
            this.exportOfflineVersion();
        }
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
    },

    /**
     * Exportiert die aktuelle Board-Ansicht als Offline-HTML-Datei
     */
    exportOfflineVersion: function() {
        if (!AppData.currentBoard) {
            alert('Bitte öffne zuerst ein Board, bevor du eine Offline-Version erstellst.');
            return;
        }
        
        StorageService.exportOfflineVersion(AppData.currentBoard.id);
    }
};