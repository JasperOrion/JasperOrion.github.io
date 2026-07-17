---
type: concept
domain: programming
course: tools
title: SQL
description: SQL的知识整理，涵盖核心语法速览、详细内容、相关概念。
created: 2026-06-23
updated: 2026-06-23
tags:
  - SQL
  - 数据库
  - 工具
status: growing
publish: true
slug: programming/tools/concepts/sql
difficulty: basic
featured: false
---

# SQL

> SQL 是操作关系数据库的标准语言。详见数据库系统课程。

## 核心语法速览

### 查询

```sql
SELECT  列 FROM 表 WHERE 条件 GROUP BY 分组 HAVING 组筛选 ORDER BY 排序列;
```

### 连接

- `INNER JOIN` — 仅匹配行
- `LEFT/RIGHT/FULL OUTER JOIN` — 保留悬浮元组
- `NATURAL JOIN` — 同名属性自动等值

### 嵌套查询

- `IN` / `NOT IN` — 值在/不在子查询结果中
- `EXISTS` / `NOT EXISTS` — 子查询有/无返回行
- `> ALL` / `> ANY` — 与子查询所有/任意值比较

### 数据更新

- `INSERT INTO ... VALUES ...` / `INSERT INTO ... SELECT ...`
- `UPDATE ... SET ... WHERE ...`
- `DELETE FROM ... WHERE ...`

### 视图

```sql
CREATE VIEW 视图名 AS SELECT ...;
```

## 详细内容

完整 SQL 语法（含安全性 GRANT/REVOKE、完整性约束 CREATE TABLE、外键引用动作等）见：

→ [SQL 语法（数据库系统）](/articles/cs-fundamentals/data-base-system/concepts/sql-syntax/)

## 相关概念

- [数据库安全性](/articles/cs-fundamentals/data-base-system/concepts/database-security/)
- [数据库完整性](/articles/cs-fundamentals/data-base-system/concepts/database-integrity/)
