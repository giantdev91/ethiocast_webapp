import React, {useEffect, useCallback, useState} from 'react';
import {
    StyleSheet,
    View,
    KeyboardAvoidingView,
    BackHandler,
} from 'react-native';
import {Button, Modal, Card} from '@ui-kitten/components';
import {Text} from '../../components';
import SIZES from '../../constants/sizes';
import TimerMixin from 'react-timer-mixin';
import {useFocusEffect} from '@react-navigation/native';
import {sendPageReport, sendActionReport} from '../../../reporting/reporting';
import {CommonActions} from '@react-navigation/native';

export default ({navigation}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [languages, setLanguages] = useState([]);
    var closeAppTimer;
    var sizes = SIZES.getSizing();
    const [showCloseAppModal, setShowCloseAppModal] = useState(false);
    const [backPressedCount, setBackPressedCount] = useState(0);

    useEffect(() => {
        return () =>
            sendPageReport('Languages', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (GLOBAL.Selected_Language != '' && GLOBAL.HasService == true) {
            GLOBAL.Languaged = true;
            navigation && navigation.navigate('Service');
        }
        if (GLOBAL.Selected_Language != '' && GLOBAL.HasService == false) {
            GLOBAL.Languaged = true;
            navigation && navigation.navigate('Signin');
        }
        setLanguages(GLOBAL.Settings_Services_Login.languages);
        return () => {
            TimerMixin.clearTimeout(closeAppTimer);
        };
    }, [navigation]);
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
    const onSetLanguage = (lang): void => {
        var language = LANG.getLanguage(lang);
        UTILS.storeJson('Selected_Language', language);
        sendActionReport(
            'Change Language',
            'Language',
            moment().unix(),
            language,
        );
        GLOBAL.Selected_Language = language;
        GLOBAL.Languaged = true;
        if (GLOBAL.HasService == true) {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Service'}],
                }),
            );
            // navigation && navigation.navigate('Service');
        } else {
            GLOBAL.ServiceID = '';
            // navigation && navigation.navigate('Signin');
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Signin'}],
                }),
            );
        }
    };
    const renderItem = (item, index) => {
        if (item.language == null) {
            return null;
        }
        return (
            <Button
                style={[styles.signInButton, {margin: 4}]}
                size="giant"
                onPress={() => onSetLanguage(item.language)}
            >
                {LANG.getLanguage(item.language)}
            </Button>
        );
    };
    return (
        <View style={{flex: 1}}>
            <KeyboardAvoidingView style={{flex: 1}}>
                <Modal
                    style={{
                        width: GLOBAL.Device_IsPortrait
                            ? sizes.width * 0.8
                            : sizes.width * 0.3,
                    }}
                    visible={showCloseAppModal}
                    onBackdropPress={() => setShowCloseAppModal(false)}
                    backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.40)'}}
                >
                    <Card disabled={true}>
                        <Text h5 bold>
                            {LANG.getTranslation('exit_app')}
                        </Text>
                        <Text>
                            {LANG.getTranslation('exit_app_click_again')}
                        </Text>
                        <Text>{LANG.getTranslation('exit_app_close')}</Text>
                    </Card>
                </Modal>

                <View style={styles.headerContainer}></View>

                <View style={styles.formContainer}>
                    <View
                        style={{
                            flex: 1,
                            marginBottom: 32,
                            alignItems: 'center',
                            height: sizes.height * 0.8,
                        }}
                    >
                        <FlatList
                            data={languages}
                            horizontal={false}
                            removeClippedSubviews={true}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item, index}) =>
                                renderItem(item, index)
                            }
                        />
                    </View>
                    <Text category="s1" status="basic">
                        {GLOBAL.Device_FormFactor}
                    </Text>
                    <Text category="s1" status="basic">
                        {GLOBAL.Device_UniqueID}
                    </Text>
                </View>
                {GLOBAL.Show_PWA_Message && GLOBAL.Device_IsWebTvMobile && (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            top: 10,
                            left: 0,
                            right: 0,
                        }}
                    >
                        <View
                            style={{
                                width: sizes.width * 0.98,
                                height: 50,
                                backgroundColor: '#f2f8fe',
                                borderRadius: 5,
                            }}
                        >
                            <View style={{flexDirection: 'row'}}>
                                <View
                                    style={{
                                        backgroundColor: '#999',
                                        height: 40,
                                        width: 40,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: 5,
                                    }}
                                >
                                    <Text size={35}>+</Text>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        paddingHorizontal: 5,
                                    }}
                                >
                                    {GLOBAL.Device_IsPwaAndroidChrome &&
                                        !GLOBAL.Device_IsPwaAndroidSamsung && (
                                            <Text
                                                size={10}
                                                bold={true}
                                                lineHeight={15}
                                                color={'#333'}
                                            >
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
                                            color={'#333'}
                                        >
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
                                            color={'#333'}
                                        >
                                            iOS & Safari: Install this App on
                                            your phone by pressing the share
                                            icon below followed by 'Add to
                                            Homescreen'.
                                        </Text>
                                    )}
                                    {GLOBAL.Device_IsPwaAndroidSamsung && (
                                        <Text
                                            size={10}
                                            bold={true}
                                            lineHeight={15}
                                            color={'#333'}
                                        >
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
                            }}
                        ></View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 100,
    },
    formContainer: {
        flex: 1,
        marginTop: 0,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    signInLabel: {
        marginTop: 16,
    },
    signInLabel_: {
        marginBottom: 16,
    },
    signInButton: {},
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
});
