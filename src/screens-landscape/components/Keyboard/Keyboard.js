import React, { PureComponent } from 'react';
import { View, TextInput, Text, Dimensions } from 'react-native';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import alfabets from './../../../languages/alphabets';
import * as Animatable from 'react-native-animatable';
//import Voice from '@react-native-voice/voice';

class Keyboard extends PureComponent {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };

        if (GLOBAL.Device_Width == 0) {
            var width = Dimensions.get('window').width;
            GLOBAL.Device_Width = width;
        }

        var keyWidth =
            GLOBAL.Device_Width /
            (GLOBAL.Device_IsAndroidTV ||
                GLOBAL.Device_IsFireTV ||
                GLOBAL.Device_IsAppleTV ||
                GLOBAL.Device_IsSmartTV
                ? 29
                : 33);
        if (this.props.SecureInput != undefined) {
            keyWidth = keyWidth * 1.5;
        }
        if (
            GLOBAL.Device_IsPhone &&
            this.props.SecureInput != undefined &&
            this.props.NumericOnly != undefined
        ) {
            keyWidth = keyWidth * 3;
        }

        var alfaIndex = alfabets.alphabet.findIndex(
            a => a.language == GLOBAL.Selected_Language,
        );
        if (alfabets.alphabet[alfaIndex] == undefined) {
            alfaIndex = 1;
        }
        this.state = {
            keyWidth: keyWidth,
            alphabet: alfabets.alphabet[alfaIndex].keyboard,
            inputText:
                this.props.OldSearch != undefined && this.props.OldSearch != ''
                    ? this.props.OldSearch
                    : this.props.Parental != undefined
                        ? this.props.Parental
                        : GLOBAL.SearchInput,
            alfaIndex: alfaIndex,
            alfaLanguage: GLOBAL.Selected_Language,
            caps: false,
            voiceEnabled: false,
            showVoiceButton: false,
            speechResults: [],
        };

        if (
            (GLOBAL.Device_System == 'Apple' && !GLOBAL.Device_IsAppleTV) ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.onSpeechEnd = this.onSpeechEndHandler.bind(this);
            Voice.onSpeechResults = this.onSpeechResultsHandler.bind(this);
        }
    }
    componentDidMount() {
        if (
            (GLOBAL.Device_System == 'Apple' && !GLOBAL.Device_IsAppleTV) ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.isAvailable().then(result => {
                this.setState({ showVoiceButton: true });
            });
        }
        if (
            GLOBAL.Device_IsTV == true &&
            GLOBAL.Device_IsAppleTV == false &&
            this.props.Parental != undefined
        ) {
            KeyEvent.onKeyDownListener(keyEvent => {
                if (keyEvent.keyCode >= 48 && keyEvent.keyCode <= 57) {
                    this.addToSearch(keyEvent.keyCode - 48);
                }
                if (keyEvent.keyCode >= 65 && keyEvent.keyCode <= 90) {
                    this.addToSearch(keyEvent.key);
                }
                return true;
            });
        }
        if (GLOBAL.Device_IsWebTV && this.props.Parental != undefined) {
            document.addEventListener('keydown', this.keyListener, false);
        }
    }
    onSpeechEndHandler = e => { };
    onSpeechResultsHandler = e => {
        if (e.value != '') {
            try {
                var newInput = e.value;
                var tempInput = newInput;
                var splitInput = newInput.toString().split(',');
                var removeItem = tempInput.shift();
                if (splitInput.length > 0) {
                    Voice.stop().then(() => {
                        this.setState({
                            voiceEnabled: false,
                            inputText: splitInput[0],
                            speechResults: tempInput,
                        });
                        if (this.props.LiveReload != undefined) {
                            this.props.Submit(splitInput[0]);
                        }
                    });
                }
            } catch (e) { }
        }
    };

    onStartVoice = async () => {
        if (this.state.voiceEnabled == false) {
            this.setState({
                voiceEnabled: true,
                inputText: '',
                speechResults: [],
            });
            try {
                await Voice.start('en-US');
            } catch (e) { }
        } else {
            this.setState({
                voiceEnabled: false,
            });
            Voice.stop();
        }
    };

    keyListener = event => {
        if (event.keyCode >= 48 && event.keyCode <= 57) {
            this.addToSearch(event.keyCode - 48);
        }
        if (event.keyCode >= 65 && event.keyCode <= 90) {
            this.addToSearch(event.key);
        }
    };
    componentWillUnmount() {
        if (
            (GLOBAL.Device_System == 'Apple' && !GLOBAL.Device_IsAppleTV) ||
            GLOBAL.Device_System == 'Android' ||
            GLOBAL.Device_System == 'Amazon'
        ) {
            Voice.destroy().then(Voice.removeAllListeners);
        }
        if (GLOBAL.Device_IsWebTV && this.props.Parental != undefined) {
            document.removeEventListener('keydown', this.keyListener, false);
        }
        if (
            GLOBAL.Device_IsTV == true &&
            GLOBAL.Device_IsAppleTV == false &&
            this.props.Parental != undefined
        ) {
            KeyEvent.removeKeyDownListener();
        }
    }
    addToInput(text) {
        try {
            this.setState(
                {
                    inputText: text,
                },
                () => {
                    if (this.props.LiveReload != undefined) {
                        this.props.Submit(text);
                    }
                },
            );
        } catch (e) { }
    }
    addToSearch(input) {
        try {
            var newInput =
                this.state.inputText +
                (this.state.caps ? input.toUpperCase() : input.toLowerCase());
            if (this.props.MaxLength != undefined) {
                if (newInput.length < 5) {
                    this.setState({
                        inputText: newInput,
                    });
                    if (this.props.LiveReload != undefined) {
                        this.props.Submit(newInput);
                    }
                }
            } else {
                this.setState({
                    inputText: newInput,
                });
                if (this.props.LiveReload != undefined) {
                    this.props.Submit(newInput);
                }
            }
        } catch (e) { }
    }
    addToSearchSpeech(input) {
        try {
            this.setState({
                inputText: input,
            });
            if (this.props.LiveReload != undefined) {
                this.props.Submit(input);
            }
        } catch (e) { }
    }
    removeFromSearch() {
        try {
            if (this.state.inputText == undefined) {
                return;
            }
            if (this.state.inputText == null) {
                return;
            }
            if (this.state.inputText.length == 0) {
                return;
            }
            this.setState(
                {
                    inputText: this.state.inputText.substring(
                        0,
                        this.state.inputText.length - 1,
                    ),
                },
                () => {
                    if (this.props.LiveReload != undefined) {
                        this.props.Submit(this.state.inputText);
                    }
                },
            );
        } catch (e) { }
    }
    submitSearch() {
        this.props.Submit(this.state.inputText);
    }
    clearAll() {
        if (this.state.inputText == undefined) {
            return;
        }
        if (this.state.inputText == null) {
            return;
        }
        if (this.state.inputText.length == 0) {
            return;
        }
        try {
            this.setState(
                {
                    inputText: '',
                },
                () => {
                    if (this.props.LiveReload != undefined) {
                        this.props.Submit(this.state.inputText);
                    }
                },
            );
        } catch (e) { }
    }
    changeLanguage() {
        try {
            var newIndex = this.state.alfaIndex + 1;
            if (newIndex < alfabets.alphabet.length) {
                this.setState({
                    alphabet: alfabets.alphabet[newIndex].keyboard,
                    alfaIndex: newIndex,
                    alfaLanguage: alfabets.alphabet[newIndex].language,
                });
            } else {
                this.setState({
                    alphabet: alfabets.alphabet[0].keyboard,
                    alfaIndex: 0,
                    alfaLanguage: alfabets.alphabet[0].language,
                });
            }
        } catch (e) { }
    }
    getSecureInput() {
        var l = this.state.inputText.length;
        var input = '';
        for (var i = 0; i < l; i++) {
            if (i < 11) {
                input += '* ';
            }
        }
        return input;
    }
    toCaps() {
        try {
            if (this.state.caps == true) {
                this.setState({
                    caps: false,
                });
            } else {
                this.setState({
                    caps: true,
                });
            }
        } catch (e) { }
    }
    goingNowWhere() {
        return;
    }
    getKeyColumns() {
        var columns = Math.floor(
            (this.props.Width - this.props.Margin) / (this.state.keyWidth + 2),
        );
        return columns;
    }
    getKeyColumnHeight() {
        var columns = Math.floor(
            (this.props.Width - this.props.Margin) / (this.state.keyWidth + 2),
        );
        var rows = Math.ceil(this.state.alphabet.length / columns);
        return (
            (GLOBAL.Device_Manufacturer == 'Samsung Tizen' ||
                GLOBAL.Device_IsWebTV
                ? 65
                : 45) * rows
        );
    }

    render() {
        let NumericOnly = this.props.NumericOnly;
        let NumbersOnly = this.props.NumbersOnly;
        let PlayerSearch = this.props.PlayerSearch;
        let ShowChars = this.props.ShowChars;
        let ShowDomains = this.props.ShowDomains;
        let SecureInput = this.props.SecureInput;
        let PlaceHolder = this.props.PlaceHolder;
        let ShowExtras = this.props.ShowExtras;
        const alfabet = this.state.alphabet;
        return (
            <View
                style={{
                    borderRadius: 5,
                    flex: 1,
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    marginBottom: 0,
                }}
            >
                {RenderIf(this.props.WrongCode == true)(
                    <View>
                        <Text style={styles.Standard}>
                            {LANG.getTranslation('parental_wrong_code')}
                        </Text>
                    </View>,
                )}
                {RenderIf(this.state.voiceEnabled == true)(
                    <View
                        style={{
                            borderRadius: 5,
                            backgroundColor: '#222',
                            position: 'absolute',
                            width: GLOBAL.COL_10,
                            height: GLOBAL.COL_10,
                            zIndex: 99999,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            flex: 1,
                        }}
                    >
                        <Animatable.View
                            animation="pulse"
                            easing="ease-in-out"
                            iterationCount="infinite"
                        >
                            <FontAwesome5
                                style={[
                                    styles.Shadow,
                                    {
                                        color: '#fff',
                                        fontSize: 50,
                                        padding: 0,
                                        margin: 0,
                                    },
                                ]}
                                // icon={SolidIcons.microphone}
                                name="microphone"
                            />
                        </Animatable.View>
                    </View>,
                )}
                <View
                    style={{
                        width: this.props.Width - this.props.Margin,
                        flexDirection: 'row',
                        backgroundColor:
                            this.props.PlayerSearch != undefined
                                ? '#222'
                                : '#000',
                        height:
                            GLOBAL.Device_Manufacturer == 'Samsung Tizen' ||
                                GLOBAL.Device_IsWebTV
                                ? 65
                                : GLOBAL.Device_IsAppleTV
                                    ? 70
                                    : 45,
                        marginVertical: this.props.Margin,
                        borderRadius: 5,
                    }}
                >
                    {RenderIf(this.props.EnableBackButton != undefined)(
                        <View
                            style={{
                                borderTopLeftRadius: 5,
                                borderBottomLeftRadius: 5,
                                backgroundColor: '#333',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height:
                                    GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen' || GLOBAL.Device_IsWebTV
                                        ? 65
                                        : GLOBAL.Device_IsAppleTV
                                            ? 70
                                            : 45,
                                width:
                                    GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen' || GLOBAL.Device_IsWebTV
                                        ? 65
                                        : 45,
                            }}
                        >
                            <ButtonRounded
                                Size={40}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Icon={"arrow-left"}
                                onPress={() => this.props.BackPage()}
                            ></ButtonRounded>
                        </View>,
                    )}
                    {RenderIf(
                        this.state.showVoiceButton == true &&
                        this.props.HideVoice == undefined,
                    )(
                        <View
                            style={{
                                backgroundColor: '#333',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height:
                                    GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen' || GLOBAL.Device_IsWebTV
                                        ? 65
                                        : GLOBAL.Device_IsAppleTV
                                            ? 70
                                            : 45,
                                width:
                                    GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen' || GLOBAL.Device_IsWebTV
                                        ? 65
                                        : 45,
                            }}
                        >
                            <ButtonRounded
                                Size={40}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Icon={"microphone"}
                                onPress={() => this.onStartVoice()}
                            ></ButtonRounded>
                        </View>,
                    )}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height:
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen' ||
                                    GLOBAL.Device_IsWebTV
                                    ? 65
                                    : GLOBAL.Device_IsAppleTV
                                        ? 70
                                        : 45,
                            width:
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen' ||
                                    GLOBAL.Device_IsWebTV
                                    ? 65
                                    : GLOBAL.Device_IsAppleTV
                                        ? 70
                                        : 45,
                        }}
                    >
                        (this.props.Icon == 'heart' || this.props.Icon == 'heart-o') ? (
                        <FontAwesome
                            style={[
                                styles.Shadow,
                                {
                                    fontSize:
                                        SecureInput != undefined ||
                                            this.props.PlayerSearch != undefined
                                            ? 15
                                            : 20,
                                    color: '#fff',
                                },
                            ]}
                            // icon={this.props.Icon}
                            name={this.props.Icon}
                        />
                        ) : (
                        <FontAwesome5
                            style={[
                                styles.Shadow,
                                {
                                    fontSize:
                                        SecureInput != undefined ||
                                            this.props.PlayerSearch != undefined
                                            ? 15
                                            : 20,
                                    color: '#fff',
                                },
                            ]}
                            // icon={this.props.Icon}
                            name={this.props.Icon}
                        />
                        )

                    </View>
                    {RenderIf(
                        this.state.inputText.length == 0 &&
                        SecureInput == undefined,
                    )(
                        <View
                            style={{
                                position: 'absolute',
                                left:
                                    this.props.EnableBackButton != undefined &&
                                        this.state.showVoiceButton
                                        ? 100
                                        : this.props.EnableBackButton !=
                                            undefined &&
                                            !this.state.showVoiceButton
                                            ? 50
                                            : this.props.EnableBackButton ==
                                                undefined &&
                                                this.state.showVoiceButton
                                                ? 50
                                                : 0,
                                height:
                                    GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen' || GLOBAL.Device_IsWebTV
                                        ? 65
                                        : GLOBAL.Device_IsAppleTV
                                            ? 70
                                            : 45,
                                paddingLeft: GLOBAL.Device_IsWebTV
                                    ? GLOBAL.Device_Manufacturer ==
                                        'Samsung Tizen' ||
                                        GLOBAL.Device_IsWebTV
                                        ? 65
                                        : 45
                                    : GLOBAL.Device_IsAppleTV
                                        ? 70
                                        : 40,
                                justifyContent: 'center',
                                width: GLOBAL.Device_IsPhone
                                    ? GLOBAL.Device_Width / 1.2 - 50
                                    : '100%',
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={[
                                    GLOBAL.Device_IsPhone ||
                                        GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? styles.H4
                                        : styles.H3,
                                    {
                                        color: '#777',
                                        paddingLeft: GLOBAL.Device_IsPhone
                                            ? 10
                                            : 0,
                                        width: this.props.Width - 150,
                                    },
                                ]}
                            >
                                {PlaceHolder}
                            </Text>
                        </View>,
                    )}
                    <View
                        style={{
                            justifyContent: 'center',
                            alignContent: 'center',
                        }}
                    >
                        {RenderIf(
                            GLOBAL.Device_IsWebTV && !GLOBAL.Device_IsSmartTV,
                        )(
                            <TextInput
                                style={[styles.H3, { color: '#fff', width: 120 }]}
                                value={this.state.inputText}
                                autoFocus={true}
                                onChangeText={text => this.addToInput(text)}
                            ></TextInput>,
                        )}
                        {RenderIf(
                            GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet,
                        )(
                            <TextInput
                                style={[
                                    GLOBAL.Device_IsPhone
                                        ? styles.H4
                                        : styles.H3,
                                    {
                                        padding: 10,
                                        borderWidth: 2,
                                        color: '#fff',
                                        width:
                                            this.props.Width -
                                            this.props.Margin -
                                            (GLOBAL.Device_IsPhone ? 150 : 125),
                                    },
                                ]}
                                value={this.state.inputText}
                                underlineColorAndroid={'transparent'}
                                autoFocus={true}
                                inputContainerStyle={{ borderBottomWidth: 0 }}
                                onChangeText={text => this.addToInput(text)}
                            ></TextInput>,
                        )}
                        {RenderIf(
                            GLOBAL.Device_IsFireTV ||
                            GLOBAL.Device_IsAndroidTV ||
                            GLOBAL.Device_IsSmartTV ||
                            GLOBAL.Device_IsSTB ||
                            GLOBAL.Device_IsAppleTV,
                        )(
                            <Text
                                style={[
                                    this.props.SearchInput != undefined
                                        ? styles.H2
                                        : GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? styles.H4
                                            : styles.H3,
                                    { color: '#fff' },
                                ]}
                            >
                                {SecureInput != undefined
                                    ? this.getSecureInput()
                                    : this.state.inputText}
                            </Text>,
                        )}
                    </View>
                </View>
                {RenderIf(this.state.speechResults.length > 0)(
                    <View
                        style={{
                            height:
                                GLOBAL.Device_Manufacturer == 'Samsung Tizen' ||
                                    GLOBAL.Device_IsWebTV
                                    ? 65
                                    : 45,
                            marginBottom: 5,
                            marginTop: -5,
                            marginLeft: this.props.Margin,
                            alignSelf: 'flex-start',
                        }}
                    >
                        <FlatList
                            ref={ref => (this.flatList = ref)}
                            data={this.state.speechResults}
                            extraData={this.state}
                            horizontal={true}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <ButtonAutoSize
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={item}
                                    onPress={() => this.addToSearchSpeech(item)}
                                ></ButtonAutoSize>
                            )}
                        />
                    </View>,
                )}
                {RenderIf(
                    (!GLOBAL.Device_IsWebTV || GLOBAL.Device_IsSmartTV) &&
                    !GLOBAL.Device_IsPhone &&
                    !GLOBAL.Device_IsTablet &&
                    NumericOnly == undefined &&
                    NumbersOnly == undefined &&
                    PlayerSearch == undefined,
                )(
                    <View
                        style={{
                            flexDirection: 'column',
                            marginHorizontal: this.props.Margin,
                            width: this.props.Width - this.props.Margin,
                        }}
                    >
                        <FlatList
                            {...this.props}
                            ref={ref => (this.flatList = ref)}
                            data={this.state.alphabet}
                            extraData={this.state.alphabet}
                            numColumns={this.getKeyColumns()}
                            horizontal={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <ButtonRounded
                                    Caps={this.state.caps}
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 24
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={item}
                                    onPress={() => this.addToSearch(item)}
                                ></ButtonRounded>
                            )}
                        />
                        <View style={{ flexDirection: 'row' }}>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'1'}
                                onPress={() => this.addToSearch('1')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'2'}
                                onPress={() => this.addToSearch('2')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'3'}
                                onPress={() => this.addToSearch('3')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'4'}
                                onPress={() => this.addToSearch('4')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'5'}
                                onPress={() => this.addToSearch('5')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'6'}
                                onPress={() => this.addToSearch('6')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'7'}
                                onPress={() => this.addToSearch('7')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'8'}
                                onPress={() => this.addToSearch('8')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'9'}
                                onPress={() => this.addToSearch('9')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'0'}
                                onPress={() => this.addToSearch('0')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'@'}
                                onPress={() => this.addToSearch('@')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'.'}
                                onPress={() => this.addToSearch('.')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'-'}
                                onPress={() => this.addToSearch('-')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                Wide={true}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'ABC'}
                                onPress={() => this.toCaps()}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                Wide={true}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={LANG.getTranslation('SPACE')}
                                onPress={() => this.addToSearch(' ')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                Wide={true}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={LANG.getTranslation('DELETE')}
                                onPress={() => this.removeFromSearch()}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                Wide={true}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={LANG.getTranslation('CLEAR')}
                                onPress={() => this.clearAll()}
                            ></ButtonRounded>
                            {RenderIf(this.props.LiveReload == undefined)(
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={LANG.getTranslation('SUBMIT')}
                                    onPress={() => this.submitSearch()}
                                ></ButtonRounded>,
                            )}
                        </View>
                        {RenderIf(ShowChars != undefined)(
                            <View style={{ flexDirection: 'row' }}>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'!'}
                                    onPress={() => this.addToSearch('!')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'#'}
                                    onPress={() => this.addToSearch('#')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'$'}
                                    onPress={() => this.addToSearch('$')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'%'}
                                    onPress={() => this.addToSearch('%')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'^'}
                                    onPress={() => this.addToSearch('^')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'&'}
                                    onPress={() => this.addToSearch('&')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'*'}
                                    onPress={() => this.addToSearch('*')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'('}
                                    onPress={() => this.addToSearch('(')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={')'}
                                    onPress={() => this.addToSearch(')')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'_'}
                                    onPress={() => this.addToSearch('_')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'+'}
                                    onPress={() => this.addToSearch('+')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'='}
                                    onPress={() => this.addToSearch('=')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'['}
                                    onPress={() => this.addToSearch('[')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={']'}
                                    onPress={() => this.addToSearch(']')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'{'}
                                    onPress={() => this.addToSearch('{')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'}'}
                                    onPress={() => this.addToSearch('}')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={':'}
                                    onPress={() => this.addToSearch(':')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={';'}
                                    onPress={() => this.addToSearch(';')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'"'}
                                    onPress={() => this.addToSearch('"')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'<'}
                                    onPress={() => this.addToSearch('<')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'>'}
                                    onPress={() => this.addToSearch('>')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'?'}
                                    onPress={() => this.addToSearch('?')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'/'}
                                    onPress={() => this.addToSearch('/')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'|'}
                                    onPress={() => this.addToSearch('|')}
                                ></ButtonRounded>
                            </View>,
                        )}
                        {RenderIf(ShowDomains != undefined)(
                            <View style={{ flexDirection: 'row' }}>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'.com'}
                                    onPress={() => this.addToSearch('.com')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'@gmail.com'}
                                    onPress={() =>
                                        this.addToSearch('@gmail.com')
                                    }
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'@hotmail.com'}
                                    onPress={() =>
                                        this.addToSearch('@hotmail.com')
                                    }
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'@yahoo.com'}
                                    onPress={() =>
                                        this.addToSearch('@yahoo.com')
                                    }
                                ></ButtonRounded>
                            </View>,
                        )}
                        {RenderIf(ShowExtras != undefined)(
                            <View style={{ flexDirection: 'row' }}>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'http://'}
                                    onPress={() => this.addToSearch('http://')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'https://'}
                                    onPress={() => this.addToSearch('https://')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'.com'}
                                    onPress={() => this.addToSearch('.com')}
                                ></ButtonRounded>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={'.net'}
                                    onPress={() => this.addToSearch('.net')}
                                ></ButtonRounded>
                            </View>,
                        )}
                        {RenderIf(GLOBAL.Languages.length > 1)(
                            <View style={{ flexDirection: 'row' }}>
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={
                                        LANG.getTranslation('keyboard') +
                                        ': ' +
                                        this.state.alfaLanguage
                                    }
                                    onPress={() => this.changeLanguage()}
                                ></ButtonRounded>
                            </View>,
                        )}
                    </View>,
                )}
                {RenderIf(NumericOnly != undefined)(
                    <View
                        style={{
                            flexDirection: 'column',
                            marginHorizontal: this.props.Margin,
                            width: this.props.Width - this.props.Margin,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                            }}
                        >
                            <ButtonRounded
                                hasTVPreferredFocus={true}
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'1'}
                                onPress={() => this.addToSearch('1')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'2'}
                                onPress={() => this.addToSearch('2')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'3'}
                                onPress={() => this.addToSearch('3')}
                            ></ButtonRounded>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                            }}
                        >
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'4'}
                                onPress={() => this.addToSearch('4')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'5'}
                                onPress={() => this.addToSearch('5')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'6'}
                                onPress={() => this.addToSearch('6')}
                            ></ButtonRounded>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                            }}
                        >
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'7'}
                                onPress={() => this.addToSearch('7')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'8'}
                                onPress={() => this.addToSearch('8')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'9'}
                                onPress={() => this.addToSearch('9')}
                            ></ButtonRounded>
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                            }}
                        >
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Icon={"trash"}
                                onPress={() => this.clearAll()}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'0'}
                                onPress={() => this.addToSearch('0')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Icon={"backspace"}
                                onPress={() => this.removeFromSearch()}
                            ></ButtonRounded>
                        </View>
                    </View>,
                )}
                {RenderIf(
                    (!GLOBAL.Device_IsWebTV || GLOBAL.Device_IsSmartTV) &&
                    !GLOBAL.Device_IsPhone &&
                    !GLOBAL.Device_IsTablet &&
                    NumbersOnly != undefined,
                )(
                    <View
                        style={{
                            flexDirection: 'column',
                            marginHorizontal: this.props.Margin,
                            width: this.props.Width - this.props.Margin,
                        }}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <ButtonRounded
                                hasTVPreferredFocus={true}
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'1'}
                                onPress={() => this.addToSearch('1')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'2'}
                                onPress={() => this.addToSearch('2')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'3'}
                                onPress={() => this.addToSearch('3')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'4'}
                                onPress={() => this.addToSearch('4')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'5'}
                                onPress={() => this.addToSearch('5')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'6'}
                                onPress={() => this.addToSearch('6')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'7'}
                                onPress={() => this.addToSearch('7')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'8'}
                                onPress={() => this.addToSearch('8')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'9'}
                                onPress={() => this.addToSearch('9')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={'0'}
                                onPress={() => this.addToSearch('0')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Icon={"trash"}
                                onPress={() => this.clearAll()}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Icon={"backspace"}
                                onPress={() => this.removeFromSearch()}
                            ></ButtonRounded>
                        </View>
                    </View>,
                )}
                {RenderIf(
                    (!GLOBAL.Device_IsWebTV || GLOBAL.Device_IsSmartTV) &&
                    !GLOBAL.Device_IsPhone &&
                    !GLOBAL.Device_IsTablet &&
                    PlayerSearch != undefined,
                )(
                    <View>
                        <View
                            style={{
                                flexDirection: 'row',
                                width: this.props.Width - this.props.Margin,
                            }}
                        >
                            <FlatList
                                {...this.props}
                                ref={ref => (this.flatList = ref)}
                                data={this.state.alphabet}
                                numColumns={9}
                                horizontal={false}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <ButtonRounded
                                        hasTVPreferredFocus={
                                            index == 0 ? true : false
                                        }
                                        Size={this.state.keyWidth}
                                        FontSize={
                                            GLOBAL.Device_IsAndroidTV ||
                                                GLOBAL.Device_IsFireTV
                                                ? 16
                                                : GLOBAL.Device_IsAppleTV
                                                    ? 26
                                                    : 24
                                        }
                                        underlayColor={GLOBAL.Button_Color}
                                        Text={item}
                                        onPress={() => this.addToSearch(item)}
                                    ></ButtonRounded>
                                )}
                            />
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                width: this.props.Width - this.props.Margin,
                            }}
                        >
                            {RenderIf(GLOBAL.Languages.length > 1)(
                                <ButtonRounded
                                    Size={this.state.keyWidth}
                                    Wide={true}
                                    FontSize={
                                        GLOBAL.Device_IsAndroidTV ||
                                            GLOBAL.Device_IsFireTV
                                            ? 16
                                            : GLOBAL.Device_IsAppleTV
                                                ? 26
                                                : 22
                                    }
                                    underlayColor={GLOBAL.Button_Color}
                                    Text={
                                        LANG.getTranslation('keyboard') +
                                        ': ' +
                                        this.state.alfaLanguage
                                    }
                                    onPress={() => this.changeLanguage()}
                                ></ButtonRounded>,
                            )}
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                Wide={true}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={LANG.getTranslation('SPACE')}
                                onPress={() => this.addToSearch(' ')}
                            ></ButtonRounded>
                            <ButtonRounded
                                Size={this.state.keyWidth}
                                Wide={true}
                                FontSize={
                                    GLOBAL.Device_IsAndroidTV ||
                                        GLOBAL.Device_IsFireTV
                                        ? 16
                                        : GLOBAL.Device_IsAppleTV
                                            ? 26
                                            : 22
                                }
                                underlayColor={GLOBAL.Button_Color}
                                Text={LANG.getTranslation('DELETE')}
                                onPress={() => this.removeFromSearch()}
                            ></ButtonRounded>
                        </View>
                    </View>,
                )}
            </View>
        );
    }
}
export default Keyboard;
