import { service } from "./helpers";

export const elasticache = service({
  id: "elasticache", num: 22, title: "ElastiCache", short: "ElastiCache", category: "Database",
  tagline: "A memory notepad that makes databases feel instant.",
  imagine: "Imagine keeping the most asked answers on a sticky note on your desk instead of walking to the archive each time. ElastiCache is that sticky note for your app.",
  what: ["ElastiCache keeps popular data in fast memory so the database is asked less.", "Reading from memory is thousands of times faster than from a disk. The app asks the cache first, and only if it does not know does it ask the database.", "Managed **Redis** or **Memcached**. Redis: persistence, replication, Multi-AZ, data structures, pub/sub. Memcached: simple, multi-threaded, no persistence."],
  nodes: "a:server:App@0,1 | c:cache:ElastiCache:in memory@3,1* | d:db:Database:RDS@6,1",
  links: "a>c:ask first, ~c>d:only if missing",
  how: ["Hit: answer comes from memory. Miss: fetch from the database and keep a copy.", "This pattern is called **cache-aside**. Popular items stay in the cache, so most requests never touch the database.", "TTLs and eviction policies (LRU). Redis Cluster mode for sharding. Also used for session storage and leaderboards. Redis AUTH and in-transit encryption."],
  use: ["Use it to speed up read-heavy apps and reduce database cost.", "The cache can lose data, so never treat it as the only copy.", "'Reduce database load', 'sub-millisecond', 'session store' → ElastiCache. Need persistence / HA → Redis."],
  chaos: ["Wipe the cache", "c", "The cache is empty, so everything goes to the database. **Slower, but still correct.**"],
  quiz: [["Need data structures, persistence and Multi-AZ failover?", ["Redis", "Memcached", "S3", "SQS"], 0, "**Redis** supports those; Memcached does not."], ["Cache-aside means…", ["App checks cache, then DB on a miss", "DB writes to cache first", "Cache replaces DB", "Only writes"], 0, "The app **checks cache first**, then the DB."], ["Best for a session store?", ["ElastiCache", "Glacier", "EBS", "Snowball"], 0, "In-memory = fast sessions."]],
});

export const redshift = service({
  id: "redshift", num: 23, title: "Redshift: data warehouse", short: "Redshift", category: "Analytics",
  tagline: "A giant database built to answer big business questions.",
  imagine: "Imagine a huge library where every book is arranged to make summaries quick, like 'how many shirts sold per city last year'. Redshift is that library for business data.",
  what: ["Redshift stores huge amounts of data so you can run big reports quickly.", "Normal databases are good at small, fast updates. **Redshift** is good at reading millions of rows to answer questions like totals and averages for dashboards.", "Columnar, MPP **data warehouse** (PostgreSQL-compatible SQL). Leader node + compute nodes, RA3 with managed storage, Redshift Serverless, Spectrum to query S3, concurrency scaling."],
  nodes: "s:bucket:S3 data@0,0 | a:db:Source databases@0,2 | r:db:Redshift:warehouse@3,1* | b:monitor:BI dashboard@6,1",
  links: "s>r:load, a>r:load, r>b:SQL",
  how: ["Load data in, then run heavy SQL across many machines at once.", "Data is stored by column and spread over many nodes. A query is split among them and combined, so big reports finish fast.", "COPY from S3, Spectrum for external tables, materialized views, snapshots to S3, cross-Region copy, Multi-AZ for RA3. OLAP, not OLTP."],
  use: ["Use it for analytics, reporting and business intelligence on large data.", "For an app's everyday reads and writes use RDS or DynamoDB. For quick one-off queries on S3 use Athena.", "'Data warehouse', 'OLAP', 'complex joins on petabytes' → Redshift."],
  quiz: [["Petabyte-scale analytics with complex SQL joins?", ["Redshift", "DynamoDB", "ElastiCache", "SQS"], 0, "**Redshift** is the data warehouse."], ["Query data in S3 from Redshift without loading?", ["Spectrum", "Snowball", "DAX", "Kinesis"], 0, "**Redshift Spectrum**."], ["Redshift is best for…", ["OLAP", "OLTP", "Caching", "Messaging"], 0, "Analytics (**OLAP**)."]],
});

