import React, { useEffect, useState, useRef, useCallback } from 'react';
import SIZES from '../../../constants/sizes';

import { Block, Text, Message, ScaledImage } from '../../../components/';
import {
    View,
    StyleSheet,
    Platform,
    Image,
    TouchableOpacity,
    ImageBackground,
    BackHandler,
    ScrollView,
} from 'react-native';
import Carousel, { ParallaxImage, Pagination } from 'react-native-snap-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Button, Modal, Card, Input } from '@ui-kitten/components';
import { useRoute } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import TimerMixin from 'react-timer-mixin';
// import GLOBALModule from '../../../../datalayer/global';
var GLOBALModule = require('../../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import { sendPageReport } from '../../../../reporting/reporting';
import { useTheme } from '../../../hooks/';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default ({ navigation }): React.ReactElement => {
    var closeAppTimer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const carouselRef = useRef(null);
    const route = useRoute();
    const [news, setNews] = useState({
        newsIndex: 0,
        newsText: '',
        newsDate: '',
        newsImage: '',
        length: 0,
        news: [],
    });
    const { sizes_ } = useTheme();
    const [favorites, setFavorites] = useState([]);
    const [channels, setChannels] = useState([]);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [sliders, setSliders] = useState([]);
    const [activeSlide, setSlide] = useState(0);
    const [slideLength, setSlideLength] = useState(0);
    const [showCloseAppModal, setShowCloseAppModal] = useState(false);
    const [backPressedCount, setBackPressedCount] = useState(0);
    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () => sendPageReport('Home', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        setBackPressedCount(0);

        if (sliders.length == 0) {
            let movies_ = [];
            if (GLOBAL.Metro != undefined) {
                if (GLOBAL.Metro.metromovieitems != undefined) {
                    movies_ = GLOBAL.Metro.metromovieitems;
                    if (movies_.length > 5) {
                        movies_ = movies_.slice(0, 5);
                    }
                }
            }
            setSlideLength(movies_.length);
            setSliders(movies_);
        }

        if (
            GLOBAL.Metro != undefined &&
            GLOBAL.Metro.metronewsitems != undefined &&
            GLOBAL.Metro.metronewsitems.length > 0
        ) {
            let newsIn = GLOBAL.Metro.metronewsitems;
            news.news = newsIn;
            news.newsIndex = 0;
            news.newsText = newsIn[0].description;
            news.newsDate = newsIn[0].date;
            news.length = newsIn.length;
            news.newsImage = newsIn.image;
            setNews(news);
        }

        let favorites_ = [];
        if (
            GLOBAL.Metro != undefined &&
            GLOBAL.Favorite_Channels != undefined
        ) {
            favorites_ = GLOBAL.Favorite_Channels;
            setFavorites(favorites_);
        }

        let channels_ = [];
        var channelsOut;
        if (
            GLOBAL.Metro != undefined &&
            GLOBAL.Metro.metrortvitems != undefined
        ) {
            channels_ = GLOBAL.Metro.metrortvitems;
            channelsOut = channels_.sort(
                (a, b) => a.channel_number - b.channel_number,
            );
        }
        setChannels(channelsOut);

        let movies_ = [];
        if (
            GLOBAL.Metro != undefined &&
            GLOBAL.Metro.metromovieitems != undefined
        ) {
            movies_ = GLOBAL.Metro.metromovieitems;
        }
        if (movies_.length != undefined) {
            setMovies(movies_);
        }

        let series_ = [];
        if (
            GLOBAL.Metro != undefined &&
            GLOBAL.Metro.metroserieitems != undefined
        ) {
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

    const startCloseAppTimer = () => {
        TimerMixin.clearTimeout(closeAppTimer);
        closeAppTimer = TimerMixin.setTimeout(() => {
            setBackPressedCount(0);
            setShowCloseAppModal(false);
        }, 2000);
    };

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

    const renderItem = ({ item }) => {
        return (
            <FocusButton onPress={() => onOpenMovieDetails(item)}>
                <View
                    style={[
                        styles.item,
                        {
                            width: sizes.width - 60,
                            height: (sizes.width - 60) * 0.56,
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
                                width: sizes.width - 60,
                                height: (sizes.width - 60) * 0.56,
                            },
                        ]}
                    //parallaxFactor={0}
                    //{...parallaxProps}
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
                                width={sizes.width * 0.4}
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
            <FocusButton
                style={{ borderRadius: 100 }}
                onPress={() => onPlayChannelFavorite(item)}
            >
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
                    <Image
                        source={{ uri: GLOBAL.ImageUrlCMS + item.icon_big }}
                        style={{
                            margin: 5,
                            width: sizes.width * 0.16,
                            height: sizes.width * 0.16,
                        }}
                    ></Image>
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
                    <FocusButton onPress={() => onOpenMovieDetails(item)}>
                        <View style={{ flex: 1 }}>
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                                style={[
                                    {
                                        borderColor: '#222',
                                        borderWidth: 4,
                                        borderRadius: 5,
                                        width: sizes.width * 0.4,
                                        height: sizes.width * 0.4 * 1.5,
                                    },
                                ]}
                            ></Image>
                            <Text
                                bold
                                shadow
                                numberOfLines={1}
                                style={{
                                    marginTop: 5,
                                    marginLeft: 5,
                                    width: sizes.width * 0.39 - 10,
                                }}
                            >
                                {item.name}
                            </Text>
                        </View>
                    </FocusButton>
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
                    <Image
                        source={{ uri: GLOBAL.ImageUrlCMS + item.backdrop }}
                        style={[
                            {
                                borderColor: '#222',
                                borderWidth: 4,
                                borderRadius: 5,
                                width: sizes.width * 0.8,
                                height: sizes.width * 0.8 * 0.56,
                            },
                        ]}
                    ></Image>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            paddingHorizontal: 10,
                            padding: 10,
                            left: 0,
                            right: 0,
                        }}
                    >
                        <Text h5 bold shadow numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text marginTop={-5} shadow numberOfLines={1}>
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
                        width: sizes.width * 0.58 * percentageProgram,
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
        GLOBAL.Channels.forEach((category_, index) => {
            var foundIt = false;
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
        var category_index = 1;
        var channel = [];
        var category = GLOBAL.Channels[category_index];
        var categoriesIn = [];
        GLOBAL.Channels_Selected_Category_ID = 0;
        GLOBAL.Channels_Selected_Category_Index = UTILS.getCategoryIndex(0);
        GLOBAL.Channels.forEach((category, index) => {
            var categoryOut = {
                name: category.name,
                id: category.id,
                length: category.channels.length,
            };
            categoriesIn.push(categoryOut);
        });
        GLOBAL.Channels_Selected_Category_Index = 1;
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
                category_index: 1,
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
                    flex: 1,
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
                            borderWidth: 3,
                        }}
                    >
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
                            <Image
                                source={{
                                    uri:
                                        GLOBAL.ImageUrlCMS + item.channel_image,
                                }}
                                style={{
                                    margin: 10,
                                    width: sizes.width * 0.26,
                                    height: sizes.width * 0.26,
                                }}
                            ></Image>
                        </View>
                        <View
                            style={{
                                width: sizes.width * 0.65,
                                padding: 5,
                                paddingLeft: 10,
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
    const onPressNewsReload = index => {
        var newIndex = news.newsIndex + index;
        if (newIndex >= 0 && newIndex < news.news.length) {
            let newsIn = news.news;
            let newsOut = news;
            newsOut.newsIndex = newIndex;
            newsOut.newsText = newsIn[newIndex].description;
            newsOut.newsDate = newsIn[newIndex].date;
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
            {/* <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.90)' }}>
        <Image
          //radius={0}
          resizeMethod={'resize'}
          resizeMode={'contain'}
          style={{ margin: 10 }}
          width={100}
          height={50}
          source={{ uri: GLOBAL.Logo }}
        />
      </View> */}
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
                    marginHorizontal: 10,
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
            {GLOBAL.UserInterface.home.enable_hero_images == true &&
                sliders.length > 0 && (
                    <View style={{ paddingTop: 20, alignItems: 'center' }}>
                        <Carousel
                            ref={carouselRef}
                            sliderWidth={sizes.width}
                            itemWidth={sizes.width - 60}
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
                            containerStyle={{ width: sizes.width * 0.5 }}
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
                style={{ flex: 1, minHeight: sizes.height }}
                start={{ x: 0.5, y: 0 }}
            >
                <View
                    style={{
                        flex: 1,
                        paddingBottom: 20,
                        paddingTop: sliders.length == 0 ? 20 : 0,
                        paddingLeft: 10,
                    }}
                >
                    {favorites != undefined && favorites.length > 0 && (
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
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderFavorite}
                            />
                        </View>
                    )}
                    {RenderIf(
                        news != undefined &&
                        news.length > 0 &&
                        GLOBAL.UserInterface.home.enable_news_section ==
                        true,
                    )(
                        <View
                            style={{
                                borderRadius: 5,
                                borderColor: '#222',
                                borderWidth: 4,
                                minHeight: sizes.width * 0.4,
                                marginRight: 10,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    backgroundColor: '#rgba(0, 0, 0, 0.80)',
                                }}
                            >
                                <View style={{ flex: 1 }}>
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
                                <View style={{ flex: 1 }}>
                                    {RenderIf(news.length > 1)(
                                        <Button
                                            appearance="ghost"
                                            accessoryLeft={RightIcon}
                                            onPress={() => onPressNewsReload(1)}
                                        />,
                                    )}
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 3,
                                    padding: 15,
                                    backgroundColor: '#rgba(0, 0, 0, 0.60)',
                                }}
                            >
                                <Text bold shadow numberOfLines={1}>
                                    {news.newsDate}
                                </Text>
                                <Text shadow>{news.newsText}</Text>
                            </View>
                        </View>,
                    )}

                    {series != undefined && series.length > 0 && (
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
                                style={{ marginLeft: -10 }}
                                data={series}
                                horizontal={true}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderSeries}
                            />
                        </View>
                    )}
                    {channels != undefined && channels.length > 0 && (
                        <View style={{ paddingTop: 20 }}>
                            <Text
                                h5
                                bold
                                shadow
                                numberOfLines={1}
                                paddingBottom={10}
                            >
                                {LANG.getTranslation('recommendedchannels')} (
                                {channels.length})
                            </Text>
                            <FlatList
                                style={{ marginLeft: -10 }}
                                data={channels}
                                horizontal={true}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderChannel}
                            />
                        </View>
                    )}
                    {movies != undefined && movies.length > 0 && (
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
                                style={{ marginLeft: -10 }}
                                data={movies}
                                horizontal={true}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderMovie}
                            />
                        </View>
                    )}
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
        // ...StyleSheet.absoluteFillObject,
        //resizeMode: 'cover',
        borderRadius: 5,
        backgroundColor: '#000',
        borderColor: '#222',
        borderWidth: 4,
    },
});
