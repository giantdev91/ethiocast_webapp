import React, { ReactElement, useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    TouchableWithoutFeedback,
    ActivityIndicator,
    BackHandler,
    TVMenuControl,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Modal,
    Card,
} from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import Accordion from 'react-native-collapsible/Accordion';
import { TouchableOpacity } from 'react-native-gesture-handler';
import moment from 'moment';
import { CommonActions } from '@react-navigation/native';
import { sendPageReport } from '../../../reporting/reporting';

export default ({ navigation }): React.ReactElement => {
    //const refContainer = useRef(null);
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [activeSections, setActiveSections] = useState([]);
    const [hasParentalControl, setHasParentalControl] = useState(false);
    //const [expanded, setExpanded] = useState(false);
    const [channels, setChannels] = useState([]);
    const [categoryVisible, setCategoryVisible] = useState(false);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    //const [channelsSearch, setChannelsSearch] = useState([]);
    const [selectedChannelIndex, setSelectedChannelIndex] = useState(null);
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);
    const [selectedChannelName, setSelectedChannelName] = useState('');
    const [selectedChannelUrl, setSelectedChannelUrl] = useState('');
    const [selectedDateName, setSelectedDateName] = useState(null);
    const [selectedChannel, setSeletectedChannel] = useState([]);
    const [selectedChannelDataLiveIndex, setSelectedChannelDataLiveIndex] =
        useState(0);
    const [allEpgData, setAllEpgData] = useState([]);
    const [dayOffset, setDayOffset] = useState(0);
    const [interactiveTV, setInteractiveTV] = useState(false);
    const [tvGuide, setTvGuide] = useState([]);
    const [tvGuideAllTimes, setTvGuideAllTimes] = useState([]);
    const [dates, setDates] = useState([]);
    const [dateVisible, setDateVisible] = useState(false);
    const [channelVisible, setChannelVisible] = useState(false);
    const [categories, setCategories] = useState(['']);

    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [showRecordingSuccessModal, setShowRecordingSuccessModal] =
        useState(false);
    const [error, setError] = useState('');
    const [recordedProgram, setRecordedProgram] = useState('');

    var sizes = SIZES.getSizing();
    // const [value, setValue] = React.useState(null);
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = useState(true);
    //const filter = (item, query) => item.name.toLowerCase().includes(query.toLowerCase());
    useEffect(() => {
        return () =>
            sendPageReport('TV Guide', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var channelsIn = GLOBAL.Channels_Selected;

        if (channelsIn != undefined && channelsIn.length > 0) {
            setChannels(channelsIn);
            setSelectedChannelName(
                channelsIn[0].name != null ? channelsIn[0].name : '',
            );
            setSelectedChannelUrl(channelsIn[0].url_high);
            setSeletectedChannel(channelsIn[0]);
            setSelectedChannelIndex({ row: 0, section: 0 });
            if (channelsIn[0].is_flussonic == 1 || channelsIn[0].is_dveo == 1) {
                setInteractiveTV(true);
            }
            if (channelsIn[0].childlock == 1) {
                setHasParentalControl(true);
            }
        }
        var dates = getDates();
        setDates(dates);
        var dateTodayIndex = dates.findIndex(d => d.today == true);
        setSelectedDateName(dates[dateTodayIndex].time);
        setSelectedDateIndex({ row: dateTodayIndex, section: 0 });

        var categoriesIn = [];
        GLOBAL.Channels.forEach((category, index) => {
            var categoryOut = {
                name: category.name,
                id: category.id,
                length: category.channels.length,
            };
            categoriesIn.push(categoryOut);
        });
        if (
            categoriesIn[GLOBAL.Channels_Selected_Category_Index] != undefined
        ) {
            setSelectedCategoryName(
                categoriesIn[GLOBAL.Channels_Selected_Category_Index].name +
                ' (' +
                categoriesIn[GLOBAL.Channels_Selected_Category_Index]
                    .length +
                ')',
            );
        } else {
            GLOBAL.Channels_Selected_Category_Index = 0;
            if (
                categoriesIn[GLOBAL.Channels_Selected_Category_Index] !=
                undefined
            ) {
                setSelectedCategoryName(
                    categoriesIn[GLOBAL.Channels_Selected_Category_Index].name +
                    ' (' +
                    categoriesIn[GLOBAL.Channels_Selected_Category_Index]
                        .length +
                    ')',
                );
            }
        }
        setSelectedCategoryIndex({ row: 0, section: 0 });
        setCategories(categoriesIn);
        getEpgData(0);

        return () => {
            GLOBAL.EPG_Days = 0;
            GLOBAL.EPG = GLOBAL.EPG_TODAY;
        };
    }, []);

    useEffect(() => {
        const backAction = () => {
            GLOBAL.EPG = GLOBAL.EPG_TODAY;
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

    const getDataTimeScale = (start, end, data) => {
        var dataOut = data.filter(d => d.s >= start && d.e <= end);
        return dataOut;
    };
    const getDates = () => {
        var max = GLOBAL.UserInterface.general.catchup_days;
        var min = (GLOBAL.UserInterface.general.catchup_days - 1) * -1;
        var dates = [];
        for (var i = min; i < max; i++) {
            var time_ = moment().add(i, 'days').format('dddd ll');
            dates.push({ time: time_, days: i, today: i == 0 ? true : false });
        }
        return dates;
    };
    const onStartProgramOrRecord = (item, index, isPast) => {
        if (isPast) {
            onPlayCatchupTV(item, index);
        } else {
            onRecordProgram(item, index);
        }
    };
    const _renderContent = (item, index) => {
        var currentTime = moment().unix();
        var startTime = item.s;
        var endTime = item.e;
        var isLive = false;
        var isPast = false;
        if (currentTime >= startTime && currentTime <= endTime) {
            isLive = true;
        }
        if (currentTime > endTime) {
            isPast = true;
        }
        var isInteractive = false;
        if (selectedChannel.is_flussonic == 1 || selectedChannel.is_dveo == 1) {
            isInteractive = true;
        }
        var parentalControl = false;
        if (selectedChannel.childlock == 1) {
            parentalControl = true;
        }
        if (!isLive && isPast && isInteractive) {
            return (
                <FocusButton
                    onPress={() => onStartProgramOrRecord(item, index, isPast)}
                >
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#111',
                            marginHorizontal: 5,
                            marginBottom: 5,
                        }}
                    >
                        <View style={{ padding: 10 }}>
                            <View
                                style={{
                                    height: ((sizes.width * 0.93) / 16) * 9,
                                    backgroundColor: '#000',
                                }}
                            >
                                {!isInteractive && !parentalControl && (
                                    <Image
                                        source={{
                                            uri: getCurrentImageNoDvr(
                                                selectedChannelUrl,
                                                startTime,
                                            ),
                                        }}
                                        style={{
                                            borderRadius: 2,
                                            width: sizes.width * 0.93,
                                            height:
                                                ((sizes.width * 0.93) / 16) * 9,
                                        }}
                                    ></Image>
                                )}
                                {isInteractive && !parentalControl && (
                                    <Image
                                        source={{
                                            uri: getCurrentImage(
                                                selectedChannelUrl,
                                                startTime,
                                            ),
                                        }}
                                        style={{
                                            borderRadius: 2,
                                            width: sizes.width * 0.93,
                                            height:
                                                ((sizes.width * 0.93) / 16) * 9,
                                        }}
                                    ></Image>
                                )}
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
                                        height: ((sizes.width * 0.93) / 16) * 9,
                                        width: '100%',
                                    }}
                                >
                                    <FontAwesome5
                                        style={{
                                            color: '#fff',
                                            fontSize: 45,
                                            opacity: 0.8,
                                            textShadowColor:
                                                'rgba(0, 0, 0, 0.75)',
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
                            {/* <Image source={{ uri: getCurrentImage(selectedChannelUrl, item.s) }} style={{ width: sizes.width * 0.93, height: ((sizes.width * 0.93) / 16) * 9 }}></Image> */}
                            {/* <View style={{ position: 'absolute', top: 10, left: 20, zIndex: 99999 }}>
                                <Image source={{ uri: GLOBAL.ImageUrlCMS + selectedChannel.icon_big }} style={{ width: sizes.width * 0.1, height: sizes.width * 0.1 }}></Image>
                            </View> */}

                            <View style={{ margin: 5 }}>
                                <Text bold>{item.n}</Text>
                                <Text>
                                    {moment
                                        .unix(item.s)
                                        .format(
                                            'ddd ' + GLOBAL.Clock_Setting,
                                        )}{' '}
                                    -{' '}
                                    {moment
                                        .unix(item.e)
                                        .format(GLOBAL.Clock_Setting)}{' '}
                                </Text>
                            </View>
                        </View>
                    </View>
                </FocusButton>
            );
        } else {
            if (
                GLOBAL.UserInterface.general.enable_recordings == true &&
                isInteractive &&
                !parentalControl
            ) {
                return (
                    <FocusButton
                        onPress={() =>
                            onStartProgramOrRecord(item, index, isPast)
                        }
                    >
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: '#111',
                                marginHorizontal: 5,
                                marginBottom: 5,
                            }}
                        >
                            <Text style={{ padding: 20 }}>
                                {LANG.getTranslation('press_to_record')}
                            </Text>
                        </View>
                    </FocusButton>
                );
            } else {
                return null;
            }
        }
    };
    const onPlayCatchupTV = (item, index) => {
        if (interactiveTV) {
            navigation.navigate({
                name: 'Player_CatchupTV',
                params: {
                    index: index,
                    program: item,
                    programs: tvGuide,
                    channel: selectedChannel,
                    channels: channels,
                },
            });
        }
    };
    const onRecordProgram = (item, index) => {
        if (interactiveTV) {
            setShowRecordingModal(true);
            setRecordProgram(item);
            setRecordedProgram(
                item.n +
                ' ' +
                moment.unix(item.s).format(GLOBAL.Clock_Setting) +
                ' - ' +
                moment.unix(item.e).format(GLOBAL.Clock_Setting),
            );
        }
    };
    const setRecordProgram = item => {
        DAL.setRecording(
            selectedChannel.channel_id,
            item.e,
            item.s,
            item.n,
        ).then(data => {
            if (data == 'Not Approved') {
                setError(LANG.getTranslation('recording_set_for_not'));
            } else {
                setShowRecordingModal(false);
                setShowRecordingSuccessModal(true);
            }
        });
    };
    const onPlayLive = (item, index) => {
        navigation.navigate({
            name: 'Player_Channels',
            params: {
                index: selectedChannelIndex.row,
                channels: channels,
                channel: selectedChannel,
                categories: categories,
                category_index: selectedCategoryIndex,
            },
            merge: true,
        });
    };
    const _renderHeader = (item, index) => {
        var currentTime = moment().unix();
        var startTime = item.s;
        var endTime = item.e;

        var isLive = false;
        var isPast = false;
        var isFuture = false;

        var totalProgram = endTime - startTime;
        var percentageProgram = (currentTime - startTime) / totalProgram;

        var isInteractive = false;
        if (selectedChannel.is_flussonic == 1 || selectedChannel.is_dveo == 1) {
            isInteractive = true;
        }
        var parentalControl = false;
        if (selectedChannel.childlock == 1) {
            parentalControl = true;
        }
        if (currentTime >= startTime && currentTime <= endTime) {
            setSelectedChannelDataLiveIndex(index);
            isLive = true;
        }
        if (currentTime > endTime) {
            isPast = true;
        }
        if (currentTime < startTime) {
            isFuture = true;
        }
        var image = '';
        if (!isInteractive) {
            image = getCurrentImageNoDvr(selectedChannel.url_high, startTime);
        } else {
            image = getCurrentImage(selectedChannel.url_high, startTime);
        }

        if (isLive) {
            image = getLiveImage(selectedChannel.url_high, startTime);
        }

        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    borderRadius: 5,
                    width: sizes.width * 0.98,
                    padding: isLive && !hasParentalControl ? 10 : 10,
                    backgroundColor: isFuture
                        ? '#333'
                        : isLive
                            ? '#111'
                            : '#222',
                    margin: 3,
                    alignItems: 'center',
                }}
            >
                {RenderIf(isLive == true)(
                    <FocusButton onPress={() => onPlayLive(item, index)}>
                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    height: ((sizes.width * 0.93) / 16) * 9,
                                    width: sizes.width * 0.93,
                                    backgroundColor: '#000',
                                }}
                            >
                                {!parentalControl &&
                                    image != '' &&
                                    image != null && (
                                        <Image
                                            source={{ uri: image }}
                                            style={{
                                                borderRadius: 2,
                                                width: sizes.width * 0.93,
                                                height:
                                                    ((sizes.width * 0.93) /
                                                        16) *
                                                    9,
                                            }}
                                        ></Image>
                                    )}
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 99999,
                                        height: ((sizes.width * 0.93) / 16) * 9,
                                        width: '100%',
                                    }}
                                >
                                    <FontAwesome5
                                        style={{
                                            color: '#fff',
                                            fontSize: 45,
                                            opacity: 0.8,
                                            textShadowColor:
                                                'rgba(0, 0, 0, 0.75)',
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
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    marginTop: 10,
                                    marginLeft: 10,
                                }}
                            >
                                <Text
                                    bold
                                    size={10}
                                    style={{ width: sizes.width * 0.3 }}
                                >
                                    {moment
                                        .unix(item.s)
                                        .format('ddd ' + GLOBAL.Clock_Setting)}
                                </Text>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        width: sizes.width * 0.49,
                                        marginRight: 10,
                                    }}
                                >
                                    {item.n}
                                </Text>
                                <View style={{ flex: 1, flexDirection: 'row' }}>
                                    {RenderIf(isInteractive == true)(
                                        <View
                                            style={{
                                                backgroundColor: 'royalblue',
                                                padding: 5,
                                                borderRadius: 100,
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                            }}
                                        >
                                            <FontAwesome5
                                                style={[
                                                    {
                                                        fontSize: 14,
                                                        color: '#fff',
                                                    },
                                                ]}
                                                // icon={SolidIcons.history}
                                                name="history"
                                            />
                                        </View>,
                                    )}
                                </View>
                            </View>

                            <View
                                style={{
                                    marginLeft: 10,
                                    marginBottom: 10,
                                    borderTopWidth: 2,
                                    borderTopColor: '#999',
                                    width:
                                        sizes.width * 0.89 * percentageProgram,
                                }}
                            ></View>
                        </View>
                    </FocusButton>,
                )}
                {RenderIf(isLive == false)(
                    <Text bold size={10} style={{ width: sizes.width * 0.3 }}>
                        {moment
                            .unix(item.s)
                            .format('ddd ' + GLOBAL.Clock_Setting)}
                    </Text>,
                )}
                {RenderIf(isLive == false)(
                    <Text
                        numberOfLines={1}
                        style={{ width: sizes.width * 0.5, marginRight: 10 }}
                    >
                        {item.n}
                    </Text>,
                )}
                {RenderIf(isPast == true && isInteractive == true)(
                    <View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View
                                style={{
                                    backgroundColor: 'royalblue',
                                    padding: 5,
                                    borderRadius: 100,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                }}
                            >
                                <FontAwesome5
                                    style={[{ fontSize: 14, color: '#fff' }]}
                                    // icon={SolidIcons.history}
                                    name="history"
                                />
                            </View>
                        </View>
                    </View>,
                )}
                {RenderIf(isFuture == true && isInteractive == true)(
                    <View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View
                                style={{
                                    backgroundColor: 'crimson',
                                    padding: 5,
                                    borderRadius: 100,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                }}
                            >
                                <FontAwesome5
                                    style={[{ fontSize: 14, color: '#fff' }]}
                                    // icon={SolidIcons.dotCircle}
                                    name="dot-circle"
                                />
                            </View>
                        </View>
                    </View>,
                )}
            </View>
        );
    };
    const getCurrentImageNoDvr = (url, start) => {
        if (url == undefined) {
            return;
        }
        var splitUrl = url.toString().split('/');
        var image =
            splitUrl[0] +
            '//' +
            splitUrl[2] +
            '/' +
            splitUrl[3] +
            '/' +
            'preview.jpg';
        return image;
    };
    const getCurrentImage = (url, start) => {
        if (url == undefined) {
            return;
        }
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
    const getLiveImage = (url, start) => {
        if (url == undefined) {
            return;
        }
        var splitUrl = url.toString().split('/');
        var timePart = moment.unix(start).format('/YYYY/MM/DD/hh/mm/ss');
        var image =
            splitUrl[0] +
            '//' +
            splitUrl[2] +
            '/' +
            splitUrl[3] +
            '/preview.jpg';
        return image;
    };
    const renderDateButton = () => (
        <Button onPress={() => setDateVisible(true)}>{selectedDateName}</Button>
    );
    const renderDateItem = (date, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={date.time}
        />
    );
    const renderChannelButton = () => (
        <Button
            onPress={() => setChannelVisible(true)}
            accessoryLeft={() => ChannelImage(selectedChannel)}
        >
            {selectedChannelName}
        </Button>
    );
    const renderChannelItem = (channel, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={channel.channel_number + '. ' + channel.name}
        />
    );
    const ChannelImage = channel => {
        return (
            <Image
                source={{ uri: GLOBAL.ImageUrlCMS + channel.icon_big }}
                style={{
                    marginRight: 5,
                    width: sizes.width * 0.1,
                    height: sizes.width * 0.1,
                }}
            ></Image>
        );
    };
    const getEpgData = days => {
        const date = moment().add(days, 'days').format('DD_MM_YYYY');
        if (days == 0) {
            if (GLOBAL.EPG != undefined) {
                GLOBAL.EPG = GLOBAL.EPG_TODAY;
                var guide = GLOBAL.EPG;
                if (GLOBAL.EPG.length > 0) {
                    setAllEpgData(guide);
                    var data = GLOBAL.EPG[0].epgdata;
                    setTvGuideAllTimes(data);
                    var start = moment()
                        .add(0, 'days')
                        .startOf('day')
                        .unix()
                        .toString();
                    var end = moment()
                        .add(0, 'days')
                        .endOf('day')
                        .unix()
                        .toString();
                    var dataToday = getDataTimeScale(start, end, data);
                    setTvGuide(dataToday);
                }
                setLoading(false);
            }
        } else {
            GLOBAL.EPG = [];
            GLOBAL.EPG_DATE_LOADED = [];
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
                '_product_epg_v4.json?t=' +
                new Date().getTime();
            DAL.getJson(path)
                .then(data => {
                    GLOBAL.EPG = data.channels;
                    GLOBAL.EPG_DATE_LOADED = date;
                    if (GLOBAL.User.products.ChannelPackages.length > 0) {
                        getExtraEpg(days, 0);
                    } else {
                        if (GLOBAL.EPG != undefined) {
                            var guide = GLOBAL.EPG;
                            setAllEpgData(guide);
                            var data = GLOBAL.EPG[0].epgdata;
                            setTvGuideAllTimes(data);
                            var start = moment()
                                .add(days, 'days')
                                .startOf('day')
                                .unix()
                                .toString();
                            var end = moment()
                                .add(days, 'days')
                                .endOf('day')
                                .unix()
                                .toString();
                            var dataToday = getDataTimeScale(start, end, data);
                            setTvGuide(dataToday);
                            setLoading(false);
                        }
                    }
                })
                .catch(error => {
                    if (GLOBAL.EPG != undefined) {
                        var guide = GLOBAL.EPG;
                        setAllEpgData(guide);
                        var data = GLOBAL.EPG[0].epgdata;
                        setTvGuideAllTimes(data);
                        var start = moment()
                            .add(days, 'days')
                            .startOf('day')
                            .unix()
                            .toString();
                        var end = moment()
                            .add(days, 'days')
                            .endOf('day')
                            .unix()
                            .toString();
                        var dataToday = getDataTimeScale(start, end, data);
                        setTvGuide(dataToday);
                        setLoading(false);
                    }
                });
        }
    };
    const getExtraEpg = (days, id) => {
        if (id < GLOBAL.User.products.ChannelPackages.length) {
            const date = moment().add(days, 'days').format('DD_MM_YYYY');
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                date +
                '_' +
                GLOBAL.User.products.ChannelPackages[id].PackageID +
                '_package_epg_v2.json?t=' +
                new Date().getTime();
            DAL.getJson(path)
                .then(data => {
                    data.channels.forEach(function (element) {
                        GLOBAL.EPG = GLOBAL.EPG.concat(element);
                        GLOBAL.EPG_TODAY = GLOBAL.EPG_TODAY.concat(element);
                        GLOBAL.EPG_DATE_LOADED = date;
                    });
                    if (GLOBAL.User.products.ChannelPackages.length > 0) {
                        getExtraEpg(days, id + 1);
                    } else {
                        var guide = GLOBAL.EPG;
                        setAllEpgData(guide);
                        var data = GLOBAL.EPG[0].epgdata;
                        setTvGuideAllTimes(data);
                        var start = moment()
                            .add(days, 'days')
                            .startOf('day')
                            .unix()
                            .toString();
                        var end = moment()
                            .add(days, 'days')
                            .endOf('day')
                            .unix()
                            .toString();
                        var dataToday = getDataTimeScale(start, end, data);
                        setTvGuide(dataToday);
                        setLoading(false);
                    }
                })
                .catch(error => {
                    var guide = GLOBAL.EPG;
                    setAllEpgData(guide);
                    var data = GLOBAL.EPG[0].epgdata;
                    setTvGuideAllTimes(data);
                    var start = moment()
                        .add(days, 'days')
                        .startOf('day')
                        .unix()
                        .toString();
                    var end = moment()
                        .add(days, 'days')
                        .endOf('day')
                        .unix()
                        .toString();
                    var dataToday = getDataTimeScale(start, end, data);
                    setTvGuide(dataToday);
                    setLoading(false);
                });
        } else {
            var guide = GLOBAL.EPG;
            setAllEpgData(guide);
            var data = GLOBAL.EPG[0].epgdata;
            setTvGuideAllTimes(data);
            var start = moment()
                .add(days, 'days')
                .startOf('day')
                .unix()
                .toString();
            var end = moment().add(days, 'days').endOf('day').unix().toString();
            var dataToday = getDataTimeScale(start, end, data);
            setTvGuide(dataToday);
            setLoading(false);
        }
    };
    const onItemSelectDate = item => {
        setLoading(true);
        setDateVisible(false);
        var date = dates[item.row];
        setDayOffset(date.days);
        setSelectedDateName(date.time);
        getEpgData(date.days);
        // var start = moment().add(date.days, 'days').startOf('day').unix().toString();
        // var end = moment().add(date.days, 'days').endOf('day').unix().toString();
        // var dataToday = getDataTimeScale(start, end, tvGuideAllTimes);
        // setDateVisible(false);
        // setTvGuide(dataToday);
    };
    const onItemSelectChannel = item => {
        var channel = channels[item.row];
        var channel_id = channel.channel_id;
        setSelectedChannelName(channel.name);
        setSelectedChannelUrl(channel.url_high);
        setSeletectedChannel(channel);
        if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
            setInteractiveTV(true);
        } else {
            setInteractiveTV(false);
        }
        if (channel.childlock == 1) {
            setHasParentalControl(true);
        } else {
            setHasParentalControl(false);
        }
        var dateTodayIndex = dates.findIndex(d => d.today == true);
        var date = dates[dateTodayIndex];
        setDayOffset(date.days);
        setSelectedDateName(date.time);

        var data = allEpgData.find(c => c.id == channel_id);
        if (data != undefined) {
            data = data.epgdata;
            var start = moment()
                .add(0, 'days')
                .startOf('day')
                .unix()
                .toString();
            var end = moment().add(0, 'days').endOf('day').unix().toString();
            var dataToday = getDataTimeScale(start, end, data);
            setTvGuide(dataToday);
        }
        setChannelVisible(false);
    };
    const renderCategoryButon = () => (
        <Button onPress={() => setCategoryVisible(true)}>
            {selectedCategoryName}
        </Button>
    );
    const onItemSelectCategory = index => {
        var id = categories[index.row].id;
        var category = GLOBAL.Channels.find(x => x.id == id);
        var channels = [];
        if (category != undefined) {
            GLOBAL.Channels_Selected_Category_ID = id;
            if (category.channels.length > 0) {
                GLOBAL.Channels_Selected = category.channels;
                channels = GLOBAL.Channels_Selected;
            }
        }
        try {
            if (
                channels.length > 0 &&
                channels != undefined &&
                channels != null
            ) {
                GLOBAL.Channels_Selected_Category_Index = index.row;
                setSelectedCategoryName(
                    category.name + ' (' + category.channels.length + ')',
                );
                setSelectedCategoryIndex(index);
                setCategoryVisible(false);
                setChannels(channels);
                setData(channels);

                setSelectedChannelName(channels[0].name);
                setSelectedChannelUrl(channels[0].url_high);
                setSeletectedChannel(channels[0]);
                if (channels[0].is_flussonic == 1 || channels[0].is_dveo == 1) {
                    setInteractiveTV(true);
                }
                if (channels[0].childlock == 1) {
                    setHasParentalControl(true);
                }
                var data = allEpgData.find(
                    c => c.id == channels[0].channel_id,
                ).epgdata;
                setTvGuideAllTimes(data);
                var start = moment()
                    .add(dayOffset, 'days')
                    .startOf('day')
                    .unix()
                    .toString();
                var end = moment()
                    .add(dayOffset, 'days')
                    .endOf('day')
                    .unix()
                    .toString();
                var dataToday = getDataTimeScale(start, end, data);
                setTvGuide(dataToday);
            }
        } catch (e) { }
    };
    const renderCategoryItem = (category, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={category.name + ' (' + category.length + ')'}
        />
    );
    const _updateSections = activeSections => {
        setActiveSections(activeSections);
    };
    const closeRecordingModal = () => {
        if (error != '') {
            setShowRecordingModal(false);
        }
    };
    const onPressBack = () => {
        GLOBAL.EPG = GLOBAL.EPG_TODAY;
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Home' }],
            }),
        );
    };
    return (
        <View style={{ flex: 1 }}>
            <Modal
                style={{
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.8
                        : sizes.width * 0.3,
                }}
                visible={showRecordingModal}
                onBackdropPress={closeRecordingModal}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}
            >
                <Card disabled={true}>
                    <Text h5 bold>
                        {LANG.getTranslation('record_program')}
                    </Text>
                    <Text>{recordedProgram}</Text>
                    <Text color={'red'} style={{ color: 'red' }} status="basic">
                        {error}
                    </Text>
                    <View
                        style={{ flex: 1, justifyContent: 'center', margin: 20 }}
                    >
                        {error == '' && (
                            <ActivityIndicator
                                size={'large'}
                                color={'#fff'}
                            ></ActivityIndicator>
                        )}
                    </View>
                </Card>
            </Modal>
            <Modal
                style={{
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.8
                        : sizes.width * 0.3,
                }}
                visible={showRecordingSuccessModal}
                onBackdropPress={() => setShowRecordingSuccessModal(false)}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}
            >
                <Card disabled={true}>
                    <Text h5 bold>
                        {LANG.getTranslation('record_program')}
                    </Text>
                    <Text>{recordedProgram}</Text>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            margin: 20,
                            alignItems: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={{ fontSize: 50, color: 'green', padding: 10 }}
                            // icon={SolidIcons.check}
                            name="check"
                        />
                    </View>
                </Card>
            </Modal>

            <Block
                flex={1}
                width={sizes.width}
                align="center"
                justify="center"
                color={'transparent'}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        width: sizes.width,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                        paddingTop: 10,
                        paddingHorizontal: 2,
                        paddingBottom: 10,
                    }}
                >
                    <View
                        style={{
                            paddingLeft: 0,
                            marginRight: 0,
                            borderRadius: 100,
                            width: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: 10,
                        }}
                    >
                        <FocusButton
                            style={{ borderRadius: 100 }}
                            onPress={() => onPressBack()}
                        >
                            <FontAwesome5
                                style={{ fontSize: 18, color: '#fff' }}
                                // icon={SolidIcons.arrowLeft}
                                name="arrow-left"
                            />
                        </FocusButton>
                    </View>
                    <View style={{ flex: 1, margin: 3 }}>
                        <OverflowMenu
                            anchor={renderDateButton}
                            visible={dateVisible}
                            selectedIndex={selectedDateIndex}
                            fullWidth={true}
                            style={{
                                width: sizes.width * 0.8,
                                marginTop:
                                    GLOBAL.Device_Manufacturer == 'Apple' ||
                                        GLOBAL.Device_IsWebTV
                                        ? 0
                                        : 30,
                            }}
                            onBackdropPress={() => setDateVisible(false)}
                            onSelect={onItemSelectDate}
                        >
                            {dates.map(renderDateItem)}
                        </OverflowMenu>
                    </View>
                </View>
                <View
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                        width: sizes.width,
                    }}
                >
                    <View
                        style={{
                            marginHorizontal: 5,
                            width: sizes.width - 10,
                            height: 50,
                        }}
                    >
                        <OverflowMenu
                            anchor={renderCategoryButon}
                            visible={categoryVisible}
                            selectedIndex={selectedCategoryIndex}
                            fullWidth={true}
                            style={{
                                width: sizes.width - 10,
                                marginTop:
                                    GLOBAL.Device_Manufacturer == 'Apple' ||
                                        GLOBAL.Device_IsWebTV
                                        ? 0
                                        : 30,
                            }}
                            onBackdropPress={() => setCategoryVisible(false)}
                            onSelect={onItemSelectCategory}
                        >
                            {categories.map(renderCategoryItem)}
                        </OverflowMenu>
                    </View>
                </View>
                <View
                    style={{
                        width: sizes.width,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                    }}
                >
                    <View
                        style={{
                            marginHorizontal: 5,
                            width: sizes.width - 10,
                            height: 50,
                            marginBottom: 5,
                        }}
                    >
                        <OverflowMenu
                            removeClippedSubviews={true}
                            anchor={renderChannelButton}
                            visible={channelVisible}
                            selectedIndex={selectedChannelIndex}
                            style={{
                                width: sizes.width - 10,
                                marginTop:
                                    GLOBAL.Device_Manufacturer == 'Apple' ||
                                        GLOBAL.Device_IsWebTV
                                        ? 0
                                        : 30,
                            }}
                            onBackdropPress={() => setChannelVisible(false)}
                            onSelect={onItemSelectChannel}
                        >
                            {channels.map(renderChannelItem)}
                        </OverflowMenu>
                    </View>
                </View>

                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        width: sizes.width,
                        justifyContent: 'center',
                    }}
                >
                    <LinearGradient
                        colors={['rgba(0, 0, 0, 0.80)', 'rgba(0, 0, 0, 0.0)']}
                        style={{ flex: 1, width: sizes.width, height: '100%' }}
                        start={{ x: 0.5, y: 0 }}
                    >
                        {loading && (
                            <View
                                style={{
                                    flex: 1,
                                    width: sizes.width,
                                    height: sizes.height * 0.9,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                }}
                            >
                                <ActivityIndicator
                                    size={'large'}
                                    color={'white'}
                                ></ActivityIndicator>
                            </View>
                        )}
                        {!loading && (
                            <View
                                style={{
                                    flex: 1,
                                    paddingTop: 5,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                }}
                            >
                                <Accordion
                                    align={'top'}
                                    touchableComponent={
                                        TouchableWithoutFeedback
                                    }
                                    sections={tvGuide}
                                    activeSections={activeSections}
                                    renderHeader={_renderHeader}
                                    renderContent={_renderContent}
                                    onChange={_updateSections}
                                    renderAsFlatList={true}
                                    onScrollToIndexFailed={() => { }}
                                    initialScrollIndex={
                                        selectedChannelDataLiveIndex
                                    }
                                />
                            </View>
                        )}
                    </LinearGradient>
                </View>
            </Block>
        </View>
    );
};
