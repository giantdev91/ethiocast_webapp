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
export default class MyContent extends Component {
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
            rented_movies: this.getRentedMovies(),
            //watched_series: this.getContinueWatchingSeries(),
            //watched_tvshows: this.getContinueWatchingTVShows(),
            rowWidth: image_height / 1.5,
            rowHeight: image_height,
            areaHeight: area_height,
            areaWidth: area_width,
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
        Actions.MyContent();
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
        sendPageReport('Rentals', this.state.reportStartTime, moment().unix());
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

    getRentedMovies() {
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
    }

    _startSelectedChannel(item) {
        (GLOBAL.Channel = UTILS.getChannel(item.channel_id)),
            Actions.Player({fromPage: 'Renting'});
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
        Actions.Movies_Details({
            MovieIndex: item.movie_id,
            fromPage: 'Renting',
        });
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
                                        {LANG.getTranslation('rentals')}
                                    </Text>
                                    <Text
                                        style={styles.Standard}
                                        numberOfLines={2}
                                    >
                                        {LANG.getTranslation('rentalinfo')}
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <View style={{paddingLeft: 20, paddingTop: 20}}>
                                {RenderIf(this.state.rented_movies.length > 0)(
                                    <View>
                                        <Text
                                            style={[styles.H2, styles.Shadow]}
                                        >
                                            {LANG.getTranslation(
                                                'my_rented_movies',
                                            )}
                                        </Text>
                                        <View
                                            style={{
                                                paddingLeft: 10,
                                                paddingTop: 10,
                                                paddingBottom: 10,
                                            }}
                                        >
                                            <MovieList
                                                FromPage={'Renting'}
                                                Movies={
                                                    this.state.rented_movies
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
                                                onPress={(movie, index) =>
                                                    this.openMovie(movie, index)
                                                }
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
