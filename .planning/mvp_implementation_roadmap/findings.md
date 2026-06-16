# PetPulse MVP 技术实施路线图发现

## 已确认口径

- 当前仓库是 React/Vite 展会 Demo，`package.json` 只有前端相关脚本和依赖。
- 项目规则要求中文文档和中文注释，代码标识符、API 名和协议名保留英文。
- 已有 MVP 需求草案定义了用户端、管理端页面和核心状态。
- 已有 API 与数据模型草案定义了 `/v1` API、核心实体、Provider 和隐私边界。
- 现阶段不应直接把 Demo 改成生产 App，应该先建立契约、后端骨架和数据持久化路径。

## 重复检查

- 未发现已有 `MVP技术实施路线图.md`。
- 未发现已有“路线图 / 实施 / Roadmap / 技术实施 / 里程碑”类工程文档。

## 架构判断

- 推荐 API-first + 模块化单体，后续客户端可以是 Flutter、React Native、Web 或原生。
- 推荐按功能边界组织后端模块：`auth / users / pets / emergencies / matching / notifications / responses / media / admin / config`。
- 推荐先用 mock Provider 跑通闭环，再替换地图、推送、存储、AI Provider。
- 推荐先补契约和后端核心，再决定是否重写移动端；否则容易把 Demo UI 反复改成临时产品。
