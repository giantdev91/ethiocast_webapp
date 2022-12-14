import React, {Component} from 'react';
import {
    View,
    Text,
    ScrollView,
    Platform,
    BackHandler,
    TVMenuControl,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {Badge} from 'react-native-elements';
export default class About extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        this.state = {
            errortext: '',
            clock: GLOBAL.Clock_Type,
            keyboardType:
                GLOBAL.Device_Type == '_FireTV' ? 'phone-pad' : 'number-pad',
            show_keyboard: GLOBAL.Device_IsSTB == true ? false : true,
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            if (!this.childlock_.isFocused && !this.setlock_.isFocused) {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            }
        }
    };
    updateDimensions() {
        Actions.Settings();
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
                GLOBAL.Focus = 'Home';
                Actions.Home();
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
    _onChangeChildlock() {
        this.setState({
            show_childlock: true,
            show_setlock: false,
        });
        this.focusChildlock();
    }
    _childlockClosePopup() {
        this.setState({
            show_childlock: false,
            show_setlock: false,
        });
    }
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
        Actions.Settings();
    }
    focusButton = () => {
        if (GLOBAL.Device_IsSTB) {
        }
    };

    render() {
        return (
            <View
                style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.53)',
                    marginLeft: 5,
                    flexDirection: 'row',
                    flex: 40,
                    borderRadius: 5,
                }}
            >
                <View style={{flex: 1, margin: 5, borderRadius: 5}}>
                    <ScrollView>
                        <View style={{flex: 1}}>
                            <View
                                style={{
                                    flex: 10,
                                    margin: 5,
                                    paddingLeft: 10,
                                    paddingTop: 10,
                                    backgroundColor: 'rgba(0, 0, 0, 0.33)',
                                    paddingBottom: 20,
                                    borderRadius: 5,
                                }}
                            >
                                <Text style={[styles.H2, {paddingBottom: 15}]}>
                                    {LANG.getTranslation('general_information')}
                                    :
                                </Text>
                                {RenderIf(GLOBAL.Device_IsSmartTV == false)(
                                    <Text style={styles.Standard}>
                                        {LANG.getTranslation('subscription')}:{' '}
                                        {GLOBAL.User.products.productname}
                                    </Text>,
                                )}
                                {RenderIf(
                                    this.props.Type == 'SideListPalladium',
                                )(
                                    <Text style={styles.Standard}>
                                        {LANG.getTranslation('status')}:{' '}
                                        {GLOBAL.User.account.account_status}
                                    </Text>,
                                )}

                                <Text style={styles.Standard}>
                                    {LANG.getTranslation('expires')}:{' '}
                                    {GLOBAL.User.account.date_expired}
                                </Text>

                                <Text style={styles.Standard}>
                                    {LANG.getTranslation('userid')}:{' '}
                                    {GLOBAL.UserID}
                                </Text>
                            </View>
                            <View
                                style={{
                                    borderRadius: 5,
                                    flex: 12,
                                    margin: 5,
                                    paddingLeft: 10,
                                    paddingTop: 10,
                                    backgroundColor: 'rgba(0, 0, 0, 0.33)',
                                    paddingBottom: 20,
                                }}
                            >
                                <Text
                                    style={[
                                        styles.H2,
                                        {marginTop: 5, paddingBottom: 15},
                                    ]}
                                >
                                    {LANG.getTranslation('device_information')}:
                                </Text>
                                <Text style={styles.Medium}>
                                    {LANG.getTranslation('model')}:{' '}
                                    {GLOBAL.Device_Model}
                                </Text>
                                <Text style={styles.Medium}>
                                    {LANG.getTranslation('unique_id')}:{' '}
                                    {GLOBAL.Device_UniqueID}
                                </Text>
                                {/* <Text style={styles.Standard}>UA: {GLOBAL.Device_UserAgent}</Text> */}
                                <Text style={styles.Medium}>
                                    {LANG.getTranslation('ip_address')}:{' '}
                                    {GLOBAL.Device_IpAddress}
                                </Text>
                                <Text style={styles.Medium}>
                                    {LANG.getTranslation('form_factor')}:{' '}
                                    {GLOBAL.Device_FormFactor}
                                </Text>
                                {/* <Text style={styles.Standard}>Tablet: {GLOBAL.Device_IsTablet.toString()}</Text> */}
                                {/* <Text style={styles.Standard}>TV: {GLOBAL.Device_IsTV.toString()}</Text> */}
                                {/* <Text style={styles.Standard}>Phone: {GLOBAL.Device_IsPhone.toString()}</Text>
                                <Text style={styles.Standard}>STB: {GLOBAL.Device_IsSTB.toString()}</Text>
                                <Text style={styles.Standard}>Web: {GLOBAL.Device_IsWebTV.toString()}</Text>
                                <Text style={styles.Standard}>SmartTV: {GLOBAL.Device_IsSmartTV.toString()}</Text>
                                <Text style={styles.Standard}>AppleTV: {GLOBAL.Device_IsAppleTV.toString()}</Text>
                                <Text style={styles.Standard}>AndroidTV: {GLOBAL.Device_IsAndroidTV.toString()}</Text>
                                <Text style={styles.Standard}>FireTV: {GLOBAL.Device_IsFireTV.toString()}</Text> */}
                            </View>
                            <View
                                style={{
                                    borderRadius: 5,
                                    flex: 8,
                                    margin: 5,
                                    paddingLeft: 10,
                                    paddingTop: 10,
                                    backgroundColor: 'rgba(0, 0, 0, 0.33)',
                                    paddingBottom: 20,
                                }}
                            >
                                <Text
                                    style={[
                                        styles.H2,
                                        {marginTop: 5, paddingBottom: 15},
                                    ]}
                                >
                                    {LANG.getTranslation('app_information')}:
                                </Text>
                                <Text style={styles.Medium}>
                                    {LANG.getTranslation('app_version')}:{' '}
                                    {GLOBAL.App_Version}
                                </Text>
                                <Text style={styles.Medium}>
                                    {LANG.getTranslation('package_id')}:{' '}
                                    {GLOBAL.AppPackageID}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}
