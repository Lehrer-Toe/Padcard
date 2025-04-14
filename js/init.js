/**
 * Initialisierungsscript für snapWall
 * 
 * Dieses Script wird vor allen anderen ausgeführt und stellt sicher,
 * dass alle erforderlichen Ressourcen vorhanden sind.
 */

// Prüfe, ob jQuery korrekt geladen wurde
function checkJQuery() {
    if (typeof jQuery === 'undefined') {
        console.error('jQuery ist nicht geladen. snapWall kann nicht initialisiert werden.');
        document.body.innerHTML = '<div style="text-align:center; margin-top:100px;">' +
            '<h1>Fehler beim Laden von snapWall</h1>' +
            '<p>Die erforderliche jQuery-Bibliothek konnte nicht geladen werden.</p>' +
            '<p>Bitte aktualisieren Sie die Seite oder kontaktieren Sie den Administrator.</p>' +
            '</div>';
        return false;
    }
    return true;
}

// Prüfe, ob jQuery UI korrekt geladen wurde
function checkJQueryUI() {
    if (typeof jQuery.ui === 'undefined') {
        console.error('jQuery UI ist nicht geladen. snapWall kann nicht vollständig initialisiert werden.');
        return false;
    }
    return true;
}

// Erstelle Favicon dynamisch, falls keines vorhanden ist
function createFavicon() {
    if (!document.querySelector('link[rel="icon"]')) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC1ElEQVRYR+2XT2sTQRiHn3d2N4ltbKEeRKSKCBVPngQP/gFPHhQEL4IXD6IgHgQRbx48+yH8BHryJIhYFRFEPIhYqRYrIq1NTNPd2ZF3ZbekaVKSNcSD7mV335n3N8+87zuzwn+e5HvfP3jGhYEE1tTt/G7tVvfTj6BVe9/tXL25I4L8D4EV4LrV12VdCIiZg0wEkMHJwQS2Bne7uSOLTDUeQ9rXPYMUwu2eDCKWJnf3AugLMLRFLr5eRlmfEIkQmIBdx0fZfihP2NJEGCyjNRgLGJsGozFGE6HZe/ooo9mhfHlzD4BPK+5xevEmqKfYhS7oPDicY+bYGFprjNGsVGOu3K1g/1miMxZiO9hTk1y6vbdNjR0BSj+8k+Wlhf4K2EYGHQrD5Qpvl224AjhFwkuXuDFTbA+DdQFePV44LC/f7bP6dsJNFTk7NcLhYg7HscqEOPxMxlQ+1Xi5+JXq+h6iEzMEly7z8FSRHfOA7QDlhdvYx9ZaFLAV+zlHdmxsLCAMQ7TWrc91q5Wvq6ydP4k1doADU2dYPlnYnoDaajg1cYjpvbUWQEEYWQAj9XLF5UZVYQVON8Xfmtf5shwyeWyc4/kaa7Vd4AW4mCWy+WAghcmxHGGUgGy9dZmUzopPrWEnxM/6rFYj3Hod13EJqt9wnQwnCxFflr4TLb1tFqOBObA9DHBiB9uuJ/uuSrXfkQSN3w0C18V1MwRxjK38wGrW83ErFT4++oCoFgidW7hXZgcXogLf/eB4tfoNrZoK+E1ACGKjaWo1lHcft1ImuP+YuOphtC90bk5fGgzAJqG2/v7pMGM5icdHm4XaUcr17QVBBSo+Yhw3dILP3oOFxGQGpBTDf+KdT1xzIxsrpcTbFKARWpnrQyP8e3cgd+BPCKSVcOj9wHYAA91MLhdYI9LZXzYUYL83ZLvP+y++ffr0u4/ePQAAAABJRU5ErkJggg==';
        document.head.appendChild(link);
    }
}

// Prüfe, ob das Logo vorhanden ist und erstelle einen Fallback
function checkLogo() {
    window.addEventListener('load', function() {
        const logo = document.querySelector('.logo');
        if (!logo.complete || logo.naturalWidth === 0) {
            logo.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgZmlsbD0iIzIxOTZGMyIgcng9IjEwIiByeT0iMTAiLz48dGV4dCB4PSI1MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlM8L3RleHQ+PC9zdmc+';
        }
    });
}

// Initialisierung ausführen
if (checkJQuery() && checkJQueryUI()) {
    createFavicon();
    checkLogo();
}
