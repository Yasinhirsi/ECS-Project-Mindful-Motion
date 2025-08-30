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
