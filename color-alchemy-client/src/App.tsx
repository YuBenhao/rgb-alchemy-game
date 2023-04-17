import React, { useState, useEffect, useCallback, useRef } from 'react';

import AlchemyComponent, { RGBComponent, INIT_RGB } from './AlchemyComponent';

import { BasicInfo, RGBType } from './types';

const BASE_URL = 'http://localhost:9876/';
const App: React.FC = () => {
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    userId: '',
    width: 0,
    height: 0,
    maxMoves: 0,
    target: [0, 0, 0]
  });
  // Δ diff value
  const [diff, setDiff] = useState<number>(0);
  const [maxMoves, setMaxMoves] = useState<number>(0);
  // state for whether initialized or not
  const [initialized, setInitialized] = useState<boolean>(false);
  // loading state
  const [loading, setLoading] = useState<boolean>(false);
  // closet color
  const [closetColor, setClosetColor] = useState<RGBType | undefined>();

  const searchRef = useRef<any>();
  const reRef = useRef<any>();

  searchRef.current = async (path = '') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}init${path}`);
      const data = await res.json();
      if (data.target.every((i: number) => i === 0)) {
        reRef.current();
        return;
      }
      setBasicInfo(data);
      setMaxMoves(data.maxMoves);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initialized
    searchRef.current().then(() => setInitialized(true));
  }, []);

  reRef.current = useCallback(() => {
    // use settimeout for stopping window.confirm from blocking basic info display
    setTimeout(() => {
      const msg = `${maxMoves === 0 ? `Fails` : 'Wins'}: Do you wanna try again?`;
      const confirm = window.confirm(msg);
      if (confirm) {
        searchRef.current(`/user/${basicInfo.userId}`);
      }
    });
  }, [maxMoves, basicInfo.userId]);


  // minus moves, if it reaches to zero, restart the game
  const handleChangeMoves = useCallback(() => {
    setMaxMoves(prev => prev - 1);
  }, []);

  useEffect(() => {
    if (initialized && maxMoves === 0) {
      reRef.current();
    }
  }, [maxMoves, initialized, diff]);

  // if diff < 10%, restart the game
  const handleSetDiff = useCallback(diff => {
    setDiff(diff);
    if (initialized && diff < 10) {
      reRef.current();
    }
  }, [initialized]);

  return (
    <div className='container'>
      <h2>RGB Alchemy</h2>
      <div className='basicInfo'>
        <div><span>User ID:</span>{basicInfo.userId}</div>
        <div><span>Moves left:</span>{maxMoves}</div>
        <div><span>Target color</span><RGBComponent color={basicInfo.target} type='tile' /></div>
        <div>
          <span>Cloest color</span>
          <RGBComponent color={closetColor || INIT_RGB} type='tile' />
          <span className='diff'>Δ={diff}%</span>
        </div>
      </div>
      {
        loading ? null :
          (
            <AlchemyComponent
              basicInfo={basicInfo}
              handleSetDiff={handleSetDiff}
              handleChangeMoves={handleChangeMoves}
              setClosetColor={setClosetColor}
            />
          )
      }
    </div>
  );
}

export default App;

