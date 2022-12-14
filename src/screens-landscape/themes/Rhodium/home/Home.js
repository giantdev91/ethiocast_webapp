import React, { Component, createRef, useRef, useState } from 'react';
import {
    Text,
    BackHandler,
    TVMenuControl,
    Image,
    View,
    Easing,
    ImageBackground,
    Animated,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';

import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import StarRating from 'react-native-star-rating';
// import {RegularIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import MovieDetails from '../../../components/UI/Home/MovieDetails';

let value = null;
let setValue = null;

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
                movie = movies[0];
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
        };
        this.animatedChannelValue = new Animated.Value(0);
        this.animatedSeriesValue = new Animated.Value(0);
        this.animatedMoviesValue = new Animated.Value(0);
        this.animatedAppValue = new Animated.Value(0);

        this.fadeChannelValue = new Animated.Value(0);
        this.fadeSeriesValue = new Animated.Value(0);
        this.fadeMoviesValue = new Animated.Value(0);
        this.fadeAppValue = new Animated.Value(0);

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
        if (GLOBAL.UserInterface.home.enable_ads == true) {
            this.getAdsHorizontal();
            this.getAdsVertical();
        }
        const date = moment().format('DD_MM_YYYY');
        if (GLOBAL.EPG_DATE_LOADED != date) {
            this.getEpgData();
        }
        // if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
        //     KeyEvent.onKeyDownListener((keyEvent) => {
        //         if (keyEvent.keyCode >= 7 && keyEvent.keyCode <= 16) {
        //             var newNumber = this.state.numeric_number + '' + (keyEvent.keyCode - 7)
        //             this.setState({
        //                 numeric_number: newNumber,
        //                 numeric_color: 'rgba(10, 10, 10, 0.83)',
        //                 show_numeric: true,
        //             })
        //             TimerMixin.clearTimeout(this.numericTimer);
        //             TimerMixin.clearTimeout(this.numericTimer2);
        //             this.numericTimer = TimerMixin.setTimeout(() => {
        //                 var channelNumber = this.state.numeric_number;
        //                 var channel = GLOBAL.Channels_Selected.find(x => x.channel_number == channelNumber);
        //                 if (channel != undefined) {
        //                     var index = UTILS.getChannelIndex(channel.channel_id)
        //                     GLOBAL.Channels_Selected_Index = index;
        //                     GLOBAL.Channel = UTILS.getChannel(channel.channel_id),
        //                         Actions.Player({ fromPage: 'Home' });
        //                 } else {
        //                     this.setState({
        //                         numeric_color: 'rgba(777, 11, 10, 0.83)',
        //                     })
        //                     TimerMixin.clearTimeout(this.numericTimer2);
        //                     this.numericTimer2 = TimerMixin.setTimeout(() => {
        //                         this.setState({
        //                             numeric_number: '',
        //                             numeric_color: 'rgba(10, 10, 10, 0.83)',
        //                             show_numeric: false,
        //                         })
        //                     }, 1500)
        //                 }
        //             }, 2000)
        //         }
        //     });
        //}
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
    _startSelectedChannel(item, index, favorite) {
        if (favorite != undefined) {
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
    getMovieCover = ({ item, index }) => {
        var getProgress = UTILS.getProfile('movie_progress', item.id);
        var getWatched = false;
        var position = '0';
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
        }
        if (position > 95) {
            getWatched = true;
        }
        if (getWatched == false) {
            if (getProgress == null) {
                return (
                    <TouchableHighlightFocus
                        hideUnderlay={true}
                        onFocus={() => this.focusMovies(item)}
                        onBlur={() => this.blurMovies()}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            Actions.Movies_Details({
                                MovieIndex: item.id,
                                fromPage: 'Home',
                            })
                        }
                    >
                        <View style={{ backgroundColor: '#000', padding: 5 }}>
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                                style={{
                                    height: GLOBAL.Device_IsAppleTV ? 300 : 225,
                                    width: GLOBAL.Device_IsAppleTV ? 200 : 150,
                                }}
                            />
                            {RenderIf(GLOBAL.Device_IsPhone == true)(
                                <View style={{ margin: 5 }}>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.H4,
                                            {
                                                paddingTop: 5,
                                                color: '#f2f2f2',
                                                width: GLOBAL.Device_IsAppleTV
                                                    ? 190
                                                    : 140,
                                            },
                                        ]}
                                    >
                                        {item.name}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.Standard,
                                            { color: '#666' },
                                        ]}
                                    >
                                        {item.year}
                                    </Text>
                                </View>,
                            )}
                        </View>
                    </TouchableHighlightFocus>
                );
            } else {
                return (
                    <TouchableHighlightFocus
                        hideUnderlay={true}
                        onFocus={() => this.focusMovies(item)}
                        onBlur={() => this.blurMovies()}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            Actions.Movies_Details({
                                MovieIndex: item.id,
                                fromPage: 'Home',
                            })
                        }
                    >
                        <View style={{ backgroundColor: '#000', padding: 5 }}>
                            <View>
                                <Image
                                    source={{
                                        uri: GLOBAL.ImageUrlCMS + item.poster,
                                    }}
                                    style={{
                                        height: GLOBAL.Device_IsAppleTV
                                            ? 300
                                            : 225,
                                        width: GLOBAL.Device_IsAppleTV
                                            ? 200
                                            : 150,
                                    }}
                                />
                            </View>
                            {RenderIf(GLOBAL.Device_IsPhone == true)(
                                <View>
                                    <View
                                        style={{
                                            borderTopColor: GLOBAL.Button_Color,
                                            borderTopWidth: 3,
                                            width: position * (180 / 100),
                                            marginTop: 0,
                                        }}
                                    ></View>
                                    <View style={{ margin: 5 }}>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.H4,
                                                {
                                                    paddingTop: 5,
                                                    color: '#f2f2f2',
                                                    width: GLOBAL.Device_IsAppleTV
                                                        ? 190
                                                        : 140,
                                                },
                                            ]}
                                        >
                                            {item.name}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.Standard,
                                                { color: '#666' },
                                            ]}
                                        >
                                            {item.year}
                                        </Text>
                                    </View>
                                </View>,
                            )}
                        </View>
                    </TouchableHighlightFocus>
                );
            }
        } else {
            return (
                <TouchableHighlightFocus
                    hideUnderlay={true}
                    onFocus={() => this.focusMovies(item)}
                    onBlur={() => this.blurMovies()}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() =>
                        Actions.Movies_Details({
                            MovieIndex: item.id,
                            fromPage: 'Home',
                        })
                    }
                >
                    <View style={{ backgroundColor: '#000', padding: 5 }}>
                        <View
                            style={{
                                position: 'absolute',
                                flex: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                zIndex: 999,
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            <FontAwesome5
                                style={styles.IconsMenuBig}
                                // icon={RegularIcons.checkCircle}
                                name="check-circle"
                            />
                        </View>

                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                            style={{
                                height: GLOBAL.Device_IsAppleTV ? 300 : 225,
                                width: GLOBAL.Device_IsAppleTV ? 200 : 150,
                            }}
                        />
                        {RenderIf(GLOBAL.Device_IsPhone == true)(
                            <View style={{ margin: 5 }}>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.H4,
                                        {
                                            paddingTop: 5,
                                            color: '#f2f2f2',
                                            width: GLOBAL.Device_IsAppleTV
                                                ? 190
                                                : 140,
                                        },
                                    ]}
                                >
                                    {item.name}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.Standard, { color: '#666' }]}
                                >
                                    {item.year}
                                </Text>
                            </View>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
        }
    };
    _renderApps(item, index) {
        return (
            <TouchableHighlightFocus
                hideUnderlay={true}
                key={index}
                onFocus={() => this.focusApp(item)}
                onBlur={() => this.blurApps()}
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
                <View style={{ flex: 1, backgroundColor: '#000', padding: 5 }}>
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
        // this.setState({
        //    backdrop: GLOBAL.ImageUrlCMS + series.backdrop,
        //     series_row_focussed:true
        // })
        //
        setValue([]);
        this.focusSerie();
    }

    // this.setState({
    //     //backdrop: GLOBAL.ImageUrlCMS + movie.backdrop,
    //     //movies_row_focussed: true
    //     movie: movie
    // })

    focusMovies(movie) {
        setValue(movie);
        this.focusMovie();
    }
    focusChannel(channel) {
        // this.setState({
        //  backdrop: GLOBAL.ImageUrlCMS + channel.channel_image,
        //     channel_row_focussed:true
        // })
        setValue([]);
        this.focusChannels();
    }
    focusApp(app) {
        // this.setState({
        //     backdrop: GLOBAL.ImageUrlCMS + app.icon,
        //     apps_row_focussed:true
        // })
        this.focusApps();
    }
    focusChannelFavorite(channel) {
        // this.setState({
        //     backdrop: GLOBAL.ImageUrlCMS + channel.icon_big,
        //     channel_row_focussed: true
        // })
        this.focusChannel();
    }
    // focusClear(index) {
    //     TimerMixin.clearTimeout(this.focusTimer);
    //     this.focusTimer = TimerMixin.setTimeout(() => {
    //         this.setState({
    //             backdrop: GLOBAL.ImageUrlCMS + ''
    //         })
    //     }, 500);
    //     //this.openAd(index)
    // }
    // openAd(index) {
    //     if (index == 0 && this.state.ads.campaignenabled == 1) {
    //         Actions.Ads_Campaign({ campaignbackdrop: this.state.ads.campaignbackdrop, campaignemail: this.state.ads.campaignemail, campaignid: this.state.ads.campaignid, campaignstream: this.state.ads.campaignstream, campaigntext: this.state.ads.campaigntext })
    //     }
    //     if (index == 1 && this.state.ads.campaignenabled2 == 1) {
    //         Actions.Ads_Campaign({ campaignbackdrop: this.state.ads.campaignbackdrop2, campaignemail: this.state.ads.campaignemail2, campaignid: this.state.ads.campaignid2, campaignstream: this.state.ads.campaignstream2, campaigntext: this.state.ads.campaigntext2 })
    //     }
    // }
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
    focusApp = () => {
        Animated.timing(this.animatedAppValue, {
            toValue: 1,
            duration: 300,
            //easing: Easing.ease
        }).start();
        Animated.timing(this.fadeAppValue, {
            toValue: 1,
            duration: 300,
            //easing: Easing.ease
        }).start();
    };
    blurApps = () => {
        Animated.timing(this.animatedAppValue, {
            toValue: 0,
            duration: 300,
            //easing: Easing.ease
        }).start();
        Animated.timing(this.fadeAppValue, {
            toValue: 0.6,
            duration: 300,
            //easing: Easing.ease
        }).start();
    };
    focusSerie = () => {
        Animated.timing(this.animatedSeriesValue, {
            toValue: 1,
            duration: 300,
            //easing: Easing.ease
        }).start();
        Animated.timing(this.fadeSeriesValue, {
            toValue: 1,
            duration: 300,
            //easing: Easing.ease
        }).start();
    };
    blurSeries = () => {
        Animated.timing(this.animatedSeriesValue, {
            toValue: 0,
            duration: 300,
            //easing: Easing.ease
        }).start();
        Animated.timing(this.fadeSeriesValue, {
            toValue: 0.6,
            duration: 300,
            //easing: Easing.ease
        }).start();
    };
    focusMovie = () => {
        Animated.timing(this.animatedMoviesValue, {
            toValue: 1,
            duration: 300,
            //easing: Easing.ease
        }).start();
        Animated.timing(this.fadeMoviesValue, {
            toValue: 1,
            duration: 300,
            //easing: Easing.ease
        }).start();
    };
    blurMovies = () => {
        Animated.timing(this.animatedMoviesValue, {
            toValue: 0,
            duration: 300,
            //easing: Easing.ease
        }).start();
        Animated.timing(this.fadeMoviesValue, {
            toValue: 0.6,
            duration: 300,
            //easing: Easing.ease
        }).start();
    };
    focusChannels = () => {
        Animated.timing(this.animatedChannelValue, {
            toValue: 1,
            duration: 300,
            //easing: Easing.ease
        }).start();
        Animated.timing(this.fadeChannelValue, {
            toValue: 1,
            duration: 300,
            //easing: Easing.ease
        }).start();
    };
    blurChannel = () => {
        Animated.timing(this.animatedChannelValue, {
            toValue: 0,
            duration: 300,
            //easing: Easing.ease
        }).start();
        Animated.timing(this.fadeChannelValue, {
            toValue: 0.6,
            duration: 300,
            //easing: Easing.ease
        }).start();
    };

    loadDetailsMovie = dataFromChild => {
        value = dataFromChild[0];
        setValue = dataFromChild[1];
    };

    render() {
        return (
            <Container>
                <ImageBackground
                    style={{ flex: 1, width: null, height: null }}
                    imageStyle={{ resizeMode: 'cover' }}
                    blurRadius={100}
                    source={{ uri: this.state.backdrop }}
                >
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
                    {RenderIf(GLOBAL.Device_IsPhone == true)(
                        <ScrollView>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                {RenderIf(
                                    this.state.hero_movie != '' &&
                                    this.state.hero_movie != undefined &&
                                    GLOBAL.UserInterface.home
                                        .enable_hero_images == true,
                                )(
                                    <View
                                        style={{
                                            height: GLOBAL.Device_Height / 3,
                                        }}
                                    >
                                        <ImageBackground
                                            style={{
                                                width: GLOBAL.Device_Width,
                                                height:
                                                    GLOBAL.Device_Height / 3,
                                            }}
                                            resizeMode={'cover'}
                                            resizeMethod={'scale'}
                                            source={{
                                                uri:
                                                    GLOBAL.ImageUrlCMS +
                                                    this.state.hero_movie
                                                        .backdrop,
                                            }}
                                        >
                                            <ImageBackground
                                                style={{
                                                    width: GLOBAL.Device_Width,
                                                    height:
                                                        GLOBAL.Device_Height /
                                                        3,
                                                }}
                                                resizeMode={'stretch'}
                                                resizeMethod={'scale'}
                                                source={require('../../../../images/hero_bg.png')}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'flex-end',
                                                        height:
                                                            GLOBAL.Device_Height /
                                                            3,
                                                        paddingLeft: 30,
                                                        paddingBottom: 30,
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
                                                                alignSelf:
                                                                    'center',
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
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                        }}
                                                    >
                                                        <Markers
                                                            Text={
                                                                this.state
                                                                    .hero_movie
                                                                    .year
                                                            }
                                                            Color={'#222'}
                                                        />
                                                        {RenderIf(
                                                            this.state
                                                                .hero_movie
                                                                .srt != '' &&
                                                            this.state
                                                                .hero_movie
                                                                .srt !=
                                                            null,
                                                        )(
                                                            <Markers
                                                                Text={'SRT'}
                                                                Color={'#222'}
                                                            />,
                                                        )}
                                                        {RenderIf(
                                                            this.state
                                                                .hero_movie
                                                                .age_rating !=
                                                            null &&
                                                            this.state
                                                                .hero_movie
                                                                .age_rating !=
                                                            '',
                                                        )(
                                                            <Markers
                                                                Text={
                                                                    this.state
                                                                        .hero_movie
                                                                        .age_rating
                                                                }
                                                                Color={'#222'}
                                                            />,
                                                        )}
                                                    </View>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            paddingTop: 10,
                                                        }}
                                                    >
                                                        <Markers
                                                            Big
                                                            Text={'Play Movie'}
                                                            Color={'royalblue'}
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
                                <ImageBackground
                                    style={{
                                        width: GLOBAL.Device_Width,
                                        height: null,
                                    }}
                                    resizeMode={'cover'}
                                    resizeMethod={'resize'}
                                    source={require('../../../../images/hero_bg.png')}
                                >
                                    <View
                                        style={{ flex: 1, flexDirection: 'row' }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'column',
                                                paddingTop: 10,
                                                paddingLeft: 10,
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
                                                        ]}
                                                    >
                                                        Your Favorite Channels
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
                                                        </Text>
                                                    </Text>
                                                    <View
                                                        style={{
                                                            paddingLeft: 10,
                                                            paddingTop: 10,
                                                            paddingBottom: 10,
                                                        }}
                                                    >
                                                        <ChannelList
                                                            focusChannel={
                                                                this
                                                                    .focusChannel
                                                            }
                                                            Channels={
                                                                this.state
                                                                    .favorites
                                                            }
                                                            Width={
                                                                GLOBAL.Device_IsPhone
                                                                    ? 300
                                                                    : 400
                                                            }
                                                            Type={'Favorite'}
                                                            scrollType="channels"
                                                            ColumnType={
                                                                this.state
                                                                    .channelType
                                                            }
                                                            Columns={
                                                                this.state
                                                                    .columns_
                                                            }
                                                            getItemLayout={(
                                                                data,
                                                                index,
                                                            ) => {
                                                                return {
                                                                    length: GLOBAL.Device_IsPhone
                                                                        ? 300
                                                                        : 400,
                                                                    index,
                                                                    offset: GLOBAL.Device_IsPhone
                                                                        ? 300
                                                                        : 400 *
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
                                                        ]}
                                                    >
                                                        News & Information
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
                                                            borderRadius: 10,
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
                                                                    Size={15}
                                                                    onPress={() =>
                                                                        this.onNews(
                                                                            -1,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
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
                                                                    Size={15}
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
                                            {RenderIf(
                                                this.state.series.length > 0,
                                            )(
                                                <View>
                                                    <Text
                                                        style={[
                                                            styles.H2,
                                                            styles.Shadow,
                                                        ]}
                                                    >
                                                        Trending Series
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
                                                                    .series
                                                                    .length
                                                            }
                                                            )
                                                        </Text>
                                                    </Text>
                                                    <View
                                                        style={{
                                                            paddingLeft: 10,
                                                            paddingTop: 10,
                                                            paddingBottom: 10,
                                                        }}
                                                    >
                                                        <FlatList
                                                            data={
                                                                this.state
                                                                    .series
                                                            }
                                                            horizontal={true}
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
                                                                    length: 310,
                                                                    index,
                                                                    offset:
                                                                        310 *
                                                                        index,
                                                                };
                                                            }}
                                                            renderItem={({
                                                                item,
                                                                index,
                                                            }) => (
                                                                <View>
                                                                    <TouchableHighlightFocus
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
                                                                                    '#111',
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
                                                                                    300
                                                                                }
                                                                            />
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                style={[
                                                                                    styles.Standard,
                                                                                    {
                                                                                        textAlign:
                                                                                            'right',
                                                                                        color: '#fff',
                                                                                        marginTop: 10,
                                                                                        marginRight: 5,
                                                                                        marginBottom: 5,
                                                                                    },
                                                                                ]}
                                                                            >
                                                                                {this.getSubText(
                                                                                    item,
                                                                                )}
                                                                            </Text>
                                                                        </View>
                                                                    </TouchableHighlightFocus>
                                                                </View>
                                                            )}
                                                        />
                                                    </View>
                                                </View>,
                                            )}
                                            {RenderIf(
                                                this.state.movies.length > 0,
                                            )(
                                                <View>
                                                    <Text
                                                        style={[
                                                            styles.H2,
                                                            styles.Shadow,
                                                        ]}
                                                    >
                                                        Latest Movies
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
                                                                    .movies
                                                                    .length
                                                            }
                                                            )
                                                        </Text>
                                                    </Text>
                                                    <View
                                                        style={{
                                                            paddingLeft: 10,
                                                            paddingTop: 10,
                                                            paddingBottom: 10,
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
                                                            horizontal={true}
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
                                                            }) => {
                                                                this.getMovieCover(
                                                                    item,
                                                                    index,
                                                                );
                                                            }}
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
                                                        paddingLeft: 10,
                                                        paddingTop: 10,
                                                        paddingBottom: 10,
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            paddingBottom: 10,
                                                        }}
                                                    >
                                                        <Markers
                                                            Color={
                                                                'darkslateblue'
                                                            }
                                                            Text={LANG.getTranslation(
                                                                'information',
                                                            )}
                                                        />
                                                    </View>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'column',
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.83)',
                                                            width:
                                                                GLOBAL.Device_Width -
                                                                GLOBAL.Device_Width /
                                                                6,
                                                            borderRadius: 10,
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                    >
                                                        <TouchableHighlightFocus
                                                            style={{
                                                                borderRadius: 10,
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
                                                                        width:
                                                                            GLOBAL.Device_Width -
                                                                            GLOBAL.Device_Width /
                                                                            6 -
                                                                            10, //310,
                                                                        height:
                                                                            (GLOBAL.Device_Width -
                                                                                GLOBAL.Device_Width /
                                                                                6) *
                                                                            0.26,
                                                                        borderRadius: 5,
                                                                        marginLeft: 3,
                                                                    },
                                                                ]}
                                                                resizeMethod={
                                                                    'scale'
                                                                }
                                                                resizeMode={
                                                                    'contain'
                                                                }
                                                                source={{
                                                                    uri: this
                                                                        .state
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
                                                <View
                                                    style={{ paddingBottom: 15 }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.H2,
                                                            styles.Shadow,
                                                        ]}
                                                    >
                                                        Recommended Channels
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
                                                                    .channels
                                                                    .length
                                                            }
                                                            )
                                                        </Text>
                                                    </Text>
                                                    <View
                                                        style={{
                                                            paddingLeft: 10,
                                                            paddingTop: 10,
                                                            paddingBottom: 10,
                                                        }}
                                                    >
                                                        <ChannelList
                                                            focusChannel={
                                                                this
                                                                    .focusChannel
                                                            }
                                                            Channels={
                                                                this.state
                                                                    .channels
                                                            }
                                                            Width={
                                                                GLOBAL.Device_IsPhone
                                                                    ? 300
                                                                    : 400
                                                            }
                                                            Type={'Home'}
                                                            scrollType="channels"
                                                            ColumnType={
                                                                this.state
                                                                    .channelType
                                                            }
                                                            Columns={
                                                                this.state
                                                                    .columns_
                                                            }
                                                            getItemLayout={(
                                                                data,
                                                                index,
                                                            ) => {
                                                                return {
                                                                    length: GLOBAL.Device_IsPhone
                                                                        ? 300
                                                                        : 400,
                                                                    index,
                                                                    offset: GLOBAL.Device_IsPhone
                                                                        ? 300
                                                                        : 400 *
                                                                        index,
                                                                };
                                                            }}
                                                        />
                                                    </View>
                                                </View>,
                                            )}
                                            {RenderIf(
                                                this.state.apps.length > 0 &&
                                                GLOBAL.Device_System ==
                                                'Android',
                                            )(
                                                <View
                                                    style={{ paddingBottom: 15 }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.H2,
                                                            styles.Shadow,
                                                        ]}
                                                    >
                                                        Best Apps
                                                        <Text
                                                            style={[
                                                                styles.Standard,
                                                                styles.Shadow,
                                                            ]}
                                                        >
                                                            {' '}
                                                            (
                                                            {
                                                                this.state.apps
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
                                                            flex: 1,
                                                        }}
                                                    >
                                                        <FlatList
                                                            data={
                                                                this.state.apps
                                                            }
                                                            horizontal={true}
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
                                                            scrollType="channels"
                                                            renderItem={({
                                                                item,
                                                                index,
                                                            }) => {
                                                                return this._renderApps(
                                                                    item,
                                                                    index,
                                                                );
                                                            }}
                                                        />
                                                    </View>
                                                </View>,
                                            )}
                                        </View>
                                    </View>
                                </ImageBackground>
                            </View>
                        </ScrollView>,
                    )}
                    {RenderIf(GLOBAL.Device_IsPhone == false)(
                        <ScrollView contentOffset={{ y: 300 }} style={{ flex: 1 }}>
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                {RenderIf(
                                    this.state.hero_movie != '' &&
                                    this.state.hero_movie != undefined &&
                                    GLOBAL.UserInterface.home
                                        .enable_hero_images == true,
                                )(
                                    <View
                                        style={{
                                            height: GLOBAL.Device_Height / 1.3,
                                        }}
                                    >
                                        <ImageBackground
                                            style={{
                                                width: GLOBAL.Device_Width,
                                                height:
                                                    GLOBAL.Device_Height / 1.3,
                                            }}
                                            resizeMode={'cover'}
                                            resizeMethod={'scale'}
                                            source={{
                                                uri:
                                                    GLOBAL.ImageUrlCMS +
                                                    this.state.hero_movie
                                                        .backdrop,
                                            }}
                                        >
                                            <ImageBackground
                                                style={{
                                                    width: GLOBAL.Device_Width,
                                                    height:
                                                        GLOBAL.Device_Height /
                                                        1.3,
                                                }}
                                                resizeMode={'stretch'}
                                                resizeMethod={'scale'}
                                                source={require('../../../../images/hero_bg.png')}
                                            >
                                                <TouchableOpacity
                                                    style={{
                                                        flexDirection: 'column',
                                                        justifyContent:
                                                            'flex-end',
                                                        height:
                                                            GLOBAL.Device_Height /
                                                            1.4,
                                                        paddingHorizontal: 50,
                                                        paddingBottom: 20,
                                                    }}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.H00,
                                                            styles.Shadow,
                                                        ]}
                                                    >
                                                        {
                                                            this.state
                                                                .hero_movie.name
                                                        }
                                                    </Text>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                        }}
                                                    >
                                                        <Markers
                                                            Text={
                                                                this.state
                                                                    .hero_movie
                                                                    .year
                                                            }
                                                            Color={'#222'}
                                                        />
                                                        {RenderIf(
                                                            this.state
                                                                .hero_movie
                                                                .srt != '' &&
                                                            this.state
                                                                .hero_movie
                                                                .srt !=
                                                            null,
                                                        )(
                                                            <Markers
                                                                Text={'SRT'}
                                                                Color={'#222'}
                                                            />,
                                                        )}
                                                        {RenderIf(
                                                            this.state
                                                                .hero_movie
                                                                .age_rating !=
                                                            null &&
                                                            this.state
                                                                .hero_movie
                                                                .age_rating !=
                                                            '',
                                                        )(
                                                            <Markers
                                                                Text={
                                                                    this.state
                                                                        .hero_movie
                                                                        .age_rating
                                                                }
                                                                Color={'#222'}
                                                            />,
                                                        )}
                                                    </View>
                                                    <Text
                                                        numberOfLines={3}
                                                        style={[
                                                            styles.Standard,
                                                            styles.Shadow,
                                                            { paddingRight: 100 },
                                                        ]}
                                                    >
                                                        {
                                                            this.state
                                                                .hero_movie
                                                                .description
                                                        }
                                                    </Text>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            paddingTop: 10,
                                                            height: 50,
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
                                                </TouchableOpacity>
                                            </ImageBackground>
                                        </ImageBackground>
                                    </View>,
                                )}
                                <ImageBackground
                                    style={{
                                        flex: 1,
                                        width: GLOBAL.Device_Width,
                                        height: null,
                                    }}
                                    resizeMode={'stretch'}
                                    resizeMethod={'resize'}
                                    source={require('../../../../images/hero_bg.png')}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            paddingBottom: 20,
                                        }}
                                    >
                                        {/* {RenderIf(this.state.leftbanner != GLOBAL.HTTPvsHTTPS + '' && GLOBAL.UserInterface.home.enable_ads == true)(
                                            <View style={{ flexDirection: 'column', paddingTop: 20, paddingLeft: 20 }}>
                                                <View style={{ flexDirection: 'row', paddingBottom: 5 }}>
                                                    <Markers Color={'darkslateblue'} Text={LANG.getTranslation("information")} />
                                                </View>
                                                <View style={{ flexDirection: 'column', backgroundColor: 'rgba(0, 0, 0, 0.33)', borderRadius: 10 }}>
                                                    <View>
                                                        <TouchableHighlightFocus onFocus={() => this.focusClear()}
                                                            style={{ borderRadius: 10, justifyContent: 'center' }} underlayColor={GLOBAL.Button_Color} onPress={() => this.openAdVertical()}>
                                                            <Image
                                                                style={[{
                                                                    width: 120,
                                                                    height: 435,
                                                                    borderRadius: 5
                                                                }]}
                                                                resizeMethod={'scale'}
                                                                resizeMode={'contain'}
                                                                source={{ uri: this.state.leftbanner }}>
                                                            </Image>
                                                        </TouchableHighlightFocus>
                                                    </View>
                                                </View>
                                            </View>
                                        )} */}
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
                                                <Animated.View
                                                    style={{
                                                        opacity:
                                                            this
                                                                .fadeChannelValue,
                                                        transform: [
                                                            {
                                                                scaleX: this.animatedChannelValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                            {
                                                                scaleY: this.animatedChannelValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    {RenderIf(
                                                        this.state
                                                            .channel_row_focussed ==
                                                        true,
                                                    )(
                                                        <Text
                                                            style={[
                                                                styles.H2,
                                                                styles.Shadow,
                                                                {
                                                                    paddingLeft: 15,
                                                                },
                                                            ]}
                                                        >
                                                            Your Favorite
                                                            Channels
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
                                                            </Text>
                                                        </Text>,
                                                    )}
                                                    <View
                                                        style={{
                                                            paddingLeft: 15,
                                                            paddingTop: 15,
                                                            paddingBottom: 15,
                                                            marginRight: 85,
                                                        }}
                                                    >
                                                        <ChannelList
                                                            extraData={
                                                                this.state
                                                                    .favorites
                                                            }
                                                            focusChannel={
                                                                this
                                                                    .focusChannel
                                                            }
                                                            blurChannel={
                                                                this.blurChannel
                                                            }
                                                            Channels={
                                                                this.state
                                                                    .channels
                                                            }
                                                            Width={
                                                                GLOBAL.Device_IsAppleTV
                                                                    ? 500
                                                                    : 400
                                                            }
                                                            Type={'Home'}
                                                            scrollType="channels"
                                                            ColumnType={
                                                                this.state
                                                                    .channelType
                                                            }
                                                            Columns={
                                                                this.state
                                                                    .columns_
                                                            }
                                                            getItemLayout={(
                                                                data,
                                                                index,
                                                            ) => {
                                                                return {
                                                                    length: 400,
                                                                    index,
                                                                    offset:
                                                                        400 *
                                                                        index,
                                                                };
                                                            }}
                                                        />
                                                    </View>
                                                </Animated.View>,
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
                                                        ]}
                                                    >
                                                        News & Information
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
                                                                65 -
                                                                GLOBAL.Device_Width /
                                                                4,
                                                            margin: 20,
                                                            borderRadius: 10,
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
                                                                    Size={15}
                                                                    onPress={() =>
                                                                        this.onNews(
                                                                            -1,
                                                                        )
                                                                    }
                                                                ></ButtonCircle>
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
                                                                    Size={15}
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
                                                                    backgroundColor:
                                                                        'rgba(0, 0, 0, 0.53)',
                                                                    padding: 20,
                                                                    borderRadius: 10,
                                                                }}
                                                            >
                                                                <Image
                                                                    style={{
                                                                        width: 100,
                                                                        height: 75,
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
                                                                    padding: 20,
                                                                    flex: 1,
                                                                }}
                                                            >
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
                                            {RenderIf(
                                                this.state.series.length > 0,
                                            )(
                                                <Animated.View
                                                    style={{
                                                        opacity:
                                                            this
                                                                .fadeSeriesValue,
                                                        transform: [
                                                            {
                                                                scaleX: this.animatedSeriesValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                            {
                                                                scaleY: this.animatedSeriesValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            paddingLeft: 15,
                                                            paddingTop: 15,
                                                            paddingBottom: 15,
                                                            marginRight: 85,
                                                        }}
                                                    >
                                                        {RenderIf(
                                                            this.state
                                                                .series_row_focussed ==
                                                            true,
                                                        )(
                                                            <Text
                                                                style={[
                                                                    styles.H2,
                                                                    styles.Shadow,
                                                                    {
                                                                        paddingLeft: 15,
                                                                        paddingVertical: 10,
                                                                    },
                                                                ]}
                                                            >
                                                                Trending Series
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
                                                            </Text>,
                                                        )}
                                                        <FlatList
                                                            extraData={
                                                                this.state
                                                                    .series
                                                            }
                                                            data={
                                                                this.state
                                                                    .series
                                                            }
                                                            horizontal={true}
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
                                                                <View>
                                                                    <TouchableHighlightFocus
                                                                        hideUnderlay={
                                                                            true
                                                                        }
                                                                        onFocus={() =>
                                                                            this.focusSeries(
                                                                                item,
                                                                            )
                                                                        }
                                                                        onBlur={() =>
                                                                            this.blurSeries()
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
                                                                            <ScaledImage
                                                                                uri={
                                                                                    GLOBAL.ImageUrlCMS +
                                                                                    item.backdrop
                                                                                }
                                                                                width={
                                                                                    GLOBAL.Device_IsAppleTV
                                                                                        ? 350
                                                                                        : 300
                                                                                }
                                                                            />
                                                                            <View
                                                                                style={{
                                                                                    position:
                                                                                        'absolute',
                                                                                    bottom: 20,
                                                                                    left: 20,
                                                                                }}
                                                                            >
                                                                                <Text
                                                                                    numberOfLines={
                                                                                        1
                                                                                    }
                                                                                    style={[
                                                                                        styles.H1,
                                                                                        styles.Shadow,
                                                                                        {
                                                                                            width: GLOBAL.Device_IsAppleTV
                                                                                                ? 350
                                                                                                : 260,
                                                                                        },
                                                                                    ]}
                                                                                >
                                                                                    {
                                                                                        item.name
                                                                                    }
                                                                                </Text>
                                                                                <Text
                                                                                    style={[
                                                                                        styles.H5,
                                                                                        styles.Shadow,
                                                                                    ]}
                                                                                >
                                                                                    {
                                                                                        item
                                                                                            .episodes
                                                                                            .length
                                                                                    }{' '}
                                                                                    Episodes
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    </TouchableHighlightFocus>
                                                                </View>
                                                            )}
                                                        />
                                                    </View>
                                                </Animated.View>,
                                            )}
                                            {RenderIf(
                                                this.state.movies.length > 0,
                                            )(
                                                <Animated.View
                                                    style={{
                                                        flex: 1,
                                                        opacity:
                                                            this
                                                                .fadeMoviesValue,
                                                        transform: [
                                                            {
                                                                scaleX: this.animatedMoviesValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                            {
                                                                scaleY: this.animatedMoviesValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            paddingLeft: 15,
                                                            paddingTop: 10,
                                                            paddingBottom: 15,
                                                            marginRight: 85,
                                                            flex: 1,
                                                        }}
                                                    >
                                                        <MovieDetails
                                                            onMount={
                                                                this
                                                                    .loadDetailsMovie
                                                            }
                                                        ></MovieDetails>
                                                        <Text
                                                            style={[
                                                                styles.H5,
                                                                styles.Shadow,
                                                                {
                                                                    paddingVertical: 10,
                                                                    paddingLeft: 15,
                                                                },
                                                            ]}
                                                        >
                                                            Latest Movies
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
                                                                        .movies
                                                                        .length
                                                                }
                                                                )
                                                            </Text>
                                                        </Text>
                                                        <FlatList
                                                            extraData={
                                                                this.state
                                                                    .movies
                                                            }
                                                            data={
                                                                this.state
                                                                    .movies
                                                            }
                                                            horizontal={true}
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
                                                            renderItem={
                                                                this
                                                                    .getMovieCover
                                                            }
                                                        />
                                                    </View>
                                                </Animated.View>,
                                            )}
                                            {RenderIf(
                                                this.state.channels.length > 0,
                                            )(
                                                <Animated.View
                                                    style={{
                                                        paddingBottom: 15,
                                                        opacity:
                                                            this
                                                                .fadeChannelValue,
                                                        transform: [
                                                            {
                                                                scaleX: this.animatedChannelValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                            {
                                                                scaleY: this.animatedChannelValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    {RenderIf(
                                                        this.state
                                                            .channel_row_focussed ==
                                                        true,
                                                    )(
                                                        <Text
                                                            style={[
                                                                styles.H2,
                                                                styles.Shadow
                                                                    .Actions,
                                                                {
                                                                    paddingLeft: 15,
                                                                },
                                                            ]}
                                                        >
                                                            Recommended Channels
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
                                                                        .channels
                                                                        .length
                                                                }
                                                                )
                                                            </Text>
                                                        </Text>,
                                                    )}
                                                    <View
                                                        style={{
                                                            paddingLeft: 15,
                                                            paddingTop: 15,
                                                            paddingBottom: 15,
                                                            flex: 1,
                                                            marginRight: 85,
                                                        }}
                                                    >
                                                        <ChannelList
                                                            extraData={
                                                                this.state
                                                                    .channels
                                                            }
                                                            focusChannel={
                                                                this
                                                                    .focusChannel
                                                            }
                                                            blurChannel={
                                                                this.blurChannel
                                                            }
                                                            Channels={
                                                                this.state
                                                                    .channels
                                                            }
                                                            Width={
                                                                GLOBAL.Device_IsAppleTV
                                                                    ? 500
                                                                    : 400
                                                            }
                                                            Type={'Home'}
                                                            scrollType="channels"
                                                            ColumnType={
                                                                this.state
                                                                    .channelType
                                                            }
                                                            Columns={
                                                                this.state
                                                                    .columns_
                                                            }
                                                            getItemLayout={(
                                                                data,
                                                                index,
                                                            ) => {
                                                                return {
                                                                    length: 400,
                                                                    index,
                                                                    offset:
                                                                        400 *
                                                                        index,
                                                                };
                                                            }}
                                                        />
                                                    </View>
                                                </Animated.View>,
                                            )}
                                            {RenderIf(
                                                this.state.apps.length > 0 &&
                                                GLOBAL.Device_System ==
                                                'Android',
                                            )(
                                                <Animated.View
                                                    style={{
                                                        paddingBottom: 15,
                                                        opacity:
                                                            this.fadeAppValue,
                                                        transform: [
                                                            {
                                                                scaleX: this.animatedAppValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                            {
                                                                scaleY: this.animatedAppValue.interpolate(
                                                                    {
                                                                        inputRange:
                                                                            [
                                                                                0,
                                                                                1,
                                                                            ],
                                                                        outputRange:
                                                                            [
                                                                                1,
                                                                                1.05,
                                                                            ],
                                                                    },
                                                                ),
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    {RenderIf(
                                                        this.state
                                                            .apps_row_focussed ==
                                                        true,
                                                    )(
                                                        <Text
                                                            style={[
                                                                styles.H2,
                                                                styles.Shadow,
                                                                {
                                                                    paddingLeft: 15,
                                                                },
                                                            ]}
                                                        >
                                                            Best Apps
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
                                                        </Text>,
                                                    )}
                                                    <View
                                                        style={{
                                                            paddingLeft: 15,
                                                            paddingTop: 15,
                                                            paddingBottom: 15,
                                                            flex: 1,
                                                            marginRight: 85,
                                                        }}
                                                    >
                                                        <FlatList
                                                            data={
                                                                this.state.apps
                                                            }
                                                            horizontal={true}
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
                                                            }) => {
                                                                return this._renderApps(
                                                                    item,
                                                                    index,
                                                                );
                                                            }}
                                                        />
                                                    </View>
                                                </Animated.View>,
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
                                                            flexDirection:
                                                                'row',
                                                            paddingBottom: 10,
                                                        }}
                                                    >
                                                        <Markers
                                                            Color={
                                                                'darkslateblue'
                                                            }
                                                            Text={LANG.getTranslation(
                                                                'information',
                                                            )}
                                                        />
                                                    </View>
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'column',
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.83)',
                                                            width: 630,
                                                            justifyContent:
                                                                'center',
                                                        }}
                                                    >
                                                        <TouchableHighlightFocus
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
                                                                        width: 620,
                                                                        height: 160,
                                                                    },
                                                                ]}
                                                                resizeMethod={
                                                                    'scale'
                                                                }
                                                                resizeMode={
                                                                    'contain'
                                                                }
                                                                source={{
                                                                    uri: this
                                                                        .state
                                                                        .bottombanner,
                                                                }}
                                                            ></Image>
                                                        </TouchableHighlightFocus>
                                                    </View>
                                                </View>,
                                            )}
                                        </View>
                                    </View>
                                </ImageBackground>
                            </View>
                        </ScrollView>,
                    )}
                </ImageBackground>
            </Container>
        );
    }
}
