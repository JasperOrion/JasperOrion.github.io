---
type: concept
domain: cs-fundamentals
course: data-base-system
title: 数据库安全性
description: 数据库安全性的知识整理，涵盖1. 概念、2. 用户授权与收回操作、3. 数据库角色、相关概念。
created: 2026-06-23
updated: 2026-06-23
tags:
  - 数据库
  - 安全性
  - SQL
status: mature
publish: true
slug: cs-fundamentals/data-base-system/concepts/database-security
difficulty: basic
featured: false
---

# 数据库安全性

## 1. 概念

保护数据库免受非授权访问、泄露、篡改和破坏。

## 2. 用户授权与收回操作

### 权限类型

| 权限 | 说明 |
|------|------|
| `SELECT` | 查询数据 |
| `INSERT` | 插入数据 |
| `UPDATE` | 修改数据 |
| `DELETE` | 删除数据 |
| `REFERENCES` | 创建外键引用 |
| `ALL PRIVILEGES` | 上述全部权限 |

### GRANT 语句

```sql
GRANT <权限列表> ON <对象> TO <用户列表> [WITH GRANT OPTION];
```

- `WITH GRANT OPTION`：允许被授权者将权限**再授予**他人
- 可以指定到**列级**：`GRANT SELECT(Sno, Sname) ON Student TO U1;`
- 一次可授予**多个用户**：`GRANT SELECT ON Student TO U1, U2, U3;`

### REVOKE 语句

```sql
REVOKE <权限列表> ON <对象> FROM <用户列表> [CASCADE|RESTRICT];
```

- `CASCADE`：级联收回，被该用户转授出去的权限**也一起收回**
- `RESTRICT`：若该用户已把权限转授他人，则**拒绝收回**（默认行为因 DBMS 而异）

### 例题

> 有学生表 `Student(Sno, Sname, Sdept)` 和选课表 `SC(Sno, Cno, Grade)`。用户 U1、U2、U3。

```sql
-- (1) U1 能查询 Student
GRANT SELECT ON Student TO U1;

-- (2) U2 能查询和插入 SC
GRANT SELECT, INSERT ON SC TO U2;

-- (3) U3 对两张表拥有全部权限
GRANT ALL PRIVILEGES ON Student TO U3;
GRANT ALL PRIVILEGES ON SC TO U3;

-- (4) 收回 U2 对 SC 的插入权限
REVOKE INSERT ON SC FROM U2;

-- (5) U1 只能查学号和姓名（列级授权）
GRANT SELECT(Sno, Sname) ON Student TO U1;

-- (6) U3 可以把 Student 的查询权限转授他人
GRANT SELECT ON Student TO U3 WITH GRANT OPTION;

-- (7) 级联收回 U3 的权限（U3 转授出去的也一并收回）
REVOKE SELECT ON Student FROM U3 CASCADE;
```

## 3. 数据库角色

将**一组权限打包**，赋给角色后，再把人拉入角色。避免逐人逐表授权。

```sql
CREATE ROLE <角色名>;                                  -- 创建角色
GRANT <权限> ON <对象> TO <角色名>;                    -- 授权给角色
GRANT <角色名> TO <用户名>;                            -- 把角色赋予用户
REVOKE <角色名> FROM <用户名>;                         -- 从角色中移除用户
```

### 例题

> 教务系统：10 位老师需查询 Student 和 SC，5 位教务员需对 SC 有增删改查权限，系主任 U99 需要全部权限。

```sql
-- 创建角色
CREATE ROLE Teacher;
CREATE ROLE Staff;

-- 给角色赋权限
GRANT SELECT ON Student TO Teacher;
GRANT SELECT ON SC TO Teacher;
GRANT SELECT, INSERT, UPDATE, DELETE ON SC TO Staff;

-- 把人拉入角色
GRANT Teacher TO U1, U2, ..., U10;
GRANT Staff TO U11, U12, ..., U15;

-- 系主任需要全部权限，也可以拉入多个角色
GRANT Teacher TO U99;
GRANT Staff TO U99;
GRANT ALL PRIVILEGES ON Student TO U99;  -- 额外权限单独给

-- 新老师 U100 入职，一行搞定
GRANT Teacher TO U100;
```

## 相关概念

- [SQL 语法](/articles/cs-fundamentals/data-base-system/concepts/sql-syntax/)
- [数据库完整性](/articles/cs-fundamentals/data-base-system/concepts/database-integrity/)
