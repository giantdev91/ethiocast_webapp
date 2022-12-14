import React, { Component } from 'react';
import {
    Text,
    TextInput,
    View,
    Image,
    BackHandler,
    TVMenuControl,
    ScrollView,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import HTML from 'react-native-render-html';
import decode from 'unescape';

import TimerMixin from 'react-timer-mixin';
export default class Register extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            support: decode(GLOBAL.Support),
            loggedIn: false,
            userInfo: [],
            password: '',
            facebook: false,
            google: false,
            result: [],
            set_password: false,
            show_loader: false,
            product_id: 1,
            userInfo: [],
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
            GLOBAL.Selected_Language = '';
            Actions.Authentication();
        }
    };
    updateDimensions() {
        Actions.Register();
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
        this.getProduct();
        if (this.props.facebook != undefined) {
            this.setState({
                result: this.props.result,
                facebook: this.props.facebook,
                google: this.props.google,
                set_password: true,
            });
        }
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

    async facebookLogin() {
        if (GLOBAL.Device_IsWebTV) {
            facebookLoginWeb();
        } else {
            await LoginManager.logInWithPermissions(['public_profile', 'email'])
                .then(user => {
                    if (!user.isCancelled) {
                        AccessToken.getCurrentAccessToken().then(res => {
                            this.FBGraphRequest(
                                'id, email,first_name, last_name, picture.type(large)',
                                this.FBLoginCallback,
                            );
                        });
                    } else {
                    }
                })
                .catch(err => {
                    this.setState({
                        error: 'Something went wrong: ' + err,
                    });
                })
                .done();
        }
    }
    async FBGraphRequest(fields, callback) {
        const accessData = await AccessToken.getCurrentAccessToken(); // Create a graph request asking for user information
        const infoRequest = new GraphRequest(
            '/me',
            {
                accessToken: accessData.accessToken,
                parameters: {
                    fields: {
                        string: fields,
                    },
                },
            },
            callback.bind(this),
        ); // Execute the graph request created above
        new GraphRequestManager().addRequest(infoRequest).start();
    }
    async FBLoginCallback(error, result) {
        if (error) {
            this.setState({
                error: 'Something went wrong: ' + error,
            });
        } else {
            this.setState({
                result: result,
                facebook: true,
                google: false,
                set_password: true,
            });
        }
    }
    _finishRegisterWeb(result, facebook, google) {
        Actions.Register({ result: result, facebook: facebook, google: google });
    }
    _finishRegister() {
        this.setState({
            set_password: false,
            show_loader: true,
        });
        if (this.state.facebook == true) {
            DAL.registerCustomer(
                this.state.product_id,
                this.state.result.first_name,
                this.state.result.last_name,
                this.state.password,
                this.state.result.email,
                true,
                false,
                this.state.result.email,
                '0',
            )
                .then(data => {
                    UTILS.storeJson('UserID', this.state.result.email);
                    UTILS.storeJson('Pass', data.password);
                    GLOBAL.UserID = this.state.result.email;
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
        if (this.state.google == true) {
            var firstname = this.state.result.user.givenName;
            var lastname = this.state.result.user.familyName;
            if (this.props.facebook != undefined) {
                firstname =
                    this.state.result.additionalUserInfo.profile.given_name;
                lastname =
                    this.state.result.additionalUserInfo.profile.family_name;
            }
            if (firstname == null || firstname == 'null') {
                var splitEmail = this.state.result.user.email.split('@');
                var splitName;
                if (splitEmail[0].indexOf('.') > 0) {
                    splitName = splitEmail[0].split('.');
                } else if (splitEmail[0].indexOf('_') > 0) {
                    splitName = splitEmail[0].split('.');
                }
                firstname = splitName[0];
                if (lastname == null || lastname == 'null') {
                    if (splitName.length > 1) {
                        lastname = splitName[1];
                    }
                }
            }
            DAL.registerCustomer(
                this.state.product_id,
                firstname,
                lastname,
                this.state.password,
                this.state.result.user.email,
                true,
                false,
                this.state.result.user.email,
                '0',
            )
                .then(data => {
                    //start login process
                    GLOBAL.UserID = this.state.result.user.email;
                    GLOBAL.Pass = data.password;
                    UTILS.storeJson('UserID', this.state.result.user.email);
                    UTILS.storeJson('Pass', data.password);
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
    }

    _GoogleSignIn() {
        if (GLOBAL.Device_IsWebTV) {
            googleLoginWeb(this._finishRegisterWeb);
        } else {
            GoogleSignin.configure();
            GoogleSignin.signIn()
                .then(user => {
                    GoogleSignin.getTokens().then(res => {
                        this.setState({
                            result: user,
                            loggedIn: true,
                            facebook: false,
                            google: true,
                            set_password: true,
                        });
                    });
                })
                .catch(err => {
                    this.setState({
                        error: 'Something went wrong: ' + err,
                    });
                })
                .done();
        }
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
                {RenderIf(!this.state.show_loader)(
                    <View style={styles.container_authentication}>
                        {this.showServicePage()}
                    </View>,
                )}
            </Container>
        );
    }
    _onChangeLanguage() {
        GLOBAL.Selected_Language = '';
        Actions.Languages();
    }
    _backToService() {
        GLOBAL.AutoLogin = false;
        Actions.Services();
    }
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
    focusPassword = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.password.focus();
        }
    };
    showServicePage() {
        return (
            <View
                style={[
                    styles.container_authentication,
                    { backgroundColor: 'rgba(0, 0, 0, 0.20)', radius: 5 },
                ]}
            >
                {RenderIf(GLOBAL.Device_IsPhone)(
                    <View style={styles.container_authentication_}>
                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.view_center}>
                                            <Image
                                                style={
                                                    styles.operator_logo_login
                                                }
                                                resizeMode={'contain'}
                                                source={{ uri: this.state.logo }}
                                            ></Image>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ width: 300, paddingBottom: 30 }}>
                                    {RenderIf(this.state.set_password == false)(
                                        <View
                                            style={{
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {RenderIf(
                                                (GLOBAL.SocialFacebook ==
                                                    true &&
                                                    GLOBAL.Device_IsPhone ==
                                                    true) ||
                                                GLOBAL.Device_IsTablet ==
                                                true,
                                            )(
                                                <ButtonNormal
                                                    Icon={"facebook"}
                                                    Padding={0}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    hasTVPreferredFocus={false}
                                                    onPress={() =>
                                                        this.facebookLogin()
                                                    }
                                                    Text={LANG.getTranslation(
                                                        'sign_in_with_facebook',
                                                    )}
                                                />,
                                            )}
                                            {RenderIf(
                                                GLOBAL.SocialEmail == true,
                                            )(
                                                <ButtonNormal
                                                    Icon={"envelope"}
                                                    Padding={0}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    hasTVPreferredFocus={false}
                                                    onPress={() =>
                                                        Actions.Register_Email()
                                                    }
                                                    Text={LANG.getTranslation(
                                                        'sign_in_with_email',
                                                    )}
                                                />,
                                            )}
                                            <ButtonNormal
                                                Padding={0}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                hasTVPreferredFocus={false}
                                                onPress={() =>
                                                    Actions.Authentication()
                                                }
                                                Text={LANG.getTranslation(
                                                    'back_to_login',
                                                )}
                                            />
                                        </View>,
                                    )}
                                    {RenderIf(this.state.set_password == true)(
                                        <View
                                            style={{
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    margin: 10,
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Text style={styles.Standard}>
                                                    {LANG.getTranslation(
                                                        'set_password_for_app',
                                                    )}
                                                </Text>
                                            </View>
                                            <TouchableHighlightFocus
                                                onPress={this.focusPassword}
                                                underlayColor="rgba(0, 0, 0, 0.70)"
                                            >
                                                <TextInput
                                                    ref={password =>
                                                    (this.password =
                                                        password)
                                                    }
                                                    style={[
                                                        styles.Input,
                                                        { width: 300 },
                                                    ]}
                                                    value={this.state.password}
                                                    placeholder={LANG.getTranslation(
                                                        'password',
                                                    )}
                                                    underlineColorAndroid="rgba(0,0,0,0)"
                                                    placeholderTextColor="#fff"
                                                    selectionColor="#000"
                                                    secureTextEntry={true}
                                                    onChangeText={text =>
                                                        this.setState({
                                                            password: text,
                                                        })
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
                                                    {LANG.getTranslation(
                                                        'press_ok_enter',
                                                    )}
                                                </Text>
                                            </View>
                                            <ButtonNormal
                                                Padding={0}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                hasTVPreferredFocus={false}
                                                onPress={() =>
                                                    this._finishRegister()
                                                }
                                                Text={LANG.getTranslation(
                                                    'submit',
                                                )}
                                            />
                                        </View>,
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>,
                )}
                {RenderIf(!GLOBAL.Device_IsPhone)(
                    <View style={[styles.container_authentication, {}]}>
                        {RenderIf(this.state.set_password == false)(
                            <View
                                padding={10}
                                style={styles.inner_container_left}
                            >
                                <View style={{ width: 300 }}>
                                    {RenderIf(
                                        (GLOBAL.SocialFacebook == true &&
                                            GLOBAL.Device_IsPhone == true) ||
                                        GLOBAL.Device_IsTablet == true,
                                    )(
                                        <ButtonNormal
                                            Icon={"facebook"}
                                            Padding={0}
                                            underlayColor={GLOBAL.Button_Color}
                                            hasTVPreferredFocus={false}
                                            onPress={() => this.facebookLogin()}
                                            Text={LANG.getTranslation(
                                                'sign_in_with_facebook',
                                            )}
                                        />,
                                    )}
                                    {RenderIf(GLOBAL.SocialEmail == true)(
                                        <ButtonNormal
                                            Icon={"envelope"}
                                            Padding={0}
                                            underlayColor={GLOBAL.Button_Color}
                                            hasTVPreferredFocus={false}
                                            onPress={() =>
                                                Actions.Register_Email()
                                            }
                                            Text={LANG.getTranslation(
                                                'sign_in_with_email',
                                            )}
                                        />,
                                    )}
                                    <ButtonNormal
                                        Padding={0}
                                        underlayColor={GLOBAL.Button_Color}
                                        hasTVPreferredFocus={false}
                                        onPress={() => Actions.Authentication()}
                                        Text={LANG.getTranslation(
                                            'back_to_login',
                                        )}
                                    />
                                </View>
                            </View>,
                        )}
                        {RenderIf(this.state.set_password == true)(
                            <View
                                padding={10}
                                style={styles.inner_container_left}
                            >
                                <View
                                    style={{
                                        margin: 10,
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text style={styles.Standard}>
                                        {LANG.getTranslation(
                                            'set_password_for_app',
                                        )}
                                    </Text>
                                </View>
                                <TouchableHighlightFocus
                                    onPress={this.focusPassword}
                                    underlayColor="rgba(0, 0, 0, 0.70)"
                                >
                                    <TextInput
                                        ref={password =>
                                            (this.password = password)
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
                                    Padding={0}
                                    underlayColor={GLOBAL.Button_Color}
                                    hasTVPreferredFocus={false}
                                    onPress={() => this._finishRegister()}
                                    Text={LANG.getTranslation('submit')}
                                />
                            </View>,
                        )}
                        <View
                            padding={10}
                            style={[
                                styles.inner_container_right,
                                { height: '100%' },
                            ]}
                        >
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                <View
                                    style={{
                                        flex: 4,
                                        flexDirection: 'row',
                                        height: 100,
                                    }}
                                >
                                    <View style={styles.view_center}>
                                        <Image
                                            style={styles.operator_logo_login}
                                            resizeMode={'contain'}
                                            source={{ uri: this.state.logo }}
                                        ></Image>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>,
                )}
            </View>
        );
    }
}
