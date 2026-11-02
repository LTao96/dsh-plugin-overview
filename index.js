import { randomUUID } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const SELF_PACKAGE = 'dsh-plugin-overview';
const DATA_ROUTE = '/plugin-overview/data.json';
const TOGGLE_ROUTE = '/plugin-overview/toggle';
const NOTE_ROUTE = '/plugin-overview/note';
const GROUP_ROUTE = '/plugin-overview/group';
const GROUP_DELETE_ROUTE = '/plugin-overview/group/delete';
const GROUP_RENAME_ROUTE = '/plugin-overview/group/rename';
const GROUP_CREATE_ROUTE = '/plugin-overview/group/create';
const SUMMARIZE_ROUTE = '/plugin-overview/summarize';
const SETTINGS_ROUTE = '/plugin-overview/settings';
const DEBUG_ROUTE = '/plugin-overview/debug';
const STATE_VERSION = 1;

const SETTINGS = {
  '@linxin666/dsh-client-ui-skin-center': { label: '皮肤中心', navLabel: '皮肤中心', hint: '设置 → Web 扩展 → 皮肤' },
  '@smalltailqwq/dsh-client-ui-skin-deep-whale-manager': { label: '皮肤管理', navLabel: '皮肤管理', hint: '设置 → 皮肤管理（旧管理器）' },
  'dsh-theme-whalegirl': { label: '插件页', hint: '当前 DSH 没有它的设置卡' },
  'dsh-video-skin': { label: '右下角圆钮', hint: '页面右下角半透明圆钮' },
  'beauticode-dsh': { label: 'beautiCode 工具', hint: '用 beauticode_* 工具设置背景' },
  'dsh-whale-widget': { label: '鲸鱼菜单', hint: '右键/长按右下角鲸鱼' },
  'dsh-persona-switcher': { label: '人设切换', navLabel: '人设切换', hint: '设置 → 人设切换' },
  'dsh-boot-animation': { label: '页脚 🎛', hint: '侧栏页脚片库按钮' },
  '@xmanrui/dsh-im': { label: 'IM机器人', navLabel: 'IM机器人', hint: '设置 → IM机器人' },
  'dsh-wechat': { label: '微信', navLabel: '微信', hint: '设置 → 微信' },
  'dsh-aurabot-qq': { label: '插件页', hint: '设置 → 插件 → Aurabot' },
  'dsh-bili-pond': { label: 'B站鱼塘', navLabel: 'B站鱼塘', hint: '设置 → B站鱼塘' },
  '@weibaohui/dsh-sync': { label: '同步', navLabel: '同步', hint: '设置 → 同步' },
  'dsh-config-transfer': { label: '配置同步', navLabel: '配置同步', hint: '设置 → 配置同步' },
  'dsh-picture-text-reader': { label: '插件页', hint: '通过 xhs_*/gzh_* 工具使用' },
  'dsh-whale-loli': { label: 'Agent 预设', hint: '新会话选择鲸鱼娘预设' },
  'dsh-whalechan-herself': { label: '鲸鱼娘', navLabel: '鲸鱼娘', hint: '设置 → 鲸鱼娘' },
  'dsh-pet-copilot': { label: '无独立设置', hint: '当前已停用' },
  '@iasiv5/dsh-skins': { label: '侧栏切换', hint: '侧栏底部皮肤切换（当前未接线）' },
  '@tr1v3r/dsh-ltm': { label: '无独立设置', hint: '与当前 DSH 版本不兼容' },
  'dshmarket': { label: '插件市场', navLabel: '插件市场', hint: '设置 → 插件市场' },
};

const PANEL_IDS = {
  'dsh-bili-pond': 'dsh-bili-pond',
  'dsh-aurabot-qq': 'aurabot',
  'dsh-plugin-wallpaper-engine': 'wallpaper-engine',
};

const VISUAL_PATTERN = /(^|[-/@])(skin|skins|theme|wallpaper|background|visual)|beauticode|皮肤|主题|壁纸|背景/iu;

