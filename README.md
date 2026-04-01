# Minimalist Web Notepad (TypeScript + Next.js)

这是一个使用 **TypeScript + Next.js** 重写的极简 Web 记事本项目。

它的产品行为与交互设计参考并迁移自原项目：
- https://github.com/pereorga/minimalist-web-notepad

原项目是一个极简的在线记事本实现，本项目在尽量保持原有使用体验、URL 语义与核心行为不变的前提下，将技术栈替换为 **Next.js App Router + TypeScript**。

## 说明

本项目保留了原项目的核心体验，包括：
- 通过 URL 直接访问和编辑 note
- 自动保存
- `?raw=1` 纯文本读取
- 使用 `curl` / `Wget` 访问时返回纯文本
- 空内容删除 note
- 极简界面、暗色模式与打印样式

## 技术栈

- Next.js
- TypeScript
- React

## 本地开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

运行测试：

```bash
npm test
```

## 数据存储

note 内容默认存储在项目根目录下的 `_tmp/` 目录中。

> 注意：部署时需要确保运行环境对该目录具有写权限，否则将无法保存 note。

## 致谢与来源

本项目来源于并致敬以下开源项目：
- [pereorga/minimalist-web-notepad](https://github.com/pereorga/minimalist-web-notepad)

本仓库的目标是基于现代前端技术栈进行等价实现，而不是改变原项目的使用方式。
