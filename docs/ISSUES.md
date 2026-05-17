# 遗留问题

记录待处理事项，解决后打勾。

---

## 格式

```
## [YYYY-MM-DD] 问题分类

- [ ] 问题描述
- [x] 已解决的问题（添加解决日期和方案）
```

---

## 待处理

## [2026-05-17] 本地开发环境问题

- [ ] 本地开发环境无法正常使用
  - **问题：** 执行 `npx wrangler pages dev public --d1=DB=resume-optimizer-db` 后，访问管理后台报错 `D1_ERROR: no such table: settings`
  - **已尝试：** 使用 `npx wrangler d1 execute resume-optimizer-db --local --file=schema.sql` 创建表，确认表已存在，但服务器仍报错
  - **可能原因：** wrangler dev 服务器与本地数据库路径不一致，或缓存问题
  - **临时方案：** 使用线上版本 https://resume-optimizer-17o.pages.dev/ 进行测试
  - **待解决：** 需要进一步排查本地 D1 数据库绑定问题
