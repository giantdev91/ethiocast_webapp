import {Dimensions, Platform} from 'react-native';
// import GLOBALModule from '../../datalayer/global';
var GLOBALModule = require('../../datalayer/global');
var GLOBAL = GLOBALModule.default;

class SIZES {
    getSizing = () => {
        let SIZES_Web;
        if (GLOBAL.Device_IsWebTV) {
            //var isPhone = isMobile.isPhone();
            //var isTablet = isMobile.isTablet();
            if (
                Dimensions.get('window').height > Dimensions.get('window').width
            ) {
                GLOBAL.Device_IsPortrait = true;
                SIZES_Web = {
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height,
                };
            } else {
                GLOBAL.Device_IsPortrait = false;
                SIZES_Web = {
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height,
                };
            }
        }
        let SIZES_Phones;
        if (GLOBAL.Device_IsPhone) {
            GLOBAL.Device_IsPortrait = true;
            SIZES_Phones = {
                width:
                    Dimensions.get('window').width <
                    Dimensions.get('window').height
                        ? Dimensions.get('window').width
                        : Dimensions.get('window').height,
                height:
                    Dimensions.get('window').height >
                    Dimensions.get('window').width
                        ? Dimensions.get('window').height
                        : Dimensions.get('window').width,
            };
        }
        let SIZES_Tablet;
        if (GLOBAL.Device_IsTablet) {
            GLOBAL.Device_IsPortrait = false;
            SIZES_Tablet = {
                width:
                    Dimensions.get('window').height >
                    Dimensions.get('window').width
                        ? Dimensions.get('window').height
                        : Dimensions.get('window').width,
                height:
                    Dimensions.get('window').width <
                    Dimensions.get('window').height
                        ? Dimensions.get('window').width
                        : Dimensions.get('window').height,
            };
        }
        var sizing = GLOBAL.Device_IsPhone
            ? SIZES_Phones
            : GLOBAL.Device_IsWebTV
            ? SIZES_Web
            : SIZES_Tablet;
        return sizing;
    };
}
const sizing = new SIZES();
export default sizing;
