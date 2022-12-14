import { Dimensions, Platform, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Orientation from 'react-native-orientation';
import DeviceInfo from 'react-native-device-info';
import TimerMixin from 'react-timer-mixin';
import EStyleSheet from 'react-native-extended-stylesheet';

class DeviceInformation {
    checkAndroidTVDevices(model) {
        var check = false;
        if (GLOBAL.Devices.android != undefined) {
            GLOBAL.Devices.android.atv.forEach(element => {
                if (element.model == model) {
                    check = true;
                }
            });
        }
        return check;
    }
    checkAndroidStickDevices(model) {
        var check = false;
        if (GLOBAL.Devices.android != undefined) {
            GLOBAL.Devices.android.sticks.forEach(element => {
                if (element.model == model) {
                    check = true;
                }
            });
        }
        return check;
    }
    getDeviceInformation = () => {
        if (GLOBAL.Package == '') {
            var parsedUrl = new URL(window.location.href);
            GLOBAL.Package = parsedUrl.hostname;
            GLOBAL.HTTPvsHTTPS = parsedUrl.protocol + '//';
        }

        if (GLOBAL.IsWebTV == true) {
            var parsedUrl = new URL(window.location.href);
            if (
                parsedUrl.hostname != '0.0.0.0' &&
                parsedUrl.hostname != 'localhost'
            ) {
                GLOBAL.Package = parsedUrl.hostname;
                GLOBAL.HTTPvsHTTPS = parsedUrl.protocol + '//';
            } else {
                GLOBAL.Package = 'webtv.userinterface.tv';
                GLOBAL.HTTPvsHTTPS = parsedUrl.protocol + '//';
            }
        }

        var manufacturer = DeviceInfo.getSystemName();
        if (manufacturer == 'Android') {
            PlayServices.checkPlayServicesStatus().then(result => {
                switch (result) {
                    case PlayServices.GooglePlayServicesStatus.GMS_DISABLED:
                        GLOBAL.PlayServices = false;
                    case PlayServices.GooglePlayServicesStatus.INVALID:
                        GLOBAL.PlayServices = false;
                    case PlayServices.GooglePlayServicesStatus.AVAILABLE:
                        GLOBAL.PlayServices = true;
                }
            });
        }

        // var path = "https://cloudtv.akamaized.net/userinterfaces/devices.json?t=" + moment().unix();
        // DAL.getJson(path)
        //     .then((data) => {
        //         if (data != undefined) {
        //             GLOBAL.Devices = data;
        //             await this.loadApp((results) => {
        //                 return results
        //             });
        //         } else {
        //             GLOBAL.Devices = null;
        //             await this.loadApp((results) => {
        //                 return results
        //             });
        //         }
        //     })
        //     .catch((error) => {
        //         await this.loadApp((results) => {
        //             return results
        //         });
        //     });

        return DeviceInfo.getManufacturer().then(manufacturer => {

            GLOBAL.Device_Manufacturer = manufacturer;
            GLOBAL.Device_OS_Version = DeviceInfo.getSystemVersion();
            GLOBAL.Device_Model = DeviceInfo.getModel();
            GLOBAL.Device_OS_Version = DeviceInfo.getSystemVersion();
            GLOBAL.Device_UUID = DeviceInfo.getUniqueId();
            console.log('GLOBAL =====> ', GLOBAL);
            if (Platform.isTVOS) {
                return this.getDevice();
            } else {
                DeviceInfo.getSerialNumber().then(serial => {
                    GLOBAL.Device_Serial = serial;
                    DeviceInfo.getUserAgent().then(ua => {
                        GLOBAL.Device_UserAgent = ua;
                        GLOBAL.User_Agent = ua;
                        DeviceInfo.getMacAddress().then(mac => {
                            GLOBAL.Device_MacAddress = mac;
                            return this.getDevice();
                        });
                    });
                });
            }
        });
    };
    getDevice() {
        if (GLOBAL.Device_Manufacturer == 'Apple') {
            GLOBAL.Device_System = 'Apple';
            GLOBAL.Device_IsWebTV = false;
            if (DeviceInfo.isTablet() == true) {
                GLOBAL.Device_FormFactor = 'TABLET';
                GLOBAL.Device_IsTV = false;
                GLOBAL.Device_IsPhone = false;
                GLOBAL.Device_IsTablet = true;
                GLOBAL.Device_Type = '_Ipad';
                GLOBAL.Device_Category = 'mobile';
                GLOBAL.Device_UniqueID = GLOBAL.Device_UUID;
            } else if (Platform.isTVOS == true) {
                GLOBAL.Device_FormFactor = 'TV';
                GLOBAL.Device_IsPhone = false;
                GLOBAL.Device_IsTV = true;
                GLOBAL.Device_IsTablet = false;
                GLOBAL.Device_IsAppleTV = true;
                GLOBAL.Device_Type = '_Apple_TV';
                GLOBAL.Device_Category = 'mediaplayer';
                GLOBAL.Device_UniqueID = GLOBAL.Device_UUID;
            } else {
                GLOBAL.Orientation = 'PORTRAIT';
                GLOBAL.Device_FormFactor = 'PHONE';
                if (
                    GLOBAL.Device_Model == 'iPhone SE' ||
                    GLOBAL.Device_Model == 'iPhone 6' ||
                    GLOBAL.Device_Model == 'iPhone 5s' ||
                    GLOBAL.Device_Model == 'iPhone 5' ||
                    GLOBAL.Device_Model == 'iPhone 4s' ||
                    GLOBAL.Device_Model == 'iPhone 4'
                ) {
                    GLOBAL.Device_IsSmallScreen = true;
                }
                GLOBAL.Device_IsPhone = true;
                GLOBAL.Device_IsTV = false;
                GLOBAL.Device_IsTablet = false;
                GLOBAL.Device_Type = '_AppleHandheld';
                GLOBAL.Device_Category = 'mobile';
                GLOBAL.Device_UniqueID = GLOBAL.Device_UUID;
                GLOBAL.Device_HasNotch = DeviceInfo.hasNotch();
            }
        }

        if (DeviceInfo.getSystemName() == 'Android') {
            GLOBAL.Device_System = 'Android';
            GLOBAL.Device_IsAndroidTV = Platform.isTV;
            GLOBAL.Device_IsWebTV = false;
            if (
                (DeviceInfo.isTablet() == true &&
                    GLOBAL.Device_MacAddress == '02:00:00:00:00:00') ||
                GLOBAL.Device_MacAddress == '0'
            ) {
                GLOBAL.Device_FormFactor = 'TABLET';
                GLOBAL.Device_IsTablet = true;
                GLOBAL.Device_IsTV = false;
                GLOBAL.Device_IsPhone = false;
                GLOBAL.Device_Type = '_Android_Tablet';
                GLOBAL.Device_Category = 'mobile';
            } else if (
                GLOBAL.Device_MacAddress != '02:00:00:00:00:00' &&
                GLOBAL.Device_MacAddress != ''
            ) {
                GLOBAL.Device_FormFactor = 'TV';
                GLOBAL.Device_MacAddress = GLOBAL.Device_MacAddress;
                GLOBAL.Device_IsPhone = false;
                GLOBAL.Device_IsTablet = false;
                GLOBAL.Device_IsTV = true;

                var test1 = null;
                if (
                    GLOBAL.Devices != null &&
                    GLOBAL.Devices.android != undefined
                ) {
                    test1 = GLOBAL.Devices.android.atv.filter(
                        s => s.model == GLOBAL.Device_Model,
                    );
                }
                if (GLOBAL.Device_Manufacturer == 'Amazon') {
                    GLOBAL.Device_System = 'Amazon';
                    GLOBAL.Device_IsPhone = false;
                    GLOBAL.Device_IsTablet = false;
                    GLOBAL.Device_IsTV = true;
                    GLOBAL.Device_IsFireTV = true;
                    GLOBAL.Device_Type = '_FireTV';
                    GLOBAL.Device_Category = 'mediaplayer';
                } else if (
                    GLOBAL.Device_IsAndroidTV == true ||
                    (test1 != null && test1.length > 0) ||
                    GLOBAL.Device_Model.indexOf('ATV') > 0
                ) {
                    GLOBAL.Device_Category = 'mediaplayer';
                    GLOBAL.Device_Type = '_AndroidTV';
                    GLOBAL.Device_IsPhone = false;
                    GLOBAL.Device_IsTablet = false;
                    GLOBAL.Device_IsTV = true;
                    GLOBAL.Device_IsAndroidTV = true;
                } else {
                    if (GLOBAL.Device_Model == 'p212') {
                        GLOBAL.Device_Category = 'stb';
                        GLOBAL.Device_Type = '_TelergyHD_Android';
                        GLOBAL.Device_IsSTB = true;
                        GLOBAL.Device_IsTV = true;
                    } else {
                        GLOBAL.Device_Category = 'stb';
                        GLOBAL.Device_Type = '_Generic_Android';
                        GLOBAL.Device_IsSTB = true;
                        GLOBAL.Device_IsTV = true;
                    }
                }
            } else {
                var test2 = '';
                if (
                    GLOBAL.Devices != null &&
                    GLOBAL.Devices.android != undefined
                ) {
                    GLOBAL.Devices.android.atv.filter(
                        s => s.model == GLOBAL.Device_Model,
                    );
                }
                if (GLOBAL.Device_Manufacturer == 'Amazon') {
                    GLOBAL.Device_IsPhone = false;
                    GLOBAL.Device_IsTablet = false;
                    GLOBAL.Device_IsTV = true;
                    GLOBAL.Device_IsFireTV = true;
                    GLOBAL.Device_Type = '_FireTV';
                    GLOBAL.Device_Category = 'mediaplayer';
                } else if (
                    GLOBAL.Device_IsAndroidTV == true ||
                    test2.length > 0 ||
                    GLOBAL.Device_Model.indexOf('ATV') > 0
                ) {
                    GLOBAL.Device_IsPhone = false;
                    GLOBAL.Device_IsTablet = false;
                    GLOBAL.Device_IsTV = true;
                    GLOBAL.Device_IsAndroidTV = true;
                    GLOBAL.Device_Category = 'mediaplayer';
                    GLOBAL.Device_Type = '_AndroidTV';
                } else {
                    GLOBAL.Orientation = 'PORTRAIT';
                    GLOBAL.Device_FormFactor = 'PHONE';
                    GLOBAL.Device_IsTablet = false;
                    GLOBAL.Device_IsPhone = true;
                    GLOBAL.Device_IsTV = false;
                    GLOBAL.Device_Type = '_AndroidHandheld';
                    GLOBAL.Device_Category = 'mobile';
                    GLOBAL.Device_HasNotch = DeviceInfo.hasNotch();
                }
            }
            var test3 = '';
            var test4 = '';
            if (GLOBAL.Devices != null && GLOBAL.Devices.android != undefined) {
                GLOBAL.Devices.android.sticks.filter(
                    s => s.model == GLOBAL.Device_Manufacturer,
                );
                GLOBAL.Devices.android.sticks.filter(
                    s => s.model == GLOBAL.Device_Model,
                );
            }
            if (test3.length > 0 || test4.length > 0) {
                GLOBAL.Device_IsPhone = false;
                GLOBAL.Device_IsTablet = false;
                GLOBAL.Device_IsTV = true;
                GLOBAL.Device_Category = 'stb';
                GLOBAL.Device_Type = '_Generic_Android';
                GLOBAL.Device_IsSTB = true;
            }

            if (
                GLOBAL.Device_MacAddress != 'Not Set' &&
                GLOBAL.Device_MacAddress != '0' &&
                GLOBAL.Device_MacAddress != '02:00:00:00:00:00'
            ) {
                GLOBAL.Device_UniqueID = GLOBAL.Device_MacAddress;
            } else if (
                GLOBAL.Device_UniqueID == 'Not Set' &&
                GLOBAL.Device_Serial != 'Not Set' &&
                GLOBAL.Device_Serial != '' &&
                GLOBAL.Device_Serial != 'unknown'
            ) {
                GLOBAL.Device_UniqueID = GLOBAL.Device_Serial;
            } else if (
                GLOBAL.Device_UniqueID == 'Not Set' &&
                GLOBAL.Device_UUID != 'Not Set'
            ) {
                GLOBAL.Device_UniqueID = GLOBAL.Device_UUID;
            }
            //})
        }

        if (GLOBAL.Device_Manufacturer == 'Windows') {
            GLOBAL.Device_FormFactor = 'TABLET';
            GLOBAL.Device_System = 'Windows';
            GLOBAL.Device_IsWebTV = false;
            GLOBAL.Device_IsPhone = true;
            GLOBAL.Device_IsTablet = false;
            GLOBAL.Device_IsTV = false;
            GLOBAL.Device_Type = '_WindowsHandheld';
            GLOBAL.Device_Category = 'mobile';

            if (
                GLOBAL.Device_Serial != 'Not Set' &&
                GLOBAL.Device_Serial != '' &&
                GLOBAL.Device_Serial != 'unknown'
            ) {
                GLOBAL.Device_UniqueID = GLOBAL.Device_Serial;
            } else if (GLOBAL.Device_UUID != 'Not Set') {
                GLOBAL.Device_UniqueID = GLOBAL.Device_UUID;
            }
        }
        if (GLOBAL.Device_IsWebTV) {
            if (GLOBAL.Device_UserAgent.indexOf('Tizen') >= 0) {
                var tizenId = tizen.systeminfo.getCapability(
                    'http://tizen.org/system/tizenid',
                );
                GLOBAL.Device_FormFactor = 'TV';
                GLOBAL.Device_Manufacturer = 'Samsung Tizen';
                GLOBAL.Device_Model = 'Samsung';
                GLOBAL.Device_IsPhone = false;
                GLOBAL.Device_IsTablet = false;
                GLOBAL.Device_IsTV = false;
                GLOBAL.Device_IsSmartTV = true;
                GLOBAL.Device_Type = '_SmartTV_Tizen';
                GLOBAL.Device_Category = 'smarttv';
                GLOBAL.Device_UniqueID = tizenId;
            } else if (
                GLOBAL.Device_UserAgent.indexOf('Web0S') >= 0 ||
                GLOBAL.Device_UserAgent.indexOf('WebOS') >= 0
            ) {
                GLOBAL.Device_FormFactor = 'TV';
                GLOBAL.Device_Manufacturer = 'LG WebOS';
                GLOBAL.Device_IsPhone = false;
                GLOBAL.Device_IsTablet = false;
                GLOBAL.Device_IsTV = false;
                GLOBAL.Device_IsSmartTV = true;
                GLOBAL.Device_Type = '_SmartTV_LG';
                GLOBAL.Device_Category = 'smarttv';
                GLOBAL.Device_Model = 'LG WebOS';
                this.getWebosUUID();
            } else {
                // var uuid = new DeviceUUID().get();
                GLOBAL.Device_FormFactor = 'WEB';
                GLOBAL.Device_System = 'PC_MAC';
                // GLOBAL.Device_UniqueID = uuid; //this.generateHash(GLOBAL.Device_UserAgent) * -1;
                GLOBAL.Device_UniqueID = this.generateHash(GLOBAL.Device_UserAgent) * -1;
                GLOBAL.Device_Manufacturer = 'WebTV';
                GLOBAL.Device_Model = 'WebTV';
                GLOBAL.Device_IsPhone = false;
                GLOBAL.Device_IsTablet = false;
                GLOBAL.Device_IsTV = false;
                GLOBAL.Device_IsSmartTV = false;
                GLOBAL.Device_Type = '_WebTV';
                GLOBAL.Device_Category = 'any';

                // if (isMobile.any()) {
                //     GLOBAL.Device_IsWebTvMobile = true;
                // }

                // GLOBAL.Device_IsWebTvMobile = true;

                // if (isMobile.isPWA()) {
                //     GLOBAL.Device_IsPWA = true;
                //     GLOBAL.Device_System = 'Mobile';
                //     GLOBAL.Device_Manufacturer = 'PWA';
                //     GLOBAL.Device_Model = 'PWA';
                //     GLOBAL.Device_Type = '_PWA';
                // }

                // GLOBAL.Device_IsPWA = true;
                // GLOBAL.Device_System = 'Mobile';
                // GLOBAL.Device_Manufacturer = 'PWA';
                // GLOBAL.Device_Model = 'PWA';
                // GLOBAL.Device_Type = '_PWA';

                // if (isMobile.Android()) {
                //     GLOBAL.Device_IsPwaAndroid = true;
                // }

                // GLOBAL.Device_IsPwaAndroid = true;

                // if (isMobile.ChromeAndroid()) {
                //     GLOBAL.Device_IsPwaAndroid = true;
                //     GLOBAL.Device_Type = '_PWA_Android';
                //     if (!isMobile.isPWA()) {
                //         GLOBAL.Device_Type = '_WebTV';
                //         GLOBAL.Show_PWA_Message = true;
                //         GLOBAL.Device_IsPwaAndroidChrome = true;
                //     }
                // }

                // GLOBAL.Device_IsPwaAndroid = true;
                // GLOBAL.Device_Type = '_WebTV';
                // GLOBAL.Show_PWA_Message = true;
                // GLOBAL.Device_IsPwaAndroidChrome = true;

                // if (isMobile.Samsung()) {
                //     GLOBAL.Device_IsPwaAndroid = true;
                //     GLOBAL.Device_Type = '_PWA_Android';
                //     if (!isMobile.isPWA()) {
                //         GLOBAL.Device_Type = '_WebTV';
                //         GLOBAL.Show_PWA_Message = true;
                //         GLOBAL.Device_IsPwaAndroidSamsung = true;
                //     }
                // }
                // if (isMobile.iOS()) {
                //     GLOBAL.Device_IsPwaIOS = true;
                //     GLOBAL.Device_Type = '_PWA_iOS';
                //     if (!isMobile.isPWA()) {
                //         GLOBAL.Device_Type = '_WebTV';
                //         GLOBAL.Show_PWA_Message = true;
                //         if (isMobile.Chrome()) {
                //             GLOBAL.Device_IsPwaIosChrome = true;
                //         } else {
                //             GLOBAL.Device_IsPwaIosSafari = true;
                //         }
                //     }
                // }
            }
        }
        if (!GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsAppleTV) {
            // if (Orientation.getInitialOrientation() == 'PORTRAIT') {
            //     GLOBAL.Portrait_Width = Dimensions.get('screen').width - 20;
            //     GLOBAL.Landscape_Width = Dimensions.get('screen').height - 100;
            // } else {
            //     GLOBAL.Portrait_Width = Dimensions.get('screen').height - 20;
            //     GLOBAL.Landscape_Width = Dimensions.get('screen').width - 100;
            // }
            GLOBAL.Portrait_Width = Dimensions.get('screen').height - 20;
            GLOBAL.Landscape_Width = Dimensions.get('screen').width - 100;
        }
        if (GLOBAL.Device_IsTablet == true) {
            if (GLOBAL.Device_Manufacturer == 'Apple') {
                Orientation.lockToLandscapeRight();
            } else {
                Orientation.lockToLandscape();
            }
        } else if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToPortrait();
        }

        EStyleSheet.clearCache();
        EStyleSheet.build({
            // always call EStyleSheet.build() even if you don't use global variables!
            $tvguide_bar_height:
                GLOBAL.Device_FormFactor == 'PHONE'
                    ? 0
                    : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                        ? 110
                        : GLOBAL.Device_IsSTB
                            ? 230
                            : GLOBAL.Device_IsAppleTV
                                ? 300
                                : 150,
            $bar_height:
                GLOBAL.Device_FormFactor == 'PHONE'
                    ? 150
                    : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
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
                    : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                        ? 50
                        : GLOBAL.Device_IsSTB
                            ? 60
                            : GLOBAL.Device_IsAppleTV
                                ? 115
                                : 75,
            $logo_height:
                GLOBAL.Device_FormFactor == 'PHONE'
                    ? 40
                    : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                        ? 50
                        : GLOBAL.Device_IsSTB
                            ? 50
                            : (GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 55
                                : GLOBAL.Device_IsAppleTV
                                    ? 100
                                    : 55,
            $footer_height:
                GLOBAL.Device_FormFactor == 'PHONE'
                    ? GLOBAL.Device_System == 'Apple'
                        ? 65
                        : 65
                    : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
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
            $font_size_extra: UTILS.getFontExtra(),
            $square_width_height:
                GLOBAL.Device_FormFactor == 'WEB'
                    ? '7rem'
                    : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
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

        return UTILS.retrieveJson('UI_Profile').then(data => {
            if (data) {
                GLOBAL.UI_Profile = data;
            }
            return UTILS.retrieveJson('Selected_Language').then(data => {
                if (data) {
                    GLOBAL.Selected_Language = data;
                    GLOBAL.Languaged = true;
                }
                return UTILS.retrieveJson('Shown_Notifications').then(data => {
                    if (data) {
                        GLOBAL.Shown_Notifications = data;
                    }
                    return UTILS.retrieveJson('ServiceID').then(data => {
                        GLOBAL.ServiceID = data;
                        GLOBAL.Selected_Service = data;
                        return UTILS.retrieveJson('UserID').then(data => {
                            GLOBAL.UserID = data;
                            return UTILS.retrieveJson('Pass').then(data => {
                                GLOBAL.Pass = data;
                                return UTILS.retrieveJson(
                                    'Messages' + GLOBAL.UserID,
                                ).then(data => {
                                    if (data) {
                                        GLOBAL.Messages = data;
                                    }
                                    return UTILS.retrieveJson('Updates').then(
                                        data => {
                                            if (data) {
                                                GLOBAL.Updates = data;
                                            }
                                            UTILS.retrieveJson(
                                                'AutoLogin',
                                            ).then(data => {
                                                if (data) {
                                                    GLOBAL.AutoLogin = data;
                                                    GLOBAL.Authenticated = data;
                                                }
                                                return true;
                                            });
                                        },
                                    );
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    checkIfService() {
        DAL.getLoginServices(GLOBAL.Package)
            .then(data => {
                if (data == undefined) {
                    return false;
                } else {
                    return true;
                }
            })
            .catch(error => {
                return false;
            });
    }
    getTizenUUID() {
        try {
            var value = webapis.appcommon.getUuid();
            return value;
        } catch (e) {
            if (e.message.indexOf('undefined') == -1) {
                // Error, such as a missing privilege
                return e.message;
            } else {
                return 'undefined';
            }
        }
    }
    getWebosUUID() {
        webOS.service.request('luna://com.webos.service.sm', {
            method: 'deviceid/getIDs',
            parameters: {
                idType: ['LGUDID'],
            },
            onSuccess: function (inResponse) {
                var serial = inResponse.idList[0].idValue;
                GLOBAL.Device_UniqueID = serial;
            },
            onFailure: function (inError) {
                GLOBAL.Device_UniqueID = this.generateHash(
                    GLOBAL.Device_UserAgent,
                );
            },
        });
    }

    generateHash(string) {
        var hash = 0;
        if (string.length == 0) return hash;
        for (var i = 0; i < string.length; i++) {
            var char = string.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    getSettings() {
        if (GLOBAL.CMS != '') {
            if (GLOBAL.PlayServices == true) {
                //Actions.Imports();
            } else {
                Actions.Languages();
            }
        }
        if (GLOBAL.Package == 'stock.tvms.io') {
            var path =
                GLOBAL.HTTPvsHTTPS +
                GLOBAL.Package +
                '/geturl?macserial=' +
                GLOBAL.Device_UniqueID;
            DAL.getJson(path)
                .then(data => {
                    GLOBAL.Package = data;
                    this.getSettings();
                })
                .catch(error => {
                    if (this.state.numberOfTries == 0) {
                        TimerMixin.clearTimeout(this.timer3);
                        this.timer3 = TimerMixin.setTimeout(() => {
                            this.setState({
                                numberOfTries: this.state.numberOfTries - 1,
                            });
                            this.getSettings();
                        }, 2000);
                    } else {
                        Actions.NoService({
                            Error: error,
                        });
                    }
                });
        } else if (GLOBAL.Package.indexOf('telergyhd') > 0) {
            var path =
                GLOBAL.HTTPvsHTTPS + GLOBAL.Package + GLOBAL.Device_UniqueID;
            DAL.resolveStartUrl(path)
                .then(data => {
                    GLOBAL.Package = data;
                    this.getSettings();
                })
                .catch(error => {
                    if (this.state.numberOfTries == 0) {
                        TimerMixin.clearTimeout(this.timer3);
                        this.timer3 = TimerMixin.setTimeout(() => {
                            this.setState({
                                numberOfTries: this.state.numberOfTries - 1,
                            });
                            this.getSettings();
                        }, 2000);
                    } else {
                        Actions.NoService({
                            Error: error,
                        });
                    }
                });
        } else {
            DAL.getLoginSettings(GLOBAL.Package)
                .then(data => {
                    data = JSON.parse(data);
                    GLOBAL.Settings_Services_Login = data;
                    GLOBAL.Settings_Login = data;
                    GLOBAL.CMS = data.cms;
                    GLOBAL.CRM = data.crm;
                    GLOBAL.IMS = data.client;
                    if (data.beacon_url) {
                        GLOBAL.Beacon_URL = data.beacon_url;
                    }
                    if (GLOBAL.Device_Type == '_TelergyHD_Android') {
                        GLOBAL.Device_Model = data.client.toUpperCase();
                    }
                    GLOBAL.Disclaimer = data.account.disclaimer;
                    GLOBAL.Show_Disclaimer = data.account.is_show_disclaimer;
                    GLOBAL.ImageUrlCMS =
                        GLOBAL.HTTPvsHTTPS +
                        'cloudtv.akamaized.net/' +
                        data.client +
                        '/images/' +
                        data.cms +
                        '/';
                    GLOBAL.ImageUrlCRM =
                        GLOBAL.HTTPvsHTTPS +
                        'cloudtv.akamaized.net/' +
                        data.client +
                        '/images/' +
                        data.crm +
                        '/';
                    GLOBAL.GuiBaseUrl =
                        GLOBAL.HTTPvsHTTPS +
                        'cloudtv.akamaized.net/' +
                        data.client +
                        '/userinterfaces/';
                    GLOBAL.IMS_Prefix_Staging = data.web_api_location
                        .toString()
                        .replace('api', 'cloudtv');
                    GLOBAL.Button_Color = data.contact.selection_color;
                    GLOBAL.Logo =
                        GLOBAL.HTTPvsHTTPS +
                        data.contact.logo
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Support = data.contact.text;
                    //**social login start*/
                    if (data.social) {
                        GLOBAL.UseSocialLogin = data.social.social_enabled;
                        GLOBAL.SocialGoogle = data.social.google_enabled;
                        GLOBAL.SocialFacebook = data.social.facebook_enabled;
                        GLOBAL.SocialPhone = data.social.phone_enabled;
                        GLOBAL.SocialEmail = data.social.email_enabled;
                    }
                    //in-app purchase//
                    if (data.in_app_purchase_enabled) {
                        GLOBAL.InAppPurchase = data.in_app_purchase_enabled;
                    }
                    //*apps links //
                    if (data.apps && !GLOBAL.Device_IsSmartTV) {
                        GLOBAL.Android_Download_Enabled =
                            data.apps.show_android;
                        GLOBAL.Android_Download_Link = data.apps.android_url;
                        GLOBAL.IOS_Download_Enabled = data.apps.show_ios;
                        GLOBAL.IOS_Download_Link = data.apps.ios_url;
                    }
                    GLOBAL.Background =
                        GLOBAL.HTTPvsHTTPS +
                        data.contact.background
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    if (GLOBAL.PlayServices == true) {
                        // Actions.Imports();
                    } else {
                        Actions.Languages();
                    }
                })
                .catch(error => {
                    if (this.state.numberOfTries == 0) {
                        TimerMixin.clearTimeout(this.timer3);
                        this.timer3 = TimerMixin.setTimeout(() => {
                            this.setState({
                                numberOfTries: this.state.numberOfTries - 1,
                            });
                            this.getSettings();
                        }, 2000);
                    } else {
                        Actions.NoService();
                    }
                });
        }
    }
    getServices() {
        if (GLOBAL.Services_Login != '') {
            this.getSettings();
        } else {
            if (GLOBAL.Package == 'stock.tvms.io') {
                var path =
                    GLOBAL.HTTPvsHTTPS +
                    GLOBAL.Package +
                    '/geturl?macserial=' +
                    GLOBAL.Device_UniqueID;
                DAL.getJson(path).then(data => {
                    GLOBAL.Package = data;
                    this.getServices();
                });
            } else if (GLOBAL.Package.indexOf('telergyhd') > 0) {
                var path =
                    GLOBAL.HTTPvsHTTPS +
                    GLOBAL.Package +
                    GLOBAL.Device_UniqueID;
                DAL.resolveStartUrl(path).then(data => {
                    GLOBAL.Package = data.url;
                    this.getServices();
                });
            } else {
                DAL.getLoginServices(GLOBAL.Package)
                    .then(data => {
                        data = JSON.parse(data);
                        GLOBAL.Services_Login = data;
                        GLOBAL.HasService = true;
                        this.getSettings();
                    })
                    .catch(error => {
                        if (GLOBAL.IsWebTV == true) {
                            GLOBAL.HasService = false;
                            this.getSettings();
                        } else if (this.state.numberOfTries > 0) {
                            TimerMixin.clearTimeout(this.timer3);
                            this.timer3 = TimerMixin.setTimeout(() => {
                                this.setState({
                                    numberOfTries: this.state.numberOfTries - 1,
                                });
                                this.getSettings();
                            }, 2000);
                        } else {
                            Actions.NoService();
                        }
                    });
            }
        }
    }
}
const deviceInformation = new DeviceInformation();
export default deviceInformation;
