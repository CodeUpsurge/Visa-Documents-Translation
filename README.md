[中文](#简介) | [English](#introduction)

---

# 签证翻译件生成器 / Visa Document Translator

一个基于Web的签证翻译件生成工具，支持PDF、Excel和图片文件，自动识别内容并生成Word格式翻译件。

## 简介

本项目提供自动化工具，帮助用户将签证申请材料（护照、身份证、结婚证、工作证明等）翻译成目标语言，并生成标准格式的Word文档。

**重要提示**：
- ❗ 本翻译仅供参考，不具备法律效力。
- ❗ 申请签证时，请务必以官方语言版本或领事馆要求的版本为准。
- ❗ 建议使用清晰的扫描件或照片以获得最佳识别效果。

## 功能特点

- 支持多种文件格式：PDF、Excel (.xlsx, .xls)、图片 (PNG, JPG, GIF, WebP, BMP)
- 自动识别文档类型和内容
- 智能翻译（使用智谱AI GLM-4V-Flash模型）
- 保持原文布局
- 多文件合并到一个Word文档
- 自动生成目录
- 支持多种语言翻译（中文、英文、日文、韩文等）

---

# Introduction

A web-based visa document translation tool that supports PDF, Excel, and image files, automatically recognizing content and generating Word format translations.

## Features

- Support for multiple file formats: PDF, Excel (.xlsx, .xls), Images (PNG, JPG, GIF, WebP, BMP)
- Automatic document type and content recognition
- AI-powered translation using Zhipu AI GLM-4V-Flash model
- Preserves original document layout
- Merge multiple files into one Word document
- Automatic table of contents generation
- Multi-language support (Chinese, English, Japanese, Korean, etc.)

**Important Notes**:
- ❗ These translations are for reference only and are not legally binding.
- ❗ Always refer to the official language version or the version required by the consulate when applying for a visa.
- ❗ Use clear scans or photos for best recognition results.

---

## 安装依赖 / Installation

```bash
pip install -r requirements.txt
```

### Windows额外依赖 / Windows Additional Dependencies

PDF转图片功能需要安装Poppler：

1. 下载Poppler for Windows: https://github.com/oschwartz10612/poppler-windows/releases
2. 解压到 `C:\Program Files\poppler`
3. 将 `C:\Program Files\poppler\Library\bin` 添加到系统PATH

Or using Conda:
```bash
conda install -c conda-forge poppler
```

## 运行 / Running

```bash
python app.py
```

然后在浏览器中访问：http://localhost:5000

## 使用方法 / Usage

1. 打开网页 / Open the web page
2. 拖拽或选择要翻译的文件 / Drag or select files to translate
3. 选择原文语言和目标语言 / Select source and target languages
4. 点击"生成翻译件"按钮 / Click "Generate Translation" button
5. 等待处理完成后下载Word文档 / Download the Word document when processing completes

## 支持的语言 / Supported Languages

- 中文
- English (en)
- 日本語
- 한국어 (ko)
- Français (fr)
- Deutsch (de)
- Español (es)
- Русский (ru)

## 技术栈 / Tech Stack

- 后端 / Backend: Flask
- 前端 / Frontend: Bootstrap 5 + JavaScript
- AI服务 / AI Service: 智谱AI GLM-4V-Flash
- 文档处理 / Document Processing: python-docx, pdf2image, openpyxl, Pillow

## 注意事项 / Notes

1. 文件大小限制 / File size limit: 50MB
2. 翻译结果仅供参考 / Translation is for reference only
3. 建议使用清晰的扫描件 / Use clear scans for best results

---

## 如何贡献 / How to Contribute

1. Fork 本仓库 / Fork this repository
2. 创建功能分支 / Create a feature branch
3. 提交更改 / Commit your changes
4. 推送到分支 / Push to the branch
5. 提交 Pull Request / Open a Pull Request

## License 许可证

This project is licensed under the MIT License.

本项目采用 MIT 许可证 进行许可。
