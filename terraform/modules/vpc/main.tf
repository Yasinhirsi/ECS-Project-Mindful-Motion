
//VPC
resource "aws_vpc" "mindful-motion-vpc-M" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
}

// Public Subnet 1
resource "aws_subnet" "public-subnet-1-M" {
  vpc_id                  = aws_vpc.mindful-motion-vpc-M.id
  cidr_block              = var.public_subnet_1_cidr
  availability_zone       = var.public_subnet_1_az
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-1-M"
  }
}

// Public Subnet 2
resource "aws_subnet" "public-subnet-2-M" {
  vpc_id                  = aws_vpc.mindful-motion-vpc-M.id
  cidr_block              = var.public_subnet_2_cidr
  availability_zone       = var.public_subnet_2_az
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-2-M"
  }
}


// Internet Gateway 
resource "aws_internet_gateway" "igw-mindful-M" {
  vpc_id = aws_vpc.mindful-motion-vpc-M.id

  tags = {
    Name = "igw-mindful-M"
  }
}


//route table
resource "aws_route_table" "mindful-motion-rt-M" {
  vpc_id = aws_vpc.mindful-motion-vpc-M.id

  route {
    cidr_block = var.route_table_cidr
    gateway_id = aws_internet_gateway.igw-mindful-M.id
  }


  tags = {
    Name = "mindful-motion-rt-M"
  }
}

//associate public subnets with route table

resource "aws_route_table_association" "association_with_subnet1" {
  subnet_id      = aws_subnet.public-subnet-1-M.id
  route_table_id = aws_route_table.mindful-motion-rt-M.id
}

resource "aws_route_table_association" "asociation_with_subnet2" {
  subnet_id      = aws_subnet.public-subnet-2-M.id
  route_table_id = aws_route_table.mindful-motion-rt-M.id
}
