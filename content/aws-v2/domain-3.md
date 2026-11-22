<callout icon="🧒" color="blue_bg">
<b>Like I'm 5:</b> Same food, but one restaurant serves in 5 minutes and another in 50. This chapter is about picking the right storage, workers, registers and roads so your app is fast.
</callout>

## 3.1 High-performing and scalable storage

Topics to cover, in this order:

1. Block vs file vs object storage
2. EBS volume types (gp3, io2, st1, sc1), IOPS vs throughput, instance store
3. EFS (performance and throughput modes, storage classes)
4. FSx family (Windows, Lustre, NetApp ONTAP, OpenZFS)
5. S3 performance (prefixes, multipart upload, Transfer Acceleration, byte-range fetches)
6. Hybrid storage (Storage Gateway types)

---

### 86. Choosing block, file, or object storage (Domain 3.1)

🧒 LIKE I'M 5<br />A school stores notebooks on shelves, shared files in a common cupboard, and loose documents in a warehouse. AWS storage types work in similar ways.

📖 EXPLAINED SIMPLY

- <b>Block storage</b> splits data into fixed-size blocks. A server sees it like a disk.
- Amazon EBS is block storage for EC2. It suits operating systems, databases, and applications needing low-latency disk access.
- <b>File storage</b> organizes data in folders and files. Multiple servers can share the same file system.
- Amazon EFS provides managed NFS file storage. Amazon FSx provides managed file systems for specific workloads.
- <b>Object storage</b> stores whole objects with data, metadata, and a key. Amazon S3 is the main AWS object storage service.
- Objects are accessed through APIs, not mounted as a normal block disk. S3 suits backups, media, data lakes, and static assets.
- Choose block when an application needs disk-like access. Choose file when many clients share files. Choose object for huge scale and durable object access.
- Storage type affects access pattern, latency, sharing, and cost. Do not choose by capacity alone.
- EBS is attached to an instance or supported service. EFS and S3 are accessed over network APIs or protocols.
- A single application may use all three: EBS for database disks, EFS for shared uploads, and S3 for archives.

📚 JARGON BOX

- Block → Fixed-size storage unit presented like a disk.
- File system → Organizes data into folders and files.
- Object → Data plus metadata stored under a key.
- NFS → Network File System protocol for shared file access.
- Latency → Time needed to complete an operation.
- Metadata → Information describing stored data.

⚖️ COMPARE WITH LOOKALIKES

| Type | AWS examples | Access style | Typical use |
| --- | --- | --- | --- |
| Block | EBS | Disk volume | OS and database |
| File | EFS, FSx | Shared file path | Shared folders and enterprise apps |
| Object | S3 | API/object key | Media, backups, data lakes |

🎯 EXAM LENS

- "EC2 boot volume or database disk" → EBS.
- "Linux shared file system across instances" → EFS.
- "Store backups and static media at massive scale" → S3.
- "Windows shared folders" → FSx for Windows File Server.

🪤 TRAPS

- S3 is not a normal mounted block disk.
- EBS is not automatically shared across many instances.
- EFS is file storage, not object storage.
- File and object access patterns are different.

📝 PRACTICE QUESTION<br />Several Linux EC2 instances must access the same shared directory. The company wants a managed NFS file system. What should it choose?<br />A. Amazon EFS<br />B. Amazon EBS attached separately to each instance<br />C. Amazon S3 Glacier Deep Archive<br />D. Instance store

<b>Answer: A.</b> EFS provides shared NFS file storage. Separate EBS volumes do not create one shared file system. Glacier is archive storage. Instance store is local ephemeral storage.

🔁 ONE-LINE RECAP<br />Use EBS for disk blocks, EFS/FSx for shared files, and S3 for scalable object storage.

---

### 87. EBS volume types, IOPS, throughput, and instance store (Domain 3.1)

🧒 LIKE I'M 5<br />A delivery road can carry many small bikes or a few large trucks. IOPS is how many trips happen. Throughput is how much cargo moves overall.

📖 EXPLAINED SIMPLY

