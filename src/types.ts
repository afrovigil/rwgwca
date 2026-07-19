export type UserRole = "admin" | "assignee" | "auditor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  achieved: boolean;
  achievedAt: string | null;
  createdAt: string;
  createdBy: string; // user ID or name
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  source: string; // e.g. Audit Report 2026
  category: string; // e.g. Operations, IT, Finance
  priority: "low" | "medium" | "high";
  deadline: string; // YYYY-MM-DD
  assigneeId: string; // user ID
  assigneeName: string;
  assigneeEmail: string;
  milestones: Milestone[];
  createdAt: string;
  status: number; // calculated status: % of milestones achieved
}

export interface EmailLog {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  sentAt: string;
  type: "automatic" | "manual";
  status: "sent" | "delivered";
  recommendationId: string;
  recommendationTitle: string;
}

export interface DashboardStats {
  totalRecommendations: number;
  totalMilestones: number;
  achievedMilestones: number;
  overallImplementationRate: number; // total achieved / total milestones * 100
  highPriorityCount: number;
  pendingCount: number;
  overdueCount: number;
}
