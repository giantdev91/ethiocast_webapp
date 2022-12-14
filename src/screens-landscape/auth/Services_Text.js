import React, {Component} from 'react';
import {
    Text,
    TextInput,
    View,
    Image,
    BackHandler,
    TVMenuControl,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import HTML from 'react-native-render-html';
import Decode from 'unescape';
import {sendPageReport} from '../../reporting/reporting';
export default class Services_Text extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        var hideLogin = false;
        GLOBAL.Focus = 'Outside';
        GLOBAL.Show_Error = '';
        if (
            GLOBAL.ServiceID != '' &&
            GLOBAL.ServiceID != null &&
            GLOBAL.AutoLogin == true
        ) {
            hideLogin = true;
        }
        if (GLOBAL.HasService == false) {
            if (GLOBAL.UseSocialLogin == true) {
                Actions.Register();
            } else {
                Actions.Authentication();
            }
        }

        this.state = {
            reportStartTime: moment().unix(),
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            support: Decode(GLOBAL.Support),
            userid: GLOBAL.UserID,
            pass: GLOBAL.Pass,
            service_id: GLOBAL.ServiceID,
            services: GLOBAL.Services_Login,
            has_service: GLOBAL.HasService,
            autologin: hideLogin,
            focusbutton: false,
        };
    }

    focusServiceId = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.service.focus();
        }
    };
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (GLOBAL.Device_Type == '_WebTV') {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            GLOBAL.Selected_Language = '';
            Actions.Languages();
        }
    };
    updateDimensions() {
        if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
            return;
        }
        if (GLOBAL.Device_IsSTB) {
            return;
        }
        //Actions.Services();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
            setTimeout(function () {
                var viewheight = $(window).height();
                var viewwidth = $(window).width();
                var viewport = $('meta[name=viewport]');
                viewport.attr(
                    'content',
                    'height=' +
                        viewheight +
                        'px, width=' +
                        viewwidth +
                        'px, initial-scale=1.0',
                );
            }, 300);
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                GLOBAL.Selected_Language = '';
                Actions.Languages();
                return true;
            },
        );

        if (GLOBAL.AutoLogin == true && GLOBAL.ServiceID != '') {
            this.autoLogin();
        } else {
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (keyEvent.keyCode >= 7 && keyEvent.keyCode <= 16) {
                    this.setState({
                        service_id:
                            this.state.service_id !== undefined
                                ? this.state.service_id.slice(0, -1)
                                : this.state.service_id,
                    });
                }
                if (keyEvent.keyCode == 67) {
                    if (this.state.service_id == undefined) {
                        return;
                    }
                    if (this.state.service_id.length > 0) {
                        this.setState({
                            service_id:
                                this.state.service_id !== undefined
                                    ? this.state.service_id.slice(0, -1)
                                    : this.state.service_id,
                        });
                    }
                }
                return true;
            });
        }
    }

    autoLogin() {
        if (GLOBAL.ServiceID != '') {
            var weHaveHit = false;
            var services_ = this.state.services;
            var x = Object.keys(services_);
            var mappedArr = x.map(function (i) {
                if (i === GLOBAL.ServiceID) {
                    GLOBAL.Package = services_[i]
                        .toString()
                        .replace('http://', '')
                        .toString()
                        .replace('https://', '');
                    weHaveHit = true;
                    return services_[i];
                }
            });
            if (weHaveHit == true) {
                this.getSettingsService();
            } else {
                this.setState({
                    autologin: false,
                });
                GLOBAL.AutoLogin = false;
                GLOBAL.ServiceID = '';
                Actions.Services();
            }
        }
    }
    componentWillUnmount() {
        sendPageReport(
            'Service Text',
            this.state.reportStartTime,
            moment().unix(),
        );
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        Actions.pop();
    }
    _onChangeLanguage() {
        GLOBAL.Selected_Language = '';
        Actions.Languages();
    }
    _onSubmitService() {
        if (this.state.service_id != null) {
            UTILS.storeJson('ServiceID', this.state.service_id);
            var services_ = this.state.services;
            var serviceId = this.state.service_id;
            var x = Object.keys(services_);
            var weHaveHit = false;
            var mappedArr = x.map(function (i) {
                if (i === serviceId) {
                    weHaveHit = true;
                    GLOBAL.Package = services_[i]
                        .toString()
                        .replace(GLOBAL.HTTPvsHTTPS + '', '')
                        .replace('http://', '');
                    return services_[i];
                }
            });
            if (weHaveHit == true) {
                this.getSettingsService();
            } else {
                GLOBAL.Show_Error = LANG.getTranslation('wrong_service_id');
                GLOBAL.ServiceID = '';
                Actions.Services();
            }
        }
    }
    getSettingsService() {
        DAL.getLoginSettings(GLOBAL.Package)
            .then(data => {
                data = JSON.parse(data);
                GLOBAL.Settings_Login = data;
                GLOBAL.CMS = data.cms;
                GLOBAL.CRM = data.crm;
                GLOBAL.IMS = data.client;
                if (data.beacon_url) {
                    GLOBAL.Beacon_URL = data.beacon_url;
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
                //**social login start*/
                if (
                    data.social &&
                    !GLOBAL.Device_IsSmartTV &&
                    !GLOBAL.Device_IsAppleTV
                ) {
                    GLOBAL.UseSocialLogin = data.social.social_enabled;
                    GLOBAL.SocialGoogle = data.social.google_enabled;
                    GLOBAL.SocialFacebook = data.social.facebook_enabled;
                    GLOBAL.SocialPhone = data.social.phone_enabled;
                    GLOBAL.SocialEmail = data.social.email_enabled;
                }
                //**social login end */
                //*apps links //
                if (data.apps) {
                    GLOBAL.Android_Download_Enabled = data.apps.show_android;
                    GLOBAL.Android_Download_Link = data.apps.android_url;
                    GLOBAL.IOS_Download_Enabled = data.apps.show_ios;
                    GLOBAL.IOS_Download_Link = data.apps.ios_url;
                }
                //*app links end //
                GLOBAL.Logo =
                    GLOBAL.HTTPvsHTTPS +
                    data.contact.logo
                        .toString()
                        .replace('http://', '')
                        .replace('https://', '')
                        .replace('//', '');
                GLOBAL.Background =
                    GLOBAL.HTTPvsHTTPS +
                    data.contact.background
                        .toString()
                        .replace('http://', '')
                        .replace('https://', '')
                        .replace('//', '');
                GLOBAL.Support = Decode(data.contact.text);
                GLOBAL.Button_Color =
                    GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                        ? 'transparent'
                        : data.contact.selection_color;
                GLOBAL.Show_Error = '';

                if (GLOBAL.UseSocialLogin == true) {
                    Actions.Register();
                } else {
                    Actions.Authentication();
                }
            })
            .catch(error => {
                GLOBAL.Show_Error = 'Cloud Server Error';
                this.setState({
                    autologin: false,
                });
            });
    }

    render() {
        // this.autoLogin();
        return (
            <Container needs_notch={true} hide_menu={true} hide_header={true}>
                {RenderIf(this.state.autologin == false)(
                    <View style={styles.container_authentication}>
                        {this.showServicePage()}
                    </View>,
                )}
                {RenderIf(this.state.autologin == true)(
                    <View>
                        <Text>....</Text>
                    </View>,
                )}
            </Container>
        );
    }
    focusButton = () => {
        if (GLOBAL.Device_IsSTB == true) {
            GLOBAL.ServiceID = this.state.service_id;
            Actions.Services();
        }
    };
    _onChangeLanguage() {
        GLOBAL.Selected_Language = '';
        Actions.Languages();
    }
    showServicePage() {
        return (
            <View
                style={[
                    styles.container_authentication,
                    {backgroundColor: 'rgba(0, 0, 0, 0.70)'},
                ]}
            >
                <View style={{flex: 1}}>
                    <View style={{flex: 1}}>
                        <View style={{flex: 1, padding: 20}}>
                            <View style={styles.view_center}>
                                <Image
                                    style={styles.operator_logo_login}
                                    resizeMode={'contain'}
                                    source={{uri: this.state.logo}}
                                ></Image>
                            </View>
                        </View>
                        <View
                            style={{
                                flex: 5,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <Markers
                                Color={'darkslateblue'}
                                Text={LANG.getTranslation('information')}
                            />
                            <ScrollView
                                style={{
                                    flex: 1,
                                    marginHorizontal: 40,
                                    marginVertical: 20,
                                }}
                            >
                                <HTML
                                    style={[{color: '#fff'}]}
                                    source={{html: this.state.support}}
                                    tagsStyles={{
                                        p: {fontSize: 19, textAlign: 'center'},
                                    }}
                                    baseFontStyle={{color: '#fff'}}
                                />
                            </ScrollView>
                        </View>
                        <View
                            style={{
                                flex: 2,
                                paddingBottom: 20,
                                justifyContent: 'flex-end',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => Actions.Services()}
                                Text={LANG.getTranslation('continue')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._onChangeLanguage()}
                                Text={LANG.getTranslation('back')}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
