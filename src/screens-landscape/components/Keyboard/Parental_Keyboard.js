import React, { Component } from 'react';
import { View, Text } from 'react-native';
// import {SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Actions } from 'react-native-router-flux';

export default class Parental_Keyboard extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };
        GLOBAL.Focus = 'Outside';
        GLOBAL.SearchInput = '';
        this.state = {
            background: GLOBAL.Background,
            text: this.props.Value,
        };
    }
    getBackPreviousScreen() {
        if (
            this.props.PlaceHolder == 'Your current Code' ||
            this.props.PlaceHolder == 'Your new Code'
        ) {
            Actions.Settings({ settings_page: 'Childlock' });
        }
    }
    submitToPreviousScreen() {
        if (this.props.PlaceHolder == 'Your current Code') {
            Actions.Settings({
                settings_page: 'Childlock',
                Old: this.state.text,
                New: this.props.New,
            });
        }
        if (this.props.PlaceHolder == 'Your new Code') {
            Actions.Settings({
                settings_page: 'Childlock',
                New: this.state.text,
                Old: this.props.Old,
            });
        }
    }
    onChangeText = value => {
        this.setState({ text: value });
        this.props.onChangeText(value);
    };
    getIcon() {
        if (this.props.PlaceHolder == 'Your current Code') {
            return SolidIcons.lock;
        }
        if (this.props.PlaceHolder == 'Your new Code') {
            return SolidIcons.lock;
        }
    }
    render() {
        return (
            <View style={[{ flexDirection: 'column', flex: 1, margin: 10 }]}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 4, flexDirection: 'column' }}>
                        <Keyboard
                            MaxLength={4}
                            WrongCode={this.props.WrongCode}
                            HideVoice={true}
                            SecureInput={true}
                            NumericOnly={true}
                            Parental={this.props.Value}
                            Width={GLOBAL.Device_IsAppleTV ? 300 : 200}
                            Margin={10}
                            Icon={"lock"}
                            PlaceHolder={this.props.PlaceHolder}
                            Submit={this.onChangeText}
                            ShowChars={true}
                            ShowDomains={true}
                            LiveReload={true}
                        />
                    </View>
                </View>
            </View>
        );
    }
}
