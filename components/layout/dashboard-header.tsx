import { MainNav } from "@/components/layout/main-nav"
import { UserNav } from "@/components/layout/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"

interface DashboardHeaderProps {
  user: {
    name: string
    email: string
    user_type: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto">
        <div className="flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold">Mindful Motion</h1>
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <MainNav userType={user.user_type as "patient" | "therapist"} />
            <ModeToggle />
            <UserNav user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}