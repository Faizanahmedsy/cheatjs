import { service } from "./helpers";

export const apigw = service({
  id: "api-gateway", num: 32, title: "API Gateway", short: "API Gateway", category: "Integration",
  tagline: "The front door for your APIs.",
  imagine: "Imagine a reception desk at a building. Visitors check in, show their ID and are sent to the right office. API Gateway is that desk for apps calling your backend.",
  what: ["API Gateway is the front door that apps use to call your backend.", "It receives web requests, checks who is calling, limits how often they can call, and hands the request to Lambda, a server or another AWS service.", "Managed service for **REST**, **HTTP** and **WebSocket** APIs. Auth: IAM, Cognito, Lambda authorizers, API keys + usage plans. Throttling, caching, stages, request validation."],
  nodes: "a:user:Mobile app@0,1 | g:gateway:API Gateway:front door@2,1* | l:lambda:Lambda@4,0 | d:server:Your server@4,2 | t:table:DynamoDB@6,0",
  links: "a>g:HTTPS, g>l, g>d, l>t",
  how: ["It checks the caller, applies limits and forwards to the right backend.", "Each URL path and method (GET /users) can go to a different backend. Responses can be cached to save work.", "Stages (dev / prod), canary deployments, custom domains with ACM, usage plans, mapping templates, WAF integration. HTTP API is cheaper and faster than REST API."],
  use: ["Use it to expose Lambda functions or any backend as a secure API.", "Simple load balancing of servers? An ALB is enough.", "'Serverless API', 'throttle and authenticate API calls' → API Gateway."],
  chaos: ["Lambda stops working", "l", "The Lambda backend failed, but API Gateway still serves other routes (**your server path**) and can return a clean error."],
  quiz: [["Build a serverless REST API?", ["API Gateway + Lambda", "ALB + RDS", "Route 53 only", "EBS"], 0, "**API Gateway** with **Lambda**."], ["Throttle abusive clients?", ["Usage plans and throttling", "Security group", "NACL", "SNS"], 0, "API Gateway **throttling**."], ["Real-time two-way chat?", ["WebSocket API", "REST API", "S3", "Glue"], 0, "**WebSocket APIs**."]],
});

export const eventbridge = service({
  id: "eventbridge", num: 33, title: "EventBridge", short: "EventBridge", category: "Integration",
  tagline: "When something happens, run something else.",
  imagine: "Imagine a doorbell system with rules: 'if the front door rings, tell the kitchen; if the back door rings, tell the guard'. EventBridge routes events to the right place.",
  what: ["EventBridge reacts to events and sends them where they should go.", "Things happen in AWS and in your apps (a file uploaded, a server stopped). You write a **rule**: when this kind of event appears, run that target.", "Serverless event bus. Sources: AWS services, custom apps, SaaS partners. **Rules** match patterns and route to targets (Lambda, SQS, SNS, Step Functions, API destinations). **Scheduler** for cron."],
  nodes: "s:server:EC2 stopped@0,0 | c:bucket:File uploaded@0,2 | e:topic:Event bus:rules@3,1* | l:lambda:Lambda@6,0 | q:queue:SQS@6,2",
  links: "s>e, c>e, e>l:rule 1, e>q:rule 2",
  how: ["Events arrive on a bus; rules match them and trigger targets.", "You can also schedule things (like 'every night at 2am'). It replaced the older CloudWatch Events.", "Event patterns in JSON, input transformation, archive and replay, schema registry, cross-account buses, dead-letter queues."],
  use: ["Use it to connect services without code between them.", "For a simple queue between two parts, SQS is enough.", "'React to AWS events', 'schedule', 'SaaS integration' → EventBridge."],
  quiz: [["Run a Lambda every night at 2am?", ["EventBridge Scheduler", "SQS", "SES", "Direct Connect"], 0, "**EventBridge** schedules."], ["Trigger a workflow when an EC2 instance stops?", ["EventBridge rule", "NACL", "KMS", "Glue"], 0, "**Rule** matches the state-change event."], ["EventBridge replaced…", ["CloudWatch Events", "CloudTrail", "Config", "IAM"], 0, "Formerly **CloudWatch Events**."]],
});

