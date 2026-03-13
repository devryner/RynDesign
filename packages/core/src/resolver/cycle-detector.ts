import { CircularReferenceError } from '../parser/errors.js';

const ALIAS_REGEX = /\{([^}]+)\}/g;

export interface DependencyGraph {
  nodes: Set<string>;
  edges: Map<string, Set<string>>; // tokenPath -> Set of tokenPaths it references
}

export function buildDependencyGraph(tokens: Map<string, unknown>): DependencyGraph {
  const nodes = new Set<string>();
  const edges = new Map<string, Set<string>>();

  for (const [path, value] of tokens) {
    nodes.add(path);
    const refs = extractReferences(value);
    if (refs.length > 0) {
      edges.set(path, new Set(refs));
    }
  }

  return { nodes, edges };
}

export function extractReferences(value: unknown): string[] {
  const refs: string[] = [];

  if (typeof value === 'string') {
    let match;
    ALIAS_REGEX.lastIndex = 0;
    while ((match = ALIAS_REGEX.exec(value)) !== null) {
      refs.push(match[1]);
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const v of Object.values(value as Record<string, unknown>)) {
      refs.push(...extractReferences(v));
    }
  }

  return refs;
}

export function topologicalSort(graph: DependencyGraph): string[] {
  const visited = new Set<string>();
  const visiting = new Set<string>(); // for cycle detection
  const sorted: string[] = [];

  function visit(node: string, stack: string[]): void {
    if (visited.has(node)) return;

    if (visiting.has(node)) {
      const cycleStart = stack.indexOf(node);
      const cycle = [...stack.slice(cycleStart), node];
      throw new CircularReferenceError(
        `Circular reference detected: ${cycle.join(' → ')}`,
        cycle
      );
    }

    visiting.add(node);
    stack.push(node);

    const deps = graph.edges.get(node);
    if (deps) {
      for (const dep of deps) {
        if (graph.nodes.has(dep)) {
          visit(dep, stack);
        }
      }
    }

    visiting.delete(node);
    stack.pop();
    visited.add(node);
    sorted.push(node);
  }

  for (const node of graph.nodes) {
    visit(node, []);
  }

  return sorted;
}
