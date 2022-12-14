import React, { Component } from 'react';
import {
    BackHandler,
    TVMenuControl,
    Text,
    View,
    TextInput,
    TouchableHighlight,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import DeviceInfo from 'react-native-device-info';
import moment from 'moment';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class MarketPlace extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };

        var columns = 6;
        var width = 0;
        var category_width = 0;
        if (GLOBAL.App_Theme == 'Akua') {
            width = GLOBAL.COL_6;
        }
        if (GLOBAL.App_Theme == 'Honua') {
            width = GLOBAL.COL_REMAINING_6 - 2;
        }
        if (GLOBAL.App_Theme == 'Iridium') {
            category_width = GLOBAL.COL_REMAINING_5;
            width =
                GLOBAL.COL_REMAINING_6 - GLOBAL.COL_REMAINING_6 / columns - 6;
        }
        if (GLOBAL.Device_IsPhone) {
            width = GLOBAL.COL_4;
            columns = 4;
        }

        this.state = {
            searchValue: '',
            reportStartTime: moment().unix(),
            category_width: category_width,
            apps_: GLOBAL.Apps,
            appSearch: GLOBAL.Apps,
            device_apps: GLOBAL.Device_Apps,
            categories: GLOBAL.App_Categories,
            cat_index: 0,
            popup_loader: false,
            progress: 0,
            downloaded: 0,
            size: 0,
            app: [],
            columns: columns,
            width: width,
            cat_index: 0,
        };
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (this.state.searchValue.length > 0) {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            GLOBAL.Focus = 'Home';
            Actions.Home();
        }
    };
    updateDimensions() {
        Actions.MarketPlace();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        DeviceInfo.getSystemApps().then(apps => {
            var installedAppsFiltered = [];
            apps.forEach(item => {
                if (
                    !item.packagename.startsWith('com.android') &&
                    !item.packagename.startsWith('com.nvidia') &&
                    !item.packagename.startsWith(
                        'com.google.android.webview',
                    ) &&
                    !item.packagename.startsWith('com.google.android.gsm') &&
                    !item.packagename.startsWith('com.google.android.tts') &&
                    !item.packagename.startsWith(
                        'com.google.android.inputmethod',
                    ) &&
                    !item.packagename.startsWith(
                        'com.google.android.tvrecommendations',
                    ) &&
                    !item.packagename.startsWith(
                        'com.google.android.tvlauncher',
                    ) &&
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
                    !item.packagename.startsWith(
                        'com.google.android.katniss',
                    ) &&
                    !item.packagename.startsWith(
                        'com.google.android.backdrop',
                    ) &&
                    !item.packagename.startsWith(
                        'com.google.android.marvin.talkback',
                    ) &&
                    !item.packagename.startsWith('com.google.android.angle') &&
                    !item.packagename.startsWith('com.google.android.tag') &&
                    !item.packagename.startsWith(
                        'org.chromium.webview_shell',
                    ) &&
                    !item.packagename.startsWith(
                        'com.google.android.apps.pixelmigrate',
                    ) &&
                    !item.packagename.startsWith(
                        'com.google.android.projection.gearhead',
                    ) &&
                    !item.packagename.startsWith(
                        'com.google.android.cellbroadcastreceiver',
                    ) &&
                    !item.packagename.startsWith(
                        'com.google.android.apps.restore',
                    )
                ) {
                    installedAppsFiltered.push(item);
                }
            });
            GLOBAL.Device_Apps = installedAppsFiltered;
            this.setState(
                {
                    device_apps: GLOBAL.Device_Apps,
                },
                () => {
                    this.getAppsMarketplace();
                },
            );
        });

        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                GLOBAL.Focus = 'Home';
                Actions.Home();
                return true;
            },
        );
    }

    componentWillUnmount() {
        sendPageReport('Apps', this.state.reportStartTime, moment().unix());
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }

    _onPressCategoryChange(index) {
        this.setState({
            apps_: GLOBAL.Apps_Categories[index].apps,
            appSearch: GLOBAL.Apps_Categories[index].apps,
            cat_index: index,
        });
    }

    getAppsMarketplace() {
        var path =
            GLOBAL.CDN_Prefix +
            '/' +
            GLOBAL.IMS +
            '/jsons/' +
            GLOBAL.CRM +
            '/' +
            GLOBAL.ProductID +
            '_product_apps_v2.json';
        DAL.getJson(path)
            .then(data => {
                var intalledAppsCat = {
                    id: 999,
                    name: LANG.getTranslation('installed'),
                    type: 'local',
                    apps: this.state.device_apps,
                };
                GLOBAL.Apps_Categories = data.appcategories;
                GLOBAL.Apps_Categories.splice(0, 0, intalledAppsCat);
                GLOBAL.Apps = GLOBAL.Apps_Categories[0].apps;
                this.setState({
                    apps_: GLOBAL.Apps,
                    appSearch: GLOBAL.Apps,
                    categories: GLOBAL.Apps_Categories,
                });
            })
            .catch(error => {
                var intalledAppsCat = {
                    id: 999,
                    name: LANG.getTranslation('installed'),
                    type: 'local',
                    apps: this.state.device_apps,
                };
                GLOBAL.Apps_Categories.splice(0, 0, intalledAppsCat);
                GLOBAL.Apps = GLOBAL.Apps_Categories[this.state.cat_index].apps;
                this.setState({
                    apps_: GLOBAL.Apps,
                    appSearch: GLOBAL.Apps,
                    categories: GLOBAL.Apps_Categories,
                });
            });
    }
    _onPressAppAction(item, index) {
        var index_ = this.state.appSearch.findIndex(a => a.name == item.name);
        GLOBAL.Apps_Selected_Index = index_;
        if (this.state.cat_index == 0) {
            REPORT.set({
                type: 20,
                name: item.name,
            });
            ReactNativeAPK.runApp(item.packagename);
        } else {
            DeviceInfo.getAppInstalled(item.package_name).then(installed => {
                if (installed == true) {
                    ReactNativeAPK.runApp(item.packagename);
                } else {
                    this.setState({
                        popup_loader: true,
                        app: item,
                    });
                    var url = item.url;
                    RNFetchBlob.config({
                        fileCache: true,
                        appendExt: 'apk',
                    })
                        .fetch('GET', url, {})
                        .progress((received, total) => {
                            this.setState({
                                progress:
                                    Math.round(received / 1000) +
                                    'Kb / ' +
                                    Math.round(total / 1000) +
                                    'Kb',
                            });
                        })
                        .then(res => {
                            this.setState({
                                popup_loader: false,
                            });
                            //android.actionViewIntent(res.path(), 'application/vnd.android.package-archive');
                            ReactNativeAPK.installApp(res.path());
                        });
                }
            });
        }
    }
    onChangeText = text => {
        if (text != undefined && text != null && text != '') {
            GLOBAL.Apps_Selected_Index = 999999;
            var appsNew = [];
            if (this.state.appSearch[0].name != undefined) {
                appsNew = this.state.appSearch.filter(
                    c => c.name.toLowerCase().indexOf(text.toLowerCase()) > -1,
                );
            }
            if (this.state.appSearch[0].appname != undefined) {
                appsNew = this.state.appSearch.filter(
                    c =>
                        c.appname.toLowerCase().indexOf(text.toLowerCase()) >
                        -1,
                );
            }
            this.setState({
                apps_: appsNew,
                searchValue: text,
            });
        }
    };
    render() {
        if (this.state.apps_.length == 0) {
            return (
                <Container
                    hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                    hide_menu={
                        GLOBAL.App_Theme == 'Akua' &&
                            !GLOBAL.Device_IsTablet &&
                            !GLOBAL.Device_IsPhone
                            ? true
                            : false
                    }
                >
                    <View
                        style={{
                            flex: 35,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Loader size={'large'} color={'#e0e0e0'} />
                    </View>
                </Container>
            );
        }

        return (
            <Container
                hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                hide_menu={
                    GLOBAL.App_Theme == 'Akua' &&
                        !GLOBAL.Device_IsTablet &&
                        !GLOBAL.Device_IsPhone &&
                        !GLOBAL.Device_IsWebTV &&
                        GLOBAL.Device_IsSmartTV
                        ? true
                        : false
                }
            >
                {RenderIf(
                    GLOBAL.App_Theme != 'Iridium' ||
                    GLOBAL.Device_IsPhone == true,
                )(
                    <View style={{ flex: 1 }}>
                        <View
                            style={{
                                flex: 5,
                                marginTop: GLOBAL.App_Theme == 'Honua' ? 4 : 0,
                                marginLeft:
                                    GLOBAL.App_Theme == 'Honua' &&
                                        !GLOBAL.Device_IsPhone
                                        ? 5
                                        : 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.83)',
                                flexDirection: 'column',
                            }}
                        >
                            <FlatList
                                data={this.state.categories}
                                horizontal={true}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <TouchableHighlightFocus
                                        style={{
                                            borderRadius: 5,
                                            margin: 2,
                                            marginBottom: 3,
                                        }}
                                        key={index}
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() =>
                                            this._onPressCategoryChange(index)
                                        }
                                    >
                                        <View
                                            style={[styles.menu_vertical_text]}
                                        >
                                            <Text
                                                style={[
                                                    styles.H5,
                                                    {
                                                        marginLeft: 10,
                                                        marginRight: 10,
                                                    },
                                                ]}
                                            >
                                                {item.name}
                                            </Text>
                                        </View>
                                    </TouchableHighlightFocus>
                                )}
                            />
                        </View>
                        <View
                            style={{
                                flex: 35,
                                paddingTop: 3,
                                marginLeft:
                                    GLOBAL.App_Theme == 'Honua' &&
                                        !GLOBAL.Device_IsPhone
                                        ? 5
                                        : 0,
                                flexDirection: 'column',
                                alignItems:
                                    GLOBAL.App_Theme == 'Honua' ||
                                        this.state.apps_.length < this.state.columns
                                        ? 'flex-start'
                                        : 'center',
                            }}
                        >
                            {!GLOBAL.Device_IsSmartTV && (
                                <View
                                    style={{
                                        width:
                                            GLOBAL.COL_REMAINING_1 -
                                            (GLOBAL.App_Theme == 'Honua'
                                                ? 5
                                                : 0),
                                        flexDirection: 'row',
                                        height: 65,
                                    }}
                                >
                                    <View
                                        style={{ flex: 1, flexDirection: 'row' }}
                                    >
                                        <TouchableHighlightFocus
                                            focusable={true}
                                            touchableGetPressRectOffset={50}
                                            Padding={0}
                                            Margin={0}
                                            BorderRadius={5}
                                            onPress={() => {
                                                this.onChangeText('');
                                                this.searchbar.clear();
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width:
                                                        GLOBAL.COL_REMAINING_10 -
                                                        5,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.20)',
                                                    flexDirection: 'row',
                                                    borderColor: '#222',
                                                    borderWidth: 3,
                                                    marginHorizontal: 0,
                                                    borderRadius: 5,
                                                    marginVertical: 0,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={[
                                                        styles.IconsMenuMedium,
                                                        {
                                                            color: '#fff',
                                                            margin: 12,
                                                        },
                                                    ]}
                                                    // icon={SolidIcons.trash}
                                                    name="trash"
                                                />
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>
                                    <View
                                        style={{ flex: 9, flexDirection: 'row' }}
                                    >
                                        <TouchableHighlightFocus
                                            Padding={0}
                                            Margin={0}
                                            BorderRadius={5}
                                            onPress={() =>
                                                this.searchbar.focus()
                                            }
                                        >
                                            <View
                                                style={{
                                                    padding:
                                                        GLOBAL.Device_IsWebTV
                                                            ? 9
                                                            : 0,
                                                    marginRight: 40,
                                                    alignItems: 'center',
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.20)',
                                                    flexDirection: 'row',
                                                    borderColor: '#222',
                                                    borderWidth: 3,
                                                    marginHorizontal: 0,
                                                    borderRadius: 5,
                                                    marginVertical: 0,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={[
                                                        styles.IconsMenuMedium,
                                                        {
                                                            color: '#fff',
                                                            paddingLeft: 10,
                                                        },
                                                    ]}
                                                    // icon={SolidIcons.search}
                                                    name="search"
                                                />
                                                <TextInput
                                                    onChangeText={text =>
                                                        this.onChangeText(text)
                                                    }
                                                    ref={searchbar =>
                                                    (this.searchbar =
                                                        searchbar)
                                                    }
                                                    selectionColor={'#000'}
                                                    placeholderTextColor={
                                                        '#fff'
                                                    }
                                                    underlineColorAndroid={
                                                        'transparent'
                                                    }
                                                    placeholder={LANG.getTranslation(
                                                        'filter',
                                                    )}
                                                    //style={[styles.H2, { width: GLOBAL.COL_REMAINING_1 - (GLOBAL.App_Theme == 'Honua' ? 165 : GLOBAL.Device_IsAppleTV ? 280 : 150), color: '#fff', marginHorizontal: 10, height: GLOBAL.Device_IsAppleTV ? 50 : null }]}>
                                                    style={[
                                                        styles.H2,
                                                        { width: '100%' },
                                                    ]}
                                                ></TextInput>
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>
                                </View>
                            )}
                            <AppList
                                FromPage={'Home'}
                                Apps={this.state.apps_}
                                Width={this.state.width}
                                scrollType="channels"
                                Columns={this.state.columns}
                                //horizontal={true}
                                getItemLayout={(data, index) => {
                                    return {
                                        length: this.state.width,
                                        index,
                                        offset: this.state.width * index,
                                    };
                                }}
                                onPress={(app, index) =>
                                    this._onPressAppAction(app, index)
                                }
                            />
                        </View>
                        {RenderIf(this.state.popup_loader)(
                            <Modal
                                Type={'Loader'}
                                Title={LANG.getTranslation(
                                    'downloading_installing',
                                )}
                                Centered={true}
                                Progress={this.state.progress}
                                ShowLoader={true}
                            ></Modal>,
                        )}
                    </View>,
                )}
                {RenderIf(
                    GLOBAL.App_Theme == 'Iridium' &&
                    GLOBAL.Device_IsPhone == false,
                )(
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View
                            style={{
                                marginLeft: 5,
                                flexDirection: 'column',
                                backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                width: this.state.category_width,
                                borderTopLeftRadius: 5,
                                borderTopRightRadius: 5,
                            }}
                        >
                            <View style={{ alignItems: 'center' }}>
                                {/* <FontAwesome5 style={[styles.IconsMenuMedium, { color: '#666', paddingVertical: 5 }]} icon={SolidIcons.chevronUp} /> */}
                            </View>
                            <FlatList
                                data={this.state.categories}
                                horizontal={false}
                                numColumns={1}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => {
                                    if (index == this.state.cat_index) {
                                        return (
                                            <TouchableHighlightFocus
                                                BorderRadius={5}
                                                style={{
                                                    borderRadius: 5,
                                                    margin: 5,
                                                }}
                                                key={index}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                onPress={() =>
                                                    this._onPressCategoryChange(
                                                        index,
                                                    )
                                                }
                                            >
                                                <View style={{ padding: 5 }}>
                                                    <Text
                                                        style={[
                                                            styles.H5,
                                                            {
                                                                marginLeft: 10,
                                                                marginRight: 10,
                                                                borderBottomColor:
                                                                    GLOBAL.Button_Color,
                                                                borderBottomWidth: 3,
                                                            },
                                                        ]}
                                                    >
                                                        {item.name}
                                                    </Text>
                                                </View>
                                            </TouchableHighlightFocus>
                                        );
                                    } else {
                                        return (
                                            <TouchableHighlightFocus
                                                BorderRadius={5}
                                                style={{
                                                    borderRadius: 5,
                                                    margin: 5,
                                                }}
                                                key={index}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                onPress={() =>
                                                    this._onPressCategoryChange(
                                                        index,
                                                    )
                                                }
                                            >
                                                <View style={{ padding: 5 }}>
                                                    <Text
                                                        style={[
                                                            styles.H5,
                                                            {
                                                                marginLeft: 10,
                                                                marginRight: 10,
                                                            },
                                                        ]}
                                                    >
                                                        {item.name}
                                                    </Text>
                                                </View>
                                            </TouchableHighlightFocus>
                                        );
                                    }
                                }}
                            />
                            <View style={{ alignItems: 'center' }}>
                                {/* <FontAwesome5 style={[styles.IconsMenuMedium, { color: '#666', paddingVertical: 5 }]} icon={SolidIcons.chevronDown} /> */}
                            </View>
                        </View>
                        <View
                            style={{
                                flex: 35,
                                flexDirection: 'column',
                                alignItems:
                                    GLOBAL.App_Theme == 'Honua' ||
                                        this.state.apps_.length < this.state.columns
                                        ? 'flex-start'
                                        : 'center',
                            }}
                        >
                            {!GLOBAL.Device_IsSmartTV && (
                                <View
                                    style={{
                                        width:
                                            GLOBAL.COL_REMAINING_1 -
                                            GLOBAL.COL_REMAINING_5 -
                                            10,
                                        flexDirection: 'row',
                                        height: 65,
                                    }}
                                >
                                    <View
                                        style={{ flex: 1, flexDirection: 'row' }}
                                    >
                                        <TouchableHighlightFocus
                                            focusable={true}
                                            touchableGetPressRectOffset={50}
                                            Padding={0}
                                            Margin={0}
                                            BorderRadius={5}
                                            onPress={() => {
                                                this.onChangeText('');
                                                this.searchbar.clear();
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width:
                                                        GLOBAL.COL_REMAINING_10 -
                                                        25,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.20)',
                                                    flexDirection: 'row',
                                                    borderColor: '#222',
                                                    borderWidth: 3,
                                                    marginHorizontal: 0,
                                                    borderRadius: 5,
                                                    marginVertical: 0,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={[
                                                        styles.IconsMenuMedium,
                                                        {
                                                            color: '#fff',
                                                            margin: 12,
                                                        },
                                                    ]}
                                                    // icon={SolidIcons.trash}
                                                    name="trash"
                                                />
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>
                                    <View
                                        style={{ flex: 9, flexDirection: 'row' }}
                                    >
                                        <TouchableHighlightFocus
                                            Padding={0}
                                            Margin={0}
                                            BorderRadius={5}
                                            onPress={() =>
                                                this.searchbar.focus()
                                            }
                                        >
                                            <View
                                                style={{
                                                    padding:
                                                        GLOBAL.Device_IsWebTV
                                                            ? 9
                                                            : 0,
                                                    marginRight: 40,
                                                    alignItems: 'center',
                                                    backgroundColor:
                                                        'rgba(0, 0, 0, 0.20)',
                                                    flexDirection: 'row',
                                                    borderColor: '#222',
                                                    borderWidth: 3,
                                                    marginHorizontal: 0,
                                                    borderRadius: 5,
                                                    marginVertical: 0,
                                                }}
                                            >
                                                <FontAwesome5
                                                    style={[
                                                        styles.IconsMenuMedium,
                                                        {
                                                            color: '#fff',
                                                            paddingLeft: 10,
                                                        },
                                                    ]}
                                                    // icon={SolidIcons.search}
                                                    name="search"
                                                />
                                                <TextInput
                                                    onChangeText={text =>
                                                        this.onChangeText(text)
                                                    }
                                                    ref={searchbar =>
                                                    (this.searchbar =
                                                        searchbar)
                                                    }
                                                    selectionColor={'#000'}
                                                    placeholderTextColor={
                                                        '#fff'
                                                    }
                                                    underlineColorAndroid={
                                                        'transparent'
                                                    }
                                                    placeholder={LANG.getTranslation(
                                                        'filter',
                                                    )}
                                                    //style={[styles.H2, { width: GLOBAL.COL_REMAINING_1 - (GLOBAL.App_Theme == 'Honua' ? 165 : GLOBAL.Device_IsAppleTV ? 280 : 150), color: '#fff', marginHorizontal: 10, height: GLOBAL.Device_IsAppleTV ? 50 : null }]}>
                                                    style={[
                                                        styles.H2,
                                                        { width: '100%' },
                                                    ]}
                                                ></TextInput>
                                            </View>
                                        </TouchableHighlightFocus>
                                    </View>
                                </View>
                            )}
                            <AppList
                                FromPage={'Home'}
                                Apps={this.state.apps_}
                                Width={this.state.width}
                                scrollType="channels"
                                //horizontal={true}
                                Columns={this.state.columns}
                                getItemLayout={(data, index) => {
                                    return {
                                        length: this.state.width,
                                        index,
                                        offset: this.state.width * index,
                                    };
                                }}
                                onPress={app => this._onPressAppAction(app)}
                            />
                        </View>
                    </View>,
                )}
            </Container>
        );
    }
    _setFocusOnFirst(index, item) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
}
