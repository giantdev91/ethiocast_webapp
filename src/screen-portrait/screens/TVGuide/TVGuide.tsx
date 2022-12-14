import React, {useState, useEffect} from 'react';

import TVGuide_Portrait from './TVGuide_Portrait';
import TVGuide_Landscape from './TVGuide_Landscape';

export default ({navigation}): React.ReactElement => {
    if (GLOBAL.Device_IsPortrait) {
        return <TVGuide_Portrait navigation={navigation}></TVGuide_Portrait>;
    } else {
        return <TVGuide_Landscape navigation={navigation}></TVGuide_Landscape>;
    }
};
