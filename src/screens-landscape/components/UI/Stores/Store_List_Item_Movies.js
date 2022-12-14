import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';

class Store_List_Item_Movies extends PureComponent {
    constructor(props) {
        super(props);
        this._loadMoviesFromStore = this.props._loadMoviesFromStore.bind(this);
    }
    getSubText(store) {
        if (store.genres != undefined) {
            var movies = 0;
            store.genres.forEach(element => {
                movies = movies + element.movies.length;
            });
            if (store.genres.length == 0) {
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
                            {LANG.getTranslation('more')}{' '}
                            {LANG.getTranslation('movies')}
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
                            &nbsp;
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.Medium,
                                {
                                    color: '#fff',
                                    marginTop: 0,
                                    marginHorizontal: 5,
                                    marginBottom: 5,
                                },
                            ]}
                        >
                            &nbsp;
                        </Text>
                    </View>
                );
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
                            {store.name}
                        </Text>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.H5,
                                {color: '#fff', marginHorizontal: 5},
                            ]}
                        >
                            {store.genres.length +
                                '  ' +
                                LANG.getTranslation('categories')}
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
                            {movies + ' ' + LANG.getTranslation('movies')}
                        </Text>
                    </View>
                );
            }
        }
    }
    getFocus(index) {
        if (this.props.SubStore != undefined && this.props.SubStore == true) {
            if (index == GLOBAL.Store_Sub_Selected_Index) {
                return true;
            } else {
                return false;
            }
        } else {
            if (index == GLOBAL.Store_Selected_Index) {
                return true;
            } else {
                return false;
            }
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
                    this.props.SubStore == true
                        ? GLOBAL.Store_Sub_Selected_Index == index
                            ? true
                            : false
                        : GLOBAL.Store_Selected_Index == index
                        ? true
                        : false
                }
                onPress={() => this._loadMoviesFromStore(store, index)}
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
                                height: (width - 18) / 3,
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
export default Store_List_Item_Movies;
