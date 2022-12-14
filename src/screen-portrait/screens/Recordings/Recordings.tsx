import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
    TVMenuControl,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Icon, Input } from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
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

export default ({ navigation }): React.ReactElement => {
    var store_search_timer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [recordings, setRecordings] = useState([]);
    const [recordingsSearch, setRecordingsSearch] = useState([]);
    const [recordingColumns, setRecordingColumns] = useState(
        GLOBAL.Device_IsPortrait ? 1 : 3,
    );
    const [searchTerm, setSearchTerm] = useState('');

    const [showVoiceButton, setShowVoiceButton] = useState(false);
    const [showVoiceEnabled, setShowVoiceEnabled] = useState(false);
    const [extraSearchResults, setExtraSearchResults] = useState([]);

    const [quantity_recordings, setQuantityRecordings] = useState(0);
    const [hours_used, setHoursUsed] = useState(0);
    const [progress, setProgress] = useState(0);

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Recordings', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        (async () => {
            let res = await getRecordings();
            if (res.success) {
                var recordingsIn = GLOBAL.Recordings;
                setRecordings(recordingsIn);
                setQuantityRecordings(recordingsIn.length);
                setHoursUsed(Math.floor(GLOBAL.Storage_Used));
                var progres = GLOBAL.Storage_Used / GLOBAL.Storage_Total;
                if (progres > 1) {
                    progres = 1;
                }
                setProgress(progres);
                setRecordingsSearch(recordingsIn);
            }
        })();
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
                            'Recordings',
                            moment().unix(),
                            splitInput[0],
                        );
                        setShowVoiceEnabled(false);
                        setSearchTerm(splitInput[0]);
                        setExtraSearchResults(extraSearch);
                        onSearchRecordings(splitInput[0]);
                    });
                }
            } catch (e) { }
        }
    };
    const onSearchExtra = searchTerm => {
        setSearchTerm(searchTerm);
        onSearchRecordings(searchTerm);
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

    const getRecordings = async () => {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/customers/' +
            UTILS.toAlphaNumeric(GLOBAL.UserID).split('').join('/') +
            '/' +
            UTILS.toAlphaNumeric(GLOBAL.Pass) +
            '.json';
        try {
            console.log('get recording: ', path);
            let response = await fetch(path);
            let data = await response.json();
            let converted = JSON.parse(data);
            console.log('get recording response: ', converted);
            GLOBAL.Recordings = converted.recordings;
            GLOBAL.Storage_Used = converted.storage.used;
            GLOBAL.Storage_Hours = converted.storage.total_hours;
            GLOBAL.Storage_Total = converted.storage.total;
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    };
    const onRecordingDelete = item => {
        sendActionReport(
            'Delete Recording',
            'Recordings',
            moment().unix(),
            item.name,
        );
        DAL.deleteRecording(item.pvr_id).then(messages => {
            var newRecs = recordings.filter(r => r.pvr_id != item.pvr_id);
            setSearchTerm('');
            setRecordings(newRecs);
            var showLength = (pvr.ut_end - pvr.ut_start) / 3600;
            GLOBAL.Storage_Used = GLOBAL.Storage_Used - showLength;
            var progress = Math.round(
                GLOBAL.Storage_Used / GLOBAL.Storage_Total,
            );
            setQuantityRecordings(newRecs.length);
            setHoursUsed(Math.round(GLOBAL.Storage_Used));

            if (progress > 1) {
                progress = 1;
            }
            setProgress(progress);
        });
    };
    const onPlayRecording = item => {
        navigation.navigate({
            name: 'Player_Recordings',
            params: {
                recording: item,
                recordings: recordings,
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
    const renderRecording = ({ item }) => {
        var image = getCurrentImage(item.url, item.ut_start);
        return (
            <View
                style={{
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.97
                        : sizes.width / 3 - 12,
                    flexDirection: 'row',
                    margin: 5,
                    borderRadius: 5,
                    borderColor: '#111',
                    borderWidth: 4,
                }}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        width: '100%',
                        padding: 5,
                        backgroundColor: 'rgba(0, 0, 0, 0.40)',
                    }}>
                    <View style={{ backgroundColor: '#000', borderRadius: 2 }}>
                        <Image
                            source={{ uri: image }}
                            style={{
                                borderRadius: 2,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.915
                                    : sizes.width * 0.31,
                                height: GLOBAL.Device_IsPortrait
                                    ? ((sizes.width * 0.915) / 16) * 9
                                    : ((sizes.width * 0.31) / 16) * 9,
                            }}></Image>
                        <View style={{ position: 'absolute', top: 0, left: 12 }}>
                            <Image
                                source={{
                                    uri: GLOBAL.ImageUrlCMS + item.channel_icon,
                                }}
                                style={{
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.15
                                        : sizes.width * 0.05,
                                    height: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.15
                                        : sizes.width * 0.05,
                                }}></Image>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'column', margin: 10 }}>
                        <Text h5 bold shadow numberOfLines={1}>
                            {item.channel_name}
                        </Text>
                        <Text bold shadow numberOfLines={1}>
                            {item.program_name}
                        </Text>
                        <Text shadow numberOfLines={1}>
                            {moment.unix(item.ut_start).format('DD MMMM YYYY')}
                        </Text>
                        <Text shadow numberOfLines={1}>
                            {moment.unix(item.ut_start).format('hh:mm A') +
                                ' - ' +
                                moment.unix(item.ut_end).format('hh:mm A')}
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                marginLeft: -5,
                                marginTop: 10,
                            }}>
                            {RenderIf(item.ut_end < moment().unix())(
                                <Button
                                    style={{ margin: 4, backgroundColor: '#000' }}
                                    onPress={() => onPlayRecording(item)}>
                                    {LANG.getTranslation('play')}
                                </Button>,
                            )}
                            <Button
                                style={{ margin: 4, backgroundColor: '#000' }}
                                onPress={() => onRecordingDelete(item)}>
                                {LANG.getTranslation('delete_low')}
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    const SearchIcon = props => (
        <Icon {...props} fill="#fff" name="search-outline" />
    );
    const SpeechIcon = props => (
        <Icon {...props} fill="#fff" name="mic-outline" />
    );
    const onStartSearchTimer = searchTerm => {
        TimerMixin.clearTimeout(store_search_timer);
        store_search_timer = TimerMixin.setTimeout(() => {
            sendSearchReport(moment().unix(), searchTerm);
        }, 2000);
    };
    const onSearchRecordings = searchTerm => {
        var recordingsSearch_ = recordingsSearch.filter(
            c =>
                c.channel_name.toLowerCase().indexOf(searchTerm.toLowerCase()) >
                -1,
        );
        setSearchTerm(searchTerm);
        setRecordings(recordingsSearch_);
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
                    paddingHorizontal: 10,
                    paddingTop: 10,
                }}>
                <View style={{ paddingBottom: 10, flexDirection: 'row' }}>
                    <View
                        style={{
                            paddingLeft: 10,
                            marginRight: 0,
                            borderRadius: 100,
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
                            flexDirection: 'row',
                            borderColor: '#999',
                            borderWidth: 1,
                            borderRadius: 100,
                            marginHorizontal: 10,
                        }}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                width: sizes.width,
                                alignSelf: 'center',
                                paddingVertical: 5,
                                paddingLeft: 20,
                            }}>
                            <Input
                                status="basic"
                                style={{
                                    width: '100%',
                                    backgroundColor: 'transparent',
                                    paddingRight: showVoiceButton ? 0 : 20,
                                    borderColor: 'transparent',
                                }}
                                value={searchTerm}
                                autoComplete={'off'}
                                placeholder={
                                    LANG.getTranslation('filter') + '...'
                                }
                                accessoryLeft={SearchIcon}
                                underlineColorAndroid="transparent"
                                onChangeText={nextValue =>
                                    onSearchRecordings(nextValue)
                                }
                            />
                        </View>
                        <View style={{ alignSelf: 'center' }}>
                            {showVoiceButton && (
                                <Button
                                    style={{ borderRadius: 100 }}
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
            <View style={{ flex: 1, flexDirection: 'row', width: sizes.width }}>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.80)', 'rgba(0, 0, 0, 0.0)']}
                    style={{
                        flex: 1,
                        width: sizes.width,
                        minHeight: sizes.height,
                    }}
                    start={{ x: 0.5, y: 0 }}>
                    <View
                        style={{
                            paddingVertical: 10,
                            width: sizes.width,
                            backgroundColor: 'rgba(0, 0, 0, 0.80)',
                            flexDirection: 'row',
                            alignSelf: 'center',
                        }}>
                        <View
                            style={{
                                width: sizes.width * 0.45,
                                justifyContent: 'center',
                                paddingLeft: 20,
                            }}>
                            <Text>
                                {quantity_recordings}{' '}
                                {LANG.getTranslation('recordings')}
                            </Text>
                            <Text>
                                {LANG.getTranslation('used')} {hours_used}{' '}
                                {LANG.getTranslation('hours')}
                            </Text>
                        </View>
                        <View style={{ alignSelf: 'center' }}>
                            <View
                                style={{
                                    backgroundColor: '#111',
                                    width: sizes.width * 0.5,
                                    height: 40,
                                    marginTop: 5,
                                    borderColor: '#222',
                                    borderWidth: 1,
                                }}>
                                <View
                                    style={{
                                        backgroundColor: '#222',
                                        width: sizes.width * 0.495 * progress,
                                        height: 32,
                                        margin: 3,
                                    }}></View>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            paddingTop: 10,
                            alignSelf: 'center',
                            marginBottom: 185,
                        }}>
                        <FlatList
                            key={searchTerm}
                            extraData={searchTerm}
                            data={recordings}
                            numColumns={recordingColumns}
                            horizontal={false}
                            removeClippedSubviews={true}
                            keyExtractor={(item, index) => index.toString()}
                            onScrollToIndexFailed={() => { }}
                            renderItem={renderRecording}
                        />
                    </View>
                </LinearGradient>
            </View>
        </Block>
    );
};
