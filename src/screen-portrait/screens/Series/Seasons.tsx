import React, {useState, useEffect} from 'react';

import Seasons_Portrait from './Seasons_Portrait';
import Seasons_Landscape from './Seasons_Landscape';

export default ({navigation, route}): React.ReactElement => {
    if (GLOBAL.Device_IsPortrait) {
        return (
            <Seasons_Portrait
                navigation={navigation}
                route={route}
            ></Seasons_Portrait>
        );
    } else {
        return (
            <Seasons_Landscape
                navigation={navigation}
                route={route}
            ></Seasons_Landscape>
        );
    }
};
