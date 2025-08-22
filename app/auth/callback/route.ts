import { createServerClient } from "@supabase/ssr"; // This imports the createServerClient function from Supabase's SSR (Server-Side Rendering) package, which is used to create a Supabase client that works in server-side contexts.
import { cookies } from "next/headers";
//Imports the cookies function from Next.js headers module, which provides access to cookies in server components and API routes.
import { NextRequest, NextResponse } from "next/server";
//Imports Next.js types for handling HTTP requests and responses in API routes.

//Defines an async GET handler function for the route. This function will be called when a GET request is made to this endpoint.
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code"); //Creates a URL object from the request URL and extracts the code parameter from the query string. This code is typically provided by Supabase after a successful authentication attempt.



    //Checks if a code was provided in the URL. If not, the function will skip the authentication process.
    if (code) {
        const cookieStore = cookies(); //Gets access to the cookie store for the current request.
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    }, //Creates a Supabase client configured for server-side use. It uses environment variables for the Supabase URL and anonymous key. The client is configured with cookie handlers to manage authentication state.


                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },//Defines a function to set cookies, which Supabase will use to store authentication tokens.

                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options, maxAge: 0 });
                    },
                    //Defines a function to remove cookies by setting them with an empty value and zero max age.
                },
            }
        );

        await supabase.auth.exchangeCodeForSession(code); //Exchanges the auth code for a session token and user data.
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin + "/dashboard");
} 