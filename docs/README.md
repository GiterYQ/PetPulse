# PetPulse Docs Index

> 更新日期：2026-06-15

## 目录分类

| 目录 | 用途 |
| --- | --- |
| `docs/management/` | 文档组织、状态清单、同步规则 |
| `docs/api/` | 机器可读 API 契约和后续接口示例 |
| `docs/engineering/` | AI 协作、本地化、区域化、Provider、功能开关等工程规则 |
| `docs/product/` | MVP 范围、隐藏功能、数据同步、合规文案 |
| `docs/qa/` | 最小手测脚本和后续专项回归脚本 |
| `docs/release/` | MVP 上线前检查、提审和发布准备 |
| `docs/prompts/` | PetPulse 专用提示词包 |

## 当前优先入口

- Agent 协作入口：`AGENTS.md`
- 项目轻量规则：`docs/project-rules.md`
- MVP 需求草案：`docs/product/MVP需求草案.md`
- 文档组织说明：`docs/management/文档组织结构说明.md`
- 文档状态清单：`docs/management/Markdown文档状态清单_20260615.md`
- 本轮交接收尾：`docs/management/交接收尾_20260616_081602.md`
- OpenAPI 契约草案：`docs/api/openapi.yaml`
- 本地化与区域化：`docs/engineering/本地化与区域化准备规则.md`
- 功能开关：`docs/engineering/功能开关与Provider规则.md`
- API 与数据模型：`docs/engineering/API与数据模型草案.md`
- MVP 技术实施路线图：`docs/engineering/MVP技术实施路线图.md`
- MVP 功能分层：`docs/product/MVP功能分层与隐藏功能清单.md`
- 提示词包：`docs/prompts/petpulse-prompt-pack.md`

## 使用规则

- 新增 Markdown 文件后，同步更新 `docs/management/Markdown文档状态清单_20260615.md`。
- 改动产品范围后，同步更新 `docs/product/MVP功能分层与隐藏功能清单.md`。
- 改动本地化、区域、Provider 或功能开关规则后，同步更新对应 `docs/engineering/` 文档。
- 发布前检查以 `docs/qa/` 和 `docs/release/` 为准。
