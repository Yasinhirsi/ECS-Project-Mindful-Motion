terraform {
  backend "s3" {
    bucket       = "mindful-motion-terraform-state-487148038595"
    key          = "mindful-motion/terraform.tfstate"
    region       = "eu-west-2" ##var.region wouldnt work as backend is processed first
    encrypt      = true
    use_lockfile = true ## for state locking (s3 state locking as dynamodb is depracated)
  }
}
