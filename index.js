// Importa le librerie necessarie
const express = require('express');
const fetch = require('node-fetch'); // Usiamo node-fetch per le richieste HTTP

// 1. Inizializza l'applicazione Express (CRUCIALE)
const app = express();

// 2. Variabili di configurazione (Inserisci qui le tue chiavi e il tuo URL)
// NOTA BENE: Il REDIRECT_URI è stato corretto (un solo https://)
const CLIENT_ID = '1433147626139947159'; // Il tuo ID applicazione (esempio)
const CLIENT_SECRET = 'tlG-7uEpVPqgsQxjMTqkF4Z1QqDJeAbs'; // La tua chiave segreta (esempio)
const REDIRECT_URI = 'https://cozzymo.onrender.com/discord-callback'; // Il tuo URL di Render corretto

// URL per l'API di Discord
const DISCORD_API_URL = 'https://discord.com/api/v10';

// Middleware per gestire i dati formattati come URL-encoded
app.use(express.urlencoded({ extended: true }));


// 3. Endpoint per il Callback di Discord
app.get('/discord-callback', async (req, res) => {
    // 3a. Estrai il codice di autorizzazione dalla query string
    const code = req.query.code;

    // Se manca il codice, reindirizza o mostra un errore
    if (!code) {
        return res.status(400).send('Errore: Codice di autorizzazione non trovato.');
    }

    try {
        // 3b. Scambia il codice per un token di accesso
        const tokenResponse = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                scope: 'identify',
            }).toString(),
        });

        const tokenData = await tokenResponse.json();

        // Controlla eventuali errori nella risposta del token
        if (tokenData.error) {
            console.error('Errore Token:', tokenData);
            return res.status(500).send(`Errore nello scambio del token: ${tokenData.error_description || tokenData.error}`);
        }

        const accessToken = tokenData.access_token;

        // 3c. Usa il token per recuperare le informazioni utente
        const userResponse = await fetch(`${DISCORD_API_URL}/users/@me`, {
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();

        // 3d. Estrai l'ID utente (Il tuo obiettivo)
        const userId = userData.id;
        
        // 3e. Invia una risposta all'utente
        if (userId) {
            // Qui puoi implementare la logica per salvare l'ID.
            // Per ora, mostriamo solo il risultato finale all'utente.
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>ID Utente Tracciato</title>
                    <style>
                        body { background-color: #2c2f33; color: #ffffff; font-family: sans-serif; text-align: center; padding-top: 50px; }
                        .container { background-color: #36393f; padding: 20px; border-radius: 8px; max-width: 400px; margin: auto; }
                        h1 { color: #7289da; }
                        code { background-color: #202225; padding: 5px; border-radius: 4px; display: block; margin-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Accesso Autorizzato!</h1>
                        <p>Il tuo ID utente Discord è stato tracciato con successo.</p>
                        <p>ID Tracciato:</p>
                        <code>${userId}</code>
                        <p>Ora puoi chiudere questa finestra.</p>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.status(500).send('Errore: Impossibile recuperare l\'ID utente da Discord.');
        }

    } catch (error) {
        console.error('Errore generico nel flusso OAuth:', error);
        res.status(500).send(`Si è verificato un errore del server: ${error.message}`);
    }
});


// 4. Endpoint di base (opzionale, per testare se il server è vivo)
app.get('/', (req, res) => {
    res.send('Server Node.js per il Tracker Discord attivo!');
});


// 5. Avvio del Server (CRUCIALE per Render)
// Usa la porta fornita da Render (process.env.PORT) o la 3000 come fallback.
const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Applicazione avviata con successo!`);
});