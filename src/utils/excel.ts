import * as XLSX from 'xlsx';

export interface RempafourRow {
  refLM: number | string;
  nouveauPrixAchat: number;
  conditionnement: number;
  codeBarreGtin: string;
  foucom: number | string;
  dateApplication: string;
  listeMagasins: number | string;
}

const SAMPLE_DATA: RempafourRow[] = [
  { refLM: 665700, nouveauPrixAchat: 6.37, conditionnement: 360, codeBarreGtin: '8413246190084', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 10151680, nouveauPrixAchat: 4.10, conditionnement: 576, codeBarreGtin: '3260821702041', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 10611013, nouveauPrixAchat: 50.18, conditionnement: 150, codeBarreGtin: '8413246191203', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 10611076, nouveauPrixAchat: 50.18, conditionnement: 150, codeBarreGtin: '8413246191210', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 11894022, nouveauPrixAchat: 4.11, conditionnement: 576, codeBarreGtin: '3260821701044', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12007142, nouveauPrixAchat: 6.37, conditionnement: 360, codeBarreGtin: '8413246191395', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12007163, nouveauPrixAchat: 9.20, conditionnement: 360, codeBarreGtin: '8413246191432', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12158573, nouveauPrixAchat: 10.48, conditionnement: 144, codeBarreGtin: '8413246080989', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12158594, nouveauPrixAchat: 10.93, conditionnement: 96, codeBarreGtin: '8413246080620', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12158622, nouveauPrixAchat: 10.48, conditionnement: 144, codeBarreGtin: '8413246080569', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12164775, nouveauPrixAchat: 9.84, conditionnement: 144, codeBarreGtin: '8413246011877', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12750794, nouveauPrixAchat: 6.94, conditionnement: 192, codeBarreGtin: '8413246081139', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12757913, nouveauPrixAchat: 5.76, conditionnement: 216, codeBarreGtin: '8413246100526', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12757955, nouveauPrixAchat: 6.22, conditionnement: 480, codeBarreGtin: '3260821700153', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12757962, nouveauPrixAchat: 7.76, conditionnement: 400, codeBarreGtin: '3260821700207', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 12948173, nouveauPrixAchat: 20.19, conditionnement: 60, codeBarreGtin: '8413246151641', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 13625255, nouveauPrixAchat: 6.54, conditionnement: 64, codeBarreGtin: '3260821408097', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 16640484, nouveauPrixAchat: 34.55, conditionnement: 144, codeBarreGtin: '8413246017459', foucom: 207942, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 13790966, nouveauPrixAchat: 19.16, conditionnement: 72, codeBarreGtin: '3351841261240', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 15656410, nouveauPrixAchat: 14.40, conditionnement: 60, codeBarreGtin: '3351840437738', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 15656424, nouveauPrixAchat: 18.30, conditionnement: 36, codeBarreGtin: '3351840437745', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 17369954, nouveauPrixAchat: 1.84, conditionnement: 1170, codeBarreGtin: '8424019662561', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 17370080, nouveauPrixAchat: 3.65, conditionnement: 504, codeBarreGtin: '8424019662578', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 17370143, nouveauPrixAchat: 4.48, conditionnement: 504, codeBarreGtin: '8424019662585', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 17370171, nouveauPrixAchat: 6.92, conditionnement: 396, codeBarreGtin: '8424019662592', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 17370213, nouveauPrixAchat: 8.19, conditionnement: 288, codeBarreGtin: '8424019662608', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 17370423, nouveauPrixAchat: 9.92, conditionnement: 288, codeBarreGtin: '8424019662707', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 17370444, nouveauPrixAchat: 11.40, conditionnement: 288, codeBarreGtin: '8424019662714', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
  { refLM: 17440416, nouveauPrixAchat: 5.87, conditionnement: 320, codeBarreGtin: '6943237157014', foucom: 200089, dateApplication: '02/06/2026', listeMagasins: 474 },
];

export function downloadRempafourTemplate() {
  const headers = [
    'Ref LM',
    'Nouveau Prix Achat',
    'Conditionnement',
    'Code barre / GTIN',
    'FOUCOM',
    "Date d'application",
    'Liste des mag',
  ];

  const rows = SAMPLE_DATA.map(r => [
    r.refLM,
    r.nouveauPrixAchat,
    r.conditionnement,
    r.codeBarreGtin,
    r.foucom,
    r.dateApplication,
    r.listeMagasins,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  ws['!cols'] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'REMPAFOUR');

  XLSX.writeFile(wb, 'REMPAFOUR_template.xlsx');
}

export async function parseRempafourFile(file: File): Promise<RempafourRow[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<any>(sheet);

  return json.map(row => ({
    refLM: row['Ref LM'] || '',
    nouveauPrixAchat: parseFloat(row['Nouveau Prix Achat']) || 0,
    conditionnement: parseInt(row['Conditionnement']) || 0,
    codeBarreGtin: String(row['Code barre / GTIN'] || ''),
    foucom: row['FOUCOM'] || '',
    dateApplication: String(row["Date d'application"] || ''),
    listeMagasins: row['Liste des mag'] || '',
  }));
}
