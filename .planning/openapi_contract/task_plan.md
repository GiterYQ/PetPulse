# PetPulse OpenAPI 契约草案计划

## 目标

新增 `docs/api/openapi.yaml`，把 `docs/engineering/API与数据模型草案.md` 中的 MVP API 转成机器可读契约，供后续后端骨架、前端 `apiClient`、移动端客户端和契约测试使用。

## 阶段

1. 读取 API 草案、实施路线图和 API 设计规则：完成
2. 检查是否已有重复 OpenAPI 契约：完成
3. 编写 `docs/api/openapi.yaml`：完成
4. 更新文档索引和状态清单：完成
5. 校验 YAML 语法和关键引用：完成
6. 更新规划记录和交付说明：完成

## 约束

- 使用中文描述，API 路径、operationId、schema、字段名保留英文。
- 覆盖 MVP 主链路，不加入支付、保险、复杂认证和 AI 医疗诊断。
- 采用 `/v1` 路径和 Bearer/mock 认证占位。
- 错误格式沿用现有项目草案：`{ error: { code, message, requestId, details } }`。
- 不生成服务端代码、不安装依赖、不移动当前前端代码。
