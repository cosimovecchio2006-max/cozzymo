const express = require('express');

// 2. Inizializza l'applicazione Express
const app = express(); 
const PORT = process.env.PORT || 3000;
const REDIRECT_URI = 'https://cozzymo.onrender.com/discord-callback';
 // Usa la porta di Render O la 3000 come fallback
// 1. Importa la libreria Express


// ...
// 3. Ora puoi chiamare app.listen()

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    // Aggiungi qui la riga per prevenire l'uscita anticipata se manca
    // process.stdin.resume(); 
});


const CLIENT_ID = '1433147626139947159'; // Il tuo ID applicazione
const CLIENT_SECRET = 'tlG-7uEpVPqgsQxjMTqkF4Z1QqDJeAbs'; // La tua chiave segreta
