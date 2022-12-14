import React, {Component} from 'react';
import {View, BackHandler, TVMenuControl} from 'react-native';
//import moment from "moment";
import {Actions} from 'react-native-router-flux';
import TimerMixin from 'react-timer-mixin';
import Grid from './Grid';

export default class EPG extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};

        GLOBAL.EPG_Paging = 7;
        GLOBAL.EPG_Days = 0;
        GLOBAL.EPG_RowHeight =
            ((GLOBAL.Device_Height / 5) * 2.6) / GLOBAL.EPG_Paging;
        if (GLOBAL.Device_IsTablet) {
            GLOBAL.EPG_GridHeight = (GLOBAL.Device_Height / 3) * 2.5 + 12;
        } else if (GLOBAL.Device_IsPhone) {
            GLOBAL.EPG_RowHeight =
                ((GLOBAL.Device_Width / 4) * 2.6) / GLOBAL.EPG_Paging;
            GLOBAL.EPG_GridHeight = (GLOBAL.Device_Width / 3.8) * 2.6 + 12;
        } else if (GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV) {
            GLOBAL.EPG_RowHeight =
                ((GLOBAL.Device_Height / 5) * 2.6) / GLOBAL.EPG_Paging;
            GLOBAL.EPG_GridHeight = GLOBAL.Device_Height - 100;
        } else if (GLOBAL.Device_IsSmartTV) {
            GLOBAL.EPG_RowHeight = ((GLOBAL.Device_Height / 5) * 2.6) / 7;
            GLOBAL.EPG_GridHeight = GLOBAL.EPG_RowHeight * 8 + 12;
        } else {
            GLOBAL.EPG_GridHeight = (GLOBAL.Device_Height / 5) * 2.6 + 12;
        }
        this.state = {
            channels: [],
            button_record: false,
            current_program: [],
            days: this.props.days ? this.props.days : 0,
            channel_categories: GLOBAL.Channels,
            button_record_fail: false,
            button_record_requested: false,
            error: false,
        };
        this.today = new Date();
        this.selectProgram = this.selectProgram.bind(this);
        this.selectDate = this.selectDate.bind(this);
        this.selectGroup = this.selectGroup.bind(this);
        this.goBack = this.goBack.bind(this);
        this.getEpgData = this.getEpgData.bind(this);
    }
    // backButton = (event) => {
    //if(event == undefined){return}
    //     if (event.keyCode === 10009 || event.keyCode === 1003 || event.keyCode === 461 || event.keyCode == 8) {
    //         this.goBack();
    //     }
    // }
    updateDimensions() {
        Actions.EPG();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            //document.addEventListener('keydown', this.backButton, false);
        }
        REPORT.set({type: 4, name: 'horizontal'});

        GLOBAL.EPG_Days = 0;
        this.getEpgData(0);
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            // document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        //this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        TimerMixin.clearTimeout(this.recordTimer);

        Actions.pop();
    }
    goBack() {
        GLOBAL.EPG = GLOBAL.EPG_TODAY;
        GLOBAL.Focus = 'Home';
        Actions.Home();
    }
    getEpgData(days) {
        this.setState(
            {
                channels: [],
            },
            () => {
                const date = moment().add(days, 'days').format('DD_MM_YYYY');
                if (days == 0 && GLOBAL.EPG_DATE_LOADED == date) {
                    GLOBAL.EPG = GLOBAL.EPG_TODAY;
                    var channels = this.filterEpgByChannelsGroups();
                    this.setState({
                        channels: channels,
                        days: days,
                        error: false,
                    });
                } else {
                    this.setState(
                        {
                            days: days,
                        },
                        () => {
                            GLOBAL.EPG = [];
                            GLOBAL.EPG_DATE_LOADED = [];
                            var path =
                                GLOBAL.CDN_Prefix +
                                '/' +
                                GLOBAL.IMS +
                                '/jsons/' +
                                GLOBAL.CRM +
                                '/' +
                                date +
                                '_' +
                                GLOBAL.ProductID +
                                '_product_epg_v4.json?t=' +
                                new Date().getTime();
                            DAL.getJson(path)
                                .then(data => {
                                    GLOBAL.EPG = data.channels;
                                    GLOBAL.EPG_DATE_LOADED = date;
                                    if (
                                        GLOBAL.User.products.ChannelPackages
                                            .length > 0
                                    ) {
                                        this.getExtraEpg(days, 0);
                                    } else {
                                        var channelsNew =
                                            this.filterEpgByChannelsGroups();
                                        this.setState({
                                            channels: channelsNew,
                                            error: false,
                                        });
                                    }
                                })
                                .catch(error => {
                                    this.setState({
                                        error: true,
                                    });
                                });
                        },
                    );
                }
            },
        );
    }
    getExtraEpg(days, id) {
        if (id < GLOBAL.User.products.ChannelPackages.length) {
            const date = moment().add(days, 'days').format('DD_MM_YYYY');
            var path =
                GLOBAL.CDN_Prefix +
                '/' +
                GLOBAL.IMS +
                '/jsons/' +
                GLOBAL.CMS +
                '/' +
                date +
                '_' +
                GLOBAL.User.products.ChannelPackages[id].PackageID +
                '_package_epg_v2.json?t=' +
                new Date().getTime();
            DAL.getJson(path)
                .then(data => {
                    data.channels.forEach(function (element) {
                        GLOBAL.EPG = GLOBAL.EPG.concat(element);
                        GLOBAL.EPG_TODAY = GLOBAL.EPG_TODAY.concat(element);
                    });
                    GLOBAL.EPG_DATE_LOADED = date;
                    if (GLOBAL.User.products.ChannelPackages.length > 0) {
                        this.getExtraEpg(days, id + 1);
                    } else {
                        var channelsNew = this.filterEpgByChannelsGroups();
                        this.setState({
                            channels: channelsNew,
                            error: false,
                        });
                    }
                })
                .catch(error => {
                    var channelsNew = this.filterEpgByChannelsGroups();
                    this.setState({
                        channels: channelsNew,
                        error: false,
                    });
                });
        } else {
            var channelsNew = this.filterEpgByChannelsGroups();
            this.setState({
                channels: channelsNew,
                error: false,
            });
        }
    }
    filterEpgByChannelsGroups() {
        var newEPG = [];
        if (GLOBAL.Channels_Selected == null) {
            GLOBAL.Channels_Selected = GLOBAL.Channels;
        }
        if (
            GLOBAL.Channels_Selected == undefined ||
            GLOBAL.Channels_Selected.length == 0
        ) {
            GLOBAL.Channels_Selected = GLOBAL.Channels[0].channels;
            GLOBAL.Channels_Selected_Category_ID = GLOBAL.Channels[0].id;
            GLOBAL.Channels_Selected_Index = 0;
            GLOBAL.Channels_Selected_Category_Index = UTILS.getCategoryIndex(
                GLOBAL.Channels_Selected_Category_ID,
            );
        }
        GLOBAL.Channels_Selected = GLOBAL.Channels_Selected;
        GLOBAL.Channels_Selected.forEach((channel, index) => {
            var EPG = GLOBAL.EPG.find(e => e.id == channel.channel_id);
            if (EPG != null) {
                newEPG.push(EPG);
            }
        });
        return newEPG;
    }
    selectDate = days => {
        GLOBAL.EPG_Days = days;
        this.getEpgData(days);
    };
    selectGroup = id => {
        var category = GLOBAL.Channels.find(x => x.id == id);
        if (category == undefined) {
            return;
        }
        if (category.channels == undefined) {
            return;
        }
        if (category.channels.length > 0) {
            GLOBAL.Channels_Selected = category.channels;
            GLOBAL.Channels_Selected_Category_ID = category.id;
            GLOBAL.Channels_Selected_Category_Index = UTILS.getCategoryIndex(
                GLOBAL.Channels_Selected_Category_ID,
            );
            this.getEpgData(GLOBAL.EPG_Days);
        }
    };
    selectProgram = (index, program, channel, page) => {
        if (program != null) {
            GLOBAL.EPG_Catchup_Channel = GLOBAL.EPG_Catchup.find(
                e => e.id == channel.id,
            );
            //var index = GLOBAL.EPG_Catchup_Channel.epgdata.findIndex(e => e.id == program.id);
            var timestampNow = moment().unix();
            var hasInteractiveTV = false;
            if (channel != undefined) {
                if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
                    hasInteractiveTV = true;
                }
            }
            if (
                program.e < timestampNow &&
                hasInteractiveTV == true &&
                GLOBAL.UserInterface.general.enable_catchuptv == true
            ) {
                if (
                    GLOBAL.EPG_Days * -1 >=
                    GLOBAL.UserInterface.general.catchup_days
                ) {
                    return;
                }
                GLOBAL.Catchup_Selected = UTILS.getCurrentEpg(channel.id);
                GLOBAL.Channels_Selected_Index = UTILS.getChannelIndex(
                    channel.id,
                );
                (GLOBAL.Catchup_Selected_Index = index),
                    (GLOBAL.Catchup_Selected_Program = program);
                (GLOBAL.Channel = UTILS.getChannel(channel.id)),
                    Actions.Player({
                        fromPage: 'EPG',
                        action: 'CatchupTV',
                        page: page,
                    });
            } else if (
                program.s > timestampNow &&
                hasInteractiveTV == true &&
                GLOBAL.UserInterface.general.enable_recordings == true
            ) {
                if (
                    GLOBAL.EPG_Days >= GLOBAL.UserInterface.general.catchup_days
                ) {
                    return;
                }
                if (program.e == program.s) {
                    return;
                }
                if (GLOBAL.Storage_Used / GLOBAL.Storage_Total < 0.95) {
                    this.setState(
                        {
                            button_record_requested: true,
                        },
                        () => {
                            DAL.setRecording(
                                channel.id,
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
                                    this.recordTimer = TimerMixin.setTimeout(
                                        () => {
                                            this.setState({
                                                button_record_fail: false,
                                                button_record_requested: false,
                                            });
                                        },
                                        4000,
                                    );
                                } else {
                                    this.setState({
                                        button_record: true,
                                        current_program: program,
                                        button_record_requested: false,
                                    });
                                    this.recordTimer = TimerMixin.setTimeout(
                                        () => {
                                            this.setState({
                                                button_record: false,
                                                current_program: [],
                                                button_record_requested: false,
                                            });
                                        },
                                        3000,
                                    );
                                }
                            });
                        },
                    );
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
                    }, 4000);
                }
            } else if (program.s < timestampNow && program.e > timestampNow) {
                GLOBAL.Channel = UTILS.getChannel(channel.id);
                Actions.Player({fromPage: 'EPG', page: page});
            } else {
                GLOBAL.Channel = UTILS.getChannel(channel.id);
                Actions.Player({fromPage: 'EPG', page: page});
            }
        }
    };
    render() {
        return (
            <Container
                needs_notch={true}
                hide_menu={true}
                hide_header={true}
                is_landscape={true}
                blur={10}
            >
                {RenderIf(this.state.button_record)(
                    <Modal
                        Title={LANG.getTranslation('record_program')}
                        Centered={true}
                        TextHeader={
                            LANG.getTranslation('recording_set_for') +
                            ': ' +
                            this.state.current_program.n
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
                        TextTagline={this.state.current_program.n}
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
                <View style={{flex: 40}}>
                    <View style={[{flex: 40}]}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {RenderIf(
                                this.state.channels.length > 0 ||
                                    this.state.error == true,
                            )(
                                <Grid
                                    ref="grid"
                                    channels={this.state.channels}
                                    categories={this.state.channel_categories}
                                    selectProgram={this.selectProgram}
                                    selectDate={this.selectDate}
                                    selectGroup={this.selectGroup}
                                    goBack={this.goBack}
                                    getEpgData={this.getEpgData}
                                    error={this.state.error}
                                    page={this.props.page}
                                />,
                            )}
                            {RenderIf(
                                this.state.channels.length == 0 &&
                                    this.state.error == false,
                            )(
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                    }}
                                >
                                    <ActivityIndicator
                                        size={40}
                                        color={'#e0e0e0'}
                                    />
                                </View>,
                            )}
                        </View>
                    </View>
                </View>
            </Container>
        );
    }
}
