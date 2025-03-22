import type { Metadata } from "next"
import { TimerDashboard } from "@/components/timer-dashboard"

export const metadata: Metadata = {
  title: "TimeTrack - Employee Time Tracking",
  description: "Track your work hours efficiently",
}

export default function HomePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <TimerDashboard />
    </div>
  )
}

