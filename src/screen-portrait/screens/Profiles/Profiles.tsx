import React, {ReactElement, useState, useEffect, useCallback} from 'react';
import {
    View,
    ImageBackground,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import {Text} from '../../components';
import SIZES from '../../constants/sizes';
import {ImageOverlay} from './extra/image-overlay.component';
import {Button, Icon, Modal, Card, Input} from '@ui-kitten/components';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import UserAvatar from 'react-native-user-avatar';
import TimerMixin from 'react-timer-mixin';
import {useFocusEffect} from '@react-navigation/native';
import {sendPageReport, sendActionReport} from '../../../reporting/reporting';

export default ({navigation, route}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    var closeAppTimer;
    const [profiles, setProfilesLocal] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [parentalCode, setParentalCode] = useState('');
    const [error, setError] = useState('');
    const [showCloseAppModal, setShowCloseAppModal] = useState(false);
    const [backPressedCount, setBackPressedCount] = useState(0);
    const [selectedProfile, setSelectedProfile] = useState([]);

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Profiles', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (route.params?.profiles != undefined) {
            setProfilesLocal(route.params?.profiles);
        } else {
            startProfilesScreen();
        }
        return () => {
            TimerMixin.clearTimeout(closeAppTimer);
        };
    }, []);

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
    const startProfilesScreen = async () => {
        (async () => {
            let res = await getProfiles();
            if (res.success) {
                if (GLOBAL.UserInterface.general.enable_profiles == false) {
                    loadProfile(GLOBAL.Profiles[0]);
                } else {
                    setProfilesLocal(GLOBAL.Profiles);
                }
            }
        })();
    };
    const getProfiles = async () => {
        try {
            var path =
                'https://devices.tvms.io/getprofile?collection_key=' +
                GLOBAL.IMS +
                '.' +
                GLOBAL.CRM +
                '&document_key=' +
                UTILS.toAlphaNumeric(GLOBAL.UserID) +
                '.' +
                GLOBAL.Pass +
                '.profile';
            console.log('get profiles: ', path);
            let response = await fetch(path);
            let data = await response.json();
            console.log('get profiles response: ', data);
            if (data.profile == undefined) {
                if (GLOBAL.Profiles.length > 0) {
                    normalizeProfile();
                    var newProfiles = GLOBAL.Profiles.filter(
                        p => p.name != LANG.getTranslation('add_profile'),
                    );
                    try {
                        let response_ = await fetch(
                            'https://devices.tvms.io/setprofile',
                            {
                                method: 'POST',
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    collection_key:
                                        GLOBAL.IMS + '.' + GLOBAL.CRM,
                                    document_key:
                                        UTILS.toAlphaNumeric(GLOBAL.UserID) +
                                        '.' +
                                        GLOBAL.Pass +
                                        '.profile',
                                    document_data: {
                                        profile: profiles,
                                    },
                                }),
                            },
                        );
                        let data_ = await response_.json();
                        if (data_ != undefined) {
                            var addProfile = {
                                id: 0,
                                name: LANG.getTranslation('add_profile'),
                                recommendations: [],
                                mode: 'regular',
                                avatar: '',
                            };
                            GLOBAL.Profiles = newProfiles;
                            GLOBAL.Profiles.push(addProfile);
                            return {success: true};
                        } else {
                            return {success: false};
                        }
                    } catch (error) {
                        return {success: true};
                    }
                } else {
                    return {success: false};
                }
            } else {
                GLOBAL.Profiles = data.profile;
                var addProfile = {
                    id: 0,
                    name: LANG.getTranslation('add_profile'),
                    recommendations: [],
                    mode: 'regular',
                    avatar: '',
                };
                GLOBAL.Profiles.push(addProfile);
                return {success: true};
            }
        } catch (error) {
            //SHOW ERROR
            return {success: false};
        }
    };

    const normalizeProfile = async () => {
        var profiles = GLOBAL.Profiles;
        profiles.forEach(profile => {
            if (profile.data == undefined) {
                var data = {
                    content: {
                        movies: {
                            favorites: [],
                            progress: [],
                        },
                        series: {
                            favorites: [],
                            progress: [],
                        },
                        education: {
                            favorites: [],
                            progress: [],
                            finished: [],
                        },
                        television: {
                            favorites: [],
                            locked: [],
                            progress: [],
                            grouplock: [],
                        },
                    },
                    settings: {
                        childlock: '0000',
                        clock: {
                            Clock_Type: '24h',
                            Clock_Setting: 'HH:mm',
                        },
                        audio: '',
                        text: '',
                        screen: '',
                        video_quality: GLOBAL.Device_IsPhone ? 'HIGH' : 'LOW',
                        toggle: '',
                    },
                };
                GLOBAL.Profiles.find(u => u.id == profile.id).data = data;
            } else {
                if (profile.data.settings.childlock == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.childlock = '0000';
                }
                if (profile.data.settings.video_quality == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.video_quality = GLOBAL.Device_IsPhone
                        ? 'HIGH'
                        : 'LOW';
                }
                if (profile.data.settings.audio == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.audio = '';
                }
                if (profile.data.settings.text == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.text = '';
                }
                if (profile.data.settings.screen == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.screen = '';
                }
                if (profile.data.settings.clock == undefined) {
                    var clock = {
                        Clock_Type: '24h',
                        Clock_Setting: 'HH:mm',
                    };
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.clock.push(clock);
                }
                if (profile.data.settings.toggle == undefined) {
                    GLOBAL.Profiles.find(
                        u => u.id == profile.id,
                    ).data.settings.toggle = '';
                }
                if (profile.data.content.movies == undefined) {
                    var movies = {
                        movies: {
                            progress: [],
                            favorites: [],
                        },
                    };
                    GLOBAL.Profiles.find(u => u.id == profile.id).data.push(
                        movies,
                    );
                }
                if (profile.data.content.series == undefined) {
                    var series = {
                        series: {
                            progress: [],
                            favorites: [],
                        },
                    };
                    GLOBAL.Profiles.find(u => u.id == profile.id).data.push(
                        series,
                    );
                }
                if (profile.data.content.television == undefined) {
                    var television = {
                        television: {
                            favorites: [],
                            locked: [],
                            grouplock: [],
                            progress: [],
                        },
                    };
                    GLOBAL.Profiles.find(u => u.id == profile.id).data.push(
                        television,
                    );
                }
            }
        });
    };

    const loadProfile = profile => {
        if (profile.name == '') {
            return;
        }
        if (profile == undefined) {
        } else {
            GLOBAL.Favorite_Channels = [];
            if (profile.name == LANG.getTranslation('add_profile')) {
                //CREATE PROFILE PAGE
            } else {
                GLOBAL.SearchChannels_ = [];
                GLOBAL.SearchMovies_ = [];
                GLOBAL.SearchSeries_ = [];
                GLOBAL.EPG_Search_Channels = [];
                GLOBAL.EPG_Search_EPG = [];

                var viaHome = false;
                if (GLOBAL.Selected_Profile != '') {
                    viaHome = true;
                }
                GLOBAL.Selected_Profile = profile;
                GLOBAL.ProfileID = profile.id;

                GLOBAL.Profile_Lock = UTILS.getProfile('profile_lock', 0, 0);
                GLOBAL.Age_Rating = UTILS.getProfile('age_rating', 0, 0);

                GLOBAL.Kids_Mode = 'no kids mode';

                var PIN = UTILS.getProfile('settings_childlock', 0, 0);
                if (PIN) {
                    GLOBAL.PIN = PIN;
                } else {
                    GLOBAL.PIN = '0000';
                }

                var CLOCK = UTILS.getProfile('settings_clock', 0, 0);
                if (CLOCK) {
                    GLOBAL.Clock_Setting = CLOCK.Clock_Setting;
                    GLOBAL.Clock_Type = CLOCK.Clock_Type;
                    GLOBAL.Clock_Not_Set == true;
                }

                var TOGGLE = UTILS.getProfile('settings_toggle', 0, 0);
                if (TOGGLE) {
                    GLOBAL.Channel_Toggle = TOGGLE;
                }

                var SCREEN = UTILS.getProfile('settings_screen', 0, 0);
                if (SCREEN) {
                    GLOBAL.Screen_Size = SCREEN;
                }

                var OFFSET = UTILS.getProfile('settings_offset', 0, 0);
                if (OFFSET) {
                    GLOBAL.Catchup_DVR_Offset = OFFSET;
                }

                var TEXT = UTILS.getProfile('settings_text', 0, 0);
                if (TEXT) {
                    GLOBAL.Selected_TextTrack = TEXT;
                }

                var AUDIO = UTILS.getProfile('settings_audio', 0, 0);
                if (AUDIO) {
                    GLOBAL.Selected_AudioTrack = AUDIO;
                }

                var VIDEOQUALITY = UTILS.getProfile(
                    'settings_video_quality',
                    0,
                    0,
                );
                if (VIDEOQUALITY == null) {
                    VIDEOQUALITY = 'HIGH';
                }
                GLOBAL.Video_Quality_Setting = VIDEOQUALITY;

                // var Childlock_Channels = UTILS.getProfile('television_locked', 0, 0);
                // if (Childlock_Channels) { GLOBAL.Childlock_Channels = Childlock_Channels }

                var Recordings = UTILS.getProfile(
                    'television_recordings',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );
                if (Recordings == undefined) {
                    UTILS.storeProfile(
                        'television_recordings',
                        0,
                        0,
                        0,
                        0,
                        GLOBAL.Recordings,
                        '',
                    );
                } else {
                    GLOBAL.Recordings == Recordings;
                }

                GLOBAL.Channels = GLOBAL.Channels.filter(f => f.id != 0);

                var favoriteChannels = UTILS.getProfile(
                    'television_favorites',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );
                favoriteChannels.forEach(channel => {
                    var check = UTILS.checkChannelFavorites(channel.channel_id);
                    if (check == true) {
                        var channelNew = UTILS.getChannelFavorite(
                            channel.channel_id,
                        );
                        GLOBAL.Favorite_Channels.push(channelNew);
                    }
                });
                var favorites = {
                    id: 0,
                    name: LANG.getTranslation('favorites'),
                    position: 100000000,
                    channels: GLOBAL.Favorite_Channels,
                };
                GLOBAL.Channels.splice(1, 0, favorites);

                GLOBAL.Favorite_Movies = UTILS.getProfile(
                    'movie_favorites',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );
                GLOBAL.Favorite_Series = UTILS.getProfile(
                    'series_favorites',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );
                GLOBAL.Favorite_Education = UTILS.getProfile(
                    'education_favorites',
                    0,
                    0,
                    0,
                    0,
                    [],
                    '',
                );

                //GLOBAL.Rented_Movies = UTILS.getProfile('movie_rentals', 0, 0, 0, 0, [], '');

                GLOBAL.Focus = 'Home';
                GLOBAL.ShowMenu = true;
                GLOBAL.Profiled = true;
                if (GLOBAL.Profile_Lock == true) {
                    setParentalCode('');
                    setShowModal(true);
                } else {
                    if (GLOBAL.ViaHome == true) {
                        GLOBAL.ViaHome = false;
                        navigation && navigation.navigate('Empty');
                    } else {
                        navigation && navigation.navigate('Profiles');
                    }
                }
            }
        }
    };
    const EditIcon = props => (
        <Icon {...props} fill="#fff" name="edit-2-outline" />
    );
    const TrashIcon = props => (
        <Icon {...props} fill="#fff" name="trash-2-outline" />
    );
    const LockIcon = props => (
        <Icon {...props} fill="#fff" name="lock-outline" />
    );
    const Logout = props => (
        <Icon {...props} fill="#fff" name="log-out-outline" />
    );
    const onEditProfile = item => {
        if (item.item.profile_lock) {
            setSelectedProfile(item);
            setParentalCode('');
            setShowModalEdit(true);
        } else {
            navigation.navigate({
                name: 'Edit',
                params: {
                    profile: item,
                },
                merge: true,
            });
        }
    };
    const onDeleteProfile = item => {
        if (GLOBAL.Profiles.length > 2) {
            var delProfiles = GLOBAL.Profiles.filter(p => p.id != item.item.id);
            GLOBAL.Profiles = delProfiles;
            var newProfiles = GLOBAL.Profiles.filter(
                p => p.name != LANG.getTranslation('add_profile'),
            );
            DAL.setProfile(
                GLOBAL.IMS + '.' + GLOBAL.CRM,
                UTILS.toAlphaNumeric(GLOBAL.UserID) +
                    '.' +
                    GLOBAL.Pass +
                    '.profile',
                newProfiles,
            ).then(result => {});
            setProfilesLocal(GLOBAL.Profiles);
        }
    };
    const onOpenProfile = profile => {
        if (profile.name != LANG.getTranslation('add_profile')) {
            loadProfile(profile);
        } else {
            sendActionReport('New Profile', 'Profiles', moment().unix(), '');
            navigation.navigate('Add');
        }
    };
    const renderProfile = item => {
        return (
            <View style={{flex: 1, margin: 20}}>
                <View
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}>
                    <FocusButton
                        style={{
                            margin: 5,
                            borderRadius: 100,
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => onOpenProfile(item.item)}>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            {RenderIf(
                                item.item.name ==
                                    LANG.getTranslation('add_profile'),
                            )(
                                <UserAvatar
                                    size={GLOBAL.Device_IsAppleTV ? 150 : 90}
                                    name={LANG.getTranslation('add_profile')}
                                    src="https://cloudtv.akamaized.net/apps/grey-circle-plus.png"
                                    color="#555"
                                />,
                            )}
                            {RenderIf(
                                item.item.name !=
                                    LANG.getTranslation('add_profile') &&
                                    item.item.name != '',
                            )(
                                <UserAvatar
                                    size={GLOBAL.Device_IsAppleTV ? 150 : 90}
                                    name={item.item.name
                                        .split(' ')
                                        .slice(0, 2)
                                        .join('+')}
                                />,
                            )}
                            {RenderIf(
                                item.item.name !=
                                    LANG.getTranslation('add_profile') &&
                                    item.item.name == '',
                            )(
                                <UserAvatar
                                    size={GLOBAL.Device_IsAppleTV ? 150 : 90}
                                    name="No Name"
                                />,
                            )}
                            <Text
                                center
                                numberOfLines={1}
                                style={{
                                    width: GLOBAL.Device_IsAppleTV ? 150 : 90,
                                }}>
                                {item.item.name}
                            </Text>
                        </View>
                    </FocusButton>
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        height: 50,
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                    }}>
                    {RenderIf(
                        item.item.name != LANG.getTranslation('add_profile'),
                    )(
                        <Button
                            style={{borderRadius: 100}}
                            appearance="ghost"
                            accessoryLeft={EditIcon}
                            onPress={() => onEditProfile(item)}
                        />,
                    )}
                    {RenderIf(
                        item.item.name != LANG.getTranslation('add_profile'),
                    )(
                        <Button
                            style={{borderRadius: 100}}
                            appearance="ghost"
                            accessoryLeft={TrashIcon}
                            onPress={() => onDeleteProfile(item)}
                        />,
                    )}
                </View>
            </View>
        );
    };
    const checkParentalCode = () => {
        if (parentalCode != GLOBAL.PIN) {
            setError(LANG.getTranslation('parental_wrong_code'));
        } else {
            if (GLOBAL.ViaHome == true) {
                GLOBAL.ViaHome = false;
                navigation && navigation.navigate('Empty');
            } else {
                navigation && navigation.navigate('Profiles');
            }
        }
    };
    const checkParentalCodeEdit = () => {
        if (parentalCode != GLOBAL.PIN) {
            setError(LANG.getTranslation('parental_wrong_code'));
        } else {
            setShowModalEdit(false);
            navigation.navigate({
                name: 'Edit',
                params: {
                    profile: selectedProfile,
                },
                merge: true,
            });
        }
    };
    const onLogout = () => {
        navigation.navigate({
            name: 'Signout',
            params: {
                profile: selectedProfile,
            },
            merge: true,
        });
    };
    return (
        <KeyboardAvoidingView style={{flex: 1}}>
            <Modal
                style={{
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.8
                        : sizes.width * 0.3,
                }}
                visible={showCloseAppModal}
                onBackdropPress={() => setShowCloseAppModal(false)}
                backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.40)'}}>
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
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    alignSelf: 'center',
                    marginVertical: 25,
                }}>
                <Text style={styles.signInLabel} h4 status="control">
                    {LANG.getTranslation('selecttheprofileyouwanttouse')}
                </Text>
                <Text
                    width={sizes.width}
                    style={styles.signInLabel_}
                    center
                    status="basic">
                    {LANG.getTranslation('wittheprofile')}
                </Text>
            </View>
            <View style={styles.formContainer}>
                {GLOBAL.Show_PWA_Message && GLOBAL.Device_IsWebTvMobile && (
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                width: sizes.width * 0.98,
                                height: 50,
                                backgroundColor: '#f2f8fe',
                                borderRadius: 5,
                            }}>
                            <View style={{flexDirection: 'row'}}>
                                <View
                                    style={{
                                        backgroundColor: '#999',
                                        height: 40,
                                        width: 40,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: 5,
                                    }}>
                                    <Text size={35}>+</Text>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        paddingHorizontal: 5,
                                    }}>
                                    {GLOBAL.Device_IsPwaAndroidChrome &&
                                        !GLOBAL.Device_IsPwaAndroidSamsung && (
                                            <Text
                                                size={10}
                                                bold={true}
                                                lineHeight={15}
                                                color={'#333'}>
                                                Install this App on your phone
                                                by pressing the settings icon
                                                followed by 'Install App'.
                                            </Text>
                                        )}
                                    {GLOBAL.Device_IsPwaIosChrome && (
                                        <Text
                                            size={10}
                                            bold={true}
                                            lineHeight={15}
                                            color={'#333'}>
                                            Did you know? That if you open this
                                            page in a Safari Browser you can
                                            install it as an App on your device.
                                        </Text>
                                    )}
                                    {GLOBAL.Device_IsPwaIosSafari && (
                                        <Text
                                            size={10}
                                            bold={true}
                                            lineHeight={15}
                                            color={'#333'}>
                                            iOS & Safari: Install this App on
                                            your phone by pressing the share
                                            icon followed by 'Add to
                                            Homescreen'.
                                        </Text>
                                    )}
                                    {GLOBAL.Device_IsPwaAndroidSamsung && (
                                        <Text
                                            size={10}
                                            bold={true}
                                            lineHeight={15}
                                            color={'#333'}>
                                            Install this App on your phone by
                                            pressing the setting icon followed
                                            by 'Add page to' and then 'Home
                                            screen'.
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                        <View
                            style={{
                                transform: [{rotateZ: '45deg'}],
                                width: 20,
                                height: 20,
                                backgroundColor: '#f2f8fe',
                                marginTop: -10,
                            }}></View>
                    </View>
                )}
                <FlatList
                    key={profiles}
                    extraData={profiles}
                    data={profiles}
                    numColumns={GLOBAL.Device_IsPortrait ? 3 : 6}
                    horizontal={false}
                    removeClippedSubviews={true}
                    keyExtractor={(item, index) => index.toString()}
                    onScrollToIndexFailed={() => {}}
                    renderItem={renderProfile}
                />
            </View>
            {showModal && (
                <View
                    style={{
                        flex: 1,
                        position: 'absolute',
                        top: 50,
                        left: 0,
                        right: 0,
                        zIndex: 99999,
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            flex: 1,
                            marginHorizontal: 20,
                            alignItems: 'center',
                        }}>
                        <Card disabled={true}>
                            <Text h5 bold>
                                {LANG.getTranslation('childlock')}
                            </Text>
                            <Text>
                                {LANG.getTranslation('enter_pin_access')}
                            </Text>
                            <Text
                                color={'red'}
                                style={{color: 'red'}}
                                category="s1"
                                status="basic">
                                {error}
                            </Text>
                            <Input
                                style={{
                                    margin: 5,
                                    backgroundColor: 'transparent',
                                }}
                                status="control"
                                placeholder={''}
                                accessoryLeft={LockIcon}
                                value={parentalCode}
                                secureTextEntry={true}
                                autoComplete={'off'}
                                onChangeText={setParentalCode}
                                onFocus={() => setError('')}
                                underlineColorAndroid="transparent"
                            />
                            <Button
                                style={{marginTop: 20, marginBottom: 5}}
                                onPress={() => checkParentalCode()}>
                                {LANG.getTranslation('submit')}
                            </Button>
                            <Button
                                style={{marginBottom: 10}}
                                onPress={() => setShowModal(!showModal)}>
                                {LANG.getTranslation('cancel')}
                            </Button>
                        </Card>
                    </View>
                </View>
            )}
            {showModalEdit && (
                <View
                    style={{
                        flex: 1,
                        position: 'absolute',
                        top: 50,
                        left: 0,
                        right: 0,
                        zIndex: 99999,
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            flex: 1,
                            marginHorizontal: 20,
                            alignItems: 'center',
                        }}>
                        <Card disabled={true}>
                            <Text h5 bold>
                                {LANG.getTranslation('childlock')}
                            </Text>
                            <Text>
                                {LANG.getTranslation('enter_pin_access')}
                            </Text>
                            <Text
                                color={'red'}
                                style={{color: 'red'}}
                                category="s1"
                                status="basic">
                                {error}
                            </Text>
                            <Input
                                style={{
                                    margin: 5,
                                    backgroundColor: 'transparent',
                                }}
                                status="control"
                                placeholder={''}
                                accessoryLeft={LockIcon}
                                value={parentalCode}
                                secureTextEntry={true}
                                autoComplete={'off'}
                                onChangeText={setParentalCode}
                                onFocus={() => setError('')}
                                underlineColorAndroid="transparent"
                            />
                            <Button
                                style={{marginTop: 20, marginBottom: 5}}
                                onPress={() => checkParentalCode()}>
                                {LANG.getTranslation('submit')}
                            </Button>
                            <Button
                                style={{marginBottom: 10}}
                                onPress={() =>
                                    setShowModalEdit(!showModalEdit)
                                }>
                                {LANG.getTranslation('cancel')}
                            </Button>
                        </Card>
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};
const styles = StyleSheet.create({
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        flex: 1,
    },
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        minHeight: 200,
    },
    formContainer: {
        flex: 1,
        marginTop: 0,
        paddingHorizontal: 16,
    },
    signInLabel: {
        marginTop: 16,
    },
    signInLabel_: {
        marginBottom: 16,
        marginHorizontal: 20,
        alignSelf: 'center',
    },
    signInButton: {
        marginHorizontal: 16,
        marginVertical: 4,
    },
    signUpButton: {
        marginVertical: 12,
        marginHorizontal: 16,
    },
    forgotPasswordContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    passwordInput: {
        marginTop: 16,
    },
    forgotPasswordButton: {
        paddingHorizontal: 0,
    },
    indicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
