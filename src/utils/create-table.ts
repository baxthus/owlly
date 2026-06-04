import { TableBlock } from '@slack/types';

export function createTableBlock(
  headers: string[],
  rows: Array<Record<string, string>>,
): TableBlock {
  return {
    type: 'table' as const,
    rows: [
      headers.map((header) => ({
        type: 'rich_text' as const,
        elements: [
          {
            type: 'rich_text_section' as const,
            elements: [{ type: 'text' as const, text: header, style: { bold: true } }],
          },
        ],
      })),
      ...rows.map((row) =>
        headers.map((header) => ({
          type: 'rich_text' as const,
          elements: [
            {
              type: 'rich_text_section' as const,
              elements: [{ type: 'text' as const, text: row[header] ?? 'N/A' }],
            },
          ],
        })),
      ),
    ],
  };
}
