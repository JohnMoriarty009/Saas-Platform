import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, BorderStyle, AlignmentType, ImageRun, Header, HorizontalPosition, VerticalPosition } from "docx";
import { CompanyConfig } from "../types";

/**
 * Parses simple Markdown logic similar to the Python implementation
 * and converts it into docx library nodes.
 */
export const generateDocx = async (
  markdown: string,
  imageBlob: Blob | null,
  userPrompt: string,
  userContext: string,
  config: CompanyConfig
): Promise<Blob> => {
  
  // 1. Prepare Header with Logo and Company Info
  const headerChildren: (Paragraph | Table)[] = [];
  
  // We use a table for the header layout (Info Left, Logo Right)
  const headerRows = [
    new TableRow({
      children: [
        // Left: Company Info
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: config.name, bold: true, size: 28, color: "2C3E50" }),
                new TextRun({ text: "\n" + config.expertise, italics: true, size: 22 }),
                new TextRun({ text: "\n" + config.address + " | " + config.contact, size: 18, color: "555555" }),
              ],
            }),
          ],
        }),
        // Right: Logo (if exists)
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          children: config.logoDataUrl ? [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new ImageRun({
                  data: await (await fetch(config.logoDataUrl)).arrayBuffer(),
                  transformation: { width: 100, height: 100 }, // approximate max size
                }),
              ],
            })
          ] : [new Paragraph("")],
        }),
      ],
    }),
  ];

  headerChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: headerRows,
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } }
    })
  );

  headerChildren.push(new Paragraph({ text: "__________________________________________________", alignment: AlignmentType.CENTER, spacing: { after: 400 } }));

  // 2. Main Content
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      text: "Rapport d'Analyse Technique",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // Section 1: Context & Objectives
  children.push(new Paragraph({ text: "1. Contexte & Objectifs", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }));
  
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: "CONTEXTE :", bold: true })] }),
                new Paragraph({ text: userContext }),
                new Paragraph({ text: "" }),
                new Paragraph({ children: [new TextRun({ text: "DEMANDE :", bold: true })] }),
                new Paragraph({ text: userPrompt }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          ]
        })
      ]
    })
  );

  // Section 2: Analyzed Plan
  if (imageBlob) {
    children.push(new Paragraph({ text: "2. Plan Analysé", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
    const imageBuffer = await imageBlob.arrayBuffer();
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: imageBuffer,
            transformation: { width: 500, height: 350 }, // Standard fitting size
          }),
        ],
      })
    );
  }

  // Section 3: AI Analysis (Parsing Markdown)
  children.push(new Paragraph({ text: "3. Expertise IA", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
  
  const lines = markdown.split('\n');
  let tableBuffer: string[] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table detection logic similar to Python script
    if (line.startsWith('|')) {
      tableBuffer.push(line);
      inTable = true;
      continue;
    } else {
      if (inTable) {
        children.push(processTable(tableBuffer));
        tableBuffer = [];
        inTable = false;
      }
    }

    if (!line) {
       children.push(new Paragraph("")); // Empty line
       continue;
    }

    if (line.startsWith('### ')) {
      children.push(new Paragraph({ text: line.substring(4), heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }));
    } else if (line.startsWith('# ')) {
      children.push(new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1, spacing: { before: 400 } }));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      children.push(new Paragraph({ text: line.substring(2), bullet: { level: 0 } }));
    } else {
      // Bold text handling **text**
      const parts = line.split("**");
      const runs = parts.map((part, index) => new TextRun({ text: part, bold: index % 2 === 1 }));
      children.push(new Paragraph({ children: runs }));
    }
  }

  // Flush remaining table if exists
  if (inTable) {
    children.push(processTable(tableBuffer));
  }

  // Generate Document
  const doc = new Document({
    sections: [{
      headers: {
        default: new Header({
          children: headerChildren,
        }),
      },
      properties: {},
      children: children,
    }],
  });

  return await Packer.toBlob(doc);
};

// Helper to convert array of markdown table strings to Docx Table
const processTable = (lines: string[]): Table => {
  // Filter separators like |---|---|
  const dataRows = lines.filter(l => !l.includes('---'));
  
  const rows = dataRows.map((line, rowIndex) => {
    // Remove outer pipes and split
    const cells = line.split('|').filter(c => c.trim() !== "").map(c => c.trim());
    
    return new TableRow({
      children: cells.map(cellText => {
        return new TableCell({
          children: [new Paragraph({ text: cellText, alignment: AlignmentType.LEFT })],
          shading: rowIndex === 0 ? { fill: "E0E0E0" } : undefined, // Header shading
          width: { size: 100 / cells.length, type: WidthType.PERCENTAGE }
        });
      })
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows,
    borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    }
  });
};
