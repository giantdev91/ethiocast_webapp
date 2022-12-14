import React, { ReactElement, useEffect, useCallback, useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    ScrollView,
    BackHandler,
    TouchableOpacity,
} from 'react-native';
import { Button, Input, Icon, Modal, Card } from '@ui-kitten/components';
import { Text, Block } from '../../components';
import { ServiceIcon } from './extra/icons';
import Decode from 'unescape';
import HTML from 'react-native-render-html';
import SIZES from '../../constants/sizes';
import TimerMixin from 'react-timer-mixin';
import { useFocusEffect } from '@react-navigation/native';
import { sendPageReport } from '../../../reporting/reporting';
import { CommonActions } from '@react-navigation/native';
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default ({ navigation }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    var closeAppTimer;
    var sizes = SIZES.getSizing();

    //var sizes = SIZES.getSizing();
    const [focus, setFocus] = useState(false);
    const [serviceId, setServiceId] = useState(GLOBAL.Selected_Service);
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [showCloseAppModal, setShowCloseAppModal] = useState(false);
    const [backPressedCount, setBackPressedCount] = useState(0);

    useEffect(() => {
        return () =>
            sendPageReport('Services', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        return () => {
            TimerMixin.clearTimeout(closeAppTimer);
        };
    }, []);
    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', () => {
                // setBackPressedCount((backPressedCount) => backPressedCount + 1);
                // setShowCloseAppModal(true);
                // startCloseAppTimer();
                onBackToLanguages();
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
    const onSignInButtonPress = (): void => {
        (async () => {
            try {
                let res = await checkServiceExists();
                if (res.success) {
                    let res2 = await getSettingsService();
                    if (res2.success) {
                        navigation && navigation.navigate('Signin');
                    }
                } else {
                    setError(res.error);
                }
            } catch (error) {
                setError(error);
            }
        })();
    };

    const onBackToLanguages = (): void => {
        GLOBAL.Selected_Language = '';
        navigation && navigation.navigate('Language');
    };

    const onForgotPasswordButtonPress = (): void => {
        navigation && navigation.navigate('Home');
    };

    const onPasswordIconPress = (): void => {
        setPasswordVisible(!passwordVisible);
    };

    const renderPasswordIcon = (props): ReactElement => (
        <TouchableWithoutFeedback onPress={onPasswordIconPress}>
            <Icon {...props} name={passwordVisible ? 'eye-off' : 'eye'} />
        </TouchableWithoutFeedback>
    );

    const checkServiceExists = async () => {
        UTILS.storeJson('ServiceID', serviceId);
        GLOBAL.Selected_Service = serviceId;
        GLOBAL.ServiceID = serviceId;

        const usingArrayFrom = JSON.parse(GLOBAL.Services);
        var weHaveHit = false;
        var x = Object.keys(usingArrayFrom);
        var mappedArr = x.map(function (i) {
            if (i == serviceId) {
                GLOBAL.Package = usingArrayFrom[i]
                    .toString()
                    .replace('http://', '')
                    .toString()
                    .replace('https://', '');
                weHaveHit = true;
                return usingArrayFrom[i];
            }
        });
        if (weHaveHit == true) {
            GLOBAL.Selected_Service = serviceId;
            return { success: true };
        } else {
            return {
                success: false,
                error: LANG.getTranslation('wrong_service_id'),
            };
        }
    };
    const getSettingsService = async () => {
        try {
            GLOBAL.show_log && console.log(
                'get settings service: ',
                GLOBAL.HTTPvsHTTPS +
                'authorize.akamaized.net/mappings/' +
                GLOBAL.Package +
                '/settings/settings.json?time=' +
                moment().unix(),
            );
            let response = await fetch(
                GLOBAL.HTTPvsHTTPS +
                'authorize.akamaized.net/mappings/' +
                GLOBAL.Package +
                '/settings/settings.json?time=' +
                moment().unix(),
            );
            let data = await response.json();
            data = JSON.parse(data);
            GLOBAL.show_log && console.log('get settings service response: ', data);
            GLOBAL.Settings_Login = data;
            GLOBAL.CMS = data.cms;
            GLOBAL.CRM = data.crm;
            GLOBAL.IMS = data.client;
            if (data.beacon_url) {
                GLOBAL.Beacon_URL = data.beacon_url;
            }
            GLOBAL.Disclaimer = data.account.disclaimer;
            GLOBAL.Show_Disclaimer = data.account.is_show_disclaimer;
            GLOBAL.ImageUrlCMS =
                GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/' +
                data.client +
                '/images/' +
                data.cms +
                '/';
            GLOBAL.ImageUrlCRM =
                GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/' +
                data.client +
                '/images/' +
                data.crm +
                '/';
            GLOBAL.GuiBaseUrl =
                GLOBAL.HTTPvsHTTPS +
                'cloudtv.akamaized.net/' +
                data.client +
                '/userinterfaces/';
            //**social login start*/
            if (
                data.social &&
                !GLOBAL.Device_IsSmartTV &&
                !GLOBAL.Device_IsAppleTV
            ) {
                GLOBAL.UseSocialLogin = data.social.social_enabled;
                GLOBAL.SocialGoogle = data.social.google_enabled;
                GLOBAL.SocialFacebook = data.social.facebook_enabled;
                GLOBAL.SocialPhone = data.social.phone_enabled;
                GLOBAL.SocialEmail = data.social.email_enabled;
            }
            //in-app purchase//
            if (data.in_app_purchase_enabled) {
                GLOBAL.InAppPurchase = data.in_app_purchase_enabled;
            }
            //*apps links //
            if (data.apps) {
                GLOBAL.Android_Download_Enabled = data.apps.show_android;
                GLOBAL.Android_Download_Link = data.apps.android_url;
                GLOBAL.IOS_Download_Enabled = data.apps.show_ios;
                GLOBAL.IOS_Download_Link = data.apps.ios_url;
            }
            GLOBAL.Logo =
                GLOBAL.HTTPvsHTTPS +
                data.contact.logo
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Background =
                GLOBAL.HTTPvsHTTPS +
                data.contact.background
                    .toString()
                    .replace('http://', '')
                    .replace('https://', '')
                    .replace('//', '');
            GLOBAL.Support = Decode(data.contact.text);
            GLOBAL.Button_Color =
                GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                    ? 'transparent'
                    : data.contact.selection_color;
            GLOBAL.Show_Error = '';

            return { success: true };
        } catch (error) {
            return { success: false, error: 'Cloud Server Error' };
        }
    };

    const handleFocus = () => {
        setError('');
        setFocus(true);
    };
    const handleBlur = () => {
        setFocus(false);
    };
    return (
        <View style={{ flex: 1 }}>
            <Modal
                style={{
                    width: GLOBAL.Device_IsPortrait
                        ? sizes.width * 0.8
                        : sizes.width * 0.3,
                }}
                visible={showCloseAppModal}
                onBackdropPress={() => setShowCloseAppModal(false)}
                backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}>
                <Card disabled={true}>
                    <Text h5 bold>
                        {LANG.getTranslation('exit_app')}
                    </Text>
                    <Text>{LANG.getTranslation('exit_app_click_again')}</Text>
                    <Text>{LANG.getTranslation('exit_app_close')}</Text>
                </Card>
            </Modal>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                }}>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 9999,
                    }}>
                    <View
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.30)',
                            borderRadius: 100,
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: 10,
                        }}>
                        <FocusButton
                            style={{ borderRadius: 100 }}
                            onPress={() => onBackToLanguages()}>
                            <FontAwesome5
                                style={{ fontSize: 18, color: '#fff' }}
                                // icon={SolidIcons.arrowLeft}
                                name="arrow-left"
                            />
                        </FocusButton>
                    </View>
                </View>
                <View style={{ flex: 1, margin: 20 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.signInLabel} h4 status="control">
                            {LANG.getTranslation('connectservice')}
                        </Text>
                        <Text style={styles.signInLabel_} status="basic">
                            {LANG.getTranslation('enterserviceid')}
                        </Text>
                    </View>
                    {GLOBAL.Show_PWA_Message && GLOBAL.Device_IsWebTvMobile && (
                        <View
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginVertical: 10,
                            }}>
                            <View
                                style={{
                                    width: sizes.width * 0.98,
                                    height: 50,
                                    backgroundColor: '#f2f8fe',
                                    borderRadius: 5,
                                }}>
                                <View style={{ flexDirection: 'row' }}>
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
                                                    Install this App on your
                                                    phone by pressing the
                                                    settings icon followed by
                                                    'Install App'.
                                                </Text>
                                            )}
                                        {GLOBAL.Device_IsPwaIosChrome && (
                                            <Text
                                                size={10}
                                                bold={true}
                                                lineHeight={15}
                                                color={'#333'}>
                                                Did you know? That if you open
                                                this page in a Safari Browser
                                                you can install it as an App on
                                                your device.
                                            </Text>
                                        )}
                                        {GLOBAL.Device_IsPwaIosSafari && (
                                            <Text
                                                size={10}
                                                bold={true}
                                                lineHeight={15}
                                                color={'#333'}>
                                                iOS & Safari: Install this App
                                                on your phone by pressing the
                                                share icon followed by 'Add to
                                                Homescreen'.
                                            </Text>
                                        )}
                                        {GLOBAL.Device_IsPwaAndroidSamsung && (
                                            <Text
                                                size={10}
                                                bold={true}
                                                lineHeight={15}
                                                color={'#333'}>
                                                Install this App on your phone
                                                by pressing the setting icon
                                                followed by 'Add page to' and
                                                then 'Home screen'.
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View
                                style={{
                                    transform: [{ rotateZ: '45deg' }],
                                    width: 20,
                                    height: 20,
                                    backgroundColor: '#f2f8fe',
                                    marginTop: -10,
                                }}></View>
                        </View>
                    )}
                    <View
                        style={[
                            {
                                flex: 1,
                                flexDirection: 'row',
                                alignSelf: 'center',
                                width: sizes.width,
                            },
                        ]}>
                        <View
                            style={[
                                {
                                    flex: 1,
                                    justifyContent: 'flex-start',
                                    margin: 10,
                                    paddingTop: 50,
                                },
                            ]}>
                            <Text
                                style={{ color: 'red', paddingBottom: 10 }}
                                status="basic">
                                {error}
                            </Text>
                            <Input
                                style={{
                                    marginHorizontal: 20,
                                    backgroundColor: 'transparent',
                                }}
                                status="control"
                                placeholder={'123...'}
                                accessoryLeft={ServiceIcon}
                                accessoryRight={renderPasswordIcon}
                                value={serviceId}
                                secureTextEntry={!passwordVisible}
                                onChangeText={setServiceId}
                                onFocus={() => setError('')}
                                underlineColorAndroid="transparent"
                            />
                            <View style={{ justifyContent: 'center' }}>
                                <Button
                                    style={[
                                        styles.signInButton,
                                        { marginTop: 20 },
                                    ]}
                                    appearance={'filled'}
                                    size="giant"
                                    onPress={onSignInButtonPress}>
                                    {LANG.getTranslation('submit')}
                                </Button>
                            </View>
                        </View>
                        <View style={[{ flex: 1, marginTop: 10 }]}>
                            {GLOBAL.Support != '' ? (
                                <View
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(0, 0, 0, 0.30)',
                                        borderRadius: 5,
                                        margin: 10,
                                        padding: 10,
                                    }}>
                                    <ScrollView>
                                        <HTML
                                            source={{
                                                html: Decode(GLOBAL.Support),
                                            }}
                                            baseFontStyle={{
                                                color: '#fff',
                                                fontSize: 16,
                                            }}
                                        />
                                    </ScrollView>
                                </View>
                            ) : (
                                <View></View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        minHeight: 200,
    },
    formContainer: {
        flex: 1,
        marginTop: 0,
        paddingHorizontal: 16,
    },
    signInLabel: {},
    signInLabel_: {},
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
        margin: 20,
    },
    forgotPasswordButton: {
        paddingHorizontal: 0,
    },
});
