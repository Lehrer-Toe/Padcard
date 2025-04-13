/**
 * Main application initialization for Taskcard-Manager
 */

// Fehlerbehebung für Chrome-Nachrichten-Port-Fehler
(function suppressRuntimeErrors() {
    const originalConsoleError = console.error;
    console.error = function() {
        if (arguments[0] && 
            (String(arguments[0]).includes('message port closed') || 
             String(arguments[0]).includes('lastError'))) {
            return; // Unterdrücke diesen spezifischen Fehler
        }
        return originalConsoleError.apply(this, arguments);
    };
    
    // Füge globalen Fehler-Handler hinzu
    window.addEventListener('error', function(event) {
        if (event.error && event.error.message && 
            (event.error.message.includes('message port closed') || 
             event.error.message.includes('lastError'))) {
            event.preventDefault();
            return true;
        }
    });
    
    // Abfangen von unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && event.reason.message && 
            (event.reason.message.includes('message port closed') || 
             event.reason.message.includes('lastError'))) {
            event.preventDefault();
            return true;
        }
    });
})();

// Initialize application when document is ready
$(document).ready(function() {
    // Create placeholder.png if needed
    createPlaceholderImage();
    
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
            try {
                Controllers.createCard();
            } catch (err) {
                console.warn('Fehler beim Erstellen einer neuen Karte:', err);
            }
        }
        
        // CTRL+B to toggle student mode
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            try {
                $('#studentModeToggle').prop('checked', !$('#studentModeToggle').prop('checked')).trigger('change');
            } catch (err) {
                console.warn('Fehler beim Umschalten des Schülermodus:', err);
            }
        }
        
        // CTRL+F to focus search
        if (e.ctrlKey && e.key === 'f' && AppData.view === 'board') {
            e.preventDefault();
            try {
                $('#searchInput').focus();
            } catch (err) {
                console.warn('Fehler beim Fokussieren des Suchfelds:', err);
            }
        }
        
        // CTRL+S to share
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            try {
                Controllers.openShareModal();
            } catch (err) {
                console.warn('Fehler beim Öffnen des Teilen-Dialogs:', err);
            }
        }
        
        // CTRL+O to create new folder
        if (e.ctrlKey && e.key === 'o' && !AppData.studentMode) {
            e.preventDefault();
            try {
                Controllers.createFolder();
            } catch (err) {
                console.warn('Fehler beim Erstellen eines neuen Ordners:', err);
            }
        }
        
        // CTRL+P to create new board
        if (e.ctrlKey && e.key === 'p' && !AppData.studentMode) {
            e.preventDefault();
            try {
                Controllers.createBoard();
            } catch (err) {
                console.warn('Fehler beim Erstellen einer neuen Pinnwand:', err);
            }
        }
    });
    
    // Show welcome message for first-time users
    if (safeLocalStorage('get', 'taskcard-first-visit') !== 'false') {
        showWelcomeMessage();
        safeLocalStorage('set', 'taskcard-first-visit', 'false');
    }
});

/**
 * Robuste Implementierung für lokale Speicherung
 */
function safeLocalStorage(operation, key, value) {
    try {
        if (operation === 'get') {
            return localStorage.getItem(key);
        } else if (operation === 'set') {
            localStorage.setItem(key, value);
            return true;
        } else if (operation === 'remove') {
            localStorage.removeItem(key);
            return true;
        }
    } catch (e) {
        console.warn('LocalStorage Fehler:', e);
        return operation === 'get' ? null : false;
    }
}

/**
 * Create placeholder image for use within the application
 */
function createPlaceholderImage() {
    try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        
        // Get the 2D context
        const ctx = canvas.getContext('2d');
        
        // Fill background with light blue
        ctx.fillStyle = '#e3f2fd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a border
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
        
        // Add a placeholder icon
        ctx.fillStyle = '#2196F3';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Platzhalter', canvas.width / 2, canvas.height / 2 - 24);
        
        // Add smaller text
        ctx.font = '24px Arial';
        ctx.fillText('Kein Bild verfügbar', canvas.width / 2, canvas.height / 2 + 24);
        
        // Convert to base64 and save as a global variable or cache it
        try {
            // Try to store the placeholder image in localStorage for future use
            safeLocalStorage('set', 'placeholder-image', canvas.toDataURL('image/png'));
            
            // Create an image element with the placeholder and add it to the DOM
            const img = new Image();
            img.src = canvas.toDataURL('image/png');
            img.id = 'placeholder-img';
            img.style.display = 'none';
            document.body.appendChild(img);
        } catch (e) {
            console.warn('Error creating placeholder image:', e);
        }
    } catch (e) {
        console.warn('Canvas operation failed:', e);
    }
}

/**
 * Show welcome message for first-time users
 */
function showWelcomeMessage() {
    try {
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
                            <li>Ordner und Unterordner in beliebiger Hierarchie erstellen</li>
                            <li>Pinnwände erstellen, um deine Inhalte zu organisieren</li>
                            <li>Verschiedene Arten von Karten erstellen (Text, YouTube, Bilder, Links, LearningApps, Audio)</li>
                            <li>Vorschaubilder für Ordner, Pinnwände und Karten festlegen</li>
                            <li>Karten in verschiedenen Ansichten anzeigen (Raster, Frei positionierbar, Kategorien)</li>
                            <li>Inhalte im Schülermodus teilen</li>
                        </ul>
                        
                        <p>Hier sind einige Tipps, um schnell loszulegen:</p>
                        <ol style="margin-left: 20px; margin-bottom: 15px;">
                            <li>Erstelle einen Ordner und darin Unterordner, um deine Inhalte zu strukturieren</li>
                            <li>Erstelle eine Pinnwand und füge Karten hinzu</li>
                            <li>Nutze Vorschaubilder, um die Inhalte ansprechender zu gestalten</li>
                            <li>Wechsle zwischen verschiedenen Ansichten (Raster, Frei, Kategorien)</li>
                            <li>Aktiviere den Schülermodus, um zu sehen, wie deine Inhalte für Schüler aussehen</li>
                            <li>Teile deine Pinnwände mit dem Teilen-Button</li>
                        </ol>
                        
                        <p>Tastenkombinationen:</p>
                        <ul style="margin-left: 20px;">
                            <li><strong>STRG+O</strong>: Neuen Ordner erstellen</li>
                            <li><strong>STRG+P</strong>: Neue Pinnwand erstellen</li>
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
    } catch (error) {
        console.warn('Fehler beim Anzeigen der Willkommensnachricht:', error);
    }
}