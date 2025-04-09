// index.js
const express = require('express');
const youtubedl = require('youtube-dl-exec');
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta para obtener información básica del video
app.get('/video/info', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                error: 'La URL del video es requerida'
            });
        }

        // Obtener información del video usando youtube-dl-exec
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ]
        }, {
            timeout: 30000 // 30 segundos de timeout
        });

        res.json({
            success: true,
            data: output
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Ruta para ejecutar comandos personalizados usando query parameters
app.get('/video/exec', async (req, res) => {
    try {
        const { url, flags } = req.query;

        if (!url) {
            return res.status(400).json({
                error: 'La URL del video es requerida'
            });
        }

        // Convertir flags de string JSON a objeto si se proporciona
        let parsedFlags = {};
        if (flags) {
            try {
                parsedFlags = JSON.parse(flags);
            } catch (e) {
                return res.status(400).json({
                    error: 'El parámetro flags debe ser un JSON válido'
                });
            }
        }

        const output = await youtubedl(url, {
            ...parsedFlags,
            dumpSingleJson: true
        }, {
            timeout: 30000
        });

        res.json({
            success: true,
            data: output
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});
