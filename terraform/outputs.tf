# //vpc outputs 
# output "vpc_id" {
#   value = aws_vpc.mindful-motion-vpc-M.id
# }

# output "igw_id" {
#   value = aws_internet_gateway.igw-mindful-M.id
# }

# output "subnet1_id" {
#   value = aws_subnet.public-subnet-1-M.id
# }

# output "subnet2_id" {
#   value = aws_subnet.public-subnet-2-M.id
# }

# //for routing config
# output "route_table_id" {
#   value = aws_route_table.mindful-motion-rt-M.id
# }
//IAM outputs 

output "ecs_execution_role_arn" {
  description = "ARN of the ECS execution role"
  value       = aws_iam_role.ecs_execution_role.arn
}

output "ecs_execution_role_name" {
  description = "Name of the ECS execution role"
  value       = aws_iam_role.ecs_execution_role.name
}


//alb outputs 

output "alb_name" {
  value = aws_lb.mindful-motion-lb.name
}

# output "security_group_id_alb" {
#   value = aws_security_group.alb_sg.id
# }

output "aws_lb_target_group_name" {
  value = aws_lb_target_group.alb-tg-M.name
}

output "load_balancer_arn" {
  value = aws_lb.mindful-motion-lb.arn
}


output "certificate_arn" {
  value = data.aws_acm_certificate.cert.arn
}

output "target_group_arn" {
  value = aws_lb_target_group.alb-tg-M.arn
}

output "alb_dns_name" {
  value = aws_lb.mindful-motion-lb.dns_name //output the albs dns (even though it wasnt in the variables)

}

output "https_listener_arn" {
  value = aws_lb_listener.HTTPS.arn
}

output "http_redirect_listener_arn" {
  value = aws_lb_listener.http-redirect.arn
}


//ecs outputs

output "ecs_cluster_name" {

  value = aws_ecs_cluster.mindful_motion_ecs-M.name
}

output "cw_log_group_name" {
  value = aws_cloudwatch_log_group.cw_log_group.name
}

output "task_definition_family" {
  value = aws_ecs_task_definition.mindful_motion_task-M.family
}

output "ecs_service_name" {
  value = aws_ecs_service.mindful-service-M.name
}

output "aws_ecs_cluster_id" {
  value = aws_ecs_cluster.mindful_motion_ecs-M.id
}

output "ecs_service_arn" {
  value = aws_ecs_service.mindful-service-M.id //ecs service doesnt have arn attribute so use id instead
}

output "task_definition_arn" {
  value = aws_ecs_task_definition.mindful_motion_task-M.arn
}


# //i missed these manually 

# //to know which sg ecs task use 
# output "ecs_security_group_id" {
#   value = aws_security_group.ecs_sg.id
# }

# output "ecs_security_group_name" {
#   value = aws_security_group.ecs_sg.name
# }


