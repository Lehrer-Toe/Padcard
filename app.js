/**
 * Haupt-Initialisierung der Anwendung für den Taskcard-Manager
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

// Dokument-Ready
$(function() {
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