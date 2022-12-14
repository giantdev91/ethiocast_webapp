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
import UserAvatar from 'react-native-user-avatar';
import { Badge } from 'react-native-elements';
// import {RegularIcons, SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

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
            local_focus: false,
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
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (keyEvent.keyCode == 90 || keyEvent.keyCode == 89) {
                    if (this.state.hamburger == true) {
                        this.setState({
                            hamburger: false,
                        });
                    }
                }
                if (keyEvent.keyCode == 22) {
                    if (this.state.local_focus == true) {
                        this.setState({
                            local_focus: false,
                        });
                    }
                }
                return true;
            });
        }
    }
    componentWillUnmount() {
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
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
    // checkMenuItemsMobile(item, index) {
    //     if (GLOBAL.Device_IsAppleTV && item.name == "Youtube") {
    //         return null;
    //     }
    //     if (GLOBAL.Device_IsWebTV && item.name == "Youtube") {
    //         return null;
    //     }
    //     if (GLOBAL.Device_IsAndroidTV && item.name == "Youtube") {
    //         return null;
    //     }
    //     if (GLOBAL.Device_IsFireTV && item.name == "Youtube") {
    //         return null;
    //     }
    //     if (GLOBAL.Device_System == "Apple" && item.name == "Youtube") {
    //         return null;
    //     }
    //     if (item.name == "Youtube") {
    //         return null;
    //     }
    //     if (GLOBAL.Device_IsSmartTV && item.name == "CatchupTV") {
    //         return null;
    //     }
    //     if (item.name == "Recordings" && GLOBAL.Kids_Mode != 'no kids mode') {
    //         return null;
    //     }
    //     if (item.name == 'Hamburger' && item.is_app == false) {
    //         return (
    //             <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressShowBaseMenu(item)}>

    //                 <View >
    //                     <View style={styles.CenterImage}>
    //                         <FontAwesome5 style={styles.IconsMenu} icon={SolidIcons.user} />
    //                     </View>

    //                     <View style={styles.CenterText}>
    //                         <Text style={styles.MenuIcons}>{LANG.getTranslation('personal')}</Text>
    //                     </View>

    //                 </View>
    //             </TouchableHighlightFocus>
    //         )
    //     }
    //     if (item.name != 'Apps' && item.name != 'CatchupTV' && item.name != 'Casting' && item.is_app == false) {
    //         return (
    //             <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{}}>
    //                     <View style={styles.CenterImage}>
    //                         {this.getMenuIcon(item.name)}
    //                     </View>

    //                     <View style={styles.CenterText}>
    //                         <Text style={styles.MenuIcons}>{LANG.getTranslation(String(item.name))}</Text>
    //                     </View>

    //                 </View>
    //             </TouchableHighlightFocus>
    //         )
    //     }

    //     if (item.name == 'Profile') {
    //         if (GLOBAL.Device_IsPhone == true || GLOBAL.Device_IsTablet == true && GLOBAL.Selected_Profile.name != '') {
    //             return (
    //                 <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                     <View style={{ flex: 1, marginLeft: 5, marginRight: 5 }}>
    //                         <View style={styles.menu_vertical_icon}>
    //                             <View style={styles.CenterImage}>
    //                                 <UserAvatar size="45" name={GLOBAL.Selected_Profile.name.split(' ').slice(0, 2).join('+')} />
    //                             </View>
    //                         </View>
    //                     </View>
    //                 </TouchableHighlightFocus>
    //             )
    //         }
    //     }
    //     if (item.name == 'Search' && GLOBAL.UserInterface.general.enable_search_menu == true) {
    //         if (GLOBAL.Device_IsPhone == true || GLOBAL.Device_IsTablet == true) {
    //             return (
    //                 <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                     <View style={{ flex: 1 }}>
    //                         <View style={styles.CenterImage}>
    //                             <FontAwesome5 style={styles.IconsMenu} icon={SolidIcons.search} />
    //                         </View>

    //                         <View style={styles.CenterText}>
    //                             <Text style={styles.MenuIcons}>Search</Text>
    //                         </View>

    //                     </View>
    //                 </TouchableHighlightFocus>
    //             )
    //         }
    //     }
    //     if (item.name == 'Messages') {
    //         var nonDeleted = GLOBAL.Messages.filter(m => m.deleted == false);
    //         if (nonDeleted) {
    //             var readMessages = nonDeleted.filter(m => m.read == false);
    //             if (readMessages) {
    //                 GLOBAL.Messages_QTY = readMessages.length;
    //             }
    //         }
    //         if (GLOBAL.Device_IsPhone == true || GLOBAL.Device_IsTablet == true) {
    //             return (
    //                 <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                     <View style={{ flex: 1 }}>
    //                         <View style={styles.CenterImage}>
    //                             {RenderIf(GLOBAL.Messages_QTY > 0)(
    //                                 <Badge value={GLOBAL.Messages_QTY} status="error" badgeStyle={{ borderColor: 'red' }} containerStyle={{ position: 'absolute', zIndex: 99999, top: -4, right: -4 }} />
    //                             )}
    //                             <FontAwesome5 style={styles.IconsMenu} icon={RegularIcons.envelope} />
    //                         </View>

    //                         <View style={styles.CenterText}>
    //                             <Text style={styles.MenuIcons}>Messages</Text>
    //                         </View>

    //                     </View>
    //                 </TouchableHighlightFocus>
    //             )
    //         }
    //     }
    //     if (item.name == 'Setting') {

    //         if (GLOBAL.Device_IsPhone == true || GLOBAL.Device_IsTablet == true) {
    //             return (
    //                 <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                     <View style={{ flex: 1 }}>
    //                         <View style={styles.CenterImage}>
    //                             {RenderIf(GLOBAL.OTA_Update == true)(
    //                                 <Badge value="!" status="error" badgeStyle={{ borderColor: 'red' }} containerStyle={{ position: 'absolute', zIndex: 99999, top: -4, right: -4 }} />
    //                             )}
    //                             <FontAwesome5 style={styles.IconsMenu} icon={SolidIcons.slidersHh} />
    //                         </View>

    //                         <View style={styles.CenterText}>
    //                             <Text style={styles.MenuIcons}>Settings</Text>
    //                         </View>

    //                     </View>
    //                 </TouchableHighlightFocus>
    //             )
    //         }
    //     }
    //     if (Platform.OS === 'android' && item.name == 'Apps') {
    //         return (
    //             <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, }}>
    //                     <View style={styles.CenterImage}>
    //                         {this.getMenuIcon(item.name)}
    //                     </View>
    //                     <View style={styles.CenterText}>
    //                         <Text style={styles.MenuIcons}>{LANG.getTranslation(String(item.name))}</Text>
    //                     </View>
    //                 </View>
    //             </TouchableHighlightFocus>
    //         )
    //     }
    //     if (Platform.OS === 'android' && item.is_app == true) {
    //         return (
    //             <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, }}>
    //                     <View style={styles.CenterImage}>
    //                         {this.getMenuIcon('Apps')}
    //                     </View>
    //                     <View style={styles.CenterText}>
    //                         <Text style={styles.MenuIcons}>{item.name}</Text>
    //                     </View>

    //                 </View>
    //             </TouchableHighlightFocus>
    //         )
    //     }
    //     if (item.name == 'CatchupTV' && item.is_app == false && GLOBAL.UserInterface.general.enable_catchuptv == true) {
    //         return (
    //             <TouchableHighlightFocus key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, }}>
    //                     <View style={styles.CenterImage}>
    //                         <FontAwesome5 style={styles.IconsMenu} icon={SolidIcons.history} />
    //                     </View>

    //                     <View style={styles.CenterText}>
    //                         <Text style={styles.MenuIcons}>{item.name}</Text>
    //                     </View>

    //                 </View>
    //             </TouchableHighlightFocus>
    //         )
    //     }
    // }
    // checkBaseMenuItemsMobile(item, index) {

    //     if (item.name == 'My List' && item.is_app == false && GLOBAL.UserInterface.general.enable_watchlist_menu == true) {
    //         return (
    //             <TouchableHighlight key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'flex-start', margin: 10 }}>
    //                     <View style={[{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }]}>
    //                         <FontAwesome5 style={styles.IconsMenu} icon={RegularIcons.playCircle} />
    //                         <Text style={styles.Menu}>Watchlist</Text>
    //                     </View>
    //                 </View>
    //             </TouchableHighlight>
    //         )
    //     }
    //     if (item.name == 'My Favorites' && item.is_app == false && GLOBAL.UserInterface.general.enable_favourites_menu == true) {
    //         return (
    //             <TouchableHighlight key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'flex-start', margin: 10 }}>
    //                     <View style={[{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }]}>
    //                         <FontAwesome5 style={styles.IconsMenu} icon={RegularIcons.heart} />
    //                         <Text style={styles.Menu}>{LANG.getTranslation(String('Favorites'))}</Text>
    //                     </View>
    //                 </View>
    //             </TouchableHighlight>
    //         )
    //     }
    //     if (item.name == 'Downloads' && item.is_app == false && GLOBAL.UserInterface.general.enable_download_menu == true) {
    //         return (
    //             <TouchableHighlight key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'flex-start', margin: 10 }}>
    //                     <View style={[{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }]}>
    //                         <FontAwesome5 style={styles.IconsMenu} icon={SolidIcons.download} />
    //                         <Text style={styles.Menu}>{LANG.getTranslation(String(item.name))}</Text>
    //                     </View>
    //                 </View>
    //             </TouchableHighlight>
    //         )
    //     }

    //     if (item.name == 'Messages' && item.is_app == false && GLOBAL.UserInterface.general.enable_messages_menu == true) {
    //         var nonDeleted = GLOBAL.Messages.filter(m => m.deleted == false);
    //         if (nonDeleted) {
    //             var readMessages = nonDeleted.filter(m => m.read == false);
    //             if (readMessages) {
    //                 GLOBAL.Messages_QTY = readMessages.length;
    //             }
    //         }
    //         return (
    //             <TouchableHighlight key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'flex-start', margin: 10 }}>
    //                     <View style={[{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }]}>
    //                         {RenderIf(GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsAndroidTV)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value={GLOBAL.Messages_QTY} status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsFireTV)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value={GLOBAL.Messages_QTY} status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsSTB)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value={GLOBAL.Messages_QTY} status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 25 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsTablet)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value={GLOBAL.Messages_QTY} status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsPhone)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value={GLOBAL.Messages_QTY} status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsWebTV)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value={GLOBAL.Messages_QTY} status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.Messages_QTY > 0 && GLOBAL.Device_IsAppleTV)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value={GLOBAL.Messages_QTY} status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         <FontAwesome5 style={styles.IconsMenu} icon={RegularIcons.envelope} />
    //                         <Text style={styles.Menu}>{LANG.getTranslation(String('messagecenter'))}</Text>
    //                     </View>
    //                 </View>
    //             </TouchableHighlight>
    //         )
    //     }
    //     if (item.name == 'Settings' && item.is_app == false && GLOBAL.UserInterface.general.enable_settings_menu == true) {
    //         return (
    //             <TouchableHighlight key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'flex-start', margin: 10 }}>
    //                     <View style={[{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }]}>
    //                         {RenderIf(GLOBAL.OTA_Update == true && GLOBAL.Device_IsAndroidTV)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value="!" status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.OTA_Update == true && GLOBAL.Device_IsFireTV)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value="!" status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.OTA_Update == true && GLOBAL.Device_IsSTB)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value="!" status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 25 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.OTA_Update == true && GLOBAL.Device_IsTablet)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value="!" status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         {RenderIf(GLOBAL.OTA_Update == true && GLOBAL.Device_IsPhone)(
    //                             <Badge badgeStyle={{ borderColor: 'red' }} value="!" status="error" containerStyle={{ position: 'absolute', zIndex: 99999, top: -2, left: 20 }} />
    //                         )}
    //                         <FontAwesome5 style={styles.IconsMenu} icon={SolidIcons.slidersHh} />
    //                         <Text style={styles.Menu}>{LANG.getTranslation(String(item.name))}</Text>
    //                     </View>
    //                 </View>
    //             </TouchableHighlight>
    //         )
    //     }
    //     if (item.name == 'Search' && item.is_app == false && GLOBAL.UserInterface.general.enable_search_menu == true) {
    //         return (
    //             <TouchableHighlight key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'flex-start', margin: 10 }}>
    //                     <View style={[{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }]}>
    //                         <FontAwesome5 style={styles.IconsMenu} icon={SolidIcons.search} />
    //                         <Text style={styles.Menu}>{LANG.getTranslation(String(item.name))}</Text>
    //                     </View>
    //                 </View>
    //             </TouchableHighlight>
    //         )
    //     }
    //     if (item.name == 'Profile' && item.is_app == false && GLOBAL.Selected_Profile.name != '' && GLOBAL.UserInterface.general.enable_profiles == true) {
    //         return (
    //             <TouchableHighlight key={index} hasTVPreferredFocus={this._setFocusOnFirst(item, index)} ref={item.name} underlayColor={GLOBAL.Button_Color} onPress={() => this._onPressButtonMenu(item)}>
    //                 <View style={{ flex: 1, padding: 10, backgroundColor: '#222', justifyContent: 'flex-start', alignContent: 'flex-start', alignItems: 'flex-start' }}>
    //                     <View style={[{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }]}>
    //                         <UserAvatar size={40} name={GLOBAL.Selected_Profile.name.split(' ').slice(0, 2).join('+')} />
    //                         <Text style={styles.Menu}>{GLOBAL.Selected_Profile.name}</Text>
    //                     </View>
    //                 </View>
    //             </TouchableHighlight>
    //         )
    //     }
    // }
    checkBaseMenuItems(item, index) {
        if (
            item.name == 'My List' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_watchlist_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignContent: 'flex-start',
                            alignItems: 'flex-start',
                            margin: 10,
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenu}
                                // icon={RegularIcons.playCircle}
                                name="play-circle"
                            />
                            <Text style={styles.Menu}>
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
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignContent: 'flex-start',
                            alignItems: 'flex-start',
                            margin: 10,
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                },
                            ]}
                        >
                            <FontAwesome
                                style={styles.IconsMenu}
                                // icon={RegularIcons.heart}
                                name="heart-o"
                            />
                            <Text style={styles.Menu}>
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
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignContent: 'flex-start',
                            alignItems: 'flex-start',
                            margin: 10,
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenu}
                                // icon={SolidIcons.moneyBill}
                                name="money-bill"
                            />
                            <Text style={styles.Menu}>
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
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignContent: 'flex-start',
                            alignItems: 'flex-start',
                            margin: 10,
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenu}
                                // icon={SolidIcons.download}
                                name="download"
                            />
                            <Text style={styles.Menu}>
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
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignContent: 'flex-start',
                            alignItems: 'flex-start',
                            margin: 10,
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
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
                                style={styles.IconsMenu}
                                // icon={RegularIcons.envelope}
                                name="envelope"
                            />
                            <Text style={styles.Menu}>
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
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignContent: 'flex-start',
                            alignItems: 'flex-start',
                            margin: 10,
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
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
                                style={styles.IconsMenu}
                                // icon={SolidIcons.slidersHh}
                                name="sliders-h"
                            />
                            <Text style={styles.Menu}>
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
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-start',
                            alignContent: 'flex-start',
                            alignItems: 'flex-start',
                            margin: 10,
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                },
                            ]}
                        >
                            <FontAwesome5
                                style={styles.IconsMenu}
                                // icon={SolidIcons.search}
                                name="search"
                            />
                            <Text style={styles.Menu}>
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
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            padding: 10,
                            backgroundColor: '#222',
                            justifyContent: 'flex-start',
                            alignContent: 'flex-start',
                            alignItems: 'flex-start',
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
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
                            <Text style={styles.Menu}>
                                {GLOBAL.Selected_Profile.name}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
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
    checkBottomMenu(item, index) {
        if (item.name == 'Logout') {
            return (
                <TouchableHighlightFocus
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
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
                            {this.getMenuIcon(item.name)}
                        </View>
                        {RenderIf(
                            this.props.focuseds == true ||
                            this.state.local_focus == true,
                        )(
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={styles.Menu}>
                                    {LANG.getTranslation(String(item.name))}
                                </Text>
                            </View>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (item.name == 'Hamburger') {
            return (
                <TouchableHighlightFocus
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressShowBaseMenu(item)}
                >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
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
                                style={styles.IconsMenu}
                                // icon={SolidIcons.user}
                                name="user"
                            />
                        </View>
                        {RenderIf(
                            this.props.focuseds == true ||
                            this.state.local_focus == true,
                        )(
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={styles.Menu}>
                                    {LANG.getTranslation('personal')}
                                </Text>
                            </View>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
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
        if (Platform.OS == 'android' && item.name == 'Apps') {
            return (
                <TouchableHighlightFocus
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={false}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View
                            style={[
                                styles.CenterImage,
                                {
                                    margin: 3,
                                    borderBottomColor:
                                        GLOBAL.Focus == item.name
                                            ? 'red'
                                            : 'transparent',
                                    borderBottomWidth: 3,
                                },
                            ]}
                        >
                            {this.getMenuIcon(item.name)}
                        </View>
                        {RenderIf(
                            this.props.focuseds == true ||
                            this.state.local_focus == true,
                        )(
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={styles.Menu}>
                                    {LANG.getTranslation(String(item.name))}
                                </Text>
                            </View>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
        }
        // if (item.name == 'Casting' && GLOBAL.Device_System != "Apple" && (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) && GLOBAL.UserInterface.player.enable_casting == true) {
        //     if (GLOBAL.Device_IsPhone == true || GLOBAL.Device_IsTablet == true) {
        //         return (
        //             <View style={{ flex: 1, paddingLeft: 5 }}>
        //                 <View style={styles.menu_vertical_icon}>
        //                     <View style={styles.Circle_45}>
        //                         <View style={{ position: 'absolute', top: 12, left: 12, opacity: 0.3 }}>
        //                             <Image source={require('../../../../images/chromecast.png')} style={{ width: 20, height: 20, }} />
        //                         </View>
        // {RenderIf(GLOBAL.Device_System == "Android")(
        //     <CastButton style={{ width: 35, height: 35, tintColor: 'white', fontSize: 25, padding: 0 }} />
        // )}
        // {RenderIf(GLOBAL.Device_System == "Apple")(
        //     <CastButton activeTintColor="green" tintColor="white" style={{ width: 35, height: 35 }}
        //     />
        // )}
        //                     </View>
        //                 </View>
        //             </View>
        //         )
        //     }
        // }

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
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
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
                            {this.getMenuIcon(item.name)}
                        </View>
                        {RenderIf(
                            this.props.focuseds == true ||
                            this.state.local_focus == true,
                        )(
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={styles.Menu}>
                                    {LANG.getTranslation(String(item.name))}
                                </Text>
                            </View>,
                        )}
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
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
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
                                style={styles.IconsMenu}
                                // icon={SolidIcons.history}
                                name="history"
                            />
                        </View>
                        {RenderIf(
                            this.props.focuseds == true ||
                            this.state.local_focus == true,
                        )(
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={styles.Menu}>{item.name}</Text>
                            </View>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (Platform.OS == 'android' && item.is_app == true) {
            return (
                <TouchableHighlightFocus
                    onFocus={() => this.focusMenu()}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    ref={item.name}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
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
                            {this.getMenuIcon(item.name)}
                        </View>
                        {RenderIf(
                            this.props.focuseds == true ||
                            this.state.local_focus == true,
                        )(
                            <View style={{ alignSelf: 'center' }}>
                                <Text style={styles.Menu}>{item.name}</Text>
                            </View>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }
    getMenuIcon(menu) {
        switch (LANG.getTranslation(menu)) {
            case LANG.getTranslation('Search'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.search}
                        name="search"
                    />
                );
                break;
            case LANG.getTranslation('Home'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.home}
                        name="home"
                    />
                );
                break;
            case LANG.getTranslation('Channels'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.th}
                        name="th"
                    />
                );
                break;
            case LANG.getTranslation('Television'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.tv}
                        name="tv"
                    />
                );
                break;
            case LANG.getTranslation('TV Guide'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.thList}
                        name="th-list"
                    />
                );
                break;
            case LANG.getTranslation('Recordings'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={RegularIcons.dotCircle}
                        name="dot-circle"
                    />
                );
                break;
            case LANG.getTranslation('Movies'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.film}
                        name="film"
                    />
                );
                break;
            case LANG.getTranslation('Series'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.video}
                        name="video"
                    />
                );
                break;
            case LANG.getTranslation('Music'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.music}
                        name="music"
                    />
                );
                break;
            case LANG.getTranslation('Apps'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={BrandIcons.android}
                        name="android"
                    />
                );
                break;
            case LANG.getTranslation('Setting'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.slidersH}
                        name="sliders-h"
                    />
                );
                break;

            case LANG.getTranslation('Youtube'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={BrandIcons.youtube}
                        name="youtube"
                    />
                );
                break;
            case LANG.getTranslation('Logout'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.lock}
                        name="lock"
                    />
                );
                break;
            case LANG.getTranslation('Hamburger'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={RegularIcons.user}
                        name="user"
                    />
                );
                break;
            case LANG.getTranslation('My List'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={RegularIcons.playCircle}
                        name="play-circle"
                    />
                );
                break;
            case LANG.getTranslation('Downloads'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
                        // icon={SolidIcons.download}
                        name="download"
                    />
                );
                break;
            case LANG.getTranslation('CatchupTV'):
                return (
                    <FontAwesome5
                        style={styles.IconsMenu}
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

    blurMenu() {
        // TimerMixin.clearTimeout(this.focusMenu);
        // this.focusMenu = TimerMixin.setTimeout(() => {
        //     this.setState({
        //         menu_focused: false
        //     })
        // }, 500);
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {RenderIf(GLOBAL.Device_IsPhone)(
                    <View style={[styles.Footer]}>
                        {RenderIf(this.state.hamburger)(
                            <View
                                style={{
                                    position: 'absolute',
                                    zIndex: 99999,
                                    backgroundColor: '#000',
                                    bottom: 70,
                                    left:
                                        GLOBAL.Device_IsWebTV &&
                                            !GLOBAL.Device_IsSmartTV
                                            ? 50
                                            : 5,
                                    borderLeftColor: GLOBAL.Button_Color,
                                    borderLeftWidth: 3,
                                }}
                            >
                                <FlatList
                                    ref={ref => {
                                        this.flatListRefs = ref;
                                    }}
                                    data={this.state.basemenu}
                                    horizontal={false}
                                    scrollType="category"
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({ item, index }) => {
                                        return this.checkBaseMenuItemsMobile(
                                            item,
                                            index,
                                        );
                                    }}
                                />
                            </View>,
                        )}
                        <FlatList
                            ref={ref => {
                                this.flatListRef = ref;
                            }}
                            data={this.state.menu}
                            horizontal={true}
                            scrollType="category"
                            extraData={this.state.casting}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => {
                                return this.checkMenuItemsMobile(item, index);
                            }}
                        />
                    </View>,
                )}
                {RenderIf(!GLOBAL.Device_IsPhone)(
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            width: this.state.local_focus == false ? 55 : 250,
                            backgroundColor: 'black',
                        }}
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
                                    {RenderIf(this.state.local_focus == true)(
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
                            <View style={{ flex: 3.5 }}>
                                {RenderIf(this.state.hamburger == true)(
                                    <FlatList
                                        ref={ref => {
                                            this.flatListRefsss = ref;
                                        }}
                                        data={this.state.menu}
                                        //extraData={this.state.casting}
                                        numColumns={1}
                                        horizontal={false}
                                        scrollType="category"
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        renderItem={({ item, index }) => {
                                            return this.checkMenuItems(
                                                item,
                                                index,
                                            );
                                        }}
                                    />,
                                )}
                                {RenderIf(this.state.hamburger == false)(
                                    <FlatList
                                        ref={ref => {
                                            this.flatListRefss = ref;
                                        }}
                                        data={this.state.basemenu}
                                        //extraData={this.state.casting}
                                        horizontal={false}
                                        scrollType="category"
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        renderItem={({ item, index }) => {
                                            return this.checkBaseMenuItems(
                                                item,
                                                index,
                                            );
                                        }}
                                    />,
                                )}
                                <View style={{ alignItems: 'center' }}>
                                    <FontAwesome5
                                        style={[
                                            styles.IconsMenu,
                                            { color: '#333', paddingVertical: 5 },
                                        ]}
                                        // icon={SolidIcons.chevronDown}
                                        name="chevron-down"
                                    />
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 2,
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    alignContent: 'flex-end',
                                    alignItems: 'flex-end',
                                    alignSelf: 'flex-end',
                                }}
                            >
                                <FlatList
                                    ref={ref => {
                                        this.flatListRefsss = ref;
                                    }}
                                    data={this.state.menu}
                                    //extraData={this.state.casting}
                                    numColumns={1}
                                    horizontal={false}
                                    scrollType="category"
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({ item, index }) => {
                                        return this.checkBottomMenu(
                                            item,
                                            index,
                                        );
                                    }}
                                />
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
            return true;
        } else {
            return false;
        }
    }
}
