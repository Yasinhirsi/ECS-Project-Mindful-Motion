"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface MainNavProps {
  userType: "patient" | "therapist" | null
}

export function MainNav({ userType }: MainNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseClient()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const patientLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      href: "/emotion-analysis",
      label: "Emotion Analysis",
    },
    {
      href: "/consultations",
      label: "Consultations",
    },
    {
      href: "/fitness",
      label: "Fitness",
    },
    {
      href: "/daily-checkin",
      label: "Daily Check-in",
    },
  ]

  const therapistLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      href: "/patients",
      label: "Patients",
    },
    {
      href: "/consultations",
      label: "Consultations",
    },
    {
      href: "/availability",
      label: "Availability",
    },
  ]

  const links = userType === "patient" ? patientLinks : userType === "therapist" ? therapistLinks : []

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:text-white/80 hover:bg-primary/20">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <SheetHeader>
              <SheetTitle className="text-left">Mindful Motion</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col space-y-4 mt-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* {userType && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    handleSignOut()
                    setOpen(false)
                  }}
                >
                  Sign Out
                </Button>
              )} */}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-white/80",
              pathname === link.href ? "text-white" : "text-white/70",
            )}
          >
            {link.label}
          </Link>
        ))}
        {/* {userType && (
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white/20 hover:text-white"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        )} */}
      </div>
    </>
  )
}