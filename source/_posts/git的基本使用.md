---
title: git的基本使用
date: 2025-04-27 17:24:49
tags: 标签
---

### **1. 仓库初始化 & 克隆**
- `git init`  
  初始化当前目录为 Git 仓库。
- `git clone <远程仓库地址>`  
  克隆远程仓库到本地（默认克隆主分支）。

---

### **2. 基础操作**
- `git add <文件名>`  
  将文件添加到暂存区（Stage）。
- `git add .`  
  添加当前目录下所有修改的文件到暂存区。
- `git commit -m "提交说明"`  
  提交暂存区的修改到本地仓库。
- `git commit --amend`  
  修改最近一次提交的说明或内容（未推送到远程时可用）。

---

### **3. 分支管理**
- `git branch`  
  查看本地所有分支（当前分支前有 `*` 号）。
- `git branch <分支名>`  
  创建新分支。
- `git checkout <分支名>`  
  切换到指定分支。
- `git checkout -b <新分支名>`  
  创建并切换到新分支（常用快捷操作）。
- `git merge <分支名>`  
  将指定分支合并到当前分支。
- `git branch -d <分支名>`  
  删除本地分支（需先切换到其他分支）。
- `git branch -D <分支名>`  
  强制删除未合并的分支。

---

### **4. 远程仓库操作**
- `git remote add <远程名称> <远程仓库地址>`  
  添加远程仓库（默认远程名称通常为 `origin`）。
- `git remote -v`  
  查看已关联的远程仓库地址。
- `git push <远程名称> <分支名>`  
  推送本地分支到远程仓库（如 `git push origin main`）。
- `git push -u <远程名称> <分支名>`  
  首次推送并设置默认上游分支（后续可直接 `git push`）。
- `git pull <远程名称> <分支名>`  
  拉取远程分支的更新并合并到当前分支（相当于 `git fetch` + `git merge`）。
- `git fetch <远程名称>`  
  仅拉取远程仓库的更新，不自动合并。

---

### **5. 撤销与回退**
- `git restore <文件名>`  
  撤销工作区的修改（恢复到最近一次提交状态）。
- `git restore --staged <文件名>`  
  将文件从暂存区移回工作区（取消 `git add` 操作）。
- `git reset --hard <commit_id>`  
  回退到指定提交（丢弃所有未提交的修改，慎用！）。
- `git revert <commit_id>`  
  创建一个新提交来撤销指定提交的修改（安全回退方式）。

---

### **6. 查看信息**
- `git status`  
  查看工作区和暂存区的状态。
- `git log`  
  查看提交历史（按 `q` 退出）。
- `git log --oneline`  
  以简洁模式查看提交历史。
- `git diff`  
  查看工作区与暂存区的差异。
- `git diff --staged`  
  查看暂存区与最新提交的差异。

---

### **7. 标签管理**
- `git tag`  
  查看所有标签。
- `git tag <标签名>`  
  为当前提交创建轻量标签（如 `v1.0`）。
- `git tag -a <标签名> -m "说明"`  
  创建含注释的标签。
- `git push <远程名称> <标签名>`  
  推送标签到远程仓库。
- `git push <远程名称> --tags`  
  推送所有本地标签到远程。

---

### **8. 其他实用命令**
- `git stash`  
  暂存当前未提交的修改（临时切分支时常用）。
- `git stash pop`  
  恢复暂存的修改并删除 stash 记录。
- `git rebase <分支名>`  
  将当前分支变基到目标分支（整理提交历史，需谨慎使用）。
- `git cherry-pick <commit_id>`  
  将指定提交应用到当前分支。
- `git config --global user.name "用户名"`  
  全局配置用户名（首次使用 Git 需设置）。
- `git config --global user.email "邮箱"`  
  全局配置邮箱。

---

### **常用场景示例**
1. **首次推送本地项目到远程仓库**  
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <远程仓库地址>
   git push -u origin main
   ```

2. **解决冲突后继续合并**  
   - 手动编辑冲突文件 → 保存 → `git add <冲突文件>` → `git commit`。

