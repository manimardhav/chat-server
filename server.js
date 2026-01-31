// server.js
const WebSocket = require("ws");
const readline = require("readline");
const chalk = require("chalk").default; // Fixed import for Chalk v5+

const wss = new WebSocket.Server({ port: 8081 });
let clients = [];

console.log("WebSocket server running on ws://localhost:8081");

// Broadcast function to all clients
function broadcast(message, senderName) {
    const text = senderName ? `${senderName}: ${message}` : message;
    clients.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(text);
        }
    });
}

// Show connected clients
function listClients() {
    if (clients.length === 0) {
        console.log("No clients connected");
        return;
    }
    console.log(chalk.blue("Connected clients:"));
    clients.forEach((c, i) => {
        console.log(chalk.green(`${i + 1}. ${c.name}`));
    });
}

wss.on("connection", (ws) => {
    let userName = "Anonymous";

    // Add client
    const clientObj = { ws, name: userName };
    clients.push(clientObj);

    console.log(chalk.yellow("New client connected"));
    listClients();

    ws.on("message", (message) => {
        const msgString = message.toString();

        // First message is username
        if (!ws.userSet) {
            userName = msgString;
            ws.userSet = true;
            clientObj.name = userName;

            console.log(chalk.magenta(`Client set username: ${userName}`));
            broadcast(`${userName} joined the chat`);
            listClients();
        } else {
            console.log(chalk.cyan(`Received from ${userName}: ${msgString}`));
            broadcast(msgString, userName);
        }
    });

    ws.on("close", () => {
        clients = clients.filter(c => c.ws !== ws);
        broadcast(`${userName} left the chat`);
        console.log(chalk.red(`Client disconnected: ${userName}`));
        listClients();
    });
});

// Admin input from server terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("line", (input) => {
    broadcast(`SERVER: ${input}`);
});
