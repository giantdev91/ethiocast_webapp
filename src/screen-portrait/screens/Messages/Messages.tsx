import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    View,
    KeyboardAvoidingView,
    ImageBackground,
    BackHandler,
    TVMenuControl,
} from 'react-native';
import {Button} from '@ui-kitten/components';
import {ImageOverlay} from './extra/image-overlay.component';
import {Text} from '../../components';
import SIZES from '../../constants/sizes';
import {CommonActions} from '@react-navigation/native';
import {sendPageReport} from '../../../reporting/reporting';

export default ({navigation}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [messages, setMessages] = useState([]);
    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Messages', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var messagesIn = sortMessages();
        setMessages(messagesIn);
    }, []);
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
    const sortMessages = () => {
        var originalMessages = GLOBAL.Messages.filter(m => m.deleted == false);
        GLOBAL.Messages_QTY = originalMessages.length;
        originalMessages.sort((channel1, channel2) => {
            if (channel1.tz > channel2.tz) return -1;
            if (channel1.tz < channel2.tz) return 1;
            return 0;
        });
        GLOBAL.Messages = originalMessages;
        return originalMessages;
    };
    const onDeleteMessage = index => {
        var item_ = GLOBAL.Messages.filter(m => m.deleted == false)[index];
        var item = GLOBAL.Messages.find(m => m.id == item_.id);
        item.deleted = true;
        UTILS.storeJson('Messages' + GLOBAL.UserID, GLOBAL.Messages);
        var messagesIn = sortMessages();
        setMessages(messagesIn);
    };
    const renderItem = (item, index) => {
        return (
            <View
                style={{
                    flex: 1,
                    padding: 20,
                    flexDirection: 'row',
                    margin: 5,
                    backgroundColor: 'rgba(0, 0, 0, 0.60)',
                    borderRadius: 5,
                }}
            >
                <View style={{flex: 1}}>
                    {/* <Text s5 bold>{item.title}</Text> */}
                    <Text>{item.message}</Text>
                </View>
                <View>
                    <Button onPress={() => onDeleteMessage(index)}>
                        {LANG.getTranslation('delete')}
                    </Button>
                </View>
            </View>
        );
    };
    return (
        <KeyboardAvoidingView style={{flex: 1}}>
            <ImageOverlay
                style={styles.container}
                source={{uri: GLOBAL.Background}}
            >
                <View style={styles.headerContainer}>
                    <View
                        style={{
                            alignItems: 'flex-start',
                            width: sizes.width * 0.97,
                            margin: 5,
                            paddingLeft: 10,
                            paddingTop: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.33)',
                            paddingBottom: 20,
                            borderRadius: 5,
                        }}
                    >
                        <View style={{padding: 10, flexDirection: 'column'}}>
                            <Text h5>
                                {LANG.getTranslation('messagecenter')}
                            </Text>
                            <Text>
                                {LANG.getTranslation(
                                    'hereyoufindmessagesabout',
                                )}
                            </Text>
                        </View>
                    </View>
                </View>
                <View
                    style={{
                        flex: 1,
                        width: sizes.width * 0.97,
                        alignSelf: 'center',
                    }}
                >
                    <View style={{flex: 1, marginBottom: 32}}>
                        <FlatList
                            data={messages}
                            horizontal={false}
                            removeClippedSubviews={true}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item, index}) =>
                                renderItem(item, index)
                            }
                        />
                    </View>
                </View>
            </ImageOverlay>
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
        minHeight: 100,
    },
    formContainer: {
        flex: 1,
        marginTop: 0,
        paddingHorizontal: 5,
        paddingVertical: 5,
    },
    signInLabel: {
        marginTop: 16,
    },
    signInLabel_: {
        marginBottom: 16,
    },
    signInButton: {
        marginHorizontal: 16,
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
