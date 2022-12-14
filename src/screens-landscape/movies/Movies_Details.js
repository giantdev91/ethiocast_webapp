import React, { Component } from 'react';
import {
    BackHandler,
    TVMenuControl,
    Text,
    View,
    Image,
    ScrollView,
    ImageBackground,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import StarRating from 'react-native-star-rating';
// import {BrandIcons, RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { sendPageReport } from '../../reporting/reporting';

export default class Movies_Details extends Component {
    constructor(props) {
        super(props);
        GLOBAL.Focus = 'Movies';
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        if (this.props.fromPage != 'search') {
            GLOBAL.Selected_MovieIndex = this.props.MovieIndex;
        }

        var movie_width = 0;
        if (GLOBAL.App_Theme == 'Akua') {
            movie_width = GLOBAL.COL_6;
        }
        if (GLOBAL.App_Theme == 'Honua') {
            movie_width = GLOBAL.COL_REMAINING_6 - 2;
        }
        if (GLOBAL.App_Theme == 'Iridium') {
            movie_width = GLOBAL.COL_REMAINING_6 - 2;
        }
        if (GLOBAL.Device_IsPhone) {
            movie_width = GLOBAL.COL_3;
        }
        this.state = {
            reportStartTime: moment().unix(),
            movie_width: movie_width,
            fromPage: this.props.fromPage,
            details: [],
            title: '',
            logo: undefined,
            desc: '',
            actors: '',
            year: '',
            duration: '',
            language: '',
            tags: '',
            poster: GLOBAL.HTTPvsHTTPS + '',
            backdrop: GLOBAL.HTTPvsHTTPS + '',
            rating: 0,
            price: '',
            position: '0%',
            id: 0,
            movieimagewidth: 0,
            movies: [],
            movieRowHeight: GLOBAL.Device_IsAppleTV
                ? 400
                : GLOBAL.Device_IsPhone
                    ? GLOBAL.Device_System == 'Apple'
                        ? 150
                        : 170
                    : 250,
            movieRowWidth: GLOBAL.Device_IsAppleTV
                ? 250
                : GLOBAL.Device_IsPhone
                    ? 200
                    : 250,
            button_width: GLOBAL.COL_REMAINING_5,
            favorite: 'Add to Favorites',
            favorite_: false,
            movie: [],
            tvod: false,
            age_rating: '',
            srt: '',
            payment_done: false,
            payment_pending: false,
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
            this._onBack();
        }
    };
    updateDimensions() {
        Actions.Movies_Details({
            fromPage: this.state.fromPage,
            MovieIndex: this.props.MovieIndex,
            stores: this.props.stores,
        });
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            window.addEventListener('resize', this.updateDimensions);
            startMouseEvents();
            document.addEventListener('keydown', this.backButton, false);
        }
        this.getMovieDetails();
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                this._onBack();
                return true;
            },
        );
    }
    _onBack() {
        if (this.state.fromPage == 'Home') {
            GLOBAL.Focus = 'Home';
            Actions.Home();
        } else if (this.state.fromPage == 'Watching') {
            Actions.MyList();
        } else if (this.state.fromPage == 'Favorites') {
            Actions.MyFavorites();
        } else if (this.state.fromPage == 'search') {
            Actions.SearchBox();
        } else if (this.state.fromPage == 'tags') {
            Actions.Movies_Tags({
                selected_tag: this.props.selected_tag,
                fromPage: this.state.fromPage_,
                stores: this.props.stores,
                tags: this.props.tags,
                MovieIndex: this.props.MovieIndex_,
            });
        } else if (this.state.fromPage == 'Renting') {
            Actions.MyContent();
        } else {
            Actions.Movies_Categories({
                fromPage: this.state.fromPage,
                stores: this.props.stores,
            });
        }
    }
    componentWillUnmount() {
        sendPageReport(
            'Movie Details',
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

    getMovieDetails() {
        var path = '';
        if (
            this.state.fromPage == 'Home' &&
            this.props.skippedStore == undefined
        ) {
            path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                this.props.MovieIndex +
                '_movie_details_v2.json';
        } else if (this.state.fromPage == 'search') {
            if (GLOBAL.SearchMovies_[GLOBAL.Selected_MovieIndex] == undefined) {
                this._onBack();
            }
            path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                GLOBAL.SearchMovies_[GLOBAL.Selected_MovieIndex].id +
                '_movie_details_v2.json';
        } else if (
            this.state.fromPage == 'continue' ||
            this.state.fromPage == 'Favorites' ||
            this.state.fromPage == 'Watching' ||
            this.state.fromPage == 'Renting'
        ) {
            path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                this.props.MovieIndex +
                '_movie_details_v2.json';
        } else {
            if (GLOBAL.Selected_MovieIndex == null) {
                this._onBack();
            }
            if (GLOBAL.Movie_Selected == null) {
                this._onBack();
            }
            if (
                typeof GLOBAL.Movie_Selected[GLOBAL.Selected_MovieIndex] ===
                'undefined'
            ) {
                this._onBack();
            }
            if (
                GLOBAL.Movie_Selected[GLOBAL.Selected_MovieIndex] == undefined
            ) {
                this._onBack();
            }
            path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                GLOBAL.Movie_Selected[GLOBAL.Selected_MovieIndex].id +
                '_movie_details_v2.json';
        }
        DAL.getJson(path)
            .then(data => {
                var getProgress = GLOBAL.Progress_Movies.find(function (
                    element,
                ) {
                    return element.id === data.id;
                });
                var position = '0';
                if (getProgress != undefined) {
                    var value = getProgress.value + '';
                    var timeSplitted = value.split('-');
                    var percentageVideo =
                        Number(timeSplitted[0]) / Number(timeSplitted[1]);
                    position = percentageVideo * 100;
                }
                GLOBAL.Movie = data;
                var desc = '';
                if (data.moviedescriptions.length > 0) {
                    desc = data.moviedescriptions[0].description;
                }

                this.setState({
                    movie: data,
                    favorite:
                        GLOBAL.Favorite_Movies.find(m => m.id == data.id) !=
                            undefined
                            ? 'Remove from Favorites'
                            : 'Add to Favorites',
                    favorite_:
                        GLOBAL.Favorite_Movies.find(m => m.id == data.id) !=
                            undefined
                            ? true
                            : false,
                    title: data.name,
                    desc: desc,
                    actors: data.actors,
                    year: data.year,
                    language: data.language,
                    tags: data.tags,
                    poster: data.poster,
                    backdrop: data.backdrop,
                    rating: data.rating,
                    position: data.position,
                    id: data.id,
                    trailer_url: data.trailer_url,
                    logo: data.logo,
                });
                // REPORT.set({
                //     type: 11,
                //     name: data.name,
                //     id: data.id
                // });
            })
            .catch(error => {
                this._onBack();
            });
    }
    getAlreadyPurchased() {
        var check = GLOBAL.Rented_Movies.filter(
            r => r.movie_id == this.state.movie.id,
        );
        if (check != undefined && check.length > 0) {
            const lastItem = check[check.length - 1];
            var movie_end_time = moment(lastItem.end).unix();
            var current_time = moment().unix();
            if (movie_end_time > current_time) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    getMoviePriceAmount() {
        var price = this.state.movie.movieprices.find(
            p => p.currency == GLOBAL.User_Currency,
        );
        if (price != undefined) {
            return GLOBAL.Payment_Method == 'Wallet'
                ? price.credits
                : price.amount;
        } else {
            return 0;
        }
    }
    getMoviePrice() {
        var price = this.state.movie.movieprices.find(
            p => p.currency == GLOBAL.User_Currency,
        );
        var check = GLOBAL.Rented_Movies.filter(
            m => m.movie_id == this.state.movie.id,
        );
        if (check != undefined && check.length > 0) {
            const lastItem = check[check.length - 1];
            var movie_end_time = moment(lastItem.end).unix();
            var current_time = moment().unix();
            if (movie_end_time > current_time) {
                return 'Rented';
            } else {
                if (price != undefined) {
                    return GLOBAL.Payment_Method == 'Wallet'
                        ? price.credits
                        : price.amount;
                } else {
                    return '';
                }
            }
        } else {
            if (price != undefined) {
                return GLOBAL.Payment_Method == 'Wallet'
                    ? price.credits
                    : price.amount;
            } else {
                return '';
            }
        }
    }
    getMovieAccess() {
        var rented = GLOBAL.Rented_Movies.find(
            m => m.movie_id == this.state.movie.id,
        );
        if (rented != undefined) {
            var a = moment(rented.end).format('LL');
            return LANG.getTranslation('youcanwatchthiscontenttill') + a;
        }
    }
    checkMoviePayPerView() {
        var test1 = this.state.movie.rule_payperview.name;
        if (test1 == '' || test1 == null) {
            return false;
        } else {
            var price = this.state.movie.movieprices.find(
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
    requestPayPerViewAccess() {
        this.setState(
            {
                payment_pending: true,
            },
            () => {
                try {
                    var rented = {
                        backdrop_image: this.state.movie.backdrop,
                        start: moment().format('YYYY-MM-DDTHH:MM:00'),
                        image: this.state.movie.poster,
                        movie_id: this.state.movie.id,
                        name: this.state.movie.name,
                        payment_type: 'api',
                        price: this.getMoviePriceAmount(),
                        end: moment()
                            .add(1, 'days')
                            .format('YYYY-MM-DDTHH:MM:00'),
                    };

                    DAL.validatePayPerView(
                        'Movies',
                        this.state.movie.id,
                        this.getMoviePriceAmount(),
                        this.state.movie.name,
                        GLOBAL.Payment_Method,
                        GLOBAL.ImageUrlCMS + this.state.movie.backdrop,
                        GLOBAL.ImageUrlCMS + this.state.movie.poster,
                    ).then(data => {
                        if (data == true) {
                            GLOBAL.Rented_Movies.push(rented);
                            this.setState({
                                button_ppv_success: true,
                                button_ppv: false,
                                payment_done: true,
                                payment_pending: false,
                            });
                        } else {
                            this.setState({
                                button_ppv_fail: true,
                                button_ppv: false,
                                payment_done: false,
                                payment_pending: false,
                            });
                        }
                    });
                } catch (error) {
                    this.setState({
                        button_ppv_fail: true,
                        button_ppv: false,
                        payment_done: false,
                        payment_pending: false,
                    });
                }
            },
        );
    }
    _onPressMoviePlay() {
        var isMoviesStored = UTILS.getProfile(
            'movie_progress',
            GLOBAL.Movie.id,
            0,
        );
        var askResume = false;
        var askResumeTime = 0;
        if (isMoviesStored != null) {
            askResume = true;
            askResumeTime = Number(isMoviesStored.position);
        }
        var position = '0';
        if (isMoviesStored != null) {
            var percentageVideo =
                isMoviesStored.position / isMoviesStored.total;
            position = percentageVideo * 100;
        }
        if (position > 95) {
            askResume = false;
            askResumeTime = 0;
        }
        GLOBAL.Is_Trailer = false;
        Actions.Player_Movies({
            fromPage: this.state.fromPage,
            askResume: askResume,
            askResumeTime: askResumeTime,
            stores: this.props.stores,
        });
    }
    _onPressMovieRent() {
        this.setState({
            button_ppv: true,
            payment_pending: false,
        });
    }
    _onPressNext() {
        if (this.state.fromPage == 'Home') {
            if (
                GLOBAL.Metro.metromovieitems.length - 1 >
                GLOBAL.Selected_MovieIndex
            ) {
                this.setState({ title: '' });
                GLOBAL.Selected_MovieIndex = GLOBAL.Selected_MovieIndex + 1;
                this.getMovieDetails();
            }
        } else if (this.state.fromPage == 'search') {
            if (GLOBAL.SearchMovies_.length - 1 > GLOBAL.Selected_MovieIndex) {
                this.setState({ title: '' });
                GLOBAL.Selected_MovieIndex = GLOBAL.Selected_MovieIndex + 1;
                this.getMovieDetails();
            }
        } else if (this.state.fromPage == 'tags') {
            if (GLOBAL.Movie_Selected.length - 1 > GLOBAL.Selected_MovieIndex) {
                this.setState({ title: '' });
                GLOBAL.Selected_MovieIndex = GLOBAL.Selected_MovieIndex + 1;
                this.getMovieDetails();
            }
        } else {
            if (GLOBAL.Movie_Selected != null) {
                if (
                    GLOBAL.Movie_Selected.length - 1 >
                    GLOBAL.Selected_MovieIndex
                ) {
                    this.setState({ title: '' });
                    GLOBAL.Selected_MovieIndex = GLOBAL.Selected_MovieIndex + 1;
                    this.getMovieDetails();
                }
            }
        }
    }
    _onPressTrailer() {
        GLOBAL.Is_Trailer = true;
        Actions.Player_Movies({
            fromPage: this.state.fromPage,
            askResume: false,
            askResumeTime: 0,
            stores: this.props.stores,
        });
    }
    _onPressPrevious() {
        if (this.state.fromPage == 'Home') {
            if (GLOBAL.Selected_MovieIndex > 0) {
                this.setState({ title: '' });
                GLOBAL.Selected_MovieIndex = GLOBAL.Selected_MovieIndex - 1;
                this.getMovieDetails();
            }
        } else if (this.state.fromPage == 'search') {
            if (GLOBAL.Selected_MovieIndex > 0) {
                this.setState({ title: '' });
                GLOBAL.Selected_MovieIndex = GLOBAL.Selected_MovieIndex - 1;
                this.getMovieDetails();
            }
        } else if (this.state.fromPage == 'tags') {
            if (GLOBAL.Selected_MovieIndex > 0) {
                this.setState({ title: '' });
                GLOBAL.Selected_MovieIndex = GLOBAL.Selected_MovieIndex - 1;
                this.getMovieDetails();
            }
        } else {
            if (GLOBAL.Selected_MovieIndex > 0) {
                this.setState({ title: '' });
                GLOBAL.Selected_MovieIndex = GLOBAL.Selected_MovieIndex - 1;
                this.getMovieDetails();
            }
        }
    }
    onMovieImageLayout = event => {
        if (this.state.movieimagewidth != 0) return;
        let width = event.nativeEvent.layout.width;
        this.setState({ movieimagewidth: width - 10 });
    };
    getTagLinks(tags) {
        if (tags.length == 0) {
            return null;
        }
        return (
            <FlatList
                data={tags}
                horizontal={true}
                scrollType="no-scroll"
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <Markers Text={item} Color={'#000'} />
                )}
            />
        );
    }
    _openTagsScreen(tags, tag) {
        GLOBAL.Movie_Selected_Row = 0;
        GLOBAL.Movie_Selected_Index = 0;
        Actions.Movies_Tags({
            selected_tag: tag,
            tags: tags,
            MovieIndex: this.props.MovieIndex,
            fromPage: this.state.fromPage,
            stores: this.props.stores,
        });
    }
    openMovie(movie, index) {
        Actions.Movies_Tags_Details({
            MovieIndex: this.props.MovieIndex,
            TagIndex: movie.id,
            fromPage: this.props.fromPage,
            stores: this.props.stores,
        });
    }
    getRelatedPerTag(tag) {
        if (GLOBAL.Tags.find(t => t.tag == tag.item) == undefined) {
            return;
        }
        var movies = GLOBAL.Tags.find(t => t.tag == tag.item).movies;
        return (
            <View
                style={{
                    borderRadius: 5,
                    flex: 1,
                    flexDirection: 'column',
                    padding: GLOBAL.Device_IsPhone ? 10 : 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                    marginBottom: 5,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        backgroundColor: 'rgba(0, 0, 0, 0.00)',
                        padding: 10,
                        width: '100%',
                    }}
                >
                    <Text style={styles.H2}>
                        {LANG.getTranslation('more')} {tag.item}
                    </Text>
                </View>
                <View
                    style={{ flexDirection: 'row', padding: 5 }}
                    onLayout={this.onMovieRowLayout}
                >
                    <MovieList
                        FromPage={'Details'}
                        Movies={movies}
                        Type={'Tags'}
                        Width={this.state.movie_width}
                        horizontal={true}
                        getItemLayout={(data, index) => {
                            return {
                                length: this.state.movies_width,
                                index,
                                offset: this.state.movies_width * index,
                            };
                        }}
                        onPress={(movie, index) => this.openMovie(movie, index)}
                    />
                </View>
            </View>
        );
    }
    getRelatedPerTag_(tag) {
        if (GLOBAL.Tags.find(t => t.tag == tag.item) == undefined) {
            return;
        }
        var movies = GLOBAL.Tags.find(t => t.tag == tag.item).movies;
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    backgroundColor: '#111',
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        paddingHorizontal: 10,
                        paddingTop: 10,
                        width: '100%',
                    }}
                >
                    <Text style={styles.H2}>
                        {LANG.getTranslation('more')} {tag.item}
                    </Text>
                </View>
                <View style={{ justifyContent: 'center', padding: 10 }}>
                    <MovieList
                        FromPage={'Details'}
                        Movies={movies}
                        Type={'Tags'}
                        Width={this.state.movie_width}
                        horizontal={true}
                        getItemLayout={(data, index) => {
                            return {
                                length: this.state.movies_width,
                                index,
                                offset: this.state.movies_width * index,
                            };
                        }}
                        onPress={(movie, index) => this.openMovie(movie, index)}
                    />
                </View>
            </View>
        );
    }
    getRelatedPerTag__(tag) {
        if (GLOBAL.Tags.find(t => t.tag == tag.item) == undefined) {
            return;
        }
        var movies = GLOBAL.Tags.find(t => t.tag == tag.item).movies;
        return (
            <View style={{ flex: 1, flexDirection: 'column' }}>
                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        backgroundColor: '#000',
                        padding: 15,
                    }}
                >
                    <Text style={styles.H4}>
                        {LANG.getTranslation('related')}
                        {LANG.getTranslation('more')} {tag.item}
                    </Text>
                </View>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        paddingVertical: 10,
                        width: GLOBAL.COL_REMAINING_1 - 30,
                        borderTopLeftRadius: 5,
                        borderBottomLeftRadius: 5,
                    }}
                >
                    <MovieList
                        FromPage={'Details'}
                        Movies={movies}
                        Type={'Tags'}
                        Width={this.state.movie_width}
                        horizontal={true}
                        getItemLayout={(data, index) => {
                            return {
                                length: this.state.movies_width,
                                index,
                                offset: this.state.movies_width * index,
                            };
                        }}
                        onPress={(movie, index) => this.openMovie(movie, index)}
                    />
                </View>
            </View>
        );
    }
    _onFavoriteChange() {
        var id = this.state.movie.id;
        var isMovieFavorite = GLOBAL.Favorite_Movies.find(function (element) {
            return element.id == id;
        });
        if (isMovieFavorite != undefined) {
            var newMovies = GLOBAL.Favorite_Movies.filter(
                c => c.id != isMovieFavorite.id,
            );
            GLOBAL.Favorite_Movies = newMovies;
            this.setState({
                favorite: 'Add to Favorites',
                favorite_: false,
            });
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
            var movie = {
                poster: this.state.movie.poster,
                name: this.state.movie.name,
                year: this.state.movie.year,
                id: this.state.id,
            };
            GLOBAL.Favorite_Movies.push(movie);
            this.setState({
                favorite: 'Remove from Favorites',
                favorite_: true,
            });
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
    }
    getMovieCover() {
        var getProgress = UTILS.getProfile('movie_progress', this.state.id);
        var getWatched = false;
        var position = '0';
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
        }
        if (position > 95) {
            getWatched = true;
        }
        if (getWatched == false) {
            if (getProgress == null) {
                return (
                    <View>
                        <Image
                            style={{
                                width: this.state.movieimagewidth,
                                height: this.state.movieimagewidth * 1.5,
                                margin: 10,
                                borderRadius: 3,
                            }}
                            source={{
                                uri: GLOBAL.ImageUrlCMS + this.state.poster,
                            }}
                        ></Image>
                    </View>
                );
            } else {
                return (
                    <View>
                        <Image
                            style={{
                                width: this.state.movieimagewidth,
                                height: this.state.movieimagewidth * 1.5,
                                borderRadius: 3,
                            }}
                            source={{
                                uri: GLOBAL.ImageUrlCMS + this.state.poster,
                            }}
                        ></Image>
                        {!isNaN(position) && (
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    borderTopColor: GLOBAL.Button_Color,
                                    borderTopWidth: 5,
                                    width:
                                        position *
                                        (this.state.movieimagewidth / 100),
                                    marginTop: 0,
                                    borderTopRightRadius: 5,
                                    borderBottomLeftRadius: 5,
                                }}
                            ></View>
                        )}
                    </View>
                );
            }
        } else {
            return (
                <View>
                    <Image
                        style={{
                            width: this.state.movieimagewidth,
                            height: this.state.movieimagewidth * 1.5,
                            borderRadius: 3,
                        }}
                        source={{ uri: GLOBAL.ImageUrlCMS + this.state.poster }}
                    ></Image>
                    <View
                        style={{
                            position: 'absolute',
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            zIndex: 9999,
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <FontAwesome5
                            style={styles.IconsMenuBig}
                            // icon={RegularIcons.checkCircle}
                            name="check-circle"
                        />
                    </View>
                </View>
            );
        }
    }
    render() {
        if (this.state.title == '') {
            return <Loader size={'large'} color={'#e0e0e0'} />;
        }
        if (GLOBAL.Device_IsPhone == false && GLOBAL.App_Theme != 'Iridium') {
            return (
                <Container
                    hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                    hide_menu={false}
                    background={
                        this.state.backdrop == '' ||
                            this.state.backdrop == '001.png'
                            ? GLOBAL.Background
                            : GLOBAL.ImageUrlCMS + this.state.backdrop
                    }
                >
                    <ScrollView style={{ flex: 1 }}>
                        <View
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                marginLeft: 8,
                                marginRight: 8,
                                marginBottom: 5,
                                marginTop: 5,
                                flexDirection: 'row',
                                borderRadius: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 6,
                                    flexDirection: 'row',
                                    margin: 5,
                                }}
                                onLayout={this.onMovieImageLayout}
                            >
                                {this.getMovieCover()}
                            </View>
                            <View
                                style={{
                                    flex: 20,
                                    flexDirection: 'row',
                                    margin: 10,
                                    justifyContent: 'flex-start',
                                    alignContent: 'flex-start',
                                    alignItems: 'flex-start',
                                    alignSelf: 'flex-start',
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'column',
                                        padding: GLOBAL.Device_IsWebTV
                                            ? 30
                                            : 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.00)',
                                        justifyContent: 'flex-start',
                                        alignContent: 'flex-end',
                                        alignItems: 'flex-start',
                                        alignSelf: 'flex-end',
                                        borderRadius: 2,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row' }}>
                                        <View
                                            style={{
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            <StarRating
                                                starStyle={{ margin: 2 }}
                                                fullStarColor={'#fec205'}
                                                disabled={true}
                                                maxStars={5}
                                                rating={Number(
                                                    this.state.rating,
                                                )}
                                                value={0}
                                                emptyStarColor={'#fff'}
                                                starSize={20}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            <FontAwesome5
                                                style={styles.IconsIMDB}
                                                // icon={BrandIcons.imdb}
                                                name="imdb"
                                            />
                                        </View>
                                    </View>
                                    {this.state.logo == undefined && (
                                        <Text style={[styles.H1]}>
                                            {this.state.title}
                                            <Text style={styles.Small}>
                                                {' '}
                                                ({this.state.movie.length}{' '}
                                                {LANG.getTranslation('min')})
                                            </Text>
                                        </Text>
                                    )}
                                    {this.state.logo != undefined && (
                                        <ScaledImage
                                            uri={
                                                GLOBAL.ImageUrlCMS +
                                                this.state.logo
                                            }
                                            width={GLOBAL.COL_5}
                                        />
                                    )}
                                    <View
                                        style={[
                                            {
                                                marginLeft: -5,
                                                marginTop: 10,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                            },
                                        ]}
                                    >
                                        {/* <Markers Text={this.state.language} Favorite={this.state.favorite_} Color={'forestgreen'} onPress={() => this._onFavoriteChange()} /> */}
                                        {RenderIf(
                                            this.state.language != '' &&
                                            this.state.language != null,
                                        )(
                                            <Markers
                                                Text={this.state.language}
                                                Color={'#000'}
                                            />,
                                        )}
                                        {RenderIf(
                                            this.state.year != '' &&
                                            this.state.year != null,
                                        )(
                                            <Markers
                                                Text={this.state.year}
                                                Color={'#000'}
                                            />,
                                        )}
                                        {RenderIf(
                                            this.state.movie.srt != '' &&
                                            this.state.movie.srt != null,
                                        )(
                                            <Markers
                                                Text={'SRT'}
                                                Color={'#000'}
                                            />,
                                        )}
                                        {RenderIf(
                                            this.state.movie.age_rating !=
                                            null &&
                                            this.state.movie.age_rating !=
                                            '',
                                        )(
                                            <Markers
                                                Text={
                                                    this.state.movie.age_rating
                                                }
                                                Color={'#000'}
                                            />,
                                        )}
                                        {this.getTagLinks(this.state.tags)}
                                    </View>
                                    <Text
                                        numberOfLines={3}
                                        style={[
                                            styles.H5,
                                            { marginVertical: 10 },
                                        ]}
                                    >
                                        {this.state.desc}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.Medium,
                                            { marginBottom: 10 },
                                        ]}
                                    >
                                        {this.state.actors}
                                    </Text>
                                    {RenderIf(
                                        this.checkMoviePayPerView() == true,
                                    )(
                                        <View
                                            style={[
                                                {
                                                    marginLeft: -5,
                                                    marginTop: 5,
                                                    marginBottom: 10,
                                                    flexDirection: 'row',
                                                },
                                            ]}
                                        >
                                            {RenderIf(
                                                this.getAlreadyPurchased() ==
                                                false,
                                            )(
                                                <Markers
                                                    style={[
                                                        styles.Small,
                                                        {
                                                            backgroundColor:
                                                                'forestgreen',
                                                            color: '#fff',
                                                            marginRight: 5,
                                                            padding: 10,
                                                        },
                                                    ]}
                                                    Text={this.getMoviePrice()}
                                                    Color={'forestgreen'}
                                                />,
                                            )}
                                            {RenderIf(
                                                this.getAlreadyPurchased() ==
                                                false,
                                            )(
                                                <Markers
                                                    style={[
                                                        styles.Small,
                                                        {
                                                            backgroundColor:
                                                                'forestgreen',
                                                            color: '#fff',
                                                            marginRight: 5,
                                                            padding: 10,
                                                        },
                                                    ]}
                                                    Text={
                                                        this.state.movie
                                                            .rule_payperview
                                                            .name
                                                    }
                                                    Color={'forestgreen'}
                                                />,
                                            )}
                                            {RenderIf(
                                                this.getAlreadyPurchased() ==
                                                false,
                                            )(
                                                <Markers
                                                    style={[
                                                        styles.Small,
                                                        {
                                                            backgroundColor:
                                                                'forestgreen',
                                                            color: '#fff',
                                                            marginRight: 5,
                                                            padding: 10,
                                                        },
                                                    ]}
                                                    Text={
                                                        LANG.getTranslation(
                                                            'payment_method',
                                                        ) +
                                                        (GLOBAL.Payment_Method ==
                                                            'api'
                                                            ? LANG.getTranslation(
                                                                'invoice',
                                                            )
                                                            : GLOBAL.Payment_Method)
                                                    }
                                                    Color={'#777'}
                                                />,
                                            )}
                                            {RenderIf(
                                                this.getAlreadyPurchased() ==
                                                true,
                                            )(
                                                <Markers
                                                    style={[
                                                        styles.Small,
                                                        {
                                                            backgroundColor:
                                                                'forestgreen',
                                                            color: '#fff',
                                                            marginRight: 5,
                                                            padding: 10,
                                                        },
                                                    ]}
                                                    Text={this.getMovieAccess()}
                                                    Color={'forestgreen'}
                                                />,
                                            )}
                                        </View>,
                                    )}
                                </View>
                            </View>
                        </View>
                        <View
                            style={{
                                height: GLOBAL.Device_IsAppleTV ? 130 : 65,
                                backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                flexDirection: 'row',
                                marginLeft: 8,
                                marginRight: 8,
                                marginBottom: 5,
                                borderRadius: 5,
                                alignContent: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {RenderIf(
                                this.state.trailer_url != '' &&
                                this.state.trailer_url != undefined &&
                                this.state.trailer_url != null,
                            )(
                                <ButtonSized
                                    Color={'#000'}
                                    Width={this.state.button_width}
                                    Padding={0}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this._onPressTrailer()}
                                    Text={LANG.getTranslation('play_trailer')}
                                />,
                            )}
                            {RenderIf(
                                this.getAlreadyPurchased() == true ||
                                this.checkMoviePayPerView() == false,
                            )(
                                <ButtonSized
                                    Color={'#000'}
                                    Width={this.state.button_width}
                                    Padding={0}
                                    underlayColor={GLOBAL.Button_Color}
                                    hasTVPreferredFocus={
                                        GLOBAL.Device_IsTV ? true : false
                                    }
                                    onPress={() => this._onPressMoviePlay()}
                                    Text={LANG.getTranslation('play_movie')}
                                />,
                            )}
                            {RenderIf(
                                this.getAlreadyPurchased() == false &&
                                this.checkMoviePayPerView() == true,
                            )(
                                <ButtonSized
                                    Color={'#000'}
                                    Width={this.state.button_width}
                                    Padding={0}
                                    underlayColor={GLOBAL.Button_Color}
                                    hasTVPreferredFocus={
                                        GLOBAL.Device_IsTV ? true : false
                                    }
                                    onPress={() => this._onPressMovieRent()}
                                    Text={LANG.getTranslation('rent_movie')}
                                />,
                            )}
                            <ButtonSized
                                Color={'#000'}
                                Favorite={this.state.favorite_}
                                Width={this.state.button_width}
                                Icon={
                                    this.state.favorite_ == true
                                        ? "heart"
                                        : "heart-o"
                                }
                                Padding={0}
                                underlayColor={GLOBAL.Button_Color}
                                hasTVPreferredFocus={false}
                                onPress={() => this._onFavoriteChange()}
                                Text={LANG.getTranslation('favorite')}
                            />
                        </View>
                        {RenderIf(
                            this.state.tags.length > 0 &&
                            GLOBAL.Tags.find(
                                t => t.tag == this.state.tags[0].tag,
                            ) == undefined,
                        )(
                            <View
                                style={{
                                    marginLeft: 8,
                                    marginLeft: 8,
                                    marginRight: 8,
                                    marginBottom: 8,
                                    marginLeft: 8,
                                    flexDirection: 'column',
                                    flex: 1,
                                    borderRadius: 5,
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'column',
                                        padding: 0,
                                    }}
                                >
                                    <FlatList
                                        data={this.state.tags}
                                        horizontal={false}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        renderItem={({ item, index }) =>
                                            this.getRelatedPerTag({ item })
                                        }
                                    />
                                </View>
                            </View>,
                        )}
                    </ScrollView>
                    {RenderIf(this.state.button_ppv == true)(
                        <Modal
                            Title={LANG.getTranslation('rent_movie')}
                            Centered={true}
                            TextButton1={'cancel'}
                            TextButton2={'submit'}
                            OnPressButton1={() =>
                                this.setState({ button_ppv: false })
                            }
                            OnPressButton2={() =>
                                this.requestPayPerViewAccess()
                            }
                            TextHeader={this.state.movie.name}
                            TextTagline={this.state.movie.rule_payperview.name}
                            ShowLoader={this.state.payment_pending}
                            TextMain={
                                LANG.getTranslation('price_content') +
                                ' ' +
                                this.getMoviePrice()
                            }
                        ></Modal>,
                    )}
                    {RenderIf(this.state.button_ppv_fail == true)(
                        <Modal
                            Title={LANG.getTranslation('rent_movie')}
                            Centered={true}
                            TextButton1={'close'}
                            OnPressButton1={() =>
                                this.setState({ button_ppv_fail: false })
                            }
                            TextHeader={this.state.movie.name}
                            TextMain={LANG.getTranslation('content_fail')}
                        ></Modal>,
                    )}
                    {RenderIf(this.state.button_ppv_success == true)(
                        <Modal
                            Title={LANG.getTranslation('rent_movie')}
                            Centered={true}
                            TextButton1={'close'}
                            TextButton2={'play_movie'}
                            OnPressButton1={() => this.updateDimensions()}
                            OnPressButton2={() => this._onPressMoviePlay()}
                            TextHeader={this.state.movie.name}
                            TextMain={LANG.getTranslation('content_success')}
                        ></Modal>,
                    )}
                </Container>
            );
        } else if (
            GLOBAL.Device_IsPhone == false &&
            GLOBAL.App_Theme == 'Iridium'
        ) {
            return (
                <Container
                    background={
                        this.state.backdrop == '' ||
                            this.state.backdrop == '001.png'
                            ? GLOBAL.Background
                            : GLOBAL.ImageUrlCMS + this.state.backdrop
                    }
                >
                    <View style={{ flex: 35, flexDirection: 'column' }}>
                        <ImageBackground
                            style={{
                                flex: 1,
                                width: GLOBAL.Device_Width,
                                height: null,
                            }}
                            resizeMode={'stretch'}
                            resizeMethod={'resize'}
                            source={require('../../images/hero_bg.png')}
                        >
                            <ScrollView>
                                <View
                                    style={{
                                        flex: 1,
                                        paddingTop: 5,
                                        paddingLeft: 30,
                                        paddingRight: 30,
                                        paddingTop: 50,
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 20,
                                            flexDirection: 'row',
                                            margin: 10,
                                            justifyContent: 'flex-start',
                                            alignContent: 'flex-start',
                                            alignItems: 'flex-start',
                                            alignSelf: 'flex-start',
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'column',
                                                justifyContent: 'flex-start',
                                                alignContent: 'flex-end',
                                                alignItems: 'flex-start',
                                                alignSelf: 'flex-end',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    paddingTop: 20,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={
                                                            styles.IconsIMDBSmall
                                                        }
                                                        // icon={BrandIcons.imdb}
                                                        name="imdb"
                                                    />
                                                </View>
                                                <View
                                                    style={{
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                    }}
                                                >
                                                    <StarRating
                                                        starStyle={{ margin: 2 }}
                                                        fullStarColor={
                                                            '#fec205'
                                                        }
                                                        disabled={true}
                                                        maxStars={5}
                                                        rating={Number(
                                                            this.state.rating,
                                                        )}
                                                        value={0}
                                                        emptyStarColor={'#fff'}
                                                        starSize={
                                                            GLOBAL.Device_IsAppleTV
                                                                ? 30
                                                                : 15
                                                        }
                                                    />
                                                </View>
                                            </View>
                                            {this.state.logo == undefined && (
                                                <Text style={[styles.H00]}>
                                                    {this.state.title}
                                                    <Text style={styles.Small}>
                                                        {' '}
                                                        (
                                                        {
                                                            this.state.movie
                                                                .length
                                                        }{' '}
                                                        {LANG.getTranslation(
                                                            'min',
                                                        )}
                                                        )
                                                    </Text>
                                                </Text>
                                            )}
                                            {this.state.logo != undefined && (
                                                <ScaledImage
                                                    uri={
                                                        GLOBAL.ImageUrlCMS +
                                                        this.state.logo
                                                    }
                                                    width={GLOBAL.COL_5}
                                                />
                                            )}
                                            <View
                                                style={[
                                                    {
                                                        marginTop: 10,
                                                        flexDirection: 'row',
                                                        justifyContent:
                                                            'center',
                                                        alignContent: 'center',
                                                        alignItems: 'center',
                                                    },
                                                ]}
                                            >
                                                {/* <Markers Text={this.state.language} Favorite={this.state.favorite_} Color={'forestgreen'} onPress={() => this._onFavoriteChange()} /> */}
                                                {RenderIf(
                                                    this.state.language != '' &&
                                                    this.state.language !=
                                                    null,
                                                )(
                                                    <Markers
                                                        Text={
                                                            this.state.language
                                                        }
                                                        Color={'#000'}
                                                    />,
                                                )}
                                                {RenderIf(
                                                    this.state.year != '' &&
                                                    this.state.year != null,
                                                )(
                                                    <Markers
                                                        Text={this.state.year}
                                                        Color={'#000'}
                                                    />,
                                                )}
                                                {RenderIf(
                                                    this.state.movie.srt !=
                                                    '' &&
                                                    this.state.movie.srt !=
                                                    null,
                                                )(
                                                    <Markers
                                                        Text={'SRT'}
                                                        Color={'#000'}
                                                    />,
                                                )}
                                                {RenderIf(
                                                    this.state.movie
                                                        .age_rating != null &&
                                                    this.state.movie
                                                        .age_rating != '',
                                                )(
                                                    <Markers
                                                        Text={
                                                            this.state.movie
                                                                .age_rating
                                                        }
                                                        Color={'#000'}
                                                    />,
                                                )}
                                                {this.getTagLinks(
                                                    this.state.tags,
                                                )}
                                            </View>
                                            <Text
                                                numberOfLines={8}
                                                style={[
                                                    styles.H5,
                                                    styles.Shadow,
                                                    {
                                                        marginTop: 30,
                                                        marginBottom: 10,
                                                        width:
                                                            GLOBAL.Device_Width -
                                                            300,
                                                    },
                                                ]}
                                            >
                                                {this.state.desc}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.Medium,
                                                    styles.Shadow,
                                                    { marginBottom: 30 },
                                                ]}
                                            >
                                                {this.state.actors}
                                            </Text>
                                            {RenderIf(
                                                this.checkMoviePayPerView() ==
                                                true,
                                            )(
                                                <View
                                                    style={[
                                                        {
                                                            marginTop: 10,
                                                            marginBottom: 10,
                                                            flexDirection:
                                                                'row',
                                                        },
                                                    ]}
                                                >
                                                    {RenderIf(
                                                        this.getAlreadyPurchased() ==
                                                        false,
                                                    )(
                                                        <Markers
                                                            style={[
                                                                styles.Small,
                                                                {
                                                                    backgroundColor:
                                                                        'forestgreen',
                                                                    color: '#fff',
                                                                    marginRight: 5,
                                                                    padding: 10,
                                                                },
                                                            ]}
                                                            Text={this.getMoviePrice()}
                                                            Color={
                                                                'forestgreen'
                                                            }
                                                        />,
                                                    )}
                                                    {RenderIf(
                                                        this.getAlreadyPurchased() ==
                                                        false,
                                                    )(
                                                        <Markers
                                                            style={[
                                                                styles.Small,
                                                                {
                                                                    backgroundColor:
                                                                        'forestgreen',
                                                                    color: '#fff',
                                                                    marginRight: 5,
                                                                    padding: 10,
                                                                },
                                                            ]}
                                                            Text={
                                                                this.state.movie
                                                                    .rule_payperview
                                                                    .name
                                                            }
                                                            Color={
                                                                'forestgreen'
                                                            }
                                                        />,
                                                    )}
                                                    {RenderIf(
                                                        this.getAlreadyPurchased() ==
                                                        false,
                                                    )(
                                                        <Markers
                                                            style={[
                                                                styles.Small,
                                                                {
                                                                    backgroundColor:
                                                                        'forestgreen',
                                                                    color: '#fff',
                                                                    marginRight: 5,
                                                                    padding: 10,
                                                                },
                                                            ]}
                                                            Text={
                                                                LANG.getTranslation(
                                                                    'payment_method',
                                                                ) +
                                                                (GLOBAL.Payment_Method ==
                                                                    'api'
                                                                    ? LANG.getTranslation(
                                                                        'invoice',
                                                                    )
                                                                    : GLOBAL.Payment_Method)
                                                            }
                                                            Color={'#777'}
                                                        />,
                                                    )}
                                                    {RenderIf(
                                                        this.getAlreadyPurchased() ==
                                                        true,
                                                    )(
                                                        <Markers
                                                            style={[
                                                                styles.Small,
                                                                {
                                                                    backgroundColor:
                                                                        'forestgreen',
                                                                    color: '#fff',
                                                                    marginRight: 5,
                                                                    padding: 10,
                                                                },
                                                            ]}
                                                            Text={this.getMovieAccess()}
                                                            Color={
                                                                'forestgreen'
                                                            }
                                                        />,
                                                    )}
                                                </View>,
                                            )}
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    width:
                                                        this.state
                                                            .button_width * 4,
                                                    paddingVertical: 10,
                                                    marginLeft: -5,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    {RenderIf(
                                                        this.state
                                                            .trailer_url !=
                                                        '' &&
                                                        this.state
                                                            .trailer_url !=
                                                        undefined &&
                                                        this.state
                                                            .trailer_url !=
                                                        null,
                                                    )(
                                                        <ButtonSized
                                                            Color={'#000'}
                                                            Width={
                                                                this.state
                                                                    .button_width
                                                            }
                                                            Icon={
                                                                "film"
                                                            }
                                                            Padding={0}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
                                                            hasTVPreferredFocus={
                                                                false
                                                            }
                                                            onPress={() =>
                                                                this._onPressTrailer()
                                                            }
                                                            Text={LANG.getTranslation(
                                                                'play_trailer',
                                                            )}
                                                        />,
                                                    )}
                                                    {RenderIf(
                                                        this.getAlreadyPurchased() ==
                                                        true ||
                                                        this.checkMoviePayPerView() ==
                                                        false,
                                                    )(
                                                        <ButtonSized
                                                            Color={'#000'}
                                                            Width={
                                                                this.state
                                                                    .button_width
                                                            }
                                                            Icon={
                                                                "play-circle"
                                                            }
                                                            Padding={0}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
                                                            hasTVPreferredFocus={
                                                                GLOBAL.Device_IsTV
                                                                    ? false
                                                                    : true
                                                            }
                                                            onPress={() =>
                                                                this._onPressMoviePlay()
                                                            }
                                                            Text={LANG.getTranslation(
                                                                'play_movie',
                                                            )}
                                                        />,
                                                    )}
                                                    {RenderIf(
                                                        this.getAlreadyPurchased() ==
                                                        false &&
                                                        this.checkMoviePayPerView() ==
                                                        true,
                                                    )(
                                                        <ButtonSized
                                                            Color={'#000'}
                                                            Width={
                                                                this.state
                                                                    .button_width
                                                            }
                                                            Icon={
                                                                "play-circle"
                                                            }
                                                            Padding={0}
                                                            underlayColor={
                                                                GLOBAL.Button_Color
                                                            }
                                                            hasTVPreferredFocus={
                                                                GLOBAL.Device_IsTV
                                                                    ? false
                                                                    : true
                                                            }
                                                            onPress={() =>
                                                                this._onPressMovieRent()
                                                            }
                                                            Text={LANG.getTranslation(
                                                                'rent_movie',
                                                            )}
                                                        />,
                                                    )}
                                                    <ButtonSized
                                                        Color={'#000'}
                                                        Favorite={
                                                            this.state.favorite_
                                                        }
                                                        Width={
                                                            this.state
                                                                .button_width
                                                        }
                                                        Icon={
                                                            this.state
                                                                .favorite_ ==
                                                                true
                                                                ? "heart"
                                                                : "heart-o"
                                                        }
                                                        Padding={0}
                                                        underlayColor={
                                                            GLOBAL.Button_Color
                                                        }
                                                        hasTVPreferredFocus={
                                                            false
                                                        }
                                                        onPress={() =>
                                                            this._onFavoriteChange()
                                                        }
                                                        Text={LANG.getTranslation(
                                                            'favorite',
                                                        )}
                                                    />
                                                </View>
                                            </View>
                                            {RenderIf(
                                                this.state.tags.length > 0 &&
                                                GLOBAL.Tags.find(
                                                    t =>
                                                        t.tag ==
                                                        this.state.tags[0]
                                                            .tag,
                                                ) == undefined,
                                            )(
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        flexDirection: 'column',
                                                        paddingTop: 20,
                                                    }}
                                                >
                                                    <FlatList
                                                        data={this.state.tags}
                                                        horizontal={false}
                                                        keyExtractor={(
                                                            item,
                                                            index,
                                                        ) => index.toString()}
                                                        renderItem={({
                                                            item,
                                                            index,
                                                        }) =>
                                                            this.getRelatedPerTag__(
                                                                { item },
                                                            )
                                                        }
                                                    />
                                                </View>,
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </ScrollView>
                        </ImageBackground>
                    </View>
                    {RenderIf(this.state.button_ppv == true)(
                        <Modal
                            Title={LANG.getTranslation('rent_movie')}
                            Centered={true}
                            TextButton1={'cancel'}
                            TextButton2={'submit'}
                            OnPressButton1={() =>
                                this.setState({ button_ppv: false })
                            }
                            OnPressButton2={() =>
                                this.requestPayPerViewAccess()
                            }
                            TextHeader={this.state.movie.name}
                            TextTagline={this.state.movie.rule_payperview.name}
                            ShowLoader={this.state.payment_pending}
                            TextMain={
                                LANG.getTranslation('price_content') +
                                ' ' +
                                this.getMoviePrice()
                            }
                        ></Modal>,
                    )}
                    {RenderIf(this.state.button_ppv_fail == true)(
                        <Modal
                            Title={LANG.getTranslation('rent_movie')}
                            Centered={true}
                            TextButton1={'close'}
                            OnPressButton1={() =>
                                this.setState({ button_ppv_fail: false })
                            }
                            TextHeader={this.state.movie.name}
                            TextMain={LANG.getTranslation('content_fail')}
                        ></Modal>,
                    )}
                    {RenderIf(this.state.button_ppv_success == true)(
                        <Modal
                            Title={LANG.getTranslation('rent_movie')}
                            Centered={true}
                            TextButton1={'close'}
                            TextButton2={'play_movie'}
                            OnPressButton1={() => this.updateDimensions()}
                            OnPressButton2={() => this._onPressMoviePlay()}
                            TextHeader={this.state.movie.name}
                            TextMain={LANG.getTranslation('content_success')}
                        ></Modal>,
                    )}
                </Container>
            );
        }
    }
}
