import React, { Component } from 'react';
// import {SolidIcons} from 'react-native-fontawesome';
import { FontAwesome5 } from '@expo/vector-icons';
import { Actions } from 'react-native-router-flux';
import { View, Text } from 'react-native';
export default class OFFLINE extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            isConnected: true,
        };
        GLOBAL.Connected_Internet = true;
    }
    componentDidMount() {
        if (
            GLOBAL.Device_IsWebTV == false &&
            GLOBAL.Device_IsAppleTV == false
        ) {
            NetInfo.fetch().then(isConnected => {
                if (isConnected == true) {
                    this.setState({
                        isConnected: true,
                    });
                    GLOBAL.Connected_Internet = true;
                } else {
                    this.setState({
                        isConnected: false,
                    });
                    GLOBAL.Connected_Internet = false;
                }
            });
            // Subscribe
            const unsubscribe = NetInfo.addEventListener(state => {
                this.handleConnectivityChange(state.isConnected);
            });
            // Unsubscribe
            unsubscribe();
            //   NetInfo.addEventListener(
            //     'connectionChange',
            //     this.handleConnectivityChange,
            //   );
        }
    }
    componentWillUnmount() {
        if (
            GLOBAL.Device_IsWebTV == false &&
            GLOBAL.Device_IsAppleTV == false
        ) {
            // Subscribe
            const unsubscribe = NetInfo.addEventListener(state => {
                this.handleConnectivityChange(state.isConnected);
            });
            // Unsubscribe
            unsubscribe();
            //   NetInfo.removeEventListener(
            //     'connectionChange',
            //     this.handleConnectivityChange,
            //   );
        }
    }
    handleConnectivityChange = isConnected => {
        if (isConnected == true) {
            this.setState({
                isConnected: true,
            });
            GLOBAL.Connected_Internet = true;
        } else {
            this.setState({
                isConnected: false,
            });
            GLOBAL.Connected_Internet = false;
        }
    };
    Offline() {
        return (
            <View
                pointerEvents={'box-only'}
                style={{
                    position: 'absolute',
                    backgroundColor: '#333',
                    width: GLOBAL.COL_1,
                    height: GLOBAL.ROW_1,
                    zIndex: 99999,
                }}>
                <View style={{ flex: 1, padding: 50 }}>
                    <Text style={styles.H1}>
                        {LANG.getTranslation('no_internet')}
                    </Text>
                    <Text style={styles.H4}>
                        {LANG.getTranslation('try_again')}
                    </Text>
                </View>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                    <FontAwesome5
                        style={{ fontSize: 200, color: '#999' }}
                        // icon={SolidIcons.exclamationCircle}
                        name="exclamation-circle"
                    />
                </View>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        alignContent: 'flex-end',
                        alignItems: 'flex-end',
                        alignSelf: 'flex-end',
                        padding: 50,
                    }}>
                    <ButtonNormal
                        hasTVPreferredFocus={true}
                        pointerEvents={'box-only'}
                        Padding={0}
                        underlayColor={GLOBAL.Button_Color}
                        hasTVPreferredFocus={false}
                        onPress={() => Actions.Home()}
                        Text={LANG.getTranslation('back_home')}
                    />
                </View>
            </View>
        );
    }
    render() {
        if (this.state.isConnected == false) {
            return this.Offline();
        } else {
            return null;
        }
    }
}
