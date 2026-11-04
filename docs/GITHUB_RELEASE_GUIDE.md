# GitHub 上传与发布完整指南

本文以 `dsh-plugin-overview` 为例，说明从本地代码到 GitHub 仓库、Tag、Release，以及提交到 DSH 插件目录的完整流程。

- 仓库：https://github.com/LTao96/dsh-plugin-overview
- 包名：`dsh-plugin-overview`
- 当前版本：`0.2.1`

## 1. 先理解几个对象

| 对象 | 作用 |
|---|---|
| GitHub 仓库 | 保存源代码、提交历史、Issue、Release |
| Git commit | 一次本地快照，记录“改了什么” |
| Git tag | 给某个 commit 起一个版本名，例如 `v0.2.1` |
| GitHub Release | 面向用户的发布页面，可以挂说明和附件 |
| npm 包 | 用户实际通过 `dsh plugin add` 安装的东西 |
| awesome-dsh-plugin | DSH 插件目录，dshfind / dshmarket 读取它 |

关键区别：

- GitHub 是**代码托管**
- npm 是**包分发**
- GitHub Release 是**发布说明页**
- 三者互相独立，但通常一起更新

## 本次操作记录（2026-11-03）

- 仓库 Description 已更新为：
  `本地已装插件总览：不下载插件，和插件市场搭配；一键收纳第三方插件设置，AI 整理备注与分组，配合健康诊断和启停，让插件不再乱而不知。`
- Website 已设置：
  `https://www.npmjs.com/package/dsh-plugin-overview`
- Topics 已设置：
  `dsh-plugin`、`deepseek-harness`、`dsh`、`plugin-manager`
- `v0.2.0` Release 已存在，标题和正文已补全
- `v0.2.1` tag 和 Release 已创建
- 本地与 `origin/main` 已同步
- 初始目录 PR 已合并：
  https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/11613
- 说明更新 PR 已提交：
  https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/11911
- 等待说明更新 PR 的 CI 和维护者审核

## 2. 首次上传

### 2.1 创建 GitHub 仓库

在 GitHub 新建一个 **public** 空仓库：

```text
https://github.com/LTao96/dsh-plugin-overview
```

建议：

- 不要勾选自动生成 README
- 不要勾选 .gitignore
- 不要勾选 license
- 仓库名最好和 npm 包名一致

### 2.2 本地初始化

在项目目录执行：

```powershell
cd E:\DeepSeek_Data\plugin\plugin-overview
git init
git branch -M main
git remote add origin https://github.com/LTao96/dsh-plugin-overview.git
```

作用：

- `git init`：创建 `.git` 目录，开始版本管理
- `git branch -M main`：把默认分支改名为 `main`
- `git remote add origin`：把本地仓库关联到 GitHub

### 2.3 忽略不该上传的文件

项目根目录的 `.gitignore` 应包含：

```gitignore
node_modules/
.smoke-*/
*.tgz
```

作用：

- 不提交依赖目录
- 不提交临时 smoke profile
- 不提交 npm 打包产物

### 2.4 提交并推送

```powershell
git add .
git status --short
git commit -m "Initial dsh-plugin-overview"
git push -u origin main
```

作用：

- `git add .`：把工作区改动放入暂存区
- `git status --short`：确认将要提交哪些文件
- `git commit`：生成本地提交
- `git push`：把提交上传到 GitHub

`-u` 会建立本地 `main` 和远程 `origin/main` 的跟踪关系，以后直接 `git push` 即可。

### 2.5 检查是否真的推上去了

```powershell
git status -sb
git rev-parse HEAD
git rev-parse origin/main
```

两个 hash 相同，说明本地和远程一致。

### 2.6 仓库元数据：Description、Website、Topics

这三项不影响代码，但影响别人能否发现和理解仓库。

#### Description

```text
本地插件总览：备注、分组、健康检查、启停和设置入口。
```

作用：仓库首页和搜索结果里的一句话介绍。

#### Website

```text
https://www.npmjs.com/package/dsh-plugin-overview
```

作用：把 GitHub 仓库和 npm 包关联起来，用户不用自己找。

#### Topics

建议：

```text
dsh-plugin
deepseek-harness
dsh
plugin-manager
```

其中 **`dsh-plugin` 必须是单数，且完全一致**。

作用：

- GitHub 的话题搜索
- `awesome-dsh-plugin` 目录的识别要求
- dshfind / dshmarket 的自动发现

不要选：

```text
dsh-plugins
dsh-plugin-market
dsh-plugin-desktop
```

这些是其它话题，不是目录要求的标准 topic。

#### 网页操作

```text
仓库首页 → 右侧 About 齿轮 → Edit repository details
```

填写 Description、Website、Topics，然后 Save changes。

#### API 操作

更新仓库描述和主页：

```http
PATCH /repos/LTao96/dsh-plugin-overview
```

```json
{
  "description": "本地插件总览：备注、分组、健康检查、启停和设置入口。",
  "homepage": "https://www.npmjs.com/package/dsh-plugin-overview"
}
```

更新 Topics 不是用 PATCH，而是专用端点：

```http
PUT /repos/LTao96/dsh-plugin-overview/topics
```

```json
{
  "names": ["dsh-plugin", "deepseek-harness", "dsh", "plugin-manager"]
}
```

注意：

- 用 `PATCH /repos/...` 传 `topics` 可能返回 200，但不会真正更新 Topics
- Topics 要用 `PUT /repos/.../topics`
- 需要 `public_repo` 或 `repo` 权限的 token

## 3. 日常更新

每次改代码：

