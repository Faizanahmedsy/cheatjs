<callout icon="🧒" color="blue_bg">
<b>Like I'm 5:</b> Two families eat the same food, but one pays half because they buy in bulk, cook at home and don't waste. This chapter is about getting the same result on AWS for less money.
</callout>

## 4.1 Cost-optimized storage

Topics to cover, in this order:

1. S3 storage classes (Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant / Flexible / Deep Archive) with minimum durations
2. S3 lifecycle rules
3. EBS: SSD vs HDD cost, gp2 → gp3, deleting unused snapshots
4. Requester Pays and data transfer costs
5. Batch vs individual uploads; cheapest way to move data in
6. Backup and archive strategies (AWS Backup, Glacier)
7. Cost tools: Cost Explorer, Budgets, Cost and Usage Report, cost allocation tags

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>

## 4.2 Cost-optimized compute

Topics to cover, in this order:

1. Purchasing options: On-Demand, Reserved Instances, Savings Plans, Spot, Dedicated Hosts / Instances
2. Right-sizing and Compute Optimizer
3. Lambda vs Fargate vs EC2 cost trade-offs
4. Load balancer choice for cost (ALB vs NLB vs GWLB)
5. Horizontal vs vertical scaling; Auto Scaling to avoid idle servers; hibernation
6. Hybrid and edge (Outposts)

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>

## 4.3 Cost-optimized databases

Topics to cover, in this order:

1. DynamoDB on-demand vs provisioned; RDS vs DynamoDB on cost
2. Aurora Serverless and other serverless options
3. Caching to reduce database cost
4. Backup retention policies and snapshot costs
5. Right data format: columnar (Redshift, Parquet), time series
6. Migrating schemas and data cheaply (DMS, SCT)

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>

## 4.4 Cost-optimized networks

Topics to cover, in this order:

1. Data transfer pricing basics (in vs out, AZ-to-AZ, Region-to-Region, internet)
2. NAT gateway costs: one shared vs one per AZ; using VPC endpoints instead
3. Direct Connect vs VPN vs internet on cost; bandwidth sizing
4. VPC peering vs Transit Gateway on cost
5. CloudFront to reduce origin data transfer
6. Throttling strategies (API Gateway)

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>

## 📌 Domain 4 cheat sheet

<callout icon="🚧" color="gray_bg">
<b>Coming soon</b>
</callout>
