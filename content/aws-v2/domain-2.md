<callout icon="🧒" color="blue_bg">
<b>Like I'm 5:</b> A good shop doesn't close when one worker is sick or when the Diwali rush comes. This chapter is about building apps that bend but don't break.
</callout>

## 2.1 Design scalable and loosely coupled architectures

Topics to cover, in this order:

1. Vertical vs horizontal scaling; stateless vs stateful apps
2. Multi-tier architecture (web, app, database tiers)
3. Elastic Load Balancing (ALB focus) + EC2 Auto Scaling
4. Decoupling with SQS (standard vs FIFO, visibility timeout, DLQ)
5. SNS pub/sub and SQS fan-out pattern
6. EventBridge and event-driven design
7. Step Functions (workflow orchestration)
8. API Gateway (REST/HTTP/WebSocket, throttling, caching)
9. Serverless: Lambda and Fargate
10. Containers: ECS vs EKS, ECR, when containers vs serverless
11. Caching layers: CloudFront, ElastiCache, DAX
12. Read replicas for scaling reads
13. Managed services for common jobs (Transfer Family, Secrets Manager) and purpose-built databases

---

### 51. Vertical vs horizontal scaling; stateless vs stateful apps (Domain 2.1)

🧒 LIKE I'M 5<br />A kirana shop can buy a bigger counter or open more branches. A bigger counter is vertical scaling. More branches are horizontal scaling.

📖 EXPLAINED SIMPLY

- <b>Scaling</b> means changing computing capacity to match demand.
- <b>Vertical scaling:</b> Give one server more CPU, memory, or storage. This is scaling up.
- Vertical scaling is simple, but instance sizes have a ceiling. It can require a restart and leaves one large server as a failure point.
- <b>Horizontal scaling:</b> Add more servers or instances. This is scaling out.
- Horizontal scaling improves capacity and can improve resilience. A load balancer spreads requests across healthy instances.
- It needs an application that can run across multiple instances. Shared state must be stored somewhere accessible.
- <b>Stateless application:</b> Each request carries what it needs, or reads shared state from an external store. Any healthy instance can handle the next request.
- <b>Stateful application:</b> An instance keeps session or application state locally. Later requests may need the same instance.
- Sticky sessions can keep a user on one target. They reduce flexibility and do not replace a shared session store.
- Store shared sessions in a database or cache such as ElastiCache. Store durable business records in a database.
- Use horizontal scaling for changing traffic and resilience. Use vertical scaling when work cannot be distributed easily.
- Avoid local-only session state when instances must scale or fail independently.

📚 JARGON BOX

- Scaling → Changing capacity to meet demand.
- Vertical scaling → Making one server bigger.
- Horizontal scaling → Adding more servers.
- Stateless → No important session state kept only on one instance.
- Stateful → Instance keeps state between requests.
- Sticky session → Load balancer keeps a user on the same target.
- Load balancer → Distributes requests across targets.

⚖️ COMPARE WITH LOOKALIKES

| Design | Capacity change | Strength | Limitation |
| --- | --- | --- | --- |
| Vertical | Increase one instance size | Simple | Hardware ceiling; possible restart |
| Horizontal | Add instances | Elastic capacity and resilience | Needs distributed design |
| Stateless app | Shared/external state | Easy to spread requests | Needs external state store |
| Stateful app | Local or attached state | Can suit legacy workloads | Harder to scale and fail over |

🎯 EXAM LENS

- "Traffic changes frequently" → Horizontal scaling with Auto Scaling.
- "Any instance can serve any request" → Stateless application.
- "Session stored only on one server" → Stateful design.
- "Cannot distribute application work" → Vertical scaling may be needed.
- Prefer stateless application tiers behind load balancers.

🪤 TRAPS

- Vertical scaling does not automatically add resilience.
- Horizontal scaling needs shared state or stateless requests.
- Sticky sessions do not make an app truly stateless.
- A database is often stateful even when its app tier is stateless.

📝 PRACTICE QUESTION<br />An online store must add capacity during festival sales. Any server should handle any shopper request. Which design is best?<br />A. Stateless instances scaled horizontally behind a load balancer<br />B. Keep every session only on one server<br />C. Use one larger server only<br />D. Disable health checks

<b>Answer: A.</b> Stateless instances can be added and removed behind a load balancer. B creates instance dependency. C limits scaling. D removes failure detection.

🔁 ONE-LINE RECAP<br />Horizontal scaling adds servers, while stateless design lets any healthy server handle a request.

---

### 52. Multi-tier architecture (Domain 2.1)

🧒 LIKE I'M 5<br />A restaurant has a counter for orders, a kitchen for cooking, and a store room for ingredients. Each area has a separate job. Multi-tier apps work the same way.

📖 EXPLAINED SIMPLY

- <b>Multi-tier architecture:</b> Splits an application into layers with separate responsibilities.
- A common design has a web tier, application tier, and database tier.
- <b>Web tier:</b> Accepts user requests. It may serve web pages or forward requests to the application tier.
- <b>Application tier:</b> Runs business logic, validates requests, and talks to data stores.
- <b>Database tier:</b> Stores durable application data.
- Place internet-facing load balancers in public subnets. Keep application servers and databases in private subnets.
- Security groups should allow only required traffic between tiers. For example, the database accepts its database port only from the application tier's security group.
- Each tier can scale separately. The web tier may need more capacity than the database tier during a traffic spike.
- Use load balancers and Auto Scaling for stateless web and application tiers. Use managed databases where suitable.
- Separate tiers reduce blast radius and make maintenance easier. A compromised web server should not automatically have unrestricted database access.
- Add caches, queues, and private endpoints where the workload needs them.
- A multi-tier design can cost more and need more network setup. A small simple app may not need many tiers.
- Use multiple AZs for resilience. Do not put every tier in one AZ when high availability is required.

📚 JARGON BOX

- Tier → Application layer with a defined job.
- Web tier → Receives or serves web requests.
- Application tier → Runs business rules.
- Database tier → Stores durable records.
- Blast radius → Damage possible from one failure or compromise.
- Private subnet → Subnet without a direct internet gateway route.

⚖️ COMPARE WITH LOOKALIKES

| Tier | Responsibility | Typical placement |
| --- | --- | --- |
| Web | Public request entry | Public ALB; servers may be private |
| Application | Business logic | Private subnets |
| Database | Durable records | Private or isolated subnets |

🎯 EXAM LENS

- "Public entry point, private app servers, isolated database" → Multi-tier VPC design.
- "Only application servers reach database" → Security group reference.
- "Each tier scales separately" → Separate scaling groups and managed services.
- "Reduce exposure" → Keep application and database tiers private.

🪤 TRAPS

- Public load balancer does not mean every application server should be public.
- Private subnets do not block all internal VPC access.
- Network separation must be paired with security group rules.
- Multi-tier design alone does not provide multi-AZ availability.

📝 PRACTICE QUESTION<br />An app needs a public web entry point, private business logic, and a database accepting connections only from the application layer. Which design fits?<br />A. Three tiers with separate security groups and private application/database subnets<br />B. All servers in one public subnet with all ports open<br />C. Database password in a public bucket<br />D. Shared root account

<b>Answer: A.</b> Separate tiers and scoped security groups limit exposure. The other options weaken security.

🔁 ONE-LINE RECAP<br />Multi-tier architecture separates web, application, and data responsibilities so each tier can be secured and scaled independently.

---

### 53. Elastic Load Balancing overview and Application Load Balancer (Domain 2.1)

🧒 LIKE I'M 5<br />A bank token machine sends customers to available counters. A load balancer sends requests to healthy servers instead of overwhelming one server.

📖 EXPLAINED SIMPLY

