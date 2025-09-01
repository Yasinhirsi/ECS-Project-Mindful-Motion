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

module "alb" {
  source = "./modules/alb"

  //pass needed things from vpc module
  vpc_id     = module.vpc.vpc_id
  subnet1_id = module.vpc.subnet1_id
  subnet2_id = module.vpc.subnet2_id

  //pass sg id from sg module
  security_group_id_alb = module.security_groups.security_group_id_alb


  app_port   = var.app_port
  http_port  = var.http_port
  https_port = var.https_port

  alb_name                         = var.alb_name
  alb_tg_name                      = var.alb_tg_name
  health_check_healthy_threshold   = var.health_check_healthy_threshold
  health_check_interval            = var.health_check_interval
  health_check_matcher             = var.health_check_matcher
  health_check_unhealthy_threshold = var.health_check_unhealthy_threshold
  health_check_path                = var.health_check_path
  health_check_timeout             = var.health_check_timeout
  environment_tag                  = var.environment_tag

  certificate_arn = data.aws_acm_certificate.cert.arn
}



module "ecs" {
  source = "./modules/ecs"







  //module calls needed
  target_group_arn      = module.alb.target_group_arn
  ecs_security_group_id = module.security_groups.ecs_security_group_id
  subnet1_id            = module.vpc.subnet1_id
  subnet2_id            = module.vpc.subnet2_id



  app_port = var.app_port



  log_days                      = var.log_days
  aws_region                    = var.aws_region
  logstream_prefix              = var.logstream_prefix
  NEXT_PUBLIC_SUPABASE_ANON_KEY = var.NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_SUPABASE_URL      = var.NEXT_PUBLIC_SUPABASE_URL
  ecs_cluster_name              = var.ecs_cluster_name
  task_definition_cpu           = var.task_definition_cpu
  task_definition_family        = var.task_definition_family
  task_definition_memory        = var.task_definition_memory
  log_group_name                = var.log_group_name
  container_image               = var.container_image
  container_image_name          = var.container_image_name
  ecs_service_name              = var.ecs_service_name
  desired_count                 = var.desired_count

}
