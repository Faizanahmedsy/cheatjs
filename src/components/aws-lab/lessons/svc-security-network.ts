import { service } from "./helpers";

export const kms = service({
  id: "kms", num: 40, title: "KMS: encryption keys", short: "KMS", category: "Security",
  tagline: "Keeps the keys that lock your data.",
  imagine: "Imagine a bank vault that keeps your keys. You never carry the key; you ask the vault to lock or unlock things for you. KMS is that vault for encryption keys.",
  what: ["KMS creates and guards the keys used to encrypt your data.", "Encrypting data scrambles it so only someone with the key can read it. **KMS** stores the keys safely, controls who may use them, and records every use.", "Managed keys in HSMs. **AWS-managed** vs **customer-managed** keys, key policies, grants, automatic rotation, **envelope encryption** (data keys), multi-Region keys. Integrates with S3, EBS, RDS and more. 4 KB direct limit."],
  nodes: "a:server:Your app@0,1 | k:key:KMS key:never leaves KMS@3,1* | s:bucket:Encrypted S3@6,0 | d:disk:Encrypted EBS@6,2",
  links: "a>k:encrypt / decrypt, k>s, k>d",
  how: ["The service asks KMS for a data key; KMS never hands out the master key.", "Big data is locked with a small **data key**, and the data key is locked by your KMS key. This is called envelope encryption.", "Key policies + IAM, CloudTrail logs every Decrypt, key deletion has a 7–30 day waiting period, SSE-KMS for S3, EBS encryption per volume."],
  use: ["Use it whenever you need to encrypt data and control who can read it.", "Automatic yearly rotation is available for customer-managed keys.", "'Encrypt', 'audit key usage', 'control who can decrypt' → KMS."],
  chaos: ["Remove permission to use the key", "k", "Nobody (not even the app) can decrypt the data any more. **Whoever controls the key controls the data.**"],
  quiz: [["Audit who used an encryption key?", ["KMS + CloudTrail", "Config only", "Route 53", "WAF"], 0, "CloudTrail logs **KMS** calls."], ["Large data is encrypted with…", ["Data keys (envelope encryption)", "The master key directly", "A password", "A tag"], 0, "**Envelope encryption**."], ["Rotate customer-managed keys automatically?", ["Enable rotation", "Delete them", "Use a NACL", "Copy them"], 0, "Turn on **automatic rotation**."]],
});

export const secrets = service({
  id: "secrets-manager", num: 41, title: "Secrets Manager", short: "Secrets Manager", category: "Security",
  tagline: "Stores passwords safely and changes them automatically.",
  imagine: "Imagine a locked safe where your app asks for the database password only when needed. And the safe changes the password for you every month. That is Secrets Manager.",
  what: ["Secrets Manager stores passwords and keys and rotates them for you.", "Never put a database password in your code. Your app asks Secrets Manager for it at run time. Secrets Manager can also change the password regularly without downtime.", "Stores secrets encrypted with KMS, IAM-controlled access, **automatic rotation** with Lambda (built-in for RDS), cross-Region replication, versioning. Costs per secret per month."],
  nodes: "a:server:Your app@0,1 | s:key:Secrets Manager:db password@3,1* | d:db:Database@6,1 | l:lambda:Rotation Lambda@3,0",
  links: "a>s:get password, a>d:connect, ~l>s:rotates, ~l>d",
  how: ["The app fetches the secret; a rotation job updates it and the database.", "The app always asks for the current value, so rotation does not break it. Access is limited to the app's IAM role.", "Compare with SSM Parameter Store: Parameter Store is cheaper / free for plain config; Secrets Manager adds rotation and cross-Region replication."],
  use: ["Use it for database credentials and API keys that should rotate.", "Plain config values do not need it; use Parameter Store.", "'Rotate database credentials automatically' → Secrets Manager."],
  quiz: [["Auto-rotate RDS credentials?", ["Secrets Manager", "Parameter Store standard", "IAM groups", "S3"], 0, "**Secrets Manager** rotates."], ["Secrets are encrypted with…", ["KMS", "SSH", "Route 53", "SES"], 0, "**KMS**."], ["Cheaper store for non-secret config?", ["Parameter Store", "Secrets Manager", "KMS", "CloudHSM"], 0, "**Parameter Store**."]],
});

