import { cookies } from 'next/headers';
import { createServerClient } from "@supabase/ssr";
//imports needed for the getCurrentUser function 

export async function getCurrentUser() { //function to get current user, used for server side authentication
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, //environment variable for the supabase url
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, //environment variable for the supabase anon key
      {
        cookies: {
          async get(name: string) {
            return cookieStore.get(name)?.value; //returns the cookie value by name
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options }); //sets the cookie value by name, value and options
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 }); //removes the cookie value by name and options 
          },
        },
      }
    );

    const {
      data: { session }, //gets the session data from the supabase client
      error, //gets the error from the supabase client
    } = await supabase.auth.getSession(); //gets the session from the supabase client

    if (error) {
      console.error("Session error:", error); //logs the error if the session is not found
      return null;
    }

    if (!session) {
      console.log("No session found"); //logs the error if the session is not found 
      return null;
    }

    // Log the session details to help with debugging
    console.log("Session found:", {
      user_id: session.user.id, //logs the user id from the session 
      email: session.user.email, //logs the email from the session
      expires_at: new Date(session.expires_at! * 1000).toISOString(), //logs the expires at from the session
    });

    const { data: user, error: userError } = await supabase //gets the user from the supabase client
      .from("users") //gets the users from the supabase client
      .select("*") //gets the users from the supabase client
      .eq("id", session.user.id) //gets the users from the supabase client
      .single(); //gets the users from the supabase client

    if (userError) {
      console.error("User fetch error:", userError); //logs the error if the user is not found
      return null;
    }

    if (!user) {
      console.log("No user found for session ID:", session.user.id); //logs the error if the user is not found   
      return null;
    }

    return user; //returns the user
  } catch (error) {
    console.error("Unexpected error in getCurrentUser:", error); //logs the error if the user is not found
    return null;
  }
}
