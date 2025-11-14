import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'server-page.html'));
})

export default app;
