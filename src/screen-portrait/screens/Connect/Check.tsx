import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, TextInput } from 'react-native';
import { Button } from '@ui-kitten/components';
import { Text } from '../../components';
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { sendPageReport } from '../../../reporting/reporting';

export default ({ navigation }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [connectCode, setConnectCode] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const numberOne = useRef(null);
    const numberTwo = useRef(null);
    const numberThree = useRef(null);
    const numberFour = useRef(null);
    const numberFive = useRef(null);
    const numberSix = useRef(null);

    const onSignInButtonPress = (): void => {
        (async () => {
            try {
                GLOBAL.show_log && console.log(
                    'on sign in button press: ',
                    GLOBAL.SIGN_IN_CHECK_CODE_URL + '?code=' +
                    connectCode +
                    '&userid=' +
                    GLOBAL.UserID +
                    '&pass=' +
                    GLOBAL.Pass +
                    '&serviceid=' +
                    GLOBAL.ServiceID,
                );
                let response = await fetch(
                    GLOBAL.SIGN_IN_CHECK_CODE_URL + '?code=' +
                    connectCode +
                    '&userid=' +
                    GLOBAL.UserID +
                    '&pass=' +
                    GLOBAL.Pass +
                    '&serviceid=' +
                    GLOBAL.ServiceID,
                );
                let data = await response.json();
                GLOBAL.show_log && console.log('on sign in button press response: ', data);
                if (data.success == false) {
                    numberOne.current.clear();
                    numberTwo.current.clear();
                    numberThree.current.clear();
                    numberFour.current.clear();
                    numberFive.current.clear();
                    numberSix.current.clear();
                    setShowError(true);
                } else {
                    setShowSuccess(true);
                }
            } catch (error) {
                setShowError(true);
            }
        })();
    };
    const onClearInput = () => {
        setConnectCode('');
        numberOne.current.clear();
        numberTwo.current.clear();
        numberThree.current.clear();
        numberFour.current.clear();
        numberFive.current.clear();
        numberSix.current.clear();
    };
    const setCodeTotal = (value, number) => {
        setShowError(false);
        if (number == 1) {
            numberOne.current.blur();
            numberTwo.current.focus();
        }
        if (number == 2) {
            numberTwo.current.blur();
            numberThree.current.focus();
        }
        if (number == 3) {
            numberThree.current.blur();
            numberFour.current.focus();
        }
        if (number == 4) {
            numberFour.current.blur();
            numberFive.current.focus();
        }
        if (number == 5) {
            numberFive.current.blur();
            numberSix.current.focus();
        }
        setConnectCode(connectCode + value);
    };
    useEffect(() => {
        return () =>
            sendPageReport(
                'Check Connect Code',
                reportStartTime,
                moment().unix(),
            );
    }, []);
    return (
        <KeyboardAvoidingView style={{ flex: 1 }}>
            <View style={styles.headerContainer}>
                <Text style={styles.signInLabel} h4>
                    {LANG.getTranslation('connect_device')}
                </Text>
                <Text style={styles.signInLabel_}>
                    {LANG.getTranslation('connect_your_device')}
                </Text>
            </View>
            {showSuccess == false && (
                <View
                    style={{
                        flex: 1,
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                    {showError && (
                        <Text
                            color={'red'}
                            size={30}
                            style={styles.signInLabel_}>
                            {LANG.getTranslation('pincode_wrong')}
                        </Text>
                    )}
                    {GLOBAL.Device_IsPortrait && (
                        <View style={{ flexDirection: 'row', marginBottom: 100 }}>
                            <View
                                style={{
                                    margin: 5,
                                    width: 50,
                                    height: 50,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberOne}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 5,
                                        width: 40,
                                        fontSize: 30,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 1)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 25,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -10,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 5,
                                    width: 50,
                                    height: 50,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberTwo}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 5,
                                        width: 40,
                                        fontSize: 30,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 2)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 25,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -10,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 5,
                                    width: 50,
                                    height: 50,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberThree}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 5,
                                        width: 40,
                                        fontSize: 30,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 3)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 25,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -10,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 5,
                                    width: 50,
                                    height: 50,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberFour}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 5,
                                        width: 40,
                                        fontSize: 30,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 4)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 25,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -10,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 5,
                                    width: 50,
                                    height: 50,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberFive}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 5,
                                        width: 40,
                                        fontSize: 30,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 5)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 25,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -10,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 5,
                                    width: 50,
                                    height: 50,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberSix}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 5,
                                        width: 40,
                                        fontSize: 30,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 6)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 25,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -10,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                        </View>
                    )}
                    {!GLOBAL.Device_IsPortrait && (
                        <View style={{ flexDirection: 'row' }}>
                            <View
                                style={{
                                    margin: 20,
                                    width: 100,
                                    height: 100,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberOne}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 10,
                                        width: 80,
                                        fontSize: 65,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 1)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 50,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -20,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 20,
                                    width: 100,
                                    height: 100,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberTwo}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 10,
                                        width: 80,
                                        fontSize: 65,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 2)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 50,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -20,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 20,
                                    width: 100,
                                    height: 100,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberThree}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 10,
                                        width: 80,
                                        fontSize: 65,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 3)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 50,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -20,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 20,
                                    width: 100,
                                    height: 100,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberFour}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 10,
                                        width: 80,
                                        fontSize: 65,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 4)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 50,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -20,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 20,
                                    width: 100,
                                    height: 100,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberFive}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 10,
                                        width: 80,
                                        fontSize: 65,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 5)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 50,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -20,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                            <View
                                style={{
                                    margin: 20,
                                    width: 100,
                                    height: 100,
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    borderRadius: 5,
                                }}>
                                <TextInput
                                    ref={numberSix}
                                    style={{
                                        color: '#fff',
                                        backgroundColor: 'transparent',
                                        margin: 10,
                                        width: 80,
                                        fontSize: 65,
                                        textAlign: 'center',
                                    }}
                                    placeholder=""
                                    onChangeText={value =>
                                        setCodeTotal(value, 6)
                                    }
                                    underlineColorAndroid="transparent"
                                />
                                <View
                                    style={{
                                        width: 50,
                                        borderBottomColor: '#fff',
                                        borderBottomWidth: 4,
                                        margin: -20,
                                        alignSelf: 'center',
                                    }}></View>
                            </View>
                        </View>
                    )}
                    <View style={{ flexDirection: 'row' }}>
                        <Button
                            style={styles.signInButton}
                            size="giant"
                            onPress={onClearInput}>
                            {LANG.getTranslation('clear')}
                        </Button>
                        <Button
                            style={styles.signInButton}
                            size="giant"
                            onPress={onSignInButtonPress}>
                            {LANG.getTranslation('submit')}
                        </Button>
                    </View>
                </View>
            )}
            {showSuccess && (
                <View
                    style={{
                        flex: 1,
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                    <FontAwesome5
                        style={{ fontSize: 150, color: '#fff', marginRight: 20 }}
                        // icon={SolidIcons.check}
                        name="check"
                    />
                    <Text style={styles.signInLabel} h4>
                        {LANG.getTranslation('connect_device_success')}
                    </Text>
                </View>
            )}
        </KeyboardAvoidingView>
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
    },
    signInLabel: {
        marginTop: 16,
    },
    signInLabel_: {
        marginBottom: 16,
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
});
