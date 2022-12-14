import React, {useState, useEffect} from 'react';

import Courses_Portrait from './Courses_Portrait';
import Courses_Landscape from './Courses_Landscape';

export default ({navigation, route}): React.ReactElement => {
    if (GLOBAL.Device_IsPortrait) {
        return (
            <Courses_Portrait
                navigation={navigation}
                route={route}
            ></Courses_Portrait>
        );
    } else {
        return (
            <Courses_Landscape
                navigation={navigation}
                route={route}
            ></Courses_Landscape>
        );
    }
};
