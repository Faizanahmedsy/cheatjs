<callout icon="⭐" color="yellow_bg">
Every service listed in the official SAA-C03 exam guide. <b>Priority stars:</b> ⭐⭐⭐ = core, asked a lot · ⭐⭐ = know it well · ⭐ = just know what it does. Deep notes for each service will be added inside the domain pages.
</callout>

## 🖥️ Compute

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ Amazon EC2 | Renting a computer by the hour | Virtual servers. You pick size, OS and pay while it runs | "full control of OS", "lift and shift", instance types |
| ⭐⭐⭐ EC2 Auto Scaling | Shop calls extra staff in Diwali rush, sends them home after | Adds/removes EC2 instances automatically by load or schedule | "unpredictable traffic", "scale out/in", target tracking |
| ⭐ AWS Batch | Bulk laundry service — drop clothes, they handle machines | Runs large queues of batch jobs and manages the compute for you | "thousands of batch jobs", "no cluster management" |
| ⭐ AWS Elastic Beanstalk | Give the cook your recipe, they run the whole kitchen | Upload code; it creates servers, load balancer, scaling | "developers deploy quickly without managing infrastructure" |
| ⭐ AWS Outposts | AWS ships a mini-AWS rack to your office | AWS hardware and services in your own data center | "low latency to on-prem", "data must stay on-premises" |
| ⭐ AWS Serverless Application Repository | App store for ready-made serverless apps | Find, share and deploy pre-built Lambda apps | "reuse serverless apps" |
| ⭐ VMware Cloud on AWS | Shift your house with all furniture exactly as it is | Run existing VMware workloads on AWS hardware | "existing VMware", "vSphere" |
| ⭐ AWS Wavelength | AWS kiosk inside the mobile tower | Compute inside 5G telecom networks for ultra-low mobile latency | "5G", "mobile edge" |

## ⚡ Serverless

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ AWS Lambda | Light that turns on only when someone enters; pay per second used | Runs your code when an event happens. Max 15 minutes per run | "serverless", "event-driven", "S3 upload triggers", "short tasks" |
| ⭐⭐⭐ AWS Fargate | Booking a cab — you ride, you don't own or maintain the car | Runs containers (with ECS or EKS) without managing servers | "containers without managing EC2" |

## 📦 Containers

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐ Amazon ECR | A cupboard to store packed lunch boxes (container images) | Private registry for Docker/container images | "store container images" |
| ⭐⭐⭐ Amazon ECS | AWS's own manager that runs your lunch boxes on time | AWS-native container orchestration | "run containers", "AWS-native" |
| ⭐⭐⭐ Amazon EKS | A popular international manager (Kubernetes), managed by AWS | Managed Kubernetes | "Kubernetes", "open source", "portable" |
| ⭐ ECS Anywhere / EKS Anywhere / EKS Distro | The same manager running containers in your own building | Run ECS/Kubernetes on your own servers | "containers on-premises" |

## 🗄️ Storage

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ Amazon S3 | An endless, super-safe Google Drive for files | Object storage, 99.999999999% (11 nines) durability, many storage classes | "static website", "objects", "data lake", "durable" |
| ⭐⭐⭐ Amazon S3 Glacier | Cheap godown outside the city — slow to fetch | Archive storage classes: Instant Retrieval, Flexible Retrieval, Deep Archive | "archive", "rarely accessed", "keep 7 years" |
| ⭐⭐⭐ Amazon EBS | A pen drive plugged into one computer | Block storage disk for one EC2, lives in one AZ (gp3, io2, st1, sc1) | "boot volume", "IOPS", "database on EC2" |
| ⭐⭐⭐ Amazon EFS | A shared family almirah many people open at once | Shared file system for many Linux instances, multi-AZ, grows automatically | "shared storage", "Linux", "NFS", "many instances" |
| ⭐⭐ Amazon FSx | Special almirahs for special families | Managed file systems: Windows File Server, Lustre (HPC), NetApp ONTAP, OpenZFS | "Windows SMB / AD" → FSx Windows · "HPC / ML" → FSx Lustre |
| ⭐⭐ AWS Storage Gateway | A bridge connecting your office cupboard to the cloud godown | Hybrid storage: File, Volume and Tape gateways with local cache | "on-prem apps use cloud storage", "replace tapes" |
| ⭐⭐ AWS Backup | One backup manager for every cupboard | Central backup plans across EC2, EBS, RDS, DynamoDB, EFS etc., cross-Region/account | "centralize backups", "backup compliance" |

