variable "alb_sg_name" {
  description = "name of alb security group"
  type        = string
  default     = "mindful-motion-alb-sg"
}

variable "ecs_sg_name" {
  description = "name of ecs security group"
  type        = string
  default     = "mindful-motion-ecs-sg"
}

variable "allow_all_cidr" {
  description = "cidr block to allow all traffic from anywhere"
  type        = string
  default     = "0.0.0.0/0"
}
variable "http_port" {
  description = "http port number"
  type        = number
  default     = 80
}

variable "https_port" {
  description = "https port number"
  type        = number
  default     = 443
}

variable "app_port" {
  description = "port the application runs on"
  type        = number
  default     = 3000
}

variable "vpc_id" {
  description = "VPC ID for security groups"
  type        = string
  # No default - required from VPC module
}

# http_port      = var.http_port
#   https_port     = var.http_port
#   app_port       = var.app_port
#   alb_sg_name    = var.alb_sg_name
#   ecs_sg_name    = var.ecs_sg_name
#   allow_all_cidr = var.allow_all_cidr
