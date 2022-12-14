import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';

class Series_List_Item extends PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const width = this.props.Width;
        const series = this.props.Series;
        const index = this.props.Index;
        const type = this.props.Type;
        if (type != 'Search') {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    hasTVPreferredFocus={index == 0 ? true : false}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress(series, index)}
                >
                    <View
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            width: width,
                            borderRadius: 5,
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <ScaledImage
                            uri={GLOBAL.ImageUrlCMS + series.poster}
                            width={width - 8}
                        />
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H4,
                                {
                                    color: '#fff',
                                    marginLeft: 10,
                                    marginTop: 10,
                                    width: width - 20,
                                },
                            ]}
                        >
                            {series.name}
                        </Text>
                        {RenderIf(this.props.Type != 'Search')(
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.Medium,
                                    {
                                        marginLeft: 10,
                                        marginTop: -3,
                                        marginBottom: 10,
                                        width: width - 20,
                                    },
                                ]}
                            >
                                {series.episodes.length}{' '}
                                {LANG.getTranslation('episodes')}
                            </Text>,
                        )}
                    </View>
                </TouchableHighlightFocus>
            );
        }
        if (type == 'Search') {
            return (
                <TouchableHighlightFocus
                    BorderRadius={5}
                    style={{width: width}}
                    hasTVPreferredFocus={false}
                    underlayColor={GLOBAL.Button_Color}
                    onPress={() => this.props.onPress(series, index)}
                >
                    <View
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.40)',
                            padding: 5,
                            width: width - 8,
                            borderRadius: 5,
                            borderColor: '#111',
                            borderWidth: 4,
                        }}
                    >
                        <ScaledImage uri={series.image} width={width - 27} />
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Standard,
                                {
                                    color: '#fff',
                                    marginLeft: 5,
                                    marginTop: 5,
                                    width: width - 20,
                                },
                            ]}
                        >
                            {series.name}
                        </Text>
                    </View>
                </TouchableHighlightFocus>
            );
        }
    }
}

export default Series_List_Item;
