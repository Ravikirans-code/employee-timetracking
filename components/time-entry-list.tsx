"use client"

import { format, parseISO } from "date-fns"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TimeEntry } from "@/types"

interface TimeEntryListProps {
  entries: TimeEntry[]
  showActions?: boolean
  onDelete?: (id: string) => void
}

export function TimeEntryList({ entries, showActions = false, onDelete }: TimeEntryListProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${hours}h ${minutes}m`
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" role="status" aria-live="polite">
        No time entries yet
      </div>
    )
  }

  // For small screens, render a card-based layout
  const renderMobileView = () => (
    <div className="space-y-4 md:hidden">
      {entries.map((entry) => (
        <div key={entry.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <div className="font-medium">{entry.projectName}</div>
            <div className="text-sm text-muted-foreground">{format(parseISO(entry.startTime), "MMM dd, yyyy")}</div>
          </div>
          <div className="text-sm">
            {entry.description || <span className="text-muted-foreground italic">No description</span>}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">{formatDuration(entry.duration)}</div>
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(entry.id)}
                aria-label={`Delete entry for ${entry.projectName}`}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  // For larger screens, render the table
  const renderTableView = () => (
    <div className="overflow-x-auto hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Duration</TableHead>
            {showActions && <TableHead className="w-[80px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{format(parseISO(entry.startTime), "MMM dd, yyyy")}</TableCell>
              <TableCell>{entry.projectName}</TableCell>
              <TableCell>
                {entry.description || <span className="text-muted-foreground italic">No description</span>}
              </TableCell>
              <TableCell>{formatDuration(entry.duration)}</TableCell>
              {showActions && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(entry.id)}
                    aria-label={`Delete entry for ${entry.projectName}`}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div>
      {renderMobileView()}
      {renderTableView()}
    </div>
  )
}

