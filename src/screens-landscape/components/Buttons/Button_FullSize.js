import React, {Component} from 'react';
import {View, Text} from 'react-native';
class Button_FullSize extends Component {
    render() {
        return (
            <View
                style={
                    GLOBAL.Device_IsAppleTV
                        ? styles.ButtonFullSizeAppleTV
                        : GLOBAL.Device_IsSmartTV
                        ? styles.ButtonFullSizeSmartTV
                        : styles.ButtonFullSize
                }
            >
                <TouchableHighlightFocus
                    BorderRadius={5}
                    pointerEvents={'box-only'}
                    style={{
                        width: this.props.Width,
                        height: '100%',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}
                    Padding={this.props.Padding}
                    hasTVPreferredFocus={this.props.hasTVPreferredFocus}
                    underlayColor={this.props.underlayColor}
                    onPress={() => this.props.onPress()}
                >
                    <Text
                        style={[
                            this.props.FontSize != null
                                ? this.props.FontSize
                                : styles.Menu,
                        ]}
                    >
                        {this.props.Text}
                    </Text>
                </TouchableHighlightFocus>
            </View>
        );
    }
}
export default Button_FullSize;
