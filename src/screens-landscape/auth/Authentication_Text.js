import React, {Component} from 'react';
import {
    Text,
    TextInput,
    View,
    Image,
    TouchableHighlight,
    BackHandler,
    TVMenuControl,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import HTML from 'react-native-render-html';
import Decode from 'unescape';
export default class Authentication_Text extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        var hideLogin = false;
        GLOBAL.Focus = 'Outside';
        this.state = {
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            support: Decode(GLOBAL.Support),
            userid: GLOBAL.UserID,
            pass: GLOBAL.Pass,
            service: GLOBAL.ServiceID,
            services: GLOBAL.Services_Login,
            has_service: GLOBAL.HasService,
            autologin: hideLogin,
            //keyboardType: GLOBAL.Device_Type == "_FireTV" ? 'phone-pad' : 'number-pad',
            show_keyboard: false,
            username_focussed: true,
            password_focussed: false,
        };
    }

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
            if (GLOBAL.HasService == true) {
                GLOBAL.AutoLogin = false;
                Actions.Services();
            } else {
                GLOBAL.Selected_Language = '';
                Actions.Languages();
            }
        }
    };
    updateDimensions() {
        if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
            return;
        }
        if (GLOBAL.Device_IsSTB) {
            return;
        }
        Actions.Authentication();
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
                if (GLOBAL.HasService == true) {
                    GLOBAL.AutoLogin = false;
                    Actions.Services();
                } else {
                    GLOBAL.Selected_Language = '';
                    Actions.Languages();
                }
                return true;
            },
        );
        this.autoLogin();
    }
    autoLogin() {
        if (GLOBAL.AutoLogin == true) {
            Actions.Authentication();
        }
    }
    componentWillUnmount() {
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
    _backToService() {
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
            GLOBAL.Support = GLOBAL.Settings_Services_Login.contact.text;
            GLOBAL.AutoLogin = false;
            Actions.Services();
        } else {
            GLOBAL.Selected_Language = '';
            Actions.Languages();
        }
    }

    render() {
        return (
            <Container needs_notch={true} hide_menu={true} hide_header={true}>
                {RenderIf(this.state.autologin == false)(
                    <View style={styles.container_authentication}>
                        {this.showLoginPage()}
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

    showLoginPage() {
        return (
            <View
                style={[
                    styles.container_authentication,
                    {backgroundColor: 'rgba(0, 0, 0, 0.70)'},
                ]}
            >
                <View style={{flex: 1}}>
                    <View style={{flex: 1}}>
                        <View style={{flex: 1, padding: 10}}>
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
                                onPress={() => Actions.Authentication()}
                                Text={LANG.getTranslation('continue')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._backToService()}
                                Text={LANG.getTranslation('back')}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
