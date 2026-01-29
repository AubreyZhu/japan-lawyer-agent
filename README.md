# 日本律师智能体网页壳（百炼智能体应用）

这个项目是一个最小可用的网页聊天壳：
- 前端：简单聊天 UI
- 后端：Next.js API Route 转发调用百炼智能体应用（API Key 不会暴露给浏览器）
- 支持：多轮对话（自动保存并回传 session_id）

## 你的百炼应用
- APP_ID: `2d547ff0bf13486680ecc1f339ac8553`
- 调用地址：`https://dashscope.aliyuncs.com/api/v1/apps/2d547ff0bf13486680ecc1f339ac8553/completion`

## 本地运行（可选）
1. 安装依赖：
   ```bash
   npm install
   ```
2. 配置环境变量（新建 `.env.local`）：
   ```bash
   DASHSCOPE_API_KEY=你的百炼APIKey
   ```
3. 启动：
   ```bash
   npm run dev
   ```
4. 浏览器打开：`http://localhost:3000`

## 部署到 Vercel（推荐）
1. 把整个项目上传到 GitHub（或其他 git 仓库）
2. Vercel 新建项目并导入该仓库
3. 在 Vercel 的 Project Settings → Environment Variables 添加：
   - `DASHSCOPE_API_KEY` = 你的百炼 API Key
4. Deploy

## 免费版密码保护（内置密码门）
本项目已内置一个简单的访问密码门（适合演示/小范围使用）：
- 密码：`lawyer2026`
- 进入后会在本浏览器会话中保持登录（sessionStorage）

如需更严格的“账号体系/权限控制”，建议后续接入 NextAuth + 数据库。

## 注意
- 不要把 API Key 写进前端代码或提交到公开仓库。
- 如你的 Key 曾经在聊天/截图中泄露，请立刻在控制台撤销并重新生成。