export const athena = service({
  id: "athena", num: 24, title: "Athena: query files with SQL", short: "Athena", category: "Analytics",
  tagline: "Ask questions of files in S3 with plain SQL, no servers.",
  imagine: "Imagine pointing at a stack of spreadsheets in a cupboard and asking a question out loud, getting the answer without opening each one. Athena does that for files in S3.",
  what: ["Athena lets you run SQL directly on files stored in S3.", "No database to set up. You point Athena at your files (CSV, JSON, Parquet) and write a query. You pay per amount of data scanned.", "Serverless interactive query service (Presto / Trino). Uses the **Glue Data Catalog** for table definitions. Columnar formats (Parquet / ORC), partitioning and compression cut cost."],
  nodes: "u:user:Analyst@0,1 | a:lambda:Athena:SQL query@3,1* | s:bucket:S3 files:CSV / Parquet@6,1 | g:table:Glue catalog:table schemas@3,2",
  links: "u>a:SELECT ..., a>s:reads files, ~a>g",
  how: ["You write SQL, Athena reads the files and returns the answer.", "Because you pay by data scanned, smaller columnar files and partitions (like by date) make queries cheaper and faster.", "Federated queries to other sources, workgroups for cost control, results saved to S3, integrates with QuickSight. Good for logs (CloudTrail, ALB, VPC Flow Logs)."],
  use: ["Use it for quick analysis of logs and data already in S3.", "Heavy repeated dashboards over huge data may fit Redshift better.", "'Query S3 with SQL, serverless' → Athena."],
  quiz: [["Query S3 logs with SQL, no servers?", ["Athena", "RDS", "EMR only", "Aurora"], 0, "**Athena** is serverless SQL on S3."], ["How is Athena billed?", ["Per data scanned", "Per hour", "Per user", "Flat"], 0, "Per **TB scanned**."], ["Cut Athena cost by…", ["Using Parquet and partitions", "Using bigger CSVs", "Adding EBS", "Using NAT"], 0, "Columnar + partitioned data scans less."]],
});

export const glue = service({
  id: "glue", num: 25, title: "Glue: clean and move data", short: "Glue", category: "Analytics",
  tagline: "Finds, cleans and reshapes data so it is ready to use.",
  imagine: "Imagine a helper who collects messy papers from many drawers, tidies them and files them neatly so anyone can find what they need. That is Glue.",
  what: ["Glue prepares data: it finds it, cleans it and moves it where it is needed.", "Data lives in many places in many shapes. **Glue** crawls it, writes down what is in it (a catalogue), and runs jobs to clean and convert it.", "Serverless **ETL** (extract, transform, load) using Spark. **Crawlers** populate the **Data Catalog**. Glue Studio, DataBrew, job bookmarks, triggers and workflows."],
  nodes: "a:db:Raw data@0,1 | c:monitor:Crawler:finds schemas@2,0 | g:lambda:Glue job:clean + convert@3,1* | t:table:Data Catalog@4,0 | p:bucket:Clean data:Parquet in S3@6,1",
  links: "a>c, c>t, a>g:extract, g>p:load, ~t>g",
  how: ["Crawl to learn the data, then run a job to clean and save it neatly.", "The result is stored in a friendly format (like Parquet) and registered in the catalogue so Athena, Redshift and EMR can use it.", "Pay per DPU-hour. Glue Schema Registry, streaming ETL, Python shell jobs. Catalog is a Hive metastore replacement."],
  use: ["Use it to build data pipelines and a data lake catalogue.", "For simple copy jobs between databases consider DMS.", "'ETL', 'data catalog', 'serverless Spark' → Glue."],
  quiz: [["Serverless ETL service?", ["Glue", "Kinesis", "SQS", "CloudFront"], 0, "**AWS Glue**."], ["What do crawlers do?", ["Discover schemas into the Data Catalog", "Crawl websites", "Scale servers", "Encrypt data"], 0, "They populate the **Data Catalog**."], ["Which services read the Glue Data Catalog?", ["Athena and Redshift Spectrum", "Route 53", "IAM", "WAF"], 0, "Athena, Redshift Spectrum and EMR."]],
});

