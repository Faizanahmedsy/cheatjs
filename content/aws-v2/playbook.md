<callout icon="💡" color="yellow_bg">
The exam is not a memory test. Almost every question is a short story: a company has a problem and some rules. You pick the AWS design that fits the rules <b>best</b>. Often 2 answers "work" — only one fits the exact words in the question.
</callout>

## 🪜 The 5-step method (use on every question)

1. <b>Read the last sentence first.</b> It tells you what they want: cheapest? fastest? least work? most secure?
2. <b>Circle the requirement words</b> — "MOST cost-effective", "LEAST operational overhead", "highly available", "lowest latency", "securely", "without code changes".
3. <b>Note the constraints</b> — existing tech (MySQL, Windows, Kubernetes), data size, how fast, how often, compliance rules.
4. <b>Kill 2 wrong answers fast.</b> Usually one is plain wrong (service can't do it) and one breaks a rule (too costly, single AZ, needs custom code).
5. <b>Compare the last 2 on the circled word only.</b> If the question says "least operational overhead", the more managed/serverless answer wins even if both work.

## 🔑 Requirement words decoder

| Question says | Usually means pick |
| --- | --- |
| LEAST operational overhead / least management | Fully managed or serverless (Lambda, Fargate, DynamoDB, Aurora Serverless, S3) — not EC2 you manage |
| MOST cost-effective | The cheapest option that still meets <b>every</b> requirement |
| Highly available | Spread across multiple AZs (Multi-AZ, ALB + Auto Scaling in 2+ AZs) |
| Fault tolerant | Keeps working with zero interruption when a part fails (extra copies already running) |
| Disaster recovery / Region failure | A second Region + cross-Region replication + Route 53 failover |
| Decouple / loosely coupled | SQS (queue) or SNS (fan-out) or EventBridge |
| Real-time streaming | Kinesis Data Streams |
| Load streaming data into S3 / Redshift with no code | Amazon Data Firehose |
| Without changing application code | Lift-and-shift options, managed versions of what they already use |
| Securely / privately (no internet) | VPC endpoints, PrivateLink, private subnets, Direct Connect |
| Lowest latency for global users | CloudFront (HTTP content) or Global Accelerator (TCP/UDP, static IP) |

## 🧭 Keyword → service quick map

| If you see… | Think… |
| --- | --- |
| Path-based or host-based routing, HTTP | Application Load Balancer |
| Static IP, TCP/UDP, millions of requests, ultra-low latency | Network Load Balancer |
| Third-party firewall appliances | Gateway Load Balancer |
| Shared file storage for many Linux EC2 | EFS |
| Windows file share, SMB, Active Directory | FSx for Windows File Server |
| High-performance computing, ML training files | FSx for Lustre |
| Disk for one EC2, IOPS | EBS (io2 for highest IOPS, gp3 general) |
| Archive, rarely accessed, years of retention | S3 Glacier (Deep Archive is cheapest) |
| Unknown or changing access pattern | S3 Intelligent-Tiering |
| Key-value, millions of requests/sec, single-digit ms | DynamoDB |
| Microsecond reads on DynamoDB | DAX |
| Relational DB, global low-latency reads, fast cross-Region DR | Aurora Global Database |
| Read-heavy relational DB | Read replicas and/or ElastiCache |
| Too many DB connections from Lambda | RDS Proxy |
| Session state / sub-millisecond cache | ElastiCache (Redis) |
| Data warehouse, BI, complex analytics | Redshift |
| SQL queries directly on files in S3 | Athena |
| ETL, CSV → Parquet, data catalog | Glue |
| Private access from VPC to S3/DynamoDB, free | Gateway VPC endpoint |
| Private access to other AWS services or SaaS | Interface endpoint / PrivateLink |
| Connect many VPCs + on-prem | Transit Gateway |
| Consistent, private, high bandwidth to on-prem | Direct Connect |
| Quick encrypted link to on-prem | Site-to-Site VPN |
| Move 100s of TB, internet too slow | Snowball Edge (Snow Family) |
| Online, scheduled file transfer to AWS | DataSync |
| On-prem apps using cloud storage with local cache | Storage Gateway |
| Database migration (same or different engine) | DMS (+ Schema Conversion Tool if engines differ) |
| Audit who did what (API calls) | CloudTrail |
| Track configuration changes / compliance rules | AWS Config |
| Metrics, logs, alarms | CloudWatch |
| Threat detection | GuardDuty |
| PII / sensitive data in S3 | Macie |
| SQL injection, XSS, rate limiting | WAF |
| DDoS protection | Shield (Advanced for paid support + cost protection) |
| Rotate database passwords automatically | Secrets Manager |
| Temporary credentials, no long-term keys | IAM roles (STS) |
| Restrict what whole accounts can do | SCPs in AWS Organizations |
| App users sign-up/login, social login | Cognito |
| Steady 24/7 workload, 1–3 years | Reserved Instances / Savings Plans |
| Can be interrupted, flexible | Spot Instances |
| Spiky/unpredictable, short tasks | Lambda |
| Ordered messages, exactly-once | SQS FIFO |
| Multi-step workflow with retries | Step Functions |

## 🚑 Disaster recovery strategies (cheap → expensive)

- <b>RPO</b> (Recovery Point Objective) = how much data you can afford to lose. Like: "how many minutes of unsaved work is OK to lose?"
- <b>RTO</b> (Recovery Time Objective) = how long you can be down. Like: "how fast must the shop reopen?"

| Strategy | Analogy | RPO / RTO | Cost |
| --- | --- | --- | --- |
| Backup & Restore | Photocopies in a locker; rebuild the shop from them | Hours | Cheapest |
| Pilot Light | Gas pilot flame always on — only the core (database) runs in DR Region | Tens of minutes | Low |
| Warm Standby | A small branch shop already open, just scale it up | Minutes | Medium |
| Multi-site Active/Active | Two full shops open in two cities all the time | Near zero | Highest |

## 🪤 Classic traps

- <b>Multi-AZ ≠ read replicas.</b> Multi-AZ = standby copy for failover (availability). Read replicas = extra copies to share reading load (performance).
- <b>Security group is stateful</b> (reply traffic auto-allowed). <b>NACL is stateless</b> (must allow both directions) and works at subnet level.
- Gateway endpoints exist <b>only for S3 and DynamoDB</b>.
- Lambda runs <b>max 15 minutes</b>. Longer jobs → ECS/Fargate, Batch or EC2.
- EBS lives in <b>one AZ</b>. Instance store data is lost when the instance stops.
- One NAT gateway is a single point of failure — for HA use <b>one per AZ</b>.
- SQS is <b>pull</b> (consumers poll). SNS is <b>push</b>. SQS + SNS together = fan-out.
- An answer that needs you to write and run custom scripts is usually wrong when a managed AWS feature does the same thing.
- Never use the root account for daily work. Enable MFA on it.
- "Encrypt with keys the company fully controls in dedicated hardware" → CloudHSM, not just KMS.

## 🏛️ Well-Architected Framework (the exam's foundation)

The exam is built on 6 pillars: <b>Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability</b>. Domains 1–4 map to Security, Reliability, Performance, Cost.

## ⏱️ Exam-day tactics

- 130 minutes for 65 questions → about 2 minutes each. Don't get stuck.
- If unsure after 2 minutes: pick your best guess, <b>flag it</b>, move on. Come back at the end.
- Multiple-response questions tell you how many to pick ("Choose two"). Pick exactly that many.
- No negative marking → answer every single question.
- Some questions are unscored experiments. A weird question may not even count — stay calm.

<callout icon="🚧" color="gray_bg">
<b>Coming soon:</b> more worked example questions per domain, added by AI following the AI Writer Instructions on the main page.
</callout>
