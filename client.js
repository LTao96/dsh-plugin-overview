window.__ModuleLoader__.load({
  id: 'dsh-plugin-overview',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useEffect, useMemo, useState } = React;
    const FOLD_KEY = 'dsh-plugin-overview:fold-third-party';
    const FOLD_EXCLUDED_KEY = 'dsh-plugin-overview:fold-excluded';
    const PANEL_ORDER_KEY = 'dsh-plugin-overview:panel-order';
    let foldController = null;
    let sectionStore = null;
    let panelStore = null;
    let panelNavigator = null;
    const NAV_SELECTOR = 'button, [role="tab"], [role="button"], a, [data-slot="settings.section"], [data-settings-section]';
    const CORE_SECTION_IDS = new Set(['general', 'models', 'plugins', 'agent-presets', 'account', 'plugin-overview', 'settings-nav-manage', 'settings-nav-groups']);

    const isZh = () => String(navigator.language || '').toLowerCase().startsWith('zh');
    const COPY = {
      zh: {
        title: '插件总览',
        intro: '紧凑列表 · 搜索 · 分组 · 一句话备注 · 启停 · 配置入口',
        refresh: '刷新',
        search: '搜索名称、包名、备注、设置页…',
        all: '全部',
        enabled: '启用',
        disabled: '停用',
        pending: '待处理',
        state: '状态',
        plugin: '插件',
        note: '一句话',
        group: '分组',
        settings: '配置',
        installed: '安装',
        on: '启用',
        off: '停用',
        empty: '没有匹配的插件。',
        loading: '正在读取插件清单…',
        failed: '读取失败',
        retry: '重试',
        source: '来源',
        rows: '行',
        noNote: '暂无备注',
        toggleOn: '启用',
        toggleOff: '停用',
        busy: '处理中…',
        open: '打开',
        opened: '已尝试打开设置页：',
        copied: '没找到设置页，路径已复制',
        copyPackage: '复制包名',
        copiedPackage: '包名已复制',
        noteEdit: '一句话备注',
        noteSaved: '备注已保存',
        noteGenerated: 'AI 备注已生成',
        groupSaved: '分组已保存',
        groupManage: '分组管理',
        groupManageHint: '新建、重命名或删除分组；删除后组内插件会移到「未分组」。',
        groupCreated: '分组已创建',
        createGroupOnly: '创建分组',
        health: '健康诊断',
        healthOk: '未发现明显问题',
        autoSummary: '安装时 AI 总结',
        autoSummaryOn: '安装/更新时自动 AI 总结已开启',
        autoSummaryOff: '安装/更新时自动 AI 总结已关闭',
        severityError: '严重',
        severityWarn: '警告',
        severityInfo: '提示',
        allGroups: '全部分组',
        manageGroups: '管理分组',
        renameGroup: '重命名',
        saveGroupName: '保存',
        cancel: '取消',
        groupRenamed: '分组已重命名',
        deleteGroup: '删除分组',
        deleteGroupConfirm: (name) => `删除分组「${name}」？组内插件会移到「未分组」。`,
        groupDeleted: '分组已删除，插件已移到未分组',
        newGroup: '新建分组',
        createGroup: '创建并移入',
        save: '保存备注',
        aiSummary: 'AI 重新总结',
        restart: '需要重启 DSH 生效',
        detail: '插件详情',
        close: '关闭',
        version: '版本',
        entryIds: 'Loader 行',
        fold: '收纳第三方设置项',
        foldHint: '只隐藏设置左侧非系统设置页；系统项和「插件总览」保留。隐藏后仍可用本页的「打开」进入。',
        foldList: '可收纳设置页',
        foldListHint: '勾选=收进总览并隐藏；取消=放回设置左侧。新插件默认收纳。',
        foldAll: '全部收纳',
        releaseAll: '全部放出',
        openPanel: '打开面板',
        panelOpened: '已打开面板：',
        noPanel: '没有可打开的主面板',
        sideOrder: '主侧栏顺序',
        sideHint: '上下移动主界面左侧的插件入口；「更多」保持在最后。只在本机浏览器生效。',
        sideEmpty: '未找到主侧栏',
        up: '上移',
        down: '下移',
        resetOrder: '恢复默认',
        foldCount: (n) => `已收纳 ${n} 项`,
        diag: '诊断侧栏',
        diagDone: '侧栏诊断已记录',
        footer: '备注来自 dshmarket 的 Notes；「打开」会尝试点击设置左侧同名项，找不到时复制路径。',
      },
      en: {
        title: 'Plugin Dashboard',
        intro: 'Compact list · search · groups · notes · enable/disable · settings',
        refresh: 'Refresh',
        search: 'Search name, package, note or settings…',
        all: 'All',
        enabled: 'Enabled',
        disabled: 'Disabled',
        pending: 'Pending',
        state: 'State',
        plugin: 'Plugin',
        note: 'One-line note',
        group: 'Group',
        settings: 'Settings',
        installed: 'Installed',
        on: 'On',
        off: 'Off',
        empty: 'No plugin matches.',
        loading: 'Reading installed plugins…',
        failed: 'Failed to load',
        retry: 'Retry',
        source: 'Source',
        rows: 'rows',
        noNote: 'No note yet',
        toggleOn: 'Enable',
        toggleOff: 'Disable',
        busy: 'Working…',
        open: 'Open',
        opened: 'Tried to open settings: ',
        copied: 'Settings page not found; path copied',
        copyPackage: 'Copy package',
        copiedPackage: 'Package name copied',
        noteEdit: 'One-line note',
        noteSaved: 'Note saved',
        noteGenerated: 'AI note generated',
        groupSaved: 'Group saved',
        groupManage: 'Manage groups',
        groupManageHint: 'Create, rename or delete groups. Deleted groups move their plugins to Ungrouped.',
        groupCreated: 'Group created',
        createGroupOnly: 'Create group',
        health: 'Health',
        healthOk: 'No obvious issues',
        autoSummary: 'AI summary on install',
        autoSummaryOn: 'Automatic AI summary is on',
        autoSummaryOff: 'Automatic AI summary is off',
        severityError: 'Error',
        severityWarn: 'Warning',
        severityInfo: 'Info',
        allGroups: 'All groups',
        manageGroups: 'Manage groups',
        renameGroup: 'Rename',
        saveGroupName: 'Save',
        cancel: 'Cancel',
        groupRenamed: 'Group renamed',
        deleteGroup: 'Delete group',
        deleteGroupConfirm: (name) => `Delete group “${name}”? Its plugins will move to Ungrouped.`,
        groupDeleted: 'Group deleted; plugins moved to Ungrouped',
        newGroup: 'New group',
        createGroup: 'Create and move',
        save: 'Save note',
        aiSummary: 'AI summarize',
        restart: 'restart DSH to apply',
        detail: 'Plugin details',
        close: 'Close',
        version: 'Version',
        entryIds: 'Loader rows',
        fold: 'Fold third-party settings',
        foldHint: 'Hides non-core settings pages from the settings nav. Core pages and Plugin Dashboard stay. “Open” still works.',
        foldList: 'Foldable settings pages',
        foldListHint: 'Checked = folded into this page; unchecked = released back to the settings nav. New plugins fold by default.',
        foldAll: 'Fold all',
        releaseAll: 'Release all',
        openPanel: 'Open panel',
        panelOpened: 'Opened panel: ',
        noPanel: 'No main panel to open',
        sideOrder: 'Main sidebar order',
        sideHint: 'Move main-sidebar plugin entries up or down. “More” stays last. Local to this browser.',
        sideEmpty: 'Main sidebar not found',
        up: 'Up',
        down: 'Down',
        resetOrder: 'Reset',
        foldCount: (n) => `${n} folded`,
        diag: 'Diagnose nav',
        diagDone: 'Nav snapshot saved',
        footer: 'Notes come from dshmarket. “Open” tries the matching settings nav item; if it cannot find one, it copies the path.',
      },
    };

    const CSS = `
      .pd-wrap { display: grid; gap: 12px; color: var(--dsw-alias-label-primary); }
      .pd-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
      .pd-head h2 { margin: 0; font-size: 18px; line-height: 26px; }
      .pd-head p { margin: 3px 0 0; color: var(--dsw-alias-label-secondary); font-size: 12px; }
      .pd-stats { display: flex; flex-wrap: wrap; gap: 6px; }
      .pd-stat { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); border-radius: 999px; padding: 2px 9px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .pd-toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
      .pd-search { flex: 1 1 260px; min-width: 180px; height: 32px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); border-radius: 8px; padding: 0 10px; font: inherit; font-size: 13px; }
      .pd-search:focus { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }
      .pd-filters { display: flex; gap: 4px; flex-wrap: wrap; }
      .pd-filter { height: 30px; padding: 0 10px; border-radius: 7px; border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; cursor: pointer; }
      .pd-filter[data-active="true"] { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: #fff; }
      .pd-refresh { height: 30px; padding: 0 10px; border-radius: 7px; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 12px; cursor: pointer; }
      .pd-auto-summary { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--dsw-alias-label-tertiary); white-space: nowrap; cursor: pointer; }
      .pd-auto-summary input { margin: 0; }
      .pd-fold { display: flex; gap: 8px; align-items: flex-start; border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); border-radius: 8px; padding: 8px 10px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
      .pd-fold input { margin: 2px 0 0; }
      .pd-fold strong { display: block; color: var(--dsw-alias-label-primary); font-weight: 500; }
      .pd-fold small { display: block; margin-top: 2px; color: var(--dsw-alias-label-tertiary); line-height: 1.5; }
      .pd-notice { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); border-radius: 7px; padding: 6px 9px; font-size: 12px; }
      .pd-side { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); border-radius: 8px; padding: 7px 9px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
      .pd-side summary { cursor: pointer; color: var(--dsw-alias-label-primary); font-weight: 500; }
      .pd-side-hint { margin: 5px 0 8px; color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 1.5; }
      .pd-side-list { display: grid; gap: 4px; }
      .pd-side-row { display: grid; grid-template-columns: minmax(0,1fr) auto auto; gap: 6px; align-items: center; padding: 3px 0; border-top: 1px solid var(--dsw-alias-border-l1); }
      .pd-side-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-check { display: flex; gap: 8px; align-items: center; padding: 3px 0; border-top: 1px solid var(--dsw-alias-border-l1); cursor: pointer; }
      .pd-check input { margin: 0; }
      .pd-side-btn { border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-secondary); border-radius: 5px; font: inherit; font-size: 10.5px; padding: 1px 5px; cursor: pointer; }
      .pd-side-btn:disabled { opacity: .4; cursor: default; }
      .pd-health-list { display: grid; gap: 5px; margin-top: 8px; }
      .pd-health-item { display: grid; grid-template-columns: 42px minmax(0,1fr) auto; gap: 7px; align-items: center; padding: 4px 0; border-top: 1px solid var(--dsw-alias-border-l1); }
      .pd-health-text { min-width: 0; display: grid; gap: 1px; }
      .pd-health-text strong { font-size: 11.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-health-text small { color: var(--dsw-alias-label-tertiary); font-size: 10.5px; line-height: 1.4; }
      .pd-sev { border-radius: 999px; padding: 1px 5px; text-align: center; font-size: 10px; border: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-tertiary); }
      .pd-sev[data-sev="error"] { color: var(--dsw-alias-state-error-primary); border-color: var(--dsw-alias-state-error-primary); }
      .pd-sev[data-sev="warn"] { color: var(--dsw-alias-state-warn-primary); border-color: var(--dsw-alias-state-warn-primary); }
      .pd-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 12.5px; }
      .pd-table th { text-align: left; font-weight: 500; color: var(--dsw-alias-label-tertiary); padding: 6px 8px; border-bottom: 1px solid var(--dsw-alias-border-l2); white-space: nowrap; }
      .pd-table td { padding: 8px; border-bottom: 1px solid var(--dsw-alias-border-l1); vertical-align: middle; }
      .pd-row { cursor: pointer; }
      .pd-row:hover td { background: var(--dsw-alias-bg-layer-2); }
      .pd-state { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
      .pd-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--dsw-alias-state-idle-primary); flex: none; }
      .pd-dot[data-on="true"] { background: var(--dsw-alias-state-success-primary); }
      .pd-toggle { border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-secondary); border-radius: 5px; font: inherit; font-size: 10.5px; padding: 1px 5px; cursor: pointer; }
      .pd-toggle:disabled { opacity: .55; cursor: default; }
      .pd-name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-pkg { margin-top: 1px; font-size: 10.5px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-note { color: var(--dsw-alias-label-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-pill { display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; padding: 1px 7px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
      .pd-config { overflow: hidden; }
      .pd-config strong { display: block; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-config small { display: block; margin-top: 1px; font-size: 10.5px; color: var(--dsw-alias-label-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .pd-open { margin-top: 2px; border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-brand-primary); border-radius: 5px; font: inherit; font-size: 10.5px; padding: 0 5px; cursor: pointer; }
      .pd-date { color: var(--dsw-alias-label-tertiary); white-space: nowrap; font-variant-numeric: tabular-nums; }
      .pd-muted { color: var(--dsw-alias-label-tertiary); }
      .pd-error { color: var(--dsw-alias-state-error-primary); font-size: 12px; }
      .pd-footer { color: var(--dsw-alias-label-tertiary); font-size: 11px; }
      .pd-overlay { position: fixed; inset: 0; z-index: 2147483000; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; padding: 18px; }
      .pd-modal { width: min(620px, 94vw); max-height: 86vh; overflow: auto; background: var(--dsw-alias-bg-overlay); color: var(--dsw-alias-label-primary); border: 1px solid var(--dsw-alias-border-l2); border-radius: 14px; box-shadow: 0 18px 60px rgba(0,0,0,.35); padding: 15px; }
      .pd-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
      .pd-modal-head h3 { margin: 0; font-size: 15px; }
      .pd-modal-head p { margin: 3px 0 0; color: var(--dsw-alias-label-tertiary); font-size: 10.8px; }
      .pd-x { border: 1px solid var(--dsw-alias-border-l2); background: transparent; color: var(--dsw-alias-label-secondary); border-radius: 6px; font: inherit; font-size: 11.5px; padding: 2px 8px; cursor: pointer; }
      .pd-modal-note { margin: 10px 0; color: var(--dsw-alias-label-secondary); font-size: 12.2px; line-height: 1.55; }
      .pd-note-edit { width: 100%; box-sizing: border-box; resize: vertical; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); padding: 7px 9px; font: inherit; font-size: 12.5px; line-height: 1.5; }
      .pd-note-edit:focus { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: -1px; }
      .pd-note-actions { display: flex; gap: 6px; margin-top: 7px; }
      .pd-group-edit { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; margin: 9px 0; font-size: 11.5px; color: var(--dsw-alias-label-secondary); }
      .pd-select, .pd-group-input { height: 27px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 11.5px; padding: 0 6px; }
      .pd-group-input { width: 110px; }
      .pd-facts { display: grid; grid-template-columns: 82px minmax(0,1fr); gap: 5px 9px; font-size: 11.3px; color: var(--dsw-alias-label-secondary); }
      .pd-facts b { color: var(--dsw-alias-label-tertiary); font-weight: 500; }
      .pd-facts span { overflow-wrap: anywhere; }
      .pd-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
      .pd-action { border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); border-radius: 7px; font: inherit; font-size: 11.5px; padding: 4px 9px; cursor: pointer; }
      .pd-action[data-primary="true"] { background: var(--dsw-alias-brand-primary); border-color: var(--dsw-alias-brand-primary); color: #fff; }
      @media (max-width: 900px) {
        .pd-table th:nth-child(5), .pd-table td:nth-child(5), .pd-table th:nth-child(6), .pd-table td:nth-child(6) { display: none; }
        .pd-table th:nth-child(2), .pd-table td:nth-child(2) { width: 34% !important; }
      }
    `;

    function formatDate(iso, approximate) {
      if (!iso) return '—';
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return '—';
      return `${date.toLocaleDateString('zh-CN')}${approximate ? '≈' : ''}`;
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }

    function useDashboardData() {
      const [state, setState] = useState({ loading: true, error: '', rows: [], groups: [], health: [], settings: { autoSummary: false } });
      const load = async () => {
        setState((prev) => ({ ...prev, loading: true, error: '' }));
        try {
          const response = await fetch('/plugin-overview/data.json', { credentials: 'same-origin', cache: 'no-store' });
          const body = await response.json();
          if (!response.ok || body.ok !== true) throw new Error(body.error || `HTTP ${response.status}`);
          setState({
            loading: false,
            error: '',
            rows: Array.isArray(body.rows) ? body.rows : [],
            groups: Array.isArray(body.groups) ? body.groups : [],
            health: Array.isArray(body.health) ? body.health : [],
            settings: body.settings && typeof body.settings === 'object' ? body.settings : { autoSummary: false },
          });
        } catch (error) {
          setState({ loading: false, error: error instanceof Error ? error.message : String(error), rows: [], groups: [], health: [], settings: { autoSummary: false } });
        }
      };
      useEffect(() => { void load(); }, []);
      return { ...state, reload: load };
    }

    function findNavButton(label, scope = document) {
      const nodes = Array.from(scope.querySelectorAll(NAV_SELECTOR))
        .filter((node) => !node.closest('[data-plugin-overview]'));
      const textOf = (node) => String(node.textContent || '').trim();
      return nodes.find((node) => textOf(node) === label)
        || nodes.find((node) => {
          const text = textOf(node);
          return text.length <= 60 && (text.startsWith(label) || text.includes(label));
        });
    }

    function findSettingsNav() {
      const own = findNavButton(isZh() ? '插件总览' : 'Plugin Dashboard');
      if (!own) return null;
      let container = own.closest('li')?.parentElement || own.parentElement;
      let guard = 0;
      while (container && container !== document.body && container.querySelectorAll(NAV_SELECTOR).length < 4 && guard < 8) {
        container = container.parentElement;
        guard += 1;
      }
      return container && container !== document.body ? container : null;
    }

    function resolveLabel(value) {
      if (typeof value === 'function') {
        try { return String(value() || '').trim(); } catch { return ''; }
      }
      return typeof value === 'string' ? value.trim() : '';
    }

    function normalizeName(value) {
      return String(value || '')
        .toLowerCase()
        .replace(/^@[^/]+\//, '')
        .replace(/\bdsh[-_]?/g, '')
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '');
    }

    function matchSection(row, sections) {
      let best = null;
      let bestScore = 0;
      const packageName = normalizeName(row.packageName);
      const displayName = normalizeName(row.name);
      for (const section of sections) {
        if (CORE_SECTION_IDS.has(section.id)) continue;
        const id = normalizeName(section.id);
        const label = normalizeName(section.label);
        let score = 0;
        if (id && packageName === id) score = 100;
        else if (id && (packageName.includes(id) || id.includes(packageName))) score = 90;
        else if (label && displayName === label) score = 80;
        else if (label && (displayName.includes(label) || label.includes(displayName))) score = 70;
        else if (id && displayName.includes(id)) score = 60;
        if (score > bestScore) {
          best = section;
          bestScore = score;
        }
      }
      return bestScore >= 60 ? best : null;
    }

    function settingsForRow(row, sections) {
      const auto = matchSection(row, sections);
      if (auto === null) return row.settings || {};
      return {
        ...(row.settings || {}),
        label: auto.label,
        navLabel: auto.label,
        sectionId: auto.id,
        hint: `设置 → ${auto.label}`,
        auto: true,
      };
    }

    function matchPanel(row, panels) {
      const packageName = normalizeName(row.packageName);
      const displayName = normalizeName(row.name);
      let best = null;
      let bestScore = 0;
      for (const panel of panels) {
        const id = normalizeName(panel.id);
        const label = normalizeName(panel.label);
        let score = 0;
        if (id && id === packageName) score = Math.max(score, 100);
        if (label && label === displayName) score = Math.max(score, 90);
        if (label && displayName && (label.includes(displayName) || displayName.includes(label))) score = Math.max(score, 70);
        if (id && packageName && (packageName.includes(id) || id.includes(packageName))) score = Math.max(score, 60);
        if (score > bestScore) { best = panel; bestScore = score; }
      }
      return best;
    }

    function panelForRow(row, panels) {
      if (row.panelId && panels.some((panel) => panel.id === row.panelId)) return row.panelId;
      const auto = matchPanel(row, panels);
      return auto ? auto.id : row.panelId || null;
    }

    function usePanelList() {
      const [panels, setPanels] = useState(() => panelStore?.list() || []);
      useEffect(() => {
        if (!panelStore) return undefined;
        const update = () => setPanels(panelStore.list());
        update();
        return panelStore.subscribe(update);
      }, []);
      return panels;
    }

    function readExcluded() {
      try {
        const value = JSON.parse(localStorage.getItem(FOLD_EXCLUDED_KEY) || '[]');
        return new Set(Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []);
      } catch {
        return new Set();
      }
    }

    function writeExcluded(excluded) {
      try { localStorage.setItem(FOLD_EXCLUDED_KEY, JSON.stringify([...excluded])); } catch {}
    }

    function useSectionList() {
      const [sections, setSections] = useState(() => sectionStore?.list() || []);
      useEffect(() => {
        if (!sectionStore) return undefined;
        const update = () => setSections(sectionStore.list());
        update();
        return sectionStore.subscribe(update);
      }, []);
      return sections;
    }

    function findPanelNav() {
      const labels = new Set((panelStore?.list() || []).map((panel) => panel.label).filter(Boolean));
      if (labels.size === 0) return null;
      const navs = Array.from(document.querySelectorAll('nav'));
      let best = null;
      let bestScore = 0;
      for (const nav of navs) {
        const buttons = Array.from(nav.querySelectorAll('button')).filter((button) => button.parentElement === nav);
        const texts = buttons.map((button) => String(button.textContent || button.getAttribute('aria-label') || button.getAttribute('title') || '').trim());
        const score = texts.filter((text) => labels.has(text)).length;
        if (score > bestScore) { best = { nav, buttons, texts }; bestScore = score; }
      }
      return best;
    }

    function panelLabels() {
      return findPanelNav()?.texts || [];
    }

    function readPanelOrder() {
      try {
        const value = JSON.parse(localStorage.getItem(PANEL_ORDER_KEY) || '[]');
        return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
      } catch {
        return [];
      }
    }

    function writePanelOrder(order) {
      try { localStorage.setItem(PANEL_ORDER_KEY, JSON.stringify(order)); } catch {}
    }

    function applyPanelOrder(order) {
      const found = findPanelNav();
      if (!found) return;
      const rank = new Map(order.map((label, index) => [label, index]));
      for (const button of found.buttons) {
        const label = String(button.textContent || '').trim();
        const index = rank.get(label);
        if (index === undefined) button.style.removeProperty('order');
        else button.style.order = String(index);
      }
      for (const child of found.nav.children) {
        if (child.tagName === 'BUTTON') continue;
        if (String(child.textContent || '').trim().startsWith('更多')) child.style.order = '999';
      }
    }

    function clearPanelOrder() {
      const found = findPanelNav();
      if (!found) return;
      for (const child of found.nav.children) child.style.removeProperty('order');
      try { localStorage.removeItem(PANEL_ORDER_KEY); } catch {}
    }

    function usePanelOrder() {
      const [labels, setLabels] = useState([]);
      const [order, setOrder] = useState(readPanelOrder);
      const refresh = () => {
        const next = panelLabels();
        setLabels(next);
        if (next.length === 0) return;
        setOrder((prev) => {
          const merged = [...prev.filter((label) => next.includes(label)), ...next.filter((label) => !prev.includes(label))];
          writePanelOrder(merged);
          return merged;
        });
      };
      useEffect(() => {
        refresh();
        const observer = new MutationObserver(() => refresh());
        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
      }, []);
      useEffect(() => { applyPanelOrder(order); }, [order, labels]);
      const move = (label, delta) => {
        setOrder((prev) => {
          const next = [...prev];
          const index = next.indexOf(label);
          const target = index + delta;
          if (index < 0 || target < 0 || target >= next.length) return prev;
          [next[index], next[target]] = [next[target], next[index]];
          writePanelOrder(next);
          return next;
        });
      };
      const reset = () => {
        clearPanelOrder();
        const next = panelLabels();
        setOrder(next);
        setLabels(next);
      };
      const ordered = [...order.filter((label) => labels.includes(label)), ...labels.filter((label) => !order.includes(label))];
      return { labels: ordered, move, reset };
    }

    function createFoldController(getSections) {
      const labels = new Set();
      let excluded = readExcluded();
      const refreshLabels = () => {
        labels.clear();
        for (const entry of getSections?.() || []) {
          const id = entry?.id;
          if (typeof id !== 'string' || CORE_SECTION_IDS.has(id) || excluded.has(id)) continue;
          if (typeof entry.label === 'string' && entry.label.trim() !== '') labels.add(entry.label.trim());
        }
      };
      const styleId = 'dsh-plugin-overview-fold-style';
      const hidden = new Set();
      let enabled = (() => {
        try { return localStorage.getItem(FOLD_KEY) === '1'; } catch { return false; }
      })();
      let observer = null;
      let style = null;

      const ensureStyle = () => {
        if (style?.isConnected) return;
        style = document.getElementById(styleId);
        if (style === null) {
          style = document.createElement('style');
          style.id = styleId;
          style.textContent = '[data-pd-folded="1"]{display:none!important}[data-pd-folded="1"]:has([aria-current]),[data-pd-folded="1"][aria-current]{display:flex!important}';
          document.head.appendChild(style);
        }
      };
      const restore = () => {
        for (const row of hidden) row.removeAttribute('data-pd-folded');
        hidden.clear();
      };
      const hide = () => {
        if (!enabled) return;
        restore();
        const own = findNavButton(isZh() ? '插件总览' : 'Plugin Dashboard');
        const anchor = own || findNavButton([...labels][0]);
        if (!anchor) return;
        let container = anchor.closest('li')?.parentElement || anchor.parentElement;
        let guard = 0;
        while (container && container !== document.body && container.querySelectorAll(NAV_SELECTOR).length < 4 && guard < 8) {
          container = container.parentElement;
          guard += 1;
        }
        if (!container || container === document.body) return;
        for (const item of container.querySelectorAll(NAV_SELECTOR)) {
          if (item === own) continue;
          if (item.getAttribute('aria-current') !== null || item.querySelector('[aria-current]') !== null) continue;
          const text = String(item.textContent || '').trim();
          if (text.length > 60) continue;
          const matched = labels.has(text) || [...labels].some((label) => text.startsWith(label));
          if (!matched) continue;
          const row = item.closest('li') || item;
          row.setAttribute('data-pd-folded', '1');
          hidden.add(row);
        }
      };
      const apply = () => {
        if (!enabled) {
          restore();
          return;
        }
        ensureStyle();
        hide();
      };
      return {
        mount() {
          refreshLabels();
          ensureStyle();
          observer = new MutationObserver(() => apply());
          observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current'] });
          apply();
        },
        refresh() {
          refreshLabels();
          apply();
        },
        setEnabled(value) {
          enabled = value;
          refreshLabels();
          apply();
        },
        setExcluded(value) {
          excluded = new Set(value);
          refreshLabels();
          apply();
        },
        dispose() {
          enabled = false;
          observer?.disconnect();
          observer = null;
          restore();
          style?.remove();
          style = null;
        },
      };
    }

    function Dashboard() {
      const copy = isZh() ? COPY.zh : COPY.en;
      const { loading, error, rows, groups, health, settings, reload } = useDashboardData();
      const [query, setQuery] = useState('');
      const [filter, setFilter] = useState('all');
      const [groupFilter, setGroupFilter] = useState('all');
      const [groupManager, setGroupManager] = useState(false);
      const [managedNewGroup, setManagedNewGroup] = useState('');
      const [renameTarget, setRenameTarget] = useState(null);
      const [renameDraft, setRenameDraft] = useState('');
      const [autoSummary, setAutoSummary] = useState(settings?.autoSummary === true);
      const [selected, setSelected] = useState(null);
      const [busy, setBusy] = useState('');
      const [noteBusy, setNoteBusy] = useState('');
      const [noteDraft, setNoteDraft] = useState('');
      const [newGroup, setNewGroup] = useState('');
      const [notice, setNotice] = useState('');
      const [fold, setFold] = useState(() => {
        try { return localStorage.getItem(FOLD_KEY) === '1'; } catch { return false; }
      });
      const panelOrder = usePanelOrder();
      const sections = useSectionList();
      const panels = usePanelList();
      const [excluded, setExcluded] = useState(readExcluded);
      const thirdPartySections = useMemo(() => sections.filter((section) => !CORE_SECTION_IDS.has(section.id)), [sections]);
      const resolvedRows = useMemo(() => rows.map((row) => ({
        ...row,
        settings: settingsForRow(row, sections),
        panelId: panelForRow(row, panels),
      })), [rows, sections, panels]);
      const diagnostics = useMemo(() => {
        const issues = [...health];
        const labels = new Set(sections.map((section) => normalizeName(section.label)));
        for (const row of resolvedRows) {
          const label = row.settings?.navLabel;
          if (label && row.settings?.auto !== true && !labels.has(normalizeName(label))) {
            issues.push({
              id: `settings:${row.packageName}`,
              severity: 'warn',
              type: 'settings',
              packageName: row.packageName,
              name: row.name,
              message: `配置入口指向「${label}」，但设置页台账里没有这一项`,
            });
          }
        }
        const rank = { error: 0, warn: 1, info: 2 };
        return issues.sort((left, right) => (rank[left.severity] ?? 9) - (rank[right.severity] ?? 9));
      }, [health, resolvedRows, sections]);

      useEffect(() => {
        foldController?.setExcluded(excluded);
        writeExcluded(excluded);
      }, [excluded]);

      const stats = useMemo(() => {
        const enabled = resolvedRows.filter((row) => row.enabled).length;
        const pending = resolvedRows.filter((row) => row.group === '待处理' || row.group === '实验').length;
        return { total: resolvedRows.length, enabled, disabled: resolvedRows.length - enabled, pending };
      }, [resolvedRows]);

      const groupCounts = useMemo(() => {
        const counts = new Map();
        for (const row of resolvedRows) counts.set(row.group, (counts.get(row.group) || 0) + 1);
        return counts;
      }, [resolvedRows]);

      const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return resolvedRows.filter((row) => {
          if (filter === 'enabled' && !row.enabled) return false;
          if (filter === 'disabled' && row.enabled) return false;
          if (filter === 'pending' && row.group !== '待处理' && row.group !== '实验') return false;
          if (groupFilter !== 'all' && row.group !== groupFilter) return false;
          if (!q) return true;
          return [
            row.name,
            row.packageName,
            row.note,
            row.group,
            row.settings?.label,
            row.settings?.navLabel,
            row.settings?.sectionId,
            row.settings?.hint,
          ].filter(Boolean).join(' ').toLowerCase().includes(q);
        });
      }, [resolvedRows, query, filter, groupFilter]);

      const filters = [
        ['all', copy.all],
        ['enabled', copy.enabled],
        ['disabled', copy.disabled],
        ['pending', copy.pending],
      ];

      useEffect(() => {
        try { localStorage.setItem(FOLD_KEY, fold ? '1' : '0'); } catch {}
      }, [fold]);

      useEffect(() => {
        setNoteDraft(selected?.note || '');
        setNewGroup('');
      }, [selected]);

      useEffect(() => {
        setAutoSummary(settings?.autoSummary === true);
      }, [settings?.autoSummary]);

      useEffect(() => {
        if (!selected) return undefined;
        const onKey = (event) => { if (event.key === 'Escape') setSelected(null); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
      }, [selected]);

      useEffect(() => {
        foldController?.setEnabled(fold);
      }, [fold]);

      const toggle = async (row) => {
        if (busy !== '') return;
        setBusy(row.packageName);
        setNotice('');
        try {
          const response = await fetch('/plugin-overview/toggle', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ packageName: row.packageName, enabled: !row.enabled }),
          });
          const body = await response.json();
          if (!response.ok || body.ok !== true) throw new Error(body.error || `HTTP ${response.status}`);
          const app = body.result?.application;
          setNotice(`${row.name}：${row.enabled ? copy.off : copy.on}${app === 'restart-required' ? ` · ${copy.restart}` : ''}`);
          setSelected(null);
          // Give the loader tree a moment to settle before re-reading it.
          // Without this, listBundles can still expose the pre-toggle bundle
          // for one render and the next click sends the same direction again.
          await new Promise((resolve) => setTimeout(resolve, 150));
          await reload();
        } catch (error) {
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setBusy('');
        }
      };

      const openSettings = async (row) => {
        const label = row.settings?.navLabel;
        setSelected(null);
        if (!label) {
          await copyText(row.settings?.hint || row.packageName);
          setNotice(copy.copied);
          return;
        }
        requestAnimationFrame(() => {
          const nav = findSettingsNav();
          const target = findNavButton(label, nav || document);
          if (target) {
            target.click();
            setNotice(`${copy.opened}${label}`);
            return;
          }
          void copyText(row.settings?.hint || label).then(() => setNotice(copy.copied));
        });
      };

      const openPanel = (row) => {
        setSelected(null);
        if (!row.panelId || !panelNavigator) {
          setNotice(copy.noPanel);
          return;
        }
        panelNavigator(row.panelId);
        setNotice(`${copy.panelOpened}${row.name}`);
      };

      const postJson = async (path, payload) => {
        const response = await fetch(path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await response.json();
        if (!response.ok || body.ok !== true) throw new Error(body.error || `HTTP ${response.status}`);
        return body;
      };

      const updateAutoSummary = async (checked) => {
        setAutoSummary(checked);
        try {
          await postJson('/plugin-overview/settings', { autoSummary: checked });
          setNotice(checked ? copy.autoSummaryOn : copy.autoSummaryOff);
          await reload();
        } catch (error) {
          setAutoSummary(!checked);
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        }
      };

      const saveNote = async (row) => {
        if (!row || noteBusy !== '') return;
        setNoteBusy('note');
        try {
          await postJson('/plugin-overview/note', { packageName: row.packageName, text: noteDraft });
          setNotice(copy.noteSaved);
          setSelected(null);
          await reload();
        } catch (error) {
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setNoteBusy('');
        }
      };

      const regenerateNote = async (row) => {
        if (!row || noteBusy !== '') return;
        setNoteBusy('ai');
        try {
          const body = await postJson('/plugin-overview/summarize', { packageName: row.packageName });
          setNotice(copy.noteGenerated);
          setSelected(null);
          await reload();
          if (body?.note?.text) setNoteDraft(body.note.text);
        } catch (error) {
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setNoteBusy('');
        }
      };

      const changeGroup = async (row, group) => {
        if (!row || noteBusy !== '') return;
        setNoteBusy('group');
        try {
          await postJson('/plugin-overview/group', { packageName: row.packageName, group });
          setNotice(copy.groupSaved);
          setSelected(null);
          await reload();
        } catch (error) {
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setNoteBusy('');
        }
      };

      const createGroup = async (row) => {
        const name = newGroup.trim();
        if (name === '' || noteBusy !== '') return;
        await changeGroup(row, name);
      };

      const createEmptyGroup = async () => {
        const name = managedNewGroup.trim();
        if (name === '' || noteBusy !== '') return;
        setNoteBusy('group');
        try {
          await postJson('/plugin-overview/group/create', { name });
          setManagedNewGroup('');
          setNotice(copy.groupCreated);
          await reload();
        } catch (error) {
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setNoteBusy('');
        }
      };

      const startRename = (name) => {
        if (noteBusy !== '') return;
        setRenameTarget(name);
        setRenameDraft(name);
      };

      const commitRename = async () => {
        const name = renameTarget;
        const next = renameDraft.trim();
        if (name === null || next === '' || next === name || noteBusy !== '') return;
        setNoteBusy('group');
        try {
          await postJson('/plugin-overview/group/rename', { name, newName: next });
          setNotice(copy.groupRenamed);
          setGroupFilter('all');
          setRenameTarget(null);
          setRenameDraft('');
          await reload();
        } catch (error) {
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setNoteBusy('');
        }
      };

      const removeGroup = async (name) => {
        if (noteBusy !== '' || !window.confirm(copy.deleteGroupConfirm(name))) return;
        setNoteBusy('group');
        try {
          await postJson('/plugin-overview/group/delete', { name });
          setNotice(copy.groupDeleted);
          setGroupFilter('all');
          if (selected?.group === name) setSelected(null);
          await reload();
        } catch (error) {
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setNoteBusy('');
        }
      };

      const toggleSection = (id, checked) => {
        setExcluded((prev) => {
          const next = new Set(prev);
          if (checked) next.delete(id);
          else next.add(id);
          return next;
        });
      };

      const reportNav = async () => {
        const nav = [];
        for (const element of document.querySelectorAll('nav')) {
          const buttons = Array.from(element.querySelectorAll('button')).filter((button) => button.parentElement === element);
          if (buttons.length === 0) continue;
          nav.push({
            navClass: String(element.className || '').slice(0, 120),
            buttons: buttons.slice(0, 30).map((button) => ({
              text: String(button.textContent || '').trim().slice(0, 60),
              display: getComputedStyle(button).display,
              folded: button.getAttribute('data-pd-folded'),
            })),
          });
          if (nav.length >= 10) break;
        }
        try {
          const response = await fetch('/plugin-overview/debug', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ nav }),
          });
          const body = await response.json();
          if (!response.ok || body.ok !== true) throw new Error(body.error || `HTTP ${response.status}`);
          setNotice(copy.diagDone);
        } catch (error) {
          setNotice(`${copy.failed}: ${error instanceof Error ? error.message : String(error)}`);
        }
      };

      return h('div', { className: 'pd-wrap', 'data-plugin-overview': true },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h('div', { className: 'pd-head' },
          h('div', null, h('h2', null, copy.title), h('p', null, copy.intro)),
          h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
            h('label', { className: 'pd-auto-summary' },
              h('input', {
                type: 'checkbox',
                checked: autoSummary,
                onChange: (event) => void updateAutoSummary(event.target.checked),
              }),
              h('span', null, copy.autoSummary)
            ),
            h('button', { type: 'button', className: 'pd-refresh', onClick: reload }, copy.refresh)
          )
        ),
        h('div', { className: 'pd-stats' },
          h('span', { className: 'pd-stat' }, `${copy.all} ${stats.total}`),
          h('span', { className: 'pd-stat' }, `${copy.enabled} ${stats.enabled}`),
          h('span', { className: 'pd-stat' }, `${copy.disabled} ${stats.disabled}`),
          h('span', { className: 'pd-stat' }, `${copy.pending} ${stats.pending}`)
        ),
        h('details', { className: 'pd-side pd-health' },
          h('summary', null, `${copy.health}（${diagnostics.length}）`),
          diagnostics.length === 0
            ? h('div', { className: 'pd-muted' }, copy.healthOk)
            : h('div', { className: 'pd-health-list' },
              diagnostics.map((issue) => {
                const row = issue.packageName ? resolvedRows.find((item) => item.packageName === issue.packageName) : null;
                return h('div', { className: 'pd-health-item', key: issue.id },
                  h('span', { className: 'pd-sev', 'data-sev': issue.severity },
                    issue.severity === 'error' ? copy.severityError : issue.severity === 'warn' ? copy.severityWarn : copy.severityInfo
                  ),
                  h('span', { className: 'pd-health-text' },
                    h('strong', null, issue.name),
                    h('small', null, issue.message)
                  ),
                  row && h('button', {
                    type: 'button',
                    className: 'pd-side-btn',
                    onClick: () => setSelected(row),
                  }, copy.detail)
                );
              })
            )
        ),
        h('div', { style: { display: 'flex', gap: 8, alignItems: 'stretch' } },
          h('label', { className: 'pd-fold', style: { flex: 1 } },
            h('input', { type: 'checkbox', checked: fold, onChange: (event) => setFold(event.target.checked) }),
            h('span', null,
              h('strong', null, copy.fold),
              h('small', null, copy.foldHint)
            )
          ),
          h('button', { type: 'button', className: 'pd-refresh', onClick: () => void reportNav(), style: { alignSelf: 'flex-start' } }, copy.diag)
        ),
        h('details', { className: 'pd-side' },
          h('summary', null, `${copy.foldList}（${thirdPartySections.length}）`),
          h('div', { className: 'pd-side-hint' }, copy.foldListHint),
          thirdPartySections.length === 0
            ? h('div', { className: 'pd-muted' }, copy.empty)
            : h('div', { className: 'pd-side-list' },
              thirdPartySections.map((section) => h('label', { className: 'pd-check', key: section.id },
                h('input', {
                  type: 'checkbox',
                  checked: !excluded.has(section.id),
                  onChange: (event) => toggleSection(section.id, event.target.checked),
                }),
                h('span', { className: 'pd-side-label' }, section.label)
              ))
            ),
          thirdPartySections.length > 0 && h('div', { style: { display: 'flex', gap: 6, marginTop: 8 } },
            h('button', { type: 'button', className: 'pd-refresh', onClick: () => setExcluded(new Set()) }, copy.foldAll),
            h('button', { type: 'button', className: 'pd-refresh', onClick: () => setExcluded(new Set(thirdPartySections.map((section) => section.id))) }, copy.releaseAll)
          )
        ),
        h('details', { className: 'pd-side' },
          h('summary', null, `${copy.sideOrder}（${panelOrder.labels.length}）`),
          h('div', { className: 'pd-side-hint' }, copy.sideHint),
          panelOrder.labels.length === 0
            ? h('div', { className: 'pd-muted' }, copy.sideEmpty)
            : h('div', { className: 'pd-side-list' },
              panelOrder.labels.map((label, index) => h('div', { className: 'pd-side-row', key: label },
                h('span', { className: 'pd-side-label' }, label),
                h('button', {
                  type: 'button',
                  className: 'pd-side-btn',
                  disabled: index === 0,
                  onClick: () => panelOrder.move(label, -1),
                }, copy.up),
                h('button', {
                  type: 'button',
                  className: 'pd-side-btn',
                  disabled: index === panelOrder.labels.length - 1,
                  onClick: () => panelOrder.move(label, 1),
                }, copy.down)
              ))
            ),
          panelOrder.labels.length > 0 && h('button', {
            type: 'button',
            className: 'pd-refresh',
            onClick: panelOrder.reset,
          }, copy.resetOrder)
        ),
        h('div', { className: 'pd-toolbar' },
          h('input', {
            className: 'pd-search',
            value: query,
            placeholder: copy.search,
            onChange: (event) => setQuery(event.target.value),
          }),
          h('select', {
            className: 'pd-select',
            value: groupFilter,
            onChange: (event) => setGroupFilter(event.target.value),
          },
            h('option', { value: 'all' }, `${copy.allGroups} (${resolvedRows.length})`),
            h('option', { value: '未分组' }, `未分组 (${groupCounts.get('未分组') || 0})`),
            groups.map((group) => h('option', { key: group, value: group }, `${group} (${groupCounts.get(group) || 0})`))
          ),
          h('button', {
            type: 'button',
            className: 'pd-refresh',
            onClick: () => setGroupManager(true),
          }, copy.manageGroups),
          h('div', { className: 'pd-filters' },
            filters.map(([id, label]) => h('button', {
              key: id,
              type: 'button',
              className: 'pd-filter',
              'data-active': filter === id ? 'true' : 'false',
              onClick: () => setFilter(id),
            }, label))
          )
        ),
        notice !== '' && h('div', { className: 'pd-notice' }, notice),
        error !== '' && h('div', { className: 'pd-error' }, `${copy.failed}: ${error}`, h('button', { type: 'button', className: 'pd-refresh', onClick: reload, style: { marginLeft: 8 } }, copy.retry)),
        loading && h('div', { className: 'pd-muted' }, copy.loading),
        !loading && !error && h('table', { className: 'pd-table' },
          h('colgroup', null,
            h('col', { style: { width: '118px' } }),
            h('col', { style: { width: '24%' } }),
            h('col', null),
            h('col', { style: { width: '80px' } }),
            h('col', { style: { width: '158px' } }),
            h('col', { style: { width: '86px' } })
          ),
          h('thead', null, h('tr', null,
            h('th', null, copy.state),
            h('th', null, copy.plugin),
            h('th', null, copy.note),
            h('th', null, copy.group),
            h('th', null, copy.settings),
            h('th', null, copy.installed)
          )),
          h('tbody', null,
            filtered.map((row) => {
              const isBusy = busy === row.packageName;
              return h('tr', {
                key: row.packageName,
                className: 'pd-row',
                onClick: () => setSelected(row),
                title: row.note,
              },
                h('td', null, h('span', { className: 'pd-state' },
                  h('span', { className: 'pd-dot', 'data-on': row.enabled ? 'true' : 'false' }),
                  row.enabled ? copy.on : copy.off,
                  h('button', {
                    type: 'button',
                    className: 'pd-toggle',
                    disabled: isBusy,
                    onClick: (event) => { event.stopPropagation(); void toggle(row); },
                  }, isBusy ? copy.busy : row.enabled ? copy.toggleOff : copy.toggleOn)
                )),
                h('td', null,
                  h('div', { className: 'pd-name' }, row.name),
                  h('div', { className: 'pd-pkg' }, `${row.packageName} · ${row.version}`)
                ),
                h('td', null, h('div', { className: 'pd-note' }, row.note || copy.noNote)),
                h('td', null, h('span', { className: 'pd-pill' }, row.group)),
                h('td', null, h('div', { className: 'pd-config' },
                  h('strong', null, row.settings?.label || '—'),
                  h('small', null, row.settings?.hint || ''),
                  row.settings?.navLabel && h('button', {
                    type: 'button',
                    className: 'pd-open',
                    onClick: (event) => { event.stopPropagation(); void openSettings(row); },
                  }, copy.open)
                )),
                h('td', null, h('span', { className: 'pd-date' }, formatDate(row.installedAt, row.installedAtApproximate)))
              );
            })
          )
        ),
        !loading && !error && filtered.length === 0 && h('div', { className: 'pd-muted' }, copy.empty),
        h('div', { className: 'pd-footer' }, copy.footer),
        selected && h('div', { className: 'pd-overlay', onClick: () => setSelected(null) },
          h('div', { className: 'pd-modal', role: 'dialog', 'aria-modal': 'true', onClick: (event) => event.stopPropagation() },
            h('div', { className: 'pd-modal-head' },
              h('div', null,
                h('h3', null, selected.name),
                h('p', null, `${selected.packageName} · ${selected.version}`)
              ),
              h('button', { type: 'button', className: 'pd-x', onClick: () => setSelected(null) }, copy.close)
            ),
            h('div', { className: 'pd-modal-note' },
              h('div', { style: { marginBottom: 5, color: 'var(--dsw-alias-label-tertiary)' } }, copy.noteEdit),
              h('textarea', {
                className: 'pd-note-edit',
                value: noteDraft,
                rows: 3,
                onChange: (event) => setNoteDraft(event.target.value),
              }),
              h('div', { className: 'pd-note-actions' },
                h('button', {
                  type: 'button',
                  className: 'pd-action',
                  disabled: noteBusy !== '',
                  onClick: () => void saveNote(selected),
                }, noteBusy === 'note' ? copy.busy : copy.save),
                h('button', {
                  type: 'button',
                  className: 'pd-action',
                  disabled: noteBusy !== '',
                  onClick: () => void regenerateNote(selected),
                }, noteBusy === 'ai' ? copy.busy : copy.aiSummary)
              )
            ),
            h('div', { className: 'pd-group-edit' },
              h('b', null, copy.group),
              h('select', {
                className: 'pd-select',
                value: selected.group,
                disabled: noteBusy !== '',
                onChange: (event) => void changeGroup(selected, event.target.value),
              },
                [...new Set([...groups, '未分组'])].map((group) => h('option', { key: group, value: group }, group))
              ),
              h('input', {
                className: 'pd-group-input',
                value: newGroup,
                placeholder: copy.newGroup,
                onChange: (event) => setNewGroup(event.target.value),
              }),
              h('button', {
                type: 'button',
                className: 'pd-action',
                disabled: noteBusy !== '' || newGroup.trim() === '',
                onClick: () => void createGroup(selected),
              }, copy.createGroup)
            ),
            h('div', { className: 'pd-facts' },
              h('b', null, copy.state),
              h('span', null, selected.enabled ? copy.on : copy.off),
              h('b', null, copy.group),
              h('span', null, selected.group),
              h('b', null, copy.installed),
              h('span', null, formatDate(selected.installedAt, selected.installedAtApproximate)),
              h('b', null, copy.source),
              h('span', null, selected.source || '—'),
              h('b', null, copy.rows),
              h('span', null, `${selected.activeRows}/${selected.rows || 0}`),
              h('b', null, copy.entryIds),
              h('span', null, (selected.entryIds || []).join(', ') || '—')
            ),
            h('div', { className: 'pd-actions' },
              h('button', {
                type: 'button',
                className: 'pd-action',
                'data-primary': 'true',
                disabled: busy === selected.packageName,
                onClick: () => void toggle(selected),
              }, busy === selected.packageName ? copy.busy : selected.enabled ? copy.toggleOff : copy.toggleOn),
              selected.settings?.navLabel && h('button', {
                type: 'button',
                className: 'pd-action',
                onClick: () => void openSettings(selected),
              }, copy.open),
              selected.panelId && h('button', {
                type: 'button',
                className: 'pd-action',
                onClick: () => openPanel(selected),
              }, copy.openPanel),
              h('button', {
                type: 'button',
                className: 'pd-action',
                onClick: () => void copyText(selected.packageName).then(() => setNotice(copy.copiedPackage)),
              }, copy.copyPackage),
              h('button', { type: 'button', className: 'pd-action', onClick: () => setSelected(null) }, copy.close)
            )
          )
        ),
        groupManager && h('div', { className: 'pd-overlay', onClick: () => setGroupManager(false) },
          h('div', { className: 'pd-modal', role: 'dialog', 'aria-modal': 'true', onClick: (event) => event.stopPropagation() },
            h('div', { className: 'pd-modal-head' },
              h('div', null, h('h3', null, copy.groupManage), h('p', null, copy.groupManageHint)),
              h('button', { type: 'button', className: 'pd-x', onClick: () => setGroupManager(false) }, copy.close)
            ),
            h('div', { className: 'pd-group-edit', style: { margin: '10px 0 4px' } },
              h('input', {
                className: 'pd-group-input',
                value: managedNewGroup,
                placeholder: copy.newGroup,
                onChange: (event) => setManagedNewGroup(event.target.value),
              }),
              h('button', {
                type: 'button',
                className: 'pd-action',
                disabled: noteBusy !== '' || managedNewGroup.trim() === '',
                onClick: () => void createEmptyGroup(),
              }, copy.createGroupOnly)
            ),
            groups.length === 0
              ? h('div', { className: 'pd-muted' }, copy.empty)
              : h('div', { className: 'pd-side-list', style: { marginTop: 12 } },
                groups.map((group) => group === renameTarget
                  ? h('div', { className: 'pd-side-row', key: group },
                    h('input', {
                      className: 'pd-group-input',
                      value: renameDraft,
                      autoFocus: true,
                      onChange: (event) => setRenameDraft(event.target.value),
                      onKeyDown: (event) => {
                        if (event.key === 'Enter') void commitRename();
                        if (event.key === 'Escape') { setRenameTarget(null); setRenameDraft(''); }
                      },
                    }),
                    h('button', {
                      type: 'button',
                      className: 'pd-side-btn',
                      disabled: noteBusy !== '' || renameDraft.trim() === '',
                      onClick: () => void commitRename(),
                    }, copy.saveGroupName),
                    h('button', {
                      type: 'button',
                      className: 'pd-side-btn',
                      onClick: () => { setRenameTarget(null); setRenameDraft(''); },
                    }, copy.cancel)
                  )
                  : h('div', { className: 'pd-side-row', key: group },
                    h('span', { className: 'pd-side-label' }, `${group} · ${groupCounts.get(group) || 0}`),
                    h('button', {
                      type: 'button',
                      className: 'pd-side-btn',
                      disabled: noteBusy !== '',
                      onClick: () => startRename(group),
                    }, copy.renameGroup),
                    h('button', {
                      type: 'button',
                      className: 'pd-side-btn',
                      disabled: noteBusy !== '',
                      onClick: () => void removeGroup(group),
                    }, copy.deleteGroup)
                  ))
              )
          )
        )
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const listSections = () => (ctx.slots.entries('settings.section') || []).map((entry) => ({
          id: typeof entry?.options?.id === 'string' ? entry.options.id : '',
          label: resolveLabel(entry?.options?.label),
          order: typeof entry?.options?.order === 'number' ? entry.options.order : 0,
        })).filter((entry) => entry.id !== '' && entry.label !== '');
        sectionStore = {
          list: listSections,
          subscribe: (callback) => ctx.slots.subscribe('settings.section', callback),
        };
        const listPanels = () => (ctx.slots.entries('sidebar.panellist') || []).map((entry) => ({
          id: typeof entry?.options?.id === 'string' ? entry.options.id : '',
          label: resolveLabel(entry?.options?.label),
        })).filter((entry) => entry.id !== '');
        panelStore = {
          list: listPanels,
          subscribe: (callback) => ctx.slots.subscribe('sidebar.panellist', callback),
        };
        panelNavigator = (id) => {
          try { ctx.get('layout')?.selectPanel(id); } catch { /* layout is optional */ }
        };
        const controller = createFoldController(listSections);
        foldController = controller;
        ctx.effect(() => {
          controller.mount();
          return () => {
            controller.dispose();
            if (foldController === controller) foldController = null;
            sectionStore = null;
            panelStore = null;
            panelNavigator = null;
          };
        }, 'plugin-overview: persistent fold controller');
        ctx.effect(() => ctx.slots.subscribe('settings.section', () => controller.refresh()), 'plugin-overview: section ledger watch');
        ctx.effect(() => ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'plugin-overview',
          order: 130,
          label: () => (isZh() ? '插件总览' : 'Plugin Dashboard'),
        }, Dashboard)), 'plugin-overview: settings section');
      },
    };
  },
});
