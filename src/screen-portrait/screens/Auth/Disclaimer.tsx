import React, {ReactElement, useState, useEffect} from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {Button} from '@ui-kitten/components';
import {Text} from '../../components';
import HTML from 'react-native-render-html';
import Decode from 'unescape';
import {sendPageReport} from '../../../reporting/reporting';

export default ({navigation}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const onBackToLogin = (): void => {
        navigation && navigation.navigate('Signin');
    };
    useEffect(() => {
        return () =>
            sendPageReport('Disclaimer', reportStartTime, moment().unix());
    }, []);
    return (
        <View style={{flex: 1}}>
            <View style={styles.headerContainer}>
                <Text style={styles.signInLabel} h4>
                    {LANG.getTranslation('disclaimer')}
                </Text>
            </View>
            <View style={styles.formContainer}>
                <ScrollView style={{padding: 20}}>
                    <HTML
                        source={{html: Decode(GLOBAL.Disclaimer)}}
                        baseFontStyle={{color: '#fff', fontSize: 16}}
                    />
                </ScrollView>
            </View>
            <Button
                style={styles.signInButton}
                size="giant"
                onPress={onBackToLogin}
            >
                {LANG.getTranslation('back')}
            </Button>
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
        alignSelf: 'center',
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
        marginBottom: 75,
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
