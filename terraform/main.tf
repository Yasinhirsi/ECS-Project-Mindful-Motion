// This is where all my resources will go for now

//VPC
resource "aws_vpc" "mindful-motion-vpc-M" {
  cidr_block           = "10.0.0.0/16" //can add to tfvars later
  enable_dns_hostnames = true
  enable_dns_support   = true
}

// Public Subnet 1
resource "aws_subnet" "public-subnet-1-M" {
  vpc_id                  = aws_vpc.mindful-motion-vpc-M.id //tfvars
  cidr_block              = "10.0.1.0/24"                   //tfvars
  availability_zone       = "eu-west-2a"                    //tfvars
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-1-M"
  }
}

// Public Subnet 2
resource "aws_subnet" "public-subnet-2-M" {
  vpc_id                  = aws_vpc.mindful-motion-vpc-M.id
  cidr_block              = "10.0.2.0/24" //tfvars
  availability_zone       = "eu-west-2b"  //tfvars
  map_public_ip_on_launch = true
  tags = {
    Name = "public-subnet-2-M"
  }
}


// Internet Gateway 
resource "aws_internet_gateway" "igw-mindful-M" {
  vpc_id = aws_vpc.mindful-motion-vpc-M.id //tfvars

  tags = {
    Name = "igw-mindful-M"
  }
}


//route table
resource "aws_route_table" "mindful-motion-rt-M" {
  vpc_id = aws_vpc.mindful-motion-vpc-M.id //tfvars

  route {
    cidr_block = "0.0.0.0/0"                           // accept traffic from anywhere
    gateway_id = aws_internet_gateway.igw-mindful-M.id //tfvars
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



// Security Group for ALB (allows http and https)

resource "aws_security_group" "alb_sg" {
  name   = "alb_sg"
  vpc_id = aws_vpc.mindful-motion-vpc-M.id

  tags = {
    Name = "alb_sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

//HTTPS RULE
resource "aws_vpc_security_group_ingress_rule" "HTTPS_RULE" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}

//OUTBOUND RULE (ALLOW ALL TRAFFIC)
resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.alb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}


//ECS SECURITY GROUP allows traffic from alb

resource "aws_security_group" "ecs_sg" {
  name   = "ecs_sg"
  vpc_id = aws_vpc.mindful-motion-vpc-M.id



  tags = {
    Name = "ecs_sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_tls_ipv4" {
  security_group_id            = aws_security_group.ecs_sg.id
  referenced_security_group_id = aws_security_group.alb_sg.id // this is to allow traffic from  alb sg
  from_port                    = 3000
  ip_protocol                  = "tcp"
  to_port                      = 3000
}


resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4_2" {
  security_group_id = aws_security_group.ecs_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
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

// ECS Task Role 
resource "aws_iam_role" "ecs_task_role" {
  name = "ecs-task-role"

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
    Name = "ecs-task-role"
  }
}

// Basic policy for your application (logs, etc.)
resource "aws_iam_policy" "ecs_task_policy" {
  name        = "ecs-task-policy"
  description = "Basic permissions for ECS tasks"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_policy.arn
}


// PHASE 3 ALB

//ALB
resource "aws_lb" "mindful-motion-lb" {
  name               = "mindful-motion-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public-subnet-1-M.id, aws_subnet.public-subnet-2-M.id]

  enable_deletion_protection = false


  tags = {
    Environment = "production"
  }
}

// ALB target group with health checks
resource "aws_lb_target_group" "alb-tg-M" {
  name        = "alb-tg-M"
  target_type = "ip" //needed for ECS Tasks, TCP is for ALB TO ALB (NOT NEEDED)
  port        = 3000 //port the app runs on
  protocol    = "HTTP"
  vpc_id      = aws_vpc.mindful-motion-vpc-M.id

  health_check {
    path                = "/"
    matcher             = "200-399" #
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}


//ALB LISTENER

//REDIRECT ACTION TO REDIRECT PORT 80 TRAFFIC TO PORT 443 (HTTP>HTTPS) AFTER I ADD CERT, HTTP FOR NOW!!

//http traffic
# resource "aws_lb_listener" "HTTP" {
#   load_balancer_arn = aws_lb.mindful-motion-lb.arn
#   port              = "80"
#   protocol          = "HTTP"

#   default_action { //change default action to REDIRECT after ACM part
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.alb-tg-M.arn
#   }

# }


//redirect http traffic to https
resource "aws_lb_listener" "http-redirect" {
  load_balancer_arn = aws_lb.mindful-motion-lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}


//# HTTPS listener (443) with ACM cert -> forward to TG add this later!!!!

resource "aws_lb_listener" "HTTPS" {
  load_balancer_arn = aws_lb.mindful-motion-lb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.cert.arn //avoid using hardcoded ARN

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb-tg-M.arn
  }
}





//ECS 

//ecs cluster 
resource "aws_ecs_cluster" "mindful_motion_ecs-M" {
  name = "mindful_motion_ecs-M"
}

//cloudwatch log group 
resource "aws_cloudwatch_log_group" "cw_log_group" {
  name              = "cw_log_group"
  retention_in_days = 7
}


//task def

resource "aws_ecs_task_definition" "mindful_motion_task-M" {
  family                   = "mindful_motion_task-M"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn


  //from old code*
  container_definitions = jsonencode([
    {
      name  = "mindful-motion-app"
      image = "487148038595.dkr.ecr.eu-west-2.amazonaws.com/mindful-motion-v2:latest"

      portMappings = [
        {
          containerPort = 3000
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
          "awslogs-group"         = aws_cloudwatch_log_group.cw_log_group.name
          "awslogs-region"        = "eu-west-2"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}




// ecs service 

resource "aws_ecs_service" "mindful-service-M" {
  name            = "mindful-service-M"
  cluster         = aws_ecs_cluster.mindful_motion_ecs-M.id
  task_definition = aws_ecs_task_definition.mindful_motion_task-M.arn
  desired_count   = 1
  launch_type     = "FARGATE"
  depends_on      = [aws_lb_listener.HTTPS] //ensures alb is created first.


  network_configuration {
    subnets          = [aws_subnet.public-subnet-1-M.id, aws_subnet.public-subnet-2-M.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.alb-tg-M.arn
    container_name   = "mindful-motion-app"
    container_port   = 3000
  }


}



//ACM  //data block as cert already exists
data "aws_acm_certificate" "cert" {
  domain      = "tm.yasinhirsi.com"
  statuses    = ["ISSUED"]
  most_recent = true
}
