var GLOBALModule = require('../datalayer/global');
var GLOBAL = GLOBALModule.default;

class STYLE {
    getStyle() {
        switch (GLOBAL.App_Theme) {
            case 'Akua':
                return require('../screens-landscape/themes/Akua/styles/Style');
                break;
            case 'Honua':
                return require('../screens-landscape/themes/Honua/styles/Style');
                break;
            default:
                return require('../screens-landscape/themes/Default/styles/Style');
                break;
        }
    }
}
const style = new STYLE();
export default style;
