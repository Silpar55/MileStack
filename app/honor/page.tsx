"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Users,
  FileText,
  Award,
} from "lucide-react";

export default function HonorPage() {
  const honorCodePrinciples = [
    {
      id: 1,
      title: "Academic Integrity",
      description:
        "All work submitted must be your own original work. Collaboration is encouraged, but copying or plagiarism is strictly prohibited.",
      icon: Shield,
      importance: "high",
    },
    {
      id: 2,
      title: "Honest Learning",
      description:
        "Use AI assistance as a learning tool, not as a shortcut. The goal is to understand concepts, not just complete assignments.",
      icon: BookOpen,
      importance: "high",
    },
    {
      id: 3,
      title: "Transparent Collaboration",
      description:
        "When working with others, clearly document contributions and cite all sources and assistance received.",
      icon: Users,
      importance: "medium",
    },
    {
      id: 4,
      title: "Respectful Environment",
      description:
        "Maintain a respectful and inclusive learning environment for all students and instructors.",
      icon: Award,
      importance: "medium",
    },
  ];

  const violations = [
    {
      id: 1,
      type: "Plagiarism",
      description: "Submitting work that is not your own",
      severity: "high",
      consequences: [
        "Assignment failure",
        "Academic probation",
        "Record on transcript",
      ],
    },
    {
      id: 2,
      type: "AI Misuse",
      description: "Using AI to generate complete solutions without learning",
      severity: "medium",
      consequences: [
        "Points deduction",
        "Assignment redo",
        "Learning intervention",
      ],
    },
    {
      id: 3,
      type: "Unauthorized Collaboration",
      description: "Sharing solutions or working together when not permitted",
      severity: "medium",
      consequences: ["Assignment failure", "Warning", "Educational meeting"],
    },
  ];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Academic Honor Code</h1>
          <p className="text-muted-foreground">
            Our commitment to academic integrity and ethical learning
          </p>
        </div>

        {/* Honor Code Principles */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Core Principles</h2>
          {honorCodePrinciples.map((principle) => {
            const Icon = principle.icon;
            return (
              <Card key={principle.id}>
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">
                          {principle.title}
                        </h3>
                        <Badge
                          className={getImportanceColor(principle.importance)}
                        >
                          {principle.importance} priority
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Assistance Guidelines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              AI Assistance Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Acceptable Use
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Asking for conceptual explanations</li>
                  <li>• Requesting code reviews and feedback</li>
                  <li>• Getting help with debugging</li>
                  <li>• Learning new programming concepts</li>
                  <li>• Understanding error messages</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Prohibited Use
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Generating complete solutions</li>
                  <li>• Copying code without understanding</li>
                  <li>• Bypassing learning objectives</li>
                  <li>• Submitting AI-generated work as your own</li>
                  <li>• Using AI during exams or assessments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violations and Consequences */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Violations and Consequences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {violations.map((violation) => (
                <div key={violation.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{violation.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {violation.description}
                      </p>
                    </div>
                    <Badge className={getSeverityColor(violation.severity)}>
                      {violation.severity} severity
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <h5 className="text-sm font-medium mb-2">
                      Possible Consequences:
                    </h5>
                    <ul className="space-y-1">
                      {violation.consequences.map((consequence, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          • {consequence}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reporting and Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Reporting and Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Report Violations</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If you witness or suspect academic dishonesty, please report
                  it confidentially.
                </p>
                <Button variant="outline" className="w-full">
                  Report Violation
                </Button>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Get Help</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Need clarification on the honor code? Our support team is here
                  to help.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-6">
            <div className="flex items-start">
              <Shield className="w-6 h-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Honor Code Agreement
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  By using Milestack, you agree to uphold these principles and
                  maintain the highest standards of academic integrity. All AI
                  interactions are logged for transparency and educational
                  purposes.
                </p>
                <div className="flex items-center space-x-4">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    I Agree to the Honor Code
                  </Button>
                  <Button size="sm" variant="outline">
                    Read Full Terms
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

