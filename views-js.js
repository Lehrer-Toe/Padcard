/**
 * Views for Taskcard-Manager
 * 
 * This file contains all the rendering logic for the application.
 */

const Views = {
    /**
     * Initialize all views
     */
    init: function() {
        this.initColorPickers();
    },
    
    /**
     * Initialize color pickers
     */
    initColorPickers: function() {
        // Folder color picker
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
        
        // Select first color by default
        folderColorPicker.find('.color-option').first().addClass('active');
        
        // Board color picker
        const boardColorPicker = $('#boardColorPicker');
        boardColorPicker.empty();
        
        DefaultColors.board.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.color};" data-color="${color.color}"></div>`);
            boardColorPicker.append(colorOption);
            
            colorOption.on('click', function() {
                boardColorPicker.find('.color-option').removeClass('active');
                $(this).addClass('active');
            });
        });
        
        // Select first color by default
        boardColorPicker.find('.color-option').first().addClass('active');
        
        // Card color pickers
        this.initCardColorPickers();
    },
    
    /**
     * Initialize card color pickers
     */
    initCardColorPickers: function() {
        // Predefined colors
        const materialColors = $('.material-colors');
        materialColors.empty();
        
        const colors = [
            { name: 'blue', bg: '#e3f2fd', border: '#2196F3' },
            { name: 'red', bg: '#ffebee', border: '#f44336' },
            { name: 'pink', bg: '#FCE4EC', border: '#E91E63' },
            { name: 'purple', bg: '#f3e5f5', border: '#9C27B0' },
            { name: 'deep-purple', bg: '#EDE7F6', border: '#673AB7' },
            { name: 'indigo', bg: '#E8EAF6', border: '#3F51B5' },
            { name: 'light-blue', bg: '#E1F5FE', border: '#03A9F4' },
            { name: 'cyan', bg: '#E0F7FA', border: '#00BCD4' },
            { name: 'teal', bg: '#E0F2F1', border: '#009688' },
            { name: 'green', bg: '#e8f5e9', border: '#4CAF50' },
            { name: 'light-green', bg: '#F1F8E9', border: '#8BC34A' },
            { name: 'lime', bg: '#F9FBE7', border: '#CDDC39' },
            { name: 'yellow', bg: '#fffde7', border: '#FFEB3B' },
            { name: 'amber', bg: '#FFF8E1', border: '#FFC107' },
            { name: 'orange', bg: '#fff3e0', border: '#FF9800' },
            { name: 'deep-orange', bg: '#FBE9E7', border: '#FF5722' },
            { name: 'brown', bg: '#EFEBE9', border: '#795548' },
            { name: 'grey', bg: '#FAFAFA', border: '#9E9E9E' },
            { name: 'blue-grey', bg: '#ECEFF1', border: '#607D8B' }
        ];
        
        colors.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.bg};" data-color="${color.name}"></div>`);
            materialColors.append(colorOption);
        });
        
        // Pastel colors
        const pastelColors = $('.pastel-colors');
        pastelColors.empty();
        
        const pastelPalette = [
            { bg: '#FFB6C1' }, // Light Pink
            { bg: '#FFC0CB' }, // Pink
            { bg: '#FFD1DC' }, // Pastel Pink
            { bg: '#B0E0E6' }, // Powder Blue
            { bg: '#ADD8E6' }, // Light Blue
            { bg: '#87CEFA' }, // Light Sky Blue
            { bg: '#98FB98' }, // Pale Green
            { bg: '#90EE90' }, // Light Green
            { bg: '#FFFACD' }, // Lemon Chiffon
            { bg: '#FFEFD5' }, // Papaya Whip
            { bg: '#FFDAB9' }, // Peach Puff
            { bg: '#D8BFD8' }, // Thistle
            { bg: '#E6E6FA' }, // Lavender
            { bg: '#F0FFF0' }, // Honeydew
            { bg: '#F5F5DC' }  // Beige
        ];
        
        pastelPalette.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.bg};" data-custom-color="${color.bg}" data-color="custom"></div>`);
            pastelColors.append(colorOption);
        });
        
        // Custom colors
        const customColors = $('.custom-colors');
        customColors.empty();
        
        const customPalette = [
            { bg: '#D4A5A5' }, // Rosy Brown
            { bg: '#392F5A' }, // Dark Purple
            { bg: '#31A2AC' }, // Teal
            { bg: '#F0E100' }, // Yellow
            { bg: '#FF6B6B' }, // Light Red
            { bg: '#4ECDC4' }, // Turquoise
            { bg: '#1A535C' }, // Dark Teal
            { bg: '#FFE66D' }  // Light Yellow
        ];
        
        customPalette.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.bg};" data-custom-color="${color.bg}" data-color="custom"></div>`);
            customColors.append(colorOption);
        });
        
        // Set up custom color picker and preview
        const customColorPicker = $('#customColorPicker');
        const customColorPreview = $('#customColorPreview');
        
        customColorPicker.on('input', function() {
            customColorPreview.css('backgroundColor', $(this).val());
        });
        
        // Initialize preview with default value
        customColorPreview.css('backgroundColor', customColorPicker.val());
    },
    
    /**
     * Render home view
     */
    renderHomeView: function() {
        // Hide other views and show home view
        $('#folder-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#home-view').removeClass('hidden');
        
        // Update breadcrumb
        $('.breadcrumb-current').text('Meine Boards');
        
        // Render folders
        this.renderFolders();
        
        // Render boards not in folders
        this.renderBoards(null);
        
        AppData.view = 'home';
        AppData.currentFolder = null;
        AppData.currentBoard = null;
    },
    
    /**
     * Render folder view
     * @param {string} folderId - Folder ID
     */
    renderFolderView: function(folderId) {
        const folder = FolderDAO.getById(folderId);
        if (!folder) {
            this.renderHomeView();
            return;
        }
        
        // Hide other views and show folder view
        $('#home-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#folder-view').removeClass('hidden');
        
        // Update breadcrumb
        $('.breadcrumb-current').text(folder.name);
        
        // Update folder title
        $('#folderTitle').text(folder.name);
        
        // Render boards in this folder
        this.renderBoardsInFolder(folderId);
        
        AppData.view = 'folder';
        AppData.currentFolder = folder;
        AppData.currentBoard = null;
    },
    
    /**
     * Render board view
     * @param {string} boardId - Board ID
     */
    renderBoardView: function(boardId) {
        const board = BoardDAO.getById(boardId);
        if (!board) {
            this.renderHomeView();
            return;
        }
        
        // Hide other views and show board view
        $('#home-view').addClass('hidden');
        $('#folder-view').addClass('hidden');
        $('#board-view').removeClass('hidden');
        
        // Update breadcrumb
        $('.breadcrumb-current').text(board.name);
        
        // Update board title
        $('#boardTitle').text(board.name);
        
        // Apply board background if exists
        this.applyBoardBackground(board);
        
        // Change to the correct view
        this.changeCardView(board.view || 'grid');
        
        // Update layout
        this.updateBoardLayout(board.layout || 3);
        
        // Render cards based on view
        if (board.view === 'grid') {
            this.renderCardsGrid(board);
        } else if (board.view === 'free') {
            this.renderCardsFree(board);
        } else if (board.view === 'categories') {
            this.renderCardsCategories(board);
        }
        
        // Update categories dropdown
        this.updateCategoryDropdown(board);
        
        AppData.view = 'board';
        AppData.currentBoard = board;
    },
    
    /**
     * Apply board background
     * @param {Object} board - Board object
     */
    applyBoardBackground: function(board) {
        // First remove any existing background
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
                    backgroundColor: 'rgba(245, 245, 245, 0.8)', // Add a light background color
                });
                
                // Apply opacity
                const opacity = bg.opacity !== undefined ? bg.opacity / 100 : 1;
                $('#board-view').css({
                    boxShadow: `inset 0 0 0 2000px rgba(255, 255, 255, ${1 - opacity})`
                });
            }
        }
    },
    
    /**
     * Change card view (grid, free, categories)
     * @param {string} view - View name
     */
    changeCardView: function(view) {
        // Update view buttons
        $('.view-btn').removeClass('active');
        $(`.view-btn[data-view="${view}"]`).addClass('active');
        
        // Hide all views
        $('#boardGrid').addClass('hidden');
        $('#boardFree').addClass('hidden');
        $('#boardCategories').addClass('hidden');
        
        // Show selected view
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
        
        // Update board data if this is a change
        if (AppData.currentBoard && AppData.currentBoard.view !== view) {
            BoardDAO.update(AppData.currentBoard.id, { view });
        }
    },
    
    /**
     * Update board layout (grid columns)
     * @param {number} columns - Number of columns
     */
    updateBoardLayout: function(columns) {
        // Update layout buttons
        $('.layout-btn').removeClass('active');
        $(`.layout-btn[data-columns="${columns}"]`).addClass('active');
        
        // Update grid style
        $('#boardGrid').css('gridTemplateColumns', `repeat(${columns}, 1fr)`);
        
        // Update board data if this is a change
        if (AppData.currentBoard && AppData.currentBoard.layout !== columns) {
            BoardDAO.update(AppData.currentBoard.id, { layout: columns });
        }
    },
    
    /**
     * Render folders
     */
    renderFolders: function() {
        const folderContainer = $('#folderContainer');
        folderContainer.empty();
        
        // Get all folders
        const folders = FolderDAO.getAll();
        
        // Sort alphabetically
        folders.sort((a, b) => a.name.localeCompare(b.name));
        
        // Create folder elements
        folders.forEach(folder => {
            const folderElement = this.createFolderElement(folder);
            folderContainer.append(folderElement);
        });
    },
    
    /**
     * Create folder element
     * @param {Object} folder - Folder object
     * @returns {jQuery} Folder element
     */
    createFolderElement: function(folder) {
        const folderElement = $(`
            <div class="folder" data-id="${folder.id}">
                <div class="folder-content">
                    <div class="folder-icon" style="color: ${folder.color};">
                        <i class="fas fa-folder"></i>
                    </div>
                    <div class="folder-title">${folder.name}</div>
                    <div class="folder-menu editor-only">
                        <div class="folder-menu-icon">
                            <i class="fas fa-ellipsis-v"></i>
                        </div>
                        <div class="folder-menu-dropdown">
                            <div class="folder-menu-item" data-action="edit">
                                <i class="fas fa-edit"></i> Bearbeiten
                            </div>
                            <div class="folder-menu-item" data-action="delete">
                                <i class="fas fa-trash"></i> Löschen
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // Open folder on click
        folderElement.on('click', function(e) {
            if (!$(e.target).closest('.folder-menu').length) {
                const folderId = $(this).data('id');
                Controllers.openFolder(folderId);
            }
        });
        
        // Folder menu toggle
        folderElement.find('.folder-menu-icon').on('click', function(e) {
            e.stopPropagation();
            const dropdown = $(this).siblings('.folder-menu-dropdown');
            $('.folder-menu-dropdown').not(dropdown).removeClass('show');
            dropdown.toggleClass('show');
        });
        
        // Folder menu actions
        folderElement.find('.folder-menu-item').on('click', function(e) {
            e.stopPropagation();
            const action = $(this).data('action');
            const folderId = $(this).closest('.folder').data('id');
            
            if (action === 'edit') {
                Controllers.editFolder(folderId);
            } else if (action === 'delete') {
                Controllers.deleteFolder(folderId);
            }
        });
        
        return folderElement;
    },
    
    /**
     * Render boards not in folders
     */
    renderBoards: function() {
        const boardContainer = $('#boardContainer');
        boardContainer.empty();
        
        // Get boards not in folders
        const boards = BoardDAO.getByFolderId(null);
        
        // Add the "Add board" button for non-student mode
        if (!AppData.studentMode) {
            const addBoardButton = $(`
                <div class="board editor-only add-board">
                    <div class="board-preview">
                        <i class="fas fa-plus"></i>
                    </div>
                    <div class="board-info">
                        <div class="board-title">Neue Pinnwand erstellen</div>
                    </div>
                </div>
            `);
            
            addBoardButton.on('click', function() {
                Controllers.createBoard();
            });
            
            boardContainer.append(addBoardButton);
        }
        
        // If no boards, show message
        if (boards.length === 0) {
            if (AppData.studentMode) {
                boardContainer.append(`
                    <div class="text-center" style="grid-column: 1/-1; padding: 20px;">
                        <p>Keine Pinnwände vorhanden.</p>
                    </div>
                `);
            }
            return;
        }
        
        // Sort boards
        const sortOrder = $('.sort-option.active').data('sort') || 'name';
        this.sortBoards(boards, sortOrder);
        
        // Create board elements
        boards.forEach(board => {
            const boardElement = this.createBoardElement(board);
            boardContainer.append(boardElement);
        });
    },
    
    /**
     * Render boards in folder
     * @param {string} folderId - Folder ID
     */
    renderBoardsInFolder: function(folderId) {
        const boardContainer = $('#folderBoardContainer');
        boardContainer.empty();
        
        // Get boards in folder
        const boards = BoardDAO.getByFolderId(folderId);
        
        // Add the "Add board" button for non-student mode
        if (!AppData.studentMode) {
            const addBoardButton = $(`
                <div class="board editor-only add-board">
                    <div class="board-preview">
                        <i class="fas fa-plus"></i>
                    </div>
                    <div class="board-info">
                        <div class="board-title">Neue Pinnwand erstellen</div>
                    </div>
                </div>
            `);
            
            addBoardButton.on('click', function() {
                Controllers.createBoardInFolder(folderId);
            });
            
            boardContainer.append(addBoardButton);
        }
        
        // If no boards, show message
        if (boards.length === 0) {
            if (AppData.studentMode) {
                boardContainer.append(`
                    <div class="text-center" style="grid-column: 1/-1; padding: 20px;">
                        <p>Keine Pinnwände in diesem Ordner.</p>
                    </div>
                `);
            }
            return;
        }
        
        // Sort boards
        const sortOrder = $('.sort-option.active').data('sort') || 'name';
        this.sortBoards(boards, sortOrder);
        
        // Create board elements
        boards.forEach(board => {
            const boardElement = this.createBoardElement(board);
            boardContainer.append(boardElement);
        });
    },
    
    /**
     * Sort boards by given order
     * @param {Array} boards - Array of board objects
     * @param {string} order - Sort order (name or date)
     */
    sortBoards: function(boards, order) {
        if (order === 'name') {
            boards.sort((a, b) => a.name.localeCompare(b.name));
        } else if (order === 'date') {
            boards.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        }
    },
    
    /**
     * Create board element
     * @param {Object} board - Board object
     * @returns {jQuery} Board element
     */
    createBoardElement: function(board) {
        // Get card count
        const cardCount = board.cards ? board.cards.length : 0;
        
        // Format date
        const updatedDate = Utils.formatDate(board.updated);
        
        const boardElement = $(`
            <div class="board" data-id="${board.id}">
                <div class="board-preview" style="background-color: ${board.color}">
                    <i class="fas fa-thumbtack"></i>
                </div>
                <div class="board-info">
                    <div class="board-header">
                        <div class="board-title">${board.name}</div>
                        <div class="board-menu editor-only">
                            <div class="board-menu-icon">
                                <i class="fas fa-ellipsis-v"></i>
                            </div>
                            <div class="board-menu-dropdown">
                                <div class="board-menu-item" data-action="edit">
                                    <i class="fas fa-edit"></i> Bearbeiten
                                </div>
                                <div class="board-menu-item" data-action="delete">
                                    <i class="fas fa-trash"></i> Löschen
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="board-meta">
                        <div class="board-meta-item">
                            <i class="fas fa-sticky-note"></i> ${cardCount} Karten
                        </div>
                        <div class="board-meta-item">
                            <i class="fas fa-clock"></i> ${updatedDate}
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        // If board has a background, add it to preview
        if (board.background && (board.background.url || board.background.data)) {
            const bgUrl = board.background.data || board.background.url;
            boardElement.find('.board-preview').append(`
                <img src="${bgUrl}" class="board-preview-image" alt="${board.name}">
            `);
        }
        
        // Open board on click
        boardElement.on('click', function(e) {
            if (!$(e.target).closest('.board-menu').length) {
                const boardId = $(this).data('id');
                Controllers.openBoard(boardId);
            }
        });
        
        // Board menu toggle
        boardElement.find('.board-menu-icon').on('click', function(e) {
            e.stopPropagation();
            const dropdown = $(this).siblings('.board-menu-dropdown');
            $('.board-menu-dropdown').not(dropdown).removeClass('show');
            dropdown.toggleClass('show');
        });
        
        // Board menu actions
        boardElement.find('.board-menu-item').on('click', function(e) {
            e.stopPropagation();
            const action = $(this).data('action');
            const boardId = $(this).closest('.board').data('id');
            
            if (action === 'edit') {
                Controllers.editBoard(boardId);
            } else if (action === 'delete') {
                Controllers.deleteBoard(boardId);
            }
        });
        
        return boardElement;
    },
    
    /**
     * Render cards in grid view
     * @param {Object} board - Board object
     */
    renderCardsGrid: function(board) {
        const boardGrid = $('#boardGrid');
        
        // Remove all cards except add button
        boardGrid.find('.card:not(.add-card)').remove();
        
        if (!board.cards || board.cards.length === 0) {
            return;
        }
        
        // Create card elements
        board.cards.forEach(card => {
            // Skip cards that belong to a category in grid view
            if (card.category) return;
            
            const cardElement = this.createCardElement(card, board.id);
            cardElement.insertBefore($('#addCardBtnGrid'));
        });
    },
    
    /**
     * Render cards in free position view
     * @param {Object} board - Board object
     */
    renderCardsFree: function(board) {
        const boardFree = $('#boardFree');
        boardFree.empty();
        
        if (!board.cards || board.cards.length === 0) {
            return;
        }
        
        // Create card elements with absolute positioning
        board.cards.forEach(card => {
            const cardElement = this.createCardElement(card, board.id);
            
            // Apply absolute positioning
            cardElement.css({
                position: 'absolute',
                width: card.width === 3 ? '600px' : (card.width === 2 ? '450px' : '300px'),
                height: card.height === 3 ? '600px' : (card.height === 2 ? '400px' : '200px')
            });
            
            // Apply saved position if available
            if (card.position) {
                cardElement.css({
                    left: card.position.left,
                    top: card.position.top
                });
            } else {
                // Default random position if none saved
                const randomLeft = Math.floor(Math.random() * 300);
                const randomTop = Math.floor(Math.random() * 300);
                cardElement.css({
                    left: randomLeft,
                    top: randomTop
                });
            }
            
            // Add resize handle
            cardElement.append(`
                <div class="resize-handle">
                    <i class="fas fa-grip-lines-diagonal"></i>
                </div>
            `);
            
            boardFree.append(cardElement);
        });
        
        // Make cards draggable and resizable
        this.initDraggableCards();
    },
    
    /**
     * Initialize draggable and resizable cards
     */
    initDraggableCards: function() {
        // Make cards draggable
        $('#boardFree .card').draggable({
            containment: 'parent',
            handle: '.card-header',
            stack: '.card',
            stop: function(event, ui) {
                const cardId = $(this).data('id');
                const boardId = AppData.currentBoard.id;
                
                // Update card position in the database
                BoardDAO.updateCard(boardId, cardId, {
                    position: {
                        left: ui.position.left,
                        top: ui.position.top
                    }
                });
            }
        });
        
        // Make cards resizable
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
                
                // Update card size in the database
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
     * Render cards in categories view
     * @param {Object} board - Board object
     */
    renderCardsCategories: function(board) {
        const boardCategories = $('#boardCategories');
        
        // Remove all categories except add button
        boardCategories.find('.category').remove();
        
        // Create "Uncategorized" section
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
            
            // Add placeholder if empty
            if (uncategorizedCards.length === 0) {
                categoryCards.append(`
                    <div class="category-placeholder">Keine Karten in dieser Kategorie</div>
                `);
            }
            
            uncategorizedElement.insertBefore($('#addCategoryBtn'));
        }
        
        // Add defined categories
        if (board.categories && board.categories.length > 0) {
            board.categories.forEach(category => {
                const categoryCards = board.cards ? board.cards.filter(card => card.category === category.id) : [];
                
                // Skip empty categories in student mode
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
                
                // Add placeholder if empty
                if (categoryCards.length === 0) {
                    categoryCardsContainer.append(`
                        <div class="category-placeholder">Keine Karten in dieser Kategorie</div>
                    `);
                }
                
                // Category actions
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
        
        // Initialize sortable for category cards
        this.initSortableCategories();
    },
    
    /**
     * Initialize sortable for category cards
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
                
                // Update card category in the database
                BoardDAO.updateCard(boardId, cardId, {
                    category: categoryId
                });
            }
        }).disableSelection();
    },
    
    /**
     * Create card element
     * @param {Object} card - Card data
     * @param {string} boardId - Board ID
     * @returns {jQuery} Card element
     */
    createCardElement: function(card, boardId) {
        // Create base card element
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
        
        // Apply custom color if set
        if (card.color === 'custom' && card.customColor) {
            cardElement.css({
                'background-color': Utils.lightenColor(card.customColor, 0.9),
                'border-top': `4px solid ${card.customColor}`
            });
        }
        
        // Apply width in grid view
        if (AppData.view !== 'free' && card.width > 1) {
            cardElement.css('grid-column', `span ${card.width}`);
        }
        
        // Apply height
        if (card.height > 1) {
            cardContent.css('min-height', card.height === 3 ? '400px' : '300px');
        }
        
        // Apply custom size if available (in free view)
        if (AppData.view === 'free' && card.size) {
            cardElement.css({
                width: card.size.width,
                height: card.size.height
            });
        }
        
        // Add card text content
        if (card.content) {
            cardContent.append(`<div class="card-text">${card.content}</div>`);
        }
        
        // Add type-specific content
        if (card.type === 'youtube' && card.youtubeId) {
            cardContent.append(`
                <div class="card-youtube" data-youtube-id="${card.youtubeId}">
                    <img src="https://img.youtube.com/vi/${card.youtubeId}/maxresdefault.jpg" alt="YouTube Thumbnail">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
            `);
            
            // Add click handler for play button
            cardElement.find('.play-button').on('click', function() {
                const youtubeId = $(this).parent().data('youtube-id');
                const youtubeContainer = $(this).parent();
                
                // Replace thumbnail with iframe
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
        
        // Card menu toggle
        cardElement.find('.card-menu i').on('click', function(e) {
            e.stopPropagation();
            const dropdown = $(this).siblings('.card-menu-dropdown');
            
            // Close all other dropdowns
            $('.card-menu-dropdown.show').not(dropdown).removeClass('show');
            
            dropdown.toggleClass('show');
        });
        
        // Card menu actions
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
     * Update category dropdown in card modal
     * @param {Object} board - Board object
     */
    updateCategoryDropdown: function(board) {
        const categorySelect = $('#cardCategory');
        categorySelect.empty();
        
        // Add "No category" option
        categorySelect.append('<option value="">Keine Kategorie</option>');
        
        // Add categories
        if (board.categories && board.categories.length > 0) {
            board.categories.forEach(category => {
                categorySelect.append(`<option value="${category.id}">${category.name}</option>`);
            });
        }
    },
    
    /**
     * Update folder select dropdown in board modal
     */
    updateFolderSelect: function() {
        const folderSelect = $('#boardFolderSelect');
        folderSelect.empty();
        
        // Add "No folder" option
        folderSelect.append('<option value="">Kein Ordner</option>');
        
        // Add folders
        const folders = FolderDAO.getAll();
        folders.forEach(folder => {
            folderSelect.append(`<option value="${folder.id}">${folder.name}</option>`);
        });
    },
    
    /**
     * Render categories list in category modal
     * @param {Object} board - Board object
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
            
            // Edit event
            categoryItem.find('button[data-action="edit"]').on('click', function() {
                Controllers.editCategory(category.id);
            });
            
            // Delete event
            categoryItem.find('button[data-action="delete"]').on('click', function() {
                Controllers.deleteCategory(category.id);
            });
            
            categoryList.append(categoryItem);
        });
    },
    
    /**
     * Show confirmation modal
     * @param {string} title - Modal title
     * @param {string} message - Confirmation message
     * @param {Function} callback - Function to call when confirmed
     */
    showConfirmModal: function(title, message, callback) {
        // Set title and message
        $('#confirmTitle').text(title);
        $('#confirmMessage').text(message);
        
        // Set confirm button action
        $('#confirmBtn').off('click').on('click', function() {
            $('#confirmModal').hide();
            if (typeof callback === 'function') {
                callback();
            }
        });
        
        // Show modal
        $('#confirmModal').show();
    }
};
