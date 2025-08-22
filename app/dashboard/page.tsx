import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "../../lib/utils/auth"
import { createServerComponentClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
//Imports necessary components and utilities for the dashboard.

export default async function DashboardPage() { //Defines the main dashboard page component 
  try {
    const user = await getCurrentUser() //checks for authenticated user 

    if (!user) { //redirect to home if no user is found
      console.log("No user found in dashboard, redirecting to home")
      redirect("/")
    }

    const supabase = await createServerComponentClient()

    // Fetch recent emotion analyses
    const { data: recentEmotions } = await supabase
      .from("emotion_analysis")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Fetch upcoming consultations
    const { data: upcomingConsultations } = await supabase
      .from("consultations")
      .select(`
        *,
        therapist:therapist_id (
          id,
          user_id (
            name
          )
        )
      `)
      .eq(user.user_type === "patient" ? "patient_id" : "therapist_id", user.id)
      .eq("status", "accepted")
      .gt("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5)

    // Fetch recent fitness activities
    const { data: recentActivities } = await supabase
      .from("fitness_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    return (
      <div className="space-y-8">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h2>
        </div> */}

        {/* Welcome Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white p-6 md:p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {user.name}! {/* Personaised welcome message*/}
              </h2>
              <p className="mb-4 max-w-md text-white/90">
                Track your wellness journey, connect with therapists, and monitor your progress — all in one place.
              </p>
              <Link href={user.user_type === "patient" ? "/daily-checkin" : "/patients"}>
                <Button className="rounded-full bg-white text-primary hover:bg-white/90 transition">
                  {user.user_type === "patient" ? "Start Daily Check-in" : "View Patients"}
                </Button>
              </Link>
            </div>

            {/* Optional: motivational emoji block or quote */}
            <div className="hidden md:flex flex-col items-end text-right text-sm text-white/80 italic">
              <p>“Every step forward is a step toward healing.”</p>
              <span className="text-3xl mt-2">🌿</span>
            </div>
          </div>
        </div>


        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                {user.user_type === "patient" ? "Consultations" : "Patients"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-primary">{upcomingConsultations?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.user_type === "patient" ? "Upcoming consultations" : "Active patients"}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Emotion Analyses</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-primary">{recentEmotions?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Recent emotion analyses</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Activities</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-primary">{recentActivities?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Recent fitness activities</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-secondary/30 pb-2">
              <CardTitle className="text-sm font-medium text-primary">
                {user.user_type === "patient" ? "Daily Check-ins" : "Availability"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-primary">{user.user_type === "patient" ? "7" : "14"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.user_type === "patient" ? "Last 7 days" : "Available hours per week"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Quick Actions */}
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-secondary/30">
              <CardTitle className="text-primary">Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to do</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <Link href={user.user_type === "patient" ? "/daily-checkin" : "/patients"}>
                  <Button className="w-full rounded-full bg-primary text-white hover:bg-primary/90">
                    {user.user_type === "patient" ? "Daily Check-in" : "View Patients"}
                  </Button>
                </Link>
                <Link href="/consultations">
                  <Button className="w-full rounded-full bg-secondary text-primary hover:bg-secondary/90">
                    {user.user_type === "patient" ? "Book Consultation" : "Manage Consultations"}
                  </Button>
                </Link>
                <Link href={user.user_type === "patient" ? "/emotion-analysis" : "/availability"}>
                  <Button className="w-full rounded-full bg-secondary text-primary hover:bg-secondary/90">
                    {user.user_type === "patient" ? "Emotion Analysis" : "Set Availability"}
                  </Button>
                </Link>
                <Link href={user.user_type === "patient" ? "/fitness" : "/profile"}>
                  <Button className="w-full rounded-full bg-primary text-white hover:bg-primary/90">
                    {user.user_type === "patient" ? "Fitness Tracking" : "Update Profile"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Consultations */}
          <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-secondary/30">
              <CardTitle className="text-primary">
                {user.user_type === "patient" ? "Upcoming Consultations" : "Recent Patients"}
              </CardTitle>
              <CardDescription>
                {user.user_type === "patient"
                  ? "Your scheduled consultations with therapists"
                  : "Patients with upcoming consultations"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {upcomingConsultations && upcomingConsultations.length > 0 ? (
                <div className="space-y-4">
                  {upcomingConsultations.map((consultation) => (
                    <div key={consultation.id} className="flex items-center border-b pb-4 last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-primary">
                          {user.user_type === "patient"
                            ? `Dr. ${consultation.therapist?.user_id?.name || "Unknown"}`
                            : "Patient Name"}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(consultation.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {consultation.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    {user.user_type === "patient"
                      ? "No upcoming consultations. Book a consultation to get started."
                      : "No upcoming consultations with patients."}
                  </p>
                  <Link href="/consultations" className="mt-4 inline-block">
                    <Button className="rounded-full bg-primary text-white hover:bg-primary/90">
                      {user.user_type === "patient" ? "Book Consultation" : "View All Consultations"}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resources Section */}
        <div className="curved-section">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary">Wellness Resources</h2>
            <p className="text-muted-foreground">Helpful information to support your mental and physical wellbeing</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-2">Mental Health Tips</h3>
              <p className="text-muted-foreground">
                Discover practical strategies to improve your mental wellbeing and manage stress effectively.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-2">Fitness Guides</h3>
              <p className="text-muted-foreground">
                Explore exercise routines and wellness activities to boost your physical health.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold text-primary mb-2">Support Network</h3>
              <p className="text-muted-foreground">
                Connect with others on similar wellness journeys and build your support community.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in DashboardPage:", error)

    // Initialize empty variables to avoid TypeScript errors
    const user = null;
    const upcomingConsultations = [];
    const recentEmotions = [];
    const recentActivities = [];

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-primary">Dashboard</h2>
        </div>

        {/* Welcome Banner */}
        <div className="rounded-2xl bg-primary text-white p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Session expired</h2>
              <p className="mb-4">
                Your session has expired or you are not logged in. Please login to access your dashboard.
              </p>
              <Link href="/">
                <Button className="rounded-full bg-white text-primary hover:bg-white/90">
                  Login
                </Button>
              </Link>
            </div>
            <div className="hidden md:flex justify-end">
              <img
                src="/placeholder.svg?height=200&width=300"
                alt="Wellness illustration"
                className="rounded-xl"
                width={300}
                height={200}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