## 🗃️ Database

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ Amazon RDS | A neat register with rows and columns, AWS does the maintenance | Managed relational DB: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server; Multi-AZ, read replicas | "relational", "SQL", "joins", "transactions" |
| ⭐⭐⭐ Amazon Aurora | RDS on steroids | AWS-built MySQL/PostgreSQL-compatible DB, 6 copies across 3 AZs, up to 15 replicas, Global Database | "high-performance relational", "global reads" |
| ⭐⭐ Aurora Serverless | A database that sleeps when no one uses it | Aurora that scales capacity up and down automatically | "unpredictable / intermittent workload" |
| ⭐⭐⭐ Amazon DynamoDB | A giant phonebook — give the name, get the number instantly | Serverless NoSQL key-value DB, single-digit ms; DAX cache, Global Tables, Streams | "key-value", "massive scale", "serverless", "ms latency" |
| ⭐⭐⭐ Amazon ElastiCache | Keeping most-used files on your desk instead of the storeroom | In-memory cache: Redis (Valkey) or Memcached | "sub-millisecond", "session store", "reduce DB load" |
| ⭐⭐ Amazon Redshift | A huge warehouse for studying years of sales data | Columnar data warehouse for SQL analytics at petabyte scale | "data warehouse", "BI", "OLAP", "complex analytics" |
| ⭐ Amazon DocumentDB | A file of JSON forms | MongoDB-compatible document DB | "MongoDB" |
| ⭐ Amazon Keyspaces | — | Cassandra-compatible DB | "Cassandra" |
| ⭐ Amazon Neptune | A friends-of-friends map | Graph DB for relationships | "social network", "relationships", "fraud graph" |

## 🌐 Networking and Content Delivery

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ Amazon VPC | Your own gated society inside AWS | Private network: subnets, route tables, internet/NAT gateways, security groups, NACLs, endpoints | "isolated network", "private subnet" |
| ⭐⭐⭐ Elastic Load Balancing | Traffic police sending cars to free lanes | ALB (HTTP, path routing), NLB (TCP/UDP, static IP, ultra-fast), GWLB (third-party firewalls) | "distribute traffic", "path-based", "static IP" |
| ⭐⭐⭐ Amazon Route 53 | The internet's phonebook (name → address) | DNS with routing policies: simple, weighted, latency, failover, geolocation, geoproximity, multivalue; health checks | "DNS", "failover", "route by latency/location" |
| ⭐⭐⭐ Amazon CloudFront | Local shops stocking popular items near your home | CDN that caches content at edge locations worldwide | "global users", "static content", "reduce latency" |
| ⭐⭐ AWS Global Accelerator | An express highway into AWS from anywhere | 2 static anycast IPs, AWS private backbone, fast Regional failover, TCP/UDP | "static IP", "non-HTTP", "gaming", "instant failover" |
| ⭐⭐ AWS Direct Connect | A private road from your office to AWS | Dedicated private line, consistent speed; takes weeks to set up | "consistent bandwidth", "private, not over internet" |
| ⭐⭐ AWS Site-to-Site VPN | A secret tunnel under the public road | Encrypted IPsec link over the internet, quick to set up | "quick", "encrypted", "backup for Direct Connect" |
| ⭐ AWS Client VPN | Each employee's personal tunnel from their laptop | Managed VPN for individual users | "remote employees" |
| ⭐⭐ AWS Transit Gateway | A central railway junction joining many lines | Hub to connect many VPCs and on-prem networks | "many VPCs", "transitive routing", "hub-and-spoke" |
| ⭐⭐ AWS PrivateLink | A private intercom between two societies | Interface VPC endpoints to reach services privately | "without internet", "expose service to other VPCs" |

