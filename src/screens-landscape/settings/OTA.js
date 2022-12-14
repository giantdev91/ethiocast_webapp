import React, {Component} from 'react';
import {View, Text, BackHandler, TVMenuControl, FlatList} from 'react-native';
import {Actions} from 'react-native-router-flux';
export default class Disclaimer extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        this.state = {
            clock: GLOBAL.Clock_Type,
            updates: this.sortUpdates(),
        };
    }
    sortUpdates() {
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
    }
    backButton = event => {
        if (event == undefined) {
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
        Actions.OTA();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
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
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        Actions.pop();
    }

    _setFocusOnFirst(index) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }
    getTimeSetting() {
        if (GLOBAL.Clock_Type == 'AM/PM') {
            this.setState({
                clock: 'AM/PM',
            });
        } else {
            this.setState({
                clock: '24h',
            });
        }
    }
    setTimeSetting() {
        if (GLOBAL.Clock_Type == 'AM/PM') {
            GLOBAL.Clock_Type = '24h';
            GLOBAL.Clock_Setting = 'HH:mm';
            var clock = {
                Clock_Type: GLOBAL.Clock_Type,
                Clock_Setting: GLOBAL.Clock_Setting,
            };
            UTILS.storeProfile('settings_clock', 0, 0, 0, 0, clock, 'value');

            this.setState({
                clock: '24h',
            });
        } else {
            GLOBAL.Clock_Type = 'AM/PM';
            GLOBAL.Clock_Setting = 'hh:mm A';
            var clock = {
                Clock_Type: GLOBAL.Clock_Type,
                Clock_Setting: GLOBAL.Clock_Setting,
            };
            UTILS.storeProfile('settings_clock', 0, 0, 0, 0, clock, 'value');

            this.setState({
                clock: 'AM/PM',
            });
        }
        Actions.OTA();
    }
    getUpdate(item, index) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    height: 100,
                    borderBottomColor: 'red',
                    borderBottomWidth: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.73)',
                    padding: 5,
                }}>
                <View
                    style={{
                        flex: 2,
                        flexDirection: 'row',
                        alignSelf: 'center',
                        justifyContent: 'center',
                    }}>
                    <Text numberOfLines={1} style={styles.recordings_text_}>
                        {item.version_number}
                    </Text>
                </View>
                <View style={{flex: 6, flexDirection: 'row'}}>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            alignSelf: 'center',
                            justifyContent: 'center',
                        }}>
                        <Text numberOfLines={1} style={styles.recordings_text_}>
                            {item.title}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[styles.recordings_text, {fontSize: 10}]}>
                            {item.description}
                        </Text>
                    </View>
                </View>
                <View style={{flex: 3, flexDirection: 'row'}}>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'center',
                        }}>
                        <ButtonAutoSize
                            Padding={0}
                            underlayColor={GLOBAL.Button_Color}
                            onPress={() => this._installUpdate(item)}
                            Text={LANG.getTranslation('installupdate')}
                        />
                    </View>
                </View>
            </View>
        );
    }
    _installUpdate(item) {
        this.setState({
            title: item.title,
            text: item.description,
            version: item.version_number,
            show_modal: true,
        });
        this._installAppUpdate(item);
    }
    _installAppUpdate(item) {
        var url = item.url;
        RNFetchBlob.config({
            fileCache: true,
            appendExt: 'apk',
        })
            .fetch('GET', url, {})
            .progress((received, total) => {
                this.setState({
                    loaderText: Math.round((received / total) * 100) + '%',
                });
            })
            .then(res => {
                this.setState({
                    show_modal: false,
                });
                //android.actionViewIntent(res.path(), 'application/vnd.android.package-archive');
                ReactNativeAPK.installApp(res.path());
            });
    }
    render() {
        return (
            <View style={{flex: 1}}>
                {RenderIf(this.state.show_modal == true)(
                    <Modal
                        Type={'Loader'}
                        Title={
                            LANG.getTranslation('downloading_installing') +
                            ' ' +
                            this.state.version
                        }
                        Centered={true}
                        Progress={this.state.loaderText}
                        ShowLoader={true}></Modal>,
                )}

                <View style={{flex: 1}}>
                    <View
                        style={{
                            borderRadius: 5,
                            flex: 8,
                            marginHorizontal: 5,
                            padding: 10,
                            backgroundColor: 'rgba(0, 0, 0, 0.33)',
                            paddingBottom: 20,
                        }}>
                        <View
                            style={{
                                borderRadius: 5,
                                marginBottom: 10,
                                height: 100,
                                padding: 10,
                                backgroundColor: 'rgba(0, 0, 0, 0.43)',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Text style={styles.H2}>
                                {LANG.getTranslation('updatecenter')}
                            </Text>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.Subtext,
                                    styles.Width_80_Percent,
                                    styles.CenterText,
                                ]}>
                                {LANG.getTranslation('thelatestupdatesfor')}
                            </Text>
                        </View>

                        <FlatList
                            data={this.state.updates}
                            horizontal={false}
                            keyExtractor={(item, index) =>
                                'category_' + index.toString()
                            }
                            renderItem={({item, index}) => {
                                return this.getUpdate(item, index);
                            }}
                        />
                    </View>
                </View>
            </View>
        );
    }
}