function isVisualPackage(name, pkg) {
  const keywords = Array.isArray(pkg?.keywords) ? pkg.keywords : [];
  const text = [name, pkg?.name, pkg?.description, ...keywords].filter(Boolean).join(' ');
  return VISUAL_PATTERN.test(text);
}

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function readPackageLocale(dir) {
  for (const file of ['locale/zh.json', 'locale/zh-CN.json', 'locale/en.json']) {
    const value = readJson(join(dir, file), null);
    if (value?.meta?.title) return value.meta;
  }
  return null;
}

function resolveProfileDir(home) {
  if (process.env.DSH_PROFILE_DIR) return process.env.DSH_PROFILE_DIR;
  if (process.env.DSH_PROFILE) return join(home, 'profiles', process.env.DSH_PROFILE);
  const cwd = process.cwd();
  if (existsSync(join(cwd, 'package.json'))) return cwd;
  return join(home, 'profiles', 'web');
}

function readMarketState(dir) {
  return readJson(join(dir, '.dsh-market', 'state.json'), {});
}

function stateFile(home) {
  return join(home, 'plugin-overview', 'state.json');
}

function legacyStateFiles(home) {
  return [
    join(home, 'plugin-control-center', 'state.json'),
    join(home, 'plugin-dashboard', 'state.json'),
  ];
}

function emptyState() {
  return {
    version: STATE_VERSION,
    settings: { autoSummary: false },
    notes: {},
    groups: {},
    groupOrder: [],
    manualGroups: {},
  };
}

function normalizeState(value) {
  const state = emptyState();
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return state;
  if (value.settings && typeof value.settings === 'object' && !Array.isArray(value.settings)) {
    state.settings.autoSummary = value.settings.autoSummary === true;
  }
  if (value.notes && typeof value.notes === 'object' && !Array.isArray(value.notes)) {
    for (const [name, note] of Object.entries(value.notes)) {
      if (typeof note === 'string') {
        if (note.trim() !== '') state.notes[name] = { text: note.trim(), source: 'seed', updatedAt: new Date().toISOString() };
      } else if (note && typeof note.text === 'string' && note.text.trim() !== '') {
        state.notes[name] = {
          text: note.text.trim().slice(0, 240),
          source: typeof note.source === 'string' ? note.source : 'seed',
          version: typeof note.version === 'string' ? note.version : '',
          updatedAt: typeof note.updatedAt === 'string' ? note.updatedAt : new Date().toISOString(),
        };
      }
    }
  }
  if (value.groups && typeof value.groups === 'object' && !Array.isArray(value.groups)) {
    for (const [name, members] of Object.entries(value.groups)) {
      if (typeof name !== 'string' || name.trim() === '') continue;
      const kept = Array.isArray(members) ? [...new Set(members.filter((item) => typeof item === 'string' && item !== ''))] : [];
      state.groups[name.slice(0, 40)] = kept;
    }
  }
  state.groupOrder = Array.isArray(value.groupOrder)
    ? value.groupOrder.filter((name) => typeof name === 'string' && state.groups[name] !== undefined)
    : [];
  for (const name of Object.keys(state.groups)) if (!state.groupOrder.includes(name)) state.groupOrder.push(name);
  if (value.manualGroups && typeof value.manualGroups === 'object' && !Array.isArray(value.manualGroups)) {
    for (const [name, flag] of Object.entries(value.manualGroups)) if (flag === true) state.manualGroups[name] = true;
  }
  return state;
}

