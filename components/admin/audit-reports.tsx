"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Download, TrendingUp, Users, Award, Clock } from "lucide-react"

interface AdminStats {
  totalApplications: number
  totalUsers: number
  totalCertifications: number
  averageProcessingTime: number
  submissionTrends: Array<{
    month: string
    submissions: number
    approved: number
    rejected: number
    pending: number
  }>
  industryDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  certificationLevels: Array<{
    level: string
    count: number
    percentage: number
  }>
  reviewerPerformance: Array<{
    name: string
    reviews: number
    avgTime: number
    accuracy: number
  }>
}

export function AuditReports() {
  const [dateRange, setDateRange] = useState<any>(null)
  const [reportType, setReportType] = useState("monthly")
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real data from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStats(data.data.stats)
          }
        } else {
          console.error('Failed to fetch admin stats')
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const generateReport = () => {
    // Generate and download comprehensive audit report
    console.log("Generating audit report...", { dateRange, reportType })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load audit data</p>
        </div>
      </div>
    )
  }

  const totalApps = typeof stats.totalApplications === 'number' ? stats.totalApplications : 0
  const totalCerts = typeof stats.totalCertifications === 'number' ? stats.totalCertifications : 0
  const avgProcDays = typeof stats.averageProcessingTime === 'number' ? stats.averageProcessingTime : 0
  const successRate = totalApps > 0 ? Math.round((totalCerts / totalApps) * 100) : 0
  const trends = Array.isArray(stats.submissionTrends) ? stats.submissionTrends : []
  const industries = Array.isArray(stats.industryDistribution) ? stats.industryDistribution : []
  const levels = Array.isArray(stats.certificationLevels) ? stats.certificationLevels : []
  const reviewers = Array.isArray(stats.reviewerPerformance) ? stats.reviewerPerformance : []

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport}>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{totalApps}</p>
                <p className="text-xs text-secondary flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{typeof stats.totalUsers === 'number' ? stats.totalUsers : 0}</p>
                <p className="text-xs text-secondary flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8% from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certifications</p>
                <p className="text-2xl font-bold">{totalCerts}</p>
                <p className="text-xs text-secondary flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  {successRate}% success rate
                </p>
              </div>
              <Award className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                <p className="text-2xl font-bold">{avgProcDays.toFixed(1)}d</p>
                <p className="text-xs text-secondary flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Target: 5 days
                </p>
              </div>
              <Clock className="w-8 h-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submissions" stroke="#007bff" strokeWidth={2} />
                <Line type="monotone" dataKey="approved" stroke="#28a745" strokeWidth={2} />
                <Line type="monotone" dataKey="rejected" stroke="#dc3545" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Industry Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={industries}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {industries.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Certification Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Certification Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reviewer Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Reviewer Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reviews" fill="#007bff" />
                <Bar dataKey="accuracy" fill="#28a745" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
