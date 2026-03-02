#!/usr/bin/env bun
/**
 * score-automation.ts - Calculate automation priority scores
 *
 * Usage:
 *   bun score-automation.ts <company> [--update]
 *
 * Calculates priority score: (F + I + P) × A / 15
 * Where:
 *   F = Frequency (1-5)
 *   I = Impact (1-5)
 *   P = Pain (1-5)
 *   A = Automatable (1-5)
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

interface AutomationScores {
  frequency: number;
  impact: number;
  pain: number;
  automatable: number;
  priority: number;
}

interface Node {
  id: string;
  name: string;
  automation_status?: string;
  automation_scores?: AutomationScores;
}

interface Graph {
  company: string;
  nodes: Node[];
  edges: unknown[];
}

const COMPANY_OS_DIR = join(process.env.HOME || "~", "kai", "company-os", "companies");

function loadGraph(company: string): Graph {
  const graphPath = join(COMPANY_OS_DIR, company, "company-graph.json");
  if (!existsSync(graphPath)) {
    console.error(`Error: No graph found at ${graphPath}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(graphPath, "utf-8"));
}

function calculatePriority(scores: Omit<AutomationScores, "priority">): number {
  const { frequency, impact, pain, automatable } = scores;
  return ((frequency + impact + pain) * automatable) / 15;
}

function printScores(graph: Graph): void {
  const scored = graph.nodes.filter((n) => n.automation_scores);
  const unscored = graph.nodes.filter(
    (n) => !n.automation_scores && n.id.startsWith("sop-")
  );

  console.log("\n## Automation Scores\n");

  if (scored.length > 0) {
    console.log("### Scored Nodes\n");
    console.log("| Node | F | I | P | A | Priority | Status |");
    console.log("|---|---|---|---|---|---|---|");

    const sorted = scored.sort(
      (a, b) =>
        (b.automation_scores?.priority || 0) -
        (a.automation_scores?.priority || 0)
    );

    for (const node of sorted) {
      const s = node.automation_scores!;
      const status = node.automation_status || "unknown";
      console.log(
        `| ${node.id} | ${s.frequency} | ${s.impact} | ${s.pain} | ${s.automatable} | ${s.priority.toFixed(2)} | ${status} |`
      );
    }
    console.log();
  }

  if (unscored.length > 0) {
    console.log("### Unscored SOP Nodes\n");
    for (const node of unscored) {
      console.log(`- ${node.id}: ${node.name}`);
    }
    console.log();
  }

  // Summary
  const total = graph.nodes.filter((n) => n.id.startsWith("sop-")).length;
  const manual = graph.nodes.filter(
    (n) => n.automation_status === "manual"
  ).length;
  const partial = graph.nodes.filter(
    (n) => n.automation_status === "partial"
  ).length;
  const full = graph.nodes.filter(
    (n) => n.automation_status === "full"
  ).length;

  console.log("### Summary\n");
  console.log(`- Total SOP nodes: ${total}`);
  console.log(`- Manual: ${manual} (${((manual / total) * 100).toFixed(0)}%)`);
  console.log(`- Partial: ${partial} (${((partial / total) * 100).toFixed(0)}%)`);
  console.log(`- Full: ${full} (${((full / total) * 100).toFixed(0)}%)`);

  const priority1 = scored.filter(
    (n) => n.automation_scores!.priority > 4
  ).length;
  const priority2 = scored.filter(
    (n) =>
      n.automation_scores!.priority > 3 && n.automation_scores!.priority <= 4
  ).length;

  console.log(`\n- Priority 1 (>4.0): ${priority1} nodes`);
  console.log(`- Priority 2 (3.0-4.0): ${priority2} nodes`);
}

function scoreNode(
  node: Node,
  frequency: number,
  impact: number,
  pain: number,
  automatable: number
): Node {
  const priority = calculatePriority({ frequency, impact, pain, automatable });
  return {
    ...node,
    automation_scores: { frequency, impact, pain, automatable, priority },
  };
}

function printHelp(): void {
  console.log(`
score-automation.ts - Calculate automation priority scores

Usage:
  bun score-automation.ts <company>         Show current scores
  bun score-automation.ts <company> --help  Show this help

Scoring Guide:
  F (Frequency): 5=multiple/day, 4=daily, 3=weekly, 2=monthly, 1=quarterly
  I (Impact): 5=primary metric, 4=customer exp, 3=internal, 2=nice-to-have, 1=minimal
  P (Pain): 5=error-prone, 4=time-consuming, 3=annoying, 2=minor, 1=easy
  A (Automatable): 5=tool exists, 4=simple script, 3=moderate, 2=complex, 1=human judgment

Priority = (F + I + P) × A / 15
  > 4.0: Automate now
  3.0-4.0: Automate soon
  2.0-3.0: Consider later
  < 2.0: Leave manual

Example:
  bun score-automation.ts grappling-connect
`);
}

// Main
const args = process.argv.slice(2);

if (args.length < 1 || args[0] === "--help" || args[0] === "-h") {
  printHelp();
  process.exit(0);
}

const company = args[0];
const graph = loadGraph(company);
printScores(graph);
