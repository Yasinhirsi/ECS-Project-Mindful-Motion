# Mindful Motion - Complete DevOps Infrastructure Project

## Table of Contents
- [Project Overview](#project-overview)
- [Application Features](#application-features)
- [Infrastructure Overview](#infrastructure-overview)
- [Terraform State Management](#terraform-state-management)
- [Architecture Diagram](#architecture-diagram)
- [CI/CD Pipelines](#cicd-pipelines)
- [Docker Implementation](#docker-implementation)
- [Local Setup](#local-setup)
- [Security Considerations](#security-considerations)
- [Monitoring and Observability](#monitoring-and-observability)
- [Support](#support)
- [Author](#author)

## Project Overview

**Mindful Motion** is a comprehensive full-stack project that demonstrates both modern web application development and production-ready DevOps practices. This project showcases a Next.js application with AI-powered features (emotion analysis, daily check-ins) deployed on AWS with automated CI/CD pipelines.

## Application Features

### Core Application
- **Next.js 15** application with modern React patterns
- **Facial Emotion Analysis** using face-api.js for real-time emotion detection
- **Daily Check-in System** with custom NLP sentiment analysis and emotion detection algorithms
- **Responsive Design** optimised for mobile and desktop
- **Real-time Updates** with modern web technologies

### App Demos
📹 **[App Features Demo](https://www.loom.com/share/cccc2c4bc8b44cf6a21888e03bd8baa1?sid=b28e5686-b5d7-46fc-883e-2d9f0a5a568e)** - See the daily check-in system, facial emotion analysis, and other features in action!

📹 **[CI/CD Pipeline Demo](https://www.loom.com/share/a826cd56fc5d45ca9e537ba851f809b3?sid=251be87e-cca5-4c12-b6f3-522cd7c925a2)** - Watch the complete deployment process with security scanning and manual controls!

### Technical Stack
- **Frontend:** Next.js 15, React, TypeScript
- **AI/ML:** face-api.js for facial emotion detection, custom NLP sentiment analysis
- **Backend:** Supabase for authentication and database
- **Styling:** Modern CSS with responsive design
- **State Management:** React hooks and context

## Infrastructure Overview

### Cloud Platform
- **AWS** as the primary cloud provider
- **Multi-AZ deployment** for high availability
- **Production-ready** architecture with security best practices

### Core Services
- **VPC** with public subnets across availability zones
- **Application Load Balancer** with HTTPS support
- **ECS Fargate** for serverless container orchestration
- **CloudWatch** for logging and monitoring
- **ACM** for SSL/TLS certificate management

### Security Features
- **Security Groups** with least privilege access
- **IAM Roles** following AWS best practices
- **VPC isolation** with proper network segmentation
- **HTTPS enforcement** with automatic redirects

## Terraform State Management

### Remote Backend Configuration
- **S3 Backend** for centralised state storage in `eu-west-2`
- **State encryption** enabled for security compliance
- **Centralised state management** for team collaboration

### Benefits of Remote State
- **Team collaboration** without state conflicts
- **Centralised backup** and disaster recovery
- **State consistency** across different environments

## Architecture Diagram

![Architecture Diagram](images/new.gif)

### Architecture Components
1. **CI/CD Pipeline:** GitHub Actions → Terraform → AWS
2. **Container Registry:** Docker → Amazon ECR
3. **Load Balancing:** Application Load Balancer with health checks
4. **Container Orchestration:** ECS Fargate across multiple AZs
5. **External Services:** Supabase backend, Cloudflare CDN
6. **Monitoring:** CloudWatch logs and metrics

### Data Flow
- **Users** → Cloudflare → ALB → ECS → Application
- **Application** → Supabase for backend services
- **CI/CD** → Terraform → AWS infrastructure provisioning

## CI/CD Pipelines

### GitHub Actions Workflows

#### 1. CI Pipeline (`ci.yml`)
- **Trigger:** Push to main branch
- **Actions:**
  - Build and optimise Docker image
  - Push to Amazon ECR
  - Run Trivy vulnerability scanning
  - Multi-stage builds for security

#### 2. Infrastructure Pipeline (`deploy.yml`)
- **Trigger:** Manual workflow dispatch
- **Actions:**
  - Terraform validation and linting
  - Infrastructure deployment/destruction
  - Manual confirmation required for destructive actions
  - Proper timeouts and error handling

### Pipeline Features
- **Matrix builds** for parallel validation
- **Manual confirmations** for safety
- **Timeout limits** to prevent hanging workflows
- **Environment protection** for production

## Docker Implementation

### Multi-Stage Build Strategy
```dockerfile
# Build Stage
FROM node:20-alpine AS builder
# Build optimisation and dependency installation

# Production Stage  
FROM node:20-alpine AS production
# Minimal runtime with non-root user
```

### Best Practices Implemented

#### 1. Image Size Optimisation
- **Next.js standalone output** eliminates `node_modules`
- **Multi-stage builds** separate build and runtime
- **Alpine Linux base** for minimal footprint
- **Layer caching** optimisation for faster builds

#### 2. Security Enhancements
- **Non-root user** (`appuser`) for container security
- **Build arguments** for secure credential passing
- **Minimal runtime dependencies** only
- **Health checks** for container monitoring

### Security Scanning in Action
![Trivy Vulnerability Scan](images/trivy-scan-results.png)

The image above shows Trivy detecting a HIGH severity vulnerability and blocking the ECR push, demonstrating the security-first approach.

#### 3. Build Efficiency
- **Dependency layer caching** for faster rebuilds
- **Context optimisation** with `.dockerignore`
- **Optimised package installation**

### Image Size Results
- **Before optimisation:** 1.34GB
- **After optimisation:** 290MB
- **Size reduction:** **78% improvement** (from 1.34GB to 290MB)

#### Visual Proof of Optimisation
**Before Optimisation (1.34GB):**
![Before: Large Docker Image](images/before-optimization.png)

**After Optimisation (290MB):**
![After: Optimised Docker Image](images/after-optimization.png)

## Local Setup

### Prerequisites
- **AWS CLI** configured with appropriate credentials
- **Terraform** 1.11 or higher (for native s3 locking as dynamoDB not needed anymore)
- **Docker** and **Docker Compose** for local container testing
- **Node.js** 18+ for local development

### Quick Start

#### 1. Clone and Setup
```bash
git clone https://github.com/Yasinhirsi/ECS-Project-Mindful-Motion
cd ECS-Project-Mindful-Motion
```

#### 2. Configure Terraform Variables
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

#### 3. Initialise Terraform
```bash
terraform init
terraform plan
```

#### 4. Local Docker Testing
```bash
cd ..
docker-compose up --build
# Or for detached mode:
# docker-compose up -d --build
```

### Required Configuration

#### AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and Region
```

#### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

#### Terraform Variables
Update `terraform.tfvars` with your values:
- **AWS Region** (e.g., `eu-west-2`)
- **Domain name** (if using custom domain)
- **VPC CIDR blocks** (if customising network)

## Security Considerations

### Secrets Management
- **GitHub Secrets** for sensitive configuration
- **No hardcoded credentials** in code
- **Proper IAM roles** with least privilege

### Network Security
- **VPC isolation** with security groups
- **HTTPS enforcement** with ACM certificates
- **Public subnets** with controlled access
- **Security group rules** for specific ports only

### Container Security
- **Non-root users** in containers
- **Vulnerability scanning** with Trivy
- **Minimal attack surface** with optimised images

## Monitoring and Observability

### CloudWatch Integration
- **ECS service logs** with simple logging
- **Load balancer access logs** for traffic analysis

### Health Checks
- **ALB health checks** for service availability
- **Container health checks** for application status

## Support

For questions or issues:
- **Create an issue** in the GitHub repository
- **Consult architecture** diagram for understanding

## Author

**Yasin Hirsi**  
- BSc Computer Science (First Class) – Queen Mary University of London  
- DevOps Engineer | AWS | Terraform | Docker | CI/CD | Kubernetes
- [LinkedIn](https://www.linkedin.com/in/yhirsi) • [GitHub](https://github.com/Yasinhirsi) 

If you like this project, consider giving it a ⭐ to support!
