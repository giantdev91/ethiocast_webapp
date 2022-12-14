import React, {ReactElement, useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {Player} from '../../components';
import Player_Utils from '../../components/Player_Utils';
import {sendPageReport} from '../../../reporting/reporting';
import TOKEN from '../../../datalayer/token';

export default ({navigation, route}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [streamUrl, setStreamUrl] = useState('');
    const [streamType, setStreamType] = useState('');
    const [streamTypeCasting, setStreamTypeCasting] = useState('');
    const [parentalControl, setParentalControl] = useState(0);
    const [adsOverlay, setAdsOverlay] = useState(0);
    const [adsPreroll, setAdsPreroll] = useState(0);
    const [adsTicker, setAdsTicker] = useState(0);
    const [drmType, setDrmType] = useState(null);
    const [drmSupplierType, setDrmSupplierType] = useState('');
    const [drmKey, setDrmKey] = useState(null);
    const [drmLicenseServerUrl, setDrmLicenseServerUrl] = useState('');
    const [drmCertificateUrl, setDrmCertificateUrl] = useState('');
    const [playerType, setPlayerType] = useState('');
    const [reportContentName, setReportContentName] = useState('');
    const [vastUrl, setVastUrl] = useState('');
    const [content, setContent] = useState({});
    const [orientation, setOrientation] = useState('portrait');
    useEffect(() => {
        return () =>
            sendPageReport('Player Channels', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (
            route.params?.channels != undefined &&
            route.params?.index != undefined &&
            route.params?.channel != undefined &&
            route.params?.categories != undefined &&
            route.params?.category_index != undefined
        ) {
            var channels = route.params?.channels;
            var index = route.params?.index;
            var categories = route.params?.categories;
            var category_index = route.params?.category_index;
            var channel = route.params?.channel;

            if (route.params?.orientation != undefined) {
                setOrientation(route.params?.orientation);
            }
            var currentUnix = moment().unix();
            var programs = GLOBAL.EPG.find(e => e.id == channel.channel_id);
            var currentIndex = 0;
            var program = [];
            if (programs != undefined) {
                var epg_ = programs.epgdata;
                currentIndex = epg_.findIndex(function (element) {
                    return element.s <= currentUnix && element.e >= currentUnix;
                });
                if (currentIndex != undefined) {
                    if (epg_[currentIndex] != null) {
                        program = epg_[currentIndex];
                    }
                }
            }
            var startTime = moment().startOf('hour').unix();
            if (program != undefined) {
                if (program.length > 0) {
                    startTime = program.s;
                }
            }
            var url = getChannelUrl(channel, program.s);

            (async () => {
                var urlOut = await Player_Utils.setPlayerTokenType(
                    url,
                    getTokenType(channel),
                );

                if (urlOut.indexOf('npplayout_') > -1) {
                    //https://053b7c77016e478db9c8d4fcb6a28b24.mediatailor.us-east-1.amazonaws.com/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/npplayout_/71Q0IF0APDZA7GG88842/hls3/now_-1m_15s/m.m3u8?ads.vast_id=654817
                    var queryString = '';
                    queryString += '&ads.did=' + GLOBAL.Device_UniqueID;
                    queryString += '&ads.app_name=' + GLOBAL.IMS;
                    queryString += '&ads.app_bundle=' + GLOBAL.Package;
                    //queryString += '&ads.app_store_url=https://play.google.com/store/apps/details?id=' + GLOBAL.AppPackageID;
                    queryString +=
                        '&ads.channel_name=' + encodeURI(channel.name);
                    queryString += '&ads.us_privacy=1---';
                    queryString += '&ads.schain=1';
                    queryString += '&ads.w=1980';
                    queryString += '&ads.h=1080';
                    urlOut += queryString;
                }

                setContent({
                    id: channel.channel_id,
                    number: channel.channel_number,
                    name: channel.channel_number + '. ' + channel.name,
                    sub: program.n,
                    extra:
                        moment
                            .unix(program.s)
                            .format('ddd ' + GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment.unix(program.e).format(GLOBAL.Clock_Setting),
                    image: GLOBAL.ImageUrlCMS + channel.icon_big,
                    image_style: {width: 70, height: 70},
                    index: index,
                    categories: categories,
                    category_index: category_index,
                    channel: channel,
                    channels: channels,
                    interactivetv:
                        channel.is_flussonic || channel.is_dveo ? true : false,
                    program: program,
                    programs: programs,
                    program_index: currentIndex,
                });
                setStreamType(Player_Utils.getStreamType(url));
                setStreamTypeCasting(Player_Utils.getStreamTypeCasting(url));
                setParentalControl(channel.childlock);
                setAdsOverlay(channel.overlay_enabled);
                setAdsPreroll(channel.preroll_enabled);
                setAdsTicker(channel.ticker_enabled);
                setPlayerType('Channel');

                if (channel.drm_stream) {
                    if (channel.drm.drm_type == 'buydrm') {
                        (async () => {
                            let drm =
                                await Player_Utils.getDrmWidevineFairplayBuyDRMKey(
                                    urlOut,
                                    channel,
                                );
                            if (drm != undefined) {
                                setDrmSupplierType('buydrm');
                                setDrmKey(drm.drmKey);
                                setDrmCertificateUrl(drm.certificateUrl);
                                setDrmLicenseServerUrl(drm.licenseServer);
                                setStreamUrl(drm.url);
                                setStreamType(
                                    Player_Utils.getStreamType(drm.url),
                                );
                                setReportContentName(
                                    'Channel :' + channel.name,
                                );
                            }
                        })();
                    }
                    if (channel.drm.drm_type == 'irdeto') {
                        (async () => {
                            let drm =
                                await Player_Utils.getDrmWidevineFairplayIrdetoKey(
                                    GLOBAL.DRM_KeyServerURL,
                                    channel,
                                );
                            if (drm != undefined) {
                                setDrmSupplierType('irdeto');
                                setStreamUrl(drm.url);
                                setStreamType(
                                    Player_Utils.getStreamType(drm.url),
                                );
                                setDrmLicenseServerUrl(drm.drmServerUrl);
                                setDrmCertificateUrl(drm.certificateUrl);
                                setReportContentName(
                                    'Channel :' + channel.name,
                                );
                            }
                        })();
                    }
                } else {
                    setStreamUrl(urlOut);
                    setReportContentName('Channel :' + channel.name);
                }
                setVastUrl('');
            })();
        } else {
            //  navigation.goBack();
        }
    }, [navigation]);

    const getTokenType = content => {
        if (content.akamai_token) {
            return 'Akamai';
        } else if (content.secure_stream) {
            return 'Legacy';
        } else if (content.flussonic_token) {
            return 'Flussonic';
        }
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
    return (
        <View style={{flex: 1, backgroundColor: '#000'}}>
            {reportContentName != '' && streamUrl != '' && (
                <Player
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        zIndex: 0,
                    }}
                    parentalControl={parentalControl}
                    content={content}
                    streamUrl={streamUrl}
                    streamType={streamType}
                    streamTypeCasting={streamTypeCasting}
                    adsPreroll={adsPreroll}
                    adsOverlay={adsOverlay}
                    adsTicker={adsTicker}
                    drmKey={drmKey}
                    drmType={drmType}
                    drmLicenseServerUrl={drmLicenseServerUrl}
                    drmCertificateUrl={drmCertificateUrl}
                    drmSupplierType={drmSupplierType}
                    playerType={playerType}
                    reportContentName={reportContentName}
                    vastUrl={vastUrl}
                    orientation={orientation}
                    viaVia={route.params?.viaVia}
                />
            )}
        </View>
    );
};
