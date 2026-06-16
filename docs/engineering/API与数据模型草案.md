# PetPulse API 与数据模型草案

> 状态：草案
> 更新时间：2026-06-15
> 目标：为 Flutter、React Native、Web 和原生客户端预留同一套后端契约，确保未来换客户端时仍有清晰的数据保留路径。

## 1. 范围

本文定义 PetPulse MVP 的后端 API 和数据模型方向，不是数据库迁移文件，也不是最终接口规范。

优先覆盖 MVP 闭环：

```text
账号 -> 宠物档案 -> 发起求助 -> 附近匹配 -> 发送提醒 -> 对方响应 -> 历史/信任沉淀
```

暂不覆盖：

- 支付、捐款、保险。
- 完整兽医/医院认证。
- 复杂信用分。
- AI 医疗诊断。
- 大规模组织账号。
- 多地区完整合规后台。
- 公开精确位置。

## 2. 总体架构

建议先采用 API-first 的模块化单体，避免 MVP 阶段过早拆微服务。

```text
Flutter / React Native / Web / iOS / Android
        |
        v
统一 API Service
        |
        +-- PostgreSQL（可预留 PostGIS）
        +-- Object Storage（宠物照片、求助图片、证明材料）
        +-- Queue / Worker（匹配、提醒、AI 后台任务，后置增强）
        |
        +-- AuthProvider
        +-- MapProvider
        +-- NotificationProvider
        +-- StorageProvider
        +-- AIProvider
        +-- RegionPolicyProvider
```

模块边界建议：

| 模块 | 职责 |
| --- | --- |
| `auth` | 账号、会话、登录 Provider |
| `users` | 用户资料、地区、语言、通知偏好 |
| `pets` | 宠物档案 |
| `emergencies` | 急救/走失求助和状态流转 |
| `matching` | 候选匹配和匹配解释 |
| `notifications` | 提醒发送、查看、失败记录 |
| `responses` | 帮助者响应、线索、拒绝、举报 |
| `media` | 图片上传、对象存储元数据 |
| `trust` | 基础信任资料和历史统计 |
| `admin` | 后台查看、隐藏、审核动作 |
| `config` | 功能开关、Provider、区域策略 |

## 3. API 约定

### 3.1 基础约定

- API 前缀：`/v1`
- 数据格式：JSON
- 认证方式：MVP 可先用占位会话，正式版本使用 `Authorization: Bearer <token>`
- ID：建议使用 `uuid` 或 `ulid`
- 时间：后端统一保存 UTC ISO 8601，客户端按 `timeZone` 展示
- 分页：列表接口使用 cursor pagination
- 幂等：创建求助、发送提醒等关键写操作支持 `Idempotency-Key`

### 3.2 请求上下文

客户端请求建议带上这些上下文，便于后续多端、多地区和灰度：

| 字段 | 说明 |
| --- | --- |
| `platform` | `ios` / `android` / `web` |
| `appVersion` | 客户端版本 |
| `locale` | 展示语言，例如 `zh-CN`、`en-US` |
| `region` | 业务区域，例如 `CN`、`US` |
| `countryCode` | 国家或地区码 |
| `timeZone` | 用户时区，例如 `Asia/Shanghai` |

### 3.3 错误格式

