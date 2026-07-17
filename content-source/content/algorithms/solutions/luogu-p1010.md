---
type: solution
domain: algorithms
title: P1010 [NOIP 1998 普及组] 幂次方
description: P1010 [NOIP 1998 普及组] 幂次方的算法题解，涵盖题目、思路、代码、常见错误。
created: 2026-07-14
updated: 2026-07-14
tags:
  - 递归
  - 二进制
  - 分治
  - 题解
  - 基础
status: mature
publish: true
slug: algorithms/solutions/luogu-p1010
difficulty: easy
featured: false
---

# P1010 [NOIP 1998 普及组] 幂次方

## 题目

> 将正整数 n 表示为 $2$ 的幂次方之和，且**指数也要递归展开**。约定 $2^1$ 直接写 $2$，其余用 $a(b)$ 表示 $a^b$。
>
> 例：$137 = 2(2(2)+2+2(0))+2(2+2(0))+2(0)$

## 思路

### 第一步：把 n 拆成 2 的幂次

任何一个正整数都可以唯一地写成 $\sum 2^{e_i}$。哪些 $e_i$ 被选中？看 n 的**二进制表示中哪些位是 1**。

```
137 的二进制: 1 0 0 0 1 0 0 1
              ↑         ↑       ↑
             位7       位3     位0
             → 2^7  +  2^3  +  2^0
```

逐位提取：

```cpp
vector<int> f(int n) {
    vector<int> exps;
    for (int e = 0; n > 0; e++, n >>= 1) {
        if (n & 1)              // 最低位是 1 → 2^e 是组成部分
            exps.push_back(e);
    }
    reverse(exps.begin(), exps.end());  // 升序 → 降序
    return exps;
}
// n=137 → exps = [7, 3, 0]
```

### 第二步：对每个指数递归

拿到指数数组后，逐个处理：

| 指数 e | 输出 | 说明 |
|--------|------|------|
| `e == 0` | `2(0)` | $2^0$ |
| `e == 1` | `2` | $2^1$ 特殊，不写括号 |
| `e > 1` | `2( dfs(e) )` | 递归展开指数 |

指数之间用 `+` 连接。

### 完整递归轨迹：n = 137

```
dfs(137)
  f(137) = [7, 3, 0]

  e=7 > 1 → "2(" + dfs(7) + ")"
    f(7) = [2, 1, 0]
    e=2 > 1 → "2(" + dfs(2) + ")"
      f(2) = [1]
      e=1 → "2"
      → dfs(2) = "2"
    → "2(2)"
    e=1 → "2"
    e=0 → "2(0)"
    → dfs(7) = "2(2)+2+2(0)"
  → "2(2(2)+2+2(0))"

  e=3 > 1 → "2(" + dfs(3) + ")"
    f(3) = [1, 0]
    e=1 → "2"
    e=0 → "2(0)"
    → dfs(3) = "2+2(0)"
  → "2(2+2(0))"

  e=0 → "2(0)"

→ "2(2(2)+2+2(0))+2(2+2(0))+2(0)"  ✓
```

---

## 代码

```cpp
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 将 n 分解为 2 的幂次指数，降序返回
vector<int> decompose(int n) {
    vector<int> exps;
    for (int e = 0; n > 0; e++, n >>= 1) {
        if (n & 1)
            exps.push_back(e);
    }
    reverse(exps.begin(), exps.end());
    return exps;
}

// 递归输出 n 的幂次方表示
void dfs(int n) {
    vector<int> exps = decompose(n);
    for (size_t i = 0; i < exps.size(); i++) {
        if (i > 0)
            cout << "+";
        if (exps[i] == 0)
            cout << "2(0)";
        else if (exps[i] == 1)
            cout << "2";
        else {
            cout << "2(";
            dfs(exps[i]);       // 指数 > 1 → 递归
            cout << ")";
        }
    }
}

int main() {
    int n;
    cin >> n;
    dfs(n);
    return 0;
}
```

| 项目 | 值 |
|------|-----|
| 时间 | $O(\log n)$ 级别，n ≤ 20000 时递归深度极浅 |
| 空间 | $O(\log n)$，存指数数组 + 递归栈 |

---

## 常见错误

### 1. 忘了 $2^1$ 要输出 `2` 而不是 `2(1)`

```cpp
// ✗ 错误
if (exps[i] == 0)
    cout << "2(0)";
else
    cout << "2(" << exps[i] << ")";  // 会把 2^1 输出成 2(1)
```

题目约定 $2^1$ 直接用 `2` 表示，不加括号。这是最容易漏的特判。

### 2. 指数数组忘了 reverse

```cpp
// ✗ 输出顺序错乱
for (int e = 0; n > 0; e++, n >>= 1)
    if (n & 1) exps.push_back(e);
// exps = [0, 3, 7] 升序，但需要降序输出
```

二进制逐位提取天然按升序排列（e 从 0 往上走），必须 `reverse` 后才能从大到小输出。

### 3. 末尾多了一个 `+`

```cpp
// ✗ 错误：末尾多出 "+"
for (auto e : exps) {
    dfs_single(e);
    cout << "+";    // 最后一项后面多了个 "+"
}
// ✓ 正确：只在非首项前加 "+"
if (i > 0) cout << "+";
```

---

## 总结

1. **二进制拆解**：`n & 1` 逐位检查，为 1 的位就是 2 的幂次指数
2. **递归出口**：`e == 0` → `2(0)`，`e == 1` → `2`
3. **递归深入**：`e > 1` → `2( dfs(e) )`，把指数当新的 n 处理
4. **降序输出**：二进制提取是升序，记得 `reverse`
5. **`+` 的位置**：项之间加，末尾不加，用 `if (i > 0)` 控制

## 关联概念

- 递归 — 递归展开结构
- [luogu-p1228-地毯填补问题](/articles/algorithms/solutions/luogu-p1228/) — 另一道分治递归（棋盘覆盖）
- [luogu-p1259-黑白棋子的移动](/articles/algorithms/solutions/luogu-p1259/) — 递归构造 + 硬编码收尾
