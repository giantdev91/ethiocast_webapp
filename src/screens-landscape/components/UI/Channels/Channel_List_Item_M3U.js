import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';

class Channel_List_Item_M3U extends PureComponent {
    render() {
        const width = this.props.Width;
        const channel = this.props.Channel;
        const index = this.props.Index;
        return (
            <TouchableHighlightFocus
                style={{width: width}}
                key={index}
                BorderRadius={5}
                underlayColor={GLOBAL.Button_Color}
                {...this.props}
                onPress={() => this.props.onPress(channel)}
                hasTVPreferredFocus={index == 0 ? true : false}
            >
                <View
                    style={{
                        borderRadius: 5,
                        backgroundColor: 'rgba(0, 0, 0, 0.40)',
                        width: width - 8,
                        height: GLOBAL.ROW_6,
                    }}
                >
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View
                            style={{
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                padding: 10,
                            }}
                        >
                            <ScaledImage
                                uri={channel.tvg.logo}
                                width={GLOBAL.ROW_6 - 20}
                            />
                        </View>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                padding: 15,
                                backgroundColor: '#222',
                                borderTopRightRadius: 5,
                                borderBottomRightRadius: 5,
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.H3,
                                    {color: '#fff', marginTop: -5},
                                ]}
                            >
                                {channel.name}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default Channel_List_Item_M3U;
