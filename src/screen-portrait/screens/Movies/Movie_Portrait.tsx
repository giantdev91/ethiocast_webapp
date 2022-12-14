import React, { ReactElement, useState, useEffect, useRef } from 'react';
import {
    Animated,
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    ActivityIndicator,
    BackHandler,
    TVMenuControl,
    Platform,
    ScrollView,
} from 'react-native';
import { Block, Text, ScaledImage } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Modal } from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import StarRating from 'react-native-star-rating';
import { sendPageReport, sendActionReport } from '../../../reporting/reporting';
import { CommonActions } from '@react-navigation/native';
import { useNavigationState } from '@react-navigation/core';
export interface Descriptions {
    language?: string;
    description?: string;
}
export interface Streams {
    id: number;
    akamai_token?: boolean;
    flussonic_token?: boolean;
    language?: string;
    secure_stream?: boolean;
    srt_url?: string;
    url?: string;
}
export interface Prices {
    amount?: string;
    credits?: string;
    currency?: string;
}
export interface Rule {
    id?: Number;
    name?: string;
    quantity?: string;
    type?: string;
}
export interface Movie {
    id: number | string;
    name?: string;
    poster?: string;
    backdrop?: string;
    moviedescriptions?: Descriptions[];
    moviestreams?: Streams[];
    movieprices?: Prices[];
    rule_payperview?: Rule;
    year?: string;
    language?: string;
    length?: string;
    actors?: string;
    imdb_rating?: string;
    tags?: [];
    trailer_url?: string;
    vast?: string;
    has_drm?: boolean;
    has_overlaybanner?: number;
    has_preroll?: number;
    has_ticker?: number;
    logo?: string;
}

