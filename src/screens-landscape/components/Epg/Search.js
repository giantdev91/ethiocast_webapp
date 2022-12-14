import React, { Component } from 'react';
import {
    BackHandler,
    TVMenuControl,
    View,
    Image,
    Text,
    ImageBackground,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
//import moment from "moment";
import TimerMixin from 'react-timer-mixin';
import Orientation from 'react-native-orientation';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

export default class Search extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        GLOBAL.SearchInput = '';
        this.state = {
            epg_search: GLOBAL.EPG_Search_EPG,
            epg_channels: GLOBAL.EPG_Search_Channels,
            inputRowWidth: 0,
            button_record: false,
            button_record_fail: false,
            button_record_requested: false,
        };
    }
    onChangeText = value => {
        //if (GLOBAL.Device_IsAppleTV) { return }
        this.setState({ value });
        this.searchContent(value);
    };
    onChangeText_(value) {
        //if (GLOBAL.Device_IsAppleTV == false) { return }
        this.setState({ value });
        this.searchContent(value);
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
            if (GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV) {
                return;
            } else {
                Actions.EPG();
            }
        }
    };
    updateDimensions() {
        if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
            return;
        }
        Actions.Search();
    }

    componentDidMount() {
        if (GLOBAL.Device_IsPhone == true) {
            Orientation.lockToLandscape();
        }
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_Manufacturer == 'Samsung Tizen') {
            setTimeout(function () {
                var viewheight = $(window).height();
                var viewwidth = $(window).width();
                var viewport = $('meta[name=viewport]');
                viewport.attr(
                    'content',
                    'height=' +
                    viewheight +
                    'px, width=' +
                    viewwidth +
                    'px, initial-scale=1.0',
                );
            }, 300);
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV) {
                    return;
                } else {
                    Actions.EPG();
                }
                return true;
            },
        );
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsPhone) {
            //GLOBAL.Orientation = "PORTRAIT";
            Orientation.lockToPortrait();
        }
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }
    searchContent(searchTerm) {
        if (searchTerm.length < 2) {
            return;
        }
        searchTerm = searchTerm.toLowerCase();
        let channelArray = [];
        try {
            var epg = GLOBAL.EPG;
            let result = epg
                .filter(element =>
                    element.epgdata.some(data =>
                        data.n != undefined
                            ? data.n.toLowerCase().indexOf(searchTerm) > -1
                            : null,
                    ),
                )
                .map(element => {
                    let newElt = Object.assign({}, element);
                    var result_ = newElt.epgdata.filter(
                        data => data.n.toLowerCase().indexOf(searchTerm) > -1,
                    );
                    channelArray.push(element);
                    return result_;
                });
            GLOBAL.EPG_Search_Channels = channelArray;
            GLOBAL.EPG_Search_EPG = result;
            this.setState({
                epg_search: result,
                epg_channels: channelArray,
            });
        } catch (error) { }
    }
    focusSearch = () => {
        if (GLOBAL.Device_IsTV == true) {
            this.search.focus();
        }
    };

    getTimeHuman(ut_time) {
        return moment.unix(ut_time).format(GLOBAL.Clock_Setting);
    }

    getDateTimeHuman(ut_time) {
        return moment.unix(ut_time).format('MMMM Do YYYY');
    }
    openProgram = (program, channel_) => {
        if (program != null) {
            //var index_ = channel.epgdata.findIndex(x => x.id === program.id);
            var channel = UTILS.getChannel(channel_.id);
            var timestampNow = moment().unix();
            var hasInteractiveTV = false;
            if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
                hasInteractiveTV = true;
            }
            if (program.e < timestampNow && hasInteractiveTV == true) {
                GLOBAL.Catchup_Selected = UTILS.getCurrentEpg(
                    channel.channel_id,
                );
                //GLOBAL.Catchup_Selected_Index = index,
                GLOBAL.Catchup_Selected_Program = program;
                GLOBAL.Channel = channel;
                Actions.Player({ fromPage: 'SearchEpg', action: 'CatchupTV' });
            } else if (program.s > timestampNow && hasInteractiveTV == true) {
                if (program.e == program.s) {
                    return;
                }
                this.setState({
                    button_record: true,
                    current_program: program,
                    n: program.n,
                    e: program.e,
                    s: program.s,
                });
                if (GLOBAL.Storage_Used / GLOBAL.Storage_Total < 0.95) {
                    this.setState({
                        button_record_requested: true,
                    });
                    DAL.setRecording(
                        channel.channel_id,
                        program.e,
                        program.s,
                        program.n,
                    ).then(data => {
                        if (data == 'Not Approved') {
                            this.setState({
                                button_record_fail: true,
                                button_record: false,
                                current_program: [],
                                button_record_requested: false,
                            });
                            this.recordTimer = TimerMixin.setTimeout(() => {
                                this.setState({
                                    button_record_fail: false,
                                    button_record_requested: false,
                                });
                            }, 2000);
                        } else {
                            this.setState({
                                button_record: true,
                                current_program: program,
                                button_record_requested: false,
                            });
                            this.recordTimer = TimerMixin.setTimeout(() => {
                                this.setState({
                                    button_record: false,
                                    current_program: [],
                                    n: '',
                                    e: '',
                                    s: '',
                                });
                            }, 3000);
                        }
                    });
                } else {
                    this.setState({
                        button_record_fail: true,
                        button_record: false,
                        current_program: [],
                        button_record_requested: false,
                    });
                    this.recordTimer = TimerMixin.setTimeout(() => {
                        this.setState({
                            button_record_fail: false,
                            button_record_requested: false,
                        });
                    }, 2000);
                }
            } else if (program.s < timestampNow && program.e > timestampNow) {
                (GLOBAL.Channel = UTILS.getChannel(channel.channel_id)),
                    Actions.Player({ fromPage: 'SearchEpg' });
            } else {
                (GLOBAL.Channel = UTILS.getChannel(channel.channel_id)),
                    Actions.Player({ fromPage: 'SearchEpg' });
            }
        }
    };
    getIcons(program, channel) {
        var timestampNow = moment().unix();
        if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
            if (program.e > timestampNow && program.s > timestampNow) {
                if (GLOBAL.Device_IsPhone == true) {
                    return (
                        <View
                            style={{
                                borderRadius: 100,
                                width: 10,
                                height: 10,
                                backgroundColor: 'crimson',
                            }}
                        ></View>
                    );
                } else {
                    return (
                        <View
                            style={{
                                backgroundColor: 'crimson',
                                padding: 3,
                                borderRadius: 100,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[
                                    styles.IconsTelevision,
                                    { color: '#fff' },
                                ]}
                                // icon={RegularIcons.dotCircle}
                                name="dot-circle"
                            />
                        </View>
                    );
                }
            } else if (program.e < timestampNow) {
                if (GLOBAL.Device_IsPhone == true) {
                    return (
                        <View
                            style={{
                                borderRadius: 100,
                                width: 10,
                                height: 10,
                                backgroundColor: 'royalblue',
                            }}
                        ></View>
                    );
                } else {
                    return (
                        <View
                            style={{
                                backgroundColor: 'royalblue',
                                padding: 3,
                                borderRadius: 100,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[
                                    styles.IconsTelevision,
                                    { color: '#fff' },
                                ]}
                                // icon={SolidIcons.history}
                                name="history"
                            />
                        </View>
                    );
                }
            } else if (program.e > timestampNow && program.s < timestampNow) {
                if (GLOBAL.Device_IsPhone == true) {
                    return (
                        <View
                            style={{
                                borderRadius: 100,
                                width: 10,
                                height: 10,
                                backgroundColor: 'forestgreen',
                            }}
                        ></View>
                    );
                } else {
                    return (
                        <View
                            style={{
                                backgroundColor: 'forestgreen',
                                padding: 3,
                                borderRadius: 100,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[
                                    styles.IconsTelevision,
                                    { color: '#fff' },
                                ]}
                                // icon={SolidIcons.playCircle}
                                name="play-circle"
                            />
                        </View>
                    );
                }
            }
        } else {
            if (program.e > timestampNow && program.s < timestampNow) {
                if (GLOBAL.Device_IsPhone == true) {
                    return (
                        <View
                            style={{
                                borderRadius: 100,
                                width: 10,
                                height: 10,
                                backgroundColor: 'forestgreen',
                            }}
                        ></View>
                    );
                } else {
                    return (
                        <View
                            style={{
                                backgroundColor: 'forestgreen',
                                padding: 3,
                                borderRadius: 100,
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            <FontAwesome5
                                style={[
                                    styles.IconsTelevision,
                                    { color: '#fff' },
                                ]}
                                // icon={SolidIcons.playCircle}
                                name="play-circle"
                            />
                        </View>
                    );
                }
            }
        }
    }
    getProgram(item, index, channel) {
        var fromtotime =
            this.getTimeHuman(item.s) + ' - ' + this.getTimeHuman(item.e);
        var date = this.getDateTimeHuman(item.s);
        var width = GLOBAL.COL_3;

        return (
            <View style={{ width: width - 5 }}>
                <TouchableHighlightFocus
                    hasTVPreferredFocus={false}
                    style={{}}
                    BorderRadius={5}
                    activeOpacity={1}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.openProgram(item, channel)}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            padding: 15,
                            backgroundColor: 'rgba(0, 0, 0, 0.60)',
                            borderRadius: 5,
                        }}
                    >
                        <View
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                margin: 10,
                            }}
                        >
                            {this.getIcons(item, channel)}
                        </View>
                        <Text
                            numberOfLines={1}
                            style={[styles.DateTimeWhite, { marginBottom: 10 }]}
                        >
                            {date}
                        </Text>
                        <Text numberOfLines={1} style={[styles.Standard]}>
                            {item.n}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[styles.Date, { marginBottom: 5 }]}
                        >
                            {fromtotime}
                        </Text>
                        <Text
                            numberOfLines={2}
                            style={[styles.Medium, { marginBottom: 5 }]}
                        >
                            {item.d}
                        </Text>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
    getChannel(epg, index) {
        var channel = this.state.epg_channels[index];

        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    marginTop: 5,
                    marginBottom: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(0, 0, 0, 0.60)',
                }}
            >
                <View
                    style={{
                        flex: 2,
                        flexDirection: 'row',
                        marginHorizontal: 3,
                        borderRadius: 5,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'column',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            padding: 10,
                        }}
                    >
                        <Image
                            source={{ uri: GLOBAL.ImageUrlCMS + channel.icon }}
                            style={[styles.player_channel_icon, {}]}
                        />
                    </View>
                    <View
                        style={{
                            flex: 9,
                            flexDirection: 'column',
                            alignSelf: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text numberOfLines={1} style={styles.H4}>
                            {channel.number}. {channel.name}
                        </Text>
                    </View>
                </View>
                <View
                    style={{
                        flex: 9,
                        flexDirection: 'row',
                        marginTop: 5,
                        alignContent: 'center',
                        justifyContent: 'flex-start',
                    }}
                >
                    <FlatList
                        ref={ref => {
                            this.flatListRef = ref;
                        }}
                        data={epg}
                        horizontal={false}
                        numColumns={3}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => {
                            return this.getProgram(item, index, channel);
                        }}
                    />
                </View>
            </View>
        );
    }
    onInputBoxLayout = event => {
        if (this.state.inputRowWidth != 0) return;
        var width = event.nativeEvent.layout.width;
        var height = event.nativeEvent.layout.height;
        if (height > width) {
            width = height;
        }
        this.setState({ inputRowWidth: width - 20 });
    };

    render() {
        return (
            <Container hide_menu={true} hide_header={true}>
                {RenderIf(this.state.button_record)(
                    <Modal
                        Title={LANG.getTranslation('record_program')}
                        Centered={true}
                        TextHeader={
                            LANG.getTranslation('recording_set_for') +
                            ': ' +
                            this.state.n
                        }
                        ShowLoader={false}
                    ></Modal>,
                )}
                {RenderIf(this.state.button_record_fail)(
                    <Modal
                        Title={LANG.getTranslation('record_program_fail')}
                        Centered={true}
                        TextHeader={LANG.getTranslation(
                            'recording_set_for_not',
                        )}
                        TextTagline={this.state.n}
                        ShowLoader={false}
                    ></Modal>,
                )}
                {RenderIf(this.state.button_record_requested)(
                    <Modal
                        Title={LANG.getTranslation('record_program')}
                        Centered={true}
                        ShowLoader={true}
                    ></Modal>,
                )}
                <ImageBackground
                    style={{ flex: 1 }}
                    resizeMode={'cover'}
                    resizeMethod={'resize'}
                    source={require('../../../images/hero_bg.png')}
                >
                    <View style={{ flex: 1, paddingRight: 3, paddingLeft: 3 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Keyboard
                                BackPage={() => Actions.EPG()}
                                EnableBackButton={true}
                                OldSearch={GLOBAL.SearchInput}
                                Width={
                                    GLOBAL.Device_Width -
                                    10 -
                                    (GLOBAL.App_Theme == 'Palladium'
                                        ? 200
                                        : GLOBAL.Device_IsPhone ||
                                            GLOBAL.Device_IsTablet ||
                                            (GLOBAL.Device_IsWebTV &&
                                                !GLOBAL.Device_IsSmartTV)
                                            ? 50
                                            : 0)
                                }
                                Margin={10}
                                Icon={"search"}
                                PlaceHolder={LANG.getTranslation(
                                    'search_tv_programs',
                                )}
                                Submit={this.onChangeText}
                                LiveReload={true}
                            />
                        </View>
                        <View
                            style={{
                                flex: 10,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <FlatList
                                ref={ref => {
                                    this.flatListRef = ref;
                                }}
                                data={this.state.epg_search}
                                horizontal={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => {
                                    return this.getChannel(item, index);
                                }}
                            />
                        </View>
                    </View>
                </ImageBackground>
            </Container>
        );
    }
}
