---
type: solution
domain: algorithms
title: P1106 删数问题
description: P1106 删数问题的算法题解，涵盖题目、思路、正确性证明、解法一：重复寻找下降位置。
created: 2026-07-15
updated: 2026-07-15
tags:
  - 贪心
  - 单调栈
  - 字符串
  - 题解
  - 基础
status: mature
publish: true
slug: algorithms/solutions/luogu-p1106
difficulty: easy
featured: false
source-url: https://www.luogu.com.cn/problem/P1106
---

# P1106 删数问题

## 题目

给定一个不超过 250 位的正整数 `n`，删除其中任意 `k` 个数字，剩余数字保持原来的相对顺序。求能够得到的最小非负整数。

删除后允许出现前导零，但输出时必须去掉前导零；如果结果全部为零，则输出 `0`。

## 思路

### 从直觉到精确策略

因为删除后剩余数字的位数固定，所以数值大小首先由靠前的数字决定。直觉上应优先删除靠前的较大数字，但“较大”需要转化为可执行条件。

从左向右找到第一个满足下列条件的位置：

```text
s[i] > s[i + 1]
```

删除 `s[i]`，可以让较小的 `s[i + 1]` 提前一位，使结果在最早能够变小的位置变小。因此一次删除的贪心策略是：

> 删除从左向右遇到的第一个下降位置。

如果整个序列已经单调不下降，则不存在下降位置。此时删除前面的数字只会让更大或相等的数字提前，所以应该删除末尾数字。

这个过程与 [贪心算法](/articles/algorithms/concepts/贪心算法/) 的交换论证思想一致，也可以使用 单调栈 在线完成。

## 正确性证明

### 情况一：存在下降位置

设 `i` 是第一个满足 `s[i] > s[i + 1]` 的位置，则前缀：

```text
s[0] <= s[1] <= ... <= s[i]
```

- 如果删除 `i` 之前的某一位，提前的下一位不会比被删除数字更小，因此不能在更早位置获得更小结果。
- 如果删除 `i` 之后的某一位，结果仍保留前缀 `s[0...i]`；删除 `s[i]` 则会让更小的 `s[i + 1]` 提前。

因此，删除第一个下降位置能够使结果在最早可能变化的位置取得最小数字，是当前安全的贪心选择。

### 情况二：不存在下降位置

若序列单调不下降，删除任意非末尾数字都会让一个更大或相等的数字提前。删除末尾不会改变前面的较小前缀，因此删除末尾最优。

重复执行上述安全选择，直到删除 `k` 位，即得到全局最优结果。

## 解法一：重复寻找下降位置

每次从头寻找第一个下降位置并删除；如果没有下降位置，则删除末尾。

- 时间复杂度：`O(nk)`。
- 空间复杂度：`O(1)`，不计字符串内部移动产生的开销。

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string number;
    int k;
    cin >> number >> k;

    while (k-- > 0) {
        int position = static_cast<int>(number.size()) - 1;

        for (int i = 0; i + 1 < number.size(); ++i) {
            if (number[i] > number[i + 1]) {
                position = i;
                break;
            }
        }

        number.erase(position, 1);
    }

    int firstNonZero = 0;
    while (firstNonZero < number.size() &&
           number[firstNonZero] == '0') {
        ++firstNonZero;
    }

    if (firstNonZero == number.size()) {
        cout << 0 << '\n';
    } else {
        cout << number.substr(firstNonZero) << '\n';
    }
}
```

题目长度最多为 250，这种写法足以表达核心贪心思想。

## 解法二：单调栈优化

维护一个单调不下降的结果字符串。读入当前数字 `digit` 时，如果栈顶比它大，就出现了下降位置；只要还有删除次数，就不断弹出栈顶。

```cpp
while (!result.empty() &&
       k > 0 &&
       result.back() > digit) {
    result.pop_back();
    --k;
}
```

如果扫描结束后仍有删除次数，说明剩余结果单调不下降，应从末尾继续删除。

- 时间复杂度：`O(n)`。
- 空间复杂度：`O(n)`。

每个数字最多进入结果一次、被弹出一次，因此嵌套的 `while` 不会使总复杂度超过线性级别。

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string number;
    int k;
    cin >> number >> k;

    string result;

    for (char digit : number) {
        while (!result.empty() &&
               k > 0 &&
               result.back() > digit) {
            result.pop_back();
            --k;
        }

        result.push_back(digit);
    }

    while (k > 0) {
        result.pop_back();
        --k;
    }

    int firstNonZero = 0;
    while (firstNonZero < result.size() &&
           result[firstNonZero] == '0') {
        ++firstNonZero;
    }

    if (firstNonZero == result.size()) {
        cout << 0 << '\n';
    } else {
        cout << result.substr(firstNonZero) << '\n';
    }

    return 0;
}
```

## 样例分析

输入：

```text
175438
4
```

按第一个下降位置重复删除：

```text
175438  删除 7 → 15438
15438   删除 5 → 1438
1438    删除 4 → 138
138     已单调递增，删除末尾 8 → 13
```

最终输出：

```text
13
```

## 易错点

- 删除全局最大数字，而不是第一个下降位置；位置的重要性高于数字的绝对大小。
- 将比较条件写成 `>=`。相等时不应删除靠前数字，否则可能破坏较小前缀。
- 扫描结束后忘记处理剩余的 `k`，例如 `12345` 需要从末尾删除。
- 忘记删除前导零；结果全为零时应输出一个 `0`。
- 使用整数类型读取原数；原数最多 250 位，必须使用字符串。

## 总结

- 固定位数的整数按字典序比较，越靠前的位置越重要。
- 一次删除应选择第一个满足 `s[i] > s[i + 1]` 的位置。
- 序列单调不下降时，从末尾删除。
- 单调栈能在一次扫描中反复执行该贪心策略，将复杂度优化为 `O(n)`。

## 相关题目与概念

- [贪心算法](/articles/algorithms/concepts/贪心算法/)
- 单调栈
- 字符串
- 贪心主题索引
