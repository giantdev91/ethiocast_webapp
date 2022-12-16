import React, { PureComponent } from 'react';
import {
    TextInput,
    BackHandler,
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
// import {SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Parser from '../components/M3U_Parser/Parser';

var new_unix = 0;
export default class Player_M3U extends PureComponent {
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
        var channel_list_width = 0;
        if (!GLOBAL.Device_IsPhone) {
            channel_list_width = GLOBAL.COL_3;
        }

        this.state = {
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
            show_m3u_setup: GLOBAL.M3U_Playlist_Url == '' ? true : false,
            show_m3u_loader: GLOBAL.M3U_Playlist_Url != '' ? true : false,
            m3u_url:
                this.props.m3u_url != undefined
                    ? this.props.m3u_url
                    : GLOBAL.M3U_Playlist_Url,
            show_m3u_loaded: false,
            show_m3u_loaded_amount: 0,
            categories: [],
            channels: [],
            channellist: false,
            show_channel_menu: false,
            show_channel_search: false,
            show_category_menu: false,
            channel_list_width: channel_list_width,
            selected_item_logo: '',
            selected_item_name: '',
            show_exit_app: false,
            m3u_index: 0,
            showcontrols: false,
        };

        this.onSwipeDown = this.onSwipeDown.bind(this);
        this.onSwipeLeft = this.onSwipeLeft.bind(this);
        this.onSwipeRight = this.onSwipeRight.bind(this);
        this.onSwipeUp = this.onSwipeUp.bind(this);

        if (GLOBAL.Device_IsPhone == true || GLOBAL.Device_IsTablet == true) {
            if (GLOBAL.Device_System != 'Apple') {
                try {
                    GoogleCast.EventEmitter.addListener(
                        GoogleCast.MEDIA_PLAYBACK_STARTED,
                        ({ mediaStatus }) => {
                            GLOBAL.Casting = true;
                            GoogleCast.launchExpandedControls();
                        },
                    );
                } catch (error) { }
            }
        }
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
        this.slideIn();
    }
    onSwipeDown(gestureState) {
        if (this.state.show_childlock == true) {
            return;
        }
        if (this.state.show_bar == true) {
            TimerMixin.clearTimeout(this.timer1);
            this.setState({
                show_bar: false,
            });
        }
        this.slideAll();
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
        this.setSeek(60);
        if (this.state.show_bar == false) {
            this.slideIn();
        }
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
        this.setSeek(-60);
        if (this.state.show_bar == false) {
            this.slideIn();
        }
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
        if (
            (event.keyCode == 37 || event.keyCode == 16) &&
            this.state.show_popup == false &&
            this.state.channellist == false &&
            this.state.showcontrols == false
        ) {
            //left
            this.playNextItem(-1);
        }
        if (
            (event.keyCode == 39 || event.keyCode == 166) &&
            this.state.show_popup == false &&
            this.state.channellist == false &&
            this.state.showcontrols == false
        ) {
            //right
            this.playNextItem(1);
        }
        if (event.keyCode === 38 && this.state.channellist == false) {
            //down
            this.toggleChannelList();
        }
        if (event.keyCode === 39 && this.state.channellist == false) {
            //down
            this.setState({
                showcontrols: true,
                controls: true,
            });
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
            if (this.state.show_popup == true) {
                this.setState({
                    show_childlock: false,
                    show_popup: false,
                    button_audio: false,
                    button_screensize: false,
                    button_settings: false,
                    button_support: false,
                    button_subtitles: false,
                    button_thanks: false,
                    channellist: false,
                    play_focus: this.state.play_focus == true ? false : true,
                });
                this.fadeIn();
            } else if (this.state.controls == true) {
                this.setState({
                    controls: false,
                    show: false,
                    askresume: false,
                    showcontrols: false,
                    play_focus: this.state.play_focus == true ? false : true,
                });
            } else {
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
    updateDimensions() {
        return true;
    }
    _handleAppStateChange = nextAppState => {
        if (nextAppState == 'background') {
            this.fadeBackOut();
            this.setState({ stream: GLOBAL.VIDEO_TEST_URL });
        }
        if (nextAppState == 'active') {
            this.fadeIn();
            this.refreshIpAddress();
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
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV == false && GLOBAL.Device_IsPhone == false) {
            AppState.addEventListener('change', this._handleAppStateChange);
        }

        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            document.addEventListener('keydown', this.backButton, false);
            window.addEventListener('resize', this.updateDimensions);
        }

        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToLandscape();
        }
        if (this.state.show_m3u_loader == true) {
            this.startLoadingM3U();
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (keyEvent.keyCode == 126) {
                    //pause
                    this.fadeIn();
                    this._onPlayerPausePlay();
                }
                if (keyEvent.keyCode == 175) {
                    //CC
                    this.fadeIn();
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
                    this.fadeIn();
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
                    this.fadeIn();
                    this._onPlayerPausePlay();
                }
                if (keyEvent.keyCode == 126 || keyEvent.keyCode == 85) {
                    //play
                    this.fadeIn();
                    this._onPlayerPausePlay();
                }

                if (keyEvent.keyCode == 85) {
                    this.fadeIn();
                    this._onPlayerPausePlay();
                }
                if (
                    keyEvent.keyCode == 21 &&
                    this.state.show_popup == false &&
                    this.state.channellist == false &&
                    this.state.showcontrols == false
                ) {
                    //left
                    this.playNextItem(-1);
                }
                if (
                    keyEvent.keyCode == 22 &&
                    this.state.show_popup == false &&
                    this.state.channellist == false &&
                    this.state.showcontrols == false
                ) {
                    //right
                    this.playNextItem(1);
                }
                if (
                    keyEvent.keyCode === 19 &&
                    this.state.channellist == false
                ) {
                    //down
                    this.toggleChannelList();
                }
                if (
                    keyEvent.keyCode === 20 &&
                    this.state.channellist == false
                ) {
                    //down
                    this.setState({
                        showcontrols: true,
                        controls: true,
                    });
                }

                return true;
            });
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.state.show_popup == true) {
                    this.setState({
                        show_childlock: false,
                        show_popup: false,
                        button_audio: false,
                        button_screensize: false,
                        button_settings: false,
                        button_support: false,
                        button_subtitles: false,
                        button_thanks: false,
                        channellist: false,
                        play_focus:
                            this.state.play_focus == true ? false : true,
                    });
                    this.fadeIn();
                } else if (this.state.controls == true) {
                    this.setState({
                        controls: false,
                        show: false,
                        askresume: false,
                        showcontrols: false,
                        play_focus:
                            this.state.play_focus == true ? false : true,
                    });
                } else {
                    if (this.state.show_exit_app == false) {
                        this.setState({
                            show_exit_app: true,
                        });
                        this.starExitTimer();
                        return true;
                    }
                }
                return true;
            },
        );
    }
    _closePopups() {
        this.setState({
            show_popup: false,
            button_audio: false,
            button_screensize: false,
            button_settings: false,
            button_support: false,
            button_subtitles: false,
            button_thanks: false,
            channellist: false,
            play_focus: this.state.play_focus == true ? false : true,
        });
        this.fadeIn();
    }
    getBack() {
        this.setState({
            show_popup: false,
            button_audio: false,
            button_screensize: false,
            button_settings: false,
            button_support: false,
            button_subtitles: false,
            button_thanks: false,
            play_focus: this.state.play_focus == true ? false : true,
        });
        this.fadeBackOut();
    }
    componentWillUnmount() {
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
        TimerMixin.clearTimeout(this.exittimer);

        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToPortrait();
        }
        if (GLOBAL.Device_IsAppleTV == true) {
            this._disableTVEventHandler();
        }
        Actions.pop();
    }
    startPlayListItem(item) {
        this.getCurrentStream(item);
    }
    getCurrentStream(item) {
        var type = 'm3u8';
        var type_ = 'application/x-mpegURL';
        var url = item.url;
        var url_ = url.split('?');
        var extension = url_[0].split('.').pop();
        if (extension == 'mp4') {
            type = 'mp4';
            type_ = 'video/mp4';
        }
        if (extension == 'mpd') {
            type = 'mpd';
            type_ = 'DASH';
        }
        if (extension == 'm3u8') {
            type = 'm3u8';
            type_ = 'application/x-mpegURL';
        }
        this.setState({
            stream: url,
            type: type,
            drmKey: '',
            paused: false,
            seek: 0,
            vast: 'https://',
            player_type: 'exo',
            audio_track_index: 0,
            text_track_index: 0,
            channellist: false,
            selected_item_logo: item.tvg.logo,
            selected_item_name: item.name,
            show_popup: false,
        });
        this.fadeIn();
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
        this.setState({
            resizeMode: type,
            show_popup: false,
        });
        this._closePopups();
    }
    _onPressSetAudio(index, language) {
        if (GLOBAL.Device_IsWebTV) {
            player.selectAudioLanguage(language);
        }
        GLOBAL.Selected_AudioTrack = language;
    }
    _onPressSetSubtitle(index, language) {
        if (GLOBAL.Device_IsWebTV) {
            if (index == 999) {
                player.setTextTrackVisibility(false);
            } else {
                var data = Array.from(player.getTextTracks());
                var track = data[index];
                player.setTextTrackVisibility(true);
                player.selectTextTrack(track);
            }
        }
        GLOBAL.Selected_TextTrack = language;
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
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        if (this.state.seeking == false && this.state.controls == true) {
            var position = data.currentTime;
            var playable = data.playableDuration;
            this.setState({
                current_time: position,
                playable_duration: playable,
                current_time_human: moment('2015-01-01')
                    .startOf('day')
                    .seconds(position)
                    .format('HH:mm:ss'),
            });
        }
    };
    onEnd = () => { };
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
            TimerMixin.clearTimeout(this.seekTimer_);
            this.seekTimer = TimerMixin.setTimeout(() => {
                if (GLOBAL.Device_IsWebTV) {
                    player.currentTime(this.state.seek_time);
                }
                if (!GLOBAL.Device_IsWebTV) {
                    this.setState({
                        seek: this.state.seek_time,
                        current_time: this.state.seek_time,
                    });
                    this.player.seek(this.state.seek_time);
                }
            }, 1000);
            TimerMixin.clearTimeout(this.seekTimer_);
            this.seekTimer_ = TimerMixin.setTimeout(() => {
                this.setState({
                    seek_time: 0,
                    seeking: false,
                });
                this.fadeBackOut();
            }, 3000);
        }
    };
    onError = data => { };
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
            text_tracks: this.getTrackTranslated(data.textTracks, 'subs'),
            audio_tracks: this.getTrackTranslated(data.audioTracks, 'audio'),
            duration: data.duration,
            buffering: false,
            total_time_human: moment('2015-01-01')
                .startOf('day')
                .seconds(data.duration)
                .format('HH:mm:ss'),
        });
    };

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
        if (GLOBAL.Device_IsWebTV && type == 'subs') {
            data = Array.from(player.getTextTracks());
        }
        if (GLOBAL.Device_IsWebTV && type == 'audio') {
            data = Array.from(player.getAudioLanguages());
        }
        var subs = [];
        var i = 0;
        if (data == undefined || data == null) {
            return subs;
        }
        // if (GLOBAL.Device_IsWebTV && type == "subs") {
        //     this.setState({
        //         text_track_index: 999,
        //         text_track_type: 'disabled',
        //     })
        // }
        // if (GLOBAL.Device_IsWebTV && type == "audio") {
        //     this.setState({
        //         audio_track_index: 0
        //     })
        // }
        data.forEach(element => {
            var language =
                GLOBAL.Device_IsWebTV && type == 'subs'
                    ? element.label
                    : GLOBAL.Device_IsWebTV && type == 'audio'
                        ? element
                        : element.title;
            if (type == 'subs' && GLOBAL.Selected_TextTrack == language) {
                this.setState({
                    text_track_index: i,
                    text_track_type: 'index',
                });
            }
            if (type == 'audio' && GLOBAL.Selected_AudioTrack == language) {
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
        if (type == 'subs') {
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
        this.setState({
            controls: true,
            show: true,
            play_focus: true,
            miniepg: false,
        });
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
    onChangeText(input) {
        this.setState({
            m3u_url: input,
        });
    }
    cancelLoadingM3U() {
        this.setState({
            show_m3u_loader: false,
            show_m3u_setup: true,
        });
    }
    playNextItem(updown) {
        var index = this.state.m3u_index + updown;
        if (index < this.state.channels.length && index > 0) {
            var find = this.state.channels[index];
            if (find != undefined) {
                this.setState({
                    m3u_index: index,
                });
                this.startPlayListItem(find);
            }
        }
    }
    startLoadingM3U() {
        this.setState(
            {
                show_m3u_setup: false,
                show_m3u_loader: true,
            },
            () => {
                var path = this.state.m3u_url;
                DAL.getText(path)
                    .then(data => {
                        var parsed = Parser.parse(data);
                        var categories = parsed.items.filter(
                            p => p.url == '' && p.tvg.id == '',
                        );
                        var channels = parsed.items.filter(
                            p => p.url != '' && p.tvg.id != '',
                        );
                        this.setState({
                            show_m3u_loaded: true,
                            show_m3u_loaded_amount: parsed.items.length,
                            categories: categories,
                            channels: channels,
                        });
                    })
                    .catch(error => {
                        this.setState({
                            show_m3u_loader: false,
                            show_m3u_setup: true,
                        });
                    });
            },
        );
    }
    closeLoadingM3U() {
        this.setState({
            show_m3u_loaded: false,
            show_m3u_loaded_amount: 0,
            show_m3u_loader: false,
            show_m3u_setup: false,
        });
        this.toggleChannelList();
    }
    showLoadingM3U() {
        this.setState({
            show_m3u_loaded: false,
            show_m3u_loaded_amount: 0,
            show_m3u_loader: false,
            show_m3u_setup: true,
        });
    }
    toggleChannelList() {
        this.fadeOut();
        if (this.state.channellist == false) {
            this.setState({
                show_popup: true,
                channellist: true,
                show_channel_menu: true,
                show_channel_search: false,
                show_category_menu: false,
            });
        } else {
            this.setState({
                show_popup: false,
                channellist: false,
                show_channel_menu: false,
                show_channel_search: false,
                show_category_menu: false,
            });
        }
    }
    _onPressCategoryChange(index) { }
    _renderCategory(item, index) {
        return (
            <TouchableHighlightFocus
                style={{ width: this.state.channel_list_width }}
                BorderRadius={5}
                key={index}
                hasTVPreferredFocus={
                    index == GLOBAL.Selected_Next_Category_Index ? true : false
                }
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onPressCategoryChange(item)}
            >
                <View
                    style={[
                        {
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 10,
                            margin: 2,
                            width: this.state.channel_list_width - 12,
                            borderRadius: 5,
                        },
                    ]}
                >
                    <View style={{ padding: 10, margin: 2, paddingLeft: 20 }}>
                        <Text style={styles.H2}>{item.name}</Text>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
    closeChannelist() {
        this.setState({
            channellist: false,
            show_popup: false,
        });
        this.fadeIn();
    }
    onChangeText(text) { }
    render() {
        const barWidth = Dimensions.get('screen').width;
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
        };
        return (
            <View style={{ flex: 1 }}>
                {RenderIf(this.state.show_exit_app)(
                    <Modal
                        Title={LANG.getTranslation('exit_app')}
                        Centered={true}
                        TextHeader={LANG.getTranslation('exit_app_click_again')}
                        TextMain={LANG.getTranslation('exit_app_close')}
                    ></Modal>,
                )}
                {RenderIf(this.state.show_m3u_setup)(
                    <View
                        style={{
                            backgroundColor: '#333',
                            width: GLOBAL.COL_1,
                            height: GLOBAL.ROW_1,
                        }}
                    >
                        <View style={{ padding: 20, paddingBottom: 50 }}>
                            <Text style={styles.H1}>
                                {LANG.getTranslation('m3u_header')}
                            </Text>
                            <Text style={styles.H4}>
                                {LANG.getTranslation('m3u_subtext')}
                            </Text>
                        </View>
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
                            {RenderIf(
                                GLOBAL.Device_IsSmartTV ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_IsSTB ||
                                GLOBAL.Device_IsFireTV ||
                                GLOBAL.Device_IsAndroidTV,
                            )(
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{
                                        height: GLOBAL.Device_IsSmartTV
                                            ? 78
                                            : GLOBAL.Device_IsAppleTV
                                                ? 106
                                                : 60,
                                        borderRadius: 5,
                                    }}
                                    hasTVPreferredFocus={true}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() =>
                                        Actions.Auth_Keyboard({
                                            PlaceHolder:
                                                LANG.getTranslation(
                                                    'm3u_your_url',
                                                ),
                                            Value: this.state.m3u_url,
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
                                                alignContent: 'flex-start',
                                                width: GLOBAL.COL_1 - 200,
                                            }}
                                        >
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenu,
                                                    { padding: 10 },
                                                ]}
                                                // icon={SolidIcons.projectDiagram}
                                                name="project-diagram"
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
                                                {this.state.m3u_url}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableHighlightFocus>,
                            )}
                            {RenderIf(
                                (GLOBAL.Device_IsWebTV == true &&
                                    GLOBAL.Device_IsSmartTV == false) ||
                                GLOBAL.Device_IsPhone ||
                                GLOBAL.Device_IsTablet,
                            )(
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{ height: 60 }}
                                    hasTVPreferredFocus={true}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this.service.focus()}
                                >
                                    <View
                                        style={{ flex: 1, flexDirection: 'row' }}
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
                                                // icon={SolidIcons.globe}
                                                name="globe"
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
                                                ref={service =>
                                                    (this.service = service)
                                                }
                                                style={[
                                                    styles.InputMobile,
                                                    { width: GLOBAL.COL_1 - 200 },
                                                ]}
                                                value={this.state.m3u_url}
                                                placeholder={LANG.getTranslation(
                                                    'm3u_your_url',
                                                )}
                                                underlineColorAndroid="rgba(0,0,0,0)"
                                                placeholderTextColor="#fff"
                                                selectionColor="#000"
                                                onChangeText={text =>
                                                    this.setState({
                                                        m3u_url: text,
                                                    })
                                                }
                                                keyboardAppearance={'dark'}
                                            />
                                        </View>
                                    </View>
                                </TouchableHighlightFocus>,
                            )}
                        </View>
                        <View
                            style={{
                                justifyContent: 'flex-end',
                                alignContent: 'flex-end',
                                alignItems: 'flex-end',
                                alignSelf: 'flex-end',
                                padding: 20,
                            }}
                        >
                            <ButtonNormal
                                hasTVPreferredFocus={true}
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() => this.startLoadingM3U()}
                                Text={LANG.getTranslation('m3u_loadurl')}
                            />
                        </View>
                    </View>,
                )}
                {RenderIf(this.state.show_m3u_loader)(
                    <View
                        style={{
                            backgroundColor: '#333',
                            width: GLOBAL.COL_1,
                            height: GLOBAL.ROW_1,
                        }}
                    >
                        <View style={{ padding: 20, paddingBottom: 50 }}>
                            <Text style={styles.H1}>
                                {LANG.getTranslation('m3u_loading_header')}
                            </Text>
                            <Text style={styles.H4}>
                                {LANG.getTranslation('m3u_loading_subtext')}
                            </Text>
                        </View>
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
                            {RenderIf(!this.state.show_m3u_loaded)(
                                <Loader
                                    size={'large'}
                                    color={'#e0e0e0'}
                                    style={styles.Shadow}
                                />,
                            )}
                            {RenderIf(this.state.show_m3u_loaded)(
                                <Text style={styles.H4}>
                                    {LANG.getTranslation('we_found')}{' '}
                                    {this.state.show_m3u_loaded_amount}{' '}
                                    {LANG.getTranslation('playlist_items')}
                                </Text>,
                            )}
                        </View>
                        <View
                            style={{
                                justifyContent: 'flex-end',
                                alignContent: 'flex-end',
                                alignItems: 'flex-end',
                                alignSelf: 'flex-end',
                                padding: 20,
                            }}
                        >
                            {RenderIf(!this.state.show_m3u_loaded)(
                                <ButtonNormal
                                    hasTVPreferredFocus={true}
                                    Padding={0}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this.cancelLoadingM3U()}
                                    Text={LANG.getTranslation('cancel')}
                                />,
                            )}
                            {RenderIf(this.state.show_m3u_loaded)(
                                <ButtonNormal
                                    hasTVPreferredFocus={true}
                                    Padding={0}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this.closeLoadingM3U()}
                                    Text={LANG.getTranslation('close')}
                                />,
                            )}
                        </View>
                    </View>,
                )}

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
                        this.state.channellist == true &&
                        this.state.button_subtitles == false &&
                        this.state.button_audio == false &&
                        this.state.button_screensize == false,
                    )(
                        <View
                            style={{
                                height: GLOBAL.ROW_1,
                                flexDirection: 'row',
                                position: 'absolute',
                                zIndex: 9999,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'column',
                                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                    paddingBottom: 5,
                                    width: GLOBAL.COL_8,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{
                                            width: GLOBAL.COL_9,
                                            height: GLOBAL.COL_9,
                                            justifyContent: 'center',
                                            borderRadius: 5,
                                        }}
                                        hasTVPreferredFocus={false}
                                        s
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() =>
                                            this.setState({
                                                show_category_menu: false,
                                                show_channel_menu: true,
                                            })
                                        }
                                    >
                                        <View
                                            style={{
                                                paddingTop: 10,
                                                paddingBottom: 10,
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenu,
                                                    { color: '#fff' },
                                                ]}
                                                // icon={SolidIcons.th}
                                                name="th"
                                            />
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == false,
                                            )(
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.Medium}
                                                >
                                                    Content
                                                </Text>,
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{
                                            width: GLOBAL.COL_9,
                                            height: GLOBAL.COL_9,
                                            justifyContent: 'center',
                                            borderRadius: 5,
                                        }}
                                        hasTVPreferredFocus={false} underlayColor={GLOBAL.Button_Color} onPress={() => this.setState({
                                            show_category_menu: true,
                                            show_channel_menu: false,

                                        })}>
                                        <View style={{ paddingTop: 10, paddingBottom: 10, flexDirection: 'column', justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                                            <FontAwesome5 style={[styles.IconsMenu, { color: '#fff' }]} icon={SolidIcons.layerGroup} />
                                            {RenderIf(GLOBAL.Device_IsPhone == false)(
                                                <Text numberOfLines={1} style={styles.Medium}>{LANG.getTranslation("categories")}</Text>
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>
                                </View> */}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{
                                            width: GLOBAL.COL_9,
                                            height: GLOBAL.COL_9,
                                            justifyContent: 'center',
                                            borderRadius: 5,
                                        }}
                                        hasTVPreferredFocus={false}
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() => this.closeChannelist()}
                                    >
                                        <View
                                            style={{
                                                paddingTop: 10,
                                                paddingBottom: 10,
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            <FontAwesome5
                                                style={[
                                                    styles.IconsMenu,
                                                    { color: '#fff' },
                                                ]}
                                                // icon={SolidIcons.layerGroup}
                                                name="layer-group"
                                            />
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == false,
                                            )(
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.Medium}
                                                >
                                                    {LANG.getTranslation(
                                                        'close',
                                                    )}
                                                </Text>,
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    height: GLOBAL.ROW_1,
                                    width: this.state.channel_list_width,
                                }}
                            >
                                {RenderIf(this.state.show_category_menu)(
                                    <View
                                        style={{
                                            width: this.state
                                                .channel_list_width,
                                            flexDirection: 'row',
                                            height: GLOBAL.ROW_1,
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.40)',
                                        }}
                                    >
                                        <FlatList
                                            ref={el => (this.catlist = el)}
                                            data={this.state.categories}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            getItemLayout={(data, index) => {
                                                return {
                                                    length: 110,
                                                    index,
                                                    offset: 110 * index,
                                                };
                                            }}
                                            renderItem={({ item, index }) => {
                                                return this._renderCategory(
                                                    item,
                                                    index,
                                                );
                                            }}
                                        />
                                    </View>,
                                )}
                                {RenderIf(this.state.show_channel_menu)(
                                    <View
                                        style={{ flex: 1, flexDirection: 'row' }}
                                    >
                                        {RenderIf(
                                            this.state.show_channel_search ==
                                            false &&
                                            GLOBAL.Device_IsPhone == false,
                                        )(
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    width: this.state
                                                        .channel_list_width,
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.50)',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <ChannelList
                                                        Channels={
                                                            this.state.channels
                                                        }
                                                        Width={
                                                            this.state
                                                                .channel_list_width
                                                        }
                                                        Type={'M3U'}
                                                        Columns={1}
                                                        getItemLayout={(
                                                            data,
                                                            index,
                                                        ) => {
                                                            return {
                                                                length:
                                                                    GLOBAL.Device_IsAppleTV ||
                                                                        GLOBAL.Device_Manufacturer ==
                                                                        'Samsung Tizen'
                                                                        ? 160
                                                                        : GLOBAL.Device_IsAndroidTV ||
                                                                            GLOBAL.Device_IsFireTV
                                                                            ? 110
                                                                            : 120,
                                                                index,
                                                                offset:
                                                                    (GLOBAL.Device_IsAppleTV ||
                                                                        GLOBAL.Device_Manufacturer ==
                                                                        'Samsung Tizen'
                                                                        ? 150
                                                                        : GLOBAL.Device_IsAndroidTV ||
                                                                            GLOBAL.Device_IsFireTV
                                                                            ? 100
                                                                            : 120) *
                                                                    index,
                                                            };
                                                        }}
                                                        onPress={item =>
                                                            this.startPlayListItem(
                                                                item,
                                                            )
                                                        }
                                                    />
                                                </View>
                                            </View>,
                                        )}
                                        {RenderIf(
                                            this.state.show_channel_search ==
                                            false &&
                                            GLOBAL.Device_IsPhone == true &&
                                            this.state.show_catchup_menu ==
                                            false,
                                        )(
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    width: this.state
                                                        .channel_list_width,
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.50)',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <ChannelList
                                                        Channels={
                                                            this.state.channels
                                                        }
                                                        Width={
                                                            this.state
                                                                .channel_list_width
                                                        }
                                                        Type={'M3U'}
                                                        Columns={1}
                                                        getItemLayout={(
                                                            data,
                                                            index,
                                                        ) => {
                                                            return {
                                                                length: 120,
                                                                index,
                                                                offset:
                                                                    120 * index,
                                                            };
                                                        }}
                                                        onPress={item =>
                                                            this.startPlayListItem(
                                                                item,
                                                            )
                                                        }
                                                    />
                                                </View>
                                            </View>,
                                        )}

                                        {RenderIf(
                                            this.state.show_channel_search ==
                                            true,
                                        )(
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'column',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'column',
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.50)',
                                                        width:
                                                            this.state
                                                                .channel_list_width +
                                                            10,
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            width: this.state
                                                                .channel_list_width,
                                                            flexDirection:
                                                                'column',
                                                            margin: 5,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'row',
                                                            }}
                                                        >
                                                            {RenderIf(
                                                                (GLOBAL.Device_IsWebTV ==
                                                                    true &&
                                                                    GLOBAL.Device_IsSmartTV ==
                                                                    false) ||
                                                                GLOBAL.Device_IsPhone ||
                                                                GLOBAL.Device_IsTablet,
                                                            )(
                                                                <InputSearch
                                                                    ref={search =>
                                                                    (this.search =
                                                                        search)
                                                                    }
                                                                    value={
                                                                        this
                                                                            .state
                                                                            .channel_search_term
                                                                    }
                                                                    onChangeText={value =>
                                                                        this.setState(
                                                                            {
                                                                                channel_search_term:
                                                                                    value,
                                                                            },
                                                                        )
                                                                    }
                                                                    Width={
                                                                        this
                                                                            .state
                                                                            .channel_list_width
                                                                    }
                                                                    isTV={true}
                                                                    onEndEditing={value =>
                                                                        this.searchContent(
                                                                            this
                                                                                .state
                                                                                .channel_search_term,
                                                                        )
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                GLOBAL.Device_IsSmartTV ||
                                                                GLOBAL.Device_IsAppleTV ||
                                                                GLOBAL.Device_IsSTB ||
                                                                GLOBAL.Device_IsFireTV ||
                                                                GLOBAL.Device_IsAndroidTV,
                                                            )(
                                                                <Keyboard
                                                                    PlayerSearch={
                                                                        true
                                                                    }
                                                                    Width={
                                                                        this
                                                                            .state
                                                                            .channel_list_width +
                                                                        10
                                                                    }
                                                                    Margin={10}
                                                                    Icon={
                                                                        "search"
                                                                    }
                                                                    PlaceHolder={LANG.getTranslation(
                                                                        'search_channels',
                                                                    )}
                                                                    Submit={value =>
                                                                        this.searchContent(
                                                                            value,
                                                                        )
                                                                    }
                                                                    LiveReload={
                                                                        true
                                                                    }
                                                                />,
                                                            )}
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                'column',
                                                        }}
                                                    >
                                                        <ChannelList
                                                            PlayerSearch={true}
                                                            Channels={
                                                                this.state
                                                                    .channels_search
                                                            }
                                                            Width={
                                                                this.state
                                                                    .channel_list_width
                                                            }
                                                            Type={'M3U'}
                                                            NoScroll={true}
                                                            Columns={1}
                                                            getItemLayout={(
                                                                data,
                                                                index,
                                                            ) => {
                                                                return {
                                                                    length: 110,
                                                                    index,
                                                                    offset:
                                                                        110 *
                                                                        index,
                                                                };
                                                            }}
                                                            onPress={item =>
                                                                this.startPlayListItem(
                                                                    item,
                                                                )
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            </View>,
                                        )}
                                    </View>,
                                )}
                            </View>
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
                                    style={{
                                        position: 'absolute',
                                        top: 5,
                                        right: 5,
                                    }}
                                >
                                    <ButtonCircle
                                        hasTVPreferredFocus={true}
                                        Rounded={true}
                                        underlayColor={GLOBAL.Button_Color}
                                        Icon={"window-close"}
                                        Size={15}
                                        onPress={() =>
                                            this.setState({
                                                show_childlock: false,
                                            })
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
                                    <Text
                                        style={[styles.Medium, { color: '#fff' }]}
                                    >
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
                                        {RenderIf(
                                            this.state.error_icon == true,
                                        )(
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
                            zIndex: 999,
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
                                    this.state.show == false &&
                                        this.state.channellist == false
                                        ? this.fadeIn()
                                        : null
                                }
                                onPress={() =>
                                    this.state.show == false &&
                                        this.state.channellist == false
                                        ? this.fadeIn()
                                        : null
                                }
                            >
                                {RenderIf(this.state.controls)(
                                    this._controls(),
                                )}
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
            </View>
        );
    }
    getRecordingName(content_name) {
        return decodeURIComponent(content_name);
    }
    logout() {
        // killVideoJSPlayer();
        DAL.getDevices(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            this.toAlphaNumeric(GLOBAL.UserID) + '.' + GLOBAL.Pass,
        )
            .then(devices => {
                if (devices.devices != undefined && devices.devices != '') {
                    var today = moment().utc().unix();
                    var devicesLeft = devices.devices.filter(
                        element => element.uuid != GLOBAL.Device_UniqueID,
                    );
                    var devicesNotToOld = devicesLeft.filter(
                        d => d.valid > today,
                    );
                    DAL.setDevices(
                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                        this.toAlphaNumeric(GLOBAL.UserID) + '.' + GLOBAL.Pass,
                        devicesNotToOld,
                    )
                        .then(result => {
                            GLOBAL.Focus = 'Logout';
                            GLOBAL.AutoLogin = false;
                            if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                                GLOBAL.UserID = '';
                                GLOBAL.Pass = '';
                                GLOBAL.ServiceID = '';
                            }
                            GLOBAL.App_Theme = 'Default';
                            UTILS.storeJson('AutoLogin', false);
                            if (GLOBAL.HasService == true) {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                Actions.Services();
                            } else {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                Actions.Authentication();
                            }
                        })
                        .catch(error => {
                            GLOBAL.Focus = 'Logout';
                            GLOBAL.AutoLogin = false;
                            if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                                GLOBAL.UserID = '';
                                GLOBAL.Pass = '';
                                GLOBAL.ServiceID = '';
                            }
                            GLOBAL.App_Theme = 'Default';
                            UTILS.storeJson('AutoLogin', false);
                            if (GLOBAL.HasService == true) {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                Actions.Services();
                            } else {
                                GLOBAL.Logo =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.logo
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Background =
                                    GLOBAL.HTTPvsHTTPS +
                                    GLOBAL.Settings_Services_Login.contact.background
                                        .toString()
                                        .replace('http://', '')
                                        .replace('https://', '')
                                        .replace('//', '');
                                GLOBAL.Support =
                                    GLOBAL.Settings_Services_Login.contact.text;
                                Actions.Authentication();
                            }
                        });
                } else {
                    GLOBAL.Focus = 'Logout';
                    GLOBAL.AutoLogin = false;
                    if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                        GLOBAL.UserID = '';
                        GLOBAL.Pass = '';
                        GLOBAL.ServiceID = '';
                    }
                    GLOBAL.App_Theme = 'Default';
                    UTILS.storeJson('AutoLogin', false);
                    if (GLOBAL.HasService == true) {
                        GLOBAL.Logo =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Services_Login.contact.logo
                                .toString()
                                .replace('http://', '')
                                .replace('https://', '')
                                .replace('//', '');
                        GLOBAL.Background =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Services_Login.contact.background
                                .toString()
                                .replace('http://', '')
                                .replace('https://', '')
                                .replace('//', '');
                        GLOBAL.Support =
                            GLOBAL.Settings_Services_Login.contact.text;
                        Actions.Services();
                    } else {
                        GLOBAL.Logo =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Services_Login.contact.logo
                                .toString()
                                .replace('http://', '')
                                .replace('https://', '')
                                .replace('//', '');
                        GLOBAL.Background =
                            GLOBAL.HTTPvsHTTPS +
                            GLOBAL.Settings_Services_Login.contact.background
                                .toString()
                                .replace('http://', '')
                                .replace('https://', '')
                                .replace('//', '');
                        GLOBAL.Support =
                            GLOBAL.Settings_Services_Login.contact.text;
                        Actions.Authentication();
                    }
                }
            })
            .catch(error => {
                GLOBAL.Focus = 'Logout';
                GLOBAL.AutoLogin = false;
                if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                    GLOBAL.UserID = '';
                    GLOBAL.Pass = '';
                    GLOBAL.ServiceID = '';
                }
                GLOBAL.App_Theme = 'Default';
                UTILS.storeJson('AutoLogin', false);
                if (GLOBAL.HasService == true) {
                    GLOBAL.Logo =
                        GLOBAL.HTTPvsHTTPS +
                        GLOBAL.Settings_Services_Login.contact.logo
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Background =
                        GLOBAL.HTTPvsHTTPS +
                        GLOBAL.Settings_Services_Login.contact.background
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Support =
                        GLOBAL.Settings_Services_Login.contact.text;
                    Actions.Services();
                } else {
                    GLOBAL.Logo =
                        GLOBAL.HTTPvsHTTPS +
                        GLOBAL.Settings_Services_Login.contact.logo
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Background =
                        GLOBAL.HTTPvsHTTPS +
                        GLOBAL.Settings_Services_Login.contact.background
                            .toString()
                            .replace('http://', '')
                            .replace('https://', '')
                            .replace('//', '');
                    GLOBAL.Support =
                        GLOBAL.Settings_Services_Login.contact.text;
                    Actions.Authentication();
                }
            });
    }
    toAlphaNumeric(input) {
        if (input != null) {
            input = input.toString().replace(/\s/g, '');
            return input.toString().replace(/[^A-Za-z0-9]/g, '');
        } else {
            return '';
        }
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
                            <View
                                pointerEvents={'box-none'}
                                style={{ flexDirection: 'row' }}
                            >
                                <View style={{ flex: 1 }}></View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <ButtonCircle
                                        Size={25}
                                        underlayColor={GLOBAL.Button_Color}
                                        Icon={"th"}
                                        onPress={() => this.toggleChannelList()}
                                    ></ButtonCircle>
                                    <ButtonCircle
                                        Size={25}
                                        underlayColor={GLOBAL.Button_Color}
                                        Icon={"globe"}
                                        onPress={() => this.showLoadingM3U()}
                                    ></ButtonCircle>
                                    <ButtonCircle
                                        Size={25}
                                        underlayColor={GLOBAL.Button_Color}
                                        Icon={"sign-out-alt"}
                                        onPress={() => this.logout()}
                                    ></ButtonCircle>
                                </View>
                            </View>
                        </View>
                        <View
                            style={{
                                flex:
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 2
                                        : GLOBAL.Device_IsPhone
                                            ? 1
                                            : GLOBAL.Device_IsAppleTV
                                                ? 5
                                                : GLOBAL.Device_IsWebTV
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

                            {RenderIf(this.state.seeking == true)(
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
                                {RenderIf(this.state.selected_item_logo != '')(
                                    <View
                                        style={{
                                            flex: 1,
                                            margin: 10,
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <View>
                                            <Image
                                                source={{
                                                    uri: this.state
                                                        .selected_item_logo,
                                                }}
                                                style={{
                                                    width: GLOBAL.Device_IsAppleTV
                                                        ? 75
                                                        : 50,
                                                    height: GLOBAL.Device_IsAppleTV
                                                        ? 75
                                                        : 50,
                                                    padding: 20,
                                                    marginRight: 20,
                                                    marginTop: 5,
                                                }}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text
                                                numberOfLines={1}
                                                style={styles.H1}
                                            >
                                                {this.state.selected_item_name}
                                            </Text>
                                        </View>
                                    </View>,
                                )}
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        paddingHorizontal: 10,
                                        paddingTop: 10,
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
                                            onSlidingComplete={this.valueChange}
                                            totalDuration={this.state.duration}
                                            trackColor={'gray'}
                                            bufferedValue={
                                                this.state.playable_duration
                                            }
                                            bufferedTrackColor="#333"
                                            scrubbedColor={'gray'}
                                        />
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            margin: 10,
                                            flexDirection: 'row',
                                        }}
                                    ></View>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {RenderIf(
                                            this.state.show_childlock ==
                                            false &&
                                            this.state.showcontrols == true,
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
                                        {RenderIf(this.state.button_screensize)(
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.83)',
                                                    borderLeftWidth: 2,
                                                    borderLeftColor:
                                                        GLOBAL.Button_Color,
                                                    bottom: GLOBAL.Device_IsPhone
                                                        ? 60
                                                        : 140,
                                                    right: 0,
                                                    padding:
                                                        GLOBAL.Device_IsPhone
                                                            ? 20
                                                            : 5,
                                                }}
                                            >
                                                <View>
                                                    <ButtonNormal
                                                        Left={true}
                                                        Disabled={
                                                            this.state
                                                                .button_screensize ==
                                                                true
                                                                ? false
                                                                : true
                                                        }
                                                        Padding={0}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this._onPressSetScreenSize(
                                                                'none',
                                                            )
                                                        }
                                                        Text={LANG.getTranslation(
                                                            'none',
                                                        )}
                                                        Icon={this.getStatusScreen(
                                                            'none',
                                                        )}
                                                    />
                                                    <ButtonNormal
                                                        Left={true}
                                                        Disabled={
                                                            this.state
                                                                .button_screensize ==
                                                                true
                                                                ? false
                                                                : true
                                                        }
                                                        Padding={0}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this._onPressSetScreenSize(
                                                                'contain',
                                                            )
                                                        }
                                                        Text={LANG.getTranslation(
                                                            'contain',
                                                        )}
                                                        Icon={this.getStatusScreen(
                                                            'contain',
                                                        )}
                                                    />
                                                    <ButtonNormal
                                                        Left={true}
                                                        Disabled={
                                                            this.state
                                                                .button_screensize ==
                                                                true
                                                                ? false
                                                                : true
                                                        }
                                                        Padding={0}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this._onPressSetScreenSize(
                                                                'cover',
                                                            )
                                                        }
                                                        Text={LANG.getTranslation(
                                                            'cover',
                                                        )}
                                                        Icon={this.getStatusScreen(
                                                            'cover',
                                                        )}
                                                    />
                                                    <ButtonNormal
                                                        Left={true}
                                                        Disabled={
                                                            this.state
                                                                .button_screensize ==
                                                                true
                                                                ? false
                                                                : true
                                                        }
                                                        Padding={0}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this._onPressSetScreenSize(
                                                                'stretch',
                                                            )
                                                        }
                                                        Text={LANG.getTranslation(
                                                            'stretch',
                                                        )}
                                                        Icon={this.getStatusScreen(
                                                            'stretch',
                                                        )}
                                                    />
                                                    <ButtonNormal
                                                        Left={true}
                                                        Disabled={
                                                            this.state
                                                                .button_screensize ==
                                                                true
                                                                ? false
                                                                : true
                                                        }
                                                        Padding={0}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this._closePopups()
                                                        }
                                                        Text={LANG.getTranslation(
                                                            'close',
                                                        )}
                                                    />
                                                </View>
                                            </View>,
                                        )}
                                        {RenderIf(this.state.button_audio)(
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.83)',
                                                    borderLeftWidth: 2,
                                                    borderLeftColor:
                                                        GLOBAL.Button_Color,
                                                    bottom: GLOBAL.Button_Color,
                                                    bottom: GLOBAL.Device_IsFireTV
                                                        ? 60
                                                        : 80,
                                                    right: 0,
                                                    padding: 20,
                                                }}
                                            >
                                                <FlatList
                                                    data={
                                                        this.state.audio_tracks
                                                    }
                                                    horizontal={false}
                                                    keyExtractor={item =>
                                                        'audio_' + item.index
                                                    }
                                                    renderItem={({
                                                        item,
                                                        index,
                                                    }) => (
                                                        <ButtonNormal
                                                            Left={true}
                                                            Disabled={
                                                                this.state
                                                                    .button_audio ==
                                                                    true
                                                                    ? false
                                                                    : true
                                                            }
                                                            Padding={0}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
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
                                                <ButtonNormal
                                                    Left={true}
                                                    Padding={0}
                                                    Disabled={
                                                        this.state
                                                            .button_audio ==
                                                            true
                                                            ? false
                                                            : true
                                                    }
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this._closePopups()
                                                    }
                                                    Text={LANG.getTranslation(
                                                        'close',
                                                    )}
                                                />
                                            </View>,
                                        )}
                                        {RenderIf(this.state.button_subtitles)(
                                            <View
                                                style={{
                                                    position: 'absolute',
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.83)',
                                                    borderLeftWidth: 2,
                                                    borderLeftColor:
                                                        GLOBAL.Button_Color,
                                                    bottom: GLOBAL.Button_Color,
                                                    bottom: GLOBAL.Device_IsFireTV
                                                        ? 60
                                                        : 80,
                                                    right: 0,
                                                    padding: 20,
                                                }}
                                            >
                                                <FlatList
                                                    ref={list =>
                                                        (this.textTracks = list)
                                                    }
                                                    data={
                                                        this.state.text_tracks
                                                    }
                                                    horizontal={false}
                                                    keyExtractor={item =>
                                                        'sub_' + item.index
                                                    }
                                                    renderItem={({
                                                        item,
                                                        index,
                                                    }) => (
                                                        <ButtonNormal
                                                            Left={true}
                                                            Disabled={
                                                                this.state
                                                                    .button_subtitles ==
                                                                    true
                                                                    ? false
                                                                    : true
                                                            }
                                                            Padding={0}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
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
                                                <ButtonNormal
                                                    Left={true}
                                                    Disabled={
                                                        this.state
                                                            .button_subtitles ==
                                                            true
                                                            ? false
                                                            : true
                                                    }
                                                    Padding={0}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this._closePopups()
                                                    }
                                                    Text={LANG.getTranslation(
                                                        'close',
                                                    )}
                                                />
                                            </View>,
                                        )}
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
                                                    })
                                                }
                                            ></ButtonCircle>,
                                        )}
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