function loadState(home, dir) {
  const path = stateFile(home);
  let own = readJson(path, null);
  if (own === null) {
    for (const legacy of legacyStateFiles(home)) {
      own = readJson(legacy, null);
      if (own !== null) break;
    }
  }
  if (own && own.version === STATE_VERSION) {
    const state = normalizeState(own);
    if (!existsSync(path)) saveState(home, state);
    return state;
  }
  const state = emptyState();
  const market = readMarketState(dir);
  const profile = readJson(join(dir, 'package.json'), {});
  const dependencies = profile.dependencies || {};
  for (const [name, note] of Object.entries(market.notes || {})) {
    if (typeof note !== 'string' || note.trim() === '') continue;
    const pkg = readJson(join(dir, 'node_modules', name, 'package.json'), {});
    state.notes[name] = {
      text: note.trim().slice(0, 240),
      source: 'seed',
      version: typeof pkg.version === 'string' ? pkg.version : '',
      updatedAt: new Date().toISOString(),
    };
  }
  if (market.groups && typeof market.groups === 'object') {
    for (const [name, members] of Object.entries(market.groups)) {
      if (typeof name !== 'string' || name.trim() === '') continue;
      state.groups[name.slice(0, 40)] = Array.isArray(members)
        ? [...new Set(members.filter((item) => typeof item === 'string' && dependencies[item] !== undefined))]
        : [];
    }
    state.groupOrder = Array.isArray(market.groupOrder)
      ? market.groupOrder.filter((name) => state.groups[name] !== undefined)
      : [];
    for (const name of Object.keys(state.groups)) if (!state.groupOrder.includes(name)) state.groupOrder.push(name);
  }
  saveState(home, state);
  return state;
}

function saveState(home, state) {
  const path = stateFile(home);
  const dir = join(home, 'plugin-overview');
  mkdirSync(dir, { recursive: true });
  const temp = join(dir, `state.${process.pid}.${Date.now()}.tmp`);
  writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  renameSync(temp, path);
}

function ensureGroup(state, name) {
  const group = typeof name === 'string' ? name.trim().slice(0, 40) : '';
  if (group === '') return '';
  if (state.groups[group] === undefined) {
    state.groups[group] = [];
    state.groupOrder.push(group);
  }
  return group;
}

function assignGroup(state, name, group, manual) {
  for (const members of Object.values(state.groups)) {
    if (Array.isArray(members)) {
      const index = members.indexOf(name);
      if (index !== -1) members.splice(index, 1);
    }
  }
  const target = ensureGroup(state, group);
  if (target !== '' && target !== '未分组') state.groups[target].push(name);
  if (manual === true) state.manualGroups[name] = true;
}

function groupOf(name, groups) {
  for (const [group, members] of Object.entries(groups || {})) {
    if (Array.isArray(members) && members.includes(name)) return group;
  }
  return '未分组';
}

function readReadme(dir, name) {
  for (const file of ['README.zh.md', 'README.zh-CN.md', 'README.md']) {
    try {
      const text = readFileSync(join(dir, 'node_modules', name, file), 'utf8');
      if (text.trim() !== '') return text.slice(0, 5000);
    } catch {}
  }
  return '';
}

async function askModel(ctx, system, prompt) {
  const llm = ctx.get('llm');
  const selection = ctx.get('agentDefaultModel')?.currentSelection?.();
  if (!llm || typeof llm.stream !== 'function' || !selection?.provider || !selection?.model) return null;
  const messages = [{
    role: 'user',
    id: randomUUID(),
    content: [{ type: 'text', text: prompt }],
    source: { kind: 'plugin', plugin: SELF_PACKAGE },
  }];
  let output = '';
  for await (const chunk of llm.stream({
    provider: selection.provider,
    model: selection.model,
    system,
    messages,
    maxTokens: 180,
    temperature: 0.2,
  })) {
    if (chunk?.type === 'text-delta') output += chunk.text;
    if (chunk?.type === 'finish' && chunk.reason?.kind === 'error') {
      throw new Error(chunk.reason.failure?.message || chunk.reason.failure?.code || 'model error');
    }
  }
  return output.trim();
}

async function summarizePackage(ctx, dir, name, state) {
  const pkg = readJson(join(dir, 'node_modules', name, 'package.json'), {});
  const readme = readReadme(dir, name);
  const groups = state.groupOrder.length > 0 ? state.groupOrder.join('、') : '（暂无，可新建）';
  const prompt = [
    '你在维护一个 DeepSeek Harness 插件清单。',
    `插件包名：${name}`,
    `显示名：${pkg.name || name}`,
    `描述：${pkg.description || '（无）'}`,
    `现有分组：${groups}`,
    `README 节选：${readme || '（无）'}`,
    '请只返回 JSON，不要 Markdown 代码块：',
    '{"summary":"不超过40字的中文一句话，说明它做什么、会影响哪里","group":"从现有分组中选一个；都不合适就新建一个简短分组名"}',
  ].join('\n');
  const output = await askModel(ctx, '你是一个简洁、准确的中文软件目录编辑。只输出 JSON。', prompt);
  if (!output) return null;
  const cleaned = output.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim().slice(0, 120) : '';
  const group = typeof parsed.group === 'string' ? parsed.group.trim().slice(0, 40) : '';
  return summary === '' ? null : { summary, group };
}

