
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from 'lucide-react';

const Messages = () => {
  const { user } = useAuthStore();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  
  // Example conversation data - in a real app this would come from an API
  const conversations = [
    { 
      id: "1", 
      name: "John Doe", 
      avatar: "https://github.com/shadcn.png", 
      role: "Tutor",
      lastMessage: "How's your progress on the React project?",
      unread: 2
    },
    { 
      id: "2", 
      name: "Jane Smith", 
      avatar: "", 
      role: "Admin",
      lastMessage: "The next workshop has been scheduled",
      unread: 0
    },
  ];
  
  // Example messages for the selected conversation
  const messages = [
    {
      id: "1",
      text: "Hi there, how can I help you with your learning journey?",
      sender: "other",
      timestamp: "Yesterday, 2:30 PM"
    },
    {
      id: "2",
      text: "I'm having trouble with React hooks. Can you explain useEffect?",
      sender: "self",
      timestamp: "Yesterday, 2:35 PM"
    },
    {
      id: "3",
      text: "Of course! The useEffect hook lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes.",
      sender: "other",
      timestamp: "Yesterday, 2:40 PM"
    }
  ];
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // In a real app, this would send the message to an API
    console.log(`Sending message: ${message} to conversation: ${activeConversation}`);
    
    // Clear the input field
    setMessage("");
  };
  
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations list */}
        <Card className="col-span-1 lg:col-span-1 overflow-hidden">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className={`w-full text-left px-3 py-3 rounded-lg ${
                      activeConversation === conversation.id 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>{conversation.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{conversation.name}</p>
                          {conversation.unread > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-primary rounded-full">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Message content */}
        <Card className="col-span-1 lg:col-span-3 flex flex-col">
          {activeConversation ? (
            <>
              <CardHeader className="px-4 py-3 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={conversations.find(c => c.id === activeConversation)?.avatar} />
                    <AvatarFallback>
                      {conversations.find(c => c.id === activeConversation)?.name[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {conversations.find(c => c.id === activeConversation)?.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {conversations.find(c => c.id === activeConversation)?.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <div className="flex-1 overflow-auto p-4">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'self' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-lg ${
                            msg.sender === 'self'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'self' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-lg font-medium">No conversation selected</h3>
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
