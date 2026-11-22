<callout icon="🧒" color="blue_bg">
<b>Like I'm 5:</b> Your app is a house. This chapter is about locks on doors (who can enter), walls and gates (network), guards (security services) and a safe for valuables (encryption).
</callout>

## 1.1 Design secure access to AWS resources

Topics to cover, in this order:

1. Shared responsibility model (what AWS secures vs what you secure)
2. Root user, IAM users, groups, MFA and best practices
3. IAM policies (identity-based vs resource-based, JSON structure, least privilege, explicit deny)
4. IAM roles and STS — temporary credentials, role switching, cross-account access, roles for EC2/Lambda
5. Federation and IAM Identity Center (SSO), Directory Service
6. AWS Organizations, SCPs, Control Tower (multi-account security)
7. Resource policies (S3 bucket policies, KMS key policies) and when to use them

### 1. Shared responsibility model (Domain 1.1)

🧒 LIKE I'M 5<br />Imagine renting a flat in a gated society. The society maintains the building and lifts. You lock your door and protect your belongings. AWS and the customer divide cloud security in the same way.

📖 EXPLAINED SIMPLY

- <b>What it is:</b> AWS and the customer share responsibility for cloud security.
- <b>Security OF the cloud:</b> AWS protects physical buildings, power, cooling, hardware, and the network. AWS manages the infrastructure that runs its services.
- <b>Security IN the cloud:</b> You manage your data, user access, permissions, encryption choices, and workload configuration.
- <b>EC2:</b> AWS manages the physical server and virtualization. You manage the guest operating system, patches, applications, and security groups.
- <b>RDS:</b> AWS manages the database infrastructure and much of its maintenance. You still manage data, database users, permissions, network access, and settings.
- <b>S3:</b> AWS operates the storage infrastructure. You control bucket permissions, data classification, encryption choices, and retention.
- The exact split changes by service. More managed services mean less infrastructure work. They do not remove your responsibility for data and access.
- Use this model to decide who patches, configures, encrypts, backs up, and controls access.

📚 JARGON BOX

- Shared responsibility → AWS and customer divide security work.
- Infrastructure → Physical and virtual systems running services.
- Guest OS → Operating system installed inside an EC2 virtual machine.
- Managed service → AWS operates much of the underlying technology.
- Configuration → Settings controlling how a resource behaves.

⚖️ COMPARE WITH LOOKALIKES

| Service | AWS handles | Customer handles |
| --- | --- | --- |
| EC2 | Physical host, network, virtualization | OS, patches, apps, data, security groups |
| RDS | Managed database infrastructure | Data, users, permissions, network settings |
| S3 | Storage infrastructure | Bucket access, encryption choices, retention |

🎯 EXAM LENS

- "Patch the EC2 operating system" → Customer.
- "Protect the physical data center" → AWS.
- "Configure S3 bucket permissions" → Customer.
- "Managed service" → AWS handles more layers, not every security decision.
- The answer follows the service boundary.

🪤 TRAPS

- AWS does not automatically secure customer data access.
- Customers usually do not patch AWS-managed database hosts.
- A managed service is not secure by default in every customer configuration.

📝 PRACTICE QUESTION<br />A company runs an application on EC2. Who installs operating system security patches?<br />A. AWS data center staff  B. The customer  C. The internet provider  D. AWS Support only

<b>Answer: B.</b> The customer manages the guest OS on EC2. AWS manages the physical host and virtualization layer. The other options do not own guest OS patching.

🔁 ONE-LINE RECAP<br />AWS secures the cloud infrastructure; customers secure workloads, data, access, and configurations.

---

### 2. Global infrastructure: Regions, AZs, edge locations, Local Zones (Domain 1.1)

🧒 LIKE I'M 5<br />Think of AWS as a chain of godowns. A Region is a city, an AZ is a separate storage campus, and an edge location is a small delivery point near customers.

📖 EXPLAINED SIMPLY

- <b>Region:</b> A geographic area where AWS operates multiple Availability Zones. Choose it based on service availability, latency, legal data-location needs, recovery, and price.
- Not every AWS service or feature exists in every Region. Check availability before designing.
- <b>Availability Zone (AZ):</b> One or more separate data centers with independent power, cooling, and networking inside a Region. AZs are designed to isolate failures.
- AZs connect through high-bandwidth, low-latency networking. Use multiple AZs for high availability.
- AZ names can map differently between AWS accounts. Use AZ IDs when you must identify the same physical AZ across accounts.
- <b>Edge location:</b> A site used by services such as CloudFront to cache and deliver content near users. It is not an AZ.
- <b>Local Zone:</b> An extension of a parent Region. It places selected services closer to a large city for very low latency.
- Local Zones do not offer the full set of services available in a Region. They do not replace multi-AZ resilience.
- <b>Wavelength Zone:</b> AWS infrastructure inside telecom networks for low-latency mobile applications.
- Use multi-AZ for availability, multiple Regions for geographic recovery or data residency, edge locations for content delivery, and Local Zones for city-level latency.

📚 JARGON BOX

- Region → Separate geographic AWS area.
- AZ → Isolated location inside a Region.
- Edge location → Site used by edge delivery services.
- Local Zone → Region extension near a major city.
- Latency → Time taken for data to travel.
- Data residency → Rules about where data must be stored.

⚖️ COMPARE WITH LOOKALIKES

| Option | Main purpose | Typical use |
| --- | --- | --- |
| Region | Geographic separation | Data location, disaster recovery |
| AZ | Failure isolation inside Region | High availability |
| Edge location | Bring content near users | CloudFront caching |
| Local Zone | Selected services near a city | City-level low latency |
| Wavelength Zone | Compute inside telecom networks | Mobile edge applications |

🎯 EXAM LENS

- "Survive one data-center failure" → Multiple AZs.
- "Serve cached content worldwide" → CloudFront edge locations.
- "Keep workloads near a city" → Local Zone.
- "Meet country data-location needs" → Appropriate Region.

🪤 TRAPS

- Edge locations are not AZs.
- A Region contains AZs, not the other way around.
- A Local Zone is not a complete independent Region.
- Multiple AZs do not protect against every Region-wide disaster.

📝 PRACTICE QUESTION<br />A video company wants users worldwide to receive cached images from nearby locations. What should it use?<br />A. EC2 in one AZ  B. CloudFront edge locations  C. A Local Zone in every country  D. A second VPC

<b>Answer: B.</b> Edge locations cache and deliver content near viewers. The other choices do not provide global content delivery.

🔁 ONE-LINE RECAP<br />Regions separate geography, AZs isolate failures, edge locations deliver content nearby, and Local Zones reduce city-level latency.

---

### 3. Root user and account security best practices (MFA) (Domain 1.1)

🧒 LIKE I'M 5<br />The root user is like the owner of a bank locker. It has the highest authority. Keep its master key locked away and use staff accounts for daily work.

📖 EXPLAINED SIMPLY

- <b>Root user:</b> The identity created when an AWS account is opened. It uses the account email address and password.
- Root has unrestricted access to account resources and can perform tasks that IAM identities cannot.
- Never use root for daily administration, application access, or routine work.
- Use IAM Identity Center or an IAM role for ordinary administration. Give every person an individual identity.
- <b>Multi-factor authentication (MFA):</b> Extra proof of identity after a password. Options include authenticator apps, security keys, and supported hardware devices.
- Enable MFA on root immediately. Prefer phishing-resistant methods, such as security keys or passkeys, where supported.
- Protect the root email account too. An attacker controlling that email may reset account access.
- Do not create root access keys. They are long-term credentials with broad power.
- Use a strong unique password. Store recovery details securely. Monitor root activity with CloudTrail.
- Use root only for tasks that specifically require root. Never share root credentials.
- Every AWS account has a root user. You cannot replace it with an IAM user.

📚 JARGON BOX

- Root user → Highest-privilege identity of an AWS account.
- MFA → More than one proof of identity.
- Access key → Credential pair used for programmatic access.
- Phishing-resistant → Designed to resist fake sign-in pages stealing credentials.
- CloudTrail → Records account activity and API calls.

⚖️ COMPARE WITH LOOKALIKES

| Identity | Use | Key control |
| --- | --- | --- |
| Root user | Rare account-level tasks | MFA, no access keys |
| Admin role | Daily administration | Grant only to trusted admins |
| IAM user | Specific or legacy identity | Prefer temporary role credentials |
| Workload role | Application access | Temporary credentials |

🎯 EXAM LENS

- "Secure the account owner" → Root MFA and no root access keys.
- "Daily administration" → Administrator role or Identity Center.
- "Temporary workload access" → IAM role, not root keys.
- "Protect account recovery" → Secure root email too.

🪤 TRAPS

- Protect root with MFA even when all other users use MFA.
- Root is not a shared administrator login.
- An administrator role is not identical to root.
- Do not create root keys for automation.

📝 PRACTICE QUESTION<br />Which two actions best reduce AWS account compromise risk?<br />A. Enable MFA on root  B. Create root access keys  C. Use individual admin roles  D. Share root password

<b>Answer: A and C.</b> Root MFA protects the highest-privilege identity. Individual roles avoid shared root use. B and D increase credential exposure.

🔁 ONE-LINE RECAP<br />Protect root with MFA, avoid root access keys, and use individual roles for daily administration.

---

### 4. IAM users and groups (Domain 1.1)

🧒 LIKE I'M 5<br />Imagine a school with identity cards. Each student is a user. Students in the same class belong to a group and receive common permissions.

📖 EXPLAINED SIMPLY

- <b>IAM (Identity and Access Management):</b> AWS service controlling who can access AWS and what they can do.
- <b>IAM user:</b> A long-term identity inside one AWS account. It can have console credentials, access keys, or both.
- <b>IAM group:</b> A collection of IAM users. Attach common permissions to the group.
- A user can belong to multiple groups. A group cannot contain another group.
- Groups contain users only. Applications and AWS services should normally use roles.
- Users can also receive policies directly. Applicable policies are evaluated together.
- Example: Attach read-only permissions to a finance group instead of configuring every finance employee separately.
- IAM users are account-level identities and are not tied to a Region.
- For workforce access, prefer federation or IAM Identity Center when suitable. For AWS workloads, use roles instead of stored user keys.
- Use groups when several IAM users need identical permissions. Never create one shared login for a team.

📚 JARGON BOX

- IAM → Identity and Access Management.
- User → Long-term AWS identity.
- Group → Collection of IAM users.
- Role → Assumable identity providing temporary credentials.
- Policy → Document defining permissions.
- Long-term credential → Password or access key that remains valid until changed.

⚖️ COMPARE WITH LOOKALIKES

| Feature | IAM user | IAM group | IAM role |
| --- | --- | --- | --- |
| Represents | One identity | Collection of users | Assumed identity |
| Credentials | Long-term | None | Temporary session |
| Direct login | Yes, if configured | No | Must be assumed |
| Main use | Human or legacy access | Shared user permissions | Workloads and federation |

🎯 EXAM LENS

- "Many employees need the same permissions" → IAM group.
- "EC2 needs S3 access" → IAM role.
- "Central workforce sign-in" → Identity Center or federation.
- "One user needs unique permissions" → User policy or role-based design.

🪤 TRAPS

- A group is not a login identity.
- A group cannot contain another group.
- Users need policies before they can access AWS resources.
- Do not use IAM users as the default for EC2 or Lambda.

📝 PRACTICE QUESTION<br />Forty finance employees need identical read-only access. What is simplest?<br />A. One shared user  B. Finance group with read-only policy  C. Forty duplicate policies  D. Root account

<b>Answer: B.</b> A group centralizes common permissions. Shared users harm accountability. Duplicate policies create unnecessary work.

🔁 ONE-LINE RECAP<br />IAM users identify people, groups organize users with shared access, and roles provide temporary access.

---

### 5. IAM policies: JSON structure, identity vs resource-based, explicit deny, evaluation (Domain 1.1)

🧒 LIKE I'M 5<br />A policy is a rule sheet at a society gate. It says who may enter, which building they may visit, and which actions are forbidden.

📖 EXPLAINED SIMPLY

- An IAM policy is a JSON document that grants or denies permissions.
- Main fields include Version and Statement. A statement can contain Sid, Effect, Principal, Action, Resource, and Condition.
- <b>Effect</b> is Allow or Deny. <b>Action</b> names the operation. <b>Resource</b> identifies the target. <b>Condition</b> adds requirements such as source IP or encryption.
- <b>Principal</b> identifies who may access a resource. It is commonly used in resource-based policies.
- <b>Identity-based policy:</b> Attached to a user, group, or role. It says what that identity can do.
- <b>Resource-based policy:</b> Attached to a resource, such as an S3 bucket or KMS key. It says who can access that resource.
- AWS starts with an implicit deny. An applicable explicit Allow can grant access.
- An explicit Deny always wins over an Allow. One applicable explicit Deny blocks the request.
- Cross-account access generally needs permission from the caller's side and authorization from the resource owner's side.
- Permission boundaries, session policies, SCPs, resource control policies, and endpoint policies can further restrict access.
- An endpoint policy controls access through that endpoint. It does not replace IAM or the resource policy.
- Conditions can require MFA, TLS, a source IP, or a specific VPC endpoint.
- Use identity policies for an identity's permissions. Use resource policies when resource owners must control access.

📚 JARGON BOX

- JSON → Structured text format for policy documents.
- Statement → One permission rule.
- Effect → Whether the rule allows or denies.
- Principal → Identity making the request.
- Action → AWS operation requested.
- Resource → AWS object targeted.
- Condition → Extra requirement for permission.
- Implicit deny → Denied because no policy allows it.
- Explicit deny → Direct Deny rule overriding allows.

⚖️ COMPARE WITH LOOKALIKES

| Policy | Attached to | Main question |
| --- | --- | --- |
| Identity-based | User, group, role | What can this identity do? |
| Resource-based | Bucket, key, supported resource | Who can access this resource? |
| Permissions boundary | User or role | What is the maximum identity permission? |
| SCP | Organization scope | What maximum permissions can member accounts use? |
| Endpoint policy | VPC endpoint | Who can use this endpoint? |

🎯 EXAM LENS

- "Bucket owner grants another account access" → Resource policy plus caller permission.
- "No policy allows the action" → Implicit deny.
- "One applicable policy explicitly denies" → Deny wins.
- "Only requests through this endpoint" → Condition using endpoint context.

🪤 TRAPS

- An explicit Deny is not cancelled by another Allow.
- A resource policy does not remove every cross-account identity requirement.
- Principal is generally not used in identity-based policies.
- Endpoint policy is an extra filter, not a replacement.

📝 PRACTICE QUESTION<br />A role has an Allow to read an S3 object. The bucket policy explicitly denies that role. What happens?<br />A. Access allowed  B. Access denied  C. Only Standard objects work  D. Restart EC2

<b>Answer: B.</b> An applicable explicit Deny overrides an Allow. Storage class and instance restarts do not change policy evaluation.

🔁 ONE-LINE RECAP<br />AWS evaluates all applicable controls, denies by default, and honours every applicable explicit Deny.

---

### 6. Least privilege and permission boundaries (Domain 1.1)

🧒 LIKE I'M 5<br />Give a delivery worker keys only for buildings on their route. A permission boundary is a company rule saying no worker can receive keys beyond a fixed limit.

📖 EXPLAINED SIMPLY

- <b>Least privilege:</b> Give an identity only the permissions required for its job. Avoid broad access to all actions and all resources.
- Start with a narrow policy. Add actions only when the application needs them. Review access and remove unused permissions.
- Use separate roles for separate jobs. A report reader should not receive database deletion permissions.
- <b>Permission boundary:</b> A managed policy attached to a user or role. It sets the maximum permissions that identity-based policies can grant.
- A boundary does not grant permissions by itself. The identity still needs an Allow from an applicable identity policy.
- Effective identity permissions are limited by what both the identity policy and boundary allow.
- An explicit Deny in an applicable policy overrides an Allow.
- Boundaries help administrators delegate role creation safely. A developer may create roles, but the boundary caps their permissions.
- <b>SCPs</b> set maximum permissions for member-account principals. A boundary sets a maximum for an individual IAM user or role.
- Resource-based grants directly to a role session have special evaluation behavior. Do not assume a boundary limits every such grant identically.
- Use boundaries for delegated administration and blast-radius reduction. Do not use them as permission grants.

📚 JARGON BOX

- Least privilege → Only access needed for a job.
- Permission boundary → Maximum permission limit for a user or role.
- Managed policy → Reusable policy managed in IAM.
- Blast radius → Possible damage if access is misused.
- Effective permission → Access remaining after policy evaluation.

⚖️ COMPARE WITH LOOKALIKES

| Control | Applies to | Main effect |
| --- | --- | --- |
| Identity policy | Identity | Grants permissions |
| Permission boundary | User or role | Caps identity permissions |
| SCP | Member-account scope | Caps account principal permissions |
| Resource policy | Supported resource | Controls resource access |

🎯 EXAM LENS

- "Developers create roles but cannot exceed approved access" → Permission boundary.
- "Limit member accounts" → SCP.
- "Give only required actions" → Least privilege.
- "Boundary attached, no Allow policy" → Still denied.

🪤 TRAPS

- A permission boundary does not grant access.
- An SCP does not grant access either.
- SCPs and boundaries have different scopes.
- Resource-based grants to role sessions need careful evaluation.

📝 PRACTICE QUESTION<br />Developers can create IAM roles but must never exceed a security team's access ceiling. What should it use?<br />A. Permission boundary  B. S3 lifecycle rule  C. Security group  D. Route table

<b>Answer: A.</b> A boundary caps maximum identity-based permissions. Other options manage storage or network traffic.

🔁 ONE-LINE RECAP<br />Least privilege minimizes access; a permission boundary caps the maximum identity-based permissions a user or role can receive.

---

### 7. IAM roles and instance profiles (Domain 1.1)

🧒 LIKE I'M 5<br />A worker borrows a temporary office badge for one job. An IAM role is that badge. It gives only the permissions written on it.

📖 EXPLAINED SIMPLY

- <b>IAM role:</b> An identity a trusted person or service can assume. It has no permanent password or access keys.
- A role has a <b>trust policy</b> and a <b>permissions policy</b>. Trust says who may assume it. Permissions say what the role may do.
- AWS STS issues temporary credentials when the role is assumed.
- <b>EC2 role access:</b> Attach a role through an instance profile. The instance profile makes the role available to EC2.
- Applications on EC2 obtain temporary credentials from the Instance Metadata Service (IMDS). They use them to call allowed AWS APIs.
- <b>Lambda role:</b> A Lambda function has an execution role. Lambda assumes it when the function runs.
- A Lambda role might allow writing logs to CloudWatch or reading selected S3 objects.
- Use separate roles for separate workloads. Scope permissions to required actions and resources.
- AWS SDK credential providers can retrieve and refresh temporary credentials. Avoid embedding keys in source code or machine images.
- Prefer IMDSv2 for EC2 metadata access. Restrict which processes and containers can reach instance metadata.
- Use roles for EC2, Lambda, ECS tasks, and other AWS workloads. Avoid hard-coded IAM user keys.

📚 JARGON BOX

- Role → Assumable identity with permissions.
- Trust policy → Defines who can assume a role.
- Execution role → Role used by a running workload.
- Instance profile → EC2 wrapper for attaching a role.
- IMDS → Provides EC2 instance data and role credentials.
- IMDSv2 → Metadata access requiring a session token.

⚖️ COMPARE WITH LOOKALIKES

| Option | Credentials | Best use |
| --- | --- | --- |
| IAM user key | Long-term | Specific legacy integrations |
| IAM role | Temporary after assumption | People and workloads |
| EC2 instance profile | Makes role available to EC2 | EC2 application access |
| Lambda execution role | Temporary role credentials | Lambda service access |

🎯 EXAM LENS

- "EC2 reads S3 without stored keys" → Role through instance profile.
- "Lambda writes logs" → Lambda execution role.
- "Who can assume the role?" → Trust policy.
- "What can the role do?" → Permissions policy.

🪤 TRAPS

- Instance profile is not the permission policy.
- Trust policy does not grant S3 access.
- A role does not automatically provide full access.
- Do not put IAM user keys in code or machine images.