统一错误格式，避免各端分别猜错误含义：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数不完整",
    "requestId": "req_01HX...",
    "details": [
      {
        "field": "petId",
        "reason": "REQUIRED"
      }
    ]
  }
}
```

常见错误码：

| code | 场景 |
| --- | --- |
| `UNAUTHENTICATED` | 未登录或会话失效 |
| `FORBIDDEN` | 无权限查看或操作 |
| `VALIDATION_ERROR` | 参数不合法 |
| `NOT_FOUND` | 资源不存在或已删除 |
| `FEATURE_DISABLED` | 功能在当前地区或版本不可用 |
| `REGION_UNSUPPORTED` | 当前区域暂不支持 |
| `RATE_LIMITED` | 触发频控 |
| `PROVIDER_ERROR` | 地图、推送、存储等 Provider 失败 |
| `CONFLICT` | 状态冲突或重复提交 |

## 4. 通用字段

核心表建议保留这些通用字段：

| 字段 | 说明 |
| --- | --- |
| `id` | 主键 |
| `createdAt` | 创建时间 |
| `updatedAt` | 更新时间 |
| `deletedAt` | 软删除时间，可选 |
| `createdByUserId` | 创建用户，可选 |
| `region` | 业务区域 |
| `locale` | 创建时语言 |
| `timeZone` | 创建时用户时区 |

涉及用户隐私的数据，应优先软删除或匿名化策略，再根据地区规则决定物理删除时机。

## 5. 核心数据模型

### 5.1 `User`

用户是跨设备和跨客户端保留数据的根身份。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 用户 ID |
| `displayName` | 必须 | 展示名 |
| `avatarMediaId` | 可选 | 头像媒体 |
| `email` | 可选 | 邮箱登录或联系 |
| `phone` | 可选 | 手机号登录或联系 |
| `authProvider` | 必须 | `mock` / `email` / `phone` / `apple` / `google` / `wechat` |
| `locale` | 必须 | 首选语言 |
| `region` | 必须 | 业务区域 |
| `countryCode` | 可选 | 国家或地区码 |
| `timeZone` | 必须 | 用户时区 |
| `notificationOptIn` | 必须 | 是否允许提醒 |
| `status` | 必须 | `active` / `disabled` / `deleted` |

MVP 不建议一开始强制真实身份认证，避免提高首次使用门槛。

### 5.2 `DeviceToken`

用于推送和去重，具体 Provider 差异不要暴露给业务层。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 设备记录 ID |
| `userId` | 必须 | 所属用户 |
| `platform` | 必须 | `ios` / `android` / `web` |
| `provider` | 必须 | `apns` / `fcm` / `vendor` / `mock` |
| `tokenCiphertext` | 后置 | 加密后的 token，MVP mock 可暂不落真实 token |
| `appVersion` | 可选 | 客户端版本 |
| `locale` | 可选 | 设备语言 |
| `status` | 必须 | `active` / `revoked` / `expired` |

### 5.3 `Pet`

宠物档案是 PetPulse 的核心资产。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 宠物 ID |
| `ownerUserId` | 必须 | 主人用户 ID |
| `name` | 必须 | 宠物名称 |
| `type` | 必须 | `dog` / `cat` / `other` |
| `photoMediaId` | 可选 | 宠物照片 |
| `birthDate` | 可选 | 出生日期 |
| `ageText` | 可选 | 用户填写的年龄文本 |
| `weightKg` | 可选 | 体重 |
| `notes` | 可选 | 普通备注 |
| `medicalNotesPrivate` | 后置 | 私密医疗备注，默认不公开 |
| `bloodType` | 后置 | 血型 |
| `verificationStatus` | 后置 | 证明审核状态 |
| `status` | 必须 | `active` / `deleted` |

### 5.4 `Emergency`

求助记录承载急救和走失两类 MVP 场景。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 求助 ID |
| `ownerUserId` | 必须 | 发起用户 |
| `petId` | 必须 | 关联宠物 |
| `type` | 必须 | `medical_emergency` / `lost_pet` |
| `status` | 必须 | 见状态流转 |
| `title` | 必须 | 求助标题 |
| `description` | 必须 | 用户确认后的求助内容 |
| `helpNeeded` | 必须 | 需要的帮助 |
| `urgency` | 必须 | `low` / `medium` / `high` / `critical` |
| `exactLocation` | 可选 | 内部精确位置快照，不默认公开 |
| `displayLocation` | 必须 | 用户可见的大致区域 |
| `approxGeoHash` | 可选 | 用于附近匹配和模糊展示 |
| `radiusMeters` | 可选 | 广播或匹配半径 |
| `lastSeenAt` | 走失必需 | 走失场景最后出现时间 |
| `contactPreference` | 必须 | `in_app` / `masked_phone` / `manual` |
| `locale` | 必须 | 创建时语言 |
| `region` | 必须 | 业务区域 |
| `timeZone` | 必须 | 创建时用户时区 |
| `expiresAt` | 可选 | 求助过期时间 |
| `closedAt` | 可选 | 关闭时间 |
| `closeReason` | 可选 | `resolved` / `offline` / `user_closed` / `admin_hidden` |

隐私要求：

- 精确经纬度只作为求助处理快照，不做长期轨迹。
- 默认只对外展示 `displayLocation` 或模糊范围。
- 求助文案如由 AI 辅助生成，必须保存用户确认后的版本。

### 5.5 `MatchCandidate`

匹配候选是求助当时的快照，后续候选资料变化不应影响历史解释。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 候选记录 ID |
| `emergencyId` | 必须 | 关联求助 |
| `candidateType` | 必须 | `user` / `pet` / `hospital` / `volunteer` / `manual` |
| `candidateUserId` | 可选 | 候选用户 |
| `candidatePetId` | 可选 | 候选宠物，后置增强 |
| `distanceMeters` | 可选 | 距离估算 |
| `score` | 可选 | 简单规则分，不对用户展示绝对分 |
| `reasonCodes` | 必须 | 例如 `nearby`、`same_pet_type`、`recently_active` |
| `reasonTextKey` | 可选 | 本地化匹配原因 key |
| `status` | 必须 | `suggested` / `selected` / `alerted` / `dismissed` |
| `snapshot` | 可选 | 候选展示摘要，不放敏感原文 |

MVP 匹配可以先用可解释规则，不需要复杂算法。

### 5.6 `AlertDelivery`

提醒发送记录用于展示状态、排查失败和避免重复打扰。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 提醒记录 ID |
| `emergencyId` | 必须 | 关联求助 |
| `matchCandidateId` | 可选 | 来源候选 |
| `recipientUserId` | 可选 | 接收用户 |
| `channel` | 必须 | `push` / `sms` / `email` / `in_app` / `mock` |
| `provider` | 必须 | 实际发送 Provider |
| `status` | 必须 | 见提醒状态 |
| `dedupeKey` | 必须 | 防止重复发送 |
| `sentAt` | 可选 | 发送时间 |
| `viewedAt` | 可选 | 查看时间 |
| `respondedAt` | 可选 | 响应时间 |
| `failedAt` | 可选 | 失败时间 |
| `failureCode` | 可选 | Provider 失败原因 |
| `expiresAt` | 可选 | 提醒过期时间 |

### 5.7 `Response`

响应记录沉淀互助历史和基础信任。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 响应 ID |
| `emergencyId` | 必须 | 关联求助 |
| `alertDeliveryId` | 可选 | 关联提醒 |
| `responderUserId` | 必须 | 响应用户 |
| `type` | 必须 | `can_help` / `lead` / `decline` / `report` |
| `message` | 可选 | 用户填写的信息 |
| `contactConsent` | 必须 | 是否同意进一步联系 |
| `locationShareConsent` | 可选 | 是否同意分享自己的位置 |
| `status` | 必须 | `submitted` / `withdrawn` / `hidden` |
| `createdAt` | 必须 | 创建时间 |

注意：不要把“拒绝帮助”直接转成负面信用，真实世界里不方便响应是正常情况。

### 5.8 `MediaAsset`

数据库只存媒体元数据，文件放对象存储。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 媒体 ID |
| `ownerUserId` | 必须 | 上传用户 |
| `storageProvider` | 必须 | `s3` / `oss` / `r2` / `mock` |
| `bucket` | 必须 | 存储 bucket |
| `objectKey` | 必须 | 对象 key |
| `mediaType` | 必须 | MIME 类型 |
| `purpose` | 必须 | `pet_photo` / `emergency_photo` / `proof` / `avatar` |
| `fileSizeBytes` | 可选 | 文件大小 |
| `checksum` | 可选 | 文件校验 |
| `visibility` | 必须 | `private` / `limited` / `public` |
| `status` | 必须 | `pending` / `active` / `deleted` |

### 5.9 `AdminAction`

后台动作必须可追溯，避免无记录地隐藏或改状态。

| 字段 | MVP | 说明 |
| --- | --- | --- |
| `id` | 必须 | 动作 ID |
| `actorAdminUserId` | 必须 | 操作管理员 |
| `targetType` | 必须 | `user` / `pet` / `emergency` / `response` / `media` |
| `targetId` | 必须 | 目标 ID |
| `action` | 必须 | `hide` / `restore` / `close` / `note` |
| `reasonCode` | 必须 | 原因码 |
| `note` | 可选 | 内部说明 |
| `previousStatus` | 可选 | 操作前状态 |
| `nextStatus` | 可选 | 操作后状态 |
| `createdAt` | 必须 | 操作时间 |

## 6. 支撑数据模型

### 6.1 `TrustProfile`

MVP 只做基础统计，不做复杂信用分。

| 字段 | 说明 |
| --- | --- |
| `userId` | 用户 ID |
| `responseCount` | 历史响应次数 |
| `helpfulCount` | 被标记有帮助次数 |
| `reportCount` | 被举报次数 |
| `profileCompleteness` | 资料完整度 |
| `verificationLevel` | `none` / `basic` / `manual` |
| `updatedAt` | 更新时间 |

### 6.2 `FeatureFlag`

| 字段 | 说明 |
| --- | --- |
| `key` | 功能 key，例如 `ai.draftEmergency` |
| `region` | 区域，可为空表示全局 |
| `platform` | 平台，可为空表示全平台 |
| `enabled` | 是否启用 |
| `rolloutPercent` | 灰度比例 |
| `description` | 中文说明 |

### 6.3 `RegionPolicy`

| 字段 | 说明 |
| --- | --- |
| `region` | 业务区域 |
| `countryCode` | 国家或地区码 |
| `mapProvider` | 地图 Provider |
| `notificationProvider` | 通知 Provider |
| `authProviders` | 可用登录方式 |
| `storageRegion` | 媒体和数据存储区域 |
| `featureFlags` | 区域功能开关 |
| `privacyTextVersion` | 隐私文案版本 |

## 7. 状态流转

### 7.1 求助状态

```text
draft -> submitted -> matching -> alerting -> active
active -> resolved
active -> closed
active -> hidden
submitted -> closed
matching -> closed
alerting -> closed
```

状态含义：

| 状态 | 说明 |
| --- | --- |
| `draft` | 用户填写中 |
| `submitted` | 已提交，等待系统处理 |
| `matching` | 正在寻找候选 |
| `alerting` | 正在发送提醒 |
| `active` | 求助公开可响应 |
| `resolved` | 用户标记已解决 |
| `closed` | 用户关闭 |
| `hidden` | 管理员隐藏 |

### 7.2 提醒状态

```text
pending -> sent -> viewed -> responded
pending -> failed
sent -> failed
sent -> expired
viewed -> declined
```

与 MVP 需求里的用户展示文案保持对应：

| 状态 | 用户感知 |
| --- | --- |
| `pending` | 未发送或发送中 |
| `sent` | 已发送 |
| `viewed` | 已查看 |
| `responded` | 已响应 |
| `declined` | 对方不方便 |
| `expired` | 已过期 |
| `failed` | 发送失败 |

## 8. API 草案

### 8.1 配置与启动

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/v1/config/bootstrap` | 返回地区策略、Provider、功能开关、本地化资源版本 |

