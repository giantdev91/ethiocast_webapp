//import liraries
import React, {Component} from 'react';
import {View} from 'react-native';
import BACKGROUND from '../../../screens-landscape/components/Background';
class Default extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <BACKGROUND background={this.props.background}>
                <View
                    style={{
                        flex: 40,
                        marginTop:
                            GLOBAL.Device_HasNotch && this.props.needs_notch
                                ? 30
                                : 0,
                    }}
                >
                    {this.props.children}
                </View>
            </BACKGROUND>
        );
    }
}
export default Default;
