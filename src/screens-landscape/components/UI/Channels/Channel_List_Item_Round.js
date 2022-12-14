import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';
import {Actions} from 'react-native-router-flux';

class Channel_List_Item_Round extends PureComponent {
    _startSelectedChannel(item, index, columns, type) {
        GLOBAL.Channels_Selected_Row = Math.floor(index / columns);
        GLOBAL.Channels_Selected_Index = index;
        GLOBAL.Channel = UTILS.getChannel(item.channel_id);
        Actions.Player({fromPage: 'Channels'});
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
    render() {
        const width = this.props.Width;
        const channel = this.props.Channel;
        const index = this.props.Index;
        const columns = this.props.Columns;
        const column_type = this.props.ColumnType;
        return (
            <TouchableHighlightFocus
                {...this.props}
                BorderRadius={100}
                onPress={() =>
                    this.props.onPress == undefined
                        ? this._startSelectedChannel(
                              channel,
                              index,
                              columns,
                              column_type,
                          )
                        : this.props.onPress(channel, index, true)
                }
                hasTVPreferredFocus={
                    GLOBAL.Channels_Selected_Index == index &&
                    !GLOBAL.Device_IsAppleTV
                        ? true
                        : false
                }
                key={index}
                underlayColor={GLOBAL.Button_Color}
                isTVSelectable={true}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.40)',
                        borderRadius: 100,
                        borderColor: '#111',
                        borderWidth: 4,
                    }}
                >
                    <View
                        style={{
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            padding: 10,
                        }}
                    >
                        <Image
                            source={{
                                uri: GLOBAL.ImageUrlCMS + channel.icon_big,
                            }}
                            style={{
                                margin: 20,
                                height: width / 1.5,
                                width: width / 1.5,
                            }}
                        />
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default Channel_List_Item_Round;
