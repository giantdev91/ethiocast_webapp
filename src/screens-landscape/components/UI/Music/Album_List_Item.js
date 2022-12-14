import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';

class Album_List_Item extends PureComponent {
    render() {
        const width = this.props.Width;
        const album = this.props.Album;
        const index = this.props.Index;
        return (
            <TouchableHighlightFocus
                {...this.props}
                BorderRadius={5}
                style={{
                    width: width,
                    height:
                        width +
                        (GLOBAL.Device_IsWebTV || GLOBAL.Device_IsAppleTV
                            ? 70
                            : 35),
                }}
                onPress={() => this.props.onPress(album, index)}
                hasTVPreferredFocus={
                    GLOBAL.Albums_Selected_Index == index ? true : false
                }
                key={index}
                underlayColor={GLOBAL.Button_Color}
                isTVSelectable={true}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: '#222',
                        width: width - 8,
                        borderRadius: 5,
                    }}
                >
                    <View
                        style={{
                            padding: 5,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <Image
                            source={{uri: GLOBAL.ImageUrlCMS + album.poster}}
                            style={{
                                height: width - 20,
                                width: width - 20,
                                borderRadius: 2,
                            }}
                        />
                    </View>
                    {/* {RenderIf(GLOBAL.Device_IsPhone == false)( */}
                    <View
                        style={{
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            backgroundColor: '#111',
                            paddingLeft: 7,
                            borderBottomLeftRadius: 5,
                            borderBottomRightRadius: 5,
                            height:
                                GLOBAL.Device_IsWebTV || GLOBAL.Device_IsAppleTV
                                    ? 70
                                    : 35,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={[styles.Standard, {width: width - 20}]}
                        >
                            {album.name}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Small,
                                {
                                    width: width - 20,
                                    color: '#999',
                                    marginTop: -3,
                                },
                            ]}
                        >
                            {album.songs.length} {LANG.getTranslation('tracks')}
                        </Text>
                    </View>
                    {/* )} */}
                </View>
            </TouchableHighlightFocus>
        );
    }
}
export default Album_List_Item;
