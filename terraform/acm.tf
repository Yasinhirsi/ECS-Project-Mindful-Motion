//ACM  //data block as cert already exists
data "aws_acm_certificate" "cert" {
  #   domain      = "tm.yasinhirsi.com"
  domain      = var.domain_name
  statuses    = ["ISSUED"]
  most_recent = true
}
