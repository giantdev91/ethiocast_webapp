import React, { Component } from 'react';
import {
    BackHandler,
    TVMenuControl,
    View,
    Image,
    Text,
    Dimensions,
    AppState,
    ImageBackground,
    TouchableOpacity,
    TVEventHandler,
    useTVEventHandler,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import Video from 'react-native-video/dom/Video';
import KeepAwake from 'react-native-keep-awake';
import Orientation from 'react-native-orientation';
import TextTicker from 'react-native-text-ticker';
// import {RegularIcons, SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import {
    sendPageReport,
    sendChannelReport,
    sendCatchupTVReport,
} from '../../../reporting/reporting';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

export default class Player_Channels_V1 extends Component {
    constructor(props) {
        super(props);

        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        var stream = GLOBAL.HTTPvsHTTPS + '';
        var type = 'm3u8';
        var gesture = false;

        GLOBAL.HomePlayChannelStarted = true;

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
        if (GLOBAL.Device_IsPhone) {
            channel_list_width = GLOBAL.ROW_2;
        }
        if (GLOBAL.Channel == undefined) {
            Actions.Home();
        }

        this.state = {
            reportStartTime: moment().unix(),
            reportStartTimeZap: moment().unix(),
            fullScreen: false,
            page: this.props.page,
            show_gesture: gesture,
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
            text_tracks: [],
            audio_tracks: [],
            buffering: true,
            duration: 0.0,
            progress: 0,
            current_time: 0.0,
            audio_track_index: 0,
            vast: '',
            isConnected: true,
            text_track_index: 999,
            text_track_type: 'disabled',
            time: moment().format('HH:mm'),
            drmKey: '',
            drmSupplierType: '',
            drmLicenseServerUrl: '',
            drmCertificateUrl: '',
            seek: 0,
            type_: '',
            player_type: '',
            seeking: false,
            playable_duration: 0,
            back_focus: true,
            play_focus: true,
            scubber_focus: false,
            buttons_hidden: false,
            code: '',
            error_icon: false,
            show: false,
            scrubberValue: 0,
            playstatus: "pause",
            seek_time: 0,
            seek_focus: false,

            button_support: false,
            button_audio: false,
            button_subtitles: false,
            button_screensize: false,
            button_settings: false,
            button_replay: false,
            button_thanks: false,

            overlay_url: '',
            overlay_time: 0,
            ticker_text: '',
            ticker_time: 0,
            preroll_url: '',
            preroll_time: 0,

            show_childlock: false,
            show_popup: false,
            show_ticker: false,
            show_overlay: false,
            show_pause: false,
            show_rew: false,
            show_ff: false,
            show_numeric: false,
            show_sleepmode: false,
            show_zapper: false,
            show_buttons_controller:
                GLOBAL.Device_IsPhone ||
                    GLOBAL.Device_IsTablet ||
                    GLOBAL.Device_IsWebTV
                    ? true
                    : false,

            ads: [],
            error: '',
            favorite: false,
            playing_catchup:
                this.props.action != undefined &&
                    this.props.action == 'CatchupTV'
                    ? true
                    : false,
            scrolledepg: false,
            max_retry:
                this.props.max_retry != undefined ? this.props.max_retry : 5,
            pause_time: 0,
            program_seek: 0,
            is_ad: false,
            numeric_number: '',
            numeric_color: '#fff',
            surf_childlock_free: false,
            fromPage: this.props.fromPage,
            currentSleepTime: 0,
            channel_list_width: channel_list_width,
            scrolledmenu: false,
            scrolledsearch: false,
            error_epg: false,
            search_focus: false,
            player_type: 'Default',
            buffer_config: {
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
            },

            //watermark
            show_watermark: false,
            watermark_x: 0,
            watermark_y: 0,

            //controls
            controls: false,
            live: true,
            catchup:
                GLOBAL.Channel != undefined
                    ? false
                    : GLOBAL.Channel.is_flussonic == 1 ||
                        GLOBAL.Channel.is_dveo == 1
                        ? true
                        : false,
            quadview: false,
            channellist: false,
            miniepg: true,
            tochable: true,

            //channels
            selected_channels_list: GLOBAL.Channels_Selected,
            selected_channels: GLOBAL.Channels_Selected, //all the channels in the category
            selected_channel: GLOBAL.Channel, //new
            selected_channel_index: UTILS.getChannelIndex(
                GLOBAL.Channel.channel_id,
            ),
            previous_channel_id: GLOBAL.Channel.channel_id,

            //catchup
            selected_epg_catchup: GLOBAL.Catchup_Selected,
            selected_epg_index_catchup: GLOBAL.Catchup_Selected_Index,
            selected_epg_program_catchup: GLOBAL.Catchup_Selected_Program,
            selected_epg_catchup_day_index: GLOBAL.EPG_Days,

            //epg
            selected_epg: UTILS.getCurrentEpg(GLOBAL.Channel.channel_id),
            selected_epg_index: UTILS.getCurrentProgramIndex(
                GLOBAL.Channel.channel_id,
            ),
            selected_epg_program: UTILS.getCurrentProgram(
                GLOBAL.Channel.channel_id,
            ),

            //scrubber
            selected_epg_scrubber: UTILS.getCurrentEpg(
                GLOBAL.Channel.channel_id,
            ),
            selected_epg_index_scrubber: UTILS.getCurrentProgramIndex(
                GLOBAL.Channel.channel_id,
            ),
            selected_channel_index_scrubber: UTILS.getChannelIndex(
                GLOBAL.Channel.channel_id,
            ),
            selected_epg_index_scrubber_base: 0,
            selected_channel_scrubber: GLOBAL.Channel,

            //zapper
            selected_zapper_index: UTILS.getChannelIndex(
                GLOBAL.Channel.channel_id,
            ),
            selected_channel_zapper: GLOBAL.Channel,
            selected_zapper_updown: 0,

            //channellist
            show_catchup_menu: false,
            show_category_menu: false,
            show_channel_menu: false,
            show_channel_search: false,
            show_channels: false,
            channel_list_epg: [],
            selected_channel_list_single: GLOBAL.Channel,
            categories: GLOBAL.Channels,
            channels_search: [],

            //quadplay
            quadviewbuttons: false,
            quadmute1: true,
            quadmute2: true,
            quadmute3: true,
            quadmute4: true,
            quadstream1: 'https://',
            quadstream2: 'https://',
            quadstream3: 'https://',
            quadstream4: 'https://',
            quaddrmKey1: '',
            quaddrmKey2: '',
            quaddrmKey3: '',
            quaddrmKey4: '',
            quadtype1: 'm3u8',
            quadtype2: 'm3u8',
            quadtype3: 'm3u8',
            quadtype4: 'm3u8',
            selected_channel_quad1: GLOBAL.Channel,
            selected_channel_quad2: GLOBAL.Channel,
            selected_channel_quad3: GLOBAL.Channel,
            selected_channel_quad4: GLOBAL.Channel,
            selected_channel_index_quad1: UTILS.getChannelIndex(
                GLOBAL.Channel.channel_id,
            ),
            selected_channel_index_quad2: UTILS.getChannelIndex(
                GLOBAL.Channel.channel_id,
            ),
            selected_channel_index_quad3: UTILS.getChannelIndex(
                GLOBAL.Channel.channel_id,
            ),
            selected_channel_index_quad4: UTILS.getChannelIndex(
                GLOBAL.Channel.channel_id,
            ),

            //record
            button_record_fail: false,
            button_record_requested: false,
            button_record: false,
            current_program: [],
        };
        //this.onPressSelectedChannel = this.onPressSelectedChannel.bind(this);
        this._startCatchupFromChannelMenu =
            this._startCatchupFromChannelMenu.bind(this);
        this.startChannelById = this.startChannelById.bind(this);
        this.recordProgram = this.recordProgram.bind(this);

        this.onSwipeDown = this.onSwipeDown.bind(this);
        this.onSwipeLeft = this.onSwipeLeft.bind(this);
        this.onSwipeRight = this.onSwipeRight.bind(this);
        this.onSwipeUp = this.onSwipeUp.bind(this);
    }
    _tapUp() {
        if (this.state.show_sleepmode) {
            this.startSleepModeTimer();
            return;
        }
        if (
            this.state.miniepg == false &&
            this.state.show_popup == false &&
            this.state.quadview == false &&
            this.state.show_buttons_controller == false &&
            this.state.show_childlock == false
        ) {
            this.setState({
                controls: true,
                show: true,
                back_focus: this.state.back_focus == false ? true : false,
                play_focus: this.state.play_focus == true ? false : true,
                miniepg: false,
                show_buttons_controller: true,
            });
        }
    }
    _tapDown() {
        if (this.state.show_sleepmode) {
            this.startSleepModeTimer();
            return;
        }
        if (
            this.state.miniepg == false &&
            this.state.show_popup == false &&
            this.state.quadview == false &&
            this.state.show_buttons_controller == false &&
            this.state.show_childlock == false
        ) {
            this.setState({
                miniepg: true,
                controls: true,
                show: true,
            });
        }
    }
    _swipeLeft() {
        if (this.state.show_sleepmode) {
            this.startSleepModeTimer();
            return;
        }
        if (
            this.state.miniepg == false &&
            this.state.show_popup == false &&
            this.state.quadview == false &&
            this.state.show_buttons_controller == false &&
            this.state.show_childlock == false
        ) {
            this.onSwipeLeft();
        }
    }
    _swipeRight() {
        if (this.state.show_sleepmode) {
            this.startSleepModeTimer();
            return;
        }
        if (
            this.state.miniepg == false &&
            this.state.show_popup == false &&
            this.state.quadview == false &&
            this.state.show_buttons_controller == false &&
            this.state.show_childlock == false
        ) {
            this.onSwipeRight();
        }
    }
    _swipe() {
        if (this.state.show_sleepmode) {
            this.startSleepModeTimer();
            return;
        }

        if (this.state.show_channel_search == true) {
            return;
        }
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
    onSwipeUp(gestureState) { }
    onSwipeDown(gestureState) { }
    onSwipeLeft(gestureState) {
        this.startChannel(1);
    }
    onSwipeRight(gestureState) {
        this.startChannel(-1);
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        this.fadeBackOut();

        if (this.state.show_sleepmode) {
            this.startSleepModeTimer();
            return;
        }

        if (this.state.quadview) {
            this.closeQuad();
            return;
        }
        if (this.state.show_channel_search == true) {
            return;
        }
        if (
            event.keyCode == 37 ||
            event.keyCode == 167 ||
            event.keyCode == 34 ||
            event.keyCode == 49
        ) {
            //channel down
            if (
                this.state.show_buttons_controller == false &&
                this.state.show_childlock == false
            ) {
                this.zapChannel(-1);
            }
        }
        if (
            event.keyCode == 39 ||
            event.keyCode == 166 ||
            event.keyCode == 33 ||
            event.keyCode == 48
        ) {
            //channel up
            if (
                this.state.show_buttons_controller == false &&
                this.state.show_childlock == false
            ) {
                this.zapChannel(1);
            }
        }
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
            if (this.state.playing_catchup == true) {
                this.fadeIn();
                this.setSeek(60);
            }
        }
        if (event.keyCode == 412) {
            //rew
            if (this.state.playing_catchup == true) {
                this.fadeIn();
                this.setSeek(-60);
            }
        }

        if (event.keyCode == 38) {
            if (
                this.state.miniepg == false &&
                this.state.show_popup == false &&
                this.state.quadview == false &&
                this.state.show_buttons_controller == false
            ) {
                this.setState({
                    controls: true,
                    show: true,
                    back_focus: this.state.back_focus == false ? true : false,
                    play_focus: true,
                    miniepg: false,
                    show_buttons_controller: true,
                });
            }
        }
        if (event.keyCode == 40) {
            if (
                this.state.show_popup == false &&
                this.state.quadview == false &&
                this.state.show_buttons_controller == false
            ) {
                this.setState({
                    miniepg: true,
                    controls: true,
                    show: true,
                });
            }
        }

        if (
            event.keyCode == 10009 ||
            event.keyCode == 1003 ||
            event.keyCode == 461 ||
            event.keyCode == 8
        ) {
            if (this.state.show_popup == true) {
                this.setState({
                    show: false,
                    controls: false,
                    show_popup: false,
                    button_audio: false,
                    button_screensize: false,
                    button_settings: false,
                    button_support: false,
                    button_subtitles: false,
                    button_thanks: false,
                    show_buttons_controller: false,
                    back_focus: this.state.back_focus == false ? true : false,
                    play_focus: this.state.play_focus == true ? false : true,
                    channellist: false,
                    show_channel_menu: false,
                    show_channel_search: false,
                    show_category_menu: false,
                });
            } else {
                this.getBack();
            }
        }
        if (
            event.keyCode >= 49 &&
            event.keyCode <= 57 &&
            this.state.show_childlock == false
        ) {
            var newNumber =
                this.state.numeric_number + '' + (event.keyCode - 48);
            this.setState({
                numeric_number: newNumber,
                show_numeric: true,
                numeric_color: '#fff',
            });

            TimerMixin.clearTimeout(this.numericTimer);
            TimerMixin.clearTimeout(this.numericTimer2);
            this.numericTimer = TimerMixin.setTimeout(() => {
                var channelNumber = this.state.numeric_number;
                var channel = this.state.selected_channels.find(
                    x => x.channel_number == channelNumber,
                );
                if (channel != undefined) {
                    this.startChannelById(channel.channel_id);
                    this.setState({
                        numeric_color: 'forestgreen',
                    });
                    TimerMixin.clearTimeout(this.numericTimer2);
                    this.numericTimer2 = TimerMixin.setTimeout(() => {
                        this.setState({
                            numeric_number: '',
                            show_numeric: false,
                            numeric_color: '#fff',
                        });
                    }, 1500);
                } else {
                    this.setState({
                        numeric_color: 'crimson',
                    });
                    TimerMixin.clearTimeout(this.numericTimer2);
                    this.numericTimer2 = TimerMixin.setTimeout(() => {
                        this.setState({
                            numeric_number: '',
                            show_numeric: false,
                            numeric_color: '#fff',
                        });
                    }, 1500);
                }
            }, 2000);
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
            this.startChannel(0);
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
    showWaterMark() {
        var y = Math.floor(Math.random() * GLOBAL.Device_Width);
        var x = Math.floor(Math.random() * GLOBAL.Device_Height);
        this.setState({
            show_watermark: true,
            watermark_x: x,
            watermark_y: y,
        });
        TimerMixin.clearTimeout(this.show_watermark_timer);
        this.show_watermark_timer = TimerMixin.setTimeout(() => {
            this.setState({
                show_watermark: false,
            });
            TimerMixin.clearTimeout(this.show_watermark_timer);
            this.startWaterMarkTimer();
        }, 5000);
    }
    startWaterMarkTimer() {
        TimerMixin.clearTimeout(this.start_watermark_timer);
        this.start_watermark_timer = TimerMixin.setTimeout(() => {
            TimerMixin.clearTimeout(this.start_watermark_timer);
            this.showWaterMark();
        }, 300000);
    }
    _enableTVEventHandler() {
        this._tvEventHandler = new TVEventHandler();
        this._tvEventHandler.enable(this, function (cmp, evt) {
            if (
                evt &&
                (evt.eventType === 'right' || evt.eventType == 'swipeRight')
            ) {
                cmp._swipeLeft();
            }
            if (
                evt &&
                (evt.eventType === 'left' || evt.eventType == 'swipeLeft')
            ) {
                cmp._swipeRight();
            }
            if (evt && (evt.eventType === 'up' || evt.eventType == 'swipeUp')) {
                cmp._tapUp();
            }
            if (
                evt &&
                (evt.eventType === 'down' || evt.eventType == 'swipeDown')
            ) {
                cmp._tapDown();
            }
            if (evt.eventType === 'menu') {
                cmp.getBack();
            }
            if (evt && evt.eventType === 'playPause') {
                cmp._onPlayerPausePlay();
            }
            //cmp._swipe();
        });
    }
    componentDidMount() {
        if (GLOBAL.UserInterface.player.enable_watermarking == true) {
            this.startWaterMarkTimer();
        }
        if (!GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsAppleTV) {
            const unsubscribe = NetInfo.addEventListener(state => {
                if (this.state.isConnected == false) {
                    this.startChannel(0);
                }
                this.setState({
                    isConnected: state.isConnected,
                });
            });
        }
        if (GLOBAL.Device_IsWebTV == false) {
            AppState.addEventListener('change', this._handleAppStateChange);
        }
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            document.addEventListener('keydown', this.backButton, false);
            window.addEventListener('resize', this.updateDimensions);

            if (GLOBAL.Device_IsSmartTV == false) {
                window.addEventListener('online', () => {
                    if (this.state.isConnected == false) {
                        this.startChannel(0);
                    }
                    this.setState({
                        isConnected: true,
                    });
                });
                window.addEventListener('offline', () => {
                    this.setState({
                        isConnected: false,
                    });
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
                            this.setState({
                                isConnected: false,
                            });
                        } else if (
                            value ==
                            webapis.network.NetworkState.GATEWAY_CONNECTED
                        ) {
                            if (this.state.isConnected == false) {
                                this.startChannel(0);
                            }
                            this.setState({
                                isConnected: true,
                            });
                        }
                    });
                }
                if (GLOBAL.Device_Manufacturer == 'LG WebOS') {
                    window.addEventListener('online', () => {
                        if (this.state.isConnected == false) {
                            this.startChannel(0);
                        }
                        this.setState({
                            isConnected: true,
                        });
                    });
                    window.addEventListener('offline', () => {
                        this.setState({
                            isConnected: false,
                        });
                    });
                }
            }
        }
        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToLandscape();
        }
        this.startSleepModeTimer();

        //start channel or catchuptv
        if (this.props.action == 'CatchupTV') {
            this.startCatchupProgram(
                this.state.selected_epg_program_catchup,
                this.state.selected_channel,
            );
            this.fadeIn();
        } else {
            this.startChannel(0); //start channel
            this.fadeIn();
        }

        // this.getChannelQuad(0, 1);
        // this.getChannelQuad(0, 2);
        // this.getChannelQuad(0, 3);
        // this.getChannelQuad(0, 4);
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                this.fadeBackOut();
                if (this.state.show_sleepmode) {
                    this.startSleepModeTimer();
                    return;
                }
                if (this.state.show_childlock == true) {
                    return;
                }
                if (this.state.quadview == true) {
                    TimerMixin.clearTimeout(this.quadtimer);
                    if (this.state.quadviewbuttons == false) {
                        this.setState({
                            quadviewbuttons: true,
                        });
                        this.quadtimer = TimerMixin.setTimeout(() => {
                            this.setState({
                                quadviewbuttons: false,
                            });
                        }, 4000);
                    } else {
                        this.quadtimer = TimerMixin.setTimeout(() => {
                            this.setState({
                                quadviewbuttons: false,
                            });
                        }, 4000);
                    }
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
                if (keyEvent.keyCode == 90 || keyEvent.keyCode == 36) {
                    //forward
                    if (this.state.playing_catchup == true) {
                        this.fadeIn();
                        this.setSeek(60);
                    }
                }
                if (keyEvent.keyCode == 89 || keyEvent.keyCode == 37) {
                    //rewind
                    if (this.state.playing_catchup == true) {
                        this.fadeIn();
                        this.setSeek(-60);
                    }
                }
                if (keyEvent.keyCode == 126 || keyEvent.keyCode == 34) {
                    //pause
                    this._onPlayerPausePlay();
                }
                if (keyEvent.keyCode == 67) {
                    if (this.state.previous_channel_id != undefined) {
                        this.startChannelById(this.state.previous_channel_id);
                    }
                }
                if (
                    keyEvent.keyCode == 166 ||
                    keyEvent.keyCode == 92 ||
                    keyEvent.keyCode == 402 ||
                    keyEvent.keyCode == 27 ||
                    keyEvent.keyCode == 15
                ) {
                    //channel up
                    this.zapChannel(1);
                }
                if (
                    keyEvent.keyCode == 167 ||
                    keyEvent.keyCode == 93 ||
                    keyEvent.keyCode == 403 ||
                    keyEvent.keyCode == 28 ||
                    keyEvent.keyCode == 14
                ) {
                    //channel down
                    this.zapChannel(-1);
                }
                if (
                    keyEvent.keyCode == 21 &&
                    this.state.show_popup == false &&
                    this.state.miniepg == false &&
                    this.state.channellist == false
                ) {
                    //left
                    if (
                        this.state.show_buttons_controller == false &&
                        this.state.show_childlock == false
                    ) {
                        this.zapChannel(-1);
                    }
                    return;
                }
                if (
                    keyEvent.keyCode == 22 &&
                    this.state.show_popup == false &&
                    this.state.miniepg == false &&
                    this.state.channellist == false
                ) {
                    //right
                    if (
                        this.state.show_buttons_controller == false &&
                        this.state.show_childlock == false
                    ) {
                        this.zapChannel(1);
                    }
                    return;
                }
                if (keyEvent.keyCode == 19 || keyEvent.keyCode == 12) {
                    //up
                    if (
                        this.state.miniepg == false &&
                        this.state.show_popup == false &&
                        this.state.quadview == false &&
                        this.state.show_buttons_controller == false
                    ) {
                        this.setState({
                            controls: true,
                            show: true,
                            back_focus:
                                this.state.back_focus == false ? true : false,
                            play_focus: true,
                            miniepg: false,
                            show_buttons_controller: true,
                        });
                    }
                }
                if (keyEvent.keyCode == 20 || keyEvent.keyCode == 13) {
                    //down
                    if (
                        this.state.show_popup == false &&
                        this.state.quadview == false &&
                        this.state.show_buttons_controller == false
                    ) {
                        this.setState({
                            miniepg: true,
                            controls: true,
                            show: true,
                        });
                    }
                }
                if (
                    keyEvent.keyCode == 90 ||
                    keyEvent.keyCode == 415 ||
                    keyEvent.keyCode == 163 ||
                    keyEvent.keyCode == 245
                ) {
                    //forward
                    if (this.state.playing_catchup == true) {
                        this.fadeIn();
                        this.setSeek(60);
                    }
                }
                if (
                    keyEvent.keyCode == 89 ||
                    keyEvent.keyCode == 414 ||
                    keyEvent.keyCode == 165 ||
                    keyEvent.keyCode == 246
                ) {
                    //rewind
                    if (this.state.playing_catchup == true) {
                        this.fadeIn();
                        this.setSeek(-60);
                    }
                }
                if (keyEvent.keyCode == 86) {
                    //stop
                    this.getBack();
                }
                if (
                    keyEvent.keyCode == 121 ||
                    keyEvent.keyCode == 85 ||
                    keyEvent.keyCode == 164
                ) {
                    //pause
                    this._onPlayerPausePlay();
                }
                if (
                    keyEvent.keyCode >= 7 &&
                    keyEvent.keyCode <= 16 &&
                    this.state.show_childlock == false
                ) {
                    if (this.state.selected_channels == undefined) {
                        return;
                    }
                    this.fadeIn();
                    var newNumber =
                        this.state.numeric_number + '' + (keyEvent.keyCode - 7);
                    this.setState({
                        numeric_number: newNumber,
                        show_numeric: true,
                        numeric_color: '#fff',
                    });
                    TimerMixin.clearTimeout(this.numericTimer);
                    TimerMixin.clearTimeout(this.numericTimer2);
                    this.numericTimer = TimerMixin.setTimeout(() => {
                        var channelNumber = this.state.numeric_number;

                        try {
                            var channel = this.state.selected_channels.find(
                                x => x.channel_number == channelNumber,
                            );
                            if (channel != undefined) {
                                this.startChannelById(channel.channel_id);
                                this.setState({
                                    numeric_color: 'forestgreen',
                                });
                                TimerMixin.clearTimeout(this.numericTimer2);
                                this.numericTimer2 = TimerMixin.setTimeout(
                                    () => {
                                        this.setState({
                                            numeric_number: '',
                                            show_numeric: false,
                                            numeric_color: '#fff',
                                        });
                                    },
                                    1500,
                                );
                            } else {
                                this.setState({
                                    numeric_color: 'crimson',
                                });
                                TimerMixin.clearTimeout(this.numericTimer2);
                                this.numericTimer2 = TimerMixin.setTimeout(
                                    () => {
                                        this.setState({
                                            numeric_number: '',
                                            show_numeric: false,
                                            numeric_color: '#fff',
                                        });
                                    },
                                    1500,
                                );
                            }
                        } catch (e) { }
                    }, 2000);
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
                if (this.state.show_popup == true) {
                    this.setState({
                        show: false,
                        controls: false,
                        show_popup: false,
                        button_audio: false,
                        button_screensize: false,
                        button_settings: false,
                        button_support: false,
                        button_subtitles: false,
                        button_thanks: false,
                        show_childlock: false,
                        show_buttons_controller: false,
                        back_focus:
                            this.state.back_focus == false ? true : false,
                        play_focus:
                            this.state.play_focus == true ? false : true,
                        channellist: false,
                        show_channel_menu: false,
                        show_channel_search: false,
                        show_category_menu: false,
                    });
                } else {
                    this.getBack();
                }

                return true;
            },
        );
    }
    cancelAds() {
        this.setState({
            show_ticker: false,
            show_preroll: false,
            show_ticker: false,
        });
        TimerMixin.clearTimeout(this.adsTimer);
        this.adsTimer = null;
    }
    zapChannel(updown) {
        if (this.state.quadview == true) {
            return;
        }
        if (this.state.miniepg == true) {
            return;
        }
        if (
            this.state.selected_channels == undefined ||
            this.state.selected_channels == null
        ) {
            return;
        }
        this.cancelAds();
        TimerMixin.clearTimeout(this.errorTimer);
        TimerMixin.clearTimeout(this.zapTimer);
        TimerMixin.clearTimeout(this.buttonTimer);
        var newChannelIndex = this.state.selected_zapper_index + updown;
        if (newChannelIndex < 0) {
            newChannelIndex = this.state.selected_channels.length - 1;
        } else if (newChannelIndex == this.state.selected_channels.length) {
            newChannelIndex = 0;
        }
        var channel = this.state.selected_channels[newChannelIndex];
        var new_updown = this.state.selected_zapper_updown + updown;
        this.setState({
            max_retry: 5,
            show_zapper: true,
            selected_channel_zapper: channel,
            selected_zapper_index: newChannelIndex,
            selected_zapper_updown: new_updown,
            show_buttons_controller: false,
        });
        this.zapTimer = TimerMixin.setTimeout(() => {
            this.setState({
                show_zapper: false,
                selected_zapper_updown: 0,
            });
            UTILS.setPositionAndRow(this.state.selected_zapper_index);
            this.fadeIn();
            this.startChannelById(
                this.state.selected_channel_zapper.channel_id,
            );
        }, 1000);
    }
    getProgramScrubber(updown) {
        this.fadeBackOut();
        if (this.state.selected_epg_scrubber == undefined) {
            return;
        }
        var newEpgIndex = this.state.selected_epg_index_scrubber + updown;
        var newBaseIndex = this.state.selected_epg_index_scrubber_base + updown;
        if (
            newEpgIndex >= 0 &&
            newEpgIndex < this.state.selected_epg_scrubber.length - 1
        ) {
            this.setState({
                selected_epg_index_scrubber: newEpgIndex,
                selected_epg_index_scrubber_base: newBaseIndex,
            });
        }
    }
    getChannelEpgScrubber(updown) {
        this.fadeBackOut();
        var newChannelIndex =
            this.state.selected_channel_index_scrubber + updown;
        if (newChannelIndex < 0) {
            newChannelIndex = this.state.selected_channels.length - 1;
        } else if (newChannelIndex == this.state.selected_channels.length) {
            newChannelIndex = 0;
        }
        var newChannel = this.state.selected_channels[newChannelIndex];
        if (newChannel != undefined) {
            var newEpgIndex = UTILS.getCurrentProgramIndex(
                newChannel.channel_id,
            );
            var newEpg = UTILS.getCurrentEpg(newChannel.channel_id);
            this.setState({
                selected_channel_scrubber: newChannel,
                selected_epg_index_scrubber: newEpgIndex,
                selected_epg_scrubber: newEpg,
                selected_channel_index_scrubber: newChannelIndex, // aanpassen
                selected_epg_index_scrubber_base: 0,
            });
        }
    }
    getChannelImage(updown) {
        var newChannelIndex = this.state.selected_channel_index + updown;
        if (newChannelIndex < 0) {
            newChannelIndex = this.state.selected_channels.length - 1;
            return this.state.selected_channels[newChannelIndex].icon_big;
        } else if (newChannelIndex == this.state.selected_channels.length) {
            newChannelIndex = 0;
            return this.state.selected_channels[newChannelIndex].icon_big;
        }
    }
    startChannel(updown, fromCategoryMenu) {
        this.cancelAds();
        TimerMixin.clearTimeout(this.errorTimer);
        this.fadeBackOut();
        if (this.state.selected_channels == undefined) {
            return;
        }
        var newChannelIndex = this.state.selected_channel_index + updown;
        if (
            newChannelIndex < this.state.selected_channels.length &&
            newChannelIndex >= 0
        ) {
            if (fromCategoryMenu == undefined) {
                UTILS.setPositionAndRow(newChannelIndex);
            }
            this.getChannel(newChannelIndex, fromCategoryMenu);
        }
        if (newChannelIndex < 0) {
            newChannelIndex = this.state.selected_channels.length - 1;
            if (fromCategoryMenu == undefined) {
                UTILS.setPositionAndRow(newChannelIndex);
            }
            this.getChannel(newChannelIndex, fromCategoryMenu);
        }
        if (newChannelIndex == this.state.selected_channels.length) {
            newChannelIndex = 0;
            if (fromCategoryMenu == undefined) {
                UTILS.setPositionAndRow(newChannelIndex);
            }
            this.getChannel(newChannelIndex, fromCategoryMenu);
        }
    }
    getChannelQuad(updown, player) {
        if (player == 1) {
            var newChannelIndex =
                this.state.selected_channel_index_quad1 + updown;
            if (newChannelIndex < 0) {
                newChannelIndex = this.state.selected_channels.length - 1;
            } else if (newChannelIndex == this.state.selected_channels.length) {
                newChannelIndex = 0;
            }
            this.setState({
                selected_channel_index_quad1: newChannelIndex,
                selected_channel_quad1:
                    this.state.selected_channels[newChannelIndex],
            });
        }
        if (player == 2) {
            var newChannelIndex =
                this.state.selected_channel_index_quad2 + updown;
            if (newChannelIndex < 0) {
                newChannelIndex = this.state.selected_channels.length - 1;
            } else if (newChannelIndex == this.state.selected_channels.length) {
                newChannelIndex = 0;
            }
            this.setState({
                selected_channel_index_quad2: newChannelIndex,
                selected_channel_quad2:
                    this.state.selected_channels[newChannelIndex],
            });
        }
        if (player == 3) {
            var newChannelIndex =
                this.state.selected_channel_index_quad3 + updown;
            if (newChannelIndex < 0) {
                newChannelIndex = this.state.selected_channels.length - 1;
            } else if (newChannelIndex == this.state.selected_channels.length) {
                newChannelIndex = 0;
            }
            this.setState({
                selected_channel_index_quad3: newChannelIndex,
                selected_channel_quad3:
                    this.state.selected_channels[newChannelIndex],
            });
        }
        if (player == 4) {
            var newChannelIndex =
                this.state.selected_channel_index_quad4 + updown;
            if (newChannelIndex < 0) {
                newChannelIndex = this.state.selected_channels.length - 1;
            } else if (newChannelIndex == this.state.selected_channels.length) {
                newChannelIndex = 0;
            }
            this.setState({
                selected_channel_index_quad4: newChannelIndex,
                selected_channel_quad4:
                    this.state.selected_channels[newChannelIndex],
            });
        }
        this.startChannelQuadIpAddress(
            this.state.selected_channels[newChannelIndex],
            player,
        );
    }
    startChannelQuadIpAddress(channel, player) {
        if (
            channel.secure_stream == false &&
            channel.drm_stream == false &&
            channel.drm_stream == false &&
            channel.akamai_token == false &&
            channel.flussonic_token == false
        ) {
            this.startQuadChannel(channel, player);
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
                        this.startQuadChannel(channel, player);
                    } else {
                        this.startQuadChannel(channel, player);
                    }
                })
                .catch(error => {
                    this.startQuadChannel(channel, player);
                });
        }
    }
    startQuadChannel(channel, player) {
        if (this.state.surf_childlock_free == false && channel.childlock == 1) {
            return;
        }
        var url = '';
        var udp = false;
        var drmKey = '';
        var type = 'm3u8';

        if (GLOBAL.Device_IsSmartTV) {
            url = channel.tizen_webos;
        } else if (
            GLOBAL.Device_Manufacturer == 'Apple' ||
            GLOBAL.Device_IsPwaIOS
        ) {
            url = channel.ios_tvos;
        } else {
            url = channel.url_high;
        }

        url = url.toString().replace(' ', '');
        if (url == '' || url == null) {
            return;
        }
        if (url.indexOf('udp://') > -1) {
            udp = true;
        }
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
        if (channel.secure_stream == true && channel.drm_stream == false) {
            url = TOKEN.getAkamaiTokenLegacy(url);
        } else if (channel.drm_stream == true) {
            ///no quad play when drm is on
        } else if (channel.akamai_token == true) {
            url = TOKEN.getAkamaiToken(url);
        } else if (channel.flussonic_token == true) {
            url = TOKEN.getFlussonicToken(url);
        }
        if (channel.drm_stream == false) {
            if (player == 1) {
                this.setState({
                    quadstream1: url,
                    quadtype1: type,
                    quaddrmKey1: drmKey,
                    paused1: false,
                });
            }
            if (player == 2) {
                this.setState({
                    quadstream2: url,
                    quadtype2: type,
                    quaddrmKey2: drmKey,
                });
            }
            if (player == 3) {
                this.setState({
                    quadstream3: url,
                    quadtype3: type,
                    quaddrmKey3: drmKey,
                });
            }
            if (player == 4) {
                this.setState({
                    quadstream4: url,
                    quadtype4: type,
                    quaddrmKey4: drmKey,
                });
            }
        }
    }
    startChannelById(channel_id) {
        this.fadeIn();
        var newChannelIndex = this.state.selected_channels.findIndex(
            ch => ch.channel_id == channel_id,
        );
        UTILS.setPositionAndRow(newChannelIndex);
        this.getChannel(newChannelIndex);
    }
    getChannel(newChannelIndex, fromCategoryMenu) {
        this.sentReport();
        this.cancelAds();
        this.fadeIn();
        var newChannel = this.state.selected_channels[newChannelIndex];
        if (newChannel == undefined) {
            return;
        }
        var channelId = newChannel.channel_id;
        if (GLOBAL.Channels_Selected_Category_ID == 0) {
            newChannel = UTILS.getChannelFavorite(channelId);
        }
        if (newChannel == undefined) {
            return;
        }
        var newProgram = UTILS.getCurrentProgram(newChannel.channel_id);
        var newEpgIndex = UTILS.getCurrentProgramIndex(newChannel.channel_id);
        var newEpg = UTILS.getCurrentEpg(newChannel.channel_id);
        var isFavorite = UTILS.getFavoriteChannel(newChannel.channel_id);
        var isCatchup = UTILS.getCatchupChannel(newChannel.channel_id);
        var currentChannel = this.state.selected_channel;
        this.setState(
            {
                previous_channel_id: currentChannel.channel_id,
                selected_channel_index: newChannelIndex,
                selected_channel: newChannel,
                selected_epg: newEpg,
                selected_epg_program: newProgram,
                selected_epg_index: newEpgIndex,
                selected_epg_index_scrubber: newEpgIndex,
                selected_epg_scrubber: newEpg,
                selected_channel_scrubber: newChannel,
                selected_channel_index_scrubber: newChannelIndex, // aanpassen
                selected_epg_index_scrubber_base: 0,
                selected_channel_zapper: newChannel,
                selected_zapper_index: newChannelIndex,
                show_catchup_menu: false,
                show_channel_menu: fromCategoryMenu != undefined ? true : false,
                show_channel_search: false,
                show_category_menu: false,
                show_popup: false,
                channellist: fromCategoryMenu != undefined ? true : false,
                favorite: isFavorite,
                live: true,
                catchup: isCatchup,
                duration: 0,
                current_time: 0,
                error: '',
                pause_time: 0,
                program_seek: 0,
                ticker_enabled: false,
                overlay_enabled: false,
                preroll_enabled: false,
                show_overlay: false,
                show_ticker: false,
                show_preroll: false,
                playing_catchup: false,
            },
            () => {
                if (
                    newChannel.childlock == 1 &&
                    this.state.surf_childlock_free == false
                ) {
                    this.setState({
                        show_childlock: true,
                        code: '',
                        player_type: '',
                    });
                    //this.fadeIn();
                    this.focusChildlock();
                } else {
                    this.checkForAds();
                }
            },
        );
    }
    checkForAds() {
        if (GLOBAL.Ads_Enabled == true) {
            if (this.state.selected_channel.preroll_enabled == 1) {
                this.getStreamAdsTV();
            } else {
                this.refreshIpAddress();
                if (
                    this.state.selected_channel.overlay_enabled == 1 ||
                    this.state.selected_channel.ticker_enabled == 1
                ) {
                    TimerMixin.clearTimeout(this.adsTimer);
                    this.adsTimer = TimerMixin.setTimeout(() => {
                        this.getStreamAdsTV();
                    }, 5000);
                }
            }
        } else {
            this.refreshIpAddress();
        }
    }
    getStreamAdsTV() {
        var path =
            GLOBAL.Settings_Gui.style.web_api_location +
            '/advertisement/getStreamAdvertisement?contentName=' +
            encodeURI(this.state.selected_channel.name) +
            '&contentType=channel&contentId=' +
            this.state.selected_channel.channel_id +
            '&userId=' +
            GLOBAL.UserID +
            '&resellerId=' +
            GLOBAL.ResellerID +
            '&deviceModel=' +
            encodeURI(GLOBAL.Device_Model) +
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
                    this.state.selected_channel.preroll_enabled == 1 &&
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
                            is_ad: false,
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
                                // REPORT.set({
                                //     type: 28,
                                //     duration: ads.ticker[0].showtime,
                                //     key: 'ticker'
                                // });
                                this.setState({
                                    show_ticker: true,
                                    ticker_time: ads.ticker[0].showtime * 1000,
                                    ticker_text:
                                        ads.ticker[0].text +
                                        ' ' +
                                        ads.ticker[0].text,
                                });
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
        if (
            this.state.selected_channel.secure_stream == false &&
            this.state.selected_channel.drm_stream == false &&
            this.state.selected_channel.drm_stream == false &&
            this.state.selected_channel.akamai_token == false &&
            this.state.selected_channel.flussonic_token == false
        ) {
            this.startLiveChannel();
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
                        this.startLiveChannel();
                    } else {
                        this.startLiveChannel();
                    }
                })
                .catch(error => {
                    this.startLiveChannel();
                });
        }
    }
    startLiveChannel() {
        this.fadeBackOut();
        this.startSleepModeTimer();
        if (this.state.retry == false) {
            var prog = 'No Information Available';
            if (this.state.selected_epg_program != undefined) {
                prog = this.state.selected_epg_program.n;
            }
            // REPORT.set({
            //     type: 1,
            //     name: this.state.selected_channel.name,
            //     id: this.state.selected_channel.channel_id,
            //     epg: prog
            // });
        }
        var url = '';
        var player_type = 'exo';
        var vast =
            this.state.selected_channel.vast != null
                ? this.state.selected_channel.vast
                : 'https://';
        var udp = false;

        if (GLOBAL.Device_IsSmartTV) {
            if (this.state.selected_channel.is_flussonic == 1) {
                if (
                    this.state.selected_channel.tizen_webos.indexOf(
                        'index.mpd',
                    ) > -1
                ) {
                    var replacePart =
                        'index-' +
                        this.state.selected_epg_program.s +
                        '-now.mpd';
                    url = this.state.selected_channel.tizen_webos.replace(
                        'index.mpd',
                        replacePart,
                    );
                }
                if (
                    this.state.selected_channel.tizen_webos.indexOf(
                        'index.m3u8',
                    ) > -1
                ) {
                    var replacePart =
                        'index-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.tizen_webos.replace(
                        'index.m3u8',
                        replacePart,
                    );
                }
                if (
                    this.state.selected_channel.tizen_webos.indexOf(
                        'video.m3u8',
                    ) > -1
                ) {
                    var replacePart =
                        'video-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.tizen_webos.replace(
                        'video.m3u8',
                        replacePart,
                    );
                }
                if (
                    this.state.selected_channel.tizen_webos.indexOf(
                        'mono.m3u8',
                    ) > -1
                ) {
                    var replacePart =
                        'mono-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.tizen_webos.replace(
                        'mono.m3u8',
                        replacePart,
                    );
                }
            } else {
                url = this.state.selected_channel.tizen_webos;
            }
        } else if (
            GLOBAL.Device_Manufacturer == 'Apple' ||
            GLOBAL.Device_IsPwaIOS
        ) {
            url = this.state.selected_channel.ios_tvos;
            if (this.state.selected_channel.is_flussonic == 1) {
                if (
                    this.state.selected_channel.ios_tvos.indexOf('index.m3u8') >
                    -1
                ) {
                    var replacePart =
                        'index-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.ios_tvos.replace(
                        'index.m3u8',
                        replacePart,
                    );
                }
                if (
                    this.state.selected_channel.ios_tvos.indexOf('video.m3u8') >
                    -1
                ) {
                    var replacePart =
                        'video-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.ios_tvos.replace(
                        'video.m3u8',
                        replacePart,
                    );
                }
                if (
                    this.state.selected_channel.ios_tvos.indexOf('mono.m3u8') >
                    -1
                ) {
                    var replacePart =
                        'mono-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.ios_tvos.replace(
                        'mono.m3u8',
                        replacePart,
                    );
                }
            } else {
                url = this.state.selected_channel.ios_tvos;
            }
        } else {
            if (this.state.selected_channel.is_flussonic == 1) {
                if (
                    this.state.selected_channel.url_high.indexOf('index.mpd') >
                    -1
                ) {
                    var replacePart =
                        'index-' +
                        this.state.selected_epg_program.s +
                        '-now.mpd';
                    url = this.state.selected_channel.url_high.replace(
                        'index.mpd',
                        replacePart,
                    );
                }
                if (
                    this.state.selected_channel.url_high.indexOf('index.m3u8') >
                    -1
                ) {
                    var replacePart =
                        'index-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.url_high.replace(
                        'index.m3u8',
                        replacePart,
                    );
                }
                if (
                    this.state.selected_channel.url_high.indexOf('video.m3u8') >
                    -1
                ) {
                    var replacePart =
                        'video-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.url_high.replace(
                        'video.m3u8',
                        replacePart,
                    );
                }
                if (
                    this.state.selected_channel.url_high.indexOf('mono.m3u8') >
                    -1
                ) {
                    var replacePart =
                        'mono-' +
                        this.state.selected_epg_program.s +
                        '-now.m3u8';
                    url = this.state.selected_channel.url_high.replace(
                        'mono.m3u8',
                        replacePart,
                    );
                }
            } else {
                url = this.state.selected_channel.url_high;
            }
        }

        if (url.indexOf('npplayout_') > -1) {
            //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
            var queryString = '';
            queryString += '&ads.did=' + GLOBAL.Device_UniqueID;
            queryString += '&ads.app_name=' + GLOBAL.IMS;
            queryString += '&ads.app_bundle=' + GLOBAL.Package;
            // queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
            queryString += '&ads.channel_name=' + encodeURI(channel.name);
            queryString += '&ads.us_privacy=1---';
            queryString += '&ads.schain=1';
            queryString += '&ads.w=1980';
            queryString += '&ads.h=1080';
            url += queryString;
        }

        if (url == '' || url == null) {
            return;
        }
        if (url.indexOf('udp://') > -1) {
            udp = true;
        }
        //url = "https://fls-server3.mycdn.tv/MW_DRM01/index.mpd";
        //url = 'http://198.255.22.74:8080/CNN/index.m3u8'
        //url = 'https://fls-server3.mycdn.tv:443/CNN/index.m3u8'
        //url = 'http://11live01.akamaized.net/FT2_TNT/mono.m3u8?token=letmein_FT'
        //url = "udp://@239.255.1.86:1234";
        //url = "https://fls-server3.mycdn.tv/CNN/mpegts";
        //url = "https://filesamples.com/samples/video/ts/sample_1920x1080.ts";
        //url = "http://panelstreams.com:826/flusspanprojmw2020/40cas0g01kAGGga84j0A/116308";
        //url = "http://panelstreams.com:826/BritGui018/08a0g001k/116308";
        //url = "http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8"
        //url = "https://fls-exoscale1.mycdn.tv/MW_DRM01/index.mpd";

        var drmKey = '';
        var type = 'm3u8';
        var type_ = 'application/x-mpegURL';
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

        if (url.indexOf('player=native') > 0) {
            player_type = 'native';
        } else {
            player_type = 'exo';
        }

        if (
            this.state.selected_channel.secure_stream == true &&
            this.state.selected_channel.drm_stream == false
        ) {
            url = TOKEN.getAkamaiTokenLegacy(url);
        } else if (this.state.selected_channel.drm_stream == true) {
            if (this.state.selected_channel.drm.drm_type == 'buydrm') {
                (async () => {
                    let drm = await TOKEN.getDrmWidevineFairplayBuyDRM(
                        url,
                        this.state.selected_channel,
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
                            type_: type_,
                            paused: false,

                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,

                            show_pause: false,
                            player_type: player_type,
                            vast: vast,
                            is_ad: false,
                            playing_catchup_nearing_end: false,
                            seek: 0,
                            duration: 0,
                            playable_duration: 0,
                            current_time: 0,
                            value: 0,
                            playing_catchup: false,
                            buffer_config: {
                                minBufferMs: 15000,
                                maxBufferMs: 50000,
                                bufferForPlaybackMs: udp == true ? 1000 : 2500,
                                bufferForPlaybackAfterRebufferMs:
                                    udp == true ? 2000 : 5000,
                            },
                            audio_track_index: 0,
                            text_track_index: 0,
                        });
                    }
                })();
            } else if (this.state.selected_channel.drm.drm_type == 'irdeto') {
                (async () => {
                    let drm = await TOKEN.getDrmWidevineFairplayIrdeto(
                        GLOBAL.DRM_KeyServerURL,
                        this.state.selected_channel,
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
                            type_: type_,
                            paused: false,

                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,

                            show_pause: false,
                            player_type: player_type,
                            vast: vast,
                            is_ad: false,
                            playing_catchup_nearing_end: false,
                            seek: 0,
                            duration: 0,
                            playable_duration: 0,
                            current_time: 0,
                            value: 0,
                            playing_catchup: false,
                            buffer_config: {
                                minBufferMs: 15000,
                                maxBufferMs: 50000,
                                bufferForPlaybackMs: udp == true ? 1000 : 2500,
                                bufferForPlaybackAfterRebufferMs:
                                    udp == true ? 2000 : 5000,
                            },
                            audio_track_index: 0,
                            text_track_index: 0,
                        });
                    }
                })();
            }
        } else if (this.state.selected_channel.akamai_token == true) {
            url = TOKEN.getAkamaiToken(url);
        } else if (this.state.selected_channel.flussonic_token == true) {
            url = TOKEN.getFlussonicToken(url);
        }

        //vast= 'https://lv-uads.acuteksolutions.com/uads/fc.php?script=rmVideo&zoneid=35&format=vast4.1&loc="+window.location.hostname+"'
        //vast= "http://rtr.innovid.com/r1.5554946ab01d97.36996823;cb=%25%CACHEBUSTER%25%25"
        ///vast= "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator="
        //vast = "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpostlongpod&cmsid=496&vid=short_tencue&correlator="
        //vast= "https://lv-uads.acuteksolutions.com/uads/fc.php?script=rmVideo&zoneid=30&format=vast3&loc="
        if (this.state.selected_channel.drm_stream == false) {
            this.setState({
                stream: url,
                type: type,
                type_: type_,
                paused: false,
                drmKey: '',
                drmSupplierType: '',
                drmLicenseServerUrl: '',
                drmCertificateUrl: '',
                show_pause: false,
                player_type: player_type,
                vast: vast,
                is_ad: false,
                playing_catchup_nearing_end: false,
                seek: 0,
                duration: 0,
                playable_duration: 0,
                current_time: 0,
                value: 0,
                playing_catchup: false,
                buffer_config: {
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: udp == true ? 1000 : 2500,
                    bufferForPlaybackAfterRebufferMs: udp == true ? 2000 : 5000,
                },
                audio_track_index: 0,
                text_track_index: 0,
            });
        }
        this.fadeBackOut();
    }
    startCatchupProgramFromTimeStamp(progseek, frompauseplay) {
        this.sentReport();
        this.cancelAds();
        var isFavorite = UTILS.getFavoriteChannel(
            this.state.selected_channel.channel_id,
        );
        var program = UTILS.getCurrentProgram(
            this.state.selected_channel.channel_id,
        );
        this.setState(
            {
                show_catchup_menu: false,
                show_channel_menu: false,
                show_channel_search: false,
                show_category_menu: false,
                channellist: false,
                favorite: isFavorite,
                live: false,
                catchup: true,
                duration: 0,
                current_time: 0,
                error: '',
                program_seek: progseek,
                ticker_enabled: false,
                overlay_enabled: false,
                preroll_enabled: false,
                show_overlay: false,
                show_ticker: false,
                show_preroll: false,
                show_buttons_controller: true,
            },
            () => {
                this.refreshIpAddressCatchup(
                    program,
                    this.state.selected_channel,
                    frompauseplay,
                );
            },
        );
    }

    startProgram(updown, index, channel, fromControls) {
        this.sentReport();
        this.fadeBackOut();
        this.cancelAds();
        if (this.state.is_ad == true && index != undefined) {
            return;
        }
        if (this.state.live == true && updown == 1 && index == undefined) {
            return;
        }
        var epgIndexNow = UTILS.getCurrentProgramIndex(
            this.state.selected_channel.channel_id,
        );
        var newProgramIndex =
            index != undefined ? index : this.state.selected_epg_index + updown;
        //if (newProgramIndex > epgIndexNow) { return }
        if (newProgramIndex < 0) {
            return;
        }
        if (channel != undefined) {
            if (channel.is_flussonic == 0 && channel.is_dveo == 0) {
                return;
            } else {
                //via miniepg
                if (this.state.selected_epg_scrubber == undefined) {
                    return;
                }
                var program = this.state.selected_epg_scrubber[index];
                var newEpg = UTILS.getCurrentEpg(channel.channel_id);
                var epgIndexNow = UTILS.getCurrentProgramIndex(
                    channel.channel_id,
                );
                var isFavorite = UTILS.getFavoriteChannel(
                    this.state.selected_channel.channel_id,
                );
                if (index <= epgIndexNow) {
                    this.setState(
                        {
                            selected_channel: channel,
                            selected_epg: newEpg,
                            live: false,
                            max_retry: 5,
                            selected_epg_program_catchup: program,
                            selected_epg_index_catchup: epgIndexNow,
                            selected_epg_catchup: newEpg,
                            selected_epg_program: program,
                            selected_epg_index: epgIndexNow,
                            selected_epg_index_scrubber: epgIndexNow,
                            selected_epg_index_scrubber_base: 0,
                            playing_catchup: false,
                            miniepg: false,
                            isCatchup: true,
                            isFavorite: isFavorite,
                            duration: 0,
                            current_time: 0,
                            error: '',
                            stream: '',
                            pause_time: 0,
                            program_seek: 0,
                            ticker_enabled: false,
                            overlay_enabled: false,
                            preroll_enabled: false,
                            show_overlay: false,
                            show_ticker: false,
                            show_preroll: false,
                            show_buttons_controller: true,
                            seek_time: 0,
                        },
                        () => {
                            if (
                                GLOBAL.UserInterface.general.enable_catchuptv ==
                                true
                            ) {
                                this.refreshIpAddressCatchup(program, channel);
                            }
                        },
                    );
                } else if (fromControls == undefined) {
                    if (
                        GLOBAL.UserInterface.general.enable_recordings == true
                    ) {
                        var program = this.state.selected_epg_scrubber[index];
                        this.recordProgram(program, channel, false);
                    }
                }
            }
        } else if (newProgramIndex <= epgIndexNow) {
            //via channel list
            if (this.state.catchup == false) {
                return;
            }
            var isFavorite = UTILS.getFavoriteChannel(
                this.state.selected_channel.channel_id,
            );
            var program = this.state.selected_epg[newProgramIndex];
            this.setState(
                {
                    selected_epg_program_catchup: program,
                    selected_epg_index_catchup: newProgramIndex,
                    selected_epg_catchup: this.state.selected_epg,
                    selected_epg_program: program,
                    selected_epg_index: newProgramIndex,
                    selected_epg_index_scrubber: newProgramIndex,
                    //selected_epg_index_scrubber_base: newProgramIndex,
                    show_catchup_menu: false,
                    show_channel_menu: false,
                    show_channel_search: false,
                    show_category_menu: false,
                    channellist: false,
                    favorite: isFavorite,
                    live: false,
                    duration: 0,
                    current_time: 0,
                    error: '',
                    pause_time: 0,
                    program_seek: 0,
                    ticker_enabled: false,
                    overlay_enabled: false,
                    preroll_enabled: false,
                    show_overlay: false,
                    show_ticker: false,
                    show_preroll: false,
                    show_buttons_controller: true,
                    seek_time: 0,
                    max_retry: 5,
                },
                () => {
                    if (GLOBAL.UserInterface.general.enable_catchuptv == true) {
                        this.refreshIpAddressCatchup(
                            program,
                            this.state.selected_channel,
                        );
                    }
                },
            );
        } else if (newProgramIndex > epgIndexNow && fromControls == undefined) {
            if (
                this.state.catchup == false &&
                this.state.channellist == false
            ) {
                return;
            }
            if (GLOBAL.UserInterface.general.enable_recordings == true) {
                var program = this.state.selected_epg[newProgramIndex];
                this.recordProgram(program, this.state.selected_channel, false);
            }
        }
    }

    recordProgram(program, channel, hasbeenrecorded) {
        if (program.e == program.s) {
            return;
        }
        if (hasbeenrecorded == true) {
            GLOBAL.Recording = UTILS.getRecordingInfo(
                program.s,
                program.e,
                program.n,
            );
            if (GLOBAL.Recording != null) {
                Actions.Player_Recordings();
            }
        } else if (GLOBAL.Storage_Used / GLOBAL.Storage_Total < 0.95) {
            this.setState({
                button_record_requested: true,
                current_program: program,
                show_category_menu: false,
                show_channel_menu: false,
                show_channel_search: false,
                show_catchup_menu: false,
                channellist: false,
                show_popup: false,
                miniepg: false,
            });
            DAL.setRecording(
                channel.channel_id,
                program.e,
                program.s,
                program.n,
            ).then(data => {
                if (data == 'Not Approved') {
                    this.setState(
                        {
                            button_record_fail: true,
                            button_record: false,
                            current_program: program,
                            button_record_requested: false,
                        },
                        () => {
                            this.recordTimer = TimerMixin.setTimeout(() => {
                                this.setState({
                                    button_record_fail: false,
                                    button_record_requested: false,
                                    current_program: program,
                                });
                            }, 4000);
                        },
                    );
                } else {
                    var recording = {
                        pvr_id: 0,
                        channel_name: '',
                        program_name: program.n,
                        channel_icon: '',
                        s: program.s,
                        e: program.e,
                        url: '',
                        bitrate: null,
                    };
                    GLOBAL.Recordings.push(recording);

                    this.setState(
                        {
                            show_popup: true,
                            button_record: true,
                            button_record_requested: false,
                            current_program: program,
                        },
                        () => {
                            this.recordTimer = TimerMixin.setTimeout(() => {
                                this.setState({
                                    show_popup: false,
                                    button_record: false,
                                    current_program: program,
                                });
                            }, 4000);
                        },
                    );
                }
            });
        } else {
            this.setState(
                {
                    button_record_fail: true,
                    button_record: false,
                    current_program: program,
                },
                () => {
                    this.recordTimer = TimerMixin.setTimeout(() => {
                        this.setState({
                            button_record_fail: false,
                            current_program: program,
                        });
                    }, 4000);
                },
            );
        }
    }
    startCatchupProgram(program, channel) {
        this.cancelAds();
        var isFavorite = UTILS.getFavoriteChannel(channel.channel_id);
        var epgIndexNow = UTILS.getCurrentProgramIndex(channel.channel_id);
        var scrubberBaseIndex =
            this.state.selected_epg_index_catchup - epgIndexNow;
        this.setState(
            {
                selected_epg: this.state.selected_epg_catchup,
                selected_epg_program: program,
                selected_epg_index: this.state.selected_epg_index_catchup,
                selected_epg_index_scrubber:
                    this.state.selected_epg_index_catchup,
                selected_epg_scrubber: this.state.selected_epg_catchup,
                selected_epg_index_scrubber_base: scrubberBaseIndex,
                show_catchup_menu: false,
                show_channel_menu: false,
                show_channel_search: false,
                show_category_menu: false,
                channellist: false,
                favorite: isFavorite,
                live: false,
                catchup: true,
                duration: 0,
                current_time: 0,
                error: '',
                pause_time: 0,
                program_seek: 0,
                ticker_enabled: false,
                overlay_enabled: false,
                preroll_enabled: false,
                show_overlay: false,
                show_ticker: false,
                show_preroll: false,
                show_buttons_controller: true,
            },
            () => {
                this.refreshIpAddressCatchup(program, channel);
            },
        );
    }
    refreshIpAddressCatchup(program, channel, frompauseplay) {
        this.fadeIn();
        if (channel == undefined) {
            return;
        }
        if (
            channel.secure_stream == false &&
            channel.drm_stream == false &&
            channel.drm_stream == false &&
            channel.akamai_token == false &&
            channel.flussonic_token == false
        ) {
            this.startCatchupStream(program, channel, frompauseplay);
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
                        this.startCatchupStream(
                            program,
                            channel,
                            frompauseplay,
                        );
                    } else {
                        this.startCatchupStream(
                            program,
                            channel,
                            frompauseplay,
                        );
                    }
                })
                .catch(error => {
                    this.startCatchupStream(program, channel);
                });
        }
    }
    startCatchupStream(program, channel, frompauseplay) {
        var prog = 'No Information Available';
        if (program != undefined) {
            prog = program.n;
        }
        // REPORT.set({
        //     type: 5,
        //     name: channel.name,
        //     id: channel.channel_id,
        //     epg: prog
        // });
        var player_type = 'exo';
        var url = '';
        var url_ = '';

        if (GLOBAL.Device_IsSmartTV) {
            url_ = channel.tizen_webos;
        } else if (
            GLOBAL.Device_Manufacturer == 'Apple' ||
            GLOBAL.Device_IsPwaIOS
        ) {
            url_ = channel.ios_tvos;
        } else {
            url_ = channel.url_high;
        }

        var startTime = program.s;
        //dveo
        if (channel.is_dveo == 1) {
            if (channel.url_interactivetv != null) {
                const urlInteractive = channel.url_interactivetv
                    .toString()
                    .replace(GLOBAL.HTTPvsHTTPS + '', '')
                    .toString()
                    .replace('https://', '');
                var splitUrl = urlInteractive.toString().split('/');
                var http = GLOBAL.HTTPvsHTTPS;
                if (channel.url_interactivetv.indexOf('https://') > 0) {
                    http = 'https://';
                }
                url =
                    http +
                    '' +
                    splitUrl[0] +
                    '/-' +
                    (moment().unix() - startTime) +
                    '-/' +
                    splitUrl[1] +
                    '/' +
                    splitUrl[2] +
                    '/' +
                    splitUrl[3] +
                    '/' +
                    splitUrl[4];
            }
        }
        //flussonic
        if (channel.is_flussonic == 1) {
            var length = program.e - program.s;
            if (channel.url_interactivetv != null) {
                //this can go in the future
                if (channel.url_interactivetv.indexOf('.mpd') > 0) {
                    url =
                        channel.url_interactivetv
                            .toString()
                            .replace('Manifest.mpd', '')
                            .replace('index.mpd', '') +
                        'index-' +
                        startTime +
                        '-' +
                        (frompauseplay != undefined ? 'now' : length) +
                        '.mpd?ignore_gaps=true';
                } else {
                    url =
                        channel.url_interactivetv
                            .toString()
                            .replace('mono.m3u8', '')
                            .toString()
                            .replace('index.m3u8', '') +
                        'index-' +
                        startTime +
                        '-' +
                        (frompauseplay != undefined ? 'now' : length) +
                        '.m3u8?ignore_gaps=true';
                }
            } else {
                if (url_.indexOf('.mpd') > 0) {
                    url =
                        url_
                            .toString()
                            .replace('Manifest.mpd', '')
                            .replace('index.mpd', '') +
                        'index-' +
                        startTime +
                        '-' +
                        (frompauseplay != undefined ? 'now' : length) +
                        '.mpd?ignore_gaps=true';
                } else {
                    url =
                        url_
                            .toString()
                            .replace('mono.m3u8', '')
                            .toString()
                            .replace('index.m3u8', '') +
                        'index-' +
                        startTime +
                        '-' +
                        (frompauseplay != undefined ? 'now' : length) +
                        '.m3u8?ignore_gaps=true';
                }
            }
        }
        var type_ = 'application/x-mpegURL';
        var type = 'm3u8';
        var url_ = url.split('?');
        var extension = url_[0].split('.').pop();

        if (extension == 'mpd') {
            type = 'mpd';
            type_ = 'DASH';
        }
        if (extension == 'm3u8') {
            type = 'm3u8';
            type_ = 'application/x-mpegURL';
        }
        var drmKey = '';
        if (channel.secure_stream == true && channel.drm_stream == false) {
            url = TOKEN.getAkamaiTokenLegacy(url);
        } else if (channel.drm_stream == true) {
            this.setState({
                player_type: 'exo',
            });
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
                            type_: type_,
                            paused: false,

                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,

                            show_pause: false,
                            player_type: player_type,
                            vast: vast,
                            is_ad: false,
                            playing_catchup_nearing_end: false,
                            seek: 0,
                            duration: 0,
                            playable_duration: 0,
                            current_time: 0,
                            value: 0,
                            playing_catchup: false,
                            buffer_config: {
                                minBufferMs: 15000,
                                maxBufferMs: 50000,
                                bufferForPlaybackMs: udp == true ? 1000 : 2500,
                                bufferForPlaybackAfterRebufferMs:
                                    udp == true ? 2000 : 5000,
                            },
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
                            type_: type_,
                            paused: false,

                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,

                            show_pause: false,
                            player_type: player_type,
                            vast: vast,
                            is_ad: false,
                            playing_catchup_nearing_end: false,
                            seek: 0,
                            duration: 0,
                            playable_duration: 0,
                            current_time: 0,
                            value: 0,
                            playing_catchup: false,
                            buffer_config: {
                                minBufferMs: 15000,
                                maxBufferMs: 50000,
                                bufferForPlaybackMs: udp == true ? 1000 : 2500,
                                bufferForPlaybackAfterRebufferMs:
                                    udp == true ? 2000 : 5000,
                            },
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
        if (channel.drm_stream == false) {
            this.setState({
                stream: url,
                type: type,
                paused: false,
                drmKey: '',
                drmSupplierType: '',
                drmLicenseServerUrl: '',
                drmCertificateUrl: '',
                show_pause: false,
                player_type: player_type,
                playing_catchup: true,
                vast: '',
                //seek: 0,
                //current_time: 0,
                //seek_time: 0,
                //duration: 0,
                //playable_duration: 0,
                //value: 0,
                playing_catchup_nearing_end: false,
                audio_track_index: 0,
                text_track_index: 0,
            });
        }
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
            back_focus: this.state.back_focus == false ? true : false,
            play_focus: this.state.play_focus == true ? false : true,
        });
        this.fadeOut();
    }
    getBack(frombutton) {
        if (this.state.quadview) {
            this.closeQuad();
            return;
        }

        if (this.state.show_childlock == true) {
            this.setState({
                show_childlock: false,
            });
        } else if (this.state.quadviewbuttons == true) {
            this.setState({
                quadviewbuttons: false,
            });
        } else if (this.state.quadview == true) {
            this.closeQuad();
        } else if (this.state.miniepg == true) {
            this.setState({
                miniepg: false,
                back_focus: this.state.back_focus == false ? true : false,
                play_focus: this.state.play_focus == true ? false : true,
            });
        } else if (this.state.controls == true && frombutton == undefined) {
            this.setState({
                controls: false,
                show_buttons_controller: false,
                show: false,
            });
        } else if (this.state.show_catchup_menu == true) {
            this.setState({
                show_catchup_menu: false,
            });
        } else if (this.state.show_channel_menu == true) {
            this.setState({
                show_channel_menu: false,
                channellist: false,
            });
        } else if (this.state.show_popup == true) {
            this._closePopups();
        } else if (this.state.fromPage == 'Home') {
            Actions.Home();
        } else if (this.state.fromPage == 'EPG') {
            Actions.EPG({ page: this.state.page });
        } else if (this.state.fromPage == 'Channels') {
            Actions.Channels();
        } else if (this.state.fromPage == 'Search') {
            Actions.SearchBox();
        } else if (this.state.fromPage == 'SearchEpg') {
            Actions.Search();
        } else if (this.state.fromPage == 'Favorites') {
            Actions.MyFavorites();
        } else if (this.state.fromPage == 'Watching') {
            Actions.MyList();
        } else if (this.state.fromPage == 'CatchupTV') {
            Actions.Catchup();
        } else {
            Actions.Home();
        }
    }
    sentReport() {
        this.setState({
            reportStartTimeZap: moment().unix(),
        });
        if (this.state.playing_catchup == false) {
            sendChannelReport(
                this.state.selected_channel.channel_id,
                this.state.selected_channel.channel_number,
                this.state.selected_channel.name,
                this.state.selected_channel.icon_big,
                this.state.reportStartTimeZap,
                moment().unix(),
                this.state.selected_epg_program.s,
                this.state.selected_epg_program.e,
                this.state.selected_epg_program.n,
            );
        } else {
            sendCatchupTVReport(
                this.state.selected_channel.channel_id,
                this.state.selected_channel.channel_number,
                this.state.selected_channel.name,
                this.state.selected_channel.icon_big,
                this.state.reportStartTimeZap,
                moment().unix(),
                this.state.selected_epg_program.s,
                this.state.selected_epg_program.e,
                this.state.selected_epg_program.n,
            );
        }
    }
    componentWillUnmount() {
        // if (GLOBAL.Device_IsWebTV == false) {
        //     unsubscribe();
        // }
        this.sentReport();
        sendPageReport(
            'Player Channels',
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
            // killVideoJSPlayer();
            this.setState({
                paused: true,
            });
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

        TimerMixin.clearTimeout(this.quadtimer);
        TimerMixin.clearInterval(this.sleepModeTimer);
        TimerMixin.clearTimeout(this.numericTimer);
        TimerMixin.clearTimeout(this.numericTimer2);
        TimerMixin.clearTimeout(this.adsTimer);
        TimerMixin.clearTimeout(this.errorTimer);
        TimerMixin.clearTimeout(this.zapTimer);
        TimerMixin.clearTimeout(this.buttonTimer);
        TimerMixin.clearTimeout(this.recordTimer);
        TimerMixin.clearTimeout(this.seekTimer);
        TimerMixin.clearTimeout(this.seekTimer_);
        TimerMixin.clearTimeout(this.fadeOutTimer);
        TimerMixin.clearTimeout(this.sleepModeTimeout);
        TimerMixin.clearTimeout(this.countDownTimer);
        TimerMixin.clearTimeout(this.dateRangeTimer);
        TimerMixin.clearTimeout(this.resumeTimer);
        TimerMixin.clearTimeout(this.start_watermark_timer);
        TimerMixin.clearTimeout(this.show_watermark_timer);

        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToPortrait();
        }
        if (GLOBAL.Device_IsAppleTV == true) {
            this._disableTVEventHandler();
        }
        Actions.pop();
    }
    _childlockValidate() {
        if (GLOBAL.PIN + '' == this.state.childlock + '') {
            this.setState({
                show_childlock: false,
                childlock: '',
            });
            if (this.state.movie.has_preroll == 1) {
                this.getStreamAdsTV();
            } else {
                this.refreshIpAddress();
                this.getStreamAdsTV();
            }
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

        if (
            this.state.is_ad == false &&
            this.state.controls == true &&
            this.state.paused == false &&
            this.state.channellist == false &&
            this.state.quadview == false
        ) {
            var position = data.currentTime;
            var playable = data.playableDuration;
            var extraPosition =
                moment().unix() - this.state.selected_epg_program.s;
            if (
                this.state.live == true &&
                this.state.selected_channel.is_flussonic == 0
            ) {
                position = extraPosition;
            }
            if (
                (this.state.playing_catchup == true ||
                    this.state.selected_channel.is_flussonic == 1) &&
                this.state.pause_time == 0
            ) {
                position = position + this.state.program_seek;
            }
            this.setState({
                current_time: position,
                playable_duration: playable,
                //max_retry: 5
            });
        }
        if (
            this.state.pause_time > 0 &&
            this.state.current_time > 0 &&
            this.state.paused == false &&
            this.state.is_ad == false
        ) {
            var seek = this.state.program_seek - 60;
            this.setState(
                {
                    pause_time: 0,
                    program_seek: 0,
                },
                () => {
                    // if (GLOBAL.Device_IsWebTV) {
                    //     player.currentTime(seek);
                    // } else {
                    //     this.player.seek(seek);
                    // }
                    this.setSeek(seek, false);
                },
            );
        }
    };

    onEnd = () => {
        if (this.state.playing_catchup == true) {
            this.startProgram(1, null, null, true);
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
        } else if (GLOBAL.Device_IsAppleTV) {
            this.setState({
                error: data.error.localizedDescription,
                buffering: false,
            });
        } else {
            data = data.target.error.code;
            this.setState({
                error: 'Error Code ' + data,
                buffering: false,
            });
        }
        if (this.state.live == true) {
            var new_retry = this.state.max_retry - 1;
            if (new_retry > 0) {
                TimerMixin.clearTimeout(this.errorTimer);
                this.errorTimer = TimerMixin.setTimeout(() => {
                    this.setState(
                        {
                            error: '',
                            max_retry: new_retry,
                        },
                        () => {
                            this.refreshIpAddress();
                            //Actions.Player({ fromPage: this.props.fromPage, max_retry: new_retry });
                        },
                    );
                }, 5000);
            }
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
            duration:
                this.state.is_ad == true
                    ? data.duration
                    : this.state.selected_epg_program.e -
                    this.state.selected_epg_program.s,
            buffering: false,
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
        if (this.state.is_ad == true) {
            return;
        }
        this.setSeek(60);
    }
    _onPlayerPausePlay() {
        //for pause start
        if (this.state.is_ad == true) {
            return;
        }
        if (
            this.state.catchup == false &&
            this.state.selected_channel.is_flussonic == 0
        ) {
            return;
        }
        if (this.state.controls == false) {
            this.fadeIn();
        }
        if (this.state.paused == false) {
            this.setState({
                paused: true,
                playstatus: "play-circle",
                error: '',
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
        if (this.state.is_ad == true) {
            return;
        }
        this.setSeek(-60);
    }
    scrubberChange = value => {
        // if (this.state.live == true) {
        //     this.startCatchupProgramFromTimeStamp(value)
        // } else {
        this.setState(
            {
                seeking: true,
                seek_time: value,
                current_time: value,
            },
            () => {
                this.setSeek(value, true);
            },
        );
        // }
    };
    _onFavoriteChange() {
        var id = this.state.selected_channel.channel_id;
        var isFavorite = GLOBAL.Favorite_Channels.find(function (element) {
            return element.channel_id == id;
        });

        if (isFavorite != undefined) {
            var index = GLOBAL.Favorite_Channels.findIndex(
                c => c.channel_id == isFavorite.channel_id,
            );
            GLOBAL.Favorite_Channels.splice(index, 1);
            this.setState({
                favorite: false,
                back_focus: this.state.back_focus == false ? true : false,
                play_focus: this.state.play_focus == true ? false : true,
            });
            UTILS.storeProfile(
                'television_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Channels,
                '',
            );
            if (GLOBAL.Channels_Selected_Category_ID == 0) {
                if (GLOBAL.Favorite_Channels.length == 0) {
                    if (this.state.fromPage == 'Home') {
                        Actions.Home();
                    } else if (this.state.fromPage == 'EPG') {
                        Actions.EPG();
                    } else if (this.state.fromPage == 'Channels') {
                        Actions.Channels();
                    } else if (this.state.fromPage == 'Search') {
                        Actions.SearchBox();
                    } else if (this.state.fromPage == 'SearchEpg') {
                        Actions.Search();
                    } else if (this.state.fromPage == 'Favorites') {
                        Actions.MyFavorites();
                    } else if (this.state.fromPage == 'Watching') {
                        Actions.MyList();
                    } else if (this.state.fromPage == 'CatchupTV') {
                        Actions.Catchup();
                    } else {
                        Actions.Home();
                    }
                } else {
                    var index_ = index + 1;
                    if (index_ > GLOBAL.Favorite_Channels.length - 1) {
                        index_ = 0;
                    }
                    var channel = GLOBAL.Favorite_Channels[index_];
                    this.startChannelById(channel.channel_id);
                }
            }
        } else {
            GLOBAL.Favorite_Channels.push(this.state.selected_channel);
            this.setState({
                favorite: true,
                back_focus: this.state.back_focus == false ? true : false,
                play_focus: this.state.play_focus == true ? false : true,
            });
            UTILS.storeProfile(
                'television_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Channels,
                '',
            );
        }
    }
    fadeOut() {
        this.setState({
            controls: false,
            show: false,
            miniepg: false,
            show_buttons_controller: false,
        });
    }
    fadeIn() {
        this.setState({
            controls: true,
            show: true,
            back_focus: this.state.back_focus == false ? true : false,
            play_focus: this.state.play_focus == true ? false : true,
            miniepg: false,
            show_buttons_controller:
                GLOBAL.Device_IsPhone ||
                    GLOBAL.Device_IsTablet ||
                    GLOBAL.Device_IsWebTV ||
                    this.state.playing_catchup
                    ? true
                    : false,
        });
        this.fadeBackOut();
    }
    fadeBackOut() {
        TimerMixin.clearTimeout(this.fadeOutTimer);
        this.fadeOutTimer = TimerMixin.setTimeout(() => {
            if (
                this.state.button_thanks == false &&
                this.state.miniepg == false &&
                this.state.is_ad == false &&
                this.state.channellist == false &&
                //this.state.quadview == false &&
                //this.state.quadviewbuttons == false &&
                this.state.paused == false &&
                this.state.seek_focus == false &&
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
        if (
            GLOBAL.Device_IsPhone ||
            GLOBAL.Device_IsTablet ||
            GLOBAL.Device_IsWebTV
        ) {
            return;
        }
        this.fadeBackOut();
        this.setState({
            seek_focus: false,
            buttons_hidden: false,
        });
    }
    focusSeek() {
        if (
            GLOBAL.Device_IsPhone ||
            GLOBAL.Device_IsTablet ||
            GLOBAL.Device_IsWebTV
        ) {
            return;
        }
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
        if (this.state.error_icon == true) {
            this.setState({
                error_icon: false,
            });
        }
        if (text.length == 4) {
            if (GLOBAL.PIN + '' == text + '') {
                this.setState(
                    {
                        show_childlock: false,
                        surf_childlock_free: true,
                    },
                    () => {
                        this.fadeBackOut();
                        this.checkForAds();
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
    startSleepModeTimer() {
        if (GLOBAL.Device_IsWebTV == true) {
            return;
        }
        if (this.state.show_sleepmode) {
            this.setState({
                show_sleepmode: false,
                remaining: 0,
                currentSleepTime: 0,
            });
        }
        if (GLOBAL.Sleep_Mode == 0) {
            return;
        }
        TimerMixin.clearTimeout(this.sleepModeTimeout);
        TimerMixin.clearInterval(this.sleepModeTimer);
        this.sleepModeTimer = TimerMixin.setInterval(() => {
            var sleepTime = GLOBAL.Sleep_Mode * 60;
            if (this.state.currentSleepTime < sleepTime) {
                var newTime = this.state.currentSleepTime + 60;
                this.setState({
                    currentSleepTime: newTime,
                });
            } else {
                this.setState({
                    show_sleepmode: true,
                    remaining: 60,
                });
                this.startSleepModeCountDown();
                this.showCountDown(60);
            }
        }, 60000);
    }
    startSleepModeCountDown() {
        this.sleepModeTimeout = TimerMixin.setTimeout(() => {
            TimerMixin.clearInterval(this.countDownTimer);
            Actions.Home();
        }, 60000);
    }
    showCountDown(time) {
        if (this.state.remaining == 0) {
            TimerMixin.clearInterval(this.countDownTimer);
        }
        this.countDownTimer = TimerMixin.setInterval(() => {
            var new_ = this.state.remaining - 1;
            this.setState({
                remaining: new_,
            });
        }, 1000);
    }
    toggleMiniEpg() {
        if (GLOBAL.UserInterface.player.enable_mini_epg == false) {
            return;
        }
        this.fadeBackOut();
        if (this.state.miniepg == false) {
            this.setState({
                miniepg: true,
                error: '',
            });
        } else {
            this.setState({
                miniepg: false,
                error: '',
            });
        }
    }
    toggleChannelList() {
        if (GLOBAL.UserInterface.player.enable_channel_menu == false) {
            return;
        }
        if (this.state.show_popup == true) {
            return;
        }
        this.fadeBackOut();
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
    openQuadView() {
        this.fadeBackOut();
        TimerMixin.clearTimeout(this.quadtimer);
        this.quadtimer = TimerMixin.setTimeout(() => {
            this.setState({
                quadviewbuttons: false,
            });
        }, 4000);
        if (this.state.quadview == false) {
            this.setState({
                quadviewbuttons: true,
                quadview: true,
                player_type: '',
                tochable: false,
                channellist: false,
                show_buttons_controller: false,
            });
            var getCurrentIndex = UTILS.getChannelIndex(
                this.state.selected_channel.channel_id,
            );
            this.setState({
                selected_channel_index_quad1: getCurrentIndex,
                selected_channel_quad1:
                    this.state.selected_channels[getCurrentIndex],
            });
            this.startChannelQuadIpAddress(
                this.state.selected_channels[getCurrentIndex],
                1,
            );
            getCurrentIndex = getCurrentIndex + 1;
            if (getCurrentIndex > this.state.selected_channels.length - 1) {
                getCurrentIndex = 0;
            }
            this.setState({
                selected_channel_index_quad2: getCurrentIndex,
                selected_channel_quad2:
                    this.state.selected_channels[getCurrentIndex],
            });
            this.startChannelQuadIpAddress(
                this.state.selected_channels[getCurrentIndex],
                2,
            );
            getCurrentIndex = getCurrentIndex + 1;
            if (getCurrentIndex > this.state.selected_channels.length - 1) {
                getCurrentIndex = 0;
            }
            this.setState({
                selected_channel_index_quad3: getCurrentIndex,
                selected_channel_quad3:
                    this.state.selected_channels[getCurrentIndex],
            });
            this.startChannelQuadIpAddress(
                this.state.selected_channels[getCurrentIndex],
                3,
            );
            getCurrentIndex = getCurrentIndex + 1;
            if (getCurrentIndex > this.state.selected_channels.length - 1) {
                getCurrentIndex = 0;
            }
            this.setState({
                selected_channel_index_quad4: getCurrentIndex,
                selected_channel_quad4:
                    this.state.selected_channels[getCurrentIndex],
            });
            this.startChannelQuadIpAddress(
                this.state.selected_channels[getCurrentIndex],
                4,
            );
        }
    }

    _onPressCategoryChange_(item) {
        var category = this.state.categories.find(x => x.id == item.id);
        if (category.channels.length > 0) {
            GLOBAL.Channels_Selected_Category_ID = item.id;
            GLOBAL.Channels_Selected = category.channels;
            GLOBAL.Channels_Selected_Index = 0;
            GLOBAL.Channels_Selected_Row = 0;
            GLOBAL.Channels_Selected_Category_Index = UTILS.getCategoryIndex(
                GLOBAL.Channels_Selected_Category_ID,
            );
            this.setState({
                selected_channels_list: category.channels,
                show_category_menu: false,
                show_channel_menu: true,
                selected_channel_index: 0,
            });
        }
    }
    _onPressCategoryChange(item) {
        var category = this.state.categories.find(x => x.id == item.id);
        if (category.channels.length > 0) {
            GLOBAL.Channels_Selected = category.channels;
            GLOBAL.Channel = category.channels[0];
            GLOBAL.Channels_Selected_Category_ID = item.id;
            GLOBAL.Channels_Selected_Category_Index = UTILS.getCategoryIndex(
                GLOBAL.Channels_Selected_Category_ID,
            );
            this.setState(
                {
                    //channels
                    selected_channels: GLOBAL.Channels_Selected, //all the channels in the category
                    selected_channel: GLOBAL.Channel, //new
                    selected_channel_index: UTILS.getChannelIndex(
                        GLOBAL.Channel.channel_id,
                    ), // aanpassen

                    //epg
                    selected_epg: UTILS.getCurrentEpg(
                        GLOBAL.Channel.channel_id,
                    ),
                    selected_epg_index: UTILS.getCurrentProgramIndex(
                        GLOBAL.Channel.channel_id,
                    ),
                    selected_epg_program: UTILS.getCurrentProgram(
                        GLOBAL.Channel.channel_id,
                    ),

                    //scrubber
                    selected_epg_scrubber: UTILS.getCurrentEpg(
                        GLOBAL.Channel.channel_id,
                    ),
                    selected_epg_index_scrubber: UTILS.getCurrentProgramIndex(
                        GLOBAL.Channel.channel_id,
                    ),
                    selected_channel_index_scrubber: UTILS.getChannelIndex(
                        GLOBAL.Channel.channel_id,
                    ), // aanpassen
                    selected_epg_index_scrubber_base: 0,
                    selected_channel_scrubber: GLOBAL.Channel,
                },
                () => {
                    UTILS.setPositionAndRow(0);
                    this.startChannel(0, true);
                },
            );
        }
    }
    _renderCategory(item, index) {
        if (item.id == GLOBAL.Channels_Selected_Category_ID) {
            GLOBAL.Selected_Next_Category_Index = index + 1;

            return (
                <TouchableHighlightFocus
                    style={{ width: this.state.channel_list_width }}
                    BorderRadius={5}
                    key={index}
                    hasTVPreferredFocus={
                        index == GLOBAL.Selected_Next_Category_Index
                            ? true
                            : false
                    }
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressCategoryChange(item)}
                >
                    <View
                        style={[
                            {
                                backgroundColor: '#333',
                                padding: 10,
                                margin: 2,
                                width: this.state.channel_list_width - 12,
                                borderRadius: 5,
                            },
                        ]}
                    >
                        <View style={{ padding: 10, margin: 2, paddingLeft: 20 }}>
                            <Text style={[styles.H2, { color: '#fff' }]}>
                                {item.name}
                            </Text>
                            <Text style={[styles.Standard, { color: '#fff' }]}>
                                {item.channels == undefined
                                    ? 0
                                    : item.channels.length}{' '}
                                {LANG.getTranslation('channels')}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        } else {
            return (
                <TouchableHighlightFocus
                    style={{ width: this.state.channel_list_width }}
                    BorderRadius={5}
                    key={index}
                    hasTVPreferredFocus={
                        index == GLOBAL.Selected_Next_Category_Index
                            ? true
                            : false
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
                            <Text style={[styles.Standard]}>
                                {item.channels == undefined
                                    ? 0
                                    : item.channels.length}{' '}
                                {LANG.getTranslation('channels')}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }
    _startCatchupFromChannelMenu(program, index) {
        var isFavorite = UTILS.getFavoriteChannel(
            this.state.selected_channel_list_single.channel_id,
        );
        var epgIndexNow = UTILS.getCurrentProgramIndex(
            this.state.selected_channel_list_single.channel_id,
        );
        var scrubberBaseIndex = epgIndexNow - index;
        var channelIndexNow = UTILS.getChannelIndex(
            this.state.selected_channel_list_single.channel_id,
        );
        UTILS.setPositionAndRow(channelIndexNow);
        this.setState({
            selected_channel: this.state.selected_channel_list_single,
            selected_channel_index: channelIndexNow,
            selected_epg: this.state.channel_list_epg,
            selected_epg_program: program,
            selected_epg_index: index,
            selected_epg_index_scrubber: index,
            selected_epg_scrubber: this.state.channel_list_epg,
            selected_epg_index_scrubber_base: scrubberBaseIndex,
            show_catchup_menu: false,
            show_channel_menu: false,
            show_channel_search: false,
            show_category_menu: false,
            channellist: false,
            favorite: isFavorite,
            live: false,
            catchup: true,
            duration: 0,
            current_time: 0,
            error: '',
            show_popup: false,
        });
        this.refreshIpAddressCatchup(
            program,
            this.state.selected_channel_list_single,
        );
    }
    _startRecordingFromChannelMenu(channel, program) {
        this.setState({
            show_catchup_menu: false,
            show_category_menu: false,
            show_channel_menu: true,
            show_channels: false,
            channellist: false,
        });
        this._toggleModalRecording(channel, program);
    }
    onPressSelectedChannel = (channel, epg_index) => {
        TimerMixin.clearTimeout(this.showEpgTimer);
        this.showEpgTimer = TimerMixin.setTimeout(() => {
            GLOBAL.EPG_Days = 0;
            var epg = [];
            var epg_index_ = 0;
            if (this.state.playing_catchup == true) {
                epg = GLOBAL.Catchup_Selected.find(
                    e => e.channel_id == channel.channel_id,
                );
                epg_index_ = this.state.selected_epg_index_catchup;
                if (epg == undefined) {
                    epg = GLOBAL.EPG.find(e => e.id == channel.channel_id);
                }
            } else {
                epg = GLOBAL.EPG.find(e => e.id == channel.channel_id);
                epg_index_ = epg_index;
            }
            GLOBAL.EPG_Selected_Row = UTILS.getCurrentProgramIndex(
                channel.channel_id,
            );
            if (GLOBAL.EPG_Selected_Row == -1) {
                GLOBAL.EPG_Selected_Row = 0;
            }
            if (epg != undefined) {
                this.setState({
                    show_catchup_menu: true,
                    show_channel_menu: true,
                    show_channel_search: false,
                    channellist: true,
                    epg_index: epg_index_,
                    channel_list_epg: epg.epgdata,
                    selected_channel_list_single: channel,
                    scrolledepg: false,
                    selected_epg_catchup_day_index: 0,
                });
            } else {
                this.startChannelById(channel.channel_id);
            }
        }, 1000);
    };
    _onPreviousDay() {
        var days = GLOBAL.EPG_Days - 1;
        if (days * -1 >= GLOBAL.UserInterface.general.epg_days) {
            return;
        }
        GLOBAL.EPG_Days = GLOBAL.EPG_Days - 1;
        TimerMixin.clearTimeout(this.dateRangeTimer);
        this.dateRangeTimer = TimerMixin.setTimeout(() => {
            this.setState({
                selected_epg_catchup_day_index: GLOBAL.EPG_Days,
                loading_epg: true,
                channel_list_epg: [],
                error_epg: false,
                scrolledepg: false,
            });
            this.loadEpgData();
        }, 500);
    }
    _onNextDay() {
        var days = GLOBAL.EPG_Days + 1;
        if (days >= GLOBAL.UserInterface.general.epg_days) {
            return;
        }

        GLOBAL.EPG_Days = GLOBAL.EPG_Days + 1;
        TimerMixin.clearTimeout(this.dateRangeTimer);
        this.dateRangeTimer = TimerMixin.setTimeout(() => {
            this.setState({
                selected_epg_catchup_day_index: GLOBAL.EPG_Days,
                loading_epg: true,
                channel_list_epg: [],
                error_epg: false,
                scrolledepg: false,
            });

            this.loadEpgData();
        }, 500);
    }
    onSelectDay(day) {
        GLOBAL.EPG_Days = day;
        this.setState({
            selected_epg_catchup_day_index: GLOBAL.EPG_Days,
            loading_epg: true,
            channel_list_epg: [],
            error_epg: false,
            scrolledepg: false,
        });
        this.loadEpgData();
    }
    _retryLoadingEpg() {
        this.setState({
            loading_epg: true,
            error_epg: false,
        });
        this.loadEpgData();
    }
    loadEpgData() {
        if (GLOBAL.EPG_Days == 0) {
            GLOBAL.Catchup_Selected = GLOBAL.EPG;
            var epg = GLOBAL.Catchup_Selected.find(
                e => e.id == this.state.selected_channel_list_single.channel_id,
            );
            this.setState({
                error_epg: false,
                loading_epg: false,
                show_catchup_menu: true,
                show_channel_menu: true,
                epg_index: 0,
                channel_list_epg: epg.epgdata,
                scrolledepg: false,
            });
        } else {
            GLOBAL.Catchup_Selected = [];
            const date = moment()
                .add(GLOBAL.EPG_Days, 'days')
                .format('DD_MM_YYYY');
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CRM +
                '/' +
                date +
                '_' +
                GLOBAL.ProductID +
                '_product_epg_v4.json?t=' +
                new Date().getTime();
            DAL.getJson(path)
                .then(data => {
                    if (data.channels != undefined) {
                        GLOBAL.Catchup_Selected = data.channels;
                        if (GLOBAL.User.products.ChannelPackages.length > 0) {
                            this.loadExtraEpg(0);
                        } else {
                            var epg = GLOBAL.Catchup_Selected.find(
                                e =>
                                    e.id ==
                                    this.state.selected_channel_list_single
                                        .channel_id,
                            );
                            this.setState({
                                error_epg: false,
                                loading_epg: false,
                                show_catchup_menu: true,
                                show_channel_menu: true,
                                epg_index: 0,
                                channel_list_epg: epg.epgdata,
                                scrolledepg: false,
                            });
                        }
                    }
                })
                .catch(error => {
                    GLOBAL.Catchup_Selected = GLOBAL.EPG;
                    this.setState({
                        loading_epg: false,
                        error_epg: true,
                    });
                });
        }
    }
    loadExtraEpg(id) {
        if (id < GLOBAL.User.products.ChannelPackages.length) {
            const date = moment()
                .add(GLOBAL.EPG_Days, 'days')
                .format('DD_MM_YYYY');
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                date +
                '_' +
                GLOBAL.User.products.ChannelPackages[id].PackageID +
                '_package_epg_v2.json?t=' +
                new Date().getTime();
            DAL.getJson(path)
                .then(data => {
                    if (data.channels != undefined) {
                        data.channels.forEach(function (element) {
                            GLOBAL.Catchup_Selected =
                                GLOBAL.Catchup_Selected.concat(element);
                        });
                        if (GLOBAL.User.products.ChannelPackages.length > 0) {
                            this.loadExtraEpg(id + 1);
                        } else {
                            var epg = GLOBAL.Catchup_Selected.find(
                                e =>
                                    e.channel_id ==
                                    this.state.selected_channel_list_single
                                        .channel_id,
                            );
                            this.setState({
                                loading_epg: false,
                                show_catchup_menu: true,
                                show_channel_menu: true,
                                epg_index: 0,
                                channel_list_epg: epg.epgdata,
                                scrolledepg: false,
                            });
                        }
                    } else {
                        var epg = GLOBAL.Catchup_Selected.find(
                            e =>
                                e.channel_id ==
                                this.state.selected_channel_list_single
                                    .channel_id,
                        );
                        this.setState({
                            loading_epg: false,
                            show_catchup_menu: true,
                            show_channel_menu: true,
                            epg_index: 0,
                            channel_list_epg: epg.epgdata,
                            scrolledepg: false,
                        });
                    }
                })
                .catch(error => {
                    GLOBAL.Catchup_Selected = GLOBAL.EPG;
                    this.setState({
                        loading_epg: false,
                        error_epg: true,
                    });
                });
        } else {
            var epg = GLOBAL.Catchup_Selected.find(
                e =>
                    e.channel_id ==
                    this.state.selected_channel_list_single.channel_id,
            );
            this.setState({
                loading_epg: false,
                show_catchup_menu: true,
                show_channel_menu: true,
                epg_index: 0,
                channel_list_epg: epg.epgdata,
                scrolledepg: false,
            });
        }
    }
    _renderChannelSingle() {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    width: this.state.channel_list_width,
                    backgroundColor: 'rgba(0, 0, 0, 0.50)',
                    borderRadius: 5,
                }}
            >
                <View
                    style={{
                        width: GLOBAL.Device_IsAppleTV ? 90 : 60,
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}
                >
                    <Image
                        source={{
                            uri:
                                GLOBAL.ImageUrlCMS +
                                this.state.selected_channel_list_single
                                    .icon_big,
                        }}
                        style={{
                            height: GLOBAL.Device_IsAppleTV ? 60 : 30,
                            width: GLOBAL.Device_IsAppleTV ? 60 : 30,
                            margin: 10,
                        }}
                    />
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ButtonCircle
                        Size={15}
                        underlayColor={GLOBAL.Button_Color}
                        Icon={"arrow-left"}
                        onPress={() => this._onPreviousDay()}
                    ></ButtonCircle>
                    <Text style={[styles.Standard, { paddingHorizontal: 20 }]}>
                        {moment().add(GLOBAL.EPG_Days, 'days').format('dddd')}
                    </Text>
                    <ButtonCircle
                        Size={15}
                        underlayColor={GLOBAL.Button_Color}
                        Icon={"arrow-right"}
                        onPress={() => this._onNextDay()}
                    ></ButtonCircle>
                </View>
                <View
                    style={{
                        width: GLOBAL.Device_IsAppleTV ? 90 : 60,
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ButtonCircle
                        Size={15}
                        underlayColor={GLOBAL.Button_Color}
                        Icon={"times-circle"}
                        onPress={() =>
                            this.setState({
                                show_catchup_menu: false,
                            })
                        }
                    ></ButtonCircle>
                </View>
            </View>
        );
    }
    _setFocusOnFirst_(index) {
        if (
            !this.firstInitFocus &&
            GLOBAL.Device_IsTV == true &&
            index == this.state.channel_index + 4
        ) {
            this.firstInitFocus = true;
            return true; //(index == 0);
        }
        return false;
    }
    _getItemLayout = (data, index) => ({
        length: 85,
        offset: 85 * index,
        index,
    });
    getScrollIndex() {
        return this.state.selected_channels.length >= this.state.channel_index
            ? this.state.channel_index
            : 0;
    }
    focusSearchBox = () => {
        if (GLOBAL.Device_IsTV == true) {
            if (this.searchall != null) {
                this.searchall.focus();
            }
        }
    };
    onChangeText = value => {
        this.setState({ channel_search_term: value });
    };
    onChangeText_ = value => {
        this.setState({ channel_search_term: value });
    };
    onSubmitEditing = () => {
        this.searchContent(this.state.channel_search_term);
    };
    searchContent(searchTerm) {
        if (searchTerm == undefined) {
            return;
        }
        if (searchTerm.length < 2) {
            return;
        }
        searchTerm = searchTerm.toLowerCase();
        var search = this.state.selected_channels.filter(
            c => c.name.toLowerCase().indexOf(searchTerm) > -1,
        );
        this.setState({
            show_channel_search: true,
            channels_search: search,
            scrolledsearch: false,
            search_focus: true,
        });
    }
    closeQuad() {
        this.setState({
            quadview: false,
            quadviewbuttons: false,
            tochable: true,
            back_focus: this.state.back_focus == false ? true : false,
            play_focus: this.state.play_focus == true ? false : true,
            selected_channel_index_quad1: 0,
            selected_channel_index_quad2: 0,
            selected_channel_index_quad3: 0,
            selected_channel_index_quad4: 0,
        });
        this.startChannel(0);
    }
    muteQuadPlayer(player) {
        if (player == 1) {
            this.setState({
                quadmute1: false,
                quadmute2: true,
                quadmute3: true,
                quadmute4: true,
            });
        }
        if (player == 2) {
            this.setState({
                quadmute2: false,
                quadmute1: true,
                quadmute3: true,
                quadmute4: true,
            });
        }
        if (player == 3) {
            this.setState({
                quadmute3: false,
                quadmute1: true,
                quadmute2: true,
                quadmute4: true,
            });
        }
        if (player == 4) {
            this.setState({
                quadmute4: false,
                quadmute1: true,
                quadmute2: true,
                quadmute3: true,
            });
        }
    }
    _onPressProblemReport(desc) {
        DAL.setProblemReportContent(
            'Channel',
            this.state.selected_channel.name,
            this.state.selected_channel.channel_id,
            desc,
        );
        // REPORT.set({
        //     key: 'problem',
        //     type: 34,
        //     id: this.state.selected_channel.channel_id,
        //     name: this.state.selected_channel.name + ' [Channel] ' + '[' + desc + ']'
        // });
        this.setState({
            //show_popup: false,
            //button_support: false,
            button_thanks: true,
        });
        TimerMixin.clearTimeout(this.resumeTimer);
        this.resumeTimer = TimerMixin.setTimeout(() => {
            this.setState({
                button_thanks: false,
                //show_popup: false
            });
            this.fadeBackOut();
        }, 5000);
    }
    onSwipe(gestureName, gestureState) {
        if (this.state.show_sleepmode == true) {
            TimerMixin.clearInterval(this.sleepModeTimer);
            this.setState({
                show_sleepmode: false,
            });
            this.startSleepModeTimer();
            return;
        }
        const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
        this.setState({ gestureName: gestureName });
        switch (gestureName) {
            case SWIPE_UP:
                break;
            case SWIPE_DOWN:
                break;
            case SWIPE_LEFT:
                break;
            case SWIPE_RIGHT:
                break;
        }
    }
    getRecordedOrNot(updown) {
        if (this.state.selected_epg_scrubber != undefined) {
            if (
                this.state.selected_epg_scrubber[
                this.state.selected_epg_index_scrubber + updown
                ] != undefined
            ) {
                var s =
                    this.state.selected_epg_scrubber[
                        this.state.selected_epg_index_scrubber + updown
                    ].s;
                var e =
                    this.state.selected_epg_scrubber[
                        this.state.selected_epg_index_scrubber + updown
                    ].e;
                var n =
                    this.state.selected_epg_scrubber[
                        this.state.selected_epg_index_scrubber + updown
                    ].n;
                var recorded = UTILS.getRecording(s, e, n);
                if (recorded == true) {
                    return (
                        <View
                            style={{
                                backgroundColor: 'crimson',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 100,
                                marginHorizontal: 5,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[styles.IconsMenu, { color: '#fff' }]}
                                // icon={RegularIcons.dotCircle}
                                name="dot-circle"
                            />
                        </View>
                    );
                } else {
                    return (
                        <View
                            style={{
                                backgroundColor: 'crimson',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 100,
                                marginHorizontal: 5,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[styles.IconsMenu, { color: '#fff' }]}
                                // icon={RegularIcons.dotCircle}
                                name="dot-circle"
                            />
                        </View>
                    );
                }
            } else {
                return (
                    <View
                        style={{
                            backgroundColor: 'crimson',
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 100,
                            marginHorizontal: 5,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[styles.IconsMenu, { color: '#fff' }]}
                            // icon={RegularIcons.dotCircle}
                            name="dot-circle"
                        />
                    </View>
                );
            }
        } else {
            return (
                <View
                    style={{
                        backgroundColor: 'crimson',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 100,
                        marginHorizontal: 5,
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}
                >
                    <FontAwesome5
                        style={[styles.IconsMenu, { color: '#fff' }]}
                        // icon={RegularIcons.dotCircle}
                        name="dot-circle"
                    />
                </View>
            );
        }
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
    loadCasting = dataFromChild => {
        value = dataFromChild[0];
        setValue = dataFromChild[1];
    };
    render() {
        let { fadeAnim } = this.state;
        const barWidth = Dimensions.get('screen').width;
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
        };
        return (
            <View style={styles.fullScreen_Bg}>
                {RenderIf(
                    this.state.show_ticker &&
                    this.state.quadview == false &&
                    !this.state.button_screensize &&
                    !this.state.button_subtitles &&
                    !this.state.button_audio,
                )(
                    <View
                        ref={ref => {
                            this.ticker = ref;
                        }}
                        style={{
                            zIndex: 99999,
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
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
                            backgroundColor: 'tranparent',
                            width: '100%',
                            height: Dimensions.get('window').height / 3,
                            position: 'absolute',
                            zIndex: 10000,
                            top: Dimensions.get('window').height / 5,
                        }}
                    ></GestureRecognizer>,
                )}

                {RenderIf(
                    this.state.player_type == 'exo' &&
                    this.state.quadview == false &&
                    this.state.stream != GLOBAL.HTTPvsHTTPS + '',
                )(
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
                            drm: TOKEN.getDrmSetup(
                                this.state.drmSupplierType,
                                this.state.drmLicenseServerUrl,
                                this.state.drmCertificateUrl,
                                this.state.drmKey,
                            ),
                        }}
                        bufferConfig={this.state.buffer_config}
                        //seek={parseFloat(this.state.seek)}
                        vast={this.state.vast}
                        streamType={'TV'}
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
                        useTextureView={false}
                        channelup={() => this.startChannel(1)}
                        channeldown={() => this.startChannel(-1)}
                    />,
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
                            source={require('../../../images/side_panel_itv.png')}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 5,
                                    right: 5,
                                    zIndex: 99999,
                                }}
                            >
                                <ButtonCircle
                                    hasTVPreferredFocus={true}
                                    Rounded={true}
                                    underlayColor={GLOBAL.Button_Color}
                                    Icon={"window-close"}
                                    Size={25}
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
                                <TouchableWithoutFeedback>
                                    <Text numberOfLines={1} style={styles.H2}>
                                        {LANG.getTranslation('childlock')}
                                    </Text>
                                    <Text
                                        style={[styles.Medium, { color: '#fff' }]}
                                    >
                                        {LANG.getTranslation(
                                            'parental_explanation_channels',
                                        )}
                                    </Text>
                                </TouchableWithoutFeedback>
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
                            left: 10,
                            top: 10,
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
                                width:
                                    GLOBAL.Device_IsAppleTV ||
                                        GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen'
                                        ? 300
                                        : 200,
                                height:
                                    GLOBAL.Device_IsAppleTV ||
                                        GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen'
                                        ? 60
                                        : 40,
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

                {RenderIf(
                    this.state.show_overlay &&
                    this.state.quadview == false &&
                    !this.state.button_screensize &&
                    !this.state.button_subtitles &&
                    !this.state.button_audio,
                )(
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

                {RenderIf(
                    this.state.show_watermark &&
                    !this.state.button_screensize &&
                    !this.state.button_subtitles &&
                    !this.state.button_audio,
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
                            top: this.state.watermark_x,
                            left: this.state.watermark_y,
                        }}
                    >
                        <View
                            style={{
                                marginTop: 10,
                                paddingTop: 25,
                                paddingBottom: 25,
                                marginLeft: 30,
                                marginRight: 30,
                                borderRadius: 5,
                                borderWidth: 5,
                                borderColor: 'crimson',
                                backgroundColor: 'rgba(0, 0, 0, 0.73)',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View>
                                <Text
                                    style={[styles.H2, { marginHorizontal: 30 }]}
                                >
                                    {GLOBAL.Device_UniqueID}
                                </Text>
                            </View>
                        </View>
                    </View>,
                )}
                {RenderIf(this.state.show_sleepmode)(
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
                        <View
                            style={{
                                marginTop: 10,
                                paddingTop: 25,
                                paddingBottom: 25,
                                marginLeft: 30,
                                marginRight: 30,
                                borderRadius: 5,
                                borderWidth: 5,
                                borderColor: 'crimson',
                                backgroundColor: 'rgba(0, 0, 0, 0.73)',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View>
                                <Text
                                    style={[styles.H2, { marginHorizontal: 30 }]}
                                >
                                    {LANG.getTranslation(
                                        'sleep_mode_enabled',
                                    ).toUpperCase()}{' '}
                                    ({this.state.remaining})
                                </Text>
                            </View>
                        </View>
                    </View>,
                )}
                {RenderIf(
                    this.state.button_record_fail == true &&
                    this.state.show_childlock == false,
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
                                    borderColor: 'crimson',

                                    backgroundColor: 'rgba(0, 0, 0, 0.73)',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View>
                                    <Text
                                        style={[
                                            styles.H5,
                                            { paddingHorizontal: 20 },
                                        ]}
                                    >
                                        {LANG.getTranslation(
                                            'recording_failed',
                                        )}
                                        {this.state.current_program.n}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>,
                )}

                {RenderIf(
                    this.state.button_record_requested == true &&
                    this.state.show_childlock == false,
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
                                    backgroundColor: 'rgba(0, 0, 0, 0.73)',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View>
                                    <Text
                                        style={[
                                            styles.H5,
                                            { paddingHorizontal: 20 },
                                        ]}
                                    >
                                        {LANG.getTranslation(
                                            'recording_requested',
                                        )}{' '}
                                        {this.state.current_program.n}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>,
                )}
                {RenderIf(
                    this.state.button_record == true &&
                    this.state.show_childlock == false,
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

                                    backgroundColor: 'rgba(0, 0, 0, 0.73)',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View>
                                    <Text
                                        style={[
                                            styles.H5,
                                            { paddingHorizontal: 20 },
                                        ]}
                                    >
                                        {LANG.getTranslation(
                                            'recording_success',
                                        )}
                                        {this.state.current_program.n}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>,
                )}
                {RenderIf(this.state.show_zapper == true)(
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            zIndex: 99999,
                            top: 20,
                            right: 20,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                height: 130,
                                width: 130,
                                marginRight: 20,
                                borderRadius: 5,
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={styles.H00}>
                                {
                                    this.state.selected_channel_zapper
                                        .channel_number
                                }
                            </Text>
                        </View>
                        <View
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                height: 130,
                                width: 130,
                                borderRadius: 5,
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                source={{
                                    uri:
                                        GLOBAL.ImageUrlCMS +
                                        this.state.selected_channel_zapper
                                            .icon_big,
                                }}
                                style={{ width: 75, height: 75, padding: 20 }}
                            />
                        </View>
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
                    {RenderIf(
                        this.state.channellist == true &&
                        this.state.quadview == false &&
                        this.state.button_subtitles == false &&
                        this.state.button_audio == false &&
                        this.state.button_screensize == false,
                    )(
                        <View
                            style={{
                                height: GLOBAL.ROW_1,
                                flexDirection: 'row',
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
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() =>
                                            this.setState({
                                                show_category_menu: true,
                                                show_channel_menu: false,
                                                show_channel_search: false,
                                                show_catchup_menu: false,
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
                                                        'categories',
                                                    )}
                                                </Text>,
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>

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
                                                show_channel_search: false,
                                                show_catchup_menu: false,
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
                                                    {LANG.getTranslation(
                                                        'channels',
                                                    )}
                                                </Text>,
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>

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
                                        onPress={() =>
                                            this.setState({
                                                show_category_menu: false,
                                                show_channel_menu: true,
                                                show_channel_search: true,
                                                show_catchup_menu: false,
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
                                                // icon={SolidIcons.search}
                                                name="search"
                                            />
                                            {RenderIf(
                                                GLOBAL.Device_IsPhone == false,
                                            )(
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.Medium}
                                                >
                                                    {LANG.getTranslation(
                                                        'search',
                                                    )}
                                                </Text>,
                                            )}
                                        </View>
                                    </TouchableHighlightFocus>
                                </View>

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
                                        onPress={() =>
                                            this.setState({
                                                show_category_menu: false,
                                                show_channel_menu: false,
                                                show_channel_search: false,
                                                show_catchup_menu: false,
                                                channellist: false,
                                                show_popup: false,
                                                miniepg: false,
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
                                                // icon={RegularIcons.timesCircle}
                                                name="times-circle"
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
                                                            this.state
                                                                .selected_channels
                                                        }
                                                        Width={
                                                            this.state
                                                                .channel_list_width
                                                        }
                                                        Type={'TV'}
                                                        Player={true}
                                                        Columns={1}
                                                        getItemLayout={(
                                                            data,
                                                            index,
                                                        ) => {
                                                            return {
                                                                length:
                                                                    GLOBAL.ROW_5 -
                                                                    5,
                                                                index,
                                                                offset:
                                                                    (GLOBAL.ROW_5 -
                                                                        5) *
                                                                    index,
                                                            };
                                                        }}
                                                        onPress={(
                                                            item,
                                                            index,
                                                        ) =>
                                                            this.onPressSelectedChannel(
                                                                item,
                                                                index,
                                                            )
                                                        }
                                                    />
                                                </View>
                                            </View>,
                                        )}

                                        {RenderIf(this.state.show_catchup_menu)(
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        width:
                                                            this.state
                                                                .channel_list_width +
                                                            8,
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.50)',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            borderRadius: 5,
                                                            marginLeft: 4,
                                                            marginTop: 5,
                                                            height: 50,
                                                            flexDirection:
                                                                'row',
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.50)',
                                                            width: this.state
                                                                .channel_list_width,
                                                        }}
                                                    >
                                                        {this._renderChannelSingle()}
                                                    </View>
                                                    <View
                                                        style={{
                                                            height: 5,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.00)',
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                        }}
                                                    ></View>
                                                    {RenderIf(
                                                        this.state
                                                            .loading_epg ==
                                                        true,
                                                    )(
                                                        <View
                                                            style={{
                                                                alignContent:
                                                                    'center',
                                                                alignItems:
                                                                    'center',
                                                                alignSelf:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            <Loader
                                                                size={'large'}
                                                                color={
                                                                    '#e0e0e0'
                                                                }
                                                            />
                                                        </View>,
                                                    )}
                                                    {RenderIf(
                                                        this.state.error_epg ==
                                                        true,
                                                    )(
                                                        <View
                                                            style={{
                                                                backgroundColor:
                                                                    'rgba(0, 0, 0, 0.60)',
                                                                padding: 20,
                                                                flexDirection:
                                                                    'row',
                                                                alignContent:
                                                                    'center',
                                                                alignItems:
                                                                    'center',
                                                                alignSelf:
                                                                    'center',
                                                                justifyContent:
                                                                    'center',
                                                                marginTop: 100,
                                                            }}
                                                        >
                                                            <TouchableHighlightFocus
                                                                disabled={
                                                                    GLOBAL.Device_IsTV
                                                                }
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                hasTVPreferredFocus={
                                                                    false
                                                                }
                                                                onPress={() =>
                                                                    this._retryLoadingEpg()
                                                                }
                                                            >
                                                                <View
                                                                    style={{
                                                                        flexDirection:
                                                                            'column',
                                                                        alignContent:
                                                                            'center',
                                                                        alignItems:
                                                                            'center',
                                                                        alignSelf:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <FontAwesome5
                                                                        style={[
                                                                            styles.IconsMenu,
                                                                            {
                                                                                color: '#fff',
                                                                                margin: 5,
                                                                            },
                                                                        ]}
                                                                        // icon={
                                                                        //     SolidIcons.sync
                                                                        // }
                                                                        name="sync"
                                                                    />
                                                                    <Text
                                                                        style={
                                                                            styles.Small
                                                                        }
                                                                    >
                                                                        {LANG.getTranslation(
                                                                            'retry_loading',
                                                                        )}
                                                                    </Text>
                                                                </View>
                                                            </TouchableHighlightFocus>
                                                        </View>,
                                                    )}
                                                    <View style={{ flex: 1 }}>
                                                        <EpgList
                                                            EPG={
                                                                this.state
                                                                    .channel_list_epg
                                                            }
                                                            Width={
                                                                this.state
                                                                    .channel_list_width
                                                            }
                                                            Channel={
                                                                this.state
                                                                    .selected_channel_list_single
                                                            }
                                                            CurrentProgram={
                                                                this.state
                                                                    .current_program
                                                            }
                                                            RecordRequest={
                                                                this.state
                                                                    .button_record_requested
                                                            }
                                                            Record={
                                                                this.state
                                                                    .button_record
                                                            }
                                                            getItemLayout={(
                                                                data,
                                                                index,
                                                            ) => {
                                                                return {
                                                                    length: 50,
                                                                    index,
                                                                    offset:
                                                                        50 *
                                                                        index,
                                                                };
                                                            }}
                                                            _startCatchupFromChannelMenu={
                                                                this
                                                                    ._startCatchupFromChannelMenu
                                                            }
                                                            startChannelById={
                                                                this
                                                                    .startChannelById
                                                            }
                                                            recordProgram={
                                                                this
                                                                    .recordProgram
                                                            }
                                                        />
                                                    </View>
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
                                                                GLOBAL.Device_IsWebTV ==
                                                                true &&
                                                                GLOBAL.Device_IsSmartTV ==
                                                                false,
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
                                                                    //onChangeText={value => this.setState({ channel_search_term: value })}
                                                                    Width={
                                                                        this
                                                                            .state
                                                                            .channel_list_width
                                                                    }
                                                                    isTV={true}
                                                                    onChangeText={value =>
                                                                        this.searchContent(
                                                                            value,
                                                                        )
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                GLOBAL.Device_IsSmartTV ||
                                                                GLOBAL.Device_IsAppleTV ||
                                                                GLOBAL.Device_IsSTB ||
                                                                GLOBAL.Device_IsFireTV ||
                                                                GLOBAL.Device_IsAndroidTV ||
                                                                GLOBAL.Device_IsPhone ||
                                                                GLOBAL.Device_IsTablet,
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
                                                                    Margin={
                                                                        GLOBAL.Device_IsPhone
                                                                            ? 0
                                                                            : 10
                                                                    }
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
                                                            Type={'Big'}
                                                            Player={true}
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
                                                            onPress={(
                                                                item,
                                                                index,
                                                            ) =>
                                                                this.onPressSelectedChannel(
                                                                    item,
                                                                    index,
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
                    {RenderIf(this.state.quadview == true)(
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                position: 'absolute',
                                zIndex: 9999,
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View
                                    style={{
                                        flex: 1,
                                        borderRightWidth: 2,
                                        borderRightColor: GLOBAL.Button_Color,
                                        borderBottomWidth: 2,
                                        borderBottomColor: GLOBAL.Button_Color,
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Video
                                            ref={ref => {
                                                this.player1 = ref;
                                            }}
                                            source={{
                                                uri: this.state.quadstream1,
                                                type: this.state.quadtype1,
                                                ref: 'player1',
                                                // headers: {
                                                //     'User-Agent': GLOBAL.User_Agent
                                                // },
                                                // drm: {
                                                //     type: GLOBAL.Device_System == "Apple" ? DRMType.FAIRPLAY : DRMType.WIDEVINE,
                                                //     licenseServer: GLOBAL.DrmKeyServerUrl,
                                                //     headers: {
                                                //         'customData': this.state.quaddrmKey1
                                                //     }
                                                // }
                                            }}
                                            resizeMode={'contain'}
                                            disableFocus={false}
                                            style={styles.quadScreen}
                                            paused={false}
                                            repeat={false}
                                            playInBackground={false}
                                            playWhenInactive={false}
                                            useTextureView={true}
                                            muted={this.state.quadmute1}
                                        //streamType={'TV'}
                                        />
                                    </View>
                                    {RenderIf(
                                        this.state.quadviewbuttons == true,
                                    )(
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.80)',
                                                position: 'relative',
                                                top: 0,
                                                width: '100%',
                                                zIndex: 9999,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent:
                                                        'flex-start',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={
                                                        "times-circle"
                                                    }
                                                    onPress={() =>
                                                        this.closeQuad()
                                                    }
                                                ></ButtonCircle>
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
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <ButtonCircle
                                                        hasTVPreferredFocus={
                                                            this.state
                                                                .quadviewbuttons
                                                        }
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            "arrow-left"
                                                        }
                                                        onPress={() =>
                                                            this.getChannelQuad(
                                                                -1,
                                                                1,
                                                            )
                                                        }
                                                    ></ButtonCircle>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <Image
                                                        source={{
                                                            uri:
                                                                GLOBAL.ImageUrlCMS +
                                                                this.state
                                                                    .selected_channel_quad1
                                                                    .icon_big,
                                                        }}
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            margin: 10,
                                                        }}
                                                    />
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[
                                                            styles.H4,
                                                            { paddingBottom: 10 },
                                                        ]}
                                                    >
                                                        {
                                                            this.state
                                                                .selected_channel_quad1
                                                                .channel_number
                                                        }
                                                        .{' '}
                                                        {
                                                            this.state
                                                                .selected_channel_quad1
                                                                .name
                                                        }
                                                    </Text>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <ButtonCircle
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            "arrow-right"
                                                        }
                                                        onPress={() =>
                                                            this.getChannelQuad(
                                                                1,
                                                                1,
                                                            )
                                                        }
                                                    ></ButtonCircle>
                                                </View>
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={
                                                        this.state.quadmute1
                                                            ? "volume-mute"
                                                            : "volume-up"
                                                    }
                                                    onPress={() =>
                                                        this.muteQuadPlayer(1)
                                                    }
                                                ></ButtonCircle>
                                            </View>
                                        </View>,
                                    )}
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        borderBottomWidth: 2,
                                        borderBottomColor: GLOBAL.Button_Color,
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Video
                                            ref={ref => {
                                                this.player2 = ref;
                                            }}
                                            source={{
                                                uri: this.state.quadstream2,
                                                type: this.state.quadtype2,

                                                ref: 'player2',
                                                // headers: {
                                                //     'User-Agent': GLOBAL.User_Agent
                                                // },
                                                // drm: {
                                                //     type: GLOBAL.Device_System == "Apple" ? DRMType.FAIRPLAY : DRMType.WIDEVINE,
                                                //     licenseServer: GLOBAL.DrmKeyServerUrl,
                                                //     headers: {
                                                //         'customData': this.state.quaddrmKey2
                                                //     }
                                                // }
                                            }}
                                            resizeMode={'contain'}
                                            disableFocus={false}
                                            style={styles.quadScreen}
                                            paused={false}
                                            repeat={false}
                                            playInBackground={false}
                                            playWhenInactive={false}
                                            useTextureView={true}
                                            muted={this.state.quadmute2}
                                        />
                                    </View>
                                    {RenderIf(
                                        this.state.quadviewbuttons == true,
                                    )(
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.80)',
                                                position: 'relative',
                                                top: 0,
                                                width: '100%',
                                                zIndex: 9999,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent:
                                                        'flex-start',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={
                                                        "times-circle"
                                                    }
                                                    onPress={() =>
                                                        this.closeQuad()
                                                    }
                                                ></ButtonCircle>
                                            </View>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <ButtonCircle
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            "arrow-left"
                                                        }
                                                        onPress={() =>
                                                            this.getChannelQuad(
                                                                -1,
                                                                2,
                                                            )
                                                        }
                                                    ></ButtonCircle>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <Image
                                                        source={{
                                                            uri:
                                                                GLOBAL.ImageUrlCMS +
                                                                this.state
                                                                    .selected_channel_quad2
                                                                    .icon_big,
                                                        }}
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            margin: 10,
                                                        }}
                                                    />
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[
                                                            styles.H4,
                                                            { paddingBottom: 10 },
                                                        ]}
                                                    >
                                                        {
                                                            this.state
                                                                .selected_channel_quad2
                                                                .channel_number
                                                        }
                                                        .{' '}
                                                        {
                                                            this.state
                                                                .selected_channel_quad2
                                                                .name
                                                        }
                                                    </Text>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <ButtonCircle
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            "arrow-right"
                                                        }
                                                        onPress={() =>
                                                            this.getChannelQuad(
                                                                1,
                                                                2,
                                                            )
                                                        }
                                                    ></ButtonCircle>
                                                </View>
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={
                                                        this.state.quadmute2
                                                            ? "volume-mute"
                                                            : "volume-up"
                                                    }
                                                    onPress={() =>
                                                        this.muteQuadPlayer(2)
                                                    }
                                                ></ButtonCircle>
                                            </View>
                                        </View>,
                                    )}
                                </View>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row' }}>
                                <View
                                    style={{
                                        flex: 1,
                                        borderRightWidth: 2,
                                        borderRightColor: GLOBAL.Button_Color,
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Video
                                            ref={ref => {
                                                this.player3 = ref;
                                            }}
                                            source={{
                                                uri: this.state.quadstream3,
                                                type: this.state.quadtype3,
                                                ref: 'player3',
                                                // headers: {
                                                //     'User-Agent': GLOBAL.User_Agent
                                                // },
                                                // drm: {
                                                //     type: GLOBAL.Device_System == "Apple" ? DRMType.FAIRPLAY : DRMType.WIDEVINE,
                                                //     licenseServer: GLOBAL.DrmKeyServerUrl,
                                                //     headers: {
                                                //         'customData': this.state.quaddrmKey3
                                                //     }
                                                // }
                                            }}
                                            resizeMode={'contain'}
                                            disableFocus={false}
                                            style={styles.quadScreen}
                                            paused={false}
                                            repeat={false}
                                            playInBackground={false}
                                            playWhenInactive={false}
                                            useTextureView={true}
                                            muted={this.state.quadmute3}
                                        //streamType={'TV'}
                                        />
                                    </View>
                                    {RenderIf(
                                        this.state.quadviewbuttons == true,
                                    )(
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.80)',
                                                position: 'relative',
                                                top: 0,
                                                width: '100%',
                                                zIndex: 9999,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent:
                                                        'flex-start',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={
                                                        "times-circle"
                                                    }
                                                    onPress={() =>
                                                        this.closeQuad()
                                                    }
                                                ></ButtonCircle>
                                            </View>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <ButtonCircle
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            "arrow-left"
                                                        }
                                                        onPress={() =>
                                                            this.getChannelQuad(
                                                                -1,
                                                                3,
                                                            )
                                                        }
                                                    ></ButtonCircle>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <Image
                                                        source={{
                                                            uri:
                                                                GLOBAL.ImageUrlCMS +
                                                                this.state
                                                                    .selected_channel_quad3
                                                                    .icon_big,
                                                        }}
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            margin: 10,
                                                        }}
                                                    />
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[
                                                            styles.H4,
                                                            { paddingBottom: 10 },
                                                        ]}
                                                    >
                                                        {
                                                            this.state
                                                                .selected_channel_quad3
                                                                .channel_number
                                                        }
                                                        .{' '}
                                                        {
                                                            this.state
                                                                .selected_channel_quad3
                                                                .name
                                                        }
                                                    </Text>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <ButtonCircle
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            "arrow-right"
                                                        }
                                                        onPress={() =>
                                                            this.getChannelQuad(
                                                                1,
                                                                3,
                                                            )
                                                        }
                                                    ></ButtonCircle>
                                                </View>
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={
                                                        this.state.quadmute3
                                                            ? "volume-mute"
                                                            : "volume-up"
                                                    }
                                                    onPress={() =>
                                                        this.muteQuadPlayer(3)
                                                    }
                                                ></ButtonCircle>
                                            </View>
                                        </View>,
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flex: 1 }}>
                                        <Video
                                            ref={ref => {
                                                this.player4 = ref;
                                            }}
                                            source={{
                                                uri: this.state.quadstream4,
                                                type: this.state.quadtype4,

                                                ref: 'player4',
                                                // headers: {
                                                //     'User-Agent': GLOBAL.User_Agent
                                                // },

                                                // drm: {
                                                //     type: GLOBAL.Device_System == "Apple" ? DRMType.FAIRPLAY : DRMType.WIDEVINE,
                                                //     licenseServer: GLOBAL.DrmKeyServerUrl,
                                                //     headers: {
                                                //         'customData': this.state.quaddrmKey1
                                                //     }
                                                // }
                                            }}
                                            resizeMode={'contain'}
                                            disableFocus={false}
                                            style={styles.quadScreen}
                                            paused={false}
                                            repeat={false}
                                            playInBackground={false}
                                            playWhenInactive={false}
                                            useTextureView={true}
                                            muted={this.state.quadmute4}
                                        //streamType={'TV'}
                                        />
                                    </View>
                                    {RenderIf(
                                        this.state.quadviewbuttons == true,
                                    )(
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.80)',
                                                position: 'relative',
                                                bottom: 0,
                                                width: '100%',
                                                zIndex: 9999,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent:
                                                        'flex-start',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={
                                                        "times-circle"
                                                    }
                                                    onPress={() =>
                                                        this.closeQuad()
                                                    }
                                                ></ButtonCircle>
                                            </View>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <ButtonCircle
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            "arrow-left"
                                                        }
                                                        onPress={() =>
                                                            this.getChannelQuad(
                                                                -1,
                                                                4,
                                                            )
                                                        }
                                                    ></ButtonCircle>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <Image
                                                        source={{
                                                            uri:
                                                                GLOBAL.ImageUrlCMS +
                                                                this.state
                                                                    .selected_channel_quad4
                                                                    .icon_big,
                                                        }}
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            margin: 10,
                                                        }}
                                                    />

                                                    <Text
                                                        numberOfLines={1}
                                                        style={[
                                                            styles.H4,
                                                            { paddingBottom: 10 },
                                                        ]}
                                                    >
                                                        {
                                                            this.state
                                                                .selected_channel_quad4
                                                                .channel_number
                                                        }
                                                        .{' '}
                                                        {
                                                            this.state
                                                                .selected_channel_quad4
                                                                .name
                                                        }
                                                    </Text>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <ButtonCircle
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            "arrow-right"
                                                        }
                                                        onPress={() =>
                                                            this.getChannelQuad(
                                                                1,
                                                                4,
                                                            )
                                                        }
                                                    ></ButtonCircle>
                                                </View>
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <ButtonCircle
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    Icon={
                                                        this.state.quadmute4
                                                            ? "volume-mute"
                                                            : "volume-up"
                                                    }
                                                    onPress={() =>
                                                        this.muteQuadPlayer(4)
                                                    }
                                                ></ButtonCircle>
                                            </View>
                                        </View>,
                                    )}
                                </View>
                            </View>
                        </View>,
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
                                                    this.state.button_audio ==
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
                                </View>
                            )}
                        </View>,
                    )}
                    {RenderIf(
                        !GLOBAL.Device_IsWebTV &&
                        !this.state.channellist &&
                        !this.state.controls &&
                        !this.state.show_zapper &&
                        !this.state.show_childlock &&
                        !this.state.show,
                    )(
                        <TouchableOpacity
                            ref={e => (this.channellistbutton = e)}
                            style={{
                                flex: 1,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'transparent',
                            }}
                            hasTVPreferredFocus={true}
                            activeOpacity={1}
                            underlayColor={'transparent'}
                            onMouseMove={() =>
                                this.state.show == false ? this.fadeIn() : null
                            }
                            onPress={() =>
                                GLOBAL.Device_IsWebTV
                                    ? null
                                    : this.toggleChannelList()
                            }
                        ></TouchableOpacity>,
                    )}
                    {RenderIf(!this.state.miniepg && !GLOBAL.Device_IsWebTV)(
                        <TouchableOpacity
                            ref={e => (this.channellistbutton = e)}
                            style={{
                                flex: 1,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'transparent',
                            }}
                            hasTVPreferredFocus={true}
                            activeOpacity={1}
                            underlayColor={'transparent'}
                            onMouseMove={() =>
                                this.state.show == false ? this.fadeIn() : null
                            }
                            onPress={() =>
                                GLOBAL.Device_IsWebTV
                                    ? null
                                    : this.toggleChannelList()
                            }
                        ></TouchableOpacity>,
                    )}

                    {RenderIf(
                        !this.state.channellist && !GLOBAL.Device_IsWebTV,
                    )(
                        <View
                            style={{
                                position: 'absolute',
                                flexDirection: 'row',
                                backgroundColor: 'transparent',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {this._controlsDefault()}
                        </View>,
                    )}
                    {RenderIf(
                        !this.state.channellist && GLOBAL.Device_IsSmartTV,
                    )(
                        <View
                            style={{
                                position: 'absolute',
                                flexDirection: 'row',
                                backgroundColor: 'transparent',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {this._controlsDefault()}
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
    _controls() {
        return this._controlsDefault();
    }
    _controlsDefault() {
        return (
            <View
                style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                }}
            >
                {RenderIf(this.state.controls)(
                    <ImageBackground
                        style={{ flex: 1, width: null, height: null }}
                        imageStyle={{ resizeMode: 'cover' }}
                        source={require('../../../images/playertv_bg.png')}
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
                            {RenderIf(
                                this.state.quadview == false &&
                                this.state.channellist == false,
                            )(
                                <View
                                    pointerEvents={'box-none'}
                                    style={{
                                        flex: 1,
                                        flexDirection: 'column',
                                        padding: 10,
                                    }}
                                >
                                    <View
                                        pointerEvents={'box-none'}
                                        style={{ flex: 1 }}
                                    >
                                        <View style={{ flexDirection: 'row' }}>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                {RenderIf(
                                                    this.state
                                                        .show_buttons_controller ==
                                                    true &&
                                                    GLOBAL.UserInterface
                                                        .player
                                                        .enable_catchup_buttons ==
                                                    true,
                                                )(
                                                    <ButtonAutoSize
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            // SolidIcons.arrowLeft
                                                            "arrow-left"
                                                        }
                                                        onPress={() =>
                                                            this.getBack(true)
                                                        }
                                                        Text={LANG.getTranslation(
                                                            'back',
                                                        )}
                                                    />,
                                                )}
                                                {RenderIf(
                                                    this.state
                                                        .show_buttons_controller ==
                                                    true &&
                                                    GLOBAL.UserInterface
                                                        .player
                                                        .enable_catchup_buttons ==
                                                    false,
                                                )(
                                                    <ButtonCircle
                                                        hasTVPreferredFocus={
                                                            this.state
                                                                .back_focus
                                                        }
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            // SolidIcons.arrowLeft
                                                            "arrow-left"
                                                        }
                                                        onPress={() =>
                                                            this.getBack(true)
                                                        }
                                                    ></ButtonCircle>,
                                                )}
                                                {RenderIf(
                                                    this.state.show_numeric,
                                                )(
                                                    <View
                                                        ref={ref => {
                                                            this.numeric = ref;
                                                        }}
                                                        style={{
                                                            marginTop: 10,
                                                            paddingTop: 15,
                                                            paddingBottom: 15,
                                                            marginLeft: 30,
                                                            marginRight: 30,
                                                            borderRadius: 5,
                                                            borderWidth: 3,
                                                            borderColor:
                                                                this.state
                                                                    .numeric_color,
                                                            width: 200,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.73)',
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <Text style={styles.H0}>
                                                            {
                                                                this.state
                                                                    .numeric_number
                                                            }
                                                        </Text>
                                                    </View>,
                                                )}
                                            </View>
                                            <View style={{ flex: 1 }}></View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                }}
                                            >
                                                {RenderIf(
                                                    GLOBAL.Device_IsSmartTV ==
                                                    false &&
                                                    this.state
                                                        .show_childlock ==
                                                    false &&
                                                    this.state
                                                        .show_buttons_controller ==
                                                    true &&
                                                    GLOBAL.UserInterface
                                                        .player
                                                        .enable_channel_menu ==
                                                    true,
                                                )(
                                                    <ButtonCircle
                                                        Size={25}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={"th"}
                                                        onPress={() =>
                                                            this.toggleChannelList()
                                                        }
                                                    ></ButtonCircle>,
                                                )}
                                                {RenderIf(
                                                    GLOBAL.Device_IsSmartTV ==
                                                    false &&
                                                    this.state
                                                        .show_childlock ==
                                                    false &&
                                                    GLOBAL.Device_Model !=
                                                    'p212' &&
                                                    GLOBAL.Device_Model !=
                                                    'NETCOM' &&
                                                    GLOBAL.Device_System !=
                                                    'Apple' &&
                                                    GLOBAL.Device_IsWebTV ==
                                                    false &&
                                                    GLOBAL.Device_IsPhone ==
                                                    false &&
                                                    this.state
                                                        .show_buttons_controller ==
                                                    true &&
                                                    this.state
                                                        .selected_channels
                                                        .length >= 4 &&
                                                    GLOBAL.UserInterface
                                                        .player
                                                        .enable_quadview !=
                                                    false,
                                                )(
                                                    <ButtonCircle
                                                        Size={25}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            // SolidIcons.thLarge
                                                            "th-large"
                                                        }
                                                        onPress={() =>
                                                            this.openQuadView()
                                                        }
                                                    ></ButtonCircle>,
                                                )}
                                                {RenderIf(
                                                    GLOBAL.Device_IsSmartTV ==
                                                    false &&
                                                    this.state
                                                        .show_childlock ==
                                                    false &&
                                                    this.state
                                                        .show_buttons_controller ==
                                                    true &&
                                                    GLOBAL.UserInterface
                                                        .player
                                                        .enable_mini_epg ==
                                                    true,
                                                )(
                                                    <ButtonCircle
                                                        Size={25}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            // SolidIcons.newspaper
                                                            "newspaper"
                                                        }
                                                        onPress={() =>
                                                            this.toggleMiniEpg()
                                                        }
                                                    ></ButtonCircle>,
                                                )}
                                                {RenderIf(
                                                    GLOBAL.Device_IsSmartTV ==
                                                    false &&
                                                    this.state
                                                        .show_buttons_controller ==
                                                    true,
                                                )(
                                                    <ButtonCircle
                                                        Size={25}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        Icon={
                                                            this.state
                                                                .favorite ==
                                                                false
                                                                ? "heart-o"
                                                                : "heart"
                                                        }
                                                        onPress={() =>
                                                            this._onFavoriteChange()
                                                        }
                                                    ></ButtonCircle>,
                                                )}

                                                {RenderIf(
                                                    GLOBAL.Device_IsSmartTV ==
                                                    false &&
                                                    this.state
                                                        .show_buttons_controller ==
                                                    true &&
                                                    GLOBAL.UserInterface
                                                        .player
                                                        .enable_problem_report ==
                                                    true,
                                                )(
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
                                                    ></ButtonCircle>,
                                                )}
                                                {RenderIf(
                                                    GLOBAL.Device_IsSmartTV ==
                                                    false &&
                                                    this.state
                                                        .button_support,
                                                )(
                                                    <View
                                                        style={{
                                                            zIndex: 99999,
                                                            position:
                                                                'absolute',
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.83)',
                                                            borderLeftWidth: 2,
                                                            borderLeftColor:
                                                                GLOBAL.Button_Color,
                                                            top:
                                                                GLOBAL.Device_IsWebTV &&
                                                                    !GLOBAL.Device_IsSmartTV
                                                                    ? 0
                                                                    : 50,
                                                            right: 0,
                                                            padding:
                                                                GLOBAL.Device_IsPhone ||
                                                                    (GLOBAL.Device_IsWebTV &&
                                                                        !GLOBAL.Device_IsSmartTV)
                                                                    ? 5
                                                                    : 20,
                                                        }}
                                                    >
                                                        <View>
                                                            <ButtonNormal
                                                                Left={true}
                                                                Disabled={
                                                                    this.state
                                                                        .button_support ==
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
                                                                        this
                                                                            .state
                                                                            .channel_now,
                                                                    )
                                                                }
                                                                Text={LANG.getTranslation(
                                                                    'audio_not_working',
                                                                )}
                                                            />
                                                            <ButtonNormal
                                                                Left={true}
                                                                Disabled={
                                                                    this.state
                                                                        .button_support ==
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
                                                                    this.state
                                                                        .button_support ==
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
                                                                    this.state
                                                                        .button_support ==
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
                                            </View>
                                        </View>
                                    </View>
                                    <View
                                        style={{
                                            flex: GLOBAL.Device_IsPhone
                                                ? null
                                                : 2,
                                            justifyContent: 'flex-start',
                                        }}
                                    >
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
                                                <Text
                                                    style={[
                                                        styles.H2,
                                                        { margin: 20 },
                                                    ]}
                                                >
                                                    {LANG.getTranslation(
                                                        'childlock',
                                                    )}
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
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'column',
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'row',
                                                                justifyContent:
                                                                    'center',
                                                                alignContent:
                                                                    'center',
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            <InputCode
                                                                ref={parentalcontrol =>
                                                                (this.parentalcontrol =
                                                                    parentalcontrol)
                                                                }
                                                                value={
                                                                    this.state
                                                                        .code
                                                                }
                                                                onChangeText={
                                                                    this
                                                                        .handleInputCode
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
                                        {RenderIf(
                                            this.state.button_thanks == true,
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
                                                        borderColor:
                                                            'forestgreen',
                                                        width: 400,
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.73)',
                                                        justifyContent:
                                                            'center',
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
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <View>
                                                        <Text style={styles.H3}>
                                                            {this.state
                                                                .selected_epg_program !=
                                                                undefined
                                                                ? moment
                                                                    .unix(
                                                                        this
                                                                            .state
                                                                            .selected_epg_program
                                                                            .s +
                                                                        this
                                                                            .state
                                                                            .seek_time,
                                                                    )
                                                                    .format(
                                                                        GLOBAL.Clock_Setting,
                                                                    )
                                                                : ''}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>,
                                        )}
                                        {RenderIf(
                                            this.state.isConnected == false,
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
                                                        width: 300,
                                                        borderColor: 'crimson',
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.73)',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <View>
                                                        <Text
                                                            style={[
                                                                styles.H5,
                                                                { color: '#fff' },
                                                            ]}
                                                        >
                                                            {LANG.getTranslation(
                                                                'internet_connection_lost',
                                                            )}
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
                                                        borderColor: 'crimson',
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.73)',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <View>
                                                        <Text
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
                                        {RenderIf(this.state.paused)(
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    paddingTop: 50,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={[
                                                        styles.Shadow,
                                                        {
                                                            fontSize: 75,
                                                            color: '#fff',
                                                        },
                                                    ]}
                                                    // icon={
                                                    //     RegularIcons.pauseCircle
                                                    // }
                                                    name="pause-circle"
                                                />
                                            </View>,
                                        )}
                                    </View>
                                    <View>
                                        <View
                                            style={{
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {RenderIf(
                                                this.state.show_childlock ==
                                                false &&
                                                this.state.miniepg == true,
                                            )(
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        paddingHorizontal: 10,
                                                        justifyContent:
                                                            'center',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                'row',
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'column',
                                                                justifyContent:
                                                                    'center',
                                                                alignContent:
                                                                    'center',
                                                                alignItems:
                                                                    'center',
                                                                alignSelf:
                                                                    'center',
                                                                marginRight: 10,
                                                            }}
                                                        >
                                                            <ButtonCircle
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                Icon={
                                                                    // SolidIcons.arrowLeft
                                                                    "arrow-left"
                                                                }
                                                                onPress={() =>
                                                                    this.getProgramScrubber(
                                                                        -1,
                                                                    )
                                                                }
                                                            ></ButtonCircle>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                flexDirection:
                                                                    'column',
                                                            }}
                                                        >
                                                            <View>
                                                                <ButtonCircle
                                                                    Size={25}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    Icon={
                                                                        // RegularIcons.timesCircle
                                                                        "times-circle"
                                                                    }
                                                                    onPress={() =>
                                                                        this.setState(
                                                                            {
                                                                                miniepg: false,
                                                                            },
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    flex: 1,
                                                                    flexDirection:
                                                                        'row',
                                                                }}
                                                            >
                                                                <TouchableHighlightFocus
                                                                    BorderRadius={
                                                                        5
                                                                    }
                                                                    hasTVPreferredFocus={
                                                                        this
                                                                            .state
                                                                            .miniepg
                                                                    }
                                                                    style={{
                                                                        flex: 1,
                                                                        flexDirection:
                                                                            'row',
                                                                        height: 120,
                                                                        borderRadius: 10,
                                                                    }}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.startProgram(
                                                                            0,
                                                                            this
                                                                                .state
                                                                                .selected_epg_index_scrubber,
                                                                            this
                                                                                .state
                                                                                .selected_channel_scrubber,
                                                                        )
                                                                    }
                                                                >
                                                                    <View
                                                                        style={{
                                                                            flex: 1,
                                                                            flexDirection:
                                                                                'column',
                                                                            paddingLeft: 10,
                                                                            paddingRight: 10,
                                                                            paddingTop: 10,
                                                                        }}
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                flex: 3,
                                                                                flexDirection:
                                                                                    'column',
                                                                            }}
                                                                        >
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                style={[
                                                                                    styles.Standard,
                                                                                    styles.Shadow,
                                                                                    {},
                                                                                ]}
                                                                            >
                                                                                {this
                                                                                    .state
                                                                                    .selected_epg_scrubber !=
                                                                                    undefined &&
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_index_scrubber
                                                                                    ] !=
                                                                                    undefined
                                                                                    ? this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                        this
                                                                                            .state
                                                                                            .selected_epg_index_scrubber
                                                                                    ]
                                                                                        .n
                                                                                    : 'N/A'}
                                                                            </Text>
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                style={[
                                                                                    styles.Medium,
                                                                                    styles.Shadow,
                                                                                    {},
                                                                                ]}
                                                                            >
                                                                                {this
                                                                                    .state
                                                                                    .selected_epg_scrubber !=
                                                                                    undefined &&
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_index_scrubber
                                                                                    ] !=
                                                                                    undefined
                                                                                    ? this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                        this
                                                                                            .state
                                                                                            .selected_epg_index_scrubber
                                                                                    ]
                                                                                        .d
                                                                                    : 'No Information Available'}
                                                                            </Text>
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                style={[
                                                                                    styles.Medium,
                                                                                    styles.Shadow,
                                                                                    {},
                                                                                ]}
                                                                            >
                                                                                {this
                                                                                    .state
                                                                                    .selected_epg_scrubber !=
                                                                                    undefined &&
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_index_scrubber
                                                                                    ] !=
                                                                                    undefined
                                                                                    ? moment
                                                                                        .unix(
                                                                                            this
                                                                                                .state
                                                                                                .selected_epg_scrubber[
                                                                                                this
                                                                                                    .state
                                                                                                    .selected_epg_index_scrubber
                                                                                            ]
                                                                                                .s,
                                                                                        )
                                                                                        .format(
                                                                                            'ddd ' +
                                                                                            GLOBAL.Clock_Setting,
                                                                                        ) +
                                                                                    ' - ' +
                                                                                    moment
                                                                                        .unix(
                                                                                            this
                                                                                                .state
                                                                                                .selected_epg_scrubber[
                                                                                                this
                                                                                                    .state
                                                                                                    .selected_epg_index_scrubber
                                                                                            ]
                                                                                                .e,
                                                                                        )
                                                                                        .format(
                                                                                            GLOBAL.Clock_Setting,
                                                                                        )
                                                                                    : 0}
                                                                            </Text>
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                flex: 1,
                                                                                flexDirection:
                                                                                    'row',
                                                                                paddingTop: 5,
                                                                                paddingBottom: 10,
                                                                            }}
                                                                        >
                                                                            {/* <Markers Text={this.state.selected_epg_scrubber != undefined && this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber] != undefined ? moment.unix(this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber].s).format("ddd " + GLOBAL.Clock_Setting) + ' - ' + moment.unix(this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber].e).format(GLOBAL.Clock_Setting) : 0} Color={'#333'} />
                                                                            {RenderIf(GLOBAL.Device_IsPhone == false)(
                                                                                <Markers Color={'#333'} Text={this.state.selected_epg_scrubber != undefined && this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber] != undefined ? Math.round((this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber].e - this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber].s) / 60) + ' ' + LANG.getTranslation("min") : ''} />
                                                                            )} */}
                                                                            {RenderIf(
                                                                                this
                                                                                    .state
                                                                                    .selected_epg_index_scrubber_base ==
                                                                                0 &&
                                                                                (this
                                                                                    .state
                                                                                    .selected_channel_scrubber
                                                                                    .is_flussonic ==
                                                                                    1 ||
                                                                                    this
                                                                                        .state
                                                                                        .selected_channel_scrubber ==
                                                                                    1) &&
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .enable_catchuptv ==
                                                                                true,
                                                                            )(
                                                                                <View
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            'forestgreen',
                                                                                        borderRadius: 100,
                                                                                        marginHorizontal: 2,
                                                                                        justifyContent:
                                                                                            'center',
                                                                                        alignContent:
                                                                                            'center',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        alignSelf:
                                                                                            'center',
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome5
                                                                                        style={[
                                                                                            styles.IconsTelevision,
                                                                                            {
                                                                                                color: '#fff',
                                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                                    ? 10
                                                                                                    : 4,
                                                                                            },
                                                                                        ]}
                                                                                        // icon={
                                                                                        //     SolidIcons.playCircle
                                                                                        // }
                                                                                        name="play-circle"
                                                                                    />
                                                                                </View>,
                                                                            )}
                                                                            {RenderIf(
                                                                                this
                                                                                    .state
                                                                                    .selected_epg_index_scrubber_base <
                                                                                0 &&
                                                                                GLOBAL.EPG_Days *
                                                                                -1 <=
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .catchup_days &&
                                                                                (this
                                                                                    .state
                                                                                    .selected_channel_scrubber
                                                                                    .is_flussonic ==
                                                                                    1 ||
                                                                                    this
                                                                                        .state
                                                                                        .selected_channel_scrubber ==
                                                                                    1) &&
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .enable_catchuptv ==
                                                                                true,
                                                                            )(
                                                                                <View
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            'royalblue',
                                                                                        borderRadius: 100,
                                                                                        marginHorizontal: 2,
                                                                                        justifyContent:
                                                                                            'center',
                                                                                        alignContent:
                                                                                            'center',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        alignSelf:
                                                                                            'center',
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome5
                                                                                        style={[
                                                                                            styles.IconsTelevision,
                                                                                            {
                                                                                                color: '#fff',
                                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                                    ? 10
                                                                                                    : 4,
                                                                                            },
                                                                                        ]}
                                                                                        // icon={
                                                                                        //     SolidIcons.history
                                                                                        // }
                                                                                        name="history"
                                                                                    />
                                                                                </View>,
                                                                            )}
                                                                            {RenderIf(
                                                                                this
                                                                                    .state
                                                                                    .selected_epg_index_scrubber_base ==
                                                                                0 &&
                                                                                (this
                                                                                    .state
                                                                                    .selected_channel_scrubber
                                                                                    .is_flussonic ==
                                                                                    1 ||
                                                                                    this
                                                                                        .state
                                                                                        .selected_channel_scrubber ==
                                                                                    1) &&
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .enable_catchuptv ==
                                                                                true,
                                                                            )(
                                                                                <View
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            'royalblue',
                                                                                        borderRadius: 100,
                                                                                        marginHorizontal: 2,
                                                                                        justifyContent:
                                                                                            'center',
                                                                                        alignContent:
                                                                                            'center',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        alignSelf:
                                                                                            'center',
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome5
                                                                                        style={[
                                                                                            styles.IconsTelevision,
                                                                                            {
                                                                                                color: '#fff',
                                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                                    ? 10
                                                                                                    : 4,
                                                                                            },
                                                                                        ]}
                                                                                        // icon={
                                                                                        //     SolidIcons.history
                                                                                        // }
                                                                                        name="history"
                                                                                    />
                                                                                </View>,
                                                                            )}
                                                                            {RenderIf(
                                                                                this
                                                                                    .state
                                                                                    .selected_epg_index_scrubber_base >
                                                                                0 &&
                                                                                GLOBAL.EPG_Days *
                                                                                -1 <=
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .catchup_days &&
                                                                                (this
                                                                                    .state
                                                                                    .selected_channel_scrubber
                                                                                    .is_flussonic ==
                                                                                    1 ||
                                                                                    this
                                                                                        .state
                                                                                        .selected_channel_scrubber ==
                                                                                    1) &&
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .enable_recordings ==
                                                                                true,
                                                                            )(
                                                                                <View
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            'crimson',
                                                                                        borderRadius: 100,
                                                                                        marginHorizontal: 2,
                                                                                        justifyContent:
                                                                                            'center',
                                                                                        alignContent:
                                                                                            'center',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        alignSelf:
                                                                                            'center',
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome5
                                                                                        style={[
                                                                                            styles.IconsTelevision,
                                                                                            {
                                                                                                color: '#fff',
                                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                                    ? 10
                                                                                                    : 4,
                                                                                            },
                                                                                        ]}
                                                                                        // icon={
                                                                                        //     SolidIcons.dotCircle
                                                                                        // }
                                                                                        name="dot-circle"
                                                                                    />
                                                                                </View>,
                                                                            )}
                                                                        </View>
                                                                    </View>
                                                                </TouchableHighlightFocus>
                                                            </View>
                                                            <View></View>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'column',
                                                            }}
                                                        >
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'column',
                                                                    justifyContent:
                                                                        'center',
                                                                    alignContent:
                                                                        'center',
                                                                    alignItems:
                                                                        'center',
                                                                    alignSelf:
                                                                        'center',
                                                                }}
                                                            >
                                                                <ButtonCircle
                                                                    Size={25}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    Icon={
                                                                        // SolidIcons.arrowUp
                                                                        "arrow-up"
                                                                    }
                                                                    onPress={() =>
                                                                        this.getChannelEpgScrubber(
                                                                            1,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'column',
                                                                    justifyContent:
                                                                        'center',
                                                                    alignContent:
                                                                        'center',
                                                                    alignItems:
                                                                        'center',
                                                                    alignSelf:
                                                                        'center',
                                                                }}
                                                            >
                                                                <ButtonCircle
                                                                    Rounded={
                                                                        true
                                                                    }
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    Image={
                                                                        this
                                                                            .state
                                                                            .selected_channel_scrubber
                                                                            .icon_big
                                                                    }
                                                                    Size={
                                                                        GLOBAL.Device_IsAppleTV
                                                                            ? 75
                                                                            : 75
                                                                    }
                                                                    onPress={() =>
                                                                        this.startChannelById(
                                                                            this
                                                                                .state
                                                                                .selected_channel_scrubber
                                                                                .channel_id,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'column',
                                                                    justifyContent:
                                                                        'center',
                                                                    alignContent:
                                                                        'center',
                                                                    alignItems:
                                                                        'center',
                                                                    alignSelf:
                                                                        'center',
                                                                }}
                                                            >
                                                                <ButtonCircle
                                                                    Size={25}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    Icon={
                                                                        // SolidIcons.arrowDown
                                                                        "arrow-down"
                                                                    }
                                                                    onPress={() =>
                                                                        this.getChannelEpgScrubber(
                                                                            -1,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
                                                            </View>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                flexDirection:
                                                                    'column',
                                                            }}
                                                        >
                                                            <View
                                                                style={{
                                                                    justifyContent:
                                                                        'flex-end',
                                                                    alignContent:
                                                                        'flex-end',
                                                                    alignItems:
                                                                        'flex-end',
                                                                    alignSelf:
                                                                        'flex-end',
                                                                }}
                                                            >
                                                                <ButtonCircle
                                                                    Size={25}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    Icon={
                                                                        // RegularIcons.timesCircle
                                                                        "times-circle"
                                                                    }
                                                                    onPress={() =>
                                                                        this.setState(
                                                                            {
                                                                                miniepg: false,
                                                                            },
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    flex: 1,
                                                                    flexDirection:
                                                                        'row',
                                                                }}
                                                            >
                                                                <TouchableHighlightFocus
                                                                    BorderRadius={
                                                                        5
                                                                    }
                                                                    style={{
                                                                        flex: 1,
                                                                        flexDirection:
                                                                            'row',
                                                                        height: 120,
                                                                        borderRadius: 10,
                                                                    }}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.startProgram(
                                                                            0,
                                                                            this
                                                                                .state
                                                                                .selected_epg_index_scrubber +
                                                                            1,
                                                                            this
                                                                                .state
                                                                                .selected_channel_scrubber,
                                                                        )
                                                                    }
                                                                >
                                                                    <View
                                                                        style={{
                                                                            flex: 1,
                                                                            flexDirection:
                                                                                'column',
                                                                            paddingLeft: 10,
                                                                            paddingRight: 10,
                                                                            paddingTop: 10,
                                                                        }}
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                flex: 3,
                                                                                flexDirection:
                                                                                    'column',
                                                                            }}
                                                                        >
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                style={[
                                                                                    styles.Standard,
                                                                                    styles.Shadow,
                                                                                    {
                                                                                        flexDirection:
                                                                                            'row',
                                                                                        justifyContent:
                                                                                            'flex-end',
                                                                                        alignItems:
                                                                                            'flex-end',
                                                                                        textAlign:
                                                                                            'right',
                                                                                        width: '100%',
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                {this
                                                                                    .state
                                                                                    .selected_epg_scrubber !=
                                                                                    undefined &&
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_index_scrubber +
                                                                                    1
                                                                                    ] !=
                                                                                    undefined
                                                                                    ? this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                        this
                                                                                            .state
                                                                                            .selected_epg_index_scrubber +
                                                                                        1
                                                                                    ]
                                                                                        .n
                                                                                    : 'N/A'}
                                                                            </Text>
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                style={[
                                                                                    styles.Medium,
                                                                                    styles.Shadow,
                                                                                    {
                                                                                        flexDirection:
                                                                                            'row',
                                                                                        justifyContent:
                                                                                            'flex-end',
                                                                                        alignItems:
                                                                                            'flex-end',
                                                                                        textAlign:
                                                                                            'right',
                                                                                        width: '100%',
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                {this
                                                                                    .state
                                                                                    .selected_epg_scrubber !=
                                                                                    undefined &&
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_index_scrubber +
                                                                                    1
                                                                                    ] !=
                                                                                    undefined
                                                                                    ? this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                        this
                                                                                            .state
                                                                                            .selected_epg_index_scrubber +
                                                                                        1
                                                                                    ]
                                                                                        .d
                                                                                    : 'No Information Available'}
                                                                            </Text>
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                style={[
                                                                                    styles.Medium,
                                                                                    styles.Shadow,
                                                                                    {
                                                                                        flexDirection:
                                                                                            'row',
                                                                                        justifyContent:
                                                                                            'flex-end',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        textAlign:
                                                                                            'right',
                                                                                        width: '100%',
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                {this
                                                                                    .state
                                                                                    .selected_epg_scrubber !=
                                                                                    undefined &&
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_scrubber[
                                                                                    this
                                                                                        .state
                                                                                        .selected_epg_index_scrubber +
                                                                                    1
                                                                                    ] !=
                                                                                    undefined
                                                                                    ? moment
                                                                                        .unix(
                                                                                            this
                                                                                                .state
                                                                                                .selected_epg_scrubber[
                                                                                                this
                                                                                                    .state
                                                                                                    .selected_epg_index_scrubber +
                                                                                                1
                                                                                            ]
                                                                                                .s,
                                                                                        )
                                                                                        .format(
                                                                                            'ddd ' +
                                                                                            GLOBAL.Clock_Setting,
                                                                                        ) +
                                                                                    ' - ' +
                                                                                    moment
                                                                                        .unix(
                                                                                            this
                                                                                                .state
                                                                                                .selected_epg_scrubber[
                                                                                                this
                                                                                                    .state
                                                                                                    .selected_epg_index_scrubber +
                                                                                                1
                                                                                            ]
                                                                                                .e,
                                                                                        )
                                                                                        .format(
                                                                                            GLOBAL.Clock_Setting,
                                                                                        )
                                                                                    : 0}
                                                                            </Text>
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                flex: 1,
                                                                                paddingBottom: 10,
                                                                                flexDirection:
                                                                                    'row',
                                                                                paddingTop: 5,
                                                                                justifyContent:
                                                                                    'flex-end',
                                                                                alignItems:
                                                                                    'flex-end',
                                                                            }}
                                                                        >
                                                                            {RenderIf(
                                                                                this
                                                                                    .state
                                                                                    .selected_epg_index_scrubber_base >
                                                                                -1 &&
                                                                                GLOBAL.EPG_Days *
                                                                                -1 <=
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .catchup_days &&
                                                                                (this
                                                                                    .state
                                                                                    .selected_channel_scrubber
                                                                                    .is_flussonic ==
                                                                                    1 ||
                                                                                    this
                                                                                        .state
                                                                                        .selected_channel_scrubber ==
                                                                                    1) &&
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .enable_recordings ==
                                                                                true,
                                                                            )(
                                                                                <View
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            'crimson',
                                                                                        borderRadius: 100,
                                                                                        marginHorizontal: 2,
                                                                                        justifyContent:
                                                                                            'center',
                                                                                        alignContent:
                                                                                            'center',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        alignSelf:
                                                                                            'center',
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome5
                                                                                        style={[
                                                                                            styles.IconsTelevision,
                                                                                            {
                                                                                                color: '#fff',
                                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                                    ? 10
                                                                                                    : 4,
                                                                                            },
                                                                                        ]}
                                                                                        // icon={
                                                                                        //     SolidIcons.dotCircle
                                                                                        // }
                                                                                        name="dot-circle"
                                                                                    />
                                                                                </View>,
                                                                            )}
                                                                            {RenderIf(
                                                                                this
                                                                                    .state
                                                                                    .selected_epg_index_scrubber_base <
                                                                                0 &&
                                                                                GLOBAL.EPG_Days *
                                                                                -1 <=
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .catchup_days &&
                                                                                (this
                                                                                    .state
                                                                                    .selected_channel_scrubber
                                                                                    .is_flussonic ==
                                                                                    1 ||
                                                                                    this
                                                                                        .state
                                                                                        .selected_channel_scrubber ==
                                                                                    1) &&
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .enable_catchuptv ==
                                                                                true,
                                                                            )(
                                                                                <View
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            'royalblue',
                                                                                        borderRadius: 100,
                                                                                        marginHorizontal: 2,
                                                                                        justifyContent:
                                                                                            'center',
                                                                                        alignContent:
                                                                                            'center',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        alignSelf:
                                                                                            'center',
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome5
                                                                                        style={[
                                                                                            styles.IconsTelevision,
                                                                                            {
                                                                                                color: '#fff',
                                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                                    ? 10
                                                                                                    : 4,
                                                                                            },
                                                                                        ]}
                                                                                        // icon={
                                                                                        //     SolidIcons.history
                                                                                        // }
                                                                                        name="history"
                                                                                    />
                                                                                </View>,
                                                                            )}
                                                                            {RenderIf(
                                                                                this
                                                                                    .state
                                                                                    .selected_epg_index_scrubber_base ==
                                                                                -1 &&
                                                                                (this
                                                                                    .state
                                                                                    .selected_channel_scrubber
                                                                                    .is_flussonic ==
                                                                                    1 ||
                                                                                    this
                                                                                        .state
                                                                                        .selected_channel_scrubber ==
                                                                                    1) &&
                                                                                GLOBAL
                                                                                    .UserInterface
                                                                                    .general
                                                                                    .enable_catchuptv ==
                                                                                true,
                                                                            )(
                                                                                <View
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            'forestgreen',
                                                                                        borderRadius: 100,
                                                                                        marginHorizontal: 2,
                                                                                        justifyContent:
                                                                                            'center',
                                                                                        alignContent:
                                                                                            'center',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        alignSelf:
                                                                                            'center',
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome5
                                                                                        style={[
                                                                                            styles.IconsTelevision,
                                                                                            {
                                                                                                color: '#fff',
                                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                                    ? 10
                                                                                                    : 4,
                                                                                            },
                                                                                        ]}
                                                                                        // icon={
                                                                                        //     SolidIcons.playCircle
                                                                                        // }
                                                                                        name="play-circle"
                                                                                    />
                                                                                </View>,
                                                                            )}
                                                                            {/* <Markers Text={this.state.selected_epg_scrubber != undefined && this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber + 1] != undefined ? moment.unix(this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber + 1].s).format("ddd " + GLOBAL.Clock_Setting) + ' - ' + moment.unix(this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber + 1].e).format(GLOBAL.Clock_Setting) : 0} Color={'#333'} />
                                                                            {RenderIf(GLOBAL.Device_IsPhone == false)(
                                                                                <Markers Color={'#333'} Text={this.state.selected_epg_scrubber != undefined && this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber + 1] != undefined ? Math.round((this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber + 1].e - this.state.selected_epg_scrubber[this.state.selected_epg_index_scrubber + 1].s) / 60) + ' ' + LANG.getTranslation("min") : ''} />
                                                                            )} */}
                                                                        </View>
                                                                    </View>
                                                                </TouchableHighlightFocus>
                                                            </View>
                                                            <View></View>
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'column',
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                            alignSelf: 'center',
                                                            marginLeft: 10,
                                                        }}
                                                    >
                                                        <ButtonCircle
                                                            Size={25}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
                                                            Icon={
                                                                // SolidIcons.arrowRight
                                                                "arrow-right"
                                                            }
                                                            onPress={() =>
                                                                this.getProgramScrubber(
                                                                    1,
                                                                )
                                                            }
                                                        ></ButtonCircle>
                                                    </View>
                                                </View>,
                                            )}
                                            {RenderIf(
                                                this.state.miniepg == false,
                                            )(
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <View>
                                                        <Image
                                                            source={{
                                                                uri:
                                                                    GLOBAL.ImageUrlCMS +
                                                                    this.state
                                                                        .selected_channel
                                                                        .icon_big,
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
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'column',
                                                            paddingBottom: 20,
                                                        }}
                                                    >
                                                        <Text
                                                            numberOfLines={1}
                                                            style={[
                                                                styles.H1,
                                                                styles.Shadow,
                                                            ]}
                                                        >
                                                            {
                                                                this.state
                                                                    .selected_channel
                                                                    .channel_number
                                                            }
                                                            .{' '}
                                                            {
                                                                this.state
                                                                    .selected_channel
                                                                    .name
                                                            }
                                                        </Text>
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'row',
                                                                paddingTop: 5,
                                                            }}
                                                        >
                                                            <Markers
                                                                Color={'#333'}
                                                                Text={
                                                                    Math.round(
                                                                        (this
                                                                            .state
                                                                            .selected_epg_program
                                                                            .e -
                                                                            this
                                                                                .state
                                                                                .selected_epg_program
                                                                                .s) /
                                                                        60,
                                                                    ) +
                                                                    ' ' +
                                                                    LANG.getTranslation(
                                                                        'min',
                                                                    )
                                                                }
                                                            />
                                                            {RenderIf(
                                                                this.state
                                                                    .selected_epg_program !=
                                                                undefined &&
                                                                this.state
                                                                    .selected_epg_program !=
                                                                null &&
                                                                this.state
                                                                    .selected_epg_program
                                                                    .age_rating !=
                                                                '' &&
                                                                this.state
                                                                    .selected_epg_program
                                                                    .age_rating !=
                                                                undefined,
                                                            )(
                                                                <Markers
                                                                    Text={
                                                                        this
                                                                            .state
                                                                            .selected_epg_program
                                                                            .age_rating
                                                                    }
                                                                    Color={
                                                                        '#222'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.state
                                                                    .selected_epg_program !=
                                                                undefined &&
                                                                this.state
                                                                    .selected_epg_program !=
                                                                null &&
                                                                this.state
                                                                    .selected_epg_program
                                                                    .category !=
                                                                '' &&
                                                                this.state
                                                                    .selected_epg_program
                                                                    .category !=
                                                                undefined,
                                                            )(
                                                                <Markers
                                                                    Text={
                                                                        this
                                                                            .state
                                                                            .selected_epg_program
                                                                            .category
                                                                    }
                                                                    Color={
                                                                        '#222'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.state
                                                                    .live ==
                                                                true,
                                                            )(
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            'forestgreen',
                                                                        padding: 3,
                                                                        borderRadius: 100,
                                                                        marginHorizontal: 5,
                                                                        justifyContent:
                                                                            'center',
                                                                        alignContent:
                                                                            'center',
                                                                        alignItems:
                                                                            'center',
                                                                        alignSelf:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <FontAwesome5
                                                                        style={[
                                                                            styles.IconsMenu,
                                                                            {
                                                                                color: '#fff',
                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                    ? 10
                                                                                    : 2,
                                                                            },
                                                                        ]}
                                                                        // icon={
                                                                        //     SolidIcons.playCircle
                                                                        // }
                                                                        name="play-circle"
                                                                    />
                                                                </View>,
                                                            )}
                                                            {RenderIf(
                                                                this.state
                                                                    .live ==
                                                                false &&
                                                                this.state
                                                                    .catchup ==
                                                                true &&
                                                                GLOBAL.EPG_Days *
                                                                -1 <=
                                                                GLOBAL
                                                                    .UserInterface
                                                                    .general
                                                                    .catchup_days &&
                                                                GLOBAL
                                                                    .UserInterface
                                                                    .general
                                                                    .enable_catchuptv ==
                                                                true,
                                                            )(
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            'royalblue',
                                                                        padding: 3,
                                                                        borderRadius: 100,
                                                                        marginHorizontal: 5,
                                                                        justifyContent:
                                                                            'center',
                                                                        alignContent:
                                                                            'center',
                                                                        alignItems:
                                                                            'center',
                                                                        alignSelf:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <FontAwesome5
                                                                        style={[
                                                                            styles.IconsMenu,
                                                                            {
                                                                                color: '#fff',
                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                    ? 10
                                                                                    : 2,
                                                                            },
                                                                        ]}
                                                                        // icon={
                                                                        //     SolidIcons.history
                                                                        // }
                                                                        name="history"
                                                                    />
                                                                </View>,
                                                            )}
                                                            {RenderIf(
                                                                this.state
                                                                    .live ==
                                                                true &&
                                                                this.state
                                                                    .catchup ==
                                                                true &&
                                                                GLOBAL.EPG_Days *
                                                                -1 <=
                                                                GLOBAL
                                                                    .UserInterface
                                                                    .general
                                                                    .catchup_days &&
                                                                GLOBAL
                                                                    .UserInterface
                                                                    .general
                                                                    .enable_catchuptv ==
                                                                true,
                                                            )(
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            'royalblue',
                                                                        padding: 3,
                                                                        borderRadius: 100,
                                                                        marginHorizontal: 5,
                                                                        justifyContent:
                                                                            'center',
                                                                        alignContent:
                                                                            'center',
                                                                        alignItems:
                                                                            'center',
                                                                        alignSelf:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <FontAwesome5
                                                                        style={[
                                                                            styles.IconsMenu,
                                                                            {
                                                                                color: '#fff',
                                                                                margin: GLOBAL.Device_IsAppleTV
                                                                                    ? 10
                                                                                    : 2,
                                                                            },
                                                                        ]}
                                                                        // icon={
                                                                        //     SolidIcons.history
                                                                        // }
                                                                        name="history"
                                                                    />
                                                                </View>,
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>,
                                            )}

                                            {RenderIf(
                                                this.state.show_childlock ==
                                                false &&
                                                this.state.miniepg == false,
                                            )(
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        paddingHorizontal: 10,
                                                        justifyContent:
                                                            'center',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flex: 10,
                                                            flexDirection:
                                                                'column',
                                                            justifyContent:
                                                                'center',
                                                            paddingHorizontal: 10,
                                                            paddingBottom: 5,
                                                        }}
                                                    >
                                                        <Scrubber
                                                            value={
                                                                this.state
                                                                    .current_time
                                                            }
                                                            onSlidingComplete={
                                                                this
                                                                    .scrubberChange
                                                            }
                                                            totalDuration={
                                                                this.state
                                                                    .duration
                                                            }
                                                            trackColor={'gray'}
                                                            bufferedValue={
                                                                this.state
                                                                    .playable_duration
                                                            }
                                                            bufferedTrackColor="#333"
                                                            scrubbedColor={
                                                                'gray'
                                                            }
                                                            e={
                                                                this.state
                                                                    .selected_epg_program
                                                                    .e
                                                            }
                                                            s={
                                                                this.state
                                                                    .selected_epg_program
                                                                    .s
                                                            }
                                                            live={
                                                                this.state.live
                                                            }
                                                        />
                                                    </View>
                                                </View>,
                                            )}
                                            {RenderIf(
                                                this.state.miniepg == false,
                                            )(
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            margin: 10,
                                                            flexDirection:
                                                                'row',
                                                            zIndex: -1,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                flexDirection:
                                                                    'column',
                                                                paddingRight: 30,
                                                                height: GLOBAL.Device_IsPhone
                                                                    ? null
                                                                    : 100,
                                                            }}
                                                        >
                                                            <Text
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                style={
                                                                    styles.H4
                                                                }
                                                            >
                                                                {this.state
                                                                    .selected_epg_program !=
                                                                    undefined
                                                                    ? this.state
                                                                        .selected_epg_program
                                                                        .n
                                                                    : ''}
                                                            </Text>
                                                            <Text
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                style={
                                                                    styles.Medium
                                                                }
                                                            >
                                                                {moment
                                                                    .unix(
                                                                        this
                                                                            .state
                                                                            .selected_epg_program
                                                                            .s,
                                                                    )
                                                                    .format(
                                                                        'ddd ' +
                                                                        GLOBAL.Clock_Setting,
                                                                    ) +
                                                                    '-' +
                                                                    moment
                                                                        .unix(
                                                                            this
                                                                                .state
                                                                                .selected_epg_program
                                                                                .e,
                                                                        )
                                                                        .format(
                                                                            GLOBAL.Clock_Setting,
                                                                        )}
                                                            </Text>
                                                            {RenderIf(
                                                                GLOBAL.Device_IsPhone ==
                                                                false,
                                                            )(
                                                                <Text
                                                                    numberOfLines={
                                                                        GLOBAL.Device_IsWebTV
                                                                            ? 1
                                                                            : 2
                                                                    }
                                                                    style={
                                                                        styles.Standard
                                                                    }
                                                                >
                                                                    {
                                                                        this
                                                                            .state
                                                                            .selected_epg_program
                                                                            .d
                                                                    }
                                                                </Text>,
                                                            )}
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                'row',
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                    >
                                                        {RenderIf(
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true &&
                                                            GLOBAL
                                                                .UserInterface
                                                                .player
                                                                .enable_catchup_buttons ==
                                                            true,
                                                        )(
                                                            <View
                                                                style={{
                                                                    flex: 1,
                                                                    flexDirection:
                                                                        'row',
                                                                    justifyContent:
                                                                        'center',
                                                                    alignContent:
                                                                        'center',
                                                                    alignItems:
                                                                        'center',
                                                                    alignSelf:
                                                                        'center',
                                                                }}
                                                            >
                                                                <ButtonCircle
                                                                    Rounded={
                                                                        true
                                                                    }
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    Icon={
                                                                        // RegularIcons.arrowAltCircleLeft
                                                                        "arrow-alt-circle-left"
                                                                    }
                                                                    Size={35}
                                                                    onPress={() =>
                                                                        this.startChannel(
                                                                            -1,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
                                                                {RenderIf(
                                                                    this.state
                                                                        .playing_catchup ==
                                                                    true,
                                                                )(
                                                                    <ButtonCircle
                                                                        Size={
                                                                            25
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        Color={
                                                                            this
                                                                                .state
                                                                                .catchup ==
                                                                                true &&
                                                                                this
                                                                                    .state
                                                                                    .is_ad ==
                                                                                false
                                                                                ? '#fff'
                                                                                : '#111'
                                                                        }
                                                                        Icon={
                                                                            "step-backward"
                                                                        }
                                                                        onPress={() =>
                                                                            this.startProgram(
                                                                                -1,
                                                                                null,
                                                                                null,
                                                                                true,
                                                                            )
                                                                        }
                                                                    ></ButtonCircle>,
                                                                )}
                                                                {RenderIf(
                                                                    this.state
                                                                        .playing_catchup ==
                                                                    true ||
                                                                    this
                                                                        .state
                                                                        .selected_channel
                                                                        .is_flussonic ==
                                                                    1,
                                                                )(
                                                                    <ButtonCircle
                                                                        Size={
                                                                            25
                                                                        }
                                                                        onFocus={() =>
                                                                            this.focusSeek()
                                                                        }
                                                                        Color={
                                                                            '#fff'
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
                                                                    ></ButtonCircle>,
                                                                )}
                                                                <ButtonCircle
                                                                    hasTVPreferredFocus={
                                                                        this
                                                                            .state
                                                                            .play_focus
                                                                    }
                                                                    Color={
                                                                        this
                                                                            .state
                                                                            .catchup ==
                                                                            true &&
                                                                            this
                                                                                .state
                                                                                .is_ad ==
                                                                            false
                                                                            ? '#fff'
                                                                            : '#111'
                                                                    }
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    Size={40}
                                                                    Icon={
                                                                        this
                                                                            .state
                                                                            .playstatus
                                                                    }
                                                                    onPress={() =>
                                                                        this._onPlayerPausePlay()
                                                                    }
                                                                ></ButtonCircle>
                                                                {RenderIf(
                                                                    this.state
                                                                        .playing_catchup ==
                                                                    true ||
                                                                    this
                                                                        .state
                                                                        .selected_channel
                                                                        .is_flussonic ==
                                                                    1,
                                                                )(
                                                                    <ButtonCircle
                                                                        Size={
                                                                            25
                                                                        }
                                                                        onFocus={() =>
                                                                            this.focusSeek()
                                                                        }
                                                                        Color={
                                                                            '#fff'
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
                                                                    ></ButtonCircle>,
                                                                )}
                                                                {RenderIf(
                                                                    this.state
                                                                        .playing_catchup ==
                                                                    true,
                                                                )(
                                                                    <ButtonCircle
                                                                        Size={
                                                                            25
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        Color={
                                                                            this
                                                                                .state
                                                                                .live ==
                                                                                true
                                                                                ? '#111'
                                                                                : this
                                                                                    .state
                                                                                    .catchup ==
                                                                                    true
                                                                                    ? '#fff'
                                                                                    : '#111'
                                                                        }
                                                                        Icon={
                                                                            "step-forward"
                                                                        }
                                                                        onPress={() =>
                                                                            this.startProgram(
                                                                                1,
                                                                                null,
                                                                                null,
                                                                                true,
                                                                            )
                                                                        }
                                                                    ></ButtonCircle>,
                                                                )}
                                                                <ButtonCircle
                                                                    Rounded={
                                                                        true
                                                                    }
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    Icon={
                                                                        "arrow-alt-circle-right"
                                                                    }
                                                                    Size={35}
                                                                    onPress={() =>
                                                                        this.startChannel(
                                                                            1,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
                                                            </View>,
                                                        )}
                                                    </View>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                'row',
                                                            justifyContent:
                                                                'flex-end',
                                                            zIndex:
                                                                this.state
                                                                    .button_screensize ||
                                                                    this.state
                                                                        .button_audio ||
                                                                    this.state
                                                                        .button_subtitles ||
                                                                    this.state
                                                                        .button_support
                                                                    ? 99999
                                                                    : -1,
                                                        }}
                                                    >
                                                        {RenderIf(
                                                            GLOBAL.Device_IsSmartTV ==
                                                            true &&
                                                            this.state
                                                                .button_support,
                                                        )(
                                                            <View
                                                                style={{
                                                                    zIndex: 99999,
                                                                    position:
                                                                        'absolute',
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
                                                                        Left={
                                                                            true
                                                                        }
                                                                        Disabled={
                                                                            this
                                                                                .state
                                                                                .button_support ==
                                                                                true
                                                                                ? false
                                                                                : true
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this._onPressProblemReport(
                                                                                'No Audio',
                                                                                this
                                                                                    .state
                                                                                    .channel_now,
                                                                            )
                                                                        }
                                                                        Text={LANG.getTranslation(
                                                                            'audio_not_working',
                                                                        )}
                                                                    />
                                                                    <ButtonNormal
                                                                        Left={
                                                                            true
                                                                        }
                                                                        Disabled={
                                                                            this
                                                                                .state
                                                                                .button_support ==
                                                                                true
                                                                                ? false
                                                                                : true
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
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
                                                                        Left={
                                                                            true
                                                                        }
                                                                        Disabled={
                                                                            this
                                                                                .state
                                                                                .button_support ==
                                                                                true
                                                                                ? false
                                                                                : true
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
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
                                                                        Left={
                                                                            true
                                                                        }
                                                                        Disabled={
                                                                            this
                                                                                .state
                                                                                .button_support ==
                                                                                true
                                                                                ? false
                                                                                : true
                                                                        }
                                                                        Padding={
                                                                            0
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
                                                                </View>
                                                            </View>,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_IsSmartTV ==
                                                            true &&
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true &&
                                                            GLOBAL
                                                                .UserInterface
                                                                .player
                                                                .enable_channel_menu ==
                                                            true,
                                                        )(
                                                            <ButtonCircle
                                                                Size={25}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                Icon={
                                                                    "th"
                                                                }
                                                                onPress={() =>
                                                                    this.toggleChannelList()
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_IsSmartTV ==
                                                            true &&
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            GLOBAL.Device_Model !=
                                                            'p212' &&
                                                            GLOBAL.Device_Model !=
                                                            'NETCOM' &&
                                                            GLOBAL.Device_System !=
                                                            'Apple' &&
                                                            GLOBAL.Device_IsWebTV ==
                                                            false &&
                                                            GLOBAL.Device_IsPhone ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true &&
                                                            this.state
                                                                .selected_channels
                                                                .length >=
                                                            4 &&
                                                            GLOBAL
                                                                .UserInterface
                                                                .player
                                                                .enable_quadview ==
                                                            true,
                                                        )(
                                                            <ButtonCircle
                                                                Size={25}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                Icon={
                                                                    "th-large"
                                                                }
                                                                onPress={() =>
                                                                    this.openQuadView()
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_IsSmartTV ==
                                                            true &&
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true &&
                                                            GLOBAL
                                                                .UserInterface
                                                                .player
                                                                .enable_mini_epg ==
                                                            true,
                                                        )(
                                                            <ButtonCircle
                                                                Size={25}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                Icon={
                                                                    "newspaper"
                                                                }
                                                                onPress={() =>
                                                                    this.toggleMiniEpg()
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_IsSmartTV ==
                                                            true &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true,
                                                        )(
                                                            <ButtonCircle
                                                                Size={25}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                Icon={
                                                                    this.state
                                                                        .favorite ==
                                                                        false
                                                                        ? "heart"
                                                                        : "heart-o"
                                                                }
                                                                onPress={() =>
                                                                    this._onFavoriteChange()
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_IsSmartTV ==
                                                            true &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true &&
                                                            GLOBAL
                                                                .UserInterface
                                                                .player
                                                                .enable_problem_report ==
                                                            true,
                                                        )(
                                                            <ButtonCircle
                                                                Size={25}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                Icon={
                                                                    "medkit"
                                                                }
                                                                onPress={() =>
                                                                    this.setState(
                                                                        {
                                                                            button_support: true,
                                                                            button_audio: false,
                                                                            button_settings: false,
                                                                            button_subtitles: false,
                                                                            button_screensize: false,
                                                                            show_popup: true,
                                                                        },
                                                                    )
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            this.state
                                                                .audio_tracks
                                                                .length > 1 &&
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true,
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
                                                                    this.setState(
                                                                        {
                                                                            button_support: false,
                                                                            button_audio: true,
                                                                            button_settings: false,
                                                                            button_subtitles: false,
                                                                            button_screensize: false,
                                                                            show_popup: true,
                                                                            controls: false,
                                                                        },
                                                                    )
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            this.state
                                                                .text_tracks
                                                                .length > 0 &&
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true,
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
                                                                    this.setState(
                                                                        {
                                                                            button_support: false,
                                                                            button_audio: false,
                                                                            button_settings: false,
                                                                            button_subtitles: true,
                                                                            button_screensize: false,
                                                                            show_popup: true,
                                                                            controls: false,
                                                                        },
                                                                    )
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true,
                                                        )(
                                                            <ButtonCircle
                                                                Size={25}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                Icon={
                                                                    "compress"
                                                                }
                                                                onPress={() =>
                                                                    this.setState(
                                                                        {
                                                                            button_support: false,
                                                                            button_audio: false,
                                                                            button_settings: false,
                                                                            button_subtitles: false,
                                                                            button_screensize: true,
                                                                            show_popup: true,
                                                                            controls: false,
                                                                        },
                                                                    )
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_IsWebTV ==
                                                            true &&
                                                            GLOBAL.Device_IsSmartTV ==
                                                            false &&
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true,
                                                        )(
                                                            <ButtonCircle
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                Icon={
                                                                    "expand"
                                                                }
                                                                onPress={() =>
                                                                    this.goFullScreen()
                                                                }
                                                            ></ButtonCircle>,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_IsWebTV ==
                                                            true &&
                                                            GLOBAL.Device_IsSmartTV ==
                                                            false &&
                                                            this.state
                                                                .show_childlock ==
                                                            false &&
                                                            this.state
                                                                .show_buttons_controller ==
                                                            true,
                                                        )(
                                                            <google-cast-launcher>
                                                                cast
                                                            </google-cast-launcher>,
                                                        )}
                                                    </View>
                                                </View>,
                                            )}
                                        </View>
                                    </View>
                                </View>,
                            )}
                        </View>
                    </ImageBackground>,
                )}
            </View>
        );
    }
    _setFocusOnFirst(index) {
        if (GLOBAL.Device_IsTV == true) {
            return index === 0;
        }
        return false;
    }
}
