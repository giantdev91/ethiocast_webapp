import React, {useState, useEffect} from 'react';

import Movie_Portrait from './Movie_Portrait';
import Movie_Landscape from './Movie_Landscape';

export default ({navigation, route}): React.ReactElement => {
    if (GLOBAL.Device_IsPortrait) {
        return (
            <Movie_Portrait
                navigation={navigation}
                route={route}
            ></Movie_Portrait>
        );
    } else {
        return (
            <Movie_Landscape
                navigation={navigation}
                route={route}
            ></Movie_Landscape>
        );
    }
};
