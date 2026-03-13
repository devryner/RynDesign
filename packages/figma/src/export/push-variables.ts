import { FigmaClient, type FigmaVariableChanges, type FigmaColor, type FigmaVariableValue } from '../api-client.js';
import type { ResolvedToken } from '@ryndesign/plugin-api';

export interface PushOptions {
  fileKey: string;
  personalAccessToken?: string;
  oauthToken?: string;
  collectionName?: string;
  tokens: ResolvedToken[];
  darkTokens?: ResolvedToken[];
}

export async function pushVariablesToFigma(options: PushOptions): Promise<void> {
  const client = new FigmaClient({
    personalAccessToken: options.personalAccessToken,
    oauthToken: options.oauthToken,
  });

  // Get existing variables to determine create vs update
  const existing = await client.getFileVariables(options.fileKey);
  const existingVars = existing.meta.variables;
  const existingCollections = existing.meta.variableCollections;

  // Find or plan collection
  const collectionName = options.collectionName ?? 'Design Tokens';
  const existingCollection = Object.values(existingCollections).find(c => c.name === collectionName);

  const changes: FigmaVariableChanges = {
    variableCollections: [],
    variables: [],
    variableModeValues: [],
  };

  let collectionId = existingCollection?.id;
  let defaultModeId = existingCollection?.defaultModeId;
  let darkModeId: string | undefined;

  if (!existingCollection) {
    // Create new collection
    const tempId = `temp_collection_${Date.now()}`;
    changes.variableCollections!.push({
      action: 'CREATE',
      id: tempId,
      name: collectionName,
    });
    collectionId = tempId;
  } else {
    // Find dark mode
    const darkMode = existingCollection.modes.find(m =>
      m.name.toLowerCase() === 'dark'
    );
    darkModeId = darkMode?.modeId;
  }

  // Map tokens to variables
  for (const token of options.tokens) {
    const figmaName = token.path.join('/');
    const existingVar = Object.values(existingVars).find(v => v.name === figmaName);

    const resolvedType = tokenTypeToFigmaType(token.$type);
    if (!resolvedType) continue;

    if (existingVar) {
      // Update existing
      changes.variables!.push({
        action: 'UPDATE',
        id: existingVar.id,
        description: token.$description,
      });

      if (defaultModeId) {
        changes.variableModeValues!.push({
          variableId: existingVar.id,
          modeId: defaultModeId,
          value: tokenValueToFigma(token),
        });
      }
    } else {
      // Create new
      const tempVarId = `temp_var_${token.path.join('_')}`;
      changes.variables!.push({
        action: 'CREATE',
        id: tempVarId,
        name: figmaName,
        variableCollectionId: collectionId,
        resolvedType,
        description: token.$description,
      });
    }
  }

  // Push dark mode values
  if (options.darkTokens && darkModeId) {
    for (const token of options.darkTokens) {
      const figmaName = token.path.join('/');
      const existingVar = Object.values(existingVars).find(v => v.name === figmaName);

      if (existingVar) {
        changes.variableModeValues!.push({
          variableId: existingVar.id,
          modeId: darkModeId,
          value: tokenValueToFigma(token),
        });
      }
    }
  }

  await client.postVariables(options.fileKey, changes);
}

export function mapTokensToFigma(tokens: ResolvedToken[]): FigmaVariableChanges {
  const changes: FigmaVariableChanges = {
    variables: [],
    variableModeValues: [],
  };

  for (const token of tokens) {
    const resolvedType = tokenTypeToFigmaType(token.$type);
    if (!resolvedType) continue;

    changes.variables!.push({
      action: 'CREATE',
      name: token.path.join('/'),
      resolvedType,
      description: token.$description,
    });
  }

  return changes;
}

function tokenTypeToFigmaType(type: string): string | null {
  switch (type) {
    case 'color': return 'COLOR';
    case 'dimension':
    case 'number':
    case 'fontWeight':
    case 'duration': return 'FLOAT';
    case 'fontFamily': return 'STRING';
    default: return null;
  }
}

function tokenValueToFigma(token: ResolvedToken): FigmaVariableValue {
  const value = token.$value;
  switch (value.type) {
    case 'color':
      return {
        r: value.r / 255,
        g: value.g / 255,
        b: value.b / 255,
        a: value.a,
      } satisfies FigmaColor;
    case 'dimension':
      return value.value;
    case 'number':
      return value.value;
    case 'fontWeight':
      return value.value;
    case 'fontFamily':
      return value.value.join(', ');
    default:
      return 0;
  }
}
