import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    Platform,
    AppState,
    BackHandler,
    TVMenuControl,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import UserAvatar from 'react-native-user-avatar';
import { Badge } from 'react-native-elements';
import Video from 'react-native-video/dom/Video';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Menu extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            channel: [],
            menu: GLOBAL.Menu,
            basemenu: GLOBAL.MenuBase,
            popup_loader_: false,
            progress: 0,
            downloaded_: 0,
            size_: 0,
            videoUrl: '',
            videoType: 'mp4',
            drmKey: '',
            paused: false,
            channelSelected: [],
            programName: '',
            percentageProgram: '',
            start: '',
            end: '',
            menuRowWidth: GLOBAL.Menu_Width,
            hamburger: false,
            drmKey: '',
            drmSupplierType: '',
            drmLicenseServerUrl: '',
            drmCertificateUrl: '',
        };
    }
    _handleAppStateChange = nextAppState => {
        if (nextAppState == 'background') {
            this.setState({
                videoUrl: 'http://test.com',
            });
        }
    };
    componentDidMount() {
        if (GLOBAL.Device_IsSTB) {
            AppState.addEventListener('change', this._handleAppStateChange);
        }
        try {
            if (
                GLOBAL.Channels_Selected == undefined ||
                GLOBAL.Channels_Selected.length == 0
            ) {
                GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
                GLOBAL.Channels_Selected_Category_ID = GLOBAL.Channels[0].id;
                GLOBAL.Channels_Selected_Category_Index =
                    UTILS.getCategoryIndex(
                        GLOBAL.Channels_Selected_Category_ID,
                    );
            }
            if (
                GLOBAL.Channels_Selected[GLOBAL.Channels_Selected_Index] ==
                undefined
            ) {
                GLOBAL.Channels_Selected_Index = 0;
            }
            if (
                GLOBAL.Channels_Selected != null &&
                GLOBAL.Channels_Selected != undefined &&
                GLOBAL.Channels_Selected.length > 0
            ) {
                var channel_id =
                    GLOBAL.Channels_Selected[GLOBAL.Channels_Selected_Index]
                        .channel_id;
                var channel = UTILS.getChannel(channel_id);
                if (channel != undefined && channel != null) {
                    this.setState({
                        channel: channel,
                    });
                    var url = '';
                    if (GLOBAL.Device_IsSmartTV) {
                        url = channel.tizen_webos;
                    } else if (
                        GLOBAL.Device_Manufacturer == 'Apple' ||
                        GLOBAL.Device_IsPwaIOS
                    ) {
                        url = channel.ios_tvos;
                    } else {
                        url = channel.url_high;
                    }
                    this.startMiniTV(url, channel);
                }
            }
        } catch (e) { }
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
                return true;
            });
        }
    }
    componentWillUnmount() {
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsSTB) {
            AppState.removeEventListener('change', this._handleAppStateChange);
        }
    }
    _startTelevision(channel) {
        if (channel != undefined && channel != null) {
            (GLOBAL.Channel = UTILS.getChannel(channel.channel_id)),
                Actions.Player({ fromPage: 'Home' });
        }
    }
    startMiniTV(url, channel) {
        if (channel.childlock == 1) {
            return;
        }
        url = url.toString().replace(' ', '');
        var type = 'video/mp4';
        if (url.indexOf('.mpd') > 0) {
            type = 'mpd';
        }
        if (url.indexOf('.m3u8') > 0) {
            type = 'm3u8';
        }
        if (url.indexOf('npplayout_') > -1) {
            //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
            var queryString = '';
            queryString += '&ads.did=' + GLOBAL.Device_UniqueID;
            queryString += '&ads.app_name=' + GLOBAL.IMS;
            queryString += '&ads.app_bundle=' + GLOBAL.Package;
            //   queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
            queryString += '&ads.channel_name=' + encodeURI(channel.name);
            queryString += '&ads.us_privacy=1---';
            queryString += '&ads.schain=1';
            queryString += '&ads.w=1980';
            queryString += '&ads.h=1080';
            url += queryString;
        }
        var drmKey = '';
        if (channel.secure_stream == true && channel.drm_stream == false) {
            url = TOKEN.getAkamaiTokenLegacy(url);
        } else if (channel.drm_stream == true) {
            if (channel.drm.drm_type == 'buydrm') {
                (async () => {
                    let drm = await TOKEN.getDrmWidevineFairplayBuyDRM(
                        url,
                        channel,
                    );
                    if (drm != undefined) {
                        url = drm.url;
                        drmKey = drm.drmKey;
                        drmSupplierType = 'buydrm';
                        streamType = TOKEN.getStreamType(drm.url);
                        drmLicenseServerUrl = drm.licenseServer;
                        drmCertificateUrl = drm.certificateUrl;
                        this.setState({
                            videoUrl: url,
                            videoType: type,
                            channelSelected: channel,
                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,
                        });
                    }
                })();
            } else if (channel.drm.drm_type == 'irdeto') {
                (async () => {
                    let drm = await TOKEN.getDrmWidevineFairplayIrdeto(
                        GLOBAL.DRM_KeyServerURL,
                        channel,
                    );
                    if (drm != undefined) {
                        url = drm.url;
                        drmSupplierType = 'irdeto';
                        streamType = TOKEN.getStreamType(drm.url);
                        drmLicenseServerUrl = drm.drmServerUrl;
                        drmCertificateUrl = drm.certificateUrl;
                        this.setState({
                            videoUrl: url,
                            videoType: type,
                            channelSelected: channel,
                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,
                        });
                    }
                })();
            }
        } else if (channel.akamai_token == true) {
            url = TOKEN.getAkamaiToken(url);
        } else if (channel.flussonic_token == true) {
            url = TOKEN.getFlussonicToken(url);
        }
        if (channel.drm_stream == false) {
            this.setState({
                videoUrl: url,
                videoType: type,
                channelSelected: channel,
            });
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

            GLOBAL.Store_Selected_Index = 0;
            GLOBAL.Store_Sub_Selected_Index = 0;

            GLOBAL.Store_Selected_Index = 0;

            GLOBAL.Movie_Selected = null;
            GLOBAL.Movie_Selected_Index = 0;
            GLOBAL.Movie_Selected_Category_ID = 0;
            GLOBAL.Movie_Selected_Row = 0;

            (GLOBAL.Tag_Selected_Index = 0),
                (GLOBAL.Tag_Selected_Row = 0),
                (GLOBAL.Season_Selected_Season = null);
            GLOBAL.Season_Selected_Season_ID = 0;
            GLOBAL.Season_Selected_Episode_Index = 0;
            GLOBAL.Series_Selected_Index = 0;
            GLOBAL.Season_Selected_Index = 0;
            GLOBAL.Season_Selected_Episode_Row = 0;
            GLOBAL.Series_Selected = null;

            GLOBAL.Focus = item.name;
            switch (item.name) {
                case 'Search':
                    GLOBAL.Focus = 'Search';
                    Actions.SearchBox();
                    break;
                case 'Home':
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                    break;
                case 'Channels':
                    GLOBAL.Focus = 'Channels';
                    Actions.Channels({ fromPage: 'menu' });
                    break;
                case 'Television':
                    GLOBAL.Focus = 'Television';
                    try {
                        if (GLOBAL.Channels_Selected != null) {
                            if (GLOBAL.Channels_Selected.length > 0) {
                                GLOBAL.Channel = UTILS.getChannel(
                                    GLOBAL.Channels_Selected[0].channel_id,
                                );
                                Actions.Player({ fromPage: 'Home' });
                            }
                        }
                    } catch (e) { }
                    break;
                case 'TV Guide':
                    GLOBAL.Focus = 'TV Guide';
                    Actions.EPG();
                    break;
                case 'Education':
                    Actions.Education_Stores({ fromPage: 'menu' });
                    break;
                case 'Recordings':
                    GLOBAL.Focus = 'Recordings';
                    Actions.Recordings();
                    break;
                case 'Movies':
                    GLOBAL.Focus = 'Movies';
                    Actions.Movies_Stores({ fromPage: 'menu' });
                    break;
                case 'Series':
                    GLOBAL.Focus = 'Series';
                    Actions.Series_Stores({ fromPage: 'menu' });
                    break;
                case 'Music':
                    GLOBAL.Focus = 'Music';
                    Actions.Music_Albums({ fromPage: 'menu' });
                    break;
                case 'Apps':
                    GLOBAL.Focus = 'Apps';
                    Actions.MarketPlace();
                    break;
                case 'Setting':
                    GLOBAL.Focus = 'Settings';
                    Actions.Settings();
                    break;
                case 'Settings':
                    GLOBAL.Focus = 'Settings';
                    Actions.Settings();
                    break;
                case 'Youtube':
                    GLOBAL.Focus = 'Youtube';
                    Actions.Youtube();
                    break;
                case 'Profile':
                    Actions.Profiles();
                    break;
                case 'My List':
                    GLOBAL.Focus = 'My List';
                    Actions.MyList();
                    break;
                case 'My Favorites':
                    GLOBAL.Focus = 'My Favorites';
                    Actions.MyFavorites();
                    break;
                case 'My Content':
                    Actions.MyContent();
                    break;
                case 'Downloads':
                    GLOBAL.Focus = 'Downloads';
                    Actions.Downloads();
                    break;
                case 'Messages':
                    Actions.Messages({ fromPage: true });
                    break;
                case 'CatchupTV':
                    GLOBAL.Focus = 'CatchupTV';
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
                                            'LG WebOS' ||
                                            GLOBAL.Device_Manufacturer ==
                                            'Samsung Tizen'
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
                            }
                        })
                        .catch(error => {
                            GLOBAL.Focus = 'Logout';
                            GLOBAL.AutoLogin = false;
                            if (
                                GLOBAL.Device_Manufacturer == 'LG WebOS' ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
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
                    break;
            }
        }
    }
    checkBaseMenuItemsMobile(item, index) {
        if (
            item.name == 'My List' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_watchlist_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    style={{ height: '100%' }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
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
                    BorderRadius={5}
                    style={{ height: '100%' }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
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
            item.name == 'Downloads' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_download_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    style={{ height: '100%' }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
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
                    BorderRadius={5}
                    style={{ height: '100%' }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
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
                    BorderRadius={5}
                    style={{ height: '100%' }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
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
                            {GLOBAL.OTA_Update && Platform.OS == 'android' && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 15,
                                        zIndex: 99999,
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor: 'red',
                                            borderRadius: 100,
                                            height: 20,
                                            width: 20,
                                            alignSelf: 'center',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text
                                            style={[styles.Medium, styles.Bold]}
                                        >
                                            !
                                        </Text>
                                    </View>
                                </View>
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
                    BorderRadius={5}
                    style={{ height: '100%' }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
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
                    BorderRadius={5}
                    style={{ height: '100%' }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={[
                                {
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    paddingLeft: 10,
                                },
                            ]}
                        >
                            <UserAvatar
                                size={30}
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

        if (
            item.name == 'Recordings' &&
            GLOBAL.UserInterface.general.enable_recordings == false
        ) {
            return null;
        }

        if (!GLOBAL.Device_IsPhone) {
            if (item.name == 'Hamburger') {
                return null;
            }

            if (Platform.OS === 'android' && item.name == 'Apps') {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        style={styles.menu_horizontal_row}
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                backgroundColor: 'rgba(0, 0, 0, 0.40)',
                                borderRadius: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    borderTopLeftRadius: 5,
                                    borderBottomLeftRadius: 5,
                                    paddingHorizontal: 5,
                                    backgroundColor: 'rgba(0, 0, 0, 0.40)',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View style={styles.menu_horizontal_icon}>
                                    {this.getMenuIcon(item.name)}
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 3,
                                    flexDirection: 'column',
                                    backgroundColor:
                                        this._setFocusOnFocussedItem(item),
                                }}
                            >
                                <View style={styles.menu_horizontal_text}>
                                    <Text style={styles.Menu}>
                                        {LANG.getTranslation(String(item.name))}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
            if (
                Platform.OS === 'android' &&
                item.name == 'Apps' &&
                item.is_app == true
            ) {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        style={styles.menu_horizontal_row}
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                backgroundColor: 'rgba(0, 0, 0, 0.40)',
                                borderRadius: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    borderTopLeftRadius: 5,
                                    borderBottomLeftRadius: 5,
                                    paddingHorizontal: 5,
                                    backgroundColor: 'rgba(0, 0, 0, 0.40)',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View style={styles.menu_horizontal_icon}>
                                    {this.getMenuIcon('Apps')}
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 3,
                                    flexDirection: 'column',
                                    backgroundColor:
                                        this._setFocusOnFocussedItem(item),
                                }}
                            >
                                <View style={styles.menu_horizontal_text}>
                                    <Text style={styles.Menu}>{item.name}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
            if (
                item.name != 'Setting' &&
                item.Name != 'Hamburger' &&
                item.name != 'Messages' &&
                item.name != 'Profile' &&
                item.name != 'Apps' &&
                item.name != 'CatchupTV' &&
                item.name != 'Downloads' &&
                item.name != 'My List' &&
                item.name != 'Casting' &&
                item.is_app == false
            ) {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        style={styles.menu_horizontal_row}
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View
                            style={{
                                flex: 4,
                                flexDirection: 'row',
                                backgroundColor: 'rgba(0, 0, 0, 0.40)',
                                borderRadius: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    borderTopLeftRadius: 5,
                                    borderBottomLeftRadius: 5,
                                    paddingHorizontal: 5,
                                    backgroundColor: 'rgba(0, 0, 0, 0.63)',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View style={styles.menu_horizontal_icon}>
                                    {this.getMenuIcon(item.name)}
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 3,
                                    flexDirection: 'column',
                                    backgroundColor:
                                        this._setFocusOnFocussedItem(item),
                                }}
                            >
                                <View style={styles.menu_horizontal_text}>
                                    <Text style={styles.Menu}>
                                        {LANG.getTranslation(String(item.name))}
                                    </Text>
                                </View>
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
                        BorderRadius={5}
                        Focus
                        style={styles.menu_horizontal_row}
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                backgroundColor: 'rgba(0, 0, 0, 0.40)',
                                borderRadius: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    borderTopLeftRadius: 5,
                                    borderBottomLeftRadius: 5,
                                    paddingHorizontal: 5,
                                    backgroundColor: 'rgba(0, 0, 0, 0.63)',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <FontAwesome5
                                    style={styles.IconsMenu}
                                    // icon={SolidIcons.history}
                                    name="history"
                                />
                            </View>
                            <View
                                style={{
                                    flex: 3,
                                    flexDirection: 'column',
                                    backgroundColor:
                                        this._setFocusOnFocussedItem(item),
                                }}
                            >
                                <View style={styles.menu_horizontal_text}>
                                    <Text style={styles.Menu}>{item.name}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
        }
        if (GLOBAL.Device_IsPhone == true) {
            if (item.name == 'Hamburger' && item.is_app == false) {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressShowBaseMenu(item)}
                    >
                        <View>
                            <View style={styles.CenterImage}>
                                <FontAwesome5
                                    style={styles.IconsMenu}
                                    // icon={SolidIcons.user}
                                    name="user"
                                />
                            </View>

                            <View style={styles.CenterText}>
                                <Text style={styles.MenuIcons}>
                                    {LANG.getTranslation('personal')}
                                </Text>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
            if (
                item.name != 'Search' &&
                item.name != 'Setting' &&
                item.name != 'Messages' &&
                item.name != 'Profile' &&
                item.name != 'Apps' &&
                item.name != 'CatchupTV' &&
                item.name != 'Casting' &&
                GLOBAL.Device_IsPhone == true &&
                item.is_app == false
            ) {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View
                            style={{
                                backgroundColor:
                                    this._setFocusOnFocussedItem(item),
                            }}
                        >
                            <View style={styles.CenterImage}>
                                {this.getMenuIcon(item.name)}
                            </View>

                            <View style={styles.CenterText}>
                                <Text style={styles.MenuIcons}>
                                    {LANG.getTranslation(String(item.name))}
                                </Text>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
            if (
                item.name == 'Casting' &&
                GLOBAL.UserInterface.player.enable_casting == true &&
                GLOBAL.PlayServices == true
            ) {
                if (
                    GLOBAL.Device_IsPhone == true ||
                    GLOBAL.Device_IsTablet == true
                ) {
                    return (
                        <View style={{ flex: 1, paddingLeft: 5 }}>
                            <View>
                                <View style={styles.Circle_35}>
                                    {RenderIf(
                                        GLOBAL.Device_System == 'Android',
                                    )(
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                opacity: 0.3,
                                            }}
                                        >
                                            <Image
                                                source={require('../../../../images/chromecast.png')}
                                                style={{ width: 20, height: 15 }}
                                            />
                                        </View>,
                                    )}
                                    {RenderIf(
                                        GLOBAL.Device_System == 'Android',
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
                            </View>
                        </View>
                    );
                }
            }

            if (item.name == 'Profile' && GLOBAL.Device_IsPhone == true) {
                if (
                    GLOBAL.Device_IsPhone == true ||
                    (GLOBAL.Device_IsTablet == true &&
                        GLOBAL.Selected_Profile.name != '')
                ) {
                    return (
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            Focus
                            key={index}
                            hasTVPreferredFocus={this._setFocusOnFirst(
                                item,
                                index,
                            )}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this._onPressButtonMenu(item)}
                        >
                            <View
                                style={{ flex: 1, marginLeft: 5, marginRight: 5 }}
                            >
                                <View style={styles.menu_vertical_icon}>
                                    <View style={styles.CenterImage}>
                                        <UserAvatar
                                            size="35"
                                            name={GLOBAL.Selected_Profile.name
                                                .split(' ')
                                                .slice(0, 2)
                                                .join('+')}
                                        />
                                    </View>
                                </View>
                            </View>
                        </TouchableHighlightFocus>
                    );
                }
            }
            if (
                item.name == 'Search' &&
                GLOBAL.UserInterface.general.enable_search_menu == true
            ) {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View style={{ flex: 1 }}>
                            <View style={styles.CenterImage}>
                                <FontAwesome5
                                    style={styles.IconsMenu}
                                    // icon={SolidIcons.search}
                                    name="search"
                                />
                            </View>

                            <View style={styles.CenterText}>
                                <Text style={styles.MenuIcons}>
                                    {LANG.getTranslation('search')}
                                </Text>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
            if (item.name == 'Messages' && GLOBAL.Device_IsPhone == true) {
                var nonDeleted = GLOBAL.Messages.filter(
                    m => m.deleted == false,
                );
                if (nonDeleted) {
                    var readMessages = nonDeleted.filter(m => m.read == false);
                    if (readMessages) {
                        GLOBAL.Messages_QTY = readMessages.length;
                    }
                }
                if (
                    GLOBAL.Device_IsPhone == true ||
                    GLOBAL.Device_IsTablet == true
                ) {
                    return (
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            Focus
                            key={index}
                            hasTVPreferredFocus={this._setFocusOnFirst(
                                item,
                                index,
                            )}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this._onPressButtonMenu(item)}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={styles.CenterImage}>
                                    {RenderIf(GLOBAL.Messages_QTY > 0)(
                                        <Badge
                                            value={GLOBAL.Messages_QTY}
                                            status="error"
                                            badgeStyle={{ borderColor: 'red' }}
                                            containerStyle={{
                                                position: 'absolute',
                                                zIndex: 99999,
                                                top: -4,
                                                right: -4,
                                            }}
                                        />,
                                    )}
                                    <FontAwesome5
                                        style={styles.IconsMenu}
                                        // icon={RegularIcons.envelope}
                                        name="envelope"
                                    />
                                </View>

                                <View style={styles.CenterText}>
                                    <Text style={styles.MenuIcons}>
                                        {LANG.getTranslation('messages')}
                                    </Text>
                                </View>
                            </View>
                        </TouchableHighlightFocus>
                    );
                }
            }
            if (item.name == 'Setting' && GLOBAL.Device_IsPhone == true) {
                if (
                    GLOBAL.Device_IsPhone == true ||
                    GLOBAL.Device_IsTablet == true
                ) {
                    return (
                        <TouchableHighlightFocus
                            BorderRadius={5}
                            Focus
                            key={index}
                            hasTVPreferredFocus={this._setFocusOnFirst(
                                item,
                                index,
                            )}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this._onPressButtonMenu(item)}
                        >
                            <View style={{ flex: 1 }}>
                                <View style={styles.CenterImage}>
                                    {RenderIf(
                                        GLOBAL.OTA_Update == true &&
                                        Platform.OS == 'android',
                                    )(
                                        <Badge
                                            value="!"
                                            status="error"
                                            badgeStyle={{ borderColor: 'red' }}
                                            containerStyle={{
                                                position: 'absolute',
                                                zIndex: 99999,
                                                top: -4,
                                                right: -4,
                                            }}
                                        />,
                                    )}
                                    <FontAwesome5
                                        style={styles.IconsMenu}
                                        // icon={SolidIcons.slidersHh}
                                        name="sliders-h"
                                    />
                                </View>

                                <View style={styles.CenterText}>
                                    <Text style={styles.MenuIcons}>
                                        {LANG.getTranslation('settings')}
                                    </Text>
                                </View>
                            </View>
                        </TouchableHighlightFocus>
                    );
                }
            }
            if (Platform.OS === 'android' && item.name == 'Apps') {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View
                            style={{
                                flex: 1,
                                backgroundColor:
                                    this._setFocusOnFocussedItem(item),
                            }}
                        >
                            <View style={styles.CenterImage}>
                                {this.getMenuIcon(item.name)}
                            </View>
                            <View style={styles.CenterText}>
                                <Text style={styles.MenuIcons}>
                                    {LANG.getTranslation(String(item.name))}
                                </Text>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
            if (Platform.OS === 'android' && item.is_app == true) {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View
                            style={{
                                flex: 1,
                                backgroundColor:
                                    this._setFocusOnFocussedItem(item),
                            }}
                        >
                            <View style={styles.CenterImage}>
                                {this.getMenuIcon('Apps')}
                            </View>
                            <View style={styles.CenterText}>
                                <Text style={styles.MenuIcons}>
                                    {item.name}
                                </Text>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
            if (
                item.name == 'CatchupTV' &&
                GLOBAL.Device_IsPhone == true &&
                item.is_app == false &&
                GLOBAL.UserInterface.general.enable_catchuptv == true
            ) {
                return (
                    <TouchableHighlightFocus
                        BorderRadius={5}
                        Focus
                        key={index}
                        hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() => this._onPressButtonMenu(item)}
                    >
                        <View
                            style={{
                                flex: 1,
                                backgroundColor:
                                    this._setFocusOnFocussedItem(item),
                            }}
                        >
                            <View style={styles.CenterImage}>
                                <FontAwesome5
                                    style={styles.IconsMenu}
                                    // icon={SolidIcons.history}
                                    name="history"
                                />
                            </View>

                            <View style={styles.CenterText}>
                                <Text style={styles.MenuIcons}>
                                    {item.name}
                                </Text>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
        }

        if (
            Platform.OS === 'android' &&
            item.is_app == true &&
            GLOBAL.Device_IsTV == true
        ) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    Focus
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: this._setFocusOnFocussedItem(item),
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                        }}
                    >
                        <View style={styles.menu_vertical_text}>
                            <Text numberOfLines={1} style={styles.MenuIcons}>
                                {item.name}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }
    checkBaseMenuItems(item, index) {
        if (
            item.name == 'Casting' &&
            GLOBAL.UserInterface.player.enable_casting == true &&
            GLOBAL.PlayServices == true
        ) {
            if (
                GLOBAL.Device_IsPhone == true ||
                GLOBAL.Device_IsTablet == true
            ) {
                return (
                    <View
                        style={{
                            width: 70,
                            height: 70,
                            backgroundColor: '#000',
                            justifyContent: 'center',
                            margin: 3,
                        }}
                    >
                        <View
                            style={[
                                {
                                    borderWidth: 2,
                                    borderColor: '#000',
                                    backgroundColor: '#000',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                },
                            ]}
                        >
                            {RenderIf(GLOBAL.Device_System == 'Android')(
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
                            {RenderIf(GLOBAL.Device_System == 'Android')(
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 5,
                                        left: 24,
                                        opacity: 0.3,
                                    }}
                                >
                                    <Image
                                        source={require('../../../../images/chromecast.png')}
                                        style={{ width: 20, height: 20 }}
                                    />
                                </View>,
                            )}
                            <Text style={[styles.Mini, {}]}>
                                {LANG.getTranslation('casting')}
                            </Text>
                        </View>
                    </View>
                );
            }
        }
        if (
            item.name == 'My List' &&
            item.is_app == false &&
            GLOBAL.UserInterface.general.enable_watchlist_menu == true
        ) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    Focus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: '#000',
                                backgroundColor: '#000',
                                width: 70,
                                height: 70,
                                flexDirection: 'column',
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
                        {RenderIf(
                            GLOBAL.Device_IsAppleTV == false &&
                            GLOBAL.Device_IsSmartTV == false,
                        )(
                            <Text numberOfLines={1} style={styles.Mini}>
                                {LANG.getTranslation('watchlist')}
                            </Text>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (
            item.name == 'My Content' &&
            item.is_app == false &&
            GLOBAL.Payment_Method == 'api'
        ) {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    Focus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: '#000',
                                backgroundColor: '#000',
                                width: 70,
                                height: 70,
                                flexDirection: 'column',
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
                        {RenderIf(
                            GLOBAL.Device_IsAppleTV == false &&
                            GLOBAL.Device_IsSmartTV == false,
                        )(
                            <Text numberOfLines={1} style={styles.Mini}>
                                {LANG.getTranslation('my_content')}
                            </Text>,
                        )}
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
                    BorderRadius={5}
                    Focus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: '#000',
                                backgroundColor: '#000',
                                width: 70,
                                height: 70,
                                flexDirection: 'column',
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
                        {RenderIf(
                            GLOBAL.Device_IsAppleTV == false &&
                            GLOBAL.Device_IsSmartTV == false,
                        )(
                            <Text numberOfLines={1} style={styles.Mini}>
                                {LANG.getTranslation(String('Favorites'))}
                            </Text>,
                        )}
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
                    BorderRadius={5}
                    Focus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: '#000',
                                backgroundColor: '#000',
                                width: 70,
                                height: 70,
                                flexDirection: 'column',
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
                        {RenderIf(
                            GLOBAL.Device_IsAppleTV == false &&
                            GLOBAL.Device_IsSmartTV == false,
                        )(
                            <Text numberOfLines={1} style={styles.Mini}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>,
                        )}
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
                    BorderRadius={5}
                    Focus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: '#000',
                                backgroundColor: '#000',
                                width: 70,
                                height: 70,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            },
                        ]}
                    >
                        {RenderIf(GLOBAL.Messages_QTY > 0)(
                            <Badge
                                badgeStyle={{ borderColor: 'red' }}
                                value={GLOBAL.Messages_QTY}
                                status="error"
                                containerStyle={{
                                    position: 'absolute',
                                    zIndex: 99999,
                                    top: 0,
                                    right: 0,
                                }}
                            />,
                        )}
                        <FontAwesome5
                            style={styles.IconsMenu}
                            // icon={RegularIcons.envelope}
                            name="envelope"
                        />
                        {RenderIf(
                            GLOBAL.Device_IsAppleTV == false &&
                            GLOBAL.Device_IsSmartTV == false,
                        )(
                            <Text numberOfLines={1} style={styles.Mini}>
                                {LANG.getTranslation(String('messagecenter'))}
                            </Text>,
                        )}
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
                    BorderRadius={5}
                    Focus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: '#000',
                                backgroundColor: '#000',
                                width: 70,
                                height: 70,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            },
                        ]}
                    >
                        {GLOBAL.OTA_Update && Platform.OS == 'android' && (
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 15,
                                    zIndex: 99999,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        backgroundColor: 'red',
                                        borderRadius: 100,
                                        height: 20,
                                        width: 20,
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={[styles.Medium, styles.Bold]}>
                                        !
                                    </Text>
                                </View>
                            </View>
                        )}
                        <FontAwesome5
                            style={styles.IconsMenu}
                            // icon={SolidIcons.slidersHh}
                            name="sliders-h"
                        />
                        {RenderIf(
                            GLOBAL.Device_IsAppleTV == false &&
                            GLOBAL.Device_IsSmartTV == false,
                        )(
                            <Text numberOfLines={1} style={styles.Mini}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>,
                        )}
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
                    BorderRadius={5}
                    Focus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: '#000',
                                backgroundColor: '#000',
                                width: 70,
                                height: 70,
                                flexDirection: 'column',
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
                        {RenderIf(
                            GLOBAL.Device_IsAppleTV == false &&
                            GLOBAL.Device_IsSmartTV == false,
                        )(
                            <Text numberOfLines={1} style={styles.Mini}>
                                {LANG.getTranslation(String(item.name))}
                            </Text>,
                        )}
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
                    BorderRadius={5}
                    Focus
                    style={{ borderRadius: 5 }}
                    key={index}
                    hasTVPreferredFocus={this._setFocusOnFirst(item, index)}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressButtonMenu(item)}
                >
                    <View
                        style={[
                            {
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: '#000',
                                backgroundColor: '#000',
                                width: 70,
                                height: 70,
                                flexDirection: 'column',
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
                        style={styles.IconsMenu}
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
    // onMenuLayout = event => {
    //     if (this.state.menuRowWidth != 0) { return }
    //     let width = event.nativeEvent.layout.width;
    //     GLOBAL.Menu_Width = width;
    //     this.setState({ menuRowWidth: width - 30 })
    // }
    render() {
        return (
            <View style={[styles.footer_container_left]}>
                {RenderIf(!GLOBAL.Device_IsPhone)(
                    <View
                        style={[
                            {
                                width: this.state.menuRowWidth,
                                backgroundColor: 'rgba(0, 0, 0, 0.60)',
                                height: '100%',
                                marginTop: 5,
                                paddingHorizontal: 5,
                                borderTopRightRadius: 5,
                            },
                        ]}
                    >
                        <View
                            style={{
                                flexDirection: 'column',
                                flex: 4,
                            }}
                        >
                            <View
                                style={{
                                    height:
                                        GLOBAL.Device_IsSmartTV ||
                                            GLOBAL.Device_IsAppleTV
                                            ? 90
                                            : 88,
                                    paddingRight: 5,
                                }}
                            >
                                <FlatList
                                    ref={ref => {
                                        this.flatListRefsss = ref;
                                    }}
                                    data={this.state.basemenu}
                                    horizontal={true}
                                    style={{ marginVertical: 5 }}
                                    Width={50}
                                    TopMenu={true}
                                    extraData={this.state.menuRowWidth}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({ item, index }) => {
                                        return this.checkBaseMenuItems(
                                            item,
                                            index,
                                        );
                                    }}
                                />
                            </View>
                            <FlatList
                                ref={ref => {
                                    this.flatListRefssss = ref;
                                }}
                                data={this.state.menu}
                                //extraData={this.state.casting}
                                horizontal={false}
                                numColumns="1"
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => {
                                    return this.checkMenuItems(item, index);
                                }}
                            />
                            {RenderIf(
                                GLOBAL.UserInterface.home.enable_tv_preview ==
                                true &&
                                GLOBAL.Focus != 'Music' &&
                                GLOBAL.Device_IsSmartTV == false &&
                                this.state.videoUrl != '',
                            )(
                                <View
                                    style={{
                                        marginBottom: 10,
                                        height:
                                            ((this.state.menuRowWidth - 5) /
                                                16) *
                                            9,
                                        marginTop: 5,
                                        width: '100%',
                                        backgroundColor: '#000',
                                        borderRadius: 2,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <TouchableHighlightFocus
                                        BorderRadius={2}
                                        Focus
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            height:
                                                ((this.state.menuRowWidth - 5) /
                                                    16) *
                                                9,
                                        }}
                                        key={'index'}
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() =>
                                            this._startTelevision(
                                                this.state.channel,
                                            )
                                        }
                                    >
                                        <View>
                                            <Video
                                                ref={ref => {
                                                    this.player = ref;
                                                }}
                                                source={{
                                                    uri: this.state.videoUrl,
                                                    type: this.state.videoType,

                                                    ref: 'player',
                                                    headers: {
                                                        'User-Agent':
                                                            GLOBAL.User_Agent,
                                                    },
                                                    drm: TOKEN.getDrmSetup(
                                                        this.state
                                                            .drmSupplierType,
                                                        this.state
                                                            .drmLicenseServerUrl,
                                                        this.state
                                                            .drmCertificateUrl,
                                                        this.state.drmKey,
                                                    ),
                                                }}
                                                disableFocus={true}
                                                style={{
                                                    borderRadius: 2,
                                                    height:
                                                        ((this.state
                                                            .menuRowWidth -
                                                            14) /
                                                            16) *
                                                        9,
                                                    width:
                                                        this.state
                                                            .menuRowWidth - 14,
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                }}
                                                resizeMode="stretch"
                                                paused={false}
                                                repeat={false}
                                                selectedAudioTrack={{
                                                    type: 'index',
                                                    value: 0,
                                                }}
                                            />
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>,
                            )}
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
        if (GLOBAL.Focus == 'Home') {
            return false;
        }
    }
    _setFocusOnFocussedItem(item) {
        return GLOBAL.Focus == item.name ? 'transparent' : 'transparent';
    }
}
