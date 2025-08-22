import type React from "react"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { getCurrentUser } from "../../lib/utils/auth"
import { redirect } from "next/navigation"


//Defines an async layout component that wraps dashboard pages
//Takes children as a prop, which represents the content of individual dashboard pages
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // If there's no user, redirect to the homepage
  if (!user) {
    redirect("/")  // This will handle the redirect correctly
    return null  // Ensure that nothing renders if the redirect occurs
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Displays the users name as a header */}
      <DashboardHeader user={user} />
      {/* Renders the content of the dashboard page */}
      <div className="flex-1 container px-4 py-6 md:py-8 mx-auto">{children}</div>
      <footer className="bg-primary text-white py-6">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; {new Date().getFullYear()} Mindful Motion. All rights reserved.</p>
            {/* <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-white hover:text-white/80">
                Privacy Policy
              </a>
              <a href="#" className="text-white hover:text-white/80">
                Terms of Service
              </a>
              <a href="#" className="text-white hover:text-white/80">
                Contact Us
              </a>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  )
}
