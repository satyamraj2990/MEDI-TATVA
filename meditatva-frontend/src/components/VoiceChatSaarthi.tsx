import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "sonner";

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let apiKeyStatus = { present: false, error: "" };

try {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("🔑 Checking Gemini API key...");
  console.log("🔑 API Key present:", !!apiKey);
  console.log("🔑 API Key length:", apiKey?.length || 0);
  
  if (!apiKey) {
    apiKeyStatus.error = "API key not found in environment variables";
    console.error("❌ VITE_GEMINI_API_KEY not found in .env file");
    console.error("📝 To fix: Create .env file with: VITE_GEMINI_API_KEY=your_api_key");
  } else if (apiKey === "your_gemini_api_key_here" || apiKey === "your_api_key_here") {
    apiKeyStatus.error = "API key not configured (using placeholder)";
    console.error("❌ VITE_GEMINI_API_KEY is still using placeholder value");
    console.error("📝 To fix: Replace with actual API key from https://makersuite.google.com/app/apikey");
  } else {
    genAI = new GoogleGenerativeAI(apiKey);
    apiKeyStatus.present = true;
    console.log("✅ Gemini AI initialized successfully");
    console.log("✅ Using API key:", apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 4));
  }
} catch (error) {
  apiKeyStatus.error = error instanceof Error ? error.message : "Unknown error";
  console.error("❌ Gemini API initialization error:", error);
}

// AI Saarthi Voice System Prompt - Medical Guidance
const VOICE_SAARTHI_PROMPT = `You are AI Saarthi, a caring medical wellness assistant for MediTatva healthcare platform.

IMPORTANT: You MUST respond to EVERY medical query with helpful advice.

Your role:
- Answer ALL health-related questions
- Provide practical medical guidance for common symptoms
- Suggest appropriate medicines with dosages
- Give home remedies and precautions
- Be empathetic, calm, and supportive

Response rules:
1. ALWAYS respond in the SAME language as the user (Hindi or English)
2. For ANY health symptom or medical question:
   - First acknowledge with empathy ("I understand", "मैं समझता हूं")
   - Suggest 2-3 suitable OTC medicines with proper dosage
   - Provide 2-3 home remedies or lifestyle tips
   - Mention when to consult a doctor
3. Keep responses conversational and natural (4-7 sentences)
4. NO bullet points - speak naturally
5. Include medicine alternatives when possible

Example responses:

For "मुझे सिरदर्द है":
"मुझे सुनकर दुख हुआ। सिरदर्द के लिए आप Combiflam या Saridon ले सकते हैं। एक गोली लें और 6 घंटे बाद दोबारा ले सकते हैं। पानी खूब पिएं, आराम करें और माथे पर ठंडा पानी लगाएं। अगर दर्द बढ़े या 2 दिन से ज्यादा रहे तो डॉक्टर को दिखाएं।"

For "I have cold and cough":
"I'm sorry to hear that. For cold and cough, you can take Cheston Cold or Benadryl syrup twice daily. Steam inhalation helps a lot, and drink warm water with honey and ginger. Take rest and avoid cold food. If symptoms persist beyond 5 days or you get high fever, please see a doctor."

For "बुखार है 101 degree":
"101 बुखार है तो चिंता न करें। Dolo 650 या Crocin 500 लें, हर 6 घंटे में। ठंडे पानी की पट्टी माथे पर रखें। खूब पानी और नींबू पानी पिएं। हल्का खाना खाएं। अगर बुखार 102 से ज्यादा हो या 3 दिन में ठीक न हो तो डॉक्टर से मिलें।"

NEVER say "I cannot help" or refuse to answer medical questions. ALWAYS provide helpful guidance.`;

type VoiceState = "idle" | "listening" | "speaking" | "processing";

interface VoiceChatSaarthiProps {
  onClose: () => void;
}

