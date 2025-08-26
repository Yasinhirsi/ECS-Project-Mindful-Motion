//vpc outputs 
output "vpc_id" {
  value = aws_vpc.mindful-motion-vpc-M.id
}

output "igw_id" {
  value = aws_internet_gateway.igw-mindful-M.id
}

output "subnet1_id" {
  value = aws_subnet.public-subnet-1-M.id
}

output "subnet2_id" {
  value = aws_subnet.public-subnet-2-M.id
}

//for routing config
output "route_table_id" {
  value = aws_route_table.mindful-motion-rt-M.id
}
