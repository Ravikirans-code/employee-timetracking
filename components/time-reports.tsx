"use client"

import { useState } from "react"
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TimeEntry, Project } from "@/types"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TimeReportsProps {
  entries: TimeEntry[]
  projects: Project[]
}

export function TimeReports({ entries, projects }: TimeReportsProps) {
  const [reportType, setReportType] = useState("weekly")

  if (entries.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No data available for reports</div>
  }

  // Get current week dates
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday as week start
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Prepare weekly data
  const weeklyData = weekDays.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd")
    const dayEntries = entries.filter((entry) => entry.date === dayStr)
    const totalSeconds = dayEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const hours = Math.round((totalSeconds / 3600) * 10) / 10 // Round to 1 decimal

    return {
      day: format(day, "EEE"),
      hours,
      date: dayStr,
    }
  })

  // Prepare project data
  const projectData = projects
    .map((project) => {
      const projectEntries = entries.filter((entry) => entry.projectId === project.id)
      const totalSeconds = projectEntries.reduce((sum, entry) => sum + entry.duration, 0)
      const hours = Math.round((totalSeconds / 3600) * 10) / 10 // Round to 1 decimal

      return {
        name: project.name,
        hours,
        id: project.id,
      }
    })
    .filter((item) => item.hours > 0)

  // Calculate total hours this week
  const totalHoursThisWeek = weeklyData.reduce((sum, day) => sum + day.hours, 0)

  // Colors for the charts
  const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ec4899"]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium">Time Analysis</h3>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Select report type">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly Overview</SelectItem>
            <SelectItem value="projects">By Project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reportType === "weekly" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Weekly Hours</CardTitle>
              <CardDescription>
                {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VisuallyHidden>
                <h4>Weekly hours chart</h4>
                <p>{weeklyData.map((day) => `${day.day}: ${day.hours} hours. `)}</p>
              </VisuallyHidden>
              <div className="h-[250px] sm:h-[300px]" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      formatter={(value) => [`${value} hours`, "Time"]}
                      labelFormatter={(label) => {
                        const dayData = weeklyData.find((d) => d.day === label)
                        return dayData ? format(parseISO(dayData.date), "EEEE, MMM dd") : label
                      }}
                    />
                    <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Total hours this week:{" "}
                  <span className="font-medium text-foreground">{totalHoursThisWeek.toFixed(1)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "projects" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Time by Project</CardTitle>
              <CardDescription>Distribution of hours across projects</CardDescription>
            </CardHeader>
            <CardContent>
              <VisuallyHidden>
                <h4>Project distribution chart</h4>
                <ul>
                  {projectData.map((project) => (
                    <li key={project.id}>
                      {project.name}: {project.hours} hours
                    </li>
                  ))}
                </ul>
              </VisuallyHidden>
              <div className="h-[250px] sm:h-[300px]" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="hours"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {projectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hours`, "Time"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Add a table for screen readers and better accessibility */}
              <div className="mt-6 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectData.map((project, index) => {
                      const totalHours = projectData.reduce((sum, p) => sum + p.hours, 0)
                      const percentage = totalHours > 0 ? ((project.hours / totalHours) * 100).toFixed(1) : "0"

                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: colors[index % colors.length] }}
                                aria-hidden="true"
                              />
                              {project.name}
                            </div>
                          </TableCell>
                          <TableCell>{project.hours}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

