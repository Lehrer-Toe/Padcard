/**
 * Controllers for Taskcard-Manager
 *
 * Dieses File enthält die Controller-Logik, die Benutzerinteraktionen verarbeitet
 * und die Modelle mit den Views verbindet.
 */

const Controllers = {
    /**
     * Initialisiert alle Controller
     */
    init: function() {
        this.initEventHandlers();
    },

    /**
     * Registriert sämtliche Eventhandler
     */
    initEventHandlers: function() {
        // Navigation
        $('.breadcrumb-home').on('click', () => this.navigateHome());

        // Folder-Aktionen
        $('#newFolderBtn').on('click', () => this.createFolder());
        $('#saveFolderBtn').on('click', () => this.saveFolder());
        $('#cancelFolderBtn, #closeFolderModal').on('click', () => $('#folderModal').hide());
        $('#editFolderBtn').on('click', () => this.editCurrentFolder());

        // Board-Aktionen
        $('#newBoardBtn, #newBoardInFolderBtn').on('click', () => this.createBoard());
        $('#saveBoardBtn').on('click', () => this.saveBoard());
        $('#cancelBoardBtn, #closeBoardModal').on('click', () => $('#boardModal').hide());
        $('#editBoardTitleBtn').on('click', () => this.editCurrentBoard());

        // Card-Aktionen
        $('#newCardBtn, #addCardBtnGrid').on('click', () => this.createCard());
        $('#saveCardBtn').on('click', () => this.saveCard());
        $('#cancelCardBtn, #closeCardModal').on('click', () => $('#cardModal').hide());

        // Thumbnail-Modal-Aktionen
        $('#closeThumbnailModal, #cancelThumbnailBtn').on('click', () => $('#thumbnailModal').hide());
        $('#thumbnailUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#thumbnailPreview')
                        .show()
                        .html(`<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">`);
                };
                reader.readAsDataURL(file);
            }
        });
        $('#usePlaceholder').on('change', function() {
            if ($(this).prop('checked')) {
                $('#thumbnailPreview')
                    .show()
                    .html(`<img src="placeholder.png" alt="Placeholder" style="max-width: 100%; max-height: 200px;">`);
                $('#thumbnailUrl').prop('disabled', true);
                $('#thumbnailUpload').prop('disabled', true);
            } else {
                $('#thumbnailPreview').hide();
                $('#thumbnailUrl').prop('disabled', false);
                $('#thumbnailUpload').prop('disabled', false);
            }
        });

        // Card-Typ-Auswahl
        $('.card-type-option').on('click', function() {
            const type = $(this).data('type');
            $('.card-type-option').removeClass('active');
            $(this).addClass('active');

            // Alle typ-spezifischen Felder ausblenden
            $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();

            // Gewählte Felder einblenden
            $(`.${type}-fields`).show();
        });

        // Farb-Palette-Auswahl
        $('.color-palette').on('click', function() {
            const palette = $(this).data('palette');
            $('.color-palette').removeClass('active');
            $(this).addClass('active');

            // Alle Color-Picker ausblenden
            $('.material-colors, .pastel-colors, .custom-colors').hide();

            // Aktuelle Palette einblenden
            $(`.${palette}-colors`).show();
        });

        // Benutzerdefinierte Farbe übernehmen
        $('#applyCustomColorBtn').on('click', () => {
            const customColor = $('#customColorPicker').val();
            $('.color-option').removeClass('active');
            $('#customColorPreview').css('backgroundColor', customColor);
        });

        // Karten-Größe-Auswahl
        $('.width-btn').on('click', function() {
            $('.width-btn').removeClass('active');
            $(this).addClass('active');
        });
        $('.height-btn').on('click', function() {
            $('.height-btn').removeClass('active');
            $(this).addClass('active');
        });

        // Ansichtsauswahl (Raster, Frei, Kategorien)
        $('.view-btn').on('click', function() {
            const view = $(this).data('view');
            Views.changeCardView(view);
        });

        // Layout-Auswahl (Spaltenanzahl)
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

        // Stiloptionen für Hintergrund
        $('.background-style-option').on('click', function() {
            $('.background-style-option').removeClass('active');
            $(this).addClass('active');
        });

        // Hintergrund-Transparenz
        $('#backgroundOpacity').on('input', function() {
            const value = $(this).val();
            $('#opacityValue').text(`${value}%`);
        });

        // Hintergrund-Datei-Upload
        $('#backgroundUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                $('#backgroundFileName').text(file.name);
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
                    $('#imagePreview')
                        .show()
                        .html(`<img src="${e.target.result}" alt="Preview">`);
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
                    $('#audioPreview')
                        .show()
                        .html(`
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
            $('#imageUrl').val('');
            $('#imagePreview')
                .show()
                .html(`<img src="placeholder.png" alt="Platzhalter">`);
            $('#cardPlaceholder').val('placeholder.png');
        });

        // Schülermodus umschalten
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
                Views.renderBoards(null);
            } else if (AppData.view === 'folder' && AppData.currentFolder) {
                Views.renderBoardsInFolder(AppData.currentFolder.id);
            }
        });

        // Bestätigungs-Modal schließen
        $('#closeConfirmModal, #cancelConfirmBtn').on('click', () => $('#confirmModal').hide());

        // Dropdowns schließen, wenn man außen klickt
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.folder-menu, .board-menu, .card-menu, .dropdown').length) {
                $('.folder-menu-dropdown, .board-menu-dropdown, .card-menu-dropdown, .dropdown-menu').removeClass('show');
            }
        });

        // Dropdown-Toggle
        $('.dropdown-toggle').on('click', function() {
            $(this).siblings('.dropdown-menu').toggleClass('show');
        });
    },

    /**
     * Zur Startseite navigieren
     */
    navigateHome: function() {
        Views.renderHomeView();
    },

    /**
     * Ordner öffnen
     * @param {string} folderId - Ordner-ID
     */
    openFolder: function(folderId) {
        Views.renderFolderView(folderId);
    },

    /**
     * Pinnwand öffnen
     * @param {string} boardId - Pinnwand-ID
     */
    openBoard: function(boardId) {
        Views.renderBoardView(boardId);
    },

    /**
     * Neuen Ordner anlegen
     */
    createFolder: function() {
        $('#folderModalTitle').text('Neuer Ordner');
        $('#folderTitle').val('');

        // Dropdown der übergeordneten Ordner aktualisieren
        Views.updateParentFolderSelect();
        $('#folderParentSelect').val('');

        // Farbwahl zurücksetzen
        $('#folderColorPicker .color-option').removeClass('active');
        $('#folderColorPicker .color-option').first().addClass('active');

        // Ordner-ID entfernen
        $('#folderModal').removeData('id');

        $('#folderModal').show();
    },

    /**
     * Neuen Unterordner anlegen
     * @param {string} parentId - ID des übergeordneten Ordners
     */
    createSubfolder: function(parentId) {
        $('#folderModalTitle').text('Neuer Unterordner');
        $('#folderTitle').val('');

        Views.updateParentFolderSelect();
        $('#folderParentSelect').val(parentId);

        $('#folderColorPicker .color-option').removeClass('active');
        $('#folderColorPicker .color-option').first().addClass('active');

        $('#folderModal').removeData('id');
        $('#folderModal').show();
    },

    /**
     * Ordner bearbeiten
     * @param {string} folderId - Ordner-ID
     */
    editFolder: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) return;

        $('#folderModalTitle').text('Ordner bearbeiten');
        $('#folderTitle').val(folder.name);

        Views.updateParentFolderSelect();
        $('#folderParentSelect').val(folder.parentId || '');

        $('#folderColorPicker .color-option').removeClass('active');
        const colorOption = $(`#folderColorPicker .color-option[data-color="${folder.color}"]`);
        if (colorOption.length) {
            colorOption.addClass('active');
        } else {
            $('#folderColorPicker .color-option').first().addClass('active');
        }

        $('#folderModal').data('id', folder.id);
        $('#folderModal').show();
    },

    /**
     * Aktuellen Ordner bearbeiten
     */
    editCurrentFolder: function() {
        if (AppData.currentFolder) {
            this.editFolder(AppData.currentFolder.id);
        }
    },

    /**
     * Ordner speichern (neu oder update)
     */
    saveFolder: function() {
        const title = $('#folderTitle').val().trim();
        if (!title) {
            alert('Bitte einen Titel eingeben.');
            return;
        }

        const color = $('#folderColorPicker .color-option.active').data('color') || '#2196F3';
        const parentId = $('#folderParentSelect').val() || null;
        const folderId = $('#folderModal').data('id');

        if (folderId) {
            // Existierenden Ordner updaten
            FolderDAO.update(folderId, {
                name: title,
                color: color,
                parentId: parentId
            });

            if (AppData.view === 'folder') {
                if (AppData.currentFolder && AppData.currentFolder.id === folderId) {
                    Views.renderFolderView(folderId);
                } else if (AppData.currentFolder && AppData.currentFolder.id === parentId) {
                    Views.renderFolderView(AppData.currentFolder.id);
                } else if (!parentId) {
                    Views.renderHomeView();
                }
            } else {
                Views.renderHomeView();
            }
        } else {
            // Neuen Ordner anlegen
            const newFolder = FolderDAO.create(title, color, parentId);
            if (AppData.view === 'folder' && AppData.currentFolder && AppData.currentFolder.id === parentId) {
                Views.renderFolderView(parentId);
            } else if (parentId === null) {
                Views.renderHomeView();
            }
        }

        $('#folderModal').hide();
        $('#folderModal').removeData('id');
    },

    /**
     * Ordner löschen
     * @param {string} folderId - Ordner-ID
     */
    deleteFolder: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) return;

        const subFolders = FolderDAO.getByParentId(folderId);
        let message = `Soll der Ordner "${folder.name}" wirklich gelöscht werden?`;
        if (subFolders.length > 0) {
            message += ` Dieser Ordner enthält ${subFolders.length} Unterordner, die ebenfalls gelöscht werden!`;
        }
        message += ' Die Pinnwände werden nicht gelöscht, sondern nur aus dem Ordner entfernt.';

        Views.showConfirmModal(
            'Ordner löschen',
            message,
            () => {
                FolderDAO.delete(folderId);
                if (AppData.view === 'folder') {
                    const currentFolderId = AppData.currentFolder?.id;
                    if (
                        currentFolderId === folderId ||
                        FolderDAO.getAllSubfolderIds(folderId).includes(currentFolderId)
                    ) {
                        Views.renderHomeView();
                    } else if (folder.parentId && AppData.currentFolder && AppData.currentFolder.id === folder.parentId) {
                        Views.renderFolderView(folder.parentId);
                    } else {
                        Views.renderFolderView(AppData.currentFolder.id);
                    }
                } else {
                    Views.renderHomeView();
                }
            }
        );
    },

    /**
     * Vorschaubild für Ordner setzen
     * @param {string} folderId - Ordner-ID
     */
    setFolderThumbnail: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) return;

        Views.showThumbnailModal(`Vorschaubild für "${folder.name}"`, (thumbnailData) => {
            if (thumbnailData === 'placeholder') {
                thumbnailData = 'placeholder.png';
            }
            FolderDAO.setThumbnail(folderId, thumbnailData);
            if (AppData.view === 'folder') {
                if (AppData.currentFolder.id === folderId) {
                    Views.renderFolderView(folderId);
                } else if (AppData.currentFolder.id === folder.parentId) {
                    Views.renderFolders(folder.parentId);
                }
            } else {
                Views.renderFolders(null);
            }
        });
    },

    /**
     * Neue Pinnwand anlegen
     */
    createBoard: function() {
        $('#boardModalTitle').text('Neue Pinnwand');
        $('#boardTitleInput').val('');

        $('#boardColorPicker .color-option').removeClass('active');
        $('#boardColorPicker .color-option').first().addClass('active');

        Views.updateFolderSelect();
        if (AppData.view === 'folder' && AppData.currentFolder) {
            $('#boardFolderSelect').val(AppData.currentFolder.id);
        } else {
            $('#boardFolderSelect').val('');
        }

        $('#boardModal').removeData('id');
        $('#boardModal').show();
    },

    /**
     * Neue Pinnwand in spezifischem Ordner anlegen
     * @param {string} folderId - Ordner-ID
     */
    createBoardInFolder: function(folderId) {
        this.createBoard();
        $('#boardFolderSelect').val(folderId);
    },

    /**
     * Pinnwand bearbeiten
     * @param {string} boardId - Pinnwand-ID
     */
    editBoard: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;

        $('#boardModalTitle').text('Pinnwand bearbeiten');
        $('#boardTitleInput').val(board.name);

        $('#boardColorPicker .color-option').removeClass('active');
        const colorOption = $(`#boardColorPicker .color-option[data-color="${board.color}"]`);
        if (colorOption.length) {
            colorOption.addClass('active');
        } else {
            $('#boardColorPicker .color-option').first().addClass('active');
        }

        Views.updateFolderSelect();
        $('#boardFolderSelect').val(board.folderId || '');

        $('#boardModal').data('id', board.id);
        $('#boardModal').show();
    },

    /**
     * Aktuelle Pinnwand bearbeiten
     */
    editCurrentBoard: function() {
        if (AppData.currentBoard) {
            this.editBoard(AppData.currentBoard.id);
        }
    },

    /**
     * Pinnwand speichern (neu oder update)
     */
    saveBoard: function() {
        const title = $('#boardTitleInput').val().trim();
        if (!title) {
            alert('Bitte einen Titel für die Pinnwand eingeben.');
            return;
        }

        const color = $('#boardColorPicker .color-option.active').data('color') || '#4CAF50';
        const folderId = $('#boardFolderSelect').val() || null;
        const boardId = $('#boardModal').data('id');

        if (boardId) {
            // Existierende Pinnwand updaten
            BoardDAO.update(boardId, {
                name: title,
                color: color,
                folderId: folderId
            });

            if (AppData.view === 'folder') {
                if (AppData.currentFolder && AppData.currentFolder.id === folderId) {
                    Views.renderFolderView(folderId);
                } else {
                    Views.renderHomeView();
                }
            } else {
                Views.renderHomeView();
            }
        } else {
            // Neue Pinnwand anlegen
            const newBoard = BoardDAO.create(title, color, folderId);
            if (AppData.view === 'folder' && AppData.currentFolder && AppData.currentFolder.id === folderId) {
                Views.renderFolderView(folderId);
            } else {
                Views.renderHomeView();
            }
        }

        $('#boardModal').hide();
        $('#boardModal').removeData('id');
    },

    /**
     * Pinnwand löschen
     * @param {string} boardId - Pinnwand-ID
     */
    deleteBoard: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;

        Views.showConfirmModal(
            'Pinnwand löschen',
            `Soll die Pinnwand "${board.name}" wirklich gelöscht werden?`,
            () => {
                BoardDAO.delete(boardId);
                if (AppData.view === 'board' && AppData.currentBoard && AppData.currentBoard.id === boardId) {
                    Views.renderHomeView();
                } else if (AppData.view === 'folder' && AppData.currentFolder) {
                    Views.renderFolderView(AppData.currentFolder.id);
                } else {
                    Views.renderHomeView();
                }
            }
        );
    },

    /**
     * Karte erstellen
     */
    createCard: function() {
        if (!AppData.currentBoard) return;
        // Formular zurücksetzen
        this.resetCardForm();
        $('#cardModal').removeData('id');
        $('#cardModal').show();
    },

    /**
     * Karte bearbeiten
     * @param {string} cardId - Karten-ID
     */
    editCard: function(cardId) {
        if (!AppData.currentBoard) return;
        const board = AppData.currentBoard;
        const card = board.cards.find(c => c.id === cardId);
        if (!card) return;

        this.resetCardForm();
        this.populateCardForm(card);

        $('#cardModal').data('id', cardId);
        $('#cardModal').show();
    },

    /**
     * Karte in Formular übernehmen
     */
    populateCardForm: function(card) {
        $('#cardTitle').val(card.title);
        $('#cardContent').val(card.content);

        // Kartentyp
        $(`.card-type-option[data-type="${card.type}"]`).trigger('click');

        // Spezifische Felder
        if (card.type === 'youtube') {
            $('#youtubeId').val(card.youtubeId);
        } else if (card.type === 'image') {
            $('#imageUrl').val(card.imageUrl);
            if (card.imageData) {
                $('#imagePreview')
                    .show()
                    .html(`<img src="${card.imageData}" alt="Vorschau">`);
            }
        } else if (card.type === 'link') {
            $('#linkUrl').val(card.linkUrl);
        } else if (card.type === 'learningapp') {
            $('#learningappId').val(card.learningappId);
        } else if (card.type === 'audio') {
            if (card.audioData) {
                $('#audioPreview')
                    .show()
                    .html(`
                        <audio controls>
                            <source src="${card.audioData}" type="audio/mpeg">
                            Dein Browser unterstützt kein Audio-Element.
                        </audio>
                    `);
            }
        }

        // Farbe
        if (card.customColor) {
            // Benutzerdefinierte Farbe
            $('#applyCustomColorBtn').click();
            $('#customColorPicker').val(card.customColor);
            $('#customColorPreview').css('backgroundColor', card.customColor);
            $('.color-palette[data-palette="custom"]').click();
        } else {
            // Material / Pastell
            $('.color-option').removeClass('active');
            if (card.color !== 'blue') {
                // Standard war 'blue', also nach einer passenden Option suchen
                $(`.color-option[data-color="${card.color}"]`).addClass('active');
            } else {
                // Falls 'blue' oder nichts Passendes, erste Option wählen
                $('.color-option').first().addClass('active');
            }
        }

        // Breite/Höhe
        $(`.width-btn[data-width="${card.width}"]`).addClass('active');
        $(`.height-btn[data-height="${card.height}"]`).addClass('active');

        // Kategorie
        $('#cardCategory').val(card.category || '');

        // Position (nur in freier Ansicht relevant)
        // Wird hier nicht gesetzt, da Position erst beim Verschieben aktualisiert wird
    },

    /**
     * Karte-Formular zurücksetzen
     */
    resetCardForm: function() {
        $('#cardTitle').val('');
        $('#cardContent').val('');
        $('#youtubeId').val('');
        $('#imageUrl').val('');
        $('#linkUrl').val('');
        $('#learningappId').val('');
        $('#audioUpload').val('');
        $('#imagePreview').hide().empty();
        $('#audioPreview').hide().empty();
        $('#placeholderBtn').show();

        // Standardtyp (Text)
        $('.card-type-option').removeClass('active');
        $('.card-type-option[data-type="text"]').addClass('active');
        $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();

        // Farben
        $('.color-palette').removeClass('active');
        $('.color-palette[data-palette="material"]').addClass('active');
        $('.material-colors').show();
        $('.pastel-colors, .custom-colors').hide();
        $('.color-option').removeClass('active');
        $('.color-option').first().addClass('active');
        $('#customColorPicker').val('#000000');
        $('#customColorPreview').css('backgroundColor', '#000000');

        // Breite/Höhe
        $('.width-btn, .height-btn').removeClass('active');
        $('.width-btn[data-width="1"]').addClass('active');
        $('.height-btn[data-height="1"]').addClass('active');

        // Kategorie
        $('#cardCategory').val('');
    },

    /**
     * Karte speichern
     */
    saveCard: function() {
        if (!AppData.currentBoard) return;
        const board = AppData.currentBoard;
        const cardId = $('#cardModal').data('id');

        const type = $('.card-type-option.active').data('type') || 'text';
        const title = $('#cardTitle').val().trim() || 'Neue Karte';
        const content = $('#cardContent').val().trim() || '';
        let customColor = '';
        let color = $('.color-option.active').data('color') || 'blue';

        // Wenn data-color="custom", dann customColor verwenden
        if (color === 'custom') {
            customColor = $('#customColorPicker').val();
        }

        const width = $('.width-btn.active').data('width') || 1;
        const height = $('.height-btn.active').data('height') || 1;
        const category = $('#cardCategory').val() || '';

        // Typ-spezifische Werte
        let youtubeId = '';
        let imageUrl = '';
        let imageData = null;
        let linkUrl = '';
        let learningappId = '';
        let audioUrl = '';
        let audioData = null;

        if (type === 'youtube') {
            youtubeId = $('#youtubeId').val().trim();
        } else if (type === 'image') {
            imageUrl = $('#imageUrl').val().trim();
            const imgElement = $('#imagePreview img');
            if (imgElement.length) {
                const src = imgElement.attr('src');
                // Falls Base64, übernehmen
                if (src && src.startsWith('data:image/')) {
                    imageData = src;
                }
            }
        } else if (type === 'link') {
            linkUrl = $('#linkUrl').val().trim();
        } else if (type === 'learningapp') {
            learningappId = $('#learningappId').val().trim();
        } else if (type === 'audio') {
            const audioElement = $('#audioPreview audio source');
            if (audioElement.length) {
                const src = audioElement.attr('src');
                if (src && src.startsWith('data:audio/')) {
                    audioData = src;
                }
            }
        }

        // Neue Daten erstellen oder bestehende updaten
        if (cardId) {
            // Bestehende Karte
            const card = board.cards.find(c => c.id === cardId);
            if (!card) return;

            card.title = title;
            card.content = content;
            card.type = type;
            card.color = color;
            card.customColor = customColor;
            card.width = width;
            card.height = height;
            card.category = category;
            card.updated = new Date().toISOString();

            if (type === 'youtube') {
                card.youtubeId = youtubeId;
                card.imageUrl = '';
                card.imageData = null;
                card.linkUrl = '';
                card.learningappId = '';
                card.audioUrl = '';
                card.audioData = null;
            } else if (type === 'image') {
                card.youtubeId = '';
                card.imageUrl = imageUrl;
                card.imageData = imageData;
                card.linkUrl = '';
                card.learningappId = '';
                card.audioUrl = '';
                card.audioData = null;
            } else if (type === 'link') {
                card.youtubeId = '';
                card.imageUrl = '';
                card.imageData = null;
                card.linkUrl = linkUrl;
                card.learningappId = '';
                card.audioUrl = '';
                card.audioData = null;
            } else if (type === 'learningapp') {
                card.youtubeId = '';
                card.imageUrl = '';
                card.imageData = null;
                card.linkUrl = '';
                card.learningappId = learningappId;
                card.audioUrl = '';
                card.audioData = null;
            } else if (type === 'audio') {
                card.youtubeId = '';
                card.imageUrl = '';
                card.imageData = null;
                card.linkUrl = '';
                card.learningappId = '';
                card.audioUrl = audioUrl;
                card.audioData = audioData;
            } else {
                // Text
                card.youtubeId = '';
                card.imageUrl = '';
                card.imageData = null;
                card.linkUrl = '';
                card.learningappId = '';
                card.audioUrl = '';
                card.audioData = null;
            }
        } else {
            // Neue Karte
            const cardObj = {
                title,
                content,
                type,
                color,
                customColor,
                width,
                height,
                category
            };

            if (type === 'youtube') {
                cardObj.youtubeId = youtubeId;
            } else if (type === 'image') {
                cardObj.imageUrl = imageUrl;
                cardObj.imageData = imageData;
            } else if (type === 'link') {
                cardObj.linkUrl = linkUrl;
            } else if (type === 'learningapp') {
                cardObj.learningappId = learningappId;
            } else if (type === 'audio') {
                cardObj.audioUrl = audioUrl;
                cardObj.audioData = audioData;
            }

            board.cards.push(new Card(cardObj));
        }

        BoardDAO.update(board.id, { cards: board.cards });
        $('#cardModal').hide();
    },

    /**
     * Karte löschen
     * @param {string} boardId - Pinnwand-ID
     * @param {string} cardId - Karten-ID
     */
    deleteCard: function(boardId, cardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        const cardIndex = board.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        Views.showConfirmModal(
            'Karte löschen',
            'Soll die Karte wirklich gelöscht werden?',
            () => {
                board.cards.splice(cardIndex, 1);
                BoardDAO.update(board.id, { cards: board.cards });
                Views.renderBoardView(board.id);
            }
        );
    },

    /**
     * Karten filtern
     */
    filterCards: function() {
        const query = $('#searchInput').val().toLowerCase();
        if (!AppData.currentBoard) return;

        if (AppData.currentBoard.view === 'grid') {
            $('#boardGrid .card').each(function() {
                const title = $(this).find('.card-title').text().toLowerCase();
                const content = $(this).find('.card-content').text().toLowerCase();
                if (title.includes(query) || content.includes(query)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else if (AppData.currentBoard.view === 'free') {
            $('#boardFree .card').each(function() {
                const title = $(this).find('.card-title').text().toLowerCase();
                const content = $(this).find('.card-content').text().toLowerCase();
                if (title.includes(query) || content.includes(query)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else if (AppData.currentBoard.view === 'categories') {
            $('#boardCategories .card').each(function() {
                const title = $(this).find('.card-title').text().toLowerCase();
                const content = $(this).find('.card-content').text().toLowerCase();
                if (title.includes(query) || content.includes(query)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
    },

    /**
     * Schülermodus umschalten
     */
    toggleStudentMode: function() {
        AppData.studentMode = $('#studentModeToggle').prop('checked');
        StorageService.saveAppData();
        // Neu rendern, damit Editor-Funktionen ein/ausgeblendet werden
        if (AppData.view === 'home') {
            Views.renderHomeView();
        } else if (AppData.view === 'folder' && AppData.currentFolder) {
            Views.renderFolderView(AppData.currentFolder.id);
        } else if (AppData.view === 'board' && AppData.currentBoard) {
            Views.renderBoardView(AppData.currentBoard.id);
        }
    },

    /**
     * Teilen-Modal öffnen
     */
    openShareModal: function() {
        // Aktuellen Link erstellen (z.B. mit URL-Parametern)
        let shareUrl = window.location.href;
        if (AppData.currentBoard) {
            shareUrl = `${window.location.origin}${window.location.pathname}?board=${AppData.currentBoard.id}`;
        } else if (AppData.currentFolder) {
            shareUrl = `${window.location.origin}${window.location.pathname}?folder=${AppData.currentFolder.id}`;
        }

        $('#shareLink').val(shareUrl);
        $('#shareModal').show();
    },

    /**
     * Share-Link kopieren
     */
    copyShareLink: function() {
        const shareLink = $('#shareLink');
        shareLink.select();
        document.execCommand('copy');
    },

    /**
     * Daten importieren
     */
    importData: function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const importedData = JSON.parse(evt.target.result);
                const success = StorageService.importData(importedData);
                if (success) {
                    alert('Daten erfolgreich importiert.');
                    if (AppData.view === 'home') {
                        Views.renderHomeView();
                    } else if (AppData.view === 'folder' && AppData.currentFolder) {
                        Views.renderFolderView(AppData.currentFolder.id);
                    } else if (AppData.view === 'board' && AppData.currentBoard) {
                        Views.renderBoardView(AppData.currentBoard.id);
                    }
                } else {
                    alert('Import fehlgeschlagen. Ungültiges Datenformat.');
                }
            } catch (err) {
                alert('Import fehlgeschlagen. Ungültige JSON-Datei.');
            }
        };
        reader.readAsText(file);
    },

    /**
     * Kategorie erstellen
     */
    createCategory: function() {
        if (!AppData.currentBoard) return;
        $('#categoryModalTitle').text('Neue Kategorie');
        $('#categoryName').val('');
        $('#categoryModal').show();
        $('#categoryModal').removeData('id');
    },

    /**
     * Kategorie-Modal öffnen
     */
    openCategoryModal: function() {
        if (!AppData.currentBoard) return;
        $('#categoryModalTitle').text('Kategorien verwalten');
        $('#categoryName').val('');
        $('#categoryModal').show();
        $('#categoryModal').removeData('id');
    },

    /**
     * Kategorie speichern
     */
    saveCategory: function() {
        if (!AppData.currentBoard) return;
        const board = AppData.currentBoard;
        const categoryName = $('#categoryName').val().trim();
        if (!categoryName) {
            alert('Bitte einen Kategorienamen eingeben.');
            return;
        }

        const categoryId = $('#categoryModal').data('id');
        if (categoryId) {
            // Vorhandene Kategorie updaten
            const category = board.categories.find(cat => cat.id === categoryId);
            if (category) {
                category.name = categoryName;
            }
        } else {
            // Neue Kategorie anlegen
            board.categories.push(new Category(null, categoryName));
        }

        BoardDAO.update(board.id, { categories: board.categories });
        Views.renderBoardView(board.id);
        $('#categoryModal').hide();
    },

    /**
     * Hintergrund-Modal öffnen
     */
    openBackgroundModal: function() {
        if (!AppData.currentBoard) return;
        const board = AppData.currentBoard;
        if (board.background) {
            // Werte befüllen
            if (board.background.url) {
                $('#backgroundUrl').val(board.background.url);
            } else {
                $('#backgroundUrl').val('');
            }
            $('#backgroundOpacity').val(board.background.opacity || 100);
            $('#opacityValue').text(`${board.background.opacity || 100}%`);
            $('.background-style-option').removeClass('active');
            $(`.background-style-option[data-style="${board.background.style}"]`).addClass('active');
        } else {
            $('#backgroundUrl').val('');
            $('#backgroundOpacity').val(100);
            $('#opacityValue').text('100%');
            $('.background-style-option').removeClass('active');
            $('.background-style-option[data-style="cover"]').addClass('active');
        }
        $('#backgroundModal').show();
    },

    /**
     * Hintergrund speichern
     */
    saveBackground: function() {
        if (!AppData.currentBoard) return;
        const board = AppData.currentBoard;
        const url = $('#backgroundUrl').val().trim();
        const opacity = parseInt($('#backgroundOpacity').val(), 10) || 100;
        const style = $('.background-style-option.active').data('style');
        let data = null;

        // Falls eine Datei hochgeladen wurde
        const fileInput = $('#backgroundUpload')[0];
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = (evt) => {
                data = evt.target.result;
                BoardDAO.update(board.id, {
                    background: {
                        url: '',
                        data: data,
                        style: style,
                        opacity: opacity
                    }
                });
                Views.renderBoardView(board.id);
                $('#backgroundModal').hide();
            };
            reader.readAsDataURL(file);
        } else {
            // Nur URL und/oder Style/Opacity
            BoardDAO.update(board.id, {
                background: {
                    url: url,
                    data: null,
                    style: style,
                    opacity: opacity
                }
            });
            Views.renderBoardView(board.id);
            $('#backgroundModal').hide();
        }
    },

    /**
     * Hintergrund entfernen
     */
    removeBackground: function() {
        if (!AppData.currentBoard) return;
        const board = AppData.currentBoard;
        BoardDAO.update(board.id, { background: null });
        Views.renderBoardView(board.id);
        $('#backgroundModal').hide();
    },

    /**
     * checkUrlParams: Liest mögliche URL-Parameter aus und navigiert bei Bedarf direkt zu Folder oder Board
     */
    checkUrlParams: function() {
        const params = new URLSearchParams(window.location.search);
        const folderId = params.get('folder');
        const boardId = params.get('board');

        if (boardId) {
            this.openBoard(boardId);
        } else if (folderId) {
            this.openFolder(folderId);
        }
    }
};
