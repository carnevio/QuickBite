document.addEventListener('DOMContentLoaded', () => {
    const favouriteList = document.getElementById('favourite-list');

    // Abrufen der Favoriten aus dem Local Storage
    const favourites = JSON.parse(localStorage.getItem('favourites')) || [];

    if (favourites.length > 0) {
        favourites.forEach(restaurant => {
            const div = document.createElement('div');
            div.className = 'restaurant';
            div.innerHTML = `
                <strong>${restaurant.name}</strong><br>
                Adresse: ${restaurant.address}<br>
                Bewertung: ${restaurant.rating || 'Keine Bewertung'}
            `;
            favouriteList.appendChild(div);
        });
    } else {
        favouriteList.innerHTML = '<p>Keine Favoriten gefunden.</p>';
    }
});