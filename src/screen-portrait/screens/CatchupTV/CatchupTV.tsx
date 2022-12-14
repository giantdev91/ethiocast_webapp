import React, {useState, useEffect} from 'react';

import CatchupTV_Portrait from './CatchupTV_Portrait';
import CatchupTV_Landscape from './CatchupTV_Landscape';

export default ({navigation}): React.ReactElement => {
    if (GLOBAL.Device_IsPortrait) {
        return (
            <CatchupTV_Portrait navigation={navigation}></CatchupTV_Portrait>
        );
    } else {
        return (
            <CatchupTV_Landscape navigation={navigation}></CatchupTV_Landscape>
        );
    }
};
