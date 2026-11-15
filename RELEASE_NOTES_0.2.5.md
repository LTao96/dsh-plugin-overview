# dsh-plugin-overview v0.2.5

主侧栏顺序与隐藏修复。

## 修复

- 上移/下移同时应用 CSS `order` 和真实 DOM 重排
- 隐藏入口时同时隐藏包裹层和内部按钮
- 使用 `display: none !important`，避免被宿主样式覆盖
- 恢复默认会清理两层样式和本地存储
- 「诊断侧栏」记录更完整的包裹层/按钮结构

## 安装

```bash
dsh plugin --profile <profile> add dsh-plugin-overview@0.2.5
```

## 验证

- `node:test` 4 项通过
- 主侧栏列表只包含真实面板入口
- 恢复默认和诊断入口保留