export const cognito = service({
  id: "cognito", num: 42, title: "Cognito: user sign-in", short: "Cognito", category: "Security",
  tagline: "Sign-up and login for your app's users, ready-made.",
  imagine: "Imagine a ready-made security desk for your app: it registers new users, checks passwords, handles 'forgot password' and even lets people sign in with Google.",
  what: ["Cognito handles sign-up and login for the users of your app.", "Building login safely is hard. **Cognito** gives you registration, passwords, MFA, password reset, and sign-in with Google or Facebook, so you do not write it yourself.", "**User Pools** (user directory, JWT tokens, social / SAML / OIDC federation, MFA, hosted UI). **Identity Pools** (exchange tokens for temporary **AWS credentials**)."],
  nodes: "u:user:App user@0,1 | c:key:User Pool:sign-in@3,1* | g:gateway:API Gateway@5,0 | s:bucket:S3 user files@6,2",
  links: "u>c:log in, c>g:token proves who, ~c>s:temporary access",
  how: ["The user logs in and gets a token; your backend trusts the token.", "User Pools prove **who** the user is. Identity Pools give them temporary AWS permissions (for example to upload to their own S3 folder).", "Tokens: ID, access, refresh. API Gateway Cognito authorizer validates JWTs. Lambda triggers customise the flow. Federation via Google, Apple, SAML."],
  use: ["Use it for mobile and web app users.", "For your own staff logging into AWS, use IAM Identity Center instead.", "'Sign-up / sign-in for app users', 'social login' → Cognito."],
  quiz: [["Add Google login to a mobile app?", ["Cognito User Pool", "IAM user", "Config", "SES"], 0, "**Cognito** federation."], ["Give app users temporary AWS credentials?", ["Cognito Identity Pool", "User Pool", "KMS", "Route 53"], 0, "**Identity Pools**."], ["Cognito User Pools return…", ["JWT tokens", "Access keys", "SSH keys", "Passwords"], 0, "**JWT tokens**."]],
});

export const waf = service({
  id: "waf", num: 43, title: "WAF: website firewall", short: "WAF", category: "Security",
  tagline: "Blocks bad web requests before they reach your app.",
  imagine: "Imagine a guard at your shop door who reads each visitor's note and turns away anyone carrying a known trick. WAF reads web requests and blocks the nasty ones.",
  what: ["WAF blocks harmful web requests like SQL injection and bots.", "It sits in front of your site and checks each request against rules. Bad ones are blocked, good ones pass through.", "**AWS WAF** works at layer 7 on CloudFront, ALB, API Gateway, AppSync and Cognito. **Web ACLs**, rules (managed, rate-based, IP sets, geo), bot control, CAPTCHA."],
  nodes: "g:user:Good visitor@0,0 | h:user:Attacker@0,2 | w:firewall:WAF:web rules@3,1* | a:lb:Load balancer@5,1 | s:server:Your app@6,1",
  links: "g>w, ~h>w:blocked, w>a, a>s",
  how: ["Each request is matched against rules: allow, block, count or challenge.", "Rate-based rules stop floods from one address; managed rule groups block well-known attacks without you writing rules.", "Layer 7 only (HTTP). For layer 3 / 4 DDoS use Shield. WAF logs to S3, Kinesis Firehose or CloudWatch."],
  use: ["Use it to protect web apps from SQL injection, XSS and bots.", "Pair with Shield for DDoS and CloudFront for caching.", "'Block SQL injection / XSS / bad IPs' → WAF."],
  quiz: [["Block SQL injection against an ALB?", ["WAF", "Shield Standard", "NACL", "KMS"], 0, "**WAF** inspects HTTP."], ["Limit requests per IP?", ["Rate-based rule", "Security group", "Route 53", "Config"], 0, "**Rate-based rules**."], ["Which can WAF attach to?", ["CloudFront, ALB, API Gateway", "EC2 directly", "S3 only", "RDS"], 0, "CloudFront, ALB, API Gateway, AppSync."]],
});