## 🔐 Security, Identity and Compliance

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ IAM | Security guard + ID cards with room permissions | Users, groups, roles and JSON policies for AWS access | "least privilege", "roles", "policies" |
| ⭐⭐ AWS IAM Identity Center | One office ID card that opens every branch | Single sign-on across AWS accounts and apps | "SSO", "workforce users", "many accounts" |
| ⭐⭐ Amazon Cognito | Sign-up/login counter for your app's customers | User pools (login) and identity pools (temporary AWS access) | "mobile/web app users", "social login" |
| ⭐⭐⭐ AWS KMS | A key locker run by AWS | Create and manage encryption keys, rotation, key policies | "encrypt at rest", "customer managed key" |
| ⭐ AWS CloudHSM | Your own private locker; only you hold the key | Dedicated hardware security module you fully control | "full control of keys", "dedicated HSM" |
| ⭐⭐ AWS Secrets Manager | A locked diary that changes your passwords by itself | Stores secrets with automatic rotation | "rotate DB credentials automatically" |
| ⭐⭐ AWS Certificate Manager | Free SSL certificate office that renews for you | Provides and renews TLS certificates for ALB, CloudFront, API Gateway | "HTTPS", "encrypt in transit" |
| ⭐⭐ AWS WAF | Bouncer checking each visitor for bad behaviour | Web firewall: SQL injection, XSS, rate limits, geo blocking | "SQL injection", "block IPs/countries" |
| ⭐⭐ AWS Shield | A riot shield against floods of fake traffic | DDoS protection; Standard free, Advanced paid with response team | "DDoS" |
| ⭐⭐ Amazon GuardDuty | Smart CCTV that spots suspicious behaviour | Threat detection from CloudTrail, VPC Flow Logs, DNS logs | "detect threats", "compromised instance" |
| ⭐ Amazon Macie | A sniffer dog for personal data | Finds sensitive data (PII) in S3 | "PII", "sensitive data in S3" |
| ⭐ Amazon Inspector | A health check-up for weaknesses | Scans EC2, ECR images, Lambda for vulnerabilities | "vulnerability scanning", "CVE" |
| ⭐ Amazon Detective | The investigator after the alarm rings | Root-cause analysis of security findings | "investigate", "root cause" |
| ⭐ AWS Security Hub | One security dashboard for everything | Collects findings and checks best practices across accounts | "central security view" |
| ⭐ AWS Firewall Manager | Head of security setting rules for all branches | Central WAF, Shield, security group rules across an Organization | "enforce firewall rules across accounts" |
| ⭐ AWS Network Firewall | Main gate firewall for the whole society | Managed stateful firewall for VPC traffic | "inspect VPC traffic" |
| ⭐ AWS Directory Service | A company staff register (Microsoft AD) in the cloud | Managed Microsoft Active Directory | "Active Directory" |
| ⭐ AWS Resource Access Manager | Lending your car to a neighbour | Share resources (subnets, Transit Gateway) across accounts | "share across accounts" |
| ⭐ AWS Artifact | A file of AWS's certificates and audit reports | Download compliance reports (SOC, PCI, ISO) | "compliance reports" |

## 🔗 Application Integration

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ Amazon SQS | Bank token queue — jobs wait in line | Message queue to decouple apps; Standard vs FIFO, DLQ, visibility timeout | "decouple", "buffer", "queue" |
| ⭐⭐⭐ Amazon SNS | WhatsApp broadcast group | Pub/sub push to many: email, SMS, Lambda, SQS (fan-out) | "notify", "fan-out", "many subscribers" |
| ⭐⭐ Amazon EventBridge | Smart postman routing letters by rules | Event bus with rules, schedules and SaaS events | "event-driven", "react to events", "cron" |
| ⭐⭐ AWS Step Functions | A recipe card with steps and retries | Visual workflow orchestration | "multi-step workflow", "retries", "coordinate Lambdas" |
| ⭐ Amazon MQ | Old familiar postman (ActiveMQ/RabbitMQ) | Managed message broker for existing apps | "migrate existing broker", "AMQP/MQTT" |
| ⭐ Amazon AppFlow | A courier that moves data from SaaS apps | Transfers data from Salesforce, Slack etc. to S3/Redshift | "SaaS data to AWS" |

