"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import portrait from "@/assets/portrait.png";

// HTML sanitization function to prevent XSS
function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const userMessage = {
        id: Date.now(),
        text: inputValue,
        sender: "user",
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Call RAG API
      fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const aiMessage = {
              id: Date.now() + 1,
              text: data.message,
              sender: "ai",
            };
            setMessages((prev) => [...prev, aiMessage]);
          } else {
            throw new Error(data.error || "Failed to get response");
          }
        })
        .catch((error) => {
          console.error("Chat error:", error);
          const errorMessage = {
            id: Date.now() + 1,
            text: "Sorry, I'm having trouble responding right now. Please try again.",
            sender: "ai",
          };
          setMessages((prev) => [...prev, errorMessage]);
        })
        .finally(() => {
          setIsLoading(false);
        });

      setInputValue("");
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
  };

  const suggestedQuestions = [
    "Tell me about Marvin's background and experience",
    "What programming languages and technologies does Marvin know?",
    "What are Marvin's notable projects?",
    "How can I contact Marvin for opportunities?",
  ];

  // Display only the last 5 messages for better UX
  const displayedMessages = messages.slice(-5);

  return (
    <div className="h-full flex flex-col relative">
      {/* Chat History - Normal Scrolling */}
      <div
        className={`flex-1 px-4 md:px-8 lg:px-16 xl:px-32 pb-24 ${
          displayedMessages.length > 0 ? "overflow-y-auto" : "overflow-hidden"
        }`}
      >
        <div className="max-w-4xl mx-auto space-y-4 py-4">
          {displayedMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full px-4"
            >
              <div className="text-center mb-8">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-stone-600 to-stone-700 rounded-2xl flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-stone-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-stone-300 mb-2">
                  Start a conversation
                </h3>
                <p className="text-stone-500 text-lg mb-6">
                  Ask me anything to get started
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="w-full max-w-2xl">
                <p className="text-stone-400 text-sm mb-4 text-center">
                  Try asking:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="bg-stone-800/50 hover:bg-stone-700/70 border border-stone-600/50 hover:border-pink-500/60 text-stone-300 hover:text-white rounded-lg px-4 py-3 text-left text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(236,72,153,0.3),0_0_40px_rgba(34,211,238,0.2)] relative group before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-pink-500/5 before:via-cyan-400/5 before:to-pink-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
                    >
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 opacity-60"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {question}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {displayedMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl ${
                      message.sender === "user" ? "ml-12" : "mr-12"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.sender === "user" ? (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 text-white flex items-center justify-center text-xs font-semibold">
                          Y
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            src={portrait}
                            alt="Marv"
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="ml-2 text-stone-400 text-xs font-medium">
                        {message.sender === "user" ? "You" : "Marv"}
                      </span>
                    </div>
                    <div
                      className={`rounded-xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-pink-500 to-cyan-400 text-white shadow-lg shadow-pink-500/20"
                          : "bg-stone-800/80 text-stone-100 border border-stone-700/50 backdrop-blur-sm"
                      }`}
                    >
                      <div
                        className="text-base leading-relaxed prose prose-stone max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(message.text) }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  key="loading-indicator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-3xl mr-12">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden">
                        <Image
                          src={portrait}
                          alt="Marv"
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="ml-2 text-stone-400 text-xs font-medium">
                        Marv
                      </span>
                    </div>
                    <div className="bg-stone-800/80 text-stone-100 border border-stone-700/50 backdrop-blur-sm rounded-xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div key="messages-end" ref={messagesEndRef} />
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Gradient Mask to hide content beneath input */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10" />

      {/* Floating Input */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 lg:left-16 lg:right-16 xl:left-32 xl:right-32 z-20"
      >
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Message AI..."
                className="w-full bg-stone-800/90 backdrop-blur-xl text-stone-100 border border-stone-600/50 rounded-3xl px-6 py-4 pr-14 text-lg placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:bg-stone-800 shadow-2xl shadow-black/20 transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-pink-500 to-cyan-400 hover:from-pink-400 hover:to-cyan-300 disabled:bg-stone-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg disabled:shadow-none hover:shadow-[0_0_20px_rgba(236,72,153,0.5),0_0_40px_rgba(34,211,238,0.3)] hover:scale-110 group before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-pink-500/20 before:to-cyan-400/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