export default ({ navigation, route }): React.ReactElement => {
    const offset = useRef(new Animated.Value(0)).current;
    const routes = useNavigationState(state => state.routes);
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [movie, setMovie] = useState<Movie>();
    const [progress, setProgress] = useState(0);
    const [favorite, setFavorite] = useState(false);
    const [rented, setRented] = useState(false);
    const [payperview, setPayPerView] = useState(false);
    const [price, setPrice] = useState('');
    const [rule, setRule] = useState('');
    const [loaded, setLoaded] = useState(false);

    const [showRentingModal, setShowRentingModal] = useState(false);
    const [showRentingSuccessModal, setShowRentingSuccessModal] =
        useState(false);
    const [errorRenting, setErrorRenting] = useState('');
    const [rentingDetails, setRentingDetails] = useState('');

    var sizes = SIZES.getSizing();

    const HEADER_HEIGHT = sizes.width * 0.75;
    const WIDTH = sizes.width * 0.45;
    const MARGINTOP = 75;

    useEffect(() => {
        return () =>
            sendPageReport('Movie Details', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        setLoaded(false);
        if (route.params?.movie_id != undefined) {
            (async () => {
                let res = await getMovie(route.params?.movie_id);
                if (res.success) {
                    var movie_ = res.movie;
                    setRented(false);
                    setMovie(movie_);
                    setLoaded(true);
                } else {
                    navigation.goBack();
                }
            })();
        }
    }, [route.params?.movie_id]);

    useEffect(() => {
        const backAction = () => {
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.navigate({
                    name: 'Home',
                });
            }
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        if (movie != undefined) {
            var progress = getProgress();
            if (progress != Infinity && progress != null) {
                setProgress(progress);
            }

            var favorite = getFavorite(movie.id);
            setFavorite(favorite);

            var payperview = getPayPerView(movie);
            if (payperview) {
                setPayPerView(payperview);
                var rented = getPurchased(movie);
                setRented(rented);
                if (rented == true) {
                    var rentedDetails = getRentedDetails();
                    setRentingDetails(rentedDetails);
                }
                var price = getMoviePrice(movie);
                setPrice(price);
                setRule(movie.rule_payperview.name);
            } else {
                setPayPerView(false);
                setRented(false);
                setPrice('');
                setRule('');
            }
        }
    }, [movie]);
    const AnimatedHeader = ({ animatedValue }) => {
        const headerHeight = animatedValue.interpolate({
            inputRange: [0, HEADER_HEIGHT],
            outputRange: [HEADER_HEIGHT, 0],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    height: 60,
                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                }}>
                <View
                    style={{
                        width: sizes.width,
                        flexDirection: 'row',
                        position: 'absolute',
                        zIndex: 9999,
                    }}>
                    <View style={{ flex: 1 }}>
                        <View
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.50)',
                                borderRadius: 100,
                                width: 40,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: 10,
                            }}>
                            <FocusButton
                                style={{ borderRadius: 100 }}
                                onPress={() => onPressBack()}>
                                <FontAwesome5
                                    style={{ fontSize: 18, color: '#fff' }}
                                    // icon={SolidIcons.arrowLeft}
                                    name="arrow-left"
                                />
                            </FocusButton>
                        </View>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'flex-end',
                            flexDirection: 'row',
                            marginRight: 10,
                        }}>
                        {GLOBAL.UserInterface.player.enable_casting == true &&
                            (Platform.OS == 'android' ||
                                Platform.OS == 'ios') && (
                                <View
                                    style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.50)',
                                        borderRadius: 100,
                                        width: 40,
                                        height: 40,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginTop: 10,
                                    }}>
                                    {RenderIf(
                                        GLOBAL.Device_System == 'Android' &&
                                        GLOBAL.Device_FormFactor !=
                                        'TOUCHPANEL',
                                    )(
                                        <CastButton
                                            style={{
                                                width: 35,
                                                height: 35,
                                                tintColor: 'white',
                                                fontSize: 25,
                                                padding: 0,
                                            }}
                                        />,
                                    )}
                                    {RenderIf(GLOBAL.Device_System == 'Apple')(
                                        <CastButton
                                            activeTintColor="green"
                                            tintColor="white"
                                            style={{ width: 35, height: 35 }}
                                        />,
                                    )}
                                    {RenderIf(
                                        GLOBAL.Device_System == 'Android' &&
                                        GLOBAL.Device_FormFactor !=
                                        'TOUCHPANEL',
                                    )(
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 11,
                                                left: 10,
                                                opacity: 0.3,
                                            }}>
                                            <Image
                                                source={require('../../../images/chromecast.png')}
                                                style={{ width: 20, height: 18 }}
                                            />
                                        </View>,
                                    )}
                                </View>
                            )}
                        <View
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.50)',
                                borderRadius: 100,
                                width: 40,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginVertical: 10,
                            }}>
                            {GLOBAL.UserInterface.general
                                .enable_favourites_menu == true && (
                                    <FocusButton
                                        style={{ borderRadius: 100 }}
                                        onPress={() => onToggleFavorite()}>
                                        <FontAwesome
                                            style={{ fontSize: 18, color: '#fff' }}
                                            // icon={
                                            //     favorite
                                            //         ? SolidIcons.heart
                                            //         : RegularIcons.heart
                                            // }
                                            name={favorite ? "heart" : "heart-o"}
                                        />
                                    </FocusButton>
                                )}
                        </View>
                    </View>
                </View>
                <View style={{ alignItems: 'center', marginTop: MARGINTOP }}>
                    <Animated.Image
                        source={{ uri: GLOBAL.ImageUrlCMS + movie?.poster }}
                        style={{
                            position: 'absolute',
                            width: WIDTH,
                            height: headerHeight,
                        }}
                    />
                </View>
            </Animated.View>
        );
    };
    const onRentMovie = () => {
        setShowRentingModal(true);
        DAL.validatePayPerView(
            'Movies',
            movie.id,
            price,
            movie.name,
            GLOBAL.Payment_Method,
            GLOBAL.ImageUrlCMS + movie.backdrop,
            GLOBAL.ImageUrlCMS + movie.poster,
        ).then(data => {
            if (data == true) {
                var rented = {
                    start: moment().format('YYYY-MM-DDTHH:MM:00'),
                    image: GLOBAL.ImageUrlCMS + movie.poster,
                    backdrop_image: GLOBAL.ImageUrlCMS + movie.backdrop,
                    movie_id: movie.id,
                    name: movie.name,
                    payment_type: 'api',
                    price: price,
                    end: moment().add(1, 'days').format('YYYY-MM-DDTHH:MM:00'),
                };
                GLOBAL.Rented_Movies.push(rented);
                setShowRentingModal(false);
                setShowRentingSuccessModal(true);
                setRented(true);
                var rentedDetails = getRentedDetails();
                setRentingDetails(rentedDetails);
            } else {
                setErrorRenting(LANG.getTranslation('content_fail'));
            }
        });
    };
    const getRentedDetails = () => {
        var rented = GLOBAL.Rented_Movies.find(m => m.movie_id == movie.id);
        if (rented != undefined) {
            var a = moment(rented.end).format('LL');
            return LANG.getTranslation('youcanwatchthiscontenttill') + '\n' + a;
        } else {
            return '';
        }
    };
    const getMoviePrice = movie => {
        var price = movie.movieprices.find(
            p => p.currency == GLOBAL.User_Currency,
        );
        if (price != undefined) {
            return GLOBAL.Payment_Method == 'Wallet'
                ? price.credits
                : price.amount;
        } else {
            return '0';
        }
    };
    const getPayPerView = movie => {
        if (movie != undefined) {
            var check = movie.rule_payperview.name;
            if (check == '' || check == null) {
                return false;
            } else {
                var price = movie.movieprices.find(
                    p => p.currency == GLOBAL.User_Currency,
                );
                if (price != undefined) {
                    if (price.amount == 0 && GLOBAL.Payment_Method == 'api') {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        }
    };
    const getPurchased = movie => {
        var check = GLOBAL.Rented_Movies.filter(r => r.movie_id == movie.id);
        if (check != undefined && check.length > 0) {
            var movie_end_time = moment(check[0].end).unix();
            var current_time = moment().unix();
            if (movie_end_time > current_time) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    const getFavorite = id => {
        var isMovieFavorite = GLOBAL.Favorite_Movies.find(function (element) {
            return element.id == id;
        });
        if (isMovieFavorite != undefined) {
            return true;
        } else {
            return false;
        }
    };
    const getProgress = () => {
        if (movie != undefined) {
            var isMoviesStored = UTILS.getProfile(
                'movie_progress',
                movie.id,
                0,
            );
            var position = 0;
            if (isMoviesStored != null) {
                var percentageVideo =
                    isMoviesStored.position / isMoviesStored.total;
                position = percentageVideo;
            }
            return position;
        } else {
            return 0;
        }
    };
    const getMovie = async movie_id => {
        try {
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                movie_id +
                '_movie_details_v2.json';
            console.log('get movie: ', path);
            let response = await fetch(path);
            let data = await response.json();
            console.log('get movie response: ', data);
            return { success: true, movie: data };
        } catch (error) {
            return { success: false };
        }
    };
    const getTags = () => {
        var tags_ = '';
        movie?.tags?.forEach(element => {
            tags_ = tags_ + element + ' / ';
        });
        if (tags_.length > 0) {
            tags_ = tags_.substring(0, tags_.length - 2);
        }
        return <Text>{tags_}</Text>;
    };
    const renderTags = tag => {
        if (GLOBAL.Tags.find(t => t.tag == tag.item) != undefined) {
            var movies = GLOBAL.Tags.find(t => t.tag == tag.item).movies;
            if (movies != undefined) {
                return (
                    <View style={{ flex: 1, paddingBottom: 20 }}>
                        <Text
                            h5
                            bold
                            paddingLeft={10}
                            paddingBottom={5}
                            paddingTop={20}>
                            {LANG.getTranslation('more')} {tag.item}:
                        </Text>
                        <View style={{ flex: 1, paddingLeft: 10 }}>
                            <FlatList
                                data={movies}
                                horizontal={true}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderMovie}
                            />
                        </View>
                    </View>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    };
    const onPlayMovie = (item, type) => {
        setShowRentingSuccessModal(false);
        setShowRentingModal(false);
        var getProgress = UTILS.getProfile('movie_progress', movie.id, 0);
        var position = 0;
        var percentageVideo = 0;
        if (getProgress != null) {
            if (getProgress.total > 0) {
                percentageVideo =
                    (getProgress.position / getProgress.total) * 100;
                if (percentageVideo < 95) {
                    position = getProgress.position;
                }
            }
        }

        navigation.navigate({
            name: 'Player_Movies',
            params: {
                movie: movie,
                type: type,
                movies:
                    route.params?.movies != undefined
                        ? route.params?.movies
                        : [],
                position: position,
            },
            merge: true,
        });
    };
    const renderMovie = item => {
        return (
            <FocusButton
                style={{
                    borderRadius: 5,
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.32
                        : sizes.width * 0.16,
                }}
                onPress={() => onOpenMovieDetails(item)}>
                <View style={{ flex: 1 }}>
                    <Image
                        source={{ uri: item.item.image }}
                        style={[
                            {
                                borderColor: '#222',
                                borderWidth: 4,
                                borderRadius: 5,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.31
                                    : sizes.width * 0.1585,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.31 * 1.585
                                    : sizes.width * 0.15 * 1.585,
                            },
                        ]}></Image>
                    <Text
                        bold
                        shadow
                        numberOfLines={1}
                        style={{
                            marginTop: 5,
                            marginLeft: 5,
                            width: sizes.width * 0.3 - 10,
                        }}>
                        {item.item.name}
                    </Text>
                </View>
            </FocusButton>
        );
    };
    const onOpenMovieDetails = item => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    {
                        name: 'Movie',
                        params: {
                            movie_id: item.item.id,
                        },
                    },
                ],
            }),
        );
    };
    const onPressBack = () => {
        if (routes.length > 1) {
            navigation.goBack();
        } else {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        {
                            name: 'Home',
                        },
                    ],
                }),
            );
        }
    };
    const onToggleFavorite = () => {
        var isMovieFavorite = GLOBAL.Favorite_Movies.find(function (element) {
            return element.id == movie.id;
        });
        if (isMovieFavorite != undefined) {
            sendActionReport(
                'Remove Favorite',
                'Movie Details',
                moment().unix(),
                movie.name,
            );
            var newMovies = GLOBAL.Favorite_Movies.filter(
                c => c.id != isMovieFavorite.id,
            );
            GLOBAL.Favorite_Movies = newMovies;
            setFavorite(false);
            UTILS.storeProfile(
                'movie_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Movies,
                '',
            );
        } else {
            sendActionReport(
                'Add Favorite',
                'Movie Details',
                moment().unix(),
                movie.name,
            );
            var movie_ = {
                poster: movie?.poster,
                name: movie?.name,
                year: movie?.year,
                id: movie.id,
            };
            GLOBAL.Favorite_Movies.push(movie_);
            setFavorite(true);
            UTILS.storeProfile(
                'movie_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Movies,
                '',
            );
        }
    };
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#000',
                paddingTop:
                    GLOBAL.App_Theme == 'Akua' &&
                        (GLOBAL.Device_Tablet || GLOBAL.Device_IsPhone)
                        ? 25
                        : 0,
            }}>
            {loaded ? (
                <ImageBackground
                    blurRadius={10}
                    source={{
                        uri:
                            movie?.poster == '001.png'
                                ? GLOBAL.Background
                                : GLOBAL.ImageUrlCMS + movie?.poster,
                    }}
                    style={{ flex: 1, width: null, height: null }}
                    imageStyle={{ resizeMode: 'cover' }}>
                    <View
                        style={{
                            flex: 1,
                            width: sizes.width,
                            alignContent: 'center',
                            justifyContent: 'center',
                        }}>
                        <View style={{ flex: 1, width: sizes.width }}>
                            <Modal
                                style={{
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.8
                                        : sizes.width * 0.3,
                                }}
                                visible={showRentingModal}
                                backdropStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.60)',
                                }}>
                                <Card disabled={true}>
                                    <Text h5 bold>
                                        {LANG.getTranslation('rent_movie')}
                                    </Text>
                                    <Text>
                                        {movie != undefined ? movie.name : ''}
                                    </Text>
                                    <Text
                                        color={'red'}
                                        style={{ color: 'red' }}
                                        status="basic">
                                        {errorRenting}
                                    </Text>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            margin: 20,
                                        }}>
                                        {errorRenting == '' && (
                                            <ActivityIndicator
                                                size={'large'}
                                                color={
                                                    '#fff'
                                                }></ActivityIndicator>
                                        )}
                                    </View>
                                </Card>
                            </Modal>
                            <Modal
                                style={{
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.8
                                        : sizes.width * 0.3,
                                }}
                                visible={showRentingSuccessModal}
                                onBackdropPress={() =>
                                    setShowRentingSuccessModal(false)
                                }
                                backdropStyle={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.60)',
                                }}>
                                <Card disabled={true}>
                                    <Text h5 bold>
                                        {LANG.getTranslation('rent_movie')}
                                    </Text>
                                    <Text>
                                        {movie != undefined ? movie.name : ''}
                                    </Text>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            margin: 20,
                                            alignItems: 'center',
                                        }}>
                                        <FontAwesome5
                                            style={{
                                                fontSize: 50,
                                                color: 'green',
                                                padding: 10,
                                            }}
                                            // icon={SolidIcons.check}
                                            name="check"
                                        />
                                    </View>
                                    <Button
                                        size="giant"
                                        onPress={() =>
                                            onPlayMovie(movie, 'movie')
                                        }>
                                        {LANG.getTranslation('play_movie')}
                                    </Button>
                                </Card>
                            </Modal>

                            <LinearGradient
                                colors={['rgba(0, 0, 0, 0.0)', '#000']}
                                style={{
                                    flex: 1,
                                    width: sizes.width,
                                    height: '100%',
                                }}
                                start={{ x: 0.5, y: 0 }}>
                                <AnimatedHeader animatedValue={offset} />
                                <ScrollView
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                    }}
                                    contentContainerStyle={{
                                        alignItems: 'center',
                                        paddingTop: HEADER_HEIGHT + 75,
                                        paddingHorizontal: 0,
                                    }}
                                    showsVerticalScrollIndicator={false}
                                    scrollEventThrottle={16}
                                    onScroll={Animated.event(
                                        [
                                            {
                                                nativeEvent: {
                                                    contentOffset: { y: offset },
                                                },
                                            },
                                        ],
                                        { useNativeDriver: false },
                                    )}>
                                    <View style={{ flex: 1.5, marginTop: 20 }}>
                                        <View
                                            style={{
                                                flex: 2,
                                                flexDirection: 'column',
                                                alignSelf: 'center',
                                                width: sizes.width,
                                            }}>
                                            <FlatList
                                                ListHeaderComponent={
                                                    <View
                                                        style={{
                                                            marginLeft: 20,
                                                        }}>
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'row',
                                                            }}>
                                                            <StarRating
                                                                starStyle={{
                                                                    margin: 2,
                                                                }}
                                                                fullStarColor={
                                                                    '#fec205'
                                                                }
                                                                disabled={true}
                                                                maxStars={5}
                                                                rating={
                                                                    Number(
                                                                        movie?.imdb_rating,
                                                                    ) / 2
                                                                }
                                                                value={0}
                                                                starSize={15}
                                                            />
                                                        </View>
                                                        {movie.logo == null && (
                                                            <Text h4>
                                                                {movie?.name}
                                                            </Text>
                                                        )}
                                                        {movie.logo !=
                                                            undefined &&
                                                            movie.logo !=
                                                            null && (
                                                                <ScaledImage
                                                                    uri={
                                                                        GLOBAL.ImageUrlCMS +
                                                                        movie.logo
                                                                    }
                                                                    width={
                                                                        sizes.width *
                                                                        0.6
                                                                    }
                                                                    style={{
                                                                        marginVertical: 5,
                                                                    }}
                                                                />
                                                            )}
                                                        {progress > 0 &&
                                                            !isNaN(
                                                                progress,
                                                            ) && (
                                                                <View>
                                                                    <View
                                                                        style={{
                                                                            marginVertical: 5,
                                                                            borderTopWidth: 2,
                                                                            borderTopColor:
                                                                                '#fff',
                                                                            width:
                                                                                sizes.width *
                                                                                0.88 *
                                                                                progress,
                                                                        }}></View>
                                                                    <Text
                                                                        size={
                                                                            10
                                                                        }
                                                                        style={{
                                                                            position:
                                                                                'absolute',
                                                                            zIndex: 9999,
                                                                            top: -5,
                                                                            left:
                                                                                10 +
                                                                                sizes.width *
                                                                                0.88 *
                                                                                progress,
                                                                        }}>
                                                                        {Math.round(
                                                                            progress *
                                                                            100,
                                                                        )}
                                                                        %
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'row',
                                                                marginTop: 15,
                                                            }}>
                                                            <View
                                                                style={{
                                                                    marginRight: 15,
                                                                }}>
                                                                <Text bold>
                                                                    {LANG.getTranslation(
                                                                        'year',
                                                                    )}
                                                                    :{' '}
                                                                    {
                                                                        movie?.year
                                                                    }
                                                                </Text>
                                                            </View>
                                                            <View
                                                                style={{
                                                                    marginRight: 15,
                                                                }}>
                                                                <Text bold>
                                                                    {LANG.getTranslation(
                                                                        'language',
                                                                    )}
                                                                    :{' '}
                                                                    {
                                                                        movie?.language
                                                                    }
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={{}}>
                                                            <Text bold>
                                                                {movie?.length}{' '}
                                                                {LANG.getTranslation(
                                                                    'min',
                                                                )}
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={{
                                                                marginBottom: 20,
                                                            }}>
                                                            {getTags()}
                                                        </View>
                                                        {movie?.moviedescriptions?.find(
                                                            d =>
                                                                d.language ==
                                                                LANG.getEnglishLanguageName(
                                                                    GLOBAL.Selected_Language,
                                                                ),
                                                        ) != undefined && (
                                                                <Text
                                                                    style={{
                                                                        marginRight: 15,
                                                                    }}>
                                                                    {
                                                                        movie?.moviedescriptions?.find(
                                                                            d =>
                                                                                d.language ==
                                                                                LANG.getEnglishLanguageName(
                                                                                    GLOBAL.Selected_Language,
                                                                                ),
                                                                        )
                                                                            .description
                                                                    }
                                                                </Text>
                                                            )}
                                                        {movie?.moviedescriptions?.find(
                                                            d =>
                                                                d.language ==
                                                                LANG.getEnglishLanguageName(
                                                                    GLOBAL.Selected_Language,
                                                                ),
                                                        ) == undefined && (
                                                                <Text
                                                                    style={{
                                                                        marginRight: 15,
                                                                    }}>
                                                                    {
                                                                        movie
                                                                            ?.moviedescriptions[0]
                                                                            .description
                                                                    }
                                                                </Text>
                                                            )}
                                                        <Text
                                                            size={11}
                                                            style={{
                                                                marginTop: 10,
                                                                marginBottom: 10,
                                                            }}>
                                                            {movie?.actors}
                                                        </Text>
                                                        {rented && (
                                                            <View
                                                                style={{
                                                                    width: GLOBAL.Device_IsPortrait
                                                                        ? sizes.width *
                                                                        0.91
                                                                        : sizes.width *
                                                                        0.2,
                                                                    marginBottom: 20,
                                                                }}>
                                                                <View
                                                                    style={{
                                                                        backgroundColor:
                                                                            'green',
                                                                        padding: 10,
                                                                        justifyContent:
                                                                            'center',
                                                                        borderRadius: 5,
                                                                        alignItems:
                                                                            'center',
                                                                    }}>
                                                                    <Text
                                                                        center>
                                                                        {
                                                                            rentingDetails
                                                                        }
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        )}
                                                        {!rented && (
                                                            <Text>{rule}</Text>
                                                        )}
                                                        {!rented && (
                                                            <Text bold>
                                                                {price}
                                                            </Text>
                                                        )}
                                                        <View
                                                            style={{
                                                                flexDirection:
                                                                    'row',
                                                                marginBottom: 20,
                                                                marginTop:
                                                                    !rented &&
                                                                        rule != ''
                                                                        ? 20
                                                                        : 0,
                                                            }}>
                                                            {movie?.trailer_url !=
                                                                ''}
                                                            {
                                                                <Button
                                                                    style={{
                                                                        marginRight: 5,
                                                                    }}
                                                                    size="giant"
                                                                    onPress={() =>
                                                                        onPlayMovie(
                                                                            movie,
                                                                            'trailer',
                                                                        )
                                                                    }>
                                                                    {LANG.getTranslation(
                                                                        'play_trailer',
                                                                    )}
                                                                </Button>
                                                            }
                                                            {!payperview && (
                                                                <Button
                                                                    size="giant"
                                                                    onPress={() =>
                                                                        onPlayMovie(
                                                                            movie,
                                                                            'movie',
                                                                        )
                                                                    }>
                                                                    {LANG.getTranslation(
                                                                        'play_movie',
                                                                    )}
                                                                </Button>
                                                            )}
                                                            {payperview &&
                                                                !rented && (
                                                                    <Button
                                                                        size="giant"
                                                                        onPress={() =>
                                                                            onRentMovie()
                                                                        }>
                                                                        {LANG.getTranslation(
                                                                            'rent_movie',
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            {payperview &&
                                                                rented && (
                                                                    <Button
                                                                        size="giant"
                                                                        onPress={() =>
                                                                            onPlayMovie(
                                                                                movie,
                                                                                'movie',
                                                                            )
                                                                        }>
                                                                        {LANG.getTranslation(
                                                                            'play_movie',
                                                                        )}
                                                                    </Button>
                                                                )}
                                                        </View>
                                                    </View>
                                                }
                                                data={movie?.tags}
                                                numColumns={1}
                                                horizontal={false}
                                                contentContainerStyle={{
                                                    flex: 1,
                                                }}
                                                removeClippedSubviews={true}
                                                keyExtractor={(item, index) =>
                                                    index.toString()
                                                }
                                                onScrollToIndexFailed={() => { }}
                                                renderItem={renderTags}
                                            />
                                        </View>
                                    </View>
                                </ScrollView>
                            </LinearGradient>
                        </View>
                    </View>
                </ImageBackground>
            ) : (
                <View
                    style={{
                        flex: 1,
                        height: sizes.height,
                        justifyContent: 'center',
                    }}>
                    <ActivityIndicator size={'large'} color={'white'} />
                </View>
            )}
        </View>
    );
};
