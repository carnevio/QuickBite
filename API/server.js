import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3000;

const apiKey = 'AIzaSyBUxmQoaWaQuXMoXx95qOy5cxFq-7UxPu0';

app.use(cors());
app.use(express.json());

// Endpoint zum Abrufen von Restaurants basierend auf einer Adresse
app.get('/api/restaurants', async (req, res) => {
    const address = req.query.address; // Adresse von der Anfrage erhalten

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status !== 'OK') {
            return res.status(400).json({ error: 'Ungültige Adresse oder Standort' });
        }

        const location = geocodeData.results[0].geometry.location;
        const radius = '1500'; // Radius in Metern

        // Nearby Search
        const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=restaurant&key=${apiKey}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.status !== 'OK') {
            return res.status(500).json({ error: 'Fehler beim Abrufen der Restaurants' });
        }

        res.json(data.results); // Gebe die Restaurants zurück
    } catch (error) {
        console.error('Fehler beim Abrufen der Restaurants:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
