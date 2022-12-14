import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';
class Movie_List_Item_List extends PureComponent {
    render() {
        const movie = this.props.Movie;
        const index = this.props.Index;
        var getProgress = UTILS.getProfile('movie_progress', movie.id);
        var getWatched = false;
        var position = '0';
        if (getProgress != null) {
            var percentageVideo = getProgress.position / getProgress.total;
            position = percentageVideo * 100;
        }
        if (position > 95) {
            getWatched = true;
        }
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                hasTVPreferredFocus={
                    GLOBAL.Movie_Selected_Index == index ? true : false
                }
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this.props.onPress(movie, index)}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        backgroundColor: 'rgba(0, 0, 0, 0.60)',
                        height:
                            GLOBAL.Device_IsWebTV || GLOBAL.Device_IsAppleTV
                                ? 250
                                : 140,
                        width:
                            GLOBAL.COL_REMAINING_1 -
                            GLOBAL.COL_REMAINING_5 -
                            20,
                        alignItems: 'center',
                        padding: 20,
                    }}
                >
                    <Image
                        source={{uri: GLOBAL.ImageUrlCMS + movie.poster}}
                        style={{
                            width:
                                GLOBAL.Device_IsWebTV || GLOBAL.Device_IsAppleTV
                                    ? 150
                                    : 75,
                            height:
                                GLOBAL.Device_IsWebTV || GLOBAL.Device_IsAppleTV
                                    ? 150 * 1.5
                                    : 75 * 1.5,
                        }}
                    />
                    <View
                        style={{
                            justifyContent: 'flex-start',
                            height: 110,
                            margin: 20,
                        }}
                    >
                        <Text numberOfLines={1} style={[styles.H3]}>
                            {movie.name}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Medium,
                                {marginBottom: 10, color: '#999'},
                            ]}
                        >
                            {movie.year}
                        </Text>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default Movie_List_Item_List;
