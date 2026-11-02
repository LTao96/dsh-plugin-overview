# dsh-plugin-overview v0.2.0

首个公开版本。

## 安装

```bash
dsh plugin --profile <profile> add dsh-plugin-overview
```

npm：https://www.npmjs.com/package/dsh-plugin-overview

安装后重启 DSH，打开 设置 → 插件总览。

## 功能

- 已安装插件清单，含版本、状态、安装时间和 Loader 行数
- 一句话备注，可手动编辑；手动备注不会被 AI 覆盖
- 插件分组：新建、重命名、删除、移动
- 安装/更新时可选的 AI 总结（默认关闭）
- 一键启用/禁用插件
- 打开插件的设置页或主面板
- 第一层健康诊断：
  - 运行状态 failed
  - 已启用但没有 active Loader 行
  - 已安装但不在 `dsh.profile.bundles`
  - 多个视觉/背景插件冲突
  - 设置页无法匹配
- 设置页收纳：第三方设置项可折叠，当前设置页始终可见
- 主侧栏顺序调整（基于实时 `sidebar.panellist`）
- 状态保存在 `$DSH_HOME/plugin-overview/state.json`，兼容旧状态迁移

## 说明

- 不是插件市场，不负责安装/升级/卸载
- 不依赖 `dshmarket`
- 自动 AI 总结默认关闭，避免安装时产生额外模型调用
- 与 `dsh-settings-nav-organizer` 的设置导航折叠功能重叠，建议只启用其中一个

## 验证

- `node:test` 3 项通过
- 干净 profile 从 npm 安装后，`dsh --dump-config` 能展开 `plugin-overview`
- npm 包包含中英文 README
