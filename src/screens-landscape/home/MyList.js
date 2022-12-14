import React, {Component} from 'react';
import {
    Text,
    BackHandler,
    TVMenuControl,
    View,
    Dimensions,
    Image,
    ScrollView,
    ImageBackground,
    TouchableWithoutFeedback,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {sendPageReport} from '../../reporting/reporting';

export default class MyList extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};

        var image_height =
            Dimensions.get('window').height / 2 -
            (GLOBAL.Device_IsWebTV
                ? 200
                : GLOBAL.Device_IsSTB || GLOBAL.Device_IsTablet
                ? 190
                : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                ? 155
                : 150);
        var area_height = Dimensions.get('window').height / 2 - 110;
        var area_width =
            Dimensions.get('window').width /
                (GLOBAL.Device_IsWebTV ? 3 : 2.35) -
            10;

        var width_big = 0;
        var movie_width = 0;
        if (GLOBAL.App_Theme == 'Akua') {
            width_big = GLOBAL.COL_10 * 3.33;
            movie_width = GLOBAL.COL_6 - 2;
        }
        if (GLOBAL.App_Theme == 'Honua') {
            movie_width = GLOBAL.COL_REMAINING_6 - 2;
        }
        if (GLOBAL.App_Theme == 'Iridium') {
            movie_width = GLOBAL.COL_REMAINING_6 - 2;
        }
        if (GLOBAL.Device_IsPhone) {
            width_big = GLOBAL.COL_1 - 40;
            movie_width = GLOBAL.COL_3;
        }
        this.state = {
            reportStartTime: moment().unix(),
            watched_movies: this.getContinueWatchingMovies(),
            watched_series: this.getContinueWatchingSeries(),
            watched_tvshows: this.getContinueWatchingTVShows(),
            rowWidth: image_height / 1.5,
            rowHeight: image_height,
            areaHeight: area_height,
            areaWidth: area_width,
            channel_width: width_big,
            movie_width: movie_width,
        };
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
            GLOBAL.Focus = 'Home';
            Actions.Home();
        }
    };
    updateDimensions() {
        Actions.MyList();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                GLOBAL.Focus = 'Home';
                Actions.Home();
                return true;
            },
        );
    }
    componentWillUnmount() {
        sendPageReport(
            'Watchlist',
            this.state.reportStartTime,
            moment().unix(),
        );
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }
    getContinueWatchingTVShows() {
        var cw = [];
        GLOBAL.Progress_Television = UTILS.getProfile(
            'television_progresses',
            0,
            0,
        );
        GLOBAL.Progress_Television.forEach(show => {
            var test = cw.filter(m => m.id == show.id);
            if (test.length == 0) {
                cw.push(show);
            }
        });
        return cw;
    }
    getContinueWatchingMovies() {
        var cw = [];
        GLOBAL.Progress_Movies = UTILS.getProfile('movie_progresses', 0, 0);
        GLOBAL.Progress_Movies.forEach(movie => {
            var test = cw.filter(m => m.id == movie.id);
            if (test.length == 0) {
                var getWatched = false;
                var percentageVideo = movie.data.position / movie.data.total;
                var position = percentageVideo * 100;
                if (position >= 95) {
                    getWatched = true;
                }
                if (getWatched == false) {
                    cw.push(movie);
                }
            }
        });
        return cw;
    }
    getContinueWatchingSeries() {
        var cw = [];
        GLOBAL.Progress_Seasons = UTILS.getProfile('series_progresses', 0, 0);
        GLOBAL.Progress_Seasons.forEach(season => {
            var test = cw.filter(m => m.id == season.id);
            if (test.length == 0) {
                cw.push(season);
            }
        });
        return cw;
    }
    getCoverSeries(item, index) {
        return (
            <TouchableHighlightFocus
                hasTVPreferredFocus={this._setFocusOnFirst(index)}
                underlayColor={GLOBAL.Button_Color}
                onPress={() =>
                    Actions.Series_Details({
                        season_name: item.id,
                        fromPage: 'Watching',
                    })
                }
            >
                <View style={{backgroundColor: '#111', padding: 5}}>
                    <ScaledImage uri={item.cover} width={166} />
                    <View style={{marginTop: 3}}></View>
                    <Text
                        numberOfLines={1}
                        style={[styles.H4, {margin: 5, width: 150}]}
                    >
                        {item.name}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }

    _startSelectedChannel(item) {
        (GLOBAL.Channel = UTILS.getChannel(item.channel_id)),
            Actions.Player({fromPage: 'Watching'});
    }

    _setFocusOnFirst(index) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
    onRowHeight = event => {
        if (this.state.rowHeight != 0) return;
        let height = event.nativeEvent.layout.height;

        this.setState({
            rowHeight: height,
            rowWidth: height / 1.5,
        });
    };
    openMovie(item) {
        Actions.Movies_Details({MovieIndex: item.id, fromPage: 'Watching'});
    }
    openSeries(item) {
        Actions.Series_Details({season_name: item.id, fromPage: 'Watching'});
    }
    render() {
        return (
            <Container
                needs_notch={true}
                hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                hide_menu={false}
            >
                <ImageBackground
                    style={{
                        flex: 1,
                        marginTop: GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                        marginLeft: GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                    }}
                    resizeMode={'cover'}
                    resizeMethod={'resize'}
                    source={require('../../images/hero_bg.png')}
                >
                    <ScrollView style={{flex: 1}}>
                        <View
                            style={{
                                flexDirection: 'column',
                                paddingLeft:
                                    GLOBAL.App_Theme == 'Iridium' &&
                                    !GLOBAL.Device_IsPhone
                                        ? 15
                                        : 0,
                            }}
                        >
                            <TouchableWithoutFeedback
                                hasTVPreferredFocus={true}
                            >
                                <View
                                    style={{
                                        borderRadius: 5,
                                        margin: 10,
                                        borderRadius: 5,
                                        padding: 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Text style={styles.H2}>
                                        {LANG.getTranslation('watchlist')}
                                    </Text>
                                    <Text
                                        style={styles.Standard}
                                        numberOfLines={2}
                                    >
                                        {LANG.getTranslation('watchlistinfo')}
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={{paddingLeft: 20, paddingTop: 20}}>
                                {RenderIf(this.state.watched_movies.length > 0)(
                                    <View>
                                        <Text
                                            style={[styles.H2, styles.Shadow]}
                                        >
                                            {LANG.getTranslation('movies')}{' '}
                                        </Text>
                                        <View
                                            style={{
                                                paddingTop: 10,
                                                paddingBottom: 10,
                                            }}
                                        >
                                            <MovieList
                                                FromPage={'Watching'}
                                                Movies={
                                                    this.state.watched_movies
                                                }
                                                Type={'Movies'}
                                                Width={this.state.movie_width}
                                                horizontal={true}
                                                getItemLayout={(
                                                    data,
                                                    index,
                                                ) => {
                                                    return {
                                                        length: this.state
                                                            .movies_width,
                                                        index,
                                                        offset:
                                                            this.state
                                                                .movies_width *
                                                            index,
                                                    };
                                                }}
                                                onPress={movie =>
                                                    this.openMovie(movie)
                                                }
                                            />
                                        </View>
                                    </View>,
                                )}
                                {RenderIf(this.state.watched_series.length > 0)(
                                    <View>
                                        <Text
                                            style={[styles.H2, styles.Shadow]}
                                        >
                                            {LANG.getTranslation('seasons')}{' '}
                                        </Text>
                                        <View
                                            style={{
                                                paddingTop: 10,
                                                paddingBottom: 10,
                                            }}
                                        >
                                            {/* <FlatList
                                                data={this.state.watched_series}
                                                horizontal={true}
                                                removeClippedSubviews={true}
                                                scrollType="series"
                                                Width={300}
                                                keyExtractor={(item, index) => "series_" + index.toString()}
                                                renderItem={({ item, index }) => {
                                                    return this.getCoverSeries(item, index)
                                                }}
                                            /> */}

                                            <MovieList
                                                FromPage={'Favorites'}
                                                Movies={
                                                    this.state.watched_series
                                                }
                                                Type={'Movies'}
                                                Width={this.state.movie_width}
                                                horizontal={true}
                                                getItemLayout={(
                                                    data,
                                                    index,
                                                ) => {
                                                    return {
                                                        length: this.state
                                                            .movies_width,
                                                        index,
                                                        offset:
                                                            this.state
                                                                .movies_width *
                                                            index,
                                                    };
                                                }}
                                                onPress={series =>
                                                    this.openSeries(series)
                                                }
                                            />
                                        </View>
                                    </View>,
                                )}
                                {RenderIf(
                                    this.state.watched_tvshows.length > 0,
                                )(
                                    <View style={{paddingBottom: 50}}>
                                        <Text
                                            style={[styles.H2, styles.Shadow]}
                                        >
                                            {LANG.getTranslation('channels')}{' '}
                                            {LANG.getTranslation('watchlist')}{' '}
                                        </Text>
                                        <View
                                            style={{
                                                paddingTop: 10,
                                                paddingBottom: 10,
                                            }}
                                        >
                                            <ChannelList
                                                Channels={
                                                    this.state.watched_tvshows
                                                }
                                                Width={this.state.channel_width}
                                                Type={'Big'}
                                                scrollType="channels"
                                                fromPage={'Watching'}
                                                horizontal={true}
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
                                                            : 400 * index,
                                                    };
                                                }}
                                            />
                                        </View>
                                    </View>,
                                )}
                            </View>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </Container>
        );
    }
}
