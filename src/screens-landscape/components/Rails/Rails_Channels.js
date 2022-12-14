import React, {PureComponent} from 'react';
import {View, Image, Text, VirtualizedList} from 'react-native';

class Rails extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const channels = this.props.Channels;
        const width = this.props.Width;
        const channel = this.props.Channel;
        const index = this.props.Index;
        const columns = this.props.Columns;
        const column_type = this.props.ColumnType;

        return (
            <VirtualizedList
                // {...this.props}
                //ref={ref => (this.flatList = ref)}
                data={channels}
                horizontal={true}
                //initialNumToRender={10}
                //keyExtractor={item => item.key}
                //removeClippedSubviews={true}
                //keyExtractor={item => item.key}

                //onScrollToIndexFailed={() => { }}
                //getItemLayout={(data, index) => { return { length: 100, index, offset: 100 * index } }}
                renderItem={this.renderItem}
                // onContentSizeChange={() => {
                //     if (channels != undefined && this.props.Type != "Favorite" && this.props.Type != "Home") {
                //         if (this.flatList.scrollToIndex && this.state.scrolled == false && channels.length > 0) {
                //             this.setState({
                //                 scrolled: true
                //             })
                //             this.flatList.scrollToIndex({ index: noscroll != undefined ? 0 : this.props.Type == 'TV' ? GLOBAL.Channels_Selected_Index : GLOBAL.Channels_Selected_Row, animated: false, viewPosition: 0 });
                //         }
                //     }
                // }}
            />
        );
    }
    renderItem = ({item, index}) => (
        <TouchableHighlightFocus
            {...this.props}
            onPress={() => this._startSelectedChannel(channel, index, 0, '')}
            hasTVPreferredFocus={
                GLOBAL.Channels_Selected_Index == index ? true : false
            }
            key={index}
            underlayColor={GLOBAL.Button_Color}
            isTVSelectable={true}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    paddingTop: 5,
                    paddingBottom: 5,
                    backgroundColor: '#111',
                }}
            >
                <Image
                    source={{uri: GLOBAL.ImageUrlCMS + item.icon_big}}
                    style={{height: 100, width: 100}}
                />
            </View>
        </TouchableHighlightFocus>
    );
}

export default Rails;
