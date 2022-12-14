import React, { PureComponent } from 'react';
import { View, Text, BackHandler, TVMenuControl, Dimensions } from 'react-native';
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Actions } from 'react-native-router-flux';
export default class Auth_Keyboard extends PureComponent {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        GLOBAL.Focus = 'Outside';
        GLOBAL.SearchInput = '';
        if (GLOBAL.Device_Width == 0) {
            var width = Dimensions.get('window').width;
            GLOBAL.Device_Width = width;
        }
        this.state = {
            background: GLOBAL.Background,
            text: this.props.Value,
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
            this.getBackPreviousScreen();
        }
    };
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
                this.getBackPreviousScreen();
                return true;
            },
        );
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsWebTV) {
            document.removeEventListener('keydown', this.backButton, false);
        }
    }
    getBackPreviousScreen() {
        if (
            this.props.PlaceHolder == LANG.getTranslation('yourcurrentcode') ||
            this.props.PlaceHolder == LANG.getTranslation('yournewcode')
        ) {
            Actions.Settings({ settings_page: 'Childlock' });
        }
        if (
            this.props.PlaceHolder == LANG.getTranslation('userid') ||
            this.props.PlaceHolder == LANG.getTranslation('password')
        ) {
            Actions.Authentication();
        }
        if (this.props.PlaceHolder == LANG.getTranslation('serviceid')) {
            Actions.Services();
        }
        if (
            this.props.PlaceHolder == LANG.getTranslation('your_profile_name')
        ) {
            Actions.EditProfile();
        }
        if (this.props.PlaceHolder == LANG.getTranslation('profile_name')) {
            Actions.EditProfile({
                profile: this.props.profile,
                index: this.props.index,
                Value: this.props.text,
            });
        }
        if (this.props.PlaceHolder == LANG.getTranslation('m3u_your_url')) {
            Actions.Player_M3U({ m3u_url: this.state.text });
        }
    }
    submitToPreviousScreen() {
        if (this.props.PlaceHolder == LANG.getTranslation('yourcurrentcode')) {
            Actions.Settings({
                settings_page: 'Childlock',
                Old: this.state.text,
                New: this.props.New,
            });
        }
        if (this.props.PlaceHolder == LANG.getTranslation('yournewcode')) {
            Actions.Settings({
                settings_page: 'Childlock',
                New: this.state.text,
                Old: this.props.Old,
            });
        }
        if (this.props.PlaceHolder == LANG.getTranslation('userid')) {
            Actions.Authentication({ Username: this.state.text });
        }
        if (this.props.PlaceHolder == LANG.getTranslation('password')) {
            Actions.Authentication({ Password: this.state.text });
        }
        if (
            this.props.PlaceHolder == LANG.getTranslation('your_profile_name')
        ) {
            Actions.CreateProfile({ Value: this.state.text });
        }
        if (this.props.PlaceHolder == LANG.getTranslation('profile_name')) {
            Actions.EditProfile({
                Value: this.state.text,
                profile: this.props.profile,
                index: this.props.index,
            });
        }
        if (this.props.PlaceHolder == LANG.getTranslation('serviceid')) {
            Actions.Services({ ServiceID: this.state.text });
        }
        if (this.props.PlaceHolder == LANG.getTranslation('m3u_your_url')) {
            Actions.Player_M3U({ m3u_url: this.state.text });
        }
    }
    onChangeText = value => {
        this.setState({ text: value });
    };
    getIcon() {
        if (this.props.PlaceHolder == LANG.getTranslation('m3u_your_url')) {
            return "globe";
        }
        if (this.props.PlaceHolder == LANG.getTranslation('yourcurrentcode')) {
            return "lock";
        }
        if (this.props.PlaceHolder == LANG.getTranslation('yournewcode')) {
            return "lock";
        }
        if (this.props.PlaceHolder == LANG.getTranslation('profile_name')) {
            return "user";
        }
        if (
            this.props.PlaceHolder == LANG.getTranslation('your_profile_name')
        ) {
            return "user";
        }
        if (this.props.PlaceHolder == LANG.getTranslation('userid')) {
            return "user";
        }
        if (this.props.PlaceHolder == LANG.getTranslation('password')) {
            return "lock";
        }
        if (this.props.PlaceHolder == LANG.getTranslation('serviceid')) {
            return "project-diagram"
        }
    }
    render() {
        let NumbersOnly = this.props.NumbersOnly;
        let PlaceHolder = this.props.PlaceHolder;
        let OldText = this.props.Value;

        return (
            <Container
                hide_menu={true}
                hide_header={true}
                background={this.state.background}
            >
                <View
                    style={[
                        {
                            flexDirection: 'column',
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.60)',
                            margin: 10,
                            borderRadius: 5,
                        },
                    ]}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, margin: 20 }}>
                            <Text style={styles.H2}>
                                {LANG.getTranslation('enter_your')}
                                {this.props.PlaceHolder}
                            </Text>
                            <Text style={styles.Standard}>
                                {LANG.getTranslation(
                                    'keyboard_remote_information',
                                )}{' '}
                            </Text>
                        </View>
                        <View style={{ flex: 4, flexDirection: 'row' }}>
                            {RenderIf(NumbersOnly != undefined)(
                                <Keyboard
                                    MaxLength={this.props.MaxLength}
                                    NumbersOnly={true}
                                    SecureInput={true}
                                    OldSearch={OldText}
                                    Width={GLOBAL.Device_Width - 35}
                                    Margin={10}
                                    Icon={this.getIcon()}
                                    PlaceHolder={PlaceHolder}
                                    Submit={this.onChangeText}
                                    ShowChars={true}
                                    ShowDomains={true}
                                    LiveReload={false}
                                />,
                            )}
                            {RenderIf(NumbersOnly == undefined)(
                                <Keyboard
                                    OldSearch={OldText}
                                    Width={GLOBAL.Device_Width - 35}
                                    Margin={10}
                                    Icon={this.getIcon()}
                                    PlaceHolder={PlaceHolder}
                                    Submit={this.onChangeText}
                                    ShowChars={true}
                                    ShowDomains={true}
                                    LiveReload={true}
                                />,
                            )}
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: GLOBAL.Device_IsAppleTV
                                    ? 'flex-start'
                                    : 'flex-end',
                                margin: 10,
                                marginVertical: 20,
                            }}
                        >
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this.getBackPreviousScreen()}
                                Text={LANG.getTranslation('back')}
                            />
                            <ButtonNormal
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this.submitToPreviousScreen()}
                                Text={LANG.getTranslation('submit')}
                            />
                        </View>
                    </View>
                </View>
            </Container>
        );
    }
}
