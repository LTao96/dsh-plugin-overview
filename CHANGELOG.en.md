# Changelog

[简体中文](./CHANGELOG.md) · **English**

## 0.2.0

- Renamed the package to `dsh-plugin-overview`.
- Added publish metadata, MIT license, and a compatibility range for DSH
  0.2.1-rc.x.
- Moved state to `$DSH_HOME/plugin-overview/state.json`; on first start the old
  `$DSH_HOME/plugin-control-center/state.json` or
  `$DSH_HOME/plugin-dashboard/state.json` is imported once.
- State writes now use a temporary file and atomic rename.
- Automatic AI summaries on install/update are off by default; enable them from
  the header.
- New isolated API namespace `/plugin-overview/*`.
- Main-panel shortcuts and main-sidebar order now resolve from the live
  `sidebar.panellist` ledger instead of hardcoded Bilibili/Aurabot anchors.
- Visual-conflict detection uses package names/descriptions/keywords instead of
  a fixed package list.
- Group rename uses an inline editor instead of `window.prompt`.
- Added `node:test` coverage for state normalization and visual detection.
- Verified installation into an isolated empty profile with
  `dsh plugin --profile smoke add` and `dsh --dump-config`.
