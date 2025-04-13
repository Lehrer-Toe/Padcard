/**
 * Haupt-Initialisierung der Anwendung für den Taskcard-Manager
 */

// Fehlerbehebung für Chrome-Nachrichten-Port-Fehler
/**
 * Main application initialization for Taskcard-Manager
 */

// Fehlerbehebung für Chrome-Nachrichten-Port-Fehler
(function suppressRuntimeErrors() {
    const originalConsoleError = console.error;
    console.error = function() {
        if (arguments[0]) {
            const errorStr = String(arguments[0]);
            if (errorStr.includes('message port closed') || 
                errorStr.includes('port closed') ||
                errorStr.includes('lastError') || 
                errorStr.includes('runtime.lastError')) {
                return; // Unterdrücke diesen spezifischen Fehler
            }
        }
        return originalConsoleError.apply(this, arguments);
    };
    
    // Füge globalen Fehler-Handler hinzu
    window.addEventListener('error', function(event) {
        if (event.error && event.error.message) {
            const errorMessage = event.error.message;
            if (errorMessage.includes('message port closed') || 
                errorMessage.includes('port closed') ||
                errorMessage.includes('lastError') || 
                errorMessage.includes('runtime.lastError')) {
                event.preventDefault();
                return true;
            }
        }
    }, true);
    
    // Abfangen von unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && event.reason.message) {
            const reasonMessage = event.reason.message;
            if (reasonMessage.includes('message port closed') || 
                reasonMessage.includes('port closed') ||
                reasonMessage.includes('lastError') || 
                reasonMessage.includes('runtime.lastError')) {
                event.preventDefault();
                return true;
            }
        }
    }, true);
})();

// Initialize application when document is ready
$(document).ready(function() {
    // Rest of the code remains unchanged
    // ...
    const originalConsoleError = console.error;
    console.error = function() {
        if (
            arguments[0] &&
            (String(arguments[0]).includes('message port closed') ||
             String(arguments[0]).includes('lastError'))
        ) {
            return; // Unterdrückt diesen spezifischen Fehler
        }
        return originalConsoleError.apply(this, arguments);
    };

    // Globalen Fehler-Handler hinzufügen
    window.addEventListener('error', function(event) {
        if (
            event.error &&
            event.error.message &&
            (event.error.message.includes('message port closed') ||
             event.error.message.includes('lastError'))
        ) {
            event.preventDefault();
            return true;
        }
    });

    // Unbehandelte Promise-Rejections abfangen
    window.addEventListener('unhandledrejection', function(event) {
        if (
            event.reason &&
            event.reason.message &&
            (event.reason.message.includes('message port closed') ||
             event.reason.message.includes('lastError'))
        ) {
            event.preventDefault();
            return true;
        }
    });
})();

