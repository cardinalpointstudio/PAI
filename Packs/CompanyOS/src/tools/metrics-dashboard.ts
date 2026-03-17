#!/usr/bin/env bun
/**
 * metrics-dashboard.ts - Compare actuals vs IdealState targets
 *
 * Usage:
 *   bun metrics-dashboard.ts <company>
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

interface Metric {
  name: string;
  description: string;
  type: string;
  direction: "higher_is_better" | "lower_is_better";
  current: number | null;
  ideal: number;
  acceptable: number;
  red_zone: number;
  unit: string;
}

interface IdealState {
  company: string;
  mission: string;
  metrics: Metric[];
}

const COMPANY_OS_DIR = join(process.env.HOME || "~", "kai", "company-os", "companies");

function loadIdealState(company: string): IdealState | null {
  const path = join(COMPANY_OS_DIR, company, "ideal-state.yaml");
  if (!existsSync(path)) return null;
  return parse(readFileSync(path, "utf-8"));
}

type Status = "ideal" | "acceptable" | "warning" | "red_zone" | "no_data";

function computeStatus(metric: Metric): Status {
  const { current, ideal, acceptable, red_zone, direction } = metric;

  if (current === null) return "no_data";

  if (direction === "higher_is_better") {
    if (current >= ideal) return "ideal";
    if (current >= acceptable) return "acceptable";
    if (current > red_zone) return "warning";
    return "red_zone";
  } else {
    if (current <= ideal) return "ideal";
    if (current <= acceptable) return "acceptable";
    if (current < red_zone) return "warning";
    return "red_zone";
  }
}

function statusEmoji(status: Status): string {
  switch (status) {
    case "ideal":
      return "🟢";
    case "acceptable":
      return "🟡";
    case "warning":
      return "🟠";
    case "red_zone":
      return "🔴";
    case "no_data":
      return "⚪";
  }
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return "--";
  if (unit === "%") return `${(value * 100).toFixed(0)}%`;
  return `${value}${unit ? " " + unit : ""}`;
}

function printDashboard(idealState: IdealState): void {
  console.log(`\n# Metrics Dashboard: ${idealState.company}\n`);
  console.log(`> ${idealState.mission.trim()}\n`);

  console.log("| Metric | Current | Ideal | Acceptable | Red Zone | Status |");
  console.log("|--------|---------|-------|------------|----------|--------|");

  let idealCount = 0;
  let acceptableCount = 0;
  let warningCount = 0;
  let redCount = 0;
  let noDataCount = 0;

  for (const metric of idealState.metrics) {
    const status = computeStatus(metric);
    const emoji = statusEmoji(status);
    const currentStr = formatValue(metric.current, metric.unit);
    const idealStr = formatValue(metric.ideal, metric.unit);
    const acceptableStr = formatValue(metric.acceptable, metric.unit);
    const redStr = formatValue(metric.red_zone, metric.unit);

    console.log(
      `| ${metric.name} | ${currentStr} | ${idealStr} | ${acceptableStr} | ${redStr} | ${emoji} |`
    );

    switch (status) {
      case "ideal":
        idealCount++;
        break;
      case "acceptable":
        acceptableCount++;
        break;
      case "warning":
        warningCount++;
        break;
      case "red_zone":
        redCount++;
        break;
      case "no_data":
        noDataCount++;
        break;
    }
  }

  console.log("\n---\n");
  console.log("## Summary\n");
  console.log(`- 🟢 Ideal: ${idealCount}`);
  console.log(`- 🟡 Acceptable: ${acceptableCount}`);
  console.log(`- 🟠 Warning: ${warningCount}`);
  console.log(`- 🔴 Red Zone: ${redCount}`);
  console.log(`- ⚪ No Data: ${noDataCount}`);

  if (redCount > 0) {
    console.log("\n## Action Required\n");
    for (const metric of idealState.metrics) {
      if (computeStatus(metric) === "red_zone") {
        console.log(
          `- **${metric.name}** is in red zone (${formatValue(metric.current, metric.unit)} vs ${formatValue(metric.red_zone, metric.unit)} threshold)`
        );
      }
    }
  }

  if (noDataCount > 0) {
    console.log("\n## Missing Data\n");
    for (const metric of idealState.metrics) {
      if (computeStatus(metric) === "no_data") {
        console.log(`- ${metric.name}: No current value`);
      }
    }
  }
}

// Main
const args = process.argv.slice(2);

if (args.length < 1 || args[0] === "--help" || args[0] === "-h") {
  console.log(`
metrics-dashboard.ts - Compare actuals vs IdealState targets

Usage:
  bun metrics-dashboard.ts <company>

Example:
  bun metrics-dashboard.ts grappling-connect
`);
  process.exit(0);
}

const company = args[0];
const idealState = loadIdealState(company);

if (!idealState) {
  console.error(
    `Error: ideal-state.yaml not found for company '${company}'`
  );
  process.exit(1);
}

printDashboard(idealState);
