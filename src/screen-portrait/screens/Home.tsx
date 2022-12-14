import React from 'react';

import Akua_Landscape from '../screens/Themes/Akua/Home_Landscape';
import Honua_Landscape from '../screens/Themes/Honua/Home_Landscape';
import Iridium_Landscape from '../screens/Themes/Iridium/Home_Landscape';

import Akua_Portrait from '../screens/Themes/Akua/Home_Portrait';
import Honua_Portrait from '../screens/Themes/Honua/Home_Portrait';
import Iridium_Portrait from '../screens/Themes/Iridium/Home_Portrait';

import {View} from 'react-native';

export default ({navigation}): React.ReactElement => {
    return (
        <View style={{flex: 1}}>
            {GLOBAL.App_Theme == 'Akua' && GLOBAL.Device_IsPortrait && (
                <Akua_Portrait navigation={navigation}></Akua_Portrait>
            )}
            {GLOBAL.App_Theme == 'Honua' && GLOBAL.Device_IsPortrait && (
                <Honua_Portrait navigation={navigation}></Honua_Portrait>
            )}
            {GLOBAL.App_Theme == 'Iridium' && GLOBAL.Device_IsPortrait && (
                <Iridium_Portrait navigation={navigation}></Iridium_Portrait>
            )}
            {GLOBAL.App_Theme == 'Akua' && !GLOBAL.Device_IsPortrait && (
                <Akua_Landscape navigation={navigation}></Akua_Landscape>
            )}
            {GLOBAL.App_Theme == 'Honua' && !GLOBAL.Device_IsPortrait && (
                <Honua_Landscape navigation={navigation}></Honua_Landscape>
            )}
            {GLOBAL.App_Theme == 'Iridium' && !GLOBAL.Device_IsPortrait && (
                <Iridium_Landscape navigation={navigation}></Iridium_Landscape>
            )}
        </View>
    );
};
