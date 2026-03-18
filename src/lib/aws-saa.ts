import {
  Cloud,
  Server,
  Database,
  Shield,
  Network,
  HardDrive,
  Globe,
  Lock,
  Gauge,
  Box,
  type LucideIcon,
} from "lucide-react";

type CodeStep = {
  title: string;
  explanation: string;
  code?: string;
  language?: string;
  text?: string;
};

export type AWSTopic = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  content: {
    title: string;
    description: string;
    steps: CodeStep[];
  };
};

export type AWSGroup = {
  name: string;
  topics: AWSTopic[];
};

// Compute Group
const computeTopics: AWSTopic[] = [
  {
    id: "ec2",
    label: "EC2",
    icon: Server,
    href: "/aws-saa?topic=ec2",
    content: {
      title: "Amazon EC2 (Elastic Compute Cloud)",
      description:
        "Virtual servers in the cloud — instance types, pricing models, placement groups, and auto scaling.",
      steps: [
        {
          title: "EC2 Instance Types",
          explanation:
            "EC2 offers different instance families optimized for various workloads. The naming convention is: [Family][Generation].[Size].",
          text: `EC2 Instance Type Naming Convention
Example: m5.xlarge
  m  → Family (General Purpose)
  5  → Generation
  xlarge → Size


INSTANCE FAMILIES (Exam Favorites!)


General Purpose (T, M)
Balanced compute, memory, networking
Use: Web servers, code repos, small databases
t3.micro  → Free tier eligible, burstable
m5.large  → Production workloads

Compute Optimized (C)
High-performance processors
Use: Batch processing, ML inference, gaming servers
c5.2xlarge → CPU-intensive workloads

Memory Optimized (R, X)
Fast performance for large datasets in memory
Use: In-memory caches (Redis), real-time big data
r5.xlarge  → Memory-intensive apps
x1.16xlarge → SAP HANA, in-memory databases

Storage Optimized (I, D, H)
High sequential read/write to local storage
Use: Data warehousing, distributed file systems
i3.large → High I/O, NVMe SSD

Accelerated Computing (P, G, F)
Hardware accelerators (GPUs, FPGAs)
Use: Machine learning training, graphics rendering
p3.2xlarge → GPU instance for ML


KEY EXAM TIP: Match workload to instance family!
"Needs more CPU" → C family
"Needs more RAM" → R family
"Needs GPU" → P/G family
"Balance of resources" → M or T family
`,
        },
        {
          title: "EC2 Pricing Models",
          explanation:
            "Understanding pricing is crucial for the exam. AWS asks you to choose the most cost-effective option.",
          text: `
EC2 PRICING MODELS


1. ON-DEMAND
Pay by the second (Linux) or hour (Windows)
No commitment, no upfront payment
Use: Short-term, unpredictable workloads
Most expensive per unit time

2. RESERVED INSTANCES (RI) — Up to 72% discount
Commit to 1 or 3 years
Types:
  Standard RI    → Can't change instance type (biggest discount)
  Convertible RI → Can change instance type (smaller discount)
  Scheduled RI   → Reserve for specific time windows
Use: Steady-state, predictable workloads (databases, baseline)

3. SAVINGS PLANS — Up to 72% discount
Commit to $/hour for 1 or 3 years
More flexible than RIs
Types:
  Compute Savings Plan → Any instance family, region, OS
  EC2 Savings Plan     → Specific instance family in a region
Use: Flexible commitment across services

4. SPOT INSTANCES — Up to 90% discount!
Use spare EC2 capacity
Can be interrupted with 2-min warning
Use: Batch jobs, data analysis, image processing
NEVER use for: Databases, critical applications
Exam tip: "Cost-effective for fault-tolerant workloads"

5. DEDICATED HOSTS
Physical server dedicated to you
Most expensive option
Use: Compliance requirements, server-bound licenses
Exam tip: "Licensing" or "compliance" → Dedicated Host

6. DEDICATED INSTANCES
Hardware dedicated to you, but shared within your account
Less control than Dedicated Hosts


EXAM CHEAT SHEET:
"Cheapest for batch/fault tolerant" → Spot
"Steady state / predictable"       → Reserved
"Short term / unpredictable"       → On-Demand
"Licensing / compliance"           → Dedicated Host
"Flexible commitment"              → Savings Plans
`,
        },
        {
          title: "Auto Scaling & Load Balancing",
          explanation:
            "Auto Scaling ensures you have the right number of EC2 instances. ELB distributes traffic across them.",
          text: `
AUTO SCALING GROUP (ASG)


ASG automatically adjusts EC2 instance count
Components:
  Launch Template → AMI, instance type, security groups
  Scaling Policies → When to scale

Scaling Types:
1. Dynamic Scaling
   - Target Tracking: "Keep CPU at 50%"
   - Step Scaling: "If CPU > 70%, add 2 instances"
   - Simple Scaling: "If alarm, add 1 instance"

2. Predictive Scaling
   - Uses ML to predict traffic patterns
   - Pre-provisions instances before spike

3. Scheduled Scaling
   - Scale based on known patterns
   - "Every Friday at 5pm, add 10 instances"

ASG Settings:
Minimum: 2        (never go below)
Desired: 4        (normal operation)
Maximum: 10       (peak traffic cap)


ELASTIC LOAD BALANCER (ELB)


1. Application Load Balancer (ALB) — Layer 7
   HTTP/HTTPS, path-based routing
   Use: Web applications, microservices
   Can route to different target groups:
     /api/*  → API servers
     /app/*  → App servers
   Supports: WebSockets, HTTP/2

2. Network Load Balancer (NLB) — Layer 4
   TCP/UDP, ultra-low latency (~100ms vs ~400ms ALB)
   Millions of requests per second
   Use: Gaming, IoT, real-time streaming
   Has static IP / Elastic IP

3. Gateway Load Balancer (GWLB) — Layer 3
   Use: Firewalls, intrusion detection, deep packet inspection
   Routes traffic through virtual appliances


EXAM TIPS:
"HTTP routing" → ALB
"Ultra low latency / TCP" → NLB
"Static IP" → NLB
"Security appliances" → GWLB
`,
        },
      ],
    },
  },
  {
    id: "lambda",
    label: "Lambda",
    icon: Gauge,
    href: "/aws-saa?topic=lambda",
    content: {
      title: "AWS Lambda",
      description:
        "Serverless compute — run code without managing servers. Pay only for what you use.",
      steps: [
        {
          title: "Lambda Essentials",
          explanation:
            "Lambda runs your code in response to events. No servers to manage, automatic scaling, pay per invocation.",
          code: `# ═══════════════════════════════════════════════
# AWS LAMBDA KEY CONCEPTS
# ═══════════════════════════════════════════════

# What is Lambda?
# - Serverless compute service
# - Upload code → AWS runs it
# - Auto scales (0 to thousands of concurrent executions)
# - Pay per request + compute time

# Limits (IMPORTANT for exam!):
# Memory:           128 MB to 10 GB
# Timeout:          Up to 15 minutes MAX
# Deployment:       50 MB zipped, 250 MB unzipped
# Env variables:    4 KB
# /tmp storage:     512 MB to 10 GB
# Concurrent:       1000 (soft limit, can increase)

# Pricing:
# First 1 million requests/month → FREE
# $0.20 per 1 million requests after
# $0.0000166667 per GB-second of compute

# ═══════════════════════════════════════════════
# LAMBDA TRIGGERS (Common Event Sources)
# ═══════════════════════════════════════════════

# API Gateway       → REST API endpoints
# S3                → File upload/delete events
# DynamoDB Streams  → Database changes
# SQS               → Queue messages
# SNS               → Notifications
# CloudWatch Events → Scheduled (cron) jobs
# Kinesis           → Real-time data streams

# Example Lambda Function (Python)
import json

def lambda_handler(event, context):
    """
    event: Input data (from trigger)
    context: Runtime info (memory, timeout, request ID)
    """
    name = event.get('name', 'World')
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'message': f'Hello {name}!'
        })
    }

# ═══════════════════════════════════════════════
# EXAM TIPS:
# "Serverless" → Lambda (or Fargate)
# "Run code < 15 min" → Lambda
# "Event-driven" → Lambda
# "Need to run > 15 min" → NOT Lambda (use EC2/ECS)
# "Cost-effective for sporadic workloads" → Lambda
# ═══════════════════════════════════════════════`,
          language: "python",
        },
      ],
    },
  },
  {
    id: "ecs-fargate",
    label: "ECS & Fargate",
    icon: Box,
    href: "/aws-saa?topic=ecs-fargate",
    content: {
      title: "ECS & Fargate (Containers)",
      description:
        "Run Docker containers on AWS — ECS for orchestration, Fargate for serverless containers.",
      steps: [
        {
          title: "ECS vs Fargate vs EKS",
          explanation:
            "Understanding when to use each container service is key for the exam.",
          text: `
CONTAINER SERVICES COMPARISON


ECS (Elastic Container Service)
- AWS's own container orchestration
- Two launch types:
  1. EC2 Launch Type → You manage the EC2 instances
  2. Fargate Launch Type → Serverless (no servers!)
- Integrated with ALB, IAM, CloudWatch

FARGATE
- Serverless compute for containers
- No EC2 instances to manage
- Pay for vCPU and memory used
- Use: When you don't want to manage infrastructure

EKS (Elastic Kubernetes Service)
- Managed Kubernetes on AWS
- Use: If you already use/need Kubernetes
- Can also use Fargate launch type
- More complex than ECS, but more portable

ECR (Elastic Container Registry)
- Store Docker images on AWS
- Like Docker Hub but private and integrated with ECS/EKS


EXAM DECISION TREE:
"Docker containers on AWS" → ECS or EKS
"Serverless containers" → Fargate
"Kubernetes" → EKS
"Store Docker images" → ECR
"Don't want to manage EC2" → Fargate
"Need full control of infra" → ECS with EC2 launch type
`,
        },
      ],
    },
  },
];

