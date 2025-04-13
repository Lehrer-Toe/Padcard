/**
 * Main application initialization for Taskcard-Manager
 */

// Initialize application when document is ready
$(document).ready(function() {
    // Initialize views
    Views.init();
    
    // Initialize controllers
    Controllers.init();
    
    // Load data from localStorage or create default data
    if (!StorageService.loadAppData()) {
        StorageService.initDefaultData();
    }
    
    // Check URL parameters for student mode, board or folder
    Controllers.checkUrlParams();
    
    // Render initial view (home by default)
    Views.renderHomeView();
    
    // Prevent accidental navigation away
    window.addEventListener('beforeunload', function(e) {
        // Skip confirmation in student mode
        if (AppData.studentMode) return;
        
        // Only show confirmation if we're in a board and editing
        if (AppData.view === 'board' && !AppData.studentMode) {
            // Show confirmation dialog
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
    
    // Handle keyboard shortcuts
    $(document).on('keydown', function(e) {
        // ESC to close modals
        if (e.key === 'Escape') {
            $('.modal-overlay').hide();
        }
        
        // Only process other shortcuts if not in input/textarea
        if ($(e.target).is('input, textarea, select')) return;
        
        // CTRL+N to create new card in board view
        if (e.ctrlKey && e.key === 'n' && AppData.view === 'board' && !AppData.studentMode) {
            e.preventDefault();
            Controllers.createCard();
        }
        
        // CTRL+B to toggle student mode
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            $('#studentModeToggle').prop('checked', !$('#studentModeToggle').prop('checked')).trigger('change');
        }
        
        // CTRL+F to focus search
        if (e.ctrlKey && e.key === 'f' && AppData.view === 'board') {
            e.preventDefault();
            $('#searchInput').focus();
        }
        
        // CTRL+S to share
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            Controllers.openShareModal();
        }
    });
    
    // Show welcome message for first-time users
    if (localStorage.getItem('taskcard-first-visit') !== 'false') {
        showWelcomeMessage();
        localStorage.setItem('taskcard-first-visit', 'false');
    }
});

/**
 * Show welcome message for first-time users
 */
function showWelcomeMessage() {
    // Create welcome modal
    const welcomeModal = $(`
        <div class="modal-overlay" id="welcomeModal" style="display: flex;">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">Willkommen beim Taskcard-Manager!</div>
                    <button class="modal-close" id="closeWelcomeModal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Herzlich willkommen beim neuen Taskcard-Manager! Mit dieser Anwendung kannst du:</p>
                    <ul style="margin-left: 20px; margin-bottom: 15px;">
                        <li>Ordner und Pinnwände erstellen, um deine Inhalte zu organisieren</li>
                        <li>Verschiedene Arten von Karten erstellen (Text, YouTube, Bilder, Links, LearningApps, Audio)</li>
                        <li>Karten in verschiedenen Ansichten anzeigen (Raster, Frei positionierbar, Kategorien)</li>
                        <li>Inhalte im Schülermodus teilen</li>
                    </ul>
                    
                    <p>Hier sind einige Tipps, um schnell loszulegen:</p>
                    <ol style="margin-left: 20px; margin-bottom: 15px;">
                        <li>Erstelle einen Ordner, um Pinnwände zu gruppieren</li>
                        <li>Erstelle eine Pinnwand und füge Karten hinzu</li>
                        <li>Wechsle zwischen verschiedenen Ansichten (Raster, Frei, Kategorien)</li>
                        <li>Aktiviere den Schülermodus, um zu sehen, wie deine Inhalte für Schüler aussehen</li>
                        <li>Teile deine Pinnwände mit dem Teilen-Button</li>
                    </ol>
                    
                    <p>Tastenkombinationen:</p>
                    <ul style="margin-left: 20px;">
                        <li><strong>STRG+N</strong>: Neue Karte erstellen</li>
                        <li><strong>STRG+B</strong>: Schülermodus umschalten</li>
                        <li><strong>STRG+F</strong>: Suche fokussieren</li>
                        <li><strong>STRG+S</strong>: Teilen-Dialog öffnen</li>
                        <li><strong>ESC</strong>: Dialog schließen</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="startUsingAppBtn">Los geht's!</button>
                </div>
            </div>
        </div>
    `);
    
    // Append to body
    $('body').append(welcomeModal);
    
    // Close button event
    $('#closeWelcomeModal, #startUsingAppBtn').on('click', function() {
        $('#welcomeModal').remove();
    });
}