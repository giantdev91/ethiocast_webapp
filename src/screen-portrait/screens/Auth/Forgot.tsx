import React, {ReactElement, useEffect, useState} from 'react';
import {
    StyleSheet,
    View,
    KeyboardAvoidingView,
    ImageBackground,
} from 'react-native';
import {Button} from '@ui-kitten/components';
import {Text} from '../../components';
import {sendPageReport, sendActionReport} from '../../../reporting/reporting';

export default ({navigation}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onSignInButtonPress = (type): void => {
        DAL.forgotPassword(type, '', GLOBAL.UserID, GLOBAL.Device_UniqueID)
            .then(data => {
                setSuccess(LANG.getTranslation('forgot_request_sent'));
            })
            .catch(error => {
                setError('Error');
            });
        sendActionReport('Request Login', 'Forget', moment().unix(), '');
        GLOBAL.Loaded = false;
        GLOBAL.Authenticated = false;
        GLOBAL.Profiled = false;
    };

    useEffect(() => {
        return () =>
            sendPageReport('Forgot Login', reportStartTime, moment().unix());
    }, []);
    return (
        <KeyboardAvoidingView style={{flex: 1}}>
            <View style={styles.headerContainer}>
                <Text style={styles.signInLabel} h4 status="control">
                    {LANG.getTranslation('forgetpassword')}
                </Text>
                <Text style={styles.signInLabel_} status="basic">
                    {LANG.getTranslation('selectmethod')}
                </Text>
                <View style={{height: 150, padding: 15}}></View>
            </View>
            <View style={styles.formContainer}>
                <Text center style={{color: 'red'}}>
                    {error}
                </Text>
                <Text center style={{color: 'green'}}>
                    {success}
                </Text>
                <Button
                    style={styles.signInButton}
                    size="giant"
                    onPress={() => onSignInButtonPress('sms')}
                >
                    {LANG.getTranslation('sms')}
                </Button>
                <Button
                    style={styles.signInButton}
                    size="giant"
                    onPress={() => onSignInButtonPress('email')}
                >
                    {LANG.getTranslation('email')}
                </Button>

                <Button
                    style={styles.signInButton}
                    size="giant"
                    onPress={() => navigation.goBack()}
                >
                    {LANG.getTranslation('back')}
                </Button>
            </View>
            <View style={[styles.signInButton, {height: 50}]}></View>
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
