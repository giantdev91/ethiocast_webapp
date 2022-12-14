import React, { PureComponent } from 'react';
import { Text, BackHandler, TVMenuControl, View, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const SORT_TYPE_NAME = 'ABC';
const SORT_TYPE_MOVIE_NUMBER = '123';
const MOVIE_TYPE_NAME = 'Toggle View';
export default class Movies_Categories extends PureComponent {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        const sortType = SORT_TYPE_MOVIE_NUMBER;
        const movieType = MOVIE_TYPE_NAME;

        if (this.props.Selected_VodID != null) {
            GLOBAL.Selected_VodID = this.props.Selected_VodID;
        }
        if (GLOBAL.Movie_Selected == null) {
            GLOBAL.Movie_Selected = this.props.stores.find(
                s => s.vod_id === GLOBAL.Selected_VodID,
            ).genres[0].movies;
        }
        var cat_name = '';
        var cat_length = 0;
        cat_name = this.props.stores.find(
            s => s.vod_id === GLOBAL.Selected_VodID,
        ).genres[0].name;
        cat_length = this.props.stores.find(
            s => s.vod_id === GLOBAL.Selected_VodID,
        ).genres[0].movies.length;

        var columns = GLOBAL.Device_IsAppleTV ? 8 : 6;
        var width = 0;
        var category_width = 0;

        if (GLOBAL.App_Theme == 'Akua') {
            width = GLOBAL.Device_IsAppleTV
                ? GLOBAL.COL_8 - 10
                : GLOBAL.COL_6 - 10;
        }
        if (GLOBAL.App_Theme == 'Honua') {
            width = GLOBAL.Device_IsAppleTV
                ? GLOBAL.COL_REMAINING_8 - 10
                : GLOBAL.COL_REMAINING_6 - 10;
        }
        if (GLOBAL.App_Theme == 'Iridium') {
            columns = 5;
            category_width = GLOBAL.COL_REMAINING_5;
            width =
                GLOBAL.COL_REMAINING_5 - GLOBAL.COL_REMAINING_4 / columns - 2;
        }

        this.state = {
            searchValue: '',
            reportStartTime: moment().unix(),
            movies: this.getMovies(
                SORT_TYPE_MOVIE_NUMBER,
                GLOBAL.Movie_Selected,
            ),
            moviesSearch: this.getMovies(
                SORT_TYPE_MOVIE_NUMBER,
                GLOBAL.Movie_Selected,
            ),
            categories: this.getCategories(),
            fromPage: this.props.fromPage,
            sortType: sortType,
            movieType: movieType,
            width: width,
            columns: columns,
            category_width: category_width,
            stores: this.props.stores,
            has_scrolled: false,
            scrolled: false,
            toggle_text: 'Grid',
            category_name: cat_name,
            category_length: cat_length,
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (this.state.searchValue.length > 0) {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            if (this.state.fromPage != 'Home') {
                Actions.Movies_Stores({
                    fromPage: this.state.fromPage,
                    stores: this.props.stores,
                    sub_store: this.props.sub_store,
                });
            } else {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            }
        }
    };
    updateDimensions() {
        Actions.Movies_Categories({
            fromPage: this.state.fromPage,
            stores: this.state.stores,
        });
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        // if (this.state.categories != undefined) {
        //     REPORT.set({
        //         type: 10,
        //         name: this.state.categories[0].name,
        //         id: this.state.categories[0].id
        //     });
        // }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.state.fromPage != 'Home') {
                    Actions.Movies_Stores({
                        fromPage: this.state.fromPage,
                        stores: this.props.stores,
                        sub_store: this.props.sub_store,
                    });
                } else {
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                }
                return true;
            },
        );
    }
    _onToggleView() {
        if (this.state.toggle_text == 'List') {
            this.setState({
                toggle_text: 'Grid',
            });
        } else {
            this.setState({
                toggle_text: 'List',
            });
        }
    }
    changeSortType() {
        var { sortType } = this.state;
        if (sortType === SORT_TYPE_NAME) {
            sortType = SORT_TYPE_MOVIE_NUMBER;
        } else {
            sortType = SORT_TYPE_NAME;
        }
        const movies = this.getMovies(sortType, GLOBAL.Movie_Selected);
        this.setState({
            sortType: sortType,
            movies: movies,
            moviesSearch: movies,
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
    getCategories() {
        var categories = [];
        if (GLOBAL.App_Theme != 'Honua') {
            categories.push({
                custom_type: 'back',
            });
        }
        categories.push({
            custom_type: 'sort',
        });
        categories.push({
            custom_type: 'search',
        });
        var cats = this.props.stores.find(
            s => s.vod_id === GLOBAL.Selected_VodID,
        ).genres;
        cats.forEach((category, index) => {
            categories.push(category);
        });
        this.setState({
            categories: cats,
        });

        return categories;
    }
    _onPressCategoryChange(item, index) {
        if (GLOBAL.App_Theme == 'Honua') {
            index = index + 1;
        }
        if (index == 1) {
            this._onPressSort();
        } else {
            index = index - 2;
            GLOBAL.Movie_Selected_Row = 0;
            GLOBAL.Movie_Selected_Index = 0;
            GLOBAL.Movie_Selected_Category_ID = index - 1;
            GLOBAL.Movie_Selected = this.props.stores.find(
                s => s.vod_id === GLOBAL.Selected_VodID,
            ).genres[GLOBAL.Movie_Selected_Category_ID].movies;

            var cat_name = '';
            var cat_length = 0;
            cat_name = this.props.stores.find(
                s => s.vod_id === GLOBAL.Selected_VodID,
            ).genres[GLOBAL.Movie_Selected_Category_ID].name;
            cat_length = this.props.stores.find(
                s => s.vod_id === GLOBAL.Selected_VodID,
            ).genres[GLOBAL.Movie_Selected_Category_ID].movies.length;

            this.setState({
                movies: this.getMovies(
                    this.state.sortType,
                    GLOBAL.Movie_Selected,
                ),
                moviesSearch: this.getMovies(
                    this.state.sortType,
                    GLOBAL.Movie_Selected,
                ),
                //category: this.props.stores.find(s => s.vod_id === GLOBAL.Selected_VodID).genres,
                category_length: cat_length,
                category_name: cat_name,
            });
        }
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
        if (
            GLOBAL.Device_IsTV == true &&
            GLOBAL.Movie_Selected_Index == index
        ) {
            this.firstInitFocus = true;
            return index === GLOBAL.Movie_Selected_Index;
        }
        return false;
    }
    openMovie(movie, index) {
        var index_ = this.state.moviesSearch.findIndex(m => m.id == movie.id);
        GLOBAL.Movie_Selected_Index = index_;
        GLOBAL.Movie_Selected_Row = Math.floor(index_ / this.state.columns);
        Actions.Movies_Details({
            MovieIndex: index_,
            fromPage: this.state.fromPage,
            stores: this.props.stores,
            skippedStore: this.props.skippedStore,
        });
    }
    onChangeText = text => {
        if (text != undefined && text != null && text != '') {
            if (this.state.moviesSearch.length > 0) {
                GLOBAL.Movie_Selected_Index = 999999;
                var moviesNew = this.state.moviesSearch.filter(
                    c => c.name.toLowerCase().indexOf(text.toLowerCase()) > -1,
                );
                this.setState({
                    movies: moviesNew,
                    searchValue: text,
                });
            }
        }
    };
    render() {
        return (
            <Container
                needs_notch={true}
                hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                hide_menu={
                    GLOBAL.App_Theme == 'Akua' &&
                        !GLOBAL.Device_IsTablet &&
                        !GLOBAL.Device_IsPhone &&
                        !GLOBAL.Device_IsWebTV &&
                        GLOBAL.Device_IsSmartTV
                        ? true
                        : false
                }
            >
                <View style={{ flex: 35, flexDirection: 'column' }}>
                    {RenderIf(
                        GLOBAL.App_Theme == 'Iridium' &&
                        GLOBAL.Device_IsPhone == false,
                    )(
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                paddingTop:
                                    GLOBAL.Device_IsTablet &&
                                        GLOBAL.Device_Manufacturer == 'Apple'
                                        ? 10
                                        : 5,
                            }}
                        >
                            <View
                                style={{
                                    marginLeft: 5,
                                    flexDirection: 'column',
                                    backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                    width: this.state.category_width,
                                    borderTopLeftRadius: 5,
                                    borderTopRightRadius: 5,
                                }}
                            >
                                <View>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View
                                            style={{
                                                backgroundColor: '#000',
                                                borderRadius: 5,
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width:
                                                    this.state.category_width /
                                                    2,
                                                height:
                                                    this.state.category_width /
                                                    3,
                                                borderRadius: 5,
                                                marginVertical: 5,
                                                marginLeft: 5,
                                                marginRight: 5,
                                            }}
                                        >
                                            {this.renderButtonSort_()}
                                        </View>
                                        <View
                                            style={{
                                                backgroundColor: '#000',
                                                borderRadius: 5,
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width:
                                                    this.state.category_width /
                                                    2,
                                                height:
                                                    this.state.category_width /
                                                    3,
                                                borderRadius: 5,
                                                marginVertical: 5,
                                                marginRight: 5,
                                            }}
                                        >
                                            {this.renderButtonToggle_()}
                                        </View>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    {/* <FontAwesome5 style={[styles.IconsMenuMedium, { color: '#666', paddingVertical: 5 }]} icon={SolidIcons.chevronUp} /> */}
                                </View>

                                <FlatList
                                    data={this.state.categories}
                                    horizontal={false}
                                    numColumns={1}
                                    scrollType="category"
                                    extraData={this.state.movies}
                                    FromPage={this.state.fromPage}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({ item, index }) => {
                                        if (
                                            index ==
                                            GLOBAL.Movie_Selected_Category_ID &&
                                            !item.custom_type
                                        ) {
                                            return (
                                                <TouchableHighlightFocus
                                                    BorderRadius={5}
                                                    style={{
                                                        borderRadius: 5,
                                                        margin: 5,
                                                    }}
                                                    key={index}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this._onPressCategoryChange(
                                                            item,
                                                            index,
                                                        )
                                                    }
                                                >
                                                    <View>
                                                        <View
                                                            style={{ padding: 5 }}
                                                        >
                                                            <View>
                                                                <Text
                                                                    style={[
                                                                        styles.H5,
                                                                        {},
                                                                    ]}
                                                                >
                                                                    {item.name}
                                                                </Text>
                                                                <Text
                                                                    style={[
                                                                        styles.Small,
                                                                        {
                                                                            borderBottomColor:
                                                                                GLOBAL.Button_Color,
                                                                            borderBottomWidth: 3,
                                                                            paddingBottom: 5,
                                                                        },
                                                                    ]}
                                                                >
                                                                    {
                                                                        item
                                                                            .movies
                                                                            .length
                                                                    }{' '}
                                                                    {LANG.getTranslation(
                                                                        'movies',
                                                                    )}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </TouchableHighlightFocus>
                                            );
                                        } else if (!item.custom_type) {
                                            return (
                                                <TouchableHighlightFocus
                                                    BorderRadius={5}
                                                    style={{
                                                        borderRadius: 5,
                                                        margin: 5,
                                                    }}
                                                    key={index}
                                                    underlayColor={
                                                        GLOBAL.Button_Color
                                                    }
                                                    onPress={() =>
                                                        this._onPressCategoryChange(
                                                            item,
                                                            index,
                                                        )
                                                    }
                                                >
                                                    <View style={{ padding: 5 }}>
                                                        <View>
                                                            <Text
                                                                style={[
                                                                    styles.H5,
                                                                    {},
                                                                ]}
                                                            >
                                                                {item.name}
                                                            </Text>
                                                            <Text
                                                                style={[
                                                                    styles.Small,
                                                                    {},
                                                                ]}
                                                            >
                                                                {
                                                                    item.movies
                                                                        .length
                                                                }{' '}
                                                                {LANG.getTranslation(
                                                                    'movies',
                                                                )}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableHighlightFocus>
                                            );
                                        }
                                    }}
                                />
                                <View style={{ alignItems: 'center' }}>
                                    {/* <FontAwesome5 style={[styles.IconsMenuMedium, { color: '#666', paddingVertical: 5 }]} icon={SolidIcons.chevronDown} /> */}
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 4,
                                    alignItems:
                                        GLOBAL.App_Theme == 'Honua' ||
                                            (this.state.movies.length <
                                                this.state.columns &&
                                                this.state.toggle_text == 'Grid')
                                            ? 'flex-start'
                                            : 'center',
                                }}
                            >
                                {!GLOBAL.Device_IsSmartTV && (
                                    <View
                                        style={{
                                            width:
                                                GLOBAL.COL_REMAINING_1 -
                                                GLOBAL.COL_REMAINING_5 -
                                                10,
                                            flexDirection: 'row',
                                            height: 65,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <TouchableHighlightFocus
                                                focusable={true}
                                                touchableGetPressRectOffset={50}
                                                Padding={0}
                                                Margin={0}
                                                BorderRadius={5}
                                                onPress={() => {
                                                    this.onChangeText('');
                                                    this.searchbar.clear();
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width:
                                                            GLOBAL.COL_REMAINING_10 -
                                                            25,
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.20)',
                                                        flexDirection: 'row',
                                                        borderColor: '#222',
                                                        borderWidth: 3,
                                                        marginHorizontal: 0,
                                                        borderRadius: 5,
                                                        marginVertical: 0,
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenuMedium,
                                                            {
                                                                color: '#fff',
                                                                margin: 12,
                                                            },
                                                        ]}
                                                        // icon={SolidIcons.trash}
                                                        name="trash"
                                                    />
                                                </View>
                                            </TouchableHighlightFocus>
                                        </View>
                                        <View
                                            style={{
                                                flex: 9,
                                                flexDirection: 'row',
                                            }}
                                        >
                                            <TouchableHighlightFocus
                                                Padding={0}
                                                Margin={0}
                                                BorderRadius={5}
                                                onPress={() =>
                                                    this.searchbar.focus()
                                                }
                                            >
                                                <View
                                                    style={{
                                                        padding:
                                                            GLOBAL.Device_IsWebTV
                                                                ? 9
                                                                : 0,
                                                        marginRight: 40,
                                                        alignItems: 'center',
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.20)',
                                                        flexDirection: 'row',
                                                        borderColor: '#222',
                                                        borderWidth: 3,
                                                        marginHorizontal: 0,
                                                        borderRadius: 5,
                                                        marginVertical: 0,
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenuMedium,
                                                            {
                                                                color: '#fff',
                                                                paddingLeft: 10,
                                                            },
                                                        ]}
                                                        // icon={SolidIcons.search}
                                                        name="search"
                                                    />
                                                    <TextInput
                                                        onChangeText={text =>
                                                            this.onChangeText(
                                                                text,
                                                            )
                                                        }
                                                        ref={searchbar =>
                                                        (this.searchbar =
                                                            searchbar)
                                                        }
                                                        selectionColor={'#000'}
                                                        placeholderTextColor={
                                                            '#fff'
                                                        }
                                                        underlineColorAndroid={
                                                            'transparent'
                                                        }
                                                        placeholder={LANG.getTranslation(
                                                            'filter',
                                                        )}
                                                        //style={[styles.H2, { width: GLOBAL.COL_REMAINING_1 - (GLOBAL.App_Theme == 'Honua' ? 165 : GLOBAL.Device_IsAppleTV ? 280 : 150), color: '#fff', marginHorizontal: 10, height: GLOBAL.Device_IsAppleTV ? 50 : null }]}>
                                                        style={[
                                                            styles.H2,
                                                            { width: '100%' },
                                                        ]}
                                                    ></TextInput>
                                                </View>
                                            </TouchableHighlightFocus>
                                        </View>
                                    </View>
                                )}
                                {RenderIf(this.state.toggle_text == 'Grid')(
                                    <MovieList
                                        Movies={this.state.movies}
                                        Type={'Movies'}
                                        Width={
                                            this.state.width -
                                            (GLOBAL.Device_IsWebTV ? 9 : 0)
                                        }
                                        Columns={this.state.columns}
                                        getItemLayout={(data, index) => {
                                            return {
                                                length:
                                                    this.state.width * 1.5 +
                                                    (GLOBAL.Device_IsPhone
                                                        ? 45
                                                        : 60),
                                                index,
                                                offset:
                                                    (this.state.width * 1.5 +
                                                        (GLOBAL.Device_IsPhone
                                                            ? 45
                                                            : 60)) *
                                                    index,
                                            };
                                        }}
                                        onPress={(movie, index) =>
                                            this.openMovie(movie, index)
                                        }
                                    />,
                                )}
                                {RenderIf(this.state.toggle_text == 'List')(
                                    <MovieList
                                        Movies={this.state.movies}
                                        Type={'MoviesList'}
                                        Columns={1}
                                        getItemLayout={(data, index) => {
                                            return {
                                                length: 150,
                                                index,
                                                offset: 150 * index,
                                            };
                                        }}
                                        onPress={(movie, index) =>
                                            this.openMovie(movie, index)
                                        }
                                    />,
                                )}
                            </View>
                        </View>,
                    )}
                    {RenderIf(
                        GLOBAL.App_Theme != 'Iridium' ||
                        GLOBAL.Device_IsPhone == true,
                    )(
                        <View style={{ flex: 1 }}>
                            <View
                                style={[
                                    {
                                        marginTop:
                                            GLOBAL.App_Theme == 'Honua' &&
                                                !GLOBAL.Device_IsPhone
                                                ? 4
                                                : 0,
                                        marginLeft:
                                            GLOBAL.App_Theme == 'Honua' &&
                                                !GLOBAL.Device_IsPhone
                                                ? 5
                                                : 0,
                                    },
                                ]}
                            >
                                <CategoryList
                                    SortText={this.state.sortType}
                                    ToggleText={this.state.toggleType}
                                    horizontal={true}
                                    Type={'Movies'}
                                    FromPage={this.props.fromPage}
                                    Cats={this.state.categories}
                                    Stores={this.props.stores}
                                    onPress={(cat, index) =>
                                        this._onPressCategoryChange(cat, index)
                                    }
                                    SelectedCategoryName={
                                        this.state.category_name
                                    }
                                    SelectedCategoryLength={
                                        this.state.category_length
                                    }
                                />
                            </View>
                            <View
                                style={{
                                    flex: 35,
                                    marginLeft:
                                        GLOBAL.App_Theme == 'Honua' &&
                                            !GLOBAL.Device_IsPhone
                                            ? 5
                                            : 0,
                                    alignItems:
                                        GLOBAL.App_Theme == 'Honua' ||
                                            (this.state.movies.length <
                                                this.state.columns &&
                                                this.state.toggle_text == 'Grid')
                                            ? 'flex-start'
                                            : 'center',
                                }}
                            >
                                {!GLOBAL.Device_IsSmartTV && (
                                    <View style={{ flexDirection: 'row' }}>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                height: 65,
                                            }}
                                        >
                                            <TouchableHighlightFocus
                                                Padding={0}
                                                Margin={0}
                                                BorderRadius={5}
                                                onPress={() => {
                                                    this.onChangeText('');
                                                    this.searchbar.clear();
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        alignItems: 'center',
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.20)',
                                                        flexDirection: 'row',
                                                        borderColor: '#111',
                                                        borderWidth: 3,
                                                        marginHorizontal: 0,
                                                        borderRadius: 5,
                                                        marginVertical: 0,
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenuMedium,
                                                            {
                                                                color: '#fff',
                                                                margin: 12,
                                                                marginHorizontal:
                                                                    GLOBAL.Device_IsWebTV
                                                                        ? 8
                                                                        : 16,
                                                            },
                                                        ]}
                                                        // icon={SolidIcons.trash}
                                                        name="trash"
                                                    />
                                                </View>
                                            </TouchableHighlightFocus>
                                        </View>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                height: 65,
                                            }}
                                        >
                                            <TouchableHighlightFocus
                                                Padding={0}
                                                Margin={0}
                                                BorderRadius={5}
                                                onPress={() =>
                                                    this.searchbar.focus()
                                                }
                                            >
                                                <View
                                                    style={{
                                                        padding:
                                                            GLOBAL.Device_IsWebTV
                                                                ? 9
                                                                : 0,
                                                        alignItems: 'center',
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.20)',
                                                        flexDirection: 'row',
                                                        borderColor: '#222',
                                                        borderWidth: 3,
                                                        marginHorizontal: 0,
                                                        borderRadius: 5,
                                                        marginVertical: 0,
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={[
                                                            styles.IconsMenuMedium,
                                                            {
                                                                color: '#fff',
                                                                paddingLeft: 10,
                                                            },
                                                        ]}
                                                        // icon={SolidIcons.search}
                                                        name="search"
                                                    />
                                                    <TextInput
                                                        onChangeText={text =>
                                                            this.onChangeText(
                                                                text,
                                                            )
                                                        }
                                                        ref={searchbar =>
                                                        (this.searchbar =
                                                            searchbar)
                                                        }
                                                        selectionColor={'#000'}
                                                        placeholderTextColor={
                                                            '#fff'
                                                        }
                                                        underlineColorAndroid={
                                                            'transparent'
                                                        }
                                                        placeholder={LANG.getTranslation(
                                                            'filter',
                                                        )}
                                                        style={[
                                                            styles.H2,
                                                            {
                                                                width:
                                                                    GLOBAL.COL_REMAINING_1 -
                                                                    (GLOBAL.App_Theme ==
                                                                        'Honua'
                                                                        ? 148
                                                                        : GLOBAL.Device_IsWebTV
                                                                            ? 165
                                                                            : GLOBAL.Device_IsAppleTV
                                                                                ? 170
                                                                                : 152),
                                                                color: '#fff',
                                                                marginHorizontal: 10,
                                                                height: GLOBAL.Device_IsAppleTV
                                                                    ? 50
                                                                    : null,
                                                            },
                                                        ]}
                                                    ></TextInput>
                                                </View>
                                            </TouchableHighlightFocus>
                                        </View>
                                    </View>
                                )}
                                <MovieList
                                    Movies={this.state.movies}
                                    Type={'Movies'}
                                    Width={this.state.width}
                                    Columns={this.state.columns}
                                    getItemLayout={(data, index) => {
                                        return {
                                            length:
                                                this.state.width * 1.5 +
                                                (GLOBAL.Device_IsPhone
                                                    ? 45
                                                    : 60),
                                            index,
                                            offset:
                                                (this.state.width * 1.5 +
                                                    (GLOBAL.Device_IsPhone
                                                        ? 45
                                                        : 60)) *
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
            </Container>
        );
    }
    renderButtonToggle_(index) {
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                style={{ borderRadius: 5 }}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onToggleView()}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height:
                            (GLOBAL.Device_IsWebTV &&
                                !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 150
                                : 75,
                        width:
                            (GLOBAL.Device_IsWebTV &&
                                !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 150
                                : GLOBAL.Device_Manufacturer == 'LG WebOS'
                                    ? 100
                                    : 75,
                    }}
                >
                    <Text numberOfLines={1} style={[styles.Medium, {}]}>
                        {LANG.getTranslation('toggle_view')}
                    </Text>
                    <Text numberOfLines={1} style={[styles.Small, {}]}>
                        {this.state.toggle_text}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
    renderButtonSort_(index) {
        const { sortType } = this.state;
        const icon = sortType === SORT_TYPE_NAME ? '123' : 'ABC';
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                style={{ borderRadius: 5 }}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onPressSort()}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height:
                            (GLOBAL.Device_IsWebTV &&
                                !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 150
                                : 75,
                        width:
                            (GLOBAL.Device_IsWebTV &&
                                !GLOBAL.Device_IsSmartTV) ||
                                GLOBAL.Device_IsAppleTV ||
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen'
                                ? 150
                                : GLOBAL.Device_Manufacturer == 'LG WebOS'
                                    ? 100
                                    : 75,
                    }}
                >
                    <Text style={[styles.Medium, {}]}>
                        {LANG.getTranslation('sorting')}
                    </Text>
                    <Text style={[styles.Small, {}]}>{icon}</Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
}
