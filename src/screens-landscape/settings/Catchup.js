import React, {Component} from 'react';
import {View, Text, BackHandler, TVMenuControl, FlatList} from 'react-native';
import {Actions} from 'react-native-router-flux';
export default class Catchup extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};

        GLOBAL.Minutes = [
            {key: '2 ' + LANG.getTranslation('mins'), value: 120},
            {key: '5 ' + LANG.getTranslation('mins'), value: 300},
            {key: '7 ' + LANG.getTranslation('mins'), value: 420},
            {key: '10 ' + LANG.getTranslation('mins'), value: 600},
            {key: '12 ' + LANG.getTranslation('mins'), value: 720},
            {key: '15 ' + LANG.getTranslation('mins'), value: 900},
        ];
        this.state = {
            minutes: GLOBAL.Minutes,
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
        Actions.Settings();
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
    _setOffset(item) {
        GLOBAL.Catchup_DVR_Offset = item.value;
        UTILS.storeProfile(
            'settings_offset',
            0,
            0,
            0,
            0,
            [],
            GLOBAL.Catchup_DVR_Offset,
        );
        Actions.Settings();
    }
    _setFocusOnFirst(index) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
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
    renderItem(item, index) {
        if (item.value == GLOBAL.Catchup_DVR_Offset) {
            return (
                <ButtonSized
                    Color={'#999'}
                    IconRight={SolidIcons.check}
                    Width={GLOBAL.Device_Width / 3}
                    Padding={0}
                    underlayColor={GLOBAL.Button_Color}
                    hasTVPreferredFocus={this._setFocusOnFirst(index)}
                    onPress={() => this._setOffset(item)}
                    Text={item.key}
                />
            );
        } else {
            return (
                <ButtonSized
                    Color={'#000'}
                    Width={GLOBAL.Device_Width / 3}
                    Padding={0}
                    underlayColor={GLOBAL.Button_Color}
                    hasTVPreferredFocus={this._setFocusOnFirst(index)}
                    onPress={() => this._setOffset(item)}
                    Text={item.key}
                />
            );
        }
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
                                {LANG.getTranslation('change_offset')}
                            </Text>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.Subtext,
                                    styles.Width_80_Percent,
                                    styles.CenterText,
                                ]}
                            >
                                {LANG.getTranslation('change_offset_help')}
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <FlatList
                                ref={ref => {
                                    this.flatListRef = ref;
                                }}
                                data={this.state.minutes}
                                horizontal={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item, index}) =>
                                    this.renderItem(item, index)
                                }
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
