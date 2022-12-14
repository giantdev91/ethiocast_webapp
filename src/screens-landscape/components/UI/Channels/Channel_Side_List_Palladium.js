import React, { PureComponent } from 'react';
import { View, Text, Image } from 'react-native';
// import {RegularIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Actions } from 'react-native-router-flux';

class Channel_Side_List_Palladium extends PureComponent {
    constructor(props) {
        super(props);
        this.pressChannel = this.props.pressChannel.bind(this);
    }
    hasCatchup(channel) {
        if (
            GLOBAL.UserInterface.general.enable_catchuptv == true &&
            (channel.is_flussonic == 1 || channel.is_dveo == 1)
        ) {
            return true;
        } else {
            return false;
        }
    }
    isFavorite(channel) {
        var check_favorite = GLOBAL.Favorite_Channels.find(
            c => c.channel_id == channel.channel_id,
        );
        if (check_favorite == undefined) {
            return false;
        }
        if (check_favorite != undefined) {
            return true;
        }
    }
    render() {
        const width = this.props.Width;
        const channel = this.props.Channel;
        const index = this.props.Index;

        var currentUnix = moment().unix();
        var epg_check = GLOBAL.EPG.find(e => e.id == channel.channel_id);
        var currentIndex = 0;
        var epg_ = [];
        var currentProgram = [];
        var n = 'No Information Available';
        var time = '';
        if (epg_check != undefined) {
            epg_ = epg_check.epgdata;
            currentIndex = epg_.findIndex(function (element) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            if (currentIndex != undefined) {
                if (epg_[currentIndex] != null) {
                    currentProgram = epg_[currentIndex];
                    n = currentProgram.n;
                    time =
                        moment
                            .unix(currentProgram.s)
                            .format('ddd ' + GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment
                            .unix(currentProgram.e)
                            .format(GLOBAL.Clock_Setting);
                }
            }
        }
        return (
            <TouchableHighlightFocus
                {...this.props}
                style={{ borderRadius: 5 }}
                onPress={() => this.pressChannel(channel)}
                hasTVPreferredFocus={
                    GLOBAL.Channels_Selected_Index == index ? true : false
                }
                key={index}
                underlayColor={GLOBAL.Button_Color}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 10,
                    }}
                >
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.Medium}>
                            {channel.channel_number}
                        </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Image
                            source={{
                                uri:
                                    channel.channel_image == undefined
                                        ? GLOBAL.ImageUrlCMS + channel.icon_big
                                        : GLOBAL.ImageUrlCMS +
                                        channel.channel_image,
                            }}
                            style={{
                                height:
                                    GLOBAL.Device_IsAppleTV ||
                                        GLOBAL.Device_IsWebTV
                                        ? 60
                                        : 40,
                                width:
                                    GLOBAL.Device_IsAppleTV ||
                                        GLOBAL.Device_IsWebTV
                                        ? 60
                                        : 40,
                            }}
                        />
                    </View>
                    <View style={{ flex: 5, paddingLeft: 10, marginRight: 10 }}>
                        <Text numberOfLines={1} style={styles.Standard}>
                            {n}
                        </Text>
                        <Text style={[styles.Medium, { color: '#fff' }]}>
                            {RenderIf(this.hasCatchup(channel) == true)(
                                <FontAwesome5
                                    style={
                                        styles.Medium[
                                        { color: '#fff', margin: 10 }
                                        ]
                                    }
                                    // icon={SolidIcons.history}
                                    name="history"
                                />,
                            )}
                            {RenderIf(this.hasCatchup(channel) == true)(
                                <Text style={[styles.Medium, { color: '#ffff' }]}>
                                    &nbsp;
                                </Text>,
                            )}
                            {RenderIf(this.isFavorite(channel) == true)(
                                <FontAwesome
                                    style={
                                        styles.H5[{ color: '#fff', margin: 10 }]
                                    }
                                    // icon={RegularIcons.heart}
                                    name="heart-o"
                                />,
                            )}
                            {RenderIf(this.isFavorite(channel) == true)(
                                <Text style={[styles.H5, { color: '#fff' }]}>
                                    &nbsp;
                                </Text>,
                            )}
                            {time}
                        </Text>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default Channel_Side_List_Palladium;
