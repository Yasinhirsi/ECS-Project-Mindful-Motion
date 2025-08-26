//ECS 

//ecs cluster 
resource "aws_ecs_cluster" "mindful_motion_ecs-M" {
  #   name = "mindful_motion_ecs-M"
  name = var.ecs_cluster_name

}

//cloudwatch log group 
resource "aws_cloudwatch_log_group" "cw_log_group" {
  #   name              = "cw_log_group"
  #   retention_in_days = 7
  name              = var.log_group_name
  retention_in_days = var.log_days
}


//task def

resource "aws_ecs_task_definition" "mindful_motion_task-M" {
  #   family                   = "mindful_motion_task-M"
  family                   = var.task_definition_family
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_definition_cpu
  memory                   = var.task_definition_memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn



  //from old code*
  container_definitions = jsonencode([
    {
      #   name  = "mindful-motion-app"
      #   image = "487148038595.dkr.ecr.eu-west-2.amazonaws.com/mindful-motion-v2:latest"
      name  = var.container_image_name
      image = var.container_image


      portMappings = [
        {
          containerPort = var.app_port //DRY principle
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "NEXT_PUBLIC_SUPABASE_URL", value = var.next_public_supabase_url },
        { name = "NEXT_PUBLIC_SUPABASE_ANON_KEY", value = var.next_public_supabase_anon_key }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"       = aws_cloudwatch_log_group.cw_log_group.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = var.logstream_prefix

        }
      }
    }
  ])
}




// ecs service 

resource "aws_ecs_service" "mindful-service-M" {
  #   name            = "mindful-service-M"
  name = var.ecs_service_name

  cluster         = aws_ecs_cluster.mindful_motion_ecs-M.id
  task_definition = aws_ecs_task_definition.mindful_motion_task-M.arn
  #   desired_count   = 1
  desired_count = var.desired_count
  launch_type   = "FARGATE"
  depends_on    = [aws_lb_listener.HTTPS] //ensures alb is created first.


  network_configuration {
    # subnets          = [aws_subnet.public-subnet-1-M.id, aws_subnet.public-subnet-2-M.id] //old reference

    subnets = [module.vpc.subnet1_id, module.vpc.subnet2_id]

    # security_groups  = [aws_security_group.ecs_sg.id] //old rf
    security_groups  = [module.security_groups.ecs_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb-tg-M.arn
    container_name   = var.container_image_name
    container_port   = var.app_port
  }


}


