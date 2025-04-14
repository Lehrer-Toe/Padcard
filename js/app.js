/**
 * Hauptinitialisierung für snapWall
 */

// Anwendung initialisieren, wenn das Dokument bereit ist
$(document).ready(function() {
    // Views initialisieren
    Views.init();
    
    // Controller initialisieren
    Controllers.init();
    
    // Daten aus localStorage laden oder Standarddaten erstellen
    if (!StorageService.loadAppData()) {
        StorageService.initDefaultData();
    }
    
    // URL-Parameter für Schülermodus, Board oder Ordner prüfen
    Controllers.checkUrlParams();
    
    // Initialer View rendern (Startseite standardmäßig)
    Views.renderLatestActivitiesView();
    
    // Versehentliche Navigation verhindern
    window.addEventListener('beforeunload', function(e) {
        // Bestätigung im Schülermodus überspringen
        if (AppData.studentMode) return;
        
        // Bestätigungsdialog nur anzeigen, wenn wir in einem Board und im Bearbeitungsmodus sind
        if (AppData.view === 'board' && !AppData.studentMode) {
            // Bestätigungsdialog anzeigen
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
    
    // Tastenkombinationen behandeln
    $(document).on('keydown', function(e) {
        // ESC zum Schließen von Modals
        if (e.key === 'Escape') {
            $('.modal-overlay').hide();
        }
        
        // Andere Tastenkombinationen nur verarbeiten, wenn nicht in input/textarea
        if ($(e.target).is('input, textarea, select')) return;
        
        // STRG+N zum Erstellen einer neuen Karte in Board-Ansicht
        if (e.ctrlKey && e.key === 'n' && AppData.view === 'board' && !AppData.studentMode) {
            e.preventDefault();
            Controllers.createCard();
        }
        
        // STRG+B zum Umschalten des Schülermodus
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            $('#studentModeToggle').prop('checked', !$('#studentModeToggle').prop('checked')).trigger('change');
        }
        
        // STRG+F zum Fokussieren der Suche
        if (e.ctrlKey && e.key === 'f' && AppData.view === 'board') {
            e.preventDefault();
            $('#searchInput').focus();
        }
        
        // STRG+S zum Teilen
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            Controllers.openShareModal();
        }
    });
    
    // Willkommensnachricht für Erstbenutzer anzeigen
    if (localStorage.getItem('snapwall-first-visit') !== 'false') {
        showWelcomeMessage();
        localStorage.setItem('snapwall-first-visit', 'false');
    }
});

/**
 * Willkommensnachricht für Erstbenutzer anzeigen
 */
function showWelcomeMessage() {
    // Willkommens-Modal erstellen
    const welcomeModal = $(`
        <div class="modal-overlay" id="welcomeModal" style="display: flex;">
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">Willkommen bei snapWall!</div>
                    <button class="modal-close" id="closeWelcomeModal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Herzlich willkommen bei snapWall! Mit dieser Anwendung kannst du:</p>
                    <ul style="margin-left: 20px; margin-bottom: 15px;">
                        <li>Ordner und Snaps erstellen, um deine Inhalte zu organisieren</li>
                        <li>Verschiedene Arten von Karten erstellen (Text, YouTube, Bilder, Links, LearningApps, Audio)</li>
                        <li>Karten in verschiedenen Ansichten anzeigen (Raster, Frei positionierbar, Kategorien)</li>
                        <li>Inhalte im Schülermodus teilen</li>
                    </ul>
                    
                    <p>Hier sind einige Tipps, um schnell loszulegen:</p>
                    <ol style="margin-left: 20px; margin-bottom: 15px;">
                        <li>Erstelle einen Ordner in der Seitenleiste, um deine Snaps zu gruppieren</li>
                        <li>Erstelle einen Snap und füge Karten hinzu</li>
                        <li>Wechsle zwischen verschiedenen Ansichten (Raster, Frei, Kategorien)</li>
                        <li>Aktiviere den Schülermodus, um zu sehen, wie deine Inhalte für Schüler aussehen</li>
                        <li>Teile deine Snaps mit dem Teilen-Button</li>
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
    
    // Zum Body hinzufügen
    $('body').append(welcomeModal);
    
    // Schließen-Button-Event
    $('#closeWelcomeModal, #startUsingAppBtn').on('click', function() {
        $('#welcomeModal').remove();
    });
}