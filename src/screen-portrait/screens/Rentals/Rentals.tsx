import React, {useEffect, useState, useRef} from 'react';
import SIZES from '../../constants/sizes';
import {Block, Text} from '../../components/';
import {
    ActivityIndicator,
    View,
    Dimensions,
    StyleSheet,
    Platform,
    Image,
    ImageBackground,
    BackHandler,
    ScrollView,
} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {CommonActions} from '@react-navigation/native';
import {sendPageReport} from '../../../reporting/reporting';
import {useTheme} from '../../hooks/';

const {width: screenWidth} = Dimensions.get('window');

export default ({navigation}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [movies, setMovies] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const {sizes_} = useTheme();
    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Rentals', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (UTILS.checkMenuExists('Movies') == true) {
            let movies_ = [];
            movies_ = getRentedMovies();
            setMovies(movies_);
        }

        setLoaded(true);
    }, []);
    useEffect(() => {
        const backAction = () => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Home'}],
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
    const getRentedMovies = () => {
        var movies = [];
        GLOBAL.Rented_Movies.forEach(element => {
            var movie_end_time = moment(element.end);
            var current_time = moment();
            if (movie_end_time >= current_time) {
                var check = movies.find(m => m.movie_id == element.movie_id);
                if (check == undefined) {
                    movies.push(element);
                }
            }
        });
        return movies;
    };
    const onOpenMovieDetails = item => {
        navigation.navigate({
            name: 'Movie',
            params: {
                movie_id: item.movie_id,
            },
            merge: true,
        });
    };
    const renderMovie = ({item}) => {
        return (
            <FocusButton
                style={{borderRadius: 5}}
                onPress={() => onOpenMovieDetails(item)}
            >
                <View style={{flex: 1, margin: 5}}>
                    <Image
                        source={{uri: item.image}}
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
    return (
        <ImageBackground
            source={{uri: GLOBAL.Background}}
            style={{flex: 1, width: null, height: null}}
            imageStyle={{resizeMode: 'cover'}}
        >
            <ScrollView>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.6)']}
                    style={{
                        flex: 1,
                        width: sizes.width,
                        minHeight: sizes.height,
                    }}
                    start={{x: 0.5, y: 0}}
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
                                <Text h5>{LANG.getTranslation('rentals')}</Text>
                                <Text numberOfLines={2}>
                                    {LANG.getTranslation('rentalinfo')}
                                </Text>
                            </View>

                            <View style={{flex: 1, marginBottom: 40}}>
                                {movies.length > 0 && (
                                    <View style={{paddingTop: 20}}>
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
                                            onScrollToIndexFailed={() => {}}
                                            renderItem={renderMovie}
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
        marginBottom: Platform.select({ios: 0, android: 1}), // Prevent a random Android rendering issue
        backgroundColor: 'white',
        borderRadius: 4,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
        borderRadius: 4,
    },
});
