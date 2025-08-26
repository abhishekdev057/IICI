"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useData } from "@/contexts/data-context";
import {
  Settings,
  Bell,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export function InstitutionSettings() {
  const { state, saveApplication } = useData();
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    assessmentReminders: true,
    certificationExpiry: true,
    systemUpdates: false,
  });
  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    publicProfile: false,
    analyticsTracking: true,
  });

  const application = state.currentApplication;

  const handleExportData = async () => {
    if (!application) return;

    const exportData = {
      institution: application.institutionData,
      assessment: application.pillarData,
      scores: application.scores,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iiici-data-${application.institutionData?.name
      ?.replace(/\s+/g, "-")
      .toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = async () => {
    // In a real app, this would call an API to delete the data
    localStorage.removeItem("iiici_application");
    window.location.href = "/";
  };

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-updates">Email Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your certification status
              </p>
            </div>
            <Switch
              id="email-updates"
              checked={notifications.emailUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailUpdates: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="assessment-reminders">Assessment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming assessment deadlines
              </p>
            </div>
            <Switch
              id="assessment-reminders"
              checked={notifications.assessmentReminders}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  assessmentReminders: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="certification-expiry">Certification Expiry</Label>
              <p className="text-sm text-muted-foreground">
                Notifications before your certification expires
              </p>
            </div>
            <Switch
              id="certification-expiry"
              checked={notifications.certificationExpiry}
              onCheckedChange={(checked) =>
                setNotifications({
                  ...notifications,
                  certificationExpiry: checked,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system-updates">System Updates</Label>
              <p className="text-sm text-muted-foreground">
                Updates about new features and system changes
              </p>
            </div>
            <Switch
              id="system-updates"
              checked={notifications.systemUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, systemUpdates: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-sharing">Data Sharing</Label>
              <p className="text-sm text-muted-foreground">
                Allow anonymized data to be used for research
              </p>
            </div>
            <Switch
              id="data-sharing"
              checked={privacy.dataSharing}
              onCheckedChange={(checked) =>
                setPrivacy({ ...privacy, dataSharing: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-profile">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your certification status publicly visible
              </p>
            </div>
            <Switch
              id="public-profile"
              checked={privacy.publicProfile}
              onCheckedChange={(checked) =>
                setPrivacy({ ...privacy, publicProfile: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics-tracking">Analytics Tracking</Label>
              <p className="text-sm text-muted-foreground">
                Help improve the platform with usage analytics
              </p>
            </div>
            <Switch
              id="analytics-tracking"
              checked={privacy.analyticsTracking}
              onCheckedChange={(checked) =>
                setPrivacy({ ...privacy, analyticsTracking: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Export Data</Label>
              <p className="text-sm text-muted-foreground">
                Download all your institution and assessment data
              </p>
            </div>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Data Backup</Label>
              <p className="text-sm text-muted-foreground">
                Last backup:{" "}
                {new Date(
                  application?.lastSaved || Date.now()
                ).toLocaleDateString()}
              </p>
            </div>
            <Button variant="outline" onClick={saveApplication}>
              Backup Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Delete All Data</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your institution and all assessment data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your institution data, assessment results, and all
                    associated information.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteData}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Application Status */}
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    application?.status === "submitted"
                      ? "default"
                      : "secondary"
                  }
                >
                  {application?.status || "draft"}
                </Badge>
                {application?.scores && (
                  <Badge variant="outline">
                    Score: {Math.round(application.scores.overallScore)}%
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated:{" "}
                {new Date(
                  application?.lastSaved || Date.now()
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
