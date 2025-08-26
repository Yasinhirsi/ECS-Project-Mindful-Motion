variable "alb_sg_name" {
  description = "name of alb security group"
  type        = string
}

variable "ecs_sg_name" {
  description = "name of ecs security group"
  type        = string
}

variable "allow_all_cidr" {
  description = "cidr block to allow all traffic from anywhere"
  type        = string
}
variable "http_port" {
  description = "http port number"
  type        = number
}

variable "https_port" {
  description = "https port number"
  type        = number
}

variable "app_port" {
  description = "port the application runs on"
  type        = number

}

variable "vpc_id" {
  description = "VPC ID for security groups"
  type        = string
}

# http_port      = var.http_port
#   https_port     = var.http_port
#   app_port       = var.app_port
#   alb_sg_name    = var.alb_sg_name
#   ecs_sg_name    = var.ecs_sg_name
#   allow_all_cidr = var.allow_all_cidr