let summarizing = false;
async function autoSummarize(ctx, home, dir) {
  if (summarizing) return;
  summarizing = true;
  try {
    const state = loadState(home, dir);
    if (state.settings.autoSummary !== true) return;
    const profile = readJson(join(dir, 'package.json'), {});
    const dependencies = profile.dependencies || {};
    let changed = false;
    for (const name of Object.keys(dependencies)) {
      if (name === SELF_PACKAGE) continue;
      const pkg = readJson(join(dir, 'node_modules', name, 'package.json'), {});
      const version = typeof pkg.version === 'string' ? pkg.version : String(dependencies[name] || '');
      const note = state.notes[name];
      if (note?.source === 'manual') continue;
      if (note?.text && note.version === version) continue;
      try {
        const result = await summarizePackage(ctx, dir, name, state);
        if (result !== null) {
          state.notes[name] = {
            text: result.summary,
            source: 'ai',
            version,
            updatedAt: new Date().toISOString(),
          };
          if (state.manualGroups[name] !== true && result.group !== '') assignGroup(state, name, result.group, false);
        } else if (note === undefined) {
          state.notes[name] = {
            text: String(pkg.description || name).slice(0, 240),
            source: 'fallback',
            version,
            updatedAt: new Date().toISOString(),
          };
        }
        changed = true;
      } catch {
        /* model unavailable for this package; keep whatever note exists */
      }
    }
    if (changed) saveState(home, state);
  } finally {
    summarizing = false;
  }
}

function normalizeEnabled(bundle, rowEntries, singleEntry) {
  if (rowEntries.length > 0) return rowEntries.some((row) => row.enabled !== false);
  if (singleEntry !== undefined) return singleEntry.enabled !== false;
  return bundle?.enabled !== false;
}

function installedAt(pkgDir) {
  try {
    const link = lstatSync(pkgDir).isSymbolicLink();
    const stat = statSync(pkgDir);
    const time = stat.birthtimeMs || stat.ctimeMs;
    return { iso: new Date(time).toISOString(), approximate: link };
  } catch {
    return { iso: null, approximate: false };
  }
}

