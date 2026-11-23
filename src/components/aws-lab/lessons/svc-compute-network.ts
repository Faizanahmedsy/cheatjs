import { service } from "./helpers";

export const elb = service({
  id: "elb", num: 10, title: "Elastic Load Balancing", short: "ELB", category: "Network",
  tagline: "A receptionist that shares visitors across healthy servers.",
  imagine: "Imagine a restaurant host at the door. Guests arrive, and the host sends each one to a table that is free and clean. That host is a load balancer.",
  what: ["A load balancer spreads incoming visitors over many servers.", "Instead of everyone hitting one server, they all hit the **load balancer**, which passes each request to one of several servers. It keeps checking which servers are healthy and skips broken ones.", "Types: **ALB** (HTTP, paths and hosts, layer 7), **NLB** (TCP/UDP, millions of requests, static IPs, layer 4), **GWLB** (appliances), CLB (old)."],
  nodes: "u:user:Users@0,1 | lb:lb:Load balancer:ELB@2,1* | a:server:Server A:healthy@4,0 | b:server:Server B:healthy@4,1 | c:server:Server C:healthy@4,2",
  links: "u>lb, lb>a, lb>b, lb>c",
  how: ["It checks each server and only sends visitors to the healthy ones.", "Every few seconds the load balancer asks each server \"are you OK?\" (a **health check**). A server that fails stops getting visitors until it recovers.", "ALB routes by URL path / host / header to **target groups**. Cross-zone load balancing, sticky sessions, SSL termination with ACM certificates, and WebSocket / HTTP2 support."],
  use: ["Use it whenever you have more than one server or want zero downtime.", "Put it in front of any web app so you can add, remove or replace servers without users noticing.", "HTTP routing by path → ALB. Extreme speed or fixed IP → NLB. Third-party firewall appliance → GWLB."],
  analogy: "A restaurant host who only seats guests at open tables.",
  chaos: ["Crash Server B and C", "b,c", "Two servers died, but the load balancer sent everyone to **Server A**. If all of them die, the app is down."],
  quiz: [["Route /images to one group of servers and /api to another. Which load balancer?", ["ALB", "NLB", "CLB", "Gateway LB"], 0, "**ALB** routes by path and host."], ["Need static IP addresses and ultra-low latency?", ["ALB", "NLB", "Route 53", "CloudFront"], 1, "**NLB** gives static IPs and handles millions of requests per second."], ["What decides if a server receives traffic?", ["Region", "Health check", "Tag", "Price"], 1, "Only servers that pass **health checks** get traffic."]],
});

export const asg = service({
  id: "asg", num: 11, title: "EC2 Auto Scaling", short: "Auto Scaling", category: "Compute",
  tagline: "Adds and removes servers automatically as traffic changes.",
  imagine: "Imagine a shop that calls in extra cashiers when the queue is long and sends them home when it is empty. Auto Scaling does that with servers.",
  what: ["Auto Scaling starts or stops servers by itself based on how busy you are.", "You say \"keep between 2 and 10 servers\". When servers get too busy, it adds more. When it is quiet, it removes extras so you stop paying. It also replaces broken servers.", "An **Auto Scaling group** has min, desired and max size, a launch template, and scaling policies (target tracking, step, scheduled, predictive)."],
  nodes: "m:monitor:CloudWatch:watches load@0,1 | g:autoscale:Auto Scaling:2 to 10 servers@2,1* | a:server:Server 1@4,0 | b:server:Server 2@4,1 | c:server:Server 3:new@4,2",
  links: "m>g:too busy?, g>a, g>b, g>c",
  how: ["It watches a number (like CPU) and adds or removes servers to keep it steady.", "A metric such as average CPU is watched. If it goes above your target, Auto Scaling launches more servers. If it falls low, it removes some. A cool-down period stops it from flapping.", "**Target tracking** (keep CPU at 50%), step scaling, scheduled scaling for known peaks, predictive scaling. Works with ELB health checks to replace unhealthy instances. Spans multiple AZs."],
  use: ["Use it for any app whose traffic goes up and down.", "It saves money in quiet hours and keeps the app fast in busy hours. It also heals itself when a server dies.", "Exam: 'elastic', 'unpredictable load', 'self-healing' → Auto Scaling group behind an ELB."],
  chaos: ["Crash Server 2", "b", "Server 2 died. Auto Scaling **notices and launches a replacement** to keep the desired number."],
  quiz: [["You know traffic peaks every day at 9am. Which scaling?", ["Scheduled scaling", "Manual", "Vertical", "None"], 0, "**Scheduled scaling** adds capacity at known times."], ["What keeps the group at a chosen CPU level automatically?", ["Step scaling", "Target tracking", "Cooldown", "Lifecycle hook"], 1, "**Target tracking** holds a metric near a target."], ["An instance fails its health check. What happens?", ["Nothing", "ASG replaces it", "You pay double", "Region fails"], 1, "The group **terminates and replaces** unhealthy instances."]],
});

