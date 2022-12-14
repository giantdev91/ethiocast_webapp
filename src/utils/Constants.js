import {scale, verticalScale} from './ScaleUtils';
var GLOBALModule = require('../datalayer/global');
var GLOBAL = GLOBALModule.default;

export const HORIZONTAL = 'horizontal';
export const VERTICAL = 'vertical';

//Dimentions
export const dimens = {
    cellHeight: scale(30),
    textHour: verticalScale(10),
    headerWidth: verticalScale(200),
    timeWidth: verticalScale(150),
    arrowShort: verticalScale(12),
    arrowLong: verticalScale(18),
    lineWidth: verticalScale(1),
    detailHeight: scale(0),
};

//Colors
export const colors = {
    baseColor: '#292828',
    channelColor: 'rgba(0, 0, 0, 0.90)',
    selectedColor: GLOBAL.Button_Color,
    colorDark: 'rgba(0, 0, 0, 0.90)',
    colorLight: 'rgba(0, 0, 0, 0.90)',
    colorMedium: 'rgba(0, 0, 0, 0.60)',
    backgroundColor: 'rgba(0, 0, 0, 0.00)',
};
