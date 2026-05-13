#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Visa Translator Web Application
Main Flask application entry point
"""

import os
import uuid
import json
from datetime import datetime
from pathlib import Path
from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for

import config
from services.file_processor import FileProcessor
from services.translator import Translator
from services.document_generator import DocumentGenerator

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = str(config.UPLOAD_FOLDER)
app.config['OUTPUT_FOLDER'] = str(config.OUTPUT_FOLDER)
app.config['MAX_CONTENT_LENGTH'] = config.MAX_CONTENT_LENGTH
app.secret_key = config.SECRET_KEY

# Initialize services
file_processor = FileProcessor()
translator = Translator()
doc_generator = DocumentGenerator()


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in config.ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Main page."""
    return render_template('index.html',
                         languages=config.SUPPORTED_LANGUAGES,
                         language_pairs=config.LANGUAGE_PAIRS)


@app.route('/languages')
def get_languages():
    """Get supported languages."""
    return jsonify({
        'languages': config.SUPPORTED_LANGUAGES,
        'language_pairs': config.LANGUAGE_PAIRS
    })


@app.route('/upload', methods=['POST'])
def upload_files():
    """Handle file upload."""
    if 'files[]' not in request.files:
        return jsonify({'error': 'No files provided'}), 400

    files = request.files.getlist('files[]')
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'No files selected'}), 400

    # Create unique session ID
    session_id = str(uuid.uuid4())
    session_dir = Path(app.config['UPLOAD_FOLDER']) / session_id
    session_dir.mkdir(parents=True, exist_ok=True)

    uploaded_files = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = file.filename
            filepath = session_dir / filename
            file.save(filepath)
            uploaded_files.append({
                'filename': filename,
                'filepath': str(filepath),
                'size': filepath.stat().st_size
            })

    if not uploaded_files:
        return jsonify({'error': 'No valid files uploaded'}), 400

    return jsonify({
        'session_id': session_id,
        'files': uploaded_files,
        'count': len(uploaded_files)
    })


@app.route('/process', methods=['POST'])
def process_files():
    """Process uploaded files and generate translation document."""
    data = request.get_json()

    session_id = data.get('session_id')
    source_lang = data.get('source_lang', 'zh')
    target_lang = data.get('target_lang', 'en')
    merge = data.get('merge', True)

    if not session_id:
        return jsonify({'error': 'No session ID provided'}), 400

    session_dir = Path(app.config['UPLOAD_FOLDER']) / session_id
    if not session_dir.exists():
        return jsonify({'error': 'Session not found'}), 404

    try:
        # Get all uploaded files
        files = list(session_dir.glob('*'))
        files = [f for f in files if f.is_file()]

        if not files:
            return jsonify({'error': 'No files to process'}), 400

        # Process each file
        all_images = []
        file_info = []

        for file_path in files:
            # Convert file to images
            images = file_processor.process_file(str(file_path))
            file_info.append({
                'filename': file_path.name,
                'image_count': len(images)
            })
            all_images.extend(images)

        # Translate each image
        translations = []
        for i, image_path in enumerate(all_images):
            result = translator.translate_image(image_path, source_lang, target_lang)
            translations.append({
                'image_path': image_path,
                'translation': result,
                'index': i
            })

        # Generate Word document
        output_id = str(uuid.uuid4())
        output_filename = f"translation_{output_id}.docx"
        output_path = Path(app.config['OUTPUT_FOLDER']) / output_filename

        doc_generator.generate_document(
            translations=translations,
            output_path=str(output_path),
            source_lang=source_lang,
            target_lang=target_lang,
            merge=merge
        )

        # Build sections info for TOC
        sections = []
        for i, (info, trans) in enumerate(zip(file_info, translations)):
            sections.append({
                'title': info['filename'],
                'page': i + 1
            })

        return jsonify({
            'status': 'success',
            'document_id': output_id,
            'download_url': f'/download/{output_filename}',
            'sections': sections,
            'file_info': file_info,
            'total_images': len(all_images)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download/<filename>')
def download_file(filename):
    """Download generated document."""
    output_path = Path(app.config['OUTPUT_FOLDER']) / filename
    if not output_path.exists():
        return jsonify({'error': 'File not found'}), 404

    return send_file(output_path,
                     as_attachment=True,
                     download_name=filename)


@app.route('/cleanup/<session_id>', methods=['POST'])
def cleanup_session(session_id):
    """Clean up session files."""
    import shutil
    session_dir = Path(app.config['UPLOAD_FOLDER']) / session_id
    if session_dir.exists():
        shutil.rmtree(session_dir)
    return jsonify({'status': 'cleaned'})


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({'error': 'File too large. Maximum size is 50MB.'}), 413


@app.errorhandler(500)
def server_error(e):
    """Handle server error."""
    return jsonify({'error': 'Server error. Please try again.'}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
