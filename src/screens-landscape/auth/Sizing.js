import React, {Component} from 'react';
import {View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Orientation from 'react-native-orientation';

export default class Sizing extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <Container hide_menu={true} hide_header={true}>
                <View
                    style={{flex: 1, alignSelf: 'stretch'}}
                    onLayout={this.onLayout}
                ></View>
            </Container>
        );
    }
    onLayout = event => {
        let {width, height} = event.nativeEvent.layout;

        // if (GLOBAL.Device_IsPhone) {
        //     if (Orientation.getInitialOrientation() == "PORTRAIT") {
        //         GLOBAL.Device_Width = height;
        //         GLOBAL.Device_Height = width;
        //     } else {
        //         GLOBAL.Device_Width = width;
        //         GLOBAL.Device_Height = height;
        //     }
        // } else {
        GLOBAL.Device_Width = width;
        GLOBAL.Device_Height = height;
        //}

        GLOBAL.COL_1 = GLOBAL.Device_Width / 1;
        GLOBAL.COL_2 = GLOBAL.Device_Width / 2;
        GLOBAL.COL_3 = GLOBAL.Device_Width / 3;
        GLOBAL.COL_4 = GLOBAL.Device_Width / 4;
        GLOBAL.COL_5 = GLOBAL.Device_Width / 5;
        GLOBAL.COL_6 = GLOBAL.Device_Width / 6;
        GLOBAL.COL_7 = GLOBAL.Device_Width / 7;
        GLOBAL.COL_8 = GLOBAL.Device_Width / 8;
        GLOBAL.COL_9 = GLOBAL.Device_Width / 9;
        GLOBAL.COL_10 = GLOBAL.Device_Width / 10;

        GLOBAL.ROW_1 = GLOBAL.Device_Height / 1;
        GLOBAL.ROW_2 = GLOBAL.Device_Height / 2;
        GLOBAL.ROW_3 = GLOBAL.Device_Height / 3;
        GLOBAL.ROW_4 = GLOBAL.Device_Height / 4;
        GLOBAL.ROW_5 = GLOBAL.Device_Height / 5;
        GLOBAL.ROW_6 = GLOBAL.Device_Height / 6;
        GLOBAL.ROW_7 = GLOBAL.Device_Height / 7;
        GLOBAL.ROW_8 = GLOBAL.Device_Height / 8;
        GLOBAL.ROW_9 = GLOBAL.Device_Height / 9;
        GLOBAL.ROW_10 = GLOBAL.Device_Height / 10;

        if (GLOBAL.App_Theme == 'Honua') {
            GLOBAL.Menu_Width = GLOBAL.COL_6;
        }
        if (GLOBAL.App_Theme == 'Iridium' && !GLOBAL.Device_IsPhone) {
            GLOBAL.Menu_Width = GLOBAL.COL_10;
        }

        var widthRemaining = GLOBAL.Device_Width - GLOBAL.Menu_Width;

        GLOBAL.COL_REMAINING_1 = widthRemaining / 1;
        GLOBAL.COL_REMAINING_2 = widthRemaining / 2;
        GLOBAL.COL_REMAINING_3 = widthRemaining / 3;
        GLOBAL.COL_REMAINING_4 = widthRemaining / 4;
        GLOBAL.COL_REMAINING_5 = widthRemaining / 5;
        GLOBAL.COL_REMAINING_6 = widthRemaining / 6;
        GLOBAL.COL_REMAINING_7 = widthRemaining / 7;
        GLOBAL.COL_REMAINING_8 = widthRemaining / 8;
        GLOBAL.COL_REMAINING_9 = widthRemaining / 9;
        GLOBAL.COL_REMAINING_10 = widthRemaining / 10;

        if (GLOBAL.Device_IsWebTV) {
            GLOBAL.Extra_Padding = 15;
        }

        if (GLOBAL.UserID == 't8472919' && GLOBAL.Pass == 'p2392382') {
            Actions.Player_M3U();
        } else {
            Actions.Profiles();
        }
    };
}