// Storage Group
const storageTopics: AWSTopic[] = [
  {
    id: "s3",
    label: "S3",
    icon: HardDrive,
    href: "/aws-saa?topic=s3",
    content: {
      title: "Amazon S3 (Simple Storage Service)",
      description:
        "Object storage with 99.999999999% (11 nines) durability. The backbone of AWS storage.",
      steps: [
        {
          title: "S3 Storage Classes",
          explanation:
            "S3 offers different storage classes optimized for different access patterns and cost requirements. This is heavily tested on the exam.",
          text: `
S3 STORAGE CLASSES


1. S3 STANDARD
   - General purpose, frequently accessed data
   - 99.99% availability, 11 nines durability
   - Low latency, high throughput
   - Use: Active data, websites, content distribution

2. S3 STANDARD-IA (Infrequent Access)
   - Less frequently accessed, but needs rapid access
   - Lower storage cost, retrieval fee applies
   - 99.9% availability
   - Use: Backups, disaster recovery
   - Min storage: 30 days, 128 KB

3. S3 ONE ZONE-IA
   - Like Standard-IA but single AZ
   - 99.5% availability (lower than Standard-IA)
   - 20% cheaper than Standard-IA
   - Use: Secondary backup copies, data you can recreate

4. S3 GLACIER INSTANT RETRIEVAL
   - Archive storage with millisecond access
   - Min storage: 90 days
   - Use: Quarterly accessed archives

5. S3 GLACIER FLEXIBLE RETRIEVAL
   - Low-cost archive storage
   - Retrieval: Expedited (1-5 min), Standard (3-5 hr), Bulk (5-12 hr)
   - Min storage: 90 days
   - Use: Backup, disaster recovery archives

6. S3 GLACIER DEEP ARCHIVE
   - Lowest cost storage class
   - Retrieval: Standard (12 hr), Bulk (48 hr)
   - Min storage: 180 days
   - Use: Long-term compliance data, 7-10 year retention

7. S3 INTELLIGENT-TIERING
   - Automatically moves data between tiers
   - Small monthly monitoring fee
   - No retrieval fees
   - Use: Unpredictable access patterns


EXAM CHEAT SHEET:
"Frequently accessed"     → S3 Standard
"Infrequent, rapid access"→ S3 Standard-IA
"Lowest cost, can wait"   → Glacier Deep Archive
"Unknown access pattern"  → Intelligent-Tiering
"Can recreate data"       → One Zone-IA
`,
        },
        {
          title: "S3 Security & Encryption",
          explanation:
            "S3 security combines bucket policies, ACLs, and encryption. Understanding these is critical for the exam.",
          code: `# ═══════════════════════════════════════════════
# S3 SECURITY
# ═══════════════════════════════════════════════

# BUCKET POLICIES (Resource-based, JSON)
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-bucket/*"
        }
    ]
}
# Use: Cross-account access, public access, VPC endpoint access

# BLOCK PUBLIC ACCESS (Account-level safety)
# Enable at account level to prevent accidental public buckets
# Can override bucket policies that grant public access

# ═══════════════════════════════════════════════
# S3 ENCRYPTION
# ═══════════════════════════════════════════════

# Server-Side Encryption (SSE):
# 1. SSE-S3 (Default)
#    - AWS manages keys entirely
#    - AES-256 encryption
#    - Header: "x-amz-server-side-encryption": "AES256"

# 2. SSE-KMS
#    - AWS KMS manages keys
#    - User control + audit trail via CloudTrail
#    - May hit KMS API limits at high throughput
#    - Header: "x-amz-server-side-encryption": "aws:kms"

# 3. SSE-C
#    - Customer provides encryption key
#    - AWS does NOT store the key
#    - HTTPS required
#    - Must provide key with every request

# Client-Side Encryption:
#    - YOU encrypt before uploading
#    - YOU decrypt after downloading
#    - AWS never sees unencrypted data

# EXAM TIPS:
# "Audit key usage" → SSE-KMS
# "Customer manages keys" → SSE-C
# "Default encryption" → SSE-S3
# "AWS never sees data unencrypted" → Client-side encryption
# "Encryption in transit" → HTTPS/TLS (always available)`,
          language: "json",
        },
        {
          title: "S3 Advanced Features",
          explanation:
            "Versioning, lifecycle rules, replication, and presigned URLs are frequently tested.",
          text: `
S3 ADVANCED FEATURES


VERSIONING
- Keep multiple versions of an object
- Enabled at bucket level
- Protects against accidental deletes
- Delete adds a "delete marker" (can restore)
- MUST enable for Cross-Region Replication

LIFECYCLE RULES
Automatically transition or expire objects
Example:
  Day 0  → S3 Standard (active use)
  Day 30 → S3 Standard-IA (less frequent)
  Day 90 → S3 Glacier (archive)
  Day 365 → Delete

Can apply to:
- Current versions
- Previous versions (with versioning)
- Incomplete multipart uploads

REPLICATION
Cross-Region Replication (CRR)
  - Compliance, lower latency access, cross-account
  - Requires versioning on both buckets
Same-Region Replication (SRR)
  - Log aggregation, live replication between accounts

PRESIGNED URLs
Temporary access to private objects
aws s3 presign s3://my-bucket/file.pdf --expires-in 3600
Anyone with the URL can access the object for 1 hour

S3 TRANSFER ACCELERATION
Uses CloudFront edge locations for faster uploads
Upload to nearest edge → AWS backbone → S3 bucket

MULTIPART UPLOAD
Required for files > 5 GB
Recommended for files > 100 MB
Parallel upload of parts → faster

S3 SELECT / GLACIER SELECT
Query data with SQL without retrieving entire object
"Get me only rows where status = 'active'"
Up to 400% faster, 80% cheaper than getting whole object`,
        },
      ],
    },
  },
  {
    id: "ebs-efs",
    label: "EBS & EFS",
    icon: HardDrive,
    href: "/aws-saa?topic=ebs-efs",
    content: {
      title: "EBS & EFS (Block & File Storage)",
      description:
        "EBS for single EC2 block storage, EFS for shared file storage across instances.",
      steps: [
        {
          title: "EBS Volume Types",
          explanation:
            "EBS provides block-level storage volumes for EC2 instances. Know the volume types for the exam.",
          text: `
EBS VOLUME TYPES


SSD-backed (for random I/O):
1. gp3 / gp2 (General Purpose SSD)
   - Baseline: 3,000 IOPS (gp3), 3 IOPS/GB (gp2)
   - Max: 16,000 IOPS
   - Use: Boot volumes, dev/test, small databases
   - gp3: Can set IOPS and throughput independently!

2. io2 / io1 (Provisioned IOPS SSD)
   - Max: 64,000 IOPS (Nitro instances)
   - Max: 256,000 IOPS (io2 Block Express)
   - Use: Critical databases (Oracle, SAP HANA)
   - Supports multi-attach (io1/io2 only)

HDD-backed (for sequential I/O):
3. st1 (Throughput Optimized HDD)
   - Max: 500 IOPS, 500 MB/s throughput
   - Use: Big data, data warehouse, log processing
   - CANNOT be boot volume

4. sc1 (Cold HDD)
   - Max: 250 IOPS, 250 MB/s throughput
   - Lowest cost HDD
   - Use: Infrequently accessed data
   - CANNOT be boot volume


EBS vs EFS vs Instance Store


EBS:
- Attached to ONE EC2 instance (except io1/io2 multi-attach)
- Locked to an Availability Zone
- Persist after instance termination (if configured)
- Can snapshot and copy across AZs/regions

EFS (Elastic File System):
- Shared across MANY EC2 instances
- Works across Availability Zones
- Linux only (POSIX file system)
- Pay per use (no provisioning)
- Use: Content management, web serving, shared config

Instance Store:
- Physically attached to host
- HIGHEST I/O performance
- EPHEMERAL — data lost if instance stops/terminates
- Use: Cache, temporary data, buffer

EXAM TIPS:
"Shared file storage" → EFS
"Database IOPS" → io2/io1
"Boot volume" → gp3/gp2
"Big data throughput" → st1
"Temporary high perf" → Instance Store
"Multi-AZ file share" → EFS
`,
        },
      ],
    },
  },
];

