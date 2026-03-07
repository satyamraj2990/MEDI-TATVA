import { memo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle, Search, Send, Plus, Phone, Video,
  MoreVertical, Paperclip, Smile, Check, CheckCheck,
  User, Clock, Circle
} from "lucide-react";
import { toast } from "sonner";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

interface Message {
  id: number;
  text: string;
  sender: 'patient' | 'pharmacy';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface Patient {
  id: number;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

const initialPatients: Patient[] = [
  {
    id: 1,
    name: "Rajesh Kumar",
    avatar: undefined,
    lastMessage: "Do you have Paracetamol 650mg in stock?",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    isOnline: true,
    messages: [
      {
        id: 1,
        text: "Hello! I need some medicine urgently",
        sender: 'patient',
        timestamp: new Date(Date.now() - 600000),
        status: 'read'
      },
      {
        id: 2,
        text: "Hi Rajesh! Yes, how can I help you today?",
        sender: 'pharmacy',
        timestamp: new Date(Date.now() - 540000),
        status: 'read'
      },
      {
        id: 3,
        text: "Do you have Paracetamol 650mg in stock?",
        sender: 'patient',
        timestamp: new Date(Date.now() - 120000),
        status: 'delivered'
      }
    ]
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: undefined,
    lastMessage: "Thank you so much!",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 1,
        text: "I need my prescription refilled",
        sender: 'patient',
        timestamp: new Date(Date.now() - 3700000),
        status: 'read'
      },
      {
        id: 2,
        text: "Sure! Can you share your prescription details?",
        sender: 'pharmacy',
        timestamp: new Date(Date.now() - 3680000),
        status: 'read'
      },
      {
        id: 3,
        text: "Sent prescription image",
        sender: 'patient',
        timestamp: new Date(Date.now() - 3660000),
        status: 'read'
      },
      {
        id: 4,
        text: "Got it! Your medicines are ready for pickup.",
        sender: 'pharmacy',
        timestamp: new Date(Date.now() - 3640000),
        status: 'read'
      },
      {
        id: 5,
        text: "Thank you so much!",
        sender: 'patient',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read'
      }
    ]
  },
  {
    id: 3,
    name: "Amit Patel",
    avatar: undefined,
    lastMessage: "Is the pharmacy open on Sunday?",
    lastMessageTime: "3h ago",
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: 1,
        text: "Is the pharmacy open on Sunday?",
        sender: 'patient',
        timestamp: new Date(Date.now() - 10800000),
        status: 'delivered'
      }
    ]
  },
  {
    id: 4,
    name: "Sneha Reddy",
    avatar: undefined,
    lastMessage: "Perfect! I'll come by tomorrow.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 1,
        text: "Do you deliver medicines?",
        sender: 'patient',
        timestamp: new Date(Date.now() - 86400000),
        status: 'read'
      },
      {
        id: 2,
        text: "Yes, we deliver within 5km radius. Where are you located?",
        sender: 'pharmacy',
        timestamp: new Date(Date.now() - 86300000),
        status: 'read'
      },
      {
        id: 3,
        text: "I'm in Sector 15. Can you deliver by 6 PM?",
        sender: 'patient',
        timestamp: new Date(Date.now() - 86200000),
        status: 'read'
      },
      {
        id: 4,
        text: "Yes, absolutely! We'll deliver by 6 PM.",
        sender: 'pharmacy',
        timestamp: new Date(Date.now() - 86100000),
        status: 'read'
      },
      {
        id: 5,
        text: "Perfect! I'll come by tomorrow.",
        sender: 'patient',
        timestamp: new Date(Date.now() - 86000000),
        status: 'read'
      }
    ]
  },
  {
    id: 5,
    name: "Vikram Singh",
    avatar: undefined,
    lastMessage: "What are your working hours?",
    lastMessageTime: "2 days ago",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 1,
        text: "What are your working hours?",
        sender: 'patient',
        timestamp: new Date(Date.now() - 172800000),
        status: 'read'
      },
      {
        id: 2,
        text: "We're open from 8 AM to 10 PM every day!",
        sender: 'pharmacy',
        timestamp: new Date(Date.now() - 172700000),
        status: 'read'
      }
    ]
  }
];

