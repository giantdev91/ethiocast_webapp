import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Icon,
    Input,
    Toggle,
} from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import * as Animatable from 'react-native-animatable';
import {
    sendPageReport,
    sendActionReport,
    sendSearchReport,
} from '../../../reporting/reporting';
import TimerMixin from 'react-timer-mixin';

export default ({ navigation, route }): React.ReactElement => {
    var store_search_timer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [movies, setMovies] = useState([]);
    const [moviesSearch, setMovieSearch] = useState([]);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [categoryVisible, setCategoryVisible] = useState(false);
    const [categories, setCategories] = useState(['']);
    const [toggleOrder, setOrder] = useState(true);
    const [toggleView, setView] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortType, setSortType] = useState('123');
    const [viewType, setViewType] = useState('Full');
    const [movieColumnsFull, setMovieColumnsFull] = useState(
        GLOBAL.Device_IsPortrait ? 3 : 8,
    );
    const [movieColumnsMini, setMovieColumnsMini] = useState(
        GLOBAL.Device_IsPortrait ? 1 : 3,
    );
    const [favorite, setFavorite] = useState(false);
    const [columns, setColumns] = useState(GLOBAL.Device_IsPortrait ? 3 : 8);

    const [showVoiceButton, setShowVoiceButton] = useState(false);
    const [showVoiceEnabled, setShowVoiceEnabled] = useState(false);
    const [extraSearchResults, setExtraSearchResults] = useState([]);

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () => sendPageReport('Movies', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (route.params?.store != undefined) {
            var movies = route.params?.store.genres[0].movies;
            var moviesIn = getMovies(sortType, movies);
            setMovies(moviesIn);
            setMovieSearch(moviesIn);
            var categoriesIn = [];
            var categories_ = route.params?.store.genres;
            categories_.forEach((category, index) => {
                var categoryOut = {
                    name: category.name,
                    id: category.id,
                    length: category.movies.length,
                };

                categoriesIn.push(categoryOut);
            });
            setSelectedCategoryName(
                categoriesIn[0].name + ' (' + categoriesIn[0].length + ')',
            );
            setSelectedCategoryIndex({ row: 0, section: 0 });
            setCategories(categoriesIn);
        }

        if (
            GLOBAL.Device_System == 'Apple' ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.onSpeechResults = onSpeechResultsHandler.bind(this);
        }
        if (
            GLOBAL.Device_System == 'Apple' ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.isAvailable().then(result => {
                setShowVoiceButton(true);
            });
        }
        return () => {
            TimerMixin.clearTimeout(store_search_timer);
            if (
                GLOBAL.Device_System == 'Apple' ||
                GLOBAL.Device_System == 'Android' ||
                GLOBAL.Device_System == 'Amazon'
            ) {
                Voice.destroy().then(Voice.removeAllListeners);
            }
        };
    }, []);
    useEffect(() => {
        const backAction = () => {
            var storesIn = GLOBAL.MovieStores;
            if (storesIn.length == 1 && storesIn[0].substores.length == 0) {
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
    const onStartSpeech = async () => {
        if (showVoiceEnabled == false) {
            setShowVoiceEnabled(true);
            try {
                await Voice.start('en-US');
            } catch (e) {
                setShowVoiceEnabled(false);
                Voice.stop();
            }
        } else {
            setShowVoiceEnabled(false);
            Voice.stop();
        }
    };
    const onSpeechResultsHandler = e => {
        if (e.value != '') {
            try {
                var newInput = e.value;
                var splitInput = newInput.toString().split(',');

                var extraSearch = [];
                splitInput.forEach(element => {
                    var extra = {
                        name: element,
                    };
                    extraSearch.push(extra);
                });
                if (splitInput.length > 0) {
                    Voice.stop().then(() => {
                        sendActionReport(
                            'Search Voice',
                            'Movie Categories',
                            moment().unix(),
                            splitInput[0],
                        );
                        setShowVoiceEnabled(false);
                        setSearchTerm(splitInput[0]);
                        setExtraSearchResults(extraSearch);
                        onSearchChannels(splitInput[0]);
                    });
                }
            } catch (e) { }
        }
    };
    const onSearchExtra = searchTerm => {
        setSearchTerm(searchTerm);
        onSearchChannels(searchTerm);
    };
    const renderExtra = ({ item }) => {
        return (
            <FocusButton
                style={{ backgroundColor: '#333', margin: 5, borderRadius: 100 }}
                onPress={() => onSearchExtra(item.name)}
            >
                <Text style={{ paddingHorizontal: 10, padding: 4 }}>
                    {item.name}
                </Text>
            </FocusButton>
        );
    };

    const onGetFavoriteStatus = id => {
        var test = GLOBAL.Favorite_Movies.find(function (element) {
            return element.id == id;
        });
        if (test != undefined) {
            return true;
        } else {
            return false;
        }
    };

    const getMovies = (sortType, movies) => {
        var originalMovies = movies;
        originalMovies.sort((movie1, movie2) => {
            if (sortType == 'ABC') {
                const aName = movie1.name;
                const bName = movie2.name;
                if (aName < bName) return -1;
                if (aName > bName) return 1;
                return 0;
            } else {
                if (movie1.position > movie2.position) return 1;
                if (movie1.position < movie2.position) return -1;
                return 0;
            }
        });
        return originalMovies;
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
        var isFavo = onGetFavoriteStatus(item.id);
        if (viewType == 'Full') {
            return (
                <FocusButton
                    style={{
                        borderRadius: 5,
                        margin: 2,
                        width: sizes.width / columns - 5,
                    }}
                    onPress={() => onOpenMovieDetails(item)}
                >
                    <View style={{ flex: 1 }}>
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                            style={[
                                {
                                    borderColor: '#111',
                                    borderWidth: 4,
                                    borderRadius: 5,
                                    width: sizes.width / columns - 8,
                                    height: (sizes.width / columns - 8) * 1.585,
                                },
                            ]}
                        ></Image>
                        <Text
                            bold
                            shadow
                            numberOfLines={1}
                            style={{
                                paddingBottom: 10,
                                marginTop: 5,
                                marginLeft: 5,
                                paddingRight: 10,
                            }}
                        >
                            {item.name}
                        </Text>
                    </View>
                    <View style={{ position: 'absolute', top: 5, right: 5 }}>
                        <FontAwesome
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={
                            //     isFavo || favorite
                            //         ? SolidIcons.heart
                            //         : RegularIcons.heart
                            // }
                            name={isFavo || favorite ? "heart" : "heart-o"}
                        />
                    </View>
                </FocusButton>
            );
        } else {
            return (
                <FocusButton
                    style={{
                        borderRadius: 5,
                        margin: 2,
                        width: sizes.width / columns - 5,
                    }}
                    onPress={() => onOpenMovieDetails(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            borderRadius: 5,
                            padding: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            margin: 3,
                            alignItems: 'center',
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <View style={{ marginRight: 10 }}>
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                                style={[
                                    {
                                        borderRadius: 5,
                                        margin: 10,
                                        width: GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.15
                                            : sizes.width * 0.05,
                                        height:
                                            (GLOBAL.Device_IsPortrait
                                                ? sizes.width * 0.15
                                                : sizes.width * 0.05) * 1.5,
                                    },
                                ]}
                            ></Image>
                        </View>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text
                                h5
                                bold
                                shadow
                                numberOfLines={1}
                                style={{ marginTop: 5, marginLeft: 5 }}
                            >
                                {item.name}
                            </Text>
                        </View>
                    </View>
                    <View style={{ position: 'absolute', top: 5, right: 5 }}>
                        <FontAwesome
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={
                            //     favorite ? SolidIcons.heart : RegularIcons.heart
                            // }
                            name={favorite ? "heart" : "heart-o"}
                        />
                    </View>
                </FocusButton>
            );
        }
    };
    const SearchIcon = props => (
        <Icon {...props} fill="#fff" name="search-outline" />
    );
    const SpeechIcon = props => (
        <Icon {...props} fill="#fff" name="mic-outline" />
    );

    const onItemSelectCategory = index => {
        var id = categories[index.row].id;
        var category = route.params?.store.genres.find(c => c.id == id);
        var movies = [];
        if (category != undefined) {
            if (category.movies.length > 0) {
                movies = getMovies(sortType, category.movies);
            }
        }
        setSelectedCategoryName(
            category.name + ' (' + category.movies.length + ')',
        );
        setSelectedCategoryIndex(index);
        setCategoryVisible(false);
        setMovieSearch(movies);
        setMovies(movies);
    };
    const renderCategoryButon = () => (
        <Button onPress={() => setCategoryVisible(true)}>
            {selectedCategoryName}
        </Button>
    );
    const renderCategoryItem = (category, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={category.name + ' (' + category.length + ')'}
        />
    );
    const onToggleOrder = isChecked => {
        setMovies([]);
        sendActionReport(
            'Toggle Order',
            'Movie Categories',
            moment().unix(),
            isChecked,
        );
        setSortType(isChecked ? '123' : 'ABC');
        setOrder(isChecked);
        setCategoryVisible(false);

        var moviesOut = getMovies(isChecked ? '123' : 'ABC', movies);
        setMovieSearch(moviesOut);
        setMovies(moviesOut);
    };
    const onToggleView = isChecked => {
        sendActionReport(
            'Toggle View',
            'Movie Categories',
            moment().unix(),
            isChecked,
        );
        if (GLOBAL.Device_IsPortrait) {
            setColumns(isChecked ? 3 : 1);
        } else {
            setColumns(isChecked ? 6 : 3);
        }
        setViewType(isChecked ? 'Full' : 'Mini');
        setView(isChecked);
    };
    const onStartSearchTimer = searchTerm => {
        TimerMixin.clearTimeout(store_search_timer);
        store_search_timer = TimerMixin.setTimeout(() => {
            sendSearchReport(moment().unix(), searchTerm);
        }, 2000);
    };
    const onSearchChannels = searchTerm => {
        if (searchTerm != undefined && searchTerm != null && searchTerm != '') {
            if (moviesSearch.length > 0) {
                var moviesSearch_ = moviesSearch.filter(
                    c =>
                        c.name.toLowerCase().indexOf(searchTerm.toLowerCase()) >
                        -1,
                );
                setSearchTerm(searchTerm);
                setMovies(moviesSearch_);
            }
        }

        setSearchTerm(searchTerm);
    };
    const onPressBack = () => {
        var storesIn = GLOBAL.MovieStores;
        if (storesIn.length == 1 && storesIn[0].substores.length == 0) {
            navigation.navigate({
                name: 'Home',
                merge: true,
            });
        } else {
            navigation.goBack();
        }
    };
    return (
        <ImageBackground
            source={{ uri: GLOBAL.Background }}
            style={{ flex: 1, width: null, height: null }}
            imageStyle={{ resizeMode: 'cover' }}
        >
            <Block
                flex={1}
                width={sizes.width}
                align="center"
                justify="center"
                color={'transparent'}
            >
                {showVoiceEnabled && (
                    <View
                        style={{
                            borderRadius: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.80)',
                            position: 'absolute',
                            width: sizes.width * 0.3,
                            height: sizes.width * 0.3,
                            zIndex: 99999,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            flex: 1,
                        }}
                    >
                        <Animatable.View
                            animation="pulse"
                            easing="ease-in-out"
                            iterationCount="infinite"
                        >
                            <FontAwesome5
                                style={[
                                    styles.Shadow,
                                    {
                                        color: '#fff',
                                        fontSize: 50,
                                        padding: 0,
                                        margin: 0,
                                    },
                                ]}
                                // icon={SolidIcons.microphone}
                                name="microphone"
                            />
                        </Animatable.View>
                    </View>
                )}
                <View
                    style={{
                        flexDirection: 'row',
                        width: sizes.width,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                    }}
                >
                    <View
                        style={{
                            paddingLeft: 10,
                            marginRight: 0,
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
                            onPress={() => onPressBack()}
                        >
                            <FontAwesome5
                                style={{ fontSize: 18, color: '#fff' }}
                                // icon={SolidIcons.arrowLeft}
                                name="arrow-left"
                            />
                        </FocusButton>
                    </View>
                    <View
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            paddingLeft: 20,
                            alignSelf: 'center',
                            paddingVertical: 5,
                        }}
                    >
                        <Toggle
                            status="control"
                            checked={toggleOrder}
                            onChange={onToggleOrder}
                        >
                            {GLOBAL.Device_IsPortrait
                                ? ''
                                : LANG.getTranslation('sorting')}{' '}
                            {sortType}
                        </Toggle>
                        <Toggle
                            status="control"
                            checked={toggleView}
                            onChange={onToggleView}
                        >
                            {GLOBAL.Device_IsPortrait
                                ? ''
                                : LANG.getTranslation('toggle_view')}{' '}
                            {viewType}
                        </Toggle>
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: 'column',
                        width: sizes.width,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                        paddingTop: 0,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            borderColor: '#999',
                            borderWidth: 1,
                            borderRadius: 100,
                            marginHorizontal: 20,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                width: sizes.width,
                                alignSelf: 'center',
                                paddingVertical: 5,
                                paddingLeft: 20,
                            }}
                        >
                            <Input
                                status="basic"
                                style={{
                                    width: '100%',
                                    backgroundColor: 'transparent',
                                    paddingRight: showVoiceButton ? 0 : 20,
                                    borderColor: 'transparent',
                                }}
                                value={searchTerm}
                                placeholder={
                                    LANG.getTranslation('filter') + '...'
                                }
                                accessoryLeft={SearchIcon}
                                autoComplete={'off'}
                                underlineColorAndroid="transparent"
                                onChangeText={nextValue =>
                                    onSearchChannels(nextValue)
                                }
                            />
                        </View>
                        <View>
                            {showVoiceButton && (
                                <Button
                                    style={{ borderRadius: 100 }}
                                    appearance="ghost"
                                    accessoryLeft={SpeechIcon}
                                    onPress={onStartSpeech}
                                />
                            )}
                        </View>
                    </View>
                    <View style={{ marginLeft: 10 }}>
                        <FlatList
                            key={extraSearchResults}
                            extraData={extraSearchResults}
                            data={extraSearchResults}
                            horizontal={true}
                            removeClippedSubviews={true}
                            keyExtractor={(item, index) => index.toString()}
                            onScrollToIndexFailed={() => { }}
                            renderItem={renderExtra}
                        />
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        width: sizes.width,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                        justifyContent: 'center',
                    }}
                >
                    {!showSearch ? (
                        <View
                            style={{
                                flex: 1,
                                paddingHorizontal: 5,
                                paddingTop: 20,
                            }}
                        >
                            <OverflowMenu
                                anchor={renderCategoryButon}
                                visible={categoryVisible}
                                selectedIndex={selectedCategoryIndex}
                                fullWidth={true}
                                style={{
                                    width: sizes.width * 0.98,
                                    marginTop:
                                        GLOBAL.Device_Manufacturer == 'Apple' ||
                                            GLOBAL.Device_IsWebTV
                                            ? 0
                                            : 30,
                                }}
                                onBackdropPress={() =>
                                    setCategoryVisible(false)
                                }
                                onSelect={onItemSelectCategory}
                            >
                                {categories.map(renderCategoryItem)}
                            </OverflowMenu>
                        </View>
                    ) : (
                        <View></View>
                    )}
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <LinearGradient
                        colors={['rgba(0, 0, 0, 0.80)', 'rgba(0, 0, 0, 0.0)']}
                        style={{ flex: 1, width: sizes.width, height: '100%' }}
                        start={{ x: 0.5, y: 0 }}
                    >
                        <View
                            style={{
                                flex: 1,
                                paddingTop: 10,
                                alignSelf: 'center',
                            }}
                        >
                            {viewType == 'Full' && (
                                <FlatList
                                    extraData={movies}
                                    data={movies}
                                    numColumns={movieColumnsFull}
                                    horizontal={false}
                                    removeClippedSubviews={true}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    onScrollToIndexFailed={() => { }}
                                    renderItem={renderMovie}
                                />
                            )}
                            {viewType == 'Mini' && (
                                <FlatList
                                    extraData={movies}
                                    data={movies}
                                    numColumns={movieColumnsMini}
                                    horizontal={false}
                                    removeClippedSubviews={true}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    onScrollToIndexFailed={() => { }}
                                    renderItem={renderMovie}
                                />
                            )}
                        </View>
                    </LinearGradient>
                </View>
            </Block>
        </ImageBackground>
    );
};
