#!/usr/bin/env bun
/**
 * show-gaps.ts - Find incomplete nodes, TBDs, missing SOPs
 *
 * Usage:
 *   bun show-gaps.ts <company>
 *
 * Checks:
 *   - Nodes without SOPs
 *   - Nodes without owners
 *   - TBD values in ideal-state
 *   - Missing files
 *   - Stale documents
 */

import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

interface Node {
  id: string;
  name: string;
  type: string;
  owner?: string;
  sop_file?: string;
  sop_status?: string;
}

interface Graph {
  company: string;
  nodes: Node[];
}

interface IdealState {
  metrics: { name: string; current: unknown }[];
}

const COMPANY_OS_DIR = join(process.env.HOME || "~", "kai", "company-os", "companies");

function loadJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function loadYaml<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  return parse(readFileSync(path, "utf-8"));
}

interface Gap {
  type: "error" | "warning" | "info";
  category: string;
  message: string;
}

function findGaps(company: string): Gap[] {
  const gaps: Gap[] = [];
  const companyDir = join(COMPANY_OS_DIR, company);

  if (!existsSync(companyDir)) {
    gaps.push({
      type: "error",
      category: "Structure",
      message: `Company directory not found: ${companyDir}`,
    });
    return gaps;
  }

  // Check required files
  const requiredFiles = [
    "ideal-state.yaml",
    "company-graph.json",
    "org-model.yaml",
    "principles.md",
    "automation-backlog.md",
    "tool-registry.md",
  ];

  for (const file of requiredFiles) {
    const path = join(companyDir, file);
    if (!existsSync(path)) {
      gaps.push({
        type: "warning",
        category: "Structure",
        message: `Missing file: ${file}`,
      });
    }
  }

  // Check graph
  const graph = loadJson<Graph>(join(companyDir, "company-graph.json"));
  if (graph) {
    // Nodes without owners
    const sopNodes = graph.nodes.filter((n) => n.type === "SOP");
    for (const node of sopNodes) {
      if (!node.owner) {
        gaps.push({
          type: "error",
          category: "Ownership",
          message: `Node '${node.id}' has no owner`,
        });
      }
    }

    // Nodes without SOPs
    for (const node of sopNodes) {
      if (!node.sop_file) {
        gaps.push({
          type: "warning",
          category: "Documentation",
          message: `Node '${node.id}' has no SOP file linked`,
        });
      } else {
        const sopPath = join(companyDir, node.sop_file);
        if (!existsSync(sopPath)) {
          gaps.push({
            type: "error",
            category: "Documentation",
            message: `SOP file missing: ${node.sop_file}`,
          });
        }
      }
    }

    // Stale SOPs
    for (const node of sopNodes) {
      if (node.sop_status === "stale") {
        gaps.push({
          type: "warning",
          category: "Documentation",
          message: `SOP '${node.id}' marked as stale`,
        });
      }
    }
  }

  // Check ideal-state for TBDs
  const idealState = loadYaml<IdealState>(
    join(companyDir, "ideal-state.yaml")
  );
  if (idealState?.metrics) {
    for (const metric of idealState.metrics) {
      if (metric.current === null || metric.current === "TBD") {
        gaps.push({
          type: "info",
          category: "Metrics",
          message: `Metric '${metric.name}' has no current value`,
        });
      }
    }
  }

  // Check for value streams in graph
  if (graph) {
    const valueStreams = graph.nodes.filter((n) => n.type === "ValueStream");
    if (valueStreams.length === 0) {
      gaps.push({
        type: "warning",
        category: "Structure",
        message: "No ValueStream nodes in company-graph.json",
      });
    }
  }

  // Check for SOPs
  const sopsDir = join(companyDir, "sops");
  if (!existsSync(sopsDir)) {
    gaps.push({
      type: "warning",
      category: "Structure",
      message: "No sops directory",
    });
  }

  return gaps;
}

function printGaps(company: string, gaps: Gap[]): void {
  console.log(`\n# Gap Analysis: ${company}\n`);

  if (gaps.length === 0) {
    console.log("✅ No gaps found! All documentation is complete.\n");
    return;
  }

  const errors = gaps.filter((g) => g.type === "error");
  const warnings = gaps.filter((g) => g.type === "warning");
  const infos = gaps.filter((g) => g.type === "info");

  console.log(`Found ${gaps.length} gaps: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info\n`);

  if (errors.length > 0) {
    console.log("## Errors (Must Fix)\n");
    const byCategory = groupBy(errors, (g) => g.category);
    for (const [category, items] of Object.entries(byCategory)) {
      console.log(`### ${category}\n`);
      for (const item of items) {
        console.log(`- ❌ ${item.message}`);
      }
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log("## Warnings (Should Fix)\n");
    const byCategory = groupBy(warnings, (g) => g.category);
    for (const [category, items] of Object.entries(byCategory)) {
      console.log(`### ${category}\n`);
      for (const item of items) {
        console.log(`- ⚠️  ${item.message}`);
      }
      console.log();
    }
  }

  if (infos.length > 0) {
    console.log("## Info (Consider)\n");
    for (const item of infos) {
      console.log(`- ℹ️  ${item.message}`);
    }
    console.log();
  }
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = key(item);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

// Main
const args = process.argv.slice(2);

if (args.length < 1 || args[0] === "--help" || args[0] === "-h") {
  console.log(`
show-gaps.ts - Find incomplete nodes, TBDs, missing SOPs

Usage:
  bun show-gaps.ts <company>

Checks:
  - Nodes without SOPs
  - Nodes without owners
  - TBD values in ideal-state
  - Missing required files
  - Stale documents

Example:
  bun show-gaps.ts grappling-connect
`);
  process.exit(0);
}

const company = args[0];
const gaps = findGaps(company);
printGaps(company, gaps);

process.exit(gaps.filter((g) => g.type === "error").length > 0 ? 1 : 0);
