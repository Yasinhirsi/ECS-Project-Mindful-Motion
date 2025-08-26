//to know which sg ecs task use 
output "ecs_security_group_id" {
  value = aws_security_group.ecs_sg.id
}

output "ecs_security_group_name" {
  value = aws_security_group.ecs_sg.name
}


output "security_group_id_alb" {
  value = aws_security_group.alb_sg.id
}
