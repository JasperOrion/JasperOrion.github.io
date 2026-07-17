---
type: concept
domain: cs-fundamentals
course: data-base-system
title: SQL 语法
description: SQL 语法的知识整理，涵盖1. 单表查询、2. 连接查询、3. 嵌套查询、4. 数据更新。
created: 2026-06-23
updated: 2026-06-23
tags:
  - SQL
  - 数据库
  - 查询
status: mature
publish: true
slug: cs-fundamentals/data-base-system/concepts/sql-syntax
difficulty: basic
featured: false
---

# SQL 语法

> 以下以学生表 `Student(Sno, Sname, Sage, Sdept)` 和选课表 `SC(Sno, Cno, Grade)` 为例。

## 1. 单表查询

```sql
-- 基本结构：SELECT 列 FROM 表 WHERE 条件 GROUP BY 分组 HAVING 组筛选 ORDER BY 排序列
SELECT DISTINCT Sdept FROM Student;                    -- DISTINCT 去重
SELECT * FROM Student WHERE Sage BETWEEN 18 AND 22;    -- BETWEEN 闭区间
SELECT * FROM Student WHERE Sname LIKE '张%';           -- % 任意长度，_ 单字符
SELECT Sdept, COUNT(*) FROM Student
GROUP BY Sdept HAVING COUNT(*) > 100;                   -- HAVING 对分组结果筛选
SELECT * FROM Student ORDER BY Sage DESC, Sno ASC;      -- 多列排序
```

| 子句 | 作用 | 说明 |
|------|------|------|
| `SELECT` | 选列 | `*` 全部列，可带表达式 `Sage+1`，可别名 `AS` |
| `WHERE` | 选行 | 在分组**前**过滤，不能用聚合函数 |
| `GROUP BY` | 分组 | 把相同值的行聚成一组 |
| `HAVING` | 组筛选 | 在分组**后**过滤，可用聚合函数 `COUNT/SUM/AVG/MAX/MIN` |
| `ORDER BY` | 排序 | `ASC` 升序（默认），`DESC` 降序 |

**聚合函数**：`COUNT(*)`（行数）、`COUNT(DISTINCT 列)`、`SUM`、`AVG`、`MAX`、`MIN`。除 `COUNT(*)` 外均忽略 NULL。

## 2. 连接查询

```sql
-- 内连接（只返回匹配行）
SELECT * FROM Student INNER JOIN SC ON Student.Sno = SC.Sno;

-- 自然连接（同名属性自动等值 + 只保留一列）
SELECT * FROM Student NATURAL JOIN SC;

-- 等值连接（WHERE 写法，等价于内连接）
SELECT * FROM Student, SC WHERE Student.Sno = SC.Sno;

-- 自身连接（表自己连自己，必须用别名区分）
SELECT A.Sname, B.Sname FROM Student A, Student B WHERE A.Sdept = B.Sdept AND A.Sno <> B.Sno;

-- 左外连接（左表全部保留，右表无匹配填 NULL）
SELECT * FROM Student LEFT OUTER JOIN SC ON Student.Sno = SC.Sno;

-- 右外连接（右表全部保留）
SELECT * FROM Student RIGHT OUTER JOIN SC ON Student.Sno = SC.Sno;

-- 全外连接（两边都保留，MySQL 不支持，可用 LEFT JOIN UNION RIGHT JOIN 模拟）
SELECT * FROM Student FULL OUTER JOIN SC ON Student.Sno = SC.Sno;
```

| 连接类型 | 保留内容 |
|---------|---------|
| `INNER JOIN` | 仅匹配行 |
| `LEFT OUTER JOIN` | 左表全部 + 右表匹配（无匹配填 NULL） |
| `RIGHT OUTER JOIN` | 右表全部 + 左表匹配（无匹配填 NULL） |
| `FULL OUTER JOIN` | 两边全部 |
| `NATURAL JOIN` | 自动找同名列做等值，同名列只留一列 |
| `CROSS JOIN` | 笛卡尔积（无条件连接） |

