import React, {Component} from 'react';
import {Actions} from 'react-native-router-flux';
import {View, Animated} from 'react-native';
import MENU from './menu/Menu';
import BACKGROUND from '../../components/Background';
import UPDATE from '../../../datalayer/update';
import EXPIRE from '../../../datalayer/expire';
import OFFLINE from '../../../datalayer/offline';
import MESSAGE from '../../../datalayer/message';
import SUBSCRIPTION from '../../../datalayer/subscription';
import ACTION from '../../../datalayer/action';

class Iridium extends Component {
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
                <View
                    style={{width: '100%', zIndex: 9999, position: 'absolute'}}
                >
                    <ACTION />
                    <SUBSCRIPTION />
                    <MESSAGE />
                </View>
                <OFFLINE />
                <EXPIRE />
                {RenderIf(
                    this.props.hide_menu != true &&
                        GLOBAL.Device_IsPhone == false &&
                        GLOBAL.Device_IsAppleTV == false,
                )(
                    <View
                        style={{
                            marginTop:
                                GLOBAL.Device_IsPhone ||
                                (GLOBAL.Device_IsTablet &&
                                    GLOBAL.Device_Manufacturer == 'Apple')
                                    ? 30
                                    : 0,
                            flex: 1,
                            position: 'absolute',
                            width: GLOBAL.Menu_Width,
                            height: '100%',
                            marginTop:
                                GLOBAL.Device_HasNotch && this.props.needs_notch
                                    ? 35
                                    : 0,
                        }}
                    >
                        <MENU focused={this.state.focused} />
                    </View>,
                )}

                <EXPIRE />
                <UPDATE />
                {RenderIf(GLOBAL.Device_IsAppleTV == false)(
                    <View
                        style={{
                            flex: 40,
                            marginLeft: this.props.hide_menu
                                ? 0
                                : GLOBAL.Menu_Width,
                            marginTop:
                                GLOBAL.Device_HasNotch && this.props.needs_notch
                                    ? 35
                                    : 0,
                        }}
                    >
                        {RenderIf(
                            GLOBAL.Device_IsPhone == true &&
                                GLOBAL.ShowMenu == true &&
                                this.props.hide_menu != true,
                        )(
                            <View
                                style={[
                                    {
                                        flex: 1,
                                        position: 'absolute',
                                        zIndex: 99999,
                                        left: 25,
                                        bottom: 25,
                                    },
                                ]}
                            >
                                <MENU focused={this.state.focused} />
                            </View>,
                        )}
                        {this.props.children}
                    </View>,
                )}
                {RenderIf(GLOBAL.Device_IsAppleTV == true)(
                    <View style={{flex: 40, flexDirection: 'row'}}>
                        {RenderIf(this.props.hide_menu != true)(
                            <View style={{width: 200}}>
                                <MENU focused={this.state.focused} />
                            </View>,
                        )}
                        <View style={{flex: 1}}>{this.props.children}</View>
                    </View>,
                )}
            </BACKGROUND>
        );
    }
}
export default Iridium;