export const VoiceChatSaarthi = ({ onClose }: VoiceChatSaarthiProps) => {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [lastResponse, setLastResponse] = useState<string>("");
  const [chatSession, setChatSession] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("hi-IN");
  const [isCallActive, setIsCallActive] = useState(false); // Track call state

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceStateRef = useRef<VoiceState>("idle"); // Track state in ref for callbacks

  // Check browser support
  useEffect(() => {
    const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    
    if (!hasWebSpeech || !hasSynthesis) {
      setIsSupported(false);
      toast.error("Your browser doesn't support voice chat. Please use Chrome or Edge.");
    }
  }, []);

  // Initialize AI chat session
  useEffect(() => {
    initializeChatSession();
  }, []);

  const initializeChatSession = async () => {
    try {
      if (!genAI) {
        console.error("❌ Gemini AI not initialized - API key issue:", apiKeyStatus.error);
        
        const errorMsg = currentLanguage === "hi-IN" 
          ? "AI सेवा कॉन्फ़िगर नहीं है। कृपया सपोर्ट टीम से संपर्क करें।"
          : "AI service is not configured. Please contact support team.";
        
        const detailedError = apiKeyStatus.error.includes("not found")
          ? "Missing API Key: Create a .env file in meditatva-frontend/ with VITE_GEMINI_API_KEY=your_key"
          : apiKeyStatus.error.includes("placeholder")
          ? "Invalid API Key: Get a real API key from https://makersuite.google.com/app/apikey"
          : apiKeyStatus.error;
        
        toast.error(detailedError, { duration: 8000 });
        setLastResponse(errorMsg);
        await speakText(errorMsg);
        setIsCallActive(false);
        return;
      }

      console.log("🔧 Initializing AI chat session for voice...");
      
      // Initialize model with gemini-2.5-flash (has available quota)
      // Note: gemini-1.5-flash and gemini-2.0-flash may have quota issues
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
      });

      const chat = model.startChat({
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
        history: [
          {
            role: "user",
            parts: [{ text: VOICE_SAARTHI_PROMPT }],
          },
          {
            role: "model",
            parts: [{ text: "नमस्ते। मैं सार्थी हूं। आज आप कैसा महसूस कर रहे हैं?" }],
          },
        ],
      });

      setChatSession(chat);
      console.log("✅ Chat session initialized successfully");
      console.log("✅ AI Saarthi is ready to answer medical queries");

      // Start call automatically with greeting
      setIsCallActive(true);
      const greeting = "नमस्ते। मैं सार्थी हूं। आज आप कैसा महसूस कर रहे हैं?";
      setLastResponse(greeting);
      await speakText(greeting);
        
    } catch (error: any) {
      console.error("❌ Error initializing chat:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      
      const errorMsg = currentLanguage === "hi-IN"
        ? "कॉल शुरू करने में विफल। कृपया पुनः प्रयास करें।"
        : "Failed to start call. Please try again.";
      
      toast.error("Unable to initialize: " + (error instanceof Error ? error.message : 'Unknown error'));
      setLastResponse(errorMsg);
      await speakText(errorMsg);
      setIsCallActive(false);
    }
  };

  // Initialize speech recognition
  const initRecognition = () => {
    if (recognitionRef.current) {
      console.log("🛑 Stopping existing recognition");
      recognitionRef.current.stop();
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false; // Stop after one utterance
    recognition.interimResults = false;
    recognition.lang = currentLanguage;

    recognition.onstart = () => {
      console.log("🎙️ STATE: Listening started");
      setVoiceState("listening");
      voiceStateRef.current = "listening";
    };

    recognition.onresult = async (event: any) => {
      const spokenText = event.results[0][0].transcript;
      console.log("📝 USER SPOKE:", spokenText);
      
      // CRITICAL: Stop recognition immediately
      recognition.stop();
      
      setTranscript(spokenText);
      setVoiceState("processing");
      voiceStateRef.current = "processing";
      console.log("⚙️ STATE: Processing");

      // Get AI response
      await getAIResponse(spokenText);
    };

    recognition.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error);
      
      if (event.error === "no-speech") {
        toast.info("I didn't hear anything. Listening again...");
        // Auto-restart if call is active
        if (isCallActive && voiceStateRef.current !== "speaking") {
          setTimeout(() => startListening(), 1000);
        } else {
          setVoiceState("idle");
          voiceStateRef.current = "idle";
        }
      } else if (event.error === "not-allowed") {
        toast.error("Microphone permission denied. Please enable it.");
        setVoiceState("idle");
        voiceStateRef.current = "idle";
        setIsCallActive(false);
      } else {
        toast.error("Voice error. Restarting...");
        if (isCallActive) {
          setTimeout(() => startListening(), 1000);
        } else {
          setVoiceState("idle");
          voiceStateRef.current = "idle";
        }
      }
    };

    recognition.onend = () => {
      console.log("🎙️ Recognition ended. Current state:", voiceStateRef.current);
      
      // Only auto-restart if we're still idle and call is active
      if (voiceStateRef.current === "idle" && isCallActive) {
        console.log("🔄 Auto-restarting listening");
        setTimeout(() => startListening(), 500);
      }
    };

    recognitionRef.current = recognition;
  };

  // Start listening
  const startListening = () => {
    if (!isSupported) {
      toast.error("Voice chat is not supported in your browser");
      return;
    }

    // CRITICAL: Don't listen while speaking
    if (voiceStateRef.current === "speaking") {
      console.log("⚠️ Cannot listen while speaking");
      return;
    }

    // Cancel any ongoing speech before listening
    if (window.speechSynthesis.speaking) {
      console.log("🛑 Canceling ongoing speech");
      window.speechSynthesis.cancel();
    }

    console.log("▶️ Starting listening...");
    initRecognition();
    try {
      recognitionRef.current?.start();
    } catch (error) {
      console.error("❌ Failed to start recognition:", error);
      // If already started, ignore
    }
  };

  // Stop listening
  const stopListening = () => {
    console.log("⏹️ Stopping listening");
    recognitionRef.current?.stop();
    setVoiceState("idle");
    voiceStateRef.current = "idle";
  };

  // Get AI response with robust error handling
  const getAIResponse = async (userMessage: string) => {
    try {
      console.log("📤 SENDING TO AI:", userMessage);
      
      // Check if chat session exists
      if (!chatSession) {
        console.error("❌ Chat session not initialized");
        throw new Error("Chat session not initialized");
      }

      // Add language context to help AI respond appropriately  
      const messageWithContext = currentLanguage === "hi-IN" && !userMessage.match(/[a-zA-Z]/) 
        ? `${userMessage} (कृपया हिंदी में जवाब दें)`
        : `${userMessage} (please respond in English)`;

      console.log("📤 Sending with context:", messageWithContext);

      // Send message with timeout and better error handling
      let result: any;
      try {
        console.log("📡 Attempting to send message to Gemini API...");
        console.log("📡 Chat session exists:", !!chatSession);
        console.log("📡 Message to send:", messageWithContext.substring(0, 50) + "...");
        
        result = await Promise.race([
          chatSession.sendMessage(messageWithContext),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI response timeout after 15s")), 15000)
          )
        ]);
        
        console.log("✅ Message sent successfully, received result");
      } catch (sendError: any) {
        console.error("❌ Error sending message to Gemini:", sendError);
        console.error("❌ Error name:", sendError?.name);
        console.error("❌ Error message:", sendError?.message);
        console.error("❌ Error stack:", sendError?.stack);
        console.error("❌ Full error object:", JSON.stringify(sendError, Object.getOwnPropertyNames(sendError)));
        
        // Check for network errors
        if (sendError.message?.includes("fetch") || 
            sendError.message?.includes("network") ||
            sendError.message?.includes("Failed to fetch") ||
            sendError.message?.includes("quota") ||
            sendError.message?.includes("429") ||
            sendError.name === "TypeError") {
          console.error("📊 Detected network/quota error");
          console.error("📊 Error details:", {
            name: sendError.name,
            message: sendError.message,
            status: sendError.status
          });
          
          // Check if it's a quota error specifically
          if (sendError.message?.includes("quota") || sendError.message?.includes("429")) {
            throw new Error("QUOTA_EXCEEDED: API rate limit reached. Please wait 1-2 minutes and try again.");
          }
          
          throw new Error("Cannot reach Gemini API. Check if https://generativelanguage.googleapis.com is accessible.");
        }
        
        // Check for CORS errors
        if (sendError.message?.includes("CORS") || 
            sendError.message?.includes("blocked")) {
          throw new Error("API access blocked by browser CORS policy.");
        }
        
        throw sendError;
      }

      // Validate response
      if (!result || !result.response) {
        throw new Error("Invalid AI response structure");
      }

      const responseText = result.response.text();
      console.log("📥 AI RAW RESPONSE:", responseText);

      // Check if response is empty or too short
      if (!responseText || responseText.trim().length === 0) {
        throw new Error("Empty AI response");
      }

      if (responseText.trim().length < 3) {
        throw new Error("Response too short");
      }
      
      // Clean up markdown formatting for voice
      const cleanResponse = responseText
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/\n+/g, ". ")
        .replace(/[#]+/g, "")
        .replace(/\[.*?\]/g, "") // Remove language tags
        .trim();

      console.log("✅ CLEAN RESPONSE:", cleanResponse);
      setLastResponse(cleanResponse);
      
      // CRITICAL: Speak the response
      await speakText(cleanResponse);
      
    } catch (error: any) {
      console.error("❌ AI Response Error:", error);
      console.error("Error type:", error?.constructor?.name);
      console.error("Error message:", error?.message);
      
      // Convert error to string safely
      const errorString = String(error?.message || error || 'unknown error').toLowerCase();
      console.error("Error string:", errorString);
      
      // Provide meaningful, calm fallback based on language and error type
      let fallbackMsg: string;
      
      // Check for specific error types
      const isQuotaError = errorString.includes("quota") || 
                           errorString.includes("429") || 
                           errorString.includes("resource_exhausted") ||
                           errorString.includes("resource exhausted");
      
      const isTimeoutError = errorString.includes("timeout");
      const isSessionError = errorString.includes("session") || errorString.includes("not initialized");
      const isNetworkError = errorString.includes("network") || 
                             errorString.includes("fetch") ||
                             errorString.includes("connection") ||
                             errorString.includes("cors") ||
                             errorString.includes("blocked");
      const isAPIKeyError = errorString.includes("api") && errorString.includes("key");
      
      // Handle different error types with appropriate responses
      if (isAPIKeyError) {
        if (currentLanguage === "hi-IN") {
          fallbackMsg = "मुझे खेद है, सेवा उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।";
        } else {
          fallbackMsg = "Sorry, service is unavailable. Please try again later.";
        }
        toast.error("AI service configuration error. Check API key in .env file.");
      } else if (isNetworkError) {
        if (currentLanguage === "hi-IN") {
          fallbackMsg = "नेटवर्क में समस्या है। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।";
        } else {
          fallbackMsg = "Network issue detected. Please check your connection and try again.";
        }
        toast.error("Cannot connect to Gemini API. Check network/firewall settings.", { duration: 6000 });
        console.error("💡 TIP: If using VPN or proxy, try disabling it temporarily");
      } else if (isQuotaError) {
        if (currentLanguage === "hi-IN") {
          fallbackMsg = "मुझे खेद है, अभी बहुत सारे लोग मुझसे बात कर रहे हैं। कृपया एक मिनट में फिर से कोशिश करें।";
        } else {
          fallbackMsg = "Sorry, I'm talking to many people right now. Please try again in a minute.";
        }
        toast.error("API quota exceeded. Please wait 1 minute.", { duration: 5000 });
      } else if (isTimeoutError) {
        if (currentLanguage === "hi-IN") {
          fallbackMsg = "मुझे थोड़ा समय लग रहा है। कृपया फिर से बताएं।";
        } else {
          fallbackMsg = "I'm taking a moment. Please try again.";
        }
      } else if (isSessionError) {
        if (currentLanguage === "hi-IN") {
          fallbackMsg = "मैं यहाँ हूं। आप कैसा महसूस कर रहे हैं?";
        } else {
          fallbackMsg = "I'm here. How are you feeling?";
        }
        // Try to reinitialize session
        setTimeout(() => initializeChatSession(), 1000);
      } else if (isNetworkError) {
        if (currentLanguage === "hi-IN") {
          fallbackMsg = "कनेक्शन में समस्या है। कृपया अपना इंटरनेट जांचें।";
        } else {
          fallbackMsg = "Connection issue. Please check your internet.";
        }
        toast.error("Network error. Check your connection.");
      } else {
        // Generic fallback for unknown errors
        if (currentLanguage === "hi-IN") {
          fallbackMsg = "क्षमा करें, मुझे समझने में कठिनाई हुई। क्या आप फिर से बता सकते हैं?";
        } else {
          fallbackMsg = "Sorry, I had trouble understanding. Could you repeat that?";
        }
      }
      
      setLastResponse(fallbackMsg);
      await speakText(fallbackMsg);
    }
  };

  // Text-to-speech - CRITICAL VOICE OUTPUT
  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      console.log("🔊 SPEAKING:", text);
      console.log("🔊 TEXT LENGTH:", text.length, "characters");
      
      // Validate text
      if (!text || text.trim().length === 0) {
        console.error("❌ Cannot speak empty text");
        setVoiceState("idle");
        voiceStateRef.current = "idle";
        resolve();
        return;
      }

      // CRITICAL: Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice for calm, mindful tone
      utterance.rate = 0.9; // Slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = currentLanguage;

      // Try to use a suitable voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(currentLanguage.split("-")[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log("🔊 Using voice:", preferredVoice.name);
      }

      utterance.onstart = () => {
        console.log("🔊 STATE: Speaking started");
        setVoiceState("speaking");
        voiceStateRef.current = "speaking";
      };

      utterance.onend = () => {
        console.log("✅ STATE: Speaking finished - COMPLETE");
        setVoiceState("idle");
        voiceStateRef.current = "idle";
        
        // CRITICAL: Auto-resume listening after speaking (only if call is active)
        if (isCallActive) {
          console.log("🔄 Auto-resuming listening in 1.5 seconds...");
          setTimeout(() => {
            if (voiceStateRef.current === "idle" && isCallActive) {
              startListening();
            }
          }, 1500);
        }
        
        resolve();
      };

      utterance.onerror = (error) => {
        console.error("❌ Speech synthesis error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        setVoiceState("idle");
        voiceStateRef.current = "idle";
        
        // Still try to resume listening
        if (isCallActive) {
          setTimeout(() => startListening(), 1000);
        }
        
        resolve();
      };

      // Add boundary event to detect progress
      utterance.onboundary = (event) => {
        console.log("🔊 Speaking progress:", event.charIndex, "/", text.length);
      };

      synthRef.current = utterance;
      
      // CRITICAL: Actually speak
      try {
        window.speechSynthesis.speak(utterance);
        console.log("✅ Speech queued successfully");
        
        // Add a watchdog to detect if speech is stuck
        const watchdog = setTimeout(() => {
          if (window.speechSynthesis.speaking) {
            console.log("⚠️ Speech still running after 30s");
          }
        }, 30000);
        
        utterance.onend = () => {
          clearTimeout(watchdog);
          console.log("✅ STATE: Speaking finished - COMPLETE");
          setVoiceState("idle");
          voiceStateRef.current = "idle";
          
          if (isCallActive) {
            console.log("🔄 Auto-resuming listening in 1.5 seconds...");
            setTimeout(() => {
              if (voiceStateRef.current === "idle" && isCallActive) {
                startListening();
              }
            }, 1500);
          }
          
          resolve();
        };
      } catch (error) {
        console.error("❌ Failed to queue speech:", error);
        setVoiceState("idle");
        voiceStateRef.current = "idle";
        resolve();
      }
    });
  };

  // Change language
  const toggleLanguage = () => {
    const languages = ["en-IN", "hi-IN"];
    const currentIndex = languages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setCurrentLanguage(languages[nextIndex]);
    toast.success(`Language changed to ${languages[nextIndex] === "en-IN" ? "English" : "Hindi"}`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up voice chat");
      setIsCallActive(false);
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Update ref when state changes
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Get status message
  const getStatusMessage = () => {
    switch (voiceState) {
      case "listening":
        return "Listening to you...";
      case "speaking":
        return "Saarthi is speaking...";
      case "processing":
        return "Processing...";
      default:
        return "Tap microphone to start";
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (voiceState) {
      case "listening":
        return "from-green-500 to-emerald-600";
      case "speaking":
        return "from-blue-500 to-cyan-600";
      case "processing":
        return "from-purple-500 to-pink-600";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center relative">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>

            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/30 mb-2">
                <motion.div
                  animate={voiceState === "speaking" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Volume2 className="w-10 h-10 text-white" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-white">AI Saarthi</h2>
              <p className="text-white/90 text-sm">Your Calm Wellness Guide</p>
              <Badge className="bg-white/20 text-white border-white/30 mt-2">
                {currentLanguage === "en-IN" ? "🇮🇳 English" : "🇮🇳 हिंदी"}
              </Badge>
            </div>
          </div>

          {/* Voice State Display */}
          <div className="p-8">
            {/* Status Badge */}
            <div className="text-center mb-6">
              <motion.div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getStatusColor()} text-white text-sm font-medium shadow-lg`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {voiceState === "listening" && <Mic className="w-4 h-4 animate-pulse" />}
                {voiceState === "speaking" && <Volume2 className="w-4 h-4 animate-pulse" />}
                {getStatusMessage()}
              </motion.div>
            </div>

            {/* Visual Feedback */}
            <div className="relative h-32 flex items-center justify-center mb-6">
              <AnimatePresence>
                {voiceState === "listening" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute"
                  >
                    <motion.div
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 opacity-30"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 opacity-50"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </motion.div>
                )}

                {voiceState === "speaking" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="flex gap-2"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-full"
                        animate={{
                          height: [20, 60, 20],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                {voiceState === "processing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
                    className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                  />
                )}

                {voiceState === "idle" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center"
                  >
                    <Phone className="w-12 h-12 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Transcript Display */}
            <AnimatePresence>
              {(transcript || lastResponse) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 space-y-3"
                >
                  {transcript && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">You said:</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{transcript}</p>
                    </div>
                  )}
                  {lastResponse && (
                    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl p-4 shadow-md">
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Saarthi:</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{lastResponse}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex gap-4 justify-center items-center flex-wrap">
              {/* Main Mic Button */}
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={voiceState === "listening" ? stopListening : startListening}
                  disabled={voiceState === "speaking" || voiceState === "processing" || !isSupported || !isCallActive}
                  size="lg"
                  className={`w-20 h-20 rounded-full shadow-2xl ${
                    voiceState === "listening"
                      ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      : "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  }`}
                >
                  {voiceState === "listening" ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </Button>
              </motion.div>

              {/* Retry Button - shown when call is not active */}
              {!isCallActive && (
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={initializeChatSession}
                    variant="outline"
                    className="rounded-full px-6 py-3 text-sm border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                  >
                    🔄 Retry Connection
                  </Button>
                </motion.div>
              )}

              {/* Test API Button - for debugging */}
              {isCallActive && voiceState === "idle" && (
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={async () => {
                      console.log("🧪 Testing API with simple message...");
                      await getAIResponse("Hello");
                    }}
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 py-2 text-xs border border-gray-300"
                  >
                    🧪 Test API
                  </Button>
                </motion.div>
              )}

              {/* Language Toggle */}
              <Button
                onClick={toggleLanguage}
                variant="outline"
                className="rounded-full px-4 py-2 text-sm"
                disabled={voiceState !== "idle"}
              >
                {currentLanguage === "en-IN" ? "Switch to Hindi" : "Switch to English"}
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {!isCallActive 
                  ? "⚠️ Connection failed. Click 'Retry Connection' to try again."
                  : voiceState === "idle" 
                  ? "Tap the microphone to start talking with Saarthi"
                  : voiceState === "listening"
                  ? "Speak naturally... Saarthi is listening"
                  : voiceState === "speaking"
                  ? "Listen to Saarthi's response..."
                  : "Saarthi is thinking..."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-gray-800 dark:to-indigo-900 px-6 py-4 text-center border-t border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              🎙️ Browser-based voice chat • 100% Free • Web Speech API
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
