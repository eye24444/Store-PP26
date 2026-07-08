import { useCallback, useEffect, useRef, useState } from 'react';
import { STATUS_META, COND_COLORS, COND_LABELS } from './theme.js';
import { buildInitialState, genId, todayStr, nowStr } from './seed.js';
import { loadData, saveData } from './storage.js';

// Central store. Mirrors the DCLogic class from Store PP26.dc.html:
// - `state` holds everything
// - action methods mutate via setState (object or updater form supported)
// - deriveVals() reproduces renderVals() so the UI reads the same value bag
export function useStore() {
  const [state, setState] = useState(() => {
    const base = buildInitialState();
    const saved = loadData();
    return saved ? { ...base, ...saved } : base;
  });

  // setState supporting both object and updater-function forms, like React
  // class setState (which the prototype relied on).
  const set = useCallback((patch) => {
    setState((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : patch;
      return { ...prev, ...next };
    });
  }, []);

  const toastTimer = useRef(null);
  const showToast = useCallback((msg) => {
    set({ toast: msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => set({ toast: null }), 2600);
  }, [set]);

  // Persist data keys to localStorage on every change.
  useEffect(() => {
    saveData(state);
  }, [state]);

  const api = buildActions(state, set, showToast);
  const vals = deriveVals(state, api, set);
  return { state, set, vals, showToast };
}

// ---- action methods (ported 1:1 from the prototype class) ----
function buildActions(state, setState, showToast) {
  const s = state;

  const handlePhoto = (e, field) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setState({ [field]: reader.result || '' });
    reader.readAsDataURL(file);
  };
  const handleItemPhoto = (e, listKey, id) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setState((st) => ({ [listKey]: st[listKey].map((x) => (x.id === id ? { ...x, photo: reader.result || '' } : x)) }));
    reader.readAsDataURL(file);
  };

  const setRole = (role) =>
    setState((st) => ({ role, page: role === 'staff' && st.page === 'admin' ? 'dashboard' : st.page }));
  const setPage = (page) => setState({ page });

  const addReqLine = () => {
    if (s.reqDraftType === 'asset') {
      if (!s.reqDraftAssetId) return;
      if (s.reqCart.some((l) => l.refType === 'asset' && l.refId === s.reqDraftAssetId)) {
        showToast('เพิ่มรายการนี้แล้ว');
        return;
      }
      setState({ reqCart: [...s.reqCart, { refType: 'asset', refId: s.reqDraftAssetId, qty: 1 }], reqDraftAssetId: '' });
    } else {
      if (!s.reqDraftConsumableId) return;
      if (s.reqCart.some((l) => l.refType === 'consumable' && l.refId === s.reqDraftConsumableId)) {
        showToast('เพิ่มรายการนี้แล้ว');
        return;
      }
      setState({
        reqCart: [...s.reqCart, { refType: 'consumable', refId: s.reqDraftConsumableId, qty: Number(s.reqDraftQty) || 1 }],
        reqDraftConsumableId: '',
        reqDraftQty: 1,
      });
    }
  };
  const removeReqLine = (idx) => setState((st) => ({ reqCart: st.reqCart.filter((_, i) => i !== idx) }));

  const submitRequest = () => {
    if (!s.reqCart.length) return;
    const pendingItem = { id: genId('p'), kind: 'borrow', staffId: s.reqStaffId, job: s.reqJob, costCode: s.reqCostCode, photo: s.reqPhoto, date: nowStr(), lines: s.reqCart };
    setState({ pending: [...s.pending, pendingItem], reqCart: [], reqStaffId: '', reqJob: '', reqCostCode: '', reqPhoto: '' });
    showToast('ส่งคำขอเบิกแล้ว รอผู้ดูแลสโตร์อนุมัติ');
  };

  const addRetLine = () => {
    if (!s.retDraftAssetId) return;
    if (s.retCart.some((l) => l.assetId === s.retDraftAssetId)) {
      showToast('เพิ่มรายการนี้แล้ว');
      return;
    }
    setState({ retCart: [...s.retCart, { assetId: s.retDraftAssetId, condition: s.retDraftCondition, note: s.retDraftNote }], retDraftAssetId: '', retDraftNote: '' });
  };
  const removeRetLine = (idx) => setState((st) => ({ retCart: st.retCart.filter((_, i) => i !== idx) }));

  const submitReturn = () => {
    if (!s.retCart.length) return;
    const first = s.assets.find((a) => a.id === s.retCart[0].assetId);
    const pendingItem = { id: genId('p'), kind: 'return', staffId: first ? first.holderStaffId : null, job: first ? first.site : '', costCode: first ? first.costCode || '-' : '-', photo: s.retPhoto, date: nowStr(), lines: s.retCart };
    setState({ pending: [...s.pending, pendingItem], retCart: [], retPhoto: '' });
    showToast('ส่งคำขอคืนของแล้ว รอผู้ดูแลสโตร์ยืนยัน');
  };

  const approvePending = (id) => {
    const p = s.pending.find((x) => x.id === id);
    if (!p) return;
    let assets = s.assets, consumables = s.consumables;
    const staffName = (sid) => {
      const st = s.staff.find((x) => x.id === sid);
      return st ? st.name : sid || 'ไม่ระบุ';
    };
    const newTx = [];

    if (p.kind === 'borrow') {
      const requesterName = staffName(p.staffId);
      p.lines.forEach((line) => {
        if (line.refType === 'asset') {
          const a = assets.find((x) => x.id === line.refId);
          const label = a ? a.code + ' ' + a.name : '';
          assets = assets.map((x) => (x.id === line.refId ? { ...x, status: 'in_use', holderStaffId: p.staffId, site: p.job, costCode: p.costCode, date: todayStr() } : x));
          newTx.push({ date: todayStr(), person: requesterName, action: 'เบิก', item: label, job: p.job, costCode: p.costCode });
        } else {
          const c = consumables.find((x) => x.id === line.refId);
          const label = c ? c.name + ' x' + line.qty : '';
          consumables = consumables.map((x) => (x.id === line.refId ? { ...x, qty: Math.max(0, x.qty - line.qty) } : x));
          newTx.push({ date: todayStr(), person: requesterName, action: 'เบิก', item: label, job: p.job, costCode: p.costCode });
        }
      });
    } else {
      p.lines.forEach((line) => {
        const a = assets.find((x) => x.id === line.assetId);
        if (!a) return;
        const label = a.code + ' ' + a.name;
        const personName = staffName(a.holderStaffId);
        const newStatus = line.condition === 'ok' ? 'available' : line.condition === 'repair' ? 'repair' : 'damaged';
        assets = assets.map((x) => (x.id === line.assetId ? { ...x, status: newStatus, holderStaffId: null, site: newStatus === 'available' ? 'สโตร์กลาง' : 'ศูนย์ซ่อม', costCode: null, date: null } : x));
        newTx.push({ date: todayStr(), person: personName, action: 'คืน', item: label, job: '-', costCode: '-' });
      });
    }

    setState({ assets, consumables, pending: s.pending.filter((x) => x.id !== id), transactions: [...newTx, ...s.transactions] });
    showToast('อนุมัติคำขอแล้ว');
  };
  const rejectPending = (id) => {
    setState((st) => ({ pending: st.pending.filter((x) => x.id !== id) }));
    showToast('ปฏิเสธคำขอแล้ว');
  };

  const adjustConsumable = (id, delta) => setState((st) => ({ consumables: st.consumables.map((c) => (c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c)) }));
  const toggleEditConsumable = (id) => setState((st) => ({ editingConsumableIds: st.editingConsumableIds.includes(id) ? st.editingConsumableIds.filter((x) => x !== id) : [...st.editingConsumableIds, id] }));
  const updateConsumableField = (id, field, value) => setState((st) => ({ consumables: st.consumables.map((c) => (c.id === id ? { ...c, [field]: value } : c)) }));
  const deleteConsumable = (id) => {
    setState((st) => ({ consumables: st.consumables.filter((c) => c.id !== id) }));
    showToast('ลบรายการแล้ว');
  };
  const addConsumable = () => {
    if (!s.newConsumableName || !s.newConsumableUnit) return;
    setState({
      consumables: [...s.consumables, { id: genId('c'), code: s.newConsumableCode || genId('CN'), category: s.newConsumableCategory || 'ทั่วไป', name: s.newConsumableName, unit: s.newConsumableUnit, qty: Number(s.newConsumableQty) || 0, threshold: Number(s.newConsumableThreshold) || 0, photo: '' }],
      newConsumableCode: '', newConsumableName: '', newConsumableCategory: '', newConsumableUnit: '', newConsumableQty: 0, newConsumableThreshold: 0,
    });
    showToast('เพิ่มรายการวัสดุแล้ว');
  };

  const toggleEditAsset = (id) => setState((st) => ({ editingAssetIds: st.editingAssetIds.includes(id) ? st.editingAssetIds.filter((x) => x !== id) : [...st.editingAssetIds, id] }));
  const updateAssetField = (id, field, value) => setState((st) => ({ assets: st.assets.map((a) => (a.id === id ? { ...a, [field]: value } : a)) }));
  const deleteAsset = (id) => {
    setState((st) => ({ assets: st.assets.filter((a) => a.id !== id) }));
    showToast('ลบทรัพย์สินแล้ว');
  };
  const addAsset = () => {
    if (!s.newAssetCode || !s.newAssetName) return;
    setState({
      assets: [...s.assets, { id: genId('a'), code: s.newAssetCode, category: s.newAssetCategory || 'ทั่วไป', name: s.newAssetName, status: 'available', holderStaffId: null, site: 'สโตร์กลาง', costCode: null, date: null, photo: '' }],
      newAssetCode: '', newAssetCategory: '', newAssetName: '',
    });
    showToast('เพิ่มทรัพย์สินแล้ว');
  };

  const toggleEditStaff = (id) => setState((st) => ({ editingStaffIds: st.editingStaffIds.includes(id) ? st.editingStaffIds.filter((x) => x !== id) : [...st.editingStaffIds, id] }));
  const updateStaffField = (id, field, value) => setState((st) => ({ staff: st.staff.map((x) => (x.id === id ? { ...x, [field]: value } : x)) }));
  const deleteStaff = (id) => {
    setState((st) => ({ staff: st.staff.filter((x) => x.id !== id) }));
    showToast('ลบพนักงานแล้ว');
  };
  const addStaff = () => {
    if (!s.newStaffName) return;
    setState({ staff: [...s.staff, { id: genId('s'), name: s.newStaffName, phone: s.newStaffPhone, position: s.newStaffPosition, photo: '' }], newStaffName: '', newStaffPhone: '', newStaffPosition: '' });
    showToast('เพิ่มพนักงานแล้ว');
  };

  // --- central store: requisitions & delivery ---
  const addReqLineDraft = () => {
    if (!s.newReqLineName || !s.newReqLineUnit) return;
    setState({
      newReqLines: [...s.newReqLines, { id: genId('rl'), name: s.newReqLineName, category: s.newReqLineCategory || 'ทั่วไป', unit: s.newReqLineUnit, qtyRequested: Number(s.newReqLineQty) || 1 }],
      newReqLineName: '', newReqLineCategory: '', newReqLineUnit: '', newReqLineQty: 1,
    });
  };
  const removeReqLineDraft = (idx) => setState((st) => ({ newReqLines: st.newReqLines.filter((_, i) => i !== idx) }));
  const createRequisition = () => {
    if (!s.newReqDocNo || !s.newReqLines.length) return;
    setState({
      requisitions: [...s.requisitions, { id: genId('rq'), docNo: s.newReqDocNo, date: s.newReqDate || todayStr(), lines: s.newReqLines }],
      newReqDocNo: '', newReqDate: todayStr(), newReqLines: [],
    });
    showToast('สร้างใบขอใช้แล้ว');
  };
  const startRecordDelivery = (reqId, lineId) => setState({ deliveryFormReqId: reqId, deliveryFormLineId: lineId, deliveryDraftQty: 1, deliveryDraftPhoto: '' });
  const cancelRecordDelivery = () => setState({ deliveryFormReqId: '', deliveryFormLineId: '', deliveryDraftQty: 1, deliveryDraftPhoto: '' });
  const confirmRecordDelivery = () => {
    const rq = s.requisitions.find((x) => x.id === s.deliveryFormReqId);
    const line = rq && rq.lines.find((x) => x.id === s.deliveryFormLineId);
    const qty = Number(s.deliveryDraftQty) || 0;
    if (!rq || !line || qty <= 0) return;

    let consumables = s.consumables, assets = s.assets;
    const matchConsumable = consumables.find((c) => c.name === line.name);
    if (matchConsumable) {
      consumables = consumables.map((c) => (c.id === matchConsumable.id ? { ...c, qty: c.qty + qty } : c));
    } else {
      const newAssets = [];
      for (let i = 0; i < qty; i++) {
        newAssets.push({ id: genId('a'), code: genId((line.category || 'AST').slice(0, 3).toUpperCase() + '-'), category: line.category, name: line.name, status: 'available', holderStaffId: null, site: 'สโตร์กลาง', costCode: null, date: null, photo: '' });
      }
      assets = [...assets, ...newAssets];
    }

    const delivery = { id: genId('d'), reqId: rq.id, lineId: line.id, qty, date: todayStr(), photo: s.deliveryDraftPhoto };
    const tx = { date: todayStr(), person: 'ผู้ดูแลสโตร์', action: 'รับเข้า', item: line.name + ' x' + qty + ' (ใบขอใช้ ' + rq.docNo + ')', job: 'สโตร์กลาง', costCode: '-' };

    setState({ consumables, assets, deliveries: [...s.deliveries, delivery], transactions: [tx, ...s.transactions], deliveryFormReqId: '', deliveryFormLineId: '', deliveryDraftQty: 1, deliveryDraftPhoto: '' });
    showToast('บันทึกรับเข้าแล้ว');
  };

  const addScrapReturn = () => {
    if (!s.scrapDraftPhoto) return;
    const record = { id: genId('sr'), date: todayStr(), photo: s.scrapDraftPhoto, note: s.scrapDraftNote, status: 'awaiting_slip', slipNo: '', slipDate: '' };
    const tx = { date: todayStr(), person: 'ผู้ดูแลสโตร์', action: 'ส่งคืน', item: 'เศษเหล็ก (รอใบส่งคืน)', job: 'สโตร์กลาง', costCode: '-' };
    setState({ scrapReturns: [record, ...s.scrapReturns], transactions: [tx, ...s.transactions], scrapDraftPhoto: '', scrapDraftNote: '' });
    showToast('บันทึกส่งคืนเศษเหล็กแล้ว');
  };
  const toggleEditScrap = (id) => setState((st) => ({ editingScrapIds: st.editingScrapIds.includes(id) ? st.editingScrapIds.filter((x) => x !== id) : [...st.editingScrapIds, id] }));
  const updateScrapField = (id, field, value) => setState((st) => ({ scrapReturns: st.scrapReturns.map((x) => (x.id === id ? { ...x, [field]: value } : x)) }));
  const confirmScrapSlip = (id) => {
    setState((st) => ({ scrapReturns: st.scrapReturns.map((x) => (x.id === id ? { ...x, status: 'slip_received' } : x)), editingScrapIds: st.editingScrapIds.filter((x) => x !== id) }));
    showToast('บันทึกรับใบส่งคืนแล้ว');
  };

  return {
    handlePhoto, handleItemPhoto, setRole, setPage,
    addReqLine, removeReqLine, submitRequest,
    addRetLine, removeRetLine, submitReturn,
    approvePending, rejectPending,
    adjustConsumable, toggleEditConsumable, updateConsumableField, deleteConsumable, addConsumable,
    toggleEditAsset, updateAssetField, deleteAsset, addAsset,
    toggleEditStaff, updateStaffField, deleteStaff, addStaff,
    addReqLineDraft, removeReqLineDraft, createRequisition,
    startRecordDelivery, cancelRecordDelivery, confirmRecordDelivery,
    addScrapReturn, toggleEditScrap, updateScrapField, confirmScrapSlip,
  };
}