### 8.2 账号

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/v1/auth/session` | 创建或恢复会话，MVP 可先 mock |
| `GET` | `/v1/me` | 获取当前用户 |
| `PATCH` | `/v1/me` | 更新用户资料、语言、地区、通知偏好 |
| `DELETE` | `/v1/me` | 删除账号或发起删除流程 |

### 8.3 设备与通知 token

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/v1/devices` | 注册设备 token |
| `DELETE` | `/v1/devices/:id` | 注销设备 token |

### 8.4 宠物档案

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/v1/pets` | 获取我的宠物列表 |
| `POST` | `/v1/pets` | 创建宠物 |
| `GET` | `/v1/pets/:id` | 获取宠物详情 |
| `PATCH` | `/v1/pets/:id` | 更新宠物 |
| `DELETE` | `/v1/pets/:id` | 删除宠物 |

### 8.5 求助

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/v1/emergencies` | 获取我的求助列表 |
| `POST` | `/v1/emergencies` | 创建求助草稿或直接提交 |
| `GET` | `/v1/emergencies/:id` | 获取求助详情 |
| `PATCH` | `/v1/emergencies/:id` | 更新草稿或允许修改的字段 |
| `POST` | `/v1/emergencies/:id/submit` | 提交求助，进入匹配 |
| `POST` | `/v1/emergencies/:id/close` | 关闭或标记已解决 |

