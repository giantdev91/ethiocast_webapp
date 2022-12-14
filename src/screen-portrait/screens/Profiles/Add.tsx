import React, {ReactElement, useState, useEffect, useCallback} from 'react';
import {
    View,
    ImageBackground,
    KeyboardAvoidingView,
    StyleSheet,
    BackHandler,
} from 'react-native';
import SIZES from '../../constants/sizes';
import {Text} from '../../components';
import {ImageOverlay} from './extra/image-overlay.component';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Icon,
    Input,
    Layout,
    Toggle,
    IndexPath,
} from '@ui-kitten/components';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import {sendPageReport, sendActionReport} from '../../../reporting/reporting';
import {useFocusEffect} from '@react-navigation/native';

export default ({navigation, route}): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [profileName, setProfileName] = useState('');
    const [lockAccount, setLockAccount] = useState(false);
    const [typeAccount, setTypeAccount] = useState(false);
    const [ageRatingVisible, setAgeRatingVisible] = useState(false);
    const [ageRatingName, setAgeRatingName] = useState('');
    const [accountTypeName, setAccountTypeName] = useState('');
    const [lockName, setLockName] = useState('');
    const [selectedAgeRatingIndex, setSelectedAgeRatingIndex] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [ageRating, setAgeRating] = useState([]);

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Add Profile', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        setRatings(GLOBAL.Profile_Ratings);
        setAccountTypeName(LANG.getTranslation('regular'));
        setLockName('False');
        setAgeRatingName('TV-ALL');
        setSelectedAgeRatingIndex({row: 0, section: 0});
    }, []);
    const UserIcon = props => (
        <Icon {...props} fill="#fff" name="people-outline" />
    );
    const onLockAccount = checked => {
        sendActionReport(
            'Lock Profile',
            'Add Profile',
            moment().unix(),
            checked,
        );
        setLockAccount(checked);
        setLockName(checked ? 'True' : 'False');
    };
    // const onTypeAccount = (checked) => {
    //     sendActionReport('Kids Account', 'Add Profile', moment().unix(), checked);
    //     setTypeAccount(checked);
    //     setAccountTypeName(checked == trLANG.getTranslation('regular'));
    // };
    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener('hardwareBackPress', () => {
                onBackToProfiles();
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
    const renderAgeRatingButton = () => (
        <Button onPress={() => setAgeRatingVisible(true)}>
            {ageRatingName}
        </Button>
    );
    const onItemSelectAgeRating = index => {
        var rating = ratings[index.row];
        sendActionReport(
            'Age Rating',
            'Add Profile',
            moment().unix(),
            rating.rating,
        );
        setAgeRatingName(rating.rating);
        setAgeRating(rating);
        setAgeRatingVisible(false);
    };
    const renderCategoryItem = (category, index) => (
        <MenuItem
            style={{backgroundColor: '#111'}}
            key={index}
            title={category.rating}
        />
    );
    const onSubmit = () => {
        if (profileName == '') {
            return;
        }
        var newProfile = {
            data: {
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
            },
            recommendations: [],
            name: profileName,
            mode: typeAccount == false ? 'regular' : 'kids mode',
            age_rating: ageRatingName,
            profile_lock: lockAccount,
            avatar: '',
            id: Math.floor(Math.random() * 1000),
        };
        GLOBAL.Profiles.unshift(newProfile);
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
        ).then(result => {
            navigation.navigate({
                name: 'Profiles',
                params: {
                    profiles: GLOBAL.Profiles,
                },
                merge: true,
            });
        });
    };
    const onBackToProfiles = () => {
        navigation.goBack();
    };
    return (
        <KeyboardAvoidingView style={{flex: 1}}>
            <View style={styles.headerContainer}>
                <Text style={styles.signInLabel} h4 status="control">
                    {LANG.getTranslation('add_profile')}
                </Text>
                <Text
                    width={sizes.width}
                    style={styles.signInLabel_}
                    center
                    status="basic"
                >
                    {LANG.getTranslation('wittheprofile')}
                </Text>
            </View>
            <View style={styles.formContainer}>
                <View>
                    <Input
                        style={{
                            marginVertical: 20,
                            backgroundColor: 'transparent',
                        }}
                        status="control"
                        placeholder={LANG.getTranslation('profile_name')}
                        accessoryLeft={UserIcon}
                        value={profileName}
                        onChangeText={setProfileName}
                        underlineColorAndroid="transparent"
                    />
                </View>
                <View style={{marginBottom: 20}}>
                    <Text style={{marginBottom: 10}}>
                        {LANG.getTranslation('select_age_rating')}
                    </Text>
                    <OverflowMenu
                        anchor={renderAgeRatingButton}
                        visible={ageRatingVisible}
                        //selectedIndex={selectedAgeRatingIndex}
                        fullWidth={true}
                        style={{
                            width: sizes.width * 0.9,
                            marginTop:
                                GLOBAL.Device_Manufacturer == 'Apple' ? 0 : 30,
                        }}
                        onBackdropPress={() => setAgeRatingVisible(false)}
                        onSelect={onItemSelectAgeRating}
                    >
                        {ratings.map(renderCategoryItem)}
                    </OverflowMenu>
                </View>
                <View style={{flexDirection: 'row', marginBottom: 20}}>
                    <View
                        style={{
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                        }}
                    >
                        <Text style={{marginBottom: 10}}>
                            {LANG.getTranslation(
                                'lock_account_parental_control',
                            )}
                        </Text>
                        <Toggle
                            status="control"
                            checked={lockAccount}
                            onChange={onLockAccount}
                        >
                            <Text>{lockName}</Text>
                        </Toggle>
                    </View>
                </View>

                {/* <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={{ marginBottom: 10 }}>{LANG.getTranslation("select_account_type")}</Text>
                            <Toggle status='control' checked={typeAccount} onChange={onTypeAccount}>
                                <Text>{accountTypeName}</Text>
                            </Toggle>
                        </View>
                    </View> */}
            </View>
            <View style={{marginBottom: 20}}>
                <Button
                    style={styles.signInButton}
                    size="giant"
                    onPress={onSubmit}
                >
                    {LANG.getTranslation('submit')}
                </Button>
                <Button
                    style={styles.signInButton}
                    size="giant"
                    onPress={onBackToProfiles}
                >
                    {LANG.getTranslation('back')}
                </Button>
            </View>
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
