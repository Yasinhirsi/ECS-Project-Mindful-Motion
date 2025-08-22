"use client"
//Defines a function to remove cookies by setting them with an empty value and zero max age.

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
//These imports bring in necessary React hooks, UI components, and utility functions for the page

// Define types for better type safety
//Defines the structure of an availability slot in the system.
type Availability = {
  id: string
  therapist_id: string
  day_of_week: number
  start_time: string
  end_time: string
  created_at: string
}

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [therapistId, setTherapistId] = useState<string | null>(null)
  const [dayOfWeek, setDayOfWeek] = useState("0")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isTherapist, setIsTherapist] = useState(false)
  const [activeConsultations, setActiveConsultations] = useState<number>(0)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const supabase = getSupabaseClient()
  // Sets up various state variables to manage the component's data and UI state.



  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Pre-defined time slots for quick selection
  const commonTimeSlots = [
    { label: "Morning (9AM-12PM)", start: "09:00", end: "12:00" },
    { label: "Afternoon (1PM-5PM)", start: "13:00", end: "17:00" },
    { label: "Evening (6PM-9PM)", start: "18:00", end: "21:00" },
    { label: "Custom", start: "", end: "" }
  ]
  // Defines arrays for day names and common time slots for quick selection.

  // Fetches the users session and checks if they are a therapist.
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          window.location.href = "/"
          return
        }

        // Check if user is a therapist
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", session.user.id) //checks if id in database matches the user's id
          .single()

        if (userError || !userData) {
          throw userError || new Error("User not found")
        }

        if (userData.user_type !== "therapist") {
          setIsTherapist(false)
          setIsLoading(false)
          return
        }

        setIsTherapist(true)

        // Get therapist profile
        const { data: therapistProfile, error: therapistError } = await supabase
          .from("therapist_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (therapistError || !therapistProfile) {
          throw therapistError || new Error("Therapist profile not found")
        }

        setTherapistId(therapistProfile.id)

        // Get availability
        const { data: availabilityData, error: availabilityError } = await supabase
          .from("availability")
          .select("*")
          .eq("therapist_id", therapistProfile.id)
          .order("day_of_week", { ascending: true })
          .order("start_time", { ascending: true })

        if (availabilityError) {
          throw availabilityError
        }

        setAvailability(availabilityData || [])

        // Check if there are active consultations
        if (therapistProfile) {
          const { count, error: countError } = await supabase
            .from("consultations")
            .select("id", { count: 'exact', head: true })
            .eq("therapist_id", therapistProfile.id)
            .in("status", ["requested", "accepted"])

          if (!countError) {
            setActiveConsultations(count || 0)
          }
        }
      } catch (error) {
        console.error("Error fetching availability:", error)
        toast({
          title: "Error",
          description: "Failed to load availability. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailability()
  }, [supabase])

  const handleAddAvailability = async () => {
    // Validates input
    // Checks for overlapping time slots
    // Adds new availability to the database
    // Updates the UI
    try {
      if (!therapistId || !dayOfWeek || !startTime || !endTime) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Validate time range
      if (startTime >= endTime) {
        toast({
          title: "Error",
          description: "End time must be after start time.",
          variant: "destructive",
        })
        return
      }

      // Check for overlapping time slots
      const dayAvailability = availability.filter(
        (a) => a.day_of_week === Number.parseInt(dayOfWeek)
      )

      const isOverlapping = dayAvailability.some((slot) => {
        // Check if the new slot overlaps with an existing slot
        return (startTime < slot.end_time && endTime > slot.start_time)
      })

      if (isOverlapping) {
        toast({
          title: "Error",
          description: "This time slot overlaps with an existing availability. Please choose a different time.",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("availability")
        .insert({
          therapist_id: therapistId,
          day_of_week: Number.parseInt(dayOfWeek),
          start_time: startTime,
          end_time: endTime,
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Availability Added",
        description: "Your availability has been added successfully.",
      })

      // Refresh availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from("availability")
        .select("*")
        .eq("therapist_id", therapistId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true })

      if (availabilityError) {
        throw availabilityError
      }

      setAvailability(availabilityData || [])

      // Reset form
      setDayOfWeek("0")
      setStartTime("")
      setEndTime("")
    } catch (error) {
      console.error("Error adding availability:", error)
      toast({
        title: "Error",
        description: "Failed to add availability. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAvailability = async (id: string) => {
    // Checks for pending consultations
    // Deletes the availability slot
    // Updates the UI
    try {
      // Check if there are pending consultations for this time slot
      const { data: consultations, error: consultationError } = await supabase
        .from("consultations")
        .select("id")
        .eq("therapist_id", therapistId)
        .eq("status", "requested")

      if (consultationError) {
        throw consultationError
      }

      if (consultations && consultations.length > 0) {
        toast({
          title: "Warning",
          description: "You have pending consultation requests. Please handle them before modifying your availability.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("availability").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Availability Deleted",
        description: "Your availability has been deleted successfully.",
      })

      // Refresh availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from("availability")
        .select("*")
        .eq("therapist_id", therapistId)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true })

      if (availabilityError) {
        throw availabilityError
      }

      setAvailability(availabilityData || [])
    } catch (error) {
      console.error("Error deleting availability:", error)
      toast({
        title: "Error",
        description: "Failed to delete availability. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle quick time slot selection
  const handleQuickTimeSlot = (start: string, end: string) => {
    if (start && end) {
      setStartTime(start)
      setEndTime(end)
    }
  }

  // Validate and format time input
  const validateTimeInput = (time: string, setter: (value: string) => void) => {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

    if (time === "" || timeRegex.test(time)) {
      // Add seconds to make it compatible with database format
      const formattedTime = time ? `${time}:00` : ""
      setter(formattedTime)
    } else {
      toast({
        title: "Invalid Time Format",
        description: "Please use HH:MM format (e.g., 09:00, 14:30)",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isTherapist) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
        </div>
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">
              Only therapists can set their availability.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTimeDisplay = (time: string) => {
    // Convert 24-hour format (e.g., "14:30:00") to 12-hour format with AM/PM
    const [hours, minutes] = time.split(":").map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
      </div>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle>Availability Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Available Days:</p>
              <p className="text-sm text-muted-foreground">
                {availability
                  .map(a => a.day_of_week)
                  .filter((value, index, self) => self.indexOf(value) === index)
                  .sort()
                  .map(day => dayNames[day])
                  .join(', ') || 'None set yet'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Active Consultations:</p>
              <p className="text-sm text-muted-foreground">
                {activeConsultations} {activeConsultations === 1 ? 'consultation' : 'consultations'} pending or scheduled
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add Availability</CardTitle>
          <CardDescription>Set your available time slots for consultations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="day-of-week">Day of Week</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime ? startTime.substring(0, 5) : ""}
                  onChange={(e) => validateTimeInput(e.target.value, setStartTime)}
                />
                <p className="text-xs text-muted-foreground">Set your start time in 30-minute increments (e.g., 9:00, 9:30)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime ? endTime.substring(0, 5) : ""}
                  onChange={(e) => validateTimeInput(e.target.value, setEndTime)}
                />
                <p className="text-xs text-muted-foreground">Set your end time in 30-minute increments (e.g., 17:00, 17:30)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Time Slots</Label>
              <div className="flex flex-wrap gap-2">
                {commonTimeSlots.map((slot) => (
                  <Button
                    key={slot.label}
                    variant={slot.start === "" ? "outline" : "secondary"}
                    size="sm"
                    onClick={() => handleQuickTimeSlot(slot.start, slot.end)}
                    className={slot.start === startTime && slot.end === endTime ? "border-2 border-primary" : ""}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddAvailability}>Add Availability</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Current Availability</CardTitle>
          <CardDescription>Your current available time slots</CardDescription>
        </CardHeader>
        <CardContent>
          {availability.length > 0 ? (
            <div className="space-y-4">
              {dayNames.map((day, dayIndex) => {
                const dayAvailability = availability.filter((a) => a.day_of_week === dayIndex)

                if (dayAvailability.length === 0) return null

                return (
                  <div key={dayIndex} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{day}</h3>
                    <div className="space-y-2">
                      {dayAvailability.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span>
                            {formatTimeDisplay(slot.start_time)} - {formatTimeDisplay(slot.end_time)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAvailability(slot.id)}
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No availability set. Add your available time slots to receive consultation requests.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Availability Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Set availability in 30-minute increments to allow for proper scheduling</li>
            <li>Patients can only book consultations during your available time slots</li>
            <li>Make sure to keep your availability up to date to avoid scheduling conflicts</li>
            <li>You'll receive requests for appointments that match your availability</li>
            <li>You can accept or decline consultation requests in the Consultations page</li>
          </ul>
        </CardContent>
      </Card>
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Reset Password</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Enter your email address and we'll send you a password reset link.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setResetLoading(true);
                const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                  redirectTo: `${window.location.origin}/reset-password`
                });
                setResetLoading(false);
                if (error) {
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Check your email",
                    description: "A password reset link has been sent.",
                  });
                  setShowForgotPassword(false);
                  setResetEmail("");
                }
              }}
              className="space-y-4"
            >
              <Input
                type="email"
                placeholder="Your email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={resetLoading}>
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