// Dokument-Ready
$(document).ready(function() {
    // Placeholder-Bild erzeugen
    createPlaceholderImage();

    // Views initialisieren
    Views.init();

    // Controller initialisieren
    Controllers.init();

    // Daten laden oder Default anlegen
    if (!StorageService.loadAppData()) {
        StorageService.initDefaultData();
    }

    // URL-Parameter prüfen (z.B. für Direktlink auf Board oder Folder)
    Controllers.checkUrlParams();

    // Standard-Ansicht (Home) rendern
    Views.renderHomeView();

    // Vor versehentlichem Verlassen warnen (außer im Schülermodus)
    window.addEventListener('beforeunload', function(e) {
        if (AppData.studentMode) return;

        if (AppData.view === 'board' && !AppData.studentMode) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });

    // Tastenkürzel
    $(document).on('keydown', function(e) {
        // ESC: Modals schließen
        if (e.key === 'Escape') {
            $('.modal-overlay').hide();
        }

        // Andere Shortcuts nur ausführen, wenn kein Input/Textbereich fokussiert ist
        if ($(e.target).is('input, textarea, select')) return;

        // STRG+N: Neue Karte in Board-Ansicht
        if (e.ctrlKey && e.key === 'n' && AppData.view === 'board' && !AppData.studentMode) {
            e.preventDefault();
            try {
                Controllers.createCard();
            } catch (err) {
                console.warn('Fehler beim Erstellen einer neuen Karte:', err);
            }
        }

        // STRG+B: Schülermodus umschalten
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            try {
                $('#studentModeToggle').prop('checked', !$('#studentModeToggle').prop('checked')).trigger('change');
            } catch (err) {
                console.warn('Fehler beim Umschalten des Schülermodus:', err);
            }
        }

        // STRG+F: Suche fokussieren
        if (e.ctrlKey && e.key === 'f' && AppData.view === 'board') {
            e.preventDefault();
            try {
                $('#searchInput').focus();
            } catch (err) {
                console.warn('Fehler beim Fokussieren des Suchfelds:', err);
            }
        }

        // STRG+S: Teilen-Dialog
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            try {
                Controllers.openShareModal();
            } catch (err) {
                console.warn('Fehler beim Öffnen des Teilen-Dialogs:', err);
            }
        }

        // STRG+O: Neuen Ordner
        if (e.ctrlKey && e.key === 'o' && !AppData.studentMode) {
            e.preventDefault();
            try {
                Controllers.createFolder();
            } catch (err) {
                console.warn('Fehler beim Erstellen eines neuen Ordners:', err);
            }
        }

        // STRG+P: Neue Pinnwand
        if (e.ctrlKey && e.key === 'p' && !AppData.studentMode) {
            e.preventDefault();
            try {
                Controllers.createBoard();
            } catch (err) {
                console.warn('Fehler beim Erstellen einer neuen Pinnwand:', err);
            }
        }
    });

    // Willkommensnachricht beim ersten Besuch
    if (safeLocalStorage('get', 'taskcard-first-visit') !== 'false') {
        showWelcomeMessage();
        safeLocalStorage('set', 'taskcard-first-visit', 'false');
    }
});

/**
 * Robuste Lokalspeicherung
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
 * Platzhalter-Bild erzeugen
 */
function createPlaceholderImage() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#e3f2fd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

        ctx.fillStyle = '#2196F3';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Platzhalter', canvas.width / 2, canvas.height / 2 - 24);

        ctx.font = '24px Arial';
        ctx.fillText('Kein Bild verfügbar', canvas.width / 2, canvas.height / 2 + 24);

        try {
            safeLocalStorage('set', 'placeholder-image', canvas.toDataURL('image/png'));

            const img = new Image();
            img.src = canvas.toDataURL('image/png');
            img.id = 'placeholder-img';
            img.style.display = 'none';
            document.body.appendChild(img);
        } catch (e) {
            console.warn('Fehler beim Erstellen des Platzhalterbilds:', e);
        }
    } catch (e) {
        console.warn('Canvas-Operation fehlgeschlagen:', e);
    }
}

/**
 * Willkommensnachricht
 */
function showWelcomeMessage() {
    try {
        const welcomeModal = $(`
            <div class="modal-overlay" id="welcomeModal" style="display: flex;">
                <div class="modal">
                    <div class="modal-header">
                        <div class="modal-title">Willkommen!</div>
                        <button class="modal-close" id="closeWelcomeModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>
                            Willkommen im Taskcard-Manager! Hier kann man Pinnwände anlegen,
                            Karten erstellen und alles verwalten, was für den Unterricht oder
                            Projekte benötigt wird.
                        </p>
                        <p>Viel Spaß bei der Nutzung!</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="startUsingBtn">Los geht's!</button>
                    </div>
                </div>
            </div>
        `);

        $('body').append(welcomeModal);

        $('#closeWelcomeModal, #startUsingBtn').on('click', function() {
            $('#welcomeModal').remove();
        });
    } catch (e) {
        console.warn('Fehler beim Anzeigen der Willkommensnachricht:', e);
    }
}
