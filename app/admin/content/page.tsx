"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Code,
  Image,
  Shield,
  Flag,
} from "lucide-react";

export default function AdminContentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const assignments = [
    {
      id: 1,
      title: "React Todo App",
      author: "John Doe",
      university: "Stanford University",
      status: "approved",
      uploadDate: "2024-01-15",
      submissions: 45,
      violations: 0,
      type: "assignment",
    },
    {
      id: 2,
      title: "Database Design Project",
      author: "Jane Smith",
      university: "MIT",
      status: "pending",
      uploadDate: "2024-01-14",
      submissions: 0,
      violations: 0,
      type: "assignment",
    },
    {
      id: 3,
      title: "Binary Tree Traversal",
      author: "System",
      university: "Milestack",
      status: "approved",
      uploadDate: "2024-01-10",
      submissions: 1200,
      violations: 0,
      type: "challenge",
    },
    {
      id: 4,
      title: "Suspicious Assignment",
      author: "Alex Chen",
      university: "UC Berkeley",
      status: "flagged",
      uploadDate: "2024-01-13",
      submissions: 3,
      violations: 2,
      type: "assignment",
    },
  ];

  const aiSessions = [
    {
      id: 1,
      user: "John Doe",
      topic: "React State Management",
      pointsUsed: 15,
      status: "completed",
      timestamp: "2024-01-15T10:30:00Z",
      violations: 0,
    },
    {
      id: 2,
      user: "Jane Smith",
      topic: "Algorithm Optimization",
      pointsUsed: 25,
      status: "completed",
      timestamp: "2024-01-15T09:15:00Z",
      violations: 0,
    },
    {
      id: 3,
      user: "Alex Chen",
      topic: "Complete Code Solution",
      pointsUsed: 50,
      status: "flagged",
      timestamp: "2024-01-14T16:45:00Z",
      violations: 1,
    },
  ];

  const violations = [
    {
      id: 1,
      type: "Academic Integrity",
      description: "Requested complete solution instead of guidance",
      user: "Alex Chen",
      content: "AI Session #3",
      severity: "high",
      status: "pending",
      reportedDate: "2024-01-14",
    },
    {
      id: 2,
      type: "Inappropriate Content",
      description: "Assignment contains offensive language",
      user: "Mike Johnson",
      content: "Assignment #4",
      severity: "medium",
      status: "resolved",
      reportedDate: "2024-01-13",
    },
    {
      id: 3,
      type: "Spam",
      description: "Multiple duplicate assignments uploaded",
      user: "Sarah Wilson",
      content: "Assignment #5",
      severity: "low",
      status: "pending",
      reportedDate: "2024-01-12",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "flagged":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
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

  const handleContentAction = (contentId: number, action: string) => {
    console.log(`Action ${action} for content ${contentId}`);
  };

  const handleViolationAction = (violationId: number, action: string) => {
    console.log(`Action ${action} for violation ${violationId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Content Management</h1>
          <p className="text-muted-foreground">
            Monitor and moderate platform content, assignments, and AI sessions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-muted-foreground">
                    Total Assignments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Code className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-sm text-muted-foreground">
                    Active Challenges
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Flag className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">
                    Flagged Content
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-2xl font-bold">98.5%</p>
                  <p className="text-sm text-muted-foreground">
                    Compliance Rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="ai-sessions">AI Sessions</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="challenge">Challenge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Assignments & Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {assignment.university}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{assignment.author}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignment.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{assignment.submissions}</TableCell>
                        <TableCell>
                          <span
                            className={
                              assignment.violations > 0
                                ? "text-red-600 font-medium"
                                : "text-green-600"
                            }
                          >
                            {assignment.violations}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleContentAction(assignment.id, "view")
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {assignment.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleContentAction(assignment.id, "approve")
                                }
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {assignment.status === "flagged" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleContentAction(assignment.id, "review")
                                }
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Points Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aiSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{session.user}</TableCell>
                        <TableCell>{session.topic}</TableCell>
                        <TableCell>{session.pointsUsed}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(session.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleContentAction(session.id, "view")
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {session.status === "flagged" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleContentAction(session.id, "review")
                                }
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {violations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell>{violation.type}</TableCell>
                        <TableCell>{violation.description}</TableCell>
                        <TableCell>{violation.user}</TableCell>
                        <TableCell>{violation.content}</TableCell>
                        <TableCell>
                          <Badge
                            className={getSeverityColor(violation.severity)}
                          >
                            {violation.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(violation.status)}>
                            {violation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleViolationAction(violation.id, "view")
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {violation.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleViolationAction(
                                      violation.id,
                                      "resolve"
                                    )
                                  }
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleViolationAction(
                                      violation.id,
                                      "dismiss"
                                    )
                                  }
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Content Filters</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Academic Integrity Scanner
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Inappropriate Content Filter
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Plagiarism Detection
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Automated Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Auto-approve Low Risk Content
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Flag High Risk Content
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Auto-reject Violations
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

