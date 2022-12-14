import React, {useState, useEffect} from 'react';

import Signin_Portrait from './Signin_Portrait';
import Signin_Landscape from './Signin_Landscape';

export default ({navigation, route}): React.ReactElement => {
    var isTablet = false;
    var isPhone = false;
    if (GLOBAL.Device_IsWebTV) {
        // isPhone = isMobile.isPhone();
        // isTablet = isMobile.isTablet();
        isPhone = true;
    }
    if (GLOBAL.Device_IsPortrait || isPhone) {
        return <Signin_Portrait navigation={navigation}></Signin_Portrait>;
    } else if (!GLOBAL.Device_IsPortrait || isTablet) {
        return <Signin_Landscape navigation={navigation}></Signin_Landscape>;
    }
};
