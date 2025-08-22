"use client";
//client side component in next.js  
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
//imports needed for reset password page     
export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = getSupabaseClient();
    //state variables for reset password page 

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        //update the user password 
        setLoading(false);
        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Password updated",
                description: "You can now log in with your new password.",
            });
            router.push("/auth/login"); // Change this if your login page is elsewhere
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={handleReset} className="space-y-4 w-full max-w-sm">
                <h2 className="text-xl font-bold">Set a New Password</h2>
                <Input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating..." : "Update Password"}
                </Button>
            </form>
        </div>
    );
} 