export const kinesis = service({
  id: "kinesis", num: 26, title: "Kinesis: live data streams", short: "Kinesis", category: "Analytics",
  tagline: "A conveyor belt for data that never stops arriving.",
  imagine: "Imagine a river of data (clicks, sensor readings) flowing past. Kinesis lets you catch and use it while it flows instead of waiting for the end of the day.",
  what: ["Kinesis collects and processes data the moment it is created.", "Websites, phones and sensors produce data every second. **Kinesis Data Streams** takes it in, keeps it for a while, and lets several apps read it in order.", "**Data Streams** (shards, 1 MB/s in per shard, 24 h–365 d retention), **Data Firehose** (load to S3 / Redshift / OpenSearch, near-real-time), **Data Analytics / Managed Flink**."],
  nodes: "p:user:Phones + sensors@0,1 | k:queue:Kinesis stream:shards@3,1* | a:lambda:Live dashboard@6,0 | f:bucket:Firehose to S3@6,2",
  links: "p>k:events, k>a:read live, k>f:store",
  how: ["Producers put records on the stream; consumers read them in order.", "The stream is split into **shards** so it can handle huge volume. Data stays for a set time so a late reader can still catch up.", "Partition key decides the shard. KCL consumers, enhanced fan-out. Firehose needs no code and can transform with Lambda."],
  use: ["Use it for real-time analytics, logs, clickstreams and IoT.", "For simple work queues, SQS is easier. For ordered replayable streams, Kinesis.", "'Real-time streaming' → Kinesis. 'Load streaming data into S3 with no code' → Firehose."],
  quiz: [["Load streaming data into S3 with no consumer code?", ["Data Firehose", "Data Streams", "SQS", "Glue"], 0, "**Firehose** delivers automatically."], ["Throughput of a Kinesis stream scales with…", ["Shards", "AZs", "Tags", "Buckets"], 0, "More **shards** = more throughput."], ["Real-time clickstream analytics?", ["Kinesis", "Glacier", "Snowball", "EFS"], 0, "**Kinesis**."]],
});

export const opensearch = service({
  id: "opensearch", num: 27, title: "OpenSearch: search and logs", short: "OpenSearch", category: "Analytics",
  tagline: "Google-style search inside your own app and logs.",
  imagine: "Imagine the search box on a shopping site that finds products even if you misspell a word. OpenSearch builds that kind of search.",
  what: ["OpenSearch makes a lot of text and logs searchable in a flash.", "It reads documents and builds an index, so searching for a word is instant, even with millions of items. It is also popular for looking through logs.", "Managed OpenSearch / Elasticsearch clusters, Dashboards (Kibana-like), Serverless option, UltraWarm / cold storage tiers, fine-grained access control, Multi-AZ."],
  nodes: "a:server:App + logs@0,1 | o:db:OpenSearch:search index@3,1* | u:user:Search box@6,1",
  links: "a>o:index docs, u>o:search",
  how: ["Send documents in, search them back in milliseconds.", "Each document is split into words and indexed. A search looks words up in the index rather than reading every document.", "Index, shards and replicas, mappings, full-text analyzers, aggregations. Common pipeline: CloudWatch Logs / Kinesis Firehose → OpenSearch → Dashboards."],
  use: ["Use it for site search, log analytics and observability.", "Not a primary database: keep the real data in RDS or DynamoDB.", "'Full-text search', 'log analytics' → OpenSearch."],
  quiz: [["Add fast full-text search to a website?", ["OpenSearch", "Athena", "Glacier", "SQS"], 0, "**OpenSearch** is search and log analytics."], ["Common log pipeline?", ["Firehose to OpenSearch", "SES to EBS", "NAT to IGW", "KMS to S3"], 0, "Logs flow via **Firehose** into OpenSearch."], ["OpenSearch is a primary system of record?", ["Yes", "No, usually a secondary index", "Only in Serverless", "Always"], 1, "Keep truth in a database."]],
});