📝 PRACTICE QUESTION<br />An EC2 application must read one S3 bucket without stored keys. What should it use?<br />A. Instance profile with role  B. Root key in user data  C. Security group  D. Access key in AMI

<b>Answer: A.</b> EC2 receives temporary role credentials. The other choices expose keys or control unrelated network access.

🔁 ONE-LINE RECAP<br />Use IAM roles and temporary credentials for workloads; EC2 receives its role through an instance profile.

---

### 8. AWS STS, temporary credentials, role switching (Domain 1.1)

🧒 LIKE I'M 5<br />A visitor receives a gate pass that expires after the visit. AWS STS issues similar temporary passes. A person or workload uses the pass for a limited session.

📖 EXPLAINED SIMPLY

- <b>AWS Security Token Service (STS):</b> Issues temporary security credentials.
- Temporary credentials contain an access key ID, secret access key, and session token. They also expire.
- <b>AssumeRole:</b> A principal requests to use an IAM role. STS checks the role trust policy and the caller's permission to assume it.
- If allowed, STS returns temporary credentials for that role session.
- <b>Role switching:</b> A person signs in with one identity and assumes another role. The new role controls actions during that session.
- <b>AssumeRoleWithSAML</b> supports SAML federation. <b>AssumeRoleWithWebIdentity</b> supports supported OIDC flows.
- <b>GetSessionToken</b> provides temporary credentials for an IAM user or root session. MFA can be required for sensitive operations.
- A role's maximum session duration is configurable from 1 to 12 hours. The default maximum is one hour. Specific services and federation flows can have other limits.
- Session policies can reduce a session's permissions. They cannot increase the role's permissions.
- Temporary credentials reduce the risk of stolen long-term keys. Obtain a new session when credentials expire.
- Use STS for role assumption, federation, cross-account access, and temporary elevated access.

📚 JARGON BOX

- STS → Security Token Service.
- Session token → Extra value required with temporary access keys.
- AssumeRole → Obtain temporary credentials for a role.
- SAML → Enterprise federation standard.
- OIDC → Identity standard used by web and workload sign-in.
- Session duration → How long temporary credentials remain valid.

⚖️ COMPARE WITH LOOKALIKES

| STS operation | Purpose |
| --- | --- |
| AssumeRole | Obtain credentials for an IAM role |
| AssumeRoleWithSAML | Federate a SAML-authenticated user |
| AssumeRoleWithWebIdentity | Federate a supported web identity |
| GetSessionToken | Temporary credentials for an IAM user or root session |

🎯 EXAM LENS

- "Temporary credentials" → STS.
- "Switch to an account role" → AssumeRole.
- "Corporate SAML login" → SAML federation.
- "Reduce a role session's permissions" → Session policy.

🪤 TRAPS

- STS does not create permanent IAM users.
- Session policies cannot add permissions.
- Trust and permission policies solve different problems.
- Temporary credentials still need protection until expiration.

📝 PRACTICE QUESTION<br />A developer must briefly manage resources in another account without long-term keys. What should they use?<br />A. STS AssumeRole  B. S3 Transfer Acceleration  C. AWS Config  D. IAM group nesting

<b>Answer: A.</b> AssumeRole issues temporary credentials for a trusted role. The other choices do not provide cross-account role credentials.

🔁 ONE-LINE RECAP<br />STS issues expiring credentials, and AssumeRole lets a trusted principal temporarily use another role.

---

### 9. Cross-account access patterns (Domain 1.1)

🧒 LIKE I'M 5<br />Two companies share a warehouse. The owner decides which visitors may enter. The visitor's company also permits its employee to visit. Both sides must agree.

📖 EXPLAINED SIMPLY

- Cross-account access means a principal in one AWS account uses a role or resource in another account.
- <b>Role assumption:</b> Create a role in the target account. Its trust policy names the source account or selected principals.
- Give the source identity permission to call STS AssumeRole on that target role.
- The principal assumes the role. STS returns temporary credentials. The session performs actions allowed by the target role.
- This is common for central administration, deployment pipelines, auditors, and shared services.
- <b>Resource-policy access:</b> An S3 bucket can grant access to a principal in another account. The caller may also need identity permissions.
- Writing an account ID into a policy does not automatically grant access. Configure required trust and permissions.
- Use an <b>external ID</b> when a third-party service assumes roles for several customers. It helps reduce confused deputy risk.
- Restrict trust policies to exact accounts or roles. Avoid broad wildcard trust unless a condition safely limits it.
- Organizations membership alone does not grant cross-account access.
- Use cross-account roles rather than copying long-term credentials.

📚 JARGON BOX

- Cross-account → Access between AWS accounts.
- Target account → Account owning the role or resource.
- Trust policy → Controls who can assume a role.
- External ID → Value used to protect third-party role assumption.
- Confused deputy → Trusted service tricked into using its authority for the wrong customer.

⚖️ COMPARE WITH LOOKALIKES

| Pattern | How access is granted | Typical use |
| --- | --- | --- |
| AssumeRole | Target trust + caller AssumeRole permission | Admin and automation |
| Resource policy | Resource names external principal | S3 sharing |
| Shared credentials | Keys copied between accounts | Avoid |

🎯 EXAM LENS

- "Central account manages member accounts" → AssumeRole.
- "Third-party SaaS assumes customer role" → External ID.
- "Share S3 bucket with another account" → Bucket policy plus caller permission.
- "Temporary access, no key sharing" → STS role assumption.

🪤 TRAPS

- Trust policy alone does not authorize the caller to assume a role.
- Caller permission alone does not make the target role trust the caller.
- Organizations does not automatically share resources.
- Avoid distributing administrator keys.

📝 PRACTICE QUESTION<br />A vendor must read selected resources in a customer's account. The customer wants temporary access and confused deputy protection. What should it configure?<br />A. Root password  B. Cross-account role requiring external ID  C. Public buckets  D. NAT gateway

<b>Answer: B.</b> A trusted role gives temporary access. The external ID helps protect third-party role assumption.

🔁 ONE-LINE RECAP<br />Cross-account access usually uses a target-account role, caller AssumeRole permission, and tightly scoped trust.

---

### 10. Federation and IAM Identity Center (SSO) (Domain 1.1)

🧒 LIKE I'M 5<br />You use one school identity card to enter the library, computer lab, and sports area. Federation lets a trusted system prove who you are. AWS roles decide what you may do.

📖 EXPLAINED SIMPLY

- <b>Federation:</b> Users sign in through an external identity provider instead of maintaining separate passwords in every AWS account.
- <b>Single sign-on (SSO):</b> One sign-in provides access to multiple approved applications or accounts.
- <b>SAML 2.0:</b> Common in enterprises. A corporate identity provider authenticates the employee and sends AWS a signed assertion.
- <b>OpenID Connect (OIDC):</b> An identity layer built on OAuth 2.0. It is common for web applications and workload identities.
- STS can exchange supported federation assertions for temporary AWS role credentials.
- <b>IAM Identity Center:</b> AWS's central service for workforce access to multiple AWS accounts and supported applications.
- Connect an identity source. It may be the Identity Center directory or an external identity provider.
- Assign <b>permission sets</b> to users or groups for selected AWS accounts. A permission set defines permissions and session settings.
- Identity Center provisions and manages corresponding IAM roles in assigned accounts. Users receive short-lived access through the portal or supported CLI sign-in.
- Identity Center is for workforce access. Cognito is generally for customer-facing application sign-in.
- Use Identity Center when employees need centralized access across accounts. Do not use it as the default customer-login system for a public app.

📚 JARGON BOX

- Federation → Trust another identity system to authenticate users.
- Identity provider → System that verifies a user's identity.
- SAML → Enterprise sign-in assertion standard.
- OIDC → Open identity standard used by web and workload sign-in.
- SSO → One sign-in for multiple approved systems.
- Permission set → Reusable permissions for an AWS account assignment.
- Assertion → Signed statement about an authenticated user.

⚖️ COMPARE WITH LOOKALIKES

| Option | Best use |
| --- | --- |
| IAM users | Account-local or legacy access |
| SAML federation | Enterprise workforce identity |
| OIDC federation | Web and supported workload identity |
| IAM Identity Center | Central workforce access to AWS accounts |
| Cognito User Pools | Customer application sign-in |

🎯 EXAM LENS

- "Employees use corporate credentials across accounts" → IAM Identity Center.
- "Enterprise identity provider" → SAML or supported identity source integration.
- "OIDC token" → OIDC federation.
- "Customer-facing application sign-in" → Cognito User Pools.

🪤 TRAPS

- Identity Center is not Cognito.
- Authentication does not automatically grant administrator permissions.
- Permission sets control account access.
- SAML and OIDC are different federation standards.

📝 PRACTICE QUESTION<br />A company wants employees to access 25 AWS accounts using existing corporate credentials. What should it choose?<br />A. IAM Identity Center  B. Shared root login  C. S3 ACL  D. Macie

<b>Answer: A.</b> Identity Center centralizes workforce access and assigns permission sets.

🔁 ONE-LINE RECAP<br />Federation reuses trusted identities, and IAM Identity Center centralizes workforce access across AWS accounts.

---

### 11. AWS Directory Service (Managed Microsoft AD, AD Connector) (Domain 1.1)

🧒 LIKE I'M 5<br />A company already has a staff register and login system. Directory Service helps AWS applications use that directory instead of creating another staff register.

📖 EXPLAINED SIMPLY

- <b>AWS Directory Service:</b> Services helping applications use Microsoft Active Directory (AD) in AWS.
- <b>AWS Managed Microsoft AD:</b> AWS runs a Microsoft AD directory. It supports domain joins, users, groups, Group Policy, and AD-aware applications.
- Managed Microsoft AD can establish trust with an existing on-premises AD forest. Users can access resources across trusted directories.
- <b>AD Connector:</b> A directory gateway forwarding requests to existing on-premises AD. It does not store user credentials in AWS or act as a standalone directory.
- AD Connector requires private network connectivity to on-premises domain controllers. VPN or Direct Connect can provide this.
- <b>Simple AD:</b> A standalone Samba-based directory for basic needs. It is not a full Microsoft AD replacement.
- Choose Managed Microsoft AD when you need AWS-hosted AD features. Choose AD Connector when on-premises AD must remain authoritative.
- Choose Simple AD only when its limited feature set is sufficient.
- Use Directory Service for legacy Windows applications, domain-joined EC2 instances, and directory-aware applications.
- Do not use it as a replacement for IAM policies. AD authentication and AWS API authorization are different tasks.

📚 JARGON BOX

- Active Directory → Microsoft's directory for users, computers, and policies.
- Domain controller → Server handling AD authentication and requests.
- LDAP → Protocol for accessing directory information.
- Kerberos → Network authentication protocol.
- Trust → Relationship allowing identities in another directory to be recognized.
- Group Policy → Central rules for Windows computers and users.

⚖️ COMPARE WITH LOOKALIKES

| Option | Where directory lives | Use when |
| --- | --- | --- |
| Managed Microsoft AD | AWS operates Microsoft AD | Need AD in AWS |
| AD Connector | Existing on-premises AD | AWS apps must use current AD |
| Simple AD | AWS-managed basic Samba directory | Basic directory needs |
| Identity Center | AWS workforce access | Manage AWS account and app access |

🎯 EXAM LENS

- "Need Microsoft AD domain in AWS" → Managed Microsoft AD.
- "Keep existing on-premises AD" → AD Connector.
- "Legacy Windows app needs domain join" → Managed Microsoft AD or suitable AD integration.
- "Central AWS account sign-in" → IAM Identity Center.

🪤 TRAPS

- AD Connector is not a full directory hosted by AWS.
- Managed Microsoft AD is not simply a proxy.
- Directory authentication does not automatically grant IAM permissions.
- Simple AD has fewer features than Microsoft AD.

📝 PRACTICE QUESTION<br />A company must keep on-premises Microsoft AD as its source of truth. AWS apps must authenticate against it without moving the directory. Which option fits?<br />A. AD Connector  B. Simple AD  C. Macie  D. Public S3

<b>Answer: A.</b> AD Connector forwards directory requests to existing AD. Simple AD creates a separate basic directory.

🔁 ONE-LINE RECAP<br />Managed Microsoft AD hosts AD in AWS, while AD Connector lets AWS applications use existing on-premises AD.

---

### 12. AWS Organizations and consolidated billing (Domain 1.1)

🧒 LIKE I'M 5<br />Imagine a family with separate wallets. Each wallet has its own spending. One family account receives the combined bill and sets household rules.

📖 EXPLAINED SIMPLY

- <b>AWS Organizations:</b> Centrally manages multiple AWS accounts.
- An organization has a management account and member accounts. Accounts can be grouped into <b>organizational units (OUs)</b>.
- OUs group accounts by purpose, such as production, development, security, or finance.
- The management account creates and administers the organization. Avoid running ordinary workloads there.
- <b>Consolidated billing:</b> One payer account receives the combined bill for linked accounts. Each account remains separate.
- Consolidated billing can combine eligible usage for volume pricing and certain discounts. Not every discount automatically applies to every service.
- Use cost allocation tags and billing tools to identify which account or team caused spending.
- Organizations also supports central governance policies, including SCPs.
- Member accounts retain their own resources and boundaries. An organization does not merge them into one account.
- SCPs do not restrict the management account like they restrict member accounts.
- Use Organizations for separate environments, team isolation, central billing, and governance.

📚 JARGON BOX

- Organization → Group of AWS accounts managed together.
- Management account → Account creating and administering an organization.
- Member account → Account joined to the organization.
- OU → Organizational Unit; folder-like account grouping.
- Payer account → Account responsible for consolidated billing.
- Consolidated billing → Combining charges from linked accounts into one bill.

⚖️ COMPARE WITH LOOKALIKES

| Option | Main purpose |
| --- | --- |
| Organizations | Multi-account management and governance |
| Consolidated billing | Combined bill for linked accounts |
| IAM groups | Organize users inside one account |
| Control Tower | Governed multi-account landing zone |

🎯 EXAM LENS

- "Separate accounts, one bill" → Organizations with consolidated billing.
- "Group accounts by environment" → OUs.
- "Central governance" → Organizations plus policies.
- "Secure multi-account baseline quickly" → Control Tower.

🪤 TRAPS

- Consolidated billing does not merge accounts.
- Member accounts retain separate resources.
- SCPs do not grant permissions.
- Keep ordinary production workloads out of the management account.

📝 PRACTICE QUESTION<br />A company has 12 AWS accounts. Finance needs one combined bill, but teams must keep separate accounts. What should it use?<br />A. Organizations with consolidated billing  B. Shared IAM user  C. One VPC  D. One EC2 instance

<b>Answer: A.</b> Organizations links accounts and supports consolidated billing while preserving separation.

🔁 ONE-LINE RECAP<br />Organizations manages isolated accounts, while consolidated billing combines their charges.

---

### 13. Service Control Policies (SCPs) (Domain 1.1)

🧒 LIKE I'M 5<br />A school principal sets rules for every classroom. A teacher may give students extra duties but cannot break school-wide rules.

📖 EXPLAINED SIMPLY

- <b>Service Control Policy (SCP):</b> An Organizations policy setting maximum permissions for principals in member accounts.
- SCPs attach to the organization root, an OU, or an account. Child accounts inherit applicable policies.
- An SCP does not grant permissions. IAM policies must still allow the action.
- A member-account request must pass applicable SCP controls and relevant permission policies.
- An explicit Deny in an SCP overrides an Allow from IAM.
- Common uses include denying selected Regions, preventing disabling security services, or blocking actions across production accounts.
- SCPs affect IAM users, roles, and the member account root user. They do not restrict service-linked roles in the same way.
- SCPs do not apply to the management account.
- With allow-list designs, keep required services allowed. Removing an action can unexpectedly block workloads.
- Use SCPs for organization-wide permission guardrails. Do not use them as IAM grants.

📚 JARGON BOX

- SCP → Service Control Policy; organization-level maximum permission rule.
- OU → Organizational Unit; a group of accounts.
- Allow list → Only listed actions are permitted.
- Deny list → Actions remain available unless explicitly denied.
- Service-linked role → Role created for an AWS service.

⚖️ COMPARE WITH LOOKALIKES

| Control | Scope | Grants access? |
| --- | --- | --- |
| IAM policy | Identity or resource | Yes, when it allows |
| SCP | Member-account principals | No |
| Permission boundary | One user or role | No |
| Resource policy | Supported resource | Can grant access |

🎯 EXAM LENS

- "Prevent accounts using a Region" → SCP deny.
- "Stop developers disabling security services" → SCP guardrail.
- "SCP allows but IAM does not" → Still denied.
- "Apply to every account in a group" → Attach SCP to the OU.

🪤 TRAPS

- SCPs do not grant access.
- SCPs do not restrict the management account.
- SCPs affect member-account root users.
- An SCP Allow does not mean the request is automatically allowed.

📝 PRACTICE QUESTION<br />A company wants to prevent developers in its production OU from launching resources in an unapproved Region. What should it use?<br />A. SCP attached to production OU  B. Security group  C. S3 lifecycle rule  D. Dashboard

<b>Answer: A.</b> SCPs can deny actions across accounts in an OU.

🔁 ONE-LINE RECAP<br />SCPs cap permissions for member-account principals but never grant permissions by themselves.

---

### 14. AWS Control Tower (landing zone, guardrails) (Domain 1.1)

🧒 LIKE I'M 5<br />Before opening a mall, the owner prepares shops, security desks, cameras, and rules. Control Tower creates a ready-made starting setup for a multi-account AWS environment.

📖 EXPLAINED SIMPLY

- <b>AWS Control Tower:</b> Helps set up and govern a secure multi-account AWS environment.
- Its managed starting environment is a <b>landing zone</b>.
- A landing zone creates a multi-account structure using Organizations and supporting services.
- It sets up shared accounts for central tasks such as logging and security auditing. The exact setup depends on configuration.
- <b>Controls:</b> Governance rules traditionally called guardrails. They can be preventive or detective.
- Preventive controls use mechanisms such as SCPs to block prohibited actions.
- Detective controls use mechanisms such as AWS Config to identify non-compliant configurations.
- Account Factory helps provision new accounts with approved baseline settings.
- Account enrollment brings eligible existing accounts under Control Tower governance.
- Control Tower uses Organizations, IAM Identity Center, AWS Config, CloudTrail, and other services.
- It is an orchestration and governance layer. It does not replace application security design.
- Use it for a repeatable multi-account foundation. Do not use it merely to create one VPC or IAM user.

📚 JARGON BOX

- Landing zone → Prepared, governed multi-account environment.
- Control → Governance rule.
- Preventive control → Stops a prohibited action or configuration.
- Detective control → Detects a non-compliant configuration.
- Account Factory → Controlled account provisioning.
- Enrollment → Bringing an existing account under governance.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main job |
| --- | --- |
| Organizations | Organize accounts and apply policies |
| Control Tower | Set up and govern a landing zone |
| AWS Config | Record and evaluate configurations |
| IAM Identity Center | Workforce account access |

🎯 EXAM LENS

- "Quickly establish governed multi-account environment" → Control Tower.
- "Prevent and detect governance violations" → Control Tower controls.
- "Provision accounts with approved baseline" → Account Factory.
- "Only group accounts" → Organizations may be sufficient.

🪤 TRAPS

- Control Tower builds on Organizations; it does not replace it.
- Detective controls report issues rather than necessarily blocking them.
- Control Tower is not a firewall.
- A landing zone is broader than one account.

📝 PRACTICE QUESTION<br />A company is adopting 30 accounts. It wants a standard landing zone, central controls, and account provisioning. Which service fits?<br />A. Control Tower  B. S3  C. Direct Connect  D. Cognito

<b>Answer: A.</b> Control Tower automates a governed multi-account foundation.

🔁 ONE-LINE RECAP<br />Control Tower builds and governs a multi-account landing zone using preventive and detective controls.

---

### 15. Resource-based policies: S3 bucket policies, ACLs, KMS key policies (Domain 1.1)

🧒 LIKE I'M 5<br />A warehouse owner posts rules on the door. The rules name visitors and say which goods they may access. Resource-based policies work like those door rules.

📖 EXPLAINED SIMPLY

