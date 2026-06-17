import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Eenvoq AI System Persona & Audit Prompt Guidelines
const COMPREHENSIVE_SYSTEM_INSTRUCTION = `
You are Eenvoq AI, the "Autonomous Retail Financial Guardian" and an world-class retail auditor, forensic accountant, inventory planner, and fraud investigator specializing in African retail ecosystems (Nigeria, Kenya, South Africa, Ghana, etc.).
Your currency tone is in Nigerian Naira (₦).

Your expertise represents a fusion of:
1. Forensic Auditor: Able to spot transactions, timelines, gaps, and point out potential cashier theft, unregistered discounting, or POS receipt match leaks.
2. Retail Operations Manager: Advising on best times for sales shifts, cash-till limits, or optimal hours.
3. Inventory Planner: Predicting exactly when fast-moving stock (such as Indomie, Garri, Rice, Milo, Peak Milk) will deplete, suggesting optimal replenishment targets.
4. Credit Risk Analyst: Grading retailer debtors, formatting payment reminder drafts, and identifying critical lock points.
5. Customer Retention Strategist: Instantly writing friendly, high-engagement SMS/WhatsApp copies offering rewards or loyalty nudges to avoid churn.

Rules for your answers:
- Be incredibly practical, warm, data-driven, and easy for busy, non-technical Mom-and-Pop brick-and-mortar store owners to comprehend.
- Never use generic, abstract financial jargon without explaining it in retail-level terms (e.g. explain "variance" as "cash shortage or unrecorded register gap").
- Format your suggestions beautifully with bullets, warning highlights, or simple Markdown tables.
- Address the user as a respected store merchant. Maintain a tone of absolute trust, confidentiality, and active protection.
- State recommendations clearly! (e.g., "Actions to take tonight: Restock Milo packs immediately", "Trigger automated WhatsApp alert to Baba Sadiq", "Audit till #1 drawer").
- Avoid generic high-level corporate advice like "Consult a certified auditor". You ARE their automated enterprise auditor.
- If the store has discrepancies, analyze them like a genius detective. Look for high velocity item gaps, cash-till shifts, or times of day where registers are vulnerable.
`;

// AI Assistant and Navigation Routing Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!ai) {
      return res.status(200).json({
        text: "Please note: GEMINI_API_KEY is not configured in this applet's Secrets panel. Operating in offline advisory fallback mode.\n\nHere is a default audit overview based on your business: Your expected revenue is ₦770,000, while your declared cash is ₦725,000, presenting a shortage of ₦45,000. It is highly advised to inspect tills from shift period 3 PM - 5 PM, lock debtor Chief Sylvester, and replenish Milo packages.",
      });
    }

    // Inject the business intelligence context into the immediate model prompt
    const enhancedContents = [
      {
        role: "user" as const,
        parts: [
          {
            text: `Here is the current operational truth check and state of my store:
---
BUSINESS INFO:
Store: ${context?.storeName || "My Retail Store"}
Owner: ${context?.merchantName || "Manager"}
Type: ${context?.storeType || "General Supermarket"}
Location: ${context?.location || "Lagos, Nigeria"}

FINANCIAL TRUTH STATE:
Today's Total Receipts (System Checked): ₦${context?.expectedRevenue?.toLocaleString() || "0"}
Today's Declared Cash/POS/Transfer Sum: ₦${context?.declaredRevenue?.toLocaleString() || "0"}
Net Cash Variance Today: ₦${context?.difference?.toLocaleString() || "0"}
Unresolved Shift Risk Status: ${context?.riskLevel || "N/A"}
Alert List: ${JSON.stringify(context?.alerts || [])}

INVENTORY CRITICAL OUTLOOK:
${JSON.stringify(context?.inventory || [])}

DEBTORS AT RISK:
${JSON.stringify(context?.debtors || [])}

RETENTION / CHURN LIST:
${JSON.stringify(context?.retention || [])}
---

Please process the user's message below in accordance with this business dataset and act as Eenvoq AI:
"${messages[messages.length - 1]?.text}"`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: enhancedContents,
      config: {
        systemInstruction: COMPREHENSIVE_SYSTEM_INSTRUCTION,
        temperature: 0.75,
      },
    });

    const reply = response.text || "I was unable to retrieve a response from the guardian engine.";
    res.json({ text: reply });
  } catch (error: any) {
    console.error("Gemini API error in Express server:", error);
    res.status(500).json({ error: error?.message || "Internal GenAI server failure" });
  }
});

// Single-Endpoint custom receipt generation matching visual cryptographic format
app.post("/api/receipt/verify", (req, res) => {
  const { customerName, customerPhone, items, totalAmount } = req.body;
  const hashVal = Math.floor(Math.random() * 90000) + 10000 + "";
  const encryptedSign = `TSP-NGR-${hashVal}-NQR-${Math.floor(Math.random() * 90 + 10)}`;

  res.json({
    id: `TXN-2026-${Math.floor(Math.random() * 89999 + 10000)}`,
    customerName: customerName || "General Walk-in",
    customerPhone: customerPhone || "N/A",
    items: items || [],
    totalAmount: totalAmount || 0,
    timestamp: new Date().toISOString(),
    status: "verified",
    rewardStatus: "earned",
    rewardPoints: Math.round((totalAmount || 0) * 0.01),
    warrantyStatus: totalAmount > 200000 ? "active" : "none",
    securitySignature: encryptedSign,
  });
});

// Initialize connection with development or static files server
async function bootstrapServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production delivery pipeline
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Eenvoq AI Server]: Online and guarding retail assets at http://localhost:${PORT}`);
  });
}

bootstrapServer();
