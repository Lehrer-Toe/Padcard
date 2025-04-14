/**
 * Hauptinitialisierung für snapWall
 */

// Anwendung initialisieren, wenn das Dokument bereit ist
$(document).ready(function() {
    console.log("snapWall wird initialisiert...");
    
    // Daten aus localStorage laden oder Standarddaten initialisieren
    if (!StorageService.loadAppData()) {
        StorageService.initDefaultData();
    }
    
    // Fallback für fehlendes Logo erstellen
    $('.logo').on('error', function() {
        this.onerror = null;
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzIxOTZGMyIgcng9IjEwIiByeT0iMTAiLz48dGV4dCB4PSI1MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlM8L3RleHQ+PC9zdmc+';
    });
    
    // Views initialisieren
    Views.init();
    
    // Controller initialisieren
    Controllers.init();
    
    // Startansicht rendern
    Views.renderLatestActivitiesView();
    
    // URL-Parameter prüfen (für Freigabe-Links)
    Controllers.checkUrlParams();
    
    // Dropdown-Menüs einrichten
    $('.dropdown-toggle').on('click', function() {
        $(this).siblings('.dropdown-menu').toggleClass('show');
    });
    
    // Dropdown-Menüs schließen, wenn außerhalb geklickt wird
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dropdown').length) {
            $('.dropdown-menu').removeClass('show');
        }
    });
    
    // Event-Handler für Navigation
    $('#menuLatestActivity').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        Views.renderLatestActivitiesView();
    });
    
    $('#menuMySnaps').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        Views.renderMyPadcardsView();
    });
    
    $('#menuFavorites').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        $('#pageTitle').text('Favoriten');
    });
    
    $('#menuTrash').on('click', function() {
        $('.sidebar-item').removeClass('active');
        $(this).addClass('active');
        $('#pageTitle').text('Papierkorb');
    });
    
    // Toggle für Schülermodus
    $('#studentModeToggle').on('change', function() {
        Controllers.toggleStudentMode();
    });
    
    // "Snap erstellen"-Karten
    $('.create-padlet-card, #createNewBtn').on('click', function() {
        Controllers.createBoard();
    });
    
    console.log("snapWall wurde erfolgreich initialisiert!");
});