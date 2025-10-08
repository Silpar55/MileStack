"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { processOAuthAvatarIfNeeded } from "@/shared/oauth-avatar-client";
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
  Loader2,
  BookOpen,
  Code,
  CheckCircle,
  Play,
  FileText,
  GraduationCap,
  Star,
  Zap,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

function ProfilePageContent() {
  const { user, setUser, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    university: "",
    major: "",
    year: "",
    joinDate: "",
    profilePicture: "",
    profilePictureProvider: "",
    programmingLanguages: {},
    learningGoals: [],
    experienceLevel: "",
    institutionName: "",
  });
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    streak: 0,
    assignmentsCompleted: 0,
    challengesSolved: 0,
    globalRank: 999999,
    aiSessionsUsed: 0,
    totalEarned: 0,
    totalSpent: 0,
    dailyEarned: 0,
  });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);

  // Helper function to get activity icon
  const getActivityIcon = (type: string, action: string) => {
    if (type === "challenge") return <Code className="w-4 h-4" />;
    if (type === "points") return <Star className="w-4 h-4" />;
    if (type === "checkpoint") return <CheckCircle className="w-4 h-4" />;
    if (type === "educational") {
      if (action.includes("assignment"))
        return <FileText className="w-4 h-4" />;
      if (action.includes("challenge")) return <Code className="w-4 h-4" />;
      if (action.includes("learning")) return <BookOpen className="w-4 h-4" />;
      if (action.includes("checkpoint") || action.includes("milestone"))
        return <GraduationCap className="w-4 h-4" />;
      if (action.includes("AI")) return <Zap className="w-4 h-4" />;
    }
    return <Play className="w-4 h-4" />;
  };

  // Helper function to get activity color
  const getActivityColor = (type: string, action: string) => {
    if (type === "challenge" || action.includes("challenge"))
      return "text-blue-600";
    if (type === "points") return "text-yellow-600";
    if (type === "checkpoint" || action.includes("checkpoint"))
      return "text-green-600";
    if (type === "educational") {
      if (action.includes("assignment")) return "text-purple-600";
      if (action.includes("learning")) return "text-indigo-600";
      if (action.includes("milestone")) return "text-orange-600";
      if (action.includes("AI")) return "text-cyan-600";
    }
    return "text-gray-600";
  };

  // Programming languages list for the combobox
  const programmingLanguages = [
    { value: "JavaScript", label: "JavaScript" },
    { value: "TypeScript", label: "TypeScript" },
    { value: "Python", label: "Python" },
    { value: "Java", label: "Java" },
    { value: "C++", label: "C++" },
    { value: "C#", label: "C#" },
    { value: "C", label: "C" },
    { value: "Go", label: "Go" },
    { value: "Rust", label: "Rust" },
    { value: "PHP", label: "PHP" },
    { value: "Ruby", label: "Ruby" },
    { value: "Swift", label: "Swift" },
    { value: "Kotlin", label: "Kotlin" },
    { value: "Scala", label: "Scala" },
    { value: "R", label: "R" },
    { value: "MATLAB", label: "MATLAB" },
    { value: "Perl", label: "Perl" },
    { value: "Haskell", label: "Haskell" },
    { value: "Clojure", label: "Clojure" },
    { value: "Erlang", label: "Erlang" },
    { value: "Dart", label: "Dart" },
    { value: "Lua", label: "Lua" },
    { value: "Julia", label: "Julia" },
    { value: "Assembly", label: "Assembly" },
    { value: "SQL", label: "SQL" },
    { value: "HTML", label: "HTML" },
    { value: "CSS", label: "CSS" },
    { value: "SASS/SCSS", label: "SASS/SCSS" },
    { value: "Bash/Shell", label: "Bash/Shell" },
    { value: "PowerShell", label: "PowerShell" },
    { value: "VBA", label: "VBA" },
    { value: "Objective-C", label: "Objective-C" },
    { value: "F#", label: "F#" },
    { value: "OCaml", label: "OCaml" },
    { value: "Elixir", label: "Elixir" },
    { value: "Crystal", label: "Crystal" },
    { value: "Nim", label: "Nim" },
    { value: "Zig", label: "Zig" },
    { value: "V", label: "V" },
    { value: "Other", label: "Other" },
  ];

  // Fetch profile data and stats
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;

      try {
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        // Add Authorization header only if we have a JWT token (for manual login users)
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        // Fetch profile data, stats, achievements, and activity in parallel
        const [
          profileResponse,
          statsResponse,
          achievementsResponse,
          activityResponse,
        ] = await Promise.all([
          fetch("/api/profile/data", {
            method: "GET",
            headers,
            credentials: "include", // Include NextAuth session cookies for OAuth users
          }),
          fetch("/api/profile/stats", {
            method: "GET",
            headers,
            credentials: "include", // Include NextAuth session cookies for OAuth users
          }),
          fetch("/api/profile/achievements", {
            method: "GET",
            headers,
            credentials: "include", // Include NextAuth session cookies for OAuth users
          }),
          fetch("/api/profile/activity", {
            method: "GET",
            headers,
            credentials: "include", // Include NextAuth session cookies for OAuth users
          }),
        ]);

        // Handle profile data
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          // Use OAuth data if available, otherwise use profile data
          const displayName =
            profileData.fullName ||
            (user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`.trim()
              : "") ||
            "";

          const displayEmail = profileData.email || user.email || "";

          const displayProfilePicture =
            profileData.profilePicture ||
            user.profilePicture ||
            user.oauthAvatarUrl ||
            "";

          setProfileData({
            name: displayName,
            email: displayEmail,
            university: profileData.university || "",
            major: profileData.major || "",
            year: profileData.year || "",
            joinDate: profileData.createdAt
              ? new Date(profileData.createdAt).toLocaleDateString()
              : "Recently",
            profilePicture: displayProfilePicture,
            profilePictureProvider:
              profileData.profilePictureProvider ||
              user.profilePictureProvider ||
              "",
            programmingLanguages: profileData.programmingLanguages || {},
            learningGoals: profileData.learningGoals || [],
            experienceLevel: profileData.experienceLevel || "",
            institutionName: profileData.institutionName || "",
          });

          // Update AuthContext user object to sync with navigation
          if (user && displayProfilePicture) {
            setUser({
              ...user,
              profilePicture:
                profileData.profilePicture || user.profilePicture || null,
              profilePictureProvider:
                profileData.profilePictureProvider ||
                user.profilePictureProvider ||
                null,
              oauthAvatarUrl: user.oauthAvatarUrl || null,
            });
          }
        }

        // Handle stats data
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }

        // Handle achievements data
        if (achievementsResponse.ok) {
          const achievementsData = await achievementsResponse.json();
          setAchievements(achievementsData.achievements);
        }

        // Handle activity data
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          setActivities(activityData.activities);
          setActivityTimeline(activityData.timeline);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);

        // Fallback to user data from auth
        setProfileData((prev) => ({
          ...prev,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email || "",
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  // Helper function to format activity time
  const formatActivityTime = (time: string | Date): string => {
    const date = new Date(time);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Avatar upload functions
  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch("/api/profile/upload-avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const result = await response.json();

    // Update profile data with new avatar
    setProfileData((prev) => ({
      ...prev,
      profilePicture: result.data.url,
      profilePictureProvider: result.data.provider,
    }));

    // Update AuthContext user object to sync with navigation
    if (user) {
      setUser({
        ...user,
        profilePicture: result.data.url,
        profilePictureProvider: result.data.provider,
      });
    }

    // Refresh user data to ensure consistency
    await refreshUserData();

    setSuccess("Avatar updated successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleAvatarDelete = async () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch("/api/profile/upload-avatar", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Delete failed");
    }

    // Update profile data to remove avatar
    setProfileData((prev) => ({
      ...prev,
      profilePicture: "",
      profilePictureProvider: "",
    }));

    // Update AuthContext user object to sync with navigation
    if (user) {
      setUser({
        ...user,
        profilePicture: null,
        profilePictureProvider: null,
      });
    }

    // Refresh user data to ensure consistency
    await refreshUserData();

    setSuccess("Avatar removed successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header only if we have a JWT token (for manual login users)
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers,
        credentials: "include", // Include NextAuth session cookies for OAuth users
        body: JSON.stringify({
          fullName: profileData.name,
          email: profileData.email,
          university: profileData.university,
          major: profileData.major,
          year: profileData.year,
          programmingLanguages: profileData.programmingLanguages,
          experienceLevel: profileData.experienceLevel,
          learningGoals: profileData.learningGoals,
          institutionName: profileData.institutionName,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess("Profile updated successfully!");

        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);

        setIsEditing(false);
        setEditingField(null);

        // Update the profile data with the response
        setProfileData((prev) => ({
          ...prev,
          name: result.profile.fullName,
          email: result.profile.email,
          university: result.profile.university,
          major: result.profile.major,
          year: result.profile.year,
          programmingLanguages: result.profile.programmingLanguages,
          experienceLevel: result.profile.experienceLevel,
          learningGoals: result.profile.learningGoals,
          institutionName: result.profile.institutionName,
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile");

        // Auto-hide error message after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An error occurred while updating your profile");

      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingField(null);
    setError(null);
    setSuccess(null);
    // Reset to original data by refetching
    fetchProfileData();
  };

  const handleFieldEdit = (fieldName: string) => {
    setEditingField(fieldName);
    setIsEditing(true);
  };

  const handleFieldSave = async (fieldName: string) => {
    await handleSave();
    setEditingField(null);
  };

  const handleFieldCancel = (fieldName: string) => {
    setEditingField(null);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    // Reset to original data by refetching
    fetchProfileData();
  };

  // Helper function to refetch profile data
  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add Authorization header only if we have a JWT token (for manual login users)
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/profile/data", {
        method: "GET",
        headers,
        credentials: "include", // Include NextAuth session cookies for OAuth users
      });

      if (response.ok) {
        const data = await response.json();

        setProfileData({
          name:
            data.fullName ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          email: user.email || "",
          university: data.university || "",
          major: data.major || "",
          year: data.year || "",
          joinDate: data.createdAt
            ? new Date(data.createdAt).toLocaleDateString()
            : "Recently",
          profilePicture: data.profilePicture || "",
          profilePictureProvider: data.profilePictureProvider || "",
          programmingLanguages: data.programmingLanguages || {},
          learningGoals: data.learningGoals || [],
          experienceLevel: data.experienceLevel || "",
          institutionName: data.institutionName || "",
        });

        // Process OAuth avatar if needed
        if (data.oauthAvatarUrl && !data.profilePicture) {
          const token =
            localStorage.getItem("accessToken") ||
            sessionStorage.getItem("accessToken");
          if (token) {
            // Determine provider from email domain or other means
            const provider = data.email?.includes("@gmail.com")
              ? "google"
              : data.email?.includes("@github.com")
              ? "github"
              : "google";

            processOAuthAvatarIfNeeded(
              {
                profilePicture: data.profilePicture,
                oauthAvatarUrl: data.oauthAvatarUrl,
              },
              provider,
              token
            )
              .then((result) => {
                if (result?.success && result.data) {
                  // Update profile data with downloaded avatar
                  setProfileData((prev) => ({
                    ...prev,
                    profilePicture: result.data!.profilePicture,
                    profilePictureProvider: result.data!.profilePictureProvider,
                  }));
                  setSuccess("OAuth avatar downloaded successfully!");
                  setTimeout(() => setSuccess(null), 3000);
                }
              })
              .catch((error) => {
                console.error("Error processing OAuth avatar:", error);
              });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

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
                <AvatarUpload
                  currentAvatar={profileData.profilePicture}
                  currentName={profileData.name}
                  onUpload={handleAvatarUpload}
                  onDelete={handleAvatarDelete}
                  disabled={isLoading}
                />
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

              {/* Programming Languages & Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Programming Languages & Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(profileData.programmingLanguages).length ===
                  0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No programming languages added yet.</p>
                      <p className="text-sm">
                        Add your skills in the Settings tab!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(profileData.programmingLanguages).map(
                        ([language, experience]) => (
                          <div
                            key={language}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{language}</h4>
                              <p className="text-sm text-muted-foreground">
                                {String(experience)}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              Skill
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No recent activity yet.</p>
                      <p className="text-sm">
                        Start completing challenges and earning points!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity, index) => (
                        <div
                          key={activity.id || index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">
                              {activity.action}: {activity.item}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatActivityTime(activity.time)}
                            </p>
                          </div>
                          {activity.points !== 0 && (
                            <Badge
                              variant={
                                activity.points > 0 ? "default" : "secondary"
                              }
                            >
                              {activity.points > 0 ? "+" : ""}
                              {activity.points} pts
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {achievements.filter((a) => a.earned).length} of{" "}
                    {achievements.length} achievements earned
                  </p>
                </CardHeader>
                <CardContent>
                  {achievements.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No achievements available yet.</p>
                        <p className="text-sm">
                          Start completing tasks to unlock achievements!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            achievement.earned
                              ? "bg-green-50 border-green-200 hover:bg-green-100"
                              : "bg-muted/50 hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">
                              {achievement.icon}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {achievement.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {achievement.description}
                              </p>
                              {achievement.points && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {achievement.points} points
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            {achievement.earned ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Award className="w-3 h-3 mr-1" />
                                Earned
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-muted-foreground"
                              >
                                Not Earned
                              </Badge>
                            )}
                            {achievement.unlockedAt && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  achievement.unlockedAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Success/Error Messages */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

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
                        Edit All
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-primary to-blue-400"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {isSaving ? "Saving..." : "Save All"}
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="name">Full Name</Label>
                      {!isEditing && editingField !== "name" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFieldEdit("name")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          name: e.target.value,
                        })
                      }
                      disabled={!isEditing && editingField !== "name"}
                      placeholder="Enter your full name"
                    />
                    {editingField === "name" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave("name")}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldCancel("name")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email</Label>
                      {!isEditing && editingField !== "email" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFieldEdit("email")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      disabled={!isEditing && editingField !== "email"}
                      placeholder="Enter your email"
                    />
                    {editingField === "email" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave("email")}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldCancel("email")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* University Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="university">University</Label>
                      {!isEditing && editingField !== "university" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFieldEdit("university")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      id="university"
                      value={profileData.university}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          university: e.target.value,
                        })
                      }
                      disabled={!isEditing && editingField !== "university"}
                      placeholder="Enter your university"
                    />
                    {editingField === "university" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave("university")}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldCancel("university")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Major Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="major">Major</Label>
                      {!isEditing && editingField !== "major" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFieldEdit("major")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      id="major"
                      value={profileData.major}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          major: e.target.value,
                        })
                      }
                      disabled={!isEditing && editingField !== "major"}
                      placeholder="Enter your major"
                    />
                    {editingField === "major" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave("major")}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldCancel("major")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Year Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="year">Academic Year</Label>
                      {!isEditing && editingField !== "year" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFieldEdit("year")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      id="year"
                      value={profileData.year}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          year: e.target.value,
                        })
                      }
                      disabled={!isEditing && editingField !== "year"}
                      placeholder="e.g., Freshman, Sophomore, Junior, Senior"
                    />
                    {editingField === "year" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave("year")}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldCancel("year")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Institution Name Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="institution">Institution Name</Label>
                      {!isEditing && editingField !== "institution" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFieldEdit("institution")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      id="institution"
                      value={profileData.institutionName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          institutionName: e.target.value,
                        })
                      }
                      disabled={!isEditing && editingField !== "institution"}
                      placeholder="Enter your institution name"
                    />
                    {editingField === "institution" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleFieldSave("institution")}
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFieldCancel("institution")}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Programming Languages & Skills Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Programming Languages & Skills
                    {!isEditing && editingField !== "programmingLanguages" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFieldEdit("programmingLanguages")}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Skills
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingField === "programmingLanguages" || isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(profileData.programmingLanguages)
                          .length === 0 ? (
                          <div className="col-span-2 text-center py-8 text-muted-foreground">
                            <p>No programming languages added yet.</p>
                            <p className="text-sm">Add your skills below!</p>
                          </div>
                        ) : (
                          Object.entries(profileData.programmingLanguages).map(
                            ([language, experience]) => (
                              <div
                                key={language}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium">{language}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {String(experience)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = {
                                      ...profileData.programmingLanguages,
                                    } as Record<string, any>;
                                    delete updated[language];
                                    setProfileData({
                                      ...profileData,
                                      programmingLanguages: updated,
                                    });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            )
                          )
                        )}
                      </div>

                      <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="newLanguage">
                              Programming Language
                            </Label>
                            <Combobox
                              value={selectedLanguage}
                              onValueChange={(value) => {
                                setSelectedLanguage(value || "");
                              }}
                              options={programmingLanguages}
                              placeholder="Select or search language..."
                              searchPlaceholder="Search programming languages..."
                              emptyText="No language found."
                            />
                          </div>
                          <div>
                            <Label htmlFor="newExperience">
                              Experience Level
                            </Label>
                            <select
                              id="newExperience"
                              className="w-full p-2 border rounded-md bg-background"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const languageInput = document.getElementById(
                                    "newLanguage"
                                  ) as HTMLInputElement;
                                  const input = e.target as HTMLSelectElement;
                                  if (languageInput.value && input.value) {
                                    setProfileData({
                                      ...profileData,
                                      programmingLanguages: {
                                        ...profileData.programmingLanguages,
                                        [languageInput.value]: input.value,
                                      },
                                    });
                                    languageInput.value = "";
                                    input.value = "";
                                  }
                                }
                              }}
                            >
                              <option value="">Select experience level</option>
                              <option value="Beginner (0-1 years)">
                                Beginner (0-1 years)
                              </option>
                              <option value="Intermediate (1-3 years)">
                                Intermediate (1-3 years)
                              </option>
                              <option value="Advanced (3-5 years)">
                                Advanced (3-5 years)
                              </option>
                              <option value="Expert (5+ years)">
                                Expert (5+ years)
                              </option>
                            </select>
                          </div>
                        </div>
                        <Button
                          className="mt-4"
                          onClick={() => {
                            const experienceInput = document.getElementById(
                              "newExperience"
                            ) as HTMLSelectElement;
                            if (selectedLanguage && experienceInput.value) {
                              setProfileData({
                                ...profileData,
                                programmingLanguages: {
                                  ...profileData.programmingLanguages,
                                  [selectedLanguage]: experienceInput.value,
                                },
                              });
                              setSelectedLanguage("");
                              experienceInput.value = "";
                            }
                          }}
                        >
                          Add Language
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(profileData.programmingLanguages)
                        .length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No programming languages added yet.</p>
                          <p className="text-sm">
                            Click "Edit Skills" to add your programming
                            experience.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(profileData.programmingLanguages).map(
                            ([language, experience]) => (
                              <div
                                key={language}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1">
                                  <h4 className="font-medium">{language}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {String(experience)}
                                  </p>
                                </div>
                                <Badge variant="outline" className="ml-2">
                                  Skill
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {editingField === "programmingLanguages" && (
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleFieldSave("programmingLanguages")}
                        disabled={isSaving}
                      >
                        Save Skills
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleFieldCancel("programmingLanguages")
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {activityTimeline.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No educational activity yet.</p>
                      <p className="text-sm">
                        Start working on assignments, complete challenges, or
                        begin learning paths to see your progress here!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activityTimeline.map((day, index) => (
                        <div
                          key={index}
                          className="border-l-2 border-primary/20 pl-4"
                        >
                          <h4 className="font-semibold mb-2">{day.date}</h4>
                          <ul className="space-y-1">
                            {day.activities.map(
                              (activity: any, actIndex: number) => (
                                <li
                                  key={activity.id || actIndex}
                                  className="text-sm flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={`${getActivityColor(
                                        activity.type,
                                        activity.action
                                      )}`}
                                    >
                                      {getActivityIcon(
                                        activity.type,
                                        activity.action
                                      )}
                                    </div>
                                    <span className="text-muted-foreground">
                                      {activity.action}:{" "}
                                      <span className="font-medium">
                                        {activity.item}
                                      </span>
                                    </span>
                                  </div>
                                  {activity.points !== 0 && (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        activity.points > 0
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : "bg-red-50 text-red-700 border-red-200"
                                      }`}
                                    >
                                      {activity.points > 0 ? "+" : ""}
                                      {activity.points} pts
                                    </Badge>
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
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
