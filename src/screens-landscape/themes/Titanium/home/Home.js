import React, { Component } from 'react';
import {
    Text,
    BackHandler,
    TVMenuControl,
    Image,
    View,
    Dimensions,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import HEADER from '../header/Header';
import StarRating from 'react-native-star-rating';
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        GLOBAL.PIN_SET = false;
        GLOBAL.Focus = 'Home';
        GLOBAL.IsHomeLoaded = true;

        if (GLOBAL.Metro != undefined) {
            if (GLOBAL.Metro.metromovieitems != undefined) {
                movies = GLOBAL.Metro.metromovieitems;
                if (movies.length > 0) {
                    var random = Math.floor(Math.random() * movies.length);
                    hero_index = random;
                    var movie = movies[random];
                    hero_movie = movie;
                }
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

        GLOBAL.EPG_Search_Channels = [];
        GLOBAL.EPG_Search_EPG = [];

        var channels_width = 0;
        var app_width = 0;
        var movie_width = 0;
        var series_width = 0;
        if (GLOBAL.App_Theme == 'Akua') {
            channels_width = GLOBAL.COL_10 * 3.33;
            movie_width = GLOBAL.Device_IsPhone
                ? GLOBAL.COL_2
                : GLOBAL.Device_IsWebTV
                    ? GLOBAL.COL_6
                    : GLOBAL.COL_5;
            series_width = GLOBAL.Device_IsWebTV ? GLOBAL.COL_4 : GLOBAL.COL_3;
            app_width = GLOBAL.COL_8;
        }
        this.state = {
            reportStartTime: moment().unix(),
            app_width: app_width,
            series_width: series_width,
            hero_index: hero_index,
            movies: movies,
            series: series,
            channels: channels,
            channels_width: channels_width,
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
            ads2: [],
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
            movie_width: movie_width,

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
        };

        this.focusChannel = this.focusChannel.bind(this);
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
                //if (GLOBAL.Hamburger == true) { return }
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
        if (
            GLOBAL.UserInterface.home.enable_ads == true &&
            GLOBAL.Device_IsSmartTV == false &&
            GLOBAL.Ads_Enabled == true
        ) {
            this.getAdsHorizontal();
            this.getAdsVertical();
        }
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
                        var channel = GLOBAL.Channels_Selected.find(
                            x => x.channel_number == channelNumber,
                        );
                        if (channel != undefined) {
                            var index = UTILS.getChannelIndex(
                                channel.channel_id,
                            );
                            GLOBAL.Channels_Selected_Index = index;
                            (GLOBAL.Channel = UTILS.getChannel(
                                channel.channel_id,
                            )),
                                Actions.Player({ fromPage: 'Home' });
                        } else {
                            this.setState({
                                numeric_color: 'rgba(777, 11, 10, 0.83)',
                            });
                            TimerMixin.clearTimeout(this.numericTimer2);
                            this.numericTimer2 = TimerMixin.setTimeout(() => {
                                this.setState({
                                    numeric_number: '',
                                    numeric_color: 'rgba(10, 10, 10, 0.83)',
                                    show_numeric: false,
                                });
                            }, 1500);
                        }
                    }, 2000);
                }
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
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
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
                            ads2: ads,
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
    _startSelectedChannel(item, index, favorite) {
        if (favorite == true) {
            var category = GLOBAL.Channels.find(x => x.id == 0);
            if (category != undefined) {
                if (category.channels.length > 0) {
                    GLOBAL.Channel = UTILS.getChannelFavorite(item.channel_id);
                    if (GLOBAL.Channel != null) {
                        GLOBAL.Channels_Selected = category.channels;
                        GLOBAL.Channels_Selected_Category_ID = category.id;
                        var index = UTILS.getChannelIndex(item.channel_id);
                        GLOBAL.Channels_Selected_Index = index;
                        GLOBAL.Channels_Selected_Category_Index =
                            UTILS.getCategoryIndex(
                                GLOBAL.Channels_Selected_Category_ID,
                            );
                        Actions.Player({ fromPage: 'Home' });
                    }
                }
            }
        } else {
            var category = GLOBAL.Channels[0];
            if (category != undefined) {
                if (category.channels.length > 0) {
                    GLOBAL.Channels_Selected = category.channels;
                    GLOBAL.Channels_Selected_Category_ID = category.id;
                    //UTILS.getChannelSelected(item.channel_id);
                    var index = UTILS.getChannelIndex(item.channel_id);
                    GLOBAL.Channels_Selected_Index = index;
                    GLOBAL.Channel = UTILS.getChannel(item.channel_id);
                    GLOBAL.Channels_Selected_Category_Index =
                        UTILS.getCategoryIndex(
                            GLOBAL.Channels_Selected_Category_ID,
                        );
                    Actions.Player({ fromPage: 'Home' });
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
        if (this.state.ads2.campaignenabled == 1) {
            Actions.Ads_Campaign({
                campaignbackdrop: this.state.ads2.campaignbackdrop,
                campaignemail: this.state.ads2.campaignemail,
                campaignid: this.state.ads2.campaignid,
                campaignstream: this.state.ads2.campaignstream,
                campaigntext: this.state.ads2.campaigntext,
            });
        }
    }

    _renderApps(item, index) {
        return (
            <TouchableHighlightFocus
                key={index}
                onFocus={() => this.focusApp(item)}
                hasTVPreferredFocus={
                    GLOBAL.Selected_ID_Player == item.channel_id
                        ? true
                        : this.state.show_channel_search && index == 0
                            ? true
                            : false
                }
                style={[styles.button_highlight]}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._openSelectedApp(item, index)}
            >
                <View style={{ flex: 1, backgroundColor: '#111', padding: 5 }}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <View
                            style={{
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                backgroundColor: '#111',
                            }}
                        >
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.icon }}
                                style={{ height: 90, width: 90, margin: 10 }}
                            />
                        </View>
                        <Text
                            numberOfLines={1}
                            style={[styles.H4, { padding: 5, width: 90 }]}
                        >
                            {item.name}
                        </Text>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
    getSubText(series) {
        return series.name + ' / ' + series.episodes.length + ' Episodes';
    }
    focusSeries(series) {
        if (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) {
            return;
        }
        TimerMixin.clearTimeout(this.focusTimer);
        this.focusTimer = TimerMixin.setTimeout(() => {
            this.setState({
                backdrop: GLOBAL.ImageUrlCMS + series.backdrop,
            });
        }, 500);
    }
    focusMovies(movie) {
        if (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) {
            return;
        }
        TimerMixin.clearTimeout(this.focusTimer);
        this.focusTimer = TimerMixin.setTimeout(() => {
            this.setState({
                backdrop: GLOBAL.ImageUrlCMS + movie.backdrop,
            });
        }, 500);
    }
    focusChannel(channel) {
        if (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) {
            return;
        }
        TimerMixin.clearTimeout(this.focusTimer);
        this.focusTimer = TimerMixin.setTimeout(() => {
            this.setState({
                backdrop: GLOBAL.ImageUrlCMS + channel.channel_image,
            });
        }, 500);
    }
    focusApp(app) {
        if (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) {
            return;
        }
        TimerMixin.clearTimeout(this.focusTimer);
        this.focusTimer = TimerMixin.setTimeout(() => {
            this.setState({
                backdrop: GLOBAL.ImageUrlCMS + app.icon,
            });
        }, 500);
    }
    focusChannelFavorite(channel) {
        if (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) {
            return;
        }
        TimerMixin.clearTimeout(this.focusTimer);
        this.focusTimer = TimerMixin.setTimeout(() => {
            this.setState({
                backdrop: GLOBAL.ImageUrlCMS + channel.icon_big,
            });
        }, 500);
    }
    focusClear(index) {
        if (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) {
            return;
        }
        TimerMixin.clearTimeout(this.focusTimer);
        this.focusTimer = TimerMixin.setTimeout(() => {
            this.setState({
                backdrop: GLOBAL.ImageUrlCMS + '',
            });
        }, 500);
    }

    openMovie(movie) {
        Actions.Movies_Details({ MovieIndex: movie.id, fromPage: 'Home' });
    }
    openSeries(series) {
        Actions.Series_Details({ season_name: series.id, fromPage: 'Home' });
    }
    render() {
        return (
            <Container>
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 99999,
                            bottom:
                                GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                                    ? 0
                                    : null,
                        }}
                    >
                        <Modal Type={'MessageHome'}> </Modal>
                    </View>

                    {RenderIf(this.state.show_exit_app)(
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

                    <ScrollView style={{ flex: 1, flexDirection: 'column' }}>
                        <View style={{ flex: 1, flexDirection: 'column' }}>
                            {RenderIf(
                                this.state.hero_movie != '' &&
                                this.state.hero_movie != undefined &&
                                GLOBAL.UserInterface.home
                                    .enable_hero_images == true,
                            )(
                                <View
                                    style={{
                                        borderBottomWidth: 4,
                                        borderBottomColor: '#111',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <ImageBackground
                                        style={{
                                            width: GLOBAL.Device_Width,
                                            height: GLOBAL.Device_Height / 1.8,
                                        }}
                                        resizeMode={'cover'}
                                        resizeMethod={'resize'}
                                        source={{
                                            uri:
                                                GLOBAL.ImageUrlCMS +
                                                this.state.hero_movie.backdrop,
                                        }}
                                    >
                                        <ImageBackground
                                            style={{
                                                width: GLOBAL.Device_Width,
                                                height:
                                                    GLOBAL.Device_Height / 1.8,
                                            }}
                                            resizeMode={'stretch'}
                                            resizeMethod={'scale'}
                                            source={require('../../../../images/hero_bg.png')}
                                        >
                                            <HEADER></HEADER>
                                            <View
                                                style={{
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    height:
                                                        GLOBAL.Device_Height /
                                                        1.8,
                                                    paddingLeft: 80,
                                                    paddingTop: 40,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
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
                                                            alignSelf: 'center',
                                                        }}
                                                    >
                                                        <StarRating
                                                            starStyle={{
                                                                margin: 2,
                                                            }}
                                                            fullStarColor={
                                                                '#fec205'
                                                            }
                                                            disabled={true}
                                                            maxStars={5}
                                                            rating={Number(
                                                                this.state
                                                                    .hero_movie
                                                                    .rating,
                                                            )}
                                                            value={0}
                                                            starSize={20}
                                                        />
                                                    </View>
                                                    <View
                                                        style={{
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                            alignSelf: 'center',
                                                        }}
                                                    >
                                                        <FontAwesome5
                                                            style={[
                                                                styles.IconsIMDB,
                                                            ]}
                                                            // icon={
                                                            //     BrandIcons.imdb
                                                            // }
                                                            name="imdb"
                                                        />
                                                    </View>
                                                </View>
                                                {this.state.hero_movie.logo ==
                                                    undefined && (
                                                        <Text
                                                            style={[
                                                                styles.H1,
                                                                styles.Shadow,
                                                            ]}
                                                        >
                                                            {
                                                                this.state
                                                                    .hero_movie.name
                                                            }
                                                        </Text>
                                                    )}
                                                {this.state.hero_movie.logo !=
                                                    undefined && (
                                                        <ScaledImage
                                                            uri={
                                                                GLOBAL.ImageUrlCMS +
                                                                this.state
                                                                    .hero_movie.logo
                                                            }
                                                            width={GLOBAL.COL_4}
                                                        />
                                                    )}
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        paddingTop: 5,
                                                        marginLeft: -2,
                                                    }}
                                                >
                                                    <Markers
                                                        Big
                                                        Icon={
                                                            "play-circle"
                                                            // SolidIcons.playCircle
                                                        }
                                                        Text={LANG.getTranslation(
                                                            'play_movie',
                                                        )}
                                                        Color={'royalblue'}
                                                        hasTVPreferredFocus={
                                                            true
                                                        }
                                                        onPress={() =>
                                                            Actions.Movies_Details(
                                                                {
                                                                    MovieIndex:
                                                                        this
                                                                            .state
                                                                            .hero_movie
                                                                            .id,
                                                                    fromPage:
                                                                        'Home',
                                                                },
                                                            )
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        </ImageBackground>
                                    </ImageBackground>
                                </View>,
                            )}
                            <LinearGradient
                                colors={[
                                    'rgba(0, 0, 0, 0.40)',
                                    'rgba(0, 0, 0, 0.0)',
                                ]}
                                style={{
                                    flex: 1,
                                    width: GLOBAL.COL_1,
                                    height: '100%',
                                }}
                                start={{ x: 0.5, y: 0 }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        paddingBottom: 20,
                                    }}
                                >
                                    {RenderIf(
                                        this.state.leftbanner !=
                                        GLOBAL.HTTPvsHTTPS + '' &&
                                        GLOBAL.UserInterface.home
                                            .enable_ads == true,
                                    )(
                                        <View
                                            style={{
                                                flexDirection: 'column',
                                                paddingTop: 20,
                                                paddingLeft: 20,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    paddingBottom: 5,
                                                }}
                                            >
                                                <Markers
                                                    Color={'darkslateblue'}
                                                    Text={LANG.getTranslation(
                                                        'information',
                                                    )}
                                                />
                                            </View>
                                            <View
                                                style={{
                                                    width:
                                                        GLOBAL.Device_IsAndroidTV ||
                                                            GLOBAL.Device_IsFireTV
                                                            ? 120
                                                            : GLOBAL.Device_IsAppleTV
                                                                ? 250
                                                                : 180,
                                                    flexDirection: 'column',
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.33)',
                                                    alignSelf: 'center',
                                                    borderRadius: 5,
                                                }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <TouchableHighlightFocus
                                                        BorderRadius={5}
                                                        onFocus={() =>
                                                            this.focusClear()
                                                        }
                                                        style={{
                                                            borderRadius: 5,
                                                            justifyContent:
                                                                'center',
                                                            alignContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this.openAdVertical()
                                                        }
                                                    >
                                                        <Image
                                                            style={[
                                                                {
                                                                    borderRadius: 2,
                                                                    width:
                                                                        GLOBAL.Device_IsAndroidTV ||
                                                                            GLOBAL.Device_IsFireTV
                                                                            ? 120
                                                                            : GLOBAL.Device_IsAppleTV
                                                                                ? 240
                                                                                : 160,
                                                                    height:
                                                                        GLOBAL.Device_IsAndroidTV ||
                                                                            GLOBAL.Device_IsFireTV
                                                                            ? 420
                                                                            : GLOBAL.Device_IsAppleTV
                                                                                ? 870
                                                                                : 580,
                                                                },
                                                            ]}
                                                            resizeMethod={
                                                                'scale'
                                                            }
                                                            resizeMode={
                                                                'contain'
                                                            }
                                                            source={{
                                                                uri: this.state
                                                                    .leftbanner,
                                                            }}
                                                        ></Image>
                                                    </TouchableHighlightFocus>
                                                </View>
                                            </View>
                                        </View>,
                                    )}
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'column',
                                            paddingTop: 20,
                                            paddingLeft: 20,
                                        }}
                                    >
                                        {RenderIf(
                                            this.state.favorites.length > 0,
                                        )(
                                            <View>
                                                <Text
                                                    style={[
                                                        styles.H2,
                                                        styles.Shadow,
                                                        { paddingLeft: 15 },
                                                    ]}
                                                >
                                                    {LANG.getTranslation(
                                                        'favoritechannels',
                                                    )}
                                                    {RenderIf(
                                                        GLOBAL.Device_IsSmartTV ==
                                                        false,
                                                    )(
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
                                                                    .favorites
                                                                    .length
                                                            }
                                                            )
                                                        </Text>,
                                                    )}
                                                </Text>
                                                <View
                                                    style={{
                                                        paddingLeft: 15,
                                                        paddingTop: 15,
                                                        paddingBottom: 15,
                                                    }}
                                                >
                                                    <ChannelList
                                                        FromPage={'Home'}
                                                        focusChannel={
                                                            this.focusChannel
                                                        }
                                                        onPress={(
                                                            item,
                                                            index,
                                                        ) =>
                                                            this._startSelectedChannel(
                                                                item,
                                                                index,
                                                                true,
                                                            )
                                                        }
                                                        Channels={
                                                            this.state.favorites
                                                        }
                                                        Width={GLOBAL.COL_10}
                                                        Type={'Round'}
                                                        scrollType="channels"
                                                        ColumnType={
                                                            this.state
                                                                .channelType
                                                        }
                                                        Columns={
                                                            this.state.columns_
                                                        }
                                                        horizontal={true}
                                                        getItemLayout={(
                                                            data,
                                                            index,
                                                        ) => {
                                                            return {
                                                                length: GLOBAL.COL_10,
                                                                index,
                                                                offset:
                                                                    GLOBAL.COL_10 *
                                                                    index,
                                                            };
                                                        }}
                                                    />
                                                </View>
                                            </View>,
                                        )}
                                        {RenderIf(
                                            this.state.newstext != '' &&
                                            GLOBAL.UserInterface.home
                                                .enable_news_section ==
                                            true,
                                        )(
                                            <View>
                                                <Text
                                                    style={[
                                                        styles.H2,
                                                        styles.Shadow,
                                                        { paddingLeft: 15 },
                                                    ]}
                                                >
                                                    {LANG.getTranslation(
                                                        'newsinformation',
                                                    )}
                                                </Text>
                                                <View
                                                    style={{
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.40)',
                                                        flexDirection: 'column',
                                                        padding: 10,
                                                        width:
                                                            GLOBAL.Device_Width -
                                                            GLOBAL.Device_Width /
                                                            4,
                                                        margin: 20,
                                                        borderRadius: 5,
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            padding: 5,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'row',
                                                            }}
                                                        >
                                                            {RenderIf(
                                                                this.state.news
                                                                    .length > 1,
                                                            )(
                                                                <ButtonCircle
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
                                                                    Size={20}
                                                                    onPress={() =>
                                                                        this.onNews(
                                                                            -1,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>,
                                                            )}
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
                                                            {RenderIf(
                                                                this.state.news
                                                                    .length > 1,
                                                            )(
                                                                <ButtonCircle
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
                                                                    Size={20}
                                                                    onPress={() =>
                                                                        this.onNews(
                                                                            1,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>,
                                                            )}
                                                        </View>
                                                    </View>

                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.40)',
                                                            borderRadius: 2,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                backgroundColor:
                                                                    'rgba(0, 0, 0, 0.60)',
                                                                padding: 10,
                                                                borderRadius: 2,
                                                            }}
                                                        >
                                                            <Image
                                                                style={{
                                                                    borderRadius: 2,
                                                                    width:
                                                                        GLOBAL.Device_IsWebTV ||
                                                                            GLOBAL.Device_IsAppleTV
                                                                            ? 200
                                                                            : 100,
                                                                    height:
                                                                        GLOBAL.Device_IsWebTV ||
                                                                            GLOBAL.Device_IsAppleTV
                                                                            ? 150
                                                                            : 75,
                                                                }}
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
                                                                padding: 10,
                                                                flex: 1,
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
                                                                        flexDirection:
                                                                            'row',
                                                                        marginLeft:
                                                                            -5,
                                                                        marginBottom: 5,
                                                                    }}
                                                                >
                                                                    <Markers
                                                                        Color={
                                                                            'crimson'
                                                                        }
                                                                        Text={
                                                                            this
                                                                                .state
                                                                                .newsdate
                                                                        }
                                                                    />
                                                                </View>
                                                            </View>
                                                            <Text
                                                                numberOfLines={
                                                                    3
                                                                }
                                                                style={
                                                                    styles.Standard
                                                                }
                                                            >
                                                                {
                                                                    this.state
                                                                        .newstext
                                                                }
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>,
                                        )}
                                        {RenderIf(this.state.series.length > 0)(
                                            <View>
                                                <Text
                                                    style={[
                                                        styles.H2,
                                                        styles.Shadow,
                                                        { paddingLeft: 15 },
                                                    ]}
                                                >
                                                    {LANG.getTranslation(
                                                        'trendingseries',
                                                    )}
                                                    {RenderIf(
                                                        GLOBAL.Device_IsSmartTV ==
                                                        false,
                                                    )(
                                                        <Text
                                                            style={[
                                                                styles.Standard,
                                                                styles.Shadow,
                                                                {
                                                                    paddingTop: 15,
                                                                },
                                                            ]}
                                                        >
                                                            {' '}
                                                            (
                                                            {
                                                                this.state
                                                                    .series
                                                                    .length
                                                            }
                                                            )
                                                        </Text>,
                                                    )}
                                                </Text>
                                                <View
                                                    style={{
                                                        paddingLeft: 15,
                                                        paddingTop: 15,
                                                        paddingBottom: 15,
                                                    }}
                                                >
                                                    <SeriesList
                                                        FromPage={'Home'}
                                                        Series={
                                                            this.state.series
                                                        }
                                                        Type={'Series'}
                                                        Width={
                                                            this.state
                                                                .series_width
                                                        }
                                                        horizontal={true}
                                                        getItemLayout={(
                                                            data,
                                                            index,
                                                        ) => {
                                                            return {
                                                                length: this
                                                                    .state
                                                                    .series_width,
                                                                index,
                                                                offset:
                                                                    this.state
                                                                        .series_width *
                                                                    index,
                                                            };
                                                        }}
                                                        onPress={series =>
                                                            this.openSeries(
                                                                series,
                                                            )
                                                        }
                                                    />
                                                </View>
                                            </View>,
                                        )}
                                        {RenderIf(this.state.movies.length > 0)(
                                            <View>
                                                <Text
                                                    style={[
                                                        styles.H2,
                                                        styles.Shadow,
                                                        { paddingLeft: 15 },
                                                    ]}
                                                >
                                                    {LANG.getTranslation(
                                                        'lastestmovies',
                                                    )}
                                                    {RenderIf(
                                                        GLOBAL.Device_IsSmartTV ==
                                                        false,
                                                    )(
                                                        <Text
                                                            style={[
                                                                styles.Standard,
                                                                styles.Shadow,
                                                                { marginTop: 15 },
                                                            ]}
                                                        >
                                                            {' '}
                                                            (
                                                            {
                                                                this.state
                                                                    .movies
                                                                    .length
                                                            }
                                                            )
                                                        </Text>,
                                                    )}
                                                </Text>
                                                <View
                                                    style={{
                                                        paddingLeft: 15,
                                                        paddingTop: 15,
                                                        paddingBottom: 15,
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
                                                        horizontal={true}
                                                        getItemLayout={(
                                                            data,
                                                            index,
                                                        ) => {
                                                            return {
                                                                length: this
                                                                    .state
                                                                    .movies_width,
                                                                index,
                                                                offset:
                                                                    this.state
                                                                        .movies_width *
                                                                    index,
                                                            };
                                                        }}
                                                        onPress={movie =>
                                                            this.openMovie(
                                                                movie,
                                                            )
                                                        }
                                                    />
                                                </View>
                                            </View>,
                                        )}
                                        {RenderIf(
                                            this.state.bottombanner !=
                                            GLOBAL.HTTPvsHTTPS + '' &&
                                            GLOBAL.UserInterface.home
                                                .enable_ads == true,
                                        )(
                                            <View
                                                style={{
                                                    paddingLeft: 15,
                                                    paddingTop: 15,
                                                    paddingBottom: 15,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        paddingBottom: 10,
                                                    }}
                                                >
                                                    <Markers
                                                        Color={'darkslateblue'}
                                                        Text={LANG.getTranslation(
                                                            'information',
                                                        )}
                                                    />
                                                </View>
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        borderRadius: 5,
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.20)',
                                                        padding: 5,
                                                        width: GLOBAL.Device_IsAppleTV
                                                            ? 1005
                                                            : 473,
                                                        justifyContent:
                                                            'center',
                                                    }}
                                                >
                                                    <TouchableHighlightFocus
                                                        BorderRadius={5}
                                                        onFocus={() =>
                                                            this.focusClear()
                                                        }
                                                        style={{
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        onPress={() =>
                                                            this.openAdHorizontal()
                                                        }
                                                    >
                                                        <Image
                                                            style={[
                                                                {
                                                                    borderRadius: 2,
                                                                    width: GLOBAL.Device_IsAppleTV
                                                                        ? 985
                                                                        : 455,
                                                                    height: GLOBAL.Device_IsAppleTV
                                                                        ? 260
                                                                        : 120,
                                                                },
                                                            ]}
                                                            resizeMethod={
                                                                'scale'
                                                            }
                                                            resizeMode={
                                                                'contain'
                                                            }
                                                            source={{
                                                                uri: this.state
                                                                    .bottombanner,
                                                            }}
                                                        ></Image>
                                                    </TouchableHighlightFocus>
                                                </View>
                                            </View>,
                                        )}
                                        {RenderIf(
                                            this.state.channels.length > 0,
                                        )(
                                            <View style={{ paddingBottom: 15 }}>
                                                <Text
                                                    style={[
                                                        styles.H2,
                                                        styles.Shadow,
                                                        { paddingLeft: 15 },
                                                    ]}
                                                >
                                                    {LANG.getTranslation(
                                                        'recommendedchannels',
                                                    )}
                                                    {RenderIf(
                                                        GLOBAL.Device_IsSmartTV ==
                                                        false,
                                                    )(
                                                        <Text
                                                            style={[
                                                                styles.Standard,
                                                                styles.Shadow,
                                                                { marginTop: 15 },
                                                            ]}
                                                        >
                                                            {' '}
                                                            (
                                                            {
                                                                this.state
                                                                    .channels
                                                                    .length
                                                            }
                                                            )
                                                        </Text>,
                                                    )}
                                                </Text>
                                                <View
                                                    style={{
                                                        paddingLeft: 15,
                                                        paddingTop: 15,
                                                        paddingBottom: 15,
                                                        flex: 1,
                                                    }}
                                                >
                                                    <ChannelList
                                                        FromPage={'Home'}
                                                        focusChannel={
                                                            this.focusChannel
                                                        }
                                                        onPress={(
                                                            item,
                                                            index,
                                                        ) =>
                                                            this._startSelectedChannel(
                                                                item,
                                                                index,
                                                                false,
                                                            )
                                                        }
                                                        Channels={
                                                            this.state.channels
                                                        }
                                                        Width={
                                                            this.state
                                                                .channels_width
                                                        }
                                                        Type={'Big'}
                                                        scrollType="channels"
                                                        ShowPreview={true}
                                                        ColumnType={
                                                            this.state
                                                                .channelType
                                                        }
                                                        horizontal={true}
                                                        Columns={
                                                            this.state.columns_
                                                        }
                                                        getItemLayout={(
                                                            data,
                                                            index,
                                                        ) => {
                                                            return {
                                                                length: this
                                                                    .state
                                                                    .channels_width,
                                                                index,
                                                                offset:
                                                                    this.state
                                                                        .channels_width *
                                                                    index,
                                                            };
                                                        }}
                                                    />
                                                </View>
                                            </View>,
                                        )}
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    </ScrollView>
                </View>
            </Container>
        );
    }
}
