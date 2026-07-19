import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure data directory and DB file exist
function initDb() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const seedData = {
      users: [
        {
          id: "u-1",
          name: "Sarah Connor (Assignee)",
          email: "assignee@rwg.com",
          password: "assignee",
          role: "assignee",
          createdAt: new Date().toISOString()
        },
        {
          id: "u-2",
          name: "Admin Officer (Administrator)",
          email: "admin@rwg.com",
          password: "admin",
          role: "admin",
          createdAt: new Date().toISOString()
        },
        {
          id: "u-3",
          name: "James Miller (Auditor)",
          email: "auditor@rwg.com",
          password: "auditor",
          role: "auditor",
          createdAt: new Date().toISOString()
        },
        {
          id: "u-4",
          name: "John Dev (Assignee)",
          email: "dev@rwg.com",
          password: "dev",
          role: "assignee",
          createdAt: new Date().toISOString()
        }
      ],
      recommendations: [
        {
          id: "rec-1",
          title: "Enhance cloud-hosted database backups",
          description: "Ensure all cloud database backups are replicated across at least two geographical regions with automated recovery drills.",
          source: "Internal Security Audit 2026",
          category: "IT Security",
          priority: "high",
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
          assigneeId: "u-1",
          assigneeName: "Sarah Connor (Assignee)",
          assigneeEmail: "assignee@rwg.com",
          milestones: [
            {
              id: "ms-1-1",
              title: "Review current backup replication setup",
              achieved: true,
              achievedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: "Sarah Connor (Assignee)"
            },
            {
              id: "ms-1-2",
              title: "Configure multi-region backup replication",
              achieved: true,
              achievedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: "Sarah Connor (Assignee)"
            },
            {
              id: "ms-1-3",
              title: "Develop automated recovery validation script",
              achieved: false,
              achievedAt: null,
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: "Sarah Connor (Assignee)"
            },
            {
              id: "ms-1-4",
              title: "Conduct real-world failover drill",
              achieved: false,
              achievedAt: null,
              createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: "Sarah Connor (Assignee)"
            }
          ],
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "rec-2",
          title: "Optimize application load-balancer routing",
          description: "Fine-tune the ingress routing rules to balance load between container replicas during peak traffic events.",
          source: "Infrastructure Performance Audit",
          category: "Operations",
          priority: "medium",
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 days from now
          assigneeId: "u-4",
          assigneeName: "John Dev (Assignee)",
          assigneeEmail: "dev@rwg.com",
          milestones: [
            {
              id: "ms-2-1",
              title: "Analyze traffic bottlenecks in Nginx router",
              achieved: true,
              achievedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: "John Dev (Assignee)"
            },
            {
              id: "ms-2-2",
              title: "Implement connection pooling on downstream API routes",
              achieved: false,
              achievedAt: null,
              createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: "John Dev (Assignee)"
            }
          ],
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "rec-3",
          title: "Establish corporate regulatory compliance framework",
          description: "Draft, review, and finalize the compliance policies for fiscal year 2026-2027.",
          source: "Board Oversight Committee",
          category: "Governance",
          priority: "low",
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
          assigneeId: "u-1",
          assigneeName: "Sarah Connor (Assignee)",
          assigneeEmail: "assignee@rwg.com",
          milestones: [
            {
              id: "ms-3-1",
              title: "Draft code of conduct draft chapters",
              achieved: false,
              achievedAt: null,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              createdBy: "Sarah Connor (Assignee)"
            }
          ],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      emails: [
        {
          id: "em-1",
          to: "assignee@rwg.com",
          toName: "Sarah Connor (Assignee)",
          subject: "[AUTOMATED REMINDER] Deadline approaching for 'Enhance cloud-hosted database backups'",
          body: "Dear Sarah Connor (Assignee),\n\nThis is an automated reminder that the deadline for your assigned recommendation 'Enhance cloud-hosted database backups' is approaching in 5 days (Deadline: " + new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ").\n\nCurrent implementation rate is 50% (2/4 milestones achieved).\n\nPlease review and tick off milestones as they are completed.\n\nBest regards,\nRWG Monitor Automated System",
          sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          type: "automatic",
          status: "sent",
          recommendationId: "rec-1",
          recommendationTitle: "Enhance cloud-hosted database backups"
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2));
  }
}

initDb();

function getDb() {
  initDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Middleware
app.use(express.json());

// Simple custom Token Auth system
const activeSessions = new Map<string, any>(); // token -> user

app.use((req, res, next) => {
  const token = req.headers["x-token"] as string;
  if (token && activeSessions.has(token)) {
    (req as any).user = activeSessions.get(token);
  }
  next();
});

// Automated Email Reminder Scan Function
function scanAndSendReminders(isAutomatic: boolean = true) {
  const db = getDb();
  const now = Date.now();
  let emailsSent = 0;

  db.recommendations.forEach((rec: any) => {
    // Calculate progress
    const totalMilestones = rec.milestones.length;
    const achievedMilestones = rec.milestones.filter((m: any) => m.achieved).length;
    const progress = totalMilestones > 0 ? Math.round((achievedMilestones / totalMilestones) * 100) : 0;

    // Send reminders for incomplete recommendations (progress < 100)
    if (progress < 100) {
      const deadlineDate = new Date(rec.deadline);
      const diffTime = deadlineDate.getTime() - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If deadline is within 7 days
      if (diffDays >= 0 && diffDays <= 7) {
        // Check if a reminder was already sent for this recommendation in the last 24 hours
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
        const alreadySentRecent = db.emails.some(
          (email: any) =>
            email.recommendationId === rec.id &&
            new Date(email.sentAt).getTime() > twentyFourHoursAgo &&
            email.type === (isAutomatic ? "automatic" : "manual")
        );

        if (!alreadySentRecent) {
          // Get assignee info
          const assignee = db.users.find((u: any) => u.id === rec.assigneeId) || {
            name: rec.assigneeName || "Assignee",
            email: rec.assigneeEmail || "assignee@rwg.com"
          };

          const subject = isAutomatic
            ? `[AUTOMATED REMINDER] Deadline approaching: '${rec.title}'`
            : `[URGENT REMINDER] Follow-up requested: '${rec.title}'`;

          const body = `Dear ${assignee.name},\n\nThis is a${isAutomatic ? 'n automated' : ' manual follow-up'} reminder that the deadline for your assigned recommendation '${rec.title}' is approaching on ${rec.deadline} (${diffDays} days remaining).\n\nCurrent implementation progress is ${progress}% (${achievedMilestones}/${totalMilestones} milestones completed).\n\nPlease log into the RWG Monitor and update your milestones once completed to ensure full transparency.\n\nBest regards,\nRWG Follow-up System`;

          const newEmail = {
            id: `em-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            to: assignee.email,
            toName: assignee.name,
            subject: subject,
            body: body,
            sentAt: new Date().toISOString(),
            type: isAutomatic ? "automatic" : "manual",
            status: "sent",
            recommendationId: rec.id,
            recommendationTitle: rec.title
          };

          db.emails.unshift(newEmail);
          emailsSent++;
        }
      }
    }
  });

  if (emailsSent > 0) {
    saveDb(db);
    console.log(`[Scheduler] Sent ${emailsSent} automated email reminders.`);
  }

  return emailsSent;
}

// Background scheduler running every 2 minutes to check upcoming deadlines
setInterval(() => {
  try {
    scanAndSendReminders(true);
  } catch (err) {
    console.error("Failed in automated reminders check:", err);
  }
}, 2 * 60 * 1000);

// API Endpoints

// 1. Authentication
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = getDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = `token_${user.id}_${Date.now()}`;
  activeSessions.set(token, user);

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const db = getDb();
  const exists = db.users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    name,
    email,
    password,
    role,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb(db);

  const token = `token_${newUser.id}_${Date.now()}`;
  activeSessions.set(token, newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ user: userWithoutPassword, token });
});

app.get("/api/auth/me", (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.post("/api/auth/logout", (req, res) => {
  const token = req.headers["x-token"] as string;
  if (token) {
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// Get all assignees for select dropdown
app.get("/api/users", (req, res) => {
  const db = getDb();
  const assignees = db.users.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  res.json(assignees);
});

// 2. Recommendations CRUD
app.get("/api/recommendations", (req, res) => {
  const db = getDb();
  // Calculate dynamic progress status for each recommendation
  const recommendations = db.recommendations.map((rec: any) => {
    const total = rec.milestones.length;
    const achieved = rec.milestones.filter((m: any) => m.achieved).length;
    return {
      ...rec,
      status: total > 0 ? Math.round((achieved / total) * 100) : 0
    };
  });
  res.json(recommendations);
});

app.post("/api/recommendations", (req, res) => {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Only administrators can create recommendations" });
  }

  const { title, description, source, category, priority, deadline, assigneeId } = req.body;
  if (!title || !description || !source || !category || !priority || !deadline || !assigneeId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const db = getDb();
  const assigneeUser = db.users.find((u: any) => u.id === assigneeId);
  if (!assigneeUser) {
    return res.status(400).json({ error: "Assignee user not found" });
  }

  const newRec = {
    id: `rec-${Date.now()}`,
    title,
    description,
    source,
    category,
    priority,
    deadline,
    assigneeId,
    assigneeName: assigneeUser.name,
    assigneeEmail: assigneeUser.email,
    milestones: [],
    createdAt: new Date().toISOString()
  };

  db.recommendations.push(newRec);
  saveDb(db);

  res.status(201).json({ ...newRec, status: 0 });
});

app.put("/api/recommendations/:id", (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;
  const db = getDb();
  const recIndex = db.recommendations.findIndex((r: any) => r.id === id);

  if (recIndex === -1) {
    return res.status(404).json({ error: "Recommendation not found" });
  }

  const rec = db.recommendations[recIndex];

  // If editing main details, only Admin can do it
  if (user.role !== "admin") {
    return res.status(403).json({ error: "Only administrators can edit recommendation details" });
  }

  const { title, description, source, category, priority, deadline, assigneeId } = req.body;
  if (!title || !description || !source || !category || !priority || !deadline || !assigneeId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const assigneeUser = db.users.find((u: any) => u.id === assigneeId);
  if (!assigneeUser) {
    return res.status(400).json({ error: "Assignee user not found" });
  }

  db.recommendations[recIndex] = {
    ...rec,
    title,
    description,
    source,
    category,
    priority,
    deadline,
    assigneeId,
    assigneeName: assigneeUser.name,
    assigneeEmail: assigneeUser.email
  };

  saveDb(db);

  const updatedRec = db.recommendations[recIndex];
  const total = updatedRec.milestones.length;
  const achieved = updatedRec.milestones.filter((m: any) => m.achieved).length;

  res.json({
    ...updatedRec,
    status: total > 0 ? Math.round((achieved / total) * 100) : 0
  });
});

app.delete("/api/recommendations/:id", (req, res) => {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Only administrators can delete recommendations" });
  }

  const { id } = req.params;
  const db = getDb();
  const initialLength = db.recommendations.length;
  db.recommendations = db.recommendations.filter((r: any) => r.id !== id);

  if (db.recommendations.length === initialLength) {
    return res.status(404).json({ error: "Recommendation not found" });
  }

  saveDb(db);
  res.json({ success: true });
});

// 3. Milestones Management
app.post("/api/recommendations/:id/milestones", (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Milestone title is required" });
  }

  const db = getDb();
  const recIndex = db.recommendations.findIndex((r: any) => r.id === id);

  if (recIndex === -1) {
    return res.status(404).json({ error: "Recommendation not found" });
  }

  const rec = db.recommendations[recIndex];

  // Role-based check: Admin, or the assigned user of this recommendation
  if (user.role !== "admin" && rec.assigneeId !== user.id) {
    return res.status(403).json({ error: "You can only add milestones to your assigned recommendations" });
  }

  const newMilestone = {
    id: `ms-${Date.now()}`,
    title: title.trim(),
    achieved: false,
    achievedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: user.name
  };

  rec.milestones.push(newMilestone);
  saveDb(db);

  const total = rec.milestones.length;
  const achieved = rec.milestones.filter((m: any) => m.achieved).length;

  res.status(201).json({
    recommendation: {
      ...rec,
      status: total > 0 ? Math.round((achieved / total) * 100) : 0
    },
    milestone: newMilestone
  });
});

app.put("/api/recommendations/:id/milestones/:milestoneId", (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id, milestoneId } = req.params;
  const { achieved } = req.body;

  const db = getDb();
  const recIndex = db.recommendations.findIndex((r: any) => r.id === id);

  if (recIndex === -1) {
    return res.status(404).json({ error: "Recommendation not found" });
  }

  const rec = db.recommendations[recIndex];

  // Role-based check: Admin, or the assigned user of this recommendation
  if (user.role !== "admin" && rec.assigneeId !== user.id) {
    return res.status(403).json({ error: "You can only update milestones on your assigned recommendations" });
  }

  const msIndex = rec.milestones.findIndex((m: any) => m.id === milestoneId);
  if (msIndex === -1) {
    return res.status(404).json({ error: "Milestone not found" });
  }

  rec.milestones[msIndex].achieved = !!achieved;
  rec.milestones[msIndex].achievedAt = achieved ? new Date().toISOString() : null;

  saveDb(db);

  const total = rec.milestones.length;
  const achievedCount = rec.milestones.filter((m: any) => m.achieved).length;

  res.json({
    recommendation: {
      ...rec,
      status: total > 0 ? Math.round((achievedCount / total) * 100) : 0
    },
    milestone: rec.milestones[msIndex]
  });
});

app.delete("/api/recommendations/:id/milestones/:milestoneId", (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id, milestoneId } = req.params;
  const db = getDb();
  const recIndex = db.recommendations.findIndex((r: any) => r.id === id);

  if (recIndex === -1) {
    return res.status(404).json({ error: "Recommendation not found" });
  }

  const rec = db.recommendations[recIndex];

  // Role-based check: Admin, or the assigned user of this recommendation
  if (user.role !== "admin" && rec.assigneeId !== user.id) {
    return res.status(403).json({ error: "You can only delete milestones on your assigned recommendations" });
  }

  const initialLength = rec.milestones.length;
  rec.milestones = rec.milestones.filter((m: any) => m.id !== milestoneId);

  if (rec.milestones.length === initialLength) {
    return res.status(404).json({ error: "Milestone not found" });
  }

  saveDb(db);

  const total = rec.milestones.length;
  const achievedCount = rec.milestones.filter((m: any) => m.achieved).length;

  res.json({
    recommendation: {
      ...rec,
      status: total > 0 ? Math.round((achievedCount / total) * 100) : 0
    }
  });
});

// 3.5 Individual Reminder Trigger
app.post("/api/recommendations/:id/remind", (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { id } = req.params;
  const db = getDb();
  const rec = db.recommendations.find((r: any) => r.id === id);

  if (!rec) {
    return res.status(404).json({ error: "Recommendation not found" });
  }

  const assignee = db.users.find((u: any) => u.id === rec.assigneeId) || {
    name: rec.assigneeName || "Assignee",
    email: rec.assigneeEmail || "assignee@rwg.com"
  };

  const total = rec.milestones.length;
  const achieved = rec.milestones.filter((m: any) => m.achieved).length;
  const progress = total > 0 ? Math.round((achieved / total) * 100) : 0;

  const subject = `[URGENT FOLLOW-UP] Compliance Alert: '${rec.title}'`;
  const body = `Dear ${assignee.name},\n\nThis is a manual follow-up alert sent by ${user.name} regarding your assigned recommendation '${rec.title}' (Deadline: ${rec.deadline}).\n\nCurrent implementation progress is ${progress}% (${achieved}/${total} milestones achieved).\n\nPlease review the checklist items and ensure everything is updated in the RWG Monitor portal.\n\nBest regards,\nCompliance Department`;

  const newEmail = {
    id: `em-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    to: assignee.email,
    toName: assignee.name,
    subject: subject,
    body: body,
    sentAt: new Date().toISOString(),
    type: "manual",
    status: "sent",
    recommendationId: rec.id,
    recommendationTitle: rec.title
  };

  db.emails.unshift(newEmail);
  saveDb(db);

  res.json({ success: true, email: newEmail });
});

// 4. Email Reminders trigger & fetching
app.get("/api/emails", (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const db = getDb();
  res.json(db.emails);
});

app.post("/api/emails/trigger", (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  // Admin or Assignee can trigger manually, but typically Admin
  const count = scanAndSendReminders(false); // manual trigger
  res.json({ success: true, count });
});

// Serves Vite dev middleware or static dist
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
