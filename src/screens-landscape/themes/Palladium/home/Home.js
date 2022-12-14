import React, { Component } from 'react';
import {
    Text,
    BackHandler,
    TVMenuControl,
    Image,
    View,
    ImageBackground,
    TouchableHighlight,
    ActivityIndicator,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import Video from 'react-native-video/dom/Video';
import { ScrollView } from 'react-native-gesture-handler';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import Menu from '../menu/Menu';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { sendPageReport } from '../../../../reporting/reporting';

export default class Home extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        var movies = [];
        var series = [];
        var channels = [];
        var apps = [];
        var news = [];
        var hero_movie = '';
        var hero_index = 0;
        var movie = [];

        var screen_width =
            GLOBAL.Device_Width -
            (GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV
                ? 220
                : GLOBAL.Device_IsAppleTV ||
                    GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                    ? 220
                    : 110);
        var channel_width = screen_width / 2;
        var screen_width_content_part = screen_width / 2 / 10;
        var series_width = screen_width_content_part * 6;
        var movies_width = screen_width_content_part * 4;

        GLOBAL.PIN_SET = false;
        GLOBAL.Focus = 'Home';
        GLOBAL.IsHomeLoaded = true;
        GLOBAL.Hamburger = false;
        if (GLOBAL.Metro != undefined) {
            if (GLOBAL.Metro.metromovieitems != undefined) {
                var movies_ = GLOBAL.Metro.metromovieitems;
                movies = UTILS.getHomeMoviesMixedFavorites(movies_);
                // if (movies.length > 0) {
                //     var random = Math.floor(Math.random() * movies.length);
                //     hero_index = random;
                //     var movie = movies[random];
                //     hero_movie = movie;
                // }
                //movie = movies[0];
            }
            if (GLOBAL.Metro.metroserieitems != undefined) {
                series = GLOBAL.Metro.metroserieitems;
                //series = UTILS.getHomeSeriesMixedFavorites(series_);
            }
            if (GLOBAL.Metro.metrortvitems != undefined) {
                var channels_ = GLOBAL.Metro.metrortvitems;
                var channelsIn = channels_.sort(
                    (a, b) => a.channel_number - b.channel_number,
                );
                var mixed_channels =
                    UTILS.getHomeChannelsMixedFavorites(channelsIn);
                var channelsOut = mixed_channels.slice(0, 20);
                channels = channelsOut;
            }
            if (GLOBAL.Metro.metroappitems != undefined) {
                var apps = GLOBAL.Metro.metroappitems;
            }
            if (GLOBAL.Metro.metronewsitems != undefined) {
                news = GLOBAL.Metro.metronewsitems;
            }
        }

        GLOBAL.EPG_Search_Channels = [];
        GLOBAL.EPG_Search_EPG = [];

        this.state = {
            reportStartTime: moment().unix(),
            enableScrollViewScroll: true,
            hero_index: hero_index,
            movies: movies,
            series: series,
            channels: channels,
            apps: apps,
            favorites: GLOBAL.Favorite_Channels,
            popup_loader_: false,
            progress: 0,
            downloaded_: 0,
            size_: 0,
            news: news,
            backdrop: GLOBAL.Background,
            hero_movie: hero_movie,
            watched: this.getContinueWatching(),
            leftbanner: GLOBAL.HTTPvsHTTPS + '',
            rightbanner: GLOBAL.HTTPvsHTTPS + '',
            newsimage: GLOBAL.Logo,
            newstext: 'No news at the moment...',
            newsdate: moment().format('LL'),
            newsindex: 0,
            log: '',
            ads: [],
            show_numeric: false,
            numeric_number: '',
            update: '',
            numeric_color: 'rgba(10, 10, 10, 0.83)',
            progressWidth: 0,
            channelRowHeight: 0,
            movieRowHeight: 0,
            seriesRowHeight: 0,
            imagewidth: 0,
            imageheight: 0,
            show_exit_app: false,
            bannerheight: 0,
            bottombanner: GLOBAL.HTTPvsHTTPS + '',

            campaignbackdrop: '',
            campaignemail: '',
            campaignid: '',
            campaignstream: '',
            campaigntext: '',
            campaignenabled: false,

            campaignbackdrop2: '',
            campaignemail2: '',
            campaignid2: '',
            campaignstream2: '',
            campaigntext2: '',
            campaignenabled2: false,

            channel_row_focussed: true,
            movies_row_focussed: true,
            series_row_focussed: true,
            apps_row_focussed: true,

            movie: movie,

            videoUrl: GLOBAL.HTTPvsHTTPS + '',
            videoType: 'mp4',
            drmKey: '',
            paused: false,
            channelSelected: [],

            channel_width: channel_width,
            series_width: series_width,
            movies_width: movies_width,

            flex_player: 45,
            show_player: true,
            fullscreen_player: false,
            time: moment().format(GLOBAL.Clock_Setting),
            show_program: '',

            show_side_panel: false,
            show_bottom_panel: false,
            show_settings_panel: false,
            show_interactivetv_panel: false,
            show_bottom_player: false,
            show_parental_panel: true,

            live: true,
            catchup: false,

            program_now: [],
            program_next: [],
            program_previous: [],

            channel_now: [],
            channel_next: [],
            channel_previous: [],

            current_channel_index: 0,
            current_program_index: 0,

            main_menu: true,
            subtitle_menu: false,
            audio_menu: false,
            screensize_menu: false,
            problem_menu: false,

            text_tracks: [],
            audio_tracks: [],
            duration: 0,
            buffering: false,
            text_track_index: 999,
            text_track_type: 'disabled',
            audio_track_index: 0,
            rate: 1,
            paused: false,
            resizeMode: 'cover',

            loading: false,
            thanks_problem: false,

            current_time: 0,
            playable_duration: 0,

            buffer_config: {
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
            },
        };
        this.focusChannel = this.focusChannel.bind(this);
        this.selectChannel = this.selectChannel.bind(this);
        this.pressChannel = this.pressChannel.bind(this);
    }

    onImageLoaded(imageUrl) {
        Image.getSize(imageUrl, (Width, Height) => {
            if (this.state.imagewidth == 0) {
                var height_screen_item = this.state.seriesRowHeight - 10;
                var ratio = height_screen_item / Height;
                var image_height = height_screen_item;
                var image_width = Width * ratio;
                this.setState({
                    imagewidth: image_width,
                    imageheight: image_height,
                });
            }
        });
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
            if (GLOBAL.AppIsLauncher == true) {
                return;
            }

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
    };
    updateDimensions() {
        Actions.Home();
    }
    componentDidMount() {
        if (
            this.state.channels.length > 0 ||
            GLOBAL.HomePlayChannelStarted == true
        ) {
            if (
                GLOBAL.Channels_Selected == undefined ||
                GLOBAL.Channels_Selected.length == 0
            ) {
                GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
                GLOBAL.Channels_Selected_Category_ID = GLOBAL.Channels[0].id;
                GLOBAL.Channels_Selected_Category_Index =
                    UTILS.getCategoryIndex(
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
                GLOBAL.Channels_Selected[GLOBAL.Channels_Selected_Index]
                    .channel_id;
            var channel = UTILS.getChannel(channel_id);

            this.startTV(channel.url_low, channel);
        }

        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        REPORT.set({ type: 21 });
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.state.show_side_panel == true) {
                    this.setState({
                        show_side_panel: false,
                    });
                    return;
                } else if (this.state.show_interactivetv_panel == true) {
                    if (this.state.thanks_problem == true) {
                        this.setState({
                            thanks_problem: false,
                            problem_menu: true,
                        });
                    } else if (this.state.problem_menu == true) {
                        this.setState({
                            problem_menu: false,
                            main_menu: true,
                        });
                    } else if (this.state.audio_menu == true) {
                        this.setState({
                            audio_menu: false,
                            main_menu: true,
                        });
                    } else if (this.state.subtitle_menu == true) {
                        this.setState({
                            subtitle_menu: false,
                            main_menu: true,
                        });
                    } else if (this.state.screensize_menu == true) {
                        this.setState({
                            screensize_menu: false,
                            main_menu: true,
                        });
                    } else {
                        this.setState({
                            show_interactivetv_panel: false,
                            main_menu: true,
                        });
                    }
                    return;
                } else if (this.state.fullscreen_player == true) {
                    this.setState({
                        fullscreen_player: false,
                    });
                    return;
                } else {
                    if (GLOBAL.Hamburger == true) {
                        return;
                    }
                    if (GLOBAL.AppIsLauncher == true) {
                        return;
                    }

                    if (this.state.show_exit_app == false) {
                        this.setState({
                            show_exit_app: true,
                        });
                        this.starExitTimer();
                        return true;
                    } else {
                        UTILS.closeAppAndLogout();
                        BackHandler.exitApp();
                        return true;
                    }
                }
            },
        );
        this.getNews();
        const date = moment().format('DD_MM_YYYY');
        if (GLOBAL.EPG_DATE_LOADED != date) {
            this.getEpgData();
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (keyEvent.keyCode == 21) {
                    if (
                        this.state.fullscreen_player == true &&
                        this.state.show_bottom_panel == false &&
                        this.state.show_interactivetv_panel == false
                    ) {
                        this.setState({
                            show_side_panel: true,
                        });
                    } else if (
                        this.state.fullscreen_player == true &&
                        this.state.show_side_panel == false &&
                        this.state.show_bottom_panel == true &&
                        this.state.show_interactivetv_panel == false
                    ) {
                        this.startBottomBarTimer();
                        this.updateProgramInformation(-1);
                    } else if (this.state.show_interactivetv_panel == true) {
                        this.setState({
                            show_interactivetv_panel: false,
                        });
                    }
                }
                if (keyEvent.keyCode == 22) {
                    if (
                        this.state.fullscreen_player == true &&
                        this.state.show_bottom_panel == false &&
                        this.state.show_side_panel == false
                    ) {
                        this.setState({
                            show_interactivetv_panel: true,
                        });
                    } else if (
                        this.state.fullscreen_player == true &&
                        this.state.show_side_panel == false &&
                        this.state.show_bottom_panel == true &&
                        this.state.show_interactivetv_panel == false
                    ) {
                        this.startBottomBarTimer();
                        this.updateProgramInformation(1);
                    } else if (this.state.show_side_panel == true) {
                        this.setState({
                            show_side_panel: false,
                        });
                    }
                }
                if (keyEvent.keyCode == 19) {
                    if (
                        this.state.show_bottom_panel == false &&
                        this.state.show_interactivetv_panel == false &&
                        this.state.show_side_panel == false &&
                        this.state.fullscreen_player == true
                    ) {
                        this.startBottomBarTimer();
                        this.setState({
                            show_bottom_panel: true,
                        });
                    } else if (
                        this.state.show_bottom_panel == true &&
                        this.state.show_interactivetv_panel == false
                    ) {
                        this.startBottomBarTimer();
                        this.changeChannelProgramInformation(-1);
                    }
                }
                if (keyEvent.keyCode == 20) {
                    if (
                        this.state.show_bottom_panel == false &&
                        this.state.show_interactivetv_panel == false &&
                        this.state.show_side_panel == false &&
                        this.state.fullscreen_player == true
                    ) {
                        this.startBottomBarTimer();
                        this.setState({
                            show_bottom_panel: true,
                        });
                    } else if (
                        this.state.show_bottom_panel == true &&
                        this.state.show_interactivetv_panel == false
                    ) {
                        this.startBottomBarTimer();
                        this.changeChannelProgramInformation(1);
                    }
                }
                //}
                return true;
            });
        }
    }
    starExitTimer() {
        TimerMixin.clearTimeout(this.exittimer);
        this.exittimer = TimerMixin.setTimeout(() => {
            this.setState({
                show_exit_app: false,
            });
        }, 2000);
    }
    getEpgData() {
        const date = moment().format('DD_MM_YYYY');
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
        GLOBAL.EPG = [];
        GLOBAL.EPG_TODAY = [];
        DAL.getJson(path)
            .then(data => {
                if (data != null) {
                    GLOBAL.EPG = data.channels;
                    GLOBAL.EPG_TODAY = data.channels;
                    GLOBAL.EPG_DATE_LOADED = date;
                    if (GLOBAL.User.products.ChannelPackages.length > 0) {
                        this.getExtraEpg(0, 0);
                    }
                }
            })
            .catch(error => { });
    }
    getExtraEpg(days, id) {
        if (id < GLOBAL.User.products.ChannelPackages.length) {
            const date = moment().subtract(days, 'days').format('DD_MM_YYYY');
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
            DAL.getJson(path).then(data => {
                data.channels.forEach(function (element) {
                    GLOBAL.EPG = GLOBAL.EPG.concat(element);
                    GLOBAL.EPG_TODAY = GLOBAL.EPG_TODAY.concat(element);
                });
                GLOBAL.EPG_DATE_LOADED = date;
                if (GLOBAL.User.products.ChannelPackages.length > 0) {
                    this.getExtraEpg(0, id + 1);
                }
            });
        }
    }
    componentWillUnmount() {
        sendPageReport('Home', this.state.reportStartTime, moment().unix());
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        TimerMixin.clearTimeout(this.numericTimer);
        TimerMixin.clearInterval(this.clocktimer);
        TimerMixin.clearTimeout(this.exittimer);
        TimerMixin.clearTimeout(this.focusTimer);
        Actions.pop();
    }
    getCatchupIcon(channel, epg) {
        if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
            return (
                <FontAwesome5
                    style={styles.IconsTelevision}
                    // icon={SolidIcons.undo}
                    name="undo"
                />
            );
        }
    }
    getRecordingIcon(channel, epg) {
        if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
            return (
                <FontAwesome5
                    style={styles.IconsTelevision}
                    // icon={SolidIcons.dotCircle}
                    name="dot-circle"
                />
            );
        }
    }
    onNews(updown) {
        if (this.state.news.length > 0) {
            var newIndex = this.state.newsindex + updown;
            if (newIndex == this.state.news.length) {
                newIndex = 0;
            } else if (newIndex < 0) {
                newIndex = this.state.news.length - 1;
            }
            this.setState({
                newsimage: GLOBAL.ImageUrlCMS + this.state.news[newIndex].image,
                newstext: this.state.news[newIndex].description,
                newsindex: newIndex,
            });
        }
    }

    getContinueWatching() {
        var cw = [];
        GLOBAL.Progress_Movies.forEach(movie => {
            if (movie.item != undefined) {
                var tz = moment().unix() - 36000;
                if (movie.tz != undefined) {
                    tz = movie.tz;
                }
                var item_ = {
                    item: movie.item,
                    type: 'movie',
                    tz: tz,
                };
                cw.push(item_);
            }
        });
        GLOBAL.Progress_Seasons.forEach(season => {
            if (season.item != undefined) {
                var tz = moment().unix() - 36000;
                if (season.tz != undefined) {
                    tz = season.tz;
                }
                var item_ = {
                    item: season.item,
                    type: 'season',
                    tz: tz,
                };
                cw.push(item_);
            }
        });
        var out = cw.sort(function (a, b) {
            return parseInt(b.tz) - parseInt(a.tz);
        });
        return out;
    }
    startTV(url, channel) {
        if (channel.childlock == 1) {
            return;
        }
        //url = "https://multiplatform-f.akamaihd.net/i/multi/april11/sintel/sintel-hd_,512x288_450_b,640x360_700_b,768x432_1000_b,1024x576_1400_m,.mp4.csmil/master.m3u8"
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
            this.setState({
                player_type: 'exo',
            });
            var drm = TOKEN.getWidevineDRM(url, channel);
            url = drm.url;
            drmKey = drm.drmKey;
        } else if (channel.akamai_token == true) {
            url = TOKEN.getAkamaiToken(url);
        } else if (channel.flussonic_token == true) {
            url = TOKEN.getFlussonicToken(url);
        }
        var udp = false;
        if (url.indexOf('udp://') > -1) {
            udp = true;
        }
        var currentUnix = moment().unix();
        var program = 'No Information Available';
        var epg_check = GLOBAL.EPG.find(e => e.id == channel.channel_id);

        var program_now = [];
        var program_next = [];
        var program_previous = [];
        var currentProgramIndex = 0;
        if (epg_check != undefined) {
            epg_ = epg_check.epgdata;
            currentProgramIndex = epg_.findIndex(function (element) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            if (currentProgramIndex != undefined) {
                if (epg_[currentProgramIndex] != null) {
                    currentProgram = epg_[currentProgramIndex];
                    program_now = epg_[currentProgramIndex];
                    program = currentProgram.n;
                }
                if (epg_[currentProgramIndex + 1] != null) {
                    program_next = epg_[currentProgramIndex + 1];
                }
                if (epg_[currentProgramIndex - 1] != null) {
                    program_previous = epg_[currentProgramIndex - 1];
                }
            }
        }
        var channel_next = [];
        var channel_previous = [];
        var currentChannelIndex = this.state.channels.findIndex(
            c => c.channel_id == channel.channel_id,
        );
        if (this.state.channels[currentChannelIndex + 1] != undefined) {
            channel_next = this.state.channels[currentChannelIndex + 1];
        }
        if (this.state.channels[currentChannelIndex - 1] != undefined) {
            channel_previous = this.state.channels[currentChannelIndex - 1];
        }
        this.setState({
            program_now: program_now,
            program_next: program_next,
            program_previous: program_previous,
            channel_next: channel_next,
            channel_now: channel,
            channel_previous: channel_previous,
            current_channel_index: currentChannelIndex,
            current_program_index: currentProgramIndex,
            videoUrl: url,
            drmKey: drmKey,
            videoType: type,
            channelSelected: channel,
            show_program: program,
            buffer_config: {
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: udp == true ? 1000 : 2500,
                bufferForPlaybackAfterRebufferMs: udp == true ? 2000 : 5000,
            },
        });
    }
    getSubText(series) {
        return series.name + ' / ' + series.episodes.length + ' Episodes';
    }
    _openSelectedApp(item) {
        DeviceInfo.getAppInstalled(item.package_name).then(installed => {
            if (installed == true) {
                ReactNativeAPK.runApp(item.package_name);
            } else {
                this.setState({
                    popup_loader_: true,
                });
                var url = item.url;
                RNFetchBlob.config({
                    fileCache: true,
                    appendExt: 'apk',
                })
                    .fetch('GET', url, {})
                    .progress((received, total) => {
                        this.setState({
                            progress:
                                Math.round(received / 1000) +
                                'Kb / ' +
                                Math.round(total / 1000) +
                                'Kb',
                        });
                    })
                    .then(res => {
                        this.setState({
                            popup_loader_: false,
                        });
                        ReactNativeAPK.installApp(res.path());
                    });
            }
        });
    }
    _startTelevision(channel) {
        if (channel != undefined && channel != null) {
            (GLOBAL.Channel = UTILS.getChannel(channel.channel_id)),
                Actions.Player({ fromPage: 'Home' });
        }
    }
    getSubText(series) {
        return series.name + ' / ' + series.episodes.length + ' Episodes';
    }
    onEnableScroll = value => {
        this.setState({
            enableScrollViewScroll: value,
        });
    };
    onNews(updown) {
        if (this.state.news.length > 0) {
            var newIndex = this.state.newsindex + updown;
            if (newIndex == this.state.news.length) {
                newIndex = 0;
            } else if (newIndex < 0) {
                newIndex = this.state.news.length - 1;
            }
            this.setState({
                newsimage: GLOBAL.ImageUrlCMS + this.state.news[newIndex].image,
                newstext: this.state.news[newIndex].description,
                newsindex: newIndex,
            });
        }
    }
    getNews() {
        if (this.state.news.length > 0) {
            var random = Math.floor(Math.random() * this.state.news.length);
            this.setState({
                newsimage: GLOBAL.ImageUrlCMS + this.state.news[random].image,
                newstext: this.state.news[random].description,
                newsindex: random,
            });
        }
    }
    focusSeries() { }
    focusNews() {
        this.setState({
            flex_player: 0,
            show_player: false,
        });
    }
    focusChannel(channel) {
        TimerMixin.clearTimeout(this.startPlayerTimer);
        if (this.state.show_player == false) {
            this.setState({
                flex_player: 45,
                show_player: true,
            });
        }
        if (this.state.channelSelected != channel) {
            this.startPlayerTimer = TimerMixin.setTimeout(() => {
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
                this.startTV(url, channel);
            }, 500);
        }
    }
    selectChannel() {
        this.setState({
            fullscreen_player: true,
        });
    }
    pressChannel(channel) {
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
        this.startTV(url, channel);
    }
    updateProgramInformation(plusorminus) {
        var epg_check = GLOBAL.EPG.find(
            e => e.id == this.state.channel_now.channel_id,
        );
        var newIndex = this.state.current_program_index + plusorminus;
        if (epg_check.epgdata[newIndex] != undefined) {
            this.setState({
                program_now: epg_check.epgdata[newIndex],
                current_program_index: newIndex,
            });
        }
        if (epg_check.epgdata[newIndex + 1] != undefined) {
            this.setState({
                program_next: epg_check.epgdata[newIndex + 1],
            });
        }
        if (epg_check.epgdata[newIndex - 1] != undefined) {
            this.setState({
                program_previous: epg_check.epgdata[newIndex - 1],
            });
        }
    }
    resetChannelProgramInformation() {
        var newChannelIndex = this.state.channels.findIndex(
            e => e.channel_id == this.state.channelSelected.channel_id,
        );
        if (this.state.channels[newChannelIndex] != undefined) {
            var currentUnix = moment().unix();
            var epg_check = GLOBAL.EPG.find(
                e => e.id == this.state.channels[newChannelIndex].channel_id,
            );
            var newProgramIndex = epg_check.epgdata.findIndex(function (
                element,
            ) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            this.setState({
                channel_now: this.state.channels[newChannelIndex],
                current_channel_index: newChannelIndex,
                current_program_index: newProgramIndex,
            });
        }
        if (this.state.channels[newChannelIndex + 1] != undefined) {
            this.setState({
                channel_next: this.state.channels[newChannelIndex + 1],
            });
        }
        if (this.state.channels[newChannelIndex - 1] != undefined) {
            this.setState({
                channel_previous: this.state.channels[newChannelIndex - 1],
            });
        }
        this.updateProgramInformation(0);
    }
    changeChannelProgramInformation(plusorminus) {
        var newIndex = this.state.current_channel_index + plusorminus;
        if (this.state.channels[newIndex] != undefined) {
            var currentUnix = moment().unix();
            var epg_check = GLOBAL.EPG.find(
                e => e.id == this.state.channels[newIndex].channel_id,
            );
            var newProgramIndex = epg_check.epgdata.findIndex(function (
                element,
            ) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            this.setState({
                channel_now: this.state.channels[newIndex],
                current_channel_index: newIndex,
                current_program_index: newProgramIndex,
            });
        }
        if (this.state.channels[newIndex + 1] != undefined) {
            this.setState({
                channel_next: this.state.channels[newIndex + 1],
            });
        }
        if (this.state.channels[newIndex - 1] != undefined) {
            this.setState({
                channel_previous: this.state.channels[newIndex - 1],
            });
        }
        this.updateProgramInformation(0);
    }
    interactiveTvType() {
        var epg_check = GLOBAL.EPG.find(
            e => e.id == this.state.channel_now.channel_id,
        );
        if (epg_check.epgdata[this.state.current_program_index] != undefined) {
            var currentUnix = moment().unix();
            var nowIndex = epg_check.epgdata.findIndex(function (element) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            if (nowIndex == this.state.current_program_index) {
                return 'Replay';
            }
            if (nowIndex > this.state.current_program_index) {
                return 'Watch';
            }
            if (nowIndex < this.state.current_program_index) {
                return 'Record';
            }
        }
    }
    startBottomBarTimer() {
        TimerMixin.clearTimeout(this.bottomBarTimer);
        this.bottomBarTimer = TimerMixin.setTimeout(() => {
            this.setState({
                show_bottom_panel: false,
            });
            this.resetChannelProgramInformation();
        }, 5000);
    }
    changeChannel() {
        if (
            this.state.channel_now.channel_id !=
            this.state.channelSelected.channel_id
        ) {
            var url = '';
            if (GLOBAL.Device_IsSmartTV) {
                url = this.state.channel_now.tizen_webos;
            } else if (
                GLOBAL.Device_Manufacturer == 'Apple' ||
                GLOBAL.Device_IsPwaIOS
            ) {
                url = this.state.channel_now.ios_tvos;
            } else {
                url = this.state.channel_now.url_high;
            }
            this.startTV(url, this.state.channel_now);
        } else {
            this.setState({
                show_interactivetv_panel: true,
                show_bottom_panel: false,
            });
        }
    }
    hasCatchup(channel) {
        if (
            GLOBAL.UserInterface.general.enable_catchuptv == true &&
            (channel.is_flussonic == 1 || channel.is_dveo == 1)
        ) {
            return true;
        } else {
            return false;
        }
    }
    getCurrentImage(channel) {
        if (channel.url_high == undefined) {
            return;
        }
        var url = channel.url_high;
        var splitUrl = url.toString().split('/');
        var image =
            splitUrl[0] +
            '//' +
            splitUrl[2] +
            '/' +
            splitUrl[3] +
            '/' +
            'preview.jpg';
        return image;
    }
    isFavorite(channel) {
        var check_favorite = GLOBAL.Favorite_Channels.find(
            c => c.channel_id == channel.channel_id,
        );
        if (check_favorite == undefined) {
            return false;
        }
        if (check_favorite != undefined) {
            return true;
        }
    }
    _onPressSetAudio(index, language) {
        if (GLOBAL.Device_IsWebTV) {
            setTrack(index, 'audio');
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
            show_popup: false,
            button_audio: false,
            back_focus: this.state.back_focus == false ? true : false,
            play_focus: this.state.play_focus == true ? false : true,
        });
    }
    _onPressSetSubtitle(index, language) {
        if (GLOBAL.Device_IsWebTV) {
            var i = index - 1;
            setTrack(index, 'subs');
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
            show_popup: false,
            button_subtitles: false,
            back_focus: this.state.back_focus == false ? true : false,
            play_focus: this.state.play_focus == true ? false : true,
        });
    }
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

        // if (this.state.live == true) {
        //     var new_retry = this.state.max_retry - 1;
        //     if (new_retry > 0) {
        //         TimerMixin.clearTimeout(this.errorTimer)
        //         this.errorTimer = TimerMixin.setTimeout(() => {
        //             this.setState({
        //                 error: '',
        //                 max_retry: new_retry
        //             }, () => {
        //                 this.refreshIpAddress();
        //                 //Actions.Player({ fromPage: this.props.fromPage, max_retry: new_retry });
        //             });
        //         }, 5000);
        //     }
        // }
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
            duration: this.state.program_now.e - this.state.program_now.s,
        });
    };
    onEnd = () => {
        // if (this.state.playing_catchup == true) {
        //     this.startProgram(1, null, null, true);
        // }
    };
    onProgress = data => {
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        if (this.state.show_bottom_player == true) {
            var position = data.currentTime;
            var playable = data.playableDuration;
            var extraPosition = moment().unix() - this.state.program_now.s;
            if (this.state.live == true) {
                position = position + extraPosition;
            }
            if (this.state.catchup == true && this.state.pause_time == 0) {
                position = position + this.state.program_seek;
            }
            this.setState({
                current_time: position,
                playable_duration: playable,
            });
        }
        // if (this.state.pause_time > 0 && this.state.current_time > 0 && this.state.paused == false && this.state.is_ad == false) {
        //     var seek = this.state.program_seek - 60;
        //     this.setState({
        //         pause_time: 0,
        //         program_seek: 0
        //     }, () => {
        //         if (GLOBAL.Device_IsWebTV) {
        //             player.currentTime(seek);
        //         } else {
        //             this.player.seek(seek);
        //         }
        //     });
        // }
    };
    getTrackTranslated(data, type) {
        if (GLOBAL.Device_IsWebTV && type == 'subs') {
            data = Array.from(player.textTracks());
        }
        if (GLOBAL.Device_IsWebTV && type == 'audio') {
            data = Array.from(player.audioTracks());
        }
        var subs = [];
        var i = 0;
        if (data == undefined || data == null) {
            return subs;
        }
        if (GLOBAL.Device_IsWebTV && type == 'subs') {
            this.setState({
                text_track_index: 999,
                text_track_type: 'disabled',
            });
        }
        if (GLOBAL.Device_IsWebTV && type == 'audio') {
            this.setState({
                audio_track_index: 0,
            });
        }
        data.forEach(element => {
            var language = '';
            if (LANG_CODES.languageCodes[element.language] != undefined) {
                var languages = LANG_CODES.languageCodes[element.language].int;
                languages.forEach(element_ => {
                    language = language + element_ + ', ';
                });
                language = language.slice(0, -2);
            } else {
                if (element.language == '') {
                    language = 'Unknown';
                } else if (element.language != 'und') {
                    language = element.language;
                }
            }
            if (type == 'subs' && GLOBAL.Selected_TextTrack == language) {
                this.setState({
                    text_track_index: i,
                    text_track_type: 'index',
                });
                //webtv enable
            }

            if (type == 'audio' && GLOBAL.Selected_AudioTrack == language) {
                this.setState({
                    audio_track_index: i,
                });
            }
            if (language != '') {
                var index = GLOBAL.Device_IsWebTV
                    ? element.language
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
    _onPressProblemReport(desc, channel) {
        this.setState(
            {
                loading: true,
                problem_menu: false,
            },
            () => {
                DAL.setProblemReportContent(
                    'Channel',
                    channel.name,
                    channel.channel_id,
                    desc,
                );
                REPORT.set({
                    key: 'problem',
                    type: 34,
                    id: channel.channel_id,
                    name: channel.name + ' [Channel] ' + '[' + desc + ']',
                });
                this.setState({
                    loading: false,
                    thanks_problem: true,
                });
            },
        );
    }
    openSubMenu(type) {
        if (type == 'subtitles') {
            this.setState({
                main_menu: false,
                subtitle_menu: true,
            });
        }
        if (type == 'audio') {
            this.setState({
                main_menu: false,
                audio_menu: true,
            });
        }
        if (type == 'screensize') {
            this.setState({
                main_menu: false,
                screensize_menu: true,
            });
        }
        if (type == 'problem') {
            this.setState({
                main_menu: false,
                problem_menu: true,
            });
        }
    }
    _onFavoriteChange(channel) {
        var id = channel.channel_id;
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
        } else {
            GLOBAL.Favorite_Channels.push(channel);
            this.setState({
                favorite: true,
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
    }
    render() {
        return (
            <Container>
                <ImageBackground
                    style={{ flex: 1, width: null, height: null }}
                    imageStyle={{ resizeMode: 'cover' }}
                    blurRadius={100}
                    source={{ uri: this.state.backdrop }}
                >
                    {RenderIf(this.state.show_exit_app == true)(
                        <Modal
                            Title={LANG.getTranslation('exit_app')}
                            Centered={true}
                            TextHeader={LANG.getTranslation(
                                'exit_app_click_again',
                            )}
                            TextMain={LANG.getTranslation('exit_app_close')}
                        ></Modal>,
                    )}
                    {RenderIf(this.state.popup_loader_)(
                        <Modal
                            Type={'Loader'}
                            Title={LANG.getTranslation(
                                'downloading_installing',
                            )}
                            Centered={true}
                            Progress={this.state.progress}
                            ShowLoader={true}
                        ></Modal>,
                    )}
                    {RenderIf(
                        GLOBAL.Device_IsTV == true && this.state.show_numeric,
                    )(
                        <View
                            ref={ref => {
                                this.numeric = ref;
                            }}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                width: 250,
                                height: 100,
                                backgroundColor: this.state.numeric_color,
                                position: 'absolute',
                                right: 10,
                                top: 10,
                                zIndex: 10000,
                            }}
                        >
                            <Text style={styles.Huge}>
                                {this.state.numeric_number}
                            </Text>
                        </View>,
                    )}
                    {RenderIf(GLOBAL.Device_IsPhone == true)(
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                backgroundColor: 'rgba(0, 0, 0, 0.0)',
                            }}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    zIndex: 9999,
                                    top: 0,
                                    width: GLOBAL.Device_Width - 100,
                                }}
                            >
                                <Modal Type={'MessageHome'}></Modal>
                            </View>
                            <ScrollView
                                scrollEnabled={
                                    this.state.enableScrollViewScroll
                                }
                                style={{ flex: 1, flexDirection: 'column' }}
                            >
                                <View
                                    style={{
                                        backgroundColor: '#000',
                                        marginHorizontal: 20,
                                        padding: 20,
                                    }}
                                >
                                    <Text style={[styles.Medium, {}]}>
                                        {this.state.newsdate}
                                    </Text>
                                    <Text style={[styles.Standard, {}]}>
                                        {this.state.newstext}
                                    </Text>
                                </View>
                                <View
                                    style={{ flex: 1, flexDirection: 'column' }}
                                >
                                    <View
                                        style={{
                                            flex: 50,
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <View
                                            style={{
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                paddingBottom: 5,
                                                paddingTop: 0,
                                            }}
                                        >
                                            {RenderIf(
                                                GLOBAL.UserInterface.home
                                                    .enable_tv_preview == true,
                                            )(
                                                <View>
                                                    <Text
                                                        style={[
                                                            styles.H2,
                                                            {
                                                                paddingVertical: 11,
                                                            },
                                                        ]}
                                                    >
                                                        Channels
                                                    </Text>
                                                    <TouchableHighlight
                                                        activeOpacity={1}
                                                        style={{
                                                            backgroundColor:
                                                                '#000',
                                                            width:
                                                                GLOBAL.Device_Width -
                                                                40,
                                                            height:
                                                                ((GLOBAL.Device_Width -
                                                                    40) /
                                                                    16) *
                                                                9,
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                            alignSelf: 'center',
                                                        }}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this._startTelevision(
                                                                this.state
                                                                    .channelSelected,
                                                            )
                                                        }
                                                    >
                                                        <Video
                                                            ref={ref => {
                                                                this.player =
                                                                    ref;
                                                            }}
                                                            source={{
                                                                uri: this.state
                                                                    .videoUrl,
                                                                type: this.state
                                                                    .videoType,
                                                                drmUrl: this
                                                                    .state
                                                                    .drmUrl,
                                                                drmKeyServerUrl:
                                                                    GLOBAL.DrmKeyServerUrl,
                                                                ref: 'player',
                                                                headers: {
                                                                    'User-Agent':
                                                                        GLOBAL.User_Agent,
                                                                },
                                                                drm: {
                                                                    type:
                                                                        this
                                                                            .state
                                                                            .drmKey ==
                                                                            ''
                                                                            ? null
                                                                            : GLOBAL.Device_System ==
                                                                                'Apple'
                                                                                ? DRMType.FAIRPLAY
                                                                                : DRMType.WIDEVINE,
                                                                    licenseServer:
                                                                        GLOBAL.DrmKeyServerUrl,
                                                                    headers: {
                                                                        customData:
                                                                            this
                                                                                .state
                                                                                .drmKey,
                                                                    },
                                                                },
                                                            }}
                                                            disableFocus={true}
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width -
                                                                    40,
                                                                height:
                                                                    ((GLOBAL.Device_Width -
                                                                        40) /
                                                                        16) *
                                                                    9,
                                                                justifyContent:
                                                                    'center',
                                                                alignContent:
                                                                    'center',
                                                                backgroundColor:
                                                                    '#000',
                                                            }}
                                                            resizeMode="cover"
                                                            paused={false}
                                                            repeat={false}
                                                            selectedAudioTrack={{
                                                                type: 'index',
                                                                value: 0,
                                                            }}
                                                        />
                                                    </TouchableHighlight>
                                                    <View
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            justifyContent:
                                                                'flex-end',
                                                            alignItems:
                                                                'flex-end',
                                                            left: 5,
                                                            right: 5,
                                                            bottom: 3,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.80)',
                                                            padding: 5,
                                                        }}
                                                    >
                                                        <Text
                                                            style={
                                                                styles.Standard
                                                            }
                                                        >
                                                            {
                                                                this.state
                                                                    .channelSelected
                                                                    .channel_number
                                                            }
                                                            .{' '}
                                                            {
                                                                this.state
                                                                    .channelSelected
                                                                    .name
                                                            }
                                                        </Text>
                                                    </View>
                                                </View>,
                                            )}
                                            <View
                                                style={{
                                                    height: 200,
                                                    paddingTop: 5,
                                                }}
                                            >
                                                <ChannelList
                                                    extraData={
                                                        this.state.channels
                                                    }
                                                    focusChannel={
                                                        this.focusChannel
                                                    }
                                                    Channels={
                                                        this.state.channels
                                                    }
                                                    Width={
                                                        GLOBAL.Device_Width - 30
                                                    }
                                                    ColumnType={
                                                        this.state.channelType
                                                    }
                                                    Columns={1}
                                                    Type={'HomeNoBrand'}
                                                    getItemLayout={(
                                                        data,
                                                        index,
                                                    ) => {
                                                        return {
                                                            length: 80,
                                                            index,
                                                            offset: 80 * index,
                                                        };
                                                    }}
                                                />
                                            </View>
                                            <View style={{ paddingTop: 10 }}>
                                                {RenderIf(
                                                    this.state.series.length >
                                                    0,
                                                )(
                                                    <View
                                                        style={{
                                                            paddingLeft: 20,
                                                        }}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.H2,
                                                                {
                                                                    paddingVertical: 10,
                                                                },
                                                            ]}
                                                        >
                                                            Series
                                                        </Text>
                                                        <FlatList
                                                            extraData={
                                                                this.state
                                                                    .series
                                                            }
                                                            data={
                                                                this.state
                                                                    .series
                                                            }
                                                            horizontal={false}
                                                            numColumns={1}
                                                            removeClippedSubviews={
                                                                true
                                                            }
                                                            scrollType="series"
                                                            keyExtractor={(
                                                                item,
                                                                index,
                                                            ) =>
                                                                'series_' +
                                                                index.toString()
                                                            }
                                                            getItemLayout={(
                                                                data,
                                                                index,
                                                            ) => {
                                                                return {
                                                                    length: GLOBAL.Device_IsAppleTV
                                                                        ? 360
                                                                        : 260,
                                                                    index,
                                                                    offset:
                                                                        (GLOBAL.Device_IsAppleTV
                                                                            ? 360
                                                                            : 260) *
                                                                        index,
                                                                };
                                                            }}
                                                            renderItem={({
                                                                item,
                                                                index,
                                                            }) => (
                                                                <TouchableHighlightFocus
                                                                    style={{
                                                                        width:
                                                                            GLOBAL.Device_Width -
                                                                            0,
                                                                    }}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        Actions.Series_Details(
                                                                            {
                                                                                season_name:
                                                                                    item.id,
                                                                                fromPage:
                                                                                    'Home',
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <View
                                                                        style={{
                                                                            backgroundColor:
                                                                                '#000',
                                                                            padding: 5,
                                                                            width:
                                                                                GLOBAL.Device_Width -
                                                                                40,
                                                                        }}
                                                                    >
                                                                        {RenderIf(
                                                                            item.favorite !=
                                                                            false,
                                                                        )(
                                                                            <View
                                                                                style={{
                                                                                    zIndex: 99999,
                                                                                    position:
                                                                                        'absolute',
                                                                                    top: 5,
                                                                                    right: 5,
                                                                                    backgroundColor:
                                                                                        'rgba(0, 0, 0, 0.00)',
                                                                                    padding: 5,
                                                                                }}
                                                                            >
                                                                                <FontAwesome
                                                                                    style={[
                                                                                        styles.IconsMenu,
                                                                                    ]}
                                                                                    // icon={
                                                                                    //     RegularIcons.heart
                                                                                    // }
                                                                                    name="heart-o"
                                                                                />
                                                                            </View>,
                                                                        )}
                                                                        {RenderIf(
                                                                            item.favorite ==
                                                                            false,
                                                                        )(
                                                                            <ScaledImage
                                                                                uri={
                                                                                    GLOBAL.ImageUrlCMS +
                                                                                    item.backdrop
                                                                                }
                                                                                width={
                                                                                    GLOBAL.Device_Width -
                                                                                    50
                                                                                }
                                                                            />,
                                                                        )}
                                                                        {RenderIf(
                                                                            item.favorite !=
                                                                            false,
                                                                        )(
                                                                            <ScaledImage
                                                                                uri={
                                                                                    GLOBAL.ImageUrlCMS +
                                                                                    item.backdrop
                                                                                }
                                                                                width={
                                                                                    GLOBAL.Device_Width -
                                                                                    50
                                                                                }
                                                                            />,
                                                                        )}
                                                                        <View
                                                                            style={{
                                                                                position:
                                                                                    'absolute',
                                                                                bottom: 0,
                                                                                right: 5,
                                                                                left: 5,
                                                                                paddingBottom: 5,
                                                                                backgroundColor:
                                                                                    'rgba(0, 0, 0, 0.75)',
                                                                                padding: 5,
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
                                                                                        width:
                                                                                            GLOBAL.Device_Width -
                                                                                            40,
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                {
                                                                                    item.name
                                                                                }
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                </TouchableHighlightFocus>
                                                            )}
                                                        />
                                                    </View>,
                                                )}
                                                {RenderIf(
                                                    this.state.movies.length >
                                                    0,
                                                )(
                                                    <View
                                                        style={{
                                                            paddingLeft: 20,
                                                            height: 600,
                                                        }}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.H2,
                                                                {
                                                                    paddingVertical: 10,
                                                                    paddingLeft: 10,
                                                                },
                                                            ]}
                                                        >
                                                            Movies
                                                        </Text>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                justifyContent:
                                                                    'center',
                                                                alignContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            <FlatList
                                                                extraData={
                                                                    this.state
                                                                        .movies
                                                                }
                                                                data={
                                                                    this.state
                                                                        .movies
                                                                }
                                                                horizontal={
                                                                    false
                                                                }
                                                                numColumns={3}
                                                                removeClippedSubviews={
                                                                    true
                                                                }
                                                                scrollType="movies"
                                                                onTouchStart={() => {
                                                                    this.onEnableScroll(
                                                                        false,
                                                                    );
                                                                }}
                                                                onMomentumScrollEnd={() => {
                                                                    this.onEnableScroll(
                                                                        true,
                                                                    );
                                                                }}
                                                                keyExtractor={(
                                                                    item,
                                                                    index,
                                                                ) =>
                                                                    'movies_' +
                                                                    index.toString()
                                                                }
                                                                getItemLayout={(
                                                                    data,
                                                                    index,
                                                                ) => {
                                                                    return {
                                                                        length: 210,
                                                                        index,
                                                                        offset:
                                                                            210 *
                                                                            index,
                                                                    };
                                                                }}
                                                                renderItem={({
                                                                    item,
                                                                    index,
                                                                }) => (
                                                                    <TouchableHighlightFocus
                                                                        style={{
                                                                            width:
                                                                                (GLOBAL.Device_Width -
                                                                                    30) /
                                                                                3,
                                                                        }}
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            Actions.Movies_Details(
                                                                                {
                                                                                    MovieIndex:
                                                                                        item.id,
                                                                                    fromPage:
                                                                                        'Home',
                                                                                },
                                                                            )
                                                                        }
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                backgroundColor:
                                                                                    '#000',
                                                                                padding: 5,
                                                                                width:
                                                                                    (GLOBAL.Device_Width -
                                                                                        50) /
                                                                                    3,
                                                                            }}
                                                                        >
                                                                            {RenderIf(
                                                                                item.favorite !=
                                                                                false,
                                                                            )(
                                                                                <View
                                                                                    style={{
                                                                                        zIndex: 99999,
                                                                                        position:
                                                                                            'absolute',
                                                                                        top: 5,
                                                                                        right: 5,
                                                                                        backgroundColor:
                                                                                            'rgba(0, 0, 0, 0.00)',
                                                                                        padding: 5,
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome
                                                                                        style={[
                                                                                            styles.IconsMenuSmall,
                                                                                        ]}
                                                                                        // icon={
                                                                                        //     RegularIcons.heart
                                                                                        // }
                                                                                        name="heart-o"
                                                                                    />
                                                                                </View>,
                                                                            )}
                                                                            <ScaledImage
                                                                                uri={
                                                                                    GLOBAL.ImageUrlCMS +
                                                                                    item.poster
                                                                                }
                                                                                width={
                                                                                    (GLOBAL.Device_Width -
                                                                                        90) /
                                                                                    3
                                                                                }
                                                                            />
                                                                            <View
                                                                                style={{
                                                                                    position:
                                                                                        'absolute',
                                                                                    bottom: 0,
                                                                                    right: 5,
                                                                                    left: 5,
                                                                                    paddingBottom: 5,
                                                                                    backgroundColor:
                                                                                        'rgba(0, 0, 0, 0.75)',
                                                                                    padding: 5,
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
                                                                                            width:
                                                                                                GLOBAL.Device_Width /
                                                                                                4,
                                                                                        },
                                                                                    ]}
                                                                                >
                                                                                    {
                                                                                        item.name
                                                                                    }
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlightFocus>
                                                                )}
                                                            />
                                                        </View>
                                                    </View>,
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>,
                    )}
                    {RenderIf(GLOBAL.Device_IsPhone == false)(
                        <View style={{ flex: 1 }}>
                            {RenderIf(this.state.fullscreen_player == false)(
                                <View>
                                    <View
                                        style={{
                                            position: 'absolute',
                                            left: 0,
                                            height: GLOBAL.Device_Height,
                                            width: 125,
                                            zIndex: 3,
                                        }}
                                    >
                                        <ImageBackground
                                            style={{
                                                flex: 1,
                                                width: null,
                                                height: null,
                                            }}
                                            imageStyle={{ resizeMode: 'cover' }}
                                            source={require('../../../../images/side_panel_channels.png')}
                                        >
                                            <Menu></Menu>
                                        </ImageBackground>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'column',
                                            width: GLOBAL.Device_Width,
                                            height: GLOBAL.Device_Height,
                                            position: 'absolute',
                                            zIndex: 2,
                                            left: 0,
                                        }}
                                    >
                                        <ImageBackground
                                            style={{
                                                flex: 1,
                                                width: null,
                                                height: null,
                                            }}
                                            imageStyle={{ resizeMode: 'cover' }}
                                            source={require('../../../../images/playertv_bg.png')}
                                        >
                                            {/* 
                                            <View style={{ position: 'absolute', zIndex: 9999, top: 0, width: GLOBAL.Device_Width - (GLOBAL.Device_IsWebTV ? 200 : 100) }}>
                                                <Modal Type={'MessageHome'} > </Modal>
                                            </View> */}

                                            {RenderIf(
                                                this.state.show_player == true,
                                            )(
                                                <View
                                                    style={{
                                                        flex: 45,
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            alignItems:
                                                                'flex-start',
                                                            flex: 1,
                                                            margin: 20,
                                                            paddingLeft: 130,
                                                        }}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.Medium,
                                                                styles.Shadow,
                                                            ]}
                                                        >
                                                            Playing:{' '}
                                                            {
                                                                this.state
                                                                    .show_program
                                                            }
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={{
                                                            alignItems:
                                                                'flex-end',
                                                            flex: 1,
                                                            margin: 20,
                                                        }}
                                                    >
                                                        <Text style={styles.H2}>
                                                            {this.state.time}
                                                        </Text>
                                                    </View>
                                                </View>,
                                            )}
                                            <View
                                                style={{
                                                    flex: 55,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <ScrollView>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            paddingLeft: 140,
                                                            paddingBottom: 0,
                                                        }}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.H2,
                                                                styles.Shadow,
                                                            ]}
                                                        >
                                                            {LANG.getTranslation(
                                                                'your_channels',
                                                            )}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                'row',
                                                            justifyContent:
                                                                'center',
                                                            paddingLeft: 130,
                                                            paddingBottom: 20,
                                                        }}
                                                    >
                                                        <ChannelList
                                                            extraData={
                                                                this.state
                                                                    .videoUrl
                                                            }
                                                            focusChannel={
                                                                this
                                                                    .focusChannel
                                                            }
                                                            selectChannel={
                                                                this
                                                                    .selectChannel
                                                            }
                                                            Channels={
                                                                this.state
                                                                    .channels
                                                            }
                                                            Width={
                                                                this.state
                                                                    .channel_width -
                                                                10
                                                            }
                                                            ChannelPlayingId={
                                                                this.state
                                                                    .channelSelected
                                                            }
                                                            ColumnType={
                                                                this.state
                                                                    .channelType
                                                            }
                                                            Columns={1}
                                                            Type={
                                                                'HomePalladium'
                                                            }
                                                            getItemLayout={(
                                                                data,
                                                                index,
                                                            ) => {
                                                                return {
                                                                    length: GLOBAL.Device_IsAppleTV
                                                                        ? 120
                                                                        : 80,
                                                                    index,
                                                                    offset: GLOBAL.Device_IsAppleTV
                                                                        ? 120
                                                                        : 80 *
                                                                        index,
                                                                };
                                                            }}
                                                        />
                                                    </View>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            backgroundColor:
                                                                '#222',
                                                            paddingLeft: 130,
                                                            paddingTop: 20,
                                                        }}
                                                    >
                                                        {RenderIf(
                                                            this.state
                                                                .newstext !=
                                                            '' &&
                                                            GLOBAL
                                                                .UserInterface
                                                                .home
                                                                .enable_news_section ==
                                                            true,
                                                        )(
                                                            <View
                                                                style={{
                                                                    flex: 1,
                                                                }}
                                                            >
                                                                <Text
                                                                    style={[
                                                                        styles.H2,
                                                                        styles.Shadow,
                                                                        {
                                                                            paddingLeft: 30,
                                                                        },
                                                                    ]}
                                                                >
                                                                    {LANG.getTranslation(
                                                                        'newsinformation',
                                                                    )}
                                                                </Text>
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            'rgba(0, 0, 0, 0.63)',
                                                                        flexDirection:
                                                                            'column',
                                                                        padding: 10,
                                                                        width:
                                                                            GLOBAL.Device_Width -
                                                                            GLOBAL.Device_Width /
                                                                            6,
                                                                        margin: 20,
                                                                        borderRadius: 5,
                                                                    }}
                                                                >
                                                                    <View
                                                                        style={{
                                                                            flexDirection:
                                                                                'row',
                                                                            padding: 5,
                                                                            paddingBottom: 10,
                                                                        }}
                                                                    >
                                                                        <View>
                                                                            <ButtonCircle
                                                                                onFocus={() =>
                                                                                    this.focusNews()
                                                                                }
                                                                                Rounded={
                                                                                    true
                                                                                }
                                                                                underlayColor={
                                                                                    GLOBAL.Button_Color
                                                                                }
                                                                                Icon={
                                                                                    "chevron-left"
                                                                                    // SolidIcons.chevronLeft
                                                                                }
                                                                                Size={
                                                                                    15
                                                                                }
                                                                                onPress={() =>
                                                                                    this.onNews(
                                                                                        -1,
                                                                                    )
                                                                                }
                                                                            ></ButtonCircle>
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                flex: 1,
                                                                                flexDirection:
                                                                                    'row',
                                                                                justifyContent:
                                                                                    'flex-end',
                                                                                alignContent:
                                                                                    'flex-end',
                                                                                alignItems:
                                                                                    'flex-end',
                                                                            }}
                                                                        >
                                                                            <ButtonCircle
                                                                                onFocus={() =>
                                                                                    this.focusNews()
                                                                                }
                                                                                Rounded={
                                                                                    true
                                                                                }
                                                                                underlayColor={
                                                                                    GLOBAL.Button_Color
                                                                                }
                                                                                Icon={
                                                                                    "chevron-right"
                                                                                    // SolidIcons.chevronRight
                                                                                }
                                                                                Size={
                                                                                    15
                                                                                }
                                                                                onPress={() =>
                                                                                    this.onNews(
                                                                                        1,
                                                                                    )
                                                                                }
                                                                            ></ButtonCircle>
                                                                        </View>
                                                                    </View>
                                                                    <View
                                                                        style={{
                                                                            flexDirection:
                                                                                'row',
                                                                            backgroundColor:
                                                                                'rgba(0, 0, 0, 0.33)',
                                                                            borderRadius: 10,
                                                                        }}
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                padding: 20,
                                                                                flex: 1,
                                                                            }}
                                                                        >
                                                                            <Text
                                                                                numberOfLines={
                                                                                    3
                                                                                }
                                                                                style={
                                                                                    styles.Medium
                                                                                }
                                                                            >
                                                                                {
                                                                                    this
                                                                                        .state
                                                                                        .newsdate
                                                                                }
                                                                            </Text>
                                                                            <Text
                                                                                numberOfLines={
                                                                                    3
                                                                                }
                                                                                style={
                                                                                    styles.Standard
                                                                                }
                                                                            >
                                                                                {
                                                                                    this
                                                                                        .state
                                                                                        .newstext
                                                                                }
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                </View>
                                                            </View>,
                                                        )}
                                                    </View>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            backgroundColor:
                                                                '#111',
                                                            paddingLeft: 130,
                                                            paddingTop: 20,
                                                        }}
                                                    >
                                                        {RenderIf(
                                                            this.state.series
                                                                .length > 0,
                                                        )(
                                                            <View>
                                                                <Text
                                                                    style={[
                                                                        styles.H2,
                                                                        styles.Shadow,
                                                                        {
                                                                            paddingLeft: 30,
                                                                        },
                                                                    ]}
                                                                >
                                                                    {LANG.getTranslation(
                                                                        'trendingseries',
                                                                    )}
                                                                    <Text
                                                                        style={[
                                                                            styles.Standard,
                                                                            styles.Shadow,
                                                                        ]}
                                                                    >
                                                                        {' '}
                                                                        (
                                                                        {
                                                                            this
                                                                                .state
                                                                                .series
                                                                                .length
                                                                        }
                                                                        )
                                                                    </Text>
                                                                </Text>
                                                                <View
                                                                    style={{
                                                                        paddingLeft: 15,
                                                                        paddingTop: 15,
                                                                        paddingBottom: 15,
                                                                    }}
                                                                >
                                                                    <FlatList
                                                                        data={
                                                                            this
                                                                                .state
                                                                                .series
                                                                        }
                                                                        horizontal={
                                                                            true
                                                                        }
                                                                        removeClippedSubviews={
                                                                            true
                                                                        }
                                                                        scrollType="series"
                                                                        keyExtractor={(
                                                                            item,
                                                                            index,
                                                                        ) =>
                                                                            'series_' +
                                                                            index.toString()
                                                                        }
                                                                        getItemLayout={(
                                                                            data,
                                                                            index,
                                                                        ) => {
                                                                            return {
                                                                                length:
                                                                                    GLOBAL.Device_IsAppleTV ||
                                                                                        GLOBAL.Device_IsSmartTV
                                                                                        ? 460
                                                                                        : 360,
                                                                                index,
                                                                                offset:
                                                                                    (GLOBAL.Device_IsAppleTV ||
                                                                                        GLOBAL.Device_IsSmartTV
                                                                                        ? 460
                                                                                        : 360) *
                                                                                    index,
                                                                            };
                                                                        }}
                                                                        renderItem={({
                                                                            item,
                                                                            index,
                                                                        }) => (
                                                                            <View>
                                                                                <TouchableHighlightFocus
                                                                                    onFocus={() =>
                                                                                        this.focusSeries(
                                                                                            item,
                                                                                        )
                                                                                    }
                                                                                    underlayColor={
                                                                                        GLOBAL.Button_Color
                                                                                    }
                                                                                    onPress={() =>
                                                                                        Actions.Series_Details(
                                                                                            {
                                                                                                season_name:
                                                                                                    item.id,
                                                                                                fromPage:
                                                                                                    'Home',
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <View
                                                                                        style={{
                                                                                            backgroundColor:
                                                                                                '#000',
                                                                                            padding: 5,
                                                                                        }}
                                                                                    >
                                                                                        {/* <Text numberOfLines={1} style={[styles.H4, { margin: 10, color: '#fff' }]}>{item.name}</Text> */}
                                                                                        <ScaledImage
                                                                                            uri={
                                                                                                GLOBAL.ImageUrlCMS +
                                                                                                item.poster
                                                                                            }
                                                                                            width={
                                                                                                (GLOBAL.Device_IsWebTV &&
                                                                                                    !GLOBAL.Device_IsSmartTV) ||
                                                                                                    GLOBAL.Device_IsAppleTV ||
                                                                                                    GLOBAL.Device_IsSmartTV
                                                                                                    ? 400
                                                                                                    : 300
                                                                                            }
                                                                                        />
                                                                                    </View>
                                                                                </TouchableHighlightFocus>
                                                                            </View>
                                                                        )}
                                                                    />
                                                                </View>
                                                            </View>,
                                                        )}
                                                        {RenderIf(
                                                            this.state.movies
                                                                .length > 0,
                                                        )(
                                                            <View>
                                                                <Text
                                                                    style={[
                                                                        styles.H2,
                                                                        styles.Shadow,
                                                                        {
                                                                            paddingLeft: 30,
                                                                            paddingTop: 30,
                                                                        },
                                                                    ]}
                                                                >
                                                                    {LANG.getTranslation(
                                                                        'lastestmovies',
                                                                    )}
                                                                    <Text
                                                                        style={[
                                                                            styles.Standard,
                                                                            styles.Shadow,
                                                                        ]}
                                                                    >
                                                                        {' '}
                                                                        (
                                                                        {
                                                                            this
                                                                                .state
                                                                                .movies
                                                                                .length
                                                                        }
                                                                        )
                                                                    </Text>
                                                                </Text>
                                                                <View
                                                                    style={{
                                                                        paddingLeft: 15,
                                                                        paddingTop: 15,
                                                                        paddingBottom: 15,
                                                                    }}
                                                                >
                                                                    <FlatList
                                                                        extraData={
                                                                            this
                                                                                .state
                                                                                .movies
                                                                        }
                                                                        data={
                                                                            this
                                                                                .state
                                                                                .movies
                                                                        }
                                                                        horizontal={
                                                                            true
                                                                        }
                                                                        removeClippedSubviews={
                                                                            true
                                                                        }
                                                                        scrollType="movies"
                                                                        keyExtractor={(
                                                                            item,
                                                                            index,
                                                                        ) =>
                                                                            'movies_' +
                                                                            index.toString()
                                                                        }
                                                                        getItemLayout={(
                                                                            data,
                                                                            index,
                                                                        ) => {
                                                                            return {
                                                                                length: 210,
                                                                                index,
                                                                                offset:
                                                                                    210 *
                                                                                    index,
                                                                            };
                                                                        }}
                                                                        renderItem={({
                                                                            item,
                                                                            index,
                                                                        }) => (
                                                                            <TouchableHighlightFocus
                                                                                style={{}}
                                                                                underlayColor={
                                                                                    GLOBAL.Button_Color
                                                                                }
                                                                                onPress={() =>
                                                                                    Actions.Movies_Details(
                                                                                        {
                                                                                            MovieIndex:
                                                                                                item.id,
                                                                                            fromPage:
                                                                                                'Home',
                                                                                        },
                                                                                    )
                                                                                }
                                                                            >
                                                                                <View
                                                                                    style={{
                                                                                        padding: 5,
                                                                                        backgroundColor:
                                                                                            '#000',
                                                                                    }}
                                                                                >
                                                                                    {RenderIf(
                                                                                        item.favorite ==
                                                                                        true,
                                                                                    )(
                                                                                        <View
                                                                                            style={{
                                                                                                zIndex: 99999,
                                                                                                position:
                                                                                                    'absolute',
                                                                                                top: 5,
                                                                                                right: 5,
                                                                                                backgroundColor:
                                                                                                    'rgba(0, 0, 0, 0.00)',
                                                                                                padding: 5,
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesome
                                                                                                style={[
                                                                                                    styles.IconsMenuSmall,
                                                                                                ]}
                                                                                                // icon={
                                                                                                //     RegularIcons.heart
                                                                                                // }
                                                                                                name="heart-o"
                                                                                            />
                                                                                        </View>,
                                                                                    )}
                                                                                    <ScaledImage
                                                                                        uri={
                                                                                            GLOBAL.ImageUrlCMS +
                                                                                            item.poster
                                                                                        }
                                                                                        width={
                                                                                            this
                                                                                                .state
                                                                                                .movies_width -
                                                                                            (GLOBAL.Device_Manufacturer ==
                                                                                                'Samsung Tizen'
                                                                                                ? 20
                                                                                                : GLOBAL.Device_IsAppleTV
                                                                                                    ? 26
                                                                                                    : 15)
                                                                                        }
                                                                                    />
                                                                                </View>
                                                                            </TouchableHighlightFocus>
                                                                        )}
                                                                    />
                                                                </View>
                                                            </View>,
                                                        )}
                                                    </View>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            backgroundColor:
                                                                '#222',
                                                            paddingLeft: 130,
                                                            paddingBottom: 20,
                                                        }}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.H2,
                                                                styles.Shadow,
                                                                {
                                                                    paddingLeft: 30,
                                                                    paddingTop: 10,
                                                                },
                                                            ]}
                                                        >
                                                            {LANG.getTranslation(
                                                                'bestapps',
                                                            )}
                                                            <Text
                                                                style={[
                                                                    styles.Standard,
                                                                    styles.Shadow,
                                                                ]}
                                                            >
                                                                {' '}
                                                                (
                                                                {
                                                                    this.state
                                                                        .apps
                                                                        .length
                                                                }
                                                                )
                                                            </Text>
                                                        </Text>
                                                        <View
                                                            style={{
                                                                paddingLeft: 15,
                                                                paddingTop: 15,
                                                                paddingBottom: 15,
                                                            }}
                                                        >
                                                            <FlatList
                                                                data={
                                                                    this.state
                                                                        .apps
                                                                }
                                                                horizontal={
                                                                    true
                                                                }
                                                                removeClippedSubviews={
                                                                    true
                                                                }
                                                                keyExtractor={(
                                                                    item,
                                                                    index,
                                                                ) =>
                                                                    'apps_' +
                                                                    index.toString()
                                                                }
                                                                scrollType="channels"
                                                                getItemLayout={(
                                                                    data,
                                                                    index,
                                                                ) => {
                                                                    return {
                                                                        length: 120,
                                                                        index,
                                                                        offset:
                                                                            120 *
                                                                            index,
                                                                    };
                                                                }}
                                                                renderItem={({
                                                                    item,
                                                                    index,
                                                                }) => (
                                                                    <TouchableHighlightFocus
                                                                        key={
                                                                            index
                                                                        }
                                                                        hasTVPreferredFocus={
                                                                            GLOBAL.Selected_ID_Player ==
                                                                                item.channel_id
                                                                                ? true
                                                                                : this
                                                                                    .state
                                                                                    .show_channel_search &&
                                                                                    index ==
                                                                                    0
                                                                                    ? true
                                                                                    : false
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this._openSelectedApp(
                                                                                item,
                                                                                index,
                                                                            )
                                                                        }
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                flex: 1,
                                                                                backgroundColor:
                                                                                    '#000',
                                                                                padding: 5,
                                                                            }}
                                                                        >
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
                                                                                            'center',
                                                                                        alignContent:
                                                                                            'center',
                                                                                        alignItems:
                                                                                            'center',
                                                                                        alignSelf:
                                                                                            'center',
                                                                                        backgroundColor:
                                                                                            '#111',
                                                                                    }}
                                                                                >
                                                                                    <Image
                                                                                        source={{
                                                                                            uri:
                                                                                                GLOBAL.ImageUrlCMS +
                                                                                                item.icon,
                                                                                        }}
                                                                                        style={{
                                                                                            height: 90,
                                                                                            width: 90,
                                                                                            margin: 5,
                                                                                        }}
                                                                                    />
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlightFocus>
                                                                )}
                                                            />
                                                        </View>
                                                    </View>
                                                </ScrollView>
                                            </View>
                                        </ImageBackground>
                                    </View>
                                </View>,
                            )}
                            {RenderIf(this.state.show_side_panel == true)(
                                <View
                                    style={{
                                        position: 'absolute',
                                        zIndex: 8,
                                        left: 0,
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
                                        source={require('../../../../images/side_panel_channels.png')}
                                    >
                                        <View
                                            style={{
                                                width: GLOBAL.Device_Width / 3,
                                                margin: 0,
                                            }}
                                        >
                                            <ChannelList
                                                extraData={this.state.videoUrl}
                                                selectChannel={
                                                    this.selectChannel
                                                }
                                                pressChannel={this.pressChannel}
                                                Channels={this.state.channels}
                                                Width={60}
                                                ChannelPlayingId={
                                                    this.state.channelSelected
                                                }
                                                ColumnType={
                                                    this.state.channelType
                                                }
                                                Columns={1}
                                                Type={'SideListPalladium'}
                                                getItemLayout={(
                                                    data,
                                                    index,
                                                ) => {
                                                    return {
                                                        length: GLOBAL.Device_IsAppleTV
                                                            ? 120
                                                            : 80,
                                                        index,
                                                        offset: GLOBAL.Device_IsAppleTV
                                                            ? 120
                                                            : 80 * index,
                                                    };
                                                }}
                                            />
                                        </View>
                                    </ImageBackground>
                                </View>,
                            )}
                            {RenderIf(this.state.show_parental_panel == true)(
                                <View
                                    style={{
                                        position: 'absolute',
                                        zIndex: 9999,
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
                                        source={require('../../../../images/side_panel_itv.png')}
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
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={"window-close"}
                                                Size={15}
                                                onPress={() =>
                                                    this.setState({
                                                        show_interactivetv_panel: false,
                                                        main_menu: true,
                                                        subtitle_menu: false,
                                                        problem_menu: false,
                                                        audio_menu: false,
                                                        screensize_menu: false,
                                                        thanks_problem: true,
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
                                            <Text
                                                numberOfLines={1}
                                                style={styles.H2}
                                            >
                                                Parental Control
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.Medium,
                                                    { color: '#fff' },
                                                ]}
                                            >
                                                Enter your parental code to get
                                                access to this content, a
                                                correct code is valid for 1 hour
                                                while changing
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
                                                        'rgba(204, 204, 204, 0.05)',
                                                }}
                                            >
                                                <Parental_Keyboard></Parental_Keyboard>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>,
                            )}
                            {RenderIf(
                                this.state.show_interactivetv_panel == true,
                            )(
                                <View
                                    style={{
                                        position: 'absolute',
                                        zIndex: 9999,
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
                                        source={require('../../../../images/side_panel_itv.png')}
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
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                Icon={"window-close"}
                                                Size={15}
                                                onPress={() =>
                                                    this.setState({
                                                        show_interactivetv_panel: false,
                                                        main_menu: true,
                                                        subtitle_menu: false,
                                                        problem_menu: false,
                                                        audio_menu: false,
                                                        screensize_menu: false,
                                                        thanks_problem: true,
                                                    })
                                                }
                                            ></ButtonCircle>
                                        </View>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'column',
                                                margin: 15,
                                                paddingTop: 0,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'column',
                                                    paddingTop: 20,
                                                }}
                                            >
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.H2}
                                                >
                                                    {this.state.program_now.n}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.Medium,
                                                        { color: '#fff' },
                                                    ]}
                                                >
                                                    {RenderIf(
                                                        this.hasCatchup(
                                                            this.state
                                                                .channelSelected,
                                                        ) == true,
                                                    )(
                                                        <FontAwesome5
                                                            style={
                                                                styles.Medium[
                                                                {
                                                                    color: '#fff',
                                                                    margin: 10,
                                                                }
                                                                ]
                                                            }
                                                            // icon={
                                                            //     SolidIcons.history
                                                            // }
                                                            name="history"
                                                        />,
                                                    )}
                                                    {RenderIf(
                                                        this.hasCatchup(
                                                            this.state
                                                                .channelSelected,
                                                        ) == true,
                                                    )(
                                                        <Text
                                                            style={[
                                                                styles.Medium,
                                                                { color: '#fff' },
                                                            ]}
                                                        >
                                                            &nbsp;
                                                        </Text>,
                                                    )}
                                                    {moment
                                                        .unix(
                                                            this.state
                                                                .program_now.s,
                                                        )
                                                        .format(
                                                            'ddd ' +
                                                            GLOBAL.Clock_Setting,
                                                        )}{' '}
                                                    -{' '}
                                                    {moment
                                                        .unix(
                                                            this.state
                                                                .program_now.e,
                                                        )
                                                        .format(
                                                            GLOBAL.Clock_Setting,
                                                        )}
                                                </Text>
                                                <Image
                                                    source={{
                                                        uri: this.getCurrentImage(
                                                            this.state
                                                                .channelSelected,
                                                        ),
                                                    }}
                                                    style={{
                                                        width:
                                                            (GLOBAL.Device_Width -
                                                                100) /
                                                            3,
                                                        height:
                                                            ((GLOBAL.Device_Width -
                                                                100) /
                                                                3 /
                                                                16) *
                                                            9,
                                                        marginVertical: 10,
                                                        borderRadius: 5,
                                                    }}
                                                />
                                                <Text
                                                    numberOfLines={3}
                                                    style={[
                                                        styles.Medium,
                                                        { paddingBottom: 10 },
                                                    ]}
                                                >
                                                    {this.state.program_now.d}
                                                </Text>
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        width: '100%',
                                                        height: null,
                                                        marginTop: 20,
                                                        borderRadius: 5,
                                                        paddingVertical: 3,
                                                    }}
                                                >
                                                    {RenderIf(
                                                        this.state.main_menu ==
                                                        true,
                                                    )(
                                                        <ScrollView
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width /
                                                                    3,
                                                            }}
                                                        >
                                                            {RenderIf(
                                                                this.hasCatchup(
                                                                    this.state
                                                                        .channelSelected,
                                                                ) == true &&
                                                                this.interactiveTvType() ==
                                                                'Replay',
                                                            )(
                                                                <ButtonSized
                                                                    hasTVPreferredFocus={
                                                                        this
                                                                            .state
                                                                            .show_interactivetv_panel ==
                                                                            true
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.replayProgram()
                                                                    }
                                                                    Text={
                                                                        'Restart Program'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.hasCatchup(
                                                                    this.state
                                                                        .channelSelected,
                                                                ) == true &&
                                                                this.interactiveTvType() ==
                                                                'Record',
                                                            )(
                                                                <ButtonSized
                                                                    hasTVPreferredFocus={
                                                                        this
                                                                            .state
                                                                            .show_interactivetv_panel ==
                                                                            true
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.recordProgram()
                                                                    }
                                                                    Text={
                                                                        'Record Program'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.hasCatchup(
                                                                    this.state
                                                                        .channelSelected,
                                                                ) == true &&
                                                                this.interactiveTvType() ==
                                                                'Watch',
                                                            )(
                                                                <ButtonSized
                                                                    hasTVPreferredFocus={
                                                                        this
                                                                            .state
                                                                            .show_interactivetv_panel ==
                                                                            true
                                                                            ? true
                                                                            : false
                                                                    }
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.watchPogram()
                                                                    }
                                                                    Text={
                                                                        'Watch Program'
                                                                    }
                                                                />,
                                                            )}

                                                            {RenderIf(
                                                                this.isFavorite(
                                                                    this.state
                                                                        .channelSelected,
                                                                ) == false,
                                                            )(
                                                                <ButtonSized
                                                                    Favorite={
                                                                        this
                                                                            .state
                                                                            .favorite_
                                                                    }
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this._onFavoriteChange(
                                                                            this
                                                                                .state
                                                                                .channel_now,
                                                                        )
                                                                    }
                                                                    Text={
                                                                        'Add Channel to Favorites'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.isFavorite(
                                                                    this.state
                                                                        .channelSelected,
                                                                ) == true,
                                                            )(
                                                                <ButtonSized
                                                                    Favorite={
                                                                        this
                                                                            .state
                                                                            .favorite_
                                                                    }
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this._onFavoriteChange(
                                                                            this
                                                                                .state
                                                                                .channel_now,
                                                                        )
                                                                    }
                                                                    Text={
                                                                        'Remove Channel from Favorites'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.state
                                                                    .text_tracks
                                                                    .length ==
                                                                0,
                                                            )(
                                                                <ButtonSized
                                                                    Disabled
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.openSubMenu(
                                                                            'subtitles',
                                                                        )
                                                                    }
                                                                    Text={
                                                                        'Change Subtitles'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.state
                                                                    .audio_tracks
                                                                    .length ==
                                                                1,
                                                            )(
                                                                <ButtonSized
                                                                    Disabled
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.openSubMenu(
                                                                            'audio',
                                                                        )
                                                                    }
                                                                    Text={
                                                                        'Change Audio'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.state
                                                                    .text_tracks
                                                                    .length > 0,
                                                            )(
                                                                <ButtonSized
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.openSubMenu(
                                                                            'subtitles',
                                                                        )
                                                                    }
                                                                    Text={
                                                                        'Change Subtitles (' +
                                                                        GLOBAL.Selected_TextTrack +
                                                                        ')'
                                                                    }
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                this.state
                                                                    .audio_tracks
                                                                    .length > 1,
                                                            )(
                                                                <ButtonSized
                                                                    SideMenu
                                                                    Width={
                                                                        (GLOBAL.Device_Width -
                                                                            120) /
                                                                        3
                                                                    }
                                                                    Padding={0}
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.openSubMenu(
                                                                            'audio',
                                                                        )
                                                                    }
                                                                    Text={
                                                                        'Change Audio (' +
                                                                        GLOBAL.Selected_AudioTrack +
                                                                        ')'
                                                                    }
                                                                />,
                                                            )}
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
                                                                }
                                                                Padding={0}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                onPress={() =>
                                                                    this.openSubMenu(
                                                                        'screensize',
                                                                    )
                                                                }
                                                                Text={
                                                                    'Change Screensize (' +
                                                                    GLOBAL.Screen_Size.charAt(
                                                                        0,
                                                                    ).toUpperCase() +
                                                                    GLOBAL.Screen_Size.slice(
                                                                        1,
                                                                    ) +
                                                                    ')'
                                                                }
                                                            />
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
                                                                }
                                                                Padding={0}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                onPress={() =>
                                                                    this.openSubMenu(
                                                                        'problem',
                                                                    )
                                                                }
                                                                Text={
                                                                    'Report a Problem'
                                                                }
                                                            />
                                                        </ScrollView>,
                                                    )}
                                                    {RenderIf(
                                                        this.state
                                                            .subtitle_menu ==
                                                        true,
                                                    )(
                                                        <View
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width /
                                                                    3,
                                                            }}
                                                        >
                                                            <FlatList
                                                                data={
                                                                    this.state
                                                                        .text_tracks
                                                                }
                                                                horizontal={
                                                                    false
                                                                }
                                                                keyExtractor={(
                                                                    item,
                                                                    index,
                                                                ) =>
                                                                    index.toString()
                                                                }
                                                                renderItem={({
                                                                    item,
                                                                    index,
                                                                }) => (
                                                                    <ButtonSized
                                                                        SideMenu
                                                                        Width={
                                                                            (GLOBAL.Device_Width -
                                                                                120) /
                                                                            3
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this._onPressSetSubtitle(
                                                                                i,
                                                                            )
                                                                        }
                                                                        Text={
                                                                            item.language
                                                                        }
                                                                        Icon={this.getStatusSubs(
                                                                            item.index,
                                                                        )}
                                                                    />
                                                                )}
                                                            />
                                                        </View>,
                                                    )}
                                                    {RenderIf(
                                                        this.state.audio_menu ==
                                                        true,
                                                    )(
                                                        <View
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width /
                                                                    3,
                                                            }}
                                                        >
                                                            <FlatList
                                                                data={
                                                                    this.state
                                                                        .audio_tracks
                                                                }
                                                                horizontal={
                                                                    false
                                                                }
                                                                keyExtractor={(
                                                                    item,
                                                                    index,
                                                                ) =>
                                                                    index.toString()
                                                                }
                                                                renderItem={({
                                                                    item,
                                                                    index,
                                                                }) => (
                                                                    <ButtonSized
                                                                        SideMenu
                                                                        Width={
                                                                            (GLOBAL.Device_Width -
                                                                                120) /
                                                                            3
                                                                        }
                                                                        Padding={
                                                                            0
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this._onPressSetAudio(
                                                                                item.index,
                                                                                item.language,
                                                                            )
                                                                        }
                                                                        Text={
                                                                            item.language
                                                                        }
                                                                        Icon={this.getStatusAudio(
                                                                            item.index,
                                                                        )}
                                                                    />
                                                                )}
                                                            />
                                                        </View>,
                                                    )}
                                                    {RenderIf(
                                                        this.state
                                                            .screensize_menu ==
                                                        true,
                                                    )(
                                                        <ScrollView
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width /
                                                                    3,
                                                            }}
                                                        >
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
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
                                                                Text={'None'}
                                                                Icon={this.getStatusScreen(
                                                                    'none',
                                                                )}
                                                            />
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
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
                                                                Text={'Contain'}
                                                                Icon={this.getStatusScreen(
                                                                    'contain',
                                                                )}
                                                            />
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
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
                                                                Text={'Cover'}
                                                                Icon={this.getStatusScreen(
                                                                    'cover',
                                                                )}
                                                            />
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
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
                                                                Text={'Stretch'}
                                                                Icon={this.getStatusScreen(
                                                                    'stretch',
                                                                )}
                                                            />
                                                        </ScrollView>,
                                                    )}
                                                    {RenderIf(
                                                        this.state
                                                            .problem_menu ==
                                                        true,
                                                    )(
                                                        <ScrollView
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width /
                                                                    3,
                                                            }}
                                                        >
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
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
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
                                                                }
                                                                Padding={0}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                onPress={() =>
                                                                    this._onPressProblemReport(
                                                                        'No Video',
                                                                        this
                                                                            .state
                                                                            .channel_now,
                                                                    )
                                                                }
                                                                Text={LANG.getTranslation(
                                                                    'video_not_working',
                                                                )}
                                                            />
                                                            <ButtonSized
                                                                SideMenu
                                                                Width={
                                                                    (GLOBAL.Device_Width -
                                                                        120) /
                                                                    3
                                                                }
                                                                Padding={0}
                                                                underlayColor={
                                                                    GLOBAL.Button_Color
                                                                }
                                                                onPress={() =>
                                                                    this._onPressProblemReport(
                                                                        'Both',
                                                                        this
                                                                            .state
                                                                            .channel_now,
                                                                    )
                                                                }
                                                                Text={LANG.getTranslation(
                                                                    'audio_video_not_working',
                                                                )}
                                                            />
                                                        </ScrollView>,
                                                    )}
                                                    {RenderIf(
                                                        this.state.loading ==
                                                        true,
                                                    )(
                                                        <View
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width /
                                                                    3,
                                                            }}
                                                        >
                                                            <ActivityIndicator
                                                                size={40}
                                                                color={
                                                                    '#e0e0e0'
                                                                }
                                                            />
                                                        </View>,
                                                    )}
                                                    {RenderIf(
                                                        this.state
                                                            .thanks_problem ==
                                                        true,
                                                    )(
                                                        <View
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width /
                                                                    3,
                                                            }}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.Standard,
                                                                    {
                                                                        color: '#fff',
                                                                    },
                                                                ]}
                                                            >
                                                                {LANG.getTranslation(
                                                                    'thank_you_problem',
                                                                )}
                                                            </Text>
                                                        </View>,
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>,
                            )}

                            {RenderIf(this.state.show_bottom_player == true)(
                                <View
                                    style={{
                                        position: 'absolute',
                                        zIndex: 9,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <ImageBackground
                                        style={{
                                            flex: 1,
                                            width: GLOBAL.Device_Width,
                                            height: GLOBAL.Device_Height,
                                        }}
                                        imageStyle={{ resizeMode: 'cover' }}
                                        source={require('../../../../images/playertv_bg.png')}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <View
                                                style={{ flexDirection: 'row' }}
                                            >
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        margin: 20,
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            justifyContent:
                                                                'center',
                                                            paddingRight: 20,
                                                        }}
                                                    >
                                                        <Text style={styles.H5}>
                                                            {
                                                                this.state
                                                                    .channelSelected
                                                                    .channel_number
                                                            }
                                                        </Text>
                                                    </View>
                                                    <View>
                                                        <Image
                                                            source={{
                                                                uri:
                                                                    this.state
                                                                        .channelSelected
                                                                        .channel_image ==
                                                                        undefined
                                                                        ? GLOBAL.ImageUrlCMS +
                                                                        this
                                                                            .state
                                                                            .channelSelected
                                                                            .icon_big
                                                                        : GLOBAL.ImageUrlCMS +
                                                                        this
                                                                            .state
                                                                            .channelSelected
                                                                            .channel_image,
                                                            }}
                                                            style={{
                                                                height:
                                                                    GLOBAL.Device_IsAppleTV ||
                                                                        GLOBAL.Device_IsWebTV
                                                                        ? 60
                                                                        : 40,
                                                                width:
                                                                    GLOBAL.Device_IsAppleTV ||
                                                                        GLOBAL.Device_IsWebTV
                                                                        ? 60
                                                                        : 40,
                                                            }}
                                                        />
                                                    </View>
                                                    <View
                                                        style={{
                                                            justifyContent:
                                                                'center',
                                                            paddingLeft: 20,
                                                        }}
                                                    >
                                                        <Text style={styles.H5}>
                                                            {
                                                                this.state
                                                                    .channelSelected
                                                                    .name
                                                            }
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        flex: 1,
                                                        justifyContent:
                                                            'flex-end',
                                                        margin: 20,
                                                    }}
                                                >
                                                    <Text style={styles.H2}>
                                                        {this.state.time}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    justifyContent: 'flex-end',
                                                    marginHorizontal: 50,
                                                    marginVertical: 25,
                                                }}
                                            >
                                                <Scrubber
                                                    value={
                                                        this.state.current_time
                                                    }
                                                    onSlidingComplete={
                                                        this.scrubberChange
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
                                                    e={this.state.program_now.e}
                                                    s={this.state.program_now.s}
                                                    live={true}
                                                />
                                            </View>
                                        </View>
                                    </ImageBackground>
                                </View>,
                            )}
                            {RenderIf(this.state.show_bottom_panel == true)(
                                <View
                                    style={{
                                        position: 'absolute',
                                        zIndex: 9,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <ImageBackground
                                        style={{
                                            flex: 1,
                                            width: GLOBAL.Device_Width,
                                            height: GLOBAL.Device_Height,
                                        }}
                                        imageStyle={{ resizeMode: 'cover' }}
                                        source={require('../../../../images/playertv_bg.png')}
                                    >
                                        <TouchableHighlight
                                            hasTVPreferredFocus={true}
                                            underlayColor={'transparent'}
                                            style={{ flex: 1 }}
                                            onPress={() => this.changeChannel()}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                'row',
                                                            margin: 20,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                justifyContent:
                                                                    'center',
                                                                paddingRight: 20,
                                                            }}
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.H5
                                                                }
                                                            >
                                                                {
                                                                    this.state
                                                                        .channelSelected
                                                                        .channel_number
                                                                }
                                                            </Text>
                                                        </View>
                                                        <View>
                                                            <Image
                                                                source={{
                                                                    uri:
                                                                        this
                                                                            .state
                                                                            .channelSelected
                                                                            .channel_image ==
                                                                            undefined
                                                                            ? GLOBAL.ImageUrlCMS +
                                                                            this
                                                                                .state
                                                                                .channelSelected
                                                                                .icon_big
                                                                            : GLOBAL.ImageUrlCMS +
                                                                            this
                                                                                .state
                                                                                .channelSelected
                                                                                .channel_image,
                                                                }}
                                                                style={{
                                                                    height:
                                                                        GLOBAL.Device_IsAppleTV ||
                                                                            GLOBAL.Device_IsWebTV
                                                                            ? 60
                                                                            : 40,
                                                                    width:
                                                                        GLOBAL.Device_IsAppleTV ||
                                                                            GLOBAL.Device_IsWebTV
                                                                            ? 60
                                                                            : 40,
                                                                }}
                                                            />
                                                        </View>
                                                        <View
                                                            style={{
                                                                justifyContent:
                                                                    'center',
                                                                paddingLeft: 20,
                                                            }}
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.H5
                                                                }
                                                            >
                                                                {
                                                                    this.state
                                                                        .channelSelected
                                                                        .name
                                                                }
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            flex: 1,
                                                            justifyContent:
                                                                'flex-end',
                                                            margin: 20,
                                                        }}
                                                    >
                                                        <Text style={styles.H2}>
                                                            {this.state.time}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        flex: 1,
                                                        alignItems: 'flex-end',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            flex: 1,
                                                            height:
                                                                GLOBAL.Device_Height /
                                                                4,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                justifyContent:
                                                                    'center',
                                                                alignItems:
                                                                    'flex-end',
                                                            }}
                                                        >
                                                            <Text
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                style={[
                                                                    styles.H4,
                                                                    {
                                                                        color: '#333',
                                                                    },
                                                                ]}
                                                            >
                                                                {
                                                                    this.state
                                                                        .program_previous
                                                                        .n
                                                                }
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.Medium,
                                                                    {
                                                                        color: '#333',
                                                                    },
                                                                ]}
                                                            >
                                                                {moment
                                                                    .unix(
                                                                        this
                                                                            .state
                                                                            .program_previous
                                                                            .s,
                                                                    )
                                                                    .format(
                                                                        'ddd ' +
                                                                        GLOBAL.Clock_Setting,
                                                                    )}{' '}
                                                                -{' '}
                                                                {moment
                                                                    .unix(
                                                                        this
                                                                            .state
                                                                            .program_previous
                                                                            .e,
                                                                    )
                                                                    .format(
                                                                        GLOBAL.Clock_Setting,
                                                                    )}
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={{
                                                                width:
                                                                    GLOBAL.Device_Width /
                                                                    2,
                                                                justifyContent:
                                                                    'center',
                                                                marginHorizontal: 20,
                                                                borderRightColor:
                                                                    '#111',
                                                                borderRightWidth: 2,
                                                                borderLeftColor:
                                                                    '#111',
                                                                borderLeftWidth: 2,
                                                            }}
                                                        >
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'row',
                                                                }}
                                                            >
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                ></View>
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <Image
                                                                        source={{
                                                                            uri:
                                                                                this
                                                                                    .state
                                                                                    .channel_previous
                                                                                    .channel_image ==
                                                                                    undefined
                                                                                    ? GLOBAL.ImageUrlCMS +
                                                                                    this
                                                                                        .state
                                                                                        .channel_previous
                                                                                        .icon_big
                                                                                    : GLOBAL.ImageUrlCMS +
                                                                                    this
                                                                                        .state
                                                                                        .channel_previous
                                                                                        .channel_image,
                                                                        }}
                                                                        style={{
                                                                            opacity: 0.3,
                                                                            height:
                                                                                GLOBAL.Device_IsAppleTV ||
                                                                                    GLOBAL.Device_IsWebTV
                                                                                    ? 30
                                                                                    : 20,
                                                                            width:
                                                                                GLOBAL.Device_IsAppleTV ||
                                                                                    GLOBAL.Device_IsWebTV
                                                                                    ? 30
                                                                                    : 20,
                                                                        }}
                                                                    />
                                                                </View>
                                                                <View
                                                                    style={{
                                                                        flex: 5,
                                                                        paddingLeft: 10,
                                                                    }}
                                                                ></View>
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                ></View>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'row',
                                                                    flex: 1,
                                                                    justifyContent:
                                                                        'center',
                                                                    alignItems:
                                                                        'center',
                                                                }}
                                                            >
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <Text
                                                                        style={
                                                                            styles.H2
                                                                        }
                                                                    >
                                                                        {
                                                                            this
                                                                                .state
                                                                                .channel_now
                                                                                .channel_number
                                                                        }
                                                                    </Text>
                                                                </View>
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <Image
                                                                        source={{
                                                                            uri:
                                                                                this
                                                                                    .state
                                                                                    .channel_now
                                                                                    .channel_image ==
                                                                                    undefined
                                                                                    ? GLOBAL.ImageUrlCMS +
                                                                                    this
                                                                                        .state
                                                                                        .channel_now
                                                                                        .icon_big
                                                                                    : GLOBAL.ImageUrlCMS +
                                                                                    this
                                                                                        .state
                                                                                        .channel_now
                                                                                        .channel_image,
                                                                        }}
                                                                        style={{
                                                                            height:
                                                                                GLOBAL.Device_IsAppleTV ||
                                                                                    GLOBAL.Device_IsWebTV
                                                                                    ? 60
                                                                                    : 40,
                                                                            width:
                                                                                GLOBAL.Device_IsAppleTV ||
                                                                                    GLOBAL.Device_IsWebTV
                                                                                    ? 60
                                                                                    : 40,
                                                                        }}
                                                                    />
                                                                </View>
                                                                <View
                                                                    style={{
                                                                        flex: 5,
                                                                        paddingLeft: 10,
                                                                    }}
                                                                >
                                                                    <Text
                                                                        numberOfLines={
                                                                            1
                                                                        }
                                                                        style={
                                                                            styles.H2
                                                                        }
                                                                    >
                                                                        {
                                                                            this
                                                                                .state
                                                                                .program_now
                                                                                .n
                                                                        }
                                                                    </Text>
                                                                    <Text
                                                                        style={[
                                                                            styles.H5,
                                                                            {
                                                                                color: '#fff',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {RenderIf(
                                                                            this.hasCatchup(
                                                                                this
                                                                                    .state
                                                                                    .channel_now,
                                                                            ) ==
                                                                            true,
                                                                        )(
                                                                            <FontAwesome5
                                                                                style={
                                                                                    styles
                                                                                        .H5[
                                                                                    {
                                                                                        color: '#fff',
                                                                                        margin: 10,
                                                                                    }
                                                                                    ]
                                                                                }
                                                                                // icon={
                                                                                //     SolidIcons.history
                                                                                // }
                                                                                name="history"
                                                                            />,
                                                                        )}
                                                                        {RenderIf(
                                                                            this.hasCatchup(
                                                                                this
                                                                                    .state
                                                                                    .channel_now,
                                                                            ) ==
                                                                            true,
                                                                        )(
                                                                            <Text
                                                                                style={[
                                                                                    styles.H5,
                                                                                    {
                                                                                        color: '#ffff',
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                &nbsp;
                                                                            </Text>,
                                                                        )}
                                                                        {RenderIf(
                                                                            this.isFavorite(
                                                                                this
                                                                                    .state
                                                                                    .channel_now,
                                                                            ) ==
                                                                            true,
                                                                        )(
                                                                            <FontAwesome
                                                                                style={
                                                                                    styles
                                                                                        .H5[
                                                                                    {
                                                                                        color: '#fff',
                                                                                        margin: 10,
                                                                                    }
                                                                                    ]
                                                                                }
                                                                                // icon={
                                                                                //     RegularIcons.heart
                                                                                // }
                                                                                name="heart-o"
                                                                            />,
                                                                        )}
                                                                        {RenderIf(
                                                                            this.isFavorite(
                                                                                this
                                                                                    .state
                                                                                    .channel_now,
                                                                            ) ==
                                                                            true,
                                                                        )(
                                                                            <Text
                                                                                style={[
                                                                                    styles.H5,
                                                                                    {
                                                                                        color: '#fff',
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                &nbsp;
                                                                            </Text>,
                                                                        )}
                                                                        {moment
                                                                            .unix(
                                                                                this
                                                                                    .state
                                                                                    .program_now
                                                                                    .s,
                                                                            )
                                                                            .format(
                                                                                'ddd ' +
                                                                                GLOBAL.Clock_Setting,
                                                                            )}{' '}
                                                                        -{' '}
                                                                        {moment
                                                                            .unix(
                                                                                this
                                                                                    .state
                                                                                    .program_now
                                                                                    .e,
                                                                            )
                                                                            .format(
                                                                                GLOBAL.Clock_Setting,
                                                                            )}
                                                                    </Text>
                                                                </View>
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    {RenderIf(
                                                                        this
                                                                            .state
                                                                            .channelSelected
                                                                            .channel_id ==
                                                                        this
                                                                            .state
                                                                            .channel_now
                                                                            .channel_id,
                                                                    )(
                                                                        <FontAwesome5
                                                                            style={{
                                                                                fontSize: 15,
                                                                                color: '#fff',
                                                                            }}
                                                                            // icon={
                                                                            //     SolidIcons.ellipsisHh
                                                                            // }
                                                                            name="ellipsis-h"
                                                                        />,
                                                                    )}
                                                                    {RenderIf(
                                                                        this
                                                                            .state
                                                                            .channelSelected
                                                                            .channel_id !=
                                                                        this
                                                                            .state
                                                                            .channel_now
                                                                            .channel_id,
                                                                    )(
                                                                        <FontAwesome5
                                                                            style={{
                                                                                fontSize: 15,
                                                                                color: '#fff',
                                                                            }}
                                                                            // icon={
                                                                            //     SolidIcons.playCircle
                                                                            // }
                                                                            name="play-circle"
                                                                        />,
                                                                    )}
                                                                </View>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'row',
                                                                }}
                                                            >
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                ></View>
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                >
                                                                    <Image
                                                                        source={{
                                                                            uri:
                                                                                this
                                                                                    .state
                                                                                    .channel_next
                                                                                    .channel_image ==
                                                                                    undefined
                                                                                    ? GLOBAL.ImageUrlCMS +
                                                                                    this
                                                                                        .state
                                                                                        .channel_next
                                                                                        .icon_big
                                                                                    : GLOBAL.ImageUrlCMS +
                                                                                    this
                                                                                        .state
                                                                                        .channel_next
                                                                                        .channel_image,
                                                                        }}
                                                                        style={{
                                                                            opacity: 0.3,
                                                                            height:
                                                                                GLOBAL.Device_IsAppleTV ||
                                                                                    GLOBAL.Device_IsWebTV
                                                                                    ? 30
                                                                                    : 20,
                                                                            width:
                                                                                GLOBAL.Device_IsAppleTV ||
                                                                                    GLOBAL.Device_IsWebTV
                                                                                    ? 30
                                                                                    : 20,
                                                                        }}
                                                                    />
                                                                </View>
                                                                <View
                                                                    style={{
                                                                        flex: 5,
                                                                        paddingLeft: 10,
                                                                    }}
                                                                ></View>
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        alignItems:
                                                                            'center',
                                                                    }}
                                                                ></View>
                                                            </View>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                justifyContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            <Text
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                style={[
                                                                    styles.H4,
                                                                    {
                                                                        color: '#333',
                                                                    },
                                                                ]}
                                                            >
                                                                {
                                                                    this.state
                                                                        .program_next
                                                                        .n
                                                                }
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.Medium,
                                                                    {
                                                                        color: '#333',
                                                                    },
                                                                ]}
                                                            >
                                                                {moment
                                                                    .unix(
                                                                        this
                                                                            .state
                                                                            .program_next
                                                                            .s,
                                                                    )
                                                                    .format(
                                                                        'ddd ' +
                                                                        GLOBAL.Clock_Setting,
                                                                    )}{' '}
                                                                -{' '}
                                                                {moment
                                                                    .unix(
                                                                        this
                                                                            .state
                                                                            .program_next
                                                                            .e,
                                                                    )
                                                                    .format(
                                                                        GLOBAL.Clock_Setting,
                                                                    )}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableHighlight>
                                    </ImageBackground>
                                </View>,
                            )}
                            {RenderIf(
                                GLOBAL.UserInterface.home.enable_tv_preview ==
                                true &&
                                GLOBAL.Device_IsSmartTV == false &&
                                this.state.show_player,
                            )(
                                <View
                                    style={{
                                        width: GLOBAL.Device_Width,
                                        height: GLOBAL.Device_Height,
                                        position: 'absolute',
                                        zIndex: 1,
                                        left: 0,
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
                                                'User-Agent': GLOBAL.User_Agent,
                                            },
                                            drm: {
                                                type:
                                                    this.state.drmKey == ''
                                                        ? null
                                                        : GLOBAL.Device_System ==
                                                            'Apple'
                                                            ? DRMType.FAIRPLAY
                                                            : DRMType.WIDEVINE,
                                                licenseServer:
                                                    GLOBAL.DrmKeyServerUrl,
                                                headers: {
                                                    customData:
                                                        this.state.drmKey,
                                                },
                                            },
                                        }}
                                        disableFocus={true}
                                        style={{
                                            backgroundColor: '#000',
                                            width: GLOBAL.Device_Width,
                                            height: GLOBAL.Device_Height,
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                        }}
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
                                    />
                                </View>,
                            )}
                        </View>,
                    )}
                </ImageBackground>
            </Container>
        );
    }
}