async function buildData(ctx) {
  const home = process.env.DSH_HOME || join(homedir(), '.dsh');
  const dir = resolveProfileDir(home);
  const profile = readJson(join(dir, 'package.json'), {});
  const profileBundles = new Set(Array.isArray(profile.dsh?.profile?.bundles) ? profile.dsh.profile.bundles : []);
  const state = loadState(home, dir);
  const notes = state.notes;
  const groups = state.groups;
  const groupOrder = state.groupOrder;
  const [plugins, bundles] = await Promise.all([
    ctx.pluginManager.listPlugins(),
    ctx.pluginManager.listBundles(),
  ]);
  const bundleByName = new Map((bundles || []).map((bundle) => [bundle.name, bundle]));
  const pluginByModule = new Map();
  for (const entry of plugins || []) {
    if (entry.moduleName) pluginByModule.set(entry.moduleName, entry);
    if (entry.name) pluginByModule.set(entry.name, entry);
  }
  const dependencies = profile.dependencies || {};
  const rows = Object.keys(dependencies)
    .filter((name) => name !== SELF_PACKAGE)
    .map((name) => {
      const pkgDir = join(dir, 'node_modules', name);
      const pkg = readJson(join(pkgDir, 'package.json'), {});
      const bundle = bundleByName.get(name);
      const rowEntries = (bundle?.rows || [])
        .map((row) => pluginByModule.get(row.moduleName) || pluginByModule.get(row.name))
        .filter(Boolean);
      const singleEntry = pluginByModule.get(name);
      const entries = rowEntries.length > 0 ? rowEntries : singleEntry ? [singleEntry] : [];
      const failed = entries.some((entry) => entry.fiberPhase === 'failed');
      const running = entries.some((entry) => entry.enabled !== false && entry.fiberPhase === 'active');
      const meta = readPackageLocale(pkgDir);
      const noteEntry = notes[name];
      const note = typeof noteEntry?.text === 'string' && noteEntry.text.trim() !== '' ? noteEntry.text : '';
      const summary = note || pkg.description || bundle?.description || '';
      const when = installedAt(pkgDir);
      return {
        id: name,
        name: meta?.title || name,
        packageName: name,
        version: bundle?.version || pkg.version || dependencies[name] || '',
        enabled: normalizeEnabled(bundle, rowEntries, singleEntry),
        visual: isVisualPackage(name, pkg),
        failed,
        running,
        inBundles: name.startsWith('@deepseek-ai/') || profileBundles.has(name),
        fiberPhase: entries.find((entry) => entry.fiberPhase)?.fiberPhase || null,
        group: groupOf(name, groups),
        note: summary,
        noteSource: note ? (noteEntry?.source || 'seed') : 'package',
        settings: SETTINGS[name] || { label: '插件页', hint: '设置 → 插件' },
        source: dependencies[name] || '',
        panelId: PANEL_IDS[name] || null,
        entryIds: entries.map((entry) => entry.entryId).filter(Boolean),
        installedAt: when.iso,
        installedAtApproximate: when.approximate,
        rows: rowEntries.length,
        activeRows: rowEntries.filter((row) => row.enabled !== false).length,
      };
    });
  const rank = new Map(groupOrder.map((group, index) => [group, index]));
  rows.sort((left, right) => {
    const groupDelta = (rank.get(left.group) ?? 999) - (rank.get(right.group) ?? 999);
    if (groupDelta !== 0) return groupDelta;
    if (left.enabled !== right.enabled) return left.enabled ? -1 : 1;
    return left.name.localeCompare(right.name, 'zh-CN');
  });
  const health = [];
  for (const row of rows) {
    if (row.failed) {
      health.push({
        id: `runtime-failed:${row.packageName}`,
        severity: 'error',
        type: 'runtime',
        packageName: row.packageName,
        name: row.name,
        message: '运行状态为 failed，插件可能没有正常挂载',
      });
    } else if (row.enabled && !row.running) {
      health.push({
        id: `runtime-inactive:${row.packageName}`,
        severity: 'warn',
        type: 'runtime',
        packageName: row.packageName,
        name: row.name,
        message: '已启用但没有 active 的 Loader 行',
      });
    }
    if (!row.inBundles) {
      health.push({
        id: `wiring:${row.packageName}`,
        severity: 'warn',
        type: 'wiring',
        packageName: row.packageName,
        name: row.name,
        message: '已安装，但不在当前 profile 的 bundles 列表中',
      });
    }
  }
  const activeVisual = rows.filter((row) => row.enabled && row.visual);
  if (activeVisual.length > 1) {
    health.push({
      id: 'visual-conflict',
      severity: 'warn',
      type: 'visual',
      packageName: null,
      name: '视觉层',
      message: `${activeVisual.length} 个皮肤/背景/视觉插件同时启用：${activeVisual.map((row) => row.name).join('、')}`,
      packages: activeVisual.map((row) => row.packageName),
    });
  }
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    profile: process.env.DSH_PROFILE || dir.split(/[\\/]/).pop() || 'profile',
    groups: state.groupOrder,
    settings: state.settings,
    health,
    rows,
  };
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function togglePlugin(ctx, request) {
  const body = JSON.parse(await readBody(request));
  const packageName = body?.packageName;
  const enabled = body?.enabled === true;
  if (typeof packageName !== 'string' || packageName === '') throw new Error('packageName required');
  const home = process.env.DSH_HOME || join(homedir(), '.dsh');
  const dir = resolveProfileDir(home);
  const profile = readJson(join(dir, 'package.json'), {});
  if (profile.dependencies?.[packageName] === undefined) throw new Error(`not an installed dependency: ${packageName}`);
  const bundles = await ctx.pluginManager.listBundles();
  const bundle = (bundles || []).find((item) => item.name === packageName);
  let result;
  if (bundle !== undefined) {
    result = await ctx.pluginManager.setBundleEnabled(packageName, enabled);
  } else {
    const plugins = await ctx.pluginManager.listPlugins();
    const ids = (plugins || [])
      .filter((entry) => entry.moduleName === packageName || entry.name === packageName)
      .map((entry) => entry.entryId)
      .filter(Boolean);
    if (ids.length === 0) throw new Error(`no loader entries for ${packageName}`);
    for (const id of ids) result = await ctx.pluginManager.setPluginEnabled(id, enabled);
  }
  return {
    application: result?.application,
    changed: result?.changed,
    warnings: result?.warnings,
  };
}

