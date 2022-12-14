import React, {ReactElement, useState, useEffect, useCallback} from 'react';
import {
    View,
    KeyboardAvoidingView,
    StyleSheet,
    BackHandler,
} from 'react-native';
import SIZES from '../../constants/sizes';
import {Text} from '../../components';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Icon,
    Input,
    Toggle,
} from '@ui-kitten/components';
// import GLOBALModule from '../../../datalayer/global';
var GLOBALModule = require('../../../datalayer/global');
var GLOBAL = GLOBALModule.default;
import {sendPageReport, sendActionReport} from '../../../reporting/reporting';
import {CommonActions} from '@react-navigation/native';
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
    const [profile, setProfile] = useState([]);

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () =>
            sendPageReport('Edit Profile', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        setRatings(GLOBAL.Profile_Ratings);
        if (route.params?.profile != undefined) {
            var profile_ = route.params?.profile;
            setProfileName(profile_.item.name);
            setLockAccount(profile_.item.profile_lock);
            setTypeAccount(profile_.item.mode == 'regular' ? false : true);
            setAccountTypeName(capitalize(profile_.item.mode));
            setLockName(capitalize(profile_.item.profile_lock));
            setAgeRatingName(profile_.item.age_rating);
            setProfile(profile_);
        }
        setSelectedAgeRatingIndex({row: 0, section: 0});
    }, []);
    const capitalize = s => {
        if (typeof s !== 'string') return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    const UserIcon = props => (
        <Icon {...props} fill="#fff" name="people-outline" />
    );
    const onLockAccount = checked => {
        sendActionReport(
            'Lock Profile',
            'Edit Profile',
            moment().unix(),
            checked,
        );
        setLockAccount(checked);
        setLockName(checked ? 'True' : 'False');
    };
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
    // const onTypeAccount = (checked) => {
    //     sendActionReport('Kids Account', 'Edit Profile', moment().unix(), checked);
    //     setTypeAccount(checked);
    //     setAccountTypeName(checked == true ? LANG.getTranslation('kids') : LANG.getTranslation('regular'));
    // };
    const renderAgeRatingButton = () => (
        <Button onPress={() => setAgeRatingVisible(true)}>
            {ageRatingName}
        </Button>
    );
    const onItemSelectAgeRating = index => {
        var rating = ratings[index.row];
        sendActionReport(
            'Age Rating',
            'Edit Profile',
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
        GLOBAL.Profiles.find(u => u.id == profile.item.id).name = profileName;
        GLOBAL.Profiles.find(u => u.id == profile.item.id).age_rating =
            ageRatingName;
        GLOBAL.Profiles.find(u => u.id == profile.item.id).profile_lock =
            lockAccount;
        GLOBAL.Profiles.find(u => u.id == profile.item.id).mode = 'regular';

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
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Profiles'}],
                }),
            );
        });
    };
    const onBackToProfiles = () => {
        navigation.goBack();
    };
    return (
        <KeyboardAvoidingView style={{flex: 1}}>
            <View style={styles.headerContainer}>
                <Text style={styles.signInLabel} h4 status="control">
                    {LANG.getTranslation('edit_profile')}
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
