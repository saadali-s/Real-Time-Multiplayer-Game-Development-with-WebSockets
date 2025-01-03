const express = require("express");
const http = require("http");
const websocketServer = require("websocket").server;

const app = express();
const clients = {};
const games = {};

// Serve static files
app.use(express.static("public"));

app.listen(9091, () => console.log("HTTP server running on port 9091"));

const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("WebSocket server running on port 9090"));

const wsServer = new websocketServer({ httpServer });

wsServer.on("request", (request) => {
    const connection = request.accept(null, request.origin);
    const clientId = guid();
    clients[clientId] = { connection };

    connection.send(JSON.stringify({ method: "connect", clientId }));

    connection.on("message", (message) => {
        const result = JSON.parse(message.utf8Data);

        if (result.method === "create") {
            const gameId = guid();
            games[gameId] = { id: gameId, balls: 5 };

            connection.send(JSON.stringify({ method: "create", game: games[gameId] }));
        }
    });

    connection.on("close", () => delete clients[clientId]);
});

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function guid() {
    return `${S4()}${S4()}-${S4()}-4${S4().substr(0, 3)}-${S4()}-${S4()}${S4()}${S4()}`.toLowerCase();
}
