import type { EngineOutput, SankeyNodeData, SankeyLinkData } from '../engine/types';

export interface SankeyData {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
}

export function buildSankeyData(output: EngineOutput): SankeyData {
  const {
    grossTC,
    preTaxDeductions,
    federalTax,
    stateTax,
    ficaSocialSecurity,
    ficaMedicare,
    ficaAdditionalMedicare,
    takeHome,
  } = output;

  const nodes: SankeyNodeData[] = [
    { id: 'gross',      name: 'Gross TC',          color: '#6366f1' },
    { id: 'pretax',     name: 'Pre-Tax Income',     color: '#8b5cf6' },
    { id: 'federal',    name: 'Federal Tax',        color: '#ef4444' },
    { id: 'state',      name: 'State Tax',          color: '#f97316' },
    { id: 'ss',         name: 'Social Security',    color: '#f59e0b' },
    { id: 'medicare',   name: 'Medicare',           color: '#eab308' },
    { id: 'k401',       name: '401(k)',             color: '#3b82f6' },
    { id: 'hsa',        name: 'HSA',                color: '#06b6d4' },
    { id: 'health',     name: 'Health Premiums',    color: '#0891b2' },
    { id: 'takehome',   name: 'Take-Home',          color: '#22c55e' },
  ];

  // Add FSA node only if there's a contribution
  if (preTaxDeductions.fsa > 0) {
    nodes.push({ id: 'fsa', name: 'FSA', color: '#14b8a6' });
  }

  // Additional medicare node if applicable
  const totalMedicare = ficaMedicare + ficaAdditionalMedicare;

  const links: SankeyLinkData[] = [];

  // Pre-tax deductions flow directly from gross
  if (preTaxDeductions.contribution401k > 0) {
    links.push({ source: 'gross', target: 'k401', value: preTaxDeductions.contribution401k });
  }
  if (preTaxDeductions.hsa > 0) {
    links.push({ source: 'gross', target: 'hsa', value: preTaxDeductions.hsa });
  }
  if (preTaxDeductions.healthPremiums > 0) {
    links.push({ source: 'gross', target: 'health', value: preTaxDeductions.healthPremiums });
  }
  if (preTaxDeductions.fsa > 0) {
    links.push({ source: 'gross', target: 'fsa', value: preTaxDeductions.fsa });
  }

  // Remaining gross → pretax node
  const pretaxAmount = grossTC - preTaxDeductions.total;
  links.push({ source: 'gross', target: 'pretax', value: Math.max(pretaxAmount, 1) });

  // From pretax → taxes and take-home
  if (federalTax > 0) {
    links.push({ source: 'pretax', target: 'federal', value: federalTax });
  }
  if (stateTax > 0) {
    links.push({ source: 'pretax', target: 'state', value: stateTax });
  }
  if (ficaSocialSecurity > 0) {
    links.push({ source: 'pretax', target: 'ss', value: ficaSocialSecurity });
  }
  if (totalMedicare > 0) {
    links.push({ source: 'pretax', target: 'medicare', value: totalMedicare });
  }

  const remainingForTakeHome = Math.max(
    pretaxAmount - federalTax - stateTax - ficaSocialSecurity - totalMedicare,
    1,
  );
  links.push({ source: 'pretax', target: 'takehome', value: remainingForTakeHome });

  // Filter out nodes that have no links
  const usedNodeIds = new Set<string>();
  for (const link of links) {
    usedNodeIds.add(link.source);
    usedNodeIds.add(link.target);
  }

  return {
    nodes: nodes.filter((n) => usedNodeIds.has(n.id)),
    links,
  };

  // Silence unused variable warning
  void takeHome;
}