- A <b>resource-based policy</b> is attached to a resource. It names principals and the actions they may perform.
- <b>S3 bucket policy:</b> JSON policy attached to a bucket. It can grant access to users, roles, accounts, or services.
- Bucket policies can require HTTPS, restrict access to selected VPC endpoints, or require approved encryption settings.
- <b>S3 Access Control Lists (ACLs):</b> Older bucket or object permission lists. They provide simpler and less flexible grants.
- With S3 Object Ownership set to <b>Bucket owner enforced</b>, ACLs are disabled. This is the recommended choice for most modern use cases.
- Prefer IAM and bucket policies unless a legacy requirement needs ACLs.
- <b>KMS key policy:</b> Primary policy controlling access to a customer-managed KMS key. It identifies key administrators and key users.
- IAM policies alone do not automatically grant KMS key access unless the key policy enables IAM permissions for the account or grants access directly.
- Cross-account KMS access usually needs permission in the key policy and an IAM policy in the external account.
- Reading an S3 object encrypted with a customer-managed KMS key requires S3 read permission and KMS decrypt permission.
- Use bucket policies for S3 sharing and KMS key policies for key access.

📚 JARGON BOX

- Resource-based policy → Policy attached to a resource.
- Bucket policy → Resource policy for an S3 bucket.
- ACL → Access Control List; a basic legacy permission list.
- Object Ownership → S3 setting controlling ownership and ACL behavior.
- KMS key policy → Main access policy for a KMS key.
- Decrypt → Convert encrypted data into readable data.

⚖️ COMPARE WITH LOOKALIKES

| Policy | Attached to | Main purpose |
| --- | --- | --- |
| IAM identity policy | User, group, role | Identity permissions |
| S3 bucket policy | Bucket | Resource access and conditions |
| S3 ACL | Bucket or object | Basic legacy grants |
| KMS key policy | KMS key | Key administration and use |

🎯 EXAM LENS

- "Share bucket with another account" → Bucket policy plus caller permissions.
- "Force HTTPS to S3" → Bucket policy denying insecure transport.
- "Control use of encryption key" → KMS key policy.
- "Disable ACL complexity" → Bucket owner enforced.

🪤 TRAPS

- KMS key policies are essential.
- S3 object access and KMS decrypt are separate checks.
- ACLs are not preferred for modern access control.
- Bucket access does not automatically grant key access.

📝 PRACTICE QUESTION<br />A partner can list an S3 bucket but cannot download KMS-encrypted objects. What is likely missing?<br />A. KMS decrypt permission and key-policy authorization  B. Internet gateway  C. Placement group  D. Transfer Acceleration

<b>Answer: A.</b> Reading the object requires permission to decrypt with the key.

🔁 ONE-LINE RECAP<br />Resource policies control resource access, and encrypted S3 objects also require correct KMS permissions.

---

### 16. AWS Resource Access Manager (RAM) (Domain 1.1)

🧒 LIKE I'M 5<br />A society has one shared clubhouse. Several families can use it without building another clubhouse. AWS RAM shares supported resources across accounts.

📖 EXPLAINED SIMPLY

- <b>AWS Resource Access Manager (RAM):</b> Shares supported AWS resources with other accounts, OUs, or an organization.
- The owner creates a resource share and selects resources and receiving principals.
- Recipients accept the share when required. Sharing inside an organization can be accepted automatically when organization sharing is enabled.
- Supported examples include VPC subnets, Transit Gateways, and Route 53 Resolver rules. The supported list depends on service and Region.
- <b>Subnet sharing:</b> A VPC owner shares subnets with other accounts. Participants can create supported resources in those subnets.
- The VPC owner retains ownership and controls the shared VPC. Participants do not become VPC owners.
- RAM reduces duplication and centralizes network management. It does not merge accounts or provide general file sharing.
- Resource sharing does not bypass the service's IAM and resource permissions.
- Use RAM when a central network account shares subnets or Transit Gateways with workload accounts.
- Do not use RAM when the need is only S3 object access. Use IAM and S3 policies.

📚 JARGON BOX

- Resource share → Named sharing arrangement.
- Principal → Account, OU, or organization receiving access.
- Participant account → Account using a shared resource.
- Shared subnet → Subnet owned by one account and used by others.
- Resource owner → Account that created and controls the resource.

⚖️ COMPARE WITH LOOKALIKES

| Method | What it shares |
| --- | --- |
| AWS RAM | Supported AWS resources |
| S3 bucket policy | Access to bucket objects |
| IAM role assumption | Temporary identity and permissions |
| VPC peering | Network connectivity between VPCs |

🎯 EXAM LENS

- "Share subnets across accounts" → AWS RAM.
- "Share Transit Gateway with many accounts" → AWS RAM.
- "Give partner read access to files" → S3 bucket policy or role.
- "Central network ownership" → Owner shares; participant keeps its account.

🪤 TRAPS

- RAM does not share every AWS resource.
- Participants do not own shared resources.
- Sharing does not grant every IAM permission.
- VPC peering connects networks; RAM shares supported resources.

📝 PRACTICE QUESTION<br />A central networking account must own subnets used by application accounts. Which service should it use?<br />A. AWS RAM  B. Cognito  C. WAF  D. CloudTrail

<b>Answer: A.</b> RAM supports subnet sharing. The other services handle identity, web filtering, and auditing.

🔁 ONE-LINE RECAP<br />AWS RAM lets accounts share supported resources while the owner retains ownership.

## ✅ Batch 1 done: topics 1–20

### Batch 1 Cheat Sheet

- EC2 operating-system patches → Customer responsibility.
- Physical data-center security → AWS responsibility.
- Survive one AZ failure → Deploy across multiple AZs.
- Secure account owner → Root MFA and no root access keys.
- Many users need same access → IAM group.
- Applicable explicit Deny → Deny wins.
- Cap developer-created roles → Permission boundary.
- EC2 or Lambda needs AWS access → IAM role.
- Temporary credentials → STS.
- Cross-account role access → Trust policy plus caller AssumeRole permission.
- Corporate workforce SSO → IAM Identity Center.
- Use existing on-premises AD → AD Connector.
- Separate accounts and one bill → Organizations consolidated billing.
- Member-account permission guardrail → SCP.
- Multi-account landing zone → Control Tower.
- Share VPC subnets between accounts → AWS RAM.

### 5 Extra Mixed Scenario Questions

<b>1.</b> Employees must use their corporate identity provider to access 15 AWS accounts without separate IAM users. What should the company use?

A. IAM Identity Center  B. Root credentials  C. S3 ACLs  D. NAT gateway

<b>Answer: A.</b> Identity Center centralizes workforce access and can use an external identity source.

<b>2.</b> An IAM policy allows an action, but an SCP explicitly denies it. What happens?

A. IAM Allow wins  B. SCP Deny wins  C. Console access works  D. Role switching removes the deny

<b>Answer: B.</b> Applicable explicit denies override allows.

<b>3.</b> A private EC2 instance needs software updates. It must not accept unsolicited internet connections. What is the best design?

A. Public subnet and public IP  B. Private subnet with NAT gateway  C. Direct route to IGW  D. S3 ACL

<b>Answer: B.</b> NAT allows connections initiated from inside and their replies. It does not expose the instance to unsolicited inbound traffic.

<b>4.</b> A central networking account must own subnets used by application accounts. Which service should it use?

A. AWS RAM  B. WAF  C. Shield  D. Config

<b>Answer: A.</b> RAM supports subnet sharing while the networking account retains ownership.

<b>5.</b> An EC2 application needs to read one S3 bucket. The company prohibits long-term keys. What should it use?

A. Root access key  B. IAM role through an instance profile  C. Shared IAM password  D. Public bucket

<b>Answer: B.</b> EC2 receives temporary role credentials through the instance profile.

⏳ Additional topics for this section will be added in Batch 2.

## ✅ Batch 1 done: topics 1–20

### Batch 1 Cheat Sheet

- EC2 operating-system patches → Customer responsibility.
- Physical data-center security → AWS responsibility.
- Survive one AZ failure → Deploy across multiple AZs.
- Secure account owner → Root MFA and no root access keys.
- Many users need same access → IAM group.
- Applicable explicit Deny → Deny wins.
- Cap developer-created roles → Permission boundary.
- EC2 or Lambda needs AWS access → IAM role.
- Temporary credentials → STS.
- Cross-account role access → Trust policy plus caller AssumeRole permission.
- Corporate workforce SSO → IAM Identity Center.
- Use existing on-premises AD → AD Connector.
- Separate accounts and one bill → Organizations consolidated billing.
- Member-account permission guardrail → SCP.
- Multi-account landing zone → Control Tower.
- Share VPC subnets between accounts → AWS RAM.

### 5 Extra Mixed Scenario Questions

<b>1.</b> Employees must use their corporate identity provider to access 15 AWS accounts without separate IAM users. What should the company use?

A. IAM Identity Center  B. Root credentials  C. S3 ACLs  D. NAT gateway

<b>Answer: A.</b> Identity Center centralizes workforce access and can use an external identity source.

<b>2.</b> An IAM policy allows an action, but an SCP explicitly denies it. What happens?

A. IAM Allow wins  B. SCP Deny wins  C. Console access works  D. Role switching removes the deny

<b>Answer: B.</b> Applicable explicit denies override allows.

<b>3.</b> A private EC2 instance needs software updates. It must not accept unsolicited internet connections. What is best?

A. Public subnet and public IP  B. Private subnet with NAT gateway  C. Direct route to IGW  D. S3 ACL

<b>Answer: B.</b> NAT allows connections initiated from inside and their replies. It does not expose the instance to unsolicited inbound traffic.

<b>4.</b> A central networking account must own subnets used by application accounts. Which service should it use?

A. AWS RAM  B. WAF  C. Shield  D. Config

<b>Answer: A.</b> RAM supports subnet sharing while the networking account retains ownership.

<b>5.</b> An EC2 application needs to read one S3 bucket. The company prohibits long-term keys. What should it use?

A. Root access key  B. IAM role through an instance profile  C. Shared IAM password  D. Public bucket

<b>Answer: B.</b> EC2 receives temporary role credentials through the instance profile.

⏳ Additional topics for this section will be added in Batch 2.

## 1.2 Design secure workloads and applications

Topics to cover, in this order:

1. VPC basics: CIDR, public vs private subnets, internet gateway, route tables
2. Security groups vs NACLs (stateful vs stateless)
3. NAT gateway and bastion host / Session Manager
4. VPC endpoints (gateway vs interface) and PrivateLink
5. Threats: DDoS, SQL injection, XSS → Shield, WAF, Firewall Manager, Network Firewall
6. Secrets Manager vs SSM Parameter Store (storing app credentials)
7. Cognito (user pools vs identity pools)
8. GuardDuty, Macie, Inspector, Detective, Security Hub — who does what

### 17. VPC basics and CIDR blocks (Domain 1.2)

🧒 LIKE I'M 5<br />A VPC is a private gated society inside AWS. CIDR is the address range reserved for homes. Subnets divide the society into smaller areas.

📖 EXPLAINED SIMPLY

- <b>Virtual Private Cloud (VPC):</b> A logically isolated network you create in an AWS Region.
- Choose an IPv4 range using CIDR (Classless Inter-Domain Routing), such as 10.0.0.0/16.
- CIDR describes a network address and prefix length. A smaller prefix number means a larger range. A /16 has more addresses than a /24.
- AWS reserves the first four and last IPv4 addresses in each subnet. A /24 therefore has 251 usable IPv4 addresses for typical subnet use.
- A VPC can have IPv4 and IPv6 CIDR ranges. You can add secondary IPv4 ranges when needed.
- Choose non-overlapping CIDR ranges when networks may connect later. Overlap complicates or prevents routing through peering and VPN designs.
- A subnet is a range inside one VPC and one AZ. Subnets cannot span AZs.
- Every subnet uses a route table. Its route table decides where traffic goes.
- VPCs are regional. Their subnets are AZ-specific.
- A VPC alone does not provide internet access. Routing, gateways, addresses, and security rules must also be configured.

📚 JARGON BOX

- VPC → Logically isolated AWS network.
- CIDR → Notation describing an IP address range.
- Prefix length → Number after the slash in CIDR.
- Subnet → Smaller IP range inside a VPC.
- IPv4 → 32-bit addressing format.
- IPv6 → 128-bit addressing format.

⚖️ COMPARE WITH LOOKALIKES

| Resource | Scope | Purpose |
| --- | --- | --- |
| VPC | Region | Main network boundary |
| Subnet | One AZ | Smaller network range |
| Route table | VPC/subnet association | Directs traffic |
| Security group | Resource network interface | Allows traffic |

🎯 EXAM LENS

- "Create isolated network space" → VPC.
- "Divide network across AZs" → Separate subnet in each AZ.
- "Avoid connectivity conflicts" → Non-overlapping CIDRs.
- "Need more addresses" → Plan CIDR capacity carefully.

🪤 TRAPS

- A subnet cannot span AZs.
- A VPC is regional.
- A VPC does not automatically provide internet access.
- AWS reserves five IPv4 addresses in every subnet.

📝 PRACTICE QUESTION<br />Two VPCs will connect through peering. Which choice avoids address-routing conflicts?<br />A. Overlapping CIDRs  B. Non-overlapping CIDRs  C. One subnet for both  D. No route tables

<b>Answer: B.</b> Peered VPCs need non-overlapping IPv4 ranges for normal routing.

🔁 ONE-LINE RECAP<br />A VPC is a regional private network, and CIDR planning defines its address space and future connectivity.

---

### 18. Public vs private subnets (Domain 1.2)

🧒 LIKE I'M 5<br />A public shop has a road to the main highway. A private storeroom has no direct road to that highway. Both can be inside the same society.

📖 EXPLAINED SIMPLY

- A <b>public subnet</b> has a route table with a route to an internet gateway for internet-bound traffic.
- For IPv4 internet access, an instance also needs a public IPv4 address or Elastic IP and suitable security rules.
- A <b>private subnet</b> has no direct route to an internet gateway for general IPv4 internet access.
- Private workloads can still reach the internet through a NAT gateway or NAT instance. Return traffic is allowed for connections initiated inside.
- A private subnet can use VPC endpoints to reach supported AWS services without NAT or public internet routing.
- A subnet is not public just because its instances have public IPs. Its route table and IGW route matter.
- Public subnets commonly host internet-facing load balancers and NAT gateways.
- Private subnets commonly host application servers and databases.
- Isolated subnets have no external routes. They may still communicate within the VPC when allowed.
- IPv6 addresses are globally routable. Outbound-only IPv6 access can use an egress-only internet gateway.
- Keep databases private. Use public subnets for controlled internet-facing entry points.

📚 JARGON BOX

- Public subnet → Subnet with a route to an internet gateway.
- Private subnet → Subnet without a direct IGW route.
- Elastic IP → Static public IPv4 address.
- NAT → Network Address Translation.
- Isolated subnet → Subnet without external routes.
- Egress → Outbound traffic.

⚖️ COMPARE WITH LOOKALIKES

| Subnet | External route | Common workload |
| --- | --- | --- |
| Public | IGW route | Internet-facing load balancer |
| Private | NAT or private endpoint if needed | Application servers |
| Isolated | No external route | Sensitive database tier |

🎯 EXAM LENS

- "Internet-facing load balancer" → Public subnets.
- "Database not directly reachable from internet" → Private or isolated subnet.
- "Private instance needs updates" → NAT gateway or controlled proxy.
- "Private access to S3" → S3 gateway endpoint.

🪤 TRAPS

- A public IP alone does not make a subnet public.
- Private subnets can have outbound access through NAT.
- NAT does not allow unsolicited inbound connections.
- A subnet belongs to one AZ.

📝 PRACTICE QUESTION<br />A database must not be directly reachable from the internet. Where should it be placed?<br />A. Private or isolated subnet  B. Public subnet with open security group  C. Edge location  D. Local Zone only

<b>Answer: A.</b> Private or isolated subnets keep the database off a direct internet route.

🔁 ONE-LINE RECAP<br />Public subnets route to an internet gateway; private subnets do not, though NAT or endpoints can provide controlled outbound access.

---

### 19. Internet gateway and route tables (Domain 1.2)

🧒 LIKE I'M 5<br />A route table is a directions board at a railway junction. It tells each packet which track to use. An internet gateway connects a VPC to the internet.

📖 EXPLAINED SIMPLY

- <b>Internet Gateway (IGW):</b> A redundant, highly available VPC component enabling internet communication.
- Attach an IGW to a VPC. Add a route in a subnet route table to send internet-bound traffic to it.
- Common default routes are 0.0.0.0/0 to an IGW for IPv4 and ::/0 to an IGW for IPv6.
- An instance generally needs a public IPv4 address or Elastic IP for IPv4 internet communication.
- The IGW performs one-to-one address translation for an instance's public IPv4 address. The instance still uses its private address inside the VPC.
- <b>Route table:</b> A set of destination-to-target rules. Every VPC has a main route table. You can create custom route tables.
- Every subnet is associated with one route table. Without an explicit association, it uses the main route table.
- Routes have a destination and target. Targets include local, IGW, NAT gateway, VPN, and peering.
- AWS uses the most specific matching route. This is called longest prefix match.
- The local route allows communication inside VPC CIDR ranges.
- Route tables determine paths, not packet permissions. Security groups and NACLs also matter.

📚 JARGON BOX

- IGW → Internet Gateway.
- Default route → Route used when no more specific route matches.
- Route target → Next hop for matching traffic.
- Longest prefix match → Most specific matching route wins.
- Main route table → Default table for subnets without custom association.
- Local route → Route for communication inside the VPC.

⚖️ COMPARE WITH LOOKALIKES

| Component | Job |
| --- | --- |
| IGW | Connect VPC to internet |
| NAT gateway | Allow private IPv4 resources to initiate internet access |
| Route table | Choose next hop |
| Security group | Allow traffic to resources |

🎯 EXAM LENS

- "Public subnet" → Route table has an IGW route.
- "0.0.0.0/0 to IGW" → General IPv4 internet route.
- "Private IPv4 server needs outbound internet" → NAT gateway.
- "Route exists but connection fails" → Check security groups, NACLs, and public IP.

🪤 TRAPS

- Attaching an IGW is not enough. A route is also required.
- An IGW route does not assign a public IP.
- Route tables do not replace security controls.
- The most specific matching route wins.

📝 PRACTICE QUESTION<br />An EC2 instance has a public IPv4 address. Its subnet has no IGW route. Why can it not access the internet through that gateway?<br />A. Missing IGW route  B. Missing S3 bucket policy  C. NAT required in same subnet  D. Missing IAM group

<b>Answer: A.</b> The subnet route table must send internet traffic to the IGW.

🔁 ONE-LINE RECAP<br />An IGW provides internet connectivity, while route tables decide whether subnet traffic uses that gateway.

---

### 20. NAT gateway vs NAT instance (Domain 1.2)

🧒 LIKE I'M 5<br />A private shop needs supplies from outside. A NAT gateway is a managed delivery counter. A NAT instance is a worker you must operate yourself.

📖 EXPLAINED SIMPLY

- <b>NAT:</b> Network Address Translation changes address information so private IPv4 resources can initiate external connections.
- <b>NAT Gateway:</b> AWS-managed NAT service. Create it in a public subnet and point private subnet routes to it.
- A public NAT gateway uses an Elastic IP and an IGW to reach the public internet. Private instances need no public IPv4 address.
- AWS manages gateway infrastructure. You do not patch or administer its operating system.
- NAT gateways scale automatically within service quotas. Check current regional quotas for large workloads.
- A NAT gateway is AZ-specific. For resilience, deploy one in each AZ that needs independent outbound access.
- If multiple AZs depend on one NAT gateway, a failure in its AZ can affect outbound traffic in other AZs. Cross-AZ routing can also add cost.
- <b>NAT instance:</b> An EC2 instance configured to perform NAT. You manage its OS, patching, scaling, failover, and source/destination check settings.
- NAT instances allow custom software and network configuration. They require more operations work.
- NAT gateways do not accept unsolicited inbound internet connections. They allow reply traffic for connections initiated inside.
- For IPv6 outbound-only access, use an egress-only internet gateway. NAT gateways mainly provide IPv4 translation.
- VPC endpoints can avoid NAT charges for supported AWS services.
- Use NAT gateways for most production IPv4 outbound access. Use NAT instances only for special control or legacy requirements.

