declare module 'papaparse' {
  export interface ParseConfig {
    header?: boolean;
    dynamicTyping?: boolean;
    skipEmptyLines?: boolean | 'greedy';
    preview?: number;
    complete?: (results: ParseResult) => void;
    error?: (error: Error) => void;
    [key: string]: unknown;
  }

  export interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    fields?: string[];
    truncated: boolean;
    cursor: number;
  }

  export interface ParseResult {
    data: Record<string, string>[];
    errors: Array<{
      type: string;
      code: string;
      message: string;
      row: number;
    }>;
    meta: ParseMeta;
  }

  export function parse(input: unknown, config?: ParseConfig): ParseResult;
  export function unparse(data: unknown, config?: unknown): string;

  const papa: {
    parse: typeof parse;
    unparse: typeof unparse;
  };

  export default papa;
}
