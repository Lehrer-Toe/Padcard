/**
 * Controllers for Taskcard-Manager
 * 
 * This file contains controller logic that handles user interactions
 * and connects the models with the views.
 */

const Controllers = {
    /**
     * Initialize controllers
     */
    init: function() {
        this.initEventHandlers();
        this.initErrorHandling();
    },
    
    /**
     * Initialize event handlers
     */
    initEventHandlers: function() {
        try {
            // Navigation
            $('.breadcrumb-home').on('click', (e) => {
                e.preventDefault();
                this.navigateHome();
            });
            
            // Folder actions
            $('#newFolderBtn').on('click', () => this.createFolder());
            $('#newSubfolderBtn').on('click', () => this.createSubfolder($(this).data('parentId')));
            $('#saveFolderBtn').on('click', () => this.saveFolder());
            $('#cancelFolderBtn, #closeFolderModal').on('click', () => $('#folderModal').hide());
            $('#editFolderBtn').on('click', () => this.editCurrentFolder());
            
            // Board actions
            $('#newBoardBtn, #newBoardInFolderBtn').on('click', () => this.createBoard());
            $('#saveBoardBtn').on('click', () => this.saveBoard());
            $('#cancelBoardBtn, #closeBoardModal').on('click', () => $('#boardModal').hide());
            $('#editBoardTitleBtn').on('click', () => this.editCurrentBoard());
            
            // Card actions
            $('#newCardBtn, #addCardBtnGrid').on('click', () => this.createCard());
            $('#saveCardBtn').on('click', () => this.saveCard());
            $('#cancelCardBtn, #closeCardModal').on('click', () => $('#cardModal').hide());
            
            // Card type selection
            $('.card-type-option').on('click', function() {
                const type = $(this).data('type');
                $('.card-type-option').removeClass('active');
                $(this).addClass('active');
                
                // Hide all type-specific fields
                $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
                
                // Show selected type fields
                $(`.${type}-fields`).show();
            });
            
            // Color palette selection
            $('.color-palette').on('click', function() {
                const palette = $(this).data('palette');
                $('.color-palette').removeClass('active');
                $(this).addClass('active');
                
                // Hide all color pickers
                $('.material-colors, .pastel-colors, .custom-colors').hide();
                
                // Show selected palette
                $(`.${palette}-colors`).show();
            });
            
            // Apply custom color
            $('#applyCustomColorBtn').on('click', () => {
                const customColor = $('#customColorPicker').val();
                $('.color-option').removeClass('active');
                $('#customColorPreview').css('backgroundColor', customColor);
            });
            
            // Card size selection
            $('.width-btn').on('click', function() {
                $('.width-btn').removeClass('active');
                $(this).addClass('active');
            });
            
            $('.height-btn').on('click', function() {
                $('.height-btn').removeClass('active');
                $(this).addClass('active');
            });
            
            // View selection
            $('.view-btn').on('click', function() {
                const view = $(this).data('view');
                Views.changeCardView(view);
            });
            
            // Layout selection
            $('.layout-btn').on('click', function() {
                const columns = parseInt($(this).data('columns'));
                Views.updateBoardLayout(columns);
            });
            
            // Search
            $('#searchInput').on('input', this.filterCards);
            
            // Category actions
            $('#addCategoryBtn').on('click', () => this.createCategory());
            $('#categoriesBtn').on('click', () => this.openCategoryModal());
            $('#addCategoryFormBtn').on('click', () => this.saveCategory());
            $('#closeCategoryModal, #closeCategoryBtn').on('click', () => $('#categoryModal').hide());
            
            // Background actions
            $('#backgroundBtn').on('click', () => this.openBackgroundModal());
            $('#closeBackgroundModal, #cancelBackgroundBtn').on('click', () => $('#backgroundModal').hide());
            $('#saveBackgroundBtn').on('click', () => this.saveBackground());
            $('#removeBackgroundBtn').on('click', () => this.removeBackground());
            
            // Background style options
            $('.background-style-option').on('click', function() {
                $('.background-style-option').removeClass('active');
                $(this).addClass('active');
            });
            
            // Background opacity
            $('#backgroundOpacity').on('input', function() {
                const value = $(this).val();
                $('#opacityValue').text(`${value}%`);
            });
            
            // Background file upload
            $('#backgroundUpload').on('change', (e) => {
                try {
                    const file = e.target.files[0];
                    if (file) {
                        $('#backgroundFileName').text(file.name);
                        // Preview the image
                        this.safeFileUpload($('#backgroundUpload')[0], $('.bg-preview'), function(result) {
                            $('.bg-preview').css('backgroundImage', `url(${result})`);
                        });
                    }
                } catch (error) {
                    console.warn('Fehler beim Hochladen des Hintergrundbilds:', error);
                }
            });
            
            // Image upload for cards
            $('#imageUpload').on('change', (e) => {
                this.safeFileUpload($('#imageUpload')[0], $('#imagePreview'));
            });
            
            // Audio upload for cards
            $('#audioUpload').on('change', function() {
                try {
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
                } catch (error) {
                    console.warn('Fehler beim Hochladen der Audiodatei:', error);
                }
            });
            
            // Thumbnail-related handlers
            $('#thumbnailUpload').on('change', (e) => {
                this.safeFileUpload($('#thumbnailUpload')[0], $('#thumbnailPreview'));
            });
            
            $('#usePlaceholder').on('change', function() {
                try {
                    if ($(this).is(':checked')) {
                        $('#thumbnailPreview').html('<img src="placeholder.png" alt="Platzhalter">').show();
                        $('#thumbnailUrl').prop('disabled', true);
                        $('#thumbnailUpload').prop('disabled', true);
                    } else {
                        $('#thumbnailPreview').empty();
                        $('#thumbnailUrl').prop('disabled', false);
                        $('#thumbnailUpload').prop('disabled', false);
                    }
                } catch (error) {
                    console.warn('Fehler beim Umschalten des Platzhalters:', error);
                }
            });
            
            // Placeholder for image cards
            $('#placeholderBtn').on('click', () => {
                $('#imageUrl').val('');
                $('#imagePreview').show().html(`<img src="placeholder.png" alt="Platzhalter">`);
                $('#cardPlaceholder').val('placeholder.png');
            });
            
            // Student mode toggle
            $('#studentModeToggle').on('change', () => this.toggleStudentMode());
            
            // Share button
            $('#shareBtn').on('click', () => this.openShareModal());
            $('#closeShareModal').on('click', () => $('#shareModal').hide());
            $('#copyLinkBtn').on('click', () => this.copyShareLink());
            
            // Import/Export
            $('#exportBtn').on('click', () => StorageService.exportData());
            $('#importBtn').on('click', () => $('#importFile').click());
            $('#importFile').on('change', (e) => this.importData(e));
            
            // Sort options
            $('.sort-option').on('click', function(e) {
                e.preventDefault();
                $('.sort-option').removeClass('active');
                $(this).addClass('active');
                
                // Resort boards
                if (AppData.view === 'home') {
                    Views.renderBoards(null);
                } else if (AppData.view === 'folder' && AppData.currentFolder) {
                    Views.renderBoards(AppData.currentFolder.id);
                }
            });
            
            // Close confirmation modal
            $('#closeConfirmModal, #cancelConfirmBtn').on('click', () => $('#confirmModal').hide());
            
            // Close dropdowns when clicking outside
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.folder-menu, .board-menu, .card-menu, .dropdown').length) {
                    $('.folder-menu-dropdown, .board-menu-dropdown, .card-menu-dropdown, .dropdown-menu').removeClass('show');
                }
            });
            
            // Dropdown toggle
            $('.dropdown-toggle').on('click', function() {
                $(this).siblings('.dropdown-menu').toggleClass('show');
            });
            
        } catch (error) {
            console.warn('Fehler beim Initialisieren der Event-Handler:', error);
        }
    },
    
    /**
     * Initialize error handling for browser communication
     */
    initErrorHandling: function() {
        // Handler für die Kommunikation mit Browser-Extensions
        window.addEventListener('message', function(event) {
            try {
                // Sichere Verarbeitung von Nachrichten
                if (event.source !== window) return;
                if (!event.data || typeof event.data !== 'object') return;
                
                // Behandle Nachrichtentypen entsprechend
                if (event.data.type === 'taskcard-event') {
                    // Verarbeite App-spezifische Nachrichten
                }
            } catch (error) {
                // Fehler abfangen, ohne sie in der Konsole anzuzeigen
                if (error.message && (
                    error.message.includes('message port closed') ||
                    error.message.includes('lastError')
                )) {
                    // Ignoriere diese spezifischen Fehler
                    return;
                }
                console.warn('Nachrichtenverarbeitung fehlgeschlagen:', error);
            }
        });
    },
    
    /**
     * Wrapper für Chrome API-Interaktionen
     */
    chromeInteraction: function(callback) {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                // Sichere Ausführung in einem Try-Catch-Block
                try {
                    callback();
                } catch (e) {
                    if (e.message && (
                        e.message.includes('message port closed') ||
                        e.message.includes('lastError')
                    )) {
                        // Ignoriere diese spezifischen Fehler
                        return;
                    }
                    console.warn('Chrome API Fehler:', e);
                }
            }
        } catch (error) {
            // Chrome ist nicht definiert oder nicht verfügbar - das ist in Ordnung
        }
    },
    
    /**
     * Sichere Datei-Upload-Funktion
     */
    safeFileUpload: function(fileInput, previewElement, callback) {
        try {
            const file = fileInput.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    if (previewElement) {
                        previewElement.html(`<img src="${e.target.result}" alt="Vorschau">`).show();
                    }
                    
                    if (typeof callback === 'function') {
                        callback(e.target.result);
                    }
                } catch (previewError) {
                    console.warn('Fehler bei der Vorschau-Anzeige:', previewError);
                }
            };
            
            reader.onerror = function() {
                console.warn('Datei konnte nicht gelesen werden');
            };
            
            // Datei als Daten-URL lesen
            reader.readAsDataURL(file);
        } catch (error) {
            console.warn('Fehler beim Hochladen der Datei:', error);
        }
    },
    
    /**
     * Sichere Clipboard-Kopieren-Funktion
     */
    safeClipboardCopy: function(text) {
        try {
            // Moderne Methode mit Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        console.log('Text erfolgreich in die Zwischenablage kopiert');
                    })
                    .catch(err => {
                        console.warn('Clipboard API fehlgeschlagen, versuche Fallback:', err);
                        this.clipboardFallback(text);
                    });
            } else {
                // Fallback für ältere Browser
                this.clipboardFallback(text);
            }
        } catch (error) {
            console.warn('Fehler beim Kopieren in die Zwischenablage:', error);
        }
    },
    
    /**
     * Fallback-Methode für die Zwischenablage
     */
    clipboardFallback: function(text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // Verhindere das Scrollen zur Textbox
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                console.log('Fallback-Kopieren erfolgreich');
            } catch (err) {
                console.warn('Fallback-Kopieren fehlgeschlagen:', err);
            }
            
            document.body.removeChild(textArea);
        } catch (error) {
            console.warn('Clipboard-Fallback fehlgeschlagen:', error);
        }
    },
    
    /**
     * Navigate to home view
     */
    navigateHome: function() {
        try {
            Views.renderHomeView();
        } catch (error) {
            console.warn('Fehler beim Navigieren zur Startseite:', error);
        }
    },
    
    /**
     * Open a folder
     * @param {string} folderId - Folder ID
     */
    openFolder: function(folderId) {
        try {
            Views.renderFolderView(folderId);
        } catch (error) {
            console.warn('Fehler beim Öffnen des Ordners:', error);
            // Fallback zur Startseite
            this.navigateHome();
        }
    },
    
    /**
     * Open a board
     * @param {string} boardId - Board ID
     */
    openBoard: function(boardId) {
        try {
            Views.renderBoardView(boardId);
        } catch (error) {
            console.warn('Fehler beim Öffnen der Pinnwand:', error);
            // Fallback zur Startseite
            this.navigateHome();
        }
    },
    
    /**
     * Create a new folder
     */
    createFolder: function() {
        try {
            // Reset form
            $('#folderModalTitle').text('Neuer Ordner');
            $('#folderTitle').val('');
            
            // Reset parent folder selection
            Views.updateParentFolderSelect();
            $('#folderParentSelect').val('');
            
            // Reset color selection
            $('#folderColorPicker .color-option').removeClass('active');
            $('#folderColorPicker .color-option').first().addClass('active');
            
            // Remove folder ID data
            $('#folderModal').removeData('id');
            
            // Show modal
            $('#folderModal').css('display', 'flex');
        } catch (error) {
            console.warn('Fehler beim Erstellen eines neuen Ordners:', error);
        }
    },
    
    /**
     * Create a new subfolder
     * @param {string} parentId - Parent folder ID
     */
    createSubfolder: function(parentId) {
        try {
            // Reset form
            $('#folderModalTitle').text('Neuer Unterordner');
            $('#folderTitle').val('');
            
            // Set parent folder
            Views.updateParentFolderSelect();
            $('#folderParentSelect').val(parentId || AppData.currentFolder?.id);
            
            // Reset color selection
            $('#folderColorPicker .color-option').removeClass('active');
            $('#folderColorPicker .color-option').first().addClass('active');
            
            // Remove folder ID data
            $('#folderModal').removeData('id');
            
            // Show modal
            $('#folderModal').css('display', 'flex');
        } catch (error) {
            console.warn('Fehler beim Erstellen eines neuen Unterordners:', error);
        }
    },
    
    /**
     * Edit a folder
     * @param {string} folderId - Folder ID
     */
    editFolder: function(folderId) {
        try {
            const folder = FolderDAO.getById(folderId);
            if (!folder) return;
            
            // Set form values
            $('#folderModalTitle').text('Ordner bearbeiten');
            $('#folderTitle').val(folder.name);
            
            // Set parent folder
            Views.updateParentFolderSelect();
            $('#folderParentSelect').val(folder.parentId || '');
            
            // Set color
            $('#folderColorPicker .color-option').removeClass('active');
            $(`#folderColorPicker .color-option[data-color="${folder.color}"]`).addClass('active');
            
            // Store folder ID in form
            $('#folderModal').data('id', folderId);
            
            // Show modal
            $('#folderModal').css('display', 'flex');
        } catch (error) {
            console.warn('Fehler beim Bearbeiten des Ordners:', error);
        }
    },
    
    /**
     * Edit the current folder
     */
    editCurrentFolder: function() {
        try {
            if (AppData.currentFolder) {
                this.editFolder(AppData.currentFolder.id);
            }
        } catch (error) {
            console.warn('Fehler beim Bearbeiten des aktuellen Ordners:', error);
        }
    },
    
    /**
     * Save a folder (create or update)
     */
    saveFolder: function() {
        try {
            const folderName = $('#folderTitle').val().trim();
            if (!folderName) {
                alert('Bitte gib einen Namen für den Ordner ein.');
                return;
            }
            
            const folderColor = $('#folderColorPicker .color-option.active').data('color') || '#2196F3';
            const parentId = $('#folderParentSelect').val() || null;
            const folderId = $('#folderModal').data('id');
            
            if (folderId) {
                // Update existing folder
                FolderDAO.update(folderId, { 
                    name: folderName, 
                    color: folderColor,
                    parentId: parentId
                });
                
                // Update view
                if (AppData.view === 'folder') {
                    if (AppData.currentFolder && AppData.currentFolder.id === folderId) {
                        Views.renderFolderView(folderId);
                    } else if (AppData.currentFolder && AppData.currentFolder.id === parentId) {
                        Views.renderFolderView(AppData.currentFolder.id);
                    } else {
                        Views.renderHomeView();
                    }
                } else {
                    Views.renderHomeView();
                }
            } else {
                // Create new folder
                const folder = FolderDAO.create(folderName, folderColor, parentId);
                
                // Update view
                if (AppData.view === 'folder' && AppData.currentFolder && AppData.currentFolder.id === parentId) {
                    Views.renderFolderView(parentId);
                } else if (parentId === null) {
                    Views.renderHomeView();
                }
            }
            
            // Hide modal
            $('#folderModal').hide();
            $('#folderModal').removeData('id');
        } catch (error) {
            console.warn('Fehler beim Speichern des Ordners:', error);
        }
    },
    
    /**
     * Set folder thumbnail
     * @param {string} folderId - Folder ID
     */
    setFolderThumbnail: function(folderId) {
        try {
            const folder = FolderDAO.getById(folderId);
            if (!folder) return;
            
            // Reset thumbnail form
            $('#thumbnailModalTitle').text(`Vorschaubild für "${folder.name}"`);
            $('#thumbnailUrl').val('').prop('disabled', false);
            $('#thumbnailUpload').val('').prop('disabled', false);
            $('#usePlaceholder').prop('checked', false);
            $('#thumbnailPreview').empty().hide();
            
            // Set callback function
            $('#thumbnailModal').data('callback', () => {
                try {
                    let thumbnailData = null;
                    
                    // Get thumbnail data
                    if ($('#usePlaceholder').prop('checked')) {
                        thumbnailData = 'placeholder.png';
                    } else if ($('#thumbnailUpload')[0].files.length > 0) {
                        // Use uploaded image data from preview
                        const imgSrc = $('#thumbnailPreview img').attr('src');
                        if (imgSrc) {
                            thumbnailData = imgSrc;
                        }
                    } else if ($('#thumbnailUrl').val().trim()) {
                        thumbnailData = $('#thumbnailUrl').val().trim();
                    }
                    
                    if (thumbnailData) {
                        FolderDAO.setThumbnail(folderId, thumbnailData);
                        
                        // Refresh view
                        if (AppData.view === 'folder') {
                            if (AppData.currentFolder.id === folderId) {
                                // Current folder - refresh folder view
                                Views.renderFolderView(folderId);
                            } else if (AppData.currentFolder.id === folder.parentId) {
                                // Parent folder - refresh subfolders
                                Views.renderFolders(folder.parentId);
                            }
                        } else {
                            // Home view - refresh folders
                            Views.renderFolders(null);
                        }
                    }
                } catch (error) {
                    console.warn('Fehler beim Speichern des Vorschaubilds für Ordner:', error);
                }
            });
            
            // Show modal
            $('#thumbnailModal').css('display', 'flex');
        } catch (error) {
            console.warn('Fehler beim Öffnen des Vorschaubild-Dialogs für Ordner:', error);
        }
    },
    
    /**
     * Delete a folder
     * @param {string} folderId - Folder ID
     */
    deleteFolder: function(folderId) {
        try {
            const folder = FolderDAO.getById(folderId);
            if (!folder) return;
            
            // Get all subfolders
            const subFolders = FolderDAO.getByParentId(folderId);
            
            let message = `Möchtest du den Ordner "${folder.name}" wirklich löschen?`;
            if (subFolders.length > 0) {
                message += ` Dieser Ordner enthält ${subFolders.length} Unterordner, die ebenfalls gelöscht werden!`;
            }
            message += ' Die Pinnwände werden nicht gelöscht, sondern nur aus dem Ordner entfernt.';
            
            Views.showConfirmDialog(message, () => {
                try {
                    FolderDAO.delete(folderId);
                    
                    // If we're in the deleted folder or any of its descendants, go back to home
                    if (AppData.view === 'folder') {
                        const currentFolderId = AppData.currentFolder?.id;
                        if (currentFolderId === folderId || FolderDAO.getAllSubfolderIds(folderId).includes(currentFolderId)) {
                            Views.renderHomeView();
                        } else if (folder.parentId && AppData.currentFolder && AppData.currentFolder.id === folder.parentId) {
                            // If we're in the parent folder, refresh it
                            Views.renderFolderView(folder.parentId);
                        } else {
                            // Otherwise stay in current folder
                            Views.renderFolderView(AppData.currentFolder.id);
                        }
                    } else {
                        Views.renderHomeView();
                    }
                } catch (error) {
                    console.warn('Fehler beim Löschen des Ordners:', error);
                }
            });
        } catch (error) {
            console.warn('Fehler beim Vorbereitungen zum Löschen des Ordners:', error);
        }
    },
    
    // ... Rest der Controller-Methoden mit ähnlichen Try-Catch-Blöcken ...
    
    /**
     * Create a new board
     */
    createBoard: function() {
        try {
            // Reset form
            $('#boardModalTitle').text('Neue Pinnwand');
            $('#boardTitleInput').val('');
            
            // Reset color selection
            $('#boardColorPicker .color-option').removeClass('active');
            $('#boardColorPicker .color-option').first().addClass('active');
            
            // Update folder select
            Views.updateFolderSelect();
            
            // Set current folder if in folder view
            if (AppData.view === 'folder' && AppData.currentFolder) {
                $('#boardFolderSelect').val(AppData.currentFolder.id);
            } else {
                $('#boardFolderSelect').val('');
            }
            
            // Remove board ID data
            $('#boardModal').removeData('id');
            
            // Show modal
            $('#boardModal').css('display', 'flex');
        } catch (error) {
            console.warn('Fehler beim Erstellen einer neuen Pinnwand:', error);
        }
    },
    
    /**
     * Create a new board in a specific folder
     * @param {string} folderId - Folder ID
     */
    createBoardInFolder: function(folderId) {
        try {
            this.createBoard();
            $('#boardFolderSelect').val(folderId);
        } catch (error) {
            console.warn('Fehler beim Erstellen einer neuen Pinnwand im Ordner:', error);
        }
    },
    
    /**
     * Toggle student mode
     */
    toggleStudentMode: function() {
        try {
            AppData.studentMode = $('#studentModeToggle').prop('checked');
            
            // Update URL with mode parameter
            const url = new URL(window.location.href);
            if (AppData.studentMode) {
                url.searchParams.set('mode', 'student');
            } else {
                url.searchParams.delete('mode');
            }
            window.history.replaceState({}, '', url);
            
            // Update editor elements visibility
            $('.editor-only').toggle(!AppData.studentMode);
            
            // Update add buttons visibility
            if (AppData.studentMode) {
                $('#addCardBtnGrid, #addCategoryBtn').hide();
            } else {
                $('#addCardBtnGrid, #addCategoryBtn').show();
            }
            
            // If in categories view, refresh to hide empty categories
            if (AppData.currentBoard && AppData.currentBoard.view === 'categories') {
                Views.renderCardsCategories(AppData.currentBoard);
            }
            
            // Save to localStorage
            StorageService.saveAppData();
            
            // Update share link
            this.updateShareLink();
        } catch (error) {
            console.warn('Fehler beim Umschalten des Schülermodus:', error);
        }
    },
    
    /**
     * Open share modal
     */
    openShareModal: function() {
        try {
            this.updateShareLink();
            $('#shareModal').css('display', 'flex');
        } catch (error) {
            console.warn('Fehler beim Öffnen des Teilen-Dialogs:', error);
        }
    },
    
    /**
     * Update share link
     */
    updateShareLink: function() {
        try {
            const url = new URL(window.location.href);
            url.searchParams.set('mode', 'student');
            $('#shareLink').val(url.toString());
        } catch (error) {
            console.warn('Fehler beim Aktualisieren des Teilen-Links:', error);
        }
    },
    
    /**
     * Copy share link to clipboard
     */
    copyShareLink: function() {
        try {
            const shareLink = $('#shareLink').val();
            this.safeClipboardCopy(shareLink);
            
            // Visual feedback
            const copyBtn = $('#copyLinkBtn');
            const originalHtml = copyBtn.html();
            copyBtn.html('<i class="fas fa-check"></i>');
            
            setTimeout(() => {
                copyBtn.html(originalHtml);
            }, 2000);
        } catch (error) {
            console.warn('Fehler beim Kopieren des Teilen-Links:', error);
        }
    },
    
    /**
     * Check URL parameters on load
     */
    checkUrlParams: function() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            
            // Check for student mode
            if (urlParams.get('mode') === 'student') {
                $('#studentModeToggle').prop('checked', true);
                this.toggleStudentMode();
            }
            
            // Check for specific board or folder
            const boardId = urlParams.get('board');
            const folderId = urlParams.get('folder');
            
            if (boardId) {
                this.openBoard(boardId);
            } else if (folderId) {
                this.openFolder(folderId);
            }
        } catch (error) {
            console.warn('Fehler beim Prüfen der URL-Parameter:', error);
        }
    }
};