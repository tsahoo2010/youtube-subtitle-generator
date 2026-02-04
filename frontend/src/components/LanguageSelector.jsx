import React from 'react';

/**
 * LanguageSelector component for choosing subtitle language
 */
const LanguageSelector = ({ selectedLanguage, onLanguageChange, disabled = false }) => {
  const languages = [
    { code: 'english', name: 'English', flag: '🇬🇧' },
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'chinese', name: 'Chinese', flag: '🇨🇳' }
  ];

  return (
    <div className="w-full">
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
        Subtitle Language
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            disabled={disabled}
            className={`
              flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all
              ${selectedLanguage === language.code
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
    </div>
  );
};

export default LanguageSelector;