export const ChatTab = memo(() => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatients[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedPatient?.messages]);

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Send message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedPatient) return;

    const newMessage: Message = {
      id: Date.now(),
      text: messageInput,
      sender: 'pharmacy',
      timestamp: new Date(),
      status: 'sent'
    };

    // Update patient's messages
    const updatedPatients = patients.map(patient => {
      if (patient.id === selectedPatient.id) {
        return {
          ...patient,
          messages: [...patient.messages, newMessage],
          lastMessage: messageInput,
          lastMessageTime: "Just now"
        };
      }
      return patient;
    });

    setPatients(updatedPatients);
    setSelectedPatient({
      ...selectedPatient,
      messages: [...selectedPatient.messages, newMessage]
    });
    setMessageInput("");

    // Simulate message delivery
    setTimeout(() => {
      const deliveredPatients = updatedPatients.map(patient => {
        if (patient.id === selectedPatient.id) {
          return {
            ...patient,
            messages: patient.messages.map(msg =>
              msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
            )
          };
        }
        return patient;
      });
      setPatients(deliveredPatients);
      if (selectedPatient.id === selectedPatient.id) {
        setSelectedPatient({
          ...selectedPatient,
          messages: selectedPatient.messages.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'delivered' as const } : msg
          )
        });
      }
    }, 1000);

    // Simulate read status
    setTimeout(() => {
      const readPatients = updatedPatients.map(patient => {
        if (patient.id === selectedPatient.id) {
          return {
            ...patient,
            messages: patient.messages.map(msg =>
              msg.id === newMessage.id ? { ...msg, status: 'read' as const } : msg
            )
          };
        }
        return patient;
      });
      setPatients(readPatients);
      if (selectedPatient.id === selectedPatient.id) {
        setSelectedPatient({
          ...selectedPatient,
          messages: selectedPatient.messages.map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'read' as const } : msg
          )
        });
      }
    }, 2000);
  };

  // Handle patient selection
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    // Mark messages as read
    const updatedPatients = patients.map(p =>
      p.id === patient.id ? { ...p, unreadCount: 0 } : p
    );
    setPatients(updatedPatients);
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Format message time
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-[calc(100vh-120px)]"
    >
      <Card className="h-full overflow-hidden border-gray-200/50 dark:border-white/10 flex flex-col lg:flex-row bg-white/95 dark:bg-white/5 backdrop-blur-xl">
        {/* Left Panel - Patient List */}
        <div className="w-full lg:w-[380px] border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 flex flex-col bg-white/95 dark:bg-white/5 backdrop-blur-xl max-h-[40vh] lg:max-h-none">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Patient Chats</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{patients.length} conversations</p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7]"
                onClick={() => toast.info("New chat feature coming soon!")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 dark:border-white/10 focus:border-[#1B6CA8] bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Patient List */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence>
              {filteredPatients.map((patient) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => handleSelectPatient(patient)}
                  className={`p-4 border-b border-gray-200 dark:border-white/5 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-white/5 ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50 dark:bg-cyan-500/10 border-l-4 border-l-[#1B6CA8]' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={patient.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] text-white font-bold">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                      {patient.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-[#2ECC71] rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{patient.name}</p>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{patient.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{patient.lastMessage}</p>
                        {patient.unreadCount > 0 && (
                          <Badge className="bg-[#1B6CA8] text-white ml-2 h-5 min-w-[20px] rounded-full px-1.5 text-xs">
                            {patient.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPatients.length === 0 && (
              <div className="p-8 text-center">
                <User className="h-12 w-12 text-cyan-500 dark:text-cyan-400 mx-auto mb-3 opacity-50" />
                <p className="text-gray-600 dark:text-gray-400">No patients found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/50">
          {selectedPatient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={selectedPatient.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-[#1B6CA8] to-[#4FC3F7] text-white font-bold">
                        {getInitials(selectedPatient.name)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedPatient.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-[#2ECC71] rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedPatient.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      {selectedPatient.isOnline ? (
                        <>
                          <Circle className="h-2 w-2 fill-[#2ECC71] text-[#2ECC71]" />
                          Online
                        </>
                      ) : (
                        <>
                          <Circle className="h-2 w-2 fill-gray-400 dark:fill-gray-500 text-gray-400 dark:text-gray-500" />
                          Offline
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-gray-100 dark:hover:bg-white/10"
                    onClick={() => toast.info("Voice call feature coming soon!")}
                  >
                    <Phone className="h-5 w-5 text-[#1B6CA8] dark:text-cyan-400" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-gray-100 dark:hover:bg-white/10"
                    onClick={() => toast.info("Video call feature coming soon!")}
                  >
                    <Video className="h-5 w-5 text-[#1B6CA8] dark:text-cyan-400" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <MoreVertical className="h-5 w-5 text-[#1B6CA8] dark:text-cyan-400" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                  {selectedPatient.messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${message.sender === 'pharmacy' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.sender === 'pharmacy' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 shadow-sm backdrop-blur-md ${
                            message.sender === 'pharmacy'
                              ? 'bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] text-white rounded-br-none'
                              : 'bg-white/95 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-bl-none'
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed">{message.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 px-2 ${
                          message.sender === 'pharmacy' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {formatMessageTime(message.timestamp)}
                          </span>
                          {message.sender === 'pharmacy' && (
                            <span>
                              {message.status === 'read' ? (
                                <CheckCheck className="h-3.5 w-3.5 text-cyan-500 dark:text-cyan-400" />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              ) : (
                                <Check className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white/95 dark:bg-white/5 backdrop-blur-xl border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-gray-100 dark:hover:bg-white/10"
                    onClick={() => toast.info("Attachment feature coming soon!")}
                  >
                    <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </Button>

                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-12 border-gray-300 dark:border-white/10 focus:border-[#1B6CA8] bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-transparent"
                      onClick={() => toast.info("Emoji picker coming soon!")}
                    >
                      <Smile className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-gradient-to-r from-[#1B6CA8] to-[#4FC3F7] disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 rounded-full p-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-20 w-20 text-cyan-500 dark:text-cyan-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a chat</h3>
                <p className="text-gray-600 dark:text-gray-400">Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
});

ChatTab.displayName = "ChatTab";
