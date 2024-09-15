import { Label } from "../submenu/ColorPallete";
import LabelSettings from "./LabelSettings"

interface Board {
  labels: Label[]
}

interface Props {
  board: Board,
  drawer: string,
  display: boolean
}

function TopDrawer({ board, display, drawer }: Props) {
  return (
    <div className={`bg-white box-content transition-all duration-500 ease-out overflow-y-scroll ${display ? 'h-96 py-4' : 'h-0'}`}>
      <div className={`container transition-opacity duration-500 ease-out ${display ? 'opacity-100' : 'opacity-0'}`}>
        {drawer == "labelSettings" && <LabelSettings labels={board.labels}/>}
      </div>
    </div>
  )
}

export default TopDrawer;