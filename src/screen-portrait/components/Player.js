import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    ScrollView,
    Animated,
    View,
    ImageBackground,
    TouchableOpacity,
    Image,
    StatusBar,
    BackHandler,
    ActivityIndicator,
    AppState,
    SafeAreaView,
    Platform,
    Dimensions,
} from 'react-native';
import Video from 'react-native-video/dom/Video';
import { LinearGradient } from 'expo-linear-gradient';
import Orientation from 'react-native-orientation';
import {
    useNavigation,
    useIsFocused,
    useRoute,
    useNavigationState,
} from '@react-navigation/core';
import TimerMixin from 'react-timer-mixin';
import { Card, Modal, Button, Input, Icon } from '@ui-kitten/components';
import TextTicker from 'react-native-text-ticker';
import { CommonActions } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import Voice from '@react-native-voice/voice';
import * as Animatable from 'react-native-animatable';

import {
    sendChannelReport,
    sendCatchupTVReport,
    sendRecordingReport,
    sendMovieReport,
    sendSeriesReport,
    sendEducationReport,
    sendActionReport,
    sendErrorReport,
} from '../../reporting/reporting';
// import GLOBALModule from '../../datalayer/global';
var GLOBALModule = require('../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import LANG from '../../languages/languages';
import LANG_CODES from '../../languages/language_codes';
import UTILS from '../../datalayer/utils';
import Scrubber from '../components/Scrubber';
// import {BrandIcons, RegularIcons, SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Block, Text } from '../components';
import Player_Utils from './Player_Utils';
import moment from 'moment';
import SIZES from '../constants/sizes';

const Player = ({
    content,
    streamUrl,
    streamType,
    streamTypeCasting,
    reportContentName,
    parentalControl,
    adsOverlay,
    adsPreroll,
    adsTicker,
    drmType,
    drmKey,
    drmLicenseServerUrl,
    drmCertificateUrl,
    drmSupplierType,
    playerType,
    viaVia,
    vastUrl,
    style,
    orientation,
}) => {
    var show_watermark_timer;
    var start_watermark_timer;
    var ad_show_timer;
    var zap_timer;

    const isFocused = useIsFocused();
    const playerRef = useRef(null);
    var sizes = SIZES.getSizing();
    const navigation = useNavigation();
    const route = useRoute();

    const showTimer = TimerMixin;
    const delayTime = TimerMixin;
    const castSession =
        (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) &&
            GLOBAL.Device_FormFactor != 'TOUCHPANEL' &&
            GLOBAL.Device_System != 'Apple'
            ? useCastSession()
            : null;
    const client =
        (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) &&
            GLOBAL.Device_FormFactor != 'TOUCHPANEL' &&
            GLOBAL.Device_System != 'Apple'
            ? useRemoteMediaClient()
            : null;
    const castState =
        (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) &&
            GLOBAL.Device_FormFactor != 'TOUCHPANEL' &&
            GLOBAL.Device_System != 'Apple'
            ? useCastState()
            : null;
    const [playerTypeInternal, setPlayerTypeInternal] = useState('');
    const [allStreamValues, setAllStreamValues] = useState({
        url: '',
        type: '',
        type_google: '',
        contentId: '',
        reportContentName: '',
        drmType: null,
        drmKey: '',
        drmLicenseServerUrl: '',
        drmCertificateUrl: '',
        drmSupplierType: '',
        externalSubtitles: [],
        casting: {
            autoplay: true,
            contentType: '',
            mediaInfo: {
                contentUrl: '',
                metadata: {
                    type: 'tvShow', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                    title: '',
                    images: [
                        {
                            type: 'tvShow',
                            url: '',
                        },
                    ],
                },
            },
        },
    });
    const [allStreamValuesAds, setAllStreamValuesAds] = useState({
        url: '',
        type: '',
    });
    const [loadStream, setLoadStream] = useState(false);

    const [audioTrackIndex, setAudioTrackIndex] = useState(0);
    const [textTrackIndex, setTextTrackIndex] = useState(0);
    const [textTrackType, setTextTrackType] = useState('disabled'); //disabled
    const [resizeMode, setResizeMode] = useState(GLOBAL.Screen_Size); //stretch, cover, none, contain
    const [paused, setPaused] = useState(false);

    const [bufferConfig, setBufferConfig] = useState({
        minBufferMs: 15000,
        maxBufferMs: 50000,
        bufferForPlaybackMs: streamType == 'UDP' ? 1000 : 2500,
        bufferForPlaybackAfterRebufferMs: streamType == 'UDP' ? 2000 : 5000,
    });
    const [videoModes, setVideoModes] = useState([
        { mode: 'None', type: 'none' },
        { mode: 'Contain', type: 'contain' },
        { mode: 'Cover', type: 'cover' },
        { mode: 'Stretch', type: 'stretch' },
    ]);
    const [reportTypes, setReportTypes] = useState([
        { text: LANG.getTranslation('audio_not_working'), type: 'No Audio' },
        { text: LANG.getTranslation('video_not_working'), type: 'No Video' },
        { text: LANG.getTranslation('audio_video_not_working'), type: 'Both' },
    ]);
    const [error, setError] = useState('');
    const [position, setPosition] = useState(0);
    const [seekPosition, setSeekPosition] = useState(null);
    const [duration, setDuration] = useState(0);
    const [buffer, setBuffer] = useState(0);
    const [audioTracks, setAudioTracks] = useState([]);
    const [textTracks, setTextTracks] = useState([]);

    const [settings, setSettings] = useState(false);
    const [support, setSupport] = useState(false);
    const [supportSuccess, setSupportSuccess] = useState(false);

    const [showPlayer, setShowPlayer] = useState(false);
    const [showPlayerActive, setShowPlayerActive] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [showOverlay, setShowOverlay] = useState(false);
    const [imageOverlay, setImageOverlay] = useState('');
    const [showTicker, setShowTicker] = useState(false);
    const [textTicker, setTextTicker] = useState('');
    const [textTickerTimer, setTextTickerTimer] = useState(0);
    const [showPreroll, setShowPreroll] = useState(false);

    const [parentalCode, setParentalCode] = useState('');
    const [nextActive, setNextActive] = useState(false);
    const [nextCountdown, setNextCountdown] = useState(0);
    const [nextCountdownAds, setNextCountdownAds] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timeLeftAds, setTimeLeftAds] = useState(0);
    const [nextText, setNextText] = useState('');
    const [prevText, setPrevText] = useState('');
    const [nextImage, setNextImage] = useState('');
    const [prevImage, setPrevImage] = useState('');
    const [favorite, setFavorite] = useState(false);
    const [resume, setResume] = useState(false);

    const [showChannelList, setShowChannelList] = useState(false);
    const [channelSelected, setChannelSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [channelList, setChannelList] = useState([]);
    const [channelListSearch, setChannelListSearch] = useState([]);
    const [epgList, setEpgList] = useState([]);
    //const [searching, setSearching] = useState(false);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [channelIndex, setChannelIndex] = useState(0);
    const [programIndex, setProgramIndex] = useState(0);

    const [showSeasonList, setShowSeasonList] = useState(false);
    const [seasonIndex, setSeasonIndex] = useState(0);
    const [episodeIndex, setEpisodeIndex] = useState(0);
    const [episodeList, setEpisodeList] = useState([]);

    const [showEducationList, setShowEducationList] = useState(false);
    const [courseIndex, setCourseIndex] = useState(0);
    const [lessonIndex, setLessonIndex] = useState(0);
    const [lessonList, setLessonList] = useState([]);

    const [showCatchupList, setShowCatchupList] = useState(false);
    const [programList, setProgramList] = useState([]);

    const [movieList, setMovieList] = useState(false);
    const [moviesList, setMoviesList] = useState([]);

    const [recordingsList, setRecordingsList] = useState([]);
    const [showRecordingList, setShowRecordingList] = useState(false);

    const [parentalSuccessfull, setParentalSuccessFull] = useState(false);

    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [showRecordingSuccessModal, setShowRecordingSuccessModal] =
        useState(false);
    const [errorRecording, setErrorRecording] = useState('');
    const [recordedProgram, setRecordedProgram] = useState('');

    const [showWaterMarking, setShowWaterMarking] = useState(false);
    const [watermark_x, setWatermark_x] = useState(0);
    const [watermark_y, setWatermark_y] = useState(0);

    const [allowBackPressed, setAllowBackPressed] = useState(false);

    const routes = useNavigationState(state => state.routes);
    const [adStore, setAdStore] = useState([]);

    const [reportStartTime, setReportStartTime] = useState(moment().unix());

    const [showVoiceButton, setShowVoiceButton] = useState(false);
    const [showVoiceEnabled, setShowVoiceEnabled] = useState(false);
    const [extraSearchResults, setExtraSearchResults] = useState([]);

    useEffect(() => {
        if (
            (GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet) &&
            GLOBAL.Device_FormFactor != 'TOUCHPANEL' &&
            GLOBAL.Device_System != 'Apple'
        ) {
            if (castSession) {
                if (client) {
                    if (CastState.CONNECTED) {
                        client.loadMedia(allStreamValues.casting);
                        setPaused(true);
                    } else {
                        setPaused(false);
                    }
                }
            } else if (CastState.NOT_CONNECTED) {
                setPaused(false);
            }
        }
    }, [castSession, client, allStreamValues]);

    useEffect(() => {
        StatusBar.setHidden(true);
        setPaused(false);
        setError('');
        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToLandscape();
        }
        if (GLOBAL.Device_IsWebTV == false) {
            AppState.addEventListener('change', _handleAppStateChange);
        }

        setLoadStream(true);
        setPlayerTypeInternal(playerType);

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
        if (GLOBAL.Device_IsWebTvMobile) {
            var supportsOrientationChange = 'onorientationchange' in window,
                orientationEvent = supportsOrientationChange
                    ? 'orientationchange'
                    : 'resize';

            window.addEventListener(
                orientationEvent,
                function () {
                    //alert('HOLY ROTATING SCREENS BATMAN:' + window.orientation + " " + screen.width);
                },
                false,
            );
        }
        return () => {
            setPaused(true);
            if (GLOBAL.Device_IsWebTV == false) {
                AppState.removeEventListener('change', _handleAppStateChange);
            }
            if (GLOBAL.Device_IsWebTV == true) {
                AppState.removeEventListener('change', _handleAppStateChange);
                // killVideoJSPlayer();
            }
            TimerMixin.clearTimeout(show_watermark_timer);
            TimerMixin.clearTimeout(start_watermark_timer);
            TimerMixin.clearTimeout(ad_show_timer);

            if (
                GLOBAL.Device_System == 'Apple' ||
                GLOBAL.Device_System == 'Android' ||
                GLOBAL.Device_System == 'Amazon'
            ) {
                Voice.destroy().then(Voice.removeAllListeners);
            }
            sendReports();
        };
    }, []);

    useEffect(() => {
        onGetFavoriteStatus();
        setPrevNextTextImage();
        if (parentalControl != 0 || parentalSuccessfull == true) {
            setShowModal(true);
        } else {

            console.log('stream url ====> ', streamUrl);

            setAllStreamValues({
                ...allStreamValues,
                url: streamUrl,
                type: streamType,
                type_google: streamTypeCasting,
                reportContentName: reportContentName,
                contentId: content.name,
                drmKey: drmKey,
                drmType: drmType,
                drmCertificateUrl: drmCertificateUrl,
                drmLicenseServerUrl: drmLicenseServerUrl,
                drmSupplierType: drmSupplierType,
                externalSubtitles: content.subs,
                casting: {
                    autoplay: true,
                    contentType: streamTypeCasting,
                    mediaInfo: {
                        contentUrl: streamUrl,
                        metadata: {
                            type: playerType == 'Channel' ? 'tvShow' : 'movie', // | "musicTrack" | "photo" | "tvShow" | "user"
                            title: content.name,
                            images: [
                                {
                                    type:
                                        playerType == 'Channel'
                                            ? 'tvShow'
                                            : 'movie',
                                    url:
                                        playerType == 'Channel'
                                            ? content.image
                                            : GLOBAL.ImageUrlCMS +
                                            content.poster,
                                },
                            ],
                        },
                    },
                },
            });
        }
        if (playerType == 'Channel') {
            if (content.programs != undefined) {
                setEpgList(content.programs.epgdata);
            }
            setChannelIndex(content.index);
            setProgramIndex(content.program_index);
            setCategoryIndex(content.category_index);
            setChannelSelected(content.channel);
            GLOBAL.Channel = content.channel;
            setChannelList(content.channels);
            setChannelListSearch(content.channels);
            if (GLOBAL.UserInterface.player.enable_watermarking == true) {
                startWaterMarkTimer();
            }
            ////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
            setPlayerTypeInternal(playerType);
        }
        if (playerType == 'Series') {
            if (content.position > 0) {
                setResume(true);
            }
            setSeasonIndex(content.season_index);
            setEpisodeIndex(content.index);
            setEpisodeList(content.episodes);
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
        }
        if (playerType == 'Education') {
            if (content.position > 0) {
                setResume(true);
            }
            setSeasonIndex(content.course_index);
            setLessonIndex(content.index);
            setLessonList(content.lessons);
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
        }
        if (playerType == 'CatchupTV') {
            setProgramIndex(content.program_index);
            var start = moment().startOf('day').unix().toString();
            var end = moment().endOf('day').unix().toString();
            var dataToday = getDataTimeScale(start, end, content.programs);
            setProgramList(dataToday);
            setChannelSelected(content.channel);
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
        }
        if (playerType == 'Movie') {
            if (content.position > 0) {
                setResume(true);
            }
            setMoviesList(content.movies);
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
        }
        if (playerType == 'Recording') {
            setRecordingsList(content.recordings);
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
        }
        if (adsOverlay == 1 || adsPreroll == 1 || adsTicker == 1) {
            getAdsFromServer();
        }
    }, [loadStream]);

    const sendReports = () => {
        if (reportStartTime == moment().unix()) {
            return;
        }
        if (reportStartTime + 60 <= moment().unix()) {
            return;
        }
        if (playerType == 'Channel') {
            sendChannelReport(
                content.channel.channel_id,
                content.channel.channel_number,
                content.channel.name,
                content.channel.icon_big,
                reportStartTime,
                moment().unix(),
                content.program.s,
                content.program.e,
                content.program.n,
            );
        }
        if (playerType == 'Recording') {
            sendRecordingReport(
                content.channel.channel_id,
                content.channel.channel_number,
                content.channel.name,
                content.channel.icon_big,
                reportStartTime,
                moment().unix(),
                content.recording.ut_start,
                content.recording.ut_end,
                content.recording.name,
            );
        }
        if (playerType == 'CatchupTV') {
            sendCatchupTVReport(
                content.channel.channel_id,
                content.channel.channel_number,
                content.channel.name,
                content.channel.icon_big,
                reportStartTime,
                moment().unix(),
                content.program.s,
                content.program.e,
                content.program.n,
            );
        }
        if (playerType == 'Series') {
            if (content.series == undefined) {
                return;
            }
            if (content.season == undefined) {
                return;
            }
            if (content.episodes == undefined) {
                return;
            }
            if (content.episodes[content.index] == undefined) {
                return;
            }
            sendSeriesReport(
                content.series.name,
                content.series.vod_id,
                content.season.name,
                content.season_id,
                content.episodes[content.index].name,
                content.episodes[content.index].id,
                content.season.poster,
                content.episodes[content.index].image,
                reportStartTime,
                moment().unix(),
            );
        }
        if (playerType == 'Movie') {
            sendMovieReport(
                content.id,
                content.name,
                content.poster,
                reportStartTime,
                moment().unix(),
            );
        }
        if (playerType == 'Education') {
            sendEducationReport(
                content.year.name,
                content.year.id,
                content.course.name,
                content.education_id,
                content.lessons[content.index].name,
                content.lessons[content.index].id,
                content.course.poster,
                content.lessons[content.index].image,
                reportStartTime,
                moment().unix(),
            );
        }
    };

    const _handleAppStateChange = nextAppState => {
        if (nextAppState == 'background') {
            setPaused(true);
        }
        if (nextAppState == 'active') {
            setPaused(false);
        }
    };
    const showWaterMark = () => {
        var y = Math.floor(Math.random() * GLOBAL.Device_Width);
        var x = Math.floor(Math.random() * GLOBAL.Device_Height);
        if (x < 50) {
            x = 50;
        }
        setShowWaterMarking(true);
        setWatermark_x(x);
        setWatermark_y(y);
        TimerMixin.clearTimeout(show_watermark_timer);
        show_watermark_timer = TimerMixin.setTimeout(() => {
            setShowWaterMarking(false);
            TimerMixin.clearTimeout(show_watermark_timer);
            startWaterMarkTimer();
        }, 5000);
    };
    const startWaterMarkTimer = () => {
        TimerMixin.clearTimeout(start_watermark_timer);
        start_watermark_timer = TimerMixin.setTimeout(() => {
            TimerMixin.clearTimeout(start_watermark_timer);
            showWaterMark();
        }, 30000);
    };

    const onRecordProgram = item => {
        sendActionReport('Set Recording', playerType, moment().unix(), item.n);
        setShowCatchupList(false);
        setShowChannelList(false);
        setRecordedProgram(
            item.n +
            ' ' +
            moment.unix(item.s).format(GLOBAL.Clock_Setting) +
            ' - ' +
            moment.unix(item.e).format(GLOBAL.Clock_Setting),
        );
        setShowRecordingModal(true);
        setPaused(false);
        setRecordProgram(item);
    };
    const setRecordProgram = item => {
        DAL.setRecording(
            channelSelected.channel_id,
            item.e,
            item.s,
            item.n,
        ).then(data => {
            if (data == 'Not Approved') {
                setErrorRecording(LANG.getTranslation('recording_set_for_not'));
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
    const setAdShownForCertainChannel = channel_id => {
        var adStore_ = {
            channel_id: channel_id,
            timestamp: moment().unix() + 900, //15 minutes added
        };
        var oldStore = adStore;
        var newStore = oldStore.push(adStore_);
        setAdStore(newStore);
    };
    const getAdShowForCertainChannel = channel_id => {
        var test = adStore.find(c => c.channel_id == channel_id);
        if (test == undefined) {
            return false;
        } else {
            var current = moment().unix();
            if (test.timestamp > current) {
                return true;
            } else {
                return false;
            }
        }
    };
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeftAds(timeLeftAds - 1);
            if (timeLeftAds - 1 >= 0) {
                setNextCountdownAds(timeLeftAds);
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeftAds]);

    const getAdsFromServer = async () => {
        if (GLOBAL.Device_IsWebTvMobile) {
            return;
        }
        var test = false; // getAdShowForCertainChannel(content.channel.channel_id);
        if (test == false) {
            var path =
                GLOBAL.Settings_Gui.style.web_api_location +
                '/advertisement/getStreamAdvertisement?contentName=' +
                encodeURI(content.channel.name) +
                '&contentType=channel&contentId=' +
                content.channel.channel_id +
                '&userId=' +
                GLOBAL.UserID +
                '&resellerId=' +
                GLOBAL.ResellerID +
                '&deviceModel=' +
                encodeURI(GLOBAL.Device_Model) +
                '&cmsService=' +
                GLOBAL.CMS +
                '&crmService=' +
                GLOBAL.CRM +
                '&city=' +
                encodeURI(GLOBAL.City) +
                '&state=' +
                encodeURI(GLOBAL.State) +
                '&country=' +
                encodeURI(GLOBAL.Country) +
                '';

            try {
                console.log('get ads from server: ', path);
                let response = await fetch(path);
                let ads = await response.json();
                console.log('get ads from server response: ', ads);
                if (adsPreroll == 1 && ads.preroll[0].url != null) {
                    setAdShownForCertainChannel(content.channel.channel_id);
                    setAllStreamValuesAds({
                        ...allStreamValuesAds,
                        url: ads.preroll[0].url,
                        type: 'video/mp4',
                    });
                    setShowPreroll(true);
                    setNextCountdownAds(ads.preroll[0].showtime);
                    setTimeLeftAds(ads.preroll[0].showtime);
                    ad_show_timer = TimerMixin.setTimeout(() => {
                        setShowPreroll(false);
                        setAllStreamValuesAds({
                            ...allStreamValuesAds,
                            url: 'https://',
                            type: 'video/mp4',
                        });
                        setShowPlayer(true);
                        setShowPlayerActive(!showPlayerActive);
                        refreshPlayer(content.index);
                        // REPORT.set({
                        //     type: 26,
                        //     duration: ads.preroll[0].showtime,
                        //     key: 'preroll'
                        // });
                    }, ads.preroll[0].showtime * 1000);
                } else if (adsOverlay == 1 && ads.overlay[0].url != null) {
                    setAdShownForCertainChannel(content.channel.channel_id);
                    setShowOverlay(true);
                    setImageOverlay(ads.overlay[0].url);
                    ad_show_timer = TimerMixin.setTimeout(() => {
                        setShowOverlay(false);
                        setImageOverlay('');
                        // REPORT.set({
                        //     type: 27,
                        //     duration: ads.overlay[0].showtime,
                        //     key: 'overlay'
                        // });
                    }, ads.overlay[0].showtime * 1000);
                } else if (adsTicker == 1 && ads.ticker[0].text != null) {
                    setAdShownForCertainChannel(content.channel.channel_id);
                    setShowTicker(true);
                    setTextTicker(
                        ads.ticker[0].text + ' ' + ads.ticker[0].text,
                    );
                    setTextTickerTimer(ads.ticker[0].showtime * 1000);

                    ad_show_timer = TimerMixin.setTimeout(() => {
                        setShowTicker(false);
                        setTextTicker('');
                        setTextTickerTimer(0);
                        // REPORT.set({
                        //     type: 28,
                        //     duration: ads.ticker[0].showtime,
                        //     key: 'ticker'
                        // });
                    }, ads.ticker[0].showtime * 1000);
                }
            } catch (error) { }
        }
    };
    const setSeek = (time, fromScrubberOrResume) => {
        var seekNow = 0;
        if (fromScrubberOrResume == true) {
            sendActionReport('Use Scrubber', playerType, moment().unix(), '');
            seekNow = time;
        } else {
            seekNow = position + time;
        }
        if (seekNow < duration && seekNow >= 0) {
            if (GLOBAL.Device_IsWebTV) {
                if (streamType != 'mpd') {
                    player.currentTime(seekNow);
                } else {
                    video.currentTime = seekNow;
                }
            } else {
                if (GLOBAL.Device_Manufacturer == 'Apple') {
                    playerRef.current.seek(seekNow);
                } else {
                    setSeekPosition(seekNow);
                }
            }
        }
    };
    const getTextTracks = data => {
        if (showPreroll) {
            return;
        }
        if (GLOBAL.Device_IsWebTV && streamType == 'mpd') {
            data = player.getTextTracks();
        }
        if (GLOBAL.Device_IsWebTV && streamType != 'mpd') {
            data = Array.from(player.textTracks());
        }

        var subs_ = [];
        var i = 0;
        if ((data == undefined || data == null) && content.subs == undefined) {
            return subs_;
        }
        if (GLOBAL.Device_IsWebTV) {
            setTextTrackIndex(999);
            setTextTrackType('disabled');
        }
        data.forEach(element => {
            var language = GLOBAL.Device_IsWebTV
                ? element.label
                : element.title;
            if (GLOBAL.Selected_TextTrack == language) {
                setTextTrackIndex(i);
                setTextTrackType('index');
            }
            if (language != '' && language != undefined) {
                language = language.replace('subs:', '');
                var index = GLOBAL.Device_IsWebTV
                    ? element.language
                    : element.index;
                if (index == undefined) {
                    index = i;
                }
                var item = { index: index, language: language };
                subs_.push(item);
            }
            i++;
        });
        var turnOff = {
            index: 999,
            language: LANG.getTranslation('no_subtitles'),
            title: '',
            type: 'text/vtt',
        };
        if (subs_.length > 0) {
            subs_.splice(0, 0, turnOff);
        }
        setTextTracks(subs_);
    };
    const getAudioTracks = data => {
        if (showPreroll) {
            return;
        }
        if (GLOBAL.Device_IsWebTV && streamType == 'mpd') {
            data = player.getAudioLanguages();
        }
        if (GLOBAL.Device_IsWebTV && streamType != 'mpd') {
            data = Array.from(player.audioTracks());
        }
        var subs_ = [];
        var i = 0;
        if (data == undefined || data == null) {
            return subs_;
        }
        if (GLOBAL.Device_IsWebTV) {
            setAudioTrackIndex(0);
        }
        data.forEach(element => {
            var language = GLOBAL.Device_IsWebTV
                ? element.label
                : element.title;
            if (GLOBAL.Selected_AudioTrack == language) {
                setAudioTrackIndex(i);
            }
            if (language != '' && language != undefined) {
                language = language.replace('stereo:', '');
                language = language.replace('mono:', '');

                var index = GLOBAL.Device_IsWebTV
                    ? element.language
                    : element.index;
                if (index == undefined) {
                    index = i;
                }
                var item = { index: index, language: language };
                subs_.push(item);
            }
            i++;
        });
        setAudioTracks(subs_);
    };
    const onSaveProgress = () => {
        if (
            GLOBAL.Device_IsPwaIOS ||
            GLOBAL.Device_IsPwaIosChrome ||
            GLOBAL.Device_IsPwaIosSafari
        ) {
            return;
        }
        if (playerType == 'Movie') {
            UTILS.storeProfile(
                'movie_progress',
                content.movie_id,
                0,
                duration,
                position,
                [],
                GLOBAL.ImageUrlCMS + content.poster,
                content.name,
            );
        }
        if (playerType == 'Series') {
            UTILS.storeProfile(
                'series_progress',
                content.season_id,
                content.index,
                duration,
                position,
                content.series,
                GLOBAL.ImageUrlCMS + content.poster,
                content.name,
            );
        }
        if (playerType == 'Education') {
            UTILS.storeProfile(
                'education_progress',
                content.education_id,
                content.index,
                duration,
                position,
                content.year,
                GLOBAL.ImageUrlCMS + content.poster,
                content.name,
            );
        }
    };
    const onToggleFavorites = () => {
        if (playerType == 'Movie') {
            var isMovieFavorite = GLOBAL.Favorite_Movies.find(function (
                element,
            ) {
                return element.id == content.id;
            });
            if (isMovieFavorite != undefined) {
                sendActionReport(
                    'Remove Favorite',
                    playerType,
                    moment().unix(),
                    content.name,
                );
                var newMovies = GLOBAL.Favorite_Movies.filter(
                    c => c.id != isMovieFavorite.id,
                );
                GLOBAL.Favorite_Movies = newMovies;
                setFavorite(false);
                UTILS.storeProfile(
                    'movie_favorites',
                    0,
                    0,
                    0,
                    0,
                    GLOBAL.Favorite_Movies,
                    '',
                );
            } else {
                sendActionReport(
                    'Add Favorite',
                    playerType,
                    moment().unix(),
                    content.name,
                );
                var movie_ = {
                    poster: content.poster,
                    name: content.name,
                    year: content.year,
                    id: content.id,
                };
                GLOBAL.Favorite_Movies.push(movie_);
                setFavorite(true);
                UTILS.storeProfile(
                    'movie_favorites',
                    0,
                    0,
                    0,
                    0,
                    GLOBAL.Favorite_Movies,
                    '',
                );
            }
        }
        if (playerType == 'Series') {
            var isFavorite = GLOBAL.Favorite_Series.find(function (element) {
                return element.id == content.season_id;
            });
            if (isFavorite != undefined) {
                sendActionReport(
                    'Remove Favorite',
                    playerType,
                    moment().unix(),
                    content.name,
                );
                var newSeries = GLOBAL.Favorite_Series.filter(
                    c => c.id != isFavorite.id,
                );
                GLOBAL.Favorite_Series = newSeries;
                setFavorite(false);
                UTILS.storeProfile(
                    'series_favorites',
                    0,
                    0,
                    0,
                    0,
                    GLOBAL.Favorite_Series,
                    '',
                );
            } else {
                sendActionReport(
                    'Add Favorite',
                    playerType,
                    moment().unix(),
                    content.name,
                );
                var series_ = {
                    poster: content.poster,
                    backdrop: content.backdrop,
                    name: content.name,
                    id: content.season_id,
                };
                GLOBAL.Favorite_Series.push(series_);
                setFavorite(true);
                UTILS.storeProfile(
                    'series_favorites',
                    0,
                    0,
                    0,
                    0,
                    GLOBAL.Favorite_Series,
                    '',
                );
            }
        }

        if (playerType == 'Channel') {
            var index = GLOBAL.Favorite_Channels.findIndex(
                c => c.channel_id == content.id,
            );
            if (index > -1) {
                sendActionReport(
                    'Remove Favorite',
                    playerType,
                    moment().unix(),
                    content.name,
                );
                GLOBAL.Favorite_Channels.splice(index, 1);
                setFavorite(false);
                UTILS.storeProfile(
                    'television_favorites',
                    0,
                    0,
                    0,
                    0,
                    GLOBAL.Favorite_Channels,
                    '',
                );
            } else {
                sendActionReport(
                    'Add Favorite',
                    playerType,
                    moment().unix(),
                    content.name,
                );
                GLOBAL.Favorite_Channels.push(content.channel);
                setFavorite(true);
                UTILS.storeProfile(
                    'television_favorites',
                    0,
                    0,
                    0,
                    0,
                    GLOBAL.Favorite_Channels,
                    '',
                );
            }
        }
    };
    const onGetFavoriteStatus = () => {
        if (playerType == 'Movie') {
            var test = GLOBAL.Favorite_Movies.find(function (element) {
                return element.id == content.id;
            });
            if (test != undefined) {
                setFavorite(true);
            } else {
                setFavorite(false);
            }
        }
        if (playerType == 'Series') {
            var test = GLOBAL.Favorite_Series.find(function (element) {
                return element.id == content.id;
            });
            if (test != undefined) {
                setFavorite(true);
            } else {
                setFavorite(false);
            }
        }
        if (playerType == 'Channel') {
            var test = GLOBAL.Favorite_Channels.find(
                c => c.channel_id == content.id,
            );
            if (test != undefined) {
                setFavorite(true);
            } else {
                setFavorite(false);
            }
        }
    };
    const onLoad = data => {
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        getTextTracks(GLOBAL.Device_IsWebTV ? [] : data.textTracks);
        getAudioTracks(GLOBAL.Device_IsWebTV ? [] : data.audioTracks);

        var duration = data.duration;
        if (playerType == 'Channel') {
            duration = content.program.e - content.program.s;
            setDuration(duration);
        } else {
            setDuration(duration);
        }

        if (resume == true) {
            setResume(false);
            if (GLOBAL.Device_IsWebTV) {
                if (streamType != 'mpd') {
                    player.currentTime(content.position);
                } else {
                    video.currentTime = content.position;
                }
            } else {
                if (GLOBAL.Device_Manufacturer == 'Apple') {
                    playerRef.current.seek(content.position);
                } else {
                    setSeekPosition(content.position);
                }
            }
        }
    };
    const onBuffer = data => { };
    const onProgress = data => {
        if (showModal) {
            return;
        }
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        var position_ = data.currentTime;
        if (playerType == 'Channel' && content.interactivetv == false) {
            var extraPosition = moment().unix() - content.program.s;
            position_ = position_ + extraPosition;
        }
        if (Math.round(position_) == Math.round(duration - 6)) {
            if (playerType == 'Series' && content != undefined) {
                var newIndex = content.index + 1;
                var newIndexSeason = content.season_index + 1;
                if (
                    newIndex < content.episodes.length ||
                    newIndexSeason < content.series.season.length
                ) {
                    setNextActive(true);
                    setNextCountdown(10);
                    setTimeLeft(10);
                } else {
                    onPlayerBack();
                }
            }
            if (playerType == 'Education' && content != undefined) {
                var newIndex = content.index + 1;
                var newIndexCourse = content.course_index + 1;
                if (
                    newIndex < content.lessons.length ||
                    newIndexCourse < content.year.course.length
                ) {
                    setNextActive(true);
                    setNextCountdown(10);
                    setTimeLeft(10);
                } else {
                    onPlayerBack();
                }
            }
        }
        if (
            showPlayer == true &&
            paused == false &&
            showChannelList == false &&
            settings == false &&
            support == false
        ) {
            setPosition(position_);
        }
    };

    useEffect(() => {
        if (!timeLeft) {
            loadNext();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
            setNextCountdown(timeLeft);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const loadNext = () => {
        if (content == undefined) {
            //first startup content is empty
            return;
        }

        if (playerType == 'Series') {
            var newIndex = content.index + 1;
            if (newIndex < content.episodes.length) {
                setNextActive(false);
                /////offset.value = 0;
                setShowPlayer(true);
                setShowPlayerActive(!showPlayerActive);
                refreshPlayer(newIndex);
            } else {
                var newSeasonIndex = content.season_index + 1;
                if (newSeasonIndex < content.series.season.length) {
                    content.season = content.series.season[newSeasonIndex];
                    content.season_index = newSeasonIndex;
                    content.episodes =
                        content.series.season[newSeasonIndex].episodes;
                    if (
                        content.series.season[newSeasonIndex].episodes.length >
                        0
                    ) {
                        content.backdrop =
                            content.series.season[newSeasonIndex].backdrop;
                        setNextActive(false);
                        /////offset.value = 0;
                        setShowPlayer(true);
                        setShowPlayerActive(!showPlayerActive);
                        refreshPlayer(0);
                    } else {
                        onPlayerBack();
                    }
                } else {
                    onPlayerBack();
                }
            }
        }
        if (playerType == 'Education') {
            var newIndex = content.index + 1;
            if (newIndex < content.lessons.length) {
                setNextActive(false);
                /////offset.value = 0;
                setShowPlayer(true);
                setShowPlayerActive(!showPlayerActive);
                refreshPlayer(newIndex);
            } else {
                var newCourseIndex = content.course_index + 1;
                if (newCourseIndex < content.year.course.length) {
                    content.course = content.year.course[newSeasonIndex];
                    content.course_index = newCourseIndex;
                    content.lessons =
                        content.year.course[newSeasonIndex].episodes;
                    if (content.year.course[newCourseIndex].lesson.length > 0) {
                        content.backdrop =
                            content.year.course[newCourseIndex].backdrop;
                        setNextActive(false);
                        /////offset.value = 0;
                        setShowPlayer(true);
                        setShowPlayerActive(!showPlayerActive);
                        refreshPlayer(0);
                    } else {
                        onPlayerBack();
                    }
                } else {
                    onPlayerBack();
                }
            }
        }
    };
    const onEnd = data => {
        if (playerType == 'Channel') {
            if (showPreroll) {
                setShowPreroll(false);
            }
        }
        if (playerType == 'Movie') {
            //onPlayerBack();
        }
    };
    const onError = data => {
        if (GLOBAL.Device_IsWebTV == false) {
            if (GLOBAL.Device_System != 'Apple') {
                sendErrorReport(
                    moment().unix(),
                    data.error.errorString,
                    content.name,
                    playerType,
                );
                setError(data.error.errorString);
            } else {
                sendErrorReport(
                    moment().unix(),
                    data.error.localizedDescription,
                    content.name,
                    playerType,
                );
                setError(data.error.localizedDescription);
            }
        } else {
            var message =
                data.target.error.code == 2
                    ? 'MEDIA_ERR_NETWORK'
                    : data.target.error.code == 4
                        ? 'MEDIA_ERR_SRC_NOT_SUPPORTED'
                        : 'Unknown Error';
            sendErrorReport(moment().unix(), message, content.name, playerType);
            setError(message);
        }
        if (playerType == 'Channel') {
            retryPlaying();
        }
    };
    const retryPlaying = () => {
        showTimer.setTimeout(() => {
            setError('');
            setAllStreamValues({
                ...allStreamValues,
                url: allStreamValues.url,
                type: allStreamValues.type,
                type_google: allStreamValues.type_google,
                reportContentName: allStreamValues.reportContentName,
                contentId: allStreamValues.contentId,
                drmKey: allStreamValues.drmKey,
                drmType: allStreamValues.drmType,
                drmCertificateUrl: allStreamValues.drmCertificateUrl,
                drmLicenseServerUrl: allStreamValues.drmLicenseServerUrl,
                drmSupplierType: allStreamValues.drmSupplierType,
                externalSubtitles: allStreamValues.externalSubtitles,
                casting: allStreamValues.casting,
            });
        }, 2000);
    };
    const onScrubberDrag = value => {
        if (playerType != 'Channel' || content.interactivetv) {
            setSeek(value, true);
        }
    };

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', () => {
                setAllowBackPressed(true);
                return true;
            });
            return () => {
                BackHandler.removeEventListener(
                    'hardwareBackPress',
                    () => true,
                );
            };
        }, []),
    );

    useEffect(() => {
        if (allowBackPressed) {
            setAllowBackPressed(false);
            if (showCatchupList == true) {
                setShowCatchupList(false);
            } else if (showChannelList == true) {
                setShowChannelList(false);
            } else if (showEducationList == true) {
                setShowEducationList(false);
            } else if (showRecordingList == true) {
                setShowRecordingList(false);
            } else if (showSeasonList == true) {
                setShowSeasonList(false);
            } else if (settings == true) {
                setSettings(false);
            } else if (support == true) {
                setSupport(false);
            }
            //else if (showPlayer == true) {
            // setShowPlayer(false);
            // offset.value = 150;
            //}
            else {
                onPlayerBack();
            }
        }
    }, [allowBackPressed]);

    const onPlayerBack = () => {
        if (orientation != 'landscape') {
            StatusBar.setHidden(false);
            if (GLOBAL.Device_IsPhone) {
                Orientation.lockToPortrait();
            }
        }
        if (
            playerType == 'Movie' ||
            playerType == 'Series' ||
            playerType == 'Education'
        ) {
            onSaveProgress();
        }
        if (playerType == 'CatchupTV' && viaVia == true) {
            StatusBar.setHidden(false);
            if (GLOBAL.Device_IsPhone) {
                Orientation.lockToPortrait();
            }
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        {
                            name: 'CatchupTV',
                        },
                    ],
                }),
            );
        } else if (playerType == 'Channel' && viaVia == true) {
            StatusBar.setHidden(false);
            if (GLOBAL.Device_IsPhone) {
                Orientation.lockToPortrait();
            }
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        {
                            name: 'Channels',
                        },
                    ],
                }),
            );
        } else {
            if (routes.length > 0) {
                if (routes[0].name == 'Home' && routes.length == 2) {
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 1,
                            routes: [
                                {
                                    name: 'Home',
                                },
                            ],
                        }),
                    );
                } else {
                    if (playerType == 'Channel') {
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 1,
                                routes: [
                                    {
                                        name: 'Channels',
                                    },
                                ],
                            }),
                        );
                    } else {
                        navigation.goBack();
                    }
                }
            } else {
                navigation.goBack();
            }
        }
    };

    const renderAudio = data => {
        var isChoosen = false;
        if (data.item.language == GLOBAL.Selected_AudioTrack) {
            isChoosen = true;
        } else if (data.index == 0 && GLOBAL.Selected_AudioTrack == '') {
            isChoosen = true;
        }
        return (
            <FocusButton onPress={() => onChangeAudio(data.index, data.item)}>
                <View
                    style={{
                        flex: 1,
                        borderBottomColor: '#666',
                        borderBottomWidth: 1,
                        flexDirection: 'row',
                    }}
                >
                    <Text
                        color={isChoosen ? '#fff' : '#888'}
                        style={{ paddingLeft: 20, marginVertical: 10 }}
                    >
                        {data.item.language}
                    </Text>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}
                    >
                        {isChoosen ? (
                            <FontAwesome5
                                style={{
                                    fontSize: 16,
                                    color: '#fff',
                                    marginRight: 20,
                                }}
                                // icon={SolidIcons.check}
                                name="check"
                            />
                        ) : (
                            <View></View>
                        )}
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onChangeAudio = (index, data) => {
        sendActionReport('Change Audiotrack', playerType, moment().unix(), '');
        if (GLOBAL.Device_IsWebTV) {
            setTrack(data.language, 'audio');
        }
        setAudioTrackIndex(index);
        GLOBAL.Selected_AudioTrack = data.language;
        UTILS.storeProfile(
            'settings_audio',
            0,
            0,
            0,
            0,
            [],
            GLOBAL.Selected_AudioTrack,
        );
    };
    const renderText = data => {
        var isChoosen = false;
        if (data.item.language == GLOBAL.Selected_TextTrack) {
            isChoosen = true;
        } else if (data.index == 0 && GLOBAL.Selected_TextTrack == '') {
            isChoosen = true;
        }
        return (
            <FocusButton
                onPress={() => onChangeSubtitle(data.index, data.item)}
            >
                <View
                    style={{
                        flex: 1,
                        borderBottomColor: '#666',
                        borderBottomWidth: 1,
                        flexDirection: 'row',
                    }}
                >
                    <Text
                        color={isChoosen ? '#fff' : '#888'}
                        style={{ paddingLeft: 20, marginVertical: 10 }}
                    >
                        {data.item.language}
                    </Text>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}
                    >
                        {isChoosen ? (
                            <FontAwesome5
                                style={{
                                    fontSize: 16,
                                    color: '#fff',
                                    marginRight: 20,
                                }}
                                // icon={SolidIcons.check}
                                name="check"
                            />
                        ) : (
                            <View></View>
                        )}
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onChangeSubtitle = (index, data) => {
        sendActionReport('Change Subtitle', playerType, moment().unix(), '');
        if (GLOBAL.Device_IsWebTV) {
            var i = index - 2;
            setTrack(data.language, 'subs');
        }
        setTextTrackIndex(index - 1);
        setTextTrackType('index');
        GLOBAL.Selected_TextTrack = data.language;
        UTILS.storeProfile(
            'settings_text',
            0,
            0,
            0,
            0,
            [],
            GLOBAL.Selected_TextTrack,
        );
    };
    const renderVideo = data => {
        var isChoosen = false;
        if (data.item.type == resizeMode) {
            isChoosen = true;
        }
        return (
            <FocusButton onPress={() => onChangeVideo(data.item)}>
                <View
                    style={{
                        flex: 1,
                        borderBottomColor: '#666',
                        borderBottomWidth: 1,
                        flexDirection: 'row',
                    }}
                >
                    <Text
                        color={isChoosen ? '#fff' : '#888'}
                        style={{ paddingLeft: 20, marginVertical: 10 }}
                    >
                        {data.item.mode}
                    </Text>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}
                    >
                        {isChoosen ? (
                            <FontAwesome5
                                style={{
                                    fontSize: 16,
                                    color: '#fff',
                                    marginRight: 20,
                                }}
                                // icon={SolidIcons.check}
                                name="check"
                            />
                        ) : (
                            <View></View>
                        )}
                    </View>
                </View>
            </FocusButton>
        );
    };
    const renderReport = data => {
        return (
            <FocusButton onPress={() => onSentProblemReport(data.item)}>
                <View
                    style={{
                        flex: 1,
                        borderBottomColor: '#666',
                        borderBottomWidth: 1,
                        flexDirection: 'row',
                    }}
                >
                    <Text
                        color={'#888'}
                        style={{ paddingLeft: 20, marginVertical: 10 }}
                    >
                        {data.item.text}
                    </Text>
                </View>
            </FocusButton>
        );
    };
    const onChangeVideo = data => {
        sendActionReport('Change Screentype', playerType, moment().unix(), '');
        if (GLOBAL.Device_IsWebTV) {
            setScreenSize(data.type);
        }
        setResizeMode(data.type);
        GLOBAL.Screen_Size = data.type;
        UTILS.storeProfile(
            'settings_screen',
            0,
            0,
            0,
            0,
            [],
            GLOBAL.Screen_Size,
        );
    };
    const onSettingsClose = () => {
        setSettings(false);
    };
    const onOpenSettings = () => {
        setSettings(true);
    };
    const onOpenSupport = () => {
        setSupportSuccess(false);
        setSupport(true);
    };
    const onCloseSupport = () => {
        setSupportSuccess(false);
        setSupport(false);
    };
    const onSentProblemReport = desc => {
        sendActionReport(
            'Send Problem Report',
            playerType,
            moment().unix(),
            desc,
        );
        DAL.setProblemReportContent(playerType, content.name, content.id, desc);
        setSupportSuccess(true);
    };
    const onPlayerRewind = () => {
        sendActionReport('Rewind', playerType, moment().unix(), '');
        setSeek(-10, false);
    };
    const onPlayerForward = () => {
        sendActionReport('Foward', playerType, moment().unix(), '');
        setSeek(10, false);
    };
    const onPlayerNext = () => {
        var index = content.index + 1;
        sendActionReport('Next', playerType, moment().unix(), '');
        if (playerType == 'Channel' && channelList.length > index) {
            content.index = index;
            setPrevNextTextImage();
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
            refreshPlayer(index);
        }
        if (playerType != 'Channel') {
            content.index = index;
            setPrevNextTextImage();
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
            refreshPlayer(index);
        }
    };
    const onPlaySelected = index => {
        setShowChannelList(false);
        setShowSeasonList(false);
        setShowEducationList(false);
        setMovieList(false);
        setShowCatchupList(false);
        setShowRecordingList(false);
        refreshPlayer(index);
    };
    const onPlayerPrevious = () => {
        var index = content.index - 1;
        sendActionReport('Previous', playerType, moment().unix(), '');
        if (playerType == 'Channel' && index >= 0) {
            content.index = index;
            setPrevNextTextImage();
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
            refreshPlayer(index);
        }
        if (playerType != 'Channel' && index >= 0) {
            content.index = index;
            setPrevNextTextImage();
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
            refreshPlayer(index);
        }
    };
    const getTokenType = content => {
        if (content.akamai_token) {
            return 'Akamai';
        } else if (content.secure_stream) {
            return 'Legacy';
        } else if (content.flussonic_token) {
            return 'Flussonic';
        }
    };

    const onPlayerPause = () => {
        sendActionReport('Pause', playerType, moment().unix(), '');
        if (paused == true) {
            setPaused(false);
            if (GLOBAL.Device_IsWebTV) {
                if (streamType == 'mpd') {
                    video.play();
                } else {
                    player.play();
                }
            }
        } else {
            setPaused(true);
            if (GLOBAL.Device_IsWebTV) {
                if (streamType == 'mpd') {
                    video.pause();
                } else {
                    player.pause();
                }
            }
        }
    };

    const togglePlayer = () => {
        if (showPlayer == true) {
            if (!GLOBAL.Device_IsPortrait && !GLOBAL.Device_IsWebTV) {
                setShowPlayerActive(!showPlayerActive);
            }
        } else {
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
        }
    };
    useEffect(() => {
        const timer = setTimeout(() => {
            hidePlayer();
        }, 6000);
        return () => clearTimeout(timer);
    }, [showPlayerActive, paused]);

    const hidePlayer = () => {
        if (paused == false) {
            if (!GLOBAL.Device_IsWebTvMobile) {
                setShowPlayer(false);
            }
        }
    };
    const checkParentalCode = () => {
        if (parentalCode != GLOBAL.PIN) {
            setError(LANG.getTranslation('parental_wrong_code'));
        } else {
            setParentalSuccessFull(true);
            setShowModal(false);
            setAllStreamValues({
                ...allStreamValues,
                url: streamUrl,
                type: streamType,
                type_google: streamTypeCasting,
                reportContentName: reportContentName,
                contentId: content.name,
                drmKey: drmKey,
                drmType: drmType,
                drmCertificateUrl: drmCertificateUrl,
                drmLicenseServerUrl: drmLicenseServerUrl,
                drmSupplierType: drmSupplierType,
                externalSubtitles: [],
                casting: {
                    autoplay: true,
                    contentType: streamTypeCasting,
                    mediaInfo: {
                        contentUrl: streamUrl,
                        metadata: {
                            type: playerType == 'Channel' ? 'tvShow' : 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                            title: content.name,
                            images: [
                                {
                                    type:
                                        playerType == 'Channel'
                                            ? 'tvShow'
                                            : 'movie',
                                    url: content.image,
                                },
                            ],
                        },
                    },
                },
            });
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
            setError('');
        }
    };
    const cancelParentalCode = () => {
        setAllStreamValues({
            ...allStreamValues,
            url: 'https://',
            type: streamType,
            type_google: streamTypeCasting,
            reportContentName: reportContentName,
            contentId: content.name,
            drmKey: drmKey,
            drmType: drmType,
            drmCertificateUrl: drmCertificateUrl,
            drmLicenseServerUrl: drmLicenseServerUrl,
            drmSupplierType: drmSupplierType,
            externalSubtitles: [],
            casting: {
                autoplay: true,
                contentType: streamTypeCasting,
                mediaInfo: {
                    contentUrl: streamUrl,
                    metadata: {
                        type: playerType == 'Channel' ? 'tvShow' : 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                        title: content.name,
                        images: [
                            {
                                type:
                                    playerType == 'Channel'
                                        ? 'tvShow'
                                        : 'movie',
                                url: content.image,
                            },
                        ],
                    },
                },
            },
        });
        setError('');
        setShowModal(false);
        setShowPlayer(true);
        setShowPlayerActive(!showPlayerActive);
    };
    const refreshPlayer = newIndex => {
        if (newIndex < 0) {
            return;
        }
        setError('');
        sendReports();
        setReportStartTime(moment().unix());
        setShowTicker(false);
        setShowOverlay(false);
        setShowPreroll(false);
        if (playerType == 'Series') {
            if (content.episodes.length > newIndex && newIndex >= 0) {
                setShowSeasonList(false);
                content.id = content.episodes[newIndex].id;
                content.name =
                    'S' +
                    content.episodes[newIndex].season_number +
                    ':E' +
                    content.episodes[newIndex].episode_number +
                    ' ' +
                    content.episodes[newIndex].name;
                content.index = newIndex;
                var stream = content.episodes[newIndex].streams.find(
                    s => s.language == GLOBAL.Selected_Language,
                );
                if (stream == null) {
                    stream = content.episodes[newIndex].streams[0];
                }
                (async () => {
                    var url = await Player_Utils.setPlayerTokenType(
                        stream.url,
                        getTokenType(stream),
                    );
                    streamUrl = url;
                    streamType = Player_Utils.getStreamType(stream.url);
                    streamTypeCasting = Player_Utils.getStreamTypeCasting(
                        stream.url,
                    );
                    setPrevNextTextImage();
                    drmKey = '';
                    drmType = '';
                    drmCertificateUrl = '';
                    drmLicenseServerUrl = '';
                    drmSupplierType = '';
                    if (
                        content.season.childLock == 0 ||
                        parentalSuccessfull == true
                    ) {
                        if (
                            content.season.overlay_enabled == 1 ||
                            content.season.preroll_enabled == 1 ||
                            content.season.ticker_enabled == 1
                        ) {
                            getAdsFromServer();
                        }
                        setSeek(0, false);

                        setAllStreamValues({
                            ...allStreamValues,
                            url: streamUrl,
                            type: streamType,
                            type_google: streamTypeCasting,
                            reportContentName: 'Episode: ' + content.name,
                            contentId: content.name,
                            drmKey: drmKey,
                            drmType: drmType,
                            drmCertificateUrl: drmCertificateUrl,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmSupplierType: drmSupplierType,
                            externalSubtitles: [],
                            casting: {
                                autoplay: true,
                                contentType: streamTypeCasting,
                                mediaInfo: {
                                    contentUrl: streamUrl,
                                    metadata: {
                                        type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                        title: content.name,
                                        images: [
                                            {
                                                type: 'movie',
                                                url: content.image,
                                            },
                                        ],
                                    },
                                },
                            },
                        });

                        setPaused(false);
                    } else {
                        setShowModal(true);
                    }
                })();
            } else if (newIndex < 0) {
                if (content.season_index - 1 >= 0) {
                    setShowSeasonList(false);
                    var season =
                        content.series.season[content.season_index - 1];
                    content.season = season;
                    content.episodes = season.episodes;
                    newIndex = content.episodes.length - 1;
                    content.id = content.episodes[newIndex].id;
                    content.name =
                        'S' +
                        content.episodes[newIndex].season_number +
                        ':E' +
                        content.episodes[newIndex].episode_number +
                        ' ' +
                        content.episodes[newIndex].name;
                    content.index = newIndex;
                    var stream = content.episodes[newIndex].streams.find(
                        s => s.language == GLOBAL.Selected_Language,
                    );
                    if (stream == null) {
                        stream = content.episodes[newIndex].streams[0];
                    }
                    (async () => {
                        var url = await Player_Utils.setPlayerTokenType(
                            stream.url,
                            getTokenType(stream),
                        );
                        streamUrl = url;
                        streamType = Player_Utils.getStreamType(stream.url);
                        streamTypeCasting = Player_Utils.getStreamTypeCasting(
                            stream.url,
                        );
                        setPrevNextTextImage();
                        drmKey = '';
                        drmType = '';
                        drmCertificateUrl = '';
                        drmLicenseServerUrl = '';
                        drmSupplierType = '';
                        if (
                            content.season.childLock == 0 ||
                            parentalSuccessfull == true
                        ) {
                            if (
                                content.season.overlay_enabled == 1 ||
                                content.season.preroll_enabled == 1 ||
                                content.season.ticker_enabled == 1
                            ) {
                                getAdsFromServer();
                            }
                            setSeek(0, false);

                            setAllStreamValues({
                                ...allStreamValues,
                                url: streamUrl,
                                type: streamType,
                                type_google: streamTypeCasting,
                                reportContentName: 'Episode: ' + content.name,
                                contentId: content.name,
                                drmKey: drmKey,
                                drmType: drmType,
                                drmCertificateUrl: drmCertificateUrl,
                                drmLicenseServerUrl: drmLicenseServerUrl,
                                drmSupplierType: drmSupplierType,
                                externalSubtitles: [],
                                casting: {
                                    autoplay: true,
                                    contentType: streamTypeCasting,
                                    mediaInfo: {
                                        contentUrl: streamUrl,
                                        metadata: {
                                            type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                            title: content.name,
                                            images: [
                                                {
                                                    type: 'movie',
                                                    url: content.image,
                                                },
                                            ],
                                        },
                                    },
                                },
                            });
                            setPaused(false);
                        } else {
                            setShowModal(true);
                        }
                    })();
                }
            } else if (newIndex == content.episodes.length) {
                if (content.season_index + 1 < content.series.season.length) {
                    setShowSeasonList(false);
                    var season =
                        content.series.season[content.season_index + 1];
                    content.season = season;
                    content.episodes = season.episodes;
                    newIndex = 0;
                    content.id = content.episodes[newIndex].id;
                    content.name =
                        'S' +
                        content.episodes[newIndex].season_number +
                        ':E' +
                        content.episodes[newIndex].episode_number +
                        ' ' +
                        content.episodes[newIndex].name;
                    content.index = newIndex;
                    var stream = content.episodes[newIndex].streams.find(
                        s => s.language == GLOBAL.Selected_Language,
                    );
                    if (stream == null) {
                        stream = content.episodes[newIndex].streams[0];
                    }
                    (async () => {
                        var url = await Player_Utils.setPlayerTokenType(
                            stream.url,
                            getTokenType(stream),
                        );
                        streamUrl = url;
                        streamType = Player_Utils.getStreamType(stream.url);
                        streamTypeCasting = Player_Utils.getStreamTypeCasting(
                            stream.url,
                        );
                        setPrevNextTextImage();
                        drmKey = '';
                        drmType = '';
                        drmCertificateUrl = '';
                        drmLicenseServerUrl = '';
                        drmSupplierType = '';
                        if (
                            content.season.childLock == 0 ||
                            parentalSuccessfull == true
                        ) {
                            if (
                                content.season.overlay_enabled == 1 ||
                                content.season.preroll_enabled == 1 ||
                                content.season.ticker_enabled == 1
                            ) {
                                getAdsFromServer();
                            }
                            setSeek(0, false);

                            setAllStreamValues({
                                ...allStreamValues,
                                url: streamUrl,
                                type: streamType,
                                type_google: streamTypeCasting,
                                reportContentName: 'Episode: ' + content.name,
                                contentId: content.name,
                                drmKey: drmKey,
                                drmType: drmType,
                                drmCertificateUrl: drmCertificateUrl,
                                drmLicenseServerUrl: drmLicenseServerUrl,
                                drmSupplierType: drmSupplierType,
                                externalSubtitles: [],
                                casting: {
                                    autoplay: true,
                                    contentType: streamTypeCasting,
                                    mediaInfo: {
                                        contentUrl: streamUrl,
                                        metadata: {
                                            type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                            title: content.name,
                                            images: [
                                                {
                                                    type: 'movie',
                                                    url: content.image,
                                                },
                                            ],
                                        },
                                    },
                                },
                            });
                            setPaused(false);
                        } else {
                            setShowModal(true);
                        }
                    })();
                }
            }
        } else if (playerType == 'Education') {
            if (content.lessons.length > newIndex && newIndex >= 0) {
                setShowEducationList(false);
                content.id = content.lessons[newIndex].id;
                content.name =
                    'C' +
                    content.lessons[newIndex].course_number +
                    ':E' +
                    content.lessons[newIndex].lesson_number +
                    ' ' +
                    content.lessons[newIndex].name;
                content.index = newIndex;
                var stream = content.lessons[newIndex].streams.find(
                    s => s.language == GLOBAL.Selected_Language,
                );
                if (stream == null) {
                    stream = content.lessons[newIndex].streams[0];
                }
                (async () => {
                    var url = await Player_Utils.setPlayerTokenType(
                        stream.url,
                        getTokenType(stream),
                    );
                    streamUrl = url;
                    streamType = Player_Utils.getStreamType(stream.url);
                    streamTypeCasting = Player_Utils.getStreamTypeCasting(
                        stream.url,
                    );
                    setPrevNextTextImage();
                    drmKey = '';
                    drmType = '';
                    drmCertificateUrl = '';
                    drmLicenseServerUrl = '';
                    drmSupplierType = '';
                    if (
                        content.course.childLock == 0 ||
                        parentalSuccessfull == true
                    ) {
                        if (
                            content.course.overlay_enabled == 1 ||
                            content.course.preroll_enabled == 1 ||
                            content.course.ticker_enabled == 1
                        ) {
                            getAdsFromServer();
                        }
                        setSeek(0, false);

                        setAllStreamValues({
                            ...allStreamValues,
                            url: streamUrl,
                            type: streamType,
                            type_google: streamTypeCasting,
                            reportContentName: 'Lesson: ' + content.name,
                            contentId: content.name,
                            drmKey: drmKey,
                            drmType: drmType,
                            drmCertificateUrl: drmCertificateUrl,
                            drmLicenseServerUrl: drmLicenseServerUrl,
                            drmSupplierType: drmSupplierType,
                            externalSubtitles: [],
                            casting: {
                                autoplay: true,
                                contentType: streamTypeCasting,
                                mediaInfo: {
                                    contentUrl: streamUrl,
                                    metadata: {
                                        type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                        title: content.name,
                                        images: [
                                            {
                                                type: 'movie',
                                                url: content.image,
                                            },
                                        ],
                                    },
                                },
                            },
                        });
                        setPaused(false);
                    } else {
                        setShowModal(true);
                    }
                })();
            } else if (newIndex < 0) {
                if (content.course_index - 1 >= 0) {
                    setShowEducationList(false);
                    var course = content.year.course[content.course_index - 1];
                    content.course = course;
                    content.lessons = course.lessons;
                    newIndex = content.lessons.length - 1;
                    content.id = content.lessons[newIndex].id;
                    content.name =
                        'C' +
                        content.lessons[newIndex].course_number +
                        ':E' +
                        content.lessons[newIndex].lesson_number +
                        ' ' +
                        content.lessons[newIndex].name;
                    content.index = newIndex;
                    var stream = content.lessons[newIndex].streams.find(
                        s => s.language == GLOBAL.Selected_Language,
                    );
                    if (stream == null) {
                        stream = content.lessons[newIndex].streams[0];
                    }
                    (async () => {
                        var url = await Player_Utils.setPlayerTokenType(
                            stream.url,
                            getTokenType(stream),
                        );
                        streamUrl = url;
                        streamType = Player_Utils.getStreamType(stream.url);
                        streamTypeCasting = Player_Utils.getStreamTypeCasting(
                            stream.url,
                        );
                        setPrevNextTextImage();
                        drmKey = '';
                        drmType = '';
                        drmCertificateUrl = '';
                        drmLicenseServerUrl = '';
                        drmSupplierType = '';
                        if (
                            content.course.childLock == 0 ||
                            parentalSuccessfull == true
                        ) {
                            if (
                                content.course.overlay_enabled == 1 ||
                                content.course.preroll_enabled == 1 ||
                                content.course.ticker_enabled == 1
                            ) {
                                getAdsFromServer();
                            }
                            setSeek(0, false);

                            setAllStreamValues({
                                ...allStreamValues,
                                url: streamUrl,
                                type: streamType,
                                type_google: streamTypeCasting,
                                reportContentName: 'Lesson: ' + content.name,
                                contentId: content.name,
                                drmKey: drmKey,
                                drmType: drmType,
                                drmCertificateUrl: drmCertificateUrl,
                                drmLicenseServerUrl: drmLicenseServerUrl,
                                drmSupplierType: drmSupplierType,
                                externalSubtitles: [],
                                casting: {
                                    autoplay: true,
                                    contentType: streamTypeCasting,
                                    mediaInfo: {
                                        contentUrl: streamUrl,
                                        metadata: {
                                            type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                            title: content.name,
                                            images: [
                                                {
                                                    type: 'movie',
                                                    url: content.image,
                                                },
                                            ],
                                        },
                                    },
                                },
                            });
                            setPaused(false);
                        } else {
                            setShowModal(true);
                        }
                    })();
                }
            } else if (newIndex == content.lessons.length) {
                if (content.course_index + 1 < content.year.course.length) {
                    setShowEducationList(false);
                    var course = content.year.course[content.course_index + 1];
                    content.course = course;
                    content.lessons = course.lessons;
                    newIndex = 0;
                    content.id = content.lessons[newIndex].id;
                    content.name =
                        'C' +
                        content.lessons[newIndex].course_number +
                        ':E' +
                        content.lessons[newIndex].lesson_number +
                        ' ' +
                        content.lessons[newIndex].name;
                    content.index = newIndex;
                    var stream = content.lessons[newIndex].streams.find(
                        s => s.language == GLOBAL.Selected_Language,
                    );
                    if (stream == null) {
                        stream = content.lessons[newIndex].streams[0];
                    }
                    (async () => {
                        var url = await Player_Utils.setPlayerTokenType(
                            stream.url,
                            getTokenType(stream),
                        );
                        streamUrl = url;
                        streamType = Player_Utils.getStreamType(stream.url);
                        streamTypeCasting = Player_Utils.getStreamTypeCasting(
                            stream.url,
                        );
                        setPrevNextTextImage();
                        drmKey = '';
                        drmType = '';
                        drmCertificateUrl = '';
                        drmLicenseServerUrl = '';
                        drmSupplierType = '';
                        if (
                            content.course.childLock == 0 ||
                            parentalSuccessfull == true
                        ) {
                            if (
                                content.course.overlay_enabled == 1 ||
                                content.course.preroll_enabled == 1 ||
                                content.course.ticker_enabled == 1
                            ) {
                                getAdsFromServer();
                            }
                            setSeek(0, false);

                            setAllStreamValues({
                                ...allStreamValues,
                                url: streamUrl,
                                type: streamType,
                                type_google: streamTypeCasting,
                                reportContentName: 'Lesson: ' + content.name,
                                contentId: content.name,
                                drmKey: drmKey,
                                drmType: drmType,
                                drmCertificateUrl: drmCertificateUrl,
                                drmLicenseServerUrl: drmLicenseServerUrl,
                                drmSupplierType: drmSupplierType,
                                externalSubtitles: [],
                                casting: {
                                    autoplay: true,
                                    contentType: streamTypeCasting,
                                    mediaInfo: {
                                        contentUrl: streamUrl,
                                        metadata: {
                                            type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                            title: content.name,
                                            images: [
                                                {
                                                    type: 'movie',
                                                    url: content.image,
                                                },
                                            ],
                                        },
                                    },
                                },
                            });
                            setPaused(false);
                        } else {
                            setShowModal(true);
                        }
                    })();
                }
            }
        } else if (playerType == 'Channel') {
            if (newIndex < content.channels.length) {
                setShowChannelList(false);

                var channel = content.channels[newIndex];
                var programs = GLOBAL.EPG.find(e => e.id == channel.channel_id);
                var program = [];
                if (programs != undefined) {
                    var programs_ = programs.epgdata;
                    var currentUnix = moment().unix();
                    var currentIndex = 0;
                    currentIndex = programs_.findIndex(function (element) {
                        return (
                            element.s <= currentUnix && element.e >= currentUnix
                        );
                    });
                    program = programs_[currentIndex];
                    content.programs = programs;
                    if (program != undefined) {
                        content.sub = program.n;
                        content.extra =
                            moment
                                .unix(program.s)
                                .format('ddd ' + GLOBAL.Clock_Setting) +
                            ' - ' +
                            moment.unix(program.e).format(GLOBAL.Clock_Setting);
                        content.program = program;
                    }
                }

                content.id = channel.channel_id;
                content.channel = channel;
                content.name = channel.channel_number + '. ' + channel.name;
                content.image = GLOBAL.ImageUrlCMS + channel.icon_big;

                content.interactivetv =
                    channel.is_flussonic || channel.is_dveo ? true : false;
                content.program_index = currentIndex;
                var startTime = moment().startOf('hour').unix();
                if (program != undefined) {
                    if (program.length > 0) {
                        startTime = program.s;
                    }
                }
                var url_ = getChannelUrl(channel, startTime);
                (async () => {
                    var url = await Player_Utils.setPlayerTokenType(
                        url_,
                        getTokenType(channel),
                    );

                    if (url.indexOf('npplayout_') >= 0) {
                        //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                        var queryString = '';
                        queryString += '&ads.did=' + GLOBAL.Device_UniqueID;
                        queryString += '&ads.app_name=' + GLOBAL.IMS;
                        queryString += '&ads.app_bundle=' + GLOBAL.Package;
                        // queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                        queryString +=
                            '&ads.channel_name=' + encodeURI(channel.name);
                        queryString += '&ads.us_privacy=1---';
                        queryString += '&ads.schain=1';
                        queryString += '&ads.w=1980';
                        queryString += '&ads.h=1080';
                        url += queryString;
                    }

                    onGetFavoriteStatus();
                    setChannelIndex(newIndex);

                    if (channel.drm_stream) {
                        if (channel.drm.drm_type == 'buydrm') {
                            (async () => {
                                let drm =
                                    await Player_Utils.getDrmWidevineFairplayBuyDRMKey(
                                        url,
                                        channel,
                                    );
                                if (drm != undefined) {
                                    drmKey = drm.drmKey;
                                    drmSupplierType = 'buydrm';
                                    streamUrl = drm.url;
                                    streamType = Player_Utils.getStreamType(
                                        drm.url,
                                    );
                                    streamTypeCasting =
                                        Player_Utils.getStreamTypeCasting(
                                            drm.url,
                                        );
                                    drmLicenseServerUrl = drm.licenseServer;
                                    drmCertificateUrl = drm.certificateUrl;

                                    if (
                                        channel.childlock == 0 ||
                                        parentalSuccessfull == true
                                    ) {
                                        if (
                                            channel.overlay_enabled == 1 ||
                                            channel.preroll_enabled == 1 ||
                                            channel.ticker_enabled == 1
                                        ) {
                                            getAdsFromServer();
                                        }
                                        setAllStreamValues({
                                            ...allStreamValues,
                                            url: streamUrl,
                                            type: streamType,
                                            type_google: streamTypeCasting,
                                            reportContentName:
                                                'Channel: ' + content.name,
                                            contentId: content.name,
                                            drmKey: drmKey,
                                            drmType: drmType,
                                            drmCertificateUrl:
                                                drmCertificateUrl,
                                            drmLicenseServerUrl:
                                                drmLicenseServerUrl,
                                            drmSupplierType: drmSupplierType,
                                            externalSubtitles: [],
                                            casting: {
                                                autoplay: true,
                                                contentType: streamTypeCasting,
                                                mediaInfo: {
                                                    contentUrl: streamUrl,
                                                    metadata: {
                                                        type: 'tvShow', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                                        title: content.name,
                                                        images: [
                                                            {
                                                                type: 'tvShow',
                                                                url: content.image,
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        });
                                    } else {
                                        setShowModal(true);
                                    }
                                }
                            })();
                        } else if (channel.drm.drm_type == 'irdeto') {
                            (async () => {
                                let drm =
                                    await Player_Utils.getDrmWidevineFairplayIrdetoKey(
                                        GLOBAL.DRM_KeyServerURL,
                                        channel,
                                    );
                                if (drm != undefined) {
                                    drmSupplierType = 'irdeto';
                                    streamUrl = drm.url;
                                    streamType = Player_Utils.getStreamType(
                                        drm.url,
                                    );
                                    streamTypeCasting =
                                        Player_Utils.getStreamTypeCasting(
                                            drm.url,
                                        );
                                    drmLicenseServerUrl = drm.drmServerUrl;
                                    drmCertificateUrl = drm.certificateUrl;

                                    if (
                                        channel.childlock == 0 ||
                                        parentalSuccessfull == true
                                    ) {
                                        if (
                                            channel.overlay_enabled == 1 ||
                                            channel.preroll_enabled == 1 ||
                                            channel.ticker_enabled == 1
                                        ) {
                                            getAdsFromServer();
                                        }
                                        setAllStreamValues({
                                            ...allStreamValues,
                                            url: streamUrl,
                                            type: streamType,
                                            type_google: streamTypeCasting,
                                            reportContentName:
                                                'Channel: ' + content.name,
                                            contentId: content.name,
                                            drmKey: drmKey,
                                            drmType: drmType,
                                            drmCertificateUrl:
                                                drmCertificateUrl,
                                            drmLicenseServerUrl:
                                                drmLicenseServerUrl,
                                            drmSupplierType: drmSupplierType,
                                            externalSubtitles: [],
                                            casting: {
                                                autoplay: true,
                                                contentType: streamTypeCasting,
                                                mediaInfo: {
                                                    contentUrl: streamUrl,
                                                    metadata: {
                                                        type: 'tvShow', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                                        title: content.name,
                                                        images: [
                                                            {
                                                                type: 'tvShow',
                                                                url: content.image,
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        });
                                    } else {
                                        setShowModal(true);
                                    }
                                }
                            })();
                        }
                    } else {
                        drmKey = '';
                        drmType = '';
                        drmCertificateUrl = '';
                        drmLicenseServerUrl = '';
                        drmSupplierType = '';
                        streamUrl = url;
                        streamType = Player_Utils.getStreamType(url);
                        streamTypeCasting =
                            Player_Utils.getStreamTypeCasting(url);

                        if (
                            channel.childlock == 0 ||
                            parentalSuccessfull == true
                        ) {
                            if (
                                channel.overlay_enabled == 1 ||
                                channel.preroll_enabled == 1 ||
                                channel.ticker_enabled == 1
                            ) {
                                getAdsFromServer();
                            }
                            setAllStreamValues({
                                ...allStreamValues,
                                url: streamUrl,
                                type: streamType,
                                type_google: streamTypeCasting,
                                reportContentName: 'Channel: ' + content.name,
                                contentId: content.name,
                                drmKey: drmKey,
                                drmType: drmType,
                                drmCertificateUrl: drmCertificateUrl,
                                drmLicenseServerUrl: drmLicenseServerUrl,
                                drmSupplierType: drmSupplierType,
                                externalSubtitles: [],
                                casting: {
                                    autoplay: true,
                                    contentType: streamTypeCasting,
                                    mediaInfo: {
                                        contentUrl: streamUrl,
                                        metadata: {
                                            type: 'tvShow', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                            title: content.name,
                                            images: [
                                                {
                                                    type: 'tvShow',
                                                    url: content.image,
                                                },
                                            ],
                                        },
                                    },
                                },
                            });
                        } else {
                            setShowModal(true);
                        }
                    }
                })();
            }
        } else if (playerType == 'CatchupTV') {
            if (newIndex < content.programs.length) {
                setShowCatchupList(false);
                var current = moment().unix();
                var isLiveProgram = false;
                var program_ = content.programs[newIndex];
                if (current < program_.e) {
                    isLiveProgram = true;
                }
                content.name = program_.n;
                content.sub =
                    moment
                        .unix(program_.s)
                        .format('ddd ' + GLOBAL.Clock_Setting) +
                    ' - ' +
                    moment.unix(program_.e).format(GLOBAL.Clock_Setting);
                content.id = program_.id;
                content.index = newIndex;
                content.program_index = newIndex;
                content.image = GLOBAL.ImageUrlCMS + content.channel.icon_big;
                content.id = content.channel.channel_id;
                content.number = content.channel.channel_number;
                content.name =
                    content.channel.channel_number +
                    '. ' +
                    content.channel.name;
                var url_ = getCatchupTVUrl(
                    content.channel,
                    program_,
                    isLiveProgram,
                );
                (async () => {
                    var url = await Player_Utils.setPlayerTokenType(
                        url_,
                        getTokenType(content.channel),
                    );

                    setPrevNextTextImage();

                    if (content.channel.drm_stream) {
                        if (content.channel.drm.drm_type == 'buydrm') {
                            (async () => {
                                let drm =
                                    await Player_Utils.getDrmWidevineFairplayBuyDRMKey(
                                        url,
                                        content.channel,
                                    );
                                if (drm != undefined) {
                                    drmKey = drm.drmKey;
                                    drmSupplierType = 'buydrm';
                                    streamUrl = drm.url;
                                    streamType = Player_Utils.getStreamType(
                                        drm.url,
                                    );
                                    streamTypeCasting =
                                        Player_Utils.getStreamTypeCasting(
                                            drm.url,
                                        );
                                    drmLicenseServerUrl = drm.licenseServer;
                                    drmCertificateUrl = drm.certificateUrl;

                                    if (
                                        content.channel.childlock == 0 ||
                                        parentalSuccessfull == true
                                    ) {
                                        if (
                                            content.channel.overlay_enabled ==
                                            1 ||
                                            content.channel.preroll_enabled ==
                                            1 ||
                                            content.channel.ticker_enabled == 1
                                        ) {
                                            getAdsFromServer();
                                        }
                                        setAllStreamValues({
                                            ...allStreamValues,
                                            url: streamUrl,
                                            type: streamType,
                                            type_google: streamTypeCasting,
                                            reportContentName:
                                                'CatchupTV: ' + content.name,
                                            contentId: content.name,
                                            drmKey: drmKey,
                                            drmType: drmType,
                                            drmCertificateUrl:
                                                drmCertificateUrl,
                                            drmLicenseServerUrl:
                                                drmLicenseServerUrl,
                                            drmSupplierType: drmSupplierType,
                                            externalSubtitles: [],
                                            casting: {
                                                autoplay: true,
                                                contentType: streamTypeCasting,
                                                mediaInfo: {
                                                    contentUrl: streamUrl,
                                                    metadata: {
                                                        type: 'tvShow', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                                        title: content.name,
                                                        images: [
                                                            {
                                                                type: 'tvShow',
                                                                url: content.image,
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        });
                                        setPaused(false);
                                    } else {
                                        setShowModal(true);
                                    }
                                }
                            })();
                        } else if (content.channel.drm.drm_type == 'irdeto') {
                            (async () => {
                                let drm =
                                    await Player_Utils.getDrmWidevineFairplayIrdetoKey(
                                        GLOBAL.DRM_KeyServerURL,
                                        content.channel,
                                    );
                                if (drm != undefined) {
                                    drmSupplierType = 'irdeto';
                                    streamUrl = drm.url;
                                    streamType = Player_Utils.getStreamType(
                                        drm.url,
                                    );
                                    streamTypeCasting =
                                        Player_Utils.getStreamTypeCasting(
                                            drm.url,
                                        );
                                    drmLicenseServerUrl = drm.drmServerUrl;
                                    drmCertificateUrl = drm.certificateUrl;

                                    if (
                                        content.channel.childlock == 0 ||
                                        parentalSuccessfull == true
                                    ) {
                                        if (
                                            content.channel.overlay_enabled ==
                                            1 ||
                                            content.channel.preroll_enabled ==
                                            1 ||
                                            content.channel.ticker_enabled == 1
                                        ) {
                                            getAdsFromServer();
                                        }
                                        setAllStreamValues({
                                            ...allStreamValues,
                                            url: streamUrl,
                                            type: streamType,
                                            type_google: streamTypeCasting,
                                            reportContentName:
                                                'CatchupTV: ' + content.name,
                                            contentId: content.name,
                                            drmKey: drmKey,
                                            drmType: drmType,
                                            drmCertificateUrl:
                                                drmCertificateUrl,
                                            drmLicenseServerUrl:
                                                drmLicenseServerUrl,
                                            drmSupplierType: drmSupplierType,
                                            externalSubtitles: [],
                                            casting: {
                                                autoplay: true,
                                                contentType: streamTypeCasting,
                                                mediaInfo: {
                                                    contentUrl: streamUrl,
                                                    metadata: {
                                                        type: 'tvShow', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                                        title: content.name,
                                                        images: [
                                                            {
                                                                type: 'tvShow',
                                                                url: content.image,
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        });
                                        setPaused(false);
                                    } else {
                                        setShowModal(true);
                                    }
                                }
                            })();
                        }
                    } else {
                        drmKey = '';
                        drmType = '';
                        drmCertificateUrl = '';
                        drmLicenseServerUrl = '';
                        drmSupplierType = '';
                        streamUrl = url;
                        streamType = Player_Utils.getStreamType(url_);
                        streamTypeCasting =
                            Player_Utils.getStreamTypeCasting(url_);

                        if (
                            content.channel.childlock == 0 ||
                            parentalSuccessfull == true
                        ) {
                            if (
                                content.channel.overlay_enabled == 1 ||
                                content.channel.preroll_enabled == 1 ||
                                content.channel.ticker_enabled == 1
                            ) {
                                getAdsFromServer();
                            }
                            setAllStreamValues({
                                ...allStreamValues,
                                url: streamUrl,
                                type: streamType,
                                type_google: streamTypeCasting,
                                reportContentName: 'CatchupTV: ' + content.name,
                                contentId: content.name,
                                drmKey: drmKey,
                                drmType: drmType,
                                drmCertificateUrl: drmCertificateUrl,
                                drmLicenseServerUrl: drmLicenseServerUrl,
                                drmSupplierType: drmSupplierType,
                                externalSubtitles: [],
                                casting: {
                                    autoplay: true,
                                    contentType: streamTypeCasting,
                                    mediaInfo: {
                                        contentUrl: streamUrl,
                                        metadata: {
                                            type: 'tvShow', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                            title: content.name,
                                            images: [
                                                {
                                                    type: 'tvShow',
                                                    url: content.image,
                                                },
                                            ],
                                        },
                                    },
                                },
                            });
                            setPaused(false);
                        } else {
                            setShowModal(true);
                        }
                    }
                })();
            }
        } else if (playerType == 'Movie') {
            var movieIn = content.movies[newIndex];
            setMovieList(false);
            (async () => {
                var res = await getMovieDetails(movieIn.id);
                if (res.success) {
                    var movie = res.movie;
                    var stream = movie.moviestreams.find(
                        s => s.language == GLOBAL.Selected_Language,
                    );
                    if (stream == null) {
                        stream = movie.moviestreams[0];
                    }
                    if (stream != null) {
                        (async () => {
                            streamUrl = await Player_Utils.setPlayerTokenType(
                                stream.url,
                                getTokenType(stream),
                            );
                            streamType = Player_Utils.getStreamType(stream.url);
                            streamTypeCasting =
                                Player_Utils.getStreamTypeCasting(stream.url);
                            // setAdsOverlay(movie.has_overlaybanner);
                            // setAdsPreroll(movie.has_preroll);
                            // setAdsTicker(movie.has_ticker);
                            //setVastUrl('');
                            content.id = movie.id;
                            content.name = movie.name;
                            content.backdrop = movie.backdrop;
                            content.poster = movie.poster;
                            content.year = movie.year;
                            content.movie_id = movie.id;
                            content.position = position;
                            drmKey = '';
                            drmType = '';
                            drmCertificateUrl = '';
                            drmLicenseServerUrl = '';
                            drmSupplierType = '';
                            if (movie.childLock == 0) {
                                if (
                                    movie.overlay_enabled == 1 ||
                                    movie.preroll_enabled == 1 ||
                                    movie.ticker_enabled == 1
                                ) {
                                    getAdsFromServer();
                                }
                                setSeek(0, false);

                                onGetFavoriteStatus();
                                setAllStreamValues({
                                    ...allStreamValues,
                                    url: streamUrl,
                                    type: streamType,
                                    type_google: streamTypeCasting,
                                    reportContentName: 'Movie: ' + content.name,
                                    contentId: content.name,
                                    drmKey: drmKey,
                                    drmType: drmType,
                                    drmCertificateUrl: drmCertificateUrl,
                                    drmLicenseServerUrl: drmLicenseServerUrl,
                                    drmSupplierType: drmSupplierType,
                                    externalSubtitles: [],
                                    casting: {
                                        autoplay: true,
                                        contentType: streamTypeCasting,
                                        mediaInfo: {
                                            contentUrl: streamUrl,
                                            metadata: {
                                                type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                                title: content.name,
                                                images: [
                                                    {
                                                        type: 'movie',
                                                        url: content.image,
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                });
                                setPaused(false);
                            } else {
                                setShowModal(true);
                            }
                        })();
                    } else {
                        onPlayerBack();
                    }
                }
            })();
        } else if (playerType == 'Recording') {
            var recording = content.recordings[newIndex];
            var channel = UTILS.getChannelSelectedByName(
                recording.channel_name,
            );
            if (channel != null) {
                (async () => {
                    content.id = recording.id;
                    content.name = recording.program_name;
                    content.image = GLOBAL.ImageUrlCMS + recording.channel_icon;
                    content.sub = recording.program_name;
                    content.name = recording.channel_name;
                    content.extra =
                        moment
                            .unix(recording.ut_start)
                            .format('ddd ' + GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment
                            .unix(recording.ut_end)
                            .format(GLOBAL.Clock_Setting);

                    if (channel.drm_stream) {
                        if (channel.drm.drm_type == 'buydrm') {
                            (async () => {
                                let drm =
                                    await Player_Utils.getDrmWidevineFairplayBuyDRMKey(
                                        recording.url,
                                        channel,
                                    );
                                if (drm != undefined) {
                                    drmKey = drm.drmKey;
                                    drmSupplierType = 'buydrm';
                                    streamUrl =
                                        await Player_Utils.setPlayerTokenType(
                                            drm.url,
                                            getTokenType(channel),
                                        );
                                    streamType = Player_Utils.getStreamType(
                                        drm.url,
                                    );
                                    streamTypeCasting =
                                        Player_Utils.getStreamTypeCasting(
                                            drm.url,
                                        );
                                    drmLicenseServerUrl = drm.licenseServer;
                                    drmCertificateUrl = drm.certificateUrl;

                                    if (channel.childlock == 0) {
                                        if (
                                            channel.overlay_enabled == 1 ||
                                            channel.preroll_enabled == 1 ||
                                            channel.ticker_enabled == 1
                                        ) {
                                            getAdsFromServer();
                                        }
                                        setAllStreamValues({
                                            ...allStreamValues,
                                            url: streamUrl,
                                            type: streamType,
                                            type_google: streamTypeCasting,
                                            reportContentName:
                                                'Recording: ' +
                                                recording.program_name,
                                            contentId: content.name,
                                            drmKey: drmKey,
                                            drmType: drmType,
                                            drmCertificateUrl:
                                                drmCertificateUrl,
                                            drmLicenseServerUrl:
                                                drmLicenseServerUrl,
                                            drmSupplierType: drmSupplierType,
                                            externalSubtitles: [],
                                            casting: {
                                                autoplay: true,
                                                contentType: streamTypeCasting,
                                                mediaInfo: {
                                                    contentUrl: streamUrl,
                                                    metadata: {
                                                        type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                                        title: content.name,
                                                        images: [
                                                            {
                                                                type: 'movie',
                                                                url: content.image,
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        });
                                        setPaused(false);
                                    } else {
                                        setShowModal(true);
                                    }
                                }
                            })();
                        } else if (channel.drm.drm_type == 'irdeto') {
                            (async () => {
                                let drm =
                                    await Player_Utils.getDrmWidevineFairplayIrdetoKey(
                                        GLOBAL.DRM_KeyServerURL,
                                        channel,
                                    );
                                if (drm != undefined) {
                                    drmSupplierType = 'irdeto';
                                    streamUrl =
                                        await Player_Utils.setPlayerTokenType(
                                            drm.url,
                                            getTokenType(channel),
                                        );
                                    streamType = Player_Utils.getStreamType(
                                        drm.url,
                                    );
                                    streamTypeCasting =
                                        Player_Utils.getStreamTypeCasting(
                                            drm.url,
                                        );
                                    drmLicenseServerUrl = drm.drmServerUrl;
                                    drmCertificateUrl = drm.certificateUrl;

                                    if (channel.childlock == 0) {
                                        if (
                                            channel.overlay_enabled == 1 ||
                                            channel.preroll_enabled == 1 ||
                                            channel.ticker_enabled == 1
                                        ) {
                                            getAdsFromServer();
                                        }
                                        setAllStreamValues({
                                            ...allStreamValues,
                                            url: streamUrl,
                                            type: streamType,
                                            type_google: streamTypeCasting,
                                            reportContentName:
                                                'Recording: ' +
                                                recording.program_name,
                                            contentId: content.name,
                                            drmKey: drmKey,
                                            drmType: drmType,
                                            drmCertificateUrl:
                                                drmCertificateUrl,
                                            drmLicenseServerUrl:
                                                drmLicenseServerUrl,
                                            drmSupplierType: drmSupplierType,
                                            externalSubtitles: [],
                                            casting: {
                                                autoplay: true,
                                                contentType: streamTypeCasting,
                                                mediaInfo: {
                                                    contentUrl: streamUrl,
                                                    metadata: {
                                                        type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                                        title: content.name,
                                                        images: [
                                                            {
                                                                type: 'movie',
                                                                url: content.image,
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        });
                                        setPaused(false);
                                    } else {
                                        setShowModal(true);
                                    }
                                }
                            })();
                        }
                    } else {
                        drmKey = '';
                        drmType = '';
                        drmCertificateUrl = '';
                        drmLicenseServerUrl = '';
                        drmSupplierType = '';
                        streamUrl = await Player_Utils.setPlayerTokenType(
                            recording.url,
                            getTokenType(channel),
                        );
                        streamType = Player_Utils.getStreamType(recording.url);
                        streamTypeCasting = Player_Utils.getStreamTypeCasting(
                            recording.url,
                        );

                        if (channel.childlock == 0) {
                            if (
                                channel.overlay_enabled == 1 ||
                                channel.preroll_enabled == 1 ||
                                channel.ticker_enabled == 1
                            ) {
                                getAdsFromServer();
                            }
                            setAllStreamValues({
                                ...allStreamValues,
                                url: streamUrl,
                                type: streamType,
                                type_google: streamTypeCasting,
                                reportContentName:
                                    'Recording: ' + recording.program_name,
                                contentId: content.name,
                                drmKey: drmKey,
                                drmType: drmType,
                                drmCertificateUrl: drmCertificateUrl,
                                drmLicenseServerUrl: drmLicenseServerUrl,
                                drmSupplierType: drmSupplierType,
                                externalSubtitles: [],
                                casting: {
                                    autoplay: true,
                                    contentType: streamTypeCasting,
                                    mediaInfo: {
                                        contentUrl: streamUrl,
                                        metadata: {
                                            type: 'movie', //"generic" | "movie" | "musicTrack" | "photo" | "tvShow" | "user"
                                            title: content.name,
                                            images: [
                                                {
                                                    type: 'movie',
                                                    url: content.image,
                                                },
                                            ],
                                        },
                                    },
                                },
                            });
                            setPaused(false);
                        } else {
                            setShowModal(true);
                        }
                    }
                })();
            }
        }
    };
    const getMovieDetails = async movie_id => {
        try {
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                movie_id +
                '_movie_details_v2.json';
            console.log('get movie details: ', path);
            let response = await fetch(path);
            let data = await response.json();
            console.log('get movie details: ', data);
            return { success: true, movie: data };
        } catch (error) {
            return { success: false };
        }
    };
    const getCatchupTVUrl = (channel, program, frompauseplay) => {
        var url_ = '';
        var url = '';
        if (GLOBAL.Device_IsSmartTV) {
            url = channel.tizen_webos;
        } else if (
            GLOBAL.Device_Manufacturer == 'Apple' ||
            GLOBAL.Device_IsPwaIOS
        ) {
            url = channel.ios_tvos;
        } else {
            url = channel.url_high;
        }
        var startTime = program.s;
        //dveo
        if (channel.is_dveo == 1) {
            if (channel.url_interactivetv != null) {
                const urlInteractive = channel.url_interactivetv
                    .toString()
                    .replace(GLOBAL.HTTPvsHTTPS + '', '')
                    .toString()
                    .replace('https://', '');
                var splitUrl = urlInteractive.toString().split('/');
                var http = GLOBAL.HTTPvsHTTPS;
                if (channel.url_interactivetv.indexOf('https://') > 0) {
                    http = 'https://';
                }
                url =
                    http +
                    '' +
                    splitUrl[0] +
                    '/-' +
                    (moment().unix() - startTime) +
                    '-/' +
                    splitUrl[1] +
                    '/' +
                    splitUrl[2] +
                    '/' +
                    splitUrl[3] +
                    '/' +
                    splitUrl[4];
            }
        }
        //flussonic
        if (channel.is_flussonic == 1) {
            var length = program.e - program.s;
            if (channel.url_interactivetv != null) {
                if (channel.url_interactivetv.indexOf('.mpd') > 0) {
                    url =
                        channel.url_interactivetv
                            .toString()
                            .replace('Manifest.mpd', '')
                            .replace('index.mpd', '') +
                        'index-' +
                        startTime +
                        '-' +
                        (frompauseplay == true ? 'now' : length) +
                        '.mpd?ignore_gaps=true';
                } else {
                    url =
                        channel.url_interactivetv
                            .toString()
                            .replace('mono.m3u8', '')
                            .toString()
                            .replace('index.m3u8', '') +
                        'index-' +
                        startTime +
                        '-' +
                        (frompauseplay == true ? 'now' : length) +
                        '.m3u8?ignore_gaps=true';
                }
            } else {
                if (url.indexOf('.mpd') > 0) {
                    url =
                        url
                            .toString()
                            .replace('Manifest.mpd', '')
                            .replace('index.mpd', '') +
                        'index-' +
                        startTime +
                        '-' +
                        (frompauseplay == true ? 'now' : length) +
                        '.mpd?ignore_gaps=true';
                } else {
                    url =
                        url
                            .toString()
                            .replace('mono.m3u8', '')
                            .toString()
                            .replace('index.m3u8', '') +
                        'index-' +
                        startTime +
                        '-' +
                        (frompauseplay == true ? 'now' : length) +
                        '.m3u8?ignore_gaps=true';
                }
            }
        }
        return url;
    };
    const getChannelUrl = (channel, startTime) => {
        var url = '';
        if (GLOBAL.Device_IsSmartTV) {
            if (channel.is_flussonic == 1) {
                if (channel.tizen_webos.indexOf('index.mpd') > -1) {
                    var replacePart = 'index-' + startTime + '-now.mpd';
                    url = channel.tizen_webos.replace('index.mpd', replacePart);
                }
                if (channel.tizen_webos.indexOf('index.m3u8') > -1) {
                    var replacePart = 'index-' + startTime + '-now.m3u8';
                    url = channel.tizen_webos.replace(
                        'index.m3u8',
                        replacePart,
                    );
                }
                if (channel.tizen_webos.indexOf('video.m3u8') > -1) {
                    var replacePart = 'video-' + startTime + '-now.m3u8';
                    url = channel.tizen_webos.replace(
                        'video.m3u8',
                        replacePart,
                    );
                }
                if (channel.tizen_webos.indexOf('mono.m3u8') > -1) {
                    var replacePart = 'mono-' + startTime + '-now.m3u8';
                    url = channel.tizen_webos.replace('mono.m3u8', replacePart);
                }
            } else {
                url = channel.tizen_webos;
            }
        } else if (
            GLOBAL.Device_Manufacturer == 'Apple' ||
            GLOBAL.Device_IsPwaIOS
        ) {
            if (channel.is_flussonic == 1) {
                if (channel.ios_tvos.indexOf('index.m3u8') > -1) {
                    var replacePart = 'index-' + startTime + '-now.m3u8';
                    url = channel.ios_tvos.replace('index.m3u8', replacePart);
                }
                if (channel.ios_tvos.indexOf('video.m3u8') > -1) {
                    var replacePart = 'video-' + startTime + '-now.m3u8';
                    url = channel.ios_tvos.replace('video.m3u8', replacePart);
                }
                if (channel.ios_tvos.indexOf('mono.m3u8') > -1) {
                    var replacePart = 'mono-' + startTime + '-now.m3u8';
                    url = channel.ios_tvos.replace('mono.m3u8', replacePart);
                }
            } else {
                url = channel.ios_tvos;
            }
        } else {
            if (channel.is_flussonic == 1) {
                if (channel.url_high.indexOf('index.mpd') > -1) {
                    var replacePart = 'index-' + startTime + '-now.mpd';
                    url = channel.url_high.replace('index.mpd', replacePart);
                }
                if (channel.url_high.indexOf('index.m3u8') > -1) {
                    var replacePart = 'index-' + startTime + '-now.m3u8';
                    url = channel.url_high.replace('index.m3u8', replacePart);
                }
                if (channel.url_high.indexOf('video.m3u8') > -1) {
                    var replacePart = 'video-' + startTime + '-now.m3u8';
                    url = channel.url_high.replace('video.m3u8', replacePart);
                }
                if (channel.url_high.indexOf('mono.m3u8') > -1) {
                    var replacePart = 'mono-' + startTime + '-now.m3u8';
                    url = channel.url_high.replace('mono.m3u8', replacePart);
                }
            } else {
                url = channel.url_high;
            }
        }
        return url;
    };
    const setPrevNextTextImage = () => {
        if (playerType == 'Series') {
            if (content.episodes.length > content.index + 1) {
                setNextText(
                    'S' +
                    content.episodes[content.index + 1].season_number +
                    ':E' +
                    content.episodes[content.index + 1].episode_number +
                    ' ' +
                    content.episodes[content.index + 1].name,
                );
            } else {
                if (
                    content.series.season[content.season_index + 1] != undefined
                ) {
                    setNextText(
                        'S' +
                        content.series.season[content.season_index + 1]
                            .episodes[0].season_number +
                        ':E' +
                        content.series.season[content.season_index + 1]
                            .episodes[0].episode_number +
                        ' ' +
                        content.series.season[content.season_index + 1]
                            .episodes[0].name,
                    );
                } else {
                    setNextText('');
                }
            }
            if (content.index - 1 >= 0) {
                setPrevText(
                    'S' +
                    content.episodes[content.index - 1].season_number +
                    ':E' +
                    content.episodes[content.index - 1].episode_number +
                    ' ' +
                    content.episodes[content.index - 1].name,
                );
            } else {
                if (content.season_index - 1 >= 0) {
                    var seasons =
                        content.series.season[content.season_index - 1];
                    var episode = seasons.episodes[seasons.episodes.length - 1];
                    setPrevText(
                        'S' +
                        episode.season_number +
                        ':E' +
                        episode.episode_number +
                        ' ' +
                        episode.name,
                    );
                } else {
                    setPrevText('');
                }
            }
        }
        if (playerType == 'Education') {
            if (content.lessons.length > content.index + 1) {
                setNextText(
                    'C' +
                    content.lessons[content.index + 1].course_number +
                    ':E' +
                    content.lessons[content.index + 1].lesson_number +
                    ' ' +
                    content.lessons[content.index + 1].name,
                );
            } else {
                setNextText('');
            }
            if (content.index - 1 >= 0) {
                setPrevText(
                    'C' +
                    content.lessons[content.index - 1].course_number +
                    ':E' +
                    content.lessons[content.index - 1].lesson_number +
                    ' ' +
                    content.lessons[content.index - 1].name,
                );
            } else {
                setPrevText('');
            }
        }
        if (playerType == 'CatchupTV') {
            if (content.programs.length > content.index + 1) {
                var program = content.programs[content.index + 1];
                var current = moment().unix();
                if (program.s < current && program.e < current) {
                    setNextText(
                        program.n +
                        '\n ' +
                        moment
                            .unix(program.s)
                            .format(GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment.unix(program.e).format(GLOBAL.Clock_Setting),
                    );
                } else if (program.s < current && program.e > current) {
                    setNextText(
                        program.n +
                        '\n ' +
                        moment
                            .unix(program.s)
                            .format(GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment.unix(program.e).format(GLOBAL.Clock_Setting),
                    );
                }
            }
            if (content.index - 1 >= 0) {
                if (content.programs[content.index - 1] != undefined) {
                    var program = content.programs[content.index - 1];
                    setPrevText(
                        program.n +
                        '\n ' +
                        moment
                            .unix(program.s)
                            .format(GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment.unix(program.e).format(GLOBAL.Clock_Setting),
                    );
                }
            }
        }
        if (playerType == 'Channel') {
            if (content.channels.length > content.index + 1) {
                if (content.channels[content.index + 1] != undefined) {
                    setNextImage(
                        GLOBAL.ImageUrlCMS +
                        content.channels[content.index + 1].icon_big,
                    );
                    setNextText(content.channels[content.index + 1].name);
                }
            }
            if (content.index - 1 >= 0) {
                if (content.channels[content.index - 1] != undefined) {
                    setPrevImage(
                        GLOBAL.ImageUrlCMS +
                        content.channels[content.index - 1].icon_big,
                    );
                    setPrevText(content.channels[content.index - 1].name);
                }
            }
        }
    };
    const LockIcon = props => (
        <Icon {...props} fill="#fff" name="lock-outline" />
    );
    const onPlayCatchupTV = () => {
        sendActionReport(
            'Switch to CatchupTV',
            playerType,
            moment().unix(),
            '',
        );
        var channels = UTILS.getCatchupChannels();
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    {
                        name: 'Player_CatchupTV',
                        params: {
                            index: content.program_index,
                            program: content.program,
                            programs: content.programs.epgdata,
                            channel: content.channel,
                            orientation: 'landscape',
                            channels: channels,
                            viaVia: true,
                        },
                    },
                ],
            }),
        );
    };
    const onPlayLiveTV = () => {
        sendActionReport('Switch to Channels', playerType, moment().unix(), '');
        var categoriesIn = [];
        GLOBAL.Channels.forEach((category, index) => {
            var categoryOut = {
                name: category.name,
                id: category.id,
                length: category.channels.length,
            };
            categoriesIn.push(categoryOut);
        });
        var category = GLOBAL.Channels[GLOBAL.Channels_Selected_Category_Index];
        GLOBAL.Channels_Selected = category.channels;
        var index = GLOBAL.Channels_Selected.findIndex(
            c => c.channel_id == content.channel.channel_id,
        );
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [
                    {
                        name: 'Player_Channels',
                        params: {
                            index: index,
                            channels: GLOBAL.Channels_Selected,
                            channel: content.channel,
                            categories: categoriesIn,
                            category_index: categoryIndex,
                            orientation: 'landscape',
                            viaVia: true,
                        },
                    },
                ],
            }),
        );
    };
    const onOpenChannelList = () => {
        sendActionReport('Open Player Menu', playerType, moment().unix(), '');
        setShowChannelList(true);
    };
    const onCloseChannelList = () => {
        setShowChannelList(false);
    };
    const onOpenSeasonList = () => {
        sendActionReport('Open Player Menu', playerType, moment().unix(), '');
        setPaused(true);
        setShowSeasonList(true);
    };
    const onCloseSeasonList = () => {
        setPaused(false);
        setShowSeasonList(false);
    };
    const onOpenEducationList = () => {
        sendActionReport('Open Player Menu', playerType, moment().unix(), '');
        setPaused(true);
        setShowEducationList(true);
    };
    const onCloseEducationList = () => {
        setPaused(false);
        setShowEducationList(false);
    };
    const onOpenCatchupTVList = () => {
        sendActionReport('Open Player Menu', playerType, moment().unix(), '');
        setPaused(true);
        setShowCatchupList(true);
    };
    const onCloseCatchupTVList = () => {
        setPaused(false);
        setShowCatchupList(false);
    };
    const onOpenMoviesList = () => {
        sendActionReport('Open Player Menu', playerType, moment().unix(), '');
        setPaused(true);
        setMovieList(true);
    };
    const onCloseMoviesList = () => {
        setPaused(false);
        setMovieList(false);
    };
    const onOpenRecordingList = () => {
        sendActionReport('Open Player Menu', playerType, moment().unix(), '');
        setPaused(true);
        setShowRecordingList(true);
    };
    const onCloseRecordingList = () => {
        setPaused(false);
        setShowRecordingList(false);
    };
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
                            'Channels',
                            moment().unix(),
                            splitInput[0],
                        );
                        setShowVoiceEnabled(false);
                        setSearchTerm(splitInput[0].toLowerCase());
                        setExtraSearchResults(extraSearch);
                        onSearchChannels(splitInput[0].toLowerCase());
                    });
                }
            } catch (e) { }
        }
    };
    const onSearchExtra = searchTerm => {
        setSearchTerm(searchTerm);
        onSearchChannels(searchTerm);
    };
    const onSearchChannels = searchTerm => {
        var channelList_ = channelListSearch.filter(
            c => c.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1,
        );
        var channel = channelList_[0];
        setSearchTerm(searchTerm.toLowerCase());
        setChannelList(channelList_);
        setChannelSelected(channel);
        setProgramIndex(0);
        setChannelIndex(0);
        setEpgList([]);

        if (channel != undefined) {
            var epg = GLOBAL.EPG.find(c => c.id == channel.channel_id);
            if (epg != undefined) {
                var currentTime = moment().unix();
                var programIndex = epg.epgdata.findIndex(
                    e => e.s <= currentTime && e.e >= currentTime,
                );
                setProgramIndex(programIndex);
                setEpgList(epg.epgdata);
            }
        }
    };
    const getTvProgram = channel => {
        var currentUnix = moment().unix();
        var epg_check = GLOBAL.EPG.find(e => e.id == channel.channel_id);
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
                            (GLOBAL.Device_IsPhone
                                ? sizes.height * 0.21
                                : sizes.width * 0.32) * percentageProgram,
                    }}
                ></View>
                <Text shadow numberOfLines={1}>
                    {time}
                </Text>
            </View>
        );
    };
    const onGetPrograms = (channel, index) => {
        var epg = GLOBAL.EPG.find(c => c.id == channel.channel_id);
        if (epg != undefined) {
            if (epg.epgdata != undefined) {
                var currentTime = moment().unix();
                var programIndex = epg.epgdata.findIndex(
                    e => e.s <= currentTime && e.e >= currentTime,
                );
                setProgramIndex(programIndex);
                setEpgList(epg.epgdata);
            }
        }
        setChannelSelected(channel);
        setChannelIndex(index);
    };
    const renderChannel = ({ item, index }) => {
        return (
            <FocusButton
                style={{
                    borderRadius: 5,
                    height: GLOBAL.Device_IsPhone
                        ? sizes.height * 0.15
                        : sizes.width * 0.09,
                }}
                onPress={() => onGetPrograms(item, index)}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        margin: 5,
                        borderRadius: 5,
                        borderColor: '#333',
                        borderWidth: 3,
                        backgroundColor: '#222',
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#444',
                            paddingHorizontal: 10,
                            justifyContent: 'center',
                        }}
                    >
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.icon_big }}
                            style={{
                                margin: 10,
                                width: GLOBAL.Device_IsPhone
                                    ? sizes.height * 0.07
                                    : sizes.width * 0.07,
                                height: GLOBAL.Device_IsPhone
                                    ? sizes.height * 0.07
                                    : sizes.width * 0.07,
                            }}
                        ></Image>
                    </View>
                    <View style={{ flex: 1, padding: 10 }}>
                        <Text h5 bold shadow numberOfLines={1}>
                            {item.channel_number} {item.name}
                        </Text>
                        {getTvProgram(item)}
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onGetChannels = index => {
        var channels = GLOBAL.Channels[index].channels;
        var id = GLOBAL.Channels[index].id;

        if (channels != undefined && channels.length > 0) {
            setChannelIndex(0);
            setChannelList(channels);
            setChannelListSearch(content.channels);
            setCategoryIndex(index);
            GLOBAL.Channels_Selected_Category_Index =
                UTILS.getCategoryIndex(id);
            GLOBAL.Channels_Selected_Category_ID = id;
            GLOBAL.Channels_Selected = channels;
            var channel = channels[0];
            if (channel != undefined) {
                var epg = GLOBAL.EPG.find(c => c.id == channel.channel_id);
                if (epg != undefined) {
                    var currentTime = moment().unix();
                    var programIndex = epg.epgdata.findIndex(
                        e => e.s <= currentTime && e.e >= currentTime,
                    );
                    setProgramIndex(programIndex);
                    setChannelSelected(channel);
                    setEpgList(epg.epgdata);
                }
            }
        }
    };
    const renderCategories = ({ item, index }) => {
        return (
            <FocusButton onPress={() => onGetChannels(index)}>
                <View
                    style={{
                        paddingHorizontal: 5,
                        paddingVertical: 10,
                        backgroundColor: '#222',
                        margin: 2,
                        paddingLeft: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                    }}
                >
                    <Text bold numberOfLines={1} style={{ width: '85%' }}>
                        {item.name} ({item.length})
                    </Text>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}
                    >
                        {categoryIndex == index ? (
                            <FontAwesome5
                                style={{
                                    fontSize: 16,
                                    color: '#fff',
                                    marginRight: 10,
                                }}
                                // icon={SolidIcons.check}
                                name="check"
                            />
                        ) : (
                            <View></View>
                        )}
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onGetPlaySelected = (
        isPast,
        isFuture,
        isLive,
        item,
        index,
        interactive,
    ) => {
        sendReports();
        setReportStartTime(moment().unix());
        if (isPast && interactive) {
            //catchup
            var channels = UTILS.getCatchupChannels();
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [
                        {
                            name: 'Player_CatchupTV',
                            params: {
                                index: index,
                                program: item,
                                programs: epgList,
                                channel: channelSelected,
                                channels: channels,
                                orientation: 'landscape',
                                viaVia: true,
                            },
                        },
                    ],
                }),
            );
        } else if (isFuture && interactive) {
            //record
            if (GLOBAL.UserInterface.general.enable_recordings == true) {
                onRecordProgram(item);
            }
        } else if (isLive) {
            //change channel
            GLOBAL.Channels_Selected = channelList;
            GLOBAL.Channels_Selected_Category_Index = categoryIndex;
            content.index = channelIndex;
            content.channels = channelList;
            setPrevNextTextImage();
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
            refreshPlayer(channelIndex);
        } else {
            //change channel
            GLOBAL.Channels_Selected = channelList;
            GLOBAL.Channels_Selected_Category_Index = categoryIndex;
            content.index = channelIndex;
            content.channels = channelList;
            setPrevNextTextImage();
            /////offset.value = 0;
            setShowPlayer(true);
            setShowPlayerActive(!showPlayerActive);
            refreshPlayer(channelIndex);
        }
    };
    const renderProgram = ({ item, index }) => {
        var current = moment().unix();
        var interactive = false;
        if (channelSelected.is_flussonic == 1 || channelSelected.is_dveo == 1) {
            interactive = true;
        }
        var past = false;
        var future = false;
        var now = false;
        if (item.e < current && interactive) {
            past = true;
        }
        if (item.s > current && interactive) {
            future = true;
        }
        if (item.s < current && item.e > current) {
            now = true;
        }
        return (
            <FocusButton
                style={{
                    height: GLOBAL.Device_IsPhone
                        ? sizes.width * 0.13
                        : sizes.height * 0.06,
                }}
                onPress={() =>
                    onGetPlaySelected(
                        past,
                        future,
                        now,
                        item,
                        index,
                        interactive,
                    )
                }
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        backgroundColor: '#222',
                        margin: 1,
                        paddingLeft: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                    }}
                >
                    <View
                        style={{
                            justifyContent: 'flex-start',
                            alignItems: 'flex-end',
                            marginHorizontal: 5,
                            width: 10,
                            marginTop: 5,
                        }}
                    >
                        {now && (
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 100,
                                    backgroundColor: 'green',
                                }}
                            ></View>
                        )}
                        {past && interactive && (
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 100,
                                    backgroundColor: 'royalblue',
                                }}
                            ></View>
                        )}
                        {future && interactive && (
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 100,
                                    backgroundColor: 'crimson',
                                }}
                            ></View>
                        )}
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <Text numberOfLines={1} marginRight={10}>
                            {moment.unix(item.s).format(GLOBAL.Clock_Setting)}{' '}
                            {item.n}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onGetEpisodes = index => {
        var episodes = content.series.season[index].episodes;
        if (episodes != undefined) {
            setEpisodeList(episodes);
            setSeasonIndex(index);
        }
    };
    const renderSeason = ({ item, index }) => {
        return (
            <FocusButton
                style={{ borderRadius: 5 }}
                onPress={() => onGetEpisodes(index)}
            >
                <View
                    style={{
                        paddingHorizontal: 5,
                        paddingVertical: 10,
                        backgroundColor: '#222',
                        margin: 2,
                        paddingLeft: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                    }}
                >
                    <Text bold numberOfLines={1} style={{ width: '85%' }}>
                        {item.name}
                    </Text>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}
                    >
                        {seasonIndex == index ? (
                            <FontAwesome5
                                style={{
                                    fontSize: 16,
                                    color: '#fff',
                                    marginRight: 10,
                                }}
                                // icon={SolidIcons.check}
                                name="check"
                            />
                        ) : (
                            <View></View>
                        )}
                    </View>
                </View>
            </FocusButton>
        );
    };
    const getProgressSeries = index => {
        var season_id = content.series.season[seasonIndex].id;
        var getProgress = UTILS.getProfile('series_progress', season_id, index);
        var position = 0;
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo;
        }
        return position;
    };
    const onPlaySelectedEpisode = index => {
        sendReports();
        setReportStartTime(moment().unix());
        var season = content.series.season[seasonIndex];
        content.season = season;
        content.episodes = season.episodes;
        content.season_index = seasonIndex;
        content.season_id = season.id;
        content.index = index;
        onPlaySelected(index);
    };
    const renderEpisode = ({ item, index }) => {
        var progress = getProgressSeries(index);
        return (
            <FocusButton
                style={{ flex: 1, borderRadius: 5 }}
                onPress={() => onPlaySelectedEpisode(index)}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        margin: 5,
                        borderRadius: 5,
                        borderColor: '#333',
                        borderWidth: 3,
                        backgroundColor: '#111',
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#000',
                            justifyContent: 'center',
                        }}
                    >
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.image }}
                            style={{
                                margin: 5,
                                width: GLOBAL.Device_IsPhone
                                    ? sizes.height * 0.2
                                    : sizes.width * 0.2,
                                height:
                                    (GLOBAL.Device_IsPhone
                                        ? sizes.height * 0.2
                                        : sizes.width * 0.2) * 0.56,
                            }}
                        ></Image>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            width: '100%',
                            padding: 5,
                            paddingLeft: 10,
                            paddingBottom: 10,
                        }}
                    >
                        <Text h5 shadow numberOfLines={1}>
                            {item.episode_number}. {item.name}
                        </Text>
                        {!isNaN(progress) && (
                            <View
                                style={{
                                    borderBottomWidth: 3,
                                    borderBottomColor: '#999',
                                    width:
                                        (GLOBAL.Device_IsPhone
                                            ? sizes.height * 0.37
                                            : sizes.width * 0.35) * progress,
                                    marginTop: 2,
                                    marginBottom: 2,
                                    height: 5,
                                }}
                            ></View>
                        )}
                        <Text
                            shadow
                            numberOfLines={4}
                            style={{ paddingRight: 10 }}
                        >
                            {item.description}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onGetLessons = index => {
        var lessons = content.year.course[index].lessons;
        if (lessons != undefined) {
            setLessonList(lessons);
            setCourseIndex(index);
        }
    };
    const renderCourse = ({ item, index }) => {
        return (
            <FocusButton
                style={{ borderRadius: 5 }}
                onPress={() => onGetLessons(index)}
            >
                <View
                    style={{
                        paddingHorizontal: 5,
                        paddingVertical: 10,
                        backgroundColor: '#222',
                        margin: 2,
                        paddingLeft: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                    }}
                >
                    <Text bold numberOfLines={1} style={{ width: '85%' }}>
                        {item.name}
                    </Text>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}
                    >
                        {seasonIndex == index ? (
                            <FontAwesome5
                                style={{
                                    fontSize: 16,
                                    color: '#fff',
                                    marginRight: 10,
                                }}
                                // icon={SolidIcons.check}
                                name="check"
                            />
                        ) : (
                            <View></View>
                        )}
                    </View>
                </View>
            </FocusButton>
        );
    };
    const getProgressLesson = index => {
        var course_id = content.year.course[courseIndex].id;
        var getProgress = UTILS.getProfile('lesson_progress', course_id, index);
        var position = 0;
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo;
        }
        return position;
    };
    const onPlaySelectedLesson = index => {
        sendReports();
        setReportStartTime(moment().unix());
        var course = content.year.course[courseIndex];
        content.course = course;
        content.lessons = course.lessons;
        content.course_index = courseIndex;
        content.education_id = course.id;
        content.index = index;
        onPlaySelected(index);
    };
    const renderLesson = ({ item, index }) => {
        var progress = getProgressLesson(index);
        return (
            <FocusButton
                style={{ borderRadius: 5 }}
                onPress={() => onPlaySelectedLesson(index)}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        margin: 5,
                        borderRadius: 5,
                        borderColor: '#333',
                        borderWidth: 3,
                        backgroundColor: '#222',
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#111',
                            justifyContent: 'center',
                        }}
                    >
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.image }}
                            style={{
                                margin: 5,
                                width: GLOBAL.Device_IsPhone
                                    ? sizes.height * 0.2
                                    : sizes.width * 0.2,
                                height:
                                    (GLOBAL.Device_IsPhone
                                        ? sizes.height * 0.2
                                        : sizes.width * 0.2) * 0.56,
                            }}
                        ></Image>
                    </View>
                    <View
                        style={{
                            width: GLOBAL.Device_IsPhone
                                ? sizes.height * 0.37
                                : sizes.width * 0.37,
                            padding: 15,
                        }}
                    >
                        <Text h5 shadow numberOfLines={1}>
                            {item.lesson_number} {item.name}
                        </Text>
                        {!isNaN(progress) && (
                            <View
                                style={{
                                    borderBottomWidth: 3,
                                    borderBottomColor: '#999',
                                    width:
                                        (GLOBAL.Device_IsPhone
                                            ? sizes.height * 0.36
                                            : sizes.width * 0.36) * progress,
                                    marginTop: 5,
                                    marginBottom: 10,
                                    height: 5,
                                }}
                            ></View>
                        )}
                        <Text shadow numberOfLines={2}>
                            {item.description}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const renderMovie = ({ item, index }) => {
        return (
            <FocusButton
                style={{ borderRadius: 5 }}
                onPress={() => onPlaySelected(index)}
            >
                <View
                    style={{
                        width: GLOBAL.Device_IsPhone
                            ? sizes.height * 0.15
                            : sizes.width * 0.18,
                        margin: 5,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        {item.poster != undefined && (
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                                style={[
                                    {
                                        borderColor: '#222',
                                        borderWidth: 4,
                                        borderRadius: 5,
                                        width: GLOBAL.Device_IsPhone
                                            ? sizes.height * 0.15
                                            : sizes.width * 0.18,
                                        height:
                                            (GLOBAL.Device_IsPhone
                                                ? sizes.height * 0.15
                                                : sizes.width * 0.18) * 1.5,
                                    },
                                ]}
                            ></Image>
                        )}
                        {item.image != undefined && (
                            <Image
                                source={{ uri: item.image }}
                                style={[
                                    {
                                        borderColor: '#222',
                                        borderWidth: 4,
                                        borderRadius: 5,
                                        width: GLOBAL.Device_IsPhone
                                            ? sizes.height * 0.18
                                            : sizes.width * 0.18,
                                        height:
                                            (GLOBAL.Device_IsPhone
                                                ? sizes.height * 0.18
                                                : sizes.width * 0.18) * 1.5,
                                    },
                                ]}
                            ></Image>
                        )}
                        {item.cover != undefined && (
                            <Image
                                source={{ uri: item.cover }}
                                style={[
                                    {
                                        borderColor: '#222',
                                        borderWidth: 4,
                                        borderRadius: 5,
                                        width: GLOBAL.Device_IsPhone
                                            ? sizes.height * 0.18
                                            : sizes.width * 0.18,
                                        height:
                                            (GLOBAL.Device_IsPhone
                                                ? sizes.height * 0.18
                                                : sizes.width * 0.18) * 1.5,
                                    },
                                ]}
                            ></Image>
                        )}
                        <Text
                            bold
                            shadow
                            numberOfLines={1}
                            style={{
                                marginTop: 5,
                                marginLeft: 5,
                                width:
                                    (GLOBAL.Device_IsPhone
                                        ? sizes.height * 0.16
                                        : sizes.width * 0.16) - 10,
                            }}
                        >
                            {item.name}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onGetProgramsCatchup = (item, index) => {
        setCategoryIndex(index);
        setChannelList(content.channels);
        setChannelListSearch(content.channels);
        var epg = GLOBAL.EPG.find(c => c.id == item.channel_id);
        if (epg != undefined) {
            var start = moment()
                .add(0, 'days')
                .startOf('day')
                .unix()
                .toString();
            var end = moment().add(0, 'days').endOf('day').unix().toString();
            var dataToday = getDataTimeScale(start, end, epg.epgdata);
            setProgramList(dataToday);
        }
    };
    const getDataTimeScale = (start, end, data) => {
        var dataOut = data.filter(d => d.s >= start && d.e <= end);
        return dataOut;
    };
    const renderChannelCategory = ({ item, index }) => {
        return (
            <FocusButton onPress={() => onGetProgramsCatchup(item, index)}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        margin: 5,
                        borderRadius: 5,
                        borderColor: '#333',
                        borderWidth: 3,
                        backgroundColor: '#222',
                    }}
                >
                    <View style={{ backgroundColor: '#444' }}>
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.icon_big }}
                            style={{
                                margin: 10,
                                width: GLOBAL.Device_IsPhone
                                    ? sizes.height * 0.05
                                    : sizes.width * 0.05,
                                height: GLOBAL.Device_IsPhone
                                    ? sizes.height * 0.05
                                    : sizes.width * 0.05,
                            }}
                        ></Image>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 10,
                        }}
                    >
                        <Text
                            bold
                            shadow
                            numberOfLines={1}
                            style={{ width: '85%' }}
                        >
                            {item.channel_number} {item.name}
                        </Text>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                            }}
                        >
                            {categoryIndex == index ? (
                                <FontAwesome5
                                    style={{
                                        fontSize: 16,
                                        color: '#fff',
                                        marginRight: 10,
                                    }}
                                    // icon={SolidIcons.check}
                                    name="check"
                                />
                            ) : (
                                <View></View>
                            )}
                        </View>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const onPlaySelectedCatchupTV = (index, item, isPast, isFuture, isLive) => {
        sendReports();
        setReportStartTime(moment().unix());
        if (isPast || isLive) {
            //catchup
            var channel = content.channels[categoryIndex];
            content.programs = programList;
            content.channel = channel;
            onPlaySelected(index);
        } else if (isFuture) {
            //record
            if (GLOBAL.UserInterface.general.enable_recordings == true) {
                onRecordProgram(item);
            }
        }
    };
    const renderPrograms = ({ item, index }) => {
        var current = moment().unix();
        var interactive = false;
        if (channelSelected.is_flussonic == 1 || channelSelected.is_dveo == 1) {
            interactive = true;
        }
        var past = false;
        var future = false;
        var now = false;
        if (item.e < current && interactive) {
            past = true;
        }
        if (item.s > current && interactive) {
            future = true;
        }
        if (item.s < current && item.e > current) {
            now = true;
        }
        return (
            <FocusButton
                onPress={() =>
                    onPlaySelectedCatchupTV(index, item, past, future, now)
                }
            >
                <View
                    style={{
                        flex: 1,
                        paddingHorizontal: 5,
                        paddingVertical: 10,
                        backgroundColor: '#222',
                        margin: 2,
                        paddingLeft: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                    }}
                >
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            marginHorizontal: 5,
                            width: 10,
                        }}
                    >
                        {now && (
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 100,
                                    backgroundColor: 'green',
                                }}
                            ></View>
                        )}
                        {past && (
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 100,
                                    backgroundColor: 'royalblue',
                                }}
                            ></View>
                        )}
                        {future && (
                            <View
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 100,
                                    backgroundColor: 'crimson',
                                }}
                            ></View>
                        )}
                    </View>
                    <Text numberOfLines={1} marginRight={5}>
                        {moment.unix(item.s).format(GLOBAL.Clock_Setting)}{' '}
                        {item.n}
                    </Text>
                </View>
            </FocusButton>
        );
    };
    const renderRecording = ({ item, index }) => {
        return (
            <FocusButton onPress={() => onPlaySelected(index)}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        margin: 5,
                        borderRadius: 5,
                        borderColor: '#222',
                        borderWidth: 3,
                        backgroundColor: '#111',
                    }}
                >
                    <View style={{ backgroundColor: '#444' }}>
                        <Image
                            source={{
                                uri: GLOBAL.ImageUrlCMS + item.channel_icon,
                            }}
                            style={{
                                margin: 5,
                                width: GLOBAL.Device_IsPhone
                                    ? sizes.height * 0.09
                                    : sizes.width * 0.09,
                                height: GLOBAL.Device_IsPhone
                                    ? sizes.height * 0.09
                                    : sizes.width * 0.09,
                            }}
                        ></Image>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            margin: 10,
                            marginLeft: 10,
                            width: GLOBAL.Device_IsPhone
                                ? sizes.height * 0.16
                                : sizes.width * 0.16,
                        }}
                    >
                        <View style={{ flexDirection: 'column' }}>
                            <Text h5 bold shadow numberOfLines={1}>
                                {item.channel_name}
                            </Text>
                            <Text bold shadow numberOfLines={1}>
                                {item.program_name}
                            </Text>
                            <Text shadow numberOfLines={1}>
                                {moment
                                    .unix(item.ut_start)
                                    .format('DD MMMM YYYY')}
                            </Text>
                            <Text shadow numberOfLines={1}>
                                {moment
                                    .unix(item.ut_start)
                                    .format(GLOBAL.Clock_Setting) +
                                    ' - ' +
                                    moment
                                        .unix(item.ut_end)
                                        .format(GLOBAL.Clock_Setting)}
                            </Text>
                        </View>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const SearchIcon = props => (
        <Icon {...props} fill="#fff" name="search-outline" />
    );

    const SpeechIcon = props => (
        <Icon {...props} fill="#fff" name="mic-outline" />
    );

    const onPlayFromStart = () => {
        sendActionReport('Play from Start', playerType, moment().unix(), '');
        setSeek(0, true);
    };
    const renderExtra = ({ item }) => {
        return (
            <FocusButton
                style={{ backgroundColor: '#333', margin: 5, borderRadius: 100 }}
                onPress={() => onSearchExtra(item.name)}
            >
                <Text style={{ paddingHorizontal: 10, padding: 4 }}>
                    {item.name}
                </Text>
            </FocusButton>
        );
    };

    const goFullScreen = () => {
        player.requestFullscreen();
    };
    const startCasting = () => {
        setupCastingAndStart();
    };

    const animated = new Animated.Value(0);
    const durationUp = 5000;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animated, {
                    toValue: 255,
                    duration: durationUp,
                    useNativeDriver: true,
                }),
                Animated.timing(animated, {
                    toValue: 0,
                    duration: durationUp,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);
    if (streamUrl == '') {
        return <View></View>;
    } else {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor:
                        GLOBAL.Device_IsPortrait && GLOBAL.Device_IsWebTvMobile
                            ? '#1d1d1d'
                            : '#000',
                }}
            >
                <Modal
                    style={{
                        width: GLOBAL.Device_IsPhone
                            ? sizes.height * 0.3
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
                        <Text
                            color={'red'}
                            style={{ color: 'red' }}
                            status="basic"
                        >
                            {errorRecording}
                        </Text>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                margin: 20,
                            }}
                        >
                            {errorRecording == '' && (
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
                        width: GLOBAL.Device_IsPhone
                            ? sizes.height * 0.3
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
                                style={{
                                    fontSize: 50,
                                    color: 'green',
                                    padding: 10,
                                }}
                                // icon={SolidIcons.check}
                                name="check"
                            />
                        </View>
                    </Card>
                </Modal>
                {showModal && (
                    <View
                        style={{
                            flex: 1,
                            position: 'absolute',
                            top: 10,
                            left: 0,
                            right: 0,
                            zIndex: 99999,
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                width:
                                    GLOBAL.Device_IsPortrait &&
                                        GLOBAL.Device_IsWebTV
                                        ? sizes.width * 0.85
                                        : GLOBAL.Device_IsPhone
                                            ? sizes.height * 0.4
                                            : sizes.width * 0.3,
                                alignItems: 'center',
                            }}
                        >
                            <Card disabled={true}>
                                <Text h5 bold>
                                    {LANG.getTranslation('childlock')}
                                </Text>
                                <Text>
                                    {LANG.getTranslation('enter_pin_access')}
                                </Text>
                                <Text
                                    color={'red'}
                                    style={{ color: 'red' }}
                                    category="s1"
                                    status="basic"
                                >
                                    {error}
                                </Text>
                                <Input
                                    style={{
                                        marginTop: 10,
                                        backgroundColor: 'transparent',
                                    }}
                                    status="control"
                                    placeholder={''}
                                    autoFocus={true}
                                    accessoryLeft={LockIcon}
                                    value={parentalCode}
                                    secureTextEntry={true}
                                    autoComplete={'off'}
                                    onChangeText={setParentalCode}
                                    onFocus={() => setError('')}
                                    underlineColorAndroid="transparent"
                                />
                                <Button
                                    style={{ marginTop: 20, marginBottom: 5 }}
                                    onPress={() => checkParentalCode()}
                                >
                                    {LANG.getTranslation('submit')}
                                </Button>
                                <Button
                                    style={{ marginBottom: 10 }}
                                    onPress={() => cancelParentalCode()}
                                >
                                    {LANG.getTranslation('cancel')}
                                </Button>
                            </Card>
                        </View>
                    </View>
                )}
                {showWaterMarking && !showChannelList && (
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            zIndex: 99999,
                            top: watermark_x,
                            left: watermark_y,
                        }}
                    >
                        <View
                            style={{
                                marginTop: 10,
                                paddingTop: 10,
                                paddingBottom: 10,
                                marginLeft: 10,
                                marginRight: 10,
                                borderRadius: 5,
                                borderWidth: 2,
                                borderColor: 'crimson',
                                backgroundColor: 'rgba(0, 0, 0, 0.60)',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View>
                                <Text bold style={[{ marginHorizontal: 10 }]}>
                                    {GLOBAL.Device_UniqueID}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
                {showPreroll && allStreamValuesAds.url != undefined && (
                    <View
                        style={{
                            backgroundColor: '#111',
                            width: GLOBAL.Device_IsPhone
                                ? sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            zIndex: 9998,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                top: 20,
                                left: 20,
                                zIndex: 99999,
                            }}
                        >
                            <Text shadow>
                                Sponsered Ad ({nextCountdownAds})
                            </Text>
                        </View>
                        <Video
                            ignoreSilentSwitch={'ignore'}
                            source={{
                                uri: allStreamValuesAds.url,
                                type: allStreamValuesAds.type,
                                headers: {
                                    'User-Agent': GLOBAL.User_Agent,
                                },
                            }}
                            streamType={'TV'}
                            disableFocus={true}
                            style={{
                                width: GLOBAL.Device_IsPhone
                                    ? sizes.height
                                    : sizes.width,
                                height: GLOBAL.Device_IsPhone
                                    ? sizes.width
                                    : sizes.height,
                            }}
                            rate={1}
                            paused={false}
                            resizeMode={resizeMode}
                            repeat={false}
                            useTextureView={false}
                        />
                    </View>
                )}
                {showOverlay && (
                    <View
                        style={{
                            backgroundColor: '#111',
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            right: 0,
                            top: 0,
                            zIndex: 9998,
                            width: GLOBAL.Device_IsPhone
                                ? sizes.width * 0.3
                                : sizes.height * 0.3,
                        }}
                    >
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + imageOverlay }}
                            style={{
                                width: GLOBAL.Device_IsPhone
                                    ? sizes.width * 0.24
                                    : sizes.height * 0.24,
                                height: '100%',
                                marginVertical: 10,
                            }}
                            resizeMethod={'resize'}
                            resizeMode={'contain'}
                        />
                    </View>
                )}
                {showTicker && (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#111',
                            width: sizes.width,
                            height: 50,
                            position: 'absolute',
                            bottom: 0,
                            zIndex: 9998,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <TextTicker
                                style={{ color: '#fff' }}
                                duration={textTickerTimer}
                                animationType={'scroll'}
                                loop={true}
                                repeatSpacer={50}
                                marqueeDelay={1000}
                            >
                                {textTicker}
                            </TextTicker>
                        </View>
                    </View>
                )}
                {nextActive && nextText != '' && (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 99999,
                            alignSelf: 'center',
                            alignItems: 'center',
                            margin: 40,
                            padding: 10,
                            backgroundColor: '#111',
                            borderColor: '#333',
                            borderWidth: 4,
                            borderRadius: 5,
                            width: GLOBAL.Device_IsPhone
                                ? sizes.width * 0.6
                                : sizes.height * 0.6,
                        }}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                {playerType == 'Series' &&
                                    content.episodes[content.index + 1] !=
                                    undefined && (
                                        <Image
                                            source={{
                                                uri:
                                                    GLOBAL.ImageUrlCMS +
                                                    content.episodes[
                                                        content.index + 1
                                                    ].image,
                                            }}
                                            style={{ width: 125, height: 75 }}
                                        ></Image>
                                    )}
                                {playerType == 'Education' &&
                                    content.lessons[content.index + 1] !=
                                    undefined && (
                                        <Image
                                            source={{
                                                uri:
                                                    GLOBAL.ImageUrlCMS +
                                                    content.lessons[
                                                        content.index + 1
                                                    ].image,
                                            }}
                                            style={{ width: 125, height: 75 }}
                                        ></Image>
                                    )}
                            </View>
                            <View
                                style={{
                                    flex: 1,
                                    paddingLeft: 20,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text numberOfLines={1} bold>
                                    {nextText}
                                </Text>
                                {playerType == 'Series' && (
                                    <Text numberOfLines={1}>
                                        {LANG.getTranslation(
                                            'next_episode_starts',
                                        )}{' '}
                                        {nextCountdown}
                                    </Text>
                                )}
                                {playerType == 'Education' && (
                                    <Text numberOfLines={1}>
                                        {LANG.getTranslation(
                                            'next_lesson_starts',
                                        )}{' '}
                                        {nextCountdown}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                )}
                {error != '' && (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 99999,
                            alignSelf: 'center',
                            alignItems: 'center',
                            margin: 40,
                            padding: 20,
                            backgroundColor: '#111',
                            borderColor: '#333',
                            borderWidth: 4,
                            borderRadius: 5,
                            width: sizes.height * 0.6,
                        }}
                    >
                        <Text numberOfLines={2} bold color={'red'}>
                            {error}
                        </Text>
                    </View>
                )}
                {showVoiceEnabled && (
                    <View
                        style={{
                            borderRadius: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            position: 'absolute',
                            width: GLOBAL.Device_IsPhone
                                ? sizes.height * 0.3
                                : sizes.width * 0.3,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.height * 0.3
                                : sizes.width * 0.3,
                            zIndex: 99999,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            flex: 1,
                            top: 50,
                        }}
                    >
                        <Animatable.View
                            animation="pulse"
                            easing="ease-in-out"
                            iterationCount="infinite"
                        >
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
                {allStreamValues.url != '' && allStreamValues.url != undefined && (
                    <Video
                        ignoreSilentSwitch={'ignore'}
                        ref={playerRef}
                        source={{
                            uri: allStreamValues.url,
                            type: allStreamValues.type,
                            full: false,
                            ref: 'player',
                            headers: {
                                type: allStreamValues.type,
                                'User-Agent': GLOBAL.User_Agent,
                            },
                            drm: Player_Utils.getDrmSetup(
                                allStreamValues.drmSupplierType,
                                allStreamValues,
                            ),
                        }}
                        adTagUrl={''}
                        vast={vastUrl}
                        textTracks={allStreamValues.externalSubtitles}
                        bufferConfig={bufferConfig}
                        streamType={'TV'}
                        disableFocus={true}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            width:
                                GLOBAL.Device_IsPhone && Platform.OS != 'ios'
                                    ? sizes.height
                                    : '100%',
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : '100%',
                            zIndex: 0,
                        }}
                        rate={1}
                        paused={paused}
                        resizeMode={resizeMode}
                        selectedTextTrack={{
                            type: textTrackType,
                            value: textTrackIndex,
                        }}
                        selectedAudioTrack={{
                            type: 'index',
                            value: audioTrackIndex,
                        }}
                        seek={seekPosition}
                        onLoad={onLoad}
                        onBuffer={onBuffer}
                        onProgress={onProgress}
                        onEnd={onEnd}
                        onError={onError}
                        repeat={false}
                        useTextureView={false}
                    />
                )}
                <View
                    style={{
                        position: 'absolute',
                        zIndex: 9998,
                        flex: 1,
                        width: GLOBAL.Device_IsPhone
                            ? Platform.OS == 'ios'
                                ? '100%'
                                : sizes.height
                            : sizes.width,
                        height: GLOBAL.Device_IsPhone
                            ? sizes.width
                            : sizes.height,
                    }}
                >
                    <ImageBackground
                        source={{
                            uri:
                                paused &&
                                    parentalControl == 0 &&
                                    content.backdrop != undefined
                                    ? GLOBAL.ImageUrlCMS + content.backdrop
                                    : null,
                        }}
                        style={{ flex: 1, width: null, height: null }}
                        imageStyle={{ resizeMode: 'cover' }}
                    >
                        {!showModal && (
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    width: GLOBAL.Device_IsPhone
                                        ? Platform.OS == 'ios'
                                            ? '100%'
                                            : sizes.height
                                        : sizes.width,
                                    height: GLOBAL.Device_IsPhone
                                        ? sizes.width
                                        : sizes.height,
                                }}
                                activeOpacity={1}
                                onMouseMove={togglePlayer}
                                disabled={showPlayer}
                                onPress={togglePlayer}
                            >
                                {showPlayer && (
                                    <LinearGradient
                                        colors={
                                            showPlayer
                                                ? [
                                                    '#000',
                                                    'rgba(0, 0, 0, 0.0)',
                                                    'rgba(0, 0, 0, 0.0)',
                                                    '#000',
                                                ]
                                                : [
                                                    'rgba(0, 0, 0, 0.0)',
                                                    'rgba(0, 0, 0, 0.0)',
                                                ]
                                        }
                                        style={{
                                            flex: 1,
                                            width: GLOBAL.Device_IsPhone
                                                ? Platform.OS == 'ios'
                                                    ? '100%'
                                                    : sizes.height
                                                : sizes.width,
                                            height: GLOBAL.Device_IsPhone
                                                ? sizes.width
                                                : sizes.height,
                                        }}
                                        start={{ x: 0.5, y: 0 }}
                                    >
                                        <Animated.View
                                            style={[
                                                {
                                                    flex: GLOBAL.Device_IsPhone
                                                        ? 1
                                                        : !GLOBAL.Device_IsPortrait &&
                                                            GLOBAL.Device_IsWebTvMobile
                                                            ? 1
                                                            : GLOBAL.Device_IsTablet
                                                                ? 1
                                                                : 2,
                                                    marginHorizontal: 20,
                                                    flexDirection: 'row',
                                                },
                                            ]}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    paddingTop: 10,
                                                }}
                                            >
                                                <FocusButton
                                                    onPress={onPlayerBack}
                                                >
                                                    <FontAwesome5
                                                        style={{
                                                            fontSize: 20,
                                                            color: '#fff',
                                                            padding: 10,
                                                        }}
                                                        // icon={
                                                        //     SolidIcons.chevronLeft
                                                        // }
                                                        name="chevron-left"
                                                    />
                                                </FocusButton>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                {content.position != 0 &&
                                                    content.position + 20 >
                                                    position && (
                                                        <View
                                                            style={{
                                                                position:
                                                                    'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                zIndex: 99999,
                                                            }}
                                                        >
                                                            <FocusButton
                                                                onPress={
                                                                    onPlayFromStart
                                                                }
                                                            >
                                                                <View
                                                                    style={{
                                                                        flex: 1,
                                                                        flexDirection:
                                                                            'column',
                                                                        alignContent:
                                                                            'center',
                                                                        alignItems:
                                                                            'center',
                                                                        alignSelf:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        marginTop: 0,
                                                                    }}
                                                                >
                                                                    <View
                                                                        style={{
                                                                            marginTop:
                                                                                GLOBAL.Device_IsPortrait &&
                                                                                    GLOBAL.Device_IsWebTV
                                                                                    ? 50
                                                                                    : 10,
                                                                            padding: 10,
                                                                            borderRadius: 5,
                                                                            borderWidth: 2,
                                                                            borderColor:
                                                                                '#666',
                                                                            backgroundColor:
                                                                                'rgba(0, 0, 0, 0.60)',
                                                                            justifyContent:
                                                                                'center',
                                                                            alignContent:
                                                                                'center',
                                                                            alignItems:
                                                                                'center',
                                                                        }}
                                                                    >
                                                                        <Text
                                                                            bold
                                                                            h5
                                                                            margin={
                                                                                20
                                                                            }
                                                                        >
                                                                            {LANG.getTranslation(
                                                                                'restart',
                                                                            ).toUpperCase()}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            </FocusButton>
                                                        </View>
                                                    )}
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    justifyContent: 'flex-end',
                                                    flexDirection: 'row',
                                                    paddingRight: showOverlay
                                                        ? 200
                                                        : 0,
                                                }}
                                            >
                                                {GLOBAL.UserInterface.player
                                                    .enable_casting == true && (
                                                        <View
                                                            style={{ marginTop: 10 }}
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
                                                                        margin: 4,
                                                                    }}
                                                                />,
                                                            )}
                                                            {RenderIf(
                                                                GLOBAL.Device_System ==
                                                                'Apple',
                                                            )(
                                                                <View
                                                                    style={{
                                                                        marginTop: 3,
                                                                    }}
                                                                >
                                                                    <CastButton
                                                                        activeTintColor="green"
                                                                        tintColor="white"
                                                                        style={{
                                                                            width: 35,
                                                                            height: 35,
                                                                        }}
                                                                    />
                                                                </View>,
                                                            )}
                                                        </View>
                                                    )}
                                                {GLOBAL.Device_IsWebTV &&
                                                    !GLOBAL.Device_IsSmartTV &&
                                                    !GLOBAL.Device_IsPwaIOS &&
                                                    !GLOBAL.Device_IsPwaIosChrome &&
                                                    !GLOBAL.Device_IsPwaIosSafari && (
                                                        <FocusButton
                                                            onPress={() =>
                                                                startCasting()
                                                            }
                                                        >
                                                            <Image
                                                                source={require('./../../images/chromecast.png')}
                                                                style={{
                                                                    height: 20,
                                                                    width: 20,
                                                                    margin: 7,
                                                                    marginTop: 20,
                                                                }}
                                                            />
                                                        </FocusButton>
                                                    )}
                                                {playerType != 'Recording' &&
                                                    playerType != 'CatchupTV' &&
                                                    playerType != 'Education' &&
                                                    GLOBAL.UserInterface.general
                                                        .enable_favourites_menu ==
                                                    true && (
                                                        <FocusButton
                                                            onPress={
                                                                onToggleFavorites
                                                            }
                                                        >
                                                            <FontAwesome
                                                                style={{
                                                                    fontSize: 20,
                                                                    color: '#fff',
                                                                    padding: 7,
                                                                    paddingTop: 20,
                                                                }}
                                                                // icon={
                                                                //     favorite
                                                                //         ? SolidIcons.heart
                                                                //         : RegularIcons.heart
                                                                // }
                                                                name={
                                                                    favorite
                                                                        ? "heart"
                                                                        : "heart-o"
                                                                }
                                                            />
                                                        </FocusButton>
                                                    )}
                                                {GLOBAL.UserInterface.player
                                                    .enable_problem_report ==
                                                    true && (
                                                        <FocusButton
                                                            onPress={onOpenSupport}
                                                        >
                                                            <FontAwesome5
                                                                style={{
                                                                    fontSize: 20,
                                                                    color: '#fff',
                                                                    padding: 7,
                                                                    paddingTop: 20,
                                                                }}
                                                                // icon={
                                                                //     SolidIcons.questionCircle
                                                                // }
                                                                name="question-circle"
                                                            />
                                                        </FocusButton>
                                                    )}

                                                <FocusButton
                                                    onPress={onOpenSettings}
                                                >
                                                    <FontAwesome5
                                                        style={{
                                                            fontSize: 20,
                                                            color: '#fff',
                                                            padding: 7,
                                                            paddingTop: 20,
                                                        }}
                                                        // icon={SolidIcons.cog}
                                                        name="cog"
                                                    />
                                                </FocusButton>

                                                {!GLOBAL.Device_IsWebTvMobile &&
                                                    playerType == 'Channel' &&
                                                    GLOBAL.UserInterface.player
                                                        .enable_channel_menu ==
                                                    true && (
                                                        <FocusButton
                                                            onPress={
                                                                onOpenChannelList
                                                            }
                                                        >
                                                            <FontAwesome5
                                                                style={{
                                                                    fontSize: 20,
                                                                    color: '#fff',
                                                                    padding: 7,
                                                                    paddingTop: 20,
                                                                }}
                                                                // icon={
                                                                //     SolidIcons.listOl
                                                                // }
                                                                name="list-ol"
                                                            />
                                                        </FocusButton>
                                                    )}
                                                {!GLOBAL.Device_IsWebTvMobile &&
                                                    playerType == 'Series' && (
                                                        <FocusButton
                                                            onPress={
                                                                onOpenSeasonList
                                                            }
                                                        >
                                                            <FontAwesome5
                                                                style={{
                                                                    fontSize: 20,
                                                                    color: '#fff',
                                                                    padding: 7,
                                                                    paddingTop: 20,
                                                                }}
                                                                // icon={
                                                                //     SolidIcons.listOl
                                                                // }
                                                                name="list-ol"
                                                            />
                                                        </FocusButton>
                                                    )}
                                                {!GLOBAL.Device_IsWebTvMobile &&
                                                    playerType ==
                                                    'Education' && (
                                                        <FocusButton
                                                            onPress={
                                                                onOpenEducationList
                                                            }
                                                        >
                                                            <FontAwesome5
                                                                style={{
                                                                    fontSize: 20,
                                                                    color: '#fff',
                                                                    padding: 7,
                                                                    paddingTop: 20,
                                                                }}
                                                                // icon={
                                                                //     SolidIcons.listOl
                                                                // }
                                                                name="list-ol"
                                                            />
                                                        </FocusButton>
                                                    )}
                                                {!GLOBAL.Device_IsWebTvMobile &&
                                                    playerType ==
                                                    'CatchupTV' && (
                                                        <FocusButton
                                                            onPress={
                                                                onOpenCatchupTVList
                                                            }
                                                        >
                                                            <FontAwesome5
                                                                style={{
                                                                    fontSize: 20,
                                                                    color: '#fff',
                                                                    padding: 7,
                                                                    paddingTop: 20,
                                                                }}
                                                                // icon={
                                                                //     SolidIcons.listOl
                                                                // }
                                                                name="list-ol"
                                                            />
                                                        </FocusButton>
                                                    )}
                                                {!GLOBAL.Device_IsWebTvMobile &&
                                                    playerType == 'Movie' &&
                                                    moviesList.length > 0 && (
                                                        <FocusButton
                                                            onPress={
                                                                onOpenMoviesList
                                                            }
                                                        >
                                                            <FontAwesome5
                                                                style={{
                                                                    fontSize: 20,
                                                                    color: '#fff',
                                                                    padding: 7,
                                                                    paddingTop: 20,
                                                                }}
                                                                // icon={
                                                                //     SolidIcons.listOl
                                                                // }
                                                                name="list-ol"
                                                            />
                                                        </FocusButton>
                                                    )}
                                                {!GLOBAL.Device_IsWebTvMobile &&
                                                    playerType ==
                                                    'Recording' && (
                                                        <FocusButton
                                                            onPress={
                                                                onOpenRecordingList
                                                            }
                                                        >
                                                            <FontAwesome5
                                                                style={{
                                                                    fontSize: 20,
                                                                    color: '#fff',
                                                                    padding: 7,
                                                                    paddingTop: 20,
                                                                }}
                                                                // icon={
                                                                //     SolidIcons.listOl
                                                                // }
                                                                name="list-ol"
                                                            />
                                                        </FocusButton>
                                                    )}
                                                {GLOBAL.Device_IsWebTV && (
                                                    <FocusButton
                                                        onPress={goFullScreen}
                                                    >
                                                        <FontAwesome5
                                                            style={{
                                                                fontSize: 20,
                                                                color: '#fff',
                                                                padding: 7,
                                                                paddingTop: 20,
                                                            }}
                                                            // icon={
                                                            //     SolidIcons.expand
                                                            // }
                                                            name="expand"
                                                        />
                                                    </FocusButton>
                                                )}
                                            </View>
                                        </Animated.View>

                                        <Animated.View
                                            style={[
                                                {
                                                    flex:
                                                        GLOBAL.Device_IsPortrait &&
                                                            GLOBAL.Device_IsWebTV
                                                            ? 10
                                                            : GLOBAL.Device_IsPhone
                                                                ? 2
                                                                : !GLOBAL.Device_IsPortrait &&
                                                                    GLOBAL.Device_IsWebTvMobile
                                                                    ? 2
                                                                    : 4,
                                                    margin: 10,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        alignItems:
                                                            'flex-start',
                                                        alignSelf:
                                                            GLOBAL.Device_IsTablet
                                                                ? 'center'
                                                                : GLOBAL.Device_IsPortrait &&
                                                                    GLOBAL.Device_IsWebTV
                                                                    ? 'flex-start'
                                                                    : 'center',
                                                        paddingTop:
                                                            GLOBAL.Device_IsPortrait &&
                                                                GLOBAL.Device_IsWebTV
                                                                ? 0
                                                                : 15,
                                                    }}
                                                >
                                                    {(playerType == 'Series' ||
                                                        playerType ==
                                                        'Education' ||
                                                        playerType ==
                                                        'CatchupTV') &&
                                                        prevText != '' && (
                                                            <FocusButton
                                                                style={{
                                                                    alignItems:
                                                                        'center',
                                                                }}
                                                                onPress={() =>
                                                                    onPlayerPrevious()
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 22,
                                                                        color: '#fff',
                                                                        padding: 10,
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     SolidIcons.stepBackward
                                                                    // }
                                                                    name="step-backward"
                                                                />
                                                                <Text
                                                                    center
                                                                    shadow
                                                                    style={{
                                                                        fontSize: 8,
                                                                    }}
                                                                    numberOfLines={
                                                                        2
                                                                    }
                                                                >
                                                                    {prevText}
                                                                </Text>
                                                            </FocusButton>
                                                        )}
                                                    {playerType == 'Channel' &&
                                                        prevImage != '' && (
                                                            <FocusButton
                                                                style={{
                                                                    alignItems:
                                                                        'center',
                                                                }}
                                                                onPress={() =>
                                                                    onPlayerPrevious()
                                                                }
                                                            >
                                                                {GLOBAL.Device_IsPortrait &&
                                                                    GLOBAL.Device_IsWebTV ? (
                                                                    <View
                                                                        style={{
                                                                            width:
                                                                                sizes.width /
                                                                                2.2,
                                                                            flex: 1,
                                                                            flexDirection:
                                                                                'row',
                                                                            backgroundColor:
                                                                                '#222',
                                                                            borderRadius: 5,
                                                                            margin: 2,
                                                                        }}
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                backgroundColor:
                                                                                    '#111',
                                                                                justifyContent:
                                                                                    'center',
                                                                            }}
                                                                        >
                                                                            <FontAwesome5
                                                                                style={{
                                                                                    fontSize: 18,
                                                                                    color: '#fff',
                                                                                    padding: 10,
                                                                                    textShadowColor:
                                                                                        'rgba(0, 0, 0, 0.75)',
                                                                                    textShadowOffset:
                                                                                    {
                                                                                        width: -1,
                                                                                        height: 1,
                                                                                    },
                                                                                    textShadowRadius: 10,
                                                                                }}
                                                                                // icon={
                                                                                //     SolidIcons.arrowLeft
                                                                                // }
                                                                                name="arrow-left"
                                                                            />
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                flex: 1,
                                                                                flexDirection:
                                                                                    'column',
                                                                                alignItems:
                                                                                    'center',
                                                                                padding: 5,
                                                                            }}
                                                                        >
                                                                            <Image
                                                                                source={{
                                                                                    uri: prevImage,
                                                                                }}
                                                                                style={
                                                                                    content.image_style
                                                                                }
                                                                            ></Image>
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                center
                                                                                shadow
                                                                                style={{
                                                                                    fontSize: 8,
                                                                                }}
                                                                                // numberOfLines={
                                                                                //     1
                                                                                // }
                                                                            >
                                                                                {
                                                                                    prevText
                                                                                }
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                ) : (
                                                                    <View
                                                                        style={{
                                                                            width: GLOBAL.Device_IsPhone
                                                                                ? sizes.width *
                                                                                0.6
                                                                                : sizes.width *
                                                                                0.2,
                                                                            flexDirection:
                                                                                'row',
                                                                            alignItems:
                                                                                'center',
                                                                            backgroundColor:
                                                                                'rgba(0, 0, 0, 0.60)',
                                                                            borderRadius: 5,
                                                                            padding: 10,
                                                                        }}
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                justifyContent:
                                                                                    'center',
                                                                                backgroundColor:
                                                                                    '#222',
                                                                            }}
                                                                        >
                                                                            <FontAwesome5
                                                                                style={{
                                                                                    fontSize: 18,
                                                                                    color: '#fff',
                                                                                    padding: 10,
                                                                                    textShadowColor:
                                                                                        'rgba(0, 0, 0, 0.75)',
                                                                                    textShadowOffset:
                                                                                    {
                                                                                        width: -1,
                                                                                        height: 1,
                                                                                    },
                                                                                    textShadowRadius: 10,
                                                                                }}
                                                                                // icon={
                                                                                //     SolidIcons.arrowLeft
                                                                                // }
                                                                                name="arrow-right"
                                                                            />
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                flex: 1,
                                                                                alignContent:
                                                                                    'center',
                                                                                alignItems:
                                                                                    'center',
                                                                                alignSelf:
                                                                                    'center',
                                                                                justifyContent:
                                                                                    'center',
                                                                                padding: 10,
                                                                            }}
                                                                        >
                                                                            <Image
                                                                                source={{
                                                                                    uri: prevImage,
                                                                                }}
                                                                                style={
                                                                                    content.image_style
                                                                                }
                                                                            ></Image>
                                                                            <Text
                                                                                center
                                                                                shadow
                                                                                style={{
                                                                                    fontSize: 8,
                                                                                }}
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                            >
                                                                                {
                                                                                    prevText
                                                                                }
                                                                            </Text>
                                                                        </View>
                                                                    </View>
                                                                )}
                                                            </FocusButton>
                                                        )}
                                                </View>
                                                {!paused &&
                                                    playerType != 'Channel' &&
                                                    !GLOBAL.Device_IsPwaIOS &&
                                                    !GLOBAL.Device_IsPwaIosChrome &&
                                                    !GLOBAL.Device_IsPwaIosSafari && (
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                alignItems:
                                                                    'center',
                                                                alignSelf:
                                                                    GLOBAL.Device_IsTablet
                                                                        ? 'center'
                                                                        : GLOBAL.Device_IsPortrait &&
                                                                            GLOBAL.Device_IsWebTV
                                                                            ? 'flex-start'
                                                                            : 'center',
                                                            }}
                                                        >
                                                            <FocusButton
                                                                onPress={
                                                                    onPlayerRewind
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 22,
                                                                        color: '#fff',
                                                                        padding: 10,
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     SolidIcons.backward
                                                                    // }
                                                                    name="backward"
                                                                />
                                                                <Text
                                                                    center
                                                                    shadow
                                                                    style={{
                                                                        fontSize: 8,
                                                                    }}
                                                                >
                                                                    -10 sec
                                                                </Text>
                                                            </FocusButton>
                                                        </View>
                                                    )}
                                                {playerType != 'Channel' &&
                                                    !content.interactivetv && (
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                alignItems:
                                                                    'center',
                                                                alignSelf:
                                                                    GLOBAL.Device_IsTablet
                                                                        ? 'center'
                                                                        : GLOBAL.Device_IsPortrait &&
                                                                            GLOBAL.Device_IsWebTV
                                                                            ? 'flex-start'
                                                                            : 'center',
                                                            }}
                                                        >
                                                            <FocusButton
                                                                onPress={
                                                                    onPlayerPause
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 60,
                                                                        color: '#fff',
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     paused
                                                                    //         ? SolidIcons.playCircle
                                                                    //         : SolidIcons.pause
                                                                    // }
                                                                    name={
                                                                        paused ? "play-circle" : "pause"
                                                                    }
                                                                />
                                                            </FocusButton>
                                                        </View>
                                                    )}
                                                {playerType == 'Channel' &&
                                                    content.interactivetv &&
                                                    !GLOBAL.Device_IsWebTvMobile && (
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                alignItems:
                                                                    'center',
                                                                alignSelf:
                                                                    GLOBAL.Device_IsTablet
                                                                        ? 'center'
                                                                        : GLOBAL.Device_IsPortrait &&
                                                                            GLOBAL.Device_IsWebTV
                                                                            ? 'flex-start'
                                                                            : 'center',
                                                            }}
                                                        >
                                                            <FocusButton
                                                                onPress={
                                                                    onPlayerPause
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 60,
                                                                        color: '#fff',
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     paused
                                                                    //         ? SolidIcons.playCircle
                                                                    //         : SolidIcons.pause
                                                                    // }
                                                                    name={
                                                                        paused ? "play-circle" : "pause"
                                                                    }
                                                                />
                                                            </FocusButton>
                                                        </View>
                                                    )}
                                                {!paused &&
                                                    playerType != 'Channel' &&
                                                    !GLOBAL.Device_IsPwaIOS &&
                                                    !GLOBAL.Device_IsPwaIosChrome &&
                                                    !GLOBAL.Device_IsPwaIosSafari && (
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                alignItems:
                                                                    'center',
                                                                alignSelf:
                                                                    GLOBAL.Device_IsTablet
                                                                        ? 'center'
                                                                        : GLOBAL.Device_IsPortrait &&
                                                                            GLOBAL.Device_IsWebTV
                                                                            ? 'flex-start'
                                                                            : 'center',
                                                            }}
                                                        >
                                                            <FocusButton
                                                                onPress={
                                                                    onPlayerForward
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 22,
                                                                        color: '#fff',
                                                                        padding: 10,
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     SolidIcons.forward
                                                                    // }
                                                                    name="forward"
                                                                />
                                                                <Text
                                                                    center
                                                                    shadow
                                                                    style={{
                                                                        fontSize: 8,
                                                                    }}
                                                                >
                                                                    +10 sec
                                                                </Text>
                                                            </FocusButton>
                                                        </View>
                                                    )}
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        alignItems: 'flex-end',
                                                        alignSelf:
                                                            GLOBAL.Device_IsTablet
                                                                ? 'center'
                                                                : GLOBAL.Device_IsPortrait &&
                                                                    GLOBAL.Device_IsWebTV
                                                                    ? 'flex-start'
                                                                    : 'center',
                                                        paddingTop:
                                                            GLOBAL.Device_IsPortrait &&
                                                                GLOBAL.Device_IsWebTV
                                                                ? 0
                                                                : 15,
                                                    }}
                                                >
                                                    {(playerType == 'Series' ||
                                                        playerType ==
                                                        'Education' ||
                                                        playerType ==
                                                        'CatchupTV') &&
                                                        nextText != '' && (
                                                            <FocusButton
                                                                style={{
                                                                    alignItems:
                                                                        'center',
                                                                }}
                                                                onPress={() =>
                                                                    onPlayerNext()
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 22,
                                                                        color: '#fff',
                                                                        padding: 10,
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     SolidIcons.stepForward
                                                                    // }
                                                                    name="step-forward"
                                                                />
                                                                <Text
                                                                    center
                                                                    shadow
                                                                    style={{
                                                                        fontSize: 8,
                                                                    }}
                                                                    numberOfLines={
                                                                        2
                                                                    }
                                                                >
                                                                    {nextText}
                                                                </Text>
                                                            </FocusButton>
                                                        )}
                                                    {playerType == 'Channel' &&
                                                        nextImage != '' && (
                                                            <FocusButton
                                                                style={{
                                                                    alignItems:
                                                                        'center',
                                                                }}
                                                                onPress={() =>
                                                                    onPlayerNext()
                                                                }
                                                            >
                                                                {GLOBAL.Device_IsPortrait &&
                                                                    GLOBAL.Device_IsWebTV ? (
                                                                    <View
                                                                        style={{
                                                                            width:
                                                                                sizes.width /
                                                                                2.2,
                                                                            flex: 1,
                                                                            flexDirection:
                                                                                'row',
                                                                            backgroundColor:
                                                                                '#222',
                                                                            borderRadius: 5,
                                                                            margin: 2,
                                                                        }}
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                flex: 1,
                                                                                flexDirection:
                                                                                    'column',
                                                                                alignItems:
                                                                                    'center',
                                                                                padding: 5,
                                                                            }}
                                                                        >
                                                                            <Image
                                                                                source={{
                                                                                    uri: nextImage,
                                                                                }}
                                                                                style={
                                                                                    content.image_style
                                                                                }
                                                                            ></Image>
                                                                            <Text
                                                                                center
                                                                                shadow
                                                                                style={{
                                                                                    fontSize: 8,
                                                                                }}
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                            >
                                                                                {
                                                                                    nextText
                                                                                }
                                                                            </Text>
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                backgroundColor:
                                                                                    '#111',
                                                                                justifyContent:
                                                                                    'center',
                                                                            }}
                                                                        >
                                                                            <FontAwesome5
                                                                                style={{
                                                                                    fontSize: 18,
                                                                                    color: '#fff',
                                                                                    padding: 10,
                                                                                    textShadowColor:
                                                                                        'rgba(0, 0, 0, 0.75)',
                                                                                    textShadowOffset:
                                                                                    {
                                                                                        width: -1,
                                                                                        height: 1,
                                                                                    },
                                                                                    textShadowRadius: 10,
                                                                                }}
                                                                                // icon={
                                                                                //     SolidIcons.arrowRight
                                                                                // }
                                                                                name="arrow-right"
                                                                            />
                                                                        </View>
                                                                    </View>
                                                                ) : (
                                                                    <View
                                                                        style={{
                                                                            width: GLOBAL.Device_IsPhone
                                                                                ? sizes.width *
                                                                                0.6
                                                                                : sizes.width *
                                                                                0.2,
                                                                            flexDirection:
                                                                                'row',
                                                                            alignItems:
                                                                                'center',
                                                                            backgroundColor:
                                                                                'rgba(0, 0, 0, 0.60)',
                                                                            borderRadius: 5,
                                                                            padding: 10,
                                                                        }}
                                                                    >
                                                                        <View
                                                                            style={{
                                                                                flex: 1,
                                                                                alignContent:
                                                                                    'center',
                                                                                alignItems:
                                                                                    'center',
                                                                                alignSelf:
                                                                                    'center',
                                                                                justifyContent:
                                                                                    'center',
                                                                                padding: 10,
                                                                            }}
                                                                        >
                                                                            <Image
                                                                                source={{
                                                                                    uri: nextImage,
                                                                                }}
                                                                                style={
                                                                                    content.image_style
                                                                                }
                                                                            ></Image>
                                                                            <Text
                                                                                center
                                                                                shadow
                                                                                style={{
                                                                                    fontSize: 8,
                                                                                }}
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                            >
                                                                                {
                                                                                    nextText
                                                                                }
                                                                            </Text>
                                                                        </View>
                                                                        <View
                                                                            style={{
                                                                                justifyContent:
                                                                                    'center',
                                                                                backgroundColor:
                                                                                    '#222',
                                                                            }}
                                                                        >
                                                                            <FontAwesome5
                                                                                style={{
                                                                                    fontSize: 18,
                                                                                    color: '#fff',
                                                                                    padding: 10,
                                                                                    textShadowColor:
                                                                                        'rgba(0, 0, 0, 0.75)',
                                                                                    textShadowOffset:
                                                                                    {
                                                                                        width: -1,
                                                                                        height: 1,
                                                                                    },
                                                                                    textShadowRadius: 10,
                                                                                }}
                                                                                // icon={
                                                                                //     SolidIcons.arrowRight
                                                                                // }
                                                                                name="arrow-right"
                                                                            />
                                                                        </View>
                                                                    </View>
                                                                )}
                                                            </FocusButton>
                                                        )}
                                                </View>
                                            </View>
                                        </Animated.View>
                                        <Animated.View
                                            style={[
                                                {
                                                    flex:
                                                        GLOBAL.Device_IsPortrait &&
                                                            GLOBAL.Device_IsWebTV
                                                            ? 4
                                                            : 2,
                                                    marginHorizontal: 30,
                                                },
                                            ]}
                                        >
                                            <View
                                                style={{
                                                    flex:
                                                        playerType ==
                                                            'Channel' ||
                                                            playerType ==
                                                            'CatchupTV' ||
                                                            playerType ==
                                                            'Recording'
                                                            ? 1.5
                                                            : 1,
                                                    flexDirection: 'row',
                                                }}
                                            >
                                                {(playerType == 'Channel' ||
                                                    playerType == 'Recording' ||
                                                    playerType ==
                                                    'CatchupTV') && (
                                                        <View
                                                            style={{
                                                                marginHorizontal: 10,
                                                            }}
                                                        >
                                                            <Image
                                                                source={{
                                                                    uri: content.image,
                                                                }}
                                                                style={
                                                                    content.image_style
                                                                }
                                                            ></Image>
                                                        </View>
                                                    )}
                                                {(playerType == 'Channel' ||
                                                    playerType == 'Recording' ||
                                                    playerType ==
                                                    'CatchupTV') && (
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                marginHorizontal: 20,
                                                            }}
                                                        >
                                                            <Text
                                                                h5
                                                                bold
                                                                shadow
                                                                numberOfLines={1}
                                                            >
                                                                {content.name}
                                                            </Text>
                                                            <Text
                                                                bold
                                                                shadow
                                                                numberOfLines={1}
                                                            >
                                                                {content.sub}
                                                            </Text>
                                                            <Text
                                                                shadow
                                                                numberOfLines={1}
                                                            >
                                                                {content.extra}
                                                            </Text>
                                                        </View>
                                                    )}
                                                {(playerType == 'Movie' ||
                                                    playerType == 'Series' ||
                                                    playerType ==
                                                    'Education') && (
                                                        <View style={{ flex: 1 }}>
                                                            <Text
                                                                h5
                                                                bold
                                                                shadow
                                                                numberOfLines={1}
                                                            >
                                                                {content.name}
                                                            </Text>
                                                        </View>
                                                    )}
                                                <View>
                                                    {playerType ==
                                                        'CatchupTV' && (
                                                            <FocusButton
                                                                style={{
                                                                    alignItems:
                                                                        'center',
                                                                }}
                                                                onPress={() =>
                                                                    onPlayLiveTV()
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 25,
                                                                        color: '#fff',
                                                                        padding: 10,
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     RegularIcons.arrowAltCircleRight
                                                                    // }
                                                                    name="arrow-alt-circle-right"
                                                                />
                                                                <Text
                                                                    center
                                                                    shadow
                                                                    numberOfLines={
                                                                        1
                                                                    }
                                                                >
                                                                    LiveTV
                                                                </Text>
                                                            </FocusButton>
                                                        )}
                                                    {playerType == 'Channel' &&
                                                        content.interactivetv &&
                                                        !GLOBAL.Device_IsPortrait &&
                                                        !GLOBAL.Device_IsWebTV && (
                                                            <FocusButton
                                                                style={{
                                                                    alignItems:
                                                                        'center',
                                                                    borderRadius: 100,
                                                                }}
                                                                onPress={() =>
                                                                    onPlayCatchupTV()
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 22,
                                                                        color: '#fff',
                                                                        padding: 10,
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     SolidIcons.history
                                                                    // }
                                                                    name="history"
                                                                />
                                                                <Text
                                                                    center
                                                                    shadow
                                                                    style={{
                                                                        fontSize: 8,
                                                                    }}
                                                                    numberOfLines={
                                                                        1
                                                                    }
                                                                >
                                                                    {LANG.getTranslation(
                                                                        'catchuptv',
                                                                    )}
                                                                </Text>
                                                            </FocusButton>
                                                        )}
                                                    {playerType == 'Channel' &&
                                                        content.interactivetv &&
                                                        !GLOBAL.Device_IsPortrait &&
                                                        GLOBAL.Device_IsWebTV && (
                                                            <FocusButton
                                                                style={{
                                                                    alignItems:
                                                                        'center',
                                                                    borderRadius: 100,
                                                                }}
                                                                onPress={() =>
                                                                    onPlayCatchupTV()
                                                                }
                                                            >
                                                                <FontAwesome5
                                                                    style={{
                                                                        fontSize: 22,
                                                                        color: '#fff',
                                                                        padding: 10,
                                                                        textShadowColor:
                                                                            'rgba(0, 0, 0, 0.75)',
                                                                        textShadowOffset:
                                                                        {
                                                                            width: -1,
                                                                            height: 1,
                                                                        },
                                                                        textShadowRadius: 10,
                                                                    }}
                                                                    // icon={
                                                                    //     SolidIcons.history
                                                                    // }
                                                                    name="history"
                                                                />
                                                                <Text
                                                                    center
                                                                    shadow
                                                                    style={{
                                                                        fontSize: 8,
                                                                    }}
                                                                    numberOfLines={
                                                                        1
                                                                    }
                                                                >
                                                                    {LANG.getTranslation(
                                                                        'catchuptv',
                                                                    )}
                                                                </Text>
                                                            </FocusButton>
                                                        )}
                                                    {playerType == 'Channel' &&
                                                        content.interactivetv &&
                                                        GLOBAL.Device_IsPortrait &&
                                                        GLOBAL.Device_IsWebTV && (
                                                            <View
                                                                style={{
                                                                    flex: 1,
                                                                    alignItems:
                                                                        'center',
                                                                    alignSelf:
                                                                        GLOBAL.Device_IsTablet
                                                                            ? 'center'
                                                                            : 'center',
                                                                    paddingTop:
                                                                        GLOBAL.Device_IsPortrait &&
                                                                            GLOBAL.Device_IsWebTV
                                                                            ? 0
                                                                            : 15,
                                                                }}
                                                            >
                                                                <FocusButton
                                                                    style={{
                                                                        alignItems:
                                                                            'center',
                                                                        borderRadius: 100,
                                                                    }}
                                                                    onPress={() =>
                                                                        onPlayCatchupTV()
                                                                    }
                                                                >
                                                                    <FontAwesome5
                                                                        style={{
                                                                            fontSize: 22,
                                                                            color: '#fff',
                                                                            padding: 10,
                                                                            textShadowColor:
                                                                                'rgba(0, 0, 0, 0.75)',
                                                                            textShadowOffset:
                                                                            {
                                                                                width: -1,
                                                                                height: 1,
                                                                            },
                                                                            textShadowRadius: 10,
                                                                        }}
                                                                        // icon={
                                                                        //     SolidIcons.history
                                                                        // }
                                                                        name="history"
                                                                    />
                                                                    <Text
                                                                        center
                                                                        shadow
                                                                        style={{
                                                                            fontSize: 8,
                                                                        }}
                                                                        numberOfLines={
                                                                            1
                                                                        }
                                                                    >
                                                                        {LANG.getTranslation(
                                                                            'catchuptv',
                                                                        )}
                                                                    </Text>
                                                                </FocusButton>
                                                            </View>
                                                        )}
                                                </View>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                {(playerType == 'Channel' ||
                                                    playerType ==
                                                    'CatchupTV') &&
                                                    !GLOBAL.Device_IsPwaIOS &&
                                                    !GLOBAL.Device_IsPwaIosChrome &&
                                                    !GLOBAL.Device_IsPwaIosSafari && (
                                                        <Scrubber
                                                            value={position}
                                                            onSlidingComplete={
                                                                onScrubberDrag
                                                            }
                                                            totalDuration={
                                                                duration
                                                            }
                                                            trackColor={
                                                                GLOBAL.Focus_Color
                                                            }
                                                            bufferedValue={
                                                                buffer
                                                            }
                                                            bufferedTrackColor={
                                                                '#666'
                                                            }
                                                            scrubbedColor={
                                                                '#222'
                                                            }
                                                            e={
                                                                content.program
                                                                    .e
                                                            }
                                                            s={
                                                                content.program
                                                                    .s
                                                            }
                                                            live={
                                                                playerType ==
                                                                    'Channel' &&
                                                                    !content.interactivetv
                                                                    ? true
                                                                    : false
                                                            }
                                                        />
                                                    )}
                                                {playerType != 'Channel' &&
                                                    playerType != 'CatchupTV' &&
                                                    !GLOBAL.Device_IsPwaIOS &&
                                                    !GLOBAL.Device_IsPwaIosChrome &&
                                                    !GLOBAL.Device_IsPwaIosSafari && (
                                                        <Scrubber
                                                            value={position}
                                                            onSlidingComplete={
                                                                onScrubberDrag
                                                            }
                                                            totalDuration={
                                                                duration
                                                            }
                                                            trackColor={
                                                                GLOBAL.Focus_Color
                                                            }
                                                            bufferedValue={
                                                                buffer
                                                            }
                                                            bufferedTrackColor={
                                                                '#666'
                                                            }
                                                            scrubbedColor={
                                                                '#222'
                                                            }
                                                        />
                                                    )}
                                            </View>
                                        </Animated.View>
                                        <View></View>
                                    </LinearGradient>
                                )}
                            </TouchableOpacity>
                        )}
                    </ImageBackground>
                </View>
                {settings ? (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            flex: 1,
                            width: GLOBAL.Device_IsPhone
                                ? Platform.OS == 'ios'
                                    ? '100%'
                                    : sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                left: 20,
                                top: 10,
                                alignItems: 'flex-end',
                            }}
                        >
                            <FocusButton onPress={onSettingsClose}>
                                <FontAwesome5
                                    style={{
                                        fontSize: 22,
                                        color: '#fff',
                                        padding: 10,
                                    }}
                                    // icon={SolidIcons.times}
                                    name="times"
                                />
                            </FocusButton>
                        </View>
                        <ScrollView style={{ flex: 1 }}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection:
                                        GLOBAL.Device_IsPortrait &&
                                            !GLOBAL.Device_IsPhone
                                            ? 'column'
                                            : 'row',
                                    marginTop: 30,
                                }}
                            >
                                {audioTracks.length > 1 ? (
                                    <View
                                        style={{
                                            flex:
                                                !GLOBAL.Device_IsPortrait ||
                                                    GLOBAL.Device_IsPhone
                                                    ? 1
                                                    : null,
                                            marginRight: 20,
                                            marginBottom:
                                                GLOBAL.Device_IsPortrait
                                                    ? 20
                                                    : 0,
                                        }}
                                    >
                                        <Text h5>
                                            {LANG.getTranslation('audio')}
                                        </Text>
                                        <View style={{ margin: 10 }}>
                                            <FlatList
                                                //key={audioTracks}
                                                extraData={audioTracks}
                                                data={audioTracks}
                                                numColumns={1}
                                                horizontal={false}
                                                removeClippedSubviews={true}
                                                keyExtractor={(item, index) =>
                                                    index.toString()
                                                }
                                                onScrollToIndexFailed={() => { }}
                                                renderItem={renderAudio}
                                            />
                                        </View>
                                    </View>
                                ) : null}
                                {textTracks.length > 0 ? (
                                    <View
                                        style={{
                                            flex:
                                                !GLOBAL.Device_IsPortrait ||
                                                    GLOBAL.Device_IsPhone
                                                    ? 1
                                                    : null,
                                            marginRight: 20,
                                            marginBottom:
                                                GLOBAL.Device_IsPortrait
                                                    ? 20
                                                    : 0,
                                        }}
                                    >
                                        <Text h5>
                                            {LANG.getTranslation('subtitling')}
                                        </Text>
                                        <View style={{ margin: 10 }}>
                                            <FlatList
                                                //key={textTracks}
                                                extraData={textTracks}
                                                data={textTracks}
                                                numColumns={1}
                                                horizontal={false}
                                                removeClippedSubviews={true}
                                                keyExtractor={(item, index) =>
                                                    index.toString()
                                                }
                                                onScrollToIndexFailed={() => { }}
                                                renderItem={renderText}
                                            />
                                        </View>
                                    </View>
                                ) : null}

                                <View
                                    style={{
                                        flex:
                                            !GLOBAL.Device_IsPortrait ||
                                                GLOBAL.Device_IsPhone
                                                ? 1
                                                : null,
                                        marginRight: 20,
                                        marginBottom: GLOBAL.Device_IsPortrait
                                            ? 20
                                            : 0,
                                    }}
                                >
                                    <Text h5>
                                        {LANG.getTranslation('video')}
                                    </Text>
                                    <View style={{ margin: 10 }}>
                                        <FlatList
                                            //key={videoModes}
                                            extraData={videoModes}
                                            data={videoModes}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderVideo}
                                        />
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                ) : null}
                {support ? (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            flex: 1,
                            width: GLOBAL.Device_IsPhone
                                ? Platform.OS == 'ios'
                                    ? '100%'
                                    : sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                position: 'absolute',
                                zIndex: 99999,
                                left: 20,
                                top: 10,
                                alignItems:
                                    Platform.OS == 'ios'
                                        ? 'center'
                                        : 'flex-end',
                            }}
                        >
                            <FocusButton onPress={onCloseSupport}>
                                <FontAwesome5
                                    style={{
                                        fontSize: 22,
                                        color: '#fff',
                                        padding: 10,
                                    }}
                                    // icon={SolidIcons.times}
                                    name="times"
                                />
                            </FocusButton>
                        </View>
                        <View
                            style={{
                                flexDirection: !GLOBAL.Device_IsWebTvMobile
                                    ? 'row'
                                    : 'column',
                            }}
                        >
                            <View
                                style={{
                                    flex:
                                        !GLOBAL.Device_IsPortrait ||
                                            GLOBAL.Device_IsPhone
                                            ? 1
                                            : null,
                                }}
                            >
                                <Text h5>
                                    {LANG.getTranslation('problem_report')}
                                </Text>
                                <View style={{ margin: 10 }}>
                                    <FlatList
                                        //key={videoModes}
                                        extraData={reportTypes}
                                        data={reportTypes}
                                        numColumns={1}
                                        horizontal={false}
                                        removeClippedSubviews={true}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        onScrollToIndexFailed={() => { }}
                                        renderItem={renderReport}
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1, margin: 50 }}>
                                {supportSuccess ? (
                                    <Text h5>
                                        {LANG.getTranslation(
                                            'thank_you_problem',
                                        )}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    </View>
                ) : null}
                {showChannelList ? (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            width: GLOBAL.Device_IsPhone
                                ? Platform.OS == 'ios'
                                    ? '100%'
                                    : sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                right: 20,
                                top: 10,
                                alignItems:
                                    Platform.OS == 'ios'
                                        ? 'center'
                                        : 'flex-end',
                            }}
                        >
                            <FocusButton onPress={onCloseChannelList}>
                                <FontAwesome5
                                    style={{
                                        fontSize: 22,
                                        color: '#fff',
                                        padding: 10,
                                    }}
                                    // icon={SolidIcons.times}
                                    name="times"
                                />
                            </FocusButton>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {content.categories.length > 0 ? (
                                <View style={{ flex: 1.5, marginRight: 10 }}>
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('categories')}
                                    </Text>

                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            //key={audioTracks}
                                            extraData={content.categories}
                                            data={content.categories}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            //initialScrollIndex={categoryIndex}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderCategories}
                                        />
                                    </View>
                                </View>
                            ) : null}

                            <View style={{ flex: 3, marginRight: 10 }}>
                                <Text h5 style={{ margin: 5 }}>
                                    {LANG.getTranslation('channels')}
                                </Text>
                                <View>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor: '#222',
                                            borderRadius: 5,
                                            marginHorizontal: 5,
                                            marginBottom: 5,
                                            marginTop: 1,
                                        }}
                                    >
                                        {/* {showVoiceButton &&
                                            <View style={{ alignSelf: 'center', alignItems: 'flex-end', paddingBottom: 5 }}>
                                                <Button style={{ borderRadius: 5 }} appearance='ghost' accessoryLeft={SpeechIcon} onPress={onStartSpeech} />
                                            </View>
                                        } */}
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignSelf: 'center',
                                                paddingVertical: 5,
                                                marginHorizontal: 5,
                                            }}
                                        >
                                            <Input
                                                style={{
                                                    width: '100%',
                                                    borderRadius: 5,
                                                    backgroundColor:
                                                        'transparent',
                                                }}
                                                //value={searchTerm}
                                                placeholder={
                                                    LANG.getTranslation(
                                                        'filter',
                                                    ) + '...'
                                                }
                                                accessoryLeft={SearchIcon}
                                                autoComplete={'off'}
                                                underlineColorAndroid="transparent"
                                                selectionColor={'#000'}
                                                onChangeText={nextValue =>
                                                    onSearchChannels(nextValue)
                                                }
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            key={extraSearchResults}
                                            extraData={extraSearchResults}
                                            data={extraSearchResults}
                                            horizontal={true}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderExtra}
                                        />
                                    </View>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FlatList
                                        key={channelList}
                                        extraData={channelList}
                                        data={channelList}
                                        numColumns={1}
                                        horizontal={false}
                                        removeClippedSubviews={true}
                                        initialScrollIndex={channelIndex}
                                        getItemLayout={(data, index) => {
                                            return {
                                                length: sizes.width * 0.1,
                                                index,
                                                offset:
                                                    sizes.width * 0.1 * index,
                                            };
                                        }}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        onScrollToIndexFailed={() => { }}
                                        renderItem={renderChannel}
                                    />
                                </View>
                            </View>

                            <View style={{ flex: 2 }}>
                                <Text h5 style={{ margin: 5 }}>
                                    {LANG.getTranslation('tv_guide')}
                                </Text>
                                {epgList.length > 0 && (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor: '#222',
                                            borderRadius: 5,
                                            padding: 5,
                                            marginTop: 1,
                                            marginBottom: 5,
                                            paddingLeft: 10,
                                        }}
                                    >
                                        <View>
                                            <Image
                                                source={{
                                                    uri:
                                                        GLOBAL.ImageUrlCMS +
                                                        channelSelected.icon_big,
                                                }}
                                                style={{ width: 35, height: 35 }}
                                            ></Image>
                                        </View>
                                        <View
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                marginLeft: 10,
                                                marginRight: 10,
                                            }}
                                        >
                                            <Text bold numberOfLines={1}>
                                                {channelSelected.channel_number}
                                                . {channelSelected.name}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <FlatList
                                        key={epgList}
                                        extraData={epgList}
                                        data={epgList}
                                        numColumns={1}
                                        horizontal={false}
                                        initialScrollIndex={programIndex}
                                        keyExtractor={(item, index) =>
                                            index.toString()
                                        }
                                        getItemLayout={(data, index) => {
                                            return {
                                                length: GLOBAL.Device_IsPortrait
                                                    ? sizes.width * 0.13
                                                    : sizes.height * 0.06,
                                                index,
                                                offset:
                                                    (GLOBAL.Device_IsPortrait
                                                        ? sizes.width * 0.13
                                                        : sizes.height * 0.06) *
                                                    index,
                                            };
                                        }}
                                        onScrollToIndexFailed={() => { }}
                                        renderItem={renderProgram}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}
                {showSeasonList ? (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            flex: 1,
                            width: GLOBAL.Device_IsPhone
                                ? Platform.OS == 'ios'
                                    ? '100%'
                                    : sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                right: 20,
                                top: 10,
                                alignItems:
                                    Platform.OS == 'ios'
                                        ? 'center'
                                        : 'flex-end',
                            }}
                        >
                            <FocusButton onPress={onCloseSeasonList}>
                                <FontAwesome5
                                    style={{
                                        fontSize: 22,
                                        color: '#fff',
                                        padding: 10,
                                    }}
                                    // icon={SolidIcons.times}
                                    name="times"
                                />
                            </FocusButton>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {content.series.season.length > 0 ? (
                                <View style={{ flex: 1.5, marginRight: 10 }}>
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('seasons')}
                                    </Text>
                                    <View style={{}}>
                                        <FlatList
                                            //key={audioTracks}
                                            extraData={content.series.season}
                                            data={content.series.season}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            initialScrollIndex={seasonIndex}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderSeason}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {episodeList.length > 0 ? (
                                <View
                                    style={{
                                        flex: 3,
                                        marginRight: 10,
                                        paddingBottom: GLOBAL.Device_IsPhone
                                            ? 0
                                            : 0,
                                    }}
                                >
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('episodes')}
                                    </Text>
                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            //key={textTracks}
                                            extraData={episodeList}
                                            data={episodeList}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            initialScrollIndex={episodeIndex}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderEpisode}
                                        />
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}
                {showEducationList ? (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            flex: 1,
                            width: GLOBAL.Device_IsPhone
                                ? Platform.OS == 'ios'
                                    ? '100%'
                                    : sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                right: 20,
                                top: 10,
                                alignItems:
                                    Platform.OS == 'ios'
                                        ? 'center'
                                        : 'flex-end',
                            }}
                        >
                            <FocusButton onPress={onCloseEducationList}>
                                <FontAwesome5
                                    style={{
                                        fontSize: 22,
                                        color: '#fff',
                                        padding: 10,
                                    }}
                                    // icon={SolidIcons.times}
                                    name="times"
                                />
                            </FocusButton>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {content.year.course.length > 0 ? (
                                <View style={{ flex: 1.5, marginRight: 10 }}>
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('courses')}
                                    </Text>
                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            //key={audioTracks}
                                            extraData={content.year.course}
                                            data={content.year.course}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            initialScrollIndex={courseIndex}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderCourse}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {lessonList.length > 0 ? (
                                <View style={{ flex: 3, marginRight: 10 }}>
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('lessons')}
                                    </Text>
                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            //key={textTracks}
                                            extraData={lessonList}
                                            data={lessonList}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            initialScrollIndex={lessonIndex}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderLesson}
                                        />
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}
                {movieList ? (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            flex: 1,
                            width: GLOBAL.Device_IsPhone
                                ? Platform.OS == 'ios'
                                    ? '100%'
                                    : sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                right: 20,
                                top: 10,
                                alignItems:
                                    Platform.OS == 'ios'
                                        ? 'center'
                                        : 'flex-end',
                            }}
                        >
                            <FocusButton onPress={onCloseMoviesList}>
                                <FontAwesome5
                                    style={{
                                        fontSize: 22,
                                        color: '#fff',
                                        padding: 10,
                                    }}
                                    // icon={SolidIcons.times}
                                    name="times"
                                />
                            </FocusButton>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {moviesList.length > 0 ? (
                                <View style={{ flex: 3, marginTop: 10 }}>
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('movies')}
                                    </Text>
                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            //key={textTracks}
                                            extraData={moviesList}
                                            data={moviesList}
                                            numColumns={5}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderMovie}
                                        />
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}
                {showCatchupList ? (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            flex: 1,
                            width: GLOBAL.Device_IsPhone
                                ? Platform.OS == 'ios'
                                    ? '100%'
                                    : sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                right: 20,
                                top: 10,
                                alignItems:
                                    Platform.OS == 'ios'
                                        ? 'center'
                                        : 'flex-end',
                            }}
                        >
                            <FocusButton onPress={onCloseCatchupTVList}>
                                <FontAwesome5
                                    style={{
                                        fontSize: 22,
                                        color: '#fff',
                                        padding: 10,
                                    }}
                                    // icon={SolidIcons.times}
                                    name="times"
                                />
                            </FocusButton>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {content.channels.length > 0 ? (
                                <View style={{ flex: 1.5, marginRight: 10 }}>
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('channels')}
                                    </Text>
                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            //key={content.channels}
                                            extraData={content.channels}
                                            data={content.channels}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            initialScrollIndex={categoryIndex}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderChannelCategory}
                                        />
                                    </View>
                                </View>
                            ) : null}
                            {programList.length > 0 ? (
                                <View style={{ flex: 3, marginRight: 10 }}>
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('programs')}
                                    </Text>
                                    <View style={{ flex: 1, marginTop: 2 }}>
                                        <FlatList
                                            //key={textTracks}
                                            extraData={programList}
                                            data={programList}
                                            numColumns={1}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            initialScrollIndex={programIndex}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderPrograms}
                                        />
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}

                {showRecordingList ? (
                    <View
                        style={{
                            position: 'absolute',
                            zIndex: 9999,
                            flex: 1,
                            width: GLOBAL.Device_IsPhone
                                ? Platform.OS == 'ios'
                                    ? '100%'
                                    : sizes.height
                                : sizes.width,
                            height: GLOBAL.Device_IsPhone
                                ? sizes.width
                                : sizes.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.90)',
                            padding: 20,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 99999,
                                right: 20,
                                top: 10,
                                alignItems:
                                    Platform.OS == 'ios'
                                        ? 'center'
                                        : 'flex-end',
                            }}
                        >
                            <FocusButton onPress={onCloseRecordingList}>
                                <FontAwesome5
                                    style={{
                                        fontSize: 22,
                                        color: '#fff',
                                        padding: 10,
                                    }}
                                    // icon={SolidIcons.times}
                                    name="times"
                                />
                            </FocusButton>
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            {recordingsList.length > 0 ? (
                                <View
                                    style={{
                                        flex: 3,
                                        marginRight: 10,
                                        marginBottom: 50,
                                    }}
                                >
                                    <Text h5 style={{ margin: 5 }}>
                                        {LANG.getTranslation('recordings')}
                                    </Text>
                                    <View style={{ flex: 1, marginTop: 2 }}>
                                        <FlatList
                                            //key={textTracks}
                                            extraData={recordingsList}
                                            data={recordingsList}
                                            numColumns={3}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={renderRecording}
                                        />
                                    </View>
                                </View>
                            ) : null}
                        </View>
                    </View>
                ) : null}
            </View>
        );
    }
};

export default Player;
