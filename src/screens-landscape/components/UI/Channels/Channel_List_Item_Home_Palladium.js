//import moment from 'moment';
import React, { PureComponent } from 'react';
import { View, Text, Image, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Channel_List_Item_Home_Palladium extends PureComponent {
    constructor(props) {
        super(props);
        this.focusChannel = this.props.focusChannel.bind(this);
        this.selectChannel = this.props.selectChannel.bind(this);

        if (this.props.blurChannel != undefined) {
            this.blurChannel = this.props.blurChannel.bind(this);
        }
    }
    _startSelectedChannel(item, index) {
        var category = GLOBAL.Channels[0];
        if (category != undefined) {
            if (category.channels.length > 0) {
                GLOBAL.Channels_Selected = category.channels;
                GLOBAL.Channels_Selected_Category_ID = category.id;
                var index = UTILS.getChannelIndex(item.channel_id);
                GLOBAL.Channels_Selected_Index = index;
                GLOBAL.Channel = UTILS.getChannel(item.channel_id);
                GLOBAL.Channels_Selected_Category_Index =
                    UTILS.getCategoryIndex(
                        GLOBAL.Channels_Selected_Category_ID,
                    );
                Actions.Player({ fromPage: 'Home' });
            }
        }
    }
    _setFocusOnFirst(index) {
        if (
            GLOBAL.Device_IsTV == true &&
            GLOBAL.Channels_Selected_Index == index
        ) {
            return index === GLOBAL.Channels_Selected_Index;
        }
        return false;
    }
    getCurrentImage() {
        var url = this.props.Channel.url_high;
        var splitUrl = url.toString().split('/');
        var image =
            splitUrl[0] +
            '//' +
            splitUrl[2] +
            '/' +
            splitUrl[3] +
            '/' +
            'preview.jpg';
        return image;
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
    render() {
        const width = (GLOBAL.Device_Height / 3 / 9) * 16;
        const height = GLOBAL.Device_Height / 3;

        const channel = this.props.Channel;
        const index = this.props.Index;
        const columns = this.props.Columns;
        const column_type = this.props.ColumnType;
        var currentUnix = moment().unix();
        var epg_check = GLOBAL.EPG.find(e => e.id == channel.channel_id);
        var currentIndex = 0;
        var epg_ = [];
        var currentProgram = [];
        var n = 'No Information Available';
        var time = '';
        var percentageProgram = 0;
        var showPlaybutton = false;

        if (this.props.ChannelPlayingId != undefined) {
            if (
                this.props.Channel.channel_id ==
                this.props.ChannelPlayingId.channel_id
            ) {
                showPlaybutton = true;
            }
        }
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
                    var totalProgram = currentProgram.e - currentProgram.s;
                    percentageProgram =
                        ((currentUnix - currentProgram.s) / totalProgram) * 100;
                }
            }
        }
        return (
            <View style={{ backgroundColor: '#000', margin: 5 }}>
                <TouchableHighlightFocus
                    key={index}
                    onFocus={() => this.focusChannel(channel)}
                    onPress={() => this.selectChannel()}
                    onBlur={() =>
                        this.props.blurChannel != undefined
                            ? this.blurChannel(channel)
                            : null
                    }
                    style={[
                        {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            width: width,
                            height: height + 6,
                            margin: 1,
                        },
                    ]}
                    underlayColor={GLOBAL.Button_Color}
                    {...this.props}
                    //onPress={() => this._startSelectedChannel(channel, index, columns, column_type)}
                    hasTVPreferredFocus={
                        GLOBAL.Channels_Selected_Index == index ? true : false
                    }
                >
                    <View style={{ backgroundColor: '#111' }}>
                        {RenderIf(channel.favorite == true)(
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    zIndex: 5,
                                }}
                            >
                                <FontAwesome
                                    style={[styles.IconsMenu]}
                                    // icon={RegularIcons.heart}
                                    name="heart-o"
                                />
                            </View>,
                        )}
                        {RenderIf(showPlaybutton == true)(
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    left: 0,
                                    bottom: 35,
                                    zIndex: 6,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.50)',
                                        borderRadius: 5,
                                        padding: 5,
                                    }}
                                >
                                    <FontAwesome5
                                        style={[styles.IconsMenu]}
                                        // icon={SolidIcons.playCircle}
                                        name="play-circle"
                                    />
                                </View>
                            </View>,
                        )}
                        <View style={{ flexDirection: 'column' }}>
                            <Image
                                source={{ uri: this.getCurrentImage() }}
                                style={{ width: width - 6, height: height - 6 }}
                            />
                            <View
                                style={{
                                    backgroundColor: '#444',
                                    width: width - 6,
                                    height: 4,
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: '#fff',
                                        width:
                                            ((width - 6) / 100) *
                                            percentageProgram,
                                        height: 4,
                                    }}
                                ></View>
                            </View>
                        </View>
                        <View style={{ position: 'absolute', zIndex: 2 }}>
                            <Image
                                source={require('../../../../images/item_overlay_bottom.png')}
                                style={{ width: width - 6, height: height - 6 }}
                            />
                        </View>
                        <View
                            style={{
                                position: 'absolute',
                                zIndex: 3,
                                bottom: 15,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    paddingHorizontal: 20,
                                    width: width - 20,
                                }}
                            >
                                <View style={{ margin: 5 }}>
                                    <Image
                                        source={{
                                            uri:
                                                GLOBAL.ImageUrlCMS +
                                                (channel.channel_image ==
                                                    undefined
                                                    ? channel.icon_big
                                                    : channel.channel_image),
                                        }}
                                        style={{
                                            height:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_IsWebTV
                                                    ? 80
                                                    : 50,
                                            width:
                                                GLOBAL.Device_IsAppleTV ||
                                                    GLOBAL.Device_IsWebTV
                                                    ? 80
                                                    : 50,
                                        }}
                                    />
                                </View>
                                <View style={{ paddingLeft: 10 }}>
                                    <Text numberOfLines={1} style={[styles.H4]}>
                                        {channel.name}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.Medium,
                                            { width: width - 100 },
                                        ]}
                                    >
                                        {n}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.Medium]}
                                    >
                                        {RenderIf(
                                            this.hasCatchup(channel) == true,
                                        )(
                                            <FontAwesome5
                                                style={
                                                    styles.Medium[
                                                    {
                                                        color: '#fff',
                                                        margin: 10,
                                                    }
                                                    ]
                                                }
                                                // icon={SolidIcons.history}
                                                name="history"
                                            />,
                                        )}
                                        {RenderIf(
                                            this.hasCatchup(channel) == true,
                                        )(
                                            <Text
                                                style={[
                                                    styles.Medium,
                                                    { color: '#ffff' },
                                                ]}
                                            >
                                                &nbsp;
                                            </Text>,
                                        )}
                                        {time}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
}

export default Channel_List_Item_Home_Palladium;
