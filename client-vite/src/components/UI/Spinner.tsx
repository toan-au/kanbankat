import catGif from "../../assets/images/loading-cat.gif";

function Spinner() {
  return (
    <div className="flex flex-col px-8 py-4 w-60 h-34 bg-white rounded-md">
      <img src={catGif} alt="Now loading..." />
      <p className="text-xl">Neow loading...</p>
    </div>
  );
}

export default Spinner;
