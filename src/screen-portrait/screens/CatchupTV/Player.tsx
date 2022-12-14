import React, {ReactElement, useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {Player} from '../../components';
import Player_Utils from '../../components/Player_Utils';
import {sendPageReport} from '../../../reporting/reporting';

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
            sendPageReport(
                'Player CatchupTV',
                reportStartTime,
                moment().unix(),
            );
    }, []);
    useEffect(() => {
        if (
            route.params?.programs != undefined &&
            route.params?.index != undefined &&
            route.params?.channel != undefined &&
            route.params?.program != undefined &&
            route.params?.channels
        ) {
            var programs = route.params?.programs;
            var index = route.params?.index;
            var program = route.params?.program;
            var channel = route.params?.channel;
            var channels = route.params?.channels;
            if (route.params?.orientation != undefined) {
                setOrientation(route.params?.orientation);
            }
            var current = moment().unix();
            var isLiveProgram = false;
            if (current < program.e) {
                isLiveProgram = true;
            }
            var url = getCatchupTVUrl(channel, program, isLiveProgram);
            (async () => {
                var urlOut = await Player_Utils.setPlayerTokenType(
                    url,
                    getTokenType(channel),
                );
                setContent({
                    id: program.id,
                    sub:
                        moment
                            .unix(program.s)
                            .format('ddd ' + GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment.unix(program.e).format(GLOBAL.Clock_Setting),
                    image: GLOBAL.ImageUrlCMS + channel.icon_big,
                    image_style: {width: 70, height: 70},
                    extra: ' ',
                    name: program.n,
                    index: index,
                    program: program,
                    programs: programs,
                    channel: channel,
                    channels: channels,
                });
                setStreamType(Player_Utils.getStreamType(url));
                setStreamTypeCasting(Player_Utils.getStreamTypeCasting(url));
                setParentalControl(channel.childlock);
                setPlayerType('CatchupTV');

                setAdsOverlay(channel.overlay_enabled);
                setAdsPreroll(channel.preroll_enabled);
                setAdsTicker(channel.ticker_enabled);

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
                                setReportContentName('CatchupTV :' + program.n);
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
                                setReportContentName('CatchupTV :' + program.n);
                            }
                        })();
                    }
                } else {
                    setStreamUrl(urlOut);
                    setReportContentName('CatchupTV :' + program.n);
                }
                setVastUrl('');
            })();
        } else {
            // navigation.goBack();
        }
    }, []);
    const getTokenType = content => {
        if (content.akamai_token) {
            return 'Akamai';
        } else if (content.secure_stream) {
            return 'Legacy';
        } else if (content.flussonic_token) {
            return 'Flussonic';
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
    return (
        <View style={{flex: 1, backgroundColor: '#000'}}>
            {reportContentName != '' && (
                <Player
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
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
