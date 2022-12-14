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
            sendPageReport('Player Movies', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (
            route.params?.movie != undefined &&
            route.params?.movies != undefined &&
            route.params?.position != undefined
        ) {
            var movie = route.params.movie;
            var movies = route.params.movies;
            var position = route.params.position;

            if (route.params?.type != undefined) {
                if (route.params.type == 'movie') {
                    (async () => {
                        var stream = movie.moviestreams?.find(
                            s =>
                                s.language ==
                                LANG.getEnglishLanguageName(
                                    GLOBAL.Selected_Language,
                                ),
                        );
                        if (stream == null) {
                            stream = movie.moviestreams[0];
                        }
                        if (stream != null) {
                            var subs_ = [];
                            movie.moviestreams.forEach(element => {
                                if (
                                    element.vtt_url != '' &&
                                    element.vtt_url != null
                                ) {
                                    var sub = {
                                        title: element.language + ' (VTT)',
                                        language: 'en',
                                        uri: element.vtt_url,
                                        type: 'text/vtt',
                                    };
                                    subs_.push(sub);
                                }
                            });

                            var url = await Player_Utils.setPlayerTokenType(
                                stream.url,
                                getTokenType(stream),
                            );
                            setContent({
                                id: movie.id,
                                name: movie.name,
                                backdrop: movie.backdrop,
                                poster: movie.poster,
                                year: movie.year,
                                movies: movies,
                                movie_id: movie.id,
                                position: position,
                                subs: subs_,
                            });
                            setStreamType(
                                Player_Utils.getStreamType(stream.url),
                            );
                            setStreamTypeCasting(
                                Player_Utils.getStreamTypeCasting(stream.url),
                            );
                            setParentalControl(movie.childLock);
                            setAdsOverlay(movie.overlay_enabled);
                            setAdsPreroll(movie.preroll_enabled);
                            setAdsTicker(movie.ticker_enableds);
                            setStreamUrl(url);
                            setPlayerType('Movie');
                            setReportContentName('Movie :' + movie.name);
                            setVastUrl('');
                        } else {
                            //navigation.goBack();
                        }
                    })();
                } else {
                    var stream = movie.trailer_url;
                    if (stream != null) {
                        setStreamType(Player_Utils.getStreamType(stream));
                        setStreamTypeCasting(
                            Player_Utils.getStreamTypeCasting(stream),
                        );
                        setParentalControl(movie.childLock);
                        setAdsOverlay(movie.overlay_enabled);
                        setAdsPreroll(movie.preroll_enabled);
                        setAdsTicker(movie.ticker_enableds);
                        setStreamUrl(stream);
                        setPlayerType('Movie');
                        setReportContentName('Movie :' + movie.name);
                        setVastUrl('');
                        setContent({
                            id: movie.id,
                            name: movie.name,
                            backdrop: movie.backdrop,
                            poster: movie.poster,
                            year: movie.year,
                            movies: movies,
                            movie_id: movie.id,
                            position: position,
                        });
                    }
                }
            } else {
                //navigation.goBack();
            }
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
                    // adsPreroll={adsPreroll}
                    // adsOverlay={adsOverlay}
                    // adsTicker={adsTicker}
                    parentalControl={parentalControl}
                    content={content}
                    streamUrl={streamUrl}
                    streamType={streamType}
                    streamTypeCasting={streamTypeCasting}
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
