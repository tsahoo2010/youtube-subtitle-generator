#!/usr/bin/env python3
"""
Python script to translate text using deep-translator library
This provides a more reliable translation fallback when Google Translate APIs fail
"""

import sys
import json
from deep_translator import GoogleTranslator

def translate_text(text, source_lang, target_lang):
    """
    Translate text using deep-translator's GoogleTranslator
    
    Args:
        text: Text to translate
        source_lang: Source language code (e.g., 'en')
        target_lang: Target language code (e.g., 'es')
    
    Returns:
        Translated text
    """
    try:
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated = translator.translate(text)
        return translated
    except Exception as e:
        raise Exception(f"Deep-translator error: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: python deepTranslator.py <text> <source_lang> <target_lang>"}))
        sys.exit(1)
    
    text = sys.argv[1]
    source_lang = sys.argv[2]
    target_lang = sys.argv[3]
    
    try:
        result = translate_text(text, source_lang, target_lang)
        print(json.dumps({"success": True, "translation": result}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
