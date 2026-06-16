# Rules Migration Findings

## Source Project

Source directory: `/Users/ye/Trae_LotoRoc`

Initial discovery found:

- `.trae/rules/project_rules.md`
- `docs/development/*.md`
- `docs/engineering/*.md`
- `docs/product/*.md`
- `docs/qa/*.md`
- `docs/release/*.md`
- `docs/management/*.md`
- `.planning/*/{task_plan,findings,progress}.md`

## Transfer Criteria

Keep:

- AI collaboration rules.
- Localization readiness.
- Feature flags / hidden features / phased enablement.
- Documentation structure.
- QA and release checklist patterns.
- Error tolerance and observability rules.
- Naming and architecture conventions that can map to PetPulse.

Drop or rewrite:

- Lottery-specific algorithms, draw schedule, ticket analysis, and App Store lottery phrasing.
- Swift-only implementation details unless they express reusable architecture principles.

## 搜索发现

源项目中可复用的高价值模式：

- 本地化要提前准备：避免用户可见文本硬编码，fallback 语言要统一，业务判断不能依赖中文文案。
- 地区敏感能力用远程配置、Provider 接口和功能开关控制，避免把地区分支写死在 UI 里。
- 隐藏/暂停功能要建清单，说明隐藏原因、控制位置和恢复步骤；代码存在不代表用户可见。
- QA 分为“发布前最小手测脚本”和专项回归脚本，覆盖推送、支付、通知和高风险路径。
- 发布准备通过上线审计、人工提审清单、元数据/隐私问卷复核和最终回归清单追踪。
- 文档有索引和状态清单，标明当前、当前参考、历史参考、已过时，避免后续 Agent 误读旧文档。
- 运行时 fallback、网络 fallback、Provider 配置容错、本地化 fallback 属于稳定性能力，不应当被当成旧兼容随手删除。
- 上线前清理要区分“未上线旧迁移包袱”和“当前运行韧性”，前者可删，后者保留。

## 针对 PetPulse 的改写原则

- 注释、文档说明和规则解释使用中文；技术名词、API 名、路径名保留英文。
- 不照搬“每行代码都注释”，改为复杂逻辑、公开函数、业务规则和风险点用中文注释。
- 本地化从 MVP 第一阶段就保留 key / locale / region 字段，但不要过早做完整多地区法务流程。
- 隐藏功能清单用于记录“未来可做但当前不开放”的能力，例如支付、医生认证、保险、复杂信用分。
- PetPulse 的合规文案重点从“不承诺中奖”改为“不保证救援结果、不替代兽医诊断、不公开精确地址”。
