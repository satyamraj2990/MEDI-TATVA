import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertCircle, Pill, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

// Initialize Gemini AI - with safe fallback
let genAI: GoogleGenerativeAI | null = null;
try {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("🔑 AI Health Assistant - API Key present:", !!apiKey);
  console.log("🔑 API Key length:", apiKey?.length || 0);
  if (apiKey && apiKey.length > 20) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log("✅ Gemini AI initialized for Health Assistant");
  } else {
    console.error("❌ Invalid or missing API key");
  }
} catch (error) {
  console.error("❌ Gemini API initialization failed:", error);
}

// System prompt for MediTatva AI Health Assistant with Medicine Substitutes
const SYSTEM_PROMPT = `You are MediTatva — an advanced, multilingual AI Health Assistant that talks like a friendly digital doctor and pharmacist.

Your role:
- Understand ANY language the user types in (auto-detect it).
- Respond in the EXACT SAME LANGUAGE as the user's input.
- Help patients by analyzing how they describe their condition (free text, not predefined diseases).
- **PROVIDE MEDICINE SUBSTITUTES** when asked about any medicine.
- Give natural, accurate, and caring responses.

CRITICAL RULES:
1. START NATURALLY: Greet warmly and ask "How are you feeling today?" in the user's language.

2. DYNAMIC UNDERSTANDING: When user describes symptoms (like "I have stomach pain and nausea"), do this:
   - Understand and infer possible medical causes based on real symptom relationships
   - List 2-3 most likely conditions with brief explanation
   - Describe related symptoms and possible causes in plain language
   - Suggest ONLY over-the-counter medicines (safe and common) with clear dosage and frequency
   - **FOR EACH MEDICINE, PROVIDE 2-3 AFFORDABLE SUBSTITUTES** with same active ingredient
   - Suggest home remedies and lifestyle care tips
   - State when to see a doctor and what type (ENT, physician, dermatologist, etc.)

3. MEDICINE SUBSTITUTE FEATURE (MOST IMPORTANT):
   When user asks "substitute for [medicine]" or "alternative to [medicine]" or mentions any medicine name:
   
   Respond with this format:
   
   💊 **Original Medicine:**
   [Name] - [Generic composition]
   
   🔄 **Affordable Substitutes (Same Active Ingredient):**
   
   1. **[Brand Name 1]** 
      - Generic: [Active ingredient]
      - Price: ₹[X] (vs original ₹[Y] - [%] cheaper)
      - Manufacturer: [Company]
      - Availability: [Common/OTC/Prescription needed]
      
   2. **[Brand Name 2]**
      [Same format]
      
   3. **[Brand Name 3]**
      [Same format]
   
   ✅ **Key Points:**
   - All substitutes have the SAME active ingredient and effectiveness
   - Always consult your pharmacist before switching
   - Cheaper alternatives are equally effective
   
   ⚠️ **Prescription Status:** [Mention if prescription is required]

4. LANGUAGE HANDLING: 
   - Auto-detect the user's language (Hindi, English, Tamil, Bengali, Telugu, Kannada, Malayalam, Gujarati, Punjabi, etc.)
   - Respond ENTIRELY in that same language
   - If user types in Hindi, reply in Hindi. If English, reply in English.

5. FORMATTING FOR SYMPTOM QUERIES: Use this structure with emojis:

👋 **Greeting/Response**
[Warm, caring greeting or acknowledgment]

🩺 **Possible Conditions:**
[List 2-3 conditions based on symptoms with brief explanation]

🔍 **Common Symptoms & Causes:**
[List 3-4 related symptoms]

💊 **Suggested Medicines (with SUBSTITUTES):**
1. [Medicine Name] OR [Substitute 1] OR [Substitute 2] - [Dosage]
   *All contain [Active ingredient] - choose based on budget*
2. [Repeat for each recommendation]

🏡 **Home Remedies / Self-Care:**
[Natural remedies and care tips]

⚠️ **When to See a Doctor:**
[Clear guidance on when professional help is needed]

6. DISCLAIMERS: 
   - Never diagnose definitively—use "may be", "could indicate" language
   - Always mention "this is not a substitute for professional medical advice"
   - Encourage seeing a doctor for serious or persisting symptoms
   - For prescriptions medicines, mention "prescription required, consult doctor"

7. PERSONALITY:
   - Be warm, empathetic, and reassuring
   - Use simple, clear language (avoid complex medical jargon)
   - Show genuine care and understanding
   - Be helpful and practical

8. SAFETY FIRST:
   - Never suggest strong prescription medications
   - Always warn about side effects and drug interactions
   - Recommend doctor visits for emergencies (chest pain, severe bleeding, etc.)
   - Provide mental health crisis resources if needed

Remember: Your goal is to help users understand their health concerns, provide affordable medicine alternatives, and guide them to appropriate care—all in their native language.`;

