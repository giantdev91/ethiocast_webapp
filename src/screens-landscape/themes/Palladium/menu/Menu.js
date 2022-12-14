import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    BackHandler,
    TVMenuControl,
    Image,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import UserAvatar from 'react-native-user-avatar';
import { Badge } from 'react-native-elements';
// import {RegularIcons, SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

// import GLOBALModule from '../../../../datalayer/global';
var GLOBALModule = require('../../../../datalayer/global');
var GLOBAL = GLOBALModule.default;

let TouchableHighlight;
if (GLOBAL.Device_IsTablet || GLOBAL.Device_IsPhone) {
    TouchableHighlight =
        require('react-native-gesture-handler').TouchableHighlight;
} else {
    TouchableHighlight = require('react-native').TouchableHighlight;
}

export default class Menu extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            menu: GLOBAL.Menu,
            basemenu: GLOBAL.MenuBase,
            popup_loader_: false,
            progress: 0,
            downloaded_: 0,
            size_: 0,
            hamburger: false,
            menu_show: false,
            local_focus: false,
            clock_time: moment().format(GLOBAL.Clock_Setting),
        };
        if (GLOBAL.Device_System == 'Android') {
            if (
                GLOBAL.Device_IsPhone == true ||
                GLOBAL.Device_IsTablet == true
            ) {
                try {
                    GoogleCast.EventEmitter.addListener(
                        GoogleCast.SESSION_STARTED,
                        () => {
                            GLOBAL.IsCasting = true;
                        },
                    );
                    GoogleCast.EventEmitter.addListener(
                        GoogleCast.SESSION_ENDED,
                        () => {
                            GLOBAL.IsCasting = false;
                        },
                    );
                } catch (error) { }
            }
        }
    }
    componentDidMount() {
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.state.hamburger == true) {
                    GLOBAL.Hamburger = false;
                    this.setState({
                        hamburger: false,
                    });
                }
            },
        );
        // if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
        //     KeyEvent.onKeyDownListener((keyEvent) => {
        //         if (keyEvent.keyCode == 90 || keyEvent.keyCode == 89) {
        //             if (this.state.hamburger == true) {
        //                 this.setState({
        //                     hamburger: false
        //                 })
        //             }
        //         }
        //         if (keyEvent.keyCode == 22) {
        //             if (this.state.local_focus == true) {
        //                 this.setState({
        //                     local_focus: false
        //                 })
        //             }
        //         }
        //     });
        // }
    }
    componentWillUnmount() {
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        // if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
        //     KeyEvent.removeKeyDownListener();
        // }
    }
    toAlphaNumeric(input) {
        if (input != null) {
            input = input.toString().replace(/\s/g, '');
            return input.toString().replace(/[^A-Za-z0-9]/g, '');
        } else {
            return '';
        }
    }

    _onPressButtonMenu(item) {
        if (Platform.OS === 'android' && item.is_app == true) {
            DeviceInfo.getAppInstalled(item.package_name).then(installed => {
                if (installed == true) {
                    ReactNativeAPK.runApp(item.package_name);
                } else {
                    this.setState({
                        popup_loader_: true,
                    });
                    RNFetchBlob.config({
                        fileCache: true,
                        appendExt: 'apk',
                    })
                        .fetch('GET', item.package_url, {
                            //some headers ..
                        })
                        .progress((received, total) => {
                            this.setState({
                                progress:
                                    Math.round(received / 1000) +
                                    'Kb / ' +
                                    Math.round(total / 1000) +
                                    'Kb',
                            });
                        })
                        .then(res => {
                            this.setState({
                                popup_loader_: false,
                            });
                            android.actionViewIntent(
                                res.path(),
                                'application/vnd.android.package-archive',
                            );
                        });
                }
            });
        } else {
            GLOBAL.Focus = item.name;

            GLOBAL.Channels_Selected_Index = 0;
            GLOBAL.Channels_Selected_Row = 0;

            GLOBAL.Store_Selected_Index = 0;
            GLOBAL.Store_Sub_Selected_Index = 0;

            GLOBAL.Store_Selected_Index = 0;

            (GLOBAL.Tag_Selected_Index = 0),
                (GLOBAL.Tag_Selected_Row = 0),
                (GLOBAL.Movie_Selected = null);
            GLOBAL.Movie_Selected_Index = 0;
            GLOBAL.Movie_Selected_Category_ID = 0;
            GLOBAL.Movie_Selected_Row = 0;

            GLOBAL.Season_Selected_Season = null;
            GLOBAL.Season_Selected_Season_ID = 0;
            GLOBAL.Season_Selected_Episode_Index = 0;
            GLOBAL.Series_Selected_Index = 0;
            GLOBAL.Season_Selected_Index = 0;
            GLOBAL.Season_Selected_Episode_Row = 0;
            GLOBAL.Series_Selected = null;

            GLOBAL.Focus = item.name;
            switch (item.name) {
                case 'Search':
                    Actions.SearchBox();
                    break;
                case 'Home':
                    if (GLOBAL.Device_IsWebTV) {
                        GLOBAL.Focus = 'Home';
                        Actions.Home();
                    } else {
                        if (Platform.OS == 'android') {
                            clear.clearAppCache(() => {
                                GLOBAL.Focus = 'Home';
                                Actions.Home();
                            });
                        } else {
                            GLOBAL.Focus = 'Home';
                            Actions.Home();
                        }
                    }
                    break;
                case 'Channels':
                    Actions.Channels({ fromPage: 'menu' });
                    break;
                case 'Television':
                    GLOBAL.Focus = 'Television';
                    if (GLOBAL.Channels_Selected.length > 0) {
                        GLOBAL.Channel = UTILS.getChannel(
                            GLOBAL.Channels_Selected[0].channel_id,
                        );
                        Actions.Player({ fromPage: 'Home' });
                    }
                    break;
                case 'TV Guide':
                    Actions.EPG();
                    break;
                case 'Recordings':
                    Actions.Recordings();
                    break;
                case 'Movies':
                    Actions.Movies_Stores({ fromPage: 'menu' });
                    break;
                case 'Series':
                    Actions.Series_Stores({ fromPage: 'menu' });
                    break;
                case 'Music':
                    Actions.Music_Albums({ fromPage: 'menu' });
                    break;
                case 'Apps':
                    Actions.MarketPlace();
                    break;
                case 'Settings':
                    Actions.Settings();
                    break;
                case 'Youtube':
                    Actions.Youtube();
                    break;
                case 'My List':
                    Actions.MyList();
                    break;
                case 'My Favorites':
                    Actions.MyFavorites();
                    break;
                case 'My Content':
                    Actions.MyContent();
                    break;
                case 'Downloads':
                    Actions.Downloads();
                    break;
                case 'Education':
                    Actions.Education_Stores({ fromPage: 'menu' });
                    break;
                case 'Profile':
                    Actions.Profiles();
                    break;
                case 'Messages':
                    Actions.Messages({ fromPage: true });
                    break;
                case 'CatchupTV':
                    Actions.Catchup();
                    break;
                case 'Logout':
                    DAL.getDevices(
                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                        this.toAlphaNumeric(GLOBAL.UserID) + '.' + GLOBAL.Pass,
                    )
                        .then(devices => {
                            if (
                                devices.devices != undefined &&
                                devices.devices != ''
                            ) {
                                var today = moment().utc().unix();
                                var devicesLeft = devices.devices.filter(
                                    element =>
                                        element.uuid != GLOBAL.Device_UniqueID,
                                );
                                var devicesNotToOld = devicesLeft.filter(
                                    d => d.valid > today,
                                );
                                DAL.setDevices(
                                    GLOBAL.IMS + '.' + GLOBAL.CRM,
                                    this.toAlphaNumeric(GLOBAL.UserID) +
                                    '.' +
                                    GLOBAL.Pass,
                                    devicesNotToOld,
                                )
                                    .then(result => {
                                        GLOBAL.Focus = 'Logout';
                                        GLOBAL.AutoLogin = false;
                                        if (
                                            GLOBAL.UserID == 'lgapptest' ||
                                            GLOBAL.UserID == 'tizenapptest'
                                        ) {
                                            GLOBAL.UserID = '';
                                            GLOBAL.Pass = '';
                                            GLOBAL.ServiceID = '';
                                            UTILS.storeJson('UserID', '');
                                            UTILS.storeJson('Pass', '');
                                            UTILS.storeJson('ServiceID', '');
                                        }
                                        GLOBAL.App_Theme = 'Default';
                                        UTILS.storeJson('AutoLogin', false);
                                        if (GLOBAL.HasService == true) {
                                            GLOBAL.Logo =
                                                GLOBAL.HTTPvsHTTPS +
                                                GLOBAL.Settings_Services_Login.contact.logo
                                                    .toString()
                                                    .replace('http://', '')
                                                    .replace('https://', '')
                                                    .replace('//', '');
                                            GLOBAL.Background =
                                                GLOBAL.HTTPvsHTTPS +
                                                GLOBAL.Settings_Services_Login.contact.background
                                                    .toString()
                                                    .replace('http://', '')
                                                    .replace('https://', '')
                                                    .replace('//', '');
                                            GLOBAL.Support =
                                                GLOBAL.Settings_Services_Login.contact.text;
                                            Actions.Services();
                                        } else {
                                            GLOBAL.Logo =
                                                GLOBAL.HTTPvsHTTPS +
                                                GLOBAL.Settings_Services_Login.contact.logo
                                                    .toString()
                                                    .replace('http://', '')
                                                    .replace('https://', '')
                                                    .replace('//', '');
                                            GLOBAL.Background =
                                                GLOBAL.HTTPvsHTTPS +
                                                GLOBAL.Settings_Services_Login.contact.background
                                                    .toString()
                                                    .replace('http://', '')
                                                    .replace('https://', '')
                                                    .replace('//', '');
                                            GLOBAL.Support =
                                                GLOBAL.Settings_Services_Login.contact.text;
                                            Actions.Authentication();
                                        }
                                    })
                                    .catch(error => {
                                        GLOBAL.Focus = 'Logout';
                                        GLOBAL.AutoLogin = false;
                                        if (
                                            GLOBAL.Device_Manufacturer ==
                                            'LG WebOS'
                                        ) {
                                            GLOBAL.UserID = '';
                                            GLOBAL.Pass = '';
                                            GLOBAL.ServiceID = '';
                                        }
                                        GLOBAL.App_Theme = 'Default';
                                        UTILS.storeJson('AutoLogin', false);
                                        if (GLOBAL.HasService == true) {
                                            GLOBAL.Logo =
                                                GLOBAL.HTTPvsHTTPS +
                                                GLOBAL.Settings_Services_Login.contact.logo
                                                    .toString()
                                                    .replace('http://', '')
                                                    .replace('https://', '')
                                                    .replace('//', '');
                                            GLOBAL.Background =
                                                GLOBAL.HTTPvsHTTPS +
                                                GLOBAL.Settings_Services_Login.contact.background
                                                    .toString()
                                                    .replace('http://', '')
                                                    .replace('https://', '')
                                                    .replace('//', '');
                                            GLOBAL.Support =
                                                GLOBAL.Settings_Services_Login.contact.text;
                                            Actions.Services();
                                        } else {
                                            GLOBAL.Logo =
                                                GLOBAL.HTTPvsHTTPS +
                                                GLOBAL.Settings_Services_Login.contact.logo
                                                    .toString()
                                                    .replace('http://', '')
                                                    .replace('https://', '')
                                                    .replace('//', '');
                                            GLOBAL.Background =
                                                GLOBAL.HTTPvsHTTPS +
                                                GLOBAL.Settings_Services_Login.contact.background
                                                    .toString()
                                                    .replace('http://', '')
                                                    .replace('https://', '')
                                                    .replace('//', '');
                                            GLOBAL.Support =
                                                GLOBAL.Settings_Services_Login.contact.text;
                                            Actions.Authentication();
                                        }
                                    });
                            } else {
                                GLOBAL.Focus = 'Logout';
                                GLOBAL.AutoLogin = false;
                                if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                                    GLOBAL.UserID = '';
                                    GLOBAL.Pass = '';
                                    GLOBAL.ServiceID = '';
                                }
                                GLOBAL.App_Theme = 'Default';
                                UTILS.storeJson('AutoLogin', false);
                                if (GLOBAL.HasService == true) {
                                    GLOBAL.Logo =
                                        GLOBAL.HTTPvsHTTPS +
                                        GLOBAL.Settings_Services_Login.contact.logo
                                            .toString()
                                            .replace('http://', '')
                                            .replace('https://', '')
                                            .replace('//', '');
                                    GLOBAL.Background =
                                        GLOBAL.HTTPvsHTTPS +
                                        GLOBAL.Settings_Services_Login.contact.background
                                            .toString()
                                            .replace('http://', '')
                                            .replace('https://', '')
                                            .replace('//', '');
                                    GLOBAL.Support =
                                        GLOBAL.Settings_Services_Login.contact.text;
                                    Actions.Services();
                                } else {
                                    GLOBAL.Logo =
                                        GLOBAL.HTTPvsHTTPS +
                                        GLOBAL.Settings_Services_Login.contact.logo
                                            .toString()
                                            .replace('http://', '')
                                            .replace('https://', '')
                                            .replace('//', '');
                                    GLOBAL.Background =
                                        GLOBAL.HTTPvsHTTPS +
                                        GLOBAL.Settings_Services_Login.contact.background
                                            .toString()
                                            .replace('http://', '')
                                            .replace('https://', '')
                                            .replace('//', '');
                                    GLOBAL.Support =
                                        GLOBAL.Settings_Services_Login.contact.text;
                                    Actions.Authentication();
                                }
                            }
                        })
                        .catch(error => {
                            GLOBAL.Focus = 'Logout';
                            GLOBAL.AutoLogin = false;
                            if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                                GLOBAL.UserID = '';
                                GLOBAL.Pass = '';
                                GLOBAL.ServiceID = '';
                            }
                            GLOBAL.App_Theme = 'Default';
                            UTILS.storeJson('AutoLogin', false);
                            if (GLOBAL.HasService == true) {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                Actions.Services();
                            } else {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                Actions.Authentication();
                            }
                        });
                    break;
            }
        }
    }
    checkBaseMenuItems(item, index) {
        if (
            item.name == 'My List' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_watchlist_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this.state.hamburger}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={RegularIcons.playCircle}
                                name="play-circle"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation('watchlist')}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            item.name == 'My Favorites' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_favourites_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome
                                style={styles.IconsMenuStandard}
                                // icon={RegularIcons.heart}
                                name="heart-o"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String('Favorites'))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            item.name == 'My Content' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_favourites_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.moneyBill}
                                name="money-bill"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String('my_content'))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            item.name == 'Downloads' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_download_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.download}
                                name="download"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }

        if (
            item.name == 'Messages' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_messages_menu == true
        ) {
            var nonDeleted = GLOBAL.Messages.filter(m => m.deleted == false);
            if (nonDeleted) {
                var readMessages = nonDeleted.filter(m => m.read == false);
                if (readMessages) {
                    GLOBAL.Messages_QTY = readMessages.length;
                }
            }
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsAndroidTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsFireTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsSTB,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 25,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsTablet,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsPhone,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsWebTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsAppleTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 30,
                                    }}
                                />,
                            )}
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={RegularIcons.envelope}
                                name="envelope"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String('messagecenter'))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            item.name == 'Settings' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_settings_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsAndroidTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsFireTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsSTB,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 25,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsTablet,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsPhone,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.slidersHh}
                                name="sliders-h"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            item.name == 'Search' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_search_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.search}
                                name="search"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            item.name == 'Profile' &&
            item.is_app == false &&
            GLOBAL.Selected_Profile.name != '' &&
            GLOBAL.UserInterface.general.enable_profiles == true
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={true}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <UserAvatar
                                size={40}
                                name={GLOBAL.Selected_Profile.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .join('+')}
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 100 }}>
                            <Text
                                numberOfLines={1}
                                numberOfLines={1}
                                style={styles.Menu}
                            >
                                {GLOBAL.Selected_Profile.name}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }
    checkBaseMenuItemsMobile(item, index) {
        if (
            item.name == 'My List' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_watchlist_menu == true
        ) {
            return (
                <TouchableHighlight
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this.state.hamburger}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={RegularIcons.playCircle}
                                name="play-circle"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation('watchlist')}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (
            item.name == 'My Favorites' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_favourites_menu == true
        ) {
            return (
                <TouchableHighlight
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome
                                style={styles.IconsMenuStandard}
                                // icon={RegularIcons.heart}
                                name="heart-o"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String('Favorites'))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (
            item.name == 'My Content' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_favourites_menu == true
        ) {
            return (
                <TouchableHighlight
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.moneyBill}
                                name="money-bill"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String('my_content'))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (
            item.name == 'Downloads' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_download_menu == true
        ) {
            return (
                <TouchableHighlight
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.download}
                                name="download"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }

        if (
            item.name == 'Messages' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_messages_menu == true
        ) {
            var nonDeleted = GLOBAL.Messages.filter(m => m.deleted == false);
            if (nonDeleted) {
                var readMessages = nonDeleted.filter(m => m.read == false);
                if (readMessages) {
                    GLOBAL.Messages_QTY = readMessages.length;
                }
            }
            return (
                <TouchableHighlight
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsAndroidTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsFireTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsSTB,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 25,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsTablet,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsPhone,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsWebTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.Messages_QTY > 0 &&
                                GLOBAL.Device_IsAppleTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value={GLOBAL.Messages_QTY}
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={RegularIcons.envelope}
                                name="envelope"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String('messagecenter'))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (
            item.name == 'Settings' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_settings_menu == true
        ) {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsAndroidTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsFireTV,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsSTB,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 25,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsTablet,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                GLOBAL.OTA_Update == true &&
                                GLOBAL.Device_IsPhone,
                            )(
                                <Badge
                                    badgeStyle={{ borderColor: 'red' }}
                                    value="!"
                                    status="error"
                                    containerStyle={{
                                        position: 'absolute',
                                        zIndex: 99999,
                                        top: -2,
                                        left: 20,
                                    }}
                                />,
                            )}
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.slidersHh}
                                name="sliders-h"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (
            item.name == 'Search' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_search_menu == true
        ) {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.search}
                                name="search"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (
            item.name == 'Profile' &&
            item.is_app == false &&
            GLOBAL.Selected_Profile.name != '' &&
            GLOBAL.UserInterface.general.enable_profiles == true
        ) {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={true}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <UserAvatar
                                size={40}
                                name={GLOBAL.Selected_Profile.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .join('+')}
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text
                                numberOfLines={1}
                                numberOfLines={1}
                                style={styles.Menu}
                            >
                                {GLOBAL.Selected_Profile.name}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
    }

    _onPressShowBaseMenu() {
        if (!this.state.hamburger) {
            GLOBAL.Hamburger = true;
            this.setState({
                hamburger: true,
            });
        } else {
            GLOBAL.Hamburger = false;
            this.setState({
                hamburger: false,
            });
        }
    }
    focusMenu() {
        if (this.state.local_focus == false) {
            this.setState({
                local_focus: true,
            });
        }
    }

    checkMenuItems(item, index) {
        if (GLOBAL.Device_IsAppleTV && item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_IsWebTV && item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_IsAndroidTV && item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_IsFireTV && item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_System == 'Apple' && item.name == 'Youtube') {
            return null;
        }
        if (item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_IsSmartTV && item.name == 'CatchupTV') {
            return null;
        }
        if (
            item.name == 'Recordings' &&
            GLOBAL.UserInterface.general.enable_recordings == false
        ) {
            return null;
        }
        if (
            Platform.OS == 'android' &&
            item.name == 'Apps' &&
            GLOBAL.Device_IsSTB == true &&
            GLOBAL.Device_IsFireTV &&
            GLOBAL.Device_IsAndroidTV
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 3,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (item.name == 'Logout') {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }

        if (
            item.name == 'Casting' &&
            (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) &&
            GLOBAL.UserInterface.player.enable_casting == true
        ) {
            if (
                GLOBAL.Device_IsPhone == true ||
                GLOBAL.Device_IsTablet == true
            ) {
                return (
                    <View style={{ flex: 1, paddingLeft: 5 }}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: GLOBAL.Device_IsPhone
                                    ? 'row'
                                    : 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View
                                style={[
                                    {
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                ]}
                            >
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        left: 8,
                                        opacity: 0.6,
                                    }}
                                >
                                    <Image
                                        source={require('../../../../images/chromecast.png')}
                                        style={{ width: 20, height: 20 }}
                                    />
                                </View>
                                {RenderIf(
                                    GLOBAL.Device_System == 'Android' &&
                                    GLOBAL.Device_FormFactor !=
                                    'TOUCHPANEL',
                                )(
                                    <CastButton
                                        style={{
                                            width: 35,
                                            height: 35,
                                            tintColor: 'white',
                                            fontSize: 25,
                                            padding: 0,
                                        }}
                                    />,
                                )}
                                {RenderIf(GLOBAL.Device_System == 'Apple')(
                                    <CastButton
                                        activeTintColor="green"
                                        tintColor="white"
                                        style={{ width: 35, height: 35 }}
                                    />,
                                )}
                            </View>

                            <View style={{ alignSelf: 'center' }}>
                                <Text numberOfLines={1} style={styles.Menu}>
                                    {LANG.getTranslation(String(item.name))}
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            }
        }

        if (
            item.name != 'Logout' &&
            item.name != 'Personal' &&
            item.name != 'Hamburger' &&
            item.name != 'Apps' &&
            item.name != 'CatchupTV' &&
            item.name != 'Casting' &&
            item.is_app == false
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }

        if (
            item.name == 'CatchupTV' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_catchuptv == true
        ) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.history}
                                name="history"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {item.name}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (Platform.OS == 'android' && item.is_app == true) {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {item.name}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (item.name == 'Hamburger') {
            return (
                <TouchableHighlightFocus
                    style={{ borderRadius: 5 }}
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressShowBaseMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.user}
                                name="user"
                            />
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation('personal')}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }
    checkMenuItemsMobile(item, index) {
        if (GLOBAL.Device_IsAppleTV && item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_IsWebTV && item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_IsAndroidTV && item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_IsFireTV && item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_System == 'Apple' && item.name == 'Youtube') {
            return null;
        }
        if (item.name == 'Youtube') {
            return null;
        }
        if (GLOBAL.Device_IsSmartTV && item.name == 'CatchupTV') {
            return null;
        }
        if (
            item.name == 'Recordings' &&
            GLOBAL.UserInterface.general.enable_recordings == false
        ) {
            return null;
        }
        if (
            Platform.OS == 'android' &&
            item.name == 'Apps' &&
            GLOBAL.Device_IsSTB == true &&
            GLOBAL.Device_IsFireTV &&
            GLOBAL.Device_IsAndroidTV
        ) {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>

                        <View style={{ alignSelf: 'center' }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (item.name == 'Logout') {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }

        if (
            item.name != 'Logout' &&
            item.name != 'Personal' &&
            item.name != 'Hamburger' &&
            item.name != 'Apps' &&
            item.name != 'CatchupTV' &&
            item.name != 'Casting' &&
            item.is_app == false
        ) {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }

        if (
            item.name == 'CatchupTV' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_catchuptv == true
        ) {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.history}
                                name="history"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {item.name}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (Platform.OS == 'android' && item.is_app == true) {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {item.name}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
        if (item.name == 'Hamburger') {
            return (
                <TouchableHighlight
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressShowBaseMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: GLOBAL.Device_IsPhone
                                ? 'row'
                                : 'column',
                        }}
                    >
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    width: 50,
                                    margin: 2,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? GLOBAL.Button_Color
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuStandard}
                                // icon={SolidIcons.user}
                                name="user"
                            />
                        </View>

                        <View style={{ alignSelf: 'center', width: 150 }}>
                            <Text numberOfLines={1} style={styles.Menu}>
                                {LANG.getTranslation('personal')}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        }
    }
    getMenuIcon(menu) {
        switch (LANG.getTranslation(menu)) {
            case LANG.getTranslation('Search'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.search}
                        name="search"
                    />
                );
                break;
            case LANG.getTranslation('Home'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.home}
                        name="home"
                    />
                );
                break;
            case LANG.getTranslation('Channels'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.th}
                        name="th"
                    />
                );
                break;
            case LANG.getTranslation('Television'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.tv}
                        name="tv"
                    />
                );
                break;
            case LANG.getTranslation('TV Guide'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.thList}
                        name="th-list"
                    />
                );
                break;
            case LANG.getTranslation('Recordings'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={RegularIcons.dotCircle}
                        name="dot-circle"
                    />
                );
                break;
            case LANG.getTranslation('Movies'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.film}
                        name="film"
                    />
                );
                break;
            case LANG.getTranslation('Series'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.video}
                        name="video"
                    />
                );
                break;
            case LANG.getTranslation('Music'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.music}
                        name="music"
                    />
                );
                break;
            case LANG.getTranslation('Apps'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={BrandIcons.android}
                        name="android"
                    />
                );
                break;
            case LANG.getTranslation('Setting'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.slidersH}
                        name="sliders-h"
                    />
                );
                break;

            case LANG.getTranslation('Youtube'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={BrandIcons.youtube}
                        name="youtube"
                    />
                );
                break;
            case LANG.getTranslation('Logout'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.lock}
                        name="lock"
                    />
                );
                break;
            case LANG.getTranslation('Hamburger'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={RegularIcons.user}
                        name="user"
                    />
                );
                break;
            case LANG.getTranslation('My List'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={RegularIcons.playCircle}
                        name="play-circle"
                    />
                );
                break;
            case LANG.getTranslation('Downloads'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.download}
                        name="download"
                    />
                );
                break;
            case LANG.getTranslation('CatchupTV'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.history}
                        name="history"
                    />
                );
                break;
            case LANG.getTranslation('Education'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenuStandard}
                        // icon={SolidIcons.school}
                        name="school"
                    />
                );
                break;
            default:
                //this is an app menu
                break;
        }
    }
    focusButton = () => {
        this.setState({
            menu_focus: true,
        });
    };
    showMenu = () => {
        if (this.state.menu_show == false) {
            this.setState({
                menu_show: true,
            });
        }
    };
    hideMenu = () => {
        if (this.state.menu_show == true) {
            this.setState({
                menu_show: false,
                hamburger: false,
            });
        }
    };
    showBaseMenu = () => {
        if (this.state.hamburger == false) {
            this.setState({
                hamburger: true,
            });
        }
    };
    hideBaseMenu = () => {
        if (this.state.hamburger == true) {
            this.setState({
                hamburger: false,
            });
        }
    };
    _hideHamburgerMenu() {
        if (this.state.hamburger == true) {
            this.setState({
                hamburger: false,
            });
        }
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {RenderIf(GLOBAL.Device_IsPhone)(
                    <View style={{ flex: 1 }}>
                        {RenderIf(this.state.menu_show == false)(
                            <View
                                style={{
                                    justifyContent: 'flex-end',
                                    alignItems: 'flex-end',
                                    flexDirection: 'row',
                                    alignItems: 'flex-end',
                                    backgroundColor:
                                        this.state.menu_show == false
                                            ? 'transparent'
                                            : 'black',
                                    paddingLeft: 0,
                                    paddingBottom: 25,
                                }}
                                pointerEvents={'box-none'}
                            >
                                <TouchableHighlight
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this.showMenu()}
                                >
                                    <View
                                        style={[
                                            styles.Circle_45,
                                            styles.Shadow,
                                            ,
                                            {
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#fff',
                                            },
                                        ]}
                                    >
                                        <FontAwesome5
                                            style={[
                                                styles.IconsMenuStandard,
                                                { color: '#000' },
                                            ]}
                                            // icon={SolidIcons.bars}
                                            name="bars"
                                        />
                                    </View>
                                </TouchableHighlight>
                            </View>,
                        )}
                        {RenderIf(this.state.menu_show == true)(
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    height: GLOBAL.Device_Height / 1.5,
                                    width:
                                        this.state.menu_show == true ? 150 : 0,
                                    backgroundColor:
                                        this.state.menu_show == false
                                            ? 'transparent'
                                            : 'black',
                                }}
                                pointerEvents={'box-none'}
                            >
                                <View
                                    style={{ flex: 1, flexDirection: 'column' }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flex: 1 }}></View>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {RenderIf(
                                                this.state.menu_show == true,
                                            )(
                                                <Image
                                                    style={styles.Header_Logo}
                                                    resizeMethod={'scale'}
                                                    resizeMode={'contain'}
                                                    source={{ uri: GLOBAL.Logo }}
                                                ></Image>,
                                            )}
                                        </View>
                                        <View style={{ flex: 1 }}></View>
                                    </View>
                                    <View style={{ flex: 5.5 }}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flex: 8 }}>
                                                {RenderIf(
                                                    this.state.hamburger ==
                                                    false &&
                                                    this.state.menu_show ==
                                                    true,
                                                )(
                                                    <FlatList
                                                        ref={ref => {
                                                            this.flatListRefsss =
                                                                ref;
                                                        }}
                                                        data={this.state.menu}
                                                        //extraData={this.state.casting}

                                                        numColumns={1}
                                                        horizontal={false}
                                                        scrollType="category"
                                                        keyExtractor={(
                                                            item,
                                                            index,
                                                        ) => index.toString()}
                                                        renderItem={({
                                                            item,
                                                            index,
                                                        }) => {
                                                            return this.checkMenuItemsMobile(
                                                                item,
                                                                index,
                                                            );
                                                        }}
                                                    />,
                                                )}
                                                {RenderIf(
                                                    this.state.hamburger ==
                                                    true &&
                                                    this.state.menu_show ==
                                                    true,
                                                )(
                                                    <FlatList
                                                        ref={ref => {
                                                            this.flatListRefss =
                                                                ref;
                                                        }}
                                                        data={
                                                            this.state.basemenu
                                                        }
                                                        //extraData={this.state.casting}
                                                        horizontal={false}
                                                        numColumns={1}
                                                        scrollType="category"
                                                        keyExtractor={(
                                                            item,
                                                            index,
                                                        ) => index.toString()}
                                                        renderItem={({
                                                            item,
                                                            index,
                                                        }) => {
                                                            return this.checkBaseMenuItemsMobile(
                                                                item,
                                                                index,
                                                            );
                                                        }}
                                                    />,
                                                )}
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    alignItems: 'flex-start',
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                {RenderIf(
                                                    this.state.hamburger ==
                                                    false &&
                                                    this.state.menu_show ==
                                                    true,
                                                )(
                                                    <TouchableHighlight
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this.hideMenu()
                                                        }
                                                    >
                                                        <View
                                                            style={[
                                                                styles.Circle_45,
                                                                styles.Shadow,
                                                                {
                                                                    justifyContent:
                                                                        'center',
                                                                    alignItems:
                                                                        'center',
                                                                    backgroundColor:
                                                                        '#fff',
                                                                },
                                                            ]}
                                                        >
                                                            <FontAwesome5
                                                                style={[
                                                                    styles.IconsMenuStandard,
                                                                    {
                                                                        color: '#000',
                                                                    },
                                                                ]}
                                                                // icon={
                                                                //     SolidIcons.times
                                                                // }
                                                                name="times"
                                                            />
                                                        </View>
                                                    </TouchableHighlight>,
                                                )}

                                                {RenderIf(
                                                    this.state.hamburger ==
                                                    true &&
                                                    this.state.menu_show ==
                                                    true,
                                                )(
                                                    <TouchableHighlight
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this.hideBaseMenu()
                                                        }
                                                    >
                                                        <View
                                                            style={[
                                                                styles.Circle_45,
                                                                styles.Shadow,
                                                                {
                                                                    justifyContent:
                                                                        'center',
                                                                    alignItems:
                                                                        'center',
                                                                    backgroundColor:
                                                                        '#fff',
                                                                },
                                                            ]}
                                                        >
                                                            <FontAwesome5
                                                                style={[
                                                                    styles.IconsMenuStandard,
                                                                    {
                                                                        color: '#000',
                                                                    },
                                                                ]}
                                                                // icon={
                                                                //     SolidIcons.arrowLeft
                                                                // }
                                                                name="arrow-left"
                                                            />
                                                        </View>
                                                    </TouchableHighlight>,
                                                )}

                                                <View
                                                    style={
                                                        styles.Circle_45_White
                                                    }
                                                >
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                GLOBAL.Device_IsPhone
                                                                    ? 'row'
                                                                    : 'column',
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                position:
                                                                    'absolute',
                                                                top: 12,
                                                                left: 12,
                                                                opacity: 0.4,
                                                            }}
                                                        >
                                                            <Image
                                                                source={require('../../../../images/chromecast_black.png')}
                                                                style={{
                                                                    width: 20,
                                                                    height: 20,
                                                                }}
                                                            />
                                                        </View>
                                                        {RenderIf(
                                                            GLOBAL.Device_System ==
                                                            'Android' &&
                                                            GLOBAL.Device_FormFactor !=
                                                            'TOUCHPANEL',
                                                        )(
                                                            <CastButton
                                                                style={{
                                                                    width: 35,
                                                                    height: 35,
                                                                    tintColor:
                                                                        'green',
                                                                    fontSize: 25,
                                                                    padding: 0,
                                                                }}
                                                            />,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_System ==
                                                            'Apple',
                                                        )(
                                                            <CastButton
                                                                activeTintColor="green"
                                                                tintColor="black"
                                                                style={{
                                                                    width: 35,
                                                                    height: 35,
                                                                }}
                                                            />,
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>,
                        )}
                    </View>,
                )}
                {RenderIf(!GLOBAL.Device_IsPhone)(
                    <View
                        style={{ flex: 1, flexDirection: 'row', width: 125 }}
                        pointerEvents={'box-none'}
                    >
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <View style={{ flex: 1 }}>
                                <View style={{ flex: 1 }}></View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {RenderIf(
                                        !GLOBAL.Device_IsAppleTV &&
                                        GLOBAL.Device_Manufacturer !=
                                        'Samsung Tizen',
                                    )(
                                        <Image
                                            style={{ width: 120, height: 40 }}
                                            resizeMethod={'scale'}
                                            resizeMode={'contain'}
                                            source={{ uri: GLOBAL.Logo }}
                                        ></Image>,
                                    )}
                                    {RenderIf(
                                        GLOBAL.Device_IsAppleTV ||
                                        GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen',
                                    )(
                                        <TouchableHighlight
                                            hasTVPreferredFocus={false}
                                            style={{
                                                borderRadius: 5,
                                                backgroundColor: 'transparent',
                                                height: 90,
                                                justifyContent: 'center',
                                            }}
                                            underlayColor={GLOBAL.Button_Color}
                                            onPress={() => Actions.Home()}
                                        >
                                            <Image
                                                style={{ width: 180, height: 60 }}
                                                resizeMethod={'scale'}
                                                resizeMode={'contain'}
                                                source={{ uri: GLOBAL.Logo }}
                                            ></Image>
                                        </TouchableHighlight>,
                                    )}
                                </View>
                                <View style={{ flex: 1 }}></View>
                            </View>
                            <View style={{ flex: 5 }}>
                                <View style={{ flex: 1 }}>
                                    <View
                                        style={{
                                            flex: 4,
                                            paddingBottom: 20,
                                            width: 100,
                                            alignContent: 'center',
                                            alignItems: 'center',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        {RenderIf(
                                            this.state.hamburger == false,
                                        )(
                                            <View style={{ flex: 1 }}>
                                                <FlatList
                                                    ref={ref => {
                                                        this.flatListRefsss =
                                                            ref;
                                                    }}
                                                    data={this.state.menu}
                                                    //extraData={this.state.casting}
                                                    numColumns={1}
                                                    horizontal={false}
                                                    scrollType="category"
                                                    keyExtractor={(
                                                        item,
                                                        index,
                                                    ) => index.toString()}
                                                    renderItem={({
                                                        item,
                                                        index,
                                                    }) => {
                                                        return this.checkMenuItems(
                                                            item,
                                                            index,
                                                        );
                                                    }}
                                                />
                                            </View>,
                                        )}
                                        {RenderIf(this.state.hamburger == true)(
                                            <View style={{ flex: 1 }}>
                                                <FlatList
                                                    ref={ref => {
                                                        this.flatListRefss =
                                                            ref;
                                                    }}
                                                    data={this.state.basemenu}
                                                    //extraData={this.state.casting}
                                                    horizontal={false}
                                                    numColumns={1}
                                                    scrollType="category"
                                                    keyExtractor={(
                                                        item,
                                                        index,
                                                    ) => index.toString()}
                                                    renderItem={({
                                                        item,
                                                        index,
                                                    }) => {
                                                        return this.checkBaseMenuItems(
                                                            item,
                                                            index,
                                                        );
                                                    }}
                                                />
                                                <TouchableHighlightFocus
                                                    style={{
                                                        borderRadius: 5,
                                                        height: GLOBAL.Device_IsAppleTV
                                                            ? 105
                                                            : 70,
                                                    }}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this._hideHamburgerMenu()
                                                    }
                                                >
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                GLOBAL.Device_IsPhone
                                                                    ? 'row'
                                                                    : 'column',
                                                        }}
                                                    >
                                                        <View
                                                            style={[
                                                                styles.CenterImage,
                                                                { margin: 2 },
                                                            ]}
                                                        >
                                                            <FontAwesome5
                                                                style={
                                                                    styles.IconsMenuStandard
                                                                }
                                                                // icon={
                                                                //     SolidIcons.arrowLeft
                                                                // }
                                                                name="arrow-left"
                                                            />
                                                        </View>
                                                        <View
                                                            style={{
                                                                alignSelf:
                                                                    'center',
                                                            }}
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.Menu
                                                                }
                                                            >
                                                                {LANG.getTranslation(
                                                                    'back',
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlightFocus>
                                            </View>,
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>,
                )}
                {RenderIf(this.state.popup_loader_)(
                    <Modal
                        Type={'Loader'}
                        Title={LANG.getTranslation('downloading_installing')}
                        Centered={true}
                        Progress={this.state.progress}
                        ShowLoader={true}
                    ></Modal>,
                )}
            </View>
        );
    }
    _setFocusOnFirst(item, index) {
        if (
            GLOBAL.Device_IsTV == true &&
            GLOBAL.Focus == 'Home' &&
            item.is_default == true
        ) {
            return index === index;
        }
    }
    _setFocusOnFocussedItem(item) {
        return GLOBAL.Focus == item.name ? 'transparent' : 'transparent';
    }
}