- <b>Elastic Load Balancing (ELB):</b> AWS service family distributing incoming traffic across registered targets.
- It checks target health and sends new requests to healthy targets. It can work across multiple AZs.
- ELB types include Application Load Balancer, Network Load Balancer, Gateway Load Balancer, and Classic Load Balancer.
- <b>Application Load Balancer (ALB):</b> Works at the application layer, commonly called Layer 7.
- ALB understands HTTP and HTTPS. It routes using host names, URL paths, headers, query strings, methods, and source IP conditions.
- Example: route [shop.example.com/orders](http://shop.example.com/orders) to an orders service and /payments to a payment service.
- A <b>listener</b> accepts connections on a configured protocol and port. Listener rules choose a target group.
- A <b>target group</b> contains destinations such as EC2 instances, IP addresses, Lambda functions, or supported containers.
- ALB performs health checks on targets. Unhealthy targets stop receiving new traffic until they become healthy.
- It supports TLS termination using certificates from ACM or imported certificates. The load balancer handles HTTPS from clients.
- It supports redirects, fixed responses, authentication integrations, and sticky sessions.
- ALB is a strong fit for web applications and microservices. It is not ideal for arbitrary TCP/UDP protocols.
- Use NLB for Layer 4 traffic. Use ALB for HTTP-aware routing.
- Cross-zone load balancing distributes traffic across targets in enabled AZs. Check the current ELB type defaults and settings when a question specifies this behavior.

📚 JARGON BOX

- ELB → Elastic Load Balancing.
- Layer 7 → Application layer, such as HTTP.
- Listener → Port and protocol where the load balancer accepts traffic.
- Listener rule → Condition and action for routing.
- Target group → Registered destinations receiving traffic.
- Health check → Test deciding whether a target is healthy.
- TLS termination → Load balancer handles client-side TLS.

⚖️ COMPARE WITH LOOKALIKES

| Load balancer | Layer | Best use |
| --- | --- | --- |
| ALB | Layer 7 | HTTP/HTTPS and content-based routing |
| NLB | Layer 4 | TCP, UDP, TLS, static IP, high performance |
| GWLB | Layer 3 | Transparent network appliance fleets |
| Classic ELB | Older model | Legacy applications |

🎯 EXAM LENS

- "Route based on URL path or host name" → ALB.
- "Different microservices behind one listener" → ALB target groups.
- "HTTP health checks and TLS termination" → ALB.
- "TCP/UDP or static IP requirement" → NLB.

🪤 TRAPS

- ALB understands HTTP; NLB handles transport-level traffic.
- A listener is not a target group.
- Health checks do not repair applications. They stop new routing to unhealthy targets.
- A load balancer does not automatically add instances. Use Auto Scaling.

📝 PRACTICE QUESTION<br />A company hosts three services under one domain. Requests for /orders and /payments must reach different target groups. Which service should it use?<br />A. Application Load Balancer<br />B. Network Load Balancer<br />C. NAT gateway<br />D. EBS Multi-Attach

<b>Answer: A.</b> ALB supports path-based HTTP routing. NLB does not provide this application-layer routing. NAT and EBS do not route web requests.

🔁 ONE-LINE RECAP<br />ALB distributes HTTP and HTTPS requests using application-aware listener rules and target groups.

---

### 54. Network Load Balancer and Gateway Load Balancer (Domain 2.1)

🧒 LIKE I'M 5<br />An NLB is a fast railway junction moving trains by track and port. A GWLB sends traffic through specialist inspection machines.

📖 EXPLAINED SIMPLY

- <b>Network Load Balancer (NLB):</b> Operates at Layer 4. It handles TCP, UDP, and TLS traffic using connection information.
- NLB is designed for high performance and low latency. It can handle very large numbers of connections.
- It can provide static IP addresses for each enabled AZ. Elastic IP addresses are supported in eligible configurations.
- NLB can preserve client source IP in supported configurations. Target type and protocol affect exact behavior.
- It can terminate TLS using a certificate or pass encrypted TCP traffic to targets. Choose where TLS should end.
- Use NLB for non-HTTP protocols, static IP requirements, high throughput, and low-latency TCP/UDP workloads.
- <b>Gateway Load Balancer (GWLB):</b> Deploys and scales virtual network appliances such as firewalls and intrusion detection systems.
- GWLB works at Layer 3 and uses GENEVE encapsulation on port 6081 to route traffic to appliance targets.
- It acts as a transparent network gateway. It sends traffic through appliance fleets and returns traffic to its destination.
- It is commonly used with third-party security appliances from AWS Marketplace or customer-built appliances.
- GWLB does not replace ALB for HTTP path routing or NLB for ordinary client-facing TCP service balancing.
- Use GWLB when traffic must pass through inspection appliances. Use NLB when clients need a fast Layer 4 endpoint.

📚 JARGON BOX

- Layer 4 → Transport layer, such as TCP or UDP.
- Layer 3 → Network layer, primarily IP routing.
- Static IP → Address that remains fixed.
- TLS termination → Load balancer decrypts a TLS connection.
- GENEVE → Encapsulation protocol used by GWLB.
- Appliance → Specialized virtual security or networking device.
- Transparent → Traffic is inspected without clients connecting directly to each appliance.

⚖️ COMPARE WITH LOOKALIKES

| Feature | ALB | NLB | GWLB |
| --- | --- | --- | --- |
| Layer | 7 | 4 | 3 |
| Traffic | HTTP/HTTPS | TCP/UDP/TLS | IP traffic to appliances |
| Main purpose | Content routing | Fast network balancing | Appliance fleet inspection |
| Static IP | Not its main feature | Yes, per AZ | Uses endpoint architecture |
| Typical use | Web apps | TCP services | Firewalls and IDS/IPS appliances |

🎯 EXAM LENS

- "Static IP per AZ for TCP service" → NLB.
- "UDP or non-HTTP protocol" → NLB.
- "Send traffic through third-party firewalls" → GWLB.
- "GENEVE port 6081" → GWLB.
- "Path-based web routing" → ALB.

🪤 TRAPS

- NLB does not perform ALB-style path routing.
- GWLB is not a normal application load balancer.
- GWLB distributes traffic to appliances; the appliances provide inspection logic.
- NLB and GWLB solve different network layers.

📝 PRACTICE QUESTION<br />A company must inspect VPC traffic using third-party virtual firewalls. It wants the appliance fleet to scale without manually changing every route. Which service fits?<br />A. Gateway Load Balancer<br />B. Application Load Balancer<br />C. Amazon SQS<br />D. AWS Certificate Manager

<b>Answer: A.</b> GWLB directs traffic to virtual appliances and scales the appliance fleet. ALB routes web requests. SQS queues messages. ACM manages certificates.

🔁 ONE-LINE RECAP<br />NLB balances Layer 4 connections; GWLB distributes Layer 3 traffic through virtual network appliances.

---

### 55. EC2 Auto Scaling: launch templates, groups, health checks, lifecycle hooks (Domain 2.1)

🧒 LIKE I'M 5<br />A tiffin service hires more delivery workers when orders rise and sends extra workers home when orders fall. Auto Scaling adjusts EC2 capacity similarly.

📖 EXPLAINED SIMPLY

- <b>Amazon EC2 Auto Scaling:</b> Maintains EC2 instance count and adjusts capacity based on demand or schedules.
- <b>Launch template:</b> Defines how an instance starts. It can specify an AMI, instance type, key pair, security groups, storage, IAM profile, and user data.
- Use launch template versions to test or roll out configuration changes. Launch templates are preferred over older launch configurations.
- <b>Auto Scaling group (ASG):</b> A group of EC2 instances managed together.
- Set minimum, maximum, and desired capacity. The ASG tries to maintain desired capacity within those bounds.
- Spread instances across multiple AZs for resilience. The ASG can balance capacity across enabled AZs.
- <b>Health checks:</b> EC2 checks detect instance status failures. ELB checks detect application target health.
- When an instance is unhealthy, the ASG can terminate and replace it. Configure a grace period so startup is not mistaken for failure.
- Scaling policies can increase or decrease desired capacity. The next compute section covers policy types.
- <b>Lifecycle hooks:</b> Pause an instance during launch or termination so custom actions can finish.
- A launch hook can let software install or register before entering service. A termination hook can drain connections or upload logs before shutdown.
- Lifecycle hooks can send notifications to EventBridge or SNS. The workflow must complete before its timeout.
- Use ASGs for elastic EC2 fleets and automatic replacement. They are not backups or database replication.
- Use launch templates to make instance configuration repeatable.

📚 JARGON BOX

- Launch template → Reusable EC2 launch instructions.
- ASG → Auto Scaling group.
- Desired capacity → Number of instances the group tries to maintain.
- Minimum capacity → Lowest allowed group size.
- Maximum capacity → Highest allowed group size.
- Health-check grace period → Time allowed for a new instance to start.
- Lifecycle hook → Pause point for custom launch or termination work.
- Connection draining → Let active requests finish before stopping a target.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Launch template | Auto Scaling group |
| --- | --- | --- |
| Defines | How an instance starts | How many instances run |
| Contains | AMI, type, storage, network, user data | Min, max, desired, AZs, policies |
| Main role | Repeatable configuration | Capacity and replacement |

🎯 EXAM LENS

- "Maintain two healthy EC2 instances" → ASG desired capacity two.
- "Replace unhealthy instances automatically" → ASG health checks.
- "Use same AMI and configuration" → Launch template.
- "Run a script before termination" → Lifecycle hook.
- "Survive one AZ failure" → ASG across multiple AZs with sufficient capacity.

🪤 TRAPS

- Launch templates do not scale instances by themselves.
- Auto Scaling replacement does not preserve local instance-store data.
- Grace period prevents premature replacement during startup.
- Lifecycle hooks pause work; they do not provide unlimited shutdown time.

📝 PRACTICE QUESTION<br />A company must upload logs from each EC2 instance before Auto Scaling terminates it. What should it configure?<br />A. Termination lifecycle hook<br />B. Launch template only<br />C. S3 Transfer Acceleration<br />D. Route 53 weighted routing

<b>Answer: A.</b> A termination hook pauses the workflow so a script can upload logs. The other options do not pause termination.

🔁 ONE-LINE RECAP<br />Launch templates define EC2 settings; Auto Scaling groups maintain capacity and lifecycle hooks run custom work.

---

### 56. Amazon SQS: standard vs FIFO, visibility timeout, DLQ, long polling, delay queues (Domain 2.1)

🧒 LIKE I'M 5<br />A bank token queue keeps customer requests until a worker serves them. SQS holds work until a consumer is ready.

📖 EXPLAINED SIMPLY

- <b>Amazon Simple Queue Service (SQS):</b> A managed message queue separating producers from consumers.
- A producer sends a message. A consumer receives and processes it. The consumer deletes it after success.
- If processing fails before deletion, the message can become visible again after the visibility timeout.
- <b>Standard queue:</b> Very high throughput. It provides at-least-once delivery, so duplicates can happen. Ordering is best effort.
- <b>FIFO queue:</b> Preserves order within a message group and supports deduplication. Queue names end in .fifo.
- FIFO suits ordered work, such as transactions for one bank account. Separate message groups allow parallel processing of independent groups.
- Deduplication uses a deduplication ID or content-based deduplication. FIFO's deduplication interval is five minutes. Consumers should still handle retries safely.
- <b>Visibility timeout:</b> Time a received message stays hidden from other consumers. It starts when the message is received.
- Default visibility timeout is 30 seconds. Maximum is 12 hours. Delete the message after successful processing.
- Extend visibility during longer processing. The maximum total visibility period from first receipt is 12 hours.
- <b>Dead-letter queue (DLQ):</b> A separate queue receiving messages that fail repeatedly. Configure a redrive policy with a maximum receive count.
- DLQs isolate poison messages. Investigate and redrive them after fixing the cause.
- <b>Long polling:</b> Waits for messages instead of quickly returning empty responses. Wait time can be up to 20 seconds.
- Long polling reduces empty API calls and cost. Short polling may return empty even when messages exist.
- <b>Delay queue:</b> Hides a new message for a configured period. Maximum delay is 15 minutes.
- Message retention is configurable from one minute to 14 days. Default is four days.
- Use SQS to decouple services and absorb traffic spikes. Choose FIFO when ordering and deduplication matter.
- SQS is pull-based. Consumers poll the queue. SNS is push-based fan-out.

📚 JARGON BOX

- Queue → Place storing messages until consumed.
- Producer → Application sending messages.
- Consumer → Application processing messages.
- Visibility timeout → Time a received message is hidden.
- DLQ → Dead-letter queue for repeatedly failing messages.
- Redrive policy → Rules moving failed messages to a DLQ.
- Long polling → Wait for messages before returning a response.
- Delay queue → Queue delaying message availability.
- Poison message → Message repeatedly failing processing.
- FIFO → First-In-First-Out ordering.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Standard SQS | FIFO SQS |
| --- | --- | --- |
| Throughput | Very high | Lower; high-throughput mode available |
| Ordering | Best effort | Strict within a message group |
| Delivery | At least once | Deduplication and ordered processing |
| Queue name | Normal | Ends in .fifo |
| Best use | Independent high-volume work | Ordered business operations |

🎯 EXAM LENS

- "Very high throughput; duplicates acceptable" → Standard queue.
- "Strict order" → FIFO queue.
- "Hide message while processing" → Visibility timeout.
- "Repeatedly failing messages" → DLQ and redrive policy.
- "Reduce empty receive calls" → Long polling up to 20 seconds.
- "Wait before new message becomes visible" → Delay queue.
- "Messages per customer remain ordered" → FIFO message group ID.

🪤 TRAPS

- Receiving a message does not delete it.
- Standard queues can duplicate and reorder messages.
- FIFO ordering is per message group, not one global order across all groups.
- A DLQ does not fix a failed message.
- Visibility timeout is not message retention time.
- SQS consumers poll; SQS does not push messages by itself.

📝 PRACTICE QUESTION<br />A payment system must process transactions for each bank account in order. Different accounts can run in parallel. Which design is best?<br />A. FIFO queue with account ID as MessageGroupId<br />B. Standard queue with one consumer<br />C. Delay queue only<br />D. CloudTrail trail

<b>Answer: A.</b> FIFO preserves order within each account's message group. Different groups can process in parallel. Standard does not guarantee order.

🔁 ONE-LINE RECAP<br />SQS stores work reliably; choose Standard for high throughput and FIFO for ordered message groups.

---

### 57. Amazon SNS and SNS + SQS fan-out (Domain 2.1)

🧒 LIKE I'M 5<br />A school announces one message over a loudspeaker. Every class receives the announcement. SNS publishes once and delivers to many subscribers.

📖 EXPLAINED SIMPLY

- <b>Amazon Simple Notification Service (SNS):</b> A managed publish-subscribe messaging service.
- A publisher sends a message to an SNS topic. SNS delivers copies to subscribed endpoints.
- Subscribers can include SQS queues, Lambda functions, HTTP/S endpoints, email, and SMS.
- SNS is push-based. It sends notifications instead of requiring each subscriber to poll a queue.
- <b>Fan-out pattern:</b> Publish one event to an SNS topic. Subscribe multiple SQS queues. Each queue receives its own copy for independent processing.
- Example: An order event goes to inventory, delivery, and billing queues. Each service processes at its own speed.
- SQS buffers messages if a consumer is slow or temporarily unavailable.
- <b>Subscription filter policy:</b> Filters messages for a subscriber using message attributes or supported body fields. Each subscriber receives only matching messages.
- SNS retries supported endpoint delivery after retryable failures. Configure a subscription DLQ to capture messages that remain undeliverable.
- SNS supports standard and FIFO topics. Choose FIFO when ordered pub-sub delivery is required and supported by the entire design.
- Use SNS for one-to-many notification. Use SQS for durable work queues and independent consumers.
- SNS alone is not the same as a durable consumer pull queue. Use SQS buffering for slow consumers.

📚 JARGON BOX

- Publish-subscribe → Publishers send messages to a topic; subscribers receive them.
- Topic → Named SNS message channel.
- Publisher → Application sending a message.
- Subscriber → Endpoint receiving messages.
- Fan-out → One message copied to multiple destinations.
- Filter policy → Rule deciding which messages a subscriber receives.
- Subscription DLQ → SQS queue holding failed SNS deliveries.

⚖️ COMPARE WITH LOOKALIKES

| Feature | SNS | SQS |
| --- | --- | --- |
| Model | Push pub/sub | Pull queue |
| Consumers | Many subscribers | Consumers poll a queue |
| Copies | Each subscriber gets a delivery | Competing consumers share queue messages |
| Buffering | Retries and optional DLQ | Durable queue storage |
| Best use | Notifications and fan-out | Decoupled task processing |

🎯 EXAM LENS

- "Notify many systems from one event" → SNS topic.
- "Each system needs its own copy" → SNS to multiple SQS queues.
- "Consumers may be slow or offline" → SQS queues behind SNS.
- "Only billing gets payment events" → SNS subscription filter policy.
- "Store failed notifications" → Subscription DLQ.

🪤 TRAPS

- SNS is push-based; SQS is pull-based.
- One shared SQS queue distributes messages among consumers. It does not give each service its own copy.
- SNS does not replace SQS buffering.
- Filter policies decide which subscribers receive messages.

📝 PRACTICE QUESTION<br />An order service publishes one event. Inventory, billing, and delivery must each process their own copy at different speeds. What should it use?<br />A. SNS topic with one SQS queue per service<br />B. One shared SQS queue for all services<br />C. One EC2 instance with local files<br />D. A security group

<b>Answer: A.</b> SNS fan-out sends a copy to each subscribed queue. A shared queue distributes messages among consumers rather than giving each service its own copy.

🔁 ONE-LINE RECAP<br />SNS broadcasts events; SNS-to-SQS fan-out gives each subscriber an independent durable queue.

---

### 58. Amazon EventBridge (Domain 2.1)

🧒 LIKE I'M 5<br />A school notice board receives announcements and sends each one to the right classroom. EventBridge routes events to services that care about them.

📖 EXPLAINED SIMPLY

- <b>Amazon EventBridge:</b> A serverless event bus that routes events from AWS services, applications, and supported SaaS partners.
- An event describes something that happened. For example, an EC2 instance changed state or an order was placed.
- An <b>event bus</b> receives events. A <b>rule</b> matches selected event fields and sends matching events to targets.
- Targets include Lambda, SQS, SNS, Step Functions, and many other supported services.
- Event patterns filter by source, detail type, account, resource, and fields inside event detail.
- Rules can transform or select parts of an event before sending it to a target.
- <b>Default event bus:</b> Receives events from AWS services in the account.
- <b>Custom event bus:</b> Receives events from your applications or other configured sources.
- <b>Partner event bus:</b> Receives events from supported SaaS partners.
- EventBridge supports cross-account and cross-Region delivery when configured and authorized.
- <b>Archive and replay:</b> Archive selected events and replay them later. This helps rebuild state or test consumers after a fix.
- EventBridge has a schema registry that can discover and store event structures for supported sources.
- Use EventBridge for content-based event routing and integration. Use SNS for simpler pub-sub broadcasting.
- EventBridge Scheduler is a separate scheduling capability for one-time or recurring target invocations. Do not confuse it with event-bus rules.

📚 JARGON BOX

- Event → Description of something that happened.
- Event bus → Channel receiving events.
- Rule → Pattern selecting events and forwarding them.
- Target → Destination receiving a matching event.
- Event pattern → Conditions used to match an event.
- Archive → Stored copy of selected events.
- Replay → Sending archived events to targets again.
- Schema registry → Store of event structure definitions.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main job |
| --- | --- |
| EventBridge | Content-based event routing and integrations |
| SNS | Simple one-to-many pub/sub |
| SQS | Durable work queue |
| Step Functions | Orchestrates multi-step workflows |
| EventBridge Scheduler | Runs targets on schedules |

🎯 EXAM LENS

- "Route AWS events based on event content" → EventBridge rules.
- "Third-party SaaS sends events" → Partner event bus.
- "Replay archived events" → EventBridge archive and replay.
- "One event to independent durable consumers" → EventBridge or SNS-to-SQS, depending on routing.
- "Run a job every morning" → EventBridge Scheduler.

🪤 TRAPS

- Event bus is not a message queue.
- A rule routes events; it does not orchestrate a multi-step workflow.
- Scheduler is not the same as an event-bus rule.
- Target retry and DLQ settings still matter.

📝 PRACTICE QUESTION<br />An application routes order events based on fields in their detail and needs to replay archived events after a consumer fix. Which service fits?<br />A. EventBridge with rules, archive, and replay<br />B. NAT gateway<br />C. EBS snapshots<br />D. IAM groups

<b>Answer: A.</b> EventBridge matches event content and supports archive and replay. The other options do not route or replay application events.

🔁 ONE-LINE RECAP<br />EventBridge routes events using content-based rules and supports archive and replay.

---

### 59. AWS Step Functions (Domain 2.1)

🧒 LIKE I'M 5<br />A tiffin service follows a recipe: accept order, prepare food, pack it, then deliver it. Step Functions coordinates each step and handles success or failure.

📖 EXPLAINED SIMPLY

- <b>AWS Step Functions:</b> A managed workflow service coordinating tasks and services.
- A workflow is a <b>state machine</b>. It defines states, transitions, choices, retries, and error handling.
- Tasks can invoke Lambda, run ECS tasks, call AWS service APIs, or wait for external work.
- <b>Choice state:</b> Selects the next path based on data.
- <b>Parallel state:</b> Runs branches at the same time.
- <b>Wait state:</b> Pauses for a defined period or until a timestamp.
- <b>Retry and Catch:</b> Retry a failed task or route an error to a recovery path.
- <b>Map state:</b> Repeats a task over a collection. Distributed Map can process large datasets with many parallel child workflows.
- <b>Standard Workflows:</b> Suit long-running durable workflows with execution history and exactly-once workflow execution semantics, unless retry behavior is configured.
- <b>Express Workflows:</b> Suit high-volume, short-duration workloads. They have shorter execution duration and different execution semantics.
- Step Functions offers visual workflow design and execution history. It reduces custom code for retries, branches, and waits.
- Use it for order processing, approvals, data pipelines, and multi-step workflows.
- Do not use it for a simple one-function task that needs no orchestration. Lambda alone may be simpler.
- Choose Standard for long-running or auditable workflows. Choose Express for high-volume short-lived processing with suitable semantics.

📚 JARGON BOX

- Workflow → Series of connected tasks.
- State machine → Definition of workflow states and transitions.
- State → One workflow step or decision.
- Retry → Attempt a failed task again.
- Catch → Handle an error and choose another path.
- Parallel → Run branches at the same time.
- Map → Repeat a task across items.
- Orchestration → Coordinating multiple services or tasks.

⚖️ COMPARE WITH LOOKALIKES

| Option | Best use |
| --- | --- |
| Step Functions Standard | Long-running durable workflows and audit history |
| Step Functions Express | High-volume short-duration workflows |
| Lambda alone | One short function or simple event reaction |
| EventBridge | Route events, not detailed task orchestration |
| SQS | Buffer independent work messages |

🎯 EXAM LENS

- "Coordinate Lambda functions with retries" → Step Functions.
- "Choice, wait, and parallel branches" → Step Functions.
- "Long-running approval process" → Standard Workflow.
- "High-volume short event processing" → Express Workflow.
- "Simply route one event to one target" → EventBridge may be simpler.

🪤 TRAPS

- Step Functions is not a queue.
- EventBridge routes events; Step Functions coordinates workflow steps.
- A workflow retry can run a task more than once. Make side effects safe.
- Standard and Express have different duration and execution semantics.

📝 PRACTICE QUESTION<br />An order process must reserve stock, charge payment, request shipping, and compensate if payment fails. It needs visible steps and retries. What is best?<br />A. Step Functions state machine<br />B. One large security group<br />C. S3 lifecycle rule<br />D. Route 53 alias record

<b>Answer: A.</b> Step Functions coordinates tasks, choices, retries, and error paths. The other options do not orchestrate business workflows.

🔁 ONE-LINE RECAP<br />Step Functions coordinates multi-step workflows with choices, parallel work, waits, retries, and error paths.

---

### 60. Amazon MQ (Domain 2.1)

🧒 LIKE I'M 5<br />A company has old machines that speak a specific messaging language. Amazon MQ provides managed brokers so those machines can keep communicating in AWS.

📖 EXPLAINED SIMPLY

- <b>Amazon MQ:</b> A managed message broker service for Apache ActiveMQ and RabbitMQ.
- A message broker receives messages from producers and delivers them to consumers using supported protocols.
- Amazon MQ supports protocols such as AMQP, MQTT, OpenWire, and STOMP, depending on the broker engine.
- It helps when an existing application depends on standard broker APIs, JMS, or a protocol supported by ActiveMQ or RabbitMQ.
- AWS manages much of the broker infrastructure, maintenance, and replacement. You still configure broker settings, clients, security, capacity, and availability.
- Amazon MQ is not serverless like SQS or SNS. You choose broker deployments and manage capacity planning.
- Supported deployments can provide high availability across AZs. Select a deployment mode suitable for the broker engine.
- <b>ActiveMQ:</b> Often used by enterprise applications using JMS and protocols such as OpenWire.
- <b>RabbitMQ:</b> Often used by applications already built around RabbitMQ protocols and features.
- <b>SQS and SNS:</b> Native AWS messaging services with deep AWS integration and less broker administration.
- Choose Amazon MQ for compatibility when an application cannot easily change its messaging client or protocol.
- Choose SQS or SNS for new cloud-native apps when their queue or pub-sub models fit.
- Do not choose Amazon MQ merely because it is a message queue. SQS is usually simpler for new AWS-native workloads.

📚 JARGON BOX

- Message broker → Software receiving and delivering messages between applications.
- ActiveMQ → Open-source message broker supported by Amazon MQ.
- RabbitMQ → Broker supporting AMQP and other protocols.
- JMS → Java Message Service API.
- AMQP → Advanced Message Queuing Protocol.
- MQTT → Lightweight messaging protocol often used by devices.
- STOMP → Simple Text Oriented Messaging Protocol.
- OpenWire → Messaging protocol associated with ActiveMQ.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Amazon MQ | SQS | SNS |
| --- | --- | --- | --- |
| Model | Managed broker | Managed queue | Managed pub/sub |
| Protocol compatibility | ActiveMQ/RabbitMQ protocols | AWS API | AWS API and endpoints |
| Broker administration | Some customer configuration | Minimal | Minimal |
| Best use | Legacy broker migration | Cloud-native work queues | Cloud-native notifications |
| Capacity | Broker sizing and deployment | Managed queue scaling | Managed topic delivery |

🎯 EXAM LENS

- "Existing JMS or ActiveMQ application" → Amazon MQ.
- "RabbitMQ application must move with minimal changes" → Amazon MQ for RabbitMQ.
- "New AWS-native decoupled application" → SQS or SNS.
- "Avoid managing brokers" → Prefer SQS or SNS.
- The correct answer prioritizes compatibility when legacy protocols are required.

🪤 TRAPS

- Amazon MQ is managed, but not fully serverless.
- SQS is not a drop-in replacement for every JMS or AMQP broker.
- SNS is pub/sub, not a full replacement for every broker protocol.
- Amazon MQ still needs sizing, connectivity, authentication, and availability design.

📝 PRACTICE QUESTION<br />A company is migrating a legacy Java application using JMS and ActiveMQ. It wants minimal application changes. Which service should it choose?<br />A. Amazon MQ for ActiveMQ<br />B. Amazon SQS only<br />C. Amazon SNS only<br />D. AWS WAF

<b>Answer: A.</b> Amazon MQ supports ActiveMQ and JMS-oriented migration patterns. SQS and SNS use AWS messaging APIs and may need application changes. WAF protects web requests.

🔁 ONE-LINE RECAP<br />Amazon MQ suits compatible legacy broker workloads; SQS and SNS suit simpler AWS-native messaging.

---

## ✅ Batch 3 done: topics 41–60

### Batch 3 Cheat Sheet

- Encrypt large objects efficiently → Envelope encryption.
- Decrypt copied ciphertext locally in multiple Regions → Multi-Region KMS keys.
- Dedicated single-tenant HSM → CloudHSM.
- Default new S3 object encryption → SSE-S3.
- Customer-controlled S3 key policy and audit → SSE-KMS.
- Two server-side encryption layers → DSSE-KMS.
- Require secure S3 requests → Bucket policy denying insecure transport.
- Temporary private object link → Presigned URL.
- Private S3 origin behind CloudFront → OAC.
- Recover old object versions → S3 Versioning.
- Protect records even from root deletion → Object Lock Compliance mode.
- Convert unencrypted EBS/RDS → Encrypted snapshot copy and restore.
- Audit an AWS API action → CloudTrail.
- Track resource configuration and compliance → AWS Config.
- Obtain AWS SOC/ISO reports → AWS Artifact.
- Add more servers → Horizontal scaling.
- Any server handles any request → Stateless application tier.
- Split web, business logic, and data → Multi-tier architecture.
- Route by URL path or host → ALB.
- Static IP and TCP/UDP balancing → NLB.
- Route traffic through virtual firewalls → GWLB.
- Maintain EC2 desired capacity → Auto Scaling group.
- Run custom work before termination → Lifecycle hook.
- Strict message order → SQS FIFO.
- High throughput with duplicates acceptable → SQS Standard.
- Independent copy for each consumer → SNS-to-SQS fan-out.
- Route events by content and replay → EventBridge.
- Multi-step workflow with retries and branches → Step Functions.
- Legacy JMS or ActiveMQ/RabbitMQ → Amazon MQ.

### 5 Extra Mixed Scenario Questions

<b>1.</b> A company must route HTTP requests for /catalog and /checkout to different services. Which service should it use?

A. Application Load Balancer<br />B. Network Load Balancer<br />C. Gateway Load Balancer<br />D. NAT gateway

<b>Answer: A.</b> ALB understands HTTP paths and routes requests to target groups. NLB handles Layer 4 connections. GWLB routes through appliances. NAT provides address translation.

<b>2.</b> A system processes messages in order for each customer. Different customers can be processed in parallel. What should it use?

A. SQS FIFO with customer ID as message group<br />B. SQS Standard with one queue<br />C. SNS email delivery only<br />D. CloudTrail Lake

<b>Answer: A.</b> FIFO preserves order inside each message group. Separate customer groups can progress independently. Standard does not guarantee ordering.

<b>3.</b> A business process calls three services. It must retry failed steps and take a different path when payment fails. What should coordinate it?

A. Step Functions<br />B. EventBridge archive only<br />C. S3 Versioning<br />D. Security groups

<b>Answer: A.</b> Step Functions coordinates workflow states, retries, and error paths.

<b>4.</b> An existing enterprise application uses ActiveMQ and JMS. The company wants minimal messaging code changes during migration. What should it choose?

A. Amazon MQ for ActiveMQ<br />B. SQS Standard<br />C. SNS FIFO<br />D. AWS WAF

<b>Answer: A.</b> Amazon MQ supports ActiveMQ compatibility. SQS and SNS may need application changes.

<b>5.</b> A company needs app servers to scale out during demand spikes. User sessions must remain available if any instance is removed. What should it do?

A. Store shared session state in a managed data store and use stateless app instances behind an ALB<br />B. Store every session only in local server memory<br />C. Use one large EC2 instance<br />D. Turn off health checks

<b>Answer: A.</b> Shared session storage allows any healthy instance to handle a request. Local sessions make instances stateful. One large server limits horizontal scaling.

⏳ Batch 4 will cover topics 61–80.

### 61. Amazon API Gateway: REST, HTTP, WebSocket, throttling, caching, authentication (Domain 2.1)

🧒 LIKE I'M 5<br />A restaurant has one counter that accepts orders and sends them to the kitchen. API Gateway is that front counter for applications that call backend services.

📖 EXPLAINED SIMPLY

- <b>Amazon API Gateway:</b> A managed service for creating, publishing, securing, monitoring, and managing APIs.
- An API is a defined way for one application to request data or actions from another application.
- <b>REST API:</b> The feature-rich API Gateway option. It supports API keys, usage plans, request validation, caching, resource policies, private endpoints, and more.
- <b>HTTP API:</b> A simpler, lower-cost option for common HTTP workloads. It supports Lambda and HTTP backends, JWT authorizers, and automatic deployments. It has fewer advanced features than REST APIs.
- <b>WebSocket API:</b> Maintains a two-way connection between client and backend. It suits chat, live updates, dashboards, and interactive applications.
- WebSocket APIs use routes such as $connect, $disconnect, and \$default. A backend can send messages back using the connection management API.
- API Gateway can integrate with Lambda, HTTP services, and supported AWS service actions.
- <b>Throttling:</b> Limits the rate and burst of requests. API Gateway uses throttling limits to protect backends. Excess requests can receive HTTP 429 responses.
- <b>Caching:</b> REST APIs can cache backend responses at the API stage. Caching can reduce backend work and latency, but cached data may be stale.
- <b>Authentication and authorization:</b> REST APIs support IAM authorization, Cognito User Pool authorizers, and Lambda authorizers. HTTP APIs support JWT authorizers, IAM, and Lambda authorizers.
- API keys identify clients for usage plans and metering. They are not strong authentication by themselves.
- Use REST APIs when advanced API Gateway features are required. Use HTTP APIs for straightforward low-cost HTTP APIs. Use WebSocket APIs for persistent two-way communication.
- Do not choose API Gateway for a simple internal service-to-service call when a direct integration is enough.

📚 JARGON BOX

- API → Application Programming Interface; a contract for software communication.
- REST → Resource-oriented API design style.
- HTTP API → Simpler API Gateway HTTP interface.
- WebSocket → Persistent two-way connection.
- JWT → JSON Web Token used to carry signed identity claims.
- Authorizer → Component that decides whether a request is allowed.
- Throttling → Limiting request rate.
- Burst → Short spike of requests allowed above the steady rate.
- Usage plan → API key-linked quota and throttle configuration.

⚖️ COMPARE WITH LOOKALIKES

| API type | Main use | Important features |
| --- | --- | --- |
| REST API | Full-featured APIs | Caching, usage plans, API keys, private endpoints |
| HTTP API | Simple HTTP and Lambda APIs | Lower cost, JWT authorizers, fewer features |
| WebSocket API | Real-time two-way messaging | Persistent connections and routes |

🎯 EXAM LENS

- "Advanced API Gateway features and caching" → REST API.
- "Lowest-cost simple HTTP API" → HTTP API.
- "Chat or live two-way updates" → WebSocket API.
- "Protect backend from request bursts" → Throttling.
- "Reduce repeated backend calls" → REST API caching.
- "API key for metering" → Usage plan, not strong user authentication.

🪤 TRAPS

- API keys are not a replacement for proper authentication.
- HTTP APIs do not have every REST API feature.
- WebSocket APIs suit persistent two-way connections, not ordinary request-response APIs.
- Caching can return stale results.
- Throttling protects a backend; it does not add backend capacity.

📝 PRACTICE QUESTION<br />An application needs a simple, low-cost HTTP API with JWT-based authorization and Lambda integration. It does not need API caching or usage plans. Which option fits?<br />A. HTTP API<br />B. REST API with caching<br />C. WebSocket API<br />D. Network Load Balancer

<b>Answer: A.</b> HTTP APIs provide a simpler, lower-cost option with JWT authorizers and Lambda integration. REST is useful when advanced features are required. WebSocket is for two-way connections. NLB handles Layer 4 traffic.

🔁 ONE-LINE RECAP<br />Choose REST for advanced API features, HTTP for simpler APIs, and WebSocket for persistent two-way communication.

---

### 62. AWS Lambda: triggers, concurrency, limits, layers, VPC access (Domain 2.1)

🧒 LIKE I'M 5<br />A tiffin worker is called only when a new order arrives. Lambda runs your code when an event triggers it, without managing a server.

📖 EXPLAINED SIMPLY

- <b>AWS Lambda:</b> A serverless compute service that runs code in response to events.
- You upload code and select a runtime, memory, timeout, and execution role. AWS manages the underlying servers.
- Common triggers include API Gateway, S3 events, EventBridge, SQS, SNS, DynamoDB Streams, and scheduled invocations.
- Lambda can run synchronously or asynchronously. The trigger type decides how invocation and retry behavior work.
- <b>Maximum execution timeout:</b> One Lambda invocation can run for up to 15 minutes.
- <b>Memory:</b> Configure memory from 128 MB to 10,240 MB. CPU power increases with the selected memory.
- <b>Concurrency:</b> Number of invocations running at the same time.
- <b>Reserved concurrency:</b> Reserves capacity for a function and sets its maximum concurrent executions. It protects other functions from being starved.
- <b>Provisioned concurrency:</b> Pre-initializes execution environments to reduce cold starts. It costs extra while provisioned.
- <b>Cold start:</b> Delay when Lambda creates a new execution environment before running code. Reused environments can reduce repeated startup work.
- <b>Lambda layers:</b> Reusable packages for libraries, dependencies, and other code shared by functions.
- <b>VPC access:</b> Configure Lambda in private subnets when it needs private resources such as RDS. Its execution role and network routes/security groups must allow required access.
- A Lambda function in a public subnet does not automatically receive internet access. Use NAT or suitable VPC endpoints for outbound access where needed.
- For SQS triggers, Lambda polls the queue and invokes batches of messages. Configure visibility timeout, batch size, and failure handling carefully.
- Async invocation retries can create duplicate processing. Design functions to be idempotent.
- Use Lambda for short event-driven work and unpredictable traffic. Do not use it for jobs requiring more than 15 minutes per invocation or persistent servers.

📚 JARGON BOX

- Serverless → AWS manages the servers; you manage code and configuration.
- Trigger → Event that starts a function.
- Runtime → Language environment used to execute code.
- Concurrency → Number of simultaneous executions.
- Reserved concurrency → Capacity reserved and maximum concurrency for a function.
- Provisioned concurrency → Pre-initialized execution environments.
- Cold start → Startup delay for a new environment.
- Layer → Reusable code or dependency package.
- Idempotent → Repeating an operation does not cause an incorrect extra effect.
- Timeout → Maximum time allowed for one invocation.

⚖️ COMPARE WITH LOOKALIKES

| Option | Best use | Main constraint |
| --- | --- | --- |
| Lambda | Event-driven short functions | 15-minute invocation limit |
| EC2 | Long-running server workloads | Customer manages OS and capacity |
| ECS/Fargate | Long-running container workloads | Container/task design required |
| Provisioned concurrency | Reduce cold-start delay | Additional cost |
| Reserved concurrency | Protect capacity or cap function use | Limits available concurrency |

🎯 EXAM LENS

- "Run code when an S3 object arrives" → Lambda trigger.
- "Maximum function duration" → 15 minutes.
- "Reduce cold starts" → Provisioned concurrency.
- "Stop one function consuming all account concurrency" → Reserved concurrency.
- "Share libraries between functions" → Lambda layers.
- "Access private RDS from Lambda" → VPC configuration, security groups, and suitable execution role.

🪤 TRAPS

- Lambda is not unlimited; each invocation has a 15-minute maximum.
- More memory also gives more CPU.
- Reserved concurrency does not pre-warm environments.
- Provisioned concurrency does not mean unlimited concurrency.
- A public subnet alone does not give VPC-connected Lambda internet access.

📝 PRACTICE QUESTION<br />A customer-facing API has unpredictable traffic. Its Lambda functions must avoid cold-start delays during a known launch event. What should the architect configure?<br />A. Provisioned concurrency<br />B. Reserved concurrency only<br />C. A larger S3 bucket<br />D. A NACL deny rule

<b>Answer: A.</b> Provisioned concurrency keeps environments initialized. Reserved concurrency limits or reserves capacity but does not pre-initialize environments.

🔁 ONE-LINE RECAP<br />Lambda runs event-driven code with a 15-minute maximum; use concurrency settings and layers for performance and control.

---

### 63. Amazon ECS and AWS Fargate (Domain 2.1)

🧒 LIKE I'M 5<br />A delivery company has a manager who assigns packaged jobs to workers. ECS manages container tasks. Fargate provides the workers without you managing their machines.

📖 EXPLAINED SIMPLY

- <b>Container:</b> A packaged application with its code and dependencies. It runs in an isolated environment.
- <b>Amazon Elastic Container Service (ECS):</b> AWS-managed container orchestration. It starts, stops, and maintains containers.
- <b>Task definition:</b> A blueprint describing containers, image, CPU, memory, ports, logging, and IAM roles.
- <b>Task:</b> A running copy of a task definition. A task can contain one or more related containers.
- <b>Service:</b> Maintains a desired number of tasks and can integrate with a load balancer.
- <b>Cluster:</b> Logical grouping used to run ECS tasks and services.
- <b>EC2 launch type:</b> ECS tasks run on EC2 instances that you manage. You control the hosts, patching, and instance capacity.
- <b>Fargate:</b> Serverless compute for containers. AWS manages the underlying servers, while you define tasks and resources.
- Fargate works with ECS and EKS. It is not a container registry or orchestrator by itself.
- ECS integrates with IAM task roles, CloudWatch Logs, load balancers, and Auto Scaling.
- A task execution role lets the ECS/Fargate agent pull images and send logs. A task role gives application code AWS permissions.
- Use Fargate when you want containers without managing EC2 hosts. Use ECS on EC2 when you need host control, special instance types, or cost tuning.
- Containers are useful for consistent packaging and long-running processes. Lambda may be simpler for short event-driven functions.

📚 JARGON BOX

- Container → Packaged application and dependencies.
- Orchestration → Managing where containers run and how they recover.
- Task definition → Container run blueprint.
- Task → Running instance of a task definition.
- Service → Maintains a desired number of tasks.
- Cluster → Logical place for ECS resources.
- Task role → Permissions used by application code.
- Task execution role → Permissions used by ECS/Fargate to start the task.

⚖️ COMPARE WITH LOOKALIKES

| Option | Who manages servers? | Best use |
| --- | --- | --- |
| ECS on EC2 | Customer | Need host control |
| ECS on Fargate | AWS | Containers without server management |
| Lambda | AWS | Short event-driven functions |
| EKS on EC2 | Customer manages worker capacity; AWS manages control plane | Kubernetes workloads |

🎯 EXAM LENS

- "Run containers without managing EC2" → Fargate.
- "AWS-native container orchestrator" → ECS.
- "Maintain desired number of containers" → ECS service.
- "Application needs S3 access" → ECS task role.
- "Pull image and write logs" → Task execution role.

🪤 TRAPS

- Fargate is compute, not orchestration.
- ECS is the orchestrator.
- Task role and task execution role do different jobs.
- Fargate still requires task CPU/memory, network, IAM, and logging configuration.

📝 PRACTICE QUESTION<br />A company wants to run containerized APIs. It does not want to patch or manage EC2 container hosts. Which design fits?<br />A. ECS with Fargate<br />B. ECS with self-managed EC2 only<br />C. One manually patched EC2 instance<br />D. S3 static hosting

<b>Answer: A.</b> ECS orchestrates tasks and Fargate runs them without customer-managed hosts. B and C require host management. D does not run container APIs.

🔁 ONE-LINE RECAP<br />ECS orchestrates containers; Fargate runs ECS tasks without requiring you to manage EC2 hosts.

---

### 64. Amazon EKS and Amazon ECR; ECS/EKS Anywhere (Domain 2.1)

🧒 LIKE I'M 5<br />ECS is like using a familiar company delivery system. Kubernetes is like using a common delivery language accepted by many companies. EKS manages Kubernetes in AWS.

📖 EXPLAINED SIMPLY

- <b>Kubernetes:</b> An open-source system for deploying and managing containers.
- <b>Amazon Elastic Kubernetes Service (EKS):</b> Managed Kubernetes on AWS. AWS operates the Kubernetes control plane.
- You choose worker capacity through managed node groups, self-managed nodes, or Fargate profiles where supported.
- Kubernetes objects such as Pods, Deployments, and Services describe how applications run and connect.
- EKS is useful when an organization already uses Kubernetes, needs its ecosystem, or wants portability across supported environments.
- <b>Amazon Elastic Container Registry (ECR):</b> Managed container image registry. Store, scan, tag, and retrieve container images.
- ECS and EKS can both pull images from ECR. Give workloads the required IAM permissions.
- <b>ECS Anywhere:</b> Lets ECS manage container workloads running on customer-managed external instances, including on-premises servers.
- <b>EKS Anywhere:</b> Helps create and operate Kubernetes clusters on customer-managed infrastructure, such as on-premises or edge environments.
- EKS Anywhere is different from the AWS-managed EKS control plane. You manage the external cluster environment.
- <b>ECS vs EKS:</b> ECS is AWS-native and usually simpler to operate. EKS provides standard Kubernetes APIs and broader Kubernetes ecosystem compatibility.
- Use ECS when you want an AWS-native container service with fewer Kubernetes operations. Use EKS when Kubernetes compatibility is needed.
- Use ECR as the image registry with either orchestrator. Do not confuse a registry with the service running containers.

📚 JARGON BOX

- Kubernetes → Open-source container orchestration system.
- EKS → Elastic Kubernetes Service.
- ECR → Elastic Container Registry.
- Control plane → Components that manage the cluster.
- Worker node → Machine running application containers.
- Pod → Smallest deployable Kubernetes unit.
- Deployment → Kubernetes object maintaining application replicas.
- Registry → Storage service for container images.
- Anywhere → Run supported container orchestration on customer-managed infrastructure.

⚖️ COMPARE WITH LOOKALIKES

| Option | Orchestrator | Infrastructure model |
| --- | --- | --- |
| ECS | AWS-native | EC2 or Fargate |
| EKS | Kubernetes | Managed AWS control plane; EC2 or Fargate workers |
| ECS Anywhere | ECS | Customer-managed external instances |
| EKS Anywhere | Kubernetes | Customer-managed external clusters |
| ECR | Not an orchestrator | Image registry |

🎯 EXAM LENS

- "Use standard Kubernetes APIs" → EKS.
- "Simplest AWS-native orchestration" → ECS.
- "Store Docker images privately" → ECR.
- "ECS containers on on-premises servers" → ECS Anywhere.
- "Kubernetes clusters on customer-owned hardware" → EKS Anywhere.

🪤 TRAPS

- ECR stores images; it does not schedule containers.
- EKS manages the Kubernetes control plane, not every worker choice.
- EKS Anywhere does not mean AWS manages the customer's on-premises cluster.
- ECS and EKS are orchestrators; Fargate is compute.

📝 PRACTICE QUESTION<br />A company already operates Kubernetes on-premises. It wants a consistent Kubernetes experience on AWS while AWS manages the control plane. Which service should it use?<br />A. Amazon EKS<br />B. Amazon ECS<br />C. Amazon ECR only<br />D. AWS Transfer Family

<b>Answer: A.</b> EKS provides a managed Kubernetes control plane. ECS is AWS-native orchestration. ECR stores images. Transfer Family moves files.

🔁 ONE-LINE RECAP<br />EKS manages Kubernetes on AWS, ECR stores container images, and Anywhere options extend orchestration to customer-managed infrastructure.

---

### 65. AWS Elastic Beanstalk (Domain 2.1)

🧒 LIKE I'M 5<br />You give a tiffin shop owner your recipe. They arrange the kitchen, workers, and counters. Elastic Beanstalk takes your application code and provisions its environment.

📖 EXPLAINED SIMPLY

- <b>AWS Elastic Beanstalk:</b> A managed application deployment service for supported platforms.
- Upload your application code. Beanstalk provisions resources such as EC2 instances, Auto Scaling groups, load balancers, and monitoring.
- It supports common platforms such as Java, .NET, Node.js, Python, PHP, Ruby, Go, and Docker, subject to current platform availability.
- You can choose a <b>web server environment</b> for web applications or a <b>worker environment</b> for background jobs.
- Beanstalk monitors environment health and supports application versions and rolling deployments.
- You retain access to the underlying AWS resources. You can configure many settings without manually building every resource.
- Beanstalk itself has no additional service charge. You pay for the underlying EC2, load balancing, storage, and other resources.
- It reduces deployment and infrastructure setup work. It is not a fully serverless service because it commonly provisions EC2 instances.
- Use it to deploy common web applications quickly when its supported platform model fits.
- Avoid it when you need complete control over every infrastructure component or an unusual container orchestration model.
- Use ECS/EKS for more direct container orchestration. Use Lambda for short event-driven functions.

📚 JARGON BOX

- Platform as a Service (PaaS) → Service managing much of the application hosting setup.
- Environment → Resources running one deployed application version.
- Web server environment → Environment receiving web requests.
- Worker environment → Environment processing background jobs.
- Rolling deployment → Replace application instances gradually.
- Application version → Stored version of uploaded application code.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main model | Best use |
| --- | --- | --- |
| Elastic Beanstalk | Managed application platform | Deploy common web apps quickly |
| EC2 | Virtual servers | Full server control |
| ECS/Fargate | Container orchestration and compute | Containerized services |
| Lambda | Serverless functions | Event-driven short tasks |

🎯 EXAM LENS

- "Upload code; AWS provisions EC2 and load balancing" → Elastic Beanstalk.
- "Managed web and worker environments" → Elastic Beanstalk.
- "No additional Beanstalk service charge" → Pay for underlying resources.
- "Need Kubernetes" → EKS, not Beanstalk.

🪤 TRAPS

- Beanstalk is not the same as Lambda serverless.
- You still pay for provisioned AWS resources.
- Beanstalk does not remove all infrastructure configuration.
- It does not replace Kubernetes when Kubernetes features are required.

📝 PRACTICE QUESTION<br />A small team wants to deploy a standard Node.js web application quickly. It wants AWS to provision instances, load balancing, and scaling. Which service fits?<br />A. Elastic Beanstalk<br />B. CloudHSM<br />C. AWS Artifact<br />D. VPC Flow Logs

<b>Answer: A.</b> Beanstalk provisions and manages the common application environment. The other services handle encryption, compliance documents, or network logs.

🔁 ONE-LINE RECAP<br />Elastic Beanstalk deploys supported application code and provisions the common hosting resources around it.

---

### 66. Microservices and event-driven design patterns (Domain 2.1)

🧒 LIKE I'M 5<br />One giant restaurant does every job. A microservice design has separate teams for billing, delivery, and inventory. Events let those teams communicate without waiting on each other.

📖 EXPLAINED SIMPLY

- <b>Monolith:</b> An application built and deployed as one main unit. It can be simple to start but harder to scale or change parts independently.
- <b>Microservices:</b> Small services organized around business capabilities. Each service can be deployed and scaled independently.
- Each microservice should own its data where practical. Avoid many services writing directly to the same database tables.
- Services communicate through APIs or messages. Use API Gateway and load balancers for synchronous requests.
- <b>Event-driven architecture:</b> A service publishes an event when something happens. Other services react without a direct request from the original service.
- Use EventBridge for event routing, SNS for pub/sub, and SQS for buffering and decoupling.
- <b>Loose coupling:</b> One service does not need to know every detail of another service. This lets teams change and scale independently.
- <b>Saga pattern:</b> A long business transaction is split into steps. Each step has a compensating action if a later step fails.
- <b>Idempotency:</b> Repeating the same request should not create duplicate business effects. Use idempotency keys or durable request records.
- <b>Dead-letter queue:</b> Separates messages that repeatedly fail. This prevents one poison message from blocking all work.
- Use retries with backoff for temporary failures. Avoid unlimited rapid retries that overload a failing service.
- Microservices add network calls, monitoring, deployment, security, and data consistency complexity.
- Do not split a simple application into many services without a clear reason. A modular monolith may be better initially.
- Use microservices when teams need independent release and scaling, or business boundaries are well understood.

📚 JARGON BOX

- Monolith → Application deployed as one main unit.
- Microservice → Small independently deployable service.
- Event-driven → Components react to events.
- Loose coupling → Components depend less on each other's internal details.
- Saga → Multi-step transaction with compensating actions.
- Idempotency → Repeating an operation does not duplicate its effect.
- Poison message → Message that repeatedly fails.
- Backoff → Wait longer between retries.

⚖️ COMPARE WITH LOOKALIKES

| Pattern | Strength | Trade-off |
| --- | --- | --- |
| Monolith | Simpler deployment and local calls | Parts scale and deploy together |
| Microservices | Independent deployment and scaling | More distributed complexity |
| Synchronous API | Immediate response path | Caller depends on service availability |
| Event-driven messaging | Loose coupling and buffering | Eventual consistency and duplicate handling |

🎯 EXAM LENS

- "Independent services and deployments" → Microservices.
- "React to events without direct calls" → Event-driven architecture.
- "Absorb traffic spikes between services" → SQS.
- "One event to multiple services" → SNS or EventBridge.
- "Compensate earlier steps after failure" → Saga pattern.
- "Avoid duplicate payments after retries" → Idempotency.

🪤 TRAPS

- Microservices are not automatically cheaper or faster.
- A message queue does not guarantee business-level exactly-once effects.
- Retries can duplicate work unless operations are idempotent.
- Sharing one database across all services creates tight coupling.
- Event-driven systems can be eventually consistent.

📝 PRACTICE QUESTION<br />An order workflow sends payment, inventory, and delivery events to separate services. A service failure must not stop other services from processing their own work. What pattern is best?<br />A. Event-driven microservices with separate SQS queues<br />B. One shared local session file<br />C. One large EC2 instance with no queue<br />D. Disable retries

<b>Answer: A.</b> Separate queues buffer work independently and reduce direct service dependency. The other options create coupling or reduce resilience.

🔁 ONE-LINE RECAP<br />Microservices separate business capabilities, while event-driven messaging lets services work independently and recover from temporary failures.

---

### 67. AWS Transfer Family and Amazon AppFlow (Domain 2.1)

🧒 LIKE I'M 5<br />A company receives supplier files through a secure gate and also collects sales data from online business tools. Transfer Family handles secure file delivery. AppFlow moves data between SaaS applications.

📖 EXPLAINED SIMPLY

- <b>AWS Transfer Family:</b> A fully managed file-transfer service for moving files into and out of AWS storage.
- It supports protocols such as SFTP, FTPS, FTP, and AS2. Supported capabilities depend on the endpoint type and configuration.
- Files can be stored in Amazon S3 or Amazon EFS.
- It supports identity options such as service-managed users and custom identity providers. Choose the model that fits your users and security design.
- Use Transfer Family when suppliers, banks, or partners already exchange files using standard transfer protocols.
- It removes the need to operate your own public SFTP server. Configure users, permissions, logging, network access, and storage locations.
- <b>Amazon AppFlow:</b> A managed integration service that transfers data between supported SaaS applications and AWS services.
- It supports connectors for applications such as Salesforce and other supported SaaS products.
- Flows can run on a schedule, on supported events, or on demand.
- AppFlow can apply field mapping, filtering, and transformations while transferring data.
- It can send data to destinations such as S3, Redshift, or supported SaaS services.
- Use AppFlow for SaaS-to-AWS data integration. Use Transfer Family for protocol-based file exchange.
- Neither service replaces a full custom data pipeline when complex processing or orchestration is required.

📚 JARGON BOX

- SFTP → Secure File Transfer Protocol.
- FTPS → FTP protected by TLS.
- FTP → File Transfer Protocol.
- AS2 → Applicability Statement 2; protocol for secure business data exchange.
- SaaS → Software as a Service; software delivered over the internet.
- Connector → Integration that lets one service communicate with another.
- Flow → AppFlow configuration for moving data.
- Field mapping → Matching a source field to a destination field.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main job | Best use |
| --- | --- | --- |
| Transfer Family | Managed file-transfer endpoints | Partner SFTP/FTPS/FTP/AS2 |
| AppFlow | SaaS application data integration | Salesforce-to-S3 data flow |
| DataSync | Managed bulk data transfer | Copy data between storage systems |
| Glue | Data catalog and ETL | Prepare and transform datasets |

🎯 EXAM LENS

- "Partner uploads files using SFTP" → Transfer Family.
- "Store transferred files directly in S3" → Transfer Family with S3 storage.
- "Move Salesforce records into S3 on a schedule" → AppFlow.
- "Map fields and filter SaaS records" → AppFlow.
- "Bulk copy file systems or object storage" → DataSync may fit better.

🪤 TRAPS

- Transfer Family is for managed file-transfer protocols, not SaaS record integration.
- AppFlow is not an SFTP server.
- DataSync is for storage transfer, not SaaS application connector workflows.
- Configure identity and destination permissions; managed transfer does not mean public access.

📝 PRACTICE QUESTION<br />A supplier sends nightly invoice files using SFTP. The company wants the files stored in an S3 bucket without managing an SFTP server. Which service should it use?<br />A. AWS Transfer Family<br />B. Amazon AppFlow<br />C. AWS Glue<br />D. Amazon Cognito

<b>Answer: A.</b> Transfer Family provides managed SFTP endpoints and can store incoming files in S3. AppFlow moves SaaS records. Glue transforms data. Cognito manages application identities.

🔁 ONE-LINE RECAP<br />Transfer Family manages secure file-transfer protocols; AppFlow moves data between SaaS applications and AWS services.

---

## ✅ Domain 2.1 topics 51–67 completed. Batch 4 continues with topics 68–80.

## 2.2 Design highly available and/or fault-tolerant architectures

Topics to cover, in this order:

1. High availability vs fault tolerance; single points of failure
2. Multi-AZ vs multi-Region designs
3. Route 53 routing policies and health checks (failover, latency, weighted, geolocation)
4. RDS Multi-AZ, Aurora replicas and Global Database, DynamoDB Global Tables
5. RDS Proxy
6. Disaster recovery: backup & restore, pilot light, warm standby, active-active; RPO and RTO
7. Storage durability and replication (S3 CRR/SRR, EBS snapshots, AWS Backup)
8. Immutable infrastructure and automation (CloudFormation, AMIs)
9. Service quotas and throttling
10. Observability: CloudWatch, X-Ray
11. Managed AI services in resilient designs (Comprehend, Polly, etc.)
12. Making legacy apps more reliable

---

### 68. High availability vs fault tolerance; single points of failure (Domain 2.2)

🧒 LIKE I'M 5<br />A shop with two workers can stay open when one worker is sick. A fault-tolerant shop keeps serving customers with almost no interruption when something fails.

📖 EXPLAINED SIMPLY

- <b>High availability (HA):</b> Design that aims to keep a service running with minimal downtime.
- HA uses redundancy, health checks, failover, and multiple Availability Zones. A failed component is replaced or traffic moves to a healthy component.
- <b>Fault tolerance:</b> A design that continues operating through a failure with little or no interruption.
- Fault tolerance usually requires more redundancy and careful real-time synchronization. It often costs more than ordinary HA.
- A <b>single point of failure (SPOF)</b> is one component whose failure can stop the whole system.
- Examples include one EC2 instance, one NAT gateway serving every AZ, one VPN tunnel, or one database without standby or recovery.
- Remove SPOFs by using multiple AZs, redundant network paths, load balancers, Auto Scaling, and database failover.
- Redundancy alone is not enough. Health checks and routing must detect failures and move traffic.
- Backups help recover lost data. They do not automatically provide high availability.
- Multi-AZ protects against AZ failures inside a Region. Multi-Region designs protect against wider regional failures.
- HA may briefly interrupt requests during failover. Fault tolerance aims to continue without noticeable interruption.
- Use HA for most production systems. Use fault-tolerant designs when even short interruptions are unacceptable.
- Test failover. Untested backups and standby resources may not work when needed.

📚 JARGON BOX

- High availability → Keeping a service usable with minimal downtime.
- Fault tolerance → Continuing operation despite a failure.
- SPOF → Single Point of Failure.
- Redundancy → Extra components ready to take over.
- Failover → Moving work to a healthy standby or component.
- Recovery → Restoring service after failure.
- AZ → Availability Zone.

⚖️ COMPARE WITH LOOKALIKES

| Design | Goal | Typical approach |
| --- | --- | --- |
| Single instance | Low complexity | One server |
| High availability | Minimize downtime | Multiple AZs and automatic failover |
| Fault tolerance | Continue with little interruption | Redundant active components and synchronized state |
| Disaster recovery | Restore after a major outage | Backups or another Region |

🎯 EXAM LENS

- "Avoid one AZ taking down the app" → Deploy across multiple AZs.
- "No single point of failure" → Redundant components and paths.
- "Continue with no noticeable interruption" → Fault tolerance.
- "Accept short recovery but minimize downtime" → High availability.
- "Restore after Region loss" → Multi-Region disaster recovery.

🪤 TRAPS

- A backup is not the same as a running standby.
- Multi-AZ is not automatically multi-Region.
- One NAT gateway shared by all AZs can be a failure dependency.
- Redundant servers are useless if traffic cannot fail over to them.

📝 PRACTICE QUESTION<br />A customer-facing application must remain available if one AZ fails. Which design is most appropriate?<br />A. Application servers across multiple AZs behind a load balancer<br />B. One large EC2 instance in one AZ<br />C. Daily snapshots in the same AZ only<br />D. One database with no standby

<b>Answer: A.</b> Multiple AZs and load balancing remove an AZ as a single failure point. B and D remain single points. C is backup, not immediate HA.

🔁 ONE-LINE RECAP<br />High availability minimizes downtime, fault tolerance aims to continue through failures, and both require removing single points of failure.

---

### 69. Route 53 basics: hosted zones, record types, alias vs CNAME, TTL (Domain 2.2)

🧒 LIKE I'M 5<br />A phone book maps a person's name to their phone number. DNS maps a website name to the address of its server. Route 53 manages that phone book.

📖 EXPLAINED SIMPLY

- <b>Amazon Route 53:</b> AWS's highly available and scalable DNS service. DNS translates domain names into answers that clients can use.
- A <b>hosted zone</b> stores DNS records for a domain.
- <b>Public hosted zone:</b> Answers DNS queries from the public internet.
- <b>Private hosted zone:</b> Answers DNS queries from associated VPCs. It helps resolve internal names privately.
- A <b>record</b> maps a name to an answer or another DNS target.
- Common records include A for IPv4, AAAA for IPv6, CNAME for another DNS name, MX for mail routing, TXT for text verification, NS for name servers, and SOA for zone authority details.
- <b>Alias record:</b> An AWS-specific Route 53 feature that points a record to supported AWS resources or another record in the same hosted zone.
- Alias records can be used at the zone apex, such as [example.com](http://example.com). They support A and AAAA records for supported targets.
- <b>CNAME:</b> Points one DNS name to another DNS name. It cannot be used at the zone apex because the apex also needs records such as NS and SOA.
- Alias records can point to AWS targets such as ALB, CloudFront, API Gateway, and supported S3 website endpoints.
- Alias queries to supported AWS resources do not incur Route 53 query charges. Other hosted-zone charges can still apply.
- <b>TTL (Time To Live):</b> How long DNS resolvers may cache a record before asking again.
- A shorter TTL can make DNS changes take effect sooner, but causes more DNS queries. Resolver caching means changes are not always instant.
- Alias records use the target resource's TTL behavior. You do not set a normal TTL on an alias to an AWS resource.
- Use private hosted zones for internal DNS. Use alias records for AWS resources, especially at the root domain.
- Do not use CNAME at the domain apex. Do not expect DNS updates to be instant because caches exist.

📚 JARGON BOX

- DNS → Domain Name System.
- Hosted zone → Collection of DNS records for a domain.
- Public hosted zone → DNS records visible to internet resolvers.
- Private hosted zone → DNS records available to associated VPCs.
- A record → Maps a name to an IPv4 address.
- AAAA record → Maps a name to an IPv6 address.
- CNAME → Points one DNS name to another DNS name.
- Alias → Route 53 record pointing to supported AWS resources or records.
- TTL → Time a DNS answer may remain cached.
- Zone apex → Root of a domain, such as [example.com](http://example.com).

⚖️ COMPARE WITH LOOKALIKES

| Feature | Alias | CNAME |
| --- | --- | --- |
| Points to | AWS resource or supported record | Another DNS name |
| Zone apex allowed | Yes | No |
| AWS resource integration | Yes, supported targets | Indirect DNS name only |
| Query charges to AWS target | No Route 53 query charge for supported alias targets | Normal DNS query pricing |
| Record types | A/AAAA for supported targets | CNAME |

🎯 EXAM LENS

- "Route apex domain to ALB" → Alias A record.
- "Route domain to CloudFront" → Alias A/AAAA record.
- "Internal DNS names for VPC resources" → Private hosted zone.
- "How long DNS answers are cached" → TTL.
- "Point one subdomain to another DNS name" → CNAME.

🪤 TRAPS

- CNAME cannot be used at the zone apex.
- Alias is not a standard DNS record type; it is a Route 53 feature.
- A Route 53 hosted zone is not a VPC.
- DNS TTL caching can delay failover or record changes.

📝 PRACTICE QUESTION<br />A company wants [example.com](http://example.com), the domain apex, to point to an Application Load Balancer. Which record should it create?<br />A. Alias A record<br />B. CNAME at the zone apex<br />C. MX record<br />D. TXT record

<b>Answer: A.</b> Route 53 alias records can point the apex to an ALB. CNAME cannot be used at the zone apex. MX and TXT serve other purposes.

🔁 ONE-LINE RECAP<br />Route 53 hosts DNS records; use alias records for AWS targets and apex names, and understand TTL caching.

---

### 70. Route 53 routing policies and health checks (Domain 2.2)

🧒 LIKE I'M 5<br />A railway control room chooses which train route passengers should take. Route 53 routing policies choose which endpoint a DNS query receives.

📖 EXPLAINED SIMPLY

- Route 53 supports routing policies that answer DNS queries differently based on configured rules.
- <b>Simple routing:</b> Returns one resource record or a set of values. Use it for a basic endpoint without health-based choice among records.
- <b>Weighted routing:</b> Sends a chosen percentage of DNS responses to each record. Use it for traffic splitting, testing, and gradual migrations.
- <b>Latency-based routing:</b> Returns the endpoint expected to give the lowest network latency to the user.
- <b>Failover routing:</b> Uses primary and secondary records. Health checks can cause DNS to return the healthy secondary when the primary fails.
- <b>Geolocation routing:</b> Routes based on the geographic location of the DNS user. Use it for regional content or legal requirements.
- <b>Geoproximity routing:</b> Routes based on the geographic location of resources and users. Bias shifts the geographic area served by a resource.
- <b>Multivalue answer routing:</b> Returns multiple healthy records. It is not a replacement for a full load balancer.
- <b>Health checks:</b> Route 53 can monitor endpoints, other health checks, or CloudWatch alarms depending on the check type.
- A health check can evaluate endpoint availability using supported protocols. Configure the check to match the real application health requirement.
- DNS failover changes DNS answers. Cached records may continue pointing to the old address until their TTL expires.
- Weighted routing does not guarantee each individual request receives an exact percentage. DNS caching affects observed traffic.
- Use failover for primary/secondary endpoints, latency for global performance, and weighted routing for controlled splits.
- Do not use geolocation when you actually need latency optimization. These policies answer different questions.

📚 JARGON BOX

- Routing policy → Rule choosing DNS answers.
- Weighted → Divide answers by configured weights.
- Latency → Time for a network request to travel.
- Failover → Switch to a healthy backup.
- Geolocation → Routing based on user location.
- Geoproximity → Routing based on user and resource location with bias.
- Health check → Test monitoring endpoint health.
- DNS caching → Resolvers keep answers until TTL expiry.

⚖️ COMPARE WITH LOOKALIKES

| Policy | Decision basis | Typical use |
| --- | --- | --- |
| Simple | Basic records | One endpoint |
| Weighted | Configured weights | Canary or traffic split |
| Latency | Lowest measured latency | Improve global response |
| Failover | Primary/secondary health | Disaster or endpoint failover |
| Geolocation | User's location | Country-based routing |
| Geoproximity | Geographic distance and bias | Shift traffic between regions |
| Multivalue | Multiple healthy records | Basic DNS-level distribution |

🎯 EXAM LENS

- "Send 10% to a new version" → Weighted routing.
- "Lowest latency Region" → Latency-based routing.
- "Primary fails, secondary answers" → Failover routing with health checks.
- "Serve users by country" → Geolocation.
- "Adjust the geographic area served" → Geoproximity.
- "Return several healthy IPs" → Multivalue answer.

🪤 TRAPS

- Weighted routing is not the same as latency routing.
- Geolocation and geoproximity are different.
- DNS failover is affected by TTL and resolver caches.
- Multivalue routing is not a full health-aware load balancer.

📝 PRACTICE QUESTION<br />A company wants 90% of DNS responses to use the current application and 10% to use a new version during testing. Which policy should it use?<br />A. Weighted routing<br />B. Geolocation routing<br />C. Failover routing<br />D. Simple routing

<b>Answer: A.</b> Weighted routing splits DNS responses using configured weights. Geolocation uses location. Failover selects primary or secondary. Simple routing does not split by percentage.

🔁 ONE-LINE RECAP<br />Route 53 policies choose DNS answers by weight, latency, health, or geography; select the policy matching the requirement.

---

### 71. RDS Multi-AZ: DB instance vs DB cluster deployments (Domain 2.2)

🧒 LIKE I'M 5<br />A restaurant keeps a spare kitchen ready in another building. If the main kitchen fails, the spare takes over. RDS Multi-AZ provides database availability across AZs.

📖 EXPLAINED SIMPLY

- <b>Amazon RDS Multi-AZ:</b> A high-availability deployment option for supported relational database engines.
- <b>Multi-AZ DB instance deployment:</b> RDS maintains a primary DB instance and a standby in another AZ.
- RDS synchronously replicates data to the standby in a standard Multi-AZ DB instance deployment.
- The standby is for failover. It does not serve normal read traffic.
- If the primary fails, RDS automatically fails over to the standby. The database endpoint is maintained, but applications may need to reconnect.
- <b>Multi-AZ DB cluster deployment:</b> Provides one writer and two readable standby DB instances across three AZs for supported engines.
- The readable standbys can serve read traffic. The cluster deployment can provide both availability and read scaling.
- Multi-AZ DB clusters use a different replication and failover design from the traditional standby instance deployment.
- Multi-AZ DB instance is best when the requirement is high availability with a non-readable standby.
- Multi-AZ DB cluster is useful when the supported engine and design need a writer plus readable standby instances.
- Multi-AZ is not a backup. Keep automated backups and snapshots for data recovery.
- Read replicas are a separate feature primarily for read scaling. They are covered next.
- Choose the exact deployment type from the wording. A question saying "standby cannot serve reads" points to a Multi-AZ DB instance.

📚 JARGON BOX

- RDS → Relational Database Service.
- Multi-AZ → Deployment spanning Availability Zones.
- Primary → DB instance handling writes.
- Standby → Ready secondary used for failover.
- Readable standby → Secondary instance able to serve reads.
- Synchronous replication → Writes are replicated before successful completion under the deployment's replication rules.
- Failover → Switching the active database endpoint to another instance.

⚖️ COMPARE WITH LOOKALIKES

| Deployment | Topology | Standby readable? | Main purpose |
| --- | --- | --- | --- |
| Multi-AZ DB instance | Primary + standby | No | High availability |
| Multi-AZ DB cluster | Writer + two standby DB instances across AZs | Yes | HA and read scaling |
| Read replica | Primary + asynchronous replica | Yes | Read scaling |

🎯 EXAM LENS

- "Automatic failover, standby cannot serve reads" → Multi-AZ DB instance.
- "Writer and two readable standby instances" → Multi-AZ DB cluster.
- "Improve read throughput" → Read replica or cluster readable standby.
- "Protect against AZ failure" → Multi-AZ.
- "Recover deleted data" → Backup or point-in-time recovery, not only Multi-AZ.

🪤 TRAPS

- Traditional Multi-AZ standby is not a read replica.
- Multi-AZ improves availability; it does not replace backups.
- Applications may need to reconnect after failover.
- Multi-AZ cluster and Multi-AZ instance are different deployment models.

📝 PRACTICE QUESTION<br />A database must automatically fail over to another AZ. The standby must not receive read traffic. Which deployment should be selected?<br />A. RDS Multi-AZ DB instance deployment<br />B. One read replica only<br />C. One DB instance in one AZ<br />D. S3 Standard

<b>Answer: A.</b> The traditional Multi-AZ DB instance has a non-readable standby for failover. Read replicas serve reads. C has no standby. S3 is object storage.

🔁 ONE-LINE RECAP<br />Traditional RDS Multi-AZ uses a non-readable standby for HA; Multi-AZ DB clusters add readable standby instances.

---

### 72. Read replicas vs Multi-AZ (Domain 2.2)

🧒 LIKE I'M 5<br />A shop keeps a backup counter for emergencies and separate counters for serving more customers. Multi-AZ is the emergency spare. Read replicas are extra counters for read traffic.

📖 EXPLAINED SIMPLY

- <b>Read replica:</b> A separate read-only copy of a supported database. It receives changes from the source through asynchronous replication.
- Asynchronous replication means writes can reach the replica after a delay. This delay is called replication lag.
- Applications send read-heavy queries to replicas. This reduces read pressure on the primary database.
- A read replica can often be promoted to a standalone writable database if required. Promotion changes its role and requires application routing changes.
- Supported RDS engines can use read replicas across AZs or Regions. Cross-Region support depends on the database engine and configuration.
- <b>Multi-AZ DB instance:</b> Uses synchronous replication to a standby for high availability. The standby does not serve normal read traffic.
- Multi-AZ automatically fails over when the primary has a qualifying failure. A read replica is generally promoted through an administrative action or configured workflow.
- Read replicas are useful for reporting, analytics, and read-heavy applications. They are not a substitute for HA.
- Multi-AZ is useful when database availability and automatic failover are the main requirements.
- Use both when you need high availability and extra read capacity.
- Replication is not the same as backup. Accidental deletes or bad writes can be copied to replicas.
- Read replicas can lag. Do not use them for reads that must always reflect the latest committed write.

📚 JARGON BOX

- Read replica → Read-only database copy for read scaling.
- Asynchronous → Changes are copied later rather than waiting for replica confirmation.
- Replication lag → Delay between source and replica updates.
- Promotion → Turning a read replica into an independent writable database.
- Synchronous → Write completion waits for the required replication step.
- Read-heavy → Workload with many more reads than writes.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Multi-AZ DB instance | Read replica |
| --- | --- | --- |
| Main goal | High availability | Read scaling |
| Replication | Synchronous standby replication | Asynchronous |
| Can serve reads? | Standby cannot | Yes |
| Failover | Automatic for supported failures | Usually promote or configured failover |
| Cross-Region | Not the same as a cross-Region replica | Supported for eligible engines |

🎯 EXAM LENS

- "Increase SELECT/read throughput" → Read replica.
- "Automatic failover to standby" → Multi-AZ.
- "Read replica may lag" → Asynchronous replication.
- "Disaster recovery in another Region" → Cross-Region read replica may help.
- "Need both HA and read scaling" → Multi-AZ plus read replicas.

🪤 TRAPS

- Multi-AZ standby is not a read replica.
- Read replicas are asynchronous and may be stale.
- Read replicas are not backups.
- Promotion is not the same as automatic Multi-AZ failover.

📝 PRACTICE QUESTION<br />An online reporting system creates heavy read traffic. The primary database must continue serving writes, and reports can tolerate slight replication lag. What should it add?<br />A. Read replica<br />B. Traditional Multi-AZ standby for read traffic<br />C. Another security group<br />D. NAT gateway

<b>Answer: A.</b> A read replica serves read queries asynchronously. The traditional Multi-AZ standby does not serve normal reads. Security groups and NAT do not scale database reads.

🔁 ONE-LINE RECAP<br />Use Multi-AZ for automatic availability and read replicas for read scaling; use both when both goals matter.

---

### 73. Aurora architecture, replicas, and Global Database (Domain 2.2)

🧒 LIKE I'M 5<br />Aurora stores database pages in a shared, replicated storage system. Several database computers can use that same storage, with one handling writes and others helping with reads.

📖 EXPLAINED SIMPLY

- <b>Amazon Aurora:</b> A relational database compatible with MySQL or PostgreSQL, designed for cloud performance and availability.
- An Aurora DB cluster has a shared cluster storage volume. It automatically grows as data grows.
- Aurora stores six copies of data across three AZs. It is designed to continue operating after certain storage failures.
- A cluster usually has one writer DB instance and can have reader instances called Aurora Replicas.
- Aurora Replicas share the cluster volume. They do not each maintain a separate full data copy.
- You can add up to 15 Aurora Replicas to a cluster. Use them to scale reads and provide failover targets.
- <b>Writer endpoint:</b> Connects applications to the current writer.
- <b>Reader endpoint:</b> Distributes read connections across available reader instances.
- <b>Custom endpoint:</b> Connects to a chosen group of DB instances, useful for workload-specific routing.
- If the writer fails, Aurora can promote a reader replica. Applications reconnect using the cluster endpoint.
- <b>Aurora Global Database:</b> Replicates an Aurora cluster to secondary Regions. It supports low-latency reads in secondary Regions and disaster recovery.
- Secondary Regions are typically read-only until promoted. A regional failover changes which Region serves writes.
- Global Database replication is storage-based and asynchronous across Regions. It is designed for low replication lag, but it is not a guarantee of zero data loss.
- Aurora Multi-AZ storage replication is not the same as Aurora Global Database. One protects within a Region; the other extends across Regions.
- Use Aurora when MySQL or PostgreSQL compatibility plus managed cluster storage and replicas fit.
- Use Global Database for cross-Region disaster recovery or geographically distributed reads.

📚 JARGON BOX

- Aurora cluster → Database instances sharing one cluster storage volume.
- Cluster volume → Distributed storage used by Aurora instances.
- Writer → Instance accepting database writes.
- Aurora Replica → Reader instance sharing cluster storage.
- Writer endpoint → Endpoint routing to the current writer.
- Reader endpoint → Endpoint distributing read connections.
- Global Database → Aurora design spanning multiple Regions.
- Promotion → Turning a reader into the writer.

⚖️ COMPARE WITH LOOKALIKES

| Feature | RDS Multi-AZ DB instance | Aurora Replicas | Aurora Global Database |
| --- | --- | --- | --- |
| Main purpose | HA standby | Read scaling and failover | Cross-Region reads and DR |
| Storage | Instance deployment model | Shared cluster volume | Replicated across Regions |
| Readable secondary | No for traditional standby | Yes | Secondary cluster can serve reads |
| Scope | AZs in a Region | Cluster in a Region | Multiple Regions |

🎯 EXAM LENS

- "Six copies across three AZs" → Aurora storage architecture.
- "Up to 15 reader replicas" → Aurora Replicas.
- "Scale reads with shared cluster storage" → Aurora reader endpoint.
- "Cross-Region disaster recovery for Aurora" → Aurora Global Database.
- "Send writes to current primary" → Writer endpoint.

🪤 TRAPS

- Aurora Replicas share cluster storage; they are not ordinary independent copies.
- Traditional RDS Multi-AZ standby and Aurora Replicas have different read behavior.
- Global Database does not mean synchronous zero-loss cross-Region writes.
- Reader endpoint is for reads; writer endpoint handles writes.

📝 PRACTICE QUESTION<br />A global application uses Aurora MySQL. It needs low-latency reads in another Region and cross-Region disaster recovery. Which feature should it use?<br />A. Aurora Global Database<br />B. Traditional RDS Multi-AZ standby only<br />C. S3 Transfer Acceleration<br />D. One larger EC2 instance

<b>Answer: A.</b> Aurora Global Database provides secondary Regions for reads and disaster recovery. Multi-AZ protects within a Region. The other choices do not provide cross-Region Aurora replication.

🔁 ONE-LINE RECAP<br />Aurora shares replicated cluster storage across writer and readers; Global Database extends reads and recovery across Regions.

---

### 74. DynamoDB Global Tables, backups, and point-in-time recovery (Domain 2.2)

🧒 LIKE I'M 5<br />A company has branches in several cities. Each branch can serve local customers, while updates are copied between branches. DynamoDB Global Tables work similarly across Regions.

📖 EXPLAINED SIMPLY

- <b>Amazon DynamoDB:</b> A fully managed NoSQL database for key-value and document data.
- <b>Global Tables:</b> Create a multi-Region, multi-active DynamoDB table. Applications can read and write locally in participating Regions.
- Replicas automatically replicate table data between Regions. This supports low-latency local access and regional resilience.
- Global Tables have two consistency modes: <b>multi-Region eventual consistency (MREC)</b> and <b>multi-Region strong consistency (MRSC)</b>.
- <b>MREC:</b> Replication between Regions is asynchronous. Updates eventually converge, and applications must handle replication delay and conflict behavior.
- <b>MRSC:</b> Provides strong consistency across supported multi-Region configurations. It has topology and feature constraints, so confirm supported Regions and table options before choosing it.
- Global Tables are useful for globally distributed applications and regional disaster recovery. They do not eliminate the need for backups.
- <b>On-demand backup:</b> Creates a backup that remains until deleted. It is independent of table performance and can be restored to a new table.
- <b>Point-in-time recovery (PITR):</b> Continuously backs up table data and lets you restore to a selected second within the recovery window.
- DynamoDB PITR supports a recovery window of up to 35 days. It protects against accidental writes and deletes.
- Restoring a table creates a new table. You must update application configuration or DNS/service discovery to use it.
- Backups and PITR protect data. Global Tables primarily provide multi-Region availability and replication.
- Use Global Tables for multi-Region active-active access. Use PITR for recent data recovery. Use on-demand backups for retained restore points.

📚 JARGON BOX

- NoSQL → Database model not based on traditional relational tables and joins.
- Global Table → DynamoDB table replicated across Regions.
- Multi-active → More than one Region can accept writes.
- MREC → Multi-Region eventual consistency.
- MRSC → Multi-Region strong consistency.
- PITR → Point-in-time recovery.
- On-demand backup → Backup created and kept until deleted.
- Restore → Create a new table using backup data.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Global Tables | On-demand backup | PITR |
| --- | --- | --- | --- |
| Main goal | Multi-Region access and resilience | Retained restore point | Recover to recent time |
| Replicates live updates | Yes | No | Backup history |
| Recovery window | Depends on replication mode | Until deleted | Up to 35 days |
| Restores new table | No, it creates replicas | Yes | Yes |

🎯 EXAM LENS

- "Read and write locally in multiple Regions" → DynamoDB Global Tables.
- "Active-active DynamoDB" → Global Tables.
- "Restore table to a specific second" → PITR.
- "Keep a backup until manually deleted" → On-demand backup.
- "Replicate live data but protect from accidental deletion" → Global Tables plus backups/PITR.

🪤 TRAPS

- Global Tables are not a backup.
- PITR restore creates a new table.
- MREC and MRSC have different consistency and topology behavior.
- Replication does not replace retention and recovery planning.

📝 PRACTICE QUESTION<br />A DynamoDB application must serve local reads and writes in two Regions. It must also recover a table to a point shortly before accidental deletion. What should it use?<br />A. Global Tables plus point-in-time recovery<br />B. Global Tables only<br />C. On-demand backup only<br />D. A Route 53 health check

<b>Answer: A.</b> Global Tables provide multi-Region active-active access. PITR provides recovery to a chosen point. Global Tables alone do not replace backups.

🔁 ONE-LINE RECAP<br />Global Tables provide multi-Region DynamoDB access; on-demand backups and PITR protect against data loss.

---

### 75. Amazon RDS Proxy (Domain 2.2)

🧒 LIKE I'M 5<br />A busy restaurant has one receptionist who manages table bookings. Customers do not each occupy a separate table while waiting. RDS Proxy manages database connections between apps and databases.

📖 EXPLAINED SIMPLY

- <b>Amazon RDS Proxy:</b> A fully managed database proxy for supported RDS and Aurora databases.
- It sits between application connections and the database. Applications connect to the proxy endpoint instead of directly opening many database connections.
- <b>Connection pooling:</b> Reuses database connections across application requests. This reduces the number of connections the database must maintain.
- <b>Connection multiplexing:</b> Allows the proxy to reuse a database connection for different client sessions when it is safe to do so.
- This is useful for serverless applications where many Lambda invocations can create sudden connection spikes.
- RDS Proxy can help applications recover from database failover faster by managing connections and redirecting them to the new database target.
- It can integrate with AWS Secrets Manager and IAM database authentication.
- RDS Proxy does not cache query results. It is not a read replica and does not increase database CPU or storage capacity.
- Some session behavior can pin a client connection to a database connection. That reduces multiplexing benefits.
- Use RDS Proxy for connection-heavy applications, especially Lambda workloads, and for improved connection handling during failover.
- Use read replicas for read scaling. Use Multi-AZ for database availability. Use RDS Proxy for connection management.

📚 JARGON BOX

- Proxy → Middle service forwarding requests between clients and a server.
- Connection pooling → Reusing a set of database connections.
- Multiplexing → Sharing backend connections across client sessions when safe.
- Connection storm → Sudden large increase in database connections.
- Session pinning → Client session requires a dedicated backend connection.
- Secrets Manager → Managed storage for credentials and secret rotation.

⚖️ COMPARE WITH LOOKALIKES

| Option | Main problem solved |
| --- | --- |
| RDS Proxy | Connection pooling and failover connection handling |
| Read replica | Read throughput |
| Multi-AZ | High availability |
| ElastiCache | Caching data to reduce database reads |
| Database scaling | More compute, memory, or storage capacity |

🎯 EXAM LENS

- "Lambda creates too many database connections" → RDS Proxy.
- "Reuse database connections" → RDS Proxy.
- "Improve connection recovery during failover" → RDS Proxy.
- "Scale database reads" → Read replicas, not Proxy.
- "Reduce repeated query load" → ElastiCache, not Proxy.

🪤 TRAPS

- RDS Proxy does not cache query results.
- RDS Proxy does not replace Multi-AZ.
- RDS Proxy does not create read replicas.
- It helps connection management; it does not fix slow SQL queries automatically.

📝 PRACTICE QUESTION<br />A serverless application invokes many Lambda functions at once. The functions overload an RDS database with connections. What should the architect add?<br />A. RDS Proxy<br />B. Route 53 geolocation routing<br />C. S3 Versioning<br />D. AWS Artifact

<b>Answer: A.</b> RDS Proxy pools and reuses database connections. The other services do not manage database connection counts.

🔁 ONE-LINE RECAP<br />RDS Proxy pools and manages connections between application clients and RDS or Aurora databases.

---

### 76. Disaster recovery strategies, RPO, and RTO (Domain 2.2)

🧒 LIKE I'M 5<br />A family prepares for a flood. One plan keeps copies of important papers. Another keeps a small spare house ready. A stronger plan keeps a second home fully running.

📖 EXPLAINED SIMPLY

- <b>Disaster recovery (DR):</b> Plans and technology used to restore workloads after a major failure.
- A disaster may affect a server, AZ, Region, data center, or an entire application.
- <b>RPO (Recovery Point Objective):</b> Maximum acceptable amount of data loss, measured in time.
- <b>RTO (Recovery Time Objective):</b> Maximum acceptable time to restore the service.
- If RPO is 15 minutes, the business can tolerate losing up to 15 minutes of recent data. If RTO is one hour, service must return within one hour.
- <b>Backup and restore:</b> Keep backups and rebuild resources after disaster. It usually has the lowest ongoing cost and the longest recovery time.
- <b>Pilot light:</b> Keep critical core components running, often including replicated data. Start or scale the remaining resources during recovery.
- <b>Warm standby:</b> Keep a smaller but working copy of the full workload running. Scale it up during disaster.
- <b>Multi-site active/active:</b> Run workloads in multiple locations and serve traffic from them. It usually provides the fastest recovery and highest ongoing cost.
- The strategies form a general cost and recovery spectrum. Faster recovery normally needs more ready resources and more testing.
- Use backups for less critical systems with longer recovery targets. Use pilot light or warm standby when recovery needs are stricter.
- Use active/active for services that need very fast recovery and can handle multi-site data consistency.
- RPO depends on replication and backup frequency. RTO depends on detection, failover, infrastructure, and application recovery steps.
- Test DR plans regularly. A documented plan that has never been tested may fail during a real event.

📚 JARGON BOX

- DR → Disaster Recovery.
- RPO → Recovery Point Objective; acceptable data-loss window.
- RTO → Recovery Time Objective; acceptable service-restoration time.
- Backup and restore → Rebuild from stored backups.
- Pilot light → Keep core components ready; start the rest during recovery.
- Warm standby → Keep a smaller working copy running.
- Active/active → Multiple locations serve live traffic.
- Failover → Move traffic or service to a recovery location.

⚖️ COMPARE WITH LOOKALIKES

| Strategy | Readiness | Recovery speed | Relative cost |
| --- | --- | --- | --- |
| Backup and restore | Backups only | Slowest | Lowest |
| Pilot light | Core components ready | Faster | Low to medium |
| Warm standby | Smaller live environment | Faster still | Medium to high |
| Multi-site active/active | Full environments serving traffic | Fastest | Highest |

🎯 EXAM LENS

- "Lowest cost; can wait hours" → Backup and restore.
- "Database replicated, app servers launched during recovery" → Pilot light.
- "Scaled-down live copy of whole workload" → Warm standby.
- "Both Regions serve users continuously" → Active/active.
- "Maximum data loss measured in time" → RPO.
- "Maximum acceptable downtime" → RTO.

🪤 TRAPS

- RPO is about data loss; RTO is about downtime.
- A backup is not an active standby.
- Pilot light and warm standby are not identical.
- Active/active needs conflict and consistency design, not just two copies.
- Recovery speed increases cost and operational complexity in general.

📝 PRACTICE QUESTION<br />A company can tolerate 30 minutes of data loss and two hours of downtime. Which metrics describe these targets?<br />A. RPO 30 minutes and RTO two hours<br />B. RTO 30 minutes and RPO two hours<br />C. Both are latency targets<br />D. Both describe storage durability

<b>Answer: A.</b> RPO measures acceptable data loss. RTO measures acceptable recovery time. Latency and durability describe different properties.

🔁 ONE-LINE RECAP<br />RPO measures acceptable data loss, RTO measures recovery time, and DR strategies trade cost against recovery speed.

---

### 77. S3 replication: Cross-Region and Same-Region (Domain 2.2)

🧒 LIKE I'M 5<br />A shop copies every new receipt into another godown. One copy stays in the same city. Another copy goes to a different city for regional safety.

📖 EXPLAINED SIMPLY

- <b>S3 Replication:</b> Automatically copies eligible new object versions from a source bucket to a destination bucket.
- <b>Same-Region Replication (SRR):</b> Copies objects to another bucket in the same AWS Region.
- <b>Cross-Region Replication (CRR):</b> Copies objects to a bucket in a different AWS Region.
- Both source and destination buckets must have versioning enabled.
- Configure an IAM role that allows S3 to read source objects and write destination objects.
- Replication is asynchronous. A new object may take time to appear in the destination bucket.
- Replication rules can filter by prefix or object tags and can select which storage class to use at the destination.
- CRR helps with geographic disaster recovery, compliance, and serving users in another Region.
- SRR helps with log aggregation, separate production and test accounts, or copies for data processing in the same Region.
- Existing objects are not automatically replicated just because you add a rule. Use S3 Batch Replication for existing objects.
- Delete markers are not replicated by default in many replication configurations. Enable delete-marker replication where supported and required. Permanent deletion of a specific version is not replicated as a normal delete-marker event.
- Objects encrypted with SSE-KMS need replication settings and KMS permissions for the source and destination keys.
- S3 Replication Time Control is an optional feature designed to replicate most new objects within a 15-minute SLA. It has additional cost.
- Replication is not a substitute for versioning, backups, or Object Lock. Replicated deletes and malicious changes must be considered in recovery design.
- Use CRR for cross-Region copies. Use SRR for same-Region copies. Use Batch Replication for existing objects.

📚 JARGON BOX

- Replication → Automatic copying of object versions.
- SRR → Same-Region Replication.
- CRR → Cross-Region Replication.
- Source bucket → Bucket containing original objects.
- Destination bucket → Bucket receiving replicas.
- Versioning → Keeping multiple versions of objects.
- Batch Replication → Tool to replicate existing objects.
- Replication Time Control → Optional predictable replication-time feature.

⚖️ COMPARE WITH LOOKALIKES

| Feature | SRR | CRR |
| --- | --- | --- |
| Destination | Same Region | Different Region |
| Common use | Log copies, test, account separation | DR, compliance, geographic access |
| Versioning required | Yes, both buckets | Yes, both buckets |
| Timing | Asynchronous | Asynchronous |

🎯 EXAM LENS

- "Copy objects to another Region automatically" → CRR.
- "Replicate logs to another account in same Region" → SRR.
- "Existing objects must be copied" → S3 Batch Replication.
- "Predictable replication time within 15 minutes" → Replication Time Control.
- "Replicate KMS-encrypted objects" → Configure KMS permissions and destination key.

🪤 TRAPS

- Both buckets need versioning.
- Replication is asynchronous, not instant.
- A rule does not automatically copy all old objects.
- Replication does not automatically copy every delete behavior.
- Replication alone is not a complete backup strategy.

📝 PRACTICE QUESTION<br />A company must automatically copy new S3 objects to a bucket in another Region for disaster recovery. Which feature should it configure?<br />A. Cross-Region Replication with versioning on both buckets<br />B. Same-Region Replication<br />C. S3 Transfer Acceleration<br />D. CloudFront invalidation

<b>Answer: A.</b> CRR copies new object versions to a bucket in another Region. SRR stays in the same Region. Transfer Acceleration speeds transfers. CloudFront invalidation removes cached content.

🔁 ONE-LINE RECAP<br />SRR copies within a Region and CRR copies across Regions; both require versioning and replicate asynchronously.

---

### 78. AWS Backup (Domain 2.2)

🧒 LIKE I'M 5<br />A family keeps copies of house documents in one safe place. AWS Backup is a central manager for backup schedules, retention, and copies across supported AWS services.

📖 EXPLAINED SIMPLY

- <b>AWS Backup:</b> A managed service for centralizing and automating backups across supported AWS services and workloads.
- Create a <b>backup plan</b> with rules for schedule, backup window, lifecycle, and destination vault.
- Assign resources to a backup plan using tags, resource IDs, or supported selection methods.
- A <b>backup vault</b> stores recovery points. You can use separate vaults for different teams or data sensitivity levels.
- Backup plans can copy backups across Regions and accounts for additional resilience.
- Lifecycle settings can transition supported backups to colder storage or delete them after an approved period.
- <b>Backup Vault Lock:</b> Enforces a WORM-style retention policy for recovery points. Compliance mode can prevent deletion during the retention period.
- AWS Backup supports many services, including EBS, RDS, EFS, DynamoDB, and other supported workloads. Confirm service and Region support.
- Some services have native backup options too. AWS Backup provides centralized policy and governance.
- Cross-account backup helps separate backup administration from workload administration.
- Use AWS Backup when many services need consistent schedules, retention, and cross-account or cross-Region copies.
- Backups do not automatically provide application failover. Combine them with replication and DR architecture when recovery targets are strict.
- Test restores. A successful backup job does not prove the application can be restored correctly.

📚 JARGON BOX

- Backup plan → Rules defining when and how resources are backed up.
- Backup rule → Schedule and lifecycle settings inside a plan.
- Recovery point → Saved backup state.
- Backup vault → Container for recovery points.
- Vault Lock → Retention protection for a backup vault.
- Cross-account copy → Backup copied to another AWS account.
- Cross-Region copy → Backup copied to another Region.
- Restore test → Check that a backup can recreate a working resource.

⚖️ COMPARE WITH LOOKALIKES

| Option | Main job |
| --- | --- |
| AWS Backup | Central schedules, vaults, lifecycle, copies |
| Native service backup | Service-specific backup controls |
| S3 Replication | Copies live object versions |
| Multi-AZ | Keeps service available across AZs |
| Snapshot | Point-in-time copy of supported storage |

🎯 EXAM LENS

- "Central backup policies across services" → AWS Backup.
- "Copy backups to another account or Region" → AWS Backup.
- "Prevent backup deletion during retention" → Backup Vault Lock.
- "Copy live S3 objects continuously" → S3 Replication, not AWS Backup.
- "Keep application running during AZ failure" → Multi-AZ, not backup alone.

🪤 TRAPS

- Backup is not live replication.
- A backup vault does not automatically make a workload highly available.
- Service support varies by Region and resource type.
- Test restores instead of assuming every backup is usable.

📝 PRACTICE QUESTION<br />A company wants one central backup plan for EBS, RDS, and EFS. It also wants copies in a separate account and Region. Which service should it use?<br />A. AWS Backup<br />B. AWS WAF<br />C. Route 53<br />D. Amazon Cognito

<b>Answer: A.</b> AWS Backup centralizes supported backups and can copy recovery points across accounts and Regions. The other services handle web filtering, DNS, and identity.

🔁 ONE-LINE RECAP<br />AWS Backup centralizes backup plans, vaults, retention, restore points, and supported cross-account or cross-Region copies.

---

### 79. CloudFormation and immutable infrastructure: AMIs and blue/green deployments (Domain 2.2)

🧒 LIKE I'M 5<br />Instead of changing a house brick by brick while people live inside, build a fresh house from the same plan and move everyone when it is ready. Immutable infrastructure follows this idea.

📖 EXPLAINED SIMPLY

- <b>AWS CloudFormation:</b> An infrastructure-as-code service. You describe AWS resources in a template, and CloudFormation creates or updates them as a stack.
- A <b>template</b> is a blueprint containing resources, parameters, conditions, outputs, and other configuration.
- A <b>stack</b> is the set of resources created from a template.
- Use parameters to reuse templates for different environments. Use outputs to share values such as load balancer DNS names.
- <b>Change sets</b> preview proposed stack updates before applying them.
- <b>Drift detection</b> checks whether actual resources differ from the configuration CloudFormation expects.
- <b>StackSets</b> deploy stacks across multiple accounts and Regions.
- CloudFormation can roll back failed stack operations when rollback is enabled and supported.
- <b>Immutable infrastructure:</b> Replace an existing server or environment with a new one rather than patching it in place.
- An <b>Amazon Machine Image (AMI)</b> is a template used to launch EC2 instances with an operating system and preinstalled software.
- Build a tested golden AMI. Launch new instances from it. Replace old instances through an Auto Scaling instance refresh or deployment process.
- <b>Blue/green deployment:</b> Maintain two environments. Blue runs the current version. Green runs the new version.
- Test green, then shift traffic using a load balancer, DNS, or deployment service. Keep blue available for rollback until safe.
- Immutable deployments reduce configuration drift and make rollback easier. They may temporarily require extra capacity.
- Use CloudFormation for repeatable infrastructure and AMIs for consistent EC2 builds. Use blue/green for controlled cutovers.
- Do not confuse infrastructure templates with application deployment tools. CloudFormation creates infrastructure; deployment strategies move application traffic.

📚 JARGON BOX

- Infrastructure as Code (IaC) → Define infrastructure using files instead of manual clicks.
- Template → Blueprint describing resources.
- Stack → Resources managed together by CloudFormation.
- Change set → Preview of proposed stack changes.
- Drift → Difference between declared and actual resource settings.
- AMI → Amazon Machine Image used to launch EC2.
- Golden AMI → Approved reusable server image.
- Immutable infrastructure → Replace servers instead of modifying them in place.
- Blue/green → Two environments with controlled traffic switch.
- Rollback → Return to a previous working version.

⚖️ COMPARE WITH LOOKALIKES

| Method | How it works | Main benefit |
| --- | --- | --- |
| Manual changes | Edit resources directly | Quick one-off change |
| CloudFormation | Declare resources in templates | Repeatability and review |
| Immutable infrastructure | Replace with a new known image | Less drift |
| Blue/green | Keep old and new environments | Controlled cutover and rollback |
| Rolling deployment | Replace instances gradually | Lower temporary capacity need |

🎯 EXAM LENS

- "Repeatable infrastructure across accounts" → CloudFormation and StackSets.
- "Preview before applying resource changes" → Change sets.
- "Detect manual changes" → Drift detection.
- "Create identical EC2 servers" → Golden AMI.
- "Switch traffic to a fully tested new environment" → Blue/green deployment.
- "Rollback quickly" → Keep old environment until new one is validated.

🪤 TRAPS

- CloudFormation does not automatically prevent every manual change.
- Drift detection reports differences; it does not always repair them.
- Blue/green requires capacity for both environments during transition.
- An AMI is an image, not a running EC2 instance.
- Immutable infrastructure is a deployment approach, not a single AWS service.

📝 PRACTICE QUESTION<br />A company wants to deploy a new application version while keeping the current version available for immediate rollback. Which strategy best fits?<br />A. Blue/green deployment<br />B. Modify every production server manually<br />C. Delete the old environment before testing<br />D. Disable health checks

<b>Answer: A.</b> Blue/green keeps the existing environment while the new one is tested. Traffic can move back if needed. The other options increase risk.

🔁 ONE-LINE RECAP<br />CloudFormation makes infrastructure repeatable; AMIs and blue/green deployments replace environments safely and support rollback.

---

### 80. Amazon CloudWatch: metrics, logs, alarms, dashboards (Domain 2.2)

🧒 LIKE I'M 5<br />A cricket scoreboard shows runs, balls, and wickets. CloudWatch shows system measurements, logs, and alerts so operators know what is happening.

📖 EXPLAINED SIMPLY

- <b>Amazon CloudWatch:</b> Monitoring and observability service for AWS resources and applications.
- <b>Metrics:</b> Numerical measurements collected over time, such as CPU utilization, request count, latency, and queue depth.
- A metric belongs to a namespace and can have dimensions such as instance ID or load balancer.
- AWS services publish many standard metrics automatically. To collect operating-system memory, disk, or custom application metrics from EC2, install and configure the CloudWatch Agent or publish custom metrics.
- Basic EC2 monitoring commonly provides five-minute metrics. Detailed monitoring provides one-minute metrics and can add cost.
- <b>CloudWatch Logs:</b> Stores log events in log groups and log streams.
- Set log retention to control how long log data is kept. Logs can be queried using CloudWatch Logs Insights.
- <b>CloudWatch Alarms:</b> Watch metrics and change state when thresholds or anomaly conditions are met.
- Alarms can trigger actions such as SNS notifications, EC2 Auto Scaling actions, or supported Systems Manager actions.
- <b>Composite alarms:</b> Combine alarm states to reduce noise and express more complex conditions.
- <b>Dashboards:</b> Display metrics and logs from multiple resources in one view. They help operators see application health.
- CloudWatch can collect application logs, service metrics, and custom metrics. It can create alarms for errors, high latency, or queue backlogs.
- <b>CloudWatch Agent:</b> Installed on servers to collect logs and operating-system metrics not automatically supplied by the service.
- Use CloudWatch to monitor resource health and alert operators. Use CloudTrail to audit API actions. Use Config to track resource configuration.
- CloudWatch does not automatically fix every alarm. Configure an action or response workflow.

📚 JARGON BOX

- Metric → Numerical measurement over time.
- Namespace → Group of related metrics.
- Dimension → Label identifying a metric source or resource.
- Log group → Container for related log streams.
- Log stream → Sequence of log events from one source.
- Alarm → Rule that watches a metric and changes state.
- Composite alarm → Alarm based on other alarm states.
- Dashboard → Visual view of metrics and logs.
- CloudWatch Agent → Software collecting OS metrics and log files.
- Logs Insights → Query tool for CloudWatch Logs.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main question |
| --- | --- |
| CloudWatch | How healthy is the system right now? |
| CloudTrail | Who performed this AWS API action? |
| AWS Config | What configuration changed and is it compliant? |
| X-Ray | Where is request latency inside a distributed app? |

🎯 EXAM LENS

- "CPU exceeds threshold; notify team" → CloudWatch alarm and SNS.
- "Centralize application logs" → CloudWatch Logs.
- "Query logs for errors" → Logs Insights.
- "Memory metrics from EC2 operating system" → CloudWatch Agent.
- "One screen for service health" → CloudWatch dashboard.
- "Who changed a resource?" → CloudTrail, not CloudWatch.

🪤 TRAPS

- EC2 CPU metrics do not automatically include all OS memory metrics.
- CloudWatch measures and alerts; CloudTrail audits API activity.
- An alarm needs an action to notify or respond.
- A dashboard displays data; it does not itself collect it.
- Logs and metrics are different data types.

📝 PRACTICE QUESTION<br />An operations team wants an alert when an application's error rate stays above a threshold and wants the alert sent to its on-call team. What should it configure?<br />A. CloudWatch metric alarm with an SNS action<br />B. CloudTrail Event history only<br />C. S3 Versioning<br />D. IAM permission boundary

<b>Answer: A.</b> A CloudWatch alarm watches the metric and SNS delivers the notification. CloudTrail records API events. Versioning protects objects. A permission boundary limits IAM permissions.

🔁 ONE-LINE RECAP<br />CloudWatch collects metrics and logs, evaluates alarms, and displays system health through dashboards.

---

## ✅ Batch 4 done: topics 61–80

### Batch 4 Cheat Sheet

- Simple low-cost HTTP API → API Gateway HTTP API.
- Advanced API Gateway features and caching → REST API.
- Persistent two-way client connection → WebSocket API.
- Protect API backends from request spikes → API Gateway throttling.
- Reduce Lambda cold starts → Provisioned concurrency.
- Limit one function's maximum concurrent runs → Reserved concurrency.
- Lambda execution time limit → 15 minutes.
- Containers without managing EC2 hosts → Fargate.
- AWS-native container orchestration → ECS.
- Standard Kubernetes APIs on AWS → EKS.
- Store container images → ECR.
- Existing standard Java or Node web app deployment → Elastic Beanstalk.
- One service publishes a business event → Event-driven architecture.
- Secure partner SFTP file exchange → Transfer Family.
- Move SaaS records to S3 on a schedule → AppFlow.
- Survive one AZ failure → Multi-AZ architecture.
- Domain apex to ALB or CloudFront → Route 53 alias record.
- Send 10% DNS traffic to new version → Weighted routing.
- Lowest-latency Region → Latency-based routing.
- Traditional RDS standby must not serve reads → Multi-AZ DB instance.
- Add database read throughput → Read replica.
- Aurora cross-Region recovery and reads → Aurora Global Database.
- Multi-Region DynamoDB active-active → Global Tables.
- Restore DynamoDB to a chosen recent second → PITR.
- Too many Lambda-to-RDS connections → RDS Proxy.
- Maximum acceptable data loss → RPO.
- Maximum acceptable downtime → RTO.
- Copy S3 data to another Region → CRR.
- Central backup schedules and vaults → AWS Backup.
- Repeatable infrastructure templates → CloudFormation.
- New tested environment with quick rollback → Blue/green deployment.
- Metrics, logs, alarms, dashboards → CloudWatch.

### 5 Extra Mixed Scenario Questions

<b>1.</b> A company needs a simple API with low cost and JWT authorization. It does not need caching or usage plans. Which API Gateway type should it choose?

A. HTTP API<br />B. REST API<br />C. WebSocket API<br />D. Network Load Balancer

<b>Answer: A.</b> HTTP APIs suit simple, low-cost HTTP workloads and support JWT authorizers. REST APIs offer more features. WebSocket is two-way. NLB works at Layer 4.

<b>2.</b> A serverless app opens thousands of database connections during traffic spikes. The database is otherwise sized correctly. What should the architect add?

A. RDS Proxy<br />B. Read replica only<br />C. Route 53 weighted routing<br />D. S3 Object Lock

<b>Answer: A.</b> RDS Proxy pools and reuses database connections. Read replicas scale reads, not connection management for the primary. The other options solve unrelated issues.

<b>3.</b> A website needs automatic DNS failover from a primary Region to a secondary Region when the primary endpoint becomes unhealthy. Which Route 53 feature fits?

A. Failover routing with health checks<br />B. Weighted routing without health checks<br />C. Geolocation routing<br />D. CNAME at the domain apex

<b>Answer: A.</b> Failover routing selects the secondary based on health. Weighted routing splits responses. Geolocation uses user location. CNAME cannot be at the apex.

<b>4.</b> A company wants database high availability and extra read throughput. Which design is most suitable?

A. Multi-AZ deployment plus read replicas<br />B. One DB instance only<br />C. Multi-AZ standby used for reads<br />D. S3 replication only

<b>Answer: A.</b> Multi-AZ provides availability. Read replicas provide additional read capacity. A traditional Multi-AZ standby does not serve normal reads.

<b>5.</b> A company needs to recover an application after a Region outage. It wants a smaller working environment already running elsewhere, ready to scale up. Which DR strategy is this?

A. Warm standby<br />B. Backup and restore only<br />C. Single AZ<br />D. No replication

<b>Answer: A.</b> Warm standby keeps a smaller live copy of the environment. Backup and restore rebuilds after failure and is generally slower.

### 81. Service quotas and standby-region capacity (Domain 2.2)

🧒 LIKE I'M 5<br />A cricket stadium may have a limit on seats and entry gates. AWS services also have limits. A backup stadium needs enough seats before the match begins.

📖 EXPLAINED SIMPLY

- A <b>service quota</b> is a limit on how much of an AWS service an account or Region can use.
- Examples include EC2 instance counts, VPCs, Elastic IP addresses, API requests, and concurrent Lambda executions.
- Some quotas are adjustable. Others are fixed or depend on the service.
- <b>AWS Service Quotas</b> shows supported quotas and current usage. You can request increases for adjustable quotas.
- Do not wait until a disaster to request an increase. Approval may take time, and not every request is approved.
- A standby Region needs capacity too. Check its quotas, instance availability, IP capacity, load balancer limits, and database limits.
- Quotas are often Regional. A high quota in the primary Region does not automatically mean the same quota exists elsewhere.
- Use CloudWatch usage metrics and Service Quotas to monitor approaching limits.
- Request increases before launches and disaster-recovery tests. Keep a margin for traffic spikes.
- Quotas differ from throttling. A quota limits available capacity. Throttling limits request rates.
- Design graceful behavior for quota errors. Queue work, retry with backoff, or shed nonessential load when appropriate.

📚 JARGON BOX

- Service quota → Maximum allowed service usage.
- Adjustable quota → Limit that may be increased after a request.
- Regional quota → Limit applied separately in an AWS Region.
- Throttling → Slowing or rejecting requests that exceed a rate.
- Headroom → Spare capacity above normal demand.

⚖️ COMPARE WITH LOOKALIKES

| Control | What it limits | Example |
| --- | --- | --- |
| Service quota | Resource or service capacity | Number of VPCs |
| API throttling | Request rate | Requests per second |
| Auto Scaling max | Maximum group size | Maximum EC2 instances |
| Concurrency limit | Simultaneous function runs | Lambda concurrency |

🎯 EXAM LENS

- "Standby Region cannot scale during failover" → Check Regional service quotas.
- "Request more allowed resources" → Service Quotas.
- "Too many API requests per second" → Throttling.
- "Disaster recovery must be tested" → Test quota and capacity readiness in the recovery Region.

🪤 TRAPS

- Quotas are not always global.
- A DR design is incomplete if standby quotas are too low.
- Increasing a quota does not create capacity in an AZ.
- Throttling and service quotas solve different problems.

📝 PRACTICE QUESTION<br />A company has a warm standby Region. During a failover test, it cannot launch enough EC2 instances because the account limit is too low. What should it do before the next test?<br />A. Request a Regional quota increase through Service Quotas<br />B. Add an S3 lifecycle rule<br />C. Increase the primary Region's quota only<br />D. Disable health checks

<b>Answer: A.</b> The standby Region needs its own sufficient quota. B and D do not create EC2 capacity. C changes the wrong Region.

🔁 ONE-LINE RECAP<br />Check and raise service quotas in every recovery Region before an outage exposes the limit.

---

### 82. AWS X-Ray and distributed tracing (Domain 2.2)

🧒 LIKE I'M 5<br />A parcel passes through many counters. A tracking number shows where it travelled and where it got delayed. X-Ray traces a request through distributed services.

📖 EXPLAINED SIMPLY

- <b>AWS X-Ray</b> helps developers understand how requests move through an application.
- It is useful when one user request touches API Gateway, Lambda, containers, databases, and other services.
- A <b>trace</b> represents one end-to-end request. A trace ID connects the parts of that request.
- A <b>segment</b> records work done by a service or component. A <b>subsegment</b> records a smaller operation, such as a database call.
- X-Ray creates a service map. It shows components, dependencies, errors, and latency.
- Use traces to find slow services, failed calls, bottlenecks, and unusual request paths.
- Applications or supported AWS integrations must send trace data. Use the X-Ray SDK or supported OpenTelemetry instrumentation.
- Sampling controls which requests are traced. Sampling reduces overhead and trace volume.
- X-Ray does not replace CloudWatch metrics or logs. Use them together.
- CloudWatch shows trends and alarms. Logs show detailed events. X-Ray shows how one request travelled.
- Use X-Ray for distributed request diagnosis. Use CloudTrail to audit AWS API actions.

📚 JARGON BOX

- Distributed tracing → Following one request across multiple services.
- Trace → End-to-end record of a request.
- Trace ID → Identifier connecting trace segments.
- Segment → Work recorded by one service.
- Subsegment → Smaller operation inside a segment.
- Service map → Diagram of service dependencies and request health.
- Sampling → Selecting which requests to trace.
- Latency → Time taken to complete an operation.

⚖️ COMPARE WITH LOOKALIKES

| Tool | Best question it answers |
| --- | --- |
| CloudWatch metrics | Is latency or error rate rising? |
| CloudWatch Logs | What happened in this component? |
| X-Ray | Which service made this request slow? |
| CloudTrail | Who called an AWS API and when? |

🎯 EXAM LENS

- "Trace a slow request across microservices" → X-Ray.
- "Find which downstream service adds latency" → Service map and trace details.
- "Alarm when error rate rises" → CloudWatch alarm.
- "Audit who changed a resource" → CloudTrail.

🪤 TRAPS

- X-Ray is not a general log store.
- Tracing requires instrumentation or supported integrations.
- Sampling means not every request is necessarily traced.
- CloudTrail and X-Ray answer different questions.

📝 PRACTICE QUESTION<br />A checkout request passes through API Gateway, Lambda, and a database. Users report delays, but each service's CPU looks normal. Which tool best identifies the slow downstream call?<br />A. AWS X-Ray<br />B. AWS Artifact<br />C. S3 Inventory<br />D. IAM Access Analyzer

<b>Answer: A.</b> X-Ray follows a request across components and shows where latency occurs. The other services handle compliance, inventory, or access analysis.

🔁 ONE-LINE RECAP<br />Use X-Ray to follow one request across services and locate the slow or failing dependency.

---

### 83. Designing health metrics, alarms, and automated recovery (Domain 2.2)

🧒 LIKE I'M 5<br />A hospital checks temperature, pulse, and oxygen rather than asking only whether a patient is awake. Reliable systems also need the right health measurements.

📖 EXPLAINED SIMPLY

- A health design starts with the business outcome. Decide what "healthy" means for users.
- <b>Availability metrics</b> show whether users can reach the service. Examples include successful request percentage and endpoint health.
- <b>Latency metrics</b> measure how long requests take. Track averages and percentiles such as p95 or p99.
- <b>Error metrics</b> track failed requests, timeouts, and application exceptions.
- <b>Saturation metrics</b> show whether resources are running out. Examples include CPU, memory, queue depth, and database connections.
- Use CloudWatch metrics and alarms to detect abnormal behavior.
- Use Route 53 health checks or load balancer health checks when endpoint health must affect routing.
- Use Auto Scaling to replace unhealthy EC2 instances or adjust capacity.
- Use EventBridge and Systems Manager Automation for controlled recovery actions where suitable.
- A CPU alarm alone does not prove the application is healthy. A server can have low CPU and still return errors.
- Prefer end-to-end synthetic checks for critical user journeys. Test login, checkout, or another key function.
- Choose alarm thresholds based on normal workload behavior. Avoid noisy alarms that trigger on harmless spikes.
- Test recovery actions. A bad automatic action can increase an outage.

📚 JARGON BOX

- Availability → Whether a service is usable.
- Latency → Time needed to respond.
- Percentile → Value below which a percentage of observations fall.
- Saturation → How close a resource is to its capacity.
- Synthetic check → Automated test that imitates a user action.
- Recovery action → Automated step that restores service.

⚖️ COMPARE WITH LOOKALIKES

| Signal | What it reveals | Example |
| --- | --- | --- |
| Availability | Can users complete requests? | Success rate |
| Latency | How slow is it? | p95 response time |
| Errors | How often does it fail? | HTTP 5xx rate |
| Saturation | Is capacity exhausted? | Queue depth or DB connections |

🎯 EXAM LENS

- "Users see slow responses despite normal CPU" → Track latency and downstream dependencies.
- "Detect failed user journeys" → Synthetic monitoring.
- "Replace unhealthy EC2 instances" → ASG health checks.
- "Send an alert when service health degrades" → CloudWatch alarm.

🪤 TRAPS

- CPU alone is not an application health measure.
- A health check must test the right endpoint and behavior.
- An alarm does not fix the issue unless an action is configured.
- Aggressive thresholds can create alarm storms.

📝 PRACTICE QUESTION<br />An online store's CPU remains low, but customers cannot complete checkout. Which metric is most useful as a primary user-health signal?<br />A. Successful checkout rate<br />B. EC2 CPU utilization only<br />C. Number of AMIs<br />D. S3 bucket count

<b>Answer: A.</b> The successful checkout rate measures the business journey. CPU and resource counts cannot prove that checkout works.

🔁 ONE-LINE RECAP<br />Measure availability, latency, errors, and saturation together; use health checks and tested alarms to recover safely.

---

### 84. Amazon Comprehend and Amazon Polly as purpose-built managed services (Domain 2.2)

🧒 LIKE I'M 5<br />A shop can hire a specialist to read customer letters or speak a message aloud. AWS provides managed AI services for these jobs instead of building the technology yourself.

📖 EXPLAINED SIMPLY

- <b>Amazon Comprehend</b> uses natural language processing to understand text.
- It can identify language, extract key phrases, detect sentiment, find entities, and classify text.
- Use Comprehend for feedback analysis, document categorization, and extracting information from text.
- <b>Amazon Polly</b> converts text into spoken audio.
- It supports voices and languages for text-to-speech applications. Speech marks can provide timing information for synchronized text and audio.
- Use Polly for voice prompts, accessibility, narration, and spoken notifications.
- These are managed AI services. You call APIs instead of training and operating speech or language models yourself.
- They are purpose-built services, not general-purpose compute or storage services.
- Consider data privacy, supported languages, latency, accuracy, and cost before sending text.
- Use Comprehend when the task is to understand written language. Use Polly when the task is to generate speech.
- For generative AI tasks outside these specific capabilities, evaluate current AWS AI services rather than forcing these tools to fit.

📚 JARGON BOX

- NLP → Natural Language Processing; software methods for working with human language.
- Sentiment → Positive, negative, or neutral feeling in text.
- Entity → Named item such as a person, place, or company.
- Text-to-speech → Converting written text into spoken audio.
- Speech mark → Timing and structure information for generated speech.
- Managed AI service → AWS operates the underlying model infrastructure.

⚖️ COMPARE WITH LOOKALIKES

| Service | Input | Output / task |
| --- | --- | --- |
| Comprehend | Text | Language analysis and extraction |
| Polly | Text | Speech audio |
| Transcribe | Audio | Text transcript |
| Translate | Text | Translated text |

🎯 EXAM LENS

- "Detect sentiment in customer reviews" → Comprehend.
- "Extract entities from documents" → Comprehend.
- "Turn text into natural speech" → Polly.
- "Convert recorded audio to text" → Transcribe, not Polly.

🪤 TRAPS

- Comprehend analyzes text; it does not create spoken audio.
- Polly speaks text; it does not transcribe recordings.
- Managed services reduce operations but still require correct data handling and permissions.
- Do not build custom ML infrastructure when a purpose-built service meets the requirement.

📝 PRACTICE QUESTION<br />A support team wants to detect positive and negative sentiment in thousands of customer messages. Which service should it use?<br />A. Amazon Comprehend<br />B. Amazon Polly<br />C. AWS DataSync<br />D. Amazon Route 53

<b>Answer: A.</b> Comprehend analyzes text sentiment. Polly produces speech. DataSync moves data. Route 53 manages DNS.

🔁 ONE-LINE RECAP<br />Comprehend understands text; Polly converts text into speech.

---

### 85. Improving legacy application reliability without major code changes (Domain 2.2)

🧒 LIKE I'M 5<br />An old delivery shop cannot rebuild its whole system. It can still add a better counter, queue, backup power, and spare workers around it.

📖 EXPLAINED SIMPLY

- A <b>legacy application</b> may use old protocols, local sessions, fixed server names, or a database that cannot be changed quickly.
- Start by protecting the application externally. Place an Elastic Load Balancer in front of supported servers.
- Use multiple instances across AZs when the application can run safely on more than one server.
- If the app cannot be distributed, use a managed failover or recovery design that fits its limits.
- Put SQS between components when they can communicate asynchronously. The queue absorbs traffic spikes and retries temporary failures.
- Use Amazon MQ when the application requires supported ActiveMQ or RabbitMQ protocols and changing its messaging client is difficult.
- Use RDS Proxy when database connection storms are the problem.
- Use Storage Gateway when on-premises applications need cloud-backed storage through familiar interfaces.
- Use AWS DMS to replicate or migrate database data with limited application interruption.
- Keep backups and test restores. Replication alone does not protect against every logical deletion or bad write.
- Use CloudWatch, CloudTrail, and X-Ray according to the problem: system health, API activity, or request tracing.
- Do not force a full microservices rewrite when the requirement says application changes are not possible.
- Select the smallest protective layer that solves the business problem. Avoid creating a more complex failure path.

📚 JARGON BOX

- Legacy application → Older software that is difficult to modify.
- External protection → Reliability features placed around an application.
- Queue buffering → Holding requests until a consumer can process them.
- Database connection storm → Sudden surge in database connections.
- Replication → Copying changes to another data store.
- Migration → Moving workloads or data to a new platform.

⚖️ COMPARE WITH LOOKALIKES

| Problem | Low-change reliability option |
| --- | --- |
| Traffic burst between components | SQS buffer |
| Existing AMQP/JMS broker dependency | Amazon MQ |
| Too many DB connections | RDS Proxy |
| On-premises file access to cloud storage | Storage Gateway |
| Database migration or replication | AWS DMS |
| Need front-end health routing | Elastic Load Balancing |

🎯 EXAM LENS

- "Cannot rewrite the legacy messaging client" → Amazon MQ.
- "Absorb sudden request bursts" → SQS.
- "Database connection storm" → RDS Proxy.
- "Keep on-premises file workflows" → Storage Gateway.
- "Move database with minimal downtime" → AWS DMS.

🪤 TRAPS

- Do not choose a full rewrite when the question prohibits application changes.
- A load balancer cannot make a single-instance legacy app horizontally scalable by itself.
- Replication is not a substitute for backups.
- Choose the service that matches the exact bottleneck.

📝 PRACTICE QUESTION<br />A legacy Java system uses JMS and cannot be rewritten this year. The company wants to move its message broker to AWS with minimal code changes. What is the best option?<br />A. Amazon MQ for ActiveMQ<br />B. Rewrite all services into Lambda<br />C. Replace every message with an S3 object<br />D. Use CloudFront

<b>Answer: A.</b> Amazon MQ supports ActiveMQ and JMS-oriented migration. B violates the no-rewrite requirement. C is not a broker replacement. D delivers content.

🔁 ONE-LINE RECAP<br />Make legacy systems more reliable with compatible managed services around them before attempting a risky rewrite.

## ✅ Domain 2 complete: topics 1–85

### Domain 2 cheat sheet

- Request more EC2/VPC/Lambda capacity → Service Quotas.
- Verify DR capacity before an outage → Check quotas in the standby Region.
- Trace one request across microservices → AWS X-Ray.
- Identify the slow downstream call → X-Ray trace and service map.
- Measure user-facing health → Availability, latency, errors, and saturation.
- Analyze customer text sentiment → Amazon Comprehend.
- Convert written text into audio → Amazon Polly.
- Legacy JMS/ActiveMQ without code changes → Amazon MQ.
- Traffic bursts between components → SQS buffering.
- Too many Lambda-to-RDS connections → RDS Proxy.
- On-premises file workflows with cloud storage → Storage Gateway.
- Database migration with low downtime → AWS DMS.
- High availability across AZs → Multi-AZ and remove single points of failure.
- Cross-Region recovery → DR strategy based on RPO and RTO.
- Keep a smaller live recovery environment → Warm standby.

### 5 Extra Mixed Scenario Questions

<b>1.</b> A standby Region cannot launch enough instances during a disaster-recovery test. What should be prepared?<br />A. Regional Service Quotas increase<br />B. More S3 object versions<br />C. A new Route 53 CNAME at the apex<br />D. A CloudFront invalidation

<b>Answer: A.</b> The standby Region needs adequate service quotas. The other options do not provide EC2 launch capacity.

<b>2.</b> A distributed API has normal CPU but high end-to-end latency. Which tool follows one request across services?<br />A. X-Ray<br />B. Artifact<br />C. Budgets<br />D. S3 Lifecycle

<b>Answer: A.</b> X-Ray traces requests across dependencies. The other services handle compliance, cost alerts, and storage lifecycle.

<b>3.</b> A company wants to detect sentiment in customer feedback. Which service should it use?<br />A. Comprehend<br />B. Polly<br />C. Transcribe<br />D. DataSync

<b>Answer: A.</b> Comprehend analyzes text. Polly generates speech. Transcribe converts audio to text. DataSync moves data.

<b>4.</b> A legacy JMS application must migrate without changing its messaging protocol. Which service fits?<br />A. Amazon MQ<br />B. SQS only<br />C. EventBridge Scheduler<br />D. CloudFront

<b>Answer: A.</b> Amazon MQ supports compatible broker engines and protocols. The others are not drop-in JMS brokers.

<b>5.</b> A standby database is ready, but the recovery application cannot connect because the app creates too many database sessions at once. What can help?<br />A. RDS Proxy<br />B. Route 53 geolocation routing<br />C. S3 Transfer Acceleration<br />D. AWS Artifact

<b>Answer: A.</b> RDS Proxy pools and manages connections. The other services do not manage database sessions.
