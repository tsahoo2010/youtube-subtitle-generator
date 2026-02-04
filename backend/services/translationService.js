import axios from 'axios';
import { translate } from '@vitalets/google-translate-api';
import googleTranslate from 'node-google-translate-skidz';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Service for translating text using multiple translation APIs
 * Priority: Google Translate API 1 -> Google Translate API 2 (skidz) -> Deep Translator (Python) -> LibreTranslate -> English fallback
 */
class TranslationService {
  constructor() {
    this.baseUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com';
    this.apiKey = process.env.LIBRETRANSLATE_API_KEY;
    // node-google-translate-skidz is a function, not a class - store reference directly
    this.googleTranslator = googleTranslate;
    // Path to Python deep-translator script
    this.deepTranslatorPath = path.join(__dirname, 'deepTranslator.py');
  }

  /**
   * Language codes mapping
   */
  getLanguageCode(language) {
    const codes = {
      'english': 'en',
      'spanish': 'es',
      'hindi': 'hi',
      'chinese': 'zh'
    };
    return codes[language.toLowerCase()] || 'en';
  }

  /**
   * Translate text using primary Google Translate library
   */
  async translateWithGoogle(text, targetLanguage, sourceLanguage = 'en') {
    try {
      const targetCode = this.getLanguageCode(targetLanguage);
      const sourceCode = this.getLanguageCode(sourceLanguage);

      // Skip if source and target are the same
      if (sourceCode === targetCode) {
        return text;
      }

      const result = await translate(text, { from: sourceCode, to: targetCode });
      return result.text;
    } catch (error) {
      console.error(`Google Translate (primary) error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Translate text using alternative Google Translate library (node-google-translate-skidz)
   */
  async translateWithGoogleAlt(text, targetLanguage, sourceLanguage = 'en') {
    try {
      console.log(`🔄 Trying alternative Google Translate for: "${text.substring(0, 50)}..."`);
      
      const targetCode = this.getLanguageCode(targetLanguage);
      const sourceCode = this.getLanguageCode(sourceLanguage);

      // Skip if source and target are the same
      if (sourceCode === targetCode) {
        return text;
      }

      // Call as a function - it returns a promise
      const result = await this.googleTranslator({
        text: text,
        source: sourceCode,
        target: targetCode
      });
      
      console.log(`✅ Alternative translation succeeded: "${result.translation.substring(0, 50)}..."`);
      return result.translation || result.toString();
    } catch (error) {
      console.error(`❌ Google Translate (alternative) error: ${error.message}`);
      if (error.statusCode) console.error(`   Status code: ${error.statusCode}`);
      if (error.body) console.error(`   Response body: ${JSON.stringify(error.body).substring(0, 200)}`);
      throw error;
    }
  }

  /**
   * Translate text to target language using LibreTranslate (fallback)
   */
  async translateWithLibre(text, targetLanguage, sourceLanguage = 'en') {
    try {
      const targetCode = this.getLanguageCode(targetLanguage);
      const sourceCode = this.getLanguageCode(sourceLanguage);

      // Skip if source and target are the same
      if (sourceCode === targetCode) {
        return text;
      }

      const requestBody = {
        q: text,
        source: sourceCode,
        target: targetCode,
        format: 'text'
      };

      // Add API key if available
      if (this.apiKey) {
        requestBody.api_key = this.apiKey;
      }

      const response = await axios.post(
        `${this.baseUrl}/translate`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.translatedText;
    } catch (error) {
      console.error(`LibreTranslate error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Translate text using Python deep-translator library
   */
  async translateWithDeepTranslator(text, targetLanguage, sourceLanguage = 'en') {
    try {
      console.log(`🐍 Trying Python deep-translator for: "${text.substring(0, 50)}..."`);
      
      const targetCode = this.getLanguageCode(targetLanguage);
      const sourceCode = this.getLanguageCode(sourceLanguage);

      // Skip if source and target are the same
      if (sourceCode === targetCode) {
        return text;
      }

      // Find Python executable
      const pythonPaths = [
        'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\Python\\Python312\\python.exe',
        'C:\\Python312\\python.exe',
        'C:\\Program Files\\Python312\\python.exe',
        'python'
      ];
      
      let pythonCmd = 'python';
      for (const pyPath of pythonPaths) {
        try {
          await execPromise(`"${pyPath}" --version`);
          pythonCmd = `"${pyPath}"`;
          break;
        } catch (e) {
          // Try next path
        }
      }

      // Escape text for command line
      const escapedText = text.replace(/"/g, '\\"').replace(/'/g, "\\'");
      const command = `${pythonCmd} "${this.deepTranslatorPath}" "${escapedText}" "${sourceCode}" "${targetCode}"`;
      
      const { stdout, stderr } = await execPromise(command, { timeout: 10000 });
      
      if (stderr && !stderr.includes('DeprecationWarning')) {
        throw new Error(`Python stderr: ${stderr}`);
      }
      
      const result = JSON.parse(stdout.trim());
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error from deep-translator');
      }
      
      console.log(`✅ Deep-translator succeeded: "${result.translation.substring(0, 50)}..."`);
      return result.translation;
    } catch (error) {
      console.error(`❌ Deep-translator error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Translate text with four-tier fallback system
   * 1. Google Translate (primary)
   * 2. Google Translate (alternative library)
   * 3. Deep Translator (Python)
   * 4. LibreTranslate
   */
  async translateText(text, targetLanguage, sourceLanguage = 'en') {
    const errors = [];

    // Try primary Google Translate
    try {
      return await this.translateWithGoogle(text, targetLanguage, sourceLanguage);
    } catch (error1) {
      errors.push(`Google API 1: ${error1.message}`);
      console.log(`⚠️ Primary Google Translate failed, trying alternative...`);
    }

    // Try alternative Google Translate library
    try {
      return await this.translateWithGoogleAlt(text, targetLanguage, sourceLanguage);
    } catch (error2) {
      errors.push(`Google API 2: ${error2.message}`);
      console.log(`⚠️ Alternative Google Translate failed, trying Deep Translator...`);
    }

    // Try Python deep-translator
    try {
      return await this.translateWithDeepTranslator(text, targetLanguage, sourceLanguage);
    } catch (error3) {
      errors.push(`Deep Translator: ${error3.message}`);
      console.log(`⚠️ Deep Translator failed, trying LibreTranslate...`);
    }

    // Try LibreTranslate as final fallback
    try {
      return await this.translateWithLibre(text, targetLanguage, sourceLanguage);
    } catch (error4) {
      errors.push(`LibreTranslate: ${error4.message}`);
      console.log(`⚠️ All translation services failed`);
    }

    // All methods failed
    throw new Error(`All translation services unavailable. Errors: ${errors.join('; ')}`);
  }

  /**
   * Translate subtitles array to target language
   */
  async translateSubtitles(subtitles, targetLanguage, sourceLanguage = 'en') {
    try {
      console.log(`🌐 Translating subtitles to ${targetLanguage}...`);

      // Translate each subtitle
      const translatedSubtitles = [];
      
      // Batch translation for efficiency (translate in chunks)
      const batchSize = 5;
      for (let i = 0; i < subtitles.length; i += batchSize) {
        const batch = subtitles.slice(i, i + batchSize);
        
        const translatedBatch = await Promise.all(
          batch.map(async (subtitle) => {
            const translatedText = await this.translateText(
              subtitle.text,
              targetLanguage,
              sourceLanguage
            );
            
            return {
              ...subtitle,
              text: translatedText
            };
          })
        );

        translatedSubtitles.push(...translatedBatch);

        // Add delay to avoid rate limiting (increased to 1 second)
        if (i + batchSize < subtitles.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`✅ Translation to ${targetLanguage} completed`);
      return translatedSubtitles;
    } catch (error) {
      throw new Error(`Subtitle translation failed: ${error.message}`);
    }
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'hi', name: 'Hindi' },
      { code: 'zh', name: 'Chinese' }
    ];
  }
}

export default new TranslationService();
