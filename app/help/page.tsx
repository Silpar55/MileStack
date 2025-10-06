"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  HelpCircle,
  MessageCircle,
  BookOpen,
  Video,
  FileText,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

export default function HelpPage() {
  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      questions: [
        {
          id: 1,
          question: "How do I upload my first assignment?",
          answer:
            "Go to the Assignments page and click 'Upload Assignment'. You can drag and drop files or click to browse. Supported formats include PDF, DOC, TXT, and images.",
        },
        {
          id: 2,
          question: "How does the AI assistance work?",
          answer:
            "AI assistance is designed to guide your learning, not provide complete solutions. You can ask for explanations, debugging help, or conceptual guidance. All interactions are logged for transparency.",
        },
        {
          id: 3,
          question: "How do I earn points?",
          answer:
            "You earn points by completing assignments, solving challenges, and demonstrating learning progress. Points can be used for AI assistance and redeemed for rewards.",
        },
      ],
    },
    {
      id: "ai-assistance",
      title: "AI Assistance",
      icon: MessageCircle,
      questions: [
        {
          id: 4,
          question: "What can I ask the AI assistant?",
          answer:
            "You can ask for conceptual explanations, code reviews, debugging help, and learning guidance. The AI is designed to help you understand, not to complete your work for you.",
        },
        {
          id: 5,
          question: "How much do AI sessions cost?",
          answer:
            "AI assistance costs points based on the type of help requested. Conceptual hints cost 5 points, pseudocode guides cost 15 points, and code reviews cost 25 points.",
        },
        {
          id: 6,
          question: "Are my AI conversations private?",
          answer:
            "Your AI conversations are logged for academic integrity purposes but are not shared with other students. Instructors may review sessions if there are concerns about academic integrity.",
        },
      ],
    },
    {
      id: "technical",
      title: "Technical Issues",
      icon: HelpCircle,
      questions: [
        {
          id: 7,
          question: "The app is running slowly. What should I do?",
          answer:
            "Try refreshing the page, clearing your browser cache, or checking your internet connection. If the issue persists, contact our support team.",
        },
        {
          id: 8,
          question: "I can't upload my assignment file. What's wrong?",
          answer:
            "Make sure your file is in a supported format (PDF, DOC, DOCX, TXT, MD, JPG, PNG, ZIP) and is under 50MB. If you're still having issues, try a different browser.",
        },
        {
          id: 9,
          question: "My progress isn't being saved. What should I do?",
          answer:
            "Make sure you're logged in and have a stable internet connection. If the issue continues, try logging out and back in, or contact support.",
        },
      ],
    },
  ];

  const supportChannels = [
    {
      id: 1,
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      availability: "Available 24/7",
      responseTime: "Usually within 5 minutes",
      color: "text-green-600",
    },
    {
      id: 2,
      title: "Email Support",
      description: "Send us a detailed message and we'll respond",
      icon: Mail,
      availability: "Mon-Fri, 9AM-6PM EST",
      responseTime: "Within 24 hours",
      color: "text-blue-600",
    },
    {
      id: 3,
      title: "Video Call",
      description: "Schedule a one-on-one session with our team",
      icon: Video,
      availability: "By appointment",
      responseTime: "Schedule within 48 hours",
      color: "text-purple-600",
    },
  ];

  const resources = [
    {
      id: 1,
      title: "User Guide",
      description: "Complete guide to using Milestack",
      icon: BookOpen,
      type: "Documentation",
    },
    {
      id: 2,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: Video,
      type: "Video",
    },
    {
      id: 3,
      title: "API Documentation",
      description: "Technical documentation for developers",
      icon: FileText,
      type: "Technical",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get the help you need
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for help articles, FAQs, or topics..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ Categories */}
        <div className="space-y-8 mb-12">
          {faqCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id}>
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Icon className="w-6 h-6 mr-3 text-primary" />
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq) => (
                    <Card
                      key={faq.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg">
                            {faq.question}
                          </h3>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Channels */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Get Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card
                  key={channel.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                        <Icon className={`w-6 h-6 ${channel.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {channel.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{channel.availability}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {channel.responseTime}
                      </div>
                      <Button className="w-full" variant="outline">
                        Start {channel.title}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon;
              return (
                <Card
                  key={resource.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {resource.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{resource.type}</Badge>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-primary/10 to-blue-100">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Still Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                Can&apos;t find what you&apos;re looking for? Our support team
                is here to help.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="bg-gradient-to-r from-primary to-blue-400">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Live Chat
                </Button>
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