export const cloudfront = service({
  id: "cloudfront", num: 12, title: "CloudFront", short: "CloudFront", category: "Network",
  tagline: "Copies of your site stored near every user for speed.",
  imagine: "Imagine a newspaper printed in every city instead of shipped from one factory. Readers get it fast because it is already nearby. CloudFront does that for websites.",
  what: ["CloudFront keeps copies of your pages and files in many cities around the world.", "A visitor far from your server would wait a long time. CloudFront stores copies at **edge locations** close to people, so the file arrives fast.", "A CDN with 400+ edge locations. Origins: S3, ALB, EC2, any HTTP server. Signed URLs / cookies for private content, HTTPS, Origin Access Control, Lambda@Edge / CloudFront Functions."],
  nodes: "u:user:Users abroad@0,1 | e:cdn:Edge location:nearby copy@2,1* | o:bucket:Origin:S3 or ALB@4,1",
  links: "u>e:fast, ~e>o:only if not cached",
  how: ["The first visitor fetches from your server; everyone after gets the nearby copy.", "If the edge has the file, it returns it right away (**cache hit**). If not, it fetches from your **origin**, keeps a copy for a set time (**TTL**), and serves it.", "Cache behaviours per path, TTLs, invalidations, compression, geo-restriction, WAF and Shield integration, field-level encryption."],
  use: ["Use it for websites, images, video and APIs with users in many places.", "It makes things faster, reduces load on your server, and helps absorb attacks and traffic spikes.", "'Reduce latency for a global audience' or 'serve private S3 content' → CloudFront (with OAC)."],
  chaos: ["Origin goes offline", "o", "The origin is down, but CloudFront still serves **cached copies** until they expire, so many users notice nothing."],
  quiz: [["Global users, static files in S3, want low latency. Use…", ["CloudFront", "Direct Connect", "VPN", "EBS"], 0, "**CloudFront** caches at edge locations."], ["How long does CloudFront keep a cached object?", ["Forever", "Until its TTL expires", "1 minute always", "Never"], 1, "Based on **TTL** (or invalidation)."], ["Restrict an S3 bucket so only CloudFront can read it?", ["Origin Access Control", "Security group", "NACL", "Route 53"], 0, "**OAC** limits S3 access to CloudFront."]],
});

export const route53 = service({
  id: "route53", num: 13, title: "Route 53", short: "Route 53", category: "Network",
  tagline: "The internet's phone book, with smart routing.",
  imagine: "Imagine a phone book that turns a name like 'myshop.com' into the real address of a computer. Route 53 is that phone book, and it can also pick the nearest or healthiest address.",
  what: ["Route 53 turns website names into the addresses computers use.", "People type names; computers need numbers (IP addresses). **Route 53** (DNS) translates one into the other, and can choose between several answers based on health or location.", "Managed authoritative **DNS** plus domain registration and health checks. Record types: A, AAAA, CNAME, MX, TXT, **Alias** (free, works at the zone apex for AWS resources)."],
  nodes: "u:user:Users@0,1 | r:dns:Route 53:phone book@2,1* | a:server:Mumbai app:healthy@4,0 | b:server:Singapore app:healthy@4,2",
  links: "u>r:myshop.com?, r>a, r>b",
  how: ["It answers 'where is myshop.com?' with an address, and can skip broken or far ones.", "You set **routing policies**: simple, weighted (send 10% to a new version), latency (nearest), failover (use backup if main is down), geolocation (by country). **Health checks** remove dead answers.", "Policies: simple, weighted, latency, failover (active-passive), geolocation, geoproximity, multi-value. Alias records to ELB / CloudFront / S3. Private hosted zones for VPCs."],
  use: ["Use it to point your domain at AWS and to fail over between Regions.", "It is the first thing every visitor touches, so it is key for availability.", "'Route to the Region with lowest latency' → latency routing. 'Backup site if primary fails' → failover."],
  chaos: ["Mumbai goes down", "a", "The health check failed for Mumbai, so Route 53 **stopped returning its address** and sent users to Singapore."],
  quiz: [["Send users to the closest Region?", ["Latency routing", "Weighted", "Failover", "Simple"], 0, "**Latency routing** picks the lowest-latency Region."], ["Active-passive disaster recovery?", ["Failover routing", "Weighted", "Geolocation", "Multi-value"], 0, "**Failover** uses the secondary when the primary is unhealthy."], ["Point your root domain (example.com) to an ALB?", ["CNAME", "Alias record", "MX", "TXT"], 1, "Use an **Alias** record at the zone apex."]],
});

