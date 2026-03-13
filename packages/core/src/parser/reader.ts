import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { TokenParseError } from './errors.js';

export interface RawTokenTree {
  [key: string]: unknown;
}

export async function readTokenFile(filePath: string): Promise<RawTokenTree> {
  const absolutePath = path.resolve(filePath);
  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    return JSON.parse(content) as RawTokenTree;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new TokenParseError(`Token file not found: ${absolutePath}`, absolutePath);
    }
    if (err instanceof SyntaxError) {
      throw new TokenParseError(`Invalid JSON in token file: ${absolutePath}`, absolutePath);
    }
    throw err;
  }
}

export async function readAndMergeTokenFiles(patterns: string[], basePath: string = process.cwd()): Promise<RawTokenTree> {
  const files = await fg(patterns, { cwd: basePath, absolute: true });

  if (files.length === 0) {
    throw new TokenParseError(`No token files found matching patterns: ${patterns.join(', ')}`);
  }

  // Sort for deterministic order
  files.sort();

  let merged: RawTokenTree = {};
  for (const file of files) {
    const tree = await readTokenFile(file);
    merged = deepMerge(merged, tree);
  }

  return merged;
}

export function deepMerge(target: RawTokenTree, source: RawTokenTree): RawTokenTree {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
      result[key] = deepMerge(targetVal as RawTokenTree, sourceVal as RawTokenTree);
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
