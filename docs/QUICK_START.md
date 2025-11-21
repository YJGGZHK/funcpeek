# FuncPeek 快速开始指南

## ⚡ 5 分钟上手

### 1. 安装扩展

```bash
# 使用命令行安装
code --install-extension funcpeek-0.0.1.vsix
```

或在 VSCode 中：
1. 扩展面板 → 右上角 ... → 从 VSIX 安装
2. 选择 `funcpeek-0.0.1.vsix`

### 2. 基本使用

```
1. 打开任意代码文件（.ts/.js/.py/.java）
2. 选中一个函数名
3. 右键 → "Peek Function Usage"
4. 查看侧边栏显示的用例
```

### 3. 可选：配置 AI

设置 → 搜索 "FuncPeek" → 配置：
- ✅ `funcpeek.ai.enabled`: true
- 🔑 `funcpeek.ai.apiKey`: 你的 API Key
- 🌐 `funcpeek.ai.endpoint`: API 地址（默认 OpenAI）

## 🎯 开发常用命令

```bash
# 开发模式（推荐）
pnpm run watch
# 然后按 F5 启动调试

# 创建安装包
pnpm run create-vsix

# 本地安装测试
pnpm run install-local

# 完全重装
pnpm run reinstall

# 清理构建文件
pnpm run clean
```

## 📦 已生成的文件

- ✅ `funcpeek-0.0.1.vsix` (72 KB) - 安装包
- 📁 `dist/extension.js` (32 KB) - 编译后的代码

## 🎨 功能特性

✅ 智能函数识别（支持只选函数名）  
✅ 代码库真实用例搜索  
✅ AI 智能生成（可选）  
✅ 使用历史记录  
✅ 多语言支持（TS/JS/Python/Java）

## 📚 更多文档

- [COMMANDS.md](COMMANDS.md) - 完整命令列表
- [INSTALLATION.md](INSTALLATION.md) - 详细安装说明
- [README.md](README.md) - 项目文档

## 🆘 遇到问题？

```bash
# 重新编译
pnpm run build

# 查看日志
# VSCode → Help → Toggle Developer Tools → Console

# 完全重装
pnpm run reinstall
```

---

**开始使用吧！** 🚀