function assertDependency(dir, packageName) {
  const profile = readJson(join(dir, 'package.json'), {});
  if (typeof packageName !== 'string' || packageName === '' || profile.dependencies?.[packageName] === undefined) {
    throw new Error(`not an installed dependency: ${packageName}`);
  }
  return profile;
}

async function setSettings(home, dir, request) {
  const body = JSON.parse(await readBody(request));
  const state = loadState(home, dir);
  state.settings.autoSummary = body?.autoSummary === true;
  saveState(home, state);
  return state.settings;
}

async function setNote(home, dir, request) {
  const body = JSON.parse(await readBody(request));
  const packageName = body?.packageName;
  assertDependency(dir, packageName);
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 240) : '';
  const state = loadState(home, dir);
  const pkg = readJson(join(dir, 'node_modules', packageName, 'package.json'), {});
  state.notes[packageName] = {
    text,
    source: 'manual',
    version: typeof pkg.version === 'string' ? pkg.version : '',
    updatedAt: new Date().toISOString(),
  };
  saveState(home, state);
  return state.notes[packageName];
}

async function setGroup(home, dir, request) {
  const body = JSON.parse(await readBody(request));
  const packageName = body?.packageName;
  assertDependency(dir, packageName);
  const state = loadState(home, dir);
  const group = typeof body?.group === 'string' ? body.group.trim().slice(0, 40) : '';
  assignGroup(state, packageName, group === '' ? '未分组' : group, true);
  saveState(home, state);
  return groupOf(packageName, state.groups);
}

async function deleteGroup(home, dir, request) {
  const body = JSON.parse(await readBody(request));
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (name === '' || name === '未分组') throw new Error('group name required');
  const state = loadState(home, dir);
  if (state.groups[name] === undefined) throw new Error(`group not found: ${name}`);
  const members = Array.isArray(state.groups[name]) ? [...state.groups[name]] : [];
  for (const packageName of members) assignGroup(state, packageName, '未分组', true);
  delete state.groups[name];
  state.groupOrder = state.groupOrder.filter((group) => group !== name);
  saveState(home, state);
  return { deleted: name, moved: members.length, groups: state.groupOrder };
}

async function renameGroup(home, dir, request) {
  const body = JSON.parse(await readBody(request));
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const newName = typeof body?.newName === 'string' ? body.newName.trim().slice(0, 40) : '';
  if (name === '' || newName === '' || name === '未分组' || newName === '未分组') throw new Error('group name required');
  const state = loadState(home, dir);
  if (state.groups[name] === undefined) throw new Error(`group not found: ${name}`);
  if (newName !== name && state.groups[newName] !== undefined) throw new Error(`group already exists: ${newName}`);
  state.groups[newName] = state.groups[name];
  delete state.groups[name];
  state.groupOrder = state.groupOrder.map((group) => group === name ? newName : group);
  saveState(home, state);
  return { renamed: name, to: newName, groups: state.groupOrder };
}

async function createGroup(home, dir, request) {
  const body = JSON.parse(await readBody(request));
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 40) : '';
  if (name === '' || name === '未分组') throw new Error('group name required');
  const state = loadState(home, dir);
  if (state.groups[name] !== undefined) throw new Error(`group already exists: ${name}`);
  ensureGroup(state, name);
  saveState(home, state);
  return { created: name, groups: state.groupOrder };
}