export default function AIHealthAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "👋 Hello! I'm your MediTatva AI Health Assistant. I can help you with:\n\n💊 Medicine substitutes & alternatives\n🩺 Symptom analysis\n💰 Affordable healthcare advice\n🌐 Support in multiple languages\n\nHow are you feeling today? Or ask me about any medicine for affordable substitutes!",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Test API connection on mount
  useEffect(() => {
    console.log("🔍 AI Health Assistant Component Mounted");
    console.log("🔍 Environment check:");
    console.log("  - VITE_GEMINI_API_KEY present:", !!import.meta.env.VITE_GEMINI_API_KEY);
    console.log("  - VITE_GEMINI_API_KEY length:", import.meta.env.VITE_GEMINI_API_KEY?.length || 0);
    console.log("  - genAI object exists:", !!genAI);
    
    if (!genAI) {
      console.error("⚠️ WARNING: genAI is null. AI features will not work!");
      toast.error("AI not configured. Check API key in .env file.", { duration: 5000 });
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("🔄 Starting AI request...");
      console.log("genAI exists:", !!genAI);
      
      if (!genAI) {
        console.error("❌ genAI is null - API key not initialized");
        throw new Error("AI service not configured. Please check API key in .env file.");
      }

      console.log("✅ genAI initialized, creating model...");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      console.log("✅ Model created, starting chat...");
      
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT }],
          },
          {
            role: "model",
            parts: [{ text: "Understood. I'm ready to assist as MediTatva AI Health Assistant with medicine substitute recommendations in any language." }],
          },
        ],
      });

      console.log("✅ Chat session created, sending message:", input);
      const result = await chat.sendMessage(input);
      console.log("✅ Message sent, getting response...");
      
      const response = await result.response;
      const botResponse = response.text();
      console.log("✅ Response received, length:", botResponse.length);

      const botMessage: Message = {
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("❌ AI Health Assistant Error:", error);
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      
      let errorText = "⚠️ I'm having trouble connecting right now. ";
      
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("quota") || msg.includes("429")) {
          errorText = "⚠️ API quota exceeded. Please wait a moment and try again.";
        } else if (msg.includes("api") && msg.includes("key")) {
          errorText = "⚠️ API key configuration issue. Please contact support.";
        } else if (msg.includes("network") || msg.includes("fetch")) {
          errorText = "⚠️ Network connection issue. Please check your internet and try again.";
        } else {
          errorText += `Error: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        text: errorText,
        isBot: true,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get AI response. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    "💊 Substitute for Paracetamol",
    "🤒 I have fever and headache",
    "💰 Affordable alternatives for Crocin",
    "🩺 Stomach pain remedies",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-blue-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Health Assistant
                  </h1>
                  <p className="text-sm text-gray-500">Powered by Google Gemini AI</p>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Features */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Pill className="h-4 w-4" />
                Key Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">💊</span>
                  <span>Find affordable medicine substitutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">🩺</span>
                  <span>Get symptom analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">🌐</span>
                  <span>Multi-language support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">💰</span>
                  <span>Compare medicine prices</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">⚕️</span>
                  <span>Professional health guidance</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Important Note
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                This AI assistant provides general health information and medicine alternatives. 
                Always consult a healthcare professional for medical advice, diagnosis, or treatment.
              </p>
            </Card>

            {/* Suggested Questions */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Try asking:</h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question.replace(/💊|🤒|💰|🩺/g, '').trim())}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200 hover:border-blue-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-12rem)] flex flex-col shadow-lg">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                          message.isBot
                            ? "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-sm"
                            : "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md"
                        }`}
                      >
                        {message.isBot && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1 rounded-lg">
                              <Sparkles className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs font-medium text-blue-900">
                              MediTatva AI
                            </span>
                          </div>
                        )}
                        <div
                          className={`text-sm leading-relaxed whitespace-pre-wrap ${
                            message.isBot ? "text-gray-800" : "text-white"
                          }`}
                        >
                          {message.text}
                        </div>
                        <div
                          className={`text-xs mt-2 ${
                            message.isBot ? "text-gray-500" : "text-blue-100"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl px-5 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t p-4 bg-gray-50">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about medicines, symptoms, or alternatives..."
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  AI can make mistakes. Always verify medical information with healthcare professionals.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
