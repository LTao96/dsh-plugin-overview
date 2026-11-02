# 提交到 DSH 插件目录

`dshfind` 和 `dshmarket` 的插件索引来自
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
目录。提交一次目录 PR，通常就能被这些下游索引收录。

## 前置条件

- 仓库创建满 **1 天**
- `package.json` 声明了 `dsh.bundle`
- 仓库有真实可用代码，不是 README-only 占位
- 仓库添加 `dsh-plugin` topic
- 一个 PR 最多添加 3 个条目

## 提交文件

Fork `awesome-dsh-plugin`，在以下路径新增一个文件：

```text
data/plugins/LTao96__dsh-plugin-overview.yml
```

内容使用本仓库的 [awesome-dsh-plugin.yml](./awesome-dsh-plugin.yml)：

```yaml
url: https://github.com/LTao96/dsh-plugin-overview
name: LTao96/dsh-plugin-overview
category: ui
description:
  en: 'Local overview for installed DSH plugins with notes, groups, health checks and settings shortcuts.'
  zh: '本地插件总览：备注、分组、健康检查、启停和设置入口。'
```

然后向 `awesome-dsh-plugin` 提交 PR。

两个 README 是由 `data/plugins/*.yml` 自动生成的，**不要手改 README**。

## 提交后

- PR 合并后，网站和索引会自动重建
- dshfind 通常会自动同步该目录
- dshmarket 的索引也读取该目录
- 新版本不需要重新提交条目；但描述需要更新时，改同一个 YAML 文件

## 当前状态

- GitHub 仓库已创建
- npm `dsh-plugin-overview@0.2.0` 已发布
- 等仓库满 1 天后提交 PR
