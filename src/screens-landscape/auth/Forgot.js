import React, {Component} from 'react';
import {
    View,
    Image,
    BackHandler,
    TVMenuControl,
    ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import HTML from 'react-native-render-html';
import decode from 'unescape';
import DropdownAlert from 'react-native-dropdownalert';
import {sendPageReport} from '../../reporting/reporting';
export default class Forgot extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        GLOBAL.Focus = 'Outside';
        this.state = {
            reportStartTime: moment().unix(),
            logo: GLOBAL.Logo,
            background: GLOBAL.Background,
            support: GLOBAL.Support,
            support: decode(GLOBAL.Support),
            userid: '',
            emailaddress: '',
            macaddress: '',
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
            Actions.Authentication();
        }
    };
    updateDimensions() {
        Actions.Forgot();
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
                Actions.Authentication();
                return true;
            },
        );
    }
    componentWillUnmount() {
        sendPageReport(
            'Request Login',
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
    _onBack() {
        Actions.Authentication();
    }
    _onSubmitService(type) {
        DAL.forgotPassword(type, '', GLOBAL.UserID, GLOBAL.Device_UniqueID)
            .then(data => {
                this.dropdown.alertWithType(
                    'success',
                    'Success',
                    LANG.getTranslation('forgot_request_sent'),
                );
            })
            .catch(error => {
                this.dropdown.alertWithType('error', 'Error', 'Error');
            });
    }
    focusMac = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.mac.focus();
        }
    };
    focusUser = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.user.focus();
        }
    };
    focusEmail = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.email.focus();
        }
    };
    render() {
        return (
            <Container needs_notch={true} hide_menu={true} hide_header={true}>
                <View
                    style={[
                        {
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.60)',
                            height: '100%',
                            margin: 10,
                            borderRadius: 5,
                        },
                    ]}
                >
                    {this.showServicePage()}
                    <DropdownAlert
                        ref={ref => (this.dropdown = ref)}
                        onClose={data => this._onBack(data)}
                    />
                </View>
            </Container>
        );
    }
    showServicePage() {
        return (
            <View style={[styles.container_authentication, {}]}>
                {RenderIf(!GLOBAL.Device_IsPhone)(
                    <View style={{flex: 1}}>
                        <View
                            padding={10}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={true}
                                onPress={() => this._onSubmitService('email')}
                                Text={LANG.getTranslation('email')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._onSubmitService('sms')}
                                Text={LANG.getTranslation('sms')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._onBack()}
                                Text={LANG.getTranslation('back_login')}
                            />
                        </View>
                    </View>,
                )}
            </View>
        );
    }
}
