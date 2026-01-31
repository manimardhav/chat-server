const WebSocket = require("ws");
const net = require("net");

// WebSocket server for browser
const wss = new WebSocket.Server({ port: 8081 });

console.log("WebSocket TCP Bridge running at ws://localhost:8081");

wss.on("connection", (ws) => {
    console.log("Browser connected");

    // TCP client connects to Java ServerSocket
    const tcpClient = new net.Socket();

    tcpClient.connect(9090, "localhost", () => {
        console.log("Connected to Java TCP Server");
    });

    // Browser → Java TCP
    ws.on("message", (message) => {
        tcpClient.write(message.toString() + "\n");
    });

    // Java TCP → Browser
    tcpClient.on("data", (data) => {
        ws.send(data.toString());
    });

    // Browser closed
    ws.on("close", () => {
        console.log("Browser disconnected");
        tcpClient.end();
    });

    // TCP closed
    tcpClient.on("close", () => {
        console.log("TCP connection closed");
        ws.close();
    });

    // Error handling
    tcpClient.on("error", (err) => {
        console.error("TCP Error:", err.message);
        ws.close();
    });
});
