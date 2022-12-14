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
    const [adsOverlay, setAdsOverlay] = useState(false);
    const [adsPreroll, setAdsPreroll] = useState(false);
    const [adsTicker, setAdsTicker] = useState(false);
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
            sendPageReport(
                'Player Education',
                reportStartTime,
                moment().unix(),
            );
    }, []);
    useEffect(() => {
        if (
            route.params?.lesson != undefined &&
            route.params?.course != undefined &&
            route.params?.index != undefined &&
            route.params?.years != undefined &&
            route.params?.position != undefined
        ) {
            var course = route.params?.course;
            var course_index = route.params?.course_index;
            var lesson = route.params?.lesson;
            var years = route.params?.years;
            var index = route.params?.index;
            var position = route.params?.position;
            var stream = lesson.streams?.find(
                s =>
                    s.language ==
                    LANG.getEnglishLanguageName(GLOBAL.Selected_Language),
            );

            if (stream == null) {
                stream = lesson.streams[0];
            }

            if (stream != null) {
                (async () => {
                    var url = await Player_Utils.setPlayerTokenType(
                        stream.url,
                        getTokenType(stream),
                    );
                    setContent({
                        id: lesson.id,
                        name:
                            'S' +
                            lesson.course_number +
                            ':E' +
                            lesson.lesson_number +
                            ' ' +
                            lesson.name,
                        backdrop: course.backdrop,
                        index: index - 1,
                        course: course,
                        year: years,
                        course_index: course_index,
                        lessons: course.lessons,
                        education_id: course.id,
                        position: position,
                    });
                    setStreamType(Player_Utils.getStreamType(stream.url));
                    setStreamTypeCasting(
                        Player_Utils.getStreamTypeCasting(stream.url),
                    );
                    setParentalControl(course.childLock);
                    setAdsOverlay(course.has_overlaybanner);
                    setAdsPreroll(course.has_preroll);
                    setAdsTicker(course.has_ticker);
                    setStreamUrl(url);
                    setPlayerType('Education');
                    setResume(false);
                    setResumeTime(0);
                    setReportContentName('Ecucation :' + lesson.name);
                    setVastUrl('');
                })();
            } else {
                navigation.goBack();
            }
        } else {
            navigation.goBack();
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
                    //resume={resume}
                    //resumeTime={resumeTime}
                    reportContentName={reportContentName}
                    vastUrl={vastUrl}
                />
            )}
        </View>
    );
};
