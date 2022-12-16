import React, { PureComponent } from 'react';
import {
    View,
    Text,
    Image,
    AppState,
    BackHandler,
    TVMenuControl,
    TVEventHandler,
    useTVEventHandler,
} from 'react-native';
//import moment from "moment";
import Program from './Program';
import Video from 'react-native-video/dom/Video';
import TimerMixin from 'react-timer-mixin';
import { Actions } from 'react-native-router-flux';
// import GLOBALModule from './../../../datalayer/global';
var GLOBALModule = require('./../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
// import {SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

let TouchableHighlight;
if (
    GLOBAL.Device_IsTablet ||
    GLOBAL.Device_IsPhone ||
    GLOBAL.Device_IsAppleTV
) {
    TouchableHighlight =
        require('react-native-gesture-handler').TouchableHighlight;
} else {
    TouchableHighlight = require('react-native').TouchableHighlight;
}

export default class Grid extends PureComponent {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        this.state = {
            direction: 'down',
            page: this.props.page != undefined ? this.props.page : 0,
            paging: GLOBAL.Device_IsTablet
                ? 9
                : GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV
                    ? 10
                    : 6,
            rows: [],
            rows_: [],
            firstPage: false,
            dateToday: moment().add(GLOBAL.EPG_Days, 'hours').format('dddd ll'),
            red_line_position: 0,
            red_line_minutes: 0,
            red_line_minutes_time: 0,
            videoUrl: '',
            drmKey: '',
            videoType: 'm3u8',
            channel: [],
            show_dates: false,
            show_groups: false,
            dates: this.getDates(),
            time: moment().format(GLOBAL.Clock_Setting),
            time_offset: 0,
            gestureName: '',
            programs: [],
            channelIndex: 0,
            scrollIndex: 0,
            focusing: false,
            drmKey: '',
            drmSupplierType: '',
            drmLicenseServerUrl: '',
            drmCertificateUrl: '',
        };
        GLOBAL.EPG_Row = 0;
        GLOBAL.EPG_Paging_Page =
            this.props.page != undefined ? this.props.page : 0;

        this.selectProgram = this.props.selectProgram.bind(this);
        this.selectDate = this.props.selectDate.bind(this);
        this.selectGroup = this.props.selectGroup.bind(this);
        this.goBack = this.props.goBack.bind(this);
        this.getEpgData = this.props.getEpgData.bind(this);
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
                cmp.onRight();
            } else if (
                evt &&
                (evt.eventType === 'up' || evt.eventType == 'swipeUp')
            ) {
                cmp.onUp();
            } else if (
                evt &&
                (evt.eventType === 'left' || evt.eventType == 'swipeLeft')
            ) {
                cmp.onLeft();
            } else if (
                evt &&
                (evt.eventType === 'down' || evt.eventType == 'swipeDown')
            ) {
                cmp.onDown();
            } else if (evt && evt.eventType === 'playPause') {
                //cmp.restartGame();
            }
        });
    }
    goBack_() {
        if (this.state.show_dates == false && this.state.show_groups == false) {
            this.goBack();
        } else {
            this.setState({
                show_dates: false,
                show_groups: false,
            });
        }
    }

    onLeft = () => {
        var check = this.checkIfWithin24Hours(this.state.time_offset - 2);
        if (GLOBAL.EPG_Focussed_First_Program == true && check == true) {
            var offset = this.state.time_offset - 2;
            this.setState({
                time_offset: offset,
            });
            this.addRows(GLOBAL.EPG_Paging_Page);
        }
    };
    onRight = () => {
        var check = this.checkIfWithin24Hours(this.state.time_offset + 2);
        if (GLOBAL.EPG_Focussed_Last_Program == true && check == true) {
            var offset = this.state.time_offset + 2;
            this.setState({
                time_offset: offset,
            });
            this.addRows(GLOBAL.EPG_Paging_Page);
        }
    };
    onDown = () => {
        if (this.props.channels.length > GLOBAL.EPG_Row) {
            GLOBAL.EPG_Row = GLOBAL.EPG_Row + 1;
        }
        if (this.state.show_dates == true) {
            this.setState({
                show_dates: false,
            });
        }
        if (this.state.show_groups == true) {
            this.setState({
                show_groups: false,
            });
        }
        if (GLOBAL.EPG_Focussed_Row == 5) {
            var pages =
                Math.ceil(this.props.channels.length / this.state.paging) - 1;
            if (GLOBAL.EPG_Paging_Page < pages) {
                GLOBAL.EPG_Paging_Page = GLOBAL.EPG_Paging_Page + 1;
                this.addRows(GLOBAL.EPG_Paging_Page);
            }
        }
    };
    onUp = () => {
        if (GLOBAL.EPG_Row > 0) {
            GLOBAL.EPG_Row = GLOBAL.EPG_Row - 1;
        }
        if (this.state.show_dates == true) {
            this.setState({
                show_dates: false,
            });
        }
        if (this.state.show_groups == true) {
            this.setState({
                show_groups: false,
            });
        }
        if (GLOBAL.EPG_Focussed_Row == 0) {
            if (GLOBAL.EPG_Paging_Page > 0) {
                GLOBAL.EPG_Paging_Page = GLOBAL.EPG_Paging_Page - 1;
                this.addRows(GLOBAL.EPG_Paging_Page);
            }
        }
    };
    onSwipe(gestureName, gestureState) {
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
    onSwipeDown(gestureState) {
        if (GLOBAL.EPG_Paging_Page > 0) {
            GLOBAL.EPG_Paging_Page = GLOBAL.EPG_Paging_Page - 1;
            this.addRows(GLOBAL.EPG_Paging_Page);
        }
    }
    onSwipeUp(gestureState) {
        var pages =
            Math.ceil(this.props.channels.length / this.state.paging) - 1;
        if (GLOBAL.EPG_Paging_Page < pages) {
            GLOBAL.EPG_Paging_Page = GLOBAL.EPG_Paging_Page + 1;
            this.addRows(GLOBAL.EPG_Paging_Page);
        }
    }
    onSwipeRight(gestureState) {
        var offset = this.state.time_offset - 2;
        var check = this.checkIfWithin24Hours(this.state.time_offset - 2);
        if (check == true) {
            this.setState({
                time_offset: offset,
            });
            this.addRows(GLOBAL.EPG_Paging_Page);
        }
    }
    onSwipeLeft(gestureState) {
        var check = this.checkIfWithin24Hours(this.state.time_offset + 2);
        if (check == true) {
            var offset = this.state.time_offset + 2;
            this.setState({
                time_offset: offset,
            });
            this.addRows(GLOBAL.EPG_Paging_Page);
        }
    }
    getDates() {
        var max = GLOBAL.UserInterface.general.catchup_days;
        var min = (GLOBAL.UserInterface.general.catchup_days - 1) * -1;
        var dates = [];
        for (var i = min; i < max; i++) {
            var time_ = moment().add(i, 'days').format('dddd ll');
            dates.push({ time: time_, days: i });
        }
        return dates;
    }
    starTimer() {
        TimerMixin.clearTimeout(this.timeTimer);
        this.timeTimer = TimerMixin.setTimeout(() => {
            var timeNow = moment().unix();
            var timePrev = moment().add(-1, 'hour').startOf('hour').unix();
            var line = this.getCellWidth(timePrev, timeNow);
            var minutesNow = moment().format('mm');
            var timeNow = moment().format(GLOBAL.Clock_Setting);
            this.setState({
                time: moment().format(GLOBAL.Clock_Setting),
                red_line_minutes: minutesNow,
                red_line_minutes_time: timeNow,
                red_line_position: line,
            });
        }, 60000);
    }
    _handleAppStateChange = nextAppState => {
        if (nextAppState == 'background') {
            this.setState({
                videoUrl: GLOBAL.VIDEO_TEST_URL,
            });
        }
    };
    _disableTVEventHandler() {
        if (this._tvEventHandler) {
            this._tvEventHandler.disable();
            delete this._tvEventHandler;
        }
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsWebTV) {
            document.removeEventListener('keydown', this.backButton_, false);
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            this._disableTVEventHandler();
            // TVMenuControl.disableTVMenuKey();
        }
        TimerMixin.clearTimeout(this.timeTimer);
        TimerMixin.clearTimeout(this.zapTimer);
        if (GLOBAL.Device_IsSTB) {
            AppState.removeEventListener('change', this._handleAppStateChange);
        }
        Actions.pop();
    }
    backButton_ = event => {
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            this.goBack_();
        }
        if (event.keyCode == 40) {
            //down
            if (this.props.channels.length > GLOBAL.EPG_Row) {
                GLOBAL.EPG_Row = GLOBAL.EPG_Row + 1;
            }
            if (this.state.show_dates == true) {
                this.setState({
                    show_dates: false,
                });
            }
            if (this.state.show_groups == true) {
                this.setState({
                    show_groups: false,
                });
            }
            if (GLOBAL.EPG_Focussed_Row == 5) {
                var pages =
                    Math.ceil(this.props.channels.length / this.state.paging) -
                    1;
                if (GLOBAL.EPG_Paging_Page < pages) {
                    GLOBAL.EPG_Paging_Page = GLOBAL.EPG_Paging_Page + 1;
                    this.addRows(GLOBAL.EPG_Paging_Page);
                }
            }
        }
        if (event.keyCode == 38) {
            //up
            if (GLOBAL.EPG_Row > 0) {
                GLOBAL.EPG_Row = GLOBAL.EPG_Row - 1;
            }
            if (this.state.show_dates == true) {
                this.setState({
                    show_dates: false,
                });
            }
            if (this.state.show_groups == true) {
                this.setState({
                    show_groups: false,
                });
            }
            if (GLOBAL.EPG_Focussed_Row == 0) {
                if (GLOBAL.EPG_Paging_Page > 0) {
                    GLOBAL.EPG_Paging_Page = GLOBAL.EPG_Paging_Page - 1;
                    this.addRows(GLOBAL.EPG_Paging_Page);
                }
            }
        }
        if (event.keyCode == 39) {
            var check = this.checkIfWithin24Hours(this.state.time_offset + 2);
            if (GLOBAL.EPG_Focussed_Last_Program == true && check == true) {
                var offset = this.state.time_offset + 2;
                this.setState({
                    time_offset: offset,
                });
                this.addRows(GLOBAL.EPG_Paging_Page);
            }
        }
        if (event.keyCode == 37) {
            var check = this.checkIfWithin24Hours(this.state.time_offset - 2);
            if (GLOBAL.EPG_Focussed_First_Program == true && check == true) {
                var offset = this.state.time_offset - 2;
                this.setState({
                    time_offset: offset,
                });
                this.addRows(GLOBAL.EPG_Paging_Page);
            }
        }
    };
    componentDidMount() {
        if (GLOBAL.Device_IsPhone == false) {
            this.addRows(GLOBAL.EPG_Paging_Page);
            //this.starTimer();
        } else {
            this.getPrograms(0);
        }
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            document.addEventListener('keydown', this.backButton_, false);
        }
        if (GLOBAL.Device_IsAppleTV) {
            this._enableTVEventHandler();
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                this.goBack_();
                return true;
            },
        );
        if (GLOBAL.Device_IsSTB) {
            AppState.addEventListener('change', this._handleAppStateChange);
        }
        if (
            GLOBAL.Channels_Selected == undefined ||
            GLOBAL.Channels_Selected.length == 0
        ) {
            GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
            GLOBAL.Channels_Selected_Category_ID = GLOBAL.Channels[0].id;
            GLOBAL.Channels_Selected_Category_Index = UTILS.getCategoryIndex(
                GLOBAL.Channels_Selected_Category_ID,
            );
        }
        if (
            GLOBAL.Channels_Selected[GLOBAL.Channels_Selected_Index] ==
            undefined
        ) {
            GLOBAL.Channels_Selected_Index = 0;
        }

        var channel_id =
            GLOBAL.Channels_Selected[GLOBAL.Channels_Selected_Index].channel_id;
        var channel = UTILS.getChannel(channel_id);
        if (channel != undefined && channel != null) {
            var url = '';
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
            this.startMiniTV(url, channel);
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (keyEvent.keyCode == 20) {
                    //down
                    if (this.props.channels.length > GLOBAL.EPG_Row) {
                        GLOBAL.EPG_Row = GLOBAL.EPG_Row + 1;
                    }
                    if (this.state.show_dates == true) {
                        this.setState({
                            show_dates: false,
                        });
                    }
                    if (this.state.show_groups == true) {
                        this.setState({
                            show_groups: false,
                        });
                    }
                    if (GLOBAL.EPG_Focussed_Row == 5) {
                        var pages =
                            Math.ceil(
                                this.props.channels.length / this.state.paging,
                            ) - 1;
                        if (GLOBAL.EPG_Paging_Page < pages) {
                            GLOBAL.EPG_Paging_Page = GLOBAL.EPG_Paging_Page + 1;
                            GLOBAL.EPG_Row = 0;
                            this.addRows(GLOBAL.EPG_Paging_Page);
                        }
                    }
                }
                if (keyEvent.keyCode == 19) {
                    //up
                    if (GLOBAL.EPG_Row > 0) {
                        GLOBAL.EPG_Row = GLOBAL.EPG_Row - 1;
                    }
                    if (this.state.show_dates == true) {
                        this.setState({
                            show_dates: false,
                        });
                    }
                    if (this.state.show_groups == true) {
                        this.setState({
                            show_groups: false,
                        });
                    }
                    if (GLOBAL.EPG_Focussed_Row == 0) {
                        if (GLOBAL.EPG_Paging_Page > 0) {
                            GLOBAL.EPG_Paging_Page = GLOBAL.EPG_Paging_Page - 1;
                            GLOBAL.EPG_Row = 5;
                            this.addRows(GLOBAL.EPG_Paging_Page);
                        }
                    }
                }
                if (keyEvent.keyCode == 22) {
                    var check = this.checkIfWithin24Hours(
                        this.state.time_offset + 2,
                    );
                    if (
                        GLOBAL.EPG_Focussed_Last_Program == true &&
                        check == true
                    ) {
                        var offset = this.state.time_offset + 2;
                        this.setState({
                            time_offset: offset,
                        });
                        this.addRows(GLOBAL.EPG_Paging_Page);
                    }
                }
                if (keyEvent.keyCode == 21) {
                    var check = this.checkIfWithin24Hours(
                        this.state.time_offset - 2,
                    );
                    if (
                        GLOBAL.EPG_Focussed_First_Program == true &&
                        check == true
                    ) {
                        var offset = this.state.time_offset - 2;
                        this.setState({
                            time_offset: offset,
                        });
                        this.addRows(GLOBAL.EPG_Paging_Page);
                    }
                }
                return true;
            });
        }
    }

    checkIfWithin24Hours(time) {
        var prevTime = moment()
            .add(-2 + time, 'hour')
            .startOf('hour')
            .unix();
        var nextTime = moment()
            .add(-1 + time, 'hour')
            .startOf('hour')
            .unix();
        var midnightEnd = moment().endOf('day').unix();
        var midNightStart = moment().subtract(1, 'days').endOf('day').unix();
        if (prevTime > midNightStart && nextTime < midnightEnd) {
            return true;
        } else {
            return false;
        }
    }
    startMiniTV(url, channel) {
        if (channel.childlock == 1) {
            return;
        }

        url = url.toString().replace(' ', '');
        var type = 'video/mp4';
        if (url.indexOf('.mpd') > 0) {
            type = 'mpd';
        }
        if (url.indexOf('.m3u8') > 0) {
            type = 'm3u8';
        }
        var drmKey = '';
        if (channel.secure_stream == true && channel.drm_stream == false) {
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
                            videoUrl: url,
                            videoType: type,
                            channelSelected: channel,
                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,
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
                            videoUrl: url,
                            videoType: type,
                            channelSelected: channel,
                            drmKey: drmKey,
                            drmSupplierType: drmSupplierType,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmCertificateUrl: drmCertificateUrl,
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
                videoUrl: url,
                drmKey: drmKey,
                videoType: type,
                channel: channel,
            });
        }
    }
    getDeviceWidth() {
        if (GLOBAL.Device_IsPhone) {
            return GLOBAL.Device_Height;
        } else {
            return GLOBAL.Device_Width;
        }
    }
    getGridWidth() {
        const timeWidth = this.getDeviceWidth() - 240;
        return timeWidth;
    }
    getCellWidth(startTime, endTime) {
        const timeWidth = (this.getDeviceWidth() - 240) / 4;
        var nextTimeUnix = moment()
            .add(2 + this.state.time_offset, 'hour')
            .add(GLOBAL.EPG_Days, 'day')
            .startOf('hour')
            .unix();
        var prevTimeUnix = moment()
            .add(-2 + this.state.time_offset, 'hour')
            .add(GLOBAL.EPG_Days, 'day')
            .startOf('hour')
            .unix();
        if (startTime <= prevTimeUnix) {
            //de start tijd ligt voor de 2 uren
            let seconds = endTime - prevTimeUnix;
            let hour = seconds / 60 / 60;
            return hour * 2 * timeWidth;
        } else if (startTime < prevTimeUnix && endTime > nextTimeUnix) {
            //de eind tijd en start liggen buiten de 2 uren
            let seconds = nextTimeUnix - prevTimeUnix;
            let hour = seconds / 60 / 60;
            return hour * 2 * timeWidth;
        } else if (endTime > nextTimeUnix) {
            //de eind tijd ligt na de 2 uren
            let seconds = nextTimeUnix - startTime;
            let hour = seconds / 60 / 60;
            return hour * 2 * timeWidth;
        } else {
            //valt binnen de 2 uren easy
            let seconds = endTime - startTime;
            let hour = seconds / 60 / 60;
            return hour * 2 * timeWidth;
        }
    }
    onSearch() {
        GLOBAL.EPG = GLOBAL.EPG_TODAY;
        GLOBAL.EPG_Days = 0;
        GLOBAL.Focus = 'Redirect';
        Actions.Search();
    }
    onScrollHandler = () => {
        if (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) {
            const timeWidth = (this.getDeviceWidth() - 240) / 4;
            var timeNow = moment().unix();
            var timePrev = moment().add(-1, 'hour').startOf('hour').unix();
            var line = this.getCellWidth(timePrev, timeNow);
            var minutesNow = moment().format('mm');
            var timeNow = moment().format(GLOBAL.Clock_Setting);
            var newRecords = [];
            for (
                var i = page * this.state.paging, il = i + this.state.paging;
                i < il && i < this.props.channels.length;
                i++
            ) {
                newRecords.push(this.props.channels[i]);
            }
            this.setState({
                direction: this.state.page > page ? 'down' : 'up',
                page: page,
                rows: newRecords,
                rows_: newRecords,
                firstPage: true,
                red_line_position: line,
                red_line_minutes: minutesNow,
                red_line_minutes_time: timeNow,
            });
        }
    };
    focusProgramInternal = (program, row, lastProgram, firstProgram) => {
        var sameRow = true;
        if (GLOBAL.EPG_Focussed_Row != row) {
            sameRow = false;
        }
        GLOBAL.EPG_Focussed_Last_Program = lastProgram;
        GLOBAL.EPG_Focussed_First_Program = firstProgram;
        GLOBAL.EPG_Focussed_Row = row;

        this.focusProgram(
            program,
            row + this.state.page * this.state.paging,
            sameRow,
        );
    };
    focusProgram(program, index, sameRow) {
        GLOBAL.EPG_Channel = this.props.channels[index];
        var channel = UTILS.getChannel(this.props.channels[index].id);
        if (channel != undefined && channel != null && sameRow == false) {
            TimerMixin.clearTimeout(this.zapTimer);
            this.zapTimer = TimerMixin.setTimeout(() => {
                var url = '';
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
                if (url.indexOf('npplayout_') > -1) {
                    //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                    var queryString = '';
                    queryString += '&ads.did=' + GLOBAL.Device_UniqueID;
                    queryString += '&ads.app_name=' + GLOBAL.IMS;
                    queryString += '&ads.app_bundle=' + GLOBAL.Package;
                    //   queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                    queryString +=
                        '&ads.channel_name=' + encodeURI(channel.name);
                    queryString += '&ads.us_privacy=1---';
                    queryString += '&ads.schain=1';
                    queryString += '&ads.w=1980';
                    queryString += '&ads.h=1080';
                    url += queryString;
                }
                this.startMiniTV(url, channel);
            }, 2000);
        }
        if (
            !GLOBAL.Device_IsPhone &&
            !GLOBAL.Device_IsTablet &&
            !GLOBAL.Device_IsWebTV
        ) {
            setValue(program);
        }
        if (GLOBAL.Device_IsSmartTV) {
            setValue(program);
        }
    }
    getPrograms(index) {
        var programs = this.props.channels[index];
        var timeNow = moment().unix();
        if (programs != undefined) {
            var programIndex = programs.epgdata.findIndex(
                e => e.s <= timeNow && e.e >= timeNow,
            );
            this.setState({
                programs: programs.epgdata,
                channelIndex: index,
                scrollIndex: programIndex,
                dateToday: moment()
                    .add(GLOBAL.EPG_Days, 'days')
                    .format('dddd ll'),
            });
        }
    }
    addRows = page => {
        const timeWidth = (this.getDeviceWidth() - 240) / 4;
        var timeNow = moment().unix();
        var timePrev = moment().add(-1, 'hour').startOf('hour').unix();
        var line = this.getCellWidth(timePrev, timeNow);
        var minutesNow = moment().format('mm');
        var timeNow = moment().format(GLOBAL.Clock_Setting);
        var newRecords = [];
        for (
            var i = page * this.state.paging, il = i + this.state.paging;
            i < il && i < this.props.channels.length;
            i++
        ) {
            newRecords.push(this.props.channels[i]);
        }
        if (
            GLOBAL.Device_IsAndroidTV ||
            GLOBAL.Device_IsFireTV ||
            GLOBAL.Device_IsSTB
        ) {
            this.setState(
                {
                    rows_: [],
                    rows: [],
                },
                () => {
                    this.setState({
                        direction: this.state.page >= page ? 'down' : 'up',
                        page: page,
                        rows: newRecords,
                        rows_: newRecords,
                        firstPage: page == 0 ? true : false,
                        red_line_position: line,
                        red_line_minutes: minutesNow,
                        red_line_minutes_time: timeNow,
                        dateToday: moment()
                            .add(GLOBAL.EPG_Days, 'days')
                            .format('dddd ll'),
                    });
                },
            );
        } else {
            this.setState({
                direction: this.state.page >= page ? 'down' : 'up',
                page: page,
                rows: newRecords,
                rows_: newRecords,
                firstPage: page == 0 ? true : false,
                red_line_position: line,
                red_line_minutes: minutesNow,
                red_line_minutes_time: timeNow,
                dateToday: moment()
                    .add(GLOBAL.EPG_Days, 'days')
                    .format('dddd ll'),
            });
        }
    };
    _renderHeader = () => {
        if (this.props.error == true) {
            return null;
        }
        var hours_ = [];
        var prevTime = moment()
            .add(-1 + this.state.time_offset, 'hour')
            .startOf('hour')
            .format(GLOBAL.Clock_Setting);
        var prevTimeMid = moment()
            .add(-1 + this.state.time_offset, 'hour')
            .startOf('hour')
            .add(30, 'minutes')
            .format(GLOBAL.Clock_Setting);
        var nowTime = moment()
            .add(0 + +this.state.time_offset, 'hour')
            .startOf('hour')
            .format(GLOBAL.Clock_Setting);
        var nowTimeMid = moment()
            .add(0 + +this.state.time_offset, 'hour')
            .startOf('hour')
            .add(30, 'minutes')
            .format(GLOBAL.Clock_Setting);
        hours_.push({ time: prevTime });
        hours_.push({ time: prevTimeMid });
        hours_.push({ time: nowTime });
        hours_.push({ time: nowTimeMid });
        return (
            <View style={{ flexDirection: 'row' }}>
                {hours_.map((item, index) => (
                    <View
                        key={index}
                        style={{
                            flex: 1,
                            height: GLOBAL.EPG_RowHeight,
                            backgroundColor: 'transparent',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            borderLeftWidth: 2,
                            borderLeftColor: '#fff',
                            paddingHorizontal: 10,
                        }}
                    >
                        <Text
                            style={[
                                styles.Standard,
                                styles.Shadow,
                                { color: '#fff' },
                            ]}
                        >
                            {item.time}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };
    getIcons(channel, program, width) {
        var timestampNow = moment().unix();
        if (channel == undefined) {
            return;
        }
        if (channel.is_dveo == 1 || channel.is_flussonic == 1) {
            if (program.e > timestampNow && program.s > timestampNow) {
                if (
                    GLOBAL.EPG_Days > GLOBAL.UserInterface.general.catchup_days
                ) {
                    return;
                }
                if (GLOBAL.UserInterface.general.enable_recordings == false) {
                    return;
                }
                return (
                    <View
                        style={{
                            backgroundColor: 'crimson',
                            padding: 3,
                            marginHorizontal: GLOBAL.Device_IsAppleTV ? 10 : 5,
                            borderRadius: 100,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[
                                styles.IconsTelevision,
                                {
                                    color: '#fff',
                                    margin: GLOBAL.Device_IsAppleTV ? 5 : 2,
                                },
                            ]}
                            // icon={SolidIcons.dotCircle}
                            name="dot-circle"
                        />
                    </View>
                );
            } else if (program.e < timestampNow) {
                if (
                    GLOBAL.EPG_Days * -1 >
                    GLOBAL.UserInterface.general.catchup_days
                ) {
                    return;
                }
                if (GLOBAL.UserInterface.general.enable_catchuptv == false) {
                    return;
                }
                return (
                    <View
                        style={{
                            backgroundColor: 'royalblue',
                            padding: 3,
                            marginHorizontal: GLOBAL.Device_IsAppleTV ? 10 : 5,
                            borderRadius: 100,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[
                                styles.IconsTelevision,
                                {
                                    color: '#fff',
                                    margin: GLOBAL.Device_IsAppleTV ? 5 : 2,
                                },
                            ]}
                            // icon={SolidIcons.history}
                            name="history"
                        />
                    </View>
                );
            } else if (program.e > timestampNow && program.s < timestampNow) {
                return (
                    <View
                        style={{
                            backgroundColor: 'forestgreen',
                            padding: 3,
                            marginHorizontal: GLOBAL.Device_IsAppleTV ? 10 : 5,
                            borderRadius: 100,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[
                                styles.IconsTelevision,
                                {
                                    color: '#fff',
                                    margin: GLOBAL.Device_IsAppleTV ? 5 : 2,
                                },
                            ]}
                            // icon={SolidIcons.playCircle}
                            name="play-circle"
                        />
                    </View>
                );
            }
        } else {
            if (program.e > timestampNow && program.s < timestampNow) {
                return (
                    <View
                        style={{
                            backgroundColor: 'forestgreen',
                            padding: 3,
                            marginHorizontal: 5,
                            borderRadius: 100,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[
                                styles.IconsTelevision,
                                {
                                    color: '#fff',
                                    margin: GLOBAL.Device_IsAppleTV ? 5 : 2,
                                },
                            ]}
                            // icon={SolidIcons.playCircle}
                            name="play-circle"
                        />
                    </View>
                );
            }
        }
    }
    _renderPrograms = ({ item, index }) => {
        var channel = this.props.channels[this.state.channelIndex];
        return (
            <View
                style={{
                    borderRadius: 3,
                    width: GLOBAL.Device_Width,
                    height: 115,
                    backgroundColor: 'rgba(0, 0, 0, 0.40)',
                    margin: 5,
                }}
            >
                <View style={{ flex: 1 }}>
                    <TouchableHighlight
                        onPress={() =>
                            this.selectProgram(
                                this.state.channelIndex,
                                item,
                                channel,
                                0,
                            )
                        }
                        hasTVPreferredFocus={index == 0 ? true : false}
                        underlayColor={GLOBAL.Button_Color}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <View
                                style={{
                                    flex: 2,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 20,
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.H5,
                                        {
                                            color: '#fff',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        },
                                    ]}
                                >
                                    {moment
                                        .unix(item.s)
                                        .format(GLOBAL.Clock_Setting)}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 6,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                    margin: 10,
                                    padding: 20,
                                    borderRadius: 3,
                                }}
                            >
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 15,
                                        right: 10,
                                    }}
                                >
                                    {this.getIcons(
                                        channel,
                                        item,
                                        GLOBAL.Device_Width,
                                    )}
                                </View>

                                <View style={{ flexDirection: 'column' }}>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.H4,
                                            { color: '#fff', marginRight: 20 },
                                        ]}
                                    >
                                        {item.n}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.MediumPlus,
                                            { paddingRight: 10 },
                                        ]}
                                    >
                                        {item.d}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.MediumPlus]}
                                    >
                                        {moment
                                            .unix(item.s)
                                            .format(
                                                'dd ' + GLOBAL.Clock_Setting,
                                            )}{' '}
                                        -{' '}
                                        {moment
                                            .unix(item.e)
                                            .format(GLOBAL.Clock_Setting)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
        );
    };

    _renderRow = ({ item, index }) => {
        var nextTimeUnix = moment()
            .add(1 + this.state.time_offset, 'hour')
            .add(GLOBAL.EPG_Days, 'day')
            .startOf('hour')
            .unix();
        var prevTimeUnix = moment()
            .add(-1 + this.state.time_offset, 'hour')
            .add(GLOBAL.EPG_Days, 'day')
            .startOf('hour')
            .unix();
        var currentTimeUnix = moment().unix();
        var indexProgram = 0;
        var channel =
            this.props.channels[index + this.state.page * this.state.paging];
        const listItems = item.epgdata.map((program, index_) => {
            var validProgram = false;
            var liveProgram = false;
            var start = 0;
            var end = 0;
            var width = 0;
            const timeWidth = (this.getDeviceWidth() - 240) / 4;
            if (program.e > currentTimeUnix && program.s < currentTimeUnix) {
                liveProgram = true;
            }
            if (program.s >= prevTimeUnix && program.e <= nextTimeUnix) {
                start = program.s;
                end = program.e;
                validProgram = true;
            } else if (program.s > prevTimeUnix && program.s < nextTimeUnix) {
                start = program.s;
                end = nextTimeUnix;
                validProgram = true;
            } else if (
                program.s < prevTimeUnix &&
                program.e > prevTimeUnix &&
                program.e <= nextTimeUnix
            ) {
                start = prevTimeUnix;
                end = program.e;
                validProgram = true;
            } else if (program.s <= prevTimeUnix && program.e > nextTimeUnix) {
                start = prevTimeUnix;
                end = nextTimeUnix;
                validProgram = true;
            }

            if (validProgram == true) {
                var lastProgram = false;
                var firstProgram = false;
                if (program.e >= nextTimeUnix) {
                    lastProgram = true;
                }
                if (indexProgram == 0) {
                    firstProgram = true;
                }
                indexProgram++;
                let seconds = end - start;
                let hour = seconds / 60 / 60;
                var width = hour * 2 * timeWidth;
                return (
                    <View
                        style={{ width: width }}
                        key={indexProgram + '-' + index}
                    >
                        <View
                            style={{
                                backgroundColor:
                                    liveProgram == true ? '#111' : '#222',
                                margin: 1,
                            }}
                        >
                            <TouchableHighlightFocus
                                style={{
                                    height:
                                        GLOBAL.EPG_RowHeight +
                                        (GLOBAL.Device_IsSmartTV ? 10 : 0),
                                }}
                                BorderRadius={0}
                                onPress={() =>
                                    this.selectProgram(
                                        index_,
                                        program,
                                        channel,
                                        this.state.page,
                                    )
                                }
                                onFocusExtra={() =>
                                    this.focusProgramInternal(
                                        program,
                                        index,
                                        lastProgram,
                                        firstProgram,
                                    )
                                }
                                hasTVPreferredFocus={
                                    index == GLOBAL.EPG_Row && indexProgram == 1
                                        ? true
                                        : false
                                }
                                underlayColor={GLOBAL.Button_Color}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        paddingLeft: GLOBAL.Device_IsAppleTV
                                            ? 40
                                            : 5,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                    }}
                                >
                                    {this.getIcons(channel, program, width)}
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.MediumPlus,
                                            {
                                                color: '#fff',
                                                width: width - 30,
                                                paddingLeft: 5,
                                            },
                                        ]}
                                    >
                                        {program.n}{' '}
                                        {moment
                                            .unix(program.s)
                                            .format(GLOBAL.Clock_Setting)}{' '}
                                        -{' '}
                                        {moment
                                            .unix(program.e)
                                            .format(GLOBAL.Clock_Setting)}
                                    </Text>
                                </View>
                            </TouchableHighlightFocus>
                        </View>
                    </View>
                );
            }
        });
        return <View style={{ flex: 1, flexDirection: 'row' }}>{listItems}</View>;
    };

    _renderChannel = ({ item, index }) => {
        return (
            <View
                style={{
                    borderRightWidth: 6,
                    borderRightColor: '#000',
                    width: 240,
                    height:
                        GLOBAL.EPG_RowHeight +
                        (GLOBAL.Device_IsSmartTV ? 10 : 0),
                    backgroundColor: '#111',
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 1,
                }}
            >
                <View
                    style={{
                        width: 50,
                        paddingLeft: 10,
                        height:
                            GLOBAL.EPG_RowHeight +
                            (GLOBAL.Device_IsSmartTV ? 10 : 0),
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={[styles.Standard, { color: '#999' }]}
                    >
                        {item.number}
                    </Text>
                </View>
                <View
                    style={{
                        width: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        style={{ width: 30, height: 30 }}
                        source={{ uri: GLOBAL.ImageUrlCMS + item.icon }}
                    />
                </View>
                <View
                    style={{
                        width: 120,
                        paddingLeft: 10,
                        height:
                            GLOBAL.EPG_RowHeight +
                            (GLOBAL.Device_IsSmartTV ? 10 : 0),
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={[styles.Standard, { color: '#999' }]}
                    >
                        {item.name}
                    </Text>
                </View>
            </View>
        );
    };
    _renderChannelMobile = ({ item, index }) => {
        return (
            <TouchableHighlightFocus
                style={{ height: 120 }}
                onPress={() => this.getPrograms(index)}
                underlayColor={GLOBAL.Button_Color}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 100,
                        paddingHorizontal: 10,
                        width: 120,
                        borderRadius: 3,
                        margin: 5,
                        backgroundColor:
                            this.state.channelIndex == index
                                ? 'rgba(0, 0, 0, 0.40)'
                                : 'transparent',
                    }}
                >
                    <Image
                        style={{ width: 40, height: 40 }}
                        source={{ uri: GLOBAL.ImageUrlCMS + item.icon }}
                    />
                    <Text
                        numberOfLines={1}
                        style={[styles.Medium, { color: '#fff', paddingTop: 10 }]}
                    >
                        {item.name}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    };
    _renderChannelHeader = () => {
        return (
            <View style={{ flexDirection: 'row' }}>
                <View
                    style={{
                        flex: 1,
                        height: GLOBAL.EPG_RowHeight,
                        backgroundColor: '#',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        borderLeftWidth: 2,
                        borderLeftColor: 'transparent',
                        paddingHorizontal: 10,
                    }}
                ></View>
            </View>
        );
    };
    loadProgramDetails = dataFromChild => {
        value = dataFromChild[0];
        setValue = dataFromChild[1];
    };
    FocusButtons() {
        GLOBAL.EPG_Focussed_First_Program = false;
        GLOBAL.EPG_Focussed_Last_Program = false;
    }
    channelQty = channels => {
        var qty = channels.length;
        return qty;
    };
    render() {
        const timeWidth = (this.getDeviceWidth() - 240) / 4;
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80,
        };
        return (
            <View>
                {RenderIf(GLOBAL.Device_IsPhone == false)(
                    <View style={[{ flex: 1 }]}>
                        <View
                            style={[
                                {
                                    height:
                                        GLOBAL.Device_IsWebTV &&
                                            GLOBAL.Device_Manufacturer != 'LG WebOS'
                                            ? 100
                                            : GLOBAL.Device_Manufacturer ==
                                                'LG WebOS'
                                                ? 75
                                                : GLOBAL.EPG_GridHeight / 2,
                                    flex: 1,
                                    flexDirection: 'row',
                                },
                            ]}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingLeft: 25,
                                    paddingTop: GLOBAL.Device_IsTablet ? 25 : 0,
                                    zIndex: 9999,
                                }}
                            >
                                {RenderIf(
                                    this.state.firstPage == true ||
                                    GLOBAL.Device_IsPhone ||
                                    GLOBAL.Device_IsTablet ||
                                    (GLOBAL.Device_IsWebTV &&
                                        !GLOBAL.Device_IsSmartTV),
                                )(
                                    <ButtonAutoSize
                                        hasTVPreferredFocus={false}
                                        onFocusExtra={() => this.FocusButtons()}
                                        onFocus={() => this.FocusButtons()}
                                        underlayColor={GLOBAL.Button_Color}
                                        Icon={"arrow-left"}
                                        onPress={() => this.goBack_()}
                                        Text={LANG.getTranslation('back')}
                                    />,
                                )}
                                {RenderIf(
                                    GLOBAL.UserInterface.tv_guide
                                        .enable_epg_search == true,
                                )(
                                    <View>
                                        {RenderIf(
                                            this.state.firstPage == true ||
                                            GLOBAL.Device_IsPhone ||
                                            GLOBAL.Device_IsTablet ||
                                            (GLOBAL.Device_IsWebTV &&
                                                GLOBAL.Device_IsSmartTV ==
                                                false),
                                        )(
                                            <ButtonAutoSize
                                                hasTVPreferredFocus={false}
                                                onFocusExtra={() =>
                                                    this.FocusButtons()
                                                }
                                                onFocus={() =>
                                                    this.FocusButtons()
                                                }
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={"search"}
                                                onPress={() => this.onSearch()}
                                                Text={LANG.getTranslation(
                                                    'search',
                                                )}
                                            />,
                                        )}
                                        {RenderIf(
                                            this.state.firstPage == false &&
                                            !GLOBAL.Device_IsPhone &&
                                            !GLOBAL.Device_IsTablet &&
                                            !GLOBAL.Device_IsWebTV &&
                                            !GLOBAL.Device_IsSmartTV,
                                        )(
                                            <View
                                                style={[
                                                    GLOBAL.Device_IsAppleTV
                                                        ? styles.ButtonAutoSizeApple
                                                        : styles.ButtonAutoSize,
                                                    {
                                                        padding:
                                                            this.props
                                                                .Padding ==
                                                                undefined
                                                                ? GLOBAL.Device_IsAndroidTV ||
                                                                    GLOBAL.Device_IsFireTV
                                                                    ? GLOBAL.App_Theme ==
                                                                        'Rhodium' &&
                                                                        this.props
                                                                            .hideUnderlay ==
                                                                        true
                                                                        ? 6
                                                                        : 1
                                                                    : GLOBAL.Device_IsPhone
                                                                        ? 2
                                                                        : GLOBAL.Device_IsAppleTV
                                                                            ? 5
                                                                            : 3
                                                                : this.props
                                                                    .Padding,
                                                        margin: 7,
                                                        borderRadius: 3,
                                                    },
                                                ]}
                                            >
                                                <View
                                                    style={{
                                                        borderRadius: 3,
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        paddingHorizontal: 10,
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={{
                                                            color: '#fff',
                                                            fontSize: 20,
                                                        }}
                                                        // icon={SolidIcons.search}
                                                        name="search"
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.Standard,
                                                            { margin: 5 },
                                                        ]}
                                                    >
                                                        {LANG.getTranslation(
                                                            'search',
                                                        )}
                                                    </Text>
                                                </View>
                                            </View>,
                                        )}
                                    </View>,
                                )}
                                <View>
                                    {RenderIf(
                                        this.state.firstPage == true ||
                                        GLOBAL.Device_IsPhone ||
                                        GLOBAL.Device_IsTablet ||
                                        (GLOBAL.Device_IsWebTV &&
                                            GLOBAL.Device_IsSmartTV ==
                                            false),
                                    )(
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <ButtonAutoSize
                                                hasTVPreferredFocus={false}
                                                onFocusExtra={() =>
                                                    this.FocusButtons()
                                                }
                                                onFocus={() =>
                                                    this.FocusButtons()
                                                }
                                                Icon={"layer-group"}
                                                Padding={0}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                onPress={() =>
                                                    this.setState({
                                                        show_groups: true,
                                                        show_dates: false,
                                                    })
                                                }
                                                Text={
                                                    this.props.categories[
                                                        GLOBAL
                                                            .Channels_Selected_Category_Index
                                                    ].name +
                                                    ' (' +
                                                    this.props.categories[
                                                        GLOBAL
                                                            .Channels_Selected_Category_Index
                                                    ].channels.length +
                                                    ')'
                                                }
                                            />
                                            {RenderIf(
                                                this.state.show_groups ==
                                                true &&
                                                (GLOBAL.Device_IsWebTV ==
                                                    false ||
                                                    GLOBAL.Device_IsSmartTV ==
                                                    true),
                                            )(
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        zIndex: 9999,
                                                        width:
                                                            this.getDeviceWidth() /
                                                            2,
                                                        flexDirection: 'row',
                                                        backgroundColor: '#222',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenuMedium,
                                                            {
                                                                color: '#666',
                                                                paddingVertical: 5,
                                                            },
                                                        ]}
                                                        // icon={
                                                        //     SolidIcons.chevronLeft
                                                        // }
                                                        name="chevron-left"
                                                    />
                                                    <FlatList
                                                        data={
                                                            this.props
                                                                .categories
                                                        }
                                                        key={(item, index) =>
                                                            index.toString()
                                                        }
                                                        horizontal={true}
                                                        renderItem={({
                                                            item,
                                                            index,
                                                        }) => {
                                                            return (
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#222',
                                                                        padding: 2,
                                                                    }}
                                                                >
                                                                    <ButtonAutoSize
                                                                        hasTVPreferredFocus={
                                                                            index ==
                                                                                0
                                                                                ? true
                                                                                : false
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this.selectGroup(
                                                                                item.id,
                                                                            )
                                                                        }
                                                                        Text={
                                                                            item.name +
                                                                            ' (' +
                                                                            item
                                                                                .channels
                                                                                .length +
                                                                            ')'
                                                                        }
                                                                    />
                                                                </View>
                                                            );
                                                        }}
                                                        keyExtractor={(
                                                            item,
                                                            index,
                                                        ) => index.toString()}
                                                    />
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenuMedium,
                                                            {
                                                                color: '#666',
                                                                paddingVertical: 5,
                                                            },
                                                        ]}
                                                        // icon={
                                                        //     SolidIcons.chevronRight
                                                        // }
                                                        name="chevron-right"
                                                    />
                                                </View>,
                                            )}

                                            {RenderIf(
                                                this.state.show_groups ==
                                                true &&
                                                GLOBAL.Device_IsWebTV ==
                                                true &&
                                                GLOBAL.Device_IsSmartTV ==
                                                false,
                                            )(
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        zIndex: 99999,
                                                        top: GLOBAL.EPG_RowHeight,
                                                        flexDirection: 'column',
                                                        backgroundColor: '#222',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            backgroundColor:
                                                                '#222',
                                                            padding: 2,
                                                        }}
                                                    >
                                                        <ButtonSized
                                                            hasTVPreferredFocus={
                                                                false
                                                            }
                                                            Width={
                                                                GLOBAL.Device_Width /
                                                                5
                                                            }
                                                            Padding={0}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
                                                            onPress={() =>
                                                                this.setState({
                                                                    show_groups: false,
                                                                    show_dates: false,
                                                                })
                                                            }
                                                            Text={LANG.getTranslation(
                                                                'close',
                                                            )}
                                                        />
                                                    </View>
                                                    <FlatList
                                                        data={
                                                            this.props
                                                                .categories
                                                        }
                                                        key={(item, index) =>
                                                            index.toString()
                                                        }
                                                        horizontal={false}
                                                        numColumns={1}
                                                        renderItem={({
                                                            item,
                                                            index,
                                                        }) => {
                                                            return (
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#222',
                                                                        padding: 2,
                                                                    }}
                                                                >
                                                                    <ButtonSized
                                                                        Width={
                                                                            GLOBAL.Device_Width /
                                                                            5
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this.selectGroup(
                                                                                item.id,
                                                                            )
                                                                        }
                                                                        Text={
                                                                            item.name +
                                                                            ' (' +
                                                                            item
                                                                                .channels
                                                                                .length +
                                                                            ')'
                                                                        }
                                                                    />
                                                                </View>
                                                            );
                                                        }}
                                                        keyExtractor={(
                                                            item,
                                                            index,
                                                        ) => index.toString()}
                                                    />
                                                </View>,
                                            )}
                                        </View>,
                                    )}
                                    {RenderIf(
                                        this.state.firstPage == false &&
                                        !GLOBAL.Device_IsPhone &&
                                        !GLOBAL.Device_IsTablet &&
                                        !GLOBAL.Device_IsWebTV &&
                                        !GLOBAL.Device_IsSmartTV,
                                    )(
                                        <View
                                            style={[
                                                GLOBAL.Device_IsAppleTV
                                                    ? styles.ButtonAutoSizeApple
                                                    : styles.ButtonAutoSize,
                                                {
                                                    padding:
                                                        this.props.Padding ==
                                                            undefined
                                                            ? GLOBAL.Device_IsAndroidTV ||
                                                                GLOBAL.Device_IsFireTV
                                                                ? GLOBAL.App_Theme ==
                                                                    'Rhodium' &&
                                                                    this.props
                                                                        .hideUnderlay ==
                                                                    true
                                                                    ? 6
                                                                    : 1
                                                                : GLOBAL.Device_IsPhone
                                                                    ? 2
                                                                    : GLOBAL.Device_IsAppleTV
                                                                        ? 5
                                                                        : 3
                                                            : this.props
                                                                .Padding,
                                                    margin: 7,
                                                    borderRadius: 3,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={{
                                                    borderRadius: 3,
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    paddingHorizontal: 10,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={{
                                                        color: '#fff',
                                                        fontSize: 20,
                                                    }}
                                                    // icon={SolidIcons.layerGroup}
                                                    name="layer-group"
                                                />
                                                <Text
                                                    style={[
                                                        styles.Standard,
                                                        { margin: 5 },
                                                    ]}
                                                >
                                                    {
                                                        this.props.categories[
                                                            GLOBAL
                                                                .Channels_Selected_Category_Index
                                                        ].name
                                                    }
                                                </Text>
                                            </View>
                                        </View>,
                                    )}
                                </View>
                                <View>
                                    {RenderIf(
                                        this.state.firstPage == true ||
                                        GLOBAL.Device_IsPhone ||
                                        GLOBAL.Device_IsTablet ||
                                        this.props.error == true ||
                                        (GLOBAL.Device_IsWebTV &&
                                            GLOBAL.Device_IsSmartTV ==
                                            false),
                                    )(
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {RenderIf(
                                                this.state.show_groups == false,
                                            )(
                                                <ButtonAutoSize
                                                    hasTVPreferredFocus={false}
                                                    onFocusExtra={() =>
                                                        this.FocusButtons()
                                                    }
                                                    onFocus={() =>
                                                        this.FocusButtons()
                                                    }
                                                    Icon={
                                                        "calendar"
                                                    }
                                                    Width={150}
                                                    Padding={0}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this.setState({
                                                            show_dates: true,
                                                            show_groups: false,
                                                        })
                                                    }
                                                    Text={this.state.dateToday}
                                                />,
                                            )}
                                            {RenderIf(
                                                this.state.show_dates == true &&
                                                (GLOBAL.Device_IsWebTV ==
                                                    false ||
                                                    GLOBAL.Device_IsSmartTV ==
                                                    true),
                                            )(
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        zIndex: 9998,
                                                        width:
                                                            this.getDeviceWidth() /
                                                            2,
                                                        flexDirection: 'row',
                                                        backgroundColor: '#222',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenuMedium,
                                                            {
                                                                color: '#666',
                                                                paddingVertical: 5,
                                                            },
                                                        ]}
                                                        // icon={
                                                        //     SolidIcons.chevronLeft
                                                        // }
                                                        name="chevron-left"
                                                    />
                                                    <FlatList
                                                        data={this.state.dates}
                                                        key={(item, index) =>
                                                            index.toString()
                                                        }
                                                        horizontal={true}
                                                        renderItem={({
                                                            item,
                                                            index,
                                                        }) => {
                                                            return (
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#222',
                                                                        padding: 2,
                                                                    }}
                                                                >
                                                                    <ButtonAutoSize
                                                                        hasTVPreferredFocus={
                                                                            index ==
                                                                                0
                                                                                ? true
                                                                                : false
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this.selectDate(
                                                                                item.days,
                                                                            )
                                                                        }
                                                                        Text={
                                                                            item.time
                                                                        }
                                                                    />
                                                                </View>
                                                            );
                                                        }}
                                                        keyExtractor={(
                                                            item,
                                                            index,
                                                        ) => index.toString()}
                                                    />
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenuMedium,
                                                            {
                                                                color: '#666',
                                                                paddingVertical: 5,
                                                            },
                                                        ]}
                                                        // icon={
                                                        //     SolidIcons.chevronRight
                                                        // }
                                                        name="chevron-right"
                                                    />
                                                </View>,
                                            )}
                                            {RenderIf(
                                                this.state.show_dates == true &&
                                                GLOBAL.Device_IsWebTV ==
                                                true &&
                                                GLOBAL.Device_IsSmartTV ==
                                                false,
                                            )(
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        zIndex: 9998,
                                                        top: GLOBAL.EPG_RowHeight,
                                                        flexDirection: 'column',
                                                        backgroundColor: '#222',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            backgroundColor:
                                                                '#222',
                                                            padding: 2,
                                                        }}
                                                    >
                                                        <ButtonSized
                                                            hasTVPreferredFocus={
                                                                false
                                                            }
                                                            Width={
                                                                GLOBAL.Device_Width /
                                                                5
                                                            }
                                                            Padding={0}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
                                                            onPress={() =>
                                                                this.setState({
                                                                    show_groups: false,
                                                                    show_dates: false,
                                                                })
                                                            }
                                                            Text={LANG.getTranslation(
                                                                'close',
                                                            )}
                                                        />
                                                    </View>
                                                    <FlatList
                                                        data={this.state.dates}
                                                        key={(item, index) =>
                                                            index.toString()
                                                        }
                                                        horizontal={false}
                                                        numColumns={1}
                                                        renderItem={({
                                                            item,
                                                            index,
                                                        }) => {
                                                            return (
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            '#222',
                                                                        padding: 2,
                                                                    }}
                                                                >
                                                                    <ButtonSized
                                                                        Width={
                                                                            GLOBAL.Device_Width /
                                                                            5
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this.selectDate(
                                                                                item.days,
                                                                            )
                                                                        }
                                                                        Text={
                                                                            item.time
                                                                        }
                                                                    />
                                                                </View>
                                                            );
                                                        }}
                                                        keyExtractor={(
                                                            item,
                                                            index,
                                                        ) => index.toString()}
                                                    />
                                                </View>,
                                            )}
                                        </View>,
                                    )}
                                    {RenderIf(
                                        this.state.firstPage == false &&
                                        !GLOBAL.Device_IsPhone &&
                                        !GLOBAL.Device_IsTablet &&
                                        !GLOBAL.Device_IsWebTV &&
                                        !GLOBAL.Device_IsSmartTV,
                                    )(
                                        <View
                                            style={[
                                                GLOBAL.Device_IsAppleTV
                                                    ? styles.ButtonAutoSizeApple
                                                    : styles.ButtonAutoSize,
                                                {
                                                    padding:
                                                        this.props.Padding ==
                                                            undefined
                                                            ? GLOBAL.Device_IsAndroidTV ||
                                                                GLOBAL.Device_IsFireTV
                                                                ? GLOBAL.App_Theme ==
                                                                    'Rhodium' &&
                                                                    this.props
                                                                        .hideUnderlay ==
                                                                    true
                                                                    ? 6
                                                                    : 1
                                                                : GLOBAL.Device_IsPhone
                                                                    ? 2
                                                                    : GLOBAL.Device_IsAppleTV
                                                                        ? 5
                                                                        : 3
                                                            : this.props
                                                                .Padding,
                                                    margin: 7,
                                                    borderRadius: 3,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={{
                                                    borderRadius: 3,
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    paddingHorizontal: 10,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={{
                                                        color: '#fff',
                                                        fontSize: 20,
                                                    }}
                                                    // icon={
                                                    //     RegularIcons.calendarAlt
                                                    // }
                                                    name="calendar-alt"
                                                />
                                                <Text
                                                    style={[
                                                        styles.Standard,
                                                        { margin: 5 },
                                                    ]}
                                                >
                                                    {this.state.dateToday}
                                                </Text>
                                            </View>
                                        </View>,
                                    )}
                                </View>
                            </View>
                            <View
                                style={{
                                    width: 200,
                                    justifyContent: 'center',
                                    alignItems: 'flex-end',
                                    paddingRight: 25,
                                }}
                            >
                                <Text style={[styles.H1, styles.Shadow]}>
                                    {this.state.time}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[
                                {
                                    height:
                                        GLOBAL.EPG_GridHeight != null
                                            ? GLOBAL.EPG_GridHeight
                                            : 0,
                                    zIndex: GLOBAL.Device_IsWebTV ? -1 : 1,
                                    paddingTop:
                                        GLOBAL.Device_IsWebTV ||
                                            GLOBAL.Device_IsTablet
                                            ? 25
                                            : 0,
                                },
                            ]}
                        >
                            <GestureRecognizer
                                onSwipe={(direction, state) =>
                                    this.onSwipe(direction, state)
                                }
                                onSwipeLeft={state => this.onSwipeLeft(state)}
                                onSwipeRight={state => this.onSwipeRight(state)}
                                onSwipeUp={state => this.onSwipeUp(state)}
                                onSwipeDown={state => this.onSwipeDown(state)}
                                config={config}
                                style={{
                                    backgroundColor: 'transparent',
                                    width: this.getDeviceWidth(),
                                    height:
                                        GLOBAL.EPG_GridHeight != null
                                            ? GLOBAL.EPG_GridHeight
                                            : 0,
                                }}
                            >
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    <View>
                                        <FlatList
                                            data={this.state.rows_}
                                            key={(item, index) =>
                                                index.toString()
                                            }
                                            horizontal={false}
                                            numColumns={1}
                                            extraData={this.props.channels}
                                            scrollEnabled={false}
                                            getItemLayout={(data, index) => {
                                                return {
                                                    length: GLOBAL.EPG_RowHeight,
                                                    index,
                                                    offset:
                                                        GLOBAL.EPG_RowHeight *
                                                        index,
                                                };
                                            }}
                                            renderItem={this._renderChannel}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            ListHeaderComponent={
                                                this._renderChannelHeader
                                            }
                                        />
                                    </View>
                                    <View
                                        style={{
                                            width: timeWidth * 4,
                                            height: GLOBAL.EPG_GridHeight,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {RenderIf(
                                                GLOBAL.Device_IsWebTV == true &&
                                                GLOBAL.Device_IsSmartTV ==
                                                false &&
                                                this.state.rows != 0,
                                            )(
                                                <View
                                                    pointerEvents={'none'}
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                        position: 'absolute',
                                                        zIndex: 9999,
                                                        top: 0,
                                                        bottom: 0,
                                                        left: 0,
                                                    }}
                                                >
                                                    <TouchableHighlight
                                                        pointerEvents={
                                                            'box-none'
                                                        }
                                                        onPress={() =>
                                                            this.onSwipeRight()
                                                        }
                                                        style={{
                                                            height: 50,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.80)',
                                                            width: 50,
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                        }}
                                                    >
                                                        <FontAwesome5
                                                            style={[
                                                                styles.IconsMenu,
                                                                {},
                                                            ]}
                                                            // icon={
                                                            //     SolidIcons.arrowLeft
                                                            // }
                                                            name="arrow-left"
                                                        />
                                                    </TouchableHighlight>
                                                </View>,
                                            )}

                                            {RenderIf(
                                                GLOBAL.Device_IsWebTV == true &&
                                                GLOBAL.Device_IsSmartTV ==
                                                false &&
                                                this.state.page > 0,
                                            )(
                                                <View
                                                    pointerEvents={'none'}
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                        position: 'absolute',
                                                        zIndex: 9999,
                                                        left: 0,
                                                        right: 0,
                                                        top: GLOBAL.EPG_RowHeight,
                                                    }}
                                                >
                                                    <TouchableHighlight
                                                        pointerEvents={
                                                            'box-none'
                                                        }
                                                        onPress={() =>
                                                            this.onSwipeDown()
                                                        }
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.80)',
                                                            justifyContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <FontAwesome5
                                                            style={[
                                                                styles.IconsMenu,
                                                                {},
                                                            ]}
                                                            // icon={
                                                            //     SolidIcons.arrowUp
                                                            // }
                                                            name="arrow-up"
                                                        />
                                                    </TouchableHighlight>
                                                </View>,
                                            )}
                                            <FlatList
                                                data={this.state.rows}
                                                key={(item, index) =>
                                                    index.toString()
                                                }
                                                horizontal={false}
                                                numColumns={1}
                                                extraData={this.props.rows}
                                                scrollEnabled={false}
                                                keyExtractor={(item, index) =>
                                                    index.toString()
                                                }
                                                getItemLayout={(
                                                    data,
                                                    index,
                                                ) => {
                                                    return {
                                                        length:
                                                            GLOBAL.EPG_RowHeight +
                                                            2,
                                                        index,
                                                        offset:
                                                            (GLOBAL.EPG_RowHeight +
                                                                2) *
                                                            index,
                                                    };
                                                }}
                                                renderItem={this._renderRow}
                                                ListHeaderComponent={
                                                    this._renderHeader
                                                }
                                                removeClippedSubviews={true}
                                            />
                                            {RenderIf(
                                                GLOBAL.Device_IsWebTV == true &&
                                                GLOBAL.Device_IsSmartTV ==
                                                false &&
                                                this.state.rows.length >=
                                                this.state.paging,
                                            )(
                                                <View
                                                    pointerEvents={'none'}
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                        position: 'absolute',
                                                        zIndex: 9999,
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                    }}
                                                >
                                                    <TouchableHighlight
                                                        pointerEvents={
                                                            'box-none'
                                                        }
                                                        onPress={() =>
                                                            this.onSwipeUp()
                                                        }
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.80)',
                                                            justifyContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <FontAwesome5
                                                            style={[
                                                                styles.IconsMenu,
                                                                {},
                                                            ]}
                                                            // icon={
                                                            //     SolidIcons.arrowDown
                                                            // }
                                                            name="arrow-down"
                                                        />
                                                    </TouchableHighlight>
                                                </View>,
                                            )}
                                            {RenderIf(
                                                GLOBAL.Device_IsWebTV == true &&
                                                GLOBAL.Device_IsSmartTV ==
                                                false &&
                                                this.state.rows != 0,
                                            )(
                                                <View
                                                    pointerEvents={'none'}
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent:
                                                            'center',
                                                        alignItems: 'center',
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                    }}
                                                >
                                                    <TouchableHighlight
                                                        pointerEvents={
                                                            'box-none'
                                                        }
                                                        onPress={() =>
                                                            this.onSwipeLeft()
                                                        }
                                                        style={{
                                                            height: 50,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.80)',
                                                            width: 50,
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                        }}
                                                    >
                                                        <FontAwesome5
                                                            style={[
                                                                styles.IconsMenu,
                                                                {},
                                                            ]}
                                                            // icon={
                                                            //     SolidIcons.arrowRight
                                                            // }
                                                            name="arrow-right"
                                                        />
                                                    </TouchableHighlight>
                                                </View>,
                                            )}
                                            {RenderIf(
                                                this.state.rows.length > 0 &&
                                                this.state.time_offset ==
                                                0 &&
                                                GLOBAL.Device_IsAppleTV ==
                                                false &&
                                                GLOBAL.EPG_Days == 0,
                                            )(
                                                <View
                                                    pointerEvents="none"
                                                    style={[
                                                        {
                                                            position:
                                                                'absolute',
                                                            width: this.state
                                                                .red_line_position,
                                                            height:
                                                                (GLOBAL.EPG_RowHeight +
                                                                    2 +
                                                                    (GLOBAL.Device_IsSmartTV
                                                                        ? 10
                                                                        : 0)) *
                                                                this.state.rows
                                                                    .length,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.00)',
                                                            borderRightColor:
                                                                '#fff',
                                                            borderRightWidth: 4,
                                                            top: GLOBAL.EPG_RowHeight,
                                                            left: 0,
                                                            zIndex: 9999,
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.Small,
                                                            styles.Shadow,
                                                            {
                                                                flex: 1,
                                                                justifyContent:
                                                                    'flex-end',
                                                                alignContent:
                                                                    'flex-end',
                                                                alignItems:
                                                                    'flex-end',
                                                                alignSelf:
                                                                    'flex-end',
                                                                color: '#fff',
                                                                paddingRight: 5,
                                                            },
                                                        ]}
                                                    >
                                                        {' '}
                                                        {
                                                            this.state
                                                                .red_line_minutes
                                                        }{' '}
                                                        {LANG.getTranslation(
                                                            'min',
                                                        )}{' '}
                                                    </Text>
                                                </View>,
                                            )}
                                        </View>
                                        {RenderIf(this.props.error == true)(
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <ButtonAutoSize
                                                    Icon={
                                                        "exclamation-triangle"
                                                    }
                                                    hasTVPreferredFocus={true}
                                                    Padding={0}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this.getEpgData(
                                                            GLOBAL.EPG_Days,
                                                        )
                                                    }
                                                    Text={LANG.getTranslation(
                                                        'error_try_later',
                                                    )}
                                                />
                                                <ButtonAutoSize
                                                    Icon={"arrow-left"}
                                                    hasTVPreferredFocus={false}
                                                    Padding={0}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this.goBack_()
                                                    }
                                                    Text={LANG.getTranslation(
                                                        'return_home',
                                                    )}
                                                />
                                            </View>,
                                        )}
                                    </View>
                                </View>
                            </GestureRecognizer>
                        </View>
                        {RenderIf(
                            GLOBAL.Device_IsWebTV && GLOBAL.Device_IsSmartTV,
                        )(
                            <View
                                style={[
                                    {
                                        height:
                                            GLOBAL.Device_Manufacturer ==
                                                'Samsung Tizen'
                                                ? 275
                                                : 150,
                                        flexDirection: 'row',
                                        backgroundColor: 'rgba(0, 0, 0, 0.30)',
                                        paddingTop:
                                            GLOBAL.Device_Manufacturer ==
                                                'Samsung Tizen'
                                                ? 0
                                                : 50,
                                        marginTop:
                                            GLOBAL.Device_Manufacturer ==
                                                'Samsung Tizen'
                                                ? 0
                                                : 30,
                                    },
                                ]}
                            >
                                <View
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    {RenderIf(
                                        this.props.error == false &&
                                        this.state.rows.length > 0,
                                    )(
                                        <Program
                                            onMount={this.loadProgramDetails}
                                        ></Program>,
                                    )}
                                </View>
                            </View>,
                        )}
                        {RenderIf(
                            !GLOBAL.Device_IsPhone &&
                            !GLOBAL.Device_IsTablet &&
                            !GLOBAL.Device_IsWebTV,
                        )(
                            <View
                                style={[
                                    {
                                        flex: 1.5,
                                        flexDirection: 'row',
                                        backgroundColor: 'rgba(0, 0, 0, 0.30)',
                                    },
                                ]}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        paddingTop: GLOBAL.Device_IsAppleTV
                                            ? 30
                                            : 0,
                                    }}
                                >
                                    {RenderIf(
                                        this.props.error == false &&
                                        this.state.rows.length > 0,
                                    )(
                                        <Program
                                            onMount={this.loadProgramDetails}
                                        ></Program>,
                                    )}
                                </View>
                                {RenderIf(
                                    this.state.rows.length > 0 &&
                                    this.state.channel.childlock != 1 &&
                                    GLOBAL.UserInterface.tv_guide
                                        .enable_tv_preview_screen == true &&
                                    this.state.videoUrl != '',
                                )(
                                    <View
                                        style={{
                                            backgroundColor: '#000',
                                            width: this.getDeviceWidth() / 3.5,
                                            height: '100%',
                                        }}
                                    >
                                        <Video
                                            ref={ref => {
                                                this.player = ref;
                                            }}
                                            source={{
                                                uri: this.state.videoUrl,
                                                type: this.state.videoType,
                                                drmUrl: this.state.drmUrl,
                                                drmKeyServerUrl:
                                                    GLOBAL.DrmKeyServerUrl,
                                                ref: 'player',
                                                headers: {
                                                    'User-Agent':
                                                        GLOBAL.User_Agent,
                                                },
                                                drm: TOKEN.getDrmSetup(
                                                    this.state.drmSupplierType,
                                                    this.state
                                                        .drmLicenseServerUrl,
                                                    this.state
                                                        .drmCertificateUrl,
                                                    this.state.drmKey,
                                                ),
                                            }}
                                            disableFocus={true}
                                            style={{
                                                flex: 1,
                                                width: '100%',
                                                height: '100%',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                            }}
                                            resizeMode="stretch"
                                            paused={false}
                                            repeat={false}
                                            selectedAudioTrack={{
                                                type: 'index',
                                                value: 0,
                                            }}
                                        />
                                    </View>,
                                )}
                            </View>,
                        )}
                    </View>,
                )}
            </View>
        );
    }
}
