import React, { Component } from 'react';
import {
    Text,
    TextInput,
    View,
    Image,
    BackHandler,
    TVMenuControl,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import HTML from 'react-native-render-html';
import Decode from 'unescape';
// import {SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { sendPageReport } from '../../reporting/reporting';
export default class Services extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        var hideLogin = false;
        GLOBAL.Focus = 'Outside';
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
        if (this.props.ServiceID != undefined && this.props.ServiceID != '') {
            GLOBAL.ServiceID = this.props.ServiceID;
        }
        this.state = {
            reportStartTime: moment().unix(),
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            support: Decode(GLOBAL.Support),
            userid: GLOBAL.UserID,
            pass: GLOBAL.Pass,
            service_id:
                this.props.ServiceID != undefined
                    ? this.props.ServiceID
                    : GLOBAL.ServiceID,
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
        if (GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV) {
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
        }
        if (
            GLOBAL.Device_IsTV == true &&
            GLOBAL.Device_IsAppleTV == false &&
            !global.Device_IsSmartTV
        ) {
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
                if (i == GLOBAL.ServiceID) {
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
        sendPageReport('Services', this.state.reportStartTime, moment().unix());
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
        if (GLOBAL.Device_IsPhone && GLOBAL.Support != '') {
            Actions.Services_Text();
        } else {
            GLOBAL.Selected_Language = '';
            Actions.Languages();
        }
    }
    _onSubmitService() {
        if (this.state.service_id != undefined) {
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
                    GLOBAL.ServiceID = this.state.service_id;
                    this.getSettingsService();
                } else {
                    GLOBAL.ServiceID = '';
                    GLOBAL.Show_Error = LANG.getTranslation('wrong_service_id');
                    Actions.Services();
                }
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
                //in-app purchase//
                if (data.in_app_purchase_enabled) {
                    GLOBAL.InAppPurchase = data.in_app_purchase_enabled;
                }
                //*apps links //
                if (data.apps) {
                    GLOBAL.Android_Download_Enabled = data.apps.show_android;
                    GLOBAL.Android_Download_Link = data.apps.android_url;
                    GLOBAL.IOS_Download_Enabled = data.apps.show_ios;
                    GLOBAL.IOS_Download_Link = data.apps.ios_url;
                }
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
                    //Actions.Register();
                } else if (GLOBAL.InAppPurchase == true) {
                    Actions.Selection();
                } else {
                    if (GLOBAL.Support != '' && GLOBAL.Device_IsPhone == true) {
                        Actions.Authentication_Text();
                    } else {
                        Actions.Authentication();
                    }
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
        return (
            <Container
                needs_notch={true}
                hide_menu={true}
                hide_header={true}
                background={this.state.background}
            >
                {RenderIf(this.state.autologin == false)(
                    <View
                        style={[
                            styles.container_authentication,
                            { alignContent: 'center' },
                        ]}
                    >
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
    onChangeText = text => {
        this.setState({
            service_id: text,
        });
    };
    showServicePage() {
        return (
            <View
                style={[
                    {
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.60)',
                        height: '100%',
                        borderRadius: 5,
                    },
                ]}
            >
                <View
                    style={[
                        styles.container_authentication,
                        { height: GLOBAL.Device_Height - 40 },
                    ]}
                >
                    <View style={[styles.inner_container_left]}>
                        <View
                            style={{
                                margin: 10,
                                height: 170,
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={[
                                    styles.Error,
                                    styles.CenterText,
                                    styles.Shadow,
                                    { color: '#fff', paddingBottom: 5 },
                                ]}
                            >
                                {GLOBAL.Show_Error}
                            </Text>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                {RenderIf(
                                    GLOBAL.Device_IsSmartTV ||
                                    GLOBAL.Device_IsAppleTV ||
                                    GLOBAL.Device_IsSTB ||
                                    GLOBAL.Device_IsFireTV ||
                                    GLOBAL.Device_IsAndroidTV,
                                )(
                                    <View>
                                        <View>
                                            <Text
                                                style={[
                                                    styles.Medium,
                                                    { padding: 10 },
                                                ]}
                                            >
                                                {LANG.getTranslation(
                                                    'your_serviceid',
                                                )}
                                            </Text>
                                        </View>
                                        <TouchableHighlightFocus
                                            BorderRadius={5}
                                            style={{
                                                height: GLOBAL.Device_IsSmartTV
                                                    ? 78
                                                    : GLOBAL.Device_IsAppleTV
                                                        ? 106
                                                        : 60,
                                                borderRadius: 5,
                                            }}
                                            hasTVPreferredFocus={true}
                                            underlayColor={GLOBAL.Button_Color}
                                            onPress={() =>
                                                Actions.Auth_Keyboard({
                                                    PlaceHolder:
                                                        LANG.getTranslation(
                                                            'serviceid',
                                                        ),
                                                    Value: this.state
                                                        .service_id,
                                                })
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.InputFake,
                                                    GLOBAL.Device_IsAppleTV
                                                        ? styles.InputFakeApple
                                                        : styles.InputFake,
                                                ]}
                                            >
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        alignContent:
                                                            'flex-start',
                                                        width: GLOBAL.Device_IsAppleTV
                                                            ? 360
                                                            : 260,
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenu,
                                                            { padding: 10 },
                                                        ]}
                                                        // icon={
                                                        //     SolidIcons.projectDiagram
                                                        // }
                                                        name="project-diagram"
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.Standard,
                                                            {
                                                                justifyContent:
                                                                    'flex-start',
                                                            },
                                                        ]}
                                                    >
                                                        {this.state.service_id}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>,
                                )}
                                {RenderIf(
                                    (GLOBAL.Device_IsWebTV == true &&
                                        GLOBAL.Device_IsSmartTV == false) ||
                                    GLOBAL.Device_IsPhone ||
                                    GLOBAL.Device_IsTablet,
                                )(
                                    <View>
                                        <View>
                                            <Text
                                                style={[
                                                    styles.Medium,
                                                    { padding: 10 },
                                                ]}
                                            >
                                                {LANG.getTranslation(
                                                    'your_serviceid',
                                                )}
                                            </Text>
                                        </View>
                                        <TouchableHighlightFocus
                                            BorderRadius={5}
                                            style={{ height: 60 }}
                                            hasTVPreferredFocus={true}
                                            underlayColor={GLOBAL.Button_Color}
                                            onPress={() => this.service.focus()}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 50,
                                                        height: 50,
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                        margin: 6,
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenu,
                                                        ]}
                                                        // icon={
                                                        //     SolidIcons.projectDiagram
                                                        // }
                                                        name="project-diagram"
                                                    />
                                                </View>
                                                <View
                                                    style={{
                                                        borderColor:
                                                            GLOBAL.Device_IsWebTV
                                                                ? '#fff'
                                                                : 'transparent',
                                                        borderWidth: 2,
                                                    }}
                                                >
                                                    <TextInput
                                                        ref={service =>
                                                        (this.service =
                                                            service)
                                                        }
                                                        style={[
                                                            styles.InputMobile,
                                                            { width: 190 },
                                                        ]}
                                                        value={
                                                            this.state
                                                                .service_id
                                                        }
                                                        placeholder={LANG.getTranslation(
                                                            'serviceid',
                                                        )}
                                                        underlineColorAndroid="rgba(0,0,0,0)"
                                                        placeholderTextColor="#fff"
                                                        selectionColor="#000"
                                                        onChangeText={text =>
                                                            this.setState({
                                                                service_id:
                                                                    text,
                                                            })
                                                        }
                                                        keyboardAppearance={
                                                            'dark'
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>,
                                )}
                            </View>
                        </View>
                        <View
                            style={{ width: GLOBAL.Device_IsAppleTV ? 400 : 300 }}
                        >
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._onSubmitService()}
                                Text={LANG.getTranslation('submit')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._onChangeLanguage()}
                                Text={LANG.getTranslation('change_language')}
                            />
                        </View>
                    </View>
                    <View style={styles.inner_container_right}>
                        <View
                            style={{
                                borderRadius: 5,
                                height: '100%',
                                width: '100%',
                                justifyContent: 'center',
                                backgroundColor:
                                    this.state.support == ''
                                        ? 'rgba(0, 0, 0, 0.00)'
                                        : 'rgba(0, 0, 0, 0.40)',
                            }}
                        >
                            <View style={{ flex: 1, padding: 20 }}>
                                <View style={styles.view_center}>
                                    <Image
                                        style={styles.operator_logo_login}
                                        resizeMode={'contain'}
                                        source={{ uri: this.state.logo }}
                                    ></Image>
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 4,
                                    alignItems: 'center',
                                    margin: 10,
                                }}
                            >
                                <HTML
                                    style={[{ color: '#fff' }]}
                                    source={{ html: this.state.support }}
                                    tagsStyles={{
                                        p: {
                                            fontSize: GLOBAL.Device_IsAppleTV
                                                ? 30
                                                : 20,
                                            textAlign: 'center',
                                        },
                                    }}
                                    baseFontStyle={{
                                        color: '#fff',
                                        fontSize: GLOBAL.Device_IsAppleTV
                                            ? 28
                                            : 18,
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
