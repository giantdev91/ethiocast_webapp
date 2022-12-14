import React, {Component} from 'react';
import {Text, View, BackHandler, TVMenuControl, FlatList} from 'react-native';
import {Actions} from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import LangCodes from '../../languages/languages';
import {sendPageReport} from '../../reporting/reporting';
export default class Languages extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        GLOBAL.Focus = 'Outside';
        GLOBAL.Show_Error = '';
        this.state = {
            reportStartTime: moment().unix(),
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            languages: GLOBAL.Settings_Services_Login.languages,
            autologin: GLOBAL.AutoLogin,
            show_exit_app: false,
            show_tip: false,
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
        Actions.Languages();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
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
                    BackHandler.exitApp();
                    return true;
                }
            },
        );
        this.autoLogin();
    }
    autoLogin() {
        if (GLOBAL.Selected_Language == '') {
            this.setState({
                autologin: false,
            });
        } else {
            try {
                moment.locale(
                    LangCodes.getLanguageCode(GLOBAL.Selected_Language),
                );
                if (GLOBAL.HasService == true) {
                    if (GLOBAL.Support != '' && GLOBAL.Device_IsPhone == true) {
                        Actions.Services_Text();
                    } else {
                        Actions.Services();
                    }
                } else {
                    if (GLOBAL.InAppPurchase == true) {
                        Actions.Selection();
                    } else {
                        if (
                            GLOBAL.Support != '' &&
                            GLOBAL.Device_IsPhone == true
                        ) {
                            Actions.Authentication_Text();
                        } else {
                            Actions.Authentication();
                        }
                    }
                }
            } catch (e) {
                if (GLOBAL.HasService == true) {
                    if (GLOBAL.Support != '' && GLOBAL.Device_IsPhone == true) {
                        Actions.Services_Text();
                    } else {
                        Actions.Services();
                    }
                } else {
                    if (GLOBAL.Support != '' && GLOBAL.Device_IsPhone == true) {
                        Actions.Authentication_Text();
                    } else {
                        Actions.Authentication();
                    }
                }
            }
        }
    }
    componentWillUnmount() {
        sendPageReport('Language', this.state.reportStartTime, moment().unix());
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
    _setLanguage(index) {
        GLOBAL.Selected_Language = LANG.getLanguage(index.language);
        UTILS.storeJson('Selected_Language', GLOBAL.Selected_Language);
        try {
            moment.locale(LangCodes.getLanguageCode(GLOBAL.Selected_Language));
            if (GLOBAL.HasService == true) {
                if (GLOBAL.Device_IsPhone && GLOBAL.Support != '') {
                    Actions.Services_Text();
                } else {
                    Actions.Services();
                }
            } else {
                if (GLOBAL.Device_IsPhone && GLOBAL.Support != '') {
                    Actions.Authentication_Text();
                } else {
                    Actions.Authentication();
                }
            }
        } catch (e) {
            if (GLOBAL.HasService == true) {
                if (GLOBAL.Device_IsPhone && GLOBAL.Support != '') {
                    Actions.Services_Text();
                } else {
                    Actions.Services();
                }
            } else {
                if (GLOBAL.Device_IsPhone && GLOBAL.Support != '') {
                    Actions.Authentication_Text();
                } else {
                    Actions.Authentication();
                }
            }
        }
    }
    _setFocusOnFirst(index) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
    getLanguage(item, index) {
        if (item.language == null) {
            return null;
        }
        if (LANG.getLanguage(item.language) == null) {
            return null;
        }
        return (
            <View style={{width: GLOBAL.Device_IsAppleTV ? 400 : 300}}>
                <ButtonNormal
                    Padding={0}
                    underlayColor={GLOBAL.Button_Color}
                    hasTVPreferredFocus={this._setFocusOnFirst(index)}
                    onPress={() => this._setLanguage(item)}
                    Text={LANG.getLanguage(item.language)}
                />
            </View>
        );
    }
    _closePopup() {
        this.setState({
            show_tip: false,
        });
    }
    render() {
        return (
            <Container needs_notch={true} hide_menu={true} hide_header={true}>
                {RenderIf(this.state.show_exit_app)(
                    <Modal
                        Title={LANG.getTranslation('exit_app')}
                        Centered={true}
                        TextHeader={LANG.getTranslation('exit_app_click_again')}
                        TextMain={LANG.getTranslation('exit_app_close')}
                    ></Modal>,
                )}
                {RenderIf(this.state.autologin == false)(
                    <View
                        style={[
                            {
                                flex: 1,
                                margin: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 5,
                            },
                        ]}
                    >
                        <View
                            style={{
                                flex: 3,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        ></View>
                        <View
                            style={{
                                flex: 8,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <FlatList
                                ref={ref => {
                                    this.flatListRef = ref;
                                }}
                                data={this.state.languages}
                                horizontal={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item, index}) => {
                                    return this.getLanguage(item, index);
                                }}
                            />
                        </View>
                        <View style={{flex: 2}}>
                            <View></View>
                        </View>
                        <View
                            style={{position: 'absolute', left: 20, bottom: 20}}
                        >
                            <Text style={[styles.Small, styles.Shadow]}>
                                {GLOBAL.Device_FormFactor}
                            </Text>
                            <Text style={[styles.Small, styles.Shadow]}>
                                mac{GLOBAL.Device_MacAddress}
                            </Text>
                        </View>
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
}