export const dms = service({
  id: "dms", num: 28, title: "DMS: move databases", short: "DMS", category: "Database",
  tagline: "Copies a database to AWS with almost no downtime.",
  imagine: "Imagine moving house while still living in it: your things are copied across room by room and the last step is a quick switch. DMS moves databases like that.",
  what: ["DMS copies your database into AWS while the old one keeps running.", "It first copies everything, then keeps copying every new change until you are ready to switch. Downtime can be just minutes.", "**Database Migration Service**: source → replication instance → target. Full load + **CDC**. Homogeneous (same engine) or heterogeneous (use **SCT** to convert the schema first)."],
  nodes: "o:db:Old database:on-premises@0,1 | d:box:DMS:replication@3,1* | n:db:New database:Aurora / RDS@6,1",
  links: "o>d:full load + changes, d>n",
  how: ["Copy everything, then keep syncing changes until cut-over.", "Your app keeps using the old database. When the new one is fully in sync, you point the app at it and turn the old one off.", "Replication instance (Multi-AZ), endpoints, tasks, validation. Supports continuous replication to S3, Kinesis, Redshift, DynamoDB. SCT converts Oracle → PostgreSQL etc."],
  use: ["Use it to migrate databases to AWS or to replicate continuously.", "Different engine? Run SCT first to convert the schema.", "'Migrate with minimal downtime' → DMS (CDC)."],
  quiz: [["Migrate Oracle to Aurora PostgreSQL with minimal downtime?", ["DMS with SCT", "S3 sync", "Snowball only", "Storage Gateway"], 0, "**DMS + SCT** handle data and schema."], ["CDC stands for…", ["Change data capture", "Cloud data copy", "Central DB cache", "Cross-DC"], 0, "**Change data capture**."], ["DMS needs…", ["A replication instance", "A VPC peering only", "A NAT only", "Route 53"], 0, "It runs on a **replication instance**."]],
});

export const snow = service({
  id: "snow", num: 29, title: "Snow Family", short: "Snow Family", category: "Storage",
  tagline: "Rugged boxes you fill with data and ship to AWS.",
  imagine: "Imagine sending a huge pile of files by truck instead of the internet because the internet would take months. Snowball is that truck for data.",
  what: ["Snow devices are physical boxes for moving huge data to AWS.", "Uploading 100 TB over a slow link can take months. AWS ships you a rugged box. You copy data onto it and send it back, and AWS loads it into S3.", "**Snowcone** (8–14 TB), **Snowball Edge** (storage 80 TB, compute-optimised), **Snowmobile** (up to 100 PB truck, being retired). Also run EC2 / Lambda at the edge."],
  nodes: "o:server:Your site@0,1 | s:disk:Snowball:rugged box@3,1* | a:bucket:S3 in AWS@6,1",
  links: "o>s:copy data, s>a:shipped back",
  how: ["Copy to the box, ship it, AWS imports it into S3.", "The data is encrypted on the box. Once AWS gets it back, the data appears in your S3 bucket and the box is wiped.", "Rule of thumb: if the transfer takes over a week on your link, use Snow. DataSync suits online transfers. Edge compute for disconnected sites."],
  use: ["Use it for huge one-time moves or sites with poor internet.", "If you have good bandwidth, use DataSync or Direct Connect.", "'Petabytes, limited bandwidth' → Snowball / Snowmobile."],
  quiz: [["Move 80 TB with a slow link?", ["Snowball Edge", "VPN", "CloudFront", "EFS"], 0, "**Snowball Edge** ships data physically."], ["Is data on a Snow device encrypted?", ["Yes", "No", "Only Snowcone", "Only Snowmobile"], 0, "Always **encrypted**."], ["Process data at a remote site with no internet?", ["Snowball Edge compute", "Route 53", "CloudFront", "SES"], 0, "Edge devices run **EC2 / Lambda**."]],
});

