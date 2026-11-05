# 更新记录

**简体中文** · [English](./CHANGELOG.en.md)

## 0.2.2

- 修复 bundle 启停后状态显示不更新的问题。
- bundle 已禁用时不再被 Loader 行的旧 `enabled` 状态覆盖。
- 禁用后 `activeRows` 归零；再次启用可以正确恢复。
- 启停后等待加载器状态稳定再刷新列表。

## 0.2.1

- 首页补充安装命令和 npm 链接。
- 补齐中英文 README / CHANGELOG。
- 增加 GitHub 与 npm 发布指南。

## 0.2.0

- 包名改为 `dsh-plugin-overview`。
- 补齐发布元数据、MIT 许可和 DSH 0.2.1-rc.x 的兼容范围。
- 状态迁移到 `$DSH_HOME/plugin-overview/state.json`；如果存在旧的
  `$DSH_HOME/plugin-control-center/state.json` 或
  `$DSH_HOME/plugin-dashboard/state.json`，首次启动会自动导入一次。
- 状态写入改为先写临时文件再原子替换。
- 安装/更新时的自动 AI 总结默认关闭，可在标题栏手动开启。
- 使用独立的 API 命名空间 `/plugin-overview/*`。
- 主面板入口和主侧栏顺序改为读取实时 `sidebar.panellist` 台账，
  不再写死 B站/Aurabot 等锚点。
- 视觉冲突检测改为根据包名、描述和 keywords 识别，不再依赖固定包名列表。
- 分组重命名改为内置输入框，不再使用 `window.prompt`。
- 增加 `node:test` 测试，覆盖状态归一化和视觉插件识别。
- 使用隔离的空 profile 验证过
  `dsh plugin --profile smoke add` 和 `dsh --dump-config`。
