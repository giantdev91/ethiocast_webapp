import React, { ReactElement, useState, useEffect, useRef } from 'react';
import {
    View,
    Image,
    ImageBackground,
    Platform,
    UIManager,
    TouchableWithoutFeedback,
    TouchableOpacity,
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
    Card,
    Modal,
} from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import Accordion from 'react-native-collapsible/Accordion';
import { CommonActions } from '@react-navigation/native';
import { sendPageReport } from '../../../reporting/reporting';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default ({ navigation }): React.ReactElement => {
    // const refContainer = useRef(null);
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [activeSections, setActiveSections] = useState([]);
    const [hasParentalControl, setHasParentalControl] = useState(false);
    //const [expanded, setExpanded] = useState(false);
    const [channels, setChannels] = useState([]);
    //const [channelsSearch, setChannelsSearch] = useState([]);
    const [selectedChannelIndex, setSelectedChannelIndex] = useState(null);
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);
    const [selectedChannelName, setSelectedChannelName] = useState('');
    const [selectedChannelUrl, setSelectedChannelUrl] = useState('');
    const [selectedDateName, setSelectedDateName] = useState(null);
    const [selectedChannel, setSeletectedChannel] = useState([]);
    const [selectedChannelDataLiveIndex, setSelectedChannelDataLiveIndex] =
        useState(0);
    const [allCatchupData, setAllCatchupData] = useState([]);
    const [dayOffset, setDayOffset] = useState(0);

    const [tvGuide, setTvGuide] = useState([]);
    const [tvGuideAllTimes, setTvGuideAllTimes] = useState([]);
    const [dates, setDates] = useState([]);
    const [dateVisible, setDateVisible] = useState(false);
    const [channelVisible, setChannelVisible] = useState(false);
    var sizes = SIZES.getSizing();

    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [showRecordingSuccessModal, setShowRecordingSuccessModal] =
        useState(false);
    const [error, setError] = useState('');
    const [recordedProgram, setRecordedProgram] = useState('');
    const [offset, setOffset] = useState(0);

    const [loading, setLoading] = useState(true);

    //const [value, setValue] = React.useState(null);
    const [data, setData] = React.useState([]);
    useEffect(() => {
        return () =>
            sendPageReport('CatchupTV', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var channelsIn = UTILS.getCatchupChannels();
        if (channelsIn != undefined && channelsIn.length > 0) {
            setChannels(channelsIn);
            setData(channelsIn);
            setSelectedChannelName(channelsIn[0].name);
            setSelectedChannelUrl(channelsIn[0].url_high);
            setSeletectedChannel(channelsIn[0]);
            setSelectedChannelIndex({ row: 0, section: 0 });
            if (channelsIn[0].childlock == 1) {
                setHasParentalControl(true);
            }
        }
        var dates = getDates();
        setDates(dates);
        var dateTodayIndex = dates.findIndex(d => d.today == true);
        setSelectedDateName(dates[dateTodayIndex].time);
        setSelectedDateIndex({ row: dateTodayIndex, section: 0 });

        (async () => {
            let res = await getCatchupData(offset);
            if (res.success) {
                setAllCatchupData(res.data);
                var tvGuide_ = res.data;
                if (tvGuide_ != undefined) {
                    var data = tvGuide_.channels[0].epgdata;
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
                    setLoading(false);
                }
            } else {
                //show error
                //catchuptv is not available at the moment
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
    const getCatchupData = async days => {
        const date = moment().add(days, 'days').format('DD_MM_YYYY');
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
            GLOBAL.show_log && console.log('get catchup data: ', path);
            let response = await fetch(path);
            let data = await response.json();
            GLOBAL.show_log && console.log('get catchup data response: ', data);
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
        var max = 1;
        var min = (GLOBAL.UserInterface.general.catchup_days - 1) * -1;
        var dates = [];
        for (var i = min; i < max; i++) {
            var time_ = moment().add(i, 'days').format('dddd ll');
            dates.push({ time: time_, days: i, today: i == 0 ? true : false });
        }
        return dates;
    };
    const onPlayCatchupTV = (item, channel, index) => {
        navigation.navigate({
            name: 'Player_CatchupTV',
            params: {
                index: index,
                program: item,
                programs: tvGuide,
                channel: channel,
                channels: channels,
            },
        });
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
        //var image = '';
        //if (item.i == null) {
        var image = getCurrentImage(selectedChannel.url_high, startTime);
        // } else {
        //  image = item.i;
        //}
        if (!isLive && isPast) {
            return (
                <FocusButton
                    onPress={() =>
                        onPlayCatchupTV(item, selectedChannel, index)
                    }>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: '#111',
                            marginHorizontal: 5,
                            marginBottom: 5,
                        }}>
                        <View style={{ padding: 10 }}>
                            <Image
                                source={{
                                    uri:
                                        hasParentalControl == false
                                            ? image
                                            : null,
                                }}
                                style={{
                                    borderRadius: 2,
                                    width: sizes.width * 0.93,
                                    height: ((sizes.width * 0.93) / 16) * 9,
                                    backgroundColor: '#000',
                                }}></Image>
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
                hasParentalControl == false
            ) {
                return (
                    <FocusButton onPress={() => onRecordProgram(item, index)}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: '#111',
                                marginHorizontal: 5,
                                marginBottom: 5,
                            }}>
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
    const _renderHeader = (item, index) => {
        var currentTime = moment().unix();
        var startTime = item.s;
        var endTime = item.e;

        var isLive = false;
        var isPast = false;
        var isFuture = false;

        var totalProgram = endTime - startTime;
        var percentageProgram = (currentTime - startTime) / totalProgram;

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
        //if (item.i == null) {
        if (selectedChannel.url_interactivetv != null) {
            image = getCurrentImage(
                selectedChannel.url_interactivetv,
                startTime,
            );
        } else {
            image = getCurrentImage(selectedChannel.url_high, startTime);
        }
        //} else {
        //  image = item.i;
        //}
        if (isLive) {
            image = getLiveImage(selectedChannel.url_high, startTime);
        }
        if (isFuture == true) {
            return <View></View>;
        } else {
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
                    }}>
                    {RenderIf(isLive == true)(
                        <FocusButton
                            onPress={() =>
                                onPlayCatchupTV(item, selectedChannel, index)
                            }>
                            <View style={{ flex: 1 }}>
                                <View
                                    style={{
                                        height: ((sizes.width * 0.93) / 16) * 9,
                                        width: sizes.width * 0.93,
                                        backgroundColor: '#000',
                                    }}>
                                    {hasParentalControl == false &&
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
                                            height:
                                                ((sizes.width * 0.93) / 16) * 9,
                                            width: '100%',
                                        }}>
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
                                    }}>
                                    <Text
                                        bold
                                        size={10}
                                        style={{
                                            width: sizes.width * 0.3,
                                            marginLeft: 10,
                                        }}>
                                        {moment
                                            .unix(item.s)
                                            .format(
                                                'ddd ' + GLOBAL.Clock_Setting,
                                            )}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            width: sizes.width * 0.3,
                                            marginRight: 10,
                                        }}>
                                        {item.n}
                                    </Text>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'flex-end',
                                            flexDirection: 'row',
                                            marginRight: 10,
                                        }}>
                                        <View
                                            style={{
                                                backgroundColor: 'royalblue',
                                                padding: 5,
                                                borderRadius: 100,
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                            }}>
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
                                        </View>
                                    </View>
                                </View>

                                <View
                                    style={{
                                        marginLeft: 10,
                                        marginBottom: 10,
                                        borderTopWidth: 2,
                                        borderTopColor: '#999',
                                        width:
                                            sizes.width *
                                            0.8 *
                                            percentageProgram,
                                    }}></View>
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
                            style={{
                                width: sizes.width * 0.45,
                                marginRight: 10,
                            }}>
                            {item.n}
                        </Text>,
                    )}
                    {RenderIf(isPast == true)(
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
                                    }}>
                                    <FontAwesome5
                                        style={[{ fontSize: 14, color: '#fff' }]}
                                        // icon={SolidIcons.history}
                                        name="history"
                                    />
                                </View>
                            </View>
                        </View>,
                    )}
                </View>
            );
        }
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
    const getLiveImage = (url, start) => {
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
            accessoryLeft={() => ChannelImage(selectedChannel)}>
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
                }}></Image>
        );
    };
    const onItemSelectDate = item => {
        setLoading(true);
        setDateVisible(false);
        var date = dates[item.row];
        setOffset(date.days);
        setSelectedDateName(date.time);
        (async () => {
            let res = await getCatchupData(date.days);
            if (res.success) {
                setAllCatchupData(res.data);
                var tvGuide_ = res.data;
                if (tvGuide_ != undefined) {
                    if (tvGuide_.channels.length > 0) {
                        var data = tvGuide_.channels[0].epgdata;
                        setTvGuideAllTimes(data);
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
                        var dataToday = getDataTimeScale(start, end, data);
                        setTvGuide(dataToday);
                    }
                    setLoading(false);
                }
            } else {
                //show error
                //catchuptv is not available at the moment
            }
        })();
    };
    const onItemSelectChannel = item => {
        var channel = channels[item.row];
        var channel_id = channel.channel_id;
        setSelectedChannelName(channel.name);
        setSelectedChannelUrl(channel.url_high);
        setSeletectedChannel(channel);

        if (channel.childlock == 1) {
            setHasParentalControl(true);
        } else {
            setHasParentalControl(false);
        }

        var dateTodayIndex = dates.findIndex(d => d.today == true);
        var date = dates[dateTodayIndex];
        setDayOffset(date.days);
        setSelectedDateName(date.time);

        var data = allCatchupData.channels.find(
            c => c.channel_id == channel_id,
        ).epgdata;
        var start = moment().add(0, 'days').startOf('day').unix().toString();
        var end = moment().add(0, 'days').endOf('day').unix().toString();
        var dataToday = getDataTimeScale(start, end, data);
        setChannelVisible(false);
        setTvGuide(dataToday);
    };
    const _updateSections = activeSections => {
        setActiveSections(activeSections);
    };
    const onRecordProgram = (item, index) => {
        setShowRecordingModal(true);
        setRecordProgram(item);
        setRecordedProgram(
            item.n +
            ' ' +
            moment.unix(item.s).format(GLOBAL.Clock_Setting) +
            ' - ' +
            moment.unix(item.e).format(GLOBAL.Clock_Setting),
        );
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
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                    }}>
                    <View
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            alignSelf: 'center',
                            paddingTop: 5,
                        }}>
                        <View
                            style={{
                                paddingLeft: 20,
                                borderRadius: 100,
                                width: 40,
                                height: 40,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 10,
                                marginVertical: 10,
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
                            <OverflowMenu
                                anchor={renderDateButton}
                                visible={dateVisible}
                                selectedIndex={selectedDateIndex}
                                fullWidth={true}
                                style={{
                                    width: sizes.width * 0.9,
                                    marginTop:
                                        GLOBAL.Device_Manufacturer == 'Apple' ||
                                            GLOBAL.Device_IsWebTV
                                            ? 0
                                            : 30,
                                }}
                                onBackdropPress={() => setDateVisible(false)}
                                onSelect={onItemSelectDate}>
                                {dates.map(renderDateItem)}
                            </OverflowMenu>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        width: sizes.width,
                        backgroundColor: 'rgba(0, 0, 0, 0.80)',
                    }}>
                    <View
                        style={{
                            marginHorizontal: 5,
                            width: sizes.width - 10,
                            height: 50,
                            marginBottom: 5,
                        }}>
                        <OverflowMenu
                            removeClippedSubviews={true}
                            anchor={renderChannelButton}
                            visible={channelVisible}
                            selectedIndex={selectedChannelIndex}
                            style={{
                                width: sizes.width * 0.98,
                                marginTop:
                                    GLOBAL.Device_Manufacturer == 'Apple' ||
                                        GLOBAL.Device_IsWebTV
                                        ? 0
                                        : 30,
                            }}
                            onBackdropPress={() => setChannelVisible(false)}
                            onSelect={onItemSelectChannel}>
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
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                    <LinearGradient
                        colors={['rgba(0, 0, 0, 0.80)', 'rgba(0, 0, 0, 0.0)']}
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
                                    paddingTop: 5,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                }}>
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
