import React, { useEffect, useState, useRef, useCallback } from 'react';
import SIZES from '../../../constants/sizes';
import { Block, Text, Message, ScaledImage } from '../../../components/';
import {
    View,
    StyleSheet,
    Platform,
    BackHandler,
    Image,
    ScrollView,
    TouchableHighlight,
} from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Button, Modal, Card, Input } from '@ui-kitten/components';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import TimerMixin from 'react-timer-mixin';
// import GLOBALModule from '../../../../datalayer/global';
var GLOBALModule = require('../../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import { sendPageReport } from '../../../../reporting/reporting';
import { useTheme } from '../../../hooks';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default ({ navigation }): React.ReactElement => {
    var closeAppTimer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const carouselRef = useRef(null);
    const route = useRoute();
    const { sizes_ } = useTheme();
    const [news, setNews] = useState({
        newsIndex: 0,
        newsText: '',
        newsDate: '',
        newsImage: '',
        length: 0,
        news: [],
    });
    const [favorites, setFavorites] = useState([]);
    const [channels, setChannels] = useState([]);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [sliders, setSliders] = useState([]);
    const [activeSlide, setSlide] = useState(0);
    const [slideLength, setSlideLength] = useState(0);
    const [showCloseAppModal, setShowCloseAppModal] = useState(false);
    const [backPressedCount, setBackPressedCount] = useState(0);
    const [leftBanner, setLeftBanner] = useState('');
    const [rightBanner, setRightBanner] = useState('');
    const [campaign, setCampaign] = useState([] as any);

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () => sendPageReport('Home', reportStartTime, moment().unix());
    }, []);

    const getAdsVertical = () => {
        const unix_now = moment().unix();
        if (GLOBAL.Home_Screen_Ads_Date_Vertical < unix_now) {
            const unix_till_new_ads = moment().unix() + 86400;
            GLOBAL.Home_Screen_Ads_Date_Vertical = unix_till_new_ads;
            DAL.getHomeScreenAds('vertical')
                .then(ads => {
                    GLOBAL.Home_Screen_Ads_Vertical = ads;
                    if (ads.url != null) {
                        setLeftBanner(GLOBAL.ImageUrlCMS + ads.url);
                        var campaign_ = {
                            backdrop: ads.campaignbackdrop,
                            email: ads.campaignemail,
                            campaignId: ads.campaignid,
                            stream: ads.campaignstream,
                            text: ads.campaigntext,
                            enabled: ads.campaignenabled,
                        };
                        setCampaign(campaign_);
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
                    setLeftBanner(GLOBAL.ImageUrlCMS + ads.url);
                }
            }
        }
    };
    useEffect(() => {
        setBackPressedCount(0);
        getAdsVertical();

        if (sliders.length == 0) {
            let movies_ = [];
            if (GLOBAL.Metro.metromovieitems != undefined) {
                movies_ = GLOBAL.Metro.metromovieitems;
                if (movies_.length > 5) {
                    movies_ = movies_.slice(0, 5);
                }
            }
            setSlideLength(movies_.length);
            setSliders(movies_);
        }

        if (
            GLOBAL.Metro.metronewsitems != undefined &&
            GLOBAL.Metro.metronewsitems.length > 0
        ) {
            let newsIn = GLOBAL.Metro.metronewsitems;
            news.news = newsIn;
            news.newsIndex = 0;
            news.newsText = newsIn[0].description;
            news.newsDate = newsIn[0].date;
            news.newsImage = newsIn[0].image;
            news.length = newsIn.length;
            setNews(news);
        }

        let favorites_ = [];
        if (GLOBAL.Favorite_Channels != undefined) {
            favorites_ = GLOBAL.Favorite_Channels;
            setFavorites(favorites_);
        }

        let channels_ = [];
        if (GLOBAL.Metro.metrortvitems != undefined) {
            channels_ = GLOBAL.Metro.metrortvitems;
            var channelsOut = channels_.sort(
                (a, b) => a.channel_number - b.channel_number,
            );
        }
        setChannels(channelsOut);

        let movies_ = [];
        if (GLOBAL.Metro.metromovieitems != undefined) {
            movies_ = GLOBAL.Metro.metromovieitems;
        }
        if (movies_.length != undefined) {
            setMovies(movies_);
        }

        let series_ = [];
        if (GLOBAL.Metro.metroserieitems != undefined) {
            series_ = GLOBAL.Metro.metroserieitems;
        }
        setSeries(series_);

        return () => {
            TimerMixin.clearTimeout(closeAppTimer);
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', () => {
                setBackPressedCount(backPressedCount => backPressedCount + 1);
                setShowCloseAppModal(true);
                startCloseAppTimer();
                return true;
            });
            return () => {
                BackHandler.removeEventListener(
                    'hardwareBackPress',
                    () => true,
                );
            };
        }, []),
    );

    useEffect(() => {
        if (backPressedCount === 2) {
            BackHandler.exitApp();
        }
    }, [backPressedCount]);
    const getTags = tags => {
        var output = '';
        tags.forEach((element, index) => {
            if (index == 0) {
                output = output + '' + element;
            } else {
                output = output + ', ' + element;
            }
        });
        return output;
    };

    const startCloseAppTimer = () => {
        TimerMixin.clearTimeout(closeAppTimer);
        closeAppTimer = TimerMixin.setTimeout(() => {
            setBackPressedCount(0);
            setShowCloseAppModal(false);
        }, 2000);
    };
    const renderItem = ({ item }) => {
        return (
            <FocusButton onPress={() => onOpenMovieDetails(item)}>
                <View
                    style={[
                        styles.item,
                        {
                            width: sizes.width * 0.4 - 60,
                            height: (sizes.width * 0.4 - 60) * 0.56,
                        },
                    ]}
                >
                    <Image
                        resizeMode={'cover'}
                        source={{ uri: GLOBAL.ImageUrlCMS + item.backdrop }}
                        //containerStyle={styles.imageContainer}
                        style={[
                            styles.image,
                            {
                                width: sizes.width * 0.4 - 60,
                                height: (sizes.width * 0.4 - 60) * 0.56,
                            },
                        ]}
                    //parallaxFactor={0}
                    // {...parallaxProps}
                    />
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            paddingHorizontal: 20,
                            padding: 20,
                            left: 0,
                            right: 0,
                        }}
                    >
                        {item.logo == undefined && (
                            <Text h4 shadow>
                                {item.name}
                            </Text>
                        )}
                        {item.logo != undefined && (
                            <ScaledImage
                                uri={GLOBAL.ImageUrlCMS + item.logo}
                                width={sizes.width * 0.2}
                            />
                        )}
                        <Text bold shadow numberOfLines={1}>
                            {getTags(item.tags)}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const renderFavorite = ({ item }) => {
        return (
            <FocusButton onPress={() => onPlayChannelFavorite(item)}>
                <View
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
                        borderRadius: 100,
                        margin: 5,
                        padding: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: 4,
                        borderColor: '#111',
                        width: GLOBAL.Device_IsPortrait
                            ? sizes.width * 0.3
                            : sizes.width * 0.11,
                        height: GLOBAL.Device_IsPortrait
                            ? sizes.width * 0.3
                            : sizes.width * 0.11,
                    }}
                >
                    <View
                        style={{
                            margin: 5,
                            width: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.16
                                : sizes.width * 0.06,
                            height: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.16
                                : sizes.width * 0.06,
                        }}
                    >
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.icon_big }}
                            style={{ width: '100%', height: '100%' }}
                        ></Image>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onOpenMovieDetails = item => {
        navigation.navigate({
            name: 'Movie',
            params: {
                movie_id: item.id,
                movies: movies,
            },
            merge: true,
        });
    };
    const renderMovie = ({ item }) => {
        return (
            <FocusButton
                style={{ borderRadius: 5 }}
                onPress={() => onOpenMovieDetails(item)}
            >
                <View
                    style={{
                        margin: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <View
                            style={{
                                borderColor: '#222',
                                borderWidth: 4,
                                borderRadius: 5,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4
                                    : sizes.width * 0.15,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4 * 1.5
                                    : sizes.width * 0.15 * 1.5,
                            }}
                        >
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                                style={[
                                    {
                                        borderRadius: 2,
                                        width: '100%',
                                        height: '100%',
                                    },
                                ]}
                            ></Image>
                        </View>
                        <Text
                            bold
                            shadow
                            numberOfLines={1}
                            style={{
                                marginTop: 5,
                                marginLeft: 5,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.38
                                    : sizes.width * 0.13,
                            }}
                        >
                            {item.name}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const renderSeries = ({ item }) => {
        return (
            <FocusButton onPress={() => onOpenStore(item)}>
                <View
                    style={{
                        margin: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <View
                        style={{
                            borderColor: '#222',
                            borderWidth: 4,
                            borderRadius: 5,
                            width: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.8
                                : sizes.width * 0.3,
                            height: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.8 * 0.56
                                : sizes.width * 0.3 * 0.56,
                        }}
                    >
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.backdrop }}
                            resizeMode={'cover'}
                            style={[
                                {
                                    borderRadius: 2,
                                    width: '100%',
                                    height: '100%',
                                },
                            ]}
                        ></Image>
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            paddingHorizontal: 20,
                            padding: 20,
                            left: 0,
                            right: 0,
                        }}
                    >
                        <Text h4 bold shadow numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text bold shadow numberOfLines={1}>
                            {LANG.getTranslation('episodes')}{' '}
                            {item.episodes.length}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const getTvProgram = channel => {
        var currentUnix = moment().unix();
        var epg_check = GLOBAL.EPG.find(e => e.id == channel.channel_id);
        var currentIndex = 0;
        var epg_ = [];
        var currentProgram = [];
        var percentageProgram = 0;
        var time = '';
        var n = 'No Information Available';
        if (epg_check != undefined) {
            epg_ = epg_check.epgdata;
            currentIndex = epg_.findIndex(function (element) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            if (currentIndex != undefined) {
                if (epg_[currentIndex] != null) {
                    currentProgram = epg_[currentIndex];
                    n = currentProgram.n;
                    time =
                        moment
                            .unix(currentProgram.s)
                            .format('ddd ' + GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment
                            .unix(currentProgram.e)
                            .format(GLOBAL.Clock_Setting);
                    var totalProgram = currentProgram.e - currentProgram.s;
                    percentageProgram =
                        (currentUnix - currentProgram.s) / totalProgram;
                }
            }
        }
        return (
            <View style={{ flex: 1 }}>
                <Text shadow numberOfLines={1}>
                    {n}
                </Text>
                <View
                    style={{
                        borderTopWidth: 2,
                        borderTopColor: '#999',
                        width:
                            (GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.58
                                : sizes.width * 0.2) * percentageProgram,
                    }}
                ></View>
                <Text shadow numberOfLines={1}>
                    {time}
                </Text>

                <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                    {RenderIf(
                        GLOBAL.UserInterface.general.enable_catchuptv == true &&
                        (channel.is_flussonic == 1 || channel.is_dveo == 1),
                    )(
                        <View
                            style={{
                                backgroundColor: 'royalblue',
                                padding: 5,
                                borderRadius: 100,
                                margin: 2,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[{ fontSize: 14, color: '#fff' }]}
                                // icon={SolidIcons.history}
                                name="history"
                            />
                        </View>,
                    )}
                    {/* {RenderIf(GLOBAL.UserInterface.general.enable_catchuptv == true && (channel.is_flussonic == 1 || channel.is_dveo == 1))(
            <View style={{ backgroundColor: 'royalblue', padding: 5, borderRadius: 100, margin: 2, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
              <FontAwesome5 style={[{ fontSize: 14, color: '#fff' }]} icon={SolidIcons.recycle} />
            </View>
          )} */}
                    {RenderIf(
                        GLOBAL.UserInterface.general.enable_recordings ==
                        true &&
                        (channel.is_flussonic == 1 || channel.is_dveo == 1),
                    )(
                        <View
                            style={{
                                backgroundColor: 'crimson',
                                padding: 4,
                                borderRadius: 100,
                                margin: 2,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[{ fontSize: 14, color: '#fff' }]}
                                // icon={SolidIcons.dotCircle}
                                name="dot-circle"
                            />
                        </View>,
                    )}
                </View>
            </View>
        );
    };
    const onPlayChannel = item => {
        var channel_index = 0;
        var category_index = 0;
        var channel = [];
        var category = [];
        var categoriesIn = [];
        GLOBAL.Channels.forEach((category, index) => {
            var categoryOut = {
                name: category.name,
                id: category.id,
                length: category.channels.length,
            };
            categoriesIn.push(categoryOut);
        });
        var foundIt = false;
        GLOBAL.Channels.forEach((category_, index) => {
            category_.channels.forEach((channel_, index_) => {
                if (index != 1) {
                    if (
                        channel_.channel_id == item.channel_id &&
                        foundIt == false
                    ) {
                        foundIt = true;
                        category_index = index;
                        category = category_;
                        channel_index = index_;
                        channel = channel_;
                        GLOBAL.Channels_Selected = category_.channels;
                    }
                }
            });
        });
        GLOBAL.Channels_Selected_Category_Index = category_index;
        navigation.navigate({
            name: 'Player_Channels',
            params: {
                index: channel_index,
                channels: GLOBAL.Channels_Selected,
                channel: channel,
                categories: categoriesIn,
                category_index: category_index,
            },
            merge: true,
        });
    };
    const onPlayChannelFavorite = item => {
        var channel_index = 0;
        var category_index = 0;
        var channel = [];
        var category = GLOBAL.Channels.find(x => x.id == 0);
        var categoriesIn = [];
        GLOBAL.Channels_Selected_Category_ID = 0;
        GLOBAL.Channels.forEach((category, index) => {
            var categoryOut = {
                name: category.name,
                id: category.id,
                length: category.channels.length,
            };

            categoriesIn.push(categoryOut);
        });
        GLOBAL.Channels_Selected_Category_Index = UTILS.getCategoryIndex(0);
        if (category != undefined) {
            if (category.channels.length > 0) {
                channel = UTILS.getChannelFavorite(item.channel_id);
                if (channel != null) {
                    GLOBAL.Channels_Selected = category.channels;
                    channel_index = UTILS.getChannelIndex(item.channel_id);
                    category_index = 1;
                }
            }
        }
        navigation.navigate({
            name: 'Player_Channels',
            params: {
                index: channel_index,
                channels: GLOBAL.Channels_Selected,
                channel: channel,
                categories: categoriesIn,
                category_index: category_index,
            },
            merge: true,
        });
    };
    const onOpenStore = item => {
        navigation.navigate({
            name: 'Seasons',
            params: {
                season_id: item.id,
            },
            merge: true,
        });
    };

    const renderChannel = ({ item }) => {
        return (
            <View
                style={{
                    margin: 5,
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <FocusButton
                    style={{ borderRadius: 5 }}
                    onPress={() => onPlayChannel(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            borderRadius: 5,
                            borderColor: '#222',
                            borderWidth: 4,
                        }}
                    >
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
                            <View
                                style={{
                                    margin: 5,
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.26
                                        : sizes.width * 0.09,
                                    height: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.26
                                        : sizes.width * 0.09,
                                }}
                            >
                                <Image
                                    source={{
                                        uri:
                                            GLOBAL.ImageUrlCMS +
                                            item.channel_image,
                                    }}
                                    resizeMode={'cover'}
                                    style={{
                                        resizeMode: 'cover',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                ></Image>
                            </View>
                        </View>
                        <View
                            style={{
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.65
                                    : sizes.width * 0.22,
                                padding: 15,
                                backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            }}
                        >
                            <Text h5 bold shadow numberOfLines={1}>
                                {item.channel_number} {item.name}
                            </Text>
                            {getTvProgram(item)}
                        </View>
                    </View>
                </FocusButton>
            </View>
        );
    };
    const SearchIcon = props => (
        <Icon {...props} fill="#fff" name="search-outline" />
    );
    const LeftIcon = props => (
        <Icon {...props} fill="#fff" name="arrow-ios-back-outline" />
    );
    const RightIcon = props => (
        <Icon {...props} fill="#fff" name="arrow-ios-forward-outline" />
    );
    const openAdVertical = () => {
        if (campaign.enabled) {
            navigation.navigate({
                name: 'Ads',
                params: {
                    campaign: campaign,
                },
                merge: true,
            });
        }
    };
    const onPressNewsReload = index => {
        var newIndex = news.newsIndex + index;
        if (newIndex >= 0 && newIndex < news.news.length) {
            let newsIn = news.news;
            let newsOut = news;
            newsOut.newsIndex = newIndex;
            newsOut.newsText = newsIn[newIndex].description;
            newsOut.newsDate = newsIn[newIndex].date;
            newsOut.newsImage = newsIn[newIndex].image;
            setNews(prevValues => {
                return { ...prevValues, newsOut };
            });
        }
    };
    const openSearch = nextValue => {
        navigation.navigate({
            name: 'Search',
            params: {
                searchValue: nextValue,
            },
            merge: true,
        });
    };
    return (
        <ScrollView>
            <Modal
                style={{
                    position: 'absolute',
                    top: 0,
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.8
                        : sizes.width * 0.3,
                }}
                visible={showCloseAppModal}
                onBackdropPress={() => setShowCloseAppModal(false)}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}
            >
                <Card disabled={true}>
                    <Text h5 bold>
                        {LANG.getTranslation('exit_app')}
                    </Text>
                    <Text>{LANG.getTranslation('exit_app_click_again')}</Text>
                    <Text>{LANG.getTranslation('exit_app_close')}</Text>
                </Card>
            </Modal>
            <View
                style={{
                    position: 'absolute',
                    zIndex: 9999,
                    top: 5,
                    left: 0,
                    right: 0,
                    flex: 1,
                    width: sizes.width,
                    marginVertical: 0,
                    alignSelf: 'center',
                }}
            >
                <Message> </Message>
            </View>

            <View
                style={{
                    flexDirection: 'row',
                    borderColor: '#000',
                    borderWidth: 2,
                    borderRadius: 100,
                    marginHorizontal: 20,
                    marginTop: 20,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignSelf: 'center',
                        paddingVertical: 5,
                    }}
                >
                    <Input
                        style={{
                            borderColor: 'transparent',
                            width: '100%',
                            backgroundColor: 'transparent',
                        }}
                        autoComplete={'off'}
                        placeholder={LANG.getTranslation('search') + '...'}
                        placeholderTextColor={'#fff'}
                        accessoryLeft={SearchIcon}
                        underlineColorAndroid="transparent"
                        onChangeText={nextValue => openSearch(nextValue)}
                    />
                </View>
            </View>
            {GLOBAL.UserInterface.home.enable_hero_images == true && (
                <View style={{ paddingTop: 20 }}>
                    <Carousel
                        ref={carouselRef}
                        sliderWidth={sizes.width}
                        itemWidth={sizes.width * 0.4 - 60}
                        data={sliders}
                        renderItem={renderItem}
                        hasParallaxImages={true}
                        autoplay={true}
                        loop={true}
                        autoplayInterval={5000}
                        onSnapToItem={index => setSlide(index)}
                    />
                    <Pagination
                        dotsLength={slideLength}
                        activeDotIndex={activeSlide}
                        containerStyle={{ width: sizes.width }}
                        dotStyle={{
                            borderRadius: 5,
                            marginHorizontal: 1,
                            backgroundColor: '#fff',
                        }}
                        inactiveDotStyle={{
                            borderRadius: 5,
                            marginHorizontal: 1,
                            backgroundColor: '#000',
                        }}
                        inactiveDotOpacity={0.4}
                        inactiveDotScale={0.8}
                    />
                </View>
            )}
            <LinearGradient
                colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.6)']}
                style={{ flex: 1 }}
                start={{ x: 0.5, y: 0 }}
            >
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    {leftBanner != '' && (
                        <View style={{ marginHorizontal: 5 }}>
                            <FocusButton
                                BorderRadius={5}
                                style={{
                                    borderRadius: 5,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() => openAdVertical()}
                            >
                                <Image
                                    style={[
                                        {
                                            borderRadius: 5,
                                            width: 160,
                                            height: 600,
                                        },
                                    ]}
                                    resizeMethod={'scale'}
                                    resizeMode={'contain'}
                                    source={{ uri: leftBanner }}
                                ></Image>
                            </FocusButton>
                        </View>
                    )}
                    <Block
                        paddingBottom={20}
                        paddingLeft={sizes_.padding}
                        showsVerticalScrollIndicator={false}
                    >
                        {favorites.length > 0 && (
                            <View style={{ marginBottom: 20, marginTop: 0 }}>
                                <Text
                                    h5
                                    bold
                                    shadow
                                    numberOfLines={1}
                                    paddingBottom={10}
                                >
                                    {LANG.getTranslation('favoritechannels')} (
                                    {favorites.length})
                                </Text>
                                <FlatList
                                    style={{ marginLeft: -10 }}
                                    data={favorites}
                                    horizontal={true}
                                    removeClippedSubviews={true}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    onScrollToIndexFailed={() => { }}
                                    renderItem={renderFavorite}
                                />
                            </View>
                        )}
                        {RenderIf(
                            news.length > 0 &&
                            GLOBAL.UserInterface.home.enable_news_section ==
                            true,
                        )(
                            <View
                                style={{
                                    borderRadius: 5,
                                    borderColor: '#222',
                                    borderWidth: 4,
                                    flex: 1,
                                    marginRight: 10,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        backgroundColor: '#rgba(0, 0, 0, 0.80)',
                                    }}
                                >
                                    <View style={{ alignItems: 'flex-start' }}>
                                        {RenderIf(news.length > 1)(
                                            <Button
                                                appearance="ghost"
                                                accessoryLeft={LeftIcon}
                                                onPress={() =>
                                                    onPressNewsReload(-1)
                                                }
                                            />,
                                        )}
                                    </View>
                                    <View style={{ flex: 6 }}></View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        {RenderIf(news.length > 1)(
                                            <Button
                                                appearance="ghost"
                                                accessoryLeft={RightIcon}
                                                onPress={() =>
                                                    onPressNewsReload(1)
                                                }
                                            />,
                                        )}
                                    </View>
                                </View>
                                <View
                                    style={{
                                        padding: 15,
                                        backgroundColor: '#rgba(0, 0, 0, 0.60)',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row' }}>
                                        <View>
                                            <Image
                                                source={{
                                                    uri:
                                                        GLOBAL.ImageUrlCMS +
                                                        news.newsImage,
                                                }}
                                                style={{
                                                    borderRadius: 2,
                                                    width: 150,
                                                    height: 100,
                                                }}
                                            />
                                        </View>
                                        <View style={{ marginLeft: 20 }}>
                                            <Text bold shadow numberOfLines={1}>
                                                {news.newsDate}
                                            </Text>
                                            <Text shadow>{news.newsText}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>,
                        )}

                        {series.length > 0 && (
                            <View style={{ paddingTop: 20 }}>
                                <Text
                                    h5
                                    bold
                                    shadow
                                    numberOfLines={1}
                                    paddingBottom={10}
                                >
                                    {LANG.getTranslation('trendingseries')} (
                                    {series.length})
                                </Text>
                                <FlatList
                                    //style={{ marginLeft: -6 }}
                                    data={series}
                                    horizontal={true}
                                    removeClippedSubviews={true}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    onScrollToIndexFailed={() => { }}
                                    renderItem={renderSeries}
                                />
                            </View>
                        )}
                        {movies.length > 0 && (
                            <View style={{ paddingTop: 20 }}>
                                <Text
                                    h5
                                    bold
                                    shadow
                                    numberOfLines={1}
                                    paddingBottom={10}
                                >
                                    {LANG.getTranslation('lastestmovies')} (
                                    {movies.length})
                                </Text>
                                <FlatList
                                    //style={{ marginLeft: -6 }}
                                    data={movies}
                                    horizontal={true}
                                    removeClippedSubviews={true}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    onScrollToIndexFailed={() => { }}
                                    renderItem={renderMovie}
                                />
                            </View>
                        )}
                        {channels.length > 0 && (
                            <View style={{ paddingTop: 20 }}>
                                <Text
                                    h5
                                    bold
                                    shadow
                                    numberOfLines={1}
                                    paddingBottom={10}
                                >
                                    {LANG.getTranslation('recommendedchannels')}{' '}
                                    ({channels.length})
                                </Text>
                                <FlatList
                                    //style={{ marginLeft: -6 }}
                                    data={channels}
                                    horizontal={true}
                                    removeClippedSubviews={true}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    onScrollToIndexFailed={() => { }}
                                    renderItem={renderChannel}
                                />
                            </View>
                        )}
                    </Block>
                    {rightBanner != '' && <View></View>}
                </View>
            </LinearGradient>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    item: {
        backgroundColor: 'transparent',
        borderRadius: 4,
    },
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
        backgroundColor: '#000',
        borderRadius: 5,
        borderColor: '#222',
        borderWidth: 4,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
        borderRadius: 5,
        backgroundColor: '#000',
        borderColor: '#222',
        borderWidth: 4,
    },
});