创建求助示例：

```json
{
  "petId": "pet_01HX...",
  "type": "lost_pet",
  "urgency": "high",
  "title": "寻找走失的柯基",
  "description": "已由用户确认的求助内容",
  "helpNeeded": "请帮忙留意附近小区和宠物店",
  "location": {
    "exact": {
      "lat": 31.2304,
      "lng": 121.4737
    },
    "displayLocation": "上海市黄浦区附近",
    "radiusMeters": 3000
  },
  "lastSeenAt": "2026-06-15T10:00:00Z",
  "contactPreference": "in_app",
  "locale": "zh-CN",
  "region": "CN",
  "timeZone": "Asia/Shanghai"
}
```

### 8.6 匹配

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/v1/emergencies/:id/matches` | 获取匹配候选 |
| `POST` | `/v1/emergencies/:id/rematch` | 重新匹配，MVP 可后置 |

### 8.7 提醒与响应

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/v1/emergencies/:id/alerts` | 向选定候选发送提醒 |
| `GET` | `/v1/emergencies/:id/alerts` | 查看提醒发送记录 |
| `POST` | `/v1/alerts/:id/view` | 标记已查看 |
| `POST` | `/v1/alerts/:id/responses` | 提交响应 |
| `GET` | `/v1/emergencies/:id/responses` | 查看求助响应 |

