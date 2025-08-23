

/////////////////////// VPC ///////////////////////////////////////////////////////


variable "vpc_cidr" {
  description = "cidr block for the vpc"
  type        = string
}

//public subnet 1 config 
variable "public_subnet_1_cidr" {
  description = "cidr block for public subnet 1"
  type        = string

}

variable "public_subnet_1_az" {
  description = "Availabilty Zone for public subnet 1"
  type        = string
}

//public subnet 2 config
variable "public_subnet_2_cidr" {
  description = "cidr block for public subnet 2"
  type        = string

}

variable "public_subnet_2_az" {
  description = "Availabilty Zone for public subnet 2"
  type        = string
}

//route table
variable "route_table_cidr" {
  description = "cidr block for the route table"
  type        = string

}



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



/////////////////////////////  ECS //////////////////////////////

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

//////////////////////////////   ACM         ///////////////////////////////

variable "domain_name" {
  description = "name of domain hosting the app"
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

variable "alb_sg_name" {
  description = "name of alb security group"
  type        = string
}

variable "ecs_sg_name" {
  description = "name of ecs security group"
  type        = string
}