📚 JARGON BOX

- NAT → Network Address Translation.
- NAT gateway → AWS-managed NAT service.
- NAT instance → EC2 instance configured for NAT.
- Elastic IP → Static public IPv4 address.
- Source/destination check → EC2 network check usually disabled on NAT instances.
- Egress-only IGW → Gateway for outbound-only IPv6 traffic.
- AZ-specific → Located in one Availability Zone.

⚖️ COMPARE WITH LOOKALIKES

| Feature | NAT gateway | NAT instance |
| --- | --- | --- |
| Managed | AWS | Customer |
| Scaling | Managed | Manual or custom |
| Patching | AWS | Customer |
| Resilience | Deploy per AZ | Build failover |
| Custom software | No OS control | Full OS control |
| Best fit | Most production workloads | Special needs |

🎯 EXAM LENS

- "Private IPv4 instances need outbound internet" → NAT gateway.
- "No inbound internet-initiated connections" → NAT gateway.
- "Reduce NAT charges for S3 or DynamoDB" → Gateway endpoint.
- "IPv6 outbound-only internet" → Egress-only IGW.
- "Custom NAT software" → NAT instance.

🪤 TRAPS

- NAT gateway belongs in a public subnet and needs an IGW route.
- Private subnet routes point to NAT, not directly to the IGW.
- One NAT gateway in one AZ can become an availability dependency.
- NAT is not a web application firewall.

📝 PRACTICE QUESTION<br />A production app runs in private subnets across two AZs. Instances need IPv4 internet access for updates. The company wants minimal administration and AZ resilience. What should it do?<br />A. One NAT instance in one private subnet<br />B. NAT gateway in each AZ, with private routes using the local gateway<br />C. Public IP for every instance<br />D. Egress-only IGW for IPv4

<b>Answer: B.</b> Managed NAT gateways reduce administration, and per-AZ deployment improves resilience. A requires operations. C exposes instances. D is for IPv6.

🔁 ONE-LINE RECAP<br />Use managed NAT gateways for private IPv4 outbound access, preferably one per AZ for resilient designs.

---

### 21. Security groups (Domain 1.2)

🧒 LIKE I'M 5<br />A security group is a gatekeeper standing at one building. It checks which network visitors may enter and which connections may leave.

📖 EXPLAINED SIMPLY

- A <b>security group</b> is a virtual firewall attached to a resource's network interface, such as an EC2 instance.
- It controls inbound and outbound traffic using protocol, port, and source or destination rules.
- Security groups are <b>stateful</b>. If an inbound request is allowed, its response traffic is allowed automatically.
- Rules are allow-only. You cannot create an explicit Deny rule in a security group.
- A new security group starts with no inbound allow rules. Its default outbound rule allows all outbound traffic.
- The default security group also permits traffic between resources using that same group.
- Rules can reference another security group. An app tier can reach a database without hard-coded IP addresses.
- You can attach multiple security groups to a network interface. Their allow rules are combined.
- Security groups operate at network interfaces, not entire subnets.
- Use them for app ports, database access, and management access. Allow only required sources.

📚 JARGON BOX

- Stateful → Remembers connection state and permits response traffic.
- Inbound → Traffic entering a resource.
- Outbound → Traffic leaving a resource.
- Protocol → Communication type, such as TCP or UDP.
- Port → Number identifying a service endpoint.
- Network interface → Virtual network card attached to a resource.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Security group | Network ACL |
| --- | --- | --- |
| Scope | Resource network interface | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow and deny |
| Rule order | All applicable allows | Lowest numbered matching rule |
| Response traffic | Automatically allowed | Must be allowed separately |

🎯 EXAM LENS

- "Stateful firewall" → Security group.
- "Allow HTTPS only from the load balancer" → Reference its security group.
- "Allow app tier to database on 5432" → Database group allows app group.
- "Explicit deny at subnet boundary" → NACL.

🪤 TRAPS

- Security groups are stateful, unlike NACLs.
- They do not support explicit Deny.
- They attach to network interfaces, not whole subnets.
- Multiple groups combine allow rules.

📝 PRACTICE QUESTION<br />A web server must accept HTTPS only from a load balancer. What should be configured?<br />A. Security group allowing TCP 443 from the load balancer's security group<br />B. Route table denying all other traffic<br />C. Public S3 bucket<br />D. NAT gateway

<b>Answer: A.</b> Security groups can reference another security group. Route tables do not filter traffic this way. S3 and NAT do not provide this access control.

🔁 ONE-LINE RECAP<br />Security groups are stateful resource-level firewalls that allow only required traffic.

---

### 22. Network ACLs and security groups vs NACLs (Domain 1.2)

🧒 LIKE I'M 5<br />A NACL is like a society's outer gate. It checks traffic for an entire block. Each building can still have its own security guard.

📖 EXPLAINED SIMPLY

- <b>Network Access Control List (NACL):</b> A stateless traffic filter associated with a subnet.
- It evaluates inbound and outbound rules separately. You must allow both the request and its response.
- NACL rules are numbered. AWS checks them from the lowest number upward. The first matching rule decides.
- NACLs support both Allow and Deny rules. This helps block a malicious IP range at subnet level.
- Each subnet is associated with exactly one NACL. A subnet uses the default NACL unless you associate another.
- The default NACL allows all inbound and outbound traffic. A custom NACL denies traffic unless its rules allow it.
- NACLs do not track connections. For TCP, allow required ephemeral return ports as well as service ports.
- Security groups are stateful and attach to network interfaces. NACLs are stateless and apply at subnet boundaries.
- Use security groups for most workload rules. Use NACLs for broad subnet-level Allow or Deny rules.
- A request must pass both controls when both apply.

📚 JARGON BOX

- NACL → Network Access Control List.
- Stateless → Does not remember connection state.
- Ephemeral port → Temporary client-side port used by a connection.
- First match → First numbered rule matching traffic.
- Subnet boundary → Network boundary around a subnet.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Security group | NACL |
| --- | --- | --- |
| Applied to | Network interface | Subnet |
| Stateful | Yes | No |
| Explicit Deny | No | Yes |
| Rule order | All applicable rules | Lowest numbered matching rule |
| Response traffic | Automatic | Separate rule required |

🎯 EXAM LENS

- "Block a specific IP at subnet level" → NACL Deny rule.
- "Allow response traffic automatically" → Security group.
- "Stateless" → NACL.
- "Lowest numbered matching rule" → NACL.

🪤 TRAPS

- NACLs are not stateful.
- NACLs need inbound and outbound rules.
- Security groups cannot explicitly deny a source.
- NACL rule numbers matter.

📝 PRACTICE QUESTION<br />A company must block a malicious IP from reaching every resource in one subnet. Which control supports explicit subnet-level Deny?<br />A. Security group  B. NACL  C. IAM policy  D. Instance profile

<b>Answer: B.</b> NACLs apply at subnet level and support Deny. Security groups have allow rules only. IAM and instance profiles control identity access.

🔁 ONE-LINE RECAP<br />NACLs are stateless subnet firewalls with numbered Allow and Deny rules; security groups are stateful resource firewalls.

---

### 23. Bastion host vs Systems Manager Session Manager (Domain 1.2)

🧒 LIKE I'M 5<br />A bastion host is a guarded reception desk used to reach private buildings. Session Manager is remote maintenance access that avoids exposing that desk to the internet.

📖 EXPLAINED SIMPLY

- <b>Bastion host:</b> A hardened EC2 instance in a public subnet. Administrators connect to it, then connect to private instances.
- Bastion access commonly uses SSH for Linux or RDP for Windows. Restrict inbound access to trusted IP addresses.
- You manage bastion patching, hardening, monitoring, keys, and high availability. It can become a single point of failure.
- <b>AWS Systems Manager Session Manager:</b> Provides managed shell access to supported EC2 instances without opening inbound SSH or RDP ports.
- The instance needs a suitable SSM Agent, an IAM instance role with required permissions, and connectivity to Systems Manager.
- Connectivity can use internet access or VPC interface endpoints. Private instances can remain without public IP addresses.
- Session Manager can log session activity to S3 or CloudWatch Logs when configured. Some connection methods, such as port forwarding, do not provide the same session-content logging.
- It controls access through IAM policies. Normal Session Manager access does not need SSH key distribution.
- Session Manager reduces exposed ports and bastion maintenance. It does not remove IAM, patching, or monitoring duties.
- Prefer Session Manager for managed sessions. Use a bastion only for a workflow that specifically needs a jump server.

📚 JARGON BOX

- Bastion host → Hardened jump server for reaching private systems.
- SSH → Secure Shell, commonly used for Linux remote access.
- RDP → Remote Desktop Protocol, commonly used for Windows.
- Session Manager → Managed remote sessions through Systems Manager.
- SSM Agent → Software connecting an instance to Systems Manager.
- VPC endpoint → Private connection to a supported AWS service.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Bastion host | Session Manager |
| --- | --- | --- |
| Inbound SSH/RDP | Needed on bastion | Not needed |
| Public subnet | Common | Not required |
| Keys | Often required | IAM-based access |
| Maintenance | Customer manages host | AWS manages service |
| Logging | Extra setup | Options when configured |

🎯 EXAM LENS

- "No inbound port 22 or 3389" → Session Manager.
- "Private EC2 has no public IP" → Session Manager with role and endpoint connectivity.
- "Traditional jump server" → Bastion host.
- "Audit administrator sessions" → Session Manager logging.

🪤 TRAPS

- Session Manager still needs an agent, role, and connectivity.
- Private instances may need interface endpoints without internet access.
- A bastion does not automatically secure private instances.
- Session Manager access must still follow least privilege.

📝 PRACTICE QUESTION<br />Admins need shell access to private EC2 instances. The company wants no inbound SSH rules and session logs. What is best?<br />A. Public bastion open to everyone  B. Session Manager with logging  C. Public IP on every instance  D. Disable IAM

<b>Answer: B.</b> Session Manager avoids inbound SSH and supports configured logging. A and C expose systems. D removes access control.

🔁 ONE-LINE RECAP<br />Prefer Session Manager for IAM-controlled private instance access without inbound SSH or RDP.

---

### 24. VPC endpoints: gateway vs interface (Domain 1.2)

🧒 LIKE I'M 5<br />A VPC endpoint is a private counter connecting your society to an AWS service. You use it instead of taking a public road.

📖 EXPLAINED SIMPLY

- <b>VPC endpoint:</b> A private path from a VPC to supported services without requiring public internet connectivity.
- <b>Gateway endpoint:</b> Used for Amazon S3 and DynamoDB. It adds a route to selected subnet route tables.
- Gateway endpoints do not use endpoint network interfaces. They have no hourly endpoint charge, though normal service and data-transfer charges may apply.
- <b>Interface endpoint:</b> Creates endpoint network interfaces with private IP addresses in selected subnets. It uses AWS PrivateLink.
- Interface endpoints support many AWS services and selected partner services. They have hourly and data-processing charges.
- Security groups on interface endpoints control traffic reaching those endpoint interfaces. NACLs and routing must also allow traffic.
- Both types can use endpoint policies where supported. An endpoint policy restricts principals and resources accessed through that endpoint.
- Endpoint policies do not replace IAM policies or service resource policies.
- Private DNS lets applications use normal service names that resolve to private endpoint addresses for supported interface endpoints.
- Use gateway endpoints for S3 or DynamoDB. Use interface endpoints for many other AWS services.
- Endpoints reduce dependence on NAT gateways. They do not automatically grant service permissions.

📚 JARGON BOX

- VPC endpoint → Private path from a VPC to a supported service.
- Gateway endpoint → Route-table endpoint for S3 or DynamoDB.
- Interface endpoint → Endpoint network interface with private IP.
- PrivateLink → Technology powering interface endpoint connectivity.
- Endpoint policy → Policy controlling access through an endpoint.
- Private DNS → Resolves service names to private endpoint addresses.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Gateway endpoint | Interface endpoint |
| --- | --- | --- |
| Main services | S3, DynamoDB | Many other AWS services |
| Implementation | Route table entry | Network interface |
| Private IP in subnet | No endpoint ENI | Yes |
| Hourly endpoint charge | No | Yes |
| PrivateLink powered | No | Yes |

🎯 EXAM LENS

- "Private S3 access without NAT" → S3 gateway endpoint.
- "Private DynamoDB access" → DynamoDB gateway endpoint.
- "Private access to Systems Manager or Secrets Manager" → Interface endpoint.
- "Reduce NAT charges for S3" → Gateway endpoint.

🪤 TRAPS

- Gateway endpoints are not for every AWS service.
- Interface endpoints have hourly and data-processing costs.
- Endpoint policies do not override IAM or bucket policies.
- An endpoint does not automatically allow the request.

📝 PRACTICE QUESTION<br />Private EC2 instances need S3 access without NAT gateway charges. What should be used?<br />A. S3 gateway endpoint  B. Internet gateway  C. Bastion host  D. Public IPs

<b>Answer: A.</b> The S3 gateway endpoint uses route tables and has no hourly endpoint charge. The other options do not provide private S3 service access.

🔁 ONE-LINE RECAP<br />Use gateway endpoints for S3 and DynamoDB; use interface endpoints for many other services through PrivateLink.

---

### 25. AWS PrivateLink (Domain 1.2)

🧒 LIKE I'M 5<br />Imagine a private pipe connecting your society to a service desk in another building. You reach that service without opening your whole society.

📖 EXPLAINED SIMPLY

- <b>AWS PrivateLink:</b> Provides private connectivity between VPCs and supported services using interface endpoints.
- A provider publishes an endpoint service, commonly backed by a Network Load Balancer.
- A consumer creates an interface endpoint in its VPC. AWS places network interfaces with private IPs in selected subnets.
- The consumer connects to the provider service through AWS private networking. VPC peering is not required.
- This avoids exposing the service through a public internet endpoint. It also avoids giving the consumer access to the provider's whole VPC.
- The provider can require acceptance of endpoint connection requests and control which principals may connect.
- Security groups on consumer endpoint interfaces control traffic reaching the endpoint. Provider-side controls protect the service.
- PrivateLink is useful for a provider exposing one service privately to many customer VPCs.
- It can help when VPC CIDR ranges overlap because the connection is service-oriented, not full network routing.
- It does not provide general VPC-to-VPC connectivity. Use peering or Transit Gateway for broader network connectivity.
- Interface endpoints have hourly and data-processing charges.

📚 JARGON BOX

- PrivateLink → Private service connectivity over AWS networking.
- Endpoint service → Service a provider exposes through PrivateLink.
- Consumer → Account connecting to a provider service.
- Provider → Account exposing the service.
- NLB → Network Load Balancer.
- ENI → Elastic Network Interface.

⚖️ COMPARE WITH LOOKALIKES

| Option | Connectivity | Best use |
| --- | --- | --- |
| PrivateLink | Private access to one service | SaaS or service sharing |
| VPC peering | Network connection between two VPCs | Broad VPC connectivity |
| Transit Gateway | Hub connecting many networks | Many VPCs and on-premises |
| Public endpoint | Internet-reachable service | Public access by design |

🎯 EXAM LENS

- "Expose one service privately to many VPCs" → PrivateLink.
- "No VPC peering required" → PrivateLink.
- "Overlapping consumer and provider CIDRs" → PrivateLink may work.
- "Connect entire VPC networks" → Peering or Transit Gateway.

🪤 TRAPS

- PrivateLink is not full VPC connectivity.
- The consumer does not expose its entire VPC to the provider.
- PrivateLink commonly uses interface endpoints.
- PrivateLink endpoints are chargeable.

📝 PRACTICE QUESTION<br />A vendor wants customers to access one service privately. Customer CIDR ranges may overlap. Which design fits?<br />A. PrivateLink endpoint service  B. Public internet endpoint  C. VPC peering to each customer  D. Shared root account

<b>Answer: A.</b> PrivateLink exposes a service privately without full network peering. It can work with overlapping ranges.

🔁 ONE-LINE RECAP<br />PrivateLink privately shares a specific service without exposing or connecting entire VPC networks.

---

### 26. VPC Flow Logs (Domain 1.2)

🧒 LIKE I'M 5<br />A society's security log records which gate traffic tried to use. Flow Logs record network traffic metadata to help investigate connections.

📖 EXPLAINED SIMPLY

- <b>VPC Flow Logs:</b> Capture metadata about IP traffic going to and from network interfaces in a VPC.
- Create Flow Logs at VPC, subnet, or network-interface level.
- Records can include source and destination IPs, ports, protocol, packet and byte counts, and ACCEPT or REJECT status.
- Use them to troubleshoot connectivity, find rejected traffic, and investigate unusual network patterns.
- Deliver records to CloudWatch Logs, Amazon S3, or Amazon Data Firehose.
- Flow Logs are not packet captures. They do not show actual application payload or full packet contents.
- They are not real-time packet inspection. Record delivery can be delayed and depends on aggregation.
- Flow Logs do not change network permissions. A REJECT record reports that a network control rejected traffic.
- Use Flow Logs for visibility. Use security groups, NACLs, or Network Firewall to control traffic.
- CloudTrail records AWS API activity, not VPC packet metadata.

📚 JARGON BOX

- Flow Log → Record of network traffic metadata.
- ENI → Elastic Network Interface.
- ACCEPT / REJECT → Whether network controls accepted or rejected traffic.
- Packet → Small unit of network data.
- Payload → Actual content carried inside a packet.
- Aggregation → Grouping records over a time interval.

⚖️ COMPARE WITH LOOKALIKES

| Service | What it provides |
| --- | --- |
| VPC Flow Logs | Network traffic metadata |
| CloudTrail | AWS API and account activity |
| CloudWatch Logs | Stores and queries logs |
| Network Firewall | Inspects and controls traffic |

🎯 EXAM LENS

- "Find source IPs and ports for rejected traffic" → Flow Logs.
- "Troubleshoot security group or NACL rules" → Flow Logs.
- "See packet payload" → Flow Logs cannot do this.
- "Who changed a security group?" → CloudTrail.

🪤 TRAPS

- Flow Logs do not capture packet contents.
- Flow Logs observe; they do not block.
- CloudTrail records API calls, not packet metadata.
- Destination and permissions must be configured.

📝 PRACTICE QUESTION<br />A team needs source IPs, ports, and rejected-flow records for a subnet. What should it enable?<br />A. VPC Flow Logs  B. Organizations  C. Cognito  D. S3 Transfer Acceleration

<b>Answer: A.</b> Flow Logs capture traffic metadata and acceptance status. The other services do not provide VPC traffic records.

🔁 ONE-LINE RECAP<br />VPC Flow Logs record traffic metadata for troubleshooting and investigations.

---

### 27. AWS Shield Standard vs Advanced and DDoS (Domain 1.2)

🧒 LIKE I'M 5<br />Thousands of people rush one shop gate at once. Genuine customers cannot enter. DDoS protection helps absorb or mitigate this flood.

📖 EXPLAINED SIMPLY

- <b>Distributed Denial of Service (DDoS):</b> Many systems send traffic to overwhelm an application or network.
- <b>AWS Shield Standard:</b> Included automatically. It helps protect supported AWS resources against common DDoS attacks.
- <b>AWS Shield Advanced:</b> Paid enhanced protection for eligible resources. It provides additional detection, mitigation, visibility, and access to AWS's DDoS Response Team under service terms.
- Shield protects supported services such as CloudFront, Route 53, and Elastic Load Balancing.
- Layer 3 and 4 attacks target network and transport protocols. Layer 7 attacks target application behavior, such as expensive HTTP requests.
- AWS WAF filters HTTP and HTTPS requests. Shield focuses on DDoS protection.
- Shield Advanced can integrate with WAF for application-layer mitigation.
- Advanced can offer eligible DDoS cost-protection features. Check current eligibility and terms.
- Use Standard as the baseline. Consider Advanced for business-critical applications needing enhanced response support.
- Shield does not replace WAF, rate limiting, secure application design, or capacity planning.

📚 JARGON BOX

