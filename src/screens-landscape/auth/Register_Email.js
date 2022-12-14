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
    ScrollView,
} from 'react-native';
import HTML from 'react-native-render-html';
import decode from 'unescape';
import { Actions } from 'react-native-router-flux';

import TimerMixin from 'react-timer-mixin';
export default class Register_Email extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            support: decode(GLOBAL.Support),
            password: '',
            email: '',
            firstname: '',
            lastname: '',
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
            if (GLOBAL.Device_Type == '_SmartTV_LG') {
                Actions.Authentication();
            }
        }
    };
    goBack() {
        if (GLOBAL.Device_IsSmartTV == true) {
            Actions.Authentication();
        } else {
            if (
                GLOBAL.Device_IsPhone == true ||
                GLOBAL.Device_IsTablet == true
            ) {
                Actions.Register();
            } else {
                Actions.Authentication();
            }
        }
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
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
                if (GLOBAL.Device_IsSmartTV == true) {
                    Actions.Authentication();
                } else {
                    if (
                        GLOBAL.Device_IsPhone == true ||
                        GLOBAL.Device_IsTablet == true
                    ) {
                        Actions.Register();
                    } else {
                        Actions.Authentication();
                    }
                }
                return true;
            },
        );
        this.getProduct();
        // if (this.props.granted != undefined) {
        //   if (this.props.granted == false) {
        //     this.setState({
        //       error: this.props.result.message,
        //     });
        //   } else {
        //     this.setState({
        //       password: this.props.password,
        //       email: this.props.email,
        //       firstname: this.props.firstname,
        //       lastname: this.props.lastname
        //     });
        //     this.sleepModeTimer = TimerMixin.setTimeout(() => {
        //       this._finishRegister();
        //     }, 2000)
        //   }
        // }
    }
    getIp() {
        DAL.getJson(
            GLOBAL.HTTPvsHTTPS +
            'cloudtv.akamaized.net/ip.php?_=' +
            moment().unix(),
        )
            .then(data => {
                if (data != undefined) {
                    GLOBAL.Device_IpAddress = data.ip;
                    this.getLocation();
                }
            })
            .catch(error => { });
    }
    getLocation() {
        DAL.getLocation(GLOBAL.Device_IpAddress)
            .then(location => {
                if (location != undefined) {
                    GLOBAL.City = location.city;
                    GLOBAL.State = location.regionName;
                    GLOBAL.Country = location.country;
                    GLOBAL.Timezone = location.timezone;
                    GLOBAL.Latitude = location.lat;
                    GLOBAL.Longitude = location.lon;
                }
            })
            .catch(error => { });
    }
    getProduct() {
        var path =
            GLOBAL.HTTPvsHTTPS +
            'cloudtv.akamaized.net/mappings/' +
            GLOBAL.Package +
            '/settings/product_types.json?time=' +
            moment().unix();
        DAL.getJson(path)
            .then(data => {
                if (data != null) {
                    var productid = data.products.filter(
                        t => t.type == 'freemium',
                    );
                    this.setState({
                        product_id: productid[0].id,
                    });
                    this.getIp();
                }
            })
            .catch(error => {
                this.getIp();
            });
    }
    _finishRegister() {
        this.setState({
            show_loader: true,
        });
        DAL.registerCustomer(
            this.state.product_id,
            this.state.firstname,
            this.state.lastname,
            this.state.password,
            this.state.email,
            true,
            false,
            this.state.email,
            '0',
        )
            .then(data => {
                //start login process
                UTILS.storeJson('UserID', this.state.email);
                UTILS.storeJson('Pass', data.password);
                GLOBAL.UserID = this.state.email;
                GLOBAL.Pass = data.password;
                TimerMixin.clearTimeout(this.datatimer);
                this.datatimer = TimerMixin.setTimeout(() => {
                    Actions.DataLoader();
                }, 2000);
            })
            .catch(error => {
                this.setState({
                    show_loader: false,
                    error: 'Something went wrong: ' + error,
                });
            });
    }
    componentWillUnmount() {
        TimerMixin.clearTimeout(this.datatimer);
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
    // _EmailSignin() {
    //   this._finishRegister();
    // }
    render() {
        return (
            <Container hide_menu={true} hide_header={true}>
                {RenderIf(this.state.show_loader)(
                    <View style={{ flex: 1 }}>
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Loader size={'large'} color={'#e0e0e0'} />
                            <Text style={styles.Standard}>
                                {LANG.getTranslation('register')}
                            </Text>
                        </View>
                    </View>,
                )}
                {RenderIf(!this.state.show_loader && GLOBAL.Device_IsPhone)(
                    <View style={styles.container_authentication}>
                        {this.showServicePage()}
                    </View>,
                )}
                {RenderIf(!this.state.show_loader && !GLOBAL.Device_IsPhone)(
                    <View style={styles.container_authentication}>
                        {this.showServicePage_()}
                    </View>,
                )}
            </Container>
        );
    }
    focusPassword = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.password_.focus();
        }
    };
    _startRegister() {
        if (GLOBAL.Device_IsSmartTV == true) {
            Actions.Register_SmartTV();
        } else {
            Actions.Register();
        }
    }
    focusFirstname = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.firstname_.focus();
        }
    };
    focusLastname = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.lastname_.focus();
        }
    };
    focusEmail = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.email_.focus();
        }
    };
    showServicePage_() {
        return (
            <View style={styles.container_authentication}>
                <View padding={10} style={styles.inner_container_left}>
                    <Text style={styles.text_red_tiny}>{this.state.error}</Text>
                    <View padding={10} style={styles.inner_container_left}>
                        <TouchableHighlightFocus
                            hasTVPreferredFocus={GLOBAL.Device_IsTV}
                            onPress={this.focusFirstname}
                            underlayColor="rgba(0, 0, 0, 0.70)"
                        >
                            <TextInput
                                ref={firstname_ =>
                                    (this.firstname_ = firstname_)
                                }
                                style={[styles.Input, { width: 300 }]}
                                value={this.state.firstname}
                                placeholder={LANG.getTranslation('firstname')}
                                underlineColorAndroid="rgba(0,0,0,0)"
                                placeholderTextColor="#fff"
                                selectionColor="#000"
                                onChangeText={text =>
                                    this.setState({ firstname: text })
                                }
                                keyboardAppearance={'dark'}
                                onBlur={this.focusButton}
                            />
                        </TouchableHighlightFocus>
                        <TouchableHighlightFocus
                            onPress={this.focusLastname}
                            underlayColor="rgba(0, 0, 0, 0.70)"
                        >
                            <TextInput
                                ref={lastname_ => (this.lastname_ = lastname_)}
                                style={[styles.Input, { width: 300 }]}
                                value={this.state.lastname}
                                placeholder={LANG.getTranslation('lastname')}
                                underlineColorAndroid="rgba(0,0,0,0)"
                                placeholderTextColor="#fff"
                                selectionColor="#000"
                                onChangeText={text =>
                                    this.setState({ lastname: text })
                                }
                                keyboardAppearance={'dark'}
                                onBlur={this.focusButton}
                            />
                        </TouchableHighlightFocus>
                        <TouchableHighlightFocus
                            onPress={this.focusEmail}
                            underlayColor="rgba(0, 0, 0, 0.70)"
                        >
                            <TextInput
                                ref={email_ => (this.email_ = email_)}
                                style={[styles.Input, { width: 300 }]}
                                value={this.state.email}
                                placeholder={LANG.getTranslation(
                                    'email_address',
                                )}
                                underlineColorAndroid="rgba(0,0,0,0)"
                                placeholderTextColor="#fff"
                                selectionColor="#000"
                                onChangeText={text =>
                                    this.setState({ email: text })
                                }
                                keyboardAppearance={'dark'}
                                onBlur={this.focusButton}
                            />
                        </TouchableHighlightFocus>
                        <TouchableHighlightFocus
                            onPress={this.focusPassword}
                            underlayColor="rgba(0, 0, 0, 0.70)"
                        >
                            <TextInput
                                ref={password_ => (this.password_ = password_)}
                                style={[styles.Input, { width: 300 }]}
                                value={this.state.password}
                                placeholder={LANG.getTranslation('password')}
                                underlineColorAndroid="rgba(0,0,0,0)"
                                placeholderTextColor="#fff"
                                selectionColor="#000"
                                secureTextEntry={true}
                                onChangeText={text =>
                                    this.setState({ password: text })
                                }
                                keyboardAppearance={'dark'}
                                onBlur={this.focusButton}
                            />
                        </TouchableHighlightFocus>
                        <View style={{ margin: 10 }}>
                            <Text
                                style={[
                                    styles.Error,
                                    styles.CenterText,
                                    { color: '#fff' },
                                ]}
                            >
                                {LANG.getTranslation('press_ok_enter')}
                            </Text>
                        </View>
                        <View style={{ width: 300 }}>
                            <ButtonNormal
                                Icon={"envelope"}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._finishRegister()}
                                Text={LANG.getTranslation('sign_in_with_email')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this.goBack()}
                                Text={LANG.getTranslation('back')}
                            />
                        </View>
                    </View>
                </View>
                <View
                    padding={10}
                    style={[styles.inner_container_right, { height: '100%' }]}
                >
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <View
                            style={{ flex: 4, flexDirection: 'row', height: 100 }}
                        >
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
                                flex: 5,
                                flexDirection: 'row',
                                width: '100%',
                                height: GLOBAL.Device_IsTV ? 100 : 200,
                            }}
                        >
                            <View padding={10} style={styles.view_center}>
                                <ScrollView style={{ flex: 1 }}>
                                    <View style={styles.CenterText}>
                                        <HTML
                                            source={{ html: this.state.support }}
                                            style={[
                                                styles.menu_text_color,
                                                { color: '#fff', width: 200 },
                                            ]}
                                            tagsStyles={{ p: styles.Standard }}
                                            baseFontStyle={{
                                                color: '#fff',
                                                fontSize: GLOBAL.Device_IsTV
                                                    ? 16
                                                    : 12,
                                            }}
                                        />
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                        <View style={{ flex: 5, flexDirection: 'row' }}>
                            {RenderIf(GLOBAL.Device_IsWebTV == true)(
                                <View style={styles.view_center}>
                                    <View
                                        style={{
                                            flex: 2,
                                            flexDirection: 'row',
                                            width: '100%',
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Android_Download_Enabled &&
                                            !GLOBAL.Device_IsAppleTV,
                                        )(
                                            <View style={[styles.view_center]}>
                                                <QRCode
                                                    value={
                                                        GLOBAL.Android_Download_Link
                                                    }
                                                    size={
                                                        GLOBAL.Device_IsTV
                                                            ? 75
                                                            : 100
                                                    }
                                                />
                                            </View>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.IOS_Download_Enabled &&
                                            !GLOBAL.Device_IsAppleTV,
                                        )(
                                            <View style={[styles.view_center]}>
                                                <QRCode
                                                    value={
                                                        GLOBAL.IOS_Download_Link
                                                    }
                                                    size={
                                                        GLOBAL.Device_IsTV
                                                            ? 75
                                                            : 100
                                                    }
                                                />
                                            </View>,
                                        )}
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            width: '100%',
                                            paddingTop: 20,
                                        }}
                                    >
                                        {RenderIf(GLOBAL.IOS_Download_Enabled)(
                                            <View style={[styles.view_center]}>
                                                <Image
                                                    onPress={() =>
                                                        this._openGoogleLink()
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
                                                    source={require('../../images/google.png')}
                                                ></Image>
                                            </View>,
                                        )}
                                        {RenderIf(GLOBAL.IOS_Download_Enabled)(
                                            <View style={[styles.view_center]}>
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
        );
    }
    showServicePage() {
        return (
            <View style={styles.container_authentication}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                    style={{ flex: 1 }}
                >
                    <View style={{ flex: 1 }}>
                        <View style={styles.view_center}>
                            <Image
                                style={styles.operator_logo_login}
                                resizeMode={'contain'}
                                source={{ uri: this.state.logo }}
                            ></Image>
                        </View>
                        <Text style={styles.text_red_tiny}>
                            {this.state.error}
                        </Text>
                        <View
                            padding={10}
                            style={[styles.inner_container_left]}
                        >
                            <TouchableHighlightFocus
                                hasTVPreferredFocus={GLOBAL.Device_IsTV}
                                onPress={this.focusFirstname}
                                underlayColor="rgba(0, 0, 0, 0.70)"
                            >
                                <TextInput
                                    ref={firstname_ =>
                                        (this.firstname_ = firstname_)
                                    }
                                    style={[styles.Input, { width: 300 }]}
                                    value={this.state.firstname}
                                    placeholder={LANG.getTranslation(
                                        'firstname',
                                    )}
                                    underlineColorAndroid="rgba(0,0,0,0)"
                                    placeholderTextColor="#fff"
                                    selectionColor="#000"
                                    onChangeText={text =>
                                        this.setState({ firstname: text })
                                    }
                                    keyboardAppearance={'dark'}
                                    onBlur={this.focusButton}
                                />
                            </TouchableHighlightFocus>
                            <TouchableHighlightFocus
                                onPress={this.focusLastname}
                                underlayColor="rgba(0, 0, 0, 0.70)"
                            >
                                <TextInput
                                    ref={lastname_ =>
                                        (this.lastname_ = lastname_)
                                    }
                                    style={[styles.Input, { width: 300 }]}
                                    value={this.state.lastname}
                                    placeholder={LANG.getTranslation(
                                        'lastname',
                                    )}
                                    underlineColorAndroid="rgba(0,0,0,0)"
                                    placeholderTextColor="#fff"
                                    selectionColor="#000"
                                    onChangeText={text =>
                                        this.setState({ lastname: text })
                                    }
                                    keyboardAppearance={'dark'}
                                    onBlur={this.focusButton}
                                />
                            </TouchableHighlightFocus>
                            <TouchableHighlightFocus
                                onPress={this.focusEmail}
                                underlayColor="rgba(0, 0, 0, 0.70)"
                            >
                                <TextInput
                                    ref={email_ => (this.email_ = email_)}
                                    style={[styles.Input, { width: 300 }]}
                                    value={this.state.email}
                                    placeholder={LANG.getTranslation(
                                        'email_address',
                                    )}
                                    underlineColorAndroid="rgba(0,0,0,0)"
                                    placeholderTextColor="#fff"
                                    selectionColor="#000"
                                    onChangeText={text =>
                                        this.setState({ email: text })
                                    }
                                    keyboardAppearance={'dark'}
                                    onBlur={this.focusButton}
                                />
                            </TouchableHighlightFocus>
                            <TouchableHighlightFocus
                                onPress={this.focusPassword}
                                underlayColor="rgba(0, 0, 0, 0.70)"
                            >
                                <TextInput
                                    ref={password_ =>
                                        (this.password_ = password_)
                                    }
                                    style={[styles.Input, { width: 300 }]}
                                    value={this.state.password}
                                    placeholder={LANG.getTranslation(
                                        'password',
                                    )}
                                    underlineColorAndroid="rgba(0,0,0,0)"
                                    placeholderTextColor="#fff"
                                    selectionColor="#000"
                                    secureTextEntry={true}
                                    onChangeText={text =>
                                        this.setState({ password: text })
                                    }
                                    keyboardAppearance={'dark'}
                                    onBlur={this.focusButton}
                                />
                            </TouchableHighlightFocus>
                            <View style={{ margin: 10 }}>
                                <Text
                                    style={[
                                        styles.Error,
                                        styles.CenterText,
                                        { color: '#fff' },
                                    ]}
                                >
                                    {LANG.getTranslation('press_ok_enter')}
                                </Text>
                            </View>
                            <ButtonNormal
                                Icon={"envelope"}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._finishRegister()}
                                Text={LANG.getTranslation('sign_in_with_email')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this.goBack()}
                                Text={LANG.getTranslation('back')}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }
}
