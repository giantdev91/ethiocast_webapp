import React, {Component} from 'react';
import {View, Text} from 'react-native';
class Button_Small extends Component {
    render() {
        return (
            <View
                style={[
                    GLOBAL.Device_IsAppleTV
                        ? styles.ButtonSmallAppleTV
                        : GLOBAL.Device_IsSmartTV
                        ? styles.ButtonSmallSmartTV
                        : styles.ButtonSmall,
                    {backgroundColor: '#000', borderRadius: 5},
                ]}
            >
                <TouchableHighlightFocus
                    BorderRadius={5}
                    style={[
                        GLOBAL.Device_IsAppleTV
                            ? styles.ButtonSmallAppleTV
                            : GLOBAL.Device_IsSmartTV
                            ? styles.ButtonSmallSmartTV
                            : styles.ButtonSmall,
                        {
                            backgroundColor: GLOBAL.Device_IsSmartTV
                                ? 'transparent'
                                : '#000',
                            borderRadius: 5,
                        },
                    ]}
                    Padding={this.props.Padding}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={this.props.underlayColor}
                    onPress={() => this.props.onPress()}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                        }}
                    >
                        <Text style={styles.Menu}>{this.props.Text}</Text>
                    </View>
                </TouchableHighlightFocus>
            </View>
        );
    }
}
export default Button_Small;
