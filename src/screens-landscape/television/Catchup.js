import React, { Component } from 'react';
import { View, Image, Text, BackHandler, TVMenuControl } from 'react-native';
//import moment from "moment";
import { Actions } from 'react-native-router-flux';
import { sendPageReport } from '../../reporting/reporting';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Catchup extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };

        this.state = {
            reportStartTime: moment().unix(),
            channels: [],
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
            Actions.Home();
        }
    };
    updateDimensions() {
        Actions.Catchup();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        REPORT.set({ type: 7 });
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

        var channels = UTILS.getCatchupChannels();
        this.setState({
            channels: channels,
        });
    }

    componentWillUnmount() {
        sendPageReport(
            'CatchupTV',
            this.state.reportStartTime,
            moment().unix(),
        );
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
    getTimeHuman(ut_time) {
        return moment.unix(ut_time).format(GLOBAL.Clock_Setting);
    }
    renderColumn(item_) {
        var epg = GLOBAL.EPG.find(e => e.id == item_.channel_id);
        if (epg != undefined) {
            epg = epg.epgdata;
            var epgIn = epg.filter(e => e.e < moment().unix());
            var channel = item_;
            return (
                <View style={{ flex: 1, width: GLOBAL.COL_3 }}>
                    <View
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            borderRadius: 5,
                            margin: 2,
                        }}
                    >
                        <View
                            style={{
                                flex: 3,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingLeft: 10,
                            }}
                        >
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item_.icon }}
                                style={[
                                    styles.player_channel_icon,
                                    { padding: 5 },
                                ]}
                            />
                        </View>
                        <View
                            style={{
                                flex: 6,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                paddingRight: 20,
                            }}
                        >
                            <Text numberOfLines={1} style={styles.H4}>
                                {item_.name}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flex: 9, flexDirection: 'row' }}>
                        <FlatList
                            data={epgIn}
                            scrollType=""
                            horizontal={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) =>
                                this.renderRow(item, index, channel)
                            }
                        />
                    </View>
                </View>
            );
        } else {
            return null;
        }
    }
    renderColumn__(item_) {
        var epg = GLOBAL.EPG.find(e => e.id == item_.channel_id);
        if (epg != undefined) {
            epg = epg.epgdata;
            var epgIn = epg.filter(e => e.e < moment().unix());
            var channel = item_;
            return (
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            backgroundColor: 'rgba(0, 0, 0, 0.80)',
                            borderRadius: 5,
                        }}
                    >
                        <View
                            style={{
                                flex: 3,
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: 10,
                            }}
                        >
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item_.icon }}
                                style={[
                                    styles.player_button_icon_small,
                                    { padding: 5 },
                                ]}
                            />
                            <Text
                                numberOfLines={1}
                                style={[styles.H4, { paddingLeft: 10 }]}
                            >
                                {item_.name}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            flex: 9,
                            flexDirection: 'row',
                            marginVertical: 10,
                        }}
                    >
                        <FlatList
                            data={epgIn}
                            scrollType=""
                            horizontal={true}
                            Width={GLOBAL.Device_Width / 3}
                            keyExtractor={(item, index) => index.toString()}
                            getItemLayout={(data, index) => {
                                return {
                                    length: GLOBAL.COL_3,
                                    index,
                                    offset: GLOBAL.COL_3 * index,
                                };
                            }}
                            renderItem={({ item, index }) =>
                                this.renderRow__(item, index, channel)
                            }
                        />
                    </View>
                </View>
            );
        } else {
            return null;
        }
    }
    renderRow__(item, index, channel) {
        var fromtotime =
            this.getTimeHuman(item.s) + ' - ' + this.getTimeHuman(item.e);
        var channelId = channel.channel_id;
        var date = this.getDateTimeHuman(item.s);
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onItemPress(item, channelId, index)}
                hasTVPreferredFocus={this._setFocusOnFirst(index)}
                isTVSelectable={true}
            >
                <View
                    style={{
                        borderRadius: 3,
                        flex: 1,
                        flexDirection: 'column',
                        padding: 20,
                        backgroundColor: 'rgba(0, 0, 0, 0.90)',
                        width: GLOBAL.Device_Width / 3,
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={[styles.DateTimeWhite, { marginBottom: 10 }]}
                    >
                        {date}
                    </Text>
                    <Text numberOfLines={1} style={[styles.H4, {}]}>
                        {item.n}
                    </Text>
                    <Text numberOfLines={1} style={styles.Date}>
                        {fromtotime}
                    </Text>
                    <Text numberOfLines={3} style={styles.Standard}>
                        {item.d}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
    getDateTimeHuman(ut_time) {
        return moment.unix(ut_time).format('MMMM Do YYYY');
    }
    getCurrentImage = (url, start) => {
        var splitUrl = url.toString().split('/');
        var timePart = moment.unix(start).format('/YYYY/MM/DD/hh/mm/ss');
        // var image = splitUrl[0] + "//" + splitUrl[2] + "/" + splitUrl[3] + timePart + "-preview.jpg";
        var image =
            splitUrl[0] +
            '//' +
            splitUrl[2] +
            '/' +
            splitUrl[3] +
            '/' +
            start +
            '-preview.jpg';
        return image;
    };
    renderRow(item, index, channel) {
        var fromtotime =
            this.getTimeHuman(item.s) + ' - ' + this.getTimeHuman(item.e);
        var channelId = channel.channel_id;
        var date = this.getDateTimeHuman(item.s);
        var parentalControl = false;
        var startTime = item.s;
        if (channel.childlock == 1) {
            parentalControl = true;
        }
        // var image = '';
        //if (item.i == null) {
        var image = this.getCurrentImage(channel.url_high, startTime);
        /// } else {
        //  image = item.i;
        //}

        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onItemPress(item, channelId, index)}
                hasTVPreferredFocus={this._setFocusOnFirst(index)}
                isTVSelectable={true}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        padding: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.60)',
                        margin: 0,
                        borderRadius: 5,
                    }}
                >
                    <Text numberOfLines={1} style={[styles.DateTimeWhite, {}]}>
                        {date}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[styles.Standard, { marginBottom: 10 }]}
                    >
                        {item.n}
                    </Text>
                    <View
                        style={{
                            height: ((GLOBAL.COL_3 - 24) / 16) * 9,
                            backgroundColor: '#000',
                            borderRadius: 2,
                            marginBottom: 10,
                        }}
                    >
                        {!parentalControl && (
                            <Image
                                source={{ uri: image }}
                                style={{
                                    borderRadius: 2,
                                    width: GLOBAL.COL_3 - 28,
                                    height: ((GLOBAL.COL_3 - 24) / 16) * 9,
                                    marginBottom: 10,
                                }}
                            ></Image>
                        )}
                        <View
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                flex: 1,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                zIndex: 99999,
                                height: '100%',
                                width: '100%',
                            }}
                        >
                            <FontAwesome5
                                style={{
                                    color: '#fff',
                                    fontSize: 35,
                                    opacity: 0.8,
                                    marginBottom: 0,
                                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: { width: -1, height: 1 },
                                    textShadowRadius: 10,
                                }}
                                // icon={RegularIcons.playCircle}
                                name="play-circle"
                            />
                        </View>
                    </View>
                    <Text numberOfLines={1} style={styles.Date}>
                        {fromtotime}
                    </Text>
                    <Text numberOfLines={6} style={styles.Medium}>
                        {item.d}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
    renderColumn_(item, index, channel) {
        var fromtotime =
            this.getTimeHuman(item.s) + ' - ' + this.getTimeHuman(item.e);
        var channelId = channel.channel_id;
        var date = this.getDateTimeHuman(item.s);
        return (
            <TouchableHighlightFocus
                key={index}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onItemPress(item, channelId, index)}
                hasTVPreferredFocus={this._setFocusOnFirst(index)}
                isTVSelectable={true}
            >
                <View
                    style={{
                        flex: 1,
                        width: 240,
                        flexDirection: 'column',
                        borderColor: '#111',
                        borderWidth: 2,
                        padding: 15,
                        backgroundColor: '#111',
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={[styles.DateTimeWhite, { marginBottom: 10 }]}
                    >
                        {date}
                    </Text>
                    <Text numberOfLines={1} style={[styles.Date, {}]}>
                        {fromtotime}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[styles.H5, { marginBottom: 5 }]}
                    >
                        {item.n}
                    </Text>
                    <Text
                        numberOfLines={6}
                        style={[styles.Medium, { paddingBottom: 10 }]}
                    >
                        {item.d}
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
    renderRow_(item_) {
        var epg = GLOBAL.EPG.find(e => e.id == item_.channel_id);
        if (epg != undefined) {
            epg = epg.epgdata;
            var epgIn = epg.filter(e => e.e < moment().unix());
            var channel = item_;
            return (
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            flex: 2,
                            flexDirection: 'row',
                            backgroundColor: 'rgba(0, 0, 0, 0.73)',
                        }}
                    >
                        <View
                            style={{
                                marginVertical: 10,
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                paddingLeft: 10,
                            }}
                        >
                            <Image
                                source={{ uri: GLOBAL.ImageUrlCMS + item_.icon }}
                                style={[
                                    styles.player_channel_icon,
                                    { padding: 5 },
                                ]}
                            />

                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.H4,
                                    styles.Color_LightGray,
                                    { paddingLeft: 10 },
                                ]}
                            >
                                {item_.name}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flex: 9, flexDirection: 'row' }}>
                        <FlatList
                            data={epgIn}
                            scrollType=""
                            horizontal={true}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) =>
                                this.renderColumn_(item, index, channel)
                            }
                        />
                    </View>
                </View>
            );
        } else {
            return null;
        }
    }
    _onItemPress = (item, channel_id, index) => {
        GLOBAL.Catchup_Selected = UTILS.getCurrentEpg(channel_id);
        GLOBAL.Channels_Selected_Index = UTILS.getChannelIndex(channel_id);
        (GLOBAL.Catchup_Selected_Index = index),
            (GLOBAL.Catchup_Selected_Program = item);
        (GLOBAL.Channel = UTILS.getChannel(channel_id)),
            Actions.Player({ fromPage: 'CatchupTV', action: 'CatchupTV' });
    };
    render() {
        return (
            <Container
                needs_notch={true}
                hide_header={GLOBAL.App_Theme == 'Honua' ? false : true}
                hide_menu={
                    GLOBAL.App_Theme == 'Honua' || GLOBAL.App_Theme == 'Iridium'
                        ? false
                        : GLOBAL.App_Theme == 'Akua' &&
                            !GLOBAL.Device_IsTablet &&
                            !GLOBAL.Device_IsPhone &&
                            !GLOBAL.Device_IsWebTV &&
                            GLOBAL.Device_IsSmartTV
                            ? true
                            : false
                }
            >
                {RenderIf(
                    GLOBAL.Device_IsPhone == false &&
                    GLOBAL.App_Theme != 'Iridium',
                )(
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.20)',
                            marginTop: GLOBAL.App_Theme == 'Honua' ? 4 : 0,
                            marginLeft: GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                            borderTopLeftRadius:
                                GLOBAL.App_Theme == 'Honua' ? 5 : 0,
                        }}
                    >
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <FlatList
                                data={this.state.channels}
                                horizontal={true}
                                initialNumToRender={5}
                                maxToRenderPerBatch={5}
                                windowSize={5}
                                removeClippedSubviews={true}
                                scrollType="catchup"
                                Width={GLOBAL.Device_IsAppleTV ? 400 : 300}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) =>
                                    this.renderColumn(item, index)
                                }
                            />
                        </View>
                    </View>,
                )}
                {RenderIf(
                    GLOBAL.Device_IsPhone == false &&
                    GLOBAL.App_Theme == 'Iridium',
                )(
                    <View style={{ flex: 1, marginLeft: 5, marginTop: 5 }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <FlatList
                                data={this.state.channels}
                                horizontal={false}
                                numColumns={1}
                                initialNumToRender={5}
                                maxToRenderPerBatch={5}
                                windowSize={5}
                                removeClippedSubviews={true}
                                scrollType="catchup"
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) =>
                                    this.renderColumn__(item, index)
                                }
                            />
                        </View>
                    </View>,
                )}
            </Container>
        );
    }
}