export const shield = service({
  id: "shield", num: 44, title: "Shield: DDoS protection", short: "Shield", category: "Security",
  tagline: "Protects against floods of fake traffic.",
  imagine: "Imagine thousands of people crowding a shop door just to block real customers. Shield is the crowd control that keeps the door usable.",
  what: ["Shield protects your app from huge floods of fake traffic (DDoS).", "Attackers can send so much traffic that real users cannot get in. **Shield** detects and absorbs these floods before they reach you.", "**Shield Standard**: automatic and free for all customers (layer 3 / 4). **Shield Advanced**: extra detection, 24/7 DDoS response team, cost protection, WAF at no extra cost, for EC2, ELB, CloudFront, Route 53, Global Accelerator."],
  nodes: "a:user:Attacker flood@0,0 | r:user:Real users@0,2 | s:firewall:Shield:absorbs floods@3,1* | c:cdn:CloudFront@5,1 | p:server:Your app@6,1",
  links: "~a>s:blocked, r>s, s>c, c>p",
  how: ["Shield spots the flood pattern and drops it at the edge of AWS.", "Standard is always on. Advanced adds experts and refunds extra scaling bills caused by an attack.", "Best practice: CloudFront + Route 53 + Shield Advanced + WAF, and scale with Auto Scaling to absorb surges."],
  use: ["Use it for any internet-facing app; upgrade to Advanced for critical ones.", "Shield is for floods; WAF is for clever bad requests.", "'DDoS protection' → Shield. 'Cost protection from DDoS' → Shield Advanced."],
  quiz: [["Free automatic DDoS protection for all AWS customers?", ["Shield Standard", "Shield Advanced", "WAF", "GuardDuty"], 0, "**Shield Standard**."], ["24/7 DDoS response team?", ["Shield Advanced", "Standard", "Config", "Macie"], 0, "**Shield Advanced**."], ["Layer 7 HTTP rules?", ["WAF", "Shield Standard", "NACL", "Route 53"], 0, "Use **WAF**."]],
});

export const guardduty = service({
  id: "guardduty", num: 45, title: "GuardDuty: threat detection", short: "GuardDuty", category: "Security",
  tagline: "A security guard who watches for suspicious behaviour.",
  imagine: "Imagine a guard watching the CCTV who notices 'someone is trying every door handle at 3am'. GuardDuty watches your AWS logs for that kind of behaviour.",
  what: ["GuardDuty looks at your account activity and warns about threats.", "It reads logs (CloudTrail, VPC Flow Logs, DNS logs) and uses machine learning to spot things like a hacked server talking to a known bad address.", "Managed threat detection. Data sources: CloudTrail events, VPC Flow Logs, DNS logs, S3 data events, EKS audit logs, Lambda, RDS. **Findings** go to EventBridge / Security Hub. One-click enable, no agents."],
  nodes: "l:file:Logs:CloudTrail, Flow, DNS@0,1 | g:monitor:GuardDuty:ML threat finder@3,1* | e:topic:EventBridge@6,0 | h:lambda:Auto-fix Lambda@6,2",
  links: "l>g, g>e:finding, e>h",
  how: ["Logs go in, findings come out, and you can automate a response.", "A finding might say 'this EC2 is mining crypto'. An EventBridge rule can trigger a Lambda that isolates the server.", "Severity levels, suppression rules, multi-account via Organizations delegated admin, 30-day free trial."],
  use: ["Use it to detect compromised servers and suspicious API activity.", "It detects; it does not block. Use WAF / Shield / IAM to block.", "'Detect threats / compromised instances using logs' → GuardDuty."],
  quiz: [["Detect an EC2 talking to a known malicious IP?", ["GuardDuty", "Config", "Trusted Advisor", "KMS"], 0, "**GuardDuty**."], ["Does GuardDuty need agents?", ["No", "Yes on every server", "Only on RDS", "Only Windows"], 0, "It is **agentless**."], ["Automate a response to a finding?", ["EventBridge + Lambda", "SES", "Snowball", "Glue"], 0, "**EventBridge** triggers a target."]],
});

