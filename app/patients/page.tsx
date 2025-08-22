"use client"
// client side component in next.js 
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/")
          return
        }

        // Get therapist profile
        const { data: therapistProfile, error: therapistError } = await supabase
          .from("therapist_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single() //.single() because we are getting a single therapist profile

        if (therapistError || !therapistProfile) {
          throw therapistError || new Error("Therapist profile not found")
        }

        // Get consultations for this therapist
        const { data: consultations, error: consultationsError } = await supabase
          .from("consultations")
          .select(`
        *,
        patient:patient_id (
          id,
          name,
          email,
          phone_number
        )
      `)
          .eq("therapist_id", therapistProfile.id)
          .in("status", ["accepted", "completed"]) //only get acc and completeted consultations 

        if (consultationsError) {
          throw consultationsError
        }

        // Extract unique patients
        const uniquePatients = Array.from(
          new Map(
            (consultations || []) //ensures code runs even if no consultations 
              .filter((c) => c.patient) //filter any consultations with no patient 
              .map((c) => [c.patient.id, { ...c.patient, last_consultation: c.scheduled_at }]),
            //map the patient id to the patient object and add the last consultation date.
          ).values(),
        )

        setPatients(uniquePatients) //set the patient state with unique patients 
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false) // reset the laoding state 
      }
    }

    fetchPatients() //function call to fetch patients 
  }, [supabase, router]) //only run when supabase or router are updated 

  const handleViewPatient = (patientId: string) => {
    router.push(`/patients/${patientId}`) //naviagte to the patient page upon click.
  }

  if (isLoading) {  //if loading show loading screen. 
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
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
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
      </div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Patients</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          {patients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patients.map((patient) => (
                <Card key={patient.id}>
                  <CardHeader>
                    <CardTitle>{patient.name}</CardTitle>
                    <CardDescription>Patients you have consultations with</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Phone:</strong> {patient.phone_number || "N/A"}
                      </p>
                      <p className="text-sm">
                        <strong>Last Consultation:</strong> {new Date(patient.last_consultation).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Button onClick={() => handleViewPatient(patient.id)} className="w-full">
                      View Patient
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">No patients yet. Accept consultation requests to add patients.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          {patients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {patients
                .sort((a, b) => new Date(b.last_consultation).getTime() - new Date(a.last_consultation).getTime())
                .slice(0, 6)
                .map((patient) => (
                  <Card key={patient.id}>
                    <CardHeader>
                      <CardTitle>{patient.name}</CardTitle>
                      <CardDescription>{patient.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Phone:</strong> {patient.phone_number || "N/A"}
                        </p>
                        <p className="text-sm">
                          <strong>Last Consultation:</strong> {new Date(patient.last_consultation).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0">
                      <Button onClick={() => handleViewPatient(patient.id)} className="w-full">
                        View Patient
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-6">
                <p className="text-muted-foreground">
                  No recent patients. Accept consultation requests to add patients.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
