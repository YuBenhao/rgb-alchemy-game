import React, { useState, useEffect, useCallback } from 'react';
import AlchemyComponent, { RGBComponent, INIT_RGB } from './AlchemyComponent';


export type Tuple<T, length extends number> = [T, ...T[]] & { length: length };
export type RGBType = Tuple<number, 3>;

export interface BasicInfo {
  userId: string;
  width: number;
  height: number;
  maxMoves: number;
  target: RGBType;
}

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

  const fetchData = useCallback(async (path = '') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}init${path}`);
      const data = await res.json();
      if (data.target.every((i: number) => i === 0)) {
        reFetchData();
        return;
      }
      setBasicInfo(data);
      setMaxMoves(data.maxMoves);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // initialized
    fetchData().then(() => setInitialized(true));
  }, [fetchData]);

  const reFetchData = useCallback(() => {
    // use settimeout for stopping window.confirm from blocking basic info display
    setTimeout(() => {
      const msg = `${maxMoves === 0 ? `Fails` : 'Wins'}: Do you wanna try again?`;
      const confirm = window.confirm(msg);
      if (confirm) {
        fetchData(`/user/${basicInfo.userId}`);
      }
    });
  }, [maxMoves, basicInfo.userId, fetchData]);


  // minus moves, if it reaches to zero, restart the game
  const handleChangeMoves = useCallback(() => {
    setMaxMoves(prev => prev - 1);
  }, []);

  useEffect(() => {
    if (initialized && maxMoves === 0) {
      reFetchData();
    }
  }, [maxMoves, reFetchData, initialized, diff]);

  // if diff < 10%, restart the game
  const handleSetDiff = useCallback(diff => {
    setDiff(diff);
    if (initialized && diff < 10) {
      reFetchData();
    }
  }, [reFetchData, initialized]);

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
        loading ?
          <div className='loading'>Loading...</div>
          : (
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

