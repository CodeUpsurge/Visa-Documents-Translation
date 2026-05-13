# 签证翻译件生成器 / Visa Document Translator

一个基于Web的签证翻译件生成工具，支持PDF、Excel和图片文件，自动识别内容并生成Word格式翻译件。

## 功能特点

- 支持多种文件格式：PDF、Excel (.xlsx, .xls)、图片 (PNG, JPG, GIF, WebP, BMP)
- 自动识别文档类型和内容
- 智能翻译（使用智谱AI GLM-4V-Flash模型）
- 保持原文布局
- 多文件合并到一个Word文档
- 自动生成目录
- 支持多种语言翻译

## 安装依赖

```bash
pip install -r requirements.txt
```

### Windows额外依赖

PDF转图片功能需要安装Poppler：

1. 下载Poppler for Windows: https://github.com/oschwartz10612/poppler-windows/releases
2. 解压到 `C:\Program Files\poppler`
3. 将 `C:\Program Files\poppler\Library\bin` 添加到系统PATH

或者直接使用Conda安装：
```bash
conda install -c conda-forge poppler
```

## 运行

```bash
python app.py
```

然后在浏览器中访问：http://localhost:5000

## 使用方法

1. 打开网页
2. 拖拽或选择要翻译的文件（支持多选）
3. 选择原文语言和目标语言
4. 点击"生成翻译件"按钮
5. 等待处理完成后下载Word文档

## 支持的语言

- 中文
- English (en)
- 日本語
- 한국어 (ko)
- Français (fr)
- Deutsch (de)
- Español (es)
- Русский (ru)

## 配置

可以通过环境变量配置：

- `ZHIPU_API_KEY`: 智谱AI API密钥
- `SECRET_KEY`: Flask密钥

## 技术栈

- 后端：Flask
- 前端：Bootstrap 5 + 原生JavaScript
- AI服务：智谱AI GLM-4V-Flash
- 文档处理：python-docx, pdf2image, openpyxl, Pillow

## 注意事项

1. 文件大小限制：50MB
2. 翻译结果仅供参考，请以原件为准
3. 建议使用清晰的扫描件或照片以获得最佳识别效果

## License

MIT