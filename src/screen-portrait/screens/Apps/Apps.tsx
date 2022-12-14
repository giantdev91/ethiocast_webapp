import React, { ReactElement, useState, useEffect } from 'react';
import {
    View,
    Image,
    ImageBackground,
    TouchableOpacity,
    BackHandler,
    TVMenuControl,
    ActivityIndicator,
} from 'react-native';
import { Block, Text } from '../../components';
import { LinearGradient } from 'expo-linear-gradient';
import {
    OverflowMenu,
    MenuItem,
    Button,
    Icon,
    Input,
    Card,
    Modal,
} from '@ui-kitten/components';
import SIZES from '../../constants/sizes';
import Voice from '@react-native-voice/voice';
import * as Animatable from 'react-native-animatable';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {
    sendPageReport,
    sendActionReport,
    sendSearchReport,
} from '../../../reporting/reporting';
import TimerMixin from 'react-timer-mixin';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default ({ navigation }): React.ReactElement => {
    var store_search_timer;
    const [reportStartTime, setReportStartTime] = useState(moment().unix());
    const [apps, setApps] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [appsSearch, setAppsSearch] = useState([]);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [progress, setProgress] = useState('');
    const [columns, setColumns] = useState(GLOBAL.Device_IsPortrait ? 3 : 9);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [categoryVisible, setCategoryVisible] = useState(false);
    const [categories, setCategories] = useState(['']);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [showVoiceButton, setShowVoiceButton] = useState(false);
    const [showVoiceEnabled, setShowVoiceEnabled] = useState(false);
    const [extraSearchResults, setExtraSearchResults] = useState([]);

    const [app_name, setAppName] = useState('');

    var sizes = SIZES.getSizing();
    useEffect(() => {
        return () => sendPageReport('Apps', reportStartTime, moment().unix());
    }, []);
    useEffect(() => {
        if (GLOBAL.Apps.length == 0) {
            DeviceInfo.getSystemApps().then(apps => {
                var apps_ = normalizeApps(apps);
                (async () => {
                    let res = await getAppsMarketplace(apps_);
                    if (res.success) {
                        setLoaded(true);
                        setApps(res.data);
                        setAppsSearch(res.data);
                    }
                })();
            });
        } else {
            (async () => {
                let res = await getAppsMarketplace(GLOBAL.Apps);
                if (res.success) {
                    setLoaded(true);
                    setApps(res.data);
                    setAppsSearch(res.data);
                }
            })();
        }

        if (
            GLOBAL.Device_System == 'Apple' ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.onSpeechResults = onSpeechResultsHandler.bind(this);
        }
        if (
            GLOBAL.Device_System == 'Apple' ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.isAvailable().then(result => {
                setShowVoiceButton(true);
            });
        }
        return () => {
            TimerMixin.clearTimeout(store_search_timer);
            if (
                GLOBAL.Device_System == 'Apple' ||
                GLOBAL.Device_System == 'Android' ||
                GLOBAL.Device_System == 'Amazon'
            ) {
                Voice.destroy().then(Voice.removeAllListeners);
            }
        };
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
    const normalizeApps = apps => {
        var installedAppsFiltered = [];
        apps.forEach(item => {
            if (
                !item.packagename.startsWith('com.android') &&
                !item.packagename.startsWith('com.nvidia') &&
                !item.packagename.startsWith('com.google.android.webview') &&
                !item.packagename.startsWith('com.google.android.gsm') &&
                !item.packagename.startsWith('com.google.android.tts') &&
                !item.packagename.startsWith(
                    'com.google.android.inputmethod',
                ) &&
                !item.packagename.startsWith(
                    'com.google.android.tvrecommendations',
                ) &&
                !item.packagename.startsWith('com.google.android.tvlauncher') &&
                !item.packagename.startsWith('com.google.android.tv') &&
                !item.packagename.startsWith(
                    'com.google.android.syncadapters',
                ) &&
                !item.packagename.startsWith(
                    'com.google.android.apps.inputmethod.zhuyin',
                ) &&
                !item.packagename.startsWith('com.google.android.gms') &&
                !item.packagename.startsWith(
                    'com.google.android.apps.mediashell',
                ) &&
                !item.packagename.startsWith('com.google.android.katniss') &&
                !item.packagename.startsWith('com.google.android.backdrop') &&
                !item.packagename.startsWith(
                    'com.google.android.marvin.talkback',
                ) &&
                !item.packagename.startsWith('com.google.android.angle') &&
                !item.packagename.startsWith('com.google.android.tag') &&
                !item.packagename.startsWith('org.chromium.webview_shell') &&
                !item.packagename.startsWith(
                    'com.google.android.apps.pixelmigrate',
                ) &&
                !item.packagename.startsWith(
                    'com.google.android.projection.gearhead',
                ) &&
                !item.packagename.startsWith(
                    'com.google.android.cellbroadcastreceiver',
                ) &&
                !item.packagename.startsWith('com.google.android.apps.restore')
            ) {
                installedAppsFiltered.push(item);
            }
        });
        return installedAppsFiltered;
    };
    const onStartSpeech = async () => {
        if (showVoiceEnabled == false) {
            setShowVoiceEnabled(true);
            try {
                await Voice.start('en-US');
            } catch (e) {
                setShowVoiceEnabled(false);
                Voice.stop();
            }
        } else {
            setShowVoiceEnabled(false);
            Voice.stop();
        }
    };
    const onSpeechResultsHandler = e => {
        if (e.value != '') {
            try {
                var newInput = e.value;
                var splitInput = newInput.toString().split(',');
                var extraSearch = [];
                splitInput.forEach(element => {
                    var extra = {
                        name: element,
                    };
                    extraSearch.push(extra);
                });
                if (splitInput.length > 0) {
                    Voice.stop().then(() => {
                        sendActionReport(
                            'Search Voice',
                            'Apps',
                            moment().unix(),
                            splitInput[0],
                        );
                        setShowVoiceEnabled(false);
                        setSearchTerm(splitInput[0]);
                        setExtraSearchResults(extraSearch);
                        onSearchAlbums(splitInput[0]);
                    });
                }
            } catch (e) { }
        }
    };
    const onSearchExtra = searchTerm => {
        setSearchTerm(searchTerm);
        onSearchAlbums(searchTerm);
    };

    const getAppsMarketplace = async deviceApps => {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_product_apps_v2.json';
        try {
            console.log('get app marketplace: ', path);
            let response = await fetch(path);
            let data = await response.json();
            console.log('get app marketplace response: ', data);
            var intalledAppsCat = {
                id: 999,
                name: LANG.getTranslation('installed'),
                type: 'local',
                apps: deviceApps,
            };
            GLOBAL.Apps_Categories = data.appcategories;
            GLOBAL.Apps_Categories.splice(0, 0, intalledAppsCat);
            GLOBAL.Apps = GLOBAL.Apps_Categories[0].apps;

            setCategories(GLOBAL.Apps_Categories);
            setSelectedCategoryName(GLOBAL.Apps_Categories[0].name);
            setSelectedCategoryIndex({ row: 0, section: 0 });
            setCategoryIndex(0);
            return { success: true, data: GLOBAL.Apps };
        } catch (error) {
            var intalledAppsCat = {
                id: 999,
                name: LANG.getTranslation('installed'),
                type: 'local',
                apps: deviceApps,
            };
            GLOBAL.Apps_Categories.splice(0, 0, intalledAppsCat);
            GLOBAL.Apps = GLOBAL.Apps_Categories[selectedCategoryIndex].apps;
            setSelectedCategoryName(GLOBAL.Apps_Categories[0].name);
            setSelectedCategoryIndex({ row: 0, section: 0 });
            setCategories(GLOBAL.Apps_Categories);
            setCategoryIndex(0);
            return { success: true, data: GLOBAL.Apps };
        }
    };
    const renderExtra = ({ item }) => {
        return (
            <FocusButton
                style={{ backgroundColor: '#333', margin: 5, borderRadius: 100 }}
                onPress={() => onSearchExtra(item.name)}>
                <Text style={{ paddingHorizontal: 10, padding: 4 }}>
                    {item.name}
                </Text>
            </FocusButton>
        );
    };
    const onOpenApp = item => {
        if (categoryIndex == 0) {
            ReactNativeAPK.runApp(item.packagename);
        } else {
            DeviceInfo.getAppInstalled(item.package_name).then(installed => {
                if (installed == true) {
                    sendActionReport(
                        'Open App',
                        'Apps',
                        moment().unix(),
                        item.appname,
                    );
                    ReactNativeAPK.runApp(item.packagename);
                } else {
                    sendActionReport(
                        'Install App',
                        'Apps',
                        moment().unix(),
                        item.appname,
                    );
                    setAppName(item.appname);
                    setShowInstallModal(true);
                    var url = item.url;
                    RNFetchBlob.config({
                        fileCache: true,
                        appendExt: 'apk',
                    })
                        .fetch('GET', url, {})
                        .progress((received, total) => {
                            setProgress(
                                Math.round(received / 1000) +
                                'Kb / ' +
                                Math.round(total / 1000) +
                                'Kb',
                            );
                        })
                        .then(res => {
                            setShowInstallModal(false);
                            //android.actionViewIntent(res.path(), 'application/vnd.android.package-archive');
                            ReactNativeAPK.installApp(res.path());
                        });
                }
            });
        }
    };
    const renderApp = ({ item }) => {
        return (
            <FocusButton onPress={() => onOpenApp(item)}>
                <View
                    style={{
                        alignItems: 'center',
                        flexDirection: 'column',
                        margin: 5,
                        backgroundColor: 'rgba(0, 0, 0, 0.40)',
                        width: GLOBAL.Device_IsPortrait
                            ? sizes.width * 0.31
                            : sizes.width * 0.1,
                        alignSelf: 'center',
                        borderRadius: 5,
                        borderColor: '#222',
                        borderWidth: 3,
                    }}>
                    {RenderIf(
                        item.icon != undefined &&
                        item.url.indexOf('file://') == -1,
                    )(
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + item.icon }}
                            style={{
                                marginTop: 10,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.25
                                    : sizes.width * 0.08,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.25
                                    : sizes.width * 0.09,
                            }}></Image>,
                    )}
                    {RenderIf(
                        item.url != undefined &&
                        item.url.indexOf('file://') > -1,
                    )(
                        <Image
                            source={{ uri: item.url }}
                            style={{
                                marginTop: 10,
                                width: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.25
                                    : sizes.width * 0.08,
                                height: GLOBAL.Device_IsPortrait
                                    ? sizes.width * 0.25
                                    : sizes.width * 0.08,
                            }}></Image>,
                    )}
                    <View
                        style={{
                            width: GLOBAL.Device_IsPortrait
                                ? sizes.width * 0.3
                                : sizes.width * 0.09,
                        }}>
                        <Text
                            numberOfLines={1}
                            style={{
                                marginLeft: 10,
                                marginBottom: 10,
                                marginTop: 5,
                                marginRight: 10,
                            }}>
                            {item.appname}
                        </Text>
                    </View>
                </View>
            </FocusButton>
        );
    };
    const SearchIcon = props => (
        <Icon {...props} fill="#fff" name="search-outline" />
    );
    const onItemSelectCategory = index => {
        var id = categories[index.row].id;
        var category = GLOBAL.Apps_Categories.find(x => x.id == id);
        var apps = [];
        if (category != undefined) {
            if (category.apps.length > 0) {
                apps = category.apps;
            }
        }
        setSelectedCategoryName(category.name);
        setCategoryVisible(false);
        setCategoryIndex(index);
        setAppsSearch(apps);
        setApps(apps);
    };
    const renderCategoryButon = () => (
        <Button onPress={() => setCategoryVisible(true)}>
            {selectedCategoryName}
        </Button>
    );
    const renderCategoryItem = (category, index) => (
        <MenuItem
            style={{ backgroundColor: '#111' }}
            key={index}
            title={category.name}
        />
    );
    const onStartSearchTimer = searchTerm => {
        TimerMixin.clearTimeout(store_search_timer);
        store_search_timer = TimerMixin.setTimeout(() => {
            sendSearchReport(moment().unix(), searchTerm);
        }, 2000);
    };
    const onSearchAlbums = searchTerm => {
        var appSearch_ = appsSearch.filter(
            c => c.appname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1,
        );
        setSearchTerm(searchTerm);
        setApps(appSearch_);
    };
    const SpeechIcon = props => (
        <Icon {...props} fill="#fff" name="mic-outline" />
    );
    const onPressBack = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Home' }],
            }),
        );
    };
    return (
        <Block
            flex={1}
            width={sizes.width}
            align="center"
            justify="center"
            color={'transparent'}>
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
                    <Text center h5 paddingTop={20}>
                        {app_name}
                    </Text>
                    <Text center>{progress}</Text>
                </Card>
            </Modal>
            {showVoiceEnabled && (
                <View
                    style={{
                        borderRadius: 5,
                        backgroundColor: '#111',
                        position: 'absolute',
                        width: sizes.width * 0.3,
                        height: sizes.width * 0.3,
                        zIndex: 99999,
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        flex: 1,
                    }}>
                    <Animatable.View
                        animation="pulse"
                        easing="ease-in-out"
                        iterationCount="infinite">
                        <FontAwesome5
                            style={[
                                styles.Shadow,
                                {
                                    color: '#fff',
                                    fontSize: 50,
                                    padding: 0,
                                    margin: 0,
                                },
                            ]}
                            // icon={SolidIcons.microphone}
                            name="microphone"
                        />
                    </Animatable.View>
                </View>
            )}
            <View
                style={{
                    flexDirection: 'column',
                    width: sizes.width,
                    backgroundColor: '#111',
                    paddingTop: 10,
                }}>
                <View style={{ flexDirection: 'row' }}>
                    <View
                        style={{
                            paddingLeft: 10,
                            marginRight: 0,
                            borderRadius: 100,
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: 10,
                        }}>
                        <FocusButton
                            style={{ borderRadius: 100 }}
                            onPress={() => onPressBack()}>
                            <FontAwesome5
                                style={{ fontSize: 18, color: '#fff' }}
                                // icon={SolidIcons.arrowLeft}
                                name="arrow-left"
                            />
                        </FocusButton>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            borderColor: '#999',
                            borderWidth: 1,
                            borderRadius: 100,
                            marginHorizontal: 20,
                        }}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                width: sizes.width,
                                alignSelf: 'center',
                                paddingVertical: 5,
                                paddingLeft: 20,
                            }}>
                            <Input
                                status="basic"
                                style={{
                                    width: '100%',
                                    backgroundColor: 'transparent',
                                    paddingRight: showVoiceButton ? 0 : 20,
                                    borderColor: 'transparent',
                                }}
                                value={searchTerm}
                                placeholder={
                                    LANG.getTranslation('filter') + '...'
                                }
                                accessoryLeft={SearchIcon}
                                autoComplete={'off'}
                                underlineColorAndroid="transparent"
                                onChangeText={nextValue =>
                                    onSearchAlbums(nextValue)
                                }
                            />
                        </View>
                        <View style={{ alignSelf: 'center' }}>
                            {showVoiceButton && (
                                <Button
                                    style={{ borderRadius: 100 }}
                                    appearance="ghost"
                                    accessoryLeft={SpeechIcon}
                                    onPress={onStartSpeech}
                                />
                            )}
                        </View>
                    </View>
                </View>
                <View style={{ marginLeft: 10 }}>
                    <FlatList
                        key={extraSearchResults}
                        extraData={extraSearchResults}
                        data={extraSearchResults}
                        horizontal={true}
                        removeClippedSubviews={true}
                        keyExtractor={(item, index) => index.toString()}
                        onScrollToIndexFailed={() => { }}
                        renderItem={renderExtra}
                    />
                </View>
            </View>
            {loaded && (
                <View
                    style={{
                        flexDirection: 'row',
                        width: sizes.width,
                        backgroundColor: '#111',
                    }}>
                    <View
                        style={{
                            flex: 1,
                            paddingHorizontal: 5,
                            paddingVertical: 10,
                            paddingTop: 20,
                        }}>
                        <OverflowMenu
                            anchor={renderCategoryButon}
                            visible={categoryVisible}
                            selectedIndex={selectedCategoryIndex}
                            fullWidth={true}
                            style={{
                                width: sizes.width * 0.97,
                                marginTop:
                                    GLOBAL.Device_Manufacturer == 'Apple'
                                        ? 0
                                        : 30,
                            }}
                            onBackdropPress={() => setCategoryVisible(false)}
                            onSelect={onItemSelectCategory}>
                            {categories.map(renderCategoryItem)}
                        </OverflowMenu>
                    </View>
                </View>
            )}
            <View style={{ flex: 1, flexDirection: 'row', width: sizes.width }}>
                <LinearGradient
                    colors={['#111', 'rgba(0, 0, 0, 0.0)']}
                    style={{ flex: 1, width: sizes.width, height: '100%' }}
                    start={{ x: 0.5, y: 0 }}>
                    <View style={{}}>
                        <FlatList
                            key={searchTerm}
                            extraData={searchTerm}
                            data={apps}
                            numColumns={columns}
                            horizontal={false}
                            removeClippedSubviews={true}
                            keyExtractor={(item, index) => index.toString()}
                            onScrollToIndexFailed={() => { }}
                            contentContainerStyle={{
                                flexGrow: 1,
                                justifyContent: 'center',
                            }}
                            columnWrapperStyle={{
                                flex: 1,
                                justifyContent: 'space-evenly',
                            }}
                            renderItem={renderApp}
                        />
                    </View>
                    {!loaded && (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}>
                            <ActivityIndicator
                                size={'large'}
                                color={'#fff'}></ActivityIndicator>
                        </View>
                    )}
                </LinearGradient>
            </View>
        </Block>
    );
};
