import React, { PureComponent } from 'react';
import { View, Text, Image } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

class Tag_List_Item extends PureComponent {
    render() {
        const width = this.props.Width;
        const movie = this.props.Movie;
        const index = this.props.Index;
        const height = width * 1.5;
        var getProgress = UTILS.getProfile('movie_progress', movie.id);
        var getWatched = false;
        var position = '0';
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
        }
        if (position >= 95) {
            getWatched = true;
        }
        return (
            <View>
                <TouchableHighlightFocus
                    BorderRadius={5}
                    hasTVPreferredFocus={false}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress(movie, index)}
                >
                    <View
                        style={{
                            width: width,
                            borderRadius: 5,
                            borderColor: '#111',
                            borderWidth: 4,
                            backgroundColor: '#000',
                        }}
                    >
                        {RenderIf(getWatched == true)(
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 99999,
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <FontAwesome5
                                    style={[
                                        styles.IconsMenuLarge,
                                        styles.Shadow,
                                    ]}
                                    // icon={RegularIcons.checkCircle}
                                    name="check-circle"
                                />
                            </View>,
                        )}
                        {RenderIf(movie.image != undefined)(
                            <Image
                                source={{ uri: movie.image }}
                                style={{
                                    width: width - 8,
                                    height: (width - 8) * 1.5,
                                    borderRadius: 2,
                                }}
                            />,
                        )}
                        {RenderIf(movie.poster != undefined)(
                            <Image
                                source={{
                                    uri: GLOBAL.ImageUrlCMS + movie.poster,
                                }}
                                style={{
                                    width: width - 8,
                                    height: (width - 8) * 1.5,
                                    borderRadius: 2,
                                }}
                            />,
                        )}
                        {RenderIf(movie.cover != undefined)(
                            <Image
                                source={{ uri: movie.cover }}
                                style={{
                                    width: width - 6,
                                    height: (width - 8) * 1.5,
                                    borderRadius: 2,
                                }}
                            />,
                        )}
                        <View>
                            {RenderIf(position > 0 && position < 95)(
                                <View
                                    style={{
                                        bottom: 1,
                                        position: 'absolute',
                                        borderTopColor: GLOBAL.Button_Color,
                                        borderTopWidth: 4,
                                        width: position * ((width - 8) / 100),
                                        marginTop: 0,
                                        borderTopRightRadius: 100,
                                        borderBottomEndRadius: 100,
                                    }}
                                ></View>,
                            )}
                        </View>
                    </View>
                </TouchableHighlightFocus>
                {GLOBAL.App_Theme != 'Honua' && (
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.Standard,
                            styles.Shadow,
                            {
                                marginLeft: 10,
                                marginTop: -2,
                                marginBottom: 10,
                                width: width - 25,
                            },
                        ]}
                    >
                        {movie.name}
                    </Text>
                )}
            </View>
        );
    }
}
export default Tag_List_Item;
