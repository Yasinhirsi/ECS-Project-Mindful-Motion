variable "ecs_cluster_name" {
  description = "name of ecs cluster"
  type        = string

}

variable "log_group_name" {
  description = "name of log group"
  type        = string
}

variable "log_days" {
  description = "number of days for logs"
  type        = number
}

variable "task_definition_family" {
  description = "task definiton family name"
  type        = string
}

variable "task_definition_cpu" {
  description = "cpu needed for task"
  type        = number
}
variable "task_definition_memory" {
  description = "memory needed for task"
  type        = number
}

variable "container_image_name" {
  description = "name of container"
  type        = string
}

variable "container_image" {
  description = "actual container image"
  type        = string
}

variable "aws_region" {
  description = "aws region"
  type        = string
}

variable "logstream_prefix" {
  description = "logstream prefix"
  type        = string
}

variable "ecs_service_name" {
  description = "name of ecs service"
  type        = string
}
variable "desired_count" {
  description = "desired count for ecs service"
  type        = number
}

variable "next_public_supabase_url" {
  description = "Supabase URL for the application"
  type        = string
}

variable "next_public_supabase_anon_key" {
  description = "Supabase anonymous key for the application"
  type        = string
  sensitive   = true
}


variable "app_port" {
  description = "port app runs on"
  type        = number
}

# variable "https_listener_arn" {
#   value = aws_lb_listener.HTTPS.arn
# }


//needed so i can pass values from vpc module
variable "subnet1_id" {
  description = "First subnet ID"
  type        = string
}

variable "subnet2_id" {
  description = "Second subnet ID"
  type        = string
}


variable "ecs_security_group_id" {
  description = "ecs sg id"
  type        = string
}


variable "target_group_arn" {
  description = "ARN of alb target group"
  type        = string
}
