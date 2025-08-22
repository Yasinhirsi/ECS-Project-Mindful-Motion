import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthForm } from "@/components/auth/auth-form"
import { getCurrentUser } from "@/lib/utils/auth"
import { redirect } from "next/navigation"
//imports needed for home page 

export default async function Home() {
  try {
    const user = await getCurrentUser() //check if user is logged in 

    if (user) {
      redirect("/dashboard") //if user is logged in, redirect to dashboard  
    }
  } catch (error) {
    console.error("Error in Home component:", error)
    // Continue rendering the home page even if there's an error with auth
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4 bg-primary">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Mindful Motion</h1>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  It's time to prioritise your mental wellbeing
                </h1>
                <p className="text-lg md:text-xl/relaxed max-w-[700px] mx-auto">
                  Track your physical fitness, monitor your mental health, and connect with professional therapists all
                  in one platform.
                </p>
              </div>
              <Link href="#auth-form">
                <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 px-8 text-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary">How can we support you?</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Our platform offers comprehensive tools to help you maintain both your mental and physical wellbeing.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-muted p-8 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <h3 className="text-xl font-bold text-primary mb-4">Mental Health Check-in</h3>
                <p className="text-muted-foreground mb-6">
                  Express your feelings daily and receive personalised recommendations based on your emotional state.
                </p>
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
              </div>
              <div className="bg-muted p-8 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <h3 className="text-xl font-bold text-primary mb-4">Therapist Consultations</h3>
                <p className="text-muted-foreground mb-6">
                  Connect with qualified therapists through secure video consultations from the comfort of your home.
                </p>
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                  </svg>
                </div>
              </div>
              <div className="bg-muted p-8 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <h3 className="text-xl font-bold text-primary mb-4">Fitness Tracking</h3>
                <p className="text-muted-foreground mb-6">
                  Monitor your physical activities, set goals, and track your progress to improve your overall
                  wellbeing.
                </p>
                <div className="flex justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="m18 20 3-3m-3-3 3 3m-3 3-3-3m3 3v-6" />
                    <path d="M6 20V4" />
                    <path d="M12 13V4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary/30 mb-4"
              >
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
              </svg>
              <h2 className="text-2xl font-bold text-primary mb-6">
                "If it wasn't for this platform I wouldn't be here now. I will never forget the support I received in my
                recovery."
              </h2>
              <div className="flex items-center">
                <img src="/placeholder.svg?height=60&width=60" alt="User" className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <p className="font-bold text-primary">Sarah</p>
                  <p className="text-sm text-muted-foreground">Platform user</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Auth Form */}
        <section id="auth-form" className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-primary">Join our community</h2>
                <p className="text-muted-foreground mt-2">
                  Create an account to access all our features and start your wellness journey today.
                </p>
              </div>
              <div className="bg-muted p-8 rounded-2xl shadow-sm">
                <AuthForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-8">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-sm opacity-80">&copy; {new Date().getFullYear()} Mindful Motion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
