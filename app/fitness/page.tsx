"use client"
//Client side component in next.js
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
//imports needed for fitness page
export default function FitnessPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activityType, setActivityType] = useState("walking")
  const [duration, setDuration] = useState("")
  const [steps, setSteps] = useState("")
  const [notes, setNotes] = useState("")
  const [goalType, setGoalType] = useState("steps")
  const [targetValue, setTargetValue] = useState("")
  const [endDate, setEndDate] = useState("")
  const [chartData, setChartData] = useState<any[]>([])
  const supabase = getSupabaseClient()
  //state variables for the fitness page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession() //gets the user session

        if (!session) {
          window.location.href = "/"
          return //if no session, redirect to the dashboard.
        }

        // Fetch activities
        const { data: activitiesData, error: activitiesError } = await supabase
          .from("fitness_activities")
          .select("*")
          .eq("user_id", session.user.id) //where the user id matches the session user id
          .order("created_at", { ascending: false })

        if (activitiesError) {
          throw activitiesError
        }

        setActivities(activitiesData || [])

        // Fetch goals
        const { data: goalsData, error: goalsError } = await supabase
          .from("fitness_goals")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })

        if (goalsError) {
          throw goalsError //if there is an error, toast notification at catch block.
        }

        setGoals(goalsData || [])

        // Prepare chart data
        if (activitiesData && activitiesData.length > 0) { //if there are activities, sort them by date and get the last 7.
          const chartData = activitiesData
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .slice(-7) // Get last 7 activities
            .map((activity) => ({
              date: new Date(activity.created_at).toLocaleDateString(), //make date readable (5/12/2025)
              duration: activity.duration,
              steps: activity.steps || 0,
            })) //convert activities into simple objects with date, duration and steps.

          setChartData(chartData) //update the chart data 
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load fitness data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false) //reset the loading state
      }
    }

    fetchData()
  }, [supabase])

  const handleAddActivity = async () => {
    try { //try to add an activity 
      if (!activityType || !duration) { //if not fully filled, toast error.
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession() //get user session

      if (!session) {
        window.location.href = "/" //if no session, redirect to dashboard.
        return
      }

      const { data, error } = await supabase // add activity to the database 
        .from("fitness_activities")
        .insert({
          user_id: session.user.id,
          activity_type: activityType,
          duration: Number.parseInt(duration),
          steps: steps ? Number.parseInt(steps) : null,
          notes,
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Activity Added",
        description: "Your fitness activity has been added successfully.",
      })
      //success toast 

      // Refresh activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from("fitness_activities")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (activitiesError) {
        throw activitiesError
      }

      setActivities(activitiesData || []) //

      // Update chart data
      if (activitiesData && activitiesData.length > 0) {
        const chartData = activitiesData
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .slice(-7) // Get last 7 activities
          .map((activity) => ({
            date: new Date(activity.created_at).toLocaleDateString(),
            duration: activity.duration,
            steps: activity.steps || 0,
          }))

        setChartData(chartData)
      }

      // Reset form
      setActivityType("walking")
      setDuration("")
      setSteps("")
      setNotes("")
    } catch (error) {
      console.error("Error adding activity:", error)
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddGoal = async () => {
    try {
      if (!goalType || !targetValue || !endDate) { //if not fully filled toast error.
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        window.location.href = "/"
        return
      }

      const { data, error } = await supabase // add goal to the database 
        .from("fitness_goals")
        .insert({
          user_id: session.user.id,
          goal_type: goalType,
          target_value: Number.parseInt(targetValue),
          start_date: new Date().toISOString().split("T")[0],
          end_date: endDate,
          status: "active",
        })
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Goal Added",
        description: "Your fitness goal has been added successfully.",
      })
      //success toast 

      // Refresh goals
      const { data: goalsData, error: goalsError } = await supabase
        .from("fitness_goals")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (goalsError) {
        throw goalsError
      }

      setGoals(goalsData || [])

      // Reset form
      setGoalType("steps")
      setTargetValue("")
      setEndDate("")
    } catch (error) {
      console.error("Error adding goal:", error)
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) { //if loading show loading screen.
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Fitness Tracking</h2>
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
        <h2 className="text-3xl font-bold tracking-tight">Fitness Tracking</h2>
      </div>
      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Activity</CardTitle>
              <CardDescription>Log your fitness activities to track your progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-type">Activity Type</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walking">Walking</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="cycling">Cycling</SelectItem>
                      <SelectItem value="swimming">Swimming</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="strength">Strength Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="steps">Steps (optional)</Label>
                  <Input
                    id="steps"
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Felt great today!"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddActivity}>Add Activity</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your recently logged fitness activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center border-b pb-4 last:border-0 last:pb-0">
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
                          <path d="M19.5 14.4 17.2 12l2.3-2.4" />
                          <path d="M14 12h4" />
                          <path d="M4.5 9.6 6.8 12l-2.3 2.4" />
                          <path d="M10 12H6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium capitalize">{activity.activity_type}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()} • {activity.duration} minutes
                          {activity.steps && ` • ${activity.steps} steps`}
                        </p>
                        {activity.notes && <p className="text-xs mt-1">{activity.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No activities logged yet. Add an activity to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Set Goal</CardTitle>
              <CardDescription>Set fitness goals to track your progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-type">Goal Type</Label>
                  <Select value={goalType} onValueChange={setGoalType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="steps">Daily Steps</SelectItem>
                      <SelectItem value="duration">Weekly Activity Duration</SelectItem>
                      <SelectItem value="frequency">Weekly Workout Frequency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-value">Target Value</Label>
                  <Input
                    id="target-value"
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder={goalType === "steps" ? "10000" : goalType === "duration" ? "150" : "3"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddGoal}>Set Goal</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Your current fitness goals</CardDescription>
            </CardHeader>
            <CardContent>
              {goals.filter((g) => g.status === "active").length > 0 ? (
                <div className="space-y-4">
                  {goals
                    .filter((g) => g.status === "active")
                    .map((goal) => (
                      <div key={goal.id} className="flex items-center border-b pb-4 last:border-0 last:pb-0">
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
                            <path d="M12 2v4" />
                            <path d="M12 18v4" />
                            <path d="m4.93 4.93 2.83 2.83" />
                            <path d="m16.24 16.24 2.83 2.83" />
                            <path d="M2 12h4" />
                            <path d="M18 12h4" />
                            <path d="m4.93 19.07 2.83-2.83" />
                            <path d="m16.24 7.76 2.83-2.83" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">
                            {goal.goal_type === "steps" && `${goal.target_value} daily steps`}
                            {goal.goal_type === "duration" && `${goal.target_value} minutes of activity per week`}
                            {goal.goal_type === "frequency" && `${goal.target_value} workouts per week`}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Target date: {new Date(goal.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {goal.status}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No active goals. Set a goal to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends</CardTitle>
              <CardDescription>View your fitness activity trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-80">
                  <ChartContainer
                    config={{
                      duration: {
                        label: "Duration (minutes)",
                        color: "hsl(var(--chart-1))",
                      },
                      steps: {
                        label: "Steps",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-duration)" />
                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-steps)" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="duration"
                          stroke="var(--color-duration)"
                          name="Duration (minutes)"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="steps"
                          stroke="var(--color-steps)"
                          name="Steps"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No activity data available. Log activities to see trends.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
              <CardDescription>Summary of your fitness activities</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold">{activities.length}</h3>
                    <p className="text-sm text-muted-foreground">Total Activities</p>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold">
                      {activities.reduce((total, activity) => total + activity.duration, 0)}
                    </h3>
                    <p className="text-sm text-muted-foreground">Total Minutes</p>
                  </div>
                  <div className="flex flex-col items-center p-4 border rounded-lg">
                    <h3 className="text-2xl font-bold">
                      {activities.reduce((total, activity) => total + (activity.steps || 0), 0).toLocaleString()}
                    </h3>
                    <p className="text-sm text-muted-foreground">Total Steps</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No activities logged yet. Add an activity to see summary.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
