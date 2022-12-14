import React, {PureComponent} from 'react';
import {View, Text, Image} from 'react-native';

class App_List_Item extends PureComponent {
    render() {
        const width = this.props.Width;
        const app = this.props.App;
        const index = this.props.Index;
        return (
            <TouchableHighlightFocus
                {...this.props}
                BorderRadius={5}
                style={{width: width, height: width + 35}}
                onPress={() => this.props.onPress(app)}
                hasTVPreferredFocus={
                    GLOBAL.Apps_Selected_Index == index ? true : false
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
                            flex: 1,
                            padding: 5,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        {RenderIf(
                            app.icon != undefined &&
                                app.url.indexOf('file://') == -1,
                        )(
                            <Image
                                source={{uri: GLOBAL.ImageUrlCMS + app.icon}}
                                style={{
                                    borderRadius: 3,
                                    height: width - 19,
                                    width: width - 19,
                                }}
                            />,
                        )}
                        {RenderIf(
                            app.url != undefined &&
                                app.url.indexOf('file://') > -1,
                        )(
                            <Image
                                source={{uri: app.url}}
                                style={{
                                    borderRadius: 3,
                                    height: width - 20,
                                    width: width - 20,
                                }}
                            />,
                        )}
                    </View>
                    {/* {RenderIf(GLOBAL.Device_IsPhone == false)( */}
                    <View
                        style={{
                            backgroundColor: '#111',
                            padding: 10,
                            borderBottomLeftRadius: 5,
                            borderBottomRightRadius: 5,
                        }}
                    >
                        {RenderIf(app.name != undefined)(
                            <Text
                                numberOfLines={1}
                                style={[styles.Medium, {width: width - 20}]}
                            >
                                {app.name}
                            </Text>,
                        )}
                        {RenderIf(
                            app.appname != undefined && app.name == undefined,
                        )(
                            <Text
                                numberOfLines={1}
                                style={[styles.Medium, {width: width - 20}]}
                            >
                                {app.appname}
                            </Text>,
                        )}
                    </View>
                    {/* )} */}
                </View>
            </TouchableHighlightFocus>
        );
    }
}

export default App_List_Item;