- DDoS → Distributed Denial of Service attack.
- Layer 3 → Network layer, commonly IP.
- Layer 4 → Transport layer, commonly TCP or UDP.
- Layer 7 → Application layer, such as HTTP.
- Mitigation → Reducing an attack's impact.
- DDoS Response Team → AWS specialists supporting eligible Shield Advanced customers.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main protection | Cost pattern |
| --- | --- | --- |
| Shield Standard | Baseline DDoS protection | Included automatically |
| Shield Advanced | Enhanced DDoS and response support | Paid subscription |
| AWS WAF | Web request filtering | Separate usage charges |
| CloudFront | Edge delivery and caching | Usage-based |

🎯 EXAM LENS

- "Automatic basic DDoS protection" → Shield Standard.
- "Enhanced protection and specialist response" → Shield Advanced.
- "Filter SQL injection or HTTP requests" → AWS WAF.
- "Absorb web traffic at edge locations" → CloudFront with Shield.

🪤 TRAPS

- Shield and WAF are not the same.
- Shield Standard is automatic; Advanced is paid.
- WAF does not replace network-layer DDoS protection.
- Shield does not guarantee unlimited application capacity.

📝 PRACTICE QUESTION<br />A financial website needs enhanced DDoS protection and AWS specialist response support. What should it choose?<br />A. Shield Advanced  B. Shield Standard only  C. S3 Glacier  D. AWS Config

<b>Answer: A.</b> Advanced offers enhanced protection and response support. Standard is baseline protection. Glacier and Config do not mitigate DDoS attacks.

🔁 ONE-LINE RECAP<br />Shield Standard provides baseline protection; Shield Advanced adds paid enhanced DDoS protection and response support.

---

### 28. AWS WAF: SQL injection, XSS, rate limiting, geo blocking (Domain 1.2)

🧒 LIKE I'M 5<br />A website has a security guard who checks each request before it reaches the app. WAF is that guard. It blocks suspicious web requests.

📖 EXPLAINED SIMPLY

- <b>AWS Web Application Firewall (WAF):</b> Filters web requests before they reach supported resources.
- It protects supported services such as CloudFront, Application Load Balancer, and API Gateway.
- A <b>web ACL</b> is a collection of rules associated with a protected resource.
- Rules inspect details such as IP address, URI path, query string, headers, method, and supported request-body content.
- <b>SQL injection rule:</b> Detects patterns trying to manipulate database queries through user input.
- <b>Cross-site scripting (XSS) rule:</b> Detects suspicious script content that may execute in a visitor's browser.
- <b>Rate-based rule:</b> Counts requests and applies an action when traffic exceeds the configured rate.
- <b>Geo match rule:</b> Matches requests based on country of origin. It can block or allow selected countries.
- AWS Managed Rules provide prebuilt rule groups. You can also create custom rules.
- Rule actions include Allow, Block, Count, CAPTCHA, and Challenge where supported.
- Use WAF for application-layer HTTP filtering. Use Shield for DDoS protection and Network Firewall for VPC network inspection.
- WAF does not fix insecure application code. It is another protection layer.

📚 JARGON BOX

- WAF → Web Application Firewall.
- Web ACL → Collection of web filtering rules.
- SQL injection → Attack manipulating database queries through input.
- XSS → Cross-site scripting; injected script runs in a browser.
- Rate-based rule → Rule limiting request frequency.
- Geo match → Rule based on request country.

⚖️ COMPARE WITH LOOKALIKES

| Service | Best protection |
| --- | --- |
| AWS WAF | HTTP application requests |
| Shield | DDoS attacks |
| Network Firewall | VPC network traffic |
| Security group | Resource interface traffic |

🎯 EXAM LENS

- "Protect website against SQL injection or XSS" → WAF.
- "Limit excessive requests from one source" → Rate-based rule.
- "Block requests from selected countries" → Geo match.
- "DDoS specialist response" → Shield Advanced.

🪤 TRAPS

- WAF filters web requests; it is not a general network firewall.
- Rate limiting does not replace DDoS protection.
- Managed rules still need correct association and configuration.
- Geo blocking is different from blocking one IP.

📝 PRACTICE QUESTION<br />An online shop receives excessive HTTP requests from one source. What should it configure?<br />A. WAF rate-based rule  B. EBS snapshot  C. IAM boundary  D. NAT instance

<b>Answer: A.</b> A rate-based rule tracks request counts and applies an action. The other options do not filter HTTP traffic.

🔁 ONE-LINE RECAP<br />AWS WAF filters HTTP requests using managed or custom threat, rate-limit, and geographic rules.

---

### 29. AWS Firewall Manager (Domain 1.2)

🧒 LIKE I'M 5<br />A school principal wants the same safety rules in every classroom. Firewall Manager helps a central security team apply policies across many AWS accounts.

📖 EXPLAINED SIMPLY

- <b>AWS Firewall Manager:</b> Centrally manages supported firewall and security policies across an AWS Organization.
- It works with protections such as AWS WAF, Shield Advanced, security groups, and AWS Network Firewall.
- A security administrator defines a policy and selects accounts, OUs, and resource types.
- Firewall Manager can automatically apply or maintain protections for in-scope resources, depending on policy settings.
- It can audit resources and identify accounts that do not meet policy requirements.
- It relies on Organizations and required service permissions.
- Firewall Manager is a central management service. It does not inspect packets by itself.
- Use it when many accounts need consistent web ACLs, DDoS protection, or network firewall policies.
- Use WAF directly when you only need a web ACL for one resource.
- Firewall Manager manages policies; Network Firewall inspects network traffic.

📚 JARGON BOX

- Firewall policy → Central configuration for selected resources.
- Organization → Group of AWS accounts managed together.
- OU → Organizational Unit.
- Compliance → Whether resources meet required controls.
- Remediation → Correcting a non-compliant configuration.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main job |
| --- | --- |
| Firewall Manager | Central policy management across accounts |
| AWS WAF | Filters web requests |
| Shield Advanced | Enhanced DDoS protection |
| Network Firewall | Inspects and filters VPC traffic |

🎯 EXAM LENS

- "Consistent WAF rules across many accounts" → Firewall Manager.
- "Protect new resources in selected OUs" → Firewall Manager policy.
- "Inspect traffic inside VPC" → Network Firewall.
- "Configure one website's web ACL" → WAF.

🪤 TRAPS

- Firewall Manager is not the packet-inspection engine.
- It depends on Organizations and service prerequisites.
- WAF and Network Firewall enforce traffic rules; Firewall Manager manages them.
- Policy scope must include the intended resources.

📝 PRACTICE QUESTION<br />A company has 80 accounts. It wants centrally managed WAF rules for internet-facing load balancers. What should it use?<br />A. Firewall Manager  B. Repeat WAF setup manually in every account  C. Macie  D. AWS Backup

<b>Answer: A.</b> Firewall Manager centrally manages WAF policies across accounts. B requires manual duplication. Macie and Backup solve unrelated tasks.

🔁 ONE-LINE RECAP<br />Firewall Manager centrally applies and audits supported firewall protections across an AWS Organization.

---

### 30. AWS Network Firewall (Domain 1.2)

🧒 LIKE I'M 5<br />A society has an inspection gate for cars entering and leaving. Network Firewall inspects network traffic between VPC subnets and destinations.

📖 EXPLAINED SIMPLY

- <b>AWS Network Firewall:</b> A managed, stateful network firewall for protecting VPC traffic.
- Deploy firewall endpoints into dedicated subnets. Route selected traffic through endpoints using route tables.
- It supports stateful and stateless rule groups.
- <b>Stateless rules</b> inspect packets independently. <b>Stateful rules</b> can track connection context and use supported rules such as Suricata-compatible rules.
- It can filter IP addresses, ports, protocols, domains, and other supported traffic patterns.
- It supports intrusion prevention and domain-based filtering through supported rule features.
- It can inspect inbound, outbound, and VPC-to-VPC traffic when routing is designed correctly.
- Routes must send traffic through the firewall. A firewall endpoint that traffic bypasses provides no protection.
- Deploy resilient endpoints and routing across AZs where availability matters.
- Use Network Firewall for VPC traffic inspection. Use WAF for HTTP requests and security groups for resource-level access.
- Endpoint and traffic processing charges apply.

📚 JARGON BOX

- Stateful inspection → Tracks connection context.
- Stateless inspection → Evaluates packets independently.
- Rule group → Collection of firewall rules.
- Suricata → Network threat-detection rule syntax.
- Firewall endpoint → Network interface through which traffic is routed.
- Route symmetry → Forward and return paths use compatible inspection routes.

⚖️ COMPARE WITH LOOKALIKES

| Service | Scope |
| --- | --- |
| Network Firewall | VPC network traffic |
| AWS WAF | HTTP and HTTPS requests |
| Security groups | Resource network interfaces |
| NACLs | Subnet-level stateless filtering |

🎯 EXAM LENS

- "Managed firewall for VPC traffic inspection" → Network Firewall.
- "Stateful and stateless rule groups" → Network Firewall.
- "SQL injection in website requests" → WAF.
- "Only app tier reaches database port" → Security group.

🪤 TRAPS

- Routes must direct traffic through firewall endpoints.
- WAF is for web requests, not general packet filtering.
- Security groups are not deep packet inspection appliances.
- Return routing matters.

📝 PRACTICE QUESTION<br />A company needs managed inspection of outbound VPC traffic using stateful network rules. Which service is best?<br />A. Network Firewall  B. Cognito  C. S3 bucket policy  D. Identity Center

<b>Answer: A.</b> Network Firewall inspects VPC traffic. The other services handle identity or storage access.

🔁 ONE-LINE RECAP<br />Network Firewall provides managed stateful and stateless traffic inspection when VPC routes direct traffic through it.

---

### 31. Secrets Manager vs Systems Manager Parameter Store (Domain 1.2)

🧒 LIKE I'M 5<br />A locked cupboard stores valuable keys. A labelled drawer stores ordinary settings. Secrets Manager is built for managing and rotating secrets. Parameter Store holds configuration values and can also protect secrets.

📖 EXPLAINED SIMPLY

- <b>AWS Secrets Manager:</b> Stores and manages secrets such as database passwords, API keys, and credentials.
- It supports automatic rotation when configured with a compatible rotation workflow. Supported patterns commonly use Lambda.
- Applications retrieve secrets at runtime through an API. This avoids passwords in source code or configuration files.
- It integrates with supported AWS services, including database credential rotation patterns.
- <b>Systems Manager Parameter Store:</b> Stores configuration data and secrets as String, StringList, or SecureString parameters.
- <b>SecureString</b> uses KMS encryption. Standard parameters have no additional parameter charge, subject to service limits. Advanced parameters have extra pricing and capabilities.
- Parameter Store supports hierarchical paths. This helps organize settings by application and environment.
- It does not provide the same built-in general secret-rotation workflow as Secrets Manager. Rotation can be built separately.
- Secrets Manager charges per secret and API usage. Parameter Store can be cheaper for simple configuration.
- Use Secrets Manager when rotation and secret lifecycle management matter. Use Parameter Store for configuration and simpler protected values.
- Never hard-code secrets in source code, container images, or AMIs.

📚 JARGON BOX

- Secret → Sensitive credential or value.
- Rotation → Replacing an old credential with a new one.
- SecureString → Parameter Store value encrypted with KMS.
- Hierarchical path → Naming structure grouping related parameters.
- Runtime retrieval → Application reads a value while running.
- KMS → Key Management Service.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Secrets Manager | Parameter Store |
| --- | --- | --- |
| Main purpose | Secret lifecycle | Configuration and parameters |
| Automatic rotation | Built-in workflow when configured | No equivalent general built-in workflow |
| Encryption | Uses KMS | SecureString uses KMS |
| Cost | Per secret and API usage | Standard tier has no additional parameter charge |
| Best use | Rotating database passwords | App settings and simpler protected values |

🎯 EXAM LENS

- "Automatically rotate database credentials" → Secrets Manager.
- "Store app settings in hierarchical paths" → Parameter Store.
- "Encrypted parameter" → SecureString.
- "Avoid hard-coded database password" → Retrieve from either protected service.

🪤 TRAPS

- Parameter Store can store secrets; it is not plain text only.
- Secrets Manager rotation requires configuration.
- Secrets Manager usually costs more for simple static configuration.
- Encryption does not itself authorize retrieval.

📝 PRACTICE QUESTION<br />An application uses a database password that must rotate automatically. Which service should it choose?<br />A. Secrets Manager  B. S3 Standard  C. CloudWatch dashboard  D. Security group

<b>Answer: A.</b> Secrets Manager supports dedicated secret rotation workflows. The other services do not manage database credentials.

🔁 ONE-LINE RECAP<br />Use Secrets Manager for secret lifecycle and rotation; use Parameter Store for configuration and simpler encrypted parameters.

---

### 32. Amazon Cognito: User Pools vs Identity Pools (Domain 1.2)

🧒 LIKE I'M 5<br />A cinema first checks who you are, then gives you a ticket. Cognito User Pools handle customer sign-in. Identity Pools can give authenticated users temporary AWS credentials.

📖 EXPLAINED SIMPLY

- <b>Amazon Cognito:</b> Helps web and mobile applications manage customer identity and access.
- <b>User Pool:</b> A customer directory for sign-up, sign-in, passwords, MFA, and tokens.
- User Pools can support social and enterprise federation. After authentication, they issue ID, access, and refresh tokens.
- <b>Identity Pool:</b> Exchanges supported identities for temporary AWS credentials through IAM roles.
- Identity Pools can support authenticated and guest access when configured. Guest access must be tightly restricted.
- An app can use a User Pool for authentication, then an Identity Pool when it needs direct access to approved AWS resources.
- User Pools answer "Who is this user?" Identity Pools answer "Which temporary AWS permissions can this identity receive?"
- Use User Pools for customer sign-in. Use Identity Pools when the client app needs temporary credentials for AWS services.
- Never put long-term IAM access keys in a browser or mobile app.
- Cognito is for application customers. IAM Identity Center is for workforce access.

📚 JARGON BOX

- User Pool → Customer directory and sign-in service.
- Identity Pool → Service providing temporary AWS credentials to identities.
- ID token → Token containing identity claims.
- Access token → Token used to authorize protected API access.
- Refresh token → Token used to obtain new tokens.
- Guest identity → Unauthenticated identity with restricted permissions.

⚖️ COMPARE WITH LOOKALIKES

| Feature | User Pool | Identity Pool |
| --- | --- | --- |
| Main job | Authentication | AWS credential authorization |
| Customer directory | Yes | No |
| Issues Cognito tokens | Yes | Uses identity federation |
| Issues AWS credentials | Not by itself | Yes, temporary credentials |
| Typical use | Customer login | Client access to AWS services |

🎯 EXAM LENS

- "Customer sign-up and sign-in" → User Pool.
- "Temporary AWS credentials for mobile app" → Identity Pool.
- "Social login" → User Pool federation, possibly with Identity Pool.
- "Employee access to many AWS accounts" → IAM Identity Center.

🪤 TRAPS

- User Pools do not directly provide IAM credentials.
- Identity Pools are not a customer directory.
- Do not put IAM user keys in client applications.
- Authentication and AWS resource authorization are separate.

📝 PRACTICE QUESTION<br />A mobile app needs customer sign-in and temporary permission to upload photos to a restricted S3 bucket. Which design fits?<br />A. User Pool plus Identity Pool with scoped IAM role<br />B. Root credentials in the app<br />C. Shared IAM user key<br />D. Public bucket write

<b>Answer: A.</b> User Pool authenticates. Identity Pool provides temporary scoped credentials. B and C expose credentials. D makes the bucket public.

🔁 ONE-LINE RECAP<br />Cognito User Pools authenticate customers; Identity Pools can exchange identities for temporary AWS credentials.

---

### 33. Amazon GuardDuty (Domain 1.2)

🧒 LIKE I'M 5<br />A security guard watches for unusual activity around a society. GuardDuty analyses AWS signals and alerts you when activity looks suspicious.

📖 EXPLAINED SIMPLY

- <b>Amazon GuardDuty:</b> A threat-detection service that analyses supported AWS data sources for suspicious activity.
- It can analyse CloudTrail management events, VPC Flow Logs, DNS logs, and optional protection-plan data.
- AWS manages the detection infrastructure. GuardDuty uses threat intelligence and machine learning.
- It creates <b>findings</b> describing suspected threats, affected resources, severity, and evidence.
- Examples include unusual API calls, suspicious IP communication, compromised credentials, and possible cryptocurrency mining.
- GuardDuty can be managed across accounts using Organizations and delegated administration.
- Optional protection plans extend detection for supported workloads and data sources.
- GuardDuty detects and reports threats. It does not automatically fix every finding.
- EventBridge and automation can respond, such as isolating an instance or disabling a compromised key.
- Use GuardDuty for continuous threat detection. Use Detective to investigate and Security Hub to centralize findings.

📚 JARGON BOX

- Threat detection → Finding suspicious or malicious activity.
- Finding → Security alert describing suspected activity.
- Threat intelligence → Information about known malicious indicators.
- Machine learning → Pattern recognition learned from data.
- Delegated administrator → Central account managing a service for an organization.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main job |
| --- | --- |
| GuardDuty | Detect threats and suspicious activity |
| Macie | Discover sensitive data in S3 |
| Inspector | Find workload vulnerabilities |
| Detective | Investigate evidence and relationships |
| Security Hub | Central security posture and findings |

🎯 EXAM LENS

- "Unexpected API calls or suspicious IP activity" → GuardDuty.
- "Continuous threat detection" → GuardDuty.
- "Investigate a GuardDuty finding" → Detective.
- "Discover PII in S3" → Macie.

🪤 TRAPS

- GuardDuty detects threats; it is not a general vulnerability scanner.
- It does not replace CloudTrail.
- Findings need automated or human response.
- Macie and Inspector solve different security problems.

📝 PRACTICE QUESTION<br />A company needs continuous detection of suspicious API calls and unusual network activity across accounts. Which service?<br />A. GuardDuty  B. Macie  C. RAM  D. Storage Gateway

<b>Answer: A.</b> GuardDuty analyses supported AWS signals. Macie focuses on sensitive S3 data. RAM shares resources. Storage Gateway provides hybrid storage.

🔁 ONE-LINE RECAP<br />GuardDuty continuously analyses AWS security signals and creates findings about suspicious activity.

---

### 34. Amazon Macie (Domain 1.2)

🧒 LIKE I'M 5<br />A records clerk checks a warehouse for passports and private documents. Macie scans S3 data to find sensitive information that may need stronger protection.

📖 EXPLAINED SIMPLY

- <b>Amazon Macie:</b> Discovers and helps protect sensitive data stored in Amazon S3.
- It uses automated data discovery, machine learning, and pattern matching.
- It can identify personal, financial, and credential information through supported identifiers and custom data identifiers.
- <b>Sensitive data discovery jobs</b> scan selected buckets or objects. Automated discovery provides ongoing visibility within its configured scope.
- Findings identify buckets and objects with sensitive data or risky settings. Investigate them and choose protective controls.
- It can help identify publicly accessible or externally shared buckets, depending on findings and configuration.
- Macie does not classify every business document perfectly. Validate important findings and tune custom identifiers.
- Macie focuses on S3 data. It is not a general threat detector for all resources.
- Use it for data discovery, compliance support, and identifying sensitive S3 content.
- Use GuardDuty for suspicious activity and Inspector for software vulnerabilities.

📚 JARGON BOX

- Sensitive data → Information requiring special protection.
- PII → Personally Identifiable Information.
- Data discovery → Finding where information is stored.
- Custom data identifier → Pattern for organization-specific sensitive data.
- Finding → Alert describing a discovered risk.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main question |
| --- | --- |
| Macie | Where is sensitive data in S3? |
| GuardDuty | Is suspicious activity happening? |
| Inspector | Are workloads vulnerable? |
| Security Hub | What is the overall security posture? |

🎯 EXAM LENS

- "Find PII in S3 buckets" → Macie.
- "Sensitive data discovery" → Macie.
- "Suspicious API activity" → GuardDuty.
- "Software package vulnerabilities" → Inspector.

🪤 TRAPS

- Macie is not a general antivirus scanner.
- It focuses on Amazon S3.
- Findings do not automatically fix bucket permissions.
- Sensitive-data discovery differs from threat detection.

