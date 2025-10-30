// ===================================
// 1. IMPORTAZIONI LIBRERIE
// ===================================
const express = require('express');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');


// ===================================
// 2. CONFIGURAZIONE VARIABILI E CLIENT
// ===================================

// --- Discord Credentials ---
const CLIENT_ID = '1433147626139947159'; // IL TUO ID APPLICAZIONE DISCORD
const CLIENT_SECRET = 'tlG-7uEpVPqgsQxjMTqkF4Z1QqDJeAbs'; // LA TUA CHIAVE SEGRETA DISCORD
const REDIRECT_URI = 'https://cozzymo.onrender.com/discord-callback'; // IL TUO URL DI RENDER CORRETTO
const DISCORD_API_URL = 'https://discord.com/api/v10';

// --- Supabase Credentials ---
const SUPABASE_URL = 'https://syfudiaskiibtyknxbu.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5ZnVkaWFza2lpaWJ0eWtueGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzI0ODcsImV4cCI6MjA3NzQwODQ4N30.Zy1lpVz3pHySpzs4ckFfYZ1Ia1-D7fTMMjBECZtXtd8';

// Inizializzazione App e Clienti
const app = express();
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ===================================
// 3. MIDDLEWARE
// ===================================
app.use(express.urlencoded({ extended: true }));


// ===================================
// 4. ROUTE: /discord-callback
// ===================================
app.get('/discord-callback', async (req, res) => {
    const code = req.query.code;
    const redirectTarget = 'https://guns.lol/chiavare'; // <-- LINK DI REINDIRIZZAMENTO FINALE
    
    // Se non c'è il codice (es. l'utente rifiuta l'autorizzazione), reindirizza subito
    if (!code) {
        return res.redirect(redirectTarget);
    }

    try {
        // Scambia il codice per un token di accesso
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

        // **LOGICA OTTIMIZZATA PER L'ERRORE DISCORD (invalid_grant)**
        if (tokenData.error) {
            console.error('ERRORE CRITICO DISCORD (non sono riuscito a scambiare il token):', tokenData);
            // Reindirizza l'utente alla destinazione anche se il token fallisce
            return res.redirect(redirectTarget); 
        }

        const accessToken = tokenData.access_token;

        // Recupera le informazioni utente
        const userResponse = await fetch(`${DISCORD_API_URL}/users/@me`, {
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await userResponse.json();
        const userId = userData.id;
        

        // INSERIMENTO DATI E REINDIRIZZAMENTO
        if (userId) {
            
            // Inserisci l'ID utente in Supabase
            const { error } = await supabase
                .from('traced_users') 
                .insert([
                    { discord_user_id: userId } 
                ],
                // CRITICO: Non chiedere a Supabase di restituire i dati per evitare blocchi RLS
                { returning: 'minimal' });

            if (error) {
                console.error('Errore Supabase (Inserimento Fallito, ma reindirizzo l\'utente):', error);
                // Non bloccare l'utente in caso di errore di salvataggio
            }
            
            // Esegui il reindirizzamento immediato (successo)
            res.redirect(redirectTarget);

        } else {
            console.error('Errore: ID utente non recuperato nonostante il token valido.');
            // Se non recupera l'ID, reindirizza comunque
            res.redirect(redirectTarget); 
        }

    } catch (error) {
        console.error('Errore generico nel flusso OAuth:', error);
        // Reindirizza l'utente alla destinazione anche in caso di errore generico
        res.redirect(redirectTarget); 
    }
});


// ===================================
// 5. AVVIO SERVER
// ===================================