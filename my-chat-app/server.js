const http = require('http');
const fs = require('fs');
const path = require('path');

const messagesFilePath = path.join(__dirname, 'data', 'messages.json');

function readMessages() {
    try {
        if (fs.existsSync(messagesFilePath)) {
            const data = fs.readFileSync(messagesFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading messages.json:', e);
    }
    return [];
}

function writeMessages(messages) {
    try {
        fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
    } catch (e) {
        console.error('Error writing messages.json:', e);
    }
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                const parsedBody = JSON.parse(body);
                const message = parsedBody.message;

                if (message && typeof message === 'string' && message.trim() !== '') {
                    let messages = readMessages();
                    messages.push(message.trim());
                    writeMessages(messages);
                    console.log('Received and saved:', message);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'Message received and saved.' }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid message format.' }));
                }
            } catch (e) {
                console.error('Error parsing POST body:', e);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON or message format.' }));
            }
        });
    } else if (req.method === 'GET') {
        const messages = readMessages();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(messages));
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
    console.log('Ensure port forwarding is set up for public access!');
});