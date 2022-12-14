import React, {Component} from 'react';
import {View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';

export default class Device extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        GLOBAL.Focus = 'Outside';
        if (GLOBAL.Package == '') {
            var parsedUrl = new URL(window.location.href);
            GLOBAL.Package = parsedUrl.hostname;
            GLOBAL.HTTPvsHTTPS = parsedUrl.protocol + '//';
        }
        this.state = {
            background: null,
            logo: null,
        };
    }
    componentDidMount() {
        this.loadApp();
    }
    loadApp() {
        UTILS.retrieveJson('AutoLogin').then(data => {
            if (data) {
                GLOBAL.AutoLogin = data;
            }
            DAL.getLoginServices(GLOBAL.Package)
                .then(data => {
                    if (data == undefined) {
                        GLOBAL.HasService = false;
                        this.getSettings();
                    } else {
                        GLOBAL.HasService = true;
                        this.getServices();
                    }
                })
                .catch(error => {
                    GLOBAL.HasService = false;
                    this.getSettings();
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

    generateHash(string) {
        var hash = 0;
        if (string.length == 0) return hash;
        for (i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    getSettings() {
        if (GLOBAL.CMS != '') {
            if (GLOBAL.PlayServices == true) {
                Actions.Imports();
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
                        Actions.Imports();
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
    render() {
        return (
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
                    }}></View>
            </View>
        );
    }
}
