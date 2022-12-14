import React, { useEffect, useState, useRef } from 'react';
import SIZES from '../../constants/sizes';
import { Block, Text } from '../../components/';
import {
    ActivityIndicator,
    View,
    Dimensions,
    StyleSheet,
    Platform,
    Image,
    ImageBackground,
    BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import { sendPageReport } from '../../../reporting/reporting';
import { useTheme } from '../../hooks/';
import { ScrollView } from 'react-native-gesture-handler';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default ({ navigation }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [channels, setChannels] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [education, setEducation] = useState([]);
    const { sizes_ } = useTheme();

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Favorites', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (UTILS.checkMenuExists('Channels') == true) {
            let channels_ = [];
            channels_ = getFavoriteChannels();
            setChannels(channels_);
        }

        if (UTILS.checkMenuExists('Movies') == true) {
            let movies_ = [];
            movies_ = getFavoriteMovies();
            setMovies(movies_);
        }

        if (UTILS.checkMenuExists('Series') == true) {
            let series_ = [];
            series_ = getFavoriteSeries();
            setSeries(series_);
        }

        if (UTILS.checkMenuExists('Education') == true) {
            let education_ = [];
            education_ = getFavoriteEducation();
            setEducation(education_);
        }

        setLoaded(true);
    }, []);
    useEffect(() => {
        const backAction = () => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: 'Home' }],
                }),
            );
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        return () => backHandler.remove();
    }, []);
    const getFavoriteChannels = () => {
        var channels = UTILS.getProfile('television_favorites', 0, 0);
        return channels;
    };
    const getFavoriteMovies = () => {
        var movies = UTILS.getProfile('movie_favorites', 0, 0);
        return movies;
    };
    const getFavoriteSeries = () => {
        var series = UTILS.getProfile('series_favorites', 0, 0);
        return series;
    };
    const getFavoriteEducation = () => {
        var series = UTILS.getProfile('education_favorites', 0, 0);
        return series;
    };
    const onOpenMovieDetails = item => {
        navigation.navigate({
            name: 'Movie',
            params: {
                movie_id: item.id,
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
                <View style={{ flex: 1, margin: 5 }}>
                    <Image
                        source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                        style={[
                            {
                                borderColor: '#222',
                                borderWidth: 4,
                                borderRadius: 5,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4
                                    : sizes.width * 0.15,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4 * 1.5
                                    : sizes.width * 0.15 * 1.5,
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
                            width: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.38
                                : sizes.width * 0.13,
                        }}
                    >
                        {item.name}
                    </Text>
                </View>
            </FocusButton>
        );
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
    const onOpenStoreEducation = item => {
        navigation.navigate({
            name: 'Courses',
            params: {
                course_id: item.id,
            },
            merge: true,
        });
    };
    const renderEducation = ({ item }) => {
        return (
            <FocusButton onPress={() => onOpenStoreEducation(item)}>
                <View style={{ flex: 1, margin: 5 }}>
                    <Image
                        source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                        style={[
                            {
                                borderColor: '#222',
                                borderWidth: 4,
                                borderRadius: 5,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4
                                    : sizes.width * 0.15,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4 * 1.5
                                    : sizes.width * 0.15 * 1.5,
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
                            width: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.38
                                : sizes.width * 0.13,
                        }}
                    >
                        {item.name}
                    </Text>
                </View>
            </FocusButton>
        );
    };
    const renderSeries = ({ item }) => {
        return (
            <FocusButton onPress={() => onOpenStore(item)}>
                <View style={{ flex: 1, margin: 5 }}>
                    <Image
                        source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                        style={[
                            {
                                borderColor: '#222',
                                borderWidth: 4,
                                borderRadius: 5,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4
                                    : sizes.width * 0.15,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4 * 1.5
                                    : sizes.width * 0.15 * 1.5,
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
                            width: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.38
                                : sizes.width * 0.13,
                        }}
                    >
                        {item.name}
                    </Text>
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
        GLOBAL.Channels.forEach((category_, index) => {
            category_.channels.forEach((channel_, index_) => {
                if (index != 1) {
                    if (channel_.channel_id == item.channel_id) {
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
    const renderChannel = ({ item }) => {
        return (
            <FocusButton
                style={{ flex: 1, borderRadius: 5 }}
                onPress={() => onPlayChannel(item)}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        margin: 5,
                        borderRadius: 5,
                        borderColor: '#222',
                        borderWidth: 3,
                    }}
                >
                    <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.icon_big }}
                            style={{
                                margin: 10,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.26
                                    : sizes.width * 0.08,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.26
                                    : sizes.width * 0.08,
                            }}
                        ></Image>
                    </View>
                    <View
                        style={{
                            padding: 5,
                            paddingLeft: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            flex: 1,
                        }}
                    >
                        <Text h5 bold shadow numberOfLines={1}>
                            {item.channel_number} {item.name}
                        </Text>
                        {getTvProgram(item)}
                    </View>
                </View>
            </FocusButton>
        );
    };
    return (
        <ImageBackground
            source={{ uri: GLOBAL.Background }}
            style={{ flex: 1, width: null, height: null }}
            imageStyle={{ resizeMode: 'cover' }}
        >
            <ScrollView>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.6)']}
                    style={{
                        flex: 1,
                        width: sizes.width,
                        minHeight: sizes.height,
                    }}
                    start={{ x: 0.5, y: 0 }}
                >
                    {loaded == true ? (
                        <Block
                            paddingLeft={10}
                            showsVerticalScrollIndicator={false}
                        >
                            <View
                                style={{
                                    marginTop: 10,
                                    marginRight: 10,
                                    borderRadius: 5,
                                    height: 100,
                                    padding: 10,
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    flexDirection: 'column',
                                }}
                            >
                                <Text h5>
                                    {LANG.getTranslation('favorites')}
                                </Text>
                                <Text numberOfLines={2}>
                                    {LANG.getTranslation('favoriteinfo')}
                                </Text>
                            </View>
                            <View style={{ marginBottom: 40 }}>
                                {series.length > 0 && (
                                    <View style={{ paddingTop: 20 }}>
                                        <Text
                                            h5
                                            bold
                                            shadow
                                            numberOfLines={1}
                                            marginLeft={5}
                                            paddingBottom={10}
                                        >
                                            {LANG.getTranslation('seasons')} (
                                            {series.length})
                                        </Text>
                                        <FlatList
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
                                            marginLeft={5}
                                            paddingBottom={10}
                                        >
                                            {LANG.getTranslation('movies')} (
                                            {movies.length})
                                        </Text>
                                        <FlatList
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
                                {education.length > 0 && (
                                    <View style={{ paddingTop: 20 }}>
                                        <Text
                                            h5
                                            bold
                                            shadow
                                            numberOfLines={1}
                                            marginLeft={5}
                                            paddingBottom={10}
                                        >
                                            {LANG.getTranslation('courses')} (
                                            {education.length})
                                        </Text>
                                        <FlatList
                                            data={education}
                                            horizontal={true}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderEducation}
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
                                            marginLeft={5}
                                            paddingBottom={10}
                                        >
                                            {LANG.getTranslation('channels')} (
                                            {channels.length})
                                        </Text>
                                        <FlatList
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
                            </View>
                        </Block>
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
                </LinearGradient>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    item: {
        width: screenWidth - 60,
        height: (screenWidth - 60) * 0.56,
        backgroundColor: 'transparent',
        borderRadius: 4,
    },
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderRadius: 4,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
        borderRadius: 4,
    },
});
