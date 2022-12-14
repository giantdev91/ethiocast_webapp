import {Dimensions} from 'react-native';

let {width, height} = Dimensions.get('window');
if (width > height) {
    let tmp = width;
    width = height;
    height = tmp;
}

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

const scale = size => (size * width) / guidelineBaseWidth;
const verticalScale = size => (size * height) / guidelineBaseHeight;
const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;

export {scale, verticalScale, moderateScale};
