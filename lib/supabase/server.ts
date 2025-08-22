import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
//imports needed for the supabase server client creation  
// Using any type to silence TypeScript errors
// This is a temporary workaround for Next.js 14 cookies API issues
const getCookieStore = () => cookies() as any;
//helper function to get the cookie store 
export const createServerComponentClient = async () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, //environment variable for the supabase url
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, //environment variable for the supabase anon key
    {
      cookies: {
        get: async (name) => { //helper function to get the cookie value by name 
          try {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value; //returns the cookie value by name
          } catch (error) {
            console.error('Error getting cookie:', error);
            return undefined; //returns undefined if the cookie value is not found
          }
        },
        set: async (name, value, options) => { //helper function to set the cookie value by name, value and options
          try {
            const cookieStore = await cookies(); //gets the cookie store  
            cookieStore.set(name, value, options); //sets the cookie value by name, value and options
          } catch (error) {
            console.error('Error setting cookie:', error); //logs the error if the cookie value is not set
          }
        },
        remove: async (name, options) => { //helper function to remove the cookie value by name and options
          try {
            const cookieStore = await cookies(); //gets the cookie store  
            cookieStore.set(name, "", { ...options, maxAge: 0 }); //removes the cookie value by name and options
          } catch (error) {
            console.error('Error removing cookie:', error); //logs the error if the cookie value is not removed
          }
        },
      },
    }
  );
};

export const createServerActionClient = async () => { //same as the createServerComponentClient but for server actions like forms and redirects 
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name) => { //helper function to get the cookie value by name 
          try {
            const cookieStore = await cookies(); //gets the cookie store
            return cookieStore.get(name)?.value; //returns the cookie value by name
          } catch (error) {
            console.error('Error getting cookie:', error); //logs the error if the cookie value is not found
            return undefined; //returns undefined if the cookie value is not found
          }
        },
        set: async (name, value, options) => { //helper function to set the cookie value by name, value and options
          try {
            const cookieStore = await cookies(); //gets the cookie store
            cookieStore.set(name, value, options); //sets the cookie value by name, value and options
          } catch (error) {
            console.error('Error setting cookie:', error); //logs the error if the cookie value is not set
          }
        },
        remove: async (name, options) => { //helper function to remove the cookie value by name and options
          try {
            const cookieStore = await cookies(); //gets the cookie store
            cookieStore.set(name, "", { ...options, maxAge: 0 }); //removes the cookie value by name and options
          } catch (error) {
            console.error('Error removing cookie:', error); //logs the error if the cookie value is not removed 
          }
        },
      },
    }
  );
};
