import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { OverflowMenu, MenuItem, Button } from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import StarRating from 'react-native-star-rating';
import { sendPageReport, sendActionReport } from '../../../reporting/reporting';

export interface Descriptions {
    language?: string;
    //description?: string;
}
export interface Episodes {
    name?: string;
    description?: string;
    episode_number?: string;
    season_number?: string;
}
export interface Season {
    vod_id: number | string;
    name?: string;
    poster?: string;
    backdrop?: string;
    imdb_rating?: string;
    year?: string;
    langauge?: string;
    actors?: string;
    descriptions?: Descriptions[];
    episodes?: Episodes[];
    tags?: [];
    id?: number;
}
export interface Series {
    id: number | string;
    name?: string;
    poster?: string;
    backdrop?: string;
    imdb_rating?: string;
    season?: Season[];
}

export default ({ navigation, route }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [series, setSeries] = useState<Series>();
    const [season, setSeason] = useState<Season>();
    const [columns, setColumns] = useState(GLOBAL.Device_IsPortrait ? 1 : 3);
    const [seasons, setSeasons] = useState([]);
    const [seasonIndex, setSeasonIndex] = useState(0);
    const [selectedSeasonName, setSelectedSeasonName] = useState('');
    const [seasonVisible, setSeasonVisible] = useState(false);
    const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(null);
    const [favorite, setFavorite] = useState(false);
    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Season Details', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (route.params?.series != undefined) {
            var series = route.params?.series;
            setSeries(series);
            if (series.season.length > 0) {
                setSeasonIndex(0);
                setSeason(series.season[seasonIndex]);
                setSeasons(series.season);
                setSelectedSeasonName(series.season[seasonIndex].name);
                var favorite = getFavorite(series.season[seasonIndex].id);
                setFavorite(favorite);
            }
        } else if (route.params?.season_id != undefined) {
            var season_id = route.params?.season_id;
            var success = false;
            var season_index = 0;
            var series;
            var seasons;
            var season;
            GLOBAL.SeriesStores.some(stores_ => {
                var series_ = stores_.series;
                series_.some(serie_ => {
                    if (serie_.season != undefined) {
                        var season_ = serie_.season.find(
                            s => s.id == season_id,
                        );
                        if (season_ != undefined && success == false) {
                            success = true;
                            season = season_;
                            seasons = serie_.season;
                            series = serie_;
                            season_index = serie_.season.findIndex(
                                s => s.id == season_id,
                            );
                        }
                    }
                });
            });
            setSeries(series);
            setSeasonIndex(season_index);
            setSeason(season);
            setSeasons(seasons);
            setSelectedSeasonName(season.name);
            var favorite = getFavorite(season.id);
            setFavorite(favorite);
        } else {
            navigation.goBack();
        }
    }, []);
    useEffect(() => {
        const backAction = () => {
            var storesIn = GLOBAL.SeriesStores;
            if (storesIn.length == 1) {
                navigation.navigate({
                    name: 'Home',
                    merge: true,
                });
            } else {
                navigation.goBack();
            }
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        return () => backHandler.remove();
    }, []);
    const getFavorite = id => {
        var isFavorite = GLOBAL.Favorite_Series.find(function (element) {
            return element.id == id;
        });
        if (isFavorite != undefined) {
            return true;
        } else {
            return false;
        }
    };
    const onPressBack = () => {
        var storesIn = GLOBAL.SeriesStores;
        if (storesIn.length == 1) {
            navigation.navigate({
                name: 'Home',
                merge: true,
            });
        } else {
            navigation.goBack();
        }
    };
    const onToggleFavorite = () => {
        var isFavorite = GLOBAL.Favorite_Series.find(function (element) {
            return element.id == season.id;
        });
        if (isFavorite != undefined) {
            sendActionReport(
                'Remove Favorite',
                'Season',
                moment().unix(),
                season.name,
            );
            var newSeries = GLOBAL.Favorite_Series.filter(
                c => c.id != isFavorite.id,
            );
            GLOBAL.Favorite_Series = newSeries;
            setFavorite(false);
            UTILS.storeProfile(
                'series_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Series,
                '',
            );
        } else {
            sendActionReport(
                'Add Favorite',
                'Season',
                moment().unix(),
                season.name,
            );
            var series_ = {
                poster: season?.poster,
                backdrop: season?.backdrop,
                name: season?.name,
                id: season.id,
            };
            GLOBAL.Favorite_Series.push(series_);
            setFavorite(true);
            UTILS.storeProfile(
                'series_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Series,
                '',
            );
        }
    };
    const getTags = () => {
        var tags_ = '';
        season?.tags?.forEach(element => {
            tags_ = tags_ + element + ' / ';
        });
        if (tags_.length > 0) {
            tags_ = tags_.substring(0, tags_.length - 2);
        }
        return <Text>{tags_}</Text>;
    };
    const getProgress = index => {
        var getProgress = UTILS.getProfile('series_progress', season.id, index);
        var position = 0;
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo;
        }
        return position;
    };
    const onPlayEpisode = (item, index) => {
        var getProgress = UTILS.getProfile('series_progress', season.id, index);
        var position = 0;
        var percentageVideo = 0;
        if (getProgress != null) {
            percentageVideo = (getProgress.position / getProgress.total) * 100;
            if (percentageVideo < 95) {
                position = getProgress.position;
            }
        }
        navigation.navigate({
            name: 'Player_Series',
            params: {
                episode: item,
                index: index,
                season: season,
                series: series,
                season_index: seasonIndex,
                position: position,
            },
            merge: true,
        });
    };
    const getEpisode = () => {
        if (series != undefined) {
            var lastWatched = UTILS.getProfile('series_watching', series.id);
            if (lastWatched != undefined) {
                var season_ = series.season.find(
                    s => s.id == lastWatched.season_id,
                );
                var episode = season_.episodes[lastWatched.index];
                return (
                    'SE' +
                    episode.season_number +
                    ' ' +
                    'EP' +
                    episode.episode_number
                );
            } else {
                return 'SE' + 1 + ' EP' + 1;
            }
        }
    };
    const onPlayEpisodeContinue = item => {
        var lastWatched = UTILS.getProfile('series_watching', series.id);
        if (lastWatched != undefined) {
            var seasonIndex_ = series.season.findIndex(
                s => s.id == lastWatched.season_id,
            );
            var season_ = series.season.find(
                s => s.id == lastWatched.season_id,
            );
            var episode = season_.episodes[lastWatched.index];
            navigation.navigate({
                name: 'Player_Series',
                params: {
                    episode: episode,
                    index: lastWatched.index,
                    season: season_,
                    series: series,
                    season_index: seasonIndex_,
                    position: lastWatched.position,
                },
                merge: true,
            });
        } else {
            navigation.navigate({
                name: 'Player_Series',
                params: {
                    episode: season.episodes[0],
                    index: 0,
                    season: season,
                    series: series,
                    season_index: 0,
                    position: 0,
                },
                merge: true,
            });
        }
    };
    const renderEpisode = ({ item, index }) => {
        var progress = getProgress(index);
        if (GLOBAL.UserInterface.series.enable_episodes_full_metadata == true) {
            return (
                <FocusButton
                    style={{
                        width: GLOBAL.Device_IsPortrait
                            ? sizes.width * 1
                            : sizes.width * 0.333,
                        padding: 5,
                    }}
                    onPress={() => onPlayEpisode(item, index)}
                >
                    <View
                        style={{
                            borderRadius: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            justifyContent: 'center',
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: '#000',
                                height:
                                    (GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.96
                                        : sizes.width * 0.305) * 0.56,
                            }}
                        >
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.image }}
                                style={[
                                    {
                                        borderTopLeftRadius: 2,
                                        borderTopRightRadius: 2,
                                        width: GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.96
                                            : sizes.width * 0.32,
                                        height:
                                            (GLOBAL.Device_IsPortrait
                                                ? sizes.width * 0.96
                                                : sizes.width * 0.305) * 0.56,
                                    },
                                ]}
                            ></Image>
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 99999,
                                    height:
                                        (GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.96
                                            : sizes.width * 0.305) * 0.56,
                                    width: '100%',
                                }}
                            >
                                <FontAwesome5
                                    style={{
                                        color: '#fff',
                                        fontSize: 45,
                                        opacity: 0.8,
                                        textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                        textShadowOffset: {
                                            width: -1,
                                            height: 1,
                                        },
                                        textShadowRadius: 10,
                                    }}
                                    // icon={RegularIcons.playCircle}
                                    name="play-circle"
                                />
                            </View>

                            <View
                                style={{
                                    position: 'absolute',
                                    top:
                                        (GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.9
                                            : sizes.width * 0.28) * 0.35,
                                    paddingHorizontal: 20,
                                    padding: 20,
                                    left: 0,
                                }}
                            >
                                <Text h5 shadow numberOfLines={1}>
                                    {LANG.getTranslation('season')}{' '}
                                    {item.season_number}
                                </Text>
                                <Text shadow numberOfLines={1}>
                                    {LANG.getTranslation('episode')}{' '}
                                    {item.episode_number}
                                </Text>
                            </View>
                        </View>
                        <View style={{ margin: 15, marginTop: 20 }}>
                            <Text h5 bold shadow numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                {!isNaN(progress) && (
                                    <View
                                        style={{
                                            marginVertical: 2,
                                            marginBottom: 10,
                                            borderTopWidth: 3,
                                            borderTopColor: '#999',
                                            width:
                                                (GLOBAL.Device_IsPortrait
                                                    ? sizes.width * 0.8
                                                    : sizes.width * 0.18) *
                                                progress,
                                        }}
                                    ></View>
                                )}
                            </View>
                            <Text shadow numberOfLines={3}>
                                {item.description}
                            </Text>
                            <Text
                                size={11}
                                style={{ marginTop: 10, marginBottom: 20 }}
                            >
                                {season?.actors}
                            </Text>
                        </View>
                    </View>
                </FocusButton>
            );
        } else {
            return (
                <FocusButton
                    style={{ margin: 5, width: sizes.width / columns - 30 }}
                    onPress={() => onPlayEpisode(item, index)}
                >
                    <View
                        style={{
                            borderRadius: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            justifyContent: 'center',
                            padding: 10,
                            paddingLeft: 20,
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <Text bold shadow numberOfLines={1}>
                            {index + 1}. {item.name}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <View
                                style={{
                                    marginVertical: 2,
                                    marginBottom: 0,
                                    borderTopWidth: 3,
                                    borderTopColor: '#999',
                                    width: sizes.width * 0.275 * progress,
                                }}
                            ></View>
                        </View>
                    </View>
                </FocusButton>
            );
        }
    };
    const renderSeasonButton = () => (
        <Button onPress={() => setSeasonVisible(true)}>
            {selectedSeasonName}
        </Button>
    );
    const onItemSelectSeason = item => {
        var season = seasons[item.row];
        setSeasonIndex(item.row);
        setSeason(season);
        setSelectedSeasonName(season.name);
        setSeasonVisible(false);
    };
    const renderSeasonItem = (season, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={season.name}
        />
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <Block
                flex={1}
                width={sizes.width}
                align="center"
                justify="center"
                color={'transparent'}
            >
                {season != undefined ? (
                    <View style={{ flex: 1, width: sizes.width }}>
                        <ImageBackground
                            source={{
                                uri: GLOBAL.ImageUrlCMS + season?.backdrop,
                            }}
                            style={{
                                flex: 1,
                                width: sizes.width * 1.2,
                                height: sizes.width * 1.2 * 0.56,
                            }}
                            imageStyle={{ resizeMode: 'cover' }}
                        >
                            <LinearGradient
                                colors={['rgba(0, 0, 0, 0.2)', '#000']}
                                style={{
                                    flex: 1,
                                    width: sizes.width,
                                    height: '100%',
                                }}
                                start={{ x: 0.5, y: 0 }}
                            >
                                <ScrollView style={{ flex: 1.5 }}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.50)',
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <View
                                                style={{
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.50)',
                                                    borderRadius: 100,
                                                    width: 40,
                                                    height: 40,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    margin: 10,
                                                }}
                                            >
                                                <FocusButton
                                                    style={{ borderRadius: 100 }}
                                                    onPress={() =>
                                                        onPressBack()
                                                    }
                                                >
                                                    <FontAwesome5
                                                        style={{
                                                            fontSize: 18,
                                                            color: '#fff',
                                                        }}
                                                        // icon={
                                                        //     SolidIcons.arrowLeft
                                                        // }
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
                                            }}
                                        >
                                            {GLOBAL.UserInterface.player
                                                .enable_casting == true &&
                                                (Platform.OS == 'android' ||
                                                    Platform.OS == 'ios') && (
                                                    <View
                                                        style={{
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.50)',
                                                            borderRadius: 100,
                                                            width: 40,
                                                            height: 40,
                                                            justifyContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                            marginTop: 10,
                                                        }}
                                                    >
                                                        {RenderIf(
                                                            GLOBAL.Device_System ==
                                                            'Android' &&
                                                            GLOBAL.Device_FormFactor !=
                                                            'TOUCHPANEL',
                                                        )(
                                                            <CastButton
                                                                style={{
                                                                    width: 35,
                                                                    height: 35,
                                                                    tintColor:
                                                                        'white',
                                                                    fontSize: 25,
                                                                    padding: 0,
                                                                }}
                                                            />,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_System ==
                                                            'Apple',
                                                        )(
                                                            <CastButton
                                                                activeTintColor="green"
                                                                tintColor="white"
                                                                style={{
                                                                    width: 35,
                                                                    height: 35,
                                                                }}
                                                            />,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_System ==
                                                            'Android' &&
                                                            GLOBAL.Device_FormFactor !=
                                                            'TOUCHPANEL',
                                                        )(
                                                            <View
                                                                style={{
                                                                    position:
                                                                        'absolute',
                                                                    top: 11,
                                                                    left: 10,
                                                                    opacity: 0.3,
                                                                }}
                                                            >
                                                                <Image
                                                                    source={require('../../../images/chromecast.png')}
                                                                    style={{
                                                                        width: 20,
                                                                        height: 18,
                                                                    }}
                                                                />
                                                            </View>,
                                                        )}
                                                    </View>
                                                )}
                                            <View
                                                style={{
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.50)',
                                                    borderRadius: 100,
                                                    width: 40,
                                                    height: 40,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    margin: 10,
                                                }}
                                            >
                                                {GLOBAL.UserInterface.general
                                                    .enable_favourites_menu ==
                                                    true && (
                                                        <FocusButton
                                                            style={{
                                                                borderRadius: 100,
                                                            }}
                                                            onPress={() =>
                                                                onToggleFavorite()
                                                            }
                                                        >
                                                            <FontAwesome
                                                                style={{
                                                                    fontSize: 18,
                                                                    color: '#fff',
                                                                }}
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
                                    <View
                                        style={{
                                            flex: 2,
                                            flexDirection: 'column',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                paddingTop:
                                                    GLOBAL.Device_IsWebTV
                                                        ? sizes.height * 0.2
                                                        : 20,
                                            }}
                                        >
                                            <View style={{ marginLeft: 20 }}>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <StarRating
                                                        starStyle={{ margin: 2 }}
                                                        fullStarColor={
                                                            '#fec205'
                                                        }
                                                        disabled={true}
                                                        maxStars={5}
                                                        rating={
                                                            Number(
                                                                series?.imdb_rating,
                                                            ) / 2
                                                        }
                                                        value={0}
                                                        starSize={15}
                                                    />
                                                </View>
                                                <Text h2 shadow style={{}}>
                                                    {season?.name}
                                                </Text>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            marginRight: 15,
                                                        }}
                                                    >
                                                        <Text bold>
                                                            {LANG.getTranslation(
                                                                'year',
                                                            )}
                                                            : {season?.year}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={{
                                                            marginRight: 15,
                                                        }}
                                                    >
                                                        <Text bold>
                                                            {LANG.getTranslation(
                                                                'language',
                                                            )}
                                                            : {season?.language}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View
                                                    style={{ marginBottom: 20 }}
                                                >
                                                    {getTags()}
                                                </View>
                                                {season?.descriptions?.find(
                                                    d =>
                                                        d.language ==
                                                        LANG.getEnglishLanguageName(
                                                            GLOBAL.Selected_Language,
                                                        ),
                                                ) != undefined && (
                                                        <Text shadow>
                                                            {
                                                                season?.descriptions?.find(
                                                                    d =>
                                                                        d.language ==
                                                                        LANG.getEnglishLanguageName(
                                                                            GLOBAL.Selected_Language,
                                                                        ),
                                                                ).description
                                                            }
                                                        </Text>
                                                    )}
                                                {season?.descriptions?.find(
                                                    d =>
                                                        d.language ==
                                                        LANG.getEnglishLanguageName(
                                                            GLOBAL.Selected_Language,
                                                        ),
                                                ) == undefined &&
                                                    season?.descriptions
                                                        .length > 0 && (
                                                        <Text shadow>
                                                            {
                                                                season
                                                                    ?.descriptions[0]
                                                                    .description
                                                            }
                                                        </Text>
                                                    )}
                                                <Text
                                                    shadow
                                                    size={11}
                                                    style={{
                                                        marginTop: 10,
                                                        marginBottom: 20,
                                                    }}
                                                >
                                                    {season?.actors}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    width: sizes.width * 0.99,
                                                    alignSelf: 'center',
                                                    marginBottom: 0,
                                                }}
                                            >
                                                <OverflowMenu
                                                    anchor={renderSeasonButton}
                                                    visible={seasonVisible}
                                                    placement={'bottom'}
                                                    selectedIndex={
                                                        selectedSeasonIndex
                                                    }
                                                    style={{
                                                        width:
                                                            sizes.width * 0.98,
                                                        marginTop:
                                                            GLOBAL.Device_Manufacturer ==
                                                                'Apple' ||
                                                                GLOBAL.Device_IsWebTV
                                                                ? 0
                                                                : 30,
                                                    }}
                                                    onBackdropPress={() =>
                                                        setSeasonVisible(false)
                                                    }
                                                    onSelect={
                                                        onItemSelectSeason
                                                    }
                                                >
                                                    {seasons.map(
                                                        renderSeasonItem,
                                                    )}
                                                </OverflowMenu>
                                            </View>
                                        </View>
                                        <FlatList
                                            data={season?.episodes}
                                            numColumns={columns}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderEpisode}
                                        />
                                    </View>
                                </ScrollView>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
                ) : (
                    <View
                        style={{
                            flex: 1,
                            height: sizes.height,
                            justifyContent: 'center',
                        }}
                    >
                        <ActivityIndicator size={'large'} color={'white'} />
                    </View>
                )}
            </Block>
        </View>
    );
};