export const ebs = service({
  id: "ebs", num: 14, title: "EBS: server disks", short: "EBS", category: "Storage",
  tagline: "A hard disk you attach to a server over the network.",
  imagine: "Imagine a portable hard drive you plug into a computer. If the computer breaks, you unplug the drive and plug it into another. EBS is that drive.",
  what: ["EBS is a disk for your EC2 server that keeps its data safe.", "Your server needs somewhere to keep its operating system and files. **EBS** is a separate disk attached over the network. It survives when the server stops, and you can take **snapshots** (backups).", "Block storage tied to one **AZ**. Types: gp3 / gp2 (SSD general), io2 / io1 (high IOPS), st1 / sc1 (HDD throughput / cold). Encryption with KMS. Multi-Attach for io1 / io2."],
  nodes: "s:server:EC2 server@0,1 | d:disk:EBS disk:gp3 SSD@2,1* | n:bucket:Snapshot:in S3@4,1",
  links: "s>d, ~d>n:backup",
  how: ["The disk sits next to the server in the same building and a snapshot backs it up to S3.", "Snapshots are incremental, so only changes are stored. You can restore a snapshot into a new disk, even in another zone or Region.", "An EBS volume attaches to one instance (same AZ). Snapshots are stored in S3 and are incremental. Fast Snapshot Restore, Data Lifecycle Manager for automation."],
  use: ["Use it for the server's main disk and for databases running on EC2.", "Pick SSD for speed, HDD for big sequential data. Always snapshot important disks.", "Share files between many servers → EFS, not EBS. Temporary fast scratch → instance store."],
  chaos: ["Server crashes", "s", "The server died, but the **disk and its data are fine**. Attach it to a new server and carry on."],
  quiz: [["A database on EC2 needs the highest IOPS. Pick…", ["gp3", "io2", "st1", "sc1"], 1, "**io2** is for high, consistent IOPS."], ["An EBS volume can be attached across AZs?", ["Yes", "No, one AZ", "Only gp3", "Only io2"], 1, "EBS lives in a **single AZ**; use snapshots to move it."], ["Where are EBS snapshots stored?", ["S3", "Glacier only", "Another EBS", "RDS"], 0, "Snapshots are stored in **S3**."]],
});

export const efs = service({
  id: "efs", num: 15, title: "EFS: shared files", short: "EFS", category: "Storage",
  tagline: "One shared folder many servers can use at once.",
  imagine: "Imagine a shared office drive that everyone on every floor can open at the same time. EFS is that shared drive for servers.",
  what: ["EFS is a shared network folder many servers can read and write together.", "EBS belongs to one server. **EFS** can be mounted by hundreds of servers across several zones at the same time, and it grows and shrinks by itself.", "Managed **NFS** file system for Linux, multi-AZ, elastic, with Standard and Infrequent Access classes and lifecycle management. Performance: bursting / provisioned / elastic throughput."],
  nodes: "a:server:Server A@0,0 | b:server:Server B@0,1 | c:server:Server C@0,2 | f:file:EFS folder:shared@3,1*",
  links: "a>f, b>f, c>f",
  how: ["Every server mounts the same folder and sees the same files.", "A file written by Server A is instantly visible to Server B and C. You never choose a size: it grows with your files and you pay for what you store.", "Mount targets in each AZ. Linux only (use FSx for Windows). Encryption at rest and in transit. Storage classes with lifecycle to IA."],
  use: ["Use it when many servers need the same files: CMS uploads, shared code, home folders.", "If only one server needs the disk, EBS is cheaper and faster.", "'Shared file system, Linux, multi-AZ' → EFS. Windows → FSx for Windows."],
  quiz: [["Many Linux EC2 instances need a shared file system across AZs?", ["EBS", "EFS", "Instance store", "S3 Glacier"], 1, "**EFS** is a shared multi-AZ NFS file system."], ["EFS is best described as…", ["Block storage", "Object storage", "Network file system", "Cache"], 2, "EFS is a managed **NFS** file system."], ["Do you provision EFS size in advance?", ["Yes always", "No, it grows automatically", "Only in us-east-1", "Only for Windows"], 1, "EFS is **elastic**."]],
});

