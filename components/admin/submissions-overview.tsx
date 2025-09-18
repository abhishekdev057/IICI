"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  Building2,
  TrendingUp
} from "lucide-react"

interface Submission {
  id: string
  organizationName: string
  industry: string
  submittedDate: string
  status: string
  overallScore?: number
  certificationLevel?: string
  reviewerId?: string
  reviewerName?: string
  priority: string
}

interface SubmissionsOverviewProps {
  onViewSubmission: (submissionId: string) => void
}

export function SubmissionsOverview({ onViewSubmission }: SubmissionsOverviewProps) {
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN'
  const [admins, setAdmins] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [selectedReviewerByApp, setSelectedReviewerByApp] = useState<Record<string, string>>({})

  // Fetch real data from API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/applications')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Transform database data to match component interface
            const transformedSubmissions = data.data.map((app: any) => ({
              id: app.id,
              organizationName: app.institutionData?.name || 'Unknown Organization',
              industry: app.institutionData?.industry || 'Unknown Industry',
              submittedDate: app.submittedAt ? new Date(app.submittedAt).toISOString().split('T')[0] : 'Not submitted',
              status: app.status.toLowerCase(),
              overallScore: app.scores?.overallScore,
              certificationLevel: app.scores?.certificationLevel,
              reviewerId: app.reviewedBy,
              reviewerName: app.reviewer?.name || 'Unassigned',
              priority: app.status === 'SUBMITTED' ? 'high' : 
                       app.status === 'UNDER_REVIEW' ? 'medium' : 'low'
            }))
            setSubmissions(transformedSubmissions)
          }
        } else {
          console.error('Failed to fetch submissions')
        }
      } catch (error) {
        console.error('Error fetching submissions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
    // Load admins list for assignment (super admin only)
    const fetchAdmins = async () => {
      try {
        if (!isSuperAdmin) return
        const res = await fetch('/api/admin/users')
        if (res.ok) {
          const json = await res.json()
          const onlyAdmins = (json.users || [])
            .filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
            .map((u: any) => ({ id: u.id, name: u.name || u.email, email: u.email }))
          setAdmins(onlyAdmins)
        }
      } catch {}
    }
    fetchAdmins()
  }, [])

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.industry.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter
    const matchesIndustry = industryFilter === "all" || submission.industry === industryFilter
    
    return matchesSearch && matchesStatus && matchesIndustry
  })

  const assignToMe = async (id: string) => {
    try {
      setAssigningId(id)
      const res = await fetch(`/api/admin/applications/${id}/assign`, { method: 'PATCH' })
      if (res.ok) {
        // Refresh list
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: 'under_review', reviewerName: session?.user?.name || 'Me' } : s))
      }
      setAssigningId(null)
    } catch (e) {
      console.error('Failed to assign', e)
      setAssigningId(null)
    }
  }

  const assignToReviewer = async (appId: string, reviewerId: string) => {
    try {
      setAssigningId(appId)
      const res = await fetch(`/api/admin/applications/${appId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId })
      })
      if (res.ok) {
        const admin = admins.find(a => a.id === reviewerId)
        setSubmissions(prev => prev.map(s => s.id === appId ? { ...s, status: 'under_review', reviewerName: admin?.name || 'Assigned' } : s))
      }
      setAssigningId(null)
    } catch (e) {
      console.error('Failed to assign to reviewer', e)
      setAssigningId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4 text-accent" />
      case "under_review":
        return <AlertCircle className="w-4 h-4 text-primary" />
      case "approved":
        return <CheckCircle className="w-4 h-4 text-secondary" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-destructive" />
      case "pending_evidence":
        return <AlertCircle className="w-4 h-4 text-accent" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline">Submitted</Badge>
      case "under_review":
        return <Badge className="bg-primary">Under Review</Badge>
      case "approved":
        return <Badge className="bg-secondary">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "pending_evidence":
        return <Badge className="bg-accent">Pending Evidence</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        )
      case "medium":
        return <Badge className="bg-accent text-xs">Medium</Badge>
      case "low":
        return (
          <Badge variant="outline" className="text-xs">
            Low
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Submissions Overview</h2>
          <div className="animate-pulse bg-muted h-8 w-32 rounded"></div>
        </div>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Submissions Overview</h2>
          <p className="text-muted-foreground">
            Manage and review certification applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredSubmissions.length} submissions</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending_evidence">Pending Evidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {loading ? "Loading submissions..." : "No submissions found"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{submission.organizationName}</div>
                          <div className="text-sm text-muted-foreground">
                            {submission.reviewerName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{submission.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(submission.status)}
                        {getStatusBadge(submission.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.overallScore ? (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{Math.round(submission.overallScore)}%</span>
                          {submission.certificationLevel && (
                            <Badge variant="secondary" className="text-xs">
                              {submission.certificationLevel}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{submission.submittedDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(submission.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isSuperAdmin && (
                          <>
                            <Select
                              value={selectedReviewerByApp[submission.id] || ''}
                              onValueChange={(val) => setSelectedReviewerByApp(prev => ({ ...prev, [submission.id]: val }))}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Assign to admin" />
                              </SelectTrigger>
                              <SelectContent>
                                {admins.map(a => (
                                  <SelectItem key={a.id} value={a.id}>{a.name} ({a.email})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!selectedReviewerByApp[submission.id] || assigningId === submission.id}
                              onClick={() => assignToReviewer(submission.id, selectedReviewerByApp[submission.id])}
                            >
                              {assigningId === submission.id ? 'Assigning...' : 'Assign'}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => assignToMe(submission.id)}>
                              Assign to me
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewSubmission(submission.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