// Networking Group
const networkingTopics: AWSTopic[] = [
  {
    id: "vpc",
    label: "VPC",
    icon: Network,
    href: "/aws-saa?topic=vpc",
    content: {
      title: "VPC (Virtual Private Cloud)",
      description:
        "Your private network in AWS — subnets, route tables, internet gateways, NAT, and security.",
      steps: [
        {
          title: "VPC Architecture",
          explanation:
            "A VPC is your isolated section of the AWS cloud. Understanding its components is critical for the exam.",
          text: `
VPC COMPONENTS


VPC (Virtual Private Cloud)
- Your private network in AWS
- Region-scoped (spans all AZs in a region)
- CIDR block: e.g., 10.0.0.0/16 (65,536 IPs)
- Max 5 VPCs per region (soft limit)

SUBNETS
- Sub-range of VPC CIDR
- AZ-scoped (each subnet in ONE AZ)
- Public Subnet:  Has route to Internet Gateway
- Private Subnet: No direct internet access

Example VPC Design:
VPC: 10.0.0.0/16
├── Public Subnet AZ-a:  10.0.1.0/24 (web servers)
├── Public Subnet AZ-b:  10.0.2.0/24 (web servers)
├── Private Subnet AZ-a: 10.0.3.0/24 (app servers)
├── Private Subnet AZ-b: 10.0.4.0/24 (app servers)
├── Private Subnet AZ-a: 10.0.5.0/24 (databases)
└── Private Subnet AZ-b: 10.0.6.0/24 (databases)

INTERNET GATEWAY (IGW)
- Allows VPC to connect to the internet
- One per VPC
- Must add route in Route Table: 0.0.0.0/0 → IGW

NAT GATEWAY
- Allows PRIVATE subnet instances to access internet
- Instances CAN reach internet, but internet CAN'T reach them
- Deployed in PUBLIC subnet
- One per AZ for high availability
- Managed by AWS (vs NAT Instance which is self-managed)

ROUTE TABLE
Each subnet has a route table
Public subnet route table:
  10.0.0.0/16 → local
  0.0.0.0/0   → igw-xxxxx (Internet Gateway)
Private subnet route table:
  10.0.0.0/16 → local
  0.0.0.0/0   → nat-xxxxx (NAT Gateway)`,
        },
        {
          title: "Security Groups vs NACLs",
          explanation:
            "Two layers of network security in AWS. Understanding the differences is one of the most tested topics.",
          text: `
SECURITY GROUPS vs NACLs


SECURITY GROUPS (SG) — Instance Level

✓ STATEFUL (return traffic auto-allowed)
✓ Only ALLOW rules (no deny)
✓ Evaluates ALL rules before deciding
✓ Applied at ENI/instance level
✓ Can reference other security groups

Default: Allows ALL outbound, denies ALL inbound

Example:
Inbound: Allow TCP 80 from 0.0.0.0/0 (HTTP)
Inbound: Allow TCP 443 from 0.0.0.0/0 (HTTPS)
Inbound: Allow TCP 22 from 10.0.0.0/16 (SSH internal)

NETWORK ACLs (NACL) — Subnet Level

✓ STATELESS (must explicitly allow return traffic)
✓ ALLOW and DENY rules
✓ Rules evaluated in ORDER (lowest number first)
✓ Applied at subnet level
✓ Default NACL allows all in/out
✓ Custom NACL denies all by default

Example:
Rule 100: ALLOW TCP 80 from 0.0.0.0/0  (HTTP in)
Rule 110: ALLOW TCP 443 from 0.0.0.0/0 (HTTPS in)
Rule 120: DENY TCP 22 from 0.0.0.0/0   (Block SSH)
Rule *:   DENY all                       (Default deny)


COMPARISON TABLE:

Feature       | Security Group  | NACL
──────────────┼────────────────┼──────────────
Level         | Instance        | Subnet
State         | Stateful        | Stateless
Rules         | Allow only      | Allow & Deny
Evaluation    | All rules       | Order (number)
Default       | Deny inbound    | Allow all


EXAM TIP:
"Block specific IP" → NACL (has deny rules)
"Allow app to app traffic" → Security Group
"Stateful firewall" → Security Group
"Subnet-level control" → NACL`,
        },
        {
          title: "VPC Connectivity",
          explanation:
            "How to connect VPCs together, to on-premises, and to AWS services privately.",
          text: `
VPC CONNECTIVITY OPTIONS


1. VPC PEERING
- Connect two VPCs privately
- Works cross-account and cross-region
- NOT transitive (A↔B, B↔C doesn't mean A↔C)
- CIDR blocks must NOT overlap
- Must update route tables in BOTH VPCs

2. TRANSIT GATEWAY
- Hub-and-spoke model for VPC connectivity
- Connect thousands of VPCs and on-premises
- Transitive peering (A↔Hub↔C works!)
- Works across regions and accounts
- Use: Large organizations with many VPCs

3. VPN (Virtual Private Network)
- Encrypted tunnel over PUBLIC internet
- Components:
  Virtual Private Gateway (VPC side)
  Customer Gateway (on-premises side)
- Up to 1.25 Gbps
- Quick to set up (minutes)

4. DIRECT CONNECT (DX)
- DEDICATED private connection to AWS
- Does NOT go over the internet
- 1 Gbps or 10 Gbps
- Takes weeks/months to establish
- More reliable, more bandwidth
- Use: Large data transfers, hybrid architectures

Direct Connect + VPN
- DX with IPsec encryption
- Best of both: private + encrypted

5. VPC ENDPOINTS (PrivateLink)
- Access AWS services WITHOUT internet
- Gateway Endpoint: S3 and DynamoDB (free)
- Interface Endpoint: Most other services (ENI + costs)
- Stays within AWS network


EXAM TIPS:
"Connect 2 VPCs" → VPC Peering
"Connect many VPCs" → Transit Gateway
"Private connection to AWS" → Direct Connect
"Quick encrypted tunnel" → Site-to-Site VPN
"Access S3 without internet" → VPC Gateway Endpoint
"On-premises to AWS (fast)" → Direct Connect
`,
        },
      ],
    },
  },
  {
    id: "route53",
    label: "Route 53",
    icon: Globe,
    href: "/aws-saa?topic=route53",
    content: {
      title: "Amazon Route 53 (DNS)",
      description:
        "AWS's DNS service — domain registration, routing policies, and health checks.",
      steps: [
        {
          title: "Route 53 Routing Policies",
          explanation:
            "Route 53 routing policies determine how DNS queries are answered. This is heavily tested on the exam.",
          text: `
ROUTE 53 ROUTING POLICIES


1. SIMPLE ROUTING
- One record, one or more IP addresses
- If multiple IPs, client chooses randomly
- No health checks
- Use: Single resource

2. WEIGHTED ROUTING
- Route traffic based on assigned weights
- Example: 70% to v1, 30% to v2 (canary deployment)
- Weights don't need to sum to 100
- Can associate health checks
- Use: A/B testing, gradual migration

3. LATENCY-BASED ROUTING
- Route to lowest-latency region
- Evaluates latency between user and AWS regions
- Use: Global applications needing best performance
- Example: US users → us-east-1, EU users → eu-west-1

4. FAILOVER ROUTING
- Active-Passive failover
- Primary: Main resource (with health check)
- Secondary: Backup resource
- If primary fails health check → route to secondary
- Use: Disaster recovery

5. GEOLOCATION ROUTING
- Route based on user's GEOGRAPHIC LOCATION
- Country or continent level
- Must set a default record for non-matching locations
- Use: Content localization, restrict distribution

6. GEOPROXIMITY ROUTING
- Route based on geographic proximity
- Can use "bias" to shift traffic to/from resources
- Increase bias → more traffic to that resource
- Requires Route 53 Traffic Flow
- Use: Fine-grained geographic routing

7. MULTI-VALUE ANSWER
- Return multiple healthy records (up to 8)
- Client-side load balancing with health checks
- Like simple routing but with health checks
- NOT a replacement for ELB


EXAM TIPS:
"Lowest latency" → Latency-based
"A/B testing" → Weighted
"Disaster recovery" → Failover
"Restrict by country" → Geolocation
"Shift traffic by region" → Geoproximity
`,
        },
      ],
    },
  },
  {
    id: "cloudfront",
    label: "CloudFront",
    icon: Globe,
    href: "/aws-saa?topic=cloudfront",
    content: {
      title: "Amazon CloudFront (CDN)",
      description:
        "Content Delivery Network — cache content at edge locations worldwide for low-latency delivery.",
      steps: [
        {
          title: "CloudFront Essentials",
          explanation:
            "CloudFront caches content at 400+ edge locations worldwide. Understand origins, behaviors, and cache policies.",
          text: `
CLOUDFRONT KEY CONCEPTS


What is CloudFront?
- CDN: Caches content at edge locations
- Reduces latency for global users
- 400+ Points of Presence worldwide
- DDoS protection (integrated with AWS Shield)

ORIGINS (where content comes from):
- S3 Bucket → Static files, websites
- EC2 Instance → Dynamic content
- ALB → Application behind load balancer
- Custom HTTP Origin → Any web server

CloudFront + S3:
- S3 bucket doesn't need to be public!
- Use Origin Access Control (OAC) to restrict
- Only CloudFront can access the S3 bucket
- Users → CloudFront Edge → S3 (privately)

CACHE BEHAVIORS:
- Path pattern matching
- /images/* → Cache for 1 year
- /api/*    → No cache, forward to ALB
- /*        → Default behavior

TTL (Time to Live):
- How long objects stay in cache
- Default: 24 hours
- Can set min/max/default TTL
- Cache-Control and Expires headers

INVALIDATION:
- Force remove cached objects
- Costs money per invalidation
- Use versioned URLs instead (/image-v2.jpg)


CloudFront vs S3 Cross-Region Replication:

CloudFront:
- Global edge network (400+ locations)
- Cached for TTL period
- Great for static content served worldwide
- Files are cached, not replicated

S3 Cross-Region Replication:
- Must be set up for each desired region
- Files updated in near real-time
- Read-only replicas
- Great for dynamic content in few regions

EXAM TIPS:
"Global low latency" → CloudFront
"Restrict S3 access" → OAC (Origin Access Control)
"HTTPS for S3 website" → CloudFront in front of S3
"DDoS protection" → CloudFront + Shield
`,
        },
      ],
    },
  },
];

