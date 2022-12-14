import React, { useEffect, useState, useRef, useCallback } from 'react';
import SIZES from '../../../constants/sizes';
import { Block, Text, Message } from '../../../components/';
import {
    View,
    StyleSheet,
    Platform,
    Image,
    TouchableOpacity,
    AppState,
    BackHandler,
    TVMenuControl,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Button, Modal, Card } from '@ui-kitten/components';
import { useFocusEffect } from '@react-navigation/native';
import TimerMixin from 'react-timer-mixin';
import Player_Utils from '../../../components/Player_Utils';
import Video from 'react-native-video/dom/Video';
// import {RegularIcons, SolidIcons} from 'react-native-fontawesome';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
// import GLOBALModule from '../../../../datalayer/global';
var GLOBALModule = require('../../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import KeepAwake from 'react-native-keep-awake';
import { sendPageReport } from '../../../../reporting/reporting';
import { useTheme } from '../../../hooks';
import UTILS from '../../../../datalayer/utils';

var screenWidth = Dimensions.get('window').width;
if (GLOBAL.Device_IsPhone) {
    if (Dimensions.get('window').width < Dimensions.get('window').height) {
        screenWidth = Dimensions.get('window').width;
    } else {
        screenWidth = Dimensions.get('window').height;
    }
}

export default ({ navigation }): React.ReactElement => {
    var closeAppTimer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const { sizes_ } = useTheme();
    const [news, setNews] = useState({
        newsIndex: 0,
        newsText: '',
        newsDate: '',
        length: 0,
        news: [],
    });
    const [hidePlayer, setHidePlayer] = useState(true);
    const [paused, setPaused] = useState(false);
    const [channels, setChannels] = useState([]);
    const [movies, setMovies] = useState([]);
    const [showCloseAppModal, setShowCloseAppModal] = useState(false);
    const [backPressedCount, setBackPressedCount] = useState(0);
    var sizes = SIZES.getSizing();
    const [allStreamValues, setAllStreamValues] = useState({
        url: 'https://',
        type: 'm3u8',
        drmType: null,
        drmKey: '',
        drmLicenseServerUrl: '',
        drmCertificateUrl: '',
        drmSupplierType: '',
    });
    const [channelSelected, setChannelSelected] = useState([]);
    const [mute, setMute] = useState(GLOBAL.Device_IsWebTV ? false : true);
    const [audioTrackIndex, setAudioTrackIndex] = useState(-1);
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        return () => sendPageReport('Home', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        const willFocusSubscription = navigation.addListener('focus', () => {
            setHidePlayer(false);
        });
        return willFocusSubscription;
    }, []);
    useEffect(() => {
        if (GLOBAL.Device_IsWebTV == false) {
            AppState.addEventListener('change', _handleAppStateChange);
        }
        setBackPressedCount(0);
        if (
            GLOBAL.Metro.metronewsitems != undefined &&
            GLOBAL.Metro.metronewsitems.length > 0
        ) {
            let newsIn = GLOBAL.Metro.metronewsitems;
            news.news = newsIn;
            news.newsIndex = 0;
            news.newsText = newsIn[0].description;
            news.newsDate = newsIn[0].date;
            news.length = newsIn.length;
            setNews(news);
        }

        // let channels_ = [];
        //var channelsOut
        //if (GLOBAL.Metro.metrortvitems != undefined) {
        var channelsOut = GLOBAL.Metro.metrortvitems;
        //channelsOut = channels_.sort((a, b) => a.channel_number - b.channel_number);
        // }
        setChannels(channelsOut);

        let movies_ = [];
        if (GLOBAL.Metro.metromovieitems != undefined) {
            movies_ = GLOBAL.Metro.metromovieitems;
        }
        if (movies_.length != undefined) {
            setMovies(movies_);
        }

        if (GLOBAL.Channel.length == 0) {
            if (channelsOut.length > 0) {
                GLOBAL.Channel = UTILS.getChannelById(
                    channelsOut[0].channel_id,
                );
                setChannelSelected(GLOBAL.Channel);
                var url = 'https://';
                if (GLOBAL.Device_IsSmartTV) {
                    url = GLOBAL.Channel.tizen_webos;
                } else if (
                    GLOBAL.Device_Manufacturer == 'Apple' ||
                    GLOBAL.Device_IsPwaIOS
                ) {
                    url = GLOBAL.Channel.ios_tvos;
                } else {
                    url = GLOBAL.Channel.url_high;
                }
                var setDrmSupplierType = '';
                var setDrmKey = '';
                var setDrmCertificateUrl = '';
                var setDrmLicenseServerUrl = '';
                var setDrmUrl = '';
                var type = '';
                var url_ = '';
                if (GLOBAL.Channel.drm_stream) {
                    if (GLOBAL.Channel.drm.drm_type == 'buydrm') {
                        (async () => {
                            let drm =
                                await Player_Utils.getDrmWidevineFairplayBuyDRMKey(
                                    url,
                                    GLOBAL.Channel,
                                );
                            if (drm != undefined) {
                                setDrmSupplierType = 'buydrm';
                                setDrmKey = drm.drmKey;
                                setDrmCertificateUrl = drm.certificateUrl;
                                setDrmLicenseServerUrl = drm.licenseServer;
                                setDrmUrl = drm.url;
                                type = Player_Utils.getStreamType(setDrmUrl);
                                (async () => {
                                    url_ =
                                        await Player_Utils.setPlayerTokenType(
                                            setDrmUrl,
                                            getTokenType(GLOBAL.Channel),
                                        );
                                    if (url_.indexOf('npplayout_') > -1) {
                                        //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                                        var queryString = '';
                                        queryString +=
                                            '&ads.did=' +
                                            GLOBAL.Device_UniqueID;
                                        queryString +=
                                            '&ads.app_name=' + GLOBAL.IMS;
                                        queryString +=
                                            '&ads.app_bundle=' + GLOBAL.Package;
                                        // queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                                        queryString +=
                                            '&ads.channel_name=' +
                                            encodeURI(GLOBAL.Channel.name);
                                        queryString += '&ads.us_privacy=1---';
                                        queryString += '&ads.schain=1';
                                        queryString += '&ads.w=1980';
                                        queryString += '&ads.h=1080';
                                        url_ += queryString;
                                    }
                                    setAllStreamValues({
                                        ...allStreamValues,
                                        url: url_,
                                        type: type,
                                        drmCertificateUrl: setDrmCertificateUrl,
                                        drmLicenseServerUrl:
                                            setDrmLicenseServerUrl,
                                        drmKey: setDrmKey,
                                        drmSupplierType: setDrmSupplierType,
                                    });
                                    setHidePlayer(false);
                                })();
                            }
                        })();
                    }
                    if (GLOBAL.Channel.drm.drm_type == 'irdeto') {
                        (async () => {
                            let drm =
                                await Player_Utils.getDrmWidevineFairplayIrdetoKey(
                                    GLOBAL.DRM_KeyServerURL,
                                    GLOBAL.Channel,
                                );
                            if (drm != undefined) {
                                setDrmSupplierType = 'irdeto';
                                setDrmLicenseServerUrl = drm.drmServerUrl;
                                setDrmCertificateUrl = drm.certificateUrl;
                                setDrmUrl = drm.url;
                                type = Player_Utils.getStreamType(setDrmUrl);
                                (async () => {
                                    url_ =
                                        await Player_Utils.setPlayerTokenType(
                                            setDrmUrl,
                                            getTokenType(GLOBAL.Channel),
                                        );
                                    if (url_.indexOf('npplayout_') > -1) {
                                        //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                                        var queryString = '';
                                        queryString +=
                                            '&ads.did=' +
                                            GLOBAL.Device_UniqueID;
                                        queryString +=
                                            '&ads.app_name=' + GLOBAL.IMS;
                                        queryString +=
                                            '&ads.app_bundle=' + GLOBAL.Package;
                                        //queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                                        queryString +=
                                            '&ads.channel_name=' +
                                            encodeURI(GLOBAL.Channel.name);
                                        queryString += '&ads.us_privacy=1---';
                                        queryString += '&ads.schain=1';
                                        queryString += '&ads.w=1980';
                                        queryString += '&ads.h=1080';
                                        url_ += queryString;
                                    }
                                    setAllStreamValues({
                                        ...allStreamValues,
                                        url: url_,
                                        type: type,
                                        drmCertificateUrl: setDrmCertificateUrl,
                                        drmLicenseServerUrl:
                                            setDrmLicenseServerUrl,
                                        drmKey: setDrmKey,
                                        drmSupplierType: setDrmSupplierType,
                                    });
                                    setHidePlayer(false);
                                })();
                            }
                        })();
                    }
                } else {
                    type = Player_Utils.getStreamType(url);
                    (async () => {
                        url_ = await Player_Utils.setPlayerTokenType(
                            url,
                            getTokenType(GLOBAL.Channel),
                        );
                        if (url_.indexOf('npplayout_') > -1) {
                            //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                            var queryString = '';
                            queryString += '&ads.did=' + GLOBAL.Device_UniqueID;
                            queryString += '&ads.app_name=' + GLOBAL.IMS;
                            queryString += '&ads.app_bundle=' + GLOBAL.Package;
                            //queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                            queryString +=
                                '&ads.channel_name=' +
                                encodeURI(GLOBAL.Channel.name);
                            queryString += '&ads.us_privacy=1---';
                            queryString += '&ads.schain=1';
                            queryString += '&ads.w=1980';
                            queryString += '&ads.h=1080';
                            url_ += queryString;
                        }
                        setAllStreamValues({
                            ...allStreamValues,
                            url: url_,
                            type: type,
                            drmCertificateUrl: setDrmCertificateUrl,
                            drmLicenseServerUrl: setDrmLicenseServerUrl,
                            drmKey: setDrmKey,
                            drmSupplierType: setDrmSupplierType,
                        });
                        setHidePlayer(false);
                    })();
                }
            }
        } else {
            setChannelSelected(GLOBAL.Channel);
            var url = '';
            if (GLOBAL.Device_IsSmartTV) {
                url = GLOBAL.Channel.tizen_webos;
            } else if (
                GLOBAL.Device_Manufacturer == 'Apple' ||
                GLOBAL.Device_IsPwaIOS
            ) {
                url = GLOBAL.Channel.ios_tvos;
            } else {
                url = GLOBAL.Channel.url_high;
            }

            var setDrmSupplierType = '';
            var setDrmKey = '';
            var setDrmCertificateUrl = '';
            var setDrmLicenseServerUrl = '';
            var setDrmUrl = '';
            var type = '';
            var url_ = '';
            if (GLOBAL.Channel.drm_stream) {
                if (GLOBAL.Channel.drm.drm_type == 'buydrm') {
                    (async () => {
                        let drm =
                            await Player_Utils.getDrmWidevineFairplayBuyDRMKey(
                                url,
                                GLOBAL.Channel,
                            );
                        if (drm != undefined) {
                            setDrmSupplierType = 'buydrm';
                            setDrmKey = drm.drmKey;
                            setDrmCertificateUrl = drm.certificateUrl;
                            setDrmLicenseServerUrl = drm.licenseServer;
                            setDrmUrl = drm.url;
                            type = Player_Utils.getStreamType(setDrmUrl);
                            (async () => {
                                url_ = await Player_Utils.setPlayerTokenType(
                                    setDrmUrl,
                                    getTokenType(GLOBAL.Channel),
                                );
                                if (url_.indexOf('npplayout_') > -1) {
                                    //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                                    var queryString = '';
                                    queryString +=
                                        '&ads.did=' + GLOBAL.Device_UniqueID;
                                    queryString +=
                                        '&ads.app_name=' + GLOBAL.IMS;
                                    queryString +=
                                        '&ads.app_bundle=' + GLOBAL.Package;
                                    //queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                                    queryString +=
                                        '&ads.channel_name=' +
                                        encodeURI(GLOBAL.Channel.name);
                                    queryString += '&ads.us_privacy=1---';
                                    queryString += '&ads.schain=1';
                                    queryString += '&ads.w=1980';
                                    queryString += '&ads.h=1080';
                                    url_ += queryString;
                                }
                                setAllStreamValues({
                                    ...allStreamValues,
                                    url: url_,
                                    type: type,
                                    drmCertificateUrl: setDrmCertificateUrl,
                                    drmLicenseServerUrl: setDrmLicenseServerUrl,
                                    drmKey: setDrmKey,
                                    drmSupplierType: setDrmSupplierType,
                                });
                                setHidePlayer(false);
                            })();
                        }
                    })();
                }
                if (GLOBAL.Channel.drm.drm_type == 'irdeto') {
                    (async () => {
                        let drm =
                            await Player_Utils.getDrmWidevineFairplayIrdetoKey(
                                GLOBAL.DRM_KeyServerURL,
                                GLOBAL.Channel,
                            );
                        if (drm != undefined) {
                            setDrmSupplierType = 'irdeto';
                            setDrmLicenseServerUrl = drm.drmServerUrl;
                            setDrmCertificateUrl = drm.certificateUrl;
                            setDrmUrl = drm.url;
                            type = Player_Utils.getStreamType(setDrmUrl);
                            (async () => {
                                url_ = await Player_Utils.setPlayerTokenType(
                                    setDrmUrl,
                                    getTokenType(GLOBAL.Channel),
                                );
                                if (url_.indexOf('npplayout_') > -1) {
                                    //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                                    var queryString = '';
                                    queryString +=
                                        '&ads.did=' + GLOBAL.Device_UniqueID;
                                    queryString +=
                                        '&ads.app_name=' + GLOBAL.IMS;
                                    queryString +=
                                        '&ads.app_bundle=' + GLOBAL.Package;
                                    // queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                                    queryString +=
                                        '&ads.channel_name=' +
                                        encodeURI(GLOBAL.Channel.name);
                                    queryString += '&ads.us_privacy=1---';
                                    queryString += '&ads.schain=1';
                                    queryString += '&ads.w=1980';
                                    queryString += '&ads.h=1080';
                                    url_ += queryString;
                                }
                                setAllStreamValues({
                                    ...allStreamValues,
                                    url: url_,
                                    type: type,
                                    drmCertificateUrl: setDrmCertificateUrl,
                                    drmLicenseServerUrl: setDrmLicenseServerUrl,
                                    drmKey: setDrmKey,
                                    drmSupplierType: setDrmSupplierType,
                                });
                                setHidePlayer(false);
                            })();
                        }
                    })();
                }
            } else {
                type = Player_Utils.getStreamType(url);
                (async () => {
                    url_ = await Player_Utils.setPlayerTokenType(
                        url,
                        getTokenType(GLOBAL.Channel),
                    );
                    if (url_.indexOf('npplayout_') > -1) {
                        //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                        var queryString = '';
                        queryString += '&ads.did=' + GLOBAL.Device_UniqueID;
                        queryString += '&ads.app_name=' + GLOBAL.IMS;
                        queryString += '&ads.app_bundle=' + GLOBAL.Package;
                        // queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                        queryString +=
                            '&ads.channel_name=' +
                            encodeURI(GLOBAL.Channel.name);
                        queryString += '&ads.us_privacy=1---';
                        queryString += '&ads.schain=1';
                        queryString += '&ads.w=1980';
                        queryString += '&ads.h=1080';
                        url_ += queryString;
                    }
                    setAllStreamValues({
                        ...allStreamValues,
                        url: url_,
                        type: type,
                        drmCertificateUrl: setDrmCertificateUrl,
                        drmLicenseServerUrl: setDrmLicenseServerUrl,
                        drmKey: setDrmKey,
                        drmSupplierType: setDrmSupplierType,
                    });
                    setHidePlayer(false);
                })();
            }

            setVolume(0);
        }

        return () => {
            if (GLOBAL.Device_IsWebTV == false) {
                AppState.removeEventListener('change', _handleAppStateChange);
            }
            if (GLOBAL.Device_IsWebTV == true) {
                AppState.removeEventListener('change', _handleAppStateChange);
                // killVideoJSPlayer();
            }
            setHidePlayer(true);
            TimerMixin.clearTimeout(closeAppTimer);
        };
    }, [navigation]);

    const _handleAppStateChange = nextAppState => {
        if (nextAppState == 'background') {
            setAllStreamValues({
                ...allStreamValues,
                url: '',
                type: '',
                drmCertificateUrl: '',
                drmLicenseServerUrl: '',
                drmKey: '',
                drmSupplierType: '',
            });
        }
        if (nextAppState == 'active') {
            var url = '';
            if (GLOBAL.Device_IsSmartTV) {
                url = GLOBAL.Channel.tizen_webos;
            } else if (
                GLOBAL.Device_Manufacturer == 'Apple' ||
                GLOBAL.Device_IsPwaIOS
            ) {
                url = GLOBAL.Channel.ios_tvos;
            } else {
                url = GLOBAL.Channel.url_high;
            }

            var setDrmSupplierType = '';
            var setDrmKey = '';
            var setDrmCertificateUrl = '';
            var setDrmLicenseServerUrl = '';
            var setDrmUrl = '';
            var type = '';
            var url_ = '';
            if (GLOBAL.Channel.drm_stream) {
                if (GLOBAL.Channel.drm.drm_type == 'buydrm') {
                    (async () => {
                        let drm =
                            await Player_Utils.getDrmWidevineFairplayBuyDRMKey(
                                url,
                                GLOBAL.Channel,
                            );
                        if (drm != undefined) {
                            setDrmSupplierType = 'buydrm';
                            setDrmKey = drm.drmKey;
                            setDrmCertificateUrl = drm.certificateUrl;
                            setDrmLicenseServerUrl = drm.licenseServer;
                            setDrmUrl = drm.url;
                            type = Player_Utils.getStreamType(setDrmUrl);
                            (async () => {
                                url_ = await Player_Utils.setPlayerTokenType(
                                    setDrmUrl,
                                    getTokenType(GLOBAL.Channel),
                                );
                                if (url_.indexOf('npplayout_') > -1) {
                                    //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                                    var queryString = '';
                                    queryString +=
                                        '&ads.did=' + GLOBAL.Device_UniqueID;
                                    queryString +=
                                        '&ads.app_name=' + GLOBAL.IMS;
                                    queryString +=
                                        '&ads.app_bundle=' + GLOBAL.Package;
                                    //  queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                                    queryString +=
                                        '&ads.channel_name=' +
                                        encodeURI(GLOBAL.Channel.name);
                                    queryString += '&ads.us_privacy=1---';
                                    queryString += '&ads.schain=1';
                                    queryString += '&ads.w=1980';
                                    queryString += '&ads.h=1080';
                                    url_ += queryString;
                                }
                                setAllStreamValues({
                                    ...allStreamValues,
                                    url: url_,
                                    type: type,
                                    drmCertificateUrl: setDrmCertificateUrl,
                                    drmLicenseServerUrl: setDrmLicenseServerUrl,
                                    drmKey: setDrmKey,
                                    drmSupplierType: setDrmSupplierType,
                                });
                                setHidePlayer(false);
                            })();
                        }
                    })();
                }
                if (GLOBAL.Channel.drm.drm_type == 'irdeto') {
                    (async () => {
                        let drm =
                            await Player_Utils.getDrmWidevineFairplayIrdetoKey(
                                GLOBAL.DRM_KeyServerURL,
                                GLOBAL.Channel,
                            );
                        if (drm != undefined) {
                            setDrmSupplierType = 'irdeto';
                            setDrmLicenseServerUrl = drm.drmServerUrl;
                            setDrmCertificateUrl = drm.certificateUrl;
                            setDrmUrl = drm.url;
                            type = Player_Utils.getStreamType(setDrmUrl);
                            (async () => {
                                url_ = await Player_Utils.setPlayerTokenType(
                                    setDrmUrl,
                                    getTokenType(GLOBAL.Channel),
                                );
                                if (url_.indexOf('npplayout_') > -1) {
                                    //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                                    var queryString = '';
                                    queryString +=
                                        '&ads.did=' + GLOBAL.Device_UniqueID;
                                    queryString +=
                                        '&ads.app_name=' + GLOBAL.IMS;
                                    queryString +=
                                        '&ads.app_bundle=' + GLOBAL.Package;
                                    // queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                                    queryString +=
                                        '&ads.channel_name=' +
                                        encodeURI(GLOBAL.Channel.name);
                                    queryString += '&ads.us_privacy=1---';
                                    queryString += '&ads.schain=1';
                                    queryString += '&ads.w=1980';
                                    queryString += '&ads.h=1080';
                                    url_ += queryString;
                                }
                                setAllStreamValues({
                                    ...allStreamValues,
                                    url: url_,
                                    type: type,
                                    drmCertificateUrl: setDrmCertificateUrl,
                                    drmLicenseServerUrl: setDrmLicenseServerUrl,
                                    drmKey: setDrmKey,
                                    drmSupplierType: setDrmSupplierType,
                                });
                                setHidePlayer(false);
                            })();
                        }
                    })();
                }
            } else {
                type = Player_Utils.getStreamType(url);
                (async () => {
                    url_ = await Player_Utils.setPlayerTokenType(
                        url,
                        getTokenType(GLOBAL.Channel),
                    );
                    if (url_.indexOf('npplayout_') > -1) {
                        //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                        var queryString = '';
                        queryString += '&ads.did=' + GLOBAL.Device_UniqueID;
                        queryString += '&ads.app_name=' + GLOBAL.IMS;
                        queryString += '&ads.app_bundle=' + GLOBAL.Package;
                        // queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                        queryString +=
                            '&ads.channel_name=' +
                            encodeURI(GLOBAL.Channel.name);
                        queryString += '&ads.us_privacy=1---';
                        queryString += '&ads.schain=1';
                        queryString += '&ads.w=1980';
                        queryString += '&ads.h=1080';
                        url_ += queryString;
                    }
                    setAllStreamValues({
                        ...allStreamValues,
                        url: url_,
                        type: type,
                        drmCertificateUrl: '',
                        drmLicenseServerUrl: '',
                        drmKey: '',
                        drmSupplierType: '',
                    });
                    setHidePlayer(false);
                })();
            }
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

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', () => {
                setBackPressedCount(backPressedCount => backPressedCount + 1);
                setShowCloseAppModal(true);
                startCloseAppTimer();
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
        if (backPressedCount === 2) {
            BackHandler.exitApp();
        }
    }, [backPressedCount]);

    const startCloseAppTimer = () => {
        TimerMixin.clearTimeout(closeAppTimer);
        closeAppTimer = TimerMixin.setTimeout(() => {
            setBackPressedCount(0);
            setShowCloseAppModal(false);
        }, 2000);
    };

    const onOpenMovieDetails = item => {
        setHidePlayer(true);
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
                style={{ borderRadius: 5 }}
                onPress={() => onOpenMovieDetails(item)}
            >
                <View
                    style={{
                        margin: 5,
                        alignContent: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <FocusButton onPress={() => onOpenMovieDetails(item)}>
                        <View style={{ flex: 1 }}>
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                                style={[
                                    {
                                        borderColor: '#222',
                                        borderWidth: 4,
                                        borderRadius: 5,
                                        width: sizes.width * 0.4,
                                        height: sizes.width * 0.4 * 1.5,
                                    },
                                ]}
                            ></Image>
                            <Text
                                bold
                                shadow
                                numberOfLines={1}
                                style={{
                                    marginTop: 5,
                                    marginLeft: 5,
                                    width: sizes.width * 0.39 - 10,
                                }}
                            >
                                {item.name}
                            </Text>
                        </View>
                    </FocusButton>
                </View>
            </FocusButton>
        );
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
                        width: sizes.width * 0.58 * percentageProgram,
                    }}
                ></View>
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
                            }}
                        >
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
                            }}
                        >
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
            var foundIt = false;
            category_.channels.forEach((channel_, index_) => {
                if (index != 1) {
                    if (
                        channel_.channel_id == item.channel_id &&
                        foundIt == false
                    ) {
                        foundIt = true;
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
        setHidePlayer(true);
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

    const renderChannel = ({ item }) => {
        return (
            <View
                style={{
                    margin: 5,
                    alignContent: 'center',
                    justifyContent: 'center',
                }}
            >
                <FocusButton
                    style={{ borderRadius: 5 }}
                    onPress={() => onPlayChannel(item)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            borderRadius: 5,
                            borderColor: '#222',
                            borderWidth: 3,
                        }}
                    >
                        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.20)' }}>
                            <Image
                                source={{
                                    uri:
                                        GLOBAL.ImageUrlCMS + item.channel_image,
                                }}
                                style={{
                                    margin: 10,
                                    width: sizes.width * 0.26,
                                    height: sizes.width * 0.26,
                                }}
                            ></Image>
                        </View>
                        <View
                            style={{
                                width: sizes.width * 0.65,
                                padding: 15,
                                backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            }}
                        >
                            <Text h5 bold shadow numberOfLines={1}>
                                {item.channel_number} {item.name}
                            </Text>
                            {getTvProgram(item)}
                        </View>
                    </View>
                </FocusButton>
            </View>
        );
    };
    const LeftIcon = props => (
        <Icon {...props} fill="#fff" name="arrow-ios-back-outline" />
    );
    const RightIcon = props => (
        <Icon {...props} fill="#fff" name="arrow-ios-forward-outline" />
    );
    const onPressNewsReload = index => {
        var newIndex = news.newsIndex + index;
        if (newIndex >= 0 && newIndex < news.news.length) {
            let newsIn = news.news;
            let newsOut = news;
            newsOut.newsIndex = newIndex;
            newsOut.newsText = newsIn[newIndex].description;
            newsOut.newsDate = newsIn[newIndex].date;
            setNews(prevValues => {
                return { ...prevValues, newsOut };
            });
        }
    };
    const unMutePlayer = () => {
        if (GLOBAL.Device_Manufacturer == 'Apple') {
            if (volume == 0) {
                setVolume(100);
            } else {
                setVolume(0);
            }
        } else {
            if (audioTrackIndex == 0) {
                setAudioTrackIndex(-1);
            } else {
                setAudioTrackIndex(0);
            }
        }
        setMute(!mute);
    };
    return (
        <Block
            marginTop={GLOBAL.App_Theme == 'Akua' ? 25 : 0}
            scroll
            showsVerticalScrollIndicator={false}
        >
            <Modal
                style={{
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.8
                        : sizes.width * 0.3,
                }}
                visible={showCloseAppModal}
                onBackdropPress={() => setShowCloseAppModal(false)}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}
            >
                <Card disabled={true}>
                    <Text h5 bold>
                        {LANG.getTranslation('exit_app')}
                    </Text>
                    <Text>{LANG.getTranslation('exit_app_click_again')}</Text>
                    <Text>{LANG.getTranslation('exit_app_close')}</Text>
                </Card>
            </Modal>
            <View
                style={{
                    position: 'absolute',
                    zIndex: 9999,
                    top: 5,
                    left: 0,
                    right: 0,
                    flex: 1,
                    width: sizes.width,
                    marginVertical: 0,
                    alignSelf: 'center',
                }}
            >
                <Message> </Message>
            </View>

            <View style={{ alignContent: 'center', justifyContent: 'center' }}>
                {allStreamValues.url != '' && (
                    <View
                        style={{
                            backgroundColor: '#222',
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            height: (sizes.width / 16) * 9 + 50,
                        }}
                    >
                        {!GLOBAL.Device_IsWebTV && (
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 15,
                                    right: 10,
                                    zIndex: 9999,
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: '#111',
                                        padding: 5,
                                        borderRadius: 5,
                                    }}
                                >
                                    <FocusButton onPress={unMutePlayer}>
                                        {
                                            mute ? (
                                                <FontAwesome5
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#fff',
                                                        padding: 5,
                                                    }}
                                                    // icon={
                                                    //     mute
                                                    //         ? SolidIcons.volumeMute
                                                    //         : SolidIcons.volumeUp
                                                    // }
                                                    name="volume-mute"
                                                />
                                            ) : (
                                                <FontAwesome5
                                                    style={{
                                                        fontSize: 18,
                                                        color: '#fff',
                                                        padding: 5,
                                                    }}
                                                    // icon={
                                                    //     mute
                                                    //         ? SolidIcons.volumeMute
                                                    //         : SolidIcons.volumeUp
                                                    // }
                                                    name="volume-up"
                                                />
                                            )
                                        }
                                    </FocusButton>
                                </View>
                            </View>
                        )}
                        <View
                            style={{
                                position: 'absolute',
                                bottom: 15,
                                left: 10,
                                zIndex: 9999,
                            }}
                        >
                            <View
                                style={{
                                    backgroundColor: '#111',
                                    padding: 5,
                                    borderRadius: 5,
                                }}
                            >
                                <FocusButton
                                    onPress={() =>
                                        onPlayChannel(channelSelected)
                                    }
                                >
                                    <FontAwesome5
                                        style={{
                                            fontSize: 18,
                                            color: '#fff',
                                            padding: 5,
                                        }}
                                        // icon={SolidIcons.expand}
                                        name="expand"
                                    />
                                </FocusButton>
                            </View>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                backgroundColor: '#222',
                                padding: 5,
                                marginTop: 1,
                                marginBottom: 5,
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
                                    {channelSelected.channel_number}.{' '}
                                    {channelSelected.name}
                                </Text>
                            </View>
                        </View>
                        {!hidePlayer && allStreamValues.url != 'https://' && (
                            <View
                                style={{
                                    width: sizes.width,
                                    height: (sizes.width / 16) * 9,
                                    backgroundColor: '#111',
                                }}
                            >
                                <Video
                                    source={{
                                        uri: allStreamValues.url,
                                        type: allStreamValues.type,
                                        ref: 'player',
                                        drm: Player_Utils.getDrmSetup(
                                            allStreamValues.drmSupplierType,
                                            allStreamValues,
                                        ),
                                        headers: {
                                            'User-Agent': GLOBAL.User_Agent,
                                        },
                                    }}
                                    ignoreSilentSwitch={'ignore'}
                                    streamType={'TV'}
                                    disableFocus={true}
                                    style={{
                                        width: sizes.width,
                                        height: (sizes.width / 16) * 9,
                                    }}
                                    selectedAudioTrack={{
                                        type: 'index',
                                        value: audioTrackIndex,
                                    }}
                                    volume={volume}
                                    rate={1}
                                    paused={false}
                                    resizeMode={'stretch'}
                                    repeat={false}
                                    useTextureView={false}
                                />
                            </View>
                        )}
                    </View>
                )}
            </View>
            <LinearGradient
                colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.0)']}
                style={{ flex: 1 }}
                start={{ x: 0.5, y: 0 }}
            >
                <Block paddingLeft={10} showsVerticalScrollIndicator={false}>
                    {channels.length > 0 && (
                        <View style={{ paddingTop: 20 }}>
                            <Text h5 bold shadow numberOfLines={1}>
                                {LANG.getTranslation('recommendedchannels')} (
                                {channels.length})
                            </Text>
                            <FlatList
                                style={{ marginLeft: -16 }}
                                data={channels}
                                horizontal={true}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderChannel}
                            />
                        </View>
                    )}
                    {RenderIf(
                        news.length > 0 &&
                        GLOBAL.UserInterface.home.enable_news_section ==
                        true,
                    )(
                        <View
                            style={{
                                borderRadius: 5,
                                borderColor: '#222',
                                borderWidth: 4,
                                minHeight: sizes.width * 0.4,
                                marginBottom: 20,
                                marginRight: 10,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    backgroundColor: '#rgba(0, 0, 0, 0.80)',
                                }}
                            >
                                <View style={{ flex: 1 }}>
                                    {RenderIf(news.length > 1)(
                                        <Button
                                            appearance="ghost"
                                            accessoryLeft={LeftIcon}
                                            onPress={() =>
                                                onPressNewsReload(-1)
                                            }
                                        />,
                                    )}
                                </View>
                                <View style={{ flex: 6 }}></View>
                                <View style={{ flex: 1 }}>
                                    {RenderIf(news.length > 1)(
                                        <Button
                                            appearance="ghost"
                                            accessoryLeft={RightIcon}
                                            onPress={() => onPressNewsReload(1)}
                                        />,
                                    )}
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 3,
                                    padding: 15,
                                    backgroundColor: '#rgba(0, 0, 0, 0.60)',
                                }}
                            >
                                <Text bold shadow numberOfLines={1}>
                                    {news.newsDate}
                                </Text>
                                <Text shadow>{news.newsText}</Text>
                            </View>
                        </View>,
                    )}
                    {movies.length > 0 && (
                        <View style={{ paddingTop: 0 }}>
                            <Text
                                h5
                                bold
                                shadow
                                numberOfLines={1}
                                paddingBottom={10}
                            >
                                {LANG.getTranslation('lastestmovies')} (
                                {movies.length})
                            </Text>
                            <FlatList
                                style={{ marginLeft: -10 }}
                                data={movies}
                                horizontal={true}
                                removeClippedSubviews={true}
                                keyExtractor={(item, index) => index.toString()}
                                onScrollToIndexFailed={() => { }}
                                renderItem={renderMovie}
                            />
                        </View>
                    )}
                </Block>
            </LinearGradient>
            {GLOBAL.Device_IsWebTV == false &&
                GLOBAL.Device_IsAppleTV == false && <KeepAwake />}
        </Block>
    );
};

const styles = StyleSheet.create({
    item: {
        width: screenWidth - 60,
        height: (screenWidth - 60) * 0.56,
        backgroundColor: 'transparent',
        borderRadius: 4,
    },
    imageContainer: {
        flex: 1,
        marginBottom: Platform.select({ ios: 0, android: 1 }), // Prevent a random Android rendering issue
        backgroundColor: '#000',
        borderRadius: 5,
        borderColor: '#222',
        borderWidth: 4,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: 'cover',
        borderRadius: 5,
        backgroundColor: '#000',
        borderColor: '#222',
        borderWidth: 4,
    },
});
