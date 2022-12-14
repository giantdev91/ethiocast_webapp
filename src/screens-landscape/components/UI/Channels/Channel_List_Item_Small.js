import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';
import {Actions} from 'react-native-router-flux';

class Channel_List_Item_Small extends PureComponent {
    _startSelectedChannel(item, index, columns, type) {
        GLOBAL.Channels_Selected_Row = Math.floor(index / columns);
        GLOBAL.Channels_Selected_Index = index;
        (GLOBAL.Channel = UTILS.getChannel(item.channel_id)),
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
                BorderRadius={5}
                onPress={() =>
                    this._startSelectedChannel(
                        channel,
                        index,
                        columns,
                        column_type,
                    )
                }
                hasTVPreferredFocus={
                    GLOBAL.Channels_Selected_Index == index ? true : false
                }
                key={index}
                underlayColor={GLOBAL.Button_Color}
                isTVSelectable={true}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.20)',
                        width: width - 9,
                        borderRadius: 5,
                        height: width + width / 3,
                        borderColor: '#111',
                        borderWidth: 4,
                        justifyContent: 'flex-end',
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <Image
                            source={{
                                uri: GLOBAL.ImageUrlCMS + channel.icon_big,
                            }}
                            style={{
                                margin: 5,
                                height: width - 28,
                                width: width - 28,
                            }}
                        />
                    </View>
                    {/* {RenderIf(GLOBAL.Device_IsPhone == false)( */}
                    <View
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            padding: 7,
                            borderBottomLeftRadius: 2,
                            borderBottomRightRadius: 2,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[styles.Standard, {width: width - 30}]}
                        >
                            {channel.channel_number}
                        </Text>

                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Small,
                                {width: width - 30, marginTop: -2},
                            ]}
                        >
                            {channel.name}
                        </Text>
                    </View>
                    {/* )} */}
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default Channel_List_Item_Small;