## 📱 Front-End Web and Mobile

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ Amazon API Gateway | Reception desk for your app's APIs | Create REST/HTTP/WebSocket APIs with auth, throttling, caching | "serverless API", "throttle requests" |
| ⭐ AWS Amplify | Starter kit to build and host web/mobile apps | Hosting and backend tools for front-end developers | "full-stack web/mobile quickly" |
| ⭐ AWS Device Farm | A room full of real phones to test your app | Test apps on real devices | "test on real devices" |

## 📊 Analytics

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐ Amazon Athena | Ask questions straight to files in S3 | Serverless SQL on S3, pay per data scanned | "ad-hoc SQL on S3", "no infrastructure" |
| ⭐⭐ AWS Glue | Data washer + labelled catalogue | Serverless ETL, crawlers, Data Catalog, format conversion | "ETL", "CSV to Parquet", "catalog" |
| ⭐⭐⭐ Amazon Kinesis | A conveyor belt for live data | Data Streams (real-time, custom apps), Data Firehose (delivery to S3/Redshift, no code), Video Streams | "real-time", "streaming", "clickstream", "IoT" |
| ⭐⭐ Amazon EMR | A big factory of computers for big data | Managed Hadoop/Spark clusters | "Hadoop", "Spark", "big data processing" |
| ⭐ AWS Lake Formation | Security office for your data lake | Build and secure data lakes with fine-grained permissions | "data lake permissions" |
| ⭐ Amazon MSK | The famous Kafka conveyor belt, managed | Managed Apache Kafka | "Kafka" |
| ⭐ Amazon OpenSearch Service | Google search for your own logs and text | Search and log analytics | "full-text search", "log analytics" |
| ⭐ Amazon Quick (formerly QuickSight) | Turns numbers into charts | BI dashboards and visualization | "dashboards", "visualize" |
| ⭐ Amazon Redshift | (see Database) | Data warehouse | "warehouse" |
| ⭐ AWS Data Exchange | A market to buy datasets | Subscribe to third-party data | "third-party data" |
| ⭐ AWS Data Pipeline | Older data mover | Legacy data workflow service | rarely the answer |

## 🤖 Machine Learning (just know who does what)

| Service | Like I'm 5 | What it really does |
| --- | --- | --- |
| ⭐ Amazon Comprehend | Reads text and tells the mood | NLP: sentiment, entities, key phrases |
| ⭐ Amazon Lex | A chatbot brain | Build chatbots (voice/text) |
| ⭐ Amazon Polly | Reads text out loud | Text → speech |
| ⭐ Amazon Transcribe | Writes down what people say | Speech → text |
| ⭐ Amazon Translate | A translator | Language translation |
| ⭐ Amazon Rekognition | Eyes that recognise faces and objects | Image/video analysis |
| ⭐ Amazon Textract | Reads scanned forms and receipts | Extract text and tables from documents |
| ⭐ Amazon SageMaker AI | A lab to build your own ML models | Build, train, deploy ML models |

