#!/usr/bin/env bun
/**
 * graph-query.ts - Query the CompanyGraph
 *
 * Usage:
 *   bun graph-query.ts <company> [query]
 *
 * Queries:
 *   nodes                    - List all nodes
 *   nodes --type=SOP         - List nodes of type
 *   node <id>                - Show node details
 *   edges                    - List all edges
 *   edges --from=<id>        - Edges from node
 *   edges --to=<id>          - Edges to node
 *   owns <role>              - Nodes owned by role
 *   depends-on <id>          - What depends on this node
 *   automatable              - Nodes ready to automate
 *   bottlenecks              - Nodes with bottleneck status
 *   orphans                  - Nodes with no edges
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

interface Node {
  id: string;
  type: string;
  name: string;
  stream?: string;
  owner?: string;
  status?: string;
  automation_status?: string;
  automation_scores?: {
    frequency: number;
    impact: number;
    pain: number;
    automatable: number;
    priority: number;
  };
  [key: string]: unknown;
}

interface Edge {
  from: string;
  to: string;
  type: string;
  condition?: string;
}

interface Graph {
  company: string;
  nodes: Node[];
  edges: Edge[];
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

function listNodes(graph: Graph, typeFilter?: string): void {
  let nodes = graph.nodes;
  if (typeFilter) {
    nodes = nodes.filter((n) => n.type === typeFilter);
  }
  console.log(`\nNodes (${nodes.length}):\n`);
  console.log("| ID | Type | Name | Owner | Status |");
  console.log("|---|---|---|---|---|");
  for (const node of nodes) {
    console.log(
      `| ${node.id} | ${node.type} | ${node.name} | ${node.owner || "-"} | ${node.status || "-"} |`
    );
  }
}

function showNode(graph: Graph, nodeId: string): void {
  const node = graph.nodes.find((n) => n.id === nodeId);
  if (!node) {
    console.error(`Error: Node '${nodeId}' not found`);
    process.exit(1);
  }
  console.log(`\nNode: ${node.name}\n`);
  console.log(JSON.stringify(node, null, 2));

  const edgesFrom = graph.edges.filter((e) => e.from === nodeId);
  const edgesTo = graph.edges.filter((e) => e.to === nodeId);

  if (edgesFrom.length > 0) {
    console.log("\nOutgoing edges:");
    for (const e of edgesFrom) {
      console.log(`  → ${e.to} (${e.type})`);
    }
  }

  if (edgesTo.length > 0) {
    console.log("\nIncoming edges:");
    for (const e of edgesTo) {
      console.log(`  ← ${e.from} (${e.type})`);
    }
  }
}

function listEdges(graph: Graph, fromId?: string, toId?: string): void {
  let edges = graph.edges;
  if (fromId) edges = edges.filter((e) => e.from === fromId);
  if (toId) edges = edges.filter((e) => e.to === toId);

  console.log(`\nEdges (${edges.length}):\n`);
  console.log("| From | To | Type | Condition |");
  console.log("|---|---|---|---|");
  for (const edge of edges) {
    console.log(`| ${edge.from} | ${edge.to} | ${edge.type} | ${edge.condition || "-"} |`);
  }
}

function findOwns(graph: Graph, role: string): void {
  const edges = graph.edges.filter((e) => e.from === role && e.type === "owns");
  const nodeIds = edges.map((e) => e.to);
  const nodes = graph.nodes.filter((n) => nodeIds.includes(n.id));

  console.log(`\nNodes owned by ${role} (${nodes.length}):\n`);
  for (const node of nodes) {
    console.log(`  - ${node.id}: ${node.name}`);
  }
}

function findDependsOn(graph: Graph, nodeId: string): void {
  const edges = graph.edges.filter((e) => e.to === nodeId && e.type === "depends_on");
  const nodeIds = edges.map((e) => e.from);
  const nodes = graph.nodes.filter((n) => nodeIds.includes(n.id));

  console.log(`\nNodes that depend on ${nodeId} (${nodes.length}):\n`);
  for (const node of nodes) {
    console.log(`  - ${node.id}: ${node.name}`);
  }
}

function findAutomatable(graph: Graph): void {
  const nodes = graph.nodes.filter(
    (n) =>
      n.automation_status !== "full" &&
      n.automation_scores &&
      n.automation_scores.priority > 3
  );

  console.log(`\nAutomatable nodes (priority > 3.0):\n`);
  console.log("| ID | Name | Priority | Current Status |");
  console.log("|---|---|---|---|");
  for (const node of nodes.sort(
    (a, b) =>
      (b.automation_scores?.priority || 0) - (a.automation_scores?.priority || 0)
  )) {
    console.log(
      `| ${node.id} | ${node.name} | ${node.automation_scores?.priority.toFixed(2)} | ${node.automation_status} |`
    );
  }
}

function findBottlenecks(graph: Graph): void {
  const nodes = graph.nodes.filter(
    (n) => n.status === "bottleneck" || n.status === "broken"
  );

  console.log(`\nBottleneck/Broken nodes (${nodes.length}):\n`);
  for (const node of nodes) {
    console.log(`  - [${node.status}] ${node.id}: ${node.name}`);
  }
}

function findOrphans(graph: Graph): void {
  const connectedIds = new Set([
    ...graph.edges.map((e) => e.from),
    ...graph.edges.map((e) => e.to),
  ]);
  const orphans = graph.nodes.filter((n) => !connectedIds.has(n.id));

  console.log(`\nOrphan nodes (no edges): ${orphans.length}\n`);
  for (const node of orphans) {
    console.log(`  - ${node.id}: ${node.name}`);
  }
}

function printHelp(): void {
  console.log(`
graph-query.ts - Query the CompanyGraph

Usage:
  bun graph-query.ts <company> <query> [options]

Queries:
  nodes                    List all nodes
  nodes --type=<type>      List nodes of type (SOP, Role, Tool, etc.)
  node <id>                Show node details
  edges                    List all edges
  edges --from=<id>        Edges from node
  edges --to=<id>          Edges to node
  owns <role>              Nodes owned by role
  depends-on <id>          What depends on this node
  automatable              Nodes ready to automate (priority > 3)
  bottlenecks              Nodes with bottleneck/broken status
  orphans                  Nodes with no edges

Examples:
  bun graph-query.ts grappling-connect nodes
  bun graph-query.ts grappling-connect nodes --type=SOP
  bun graph-query.ts grappling-connect node sop-respond-to-lead
  bun graph-query.ts grappling-connect owns role-founder
  bun graph-query.ts grappling-connect automatable
`);
}

// Main
const args = process.argv.slice(2);

if (args.length < 2 || args[0] === "--help" || args[0] === "-h") {
  printHelp();
  process.exit(0);
}

const company = args[0];
const query = args[1];
const graph = loadGraph(company);

switch (query) {
  case "nodes": {
    const typeArg = args.find((a) => a.startsWith("--type="));
    const typeFilter = typeArg ? typeArg.split("=")[1] : undefined;
    listNodes(graph, typeFilter);
    break;
  }
  case "node": {
    const nodeId = args[2];
    if (!nodeId) {
      console.error("Error: node query requires node ID");
      process.exit(1);
    }
    showNode(graph, nodeId);
    break;
  }
  case "edges": {
    const fromArg = args.find((a) => a.startsWith("--from="));
    const toArg = args.find((a) => a.startsWith("--to="));
    listEdges(
      graph,
      fromArg ? fromArg.split("=")[1] : undefined,
      toArg ? toArg.split("=")[1] : undefined
    );
    break;
  }
  case "owns": {
    const role = args[2];
    if (!role) {
      console.error("Error: owns query requires role ID");
      process.exit(1);
    }
    findOwns(graph, role);
    break;
  }
  case "depends-on": {
    const nodeId = args[2];
    if (!nodeId) {
      console.error("Error: depends-on query requires node ID");
      process.exit(1);
    }
    findDependsOn(graph, nodeId);
    break;
  }
  case "automatable":
    findAutomatable(graph);
    break;
  case "bottlenecks":
    findBottlenecks(graph);
    break;
  case "orphans":
    findOrphans(graph);
    break;
  default:
    console.error(`Unknown query: ${query}`);
    printHelp();
    process.exit(1);
}
