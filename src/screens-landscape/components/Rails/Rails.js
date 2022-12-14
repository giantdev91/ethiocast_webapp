import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';
import Rails_Channels from './Rails_Channels';

class Rails extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const categories = this.props.Categories;

        return (
            <FlatList
                {...this.props}
                ref={ref => (this.flatList = ref)}
                data={categories}
                numColumns={1}
                horizontal={false}
                keyExtractor={item => item.key}
                removeClippedSubviews={true}
                //getItemLayout={(data, index) => { return { length: 100, index, offset: 100 * index } }}
                // keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {}}
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
        <View>
            <Text style={[styles.H2, {paddingTop: 30, paddingBottom: 20}]}>
                {item.name}
            </Text>
            <Rails_Channels Channels={item.channels} />
        </View>
    );
}

export default Rails;
