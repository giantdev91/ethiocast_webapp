import React, {Component, useEffect, useState} from 'react';
import {View, BackHandler} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {ImageBackground} from 'react-native';
import Video from 'react-native-video/dom/Video';
import moment, {lang} from 'moment';
import {Text} from '../../components';
import {CommonActions} from '@react-navigation/native';
import SIZES from '../../constants/sizes';

export default ({navigation, route}): React.ReactElement => {
    const sizes = SIZES.getSizing();
    const [campaign, setCampaign] = useState([] as any);
    const [paused, setPaused] = useState(true);
    const [showButtons, setShowButtons] = useState(true);
    const [showPlayer, setShowPlayer] = useState(false);
    const [stream, setStream] = useState('https://');
    const [message, setMessage] = useState('');

    useEffect(() => {
        setCampaign(route.params.campaign);
    }, []);

    const _goHome = () => {
        setPaused(true);
        setShowButtons(false);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{name: 'Home'}],
            }),
        );
    };
    useEffect(() => {
        const backAction = () => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Home'}],
                }),
            );
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        return () => backHandler.remove();
    }, []);

    const _onPlay = () => {
        setPaused(false);
        setShowPlayer(true);
        setShowButtons(false);
        setSeek(0);
        setStream(campaign.stream + '?' + moment().unix());
    };
    const _onInfo = () => {
        DAL.requestAdInformation(campaign.campaignId)
            .then(data => {
                setMessage(LANG.getTranslation('message_sent'));
            })
            .catch(error => {
                setMessage(error);
            });
    };

    const onProgress = data => {};
    const onEnd = () => {
        setPaused(true);
        setShowButtons(true);
        setShowPlayer(false);
    };
    const setSeek = time => {};
    const onError = data => {
        setPaused(true);
        setShowButtons(true);
        setShowPlayer(false);
    };
    const onLoad = data => {};

    return (
        <ImageBackground
            style={{flex: 1, width: null, height: null}}
            imageStyle={{resizeMode: 'stretch'}}
            source={{uri: GLOBAL.ImageUrlCMS + campaign.backdrop}}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {showPlayer && (
                    <Video
                        //ref={(ref) => { player = ref }}
                        source={{
                            uri: stream,
                            type: 'mp4',
                            ref: 'player',
                            headers: {
                                'User-Agent': GLOBAL.User_Agent,
                            },
                        }}
                        disableFocus={true}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            width: global.Device_IsPhone
                                ? sizes.height
                                : '100%',
                            height: global.Device_IsPhone
                                ? sizes.width
                                : '100%',
                            zIndex: 0,
                        }}
                        rate={1}
                        paused={paused}
                        resizeMode={'stretch'}
                        onLoad={onLoad}
                        selectedTextTrack={{
                            type: 'disabled',
                            value: 0,
                        }}
                        selectedAudioTrack={{
                            type: 'index',
                            value: 0,
                        }}
                        onProgress={onProgress}
                        onEnd={onEnd}
                        repeat={false}
                        onError={onError}
                    />
                )}
                {message != '' && (
                    <View
                        style={{
                            height: 50,
                            width: sizes.width * 0.5,
                            backgroundColor: '#000',
                            marginBottom: 20,
                            padding: 10,
                        }}
                    >
                        <Text>{message}</Text>
                    </View>
                )}
                {showButtons && (
                    <View
                        style={{
                            borderRadius: 5,
                            width: sizes.width * 0.5,
                            height: sizes.height * 0.3,
                            backgroundColor: '#000',
                        }}
                    >
                        <View style={{flex: 1, padding: 20}}>
                            <Text h4>
                                {LANG.getTranslation('sponsered_ad')}
                            </Text>
                        </View>
                        <View style={{flex: 2, padding: 20}}>
                            <Text>{campaign.text}</Text>
                        </View>
                        <View
                            style={{
                                flex: 2,
                                paddingBottom: 20,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <FocusButton
                                BorderRadius={5}
                                style={{
                                    borderColor: '#fff',
                                    borderWidth: 1,
                                    width: sizes.width * 0.15,
                                    height: '100%',
                                    margin: 5,
                                    borderRadius: 5,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() => _goHome()}
                            >
                                <Text>{LANG.getTranslation('home')}</Text>
                            </FocusButton>
                            <FocusButton
                                BorderRadius={5}
                                style={{
                                    borderColor: '#fff',
                                    borderWidth: 1,
                                    width: sizes.width * 0.15,
                                    height: '100%',
                                    margin: 5,
                                    borderRadius: 5,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() => _onInfo()}
                            >
                                <Text>
                                    {LANG.getTranslation('get_information')}
                                </Text>
                            </FocusButton>
                            <FocusButton
                                BorderRadius={5}
                                style={{
                                    borderColor: '#fff',
                                    borderWidth: 1,
                                    width: sizes.width * 0.15,
                                    height: '100%',
                                    margin: 5,
                                    borderRadius: 5,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                                underlayColor={GLOBAL.Button_Color}
                                onPress={() => _onPlay()}
                            >
                                <Text>
                                    {LANG.getTranslation('play_commercial')}
                                </Text>
                            </FocusButton>
                        </View>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};
