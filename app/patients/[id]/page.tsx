"use client"
//Client side component in next.js
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { useParams, useRouter } from "next/navigation"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getSupabaseClient } from "@/lib/supabase/client"
//imports needed for patient page 

export default function PatientDetailPage() {
  const [patient, setPatient] = useState<any>(null)
  const [consultations, setConsultations] = useState<any[]>([])
  const [emotionAnalyses, setEmotionAnalyses] = useState<any[]>([])
  const [dailyCheckins, setDailyCheckins] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const supabase = getSupabaseClient()
  //state variables for patient page 


  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession() //get the user session

        if (!session) {
          router.push("/") //if no session, redirect to dashboard.
          return
        }

        // Get therapist profile
        const { data: therapistProfile, error: therapistError } = await supabase
          .from("therapist_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (therapistError || !therapistProfile) {
          throw therapistError || new Error("Therapist profile not found")
        }

        // Get patient
        const { data: patientData, error: patientError } = await supabase
          .from("users")
          .select("*")
          .eq("id", params.id)
          .single()

        if (patientError || !patientData) {
          throw patientError || new Error("Patient not found") //if patient not found or no data, throw error.
        }

        setPatient(patientData) //reset the patient state with fetched data.

        // Get consultations
        const { data: consultationsData, error: consultationsError } = await supabase
          .from("consultations")
          .select("*")
          .eq("patient_id", params.id)
          .eq("therapist_id", therapistProfile.id)
          .order("scheduled_at", { ascending: false })

        if (consultationsError) {
          throw consultationsError
        }

        setConsultations(consultationsData || [])

        // Get emotion analyses
        const { data: emotionData, error: emotionError } = await supabase
          .from("emotion_analysis")
          .select("*")
          .eq("user_id", params.id)
          .order("created_at", { ascending: false })

        if (emotionError) {
          throw emotionError
        }

        setEmotionAnalyses(emotionData || [])

        // Get daily check-ins
        const { data: checkinsData, error: checkinsError } = await supabase
          .from("daily_checkins")
          .select("*")
          .eq("user_id", params.id)
          .order("created_at", { ascending: false })

        if (checkinsError) {
          throw checkinsError
        }

        setDailyCheckins(checkinsData || [])
      } catch (error) {
        console.error("Error fetching patient data:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data. Please try again.",
          variant: "destructive",
        })
        router.push("/patients") //if error, redirect to patients page.
      } finally {
        setIsLoading(false) //reset the loading state
      }
    }

    fetchPatientData()
  }, [supabase, params.id, router])

  const prepareEmotionChartData = () => {
    if (!emotionAnalyses.length) return []

    return emotionAnalyses
      .slice(0, 7) // takes the last 7 analyses 
      .reverse() // reverse the order because the data is in descending order.
      .map((analysis) => {
        const emotions = analysis.emotions || {} //get the emotions from analysis 
        return {
          date: new Date(analysis.created_at).toLocaleDateString(), //structure the data for the chart 
          ...emotions,
        }
      })
  }

  if (isLoading) { //if loading show loading screen
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Patient Details</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Patient: {patient?.name}</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
          <CardDescription>Basic information about the patient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-lg">{patient?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-lg">{patient?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-lg">{patient?.phone_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-lg">{new Date(patient?.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="consultations">
        <TabsList>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="emotions">Emotion Analysis</TabsTrigger>
          <TabsTrigger value="checkins">Daily Check-ins</TabsTrigger>
        </TabsList>
        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consultation History</CardTitle>
              <CardDescription>History of consultations with this patient</CardDescription>
            </CardHeader>
            <CardContent>
              {consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.map((consultation) => (
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
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          Consultation on {new Date(consultation.scheduled_at).toLocaleDateString()}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(consultation.scheduled_at).toLocaleTimeString()} • Status: {consultation.status}
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
                  <p className="text-muted-foreground">No consultations with this patient yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="emotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Analysis</CardTitle>
              <CardDescription>Patient's emotion analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              {emotionAnalyses.length > 0 ? (
                <div className="space-y-6">
                  <div className="h-80">
                    <ChartContainer
                      config={{
                        happy: {
                          label: "Happy",
                          color: "hsl(var(--chart-1))",
                        },
                        sad: {
                          label: "Sad",
                          color: "hsl(var(--chart-2))",
                        },
                        angry: {
                          label: "Angry",
                          color: "hsl(var(--chart-3))",
                        },
                        fearful: {
                          label: "Fearful",
                          color: "hsl(var(--chart-4))",
                        },
                      }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={prepareEmotionChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line type="monotone" dataKey="happy" stroke="var(--color-happy)" name="Happy" />
                          <Line type="monotone" dataKey="sad" stroke="var(--color-sad)" name="Sad" />
                          <Line type="monotone" dataKey="angry" stroke="var(--color-angry)" name="Angry" />
                          <Line type="monotone" dataKey="fearful" stroke="var(--color-fearful)" name="Fearful" />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recent Analyses</h3>
                    {emotionAnalyses.slice(0, 5).map((analysis) => (
                      <div key={analysis.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">
                            {analysis.analysis_type === "facial" ? "Facial Analysis" : "Text Analysis"}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(analysis.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(analysis.emotions || {}).map(([emotion, value]) => (
                            <div key={emotion} className="flex flex-col items-center p-2 bg-muted rounded">
                              <span className="text-sm font-medium capitalize">{emotion}</span>
                              <span className="text-lg">{typeof value === "number" ? Math.round(value) : value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No emotion analyses available for this patient.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="checkins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Check-ins</CardTitle>
              <CardDescription>Patient's daily check-in entries</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyCheckins.length > 0 ? (
                <div className="space-y-4">
                  {dailyCheckins.map((checkin) => (
                    <div key={checkin.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Check-in on {new Date(checkin.created_at).toLocaleDateString()}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(checkin.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Content:</h5>
                          <p className="text-sm bg-muted p-3 rounded">{checkin.text_content}</p>
                        </div>
                        {checkin.emotion_scores && Object.keys(checkin.emotion_scores).length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-1">Emotion Scores:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(checkin.emotion_scores).map(([emotion, value]) => (
                                <div key={emotion} className="flex flex-col items-center p-2 bg-muted rounded">
                                  <span className="text-sm font-medium capitalize">{emotion}</span>
                                  <span className="text-lg">
                                    {typeof value === "number" ? Math.round(value) : value}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {checkin.recommendations && checkin.recommendations.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-1">Recommendations:</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {checkin.recommendations.map((recommendation, index) => (
                                <li key={index} className="text-sm">
                                  {recommendation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No daily check-ins available for this patient.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
