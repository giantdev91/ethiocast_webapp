import React, { ReactElement, useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    ImageBackground,
    Platform,
    UIManager,
    TouchableOpacity,
    ActivityIndicator,
    BackHandler,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Card,
    Modal,
} from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import { CommonActions } from '@react-navigation/native';
import moment from 'moment';
import { sendPageReport } from '../../../reporting/reporting';

export default ({ navigation }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [channels, setChannels] = useState([]);
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);
    const [selectedDateName, setSelectedDateName] = useState(null);
    const [allCatchupData, setAllCatchupData] = useState([]);
    const [dayOffset, setDayOffset] = useState(0);

    const [tvGuide, setTvGuide] = useState([]);
    const [tvGuideAllTimes, setTvGuideAllTimes] = useState([]);
    const [dates, setDates] = useState([]);
    const [dateVisible, setDateVisible] = useState(false);
    var sizes = SIZES.getSizing();

    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [showRecordingSuccessModal, setShowRecordingSuccessModal] =
        useState(false);
    const [error, setError] = useState('');
    const [recordedProgram, setRecordedProgram] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        return () =>
            sendPageReport('CatchupTV', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var dates = getDates();
        setDates(dates);
        var dateTodayIndex = dates.findIndex(d => d.today == true);
        setSelectedDateName(dates[dateTodayIndex].time);
        setSelectedDateIndex({ row: dateTodayIndex, section: 0 });

        (async () => {
            let res = await getCatchupData();
            if (res.success) {
                if (res.data != undefined) {
                    var channelsIn = UTILS.getCatchupChannels();

                    setAllCatchupData(res.data);
                    setChannels(channelsIn);
                    setLoading(false);
                }
            }
        })();
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
    const getDates = () => {
        var max = GLOBAL.UserInterface.general.catchup_days;
        var min = (GLOBAL.UserInterface.general.catchup_days - 1) * -1;
        var dates = [];
        for (var i = min; i < max; i++) {
            var time_ = moment().add(i, 'days').format('ddd ll');
            dates.push({ time: time_, days: i, today: i == 0 ? true : false });
        }
        return dates;
    };
    const onPlayCatchupTV = (item, channel, index, epg) => {
        navigation.navigate({
            name: 'Player_CatchupTV',
            params: {
                index: index,
                program: item,
                programs: epg,
                channel: channel,
                channels: channels,
            },
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
    const onItemSelectDate = item => {
        var date = dates[item.row];
        setDayOffset(date.days);
        setSelectedDateName(date.time);
        var start = moment()
            .add(date.days, 'days')
            .startOf('day')
            .unix()
            .toString();
        var end = moment()
            .add(date.days, 'days')
            .endOf('day')
            .unix()
            .toString();
        var dataToday = getDataTimeScale(start, end, tvGuideAllTimes);
        setDateVisible(false);
        setTvGuide(dataToday);
    };

    // const setRecordProgram = (item) => {
    //     DAL.setRecording(selectedChannel.channel_id, item.e, item.s, item.n).then(data => {
    //         if (data == "Not Approved") {
    //             setError(LANG.getTranslation("recording_set_for_not"));
    //         } else {
    //             setShowRecordingModal(false);
    //             setShowRecordingSuccessModal(true);
    //         }
    //     });
    // }
    const closeRecordingModal = () => {
        if (error != '') {
            setShowRecordingModal(false);
        }
    };
    const onPressBack = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Home' }],
            }),
        );
    };
    const renderProgram = (item, index, channel, epg) => {
        var currentTime = moment().unix();
        var startTime = item.s;
        var endTime = item.e;

        var parentalControl = false;
        if (channel.childlock == 1) {
            parentalControl = true;
        }
        //var image = '';
        //if (item.i == null) {
        var image = getCurrentImage(channel.url_high, startTime);
        //} else {
        //    image = item.i;
        //}
        if (currentTime >= endTime) {
            return (
                <FocusButton
                    style={{ margin: 5 }}
                    onPress={() => onPlayCatchupTV(item, channel, index, epg)}>
                    <View
                        style={{
                            backgroundColor: '#111',
                            borderRadius: 5,
                            borderWidth: 4,
                            borderColor: '#111',
                            width: sizes.width * 0.196,
                        }}>
                        <View
                            style={{
                                borderRadius: 2,
                                backgroundColor: '#000',
                                width: sizes.width * 0.19,
                                height: ((sizes.width * 0.19) / 16) * 9,
                            }}>
                            {!parentalControl && image != '' && image != null && (
                                <Image
                                    source={{ uri: image }}
                                    style={{
                                        borderRadius: 2,
                                        width: sizes.width * 0.19,
                                        height: ((sizes.width * 0.19) / 16) * 9,
                                    }}></Image>
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
                                    height: '100%',
                                    width: '100%',
                                }}>
                                <FontAwesome5
                                    style={{
                                        color: '#fff',
                                        fontSize: 35,
                                        opacity: 0.8,
                                        marginBottom: 0,
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
                        <View style={{ padding: 10 }}>
                            <Text h5 shadow numberOfLines={1}>
                                {item.n}
                            </Text>
                            <Text shadow numberOfLines={1} marginTop={-5}>
                                {moment
                                    .unix(item.s)
                                    .format(
                                        'ddd DD ' + GLOBAL.Clock_Setting,
                                    )}{' '}
                                -{' '}
                                {moment
                                    .unix(item.e)
                                    .format(GLOBAL.Clock_Setting)}
                            </Text>
                        </View>
                    </View>
                </FocusButton>
            );
        } else {
            return null;
        }
    };
    const renderChannel = ({ item, index }) => {
        if (allCatchupData == undefined) {
            return null;
        }
        var channel = item;
        var epg = allCatchupData.channels.find(
            c => c.channel_id == channel.channel_id,
        );
        if (epg != undefined) {
            var epgdata = epg.epgdata;
            return (
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        marginVertical: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.40)',
                        borderRadius: 5,
                    }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            width: 270,
                            backgroundColor: '#111',
                            borderRadius: 5,
                            margin: 5,
                        }}>
                        <View
                            style={{
                                width: 70,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Image
                                style={{
                                    width: 50,
                                    height: 50,
                                    justifyContent: 'space-around',
                                }}
                                source={{
                                    uri: GLOBAL.ImageUrlCMS + channel.icon,
                                }}
                            />
                        </View>
                        <View
                            style={{
                                width: 180,
                                paddingLeft: 10,
                                justifyContent: 'center',
                            }}>
                            <Text bold numberOfLines={1}>
                                {channel.channel_number}. {channel.name}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            width: sizes.width,
                            marginLeft: 5,
                            marginRight: 5,
                        }}>
                        <FlatList
                            //extraData={epgdata}
                            data={epgdata}
                            horizontal={true}
                            initialNumToRender={5}
                            removeClippedSubviews={true}
                            keyExtractor={(item, index) =>
                                item.id + '' + index.toString()
                            }
                            onScrollToIndexFailed={() => { }}
                            renderItem={({ item, index }) =>
                                renderProgram(item, index, channel, epgdata)
                            }
                        />
                    </View>
                </View>
            );
        } else {
            return null;
        }
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
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}>
                <Card disabled={true}>
                    <Text h5 bold>
                        {LANG.getTranslation('record_program')}
                    </Text>
                    <Text>{recordedProgram}</Text>
                    <Text color={'red'} style={{ color: 'red' }} status="basic">
                        {error}
                    </Text>
                    <View
                        style={{ flex: 1, justifyContent: 'center', margin: 20 }}>
                        {error == '' && (
                            <ActivityIndicator
                                size={'large'}
                                color={'#fff'}></ActivityIndicator>
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
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}>
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
                        }}>
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
                color={'transparent'}>
                <View
                    style={{
                        flexDirection: 'row',
                        width: sizes.width,
                        backgroundColor: '#111',
                    }}>
                    <View
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            alignSelf: 'center',
                            paddingVertical: 5,
                        }}>
                        <View
                            style={{
                                paddingLeft: 20,
                                marginRight: 20,
                                borderRadius: 100,
                                width: 40,
                                height: 40,
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
                                paddingHorizontal: 5,
                                paddingVertical: 10,
                            }}>
                            {/* <OverflowMenu
                                    anchor={renderDateButton}
                                    visible={dateVisible}
                                    selectedIndex={selectedDateIndex}
                                    fullWidth={true}
                                    style={{ width: sizes.width * 0.9, marginTop: 30 }}
                                    onBackdropPress={() => setDateVisible(false)}
                                    onSelect={onItemSelectDate}>
                                    {dates.map(renderDateItem)}
                                </OverflowMenu> */}
                        </View>
                    </View>
                </View>
                <View
                    style={{ flex: 1, flexDirection: 'row', width: sizes.width }}>
                    <LinearGradient
                        colors={['#111', 'rgba(0, 0, 0, 0.0)']}
                        style={{ flex: 1, width: sizes.width, height: '100%' }}
                        start={{ x: 0.5, y: 0 }}>
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
                                }}>
                                <ActivityIndicator
                                    size={'large'}
                                    color={'white'}></ActivityIndicator>
                            </View>
                        )}
                        {!loading && (
                            <View
                                style={{
                                    flex: 1,
                                    marginLeft: 5,
                                    marginVertical: 5,
                                }}>
                                <FlatList
                                    data={channels}
                                    numColumns={1}
                                    horizontal={false}
                                    initialNumToRender={5}
                                    removeClippedSubviews={true}
                                    keyExtractor={(item, index) =>
                                        item.channel_id + '-' + index.toString()
                                    }
                                    onScrollToIndexFailed={() => { }}
                                    renderItem={renderChannel}
                                />
                            </View>
                        )}
                    </LinearGradient>
                </View>
            </Block>
        </View>
    );
};
