import React, {Component} from 'react';
import {Actions} from 'react-native-router-flux';
import {View, Animated} from 'react-native';
import BACKGROUND from '../../components/Background';
import UPDATE from '../../../datalayer/update';
import EXPIRE from '../../../datalayer/expire';

class Palladium extends Component {
    constructor(props) {
        super(props);
        // this.hide_menu = this.props.hide_menu;
        // this.hide_header = this.props.hide_header;
        // this.background = this.props.background;
        // this.blur = this.props.blur;
        this.state = {
            focused: false,
        };
        this.animatedValue = new Animated.Value(1);
    }
    componentDidMount() {
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.onKeyUpListener(keyEvent => {
                if (keyEvent.keyCode == 22) {
                    if (this.state.focused == true) {
                        this.setState({
                            focused: false,
                        });
                    }
                }
                if (keyEvent.keyCode == 21) {
                    if (this.state.focused == false) {
                        this.setState({
                            focused: true,
                        });
                    }
                }
                if (GLOBAL.IsHomeLoaded == true) {
                    if (keyEvent.keyCode == 131) {
                        //television
                        GLOBAL.Focus = 'Television';
                        if (GLOBAL.Channels_Selected.length > 0) {
                            GLOBAL.Channel = UTILS.getChannel(
                                GLOBAL.Channels_Selected[0].channel_id,
                            );
                            Actions.Player({fromPage: 'Home'});
                        }
                    }
                    if (keyEvent.keyCode == 132 || keyEvent.keyCode == 172) {
                        //tvguide
                        Actions.EPG();
                    }
                    if (keyEvent.keyCode == 82) {
                        var DefaultMenu =
                            GLOBAL.UserInterface.general.start_screen;
                        switch (DefaultMenu) {
                            case 'Home':
                                GLOBAL.Focus = 'Home';
                                Actions.Home();
                                break;
                            case 'Channels':
                                GLOBAL.Focus = 'Channels';
                                Actions.Channels();
                                break;
                            case 'TV Guide':
                                GLOBAL.Focus = 'TV Guide';
                                Actions.EPG();
                                break;
                            case 'Television':
                                GLOBAL.Focus = 'Television';
                                if (GLOBAL.Channels_Selected.length > 0) {
                                    GLOBAL.Channel = UTILS.getChannel(
                                        GLOBAL.Channels_Selected[0].channel_id,
                                    );
                                    Actions.Player({fromPage: 'Home'});
                                }
                                break;
                            case 'Movies':
                                GLOBAL.Focus = 'Movies';
                                Actions.Movies_Stores();
                                break;
                            case 'Series':
                                GLOBAL.Focus = 'Series';
                                Actions.Series_Stores();
                                break;
                            case 'Music':
                                GLOBAL.Focus = 'Music';
                                Actions.Music_Albums();
                                break;
                            case 'Apps':
                                GLOBAL.Focus = 'Apps';
                                Actions.MarketPlace();
                                break;
                        }
                    }
                }
                return true;
            });
        }
    }
    componentWillUnmount() {
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
    }
    render() {
        return (
            <BACKGROUND
                background={this.props.background}
                blur={this.props.blur}
            >
                {/* {RenderIf(this.props.hide_menu != true && GLOBAL.Device_IsPhone == false && GLOBAL.Device_IsAppleTV == false)(
                    <View style={{ flex: 1, position: 'absolute', width: GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV ? 200 : GLOBAL.Device_IsAppleTV || GLOBAL.Device_Manufacturer == "Samsung Tizen" ? 200 : 100, height: '100%' }}>
                        <MENU focused={this.state.focused} />
                    </View>
                )} */}
                <EXPIRE />
                <UPDATE />

                <View
                    style={{
                        flex: 40,
                    }}
                >
                    {/* {RenderIf(GLOBAL.Device_IsPhone == true && GLOBAL.ShowMenu == true && this.props.hide_menu != true)(
                            <View style={[{ flex: 1, position: 'absolute', zIndex: 99999, left: 20, bottom: 0 }]}>
                                <MENU focused={this.state.focused} />
                            </View>
                        )} */}
                    {this.props.children}
                </View>
            </BACKGROUND>
        );
    }
}
export default Palladium;
