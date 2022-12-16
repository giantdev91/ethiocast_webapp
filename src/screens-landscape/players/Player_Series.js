import React, { PureComponent } from 'react';
import {
    TouchableHighlight,
    TouchableWithoutFeedback,
    TVEventHandler,
    useTVEventHandler,
    TouchableOpacity,
    BackHandler,
    TVMenuControl,
    View,
    Image,
    Text,
    Dimensions,
    AppState,
    ImageBackground,
    Animated,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import Video from 'react-native-video/dom/Video';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import KeepAwake from 'react-native-keep-awake';
import Orientation from 'react-native-orientation';
import TextTicker from 'react-native-text-ticker';
import { sendPageReport, sendSeriesReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Player_Series extends PureComponent {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this._texttrack;

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

        var episode_name = '';
        if (GLOBAL.Season.episodes[GLOBAL.Episode_Index] != undefined) {
            episode_name =
                GLOBAL.Season.episodes[GLOBAL.Episode_Index].name + ' ';
            if (GLOBAL.Season.episodes[GLOBAL.Episode_Index].season_number) {
                episode_name +=
                    'Season ' +
                    GLOBAL.Season.episodes[GLOBAL.Episode_Index].season_number;
            }
            if (GLOBAL.Season.episodes[GLOBAL.Episode_Index].episode_number) {
                episode_name +=
                    ' Episode ' +
                    GLOBAL.Season.episodes[GLOBAL.Episode_Index].episode_number;
            }
        }

        this.state = {
            reportStartTime: moment().unix(),
            fullScreen: false,
            play_next_episode: false,
            askbinge: false,
            episode_name: episode_name,
            show_gesture: gesture,
            season_index: GLOBAL.Season_Index,
            epsiode_index: Number(GLOBAL.Episode_Index),
            episode_index_next: Number(GLOBAL.Episode_Index) + 1,
            episode_index_previos: Number(GLOBAL.Episode_Index) - 1,
            season: GLOBAL.Season,
            episode: GLOBAL.Season.episodes[GLOBAL.Episode_Index],
            episodes: GLOBAL.Season.episodes,
            is_trailer: GLOBAL.Is_Trailer,
            fromPage: this.props.fromPage,
            askresume: this.props.askResume,
            askresumetimehuman: moment('2015-01-01')
                .startOf('day')
                .seconds(this.props.askResumeTime)
                .format('HH:mm:ss'),
            askresumetime: this.props.askResumeTime,
            time_left_unix: '',
            time_left_human: '',
            visible: false,
            myText: "I'm ready to get swiped!",
            gestureName: 'none',
            backgroundColor: '#fff',
            keys: '',
            rate: 1,
            volume: 1,
            lock: '',
            type_: '',
            muted: false,
            vast: '',
            resizeMode: GLOBAL.Screen_Size,
            paused: false,
            stream:
                GLOBAL.Device_IsAppleTV == true ||
                    GLOBAL.Device_Type == '_AppleHandheld' ||
                    GLOBAL.Device_Type == '_Ipad'
                    ? ''
                    : stream,
            type: type,
            drmKey: '',
            show_bar: false,
            show_popup: false,
            show_buttons: false,
            text_tracks: [],
            audio_tracks: [],
            buffering: true,
            duration: 0.0,
            hasresumed: false,
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
            Small: false,
            button_bar: false,
            button_casting: false,
            time: moment().format('HH:mm'),
            overlay_url: '',
            overlay_time: 0,
            ticker_text: '',
            ticker_time: 0,
            preroll_url: '',
            preroll_time: 0,
            show_ticker: false,
            show_overlay: false,
            show_preroll: false,
            show_pause: false,
            show_rew: false,
            show_ff: false,
            ads: [],
            show_childlock: false,
            errortext: '',
            remaining: 0,
            current_time_human: '00:00:00',
            total_time_human: '00:00:00',
            seek: 0,
            seektime: 0,
            progressseek: 0,
            childlock: '',
            casting_in_progress: false,
            keyboardType:
                GLOBAL.Device_Type == '_FireTV' ? 'phone-pad' : 'number-pad',
            show_keyboard: GLOBAL.Device_IsSTB == true ? false : true,
            is_ad: false,
            focusbutton: false,
            player_type: '',
            scrubberValue: 0,
            controls: true,
            playstatus: "pause",
            favorite:
                GLOBAL.Favorite_Series.find(m => m.id == GLOBAL.Season.id) !=
                    undefined
                    ? true
                    : false,
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
            progress: 0,
            seek_time: 0,
            seek_focus: false,
            controls: false,
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
    }
    onSwipeLeft(gestureState) {
        if (
            GLOBAL.Device_IsPhone ||
            GLOBAL.Device_IsTablet ||
            this.state.show_childlock == true
        ) {
            return;
        }
        if (this.state.show_buttons == true || this.state.controls) {
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
        if (this.state.show_buttons == true || this.state.controls) {
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
        }
        if (event.keyCode == 38 || event.keyCode == 40) {
            //up and down
            this.fadeIn();
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
                    button_casting: false,
                    button_screensize: false,
                    button_settings: false,
                    button_sharing: false,
                    button_support: false,
                    button_subtitles: false,
                    button_thanks: false,
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
            this.setState({ stream: GLOBAL.VIDEO_TEST_URL });
        }
        if (
            nextAppState == 'background' &&
            GLOBAL.UserInterface.app_state_change.restart_app == true &&
            GLOBAL.Casting == false
        ) {
            this.fadeBackOut();
            this.setState({ stream: GLOBAL.VIDEO_TEST_URL }, () => {
                UTILS.closeAppAndLogout();
            });
        }
        if (
            nextAppState == 'active' &&
            GLOBAL.UserInterface.app_state_change.restart_stream == true &&
            GLOBAL.Casting == false
        ) {
            this.fadeIn();
            this.playEpisode();
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
        REPORT.set({
            type: 13,
            name: GLOBAL.Series.name,
            id: GLOBAL.Series.id,
            tags: GLOBAL.Season.tags.join(','),
        });
        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToLandscape();
        }
        this.playEpisode();
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (this.state.show_childlock == true) {
                    return;
                }
                //fade the player or keep is showing
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
                if (keyEvent.keyCode == 82) {
                    if (
                        this.state.is_ad != true &&
                        this.state.current_time != 0
                    ) {
                        UTILS.storeProfile(
                            'series_progress',
                            GLOBAL.Season.id,
                            this.props.episode_index,
                            this.state.duration,
                            this.state.current_time,
                            this.props.series,
                            GLOBAL.ImageUrlCMS + this.state.season.poster,
                            this.state.season.name,
                        );
                        // UTILS.storeProfile('series_watching',0 ,0, 0, 0, {season: GLOBAL.Season, episode: this.state.episode, index: GLOBAL.Episode_Index, duration: this.state.duration, current: this.state.current_time},0,0)
                    }
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
                    return;
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
                } else if (this.state.show_buttons == true) {
                    this.setState({
                        show_buttons: false,
                        button_bar: false,
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
    getBack(target) {
        if (this.state.is_ad != true && this.state.current_time != 0) {
            UTILS.storeProfile(
                'series_progress',
                GLOBAL.Season.id,
                this.props.episode_index,
                this.state.duration,
                this.state.current_time,
                this.props.series,
                GLOBAL.ImageUrlCMS + this.state.season.poster,
                this.state.season.name,
            );
        }
        if (target == 'Home') {
            GLOBAL.Focus = 'Home';
            Actions.Home();
        } else {
            Actions.Series_Details({
                fromPage: this.props.fromPage,
                fromPlayer: true,
                stores: this.props.stores,
                SeasonIndex: this.props.SeasonIndex,
                sub_store: this.props.sub_store,
                Season: this.props.season,
                season_id: GLOBAL.Season.id,
            });
        }
    }
    _disableTVEventHandler() {
        if (this._tvEventHandler) {
            this._tvEventHandler.disable();
            delete this._tvEventHandler;
        }
    }
    componentWillUnmount() {
        sendSeriesReport(
            GLOBAL.Series.name,
            GLOBAL.Series.vod_id,
            GLOBAL.Season.name,
            GLOBAL.Season.id,
            this.state.episode.name,
            this.state.episode.id,
            GLOBAL.Season.poster,
            this.state.episode.image,
            this.state.reportStartTime,
            moment().unix(),
        );
        sendPageReport(
            'Player Series',
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

        TimerMixin.clearTimeout(this.zapTimer);
        TimerMixin.clearTimeout(this.adsTimer);
        TimerMixin.clearTimeout(this.resumeTimer);
        TimerMixin.clearTimeout(this.seekTimer);
        TimerMixin.clearTimeout(this.seekTimer_);
        TimerMixin.clearTimeout(this.countDownTimer);
        TimerMixin.clearTimeout(this.fadeOutTimer);
        TimerMixin.clearInterval(this.flow);

        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            this._disableTVEventHandler();
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }

        if (
            GLOBAL.Device_IsPhone == true &&
            this.state.play_next_episode == false
        ) {
            Orientation.lockToPortrait();
        }
        if (GLOBAL.Device_IsAppleTV == true) {
            this._disableTVEventHandler();
        }
        Actions.pop();
    }

    playEpisode() {
        if (this.state.season.childLock == 1) {
            this.setState({
                show_childlock: true,
                childlock: '',
            });
            this.fadeIn();
            this.focusChildlock();
        } else {
            if (GLOBAL.Ads_Enabled == true) {
                if (this.state.season.has_preroll == 1) {
                    this.setState({
                        is_ad: true,
                    });
                    this.getStreamAdsSeries();
                } else {
                    this.fadeIn();
                    this.refreshIpAddress();
                    if (
                        this.state.season.has_overlaybanner == 1 ||
                        this.state.season.has_ticker == 1
                    ) {
                        TimerMixin.clearTimeout(this.zapTimer);
                        this.zapTimer = TimerMixin.setTimeout(() => {
                            this.getStreamAdsSeries();
                        }, 5000);
                    }
                }
            } else {
                this.fadeIn();
                this.refreshIpAddress();
            }
        }
    }

    getStreamAdsSeries() {
        var path =
            GLOBAL.Settings_Gui.style.web_api_location +
            '/advertisement/getStreamAdvertisement?contentName=' +
            encodeURI(this.state.season.name) +
            '&contentType=serie&contentId=' +
            this.state.season.id +
            '&userId=' +
            GLOBAL.UserID +
            '&resellerId=' +
            GLOBAL.ResellerID +
            '&deviceModel=' +
            GLOBAL.Device_Model +
            '&cmsService=' +
            GLOBAL.CMS +
            '&crmService=' +
            GLOBAL.CRM +
            '&city=' +
            encodeURI(GLOBAL.City) +
            '&state=' +
            encodeURI(GLOBAL.State) +
            '&country=' +
            encodeURI(GLOBAL.Country) +
            '';
        DAL.getAdvertisement(path)
            .then(ads => {
                if (ads.preroll == undefined) {
                    this.fadeIn();
                    this.refreshIpAddress();
                    return;
                } else if (ads.preroll.length == 0) {
                    this.fadeIn();
                    this.refreshIpAddress();
                    return;
                } else if (
                    this.state.season.has_preroll == 1 &&
                    ads.preroll[0].url != null
                ) {
                    // REPORT.set({
                    //     type: 26,
                    //     duration: ads.preroll[0].showtime,
                    //     key: 'preroll'
                    // });
                    this.setState({
                        stream: ads.preroll[0].url,
                        type: 'video/mp4',
                        player_type: 'exo',
                        drmKey: '',
                        show_preroll: true,
                        remaining: ads.preroll[0].showtime,
                    });
                    this.showCountDown(ads.preroll[0].showtime);
                    this.adsTimer = TimerMixin.setTimeout(() => {
                        this.setState({
                            show_preroll: false,
                        });
                        this.fadeIn();
                        this.refreshIpAddress();
                        if (ads.overlay[0].url != null) {
                            this.setState({
                                show_overlay: true,
                                overlay_url:
                                    GLOBAL.ImageUrlCMS + ads.overlay[0].url,
                            });
                            // REPORT.set({
                            //     type: 27,
                            //     duration: ads.overlay[0].showtime,
                            //     key: 'overlay'
                            // });
                        }
                        this.adsTimer = TimerMixin.setTimeout(() => {
                            this.setState({
                                show_overlay: false,
                                overlay_url: '',
                            });
                            if (ads.ticker[0].text != null) {
                                this.setState({
                                    show_ticker: true,
                                    ticker_time: ads.ticker[0].showtime * 1000,
                                    ticker_text:
                                        ads.ticker[0].text +
                                        ' ' +
                                        ads.ticker[0].text,
                                });
                                // REPORT.set({
                                //     type: 28,
                                //     duration: ads.ticker[0].showtime,
                                //     key: 'ticker'
                                // });
                            }
                            this.adsTimer = TimerMixin.setTimeout(() => {
                                this.setState({
                                    show_ticker: false,
                                    ticker_text: '',
                                });
                            }, ads.ticker[0].showtime * 1000);
                        }, ads.overlay[0].showtime * 1000);
                    }, ads.preroll[0].showtime * 1000);
                } else {
                    // this.fadeIn();
                    // this.refreshIpAddress();
                    this.adsTimer = TimerMixin.setTimeout(() => {
                        if (ads.overlay[0].url != null) {
                            this.setState({
                                show_overlay: true,
                                overlay_url:
                                    GLOBAL.ImageUrlCMS + ads.overlay[0].url,
                            });
                            // REPORT.set({
                            //     type: 27,
                            //     duration: ads.overlay[0].showtime,
                            //     key: 'overlay'
                            // });
                        }
                        this.adsTimer = TimerMixin.setTimeout(() => {
                            this.setState({
                                show_overlay: false,
                                overlay_url: '',
                            });
                            if (ads.ticker[0].text != null) {
                                this.setState({
                                    show_ticker: true,
                                    ticker_time: ads.ticker[0].showtime * 1000,
                                    ticker_text:
                                        ads.ticker[0].text +
                                        ' ' +
                                        ads.ticker[0].text,
                                });
                                // REPORT.set({
                                //     type: 28,
                                //     duration: ads.ticker[0].showtime,
                                //     key: 'ticker'
                                // });
                            }
                            this.adsTimer = TimerMixin.setTimeout(() => {
                                this.setState({
                                    show_ticker: false,
                                    ticker_text: '',
                                });
                            }, ads.ticker[0].showtime * 1000);
                        }, ads.overlay[0].showtime * 1000);
                    }, 5000);
                }
            })
            .catch(error => {
                this.fadeIn();
                this.refreshIpAddress();
            });
    }
    refreshIpAddress() {
        if (this.state.episode == undefined) {
            this.getBack();
        }
        try {
            if (this.state.episode.streams.length == 0) {
                this.getBack();
            }
            if (
                this.state.episode.streams[0].secure_stream == false &&
                this.state.episode.streams[0].drm_stream == false &&
                this.state.episode.streams[0].drm_stream == false &&
                this.state.episode.streams[0].akamai_token == false &&
                this.state.episode.streams[0].flussonic_token == false
            ) {
                this.getCurrentStream();
            } else {
                DAL.getJson(
                    GLOBAL.HTTPvsHTTPS +
                    'cloudtv.akamaized.net/ip.php?_=' +
                    moment().unix(),
                )
                    .then(data => {
                        if (data != undefined) {
                            GLOBAL.Device_IpAddress = data.ip;
                            this.getCurrentStream();
                        } else {
                            this.getCurrentStream();
                        }
                    })
                    .catch(error => {
                        this.getCurrentStream();
                    });
            }
        } catch (e) {
            this.getBack();
        }
    }
    getStreamCorrectLanguage(streams) {
        if (streams.length == 0) {
            return GLOBAL.NOTHING_COM_URL;
        } else if (streams.length == 1) {
            return streams[0].url.toString().replace(' ', '');
        } else {
            var stream = streams.find(s => s.language == GLOBAL.Language);
            if (stream != undefined) {
                return stream.url.toString().replace(' ', '');
            } else {
                return streams[0].url.toString().replace(' ', '');
            }
        }
    }
    getCurrentStream() {
        if (this.state.episode.streams == undefined) {
            return;
        }
        if (this.state.episode.streams[0] == undefined) {
            return;
        }
        var url = this.getStreamCorrectLanguage(this.state.episode.streams);

        if (url == '') {
            return;
        }
        var player_type = 'exo';

        //url = "https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8";
        var type = 'mp4';
        var type_ = 'video/mp4';
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

        if (
            GLOBAL.Device_IsAppleTV ||
            GLOBAL.Device_IsWebTV ||
            GLOBAL.Device_IsSmartTV ||
            Platform.OS == 'ios'
        ) {
            player_type = 'exo';
        }
        var drmKey = '';
        var vast = GLOBAL.Season.vast != null ? GLOBAL.Season.vast : 'https://';

        if (
            this.state.episode.streams[0].secure_stream == true &&
            this.state.episode.streams[0].drm_stream != true
        ) {
            url = TOKEN.getAkamaiTokenLegacy(url);
        } else if (this.state.episode.streams[0].drm_stream == true) {
            player_type = 'exo';
            const drm = TOKEN.getWidevineDRM(url, this.state.channel);
            url = drm.url;
            drmKey = drm.drmKey;
        } else if (this.state.episode.streams[0].akamai_token == true) {
            url = TOKEN.getAkamaiToken(url);
        } else if (this.state.episode.streams[0].flussonic_token == true) {
            url = TOKEN.getFlussonicToken(url);
        }
        this.setState({
            stream: url,
            type: type,
            type_: type_,
            drmKey: drmKey,
            player_type: player_type,
            seek: this.state.seek != undefined ? this.state.seek : 0,
            paused: false,
            vast: vast,
            is_ad: false,
            audio_track_index: 0,
            text_track_index: 0,
            // vast: "https://lv-uads.acuteksolutions.com/uads/fc.php?script=rmVideo&zoneid=30&format=vast3&loc="
        });

        //             playPosition: this.state.seek != undefined ? this.state.seek : 0,
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
    _onPressProblemReport(desc) {
        DAL.setProblemReportContent(
            'Serie',
            this.state.season.name,
            this.state.season.id,
            desc,
        );
        // REPORT.set({
        //     key: 'problem',
        //     type: 34,
        //     id: this.state.season.id,
        //     name: this.state.season.name + ' [Serie] ' + '[' + desc + ']'
        // });
        this.setState({
            show_popup: true,
            button_support: false,
            button_thanks: true,
        });
        // this.thankyou.fadeInUpBig(500);
    }

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
            // var percentageVideo = (data.currentTime / this.state.duration) * 100;
            var position = data.currentTime;
            var playable = data.playableDuration;
            this.setState({
                current_time: position,
                //progress: percentageVideo,
                playable_duration: playable,
                current_time_human: moment('2015-01-01')
                    .startOf('day')
                    .seconds(position)
                    .format('HH:mm:ss'),
            });
            if (
                this.props.askResume == true &&
                this.state.hasresumed == false
            ) {
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
                }, 5000);
            }
        }
    };

    onEnd = () => {
        if (this.state.is_ad == false) {
            if (this.state.current_time != 0) {
                UTILS.storeProfile(
                    'series_progress',
                    GLOBAL.Season.id,
                    this.props.episode_index,
                    this.state.duration,
                    this.state.current_time,
                    this.props.series,
                    GLOBAL.ImageUrlCMS + this.state.season.poster,
                    this.state.season.name,
                );
            }
            var test = GLOBAL.Episode_Index + 1;
            var episode = GLOBAL.Season.episodes[test];

            if (episode != undefined) {
                this.setState({
                    show_popup: true,
                    askbinge: true,
                });
                this.fadeIn();
                this.flowNextEpisode();
            } else {
                GLOBAL.Season_Selected_Index = GLOBAL.Season_Selected_Index + 1;
                GLOBAL.Season_Index = GLOBAL.Season_Selected_Index;
                GLOBAL.Episode_Index = 0;
                try {
                    if (
                        GLOBAL.Series[GLOBAL.Series_Index] != undefined &&
                        GLOBAL.Season.episodes[GLOBAL.Episode_Index] !=
                        undefined
                    ) {
                        var seasons =
                            GLOBAL.Series[GLOBAL.Series_Index].season.length;
                        if (GLOBAL.Season_Selected_Index <= seasons - 1) {
                            GLOBAL.Season =
                                GLOBAL.Series[GLOBAL.Series_Index].season[
                                GLOBAL.Season_Index
                                ];
                            GLOBAL.Season_Selected_Season =
                                GLOBAL.Series[GLOBAL.Series_Index].season;
                            var episode_name =
                                GLOBAL.Season.episodes[GLOBAL.Episode_Index]
                                    .name + ' ';
                            if (
                                GLOBAL.Season.episodes[GLOBAL.Episode_Index]
                                    .season_number
                            ) {
                                episode_name +=
                                    'Season ' +
                                    GLOBAL.Season.episodes[GLOBAL.Episode_Index]
                                        .season_number;
                            }
                            if (
                                GLOBAL.Season.episodes[GLOBAL.Episode_Index]
                                    .episode_number
                            ) {
                                episode_name +=
                                    ' Episode ' +
                                    GLOBAL.Season.episodes[GLOBAL.Episode_Index]
                                        .episode_number;
                            }
                            this.setState({
                                show_popup: true,
                                askbinge: true,
                                episode_name: episode_name,
                                season_index: GLOBAL.Season_Index,
                                epsiode_index: Number(GLOBAL.Episode_Index),
                                episode_index_next: Number(
                                    GLOBAL.Episode_Index,
                                ),
                                episode_index_previos: Number(
                                    GLOBAL.Episode_Index,
                                ),
                                season: GLOBAL.Season,
                                episode:
                                    GLOBAL.Season.episodes[
                                    GLOBAL.Episode_Index
                                    ],
                                episodes: GLOBAL.Season.episodes,
                            });
                            this.fadeIn();
                            this.flowNextEpisode();
                        }
                    } else {
                        this.getBack();
                    }
                } catch (e) {
                    this.getBack();
                }
            }
        }
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
    onBuffer = data => { };
    onLoad = data => {
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        if (this.state.is_ad == false) {
            var duration = data.duration;
            this.setState({
                text_tracks: this.getTrackTranslated(
                    GLOBAL.Device_IsWebTV ? [] : data.textTracks,
                    'subs',
                ),
                audio_tracks: this.getTrackTranslated(
                    GLOBAL.Device_IsWebTV ? [] : data.audioTracks,
                    'audio',
                ),
                buffering: false,
                total_time_human: moment('2015-01-01')
                    .startOf('day')
                    .seconds(duration)
                    .format('HH:mm:ss'),
                duration: duration,
            });
        }
    };
    onRestartEpisode() {
        this.setState({
            askresume: false,
            play_focus: true,
            resume_focus: false,
        });
        this.setSeek(0, true);
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

    showCountDown(time) {
        if (this.state.remaining == 0) {
            TimerMixin.clearTimeout(this.countDownTimer);
        }
        this.countDownTimer = TimerMixin.setInterval(() => {
            var new_ = this.state.remaining - 1;
            this.setState({
                remaining: new_,
            });
        }, 1000);
    }
    focusButton = () => {
        this.setState({
            focusbutton: true,
        });
    };

    _onPressProblemReport(desc) {
        DAL.setProblemReportContent(
            'Series',
            this.state.season.name,
            this.state.season.id,
            desc,
        );
        // REPORT.set({
        //     key: 'problem',
        //     type: 34,
        //     id: this.state.season.id,
        //     name: this.state.season.name + ' [Series] ' + '[' + desc + ']'
        // });
        this.setState({
            show_popup: false,
            button_support: false,
            button_thanks: true,
        });
        TimerMixin.clearTimeout(this.resumeTimer);
        this.resumeTimer = TimerMixin.setTimeout(() => {
            this.setState({
                button_thanks: false,
                show_popup: false,
            });
            this.fadeBackOut();
        }, 5000);
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
        var id = this.state.season.id;
        var isMovieFavorite = GLOBAL.Favorite_Series.find(function (element) {
            return element.id == id;
        });
        if (isMovieFavorite != undefined) {
            var newMovies = GLOBAL.Favorite_Series.filter(
                c => c.id != isMovieFavorite.id,
            );
            GLOBAL.Favorite_Series = newMovies;
            this.setState({
                favorite: false,
            });
            UTILS.storeProfile(
                'series_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Series,
                '',
            );
        } else {
            var series = {
                poster: this.state.season.poster,
                backdrop: this.state.season.backdrop,
                name: this.state.season.name,
                id: this.state.season.id,
            };
            GLOBAL.Favorite_Series.push(series);
            this.setState({
                favorite: true,
            });
            UTILS.storeProfile(
                'series_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Series,
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
                this.state.askbinge == false &&
                this.state.scubber_focus == false &&
                this.state.error == '' &&
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

    flowNextEpisode() {
        this.flow = TimerMixin.setInterval(() => {
            let progress = this.state.progress + 20;
            if (progress < 101) {
                this.setState({
                    progress: progress,
                });
            }
            if (progress > 100) {
                TimerMixin.clearInterval(this.flow);
                this.playNextEpisode(this.state.episode_index_next);
            }
        }, 1000);
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
    blurScrubber() {
        this.setState({
            scubber_focus: false,
            buttons_hidden: false,
        });
        this.fadeBackOut();
    }
    focusScrubber() {
        this.setState({
            scubber_focus: true,
            buttons_hidden: true,
        });
    }
    focusCode() {
        this.parentalcontrol.focus();
    }
    handleInputCode = text => {
        this.setState({
            code: text,
            error_icon: false,
        });
        if (text.length == 4) {
            if (GLOBAL.PIN + '' == text + '') {
                this.setState(
                    {
                        show_childlock: false,
                        error: '',
                        error_icon: false,
                    },
                    () => {
                        this.fadeBackOut();
                        this.refreshIpAddress();
                    },
                );
            } else {
                this.setState({
                    code: '',
                    error_icon: true,
                });
            }
        }
    };
    getEpisodeImage(episode) {
        if (episode != undefined) {
            if (episode.image == null || episode.image == '') {
                return (
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={[styles.H5, { padding: 10 }]}>
                            {episode.episode_number}. {episode.name}
                        </Text>
                        <Image
                            source={require('../../images/placeholder_episodes.jpg')}
                            style={{ width: 200, height: 100, marginBottom: 10 }}
                        ></Image>
                    </View>
                );
            } else {
                return (
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={[styles.H5, { padding: 10 }]}>
                            {episode.episode_number}. {episode.name}
                        </Text>
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + episode.image }}
                            style={{ width: 200, height: 100, marginBottom: 10 }}
                            resizeMethod={'scale'}
                            resizeMode={'contain'}
                        ></Image>
                    </View>
                );
            }
        }
    }
    getNextEpisodeImage(episode) {
        if (episode != undefined) {
            if (episode.image == null || episode.image == '') {
                return (
                    <Image
                        source={require('../../images/placeholder_episodes.jpg')}
                        style={{ width: 300, height: 150 }}
                    ></Image>
                );
            } else {
                return (
                    <View
                        style={{
                            flexDirection: 'column',
                            backgroundColor: 'rgba(0, 0, 0, 0.73)',
                        }}
                    >
                        <Text
                            style={[styles.H5, { padding: 10, marginLeft: 10 }]}
                        >
                            {episode.episode_number}. {episode.name}
                        </Text>
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + episode.image }}
                            style={{ width: 300, height: 150, marginBottom: 20 }}
                            resizeMethod={'scale'}
                            resizeMode={'contain'}
                        ></Image>
                    </View>
                );
            }
        }
    }
    playNextEpisode(index) {
        TimerMixin.clearInterval(this.flow);
        GLOBAL.Season_Selected_Episode_Index = index;
        GLOBAL.Season_Selected_Episode_Row = index;

        var isSerieStored = UTILS.getProfile(
            'series_progress',
            GLOBAL.Season.id,
            index,
        );
        var askResume = false;
        var askResumeTime = 0;
        var position = 0;
        if (isSerieStored != null) {
            var percentageVideo = isSerieStored.position / isSerieStored.total;
            position = percentageVideo * 100;
        }
        if (position < 95) {
            if (isSerieStored != null) {
                askResume = true;
                askResumeTime = isSerieStored.position;
            }
        }
        this.setState(
            {
                play_next_episode: true,
            },
            () => {
                GLOBAL.Episode_Index = index;
                Actions.Player_Series({
                    fromPage: this.props.fromPage,
                    askResume: askResume,
                    askResumeTime: askResumeTime,
                    stores: this.props.stores,
                    SeasonIndex: this.props.SeasonIndex,
                    sub_store: this.props.sub_store,
                });
            },
        );
    }
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
        let { fadeAnim } = this.state;
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
                {RenderIf(this.state.show_preroll)(
                    <View
                        ref={ref => {
                            this.overlay = ref;
                        }}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            width: 300,
                            height: 50,
                            left: 50,
                            top: 50,
                            zIndex: 1,
                            margin: 20,
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                //marginTop: 10,
                                // paddingTop: 15,
                                // paddingBottom: 15,
                                marginLeft: 30,
                                marginRight: 30,
                                borderRadius: 5,
                                borderWidth: 3,
                                borderColor: '#fff',
                                width: 200,
                                height: 40,
                                backgroundColor: 'rgba(0, 0, 0, 0.73)',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text style={styles.H5}>
                                {LANG.getTranslation('sponsered_ad')} (
                                {this.state.remaining})
                            </Text>
                        </View>
                    </View>,
                )}
                {RenderIf(this.state.show_overlay)(
                    <View
                        pointerEvents={'none'}
                        ref={ref => {
                            this.overlay = ref;
                        }}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.83)',
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            height: '100%',
                            right: 10,
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        <Markers
                            Color={'darkslateblue'}
                            Text={LANG.getTranslation('information')}
                        />
                        <ScaledImage
                            uri={this.state.overlay_url}
                            style={{
                                paddingTop: 5,
                                borderRadius: 5,
                                marginLeft: 3,
                            }}
                            height={
                                GLOBAL.Device_IsPhone
                                    ? GLOBAL.Device_Width - 50
                                    : GLOBAL.Device_Height - 50
                            }
                            resizeMethod={'resize'}
                            resizeMode={'contain'}
                        />
                    </View>,
                )}
                {RenderIf(this.state.show_ticker)(
                    <View
                        ref={ref => {
                            this.ticker = ref;
                        }}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.73)',
                            width: '100%',
                            height: 40,
                            paddingTop: 10,
                            position: 'absolute',
                            bottom: 0,
                        }}
                    >
                        <TextTicker
                            style={styles.Standard}
                            duration={this.state.ticker_time}
                            animationType={'scroll'}
                            loop={true}
                            repeatSpacer={50}
                            marqueeDelay={1000}
                        >
                            {this.state.ticker_text}
                        </TextTicker>
                        <Text style={styles.Medium}></Text>
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
                        RenderIf(this.state.controls)(
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
                        ),
                    )}
                </View>
                {RenderIf(
                    GLOBAL.Device_IsWebTV == false &&
                    GLOBAL.Device_IsAppleTV == false,
                )(<KeepAwake />)}
            </View>
        );
    }
    _controls() {
        return (
            <ImageBackground
                style={{ flex: 1, width: null, height: null }}
                imageStyle={{ resizeMode: 'cover' }}
                source={{
                    uri:
                        this.state.paused || this.state.askbinge
                            ? GLOBAL.ImageUrlCMS + this.state.season.backdrop
                            : GLOBAL.PLAY_EDUCATION_BACKGROUND_URL,
                }}
            >
                <ImageBackground
                    style={{ flex: 1, width: null, height: null }}
                    imageStyle={{ resizeMode: 'cover' }}
                    source={require('../../images/player_bg.png')}
                >
                    {RenderIf(this.state.askbinge == true)(
                        <View
                            style={{
                                position: 'absolute',
                                right: 20,
                                bottom: 20,
                                zIndex: 99999,
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <View>
                                {this.getNextEpisodeImage(
                                    this.state.episodes[
                                    this.state.episode_index_next
                                    ],
                                )}
                                <View style={{ backgroundColor: '#fff' }}>
                                    <ProgressBarAnimated
                                        width={300}
                                        height={10}
                                        radius={100}
                                        borderRadius={0}
                                        backgroundColor={GLOBAL.Button_Color}
                                        borderColor={'transparent'}
                                        borderWidth={0}
                                        value={this.state.progress}
                                    />
                                </View>
                            </View>
                        </View>,
                    )}
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
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                padding: 10,
                            }}
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
                                    {!GLOBAL.Device_IsSmartTV && (
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                justifyContent: 'flex-end',
                                            }}
                                        >
                                            <ButtonCircle
                                                Size={25}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={"medkit"}
                                                onPress={() =>
                                                    this.setState({
                                                        button_support: true,
                                                        button_audio: false,
                                                        button_settings: false,
                                                        button_subtitles: false,
                                                        button_screensize: false,
                                                        show_popup: true,
                                                    })
                                                }
                                            ></ButtonCircle>
                                            <ButtonCircle
                                                Size={25}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={
                                                    this.state.favorite == false
                                                        ? "heart-o"
                                                        : "heart"
                                                }
                                                onPress={() =>
                                                    this._onFavoriteChange()
                                                }
                                            ></ButtonCircle>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View
                                style={{
                                    flex:
                                        GLOBAL.Device_IsPhone ||
                                            GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 1.5
                                            : GLOBAL.Device_IsWebTV &&
                                                !GLOBAL.Device_IsSmartTV
                                                ? 4
                                                : GLOBAL.Device_IsAppleTV
                                                    ? 5
                                                    : GLOBAL.Device_IsSmartTV &&
                                                        GLOBAL.Device_Manufacturer !=
                                                        'Samsung Tizen'
                                                        ? 2
                                                        : 3,
                                }}
                            >
                                {RenderIf(this.state.button_support)(
                                    <View
                                        style={{
                                            position: 'absolute',
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.83)',
                                            borderLeftWidth: 2,
                                            borderLeftColor:
                                                GLOBAL.Button_Color,
                                            top: GLOBAL.Device_IsPhone
                                                ? -50
                                                : -20,
                                            right: 0,
                                            padding: GLOBAL.Device_IsPhone
                                                ? 5
                                                : 20,
                                        }}
                                    >
                                        <View>
                                            <ButtonNormal
                                                Left={true}
                                                Disabled={
                                                    this.state.button_support ==
                                                        true
                                                        ? false
                                                        : true
                                                }
                                                Padding={0}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                onPress={() =>
                                                    this._onPressProblemReport(
                                                        'No Audio',
                                                    )
                                                }
                                                Text={LANG.getTranslation(
                                                    'audio_not_working',
                                                )}
                                            />
                                            <ButtonNormal
                                                Left={true}
                                                Disabled={
                                                    this.state.button_support ==
                                                        true
                                                        ? false
                                                        : true
                                                }
                                                Padding={0}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                onPress={() =>
                                                    this._onPressProblemReport(
                                                        'No Video',
                                                    )
                                                }
                                                Text={LANG.getTranslation(
                                                    'video_not_working',
                                                )}
                                            />
                                            <ButtonNormal
                                                Left={true}
                                                Disabled={
                                                    this.state.button_support ==
                                                        true
                                                        ? false
                                                        : true
                                                }
                                                Padding={0}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                onPress={() =>
                                                    this._onPressProblemReport(
                                                        'Both',
                                                    )
                                                }
                                                Text={LANG.getTranslation(
                                                    'audio_video_not_working',
                                                )}
                                            />
                                            <ButtonNormal
                                                Left={true}
                                                Disabled={
                                                    this.state.button_support ==
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
                                            hasTVPreferredFocus={true}
                                            onPress={() =>
                                                this.onRestartEpisode()
                                            }
                                        >
                                            <View>
                                                <Text style={styles.H5}>
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenu,
                                                        ]}
                                                        // icon={SolidIcons.undo}
                                                        name="undo"
                                                    />
                                                    &nbsp;{' '}
                                                    {LANG.getTranslation(
                                                        'restart',
                                                    )}
                                                </Text>
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>,
                                )}
                                {RenderIf(
                                    this.state.paused &&
                                    GLOBAL.Device_IsPhone == true,
                                )(
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
                                                        justifyContent:
                                                            'center',
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
                                                            this.state
                                                                .error_icon
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>,
                                )}

                                {RenderIf(this.state.button_thanks == true)(
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
                                                borderColor: 'forestgreen',
                                                width: 400,
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.73)',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <View>
                                                <Text style={styles.H5}>
                                                    {LANG.getTranslation(
                                                        'thank_you_problem',
                                                    )}
                                                </Text>
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
                                                            this.state
                                                                .seek_time,
                                                        )
                                                        .format('HH:mm:ss')}
                                                </Text>
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
                            <View style={{ flex: 2 }}>
                                <View
                                    style={{
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <View
                                        style={{
                                            margin: 10,
                                            flexDirection: 'column',
                                        }}
                                    >
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == true &&
                                            this.state.askbinge == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    styles.H1,
                                                    { paddingBottom: 5 },
                                                ]}
                                            >
                                                {this.state.episode_name}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false &&
                                            this.state.askbinge == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.H1}
                                            >
                                                {this.state.season.name}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false &&
                                            this.state.askbinge == false,
                                        )(
                                            <Text
                                                numberOfLines={1}
                                                style={styles.Standard}
                                            >
                                                {this.state.episode_name}
                                            </Text>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.Device_IsPhone == false &&
                                            this.state.askbinge == false &&
                                            this.state.episode != undefined,
                                        )(
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    paddingTop: 5,
                                                }}
                                            >
                                                <Markers
                                                    Text={
                                                        this.state.season
                                                            .language
                                                    }
                                                    Color={'#333'}
                                                />
                                                <Markers
                                                    Text={
                                                        this.state.season.year
                                                    }
                                                    Color={'#333'}
                                                />
                                                {/* {RenderIf(this.state.episode.srt != '' && this.state.episode.srt != null)(
                                                    <Markers Text={'SRT'} Color={'#333'} />
                                                )} */}
                                                {RenderIf(
                                                    this.state.season
                                                        .age_rating != null &&
                                                    this.state.season
                                                        .age_rating != '',
                                                )(
                                                    <Markers
                                                        Text={
                                                            this.state.season
                                                                .age_rating
                                                        }
                                                        Color={'#333'}
                                                    />,
                                                )}
                                                <Markers
                                                    Text={
                                                        Math.round(
                                                            this.state
                                                                .duration / 60,
                                                        ) +
                                                        ' ' +
                                                        LANG.getTranslation(
                                                            'min',
                                                        )
                                                    }
                                                    Color={'#333'}
                                                />
                                            </View>,
                                        )}
                                    </View>
                                    {RenderIf(
                                        this.state.show_childlock == false &&
                                        this.state.askbinge == false,
                                    )(
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
                                                    value={
                                                        this.state.current_time
                                                    }
                                                    onSlidingComplete={
                                                        this.valueChange
                                                    }
                                                    totalDuration={
                                                        this.state.duration
                                                    }
                                                    trackColor={'gray'}
                                                    bufferedValue={
                                                        this.state
                                                            .playable_duration
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
                                                flexDirection: 'column',
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
                                                this.state.askbinge ==
                                                false,
                                            )(
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    {RenderIf(
                                                        this.state
                                                            .episode_index_previos >=
                                                        0,
                                                    )(
                                                        <ButtonCircle
                                                            Size={25}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
                                                            Icon={
                                                                "step-backward"
                                                            }
                                                            onPress={() =>
                                                                this.playNextEpisode(
                                                                    this.state
                                                                        .episode_index_previos,
                                                                )
                                                            }
                                                        ></ButtonCircle>,
                                                    )}
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
                                                        Icon={
                                                            "backward"
                                                        }
                                                        onPress={() =>
                                                            this._onPlayerRewind()
                                                        }
                                                    ></ButtonCircle>
                                                    <ButtonCircle
                                                        hasTVPreferredFocus={
                                                            this.state
                                                                .play_focus
                                                        }
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Size={40}
                                                        Icon={
                                                            this.state
                                                                .playstatus
                                                        }
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
                                                        Icon={
                                                            "forward"
                                                        }
                                                        onPress={() =>
                                                            this._onPlayerForward()
                                                        }
                                                    ></ButtonCircle>
                                                    {RenderIf(
                                                        this.state
                                                            .episode_index_next <=
                                                        this.state.episodes
                                                            .length -
                                                        1,
                                                    )(
                                                        <ButtonCircle
                                                            Size={25}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
                                                            Icon={
                                                                "step-forward"
                                                            }
                                                            onPress={() =>
                                                                this.playNextEpisode(
                                                                    this.state
                                                                        .episode_index_next,
                                                                )
                                                            }
                                                        ></ButtonCircle>,
                                                    )}
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
                                                this.state.show_childlock ==
                                                false &&
                                                this.state.askbinge ==
                                                false,
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
                                                            controls: false,
                                                        })
                                                    }
                                                ></ButtonCircle>,
                                            )}
                                            {RenderIf(
                                                this.state.audio_tracks.length >
                                                1 &&
                                                this.state.show_childlock ==
                                                false &&
                                                this.state.askbinge ==
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
                                                            controls: false,
                                                        })
                                                    }
                                                ></ButtonCircle>,
                                            )}
                                            {RenderIf(
                                                this.state.text_tracks.length >
                                                0 &&
                                                this.state.show_childlock ==
                                                false &&
                                                this.state.askbinge ==
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
                                                false &&
                                                this.state.askbinge ==
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
