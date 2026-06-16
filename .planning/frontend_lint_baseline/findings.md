# PetPulse 前端 lint 基线修复发现

## 初始背景

- 当前仓库是 React/Vite Demo。
- 路线图建议先修复前端 lint，让 Demo 基线稳定。
- 已知历史信息显示 lint 可能涉及 `EmergencyMap.tsx` 中 render 阶段动态时间，以及 `AIProcessingFeed.tsx` 的 hook dependency。

## 调试原则

- 先运行 `npm run lint` 复现当前真实错误。
- 根据 lint 输出定位根因，不凭历史信息直接改。
- 修改后重新运行 `npm run lint` 和 `npm run build`。

## lint 复现结果

- `src/components/EmergencyMap.tsx:14`：`useRef<number>(Date.now())` 在 render 阶段调用 impure function，触发 `react-hooks/purity`。
- `src/components/AIProcessingFeed.tsx:59`：`useEffect` 缺少 `steps`、`onPhaseChange`、`onComplete` 依赖，触发 `react-hooks/exhaustive-deps` warning。

## 根因

- `EmergencyMap` 的动画起始时间应在 effect 阶段设置，不能在组件 render 期间调用 `Date.now()`。
- `AIProcessingFeed` 的父组件回调已经使用 `useCallback`，补齐 effect 依赖不会因为函数身份变化导致循环；`steps` 变化时取消旧异步流程并重启也符合当前处理流程。
