import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { OverflowMenu, MenuItem, Button } from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { sendPageReport, sendActionReport } from '../../../reporting/reporting';

export interface Descriptions {
    language?: string;
    //description?: string;
}
export interface Lesson {
    name?: string;
    description?: string;
    teachers?: string;
    course_number?: string;
    lesson_number?: string;
}
export interface Course {
    vod_id: number | string;
    name?: string;
    poster?: string;
    backdrop?: string;
    imdb_rating?: string;
    year?: string;
    langauge?: string;
    teachers?: string;
    descriptions?: Descriptions[];
    lessons?: Lesson[];
    tags?: [];
    id?: number;
}
export interface Year {
    id: number | string;
    name?: string;
    poster?: string;
    backdrop?: string;
    imdb_rating?: string;
    courses?: Course[];
}

export default ({ navigation, route }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [year, setYear] = useState<Year>();
    const [course, setCourse] = useState<Course>();
    const [columns, setColumns] = useState(GLOBAL.Device_IsPortrait ? 1 : 3);
    const [courses, setCourses] = useState([]);
    const [courseIndex, setCourseIndex] = useState(0);
    const [selectedCourseName, setSelectedCourseName] = useState('');
    const [courseVisible, setCourseVisible] = useState(false);
    const [selectedCourseIndex, setSelectedCourseIndex] = useState(null);
    const [favorite, setFavorite] = useState(false);
    var sizes = SIZES.getSizing();

    useEffect(() => {
        return () =>
            sendPageReport('Courses', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (route.params?.year != undefined) {
            var year = route.params?.year;
            setYear(year);
            if (year.course.length > 0) {
                setCourseIndex(0);
                setCourse(year.course[courseIndex]);
                setCourses(year.course);
                setSelectedCourseName(year.course[courseIndex].name);
                var favorite = getFavorite(year.course[courseIndex].vod_id);
                setFavorite(favorite);
            }
        } else if (route.params?.course_id != undefined) {
            var course_id = route.params?.course_id;
            var success = false;
            var course_index = 0;
            var years;
            var courses;
            var course;
            GLOBAL.EducationStores.some(stores_ => {
                var years_ = stores_.years;
                years_.some(year_ => {
                    if (year_.course != undefined) {
                        var course_ = year_.course.find(s => s.id == course_id);
                        if (course_ != undefined && success == false) {
                            success = true;
                            courses = course_;
                            course = year_.course;
                            years = year_;
                            course_index = year_.course.findIndex(
                                s => s.id == course_id,
                            );
                        }
                    }
                });
            });
            setYear(years);
            setCourseIndex(course_index);
            setCourse(course);
            setCourses(courses);
            setSelectedCourseName(course.name);
            var favorite = getFavorite(course.vod_id);
            setFavorite(favorite);
        } else {
            navigation.goBack();
        }
    }, []);
    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        return () => backHandler.remove();
    }, []);
    const getFavorite = id => {
        var isFavorite = GLOBAL.Favorite_Education.find(function (element) {
            return element.id == id;
        });
        if (isFavorite != undefined) {
            return true;
        } else {
            return false;
        }
    };
    const onPressBack = () => {
        navigation.goBack();
    };
    const onToggleFavorite = () => {
        var isFavorite = GLOBAL.Favorite_Education.find(function (element) {
            return element.id == course.id;
        });
        if (isFavorite != undefined) {
            sendActionReport(
                'Remove Favorite',
                'Course',
                moment().unix(),
                course.name,
            );
            var newSeries = GLOBAL.Favorite_Education.filter(
                c => c.id != isFavorite.id,
            );
            GLOBAL.Favorite_Education = newSeries;
            setFavorite(false);
            UTILS.storeProfile(
                'education_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Education,
                '',
            );
        } else {
            sendActionReport(
                'Add Favorite',
                'Course',
                moment().unix(),
                course.name,
            );
            var year_ = {
                poster: course?.poster,
                backdrop: course?.backdrop,
                name: course?.name,
                id: course?.id,
            };
            GLOBAL.Favorite_Education.push(year_);
            setFavorite(true);
            UTILS.storeProfile(
                'education_favorites',
                0,
                0,
                0,
                0,
                GLOBAL.Favorite_Education,
                '',
            );
        }
    };

    const getProgress = index => {
        var getProgress = UTILS.getProfile(
            'education_progress',
            course.id,
            index,
        );
        var position = 0;
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
        }
        return position;
    };
    const renderLesson = ({ item, index }) => {
        var progress = getProgress(index);
        if (GLOBAL.UserInterface.series.enable_episodes_full_metadata == true) {
            return (
                <FocusButton
                    style={{
                        width: GLOBAL.Device_IsPortrait
                            ? sizes.width * 1
                            : sizes.width * 0.333,
                        padding: 5,
                    }}
                    onPress={() => onPlayLesson(item, index)}
                >
                    <View
                        style={{
                            borderRadius: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            justifyContent: 'center',
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: '#000',
                                height:
                                    (GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.96
                                        : sizes.width * 0.305) * 0.56,
                            }}
                        >
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.image }}
                                style={[
                                    {
                                        borderTopLeftRadius: 5,
                                        borderTopRightRadius: 5,
                                        width: GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.96
                                            : sizes.width * 0.32,
                                        height:
                                            (GLOBAL.Device_IsPortrait
                                                ? sizes.width * 0.96
                                                : sizes.width * 0.305) * 0.56,
                                    },
                                ]}
                            ></Image>
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 99999,
                                    height:
                                        (GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.96
                                            : sizes.width * 0.305) * 0.56,
                                    width: '100%',
                                }}
                            >
                                <FontAwesome5
                                    style={{
                                        color: '#fff',
                                        fontSize: 45,
                                        opacity: 0.8,
                                        textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                        textShadowOffset: {
                                            width: -1,
                                            height: 1,
                                        },
                                        textShadowRadius: 10,
                                    }}
                                    // icon={RegularIcons.playCircle}
                                    name="play-circle"
                                />
                            </View>
                            <View
                                style={{
                                    position: 'absolute',
                                    top:
                                        (GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.9
                                            : sizes.width * 0.28) * 0.35,
                                    paddingHorizontal: 20,
                                    padding: 20,
                                    left: 0,
                                }}
                            >
                                <Text h5 shadow numberOfLines={1}>
                                    {LANG.getTranslation('course')}{' '}
                                    {item.course_number}
                                </Text>
                                <Text shadow numberOfLines={1}>
                                    {LANG.getTranslation('lesson')}{' '}
                                    {item.lesson_number}
                                </Text>
                            </View>
                        </View>

                        <View style={{ margin: 15, marginTop: 20 }}>
                            <Text h5 bold shadow numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <View
                                    style={{
                                        marginVertical: 2,
                                        marginBottom: 10,
                                        borderTopWidth: 3,
                                        borderTopColor: '#999',
                                        width:
                                            (GLOBAL.Device_IsPortrait
                                                ? sizes.width * 0.8
                                                : sizes.width * 0.18) *
                                            progress,
                                    }}
                                ></View>
                            </View>
                            <Text shadow numberOfLines={3}>
                                {item.description}
                            </Text>
                            <Text
                                size={11}
                                style={{ marginTop: 10, marginBottom: 20 }}
                            >
                                {course?.teachers}
                            </Text>
                        </View>
                    </View>
                </FocusButton>
            );
        } else {
            return (
                <FocusButton
                    style={{ margin: 5, width: sizes.width / columns - 30 }}
                    onPress={() => onPlayEpisode(item, index)}
                >
                    <View
                        style={{
                            borderRadius: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            justifyContent: 'center',
                            padding: 10,
                            paddingLeft: 20,
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <Text bold shadow numberOfLines={1}>
                            {index + 1}. {item.name}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <View
                                style={{
                                    marginVertical: 2,
                                    marginBottom: 0,
                                    borderTopWidth: 3,
                                    borderTopColor: '#999',
                                    width: sizes.width * 0.275 * progress,
                                }}
                            ></View>
                        </View>
                    </View>
                </FocusButton>
            );
        }
    };
    const renderSeasonButton = () => (
        <Button onPress={() => setCourseVisible(true)}>
            {selectedCourseName}
        </Button>
    );
    const onItemSelectSeason = item => {
        var course = courses[item.row];
        setCourseIndex(item.row);
        setCourse(course);
        setSelectedCourseName(course.name);
        setCourseVisible(false);
    };
    const onPlayLesson = (item, index) => {
        var getProgress = UTILS.getProfile(
            'education_progress',
            course.id,
            index,
        );
        var position = 0;
        var percentageVideo = 0;
        if (getProgress != null) {
            percentageVideo = (getProgress.position / getProgress.total) * 100;
            if (percentageVideo < 95) {
                position = getProgress.position;
            }
        }

        navigation.navigate({
            name: 'Player_Education',
            params: {
                lesson: item,
                index: index,
                course: course,
                years: year,
                course_index: courseIndex,
                position: position,
            },
            merge: true,
        });
    };
    const renderSeasonItem = (course, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={course.name}
        />
    );
    const getLesson = () => {
        if (year != undefined && course != undefined) {
            var lastWatched = UTILS.getProfile('education_watching', year.id);
            if (lastWatched != undefined) {
                var course_ = year.courses.find(
                    s => s.id == lastWatched.course_id,
                );
                var lesson = course_.lessons[lastWatched.index];
                return (
                    'CO' +
                    lesson.course_number +
                    ' ' +
                    'LE' +
                    lesson.lesson_number
                );
            } else {
                return 'CO' + 1 + ' LE' + 1;
            }
        }
    };
    const onPlayLessonContinue = () => {
        var lastWatched = UTILS.getProfile('education_watching', year.id);
        if (lastWatched != undefined) {
            var courseIndex_ = year.courses.findIndex(
                s => s.id == lastWatched.course_id,
            );
            var course_ = year.courses.find(s => s.id == lastWatched.course_id);
            var lesson = course_.lessons[lastWatched.index];
            navigation.navigate({
                name: 'Player_Education',
                params: {
                    lesson: lesson,
                    index: lastWatched.index,
                    course: course_,
                    years: year,
                    course_index: courseIndex_,
                    position: lastWatched.position,
                },

                merge: true,
            });
        } else {
            navigation.navigate({
                name: 'Player_Education',
                params: {
                    lesson: course.lessons[0],
                    index: 0,
                    course: course,
                    years: year,
                    course_index: 0,
                    position: 0,
                },
                merge: true,
            });
        }
    };
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <Block
                flex={1}
                width={sizes.width}
                align="center"
                justify="center"
                color={'transparent'}
            >
                {course != undefined ? (
                    <View style={{ flex: 1, width: sizes.width }}>
                        <ImageBackground
                            source={{
                                uri: GLOBAL.ImageUrlCMS + course?.backdrop,
                            }}
                            style={{
                                flex: 1,
                                width: sizes.width * 1.2,
                                height: sizes.width * 1.2 * 0.56,
                            }}
                            imageStyle={{ resizeMode: 'cover' }}
                        >
                            <LinearGradient
                                colors={['rgba(0, 0, 0, 0.2)', '#000']}
                                style={{
                                    flex: 1,
                                    width: sizes.width,
                                    height: '100%',
                                }}
                                start={{ x: 0.5, y: 0 }}
                            >
                                <ScrollView style={{ flex: 1.5 }}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.50)',
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <View
                                                style={{
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.50)',
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
                                                    onPress={() =>
                                                        onPressBack()
                                                    }
                                                >
                                                    <FontAwesome5
                                                        style={{
                                                            fontSize: 18,
                                                            color: '#fff',
                                                        }}
                                                        // icon={
                                                        //     SolidIcons.arrowLeft
                                                        // }
                                                        name="arrow-left"
                                                    />
                                                </FocusButton>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                flex: 1,
                                                justifyContent: 'flex-end',
                                                flexDirection: 'row',
                                            }}
                                        >
                                            {GLOBAL.UserInterface.player
                                                .enable_casting == true &&
                                                (Platform.OS == 'android' ||
                                                    Platform.OS == 'ios') && (
                                                    <View
                                                        style={{
                                                            backgroundColor:
                                                                'rgba(0, 0, 0, 0.50)',
                                                            borderRadius: 100,
                                                            width: 40,
                                                            height: 40,
                                                            justifyContent:
                                                                'center',
                                                            alignItems:
                                                                'center',
                                                            marginTop: 10,
                                                        }}
                                                    >
                                                        {RenderIf(
                                                            GLOBAL.Device_System ==
                                                            'Android' &&
                                                            GLOBAL.Device_FormFactor !=
                                                            'TOUCHPANEL',
                                                        )(
                                                            <CastButton
                                                                style={{
                                                                    width: 35,
                                                                    height: 35,
                                                                    tintColor:
                                                                        'white',
                                                                    fontSize: 25,
                                                                    padding: 0,
                                                                }}
                                                            />,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_System ==
                                                            'Apple',
                                                        )(
                                                            <CastButton
                                                                activeTintColor="green"
                                                                tintColor="white"
                                                                style={{
                                                                    width: 35,
                                                                    height: 35,
                                                                }}
                                                            />,
                                                        )}
                                                        {RenderIf(
                                                            GLOBAL.Device_System ==
                                                            'Android' &&
                                                            GLOBAL.Device_FormFactor !=
                                                            'TOUCHPANEL',
                                                        )(
                                                            <View
                                                                style={{
                                                                    position:
                                                                        'absolute',
                                                                    top: 11,
                                                                    left: 10,
                                                                    opacity: 0.3,
                                                                }}
                                                            >
                                                                <Image
                                                                    source={require('../../../images/chromecast.png')}
                                                                    style={{
                                                                        width: 20,
                                                                        height: 18,
                                                                    }}
                                                                />
                                                            </View>,
                                                        )}
                                                    </View>
                                                )}

                                            <View
                                                style={{
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.50)',
                                                    borderRadius: 100,
                                                    width: 40,
                                                    height: 40,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    margin: 10,
                                                }}
                                            >
                                                {GLOBAL.UserInterface.general
                                                    .enable_favourites_menu ==
                                                    true && (
                                                        <FocusButton
                                                            style={{
                                                                borderRadius: 100,
                                                            }}
                                                            o
                                                            onPress={() =>
                                                                onToggleFavorite()
                                                            }
                                                        >
                                                            <FontAwesome
                                                                style={{
                                                                    fontSize: 18,
                                                                    color: '#fff',
                                                                }}
                                                                // icon={
                                                                //     favorite
                                                                //         ? SolidIcons.heart
                                                                //         : RegularIcons.heart
                                                                // }
                                                                name={favorite ? "heart" : "heart-o"}
                                                            />
                                                        </FocusButton>
                                                    )}
                                            </View>
                                        </View>
                                    </View>

                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'column',
                                            alignSelf: 'center',
                                        }}
                                    >
                                        <View
                                            style={{
                                                paddingTop:
                                                    GLOBAL.Device_IsWebTV
                                                        ? sizes.height * 0.2
                                                        : 20,
                                            }}
                                        >
                                            <View style={{ marginLeft: 20 }}>
                                                <Text h2>{course?.name}</Text>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            marginRight: 15,
                                                        }}
                                                    >
                                                        <Text bold>
                                                            {LANG.getTranslation(
                                                                'year',
                                                            )}
                                                            : {course?.year}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={{
                                                            marginRight: 15,
                                                        }}
                                                    >
                                                        <Text bold>
                                                            {LANG.getTranslation(
                                                                'language',
                                                            )}
                                                            : {course?.language}
                                                        </Text>
                                                    </View>
                                                </View>
                                                {course?.descriptions?.find(
                                                    d =>
                                                        d.language ==
                                                        LANG.getEnglishLanguageName(
                                                            GLOBAL.Selected_Language,
                                                        ),
                                                ) != undefined && (
                                                        <Text>
                                                            {
                                                                course?.descriptions?.find(
                                                                    d =>
                                                                        d.language ==
                                                                        LANG.getEnglishLanguageName(
                                                                            GLOBAL.Selected_Language,
                                                                        ),
                                                                ).description
                                                            }
                                                        </Text>
                                                    )}
                                                {course?.descriptions?.find(
                                                    d =>
                                                        d.language ==
                                                        LANG.getEnglishLanguageName(
                                                            GLOBAL.Selected_Language,
                                                        ),
                                                ) == undefined &&
                                                    course?.descriptions
                                                        ?.length > 0 && (
                                                        <Text>
                                                            {
                                                                course
                                                                    ?.descriptions[0]
                                                                    .description
                                                            }
                                                        </Text>
                                                    )}
                                                <Text
                                                    size={11}
                                                    style={{
                                                        marginTop: 10,
                                                        marginBottom: 20,
                                                    }}
                                                >
                                                    {course?.teachers}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    width: sizes.width * 0.99,
                                                    alignSelf: 'center',
                                                    marginBottom: 0,
                                                }}
                                            >
                                                <OverflowMenu
                                                    anchor={renderSeasonButton}
                                                    visible={courseVisible}
                                                    placement={'bottom'}
                                                    selectedIndex={
                                                        selectedCourseIndex
                                                    }
                                                    style={{
                                                        width:
                                                            sizes.width * 0.98,
                                                        marginTop:
                                                            GLOBAL.Device_Manufacturer ==
                                                                'Apple' ||
                                                                GLOBAL.Device_IsWebTV
                                                                ? 0
                                                                : 30,
                                                    }}
                                                    onBackdropPress={() =>
                                                        setCourseVisible(false)
                                                    }
                                                    onSelect={
                                                        onItemSelectSeason
                                                    }
                                                >
                                                    {courses.map(
                                                        renderSeasonItem,
                                                    )}
                                                </OverflowMenu>
                                            </View>
                                        </View>
                                        <FlatList
                                            data={course?.lessons}
                                            numColumns={columns}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderLesson}
                                        />
                                    </View>
                                </ScrollView>
                            </LinearGradient>
                        </ImageBackground>
                    </View>
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
            </Block>
        </View>
    );
};
