import React, { PureComponent } from 'react';
import {
    TouchableHighlight,
    TouchableWithoutFeedback,
    BackHandler,
    TVEventHandler,
    useTVEventHandler,
    TVMenuControl,
    View,
    Image,
    Text,
    Dimensions,
    AppState,
    ImageBackground,
    Animated,
    TouchableOpacity,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import Video from 'react-native-video/dom/Video';
import KeepAwake from 'react-native-keep-awake';
import Orientation from 'react-native-orientation';
import { sendPageReport, sendRecordingReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

var new_unix = 0;
export default class Player_Recordings extends PureComponent {
    handleViewTopRef = ref => (this.topview = ref);
    handleBottomViewRef = ref => (this.bottomview = ref);
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        var stream = GLOBAL.HTTPvsHTTPS + '';
        var type = 'm3u8';
        var gesture = false;
        if (
            GLOBAL.Device_IsTV == false &&
            GLOBAL.Device_IsAppleTV == false &&
            GLOBAL.Device_IsWebTV == false
        ) {
            gesture = true;
        }
        this.state = {
            reportStartTime: moment().unix(),
            fullScreen: false,
            show_gesture: gesture,
            recording: GLOBAL.Recording,
            time_left_unix: '',
            time_left_human: '',
            visible: false,
            gestureName: 'none',
            backgroundColor: '#fff',
            keys: '',
            rate: 1,
            volume: 1,
            muted: false,
            resizeMode: 'stretch',
            paused: false,
            stream:
                GLOBAL.Device_IsAppleTV == true ||
                    GLOBAL.Device_Type == '_AppleHandheld' ||
                    GLOBAL.Device_Type == '_Ipad'
                    ? ''
                    : stream,
            type: type,
            lock: '',
            show_bar: false,
            show_popup: false,
            show_buttons: false,
            text_tracks: [],
            audio_tracks: [],
            buffering: true,
            duration: 0.0,
            current_time: 0.0,
            audio_track_index: 0,
            text_track_index: 999,
            text_track_type: 'disabled',
            button_support: false,
            button_audio: false,
            button_subtitles: false,
            button_sharing: false,
            button_screensize: false,
            button_settings: false,
            button_replay: false,
            button_thanks: false,
            player_type: '',
            Small: false,
            button_bar: false,
            button_casting: false,
            progress: 0,
            vast: '',
            progressWithOnComplete: 0,
            progressCustomized: 0,
            time: moment().format('HH:mm'),
            overlay_url: '',
            overlay_time: 0,
            ticker_text: '',
            ticker_time: 0,
            preroll_url: '',
            preroll_time: 0,
            drmKey: '',
            show_ticker: false,
            show_overlay: false,
            show_pause: false,
            show_rew: false,
            show_ff: false,
            ads: [],
            show_childlock: false,
            errortext: '',
            keyboardType:
                GLOBAL.Device_Type == '_FireTV' ? 'phone-pad' : 'number-pad',
            current_time_human: '00:00:00',
            total_time_human: '00:00:00',
            show_keyboard: GLOBAL.Device_IsSTB == true ? false : true,
            seek: 0,
            focusbutton: false,
            fadeAnim: new Animated.Value(0),
            show: false,
            error: '',
            seeking: false,
            playable_duration: 0,
            play_focus: this.props.askResume == true ? false : true,
            resume_focus: this.props.askResume == true ? true : false,
            back_focus: false,
            scubber_focus: false,
            buttons_hidden: false,
            code: '',
            error_icon: false,
            focusbutton: false,
            player_type: '',
            scrubberValue: 0,
            controls: true,
            playstatus: "pause",
            fromPage: this.props.fromPage,
            seek_time: 0,
            seek_focus: false,
            controls: false,
            hasresumed: false,
            askresume: this.props.askResume,
        };

        this.onSwipeDown = this.onSwipeDown.bind(this);
        this.onSwipeLeft = this.onSwipeLeft.bind(this);
        this.onSwipeRight = this.onSwipeRight.bind(this);
        this.onSwipeUp = this.onSwipeUp.bind(this);
    }
    _enableTVEventHandler() {
        this._tvEventHandler = new TVEventHandler();
        this._tvEventHandler.enable(this, function (cmp, evt) {
            if (
                evt &&
                (evt.eventType == 'right' || evt.eventType == 'swipeRight')
            ) {
                cmp.onSwipeLeft();
            }
            if (
                evt &&
                (evt.eventType == 'left' || evt.eventType == 'swipeLeft')
            ) {
                cmp.onSwipeRight();
            }
            if (evt && (evt.eventType == 'up' || evt.eventType == 'swipeUp')) {
                cmp.onSwipeUp();
            }
            if (
                evt &&
                (evt.eventType == 'down' || evt.eventType == 'swipeDown')
            ) {
                cmp.onSwipeDown();
            }
            if (evt.eventType === 'menu') {
                cmp.getBack();
            }
            if (evt && evt.eventType === 'playPause') {
                cmp._onPlayerPausePlay();
            }
        });
    }
    _swipe() {
        if (this.state.controls == false) {
            this.fadeIn();
        } else {
            this.fadeBackOut();
        }
    }
    _disableTVEventHandler() {
        if (this._tvEventHandler) {
            this._tvEventHandler.disable();
            delete this._tvEventHandler;
        }
    }
    onSwipeUp(gestureState) {
        if (this.state.show_childlock == true) {
            return;
        }
        this.fadeIn();
    }
    onSwipeDown(gestureState) {
        if (this.state.show_childlock == true) {
            return;
        }
        this.fadeIn();
        if (this.state.show_bar == true) {
            TimerMixin.clearTimeout(this.timer1);
            this.setState({
                show_bar: false,
            });
        }
    }
    onSwipeLeft(gestureState) {
        if (
            GLOBAL.Device_IsPhone ||
            GLOBAL.Device_IsTablet ||
            this.state.show_childlock == true
        ) {
            return;
        }
        if (this.state.show_buttons == true) {
            return;
        }
        this.fadeIn();
        this.setSeek(60);
    }
    onSwipeRight(gestureState) {
        if (
            GLOBAL.Device_IsPhone ||
            GLOBAL.Device_IsTablet ||
            this.state.show_childlock == true
        ) {
            return;
        }
        if (this.state.show_buttons == true) {
            return;
        }
        this.fadeIn();
        this.setSeek(-60);
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        this.fadeBackOut();

        if (event.keyCode == 415) {
            //play
            this._onPlayerPausePlay();
        }
        if (event.keyCode == 19) {
            //pause
            this._onPlayerPausePlay();
        }
        if (event.keyCode == 417) {
            //ff
            this.fadeIn();
            this._onPlayerForward();
        }
        if (event.keyCode == 412) {
            //rew
            this.fadeIn();
            this._onPlayerRewind();
        }
        if (event.keyCode == 37 || event.keyCode == 167) {
            //left
            this.fadeIn();
        }
        if (event.keyCode == 39 || event.keyCode == 166) {
            //right
            this.fadeIn();
            this._onPlayerForward();
        }
        if (event.keyCode == 38 || event.keyCode == 40) {
            //up and down
            this.fadeIn();
            this._onPlayerRewind();
        }
        if (this.state.seek_focus == true) {
            this.fadeOut();
            this.setState({
                seek_focus: false,
            });
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            if (
                this.state.show_popup == true ||
                this.state.seek_focus == true
            ) {
                this.setState({
                    show_popup: false,
                    button_audio: false,
                    button_screensize: false,
                    button_settings: false,
                    button_support: false,
                    button_subtitles: false,
                    button_thanks: false,
                    play_focus: true,
                });
            } else if (this.state.show_buttons == true) {
                this.setState({
                    show_buttons: false,
                    button_bar: false,
                });
            } else {
                this.getBack();
            }
        }
    };
    updateDimensions() {
        return true;
    }
    _handleAppStateChange = nextAppState => {
        if (
            nextAppState == 'background' &&
            GLOBAL.UserInterface.app_state_change.restart_stream == true &&
            GLOBAL.Casting == false
        ) {
            this.fadeBackOut();
            this.setState({ stream: 'http://test.com' });
        }
        if (
            nextAppState == 'background' &&
            GLOBAL.UserInterface.app_state_change.restart_app == true &&
            GLOBAL.Casting == false
        ) {
            this.fadeBackOut();
            this.setState({ stream: 'http://test.com' }, () => {
                UTILS.closeAppAndLogout();
            });
        }
        if (
            nextAppState == 'active' &&
            GLOBAL.UserInterface.app_state_change.restart_stream == true &&
            GLOBAL.Casting == false
        ) {
            this.fadeIn();
            this.refreshIpAddress();
        }

        if (
            nextAppState == 'active' &&
            GLOBAL.UserInterface.app_state_change.restart_app == true &&
            GLOBAL.Casting == true
        ) {
            GLOBAL.Casting = false;
            this.getBack();
        }
        if (
            nextAppState == 'active' &&
            GLOBAL.UserInterface.app_state_change.restart_stream == true &&
            GLOBAL.Casting == true
        ) {
            GLOBAL.Casting = false;
            this.getBack();
        }
    };
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV == false && GLOBAL.Device_IsPhone == false) {
            AppState.addEventListener('change', this._handleAppStateChange);
        }

        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            document.addEventListener('keydown', this.backButton, false);
            window.addEventListener('resize', this.updateDimensions);
            if (GLOBAL.Device_IsSmartTV == false) {
                window.addEventListener('online', () => {
                    if (this.state.paused == true) {
                        this._onPlayerPausePlay();
                    }
                });
                window.addEventListener('offline', () => {
                    this._onPlayerPausePlay();
                });
            } else {
                if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
                    webapis.network.addNetworkStateChangeListener(function (
                        value,
                    ) {
                        if (
                            value ==
                            webapis.network.NetworkState.GATEWAY_DISCONNECTED
                        ) {
                            this._onPlayerPausePlay();
                        } else if (
                            value ==
                            webapis.network.NetworkState.GATEWAY_CONNECTED
                        ) {
                            if (this.state.paused == true) {
                                this._onPlayerPausePlay();
                            }
                        }
                    });
                }
                if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                    window.addEventListener('online', () => {
                        if (this.state.paused == true) {
                            this._onPlayerPausePlay();
                        }
                    });
                    window.addEventListener('offline', () => {
                        this._onPlayerPausePlay();
                    });
                }
            }
        }
        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToLandscape();
        }
        this.refreshIpAddress();
        this.fadeIn();

        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (this.state.show_childlock == true) {
                    return;
                }
                if (this.state.show == false) {
                    this.fadeIn();
                } else {
                    this.fadeBackOut();
                }
                if (keyEvent.keyCode == 126) {
                    //pause
                    this._onPlayerPausePlay();
                }
                if (keyEvent.keyCode == 175) {
                    //CC
                    this.setState({
                        button_support: false,
                        button_audio: false,
                        button_settings: false,
                        button_subtitles: true,
                        button_screensize: false,
                        show_popup: true,
                    });
                }
                if (keyEvent.keyCode == 222) {
                    //AD
                    this.setState({
                        button_support: false,
                        button_audio: true,
                        button_settings: false,
                        button_subtitles: false,
                        button_screensize: false,
                        show_popup: true,
                    });
                }
                if (keyEvent.keyCode == 165) {
                    //Info
                    this.fadeIn();
                }
                if (keyEvent.keyCode == 90) {
                    //forward
                    this.fadeIn();
                    this._onPlayerForward();
                }
                if (keyEvent.keyCode == 89) {
                    //rewind
                    this.fadeIn();
                    this._onPlayerRewind();
                }
                if (keyEvent.keyCode == 86) {
                    //stop
                    this.getBack();
                }
                if (keyEvent.keyCode == 121 || keyEvent.keyCode == 85) {
                    //pause
                    this._onPlayerPausePlay();
                }
                if (keyEvent.keyCode == 126 || keyEvent.keyCode == 85) {
                    //play
                    this._onPlayerPausePlay();
                }

                if (keyEvent.keyCode == 85) {
                    this._onPlayerPausePlay();
                }
                if (
                    keyEvent.keyCode === 21 &&
                    this.state.show_popup == false &&
                    this.state.show_buttons == false
                ) {
                    //left
                    if (this.state.scubber_focus == true) {
                        this.setSeek(-60);
                    }
                }
                if (
                    keyEvent.keyCode === 22 &&
                    this.state.show_popup == false &&
                    this.state.show_buttons == false
                ) {
                    //right
                    if (this.state.scubber_focus == true) {
                        this.setSeek(60);
                    }
                }
                if (keyEvent.keyCode === 19 || keyEvent.keyCode === 20) {
                    //down
                    if (this.state.scubber_focus == true) {
                        this.setState({
                            scubber_focus: false,
                        });
                    }
                }
                if (this.state.show_childlock == true) {
                    return;
                }

                return true;
            });
        }
        if (GLOBAL.Device_IsAppleTV) {
            this._enableTVEventHandler();
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.state.seek_focus) {
                    this.fadeOut();
                    this.setState({
                        seek_focus: false,
                    });
                } else if (this.state.show_popup == true) {
                    this.setState({
                        show: false,
                        show_childlock: false,
                        show_popup: false,
                        button_audio: false,
                        button_screensize: false,
                        button_settings: false,
                        button_support: false,
                        button_subtitles: false,
                        button_thanks: false,
                        play_focus:
                            this.state.play_focus == true ? false : true,
                    });
                } else {
                    this.getBack();
                }
                return true;
            },
        );
    }
    _closePopups() {
        this.setState({
            show: false,
            show_popup: false,
            button_audio: false,
            button_screensize: false,
            button_settings: false,
            button_support: false,
            button_subtitles: false,
            button_thanks: false,
            play_focus: this.state.play_focus == true ? false : true,
        });
        this.fadeOut();
    }
    getBack() {
        Actions.Recordings();
    }
    componentWillUnmount() {
        sendRecordingReport(
            this.state.recording.channel_id,
            this.state.recording.channel_number,
            this.state.recording.channel_name,
            this.state.recording.channel_name.icon_big,
            this.state.reportStartTime,
            moment().unix(),
            this.state.recording.ut_start,
            this.state.recording.ut_end,
            this.state.recording.name,
        );

        sendPageReport(
            'Player Recordings',
            this.state.reportStartTime,
            moment().unix(),
        );
        if (GLOBAL.Device_IsSTB) {
            AppState.removeEventListener('change', this._handleAppStateChange);
        }
        this.setState({
            stream: '',
        });
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsWebTV) {
            AppState.removeEventListener('change', this._handleAppStateChange);
            // killVideoJSPlayer();
        } else {
            this.setState({
                paused: true,
            });
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            this._disableTVEventHandler();
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }

        TimerMixin.clearTimeout(this.zapTimer);
        TimerMixin.clearTimeout(this.adsTimer);
        TimerMixin.clearTimeout(this.resumeTimer);
        TimerMixin.clearTimeout(this.seekTimer);
        TimerMixin.clearTimeout(this.seekTimer_);
        TimerMixin.clearTimeout(this.countDownTimer);
        TimerMixin.clearTimeout(this.fadeOutTimer);

        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToPortrait();
        }
        if (GLOBAL.Device_IsAppleTV == true) {
            this._disableTVEventHandler();
        }
        Actions.pop();
    }

    // playMovie() {
    //     this.refreshIpAddress();
    // }
    refreshIpAddress() {
        var channel = UTILS.getChannelSelectedByName(
            this.state.recording.channel_name,
        );
        if (channel == undefined || channel == null) {
            Actions.Recordings();
        } else {
            if (
                channel.secure_stream == true ||
                channel.drm_stream == false ||
                channel.drm_stream == true ||
                channel.akamai_token == true ||
                channel.flussonic_token == true
            ) {
                this.getCurrentStream(channel);
            } else {
                DAL.getJson(
                    GLOBAL.HTTPvsHTTPS +
                    'cloudtv.akamaized.net/ip.php?_=' +
                    moment().unix(),
                )
                    .then(data => {
                        if (data != undefined) {
                            GLOBAL.Device_IpAddress = data.ip;
                            GLOBAL.Device_Time = data.time;
                            this.getCurrentStream(channel);
                        } else {
                            this.getCurrentStream(channel);
                        }
                    })
                    .catch(error => {
                        //just catch the error
                        this.getCurrentStream(channel);
                    });
            }
        }
    }
    rewriteRecordingUrl = url => {
        if (GLOBAL.Device_IsSmartTV) {
            if (url.indexOf('.m3u8') > -1) {
                var returnUrl = url.replace('.m3u8', '.mpd');
                return returnUrl;
            } else {
                return url;
            }
        } else {
            return url;
        }
    };
    getCurrentStream(channel) {
        var url = this.rewriteRecordingUrl(this.state.recording.url);
        var type = 'm3u8';
        var type_ = 'application/x-mpegURL';
        var url_ = url.split('?');
        var extension = url_[0].split('.').pop();
        if (extension == 'mp4') {
            type = 'mp4';
        }
        if (extension == 'mpd') {
            type = 'mpd';
        }
        if (extension == 'm3u8') {
            type = 'm3u8';
        }

        var drmKey = '';
        if (channel.secure_stream == true && channel.drm_stream != true) {
            url = TOKEN.getAkamaiTokenLegacy(url);
        } else if (channel.drm_stream == true) {
            if (channel.drm.drm_type == 'buydrm') {
                (async () => {
                    let drm = await TOKEN.getDrmWidevineFairplayBuyDRM(
                        url,
                        channel,
                    );
                    if (drm != undefined) {
                        url = drm.url;
                        drmKey = drm.drmKey;
                        drmSupplierType = 'buydrm';
                        streamType = TOKEN.getStreamType(drm.url);
                        drmLicenseServerUrl = drm.licenseServer;
                        drmCertificateUrl = drm.certificateUrl;

                        this.setState({
                            stream: url,
                            type: type,
                            paused: false,

                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,

                            player_type: 'exo',
                            seek: 0,
                            audio_track_index: 0,
                            text_track_index: 0,
                        });
                    }
                })();
            } else if (channel.drm.drm_type == 'irdeto') {
                (async () => {
                    let drm = await TOKEN.getDrmWidevineFairplayIrdeto(
                        GLOBAL.DRM_KeyServerURL,
                        channel,
                    );
                    if (drm != undefined) {
                        url = drm.url;
                        drmSupplierType = 'irdeto';
                        streamType = TOKEN.getStreamType(drm.url);
                        drmLicenseServerUrl = drm.drmServerUrl;
                        drmCertificateUrl = drm.certificateUrl;

                        this.setState({
                            stream: url,
                            type: type,
                            paused: false,

                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,

                            player_type: 'exo',
                            seek: 0,
                            audio_track_index: 0,
                            text_track_index: 0,
                        });
                    }
                })();
            }
        } else if (channel.akamai_token == true) {
            url = TOKEN.getAkamaiToken(url);
        } else if (channel.flussonic_token == true) {
            url = TOKEN.getFlussonicToken(url);
        }
        this.setState({
            stream: url,
            type: type,
            drmKey: drmKey,
            paused: false,
            seek: 0,
            vast: 'https://',
            player_type: 'exo',
            audio_track_index: 0,
            text_track_index: 0,
        });
    }

    _childlockValidate() {
        if (GLOBAL.PIN + '' == this.state.childlock + '') {
            this.setState({
                show_childlock: false,
                childlock: '',
            });
            if (this.state.movie.has_preroll == 1) {
                this.getStreamAdsMovies();
            } else {
                this.refreshIpAddress();
                this.getStreamAdsMovies();
            }
        } else {
            this.setState({
                errortext: 'The entered codes do not match!',
            });
            this.focusChildlock();
        }
    }

    //popups

    _onPressSetScreenSize(type) {
        if (GLOBAL.Device_IsWebTV) {
            setScreenSize(type);
        }
        GLOBAL.Screen_Size = type;
        UTILS.storeProfile(
            'settings_screen',
            0,
            0,
            0,
            0,
            [],
            GLOBAL.Screen_Size,
        );
        this.setState({
            resizeMode: type,
        });
        //this._closePopups();
    }
    _onPressSetAudio(index, language) {
        if (GLOBAL.Device_IsWebTV && this.state.type != 'm3u8') {
            player.selectAudioLanguage(language);
        }
        if (GLOBAL.Device_IsWebTV && this.state.type == 'm3u8') {
            setTrack(language, 'audio');
        }
        GLOBAL.Selected_AudioTrack = language;
        UTILS.storeProfile(
            'settings_audio',
            0,
            0,
            0,
            0,
            [],
            GLOBAL.Selected_AudioTrack,
        );
        this.setState({
            audio_track_index: index,
        });
    }
    _onPressSetSubtitle(index, language) {
        if (GLOBAL.Device_IsWebTV && this.state.type != 'm3u8') {
            if (index == 999) {
                player.setTextTrackVisibility(false);
            } else {
                var data = Array.from(player.getTextTracks());
                var track = data[index];
                player.setTextTrackVisibility(true);
                player.selectTextTrack(track);
            }
        }
        if (GLOBAL.Device_IsWebTV && this.state.type == 'm3u8') {
            var i = index - 1;
            setTrack(language, 'subs');
        }
        GLOBAL.Selected_TextTrack = language;
        UTILS.storeProfile(
            'settings_text',
            0,
            0,
            0,
            0,
            [],
            GLOBAL.Selected_TextTrack,
        );
        this.setState({
            text_track_index: index,
            text_track_type: index == 999 ? 'disabled' : 'index',
        });
    }

    //player
    onProgress = data => {
        if (
            this.state.button_screensize ||
            this.state.button_audio ||
            this.state.button_subtitles ||
            this.state.button_support
        ) {
            return;
        }
        if (GLOBAL.Device_IsWebTV && this.state.type != 'm3u8') {
            data = data.srcElement;
        } else if (GLOBAL.Device_IsWebTV && this.state.type == 'm3u8') {
            data = data.target;
        }
        if (this.state.is_ad != true && this.state.seeking == false) {
            var percentageVideo =
                (data.currentTime / this.state.duration) * 100;
            var position = data.currentTime;
            var playable = data.playableDuration;
            this.setState({
                current_time: position,
                progress: percentageVideo,
                playable_duration: playable,
            });
        }
        if (this.props.askResume == true && this.state.hasresumed == false) {
            this.setSeek(this.props.askResumeTime, false);
            this.setState({
                askresume: true,
                askresumefrompage: false,
                seek:
                    this.props.askResumeTime != undefined
                        ? this.props.askResumeTime
                        : 0,
                hasresumed: true,
                play_focus: false,
            });

            TimerMixin.clearTimeout(this.resumeTimer);
            this.resumeTimer = TimerMixin.setTimeout(() => {
                this.setState({
                    askresume: false,
                    play_focus: true,
                });
                this.fadeBackOut();
            }, 10000);
        }
    };
    onEnd = () => {
        this.getBack();
    };
    setSeek = (time, fromscrubber) => {
        var seek_ = 0;
        if (fromscrubber == true) {
            seek_ = time;
        } else {
            if (this.state.seek_time > 0) {
                seek_ = this.state.seek_time + time;
            } else {
                seek_ = this.state.current_time + time;
            }
        }
        if (seek_ < this.state.duration && seek_ >= 0) {
            this.setState({
                seek_time: seek_,
                seeking: true,
            });
            TimerMixin.clearTimeout(this.seekTimer);
            this.seekTimer = null;
            this.seekTimer = TimerMixin.setTimeout(() => {
                if (GLOBAL.Device_IsWebTV && this.state.type != 'm3u8') {
                    player.getMediaElement().currentTime = this.state.seek_time;
                } else if (GLOBAL.Device_IsWebTV && this.state.type == 'm3u8') {
                    player.currentTime(this.state.seek_time);
                } else {
                    var seek = this.state.seek_time;
                    this.setState({
                        seek: seek,
                        program_seek: 0,
                    });
                    this.player.seek(seek);
                }
            }, 500);
            TimerMixin.clearTimeout(this.seekTimer_);
            this.seekTimer_ = null;
            this.seekTimer_ = TimerMixin.setTimeout(() => {
                this.setState({
                    seek_time: 0,
                    seeking: false,
                });
                this.fadeBackOut();
            }, 3000);
        }
    };
    onError = data => {
        if (GLOBAL.Device_IsWebTV == false) {
            this.setState({
                error: data.error.errorString,
                buffering: false,
            });
        } else {
            data = data.target.error.code;
            this.setState({
                error: 'Error Code ' + data,
                buffering: false,
            });
        }
    };
    onBuffer = data => {
        // this.setState({
        //     buffering: data.isBuffering
        // })
    };
    onLoad = data => {
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        this.setState({
            text_tracks: this.getTrackTranslated(
                GLOBAL.Device_IsWebTV ? [] : data.textTracks,
                'subs',
            ),
            audio_tracks: this.getTrackTranslated(
                GLOBAL.Device_IsWebTV ? [] : data.audioTracks,
                'audio',
            ),
            duration: data.duration,
            buffering: false,
            total_time_human: moment('2015-01-01')
                .startOf('day')
                .seconds(data.duration)
                .format('HH:mm:ss'),
        });
    };
    onRestartMovie() {
        if (GLOBAL.Device_IsWebTV) {
            player.currentTime(seek);
        } else {
            this.setState({
                seek: 0,
                askresume: false,
                play_focus: true,
                resume_focus: false,
            });
            TimerMixin.clearTimeout(this.resumeTimer);
        }
    }
    getStatusAudio(index) {
        if (this.state.audio_track_index == index) {
            return "check";
        } else {
            return null;
        }
    }
    getStatusScreen(item) {
        if (this.state.resizeMode == item) {
            return "check";
        } else {
            return null;
        }
    }
    getStatusSubs(index) {
        if (this.state.text_track_index == index) {
            return "check";
        } else {
            return null;
        }
    }
    getTrackTranslated(data, type) {
        if (
            GLOBAL.Device_IsWebTV &&
            type == 'subs' &&
            this.state.type != 'm3u8'
        ) {
            data = player.getTextTracks();
        }
        if (
            GLOBAL.Device_IsWebTV &&
            type == 'audio' &&
            this.state.type != 'm3u8'
        ) {
            data = player.getAudioLanguages();
        }

        if (
            GLOBAL.Device_IsWebTV &&
            type == 'subs' &&
            this.state.type == 'm3u8'
        ) {
            data = Array.from(player.textTracks());
        }
        if (
            GLOBAL.Device_IsWebTV &&
            type == 'audio' &&
            this.state.type == 'm3u8'
        ) {
            data = Array.from(player.audioTracks());
        }
        var subs = [];
        var i = 0;
        if (data == undefined || data == null) {
            return subs;
        }
        data.forEach(element => {
            var language =
                GLOBAL.Device_IsWebTV && type == 'subs'
                    ? element.label
                    : GLOBAL.Device_IsWebTV && type == 'audio'
                        ? this.state.type == 'm3u8'
                            ? element.label
                            : element
                        : element.title;
            if (
                type == 'subs' &&
                GLOBAL.Selected_TextTrack == language &&
                !GLOBAL.Device_IsWebTV
            ) {
                this.setState({
                    text_track_index: i,
                    text_track_type: 'index',
                });
            }
            if (
                type == 'audio' &&
                GLOBAL.Selected_AudioTrack == language &&
                !GLOBAL.Device_IsWebTV
            ) {
                this.setState({
                    audio_track_index: i,
                });
            }
            if (
                language != '' &&
                language != null &&
                language != 'segment-metadata'
            ) {
                language = language.replace('subs:', '');
                var index = GLOBAL.Device_IsWebTV
                    ? element.title
                    : element.index;
                if (index == undefined) {
                    index = i;
                }
                var item = { index: index, language: language };
                subs.push(item);
            }
            i++;
        });
        if (type == 'subs' && subs.length > 0) {
            var turnOff = {
                index: 999,
                language: LANG.getTranslation('no_subtitles'),
                title: '',
                type: 'text/vtt',
            };
            if (subs.length > 0) {
                subs.splice(0, 0, turnOff);
            }
        }
        return subs;
    }
    focusChildlock = () => {
        if (GLOBAL.Device_IsTV == true) {
            if (this.childlock_ != null && this.childlock_ != undefined) {
                this.childlock_.focus();
            }
        }
    };

    _onPlayerForward() {
        this.setSeek(60);
    }
    _onPlayerPausePlay() {
        if (this.state.show == false) {
            this.fadeIn();
        }
        if (this.state.paused == false) {
            this.setState({
                paused: true,
                playstatus: "play-circle",
            });
            if (GLOBAL.Device_IsWebTV) {
                video.pause();
            }
        } else {
            this.setState({
                paused: false,
                playstatus: "pause",
            });
            if (GLOBAL.Device_IsWebTV) {
                video.play();
            }
        }
    }
    _onPlayerRewind() {
        this.setSeek(-60);
    }
    valueChange = value => {
        this.setState({
            seeking: true,
            seek_time: value,
            current_time: value,
        });
        this.setSeek(value, true);
    };
    _onFavoriteChange() {
        var id = this.state.movie.id;
        var isMovieFavorite = GLOBAL.Favorite_Movies.find(function (element) {
            return element.id == id;
        });
        if (isMovieFavorite != undefined) {
            var index = GLOBAL.Favorite_Movies.findIndex(
                c => c.id != isMovieFavorite.id,
            );
            GLOBAL.Favorite_Movies.splice(index, 1);
            this.setState({
                favorite: false,
                play_focus: true,
            });
            UTILS.storeProfile(
                'movie_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Movies,
                '',
            );
        } else {
            GLOBAL.Favorite_Movies.push(this.state.movie);
            this.setState({
                favorite: true,
                play_focus: true,
            });
            UTILS.storeProfile(
                'movie_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Movies,
                '',
            );
        }
    }
    fadeOut() {
        this.setState({ controls: false, show: false, askresume: false });
    }

    fadeIn() {
        this.setState({ controls: true, show: true, play_focus: true });
        this.fadeBackOut();
    }
    fadeBackOut() {
        TimerMixin.clearTimeout(this.fadeOutTimer);
        this.fadeOutTimer = TimerMixin.setTimeout(() => {
            if (
                this.state.paused == false &&
                this.state.seek_focus == false &&
                this.state.scubber_focus == false &&
                this.state.error == '' &&
                this.state.buffering == false &&
                this.state.button_audio == false &&
                this.state.button_screensize == false &&
                this.state.button_subtitles == false &&
                this.state.button_support == false &&
                this.state.button_settings == false &&
                this.state.seeking == false &&
                this.state.show_childlock == false
            ) {
                this.fadeOut();
            }
        }, 5000);
    }
    focusScrubber() {
        this.setState({
            scubber_focus: true,
            buttons_hidden: true,
        });
    }
    blurSeek() {
        this.setState({
            seek_focus: false,
            buttons_hidden: false,
        });
        this.fadeBackOut();
    }
    focusSeek() {
        this.setState({
            seek_focus: true,
            buttons_hidden: true,
        });
    }
    focusCode() {
        this.parentalcontrol.focus();
    }
    handleInputCode = text => {
        this.setState({ code: text });
        if (text.length == 4) {
            if (GLOBAL.PIN + '' == text + '') {
                this.refreshIpAddress();
            } else {
                this.setState({
                    code: '',
                    error_icon: true,
                });
            }
        }
    };
    goFullScreen() {
        var docElm = document.documentElement;
        if (this.state.fullScreen == false) {
            this.setState({
                fullScreen: true,
            });
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
        } else {
            this.setState({
                fullScreen: false,
            });
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    render() {
        const barWidth = Dimensions.get('screen').width;
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
        };
        return (
            <View style={styles.fullScreen_Bg}>
                {RenderIf(GLOBAL.Device_IsAppleTV)(
                    <GestureRecognizer
                        onSwipe={(direction, state) =>
                            this.onSwipe(direction, state)
                        }
                        onSwipeUp={state => this.onSwipeUp(state)}
                        onSwipeDown={state => this.onSwipeDown(state)}
                        onSwipeLeft={state => this.onSwipeLeft(state)}
                        onSwipeRight={state => this.onSwipeRight(state)}
                        config={config}
                        style={{
                            //flex:1,
                            backgroundColor: 'transparent',
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            zIndex: 9997,
                        }}
                    ></GestureRecognizer>,
                )}
                {RenderIf(this.state.player_type == 'exo')(
                    <Video
                        ref={ref => {
                            this.player = ref;
                        }}
                        source={{
                            uri: this.state.stream,
                            type: this.state.type,
                            full: false,
                            ref: 'player',
                            headers: {
                                'User-Agent': GLOBAL.User_Agent,
                            },
                            drm: {
                                type: DRMType.WIDEVINE,
                                licenseServer: '',
                                headers: {
                                    customData: '',
                                },
                            },
                        }}
                        //seek={parseInt(this.state.seek)}
                        vast={this.state.vast}
                        streamType={'VOD'}
                        disableFocus={true}
                        style={styles.fullScreen}
                        rate={this.state.rate}
                        paused={this.state.paused}
                        resizeMode={this.state.resizeMode}
                        onLoad={this.onLoad}
                        selectedTextTrack={{
                            type: this.state.text_track_type,
                            value: this.state.text_track_index,
                        }}
                        selectedAudioTrack={{
                            type: 'index',
                            value: this.state.audio_track_index,
                        }}
                        onBuffer={this.onBuffer}
                        onProgress={this.onProgress}
                        onEnd={this.onEnd}
                        repeat={false}
                        onError={this.onError}
                        playerup={this.onSwipeDown}
                        playerdown={this.onSwipeUp}
                        channelup={this._onPlayerForward}
                        channeldown={this._onPlayerRewind}
                        useTextureView={false}
                    />,
                )}
                {RenderIf(
                    this.state.button_screensize ||
                    this.state.button_subtitles ||
                    this.state.button_audio,
                )(
                    <View
                        style={{
                            flexDirection: 'row',
                            zIndex: 9999,
                            position: 'absolute',
                            backgroundColor: 'rgba(0, 0, 0, 0.80)',
                            height: GLOBAL.COL_1,
                            width: '100%',
                            padding: 10,
                        }}
                    >
                        <View style={{ padding: 10 }}>
                            <Text style={styles.H4}>
                                {LANG.getTranslation('video')}
                            </Text>
                            <ButtonNormal
                                hasTVPreferredFocus={true}
                                Left={true}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() =>
                                    this._onPressSetScreenSize('none')
                                }
                                Text={LANG.getTranslation('none')}
                                Icon={this.getStatusScreen('none')}
                            />
                            <ButtonNormal
                                Left={true}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() =>
                                    this._onPressSetScreenSize('contain')
                                }
                                Text={LANG.getTranslation('contain')}
                                Icon={this.getStatusScreen('contain')}
                            />
                            <ButtonNormal
                                Left={true}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() =>
                                    this._onPressSetScreenSize('cover')
                                }
                                Text={LANG.getTranslation('cover')}
                                Icon={this.getStatusScreen('cover')}
                            />
                            <ButtonNormal
                                Left={true}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() =>
                                    this._onPressSetScreenSize('stretch')
                                }
                                Text={LANG.getTranslation('stretch')}
                                Icon={this.getStatusScreen('stretch')}
                            />
                            {/* <ButtonNormal Left={true} Padding={0} underlayColor={GLOBAL.Button_Color} onPress={() => this._closePopups()} Text={LANG.getTranslation("close")} /> */}
                        </View>
                        {this.state.audio_tracks.length > 1 && (
                            <View style={{ padding: 10 }}>
                                <Text style={styles.H4}>
                                    {LANG.getTranslation('audio')}
                                </Text>

                                <FlatList
                                    data={this.state.audio_tracks}
                                    horizontal={false}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({ item, index }) => (
                                        <ButtonNormal
                                            Left={true}
                                            Disabled={
                                                this.state.button_audio == true
                                                    ? false
                                                    : true
                                            }
                                            Padding={0}
                                            underlayColor={GLOBAL.Button_Color}
                                            onPress={() =>
                                                this._onPressSetAudio(
                                                    item.index,
                                                    item.language,
                                                )
                                            }
                                            Text={item.language}
                                            icon={this.getStatusAudio(
                                                item.index,
                                            )}
                                        />
                                    )}
                                />
                            </View>
                        )}
                        {this.state.text_tracks.length > 0 && (
                            <View style={{ padding: 10 }}>
                                <Text style={styles.H4}>
                                    {LANG.getTranslation('subtitling')}
                                </Text>

                                <FlatList
                                    ref={list => (this.textTracks = list)}
                                    data={this.state.text_tracks}
                                    horizontal={false}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({ item, index }) => (
                                        <ButtonNormal
                                            Left={true}
                                            Disabled={
                                                this.state.button_subtitles ==
                                                    true
                                                    ? false
                                                    : true
                                            }
                                            Padding={0}
                                            underlayColor={GLOBAL.Button_Color}
                                            onPress={() =>
                                                this._onPressSetSubtitle(
                                                    item.index,
                                                    item.language,
                                                )
                                            }
                                            Text={item.language}
                                            Icon={this.getStatusSubs(
                                                item.index,
                                            )}
                                        />
                                    )}
                                />
                            </View>
                        )}
                    </View>,
                )}
                {RenderIf(
                    this.state.show_childlock == true &&
                    !GLOBAL.Device_IsPhone &&
                    !GLOBAL.Device_IsTablet,
                )(
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 99999,
                            right: 0,
                            top: 0,
                            width: GLOBAL.Device_Width / 3,
                            height: GLOBAL.Device_Height,
                        }}
                    >
                        <ImageBackground
                            style={{
                                flex: 1,
                                width: GLOBAL.Device_Width / 3,
                                height: null,
                            }}
                            imageStyle={{ resizeMode: 'cover' }}
                            source={require('../../images/side_panel_itv.png')}
                        >
                            <View
                                style={{ position: 'absolute', top: 5, right: 5 }}
                            >
                                <ButtonCircle
                                    hasTVPreferredFocus={true}
                                    Rounded={true}
                                    underlayColor={GLOBAL.Button_Color}
                                    Icon={"window-close"}
                                    Size={15}
                                    onPress={() =>
                                        this.setState({ show_childlock: false })
                                    }
                                ></ButtonCircle>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    margin: 15,
                                    paddingTop: 20,
                                }}
                            >
                                <Text numberOfLines={1} style={styles.H2}>
                                    {LANG.getTranslation('childlock')}
                                </Text>
                                <Text style={[styles.Medium, { color: '#fff' }]}>
                                    {LANG.getTranslation(
                                        'parental_explanation_general',
                                    )}
                                </Text>
                                <View
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        height: null,
                                        marginTop: 20,
                                        borderRadius: 5,
                                        paddingVertical: 3,
                                        backgroundColor:
                                            'rgba(204, 204, 204, 0.15)',
                                    }}
                                >
                                    {RenderIf(this.state.error_icon == true)(
                                        <View
                                            style={{
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                top: 20,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text style={styles.Medium}>
                                                {LANG.getTranslation(
                                                    'parental_wrong_code',
                                                )}
                                            </Text>
                                        </View>,
                                    )}
                                    <Parental_Keyboard
                                        onChangeText={this.handleInputCode}
                                    ></Parental_Keyboard>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>,
                )}
                {RenderIf(
                    this.state.buffering == true &&
                    this.state.show_childlock == false &&
                    this.state.paused == false &&
                    this.state.show_preroll == false,
                )(
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            zIndex: 99999,
                            top: 0,
                            bottom: 0,
                        }}
                    >
                        <Loader size={'large'} color={'#fff'} />
                    </View>,
                )}

                <View
                    style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',

                        position: 'absolute',
                        zIndex: 9999,
                    }}
                >
                    {RenderIf(GLOBAL.Device_IsAppleTV == false)(
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'transparent',
                            }}
                            activeOpacity={1}
                            onMouseMove={() =>
                                this.state.show == false ? this.fadeIn() : null
                            }
                            onPress={() =>
                                this.state.show == false ? this.fadeIn() : null
                            }
                        >
                            {RenderIf(this.state.controls)(this._controls())}
                        </TouchableOpacity>,
                    )}
                    {RenderIf(GLOBAL.Device_IsAppleTV == true)(
                        <View
                            style={{
                                flex: 1,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'transparent',
                            }}
                        >
                            {this._controls()}
                        </View>,
                    )}
                </View>

                {RenderIf(
                    GLOBAL.Device_IsWebTV == false &&
                    GLOBAL.Device_IsAppleTV == false,
                )(<KeepAwake />)}
            </View>
        );
    }
    getRecordingName(content_name) {
        return decodeURIComponent(content_name);
    }
    _controls() {
        return (
            <ImageBackground
                style={{ flex: 1, width: null, height: null }}
                imageStyle={{ resizeMode: 'cover' }}
                source={require('../../images/player_bg.png')}
            >
                <View
                    style={{
                        position: 'absolute',
                        zIndex: 9999,
                        width: '100%',
                        height: '100%',
                        paddingBottom: GLOBAL.Device_IsAppleTV ? 50 : 0,
                    }}
                >
                    <View
                        style={{ flex: 1, flexDirection: 'column', padding: 10 }}
                    >
                        <View
                            style={{
                                flex: 1,
                                position: 'relative',
                                zIndex: 9999,
                            }}
                        >
                            <View style={{ flexDirection: 'row' }}>
                                <View
                                    style={{
                                        justifyContent: 'flex-start',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    {/* <ButtonCircle underlayColor={GLOBAL.Button_Color} Icon={SolidIcons.arrowLeft} onPress={() => this.getBack()}></ButtonCircle> */}
                                    <ButtonAutoSize
                                        underlayColor={GLOBAL.Button_Color}
                                        Icon={"arrow-left"}
                                        onPress={() => this.getBack()}
                                        Text={LANG.getTranslation('back')}
                                    />
                                </View>
                                <View style={{ flex: 1 }}></View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                    }}
                                ></View>
                            </View>
                        </View>
                        <View
                            style={{
                                flex:
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 1
                                        : GLOBAL.Device_IsPhone
                                            ? 1
                                            : GLOBAL.Device_IsAppleTV
                                                ? 5
                                                : GLOBAL.Device_IsWebTV &&
                                                    !GLOBAL.Device_IsSmartTV
                                                    ? 4
                                                    : GLOBAL.Device_IsSmartTV &&
                                                        GLOBAL.Device_Manufacturer !=
                                                        'Samsung Tizen'
                                                        ? 2
                                                        : 3,
                            }}
                        >
                            {RenderIf(
                                this.state.askresume == true &&
                                this.state.show_childlock == false &&
                                this.state.paused == false &&
                                this.state.is_ad == false,
                            )(
                                <View
                                    style={{
                                        width: 300,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        borderWidth: 3,
                                        borderColor: '#fff',
                                    }}
                                >
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{
                                            margin: 0,
                                            padding: 0,
                                            marginLeft: 30,
                                            marginRight: 30,
                                            width: 290,
                                            height: 60,
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.73)',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                        underlayColor={GLOBAL.Button_Color}
                                        onFocus={() =>
                                            this.setState({ play_focus: false })
                                        }
                                        onPress={() => this.onRestartMovie()}
                                    >
                                        <View>
                                            <Text style={styles.H5}>
                                                <FontAwesome5
                                                    style={[styles.IconsMenu]}
                                                    // icon={SolidIcons.undo}
                                                    name="undo"
                                                />
                                                &nbsp;{' '}
                                                {LANG.getTranslation('restart')}
                                            </Text>
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>,
                            )}
                            {RenderIf(this.state.paused)(
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'column',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <FontAwesome5
                                        style={{
                                            fontSize: 75,
                                            color: '#fff',
                                            textShadowColor:
                                                'rgba(0, 0, 0, 0.25)',
                                            textShadowOffset: {
                                                width: 2,
                                                height: 2,
                                            },
                                            textShadowRadius: 10,
                                        }}
                                        // icon={RegularIcons.pauseCircle}
                                        name="pause-circle"
                                    />
                                </View>,
                            )}
                            {RenderIf(this.state.show_childlock == true)(
                                <View
                                    style={{
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <Text style={[styles.H2, { margin: 20 }]}>
                                        {LANG.getTranslation('childlock')}
                                    </Text>
                                    <View
                                        style={{
                                            marginTop: 10,
                                            paddingTop: 15,
                                            paddingBottom: 15,
                                            marginLeft: 30,
                                            marginRight: 30,
                                            borderRadius: 5,
                                            borderWidth: 3,
                                            borderColor: '#fff',
                                            width: 300,
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.23)',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <InputCode
                                                    ref={parentalcontrol =>
                                                    (this.parentalcontrol =
                                                        parentalcontrol)
                                                    }
                                                    value={this.state.code}
                                                    onChangeText={
                                                        this.handleInputCode
                                                    }
                                                    width={150}
                                                    showerror={
                                                        this.state.error_icon
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>,
                            )}

                            {RenderIf(
                                this.state.seeking == true &&
                                !GLOBAL.Device_IsPhone,
                            )(
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <View
                                        style={{
                                            marginTop: 10,
                                            paddingTop: 15,
                                            paddingBottom: 15,
                                            marginLeft: 30,
                                            marginRight: 30,
                                            borderRadius: 5,
                                            borderWidth: 3,
                                            borderColor: '#fff',
                                            width: 300,
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.73)',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View>
                                            <Text style={styles.H3}>
                                                {moment('2015-01-01')
                                                    .startOf('day')
                                                    .seconds(
                                                        this.state.seek_time,
                                                    )
                                                    .format('HH:mm:ss')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>,
                            )}
                            {RenderIf(
                                this.state.show_childlock == true &&
                                (GLOBAL.Device_IsPhone ||
                                    GLOBAL.Device_IsTablet),
                            )(
                                <View
                                    style={{
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <Text style={[styles.H2, { margin: 20 }]}>
                                        {LANG.getTranslation('childlock')}
                                    </Text>
                                    <View
                                        style={{
                                            marginTop: 10,

                                            marginLeft: 30,
                                            marginRight: 30,
                                            borderRadius: 5,
                                            borderWidth: 3,
                                            borderColor: '#fff',
                                            width: 300,
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.23)',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <InputCode
                                                    ref={parentalcontrol =>
                                                    (this.parentalcontrol =
                                                        parentalcontrol)
                                                    }
                                                    value={this.state.code}
                                                    onChangeText={
                                                        this.handleInputCode
                                                    }
                                                    width={150}
                                                    showerror={
                                                        this.state.error_icon
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>,
                            )}
                            {RenderIf(this.state.error != '')(
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <View
                                        style={{
                                            marginTop: 10,
                                            paddingTop: 15,
                                            paddingBottom: 15,
                                            marginLeft: 30,
                                            marginRight: 30,
                                            borderRadius: 5,
                                            borderWidth: 3,
                                            width: 300,
                                            borderColor: 'red',
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.73)',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View>
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    styles.H5,
                                                    { color: '#fff' },
                                                ]}
                                            >
                                                {this.state.error}
                                            </Text>
                                        </View>
                                    </View>
                                </View>,
                            )}
                        </View>
                        <View style={{ flex: GLOBAL.Device_IsPhone ? 2 : 1 }}>
                            <View
                                style={{
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        margin: 10,
                                        flexDirection: 'row',
                                    }}
                                >
                                    {/* <View style={{ flexDirection: 'column' }}>
                                        <Text numberOfLines={1} style={styles.H1}>{this.state.recording.channel_name}</Text>
                                        <Text style={styles.Standard}>{this.getRecordingName(this.state.recording.program_name)}</Text>
                                    </View> */}
                                </View>
                                {RenderIf(this.state.show_childlock == false)(
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            paddingHorizontal: 10,
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 10,
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                paddingHorizontal: 10,
                                                paddingBottom: 5,
                                            }}
                                        >
                                            <Scrubber
                                                value={this.state.current_time}
                                                onSlidingComplete={
                                                    this.valueChange
                                                }
                                                totalDuration={
                                                    this.state.duration
                                                }
                                                trackColor={'gray'}
                                                bufferedValue={
                                                    this.state.playable_duration
                                                }
                                                bufferedTrackColor="#333"
                                                scrubbedColor={'gray'}
                                            />
                                        </View>
                                    </View>,
                                )}
                                <View style={{ flexDirection: 'row' }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            margin: 10,
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text
                                                numberOfLines={1}
                                                style={styles.H1}
                                            >
                                                {
                                                    this.state.recording
                                                        .channel_name
                                                }
                                            </Text>
                                            <Text style={styles.Standard}>
                                                {this.getRecordingName(
                                                    this.state.recording
                                                        .program_name,
                                                )}
                                            </Text>
                                        </View>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {RenderIf(
                                            this.state.show_childlock == false,
                                        )(
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    Size={25}
                                                    onFocus={() =>
                                                        this.focusSeek()
                                                    }
                                                    onBlur={() =>
                                                        this.blurSeek()
                                                    }
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={"backward"}
                                                    onPress={() =>
                                                        this._onPlayerRewind()
                                                    }
                                                ></ButtonCircle>
                                                <ButtonCircle
                                                    hasTVPreferredFocus={
                                                        this.state.play_focus
                                                    }
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Size={40}
                                                    Icon={this.state.playstatus}
                                                    onPress={() =>
                                                        this._onPlayerPausePlay()
                                                    }
                                                ></ButtonCircle>
                                                <ButtonCircle
                                                    Size={25}
                                                    onFocus={() =>
                                                        this.focusSeek()
                                                    }
                                                    onBlur={() =>
                                                        this.blurSeek()
                                                    }
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={"forward"}
                                                    onPress={() =>
                                                        this._onPlayerForward()
                                                    }
                                                ></ButtonCircle>
                                            </View>,
                                        )}
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        {RenderIf(
                                            this.state.show_childlock == false,
                                        )(
                                            <ButtonCircle
                                                Size={25}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={"compress"}
                                                onPress={() =>
                                                    this.setState({
                                                        button_support: false,
                                                        button_audio: false,
                                                        button_settings: false,
                                                        button_subtitles: false,
                                                        button_screensize: true,
                                                        show_popup: true,
                                                        play_focus: false,
                                                        controls: false,
                                                    })
                                                }
                                            ></ButtonCircle>,
                                        )}
                                        {RenderIf(
                                            this.state.audio_tracks.length >
                                            1 &&
                                            this.state.show_childlock ==
                                            false,
                                        )(
                                            <ButtonCircle
                                                Size={25}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={
                                                    "audio-description"
                                                }
                                                onPress={() =>
                                                    this.setState({
                                                        button_support: false,
                                                        button_audio: true,
                                                        button_settings: false,
                                                        button_subtitles: false,
                                                        button_screensize: false,
                                                        show_popup: true,
                                                        play_focus: false,
                                                        controls: false,
                                                    })
                                                }
                                            ></ButtonCircle>,
                                        )}
                                        {RenderIf(
                                            this.state.text_tracks.length > 0 &&
                                            this.state.show_childlock ==
                                            false,
                                        )(
                                            <ButtonCircle
                                                Size={25}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={
                                                    "closed-captioning"
                                                }
                                                onPress={() =>
                                                    this.setState({
                                                        button_support: false,
                                                        button_audio: false,
                                                        button_settings: false,
                                                        button_subtitles: true,
                                                        button_screensize: false,
                                                        show_popup: true,
                                                        play_focus: false,
                                                        controls: false,
                                                    })
                                                }
                                            ></ButtonCircle>,
                                        )}
                                        {/* {RenderIf(GLOBAL.Device_IsWebTV == true && this.state.show_childlock == false)(
                                        <ButtonCircle underlayColor={GLOBAL.Button_Color} ChromeCast onPress={() => startCasting(this.state.stream, this.state.type_)}></ButtonCircle>
                                    )} */}
                                        {RenderIf(
                                            GLOBAL.Device_IsWebTV == true &&
                                            GLOBAL.Device_IsSmartTV ==
                                            false &&
                                            this.state.show_childlock ==
                                            false,
                                        )(
                                            <ButtonCircle
                                                Size={25}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={"expand"}
                                                onPress={() =>
                                                    this.goFullScreen()
                                                }
                                            ></ButtonCircle>,
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        );
    }
    _setFocusOnFirst(index) {
        if (GLOBAL.Device_IsTV == true) {
            return index === 0;
        }
        return false;
    }
}
