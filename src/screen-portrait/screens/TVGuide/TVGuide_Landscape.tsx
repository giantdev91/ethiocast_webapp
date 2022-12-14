import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    BackHandler,
    TVMenuControl,
    TouchableOpacity,
    ImageBackground,
    ActivityIndicator,
} from 'react-native';
import TimerMixin from 'react-timer-mixin';
// import GLOBALModule from './../../../datalayer/global';
var GLOBALModule = require('./../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import SIZES from '../../constants/sizes';
import { Text } from '../../components';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Modal,
    Card,
} from '@ui-kitten/components';
import { CommonActions } from '@react-navigation/native';
import { sendPageReport } from '../../../reporting/reporting';

export default ({ navigation }): React.ReactElement => {
    var timeline_timer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    var sizes = SIZES.getSizing();

    var height = GLOBAL.Device_IsWebTV ? 57.5 : 50;
    var extrarows = GLOBAL.Device_IsWebTV ? 4 : 5;
    var rows = Math.floor(sizes.height / height) - extrarows;
    var extra = 22;

    const [programs, setPrograms] = useState([]);
    const [channels, setChannels] = useState([]);
    //const [channelIndex, setChannelIndex] = useState(0);
    const [all_channels, setAllChannels] = useState([]);
    const [today_date, setTodayDate] = useState();
    const [red_line_position, setRedLinePosition] = useState(0);
    //const [red_line_minutes, setRedLineMinutes] = useState(0);
    const [red_line_minutes_time, setRedLineMinutesTime] = useState(0);
    const [paging, setPaging] = useState(rows);
    const [page, setPage] = useState(0);
    const [time, setTime] = useState(moment().format('HH:MM'));
    const [time_offset, setTimeOffset] = useState(0);
    const [times_width, setTimeWidth] = useState(0);
    const [days, setDays] = useState(0);
    const [dates, setDates] = useState([]);
    const [dateVisible, setDateVisible] = useState(false);
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);
    const [selectedDateName, setSelectedDateName] = useState(null);
    const [categoryVisible, setCategoryVisible] = useState(false);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [showRecordingSuccessModal, setShowRecordingSuccessModal] =
        useState(false);
    const [recordedProgram, setRecordedProgram] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        return () =>
            sendPageReport('TV Guide', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var width = sizes.width - 340;
        setTimeWidth(width / 4);

        var dates_ = getDates();
        setDates(dates_);
        var dateTodayIndex = dates_.findIndex(d => d.today == true);
        if (dateTodayIndex != undefined) {
            setSelectedDateName(dates_[dateTodayIndex].time);
            setSelectedDateIndex({ row: dateTodayIndex, section: 0 });
        }

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
            TimerMixin.clearTimeout(timeline_timer);
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

    const stopTimer = () => {
        TimerMixin.clearTimeout(timeline_timer);
    };
    const startTimer = () => {
        TimerMixin.clearTimeout(timeline_timer);
        timeline_timer = TimerMixin.setTimeout(() => {
            var line = getCellWidth();
            var timeNow = moment().format(GLOBAL.Clock_Setting);
            setTime(timeNow);
            setRedLineMinutesTime(timeNow);
            setRedLinePosition(line);

            // if ((times_width * 4) <= line && time_offset == 0) {
            //     onLoadMore('Horizontal', 'right');
            // }
            startTimer();
        }, 60000);
    };

    const checkIfWithin24Hours = time => {
        var prevTime = moment()
            .add(-2 + time, 'hour')
            .startOf('hour')
            .unix();
        var nextTime = moment()
            .add(-1 + time, 'hour')
            .startOf('hour')
            .unix();
        var midnightEnd = moment().endOf('day').unix();
        var midNightStart = moment().subtract(1, 'days').endOf('day').unix();
        if (prevTime > midNightStart && nextTime < midnightEnd) {
            return true;
        } else {
            return false;
        }
    };
    const getCellWidth = () => {
        var width = (sizes.width - 340) / 4;
        var currentTime = moment().format('mm');
        var extra = 0;
        if (currentTime > 30) {
            extra = width + (width / 30) * (currentTime - 30);
        } else {
            extra = (width / 30) * currentTime;
        }
        return width * 2 + extra;
    };

    const addPrograms = (page, channels) => {
        if (time_offset == 0) {
            startTimer();
        } else {
            stopTimer();
        }
        var channelsIn = [];
        if (channels != null) {
            channelsIn = channels;
        } else {
            channelsIn = all_channels;
        }
        var line = getCellWidth();
        var timeNow = moment().format(GLOBAL.Clock_Setting);
        var newRecords = [];
        for (
            var i = page * paging, il = i + paging;
            i < il && i < channelsIn.length;
            i++
        ) {
            newRecords.push(channelsIn[i]);
        }
        setPage(page);
        setChannels(newRecords);
        setPrograms(newRecords);
        setTodayDate(moment().add(GLOBAL.EPG_Days, 'days').format('dddd ll'));
        setTime(timeNow);
        setRedLineMinutesTime(timeNow);
        setRedLinePosition(line);
        setLoading(false);
    };
    const _renderHeader = () => {
        //if (props.error == true) { return null }
        var hours_ = [];
        var prevTime = moment()
            .add(-1 + time_offset, 'hour')
            .startOf('hour')
            .format(GLOBAL.Clock_Setting);
        var prevTimeMid = moment()
            .add(-1 + time_offset, 'hour')
            .startOf('hour')
            .add(30, 'minutes')
            .format(GLOBAL.Clock_Setting);
        var nowTime = moment()
            .add(0 + +time_offset, 'hour')
            .startOf('hour')
            .format(GLOBAL.Clock_Setting);
        var nowTimeMid = moment()
            .add(0 + +time_offset, 'hour')
            .startOf('hour')
            .add(30, 'minutes')
            .format(GLOBAL.Clock_Setting);
        hours_.push({ time: prevTime });
        hours_.push({ time: prevTimeMid });
        hours_.push({ time: nowTime });
        hours_.push({ time: nowTimeMid });
        return (
            <View style={{ flexDirection: 'row' }}>
                {hours_.map((item, index) => (
                    <View
                        key={index}
                        style={{
                            flex: 1,
                            height: sizes.height * 0.07,
                            backgroundColor: 'transparent',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            borderLeftWidth: 2,
                            borderLeftColor: '#fff',
                            paddingHorizontal: 10,
                        }}
                    >
                        <Text shadow bold>
                            {item.time}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };
    const getIcons = (channel, program, width) => {
        var timestampNow = moment().unix();
        if (channel == undefined) {
            return;
        }
        if (channel.is_dveo == 1 || channel.is_flussonic == 1) {
            if (program.e > timestampNow && program.s > timestampNow) {
                if (
                    GLOBAL.EPG_Days > GLOBAL.UserInterface.general.catchup_days
                ) {
                    return;
                }
                if (GLOBAL.UserInterface.general.enable_recordings == false) {
                    return;
                }
                return (
                    <View
                        style={{
                            backgroundColor: 'crimson',
                            width: 20,
                            height: 20,
                            margin: 5,
                            marginLeft: 5,
                            borderRadius: 100,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[{ fontSize: 9, color: '#fff' }]}
                            // icon={SolidIcons.dotCircle}
                            name="dot-circle"
                        />
                    </View>
                );
            } else if (program.e < timestampNow) {
                if (
                    GLOBAL.EPG_Days * -1 >
                    GLOBAL.UserInterface.general.catchup_days
                ) {
                    return;
                }
                if (GLOBAL.UserInterface.general.enable_catchuptv == false) {
                    return;
                }
                return (
                    <View
                        style={{
                            backgroundColor: 'royalblue',
                            width: 20,
                            height: 20,
                            margin: 5,
                            borderRadius: 100,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[{ fontSize: 9, color: '#fff' }]}
                            // icon={SolidIcons.history}
                            name="history"
                        />
                    </View>
                );
            } else if (program.e > timestampNow && program.s < timestampNow) {
                return (
                    <View
                        style={{
                            backgroundColor: 'forestgreen',
                            borderRadius: 100,
                            width: 20,
                            height: 20,
                            margin: 5,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[{ fontSize: 9, color: '#fff' }]}
                            // icon={SolidIcons.playCircle}
                            name="play-circle"
                        />
                    </View>
                );
            }
        } else {
            if (program.e > timestampNow && program.s < timestampNow) {
                return (
                    <View
                        style={{
                            backgroundColor: 'forestgreen',
                            width: 20,
                            height: 20,
                            margin: 5,
                            borderRadius: 100,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <FontAwesome5
                            style={[{ fontSize: 9, color: '#fff' }]}
                            // icon={SolidIcons.playCircle}
                            name="play-circle"
                        />
                    </View>
                );
            }
        }
    };
    const _renderRow = ({ item, index }) => {
        var nextTimeUnix = moment()
            .add(1 + time_offset, 'hour')
            .add(GLOBAL.EPG_Days, 'day')
            .startOf('hour')
            .unix();
        var prevTimeUnix = moment()
            .add(-1 + time_offset, 'hour')
            .add(GLOBAL.EPG_Days, 'day')
            .startOf('hour')
            .unix();
        var currentTimeUnix = moment().unix();
        var indexProgram = 0;
        var channel = all_channels[index + page * paging];
        const listItems = item.epgdata.map((program, index_) => {
            var validProgram = false;
            var liveProgram = false;
            var interactiveTV = false;
            var start = 0;
            var end = 0;
            var width = 0;
            if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
                interactiveTV = true;
            }
            if (program.e > currentTimeUnix && program.s < currentTimeUnix) {
                liveProgram = true;
            }
            if (program.s >= prevTimeUnix && program.e <= nextTimeUnix) {
                start = program.s;
                end = program.e;
                validProgram = true;
            } else if (program.s > prevTimeUnix && program.s < nextTimeUnix) {
                start = program.s;
                end = nextTimeUnix;
                validProgram = true;
            } else if (
                program.s < prevTimeUnix &&
                program.e > prevTimeUnix &&
                program.e <= nextTimeUnix
            ) {
                start = prevTimeUnix;
                end = program.e;
                validProgram = true;
            } else if (program.s <= prevTimeUnix && program.e > nextTimeUnix) {
                start = prevTimeUnix;
                end = nextTimeUnix;
                validProgram = true;
            }

            if (validProgram == true) {
                var lastProgram = false;
                var firstProgram = false;
                if (program.e >= nextTimeUnix) {
                    lastProgram = true;
                }
                if (indexProgram == 0) {
                    firstProgram = true;
                }
                indexProgram++;
                let seconds = end - start;
                let hour = seconds / 60 / 60;
                var width = hour * 2 * times_width;

                return (
                    <View
                        style={{ width: width }}
                        key={indexProgram + '-' + index}
                    >
                        <View
                            style={{
                                backgroundColor:
                                    liveProgram == true ? '#111' : '#222',
                                margin: 1,
                            }}
                        >
                            <FocusButton
                                style={{ height: height }}
                                onPress={() =>
                                    selectProgram(
                                        index_,
                                        program,
                                        channel,
                                        page,
                                    )
                                }
                            //onFocus={() => focusProgramInternal(program, index, lastProgram, firstProgram)}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        paddingLeft: 10,
                                        paddingRight: interactiveTV ? 45 : 15,
                                        alignItems: 'center',
                                    }}
                                >
                                    {getIcons(channel, program, width)}
                                    <Text
                                        numberOfLines={1}
                                        bold
                                        paddingLeft={5}
                                    >
                                        {program.n}{' '}
                                        {moment
                                            .unix(program.s)
                                            .format(GLOBAL.Clock_Setting)}{' '}
                                        -{' '}
                                        {moment
                                            .unix(program.e)
                                            .format(GLOBAL.Clock_Setting)}
                                    </Text>
                                </View>
                            </FocusButton>
                        </View>
                    </View>
                );
            }
        });
        return <View style={{ flex: 1, flexDirection: 'row' }}>{listItems}</View>;
    };

    const renderChannel = ({ item, index }) => {
        return (
            <View
                style={{
                    borderRightWidth: 6,
                    borderRightColor: '#000',
                    width: 240,
                    height: height,
                    backgroundColor: '#111',

                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 1,
                }}
            >
                <View
                    style={{
                        width: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Image
                        style={{ width: 30, height: 30 }}
                        source={{ uri: GLOBAL.ImageUrlCMS + item.icon }}
                    />
                </View>
                <View
                    style={{
                        width: 170,
                        paddingLeft: 10,
                        justifyContent: 'center',
                    }}
                >
                    <Text bold numberOfLines={1}>
                        {item.number}. {item.name}
                    </Text>
                </View>
            </View>
        );
    };

    const _renderChannelHeader = () => {
        return (
            <View style={{ flexDirection: 'row' }}>
                <View
                    style={{
                        flex: 1,
                        height: sizes.height * 0.07,
                        backgroundColor: '#',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        borderLeftWidth: 2,
                        borderLeftColor: 'transparent',
                        paddingHorizontal: 10,
                    }}
                ></View>
            </View>
        );
    };

    const getEpgData = days => {
        const date = moment().add(days, 'days').format('DD_MM_YYYY');
        if (days == 0) {
            GLOBAL.EPG = GLOBAL.EPG_TODAY;
            var channels = filterEpgByChannelsGroups();
            setAllChannels(channels);
            setDays(days);
            addPrograms(0, channels);
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
                        var channelsNew = filterEpgByChannelsGroups();
                        //setChannels(channelsNew);
                        setAllChannels(channelsNew);
                        setDays(days);
                        addPrograms(0, channelsNew);
                    }
                })
                .catch(error => { });
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
                    });
                    GLOBAL.EPG_DATE_LOADED = date;
                    if (GLOBAL.User.products.ChannelPackages.length > 0) {
                        getExtraEpg(days, id + 1);
                    } else {
                        var channelsNew = filterEpgByChannelsGroups();
                        setAllChannels(channelsNew);
                        addPrograms(0, channelsNew);
                    }
                })
                .catch(error => {
                    var channelsNew = filterEpgByChannelsGroups();
                    setAllChannels(channelsNew);
                    addPrograms(0, channelsNew);
                });
        } else {
            var channelsNew = filterEpgByChannelsGroups();
            setAllChannels(channelsNew);
            addPrograms(0, channelsNew);
        }
    };
    const filterEpgByChannelsGroups = () => {
        var newEPG = [];
        if (GLOBAL.Channels_Selected == null) {
            GLOBAL.Channels_Selected = GLOBAL.Channels;
        }
        if (
            GLOBAL.Channels_Selected == undefined ||
            GLOBAL.Channels_Selected.length == 0
        ) {
            GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
            GLOBAL.Channels_Selected_Category_ID = GLOBAL.Channels[0].id;
            GLOBAL.Channels_Selected_Index = 0;
            GLOBAL.Channels_Selected_Category_Index = UTILS.getCategoryIndex(
                GLOBAL.Channels_Selected_Category_ID,
            );
        }
        GLOBAL.Channels_Selected.forEach((channel, index) => {
            var EPG = GLOBAL.EPG.find(e => e.id == channel.channel_id);
            if (EPG != null) {
                newEPG.push(EPG);
            }
        });
        return newEPG;
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
    const renderDateButton = () => (
        <Button onPress={() => setDateVisible(true)}>
            <Text bold numberOfLines={1}>
                {selectedDateName}
            </Text>
        </Button>
    );

    const renderDateItem = (date, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={date.time}
        />
    );
    const renderCategoryButton = () => (
        <Button onPress={() => setCategoryVisible(true)}>
            <Text bold numberOfLines={1}>
                {selectedCategoryName}
            </Text>
        </Button>
    );
    const renderCategoryItem = (category, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={category.name + ' (' + category.length + ')'}
        />
    );
    const onPressBack = () => {
        GLOBAL.EPG = GLOBAL.EPG_TODAY;
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Home' }],
            }),
        );
    };
    const onItemSelectDate = index => {
        var day = dates[index.row].days;
        GLOBAL.EPG_Days = day;
        setSelectedDateName(dates[index.row].time);
        setLoading(true);
        setDateVisible(false);
        setTimeOffset(0);
        setPage(0);
        getEpgData(day);
    };
    const onItemSelectCategory = index => {
        var id = categories[index.row].id;
        var category = GLOBAL.Channels.find(x => x.id == id);
        if (category == undefined) {
            return;
        }
        if (category.channels == undefined) {
            return;
        }
        if (category.channels.length > 0) {
            GLOBAL.Channels_Selected = category.channels;
            GLOBAL.Channels_Selected_Category_ID = category.id;
            GLOBAL.Channels_Selected_Category_Index = index.row;
            setSelectedCategoryName(
                category.name + ' (' + category.channels.length + ')',
            );
            setChannels(GLOBAL.Channels_Selected);
            setCategoryVisible(false);
            setTimeOffset(0);
            setPage(0);
            getEpgData(days);
        }
    };
    const selectProgram = (index, program, channel, page) => {
        if (program != null) {
            GLOBAL.EPG_Catchup_Channel = GLOBAL.EPG_Catchup.find(
                e => e.id == channel.id,
            );
            var timestampNow = moment().unix();
            var hasInteractiveTV = false;
            if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
                hasInteractiveTV = true;
            }
            if (
                program.e < timestampNow &&
                hasInteractiveTV == true &&
                GLOBAL.UserInterface.general.enable_catchuptv == true
            ) {
                onPlayCatchupTV(program, channel, index);
            } else if (
                program.s > timestampNow &&
                hasInteractiveTV == true &&
                GLOBAL.UserInterface.general.enable_recordings == true
            ) {
                if (days >= GLOBAL.UserInterface.general.catchup_days) {
                    return;
                }
                if (program.e == program.s) {
                    return;
                }
                if (GLOBAL.Storage_Used / GLOBAL.Storage_Total < 0.95) {
                    onRecordProgram(program, channel);
                }
            } else if (program.s < timestampNow && program.e > timestampNow) {
                onPlayChannel(channel);
            } else {
                onPlayChannel(channel);
            }
        }
    };
    const onLoadMore = (Direction, Value) => {
        if (Direction == 'Vertical' && Value == 'up') {
            if (page > 0) {
                var newPage = page - 1;
                setPage(newPage);
                addPrograms(newPage, null);
            }
        }
        if (Direction == 'Vertical' && Value == 'down') {
            var pages = Math.ceil(all_channels.length / paging) - 1;
            if (page < pages) {
                var newPage = page + 1;
                setPage(newPage);
                addPrograms(newPage, null);
            }
        }
        if (Direction == 'Horizontal' && Value == 'right') {
            var check = checkIfWithin24Hours(time_offset + 2);
            if (check == true) {
                var offset = time_offset + 2;
                setTimeOffset(offset);
                //addPrograms(page, null);
            }
        }
        if (Direction == 'Horizontal' && Value == 'left') {
            //todo future when start from uneven hour the end and start time wont get reached
            var check = checkIfWithin24Hours(time_offset - 2);
            if (check == true) {
                var offset = time_offset - 2;
                setTimeOffset(offset);
                //addPrograms(page, null);
            }
        }
    };
    const closeRecordingModal = () => {
        if (error != '') {
            setShowRecordingModal(false);
        }
    };
    const onRecordProgram = (program, channel) => {
        setShowRecordingModal(true);
        setRecordProgram(program, channel);
        setRecordedProgram(
            program.n +
            ' ' +
            moment.unix(program.s).format(GLOBAL.Clock_Setting) +
            ' - ' +
            moment.unix(program.e).format(GLOBAL.Clock_Setting),
        );
    };
    const setRecordProgram = (program, channel) => {
        DAL.setRecording(channel.id, program.e, program.s, program.n).then(
            data => {
                if (data == 'Not Approved') {
                    setError(LANG.getTranslation('recording_set_for_not'));
                } else {
                    setShowRecordingModal(false);
                    setShowRecordingSuccessModal(true);
                }
            },
        );
    };
    const onPlayCatchupTV = (program, channel, index) => {
        var category_ =
            GLOBAL.Channels[GLOBAL.Channels_Selected_Category_Index];
        if (category_ != undefined) {
            var channel_ = category_.channels.find(
                c => c.channel_id == channel.id,
            );
            var programs_ = GLOBAL.EPG.find(e => e.id == channel.id);
            if (programs_ != undefined) {
                navigation.navigate({
                    name: 'Player_CatchupTV',
                    params: {
                        index: index,
                        program: program,
                        programs: programs_.epgdata,
                        channel: channel_,
                        channels: category_.channels,
                    },
                });
            }
        }
    };
    const onPlayChannel = channel => {
        var categories_ =
            GLOBAL.Channels[GLOBAL.Channels_Selected_Category_Index];
        if (categories_ != undefined) {
            var channel_ = categories_.channels.find(
                c => c.channel_id == channel.id,
            );
            var index_ = categories_.channels.findIndex(
                c => c.channel_id == channel.id,
            );
            navigation.navigate({
                name: 'Player_Channels',
                params: {
                    index: index_,
                    channels: GLOBAL.Channels_Selected,
                    channel: channel_,
                    categories: categories,
                    category_index: GLOBAL.Channels_Selected_Category_Index,
                },
                merge: true,
            });
        }
    };
    return (
        <View
            style={{
                flex: 1,
                marginHorizontal: 10,
                marginTop: GLOBAL.App_Theme == 'Honua' ? 10 : 0,
            }}
        >
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
            <View style={{ flex: 1 }}>
                <View style={{ height: height + extra, flexDirection: 'row' }}>
                    <View style={{ flex: 9 }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View
                                style={{
                                    backgroundColor: '#000',
                                    borderRadius: 100,
                                    width: 45,
                                    height: 45,
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
                            <View>
                                <View
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        width: sizes.width * 0.3,
                                    }}
                                >
                                    <OverflowMenu
                                        anchor={renderDateButton}
                                        visible={dateVisible}
                                        selectedIndex={selectedDateIndex}
                                        fullWidth={true}
                                        style={{
                                            marginTop:
                                                GLOBAL.Device_Manufacturer ==
                                                    'Apple' ||
                                                    GLOBAL.Device_IsWebTV
                                                    ? 0
                                                    : 26,
                                            width: sizes.width * 0.3,
                                        }}
                                        onBackdropPress={() =>
                                            setDateVisible(false)
                                        }
                                        onSelect={onItemSelectDate}
                                    >
                                        {dates.map(renderDateItem)}
                                    </OverflowMenu>
                                </View>
                            </View>
                            <View>
                                <View
                                    style={{
                                        flex: 1,
                                        paddingVertical: 10,
                                        width: sizes.width * 0.3,
                                        marginLeft: 10,
                                    }}
                                >
                                    <OverflowMenu
                                        anchor={renderCategoryButton}
                                        visible={categoryVisible}
                                        selectedIndex={selectedCategoryIndex}
                                        fullWidth={true}
                                        style={{
                                            width: sizes.width * 0.3,
                                            marginTop:
                                                GLOBAL.Device_Manufacturer ==
                                                    'Apple' ||
                                                    GLOBAL.Device_IsWebTV
                                                    ? 0
                                                    : 26,
                                        }}
                                        onBackdropPress={() =>
                                            setCategoryVisible(false)
                                        }
                                        onSelect={onItemSelectCategory}
                                    >
                                        {categories.map(renderCategoryItem)}
                                    </OverflowMenu>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{ flex: 2, alignItems: 'flex-end', margin: 10 }}>
                        {/* <Text h3 shadow>{time}</Text> */}
                    </View>
                </View>
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
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 1, width: 240 }}>
                            <FlatList
                                data={channels}
                                horizontal={false}
                                numColumns={1}
                                extraData={channels}
                                renderItem={renderChannel}
                                keyExtractor={(item, index) => index.toString()}
                                ListHeaderComponent={_renderChannelHeader}
                            />
                        </View>
                        <View>
                            <View
                                style={{ flexDirection: 'row', height: '100%' }}
                            >
                                {RenderIf(
                                    (GLOBAL.Device_IsWebTV == true &&
                                        GLOBAL.Device_IsSmartTV == false) ||
                                    GLOBAL.Device_IsTablet == true,
                                )(
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            height: height * paging + extra,
                                            flexDirection: 'column',
                                            marginTop: sizes.height * 0.07,
                                        }}
                                    >
                                        <FocusButton
                                            pointerEvents={'box-none'}
                                            onPress={() =>
                                                onLoadMore('Vertical', 'up')
                                            }
                                            style={{
                                                flex: 1,
                                                marginLeft: 2,
                                                backgroundColor: '#111',
                                                width: 40,
                                                alignSelf: 'flex-end',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#fff',
                                                    }}
                                                    // icon={SolidIcons.arrowUp}
                                                    name="arrow-up"
                                                />
                                            </View>
                                        </FocusButton>
                                        <FocusButton
                                            pointerEvents={'box-none'}
                                            onPress={() =>
                                                onLoadMore('Horizontal', 'left')
                                            }
                                            style={{
                                                flex: 1,
                                                marginVertical: 4,
                                                marginLeft: 2,
                                                backgroundColor: '#111',
                                                width: 40,
                                                alignSelf: 'flex-end',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#fff',
                                                    }}
                                                    // icon={SolidIcons.arrowLeft}
                                                    name="arrow-left"
                                                />
                                            </View>
                                        </FocusButton>
                                        <FocusButton
                                            pointerEvents={'box-none'}
                                            onPress={() =>
                                                onLoadMore('Vertical', 'down')
                                            }
                                            style={{
                                                flex: 1,
                                                marginLeft: 2,
                                                backgroundColor: '#111',
                                                width: 40,
                                                alignSelf: 'flex-end',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#fff',
                                                    }}
                                                    // icon={SolidIcons.arrowDown}
                                                    name="arrow-down"
                                                />
                                            </View>
                                        </FocusButton>
                                    </View>,
                                )}

                                <FlatList
                                    data={programs}
                                    horizontal={false}
                                    numColumns={1}
                                    extraData={programs}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={_renderRow}
                                    ListHeaderComponent={_renderHeader}
                                />

                                {RenderIf(
                                    (GLOBAL.Device_IsWebTV == true &&
                                        GLOBAL.Device_IsSmartTV == false) ||
                                    GLOBAL.Device_IsTablet == true,
                                )(
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            height: height * paging + extra,
                                            flexDirection: 'column',
                                            marginTop: sizes.height * 0.07,
                                        }}
                                    >
                                        <FocusButton
                                            pointerEvents={'box-none'}
                                            onPress={() =>
                                                onLoadMore('Vertical', 'up')
                                            }
                                            style={{
                                                marginLeft: 2,
                                                flex: 1,
                                                backgroundColor: '#111',
                                                width: 40,
                                                alignSelf: 'flex-end',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#fff',
                                                    }}
                                                    // icon={SolidIcons.arrowUp}
                                                    name="arrow-up"
                                                />
                                            </View>
                                        </FocusButton>
                                        <FocusButton
                                            pointerEvents={'box-none'}
                                            onPress={() =>
                                                onLoadMore(
                                                    'Horizontal',
                                                    'right',
                                                )
                                            }
                                            style={{
                                                marginVertical: 4,
                                                marginLeft: 2,
                                                flex: 1,
                                                backgroundColor: '#111',
                                                width: 40,
                                                alignSelf: 'flex-end',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#fff',
                                                    }}
                                                    // icon={SolidIcons.arrowRight}
                                                    name="arrow-right"
                                                />
                                            </View>
                                        </FocusButton>
                                        <FocusButton
                                            pointerEvents={'box-none'}
                                            onPress={() =>
                                                onLoadMore('Vertical', 'down')
                                            }
                                            style={{
                                                marginLeft: 2,
                                                flex: 1,
                                                backgroundColor: '#111',
                                                width: 40,
                                                alignSelf: 'flex-end',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#fff',
                                                    }}
                                                    // icon={SolidIcons.arrowDown}
                                                    name="arrow-down"
                                                />
                                            </View>
                                        </FocusButton>
                                    </View>,
                                )}
                                {RenderIf(
                                    channels.length > 0 &&
                                    time_offset == 0 &&
                                    GLOBAL.Device_IsAppleTV == false &&
                                    GLOBAL.EPG_Days == 0,
                                )(
                                    <View
                                        pointerEvents="none"
                                        style={[
                                            {
                                                position: 'absolute',
                                                width: red_line_position,
                                                height: height * paging + extra,
                                                backgroundColor:
                                                    'rgba(0, 0, 0, 0.40)',
                                                borderRightColor: 'red',
                                                borderRightWidth: 2,
                                                top: sizes.height * 0.07,
                                                left: 44,
                                                zIndex: 9999,
                                            },
                                        ]}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            bold
                                            style={{ alignSelf: 'flex-end' }}
                                            paddingRight={10}
                                        >
                                            {' '}
                                            {red_line_minutes_time}
                                        </Text>
                                    </View>,
                                )}
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};