```powershell
git status
git diff
git add <files>
git commit -m "fix: ..."
git push
```

作用：

- `git status`：看哪些文件改了
- `git diff`：看具体改了什么
- `git add`：选择要提交的文件
- `git commit`：保存一个版本
- `git push`：同步到 GitHub

提交信息建议：

```text
feat: 新功能
fix: 修复
docs: 文档
refactor: 重构
chore: 构建/杂项
```

### 冲突处理

如果远程有新提交：

```powershell
git pull --rebase origin main
```

解决冲突后：

```powershell
git add <冲突文件>
git rebase --continue
git push
```

不要在自己的提交还没确认时直接 `git push --force`。

## 4. Tag：给版本打标记

### 4.1 创建 tag

```powershell
git tag -a v0.2.1 -m "dsh-plugin-overview 0.2.1"
```

作用：

- 给当前 commit 一个不可变的版本名
- 后续 GitHub Release 可以引用这个 tag
- npm 版本和 Git tag 最好保持一致

### 4.2 推送 tag

```powershell
git push origin v0.2.1
```

普通 `git push` 不会自动推送 tag。

### 4.3 修改 tag

如果 tag 打错了，且还没有发布 Release：

```powershell
git tag -f v0.2.1
git push origin v0.2.1 --force
```

注意：

- 已经发布过的 tag 不要随便 force push
- 会让别人的本地 tag 和远程不一致
- 正式发布后，tag 应该保持不动

## 5. GitHub Release

### 5.1 入口

```text
https://github.com/LTao96/dsh-plugin-overview/releases/new?tag=v0.2.1
```

### 5.2 字段

| 字段 | 填什么 |
|---|---|
| Choose a tag | `v0.2.1` |
| Target | `main` |
| Release title | `v0.2.1` |
| Describe | 发布说明 Markdown |
| Release label | `None` |
| Pre-release | 不勾 |
| Set as latest release | 勾选 |
| Attach binaries | 通常不需要，npm 已有 tarball |

### 5.3 Release label 是什么

- **None**：正式版，显示为 Latest
- **Pre-release**：测试版，不作为 Latest

`0.2.1` 是正式版，选 `None`。

### 5.4 正文写什么

建议包含：

```markdown
## 安装

## 功能

## 修复

## 说明

## 验证
```

可以直接使用仓库里的 `RELEASE_NOTES.md`。

### 5.5 Publish release 做了什么

- 创建公开的 Release 页面
- 关联 tag 和 commit
- 可能通知 watcher
- 生成 `/releases/tag/v0.2.1` 页面
- 不会自动更新 npm 包

## 6. 提交到 DSH 插件目录

dshfind 和 dshmarket 的索引都来自
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)。

### 6.1 前置条件

- 仓库创建满 1 天
- `package.json` 声明 `dsh.bundle`
- 有真实可用代码
- 添加 `dsh-plugin` topic
- 一个 PR 最多添加 3 个条目

### “仓库满 1 天”怎么算

不是按自然日，也不是按最后一次 commit，而是按仓库创建时间往后 24 小时。

查询：

```powershell
Invoke-RestMethod -Uri https://api.github.com/repos/LTao96/dsh-plugin-overview |
  Select-Object created_at, pushed_at
```

示例：

```text
created_at: 2026-11-02T07:36:53Z
```

换算北京时间：

```text
2026-11-02 15:36:53
```

满 24 小时：

```text
2026-11-03T07:36:53Z
2026-11-03 15:36:53 北京时间
```

所以：

- `created_at` 决定“仓库年龄”
- `pushed_at` 只是最后一次推送时间
- 最后 commit 时间不影响这条规则
- 时间统一按 UTC 计算

### 6.2 提交文件

Fork 目录仓库，新增：

```text
data/plugins/LTao96__dsh-plugin-overview.yml
```

内容：

```yaml
url: https://github.com/LTao96/dsh-plugin-overview
name: LTao96/dsh-plugin-overview
category: ui
description:
  en: 'Local overview for installed DSH plugins with notes, groups, health checks and settings shortcuts.'
  zh: '本地插件总览：备注、分组、健康检查、启停和设置入口。'
```

### 6.3 不要手改 README

目录仓库的 README 由 `data/plugins/*.yml` 自动生成。

正确做法：

- 只改自己的 YAML
- 等 CI 和 maintainer 审核
- 合并后网站自动重建

### 6.4 合并之后

- dshfind 通常会自动同步
- dshmarket 索引也读取该目录
- 新版本不需要重新提交条目
- 描述需要更新时，改同一个 YAML

## 7. 常见问题

### `Failed to connect to github.com port 443`

网络问题，不是仓库问题。

处理：

- 检查代理/VPN
- 换网络
- 稍后重试
- 不要重复初始化仓库

### `Authentication failed`

GitHub 不再接受账号密码 push。需要：

- Git Credential Manager
- Personal Access Token
- SSH key

不要使用 GitHub 登录密码。

### `rejected: non-fast-forward`

远程有本地没有的提交：

```powershell
git pull --rebase origin main
git push
```

### `src refspec main does not match any`

通常是因为还没有 commit，或分支名不是 `main`。

```powershell
git status
git log --oneline
git branch
```

## 8. 发布检查清单

```text
[ ] git status 干净
[ ] npm test 通过
[ ] node --check 通过
[ ] 版本号和 tag 一致
[ ] README 安装命令正确
[ ] git push 成功
[ ] tag 已推送
[ ] Release 已创建
[ ] Release 正文包含安装命令
[ ] 仓库添加 dsh-plugin topic
[ ] 仓库满 1 天后提交 awesome-dsh-plugin
```