## 🛠️ Management and Governance

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐⭐ Amazon CloudWatch | A fitness band for your apps | Metrics, logs, alarms, dashboards | "monitor", "alarm", "CPU metric" |
| ⭐⭐⭐ AWS CloudTrail | CCTV recording who did what | Logs every API call for auditing | "who deleted", "audit API calls" |
| ⭐⭐ AWS Config | A photo album of settings + rule checker | Records configuration history and checks compliance rules | "configuration changes", "compliance over time" |
| ⭐⭐ AWS Organizations | Parent company managing child companies | Group accounts, SCPs, consolidated billing | "multiple accounts", "SCP" |
| ⭐⭐ AWS Control Tower | Ready-made safe setup for many accounts | Landing zone with guardrails on top of Organizations | "set up multi-account quickly with guardrails" |
| ⭐⭐ AWS CloudFormation | A blueprint that builds the building by itself | Infrastructure as code templates | "repeatable infrastructure", "IaC" |
| ⭐⭐ AWS Systems Manager | Remote control for all your servers | Session Manager, Patch Manager, Run Command, Parameter Store | "patch fleet", "no SSH/bastion" |
| ⭐ AWS Auto Scaling | One scaling plan for many services | Scaling plans across EC2, ECS, DynamoDB, Aurora | "scale multiple resources" |
| ⭐ AWS Compute Optimizer | A tailor telling you your server size is wrong | Right-sizing recommendations | "right-size", "over-provisioned" |
| ⭐ AWS Service Catalog | An approved menu card for teams | Pre-approved products teams can launch | "approved products only" |
| ⭐ AWS Health Dashboard | AWS's notice board about outages affecting you | Service health and planned events | "AWS outage affecting account" |
| ⭐ AWS License Manager | Tracks software licences | Manage Microsoft/Oracle licences | "licence tracking" |
| ⭐ Amazon Managed Grafana / Managed Service for Prometheus | Popular dashboards and metrics tools, managed | Managed open-source monitoring | "Prometheus", "Grafana" |
| ⭐ AWS Proton | Templates for platform teams | Standard deployment templates for containers/serverless | "platform team templates" |
| ⭐ AWS Well-Architected Tool | A checklist to review your design | Reviews workloads against the 6 pillars | "review architecture" |
| ⭐ AWS CLI / Management Console | Typing commands / clicking buttons | Ways to control AWS | — |

## 🚚 Migration and Transfer

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐ AWS DMS | Shifting a shop's stock while the shop stays open | Migrate databases with minimal downtime; with Schema Conversion Tool for different engines | "migrate database", "Oracle to Aurora" |
| ⭐⭐ AWS DataSync | Fast online movers for files | Moves/syncs files from NFS/SMB to S3, EFS, FSx | "online transfer", "scheduled sync" |
| ⭐⭐ AWS Snow Family | AWS sends a rugged hard-disk box by courier | Offline data transfer devices (Snowball Edge) | "TBs/PBs", "slow internet", "offline" |
| ⭐ AWS Transfer Family | A managed SFTP door into S3 | Managed SFTP/FTPS/FTP into S3 or EFS | "SFTP", "partners upload files" |
| ⭐ AWS Application Migration Service | Lift the whole server and drop it in AWS | Lift-and-shift server migration | "rehost", "lift and shift servers" |
| ⭐ AWS Application Discovery Service | Surveying your house before shifting | Discovers on-prem servers and dependencies | "plan migration" |

## 💸 Cost Management

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐⭐ AWS Cost Explorer | Your passbook with spending graphs | View and forecast costs | "analyze spending" |
| ⭐⭐ AWS Budgets | Alarm when monthly pocket money runs out | Alerts when cost/usage crosses a limit | "alert when spending exceeds" |
| ⭐ AWS Cost and Usage Report | The most detailed bill | Line-by-line billing data | "most granular cost data" |
| ⭐⭐⭐ Savings Plans | Monthly metro pass — commit, get discount | Commit \$/hour for 1 or 3 years for big discounts | "steady usage", "flexible commitment" |

## 🔍 Other

| Service | Like I'm 5 | What it really does | Exam clue words |
| --- | --- | --- | --- |
| ⭐ AWS X-Ray | GPS tracker following one order through every counter | Traces requests across microservices | "trace", "find bottleneck in microservices" |
| ⭐ Amazon Kinesis Video Streams | Live CCTV feed into the cloud | Ingest and store video streams | "video streams", "cameras" |

<callout icon="🚧" color="gray_bg">
<b>Coming soon:</b> full 3-level notes (Like I'm 5 → Explained simply → Exam lens) for each ⭐⭐⭐ and ⭐⭐ service, written inside the domain pages by AI.
</callout>
