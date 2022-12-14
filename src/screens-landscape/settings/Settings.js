import React, { Component } from 'react';
import {
    View,
    Text,
    ScrollView,
    Platform,
    BackHandler,
    TVMenuControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Badge } from 'react-native-elements';
import About from './About';
import Childlock from './Childlock';
import Catchup from './Catchup';
import Devices from './Devices';
import Disclaimer from './Disclaimer';
import OTA from './OTA';
import Quality from './Quality';
import Language from './Language';
import Support from './Support';
// import {SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { sendPageReport } from '../../reporting/reporting';
export default class Settings extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };

        var menu_width = 0;
        if (GLOBAL.Device_IsPhone) {
            menu_width = GLOBAL.COL_3;
        }
        if (!GLOBAL.Device_IsPhone) {
            menu_width = GLOBAL.COL_4;
        }
        this.state = {
            reportStartTime: moment().unix(),
            menu_width: menu_width,
            errortext: '',
            clock: GLOBAL.Clock_Type,
            keyboardType:
                GLOBAL.Device_Type == '_FireTV' ? 'phone-pad' : 'number-pad',
            show_keyboard: GLOBAL.Device_IsSTB == true ? false : true,
            settings_page:
                this.props.settings_page != undefined
                    ? this.props.settings_page
                    : 'About',
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
            if (!this.childlock_.isFocused && !this.setlock_.isFocused) {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            }
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
        sendPageReport('Settings', this.state.reportStartTime, moment().unix());
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
    getSettingsPage(page) {
        switch (page) {
            case 'About':
                return <About></About>;
                break;
            case 'Catchup':
                return (
                    <Catchup
                        Old={this.props.Old}
                        New={this.props.New}
                    ></Catchup>
                );
                break;
            case 'Childlock':
                return (
                    <Childlock
                        Old={this.props.Old}
                        New={this.props.New}
                    ></Childlock>
                );
                break;
            case 'Devices':
                return <Devices></Devices>;
                break;
            case 'Disclaimer':
                return <Disclaimer></Disclaimer>;
                break;
            case 'Language':
                return <Language></Language>;
                break;
            case 'OTA':
                return <OTA></OTA>;
                break;
            case 'Quality':
                return <Quality></Quality>;
                break;
            case 'Support':
                return <Support></Support>;
                break;
            default:
                return <About></About>;
                break;
        }
    }
    render() {
        return (
            <Container
                needs_notch={true}
                // hide_header={true}
                hide_menu={true}
                hide_header={
                    GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                        ? true
                        : false
                }
            >
                {RenderIf(GLOBAL.Device_IsPhone == false)(
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            margin: 10,
                            borderRadius: 5,
                        }}
                    >
                        <View
                            style={{
                                borderRadius: 5,
                                flexDirection: 'column',
                                backgroundColor: 'rgba(0, 0, 0, 0.60)',
                                width: this.state.menu_width + 20,
                            }}
                        >
                            <View
                                style={{
                                    alignItems: 'center',
                                    width: this.state.menu_width + 20,
                                }}
                            >
                                <FontAwesome5
                                    style={[
                                        styles.IconsMenuMedium,
                                        { color: '#666', paddingVertical: 5 },
                                    ]}
                                    // icon={SolidIcons.chevronUp}
                                    name="chevron-up"
                                />
                            </View>

                            <ScrollView horizontal={false} style={{ padding: 5 }}>
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{ borderRadius: 5 }}
                                    hasTVPreferredFocus={false}
                                    isTVSelectable={GLOBAL.Device_IsTV}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => Actions.Home()}
                                >
                                    <View
                                        style={{
                                            width: this.state.menu_width,
                                            padding:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_Manufacturer ==
                                                    'Samsung Tizen'
                                                    ? 20
                                                    : 10,
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.Medium}
                                            >
                                                {LANG.getTranslation('back')}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == true,
                                        )(
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    {
                                                        color: '#fff',
                                                        paddingVertical: 5,
                                                    },
                                                ]}
                                                // icon={SolidIcons.arrowLeft}
                                                name="arrow-left"
                                            />,
                                        )}
                                    </View>
                                </TouchableHighlightFocus>
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{ borderRadius: 5 }}
                                    hasTVPreferredFocus={
                                        this.state.settings_page == 'About'
                                            ? true
                                            : false
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() =>
                                        Actions.Settings({
                                            settings_page: 'About',
                                        })
                                    }
                                >
                                    <View
                                        style={{
                                            borderRadius: 5,
                                            padding:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_Manufacturer ==
                                                    'Samsung Tizen'
                                                    ? 20
                                                    : 10,
                                            backgroundColor:
                                                this.state.settings_page ==
                                                    'About'
                                                    ? GLOBAL.Selection_Color
                                                    : 'transparent',
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.Medium}
                                            >
                                                {LANG.getTranslation('about')}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == true,
                                        )(
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    {
                                                        color: '#fff',
                                                        paddingVertical: 5,
                                                    },
                                                ]}
                                                // icon={SolidIcons.userCog}
                                                name="user-cog"
                                            />,
                                        )}
                                    </View>
                                </TouchableHighlightFocus>
                                {RenderIf(Platform.OS === 'android')(
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{ borderRadius: 5 }}
                                        hasTVPreferredFocus={
                                            this.state.settings_page == 'OTA'
                                                ? true
                                                : false
                                        }
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() =>
                                            Actions.Settings({
                                                settings_page: 'OTA',
                                            })
                                        }
                                    >
                                        <View
                                            style={{
                                                borderBottomColor: 'red',
                                                borderBottomWidth:
                                                    GLOBAL.OTA_Update &&
                                                        Platform.OS == 'android'
                                                        ? 2
                                                        : 0,
                                                borderRadius: 5,
                                                padding:
                                                    GLOBAL.Device_IsAppleTV ||
                                                        GLOBAL.Device_Manufacturer ==
                                                        'Samsung Tizen'
                                                        ? 20
                                                        : 10,
                                                backgroundColor:
                                                    this.state.settings_page ==
                                                        'OTA'
                                                        ? GLOBAL.Selection_Color
                                                        : 'transparent',
                                            }}
                                        >
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == false,
                                            )(
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.Medium}
                                                >
                                                    {LANG.getTranslation(
                                                        'updateapp',
                                                    )}
                                                </Text>,
                                            )}
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == true,
                                            )(
                                                <FontAwesome5
                                                    style={[
                                                        styles.IconsMenuMedium,
                                                        {
                                                            color: '#fff',
                                                            paddingVertical: 5,
                                                        },
                                                    ]}
                                                    // icon={SolidIcons.wrench}
                                                    name="wrench"
                                                />,
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>,
                                )}
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{ borderRadius: 5 }}
                                    hasTVPreferredFocus={
                                        this.state.settings_page == 'Catchup'
                                            ? true
                                            : false
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() =>
                                        Actions.Settings({
                                            settings_page: 'Catchup',
                                        })
                                    }
                                >
                                    <View
                                        style={{
                                            borderRadius: 5,
                                            padding:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_Manufacturer ==
                                                    'Samsung Tizen'
                                                    ? 20
                                                    : 10,
                                            backgroundColor:
                                                this.state.settings_page ==
                                                    'Catchup'
                                                    ? GLOBAL.Selection_Color
                                                    : 'transparent',
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.Medium}
                                            >
                                                {LANG.getTranslation(
                                                    'interactive_tv_dvr',
                                                )}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == true,
                                        )(
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    {
                                                        color: '#fff',
                                                        paddingVertical: 5,
                                                    },
                                                ]}
                                                // icon={SolidIcons.redo}
                                                name="redo"
                                            />,
                                        )}
                                    </View>
                                </TouchableHighlightFocus>
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{ borderRadius: 5 }}
                                    hasTVPreferredFocus={
                                        this.state.settings_page == 'Childlock'
                                            ? true
                                            : false
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() =>
                                        Actions.Settings({
                                            settings_page: 'Childlock',
                                        })
                                    }
                                >
                                    <View
                                        style={{
                                            borderRadius: 5,
                                            padding:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_Manufacturer ==
                                                    'Samsung Tizen'
                                                    ? 20
                                                    : 10,
                                            backgroundColor:
                                                this.state.settings_page ==
                                                    'Childlcok'
                                                    ? GLOBAL.Selection_Color
                                                    : 'transparent',
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.Medium}
                                            >
                                                {LANG.getTranslation(
                                                    'change_childlock',
                                                )}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == true,
                                        )(
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    {
                                                        color: '#fff',
                                                        paddingVertical: 5,
                                                    },
                                                ]}
                                                // icon={SolidIcons.lock}
                                                name="lock"
                                            />,
                                        )}
                                    </View>
                                </TouchableHighlightFocus>
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{ borderRadius: 5 }}
                                    hasTVPreferredFocus={
                                        this.state.settings_page == 'Language'
                                            ? true
                                            : false
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() =>
                                        Actions.Settings({
                                            settings_page: 'Language',
                                        })
                                    }
                                >
                                    <View
                                        style={{
                                            borderRadius: 5,
                                            padding:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_Manufacturer ==
                                                    'Samsung Tizen'
                                                    ? 20
                                                    : 10,
                                            backgroundColor:
                                                this.state.settings_page ==
                                                    'Language'
                                                    ? GLOBAL.Selection_Color
                                                    : 'transparent',
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.Medium}
                                            >
                                                {LANG.getTranslation(
                                                    'change_language',
                                                )}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == true,
                                        )(
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    {
                                                        color: '#fff',
                                                        paddingVertical: 5,
                                                    },
                                                ]}
                                                // icon={SolidIcons.globe}
                                                name="globe"
                                            />,
                                        )}
                                    </View>
                                </TouchableHighlightFocus>
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{ borderRadius: 5 }}
                                    hasTVPreferredFocus={false}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this.setTimeSetting()}
                                >
                                    <View
                                        style={{
                                            borderRadius: 5,
                                            padding:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_Manufacturer ==
                                                    'Samsung Tizen'
                                                    ? 20
                                                    : 10,
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.Medium}
                                            >
                                                {this.state.clock}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == true,
                                        )(
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    {
                                                        color: '#fff',
                                                        paddingVertical: 5,
                                                    },
                                                ]}
                                                // icon={SolidIcons.clock}
                                                name="clock"
                                            />,
                                        )}
                                    </View>
                                </TouchableHighlightFocus>
                                {RenderIf(GLOBAL.Show_Disclaimer == true)(
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{ borderRadius: 5 }}
                                        hasTVPreferredFocus={
                                            this.state.settings_page ==
                                                'Disclaimer'
                                                ? true
                                                : false
                                        }
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() =>
                                            Actions.Settings({
                                                settings_page: 'Disclaimer',
                                            })
                                        }
                                    >
                                        <View
                                            style={{
                                                borderRadius: 5,
                                                padding:
                                                    GLOBAL.Device_IsAppleTV ||
                                                        GLOBAL.Device_Manufacturer ==
                                                        'Samsung Tizen'
                                                        ? 20
                                                        : 10,
                                                backgroundColor:
                                                    this.state.settings_page ==
                                                        'Disclaimer'
                                                        ? GLOBAL.Selection_Color
                                                        : 'transparent',
                                            }}
                                        >
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == false,
                                            )(
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.Medium}
                                                >
                                                    {LANG.getTranslation(
                                                        'disclaimer',
                                                    )}
                                                </Text>,
                                            )}
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == true,
                                            )(
                                                <FontAwesome5
                                                    style={[
                                                        styles.IconsMenuMedium,
                                                        {
                                                            color: '#fff',
                                                            paddingVertical: 5,
                                                        },
                                                    ]}
                                                    // icon={SolidIcons.fileAlt}
                                                    name="file-alt"
                                                />,
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>,
                                )}
                                {RenderIf(GLOBAL.SupportPages.length > 0)(
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{ borderRadius: 5 }}
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() => Actions.Support()}
                                    >
                                        <View
                                            style={{
                                                borderRadius: 5,
                                                padding:
                                                    GLOBAL.Device_IsAppleTV ||
                                                        GLOBAL.Device_Manufacturer ==
                                                        'Samsung Tizen'
                                                        ? 20
                                                        : 10,
                                            }}
                                        >
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == false,
                                            )(
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.Medium}
                                                >
                                                    {LANG.getTranslation(
                                                        'support',
                                                    )}
                                                </Text>,
                                            )}
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == true,
                                            )(
                                                <FontAwesome5
                                                    style={[
                                                        styles.IconsMenuMedium,
                                                        {
                                                            color: '#fff',
                                                            paddingVertical: 5,
                                                        },
                                                    ]}
                                                    // icon={SolidIcons.infoCircle}
                                                    name="info-circle"
                                                />,
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>,
                                )}
                                {/* <TouchableHighlightFocus BorderRadius={5} style={{ borderRadius: 5, }} hasTVPreferredFocus={this.state.settings_page == 'Quality' ? true : false} underlayColor={GLOBAL.Button_Color} onPress={() => Actions.Settings({ settings_page: 'Quality' })}>
                                    <View style={{ borderRadius: 5, padding: GLOBAL.Device_IsAppleTV || GLOBAL.Device_Manufacturer == "Samsung Tizen" ? 20 : 10, backgroundColor: this.state.settings_page == 'Quality' ? GLOBAL.Selection_Color : 'transparent' }}>
                                        {RenderIf(GLOBAL.Device_IsPhone == false)(
                                            <Text numberOfLines={1} style={styles.Medium}>{LANG.getTranslation("video_quality")}</Text>
                                        )}
                                        {RenderIf(GLOBAL.Device_IsPhone == true)(
                                            <FontAwesome5 style={[styles.IconsMenuMedium, { color: '#fff', paddingVertical: 5 }]} icon={SolidIcons.tv} />
                                        )}
                                    </View>
                                </TouchableHighlightFocus> */}
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{ borderRadius: 5 }}
                                    hasTVPreferredFocus={
                                        this.state.settings_page == 'Devices'
                                            ? true
                                            : false
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() =>
                                        Actions.Settings({
                                            settings_page: 'Devices',
                                        })
                                    }
                                >
                                    <View
                                        style={{
                                            borderRadius: 5,
                                            padding:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_Manufacturer ==
                                                    'Samsung Tizen'
                                                    ? 20
                                                    : 10,
                                            backgroundColor:
                                                this.state.settings_page ==
                                                    'Devices'
                                                    ? GLOBAL.Selection_Color
                                                    : 'transparent',
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.Medium}
                                            >
                                                {LANG.getTranslation('Devices')}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == true,
                                        )(
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenuMedium,
                                                    {
                                                        color: '#fff',
                                                        paddingVertical: 5,
                                                    },
                                                ]}
                                                // icon={SolidIcons.tabletAlt}
                                                name="tablet-alt"
                                            />,
                                        )}
                                    </View>
                                </TouchableHighlightFocus>
                            </ScrollView>
                            <View
                                style={{
                                    alignItems: 'center',
                                    width: this.state.menu_width + 20,
                                }}
                            >
                                <FontAwesome5
                                    style={[
                                        styles.IconsMenuMedium,
                                        { color: '#666', paddingVertical: 5 },
                                    ]}
                                    // icon={SolidIcons.chevronDown}
                                    name="chevron-down"
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            {this.getSettingsPage(this.state.settings_page)}
                        </View>
                    </View>,
                )}
            </Container>
        );
    }
}
