import {NativeModules} from 'react-native';
const {PlatformConstants} = NativeModules;
const deviceType = PlatformConstants;

export function isPad() {
    return deviceType === 'pad';
}

export function isPhone() {
    return deviceType === 'phone'; //phone, pad, tv, carplay and unknown
}

export function isTV() {
    return deviceType === 'tv';
}
