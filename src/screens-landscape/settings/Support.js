import React, {Component} from 'react';
import {
    View,
    Text,
    ScrollView,
    Platform,
    BackHandler,
    TVMenuControl,
    TouchableHighlight,
} from 'react-native';
import {Actions} from 'react-native-router-flux';
import HTML from 'react-native-render-html';
import decode from 'unescape';
import {sendPageReport} from '../../reporting/reporting';

export default class Support extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};

        var desc = '';
        var pages = [];

        if (GLOBAL.SupportPages.length > 0) {
            desc = GLOBAL.SupportPages[0].description;
            pages = GLOBAL.SupportPages;
        }
        if (pages.find(f => f.description == 'back') == undefined) {
            var pageBack = {
                description: 'back',
                name: LANG.getTranslation('back'),
            };
            pages.push(pageBack);
        }
        this.state = {
            reportStartTime: moment().unix(),
            dislaimer: decode(desc),
            pageIndex: 0,
            pages: pages,
            clock: GLOBAL.Clock_Type,
        };
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
            Actions.Settings();
        }
    };
    updateDimensions() {
        Actions.Support();
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
                Actions.Settings();
                return true;
            },
        );
    }
    componentWillUnmount() {
        sendPageReport('Support', this.state.reportStartTime, moment().unix());
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
        Actions.Settings();
    }
    _setSupportPage(index) {
        if (GLOBAL.SupportPages[index].description == 'back') {
            Actions.Settings();
        } else {
            this.setState({
                dislaimer: GLOBAL.SupportPages[index].description,
                pageIndex: index,
            });
        }
    }
    render() {
        return (
            <Container
                needs_notch={true}
                // hide_header={true}
                hide_menu={true}
                hide_header={
                    GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                        ? true
                        : false
                }
            >
                {RenderIf(GLOBAL.Device_IsPhone == false)(
                    <View style={{flex: 1}}>
                        <View
                            style={{flex: 10, margin: 5, flexDirection: 'row'}}
                        >
                            <View
                                style={{
                                    borderRadius: 5,
                                    flexDirection: 'column',
                                    backgroundColor: 'rgba(0, 0, 0, 0.60)',
                                    width: GLOBAL.Device_Width / 4,
                                }}
                            >
                                <FlatList
                                    data={this.state.pages}
                                    horizontal={false}
                                    numColumns={1}
                                    scrollType="category"
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({item, index}) => (
                                        <View style={{margin: 5}}>
                                            <TouchableHighlightFocus
                                                BorderRadius={5}
                                                style={{borderRadius: 5}}
                                                underlayColor={
                                                    GLOBAL.Button_Color
                                                }
                                                onPress={() =>
                                                    this._setSupportPage(index)
                                                }
                                            >
                                                <View
                                                    style={{
                                                        padding: 15,
                                                        borderRadius: 5,
                                                        backgroundColor:
                                                            this.state
                                                                .pageIndex ==
                                                            index
                                                                ? GLOBAL.Selection_Color
                                                                : 'transparent',
                                                    }}
                                                >
                                                    <Text style={styles.Medium}>
                                                        {item.name}
                                                    </Text>
                                                </View>
                                            </TouchableHighlightFocus>
                                        </View>
                                    )}
                                />
                            </View>
                            <View style={{flex: 9}}>
                                <View
                                    style={{
                                        borderRadius: 5,
                                        flex: 8,
                                        marginHorizontal: 5,
                                        paddingLeft: 10,
                                        paddingTop: 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.40)',
                                        paddingBottom: 20,
                                    }}
                                >
                                    <HTML
                                        style={[{color: '#fff'}]}
                                        source={{html: this.state.dislaimer}}
                                        tagsStyles={{p: styles.Standard}}
                                        baseFontStyle={{
                                            color: '#fff',
                                            fontSize: 16,
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>,
                )}
            </Container>
        );
    }
}