📝 PRACTICE QUESTION<br />A healthcare company must discover objects containing personal information across S3 buckets. Which service?<br />A. Macie  B. GuardDuty  C. Shield  D. CloudFront

<b>Answer: A.</b> Macie discovers sensitive S3 data. The other services focus on DDoS, threat detection, or content delivery.

🔁 ONE-LINE RECAP<br />Macie discovers sensitive information and data risks in Amazon S3.

---

### 35. Amazon Inspector (Domain 1.2)

🧒 LIKE I'M 5<br />A building inspector checks walls and wiring for weaknesses. Inspector checks supported AWS workloads and software for known vulnerabilities and exposure.

📖 EXPLAINED SIMPLY

- <b>Amazon Inspector:</b> An automated vulnerability management service for supported AWS workloads.
- It can assess EC2 instances, container images in Amazon ECR, and supported Lambda functions.
- For EC2, it evaluates operating-system and package vulnerabilities. It can also identify network reachability exposure.
- For ECR, it scans container images for software vulnerabilities.
- For Lambda, it scans supported functions and dependencies for known vulnerabilities.
- Findings include affected resources, vulnerability details, severity, and remediation guidance.
- Inspector uses vulnerability intelligence and can update findings as new vulnerabilities appear.
- Use it to identify known software weaknesses before attackers exploit them.
- Inspector does not automatically patch every resource. Teams must update vulnerable packages and redeploy or remediate workloads.
- GuardDuty detects suspicious activity. Inspector finds vulnerabilities.

📚 JARGON BOX

- Vulnerability → Weakness attackers may exploit.
- CVE → Common Vulnerabilities and Exposures identifier.
- Package → Software component installed in a system.
- Container image → Packaged filesystem and app used by a container.
- Reachability → Whether a network path can reach a resource.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main job |
| --- | --- |
| Inspector | Find workload and image vulnerabilities |
| GuardDuty | Detect suspicious activity |
| Macie | Find sensitive S3 data |
| Security Hub | Aggregate posture and findings |

🎯 EXAM LENS

- "Find vulnerable packages on EC2" → Inspector.
- "Scan ECR container images" → Inspector.
- "Known vulnerabilities in Lambda dependencies" → Inspector.
- "Unusual API calls" → GuardDuty.

🪤 TRAPS

- Inspector finds weaknesses; it does not automatically patch everything.
- GuardDuty is not the primary vulnerability scanner.
- Macie does not scan packages for CVEs.
- Customer teams still remediate findings.

📝 PRACTICE QUESTION<br />A company wants to scan ECR images for known software vulnerabilities. Which service?<br />A. Inspector  B. Macie  C. Shield  D. RAM

<b>Answer: A.</b> Inspector scans supported ECR images. Macie discovers sensitive S3 data. Shield protects against DDoS. RAM shares resources.

🔁 ONE-LINE RECAP<br />Inspector identifies known vulnerabilities and network exposure in supported EC2, ECR, and Lambda workloads.

---

### 36. Amazon Detective and AWS Security Hub (Domain 1.2)

🧒 LIKE I'M 5<br />GuardDuty raises an alarm. Detective is the investigator connecting clues. Security Hub is the central board showing findings and security posture.

📖 EXPLAINED SIMPLY

- <b>Amazon Detective:</b> Helps investigate, analyse, and visualise security findings and related activity.
- It processes supported data such as CloudTrail, VPC Flow Logs, and GuardDuty findings into linked datasets.
- It builds visual summaries of relationships between users, IP addresses, resources, and events.
- Detective helps answer what happened and how resources are connected after a suspicious event.
- <b>AWS Security Hub:</b> Central security posture management. It aggregates findings from supported AWS security services and partners.
- Security Hub evaluates supported security standards and controls. It gives a central view across accounts and Regions.
- Findings use a common format and can feed response workflows.
- Security Hub is not the primary detector for every threat. GuardDuty, Inspector, and Macie create specialized findings.
- Detective focuses on investigation. Security Hub focuses on aggregation, posture, and prioritization.
- Use specialized services to detect, Security Hub to centralize, and Detective to investigate.

📚 JARGON BOX

- Security finding → Reported security issue or suspicious event.
- Investigation → Analysing evidence to understand an incident.
- Security posture → Overall state of security controls.
- Aggregation → Combining findings from multiple sources.
- Relationship graph → Visual links between related entities.

⚖️ COMPARE WITH LOOKALIKES

| Service | Question answered |
| --- | --- |
| GuardDuty | Is suspicious activity happening? |
| Detective | How are evidence and entities connected? |
| Security Hub | What security issues and control gaps exist? |
| Inspector | Which workloads have vulnerabilities? |
| Macie | Where is sensitive S3 data? |

🎯 EXAM LENS

- "Investigate GuardDuty findings" → Detective.
- "Visualise relationships between IPs, users, and resources" → Detective.
- "Central view of findings and standards" → Security Hub.
- "Detect suspicious activity" → GuardDuty.

🪤 TRAPS

- Security Hub does not replace specialized detectors.
- Detective investigates; it is not the main prevention service.
- Findings aggregation does not automatically remediate every issue.
- GuardDuty, Detective, and Security Hub have different jobs.

📝 PRACTICE QUESTION<br />A team receives a GuardDuty finding. It wants to analyse related IP addresses, user activity, and resource relationships. Which service?<br />A. Detective  B. Macie  C. Shield  D. RAM

<b>Answer: A.</b> Detective explores evidence and relationships. Macie finds sensitive data. Shield protects against DDoS. RAM shares resources.

🔁 ONE-LINE RECAP<br />Security Hub centralizes findings and posture; Detective helps investigate how suspicious events connect.

---

### 37. Site-to-Site VPN and Client VPN (Domain 1.2)

🧒 LIKE I'M 5<br />A company connects its office network to an AWS VPC with a secure tunnel. A travelling employee connects a laptop through a separate secure tunnel.

📖 EXPLAINED SIMPLY

- <b>AWS Site-to-Site VPN:</b> Connects an on-premises network to an AWS VPC using encrypted IPsec tunnels.
- The AWS side uses a virtual private gateway for one VPC or a Transit Gateway for multiple networks.
- The customer side uses a customer gateway device. AWS stores its configuration as a customer gateway resource.
- A Site-to-Site VPN connection includes two tunnels. Configure both for availability and failover.
- VPN traffic travels over the internet but is encrypted using IPsec.
- <b>AWS Client VPN:</b> A managed remote-access VPN for individual users and devices.
- Employees connect through a VPN client and supported authentication methods. They can reach authorized VPC resources and on-premises networks through configured routes.
- Client VPN supports authorization rules and supported authentication options, including mutual certificate authentication and user-based authentication.
- Site-to-Site is for network-to-network connectivity. Client VPN is for remote users.
- VPN is usually quicker to set up than Direct Connect. Internet paths may have variable performance.
- Use VPN for encrypted connectivity, remote workforce access, backup links, and hybrid networks.

📚 JARGON BOX

- Site-to-Site → Connection between whole networks.
- Client VPN → Remote access for individual devices.
- IPsec → Protocol suite encrypting IP traffic.
- Tunnel → Encrypted logical path.
- Customer gateway → AWS resource representing the customer-side device.
- Virtual private gateway → AWS VPN endpoint attached to one VPC.
- Transit Gateway → Central network hub.

⚖️ COMPARE WITH LOOKALIKES

| Option | Connection | Typical use |
| --- | --- | --- |
| Site-to-Site VPN | On-premises network to AWS | Branch office |
| Client VPN | Individual client to AWS | Remote employees |
| Direct Connect | Dedicated network connection | Consistent private connectivity |

🎯 EXAM LENS

- "Connect office network to VPC using encryption" → Site-to-Site VPN.
- "Remote employees connect individually" → Client VPN.
- "Two tunnels for resilience" → Site-to-Site VPN.
- "Dedicated, predictable path" → Direct Connect, with separate encryption if needed.

🪤 TRAPS

- Client VPN is not Site-to-Site VPN.
- VPN uses encrypted tunnels over an internet connection.
- Configure both Site-to-Site tunnels.
- Routes and authorization must allow the desired traffic.

📝 PRACTICE QUESTION<br />Employees working from home need secure access to private AWS resources from laptops. Which service?<br />A. Client VPN  B. Site-to-Site VPN only  C. S3 Transfer Acceleration  D. RAM

<b>Answer: A.</b> Client VPN provides remote-user access. Site-to-Site connects whole networks. The other options solve unrelated tasks.

🔁 ONE-LINE RECAP<br />Site-to-Site VPN connects networks; Client VPN connects remote users and devices.

---

### 38. AWS Direct Connect: encryption and resiliency (Domain 1.2)

🧒 LIKE I'M 5<br />A VPN is like sending a sealed parcel through public roads. Direct Connect is like reserving a dedicated road to AWS. The road is private, but encryption still needs planning.

📖 EXPLAINED SIMPLY

- <b>AWS Direct Connect (DX):</b> Provides a dedicated network connection from a customer data center or colocation facility to AWS.
- It offers more consistent network performance and private connectivity than internet-based VPN paths.
- Virtual interfaces provide access to public AWS services, VPCs, or supported network destinations.
- Direct Connect does <b>not encrypt traffic by default</b>.
- Use application-level TLS, IPsec VPN over Direct Connect, or MACsec where supported.
- <b>DX plus Site-to-Site VPN:</b> Run an IPsec VPN over Direct Connect. This adds encryption over the dedicated path.
- <b>MACsec:</b> Link-layer encryption available on eligible connections and locations. Confirm router, port, and connection support.
- Direct Connect is not resilient simply because it is dedicated. A single connection can fail.
- Use multiple connections, devices, and locations for higher resilience. The Direct Connect Resiliency Toolkit provides design models.
- A common backup design uses Direct Connect as primary and Site-to-Site VPN as backup. Routing must support failover.
- Direct Connect often takes longer to provision than VPN. Use it for large transfers, hybrid workloads, and predictable networking.
- Do not choose DX when immediate setup is the only priority. VPN can be deployed faster.

📚 JARGON BOX

- Direct Connect → Dedicated network connection to AWS.
- Virtual interface → Logical connection type over Direct Connect.
- IPsec → Protocol encrypting IP traffic.
- MACsec → Link-layer encryption for supported Ethernet connections.
- Resiliency → Ability to continue when a connection fails.
- Colocation → Facility where customer and provider network equipment connect.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Direct Connect | Site-to-Site VPN |
| --- | --- | --- |
| Path | Dedicated connection | Internet path |
| Encryption by default | No | IPsec encrypted |
| Performance | More consistent | Depends on internet path |
| Setup | Often longer | Usually quicker |
| Typical role | Primary hybrid link | Encrypted link or backup |

🎯 EXAM LENS

- "Dedicated, consistent connectivity" → Direct Connect.
- "Encrypt DX traffic" → IPsec VPN over DX or supported MACsec.
- "Quick encrypted connection" → Site-to-Site VPN.
- "DX failure backup" → Independent DX or VPN backup with correct routing.
- "Maximum resilience" → Redundant DX connections in separate locations.

🪤 TRAPS

- Direct Connect is not encrypted by default.
- A single DX connection can be a single point of failure.
- VPN over DX provides IPsec encryption; DX alone does not.
- Backup links require routing and failover configuration.

📝 PRACTICE QUESTION<br />A bank needs dedicated AWS connectivity and encryption in transit. Which design meets both needs?<br />A. Direct Connect alone<br />B. Direct Connect with IPsec Site-to-Site VPN over it<br />C. Public S3 bucket<br />D. NAT gateway

<b>Answer: B.</b> Direct Connect provides the dedicated path. IPsec adds encryption. A is not encrypted by default. C and D do not meet the network requirement.

🔁 ONE-LINE RECAP<br />Direct Connect provides dedicated connectivity, but add IPsec VPN or supported MACsec when encryption is required.

## 1.3 Determine appropriate data security controls

Topics to cover, in this order:

1. Encryption at rest vs in transit
2. KMS: AWS managed vs customer managed keys, key policies, rotation, envelope encryption
3. CloudHSM vs KMS
4. S3 encryption options (SSE-S3, SSE-KMS, SSE-C, client-side) and bucket policies forcing TLS
5. ACM and TLS certificates (renewal)
6. S3 security: Block Public Access, Object Lock, versioning, MFA delete
7. Backups and replication: AWS Backup, cross-Region replication, snapshots
8. Data lifecycle, retention, classification and compliance (AWS Artifact, Config rules)

---

### 39. Encryption at rest vs encryption in transit (Domain 1.3)

🧒 LIKE I'M 5<br />A locked cupboard protects a document while stored. A sealed envelope protects it while travelling. Encryption protects data in both situations.

📖 EXPLAINED SIMPLY

- <b>Encryption</b> converts readable data into ciphertext using a key. Authorized users can decrypt it.
- <b>Encryption at rest</b> protects stored data. Examples include S3 objects, EBS volumes, RDS databases, snapshots, and backups.
- <b>Encryption in transit</b> protects data moving between users, applications, services, or networks.
- <b>TLS (Transport Layer Security)</b> commonly protects web and API traffic. HTTPS means HTTP protected by TLS.
- AWS KMS manages keys for many AWS services. AWS Certificate Manager manages TLS certificates for supported integrations.
- At-rest encryption helps if storage media or snapshots are accessed without authorization. Access controls are still required.
- In-transit encryption protects against interception and tampering while data travels. Certificate validation matters.
- Some workloads need both. An application can upload over HTTPS and store the object using S3 server-side encryption.
- <b>Client-side encryption</b> encrypts data before sending it to AWS. The customer controls encryption before upload.
- <b>Server-side encryption</b> is performed by the AWS service after it receives the data.
- Encryption does not replace IAM, bucket policies, network security, backups, or retention controls.
- Use at-rest encryption for stored sensitive data and TLS for network communication. Apply both when required.

📚 JARGON BOX

- Plaintext → Readable original data.
- Ciphertext → Encrypted, unreadable data.
- Encryption key → Value used to encrypt or decrypt.
- TLS → Protocol protecting network data.
- HTTPS → HTTP traffic protected by TLS.
- Client-side encryption → Data encrypted before reaching AWS.
- Server-side encryption → AWS encrypts data after receiving it.

⚖️ COMPARE WITH LOOKALIKES

| Type | Protects | Common example |
| --- | --- | --- |
| At rest | Stored data | S3, EBS, RDS encryption |
| In transit | Moving data | HTTPS/TLS, IPsec VPN |
| Client-side | Before upload and while stored | App encrypts before S3 |
| Server-side | Stored by AWS service | S3 SSE options |

🎯 EXAM LENS

- "Data stored on disk or snapshot" → At-rest encryption.
- "Protect API calls from interception" → TLS/HTTPS.
- "Encrypt before upload; customer controls keys" → Client-side encryption.
- "Protect stored and network data" → At rest plus TLS.

🪤 TRAPS

- S3 server-side encryption does not protect the upload before it reaches S3.
- HTTPS protects transit, not the stored object's encryption setting.
- Encryption does not automatically authorize a user.
- A private network path does not replace encryption when required.

📝 PRACTICE QUESTION<br />An app sends sensitive data to S3 and stores it there. The company requires protection during transfer and storage. What should it configure?<br />A. TLS upload and S3 server-side encryption<br />B. S3 versioning only<br />C. Security group only<br />D. Public bucket

<b>Answer: A.</b> TLS protects transfer. Server-side encryption protects the stored object. Versioning and security groups do not provide both encryption layers.

🔁 ONE-LINE RECAP<br />Encryption at rest protects stored data; TLS and other secure protocols protect data while it travels.

---

### 40. AWS KMS: key types, key policies, rotation, grants (Domain 1.3)

🧒 LIKE I'M 5<br />KMS is like a secure key room for digital lockers. Applications ask KMS to use keys, but access rules decide who may use each key.

📖 EXPLAINED SIMPLY

- <b>AWS Key Management Service (KMS):</b> Creates and manages cryptographic keys used by AWS services and applications.
- A KMS key is a logical resource. Key material is the secret data used for cryptographic operations.
- <b>AWS owned keys:</b> Owned and managed by AWS. Customers do not manage them in their accounts or control their policies.
- <b>AWS managed keys:</b> Created and managed by AWS services in your account. AWS controls the key policy and rotation.
- <b>Customer managed keys:</b> Created or imported and managed by the customer. You control key policies, grants, enabled state, and supported rotation choices.
- Customer managed symmetric encryption keys are common for S3, EBS, RDS, and application encryption.
- <b>Key policy:</b> The primary access policy for a KMS key. It controls who can administer the key and who can use it.
- IAM policies can grant KMS access when the key policy enables IAM permissions for the account. A key policy can also grant access directly.
- <b>Grants:</b> Delegated permissions allowing AWS services or applications to use a KMS key for specific operations. Grants can be created and retired.
- <b>Rotation:</b> KMS can rotate key material for supported symmetric customer managed keys. The logical key ID remains the same.
- Managed rotation keeps previous key material available for decrypting data encrypted earlier. Rotation does not require customers to re-encrypt every object manually.
- A disabled key cannot perform cryptographic operations. Deleting a key is scheduled with a waiting period and can make encrypted data unrecoverable.
- KMS is regional for most key types. Multi-Region keys are covered in the next topic.
- Use customer managed keys when you need customer control, auditability, or custom policy. Use AWS managed keys when service-managed simplicity is enough.

📚 JARGON BOX

- KMS → Key Management Service.
- Key material → Secret cryptographic value.
- AWS owned key → Key managed outside the customer's account.
- AWS managed key → Key managed by an AWS service in the account.
- Customer managed key → Key controlled by the customer.
- Key policy → Main access policy for a KMS key.
- Grant → Delegated permission to use a KMS key.
- Rotation → Replacing backing key material.

⚖️ COMPARE WITH LOOKALIKES

| Key type | Customer controls policy? | Customer controls rotation? | Typical use |
| --- | --- | --- | --- |
| AWS owned | No | No | Transparent service encryption |
| AWS managed | Limited; AWS manages policy | AWS managed | Simple service encryption |
| Customer managed | Yes | Yes, when supported | Custom control and audit |

🎯 EXAM LENS

- "Full control over key policy and rotation" → Customer managed KMS key.
- "Simple encryption without managing key policy" → AWS managed key when supported.
- "Service needs delegated key usage" → KMS grant or service integration.
- "Who may administer or use key?" → Key policy and applicable IAM policy.
- "Backing material rotates, key ID remains" → KMS automatic rotation.

🪤 TRAPS

- AWS managed keys are not customer managed keys.
- KMS key policies are central to access.
- Rotation does not normally change the logical key ID.
- Disabling or deleting a key can make data unavailable.
- KMS manages keys; Secrets Manager and Parameter Store store secrets.

📝 PRACTICE QUESTION<br />A company must control who administers a key, who decrypts data, and supported key rotation settings. Which option fits?<br />A. Customer managed KMS key<br />B. AWS owned key<br />C. Public S3 bucket<br />D. Security group

<b>Answer: A.</b> Customer managed keys provide control over key policies, grants, and supported rotation. AWS owned keys do not provide customer key-policy control.

🔁 ONE-LINE RECAP<br />KMS manages encryption keys; customer managed keys provide the greatest customer control over policies, grants, and supported rotation.

## ✅ Batch 2 done: topics 21–40

### Batch 2 Cheat Sheet

- Stateful resource firewall → Security group.
- Stateless subnet filter with explicit Deny → NACL.
- No inbound SSH or RDP → Systems Manager Session Manager.
- Private S3 or DynamoDB access → Gateway VPC endpoint.
- Private access to many other AWS services → Interface endpoint.
- Share one service privately without VPC peering → PrivateLink.
- Investigate source IPs, ports, accepted/rejected flows → VPC Flow Logs.
- Enhanced DDoS protection and response support → Shield Advanced.
- SQL injection, XSS, geo blocking, request rate limits → AWS WAF.
- Apply security policies across many accounts → Firewall Manager.
- Stateful inspection of VPC traffic → Network Firewall.
- Automatic secret rotation → Secrets Manager.
- Customer sign-in → Cognito User Pool.
- Temporary AWS credentials for app users → Cognito Identity Pool.
- Suspicious API or network activity → GuardDuty.
- Sensitive data discovery in S3 → Macie.
- Vulnerable EC2, ECR, or Lambda workloads → Inspector.
- Investigate finding relationships → Detective.
- Central findings and security posture → Security Hub.
- Office network to VPC → Site-to-Site VPN.
- Remote laptops to VPC → Client VPN.
- Dedicated hybrid connectivity → Direct Connect; add IPsec or MACsec for encryption.
- Stored data → At-rest encryption; network traffic → TLS or another secure protocol.
- Customer control of key policy and rotation → Customer managed KMS key.

