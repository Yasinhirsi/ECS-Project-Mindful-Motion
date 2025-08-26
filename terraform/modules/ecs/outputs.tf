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

# output "https_listener_arn" {
#   value = aws_lb_listener.HTTPS.arn
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
