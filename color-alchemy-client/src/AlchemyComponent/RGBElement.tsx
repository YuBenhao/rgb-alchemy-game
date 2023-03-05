
import React, { useState, useMemo, useCallback } from "react";
import './index.css';
import { tranformToRGB } from '../utils';
import { RGBType, Tuple } from '../App';
import { HandleDropType, HandleClickType } from './index';

type ElePropsType = {
  color: RGBType;
  type: string;
  hidden?: boolean;
  row?: number;
  col?: number;
  canClick?: boolean;
  canDrag?: boolean;
  closetPos?: Tuple<number, 2>;
  handleDrop?: HandleDropType;
  handleClick?: HandleClickType;
}

const RGBComponent: React.FC<ElePropsType> = ({ color, type, hidden, row, col, canClick, canDrag, handleClick, handleDrop, closetPos }) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const handleSourceClick = useCallback(() => {
    if (typeof row !== 'undefined' && typeof col !== 'undefined') {
      handleClick && handleClick(row, col);
    }
  }, [row, col, handleClick]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('rgb', `${color.join(',')}`);
  }, [color]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleonDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (typeof row !== 'undefined' && typeof col !== 'undefined') {
      // get rgb data
      const data = e.dataTransfer.getData('rgb').split(',');
      handleDrop && handleDrop(row, col, data.map(i => +i) as Tuple<number, 3>);
    }
  }, [row, col, handleDrop]);

  const toggleTooltip = useCallback(() => setShowTooltip(prev => !prev), []);
  // tile or source class names
  const typeClass = useMemo(() => type === 'tile' ? 'tile' : 'source', [type]);
  const hiddenClass = useMemo(() => hidden ? 'hidden' : '', [hidden]);
  const cursorClass = useMemo(() => canClick || canDrag ? 'cursor' : '', [canClick, canDrag]);

  const closetClass = useMemo(() => closetPos?.length &&
    closetPos[0] === row &&
    closetPos[1] === col ?
    'closet'
    : '', [row, col, closetPos]);
  const classNames = useMemo(() => `ele ${typeClass} ${hiddenClass} ${cursorClass} ${closetClass}`, [typeClass, hiddenClass, cursorClass, closetClass]);
  // tile or source background color
  const backgroundStyle = useMemo(() => ({ 'background': `${tranformToRGB(color)}` }), [color]);
  // tooltip class names
  const tooltipClass = useMemo(() => `tooltip ${showTooltip ? '' : 'hiddenTip'}`, [showTooltip]);
  return (
    <div className='eleWrapper'>
      <span
        style={backgroundStyle}
        className={classNames}
        draggable={canDrag}
        onDragStart={canDrag ? handleDragStart : undefined}
        onDragOver={type === 'source' ? handleDragEnter : undefined}
        onDrop={type === 'source' ? handleonDrop : undefined}
        onMouseEnter={toggleTooltip}
        onMouseLeave={toggleTooltip}
        onClick={canClick ? handleSourceClick : undefined}
      />
      <span className={tooltipClass}>
        {`${color.join(',')}`}
      </span>
    </div>
  );
};

export {
  RGBComponent
}