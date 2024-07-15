import React from 'react';
import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style, data }) => (
  <div style={style}>
    ID: {data[index].Digital_ID}, Email: {data[index].Email}, Категория: {data[index].draw_category}
  </div>
);

function WinnersList({ winners }) {
  const listHeight = 400;
  const rowHeight = 50;

  return (
    <div className="winners-list">
      <h2>Победители:</h2>
      {winners.length > 0 ? (
        <List
          height={listHeight}
          itemCount={winners.length}
          itemSize={rowHeight}
          width="100%"
          itemData={winners}
        >
          {Row}
        </List>
      ) : (
        <p>Победители пока не определены.</p>
      )}
    </div>
  );
}

export default WinnersList;