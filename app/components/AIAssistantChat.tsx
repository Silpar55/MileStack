import { useState } from "react";
import { Brain, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  type: "ai" | "user";
  text: string;
  cost?: number;
}

interface AIAssistantChatProps {
  availablePoints?: number;
}

export function AIAssistantChat({
  availablePoints = 25,
}: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: "Hello! I see you're working on state management. What specific concept would you like help understanding?",
    },
    { type: "user", text: "How do I update state in React?" },
    {
      type: "ai",
      text: "Great question! Let me guide you: What do you think happens when you try to modify state directly, like todos.push(newItem)?",
      cost: 5,
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages, { type: "user", text: inputValue }]);
    setInputValue("");
    console.log("Message sent:", inputValue);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "That's a good approach! Consider using the spread operator to create a new array...",
          cost: 5,
        },
      ]);
    }, 1000);
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-[#EDE9FE] to-blue-100 dark:from-[#7C3AED]/20 dark:to-blue-900/30">
        <CardTitle className="flex items-center text-base">
          <Brain className="w-5 h-5 mr-2 text-[#7C3AED]" />
          AI Learning Assistant
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {availablePoints} pts available for assistance
        </p>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
              data-testid={`message-${message.type}-${index}`}
            >
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.cost && (
                  <p className="text-xs mt-2 opacity-70">
                    This hint cost: {message.cost} pts
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardContent className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask for help (costs points)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            data-testid="input-ai-message"
          />
          <Button
            onClick={handleSend}
            className="bg-gradient-to-r from-primary to-blue-400"
            data-testid="button-send-message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
