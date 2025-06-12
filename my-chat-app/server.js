const http = require('http');
const fs = require('fs');
const path = require('path');

const messagesFilePath = path.join(__dirname, 'data', 'messages.json'); // Path to messages.json

// Function to read messages from file
function readMessages() {
    try {
        if (fs.existsSync(messagesFilePath)) {
            const data = fs.readFileSync(messagesFilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading messages.json:', e);
    }
    return []; // Return empty array if file doesn't exist or is invalid
}

// Function to write messages to file
function writeMessages(messages) {
    try {
        fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2), 'utf8');
    } catch (e) {
        console.error('Error writing messages.json:', e);
    }
}

const server = http.createServer((req, res) => {
    // Enable CORS for Vercel frontend
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS requests
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
                const message = parsedBody.message; // Expecting { message: "..." }

                if (message && typeof message === 'string' && message.trim() !== '') {
                    let messages = readMessages();
                    messages.push(message.trim()); // Add new message
                    writeMessages(messages); // Save all messages
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
        // Read and return all messages
        const messages = readMessages();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(messages)); // Return messages as JSON array
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
    console.log('Ensure port forwarding is set up for public access!');
});