// Database Group
const databaseTopics: AWSTopic[] = [
  {
    id: "rds",
    label: "RDS & Aurora",
    icon: Database,
    href: "/aws-saa?topic=rds",
    content: {
      title: "RDS & Aurora (Relational Databases)",
      description:
        "Managed relational databases — RDS for standard engines, Aurora for high-performance MySQL/PostgreSQL.",
      steps: [
        {
          title: "RDS Overview",
          explanation:
            "RDS is a managed relational database service. AWS handles patching, backups, and high availability.",
          text: `
RDS SUPPORTED ENGINES


- PostgreSQL
- MySQL
- MariaDB
- Oracle
- Microsoft SQL Server
- Aurora (AWS proprietary)

WHY RDS vs EC2 with database?
RDS handles:
✓ Automated patching
✓ Continuous backups (Point-in-Time Recovery)
✓ Monitoring dashboards
✓ Multi-AZ for disaster recovery
✓ Read replicas for performance
✓ Storage auto-scaling
✗ You CANNOT SSH into RDS instances


RDS HIGH AVAILABILITY


MULTI-AZ (Disaster Recovery)
- Synchronous replication to standby in another AZ
- Automatic failover (DNS switches to standby)
- NOT used for read scaling (standby is passive)
- One DNS name, automatic failover
- Use: Production databases needing HA

READ REPLICAS (Performance)
- Asynchronous replication
- Up to 15 read replicas
- Can be cross-AZ or cross-region
- Application must update connection string
- Can be promoted to standalone DB
- Use: Read-heavy workloads, analytics


AURORA

- AWS proprietary (MySQL & PostgreSQL compatible)
- 5x performance of MySQL, 3x of PostgreSQL
- Storage auto-scales (10GB to 128TB)
- Up to 15 read replicas (< 10ms lag)
- 6 copies of data across 3 AZs
- Automatic failover (< 30 seconds)
- Costs 20% more than RDS, but more efficient

Aurora Serverless:
- Auto-scales compute based on demand
- Pay per second
- Use: Infrequent, intermittent, unpredictable workloads

Aurora Global Database:
- 1 Primary Region (read/write)
- Up to 5 secondary regions (read-only)
- < 1 second replication lag
- Promote secondary region in < 1 minute
- Use: Global low-latency reads, disaster recovery

EXAM TIPS:
"Disaster recovery" → Multi-AZ
"Read performance" → Read Replicas
"5x MySQL performance" → Aurora
"Serverless database" → Aurora Serverless
"Global database" → Aurora Global
`,
        },
      ],
    },
  },
  {
    id: "dynamodb",
    label: "DynamoDB",
    icon: Database,
    href: "/aws-saa?topic=dynamodb",
    content: {
      title: "Amazon DynamoDB (NoSQL)",
      description:
        "Fully managed NoSQL database with single-digit millisecond performance at any scale.",
      steps: [
        {
          title: "DynamoDB Core Concepts",
          explanation:
            "DynamoDB is a key-value and document database. Understanding its data model and capacity modes is essential.",
          text: `
DYNAMODB KEY CONCEPTS


DATA MODEL:
Table → Items → Attributes
(like Table → Rows → Columns in SQL)

PRIMARY KEY (must be decided at creation):
1. Partition Key only (Hash key)
   - Must be unique
   - Example: user_id
2. Partition Key + Sort Key (Composite)
   - Combination must be unique
   - Example: user_id (PK) + timestamp (SK)

CAPACITY MODES:
1. Provisioned (default)
   - Specify RCU and WCU (Read/Write Capacity Units)
   - Can enable auto-scaling
   - More cost-effective for predictable workloads
   - 1 RCU = 1 strongly consistent read/sec (4KB)
   - 1 WCU = 1 write/sec (1KB)

2. On-Demand
   - Auto-scales instantly
   - Pay per request
   - More expensive per request
   - Use: Unpredictable, spiky workloads


DYNAMODB FEATURES


DynamoDB Accelerator (DAX)
- In-memory cache for DynamoDB
- Microsecond latency (10x improvement)
- No code changes needed
- Use: Read-heavy, latency-sensitive apps

DynamoDB Streams
- Capture changes to items (insert, update, delete)
- Can trigger Lambda functions
- 24-hour retention
- Use: Real-time reactions, cross-region replication

Global Tables
- Multi-region, multi-active replication
- Low-latency access in multiple regions
- Requires DynamoDB Streams enabled
- Active-Active setup (read/write in any region)

TTL (Time to Live)
- Automatically delete items after expiry
- No extra cost
- Use: Session data, temporary records


EXAM TIPS:
"Serverless NoSQL" → DynamoDB
"Single-digit ms latency" → DynamoDB
"Microsecond latency" → DynamoDB + DAX
"Key-value store" → DynamoDB
"Multi-region active-active" → DynamoDB Global Tables
"Session storage" → DynamoDB (with TTL)
`,
        },
      ],
    },
  },
];

