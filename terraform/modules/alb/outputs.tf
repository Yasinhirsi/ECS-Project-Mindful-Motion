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


# output "certificate_arn" {
#   value = data.aws_acm_certificate.cert.arn
# }

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

