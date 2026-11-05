# dsh-plugin-overview v0.2.2

修复插件启停后列表状态不更新的问题。

## 修复

- 当 bundle 已禁用时，不再被 Loader 行残留的 `enabled: true` 覆盖
- 禁用后 `activeRows` 正确归零
- 再次启用时可以正常恢复显示
- 启停后等待加载器状态稳定再刷新列表，避免连续点击发错方向

## 安装

```bash
dsh plugin --profile <profile> add dsh-plugin-overview@0.2.2
```

重启 DSH，打开 设置 → 插件总览。

## 验证

- `node:test` 4 项通过
- 在 `dsh-config-transfer` 上实测：
  - 关闭：`enabled=false`，`activeRows=0/0`
  - 再启用：`enabled=true`，`activeRows=1/1`
