
//ALB
resource "aws_lb" "mindful-motion-lb" {

  name               = var.alb_name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id_alb]



  subnets = [var.subnet1_id, var.subnet2_id]

  enable_deletion_protection = false


  tags = {

    Environment = var.environment_tag
  }
}

// ALB target group with health checks
resource "aws_lb_target_group" "alb-tg-M" {
  name        = var.alb_tg_name
  target_type = "ip"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id

  health_check {
    path                = var.health_check_path
    matcher             = var.health_check_matcher
    interval            = var.health_check_interval
    timeout             = var.health_check_timeout
    healthy_threshold   = var.health_check_healthy_threshold
    unhealthy_threshold = var.health_check_unhealthy_threshold
  }
}


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



resource "aws_lb_listener" "HTTPS" {
  load_balancer_arn = aws_lb.mindful-motion-lb.arn
  port              = var.https_port
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb-tg-M.arn
  }
}