// Security Group
const securityTopics: AWSTopic[] = [
  {
    id: "iam",
    label: "IAM",
    icon: Lock,
    href: "/aws-saa?topic=iam",
    content: {
      title: "IAM (Identity & Access Management)",
      description:
        "Control who can access what in AWS — users, groups, roles, and policies.",
      steps: [
        {
          title: "IAM Core Concepts",
          explanation:
            "IAM is a global service (not region-specific). It's the foundation of AWS security and heavily tested.",
          code: `# ═══════════════════════════════════════════════
# IAM COMPONENTS
# ═══════════════════════════════════════════════

# USERS → Individual people
# GROUPS → Collection of users (e.g., Developers, Admins)
# ROLES → Assumed by services, apps, or users temporarily
# POLICIES → JSON documents defining permissions

# KEY PRINCIPLES:
# 1. Root account → NEVER use for daily tasks
# 2. One IAM user per physical person
# 3. One IAM role per application
# 4. Least privilege → Give minimum permissions needed

# ═══════════════════════════════════════════════
# IAM POLICIES (JSON)
# ═══════════════════════════════════════════════

# Policy structure:
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowS3Read",
            "Effect": "Allow",     # Allow or Deny
            "Action": [            # What actions
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [          # Which resources
                "arn:aws:s3:::my-bucket",
                "arn:aws:s3:::my-bucket/*"
            ],
            "Condition": {         # When (optional)
                "IpAddress": {
                    "aws:SourceIp": "10.0.0.0/8"
                }
            }
        }
    ]
}

# POLICY TYPES:
# AWS Managed    → Created by AWS, reusable
# Customer Managed → Created by you, reusable
# Inline         → Embedded in user/group/role (not reusable)

# POLICY EVALUATION:
# 1. Default: DENY everything
# 2. Explicit ALLOW overrides default deny
# 3. Explicit DENY overrides any allow
# → Deny ALWAYS wins!

# ═══════════════════════════════════════════════
# IAM ROLES (Critical for exam!)
# ═══════════════════════════════════════════════

# EC2 Role → Allow EC2 to access S3, DynamoDB, etc.
# Lambda Role → Allow Lambda to access AWS services
# Cross-Account Role → Allow another account access

# IMPORTANT: Use roles, not access keys!
# BAD:  Store AWS keys in EC2 instance
# GOOD: Attach IAM role to EC2 instance

# ═══════════════════════════════════════════════
# SECURITY TOOLS:
# ═══════════════════════════════════════════════
# IAM Credentials Report → Account-level, all users
# IAM Access Advisor → User-level, last accessed services
# AWS STS → Temporary security credentials
# MFA → Always enable for root and admin users!

# EXAM TIPS:
# "Grant EC2 access to S3" → IAM Role (not keys!)
# "Cross-account access" → IAM Role + STS AssumeRole
# "Deny always wins" → Even if Allow exists elsewhere
# "Temporary credentials" → STS + IAM Role
# ═══════════════════════════════════════════════`,
          language: "json",
        },
      ],
    },
  },
  {
    id: "security-services",
    label: "Security Services",
    icon: Shield,
    href: "/aws-saa?topic=security-services",
    content: {
      title: "AWS Security Services",
      description:
        "KMS, WAF, Shield, GuardDuty, and other security services — know when to use each.",
      steps: [
        {
          title: "Security Services Overview",
          explanation:
            "AWS has many security services. The exam tests whether you know which service to use for which scenario.",
          text: `
AWS SECURITY SERVICES


KMS (Key Management Service)
- Manage encryption keys
- Symmetric (AES-256) and Asymmetric (RSA, ECC)
- Integrated with most AWS services
- Customer Managed Keys (CMK) → You control
- AWS Managed Keys → AWS controls
- Audit via CloudTrail
Use: Encrypt data at rest (S3, EBS, RDS, etc.)

ACM (AWS Certificate Manager)
- Provision and manage SSL/TLS certificates
- Free public certificates
- Auto-renewal
- Integrated with ALB, CloudFront, API Gateway
Use: HTTPS for your applications

WAF (Web Application Firewall)
- Protect against common web exploits
- Layer 7 (HTTP) protection
- Deploys on: ALB, API Gateway, CloudFront
- Rules: IP filtering, SQL injection, XSS, rate limiting
Use: Protect web apps from attacks

AWS SHIELD
- DDoS protection
- Shield Standard: Free, automatic, all customers
- Shield Advanced: $3000/month, 24/7 DDoS response team
Use: DDoS protection

GUARD DUTY
- Intelligent threat detection
- Uses ML to analyze: CloudTrail, VPC Flow Logs, DNS
- Detects: Crypto mining, credential compromise, unusual API
Use: Threat detection and monitoring

AWS INSPECTOR
- Automated security assessments
- For EC2, Lambda, and ECR containers
- Checks: CVEs, network exposure, OS vulnerabilities
Use: Vulnerability scanning

AWS MACIE
- Discover and protect sensitive data in S3
- Uses ML to find PII (personally identifiable info)
Use: Data privacy compliance, find sensitive data

SECRETS MANAGER
- Store and rotate secrets (DB passwords, API keys)
- Automatic rotation every X days
- Integrated with RDS, Redshift, DocumentDB
Use: Store database credentials


EXAM QUICK REFERENCE:
"Encryption keys" → KMS
"SSL/TLS certificates" → ACM
"SQL injection protection" → WAF
"DDoS protection" → Shield
"Threat detection" → GuardDuty
"Vulnerability scanning" → Inspector
"Find sensitive data in S3" → Macie
"Store/rotate DB passwords" → Secrets Manager
`,
        },
      ],
    },
  },
];

