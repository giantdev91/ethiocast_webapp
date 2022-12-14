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
    const [drmType, setDrmType] = useState(null);
    const [drmSupplierType, setDrmSupplierType] = useState('');
    const [drmKey, setDrmKey] = useState(null);
    const [drmLicenseServerUrl, setDrmLicenseServerUrl] = useState('');
    const [drmCertificateUrl, setDrmCertificateUrl] = useState('');
    const [playerType, setPlayerType] = useState('');
    const [reportContentName, setReportContentName] = useState('');
    const [vastUrl, setVastUrl] = useState('');
    const [content, setContent] = useState({});
    const [adsOverlay, setAdsOverlay] = useState(0);
    const [adsPreroll, setAdsPreroll] = useState(0);
    const [adsTicker, setAdsTicker] = useState(0);

    useEffect(() => {
        return () =>
            sendPageReport(
                'Player Recordings',
                reportStartTime,
                moment().unix(),
            );
    }, []);
    useEffect(() => {
        if (
            route.params?.recording != undefined &&
            route.params?.recordings != undefined
        ) {
            var recording = route.params?.recording;
            var recordings = route.params?.recordings;
            var channel = UTILS.getChannelSelectedByName(
                recording.channel_name,
            );
            if (channel != null) {
                var url = Player_Utils.rewriteRecordingUrl(recording.url);
                (async () => {
                    url = await Player_Utils.setPlayerTokenType(
                        url,
                        getTokenType(channel),
                    );
                    setStreamType(Player_Utils.getStreamType(url));
                    setStreamTypeCasting(
                        Player_Utils.getStreamTypeCasting(url),
                    );
                    setStreamUrl(url);
                    setPlayerType('Recording');

                    setVastUrl('');
                    setParentalControl(channel.childlock);

                    setAdsOverlay(channel.overlay_enabled);
                    setAdsPreroll(channel.preroll_enabled);
                    setAdsTicker(channel.ticker_enabled);

                    setContent({
                        id: recording.id,
                        sub: recording.program_name,
                        name: recording.channel_name,
                        extra:
                            moment
                                .unix(recording.ut_start)
                                .format('ddd ' + GLOBAL.Clock_Setting) +
                            ' - ' +
                            moment
                                .unix(recording.ut_end)
                                .format(GLOBAL.Clock_Setting),
                        recordings: recordings,
                        image_style: {width: 70, height: 70},
                        image: GLOBAL.ImageUrlCMS + recording.channel_icon,
                        channel: channel,
                        recording: recording,
                    });

                    if (channel.drm_stream) {
                        if (channel.drm.drm_type == 'buydrm') {
                            (async () => {
                                let drm =
                                    await Player_Utils.getDrmWidevineFairplayBuyDRMKey(
                                        url,
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
                                        'Recording :' + recording.program_name,
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
                                        'Recording :' + recording.program_name,
                                    );
                                }
                            })();
                        }
                    } else {
                        setStreamUrl(url);
                        setReportContentName(
                            'Recording :' + recording.program_name,
                        );
                    }
                })();
            } else {
                // navigation.goBack();
            }
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
                    adsPreroll={adsPreroll}
                    adsOverlay={adsOverlay}
                    adsTicker={adsTicker}
                    parentalControl={parentalControl}
                    content={content}
                    streamUrl={streamUrl}
                    streamType={streamType}
                    streamTypeCasting={streamTypeCasting}
                    drmKey={drmKey}
                    drmType={drmType}
                    drmLicenseServerUrl={drmLicenseServerUrl}
                    drmCertificateUrl={drmCertificateUrl}
                    drmSupplierType={drmSupplierType}
                    playerType={playerType}
                    reportContentName={reportContentName}
                    vastUrl={vastUrl}
                />
            )}
        </View>
    );
};
