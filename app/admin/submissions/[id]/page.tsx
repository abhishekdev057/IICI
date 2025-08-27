"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function AdminSubmissionDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [app, setApp] = useState<any>(null);

  const id = params?.id as string;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth?callbackUrl=/admin");
      return;
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      router.push("/");
      return;
    }
    const fetchApp = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/applications/${id}`);
        if (!res.ok) throw new Error("Failed to fetch application");
        const json = await res.json();
        setApp(json.data);
      } catch (e: any) {
        setError(e.message || "Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchApp();
  }, [id, session, status, router]);

  const updateStatus = async (status: "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PENDING_EVIDENCE") => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/admin/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, message }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const json = await res.json();
      setApp((prev: any) => ({ ...(prev || {}), status: json.data?.status, reviewedAt: json.data?.reviewedAt }));
      if (status === "APPROVED") setMessage("");
    } catch (e: any) {
      setError(e.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="outline" className="mb-4" onClick={() => router.push("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
          </Button>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>Application not found.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const institution = app.institutionData || {};
  const pillarData = app.pillarData || {};

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review Application</h1>
            <p className="text-muted-foreground">Application ID: {app.id}</p>
          </div>
          <Badge variant="outline">{app.status}</Badge>
        </div>

        {/* Institution Details */}
        <Card>
          <CardHeader>
            <CardTitle>Institution</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="text-muted-foreground text-sm">Name</span><div className="font-medium">{institution.name || '-'}</div></div>
            <div><span className="text-muted-foreground text-sm">Industry</span><div className="font-medium">{institution.industry || '-'}</div></div>
            <div><span className="text-muted-foreground text-sm">Size</span><div className="font-medium">{institution.organizationSize || '-'}</div></div>
            <div><span className="text-muted-foreground text-sm">Country</span><div className="font-medium">{institution.country || '-'}</div></div>
            <div><span className="text-muted-foreground text-sm">Email</span><div className="font-medium">{institution.contactEmail || '-'}</div></div>
            {institution.website && (<div><span className="text-muted-foreground text-sm">Website</span><div className="font-medium">{institution.website}</div></div>)}
          </CardContent>
        </Card>

        {/* Pillars */}
        <Card>
          <CardHeader>
            <CardTitle>Pillars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1,2,3,4,5,6].map((p) => {
              const pk = `pillar_${p}`;
              const pdata = pillarData[pk] || {};
              const indicators = pdata.indicators || {};
              return (
                <div key={pk} className="border rounded p-3">
                  <div className="font-semibold mb-2">Pillar {p}</div>
                  {Object.keys(indicators).length === 0 ? (
                    <div className="text-sm text-muted-foreground">No responses</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(indicators).map(([iid, val]: any) => (
                        <div key={iid} className="text-sm">
                          <div className="text-muted-foreground">Indicator {iid}</div>
                          <div className="font-medium">{String(val)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <Textarea
              placeholder="Optional message to user (e.g., reason for rejection or evidence request)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={saving} onClick={() => updateStatus("PENDING_EVIDENCE")}>Request Evidence</Button>
              <Button variant="destructive" disabled={saving} onClick={() => updateStatus("REJECTED")}>Reject</Button>
              <Button className="bg-green-600 hover:bg-green-700" disabled={saving} onClick={() => updateStatus("APPROVED")}>
                <CheckCircle className="w-4 h-4 mr-1" /> Approve
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => router.push("/admin")}>Back to Admin</Button>
        </div>
      </div>
    </div>
  );
}