- <b>Amazon EBS</b> provides persistent block storage volumes for EC2.
- <b>IOPS</b> means input/output operations per second. It measures how many read or write operations a volume can handle.
- <b>Throughput</b> measures how much data moves per second, commonly MB/s.
- <b>gp3</b> is general-purpose SSD storage. It lets you configure IOPS and throughput separately from volume size within service limits.
- <b>gp2</b> is an older general-purpose SSD. Performance is linked to volume size and burst behavior. gp3 can often lower cost for the same general-purpose need.
- <b>io2 Block Express</b> is provisioned IOPS SSD storage for demanding, high-performance workloads.
- <b>st1</b> is throughput-optimized HDD storage for frequently accessed, large sequential workloads.
- <b>sc1</b> is cold HDD storage for infrequently accessed, large sequential workloads.
- HDD volumes are not suited to small random I/O patterns like transactional databases.
- <b>Instance store</b> is temporary storage physically attached to the host. It can offer high performance but data is lost when the instance stops, terminates, or the underlying host fails.
- EBS volumes persist independently of an EC2 instance lifecycle, subject to deletion settings.
- Select a volume based on IOPS, throughput, latency, size, durability, and cost.
- For a database with many small random reads/writes, SSD is usually better. For large sequential logs, st1 may fit.
- EBS is Availability Zone-specific. A snapshot can be used to create a volume in another AZ.

📚 JARGON BOX

- IOPS → Number of read/write operations per second.
- Throughput → Amount of data moved per second.
- SSD → Solid State Drive; fast storage using flash memory.
- HDD → Hard Disk Drive; spinning magnetic disk.
- Provisioned IOPS → Paid storage performance selected in advance.
- Sequential I/O → Reading or writing data in order.
- Random I/O → Accessing different storage locations.
- Instance store → Temporary host-local storage.

⚖️ COMPARE WITH LOOKALIKES

| Type | Media | Best pattern |
| --- | --- | --- |
| gp3 | SSD | General purpose |
| io2 Block Express | SSD | Very high IOPS and critical databases |
| st1 | HDD | Large sequential throughput |
| sc1 | HDD | Infrequent sequential data |
| Instance store | Host-local | Temporary high-performance scratch data |

🎯 EXAM LENS

- "Persistent general-purpose SSD" → gp3.
- "Very high IOPS database" → io2.
- "Large sequential throughput" → st1.
- "Lowest-cost infrequently accessed HDD" → sc1.
- "Temporary data that can be rebuilt" → Instance store.
- "Data must survive instance stop" → EBS, not instance store.

🪤 TRAPS

- IOPS and throughput are not the same.
- Instance store is not durable storage.
- st1 and sc1 are not SSD choices.
- An EBS volume belongs to one AZ.

📝 PRACTICE QUESTION<br />A reporting workload reads very large files sequentially from disk. It does not need high random IOPS. Which EBS volume type is a strong fit?<br />A. st1<br />B. io2 Block Express<br />C. Instance store for permanent data<br />D. gp3 provisioned for maximum IOPS

<b>Answer: A.</b> st1 is built for throughput-focused sequential workloads. io2 targets high IOPS. Instance store is temporary. Maximum gp3 IOPS may waste money.

🔁 ONE-LINE RECAP<br />Choose EBS by IOPS and throughput: gp3 general use, io2 high IOPS, st1/sc1 sequential HDD, instance store temporary.

---

### 88. Amazon EFS performance and throughput modes (Domain 3.1)

🧒 LIKE I'M 5<br />A shared cupboard serves many classrooms. Performance depends on how quickly each person needs files and how many people open them at once.

📖 EXPLAINED SIMPLY

- <b>Amazon EFS</b> is a managed, elastic file system for Linux workloads using NFS.
- Multiple EC2 instances and supported clients can mount one EFS file system at the same time.
- EFS grows and shrinks as files are added and removed. You do not pre-provision file-system capacity.
- <b>Regional EFS</b> stores data redundantly across multiple AZs. It is the normal choice for high availability.
- <b>One Zone EFS</b> stores data in one AZ. It costs less, but availability depends on that AZ. Backups are important.
- <b>Performance modes:</b> General Purpose suits most workloads and offers lower latency. Max I/O suits workloads needing high aggregate parallel throughput, with higher latency.
- <b>Throughput modes:</b> Elastic adjusts throughput automatically. Provisioned sets throughput independently of stored size. Bursting derives throughput from stored data and accumulated credits.
- <b>Storage classes:</b> Standard for frequently accessed files. Infrequent Access (IA) and Archive reduce storage cost for colder files but add access charges and latency.
- <b>Lifecycle management</b> can move files between storage classes based on access patterns.
- EFS is designed for shared file workloads. It is not a block device for booting Windows servers.
- Use EFS for shared web content, Linux home directories, and content-processing fleets.
- Choose EBS for a single-instance block volume and FSx when a specialized file system is needed.

