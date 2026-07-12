// Initial mock data — ported verbatim from Store PP26.dc.html so the built app
// opens with the exact same content the prototype shipped with.

export function todayStr() {
  return '07/07/2026';
}

export function nowStr() {
  return '07/07/2026 ' + '10:0' + Math.floor(Math.random() * 9) + ' น.';
}

let uid = 1000;
export function genId(prefix) {
  uid += 1;
  return prefix + uid;
}

export function buildInitialState() {
  return {
    role: 'staff',
    page: 'dashboard',

    staff: [
      { id: 's1', name: 'นายสมชาย ใจดี', phone: '081-234-5601', position: 'ช่างโครงสร้าง', photo: '' },
      { id: 's2', name: 'นายวิชัย รุ่งเรือง', phone: '081-234-5602', position: 'ช่างไฟฟ้า', photo: '' },
      { id: 's3', name: 'นายกิตติ ทองดี', phone: '081-234-5603', position: 'โฟร์แมน', photo: '' },
      { id: 's4', name: 'นายประยุทธ มั่นคง', phone: '081-234-5604', position: 'ช่างเชื่อม', photo: '' },
      { id: 's5', name: 'นายสมพงษ์ แข็งแรง', phone: '081-234-5605', position: 'ช่างทั่วไป', photo: '' },
      { id: 's6', name: 'นายอานันท์ พูลสวัสดิ์', phone: '081-234-5606', position: 'ช่างเหล็กเสริม', photo: '' },
    ],

    consumables: [
      { id: 'c1', code: 'CN-001', category: 'ความปลอดภัย', name: 'ถุงมือช่าง', unit: 'คู่', qty: 12, threshold: 20, photo: '' },
      { id: 'c2', code: 'CN-002', category: 'ความปลอดภัย', name: 'แว่นตานิรภัย', unit: 'อัน', qty: 30, threshold: 25, photo: '' },
      { id: 'c3', code: 'CN-003', category: 'ความปลอดภัย', name: 'หมวกนิรภัย', unit: 'ใบ', qty: 18, threshold: 15, photo: '' },
      { id: 'c4', code: 'CN-004', category: 'ไฟฟ้า', name: 'เทปพันสายไฟ', unit: 'ม้วน', qty: 45, threshold: 15, photo: '' },
      { id: 'c5', code: 'CN-005', category: 'ไฟฟ้า', name: 'สายไฟ THW 2.5', unit: 'เมตร', qty: 8, threshold: 30, photo: '' },
      { id: 'c6', code: 'CN-006', category: 'งานเชื่อม', name: 'ลวดเชื่อม E6013', unit: 'กก.', qty: 40, threshold: 20, photo: '' },
      { id: 'c7', code: 'CN-007', category: 'งานเชื่อม', name: 'หน้ากากเชื่อม', unit: 'อัน', qty: 4, threshold: 5, photo: '' },
      { id: 'c8', code: 'CN-008', category: 'เคมีภัณฑ์', name: 'สเปรย์กันสนิม', unit: 'กระป๋อง', qty: 22, threshold: 8, photo: '' },
      { id: 'c9', code: 'CN-009', category: 'เคมีภัณฑ์', name: 'น้ำมันหล่อลื่น', unit: 'แกลลอน', qty: 6, threshold: 10, photo: '' },
      { id: 'c10', code: 'CN-010', category: 'งานคอนกรีต', name: 'น็อตยึด M8', unit: 'ตัว', qty: 150, threshold: 50, photo: '' },
      { id: 'c11', code: 'CN-011', category: 'งานคอนกรีต', name: 'ผ้าใบคลุมงาน', unit: 'ผืน', qty: 5, threshold: 10, photo: '' },
      { id: 'c12', code: 'CN-012', category: 'งานคอนกรีต', name: 'ลูกปูนหนุนเหล็ก', unit: 'ถุง', qty: 12, threshold: 20, photo: '' },
      { id: 'c13', code: 'CN-013', category: 'เหล็กเส้น', name: 'เหล็กเส้น DB12', unit: 'เส้น', qty: 220, threshold: 100, photo: '' },
      { id: 'c14', code: 'CN-014', category: 'เหล็กเส้น', name: 'เหล็กเส้น DB16', unit: 'เส้น', qty: 95, threshold: 100, photo: '' },
      { id: 'c15', code: 'CN-015', category: 'เหล็กเส้น', name: 'เหล็กเส้น DB20', unit: 'เส้น', qty: 60, threshold: 80, photo: '' },
      { id: 'c16', code: 'CN-016', category: 'เหล็กเส้น', name: 'เหล็กเส้น DB32', unit: 'เส้น', qty: 15, threshold: 40, photo: '' },
    ],

    assets: [
      { id: 'a1', code: 'SCD-001', category: 'สกัด', name: 'Hilti TE1000', status: 'in_use', holderStaffId: 's1', site: 'Base Slab', costCode: 'CC-001', date: '01/07/2026', photo: '' },
      { id: 'a2', code: 'SCD-002', category: 'สกัด', name: 'Hilti TE1000', status: 'available', holderStaffId: null, site: 'สโตร์กลาง', costCode: null, date: null, photo: '' },
      { id: 'a3', code: 'SCD-003', category: 'สกัด', name: 'Bosch GSH11', status: 'repair', holderStaffId: null, site: 'ศูนย์ซ่อม', costCode: null, date: '28/06/2026', photo: '' },
      { id: 'a4', code: 'SCD-004', category: 'สกัด', name: 'Hilti TE1000', status: 'available', holderStaffId: null, site: 'สโตร์กลาง', costCode: null, date: null, photo: '' },
      { id: 'a5', code: 'DRL-010', category: 'สว่าน', name: 'Makita โรตารี่', status: 'in_use', holderStaffId: 's2', site: 'Tower A ชั้น 5', costCode: 'CC-014', date: '03/07/2026', photo: '' },
      { id: 'a6', code: 'DRL-011', category: 'สว่าน', name: 'Makita โรตารี่', status: 'damaged', holderStaffId: null, site: 'สโตร์', costCode: null, date: '20/06/2026', photo: '' },
      { id: 'a7', code: 'DRL-012', category: 'สว่าน', name: 'Bosch กระแทก', status: 'available', holderStaffId: null, site: 'สโตร์กลาง', costCode: null, date: null, photo: '' },
      { id: 'a8', code: 'WLD-005', category: 'เครื่องเชื่อมไฟฟ้า', name: 'Lincoln 300A', status: 'lost', holderStaffId: 's4', site: 'Site B', costCode: 'CC-009', date: '15/06/2026', photo: '' },
      { id: 'a9', code: 'WLD-006', category: 'เครื่องเชื่อมไฟฟ้า', name: 'Lincoln 300A', status: 'available', holderStaffId: null, site: 'สโตร์กลาง', costCode: null, date: null, photo: '' },
      { id: 'a10', code: 'WLD-007', category: 'เครื่องเชื่อมไฟฟ้า', name: 'Miller 250A', status: 'in_use', holderStaffId: 's6', site: 'Steel Bay', costCode: 'CC-018', date: '06/07/2026', photo: '' },
      { id: 'a11', code: 'CMP-002', category: 'ปั๊มลม', name: 'Hitachi 2HP', status: 'in_use', holderStaffId: 's3', site: 'Column C3', costCode: 'CC-002', date: '04/07/2026', photo: '' },
      { id: 'a12', code: 'PMP-001', category: 'ปั๊มน้ำ', name: 'Mitsubishi 1HP', status: 'available', holderStaffId: null, site: 'สโตร์กลาง', costCode: null, date: null, photo: '' },
      { id: 'a13', code: 'PMP-002', category: 'ปั๊มน้ำ', name: 'Tsurumi จุ่มน้ำ', status: 'in_use', holderStaffId: 's5', site: 'Site B บ่อพัก', costCode: 'CC-030', date: '05/07/2026', photo: '' },
    ],

    pending: [
      {
        id: 'p1', kind: 'borrow', staffId: 's5', job: 'Tower B ชั้น 2', costCode: 'CC-021', photo: '', date: nowStr(),
        lines: [{ refType: 'asset', refId: 'a2', qty: 1 }],
      },
    ],

    transactions: [
      { date: '01/07/2026', person: 'นายสมชาย ใจดี', action: 'เบิก', item: 'SCD-001 Hilti TE1000', job: 'Base Slab', costCode: 'CC-001' },
      { date: '03/07/2026', person: 'นายวิชัย รุ่งเรือง', action: 'เบิก', item: 'DRL-010 Makita โรตารี่', job: 'Tower A ชั้น 5', costCode: 'CC-014' },
      { date: '28/06/2026', person: 'ผู้ดูแลสโตร์', action: 'ส่งซ่อม', item: 'SCD-003 Bosch GSH11', job: '-', costCode: '-' },
      { date: '15/06/2026', person: 'นายประยุทธ มั่นคง', action: 'เบิก', item: 'WLD-005 Lincoln 300A', job: 'Site B', costCode: 'CC-009' },
      { date: '25/06/2026', person: 'นายสมชาย ใจดี', action: 'คืน', item: 'ถุงมือช่าง x5', job: '-', costCode: '-' },
      { date: '04/07/2026', person: 'นายกิตติ ทองดี', action: 'เบิก', item: 'CMP-002 Hitachi 2HP', job: 'Column C3', costCode: 'CC-002' },
      { date: '05/07/2026', person: 'นายวิชัย รุ่งเรือง', action: 'เบิก', item: 'เทปพันสายไฟ x10', job: 'Tower A ชั้น 5', costCode: 'CC-014' },
      { date: '05/07/2026', person: 'นายสมพงษ์ แข็งแรง', action: 'เบิก', item: 'PMP-002 Tsurumi จุ่มน้ำ', job: 'Site B บ่อพัก', costCode: 'CC-030' },
      { date: '06/07/2026', person: 'นายอานันท์ พูลสวัสดิ์', action: 'เบิก', item: 'WLD-007 Miller 250A', job: 'Steel Bay', costCode: 'CC-018' },
      { date: '06/07/2026', person: 'นายอานันท์ พูลสวัสดิ์', action: 'เบิก', item: 'เหล็กเส้น DB20 x40', job: 'Steel Bay', costCode: 'CC-018' },
    ],

    // --- goods receiving (รับของเข้า) ---
    receipts: [],
    rcDraftType: 'consumable',
    rcDraftConsumableId: '', rcDraftQty: 1,
    rcDraftAssetCategory: '', rcDraftAssetName: '', rcDraftAssetQty: 1,
    rcDate: '07/07/2026', rcNote: '', rcCart: [], rcPhoto: '',
    expandedReceiptId: null,

    reqStaffId: '', reqJob: '', reqCostCode: '', reqPhoto: '',
    reqDraftType: 'asset', reqDraftAssetId: '', reqDraftConsumableId: '', reqDraftQty: 1,
    reqCart: [],

    retDraftAssetId: '', retDraftCondition: 'ok', retDraftNote: '',
    retCart: [], retPhoto: '',

    trackerQuery: '', trackerFilter: 'all', selectedAssetId: null,

    reportPeriod: 'week', expandedReportDate: null,

    requisitions: [
      {
        id: 'rq1', docNo: '104-001', date: '05/07/2026', lines: [
          { id: 'l1', name: 'นั่งร้าน', category: 'นั่งร้าน', unit: 'ชุด', qtyRequested: 20 },
          { id: 'l2', name: 'เหล็กเส้น DB12', category: 'เหล็กเส้น', unit: 'เส้น', qtyRequested: 100 },
        ],
      },
    ],
    deliveries: [
      { id: 'd1', reqId: 'rq1', lineId: 'l1', qty: 12, date: '06/07/2026', photo: '' },
      { id: 'd2', reqId: 'rq1', lineId: 'l2', qty: 100, date: '06/07/2026', photo: '' },
    ],
    scrapReturns: [
      { id: 'sr1', date: '04/07/2026', photo: '', note: 'เศษเหล็กจาก Column C3', status: 'awaiting_slip', slipNo: '', slipDate: '' },
    ],
    newReqDocNo: '', newReqDate: '07/07/2026', newReqLines: [],
    newReqLineName: '', newReqLineCategory: '', newReqLineUnit: '', newReqLineQty: 1,
    deliveryFormReqId: '', deliveryFormLineId: '', deliveryDraftQty: 1, deliveryDraftPhoto: '',
    scrapDraftPhoto: '', scrapDraftNote: '', editingScrapIds: [],

    adminTab: 'requests',
    editingConsumableIds: [], editingAssetIds: [], editingStaffIds: [],
    newConsumableCode: '', newConsumableName: '', newConsumableCategory: '', newConsumableUnit: '', newConsumableQty: 0, newConsumableThreshold: 0,
    newAssetCode: '', newAssetCategory: '', newAssetName: '',
    newStaffName: '', newStaffPhone: '', newStaffPosition: '',
  };
}

// The subset of state that represents real data (vs. transient UI/form state).
// Only these keys are persisted to localStorage / synced to the sheet.
export const DATA_KEYS = [
  'staff',
  'consumables',
  'assets',
  'pending',
  'transactions',
  'requisitions',
  'deliveries',
  'scrapReturns',
  'receipts',
];
