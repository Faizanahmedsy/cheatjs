import type { AwsLesson } from "../types";
import { grow } from "./grow";
import { s3, ec2 } from "./storage";
import { vpc, iam } from "./network-security";
import { rds, dynamodb, lambda, messaging } from "./data-compute";

export const LESSONS: AwsLesson[] = [grow, s3, ec2, vpc, iam, rds, dynamodb, lambda, messaging];