发送提醒示例：

```json
{
  "candidateIds": ["match_01HX...", "match_01HY..."],
  "channelPreference": ["push", "in_app"],
  "messageTemplateKey": "emergency.alert.lost_pet",
  "idempotencyKey": "alert-emg_01HX-001"
}
```

### 8.8 媒体

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/v1/media/presign` | 获取上传 URL |
| `POST` | `/v1/media/:id/complete` | 标记上传完成 |
| `DELETE` | `/v1/media/:id` | 删除媒体 |

### 8.9 后台

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/v1/admin/emergencies` | 后台求助列表 |
| `GET` | `/v1/admin/emergencies/:id` | 后台求助详情 |
| `POST` | `/v1/admin/emergencies/:id/hide` | 隐藏求助 |
| `POST` | `/v1/admin/emergencies/:id/restore` | 恢复求助 |
| `GET` | `/v1/admin/metrics` | 聚合运营指标 |

后台默认只展示必要信息；敏感原文、精确位置、联系方式需要更高权限和审计记录。

## 9. 位置与隐私策略

MVP 最小策略：

- 精确位置只保存本次求助快照，不保存长期轨迹。
- 对普通用户展示 `displayLocation`、城市、区县或模糊半径。
- 匹配可以使用 `exactLocation` 或 `approxGeoHash`，但返回给客户端时默认不返回精确坐标。
- 联系方式默认不公开，优先站内响应或遮罩联系方式。
- 宠物医疗备注、证明材料默认私密。
- 删除宠物、关闭求助、删除账号都需要有后端路径。

建议保留的内部注释口径：

```sql
-- 求助表只保存本次求助所需的位置快照，不保存用户长期轨迹。
-- exact_location 仅供匹配和必要运营排查使用，默认不返回给普通客户端。
```

## 10. Provider 与区域预留

不要在业务代码里写死某个国家或某个三方 SDK。

| 能力 | API / 数据层预留 |
| --- | --- |
| 地图 | `RegionPolicy.mapProvider`、`Emergency.approxGeoHash` |
| 推送 | `DeviceToken.provider`、`AlertDelivery.provider` |
| 登录 | `User.authProvider`、`RegionPolicy.authProviders` |
| 存储 | `MediaAsset.storageProvider`、`RegionPolicy.storageRegion` |
| AI | 功能开关 `ai.draftEmergency`、`ai.matchExplanation` |
| 支付 | MVP 暂不接，只在 `FeatureFlag` 保留命名空间 |

## 11. MVP 验收标准

这份 API 和数据模型至少要能支撑：

- 一个用户创建账号并保留语言、地区、时区。
- 用户创建、编辑、删除宠物档案。
- 用户创建急救或走失求助，并保存用户确认后的文案。
- 系统生成附近候选和可解释匹配原因。
- 用户向候选发送提醒，并看到发送、查看、响应、失败状态。
- 帮助者提交“可以帮忙 / 有线索 / 不方便 / 举报”。
- 用户关闭或标记求助已解决。
- 后台可以查看求助状态并隐藏明显异常内容。
- 默认不公开精确位置、联系方式和宠物私密医疗信息。
- 后续客户端从 React 换到 Flutter、React Native 或原生时，核心用户数据不丢。

## 12. 开放问题

后续实现前需要确认：

1. MVP 登录先用邮箱、手机号、Apple，还是先做 mock 会话？
2. 第一版是否真实发送 Push，还是先用站内通知模拟？
3. 帮助者是否必须提前注册，还是允许通过链接轻量响应？
4. 匹配候选池来自真实用户、种子数据、后台手工录入，还是三者混合？
5. 媒体存储优先选国内 OSS、S3/R2，还是本地 mock？
6. 管理后台第一版是独立页面，还是用数据库管理工具临时代替？
7. 求助和媒体的默认保留周期是多久？
