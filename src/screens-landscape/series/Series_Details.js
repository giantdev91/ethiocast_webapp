import React, { Component } from 'react';
import {
    BackHandler,
    TVMenuControl,
    Text,
    View,
    Image,
    ScrollView,
    Dimensions,
    ImageBackground,
} from 'react-native';
// import {RegularIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Actions } from 'react-native-router-flux';
import StarRating from 'react-native-star-rating';
import { sendPageReport } from '../../reporting/reporting';

let value = null;
let setValue = null;
export default class Series_Details extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };

        var season_id;
        if (this.props.fromPage == 'Home' && this.props.fromPlayer != true) {
            season_id = this.props.season_name;
        }
        if (this.props.fromPage == 'search' && this.props.fromPlayer != true) {
            var seasonId = '';
            GLOBAL.SeriesStores.some(stores_ => {
                var series_ = stores_.series;
                series_.some(serie_ => {
                    if (
                        serie_.id ==
                        GLOBAL.SearchSeries_[this.props.SeasonIndex].id
                    ) {
                        seasonId = serie_.season[0].id;
                    }
                });
            });
            season_id = seasonId;
        }
        if (
            this.props.fromPlayer != true &&
            (this.props.fromPage == 'Favorites' ||
                this.props.fromPage == 'Watching')
        ) {
            season_id = this.props.season_name;
        }
        if (this.props.fromPage == 'stores' && this.props.fromPlayer != true) {
            season_id = this.props.Season[0].id;
        }
        if (this.props.fromPlayer == true) {
            season_id = this.props.season_id;
        }
        var success = false;
        var season_index = 0;
        var series = [];
        var seasons = [];
        var season = [];
        GLOBAL.SeriesStores.some(stores_ => {
            var series_ = stores_.series;
            series_.some(serie_ => {
                if (serie_.season != undefined) {
                    var season_ = serie_.season.find(s => s.id == season_id);
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
        var lastWatched = UTILS.getProfile('series_watching', series.id);
        if (lastWatched != undefined && this.props.ChangeSeason == undefined) {
            season_index = seasons.findIndex(
                s => s.id == lastWatched.season_id,
            );
            season = seasons[season_index];
        }
        var favorite = false;
        if (GLOBAL.Favorite_Series != undefined) {
            var isMovieFavorite = GLOBAL.Favorite_Series.find(
                f => f.id == season_id,
            );
            if (isMovieFavorite != undefined) {
                favorite = true;
            }
        }
        if (season == undefined) {
            this.backButton();
        }
        GLOBAL.Season = season;
        this.state = {
            reportStartTime: moment().unix(),
            image_width: this.getEpisodeImageWidth(),
            episodeWidth: 0,
            movieimagewidth: 0,
            favorite: 'Add to Favorites',
            favorite_: favorite,
            tvod: false,
            fromPage: this.props.fromPage,
            stores: this.props.stores,
            backdrop: GLOBAL.ImageUrlCMS + GLOBAL.Season.backdrop,
            episodes: GLOBAL.Season.episodes,
            seasons: seasons,
            season_index: season_index,
            episode_index: 0,
            series: series,
            description:
                GLOBAL.Season.descriptions == undefined
                    ? ''
                    : GLOBAL.Season.descriptions.length > 0
                        ? GLOBAL.Season.descriptions[0].description
                        : '',
            year: GLOBAL.Season.year,
            language: GLOBAL.Season.language,
            tags: GLOBAL.Season.tags,
            poster: GLOBAL.ImageUrlCMS + GLOBAL.Season.poster,
            logo: GLOBAL.ImageUrlCMS + GLOBAL.Season.logo,
            season: GLOBAL.Season,
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
            if (this.props.fromPage == 'Home') {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            } else if (this.props.fromPage == 'Watching') {
                Actions.MyList();
            } else if (this.props.fromPage == 'Favorites') {
                Actions.MyFavorites();
            } else if (this.props.fromPage == 'search') {
                Actions.SearchBox();
            } else {
                Actions.Series_Stores({
                    stores: this.state.stores,
                    sub_store: this.props.sub_store,
                });
            }
        }
    };
    updateDimensions() {
        Actions.Series_Details({
            fromPage: this.props.fromPage,
            stores: this.props.stores,
            SeasonIndex: this.props.SeasonIndex,
            sub_store: this.props.sub_store,
            Season: this.props.Season,
        });
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
                GLOBAL.Series_Selected = null;
                GLOBAL.Series_Selected_Index = 0;
                GLOBAL.Season_Selected_Index = 0;
                GLOBAL.Season_Selected_Season = null;
                GLOBAL.Season_Selected_Season_ID = 0;
                GLOBAL.Season_Selected_Episode_Index = 0;
                GLOBAL.Season_Selected_Episode_Row = 0;
                if (this.props.fromPage == 'Home') {
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                } else if (this.props.fromPage == 'Watching') {
                    Actions.MyList();
                } else if (this.props.fromPage == 'Favorites') {
                    Actions.MyFavorites();
                } else if (this.props.fromPage == 'search') {
                    Actions.SearchBox();
                } else {
                    Actions.Series_Stores({
                        stores: this.state.stores,
                        sub_store: this.props.sub_store,
                    });
                }
                return true;
            },
        );
    }
    componentWillUnmount() {
        sendPageReport(
            'Season Details',
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
        if (GLOBAL.Device_IsTV && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }
    _onStartPlayingEpisodeById(id) {
        var isSerieStored = UTILS.getProfile(
            'series_progress',
            GLOBAL.Season.id,
            id,
        );
        var askResume = false;
        var askResumeTime = 0;
        var position = 0;
        if (isSerieStored != null) {
            var percentageVideo = isSerieStored.position / isSerieStored.total;
            position = percentageVideo * 100;
        }
        if (isSerieStored != null) {
            askResume = true;
            askResumeTime = Number(isSerieStored.position);
        }
        GLOBAL.Episode_Index = currentIndex;
        GLOBAL.Season_Selected_Episode_Index = GLOBAL.Episode_Index;
        GLOBAL.Season_Selected_Episode_Row = GLOBAL.Episode_Index;
        Actions.Player_Series({
            fromPage: this.props.fromPage,
            askResume: askResume,
            askResumeTime: askResumeTime,
            stores: this.props.stores,
            SeasonIndex: this.props.SeasonIndex,
            sub_store: this.props.sub_store,
            season: this.state.season,
            series: this.state.series,
            episode_index: currentIndex,
        });
    }
    _onStartPlayingEpisode(index) {
        GLOBAL.Season_Selected_Episode_Index = index;
        GLOBAL.Season_Selected_Episode_Row = index;
        var isSerieStored = UTILS.getProfile(
            'series_progress',
            GLOBAL.Season.id,
            index,
        );
        var askResume = false;
        var askResumeTime = 0;
        var position = 0;
        if (isSerieStored != null) {
            var percentageVideo = isSerieStored.position / isSerieStored.total;
            position = percentageVideo * 100;
        }
        if (isSerieStored != null) {
            askResume = true;
            askResumeTime = Number(isSerieStored.position);
        }
        GLOBAL.Episode_Index = index;
        Actions.Player_Series({
            fromPage: this.props.fromPage,
            askResume: askResume,
            askResumeTime: askResumeTime,
            stores: this.props.stores,
            SeasonIndex: this.props.SeasonIndex,
            sub_store: this.props.sub_store,
            series: this.state.series,
            episode_index: index,
        });
    }
    _changeSeason(index) {
        GLOBAL.Season_Selected_Episode_Index = 0;
        GLOBAL.Season_Selected_Index = index;
        GLOBAL.Season_Index = index;
        GLOBAL.Season_Selected_Episode_Index = 0;
        GLOBAL.Season_Selected_Episode_Row = 0;
        var season = this.state.seasons[GLOBAL.Season_Index];
        GLOBAL.Season = season;
        var desc = '';
        if (GLOBAL.Season.descriptions[0] != undefined) {
            desc = GLOBAL.Season.descriptions[0].description;
        }
        this.setState({
            id: season.id,
            //title: season.name,
            description: desc,
            actors: GLOBAL.Season.actors,
            year: GLOBAL.Season.year,
            language: GLOBAL.Season.language,
            tags: GLOBAL.Season.tags,
            poster: GLOBAL.ImageUrlCMS + GLOBAL.Season.poster,
            backdrop: GLOBAL.ImageUrlCMS + GLOBAL.Season.backdrop,
            episodes: GLOBAL.Season.episodes,
            rating: parseInt(GLOBAL.Season.rating),
            season: GLOBAL.Season,
            season_index: index,
            episode_index: 0,

            // price: GLOBAL.Series_Stores.metroserieitems[GLOBAL.Selected_SeriesID].prices
        });
        //Actions.Series_Details({ season_name: season.id, fromPage: this.props.fromPage, stores: this.props.stores, SeasonIndex: this.props.SeasonIndex, sub_store: this.props.sub_store, Season: this.props.Season, ChangeSeason: true });
    }
    _setFocusOnFirst(index) {
        if (this.state.episode_index == index && GLOBAL.Device_IsTV == true) {
            return true;
        }
        return false;
    }
    getEpisodeImage_(image) {
        if (image == null || image == '') {
            return (
                <Image
                    source={require('../../images/placeholder_episodes.jpg')}
                    style={{ width: 100, height: 50 }}
                ></Image>
            );
        } else {
            return (
                <Image
                    source={{ uri: GLOBAL.ImageUrlCMS + image }}
                    style={{ width: 100, height: 50 }}
                    resizeMethod={'scale'}
                    resizeMode={'contain'}
                ></Image>
            );
        }
    }
    getEpisodeImageWidth = () => {
        var width = GLOBAL.COL_1;
        if (GLOBAL.Device_IsPhone == false && GLOBAL.Device_IsTablet == false) {
            width = width / 3;
        } else if (
            GLOBAL.Device_IsPhone == false &&
            GLOBAL.Device_IsTablet == true
        ) {
            width = width / 2.5;
        }
        return width;
    };
    getEpisodeImage(image) {
        var width = GLOBAL.COL_REMAINING_3;
        if (GLOBAL.Device_IsPhone) {
            width = GLOBAL.COL_1 - 40;
        }
        if (image == null || image == '') {
            return (
                <Image
                    source={require('../../images/placeholder_episodes.jpg')}
                    style={{
                        width: width,
                        height: width / 1.8,
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                    }}
                ></Image>
            );
        } else {
            return (
                <Image
                    source={{ uri: GLOBAL.ImageUrlCMS + image }}
                    style={{
                        width: width,
                        height: width / 1.75,
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                    }}
                    resizeMethod={'scale'}
                    resizeMode={'contain'}
                ></Image>
            );
        }
    }
    _onFavoriteChange() {
        var id = this.state.season.id;
        if (GLOBAL.Favorite_Series == undefined) {
            return null;
        }

        var isMovieFavorite = GLOBAL.Favorite_Series.find(function (element) {
            return element.id == id;
        });

        if (isMovieFavorite != undefined) {
            var newMovies = GLOBAL.Favorite_Series.filter(
                c => c.id != isMovieFavorite.id,
            );
            GLOBAL.Favorite_Series = newMovies;
            this.setState({
                favorite: 'Add to Favorites',
                favorite_: false,
            });
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
            var series = {
                poster: this.state.season.poster,
                backdrop: this.state.season.backdrop,
                name: this.state.season.name,
                id: this.state.season.id,
            };
            GLOBAL.Favorite_Series.push(series);
            this.setState({
                favorite: 'Remove from Favorites',
                favorite_: true,
            });
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
    }
    getCrew(crew) {
        if (crew == undefined) {
            return '';
        }
        var crewOut = '';
        crew.forEach(element => {
            crewOut = element + ' ' + crewOut;
        });
        return crewOut;
    }
    getEpisodeProgress(item, index) {
        var width = GLOBAL.Device_Width;
        if (GLOBAL.Device_IsPhone == false) {
            width = width / 3;
        }
        var getProgress = UTILS.getProfile(
            'series_progress',
            GLOBAL.Season.id,
            index,
        );
        var position = 0;
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
        }
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                key={index}
                hasTVPreferredFocus={this._setFocusOnFirst(index)}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onStartPlayingEpisode(index)}
            >
                <View
                    style={{
                        flexDirection: 'column',
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                        padding: 10,
                        borderRadius: 5,
                        height: GLOBAL.ROW_REMAINING_10,
                        paddingLeft: 20,
                    }}
                >
                    <View>
                        <Text numberOfLines={3} style={styles.H5}>
                            {index + 1}. {item.name}
                        </Text>
                    </View>
                    <View style={{ paddingTop: 10 }}>
                        {!isNaN(position) && (
                            <View
                                style={{
                                    borderTopColor: GLOBAL.Button_Color,
                                    borderTopWidth: 2,
                                    width: position * ((width - 100) / 100),
                                }}
                            ></View>
                        )}
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
    getEpisodeFullProgress(item, index) {
        var getProgress = UTILS.getProfile(
            'series_progress',
            GLOBAL.Season.id,
            index,
        );
        var position = 0;
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
        }
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                onFocus={() => this.focusEpisode(item)}
                key={index}
                hasTVPreferredFocus={false}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onStartPlayingEpisode(index)}
            >
                <View
                    style={{
                        flexDirection: 'column',
                        borderWidth: 5,
                        borderColor: '#000',
                        backgroundColor: '#000',
                        borderRadius: 5,
                    }}
                >
                    <View>
                        {this.getEpisodeImage(item.image)}
                        {!isNaN(position) && (
                            <View
                                style={{
                                    borderTopColor: GLOBAL.Button_Color,
                                    borderTopWidth: 4,
                                    width:
                                        position *
                                        (GLOBAL.COL_REMAINING_3 / 100),
                                }}
                            ></View>
                        )}
                        <View
                            style={{
                                flexDirection: 'column',
                                padding: 5,
                                width: GLOBAL.COL_REMAINING_3,
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={[styles.H2, styles.Shadow]}
                            >
                                {item.name}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    styles.Shadow,
                                    { paddingBottom: 5, color: '#999' },
                                ]}
                            >
                                SE{item.season_number}{' '}
                                {LANG.getTranslation('episode')} {index + 1}
                            </Text>
                            <Text
                                numberOfLines={3}
                                style={[styles.Medium, { paddingTop: 5 }]}
                            >
                                {item.description}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
    getEpisodeFullProgress_(item, index) {
        var width = GLOBAL.COL_1 - 40;
        var getProgress = UTILS.getProfile(
            'series_progress',
            GLOBAL.Season.id,
            index,
        );
        var position = 0;
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
            // this.setState({
            //   last_episode: item,
            //   last_episode_index: index
            // })
        }
        return (
            <TouchableHighlightFocus
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onStartPlayingEpisode(index)}
            >
                <View
                    style={{
                        flexDirection: 'column',
                        backgroundColor: '#111',
                        padding: 5,
                        justifyContent: 'flex-start',
                        paddingBottom: 20,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'column',
                            paddingLeft: 5,
                            paddingHorizontal: 10,
                        }}
                    >
                        <Text numberOfLines={1} style={[styles.H2, {}]}>
                            {index + 1}. {item.name}
                        </Text>
                    </View>
                    <View style={{ paddingTop: 10 }}>
                        <View>
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
                                <ButtonCircle
                                    underlayColor={GLOBAL.Button_Color}
                                    Size={50}
                                    LocalImage={require('../../images/playnowcircle.png')}
                                    onPress={() =>
                                        this._onStartPlayingEpisode(index)
                                    }
                                ></ButtonCircle>
                            </View>
                            <View style={{ backgroundColor: '#000' }}>
                                {this.getEpisodeImage(item.image)}
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            paddingTop: 0,
                            paddingLeft: 3,
                            paddingBottom: 10,
                        }}
                    >
                        {!isNaN(position) && (
                            <View
                                style={{
                                    borderTopColor: GLOBAL.Button_Color,
                                    borderTopWidth: 4,
                                    width: position * (width / 100),
                                }}
                            ></View>
                        )}
                    </View>
                    <View style={{ flexDirection: 'column', paddingLeft: 10 }}>
                        <Text
                            numberOfLines={3}
                            style={[styles.Standard, { paddingTop: 5 }]}
                        >
                            {item.description}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Standard,
                                { color: '#888', paddingTop: 10 },
                            ]}
                        >
                            {this.getCrew(item.guest_cast)}
                        </Text>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
    onEpisodeLayout = event => {
        if (this.state.episodeWidth != 0) return;
        let width = event.nativeEvent.layout.width;
        this.setState({ episodeWidth: width - 10 });
    };
    renderSeasonMobile(item, index) {
        return (
            <TouchableHighlightFocus
                style={{ borderRadius: 5, width: 100 }}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._changeSeason(index)}
            >
                <View style={styles.menu_vertical_text}>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.Medium,
                            { color: '#fff', paddingHorizontal: 10 },
                        ]}
                    >
                        {item.name}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
    renderSeason(item, index) {
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                style={{ borderRadius: 5, width: 200 }}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._changeSeason(index)}
            >
                <View style={styles.menu_vertical_text}>
                    <Text numberOfLines={1} style={styles.Menu}>
                        {item.name}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }

    renderSeason_(item, index) {
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                style={{ borderRadius: 5 }}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._changeSeason(index)}
            >
                <View style={styles.menu_vertical_text}>
                    <Text
                        numberOfLines={1}
                        style={[styles.Menu, { padding: 10 }]}
                    >
                        {item.name}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
    onMovieImageLayout = event => {
        if (this.state.movieimagewidth != 0) return;
        let width = event.nativeEvent.layout.width;
        this.setState({ movieimagewidth: width - 10 });
    };
    getMovieCover() {
        return (
            <View>
                <Image
                    style={{
                        width: this.state.movieimagewidth,
                        height: this.state.movieimagewidth * 1.5,
                        borderRadius: 3,
                    }}
                    source={{ uri: this.state.poster }}
                ></Image>
            </View>
        );
    }
    loadDetailsEpisode = dataFromChild => {
        value = dataFromChild[0];
        setValue = dataFromChild[1];
    };
    focusEpisode(episode) {
        if (GLOBAL.App_Theme != 'Iridium') {
            setValue(episode);
        }
    }

    getContinueSeries() {
        var lastWatched = UTILS.getProfile(
            'series_watching',
            this.state.series.id,
        );
        if (lastWatched != undefined && this.state.seasons != undefined) {
            var season_number = 1;
            var season_ = this.state.seasons.find(
                s => s.id == lastWatched.season_id,
            );
            if (season_.episodes.length > 0) {
                if (season_.episodes[0].season_number == null) {
                    season_number =
                        LANG.getTranslation('season') + ' ' + season_number;
                } else {
                    season_number =
                        LANG.getTranslation('season') +
                        ' ' +
                        season_.episodes[0].season_number;
                }
            }
            return (
                LANG.getTranslation('continue') +
                ' ' +
                season_number +
                ' ' +
                LANG.getTranslation('episode') +
                ' ' +
                (lastWatched.index + 1)
            );
        } else {
            var season_number = 1;
            if (this.state.season.episodes != undefined) {
                if (this.state.season.episodes.length > 0) {
                    if (this.state.season.episodes[0].season_number == null) {
                        season_number =
                            LANG.getTranslation('season') + ' ' + season_number;
                    } else {
                        season_number =
                            LANG.getTranslation('season') +
                            ' ' +
                            this.state.season.episodes[0].season_number;
                    }
                }
            }
            return (
                LANG.getTranslation('start') +
                ' ' +
                season_number +
                ' ' +
                LANG.getTranslation('episode') +
                ' 1'
            );
        }
    }
    continueWatchSeries() {
        var lastWatched = UTILS.getProfile(
            'series_watching',
            this.state.series.id,
        );
        if (lastWatched != undefined) {
            this._onStartPlayingEpisode(lastWatched.index);
        } else {
            if (this.state.season.episodes.length > 0) {
                this._onStartPlayingEpisode(0);
            }
        }
    }
    render() {
        if (GLOBAL.Device_IsPhone == false && GLOBAL.App_Theme != 'Iridium') {
            return (
                <Container
                    background={
                        this.state.backdrop == '' ||
                            this.state.backdrop == '001.png'
                            ? GLOBAL.Background
                            : this.state.backdrop
                    }
                    hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                    hide_menu={
                        GLOBAL.App_Theme == 'Honua'
                            ? false
                            : GLOBAL.App_Theme == 'Akua' &&
                                !GLOBAL.Device_IsTablet &&
                                !GLOBAL.Device_IsPhone &&
                                !GLOBAL.Device_IsWebTV &&
                                GLOBAL.Device_IsSmartTV
                                ? true
                                : false
                    }
                >
                    <ScrollView>
                        <View
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                marginTop: GLOBAL.App_Theme == 'Honua' ? 4 : 8,
                                marginLeft: 8,
                                marginRight: 8,
                                flexDirection: 'row',
                                borderRadius: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 7,
                                    flexDirection: 'row',
                                    margin: 5,
                                }}
                                onLayout={this.onMovieImageLayout}
                            >
                                {this.getMovieCover()}
                            </View>
                            <View
                                style={{
                                    flex: 27,
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
                                        flex: 27,
                                        flexDirection: 'column',
                                        padding: GLOBAL.Device_IsWebTV
                                            ? 40
                                            : 20,
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
                                                disabled={true}
                                                maxStars={5}
                                                rating={Number(
                                                    this.state.season.rating,
                                                )}
                                                value={0}
                                                emptyStarColor={'#fff'}
                                                fullStarColor={'#fec205'}
                                                starSize={
                                                    GLOBAL.Device_IsAppleTV
                                                        ? 30
                                                        : 15
                                                }
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
                                                style={styles.IconsIMDBSmall}
                                                // icon={BrandIcons.imdb}
                                                name="imdb"
                                            />
                                        </View>
                                    </View>
                                    {this.state.logo == undefined && (
                                        <Text style={[styles.H0]}>
                                            {this.state.series.name}
                                        </Text>
                                    )}
                                    {this.state.logo != undefined && (
                                        <ScaledImage
                                            uri={this.state.logo}
                                            width={GLOBAL.COL_4}
                                        />
                                    )}
                                    <View
                                        style={[
                                            {
                                                marginLeft: -5,
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                paddingTop: 10,
                                            },
                                        ]}
                                    >
                                        {/* <Markers Text={this.state.season.language} Favorite={this.state.favorite_} Color={'forestgreen'} onPress={() => this._onFavoriteChange()} /> */}
                                        <Markers
                                            Text={this.state.season.language}
                                            Color={'#000'}
                                        />
                                        <Markers
                                            Text={this.state.season.year}
                                            Color={'#000'}
                                        />
                                        {RenderIf(
                                            this.state.age_rating != null &&
                                            this.state.age_rating != '',
                                        )(
                                            <Markers
                                                Text={
                                                    this.state.season.age_rating
                                                }
                                                Color={'#000'}
                                            />,
                                        )}
                                    </View>
                                    <Text
                                        numberOfLines={3}
                                        style={[
                                            styles.H5,
                                            styles.Shadow,
                                            {
                                                marginVertical: 15,
                                                width:
                                                    GLOBAL.App_Theme == 'Honua'
                                                        ? GLOBAL.Device_Width -
                                                        300 -
                                                        GLOBAL.Menu_Width
                                                        : GLOBAL.Device_Width -
                                                        300,
                                            },
                                        ]}
                                    >
                                        {this.state.description}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.Medium,
                                            { marginBottom: 10 },
                                        ]}
                                    >
                                        {this.state.season.actors}
                                    </Text>
                                    {RenderIf(this.state.tvod == true)(
                                        <View
                                            style={[
                                                {
                                                    marginTop: 10,
                                                    marginBottom: 10,
                                                    flexDirection: 'row',
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.Medium,
                                                    {
                                                        backgroundColor:
                                                            'forestgreen',
                                                        color: '#fff',
                                                        marginRight: 5,
                                                        padding: 10,
                                                    },
                                                ]}
                                            >
                                                200 Credits
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.Medium,
                                                    {
                                                        backgroundColor: '#777',
                                                        color: '#fff',
                                                        marginRight: 5,
                                                        padding: 10,
                                                    },
                                                ]}
                                            >
                                                Payment Method: Wallet
                                            </Text>
                                        </View>,
                                    )}
                                    <ButtonSized
                                        Color={'#000'}
                                        Favorite={this.state.favorite_}
                                        Width={200}
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
                            </View>
                        </View>
                        <View
                            style={[
                                styles.Categories,
                                {
                                    margin: 8,
                                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                    marginLeft: 8,
                                    marginRight: 8,
                                    borderRadius: 5,
                                    padding: 5,
                                },
                            ]}
                        >
                            <FlatList
                                style={styles.elements}
                                data={this.state.seasons}
                                horizontal={true}
                                scrollType="category"
                                Width={200}
                                extraData={this.state.seasons}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) =>
                                    this.renderSeason(item, index)
                                }
                            />
                        </View>
                        <View
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                marginLeft: 8,
                                marginRight: 8,
                                marginBottom: 8,
                                flexDirection: 'column',
                                flexGrow: 50,
                                borderRadius: 5,
                            }}
                        >
                            {RenderIf(
                                GLOBAL.UserInterface.series
                                    .enable_episodes_full_metadata == false,
                            )(
                                <View
                                    style={{ flex: 1, flexDirection: 'column' }}
                                >
                                    <FlatList
                                        ref={ref => {
                                            this.flatListRef = ref;
                                        }}
                                        data={this.state.episodes}
                                        horizontal={false}
                                        numColumns={1}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        removeClippedSubviews={true}
                                        getItemLayout={(data, index) => {
                                            return {
                                                length: GLOBAL.ROW_REMAINING_10,
                                                index,
                                                offset:
                                                    GLOBAL.ROW_REMAINING_10 *
                                                    index,
                                            };
                                        }}
                                        renderItem={({ item, index }) => {
                                            return this.getEpisodeProgress(
                                                item,
                                                index,
                                            );
                                        }}
                                    />
                                </View>,
                            )}
                            {RenderIf(
                                GLOBAL.UserInterface.series
                                    .enable_episodes_full_metadata != false,
                            )(
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'column',
                                        padding: 10,
                                    }}
                                >
                                    <FlatList
                                        ref={ref => {
                                            this.flatListRef = ref;
                                        }}
                                        data={this.state.episodes}
                                        horizontal={true}
                                        Width={GLOBAL.Device_Width / 3}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        removeClippedSubviews={true}
                                        scrollType={'episodes'}
                                        getItemLayout={(data, index) => {
                                            return {
                                                length: this.state.image_width,
                                                index,
                                                offset:
                                                    this.state.image_width *
                                                    index,
                                            };
                                        }}
                                        renderItem={({ item, index }) => {
                                            return this.getEpisodeFullProgress(
                                                item,
                                                index,
                                            );
                                        }}
                                    />
                                </View>,
                            )}
                        </View>
                    </ScrollView>
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
                            : this.state.backdrop
                    }
                >
                    <View style={{ flex: 1, flexDirection: 'row' }}>
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
                                            paddingTop: GLOBAL.Device_IsAppleTV
                                                ? 50
                                                : 30,
                                            paddingLeft: GLOBAL.Device_IsAppleTV
                                                ? 50
                                                : 30,
                                            paddingRight:
                                                GLOBAL.Device_IsAppleTV
                                                    ? 50
                                                    : 30,
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
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                }}
                                            >
                                                <StarRating
                                                    starStyle={{ margin: 2 }}
                                                    disabled={true}
                                                    maxStars={5}
                                                    rating={Number(
                                                        this.state.season
                                                            .rating,
                                                    )}
                                                    value={0}
                                                    emptyStarColor={'#fff'}
                                                    fullStarColor={'#fec205'}
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
                                                {this.state.series.name}
                                            </Text>
                                        )}
                                        {this.state.logo != undefined && (
                                            <ScaledImage
                                                uri={this.state.logo}
                                                width={GLOBAL.COL_4}
                                            />
                                        )}
                                        <View
                                            style={[
                                                {
                                                    marginTop: 10,
                                                    flexDirection: 'row',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                },
                                            ]}
                                        >
                                            <Markers
                                                Text={this.state.language}
                                                Color={'#000'}
                                            />
                                            <Markers
                                                Text={this.state.year}
                                                Color={'#000'}
                                            />
                                            {RenderIf(
                                                this.state.age_rating != null &&
                                                this.state.age_rating != '',
                                            )(
                                                <Markers
                                                    Text={this.state.age_rating}
                                                    Color={'#000'}
                                                />,
                                            )}
                                        </View>
                                        <Text
                                            numberOfLines={8}
                                            style={[
                                                styles.H5,
                                                styles.Shadow,
                                                {
                                                    marginTop: 30,
                                                    width:
                                                        GLOBAL.Device_Width -
                                                        300,
                                                },
                                            ]}
                                        >
                                            {this.state.description}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.Medium,
                                                {
                                                    marginTop: 10,
                                                    marginBottom: 30,
                                                },
                                            ]}
                                        >
                                            {this.state.actors}
                                        </Text>
                                        {RenderIf(this.state.tvod == true)(
                                            <View
                                                style={[
                                                    {
                                                        marginTop: 10,
                                                        marginBottom: 10,
                                                        flexDirection: 'row',
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.Medium,
                                                        {
                                                            backgroundColor:
                                                                'forestgreen',
                                                            color: '#fff',
                                                            marginRight: 5,
                                                            padding: 10,
                                                        },
                                                    ]}
                                                >
                                                    200 Credits
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.Medium,
                                                        {
                                                            backgroundColor:
                                                                '#777',
                                                            color: '#fff',
                                                            marginRight: 5,
                                                            padding: 10,
                                                        },
                                                    ]}
                                                >
                                                    Payment Method: Wallet
                                                </Text>
                                            </View>,
                                        )}
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                width: '100%',
                                                paddingVertical: 10,
                                                marginLeft: -5,
                                            }}
                                        >
                                            <View
                                                style={{ flexDirection: 'row' }}
                                            >
                                                <ButtonAutoSize
                                                    Color={'#000'}
                                                    Icon={"play-circle"}
                                                    Padding={0}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    hasTVPreferredFocus={true}
                                                    onPress={() =>
                                                        this.continueWatchSeries()
                                                    }
                                                    Text={this.getContinueSeries()}
                                                />
                                                <ButtonSized
                                                    Favorite={
                                                        this.state.favorite_
                                                    }
                                                    Width={
                                                        GLOBAL.Device_IsAppleTV
                                                            ? (GLOBAL.Device_Width -
                                                                160) /
                                                            4
                                                            : (GLOBAL.Device_Width -
                                                                160) /
                                                            4
                                                    }
                                                    Icon={
                                                        this.state.favorite_ ==
                                                            true
                                                            ? "heart"
                                                            : "heart-o"
                                                    }
                                                    Padding={0}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    hasTVPreferredFocus={false}
                                                    onPress={() =>
                                                        this._onFavoriteChange()
                                                    }
                                                    Text={LANG.getTranslation(
                                                        'favorite',
                                                    )}
                                                />
                                            </View>
                                        </View>

                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'column',
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.80)',
                                                marginTop: 10,
                                                width:
                                                    GLOBAL.COL_REMAINING_1 -
                                                    (GLOBAL.UserInterface.series
                                                        .enable_episodes_full_metadata ==
                                                        false
                                                        ? 45
                                                        : 30),
                                                borderTopLeftRadius: 5,
                                                borderBottomLeftRadius: 5,
                                                borderTopRightRadius: 5,
                                                borderBottomRightRadius: 5,
                                            }}
                                        >
                                            <FlatList
                                                style={styles.elements}
                                                data={this.state.seasons}
                                                horizontal={true}
                                                scrollType="category"
                                                extraData={this.state.seasons}
                                                keyExtractor={(item, index) =>
                                                    index.toString()
                                                }
                                                renderItem={({ item, index }) =>
                                                    this.renderSeason_(
                                                        item,
                                                        index,
                                                    )
                                                }
                                            />
                                        </View>

                                        {RenderIf(
                                            GLOBAL.UserInterface.series
                                                .enable_episodes_full_metadata ==
                                            false,
                                        )(
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'column',
                                                    paddingTop: 20,
                                                    width:
                                                        GLOBAL.COL_REMAINING_1 -
                                                        40,
                                                }}
                                            >
                                                <FlatList
                                                    ref={ref => {
                                                        this.flatListRef = ref;
                                                    }}
                                                    data={this.state.episodes}
                                                    horizontal={false}
                                                    numColumns={1}
                                                    keyExtractor={(
                                                        item,
                                                        index,
                                                    ) => index.toString()}
                                                    removeClippedSubviews={true}
                                                    getItemLayout={(
                                                        data,
                                                        index,
                                                    ) => {
                                                        return {
                                                            length: GLOBAL.ROW_REMAINING_10,
                                                            index,
                                                            offset:
                                                                GLOBAL.ROW_REMAINING_10 *
                                                                index,
                                                        };
                                                    }}
                                                    renderItem={({
                                                        item,
                                                        index,
                                                    }) => {
                                                        return this.getEpisodeProgress(
                                                            item,
                                                            index,
                                                        );
                                                    }}
                                                />
                                            </View>,
                                        )}
                                        {RenderIf(
                                            GLOBAL.UserInterface.series
                                                .enable_episodes_full_metadata !=
                                            false,
                                        )(
                                            <View
                                                style={{
                                                    paddingVertical: 10,
                                                    width:
                                                        GLOBAL.COL_REMAINING_1 -
                                                        30,
                                                }}
                                            >
                                                <FlatList
                                                    ref={ref => {
                                                        this.flatListRef = ref;
                                                    }}
                                                    data={this.state.episodes}
                                                    horizontal={true}
                                                    Width={
                                                        GLOBAL.Device_Width / 3
                                                    }
                                                    keyExtractor={(
                                                        item,
                                                        index,
                                                    ) => index.toString()}
                                                    removeClippedSubviews={true}
                                                    getItemLayout={(
                                                        data,
                                                        index,
                                                    ) => {
                                                        return {
                                                            length: this.state
                                                                .image_width,
                                                            index,
                                                            offset:
                                                                this.state
                                                                    .image_width *
                                                                index,
                                                        };
                                                    }}
                                                    renderItem={({
                                                        item,
                                                        index,
                                                    }) => {
                                                        return this.getEpisodeFullProgress(
                                                            item,
                                                            index,
                                                        );
                                                    }}
                                                />
                                            </View>,
                                        )}
                                    </View>
                                </ScrollView>
                            </ImageBackground>
                        </View>
                    </View>
                </Container>
            );
        }
    }
}
