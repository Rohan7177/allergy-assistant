import '../styles/globals.css';
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom whenever messages or loading changes.
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentMessage = input;
    const userMessage = { role: "user", content: currentMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage }),
      });
      const data = await response.json();
      const assistantMessage = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-r from-green-200 to-blue-300 p-4">
      {/* Chat area: we add bottom margin (mb-20) so its content doesn't get hidden behind the fixed input */}
      <div className="flex-1 overflow-y-auto mb-20 p-4 bg-white rounded-lg shadow-md">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 ${msg.role === "user" ? "text-right" : "text-left"}`}
          >
            {msg.role === "assistant" ? (
              <div className="flex items-start">
                <img
                  src="img/cheficon.jpeg"
                  alt="Assistant Avatar"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div className="inline-block px-4 py-2 rounded-lg whitespace-pre-wrap bg-gray-200 text-gray-900">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="inline-block px-4 py-2 rounded-lg whitespace-pre-wrap bg-blue-500 text-white">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator in the chat area for the assistant's typing */}
        {loading && (
          <div className="p-2 my-2 text-left">
            <div className="flex items-center">
              <img
                src="img/cheficon.jpeg"
                alt="Assistant Avatar"
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="inline-block px-4 py-2 rounded-lg whitespace-pre-wrap bg-gray-200 text-gray-900">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span>Protecting you from allergens! ...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed input area: remains visible at the bottom of the viewport */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-green-200 to-blue-300">
        <div className="flex items-center bg-white rounded-lg shadow-md p-2">
          <input
            className="flex-1 p-2 border-none focus:outline-none"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about a dish..."
          />
          {loading ? (
            <div className="ml-2 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
