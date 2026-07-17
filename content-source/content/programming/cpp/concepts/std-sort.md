---
type: concept
domain: programming
course: cpp
title: std::sort 排序函数
description: std::sort 排序函数的知识整理，涵盖定义、基本类型排序、vector<pair<int, int>> 排序、pair 的默认排序规则。
created: 2026-07-15
updated: 2026-07-15
tags:
  - C++
  - STL
  - 排序
  - 基础
status: growing
publish: true
slug: programming/cpp/concepts/std-sort
difficulty: basic
featured: false
---

# std::sort 排序函数

## 定义

`std::sort` 是 C++ STL 提供的通用排序算法，用于对随机访问迭代器表示的区间进行原地排序。

头文件：

```cpp
#include <algorithm>
```

基本形式：

```cpp
sort(first, last);
sort(first, last, compare);
```

排序区间采用左闭右开形式 `[first, last)`，因此对整个 `vector` 排序时写作：

```cpp
sort(values.begin(), values.end());
```

平均和最坏时间复杂度均为 `O(n log n)`。

## 基本类型排序

### 升序

`std::sort` 默认使用 `<`，因此直接调用就是升序：

```cpp
vector<int> values{4, 1, 3, 2};
sort(values.begin(), values.end());

// 结果：1 2 3 4
```

### 降序

```cpp
#include <functional>

sort(values.begin(), values.end(), greater<int>());
```

也可以使用 lambda：

```cpp
sort(values.begin(), values.end(),
     [](int a, int b) {
         return a > b;
     });
```

## `vector<pair<int, int>>` 排序

假设有：

```cpp
vector<pair<int, int>> apples(n);
```

### 按第二字段升序

```cpp
sort(apples.begin(), apples.end(),
     [](const pair<int, int>& a,
        const pair<int, int>& b) {
         return a.second < b.second;
     });
```

使用 C++14 的泛型 lambda 可以简写为：

```cpp
sort(apples.begin(), apples.end(),
     [](const auto& a, const auto& b) {
         return a.second < b.second;
     });
```

这里比较函数表达的含义是：

> 当 `a.second` 小于 `b.second` 时，`a` 应排列在 `b` 前面。

### 第二字段升序，第一字段升序

如果第二字段相等，再按照第一字段升序：

```cpp
sort(apples.begin(), apples.end(),
     [](const auto& a, const auto& b) {
         if (a.second != b.second) {
             return a.second < b.second;
         }
         return a.first < b.first;
     });
```

也可以利用 `pair` 的字典序比较进行简写：

```cpp
sort(apples.begin(), apples.end(),
     [](const auto& a, const auto& b) {
         return pair{a.second, a.first} <
                pair{b.second, b.first};
     });
```

### 第二字段升序，第一字段降序

```cpp
sort(apples.begin(), apples.end(),
     [](const auto& a, const auto& b) {
         if (a.second != b.second) {
             return a.second < b.second;
         }
         return a.first > b.first;
     });
```

### 按第二字段降序

```cpp
sort(apples.begin(), apples.end(),
     [](const auto& a, const auto& b) {
         return a.second > b.second;
     });
```

## `pair` 的默认排序规则

如果直接写：

```cpp
sort(apples.begin(), apples.end());
```

`pair` 会按照字典序排序：

1. 先比较 `first`；
2. `first` 相等时再比较 `second`。

例如：

```text
(1, 5), (1, 8), (2, 3), (3, 1)
```

因此，直接调用 `sort` 不能实现“只按第二字段升序”，必须提供比较函数。

## 比较函数的规则

比较函数回答的是：

> `a` 是否应该严格排在 `b` 前面？

### 必须使用严格比较

正确：

```cpp
return a.second < b.second;
```

错误：

```cpp
return a.second <= b.second;
```

当 `a` 和 `b` 相等时，`compare(a, b)` 必须返回 `false`。使用 `<=` 或 `>=` 会破坏严格弱序要求，可能导致未定义行为。

### 参数使用常量引用

推荐：

```cpp
[](const auto& a, const auto& b)
```

这样可以：

- 避免复制较大的对象；
- 防止比较过程中修改元素；
- 适用于 `pair`、自定义结构体等类型。

## 自定义结构体排序

```cpp
struct Student {
    string name;
    int score;
    int id;
};

vector<Student> students;
```

按成绩降序，成绩相同时按学号升序：

```cpp
sort(students.begin(), students.end(),
     [](const Student& a, const Student& b) {
         if (a.score != b.score) {
             return a.score > b.score;
         }
         return a.id < b.id;
     });
```

## `sort` 与 `stable_sort`

`std::sort` 不保证相等元素保持原来的相对顺序。

如果只按第二字段排序，并且希望 `second` 相等的元素保持输入顺序，可以使用：

```cpp
stable_sort(apples.begin(), apples.end(),
            [](const auto& a, const auto& b) {
                return a.second < b.second;
            });
```

| 函数 | 相等元素保持原顺序 | 常见额外空间 |
|------|--------------------|--------------|
| `sort` | 不保证 | 较少 |
| `stable_sort` | 保证 | 通常需要额外空间 |

## 常见写法速查

```cpp
// int 升序
sort(v.begin(), v.end());

// int 降序
sort(v.begin(), v.end(), greater<int>());

// pair 默认：first 升序，second 升序
sort(apples.begin(), apples.end());

// pair：second 升序
sort(apples.begin(), apples.end(),
     [](const auto& a, const auto& b) {
         return a.second < b.second;
     });

// pair：second 升序，first 降序
sort(apples.begin(), apples.end(),
     [](const auto& a, const auto& b) {
         if (a.second != b.second) {
             return a.second < b.second;
         }
         return a.first > b.first;
     });
```

## 易错点

- 忘记包含 `<algorithm>`。
- 将 `end()` 当成最后一个元素；实际上它指向末尾元素之后的位置。
- 误以为 `pair` 默认按照 `second` 排序。
- 比较函数使用 `<=` 或 `>=`，破坏严格弱序。
- 多关键字排序时没有处理字段相等的情况。
- 需要保持相等元素的原顺序，却使用了 `sort` 而不是 `stable_sort`。

## 相关概念

- [vector](/articles/programming/cpp/concepts/vector/)
- pair
- Lambda 表达式
- [排序](/articles/algorithms/concepts/排序/)
- [优先队列](/articles/algorithms/concepts/优先队列/) — 动态维护当前最大值或最小值
