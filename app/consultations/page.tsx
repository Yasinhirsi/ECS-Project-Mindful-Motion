"use client"
//Indicates this is a client-side component in Next.js.
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, addDays, parseISO, startOfDay, isBefore } from "date-fns"
//Imports necessary React hooks, UI components, and utility functions.


// Define types for better type safety
type User = {
  id: string
  name: string
  email: string
  user_type: "patient" | "therapist"
}

type TherapistProfile = {
  id: string
  user_id: string | User
  qualifications: string
}

type Availability = {
  id: string
  therapist_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

type Consultation = {
  id: string
  patient_id: string
  therapist_id: string | null
  status: "requested" | "accepted" | "completed" | "cancelled"
  scheduled_at: string | null
  meeting_link: string | null
  notes: string | null
  created_at: string
  patient?: User
  therapist?: TherapistProfile
}

//Defines the data structures used in the application.

export default function ConsultationsPage() {
  const [userType, setUserType] = useState<"patient" | "therapist" | null>(null)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [availableTherapists, setAvailableTherapists] = useState<TherapistProfile[]>([])
  const [therapistAvailability, setTherapistAvailability] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingTime, setBookingTime] = useState("")
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null)
  const [meetingLink, setMeetingLink] = useState("")
  const [isAccepting, setIsAccepting] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const supabase = getSupabaseClient()

  // Sets up various state variables to manage the component's data and UI state.
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          window.location.href = "/"
          return
        }

        setUserId(session.user.id)

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()

        if (userError || !userData) {
          throw userError || new Error("User not found")
        }

        setUserType(userData.user_type as "patient" | "therapist")

        // Fetch consultations
        if (userData.user_type === "patient") {
          const { data: consultationsData, error: consultationsError } = await supabase
            .from("consultations")
            .select(`
              *,
              therapist:therapist_id (
                id,
                user_id (
                  id,
                  name,
                  email
                ),
                qualifications
              )
            `)
            .eq("patient_id", session.user.id)
            .order("created_at", { ascending: false })

          if (consultationsError) {
            throw consultationsError
          }

          setConsultations(consultationsData || [])

          // Fetch available therapists with their availability
          const { data: therapistsData, error: therapistsError } = await supabase
            .from("therapist_profiles")
            .select(`
              id,
              user_id (
                id,
                name,
                email
              ),
              qualifications
            `)

          if (therapistsError) {
            throw therapistsError
          }

          setAvailableTherapists(
            (therapistsData || []).filter(
              t => typeof t.user_id === "object" && t.user_id !== null
            )
          )
          // setAvailableTherapists(therapistsData || [])

          // We'll fetch therapist availability only when a therapist is selected

        } else {
          // Therapist view
          const { data: therapistProfile, error: therapistError } = await supabase
            .from("therapist_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single()

          if (therapistError || !therapistProfile) {
            throw therapistError || new Error("Therapist profile not found")
          }

          // Get consultations where this therapist is assigned or requests are pending
          const { data: assignedConsultations, error: assignedError } = await supabase
            .from("consultations")
            .select(`
              *,
              patient:patient_id (
                id,
                name,
                email
              )
            `)
            .eq("therapist_id", therapistProfile.id)
            .order("created_at", { ascending: false })

          if (assignedError) {
            throw assignedError
          }

          // Get pending consultation requests (where no therapist is assigned yet)
          const { data: pendingConsultations, error: pendingError } = await supabase
            .from("consultations")
            .select(`
              *,
              patient:patient_id (
                id,
                name,
                email
              )
            `)
            .is("therapist_id", null)
            .eq("status", "requested")
            .order("created_at", { ascending: false })

          if (pendingError) {
            throw pendingError
          }

          // Combine the assigned consultations with the pending ones
          setConsultations([...(assignedConsultations || []), ...(pendingConsultations || [])])
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: "Failed to load consultations. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  // Fetches availability slots for a selected therapist
  const fetchTherapistAvailability = async (therapistId: string) => {
    if (!therapistId || therapistId === "any") {
      setTherapistAvailability([])
      return
    }

    setIsLoadingAvailability(true)
    try {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("therapist_id", therapistId)

      if (error) {
        throw error
      }

      console.log("Fetched availability for therapist", { therapistId, availabilityCount: data?.length })
      setTherapistAvailability(data || [])
    } catch (error) {
      console.error("Error fetching therapist availability:", error)
      toast({
        title: "Error",
        description: "Failed to load therapist availability. Please try again.",
        variant: "destructive",
      })
      setTherapistAvailability([])
    } finally {
      setIsLoadingAvailability(false)
    }
  }

  // Handle therapist selection
  const handleTherapistChange = (value: string) => {
    console.log("Therapist selected:", value)
    setSelectedTherapist(value)
    setBookingTime("") // Reset time when therapist changes

    // Fetch the selected therapist's availability
    if (value && value !== "any") {
      fetchTherapistAvailability(value)
    } else {
      setTherapistAvailability([])
    }
  }

  // Update function to get available times for a therapist on a specific date
  const updateAvailableTimes = (therapistId: string, date: string) => {
    if (!therapistId || therapistId === "any" || !date || therapistAvailability.length === 0) {
      setAvailableTimes([])
      return
    }

    try {
      const selectedDate = parseISO(date)
      const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.

      console.log("Finding available times for", { therapistId, date, dayOfWeek })

      // Filter availability slots for the selected therapist and day of week
      const therapistSlots = therapistAvailability.filter(
        slot => slot.day_of_week === dayOfWeek
      )

      console.log("Found therapist slots", { therapistSlots })

      if (therapistSlots.length === 0) {
        console.log("No availability slots found for this day")
        setAvailableTimes([])
        return
      }

      // Convert available time slots to options
      const timeSlots = therapistSlots.map(slot => {
        // Extract hours and minutes from time string (e.g., "09:00:00")
        const [startHour, startMinute] = slot.start_time.split(':').map(Number)
        const [endHour, endMinute] = slot.end_time.split(':').map(Number)

        console.log("Processing slot", { startHour, startMinute, endHour, endMinute })

        // Create 30-minute interval time slots
        const slots = []
        let currentHour = startHour
        let currentMinute = startMinute

        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
          const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
          if (timeStr && timeStr.trim() !== '') {
            slots.push(timeStr)
          }

          // Increment by 30 minutes
          currentMinute += 30
          if (currentMinute >= 60) {
            currentHour += 1
            currentMinute = 0
          }
        }

        console.log("Generated time slots", { slots })
        return slots
      }).flat()

      // Safety check - remove any invalid or empty values
      const validTimeSlots = timeSlots.filter(time => time && typeof time === 'string' && time.trim() !== '')

      if (validTimeSlots.length === 0) {
        console.log("No valid time slots generated")
        setAvailableTimes([])
        return
      }

      // Filter out times that have already been booked
      const finalTimeSlots = [...new Set(validTimeSlots)].sort()
      console.log("Final available time slots", { finalTimeSlots })

      setAvailableTimes(finalTimeSlots)

      // Reset selected time if it's no longer available
      if (bookingTime && !finalTimeSlots.includes(bookingTime)) {
        console.log("Resetting booking time as it's no longer available", { bookingTime })
        setBookingTime("")
      }
    } catch (error) {
      console.error("Error updating available times:", error)
      setAvailableTimes([])
    }
  }

  // Update available times when therapist or date changes
  useEffect(() => {
    if (selectedTherapist && selectedTherapist !== "any" && bookingDate) {
      console.log("Updating available times", { selectedTherapist, bookingDate, therapistAvailability })
      updateAvailableTimes(selectedTherapist, bookingDate)
    } else {
      setAvailableTimes([])
    }
  }, [selectedTherapist, bookingDate, therapistAvailability])

  const handleOpenBookingDialog = () => {
    // Set default date to tomorrow
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd")
    setBookingDate(tomorrow)
    setBookingTime("")
    setSelectedTherapist(null)
    setTherapistAvailability([])
    setShowBookingDialog(true)
  }
  // Books a new consultation
  const handleBookConsultation = async () => {
    try {
      if (!userId || !bookingDate) {
        toast({
          title: "Error",
          description: "Please select a date for your consultation.",
          variant: "destructive",
        })
        return
      }

      if (selectedTherapist && selectedTherapist !== "any" && !bookingTime) {
        toast({
          title: "Error",
          description: "Please select a time for your consultation.",
          variant: "destructive",
        })
        return
      }

      setIsBooking(true)

      // Create a consultation request
      const consultationData: Partial<Consultation> = {
        patient_id: userId,
        status: "requested",
        scheduled_at: `${bookingDate}T${bookingTime ? `${bookingTime}:00.000Z` : '12:00:00.000Z'}`,
        notes: `Requested for ${bookingDate}${bookingTime ? ' at ' + bookingTime : ''}`
      }

      // If a specific therapist is selected, assign the request to them
      if (selectedTherapist && selectedTherapist !== "any") {
        consultationData.therapist_id = selectedTherapist
      }

      console.log("Creating consultation with data:", consultationData)

      const { data, error } = await supabase
        .from("consultations")
        .insert(consultationData)
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Consultation Requested",
        description: selectedTherapist && selectedTherapist !== "any"
          ? "Your consultation request has been sent to the selected therapist."
          : "Your consultation request has been sent to available therapists.",
      })

      // Refresh consultations
      const { data: consultationsData, error: consultationsError } = await supabase
        .from("consultations")
        .select(`
          *,
          therapist:therapist_id (
            id,
            user_id (
              id,
              name,
              email
            ),
            qualifications
          )
        `)
        .eq("patient_id", userId)
        .order("created_at", { ascending: false })

      if (consultationsError) {
        throw consultationsError
      }

      setConsultations(consultationsData || [])
      setShowBookingDialog(false)
    } catch (error) {
      console.error("Error booking consultation:", error)
      toast({
        title: "Error",
        description: "Failed to book consultation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  const handleOpenAcceptDialog = (consultationId: string) => {
    setSelectedConsultationId(consultationId)
    setMeetingLink("")
    setShowAcceptDialog(true)
  }

  const handleAcceptConsultation = async () => { // Accepts a consultation request
    try {
      if (!userId || !selectedConsultationId) {
        toast({
          title: "Error",
          description: "User session not found or consultation not selected. Please try again.",
          variant: "destructive",
        })
        return
      }

      if (!meetingLink || !meetingLink.trim()) {
        toast({
          title: "Error",
          description: "Please provide a meeting link.",
          variant: "destructive",
        })
        return
      }

      setIsAccepting(true)

      const { data: therapistProfile, error: therapistError } = await supabase
        .from("therapist_profiles")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (therapistError || !therapistProfile) {
        throw therapistError || new Error("Therapist profile not found")
      }

      // Get the consultation details
      const { data: consultation, error: consultationError } = await supabase
        .from("consultations")
        .select("*")
        .eq("id", selectedConsultationId)
        .single()

      if (consultationError || !consultation) {
        throw consultationError || new Error("Consultation not found")
      }

      // Calculate scheduled_at from requested_date and requested_time
      let scheduledAt = null
      if (consultation.scheduled_at) {
        scheduledAt = consultation.scheduled_at
      } else {
        // Fallback to scheduling for tomorrow if no specific time requested
        scheduledAt = addDays(new Date(), 1).toISOString()
      }

      // Update the consultation
      const { error } = await supabase
        .from("consultations")
        .update({
          therapist_id: therapistProfile.id,
          status: "accepted",
          scheduled_at: scheduledAt,
          meeting_link: meetingLink,
        })
        .eq("id", selectedConsultationId)

      if (error) {
        throw error
      }

      toast({
        title: "Consultation Accepted",
        description: "You have accepted the consultation request.",
      })

      // Refresh consultations
      const { data: assignedConsultations, error: assignedError } = await supabase
        .from("consultations")
        .select(`
          *,
          patient:patient_id (
            id,
            name,
            email
          )
        `)
        .eq("therapist_id", therapistProfile.id)
        .order("created_at", { ascending: false })

      if (assignedError) {
        throw assignedError
      }

      // Get pending consultation requests (where no therapist is assigned yet)
      const { data: pendingConsultations, error: pendingError } = await supabase
        .from("consultations")
        .select(`
          *,
          patient:patient_id (
            id,
            name,
            email
          )
        `)
        .is("therapist_id", null)
        .eq("status", "requested")
        .order("created_at", { ascending: false })

      if (pendingError) {
        throw pendingError
      }

      // Combine the assigned consultations with the pending ones
      setConsultations([...(assignedConsultations || []), ...(pendingConsultations || [])])
      setShowAcceptDialog(false)
    } catch (error) {
      console.error("Error accepting consultation:", error)
      toast({
        title: "Error",
        description: "Failed to accept consultation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleCompleteConsultation = async (consultationId: string) => { // Marks a consultation as completed
    try {
      const { error } = await supabase
        .from("consultations")
        .update({
          status: "completed",
        })
        .eq("id", consultationId)

      if (error) {
        throw error
      }

      toast({
        title: "Consultation Completed",
        description: "The consultation has been marked as completed.",
      })

      // Refresh consultations
      if (userType === "patient" && userId) {
        const { data: consultationsData, error: consultationsError } = await supabase
          .from("consultations")
          .select(`
            *,
            therapist:therapist_id (
              id,
              user_id (
                id,
                name,
                email
              ),
              qualifications
            )
          `)
          .eq("patient_id", userId)
          .order("created_at", { ascending: false })

        if (consultationsError) {
          throw consultationsError
        }

        setConsultations(consultationsData || [])
      } else if (userType === "therapist" && userId) {
        const { data: therapistProfile } = await supabase
          .from("therapist_profiles")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (therapistProfile) {
          const { data: assignedConsultations } = await supabase
            .from("consultations")
            .select(`
              *,
              patient:patient_id (
                id,
                name,
                email
              )
            `)
            .eq("therapist_id", therapistProfile.id)
            .order("created_at", { ascending: false })

          const { data: pendingConsultations } = await supabase
            .from("consultations")
            .select(`
              *,
              patient:patient_id (
                id,
                name,
                email
              )
            `)
            .is("therapist_id", null)
            .eq("status", "requested")
            .order("created_at", { ascending: false })

          setConsultations([...(assignedConsultations || []), ...(pendingConsultations || [])])
        }
      }
    } catch (error) {
      console.error("Error completing consultation:", error)
      toast({
        title: "Error",
        description: "Failed to complete consultation. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Consultations</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const isMeetingActive = (consultation: Consultation) => {   // Checks if a meeting is currently active
    if (!consultation.scheduled_at) return false
    const now = new Date()
    const scheduledTime = new Date(consultation.scheduled_at)
    // Meeting is active 5 minutes before scheduled time until 1 hour after
    const meetingStart = new Date(scheduledTime.getTime() - 5 * 60 * 1000)
    const meetingEnd = new Date(scheduledTime.getTime() + 60 * 60 * 1000)
    return now >= meetingStart && now <= meetingEnd
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Consultations</h2>
        {userType === "patient" && (
          <Button onClick={handleOpenBookingDialog}>Book Consultation</Button>
        )}
      </div>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book a Consultation</DialogTitle>
            <DialogDescription>
              Select a date, time, and optionally a specific therapist for your consultation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="therapist">Therapist (Optional)</Label>
              <Select value={selectedTherapist || undefined} onValueChange={handleTherapistChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a therapist or leave open to any available therapist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Available Therapist</SelectItem>
                  {availableTherapists.map((therapist) => {
                    console.log("Rendering therapist", { id: therapist.id, hasValue: !!therapist.id })
                    return (
                      <SelectItem key={therapist.id} value={therapist.id}>
                        {typeof therapist.user_id === 'object' ? therapist.user_id.name : 'Unknown Therapist'}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={format(addDays(new Date(), 1), "yyyy-MM-dd")} // Can only book from tomorrow onwards
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Select
                value={bookingTime || undefined}
                onValueChange={setBookingTime}
                disabled={!selectedTherapist || selectedTherapist === "any" || !bookingDate || availableTimes.length === 0 || isLoadingAvailability}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedTherapist || selectedTherapist === "any"
                      ? "Select a specific therapist first"
                      : !bookingDate
                        ? "Select a date first"
                        : isLoadingAvailability
                          ? "Loading available times..."
                          : availableTimes.length === 0
                            ? "No available times for selected date"
                            : "Select a time"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingAvailability ? (
                    <div className="text-center py-2 text-sm text-muted-foreground">Loading available times...</div>
                  ) : availableTimes.length > 0 ? (
                    availableTimes.map((time) => {
                      console.log("Rendering time SelectItem", { time, hasValue: !!time })
                      return (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      )
                    })
                  ) : (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      {selectedTherapist && selectedTherapist !== "any" && bookingDate
                        ? "No available times for this date"
                        : "Select a therapist and date first"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {selectedTherapist && selectedTherapist !== "any" && bookingDate && !isLoadingAvailability && availableTimes.length === 0 && (
                <p className="text-sm text-destructive">No available times for this date. Please select another date.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBookConsultation} disabled={isBooking || !bookingDate || (!!selectedTherapist && !bookingTime)}>
              {isBooking ? "Booking..." : "Book Consultation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Accept Consultation</DialogTitle>
            <DialogDescription>
              Provide a meeting link for this consultation. The patient will use this link to join the meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                placeholder="https://zoom.us/j/123456789 or other meeting platform link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Paste a link from Zoom, Google Meet, Microsoft Teams, or other video conferencing platform.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAcceptConsultation} disabled={isAccepting || !meetingLink.trim()}>
              {isAccepting ? "Accepting..." : "Accept Consultation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {consultations.length > 0 ? (
            consultations.map((consultation) => (
              <Card key={consultation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {userType === "patient"
                          ? consultation.therapist
                            ? `Consultation with ${typeof consultation.therapist.user_id === 'object' ? consultation.therapist.user_id.name : 'Unknown'}`
                            : "Consultation Request"
                          : consultation.patient
                            ? `Consultation with ${consultation.patient.name || "Unknown"}`
                            : "Consultation Request"}
                      </CardTitle>
                      <CardDescription>
                        Status: <span className="capitalize">{consultation.status}</span>
                        {consultation.scheduled_at && consultation.status === "requested" && (
                          <span className="ml-2">
                            (Requested for {format(parseISO(consultation.scheduled_at), "MMM d, yyyy 'at' h:mm a")})
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(consultation.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {consultation.status === "accepted" && (
                    <div className="space-y-2">
                      {consultation.scheduled_at && (
                        <p className="text-sm">
                          <strong>Scheduled for:</strong> {format(parseISO(consultation.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {consultation.meeting_link && (
                        <p className="text-sm">
                          <strong>Meeting Link:</strong>{" "}
                          <a
                            href={consultation.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${isMeetingActive(consultation) ? "text-green-600 font-medium" : "text-primary"} hover:underline`}
                          >
                            {isMeetingActive(consultation) ? "Join Meeting Now" : "Join Meeting"}
                          </a>
                          {isMeetingActive(consultation) && (
                            <span className="ml-2 text-green-600 text-xs font-medium px-2 py-0.5 bg-green-100 rounded-full">
                              Active Now
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  {consultation.status === "requested" && userType === "therapist" && consultation.patient && (
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Patient:</strong> {consultation.patient?.name || "Unknown"}
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {consultation.patient?.email || "Unknown"}
                      </p>
                      {consultation.scheduled_at && (
                        <p className="text-sm">
                          <strong>Requested Time:</strong> {format(parseISO(consultation.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {consultation.notes && (
                        <p className="text-sm">
                          <strong>Notes:</strong> {consultation.notes}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
                {consultation.status === "requested" && userType === "therapist" && (
                  <CardFooter>
                    <Button onClick={() => handleOpenAcceptDialog(consultation.id)}>Accept Consultation</Button>
                  </CardFooter>
                )}
                {consultation.status === "accepted" && (
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => handleCompleteConsultation(consultation.id)}
                    >
                      Mark as Completed
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">No consultations yet. Book a consultation to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="requested" className="space-y-4">
          {consultations.filter((c) => c.status === "requested").length > 0 ? (
            consultations
              .filter((c) => c.status === "requested")
              .map((consultation) => (
                <Card key={consultation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {userType === "patient"
                            ? "Consultation Request"
                            : `Consultation Request from ${consultation.patient?.name || "Unknown"}`}
                        </CardTitle>
                        <CardDescription>
                          Status: <span className="capitalize">{consultation.status}</span>
                          {consultation.scheduled_at && (
                            <span className="ml-2">
                              (Requested for {format(parseISO(consultation.scheduled_at), "MMM d, yyyy 'at' h:mm a")})
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(consultation.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userType === "therapist" && consultation.patient && (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Patient:</strong> {consultation.patient?.name || "Unknown"}
                        </p>
                        <p className="text-sm">
                          <strong>Email:</strong> {consultation.patient?.email || "Unknown"}
                        </p>
                        {consultation.scheduled_at && (
                          <p className="text-sm">
                            <strong>Requested Time:</strong> {format(parseISO(consultation.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                        {consultation.notes && (
                          <p className="text-sm">
                            <strong>Notes:</strong> {consultation.notes}
                          </p>
                        )}
                      </div>
                    )}
                    {userType === "patient" && (
                      <p className="text-sm">Your consultation request is pending. A therapist will accept it soon.</p>
                    )}
                  </CardContent>
                  {userType === "therapist" && (
                    <CardFooter>
                      <Button onClick={() => handleOpenAcceptDialog(consultation.id)}>Accept Consultation</Button>
                    </CardFooter>
                  )}
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">No requested consultations.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="accepted" className="space-y-4">
          {consultations.filter((c) => c.status === "accepted").length > 0 ? (
            consultations
              .filter((c) => c.status === "accepted")
              .map((consultation) => (
                <Card key={consultation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {userType === "patient"
                            ? consultation.therapist
                              ? `Consultation with ${typeof consultation.therapist.user_id === 'object' ? consultation.therapist.user_id.name : 'Unknown'}`
                              : "Consultation"
                            : consultation.patient
                              ? `Consultation with ${consultation.patient?.name || "Unknown"}`
                              : "Consultation"}
                        </CardTitle>
                        <CardDescription>
                          Status: <span className="capitalize">{consultation.status}</span>
                        </CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(consultation.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {consultation.scheduled_at && (
                        <p className="text-sm">
                          <strong>Scheduled for:</strong> {format(parseISO(consultation.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                      {consultation.meeting_link && (
                        <p className="text-sm">
                          <strong>Meeting Link:</strong>{" "}
                          <a
                            href={consultation.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${isMeetingActive(consultation) ? "text-green-600 font-medium" : "text-primary"} hover:underline`}
                          >
                            {isMeetingActive(consultation) ? "Join Meeting Now" : "Join Meeting"}
                          </a>
                          {isMeetingActive(consultation) && (
                            <span className="ml-2 text-green-600 text-xs font-medium px-2 py-0.5 bg-green-100 rounded-full">
                              Active Now
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => handleCompleteConsultation(consultation.id)}
                    >
                      Mark as Completed
                    </Button>
                  </CardFooter>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">No accepted consultations.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {consultations.filter((c) => c.status === "completed").length > 0 ? (
            consultations
              .filter((c) => c.status === "completed")
              .map((consultation) => (
                <Card key={consultation.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>
                          {userType === "patient"
                            ? consultation.therapist
                              ? `Consultation with ${typeof consultation.therapist.user_id === 'object' ? consultation.therapist.user_id.name : 'Unknown'}`
                              : "Consultation"
                            : consultation.patient
                              ? `Consultation with ${consultation.patient?.name || "Unknown"}`
                              : "Consultation"}
                        </CardTitle>
                        <CardDescription>
                          Status: <span className="capitalize">{consultation.status}</span>
                        </CardDescription>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(consultation.created_at), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {consultation.scheduled_at && (
                        <p className="text-sm">
                          <strong>Completed on:</strong> {format(parseISO(consultation.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">No completed consultations.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      {userType === "patient" && availableTherapists.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Therapists</CardTitle>
            <CardDescription>These therapists are available for consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableTherapists.map((therapist) => (
                <Card key={therapist.id}>
                  <CardHeader>
                    <CardTitle>
                      {typeof therapist.user_id === 'object' ? therapist.user_id.name : 'Unknown Therapist'}
                    </CardTitle>
                    <CardDescription>
                      {typeof therapist.user_id === 'object' ? therapist.user_id.email : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      <strong>Qualifications:</strong> {therapist.qualifications}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTherapist(therapist.id)
                        const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd")
                        setBookingDate(tomorrow)
                        setShowBookingDialog(true)
                        // Fetch availability for the selected therapist
                        fetchTherapistAvailability(therapist.id)
                      }}
                      className="w-full"
                    >
                      Book with this Therapist
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
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