export const fsx = service({
  id: "fsx", num: 16, title: "FSx: special file systems", short: "FSx", category: "Storage",
  tagline: "Ready-made Windows, Lustre, NetApp and ZFS file systems.",
  imagine: "Imagine renting a ready-made office file server that already runs the exact software your team uses. FSx gives you that without the setup.",
  what: ["FSx is a managed file server for apps that need a specific kind of file system.", "Some software only works with Windows file shares, or needs super-fast file access for big calculations. **FSx** gives you those exact file systems fully managed.", "FSx for **Windows File Server** (SMB, Active Directory), **Lustre** (HPC, ML, linked to S3), **NetApp ONTAP**, **OpenZFS**."],
  nodes: "w:server:Windows apps@0,0 | h:server:HPC cluster@0,2 | x:disk:FSx:managed@3,1* | s:bucket:S3 data@6,2",
  links: "w>x:SMB, h>x:fast, ~x>s:linked",
  how: ["Pick the flavour that fits your software and AWS runs it for you.", "Windows apps use FSx for Windows (SMB and AD login). Heavy computing uses FSx for Lustre, which can load data from S3 and write results back.", "FSx for Windows: Multi-AZ, DFS, shadow copies. FSx for Lustre: sub-millisecond, hundreds of GB/s, scratch vs persistent. Backups to S3."],
  use: ["Use it to move Windows file shares or run high-performance computing.", "Plain Linux sharing? Use EFS. Windows shares? Use FSx for Windows.", "'SMB' or 'Active Directory' → FSx for Windows. 'HPC' / 'ML training speed' → FSx for Lustre."],
  quiz: [["Windows file share with Active Directory?", ["EFS", "FSx for Windows", "EBS", "S3"], 1, "**FSx for Windows File Server** uses SMB and AD."], ["Fast file system for HPC that loads from S3?", ["FSx for Lustre", "EFS", "FSx for ONTAP", "EBS"], 0, "**FSx for Lustre** is built for HPC and S3-linked data."], ["FSx is…", ["Self-managed", "Fully managed", "On-premises only", "A database"], 1, "AWS manages it."]],
});

export const storageGateway = service({
  id: "storage-gateway", num: 17, title: "Storage Gateway", short: "Storage Gateway", category: "Storage",
  tagline: "A bridge between your office storage and AWS.",
  imagine: "Imagine a small door in your office wall that leads to a giant warehouse in the cloud. You use it like a normal cabinet, but things are quietly stored in the warehouse.",
  what: ["Storage Gateway lets your office systems use AWS storage like local storage.", "You install a small virtual machine in your office. Your apps talk to it like a normal file server or disk, and it keeps the data safely in AWS (S3, EBS snapshots, Glacier).", "Types: **S3 File Gateway** (NFS / SMB to S3), **FSx File Gateway**, **Volume Gateway** (iSCSI, cached or stored), **Tape Gateway** (virtual tapes to Glacier)."],
  nodes: "o:server:Office apps@0,1 | g:gateway:Gateway:on-premises VM@2,1* | s:bucket:S3 / Glacier@4,1",
  links: "o>g:NFS / SMB, g>s:HTTPS",
  how: ["A local cache keeps hot files close; everything is stored in AWS.", "Apps see a normal file share or disk. The gateway caches recent data locally for speed and uploads in the background to AWS.", "Hybrid cloud pattern. File gateway objects appear as S3 objects. Volume gateway snapshots become EBS snapshots. Tape gateway replaces physical tape libraries."],
  use: ["Use it for hybrid setups, cloud backups and replacing tape.", "For one-time huge moves use Snow Family or DataSync instead.", "'Replace tape backups' → Tape Gateway. 'On-prem NFS backed by S3' → S3 File Gateway."],
  quiz: [["Replace physical tape backups with AWS?", ["Tape Gateway", "EFS", "FSx", "Snowcone"], 0, "**Tape Gateway** gives virtual tapes stored in S3 / Glacier."], ["On-prem apps need an NFS share backed by S3?", ["File Gateway", "EBS", "Direct Connect", "VPN"], 0, "**S3 File Gateway** does this."], ["Where does a gateway run?", ["On-premises as a VM or appliance", "Only in AWS", "Only in a phone", "In Route 53"], 0, "You deploy it **on-premises**."]],
});

