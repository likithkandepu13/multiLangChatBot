import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Supported languages
  const languages = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    zh: 'Chinese',
    hi: 'Hindi',
  };

  // Fetch messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages');
        setMessages(res.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    } else {
      alert('Speech recognition not supported in this browser. Please use Chrome.');
    }
  }, [language]);

  // Send message
  const handleSend = async (message = input) => {
    if (!message.trim()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/messages', {
        userMessage: message,
        language,
      });
      setMessages([...messages, res.data]);
      setInput('');
      // Speak bot response
      speak(res.data.botResponse, language);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Handle voice input
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current.lang = language;
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Speak text
  const speak = (text, lang) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <h1 className="text-2xl font-bold text-center p-4 bg-blue-500 text-white">
        Multilingual Chatbot
      </h1>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4">
            <div className="text-right">
              <span className="inline-block p-2 bg-blue-200 rounded-lg">
                You: {msg.userMessage}
              </span>
            </div>
            <div className="text-left">
              <span className="inline-block p-2 bg-green-200 rounded-lg">
                Bot: {msg.botResponse}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="p-2 border rounded mr-2"
        >
          {Object.entries(languages).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="p-2 border rounded w-1/2 mr-2"
          placeholder="Type or speak your message..."
        />
        <button
          onClick={() => handleSend()}
          className="p-2 bg-blue-500 text-white rounded mr-2"
        >
          Send
        </button>
        <button
          onClick={toggleListening}
          className={`p-2 rounded ${isListening ? 'bg-red-500' : 'bg-green-500'} text-white`}
        >
          {isListening ? 'Stop' : 'Speak'}
        </button>
      </div>
    </div>
  );
};

export default App;