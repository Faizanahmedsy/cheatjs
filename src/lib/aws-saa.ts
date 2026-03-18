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
// Compute Group (The Workers)
const computeTopics: AWSTopic[] = [
  {
    id: "ec2",
    label: "EC2",
    icon: Server,
    href: "/aws-saa?topic=ec2",
    content: {
      title: "Amazon EC2 (Renting a Computer)",
      description:
        "Virtual servers in the cloud. Think of it like renting a computer 'house' where you are the boss and you have to manage everything.",
      steps: [
        {
          title: "EC2 Instance Types (The Worker Families)",
          explanation:
            "AWS has different types of computers. The name looks like this: [Family][Version].[Size]. For example: m5.xlarge.",
          text: `
WHICH WORKER DO YOU NEED? (Exam Favorites)

1. General Purpose (T, M): "The All-Rounder." 
   - Good for: Basic websites and small databases.
   - t3.micro: The 'Free' one for beginners.

2. Compute Optimized (C): "The Math Genius." 
   - Good for: High-speed math, gaming servers, or heavy processing.
   - Memory is low, but the brain is FAST.

3. Memory Optimized (R, X): "The Elephant." 
   - Good for: Real-time data and big databases.
   - It has a huge memory and never forgets.

4. Storage Optimized (I, D, H): "The Fast Writer." 
   - Good for: Reading and writing big files very quickly.

5. Accelerated Computing (P, G): "The Artist." 
   - Good for: Graphics, making movies, or AI (GPU power).

EXAM CHEAT SHEET:
- "Need more CPU brain?" -> Pick C family.
- "Need more RAM memory?" -> Pick R family.
- "Need GPU for AI?" -> Pick P or G family.
`,
        },
        {
          title: "EC2 Pricing Models (How to pay)",
          explanation:
            "Picking how to pay is the most important part of the exam. You want to be the cheapest!",
          text: `
1. ON-DEMAND: "The Hotel Room."
   - Pay by the second. 
   - Use for: Short jobs or just testing. No commitment.
   - Most expensive!

2. RESERVED INSTANCES (RI): "The 1-Year Lease."
   - You promise to stay for 1 or 3 years.
   - Up to 72% discount! 
   - Standard RI: You can't change your mind.
   - Convertible RI: You can change the computer type later.

3. SAVINGS PLANS: "The Monthly Budget."
   - You promise to spend a certain amount ($/hour) for 1-3 years. 
   - Very flexible.

4. SPOT INSTANCES: "The Standby Ticket."
   - Up to 90% discount! (The cheapest).
   - BUT: AWS can kick you out with a 2-minute warning.
   - Use for: Jobs that can fail and restart (Batch jobs).
   - NEVER use for: Databases or important websites.

5. DEDICATED HOSTS: "The Private Mansion."
   - A physical server that is ONLY for you.
   - Use for: Strict legal rules or special software licenses.
`,
        },
        {
          title: "Auto Scaling & Load Balancing (The Team)",
          explanation:
            "One computer might get tired. You need a team (Scaling) and a traffic cop (Load Balancer).",
          text: `
AUTO SCALING GROUP (ASG): "The Clone Machine"
- It makes more computers when your site gets busy.
- Min: 2 (Never have fewer than 2).
- Max: 10 (Never spend more than 10).
- Desired: 4 (What I want right now).

ELASTIC LOAD BALANCER (ELB): "The Traffic Cop"
1. Application (ALB): "The Smart Cop" (Layer 7). 
   - He looks at the URL (e.g., sends /images to one worker and /api to another).
2. Network (NLB): "The Super Fast Cop" (Layer 4). 
   - For millions of people. Use for Gaming or fast stuff. 
   - Uses a Static IP (an address that never changes).
3. Gateway (GWLB): "The Security Guard" (Layer 3). 
   - Sends people through a fire-wall scanner first.
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
      title: "AWS Lambda (The Light Switch)",
      description:
        "Serverless compute. You don't manage any servers. You just provide code, and it runs when someone 'flips the switch'.",
      steps: [
        {
          title: "Lambda Essentials (The Rules)",
          explanation:
            "Lambda is great because it's free if nobody uses it. But it has strict limits you must memorize for the exam.",
          code: `# --- THE LAMBDA RULEBOOK (MEMORIZE THESE!) ---

# 1. TIME LIMIT: Max 15 minutes. 
# If your code takes 16 minutes, it will FAIL.

# 2. MEMORY: 128 MB to 10 GB. 
# (More memory = faster brain).

# 3. DISK SPACE (/tmp): 512 MB to 10 GB.

# 4. CONCURRENT: 1,000. 
# (How many can run at the exact same time).

# 5. PRICING:
# - First 1 million clicks/month = FREE.
# - After that, you pay per click and per second.

# --- THE TRIGGERS (What flips the switch?) ---
# - S3: Someone uploads a photo.
# - API Gateway: Someone clicks a button on a site.
# - DynamoDB: Someone changes data in a table.
# - SQS: A message arrives in a queue.
# - CloudWatch: Runs on a schedule (like an alarm clock).

# --- DUMMY-PROOF CODE EXAMPLE (Python) ---
import json

def lambda_handler(event, context):
    # 'event' is the info that triggered the switch
    name = event.get('name', 'Stranger')
    
    return {
        'statusCode': 200,
        'body': json.dumps({'message': f'Hello {name}!'})
    }
`,
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
      title: "ECS & Fargate (The Lunchbox)",
      description:
        "Run your code inside 'Containers'. It's like putting your lunch in a box so it doesn't get messy, no matter who carries it.",
      steps: [
        {
          title: "ECS vs Fargate vs EKS",
          explanation:
            "You have your lunchbox (the Container). Now, how do you want to manage it?",
          text: `
1. ECS (Elastic Container Service): "The AWS Way."
   - Easy to use. Built by AWS.
   - Launch Type 1: EC2. You manage the computers that carry the lunchboxes.
   - Launch Type 2: FARGATE. You just give AWS the lunchbox. No computers to see! (Serverless).

2. FARGATE: "The Lazy/Smart Way."
   - You don't want to see or touch servers.
   - You pay for how big your lunchbox is and how long it stays.

3. EKS (Elastic Kubernetes Service): "The Famous Way."
   - Use this if you already use 'Kubernetes' at your other job. 
   - More complicated but very popular.

4. ECR (The Fridge): 
   - This is where you store your lunchboxes (Docker images) until you are ready to use them.

EXAM DECISION TREE:
- "Don't want to manage servers/EC2?" -> Pick FARGATE.
- "Need full control of the computer?" -> Pick ECS with EC2.
- "Word 'Kubernetes' appears?" -> Pick EKS.
- "Where to store images?" -> Pick ECR.
`,
        },
      ],
    },
  },
];

// Storage Group
// Storage Group (The Closets)
const storageTopics: AWSTopic[] = [
  {
    id: "s3",
    label: "S3",
    icon: HardDrive,
    href: "/aws-saa?topic=s3",
    content: {
      title: "Amazon S3 (The Infinite Bucket)",
      description:
        "A giant warehouse for your files. It has 11 nines durability (99.999999999%), which means even if you have a billion files, you might lose one once every 10,000 years.",
      steps: [
        {
          title: "S3 Storage Classes (Picking the right shelf)",
          explanation:
            "S3 has different 'shelves'. Put your stuff on the cheaper ones if you don't need them often.",
          text: `
1. S3 STANDARD: "The Front Row."
   - For things you grab every day.
   - 99.99% available. Use: Websites, active files.

2. S3 STANDARD-IA: "The Garage." (Infrequent Access)
   - For things you grab once a month.
   - Cheaper to store, but you pay a fee to grab the file.
   - Min storage: 30 days.

3. S3 ONE ZONE-IA: "The Unsafe Garage."
   - Like IA, but only in ONE building. If that building burns down, your data is gone.
   - 20% cheaper than normal IA.

4. S3 GLACIER INSTANT: "The Freezer."
   - Grab stuff in milliseconds. Min storage: 90 days.

5. S3 GLACIER FLEXIBLE: "The Basement."
   - Retrieval times: 
     - Expedited (1-5 min)
     - Standard (3-5 hours)
     - Bulk (5-12 hours)

6. S3 GLACIER DEEP ARCHIVE: "The Underground Vault."
   - Cheapest storage in all of AWS!
   - Standard takes 12 hours to get stuff. Bulk takes 48 hours.
   - Min storage: 180 days.

7. INTELLIGENT-TIERING: "The Smart Robot."
   - Moves your files between shelves automatically based on how often you touch them. No retrieval fees!

EXAM TIP:
- "Need cheapest and can wait 12 hours?" -> Deep Archive.
- "Unknown access pattern?" -> Intelligent-Tiering.
`,
        },
        {
          title: "S3 Security & Encryption (Locking the Bucket)",
          explanation:
            "S3 security uses Policies (who can enter) and Encryption (scrambling the data).",
          code: `# --- S3 SECURITY (The Gatekeeper) ---

# BUCKET POLICIES: 
# A JSON note on the bucket saying "Only John can enter" 
# or "Make this public so the whole world can see."

# BLOCK PUBLIC ACCESS: 
# A giant 'Master Lock' at the account level that prevents 
# you from accidentally making your files public.

# --- S3 ENCRYPTION (The Secret Code) ---

# 1. SSE-S3: "The AWS Lock."
# AWS handles the keys. You don't do anything. (AES-256).

# 2. SSE-KMS: "The Logbook Lock."
# AWS handles the keys, but you get a list of who used the key.
# Use for: Audit requirements.

# 3. SSE-C: "The Customer's Lock."
# YOU give AWS the key to lock the door. AWS does NOT store your key.

# 4. CLIENT-SIDE: "Locked before leaving home."
# You scramble the data on your own computer BEFORE uploading it.
# AWS never sees the real data.
`,
          language: "json",
        },
        {
          title: "S3 Advanced Features (Cool Tricks)",
          explanation:
            "S3 can do a lot more than just hold files. Know these terms for the exam!",
          text: `
VERSIONING: "The Undo Button."
- Keeps old versions of a file. 
- If you delete a file, it just adds a "Delete Marker." You can bring it back!

LIFECYCLE RULES: "The Automatic Mover."
- "Move to IA after 30 days, move to Glacier after 90 days, delete after 365 days."

REPLICATION: "The Copy Cat."
- CRR (Cross-Region): Copy to a different city for safety.
- SRR (Same-Region): Copy to the same city (for logs).
- Needs Versioning to be ON.

PRESIGNED URLs: "The Temporary Pass."
- Give someone a secret link to a private file that only works for 1 hour.

TRANSFER ACCELERATION: "The Fast Lane."
- Use AWS's private fast roads to upload files from far away.

MULTIPART UPLOAD: "The Lego Method."
- Break a big file into small pieces to upload. 
- MUST use for files > 5 GB. Recommended for > 100 MB.

S3 SELECT: "The Search Tool."
- Use SQL to grab only 1 row out of a huge file. Much faster and cheaper!
`,
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
      title: "EBS & EFS (Hard Drives)",
      description:
        "EBS is like a USB stick for one computer. EFS is like a shared folder for everyone.",
      steps: [
        {
          title: "EBS Volume Types (Which Disc?)",
          explanation:
            "EBS is block storage. You need to know which type to buy for your EC2 computer.",
          text: `
SSD (Fast, for random work):
1. gp3 / gp2: "The Daily Driver."
   - gp3 is newer and lets you set speed (IOPS) separately.
   - Use: Booting up computers, normal work.
2. io1 / io2: "The Race Car." (Provisioned IOPS)
   - Very expensive. Up to 256,000 IOPS.
   - Use: Big, heavy databases (Oracle, SAP).

HDD (Slow, for big straight files):
3. st1: "The Big Truck." (Throughput Optimized)
   - Use: Big Data, Log processing.
4. sc1: "The Cold Truck."
   - Cheapest HDD for things you don't look at often.

--- EBS vs EFS vs Instance Store ---

EBS: "The USB Stick."
- Stays in ONE building (AZ).
- Plugs into ONE computer.
- Data stays if you turn off the computer.

EFS: "The Shared Folder."
- Works for hundreds of Linux computers at once.
- Works across multiple buildings (AZs).
- Expensive, but very flexible.

INSTANCE STORE: "The Desktop."
- Physically attached to the computer. FASTEST speed.
- EPHEMERAL: If you STOP the computer, the data is WIPED. 
- Use: Temporary cache only.

EXAM TIPS:
- "Shared storage for Linux?" -> EFS.
- "Highest speed but data can be lost?" -> Instance Store.
- "Database needs 100,000 IOPS?" -> io2.
`,
        },
      ],
    },
  },
];

// Networking Group
// Networking Group (The Roads)
const networkingTopics: AWSTopic[] = [
  {
    id: "vpc",
    label: "VPC",
    icon: Network,
    href: "/aws-saa?topic=vpc",
    content: {
      title: "VPC (Virtual Private Cloud)",
      description:
        "Your private land in the AWS city. You decide who can walk in and who has to stay outside.",
      steps: [
        {
          title: "VPC Architecture (The Neighborhood)",
          explanation:
            "A VPC is your fenced-in neighborhood. You divide it into smaller sections called Subnets.",
          text: `
VPC COMPONENTS

VPC: Your private land.
- Spans the whole city (Region).
- CIDR block: The range of "Phone Numbers" (IPs) for your neighborhood (e.g., 10.0.0.0/16).
- Max 5 VPCs per city.

SUBNETS: Smaller streets inside your land.
- Stays in ONE building (AZ).
- PUBLIC SUBNET: Connected to the internet. (Front Yard).
- PRIVATE SUBNET: Hidden from the internet. (Secret Backyard).

INTERNET GATEWAY (IGW): The Main Gate.
- Only ONE per VPC. 
- Allows your front yard (Public Subnet) to talk to the world.

NAT GATEWAY: The One-Way Mirror.
- Put this in the PUBLIC subnet.
- Lets your Backyard (Private Subnet) computers download updates from the internet, but stops strangers from looking inside.

ROUTE TABLE: The GPS.
- Tells data where to go. 
- "If you want to go to the internet (0.0.0.0/0), go through the Main Gate (IGW)."
`,
        },
        {
          title: "Security Groups vs NACLs (The Bouncers)",
          explanation:
            "There are two guards watching your neighborhood. One watches the house, one watches the whole street.",
          text: `
SECURITY GROUPS (SG): "The House Bouncer"
- Watches the Instance (the house).
- STATEFUL: If he lets you in, he remembers you and lets you back out automatically.
- Only has ALLOW rules. (Everything else is blocked by default).

NETWORK ACLs (NACL): "The Street Bouncer"
- Watches the Subnet (the whole street).
- STATELESS: He forgets who you are immediately. You need a rule to get in AND a rule to get out.
- Has ALLOW and DENY rules. (Can block a specific mean person/IP).
- Rules are checked in order (Lowest number first).

EXAM CHEAT SHEET:
- "Block a specific bad IP address?" → NACL (because it has Deny).
- "Stateful/Remembers you?" → Security Group.
- "Subnet level protection?" → NACL.
`,
        },
        {
          title: "VPC Connectivity (Connecting to others)",
          explanation: "How to talk to other neighborhoods or your old office.",
          text: `
1. VPC PEERING: "A Private Bridge."
- Connects 2 VPCs. Not transitive (If A talks to B, and B talks to C, A cannot talk to C).

2. TRANSIT GATEWAY: "The Central Hub."
- A big "Star" connection for thousands of VPCs and offices. It IS transitive.

3. VPN: "The Secret Tunnel."
- Quick to set up over the public internet. Encrypted.

4. DIRECT CONNECT (DX): "The Private Highway."
- A physical wire from your office to AWS. Not on the internet. Fast and expensive. Takes weeks to set up.

5. VPC ENDPOINTS (PrivateLink): "The Secret Basement Tunnel."
- Access S3 or DynamoDB without ever leaving your private neighborhood.
- Gateway Endpoint: Used for S3 and DynamoDB (Free!).
- Interface Endpoint: Used for everything else (Costs money).

EXAM TIPS:
- "Access S3 without internet?" → Gateway Endpoint.
- "Fastest, private physical connection?" → Direct Connect.
- "Connect 1,000 VPCs together?" → Transit Gateway.
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
      title: "Amazon Route 53 (The City Phonebook)",
      description:
        "When you type a website name, Route 53 finds the 'Phone Number' (IP) so your computer knows where to call.",
      steps: [
        {
          title: "Route 53 Routing Policies (How to send people)",
          explanation:
            "The exam loves to ask which 'Rule' to use to send people to your website.",
          text: `
1. SIMPLE: "One Name, One Number."
- No health checks. Just sends you to the server.

2. WEIGHTED: "The Percentage Rule."
- Send 80% of people to the old site and 20% to the new site. (Testing).

3. LATENCY: "The Closest Shop."
- Sends you to the building that is fastest for YOU.

4. FAILOVER: "The Emergency Backup."
- Send everyone to Building A. If Building A breaks, send everyone to Building B.

5. GEOLOCATION: "The Country Rule."
- Users in France go to the French site. Users in USA go to the English site.

6. GEOPROXIMITY: "The Bias Map."
- Send people based on map distance. You can "stretch" a region to take more traffic.

7. MULTI-VALUE: "The Healthy List."
- Returns up to 8 healthy phone numbers. It's like Simple routing but with Health Checks.

EXAM TIPS:
- "A/B Testing?" → Weighted.
- "Fastest for the user?" → Latency.
- "Disaster recovery?" → Failover.
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
      title: "Amazon CloudFront (The Convenience Stores)",
      description:
        "Instead of everyone driving to the big factory (The Origin), CloudFront puts small 'Convenience Stores' (Edge Locations) in every neighborhood.",
      steps: [
        {
          title: "CloudFront Essentials (Speeding things up)",
          explanation:
            "CloudFront caches (saves a copy) of your files at 400+ spots around the world.",
          text: `
ORIGINS: Where the real file lives.
- S3 Bucket, EC2 computer, or a Load Balancer.

OAC (Origin Access Control): "The Private Backdoor."
- Makes it so people CANNOT bypass CloudFront to talk to S3 directly. They must go through the convenience store.

CACHE BEHAVIORS:
- Path patterns: Send "/images/*" to one place and "/api/*" to another.

TTL (Time to Live):
- How long a snack stays on the convenience store shelf before it's "expired" and the store needs to get a fresh one from the factory. (Default 24 hours).

INVALIDATION: "The Trash Can."
- If you update a file and don't want to wait for TTL, you can manually "Trash" the old version so the store gets the new one immediately. (Costs money).

EXAM TIPS:
- "Speed up site globally?" → CloudFront.
- "Stop people from hitting S3 directly?" → OAC.
- "Protect against DDoS?" → CloudFront + Shield.
`,
        },
      ],
    },
  },
];
// Database Group
// Database Group (The Filing Cabinets)
const databaseTopics: AWSTopic[] = [
  {
    id: "rds",
    label: "RDS & Aurora",
    icon: Database,
    href: "/aws-saa?topic=rds",
    content: {
      title: "RDS & Aurora (The Professional Accountant)",
      description:
        "Managed databases that use tables (rows and columns). It is very organized. Use this for things that must be 100% accurate, like a bank balance.",
      steps: [
        {
          title: "RDS Overview (The Librarian)",
          explanation:
            "AWS handles the boring stuff like cleaning the floors and locking the doors. You just use the books.",
          text: `
ENGINES SUPPORTED:
- PostgreSQL, MySQL, MariaDB, Oracle, SQL Server, and Aurora.

WHY USE RDS?
- AWS does the work: Patching (updates), Backups (safety copies), and Monitoring (watching for trouble).
- Multi-AZ: Puts a copy in another building.
- Read Replicas: Makes helper assistants to answer questions faster.
- STORAGE AUTO-SCALING: The cabinet grows bigger as you add more files!
- ✗ LIMIT: You CANNOT SSH (You aren't allowed to enter the librarian's office).

RDS HIGH AVAILABILITY (Safety)

MULTI-AZ: "Disaster Recovery."
- A twin copy stays in a different building (AZ).
- SYNCHRONOUS: When you write a book, it's copied to the twin building INSTANTLY.
- FAILOVER: If building A burns down, the twin in building B takes over immediately.
- Use for: Production databases that must NEVER go down.

READ REPLICAS: "Performance."
- Up to 15 assistants who can answer questions (Read), but can't write new books.
- ASYNCHRONOUS: There is a tiny delay (a second or two) before they see the new books.
- Can be promoted to be a main librarian if needed.
- Use for: Busy sites where everyone is asking questions (Reading) at the same time.

AURORA: "The Super Librarian."
- Built by AWS. 5x faster than MySQL and 3x faster than PostgreSQL.
- Storage: Automatically grows from 10GB up to 128TB.
- 6 COPIES: Puts 6 copies of your data across 3 different buildings.
- AURORA SERVERLESS: For people who don't know how busy they will be. It grows or shrinks automatically. Pay per second.
- GLOBAL DATABASE: 1 Primary city (Write/Read) and up to 5 other cities (Read only). Very fast for global users.

EXAM TIPS:
- "Disaster recovery / Safety?" → Multi-AZ.
- "Site is slow / Need better reading speed?" → Read Replicas.
- "5x MySQL performance?" → Aurora.
- "Unpredictable traffic?" → Aurora Serverless.
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
      title: "Amazon DynamoDB (The Sticky Note Wall)",
      description:
        "A NoSQL database. No rows or columns. Just a giant wall of sticky notes. It stays fast even if you have a billion notes.",
      steps: [
        {
          title: "DynamoDB Core Concepts (How it works)",
          explanation:
            "DynamoDB is 'Serverless'. You don't manage it, you just use it. It's very fast (1 to 9 milliseconds).",
          text: `
DATA MODEL:
- Table: The Wall.
- Item: A Sticky Note.
- Attribute: The words written on the note.

PRIMARY KEY (The ID on the note):
1. Partition Key (Hash Key): A unique name (e.g., user_id).
2. Sort Key: Used to group things (e.g., timestamp).

CAPACITY MODES (How to pay):
1. PROVISIONED: You tell AWS "I expect 100 people per second." Good for predictable sites.
   - RCU: Read Capacity Unit (1 read per second).
   - WCU: Write Capacity Unit (1 write per second).
2. ON-DEMAND: You pay per note. Good for sites that get "Spiky" (random crowds).

DYNAMODB FEATURES (The Cool Stuff)

DAX (DynamoDB Accelerator): "The Turbo Charger."
- An in-memory cache. 
- Moves speed from milliseconds to MICROSECONDS (10x faster!).
- Use: For sites where speed is everything.

STREAMS: "The CCTV Camera."
- Watches the wall. If a note is added or changed, it tells a Lambda function to do something.
- Records stay for 24 hours.

GLOBAL TABLES: "The World Wall."
- Replicates your wall to different cities. 
- ACTIVE-ACTIVE: You can write a note in London and read it in New York instantly.

TTL (Time to Live): "The Self-Destruct."
- Set a timer on a note. When time is up, the note deletes itself for free.
- Use: Storing login sessions or temporary data.

EXAM TIPS:
- "Single-digit millisecond speed?" → DynamoDB.
- "Microsecond speed?" → DAX.
- "Serverless NoSQL?" → DynamoDB.
- "Auto-delete old data?" → TTL.
`,
        },
      ],
    },
  },
];

// Security Group
// Security Group (The Bouncers)
const securityTopics: AWSTopic[] = [
  {
    id: "iam",
    label: "IAM",
    icon: Lock,
    href: "/aws-saa?topic=iam",
    content: {
      title: "IAM (The Building Security)",
      description:
        "Identity and Access Management. This is how you decide who is allowed to enter your AWS house and what they can touch.",
      steps: [
        {
          title: "IAM Core Concepts (The ID Badges)",
          explanation:
            "IAM is GLOBAL. It doesn't live in just one city; it watches the whole world. It is the most important part of security.",
          code: `# --- THE IAM COMPONENTS (The People) ---

# USERS: A single person (Like "Bob" or "Alice").
# GROUPS: A team of people (Like "The Developers").
# ROLES: A temporary "Hat." 
# - A computer or a person puts on the Hat to get special power for a short time.
# POLICIES: A JSON note that says what you can and cannot do.

# --- THE GOLDEN RULES (Principles) ---
# 1. ROOT ACCOUNT: "The Master Key." Use it once to set up, then LOCK IT AWAY. Never use it for daily work.
# 2. ONE USER PER PERSON: Everyone gets their own login.
# 3. LEAST PRIVILEGE: Only give someone the keys they NEED. (Don't give the janitor the keys to the money safe).
# 4. USE ROLES: Never put secret passwords inside a computer (EC2). Give the computer a "Role" (a Hat) instead!

# --- THE JSON PERMISSION SLIP (Policies) ---
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",     # "Yes" or "No"
            "Action": [            # "What can they do?"
                "s3:GetObject"     # (e.g., Read a file)
            ],
            "Resource": "*"        # "Which file?" (* means everything)
        }
    ]
}

# --- HOW AWS DECIDES (Evaluation) ---
# 1. Start with NO. (Default is Deny).
# 2. Is there a YES? (Explicit Allow).
# 3. Is there a NO? (Explicit Deny).
# -> A "NO" ALWAYS WINS! Even if there are 100 "Yes" notes, 1 "No" note wins.

# --- THE TOOLS ---
# CREDENTIALS REPORT: A list of every person in your account and their passwords.
# ACCESS ADVISOR: Shows you which keys a person hasn't used in a long time.
# STS: Gives out "Temporary Keys" that stop working after a few hours.
# MFA: "The Second Lock." Use your phone to prove it's really you.

# EXAM TIPS:
# "Grant EC2 access to S3?" -> Give the EC2 a ROLE.
# "Cross-account access?" -> Use a ROLE and STS.
# "Temporary credentials?" -> STS.
`,
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
      title: "AWS Security Services (The Bodyguards)",
      description:
        "AWS has many different guards. You need to know which guard to call for which emergency.",
      steps: [
        {
          title: "Security Overview (Which Guard?)",
          explanation:
            "The exam will give you a problem and ask you to pick the right service name.",
          text: `
KMS (Key Management Service): "The Key Jar."
- Used to lock (Encrypt) your data. 
- You can see a logbook (CloudTrail) of every time a key was used.
- Use: Lock your S3 files, EBS drives, or Databases.

ACM (Certificate Manager): "The Website ID."
- Provides SSL/TLS certificates (The green lock in your browser).
- Makes your site use HTTPS.

WAF (Web Application Firewall): "The Smart Filter."
- Stands at the door (ALB or CloudFront) and looks at the visitors.
- It blocks "Bad Robots," hackers, or people from specific countries.
- Protects against SQL Injection and XSS (Hacker tricks).

AWS SHIELD: "The Tank."
- Protects against DDoS (When millions of fake people try to crash your site).
- Shield Standard: Free for everyone.
- Shield Advanced: $3,000 a month. Includes a 24/7 emergency response team.

GUARD DUTY: "The Detective."
- Uses AI to watch your account for "Strange Behavior."
- It can tell if someone is secretly using your computers to mine Bitcoin.

AWS INSPECTOR: "The Health Checkup."
- Looks at your computers (EC2) and containers to see if they have "Weak Spots" (Vulnerabilities).

AWS MACIE: "The Privacy Expert."
- Looks inside your S3 buckets to find "Secret Info" like Credit Card numbers or Home Addresses (PII).
- It alerts you so you can hide that data.

SECRETS MANAGER: "The Rotating Safe."
- A place to store your Database Passwords.
- It can automatically CHANGE the password every 30 days so hackers can't use old ones.

EXAM QUICK REFERENCE:
- "Encryption / Keys?" -> KMS.
- "Filter bad web traffic / SQL Injection?" -> WAF.
- "Stop DDoS attacks?" -> Shield.
- "Threat detection / Bitcoin mining?" -> GuardDuty.
- "Weak spots in EC2?" -> Inspector.
- "Find PII / Secret data in S3?" -> Macie.
- "Store and Rotate passwords?" -> Secrets Manager.
`,
        },
      ],
    },
  },
];

// Architecture Group
// Architecture Group (The Blueprints)
const architectureTopics: AWSTopic[] = [
  {
    id: "well-architected",
    label: "Well-Architected",
    icon: Cloud,
    href: "/aws-saa?topic=well-architected",
    content: {
      title: "AWS Well-Architected Framework (The 6 Pillars)",
      description:
        "The 6 golden rules for building a great house in AWS. If you follow these, your house won't fall down.",
      steps: [
        {
          title: "The 6 Rules for Building Well",
          explanation:
            "AWS uses these 6 pillars to decide if your application is 'Good' or 'Bad'. The exam will ask you which pillar a service belongs to.",
          text: `
1. OPERATIONAL EXCELLENCE: "How well do you run the shop?"
   - Use code to build things (IaC), so you don't make mistakes.
   - Make small changes, not big scary ones.
   - Services: CloudFormation (The Blueprints), Config (The Rulebook), CloudWatch (The Watchman).

2. SECURITY: "How well do you lock the doors?"
   - Everyone needs an ID badge (IAM).
   - Record everything that happens (CloudTrail).
   - Scramble your data so no one can read it (KMS/Encryption).
   - Services: IAM, KMS, Shield, WAF, GuardDuty.

3. RELIABILITY: "Can you survive a disaster?"
   - If one building burns down, the other building takes over.
   - Stop guessing how many visitors you will have (Use Auto-Scaling).
   - Services: Auto Scaling, Multi-AZ (Two buildings), Route 53 (The Switch).

4. PERFORMANCE EFFICIENCY: "Are you using your tools well?"
   - Use 'Serverless' so you don't waste time fixing computers.
   - Go global in minutes using CloudFront.
   - Services: Lambda, CloudFront, ElastiCache (The Speed Booster).

5. COST OPTIMIZATION: "Are you wasting money?"
   - Only pay for what you actually use.
   - Use 'Spot Instances' for a 90% discount.
   - Services: Spot Instances, Reserved Instances, S3 Storage Tiers.

6. SUSTAINABILITY: "Are you being nice to the planet?"
   - Don't leave the lights on if no one is in the room.
   - Use shared services so you don't waste energy.

EXAM TIP: 
If the question says "What is the AWS best practice?", think:
"Is it safe? Is it cheap? Does it stay up if a building breaks?"
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
      title: "Common Architecture Patterns (The Blueprints)",
      description:
        "The most famous ways to connect your AWS services together. Think of these as 'Recipes' for a website.",
      steps: [
        {
          title: "The 3 Main Recipes",
          explanation:
            "You need to know how these services talk to each other to pass the exam.",
          text: `
1. THE 3-TIER WEB ARCHITECTURE (The Classic Restaurant)
   - Step 1: User types the name (Route 53) and gets a copy of the site (CloudFront).
   - Step 2: The Traffic Cop (ALB) stands in the Public Front Yard.
   - Step 3: The Workers (EC2 in an ASG) hide in the Private Backyard.
   - Step 4: The Database (RDS Multi-AZ) is locked in a private vault at the very back.
   - KEY: Everything is in at least TWO buildings (AZs) for safety.

2. THE SERVERLESS ARCHITECTURE (The Vending Machine)
   - Step 1: User looks at a static site in an S3 Bucket.
   - Step 2: User clicks a button, which talks to the API Gateway.
   - Step 3: API Gateway calls a Lambda function (The Worker).
   - Step 4: Lambda grabs or saves data to DynamoDB.
   - BENEFIT: You don't manage any servers. You only pay when someone clicks a button!

3. EVENT-DRIVEN ARCHITECTURE (The Post Office)
   - Step 1: Something happens (e.g., A photo is uploaded to S3).
   - Step 2: S3 tells a Lambda function to process it.
   - Step 3: If the Lambda is busy, it puts a note in SQS (The Waiting Room/Queue).
   - Step 4: Another Lambda picks up the note and saves it to a Database.
   - Step 5: SNS sends an email to the user saying "Your photo is ready!"

EXAM PATTERNS (Keywords to look for):
- "Decouple / Disconnect the parts" -> Use SQS (The Waiting Room).
- "Serverless / No servers" -> Use S3 + API Gateway + Lambda.
- "Real-time streaming data" -> Kinesis.
- "Batch processing / Non-urgent" -> SQS + Lambda.
- "Notification / Fan-out to many people" -> SNS.
- "Orchestrate / Step-by-step workflow" -> Step Functions.
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
