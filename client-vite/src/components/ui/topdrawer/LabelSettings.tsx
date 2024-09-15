import { FaPlus } from "react-icons/fa6"
import { Button } from "../button"
import { Label } from "../submenu/ColorPallete"

function LabelSettings(props: { labels: Label[] }) {
  return (
    <>
      <h3 className="mb-2">Labels</h3>
      <ul className="flex gap-2 flex-wrap mb-4">
        {props.labels.map(label => <li key={label._id} className="px-2 py-2 min-w-64" style={{backgroundColor: label.hexColour}}>{label.text}</li>)}
      </ul>
      <Button className="bg-catLightBlue"><FaPlus className="inline-block mr-1"/>Add a label</Button>
    </>
  )
}

export default LabelSettings;