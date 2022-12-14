import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class EPG_List_program extends PureComponent {
    constructor(props) {
        super(props);
        this.recordProgram = this.props.recordProgram.bind(this);
        this.startChannelById = this.props.startChannelById.bind(this);
        this._startCatchupFromChannelMenu =
            this.props._startCatchupFromChannelMenu.bind(this);
    }

    render() {
        const width = this.props.Width;
        const program = this.props.Program;
        const index = this.props.Index;
        const channel = this.props.Channel;
        const currentProgram = this.props.CurrentProgram;
        const recordRequest = this.props.RecordRequest;
        const record = this.props.Record;
        const itv =
            channel.is_flussonic == 1 || channel.is_dveo == 1 ? true : false;

        var start =
            moment.unix(program.s).format(GLOBAL.Clock_Setting) +
            ' - ' +
            moment.unix(program.e).format(GLOBAL.Clock_Setting);
        var timenow = moment().unix();
        if (program.e < timenow) {
            if (
                itv == true &&
                GLOBAL.EPG_Days * -1 <=
                GLOBAL.UserInterface.general.catchup_days &&
                GLOBAL.UserInterface.general.enable_catchuptv == true
            ) {
                return (
                    <TouchableHighlightFocus
                        style={{ height: 50 }}
                        BorderRadius={5}
                        key={index}
                        hasTVPreferredFocus={false}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            this._startCatchupFromChannelMenu(program, index)
                        }
                    >
                        <View
                            style={[
                                {
                                    borderRadius: 3,
                                    width: width,
                                    backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                    padding: 10,
                                    flex: 1,
                                    flexDirection: 'row',
                                },
                            ]}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.Mini, { marginLeft: 5 }]}
                                >
                                    {start}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1.5,
                                    marginRight: 10,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text numberOfLines={1} style={[styles.Medium]}>
                                    {program.n}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    alignContent: 'flex-end',
                                    alignItems: 'flex-end',
                                    alignSelf: 'flex-end',
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: 'royalblue',
                                        borderRadius: 100,
                                        marginHorizontal: 2,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <FontAwesome5
                                        style={[
                                            styles.IconsTelevision,
                                            {
                                                color: '#fff',
                                                margin: GLOBAL.Device_IsAppleTV
                                                    ? 10
                                                    : 4,
                                            },
                                        ]}
                                        // icon={SolidIcons.history}
                                        name="history"
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            } else {
                return (
                    <TouchableHighlightFocus
                        style={{ height: 50 }}
                        BorderRadius={5}
                        key={index}
                        hasTVPreferredFocus={false}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            this.startChannelById(channel.channel_id)
                        }
                    >
                        <View
                            style={[
                                {
                                    borderRadius: 3,
                                    width: width,
                                    backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                    padding: 10,
                                    flex: 1,
                                    flexDirection: 'row',
                                },
                            ]}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.Mini, { marginLeft: 5 }]}
                                >
                                    {start}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1.5,
                                    marginRight: 25,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text numberOfLines={1} style={[styles.Medium]}>
                                    {program.n}
                                </Text>
                            </View>
                            <View>
                                {/* <Markers Text={'|'} Empty={'transparent'} /> */}
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
        } else if (program.s <= timenow && program.e >= timenow) {
            if (channel.is_flussonic == 1 || channel.is_dveo == 1) {
                return (
                    <TouchableHighlightFocus
                        style={{ height: 50 }}
                        BorderRadius={5}
                        key={index}
                        hasTVPreferredFocus={false}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            this.startChannelById(channel.channel_id)
                        }
                    >
                        <View
                            style={[
                                {
                                    borderRadius: 3,
                                    width: width,
                                    backgroundColor: 'rgba(0, 0, 0, 0.90)',
                                    padding: 10,
                                    flex: 1,
                                    flexDirection: 'row',
                                },
                            ]}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.Mini, { marginLeft: 5 }]}
                                >
                                    {start}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1.5,
                                    marginRight: 10,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text numberOfLines={1} style={[styles.Medium]}>
                                    {program.n}
                                </Text>
                            </View>
                            <View>
                                <View
                                    style={{
                                        backgroundColor: 'forestgreen',
                                        borderRadius: 100,
                                        marginHorizontal: 2,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <FontAwesome5
                                        style={[
                                            styles.IconsTelevision,
                                            {
                                                color: '#fff',
                                                margin: GLOBAL.Device_IsAppleTV
                                                    ? 10
                                                    : 4,
                                            },
                                        ]}
                                        // icon={SolidIcons.playCircle}
                                        name="play-circle"
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            } else {
                return (
                    <TouchableHighlightFocus
                        style={{ height: 50 }}
                        BorderRadius={5}
                        key={index}
                        hasTVPreferredFocus={false}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            this.startChannelById(channel.channel_id)
                        }
                    >
                        <View
                            style={[
                                {
                                    borderRadius: 3,
                                    width: width,
                                    backgroundColor: 'rgba(0, 0, 0, 0.90)',
                                    padding: 10,
                                    flex: 1,
                                    flexDirection: 'row',
                                },
                            ]}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.Mini, { marginLeft: 5 }]}
                                >
                                    {start}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1.5,
                                    marginRight: 10,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text numberOfLines={1} style={[styles.Medium]}>
                                    {program.n}
                                </Text>
                            </View>
                            <View>
                                <View
                                    style={{
                                        backgroundColor: 'forestgreen',
                                        borderRadius: 100,
                                        marginHorizontal: 2,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <FontAwesome5
                                        style={[
                                            styles.IconsTelevision,
                                            {
                                                color: '#fff',
                                                margin: GLOBAL.Device_IsAppleTV
                                                    ? 10
                                                    : 4,
                                            },
                                        ]}
                                        // icon={SolidIcons.playCircle}
                                        name="play-circle"
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
        } else if (program.e > timenow) {
            var recorded = UTILS.getRecording(program.s, program.e, program.n);
            if (
                itv == true &&
                GLOBAL.EPG_Days <= GLOBAL.UserInterface.general.catchup_days &&
                GLOBAL.UserInterface.general.enable_recordings == true
            ) {
                return (
                    <TouchableHighlightFocus
                        style={{ height: 50 }}
                        BorderRadius={5}
                        key={index}
                        hasTVPreferredFocus={false}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            recorded == true
                                ? null
                                : this.recordProgram(program, channel, record)
                        }
                    >
                        <View
                            style={[
                                {
                                    borderRadius: 3,
                                    width: width,
                                    backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                    padding: 10,
                                    flex: 1,
                                    flexDirection: 'row',
                                },
                            ]}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.Mini, { marginLeft: 5 }]}
                                >
                                    {start}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1.5,
                                    marginRight: 10,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text numberOfLines={1} style={[styles.Medium]}>
                                    {program.n}
                                </Text>
                            </View>
                            <View>
                                <View
                                    style={{
                                        backgroundColor: 'crimson',
                                        borderRadius: 100,
                                        marginHorizontal: 2,
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                    }}
                                >
                                    <FontAwesome5
                                        style={[
                                            styles.IconsTelevision,
                                            {
                                                color: '#fff',
                                                margin: GLOBAL.Device_IsAppleTV
                                                    ? 10
                                                    : 4,
                                            },
                                        ]}
                                        // icon={SolidIcons.dotCircle}
                                        name="dot-circle"
                                    />
                                </View>
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            } else {
                return (
                    <TouchableHighlightFocus
                        style={{ height: 50 }}
                        BorderRadius={5}
                        key={index}
                        hasTVPreferredFocus={false}
                        underlayColor={GLOBAL.Button_Color}
                        onPress={() =>
                            this.startChannelById(channel.channel_id)
                        }
                    >
                        <View
                            style={[
                                {
                                    borderRadius: 3,
                                    width: width,
                                    backgroundColor: 'rgba(0, 0, 0, 0.70)',
                                    padding: 10,
                                    flex: 1,
                                    flexDirection: 'row',
                                },
                            ]}
                        >
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text
                                    numberOfLines={1}
                                    style={[styles.Mini, { marginLeft: 5 }]}
                                >
                                    {start}
                                </Text>
                            </View>
                            <View
                                style={{
                                    flex: 1.5,
                                    marginRight: 25,
                                    justifyContent: 'center',
                                }}
                            >
                                <Text numberOfLines={1} style={[styles.Medium]}>
                                    {program.n}
                                </Text>
                            </View>
                            <View>
                                {/* <Markers Text={'|'} Empty={'transparent'} /> */}
                            </View>
                        </View>
                    </TouchableHighlightFocus>
                );
            }
        } else {
            return null;
        }
    }
}

export default EPG_List_program;
