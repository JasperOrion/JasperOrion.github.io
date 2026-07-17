---
type: concept
domain: cs-fundamentals
course: data-base-system
title: 数据库完整性
description: 数据库完整性的知识整理，涵盖1. 概念、2. 完整性类别、3. 约束类型速查、4. 列级约束 vs 表级约束。
created: 2026-06-23
updated: 2026-06-23
tags:
  - 数据库
  - 完整性
  - SQL
status: mature
publish: true
slug: cs-fundamentals/data-base-system/concepts/database-integrity
difficulty: basic
featured: false
---

# 数据库完整性

## 1. 概念

确保数据的**正确性**和**相容性**，防止不合语义的数据进入数据库。

## 2. 完整性类别

| 类型 | 含义 | 例子 |
|------|------|------|
| 实体完整性 | 主键非空且唯一 | 学号不能为空 |
| 参照完整性 | 外键要么为空要么引用存在的主键 | 选课表中的学号必须在学生表中存在 |
| 用户定义完整性 | 业务规则约束 | 成绩 0-100，性别只能男/女 |

## 3. 约束类型速查

| 约束 | 关键字 | 作用 |
|------|--------|------|
| 主键 | `PRIMARY KEY` | 非空 + 唯一（实体完整性） |
| 外键 | `FOREIGN KEY ... REFERENCES` | 引用另一表的主键（参照完整性） |
| 唯一 | `UNIQUE` | 值不重复，但允许多个 NULL |
| 非空 | `NOT NULL` | 不允许 NULL |
| 检查 | `CHECK` | 自定义条件表达式 |
| 默认值 | `DEFAULT` | 插入时未指定则用默认值 |

## 4. 列级约束 vs 表级约束

```sql
-- 列级约束：紧跟在列定义后，只能约束该列
CREATE TABLE Student (
    Sno CHAR(10) PRIMARY KEY,             -- 列级主键
    Sname CHAR(20) NOT NULL,              -- 列级非空
    Sex CHAR(2) CHECK (Sex IN ('男','女')), -- 列级检查
    Sage INT DEFAULT 18                    -- 列级默认
);

-- 表级约束：在所有列定义之后，可约束多列（复合主键、复合外键必须用表级）
CREATE TABLE SC (
    Sno CHAR(10),
    Cno CHAR(10),
    Grade INT CHECK (Grade >= 0 AND Grade <= 100),  -- 列级亦可
    PRIMARY KEY (Sno, Cno),                          -- 表级：复合主键
    FOREIGN KEY (Sno) REFERENCES Student(Sno)        -- 表级：外键
        ON DELETE CASCADE                            -- 级联删除
        ON UPDATE CASCADE                            -- 级联更新
);
```

> **规则**：单列约束列级/表级均可；多列约束（复合主键、复合外键）**必须用表级**。

## 5. 命名约束

```sql
-- 给约束命名，便于后续 ALTER 时精确操作
CREATE TABLE SC (
    Sno CHAR(10),
    Cno CHAR(10),
    Grade INT,
    CONSTRAINT PK_SC PRIMARY KEY (Sno, Cno),
    CONSTRAINT FK_SC_Sno FOREIGN KEY (Sno) REFERENCES Student(Sno),
    CONSTRAINT CK_Grade CHECK (Grade >= 0 AND Grade <= 100)
);
```

## 6. 外键的引用动作

```sql
FOREIGN KEY (Sno) REFERENCES Student(Sno)
    ON DELETE CASCADE    -- 主表行删除 → 从表相关行也删除
    ON UPDATE CASCADE    -- 主表主键更新 → 从表外键同步更新
```

| 动作 | 含义 |
|------|------|
| `CASCADE` | 级联：主表变，从表跟着变 |
| `SET NULL` | 主表删/改时，从表外键置为 NULL |
| `NO ACTION` | 拒绝操作（默认） |
| `SET DEFAULT` | 主表删/改时，从表外键置为默认值 |

## 7. ALTER TABLE 增删约束

```sql
-- 添加约束
ALTER TABLE SC ADD CONSTRAINT CK_Grade CHECK (Grade >= 0 AND Grade <= 100);

-- 删除约束
ALTER TABLE SC DROP CONSTRAINT CK_Grade;

-- 修改列的默认值
ALTER TABLE Student ALTER COLUMN Sage SET DEFAULT 20;
```

> 注意：`NOT NULL` 的增删在不同 DBMS 中语法不同，MySQL 用 `MODIFY`，SQL Server 用 `ALTER COLUMN`。

## 8. 例题

> 建立学生表 Student 和选课表 SC，满足：
> - Sno 为主键，Sname 非空，Sex 只能是 '男'/'女'，Sage 默认 18
> - SC 的 Sno + Cno 为复合主键，Sno 外键引用 Student，Grade 0-100
> - 删除学生时级联删除其选课记录

```sql
-- 建表
CREATE TABLE Student (
    Sno CHAR(10) PRIMARY KEY,
    Sname CHAR(20) NOT NULL,
    Sex CHAR(2) CHECK (Sex IN ('男','女')),
    Sage INT DEFAULT 18
);

CREATE TABLE SC (
    Sno CHAR(10),
    Cno CHAR(10),
    Grade INT,
    CONSTRAINT PK_SC PRIMARY KEY (Sno, Cno),
    CONSTRAINT FK_SC_Sno FOREIGN KEY (Sno)
        REFERENCES Student(Sno) ON DELETE CASCADE,
    CONSTRAINT CK_Grade CHECK (Grade >= 0 AND Grade <= 100)
);

-- 后续增加约束：不允许 NULL 成绩
ALTER TABLE SC ADD CONSTRAINT NN_Grade CHECK (Grade IS NOT NULL);
-- 或直接修改列定义（取决于 DBMS）
ALTER TABLE SC ALTER COLUMN Grade SET NOT NULL;
```

## 相关概念

- [SQL 语法](/articles/cs-fundamentals/data-base-system/concepts/sql-syntax/)
- [数据库安全性](/articles/cs-fundamentals/data-base-system/concepts/database-security/)
- [数据库恢复技术](/articles/cs-fundamentals/data-base-system/concepts/database-recovery/)
