//ECS 

//ecs cluster 
resource "aws_ecs_cluster" "mindful_motion_ecs-M" {
  name = var.ecs_cluster_name

}

//cloudwatch log group 
resource "aws_cloudwatch_log_group" "cw_log_group" {
  name              = var.log_group_name
  retention_in_days = var.log_days
}


//task def

resource "aws_ecs_task_definition" "mindful_motion_task-M" {
  family                   = var.task_definition_family
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_definition_cpu
  memory                   = var.task_definition_memory
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn



  //from old code*
  container_definitions = jsonencode([
    {
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
  name = var.ecs_service_name

  cluster         = aws_ecs_cluster.mindful_motion_ecs-M.id
  task_definition = aws_ecs_task_definition.mindful_motion_task-M.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {

    subnets          = [var.subnet1_id, var.subnet2_id]
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = var.container_image_name
    container_port   = var.app_port
  }


}


// ECS Execution Role 
// this allows ECS to pull images and write logs
resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "ecs-execution-role"
  }
}

// Excecution Role
resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}