// ---- derived values (ported 1:1 from renderVals) ----
function deriveVals(s, api, setState) {
  const staffName = (sid) => {
    const st = s.staff.find((x) => x.id === sid);
    return st ? st.name : '—';
  };

  const assetsWithMeta = s.assets.map((a) => {
    const meta = STATUS_META[a.status];
    return {
      ...a,
      statusLabel: meta.label,
      statusColor: meta.color,
      holderName: a.holderStaffId ? staffName(a.holderStaffId) : '—',
      dateText: a.date || '—',
      siteText: a.site || '—',
      costCodeText: a.costCode || '—',
    };
  });

  const groupMap = {};
  assetsWithMeta.forEach((a) => {
    if (!groupMap[a.category]) groupMap[a.category] = { category: a.category, total: 0, available: 0, inUse: 0, repair: 0, damaged: 0, lost: 0, codes: [] };
    const g = groupMap[a.category];
    g.total++;
    g.codes.push(a.code);
    if (a.status === 'available') g.available++;
    if (a.status === 'in_use') g.inUse++;
    if (a.status === 'repair') g.repair++;
    if (a.status === 'damaged') g.damaged++;
    if (a.status === 'lost') g.lost++;
  });
  const assetGroups = Object.values(groupMap).map((g) => ({ ...g, codesText: g.codes.join(', ') }));

  const lowStockItems = s.consumables.filter((c) => c.qty <= c.threshold);

  const consumableCatMap = {};
  s.consumables.forEach((c) => {
    if (!consumableCatMap[c.category]) consumableCatMap[c.category] = [];
    const low = c.qty <= c.threshold;
    consumableCatMap[c.category].push({ ...c, badgeText: low ? 'ควรเบิกเติม' : 'ปกติ', badgeColor: low ? '#e0555f' : '#34c471', badgeBg: low ? 'rgba(224,85,95,0.15)' : 'rgba(52,196,113,0.15)' });
  });
  const consumableCategoryGroups = Object.keys(consumableCatMap).map((category) => ({ category, count: consumableCatMap[category].length, items: consumableCatMap[category] }));

  const q = s.trackerQuery.trim().toLowerCase();
  let filteredAssets = assetsWithMeta.filter((a) => {
    if (s.trackerFilter !== 'all' && a.status !== s.trackerFilter) return false;
    if (!q) return true;
    return (a.code + a.category + a.name + a.holderName + (a.site || '')).toLowerCase().includes(q);
  });
  filteredAssets = filteredAssets.map((a) => ({ ...a, onSelect: () => setState({ selectedAssetId: a.id }) }));
  const selectedAsset = assetsWithMeta.find((a) => a.id === s.selectedAssetId) || null;

  const availableAssetsForDraft = s.assets.filter((a) => a.status === 'available' && !s.reqCart.some((l) => l.refType === 'asset' && l.refId === a.id));
  const consumablesForDraft = s.consumables.filter((c) => c.qty > 0);
  const reqCartView = s.reqCart.map((line, idx) => {
    if (line.refType === 'asset') {
      const a = s.assets.find((x) => x.id === line.refId);
      return { key: 'asset-' + line.refId, label: a ? a.code + ' — ' + a.name : '', typeLabel: 'ทรัพย์สิน', qtyText: '1 ชิ้น', photo: a && a.photo, onRemove: () => api.removeReqLine(idx) };
    }
    const c = s.consumables.find((x) => x.id === line.refId);
    return { key: 'cons-' + line.refId, label: c ? c.name : '', typeLabel: 'ของสิ้นเปลือง', qtyText: line.qty + ' ' + (c ? c.unit : ''), photo: c && c.photo, onRemove: () => api.removeReqLine(idx) };
  });
  const reqAddDisabled = s.reqDraftType === 'asset' ? !s.reqDraftAssetId : !s.reqDraftConsumableId;
  const reqSubmitDisabled = !s.reqCart.length || !s.reqStaffId || !s.reqJob || !s.reqCostCode || !s.reqPhoto;

  const heldAssetsForDraft = assetsWithMeta.filter((a) => a.status === 'in_use' && !s.retCart.some((l) => l.assetId === a.id));
  const retCartView = s.retCart.map((line, idx) => {
    const a = assetsWithMeta.find((x) => x.id === line.assetId);
    return { key: line.assetId, label: a ? a.code + ' — ' + a.name : '', holderName: a ? a.holderName : '', photo: a && a.photo, condColor: COND_COLORS[line.condition], condLabel: COND_LABELS[line.condition], onRemove: () => api.removeRetLine(idx) };
  });
  const retAddDisabled = !s.retDraftAssetId;
  const retSubmitDisabled = !s.retCart.length || !s.retPhoto;

  const kindLabels = { borrow: 'คำขอเบิก', return: 'คำขอคืน' };
  const pendingView = s.pending.map((p) => {
    const lines = p.lines.map((line, i) => {
      if (p.kind === 'borrow') {
        if (line.refType === 'asset') {
          const a = s.assets.find((x) => x.id === line.refId);
          return { key: i, label: a ? a.code + ' ' + a.name : '', detail: 'ทรัพย์สิน' };
        }
        const c = s.consumables.find((x) => x.id === line.refId);
        return { key: i, label: c ? c.name : '', detail: 'x' + line.qty + ' ' + (c ? c.unit : '') };
      }
      const a = s.assets.find((x) => x.id === line.assetId);
      return { key: i, label: a ? a.code + ' ' + a.name : '', detail: COND_LABELS[line.condition] };
    });
    return {
      ...p,
      kindLabel: kindLabels[p.kind],
      staffName: staffName(p.staffId),
      lineCountText: p.lines.length + ' รายการ',
      hasPhoto: !!p.photo,
      lines,
      onApprove: () => api.approvePending(p.id),
      onReject: () => api.rejectPending(p.id),
    };
  });

  const consumablesView = s.consumables.map((c) => ({
    ...c,
    statusLabel: c.qty <= c.threshold ? 'ควรเบิกเติม' : 'ปกติ',
    statusColor: c.qty <= c.threshold ? '#e0555f' : '#34c471',
    editing: s.editingConsumableIds.includes(c.id),
    editLabel: s.editingConsumableIds.includes(c.id) ? 'เสร็จ' : 'แก้ไข',
    photoInputId: 'photo-c-' + c.id,
    onPhotoChange: (e) => api.handleItemPhoto(e, 'consumables', c.id),
    onNameChange: (e) => api.updateConsumableField(c.id, 'name', e.target.value),
    onCategoryChange: (e) => api.updateConsumableField(c.id, 'category', e.target.value),
    onQtyChange: (e) => api.updateConsumableField(c.id, 'qty', Number(e.target.value) || 0),
    onThresholdChange: (e) => api.updateConsumableField(c.id, 'threshold', Number(e.target.value) || 0),
    onDec: () => api.adjustConsumable(c.id, -5),
    onInc: () => api.adjustConsumable(c.id, 5),
    onToggleEdit: () => api.toggleEditConsumable(c.id),
    onDelete: () => api.deleteConsumable(c.id),
  }));

  const assetsAdminView = assetsWithMeta.map((a) => ({
    ...a,
    editing: s.editingAssetIds.includes(a.id),
    editLabel: s.editingAssetIds.includes(a.id) ? 'เสร็จ' : 'แก้ไข',
    holderSiteText: a.holderStaffId ? a.holderName + ' · ' + a.siteText : a.siteText,
    photoInputId: 'photo-a-' + a.id,
    onPhotoChange: (e) => api.handleItemPhoto(e, 'assets', a.id),
    onNameChange: (e) => api.updateAssetField(a.id, 'name', e.target.value),
    onCategoryChange: (e) => api.updateAssetField(a.id, 'category', e.target.value),
    onStatusChange: (e) => api.updateAssetField(a.id, 'status', e.target.value),
    onToggleEdit: () => api.toggleEditAsset(a.id),
    onDelete: () => api.deleteAsset(a.id),
  }));

  const staffView = s.staff.map((st) => ({
    ...st,
    editing: s.editingStaffIds.includes(st.id),
    editLabel: s.editingStaffIds.includes(st.id) ? 'เสร็จ' : 'แก้ไข',
    photoInputId: 'photo-s-' + st.id,
    onPhotoChange: (e) => api.handleItemPhoto(e, 'staff', st.id),
    onNameChange: (e) => api.updateStaffField(st.id, 'name', e.target.value),
    onPhoneChange: (e) => api.updateStaffField(st.id, 'phone', e.target.value),
    onPositionChange: (e) => api.updateStaffField(st.id, 'position', e.target.value),
    onToggleEdit: () => api.toggleEditStaff(st.id),
    onDelete: () => api.deleteStaff(st.id),
  }));

  const borrowTx = s.transactions.filter((t) => t.action === 'เบิก');
  const countBy = (arr, key) => {
    const m = {};
    arr.forEach((t) => { m[t[key]] = (m[t[key]] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  };
  const topPersons = countBy(borrowTx, 'person');
  const topJobs = countBy(borrowTx.filter((t) => t.job && t.job !== '-'), 'job');
  const actionColor = (action) => (action === 'เบิก' ? '#f5a623' : action === 'คืน' ? '#34c471' : '#4a90d9');
  const transactionsView = s.transactions.map((t, i) => ({ ...t, key: i, actionColor: actionColor(t.action) }));

  const dateGroupMap = {};
  s.transactions.forEach((t) => { if (!dateGroupMap[t.date]) dateGroupMap[t.date] = []; dateGroupMap[t.date].push(t); });
  const dailyGroups = Object.keys(dateGroupMap)
    .sort((a, b) => {
      const pa = a.split('/').reverse().join('');
      const pb = b.split('/').reverse().join('');
      return pb.localeCompare(pa);
    })
    .map((date) => {
      const items = dateGroupMap[date].map((t, i) => ({ ...t, key: i, actionColor: actionColor(t.action) }));
      const expanded = s.expandedReportDate === date;
      return {
        date, items, expanded, arrow: expanded ? '▲' : '▼',
        borrowCount: items.filter((t) => t.action === 'เบิก').length,
        returnCount: items.filter((t) => t.action === 'คืน').length,
        onToggle: () => setState({ expandedReportDate: expanded ? null : date }),
      };
    });

  const isAdminRole = s.role === 'admin';
  const pendingCount = s.pending.length;
  const navItems = [
    { key: 'dashboard', label: 'ภาพรวมสต็อก', active: s.page === 'dashboard', onClick: () => api.setPage('dashboard') },
    { key: 'request', label: 'เบิกของ', active: s.page === 'request', onClick: () => api.setPage('request') },
    { key: 'return', label: 'คืนของ', active: s.page === 'return', onClick: () => api.setPage('return') },
    { key: 'tracker', label: 'ติดตามทรัพย์สิน', active: s.page === 'tracker', onClick: () => api.setPage('tracker') },
    { key: 'reports', label: 'รายงานสรุป', active: s.page === 'reports', onClick: () => api.setPage('reports') },
    { key: 'central', label: 'รับเข้า/คืนสโตร์กลาง', active: s.page === 'central', onClick: () => api.setPage('central') },
  ];
  if (isAdminRole) navItems.push({ key: 'admin', label: 'ผู้ดูแลสโตร์', active: s.page === 'admin', onClick: () => api.setPage('admin'), hasBadge: pendingCount > 0, badgeText: pendingCount });

  const requisitionsView = s.requisitions.map((rq) => {
    const lines = rq.lines.map((ln) => {
      const received = s.deliveries.filter((d) => d.reqId === rq.id && d.lineId === ln.id).reduce((sum, d) => sum + d.qty, 0);
      const remaining = Math.max(0, ln.qtyRequested - received);
      const isDone = remaining <= 0;
      const isRecording = s.deliveryFormReqId === rq.id && s.deliveryFormLineId === ln.id;
      return { ...ln, received, remaining, isDone, remainColor: isDone ? '#34c471' : '#e0555f', isRecording, onStartRecord: () => api.startRecordDelivery(rq.id, ln.id), onConfirmRecord: () => api.confirmRecordDelivery() };
    });
    const allDone = lines.every((l) => l.isDone);
    const anyReceived = lines.some((l) => l.received > 0);
    const status = allDone ? 'ครบแล้ว' : anyReceived ? 'ได้รับบางส่วน' : 'รอรับของ';
    const statusColor = allDone ? '#34c471' : anyReceived ? '#f5a623' : '#8b94a3';
    return { ...rq, lines, status, statusColor };
  });

  const scrapReturnsView = s.scrapReturns.map((sr) => ({
    ...sr,
    statusLabel: sr.status === 'slip_received' ? 'ได้รับใบส่งคืนแล้ว' : 'รอใบส่งคืน',
    statusColor: sr.status === 'slip_received' ? '#34c471' : '#f5a623',
    isAwaiting: sr.status === 'awaiting_slip',
    isReceived: sr.status === 'slip_received',
    editing: s.editingScrapIds.includes(sr.id),
    onToggleEdit: () => api.toggleEditScrap(sr.id),
    onSlipNoChange: (e) => api.updateScrapField(sr.id, 'slipNo', e.target.value),
    onSlipDateChange: (e) => api.updateScrapField(sr.id, 'slipDate', e.target.value),
    onConfirmSlip: () => api.confirmScrapSlip(sr.id),
  }));

  const newConsumableDisabled = !s.newConsumableName || !s.newConsumableUnit;
  const newAssetDisabled = !s.newAssetCode || !s.newAssetName;
  const newStaffDisabled = !s.newStaffName;

  return {
    api, setState, s,
    isAdminRole, pendingCount, navItems,
    isDashboard: s.page === 'dashboard', isRequest: s.page === 'request', isReturn: s.page === 'return',
    isTracker: s.page === 'tracker', isReports: s.page === 'reports', isCentral: s.page === 'central', isAdmin: s.page === 'admin' && isAdminRole,

    consumableTypeCount: s.consumables.length, lowStockCount: lowStockItems.length, assetTotalCount: s.assets.length,
    countAvailable: s.assets.filter((a) => a.status === 'available').length,
    countInUse: s.assets.filter((a) => a.status === 'in_use').length,
    countRepair: s.assets.filter((a) => a.status === 'repair').length,
    countDamaged: s.assets.filter((a) => a.status === 'damaged').length,
    countLost: s.assets.filter((a) => a.status === 'lost').length,
    assetGroups, consumableCategoryGroups,

    staffList: s.staff,
    availableAssetsForDraft, consumablesForDraft, reqCartView, reqAddDisabled, reqSubmitDisabled,
    heldAssetsForDraft, retCartView, retAddDisabled, retSubmitDisabled,

    filteredAssets, selectedAsset,
    topPersons, topJobs, transactionsView, dailyGroups,

    pendingView, consumablesView, assetsAdminView, staffView,
    newConsumableDisabled, newAssetDisabled, newStaffDisabled,

    requisitionsView, scrapReturnsView,
  };
}
