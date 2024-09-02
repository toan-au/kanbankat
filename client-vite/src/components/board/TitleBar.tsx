import { RootState } from '@/state/store';
import { FaCog } from 'react-icons/fa'
import { useSelector } from 'react-redux';

function TitleBar() {
  const { activeBoard } = useSelector(
    (state: RootState) => state.boards
  );
  return (
    <>
      <div className="bg-catLightBlue text-white">
        <div className="container flex flex-wrap items-center justify-between mx-auto p-2">
          <h1 className="font-bold inline mr-2 text-lg">{activeBoard.name}</h1>
          {/* <FaCog className="inline" /> */}
        </div>
      </div>
    </>
  )
}

export default TitleBar