### 5 Extra Mixed Scenario Questions

<b>1.</b> Private EC2 instances must access S3 and Systems Manager without a NAT gateway. Which design is correct?

A. Gateway endpoint for S3 and interface endpoints for Systems Manager<br />B. Internet gateway only<br />C. Public IP addresses for every instance<br />D. One NACL rule

<b>Answer: A.</b> S3 uses a gateway endpoint. Systems Manager uses interface endpoints. This avoids NAT for those supported service paths.

<b>2.</b> A security team wants vulnerable package scanning on EC2 and suspicious API detection. Which two services should it use?

A. Inspector for vulnerabilities<br />B. GuardDuty for suspicious activity<br />C. Macie for both jobs<br />D. Shield for package scanning

<b>Answer: A and B.</b> Inspector identifies workload vulnerabilities. GuardDuty detects suspicious activity. Macie focuses on sensitive S3 data. Shield protects against DDoS attacks.

<b>3.</b> A company wants one central policy to enforce WAF protections across many AWS accounts. Which service should it choose?

A. Firewall Manager  B. WAF in one account only  C. Cognito  D. KMS

<b>Answer: A.</b> Firewall Manager centrally applies supported policies across accounts. The other options do not centrally manage protections.

<b>4.</b> A company needs encrypted connectivity and a dedicated path between its data center and AWS. What should it choose?

A. Direct Connect with IPsec Site-to-Site VPN over it<br />B. Direct Connect alone because it encrypts traffic by default<br />C. Public S3 bucket<br />D. NAT instance

<b>Answer: A.</b> Direct Connect provides the dedicated path. IPsec adds encryption. Direct Connect alone is not encrypted by default.

<b>5.</b> A mobile app needs customer login and temporary AWS credentials for restricted S3 uploads. Which Cognito design fits?

A. User Pool plus Identity Pool with a scoped IAM role<br />B. Root access key embedded in the app<br />C. One shared IAM user<br />D. Public S3 write access

<b>Answer: A.</b> User Pools authenticate customers. Identity Pools can provide temporary AWS credentials through a scoped role.

### 41. Envelope encryption and multi-Region KMS keys (Domain 1.3)

🧒 LIKE I'M 5<br />Imagine a large godown key that locks many small tiffin boxes. Each tiffin has a small key. The godown key protects those small keys.

📖 EXPLAINED SIMPLY

- <b>Envelope encryption:</b> Encrypt actual data with a data key. Then encrypt that data key using a longer-term key managed by AWS KMS.
- A data key has a plaintext copy and an encrypted copy. Use the plaintext copy to encrypt the data. Store the encrypted data key beside the ciphertext.
- When reading, ask KMS to decrypt the encrypted data key. Use the returned plaintext data key to decrypt the data.
- Remove the plaintext data key from memory when no longer required.
- <b>Why use it:</b> KMS does not need to process every byte of a large file. The application or AWS service encrypts data locally with the data key.
- You can often change the wrapping key by decrypting and re-encrypting the data key. You do not need to encrypt the large data file again.
- <b>Multi-Region KMS keys:</b> A related set of keys in different AWS Regions shares the same key ID and key material.
- A primary key can create replica keys in other Regions within the same AWS partition.
- Each replica is a fully functioning KMS key in its Region. It has its own key policy, grants, aliases, and tags.
- Related keys can decrypt ciphertext created by another related key. This supports local decryption after cross-Region data movement.
- Multi-Region keys do not replicate your data. S3 replication, database replication, or another data-copy method is still needed.
- They are not one global key endpoint. Each regional key is managed independently.
- The multi-Region property is selected when creating the key. You cannot convert an existing single-Region key later.
- Use envelope encryption for large datasets. Use multi-Region keys when encrypted data moves across Regions and local decryption is needed.

📚 JARGON BOX

- Envelope encryption → Encrypt data with a data key, then encrypt that key with another key.
- Data key → Key used to encrypt actual data.
- Wrapping key → Key that encrypts another key.
- Ciphertext → Encrypted data.
- Primary key → Original multi-Region KMS key.
- Replica key → Related KMS key created in another Region.
- Interoperable → Able to decrypt ciphertext produced by a related key.

⚖️ COMPARE WITH LOOKALIKES

| Option | What it solves | Important limit |
| --- | --- | --- |
| Single-Region KMS key | Regional encryption | Not automatically usable in another Region |
| Multi-Region KMS keys | Related keys decrypt across Regions | Does not copy data |
| Envelope encryption | Efficient encryption of large data | Protect the encrypted data key too |
| Cross-Region replication | Copies data | Does not make unrelated KMS keys interoperable |

🎯 EXAM LENS

- "Encrypt large files without sending all data through KMS" → Envelope encryption.
- "Change wrapping key without re-encrypting large data" → Re-encrypt the data key.
- "Decrypt replicated ciphertext in another Region" → Multi-Region KMS keys.
- "Keep object copies in another Region" → S3 replication or another data-copy service.

🪤 TRAPS

- Multi-Region keys do not replicate S3 objects or databases.
- Related regional keys are independent resources.
- Replica policies and grants are managed separately.
- You cannot convert an existing single-Region key into a multi-Region key.

📝 PRACTICE QUESTION<br />An application encrypts large files and copies ciphertext to another Region. It needs to decrypt there without sending KMS requests back to the source Region. What should it use?<br />A. Related multi-Region KMS keys<br />B. One single-Region key only in the source Region<br />C. An S3 bucket policy alone<br />D. A security group

<b>Answer: A.</b> Related multi-Region keys share key material and can decrypt one another's ciphertext. S3 replication still moves the data. B requires source-region access. C and D do not provide encryption keys.

🔁 ONE-LINE RECAP<br />Envelope encryption protects data keys, while multi-Region KMS keys let related regional keys decrypt shared ciphertext.

---

### 42. AWS CloudHSM vs AWS KMS (Domain 1.3)

🧒 LIKE I'M 5<br />KMS is like a managed bank locker service. CloudHSM is like renting a dedicated secure vault where your team controls the key machine itself.

📖 EXPLAINED SIMPLY

- <b>AWS KMS:</b> A managed key service. AWS operates the cryptographic infrastructure and integrates KMS with many AWS services.
- KMS creates keys, controls access through policies and grants, records usage through CloudTrail, and supports rotation for eligible keys.
- KMS is the normal choice for encrypting S3, EBS, RDS, and application data.
- <b>AWS CloudHSM:</b> Provides dedicated, single-tenant hardware security modules inside your VPC.
- You control HSM users, access, and cryptographic operations. You manage more of the key lifecycle and cluster configuration.
- CloudHSM supports interfaces such as PKCS#11, Java Cryptography Extension, and OpenSSL integration.
- It fits cases requiring dedicated HSMs, direct HSM control, or specific cryptographic interfaces.
- Clusters need multiple HSMs across AZs for resilience. You manage capacity, users, backups, and client integration.
- KMS is easier to operate and integrates broadly with AWS services. CloudHSM offers more direct control but requires more operations work.
- KMS can use a CloudHSM cluster through a custom key store. Some KMS features are unavailable in this setup.
- CloudHSM is generally charged by HSM capacity and usage. KMS charges depend on key type and cryptographic requests.
- Use KMS for most AWS encryption needs. Choose CloudHSM when dedicated single-tenant HSM control is required.

📚 JARGON BOX

- HSM → Hardware Security Module; specialized hardware protecting cryptographic keys.
- Single-tenant → Dedicated to one customer.
- PKCS#11 → Standard interface for cryptographic hardware.
- JCE → Java Cryptography Extension.
- OpenSSL → Common cryptography software library.
- Custom key store → KMS integration using CloudHSM or an external key store.
- Key custody → Who controls and operates key material.

⚖️ COMPARE WITH LOOKALIKES

| Feature | AWS KMS | AWS CloudHSM |
| --- | --- | --- |
| Model | Managed key service | Dedicated HSM cluster |
| Tenancy | AWS-operated service infrastructure | Single-tenant HSMs |
| Key control | KMS policies and grants | Customer controls HSM users and operations |
| AWS integration | Broad built-in integrations | Usually needs application or custom-store integration |
| Operations | Lower | Higher |
| Best use | Most AWS data encryption | Dedicated HSM requirements |

🎯 EXAM LENS

- "Managed and integrated AWS encryption" → KMS.
- "Dedicated single-tenant HSM" → CloudHSM.
- "Application requires PKCS#11 or direct HSM control" → CloudHSM.
- "Encrypt EBS or RDS easily" → KMS.

🪤 TRAPS

- CloudHSM is not the same as KMS.
- KMS already uses HSMs behind the service.
- CloudHSM requires more customer operation and integration.
- A KMS custom key store does not support every KMS feature.

📝 PRACTICE QUESTION<br />A financial application requires dedicated, single-tenant HSMs and direct control of cryptographic users. Which service fits?<br />A. AWS CloudHSM  B. AWS KMS default key  C. S3 SSE-S3  D. IAM Identity Center

<b>Answer: A.</b> CloudHSM provides dedicated single-tenant HSMs with customer-controlled HSM users. KMS is more managed. SSE-S3 encrypts objects. Identity Center handles workforce sign-in.

🔁 ONE-LINE RECAP<br />Choose KMS for managed AWS key operations and CloudHSM for dedicated HSM control or specialized cryptographic needs.

---

### 43. S3 encryption options and forcing TLS (Domain 1.3)

🧒 LIKE I'M 5<br />A warehouse can lock goods using its own lock, a managed bank lock, or a lock you bring yourself. S3 offers similar choices for protecting stored objects.

📖 EXPLAINED SIMPLY

- <b>S3 server-side encryption (SSE):</b> S3 encrypts an object after receiving it and decrypts it for an authorized download.
- <b>SSE-S3:</b> S3 encrypts objects with keys managed by S3. It is the default for new objects in general-purpose buckets.
- <b>SSE-KMS:</b> S3 uses an AWS KMS key. Choose this for key policies, grants, auditability, or customer-controlled keys.
- SSE-KMS requests are subject to KMS quotas and charges. S3 Bucket Keys can reduce KMS request costs.
- <b>DSSE-KMS:</b> Dual-layer server-side encryption using two layers. Choose it when compliance or security requirements specifically demand dual-layer protection.
- <b>SSE-C:</b> The customer supplies an encryption key with each object request. S3 does not store this key.
- Keep SSE-C keys safely. Losing the key means you cannot decrypt the object.
- Since April 2026, new general-purpose S3 buckets have SSE-C disabled by default. You must deliberately enable it before using SSE-C.
- <b>Client-side encryption:</b> Your application encrypts data before uploading it. You manage keys, encryption, and decryption.
- New S3 objects are encrypted at rest by default using SSE-S3 unless another supported option is selected.
- Changing default encryption does not re-encrypt existing objects. Use an object-copy workflow or S3 Batch Operations for older data.
- <b>Force TLS:</b> Add a bucket policy that explicitly denies requests when secure transport is false.
- A common policy checks the aws:SecureTransport condition and denies insecure HTTP requests.
- Use SSE-S3 for simple default encryption. Use SSE-KMS for key control and audit. Use DSSE-KMS for dual-layer requirements. Use client-side encryption when data must be encrypted before AWS receives it.

📚 JARGON BOX

- SSE → Server-side encryption.
- SSE-S3 → Server-side encryption with S3-managed keys.
- SSE-KMS → Server-side encryption using KMS keys.
- DSSE-KMS → Dual-layer server-side encryption using KMS keys.
- SSE-C → Server-side encryption using customer-provided keys.
- Client-side encryption → Encryption performed before upload.
- TLS → Protocol protecting data in transit.
- Bucket Key → S3 feature reducing KMS request traffic and cost.

⚖️ COMPARE WITH LOOKALIKES

| Option | Who manages key? | Main reason |
| --- | --- | --- |
| SSE-S3 | S3 | Simple default encryption |
| SSE-KMS | KMS with AWS or customer key | Audit and key controls |
| DSSE-KMS | KMS | Dual-layer requirement |
| SSE-C | Customer supplies key | Customer-managed external key |
| Client-side | Customer application | Encrypt before AWS receives data |

🎯 EXAM LENS

- "Default encryption for new S3 objects" → SSE-S3.
- "Control key policy and audit usage" → SSE-KMS with customer managed key.
- "Two layers of server-side encryption" → DSSE-KMS.
- "Customer sends key with each request" → SSE-C.
- "Encrypt before upload" → Client-side encryption.
- "Reject insecure HTTP requests" → Bucket policy using aws:SecureTransport.

🪤 TRAPS

- New S3 objects already receive default at-rest encryption.
- Default encryption changes do not re-encrypt older objects.
- SSE-C key loss can make data unreadable.
- SSE-KMS needs KMS permissions as well as S3 permissions.
- TLS protects transit, not stored objects.

📝 PRACTICE QUESTION<br />A company requires control over encryption key permissions and wants to audit key usage for S3 objects. Which option is best?<br />A. SSE-KMS with a customer managed key<br />B. SSE-S3 only<br />C. SSE-C with a lost key<br />D. Disable encryption

<b>Answer: A.</b> A customer managed KMS key provides key-policy control and CloudTrail visibility. SSE-S3 is simpler but gives less key control. C risks data loss. D removes protection.

🔁 ONE-LINE RECAP<br />Choose S3 encryption by key-control needs, and use a bucket policy to require TLS in transit.

---

### 44. AWS Certificate Manager (ACM) (Domain 1.3)

🧒 LIKE I'M 5<br />A TLS certificate is like a shop's verified identity card. ACM issues and renews certificates so browsers can trust the website they reached.

📖 EXPLAINED SIMPLY

- <b>AWS Certificate Manager (ACM):</b> Provisions and manages public and private SSL/TLS certificates.
- TLS certificates prove a website or service identity and help establish encrypted HTTPS connections.
- Request a public certificate for a domain. ACM validates that you control the domain.
- <b>DNS validation</b> uses a DNS record. It is generally preferred because ACM can use that record for managed renewal.
- <b>Email validation</b> sends approval messages to domain contacts. It requires action when validation or renewal notices arrive.
- ACM public certificates integrate with services such as Application Load Balancer, CloudFront, and API Gateway.
- For regional services, request the certificate in the same Region as the service. CloudFront viewer certificates must be in US East (N. Virginia), us-east-1.
- ACM-managed public certificates renew automatically when eligible. DNS validation and continued use by an integrated service help renewal.
- Imported certificates are not renewed automatically by ACM. You must replace them before expiry.
- ACM Private CA can issue certificates for internal services. Private certificates are trusted only by systems that trust that private CA.
- Use ACM for certificates on integrated AWS endpoints. For servers you manage, use an appropriate export or certificate automation workflow.
- ACM does not replace domain ownership, DNS configuration, or secure application configuration.

📚 JARGON BOX

- Certificate → Digital document binding a name to a public key.
- TLS → Protocol that encrypts network communication.
- SSL → Older name commonly used for TLS certificates.
- DNS validation → Proving domain control using a DNS record.
- Email validation → Proving domain control through approval email.
- ACM Private CA → Service issuing private certificates.
- Renewal → Replacing an expiring certificate.

⚖️ COMPARE WITH LOOKALIKES

| Option | Use |
| --- | --- |
| ACM public certificate | Public HTTPS for integrated AWS services |
| ACM Private CA | Internal and private certificates |
| Imported certificate | Bring a certificate issued elsewhere |
| Self-managed automation | Certificates on servers you manage |

🎯 EXAM LENS

- "Managed TLS certificate for ALB or CloudFront" → ACM.
- "Automatic certificate renewal" → Eligible ACM-issued certificate with DNS validation.
- "CloudFront viewer certificate" → ACM certificate in us-east-1.
- "Certificate on external server" → Export or manage through an appropriate workflow.

🪤 TRAPS

- A certificate in the wrong Region may not be selectable.
- CloudFront viewer certificates must be in us-east-1.
- Imported certificates require customer renewal.
- ACM does not automatically configure your application to use HTTPS.

📝 PRACTICE QUESTION<br />A company uses CloudFront and wants an ACM public certificate for its website. In which Region must the viewer certificate be requested?<br />A. US East (N. Virginia)<br />B. Any Region<br />C. The Region closest to users<br />D. Every Region separately

<b>Answer: A.</b> CloudFront viewer certificates in ACM must be in us-east-1. The other choices ignore CloudFront's certificate requirement.

🔁 ONE-LINE RECAP<br />ACM manages certificates for supported AWS services; use DNS validation for managed renewal and us-east-1 for CloudFront viewer certificates.

---

### 45. S3 access security: Block Public Access, Object Ownership, presigned URLs, CloudFront OAC (Domain 1.3)

🧒 LIKE I'M 5<br />A warehouse stays locked. A clerk can issue a timed visitor pass for one package. A delivery partner can enter only through an approved gate.

📖 EXPLAINED SIMPLY

- <b>S3 Block Public Access:</b> Four settings that block public access granted through ACLs, bucket policies, or access point policies.
- Apply these settings at account, bucket, and access point levels. The most restrictive applicable settings help protect data.
- New general-purpose buckets have Block Public Access enabled by default.
- <b>S3 Object Ownership:</b> Controls ownership of uploaded objects and ACL behavior.
- <b>Bucket owner enforced</b> disables ACLs. The bucket owner owns all objects, regardless of uploader.
- Prefer Bucket owner enforced for most modern designs. Use policies instead of ACLs.
- <b>Presigned URL:</b> A temporary URL signed using AWS credentials. It grants limited access to a specific object and operation.
- The URL holder does not need AWS credentials. The URL's permissions cannot exceed the signing identity's permissions.
- A presigned URL stops working when it expires or when the signing credentials become invalid. Treat it like a bearer secret.
- <b>CloudFront Origin Access Control (OAC):</b> Lets CloudFront securely access a private S3 origin.
- Configure OAC on the distribution and a bucket policy allowing the intended CloudFront distribution. Keep the bucket private.
- AWS recommends OAC over the older Origin Access Identity (OAI). OAC supports SSE-KMS and dynamic S3 requests such as PUT and DELETE.
- Use Block Public Access by default, Bucket owner enforced to disable ACLs, presigned URLs for temporary object sharing, and OAC for private S3 origins.

📚 JARGON BOX

- Block Public Access → S3 settings preventing public exposure.
- ACL → Access Control List; older object or bucket permissions.
- Object Ownership → Setting controlling object ownership and ACLs.
- Presigned URL → Time-limited signed link to an S3 operation.
- Bearer secret → Whoever holds it can use it.
- OAC → Origin Access Control.
- OAI → Older Origin Access Identity method.
- Origin → Source from which CloudFront fetches content.

⚖️ COMPARE WITH LOOKALIKES

| Option | Access pattern | Best use |
| --- | --- | --- |
| Block Public Access | Blocks public policy/ACL paths | Keep buckets private |
| Bucket owner enforced | Disables ACLs and centralizes ownership | Modern bucket access |
| Presigned URL | Temporary access to one object/action | Private one-time sharing |
| CloudFront OAC | Distribution-to-bucket access | Private content origin |
| OAI | Older CloudFront-to-S3 access | Legacy distributions |

🎯 EXAM LENS

- "Prevent accidental public bucket exposure" → Block Public Access.
- "Disable ACLs and make bucket owner own uploads" → Bucket owner enforced.
- "Temporary link without AWS login" → Presigned URL.
- "Private S3 origin behind CloudFront" → OAC plus bucket policy.
- "CloudFront with SSE-KMS" → Prefer OAC.

🪤 TRAPS

- A presigned URL grants the signing identity's permitted operation, not full bucket access.
- Anyone with a valid presigned URL can use it until expiry.
- OAC does not make S3 public.
- OAI is older. OAC is recommended for new designs.
- Block Public Access does not replace IAM and bucket policies.