📚 JARGON BOX

- NFS → Network File System protocol.
- Elastic → Capacity or throughput can adjust automatically.
- Throughput → Data moved per second.
- Bursting → Performance credits accumulate and are consumed.
- IA → Infrequent Access storage class.
- One Zone → Data stored in one AZ.
- Lifecycle management → Automatically transition files as they age or are accessed.

⚖️ COMPARE WITH LOOKALIKES

| Option | Sharing | Availability | Best fit |
| --- | --- | --- | --- |
| EFS Regional | Shared file system | Multi-AZ design | Production Linux shared files |
| EFS One Zone | Shared file system | One AZ | Lower-cost workloads able to accept AZ risk |
| EBS | Block volume | AZ-specific | Instance disks |
| S3 | Object access | Regional service | Object storage and data lakes |

🎯 EXAM LENS

- "Many Linux instances mount the same file system" → EFS.
- "Elastic throughput with changing demand" → EFS Elastic throughput.
- "Lower cost and tolerate one-AZ placement" → EFS One Zone.
- "Very large parallel workload accepting higher latency" → Max I/O, when available for the required design.

🪤 TRAPS

- EFS is file storage, not block storage.
- Regional EFS and One Zone EFS have different resilience.
- IA reduces storage cost but adds access charges.
- Provisioned throughput is not the same as Provisioned IOPS on EBS.

📝 PRACTICE QUESTION<br />A fleet of Linux EC2 instances needs a shared file system. Traffic is unpredictable, and throughput should adjust automatically. What should it use?<br />A. EFS with Elastic throughput<br />B. One EBS volume per instance<br />C. S3 Glacier Deep Archive<br />D. Instance store

<b>Answer: A.</b> EFS shares files and Elastic throughput adapts to changing demand. B creates separate disks. C is archival object storage. D is temporary local storage.

🔁 ONE-LINE RECAP<br />EFS provides shared Linux file storage; choose Regional or One Zone and select performance and throughput modes by workload.

---

### 89. Amazon FSx family: Windows, Lustre, NetApp ONTAP, OpenZFS (Domain 3.1)

🧒 LIKE I'M 5<br />Different workers need different tools. A Windows office needs Windows file sharing. A science lab needs a very fast parallel file system. FSx offers specialized managed file systems.

📖 EXPLAINED SIMPLY

- <b>Amazon FSx</b> provides managed file systems built for particular workloads.
- <b>FSx for Windows File Server</b> provides Windows-native shared storage using SMB (Server Message Block).
- It supports Windows features such as Active Directory integration, file shares, and access-control lists.
- Choose it for Windows applications, home directories, and shared folders that expect SMB.
- <b>FSx for Lustre</b> provides high-performance parallel file storage for compute-heavy workloads.
- It can link to S3 data repositories. This suits machine learning, high-performance computing, and large analytics jobs.
- <b>FSx for NetApp ONTAP</b> provides managed NetApp storage features, including NFS, SMB, iSCSI, snapshots, and data-management tools.
- It suits enterprise workloads that need ONTAP compatibility or multi-protocol access.
- <b>FSx for OpenZFS</b> provides managed ZFS file storage with snapshots, clones, and low-latency access.
- Each FSx type has different protocols, performance, and cost. Do not treat FSx as one interchangeable file system.
- Choose based on OS, protocol, application compatibility, performance, and data-management requirements.
- Use EFS for general shared Linux NFS workloads. Use the specific FSx product when its native features matter.

📚 JARGON BOX

- SMB → Windows file-sharing protocol.
- NFS → Network File System protocol.
- Lustre → Parallel file system for high-performance computing.
- ONTAP → NetApp storage operating system and feature set.
- OpenZFS → File system with snapshots and copy-on-write features.
- iSCSI → Protocol providing block storage over IP.
- Snapshot → Point-in-time view of stored data.

⚖️ COMPARE WITH LOOKALIKES

| FSx service | Protocol / strength | Common workload |
| --- | --- | --- |
| Windows File Server | SMB, Active Directory | Windows file shares |
| Lustre | High-performance parallel file system | HPC and ML |
| NetApp ONTAP | NFS, SMB, iSCSI, ONTAP features | Enterprise storage |
| OpenZFS | ZFS snapshots and clones | Linux/Unix file workloads |
| EFS | NFS shared file system | General Linux sharing |

🎯 EXAM LENS