// Architecture Group
const architectureTopics: AWSTopic[] = [
  {
    id: "well-architected",
    label: "Well-Architected",
    icon: Cloud,
    href: "/aws-saa?topic=well-architected",
    content: {
      title: "AWS Well-Architected Framework",
      description:
        "The 6 pillars of a well-architected system — the foundation for SAA exam architectural decisions.",
      steps: [
        {
          title: "6 Pillars of Well-Architected",
          explanation:
            "The Well-Architected Framework provides best practices for building reliable, secure, efficient, and cost-effective systems on AWS.",
          text: `
AWS WELL-ARCHITECTED FRAMEWORK — 6 PILLARS


1. OPERATIONAL EXCELLENCE
   "How well do you run and monitor?"
   - Perform operations as code (IaC)
   - Frequent, small, reversible changes
   - Refine operations procedures frequently
   - Anticipate and learn from failure
   - Services: CloudFormation, Config, CloudWatch

2. SECURITY
   "How well do you protect?"
   - Implement strong identity foundation (IAM)
   - Enable traceability (CloudTrail)
   - Apply security at all layers
   - Automate security best practices
   - Protect data in transit and at rest
   - Services: IAM, KMS, Shield, WAF, GuardDuty

3. RELIABILITY
   "Can it recover from failures?"
   - Automatically recover from failure
   - Test recovery procedures
   - Scale horizontally to increase availability
   - Stop guessing capacity (auto-scaling)
   - Manage change through automation
   - Services: Auto Scaling, Multi-AZ, Route 53

4. PERFORMANCE EFFICIENCY
   "How well do you use resources?"
   - Democratize advanced technologies
   - Go global in minutes
   - Use serverless architectures
   - Experiment more often
   - Services: Lambda, CloudFront, ElastiCache

5. COST OPTIMIZATION
   "Can you avoid unnecessary costs?"
   - Adopt a consumption model (pay for what you use)
   - Measure overall efficiency
   - Stop spending on data center operations
   - Analyze and attribute expenditure
   - Services: Spot Instances, Reserved, S3 tiers

6. SUSTAINABILITY
   "How do you minimize environmental impact?"
   - Understand your impact
   - Establish sustainability goals
   - Maximize utilization
   - Use managed services
   - Reduce downstream impact


EXAM TIP:  Many questions frame answers as
"Which solution follows AWS best practices?"
Think through these pillars when evaluating
architectural choices!
`,
        },
      ],
    },
  },
  {
    id: "common-architectures",
    label: "Common Patterns",
    icon: Cloud,
    href: "/aws-saa?topic=common-architectures",
    content: {
      title: "Common Architecture Patterns",
      description:
        "Frequently tested architectural patterns — serverless, microservices, event-driven, and more.",
      steps: [
        {
          title: "Classic 3-Tier Architecture",
          explanation:
            "The most common web application architecture on AWS — used as a baseline for many exam questions.",
          text: `
3-TIER WEB ARCHITECTURE


User → Route 53 → CloudFront
        ↓
[Public Subnet]
ALB (Application Load Balancer)
        ↓
[Private Subnet]
EC2 Auto Scaling Group (Application)
        ↓
[Private Subnet]
RDS Multi-AZ (Database)

Key Design Decisions:
✓ Multi-AZ for high availability
✓ ALB for load balancing (Layer 7)
✓ ASG for auto-scaling
✓ Database in private subnet
✓ NAT Gateway for outbound internet
✓ S3 for static assets


SERVERLESS ARCHITECTURE


User → CloudFront → S3 (static website)
        ↓
API Gateway → Lambda → DynamoDB
                ↓
             Cognito (auth)

Benefits:
✓ No server management
✓ Auto-scaling built in
✓ Pay per request
✓ High availability by default


EVENT-DRIVEN ARCHITECTURE


S3 Upload → Lambda → Process Image
              ↓
            SQS Queue → Lambda → Save to DynamoDB
              ↓
            SNS → Email Notification

Key Services:
SQS → Decouple components, buffer messages
SNS → Fan out notifications
EventBridge → Event bus for AWS + custom events
Step Functions → Orchestrate workflows


EXAM PATTERNS:
"Decouple architecture" → SQS between components
"Serverless web app" → S3 + CloudFront + API GW + Lambda
"Real-time processing" → Kinesis
"Batch processing" → SQS + Lambda or Step Functions
"Notification fan-out" → SNS to multiple SQS queues
`,
        },
      ],
    },
  },
];

// Export groups
export const awsGroups: AWSGroup[] = [
  {
    name: "Compute",
    topics: computeTopics,
  },
  {
    name: "Storage",
    topics: storageTopics,
  },
  {
    name: "Networking & Content Delivery",
    topics: networkingTopics,
  },
  {
    name: "Databases",
    topics: databaseTopics,
  },
  {
    name: "Security & Identity",
    topics: securityTopics,
  },
  {
    name: "Architecture",
    topics: architectureTopics,
  },
];

// Flat list of all topics for easy lookup
export const allAWSTopics = [
  ...computeTopics,
  ...storageTopics,
  ...networkingTopics,
  ...databaseTopics,
  ...securityTopics,
  ...architectureTopics,
];
