import { ofetch } from 'ofetch';

const FIGMA_API_BASE = 'https://api.figma.com';

export interface FigmaClientOptions {
  personalAccessToken?: string;
  oauthToken?: string;
}

export class FigmaClient {
  private headers: Record<string, string>;

  constructor(options: FigmaClientOptions) {
    if (options.personalAccessToken) {
      this.headers = { 'X-Figma-Token': options.personalAccessToken };
    } else if (options.oauthToken) {
      this.headers = { 'Authorization': `Bearer ${options.oauthToken}` };
    } else {
      throw new Error('Either personalAccessToken or oauthToken must be provided');
    }
  }

  async getFileVariables(fileKey: string): Promise<FigmaVariablesResponse> {
    return ofetch(`${FIGMA_API_BASE}/v1/files/${fileKey}/variables/local`, {
      headers: this.headers,
    });
  }

  async getFileVariableCollections(fileKey: string): Promise<FigmaVariableCollectionsResponse> {
    return ofetch(`${FIGMA_API_BASE}/v1/files/${fileKey}/variables/local`, {
      headers: this.headers,
    });
  }

  async postVariables(fileKey: string, changes: FigmaVariableChanges): Promise<void> {
    await ofetch(`${FIGMA_API_BASE}/v1/files/${fileKey}/variables`, {
      method: 'POST',
      headers: {
        ...this.headers,
        'Content-Type': 'application/json',
      },
      body: changes,
    });
  }

  async getFile(fileKey: string): Promise<unknown> {
    return ofetch(`${FIGMA_API_BASE}/v1/files/${fileKey}`, {
      headers: this.headers,
    });
  }
}

// Figma API types
export interface FigmaVariablesResponse {
  status: number;
  error: boolean;
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, FigmaVariableCollection>;
  };
}

export interface FigmaVariableCollectionsResponse {
  status: number;
  meta: {
    variableCollections: Record<string, FigmaVariableCollection>;
  };
}

export interface FigmaVariable {
  id: string;
  name: string;
  key: string;
  variableCollectionId: string;
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR';
  valuesByMode: Record<string, FigmaVariableValue>;
  remote: boolean;
  description: string;
  hiddenFromPublishing: boolean;
  scopes: string[];
  codeSyntax: Record<string, string>;
}

export interface FigmaVariableCollection {
  id: string;
  name: string;
  key: string;
  modes: FigmaMode[];
  defaultModeId: string;
  remote: boolean;
  hiddenFromPublishing: boolean;
}

export interface FigmaMode {
  modeId: string;
  name: string;
}

export type FigmaVariableValue =
  | boolean
  | number
  | string
  | FigmaColor
  | FigmaVariableAlias;

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVariableAlias {
  type: 'VARIABLE_ALIAS';
  id: string;
}

export interface FigmaVariableChanges {
  variableCollections?: Array<{
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    id?: string;
    name?: string;
    initialModeId?: string;
  }>;
  variableModes?: Array<{
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    id?: string;
    name?: string;
    variableCollectionId: string;
  }>;
  variables?: Array<{
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    id?: string;
    name?: string;
    variableCollectionId?: string;
    resolvedType?: string;
    description?: string;
    codeSyntax?: Record<string, string>;
  }>;
  variableModeValues?: Array<{
    variableId: string;
    modeId: string;
    value: FigmaVariableValue;
  }>;
}
