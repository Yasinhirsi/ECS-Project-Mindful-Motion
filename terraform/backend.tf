terraform {
  backend "s3" {
    bucket       = "mindful-motion-terraform-state-487148038595"
    key          = "mindful-motion/terraform.tfstate"
    region       = "eu-west-2"
    encrypt      = true
    use_lockfile = true
  }
}
