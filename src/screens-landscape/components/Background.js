import React, {Component} from 'react';
import {ImageBackground} from 'react-native';

class Background extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <ImageBackground
                style={{flex: 1, width: null, height: null}}
                imageStyle={{resizeMode: 'cover'}}
                blurRadius={this.props.blur}
                source={{uri: this.props.background}}
            >
                {this.props.children}
            </ImageBackground>
        );
    }
}
export default Background;
