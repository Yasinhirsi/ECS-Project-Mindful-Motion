variable "ecs_cluster_name" {
  description = "name of ecs cluster"
  type        = string
  default     = "mindful-motion-cluster"
}

variable "log_group_name" {
  description = "name of log group"
  type        = string
  default     = "mindful-motion-logs"
}

variable "log_days" {
  description = "number of days for logs"
  type        = number
  default     = 7
}

variable "task_definition_family" {
  description = "task definiton family name"
  type        = string
  default     = "mindful-motion-task"
}

variable "task_definition_cpu" {
  description = "cpu needed for task"
  type        = number
  default     = 256
}
variable "task_definition_memory" {
  description = "memory needed for task"
  type        = number
  default     = 512
}

variable "container_image_name" {
  description = "name of container"
  type        = string
  default     = "mindful-motion"
}

variable "container_image" {
  description = "actual container image"
  type        = string
  default     = "487148038595.dkr.ecr.eu-west-2.amazonaws.com/mindful-motion-v2:latest"
}

variable "aws_region" {
  description = "aws region"
  type        = string
  default     = "eu-west-2"
}

variable "logstream_prefix" {
  description = "logstream prefix"
  type        = string
  default     = "ecs"
}

variable "ecs_service_name" {
  description = "name of ecs service"
  type        = string
  default     = "mindful-motion-service"
}
variable "desired_count" {
  description = "desired count for ecs service"
  type        = number
  default     = 1
}

variable "next_public_supabase_url" {
  description = "Supabase URL for the application"
  type        = string
  default     = "https://gdrkdhplmgfjjtdtsrkl.supabase.co"
}

variable "next_public_supabase_anon_key" {
  description = "Supabase anonymous key for the application"
  type        = string
  sensitive   = true
  # No default for sensitive values
}


variable "app_port" {
  description = "port app runs on"
  type        = number
  default     = 3000
}

# variable "https_listener_arn" {
#   value = aws_lb_listener.HTTPS.arn
# }


//needed so i can pass values from vpc module
variable "subnet1_id" {
  description = "First subnet ID"
  type        = string
  # No default - required from VPC module
}

variable "subnet2_id" {
  description = "Second subnet ID"
  type        = string
  # No default - required from VPC module
}


variable "ecs_security_group_id" {
  description = "ecs sg id"
  type        = string
  # No default - required from security groups module
}


variable "target_group_arn" {
  description = "ARN of alb target group"
  type        = string
  # No default - required from ALB module
}
