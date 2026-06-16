# PetPulse 前端 lint 基线修复进度

## 2026-06-15

- 启动前端 lint 基线修复任务。
- 已确认本任务只处理 lint 基线，不做 UI 重写或架构迁移。
- 已运行 `npm run lint`，复现 1 个 error 和 1 个 warning。
- 已定位根因：`EmergencyMap.tsx` render 阶段调用 `Date.now()`；`AIProcessingFeed.tsx` effect 依赖数组缺少捕获值。
- 已修改 `src/components/EmergencyMap.tsx`：将 `startTime` 初始值改为 `0`，实际时间继续在 effect 阶段设置。
- 已修改 `src/components/AIProcessingFeed.tsx`：补齐 `useEffect` 依赖 `steps`、`onPhaseChange`、`onComplete`。
- 已运行 `npm run lint`，通过。
- 已运行 `npm run build`，通过。
- 已检查 git 状态；当前仓库 `.gitignore` 忽略 `src/`、`dist/`、`package.json` 等路径，因此源码修改不会出现在普通 `git diff` 中。
