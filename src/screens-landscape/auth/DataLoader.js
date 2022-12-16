import React, {Component} from 'react';
import {Text, View} from 'react-native';
import TimerMixin from 'react-timer-mixin';
import {Actions} from 'react-native-router-flux';
import DropdownAlert from 'react-native-dropdownalert';
import LangCodes from '../../languages/language_codes';
import EStyleSheet from 'react-native-extended-stylesheet';
import {sendPageReport} from '../../reporting/reporting';

export default class DataLoader extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        GLOBAL.Focus = 'Outside';
        this.state = {
            reportStartTime: moment().unix(),
            loaderText: '3%',
            userid: GLOBAL.UserID,
            password: GLOBAL.Pass,
            updates: [],
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        return true;
    };
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        this.getUserIp();
    }
    componentWillUnmount() {
        sendPageReport(
            'App Loader',
            this.state.reportStartTime,
            moment().unix(),
        );
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
    }
    getUserIp() {
        this.getJson(
            GLOBAL.GET_USER_IP + '?_=' + moment().unix(),
        )
            .then(data => {
                if (data != undefined) {
                    GLOBAL.Device_IpAddress = data.ip;
                    this.getAccessToken();
                } else {
                    this.getUserIpFailBack();
                }
            })
            .catch(error => {
                this.getUserIpFailBack();
            });
    }
    getUserIpFailBack() {
        this.getJson(
            GLOBAL.USER_IP_FAIL_BACK_URL + '?apiKey=at_1hR71IevRJgz9lGCdYFdju173gYvC',
        )
            .then(data => {
                if (data != undefined) {
                    GLOBAL.Device_IpAddress = data.ip;
                    this.getAccessToken();
                } else {
                    GLOBAL.Show_Error =
                        'We can not get your IP Address try with or without VPN';
                    GLOBAL.AutoLogin = false;
                    if (this.dropdown == undefined) {
                        Actions.Authentication();
                    } else {
                        this.dropdown.alertWithType(
                            'error',
                            'Error',
                            LANG.getTranslation('error_1_1'),
                        );
                    }
                }
            })
            .catch(error => {
                GLOBAL.Show_Error =
                    'We can not get your IP Address try with or without VPN' +
                    error;
                GLOBAL.AutoLogin = false;
                if (this.dropdown == undefined) {
                    Actions.Authentication();
                } else {
                    this.dropdown.alertWithType(
                        'error',
                        'Error',
                        LANG.getTranslation('error_1_1'),
                    );
                }
            });
    }
    getAccessToken() {
        var path =
            '/' +
            GLOBAL.IMS +
            '/customers/' +
            UTILS.toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
            '/' +
            UTILS.toAlphaNumeric(GLOBAL.Pass) +
            '.json';
        GLOBAL.Show_Error = '';
        DAL.getUserHash(path)
            .then(data => {
                DAL.getUserToken(data.CID)
                    .then(token => {
                        if (!token.CID) {
                            GLOBAL.AutoLogin = false;
                            GLOBAL.Show_Error = LANG.getTranslation(
                                'no_access_wrong_cred',
                            );
                            if (this.dropdown == undefined) {
                                Actions.Authentication();
                            } else {
                                this.dropdown.alertWithType(
                                    'error',
                                    'Error',
                                    LANG.getTranslation('error_1_1'),
                                );
                            }
                        } else {
                            GLOBAL.USER_TOKEN = token.CID;
                            this.getUser(token.CID);
                        }
                    })
                    .catch(error => {
                        GLOBAL.Show_Error =
                            LANG.getTranslation('no_access_cloud_error') +
                            ' 1.2';
                        GLOBAL.AutoLogin = false;
                        if (this.dropdown == undefined) {
                            Actions.Authentication();
                        } else {
                            this.dropdown.alertWithType(
                                'error',
                                'Error',
                                LANG.getTranslation('error_1_2'),
                            );
                        }
                    });
            })
            .catch(error => {
                GLOBAL.Show_Error =
                    LANG.getTranslation('no_access_cloud_error') + ' 1.3';
                GLOBAL.AutoLogin = false;
                if (this.dropdown == undefined) {
                    Actions.Authentication();
                } else {
                    this.dropdown.alertWithType(
                        'error',
                        'Error',
                        LANG.getTranslation('error_1_3'),
                    );
                }
            });
    }
    getUser(token) {
        var path =
            '/' +
            GLOBAL.IMS +
            '/customers/' +
            UTILS.toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
            '/' +
            UTILS.toAlphaNumeric(GLOBAL.Pass) +
            '.json';
        DAL.getDataToken(path, token)
            .then(data => {
                DAL.getData(data.CID)
                    .then(user => {
                        user = JSON.parse(user);
                        var expiring = moment(
                            new Date(user.account.datetime_expired),
                        ).format('X');
                        var current = moment().format('X');
                        var expireTime = expiring - current;

                        GLOBAL.User = user;
                        GLOBAL.User_Currency = user.customer.currency;
                        if (user.account.account_status == 'Disabled') {
                            GLOBAL.AutoLogin = false;
                            GLOBAL.Show_Error = LANG.getTranslation(
                                'no_access_account_disabled',
                            );
                            this.dropdown.alertWithType(
                                'error',
                                'Error',
                                LANG.getTranslation('error_1_1_1'),
                            );
                        } else if (
                            user.account.account_status == 'Expired' ||
                            expireTime < 3600
                        ) {
                            GLOBAL.AutoLogin = false;
                            GLOBAL.Show_Error = LANG.getTranslation(
                                'no_access_account_expired',
                            );
                            this.dropdown.alertWithType(
                                'error',
                                'Error',
                                LANG.getTranslation('error_1_1_2'),
                            );
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
                            //GLOBAL.PPV = user.payperview;
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
                                        GLOBAL.Messages.splice(
                                            0,
                                            0,
                                            new_message,
                                        );
                                    }
                                });
                            }
                            var qty = GLOBAL.Messages.filter(
                                m => m.read == false,
                            );
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
                                this.getUserLocation();
                            } else {
                                this.getUserLocation();
                            }
                        }
                    })
                    .catch(error => {
                        GLOBAL.AutoLogin = false;
                        GLOBAL.Show_Error =
                            LANG.getTranslation('no_access_cloud_error') +
                            ' 1.3';
                        if (this.dropdown == undefined) {
                            Actions.Authentication();
                        } else {
                            this.dropdown.alertWithType(
                                'error',
                                'Error',
                                LANG.getTranslation('error_1_1_3'),
                            );
                        }
                    });
            })
            .catch(error => {
                GLOBAL.AutoLogin = false;
                GLOBAL.Show_Error =
                    LANG.getTranslation('no_access_cloud_error') + ' 1.4';
                if (this.dropdown == undefined) {
                    Actions.Authentication();
                } else {
                    this.dropdown.alertWithType(
                        'error',
                        'Error',
                        LANG.getTranslation('error_1_1_4'),
                    );
                }
            });
    }
    getUserLocation() {
        this.getJson(
            GLOBAL.USER_IP_FAIL_BACK_URL + '?apiKey=at_1hR71IevRJgz9lGCdYFdju173gYvC',
        )
            .then(data => {
                if (data != undefined) {
                    GLOBAL.City = data.location.city;
                    GLOBAL.State = data.location.region;
                    GLOBAL.Country =
                        LangCodes.languageCodes.find(
                            l => l.code == data.location.country,
                        ).name != undefined
                            ? LangCodes.languageCodes.find(
                                  l => l.code == data.location.country,
                              ).name
                            : 'United States';
                    GLOBAL.Latitude = data.location.lat;
                    GLOBAL.Longitude = data.location.lng;

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
                    this.getAccessLocation();
                } else {
                    this.getUserLocationFailback();
                }
            })
            .catch(error => {
                GLOBAL.Show_Error =
                    LANG.getTranslation('no_access_vpn') + error;
                GLOBAL.AutoLogin = false;
                if (this.dropdown == undefined) {
                    Actions.Authentication();
                } else {
                    this.dropdown.alertWithType(
                        'error',
                        'Error',
                        LANG.getTranslation('error_1_1'),
                    );
                }
            });
    }
    getUserLocationFailback() {
        this.getJson(
            GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/location.php?_=' +
                moment().unix(),
        )
            .then(data => {
                if (data != undefined) {
                    var city = data.city.toLowerCase();
                    city = data.city.charAt(0).toUpperCase() + city.slice(1);
                    GLOBAL.City = city;
                    GLOBAL.State = '';
                    GLOBAL.Country =
                        LangCodes.languageCodes.find(
                            l => l.code == data.country,
                        ).name != undefined
                            ? LangCodes.languageCodes.find(
                                  l => l.code == data.country,
                              ).name
                            : 'United States';
                    GLOBAL.Latitude = data.latitude;
                    GLOBAL.Longitude = data.longitude;
                    this.getAccessLocation();
                } else {
                    this.getUserLocationFailback();
                }
            })
            .catch(error => {
                this.getUserLocationFailback();
            });
    }

    getAccessLocation() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/whitelisted_' +
            GLOBAL.ProductID +
            '_v2.json';
        this.getJson(path)
            .then(data => {
                if (data != null && data != undefined) {
                    var checkCountry = data.geoaccess.find(
                        c => c.country == GLOBAL.Country,
                    );
                    if (
                        data.geoaccess.length == 0 &&
                        data.whitelisted.length == 0
                    ) {
                        this.getProduct();
                    } else if (
                        checkCountry != undefined ||
                        data.whitelisted.length != 0
                    ) {
                        if (data.whitelisted.length > 0) {
                            this.range = data.whitelisted || [];
                            var check = false;
                            for (var i = 0; i < this.range.length; i++) {
                                if (
                                    this.isInRange(
                                        GLOBAL.Device_IpAddress,
                                        this.range[i].start,
                                        this.range[i].end,
                                    )
                                ) {
                                    check = true;
                                    this.getProduct();
                                }
                            }
                            if (check == false) {
                                GLOBAL.Show_Error =
                                    LANG.getTranslation('no_access_ip');
                                GLOBAL.AutoLogin = false;
                                if (this.dropdown == undefined) {
                                    Actions.Authentication();
                                } else {
                                    this.dropdown.alertWithType(
                                        'error',
                                        'Error',
                                        LANG.getTranslation('error_1_1'),
                                    );
                                }
                            }
                        } else {
                            this.getProduct();
                        }
                    } else {
                        GLOBAL.Show_Error =
                            LANG.getTranslation('no_access_country') +
                            GLOBAL.Country;
                        GLOBAL.AutoLogin = false;
                        if (this.dropdown == undefined) {
                            Actions.Authentication();
                        } else {
                            this.dropdown.alertWithType(
                                'error',
                                'Error',
                                LANG.getTranslation('error_1_1'),
                            );
                        }
                    }
                } else {
                    // GLOBAL.AutoLogin = false;
                    // GLOBAL.Show_Error = "Cloud Server Error 1.4";
                    // this.dropdown.alertWithType('error', 'Error', LANG.getTranslation("error_1_1_4"));
                    this.getProduct();
                }
            })
            .catch(error => {
                this.getProduct();
            });
    }
    isInRange(address, a, b) {
        address = this.str2int(address);
        a = this.str2int(a);
        b = this.str2int(b);
        return a <= address && address <= b;
    }
    str2int(str) {
        var temp = str.split('.');
        return (
            (parseInt(temp[0], 10) << 24) +
            (parseInt(temp[1], 10) << 16) +
            (parseInt(temp[2], 10) << 8) +
            parseInt(temp[3], 10)
        );
    }
    getProduct() {
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
        this.getJson(path)
            .then(product => {
                GLOBAL.App_Theme = product.ui;
                //GLOBAL.App_Theme = 'Rhodium';
                // GLOBAL.App_Theme = 'Iridium';
                //  GLOBAL.App_Theme = 'Honua';
                //GLOBAL.App_Theme = 'Akua';
                //GLOBAL.App_Theme = 'Palladium';
                //GLOBAL.App_Theme = 'Titanium';

                if (
                    GLOBAL.App_Theme != 'Akua' &&
                    GLOBAL.App_Theme != 'Honua' &&
                    GLOBAL.App_Theme != 'Rhodium' &&
                    GLOBAL.App_Theme != 'Iridium' &&
                    GLOBAL.App_Theme != 'Palladium' &&
                    GLOBAL.App_Theme != 'Titanium'
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
                        GLOBAL.DRM_AccountID =
                            product.drm.irdeto_drm.account_id;
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
                if (
                    product.show_clock == true &&
                    GLOBAL.Clock_Not_Set == false
                ) {
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
                // var menuSearch = {
                //     is_app: false,
                //     is_default: false,
                //     is_module: false,
                //     module_name: null,
                //     name: "Search",
                //     package_name: null,
                //     package_url: null,
                //     position: 9998,
                //     type: "full",
                // }

                //GLOBAL.Menu.splice(0, 0, menuSearch);
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
                    GLOBAL.AutoLogin = false;
                    GLOBAL.Show_Error = LANG.getTranslation('no_access_device');
                    if (this.dropdown == undefined) {
                        Actions.Authentication();
                    } else {
                        this.dropdown.alertWithType(
                            'error',
                            'Error',
                            LANG.getTranslation('error_2_1'),
                        );
                    }
                } else {
                    if (GLOBAL.ResellerID == 0) {
                        this.getSettingsGui();
                    } else {
                        this.getResellerBranding();
                    }
                }
            })
            .catch(error => {
                GLOBAL.Show_Error = LANG.getTranslation('no_access_product');
                GLOBAL.AutoLogin = false;
                if (this.dropdown == undefined) {
                    Actions.Authentication();
                } else {
                    this.dropdown.alertWithType(
                        'error',
                        'Error',
                        LANG.getTranslation('error_2_2'),
                    );
                }
            });
    }

    getResellerBranding() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ResellerID +
            '_reseller.json';
        this.getJson(path)
            .then(data => {
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
                this.getSettingsGui();
            })
            .catch(error => {
                this.getSettingsGui();
            });
    }
    getSettingsGui() {
        var path =
            GLOBAL.GuiBaseUrl +
            GLOBAL.Product.base_start_url +
            '/settings/settings.json';
        DAL.getGuiSettings(path)
            .then(settings => {
                settings = JSON.parse(settings);
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
                GLOBAL.Sleep_Mode =
                    GLOBAL.UserInterface.general.sleep_mode_setting;

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
                                  GLOBAL.Device_IsPhone
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
                                : GLOBAL.Device_Manufacturer == 'Apple'
                                ? 75
                                : GLOBAL.Device_IsAppleTV
                                ? 100
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
                                : GLOBAL.Device_IsPhone
                                ? '3.5rem'
                                : GLOBAL.Device_IsAppleTV
                                ? '7rem'
                                : '5rem',
                    });
                }
                this.getSupportMenu();
            })
            .catch(error => {
                this.getSupportMenu();
            });
    }
    getSupportMenu() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/product_support.json';
        this.getJson(path)
            .then(data => {
                if (data != undefined) {
                    GLOBAL.SupportPages = data;
                }
                this.getRegisteredDevices();
            })
            .catch(error => {
                this.getRegisteredDevices();
            });
    }
    getRegisteredDevices() {
        DAL.getDevices(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            UTILS.toAlphaNumeric(GLOBAL.UserID) +
                '.' +
                UTILS.toAlphaNumeric(GLOBAL.Pass),
        )
            .then(devices => {
                if (devices.devices != undefined) {
                    var uuidCheck = devices.devices.filter(
                        d => d.uuid == GLOBAL.Device_UniqueID,
                    );
                    if (uuidCheck.length > 0) {
                        this.setRegisteredDevices(devices.devices);
                    } else {
                        var today = moment().utc().unix();
                        var devicesNotToOld = devices.devices.filter(
                            d => d.valid > today,
                        );
                        if (GLOBAL.Max_Devices > devicesNotToOld.length) {
                            this.setRegisteredDevices(devicesNotToOld);
                        } else {
                            GLOBAL.AutoLogin = false;
                            GLOBAL.Show_Error = LANG.getTranslation(
                                'no_access_max_concurrent',
                            );
                            if (this.dropdown == undefined) {
                                Actions.Authentication();
                            } else {
                                this.dropdown.alertWithType(
                                    'error',
                                    'Error',
                                    LANG.getTranslation('error_2_4'),
                                );
                            }
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
                    ).then(result => {});
                    this.getUpdates();
                }
            })
            .catch(error => {
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
                ).then(result => {});
                this.getUpdates();
            });
    }
    checkIpLock(devices) {
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
    }
    setRegisteredDevices(devices) {
        var checkLock = this.checkIpLock(devices);
        if (checkLock == true) {
            GLOBAL.AutoLogin = false;
            GLOBAL.Show_Error = LANG.getTranslation('no_access_ipaddress');
            this.dropdown.alertWithType(
                'error',
                'Error',
                'Your IP Address is Unknown',
            );
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
            ).then(result => {});
            this.getUpdates();
        }
    }

    //get content updates
    getUpdates() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.User.products.productid +
            '_update.json';
        DAL.getJson(path)
            .then(data => {
                if (data != undefined) {
                    if (
                        GLOBAL.UI_LoadedTZ <
                        Math.round(moment().format('x') / 1000)
                    ) {
                        var test = GLOBAL.Updates.find(
                            u => u.time == data.time,
                        );
                        if (test == null) {
                            GLOBAL.Updates.push({time: data.time});
                            UTILS.storeJson('Updates', GLOBAL.Updates);
                        }
                    }
                }
                this.getContent();
            })
            .catch(error => {
                this.getContent();
            });
    }

    //loading content starts
    async getContent() {
        try {
            const responses = await Promise.all([
                this.getContentTags(),
                this.getChannelData(),
                this.getEpgData(0),
                this.getSeriesData(0),
                this.getMovieStores(),
                this.getEducationData(0),
                this.getMusicAlbums(),
                this.getHome(),
            ]);
            this.openProfiles();
        } catch (error) {
            return [];
        }
    }

    async getContentTags() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.User.products.productid +
            '_tags.json';
        this.getJson(path)
            .then(data => {
                if (data != undefined) {
                    GLOBAL.Tags = data;
                }
                return {success: true};
            })
            .catch(error => {
                return {success: true};
            });
    }
    async getChannelData() {
        if (UTILS.checkMenuExists('Channels') == false) {
            return;
        }
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_product_channels_v2.json';
        this.getJson(path)
            .then(result => {
                var data = result;
                GLOBAL.Channels = data.tv;
                GLOBAL.Channels_Selected = data.tv[0].channels;
                GLOBAL.Channels_Selected_Category_ID = data.tv[0].id;
                GLOBAL.Channels_Selected_Category_Index =
                    UTILS.getCategoryIndex(
                        GLOBAL.Channels_Selected_Category_ID,
                    );
                if (GLOBAL.User.products.ChannelPackages.length > 0) {
                    return this.getExtraChannelPackage(0);
                } else {
                    return {success: true};
                }
            })
            .catch(error => {
                return {success: true};
            });
    }
    async getExtraChannelPackage(id) {
        if (id < GLOBAL.User.products.ChannelPackages.length) {
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                GLOBAL.User.products.ChannelPackages[id].PackageID +
                '_package_tv_v2.json';
            this.getJson(path)
                .then(result => {
                    var data = result.tv;
                    data.forEach(function (category) {
                        var test = GLOBAL.Channels.find(
                            cat => cat.name == category.name,
                        );
                        if (test == undefined) {
                            GLOBAL.Channels.push(category);
                        } else {
                            var channels = category.channels;
                            channels.forEach(channel => {
                                var test_ = test.channels.find(
                                    ch => ch.channel_id == channel.channel_id,
                                );
                                if (test_ == undefined) {
                                    test.channels.push(channel);
                                }
                            });
                        }
                    });
                    return this.getExtraChannelPackage(id + 1);
                })
                .catch(error => {
                    return {success: true};
                });
        } else {
            return {success: true};
        }
    }
    async getEpgData(days) {
        if (UTILS.checkMenuExists('Channels') == false) {
            return;
        }
        GLOBAL.SeriesStores = [];
        const date = moment().subtract(days, 'days').format('DD_MM_YYYY');
        const test = moment().subtract(days, 'days').format('YYYY');
        if (test < 2020) {
            GLOBAL.AutoLogin = false;
            GLOBAL.App_Theme = 'Default';
            GLOBAL.Show_Error = LANG.getTranslation('no_access_date_time');
            this.dropdown.alertWithType(
                'error',
                'Error',
                LANG.getTranslation('error_3_1'),
            );
        } else {
            GLOBAL.EPG = [];
            GLOBAL.EPG_TODAY = [];
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CRM +
                '/' +
                date +
                '_' +
                GLOBAL.ProductID +
                '_product_epg_v4.json?t=' +
                new Date().getTime();
            this.getJson(path)
                .then(result => {
                    var data = result;
                    GLOBAL.EPG = data.channels;
                    GLOBAL.EPG_TODAY = GLOBAL.EPG;
                    GLOBAL.EPG_DATE_LOADED = date;
                    if (GLOBAL.User.products.ChannelPackages.length > 0) {
                        return this.getExtraEpg(0, 0);
                    } else {
                        return {success: true};
                    }
                })
                .catch(error => {
                    return {success: true};
                });
        }
    }
    async getExtraEpg(days, id) {
        if (id < GLOBAL.User.products.ChannelPackages.length) {
            const date = moment().subtract(days, 'days').format('DD_MM_YYYY');
            const test = moment().subtract(days, 'days').format('YYYY');
            if (test < 2019) {
                GLOBAL.App_Theme = 'Default';
                GLOBAL.AutoLogin = false;
                GLOBAL.Show_Error = LANG.getTranslation('no_access_date_time');
                this.dropdown.alertWithType(
                    'error',
                    'Error',
                    LANG.getTranslation('error_3_1'),
                );
            } else {
                var path =
                    GLOBAL.CDN_Prefix +
                    '/' +
                    GLOBAL.IMS +
                    '/jsons/' +
                    GLOBAL.CMS +
                    '/' +
                    date +
                    '_' +
                    GLOBAL.User.products.ChannelPackages[id].PackageID +
                    '_package_epg_v4.json?t=' +
                    new Date().getTime();
                this.getJson(path)
                    .then(result => {
                        var data = result;
                        data.channels.forEach(function (element) {
                            GLOBAL.EPG = GLOBAL.EPG.concat(element);
                            GLOBAL.EPG_TODAY = GLOBAL.EPG_TODAY.concat(element);
                        });
                        GLOBAL.EPG_DATE_LOADED = date;
                        if (GLOBAL.User.products.ChannelPackages.length > 0) {
                            return this.getExtraEpg(0, id + 1);
                        } else {
                            return {success: true};
                        }
                    })
                    .catch(error => {
                        return {success: true};
                    });
            }
        } else {
            return {success: true};
        }
    }

    async getSeriesData(index) {
        if (UTILS.checkMenuExists('Series') == false) {
            return;
        }
        var stores = GLOBAL.Product.SeriesStores;
        if (stores != undefined && stores.length > 0) {
            if (stores[index] != undefined) {
                return this.getSeriesStores(
                    stores[index].PackageID,
                    index,
                    stores.length,
                );
            } else {
                return {success: true};
            }
        } else {
            return {success: true};
        }
    }
    async getSeriesStores(storeId, index, maxstores) {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CMS +
            '/' +
            storeId +
            '_series_stores_v2.json';
        this.getJson(path)
            .then(result => {
                var data = result;
                if (data.seriestore && data.seriestore.length > 0) {
                    data.seriestore.forEach(item => {
                        GLOBAL.SeriesStores.push(item);
                    });
                }
                index = index + 1;
                if (index == maxstores) {
                    return {success: true};
                } else {
                    this.getSeriesData(index);
                }
            })
            .catch(error => {
                return {success: true};
            });
    }
    async getEducationData(index) {
        if (UTILS.checkMenuExists('Education') == false) {
            return;
        }
        var stores = GLOBAL.Product.EducationPackages;
        if (stores != undefined && stores.length > 0) {
            if (stores[index] != undefined) {
                return this.getEducationStores(
                    stores[index].PackageID,
                    index,
                    stores.length,
                );
            } else {
                return {success: true};
            }
        } else {
            return {success: true};
        }
    }
    async getEducationStores(storeId, index, maxstores) {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CMS +
            '/' +
            storeId +
            '_course_levels_v2.json';
        this.getJson(path)
            .then(result => {
                var data = result;
                if (data.courselevels && data.courselevels.length > 0) {
                    data.courselevels.forEach(item => {
                        GLOBAL.EducationStores.push(item);
                    });
                }
                index = index + 1;
                if (index == maxstores) {
                    return {success: true};
                } else {
                    return this.getEducationData(index);
                }
            })
            .catch(error => {
                return {success: true};
            });
    }
    async getMovieStores() {
        if (UTILS.checkMenuExists('Movies') == false) {
            return;
        }
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_product_movies_v2.json';
        this.getJson(path)
            .then(result => {
                var data = result;
                if (data != undefined) {
                    GLOBAL.MovieStores = data.vodstore;
                }
                GLOBAL.Focus = 'Home';
                return {success: true};
            })
            .catch(error => {
                return {success: true};
            });
    }
    async getMusicAlbums() {
        if (UTILS.checkMenuExists('Music') == false) {
            return;
        }
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_product_albums_v2.json';
        DAL.getJson(path)
            .then(data => {
                if (data != undefined) {
                    GLOBAL.Album_Categories = data.categories;
                    GLOBAL.Albums = data.categories[0].albums;
                }
                return {success: true};
            })
            .catch(error => {
                return {success: true};
            });
    }
    async getHome() {
        GLOBAL.UI_LoadedTZ = Math.round(moment().format('x') / 1000);
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_metro_v2.json';
        this.getJson(path)
            .then(data => {
                GLOBAL.Metro = data;
                return {success: true};
            })
            .catch(error => {
                return {success: true};
            });
    }
    async getJson(path) {
        var myHeaders = new Headers();
        if (GLOBAL.Device_IsWebTV == false) {
            myHeaders.set(
                'Cache-Control',
                'no-cache, no-store, must-revalidate',
            );
            myHeaders.set('Pragma', 'no-cache, no-store');
            myHeaders.set('Cache', 'no-store, no-cache');
            myHeaders.set('Expires', 0);
            myHeaders.set('Accept-Encoding', 'gzip;q=1.0, compress;q=0.5');
        }
        try {
            GLOBAL.show_log && console.log('get json: ', path);
            const jsonCall = await fetch(path, {
                method: 'GET',
                headers: myHeaders,
                compress: true,
                cors: 'no-cors',
            });
            const json_ = await jsonCall;
            GLOBAL.show_log && console.log('get json response: ', json_.json());
            return json_.json();
        } catch (err) {}
    }
    openProfiles() {
        // TimerMixin.clearTimeout(this.home);
        // this.home = TimerMixin.setTimeout(() => {
        if (GLOBAL.Device_IsWebTV) {
            Actions.Sizing();
            GLOBAL.Focus = 'Home';
        } else {
            if (Platform.OS == 'android') {
                clear.clearAppCache(() => {
                    Actions.Sizing();
                    GLOBAL.Focus = 'Home';
                });
            } else {
                Actions.Sizing();
                GLOBAL.Focus = 'Home';
            }
        }
        // }, 500)
    }
    setLoaderText(loaderText_) {}
    onClose(data) {
        Actions.Authentication();
    }
    render() {
        return (
            <Container hide_menu={true} hide_header={true}>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Loader
                            size={'large'}
                            color={'#e0e0e0'}
                            style={styles.Shadow}
                        />
                    </View>

                    <DropdownAlert
                        ref={ref => (this.dropdown = ref)}
                        onClose={data => this.onClose(data)}
                    />
                </View>

                {/* <View style={{ position: 'absolute', alignSelf: 'center', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.Loader, styles.Shadow]}>{this.state.loaderText}</Text>
                </View> */}
            </Container>
        );
    }
}
