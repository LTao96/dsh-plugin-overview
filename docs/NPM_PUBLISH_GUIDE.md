# npm 发布与更新完整指南

本文以 `dsh-plugin-overview` 为例，说明 npm 包从版本准备、2FA 发布、验证到后续更新和回滚的完整流程。

- npm 账号：`liutao1996`
- 包名：`dsh-plugin-overview`
- 当前版本：`0.2.1`
- npm 页面：https://www.npmjs.com/package/dsh-plugin-overview

## 1. npm 是什么

npm 负责：

- 保存包的所有历史版本
- 提供 `latest` 等 dist-tag
- 验证发布者身份
- 给 `npm install` / `dsh plugin add` 提供下载源

GitHub 负责代码，npm 负责分发，两者不是一回事。

## 2. 发布前先确认 registry

### 2.1 官方源

```powershell
npm config get registry
```

应该是：

```text
https://registry.npmjs.org/
```

### 2.2 国内镜像

```powershell
npm config set registry https://registry.npmmirror.com/
```

作用：

- 下载包更快
- 但镜像通常是**只读**的
- 不能在镜像上发布
- npm 官方 token 对镜像无效，`npm whoami` 可能直接报未登录

发布前必须切回官方：

```powershell
npm config set registry https://registry.npmjs.org/
```

### 2.3 单次使用镜像

不想改全局配置时：

```powershell
npm install --registry=https://registry.npmmirror.com/
```

## 3. 确认登录

```powershell
npm whoami
```

应该返回：

```text
liutao1996
```

如果报：

```text
ENEEDAUTH
```

说明当前 registry 下没有有效登录态。

处理：

```powershell
npm login
```

或：

```powershell
npm login --auth-type=web
```

### 登录态存在哪里

通常在：

```text
C:\Users\<用户名>\.npmrc
```

里面会保存 registry token。不要把 `.npmrc` 提交到 Git。

## 4. package.json 里哪些字段决定发布

| 字段 | 作用 |
|---|---|
| `name` | npm 包名，必须唯一 |
| `version` | 版本号 |
| `private` | `true` 时禁止发布；发布前必须删掉 |
| `license` | 许可证 |
| `description` | npm 页面简介 |
| `type` | `module` 表示 ESM |
| `main` / `exports` | 包入口 |
| `files` | 真正打包进 tarball 的文件 |
| `engines` | Node 版本要求 |
| `dsh.bundle` | DSH 插件 bundle 清单 |
| `dsh.client` | 浏览器端入口/注入 |
| `dsh.engines.dsh` | 支持的 DSH 版本 |
| `repository` / `homepage` / `bugs` | GitHub 链接 |
| `publishConfig` | 发布到哪个 registry、是否 public |

### 2FA 与 token 的关系

- 账号开了 2FA 后，发布通常需要 OTP 或浏览器验证
- `--otp=<6位码>` 用于 TOTP
- 安全密钥/Passkey 需要 `npm login --auth-type=web`
- 带 `Bypass 2FA` 的 Granular Token 也可以发布，但风险更高

## 5. 发布前检查

```powershell
cd E:\DeepSeek_Data\plugin\plugin-overview
node --check index.js
node --check client.js
npm test
npm pack --dry-run
```

### `node --check`

只检查语法，不运行代码。

### `npm test`

运行 `node --test`。

### `npm pack --dry-run`

预览真正会发布的文件：

```text
dsh-plugin-overview@0.2.1
12 files
```

重点确认：

- README 已包含
- LICENSE 已包含
- locale 已包含
- 没有 node_modules
- 没有临时文件

## 6. 版本号怎么升

### patch

```powershell
npm version patch
```

例如：

```text
0.2.0 → 0.2.1
```

适合：

- 修 bug
- 文档更新
- 样式调整

### minor

```powershell
npm version minor
```

例如：

```text
0.2.1 → 0.3.0
```

适合：

- 新功能
- 新设置项
- 兼容旧状态的新字段

### major

```powershell
npm version major
```

例如：

```text
0.3.0 → 1.0.0
```

适合：

- 改名
- 改路由
- 改状态结构且不能迁移
- 破坏兼容

### `npm version` 做了什么

通常：

1. 修改 `package.json` 的 `version`
2. 创建一个 commit
3. 创建一个 `v0.2.1` 这样的 tag

所以**不要连续执行两次**，否则会变成 `0.2.2`。

## 7. 发布

### 方式 A：普通 TOTP

```powershell
npm publish --access public --otp=123456
```

把 `123456` 换成当前 6 位验证码。

### 方式 B：安全密钥/Passkey

```powershell
npm login --auth-type=web
npm publish --access public
```

根据浏览器提示完成安全密钥验证。

### 方式 C：浏览器验证

```powershell
npm publish --access public
```

如果 npm 提示：

```text
Authenticate your account at:
https://www.npmjs.com/auth/cli/...
Press ENTER to open in the browser...
```

打开链接完成验证，然后发布。