export const stepfn = service({
  id: "step-functions", num: 34, title: "Step Functions", short: "Step Functions", category: "Integration",
  tagline: "A flowchart that runs your steps in order, with retries.",
  imagine: "Imagine a checklist where each tick triggers the next job, and if a job fails, someone tries again or takes another path. Step Functions is that checklist for code.",
  what: ["Step Functions runs a multi-step job as a flowchart.", "Real tasks have many steps: check payment, reserve stock, send email. **Step Functions** runs each one in order, retries failures and shows you exactly where it is.", "Serverless workflow orchestration using **Amazon States Language**. States: Task, Choice, Parallel, Map, Wait, Pass. **Standard** (up to 1 year, exactly-once) vs **Express** (high volume, 5 min)."],
  nodes: "u:user:Order@0,1 | a:lambda:Check payment@2,1 | b:lambda:Reserve stock@4,1 | c:lambda:Send email@6,1 | s:box:Step Functions:the flowchart@3,2*",
  links: "u>a, a>b, b>c, ~s>a, ~s>b, ~s>c",
  how: ["Each box runs, then the flowchart decides what to do next.", "If a step fails, Step Functions can retry it or follow a fallback path. You can watch every run visually.", "Direct SDK integrations with 200+ services, human approval via callbacks, Map for parallel work, error handling with Retry / Catch."],
  use: ["Use it for workflows with several steps, approvals or long waits.", "Just two services connected? EventBridge or SQS may be simpler.", "'Orchestrate', 'workflow', 'retry and branching logic' → Step Functions."],
  quiz: [["Coordinate multiple Lambdas with retries and branching?", ["Step Functions", "SNS", "SQS only", "Route 53"], 0, "**Step Functions**."], ["Run for up to a year?", ["Standard workflow", "Express workflow", "Lambda", "API Gateway"], 0, "**Standard** supports long runs."], ["High-volume short event processing?", ["Express workflow", "Standard", "Glacier", "Snowball"], 0, "**Express**."]],
});

export const cloudformation = service({
  id: "cloudformation", num: 35, title: "CloudFormation", short: "CloudFormation", category: "Management",
  tagline: "Describe your AWS setup in a file and build it with one click.",
  imagine: "Imagine a building plan: hand it to a builder and the same house appears every time. CloudFormation is the plan, AWS is the builder.",
  what: ["CloudFormation builds AWS resources from a written plan.", "Instead of clicking in the console, you write a **template** (YAML / JSON) listing servers, databases and networks. CloudFormation creates them all in the right order, and can delete them together.", "Infrastructure as Code. **Stacks**, change sets, drift detection, rollback on failure, parameters, outputs, **StackSets** for multi-account / Region. CDK compiles code into templates."],
  nodes: "t:file:Template:YAML plan@0,1 | c:box:CloudFormation:the builder@3,1* | v:box:VPC@6,0 | e:server:EC2@6,1 | r:db:RDS@6,2",
  links: "t>c:deploy, c>v, c>e, c>r",
  how: ["A template becomes a stack of real resources.", "Change the template and CloudFormation shows what will change, then updates only that. If something fails it rolls back.", "Intrinsic functions (!Ref, !GetAtt), DependsOn, DeletionPolicy, nested stacks, custom resources, drift detection."],
  use: ["Use it for repeatable, reviewable infrastructure.", "Same template can build dev, test and prod. Good for disaster recovery rebuilds.", "'Infrastructure as code', 'repeatable deployments' → CloudFormation (or CDK)."],
  quiz: [["Deploy identical environments repeatedly?", ["CloudFormation", "CloudTrail", "Inspector", "Shield"], 0, "**CloudFormation** templates."], ["Detect manual changes outside the template?", ["Drift detection", "Rollback", "Outputs", "Parameters"], 0, "**Drift detection**."], ["Deploy across many accounts and Regions?", ["StackSets", "Change sets", "Nested stacks", "Macros"], 0, "**StackSets**."]],
});

