import React from 'react';
import {Dimensions, Platform} from 'react-native';
import {DataProvider} from '../screen-portrait/hooks';
import AppStack from '../screen-portrait/app/App';
import {enableScreens} from 'react-native-screens';

import {
    useCastSession,
    useRemoteMediaClient,
    useCastState,
    CastState,
    CastButton,
} from 'react-native-google-cast';
import GoogleCast from 'react-native-google-cast';

export default function App_Portrait() {
    if (Platform.OS == 'android') {
        global.useCastState = useCastState;
        global.CastState = CastState;
        global.GoogleCast = GoogleCast;
        global.CastButton = CastButton;
        global.useCastSession = useCastSession;
        global.useRemoteMediaClient = useRemoteMediaClient;
    }

    if (GLOBAL.Device_IsWebTV) {
        if (Dimensions.get('window').height > Dimensions.get('window').width) {
            if (GLOBAL.Device_IsPortrait == 0) {
                GLOBAL.Device_IsPortrait = true;
            }
        } else {
            if (GLOBAL.Device_IsPortrait == 0) {
                GLOBAL.Device_IsPortrait = false;
            }
        }
    }
    enableScreens();
    return (
        <DataProvider>
            <AppStack />
        </DataProvider>
    );
}
