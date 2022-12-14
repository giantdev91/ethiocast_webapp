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
    const [drm, setDrm] = useState(false);
    const [drmType, setDrmType] = useState('');
    const [playerType, setPlayerType] = useState('');
    const [resume, setResume] = useState(false);
    const [resumeTime, setResumeTime] = useState(0);
    const [reportContentName, setReportContentName] = useState('');
    const [vastUrl, setVastUrl] = useState('');
    const [content, setContent] = useState({});
    useEffect(() => {
        return () =>
            sendPageReport('Player Series', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (
            route.params?.episode != undefined &&
            route.params?.season != undefined &&
            route.params?.index != undefined &&
            route.params?.series != undefined &&
            route.params?.position != undefined
        ) {
            var season = route.params?.season;
            var season_index = route.params?.season_index;
            var episode = route.params?.episode;
            var series = route.params?.series;
            var index = route.params?.index;
            var position = route.params?.position;
            var stream = episode.streams?.find(
                s =>
                    s.language ==
                    LANG.getEnglishLanguageName(GLOBAL.Selected_Language),
            );

            if (stream == null) {
                stream = episode.streams[0];
            }

            if (stream != null) {
                // var subs_ = [];
                // episode.moviestreams.forEach(element => {
                //     var sub = {
                //         title: element.language + ' (VTT)',
                //         language: 'en',
                //         uri: element.vtt_url,
                //         type: 'text/vtt',
                //     }
                //     subs_.push(sub);
                // });
                (async () => {
                    var url = await Player_Utils.setPlayerTokenType(
                        stream.url,
                        getTokenType(stream),
                    );
                    setContent({
                        id: episode.id,
                        name:
                            'S' +
                            episode.season_number +
                            ':E' +
                            episode.episode_number +
                            ' ' +
                            episode.name,
                        backdrop: season.backdrop,
                        poster: season.poster,
                        index: index - 1,
                        season: season,
                        series: series,
                        season_index: season_index,
                        episodes: season.episodes,
                        season_id: season.id,
                        position: position,
                        subs: [],
                    });
                    setStreamType(Player_Utils.getStreamType(stream.url));
                    setStreamTypeCasting(
                        Player_Utils.getStreamTypeCasting(stream.url),
                    );
                    setParentalControl(season.childLock);
                    setAdsOverlay(season.overlay_enabled);
                    setAdsPreroll(season.preroll_enabled);
                    setAdsTicker(season.ticker_enabled);
                    setStreamUrl(url);
                    setPlayerType('Series');
                    // setResume(false);
                    // setResumeTime(0);
                    setReportContentName('Series :' + episode.name);
                    setVastUrl('');
                })();
            } else {
                // navigation.goBack();
            }
        } else {
            //  navigation.goBack();
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
                    parentalControl={parentalControl}
                    content={content}
                    streamUrl={streamUrl}
                    streamType={streamType}
                    streamTypeCasting={streamTypeCasting}
                    // adsPreroll={adsPreroll}
                    // adsOverlay={adsOverlay}
                    // adsTicker={adsTicker}
                    drm={drm}
                    drmType={drmType}
                    playerType={playerType}
                    // resume={resume}
                    // resumeTime={resumeTime}
                    reportContentName={reportContentName}
                    vastUrl={vastUrl}
                />
            )}
        </View>
    );
};
