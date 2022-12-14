import React, {PureComponent} from 'react';
import {View} from 'react-native';
import Album_List_Item from './Album_List_Item';

class Album_List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            scrolled: false,
        };
    }
    render() {
        const albums = this.props.Albums;
        const columns = this.props.Columns;

        return (
            <FlatList
                {...this.props}
                ref={ref => (this.flatList = ref)}
                data={albums}
                Width={this.props.Width}
                numColumns={columns}
                horizontal={this.props.horizontal != undefined ? true : false}
                removeClippedSubviews={true}
                keyExtractor={(item, index) => index.toString()}
                onScrollToIndexFailed={() => {}}
                renderItem={this.renderItem}
            />
        );
    }
    renderItem = ({item, index}) => (
        <View>
            <Album_List_Item
                Album={item}
                Index={index}
                Width={this.props.Width}
                onPress={this.props.onPress}
            />
        </View>
    );
}

export default Album_List;
