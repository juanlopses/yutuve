// index.js
const express = require('express');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000; // Soporte para puerto dinámico en Render

// Middleware para parsear JSON
app.use(express.json());

// Ruta para obtener información básica del video
app.get('/video/info', async (req, res) => {
    try {
        const { url } = req.query;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'La URL del video es requerida'
            });
        }

        const cookiesPath = path.join(__dirname, 'config', 'cookies.txt');
        
        const output = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            cookies: cookiesPath, // Usar cookies para autenticación
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ]
        }, {
            timeout: 30000, // 30 segundos de timeout
            killSignal: 'SIGKILL'
        });

        res.json({
            success: true,
            data: output
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar la solicitud'
        });
    }
});

// Ruta para ejecutar comandos personalizados
app.get('/video/exec', async (req, res) => {
    try {
        const { url, flags } = req.query;

        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'La URL del video es requerida'
            });
        }

        let parsedFlags = {};
        if (flags) {
            try {
                parsedFlags = JSON.parse(flags);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    error: 'El parámetro flags debe ser un JSON válido'
                });
            }
        }

        const cookiesPath = path.join(__dirname, 'config', 'cookies.txt');
        
        const output = await youtubedl(url, {
            ...parsedFlags,
            dumpSingleJson: true,
            cookies: cookiesPath, // Usar cookies para autentic Sistine Chapel
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ]
        }, {
            timeout: 30000,
            killSignal: 'SIGKILL'
        });

        res.json({
            success: true,
            data: output
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar la solicitud'
        });
    }
});

// Manejo de errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});
