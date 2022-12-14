import React, { ReactElement, useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
    TabBar,
    Tab,
    Layout,
    OverflowMenu,
    Toggle,
    MenuItem,
    Button,
    Input,
    Icon,
    Card,
    Modal,
} from '@ui-kitten/components';
import {
    View,
    ImageBackground,
    Platform,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { Block, Text } from '../../components';
import SIZES from '../../constants/sizes';
import { BackHandler, TVMenuControl } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import UTILS from '../../../datalayer/utils';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { PersonIcon, LockIcon } from './extra/icons';
import { sendPageReport, sendActionReport } from '../../../reporting/reporting';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default ({ navigation }): React.ReactElement => {
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const { Navigator, Screen } = createMaterialTopTabNavigator();
    var sizes = SIZES.getSizing();

    const [selectedLanguageName, setSelectedLanguageName] = useState(
        GLOBAL.Selected_Language,
    );
    const [selectedOffsetName, setSelectedOffsetName] = useState(
        GLOBAL.Catchup_DVR_Offset + ' ' + LANG.getTranslation('minutes'),
    );
    const [offsetVisible, setOffsetVisible] = useState(false);
    const [selectedOffsetIndex, setSelectedOffsetIndex] = useState(null);
    const [selectedLanguageIndex, setSelectedLanguageIndex] = useState(null);
    const [languageVisible, setLanguageVisible] = useState(false);
    const [offset] = useState(GLOBAL.Minutes);
    const [languages, setLanguages] = useState([]);
    const [toggleQuality, setToggleQuality] = useState(
        GLOBAL.Video_Quality_Setting == 'HIGH' ? false : true,
    );
    const [toggleClock, setToggleClock] = useState(
        GLOBAL.Clock_Type == 'AM/PM' ? false : true,
    );
    const [quality, setQuality] = useState(
        LANG.getTranslation(GLOBAL.Video_Quality_Setting),
    );
    const [clock, setClock] = useState(GLOBAL.Clock_Type);
    const [devices, setDevices] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [progress, setProgress] = useState('');

    useEffect(() => {
        return () =>
            sendPageReport('Settigns', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        var langs = GLOBAL.Settings_Services_Login.languages.filter(
            l => l.language != null,
        );
        setLanguages(langs);

        if (Platform.OS == 'android') {
            var updates = sortUpdates();
            setUpdates(updates);
        }
        (async () => {
            let res = await getDevices();
            if (res.success) {
                setDevices(res.devices);
            }
        })();
    }, []);

    useEffect(() => {
        const backAction = () => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 1,
                    routes: [{ name: 'Home' }],
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

    const TabNavigator = () =>
        Platform.OS == 'android' ? (
            <Navigator
                initialLayout={{ width: Dimensions.get('window').width }}
                tabBar={props => <TopTabBar {...props} />}>
                <Screen name="About" component={UsersScreen} />
                <Screen name="Settings" component={OrdersScreen} />
                <Screen name="Devices" component={DevicesScreen} />
                <Screen name="Updates" component={UpdateScreen} />
            </Navigator>
        ) : (
            <Navigator
                initialLayout={{ width: Dimensions.get('window').width }}
                tabBar={props => <TopTabBar_ {...props} />}>
                <Screen name="About" component={UsersScreen} />
                <Screen name="Settings" component={OrdersScreen} />
                <Screen name="Devices" component={DevicesScreen} />
            </Navigator>
        );
    const OnSelect = (index, state, navigation) => {
        setOffsetVisible(false);
        setLanguageVisible(false);
        navigation.navigate(state.routeNames[index]);
    };
    const LockIcon = props => (
        <Icon {...props} fill="#fff" name="lock-outline" />
    );
    const TopTabBar_ = ({ navigation, state }) => (
        <TabBar
            style={{
                backgroundColor: '#111',
                height: sizes.height * 0.1,
                margin: 0,
                padding: 0,
            }}
            selectedIndex={state.index}
            indicatorStyle={{ backgroundColor: '#999', height: 1 }}
            onSelect={index => OnSelect(index, state, navigation)}>
            <Tab title={LANG.getTranslation('about')} />
            <Tab title={LANG.getTranslation('settings')} />
            <Tab title={LANG.getTranslation('devices')} />
        </TabBar>
    );
    const TopTabBar = ({ navigation, state }) => (
        <TabBar
            style={{
                backgroundColor: '#111',
                height: sizes.height * 0.1,
                margin: 0,
                padding: 0,
            }}
            selectedIndex={state.index}
            indicatorStyle={{ backgroundColor: '#999', height: 1 }}
            onSelect={index => OnSelect(index, state, navigation)}>
            <Tab title={LANG.getTranslation('about')} />
            <Tab title={LANG.getTranslation('settings')} />
            <Tab title={LANG.getTranslation('devices')} />
            <Tab
                title={LANG.getTranslation('updates')}
                style={{
                    borderBottomColor: 'red',
                    borderBottomWidth:
                        GLOBAL.OTA_Update && Platform.OS == 'android' ? 2 : 0,
                }}
            />
        </TabBar>
    );
    const installOtaUpdate = item => {
        sendActionReport(
            'Instal OTA Update',
            'Settings',
            moment().unix(),
            item.version_number,
        );
        setShowInstallModal(true);
        var url = item.url;
        RNFetchBlob.config({
            fileCache: true,
            appendExt: 'apk',
        })
            .fetch('GET', url, {})
            .progress((received, total) => {
                //setProgress(Math.round(received / 1000) + 'Kb / ' + Math.round(total / 1000) + 'Kb');
            })
            .then(res => {
                setShowInstallModal(false);
                //android.actionViewIntent(res.path(), 'application/vnd.android.package-archive');
                ReactNativeAPK.installApp(res.path());
            });
    };
    const getUpdate = (item, index) => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    minHeight: 100,
                    borderBottomColor: 'red',
                    borderBottomWidth: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.60)',
                    margin: 5,
                }}>
                <Modal
                    visible={showInstallModal}
                    style={{
                        width: GLOBAL.Device_IsPortrait
                            ? sizes.width * 0.8
                            : sizes.width * 0.3,
                    }}
                    backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}>
                    <Card disabled={true}>
                        <Text h5 bold>
                            {LANG.getTranslation('downloading_installing')}
                        </Text>
                        <View style={{ margin: 20 }}>
                            <ActivityIndicator size={'large'} color={'white'} />
                        </View>
                    </Card>
                </Modal>
                <View style={{ flex: 6, flexDirection: 'row' }}>
                    <View
                        style={{
                            padding: 10,
                            flexDirection: 'column',
                            alignSelf: 'center',
                            justifyContent: 'center',
                        }}>
                        <Text numberOfLines={1}>{item.title}</Text>
                        <Text numberOfLines={1}>{item.version_number}</Text>
                        <Text numberOfLines={4} size={10}>
                            {item.description}
                        </Text>
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        padding: 10,
                        maxHeight: 75,
                        alignSelf: 'center',
                    }}>
                    <Button onPress={() => installOtaUpdate(item)}>
                        {LANG.getTranslation('installupdate')}
                    </Button>
                </View>
            </View>
        );
    };
    const sortUpdates = () => {
        var originalMessages = GLOBAL.OTA_Updates;
        originalMessages.sort((channel1, channel2) => {
            if (
                channel1.version_number
                    .toString()
                    .replace('V', '')
                    .toString()
                    .replace('.', '')
                    .toString()
                    .replace('.', '') >
                channel2.version_number
                    .toString()
                    .replace('V', '')
                    .toString()
                    .replace('.', '')
                    .toString()
                    .replace('.', '')
            )
                return -1;
            if (
                channel1.version_number
                    .toString()
                    .replace('V', '')
                    .toString()
                    .replace('.', '')
                    .toString()
                    .replace('.', '') <
                channel2.version_number
                    .toString()
                    .replace('V', '')
                    .toString()
                    .replace('.', '')
                    .toString()
                    .replace('.', '')
            )
                return 1;
            return 0;
        });
        return originalMessages;
    };
    const UpdateScreen = () => {
        return (
            <Layout style={{ flex: 1 }}>
                <Block
                    flex={1}
                    width={sizes.width}
                    align="center"
                    justify="center"
                    color={'transparent'}>
                    <View
                        style={{
                            flex: 8,
                            marginHorizontal: 5,
                            padding: 10,
                            paddingBottom: 20,
                        }}>
                        <View
                            style={{
                                borderRadius: 5,
                                height: 100,
                                width: sizes.width * 0.97,
                                padding: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                flexDirection: 'column',
                            }}>
                            <Text h5>
                                {LANG.getTranslation('updatecenter')}
                            </Text>
                            <Text numberOfLines={2}>
                                {LANG.getTranslation('thelatestupdatesfor')}
                            </Text>
                        </View>
                        {updates.length == 0 && Platform.OS == 'android' && (
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                }}>
                                <Text>
                                    {LANG.getTranslation('noupdatesavailable')}
                                </Text>
                            </View>
                        )}

                        <FlatList
                            ref={ref => {
                                this.flatListRef = ref;
                            }}
                            data={updates}
                            horizontal={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => {
                                return getUpdate(item, index);
                            }}
                        />
                    </View>
                </Block>
            </Layout>
        );
    };
    const UsersScreen = () => (
        <Layout style={{ flex: 1 }}>
            <Block
                flex={1}
                width={sizes.width}
                align="center"
                justify="center"
                color={'transparent'}>
                <View style={{ flex: 1, marginVertical: 4, width: sizes.width }}>
                    <View
                        style={{
                            flex: 8,
                            margin: 5,
                            paddingLeft: 10,
                            paddingTop: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.33)',
                            paddingBottom: 20,
                            borderRadius: 5,
                        }}>
                        <Text bold>
                            {LANG.getTranslation('general_information')}:
                        </Text>
                        <Text>
                            {LANG.getTranslation('subscription')}:{' '}
                            {GLOBAL.User.products.productname}
                        </Text>
                        <Text>
                            {LANG.getTranslation('status')}:{' '}
                            {GLOBAL.User.account.account_status}
                        </Text>
                        <Text>
                            {LANG.getTranslation('expires')}:{' '}
                            {GLOBAL.User.account.date_expired}
                        </Text>
                        <Text>
                            {LANG.getTranslation('userid')}: {GLOBAL.UserID}
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 12,
                            margin: 5,
                            paddingLeft: 10,
                            paddingTop: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.33)',
                            paddingBottom: 20,
                            borderRadius: 5,
                        }}>
                        <Text bold>
                            {LANG.getTranslation('device_information')}:
                        </Text>
                        <Text>
                            {LANG.getTranslation('model')}:{' '}
                            {GLOBAL.Device_Model}
                        </Text>
                        <Text>
                            {LANG.getTranslation('unique_id')}:{' '}
                            {GLOBAL.Device_UniqueID}
                        </Text>
                        <Text>
                            {LANG.getTranslation('ip_address')}:{' '}
                            {GLOBAL.Device_IpAddress}
                        </Text>
                        <Text>
                            {LANG.getTranslation('form_factor')}:{' '}
                            {GLOBAL.Device_FormFactor}
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 8,
                            margin: 5,
                            paddingLeft: 10,
                            paddingTop: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.33)',
                            paddingBottom: 20,
                            borderRadius: 5,
                        }}>
                        <Text bold>
                            {LANG.getTranslation('app_information')}:
                        </Text>
                        <Text>
                            {LANG.getTranslation('app_version')}:{' '}
                            {GLOBAL.App_Version}
                        </Text>
                        <Text>
                            {LANG.getTranslation('package_id')}:{' '}
                            {GLOBAL.AppPackageID}
                        </Text>
                    </View>
                </View>
            </Block>
        </Layout>
    );
    const renderOffsetButon = () => (
        <Button onPress={() => setOffsetVisible(true)}>
            {selectedOffsetName}
        </Button>
    );
    const renderLanguageItem = (language, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={LANG.getLanguage(language.language)}
        />
    );
    const renderLanguageButon = () => (
        <Button onPress={() => setLanguageVisible(true)}>
            {selectedLanguageName}
        </Button>
    );
    const renderOffsetItem = (offset, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={offset.key}
        />
    );
    const onItemSelectOffset = index => {
        var value = offset[index.row].value;
        setOffsetVisible(false);
        GLOBAL.Catchup_DVR_Offset = value / 60;
        sendActionReport(
            'Change Recording Offset',
            'Settings',
            moment().unix(),
            GLOBAL.Catchup_DVR_Offset,
        );
        setSelectedOffsetName(
            GLOBAL.Catchup_DVR_Offset + ' ' + LANG.getTranslation('minutes'),
        );
        UTILS.storeProfile(
            'settings_offset',
            0,
            0,
            0,
            0,
            [],
            GLOBAL.Catchup_DVR_Offset,
        );
    };
    const onItemSelectLanguage = index => {
        var lang = languages[index.row].language;
        var language = LANG.getLanguage(lang);
        UTILS.storeJson('Selected_Language', language);
        sendActionReport(
            'Change Language',
            'Settings',
            moment().unix(),
            language,
        );
        setLanguageVisible(false);
        GLOBAL.Selected_Language = language;
        setSelectedLanguageName(GLOBAL.Selected_Language);
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Settings' }],
            }),
        );
    };
    const onToggleQuality = isChecked => {
        sendActionReport(
            'Toggle Quality',
            'Settings',
            moment().unix(),
            isChecked,
        );
        setToggleQuality(isChecked);
        if (GLOBAL.Video_Quality_Setting == 'HIGH') {
            GLOBAL.Video_Quality_Setting = 'LOW';
            UTILS.storeProfile('settings_video_quality', 0, 0, 0, 0, [], 'LOW');
            setQuality(LANG.getTranslation('LOW'));
        } else {
            GLOBAL.Video_Quality_Setting = 'HIGH';
            UTILS.storeProfile(
                'settings_video_quality',
                0,
                0,
                0,
                0,
                [],
                'HIGH',
            );
            setQuality(LANG.getTranslation('HIGH'));
        }
    };
    const onToggleClock = isChecked => {
        sendActionReport(
            'Toggle Clock',
            'Settings',
            moment().unix(),
            isChecked,
        );
        setToggleClock(isChecked);
        if (GLOBAL.Clock_Type == 'AM/PM') {
            GLOBAL.Clock_Type = '24h';
            GLOBAL.Clock_Setting = 'HH:mm';
            var clock = {
                Clock_Type: GLOBAL.Clock_Type,
                Clock_Setting: GLOBAL.Clock_Setting,
            };
            setClock('24h');
            UTILS.storeProfile('settings_clock', 0, 0, 0, 0, clock, 'value');
        } else {
            GLOBAL.Clock_Type = 'AM/PM';
            GLOBAL.Clock_Setting = 'hh:mm A';
            var clock = {
                Clock_Type: GLOBAL.Clock_Type,
                Clock_Setting: GLOBAL.Clock_Setting,
            };
            setClock('AM/PM');
            UTILS.storeProfile('settings_clock', 0, 0, 0, 0, clock, 'value');
        }
    };

    function OrdersScreen() {
        const [currentCode, setCurrentCode] = useState('');
        const [newCode, setNewCode] = useState('');
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');
        const onChangeParentalCode = () => {
            if (currentCode.toString() != GLOBAL.PIN.toString()) {
                setError(LANG.getTranslation('pincode_wrong'));
            } else {
                sendActionReport(
                    'Change Parental Code',
                    'Settings',
                    moment().unix(),
                    '',
                );
                GLOBAL.PIN = newCode + '';
                UTILS.storeProfile(
                    'settings_childlock',
                    0,
                    0,
                    0,
                    0,
                    [],
                    GLOBAL.PIN,
                );
                setSuccess(LANG.getTranslation('successchildlockchanged'));
                setError('');
            }
        };
        return (
            <Layout style={{ flex: 1 }}>
                <Block
                    flex={1}
                    width={sizes.width}
                    align="center"
                    color={'transparent'}>
                    <ScrollView>
                        <View
                            style={{
                                width: sizes.width * 0.97,
                                margin: 5,
                                paddingHorizontal: 10,
                                paddingTop: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.33)',
                                paddingBottom: 20,
                                borderRadius: 5,
                            }}>
                            <View
                                style={{ padding: 10, flexDirection: 'column' }}>
                                <Text h5>
                                    {LANG.getTranslation('change_offset')}
                                </Text>
                                <Text numberOfLines={2}>
                                    {LANG.getTranslation('change_offset_help')}
                                </Text>
                            </View>
                            <View
                                style={{
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.92
                                        : sizes.width * 0.3,
                                }}>
                                <OverflowMenu
                                    anchor={renderOffsetButon}
                                    visible={offsetVisible}
                                    selectedIndex={selectedOffsetIndex}
                                    fullWidth={true}
                                    style={{
                                        width: GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.92
                                            : sizes.width * 0.3,
                                        marginTop:
                                            GLOBAL.Device_Manufacturer ==
                                                'Apple' || GLOBAL.Device_IsWebTV
                                                ? 0
                                                : 20,
                                    }}
                                    onBackdropPress={() =>
                                        setOffsetVisible(false)
                                    }
                                    onSelect={onItemSelectOffset}>
                                    {offset.map(renderOffsetItem)}
                                </OverflowMenu>
                            </View>
                        </View>
                        <View
                            style={{
                                width: sizes.width * 0.97,
                                margin: 5,
                                paddingHorizontal: 10,
                                paddingTop: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.33)',
                                paddingBottom: 20,
                                borderRadius: 5,
                            }}>
                            <View
                                style={{ padding: 10, flexDirection: 'column' }}>
                                <Text h5>
                                    {LANG.getTranslation('changelanguage')}
                                </Text>
                                <Text numberOfLines={2}>
                                    {LANG.getTranslation('changetheuilanguage')}
                                </Text>
                            </View>
                            <View
                                style={{
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.92
                                        : sizes.width * 0.3,
                                }}>
                                <OverflowMenu
                                    anchor={renderLanguageButon}
                                    visible={languageVisible}
                                    selectedIndex={selectedLanguageIndex}
                                    fullWidth={true}
                                    style={{
                                        width: GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.92
                                            : sizes.width * 0.3,
                                        marginTop:
                                            GLOBAL.Device_Manufacturer ==
                                                'Apple' || GLOBAL.Device_IsWebTV
                                                ? 0
                                                : 20,
                                    }}
                                    onBackdropPress={() =>
                                        setLanguageVisible(false)
                                    }
                                    onSelect={onItemSelectLanguage}>
                                    {languages.map(renderLanguageItem)}
                                </OverflowMenu>
                            </View>
                        </View>
                        {/* <View style={{ alignItems: 'flex-start', width: sizes.width * 0.97, margin: 5, paddingLeft: 10, paddingTop: 10, backgroundColor: 'rgba(0, 0, 0, 0.33)', paddingBottom: 20, borderRadius: 5 }}>
                            <View style={{ padding: 10, flexDirection: 'column' }}>
                                <Text h5>{LANG.getTranslation("livetvvideoquality")}</Text>
                                <Text numberOfLines={2}>{LANG.getTranslation("chooseyourvideoqualitysetting")}</Text>
                            </View>
                            <Toggle status='control' style={{ paddingLeft: 10 }} checked={toggleQuality} onChange={onToggleQuality}>
                                {quality}
                            </Toggle>
                        </View> */}
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
                            }}>
                            <View
                                style={{ padding: 10, flexDirection: 'column' }}>
                                <Text h5>
                                    {LANG.getTranslation('changeclock')}
                                </Text>
                                <Text numberOfLines={2}>
                                    {LANG.getTranslation(
                                        'changetheclocksetting',
                                    )}
                                </Text>
                            </View>
                            <Toggle
                                status="control"
                                style={{ paddingLeft: 10 }}
                                checked={toggleClock}
                                onChange={onToggleClock}>
                                {clock}
                            </Toggle>
                        </View>
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
                            }}>
                            <View
                                style={{ padding: 10, flexDirection: 'column' }}>
                                <Text h5>
                                    {LANG.getTranslation('changechildlock')}
                                </Text>
                                <Text numberOfLines={2}>
                                    {LANG.getTranslation(
                                        'entercurrentpinandnew',
                                    )}
                                </Text>
                            </View>
                            <View
                                style={{
                                    width: GLOBAL.Device_IsPortrait
                                        ? sizes.width * 0.92
                                        : sizes.width * 0.3,
                                }}>
                                <Input
                                    status="control"
                                    placeholder={LANG.getTranslation(
                                        'current_code',
                                    )}
                                    accessoryLeft={LockIcon}
                                    value={currentCode}
                                    onChangeText={setCurrentCode}
                                    onFocus={() => setError('')}
                                    maxLength={4}
                                    underlineColorAndroid="transparent"
                                    style={{
                                        margin: 5,
                                        backgroundColor: 'transparent',
                                    }}
                                />
                                <Input
                                    status="control"
                                    placeholder={LANG.getTranslation(
                                        'new_code',
                                    )}
                                    accessoryLeft={LockIcon}
                                    value={newCode}
                                    onChangeText={setNewCode}
                                    onFocus={() => setError('')}
                                    maxLength={4}
                                    underlineColorAndroid="transparent"
                                    style={{
                                        margin: 5,
                                        backgroundColor: 'transparent',
                                    }}
                                />

                                <View
                                    style={{
                                        width: GLOBAL.Device_IsPortrait
                                            ? sizes.width * 0.92
                                            : sizes.width * 0.3,
                                    }}>
                                    <Button
                                        style={{
                                            marginVertical: 4,
                                        }}
                                        size={'giant'}
                                        onPress={onChangeParentalCode}>
                                        {LANG.getTranslation('submit')}
                                    </Button>
                                </View>
                                <Text
                                    color={'red'}
                                    style={{
                                        color: 'red',
                                        paddingBottom: error != '' ? 10 : 0,
                                    }}
                                    bold>
                                    {error}
                                </Text>
                                <Text
                                    color={'green'}
                                    style={{
                                        color: 'green',
                                        paddingBottom: success != '' ? 10 : 0,
                                    }}
                                    bold>
                                    {success}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </Block>
            </Layout>
        );
    }
    const onDeleteDevice = item => {
        var devices_ = devices.filter(d => d.valid != item.valid);
        sendActionReport('Delete Device', 'Settings', moment().unix(), '');
        DAL.setDevices(
            GLOBAL.IMS + '.' + GLOBAL.CRM,
            GLOBAL.UserID + '.' + GLOBAL.Pass,
            devices_,
        ).then(result => {
            (async () => {
                let res = await getDevices();
                if (res.success) {
                    setDevices(res.devices);
                }
            })();
        });
    };
    const getDevice = (item, index) => {
        var isMobile =
            item.type.indexOf('Handheld') > -1 || item.type.indexOf('PWA') > -1;
        var isTablet = item.type.indexOf('Tablet') > -1;
        var isWeb = item.model.indexOf('WebTV') > -1;

        return (
            <View
                style={{
                    height: 100,
                    flex: 1,
                    flexDirection: 'row',
                    margin: 5,
                    backgroundColor: 'rgba(0, 0, 0, 0.60)',
                    borderRadius: 5,
                }}>
                <View
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        margin: 20,
                    }}>
                    {isMobile && (
                        <FontAwesome5
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={SolidIcons.mobileAlt}
                            name="mobile-alt"
                        />
                    )}
                    {isTablet && (
                        <FontAwesome5
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={SolidIcons.tabletAlt}
                            name="tablet-alt"
                        />
                    )}
                    {isWeb && (
                        <FontAwesome5
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={SolidIcons.laptop}
                            name="laptop"
                        />
                    )}
                    {!isMobile && !isTablet && !isWeb && (
                        <FontAwesome5
                            style={{ fontSize: 20, color: '#fff', padding: 10 }}
                            // icon={SolidIcons.tv}
                            name="tv"
                        />
                    )}
                </View>
                <View
                    style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        width: sizes.width * 0.4,
                    }}>
                    <Text bold numberOfLines={1}>
                        {item.model}
                    </Text>
                    <Text numberOfLines={1}>{item.uuid}</Text>
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        padding: 20,
                        justifyContent: 'flex-end',
                        alignSelf: 'center',
                    }}>
                    {/* {RenderIf(GLOBAL.Device_UniqueID != item.uuid && !GLOBAL.Device_IsPhone)(
                        <Button onPress={() => onDeleteDevice(item)}>{LANG.getTranslation("delete")}</Button>
                    )} */}
                    {RenderIf(GLOBAL.Device_UniqueID != item.uuid)(
                        <FocusButton
                            style={{
                                width: 50,
                                height: 50,
                                backgroundColor: '#222',
                                borderRadius: 5,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            onPress={() => onDeleteDevice(item)}>
                            <FontAwesome5
                                style={[{ fontSize: 14, color: '#fff' }]}
                                // icon={SolidIcons.trash}
                                name="trash"
                            />
                        </FocusButton>,
                    )}
                </View>
            </View>
        );
    };
    const getDevices = async () => {
        try {
            var path =
                'https://devices.tvms.io/getdevice?collection_key=' +
                GLOBAL.IMS +
                '.' +
                GLOBAL.CRM +
                '&document_key=' +
                UTILS.toAlphaNumeric(GLOBAL.UserID) +
                '.' +
                UTILS.toAlphaNumeric(GLOBAL.Pass);
            GLOBAL.show_log && console.log('get devices: ', path);
            let response = await fetch(path);
            let data = await response.json();
            GLOBAL.show_log && console.log('get devices response: ', data);
            if (data != undefined) {
                return { success: true, devices: data.devices };
            } else {
                return { success: false };
            }
        } catch (error) {
            return { success: false };
        }
    };

    const DevicesScreen = () => (
        <Layout style={{ flex: 1 }}>
            <Block
                flex={1}
                width={sizes.width}
                align="center"
                justify="center"
                color={'transparent'}>
                <View style={{ flex: 8, padding: 10, paddingBottom: 20 }}>
                    <View
                        style={{
                            borderRadius: 5,
                            height: 100,
                            marginBottom: 5,
                            marginHorizontal: 10,
                            padding: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.30)',
                            flexDirection: 'column',
                        }}>
                        <Text h5>
                            {LANG.getTranslation('connecteddevices')}
                        </Text>
                        <Text numberOfLines={2}>
                            {LANG.getTranslation('connectedtoyouraccount')}
                        </Text>
                    </View>
                    <FlatList
                        key={devices}
                        extraData={devices}
                        data={devices}
                        horizontal={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => {
                            return getDevice(item, index);
                        }}
                    />
                </View>
            </Block>
        </Layout>
    );

    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: 'transparent',
        },
        dark: true,
    };
    return (
        <View style={{ backgroundColor: '#111', flex: 1 }}>
            <ImageBackground
                source={{ uri: GLOBAL.Background }}
                style={{ flex: 1, width: null, height: null }}
                imageStyle={{ resizeMode: 'cover' }}>
                <NavigationContainer theme={MyTheme} independent={true}>
                    <TabNavigator />
                </NavigationContainer>
            </ImageBackground>
        </View>
    );
};
