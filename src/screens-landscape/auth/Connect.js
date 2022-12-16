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
import TimerMixin from 'react-timer-mixin';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Connect extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        var hideLogin = false;
        GLOBAL.Focus = 'Outside';

        this.state = {
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            success: false,
            error: false,
            userid: '',
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
                if (GLOBAL.AppIsLauncher == true) {
                    return;
                }

                if (this.state.show_exit_app == false) {
                    this.setState({
                        show_exit_app: true,
                    });
                    this.starExitTimer();
                    return true;
                } else {
                    if (GLOBAL.Device_Type == '_SmartTV_LG') {
                        webOS.platformBack();
                    } else if (GLOBAL.Device_Type == '_SmartTV_Tizen') {
                        window.tizen.application.getCurrentApplication().exit();
                    } else {
                        BackHandler.exitApp();
                    }
                    return true;
                }
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
        Actions.Connect();
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
                Actions.Authentication();
                return true;
            },
        );
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
        TimerMixin.clearTimeout(this.exittimer);
        Actions.pop();
    }

    checkCode() {
        (async () => {
            try {
                GLOBAL.show_log && console.log(
                    'check code: ',
                    GLOBAL.SIGN_IN_CHECK_CODE_URL + '?code=' +
                    this.state.userid +
                    '&userid=' +
                    GLOBAL.UserID +
                    '&pass=' +
                    GLOBAL.Pass +
                    '&serviceid=' +
                    GLOBAL.ServiceID,
                );
                let response = await fetch(
                    GLOBAL.SIGN_IN_CHECK_CODE_URL + '?code=' +
                    this.state.userid +
                    '&userid=' +
                    GLOBAL.UserID +
                    '&pass=' +
                    GLOBAL.Pass +
                    '&serviceid=' +
                    GLOBAL.ServiceID,
                );
                let data = await response.json();
                GLOBAL.show_log && console.log('check code response: ', data);
                if (data.success == false) {
                    this.setState({
                        error: true,
                        success: false,
                    });
                } else {
                    this.setState({
                        error: false,
                        success: true,
                    });
                }
            } catch (error) {
                this.setState({
                    error: true,
                    success: false,
                });
            }
        })();
    }
    render() {
        return (
            <Container
                needs_notch={true}
                hide_menu={true}
                hide_header={true}
                background={this.state.background}>
                <View
                    style={[
                        styles.container_authentication,
                        { alignContent: 'center' },
                    ]}>
                    {this.showLoginPage()}
                </View>
            </Container>
        );
    }
    showLoginPage() {
        return (
            <View
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.70)',
                    height: '100%',
                    width: '100%',
                }}>
                <View style={{ flexDirection: 'column' }}>
                    {RenderIf(this.state.show_exit_app)(
                        <Modal
                            Title={LANG.getTranslation('exit_app')}
                            Centered={true}
                            TextHeader={LANG.getTranslation(
                                'exit_app_click_again',
                            )}
                            TextMain={LANG.getTranslation(
                                'exit_app_close',
                            )}></Modal>,
                    )}
                    <View
                        style={{
                            height: 100,
                            width: '100%',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            margin: 10,
                        }}>
                        <Text style={styles.H4}>
                            {LANG.getTranslation('connect_device')}
                        </Text>
                        <Text style={styles.Standard}>
                            {LANG.getTranslation('connect_your_device')}
                        </Text>
                    </View>
                    <View style={{ flex: 1, alignSelf: 'center' }}>
                        <View style={{}}>
                            <Text
                                style={[
                                    styles.Error,
                                    styles.CenterText,
                                    styles.Shadow,
                                    { color: '#fff' },
                                ]}>
                                {GLOBAL.Show_Error}
                            </Text>
                        </View>
                        <View
                            style={{
                                flexDirection: 'column',
                                alignItems: 'center',
                                paddingBottom: 10,
                            }}>
                            {!this.state.success && (
                                <View style={{ margin: 50 }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'column',
                                        }}>
                                        {this.state.error && (
                                            <Text
                                                style={[
                                                    styles.Standard,
                                                    {
                                                        color: 'red',
                                                        marginBottom: 10,
                                                    },
                                                ]}>
                                                {LANG.getTranslation(
                                                    'pincode_wrong',
                                                )}
                                            </Text>
                                        )}
                                        <View
                                            style={{
                                                borderColor:
                                                    GLOBAL.Device_IsWebTV
                                                        ? '#fff'
                                                        : 'transparent',
                                                borderWidth: 2,
                                            }}>
                                            <TextInput
                                                ref={username =>
                                                    (this.username = username)
                                                }
                                                style={[
                                                    styles.InputMobile,
                                                    { width: 400 },
                                                ]}
                                                value={this.state.userid}
                                                selection={this.state.selection}
                                                placeholder={'123456...'}
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
                                        <View style={{ margin: 50 }}>
                                            <ButtonNormal
                                                Padding={0}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                hasTVPreferredFocus={false}
                                                onPress={() => this.checkCode()}
                                                Text={LANG.getTranslation(
                                                    'submit',
                                                )}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )}
                            {this.state.success && (
                                <View
                                    style={{
                                        flex: 1,
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}>
                                    <FontAwesome5
                                        style={{
                                            fontSize: 150,
                                            color: '#fff',
                                            marginRight: 20,
                                        }}
                                        // icon={SolidIcons.check}
                                        name="check"
                                    />
                                    <Text style={[styles.h4, { color: 'green' }]}>
                                        {LANG.getTranslation(
                                            'connect_device_success',
                                        )}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
