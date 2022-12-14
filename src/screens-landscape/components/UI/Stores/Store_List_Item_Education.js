import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';

class Store_List_Item_Education extends PureComponent {
    constructor(props) {
        super(props);
        this._loadEducationFromStore =
            this.props._loadEducationFromStore.bind(this);
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
                onPress={() => this._loadEducationFromStore(store, index)}
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
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.H5,
                            styles.Bold,
                            {color: '#fff', marginTop: 5, marginHorizontal: 5},
                        ]}
                    >
                        {store.name}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.H5,
                            styles.Bold,
                            {color: '#fff', marginTop: 5, marginHorizontal: 5},
                        ]}
                    >
                        &nbsp;
                    </Text>
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default Store_List_Item_Education;
