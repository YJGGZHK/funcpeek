# FuncPeek 🚀

一个智能的VS Code扩展，帮助开发者快速理解和使用代码库中的函数、类、方法等各种符号。通过AI驱动的使用示例生成和实时代码搜索，让代码探索变得前所未有的简单。

## ✨ 核心功能

- **🔍 智能符号检测**：支持函数、类、接口、变量、常量、枚举等各种代码符号
- **🎯 实时代码搜索**：在代码库中查找实际使用示例
- **🤖 AI使用示例生成**：基于OpenAI API生成智能使用示例
- **📚 使用历史记录**：跟踪和保存函数使用历史
- **⚡ 多语言支持**：TypeScript、JavaScript、Python、Java
- **🎨 现代化界面**：基于React的美观Webview界面

## 📦 安装

### 从VS Code扩展市场安装（推荐）

1. 打开VS Code
2. 按 `Ctrl/Cmd + Shift + X` 打开扩展面板
3. 搜索 "FuncPeek"
4. 点击安装

### 手动安装

```bash
# 克隆仓库
cd funcpeek

# 安装依赖
pnpm install

# 构建扩展
pnpm run package

# 在VS Code中安装扩展
# 1. 打开VS Code
# 2. 按 Ctrl/Cmd+Shift+P
# 3. 输入 "Extensions: Install from VSIX..."
# 4. 选择生成的 funcpeek-*.vsix 文件
```

## 🚀 快速开始

1. **基本使用**：
   - 在代码编辑器中选择要查看的函数名或符号
   - 按 `Ctrl/Cmd+Shift+P` 打开命令面板
   - 输入并执行 "FuncPeek: Peek Function Usage"
   - 查看函数信息和用法示例

2. **AI功能**（可选）：
   - 配置OpenAI API密钥
   - 在扩展设置中启用AI功能
   - 获得更智能的使用示例生成

## ⚙️ 配置

### AI服务配置

在VS Code设置中搜索 `funcpeek`，配置以下选项：

- `funcpeek.ai.enabled`: 启用/禁用AI功能
- `funcpeek.ai.apiKey`: OpenAI API密钥
- `funcpeek.ai.endpoint`: API端点（默认为OpenAI）
- `funcpeek.ai.model`: AI模型（默认为gpt-3.5-turbo）

### 环境变量配置

你也可以通过环境变量配置：

```bash
export FUNCPEEK_AI_API_KEY="your-api-key"
export FUNCPEEK_AI_ENDPOINT="https://api.openai.com/v1"
export FUNCPEEK_AI_MODEL="gpt-3.5-turbo"
```

## 🛠️ 开发

### 环境要求

- Node.js 18+
- pnpm 8+
- VS Code 1.75+

### 开发设置

```bash
# 安装依赖
pnpm install

# 启动开发模式
pnpm run watch

# 在VS Code中按F5启动扩展开发主机
```

### 构建和打包

```bash
# 构建扩展
pnpm run compile

# 打包扩展
pnpm run package

# 创建VSIX安装包
pnpm run create-vsix
```

### 运行测试

```bash
# 运行所有测试
pnpm run test

# 运行代码检查
pnpm run lint

# 修复代码风格问题
pnpm run lint --fix
```

## 📁 项目结构

```text
funcpeek/
├── src/                    # 扩展源代码
│   ├── analyzers/         # 函数分析器
│   ├── config/            # 配置常量
│   ├── finders/           # 使用示例查找器
│   ├── managers/          # 状态管理
│   ├── services/          # 外部服务集成
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   └── views/             # UI组件
├── webview-ui/            # React前端
│   ├── src/               # React源代码
│   └── build/             # 构建输出
├── docs/                  # 文档
├── dist/                  # 扩展构建输出
└── out/                   # 测试构建输出
```

## 🤝 贡献

我们欢迎所有形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

### 快速贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📝 更新日志

查看 [CHANGELOG.md](docs/CHANGELOG.md) 了解项目的更新历史。


### 报告问题时请包含

- VS Code版本
- 扩展版本
- 操作系统
- 问题描述
- 复现步骤
- 相关代码示例（如果适用）

## 🎯 路线图

- [ ] 支持更多编程语言（C++, Go, Rust）
- [ ] 集成更多AI服务（Claude, Gemini）
- [ ] 添加代码片段收藏功能
- [ ] 支持团队协作和分享
- [ ] 添加性能分析功能

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