- "Windows SMB shares with AD" → FSx for Windows File Server.
- "HPC needs a fast parallel file system linked to S3" → FSx for Lustre.
- "Existing NetApp ONTAP features" → FSx for NetApp ONTAP.
- "ZFS snapshots and clones" → FSx for OpenZFS.

🪤 TRAPS

- FSx for Windows is not the same as EFS.
- Lustre is not a general-purpose replacement for every file share.
- Each FSx product has different protocols.
- S3 is object storage; FSx is managed file/block-style storage depending on product and protocol.

📝 PRACTICE QUESTION<br />A Windows application requires SMB file shares and Active Directory integration. Which service is the best fit?<br />A. FSx for Windows File Server<br />B. EFS<br />C. S3 Standard<br />D. FSx for Lustre

<b>Answer: A.</b> FSx for Windows provides SMB and AD integration. EFS is NFS. S3 is object storage. Lustre targets high-performance parallel compute.

🔁 ONE-LINE RECAP<br />Choose the FSx product by its native protocol and workload: Windows, Lustre, ONTAP, or OpenZFS.

---

### 90. S3 performance: prefixes, parallel requests, and request patterns (Domain 3.1)

🧒 LIKE I'M 5<br />A warehouse has many loading doors. If every truck uses one door, a queue forms. S3 can handle high request rates, and good application design spreads work efficiently.

📖 EXPLAINED SIMPLY

- Amazon S3 automatically scales to high request rates. It supports at least 3,500 PUT/COPY/POST/DELETE or 5,500 GET/HEAD requests per second per partitioned prefix.
- These are baseline design figures, not a strict account-wide limit. S3 can scale further as request patterns ramp up.
- A <b>prefix</b> is the beginning part of an object key, often used like a folder name.
- Older advice suggested randomizing key prefixes. Modern S3 can handle sequential and well-distributed keys without needing artificial random prefixes for most workloads.
- Distribute request patterns across prefixes when a workload has very high parallel traffic. Avoid assuming one prefix is a single physical folder.
- Use parallel requests to increase throughput. Avoid sending every request through one application thread.
- Monitor 503 Slow Down responses. Retry with exponential backoff and jitter.
- Use multipart upload for large objects. It uploads independent parts in parallel and can retry failed parts.
- Use byte-range GET requests to download parts of large objects in parallel. This can improve transfer performance.
- S3 Transfer Acceleration can speed long-distance uploads using edge locations when network conditions justify it.
- Performance also depends on client concurrency, network bandwidth, object size, and request latency.
- Do not overengineer key naming to solve a problem that S3 already handles automatically.

📚 JARGON BOX

- Prefix → Beginning portion of an S3 object key.
- Partitioned prefix → Internal scaling range used to distribute S3 requests.
- Multipart upload → Upload one large object as separate parts.
- Byte-range GET → Download a selected byte range of an object.
- Exponential backoff → Wait longer between retries after failures.
- Jitter → Add randomness to retry timing to avoid synchronized retries.
- 503 Slow Down → S3 response asking the client to reduce or retry request load.

⚖️ COMPARE WITH LOOKALIKES

| Technique | Best use |
| --- | --- |
| Parallel requests | Many independent object reads/writes |
| Multipart upload | Large object uploads |
| Byte-range GET | Parallel or partial downloads |
| Transfer Acceleration | Long-distance upload paths |
| Lifecycle policy | Storage cost management, not request performance |

🎯 EXAM LENS

- "Upload very large files in parts" → Multipart upload.
- "Read different parts of an object in parallel" → Byte-range GET.
- "Reduce long-distance upload latency" → Transfer Acceleration.
- "503 Slow Down" → Retry with exponential backoff and jitter.
- "Modern S3 key prefix design" → Do not assume random prefixes are always required.

🪤 TRAPS

- Multipart upload is not a storage class.
- Transfer Acceleration is not always faster or cheaper.
- S3 automatically scales; random prefixes are not a universal requirement.
- Retry storms can make throttling worse.

📝 PRACTICE QUESTION<br />A media platform uploads multi-gigabyte video files from users worldwide. Failed parts should be retried without restarting the whole file. Which option fits?<br />A. S3 multipart upload<br />B. S3 Glacier Deep Archive<br />C. EBS Multi-Attach<br />D. Route 53 weighted routing

<b>Answer: A.</b> Multipart upload sends separate parts and can retry failed parts. Glacier is archival storage. EBS and Route 53 solve unrelated problems.

🔁 ONE-LINE RECAP<br />Use multipart uploads, byte-range reads, parallel requests, and sensible backoff to improve S3 transfer performance.

