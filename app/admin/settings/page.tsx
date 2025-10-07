"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Shield,
  Zap,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
} from "lucide-react";

interface PlatformSettings {
  general: {
    platformName: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    aiAssistanceEnabled: boolean;
  };
  points: {
    dailyLimit: number;
    earningMultiplier: number;
    spendingMultiplier: number;
    fraudDetectionThreshold: number;
  };
  integrity: {
    honorCodeRequired: boolean;
    transparencyRequired: boolean;
    violationThreshold: number;
    autoFlagging: boolean;
  };
  content: {
    autoApprovalThreshold: number;
    qualityScoreThreshold: number;
    moderationQueueSize: number;
  };
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings/platform");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error loading platform settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings/platform", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setHasChanges(false);
        // Show success message
      }
    } catch (error) {
      console.error("Error saving platform settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      loadSettings();
      setHasChanges(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    if (!settings) return;

    const newSettings = { ...settings };
    const keys = path.split(".");
    let current = newSettings as any;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading platform settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load platform settings. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Platform Settings
          </h1>
          <p className="text-gray-600">
            Configure platform-wide settings and policies.
          </p>
        </div>

        {/* Save Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-yellow-600">
                Unsaved Changes
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="integrity">Integrity</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic platform configuration and feature toggles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={settings.general.platformName}
                      onChange={(e) =>
                        updateSetting("general.platformName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">
                        Temporarily disable platform access for maintenance
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.general.maintenanceMode}
                      onCheckedChange={(checked) =>
                        updateSetting("general.maintenanceMode", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registrationEnabled">
                        User Registration
                      </Label>
                      <p className="text-sm text-gray-600">
                        Allow new users to register accounts
                      </p>
                    </div>
                    <Switch
                      id="registrationEnabled"
                      checked={settings.general.registrationEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("general.registrationEnabled", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="aiAssistanceEnabled">AI Assistance</Label>
                      <p className="text-sm text-gray-600">
                        Enable AI assistance features for students
                      </p>
                    </div>
                    <Switch
                      id="aiAssistanceEnabled"
                      checked={settings.general.aiAssistanceEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting("general.aiAssistanceEnabled", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Points Settings Tab */}
          <TabsContent value="points" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Points System
                </CardTitle>
                <CardDescription>
                  Configure the points economy and fraud detection.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dailyLimit">Daily Point Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={settings.points.dailyLimit}
                      onChange={(e) =>
                        updateSetting(
                          "points.dailyLimit",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Maximum points a user can earn per day
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="earningMultiplier">
                      Earning Multiplier
                    </Label>
                    <Input
                      id="earningMultiplier"
                      type="number"
                      step="0.1"
                      value={settings.points.earningMultiplier}
                      onChange={(e) =>
                        updateSetting(
                          "points.earningMultiplier",
                          parseFloat(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Multiplier for point earning activities
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="spendingMultiplier">
                      Spending Multiplier
                    </Label>
                    <Input
                      id="spendingMultiplier"
                      type="number"
                      step="0.1"
                      value={settings.points.spendingMultiplier}
                      onChange={(e) =>
                        updateSetting(
                          "points.spendingMultiplier",
                          parseFloat(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Multiplier for point spending activities
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="fraudDetectionThreshold">
                      Fraud Detection Threshold
                    </Label>
                    <Input
                      id="fraudDetectionThreshold"
                      type="number"
                      value={settings.points.fraudDetectionThreshold}
                      onChange={(e) =>
                        updateSetting(
                          "points.fraudDetectionThreshold",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Risk score threshold for fraud detection (0-100)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrity Settings Tab */}
          <TabsContent value="integrity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Academic Integrity
                </CardTitle>
                <CardDescription>
                  Configure academic integrity policies and enforcement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="honorCodeRequired">
                        Honor Code Required
                      </Label>
                      <p className="text-sm text-gray-600">
                        Require students to sign the honor code before using AI
                        assistance
                      </p>
                    </div>
                    <Switch
                      id="honorCodeRequired"
                      checked={settings.integrity.honorCodeRequired}
                      onCheckedChange={(checked) =>
                        updateSetting("integrity.honorCodeRequired", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="transparencyRequired">
                        Transparency Required
                      </Label>
                      <p className="text-sm text-gray-600">
                        Require transparency reports for AI assistance usage
                      </p>
                    </div>
                    <Switch
                      id="transparencyRequired"
                      checked={settings.integrity.transparencyRequired}
                      onCheckedChange={(checked) =>
                        updateSetting("integrity.transparencyRequired", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoFlagging">Auto-Flagging</Label>
                      <p className="text-sm text-gray-600">
                        Automatically flag users with suspicious activity
                        patterns
                      </p>
                    </div>
                    <Switch
                      id="autoFlagging"
                      checked={settings.integrity.autoFlagging}
                      onCheckedChange={(checked) =>
                        updateSetting("integrity.autoFlagging", checked)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="violationThreshold">
                      Violation Threshold
                    </Label>
                    <Input
                      id="violationThreshold"
                      type="number"
                      value={settings.integrity.violationThreshold}
                      onChange={(e) =>
                        updateSetting(
                          "integrity.violationThreshold",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Number of violations before automatic action
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Management
                </CardTitle>
                <CardDescription>
                  Configure content approval and quality thresholds.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="autoApprovalThreshold">
                      Auto-Approval Threshold
                    </Label>
                    <Input
                      id="autoApprovalThreshold"
                      type="number"
                      value={settings.content.autoApprovalThreshold}
                      onChange={(e) =>
                        updateSetting(
                          "content.autoApprovalThreshold",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Quality score threshold for automatic approval (0-100)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="qualityScoreThreshold">
                      Quality Score Threshold
                    </Label>
                    <Input
                      id="qualityScoreThreshold"
                      type="number"
                      value={settings.content.qualityScoreThreshold}
                      onChange={(e) =>
                        updateSetting(
                          "content.qualityScoreThreshold",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Minimum quality score for content approval (0-100)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="moderationQueueSize">
                      Moderation Queue Size
                    </Label>
                    <Input
                      id="moderationQueueSize"
                      type="number"
                      value={settings.content.moderationQueueSize}
                      onChange={(e) =>
                        updateSetting(
                          "content.moderationQueueSize",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Maximum items in moderation queue
                    </p>
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
