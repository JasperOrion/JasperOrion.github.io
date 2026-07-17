---
type: solution
domain: algorithms
title: P1255 数楼梯
description: P1255 数楼梯的算法题解，涵盖题目、思路、解法、相关题目。
created: 2026-07-11
updated: 2026-07-11
tags:
  - 动态规划
  - 斐波那契
  - 高精度
  - 题解
  - 基础
status: mature
publish: true
slug: algorithms/solutions/luogu-p1255
difficulty: easy
featured: false
---

# P1255 数楼梯

## 题目

> 楼梯有 N 阶，上楼可以一步上一阶，也可以一步上二阶。编一个程序，计算共有多少种不同的走法。

- 对于 60% 的数据，N ≤ 50
- 对于 **100%** 的数据，1 ≤ N ≤ **5000**

## 思路

### 递推公式

走到第 n 级台阶，最后一步只有两种情况：

- 从第 n-1 级走 1 步上来
- 从第 n-2 级走 2 步上来

所以 `F(n) = F(n-1) + F(n-2)`，其中 `F(1)=1, F(2)=2`。这本质上是**斐波那契数列**（只是起始值略有不同）。

### 核心难点：数据溢出

递推本身很简单，真正的考点是 **N 最大到 5000**。斐波那契数列呈指数增长：

$$
F(n) \approx \frac{\varphi^n}{\sqrt{5}}, \quad \varphi \approx 1.618
$$

当 N=5000 时，答案约有 **1045 位十进制数字**。作为对比：

| 类型 | 最大可表示值 | 位数上限 |
|------|------------|---------|
| `int` | ~2.1×10⁹ | 10 位 |
| `long long` | ~9.2×10¹⁸ | 19 位 |
| `unsigned long long` | ~1.8×10¹⁹ | 20 位 |

全部不够用。必须使用**高精度计算**（大整数运算）。

### 高精度加法原理

核心思想：**用一个数组模拟竖式加法**，数组的每个元素存一位十进制数字。

类比：就像在草稿纸上列竖式 —— 从最低位开始逐位相加，满 10 进 1。数组只不过是把这张"草稿纸"搬到了程序里。

```
以 456 + 789 为例（数组低位在前）：

  a = [6, 5, 4]   代表 456
  b = [9, 8, 7]   代表 789
  ─────────────────
  个位: 6+9=15 → 写 5 进 1
  十位: 5+8+1=14 → 写 4 进 1
  百位: 4+7+1=12 → 写 2 进 1
  千位: 进位 1 → 写 1

  res = [5, 4, 2, 1] → 逆序输出: 1245 ✓
```

---

## 解法

### 方法一：`vector<int>` 模拟高精度（推荐）

**存储方向**：`vector[0]` 存个位，`vector[1]` 存十位，以此类推。这样进位时直接 `push_back`，最自然。

- **时间复杂度**：O(N²)（N 次加法，每次处理 ~N 位）
- **空间复杂度**：O(N)（只保留最近两个数）

```cpp
#include <iostream>
#include <vector>
using namespace std;

// 高精度加法：a + b
vector<int> add(const vector<int>& a, const vector<int>& b) {
    vector<int> res;
    int carry = 0;
    int i = 0;
    while (i < a.size() || i < b.size() || carry) {
        int sum = carry;
        if (i < a.size()) sum += a[i];
        if (i < b.size()) sum += b[i];
        res.push_back(sum % 10);
        carry = sum / 10;
        i++;
    }
    return res;
}

int main() {
    int n;
    cin >> n;

    vector<int> prev2 = {1};  // F(1) = 1
    vector<int> prev1 = {2};  // F(2) = 2

    if (n == 1) { cout << "1\n"; return 0; }
    if (n == 2) { cout << "2\n"; return 0; }

    vector<int> cur;
    for (int i = 3; i <= n; i++) {
        cur = add(prev1, prev2);
        prev2 = prev1;
        prev1 = cur;
    }

    // 逆序输出（低位在前 → 高位在前）
    for (int i = cur.size() - 1; i >= 0; i--)
        cout << cur[i];
    cout << endl;

    return 0;
}
```

### 方法二：`string` 模拟高精度

用 `string` 存大整数，字符与数字的转换是核心技巧：`c - '0'` 转数字，`d + '0'` 转字符。

- **时间复杂度**：O(N²)
- **空间复杂度**：O(N)

```cpp
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string addStrings(const string& a, const string& b) {
    string res;
    int i = a.size() - 1, j = b.size() - 1, carry = 0;
    while (i >= 0 || j >= 0 || carry) {
        int sum = carry;
        if (i >= 0) sum += a[i--] - '0';
        if (j >= 0) sum += b[j--] - '0';
        res.push_back(sum % 10 + '0');
        carry = sum / 10;
    }
    reverse(res.begin(), res.end());
    return res;
}

int main() {
    int n;
    cin >> n;

    if (n == 1) { cout << "1\n"; return 0; }
    if (n == 2) { cout << "2\n"; return 0; }

    string prev2 = "1", prev1 = "2", cur;
    for (int i = 3; i <= n; i++) {
        cur = addStrings(prev1, prev2);
        prev2 = prev1;
        prev1 = cur;
    }
    cout << cur << endl;
    return 0;
}
```

### 两种写法对比

| 维度 | `vector<int>` | `string` |
|------|--------------|----------|
| **存储方向** | 低位在前 → `push_back` 自然 | 高位在前 → 最后要 `reverse` |
| **类型转换** | 无需转换 | `- '0'` / `+ '0'` |
| **可读性** | 数学含义更直观 | 输出更方便（直接 `cout`） |
| **推荐场景** | 需要乘除法扩展时 | 纯加法、追求简洁时 |

---

## 总结

1. **递推公式**：F(n) = F(n-1) + F(n-2)，和斐波那契数列本质相同
2. **数据溢出是真正的考点**：N=5000 时答案有 ~1045 位，任何标准整数类型都装不下
3. **高精度加法 = 数组模拟竖式**：低位在前存数组，逐位相加 + 进位，循环条件别忘了 `|| carry`
4. **`vector<int>` vs `string`**：前者用数字数组（无类型转换），后者用字符串（输出方便），思路完全一样

## 相关题目

- leetcode-70-climbing-stairs — 同类型但数据范围小（N≤45），不需要高精度
- 高精度计算相关概念（高精度加法、高精度乘法……可扩展阅读）

## 关联概念

- [高精度计算](/articles/algorithms/concepts/高精度计算/) — 高精度算法通用框架
- 动态规划 — 斐波那契/爬楼梯是最简单的 DP
