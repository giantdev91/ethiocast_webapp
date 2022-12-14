import React, {Component} from 'react';
import {View} from 'react-native';
class Loader extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={styles.view_center}>
                <View style={styles.content_container}>
                    <View style={styles.view_center}>
                        {RenderIf(GLOBAL.Device_IsWebTV)(
                            <ActivityIndicator size={170} color={'#e0e0e0'} />,
                        )}
                        {RenderIf(!GLOBAL.Device_IsWebTV)(
                            <ActivityIndicator
                                rotationSpeed={800}
                                size={
                                    this.props.Size != undefined
                                        ? this.props.Size
                                        : GLOBAL.Device_IsAppleTV
                                        ? 250
                                        : 150
                                }
                                trackWidth={2}
                                animating={true}
                                strokeWidth={8}
                                color={'#e0e0e0'}
                            />,
                        )}
                    </View>
                </View>
            </View>
        );
    }
}
export default Loader;
