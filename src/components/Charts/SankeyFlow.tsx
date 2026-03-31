import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import type { SankeyGraph, SankeyNode, SankeyLink } from 'd3-sankey';
import { buildSankeyData } from '../../utils/sankeyDataBuilder';
import { formatCurrency, formatPercent } from '../../utils/formatCurrency';
import { useCompStore } from '../../store/useCompStore';
import type { SankeyNodeData, SankeyLinkData } from '../../engine/types';

interface TooltipState {
  x: number;
  y: number;
  content: string;
  visible: boolean;
}

type D3SankeyNode = SankeyNode<SankeyNodeData, SankeyLinkData>;
type D3SankeyLink = SankeyLink<SankeyNodeData, SankeyLinkData>;

export function SankeyFlow() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { output } = useCompStore();
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, content: '', visible: false });

  useEffect(() => {
    if (!output || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = Math.max(400, container.clientHeight || 500);
    const margin = { top: 20, right: 160, bottom: 20, left: 20 };

    const sankeyData = buildSankeyData(output);

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const sankeyLayout = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeId((d) => d.id)
      .nodeWidth(18)
      .nodePadding(14)
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ]);

    const graph: SankeyGraph<SankeyNodeData, SankeyLinkData> = sankeyLayout({
      nodes: sankeyData.nodes.map((d) => ({ ...d })),
      links: sankeyData.links.map((d) => ({ ...d })),
    });

    const grossTC = output.grossTC;

    // Draw links
    svg
      .append('g')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const sourceNode = d.source as D3SankeyNode;
        return sourceNode.color ?? '#6366f1';
      })
      .attr('stroke-opacity', 0.25)
      .attr('stroke-width', (d) => Math.max(1, d.width ?? 0))
      .on('mouseenter', (event: MouseEvent, d: D3SankeyLink) => {
        const targetNode = d.target as D3SankeyNode;
        const pct = grossTC > 0 ? (d.value / grossTC) * 100 : 0;
        setTooltip({
          x: event.offsetX + 10,
          y: event.offsetY - 10,
          content: `${targetNode.name}\n${formatCurrency(d.value)} (${pct.toFixed(1)}%)`,
          visible: true,
        });
        d3.select(event.currentTarget as SVGPathElement)
          .attr('stroke-opacity', 0.6);
      })
      .on('mousemove', (event: MouseEvent) => {
        setTooltip((t) => ({ ...t, x: event.offsetX + 10, y: event.offsetY - 10 }));
      })
      .on('mouseleave', (event: MouseEvent) => {
        setTooltip((t) => ({ ...t, visible: false }));
        d3.select(event.currentTarget as SVGPathElement)
          .attr('stroke-opacity', 0.25);
      });

    // Draw nodes
    const nodeGroup = svg
      .append('g')
      .selectAll('g')
      .data(graph.nodes)
      .join('g');

    nodeGroup
      .append('rect')
      .attr('x', (d: D3SankeyNode) => d.x0 ?? 0)
      .attr('y', (d: D3SankeyNode) => d.y0 ?? 0)
      .attr('height', (d: D3SankeyNode) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr('width', (d: D3SankeyNode) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr('fill', (d: D3SankeyNode) => d.color ?? '#6366f1')
      .attr('rx', 3)
      .on('mouseenter', (event: MouseEvent, d: D3SankeyNode) => {
        const pct = grossTC > 0 ? ((d.value ?? 0) / grossTC) * 100 : 0;
        setTooltip({
          x: event.offsetX + 10,
          y: event.offsetY - 10,
          content: `${d.name}\n${formatCurrency(d.value ?? 0)} (${pct.toFixed(1)}%)`,
          visible: true,
        });
      })
      .on('mousemove', (event: MouseEvent) => {
        setTooltip((t) => ({ ...t, x: event.offsetX + 10, y: event.offsetY - 10 }));
      })
      .on('mouseleave', () => {
        setTooltip((t) => ({ ...t, visible: false }));
      });

    // Draw labels
    nodeGroup
      .append('text')
      .attr('x', (d: D3SankeyNode) => ((d.x1 ?? 0) < width / 2 ? (d.x1 ?? 0) + 8 : (d.x0 ?? 0) - 8))
      .attr('y', (d: D3SankeyNode) => ((d.y1 ?? 0) + (d.y0 ?? 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d: D3SankeyNode) => (d.x1 ?? 0) < width / 2 ? 'start' : 'end')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '11px')
      .attr('font-family', 'system-ui, sans-serif')
      .each(function (d: D3SankeyNode) {
        const el = d3.select(this);
        const pct = grossTC > 0 ? ((d.value ?? 0) / grossTC) * 100 : 0;
        el.append('tspan')
          .text(d.name)
          .attr('font-weight', '600');
        el.append('tspan')
          .attr('x', (d.x1 ?? 0) < width / 2 ? (d.x1 ?? 0) + 8 : (d.x0 ?? 0) - 8)
          .attr('dy', '1.2em')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .text(`${formatCurrency(d.value ?? 0)} · ${pct.toFixed(1)}%`);
      });

  }, [output]);

  // Re-render on resize
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (output) {
        // Trigger re-render by dispatching a custom event
        svgRef.current?.dispatchEvent(new Event('resize'));
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [output]);

  if (!output) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Enter compensation details to see the flow
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={containerRef} style={{ minHeight: 460 }}>
      <svg ref={svgRef} className="w-full" style={{ overflow: 'visible' }} />
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white shadow-xl z-10 whitespace-pre"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translateY(-100%)' }}
        >
          {tooltip.content.split('\n').map((line, i) => (
            <div key={i} className={i === 0 ? 'font-semibold' : 'text-slate-300 mt-0.5'}>
              {line}
            </div>
          ))}
        </div>
      )}
      <div className="absolute bottom-2 right-2 text-xs text-slate-600">
        Total Comp: {formatCurrency(output.grossTC)} · Take-home: {formatPercent(output.takeHome / output.grossTC)}
      </div>
    </div>
  );
}