export const cloudwatch = service({
  id: "cloudwatch", num: 36, title: "CloudWatch", short: "CloudWatch", category: "Management",
  tagline: "Eyes and alarms for your whole AWS setup.",
  imagine: "Imagine a security room full of screens showing every machine, with an alarm that rings when something looks wrong. CloudWatch is that room.",
  what: ["CloudWatch watches your servers and apps and warns you when something is wrong.", "It collects numbers (**metrics**) like CPU and **logs** from your services, draws graphs, and fires **alarms** that can notify you or act automatically.", "Metrics (standard 5 min, detailed 1 min), custom metrics, **Logs** with Insights queries, **Alarms**, Dashboards, Events / EventBridge, Synthetics canaries, Container Insights. Memory metrics need the CloudWatch agent."],
  nodes: "s:server:EC2@0,0 | d:db:RDS@0,2 | c:monitor:CloudWatch:metrics + logs@3,1* | a:topic:Alarm:CPU over 80%@6,0 | g:autoscale:Auto Scaling@6,2",
  links: "s>c:metrics, d>c:metrics, c>a, c>g:scale out",
  how: ["Services send numbers and logs; alarms act when a number crosses a line.", "An alarm can send you a message (SNS), or tell Auto Scaling to add a server, or reboot a broken instance.", "Alarm states: OK, ALARM, INSUFFICIENT_DATA. Composite alarms, metric math, anomaly detection, log metric filters, subscription filters to Lambda / Kinesis."],
  use: ["Use it to monitor, alert and automatically react.", "To see who made changes use CloudTrail, not CloudWatch.", "'Monitor CPU, alarm, logs' → CloudWatch. 'Who did it' → CloudTrail."],
  quiz: [["Alert when CPU stays above 80%?", ["CloudWatch alarm", "CloudTrail", "Config", "IAM"], 0, "**CloudWatch alarm**."], ["Get memory usage of EC2 in CloudWatch?", ["Install the CloudWatch agent", "Nothing, it is automatic", "Use CloudTrail", "Use Inspector"], 0, "Memory needs the **agent**."], ["Search application logs with queries?", ["Logs Insights", "Athena only", "KMS", "Shield"], 0, "**CloudWatch Logs Insights**."]],
});

export const cloudtrail = service({
  id: "cloudtrail", num: 37, title: "CloudTrail", short: "CloudTrail", category: "Management",
  tagline: "A diary of who did what in your AWS account.",
  imagine: "Imagine a CCTV log that records every person who opened a door, when, and from where. CloudTrail records every action taken in your AWS account.",
  what: ["CloudTrail records every action taken in your AWS account.", "Every click in the console and every API call (someone deleted a bucket, a new user was created) is written down with who, what, when and from where.", "Records **management events** (and optionally data events) for 90 days in Event history; create a **trail** to store logs in S3 forever. CloudTrail Insights spots unusual activity. Log file validation."],
  nodes: "u:user:Admin@0,0 | k:user:Script@0,2 | c:monitor:CloudTrail:the diary@3,1* | s:bucket:S3 logs@6,0 | w:monitor:CloudWatch alarm@6,2",
  links: "u>c:deleted a bucket, k>c:API call, c>s:stores, c>w:alert",
  how: ["Every API call is logged and can be stored in S3 and searched later.", "You can alert on risky actions, like someone turning off logging or changing a firewall rule.", "Trail can be multi-Region and organisation-wide. Integrity validation uses digests. Data events (S3 object level, Lambda invoke) cost extra."],
  use: ["Use it for auditing, security investigations and compliance.", "It tells you who changed something; Config tells you what changed in the configuration.", "'Who deleted…?', 'audit API activity' → CloudTrail."],
  quiz: [["Who deleted the S3 bucket yesterday?", ["CloudTrail", "CloudWatch", "Inspector", "Shield"], 0, "**CloudTrail** logs API calls."], ["Keep logs longer than 90 days?", ["Create a trail to S3", "Do nothing", "Use EBS", "Use Route 53"], 0, "Create a **trail** to S3."], ["Is CloudTrail enabled by default (Event history)?", ["Yes, 90 days", "No", "Only in us-east-1", "Only for admins"], 0, "**90 days** of management events."]],
});

