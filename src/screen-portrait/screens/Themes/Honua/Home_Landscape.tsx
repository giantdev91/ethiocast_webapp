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
    ScrollView,
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
import UTILS from '../../../../datalayer/utils';

var screenWidth = Dimensions.get('window').width;
//if (GLOBAL.Device_IsPhone) {
if (Dimensions.get('window').width < Dimensions.get('window').height) {
    screenWidth = Dimensions.get('window').width;
} else {
    screenWidth = Dimensions.get('window').height;
}
//}

export default ({ navigation }): React.ReactElement => {
    var closeAppTimer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [news, setNews] = useState({
        newsIndex: 0,
        newsText: '',
        newsDate: '',
        newsImage: '',
        length: 0,
        news: [],
    });
    const [hidePlayer, setHidePlayer] = useState(false);
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
    const [urlPlaying, setUrlPlaying] = useState('');
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
            news.newsImage = newsIn[0].images;
            news.length = newsIn.length;
            setNews(news);
        }

        // let channels_ = [];
        //if (GLOBAL.Metro.metrortvitems != undefined) {
        var channelsOut = GLOBAL.Metro.metrortvitems;
        //  var channelsOut = channels_.sort((a, b) => a.channel_number - b.channel_number);
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
                        margin: 3,
                        alignContent: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image
                        source={{ uri: GLOBAL.ImageUrlCMS + item.poster }}
                        style={[
                            {
                                borderColor: '#222',
                                borderWidth: 4,
                                borderRadius: 5,
                                width: sizes.width / 2 / 4 - 12,
                                height: (sizes.width / 2 / 4 - 12) * 1.5,
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
                            width: sizes.width * 0.1,
                        }}
                    >
                        {item.name}
                    </Text>
                </View>
            </FocusButton>
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
        GLOBAL.Channel = channel;
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
            <FocusButton onPress={() => onPlayChannel(item)}>
                <View
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
                        margin: 3,
                        borderRadius: 5,
                        borderColor: '#222',
                        borderWidth: 3,
                    }}
                >
                    <Image
                        source={{ uri: GLOBAL.ImageUrlCMS + item.channel_image }}
                        style={{
                            margin: 5,
                            width: sizes.width / 2 / 6 - 23,
                            height: sizes.width / 2 / 6 - 23,
                        }}
                    ></Image>
                </View>
            </FocusButton>
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
            newsOut.newsImage = newsIn[newIndex].image;
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
        <View style={{ flex: 1, marginTop: GLOBAL.App_Theme == 'Akua' ? 25 : 0 }}>
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
            <ScrollView>
                <LinearGradient
                    colors={['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.6)']}
                    style={{ flex: 1, width: null, height: null }}
                    start={{ x: 0.5, y: 0 }}
                >
                    <View style={{ flex: 1 }}>
                        <View style={{ marginTop: 10, marginHorizontal: 6 }}>
                            {RenderIf(
                                news.length > 0 &&
                                GLOBAL.UserInterface.home
                                    .enable_news_section == true,
                            )(
                                <View
                                    style={{
                                        borderRadius: 5,
                                        borderColor: '#222',
                                        borderWidth: 4,
                                        width: '100%',
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            backgroundColor:
                                                '#rgba(0, 0, 0, 0.80)',
                                        }}
                                    >
                                        <View style={{}}>
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
                                        <View style={{}}>
                                            {RenderIf(news.length > 1)(
                                                <Button
                                                    appearance="ghost"
                                                    accessoryLeft={RightIcon}
                                                    onPress={() =>
                                                        onPressNewsReload(1)
                                                    }
                                                />,
                                            )}
                                        </View>
                                    </View>
                                    <View
                                        style={{
                                            padding: 15,
                                            backgroundColor:
                                                '#rgba(0, 0, 0, 0.60)',
                                        }}
                                    >
                                        <Text bold shadow numberOfLines={1}>
                                            {news.newsDate}
                                        </Text>
                                        <Text shadow>{news.newsText}</Text>
                                    </View>
                                </View>,
                            )}
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                marginLeft: 2,
                                marginTop: 1,
                            }}
                        >
                            {movies.length > 0 && (
                                <View
                                    style={{
                                        flex: 1,
                                        marginBottom: GLOBAL.Device_IsWebTV
                                            ? 0
                                            : 50,
                                        paddingTop: 10,
                                    }}
                                >
                                    <Text
                                        h5
                                        bold
                                        shadow
                                        numberOfLines={1}
                                        paddingBottom={10}
                                        paddingLeft={10}
                                    >
                                        {LANG.getTranslation('lastestmovies')} (
                                        {movies.length})
                                    </Text>
                                    <View style={{ flex: 1 }}>
                                        <FlatList
                                            style={{ flex: 1 }}
                                            data={movies}
                                            numColumns={4}
                                            horizontal={false}
                                            removeClippedSubviews={true}
                                            keyExtractor={(item, index) =>
                                                index.toString()
                                            }
                                            onScrollToIndexFailed={() => { }}
                                            renderItem={item =>
                                                renderMovie(item)
                                            }
                                        />
                                    </View>
                                </View>
                            )}
                            <View style={{ flex: 1, flexDirection: 'column' }}>
                                {channels.length > 0 && (
                                    <View
                                        style={{
                                            padding:
                                                movies.length == 0 ? 25 : 0,
                                            backgroundColor:
                                                movies.length == 0
                                                    ? 'rgba(0, 0, 0, 0.60)'
                                                    : 'transparent',
                                            marginRight:
                                                movies.length == 0 ? 10 : 0,
                                            marginTop:
                                                movies.length == 0 ? 10 : 0,
                                            marginLeft:
                                                movies.length == 0 ? 5 : 0,
                                            borderRadius:
                                                movies.length == 0 ? 5 : 0,
                                        }}
                                    >
                                        {allStreamValues.url != 'https://' && (
                                            <View style={{}}>
                                                {!GLOBAL.Device_IsWebTV && (
                                                    <View
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            bottom: 15,
                                                            right: 20,
                                                            zIndex: 9999,
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                backgroundColor:
                                                                    '#111',
                                                                padding: 5,
                                                                borderRadius: 5,
                                                            }}
                                                        >
                                                            <FocusButton
                                                                onPress={
                                                                    unMutePlayer
                                                                }
                                                            >
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
                                                        left: 20,
                                                        zIndex: 9999,
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            backgroundColor:
                                                                '#111',
                                                            padding: 5,
                                                            borderRadius: 5,
                                                        }}
                                                    >
                                                        <FocusButton
                                                            onPress={() =>
                                                                onPlayChannel(
                                                                    channelSelected,
                                                                )
                                                            }
                                                        >
                                                            <FontAwesome5
                                                                style={{
                                                                    fontSize: 18,
                                                                    color: '#fff',
                                                                    padding: 5,
                                                                }}
                                                                // icon={
                                                                //     SolidIcons.expand
                                                                // }
                                                                name="expand"
                                                            />
                                                        </FocusButton>
                                                    </View>
                                                </View>
                                                {movies.length == 0 && (
                                                    <View
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            top: -25,
                                                            left: -20,
                                                            flexDirection:
                                                                'row',
                                                            borderRadius: 5,
                                                            padding: 5,
                                                            marginTop: 10,
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
                                                                style={{
                                                                    width: 35,
                                                                    height: 35,
                                                                }}
                                                            ></Image>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                justifyContent:
                                                                    'center',
                                                                marginLeft: 10,
                                                                marginRight: 10,
                                                            }}
                                                        >
                                                            <Text
                                                                h5
                                                                bold
                                                                shadow
                                                                numberOfLines={
                                                                    1
                                                                }
                                                            >
                                                                {
                                                                    channelSelected.channel_number
                                                                }
                                                                .{' '}
                                                                {
                                                                    channelSelected.name
                                                                }{' '}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {movies.length > 0 && (
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            borderRadius: 5,
                                                            padding: 5,
                                                            marginTop: 0,
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
                                                                style={{
                                                                    width: 32,
                                                                    height: 32,
                                                                }}
                                                            ></Image>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                justifyContent:
                                                                    'center',
                                                                marginLeft: 10,
                                                                marginRight: 10,
                                                            }}
                                                        >
                                                            <Text
                                                                h5
                                                                bold
                                                                shadow
                                                                numberOfLines={
                                                                    1
                                                                }
                                                            >
                                                                {
                                                                    channelSelected.channel_number
                                                                }
                                                                .{' '}
                                                                {
                                                                    channelSelected.name
                                                                }{' '}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                )}
                                                {!hidePlayer && (
                                                    <View
                                                        style={{
                                                            backgroundColor:
                                                                '#111',
                                                            borderRadius: 5,
                                                            width:
                                                                sizes.width /
                                                                2 -
                                                                10,
                                                            height:
                                                                ((sizes.width /
                                                                    2 -
                                                                    10) /
                                                                    16) *
                                                                9,
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
                                                                    'User-Agent':
                                                                        GLOBAL.User_Agent,
                                                                },
                                                            }}
                                                            ignoreSilentSwitch={
                                                                'ignore'
                                                            }
                                                            streamType={'TV'}
                                                            disableFocus={true}
                                                            style={{
                                                                borderWidth: 4,
                                                                borderColor:
                                                                    '#222',
                                                                borderRadius: 5,
                                                                width:
                                                                    sizes.width /
                                                                    2 -
                                                                    10,
                                                                height:
                                                                    ((sizes.width /
                                                                        2 -
                                                                        10) /
                                                                        16) *
                                                                    9,
                                                            }}
                                                            selectedAudioTrack={{
                                                                type: 'index',
                                                                value: audioTrackIndex,
                                                            }}
                                                            rate={1}
                                                            volume={volume}
                                                            paused={false}
                                                            resizeMode={
                                                                'stretch'
                                                            }
                                                            repeat={false}
                                                            useTextureView={
                                                                false
                                                            }
                                                        />
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                )}
                                {channels.length > 0 && (
                                    <View style={{ flex: 1 }}>
                                        <View
                                            style={{
                                                flex: 1,
                                                paddingTop: 10,
                                                paddingBottom: 20,
                                            }}
                                        >
                                            <Text
                                                h5
                                                bold
                                                shadow
                                                numberOfLines={1}
                                                paddingBottom={5}
                                                paddingLeft={10}
                                            >
                                                {LANG.getTranslation(
                                                    'recommendedchannels',
                                                )}{' '}
                                                ({channels.length})
                                            </Text>
                                            <View style={{ flex: 1 }}>
                                                <FlatList
                                                    data={channels}
                                                    numColumns={6}
                                                    horizontal={false}
                                                    removeClippedSubviews={true}
                                                    keyExtractor={(
                                                        item,
                                                        index,
                                                    ) => index.toString()}
                                                    onScrollToIndexFailed={() => { }}
                                                    renderItem={renderChannel}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                            <View>{/* ads */}</View>
                        </View>
                    </View>
                </LinearGradient>
            </ScrollView>
            {GLOBAL.Device_IsWebTV == false &&
                GLOBAL.Device_IsAppleTV == false && <KeepAwake />}
        </View>
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
