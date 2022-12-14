import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    Platform,
    BackHandler,
    TVMenuControl,
    FlatList,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Badge } from 'react-native-elements';
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
export default class Devices extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            clock: GLOBAL.Clock_Type,
            devices: [],
            loading: true,
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
        Actions.Set_Language();
    }
    componentDidMount() {
        this.getRegisteredDevices();
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

    toAlphaNumeric(input) {
        if (input != null) {
            input = input.toString().replace(/\s/g, '');
            return input.toString().replace(/[^A-Za-z0-9]/g, '');
        } else {
            return '';
        }
    }
    getRegisteredDevices() {
        DAL.getDevices(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            this.toAlphaNumeric(GLOBAL.UserID) + '.' + GLOBAL.Pass,
        ).then(devices => {
            this.setState({
                devices: devices.devices,
                loading: false,
            });
        });
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
    getDevice(item, index) {
        var isMobile =
            item.type.indexOf('Handheld') > -1 || item.type.indexOf('PWA') > -1;
        var isTablet = item.type.indexOf('Tablet') > -1;
        var isWeb = item.model.indexOf('WebTV') > -1;

        return (
            <View
                style={{
                    height: 100,
                    flexDirection: 'row',
                    marginVertical: 5,
                    backgroundColor: 'rgba(0, 0, 0, 0.60)',
                    borderRadius: 5,
                }}
            >
                <View
                    style={{
                        flex: 2,
                        flexDirection: 'row',
                        paddingLeft: GLOBAL.Device_IsPhone ? 0 : 20,
                    }}
                >
                    {RenderIf(GLOBAL.Device_UniqueID != item.uuid)(
                        <ButtonSmall
                            Color={'#000'}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this._deleteDevice(item)}
                            Text={LANG.getTranslation('delete')}
                        >
                            {' '}
                        </ButtonSmall>,
                    )}
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {isMobile && (
                        <FontAwesome5
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={SolidIcons.mobileAlt}
                            name="mobile-alt"
                        />
                    )}
                    {isTablet && (
                        <FontAwesome5
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={SolidIcons.tabletAlt}
                            name="tablet-alt"
                        />
                    )}
                    {isWeb && (
                        <FontAwesome5
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={SolidIcons.laptop}
                            name="laptop"
                        />
                    )}
                    {!isMobile && !isTablet && !isWeb && (
                        <FontAwesome5
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={SolidIcons.tv}
                            name="tv"
                        />
                    )}
                </View>
                <View
                    style={{
                        flex: 5,
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                >
                    <Text numberOfLines={1} style={styles.Menu}>
                        {item.model}
                    </Text>
                    <Text numberOfLines={1} style={[styles.Menu, {}]}>
                        {item.uuid}
                    </Text>
                </View>
            </View>
        );
    }
    _deleteDevice(item) {
        var devices = this.state.devices.filter(d => d.valid != item.valid);
        DAL.setDevices(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            GLOBAL.UserID + '.' + GLOBAL.Pass,
            devices,
        )
            .then(result => {
                this.getRegisteredDevices();
            })
            .catch(error => { });
    }
    render() {
        if (this.state.loading) {
            return (
                <View style={styles.content_container_content}>
                    <Loader size={'large'} color={'#e0e0e0'} />
                </View>
            );
        }
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
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
                                marginBottom: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={styles.H2}>
                                {LANG.getTranslation('connecteddevices')}
                            </Text>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.Subtext,
                                    styles.Width_80_Percent,
                                    styles.CenterText,
                                ]}
                            >
                                {LANG.getTranslation('connectedtoyouraccount')}
                            </Text>
                        </View>
                        <FlatList
                            ref={ref => {
                                this.flatListRef = ref;
                            }}
                            data={this.state.devices}
                            horizontal={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => {
                                return this.getDevice(item, index);
                            }}
                        />
                    </View>
                </View>
            </View>
        );
    }
}
