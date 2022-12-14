import {Dimensions, Platform} from 'react-native';
import Orientation from 'react-native-orientation';
// import GLOBALModule from '../../datalayer/global';
var GLOBALModule = require('../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import {
    ICommonTheme,
    ThemeAssets,
    ThemeFonts,
    ThemeIcons,
    ThemeLineHeights,
    ThemeSizes,
    ThemeWeights,
} from './types';

const {width, height} = Dimensions.get('window');

// Naming source: https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight#Common_weight_name_mapping
export const WEIGHTS: ThemeWeights = {
    text: 'normal',
    h1: Platform.OS === 'ios' ? '700' : 'normal',
    h2: Platform.OS === 'ios' ? '700' : 'normal',
    h3: Platform.OS === 'ios' ? '700' : 'normal',
    h4: Platform.OS === 'ios' ? '700' : 'normal',
    h5: Platform.OS === 'ios' ? '600' : 'normal',
    p: 'normal',

    thin: Platform.OS === 'ios' ? '100' : 'normal',
    extralight: Platform.OS === 'ios' ? '200' : 'normal',
    light: Platform.OS === 'ios' ? '300' : 'normal',
    normal: Platform.OS === 'ios' ? '400' : 'normal',
    medium: Platform.OS === 'ios' ? '500' : 'normal',
    semibold: Platform.OS === 'ios' ? '600' : 'normal',
    bold: Platform.OS === 'ios' ? '700' : 'normal',
    extrabold: Platform.OS === 'ios' ? '800' : 'normal',
    black: Platform.OS === 'ios' ? '900' : 'normal',
};

export const ICONS: ThemeIcons = {};

export const ASSETS: ThemeAssets = {
    // fonts
    OpenSansLight: require('../assets/fonts/OpenSans-Light.ttf'),
    OpenSansRegular: require('../assets/fonts/OpenSans-Regular.ttf'),
    OpenSansSemiBold: require('../assets/fonts/OpenSans-SemiBold.ttf'),
    OpenSansExtraBold: require('../assets/fonts/OpenSans-ExtraBold.ttf'),
    OpenSansBold: require('../assets/fonts/OpenSans-Bold.ttf'),

    // backgrounds/logo
    logo: GLOBAL.Logo,
    //header: require('../assets/images/header.png'),
    background: GLOBAL.Background,
};

export const FONTS: ThemeFonts = {
    // based on font size
    text: 'OpenSans-Regular',
    h1: 'OpenSans-Bold',
    h2: 'OpenSans-Bold',
    h3: 'OpenSans-Bold',
    h4: 'OpenSans-Bold',
    h5: 'OpenSans-SemiBold',
    p: 'OpenSans-Regular',

    // based on fontWeight
    thin: 'OpenSans-Light',
    extralight: 'OpenSans-Light',
    light: 'OpenSans-Light',
    normal: 'OpenSans-Regular',
    medium: 'OpenSans-SemiBold',
    semibold: 'OpenSans-SemiBold',
    bold: 'OpenSans-Bold',
    extrabold: 'OpenSans-ExtraBold',
    black: 'OpenSans-ExtraBold',
};

export const LINE_HEIGHTS: ThemeLineHeights = {
    // font lineHeight
    text: 22,
    h1: 60,
    h2: 55,
    h3: 43,
    h4: 33,
    h5: 24,
    p: 22,
};
let SIZES_Web;
if (GLOBAL.Device_IsWebTV) {
    SIZES_Web = {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    };
}
let SIZES_Phones;
if (GLOBAL.Device_IsPhone) {
    SIZES_Phones = {
        width:
            Orientation.getInitialOrientation() == 'PORTRAIT'
                ? Dimensions.get('window').width
                : Dimensions.get('window').height,
        height:
            Orientation.getInitialOrientation() == 'PORTRAIT'
                ? Dimensions.get('window').height
                : Dimensions.get('window').width,
    };
}
let SIZES_Tablet;
if (GLOBAL.Device_IsTablet) {
    SIZES_Tablet = {
        width:
            Dimensions.get('window').height > Dimensions.get('window').width
                ? Dimensions.get('window').height
                : Dimensions.get('window').width,
        height:
            Dimensions.get('window').width < Dimensions.get('window').height
                ? Dimensions.get('window').width
                : Dimensions.get('window').height,
    };
}

export const THEME: ICommonTheme = {
    icons: ICONS,
    assets: {...ICONS, ...ASSETS},
    fonts: FONTS,
    weights: WEIGHTS,
    lines: LINE_HEIGHTS,
    sizes_: GLOBAL.Device_IsPhone
        ? SIZES_Phones
        : GLOBAL.Device_IsWebTV
        ? SIZES_Web
        : SIZES_Tablet,
};
