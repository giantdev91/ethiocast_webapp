import React, { ReactElement, useEffect, useCallback, useState } from 'react';
import {
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    View,
    ScrollView,
    BackHandler,
    TouchableOpacity,
} from 'react-native';
import { Button, Input, Icon, Spinner, Modal, Card } from '@ui-kitten/components';
import { Text, Block } from '../../components';
import SIZES from '../../constants/sizes';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import DAL from '../../../datalayer/dal_web';
import UTILS from '../../../datalayer/utils';
import LANG from '../../../languages/languages';
import LangCodes from '../../../languages/language_codes';
import EStyleSheet from 'react-native-extended-stylesheet';
import Decode from 'unescape';
import HTML from 'react-native-render-html';
import { PersonIcon, LockIcon } from './extra/icons';
import TimerMixin from 'react-timer-mixin';
import { useFocusEffect } from '@react-navigation/native';
import { sendPageReport } from '../../../reporting/reporting';
import { CommonActions } from '@react-navigation/native';
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default ({ navigation }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    var closeAppTimer;
    var sizes = SIZES.getSizing();
    const [email, setEmail] = useState(GLOBAL.UserID);
    const [password, setPassword] = useState(GLOBAL.Pass);
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [authenticating, setAuthenticating] = useState(false);
    const [showCloseAppModal, setShowCloseAppModal] = useState(false);
    const [backPressedCount, setBackPressedCount] = useState(0);
    useEffect(() => {
        return () => sendPageReport('Signin', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        return () => {
            TimerMixin.clearTimeout(closeAppTimer);
        };
    }, []);
    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', () => {
                // setBackPressedCount((backPressedCount) => backPressedCount + 1);
                // setShowCloseAppModal(true);
                // startCloseAppTimer();
                onBackToService();
                return true;
            });
            return () => {
                BackHandler.removeEventListener(
                    'hardwareBackPress',
                    () => true,
                );
            };
        }, []),
    );

    useEffect(() => {
        if (backPressedCount === 2) {
            BackHandler.exitApp();
        }
    }, [backPressedCount]);

    const startCloseAppTimer = () => {
        TimerMixin.clearTimeout(closeAppTimer);
        closeAppTimer = TimerMixin.setTimeout(() => {
            setBackPressedCount(0);
            setShowCloseAppModal(false);
        }, 2000);
    };
    const onSignIn = (): void => {
        //authenticate
        (async () => {
            GLOBAL.Selected_Profile == '';
            GLOBAL.UserID = email;
            GLOBAL.Pass = password;
            UTILS.storeJson('UserID', GLOBAL.UserID);
            UTILS.storeJson('Pass', GLOBAL.Pass);
            setAuthenticating(true);
            let res = await getUserIp();
            if (res.success) {
                var test = '';
                if (GLOBAL.Device_IsWebTV) {
                    test = window.location.search;
                }
                if (test == '?connect') {
                    navigation && navigation.navigate('Check');
                } else {
                    navigation && navigation.navigate('Empty');
                }
            } else {
                setAuthenticating(false);
                setError(res.error);
            }
        })();
    };

    const onBackToService = (): void => {
        if (GLOBAL.HasService == true || GLOBAL.ServiceID != '') {
            navigation && navigation.navigate('Service');
        } else {
            GLOBAL.Selected_Language = '';
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: 'Language' }],
                }),
            );
        }
    };

    const onForgotPasswordButtonPress = (): void => {
        navigation && navigation.navigate('Forgot');
    };

    const onPasswordIconPress = (): void => {
        setPasswordVisible(!passwordVisible);
    };

    const renderPasswordIcon = (props): ReactElement => (
        <TouchableWithoutFeedback onPress={onPasswordIconPress}>
            <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
        </TouchableWithoutFeedback>
    );

    const getUserIp = async () => {
        try {
            console.log(
                'get user ip: ',
                'https://cloudtv.akamaized.net/ip.php?_=' + moment().unix(),
            );
            let response = await fetch(
                'https://cloudtv.akamaized.net/ip.php?_=' + moment().unix(),
            );
            let data = await response.json();
            console.log('get user ip response: ', data);
            if (data != undefined) {
                GLOBAL.Device_IpAddress = data.ip;
                return getAccessToken();
            } else {
                return getUserIpFailBack();
            }
        } catch (error) {
            return await getUserIpFailBack();
        }
    };
    const getUserIpFailBack = async () => {
        try {
            console.log(
                'get user ip fail back: ',
                'https://geo.ipify.org/api/v1?apiKey=at_1hR71IevRJgz9lGCdYFdju173gYvC',
            );
            let response = await fetch(
                'https://geo.ipify.org/api/v1?apiKey=at_1hR71IevRJgz9lGCdYFdju173gYvC',
            );
            let data = await response.json();
            console.log('get user ip fail back response: ', data);
            if (data != undefined) {
                GLOBAL.Device_IpAddress = data.ip;
                return getAccessToken();
            } else {
                return {
                    success: false,
                    error: 'We can not get your IP Address try with or without VPN',
                };
            }
        } catch (error) {
            return {
                success: false,
                error:
                    'We can not get your IP Address try with or without VPN' +
                    error,
            };
        }
    };
    const getAccessToken = async () => {
        try {
            var path =
                '/' +
                GLOBAL.IMS +
                '/customers/' +
                UTILS.toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
                '/' +
                UTILS.toAlphaNumeric(GLOBAL.Pass) +
                '.json';
            console.log('get access token: ', path);
            let response = await fetch(
                GLOBAL.HTTPvsHTTPS +
                'authorize.akamaized.net/encrypt.php?CID=' +
                path +
                '&time=' +
                moment().unix(),
            );
            let data = await response.json();
            console.log('get access token response: ', data);
            try {
                console.log(
                    'get access token: ',
                    GLOBAL.HTTPvsHTTPS +
                    'authorize.akamaized.net/login.php?CID=' +
                    data.CID +
                    '&time=' +
                    moment().unix(),
                );
                let response_ = await fetch(
                    GLOBAL.HTTPvsHTTPS +
                    'authorize.akamaized.net/login.php?CID=' +
                    data.CID +
                    '&time=' +
                    moment().unix(),
                );
                let data_ = await response_.json();
                console.log('get access token response: ', data_);
                if (!data_.CID) {
                    return {
                        success: false,
                        error: LANG.getTranslation('no_access_wrong_cred'),
                    };
                } else {
                    GLOBAL.USER_TOKEN = data_.CID;
                    return getUser(data_.CID);
                }
            } catch (error) {
                return {
                    success: false,
                    error: LANG.getTranslation('no_access_cloud_error'),
                };
            }
        } catch (error) {
            return {
                success: false,
                error: LANG.getTranslation('no_access_cloud_error'),
            };
        }
    };
    const getUser = async token => {
        var path =
            '/' +
            GLOBAL.IMS +
            '/customers/' +
            UTILS.toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
            '/' +
            UTILS.toAlphaNumeric(GLOBAL.Pass) +
            '.json';
        const url = 'path=' + path + '~token=' + token;
        try {
            console.log(
                'get user: ',
                GLOBAL.HTTPvsHTTPS +
                'authorize.akamaized.net/encrypt.php?CID=' +
                url +
                '&time=' +
                moment().unix(),
            );
            let response = await fetch(
                GLOBAL.HTTPvsHTTPS +
                'authorize.akamaized.net/encrypt.php?CID=' +
                url +
                '&time=' +
                moment().unix(),
            );
            let data = await response.json();
            console.log('get user response: ', data);
            try {
                let response_ = await fetch(
                    GLOBAL.HTTPvsHTTPS +
                    'cloudtv.akamaized.net/getfile.php?CID=' +
                    data.CID +
                    '&time=' +
                    moment().unix(),
                );
                let data_ = await response_.json();
                let user = JSON.parse(data_);
                var expiring = moment(
                    new Date(user.account.datetime_expired),
                ).format('X');
                var current = moment().format('X');
                var expireTime = expiring - current;
                GLOBAL.User = user;
                GLOBAL.User_Currency = user.customer.currency;
                if (user.account.account_status == 'Disabled') {
                    return {
                        success: false,
                        error: LANG.getTranslation(
                            'no_access_account_disabled',
                        ),
                    };
                } else if (
                    user.account.account_status == 'Expired' ||
                    expireTime < 3600
                ) {
                    return {
                        success: false,
                        error: LANG.getTranslation('no_access_account_expired'),
                    };
                } else {
                    const date = moment().format('DD_MM_YYYY');
                    GLOBAL.Login_Check_Date = date;
                    GLOBAL.Staging = user.account.staging;
                    GLOBAL.ProductID = user.products.productid;
                    GLOBAL.ResellerID = user.account.resellerid;
                    GLOBAL.Recordings = user.recordings;
                    GLOBAL.Storage_Total = user.storage.total;
                    GLOBAL.Storage_Used = user.storage.used;
                    GLOBAL.Storage_Hours = user.storage.total_hours;
                    GLOBAL.PPV = user.payperview;
                    GLOBAL.Wallet_Credits = user.customer.walletbalance;
                    GLOBAL.Rented_Movies = user.payperview.movies;
                    var messages = user.messages;
                    if (messages != undefined) {
                        messages.forEach(message_ => {
                            var messagesNew = GLOBAL.Messages.find(
                                m =>
                                    m.id == message_.id &&
                                    m.tz == message_.time,
                            );
                            if (messagesNew == undefined) {
                                var new_message = {
                                    id: message_.id,
                                    tz: Number(message_.time),
                                    read: false,
                                    deleted: false,
                                    message: message_.message,
                                    title: message_.message,
                                    image: '',
                                };
                                GLOBAL.Messages.splice(0, 0, new_message);
                            }
                        });
                    }
                    var qty = GLOBAL.Messages.filter(m => m.read == false);
                    GLOBAL.Messages_QTY = qty.length;
                    UTILS.storeJson('Messages', GLOBAL.Messages);

                    if (user.profiles) {
                        GLOBAL.Profiles = user.profiles;
                    }
                    var addProfile = {
                        id: 0,
                        name: 'Add Profile',
                        recommendations: [],
                        mode: 'regular',
                        avatar: '',
                    };
                    GLOBAL.Profiles.push(addProfile);
                    if (user.account.account_status == 'Pending') {
                        DAL.registerDevice();
                        return getUserLocation();
                    } else {
                        return getUserLocation();
                    }
                }
            } catch (error) {
                return {
                    success: false,
                    error: LANG.getTranslation('no_access_cloud_error'),
                };
            }
        } catch (error) {
            return {
                success: false,
                error: LANG.getTranslation('no_access_cloud_error'),
            };
        }
    };
    const getUserLocation = async () => {
        try {
            console.log(
                'get user location: ',
                'https://geo.ipify.org/api/v1?apiKey=at_1hR71IevRJgz9lGCdYFdju173gYvC',
            );
            let response = await fetch(
                'https://geo.ipify.org/api/v1?apiKey=at_1hR71IevRJgz9lGCdYFdju173gYvC',
            );
            let data = await response.json();
            console.log('get user location response: ', data);
            if (data != undefined) {
                var city = data.city.toLowerCase();
                city = data.city.charAt(0).toUpperCase() + city.slice(1);
                GLOBAL.City = city;
                GLOBAL.State = 'na';
                GLOBAL.Country =
                    LangCodes.languageCodes.find(l => l.code == data.country)
                        .name != undefined
                        ? LangCodes.languageCodes.find(
                            l => l.code == data.country,
                        ).name
                        : 'United States';
                GLOBAL.Latitude = data.latitude;
                GLOBAL.Longitude = data.longitude;

                //network
                GLOBAL.Network_IpAddress = data.ip;
                GLOBAL.Network_Type = data.as.type;
                GLOBAL.Network_Name = data.as.name;
                GLOBAL.Network_ISP = data.isp;
                GLOBAL.Network_IsVPN = data.proxy.vpn;
                GLOBAL.Network_IsProxy = data.proxy.proxy;
                GLOBAL.Network_ASN = data.as.asn;
                //location
                GLOBAL.Location_ZIP = data.location.postalCode;
                GLOBAL.Location_City = data.location.city;
                GLOBAL.Location_State = data.location.region;
                GLOBAL.Location_Country =
                    LangCodes.languageCodes.find(
                        l => l.code == data.location.country,
                    ).name != undefined
                        ? LangCodes.languageCodes.find(
                            l => l.code == data.location.country,
                        ).name
                        : 'United States';
                GLOBAL.Location_Latitude = data.location.lat;
                GLOBAL.Location_Longitude = data.location.lon;
                GLOBAL.Location_Timezone = data.location.timezone;
                return getAccessLocation();
            } else {
                return getUserLocationFailback();
            }
        } catch (error) {
            return getUserLocationFailback();
        }
    };
    const getUserLocationFailback = async () => {
        try {
            console.log(
                'get user location failback: ',
                GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/location.php?_=' +
                moment().unix(),
            );
            let response = await fetch(
                GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/location.php?_=' +
                moment().unix(),
            );
            let data = await response.json();
            console.log('get user location failback response: ', data);
            if (data != undefined) {
                var city = data.city.toLowerCase();
                city = data.city.charAt(0).toUpperCase() + city.slice(1);
                GLOBAL.City = city;
                GLOBAL.State = '';
                GLOBAL.Country =
                    LangCodes.languageCodes.find(l => l.code == data.country)
                        .name != undefined
                        ? LangCodes.languageCodes.find(
                            l => l.code == data.country,
                        ).name
                        : 'United States';
                GLOBAL.Latitude = data.latitude;
                GLOBAL.Longitude = data.longitude;
                return getAccessLocation();
            } else {
                return getUserLocationFailback();
            }
        } catch (error) {
            return {
                success: false,
                error: LANG.getTranslation('no_access_vpn'),
            };
        }
    };
    const getAccessLocation = async () => {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/whitelisted_' +
            GLOBAL.ProductID +
            '_v2.json';
        try {
            console.log('get access location: ', path);
            let response = await fetch(path);
            let data = await response.json();
            console.log('get access location response: ', data);
            if (data != null && data != undefined) {
                var checkCountry = data.geoaccess.find(
                    c => c.country == GLOBAL.Country,
                );
                if (
                    data.geoaccess.length == 0 &&
                    data.whitelisted.length == 0
                ) {
                    return getProduct();
                } else if (
                    checkCountry != undefined ||
                    data.whitelisted.length != 0
                ) {
                    if (data.whitelisted.length > 0) {
                        var range = data.whitelisted || [];
                        var check = false;
                        for (var i = 0; i < range.length; i++) {
                            if (
                                isInRange(
                                    GLOBAL.Device_IpAddress,
                                    range[i].start,
                                    range[i].end,
                                )
                            ) {
                                check = true;
                                return getProduct();
                            }
                        }
                        if (check == false) {
                            return {
                                success: false,
                                error: LANG.getTranslation('no_access_ip'),
                            };
                        }
                    } else {
                        return getProduct();
                    }
                } else {
                    return {
                        success: false,
                        error: LANG.getTranslation('no_access_country'),
                    };
                }
            } else {
                return getProduct();
            }
        } catch (error) {
            return getProduct();
        }
    };
    const isInRange = async (address, a, b) => {
        address = str2int(address);
        a = str2int(a);
        b = str2int(b);
        return a <= address && address <= b;
    };
    const str2int = async str => {
        var temp = str.split('.');
        return (
            (parseInt(temp[0], 10) << 24) +
            (parseInt(temp[1], 10) << 16) +
            (parseInt(temp[2], 10) << 8) +
            parseInt(temp[3], 10)
        );
    };
    const getProduct = async () => {
        GLOBAL.MenuBase = [];
        GLOBAL.Menu = [];
        GLOBAL.AutoLogin = true;
        UTILS.storeJson('AutoLogin', true);
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_product_v2.json';
        try {
            console.log('get product: ', path);
            let response = await fetch(path);
            let product = await response.json();
            console.log('get product response: ', product);
            GLOBAL.App_Theme = product.ui;
            //GLOBAL.App_Theme = 'Rhodium';
            // GLOBAL.App_Theme = 'Iridium';
            //GLOBAL.App_Theme = 'Honua';
            // GLOBAL.App_Theme = 'Akua'
            //GLOBAL.App_Theme = 'Palladium'
            if (
                GLOBAL.App_Theme != 'Akua' &&
                GLOBAL.App_Theme != 'Honua' &&
                GLOBAL.App_Theme != 'Rhodium' &&
                GLOBAL.App_Theme != 'Iridium' &&
                GLOBAL.App_Theme != 'Palladium'
            ) {
                GLOBAL.App_Theme = 'Akua';
            }
            GLOBAL.Product = product;

            //drm new
            if (product.drm) {
                if (product.drm.buy_drm.license_server_url != null) {
                    GLOBAL.DRM_LicenseServer =
                        product.drm.buy_drm.license_server_url;
                    GLOBAL.DRM_CertificateUrl =
                        product.drm.buy_drm.certificate_url;
                    GLOBAL.DRM_LicenseServerApple =
                        product.drm.buy_drm.license_server_url_apple;
                }
                if (product.drm.irdeto_drm.license_server_url != null) {
                    GLOBAL.DRM_AccountID = product.drm.irdeto_drm.account_id;
                    GLOBAL.DRM_LicenseServer =
                        product.drm.irdeto_drm.license_server_url;
                    GLOBAL.DRM_KeyServerURL =
                        product.drm.irdeto_drm.license_server_ic_host;
                    GLOBAL.DRM_LicenseServerApple =
                        product.drm.buy_drm.license_server_url_apple;
                }
            }

            GLOBAL.Payment_Method = product.payment_type.toLowerCase();
            GLOBAL.Max_Devices = product.max_concurrent_devices;
            if (product.show_clock == true && GLOBAL.Clock_Not_Set == false) {
                GLOBAL.Clock_Type = '24h';
                GLOBAL.Clock_Setting = 'HH:mm';
            }
            if (product.payment_type == 'Wallet') {
                GLOBAL.Has_Wallet = true;
            }
            if (product.storage_package != 0) {
                GLOBAL.Has_Storage = true;
            }
            var colorSelection = product.contact.selection_color;
            if (colorSelection != '') {
                GLOBAL.Button_Color = colorSelection;
            }
            GLOBAL.MenuBase.length = 0;
            GLOBAL.Menu.length = 0;
            GLOBAL.Menu = product.menu.menuitems; //.filter(m => m.name != "Settings");

            var menuLogout = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'Logout',
                package_name: null,
                package_url: null,
                position: 9999,
                type: 'full',
            };

            GLOBAL.Menu.push(menuLogout);
            var menuHamburger = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'Hamburger',
                package_name: null,
                package_url: null,
                position: 9998,
                type: 'full',
            };
            var menuCasting = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'Casting',
                package_name: null,
                package_url: null,
                position: 9995,
                type: 'full',
            };
            GLOBAL.Menu.splice(0, 0, menuHamburger);
            if (
                GLOBAL.Device_IsPhone == true ||
                GLOBAL.Device_IsTablet == true
            ) {
                GLOBAL.Menu.splice(0, 0, menuCasting);
            }
            GLOBAL.Menu = GLOBAL.Menu.filter(m => m.name != 'Settings');
            GLOBAL.SupportText = product.contact.text;
            var menuList = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'My List',
                package_name: null,
                package_url: null,
                position: 9997,
                type: 'full',
            };
            var menuFavorites = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'My Favorites',
                package_name: null,
                package_url: null,
                position: 9991,
                type: 'full',
            };
            var menuDownloads = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'Downloads',
                package_name: null,
                package_url: null,
                position: 9996,
                type: 'full',
            };

            var menuProfiles = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'Profile',
                package_name: null,
                package_url: null,
                position: 9994,
                type: 'full',
            };
            var menuMessages = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'Messages',
                package_name: null,
                package_url: null,
                position: 9993,
                type: 'full',
            };
            var menuSettings = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'Settings',
                package_name: null,
                package_url: null,
                position: 9992,
                type: 'full',
            };
            var menuEducation = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'Education',
                package_name: null,
                package_url: null,
                position: 9991,
                type: 'full',
            };
            var menuContent = {
                is_app: false,
                is_default: false,
                is_module: false,
                module_name: null,
                name: 'My Content',
                package_name: null,
                package_url: null,
                position: 9990,
                type: 'full',
            };
            var check = GLOBAL.Menu.find(
                m => m.name == 'Movies' || m.name == 'Series',
            );
            if (check != null) {
                GLOBAL.Have_Vod = true;
                GLOBAL.MenuBase.splice(0, 0, menuList);
            }
            GLOBAL.MenuBase.splice(0, 0, menuFavorites);
            if (GLOBAL.Payment_Method != 'Subscription' && check != null) {
                GLOBAL.MenuBase.splice(0, 0, menuContent);
            }

            GLOBAL.MenuBase.splice(0, 0, menuMessages);
            GLOBAL.MenuBase.splice(0, 0, menuSettings);
            if (GLOBAL.App_Theme == 'Honua') {
                GLOBAL.MenuBase.splice(0, 0, menuCasting);
            }
            if (GLOBAL.Profiles.length > 1) {
                GLOBAL.MenuBase.splice(0, 0, menuProfiles);
            }
            if (product.akamai_legacy_key) {
                GLOBAL.AKAMAI_LEGACY_KEY = product.akamai_legacy_key;
            }
            if (product.akamai_key) {
                GLOBAL.AKAMAI_KEY = product.akamai_key;
            }
            if (product.flussonic_key) {
                GLOBAL.FLUSSONIC_KEY = product.flussonic_key;
            }
            if (product.generic_key) {
                GLOBAL.User_Agent = product.generic_key;
            }
            GLOBAL.Ads_Enabled = product.enable_advertisments;
            if (product.devices[GLOBAL.Device_Type] == false) {
                return {
                    success: false,
                    error: LANG.getTranslation('no_access_device'),
                };
            } else {
                if (GLOBAL.ResellerID == 0) {
                    return getSettingsGui();
                } else {
                    return getResellerBranding();
                }
            }
        } catch (error) {
            return {
                success: false,
                error: LANG.getTranslation('no_access_product'),
            };
        }
    };
    const getSettingsGui = async () => {
        var path =
            GLOBAL.GuiBaseUrl +
            GLOBAL.Product.base_start_url +
            '/settings/settings.json';

        try {
            console.log('get setting gui: ', path);
            let response = await fetch(path);
            let settings = await response.json();
            settings = JSON.parse(settings);
            console.log('get setting gui response: ', settings);
            GLOBAL.Settings_Gui = settings;
            GLOBAL.UserInterface = settings.userinterface;

            if (
                GLOBAL.UserInterface.channel.toggle_default_settings !=
                'User Defined'
            ) {
                GLOBAL.Channel_Toggle =
                    GLOBAL.UserInterface.channel.toggle_default_settings;
            }
            if (
                GLOBAL.UserInterface.player.default_audio_language !=
                'User Defined'
            ) {
                GLOBAL.Selected_AudioTrack =
                    GLOBAL.UserInterface.player.default_audio_language;
            }
            if (
                GLOBAL.UserInterface.player.default_subtitle_language !=
                'User Defined'
            ) {
                GLOBAL.Selected_TextTrack =
                    GLOBAL.UserInterface.player.default_subtitle_language;
            }
            if (
                GLOBAL.UserInterface.player.default_screen_mode !=
                'User Defined'
            ) {
                GLOBAL.Screen_Size =
                    GLOBAL.UserInterface.player.default_screen_mode;
            }

            if (GLOBAL.UserInterface.general.clock_format == '24 Hrs') {
                GLOBAL.Clock_Type = '24h';
                GLOBAL.Clock_Setting = 'HH:mm';
            } else {
                GLOBAL.Clock_Type = 'AM/PM';
                GLOBAL.Clock_Setting = 'hh:mm A';
            }

            GLOBAL.DirectToTelevision =
                GLOBAL.UserInterface.general.enable_start_direct_to_tv;
            GLOBAL.Sleep_Mode = GLOBAL.UserInterface.general.sleep_mode_setting;

            if (GLOBAL.ResellerID == 0) {
                GLOBAL.Button_Color = settings.style.highlight.primary;
                GLOBAL.Selection_Color = settings.style.highlight.secondary;
                GLOBAL.Logo =
                    GLOBAL.BaseCdnUrl +
                    '/' +
                    GLOBAL.IMS +
                    '/userinterfaces/' +
                    GLOBAL.Product.base_start_url +
                    '/artwork/' +
                    settings.style.logo
                        .toString()
                        .replace('http://', '')
                        .replace('https://', '')
                        .replace('//', '');
                GLOBAL.Background =
                    GLOBAL.BaseCdnUrl +
                    '/' +
                    GLOBAL.IMS +
                    '/userinterfaces/' +
                    GLOBAL.Product.base_start_url +
                    '/artwork/' +
                    settings.style.background
                        .toString()
                        .replace('http://', '')
                        .replace('https://', '')
                        .replace('//', '');
            }
            if (GLOBAL.UserInterface.general.enable_large_fonts == true) {
                EStyleSheet.clearCache();
                EStyleSheet.build({
                    // always call EStyleSheet.build() even if you don't use global variables!
                    $tvguide_bar_height:
                        GLOBAL.Device_FormFactor == 'PHONE'
                            ? 0
                            : GLOBAL.Device_IsAndroidTV ||
                                GLOBAL.Device_IsFireTV
                                ? 110
                                : GLOBAL.Device_IsSTB
                                    ? 230
                                    : GLOBAL.Device_IsAppleTV
                                        ? 300
                                        : 150,
                    $bar_height:
                        GLOBAL.Device_FormFactor == 'PHONE'
                            ? 150
                            : GLOBAL.Device_IsAndroidTV ||
                                GLOBAL.Device_IsFireTV
                                ? 150
                                : GLOBAL.Device_IsSTB
                                    ? 230
                                    : GLOBAL.Device_IsAppleTV
                                        ? 325
                                        : 150,
                    $header_height:
                        GLOBAL.Device_FormFactor == 'PHONE'
                            ? GLOBAL.Device_Manufacturer == 'Apple' &&
                                GLOBAL.Device_IsPortrait
                                ? 80
                                : 65
                            : GLOBAL.Device_IsAndroidTV ||
                                GLOBAL.Device_IsFireTV
                                ? 50
                                : GLOBAL.Device_IsSTB
                                    ? 60
                                    : GLOBAL.Device_IsAppleTV
                                        ? 115
                                        : 75,
                    $logo_height:
                        GLOBAL.Device_FormFactor == 'PHONE'
                            ? 40
                            : GLOBAL.Device_IsAndroidTV ||
                                GLOBAL.Device_IsFireTV
                                ? 50
                                : GLOBAL.Device_IsSTB
                                    ? 50
                                    : 55,
                    $footer_height:
                        GLOBAL.Device_FormFactor == 'PHONE'
                            ? GLOBAL.Device_System == 'Apple'
                                ? 65
                                : 65
                            : GLOBAL.Device_IsAndroidTV ||
                                GLOBAL.Device_IsFireTV
                                ? 40
                                : GLOBAL.Device_IsSTB
                                    ? 60
                                    : 75,
                    $sub_color:
                        GLOBAL.Device_FormFactor == 'PHONE' ||
                            GLOBAL.Device_FormFactor == 'TABLET' ||
                            GLOBAL.Device_FormFactor == 'TV' ||
                            GLOBAL.Device_FormFactor == 'WEB'
                            ? '#999'
                            : '#444',
                    $font_size_extra: UTILS.getFontExtra(true),
                    $square_width_height:
                        GLOBAL.Device_FormFactor == 'WEB'
                            ? '7rem'
                            : GLOBAL.Device_IsAndroidTV ||
                                GLOBAL.Device_IsFireTV
                                ? '4.2rem'
                                : GLOBAL.Device_IsSTB
                                    ? '5rem'
                                    : GLOBAL.Device_IsTablet
                                        ? '5rem'
                                        : GLOBAL.Device_IsPortrait
                                            ? '3.5rem'
                                            : GLOBAL.Device_IsAppleTV
                                                ? '7rem'
                                                : '5rem',
                });
            }
            return getRegisteredDevices();
        } catch (error) {
            return getRegisteredDevices();
        }
    };
    const getRegisteredDevices = async () => {
        var path =
            'https://devices.tvms.io/getdevice?collection_key=' +
            GLOBAL.IMS +
            '.' +
            GLOBAL.CRM +
            '&document_key=' +
            UTILS.toAlphaNumeric(GLOBAL.UserID) +
            '.' +
            UTILS.toAlphaNumeric(GLOBAL.Pass);
        try {
            console.log('get registered devices: ', path);
            let response = await fetch(path);
            let devices = await response.json();
            console.log('get registered devices response: ', devices);
            if (devices.devices != undefined) {
                var uuidCheck = devices.devices.filter(
                    d => d.uuid == GLOBAL.Device_UniqueID,
                );
                if (uuidCheck.length > 0) {
                    return setRegisteredDevices(devices.devices);
                } else {
                    var today = moment().utc().unix();
                    var devicesNotToOld = devices.devices.filter(
                        d => d.valid > today,
                    );
                    if (GLOBAL.Max_Devices > devicesNotToOld.length) {
                        return setRegisteredDevices(devicesNotToOld);
                    } else {
                        return {
                            success: false,
                            error: LANG.getTranslation(
                                'no_access_max_concurrent',
                            ),
                        };
                    }
                }
            } else {
                var newDevice = JSON.stringify({
                    uuid: GLOBAL.Device_UniqueID,
                    valid: moment().add(2, 'days').utc().unix(),
                    model: GLOBAL.Device_Model,
                    type: GLOBAL.Device_Type,
                    ip: GLOBAL.Device_IpAddress,
                    resellerId: GLOBAL.ResellerID,
                    city: GLOBAL.City,
                    state: GLOBAL.State,
                    country: GLOBAL.Country,
                    appversion: GLOBAL.App_Version,
                });
                var newDeviceParsed = JSON.parse(newDevice);
                var devicesFinal = [newDeviceParsed];
                DAL.setDevices(
                    GLOBAL.IMS + '.' + GLOBAL.CRM,
                    UTILS.toAlphaNumeric(GLOBAL.UserID) +
                    '.' +
                    UTILS.toAlphaNumeric(GLOBAL.Pass),
                    devicesFinal,
                ).then(result => { });
                return getResellerBranding();
            }
        } catch (error) {
            var newDevice = JSON.stringify({
                uuid: GLOBAL.Device_UniqueID,
                valid: moment().add(2, 'days').utc().unix(),
                model: GLOBAL.Device_Model,
                type: GLOBAL.Device_Type,
                ip: GLOBAL.Device_IpAddress,
                resellerId: GLOBAL.ResellerID,
                city: GLOBAL.City,
                state: GLOBAL.State,
                country: GLOBAL.Country,
                appversion: GLOBAL.App_Version,
            });
            var newDeviceParsed = JSON.parse(newDevice);
            var devicesFinal = [newDeviceParsed];

            DAL.setDevices(
                GLOBAL.IMS + '.' + GLOBAL.CRM,
                UTILS.toAlphaNumeric(GLOBAL.UserID) +
                '.' +
                UTILS.toAlphaNumeric(GLOBAL.Pass),
                devicesFinal,
            ).then(result => { });
            return getResellerBranding();
        }
    };
    const checkIpLock = async devices => {
        if (
            GLOBAL.UserInterface.authentication.lock_device_to_ip_address ==
            true
        ) {
            var uuidCheck = devices.filter(
                d => d.uuid == GLOBAL.Device_UniqueID,
            );
            if (uuidCheck[0].ip != GLOBAL.Device_IpAddress) {
                return true;
            }
        }
        return false;
    };
    const setRegisteredDevices = async devices => {
        var checkLock = checkIpLock(devices);
        if (checkLock == true) {
            return {
                success: false,
                error: LANG.getTranslation('no_access_ipaddress'),
            };
        } else {
            var devicesNew = devices.filter(
                element => element.uuid != GLOBAL.Device_UniqueID,
            );
            var newDevice = JSON.stringify({
                uuid: GLOBAL.Device_UniqueID,
                valid: moment().add(2, 'days').utc().unix(),
                model: GLOBAL.Device_Model,
                type: GLOBAL.Device_Type,
                ip: GLOBAL.Device_IpAddress,
                resellerId: GLOBAL.ResellerID,
                city: GLOBAL.City,
                state: GLOBAL.State,
                country: GLOBAL.Country,
                appversion: GLOBAL.App_Version,
            });
            var newDeviceParsed = JSON.parse(newDevice);
            var devicesFinal = [];
            if (devicesNew[0] == undefined) {
                devicesFinal = [newDeviceParsed];
            } else if (devicesNew.length == 1) {
                devicesFinal = [devicesNew[0], newDeviceParsed];
            } else if (devicesNew.length == 2) {
                devicesFinal = [devicesNew[0], devicesNew[1], newDeviceParsed];
            } else if (devicesNew.length == 3) {
                devicesFinal = [
                    devicesNew[0],
                    devicesNew[1],
                    devicesNew[2],
                    newDeviceParsed,
                ];
            } else if (devicesNew.length == 4) {
                devicesFinal = [
                    devicesNew[0],
                    devicesNew[1],
                    devicesNew[2],
                    devicesNew[3],
                    newDeviceParsed,
                ];
            }
            DAL.setDevices(
                GLOBAL.IMS + '.' + GLOBAL.CRM,
                UTILS.toAlphaNumeric(GLOBAL.UserID) +
                '.' +
                UTILS.toAlphaNumeric(GLOBAL.Pass),
                devicesFinal,
            ).then(result => { });
            GLOBAL.Authenticated = true;
            UTILS.storeJson('AutoLogin', true);
            return getResellerBranding();
        }
    };
    const getResellerBranding = async () => {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ResellerID +
            '_reseller.json';
        try {
            console.log('get reseller branding: ', path);
            let response = await fetch(path);
            let data = await response.json();
            console.log('get reseller branding response: ', data);
            if (data != undefined) {
                GLOBAL.Reseller = data;
                GLOBAL.Button_Color = data.selection_color;
                GLOBAL.Logo =
                    GLOBAL.HTTPvsHTTPS +
                    data.logo
                        .replace('http://', '')
                        .replace('https://', '')
                        .replace('//', '');
                GLOBAL.Background =
                    GLOBAL.HTTPvsHTTPS +
                    data.background
                        .replace('http://', '')
                        .replace('https://', '')
                        .replace('//', '');
                GLOBAL.SupportText = data.support_text;
            }
            GLOBAL.Authenticated = true;
            UTILS.storeJson('AutoLogin', true);
            return { success: true };
        } catch (error) {
            GLOBAL.Authenticated = true;
            UTILS.storeJson('AutoLogin', true);
            return { success: true };
        }
    };
    const LoadingIndicator = props => (
        <View style={[styles.indicator]}>
            <Spinner size="small" status="success" />
        </View>
    );
    const onDisclaimer = (): void => {
        navigation && navigation.navigate('Disclaimer');
    };
    return (
        <View style={{ flex: 1 }}>
            <Modal
                style={{
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.8
                        : sizes.width * 0.3,
                }}
                visible={showCloseAppModal}
                onBackdropPress={() => setShowCloseAppModal(false)}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}>
                <Card disabled={true}>
                    <Text h5 bold>
                        {LANG.getTranslation('exit_app')}
                    </Text>
                    <Text>{LANG.getTranslation('exit_app_click_again')}</Text>
                    <Text>{LANG.getTranslation('exit_app_close')}</Text>
                </Card>
            </Modal>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                }}>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 9999,
                    }}>
                    <View
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.30)',
                            borderRadius: 100,
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: 10,
                        }}>
                        <FocusButton
                            style={{ borderRadius: 100 }}
                            onPress={() => onBackToService()}>
                            <FontAwesome5
                                style={{ fontSize: 18, color: '#fff' }}
                                // icon={SolidIcons.arrowLeft}
                                name="arrow-left"
                            />
                        </FocusButton>
                    </View>
                </View>
                <View style={{ flex: 1, margin: 20 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text h4 style={styles.signInLabel} status="control">
                            {LANG.getTranslation('signin')}
                        </Text>
                        <Text style={styles.signInLabel_} status="basic">
                            {LANG.getTranslation('sigininaccount')}
                        </Text>
                    </View>
                    {GLOBAL.Show_PWA_Message && GLOBAL.Device_IsWebTvMobile && (
                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginVertical: 10,
                            }}>
                            <View
                                style={{
                                    width: sizes.width * 0.98,
                                    height: 50,
                                    backgroundColor: '#f2f8fe',
                                    borderRadius: 5,
                                }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View
                                        style={{
                                            backgroundColor: '#999',
                                            height: 40,
                                            width: 40,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: 5,
                                        }}>
                                        <Text size={35}>+</Text>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            paddingHorizontal: 5,
                                        }}>
                                        {GLOBAL.Device_IsPwaAndroidChrome &&
                                            !GLOBAL.Device_IsPwaAndroidSamsung && (
                                                <Text
                                                    size={10}
                                                    bold={true}
                                                    lineHeight={15}
                                                    color={'#333'}>
                                                    Install this App on your
                                                    phone by pressing the
                                                    settings icon followed by
                                                    'Install App'.
                                                </Text>
                                            )}
                                        {GLOBAL.Device_IsPwaIosChrome && (
                                            <Text
                                                size={10}
                                                bold={true}
                                                lineHeight={15}
                                                color={'#333'}>
                                                Did you know? That if you open
                                                this page in a Safari Browser
                                                you can install it as an App on
                                                your device.
                                            </Text>
                                        )}
                                        {GLOBAL.Device_IsPwaIosSafari && (
                                            <Text
                                                size={10}
                                                bold={true}
                                                lineHeight={15}
                                                color={'#333'}>
                                                iOS & Safari: Install this App
                                                on your phone by pressing the
                                                share icon followed by 'Add to
                                                Homescreen'.
                                            </Text>
                                        )}
                                        {GLOBAL.Device_IsPwaAndroidSamsung && (
                                            <Text
                                                size={10}
                                                bold={true}
                                                lineHeight={15}
                                                color={'#333'}>
                                                Install this App on your phone
                                                by pressing the setting icon
                                                followed by 'Add page to' and
                                                then 'Home screen'.
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View
                                style={{
                                    transform: [{ rotateZ: '45deg' }],
                                    width: 20,
                                    height: 20,
                                    backgroundColor: '#f2f8fe',
                                    marginTop: -10,
                                }}></View>
                        </View>
                    )}
                    <View
                        style={[
                            {
                                flex: 1,
                                flexDirection: 'row',
                                alignSelf: 'center',
                                width: sizes.width,
                            },
                        ]}>
                        <View
                            style={[
                                {
                                    flex: 1,
                                    justifyContent: 'flex-start',
                                    margin: 10,
                                    paddingTop: 50,
                                },
                            ]}>
                            <Text style={{ color: 'red' }} status="basic">
                                {error}
                            </Text>
                            <Input
                                style={{
                                    backgroundColor: 'transparent',
                                    margin: 5,
                                    marginHorizontal: 15,
                                }}
                                status="control"
                                placeholder={LANG.getTranslation('userid')}
                                accessoryLeft={PersonIcon}
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setError('')}
                                underlineColorAndroid="transparent"
                            />
                            <Input
                                style={{
                                    backgroundColor: 'transparent',
                                    margin: 5,
                                    marginHorizontal: 15,
                                }}
                                status="control"
                                placeholder={LANG.getTranslation('password')}
                                accessoryLeft={LockIcon}
                                accessoryRight={renderPasswordIcon}
                                value={password}
                                secureTextEntry={!passwordVisible}
                                onChangeText={setPassword}
                                onFocus={() => setError('')}
                                underlineColorAndroid="transparent"
                            />
                            <View style={[styles.forgotPasswordContainer, {}]}>
                                <Button
                                    style={styles.signUpButton}
                                    appearance="ghost"
                                    status="control"
                                    onPress={onForgotPasswordButtonPress}>
                                    {LANG.getTranslation('forgot_password')}
                                </Button>
                            </View>
                            <View style={[styles.forgotPasswordContainer, {}]}>
                                {GLOBAL.Disclaimer != '' && (
                                    <Button
                                        style={[styles.signUpButton, {}]}
                                        appearance="ghost"
                                        status="control"
                                        onPress={onDisclaimer}>
                                        {LANG.getTranslation('read_disclaimer')}
                                    </Button>
                                )}
                            </View>
                            <View>
                                <Button
                                    accessoryRight={
                                        authenticating ? LoadingIndicator : null
                                    }
                                    style={[styles.signInButton]}
                                    size="giant"
                                    onPress={onSignIn}>
                                    {authenticating
                                        ? ''
                                        : LANG.getTranslation('sign_in')}
                                </Button>
                            </View>
                        </View>
                        <View style={[{ flex: 1 }]}>
                            {GLOBAL.Support != '' ? (
                                <View
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(0, 0, 0, 0.30)',
                                        borderRadius: 5,
                                        margin: 10,
                                        padding: 10,
                                    }}>
                                    <ScrollView>
                                        <HTML
                                            source={{
                                                html: Decode(GLOBAL.Support),
                                            }}
                                            baseFontStyle={{
                                                color: '#fff',
                                                fontSize: 16,
                                            }}
                                        />
                                    </ScrollView>
                                </View>
                            ) : (
                                <View></View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    formContainer: {
        flex: 1,
        marginTop: 0,
        paddingHorizontal: 16,
    },
    signInLabel: {},
    signInLabel_: {},
    signInButton: {
        marginHorizontal: 16,
        marginVertical: 2,
    },
    signUpButton: {
        marginVertical: 0,
        marginHorizontal: 16,
    },
    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    passwordInput: {
        marginTop: 16,
    },
    forgotPasswordButton: {
        paddingHorizontal: 0,
        paddingLeft: 50,
        fontSize: 10,
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
