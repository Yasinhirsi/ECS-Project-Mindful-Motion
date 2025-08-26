module "vpc" {
  source = "./modules/vpc"


  vpc_cidr             = var.vpc_cidr
  public_subnet_1_cidr = var.public_subnet_1_cidr
  public_subnet_1_az   = var.public_subnet_1_az
  public_subnet_2_cidr = var.public_subnet_2_cidr
  public_subnet_2_az   = var.public_subnet_2_az
  route_table_cidr     = var.route_table_cidr
}


module "security_groups" {
  source = "./modules/security_groups"

  vpc_id = module.vpc.vpc_id //pass vpc id from vpc module to this module, (use vpc_id = var.vpc.id and dont reference module inside this modules)

  http_port      = var.http_port
  https_port     = var.https_port
  app_port       = var.app_port
  alb_sg_name    = var.alb_sg_name
  ecs_sg_name    = var.ecs_sg_name
  allow_all_cidr = var.allow_all_cidr

}
