# FuncPeek 常用命令

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式（自动监听文件变化）
pnpm run watch

# 按 F5 在 VSCode 中启动调试
```

## 📦 构建命令

### 基本构建

```bash
# 开发模式编译
pnpm run compile

# 或使用别名
pnpm run build
```

### 生产模式构建

```bash
# 生产模式编译（压缩代码）
pnpm run package

# 或使用别名
pnpm run build:prod
```

## 📦 打包命令

### 创建 VSIX 安装包

```bash
# 方法 1: 完整打包流程（推荐）
pnpm run create-vsix
# 这会自动执行：
# 1. 编译生产版本
# 2. 创建 .vsix 文件

# 方法 2: 只打包（需先编译）
pnpm run vsce:package

# 方法 3: 直接使用 vsce
npx vsce package
```

### 发布到 VSCode Marketplace

```bash
# 发布扩展（需要 Personal Access Token）
pnpm run vsce:publish
```

## 🔧 安装与卸载

### 本地安装

```bash
# 安装本地 .vsix 文件
pnpm run install-local

# 或手动安装
code --install-extension funcpeek-0.0.1.vsix
```

### 卸载扩展

```bash
# 卸载扩展
pnpm run uninstall

# 或手动卸载
code --uninstall-extension funcpeek.funcpeek
```

### 完全重新安装

```bash
# 卸载 -> 打包 -> 安装（一键完成）
pnpm run reinstall
```

## 🧹 清理命令

```bash
# 清理所有构建产物和 .vsix 文件
pnpm run clean

# 清理后重新安装依赖
pnpm run clean && pnpm install
```

## 🧪 测试命令

```bash
# 运行测试
pnpm run test

# 编译测试文件
pnpm run compile-tests

# 监听测试文件变化
pnpm run watch-tests

# 运行代码检查
pnpm run lint
```

## 🔄 开发工作流

### 日常开发

```bash
# 1. 启动监听模式
pnpm run watch

# 2. 按 F5 在 VSCode 中启动扩展开发主机
# 3. 修改代码会自动重新编译
# 4. 在扩展开发主机中测试功能
```

### 完整测试流程

```bash
# 1. 编译代码
pnpm run build

# 2. 运行测试
pnpm run test

# 3. 本地安装测试
pnpm run create-vsix
pnpm run install-local

# 4. 在 VSCode 中测试实际使用
```

### 发布准备

```bash
# 1. 清理旧文件
pnpm run clean

# 2. 重新安装依赖
pnpm install

# 3. 运行测试
pnpm run test

# 4. 创建发布包
pnpm run create-vsix

# 5. 验证 .vsix 文件
ls -lh *.vsix
```

## 📋 命令速查表

| 命令 | 说明 | 用途 |
|------|------|------|
| `pnpm run compile` | 开发模式编译 | 快速编译，包含 source map |
| `pnpm run watch` | 监听文件变化 | 开发时自动重新编译 |
| `pnpm run build` | 构建（开发） | 同 compile |
| `pnpm run package` | 生产模式编译 | 压缩代码，用于发布 |
| `pnpm run build:prod` | 构建（生产） | 同 package |
| `pnpm run vsce:package` | 打包 VSIX | 创建安装包 |
| `pnpm run create-vsix` | 完整打包 | 编译 + 打包 |
| `pnpm run install-local` | 本地安装 | 安装到 VSCode |
| `pnpm run uninstall` | 卸载扩展 | 从 VSCode 卸载 |
| `pnpm run reinstall` | 重新安装 | 卸载 + 打包 + 安装 |
| `pnpm run clean` | 清理文件 | 删除构建产物 |
| `pnpm run lint` | 代码检查 | ESLint 检查 |
| `pnpm run test` | 运行测试 | 执行单元测试 |

## 🎯 常见使用场景

### 场景 1: 第一次使用

```bash
# 克隆或打开项目后
pnpm install
pnpm run watch
# 按 F5 启动调试
```

### 场景 2: 修改代码后测试

```bash
# 代码会自动编译（如果 watch 在运行）
# 在扩展开发主机中重新加载窗口测试
# 快捷键: Ctrl+R 或 Cmd+R
```

### 场景 3: 创建安装包分享

```bash
# 完整流程
pnpm run create-vsix

# 生成的文件
ls funcpeek-0.0.1.vsix

# 分享给其他人安装
code --install-extension funcpeek-0.0.1.vsix
```

### 场景 4: 代码重构后验证

```bash
# 1. 清理旧文件
pnpm run clean

# 2. 重新编译
pnpm run build

# 3. 运行测试
pnpm run test

# 4. 本地安装测试
pnpm run reinstall
```

## 💡 提示和技巧

### 快速重新加载扩展

在扩展开发主机窗口中：
- Windows/Linux: `Ctrl + R`
- macOS: `Cmd + R`

### 查看扩展日志

1. 打开开发者工具: `Help` > `Toggle Developer Tools`
2. 查看 Console 标签
3. 搜索 "FuncPeek" 查看相关日志

### 调试扩展

1. 在源代码中设置断点
2. 按 `F5` 启动调试
3. 在扩展开发主机中触发功能
4. 断点会在主 VSCode 窗口中命中

### 构建大小优化

```bash
# 查看打包后的文件大小
pnpm run build:prod
ls -lh dist/

# 当前大小: ~32KB (已优化)
```

## 🔍 故障排除

### 编译失败

```bash
# 清理并重新安装
pnpm run clean
rm -rf node_modules
pnpm install
pnpm run build
```

### 扩展安装失败

```bash
# 先卸载旧版本
pnpm run uninstall

# 重新创建和安装
pnpm run create-vsix
pnpm run install-local
```

### VSCode 没有加载扩展

```bash
# 检查扩展是否安装
code --list-extensions | grep funcpeek

# 重启 VSCode
# 或重新加载窗口: Developer: Reload Window
```

## 📚 相关文档

- [README.md](README.md) - 项目介绍和功能说明
- [INSTALLATION.md](INSTALLATION.md) - 详细安装指南
- [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - 代码重构说明
- [TEST_GUIDE.md](TEST_GUIDE.md) - 测试指南

---

**快乐编码！** 🎉
