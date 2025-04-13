/**
 * Hauptinitialisierung für snapWall
 */

// Anwendung initialisieren, wenn das Dokument bereit ist
$(document).ready(function() {
    console.log("snapWall wird initialisiert...");
    
    // Fallback für fehlendes Logo erstellen
    $('.logo').on('error', function() {
        this.onerror = null;
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzIxOTZGMyIgcng9IjEwIiByeT0iMTAiLz48dGV4dCB4PSI1MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlM8L3RleHQ+PC9zdmc+';
    });
    
    // Einfache Event-Handler für den "Snap erstellen"-Button
    $('.create-padlet-card, #createNewBtn').on('click', function() {
        alert("Diese Funktion wird in der vollständigen Implementierung verfügbar sein.");
    });
    
    // Event-Handler für Navigation
    $('#menuLatestActivity').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        $('#pageTitle').text('Neueste Aktivitäten');
    });
    
    $('#menuMySnaps').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        $('#pageTitle').text('Von mir erstellt');
    });
    
    $('#menuFavorites').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        $('#pageTitle').text('Favoriten');
    });
    
    // Toggle für Schülermodus
    $('#studentModeToggle').on('change', function() {
        const isChecked = $(this).prop('checked');
        console.log("Schülermodus: " + (isChecked ? "aktiviert" : "deaktiviert"));
    });
    
    console.log("snapWall wurde erfolgreich initialisiert!");
});