import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

const corsOptions = {
    origin: 'https://041er-blj.ch', // Erlaubt Anfragen von allen Ursprüngen (für Entwicklungszwecke)
    methods: 'GET', // Erlaubt nur GET-Anfragen
    allowedHeaders: ['Content-Type'], // Erlaubte Header
};

app.use(cors(corsOptions));
app.use(express.json());

const apiKey = 'AIzaSyBUxmQoaWaQuXMoXx95qOy5cxFq-7UxPu0';

// Endpoint zum Abrufen von Restaurants basierend auf einer Adresse
app.get('/api/restaurants', async (req, res) => {
    const address = req.query.address;

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status !== 'OK') {
            return res.status(400).json({ error: 'Ungültige Adresse oder Standort' });
        }

        const location = geocodeData.results[0].geometry.location;
        const radius = '1500'; // 1,5 km Radius

        const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=restaurant&key=${apiKey}`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status !== 'OK') {
            return res.status(500).json({ error: 'Fehler beim Abrufen der Restaurants' });
        }

        const restaurantsWithDetails = await Promise.all(
            data.results.map(async (restaurant) => {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.place_id}&fields=name,rating,formatted_address,website&key=${apiKey}`;
                const detailsResponse = await fetch(detailsUrl);
                const detailsData = await detailsResponse.json();

                if (detailsData.status === 'OK') {
                    return {
                        name: detailsData.result.name,
                        address: detailsData.result.formatted_address,
                        rating: detailsData.result.rating || 'Keine Bewertung verfügbar',
                        website: detailsData.result.website || 'Keine Webseite verfügbar',
                    };
                }
                return null;
            })
        );

        const filteredRestaurants = restaurantsWithDetails.filter(Boolean);
        res.json(filteredRestaurants);
    } catch (error) {
        console.error('Fehler beim Abrufen der Restaurants:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
