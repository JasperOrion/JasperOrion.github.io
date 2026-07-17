---
type: solution
domain: algorithms
title: P4447 [AHOI2018 初中组] 分组
description: P4447 [AHOI2018 初中组] 分组的算法题解，涵盖题目、思路、正确性证明、数据结构设计。
created: 2026-07-16
updated: 2026-07-16
tags:
  - 贪心
  - 优先队列
  - 排序
  - 分组
  - 题解
  - 进阶
status: mature
publish: true
slug: algorithms/solutions/luogu-p4447
difficulty: medium
featured: false
source-url: https://www.luogu.com.cn/problem/P4447
---

# P4447 [AHOI2018 初中组] 分组

## 题目

有 `n` 名队员，第 `i` 名队员的实力值为 `a[i]`。需要将所有队员分成若干小组，每个小组必须满足：

1. 组内实力值连续；
2. 同一个实力值在组内最多出现一次。

分组数量不限，要求最大化“人数最少的小组”的人数，并输出这个最大值。实力值可能为负数。

## 思路

### 排序后逐个加入小组

原输入顺序与分组无关，先将实力值升序排列。

处理当前实力值 `x` 时，它只能有两种去向：

- 接到一个以 `x - 1` 结尾的小组后面；
- 如果不存在这样的组，则以 `x` 新建一个长度为 1 的小组。

它不能加入以其他值结尾的小组，否则组内实力不连续；也不能加入已经以 `x` 结尾的小组，否则同组出现重复实力值。

### 贪心选择：延长最短的候选组

如果有多个小组都以 `x - 1` 结尾，应选择其中长度最短的一个延长。

题目优化的是最短组长度。将当前队员加入较长组，只会让长组更长，而较短组可能永久成为最终答案的瓶颈。优先补强最短组能够使各组长度尽量均衡。

例如：

```text
1 2 2 3
```

处理两个 `2` 后存在：

```text
[1, 2]  长度 2
[2]     长度 1
```

处理 `3` 时：

- 接到长组：得到长度 3 和 1，最短为 1；
- 接到短组：得到长度 2 和 2，最短为 2。

所以当前值必须优先延长最短的可行小组。这是 [贪心算法](/articles/algorithms/concepts/贪心算法/) 中的平衡型局部选择。

### 有组可延长时为什么不新建

如果存在长度为 `len`、以 `x - 1` 结尾的小组：

- 延长它会将长度变为 `len + 1`；
- 新建小组会额外制造一个长度为 1 的组，同时旧组没有增长。

由于目标是最大化最短组长度，只要存在合法的可延长小组，新建组就不会更优。

## 正确性证明

### 引理一：当前值只需考虑以 `x - 1` 结尾的小组

组内实力值必须连续且不能重复，所以 `x` 加入已有小组后，其前一个实力值必须为 `x - 1`。其他小组都不是合法候选。

### 引理二：存在候选组时，延长已有组不劣于新建组

新建组会产生一个长度为 1 的新瓶颈；延长已有组不会增加组数，并会增加一个已有组的长度。因此可延长时无需新建组。

### 引理三：延长最短候选组不劣于延长较长组

设两个候选组的长度分别为 `short` 和 `long`，并且：

```text
short <= long
```

某个方案将当前值 `x` 以及未来连续接在其后的后缀加入较长组。如果把这一整段后缀交换到较短组：

```text
交换前：short，long + suffix
交换后：short + suffix，long
```

交换后，原来的短组得到补强；另一个组仍至少具有 `short` 的长度，因此最短组长度不会下降。

所以至少存在一个最优方案，会把当前值接到最短的候选组后面。

### 结论

对排序后的每个实力值，算法都作出可以包含在某个最优方案中的安全选择。重复执行后得到的分组能够最大化最短组长度。

## 数据结构设计

处理当前值 `x` 时，需要快速获得：

> 所有以 `x - 1` 结尾的小组中长度最短的一个。

使用：

```cpp
map<long long, priority_queue<int, vector<int>, greater<int>>> groups;
```

其中：

- `groups[last]` 保存所有以 `last` 结尾的小组长度；
- 小根堆顶部是这些小组中的最短长度；
- 小组加入 `x` 后，从 `groups[x - 1]` 移动到 `groups[x]`，长度增加 1。

这需要用到 [优先队列](/articles/algorithms/concepts/优先队列/) 和 [排序](/articles/algorithms/concepts/排序/)。

## 解法

- 时间复杂度：`O(n log n)`。
- 空间复杂度：`O(n)`。

```cpp
#include <algorithm>
#include <functional>
#include <iostream>
#include <limits>
#include <map>
#include <queue>
#include <vector>
using namespace std;

using MinHeap = priority_queue<int, vector<int>, greater<int>>;

int main() {
    int n;
    cin >> n;

    vector<long long> ability(n);
    for (long long& value : ability) {
        cin >> value;
    }

    sort(ability.begin(), ability.end());

    map<long long, MinHeap> groups;

    for (long long value : ability) {
        auto previous = groups.find(value - 1);

        if (previous != groups.end() && !previous->second.empty()) {
            int shortestLength = previous->second.top();
            previous->second.pop();

            groups[value].push(shortestLength + 1);
        } else {
            groups[value].push(1);
        }
    }

    int answer = numeric_limits<int>::max();

    for (auto& entry : groups) {
        MinHeap& lengths = entry.second;

        if (!lengths.empty()) {
            answer = min(answer, lengths.top());
        }
    }

    cout << answer << '\n';
    return 0;
}
```

## 样例分析

输入：

```text
4 5 2 3 -4 -3 -5
```

排序后：

```text
-5 -4 -3 2 3 4 5
```

处理过程：

| 当前值 | 可延长小组 | 操作结果 |
|-------:|------------|----------|
| -5 | 无 | 新建 `[-5]` |
| -4 | `[-5]` | `[-5,-4]` |
| -3 | `[-5,-4]` | `[-5,-4,-3]` |
| 2 | 无 | 新建 `[2]` |
| 3 | `[2]` | `[2,3]` |
| 4 | `[2,3]` | `[2,3,4]` |
| 5 | `[2,3,4]` | `[2,3,4,5]` |

最终两个小组长度分别为 3 和 4，最短组长度为 3。

## 易错点

- 没有先排序，无法按照连续实力值逐步扩展小组。
- 将 `x` 加入以 `x` 结尾的组；正确候选是以 `x - 1` 结尾的组。
- 有多个候选时延长最长组，导致短组成为最终瓶颈。
- 存在可延长组时仍新建长度为 1 的组。
- 只统计每个实力值的出现次数，没有维护不同小组的当前长度。
- 用一个全局优先队列，无法区分小组当前以哪个实力值结尾。
- 忘记实力值可能为负数；使用 `map` 可以自然处理负数键。

## 总结

- 当前实力值 `x` 只能接到以 `x - 1` 结尾的小组。
- 只要存在合法候选组，就不应新建新组。
- 多个候选组中应选择长度最短的一个，优先补强当前瓶颈。
- 按结尾实力值分类的小根堆可以快速取得最短候选组。
- 排序加堆操作使总时间复杂度为 `O(n log n)`。

## 相关题目与概念

- [贪心算法](/articles/algorithms/concepts/贪心算法/)
- [优先队列](/articles/algorithms/concepts/优先队列/)
- [排序](/articles/algorithms/concepts/排序/)
- 贪心主题索引
