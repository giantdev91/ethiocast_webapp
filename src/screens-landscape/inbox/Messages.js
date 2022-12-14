import React, {Component} from 'react';
import {
    Text,
    BackHandler,
    TVMenuControl,
    View,
    Dimensions,
    Image,
    FlatList,
} from 'react-native';
import {Actions} from 'react-native-router-flux';

import {Badge} from 'react-native-elements';
import {Button} from 'react-native';
export default class Messages extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = {...themeStyle, ...baseStyle};
        this.state = {
            messages: this.sortMessages(),
            fromhome: false,
            index: '',
            message_focus: true,
            show_modal: false,
        };
        var qty = GLOBAL.Messages.filter(m => m.read == false);
        GLOBAL.Messages_QTY = qty.length;
    }
    sortMessages() {
        var originalMessages = GLOBAL.Messages.filter(m => m.deleted == false);
        GLOBAL.Messages_QTY = originalMessages.length;
        originalMessages.sort((channel1, channel2) => {
            if (channel1.tz > channel2.tz) return -1;
            if (channel1.tz < channel2.tz) return 1;
            return 0;
        });
        GLOBAL.Messages = originalMessages;
        return originalMessages;
    }
    getBack() {
        if (GLOBAL.Focus != 'MessagesVia') {
            Actions.Home();
        } else {
            Actions.Profiles();
        }
    }
    backButton = event => {
        if (event == undefined) {
            return;
        }
        if (
            event.keyCode === 10009 ||
            event.keyCode === 1003 ||
            event.keyCode === 461 ||
            event.keyCode == 8
        ) {
            this.getBack();
        }
    };
    updateDimensions() {
        Actions.Messages();
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                this.getBack();
                return true;
            },
        );
    }
    componentWillUnmount() {
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV == true && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }
    _setFocusOnFirst(index) {
        if (!this.firstInitFocus && GLOBAL.Device_IsTV == true) {
            this.firstInitFocus = true;
            return index === 0;
        }
        return false;
    }

    getMessage(item, index) {
        var out = moment.unix(item.tz).format('MMMM Do YYYY');
        return (
            <TouchableHighlightFocus
                BorderRadius={5}
                disableFocus={this.state.message_focus}
                underlayColor={GLOBAL.Button_Color}
                onPress={() => this._onPressOpenMessage(item, index)}
            >
                <View
                    style={{
                        borderRadius: 5,
                        flexDirection: 'row',
                        height: 100,
                        backgroundColor: 'rgba(0, 0, 0, 0.43)',
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {RenderIf(!item.read)(
                            <Badge value=" " status="primary" />,
                        )}
                    </View>
                    <View style={{flex: 7, flexDirection: 'row'}}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'column',
                                alignSelf: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text numberOfLines={1} style={styles.Date}>
                                {out}
                            </Text>
                            <Text numberOfLines={1} style={styles.Medium}>
                                {item.title}
                            </Text>
                            <Text numberOfLines={1} style={styles.Small}>
                                {item.message}
                            </Text>
                        </View>
                    </View>
                    <View style={{flex: 2, flexDirection: 'row'}}>
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignSelf: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* <TouchableHighlightFocus underlayColor={GLOBAL.Button_Color} onPress={() => this._deleteMessage(index)}>   
                                <Text style={styles.settings_text}>{LANG.getTranslation("delete")}</Text>                
                            </TouchableHighlightFocus>  */}
                        </View>
                    </View>
                </View>
            </TouchableHighlightFocus>
        );
    }
    _onPressOpenMessage(item, index) {
        var out = moment.unix(item.tz).format('MMMM Do YYYY');
        this.setState({
            title: item.title,
            text: item.message,
            image: item.image,
            show_modal: true,
            time: out,
            index: index,
            message_focus: false,
        });
        this.setMessageToRead(index);
    }
    _closeMessage(item) {
        this.setState({
            title: '',
            text: '',
            image: '',
            show_modal: false,
            time: '',
            message_focus: true,
        });
    }
    _deleteMessage(index) {
        var item_ = GLOBAL.Messages.filter(m => m.deleted == false)[index];
        var item = GLOBAL.Messages.find(m => m.id == item_.id);
        item.deleted = true;
        UTILS.storeJson('Messages' + GLOBAL.UserID, GLOBAL.Messages);
        this.setState({
            messages: this.sortMessages(),
            title: '',
            text: '',
            image: '',
            show_modal: false,
            time: '',
            message_focus: true,
        });
    }
    setMessageToRead(index) {
        var item_ = GLOBAL.Messages.filter(m => m.deleted == false)[index];
        var item = GLOBAL.Messages.find(m => m.id == item_.id);
        item.read = true;
        UTILS.storeJson('Messages' + GLOBAL.UserID, GLOBAL.Messages);
        this.setState({
            messages: this.sortMessages(),
        });
    }
    render() {
        return (
            <Container
                needs_notch={true}
                hide_menu={this.state.fromhome}
                hide_header={
                    GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                        ? true
                        : false
                }
            >
                {RenderIf(this.state.show_modal == true)(
                    <Modal
                        Title={this.state.time}
                        Centered={true}
                        TextButton1={'close'}
                        OnPressButton1={() => this._closeMessage()}
                        TextHeader={this.state.text}
                        ShowLoader={false}
                    ></Modal>,
                )}
                {RenderIf(this.state.show_modal == false)(
                    <View
                        style={[
                            styles.content_container_content,
                            {borderRadius: 5, margin: 10},
                        ]}
                    >
                        <View style={{flex: 1}}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={styles.H2}>
                                        {LANG.getTranslation('messagecenter')}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.Subtext,
                                            styles.Width_80_Percent,
                                            styles.CenterText,
                                        ]}
                                    >
                                        {LANG.getTranslation(
                                            'hereyoufindmessagesabout',
                                        )}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    flex: 5,
                                    flexDirection: 'row',
                                    margin: 10,
                                }}
                            >
                                {RenderIf(
                                    this.state.show_modal == false &&
                                        GLOBAL.Device_IsAppleTV == true,
                                )(
                                    <FlatList
                                        data={this.state.messages}
                                        horizontal={false}
                                        //   extraData={this.state.show_modal}
                                        keyExtractor={(item, index) =>
                                            'category_' + index.toString()
                                        }
                                        renderItem={({item, index}) => {
                                            return this.getMessage(item, index);
                                        }}
                                    />,
                                )}
                                {RenderIf(GLOBAL.Device_IsAppleTV == false)(
                                    <FlatList
                                        data={this.state.messages}
                                        horizontal={false}
                                        // extraData={this.state.show_modal}
                                        keyExtractor={(item, index) =>
                                            'category_' + index.toString()
                                        }
                                        renderItem={({item, index}) =>
                                            this.getMessage(item, index)
                                        }
                                    />,
                                )}
                            </View>
                        </View>
                    </View>,
                )}
            </Container>
        );
    }
}
