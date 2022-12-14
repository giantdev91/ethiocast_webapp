import React, {Component} from 'react';
import {
    View,
    Text,
    ScrollView,
    Platform,
    BackHandler,
    TVMenuControl,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {Badge} from 'react-native-elements';
export default class Quality extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        this.state = {
            quality:
                GLOBAL.Video_Quality_Setting == null
                    ? LANG.getTranslation('HIGH')
                    : LANG.getTranslation(GLOBAL.Video_Quality_Setting),
            clock: GLOBAL.Clock_Type,
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            GLOBAL.Focus = 'Home';
            Actions.Home();
        }
    };
    updateDimensions() {
        Actions.Quality();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                GLOBAL.Focus = 'Home';
                Actions.Home();
                return true;
            },
        );
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        Actions.pop();
    }
    _changeQuality() {
        if (this.state.quality == LANG.getTranslation('HIGH')) {
            GLOBAL.Video_Quality_Setting = 'LOW';
            UTILS.storeProfile('settings_video_quality', 0, 0, 0, 0, [], 'LOW');
            this.setState({
                quality: LANG.getTranslation('LOW'),
            });
        } else {
            GLOBAL.Video_Quality_Setting = 'HIGH';
            UTILS.storeProfile(
                'settings_video_quality',
                0,
                0,
                0,
                0,
                [],
                'HIGH',
            );
            this.setState({
                quality: LANG.getTranslation('HIGH'),
            });
        }
    }

    getTimeSetting() {
        if (GLOBAL.Clock_Type == 'AM/PM') {
            this.setState({
                clock: 'AM/PM',
            });
        } else {
            this.setState({
                clock: '24h',
            });
        }
    }
    setTimeSetting() {
        if (GLOBAL.Clock_Type == 'AM/PM') {
            GLOBAL.Clock_Type = '24h';
            GLOBAL.Clock_Setting = 'HH:mm';
            var clock = {
                Clock_Type: GLOBAL.Clock_Type,
                Clock_Setting: GLOBAL.Clock_Setting,
            };
            UTILS.storeProfile('settings_clock', 0, 0, 0, 0, clock, 'value');

            this.setState({
                clock: '24h',
            });
        } else {
            GLOBAL.Clock_Type = 'AM/PM';
            GLOBAL.Clock_Setting = 'hh:mm A';
            var clock = {
                Clock_Type: GLOBAL.Clock_Type,
                Clock_Setting: GLOBAL.Clock_Setting,
            };
            UTILS.storeProfile('settings_clock', 0, 0, 0, 0, clock, 'value');

            this.setState({
                clock: 'AM/PM',
            });
        }
        Actions.Settings();
    }
    render() {
        return (
            <View style={{flex: 1}}>
                <View style={{flex: 1}}>
                    <View
                        style={{
                            borderRadius: 5,
                            flex: 8,
                            marginHorizontal: 5,
                            padding: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.33)',
                            paddingBottom: 20,
                        }}
                    >
                        <View
                            style={{
                                borderRadius: 5,
                                height: 100,
                                padding: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.43)',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={styles.H2}>
                                {LANG.getTranslation('livetvvideoquality')}
                            </Text>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.Subtext,
                                    styles.Width_80_Percent,
                                    styles.CenterText,
                                ]}
                            >
                                {LANG.getTranslation(
                                    'chooseyourvideoqualitysetting',
                                )}
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <ButtonSized
                                Color={'#000'}
                                Width={GLOBAL.Device_Width / 3}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._changeQuality()}
                                Text={this.state.quality}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
