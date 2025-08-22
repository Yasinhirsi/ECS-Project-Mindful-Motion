variable "next_public_supabase_url" {
  description = "Supabase URL for the application"
  type        = string
}

variable "next_public_supabase_anon_key" {
  description = "Supabase anonymous key for the application"
  type        = string
  sensitive   = true
}