## 3. 嵌套查询

```sql
-- IN：子查询返回多值，外层检查是否在其中
SELECT Sname FROM Student WHERE Sno IN (SELECT Sno FROM SC WHERE Cno='C1');

-- NOT IN：不在其中
SELECT Sname FROM Student WHERE Sno NOT IN (SELECT Sno FROM SC WHERE Cno='C1');

-- 比较 + ANY/ALL：子查询前可加比较符
SELECT Sname FROM Student WHERE Sage > ALL (SELECT Sage FROM Student WHERE Sdept='CS');
-- > ALL：比子查询中所有值都大（等价于 >MAX）
-- > ANY：比子查询中任意一个大（等价于 >MIN）

-- EXISTS：检查子查询是否有返回行（相关子查询，效率高于 IN）
SELECT Sname FROM Student WHERE EXISTS (SELECT * FROM SC WHERE Student.Sno=SC.Sno);

-- NOT EXISTS：不存在（常用于"全部"型查询）
-- 例：选修了全部课程的学生
SELECT Sname FROM Student WHERE NOT EXISTS (
    SELECT * FROM Course WHERE NOT EXISTS (
        SELECT * FROM SC WHERE SC.Sno=Student.Sno AND SC.Cno=Course.Cno
    )
);
```

| 谓词 | 适用场景 | 性能 |
|------|---------|------|
| `IN` | 值在列表中 | 小结果集好 |
| `EXISTS` | "存在"判断 | 大结果集好，碰到第一个匹配就返回 |
| `> ALL` | 比所有都大 | `>MAX` |
| `> ANY` | 比某个大 | `>MIN` |

## 4. 数据更新

```sql
-- INSERT：插入一行
INSERT INTO Student VALUES ('S10', '张三', 20, 'CS');
-- 指定列插入（未指定列为默认值或 NULL）
INSERT INTO Student(Sno, Sname) VALUES ('S11', '李四');
-- 子查询批量插入
INSERT INTO CS_Student SELECT * FROM Student WHERE Sdept='CS';

-- UPDATE：修改
UPDATE Student SET Sage = 21 WHERE Sno = 'S10';
-- 多列修改
UPDATE Student SET Sage = Sage + 1, Sdept = 'IS' WHERE Sno = 'S10';

-- DELETE：删除
DELETE FROM Student WHERE Sno = 'S10';
-- 删除全部（慎用，只删数据不删表结构）
DELETE FROM Student;
```

## 5. 视图

> 视图是**虚拟表**——不存数据，只存查询定义。对视图的查询最终转为对基表的查询。

```sql
-- 创建视图
CREATE VIEW CS_Student AS
SELECT Sno, Sname, Sage FROM Student WHERE Sdept='CS';

-- 带 WITH CHECK OPTION：通过视图插入/修改的数据必须满足视图条件
CREATE VIEW CS_Student AS
SELECT * FROM Student WHERE Sdept='CS'
WITH CHECK OPTION;

-- 删除视图
DROP VIEW CS_Student;
```

| 特性 | 说明 |
|------|------|
| 本质 | 存查询定义，不存数据，数据仍在基表中 |
| 用途 | 简化复杂查询、安全控制（隐藏敏感列）、逻辑独立性 |
| 可更新条件 | 视图定义**不能含** GROUP BY / DISTINCT / 聚合 / 多表连接 |
| `WITH CHECK OPTION` | 保证通过视图 INSERT/UPDATE 的数据满足 WHERE 条件 |

## 相关概念

- [关系代数运算](/articles/cs-fundamentals/data-base-system/concepts/relational-algebra/) — SQL 的数学基础
- [数据库安全性](/articles/cs-fundamentals/data-base-system/concepts/database-security/) — GRANT/REVOKE 控制 SQL 操作权限
- [数据库完整性](/articles/cs-fundamentals/data-base-system/concepts/database-integrity/) — CREATE TABLE 中的约束
- [SQL（编程视角）](/articles/programming/tools/concepts/sql/) — 在编程与工具领域的引用页
