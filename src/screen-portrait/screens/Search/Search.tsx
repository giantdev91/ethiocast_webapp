import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    BackHandler,
    ScrollView,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Icon, Input } from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import Voice from '@react-native-voice/voice';
import * as Animatable from 'react-native-animatable';
import { CommonActions } from '@react-navigation/native';
import {
    sendPageReport,
    sendActionReport,
    sendSearchReport,
} from '../../../reporting/reporting';
import TimerMixin from 'react-timer-mixin';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default ({ navigation, route }): React.ReactElement => {
    var store_search_timer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    //const [content, setContent] = useState([]);
    const [channels, setChannels] = useState([]);
    const [catchupChannels, setCatchupChannels] = useState([]);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [channelsSearch, setChannelsSearch] = useState([]);
    const [moviesSearch, setMoviesSearch] = useState([]);
    const [seriesSearch, setSeriesSearch] = useState([]);
    const [programsSearch, setProgramsSearch] = useState([]);
    //const [contentSearch, setContentSearch] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    var sizes = SIZES.getSizing();

    const [showVoiceButton, setShowVoiceButton] = useState(false);
    const [showVoiceEnabled, setShowVoiceEnabled] = useState(false);
    const [extraSearchResults, setExtraSearchResults] = useState([]);
    useEffect(() => {
        return () => sendPageReport('Search', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        (async () => {
            let res = await getSearchContent();
            if (res.success) {
                setLoading(false);
            }
        })();
        if (route.params?.searchValue != undefined) {
            onSearch(route.params.searchValue);
            setSearchTerm(route.params.searchValue);
        }
        if (
            GLOBAL.Device_System == 'Apple' ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.onSpeechResults = onSpeechResultsHandler.bind(this);
        }
        if (
            GLOBAL.Device_System == 'Apple' ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.isAvailable().then(result => {
                setShowVoiceButton(true);
            });
        }
        return () => {
            TimerMixin.clearTimeout(store_search_timer);
            if (
                GLOBAL.Device_System == 'Apple' ||
                GLOBAL.Device_System == 'Android' ||
                GLOBAL.Device_System == 'Amazon'
            ) {
                Voice.destroy().then(Voice.removeAllListeners);
            }
        };
    }, []);
    useEffect(() => {
        const backAction = () => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: 'Home' }],
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
    const onStartSpeech = async () => {
        if (showVoiceEnabled == false) {
            setShowVoiceEnabled(true);
            try {
                await Voice.start('en-US');
            } catch (e) {
                setShowVoiceEnabled(false);
                Voice.stop();
            }
        } else {
            setShowVoiceEnabled(false);
            Voice.stop();
        }
    };
    const onSpeechResultsHandler = e => {
        if (e.value != '') {
            try {
                var newInput = e.value;
                var splitInput = newInput.toString().split(',');
                var extraSearch = [];
                splitInput.forEach(element => {
                    var extra = {
                        name: element,
                    };
                    extraSearch.push(extra);
                });
                if (splitInput.length > 0) {
                    Voice.stop().then(() => {
                        sendActionReport(
                            'Search Voice',
                            'Search',
                            moment().unix(),
                            splitInput[0],
                        );
                        setShowVoiceEnabled(false);
                        setSearchTerm(splitInput[0]);
                        setExtraSearchResults(extraSearch);
                        onSearch(splitInput[0]);
                    });
                }
            } catch (e) { }
        }
    };
    const onSearchExtra = searchTerm => {
        setSearchTerm(searchTerm);
        onSearch(searchTerm);
    };
    const renderExtra = ({ item }) => {
        return (
            <FocusButton
                style={{ backgroundColor: '#333', margin: 5, borderRadius: 100 }}
                onPress={() => onSearchExtra(item.name)}>
                <Text style={{ paddingHorizontal: 10, padding: 4 }}>
                    {item.name}
                </Text>
            </FocusButton>
        );
    };
    const getSearchContent = async () => {
        try {
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CRM +
                '/' +
                GLOBAL.User.products.productid +
                '_search.json';
            console.log('get search content: ', path);
            let response = await fetch(path);
            let data = await response.json();
            console.log('get search content response: ', data);
            if (data != undefined) {
                if (data != null) {
                    var channelsCatchup = UTILS.getCatchupChannels();
                    GLOBAL.SearchMovies = data.filter(c => c.type == 'Movie');
                    GLOBAL.SearchSeries = data.filter(c => c.type == 'Serie');
                    GLOBAL.SearchChannels = data.filter(
                        c => c.type == 'Channel',
                    );

                    let res2 = await getCatchupData();
                    if (res2.success) {
                        if (res2.data != undefined) {
                            var epgOut = [];
                            var channels = res2.data.channels;
                            channels.forEach(channel => {
                                var epgdata = channel.epgdata;
                                var channelOut = channelsCatchup.find(
                                    c => c.channel_id == channel.channel_id,
                                );
                                if (channelOut != undefined) {
                                    epgdata.forEach(program => {
                                        var program_ = {
                                            channel: channelOut,
                                            n: program.n,
                                            s: program.s,
                                            e: program.e,
                                            id: program.id,
                                        };
                                        epgOut.push(program_);
                                    });
                                }
                            });
                            var start = moment()
                                .startOf('day')
                                .unix()
                                .toString();
                            var end = moment().endOf('day').unix().toString();
                            var dataToday = getDataTimeScale(
                                start,
                                end,
                                epgOut,
                            );

                            GLOBAL.ProgramSearch = dataToday;

                            setMovies(GLOBAL.SearchMovies);
                            setChannels(GLOBAL.SearchChannels);
                            setCatchupChannels(channelsCatchup);
                            setSeries(GLOBAL.SearchSeries);
                            return { success: true };
                        }
                    }
                }
            }
        } catch (error) {
            return { success: false };
        }
    };

    const getDataTimeScale = (start, end, data) => {
        var dataOut = data.filter(d => d.s >= start && d.e <= end);
        return dataOut;
    };
    const getCatchupData = async () => {
        const date = moment().format('DD_MM_YYYY');
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            date +
            '_' +
            GLOBAL.ProductID +
            '_product_catchup.json?t=' +
            new Date().getTime();
        try {
            console.log('get catchup data: ', path);
            let response = await fetch(path);
            let data = await response.json();
            console.log('get catchup data response: ', data);
            if (data != undefined) {
                return { success: true, data: data };
            } else {
                return { success: false };
            }
        } catch (error) {
            return { success: false };
        }
    };
    // const onStartSearchTimer = (searchTerm) => {
    //     TimerMixin.clearTimeout(store_search_timer);
    //     store_search_timer = TimerMixin.setTimeout(() => {
    //         sendSearchReport(moment().unix(), searchTerm);
    //     }, 2000);
    // }
    const onSearch = searchTerm => {
        GLOBAL.SearchInput = searchTerm;
        setSearchTerm(searchTerm);
        try {
            if (searchTerm.length < 1) {
                GLOBAL.SearchChannels_ = [];
                GLOBAL.SearchMovies_ = [];
                GLOBAL.SearchSeries_ = [];
                GLOBAL.SearchPrograms_ = [];
                setMoviesSearch(GLOBAL.SearchMovies_);
                setChannelsSearch(GLOBAL.SearchChannels_);
                setSeriesSearch(GLOBAL.SearchSeries_);
                setProgramsSearch(GLOBAL.SearchPrograms_);
            } else {
                searchTerm = searchTerm.toLowerCase();
                if (GLOBAL.SearchChannels.length > 0) {
                    GLOBAL.SearchChannels_ = GLOBAL.SearchChannels.filter(
                        c => c.name.toLowerCase().indexOf(searchTerm) > -1,
                    );
                }
                if (GLOBAL.SearchMovies.length > 0) {
                    GLOBAL.SearchMovies_ = GLOBAL.SearchMovies.filter(
                        c => c.name.toLowerCase().indexOf(searchTerm) > -1,
                    );
                }
                if (GLOBAL.SearchSeries.length > 0) {
                    GLOBAL.SearchSeries_ = GLOBAL.SearchSeries.filter(
                        c => c.name.toLowerCase().indexOf(searchTerm) > -1,
                    );
                }
                if (GLOBAL.ProgramSearch.length > 0) {
                    GLOBAL.SearchPrograms_ = GLOBAL.ProgramSearch.filter(
                        c => c.n.toLowerCase().indexOf(searchTerm) > -1,
                    );
                }
                setMoviesSearch(GLOBAL.SearchMovies_);
                setChannelsSearch(GLOBAL.SearchChannels_);
                setSeriesSearch(GLOBAL.SearchSeries_);
                setProgramsSearch(GLOBAL.SearchPrograms_);
            }
        } catch (error) { }
    };
    const SearchIcon = props => (
        <Icon {...props} fill="#fff" name="search-outline" />
    );
    const SpeechIcon = props => (
        <Icon {...props} fill="#fff" name="mic-outline" />
    );
    const onOpenMovieDetails = item => {
        navigation.navigate({
            name: 'Movie',
            params: {
                movie_id: item.id,
                movies: movies,
            },
            merge: true,
        });
    };
    const renderMovie = ({ item }) => {
        return (
            <FocusButton
                style={{
                    height: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.5 * 1.5
                        : sizes.width * 0.17 * 1.5,
                    borderRadius: 5,
                }}
                onPress={() => onOpenMovieDetails(item)}>
                <View
                    style={{
                        margin: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <View style={{ flex: 1 }}>
                        <View
                            style={{
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4
                                    : sizes.width * 0.15,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.4 * 1.5
                                    : sizes.width * 0.15 * 1.5,
                            }}>
                            <Image
                                source={{ uri: item.image }}
                                style={[
                                    {
                                        borderColor: '#222',
                                        borderWidth: 4,
                                        borderRadius: 5,
                                        width: '100%',
                                        height: '100%',
                                    },
                                ]}></Image>
                        </View>
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
                            }}>
                            {item.name}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onOpenSeriesDetails = item => {
        var storesIn = GLOBAL.SeriesStores;
        var series = [];
        storesIn.forEach(store => {
            if (store.id == item.id) {
                series = store;
            }
            if (store.series != null) {
                var subs = store.series;
                subs.forEach(store_ => {
                    if (store_.id == item.id) {
                        series = store_;
                    }
                });
            }
        });
        if (series != null) {
            navigation.navigate({
                name: 'Seasons',
                params: {
                    series: series,
                },
                merge: true,
            });
        }
    };
    const renderSeries = ({ item }) => {
        return (
            <FocusButton
                style={{ borderRadius: 5 }}
                onPress={() => onOpenSeriesDetails(item)}>
                <View
                    style={{
                        margin: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <View
                        style={{
                            borderColor: '#222',
                            borderWidth: 4,
                            borderRadius: 5,
                            width: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.8
                                : sizes.width * 0.3,
                            height: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.8 * 0.56
                                : sizes.width * 0.3 * 0.56,
                        }}>
                        <Image
                            source={{ uri: item.image }}
                            resizeMode={'cover'}
                            style={[
                                {
                                    borderRadius: 2,
                                    width: '100%',
                                    height: '100%',
                                },
                            ]}></Image>
                    </View>
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            paddingHorizontal: 20,
                            padding: 20,
                            left: 0,
                            right: 0,
                        }}>
                        <Text h4 bold shadow numberOfLines={1}>
                            {item.name}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const getTvProgram = channel => {
        var currentUnix = moment().unix();
        var epg_check = GLOBAL.EPG.find(e => e.id == channel.id);
        var currentIndex = 0;
        var epg_ = [];
        var currentProgram = [];
        var percentageProgram = 0;
        var time = '';
        var n = 'No Information Available';
        if (epg_check != undefined) {
            epg_ = epg_check.epgdata;
            currentIndex = epg_.findIndex(function (element) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            if (currentIndex != undefined) {
                if (epg_[currentIndex] != null) {
                    currentProgram = epg_[currentIndex];
                    n = currentProgram.n;
                    time =
                        moment
                            .unix(currentProgram.s)
                            .format('ddd ' + GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment
                            .unix(currentProgram.e)
                            .format(GLOBAL.Clock_Setting);
                    var totalProgram = currentProgram.e - currentProgram.s;
                    percentageProgram =
                        (currentUnix - currentProgram.s) / totalProgram;
                }
            }
        }
        return (
            <View style={{ flex: 1 }}>
                <Text shadow numberOfLines={1}>
                    {n}
                </Text>
                <View
                    style={{
                        borderTopWidth: 2,
                        borderTopColor: '#999',
                        width:
                            (GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.58
                                : sizes.width * 0.2) * percentageProgram,
                    }}></View>
                <Text shadow numberOfLines={1}>
                    {time}
                </Text>

                <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                    {RenderIf(
                        GLOBAL.UserInterface.general.enable_catchuptv == true &&
                        (channel.is_flussonic == 1 || channel.is_dveo == 1),
                    )(
                        <View
                            style={{
                                backgroundColor: 'royalblue',
                                padding: 5,
                                borderRadius: 100,
                                margin: 2,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}>
                            <FontAwesome5
                                style={[{ fontSize: 14, color: '#fff' }]}
                                // icon={SolidIcons.history}
                                name="history"
                            />
                        </View>,
                    )}
                    {/* {RenderIf(GLOBAL.UserInterface.general.enable_catchuptv == true && (channel.is_flussonic == 1 || channel.is_dveo == 1))(
                        <View style={{ backgroundColor: 'royalblue', padding: 5, borderRadius: 100, margin: 2, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                            <FontAwesome5 style={[{ fontSize: 14, color: '#fff' }]} icon={SolidIcons.recycle} />
                        </View>
                    )} */}
                    {RenderIf(
                        GLOBAL.UserInterface.general.enable_recordings ==
                        true &&
                        (channel.is_flussonic == 1 || channel.is_dveo == 1),
                    )(
                        <View
                            style={{
                                backgroundColor: 'crimson',
                                padding: 4,
                                borderRadius: 100,
                                margin: 2,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}>
                            <FontAwesome5
                                style={[{ fontSize: 14, color: '#fff' }]}
                                // icon={SolidIcons.dotCircle}
                                name="dot-circle"
                            />
                        </View>,
                    )}
                </View>
            </View>
        );
    };
    const onPlayChannel = item => {
        var channel_index = 0;
        var category_index = 0;
        var channel = [];
        var category = [];
        var categoriesIn = [];
        GLOBAL.Channels.forEach((category, index) => {
            var categoryOut = {
                name: category.name,
                id: category.id,
                length: category.channels.length,
            };
            categoriesIn.push(categoryOut);
        });
        GLOBAL.Channels.forEach((category_, index) => {
            category_.channels.forEach((channel_, index_) => {
                if (index != 1) {
                    if (channel_.channel_id == item.id) {
                        category_index = index;
                        category = category_;
                        channel_index = index_;
                        channel = channel_;
                        GLOBAL.Channels_Selected = category_.channels;
                    }
                }
            });
        });
        GLOBAL.Channels_Selected_Category_Index = category_index;
        navigation.navigate({
            name: 'Player_Channels',
            params: {
                index: channel_index,
                channels: GLOBAL.Channels_Selected,
                channel: channel,
                categories: categoriesIn,
                category_index: category_index,
            },
            merge: true,
        });
    };
    const getCurrentImage = (url, start) => {
        var splitUrl = url.toString().split('/');
        var timePart = moment.unix(start).format('/YYYY/MM/DD/hh/mm/ss');
        // var image = splitUrl[0] + "//" + splitUrl[2] + "/" + splitUrl[3] + timePart + "-preview.jpg";
        var image =
            splitUrl[0] +
            '//' +
            splitUrl[2] +
            '/' +
            splitUrl[3] +
            '/' +
            start +
            '-preview.jpg';
        return image;
    };
    const onPlayCatchupTV = (item, channel, index) => {
        var tvGuide = GLOBAL.EPG.find(e => e.id == channel.channel_id);
        if (tvGuide != undefined) {
            var epg = tvGuide.epgdata;

            var programIndex = epg.findIndex(t => t.id == item.id);
            if (programIndex != undefined) {
                navigation.navigate({
                    name: 'Player_CatchupTV',
                    params: {
                        index: programIndex,
                        program: item,
                        programs: epg,
                        channel: channel,
                        channels: catchupChannels,
                    },
                });
            }
        }
    };
    const renderProgram = ({ item, index }) => {
        return (
            <FocusButton
                style={{
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.74
                        : sizes.width * 0.325,
                    height:
                        ((GLOBAL.Device_IsPortrait
                            ? sizes.width * 1.1
                            : sizes.width * 0.45) /
                            16) *
                        9,
                }}
                onPress={() => onPlayCatchupTV(item, item.channel, index)}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#111',
                        marginHorizontal: 5,
                        marginBottom: 5,
                        borderRadius: 5,
                    }}>
                    <View style={{ padding: 10 }}>
                        <View
                            style={{
                                borderRadius: 2,
                                backgroundColor: '#000',
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.65
                                    : sizes.width * 0.3,
                                height:
                                    ((GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.65
                                        : sizes.width * 0.3) /
                                        16) *
                                    9,
                            }}>
                            <Image
                                source={{
                                    uri: getCurrentImage(
                                        item.channel.url_high,
                                        item.s,
                                    ),
                                }}
                                style={{
                                    borderRadius: 2,
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.65
                                        : sizes.width * 0.3,
                                    height:
                                        ((GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.65
                                            : sizes.width * 0.3) /
                                            16) *
                                        9,
                                }}></Image>
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    left: 20,
                                    zIndex: 99999,
                                }}>
                                <Image
                                    source={{
                                        uri:
                                            GLOBAL.ImageUrlCMS +
                                            item.channel.icon_big,
                                    }}
                                    style={{
                                        width:
                                            sizes.width *
                                            (GLOBAL.Device_IsPortrait
                                                ? 0.11
                                                : 0.05),
                                        height:
                                            sizes.width *
                                            (GLOBAL.Device_IsPortrait
                                                ? 0.11
                                                : 0.05),
                                    }}></Image>
                            </View>
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
                                        ((GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.65
                                            : sizes.width * 0.3) /
                                            16) *
                                        9,
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.65
                                        : sizes.width * 0.3,
                                }}>
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
                        </View>
                    </View>
                    <View
                        style={{
                            paddingLeft: 10,
                            width: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.66
                                : sizes.width * 0.3,
                        }}>
                        <Text bold numberOfLines={1}>
                            {item.n}
                        </Text>
                        <Text>
                            {moment
                                .unix(item.s)
                                .format('ddd ' + GLOBAL.Clock_Setting)}{' '}
                            - {moment.unix(item.e).format(GLOBAL.Clock_Setting)}{' '}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const renderChannel = ({ item }) => {
        return (
            <FocusButton
                style={{
                    minHeight: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.4
                        : sizes.width * 0.09,
                    borderRadius: 5,
                }}
                onPress={() => onPlayChannel(item)}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        margin: 5,
                        borderRadius: 5,
                        borderColor: '#222',
                        borderWidth: 3,
                        width: GLOBAL.Device_IsPortrait
                            ? sizes.width * 0.92
                            : sizes.width * 0.35,
                    }}>
                    <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                margin: 10,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.26
                                    : sizes.width * 0.08,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.26
                                    : sizes.width * 0.08,
                            }}></Image>
                    </View>
                    <View
                        style={{
                            padding: 5,
                            paddingLeft: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            flex: 1,
                            paddingRight: 10,
                        }}>
                        <Text h5 bold shadow numberOfLines={1}>
                            {item.channel_number} {item.name}
                        </Text>
                        {getTvProgram(item)}
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onPressBack = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Home' }],
            }),
        );
    };
    return (
        <View style={{ flex: 1 }}>
            {!loading ? (
                <Block
                    flex={1}
                    width={sizes.width}
                    align="center"
                    justify="center"
                    color={'transparent'}>
                    {showVoiceEnabled && (
                        <View
                            style={{
                                borderRadius: 5,
                                backgroundColor: 'rgba(0, 0, 0, 0.80)',
                                position: 'absolute',
                                width: sizes.width * 0.3,
                                height: sizes.width * 0.3,
                                zIndex: 99999,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                flex: 1,
                            }}>
                            <Animatable.View
                                animation="pulse"
                                easing="ease-in-out"
                                iterationCount="infinite">
                                <FontAwesome5
                                    style={[
                                        styles.Shadow,
                                        {
                                            color: '#fff',
                                            fontSize: 50,
                                            padding: 0,
                                            margin: 0,
                                        },
                                    ]}
                                    // icon={SolidIcons.microphone}
                                    name="microphone"
                                />
                            </Animatable.View>
                        </View>
                    )}
                    <View
                        style={{
                            flexDirection: 'column',
                            width: sizes.width,
                            backgroundColor: 'rgba(0, 0, 0, 0.80)',
                            paddingTop: 10,
                            paddingBottom: 10,
                        }}>
                        <View
                            style={{ flexDirection: 'row', width: sizes.width }}>
                            <View
                                style={{
                                    paddingLeft: 10,
                                    marginRight: 0,
                                    borderRadius: 100,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: 10,
                                }}>
                                <FocusButton
                                    style={{ borderRadius: 100 }}
                                    onPress={() => onPressBack()}>
                                    <FontAwesome5
                                        style={{ fontSize: 18, color: '#fff' }}
                                        // icon={SolidIcons.arrowLeft}
                                        name="arrow-left"
                                    />
                                </FocusButton>
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    borderColor: '#999',
                                    borderWidth: 1,
                                    borderRadius: 100,
                                    marginHorizontal: 20,
                                }}>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        alignSelf: 'center',
                                        paddingVertical: 5,
                                    }}>
                                    <Input
                                        style={{
                                            borderColor: 'transparent',
                                            width: '100%',
                                            backgroundColor: 'transparent',
                                            paddingRight: showVoiceEnabled
                                                ? 0
                                                : 20,
                                        }}
                                        value={searchTerm}
                                        autoComplete={'off'}
                                        autoFocus={
                                            route.params?.searchValue !=
                                                undefined
                                                ? true
                                                : false
                                        }
                                        placeholder={
                                            LANG.getTranslation('search') +
                                            '...'
                                        }
                                        accessoryLeft={SearchIcon}
                                        underlineColorAndroid="transparent"
                                        onChangeText={nextValue =>
                                            onSearch(nextValue)
                                        }
                                    />
                                </View>
                                <View style={{ alignSelf: 'center' }}>
                                    {showVoiceButton && (
                                        <Button
                                            style={{ borderRadius: 5 }}
                                            appearance="ghost"
                                            accessoryLeft={SpeechIcon}
                                            onPress={onStartSpeech}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>

                        <View style={{ marginLeft: 10 }}>
                            <FlatList
                                key={extraSearchResults}
                                extraData={extraSearchResults}
                                data={extraSearchResults}
                                horizontal={true}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderExtra}
                            />
                        </View>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            width: sizes.width,
                        }}>
                        <ScrollView
                            //contentContainerStyle={{ flex: 1 }}
                            style={{ flex: 1 }}>
                            <LinearGradient
                                colors={[
                                    'rgba(0, 0, 0, 0.80)',
                                    'rgba(0, 0, 0, 0.0)',
                                ]}
                                style={{
                                    flex: 1,
                                    width: sizes.width,
                                    minHeight: sizes.height,
                                }}
                                start={{ x: 0.5, y: 0 }}>
                                {programsSearch != undefined && (
                                    <View style={{ paddingTop: 10 }}>
                                        <FlatList
                                            data={programsSearch}
                                            horizontal={true}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderProgram}
                                        />
                                    </View>
                                )}
                                {seriesSearch != undefined && (
                                    <View style={{ paddingTop: 10 }}>
                                        <FlatList
                                            data={seriesSearch}
                                            horizontal={true}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderSeries}
                                        />
                                    </View>
                                )}
                                {moviesSearch != undefined && (
                                    <View style={{ paddingTop: 10 }}>
                                        <FlatList
                                            data={moviesSearch}
                                            horizontal={true}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderMovie}
                                        />
                                    </View>
                                )}
                                {channelsSearch != undefined && (
                                    <View style={{ paddingTop: 10 }}>
                                        <FlatList
                                            data={channelsSearch}
                                            horizontal={true}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderChannel}
                                        />
                                    </View>
                                )}
                            </LinearGradient>
                        </ScrollView>
                    </View>
                </Block>
            ) : (
                <View
                    style={{
                        flex: 1,
                        height: sizes.height,
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                    <ActivityIndicator size={'large'} color={'white'} />
                </View>
            )}
        </View>
    );
};
