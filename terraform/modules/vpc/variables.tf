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