---

### 91. Hybrid storage: Storage Gateway types and DataSync choice (Domain 3.1)

🧒 LIKE I'M 5<br />A shop keeps using its old cash register but stores receipts in a cloud godown. Storage Gateway connects familiar on-premises storage workflows to AWS.

📖 EXPLAINED SIMPLY

- <b>AWS Storage Gateway</b> connects on-premises applications to cloud-backed storage.
- <b>S3 File Gateway</b> exposes NFS or SMB file shares. Files are stored as objects in S3.
- <b>FSx File Gateway</b> gives low-latency access to Windows file shares backed by Amazon FSx for Windows File Server.
- <b>Volume Gateway</b> presents iSCSI block volumes to on-premises servers. Cached volumes keep primary data in AWS and cache frequently used data locally. Stored volumes keep primary data locally and asynchronously back up snapshots to AWS.
- <b>Tape Gateway</b> presents virtual tape libraries for backup applications. Virtual tapes are stored in S3 and can move to archive storage.
- Storage Gateway is useful when applications need familiar file, volume, or tape interfaces.
- <b>AWS DataSync</b> is different. It moves data between on-premises storage and AWS storage, or between supported AWS storage locations.
- DataSync is useful for scheduled or large-scale data migration and synchronization. Storage Gateway is useful for ongoing hybrid access.
- Choose S3 File Gateway for file-based access to S3, Volume Gateway for iSCSI volumes, and Tape Gateway for virtual tape backup.
- Use DataSync for transfer jobs rather than a continuously mounted gateway.
- Plan connectivity, cache sizing, local hardware or VM capacity, and bandwidth.

📚 JARGON BOX

- Hybrid storage → Storage spanning on-premises systems and cloud.
- Gateway → Service bridging local systems and cloud storage.
- iSCSI → Protocol presenting remote block storage over IP.
- Cached volume → Main data in cloud, frequently used data cached locally.
- Stored volume → Main data stored locally with cloud snapshots.
- Virtual tape library → Software-based tape system backed by cloud storage.
- DataSync → Managed data transfer and synchronization service.

⚖️ COMPARE WITH LOOKALIKES

| Service | Interface / job | Use when |
| --- | --- | --- |
| S3 File Gateway | NFS/SMB files backed by S3 | Existing apps need file shares |
| Volume Gateway | iSCSI block volumes | Apps need block storage |
| Tape Gateway | Virtual tapes | Existing backup software uses tapes |
| FSx File Gateway | Windows file access | Low-latency Windows shares |
| DataSync | Transfer jobs | Move or synchronize datasets |

🎯 EXAM LENS

- "Existing backup software expects tapes" → Tape Gateway.
- "On-premises app needs SMB/NFS access backed by S3" → S3 File Gateway.
- "Existing server requires iSCSI block volumes" → Volume Gateway.
- "Move petabytes from NAS to S3 on a schedule" → DataSync.

🪤 TRAPS

- Storage Gateway provides ongoing hybrid access; DataSync focuses on moving data.
- S3 File Gateway stores files as S3 objects, not as a normal Windows file server.
- Volume Gateway is not the same as EBS.
- Select the gateway by protocol and access pattern.

📝 PRACTICE QUESTION<br />A company has a backup application that writes to physical tape libraries. It wants to keep the same workflow but store virtual tapes in AWS. Which service should it use?<br />A. Tape Gateway<br />B. DataSync<br />C. EFS<br />D. CloudFront

<b>Answer: A.</b> Tape Gateway presents virtual tapes for existing backup software. DataSync transfers files. EFS provides file storage. CloudFront delivers cached content.

🔁 ONE-LINE RECAP<br />Storage Gateway keeps familiar hybrid storage interfaces; DataSync moves and synchronizes data between locations.

## ✅ Batch 5 — topics 81–100

### Batch 5 review sheet

- Check standby capacity limits → Service Quotas in each Region.
- Trace a slow distributed request → X-Ray.
- Measure user experience → Availability, latency, errors, saturation.
- Analyze sentiment or extract entities → Comprehend.
- Turn text into speech → Polly.
- Make an old broker-compatible app reliable → Amazon MQ.
- Block storage → EBS.
- Shared file storage → EFS or the right FSx product.
- Object storage → S3.
- Very high IOPS → io2.
- General-purpose EBS SSD → gp3.
- Large sequential disk throughput → st1.
- Temporary host-local scratch space → Instance store.
- Shared Linux NFS → EFS.
- Windows SMB plus AD → FSx for Windows.
- High-performance parallel files → FSx for Lustre.
- Huge S3 uploads → Multipart upload.
- Parallel partial S3 downloads → Byte-range GET.
- Existing tape backup workflow → Tape Gateway.
- Bulk transfer and synchronization → DataSync.

