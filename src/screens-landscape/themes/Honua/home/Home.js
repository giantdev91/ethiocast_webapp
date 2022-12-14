import React, {Component} from 'react';
import {
    Text,
    BackHandler,
    TVMenuControl,
    Image,
    View,
    ScrollView,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import {sendPageReport} from '../../../../reporting/reporting';
export default class Home extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        var movies = [];
        var series = [];
        var channels = [];
        var news = [];
        GLOBAL.PIN_SET = false;
        GLOBAL.Focus = 'Home';
        GLOBAL.IsHomeLoaded = true;
        //UTILS.refreshUserData();
        if (GLOBAL.Metro != undefined) {
            if (GLOBAL.Metro.metromovieitems != undefined) {
                movies = GLOBAL.Metro.metromovieitems;
            }
            if (GLOBAL.Metro.metroserieitems != undefined) {
                series = GLOBAL.Metro.metroserieitems;
            }
            if (GLOBAL.Metro.metrortvitems != undefined) {
                var channels_ = GLOBAL.Metro.metrortvitems;
                channels = channels_.sort(
                    (a, b) => a.channel_number - b.channel_number,
                );
            }
            if (GLOBAL.Metro.metronewsitems != undefined) {
                news = GLOBAL.Metro.metronewsitems;
            }
        }

        var movie_width = GLOBAL.COL_REMAINING_2 / 2 - 10;
        var channel_width = GLOBAL.COL_REMAINING_2 - 2;
        var movie_columns = 2;
        if (GLOBAL.Device_IsWebTV) {
            movie_width = GLOBAL.COL_REMAINING_2 / 3 - 10;
            channel_width = GLOBAL.COL_REMAINING_2;
            movie_columns = 3;
        }

        GLOBAL.EPG_Search_Channels = [];
        GLOBAL.EPG_Search_EPG = [];

        this.state = {
            reportStartTime: moment().unix(),
            movie_columns: movie_columns,
            movie_width: movie_width,
            channel_width: channel_width,
            movies: movies,
            series: series,
            channels: channels,
            news: news,
            //watched: this.getContinueWatching(),
            bottombanner: GLOBAL.HTTPvsHTTPS + '',
            rightbanner: GLOBAL.HTTPvsHTTPS + '',
            newsimage: GLOBAL.Logo,
            newstext: 'No news at the moment...',
            newsdate: moment().format('LL'),
            log: '',
            ads: [],
            ads2: [],
            show_numeric: false,
            numeric_number: '',
            update: '',
            numeric_color: 'rgba(10, 10, 10, 0.83)',
            progressWidth: 0,
            leftbannerwidth: 0,
            bottombannerheight: 0,
            channelRowWidth: 0,
            movieRowWidth: 0,
            show_exit_app: false,
            leftbannerheight: 0,
            bottombannerwidth: 0,
        };
        if (
            GLOBAL.Product.menu.menuitems.find(m => m.name == 'Home') !=
            undefined
        ) {
            GLOBAL.Menu_Type = GLOBAL.Product.menu.menuitems.find(
                m => m.name == 'Home',
            ).type;
        } else {
            GLOBAL.Menu_Type = 'full';
        }
    }
    updateDimensions() {
        Actions.Home();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        REPORT.set({type: 21});
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
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
        // if (GLOBAL.UserInterface.home.enable_ads == true && GLOBAL.Device_IsSmartTV == false && GLOBAL.Ads_Enabled == true) {
        //     this.getAdsHorizontal();
        //     this.getAdsVertical();
        // }
        const date = moment().format('DD_MM_YYYY');
        if (GLOBAL.EPG_DATE_LOADED != date) {
            this.getEpgData();
        }

        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (keyEvent.keyCode >= 7 && keyEvent.keyCode <= 16) {
                    var newNumber =
                        this.state.numeric_number + '' + (keyEvent.keyCode - 7);
                    this.setState({
                        numeric_number: newNumber,
                        numeric_color: 'rgba(10, 10, 10, 0.83)',
                        show_numeric: true,
                    });
                    TimerMixin.clearTimeout(this.numericTimer);
                    TimerMixin.clearTimeout(this.numericTimer2);
                    this.numericTimer = TimerMixin.setTimeout(() => {
                        var channelNumber = this.state.numeric_number;
                        if (GLOBAL.Channels_Selected != null) {
                            var channel = GLOBAL.Channels_Selected.find(
                                x => x.channel_number == channelNumber,
                            );
                            if (channel != undefined) {
                                var index = UTILS.getChannelIndex(
                                    channel.channel_id,
                                );
                                GLOBAL.Channels_Selected_Index = index;
                                GLOBAL.Channel = channel;
                                Actions.Player({fromPage: 'Home'});
                            } else {
                                this.setState({
                                    numeric_color: 'rgba(777, 11, 10, 0.83)',
                                });
                                TimerMixin.clearTimeout(this.numericTimer2);
                                this.numericTimer2 = TimerMixin.setTimeout(
                                    () => {
                                        this.setState({
                                            numeric_number: '',
                                            numeric_color:
                                                'rgba(10, 10, 10, 0.83)',
                                            show_numeric: false,
                                        });
                                    },
                                    1500,
                                );
                            }
                        }
                    }, 2000);
                }
                return true;
            });
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
    starExitTimer() {
        TimerMixin.clearTimeout(this.exittimer);
        this.exittimer = TimerMixin.setTimeout(() => {
            this.setState({
                show_exit_app: false,
            });
        }, 2000);
    }
    getMetro() {
        var path = '';
        if (GLOBAL.Staging == true) {
            path =
                GLOBAL.IMS_Prefix_Staging +
                '/jsons/' +
                GLOBAL.CRM +
                '/' +
                GLOBAL.ProductID +
                '_metro_v2.json';
        } else {
            path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CRM +
                '/' +
                GLOBAL.ProductID +
                '_metro_v2.json';
        }
        DAL.getJson(path)
            .then(data => {
                GLOBAL.Metro = data;
                var movies = [];
                var series = [];
                var channels = [];
                var news = [];
                if (GLOBAL.Metro != undefined) {
                    if (GLOBAL.Metro.metromovieitems != undefined) {
                        movies = GLOBAL.Metro.metromovieitems;
                    }
                    if (GLOBAL.Metro.metroserieitems != undefined) {
                        series = GLOBAL.Metro.metroserieitems;
                    }
                    if (GLOBAL.Metro.metrortvitems != undefined) {
                        channels = GLOBAL.Metro.metrortvitems.sort(
                            (a, b) => a.channel_number - b.channel_number,
                        );
                    }
                    if (GLOBAL.Metro.metronewsitems != undefined) {
                        news = GLOBAL.Metro.metronewsitems;
                    }
                }
                this.setState({
                    movies: movies,
                    series: series,
                    channels: channels,
                    news: news,
                });
            })
            .catch(error => {});
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
                GLOBAL.EPG = data.channels;
                GLOBAL.EPG_TODAY = data.channels;
                GLOBAL.EPG_DATE_LOADED = date;
                if (GLOBAL.User.products.ChannelPackages.length > 0) {
                    this.getExtraEpg(0, 0);
                }
            })
            .catch(error => {});
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
                    // var check = GLOBAL.EPG.find(e => e.channel_name === element.channel_name);
                    // if(check == undefined){
                    GLOBAL.EPG = GLOBAL.EPG.concat(element);
                    GLOBAL.EPG_TODAY = GLOBAL.EPG_TODAY.concat(element);
                    //}
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
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        TimerMixin.clearTimeout(this.numericTimer);
        TimerMixin.clearInterval(this.clocktimer);
        TimerMixin.clearTimeout(this.exittimer);
        Actions.pop();
    }

    getNews() {
        if (this.state.news.length > 0) {
            var random = Math.floor(Math.random() * this.state.news.length);
            this.setState({
                newsimage: GLOBAL.ImageUrlCMS + this.state.news[random].image,
                newstext: this.state.news[random].description,
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
                            rightbanner: GLOBAL.ImageUrlCMS + ads.url,
                            ads2: ads,
                        });
                    }
                    REPORT.set({
                        key: 'ads-home-ads',
                        type: 33,
                        id: 12,
                    });
                    REPORT.endAction('ads-home-ads');
                })
                .catch(error => {});
        } else {
            var ads = GLOBAL.Home_Screen_Ads_Vertical;
            if (ads != null) {
                if (ads.url != null) {
                    this.setState({
                        rightbanner: GLOBAL.ImageUrlCMS + ads.url,
                        ads2: ads,
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
                        });
                    }
                    REPORT.set({
                        key: 'ads-home-ads',
                        type: 33,
                        id: 12,
                    });
                    REPORT.endAction('ads-home-ads');
                })
                .catch(error => {});
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
    openMovie(item, index) {
        Actions.Movies_Details({MovieIndex: item.id, fromPage: 'Home'});
    }
    _startSelectedChannel(item, index) {
        GLOBAL.Channel = UTILS.getChannel(item.channel_id);
        Actions.Player({fromPage: 'Home'});
    }
    openAd(index) {
        if (
            index == 1 &&
            GLOBAL.Home_Screen_Ads_Horizontal.campaignenabled == 1
        ) {
            Actions.Ads_Campaign({
                campaignbackdrop:
                    GLOBAL.Home_Screen_Ads_Horizontal.campaignbackdrop,
                campaignemail: GLOBAL.Home_Screen_Ads_Horizontal.campaignemail,
                campaignid: GLOBAL.Home_Screen_Ads_Horizontal.campaignid,
                campaignstream:
                    GLOBAL.Home_Screen_Ads_Horizontal.campaignstream,
                campaigntext: GLOBAL.Home_Screen_Ads_Horizontal.campaigntext,
            });
        }
        if (
            index == 0 &&
            GLOBAL.Home_Screen_Ads_Vertical.campaignenabled == 1
        ) {
            Actions.Ads_Campaign({
                campaignbackdrop: this.state.ads.campaignbackdrop,
                campaignemail: this.state.ads.campaignemail,
                campaignid: this.state.ads.campaignid,
                campaignstream: this.state.ads.campaignstream,
                campaigntext: this.state.ads.campaigntext,
            });
        }
    }
    onMovieRowLayout = event => {
        let width = event.nativeEvent.layout.width / 2;
        this.setState({movieRowWidth: width - 0});
    };

    onLeftBannerLayout = event => {
        let height = event.nativeEvent.layout.height;
        let width = event.nativeEvent.layout.width;
        var movie_width = this.state.movie_width - width / 2;
        var channel_width = this.state.channel_width - width / 2;
        this.setState({
            movie_width: movie_width,
            channel_width: channel_width,
            leftbannerwidth: width - 10,
            leftbannerheight: height - 10,
        });
    };
    onBottomBannerLayout = event => {
        let height = event.nativeEvent.layout.height;
        let width = event.nativeEvent.layout.width;
        this.setState({
            bottombannerheight: height - 10,
            bottombannerwidth: width - 10,
        });
    };
    onLayout = event => {
        if (this.state.progressWidth == 0) {
            let width = event.nativeEvent.layout.width - 10;
            this.setState({progressWidth: width});
        } else {
            let width = event.nativeEvent.layout.width - 10;
            if (width < this.state.progressWidth) {
                this.setState({progressWidth: width});
            }
        }
    };
    onChannelRowLayout = event => {
        let width =
            event.nativeEvent.layout.width / (GLOBAL.Device_IsPhone ? 1 : 1);
        this.setState({channelRowWidth: width});
    };
    render() {
        return (
            <Container>
                {RenderIf(this.state.show_exit_app)(
                    <Modal
                        Title={LANG.getTranslation('exit_app')}
                        Centered={true}
                        TextHeader={LANG.getTranslation('exit_app_click_again')}
                        TextMain={LANG.getTranslation('exit_app_close')}
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
                        <Text style={styles.player_number}>
                            {this.state.numeric_number}
                        </Text>
                    </View>,
                )}
                <View
                    style={{
                        flex: 5,
                        flexDirection: 'row',
                        marginLeft: 4,
                        marginTop: -2,
                    }}
                >
                    <View style={{flex: 5, flexDirection: 'column'}}>
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                bottom:
                                    GLOBAL.Device_IsPhone ||
                                    GLOBAL.Device_IsTablet
                                        ? 0
                                        : null,
                                marginLeft: -4,
                            }}
                        >
                            <Modal Type={'MessageHome'}> </Modal>
                        </View>
                        <View style={styles.content_container}>
                            {RenderIf(GLOBAL.Menu_Type == 'tv')(
                                <View
                                    style={{
                                        flex: 13,
                                        flexDirection: 'column',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        width: '100%',
                                    }}
                                >
                                    {RenderIf(!GLOBAL.Device_IsPhone)(
                                        <View
                                            style={{
                                                flex: 13,
                                                flexDirection: 'column',
                                                width: '100%',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'column',
                                                    width: '100%',
                                                }}
                                            >
                                                {RenderIf(
                                                    this.state.news[0] !=
                                                        undefined &&
                                                        GLOBAL.UserInterface
                                                            .home
                                                            .enable_news_section ==
                                                            true,
                                                )(
                                                    <View
                                                        style={{
                                                            borderRadius: 5,
                                                            flex: 1,
                                                            margin: 5,
                                                            marginTop: 7,
                                                            marginLeft: 4,
                                                            marginBottom: 1,
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.83)',
                                                            flexDirection:
                                                                'row',
                                                            borderRadius: 5,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flex: 2,
                                                                flexDirection:
                                                                    'column',
                                                            }}
                                                        >
                                                            <Image
                                                                style={[
                                                                    styles.img_news,
                                                                    {
                                                                        borderRadius: 5,
                                                                    },
                                                                ]}
                                                                resizeMode={
                                                                    'contain'
                                                                }
                                                                resizeMethod={
                                                                    'scale'
                                                                }
                                                                source={{
                                                                    uri: this
                                                                        .state
                                                                        .newsimage,
                                                                }}
                                                            ></Image>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flex: 14,
                                                                flexDirection:
                                                                    'column',
                                                                justifyContent:
                                                                    'center',
                                                                margin: 5,
                                                            }}
                                                        >
                                                            <Text
                                                                numberOfLines={
                                                                    2
                                                                }
                                                                style={
                                                                    styles.text_white_mini
                                                                }
                                                            >
                                                                {
                                                                    this.state
                                                                        .newstext
                                                                }
                                                            </Text>
                                                        </View>
                                                    </View>,
                                                )}
                                                <View
                                                    style={{
                                                        flex: 8,
                                                        flexDirection: 'column',
                                                        width: '100%',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            flexDirection:
                                                                'row',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flex: 6,
                                                                flexDirection:
                                                                    'column',
                                                                width: '100%',
                                                            }}
                                                        >
                                                            <View
                                                                style={{
                                                                    flex: 5,
                                                                    flexDirection:
                                                                        'row',
                                                                    width: '100%',
                                                                }}
                                                            >
                                                                <ChannelList
                                                                    FromPage={
                                                                        'Home'
                                                                    }
                                                                    Channels={
                                                                        this
                                                                            .state
                                                                            .channels
                                                                    }
                                                                    Width={
                                                                        this
                                                                            .state
                                                                            .channel_width
                                                                    }
                                                                    Type={'Big'}
                                                                    scrollType="channels"
                                                                    Columns={1}
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
                                                            {RenderIf(
                                                                !GLOBAL.Device_IsPhone &&
                                                                    this.state
                                                                        .bottombanner !=
                                                                        GLOBAL.HTTPvsHTTPS +
                                                                            '' &&
                                                                    this.state
                                                                        .bottombanner !=
                                                                        null &&
                                                                    GLOBAL
                                                                        .UserInterface
                                                                        .home
                                                                        .enable_ads ==
                                                                        true,
                                                            )(
                                                                <View
                                                                    onLayout={
                                                                        this
                                                                            .onBottomBannerLayout
                                                                    }
                                                                    style={{
                                                                        flex: 2,
                                                                        marginLeft: 6,
                                                                        marginTop: 5,
                                                                        marginRight: 5,
                                                                        backgroundColor:
                                                                            'rgba(0, 0, 0, 0.83)',
                                                                        flexDirection:
                                                                            'row',
                                                                        borderRadius: 5,
                                                                    }}
                                                                >
                                                                    <TouchableHighlightFocus
                                                                        BorderRadius={
                                                                            5
                                                                        }
                                                                        style={
                                                                            styles.button_highlight
                                                                        }
                                                                        underlayColor={
                                                                            GLOBAL.Button_Color
                                                                        }
                                                                        onPress={() =>
                                                                            this.openAd(
                                                                                1,
                                                                            )
                                                                        }
                                                                    >
                                                                        <View>
                                                                            <Image
                                                                                style={{
                                                                                    height: this
                                                                                        .state
                                                                                        .bottombannerheight,
                                                                                    width: this
                                                                                        .state
                                                                                        .bottombannerwidth,
                                                                                }}
                                                                                resizeMethod={
                                                                                    'resize'
                                                                                }
                                                                                resizeMode={
                                                                                    'stretch'
                                                                                }
                                                                                source={{
                                                                                    uri: this
                                                                                        .state
                                                                                        .bottombanner,
                                                                                }}
                                                                            ></Image>
                                                                        </View>
                                                                    </TouchableHighlightFocus>
                                                                </View>,
                                                            )}
                                                        </View>
                                                        {RenderIf(
                                                            !GLOBAL.Device_IsPhone &&
                                                                this.state
                                                                    .rightbanner !=
                                                                    GLOBAL.HTTPvsHTTPS +
                                                                        '' &&
                                                                this.state
                                                                    .rightbanner !=
                                                                    null &&
                                                                GLOBAL
                                                                    .UserInterface
                                                                    .home
                                                                    .enable_ads ==
                                                                    true,
                                                        )(
                                                            <View
                                                                style={{
                                                                    flex: 1,
                                                                    marginTop: 5,
                                                                    flexDirection:
                                                                        'column',
                                                                    backgroundColor:
                                                                        'rgba(0, 0, 0, 0.40)',
                                                                    borderRadius: 5,
                                                                }}
                                                                onLayout={
                                                                    this
                                                                        .onLeftBannerLayout
                                                                }
                                                            >
                                                                <TouchableHighlightFocus
                                                                    BorderRadius={
                                                                        5
                                                                    }
                                                                    style={
                                                                        styles.button_highlight
                                                                    }
                                                                    underlayColor={
                                                                        GLOBAL.Button_Color
                                                                    }
                                                                    onPress={() =>
                                                                        this.openAd(
                                                                            0,
                                                                        )
                                                                    }
                                                                >
                                                                    <View>
                                                                        <Image
                                                                            style={{
                                                                                height: this
                                                                                    .state
                                                                                    .leftbannerheight,
                                                                                width: this
                                                                                    .state
                                                                                    .leftbannerwidth,
                                                                            }}
                                                                            resizeMethod={
                                                                                'resize'
                                                                            }
                                                                            resizeMode={
                                                                                'stretch'
                                                                            }
                                                                            source={{
                                                                                uri: this
                                                                                    .state
                                                                                    .rightbanner,
                                                                            }}
                                                                        ></Image>
                                                                    </View>
                                                                </TouchableHighlightFocus>
                                                            </View>,
                                                        )}
                                                    </View>
                                                </View>
                                            </View>
                                        </View>,
                                    )}
                                </View>,
                            )}
                            {RenderIf(
                                GLOBAL.Menu_Type == 'full' &&
                                    !GLOBAL.Device_IsPhone,
                            )(
                                <View style={{flex: 12, flexDirection: 'row'}}>
                                    <View
                                        style={{
                                            flex: 10,
                                            flexDirection: 'column',
                                            paddingRight: 3,
                                            paddingTop: 2,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 3,
                                                flexDirection: 'row',
                                                paddingRight: 3,
                                                paddingBottom: 4,
                                            }}
                                        >
                                            {RenderIf(
                                                this.state.movies.length > 0,
                                            )(
                                                <View
                                                    style={{
                                                        flex: 4,
                                                        flexDirection: 'column',
                                                    }}
                                                >
                                                    <MovieList
                                                        FromPage={'Home'}
                                                        Movies={
                                                            this.state.movies
                                                        }
                                                        Type={'Movies'}
                                                        Width={
                                                            this.state
                                                                .movie_width
                                                        }
                                                        Columns={
                                                            this.state
                                                                .movie_columns
                                                        }
                                                        getItemLayout={(
                                                            data,
                                                            index,
                                                        ) => {
                                                            return {
                                                                length: this
                                                                    .state
                                                                    .movieRowWidth,
                                                                index,
                                                                offset:
                                                                    this.state
                                                                        .movieRowWidth *
                                                                    index,
                                                            };
                                                        }}
                                                        onPress={(
                                                            movie,
                                                            index,
                                                        ) =>
                                                            this.openMovie(
                                                                movie,
                                                                index,
                                                            )
                                                        }
                                                    />
                                                </View>,
                                            )}
                                            <View style={{flex: 4}}>
                                                {RenderIf(
                                                    this.state.news[0] !=
                                                        undefined &&
                                                        GLOBAL.UserInterface
                                                            .home
                                                            .enable_news_section ==
                                                            true,
                                                )(
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            borderRadius: 5,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                backgroundColor:
                                                                    'rgba(0, 0, 0, 0.40)',
                                                                flexDirection:
                                                                    'row',
                                                                marginLeft: 4,
                                                                marginRight: 4,
                                                                marginBottom: 5,
                                                                marginTop: 3,
                                                                borderRadius: 5,
                                                            }}
                                                        >
                                                            <View
                                                                style={{
                                                                    flexDirection:
                                                                        'column',
                                                                    justifyContent:
                                                                        'center',
                                                                    backgroundColor:
                                                                        'rgba(0, 0, 0, 0.20)',
                                                                }}
                                                            >
                                                                <Image
                                                                    style={[
                                                                        {
                                                                            width: 100,
                                                                            height: 45,
                                                                            margin: 10,
                                                                        },
                                                                    ]}
                                                                    resizeMode={
                                                                        'cover'
                                                                    }
                                                                    resizeMethod={
                                                                        'scale'
                                                                    }
                                                                    source={{
                                                                        uri: this
                                                                            .state
                                                                            .newsimage,
                                                                    }}
                                                                ></Image>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    flex: 1,
                                                                    flexDirection:
                                                                        'column',
                                                                    margin: 10,
                                                                    paddingBottom: 0,
                                                                }}
                                                            >
                                                                <Text
                                                                    numberOfLines={
                                                                        3
                                                                    }
                                                                    style={
                                                                        styles.News
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
                                                    </View>,
                                                )}
                                                <View style={{flex: 1}}>
                                                    <ChannelList
                                                        FromPage={'Home'}
                                                        Channels={
                                                            this.state.channels
                                                        }
                                                        Width={
                                                            this.state
                                                                .channel_width
                                                        }
                                                        Type={'Big'}
                                                        scrollType="channels"
                                                        Columns={1}
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
                                            </View>
                                        </View>
                                        {RenderIf(
                                            !GLOBAL.Device_IsPhone &&
                                                this.state.bottombanner !=
                                                    GLOBAL.HTTPvsHTTPS + '' &&
                                                this.state.bottombanner !=
                                                    null &&
                                                GLOBAL.UserInterface.home
                                                    .enable_ads == true,
                                        )(
                                            <View
                                                onLayout={
                                                    this.onBottomBannerLayout
                                                }
                                                style={{
                                                    flex: 1,
                                                    marginLeft: 3,
                                                    marginTop: 5,
                                                    marginRight: 5,
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.40)',
                                                    flexDirection: 'row',
                                                    borderTopRightRadius: 5,
                                                    borderTopLeftRadius: 5,
                                                }}
                                            >
                                                <TouchableHighlightFocus
                                                    BorderRadius={5}
                                                    style={
                                                        styles.button_highlight
                                                    }
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this.openAd(1)
                                                    }
                                                >
                                                    <View>
                                                        <ScaledImage
                                                            uri={
                                                                this.state
                                                                    .bottombanner
                                                            }
                                                            height={
                                                                GLOBAL.Device_IsAppleTV
                                                                    ? 220
                                                                    : GLOBAL.Device_IsWebTV
                                                                    ? GLOBAL.Device_Height /
                                                                      5
                                                                    : 110
                                                            }
                                                        />
                                                    </View>
                                                </TouchableHighlightFocus>
                                            </View>,
                                        )}
                                    </View>

                                    {RenderIf(
                                        !GLOBAL.Device_IsPhone &&
                                            this.state.rightbanner !=
                                                GLOBAL.HTTPvsHTTPS + '' &&
                                            this.state.rightbanner != null &&
                                            GLOBAL.UserInterface.home
                                                .enable_ads == true,
                                    )(
                                        <View
                                            style={{
                                                flex: 2,
                                                flexDirection: 'column',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.40)',
                                                marginTop: 5,
                                                borderTopLeftRadius: 5,
                                            }}
                                            onLayout={this.onLeftBannerLayout}
                                        >
                                            <TouchableHighlightFocus
                                                BorderRadius={5}
                                                style={styles.button_highlight}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                onPress={() => this.openAd(0)}
                                            >
                                                <View>
                                                    <ScaledImage
                                                        uri={
                                                            this.state
                                                                .rightbanner
                                                        }
                                                        width={
                                                            GLOBAL.Device_IsAppleTV
                                                                ? 240
                                                                : GLOBAL.Device_IsWebTV
                                                                ? GLOBAL.Device_Width /
                                                                  8
                                                                : 120
                                                        }
                                                    />
                                                </View>
                                            </TouchableHighlightFocus>
                                        </View>,
                                    )}
                                </View>,
                            )}
                        </View>
                    </View>
                </View>
            </Container>
        );
    }
}
