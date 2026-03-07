import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Activity, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function SimpleVoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, text: string}>>([]);

  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN'; // Hindi + English

      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        console.log('🎤 User said:', text);
        setTranscript(text);
        setIsListening(false);
        
        // Automatically process the query
        await handleVoiceQuery(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Voice input error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Your browser does not support voice recognition. Please use Chrome or Edge.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const startListening = () => {
    setError('');
    setTranscript('');
    setAiResponse('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start voice input');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleVoiceQuery = async (query: string) => {
    setIsProcessing(true);
    setError('');

    try {
      console.log('🤖 Processing query:', query);
      
      const response = await axios.post('http://localhost:5000/api/voice-assistant/query', {
        query: query,
        conversationHistory: conversationHistory.slice(-4) // Last 2 exchanges
      });

      const aiText = response.data.response;
      setAiResponse(aiText);

      // Update conversation history
      setConversationHistory([
        ...conversationHistory,
        { role: 'user', text: query },
        { role: 'assistant', text: aiText }
      ]);

      // Speak the response
      speakResponse(aiText);

    } catch (err: any) {
      console.error('Error processing query:', err);
      const errorMsg = err.response?.data?.message || 'Failed to process your query';
      setError(errorMsg);
      speakResponse('Maaf kijiye, mujhe aapki query process karne mein problem aa rahi hai.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hindi voice
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(voice => voice.lang.startsWith('hi')) || 
                       voices.find(voice => voice.lang.startsWith('en-IN'));
    
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (err) => {
      console.error('Speech synthesis error:', err);
      setIsSpeaking(false);
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setTranscript('');
    setAiResponse('');
    setError('');
    stopSpeaking();
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
          <Activity className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          MediSaarthi AI Voice Assistant
        </h2>
        <p className="text-gray-600">
          🎙️ Click mic → Ask health question → Get instant answer
        </p>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          isListening ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
          <span className="text-sm font-medium">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </span>
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
          isSpeaking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {isSpeaking ? <Volume2 className="w-5 h-5 animate-pulse" /> : <VolumeX className="w-5 h-5" />}
          <span className="text-sm font-medium">
            {isSpeaking ? 'Speaking...' : 'Silent'}
          </span>
        </div>
      </div>

      {/* Main Control Button */}
      <div className="flex justify-center mb-8">
        {!isListening ? (
          <button
            onClick={startListening}
            disabled={isProcessing || isSpeaking}
            className="group relative w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full transition-opacity"></div>
            <Mic className="w-16 h-16 text-white mx-auto animate-pulse-slow" />
            <p className="text-white text-sm font-semibold mt-2">
              {isProcessing ? 'Processing...' : 'TAP TO SPEAK'}
            </p>
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="w-32 h-32 bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-2xl animate-pulse"
          >
            <MicOff className="w-16 h-16 text-white mx-auto" />
            <p className="text-white text-sm font-semibold mt-2">STOP</p>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-blue-900 font-medium">AI is thinking...</p>
        </div>
      )}

      {/* Conversation Display */}
      {conversationHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Conversation</h3>
            <button
              onClick={clearConversation}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {conversationHistory.slice(-6).map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg ${
                  item.role === 'user'
                    ? 'bg-blue-100 ml-8'
                    : 'bg-green-100 mr-8'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    <span className="text-white text-sm font-bold">
                      {item.role === 'user' ? 'आप' : 'AI'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${
                      item.role === 'user' ? 'text-blue-900' : 'text-green-900'
                    }`}>
                      {item.role === 'user' ? 'You' : 'MediSaarthi'}
                    </p>
                    <p className="text-gray-800 mt-1">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-bold text-gray-900 mb-3">💡 Quick Tips</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Speak clearly in <strong>Hindi or English</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Ask about symptoms, medicines, or health advice</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Example: "Mujhe sir dard hai, kya karoon?"</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Works completely <strong>FREE</strong> - no phone calls needed!</span>
          </li>
        </ul>
      </div>

      {/* Voice Control */}
      {isSpeaking && (
        <div className="mt-6 text-center">
          <button
            onClick={stopSpeaking}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            🔇 Stop Speaking
          </button>
        </div>
      )}
    </div>
  );
}