async function summarizeOne(ctx, home, dir, request) {
  const body = JSON.parse(await readBody(request));
  const packageName = body?.packageName;
  assertDependency(dir, packageName);
  const state = loadState(home, dir);
  const pkg = readJson(join(dir, 'node_modules', packageName, 'package.json'), {});
  const result = await summarizePackage(ctx, dir, packageName, state);
  if (result === null) throw new Error('model unavailable or returned no summary');
  state.notes[packageName] = {
    text: result.summary,
    source: 'ai',
    version: typeof pkg.version === 'string' ? pkg.version : '',
    updatedAt: new Date().toISOString(),
  };
  if (state.manualGroups[packageName] !== true && result.group !== '') assignGroup(state, packageName, result.group, false);
  saveState(home, state);
  return { note: state.notes[packageName], group: groupOf(packageName, state.groups) };
}

export const inject = ['webServer', 'pluginManager'];

export function apply(ctx) {
  ctx.effect(() => {
    const disposers = [];
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: DATA_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'GET') {
          response.writeHead(405, { allow: 'GET' });
          response.end();
          return;
        }
        try {
          sendJson(response, 200, await buildData(ctx));
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: TOGGLE_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          sendJson(response, 200, { ok: true, result: await togglePlugin(ctx, request) });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: NOTE_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          const home = process.env.DSH_HOME || join(homedir(), '.dsh');
          sendJson(response, 200, { ok: true, note: await setNote(home, resolveProfileDir(home), request) });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: GROUP_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          const home = process.env.DSH_HOME || join(homedir(), '.dsh');
          sendJson(response, 200, { ok: true, group: await setGroup(home, resolveProfileDir(home), request) });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: GROUP_DELETE_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          const home = process.env.DSH_HOME || join(homedir(), '.dsh');
          sendJson(response, 200, { ok: true, result: await deleteGroup(home, resolveProfileDir(home), request) });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: GROUP_RENAME_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          const home = process.env.DSH_HOME || join(homedir(), '.dsh');
          sendJson(response, 200, { ok: true, result: await renameGroup(home, resolveProfileDir(home), request) });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: GROUP_CREATE_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          const home = process.env.DSH_HOME || join(homedir(), '.dsh');
          sendJson(response, 200, { ok: true, result: await createGroup(home, resolveProfileDir(home), request) });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: SETTINGS_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          const home = process.env.DSH_HOME || join(homedir(), '.dsh');
          sendJson(response, 200, { ok: true, settings: await setSettings(home, resolveProfileDir(home), request) });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: SUMMARIZE_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          const home = process.env.DSH_HOME || join(homedir(), '.dsh');
          sendJson(response, 200, { ok: true, ...(await summarizeOne(ctx, home, resolveProfileDir(home), request)) });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    disposers.push(ctx.webServer.register({
      kind: 'exact',
      path: DEBUG_ROUTE,
      handler: async (request, response) => {
        if (request.method !== 'POST') {
          response.writeHead(405, { allow: 'POST' });
          response.end();
          return;
        }
        try {
          const body = JSON.parse(await readBody(request));
          const home = process.env.DSH_HOME || join(homedir(), '.dsh');
          mkdirSync(home, { recursive: true });
          writeFileSync(join(home, 'plugin-overview-debug.json'), JSON.stringify({
            at: new Date().toISOString(),
            nav: Array.isArray(body?.nav) ? body.nav.slice(0, 200) : [],
          }, null, 2));
          sendJson(response, 200, { ok: true });
        } catch (error) {
          sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
        }
      },
    }));
    return () => {
      for (const dispose of disposers) dispose();
    };
  }, 'plugin-overview: routes');

  ctx.effect(() => {
    const home = process.env.DSH_HOME || join(homedir(), '.dsh');
    const dir = resolveProfileDir(home);
    let timer = setTimeout(() => { void autoSummarize(ctx, home, dir); }, 3000);
    let debounce;
    const off = typeof ctx.on === 'function'
      ? ctx.on('plugin-manager/changed', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => { void autoSummarize(ctx, home, dir); }, 2500);
      })
      : () => {};
    return () => {
      clearTimeout(timer);
      clearTimeout(debounce);
      off();
    };
  }, 'plugin-overview: auto summaries');
}

export { emptyState, isVisualPackage, normalizeState };
