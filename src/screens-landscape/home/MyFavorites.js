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

export default class MyFavorites extends Component {
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
            width_big = GLOBAL.COL_10 * 3.33;
            movie_width = GLOBAL.COL_REMAINING_6 - 2;
        }
        if (GLOBAL.App_Theme == 'Iridium') {
            width_big = GLOBAL.COL_10 * 3.33;
            movie_width = GLOBAL.COL_REMAINING_6 - 2;
        }

        this.state = {
            watched_movies: this.getFavoritMovies(),
            watched_series: this.getFavoriteSeries(),
            watched_tvshows: this.getFavoriteChannels(),
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
            'Favorites',
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
    getFavoriteChannels() {
        var channels = UTILS.getProfile('television_favorites', 0, 0);
        return channels;
    }
    getFavoritMovies() {
        var movies = UTILS.getProfile('movie_favorites', 0, 0);
        return movies;
    }
    getFavoriteSeries() {
        var series = UTILS.getProfile('series_favorites', 0, 0);
        return series;
    }
    getEpisodeImage(image) {
        if (image == null) {
            return (
                <Image
                    source={require('../../images/placeholder_episodes.jpg')}
                    style={{width: 300, height: 150}}
                ></Image>
            );
        } else {
            return (
                <Image
                    source={{uri: GLOBAL.ImageUrlCMS + image}}
                    style={{width: 300, height: 150}}
                    resizeMethod={'scale'}
                    resizeMode={'contain'}
                ></Image>
            );
        }
    }
    getCoverSeries(item, index) {
        return (
            <TouchableHighlightFocus
                hasTVPreferredFocus={this._setFocusOnFirst(index)}
                underlayColor={GLOBAL.Button_Color}
                onPress={() =>
                    Actions.Series_Details({
                        season_name: item.id,
                        fromPage: 'Favorites',
                    })
                }
            >
                <View style={{backgroundColor: '#111', padding: 5}}>
                    <ScaledImage
                        uri={GLOBAL.ImageUrlCMS + item.backdrop}
                        width={300}
                    />
                    <View style={{marginTop: 3}}></View>
                    <Text
                        numberOfLines={1}
                        style={[styles.H4, {margin: 5, width: 280}]}
                    >
                        {item.name}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }

    _startSelectedChannel(item) {
        (GLOBAL.Channel = UTILS.getChannel(item.channel_id)),
            Actions.Player({fromPage: 'Favorites'});
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
        Actions.Movies_Details({MovieIndex: item.id, fromPage: 'Favorites'});
    }
    openSeries(item) {
        Actions.Series_Details({season_name: item.id, fromPage: 'Favorites'});
    }
    openChannel(item, index) {
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
                    Actions.Player({fromPage: 'Favorites'});
                }
            }
        }
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
                    <View style={{flexDirection: 'row', flex: 1}}>
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
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.3)',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <Text style={styles.H2}>
                                            {LANG.getTranslation('favorites')}
                                        </Text>
                                        <Text
                                            style={styles.Standard}
                                            numberOfLines={2}
                                        >
                                            {LANG.getTranslation(
                                                'favoriteinfo',
                                            )}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style={{paddingLeft: 20, paddingTop: 20}}>
                                    {RenderIf(
                                        this.state.watched_movies.length > 0,
                                    )(
                                        <View>
                                            <Text
                                                style={[
                                                    styles.H2,
                                                    styles.Shadow,
                                                ]}
                                            >
                                                {LANG.getTranslation(
                                                    'your_movies',
                                                )}{' '}
                                            </Text>
                                            <View
                                                style={{
                                                    paddingTop: 10,
                                                    paddingBottom: 10,
                                                }}
                                            >
                                                <MovieList
                                                    FromPage={'Favorites'}
                                                    Movies={
                                                        this.state
                                                            .watched_movies
                                                    }
                                                    Type={'Movies'}
                                                    Width={
                                                        this.state.movie_width
                                                    }
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
                                    {RenderIf(
                                        this.state.watched_series.length > 0,
                                    )(
                                        <View>
                                            <Text
                                                style={[
                                                    styles.H2,
                                                    styles.Shadow,
                                                ]}
                                            >
                                                {LANG.getTranslation(
                                                    'your_series',
                                                )}{' '}
                                            </Text>
                                            <View
                                                style={{
                                                    paddingTop: 10,
                                                    paddingBottom: 10,
                                                }}
                                            >
                                                <MovieList
                                                    FromPage={'Favorites'}
                                                    Movies={
                                                        this.state
                                                            .watched_series
                                                    }
                                                    Type={'Movies'}
                                                    Width={
                                                        this.state.movie_width
                                                    }
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
                                                style={[
                                                    styles.H2,
                                                    styles.Shadow,
                                                ]}
                                            >
                                                {LANG.getTranslation(
                                                    'your_channels',
                                                )}
                                            </Text>
                                            <View
                                                style={{
                                                    paddingTop: 10,
                                                    paddingBottom: 10,
                                                }}
                                            >
                                                <ChannelList
                                                    FromPage={'Favorites'}
                                                    Channels={
                                                        this.state
                                                            .watched_tvshows
                                                    }
                                                    onPress={(channel, index) =>
                                                        this.openChannel(
                                                            channel,
                                                            index,
                                                        )
                                                    }
                                                    Width={
                                                        this.state.channel_width
                                                    }
                                                    Type={'Big'}
                                                    scrollType="channels"
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
                    </View>
                </ImageBackground>
            </Container>
        );
    }
}