export const backup = service({
  id: "backup", num: 30, title: "AWS Backup", short: "Backup", category: "Management",
  tagline: "One place to schedule and store backups of everything.",
  imagine: "Imagine one assistant who takes a photo of all your important papers every night and keeps the photos safe. AWS Backup does that for your databases, disks and files.",
  what: ["AWS Backup runs backups for many services from a single place.", "Instead of setting up backups separately for each service, you write one **backup plan** (when, how long to keep) and it covers EBS, RDS, DynamoDB, EFS and more.", "Centralised, policy-based backup. **Backup plans**, **vaults** (with **Vault Lock** WORM), cross-Region and cross-account copy, tag-based assignment, restore testing."],
  nodes: "r:db:RDS@0,0 | e:disk:EBS@0,1 | d:table:DynamoDB@0,2 | b:box:AWS Backup:one plan@3,1* | v:bucket:Backup vault:locked copy@6,1",
  links: "r>b, e>b, d>b, b>v:scheduled",
  how: ["One plan picks resources by tag and stores the backups in a vault.", "You can copy the backups to another Region or account so one disaster or hacked account cannot destroy them.", "Lifecycle to cold storage, compliance reporting, Vault Lock prevents deletion even by admins. Integrates with Organizations."],
  use: ["Use it for consistent backups and compliance across many services.", "It is the answer when you need a central, auditable backup policy.", "'Centrally manage backups', 'cross-Region copy', 'immutable backups' → AWS Backup."],
  quiz: [["Centrally manage backups across EBS, RDS and DynamoDB?", ["AWS Backup", "CloudTrail", "Config", "Inspector"], 0, "**AWS Backup**."], ["Make backups impossible to delete?", ["Vault Lock", "MFA only", "Tags", "KMS"], 0, "**Vault Lock** gives WORM protection."], ["Protect against Region failure?", ["Cross-Region copy", "Bigger disk", "Snapshots in same AZ", "More tags"], 0, "Copy backups to **another Region**."]],
});

export const ses = service({
  id: "ses", num: 31, title: "SES: send email", short: "SES", category: "Integration",
  tagline: "Send lots of emails cheaply from your app.",
  imagine: "Imagine a post office that sends your newsletters and receipts for you, and tells you which ones bounced. SES is that post office.",
  what: ["SES sends emails for your app: receipts, resets, newsletters.", "Sending email yourself often lands in spam. **SES** is a trusted email sender. You verify your domain, send through an API or SMTP, and see which emails bounced or were reported.", "Email sending and receiving service. Verified identities, DKIM / SPF / DMARC, sandbox until production access, configuration sets with SNS / Kinesis event destinations, dedicated IPs."],
  nodes: "a:server:Your app@0,1 | s:topic:SES:sends mail@3,1* | u:user:Customer inbox@6,1",
  links: "a>s:API / SMTP, s>u:email",
  how: ["Your app hands emails to SES; SES delivers and reports problems.", "Bounces and complaints are sent back to you (through SNS), so you can stop mailing bad addresses and keep a good sender reputation.", "New accounts start in the **sandbox** (limited). Reputation dashboard, suppression list, email receiving rules to S3 / Lambda / SNS."],
  use: ["Use it for transactional and marketing email at low cost.", "Need SMS or push? Use SNS or Pinpoint.", "'Send emails from an application' → SES."],
  quiz: [["Send order-confirmation emails from an app?", ["SES", "SQS", "Route 53", "KMS"], 0, "**SES** sends email."], ["Handle bounces and complaints?", ["SNS notifications from SES", "CloudFront", "Snowball", "EBS"], 0, "Send events to **SNS**."], ["New SES accounts start in…", ["Sandbox", "Production", "Glacier", "VPC"], 0, "The **sandbox**."]],
});
