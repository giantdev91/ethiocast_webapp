import moment from 'moment';
import React, { PureComponent } from 'react';
import { View, Text, Image } from 'react-native';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

import { Actions } from 'react-native-router-flux';

class Channel_List_Item_Big extends PureComponent {
    _startSelectedChannel(item, index, columns, type) {
        GLOBAL.Channels_Selected_Row = Math.floor(index / columns);
        GLOBAL.Channels_Selected_Index = index;
        GLOBAL.Channel = UTILS.getChannel(item.channel_id);
        if (GLOBAL.Channel != undefined) {
            if (GLOBAL.Channel.is_flussonic != undefined) {
                Actions.Player({ fromPage: this.props.FromPage });
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
    getCurrentImage = (url, start) => {
        var splitUrl = url.toString().split('/');
        var timePart = moment.unix(start).format('/YYYY/MM/DD/hh/mm/ss');
        // var image = splitUrl[0] + "//" + splitUrl[2] + "/" + splitUrl[3] + timePart + "-preview.jpg?time=" + moment().unix();
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
    getCurrentImageNoDvr = (url, start) => {
        if (url != undefined) {
            var splitUrl = url.toString().split('/');
            var image =
                splitUrl[0] +
                '//' +
                splitUrl[2] +
                '/' +
                splitUrl[3] +
                '/' +
                'preview.jpg?time=' +
                moment().unix();
            return image;
        } else {
            return null;
        }
    };
    getLiveImage = (url, start) => {
        if (url != undefined) {
            var splitUrl = url.toString().split('/');
            var timePart = moment.unix(start).format('/YYYY/MM/DD/hh/mm/ss');
            var image =
                splitUrl[0] +
                '//' +
                splitUrl[2] +
                '/' +
                splitUrl[3] +
                '/preview.jpg';
            return image;
        } else {
            return null;
        }
    };

    render() {
        const width = this.props.Width;
        const channel = this.props.Channel;
        const index = this.props.Index;
        const columns = this.props.Columns;
        const column_type = this.props.ColumnType;
        var currentUnix = moment().unix();
        var epg_check = GLOBAL.EPG.find(
            e =>
                e.id ==
                (this.props.FromPage == 'Search'
                    ? channel.id
                    : channel.channel_id),
        );
        var currentIndex = 0;
        var epg_ = [];
        var currentProgram = [];
        var n = 'No Information Available';
        var time = '';
        var percentageProgram = 0;
        if (epg_check != undefined) {
            epg_ = epg_check.epgdata;
            currentIndex = epg_.findIndex(function (element) {
                return element.s <= currentUnix && element.e >= currentUnix;
            });
            if (currentIndex != undefined) {
                if (epg_[currentIndex] != null) {
                    currentProgram = epg_[currentIndex];
                    var totalProgram = currentProgram.e - currentProgram.s;
                    percentageProgram =
                        (currentUnix - currentProgram.s) / totalProgram;
                    time =
                        moment
                            .unix(currentProgram.s)
                            .format('ddd ' + GLOBAL.Clock_Setting) +
                        ' - ' +
                        moment
                            .unix(currentProgram.e)
                            .format(GLOBAL.Clock_Setting);
                    n = currentProgram.n;
                }
            }
        }
        var widht_height = GLOBAL.ROW_6;
        var image = '';
        if (this.props.ShowPreview != undefined) {
            image = this.getLiveImage(channel.url_high, currentProgram.s);
        }
        var parentalControl = false;
        if (channel.childlock == 1) {
            parentalControl = true;
        }

        return (
            <TouchableHighlightFocus
                style={{ width: width - 2 }}
                key={index}
                BorderRadius={5}
                underlayColor={GLOBAL.Button_Color}
                {...this.props}
                onFocusExtra={() =>
                    this.props.onFocusExtra != undefined
                        ? this.props.onFocusExtra(channel, index, currentIndex)
                        : null
                }
                onPress={() =>
                    this.props.onPress == undefined
                        ? this._startSelectedChannel(
                            channel,
                            index,
                            columns,
                            column_type,
                        )
                        : this.props.onPress(channel, index, false)
                }
                hasTVPreferredFocus={
                    GLOBAL.Channels_Selected_Index == index
                        ? this.props.FromPage != undefined &&
                            this.props.FromPage == 'Search'
                            ? false
                            : true
                        : false
                }
            >
                <View
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.60)',
                        width: width - 10,
                        borderRadius: 5,
                        borderColor: '#111',
                        borderWidth: 4,
                        height:
                            this.props.ShowPreview != undefined
                                ? '100%'
                                : GLOBAL.ROW_5 - 10,
                    }}
                >
                    {RenderIf(
                        this.props.Player == undefined &&
                        this.props.ShowPreview != undefined,
                    )(
                        <View
                            style={{
                                backgroundColor: '#000',
                                borderTopLeftRadius: 2,
                                borderTopRightRadius: 2,
                            }}
                        >
                            <Image
                                source={{ uri: image }}
                                resizeMethod={'resize'}
                                resizeMode={'contain'}
                                style={{
                                    borderTopLeftRadius: 2,
                                    borderTopRightRadius: 2,
                                    width: width - 18,
                                    height: ((width - 18) / 16) * 9,
                                }}
                            ></Image>

                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                }}
                            >
                                {RenderIf(channel.icon_big != undefined)(
                                    <Image
                                        source={{
                                            uri:
                                                GLOBAL.ImageUrlCMS +
                                                channel.icon_big,
                                        }}
                                        style={{
                                            height: (widht_height - 19) / 2,
                                            width: (widht_height - 19) / 2,
                                            margin: 10,
                                        }}
                                    />,
                                )}
                                {RenderIf(channel.image != undefined)(
                                    <Image
                                        source={{ uri: channel.image }}
                                        style={{
                                            height: (widht_height - 19) / 2,
                                            width: (widht_height - 19) / 2,
                                            margin: 10,
                                        }}
                                    />,
                                )}
                                {RenderIf(channel.channel_image != undefined)(
                                    <Image
                                        source={{
                                            uri:
                                                GLOBAL.ImageUrlCMS +
                                                channel.channel_image,
                                        }}
                                        style={{
                                            height: (widht_height - 19) / 2,
                                            width: (widht_height - 19) / 2,
                                            margin: 10,
                                        }}
                                    />,
                                )}
                            </View>
                        </View>,
                    )}
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            margin:
                                this.props.ShowPreview == undefined ? 0 : 10,
                        }}
                    >
                        <View
                            style={{
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                            }}
                        >
                            {RenderIf(
                                channel.icon_big != undefined &&
                                this.props.ShowPreview == undefined,
                            )(
                                <Image
                                    source={{
                                        uri:
                                            GLOBAL.ImageUrlCMS +
                                            channel.icon_big,
                                    }}
                                    style={{
                                        height: widht_height - 20,
                                        width: widht_height - 20,
                                        margin: 10,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                channel.image != undefined &&
                                this.props.ShowPreview == undefined,
                            )(
                                <Image
                                    source={{ uri: channel.image }}
                                    style={{
                                        height: widht_height - 20,
                                        width: widht_height - 20,
                                        margin: 10,
                                    }}
                                />,
                            )}
                            {RenderIf(
                                channel.channel_image != undefined &&
                                this.props.ShowPreview == undefined,
                            )(
                                <Image
                                    source={{
                                        uri:
                                            GLOBAL.ImageUrlCMS +
                                            channel.channel_image,
                                    }}
                                    style={{
                                        height: widht_height - 20,
                                        width: widht_height - 20,
                                        margin: 10,
                                    }}
                                />,
                            )}
                        </View>
                        <View
                            style={{
                                backgroundColor:
                                    this.props.ShowPreview != undefined
                                        ? 'transparent'
                                        : 'rgba(0, 0, 0, 0.30)',
                                flex: 1,
                                flexDirection: 'column',
                                padding: GLOBAL.Extra_Padding,
                                paddingLeft: GLOBAL.Extra_Padding + 5,
                                borderTopRightRadius: 2,
                                borderBottomRightRadius: 2,
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.H5,
                                    styles.Bold,
                                    {
                                        color: '#fff',
                                        marginTop: 5,
                                        marginLeft: 5,
                                        paddingRight: 10,
                                        paddingBottom: 5,
                                    },
                                ]}
                            >
                                {channel.channel_number}.{channel.name}
                            </Text>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        color: '#fff',
                                        marginTop: -5,
                                        marginLeft: 5,
                                        paddingRight: 10,
                                    },
                                ]}
                            >
                                {n}
                            </Text>
                            {this.props.Player != undefined && (
                                <View
                                    style={{
                                        marginLeft: 5,
                                        marginTop: 2,
                                        borderTopWidth: 2,
                                        borderTopColor: '#999',
                                        width:
                                            (width - widht_height - 65) *
                                            percentageProgram,
                                    }}
                                ></View>
                            )}
                            {this.props.Player == undefined && (
                                <View
                                    style={{
                                        marginLeft: 5,
                                        marginTop: 2,
                                        borderTopWidth: 2,
                                        borderTopColor: '#999',
                                        width:
                                            (width - widht_height - 30) *
                                            percentageProgram,
                                    }}
                                ></View>
                            )}
                            <Text
                                style={[styles.Medium, { marginLeft: 5 }]}
                                numberOfLines={1}
                            >
                                {time}
                            </Text>
                            <View
                                style={{
                                    position: 'absolute',
                                    right: GLOBAL.Device_IsWebTV
                                        ? 5
                                        : GLOBAL.Extra_Padding + 5,
                                    bottom: GLOBAL.Device_IsWebTV
                                        ? 5
                                        : GLOBAL.Extra_Padding + 2,
                                    flexDirection: 'row',
                                }}
                            >
                                {RenderIf(
                                    GLOBAL.UserInterface.general
                                        .enable_catchuptv == true &&
                                    (channel.is_flussonic == 1 ||
                                        channel.is_dveo == 1),
                                )(
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
                                    </View>,
                                )}
                                {/* {RenderIf(GLOBAL.UserInterface.general.enable_catchuptv == true && (channel.is_flussonic == 1 || channel.is_dveo == 1))(
                                    <View style={{ backgroundColor: 'royalblue', borderRadius: 100, marginHorizontal: 2, justifyContent: 'center', alignContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
                                        <FontAwesome5 style={[styles.IconsTelevision, { color: '#fff', margin: GLOBAL.Device_IsAppleTV ? 10 : 4 }]} icon={SolidIcons.recycle} />
                                    </View>
                                )} */}
                                {RenderIf(
                                    GLOBAL.UserInterface.general
                                        .enable_recordings == true &&
                                    (channel.is_flussonic == 1 ||
                                        channel.is_dveo == 1),
                                )(
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
                                    </View>,
                                )}
                            </View>
                        </View>
                        {RenderIf(this.props.Player != undefined)(
                            <View
                                style={{
                                    backgroundColor: '#111',
                                    justifyContent: 'center',
                                    padding: 10,
                                }}
                            >
                                <FontAwesome5
                                    style={[
                                        styles.IconsTelevision,
                                        { color: '#fff' },
                                    ]}
                                    // icon={SolidIcons.arrowRight}
                                    name="arrow-right"
                                />
                            </View>,
                        )}
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default Channel_List_Item_Big;
