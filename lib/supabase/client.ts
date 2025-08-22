import { createBrowserClient } from "@supabase/ssr";
//imports needed for the supabase client for the browser side supabase client creation
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;
//variable to store the supabase client. initialized as null because it doesn't exist yet.  
export const getSupabaseClient = () => { //singleton pattern to ensure only one instance of the supabase client is created .
  if (!supabaseClient) {
    supabaseClient = createBrowserClient( //creates the supabase client if it doesn't exist 
      process.env.NEXT_PUBLIC_SUPABASE_URL!, //environment variable for the supabase url
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, //environment variable for the supabase anon key
      {
        auth: { //configures the auth options for the supabase client 
          persistSession: true, //saves the session in local storage  
          autoRefreshToken: true, //refreshes the token when it expires
          detectSessionInUrl: true, //detects the session in the url
          flowType: 'pkce' //flow type for the supabase client and for enhanced security
        }
      }
    );
  }
  return supabaseClient; //returns either the existing or newly created supabase client 
};
