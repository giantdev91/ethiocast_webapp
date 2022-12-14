import React, { Component } from 'react';
import {
    Text,
    BackHandler,
    TVMenuControl,
    Image,
    View,
    ImageBackground,
    TouchableHighlight,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import Video from 'react-native-video/dom/Video';
import { ScrollView } from 'react-native-gesture-handler';
import { sendPageReport } from '../../../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

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

        var channel_width = GLOBAL.COL_REMAINING_10 * 5;
        var series_width = GLOBAL.COL_REMAINING_10 * 3;
        var movies_width = GLOBAL.COL_REMAINING_10 * 2;

        GLOBAL.PIN_SET = false;
        GLOBAL.Focus = 'Home';
        GLOBAL.IsHomeLoaded = true;
        GLOBAL.Hamburger = false;
        if (GLOBAL.Metro != undefined) {
            if (GLOBAL.Metro.metromovieitems != undefined) {
                var movies_ = GLOBAL.Metro.metromovieitems;
                movies = UTILS.getHomeMoviesMixedFavorites(movies_);
                if (GLOBAL.Device_IsPhone && movies.length > 12) {
                    movies = movies.splice(0, 12);
                }
                if (movies.length > 0) {
                    var random = Math.floor(Math.random() * movies.length);
                    hero_index = random;
                    var movie = movies[random];
                    hero_movie = movie;
                }
                movie = movies[0];
            }
            if (GLOBAL.Metro.metroserieitems != undefined) {
                var series_ = GLOBAL.Metro.metroserieitems;
                series = UTILS.getHomeSeriesMixedFavorites(series_);
                if (GLOBAL.Device_IsPhone && series.length > 5) {
                    series = series.splice(0, 5);
                }
            }
            if (GLOBAL.Metro.metrortvitems != undefined) {
                var channels_ = GLOBAL.Metro.metrortvitems;
                var channelsIn = channels_.sort(
                    (a, b) => a.channel_number - b.channel_number,
                );
                var mixed_channels =
                    UTILS.getHomeChannelsMixedFavorites(channelsIn);
                channels = mixed_channels;
            }
            if (GLOBAL.Metro.metroappitems != undefined) {
                var apps = GLOBAL.Metro.metroappitems;
            }
            if (GLOBAL.Metro.metronewsitems != undefined) {
                news = GLOBAL.Metro.metronewsitems;
            }
        }

        if (movies.length == 0 && series.length == 0) {
            channel_width = GLOBAL.COL_REMAINING_1;
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
            drmKey: '',
            drmSupplierType: '',
            drmLicenseServerUrl: '',
            drmCertificateUrl: '',
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

            videoUrl: '',
            videoType: 'mp4',
            drmKey: '',
            paused: false,
            channelSelected: [],

            channel_width: channel_width,
            series_width: series_width,
            movies_width: movies_width,
        };
    }
    onFocusExtra(channel) {
        TimerMixin.clearTimeout(this.zapTimer);
        this.zapTimer = TimerMixin.setTimeout(() => {
            this.startChannel(channel);
        }, 2000);
    }
    startChannel(channel) {
        if (channel == undefined) {
            if (
                this.state.channels.length > 0 ||
                GLOBAL.HomePlayChannelStarted == true
            ) {
                if (
                    GLOBAL.Channels_Selected == undefined ||
                    GLOBAL.Channels_Selected.length == 0
                ) {
                    GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
                    GLOBAL.Channels_Selected_Category_ID =
                        GLOBAL.Channels[0].id;
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
                if (
                    GLOBAL.Channels_Selected != null &&
                    GLOBAL.Channels_Selected != undefined &&
                    GLOBAL.Channels_Selected.length > 0
                ) {
                    var channel_id =
                        GLOBAL.Channels_Selected[GLOBAL.Channels_Selected_Index]
                            .channel_id;
                    var channel = UTILS.getChannel(channel_id);

                    TimerMixin.clearTimeout(this.exittimer);
                    this.exittime = TimerMixin.setTimeout(() => {
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
                        this.startTV(url, channel);
                    }, 1000);
                }
            }
        } else {
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
            },
        );
        this.getNews();
        this.startChannel();
        const date = moment().format('DD_MM_YYYY');
        if (GLOBAL.EPG_DATE_LOADED != date) {
            this.getEpgData();
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
        TimerMixin.clearTimeout(this.zapTimer);
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
    getAdsVertical() {
        const unix_now = moment().unix();
        if (GLOBAL.Home_Screen_Ads_Date_Vertical < unix_now) {
            const unix_till_new_ads = moment().unix() + 86400;
            GLOBAL.Home_Screen_Ads_Date_Vertical = unix_till_new_ads;
            DAL.getHomeScreenAds('vertical')
                .then(ads => {
                    GLOBAL.Home_Screen_Ads_Vertical = ads;
                    if (ads.url != null) {
                        this.setState({
                            leftbanner: GLOBAL.ImageUrlCMS + ads.url,
                            ads: ads,
                            campaignbackdrop2: ads.campaignbackdrop,
                            campaignemail2: ads.campaignemail,
                            campaignid2: ads.campaignid,
                            campaignstream2: ads.campaignstream,
                            campaigntext2: ads.campaigntext,
                            campaignenabled2: ads.campaignenabled,
                        });
                    }
                    REPORT.set({
                        key: 'ads-home-ads',
                        type: 33,
                        id: 12,
                    });
                    REPORT.endAction('ads-home-ads');
                })
                .catch(error => { });
        } else {
            var ads = GLOBAL.Home_Screen_Ads_Vertical;
            if (ads != null) {
                if (ads.url != null) {
                    this.setState({
                        leftbanner: GLOBAL.ImageUrlCMS + ads.url,
                        ads: ads,
                    });
                }
            }
        }
    }
    getAdsHorizontal() {
        const unix_now = moment().unix();
        if (GLOBAL.Home_Screen_Ads_Date_Horizontal < unix_now) {
            const unix_till_new_ads = moment().unix() + 86400;
            GLOBAL.Home_Screen_Ads_Date_Horizontal = unix_till_new_ads;
            DAL.getHomeScreenAds('horizontal')
                .then(ads => {
                    GLOBAL.Home_Screen_Ads_Horizontal = ads;
                    if (ads.url != null) {
                        this.setState({
                            bottombanner: GLOBAL.ImageUrlCMS + ads.url,
                            ads: ads,
                            campaignbackdrop: ads.campaignbackdrop,
                            campaignemail: ads.campaignemail,
                            campaignid: ads.campaignid,
                            campaignstream: ads.campaignstream,
                            campaigntext: ads.campaigntext,
                            campaignenabled: ads.campaignenabled,
                        });
                    }
                    REPORT.set({
                        key: 'ads-home-ads',
                        type: 33,
                        id: 12,
                    });
                    REPORT.endAction('ads-home-ads');
                })
                .catch(error => { });
        } else {
            var ads = GLOBAL.Home_Screen_Ads_Horizontal;
            if (ads != null) {
                if (ads.url != null) {
                    this.setState({
                        bottombanner: GLOBAL.ImageUrlCMS + ads.url,
                        ads: ads,
                    });
                }
            }
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
    openAdHorizontal() {
        if (this.state.ads.campaignenabled == 1) {
            Actions.Ads_Campaign({
                campaignbackdrop: this.state.ads.campaignbackdrop,
                campaignemail: this.state.ads.campaignemail,
                campaignid: this.state.ads.campaignid,
                campaignstream: this.state.ads.campaignstream,
                campaigntext: this.state.ads.campaigntext,
            });
        }
    }
    openAdVertical() {
        if (this.state.ads.campaignenabled2 == 1) {
            Actions.Ads_Campaign({
                campaignbackdrop: this.state.ads.campaignbackdrop2,
                campaignemail: this.state.ads.campaignemail2,
                campaignid: this.state.ads.campaignid2,
                campaignstream: this.state.ads.campaignstream2,
                campaigntext: this.state.ads.campaigntext2,
            });
        }
    }
    startTV(url, channel_) {
        var channel = UTILS.getChannel(channel_.channel_id);
        if (channel == undefined) {
            return;
        }
        if (channel.childlock == 1) {
            return;
        }
        if (url == undefined) {
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
                videoType: type,
                channelSelected: channel,
            });
        }
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

    onEnableScroll = value => {
        this.setState({
            enableScrollViewScroll: value,
        });
    };

    render() {
        return (
            <Container needs_notch={true}>
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

                    {RenderIf(GLOBAL.Device_IsPhone == false)(
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            <View
                                style={{
                                    position: 'absolute',
                                    zIndex: 9999,
                                    top: 0,
                                    width:
                                        GLOBAL.Device_Width -
                                        (GLOBAL.Device_IsWebTV ? 200 : 100),
                                }}
                            >
                                <Modal Type={'MessageHome'}> </Modal>
                            </View>

                            <View
                                style={{
                                    backgroundColor: '#222',
                                    marginHorizontal: 11,
                                    padding: 20,
                                    borderRadius: 5,
                                    marginTop: 5,
                                    marginLeft: 9,
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
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    marginHorizontal: 10,
                                }}
                            >
                                <View
                                    style={{
                                        width: this.state.channel_width,
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <View
                                        style={{
                                            paddingBottom: 5,
                                            paddingTop: 2,
                                        }}
                                    >
                                        {RenderIf(
                                            this.state.channels.length > 0 &&
                                            GLOBAL.UserInterface.home
                                                .enable_tv_preview ==
                                            true &&
                                            GLOBAL.Device_IsSmartTV ==
                                            false,
                                        )(
                                            <View style={{ marginTop: -5 }}>
                                                <Text
                                                    style={[
                                                        styles.H2,
                                                        styles.Shadow,
                                                        {
                                                            paddingVertical: 5,
                                                            paddingLeft: 15,
                                                        },
                                                    ]}
                                                >
                                                    {LANG.getTranslation(
                                                        'channels',
                                                    )}
                                                </Text>
                                            </View>,
                                        )}
                                        {RenderIf(
                                            this.state.channels.length > 0 &&
                                            GLOBAL.UserInterface.home
                                                .enable_tv_preview ==
                                            true &&
                                            GLOBAL.Device_IsSmartTV ==
                                            false &&
                                            this.state.videoUrl != '',
                                        )(
                                            <View
                                                style={{
                                                    width:
                                                        GLOBAL.COL_REMAINING_10 *
                                                        5 -
                                                        18,
                                                    height:
                                                        ((GLOBAL.COL_REMAINING_10 *
                                                            5 -
                                                            18) /
                                                            16) *
                                                        9,
                                                    backgroundColor: '#000',
                                                    marginLeft: 10,
                                                    marginTop: 8,
                                                    borderRadius: 3,
                                                }}
                                            >
                                                {this.state.movies.length > 0 ||
                                                    (this.state.series.length >
                                                        0 && (
                                                            <Text
                                                                style={[
                                                                    styles.H2,
                                                                    {
                                                                        paddingVertical: 5,
                                                                        paddingLeft: 15,
                                                                        borderRadius: 5,
                                                                    },
                                                                ]}
                                                            >
                                                                {LANG.getTranslation(
                                                                    'channels',
                                                                )}
                                                            </Text>
                                                        ))}
                                                <TouchableHighlightFocus
                                                    BorderRadius={5}
                                                    activeOpacity={1}
                                                    style={{
                                                        height:
                                                            ((GLOBAL.COL_REMAINING_10 *
                                                                5 -
                                                                8) /
                                                                16) *
                                                            9,
                                                        backgroundColor: '#000',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        marginTop: -1,
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
                                                            this.player = ref;
                                                        }}
                                                        source={{
                                                            uri: this.state
                                                                .videoUrl,
                                                            type: this.state
                                                                .videoType,
                                                            ref: 'player',
                                                            headers: {
                                                                'User-Agent':
                                                                    GLOBAL.User_Agent,
                                                            },
                                                            drm: TOKEN.getDrmSetup(
                                                                this.state
                                                                    .drmSupplierType,
                                                                this.state
                                                                    .drmLicenseServerUrl,
                                                                this.state
                                                                    .drmCertificateUrl,
                                                                this.state
                                                                    .drmKey,
                                                            ),
                                                        }}
                                                        disableFocus={true}
                                                        useTextureView={false}
                                                        style={{
                                                            borderRadius: 3,
                                                            backgroundColor:
                                                                '#000',
                                                            width:
                                                                GLOBAL.COL_REMAINING_10 *
                                                                5 -
                                                                18,
                                                            height:
                                                                ((GLOBAL.COL_REMAINING_10 *
                                                                    5 -
                                                                    18) /
                                                                    16) *
                                                                9,
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                        }}
                                                        resizeMode="stretch"
                                                        paused={false}
                                                        repeat={false}
                                                        selectedAudioTrack={{
                                                            type: 'index',
                                                            value: 0,
                                                        }}
                                                    />
                                                </TouchableHighlightFocus>
                                                <View
                                                    style={{
                                                        position: 'absolute',
                                                        justifyContent:
                                                            'flex-end',
                                                        alignItems: 'flex-end',
                                                        left: 9,
                                                        right: 9,
                                                        bottom: 3,
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.60)',
                                                        padding: 5,
                                                        borderBottomRightRadius: 3,
                                                        borderBottomLeftRadius: 3,
                                                    }}
                                                >
                                                    <Text
                                                        style={styles.Standard}
                                                    >
                                                        {
                                                            this.state
                                                                .channelSelected
                                                                .channel_number
                                                        }{' '}
                                                        {
                                                            this.state
                                                                .channelSelected
                                                                .name
                                                        }
                                                    </Text>
                                                </View>
                                            </View>,
                                        )}
                                    </View>
                                    <View
                                        style={{
                                            flex: 2,
                                            flexDirection: 'column',
                                            alignContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <ChannelList
                                            extraData={this.state.channels}
                                            onFocusExtra={channel =>
                                                this.onFocusExtra(channel)
                                            }
                                            Channels={this.state.channels}
                                            Width={
                                                this.state.channel_width - 10
                                            }
                                            ColumnType={this.state.channelType}
                                            Columns={1}
                                            Type={'Big'}
                                            getItemLayout={(data, index) => {
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
                                </View>

                                {RenderIf(this.state.series.length > 0)(
                                    <View
                                        style={{ width: this.state.series_width }}
                                    >
                                        <Text
                                            style={[
                                                styles.H2,
                                                styles.Shadow,
                                                {
                                                    paddingVertical: 5,
                                                    paddingLeft: 10,
                                                },
                                            ]}
                                        >
                                            {LANG.getTranslation('series')}
                                        </Text>
                                        <FlatList
                                            extraData={this.state.series}
                                            data={this.state.series}
                                            horizontal={false}
                                            numColumns={1}
                                            style={{
                                                border: 1,
                                                borderColor: 'transparent',
                                            }}
                                            removeClippedSubviews={true}
                                            scrollType="series"
                                            keyExtractor={(item, index) =>
                                                'series_' + index.toString()
                                            }
                                            getItemLayout={(data, index) => {
                                                return {
                                                    length: GLOBAL.Device_IsAppleTV
                                                        ? 360
                                                        : 260,
                                                    index,
                                                    offset:
                                                        (GLOBAL.Device_IsAppleTV
                                                            ? 360
                                                            : 260) * index,
                                                };
                                            }}
                                            renderItem={({ item, index }) => (
                                                <TouchableHighlightFocus
                                                    style={{
                                                        width:
                                                            this.state
                                                                .series_width -
                                                            8,
                                                    }}
                                                    BorderRadius={5}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        Actions.Series_Details({
                                                            season_name:
                                                                item.id,
                                                            fromPage: 'Home',
                                                        })
                                                    }
                                                >
                                                    <View
                                                        style={{
                                                            padding: 4,
                                                            backgroundColor:
                                                                '#111',
                                                            borderRadius: 5,
                                                            width:
                                                                this.state
                                                                    .series_width -
                                                                16,
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
                                                                    //     SolidIcons.heart
                                                                    // }
                                                                    name="heart"
                                                                />
                                                            </View>,
                                                        )}
                                                        <ScaledImage
                                                            uri={
                                                                GLOBAL.ImageUrlCMS +
                                                                item.backdrop
                                                            }
                                                            width={
                                                                this.state
                                                                    .series_width -
                                                                25
                                                            }
                                                        />
                                                        <View
                                                            style={{
                                                                position:
                                                                    'absolute',
                                                                bottom: 0,
                                                                right: 3,
                                                                left: 3,
                                                                paddingBottom: 5,
                                                                backgroundColor:
                                                                    '#111',
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
                                                                            this
                                                                                .state
                                                                                .series_width -
                                                                            40,
                                                                    },
                                                                ]}
                                                            >
                                                                {item.name}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlightFocus>
                                            )}
                                        />
                                    </View>,
                                )}

                                {RenderIf(this.state.movies.length > 0)(
                                    <View
                                        style={{ width: this.state.movies_width }}
                                    >
                                        <Text
                                            style={[
                                                styles.H2,
                                                styles.Shadow,
                                                {
                                                    paddingVertical: 5,
                                                    paddingLeft: 10,
                                                },
                                            ]}
                                        >
                                            {LANG.getTranslation('movies')}
                                        </Text>
                                        <View
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                            }}
                                        >
                                            <FlatList
                                                extraData={this.state.movies}
                                                data={this.state.movies}
                                                horizontal={false}
                                                numColumns={1}
                                                removeClippedSubviews={true}
                                                scrollType="movies"
                                                keyExtractor={(item, index) =>
                                                    'movies_' + index.toString()
                                                }
                                                getItemLayout={(
                                                    data,
                                                    index,
                                                ) => {
                                                    return {
                                                        length: 210,
                                                        index,
                                                        offset: 210 * index,
                                                    };
                                                }}
                                                renderItem={({ item, index }) => (
                                                    <TouchableHighlightFocus
                                                        style={{
                                                            width:
                                                                this.state
                                                                    .movies_width -
                                                                8,
                                                        }}
                                                        BorderRadius={5}
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
                                                                padding: 4,
                                                                backgroundColor:
                                                                    '#111',
                                                                borderRadius: 5,
                                                                width:
                                                                    this.state
                                                                        .movies_width -
                                                                    16,
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
                                                                        //     SolidIcons.heart
                                                                        // }
                                                                        name="heart"
                                                                    />
                                                                </View>,
                                                            )}
                                                            <ScaledImage
                                                                uri={
                                                                    GLOBAL.ImageUrlCMS +
                                                                    item.poster
                                                                }
                                                                width={
                                                                    this.state
                                                                        .movies_width -
                                                                    25
                                                                }
                                                            />
                                                            <View
                                                                style={{
                                                                    position:
                                                                        'absolute',
                                                                    bottom: 0,
                                                                    right: 3,
                                                                    left: 3,
                                                                    paddingBottom: 5,
                                                                    backgroundColor:
                                                                        '#111',
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
                                                                                this
                                                                                    .state
                                                                                    .movies_width -
                                                                                40,
                                                                        },
                                                                    ]}
                                                                >
                                                                    {item.name}
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
                        </View>,
                    )}
                </ImageBackground>
            </Container>
        );
    }
}
