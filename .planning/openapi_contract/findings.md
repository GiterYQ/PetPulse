# PetPulse OpenAPI 契约草案发现

## 已确认口径

- 当前没有 `docs/api/openapi.yaml`。
- `docs/engineering/MVP技术实施路线图.md` 已把 `docs/api/openapi.yaml` 列为下一步产物。
- `docs/engineering/API与数据模型草案.md` 已定义 `/v1` API、核心实体、状态、Provider 和隐私边界。
- 本次只生成契约文件，不做后端实现。

## API 设计决策

- API 风格：REST。
- 契约格式：OpenAPI 3.1.0 草案。
- 认证：Bearer token 占位，MVP 可由 mock session 返回 token。
- 实时能力：MVP 不定义 SSE/WebSocket，提醒和响应先通过普通接口查询。
- 列表：使用 cursor pagination。
- 错误：沿用项目现有错误 envelope，不在本次切换到 RFC 9457。

## 官方资料核对

- 官方 OpenAPI 规范页面显示当前最新发布版为 3.2.0。
- 本项目本阶段采用 3.1.0，是为了保持与常见生成器和验证器兼容；后续工具链确认支持 3.2 后再升级。
