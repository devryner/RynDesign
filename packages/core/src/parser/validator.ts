import type { TokenType } from '@ryndesign/plugin-api';
import type { RawTokenTree } from './reader.js';
import { TokenValidationError, type ValidationIssue } from './errors.js';

const VALID_TOKEN_TYPES: TokenType[] = [
  'color', 'dimension', 'fontFamily', 'fontWeight', 'duration',
  'cubicBezier', 'number', 'shadow', 'border', 'typography',
  'transition', 'gradient',
];

const RESERVED_KEYS = new Set(['$type', '$value', '$description', '$deprecated', '$extensions', '$schema']);

export function validateTree(tree: RawTokenTree): RawTokenTree {
  const issues: ValidationIssue[] = [];
  validateNode(tree, [], issues);

  const errors = issues.filter(i => i.severity === 'error');
  if (errors.length > 0) {
    throw new TokenValidationError(
      `Token validation failed with ${errors.length} error(s)`,
      issues
    );
  }

  return tree;
}

function validateNode(node: RawTokenTree, path: string[], issues: ValidationIssue[]): void {
  // Check if this node is a token (has $value)
  if ('$value' in node) {
    validateToken(node, path, issues);
    return;
  }

  // Check $type at group level
  if ('$type' in node) {
    const type = node['$type'] as string;
    if (!VALID_TOKEN_TYPES.includes(type as TokenType)) {
      issues.push({
        path,
        message: `Invalid $type: "${type}". Must be one of: ${VALID_TOKEN_TYPES.join(', ')}`,
        severity: 'error',
      });
    }
  }

  // Recurse into children
  for (const [key, value] of Object.entries(node)) {
    if (RESERVED_KEYS.has(key)) continue;
    if (key.startsWith('$')) continue;

    if (isPlainObject(value)) {
      validateNode(value as RawTokenTree, [...path, key], issues);
    }
  }
}

function validateToken(node: RawTokenTree, path: string[], issues: ValidationIssue[]): void {
  const value = node['$value'];
  if (value === undefined || value === null) {
    issues.push({
      path,
      message: 'Token $value cannot be null or undefined',
      severity: 'error',
    });
  }

  if ('$type' in node) {
    const type = node['$type'] as string;
    if (!VALID_TOKEN_TYPES.includes(type as TokenType)) {
      issues.push({
        path,
        message: `Invalid $type: "${type}"`,
        severity: 'error',
      });
    }
  }

  if ('$deprecated' in node) {
    const dep = node['$deprecated'];
    if (typeof dep !== 'boolean' && typeof dep !== 'string') {
      issues.push({
        path,
        message: '$deprecated must be a boolean or string',
        severity: 'warning',
      });
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
