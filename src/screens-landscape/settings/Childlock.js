import React, { Component } from 'react';
import { View, Text, BackHandler, TVMenuControl, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Childlock extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            errortext: '',
            successtext: '',
            setlock: '',
            childlock: '',
            childlock_:
                this.props.Old != undefined && this.props.Old != ''
                    ? this.props.Old
                    : '',
            setlock_:
                this.props.New != undefined && this.props.New != ''
                    ? this.props.New
                    : '',
            clock: GLOBAL.Clock_Type,
            keyboardType:
                GLOBAL.Device_Type == '_FireTV' ? 'phone-pad' : 'number-pad',
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        // if (event.keyCode === 10009 || event.keyCode === 1003 || event.keyCode === 461 || event.keyCode == 8) {
        //   GLOBAL.Focus = "Home";
        //   Actions.Home();
        // }
    };
    updateDimensions() {
        Actions.Childlock();
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
                // GLOBAL.Focus = "Home";
                // Actions.Home();
                return true;
            },
        );
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        Actions.pop();
    }
    _childlockValidate() {
        if (GLOBAL.PIN + '' == this.state.childlock_ + '') {
            if (this.state.setlock_ == '') {
                return;
            }
            GLOBAL.PIN = this.state.setlock_ + '';
            UTILS.storeProfile(
                'settings_childlock',
                0,
                0,
                0,
                0,
                [],
                GLOBAL.PIN,
            );
            this.setState({
                successtext: LANG.getTranslation('successchildlockchanged'),
                errortext: '',
            });
        } else {
            this.setState({
                errortext: LANG.getTranslation('pincode_wrong'),
                successtext: '',
            });
        }
    }
    focusSetlock = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.setlock.focus();
        }
    };
    focusChildlock = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.childlock.focus();
        }
    };

    getTimeSetting() {
        if (GLOBAL.Clock_Type == 'AM/PM') {
            this.setState({
                clock: 'AM/PM',
            });
        } else {
            this.setState({
                clock: '24h',
            });
        }
    }
    setTimeSetting() {
        if (GLOBAL.Clock_Type == 'AM/PM') {
            GLOBAL.Clock_Type = '24h';
            GLOBAL.Clock_Setting = 'HH:mm';
            var clock = {
                Clock_Type: GLOBAL.Clock_Type,
                Clock_Setting: GLOBAL.Clock_Setting,
            };
            UTILS.storeProfile('settings_clock', 0, 0, 0, 0, clock, 'value');

            this.setState({
                clock: '24h',
            });
        } else {
            GLOBAL.Clock_Type = 'AM/PM';
            GLOBAL.Clock_Setting = 'hh:mm A';
            var clock = {
                Clock_Type: GLOBAL.Clock_Type,
                Clock_Setting: GLOBAL.Clock_Setting,
            };
            UTILS.storeProfile('settings_clock', 0, 0, 0, 0, clock, 'value');

            this.setState({
                clock: 'AM/PM',
            });
        }
        Actions.Childlock();
    }
    getSecureInputChildlock() {
        var l = this.state.childlock_.length;
        var input = '';
        for (var i = 0; i < l; i++) {
            input += '* ';
        }
        return input;
    }
    getSecureInputChildlockNew() {
        var l = this.state.setlock_.length;
        var input = '';
        for (var i = 0; i < l; i++) {
            input += '* ';
        }
        return input;
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            borderRadius: 5,
                            flex: 8,
                            marginHorizontal: 5,
                            padding: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.33)',
                            paddingBottom: 20,
                        }}
                    >
                        <View
                            style={{
                                borderRadius: 5,
                                height: 100,
                                padding: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.43)',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={[styles.H2, styles.CenterText]}>
                                {LANG.getTranslation('changechildlock')}
                            </Text>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.Subtext,
                                    styles.Width_80_Percent,
                                    styles.CenterText,
                                ]}
                            >
                                {LANG.getTranslation('entercurrentpinandnew')}
                            </Text>
                        </View>
                        {/* </View>
          <View style={{ flex: 9, alignItems:'center'}}> */}
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <View>
                                <View
                                    style={{
                                        margin: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <Text style={styles.menu_text_color_}>
                                        {this.state.successtext}
                                    </Text>
                                    <Text style={styles.Error}>
                                        {this.state.errortext}
                                    </Text>
                                </View>
                                {RenderIf(
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
                                                    'your_current_code',
                                                )}
                                            </Text>
                                        </View>
                                        <InputStandard
                                            ref={childlock =>
                                                (this.childlock = childlock)
                                            }
                                            secureTextEntry={true}
                                            width={
                                                GLOBAL.Device_IsPhone
                                                    ? 150
                                                    : 200
                                            }
                                            value={this.state.childlock_}
                                            icon={'lock'}
                                            onChangeText={text =>
                                                this.setState({
                                                    childlock_: text,
                                                })
                                            }
                                        />
                                    </View>,
                                )}
                                {RenderIf(
                                    GLOBAL.Device_IsSmartTV ||
                                    GLOBAL.Device_IsAppleTV ||
                                    GLOBAL.Device_IsSTB ||
                                    GLOBAL.Device_IsFireTV ||
                                    GLOBAL.Device_IsAndroidTV,
                                )(
                                    <View style={{}}>
                                        <View>
                                            <Text
                                                style={[
                                                    styles.Medium,
                                                    { padding: 10 },
                                                ]}
                                            >
                                                {LANG.getTranslation(
                                                    'your_current_code',
                                                )}
                                            </Text>
                                        </View>
                                        <TouchableHighlightFocus
                                            BorderRadius={5}
                                            style={{
                                                height: GLOBAL.Device_IsSmartTV
                                                    ? 80
                                                    : GLOBAL.Device_IsAppleTV
                                                        ? 118
                                                        : 60,
                                                borderRadius: 5,
                                            }}
                                            hasTVPreferredFocus={true}
                                            underlayColor={GLOBAL.Button_Color}
                                            onPress={() =>
                                                Actions.Auth_Keyboard({
                                                    PlaceHolder:
                                                        LANG.getTranslation(
                                                            'yourcurrentcode',
                                                        ),
                                                    New: this.state.setlock_,
                                                    Old: this.state.childlock_,
                                                    NumbersOnly: true,
                                                    MaxLength: 4,
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
                                                            ? 350
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
                                                        {this.getSecureInputChildlock()}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>,
                                )}
                                {RenderIf(
                                    GLOBAL.Device_IsWebTV == true &&
                                    GLOBAL.Device_IsSmartTV == false,
                                )(
                                    <TouchableHighlightFocus
                                        style={{ height: 60 }}
                                        hasTVPreferredFocus={true}
                                        onPress={this.focusChildlock}
                                        underlayColor="rgba(0, 0, 0, 0.70)"
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
                                                    ref={childlock =>
                                                    (this.childlock =
                                                        childlock)
                                                    }
                                                    style={[
                                                        styles.Input,
                                                        {
                                                            width:
                                                                GLOBAL.Device_Width /
                                                                3,
                                                        },
                                                    ]}
                                                    value={
                                                        this.state.childlock_
                                                    }
                                                    placeholder={LANG.getTranslation(
                                                        'current_code',
                                                    )}
                                                    underlineColorAndroid="rgba(0,0,0,0)"
                                                    placeholderTextColor="#fff"
                                                    selectionColor="#000"
                                                    onChangeText={text =>
                                                        this.setState({
                                                            childlock_: text,
                                                        })
                                                    }
                                                    onBlur={this.focusSetlock}
                                                    secureTextEntry={true}
                                                    maxLength={4}
                                                />
                                            </View>
                                        </View>
                                    </TouchableHighlightFocus>,
                                )}

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
                                                    'your_new_code',
                                                )}
                                            </Text>
                                        </View>
                                        <TouchableHighlightFocus
                                            BorderRadius={5}
                                            style={{
                                                height: GLOBAL.Device_IsSmartTV
                                                    ? 80
                                                    : GLOBAL.Device_IsAppleTV
                                                        ? 118
                                                        : 60,
                                                borderRadius: 5,
                                            }}
                                            hasTVPreferredFocus={true}
                                            underlayColor={GLOBAL.Button_Color}
                                            onPress={() =>
                                                Actions.Auth_Keyboard({
                                                    PlaceHolder:
                                                        LANG.getTranslation(
                                                            'yournewcode',
                                                        ),
                                                    Old: this.state.childlock_,
                                                    New: this.state.setlock_,
                                                    NumbersOnly: true,
                                                    MaxLength: 4,
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
                                                            ? 350
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
                                                        {this.getSecureInputChildlockNew()}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>,
                                )}
                                {RenderIf(
                                    GLOBAL.Device_IsWebTV == true &&
                                    GLOBAL.Device_IsSmartTV == false,
                                )(
                                    <TouchableHighlightFocus
                                        style={{ height: 60 }}
                                        onPress={this.focusSetlock}
                                        underlayColor="rgba(0, 0, 0, 0.70)"
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
                                                    ref={setlock =>
                                                        (this.setlock = setlock)
                                                    }
                                                    style={[
                                                        styles.Input,
                                                        {
                                                            width:
                                                                GLOBAL.Device_Width /
                                                                3,
                                                        },
                                                    ]}
                                                    value={this.state.setlock_}
                                                    placeholder={LANG.getTranslation(
                                                        'new_code',
                                                    )}
                                                    underlineColorAndroid="rgba(0,0,0,0)"
                                                    placeholderTextColor="#fff"
                                                    selectionColor="#000"
                                                    secureTextEntry={true}
                                                    maxLength={4}
                                                    onChangeText={text =>
                                                        this.setState({
                                                            setlock_: text,
                                                        })
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableHighlightFocus>,
                                )}
                                <View style={{ paddingTop: 30 }}>
                                    <ButtonSized
                                        Color={'#000'}
                                        Width={
                                            GLOBAL.Device_IsWebTV == true &&
                                                GLOBAL.Device_IsSmartTV == false
                                                ? GLOBAL.Device_Width / 3
                                                : GLOBAL.Device_IsPhone
                                                    ? 200
                                                    : GLOBAL.Device_IsTablet
                                                        ? 275
                                                        : GLOBAL.Device_IsAppleTV
                                                            ? 400
                                                            : 270
                                        }
                                        Padding={0}
                                        underlayColor={GLOBAL.Button_Color}
                                        hasTVPreferredFocus={true}
                                        onPress={() =>
                                            this._childlockValidate()
                                        }
                                        Text={LANG.getTranslation('submit')}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