export const config = service({
  id: "config", num: 38, title: "AWS Config", short: "Config", category: "Management",
  tagline: "Checks that your setup follows the rules, and keeps its history.",
  imagine: "Imagine an inspector who photographs your building every day and flags anything that breaks the rules, like a door left unlocked. AWS Config does that for your resources.",
  what: ["Config records how your resources are set up and checks them against rules.", "It keeps a history of every setting change (this security group was opened to the world on Tuesday) and marks anything that breaks a rule as **non-compliant**.", "Resource **configuration history**, **Config rules** (managed or custom Lambda), conformance packs, auto-remediation with Systems Manager Automation, aggregators for multi-account."],
  nodes: "r:server:Your resources@0,1 | c:monitor:AWS Config:records + checks@3,1* | b:policy:Rule:no public S3@3,0 | n:topic:Alert@6,1",
  links: "r>c:every change, ~b>c, c>n:non-compliant",
  how: ["Record changes, test them against rules, alert or auto-fix.", "A rule like 'all disks must be encrypted' is checked continuously. If a disk is not, Config flags it and can run a fix automatically.", "Evaluation on change or periodic. Remediation actions. Does not block actions: it detects. Use SCPs or IAM to prevent."],
  use: ["Use it for compliance and to see what a setting was last week.", "It detects problems; it does not stop them. To stop them use IAM or SCPs.", "'Compliance', 'configuration history', 'is this encrypted?' → Config."],
  quiz: [["Check all EBS volumes are encrypted and report violations?", ["AWS Config rule", "CloudTrail", "Route 53", "SES"], 0, "**Config rules**."], ["See what a security group looked like last month?", ["Config history", "CloudWatch", "Inspector", "GuardDuty"], 0, "**Configuration history**."], ["Does Config prevent non-compliant changes?", ["No, it detects", "Yes always", "Only with WAF", "Only in Organizations"], 0, "It **detects** (and can remediate)."]],
});

export const ssm = service({
  id: "ssm", num: 39, title: "Systems Manager", short: "Systems Manager", category: "Management",
  tagline: "One control panel to manage and fix many servers.",
  imagine: "Imagine a remote control that can update, check and fix a hundred computers at once without visiting any of them. Systems Manager is that remote.",
  what: ["Systems Manager lets you manage many servers from one place.", "Patching, running commands, logging in and storing settings, all without opening ports or using passwords.", "Features: **Session Manager** (shell without SSH / open ports), **Run Command**, **Patch Manager**, **Parameter Store** (config and secrets), **Automation**, Inventory, State Manager. Needs the SSM agent and an instance role."],
  nodes: "a:user:Admin@0,1 | m:box:Systems Manager:control panel@3,1* | s1:server:Server 1@6,0 | s2:server:Server 2@6,1 | s3:server:Server 3@6,2",
  links: "a>m, m>s1, m>s2, m>s3",
  how: ["The SSM agent on each server takes orders from Systems Manager.", "You can patch every server on a schedule, run one command on all of them, or open a secure shell with no SSH key or open port.", "Parameter Store (standard and advanced, SecureString with KMS), Patch baselines and maintenance windows, Automation runbooks, Session logs to S3 / CloudWatch."],
  use: ["Use it for patching, fleet management and secure access without SSH.", "Store app configuration in Parameter Store (cheap); use Secrets Manager when you need automatic rotation.", "'Patch fleets', 'no SSH', 'run commands on many instances' → Systems Manager."],
  quiz: [["Access an EC2 shell without opening port 22?", ["Session Manager", "Bastion only", "Direct Connect", "Route 53"], 0, "**Session Manager**."], ["Patch hundreds of servers on a schedule?", ["Patch Manager", "Shield", "Macie", "Glue"], 0, "**Patch Manager**."], ["Store configuration values centrally?", ["Parameter Store", "Glacier", "EBS", "SES"], 0, "**Parameter Store**."]],
});