### 5 Extra Mixed Scenario Questions

<b>1.</b> A Linux application fleet needs shared files and unpredictable throughput. What is the best fit?<br />A. EFS with Elastic throughput<br />B. One EBS volume for each server<br />C. S3 Glacier Deep Archive<br />D. Instance store

<b>Answer: A.</b> EFS shares files and can adapt throughput. B creates separate disks. C is archive storage. D is temporary.

<b>2.</b> A Windows application requires SMB shares integrated with Active Directory. Which service fits?<br />A. FSx for Windows File Server<br />B. EFS<br />C. S3 Standard<br />D. FSx for Lustre

<b>Answer: A.</b> FSx for Windows provides SMB and AD support. EFS is NFS. S3 is object storage. Lustre is for parallel compute.

<b>3.</b> A company uses existing tape backup software and wants virtual tapes in AWS. Which service is best?<br />A. Tape Gateway<br />B. DataSync<br />C. EBS gp3<br />D. CloudFront

<b>Answer: A.</b> Tape Gateway preserves tape workflows. DataSync moves files. EBS and CloudFront serve different purposes.

<b>4.</b> A media service uploads multi-gigabyte objects. It must retry failed parts independently. What should it use?<br />A. S3 multipart upload<br />B. S3 lifecycle expiration<br />C. S3 Object Lock<br />D. Route 53 failover

<b>Answer: A.</b> Multipart upload supports part-level retries. The others manage lifecycle, retention, and DNS.

<b>5.</b> A company sees S3 503 Slow Down responses during a sudden upload spike. What should its clients do?<br />A. Retry with exponential backoff and jitter<br />B. Retry instantly in a tight loop<br />C. Disable all error handling<br />D. Move every object to Glacier immediately

<b>Answer: A.</b> Backoff and jitter reduce synchronized retry pressure. Tight loops increase load. The other actions do not address request throttling.

## 3.2 High-performing and elastic compute

Topics to cover, in this order:

1. EC2 instance families (general, compute, memory, storage, accelerated) and placement groups
2. EC2 Auto Scaling: policies (target tracking, step, scheduled, predictive), metrics, cooldowns
3. AWS Auto Scaling (for other services)
4. Lambda performance: memory sizing, concurrency, cold starts
5. Fargate, ECS, EKS for compute
6. Batch and EMR for big jobs
7. Edge and distributed compute (Wavelength, Outposts, CloudFront Functions / Lambda@Edge)
8. Decoupling so components scale independently

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>

## 3.3 High-performing databases

Topics to cover, in this order:

1. Database types: relational, key-value, document, graph, in-memory, columnar
2. RDS engines and instance/storage choices (IOPS)
3. Aurora (architecture, replicas, Serverless, Global Database)
4. DynamoDB (partition keys, capacity modes, DAX, Global Tables, streams)
5. ElastiCache Redis vs Memcached, caching strategies (lazy loading, write-through)
6. Read replicas and RDS Proxy
7. Read-heavy vs write-heavy patterns
8. Migrations: homogeneous vs heterogeneous (DMS, SCT)

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>

## 3.4 High-performing and scalable networks

Topics to cover, in this order:

1. IP addressing and CIDR, subnet tiers, routing
2. ALB vs NLB vs GWLB
3. CloudFront (origins, caching, OAC)
4. Global Accelerator vs CloudFront
5. VPC peering vs Transit Gateway
6. VPN, Direct Connect, PrivateLink for hybrid networks
7. Designing global and multi-tier topologies

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>

## 3.5 High-performing data ingestion and transformation

Topics to cover, in this order:

1. Batch vs streaming ingestion
2. Kinesis Data Streams vs Amazon Data Firehose vs MSK
3. Transfer: DataSync, Storage Gateway, Snow Family, Transfer Family
4. Glue (ETL, crawlers, Data Catalog, CSV → Parquet)
5. Data lakes with S3 + Lake Formation (and securing them)
6. Athena, Redshift, EMR, OpenSearch
7. Visualization with Amazon Quick (formerly QuickSight)

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>

## 📌 Domain 3 cheat sheet

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>
