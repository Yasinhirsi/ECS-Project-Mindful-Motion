///////////////// ALB //////////////////

variable "alb_name" {
  description = "name of alb"
  type        = string
}

variable "environment_tag" {
  description = "tag for enviroment (eg prod, staging)"
  type        = string

}

variable "alb_tg_name" {
  description = "name of alb target group"
  type        = string
}

variable "app_port" {
  description = "port the application runs on"
  type        = number

}


//TG health checks

variable "health_check_path" {
  description = "health check path for ALB target group"
  type        = string

}

variable "health_check_matcher" {
  description = "health check matcher for ALB target group"
  type        = string
}

variable "health_check_interval" {
  description = "health check interval for ALB tg"
  type        = number

}
variable "health_check_timeout" {
  description = "health check timeout for alb tg"
  type        = number
}
variable "health_check_healthy_threshold" {
  description = "health check healthy threshold number for alb tg"
  type        = number

}
variable "health_check_unhealthy_threshold" {
  description = "health check unhealthy threshold number for alb tg"
  type        = number
}

variable "https_port" {
  description = "https port number"
  type        = number
}

variable "http_port" {
  description = "http port number"
  type        = number
}


variable "vpc_id" {
  description = "VPC ID for ALB"
  type        = string
}

variable "security_group_id_alb" {
  description = "ALB security group ID"
  type        = string
}

//needed so i can pass values from vpc module
variable "subnet1_id" {
  description = "First subnet ID"
  type        = string
}

variable "subnet2_id" {
  description = "Second subnet ID"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN for HTTPS listener"
  type        = string
}
