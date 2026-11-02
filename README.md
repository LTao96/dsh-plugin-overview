# dsh-plugin-overview

**简体中文** · [English](./README.en.md)

一个面向 **DeepSeek Harness 已安装插件** 的本地总览面板：每个 profile 依赖占一行，集中显示一句话备注、分组、状态、安装时间、启停按钮、设置入口和第一层健康检查。

它**不是插件市场**，也不负责安装、升级或卸载插件。这些操作仍然交给 `dshmarket` 或官方插件管理器。

## 安装

```bash
dsh plugin --profile <profile> add dsh-plugin-overview
```

npm 页面：https://www.npmjs.com/package/dsh-plugin-overview

安装后重启 DSH，在 设置 → 插件总览 打开。

## 入口位置

设置 → **插件总览**（order 130）。

## 功能

- 列出当前 profile 的已安装依赖，按总览自己的分组顺序和名称排序。
- 备注、分组和分组顺序保存在
  `$DSH_HOME/plugin-overview/state.json`。首次启动时会尝试导入旧的
  `$DSH_HOME/plugin-control-center/state.json` 或
  `$DSH_HOME/plugin-dashboard/state.json`。
- 备注可以在详情面板里直接编辑。手动备注（`source: manual`）不会被 AI 覆盖。
- 安装/更新时的自动 AI 总结**默认关闭**。需要在标题栏勾选「安装时 AI 总结」，
  Host 才会在新版本出现时向当前默认模型请求一次 `{summary, group}`。
  模型失败时回退到包描述，不会阻塞安装。手动点击「AI 重新总结」始终可用。
- 详情面板可以新建分组并移动插件。「分组管理」支持新建、重命名和删除分组；
  删除分组时，组内插件会移到「未分组」，并标记为手动分组，之后 AI 不会自动挪动它们。
- 状态和版本来自 Host 的 `pluginManager` 服务。
- 安装时间取包目录的创建时间；软链接安装会标记 `≈`。pnpm 重装/迁移可能刷新该时间，
  所以它是近似值。
- 点击任意一行打开详情：版本、来源、安装时间、Loader 行、备注、启停、
  打开设置，以及（匹配到主面板时）打开主面板。
- 「健康诊断」是只读的第一层静态检查，包括：运行状态为 failed、已启用但没有
  active 的 Loader 行、已安装但不在 `dsh.profile.bundles` 中、多个皮肤/背景/
  视觉类插件同时启用（按包名、描述和 keywords 识别），以及设置入口指向了
  `settings.section` 台账中不存在的页面。它只报告问题并打开详情，不会自动修复或卸载。
- 状态单元格可以通过 `pluginManager.setBundleEnabled` 启停整个 bundle；
  没有 bundle 行时回退到 `setPluginEnabled`。
- 「打开」会在设置导航内部点击匹配项，不会误点其它位置的同名按钮；
  找不到时复制提示路径。DSH 目前没有公开的设置深链接 API。
- 可选的「收纳第三方设置项」：读取实时的 `settings.section` 槽位台账
  （`ctx.slots.entries` + `ctx.slots.subscribe`），列出所有第三方设置页，
  可以逐项勾选（收纳）或取消（放出）。控制器会在切换设置页后继续生效，
  并且当前打开的设置页即使被收纳也保持可见；关闭开关或插件销毁时恢复。
- 插件搜索同时索引 `settings.label`、`settings.navLabel`、`settings.sectionId`
  和设置提示。
- 主面板入口会自动匹配实时的 `sidebar.panellist` 台账；少量已知面板通过
  `PANEL_IDS` 作为兜底，用于没有暴露侧栏入口的插件。
- 「主侧栏顺序」通过 CSS `order` 上下移动主侧栏的直连面板按钮，顺序保存在
  localStorage。导航容器通过 `sidebar.panellist` 的实时标签识别；匹配不到时隐藏该控件。

## 开发

没有构建步骤。Host 半部分注册 `/plugin-overview/*` 路由；Client 半部分注册一个
`settings.section` 设置页。

```bash
node --check index.js
node --check client.js
npm test
```

也可以用应用内的插件管理器安装工作区目录。干净 profile 验证建议使用临时
`DSH_HOME`，避免影响真实 profile：

```bash
DSH_HOME=/tmp/dsh-smoke dsh plugin --profile smoke add <插件目录绝对路径>
DSH_HOME=/tmp/dsh-smoke dsh --profile smoke --dump-config
```

## 许可

MIT。