### 方式 D：Granular Token

在 npm 网站创建：

- Granular Access Token
- Read and write
- 只允许 `dsh-plugin-overview`
- 有效期为短期
- 开启 Bypass 2FA

配置到本机后发布，发布完立即撤销 token。

不要把 token 提交到 Git，也不要发到聊天里。

## 8. 发布成功的输出

正常会看到：

```text
+ dsh-plugin-overview@0.2.1
```

npm 可能还会提示：

```text
Your package is being processed and may take a few minutes to become available.
```

这是正常现象。

## 9. 0.0.0-stage 是什么

npm 在浏览器/2FA 发布流程中可能创建一个临时占位版本：

```text
0.0.0-stage
```

特点：

- `stub: true`
- 描述是 “Temporary package placeholder for staged publishing”
- 不是你的正式版本
- 不影响 `latest`

正式版本发布后，`latest` 会指向正式版本，例如：

```json
{
  "latest": "0.2.1"
}
```

不要手动发布 `0.0.0-stage`，也不要为了删它去 `npm unpublish`。

## 10. 发布后验证

### 10.1 查 dist-tags

```powershell
npm view dsh-plugin-overview dist-tags --json
```

期望：

```json
{
  "latest": "0.2.1"
}
```

### 10.2 查具体版本

```powershell
npm view dsh-plugin-overview@0.2.1 version
```

### 10.3 查版本列表

```powershell
npm view dsh-plugin-overview versions
```

### 10.4 看 npm 网页

https://www.npmjs.com/package/dsh-plugin-overview?activeTab=versions

### 10.5 干净 profile 安装

```powershell
$env:DSH_HOME='E:\DeepSeek_Data\plugin\.smoke-021'
dsh plugin --profile smoke add dsh-plugin-overview@0.2.1
dsh --profile smoke --dump-config
```

期望看到：

```yaml
- id: plugin-overview
  name: dsh-plugin-overview
```

验证完删除临时 profile。

## 11. 常见错误

### E403 2FA required

```text
Two-factor authentication or granular access token with bypass 2fa enabled is required
```

原因：账号有 2FA，但这次发布没有完成验证。

处理：

- `--otp=<code>`
- `npm login --auth-type=web`
- 或使用 Bypass 2FA token

### EOTP

```text
This operation requires a one-time password from your authenticator.
```

处理：

- 使用当前 6 位码
- `npm publish --access public --otp=当前验证码`

### ENEEDAUTH

```text
need auth This command requires you to be logged in
```

常见原因：

- registry 被改成了镜像
- token 属于官方源但当前 registry 不是官方源

处理：

```powershell
npm config set registry https://registry.npmjs.org/
npm whoami
```

### 404 No match found for version

刚发布后立即查版本，可能遇到 CDN 缓存滞后。

处理：

- 等 10-60 秒
- 打开 npm 网页确认
- 再 `npm view`

### 403 cannot publish over previously published version

同一个版本号不能重复发布。

处理：

```powershell
npm version patch
npm publish --access public
```

### 发布到了镜像

如果 registry 是 npmmirror，发布不会正常工作。

处理：

```powershell
npm config set registry https://registry.npmjs.org/
```

### README 更新了但 npm 页面没变

npm 页面使用发布时 tarball 里的 README。

仅改 GitHub 不够，需要发新版本：

```powershell
npm version patch
npm publish --access public
```

## 12. 更新版本后旧版本还在吗

在。

npm 保留历史版本：

```text
0.2.0
0.2.1
0.2.2
```

`latest` 只指向最新版：

```text
0.2.2 → latest
0.2.0、0.2.1 仍可安装
```

用户安装旧版：

```powershell
dsh plugin add dsh-plugin-overview@0.2.0
```

### 本地 profile

更新后 pnpm 会替换 `node_modules` 中的旧版本，通常只保留当前安装版本。

### 删除旧版本

不推荐。

`npm unpublish` 限制很多：

- 发布超过 72 小时通常不能删
- 有依赖的包不能随便删
- 会影响固定旧版本的用户

更推荐：

```powershell
npm deprecate dsh-plugin-overview@0.2.1 "此版本有回归，请升级到 0.2.2"
```

## 13. 发布检查清单

```text
[ ] registry 是 https://registry.npmjs.org/
[ ] npm whoami 正常
[ ] node --check 通过
[ ] npm test 通过
[ ] npm pack --dry-run 文件正确
[ ] 版本号已更新
[ ] README/CHANGELOG 已更新
[ ] npm publish 完成 2FA
[ ] npm view dist-tags 正确
[ ] npm 网页版本正确
[ ] 干净 profile 安装成功
[ ] GitHub tag / Release 同步
[ ] dshfind / 市场索引同步
```

## 14. 一句话流程

```text
改代码
→ 测试
→ npm version patch
→ npm pack --dry-run
→ npm publish --access public（完成 2FA）
→ npm view 验证
→ 干净 profile 安装
→ GitHub tag + Release
```
