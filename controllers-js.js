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
    },
    
    /**
     * Initialize event handlers
     */
    initEventHandlers: function() {
        // Navigation
        $('.breadcrumb-home').on('click', () => this.navigateHome());
        
        // Folder actions
        $('#newFolderBtn').on('click', () => this.createFolder());
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
        $('#backgroundUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                $('#backgroundFileName').text(file.name);
                // Preview the image
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('.bg-preview').css('backgroundImage', `url(${e.target.result})`);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Image upload for cards
        $('#imageUpload').on('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#imagePreview').show().html(`<img src="${e.target.result}" alt="Preview">`);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Audio upload for cards
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
        
        // Placeholder for image cards
        $('#placeholderBtn').on('click', () => {
            $('#imageUrl').val('https://placehold.co/600x400/e3f2fd/2196F3?text=Bildinhalt');
            $('#imagePreview').show().html(`<img src="https://placehold.co/600x400/e3f2fd/2196F3?text=Bildinhalt" alt="Preview">`);
        });
        
        // Student mode toggle
        $('#studentModeToggle').on('change', () => this.toggleStudentMode());
        
        // Share button
        $('#shareBtn').on('click', () => this.openShareModal());
        $('#closeShareModal').on('click', () => $('#shareModal').hide());
        $('#copyLinkBtn').on('click', () => this.copyShareLink());
        
        // Import/Export
        $('#exportBtn').on('click', () => StorageService.exportData());
        $('#importFile').on('change', (e) => this.importData(e));
        
        // Sort options
        $('.sort-option').on('click', function() {
            $('.sort-option').removeClass('active');
            $(this).addClass('active');
            
            // Resort boards
            if (AppData.view === 'home') {
                Views.renderBoards(null);
            } else if (AppData.view === 'folder' && AppData.currentFolder) {
                Views.renderBoardsInFolder(AppData.currentFolder.id);
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
    },
    
    /**
     * Navigate to home view
     */
    navigateHome: function() {
        Views.renderHomeView();
    },
    
    /**
     * Open a folder
     * @param {string} folderId - Folder ID
     */
    openFolder: function(folderId) {
        Views.renderFolderView(folderId);
    },
    
    /**
     * Open a board
     * @param {string} boardId - Board ID
     */
    openBoard: function(boardId) {
        Views.renderBoardView(boardId);
    },
    
    /**
     * Create a new folder
     */
    createFolder: function() {
        // Reset form
        $('#folderModalTitle').text('Neuer Ordner');
        $('#folderTitle').val('');
        
        // Reset color selection
        $('#folderColorPicker .color-option').removeClass('active');
        $('#folderColorPicker .color-option').first().addClass('active');
        
        // Show modal
        $('#folderModal').show();
    },
    
    /**
     * Edit a folder
     * @param {string} folderId - Folder ID
     */
    editFolder: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) return;
        
        // Set form values
        $('#folderModalTitle').text('Ordner bearbeiten');
        $('#folderTitle').val(folder.name);
        
        // Set color
        $('#folderColorPicker .color-option').removeClass('active');
        const colorOption = $(`#folderColorPicker .color-option[data-color="${folder.color}"]`);
        if (colorOption.length) {
            colorOption.addClass('active');
        } else {
            $('#folderColorPicker .color-option').first().addClass('active');
        }
        
        // Store folder ID in form
        $('#folderModal').data('id', folder.id);
        
        // Show modal
        $('#folderModal').show();
    },
    
    /**
     * Edit the current folder
     */
    editCurrentFolder: function() {
        if (AppData.currentFolder) {
            this.editFolder(AppData.currentFolder.id);
        }
    },
    
    /**
     * Save a folder (create or update)
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
            // Update existing folder
            FolderDAO.update(folderId, { name: title, color: color });
            
            // Update view
            if (AppData.view === 'folder' && AppData.currentFolder && AppData.currentFolder.id === folderId) {
                Views.renderFolderView(folderId);
            } else {
                Views.renderFolders();
            }
        } else {
            // Create new folder
            const folder = FolderDAO.create(title, color);
            Views.renderFolders();
        }
        
        // Hide modal
        $('#folderModal').hide();
        $('#folderModal').removeData('id');
    },
    
    /**
     * Delete a folder
     * @param {string} folderId - Folder ID
     */
    deleteFolder: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) return;
        
        Views.showConfirmModal(
            'Ordner löschen',
            `Möchtest du den Ordner "${folder.name}" wirklich löschen? Die Pinnwände bleiben erhalten.`,
            () => {
                FolderDAO.delete(folderId);
                
                // If we're in the deleted folder, go back to home
                if (AppData.view === 'folder' && AppData.currentFolder && AppData.currentFolder.id === folderId) {
                    Views.renderHomeView();
                } else {
                    Views.renderFolders();
                }
            }
        );
    },
    
    /**
     * Create a new board
     */
    createBoard: function() {
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
        
        // Show modal
        $('#boardModal').show();
    },
    
    /**
     * Create a new board in a specific folder
     * @param {string} folderId - Folder ID
     */
    createBoardInFolder: function(folderId) {
        this.createBoard();
        $('#boardFolderSelect').val(folderId);
    },
    
    /**
     * Edit a board
     * @param {string} boardId - Board ID
     */
    editBoard: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        
        // Set form values
        $('#boardModalTitle').text('Pinnwand bearbeiten');
        $('#boardTitleInput').val(board.name);
        
        // Set color
        $('#boardColorPicker .color-option').removeClass('active');
        const colorOption = $(`#boardColorPicker .color-option[data-color="${board.color}"]`);
        if (colorOption.length) {
            colorOption.addClass('active');
        } else {
            $('#boardColorPicker .color-option').first().addClass('active');
        }
        
        // Update folder select
        Views.updateFolderSelect();
        $('#boardFolderSelect').val(board.folderId || '');
        
        // Store board ID in form
        $('#boardModal').data('id', board.id);
        
        // Show modal
        $('#boardModal').show();
    },
    
    /**
     * Edit the current board
     */
    editCurrentBoard: function() {
        if (AppData.currentBoard) {
            this.editBoard(AppData.currentBoard.id);
        }
    },
    
    /**
     * Save a board (create or update)
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
            // Update existing board
            BoardDAO.update(boardId, { 
                name: title, 
                color: color,
                folderId: folderId || null
            });
            
            // Update view
            if (AppData.view === 'board' && AppData.currentBoard && AppData.currentBoard.id === boardId) {
                // Update board title
                $('#boardTitle').text(title);
            } else if (AppData.view === 'folder' && AppData.currentFolder) {
                // Refresh folder view
                Views.renderBoardsInFolder(AppData.currentFolder.id);
            } else {
                // Refresh home view
                Views.renderBoards(null);
            }
        } else {
            // Create new board
            const board = BoardDAO.create(title, color, folderId || null);
            
            // Update view
            if (AppData.view === 'folder' && AppData.currentFolder) {
                Views.renderBoardsInFolder(AppData.currentFolder.id);
            } else {
                Views.renderBoards(null);
            }
        }
        
        // Hide modal
        $('#boardModal').hide();
        $('#boardModal').removeData('id');
    },
    
    /**
     * Delete a board
     * @param {string} boardId - Board ID
     */
    deleteBoard: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        
        Views.showConfirmModal(
            'Pinnwand löschen',
            `Möchtest du die Pinnwand "${board.name}" wirklich löschen? Alle Karten werden ebenfalls gelöscht.`,
            () => {
                BoardDAO.delete(boardId);
                
                // If we're in the deleted board, go back to previous view
                if (AppData.view === 'board' && AppData.currentBoard && AppData.currentBoard.id === boardId) {
                    if (AppData.currentBoard.folderId) {
                        Views.renderFolderView(AppData.currentBoard.folderId);
                    } else {
                        Views.renderHomeView();
                    }
                } else if (AppData.view === 'folder' && AppData.currentFolder) {
                    Views.renderBoardsInFolder(AppData.currentFolder.id);
                } else {
                    Views.renderBoards(null);
                }
            }
        );
    },
    
    /**
     * Create a new card
     */
    createCard: function() {
        if (!AppData.currentBoard) return;
        
        // Reset form
        $('#cardModalTitle').text('Neue Karte');
        $('#cardTitle').val('');
        $('#cardContent').val('');
        $('#youtubeUrl').val('');
        $('#imageUrl').val('');
        $('#linkUrl').val('');
        $('#learningappUrl').val('');
        
        // Reset card type
        $('.card-type-option').removeClass('active');
        $('.card-type-option[data-type="text"]').addClass('active');
        $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
        
        // Reset color selection
        $('.color-palette').removeClass('active');
        $('.color-palette[data-palette="material"]').addClass('active');
        $('.material-colors').show();
        $('.pastel-colors, .custom-colors').hide();
        $('.color-option').removeClass('active');
        $('.material-colors .color-option[data-color="blue"]').addClass('active');
        
        // Reset size selection
        $('.width-btn, .height-btn').removeClass('active');
        $('.width-btn[data-width="1"], .height-btn[data-height="1"]').addClass('active');
        
        // Reset category selection
        $('#cardCategory').val('');
        
        // Reset image and audio preview
        $('#imagePreview, #audioPreview').hide().empty();
        
        // Clear card ID
        $('#cardModal').removeData('id');
        
        // Show modal
        $('#cardModal').show();
    },
    
    /**
     * Edit a card
     * @param {string} boardId - Board ID
     * @param {string} cardId - Card ID
     */
    editCard: function(boardId, cardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        
        const card = board.cards.find(c => c.id === cardId);
        if (!card) return;
        
        // Set form values
        $('#cardModalTitle').text('Karte bearbeiten');
        $('#cardTitle').val(card.title || '');
        $('#cardContent').val(card.content || '');
        
        // Set card type
        $('.card-type-option').removeClass('active');
        $(`.card-type-option[data-type="${card.type || 'text'}"]`).addClass('active');
        
        // Hide all type-specific fields
        $('.youtube-fields, .image-fields, .link-fields, .learningapp-fields, .audio-fields').hide();
        
        // Show and fill type-specific fields
        if (card.type === 'youtube') {
            $('.youtube-fields').show();
            $('#youtubeUrl').val(card.youtubeId ? `https://www.youtube.com/watch?v=${card.youtubeId}` : '');
        } else if (card.type === 'image') {
            $('.image-fields').show();
            $('#imageUrl').val(card.imageUrl || '');
            
            // Show image preview
            if (card.imageUrl || card.imageData) {
                const imageUrl = card.imageData || card.imageUrl;
                $('#imagePreview').show().html(`<img src="${imageUrl}" alt="Preview">`);
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
            
            // Show audio preview
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
        
        // Set color
        let colorPalette = 'material';
        $('.color-option').removeClass('active');
        
        if (card.color === 'custom' && card.customColor) {
            colorPalette = 'custom';
            $('#customColorPicker').val(card.customColor);
            $('#customColorPreview').css('backgroundColor', card.customColor);
        } else {
            // Find the right palette for this color
            if (['red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue', 'light-blue', 
                 'cyan', 'teal', 'green', 'light-green', 'lime', 'yellow', 'amber', 
                 'orange', 'deep-orange', 'brown', 'grey', 'blue-grey'].includes(card.color)) {
                colorPalette = 'material';
                $(`.material-colors .color-option[data-color="${card.color}"]`).addClass('active');
            } else {
                // Try to find in pastel or custom palettes
                const pastelOption = $(`.pastel-colors .color-option[data-custom-color="${card.customColor}"]`);
                const customOption = $(`.custom-colors .color-option[data-custom-color="${card.customColor}"]`);
                
                if (pastelOption.length) {
                    colorPalette = 'pastel';
                    pastelOption.addClass('active');
                } else if (customOption.length) {
                    colorPalette = 'custom';
                    customOption.addClass('active');
                } else {
                    // Default to blue if no match
                    colorPalette = 'material';
                    $('.material-colors .color-option[data-color="blue"]').addClass('active');
                }
            }
        }
        
        // Set color palette
        $('.color-palette').removeClass('active');
        $(`.color-palette[data-palette="${colorPalette}"]`).addClass('active');
        $('.material-colors, .pastel-colors, .custom-colors').hide();
        $(`.${colorPalette}-colors`).show();
        
        // Set size
        $('.width-btn').removeClass('active');
        $(`.width-btn[data-width="${card.width || 1}"]`).addClass('active');
        
        $('.height-btn').removeClass('active');
        $(`.height-btn[data-height="${card.height || 1}"]`).addClass('active');
        
        // Set category
        $('#cardCategory').val(card.category || '');
        
        // Store card and board ID in form
        $('#cardModal').data('id', card.id);
        $('#cardModal').data('boardId', boardId);
        
        // Show modal
        $('#cardModal').show();
    },
    
    /**
     * Save a card (create or update)
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
        
        // Get selected card type
        const cardType = $('.card-type-option.active').data('type') || 'text';
        
        // Get selected color
        let cardColor = 'blue';
        let customColor = '';
        
        if ($('.color-option.active').length) {
            cardColor = $('.color-option.active').data('color');
            if (cardColor === 'custom') {
                customColor = $('.color-option.active').data('custom-color') || $('#customColorPicker').val();
            }
        }
        
        // Get selected size
        const cardWidth = parseInt($('.width-btn.active').data('width') || 1);
        const cardHeight = parseInt($('.height-btn.active').data('height') || 1);
        
        // Get selected category
        const cardCategory = $('#cardCategory').val();
        
        // Prepare card data
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
        
        // Add type-specific data
        if (cardType === 'youtube') {
            const youtubeId = Utils.getYoutubeId($('#youtubeUrl').val().trim());
            if (!youtubeId) {
                alert('Bitte gib eine gültige YouTube-URL ein.');
                return;
            }
            cardData.youtubeId = youtubeId;
        } else if (cardType === 'image') {
            // Check for uploaded image first
            const imageFile = $('#imageUpload')[0].files[0];
            if (imageFile) {
                try {
                    const imageData = await Utils.fileToBase64(imageFile);
                    cardData.imageData = imageData;
                } catch (error) {
                    console.error('Error converting image to base64:', error);
                }
            } else {
                // Use image URL
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
            
            // Add https:// if missing
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
            // Check for uploaded audio first
            const audioFile = $('#audioUpload')[0].files[0];
            if (audioFile) {
                try {
                    const audioData = await Utils.fileToBase64(audioFile);
                    cardData.audioData = audioData;
                } catch (error) {
                    console.error('Error converting audio to base64:', error);
                }
            } else {
                // Use audio URL
                const audioUrl = $('#audioUrl').val().trim();
                if (!audioUrl) {
                    alert('Bitte gib eine Audio-URL ein oder lade eine Audio-Datei hoch.');
                    return;
                }
                cardData.audioUrl = audioUrl;
            }
        }
        
        // Save card
        if (cardId) {
            // Update existing card
            BoardDAO.updateCard(boardId, cardId, cardData);
        } else {
            // Create new card
            BoardDAO.addCard(boardId, cardData);
        }
        
        // Update view
        this.refreshBoardView();
        
        // Hide modal
        $('#cardModal').hide();
        $('#cardModal').removeData('id');
    },
    
    /**
     * Duplicate a card
     * @param {string} boardId - Board ID
     * @param {string} cardId - Card ID
     */
    duplicateCard: function(boardId, cardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) return;
        
        const card = board.cards.find(c => c.id === cardId);
        if (!card) return;
        
        // Create a copy of the card
        const newCardData = { ...card };
        delete newCardData.id; // Remove ID so a new one is generated
        
        // Add "(Kopie)" to title
        newCardData.title = `${newCardData.title} (Kopie)`;
        
        // In free view, offset position slightly
        if (AppData.currentBoard.view === 'free' && newCardData.position) {
            newCardData.position = {
                left: newCardData.position.left + 20,
                top: newCardData.position.top + 20
            };
        }
        
        // Add the new card
        BoardDAO.addCard(boardId, newCardData);
        
        // Update view
        this.refreshBoardView();
    },
    
    /**
     * Delete a card
     * @param {string} boardId - Board ID
     * @param {string} cardId - Card ID
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
     * Filter cards based on search input
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
            // First hide/show cards
            $('.card:not(.add-card)').each(function() {
                const title = $(this).find('.card-title').text().toLowerCase();
                const content = $(this).find('.card-text').text().toLowerCase();
                
                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
            
            // Then hide categories with no visible cards
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
     * Refresh the current board view
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
     * Open the category modal
     */
    openCategoryModal: function() {
        if (!AppData.currentBoard) return;
        
        // Render categories list
        Views.renderCategoriesList(AppData.currentBoard);
        
        // Reset new category input
        $('#newCategoryInput').val('');
        
        // Show modal
        $('#categoryModal').show();
    },
    
    /**
     * Create a new category
     */
    createCategory: function() {
        if (!AppData.currentBoard) return;
        
        // Open the modal with prompt
        $('#categoryModal').show();
        $('#newCategoryInput').focus();
    },
    
    /**
     * Save a new category
     */
    saveCategory: function() {
        if (!AppData.currentBoard) return;
        
        const categoryName = $('#newCategoryInput').val().trim();
        if (!categoryName) {
            alert('Bitte gib einen Namen für die Kategorie ein.');
            return;
        }
        
        // Add the category
        BoardDAO.addCategory(AppData.currentBoard.id, categoryName);
        
        // Update views
        Views.renderCategoriesList(AppData.currentBoard);
        Views.updateCategoryDropdown(AppData.currentBoard);
        
        if (AppData.currentBoard.view === 'categories') {
            Views.renderCardsCategories(AppData.currentBoard);
        }
        
        // Reset input
        $('#newCategoryInput').val('');
    },
    
    /**
     * Edit a category
     * @param {string} categoryId - Category ID
     */
    editCategory: function(categoryId) {
        if (!AppData.currentBoard) return;
        
        const category = AppData.currentBoard.categories.find(cat => cat.id === categoryId);
        if (!category) return;
        
        const newName = prompt('Kategorie umbenennen:', category.name);
        if (newName && newName.trim()) {
            // Update the category
            BoardDAO.updateCategory(AppData.currentBoard.id, categoryId, newName.trim());
            
            // Update views
            Views.renderCategoriesList(AppData.currentBoard);
            Views.updateCategoryDropdown(AppData.currentBoard);
            
            if (AppData.currentBoard.view === 'categories') {
                Views.renderCardsCategories(AppData.currentBoard);
            }
        }
    },
    
    /**
     * Delete a category
     * @param {string} categoryId - Category ID
     */
    deleteCategory: function(categoryId) {
        if (!AppData.currentBoard) return;
        
        const category = AppData.currentBoard.categories.find(cat => cat.id === categoryId);
        if (!category) return;
        
        Views.showConfirmModal(
            'Kategorie löschen',
            `Möchtest du die Kategorie "${category.name}" wirklich löschen? Die Karten werden nicht gelöscht, sondern nur aus der Kategorie entfernt.`,
            () => {
                // Delete the category
                BoardDAO.deleteCategory(AppData.currentBoard.id, categoryId);
                
                // Update views
                Views.renderCategoriesList(AppData.currentBoard);
                Views.updateCategoryDropdown(AppData.currentBoard);
                
                if (AppData.currentBoard.view === 'categories') {
                    Views.renderCardsCategories(AppData.currentBoard);
                }
            }
        );
    },
    
    /**
     * Open the background modal
     */
    openBackgroundModal: function() {
        if (!AppData.currentBoard) return;
        
        // Reset form
        $('#backgroundUrl').val('');
        $('#backgroundUpload').val('');
        $('#backgroundFileName').text('Keine Datei ausgewählt');
        
        // Reset preview images
        $('.bg-preview').css('backgroundImage', '');
        
        // Set defaults from current background if exists
        if (AppData.currentBoard.background) {
            const bg = AppData.currentBoard.background;
            
            if (bg.url) {
                $('#backgroundUrl').val(bg.url);
            }
            
            // Set style
            $('.background-style-option').removeClass('active');
            $(`.background-style-option[data-style="${bg.style || 'cover'}"]`).addClass('active');
            
            // Set opacity
            $('#backgroundOpacity').val(bg.opacity !== undefined ? bg.opacity : 100);
            $('#opacityValue').text(`${bg.opacity !== undefined ? bg.opacity : 100}%`);
            
            // Set preview
            if (bg.data || bg.url) {
                $('.bg-preview').css('backgroundImage', `url(${bg.data || bg.url})`);
            }
        }
        
        // Show modal
        $('#backgroundModal').show();
    },
    
    /**
     * Save background settings
     */
    async saveBackground() {
        if (!AppData.currentBoard) return;
        
        // Prepare background data
        const backgroundData = {
            url: $('#backgroundUrl').val().trim(),
            style: $('.background-style-option.active').data('style') || 'cover',
            opacity: parseInt($('#backgroundOpacity').val()) || 100
        };
        
        // Check for uploaded file
        const backgroundFile = $('#backgroundUpload')[0].files[0];
        if (backgroundFile) {
            try {
                const backgroundImage = await Utils.fileToBase64(backgroundFile);
                backgroundData.data = backgroundImage;
                backgroundData.url = ''; // Clear URL if we have a data URI
            } catch (error) {
                console.error('Error converting background to base64:', error);
            }
        }
        
        // Validate we have either URL or data
        if (!backgroundData.url && !backgroundData.data) {
            alert('Bitte gib eine URL ein oder lade ein Bild hoch.');
            return;
        }
        
        // Save background
        BoardDAO.setBackground(AppData.currentBoard.id, backgroundData);
        
        // Apply background
        Views.applyBoardBackground(AppData.currentBoard);
        
        // Hide modal
        $('#backgroundModal').hide();
    },
    
    /**
     * Remove background from board
     */
    removeBackground: function() {
        if (!AppData.currentBoard) return;
        
        BoardDAO.removeBackground(AppData.currentBoard.id);
        
        // Update view
        Views.applyBoardBackground(AppData.currentBoard);
        
        // Hide modal
        $('#backgroundModal').hide();
    },
    
    /**
     * Toggle student mode
     */
    toggleStudentMode: function() {
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
    },
    
    /**
     * Open share modal
     */
    openShareModal: function() {
        this.updateShareLink();
        $('#shareModal').show();
    },
    
    /**
     * Update share link
     */
    updateShareLink: function() {
        const url = new URL(window.location.href);
        url.searchParams.set('mode', 'student');
        $('#shareLink').val(url.toString());
    },
    
    /**
     * Copy share link to clipboard
     */
    copyShareLink: function() {
        const shareLink = $('#shareLink')[0];
        shareLink.select();
        document.execCommand('copy');
        
        // Visual feedback
        const copyBtn = $('#copyLinkBtn');
        const originalHtml = copyBtn.html();
        copyBtn.html('<i class="fas fa-check"></i>');
        
        setTimeout(() => {
            copyBtn.html(originalHtml);
        }, 2000);
    },
    
    /**
     * Import data from file
     * @param {Event} event - Change event from file input
     */
    importData: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate imported data
                if (importedData && Array.isArray(importedData.folders) && Array.isArray(importedData.boards)) {
                    Views.showConfirmModal(
                        'Daten importieren',
                        'Möchtest du die aktuellen Daten mit den importierten ersetzen? Alle vorhandenen Daten werden überschrieben.',
                        () => {
                            if (StorageService.importData(importedData)) {
                                // Refresh view
                                Views.renderHomeView();
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
                console.error('Import error:', error);
                alert('Fehler beim Importieren: Ungültiges Dateiformat.');
            }
        };
        reader.readAsText(file);
        
        // Reset input value to allow importing the same file again
        event.target.value = '';
    },
    
    /**
     * Check URL parameters on load
     */
    checkUrlParams: function() {
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
    }
};
