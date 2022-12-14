import React, { Component } from 'react';
import {
    Text,
    TextInput,
    View,
    Image,
    TouchableHighlight,
    BackHandler,
    TVMenuControl,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import HTML from 'react-native-render-html';
import Decode from 'unescape';
import TimerMixin from 'react-timer-mixin';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Authentication extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        var hideLogin = false;
        GLOBAL.Focus = 'Outside';
        if (
            GLOBAL.UserID != '' &&
            GLOBAL.Pass != '' &&
            GLOBAL.AutoLogin == true
        ) {
            hideLogin = true;
        }
        if (this.props.Username != undefined && this.props.Username != '') {
            GLOBAL.UserID = this.props.Username;
        }
        if (this.props.Password != undefined && this.props.Password != '') {
            GLOBAL.Pass = this.props.Password;
        }
        this.state = {
            reportStartTime: moment().unix(),
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            support: Decode(GLOBAL.Support),
            userid:
                this.props.Username != undefined && this.props.Username != ''
                    ? this.props.Username
                    : GLOBAL.UserID,
            pass:
                this.props.Password != undefined && this.props.Password != ''
                    ? this.props.Password
                    : GLOBAL.Pass,
            service: GLOBAL.ServiceID,
            services: GLOBAL.Services_Login,
            has_service: GLOBAL.HasService,
            autologin: hideLogin,
            //keyboardType: GLOBAL.Device_Type == "_FireTV" ? 'phone-pad' : 'number-pad',
            show_keyboard: false,
            username_focussed: true,
            password_focussed: false,
            show_exit_app: false,
        };
    }

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
            if (GLOBAL.HasService == true) {
                GLOBAL.AutoLogin = false;
                Actions.Services();
            } else {
                GLOBAL.Selected_Language = '';
                Actions.Languages();
                // if (GLOBAL.AppIsLauncher == true) { return }

                // if (this.state.show_exit_app == false) {
                //   this.setState({
                //     show_exit_app: true
                //   })
                //   this.starExitTimer();
                //   return true;
                // } else {
                //   if (GLOBAL.Device_Type == "_SmartTV_LG") {
                //     webOS.platformBack();
                //   } else if (GLOBAL.Device_Type == "_SmartTV_Tizen") {
                //     window.tizen.application.getCurrentApplication().exit();
                //   } else {
                //     BackHandler.exitApp();
                //   }
                //   return true;
                // }
            }
        }
    };

    starExitTimer() {
        TimerMixin.clearTimeout(this.exittimer);
        this.exittimer = TimerMixin.setTimeout(() => {
            this.setState({
                show_exit_app: false,
            });
        }, 2000);
    }
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

        if (
            GLOBAL.Device_IsTV == true &&
            GLOBAL.Device_IsAppleTV == false &&
            !global.Device_IsSmartTV
        ) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (keyEvent.keyCode >= 7 && keyEvent.keyCode <= 16) {
                    var newNumber = keyEvent.keyCode - 7;
                    if (this.state.username_focussed == true) {
                        this.setState({
                            userid:
                                this.state.userid === undefined
                                    ? newNumber
                                    : this.state.userid + newNumber,
                        });
                    } else if (this.state.password_focussed == true) {
                        this.setState({
                            pass:
                                this.state.pass === undefined
                                    ? newNumber
                                    : this.state.pass + newNumber,
                        });
                    }
                }

                if (keyEvent.keyCode == 67) {
                    if (this.state.username_focussed == true) {
                        if (this.state.userid == undefined) {
                            return;
                        }
                        if (this.state.userid.length > 0) {
                            this.setState({
                                userid:
                                    this.state.userid !== undefined
                                        ? this.state.userid.slice(0, -1)
                                        : this.state.userid,
                            });
                        }
                    } else if (this.state.password_focussed == true) {
                        if (this.state.pass == undefined) {
                            return;
                        }
                        if (this.state.pass.length > 0) {
                            this.setState({
                                pass:
                                    this.state.pass !== undefined
                                        ? this.state.pass.slice(0, -1)
                                        : this.state.pass,
                            });
                        }
                    }
                }
                return true;
            });
        }
        this.autoLogin();
    }
    autoLogin() {
        var path = '';

        if (
            GLOBAL.UserID != null &&
            GLOBAL.Pass != null &&
            GLOBAL.AutoLogin == true
        ) {
            GLOBAL.UserID = this.state.userid;
            GLOBAL.Pass = this.state.pass;
            if (GLOBAL.UserID == 't8472919' && GLOBAL.Pass == 'p2392382') {
                Actions.Sizing();
            } else {
                var test = '';
                if (GLOBAL.Device_IsWebTV) {
                    test = window.location.search;
                }
                if (test == '?connect') {
                    Actions.Connect();
                } else {
                    Actions.DataLoader();
                }
            }
        }
    }
    componentWillUnmount() {
        sendPageReport('Signin', this.state.reportStartTime, moment().unix());
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        TimerMixin.clearTimeout(this.exittimer);
        Actions.pop();
    }

    _onSubmitLogin() {
        if (this.state.userid != undefined && this.state.pass != undefined) {
            if (this.state.userid != '' && this.state.pass != '') {
                UTILS.storeJson('UserID', this.state.userid);
                UTILS.storeJson('Pass', this.state.pass);
                GLOBAL.UserID = this.state.userid;
                GLOBAL.Pass = this.state.pass;
                if (GLOBAL.UserID == 't8472919' && GLOBAL.Pass == 'p2392382') {
                    Actions.Sizing();
                } else {
                    var test = '';
                    if (GLOBAL.Device_IsWebTV) {
                        test = window.location.search;
                    }
                    if (test == '?connect') {
                        Actions.Connect();
                    } else {
                        Actions.DataLoader();
                    }
                }
            }
        }
    }
    _onChangeLanguage() {
        if (GLOBAL.Support != '' && GLOBAL.Device_IsPhone) {
            Actions.Authentication_Text();
        } else {
            GLOBAL.Selected_Language = '';
            Actions.Languages();
        }
    }
    _backToService() {
        GLOBAL.AutoLogin = false;
        Actions.Services();
    }
    _openForgotLogin() {
        Actions.Forgot();
    }
    render() {
        return (
            <Container
                needs_notch={true}
                hide_menu={true}
                hide_header={true}
                background={this.state.background}
            >
                <View
                    style={{
                        position: 'absolute',
                        zIndex: 9999,
                        top: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    <Modal Type={'MessageHome'}> </Modal>
                </View>
                {RenderIf(this.state.autologin == false)(
                    <View
                        style={[
                            styles.container_authentication,
                            { alignContent: 'center' },
                        ]}
                    >
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
    focusButton = () => {
        if (GLOBAL.Device_IsSTB) {
            GLOBAL.UserID = this.state.userid;
            GLOBAL.Pass = this.state.pass;
            Actions.Authentication();
        }
    };
    // _startRegister() {
    //   Actions.Register();
    // }
    _openAppleLink() {
        if (GLOBAL.Device_IsWebTV) {
            window.open(GLOBAL.IOS_Download_Link);
        }
    }
    _openGoogleLink() {
        if (GLOBAL.Device_IsWebTV) {
            window.open(GLOBAL.Android_Download_Link);
        }
    }
    focusPasswordTV = () => {
        if (GLOBAL.Device_IsTV == true || GLOBAL.Device_IsSmartTV == true) {
            this.setState({
                password_focussed: true,
                username_focussed: false,
            });
        }
    };
    focusUsernameTV = () => {
        if (GLOBAL.Device_IsTV == true || GLOBAL.Device_IsSmartTV == true) {
            this.setState({
                password_focussed: false,
                username_focussed: true,
            });
        }
    };
    focusPassword = () => {
        if (GLOBAL.Device_IsTV == true) {
            if (this.state.show_keyboard == false) {
                this.setState({
                    password_focussed: true,
                    username_focussed: false,
                });
                this.password.focus();
            }
        }
    };
    focusUsername = () => {
        if (GLOBAL.Device_IsTV == true) {
            if (this.state.show_keyboard == false) {
                this.setState({
                    password_focussed: false,
                    username_focussed: true,
                });
                this.username.focus();
            }
        }
    };
    getSecureInput(input) {
        if (input == undefined) {
            return;
        }
        var l = input.length;
        var input = '';
        for (var i = 0; i < l; i++) {
            input += '* ';
        }
        return input;
    }
    showLoginPage() {
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
                    {RenderIf(this.state.show_exit_app)(
                        <Modal
                            Title={LANG.getTranslation('exit_app')}
                            Centered={true}
                            TextHeader={LANG.getTranslation(
                                'exit_app_click_again',
                            )}
                            TextMain={LANG.getTranslation('exit_app_close')}
                        ></Modal>,
                    )}
                    <View style={[styles.inner_container_left]}>
                        <View style={{}}>
                            <Text
                                style={[
                                    styles.Error,
                                    styles.CenterText,
                                    styles.Shadow,
                                    { color: '#fff' },
                                ]}
                            >
                                {GLOBAL.Show_Error}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingBottom: 10,
                            }}
                        >
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
                                                'your_username',
                                            )}
                                        </Text>
                                    </View>
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{
                                            height: GLOBAL.Device_IsSmartTV
                                                ? 80
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
                                                        'userid',
                                                    ),
                                                Value: this.state.userid,
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
                                                    alignContent: 'flex-start',
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
                                                    // icon={SolidIcons.user}
                                                    name="user"
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
                                                    {this.state.userid}
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
                                                'your_username',
                                            )}
                                        </Text>
                                    </View>
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{ height: 60 }}
                                        hasTVPreferredFocus={true}
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() => this.username.focus()}
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
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    margin: 6,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={[styles.IconsMenu]}
                                                    // icon={SolidIcons.user}
                                                    name="user"
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
                                                    ref={username =>
                                                    (this.username =
                                                        username)
                                                    }
                                                    style={[
                                                        styles.InputMobile,
                                                        { width: 190 },
                                                    ]}
                                                    value={this.state.userid}
                                                    selection={
                                                        this.state.selection
                                                    }
                                                    placeholder={LANG.getTranslation(
                                                        'userid',
                                                    )}
                                                    underlineColorAndroid="rgba(0,0,0,0)"
                                                    placeholderTextColor="#fff"
                                                    selectionColor="#000"
                                                    onChangeText={text =>
                                                        this.setState({
                                                            userid: text,
                                                        })
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>,
                            )}
                        </View>
                        <View
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
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
                                                'your_password',
                                            )}
                                        </Text>
                                    </View>
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{
                                            height: GLOBAL.Device_IsSmartTV
                                                ? 80
                                                : GLOBAL.Device_IsAppleTV
                                                    ? 106
                                                    : 60,
                                            borderRadius: 5,
                                        }}
                                        hasTVPreferredFocus={false}
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() =>
                                            Actions.Auth_Keyboard({
                                                PlaceHolder:
                                                    LANG.getTranslation(
                                                        'password',
                                                    ),
                                                Value: this.state.pass,
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
                                                    alignContent: 'flex-start',
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
                                                    // icon={SolidIcons.lock}
                                                    name="lock"
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
                                                    {this.getSecureInput(
                                                        this.state.pass,
                                                    )}
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
                                                'your_password',
                                            )}
                                        </Text>
                                    </View>
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{ height: 60 }}
                                        hasTVPreferredFocus={true}
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() => this.password.focus()}
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
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    margin: 6,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={[styles.IconsMenu]}
                                                    // icon={SolidIcons.lock}
                                                    name="lock"
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
                                                    ref={password =>
                                                    (this.password =
                                                        password)
                                                    }
                                                    style={[
                                                        styles.InputMobile,
                                                        { width: 190 },
                                                    ]}
                                                    value={this.state.pass}
                                                    selection={
                                                        this.state.selection
                                                    }
                                                    placeholder={LANG.getTranslation(
                                                        'password',
                                                    )}
                                                    underlineColorAndroid="rgba(0,0,0,0)"
                                                    placeholderTextColor="#fff"
                                                    selectionColor="#000"
                                                    secureTextEntry={true}
                                                    onChangeText={text =>
                                                        this.setState({
                                                            pass: text,
                                                        })
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>,
                            )}
                        </View>
                        <View style={{ padding: 10 }}>
                            {/* <Text style={[styles.Error, styles.CenterText, styles.Shadow, { color: '#fff' }]}>{LANG.getTranslation("press_ok_enter")}</Text> */}
                        </View>
                        <View style={{ width: 300 }}>
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._onSubmitLogin()}
                                Text={LANG.getTranslation('submit')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._openForgotLogin()}
                                Text={LANG.getTranslation('forgot')}
                            />
                            {/* {RenderIf(GLOBAL.HasService == false)(
                  <ButtonNormal Padding={0} underlayColor={GLOBAL.Button_Color} hasTVPreferredFocus={false} onPress={() => this._onChangeLanguage()} Text={LANG.getTranslation("change_language")} />
                )} */}
                            {RenderIf(GLOBAL.HasService == true)(
                                <ButtonNormal
                                    Padding={0}
                                    underlayColor={GLOBAL.Button_Color}
                                    hasTVPreferredFocus={false}
                                    onPress={() => this._backToService()}
                                    Text={LANG.getTranslation('back_serviceid')}
                                />,
                            )}
                            {RenderIf(GLOBAL.UseSocialLogin == true)(
                                <ButtonNormal
                                    Padding={0}
                                    underlayColor={GLOBAL.Button_Color}
                                    hasTVPreferredFocus={false}
                                    onPress={() => Actions.Register_Email()}
                                    Text={LANG.getTranslation('register_now')}
                                />,
                            )}
                        </View>
                    </View>
                    <View padding={10} style={[styles.inner_container_right]}>
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
                                        style={[styles.operator_logo_login]}
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
                                                ? 24
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
                                {RenderIf(GLOBAL.Device_IsWebTV == true)(
                                    <View style={styles.view_center}>
                                        <View
                                            style={{
                                                flexDirection: 'column',
                                                width: '100%',
                                            }}
                                        >
                                            {RenderIf(
                                                GLOBAL.Android_Download_Enabled,
                                            )(
                                                <View
                                                    style={[styles.view_center]}
                                                >
                                                    <QRCode
                                                        value={
                                                            GLOBAL.Android_Download_Link
                                                        }
                                                        size={
                                                            GLOBAL.Device_IsTV
                                                                ? 75
                                                                : 100
                                                        }
                                                        bgColor="purple"
                                                        fgColor="white"
                                                    />
                                                </View>,
                                            )}
                                            {RenderIf(
                                                GLOBAL.IOS_Download_Enabled,
                                            )(
                                                <View
                                                    style={[styles.view_center]}
                                                >
                                                    <QRCode
                                                        value={
                                                            GLOBAL.IOS_Download_Link
                                                        }
                                                        size={
                                                            GLOBAL.Device_IsTV
                                                                ? 75
                                                                : 100
                                                        }
                                                        bgColor="purple"
                                                        fgColor="white"
                                                    />
                                                </View>,
                                            )}
                                            {RenderIf(
                                                GLOBAL.Android_Download_Enabled,
                                            )(
                                                <View
                                                    style={[styles.view_center]}
                                                >
                                                    <TouchableHighlight
                                                        onPress={() =>
                                                            this._openGoogleLink()
                                                        }
                                                    >
                                                        <Image
                                                            style={{
                                                                height: GLOBAL.Device_IsTV
                                                                    ? 100
                                                                    : 130,
                                                                width: GLOBAL.Device_IsTV
                                                                    ? 160
                                                                    : 210,
                                                            }}
                                                            resizeMode={
                                                                'contain'
                                                            }
                                                            source={require('../../images/google.png')}
                                                        ></Image>
                                                    </TouchableHighlight>
                                                </View>,
                                            )}
                                            {RenderIf(
                                                GLOBAL.IOS_Download_Enabled,
                                            )(
                                                <View
                                                    style={[styles.view_center]}
                                                >
                                                    <Image
                                                        onPress={() =>
                                                            this._openAppleLink()
                                                        }
                                                        style={{
                                                            height: GLOBAL.Device_IsTV
                                                                ? 100
                                                                : 130,
                                                            width: GLOBAL.Device_IsTV
                                                                ? 160
                                                                : 210,
                                                        }}
                                                        resizeMode={'contain'}
                                                        source={require('../../images/apple.png')}
                                                    ></Image>
                                                </View>,
                                            )}
                                        </View>
                                    </View>,
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