export const orgs = service({
  id: "organizations", num: 46, title: "Organizations", short: "Organizations", category: "Management",
  tagline: "Manage many AWS accounts together, with guardrails.",
  imagine: "Imagine a company head office that gives each team its own office (account), pays one combined bill and sets rules every office must follow. That is AWS Organizations.",
  what: ["Organizations groups many AWS accounts under one boss account.", "Big companies use many accounts (one per team or app) for safety. **Organizations** lets you create them, get one bill, and apply rules to all.", "Management account + **OUs** (organizational units) + member accounts. **Consolidated billing** (volume discounts), **SCPs** (service control policies) as permission guardrails (they never grant, only limit)."],
  nodes: "p:box:Prod OU:production@1,2 | mg:box:Mgmt account:the boss@3,0* | d:box:Dev OU:development@5,2 | s:policy:SCP:guardrail@3,2",
  links: "mg>p, mg>d, ~s>p, ~s>d",
  how: ["Rules (SCPs) flow down to every account below them.", "An SCP like 'nobody may leave the Mumbai Region' applies even to the account's admins. It limits what is possible; IAM still decides what is allowed inside that limit.", "Consolidated billing, Reserved Instance sharing, delegated admin for services (GuardDuty, Config), AWS Control Tower for landing zones, IAM Identity Center for sign-in."],
  use: ["Use it for multi-account setups, central billing and company-wide rules.", "SCPs do not affect the management account.", "'Restrict Regions / services across accounts' → SCP. 'One bill' → consolidated billing."],
  quiz: [["Prevent all accounts from using a certain Region?", ["SCP", "IAM user policy", "Security group", "NACL"], 0, "**SCPs** set guardrails."], ["Single bill for many accounts?", ["Consolidated billing", "Cost Explorer", "CloudTrail", "Budgets only"], 0, "**Consolidated billing**."], ["Do SCPs grant permissions?", ["No, they only limit", "Yes", "Only for root", "Only for S3"], 0, "They are **filters**, not grants."]],
});

export const directconnect = service({
  id: "direct-connect", num: 47, title: "Direct Connect", short: "Direct Connect", category: "Network",
  tagline: "A private cable from your office to AWS.",
  imagine: "Imagine a private road between your office and AWS instead of the public highway. It is faster, steadier and not shared with strangers.",
  what: ["Direct Connect is a dedicated private network link to AWS.", "The internet is shared and can be slow or unpredictable. A **Direct Connect** line goes straight from your data centre to AWS with steady speed and lower cost for lots of data.", "Dedicated 1 / 10 / 100 Gbps or hosted 50 Mbps–10 Gbps connections at a DX location. **Virtual interfaces**: private (VPC), public (AWS services), transit. Not encrypted by default (add VPN or MACsec). Setup takes weeks."],
  nodes: "o:server:Your data centre@0,1 | d:gateway:Direct Connect:private line@3,1* | a:box:Your VPC@6,0 | s:bucket:S3 and others@6,2",
  links: "o>d:dedicated cable, d>a:private VIF, d>s:public VIF",
  how: ["A cable to an AWS location, then virtual links to your VPC or AWS services.", "Because it avoids the public internet, latency and bandwidth are consistent. For encryption, run a VPN over it.", "Direct Connect Gateway for multiple VPCs / Regions. Link aggregation (LAG). Backup with a Site-to-Site VPN for resilience."],
  use: ["Use it for steady, heavy, low-latency hybrid traffic.", "Need it today and cheap? Use Site-to-Site VPN (minutes, encrypted, over the internet).", "'Consistent network performance, large data to AWS' → Direct Connect."],
  quiz: [["Predictable low-latency private link to AWS?", ["Direct Connect", "VPN only", "CloudFront", "Route 53"], 0, "**Direct Connect**."], ["Is Direct Connect encrypted by default?", ["No", "Yes", "Only 100 Gbps", "Only hosted"], 0, "Add **VPN or MACsec**."], ["Fast, cheap backup for DX?", ["Site-to-Site VPN", "Snowball", "EFS", "WAF"], 0, "Use a **VPN** as backup."]],
});

