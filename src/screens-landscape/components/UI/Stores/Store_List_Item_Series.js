import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';

class Store_List_Item_Series extends PureComponent {
    constructor(props) {
        super(props);
        this._loadSeriesFromStore = this.props._loadSeriesFromStore.bind(this);
    }
    getSubText(series) {
        if (series.season != undefined) {
            var episodes = 0;
            series.season.forEach(element => {
                episodes = episodes + element.episodes.length;
            });
            if (series.season.length == 0) {
                return null;
            } else {
                return (
                    <View>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H5,
                                styles.Bold,
                                {
                                    color: '#fff',
                                    marginTop: 5,
                                    marginHorizontal: 5,
                                },
                            ]}
                        >
                            {series.name}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H5,
                                {color: '#fff', marginHorizontal: 5},
                            ]}
                        >
                            {series.season.length +
                                ' ' +
                                LANG.getTranslation('seasons')}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Medium,
                                {
                                    color: '#fff',
                                    marginTop: -3,
                                    marginHorizontal: 5,
                                    marginBottom: 5,
                                },
                            ]}
                        >
                            {episodes + ' ' + LANG.getTranslation('episodes')}
                        </Text>
                    </View>
                );
            }
        }
        if (series.series != undefined) {
            return (
                <View>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.H5,
                            styles.Bold,
                            {color: '#fff', marginTop: 5, marginHorizontal: 5},
                        ]}
                    >
                        {series.series.length} {LANG.getTranslation('series')}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.Medium,
                            {
                                color: '#fff',
                                marginTop: -3,
                                marginHorizontal: 5,
                                marginBottom: 5,
                            },
                        ]}
                    ></Text>
                </View>
            );
        }
    }

    render() {
        const width = this.props.Width;
        const store = this.props.Store;
        const index = this.props.Index;

        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                underlayColor={GLOBAL.Button_Color}
                hasTVPreferredFocus={
                    this.props.SubStore != undefined &&
                    this.props.SubStore == false
                        ? GLOBAL.Store_Sub_Selected_Index == index
                            ? true
                            : false
                        : GLOBAL.Store_Selected_Index == index
                        ? true
                        : false
                }
                onPress={() => this._loadSeriesFromStore(store, index)}
            >
                <View
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.40)',
                        width: width - 10,
                        borderRadius: 5,
                        borderColor: '#111',
                        borderWidth: 4,
                    }}
                >
                    {(GLOBAL.Device_Model == 'AFTM' ||
                        GLOBAL.Device_Model == 'AFTT' ||
                        GLOBAL.Device_Model == 'AFTA' ||
                        GLOBAL.Device_Model == 'AFTB') && (
                        <Image
                            source={{uri: GLOBAL.ImageUrlCMS + store.logo}}
                            style={{
                                width: width - 18,
                                height: (width - 18) / 1.78,
                                borderTopLeftRadius: 2,
                                borderTopRightRadius: 2,
                            }}
                        ></Image>
                    )}
                    {GLOBAL.Device_Model != 'AFTM' &&
                        GLOBAL.Device_Model != 'AFTT' &&
                        GLOBAL.Device_Model != 'AFTA' &&
                        GLOBAL.Device_Model != 'AFTB' && (
                            <ScaledImage
                                uri={GLOBAL.ImageUrlCMS + store.logo}
                                width={width - 18}
                                style={{
                                    borderTopLeftRadius: 2,
                                    borderTopRightRadius: 2,
                                }}
                            />
                        )}

                    {this.getSubText(store)}
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default Store_List_Item_Series;
