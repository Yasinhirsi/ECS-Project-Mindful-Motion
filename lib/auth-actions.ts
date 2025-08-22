import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
//imports needed for the auth actions

// This forces Next.js to treat this as a dynamic route
export const dynamic = 'force-dynamic';

export async function getCurrentUser() {
    try {
        // Create a Supabase client for server components
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    async get(name) {
                        const cookieStore = await cookies();
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        // Get user directly from auth API
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("Auth error:", userError);
            return null;
        }

        // Get the user profile from the database
        const { data: userProfile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError) {
            console.error("Profile fetch error:", profileError);
            return null;
        }

        if (!userProfile) {
            console.log("No user profile found for ID:", user.id);
            return null;
        }

        return userProfile;
    } catch (error) {
        console.error("Unexpected error in getCurrentUser:", error);
        return null;
    }
} 