export const ecs = service({
  id: "ecs", num: 18, title: "ECS: run containers", short: "ECS", category: "Compute",
  tagline: "AWS's own way to run Docker containers.",
  imagine: "Imagine a shipping port that handles standard containers. You do not care what is inside; the port just places each one where it fits. ECS is the port manager for your app containers.",
  what: ["ECS runs and manages your Docker containers.", "You describe your app in a **task definition** (which image, how much memory). ECS finds room in your cluster and keeps the right number of copies running.", "Core: cluster, task definition, task, **service** (keeps N tasks running, integrates with ALB). Launch types: **EC2** or **Fargate**."],
  nodes: "u:user:Users@0,1 | l:lb:Load balancer@1,1 | s:box:ECS service:keeps 3 running@3,1* | a:server:Task 1@5,0 | b:server:Task 2@5,1 | c:server:Task 3@5,2",
  links: "u>l, l>s, s>a, s>b, s>c",
  how: ["ECS keeps the number of containers you asked for, and replaces any that stop.", "If a container crashes, the service starts a new one. With a load balancer in front, users never see the broken one.", "Task roles for permissions, awsvpc networking, service auto scaling, rolling updates and blue/green via CodeDeploy, ECR for images."],
  use: ["Use it when your app is in Docker and you want a simple AWS-native way to run it.", "Want Kubernetes? Use EKS. Do not want to manage servers? Pick Fargate as the launch type.", "'Containers, not Kubernetes' → ECS. 'No servers to manage' → ECS on Fargate."],
  chaos: ["Crash Task 2", "b", "One container died. The ECS service **started a replacement** and the load balancer kept sending traffic to the other two."],
  quiz: [["Run Docker containers on AWS without Kubernetes?", ["ECS", "EKS", "Lambda only", "Lightsail only"], 0, "**ECS** is AWS's native container orchestrator."], ["What keeps N copies of a task running?", ["ECS service", "Task definition", "Cluster", "ECR"], 0, "An **ECS service**."], ["Where are container images stored?", ["ECR", "S3 only", "RDS", "EBS"], 0, "**ECR** is the container registry."]],
});

export const eks = service({
  id: "eks", num: 19, title: "EKS: Kubernetes", short: "EKS", category: "Compute",
  tagline: "Managed Kubernetes for teams that already use it.",
  imagine: "Imagine a very popular standard rulebook for running containers (Kubernetes). EKS is AWS running the head office for that rulebook so you do not have to.",
  what: ["EKS is Kubernetes run for you by AWS.", "Kubernetes is a popular open-source way to run many containers. Running its control centre is hard, so **EKS** hosts and updates it for you across several zones.", "Managed Kubernetes **control plane** (multi-AZ). Worker nodes on EC2 (managed node groups), Fargate, or hybrid. Integrates with IAM (IRSA), ELB, EBS / EFS CSI."],
  nodes: "d:user:Developer@0,1 | c:box:EKS plane:AWS runs it@2,1* | n1:server:Node 1:your pods@4,0 | n2:server:Node 2:your pods@4,2",
  links: "d>c:kubectl, c>n1, c>n2",
  how: ["AWS runs the brain; you run (or let AWS run) the worker machines.", "You use normal Kubernetes tools (kubectl, Helm). The control plane schedules pods onto worker nodes, scales them and restarts failures.", "Cluster Autoscaler / Karpenter for nodes, HPA for pods. Same app runs on any Kubernetes, so it is portable. More complex than ECS."],
  use: ["Use it if your team already knows Kubernetes or needs portability.", "If you just want containers on AWS with less to learn, ECS is simpler.", "'Kubernetes' in a question → EKS. 'Portable across clouds' → EKS."],
  quiz: [["Your company standardises on Kubernetes. Use…", ["EKS", "ECS", "Lambda", "Beanstalk"], 0, "**EKS** is managed Kubernetes."], ["Who manages the EKS control plane?", ["AWS", "You", "Docker", "Route 53"], 0, "AWS runs it, multi-AZ."], ["Run EKS pods without managing nodes?", ["Fargate", "Instance store", "Spot only", "NAT"], 0, "**EKS on Fargate** is serverless pods."]],
});

