import React, {Component} from 'react';
import {Text, BackHandler, TVMenuControl, View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {ImageBackground} from 'react-native';
import Video from 'react-native-video/dom/Video';
import DropdownAlert from 'react-native-dropdownalert';
import moment, {lang} from 'moment';
import Orientation from 'react-native-orientation';
export default class Ads_Campaign extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        this.state = {
            campaignbackdrop: this.props.campaignbackdrop,
            campaignemail: this.props.campaignemail,
            campaignid: this.props.campaignid,
            campaignstream: this.props.campaignstream,
            campaigntext: this.props.campaigntext,
            modal_button: true,
            seek: 0,
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
            if (this.state.show_player == true) {
                this.setState({
                    paused: true,
                    show_player: false,
                    modal_button: true,
                });
            } else {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            }
        }
    };
    updateDimensions() {
        Actions.Ads_Campaign();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToLandscape();
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.state.show_player == true) {
                    this.setState({
                        paused: true,
                        show_player: false,
                        modal_button: true,
                    });
                } else {
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                }
                return true;
            },
        );
    }
    _goHome() {
        this.setState({
            paused: true,
            modal_button: true,
        });
        GLOBAL.Focus = 'Home';
        Actions.Home();
    }
    _onPlay() {
        this.setState({
            paused: false,
            show_player: true,
            modal_button: false,
            seek: 0,
            campaignstream: this.props.campaignstream + '?' + moment().unix(),
        });
    }
    _onInfo() {
        DAL.requestAdInformation(this.state.campaignid)
            .then(data => {
                this.dropdown.alertWithType(
                    'success',
                    'Success',
                    LANG.getTranslation('message_sent'),
                );
            })
            .catch(error => {
                this.dropdown.alertWithType('error', 'Error', 'Error');
            });
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        this.setState({
            paused: true,
        });
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        if (GLOBAL.Device_IsPhone) {
            Orientation.lockToPortrait();
        }
        Actions.pop();
    }
    increase = (key, value) => {
        this.setState({
            [key]: this.state[key] + value,
        });
    };
    onProgress = data => {};
    onEnd = () => {
        this.setState({
            paused: true,
            show_player: false,
            modal_button: true,
        });
    };
    setSeek = time => {};
    onError = data => {
        this.setState({
            paused: true,
            show_player: false,
            modal_button: true,
        });
    };
    onLoad = data => {
        this.setState({
            text_tracks: data.textTracks,
            audio_tracks: data.audioTracks,
            duration: data.duration,
            current_time: data.currentTime,
        });
    };
    render() {
        return (
            <ImageBackground
                style={{flex: 1, width: null, height: null}}
                imageStyle={{resizeMode: 'stretch'}}
                source={{uri: GLOBAL.ImageUrlCMS + this.state.campaignbackdrop}}
            >
                {RenderIf(this.state.show_player == true)(
                    <Video
                        ref={ref => {
                            this.player = ref;
                        }}
                        source={{
                            uri: this.state.campaignstream,
                            type: 'mp4',
                            ref: 'player',
                            headers: {
                                'User-Agent': GLOBAL.User_Agent,
                            },
                            drm: {
                                type:
                                    this.state.drmKey == ''
                                        ? null
                                        : GLOBAL.Device_System == 'Apple'
                                        ? DRMType.FAIRPLAY
                                        : DRMType.WIDEVINE,
                                licenseServer: GLOBAL.DrmKeyServerUrl,
                                headers: {
                                    customData: '',
                                },
                            },
                        }}
                        disableFocus={true}
                        style={styles.fullScreen}
                        rate={1}
                        paused={this.state.paused}
                        resizeMode={'stretch'}
                        onLoad={this.onLoad}
                        selectedTextTrack={{
                            type: 'disabled',
                            value: 0,
                        }}
                        selectedAudioTrack={{
                            type: 'index',
                            value: 0,
                        }}
                        onProgress={this.onProgress}
                        onEnd={this.onEnd}
                        repeat={false}
                        onError={this.onError}
                    />,
                )}
                {RenderIf(this.state.modal_button)(
                    <Modal
                        Title={LANG.getTranslation('sponsered_ad')}
                        Centered={true}
                        TextButton1={'home'}
                        TextButton2={'get_information'}
                        TextButton3={'play_commercial'}
                        OnPressButton1={() => this._goHome()}
                        OnPressButton2={() => this._onInfo()}
                        OnPressButton3={() => this._onPlay()}
                        TextHeader={this.state.campaigntext}
                        TextTagline={''}
                        ShowLoader={false}
                    ></Modal>,
                )}
                <DropdownAlert ref={ref => (this.dropdown = ref)} />
            </ImageBackground>
        );
    }
}
