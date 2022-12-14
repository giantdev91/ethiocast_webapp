import React, { PureComponent } from 'react';
import {
    Text,
    BackHandler,
    TVMenuControl,
    View,
    Dimensions,
    Image,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { isPad } from '../../utils/Util';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const SORT_TYPE_NAME = 1;
const SORT_TYPE_MOVIE_NUMBER = 2;
const MOVIE_TYPE_NAME = 'Toggle View';
export default class Movies_Tags extends PureComponent {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        const sortType = SORT_TYPE_MOVIE_NUMBER;
        const movieType = MOVIE_TYPE_NAME;

        var columns_ =
            GLOBAL.Device_FormFactor == 'WEB' ||
                GLOBAL.Device_FormFactor == 'TV'
                ? 6
                : 6;
        if (GLOBAL.Device_IsPhone == true) {
            columns_ = 3;
        }
        var image_width_ = Dimensions.get('window').width / columns_; // - (GLOBAL.Device_IsAndroidTV || GLOBAL.IsFireTV ? 17 : GLOBAL.Device_IsSTB ? 24 : 22);
        if (GLOBAL.App_Theme == 'Honua') {
            columns_ = 6;
            image_width_ =
                (Dimensions.get('window').width - GLOBAL.Menu_Width) / columns_;
            image_width_ = image_width_; // - (GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV ? 18 : GLOBAL.Device_IsSTB ? 22 :  GLOBAL.Device_System == "Android" ? 21 : GLOBAL.Device_IsWebTV ? 20: 21);
        }

        GLOBAL.Movie_Tags = GLOBAL.Tags.find(
            t => t.tag == this.props.selected_tag,
        ).movies;

        this.state = {
            reportStartTime: moment().unix(),
            movies: this.getMovies(SORT_TYPE_MOVIE_NUMBER, GLOBAL.Movie_Tags),
            categories: this.getCategories(this.props.tags),
            sortType: sortType,
            movieType: movieType,
            columns: columns_,
            rowWidth:
                image_width_ -
                (GLOBAL.Device_IsPhone
                    ? 15
                    : GLOBAL.Device_IsAndroidTV || GLOBAL.Device_IsFireTV
                        ? 17
                        : GLOBAL.Device_IsAppleTV
                            ? 25
                            : 20),
            scrolled: false,
        };

        this.openMovie = this.openMovie.bind(this);
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
            if (this.state.fromPage != 'Home') {
                Actions.Movies_Details({
                    MovieIndex: this.props.MovieIndex,
                    fromPage: this.props.fromPage,
                    stores: this.props.stores,
                });
            } else {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            }
        }
    };
    updateDimensions() {
        Actions.Movies_Tags({
            MovieIndex: this.props.MovieIndex,
            fromPage: this.props.fromPage,
            stores: this.props.stores,
        });
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (this.state.categories != undefined) {
            // REPORT.set({
            //     type: 10,
            //     name: this.state.categories[0].name,
            //     id: this.state.categories[0].id
            // });
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                Actions.Movies_Details({
                    MovieIndex: this.props.MovieIndex,
                    fromPage: this.props.fromPage,
                    stores: this.props.stores,
                });
                return true;
            },
        );
    }
    changeSortType() {
        var { sortType } = this.state;
        if (sortType === SORT_TYPE_NAME) {
            sortType = SORT_TYPE_MOVIE_NUMBER;
        } else {
            sortType = SORT_TYPE_NAME;
        }
        const movies = this.getMovies(sortType, GLOBAL.Movie_Tags);
        this.setState({
            sortType: sortType,
            movies: movies,
        });
    }
    getMovies(sortType, movies) {
        var originalMovies = movies;
        originalMovies.sort((movie1, movie2) => {
            if (sortType == SORT_TYPE_NAME) {
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
    }
    getCategories(tags) {
        var categories = [];
        categories.push({
            custom_type: 'sort',
        });
        var cats = tags;
        cats.forEach((category, index) => {
            categories.push(category);
        });
        this.setState({
            categories: cats,
        });
        return categories;
    }
    _onPressCategoryChange(item, index) {
        // REPORT.set({
        //     type: 10,
        //     name: this.state.categories[index].name,
        //     id: this.state.categories[index].id
        // });
        GLOBAL.Movie_Tags = GLOBAL.Tags.find(t => t.tag == item).movies;
        this.setState({
            movies: this.getMovies(this.state.sortType, GLOBAL.Movie_Tags),
        });
    }
    _onPressSort() {
        this.changeSortType();
    }
    componentWillUnmount() {
        sendPageReport('Movies', this.state.reportStartTime, moment().unix());
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
    _setFocusOnFirst(index) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
    renderButtonSort(index) {
        const { sortType } = this.state;
        const icon =
            sortType === SORT_TYPE_NAME ? (
                <FontAwesome5
                    style={styles.IconsMenu}
                    // icon={SolidIcons.sortAmountDown}
                    name="sort-amount-down"
                />
            ) : (
                <FontAwesome5
                    style={styles.IconsMenu}
                    // icon={SolidIcons.sortAlphaDown}
                    name="sort-alpha-down"
                />
            );
        return (
            <TouchableHighlightFocus
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onPressSort()}
            >
                <View
                    style={[
                        styles.menu_vertical_text,
                        {
                            width: isPad() ? 80 : 60,
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
                    ]}
                >
                    {icon}
                </View>
            </TouchableHighlightFocus>
        );
    }
    renderCategory(item, index) {
        if (item.custom_type && item.custom_type === 'sort') {
            return this.renderButtonSort(index);
        } else {
            return (
                <TouchableHighlightFocus
                    key={index}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this._onPressCategoryChange(item, index)}
                >
                    <View style={[styles.menu_vertical_text]}>
                        <Text
                            style={[
                                styles.H5,
                                { marginLeft: 20, marginRight: 20 },
                            ]}
                        >
                            {item}
                        </Text>
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }
    openMovie(item, index) {
        GLOBAL.Tag_Selected_Index = index;
        GLOBAL.Tag_Selected_Row = Math.floor(index / this.state.columns);
        Actions.Movies_Tags_Details({
            TagIndex: item.id,
            fromPage: this.props.fromPage,
            stores: this.props.stores,
            selected_tag: this.props.selected_tag,
            tags: this.props.tags,
            MovieIndex: this.props.MovieIndex,
        });
    }
    render() {
        return (
            <Container hide_header={GLOBAL.Device_IsPhone ? true : false}>
                <View
                    style={[
                        styles.Categories,
                        { marginTop: 5, backgroundColor: 'rgba(0, 0, 0, 0.83)' },
                    ]}
                >
                    <FlatList
                        data={this.state.categories}
                        horizontal={true}
                        scrollType="category"
                        extraData={this.state.movies}
                        keyExtractor={(item, index) =>
                            'category_' + index.toString()
                        }
                        renderItem={({ item, index }) =>
                            this.renderCategory(item, index)
                        }
                    />
                </View>
                <View
                    style={{
                        flex: 35,
                        paddingTop: 3,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <MovieList
                        Movies={this.state.movies}
                        Type={'Tags'}
                        Width={this.state.rowWidth}
                        Columns={this.state.columns}
                        getItemLayout={(data, index) => {
                            return {
                                length:
                                    this.state.rowWidth * 1.5 +
                                    (GLOBAL.Device_IsPhone ? 45 : 60),
                                index,
                                offset:
                                    (this.state.rowWidth * 1.5 +
                                        (GLOBAL.Device_IsPhone ? 45 : 60)) *
                                    index,
                            };
                        }}
                        openMovie={this.openMovie}
                    />
                </View>
            </Container>
        );
    }
}
