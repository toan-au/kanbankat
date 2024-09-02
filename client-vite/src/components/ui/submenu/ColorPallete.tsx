import { FaTags } from "react-icons/fa6";

interface Label {
  _id: string;
  text: string;
  hexColour: string;
  boardId: string;
}

interface Props { 
  labels: Label[]
}

function ColorPallete({ labels }: Props) {
  return (
    <div className="px-3 py-1 bg-catLightBlue">
      <div className="flex text-white text-lg">
        <span className="inline text-xs mr-2 self-center">
          <FaTags />
        </span>
        Tag
      </div>
      <ul className="flex flex-col gap-2 mt-1 w-48">
        {labels.map((label) => (
          <li className="flex" key={label._id}>
            <input type="checkbox" className="p-3 mr-2 scale-150" />
            <div
              className="flex-1 px-2 py-1 rounded-lg text-sm"
              style={{ background: label.hexColour }}
            >
              {label.text}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ColorPallete;
