

/////////////////////// VPC ///////////////////////////////////////////////////////


variable "vpc_cidr" {
  description = "cidr block for the vpc"
  type        = string
  default     = "10.0.0.0/16"
}

//public subnet 1 config 
variable "public_subnet_1_cidr" {
  description = "cidr block for public subnet 1"
  type        = string
  default     = "10.0.1.0/24"
}

variable "public_subnet_1_az" {
  description = "Availabilty Zone for public subnet 1"
  type        = string
  default     = "eu-west-2a"
}

//public subnet 2 config
variable "public_subnet_2_cidr" {
  description = "cidr block for public subnet 2"
  type        = string
  default     = "10.0.2.0/24"
}

variable "public_subnet_2_az" {
  description = "Availabilty Zone for public subnet 2"
  type        = string
  default     = "eu-west-2b"
}

//route table
variable "route_table_cidr" {
  description = "cidr block for the route table"
  type        = string
  default     = "0.0.0.0/0"
}



///////////////// ALB //////////////////

variable "alb_name" {
  description = "name of alb"
  type        = string
  default     = "mindful-motion-alb"
}

variable "environment_tag" {
  description = "tag for enviroment (eg prod, staging)"
  type        = string
  default     = "production"
}

variable "alb_tg_name" {
  description = "name of alb target group"
  type        = string
  default     = "mindful-motion-tg"
}

variable "app_port" {
  description = "port the application runs on"
  type        = number
  default     = 3000
}


//TG health checks

variable "health_check_path" {
  description = "health check path for ALB target group"
  type        = string
  default     = "/"
}

variable "health_check_matcher" {
  description = "health check matcher for ALB target group"
  type        = string
  default     = "200"
}

variable "health_check_interval" {
  description = "health check interval for ALB tg"
  type        = number
  default     = 30
}
variable "health_check_timeout" {
  description = "health check timeout for alb tg"
  type        = number
  default     = 5
}
variable "health_check_healthy_threshold" {
  description = "health check healthy threshold number for alb tg"
  type        = number
  default     = 2
}

variable "health_check_unhealthy_threshold" {
  description = "health check unhealthy threshold number for alb tg"
  type        = number
  default     = 2
}



/////////////////////////////  ECS //////////////////////////////

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

variable "NEXT_PUBLIC_SUPABASE_URL" {
  description = "Supabase URL for the application"
  type        = string
  sensitive   = true
}

variable "NEXT_PUBLIC_SUPABASE_ANON_KEY" {
  description = "Supabase anonymous key for the application"
  type        = string
  sensitive   = true
}

//////////////////////////////   ACM         ///////////////////////////////

variable "domain_name" {
  description = "name of domain hosting the app"
  type        = string
  default     = "tm.yasinhirsi.com"
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
