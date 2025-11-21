# 通用化重构 (2025-11-21)

## 🎯 核心改进：从函数限制到通用搜索

按照你的建议，**彻底简化了整个扩展的逻辑**，不再限制只支持函数。

### 之前的限制 ❌

```
只能选中函数
  ↓
必须匹配复杂的函数模式
  ↓
如果不是标准函数格式 → 报错
  ↓
只显示函数的用例
```

**问题**：
- 无法搜索变量、常量、类名
- 复杂的正则匹配容易失败
- 用户体验差，限制太多

### 现在的通用方案 ✅

```
选中任何文本
  ↓
直接在仓库里搜索
  ↓
显示所有使用的地方
  ↓
让用户看到真实用例
```

**优点**：
- 支持**任何代码**：函数、变量、常量、类名、方法名
- 简单直接，不依赖复杂的模式匹配
- 用户只需选中文本，就能看到用法
- 更快、更可靠

## 📝 主要修改

### 1. 简化 extension.ts

**文件**: [src/extension.ts](src/extension.ts:77-134)

```typescript
// 之前：必须是函数才能继续
const functionInfo = FunctionAnalyzer.analyzeSelectedFunction(editor);
if (!functionInfo) {
    vscode.window.showWarningMessage('必须选择有效的函数');
    return;
}

// 现在：任何文本都可以
const selectedText = editor.document.getText(selection).trim();
const functionInfo = FunctionAnalyzer.analyzeSelectedFunction(editor);

// 如果是函数，用函数信息；否则创建简单信息
const searchInfo = functionInfo || {
    name: selectedText,
    signature: selectedText,
    parameters: [],
    returnType: 'unknown',
    language: editor.document.languageId,
    filePath: editor.document.fileName,
    lineNumber: selection.start.line + 1
};

// 直接搜索
const realUsages = await findRealUsages(searchInfo);
```

### 2. 更新命令名称

**文件**: [package.json](package.json:3-4)

```json
// 之前
"displayName": "FuncPeek - Function Usage Helper"
"description": "Quickly get function usage examples"

// 现在
"displayName": "FuncPeek - Code Usage Finder"
"description": "Find usage examples for any selected code - functions, variables, constants, classes"
```

命令改名：
- `Peek Function Usage` → `Find Usage Examples`
- `Clear Function History` → `Clear Search History`

## 🚀 现在支持的用例

### ✅ 函数
```typescript
function calculateTotal(items: Item[]): number { }
         ^^^^^^^^^^^^^^
         选这个，找用例
```

### ✅ 变量
```typescript
const API_ENDPOINT = "https://api.example.com";
      ^^^^^^^^^^^^
      选这个，找所有使用的地方
```

### ✅ 常量
```typescript
export const MAX_RETRIES = 3;
             ^^^^^^^^^^^
             选这个，看在哪里用
```

### ✅ 类名
```typescript
class UserService {
      ^^^^^^^^^^^
      选这个，找所有实例化的地方
```

### ✅ 方法名
```typescript
public analyzeSelectedFunction(editor: vscode.TextEditor) { }
       ^^^^^^^^^^^^^^^^^^^^^^^
       选这个，找调用的地方
```

### ✅ 任何标识符
```typescript
import { UsageFinder } from './finders/usageFinder';
         ^^^^^^^^^^^
         选任何标识符都可以
```

## 📦 版本信息

- **版本**: v0.0.1 (通用化版)
- **包大小**: 13.38 KB
- **编译时间**: 2025-11-21

## 💡 使用方式

1. **选中任何代码** - 函数名、变量名、类名都可以
2. **右键** → "Find Usage Examples"
3. **查看所有使用的地方** - 在整个仓库中搜索

## ⚡ 搜索特点

- **搜索范围**: 整个工作区（包括 node_modules）
- **返回数量**: 最多 10 个用例
- **每个文件**: 最多 3 个用例
- **上下文**: 前后各 2 行代码

## 🔧 安装

```bash
# 手动安装
/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin/code \
  --install-extension funcpeek-0.0.1.vsix
```

---

**重构理念**: 简单 > 复杂，通用 > 特定，直接搜索 > 模式匹配

不再限制用户必须选中"标准函数"，任何代码都可以查找用例！ ✨
