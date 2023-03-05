import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import './index.css';
import { tranformToRGB } from '../utils';
import { Tuple, ElePropsType } from '../types';

// In this assignment, I try to not use any UI Library or React-DnD (React Drag and Drop Libray), even no CSS preprocessor.

// Just with pure React, CSS, HTML5 and apply some React supported synthetic events.
const RGBComponent: React.FC<ElePropsType> = ({ color, type, hidden, row, col, canClick, canDrag, handleClick, handleDrop, closetPos }) => {
  const [tooltip, setTooltip] = useState<boolean>(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const showTooltip = useCallback(() => {
    timer.current = setTimeout(() => setTooltip(true), 1000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  });

  const hiddenTooltip = useCallback(() => {
    if (timer?.current) {
      clearTimeout(timer.current);
    }
    setTooltip(false);
  }, [])

  const handleSourceClick = useCallback(() => {
    if (typeof row !== 'undefined' && typeof col !== 'undefined') {
      handleClick && handleClick(row, col);
    }
  }, [row, col, handleClick]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('rgb', `${color.join(',')}`);
  }, [color]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
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
  const tooltipClass = useMemo(() => `tooltip ${tooltip ? '' : 'hiddenTip'}`, [tooltip]);
  return (
    <div className='eleWrapper'>
      <span
        style={backgroundStyle}
        className={classNames}
        draggable={canDrag}
        onDragLeave={hiddenTooltip}
        onDragStart={canDrag ? handleDragStart : undefined}
        onDragOver={type === 'source' ? handleDragOver : undefined}
        onDrop={type === 'source' ? handleonDrop : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={hiddenTooltip}
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