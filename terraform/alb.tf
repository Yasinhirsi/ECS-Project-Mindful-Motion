
//ALB
resource "aws_lb" "mindful-motion-lb" {
  #   name               = "mindful-motion-lb"
  name               = var.alb_name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public-subnet-1-M.id, aws_subnet.public-subnet-2-M.id]

  enable_deletion_protection = false


  tags = {
    # Environment = "production" //not sure about this
    Environment = var.environment_tag
  }
}

// ALB target group with health checks
resource "aws_lb_target_group" "alb-tg-M" {
  #   name        = "alb-tg-M"
  name        = var.alb_tg_name
  target_type = "ip" //needed for ECS Tasks, TCP is for ALB TO ALB (NOT NEEDED)
  #   port        = 3000 //port the app runs on
  port     = var.app_port
  protocol = "HTTP"
  vpc_id   = aws_vpc.mindful-motion-vpc-M.id

  health_check {
    # path                = "/"
    path = var.health_check_path

    # matcher             = "200-399" 
    matcher = var.health_check_matcher

    # interval            = 30
    interval = var.health_check_interval
    # timeout             = 5
    timeout = var.health_check_timeout
    # healthy_threshold   = 2
    healthy_threshold = var.health_check_healthy_threshold

    #     unhealthy_threshold = 2
    unhealthy_threshold = var.health_check_unhealthy_threshold
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
  port              = var.http_port
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = var.https_port
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}


//# HTTPS listener (443) with ACM cert -> forward to TG add this later!!!!

resource "aws_lb_listener" "HTTPS" {
  load_balancer_arn = aws_lb.mindful-motion-lb.arn
  port              = var.https_port
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = data.aws_acm_certificate.cert.arn // data. to avoid using hardcoded ARN

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb-tg-M.arn
  }
}