📝 PRACTICE QUESTION<br />A company serves private S3 images through CloudFront. The bucket must remain non-public, and objects use SSE-KMS. What is best?<br />A. CloudFront OAC with a bucket policy allowing that distribution<br />B. Public bucket ACL<br />C. Disable Block Public Access for the account<br />D. Share root credentials with viewers

<b>Answer: A.</b> OAC securely authorizes CloudFront to retrieve private S3 objects and supports SSE-KMS. B and C expose data. D is unsafe.

🔁 ONE-LINE RECAP<br />Keep S3 private with Block Public Access, disable ACLs when possible, use presigned URLs for temporary sharing, and OAC for CloudFront.

---

### 46. S3 Versioning, MFA Delete, Object Lock, Glacier Vault Lock (Domain 1.3)

🧒 LIKE I'M 5<br />A notebook keeps old pages when you edit it. A lockbox prevents anyone from destroying records before a required date. These features protect data from deletion.

📖 EXPLAINED SIMPLY

- <b>S3 Versioning:</b> Keeps multiple versions of an object. An overwrite creates a new version instead of replacing the old one.
- Deleting an object without a version ID usually adds a delete marker. Older versions remain until permanently deleted.
- You can restore an older version or permanently delete a specific version ID. Versioning helps recover from accidental changes and deletes.
- Versioning adds storage costs because old versions remain. Use lifecycle rules to transition or expire versions when allowed.
- <b>MFA Delete:</b> Requires multi-factor authentication for permanently deleting object versions or changing a bucket's versioning state.
- Only the bucket owner's root user can enable MFA Delete. It must be configured through the API or CLI, not the console.
- <b>S3 Object Lock:</b> Provides write-once-read-many (WORM) protection for object versions. It requires versioning.
- <b>Governance mode:</b> Protected versions cannot be deleted or have retention shortened by ordinary users. A specially permitted user can bypass governance with the required permission and explicit request.
- <b>Compliance mode:</b> No user, including root, can delete or shorten retention for a protected version before its retention date.
- <b>Legal hold:</b> Keeps an object version protected until explicitly removed. It is independent of a fixed retention period.
- <b>Glacier Vault Lock:</b> Applies a vault lock policy to an Amazon S3 Glacier vault. Once the lock process is completed, the policy becomes immutable.
- Object Lock is for S3 buckets and object versions. Vault Lock is for the separate S3 Glacier vault model.
- Use Versioning for recovery, MFA Delete for extra version-deletion protection, Object Lock for immutable S3 records, and Vault Lock for Glacier vault policies.

📚 JARGON BOX

- Versioning → Keeping multiple object versions.
- Delete marker → Marker making an object appear deleted without removing older versions.
- MFA Delete → MFA required for critical versioning or delete operations.
- WORM → Write Once Read Many.
- Governance mode → Retention that specially authorized users can bypass.
- Compliance mode → Retention root cannot shorten or bypass.
- Legal hold → Protection remaining until explicitly removed.
- Vault Lock → Immutable policy for an S3 Glacier vault.

⚖️ COMPARE WITH LOOKALIKES

| Feature | Protects | Can privileged user bypass? |
| --- | --- | --- |
| Versioning | Previous object versions | Authorized users can still permanently delete versions |
| MFA Delete | Version deletion and versioning changes | Requires root plus MFA |
| Object Lock Governance | Object version retention | Yes, with bypass permission and explicit action |
| Object Lock Compliance | Object version retention | No, not before expiry |
| Glacier Vault Lock | Vault policy | Locked policy cannot be changed |

🎯 EXAM LENS

- "Recover overwritten or deleted objects" → S3 Versioning.
- "Require MFA to permanently delete a version" → MFA Delete.
- "Even root must not delete records during retention" → Object Lock Compliance mode.
- "Allow privileged override during retention" → Object Lock Governance mode.
- "Immutable policy for a Glacier vault" → Glacier Vault Lock.

🪤 TRAPS

- Versioning alone does not prevent permanent deletion of versions.
- Object Lock requires versioning.
- Governance and Compliance modes have different bypass rules.
- MFA Delete is enabled by root through CLI or API.
- Glacier Vault Lock is not the same as S3 Object Lock.

📝 PRACTICE QUESTION<br />A regulated company must ensure that no AWS user, including root, can delete an S3 record for seven years. What should it use?<br />A. Object Lock in Compliance mode<br />B. Versioning only<br />C. Governance mode with a bypass role<br />D. A presigned URL

<b>Answer: A.</b> Compliance mode prevents deletion or retention shortening during the retention period, even by root. Versioning alone permits version deletion. Governance allows authorized bypass. Presigned URLs do not protect retention.

🔁 ONE-LINE RECAP<br />Versioning supports recovery, MFA Delete adds authentication, Object Lock enforces S3 retention, and Vault Lock protects Glacier vault policies.

---

### 47. Encrypting EBS, RDS, and snapshots (Domain 1.3)

🧒 LIKE I'M 5<br />A notebook already written on plain paper cannot become encrypted by painting its cover. You create a protected copy, then use that copy going forward.

📖 EXPLAINED SIMPLY

- <b>EBS encryption:</b> Encrypts EBS volumes and their snapshots using AWS KMS keys.
- EBS encryption protects data at rest, data moving between the instance and attached volume, and snapshots created from the volume.
- New encrypted volumes and snapshots remain encrypted when copied or restored.
- You cannot directly turn encryption on for an existing unencrypted EBS volume or snapshot.
- To encrypt an existing EBS volume, create a snapshot. Copy that snapshot with encryption enabled. Create a new volume from the encrypted copy and attach it.
- Enable EBS encryption by default at account and Region level. It applies to newly created volumes and snapshot copies, not existing volumes.
- <b>RDS encryption:</b> Encrypts underlying database storage, automated backups, read replicas, and snapshots using KMS.
- RDS encryption must be selected when the DB instance is created. You cannot switch it on for an existing unencrypted DB instance.
- To encrypt an existing unencrypted RDS DB, create a snapshot. Copy the snapshot with encryption enabled and a KMS key. Restore a new encrypted DB from that copy.
- Plan the application connection change and cutover to the new database. Test the restored database first.
- Encrypted snapshots need access to their KMS key. Cross-Region snapshot copies need an appropriate KMS key in the destination Region.
- You cannot turn encryption off for an already encrypted EBS or RDS resource.
- Aurora has a specific cluster snapshot restore workflow. Do not assume every RDS engine uses the identical steps.
- Use encryption by default for new EBS resources and select encryption during RDS creation. Use encrypted snapshot-copy migration for existing unencrypted resources.

📚 JARGON BOX

- EBS → Elastic Block Store; block storage for EC2.
- RDS → Relational Database Service; managed relational database.
- Snapshot → Point-in-time storage copy.
- KMS key → Key used for encryption operations.
- Restore → Create a resource from a snapshot or backup.
- Cutover → Switch applications from the old resource to the new one.
- Encryption by default → Setting automatically encrypting new EBS resources.

⚖️ COMPARE WITH LOOKALIKES

| Resource | Encrypt at creation? | Convert existing unencrypted resource? |
| --- | --- | --- |
| EBS volume | Yes | Snapshot, encrypted copy, new volume |
| EBS snapshot | Yes | Copy snapshot with encryption |
| RDS DB instance | Yes | Snapshot, encrypted copy, restore new DB |
| Encrypted snapshot | Remains encrypted | Cannot remove encryption |

🎯 EXAM LENS

- "New EBS volumes must always be encrypted" → Enable EBS encryption by default.
- "Encrypt existing EBS volume" → Snapshot, encrypted copy, create new volume.
- "Encrypt existing unencrypted RDS DB" → Snapshot, encrypted copy, restore new DB.
- "Cross-Region encrypted snapshot copy" → KMS key in destination Region.
- Correct answers create a new encrypted resource rather than modifying encryption in place.

🪤 TRAPS

- You cannot directly encrypt an existing unencrypted EBS volume.
- You cannot directly enable encryption on an existing unencrypted RDS DB instance.
- EBS encryption by default does not encrypt old volumes retroactively.
- Encrypted snapshots require KMS key permissions.
- A new database or volume needs a planned application cutover.

📝 PRACTICE QUESTION<br />A production RDS database was created without encryption. The company now requires encryption at rest. What is the supported approach?<br />A. Enable encryption on the running DB instance<br />B. Create a snapshot, copy it with encryption enabled, and restore a new DB instance<br />C. Add an inbound security group rule<br />D. Enable S3 Versioning

<b>Answer: B.</b> RDS encryption cannot be enabled in place. The encrypted snapshot copy lets you restore a new encrypted database. The other options do not encrypt database storage.

🔁 ONE-LINE RECAP<br />Choose EBS and RDS encryption at creation; migrate existing unencrypted resources through encrypted snapshot copies and restores.

---

### 48. AWS CloudTrail (Domain 1.3)

🧒 LIKE I'M 5<br />A bank keeps a register of who opened a locker, when they did it, and where they came from. CloudTrail records actions taken in your AWS account.

📖 EXPLAINED SIMPLY

- <b>AWS CloudTrail:</b> Records account activity and API actions made by users, roles, and AWS services.
- Each record is an <b>event</b>. It can include identity, time, source IP, requested action, affected resource, and request details.
- <b>Management events:</b> Record control-plane actions, such as creating an EC2 instance or changing a security group.
- <b>Data events:</b> Record activity on data resources, such as reading an S3 object or invoking a Lambda function. They are not included by default in every trail and can add cost.
- <b>CloudTrail Event history:</b> Shows the last 90 days of management events for one account and one Region. It is available without creating a trail.
- For ongoing records, create a trail that delivers logs to S3. You can also send events to CloudWatch Logs for monitoring and alerts.
- <b>Organization trail:</b> Records activity across member accounts when configured through Organizations.
- <b>CloudTrail Insights:</b> Identifies unusual patterns in supported API activity, such as unexpected spikes in API calls.
- <b>CloudTrail Lake:</b> Stores event data in event data stores and supports SQL-based queries across configured data.
- Use CloudTrail to answer who did what, when, from where, and through which API.
- Use CloudTrail for auditing. Use CloudWatch for metrics, logs, alarms, and operational health.
- CloudTrail records activity. It does not prevent a dangerous API call by itself.

📚 JARGON BOX

- Event → Record of an action or activity.
- API → Interface software uses to request actions.
- Management event → Control-plane activity about resource configuration.
- Data event → Activity on data resources.
- Trail → Configuration delivering CloudTrail events to destinations.
- Insights → Detection of unusual supported API activity.
- Event data store → CloudTrail Lake storage for queryable events.

⚖️ COMPARE WITH LOOKALIKES

| Service / feature | Main job |
| --- | --- |
| CloudTrail | Who performed which AWS API action |
| Event history | Recent 90-day management event view |
| CloudTrail Lake | Store and query event data |
| CloudWatch | Operational metrics, logs, alarms |
| AWS Config | Resource configuration history and compliance |

🎯 EXAM LENS

- "Who deleted this security group?" → CloudTrail.
- "S3 object-level API access" → Enable CloudTrail data events.
- "Keep an ongoing audit record" → Trail delivering to S3.
- "Record activity across accounts" → Organization trail.
- "Recent 90-day management events" → Event history.

🪤 TRAPS

- Event history is not a permanent archive.
- Data events are not included by default in every trail.
- CloudTrail records API activity; Config records resource configuration state.
- CloudTrail does not block an action merely because it records it.

📝 PRACTICE QUESTION<br />A security auditor must identify which IAM role deleted an S3 object and when. What should the company enable?<br />A. CloudTrail data events for the S3 bucket<br />B. CloudWatch CPU metrics<br />C. S3 Transfer Acceleration<br />D. EBS encryption by default

<b>Answer: A.</b> S3 object deletion is a data event. CloudTrail records the calling identity and event details when configured. The other options do not audit object API activity.

🔁 ONE-LINE RECAP<br />CloudTrail records AWS API activity so teams can audit identities, actions, times, and sources.

---

### 49. AWS Config: rules, conformance packs, remediation (Domain 1.3)

🧒 LIKE I'M 5<br />A building inspector keeps a history of each room's layout and checks safety rules. AWS Config records resource settings and evaluates them against rules.

📖 EXPLAINED SIMPLY

- <b>AWS Config:</b> Records resource configurations and changes. It helps you understand what a resource looked like in the past.
- Config discovers supported resources and stores configuration items. These describe resource settings and relationships.
- Configuration history helps answer how a security group, bucket, or other supported resource changed over time.
- <b>Config rule:</b> A condition that evaluates whether a resource follows a required setting. Examples include encrypted EBS volumes or S3 public access.
- <b>Managed rules:</b> Prebuilt rules from AWS. <b>Custom rules:</b> Rules you write using supported Lambda-based or Guard-based methods.
- Rules can evaluate when configuration changes or periodically.
- <b>Conformance pack:</b> A collection of Config rules and remediation actions organized around a compliance goal or standard.
- <b>Remediation:</b> Config can trigger automatic remediation, commonly through Systems Manager Automation, when a rule is non-compliant.
- A rule can detect a problem without fixing it. Automatic remediation must be configured and tested.
- Config aggregators collect configuration and compliance data across multiple accounts and Regions.
- Config is mainly detective. It records and evaluates configuration. It is not a firewall that blocks traffic.
- Use Config to check ongoing compliance and configuration drift. Use CloudTrail to see which API action caused a change.

📚 JARGON BOX

- Configuration item → Description of a resource's settings at a point in time.
- Configuration history → Record of resource setting changes.
- Config rule → Test for a required resource setting.
- Compliance status → Whether a resource passes a rule.
- Conformance pack → Group of rules and remediation actions.
- Remediation → Corrective action for a non-compliant resource.
- Configuration drift → Settings moving away from the approved design.
- Aggregator → Combines Config data across accounts and Regions.

⚖️ COMPARE WITH LOOKALIKES

| Service | Main question |
| --- | --- |
| AWS Config | What is the resource configuration? Is it compliant? |
| CloudTrail | Who made the API call and when? |
| Security Hub | What security findings and posture gaps exist? |
| Systems Manager Automation | Execute a configured remediation workflow |

🎯 EXAM LENS

- "Track security group changes over time" → AWS Config.
- "Check every S3 bucket for public access" → Config rule.
- "Apply a standard collection of compliance checks" → Conformance pack.
- "Automatically fix non-compliant resources" → Config remediation.
- "Identify who changed a resource" → CloudTrail.

🪤 TRAPS

- Config is not CloudTrail.
- Config rules evaluate resources; they do not block every change.
- Remediation must be configured.
- A conformance pack is a collection, not one security finding.

📝 PRACTICE QUESTION<br />A company must continuously check whether EBS volumes are encrypted and automatically remediate violations. Which service fits?<br />A. AWS Config rule with configured remediation<br />B. CloudTrail Event history only<br />C. CloudFront<br />D. Cognito

<b>Answer: A.</b> Config evaluates encryption compliance. Config can trigger configured remediation. CloudTrail only records actions. The other services are unrelated.

🔁 ONE-LINE RECAP<br />AWS Config records resource settings, evaluates rules, and can run configured remediation actions.

---

### 50. AWS Artifact, data classification, retention, and compliance (Domain 1.3)

🧒 LIKE I'M 5<br />A school keeps exam records in labelled folders and follows rules about how long to store them. Artifact provides audit documents, while classification and retention rules guide data handling.

📖 EXPLAINED SIMPLY

- <b>AWS Artifact:</b> A self-service portal for accessing AWS compliance reports and agreements.
- <b>Artifact Reports</b> provides AWS audit reports and certifications, including supported SOC, ISO, and PCI materials.
- <b>Artifact Agreements</b> lets eligible customers review and accept certain AWS agreements.
- Artifact provides evidence about AWS services and controls. It does not certify that your own application is compliant.
- <b>Data classification:</b> Label data by sensitivity and business impact. Common levels include public, internal, confidential, and restricted.
- Classification helps decide who may access data, required encryption, where data can be stored, and how long it must remain.
- <b>Retention policy:</b> Defines how long data must remain available. Legal, regulatory, and business requirements can differ.
- <b>Data lifecycle:</b> Defines what happens as data ages. It may move to cheaper storage, remain locked, or be deleted after approval.
- Use S3 Lifecycle for storage transitions and expiration when permitted. Use S3 Object Lock when records must remain immutable.
- Use Config rules to check resource settings. Use CloudTrail to audit activity. Use AWS Backup for supported backup workloads.
- Compliance is shared responsibility. AWS reports describe AWS controls. Customers must configure and operate workloads correctly.
- Never delete data simply because it is old. Check legal holds, retention rules, and business requirements first.
- Use Artifact when auditors request AWS compliance reports. Use classification and retention policies to govern customer data.

📚 JARGON BOX

- Artifact → AWS portal for compliance reports and agreements.
- Audit report → Evidence describing controls examined by an independent auditor.
- Data classification → Labelling data by sensitivity.
- Retention → How long data must be kept.
- Lifecycle → Rules controlling data as it ages.
- Legal hold → Requirement to preserve records for a legal matter.
- Compliance → Meeting applicable laws, standards, or policies.
- Evidence → Information supporting a compliance claim.

⚖️ COMPARE WITH LOOKALIKES

| Service or control | Purpose |
| --- | --- |
| AWS Artifact | Access AWS compliance reports and agreements |
| AWS Config | Check resource configuration against rules |
| CloudTrail | Audit API activity |
| S3 Lifecycle | Transition or expire data by rules |
| S3 Object Lock | Prevent object-version deletion during retention |
| AWS Backup | Centrally manage supported backups |

🎯 EXAM LENS

- "Download AWS SOC or ISO reports" → AWS Artifact.
- "Review or accept AWS agreements" → Artifact Agreements.
- "Check bucket encryption or public access" → AWS Config.
- "Keep records for a fixed period" → Retention policy and possibly Object Lock.
- "Move older S3 data to archive" → S3 Lifecycle.
- "Prove who changed a resource" → CloudTrail.

🪤 TRAPS

- Artifact reports AWS compliance; they do not make your workload compliant.
- Data classification is a customer governance task.
- S3 Lifecycle expiration must not violate legal retention.
- Config and CloudTrail provide different evidence.
- A legal hold can require retention beyond a normal lifecycle schedule.

📝 PRACTICE QUESTION<br />An auditor asks a company for AWS's SOC and ISO compliance reports. Which service should the architect use?<br />A. AWS Artifact  B. AWS Config  C. GuardDuty  D. Inspector

<b>Answer: A.</b> Artifact provides AWS compliance reports and agreements. Config checks customer resources. GuardDuty detects threats. Inspector finds vulnerabilities.

🔁 ONE-LINE RECAP<br />Artifact supplies AWS compliance evidence; classification and retention policies govern how your own data is protected and kept.

## 📌 Domain 1 cheat sheet

- Physical cloud infrastructure protection → AWS responsibility.
- Employee access across many AWS accounts → IAM Identity Center.
- Maximum member-account permissions → SCP.
- Delegated role permission ceiling → Permission boundary.
- Share private VPC subnets → AWS RAM.
- Stateful workload firewall → Security group.
- Stateless subnet Allow and Deny rules → NACL.
- Private EC2 access without inbound SSH → Session Manager.
- Private S3 or DynamoDB path → Gateway endpoint.
- Share one private service across VPCs → PrivateLink.
- Detect suspicious API or network activity → GuardDuty.
- Find sensitive data in S3 → Macie.
- Find EC2, ECR, or Lambda vulnerabilities → Inspector.
- Investigate security-event relationships → Detective.
- Centralize security findings and posture → Security Hub.
- Encrypt large files efficiently → Envelope encryption.
- Dedicated single-tenant HSM → CloudHSM.
- Control S3 encryption keys → SSE-KMS with customer managed key.
- Private S3 origin behind CloudFront → OAC plus bucket policy.
- Prevent even root from deleting retained S3 records → Object Lock Compliance mode.
- Convert unencrypted EBS or RDS → Encrypted snapshot copy and restore.
- Audit AWS API actions → CloudTrail.
- Track configuration history and compliance → AWS Config.
- Download AWS SOC or ISO reports → AWS Artifact.
