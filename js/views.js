/**
 * Views für snapWall
 * 
 * Diese Datei enthält die gesamte Rendering-Logik für die Anwendung.
 */

const Views = {
    init: function() {
        this.initColorPickers();
        this.initSidebar();
    },
    
    initSidebar: function() {
        $('#menuLatestActivity').on('click', () => this.renderLatestActivitiesView());
        $('#menuMyPadcards').on('click', () => this.renderMyPadcardsView());
        $('#sidebarToggle').on('click', () => {
            $('#sidebar').toggleClass('collapsed');
        });
        this.renderFolderList();
    },
    
    initColorPickers: function() {
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
        folderColorPicker.find('.color-option').first().addClass('active');
        
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
        boardColorPicker.find('.color-option').first().addClass('active');
        this.initCardColorPickers();
    },
    
    initCardColorPickers: function() {
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
        
        const pastelColors = $('.pastel-colors');
        pastelColors.empty();
        const pastelPalette = [
            { bg: '#FFB6C1' },
            { bg: '#FFC0CB' },
            { bg: '#FFD1DC' },
            { bg: '#B0E0E6' },
            { bg: '#ADD8E6' },
            { bg: '#87CEFA' },
            { bg: '#98FB98' },
            { bg: '#90EE90' },
            { bg: '#FFFACD' },
            { bg: '#FFEFD5' },
            { bg: '#FFDAB9' },
            { bg: '#D8BFD8' },
            { bg: '#E6E6FA' },
            { bg: '#F0FFF0' },
            { bg: '#F5F5DC' }
        ];
        pastelPalette.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.bg};" data-custom-color="${color.bg}" data-color="custom"></div>`);
            pastelColors.append(colorOption);
        });
        
        const customColors = $('.custom-colors');
        customColors.empty();
        const customPalette = [
            { bg: '#D4A5A5' },
            { bg: '#392F5A' },
            { bg: '#31A2AC' },
            { bg: '#F0E100' },
            { bg: '#FF6B6B' },
            { bg: '#4ECDC4' },
            { bg: '#1A535C' },
            { bg: '#FFE66D' }
        ];
        customPalette.forEach(color => {
            const colorOption = $(`<div class="color-option" style="background-color: ${color.bg};" data-custom-color="${color.bg}" data-color="custom"></div>`);
            customColors.append(colorOption);
        });
        
        const customColorPicker = $('#customColorPicker');
        const customColorPreview = $('#customColorPreview');
        customColorPicker.on('input', function() {
            customColorPreview.css('backgroundColor', $(this).val());
        });
        customColorPreview.css('backgroundColor', customColorPicker.val());
    },
    
    renderFolderList: function() {
        const folderList = $('#folderList');
        folderList.empty();
        const folders = FolderDAO.getAll();
        folders.sort((a, b) => a.name.localeCompare(b.name));
        folders.forEach(folder => {
            const folderElement = $(`
                <div class="folder-item" data-id="${folder.id}">
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
            folderElement.on('click', function(e) {
                if (!$(e.target).closest('.folder-actions').length) {
                    const folderId = $(this).data('id');
                    Controllers.openFolder(folderId);
                    $('.folder-item').removeClass('active');
                    $(this).addClass('active');
                    $('.sidebar-item').removeClass('active');
                }
            });
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
        });
    },
    
    renderLatestActivitiesView: function() {
        $('#folder-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#latest-activities-view').removeClass('hidden');
        $('#pageTitle').text('Neueste Aktivitäten');
        $('.sidebar-item').removeClass('active');
        $('#menuLatestActivity').addClass('active');
        $('.folder-item').removeClass('active');
        const activityContainer = $('#activityContainer');
        activityContainer.empty();
        
        if (!AppData.studentMode) {
            const createCard = $(`
                <div class="create-padlet-card">
                    <div class="create-padlet-icon">
                        <i class="fas fa-plus-circle"></i>
                    </div>
                    <div class="create-padlet-text">Ein Padlet erstellen</div>
                </div>
            `);
            createCard.on('click', function() {
                Controllers.createBoard();
            });
            activityContainer.append(createCard);
        }
        
        const boards = BoardDAO.getAll();
        if (boards.length === 0) {
            if (AppData.studentMode) {
                activityContainer.append(`
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-clipboard"></i>
                        </div>
                        <div class="empty-state-text">Keine Padlets vorhanden</div>
                    </div>
                `);
            }
            return;
        }
        
        boards.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        boards.forEach(board => {
            const boardCard = this.createPadletCard(board);
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
        $('#createNewBtn').on('click', function() {
            Controllers.createBoard();
        });
    },
    
    renderMyPadcardsView: function() {
        $('#folder-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#latest-activities-view').removeClass('hidden');
        $('#pageTitle').text('Von mir erstellt');
        $('.sidebar-item').removeClass('active');
        $('#menuMyPadcards').addClass('active');
        $('.folder-item').removeClass('active');
        const activityContainer = $('#activityContainer');
        activityContainer.empty();
        
        if (!AppData.studentMode) {
            const createCard = $(`
                <div class="create-padlet-card">
                    <div class="create-padlet-icon">
                        <i class="fas fa-plus-circle"></i>
                    </div>
                    <div class="create-padlet-text">Ein Padlet erstellen</div>
                </div>
            `);
            createCard.on('click', function() {
                Controllers.createBoard();
            });
            activityContainer.append(createCard);
        }
        
        const boards = BoardDAO.getByFolderId(null);
        if (boards.length === 0) {
            if (AppData.studentMode) {
                activityContainer.append(`
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-clipboard"></i>
                        </div>
                        <div class="empty-state-text">Keine Padlets vorhanden</div>
                    </div>
                `);
            }
            return;
        }
        
        const sortOrder = $('.sort-option.active').data('sort') || 'name';
        this.sortBoards(boards, sortOrder);
        boards.forEach(board => {
            const boardCard = this.createPadletCard(board);
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
        $('#createNewBtn').on('click', function() {
            Controllers.createBoard();
        });
    },
    
    createPadletCard: function(board) {
        const card = $(`
            <div class="card" style="border-top-color: ${board.color};">
                <div class="card-content">
                    <div class="card-header">
                        <div class="card-title">${board.name}</div>
                        <div class="padlet-menu">
                            <i class="fas fa-ellipsis-v"></i>
                            <div class="padlet-menu-dropdown">
                                <div class="card-menu-item" data-action="edit">Bearbeiten</div>
                                <div class="card-menu-item" data-action="delete">Löschen</div>
                            </div>
                        </div>
                    </div>
                    <div class="card-text">Zuletzt aktualisiert: ${Utils.formatDate(board.updated)}</div>
                </div>
            </div>
        `);
        
        card.find('.padlet-menu').on('click', function(e) {
            e.stopPropagation();
            $(this).find('.padlet-menu-dropdown').toggleClass('show');
        });
        card.find('.padlet-menu-dropdown .card-menu-item').on('click', function(e) {
            e.stopPropagation();
            const action = $(this).data('action');
            if (action === 'edit') {
                Controllers.editBoard(board.id);
            } else if (action === 'delete') {
                Controllers.deleteBoard(board.id);
            }
        });
        return card;
    },
    
    sortBoards: function(boards, sortOrder) {
        if (sortOrder === 'name') {
            boards.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOrder === 'date') {
            boards.sort((a, b) => new Date(b.updated) - new Date(a.updated));
        }
    },
    
    updateFolderSelect: function() {
        const select = $('#boardFolderSelect');
        select.empty();
        select.append('<option value="">Kein Ordner</option>');
        const folders = FolderDAO.getAll();
        folders.forEach(folder => {
            select.append(`<option value="${folder.id}">${folder.name}</option>`);
        });
    },
    
    changeCardView: function(view) {
        // Logik zur Änderung der Kartenansicht (z. B. Grid oder Liste)
        AppData.currentBoard.view = view;
    },
    
    updateBoardLayout: function(columns) {
        // Logik zur Aktualisierung des Board-Layouts
        AppData.currentBoard.layout = columns;
    },
    
    updateFolderSelectCallback: function() {
        // Platzhalter für eventuelle Zusatzlogik
        this.updateFolderSelect();
    },
    
    renderFolderView: function(folderId) {
        $('#latest-activities-view').addClass('hidden');
        $('#board-view').addClass('hidden');
        $('#folder-view').removeClass('hidden');
        const folder = FolderDAO.getById(folderId);
        if (folder) {
            $('#pageTitle').text(folder.name);
        }
        // Weitere Logik zum Rendern des Ordnerinhalts
        AppData.view = 'folder';
        AppData.currentFolder = folder;
    },
    
    renderBoardView: function(boardId) {
        $('#latest-activities-view').addClass('hidden');
        $('#folder-view').addClass('hidden');
        $('#board-view').removeClass('hidden');
        const board = BoardDAO.getById(boardId);
        if (board) {
            $('#pageTitle').text(board.name);
            $('#boardTitle').text(board.name);
        }
        AppData.view = 'board';
        AppData.currentBoard = board;
    }
};
