import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
    TVMenuControl,
    AppState,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import SIZES from '../../constants/sizes';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Video from 'react-native-video/dom/Video';
import Player_Utils from '../../components/Player_Utils';
import KeepAwake from 'react-native-keep-awake';
import { sendMusicReport } from '../../../reporting/reporting';
import { sendPageReport } from '../../../reporting/reporting';

export interface Songs {
    id: number;
    name?: string;
    akamai_token?: boolean;
    flussonic_token?: boolean;
    secure_stream?: boolean;
    has_drm?: boolean;
    url?: string;
}
export interface Album {
    id: number | string;
    artist?: string;
    description?: string;
    name?: string;
    poster?: string;
    songs?: Songs[];
}

export default ({ navigation, route }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [album, setAlbum] = useState<Album>();
    const [playIndex, setPlayIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [allStreamValues, setAllStreamValues] = useState({
        url: 'https://',
        type: '',
        reportContentName: '',
        index: 0,
        id: 0,
        name: '',
        item: [],
    });
    const [drmKey, setDrmKey] = useState('');
    const [paused, setPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [timeProgress, setTimeProgress] = useState('');

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Album Details', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (GLOBAL.Device_IsWebTV == false) {
            AppState.addEventListener('change', _handleAppStateChange);
        }

        if (route.params?.album != undefined) {
            setAlbum(route.params?.album);
        }
        return () => {
            if (allStreamValues.name != '') {
                sendMusicReport(
                    album.name,
                    album.id,
                    allStreamValues.name,
                    allStreamValues.id,
                    album.poster,
                    reportStartTime,
                    moment().unix(),
                );
            }
            if (GLOBAL.Device_IsWebTV == false) {
                AppState.removeEventListener('change', _handleAppStateChange);
            }
        };
    }, []);
    const _handleAppStateChange = nextAppState => {
        if (nextAppState == 'background') {
            setPaused(true);
            if (GLOBAL.Device_IsWebTV) {
                player.pause();
            }
        }
        if (nextAppState == 'active') {
            setPaused(false);
            if (GLOBAL.Device_IsWebTV) {
                player.play();
            }
        }
    };
    const _handlePaused = () => {
        setPaused(!paused);
        if (GLOBAL.Device_IsWebTV) {
            if (paused == false) {
                player.pause();
            } else {
                player.play();
            }
        }
    };
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
    const onPressBack = () => {
        navigation.goBack();
    };
    const getPlayStatus = index => {
        if (playIndex == index) {
            return <Text>{timeProgress}</Text>;
        } else {
            return null;
        }
    };
    const onEnd = data => {
        if (album.songs.length > allStreamValues.index + 1) {
            if (allStreamValues.name != '') {
                sendMusicReport(
                    album.name,
                    album.id,
                    allStreamValues.name,
                    allStreamValues.id,
                    album.poster,
                    reportStartTime,
                    moment().unix(),
                );
                setReportStartTime(moment().unix());
            }
            var index = allStreamValues.index + 1;
            var url = album.songs[index].url;
            var streamType = Player_Utils.getStreamType(url);
            setPlayIndex(index);
            setAllStreamValues({
                ...allStreamValues,
                url: url,
                type: streamType,
                index: index,
                id: album.songs[index].id,
                name: album.songs[index].name,
            });
        }
    };
    const onLoad = data => {
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        setDuration(data.duration);
    };
    const formatValue = value => {
        const hours = Math.floor(value / 3600);
        const rawMinutes = value / 60 - 60 * hours;
        const minutes = Math.floor(rawMinutes);
        const seconds = Math.floor((rawMinutes - minutes) * 60);
        const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
        const formattedMinutes =
            minutes < 10 && hours ? `0${minutes}` : minutes;

        if (hours) {
            return `${hours}:${formattedMinutes}:${formattedSeconds}`;
        }
        return `${formattedMinutes}:${formattedSeconds}`;
    };
    const onProgress = data => {
        if (GLOBAL.Device_IsWebTV) {
            //data = data.target;
            return;
        }
        var position = data.currentTime;
        var progress = position / duration;
        var timeProgres = formatValue(position);
        var timeTotal = formatValue(duration);
        setProgress(progress);
        setTimeProgress(timeProgres + ' / ' + timeTotal);
    };
    const onPlaySong = (item, index) => {
        var streamType = Player_Utils.getStreamType(item.url);
        setPlayIndex(index);
        if (allStreamValues.name != '') {
            sendMusicReport(
                album.name,
                album.id,
                allStreamValues.name,
                allStreamValues.id,
                album.poster,
                reportStartTime,
                moment().unix(),
            );
            setReportStartTime(moment().unix());
        }
        setAllStreamValues({
            ...allStreamValues,
            url: item.url,
            type: streamType,
            index: index,
            id: item.id,
            name: item.name,
        });
    };
    const renderSong = ({ item, index }) => {
        return (
            <Block margin={2} flex={0} color={'transparent'}>
                <FocusButton onPress={() => onPlaySong(item, index)}>
                    <View
                        style={{
                            flexDirection: 'row',
                            borderRadius: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            justifyContent: 'center',
                            padding: 20,
                            marginRight: GLOBAL.Device_IsPortrait ? 10 : 50,
                        }}
                    >
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text bold style={{ width: 30 }}>
                                {index + 1}.
                            </Text>
                            <Text>{item.name}</Text>
                        </View>
                        <View>{getPlayStatus(index)}</View>
                    </View>
                </FocusButton>
            </Block>
        );
    };
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            {album != undefined && (
                <ImageBackground
                    blurRadius={GLOBAL.Device_IsWebTV ? 50 : 10}
                    source={{
                        uri:
                            album?.poster == '001.png'
                                ? GLOBAL.Background
                                : GLOBAL.ImageUrlCMS + album?.poster,
                    }}
                    style={{ flex: 1, width: null, height: null }}
                    imageStyle={{ resizeMode: 'cover' }}
                >
                    <Block
                        flex={1}
                        width={sizes.width}
                        align="center"
                        justify="center"
                        color={'transparent'}
                    >
                        <View style={{ flex: 1, width: sizes.width }}>
                            <LinearGradient
                                colors={['#000', 'rgba(0, 0, 0, 0.0)']}
                                style={{
                                    flex: 1,
                                    width: sizes.width,
                                    height: '100%',
                                }}
                                start={{ x: 0.5, y: 0 }}
                            >
                                <View style={{ flex: 2 }}>
                                    <View
                                        style={{ flex: 1, flexDirection: 'row' }}
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
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 16,
                                        flexDirection: 'column',
                                        marginLeft: GLOBAL.Device_IsPortrait
                                            ? 10
                                            : 50,
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri:
                                                GLOBAL.ImageUrlCMS +
                                                album?.poster,
                                        }}
                                        style={{
                                            borderRadius: 5,
                                            width: GLOBAL.Device_IsPortrait
                                                ? sizes.width * 0.5
                                                : sizes.width * 0.15,
                                            height: GLOBAL.Device_IsPortrait
                                                ? sizes.width * 0.5
                                                : sizes.width * 0.15,
                                        }}
                                    />

                                    {allStreamValues.url != 'https://' && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: GLOBAL.Device_IsPortrait
                                                    ? sizes.width * 0.17
                                                    : sizes.width * 0.05,
                                                left: GLOBAL.Device_IsPortrait
                                                    ? sizes.width * 0.17
                                                    : sizes.width * 0.05,
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                zIndex: 99999,
                                            }}
                                        >
                                            <FocusButton
                                                onPress={() => _handlePaused()}
                                            >
                                                <View
                                                    style={{
                                                        backgroundColor:
                                                            'rgba(0, 0, 0, 0.40)',
                                                        borderRadius: 100,
                                                    }}
                                                >
                                                    <FontAwesome5
                                                        style={{
                                                            color: '#fff',
                                                            fontSize:
                                                                GLOBAL.Device_IsPortrait
                                                                    ? 35
                                                                    : 50,
                                                            opacity: 0.8,
                                                            margin: 10,
                                                            textShadowColor:
                                                                'rgba(0, 0, 0, 0.75)',
                                                            textShadowOffset: {
                                                                width: -1,
                                                                height: 1,
                                                            },
                                                            textShadowRadius: 10,
                                                        }}
                                                        // icon={
                                                        //     paused
                                                        //         ? RegularIcons.pauseCircle
                                                        //         : RegularIcons.playCircle
                                                        // }
                                                        name={paused ? "pause-circle" : "play-circle"}
                                                    />
                                                </View>
                                            </FocusButton>
                                        </View>
                                    )}
                                    <Text h4 style={{ marginTop: 20 }}>
                                        {album?.artist}
                                    </Text>
                                    <View
                                        style={{
                                            marginBottom: 5,
                                            borderTopWidth: 2,
                                            borderTopColor: '#999',
                                            width:
                                                sizes.width * 0.89 * progress,
                                        }}
                                    ></View>
                                    <Text bold>{album?.name}</Text>
                                    <Text>{album?.description}</Text>

                                    <View
                                        style={{
                                            flex: 1,
                                            flexDirection: 'row',
                                            marginTop: 20,
                                        }}
                                    >
                                        <FlatList
                                            data={album?.songs}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={(item, index) =>
                                                renderSong(item, index)
                                            }
                                        />
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    </Block>
                </ImageBackground>
            )}
            {allStreamValues.url != 'https://' && (
                <Video
                    source={{
                        uri: allStreamValues.url,
                        type: allStreamValues.type,
                        ref: 'player',
                        full: false,
                        headers: {
                            'User-Agent': GLOBAL.User_Agent,
                        },
                        drm: {
                            type:
                                drmKey == ''
                                    ? null
                                    : GLOBAL.Device_System == 'Apple'
                                        ? DRMType.FAIRPLAY
                                        : DRMType.WIDEVINE,
                            licenseServer: GLOBAL.DrmKeyServerUrl,
                            headers: {
                                customData: '',
                            },
                        },
                    }}
                    ignoreSilentSwitch={'ignore'}
                    streamType={'MUSIC'}
                    style={{
                        width: 0,
                        height: 0,
                        position: 'absolute',
                        zIndex: -1,
                    }}
                    paused={paused}
                    onLoad={onLoad}
                    onProgress={onProgress}
                    onEnd={onEnd}
                    disableFocus={true}
                    repeat={false}
                />
            )}
            {GLOBAL.Device_IsWebTV == false &&
                GLOBAL.Device_IsAppleTV == false && <KeepAwake />}
        </View>
    );
};
