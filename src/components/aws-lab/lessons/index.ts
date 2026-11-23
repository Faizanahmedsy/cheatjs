import type { AwsLesson, Category } from "../types";
import { grow } from "./grow";
import { s3, ec2 } from "./storage";
import { vpc, iam } from "./network-security";
import { rds, dynamodb, lambda, messaging } from "./data-compute";
import * as cn from "./svc-compute-network";
import * as da from "./svc-data";
import * as im from "./svc-integration-mgmt";
import * as sn from "./svc-security-network";

const CATEGORY: Record<string, Category> = { "grow-the-app": "Start", s3: "Storage", ec2: "Compute", vpc: "Network", iam: "Security", rds: "Database", dynamodb: "Database", lambda: "Compute", messaging: "Integration" };

const core = [grow, s3, ec2, vpc, iam, rds, dynamodb, lambda, messaging].map((l) => ({ ...l, category: CATEGORY[l.id] ?? l.category }));
const services = [...Object.values(cn), ...Object.values(da), ...Object.values(im), ...Object.values(sn)].sort((a, b) => a.num - b.num);

export const LESSONS: AwsLesson[] = [...core, ...services];
export const CATEGORIES: Category[] = ["Start", "Compute", "Storage", "Database", "Network", "Integration", "Analytics", "Security", "Management"];
