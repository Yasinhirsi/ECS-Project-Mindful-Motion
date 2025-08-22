"use client"
//client side component in next.js 
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { getSupabaseClient } from "@/lib/supabase/client"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
//imports needed for auth form 
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})
//login schema for the auth form 
const patientSignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone_number: z.string().min(10, { message: "Please enter a valid phone number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  user_type: z.literal("patient"),
})
//patient signup schema for the auth form 
const therapistSignupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone_number: z.string().min(10, { message: "Please enter a valid phone number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  age: z.string().refine((val) => !isNaN(Number.parseInt(val)) && Number.parseInt(val) > 0, {
    message: "Please enter a valid age",
  }),
  qualifications: z.string().min(2, { message: "Please enter your qualifications" }),
  user_type: z.literal("therapist"),
})
//therapist signup schema for the auth form 
const signupSchema = z.discriminatedUnion("user_type", [patientSignupSchema, therapistSignupSchema])
//signup schema for the auth form 
export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [userType, setUserType] = useState<"patient" | "therapist">("patient")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()
  //state variables for the auth form   


  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      const isVerified = session?.user?.email_confirmed_at;
      //check if user is verified 
      if (event === "SIGNED_IN" && isVerified) { //if user is signed in and verified, redirect to dashboard after 1.5 seconds 
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500); // Delay only if verified
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe(); //unsubscribe from the auth state change event 
      // to prevent memory leaks
      //unsubscribe means stop listening to the login/signup event
    };
  }, [supabase.auth, router]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({ //login form for the auth form 
    resolver: zodResolver(loginSchema), //zod used to validate the form data 
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const signupForm = useForm<z.infer<typeof signupSchema>>({ //signup form for the auth form 
    resolver: zodResolver(signupSchema), //zod used to validate the form data 
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      password: "",
      user_type: "patient", //default user type is patient 
    },
  })

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true) //set the loading state to true  
    try {
      console.log("Attempting login with:", values.email); //log the email to the console 
      const { data, error } = await supabase.auth.signInWithPassword({ //sign in with the email and password
        email: values.email,
        password: values.password,
      })

      if (error) {
        console.error("Login error details:", error);

        if (error.message === "Email not confirmed") { //if the email is not confirmed, show the toast message
          toast({
            title: "Email not confirmed",
            description: "Please check your inbox and click the confirmation link to verify your email address.",
            variant: "destructive",
          });

          // Optionally resend the confirmation email
          const { error: resendError } = await supabase.auth.resend({ //resend the confirmation email 
            type: 'signup',
            email: values.email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (!resendError) {  //if the confirmation email is resent, show the toast message
            toast({
              title: "Confirmation email resent",
              description: "We've sent you another confirmation email.",
            });
          }

          throw error; //throw the error 
        }

        throw error; //throw the error 
      }

      console.log("Login successful, session:", data); //log the session to the console 
      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })
    } catch (error: any) {
      console.error("Login error:", error); //log the error to the console    
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onSignupSubmit(values: z.infer<typeof signupSchema>) { //signup form for the auth form   
    setIsLoading(true) //set the loading state to true  
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({  //sign up with the email and password
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, //redirect to the page after confirmation
          data: {
            name: values.name,
            phone_number: values.phone_number,
            user_type: values.user_type,
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("User creation failed")

      const { error: profileError } = await supabase.from("users").insert({ //insert the user into the users table
        id: authData.user.id,
        email: values.email,
        name: values.name,
        phone_number: values.phone_number,
        user_type: values.user_type,
      })

      if (profileError) throw profileError

      if (values.user_type === "therapist") { //if the user is a therapist, insert the user into the therapist_profiles table
        const { error: therapistError } = await supabase.from("therapist_profiles").insert({ //insert the user into the therapist_profiles table
          user_id: authData.user.id,
          age: Number.parseInt((values as any).age),
          qualifications: (values as any).qualifications,
        })

        if (therapistError) throw therapistError
      }
      console.log("✅ Signup successful, showing toast..."); //log the signup successful message to the console 
      toast({
        title: "Account created",
        description: "Please check your email for confirmation instructions.",
      })
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      }) //show the toast message if the signup fails
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <Tabs defaultValue="login" onValueChange={(value) => setAuthMode(value as "login" | "signup")}>
        <TabsList className="grid w-full grid-cols-2 bg-secondary/30">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login" className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primary">Login</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-right text-sm">
                <button
                  type="button"
                  className="text-blue-600 hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </p>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </TabsContent>
        <TabsContent value="signup" className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-primary">Create an account</h2>
            <p className="text-sm text-muted-foreground">Enter your information to create an account</p>
          </div>
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="user_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Account Type</FormLabel>
                    <FormControl>
                      <RadioGroup className="text-primary"
                        onValueChange={(value) => {
                          field.onChange(value)
                          setUserType(value as "patient" | "therapist")
                        }}
                        defaultValue={field.value}
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="patient" />
                          </FormControl>
                          <FormLabel className="font-normal">Patient</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="therapist" />
                          </FormControl>
                          <FormLabel className="font-normal">Therapist</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signupForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" autoComplete="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {userType === "therapist" && (
                <>
                  <FormField
                    control={signupForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">Age</FormLabel>
                        <FormControl>
                          <Input placeholder="30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-primary">Qualifications</FormLabel>
                        <FormControl>
                          <Input placeholder="Licensed Clinical Psychologist" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  )
}



