<callout icon="⭐" color="blue_bg">
<b>Single source of truth.</b> Everything for the SAA-C03 exam lives on this page and its subpages. If it is not here, it is not part of the plan. Pages marked 🚧 <b>Coming soon</b> will be filled one by one by an AI that follows the <b>AI Writer Instructions</b> section below.
</callout>

<table-of-contents />

## 📋 Exam at a glance

| Item | Detail |
| --- | --- |
| Exam code | SAA-C03 (Solutions Architect – Associate) |
| Questions | 65 total: 50 scored + 15 unscored (you can't tell which ones are unscored) |
| Question types | Multiple choice (1 right out of 4) and multiple response (2+ right out of 5+) |
| Time | 130 minutes (about 2 minutes per question) |
| Passing score | 720 out of 1000 (scaled score) |
| Negative marking | None. A blank answer is just wrong, so <b>never leave a question blank</b> |
| Scoring | You need to pass the whole exam, not each domain separately |
| Fee | USD 150 (check when booking) |

## 🗺️ How to use this page

1. Read the <b>Scenario Question Playbook</b> subpage first. It teaches you how to think like the exam.
2. Study domain by domain (Domain 1 → 4). Domain 1 is the biggest (30%).
3. Use the <b>AWS Services Encyclopedia</b> subpage whenever you meet a service name you don't know.
4. Tick the progress tracker below as each topic is done.

## 📊 Progress tracker

- [ ] Scenario Question Playbook read
- [ ] Services Encyclopedia skimmed once
- [x] Domain 1 · 1.1 Secure access to AWS resources
- [x] Domain 1 · 1.2 Secure workloads and applications
- [x] Domain 1 · 1.3 Data security controls
- [x] Domain 2 · 2.1 Scalable and loosely coupled architectures
- [ ] Domain 2 · 2.2 Highly available and fault-tolerant architectures
- [ ] Domain 3 · 3.1 High-performing storage
- [ ] Domain 3 · 3.2 High-performing compute
- [ ] Domain 3 · 3.3 High-performing databases
- [ ] Domain 3 · 3.4 High-performing networks
- [ ] Domain 3 · 3.5 Data ingestion and transformation
- [ ] Domain 4 · 4.1 Cost-optimized storage
- [ ] Domain 4 · 4.2 Cost-optimized compute
- [ ] Domain 4 · 4.3 Cost-optimized databases
- [ ] Domain 4 · 4.4 Cost-optimized networks
- [ ] Full practice test 1 (score: \_\_ )
- [ ] Full practice test 2 (score: \_\_ )
- [ ] Full practice test 3 (score: \_\_ )

## 📚 Full syllabus (official SAA-C03 exam guide)

The exam has <b>4 domains</b> (chapters). Each domain has <b>task statements</b> (topics). The % shows how much of the exam comes from that domain.

| Domain | Weight | In simple words |
| --- | --- | --- |
| 1. Design Secure Architectures | 30% | Keep the bad people out and the data safe |
| 2. Design Resilient Architectures | 26% | Keep the app running even when things break or traffic jumps |
| 3. Design High-Performing Architectures | 24% | Make it fast — pick the right storage, compute, database, network |
| 4. Design Cost-Optimized Architectures | 20% | Get the same result for the least money |

### Domain 1 — Design Secure Architectures (30%)

<b>1.1 Design secure access to AWS resources</b>

- Simple words: who is allowed to enter which room, and how we check their ID.
- Topics: IAM users, groups, roles, policies · least privilege · MFA for root and users · STS, role switching, cross-account access · IAM Identity Center (SSO) and federation · AWS Organizations, SCPs, Control Tower · resource policies · shared responsibility model · Regions and AZs.

<b>1.2 Design secure workloads and applications</b>

- Simple words: building walls, gates and guards around your app and network.
- Topics: VPC security — security groups, NACLs, route tables, NAT gateways · public vs private subnets · Shield, WAF, Secrets Manager, Cognito, GuardDuty, Macie · DDoS and SQL injection threats · secure external connections (VPN, Direct Connect) · service endpoints, ports and protocols.

<b>1.3 Determine appropriate data security controls</b>

- Simple words: locking the data itself, so even if someone gets in, they can't read it.
- Topics: encryption at rest (KMS) and in transit (ACM / TLS) · key policies and key rotation · certificate renewal · backups and replication · data lifecycle, retention, classification · compliance needs.

### Domain 2 — Design Resilient Architectures (26%)

<b>2.1 Design scalable and loosely coupled architectures</b>

- Simple words: build the app like LEGO blocks so one block breaking or getting busy doesn't stop the rest.
- Topics: API Gateway · SQS, SNS, EventBridge (pub/sub, event-driven) · Step Functions · microservices (stateless vs stateful) · horizontal vs vertical scaling · caching and CDN · ALB load balancing · multi-tier apps · Lambda, Fargate (serverless) · ECS, EKS (containers) · read replicas · Transfer Family · purpose-built services.

<b>2.2 Design highly available and/or fault-tolerant architectures</b>

- Simple words: always have a spare tyre, a backup generator and a second shop in another city.
- Topics: Regions, AZs, Route 53 failover · disaster recovery (backup & restore, pilot light, warm standby, active-active) · RPO and RTO · no single point of failure · Multi-AZ and multi-Region services · RDS Proxy · service quotas and throttling · storage durability and replication · immutable infrastructure and automation · X-Ray observability · managed AI services (Comprehend, Polly) · making legacy apps more reliable.

### Domain 3 — Design High-Performing Architectures (24%)

<b>3.1 High-performing and scalable storage</b>

- Simple words: choose the right kind of cupboard — a shared almirah, a personal locker, or an endless warehouse.
- Topics: object vs file vs block storage · S3, EFS, EBS, FSx · hybrid storage · storage that grows with future needs.

<b>3.2 High-performing and elastic compute</b>

- Simple words: choose the right worker, and hire more or fewer of them automatically.
- Topics: EC2 instance types · EC2 Auto Scaling and AWS Auto Scaling · scaling metrics and triggers · Lambda (including memory sizing), Fargate · Batch, EMR · edge and distributed computing · decoupling so parts scale on their own.

<b>3.3 High-performing databases</b>

- Simple words: pick the right type of register for the job and keep the most-used pages on your desk.
- Topics: relational vs NoSQL vs in-memory vs serverless databases · RDS engines (MySQL vs PostgreSQL etc.) · Aurora vs DynamoDB · read replicas · ElastiCache caching · RDS Proxy and connections · IOPS and capacity planning · read-heavy vs write-heavy patterns · homogeneous vs heterogeneous migrations.

<b>3.4 High-performing and scalable networks</b>

- Simple words: design the roads, highways and flyovers so traffic moves fast from anywhere in the world.
- Topics: CloudFront, Global Accelerator · subnet tiers, routing, IP addressing (CIDR) · ALB / NLB · VPN, Direct Connect, PrivateLink · global, hybrid and multi-tier network designs.

<b>3.5 High-performing data ingestion and transformation</b>

- Simple words: collect huge amounts of data, clean it, store it and show it as charts.
- Topics: Kinesis (streaming) · DataSync, Storage Gateway (transfer) · Glue (ETL, CSV → Parquet) · Athena, Lake Formation, Amazon Quick (analytics and dashboards) · EMR · data lakes and securing them · throughput and ingestion frequency.

### Domain 4 — Design Cost-Optimized Architectures (20%)

<b>4.1 Cost-optimized storage</b>

- Simple words: keep daily-use things in the cupboard and old things in the cheap godown.
- Topics: S3 storage classes and lifecycle rules · Glacier tiers · EBS types (SSD vs HDD) · Requester Pays · backup and archive choices · cheapest data transfer method · Cost Explorer, Budgets, Cost and Usage Report, tags.

<b>4.2 Cost-optimized compute</b>

- Simple words: rent, lease or bargain-buy computers depending on how long and how reliably you need them.
- Topics: On-Demand vs Reserved Instances vs Savings Plans vs Spot · instance family and size (right-sizing) · Lambda vs EC2 vs Fargate on cost · ALB vs NLB vs Gateway Load Balancer · horizontal vs vertical scaling · hibernation · Outposts and edge.

<b>4.3 Cost-optimized databases</b>

- Simple words: don't pay for a big database that sits idle.
- Topics: DynamoDB vs RDS on cost · serverless databases · caching to save money · backup and retention policies · columnar and time-series formats · schema and data migration.

<b>4.4 Cost-optimized networks</b>

- Simple words: data travelling costs money — choose the cheapest route.
- Topics: NAT gateway (one shared vs one per AZ) · Direct Connect vs VPN vs internet · data transfer costs (AZ-to-AZ, Region-to-Region, internet) · VPC endpoints · Transit Gateway vs VPC peering · CDN caching · bandwidth sizing · throttling.

## 🤖 AI Writer Instructions (READ THIS FIRST if you are an AI)

<callout icon="🤖" color="purple_bg">
You are writing study notes for Faizan, who is about to take the <b>AWS Certified Solutions Architect – Associate (SAA-C03)</b> exam very soon. These notes must be so simple that a <b>10th-grade student with zero cloud knowledge</b> could read them and pass. Your job: replace each 🚧 <b>Coming soon</b> block in the domain subpages with finished notes, following the rules and template below exactly.
</callout>

### Rules for wording

1. <b>Reading level:</b> Grade 10. Short sentences (under 20 words). One idea per sentence. Simple everyday words.
2. <b>No unexplained jargon.</b> The first time any technical word or acronym appears, explain it in brackets in plain words. Example: "AZ (Availability Zone — one separate data center building in a city)".
3. <b>Analogies from daily Indian life</b> are preferred: society gates, kirana shops, trains, tiffin service, bank token queues, godowns, Diwali rush, cricket. Keep analogies accurate — never let an analogy teach something false.
4. <b>Simple, but not shallow.</b> The full explanation must cover everything the exam can ask about the topic — features, limits that matter, when to use it and when not to.
5. <b>Always think like the exam.</b> Every topic must end with how the exam asks about it: the keywords in a question that point to this answer, and the traps.
6. <b>Comparisons in tables.</b> Whenever two or more services look similar (SQS vs SNS, ALB vs NLB, EFS vs EBS vs S3), add a comparison table.
7. <b>Only exam-relevant numbers</b> (e.g., Lambda max 15 minutes, S3 11 nines durability, Aurora 15 replicas). Don't dump trivia.
8. <b>Be accurate and current.</b> Check facts against official AWS documentation and the current SAA-C03 exam guide. If AWS renamed a service, use the new name and mention the old one once.
9. <b>Format for skimming:</b> headings, bullets, bold keywords, callouts. No long paragraphs (max 4 lines).
10. <b>Do not delete</b> other content. Replace only the 🚧 Coming soon callout you are filling. Then tick that topic in the Progress tracker on the main page.

### Template — use this for EVERY topic

```javascript
### <Topic name>

🧒 LIKE I'M 5 (the analogy)
2–4 sentences. One everyday analogy that captures the core idea.

📖 EXPLAINED SIMPLY (full detail, layman words)
- What it is
- Why it exists / what problem it solves
- How it works, step by step
- Key features and options (each explained in plain words)
- Limits / numbers that the exam cares about
- When to use it — and when NOT to use it

📚 JARGON BOX
Word → plain meaning (for every new technical word used above)

⚖️ COMPARE WITH LOOKALIKES
Table: Service A vs Service B vs Service C → use when / cost / speed / managed?

🎯 EXAM LENS
- "If the question says ___ → think ___" (3–6 lines)
- The most likely correct-answer pattern

🪤 TRAPS
Common wrong answers and why they are wrong.

📝 PRACTICE QUESTION
One realistic scenario question in SAA-C03 style (4 options).
Answer + why it is right + why each wrong option is wrong.

🔁 ONE-LINE RECAP
The whole topic in one sentence.
```

### Order of work for the AI

1. Fill Domain 1 → Domain 2 → Domain 3 → Domain 4, topic by topic, in the order listed on each domain page.
2. Cross-link services to the AWS Services Encyclopedia subpage instead of re-explaining a service from zero.
3. After a domain is done, add a <b>Domain cheat sheet</b> at the bottom of that domain page: 10–15 "keyword → answer" lines.
4. Keep the tone friendly and encouraging. The goal is one thing: Faizan passes.
