import React, {useState, useEffect} from 'react';

import Services_Portrait from './Services_Portrait';
import Services_Landscape from './Services_Landscape';

export default ({navigation, route}): React.ReactElement => {
    var isTablet = false;
    var isPhone = false;
    if (GLOBAL.Device_IsWebTV) {
        // isPhone = isMobile.isPhone();
        // isTablet = isMobile.isTablet();
        isPhone = true;
    }
    if (GLOBAL.Device_IsPortrait || isPhone) {
        return <Services_Portrait navigation={navigation}></Services_Portrait>;
    } else if (!GLOBAL.Device_IsPortrait || isTablet) {
        return (
            <Services_Landscape navigation={navigation}></Services_Landscape>
        );
    }
};
