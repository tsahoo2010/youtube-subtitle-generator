import React from 'react';

/**
 * LanguageSelector component for choosing source and target languages
 */
const LanguageSelector = ({ 
  sourceLanguage, 
  targetLanguage, 
  onSourceLanguageChange, 
  onTargetLanguageChange, 
  disabled = false 
}) => {
  const languages = [
    { code: 'english', name: 'English', flag: '🇬🇧' },
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'chinese', name: 'Chinese', flag: '🇨🇳' }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Source Language Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Language (Source)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {languages.map((language) => (
            <button
              key={`source-${language.code}`}
              onClick={() => onSourceLanguageChange(language.code)}
              disabled={disabled}
              className={`
                flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all
                ${sourceLanguage === language.code
                  ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-2xl">{language.flag}</span>
              <span className="text-sm">{language.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Select the language spoken in the video</p>
      </div>

      {/* Target Language Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtitle Language (Target)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {languages.map((language) => (
            <button
              key={`target-${language.code}`}
              onClick={() => onTargetLanguageChange(language.code)}
              disabled={disabled}
              className={`
                flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all
                ${targetLanguage === language.code
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-2xl">{language.flag}</span>
              <span className="text-sm">{language.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Select the language for the generated subtitles</p>
      </div>
    </div>
  );
};

export default LanguageSelector;
