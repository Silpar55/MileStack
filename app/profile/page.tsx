"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Calendar,
  Award,
  Trophy,
  Target,
  Settings,
  Edit,
  Save,
  X,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function ProfilePageContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john.doe@university.edu",
    university: "Stanford University",
    major: "Computer Science",
    year: "Junior",
    bio: "Passionate about learning and building innovative solutions. Currently focused on web development and machine learning.",
    joinDate: "September 2024",
    avatar: "",
  });

  const stats = {
    totalPoints: 8420,
    level: 6,
    streak: 7,
    assignmentsCompleted: 12,
    challengesSolved: 342,
    globalRank: 342,
    aiSessionsUsed: 28,
  };

  const achievements = [
    {
      id: 1,
      name: "Early Bird",
      description: "Complete 5 assignments before due date",
      icon: "🌅",
      earned: true,
    },
    {
      id: 2,
      name: "Consistent Learner",
      description: "7-day learning streak",
      icon: "🔥",
      earned: true,
    },
    {
      id: 3,
      name: "Problem Solver",
      description: "Solve 100 coding challenges",
      icon: "🧩",
      earned: true,
    },
    {
      id: 4,
      name: "AI Collaborator",
      description: "Use AI assistance 25 times",
      icon: "🤖",
      earned: true,
    },
    {
      id: 5,
      name: "Top Performer",
      description: "Rank in top 500 globally",
      icon: "🏆",
      earned: false,
    },
    {
      id: 6,
      name: "Knowledge Seeker",
      description: "Complete 50 learning modules",
      icon: "📚",
      earned: false,
    },
  ];

  const handleSave = () => {
    console.log("Profile updated:", profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and view your progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profileData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{profileData.name}</CardTitle>
              <p className="text-muted-foreground">{profileData.email}</p>
              <Badge variant="outline" className="mt-2">
                Level {stats.level}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Points
                  </span>
                  <span className="font-semibold">
                    {stats.totalPoints.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Current Streak
                  </span>
                  <span className="font-semibold">{stats.streak} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Global Rank
                  </span>
                  <span className="font-semibold">#{stats.globalRank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Member Since
                  </span>
                  <span className="font-semibold">{profileData.joinDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <div className="text-2xl font-bold">
                      {stats.assignmentsCompleted}
                    </div>
                    <p className="text-sm text-muted-foreground">Assignments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">
                      {stats.challengesSolved}
                    </div>
                    <p className="text-sm text-muted-foreground">Challenges</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">
                      {stats.aiSessionsUsed}
                    </div>
                    <p className="text-sm text-muted-foreground">AI Sessions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <User className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">
                      #{stats.globalRank}
                    </div>
                    <p className="text-sm text-muted-foreground">Global Rank</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        action: "Completed",
                        item: "React Todo App",
                        time: "2 hours ago",
                        points: 150,
                      },
                      {
                        action: "Solved",
                        item: "Binary Tree Traversal",
                        time: "1 day ago",
                        points: 40,
                      },
                      {
                        action: "Used AI assistance",
                        item: "State Management Help",
                        time: "2 days ago",
                        points: -15,
                      },
                      {
                        action: "Completed",
                        item: "Database Design Project",
                        time: "3 days ago",
                        points: 200,
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {activity.action}: {activity.item}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                        <Badge
                          variant={
                            activity.points > 0 ? "default" : "secondary"
                          }
                        >
                          {activity.points > 0 ? "+" : ""}
                          {activity.points} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-4 border rounded-lg ${
                          achievement.earned
                            ? "bg-green-50 border-green-200"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">
                            {achievement.icon}
                          </span>
                          <div>
                            <h4 className="font-semibold">
                              {achievement.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        {achievement.earned && (
                          <Badge className="bg-green-100 text-green-800">
                            Earned
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Profile Information
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="bg-gradient-to-r from-primary to-blue-400"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={profileData.university}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            university: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        value={profileData.major}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            major: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          bio: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        date: "Today",
                        activities: [
                          "Completed React Todo App",
                          "Solved Binary Tree challenge",
                        ],
                      },
                      {
                        date: "Yesterday",
                        activities: [
                          "Used AI assistance for state management",
                          "Started new assignment",
                        ],
                      },
                      {
                        date: "2 days ago",
                        activities: [
                          "Completed Database Design Project",
                          "Earned 200 points",
                        ],
                      },
                      {
                        date: "3 days ago",
                        activities: [
                          "Joined Milestack",
                          "Completed profile setup",
                        ],
                      },
                    ].map((day, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-primary/20 pl-4"
                      >
                        <h4 className="font-semibold mb-2">{day.date}</h4>
                        <ul className="space-y-1">
                          {day.activities.map((activity, actIndex) => (
                            <li
                              key={actIndex}
                              className="text-sm text-muted-foreground"
                            >
                              • {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
