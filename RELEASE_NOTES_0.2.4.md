# dsh-plugin-overview v0.2.4

修复主侧栏识别错误。

## 修复

- 设置侧栏的几十个入口不会再被当成主侧栏
- 只关联 `sidebar.panellist` 下真实存在的面板入口
- 候选容器限制为 2-20 个按钮
- 找不到主侧栏时仍然可以点「恢复默认」，不会因为误隐藏而无法恢复

## 安装

```bash
dsh plugin --profile <profile> add dsh-plugin-overview@0.2.4
```

## 验证

- `node:test` 4 项通过
- 主侧栏数量不再出现 93 这种设置页条目
