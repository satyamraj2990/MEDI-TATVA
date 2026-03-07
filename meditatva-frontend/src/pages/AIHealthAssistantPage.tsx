import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Pill, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIHealthAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI Health Assistant. I'm here to help you with:

• Understanding your symptoms
• Suggesting possible causes (educational only)
• Recommending which doctor specialist to consult
• Providing home-care tips and lifestyle advice
• Suggesting common OTC medicines for mild conditions
• Identifying when to seek immediate medical help

IMPORTANT: I am NOT a doctor and cannot diagnose or prescribe medicines. My advice is for educational purposes only.

How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI Health Assistant. Provide concise, helpful medical guidance.

GUIDELINES:
- Give educational health information only (not diagnosis)
- Suggest OTC medicines for mild conditions only
- Recommend doctor specialists when needed
- Identify emergency symptoms
- Keep responses focused and brief

RESPONSE FORMAT:
Use clear sections with headings:

**Opening:** Brief empathetic statement

**Possible Causes:**
• List 2-3 common causes

**What To Do:**
• 2-3 actionable steps
• Home remedies

**Medicines (OTC only):**
• Common medicines like Paracetamol, Cetirizine
• Mention "consult pharmacist"

**See A Doctor:**
• Which specialist (GP, Dermatologist, etc.)
• When to consult

**Disclaimer:** "This is educational only. Consult a healthcare provider for diagnosis/treatment."

IMPORTANT:
- Be concise but complete
- Use bullet points
- Highlight warnings
- India-focused medicines

User Question: ${input}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              topK: 20,
              topP: 0.9,
              maxOutputTokens: 1200,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 
        "I apologize, but I couldn't generate a response. Please try again.";

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ I encountered an error processing your request. Please check your internet connection and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };



  const quickActions = [
    { icon: Pill, text: 'Medicine alternatives', query: 'What are alternatives to Paracetamol for fever?' },
    { icon: AlertCircle, text: 'Symptom checker', query: 'I have a headache and fever. What should I do?' },
    { icon: Info, text: 'Doctor suggestion', query: 'I have persistent stomach pain. Which doctor should I consult?' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Health Assistant</h1>
                <p className="text-sm text-gray-500">Powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="space-y-6 pb-32">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white shadow-md border-2 border-gray-100'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="space-y-3">
                    {message.content.split('\n\n').map((section, idx) => {
                      const lines = section.split('\n');
                      const isHeading = lines[0]?.endsWith(':') || lines[0]?.match(/^\d+\./);
                      
                      return (
                        <div key={idx} className="space-y-2">
                          {lines.map((line, lineIdx) => {
                            // Heading detection
                            if (line.endsWith(':') && !line.includes('http')) {
                              return (
                                <h4 key={lineIdx} className="font-bold text-blue-900 text-base mt-3 mb-1 flex items-center gap-2">
                                  <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                                  {line}
                                </h4>
                              );
                            }
                            
                            // Bullet points
                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                              return (
                                <div key={lineIdx} className="flex items-start gap-3 pl-4 py-1">
                                  <span className="text-blue-500 text-lg mt-0.5">•</span>
                                  <span className="text-gray-700 flex-1">{line.replace(/^[•-]\s*/, '')}</span>
                                </div>
                              );
                            }
                            
                            // Numbered lists
                            if (line.match(/^\d+\./)) {
                              return (
                                <div key={lineIdx} className="flex items-start gap-3 pl-4 py-1">
                                  <span className="font-bold text-blue-600 min-w-[24px]">{line.match(/^\d+\./)?.[0]}</span>
                                  <span className="text-gray-700 flex-1">{line.replace(/^\d+\.\s*/, '')}</span>
                                </div>
                              );
                            }
                            
                            // Bold text detection
                            if (line.includes('**')) {
                              const parts = line.split('**');
                              return (
                                <p key={lineIdx} className="text-gray-800 leading-relaxed py-1">
                                  {parts.map((part, i) => 
                                    i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part
                                  )}
                                </p>
                              );
                            }
                            
                            // Disclaimer detection
                            if (line.toLowerCase().includes('disclaimer') || line.toLowerCase().includes('not a substitute')) {
                              return (
                                <div key={lineIdx} className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                                  <p className="text-amber-900 text-sm font-medium flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{line}</span>
                                  </p>
                                </div>
                              );
                            }
                            
                            // Warning/Emergency detection
                            if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('emergency') || line.toLowerCase().includes('immediate')) {
                              return (
                                <div key={lineIdx} className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                  <p className="text-red-900 font-medium flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
                                    <span>{line}</span>
                                  </p>
                                </div>
                              );
                            }
                            
                            // Doctor consultation highlight
                            if (line.toLowerCase().includes('consult') || line.toLowerCase().includes('doctor') || line.toLowerCase().includes('specialist')) {
                              return (
                                <div key={lineIdx} className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                                  <p className="text-green-900 font-medium flex items-start gap-2">
                                    <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
                                    <span>{line}</span>
                                  </p>
                                </div>
                              );
                            }
                            
                            // Medicine names (assume UPPERCASE or Title Case words are medicines)
                            if (line.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/)) {
                              return (
                                <p key={lineIdx} className="text-gray-800 leading-relaxed py-1 flex items-center gap-2">
                                  {line.includes('Paracetamol') || line.includes('Cetirizine') || line.includes('ORS') ? (
                                    <Pill className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                  ) : null}
                                  {line}
                                </p>
                              );
                            }
                            
                            // Regular paragraph
                            return line.trim() ? (
                              <p key={lineIdx} className="text-gray-800 leading-relaxed py-1">{line}</p>
                            ) : null;
                          })}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-white leading-relaxed">
                    {message.content}
                  </div>
                )}
                <div
                  className={`text-xs mt-3 pt-2 border-t ${
                    message.role === 'user' ? 'text-blue-100 border-blue-400' : 'text-gray-400 border-gray-200'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-700">You</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="bg-white shadow-sm border border-gray-200 rounded-2xl px-5 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4 text-center">Quick Actions:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(action.query)}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
                  >
                    <action.icon className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {action.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything about health, medicines, or symptoms..."
              className="flex-1 resize-none rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-0 focus:outline-none px-4 py-3 max-h-32 min-h-[48px] transition-colors bg-white"
              rows={1}
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
