var Amharic = require('./amharic');
var English = require('./english');
var Spanish = require('./spanish');
var German = require('./german');
var Russian = require('./russian');
var Polish = require('./polish');
var French = require('./french');
var Portuguese = require('./portuguese');
var Papiamento = require('./papiamento');
var Arabic = require('./arabic');
var Dutch = require('./dutch');
var Hindi = require('./hindi');
var Burmese = require('./burmese');
var Urdu = require('./urdu');
var Kurdish = require('./kurdisch');
var Thai = require('./thai');
var Mongolian = require('./mongolian');
var Greek = require('./greek');
var Bengali = require('./bengali');

class Languages {
    getTranslation(text) {
        if (text == null) {
            return;
        }
        try {
            text = text.toLowerCase().toString().replace(' ', '_');
            switch (GLOBAL.Selected_Language) {
                case 'বাংলা':
                    return Bengali.language[text];
                case 'Ελληνικά':
                    return Greek.language[text];
                case 'አማርኛ':
                    return Amharic.language[text];
                case 'English':
                    return English.language[text];
                case 'Español':
                    return Spanish.language[text];
                case 'Deutsch':
                    return German.language[text];
                case 'Русский':
                    return Russian.language[text];
                case 'Polski':
                    return Polish.language[text];
                case 'Монгол':
                    return Mongolian.language[text];
                case 'ไทย':
                    return Thai.language[text];
                case 'Français':
                    return French.language[text];
                case 'Português':
                    return Portuguese.language[text];
                case 'Papiamentu':
                    return Papiamento.language[text];
                case 'العربية':
                    return Arabic.language[text];
                case 'फिजी बात':
                    return Hindi.language[text];
                case 'Nederlands':
                    return Dutch.language[text];
                case 'မြန်မာစာ or မြန်မာစကား':
                    return Burmese.language[text];
                case 'हिन्दुस्तानी':
                    return Urdu.language[text];
                case 'کوردی':
                    return Kurdish.language[text];
                default:
                    return English.language[text];
            }
        } catch (e) {}
    }
    setLanguage(language) {
        switch (language) {
            case 'বাংলা':
                GLOBAL.Selected_Language = 'Bangali';
                break;
            case 'Ελληνικά':
                GLOBAL.Selected_Language = 'Greek';
                break;
            case 'አማርኛ':
                GLOBAL.Selected_Language = 'Amharic';
                break;
            case 'English':
                GLOBAL.Selected_Language = 'English';
                break;
            case 'Español':
                GLOBAL.Selected_Language = 'Spanish';
                break;
            case 'Deutsch':
                GLOBAL.Selected_Language = 'German';
                break;
            case 'Монгол':
                GLOBAL.Selected_Language = 'Mongolian';
                break;
            case 'Русский':
                GLOBAL.Selected_Language = 'Russian';
                break;
            case 'Polski':
                GLOBAL.Selected_Language = 'Polish';
                break;
            case 'Français':
                GLOBAL.Selected_Language = 'French';
                break;
            case 'Português':
                GLOBAL.Selected_Language = 'Portuguese';
                break;
            case 'हिन्दुस्तानी':
                GLOBAL.Selected_Language = 'Urdu';
                break;
            case 'العربية':
                GLOBAL.Selected_Language = 'Arabic';
                break;
            case 'फिजी बात':
                GLOBAL.Selected_Language = 'Hindi';
                break;
            case 'Nederlands':
                GLOBAL.Selected_Language = 'Dutch';
                break;
            case 'မြန်မာစာ or မြန်မာစကား':
                GLOBAL.Selected_Language = 'Burmese';
                break;
            case 'کوردی':
                GLOBAL.Selected_Language = 'Kurdish';
                break;
            case 'Papiamentu':
                GLOBAL.Selected_Language = 'Papiamentu';
                break;
            case 'ไทย':
                GLOBAL.Selected_Language = 'Thai';
                break;
        }
    }
    getEnglishLanguageName(language) {
        switch (language) {
            case 'বাংলা':
                return 'Bengali';
                break;
            case 'Ελληνικά':
                return 'Greek';
                break;
            case 'አማርኛ':
                return 'Amharic';
                break;
            case 'English':
                return 'English';
                break;
            case 'Español':
                return 'Spanish';
                break;
            case 'Deutsch':
                return 'German';
                break;
            case 'Монгол':
                return 'Mongolian';
                break;
            case 'Русский':
                return 'Russian';
                break;
            case 'Polski':
                return 'Polish';
                break;
            case 'Français':
                return 'French';
                break;
            case 'Português':
                return 'Portuguese';
                break;
            case 'हिन्दुस्तानी':
                return 'Urdu';
                break;
            case 'العربية':
                return 'Arabic';
                break;
            case 'फिजी बात':
                return 'Hindi';
                break;
            case 'Nederlands':
                return 'Dutch';
                break;
            case 'မြန်မာစာ or မြန်မာစကား':
                return 'Burmese';
                break;
            case 'کوردی':
                return 'Kurdish';
                break;
            case 'Papiamentu':
                return 'Papiamentu';
                break;
            case 'ไทย':
                return 'Thai';
                break;
        }
    }
    getLanguage(language) {
        switch (language) {
            case 'Bengali':
                return 'বাংলা';
                break;
            case 'Greek':
                return 'Ελληνικά';
                break;
            case 'Amharic':
                return 'አማርኛ';
                break;
            case 'English':
                return 'English';
                break;
            case 'Spanish':
                return 'Español';
                break;
            case 'German':
                return 'Deutsch';
                break;
            case 'Russian':
                return 'Русский';
                break;
            case 'Polish':
                return 'Polski';
                break;
            case 'Mongolian':
                return 'Mongolians';
                break;
            case 'French':
                return 'Français';
                break;
            case 'Portuguese':
                return 'Português';
                break;
            case 'Thai':
                return 'ไทย';
                break;
            case 'Urdu':
                return 'हिन्दुस्तानी';
                break;
            case 'Arabic':
                return 'العربية';
                break;
            case 'Hindi':
                return 'फिजी बात';
                break;
            case 'Dutch':
                return 'Nederlands';
                break;
            case 'Burmese':
                return 'မြန်မာစာ or မြန်မာစကား';
                break;
            case 'Kurdish':
                return 'کوردی';
                break;
            case 'Papiamentu':
                return 'Papiamentu';
                break;
            default:
                return null;
                break;
        }
    }
    getLanguageCode(language) {
        switch (language) {
            case 'Bengali':
                return 'bd';
                break;
            case 'Greek':
                return 'gr';
                break;
            case 'Amharic':
                return 'et';
                break;
            case 'English':
                return 'en';
                break;
            case 'Spanish':
                return 'es';
                break;
            case 'German':
                return 'de';
                break;
            case 'Russian':
                return 'ru';
                break;
            case 'Poland':
                return 'po';
                break;
            case 'Mongolian':
                return 'mo';
                break;
            case 'French':
                return 'fr';
                break;
            case 'Portuguese':
                return 'pr';
                break;
            case 'Thai':
                return 'th';
                break;
            case 'Urdu':
                return 'ur';
                break;
            case 'Arabic':
                return 'ar';
                break;
            case 'Hindi':
                return 'hi';
                break;
            case 'Nederlands':
                return 'nl';
                break;
            case 'Burmese':
                return 'bm';
                break;
            case 'Kurdish':
                return 'kr';
                break;
            case 'Papiamentu':
                return 'pm';
                break;
            default:
                return 'en';
                break;
        }
    }
}
const languages = new Languages();
export default languages;
