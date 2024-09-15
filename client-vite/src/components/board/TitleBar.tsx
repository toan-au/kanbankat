import { AppDispatch, RootState } from '@/state/store';
import { FaTag } from 'react-icons/fa'
import { useSelector } from 'react-redux';
import { hideTopDrawer, showTopDrawer } from '@/state/ui/ui';
import { useDispatch } from 'react-redux';
import TopDrawer from '../ui/topdrawer/TopDrawer';

function TitleBar() {
  const dispatch = useDispatch<AppDispatch>();
  const { activeBoard } = useSelector(
    (state: RootState) => state.boards
  );
  const { topDrawer } = useSelector(
    (state: RootState) => state.ui
  );

  function toggleLabelSettings() {
    topDrawer ? dispatch(hideTopDrawer()) : dispatch(showTopDrawer());
  }

  return (
    <>
      <div className="bg-catLightBlue text-white">
        <div className="container flex flex-wrap items-center justify-between mx-auto">
          <h1 className="font-bold inline mr-2 text-lg">{activeBoard.name}</h1>
          <button onClick={toggleLabelSettings}>
            <FaTag className="inline" />
          </button>
        </div>
        
      </div>
      <TopDrawer display={topDrawer} drawer={"labelSettings"} board={activeBoard}/>
    </>
  )
}

export default TitleBar