// Import the required modules
const http = require("http"); // Built-in module to create an HTTP server
const websocketServer = require("websocket").server; // External library to create a WebSocket server

// Create an HTTP server and listen on port 9090
const httpServer = http.createServer(); // HTTP server is required for WebSocket to run on top of it
httpServer.listen(9090, () => console.log("Listening on port 9090")); // Log when the server starts

// Object to keep track of connected clients
const clients = {};

// Create a WebSocket server linked to the HTTP server
const wsServer = new websocketServer({
    "httpServer": httpServer // Attach the WebSocket server to the HTTP server
});

// Handle incoming WebSocket connection requests
wsServer.on("request", (request) => {
    // Accept the connection and establish communication
    const connection = request.accept(null, request.origin); // Accepts the client's WebSocket connection

    // Event: When the connection opens
    connection.on("open", () => console.log("Connection opened!"));

    // Event: When the connection closes
    connection.on("close", () => console.log("Connection closed!"));

    // Event: When a message is received from the client
    connection.on("message", (message) => {
        const result = JSON.parse(message.utf8Data); // Parse the message as JSON
        console.log(result); // Log the parsed message
    });

    // Generate a unique client ID for the connection
    const clientId = guid(); // Create a new unique ID for the client

    // Store the client and its connection in the `clients` object
    clients[clientId] = {
        "connection": connection
    };

    // Send a "connect" message to the client with their unique ID
    const payload = {
        "method": "connect", // Indicates this is a connection response
        "clientId": clientId // The unique client ID
    };
    connection.send(JSON.stringify(payload)); // Send the payload as a JSON string to the client
});

// Helper function to generate small random hexadecimal strings
function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// Function to generate a globally unique identifier (GUID) for each client
const guid = () => (
    S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()
).toLowerCase();