export const fargate = service({
  id: "fargate", num: 20, title: "Fargate: containers, no servers", short: "Fargate", category: "Compute",
  tagline: "Run containers without ever touching a server.",
  imagine: "Imagine ordering food delivery: you do not own a kitchen or hire a chef. You just say what you want. Fargate is that for containers.",
  what: ["Fargate runs containers for you and hides the servers.", "With ECS or EKS you normally have to manage the servers that run containers. With **Fargate** you only say how much CPU and memory each container needs, and AWS finds the machine.", "Serverless compute engine for ECS and EKS. Pay per vCPU and memory per second. Each task has its own isolated kernel and ENI."],
  nodes: "u:user:Users@0,1 | a:box:Your container:2 vCPU, 4 GB@3,1* | f:server:Fargate:AWS owns servers@6,1",
  links: "u>a, ~a>f:runs on",
  how: ["You describe the container and Fargate finds a place to run it.", "No instances to patch or scale. You pay only while the container runs, based on the CPU and memory you asked for.", "Task size from 0.25 vCPU to 16 vCPU. Ephemeral storage up to 200 GB, EFS support. Spot pricing for fault-tolerant tasks."],
  use: ["Use it when you want containers without managing servers.", "For very large steady workloads, EC2 can be cheaper. For short event code, Lambda is simpler.", "'Serverless containers' → Fargate. Run longer than 15 minutes serverless → Fargate."],
  quiz: [["Run containers without managing EC2 instances?", ["Fargate", "Bare metal", "Dedicated Host", "Snowball"], 0, "**Fargate** is serverless compute for containers."], ["You pay Fargate by…", ["vCPU and memory per second", "Per Region", "Per image", "Per cluster only"], 0, "Pay for **vCPU and memory** used."], ["Fargate works with…", ["ECS and EKS", "RDS only", "S3 only", "SQS only"], 0, "It is a launch type for **ECS and EKS**."]],
});

export const beanstalk = service({
  id: "beanstalk", num: 21, title: "Elastic Beanstalk", short: "Beanstalk", category: "Compute",
  tagline: "Upload your code. AWS builds the servers around it.",
  imagine: "Imagine handing your recipe to a catering company that sets up the kitchen, hires staff and serves guests. You only provide the recipe. Beanstalk does that for web apps.",
  what: ["Beanstalk runs your web app: you upload code, AWS sets up everything else.", "It creates the servers, load balancer, Auto Scaling and monitoring for you. You still own and can see all those pieces, but you do not have to wire them together.", "PaaS for Java, .NET, Node, Python, PHP, Ruby, Go, Docker. Application → environment → versions. Web server or worker environment. Deploy policies: all-at-once, rolling, immutable, blue/green."],
  nodes: "d:user:Developer:uploads code@0,1 | b:box:Beanstalk:builds it all@2,1* | l:lb:Load balancer@4,0 | a:autoscale:Auto Scaling@4,1 | s:server:EC2 servers@4,2",
  links: "d>b:code, b>l, b>a, b>s",
  how: ["Beanstalk creates and connects the usual pieces from your uploaded code.", "Updating is one click or one command. You can pick how new versions roll out, and roll back if something breaks.", "Configuration via .ebextensions, platform branches, managed updates. Underlying resources are normal AWS services, shown in the console."],
  use: ["Use it to get a standard web app running fast without learning every service.", "Need full control or microservices? Use ECS or EKS. Event driven code? Lambda.", "'Deploy a web app quickly, minimal ops' → Elastic Beanstalk."],
  quiz: [["Upload code and let AWS handle provisioning and scaling?", ["Elastic Beanstalk", "CloudFormation only", "Direct Connect", "EFS"], 0, "**Beanstalk** is AWS's PaaS."], ["Which deployment keeps old and new fleets side by side?", ["All at once", "Blue/green", "Rolling only", "None"], 1, "**Blue/green** swaps environments."], ["Beanstalk resources are…", ["Hidden", "Normal AWS resources you can see", "On-prem", "Free"], 1, "They are regular EC2, ELB, ASG, etc."]],
});
