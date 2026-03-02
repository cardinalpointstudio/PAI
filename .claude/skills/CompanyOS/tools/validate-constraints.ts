#!/usr/bin/env bun
/**
 * validate-constraints.ts - Check org against OrgModel constraints
 *
 * Usage:
 *   bun validate-constraints.ts <company>
 *
 * Checks:
 *   - Every node has an owner
 *   - Owners exist in team
 *   - Span of control within limits
 *   - Critical nodes have backups
 *   - Future role triggers
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

interface Node {
  id: string;
  name: string;
  owner?: string;
  backup?: string;
}

interface Graph {
  nodes: Node[];
  edges: { from: string; to: string; type: string }[];
}

interface TeamMember {
  role: string;
  person: string | null;
  owns: string[];
  backup_for: string[];
}

interface OrgModel {
  team: TeamMember[];
  constraints: {
    span_of_control: { max: number; min: number };
  };
  future_roles: {
    trigger: string;
    role: string;
    urgency: string;
  }[];
  non_negotiables: string[];
}

interface IdealState {
  critical_nodes: { node_id: string }[];
}

const COMPANY_OS_DIR = join(process.env.HOME || "~", "kai", "company-os", "companies");

function loadFile<T>(path: string, parser: "json" | "yaml"): T | null {
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8");
  return parser === "json" ? JSON.parse(content) : parse(content);
}

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function validate(company: string): ValidationResult {
  const result: ValidationResult = { errors: [], warnings: [] };

  const graphPath = join(COMPANY_OS_DIR, company, "company-graph.json");
  const orgPath = join(COMPANY_OS_DIR, company, "org-model.yaml");
  const idealPath = join(COMPANY_OS_DIR, company, "ideal-state.yaml");

  const graph = loadFile<Graph>(graphPath, "json");
  const orgModel = loadFile<OrgModel>(orgPath, "yaml");
  const idealState = loadFile<IdealState>(idealPath, "yaml");

  if (!graph) {
    result.errors.push(`company-graph.json not found`);
    return result;
  }

  if (!orgModel) {
    result.warnings.push(`org-model.yaml not found - skipping org checks`);
  }

  // Check 1: Every SOP node has an owner
  const sopNodes = graph.nodes.filter((n) => n.id.startsWith("sop-"));
  for (const node of sopNodes) {
    if (!node.owner) {
      result.errors.push(`Node '${node.id}' has no owner`);
    }
  }

  if (orgModel) {
    // Check 2: Owners exist in team
    const roleIds = orgModel.team.map((t) => t.role);
    for (const node of sopNodes) {
      if (node.owner && !roleIds.includes(node.owner)) {
        result.errors.push(
          `Node '${node.id}' owner '${node.owner}' not found in team`
        );
      }
    }

    // Check 3: Span of control
    for (const member of orgModel.team) {
      const ownedCount = member.owns?.length || 0;
      if (ownedCount > orgModel.constraints.span_of_control.max) {
        result.warnings.push(
          `Role '${member.role}' owns ${ownedCount} nodes (max: ${orgModel.constraints.span_of_control.max})`
        );
      }
    }

    // Check 4: Future role triggers
    for (const futureRole of orgModel.future_roles || []) {
      if (futureRole.urgency === "met") {
        result.warnings.push(
          `Future role trigger MET: ${futureRole.trigger} → Add '${futureRole.role}'`
        );
      } else if (futureRole.urgency === "approaching") {
        result.warnings.push(
          `Future role trigger APPROACHING: ${futureRole.trigger}`
        );
      }
    }
  }

  // Check 5: Critical nodes have backups
  if (idealState?.critical_nodes) {
    for (const critical of idealState.critical_nodes) {
      const node = graph.nodes.find((n) => n.id === critical.node_id);
      if (node && !node.backup) {
        result.warnings.push(
          `Critical node '${critical.node_id}' has no backup assigned`
        );
      }
    }
  }

  // Check 6: Orphan nodes
  const connectedIds = new Set([
    ...graph.edges.map((e) => e.from),
    ...graph.edges.map((e) => e.to),
  ]);
  const orphans = graph.nodes.filter(
    (n) => !connectedIds.has(n.id) && n.id.startsWith("sop-")
  );
  for (const orphan of orphans) {
    result.warnings.push(`Node '${orphan.id}' is orphaned (no edges)`);
  }

  return result;
}

function printResults(result: ValidationResult): void {
  console.log("\n## Constraint Validation Report\n");

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log("✅ All constraints satisfied!\n");
    return;
  }

  if (result.errors.length > 0) {
    console.log(`### Errors (${result.errors.length})\n`);
    for (const error of result.errors) {
      console.log(`❌ ${error}`);
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log(`### Warnings (${result.warnings.length})\n`);
    for (const warning of result.warnings) {
      console.log(`⚠️  ${warning}`);
    }
    console.log();
  }
}

// Main
const args = process.argv.slice(2);

if (args.length < 1 || args[0] === "--help" || args[0] === "-h") {
  console.log(`
validate-constraints.ts - Check org against OrgModel constraints

Usage:
  bun validate-constraints.ts <company>

Example:
  bun validate-constraints.ts grappling-connect
`);
  process.exit(0);
}

const company = args[0];
const result = validate(company);
printResults(result);

process.exit(result.errors.length > 0 ? 1 : 0);
