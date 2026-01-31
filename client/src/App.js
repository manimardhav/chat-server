import { useEffect, useState, useRef } from "react";
import "./App.css";

// Assign colors to usernames
const colors = [
  "#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#9B59B6", "#1ABC9C", "#E67E22"
];

function getColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function App() {
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  const connect = () => {
    if (!name.trim()) return alert("Enter your name first");

    ws.current = new WebSocket("wss://db6715a19935c7.lhr.life");
    // Replace with your IP

    ws.current.onopen = () => {
      ws.current.send(name); // send username first
      setConnected(true);
    };

    ws.current.onmessage = (e) => {
      setMessages((prev) => [...prev, e.data]);
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    ws.current.send(input);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!connected) {
    return (
      <div className="login-container">
        <h1>Join the Chat</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="name-input"
        />
        <br />
        <button onClick={connect} className="connect-btn">
          Connect
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <h1>Mini Chat</h1>
      <div className="chat-box">
        {messages.map((msg, i) => {
          const isServer = msg.startsWith("SERVER:");
          const hasColon = msg.includes(":");
          const sender = hasColon ? msg.split(":")[0] : "";
          const isSelf = sender === name;
          return (
            <div
              key={i}
              className={`message ${isServer
                ? "server-msg"
                : isSelf
                  ? "message-self"
                  : "user-msg"
                }`}
              style={{
                color: !isServer && !isSelf && sender ? getColor(sender) : undefined,
              }}
            >
              {msg}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          className="message-input"
        />
        <button onClick={sendMessage} className="send-btn">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
