import React, {Component} from 'react';
import {
    BackHandler,
    TVMenuControl,
    Text,
    View,
    Image,
    ScrollView,
    TouchableHighlight,
    Dimensions,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
export default class Education_Details extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};

        this.state = {
            fromPage: this.props.fromPage,
            stores: this.props.stores,
            details: [],
            title: '',
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
            course: [],
            seasons: [],
            change_season: false,
            episodeWidth: 0,
            movieimagewidth: 0,
            favorite: 'Add to Favorites',
            favorite_: false,
            movie: [],
            id: 0,
            age_rating: '',
            tvod: false,
            years: [],
            lessons: [],
            courses: [],
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
            } else if (this.props.fromPage == 'continue') {
                Actions.MyList();
            } else if (this.props.fromPage == 'search') {
                Actions.SearchBox();
            } else {
                Actions.Education_Stores({
                    stores: this.state.stores,
                    sub_store: this.props.sub_store,
                });
            }
        }
    };
    updateDimensions() {
        Actions.Education_Details({
            fromPage: this.props.fromPage,
            stores: this.props.stores,
            YearIndex: this.props.YearIndex,
            sub_store: this.props.sub_store,
        });
    }
    setYear() {
        try {
            GLOBAL.Course =
                GLOBAL.Education[GLOBAL.Education_Year_Index].course[
                    GLOBAL.Education_Course_Index
                ];
            var desc = '';
            if (GLOBAL.Course.descriptions[0] != undefined) {
                desc = GLOBAL.Course.descriptions[0].description;
            }
            this.setState({
                title: GLOBAL.Course.name,
                desc: desc,
                poster: GLOBAL.ImageUrlCMS + GLOBAL.Course.poster,
                backdrop: GLOBAL.ImageUrlCMS + GLOBAL.Course.backdrop,
                courses: GLOBAL.Education[GLOBAL.Education_Year_Index].course,
                lessons:
                    GLOBAL.Education[GLOBAL.Education_Year_Index].course[
                        GLOBAL.Education_Course_Index
                    ].lessons,
            });

            // REPORT.set({
            //   type: 15,
            //   name: GLOBAL.Education.name,
            //   id: GLOBAL.Education.id
            // });
        } catch (error) {
            if (this.props.fromPage == 'Home') {
                GLOBAL.Focus = 'Home';
                Actions.Home();
            } else if (this.props.fromPage == 'continue') {
                Actions.MyList();
            } else if (this.props.fromPage == 'search') {
                Actions.SearchBox();
            } else {
                Actions.Education_Stores({
                    stores: this.state.stores,
                    sub_store: this.props.sub_store,
                });
            }
        }
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        this.setYear();
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                GLOBAL.Education_Selected = null;
                GLOBAL.Education_Selected_Index = 0;
                GLOBAL.Year_Selected_Index = 0;
                GLOBAL.Year_Selected_Year = null;
                GLOBAL.Year_Selected_Year_ID = 0;
                GLOBAL.Year_Selected_Course_Index = 0;
                GLOBAL.Year_Selected_Course_Row = 0;

                if (this.props.fromPage == 'Home') {
                    GLOBAL.Focus = 'Home';
                    Actions.Home();
                } else if (this.props.fromPage == 'continue') {
                    Actions.MyList();
                } else if (this.props.fromPage == 'search') {
                    Actions.SearchBox();
                } else {
                    Actions.Education_Stores({
                        stores: this.state.stores,
                        sub_store: this.props.sub_store,
                    });
                }
                return true;
            },
        );
    }
    componentWillUnmount() {
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
    _onStartPlayingCourse(item, index) {
        GLOBAL.Education_Lesson_Index = index;
        //GLOBAL.Year_Selected_Course_Row = index;

        var isSerieStored = UTILS.getProfile(
            'education_progress',
            item.id,
            index,
        );
        var askResume = false;
        var askResumeTime = 0;
        var position = 0;
        if (isSerieStored != null) {
            var percentageVideo = isSerieStored.position / isSerieStored.total;
            position = percentageVideo * 100;
        }
        if (position < 95) {
            if (isSerieStored != null) {
                askResume = true;
                askResumeTime = Number(isSerieStored.position);
            }
        }
        Actions.Player_Education({
            fromPage: this.props.fromPage,
            askResume: askResume,
            askResumeTime: askResumeTime,
            stores: this.props.stores,
            LessonIndex: this.props.LessonIndex,
            sub_store: this.props.sub_store,
        });
    }
    _changeCourse(index) {
        GLOBAL.Education_Course_Index = index;
        GLOBAL.Course =
            GLOBAL.Education[GLOBAL.Education_Year_Index].course[
                GLOBAL.Education_Course_Index
            ];
        var desc = '';
        if (GLOBAL.Course.descriptions[0] != undefined) {
            desc = GLOBAL.Course.descriptions[0].description;
        }
        this.setState({
            title: GLOBAL.Course.name,
            desc: desc,
            poster: GLOBAL.ImageUrlCMS + GLOBAL.Course.poster,
            backdrop: GLOBAL.ImageUrlCMS + GLOBAL.Course.backdrop,
            courses: GLOBAL.Education[GLOBAL.Education_Year_Index].course,
            lessons:
                GLOBAL.Education[GLOBAL.Education_Year_Index].course[
                    GLOBAL.Education_Course_Index
                ].lessons,
        });
    }
    _setFocusOnFirst(index) {
        if (
            GLOBAL.Year_Selected_Course_Index == index &&
            GLOBAL.Device_IsTV == true
        ) {
            return index === GLOBAL.Year_Selected_Course_Index;
        }
        return false;
    }
    getLessonImage(image) {
        var width = GLOBAL.COL_REMAINING_3;
        if (GLOBAL.Device_IsPhone) {
            width = GLOBAL.COL_1 - 40;
        }
        if (image == null) {
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
                    source={{uri: GLOBAL.ImageUrlCMS + image}}
                    style={{
                        width: width,
                        height: width / 1.75,
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                    }}
                ></Image>
            );
        }
    }
    _onFavoriteChange() {
        var id = this.state.id;
        var isMovieFavorite = GLOBAL.Favorite_Education.find(function (
            element,
        ) {
            return element.id == id;
        });
        if (isMovieFavorite != undefined) {
            var index = GLOBAL.Favorite_Education.findIndex(
                c => c.id != isMovieFavorite.id,
            );
            GLOBAL.Favorite_Education.splice(index, 1);
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
                GLOBAL.Favorite_Education,
                '',
            );
        } else {
            GLOBAL.Favorite_Education.push(this.state.years);
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
                GLOBAL.Favorite_Education,
                '',
            );
        }
    }
    getLessonsFullProgress(item, index) {
        var getProgress = UTILS.getProfile(
            'education_progress',
            item.id,
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
                hasTVPreferredFocus={this._setFocusOnFirst(index)}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onStartPlayingCourse(item, index)}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        backgroundColor: 'rgba(0, 0, 0, 0.73)',
                        padding: 10,
                        borderRadius: 5,
                    }}
                >
                    <View style={{paddingBottom: 10}}>
                        <Text numberOfLines={3} style={styles.H5}>
                            {index + 1}. {item.name}
                        </Text>
                    </View>
                    <View style={{flexDirection: 'column'}}>
                        <View>
                            {this.getLessonImage(item.image)}
                            <View
                                style={{
                                    borderTopColor: GLOBAL.Button_Color,
                                    borderTopWidth: 4,
                                    width:
                                        position *
                                        (GLOBAL.COL_REMAINING_3 / 100),
                                    borderBottomRightRadius: 5,
                                    borderTopRightRadius: 5,
                                }}
                            ></View>
                        </View>
                        <View
                            style={{
                                flexDirection: 'column',
                                padding: 5,
                                width: GLOBAL.COL_REMAINING_3,
                            }}
                        >
                            <Text numberOfLines={3} style={[styles.Medium]}>
                                {item.description}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
    getLessonsProgress(item, index) {
        var getProgress = UTILS.getProfile(
            'education_progress',
            item.id,
            index,
        );
        var position = 0;
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
        }

        return (
            <TouchableHighlightFocus
                key={index}
                hasTVPreferredFocus={this._setFocusOnFirst(index)}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onStartPlayingCourse(item, index)}
            >
                <View onLayout={this.onCourseLayout} style={{margin: 10}}>
                    <Text style={styles.Small}>
                        {index + 1}. {item.name}
                    </Text>
                    <View
                        style={{
                            marginTop: 5,
                            borderTopColor: '#fff',
                            borderTopWidth: 2,
                            width: position * (this.state.episodeWidth / 100),
                        }}
                    ></View>
                </View>
            </TouchableHighlightFocus>
        );
    }
    onCourseLayout = event => {
        if (this.state.episodeWidth != 0) return;
        let width = event.nativeEvent.layout.width;
        this.setState({episodeWidth: width - 10});
    };
    renderCourse(item, index) {
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                style={{
                    marginLeft: 5,
                    borderRadius: 5,
                    width: GLOBAL.Device_IsPhone ? null : 200,
                }}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._changeCourse(index)}
            >
                <View style={styles.menu_vertical_text}>
                    <Text style={styles.Menu}>{item.name}</Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
    vw(percentageWidth) {
        return Dimensions.get('window').width * (percentageWidth / 100);
    }

    vh(percentageHeight) {
        return Dimensions.get('window').height * (percentageHeight / 100);
    }
    onMovieImageLayout = event => {
        if (this.state.movieimagewidth != 0) return;
        let width = event.nativeEvent.layout.width;
        this.setState({movieimagewidth: width - 10});
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
                    source={{uri: this.state.poster}}
                ></Image>
            </View>
        );
    }
    render() {
        if (this.state.title == '') {
            return <Loader size={'large'} color={'#e0e0e0'} />;
        }

        return (
            <Container background={this.state.backdrop}>
                <ScrollView>
                    <View
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.80)',
                            marginTop: 4,
                            marginLeft: 8,
                            marginRight: 8,
                            flexDirection: 'row',
                            borderRadius: 5,
                        }}
                    >
                        <View
                            style={{flex: 7, flexDirection: 'row', margin: 5}}
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
                                    padding: GLOBAL.Device_IsWebTV ? 40 : 20,
                                    backgroundColor: 'rgba(0, 0, 0, 0.63)',
                                    justifyContent: 'flex-start',
                                    alignContent: 'flex-end',
                                    alignItems: 'flex-start',
                                    alignSelf: 'flex-end',
                                }}
                            >
                                <Text style={[styles.H00]}>
                                    {this.state.title}
                                </Text>
                                <Text
                                    numberOfLines={3}
                                    style={[styles.H5, {marginVertical: 10}]}
                                >
                                    {this.state.desc}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {RenderIf(this.state.courses.length > 0)(
                        <View
                            style={[
                                styles.Categories,
                                {
                                    margin: 8,
                                    backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                    marginLeft: 8,
                                    marginRight: 8,
                                    paddingLeft: 2,
                                    borderRadius: 5,
                                    padding: 5,
                                },
                            ]}
                        >
                            <FlatList
                                style={styles.elements}
                                data={this.state.courses}
                                horizontal={true}
                                scrollType="category"
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item, index}) =>
                                    this.renderCourse(item, index)
                                }
                            />
                        </View>,
                    )}
                    <View
                        style={[
                            {
                                backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                marginLeft: 8,
                                marginRight: 8,
                                borderRadius: 5,
                                flexGrow: 50,
                            },
                        ]}
                    >
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
                                data={this.state.lessons}
                                horizontal={true}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item, index}) => {
                                    return this.getLessonsFullProgress(
                                        item,
                                        index,
                                    );
                                }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </Container>
        );
    }
}
