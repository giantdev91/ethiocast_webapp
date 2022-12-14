import React, {Component} from 'react';
import {Platform, LogBox, View, StatusBar} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import TimerMixin from 'react-timer-mixin';
import AppLandscape from './placeholders/app-landscape';
import AppPortrait from './placeholders/app-portrait';
import DeviceInformation from './device/DeviceInformation';

class app extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        GLOBAL.Focus = 'Outside';
        this.state = {
            app_type: '',
        };
    }
    componentDidMount() {
        DeviceInformation.getDeviceInformation().then(result => {
            if (Platform.OS == 'android' || Platform.OS == 'ios') {
                // LogBox.ignoreLogs(['Warning: ...']);
                LogBox.ignoreAllLogs(true);
            }
            TimerMixin.clearTimeout(this.timer1);
            this.timer1 = TimerMixin.setTimeout(() => {
                console.log('platform: ', Platform.OS);
                console.log('Device_Model: ', GLOBAL.Device_Model);
                console.log('Device_IsTablet: ', GLOBAL.Device_IsTablet);
                console.log('Device_IsPhone: ', GLOBAL.Device_IsPhone);
                console.log('Device_IsWebTV', GLOBAL.Device_IsWebTV);
                console.log('Device_IsSmartTV', GLOBAL.Device_IsSmartTV);

                if (Platform.OS == 'android') {
                    SplashScreen.hide();
                    clear.clearAppCache(() => {
                        GLOBAL.Background = 'https://';
                        if (GLOBAL.Device_Model == 'X55SF-CS1350A-G') {
                            GLOBAL.Device_IsTablet = true;
                            GLOBAL.Device_FormFactor = 'TOUCHPANEL';
                        }
                        if (
                            GLOBAL.Device_IsPhone == true ||
                            GLOBAL.Device_IsTablet == true
                        ) {
                            if (Platform.OS == 'android') {
                                SystemNavigationBar.setNavigationColor(
                                    'rgba(0, 0, 0, 0.40)',
                                    true,
                                );
                            }

                            if (GLOBAL.Device_IsPhone) {
                                Orientation.lockToPortrait();
                                this.setState({
                                    app_type: 'Portrait',
                                });
                            } else {
                                Orientation.lockToLandscape();
                                this.setState({
                                    app_type: 'Landscape',
                                });
                            }
                        } else {
                            Orientation.lockToLandscape();
                            this.setState({
                                app_type: 'Landscape',
                            });
                        }
                    });
                } else {
                    if (
                        GLOBAL.Device_IsPhone == true ||
                        GLOBAL.Device_IsTablet == true
                    ) {
                        if (GLOBAL.Device_IsPhone) {
                            Orientation.lockToPortrait();
                        } else {
                            Orientation.lockToLandscape();
                        }
                        this.setState({
                            app_type: 'Portrait',
                        });
                    } else {
                        if (GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV) {
                            this.setState({
                                app_type: 'Portrait',
                            });
                        } else {
                            this.setState({
                                app_type: 'Landscape',
                            });
                        }
                    }
                }
            }, 500);
        });
    }
    componentWillUnmount() {
        TimerMixin.clearTimeout(this.timer1);
    }
    render() {
        return (
            <View style={{flex: 1}}>
                {RenderIf(this.state.app_type == 'Portrait')(
                    <View style={{flex: 1, backgroundColor: 'black'}}>
                        <StatusBar
                            animated={true}
                            translucent={true}
                            backgroundColor={'rgba(0, 0, 0, 0.90)'}
                            barStyle={'light-content'}
                            showHideTransition={'slide'}
                            hidden={false}
                        />
                        <AppPortrait></AppPortrait>
                    </View>,
                )}
                {RenderIf(this.state.app_type == 'Landscape')(
                    <AppLandscape></AppLandscape>,
                )}
            </View>
        );
    }
}
export default app;