export const tgw = service({
  id: "transit-gateway", num: 48, title: "Transit Gateway", short: "Transit Gateway", category: "Network",
  tagline: "A hub that connects many networks together.",
  imagine: "Imagine one central train station connecting every city, instead of running a separate track between each pair. Transit Gateway is that station for networks.",
  what: ["Transit Gateway connects many VPCs and offices through one hub.", "Without it, connecting 10 networks needs dozens of separate links (peering). With a **Transit Gateway** every network connects once to the hub and can talk to the others.", "Regional hub-and-spoke router. Attachments: VPC, VPN, Direct Connect gateway, peering to other TGWs. **Route tables** control which networks can reach which. Supports multicast and ECMP for VPN bandwidth."],
  nodes: "a:box:VPC A@0,0 | b:box:VPC B@0,2 | t:gateway:Transit Gateway:the hub@3,1* | c:box:VPC C@6,0 | o:server:Office / VPN@6,2",
  links: "a>t, b>t, t>c, t>o",
  how: ["Each network plugs into the hub and the hub routes between them.", "Adding a new network means one attachment instead of links to every other one. Route tables can keep some networks apart.", "Transitive routing (unlike VPC peering). Inter-Region peering. Charged per attachment and per GB."],
  use: ["Use it when you have many VPCs or a hybrid network.", "Just two VPCs? VPC peering is simpler and cheaper.", "'Many VPCs, transitive routing, simplify network' → Transit Gateway."],
  quiz: [["Connect 50 VPCs and on-prem with minimal links?", ["Transit Gateway", "VPC peering mesh", "Elastic IP", "NAT"], 0, "**Transit Gateway** hub-and-spoke."], ["Is VPC peering transitive?", ["No", "Yes", "Only in one Region", "Only with TGW"], 0, "Peering is **not transitive**."], ["Control which VPCs can talk?", ["TGW route tables", "Tags", "KMS", "Snapshots"], 0, "**Route tables**."]],
});

export const globalAccelerator = service({
  id: "global-accelerator", num: 49, title: "Global Accelerator", short: "Global Accelerator", category: "Network",
  tagline: "Fast lane onto the AWS network with two fixed addresses.",
  imagine: "Imagine a private on-ramp to a fast motorway as close to the user as possible, instead of driving through slow city streets all the way. That is Global Accelerator.",
  what: ["Global Accelerator brings users onto the fast AWS network early and gives you fixed IP addresses.", "Normally traffic crosses many slow public networks. Global Accelerator takes users to the nearest AWS edge and then sends them over AWS's private backbone to your app.", "Provides 2 static **anycast IPs**, health checks and instant **failover** across Regions and endpoints (ALB, NLB, EC2, Elastic IP). Works for TCP and UDP. Unlike CloudFront, it does not cache."],
  nodes: "u:user:Users worldwide@0,1 | g:gateway:Accelerator:2 fixed IPs@3,1* | a:lb:ALB Mumbai@6,0 | b:lb:ALB Ireland@6,2",
  links: "u>g:nearest edge, g>a:AWS backbone, g>b",
  how: ["Users enter at the nearest edge and ride the AWS backbone to the healthiest Region.", "If a Region fails its health check, traffic moves within seconds. There is no wait for DNS caches to expire.", "Traffic dials per endpoint group, client affinity, custom routing accelerator for games. Good for non-HTTP and for apps needing static IPs."],
  use: ["Use it for global apps needing fixed IPs, fast failover, or non-HTTP traffic.", "For cacheable web content use CloudFront instead.", "'Static IP + fast regional failover' → Global Accelerator. 'Cache content' → CloudFront."],
  chaos: ["Mumbai Region fails", "a", "Global Accelerator saw Mumbai was unhealthy and **instantly** sent traffic to Ireland. No DNS cache delay."],
  quiz: [["Two static IPs and instant Region failover?", ["Global Accelerator", "CloudFront", "Route 53 simple", "S3"], 0, "**Global Accelerator**."], ["Does Global Accelerator cache content?", ["No", "Yes", "Only images", "Only video"], 0, "No, that is **CloudFront**."], ["Works for non-HTTP traffic (TCP / UDP)?", ["Yes", "No", "Only HTTP", "Only HTTPS"], 0, "It supports **TCP and UDP**."]],
});
