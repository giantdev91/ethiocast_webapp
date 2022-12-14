import React, { Component } from 'react';
import {
    Dimensions,
    BackHandler,
    TVMenuControl,
    Text,
    View,
    Image,
    ImageBackground,
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import ProgressBarAnimated from 'react-native-progress-bar-animated';

import Video from 'react-native-video/dom/Video';
// import {RegularIcons, SolidIcons} from 'react-native-FontAwesome5';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { sendPageReport } from '../../reporting/reporting';
export default class Music_Details extends Component {
    constructor(props) {
        super(props);
        const themeStyle = STYLE.getStyle();
        styles = { ...themeStyle, ...baseStyle };

        GLOBAL.Selected_AlbumIndex = this.props.AlbumIndex;
        var album = GLOBAL.Albums[GLOBAL.Selected_AlbumIndex];
        this.state = {
            reportStartTime: moment().unix(),
            progress: 0,
            error: null,
            paused: false,
            currentIndex: 0,
            artist: album.artist,
            name: album.name,
            desc: album.description,
            songs: album.songs,
            cover: album.poster,
            album: album,
            current_time_human: '0:00:00',
            total_time_human: '0:00:00',
            index_: '',
            playing: false,
            seek: 0,
            stream: GLOBAL.HTTPvsHTTPS,
            //uri:GLOBAL.HTTPvsHTTPS,
            type: 'audio/mp3',
            duration: 0,
            current_time: 0,
            player: "pause",
        };
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
            Actions.Music_Albums();
        }
    };
    updateDimensions() {
        Actions.Music_Details({ AlbumIndex: GLOBAL.Selected_AlbumIndex });
    }
    componentDidMount() {
        if (GLOBAL.Device_IsWebTV) {
            startMouseEvents();
            document.getElementById('grouped').style.position = 'absolute';
            window.addEventListener('resize', this.updateDimensions);
            document.addEventListener('keydown', this.backButton, false);
        }
        if (!GLOBAL.Device_IsWebTV) {
            this.player = null;
        }
        REPORT.set({
            type: 16,
            name: this.state.album.name,
            id: this.state.album.id,
        });
        if (GLOBAL.Device_IsAppleTV) {
            // TVMenuControl.enableTVMenuKey();
        }
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                Actions.Music_Albums();
                return true;
            },
        );
    }
    componentWillUnmount() {
        sendPageReport(
            'Albums Details',
            this.state.reportStartTime,
            moment().unix(),
        );
        this.backHandler.remove();
        if (GLOBAL.Device_IsAppleTV == true) {
            // TVMenuControl.disableTVMenuKey();
        }
        if (GLOBAL.Device_IsWebTV) {
            window.removeEventListener('resize', this.updateDimensions, false);
            document.removeEventListener('keydown', this.backButton, false);
        }
        if (GLOBAL.Device_IsTV && GLOBAL.Device_IsAppleTV == false) {
            KeyEvent.removeKeyDownListener();
        }
        Actions.pop();
    }
    onProgress = data => {
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        var percentageVideo =
            (this.state.current_time / this.state.duration) * 100;
        var position = data.currentTime;
        // this.setState({
        //   current_time: position,
        //   progress: percentageVideo,
        //   current_time_human: moment("2015-01-01").startOf('day').seconds(position).format('H:mm:ss')
        // })
    };
    onLoad = data => {
        if (GLOBAL.Device_IsWebTV) {
            data = data.target;
        }
        this.setState({
            duration: data.duration,
            current_time: data.currentTime,
            total_time_human: moment('2015-01-01')
                .startOf('day')
                .seconds(data.duration)
                .format('H:mm:ss'),
        });
    };
    _onPlayerForward() {
        this.setSeek(60);
    }
    _onPlayerNext() {
        var newIdx = this.state.currentIndex + 1;
        if (newIdx < this.state.album.songs.length) {
            this.setState({
                currentIndex: newIdx,
                songs: this.state.songs,
                playing: true,
            });
            var url = this.state.album.songs[newIdx].url;
            var type = '';
            if (url.indexOf('.mpd') > 0) {
                type = 'mpd';
            }
            if (url.indexOf('.m3u8') > 0) {
                type = 'm3u8';
            }
            if (url.indexOf('.mp3') > 0) {
                type = 'audio/mp3';
            }
            this.setState({
                stream: url,
                //uri:this.state.album.songs[newIdx].url.toString().replace(' ',''),
                type: type,
                paused: false,
            });
        }
    }
    _onPlayerPausePlay() {
        if (this.state.paused == false) {
            this.setState({
                player: "play-circle",
                paused: true,
            });
            if (GLOBAL.Device_IsWebTV) {
                video.pause();
            }
        } else {
            this.setState({
                player: "pause",
                paused: false,
            });
            if (GLOBAL.Device_IsWebTV) {
                video.play();
            }
        }
    }
    _onPlayerPrevious() {
        var newIdx = this.state.currentIndex - 1;
        if (newIdx >= 0) {
            this.setState({
                currentIndex: newIdx,
                songs: this.state.songs,
                playing: true,
            });
            var url = this.state.album.songs[newIdx].url;
            var type = '';
            if (url.indexOf('.mpd') > 0) {
                type = 'mpd';
            }
            if (url.indexOf('.m3u8') > 0) {
                type = 'm3u8';
            }
            if (url.indexOf('.mp3') > 0) {
                type = 'audio/mp3';
            }

            this.setState({
                stream: url,
                //uri:this.state.album.songs[newIdx].url.toString().replace(' ',''),
                type: type,
                paused: false,
            });
        }
    }
    _onPlayerRewind() {
        if (this.state.seek > 0) {
            this.setSeek(-60);
        }
    }
    setSeek = time => {
        var seek_ = 0;
        if (this.state.seek_time > 0) {
            seek_ = this.state.seek_time + time;
        } else {
            seek_ = this.state.current_time + time;
        }
        if (seek_ < this.state.duration && seek_ > 0) {
            var percentageVideo = (seek_ / this.state.duration) * 100;
            this.setState({
                seek: seek_,
                progress: percentageVideo,
            });
            if (GLOBAL.Device_IsWebTV) {
                player.currentTime(seek_);
            }
        }
    };
    _onPressStartSong(newIdx) {
        this.setState({
            currentIndex: newIdx,
            songs: this.state.songs,
            playing: true,
        });
        var url = this.state.album.songs[newIdx].url;
        var type = '';
        if (url.indexOf('.mpd') > 0) {
            type = 'mpd';
        }
        if (url.indexOf('.m3u8') > 0) {
            type = 'm3u8';
        }
        if (url.indexOf('.mp3') > 0) {
            type = 'audio/mp3';
        }
        this.setState({
            stream: url,
            type: type,
            paused: false,
        });
    }
    onEnd() {
        //this._onPlayerNext();
    }

    getStatus(index) {
        if (this.state.currentIndex == index && this.state.playing == true) {
            return (
                <FontAwesome5
                    style={{ fontSize: 20, color: '#fff', paddingRight: 5 }}
                    // icon={RegularIcons.playCircle}
                    name="play-circle"
                />
            );
        } else {
            return null;
        }
    }
    render() {
        const barWidth = Dimensions.get('screen').width - 10;
        const buttonWidth = Dimensions.get('screen').width / 3;

        return (
            <Container
                hide_header={
                    GLOBAL.Device_IsPhone || GLOBAL.Device_IsTablet
                        ? true
                        : false
                }
            >
                <ImageBackground
                    blurRadius={80}
                    source={{
                        uri:
                            this.state.cover == '001.png'
                                ? GLOBAL.Background
                                : GLOBAL.ImageUrlCMS + this.state.cover,
                    }}
                    style={{ flex: 1, width: null, height: null }}
                    imageStyle={{ resizeMode: 'cover' }}
                >
                    <View
                        style={{
                            flex: 7,
                            flexDirection: 'row',
                            marginTop: GLOBAL.Device_IsTablet ? 10 : 5,
                            marginLeft: 5,
                            marginRight: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.60)',
                            borderRadius: 5,
                        }}
                    >
                        <View
                            style={{
                                flex: 4,
                                flexDirection: 'column',
                                margin: 5,
                            }}
                        >
                            <Image
                                source={{
                                    uri: GLOBAL.ImageUrlCMS + this.state.cover,
                                }}
                                style={[
                                    styles.view_albums_img_big,
                                    { borderRadius: 3 },
                                ]}
                            />

                            <Text
                                style={[
                                    styles.H2,
                                    styles.Bold,
                                    {
                                        marginLeft: 5,
                                        marginBottom: 10,
                                        marginTop: 5,
                                    },
                                ]}
                            >
                                {this.state.artist}
                            </Text>
                            <Text style={[styles.H5, { marginLeft: 5 }]}>
                                {this.state.name}
                            </Text>
                            <Text
                                numberOfLines={2}
                                style={[styles.Standard, { marginLeft: 5 }]}
                            >
                                {this.state.desc}
                            </Text>
                        </View>
                        <View
                            style={{
                                flex: 6,
                                flexDirection: 'column',
                                backgroundColor: 'rgba(0, 0, 0, 0.60)',
                                padding: 10,
                                margin: 10,
                                borderRadius: 5,
                            }}
                        >
                            <FlatList
                                ref={ref => {
                                    this.songs = ref;
                                }}
                                data={this.state.songs}
                                horizontal={false}
                                //    extraData={this.state}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <TouchableHighlightFocus
                                        BorderRadius={5}
                                        style={{ marginHorizontal: 10 }}
                                        key={index}
                                        hasTVPreferredFocus={item.is_default}
                                        underlayColor={GLOBAL.Button_Color}
                                        onPress={() =>
                                            this._onPressStartSong(index)
                                        }
                                    >
                                        <View
                                            style={{
                                                margin: 3,
                                                flex: 1,
                                                flexDirection: 'row',
                                                margin: 10,
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 9,
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Text style={styles.Standard}>
                                                    {index + 1}. {item.name}
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    flexDirection: 'column',
                                                    alignItems: 'flex-end',
                                                }}
                                            >
                                                {this.getStatus(index)}
                                            </View>
                                        </View>
                                    </TouchableHighlightFocus>
                                )}
                            />
                        </View>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            backgroundColor: 'rgba(0, 0, 0, 0.60)',
                            margin: 5,
                            borderRadius: 5,
                        }}
                    >
                        {RenderIf(GLOBAL.Device_IsWebTV == false)(
                            <ProgressBarAnimated
                                width={barWidth}
                                borderRadius={0}
                                height={4}
                                radius={100}
                                backgroundColor={GLOBAL.Button_Color}
                                borderColor={'transparent'}
                                borderWidth={0}
                                value={this.state.progress}
                            />,
                        )}
                        <View
                            style={{
                                flex: 2,
                                flexDirection: 'column',
                                width: '100%',
                                position: 'absolute',
                                marginTop: 5,
                            }}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    alignItems: 'flex-start',
                                    alignContent: 'flex-start',
                                    position: 'absolute',
                                    left: 20,
                                }}
                            >
                                <Text style={{ flex: 1, color: '#fff' }}></Text>
                            </View>
                            {/* {RenderIf(GLOBAL.Device_IsSmallScreen == false && GLOBAL.Device_IsWebTV == false)(
                <View style={{ flex: 1, alignItems: 'flex-end', alignContent: 'flex-end', position: 'absolute', right: 20 }}>
                  <Text style={styles.Small}>0{this.state.current_time_human} / 0{this.state.total_time_human}</Text>
                </View>
              )} */}
                        </View>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignContent: 'center',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{
                                        height: GLOBAL.Device_IsAppleTV
                                            ? 50
                                            : 40,
                                    }}
                                    disableFocus={this.state.catchup_bar}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this._onPlayerPrevious()}
                                >
                                    <View style={{ paddingHorizontal: 10 }}>
                                        <FontAwesome5
                                            style={styles.IconsMenu}
                                            // icon={SolidIcons.stepBackward}
                                            name="step-backward"
                                        />
                                    </View>
                                </TouchableHighlightFocus>

                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{
                                        height: GLOBAL.Device_IsAppleTV
                                            ? 50
                                            : 40,
                                    }}
                                    autofocus={true}
                                    hasTVPreferredFocus={GLOBAL.Device_IsTV}
                                    disableFocus={this.state.catchup_bar}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this._onPlayerPausePlay()}
                                >
                                    <View style={{ paddingHorizontal: 10 }}>
                                        <FontAwesome5
                                            style={styles.IconsMenu}
                                            // icon={this.state.player}
                                            name={this.state.player}
                                        />
                                    </View>
                                </TouchableHighlightFocus>
                                <TouchableHighlightFocus
                                    BorderRadius={5}
                                    style={{
                                        height: GLOBAL.Device_IsAppleTV
                                            ? 50
                                            : 40,
                                    }}
                                    disableFocus={this.state.catchup_bar}
                                    underlayColor={GLOBAL.Button_Color}
                                    onPress={() => this._onPlayerNext()}
                                >
                                    <View style={{ paddingHorizontal: 10 }}>
                                        <FontAwesome5
                                            style={styles.IconsMenu}
                                            // icon={SolidIcons.stepForward}
                                            name="step-forward"
                                        />
                                    </View>
                                </TouchableHighlightFocus>
                            </View>
                        </View>
                    </View>
                    <Video
                        ref={ref => {
                            this.player = ref;
                        }}
                        source={{
                            uri: this.state.stream,
                            type: this.state.type,
                            ref: 'player',
                            full: false,
                            headers: {
                                'User-Agent': GLOBAL.User_Agent,
                            },
                            drm: {
                                type:
                                    this.state.drmKey == ''
                                        ? null
                                        : GLOBAL.Device_System == 'Apple'
                                            ? DRMType.FAIRPLAY
                                            : DRMType.WIDEVINE,
                                licenseServer: '',
                                headers: {
                                    customData: '',
                                },
                            },
                        }}
                        streamType={'MUSIC'}
                        style={styles.fullScreenMusic}
                        paused={this.state.paused}
                        onLoad={this.onLoad}
                        onProgress={this.onProgress}
                        onEnd={this.onEnd}
                        disableFocus={true}
                        repeat={false}
                    />
                </ImageBackground>
            </Container>
        );
    }
}
