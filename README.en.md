# dsh-plugin-overview

[简体中文](./README.md) · **English**

A local overview for installed DeepSeek Harness plugins: one row per profile
dependency, with a one-line note, group, status, install date, enable/disable,
settings shortcut and first-layer health checks.

It is **not a marketplace** and does not install, upgrade or uninstall
packages. Those operations stay with `dshmarket` or the official plugin
manager.

## Where it appears

Settings → **插件总览** (order 130).

## Features

- Lists the current profile's installed dependencies, sorted by the overview's
  own group order and name.
- Notes, groups and their order live in
  `$DSH_HOME/plugin-overview/state.json`. On first start it tries to import the
  old `$DSH_HOME/plugin-control-center/state.json` or
  `$DSH_HOME/plugin-dashboard/state.json`.
- Notes can be edited in the detail panel. A manual note (`source: manual`) is
  never overwritten by AI.
- Automatic AI summary on install/update is **off by default**. Turn on
  “安装时 AI 总结” in the header to let the Host ask the current default model
  for `{summary, group}` once per new version. Model failures fall back to the
  package description and do not block install. The manual “AI 重新总结” action
  always works.
- The detail panel can create groups and move a plugin. “分组管理” can create,
  rename or delete a group; deleting moves its plugins to “未分组” and marks
  them manual so AI will not reassign them.
- Status and version come from the Host `pluginManager` service.
- Install date is the package directory birth time; linked packages are marked
  with `≈`. pnpm reinstall/migration can refresh it, so it is approximate.
- Click a row for a detail panel: version, source, install time, loader rows,
  notes, enable/disable, open settings and (when mapped) open main panel.
- “健康诊断” is read-only first-layer static checks: failed/inactive runtime
  rows, packages absent from `dsh.profile.bundles`, multiple visual/background
  plugins enabled (detected from package names/descriptions/keywords), and
  settings-target labels that the live `settings.section` ledger cannot
  resolve. It reports issues and opens details; it does not auto-repair or
  uninstall.
- The status cell can enable/disable the whole bundle through
  `pluginManager.setBundleEnabled` (falling back to `setPluginEnabled` when no
  bundle row exists).
- “打开” clicks the matching settings nav item inside the settings nav, not a
  same-named button elsewhere; if it cannot find one, it copies the hint path.
  DSH has no public settings deep-link API.
- Optional “收纳第三方设置项”: reads the live `settings.section` slot ledger
  (`ctx.slots.entries` + `ctx.slots.subscribe`), lists every third-party
  settings page, and lets each one be checked (folded) or unchecked
  (released). The controller keeps the current section visible even when
  folded and restores when the toggle is off or the plugin is disposed.
- Plugin search also indexes `settings.label`, `settings.navLabel`,
  `settings.sectionId` and the settings hint.
- Main-panel shortcuts auto-match the live `sidebar.panellist` ledger; a small
  `PANEL_IDS` fallback covers known panels that do not expose a sidebar entry.
- “主侧栏顺序” moves direct panel buttons in the main sidebar up/down with CSS
  `order`, persisted in localStorage. The nav container is recognized from the
  live `sidebar.panellist` labels; if no labels match, the control is hidden.

## Install

```bash
dsh plugin --profile <profile> add dsh-plugin-overview
```

Restart DSH, then open Settings → 插件总览.

## Development

No build step. The Host half registers `/plugin-overview/*` routes; the Client
half registers a `settings.section` page.

```bash
node --check index.js
node --check client.js
npm test
```

Or install a workspace checkout with the in-app plugin manager. A clean profile
check can use a temporary `DSH_HOME` so it does not touch the real profile:

```bash
DSH_HOME=/tmp/dsh-smoke dsh plugin --profile smoke add <absolute-package-path>
DSH_HOME=/tmp/dsh-smoke dsh --profile smoke --dump-config
```

## License

MIT.
