---
type: concept
domain: programming
course: cpp
title: vector
description: vector的知识整理，涵盖初始化、常用方法、相关概念。
created: 2026-06-22
updated: 2026-06-22
tags:
  - C++
  - STL
status: growing
publish: true
slug: programming/cpp/concepts/vector
difficulty: 入门
featured: false
---

# vector

C++ STL 中的可变长数组，可随时添加和删除元素。底层在**堆**上分配内存（普通数组在栈上）。

头文件：`#include <vector>`

## 初始化

### 一维

```cpp
vector<int> a;                     // 空 vector
vector<int> v(n);                  // 长度 n，默认值 0
vector<int> v(n, 1);               // 长度 n，初始值 1
vector<int> v{1, 2, 3, 4, 5};     // 列表初始化
vector<int> b(a);                  // 拷贝构造
vector<int> c = a;                 // 拷贝赋值
```

### 二维

```cpp
vector<int> v[5];                                   // 一维固定 5，二维动态
vector<vector<int>> v;                              // 行列均动态
vector<vector<int>> v(n, vector<int>(m, 0));        // n 行 m 列，初始值 0
```

## 常用方法

| 方法 | 说明 | 复杂度 |
|------|------|--------|
| `v.push_back(x)` | 末尾添加元素 | O(1) |
| `v.pop_back()` | 删除末尾元素 | O(1) |
| `v.size()` | 返回元素个数 | O(1) |
| `v.empty()` | 判空 | O(1) |
| `v.clear()` | 清空 | O(n) |
| `v.front()` / `v.back()` | 首/尾元素 | O(1) |
| `v[i]` | 随机访问 | O(1) |
| `v.insert(it, x)` | 在迭代器位置插入 | O(n) |
| `v.erase(it)` | 删除迭代器位置元素 | O(n) |

## 相关概念

- STL — 标准模板库概览
- [std::sort](/articles/programming/cpp/concepts/std-sort/) — 对 `vector` 及其中的复合元素排序
- 数组
